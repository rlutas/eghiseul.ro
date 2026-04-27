import { describe, expect, it } from 'vitest';
import {
  isRomanianHoliday,
  isBusinessDay,
  addBusinessDays,
  getProcessingStartISO,
  calculateEstimatedCompletion,
  ROMANIAN_HOLIDAYS_2026_2028,
} from '@/lib/delivery-calculator';

// All dates in tests use Europe/Bucharest local calendar. The library is
// timezone-aware: it parses Date instances by their RO local YYYY-MM-DD,
// so passing `new Date('2026-05-15T09:00:00+03:00')` is the canonical pattern.

describe('isRomanianHoliday', () => {
  it('returns true for confirmed 2026 holidays', () => {
    expect(isRomanianHoliday('2026-01-01')).toBe(true); // Anul Nou
    expect(isRomanianHoliday('2026-04-13')).toBe(true); // Lunea Paștilor (Easter Monday)
    expect(isRomanianHoliday('2026-05-01')).toBe(true); // Ziua Muncii
    expect(isRomanianHoliday('2026-12-01')).toBe(true); // Ziua Națională
    expect(isRomanianHoliday('2026-12-25')).toBe(true); // Crăciun
  });

  it('returns true for 2027 + 2028 holidays (forward planning)', () => {
    expect(isRomanianHoliday('2027-04-30')).toBe(true); // Vinerea Mare
    expect(isRomanianHoliday('2027-05-03')).toBe(true); // Lunea Paștilor 2027
    expect(isRomanianHoliday('2028-04-17')).toBe(true); // Lunea Paștilor 2028
  });

  it('returns false for ordinary weekdays', () => {
    expect(isRomanianHoliday('2026-05-15')).toBe(false); // Friday May 15
    expect(isRomanianHoliday('2026-06-12')).toBe(false); // Friday Jun 12
  });

  it('accepts Date objects (not just ISO strings)', () => {
    // Crăciun 2026 = Friday Dec 25
    expect(isRomanianHoliday(new Date('2026-12-25T10:00:00+02:00'))).toBe(true);
    expect(isRomanianHoliday(new Date('2026-05-15T10:00:00+03:00'))).toBe(false);
  });

  it('exposes a non-empty frozen holiday list 2026-2028', () => {
    expect(ROMANIAN_HOLIDAYS_2026_2028.length).toBeGreaterThan(30);
    // Frozen so accidental mutation is caught
    expect(() => (ROMANIAN_HOLIDAYS_2026_2028 as string[]).push('2026-12-31')).toThrow();
  });
});

describe('isBusinessDay', () => {
  it('weekdays that are not holidays are business days', () => {
    expect(isBusinessDay(new Date('2026-05-15T10:00:00+03:00'))).toBe(true); // Fri
    expect(isBusinessDay(new Date('2026-05-12T10:00:00+03:00'))).toBe(true); // Tue
  });

  it('weekends are NOT business days', () => {
    expect(isBusinessDay(new Date('2026-05-16T10:00:00+03:00'))).toBe(false); // Sat
    expect(isBusinessDay(new Date('2026-05-17T10:00:00+03:00'))).toBe(false); // Sun
  });

  it('weekday holidays are NOT business days', () => {
    expect(isBusinessDay(new Date('2026-04-13T10:00:00+03:00'))).toBe(false); // Easter Mon
    expect(isBusinessDay(new Date('2026-12-25T10:00:00+02:00'))).toBe(false); // Christmas Fri
  });
});

describe('addBusinessDays', () => {
  it('returns same date when count <= 0', () => {
    const start = new Date('2026-05-15T00:00:00Z'); // Fri
    expect(addBusinessDays(start, 0).toISOString().slice(0, 10)).toBe('2026-05-15');
    expect(addBusinessDays(start, -3).toISOString().slice(0, 10)).toBe('2026-05-15');
  });

  it('adds business days within a normal week (Mon → +3 → Thu)', () => {
    const mon = new Date('2026-05-11T00:00:00Z');
    expect(addBusinessDays(mon, 3).toISOString().slice(0, 10)).toBe('2026-05-14');
  });

  it('skips a weekend (Thu + 2 → Mon)', () => {
    const thu = new Date('2026-05-14T00:00:00Z');
    expect(addBusinessDays(thu, 2).toISOString().slice(0, 10)).toBe('2026-05-18'); // Mon (skip Sat/Sun)
  });

  it('skips Easter Monday holiday (Fri Apr 10 + 1 → Tue Apr 14, NOT Mon Apr 13)', () => {
    // 2026-04-10 = Vinerea Mare (Fri, holiday) — but addBusinessDays adds DAYS, not skips start
    // Use Apr 09 (Thu) as start: Thu + 1 = Fri Apr 10 (Vinerea Mare = holiday) → Mon Apr 13 (Easter Mon = holiday) → Tue Apr 14
    const thu = new Date('2026-04-09T00:00:00Z');
    expect(addBusinessDays(thu, 1).toISOString().slice(0, 10)).toBe('2026-04-14');
  });

  it('jumps over the long Christmas weekend (Thu Dec 24 + 1 → Mon Dec 28)', () => {
    // Dec 25 (Fri, Crăciun) + Dec 26 (Sat, Crăciun) + Dec 27 (Sun) all skipped
    const thu = new Date('2026-12-24T00:00:00Z');
    expect(addBusinessDays(thu, 1).toISOString().slice(0, 10)).toBe('2026-12-28');
  });
});

describe('getProcessingStartISO — noon cutoff (Romania-local)', () => {
  it('order placed BEFORE 12:00 RO time on a business day starts SAME day', () => {
    // 09:00 Bucharest time = 06:00 UTC (or 07:00 with DST)
    const morning = new Date('2026-05-15T09:00:00+03:00'); // Fri 09:00 RO
    expect(getProcessingStartISO(morning)).toBe('2026-05-15');
  });

  it('order placed AT 12:00 RO time starts NEXT business day (cutoff inclusive)', () => {
    const noon = new Date('2026-05-15T12:00:00+03:00'); // Fri 12:00 RO
    expect(getProcessingStartISO(noon)).toBe('2026-05-18'); // Mon (skip weekend)
  });

  it('order placed AT 13:30 RO time starts NEXT business day', () => {
    const afternoon = new Date('2026-05-15T13:30:00+03:00'); // Fri 13:30 RO
    expect(getProcessingStartISO(afternoon)).toBe('2026-05-18');
  });

  it('weekend order starts NEXT business day regardless of hour', () => {
    const sat = new Date('2026-05-16T09:00:00+03:00'); // Sat 09:00 RO
    expect(getProcessingStartISO(sat)).toBe('2026-05-18'); // Mon
  });

  it('order on a holiday starts NEXT business day', () => {
    const easterMonMorning = new Date('2026-04-13T09:00:00+03:00'); // Lunea Paștilor 09:00
    expect(getProcessingStartISO(easterMonMorning)).toBe('2026-04-14'); // Tue
  });

  it('order Friday 11:00 RO with following weekend has correct math (today = Fri)', () => {
    const friMorning = new Date('2026-05-15T11:00:00+03:00');
    expect(getProcessingStartISO(friMorning)).toBe('2026-05-15');
  });
});

describe('calculateEstimatedCompletion — base service days', () => {
  it('uses baseDays for processing step (preferred over urgency)', () => {
    const order = new Date('2026-05-11T09:00:00+03:00'); // Mon 09:00 RO
    const result = calculateEstimatedCompletion({
      baseDays: 3,
      includeCourierLeg: false,
      orderDate: order,
    });

    expect(result.minDays).toBe(3);
    expect(result.maxDays).toBe(3);
    expect(result.startDate).toBe('2026-05-11');
    // Mon + 3 business days = Thu
    expect(result.minDate).toBe('2026-05-14');
    expect(result.maxDate).toBe('2026-05-14');
    expect(result.breakdown[0].step).toBe('Procesare');
  });

  it('falls back to urgency=standard when baseDays missing (3-5 days)', () => {
    const order = new Date('2026-05-11T09:00:00+03:00');
    const result = calculateEstimatedCompletion({
      urgency: 'standard',
      includeCourierLeg: false,
      orderDate: order,
    });

    expect(result.minDays).toBe(3);
    expect(result.maxDays).toBe(5);
    expect(result.breakdown[0].step).toBe('Procesare standard');
  });

  it('urgency=urgent gives 1-2 days', () => {
    const result = calculateEstimatedCompletion({
      urgency: 'urgent',
      includeCourierLeg: false,
      orderDate: new Date('2026-05-11T09:00:00+03:00'),
    });

    expect(result.minDays).toBe(1);
    expect(result.maxDays).toBe(2);
  });

  it('urgency=strain (cetățean străin) gives 7-15 days', () => {
    const result = calculateEstimatedCompletion({
      urgency: 'strain',
      includeCourierLeg: false,
      orderDate: new Date('2026-05-11T09:00:00+03:00'),
    });

    expect(result.minDays).toBe(7);
    expect(result.maxDays).toBe(15);
  });
});

describe('calculateEstimatedCompletion — option time impact', () => {
  it('positive deliveryDaysImpact adds a new step (e.g. Apostila)', () => {
    const result = calculateEstimatedCompletion({
      baseDays: 3,
      options: [{ name: 'Apostila Haga', deliveryDaysImpact: 5 }],
      includeCourierLeg: false,
      orderDate: new Date('2026-05-11T09:00:00+03:00'),
    });

    expect(result.minDays).toBe(8); // 3 + 5
    expect(result.breakdown).toHaveLength(2);
    expect(result.breakdown[1].step).toBe('Apostila Haga');
    expect(result.breakdown[1].minDays).toBe(5);
  });

  it('negative deliveryDaysImpact reduces the FIRST step (urgency option)', () => {
    const result = calculateEstimatedCompletion({
      baseDays: 5,
      options: [{ name: 'Urgență', deliveryDaysImpact: -3 }],
      includeCourierLeg: false,
      orderDate: new Date('2026-05-11T09:00:00+03:00'),
    });

    expect(result.minDays).toBe(2); // 5 - 3
    expect(result.breakdown).toHaveLength(1); // no new step added for negative
    expect(result.breakdown[0].minDays).toBe(2);
  });

  it('negative impact never drives processing below zero (clamps)', () => {
    const result = calculateEstimatedCompletion({
      baseDays: 1,
      options: [{ name: 'Reducere mare', deliveryDaysImpact: -10 }],
      includeCourierLeg: false,
      orderDate: new Date('2026-05-11T09:00:00+03:00'),
    });

    expect(result.minDays).toBe(0);
  });

  it('explicit minDays/maxDays on option override deliveryDaysImpact', () => {
    const result = calculateEstimatedCompletion({
      baseDays: 3,
      options: [{ name: 'Traducere', minDays: 2, maxDays: 4 }],
      includeCourierLeg: false,
      orderDate: new Date('2026-05-11T09:00:00+03:00'),
    });

    expect(result.minDays).toBe(5); // 3 + 2
    expect(result.maxDays).toBe(7); // 3 + 4
  });

  it('zero deliveryDaysImpact is a no-op (option present but no time effect)', () => {
    const result = calculateEstimatedCompletion({
      baseDays: 3,
      options: [{ name: 'Free', deliveryDaysImpact: 0 }],
      includeCourierLeg: false,
      orderDate: new Date('2026-05-11T09:00:00+03:00'),
    });

    expect(result.minDays).toBe(3);
    expect(result.breakdown).toHaveLength(1);
  });
});

describe('calculateEstimatedCompletion — courier leg', () => {
  it.each([
    ['fan',           1, 3, 'Fan Courier'],
    ['fancourier',    1, 3, 'Fan Courier'],
    ['fan_courier',   1, 3, 'Fan Courier'],
    ['sameday',       1, 1, 'Sameday'],
    ['easybox',       1, 1, 'Sameday'],
    ['dhl',           1, 3, 'DHL Express'],
    ['posta',         7, 15, 'Poșta Română'],
    ['posta_romana',  7, 15, 'Poșta Română'],
  ])('courier "%s" adds %i-%i days as step "%s"', (code, minDays, maxDays, step) => {
    const result = calculateEstimatedCompletion({
      baseDays: 0, // No processing step is added when baseDays=0 and no urgency
      courier: code,
      orderDate: new Date('2026-05-11T09:00:00+03:00'),
    });

    expect(result.breakdown.some((s) => s.step === step)).toBe(true);
    const courierStep = result.breakdown.find((s) => s.step === step)!;
    expect(courierStep.minDays).toBe(minDays);
    expect(courierStep.maxDays).toBe(maxDays);
  });

  it('unknown courier code is silently skipped (no exception, no step added)', () => {
    const result = calculateEstimatedCompletion({
      baseDays: 3,
      courier: 'random_xyz',
      orderDate: new Date('2026-05-11T09:00:00+03:00'),
    });

    expect(result.breakdown).toHaveLength(1); // just processing
  });

  it('null courier with includeCourierLeg=true is silently skipped', () => {
    const result = calculateEstimatedCompletion({
      baseDays: 3,
      courier: null,
      orderDate: new Date('2026-05-11T09:00:00+03:00'),
    });

    expect(result.breakdown).toHaveLength(1);
  });

  it('includeCourierLeg=false skips courier even when code provided', () => {
    const result = calculateEstimatedCompletion({
      baseDays: 3,
      courier: 'fan',
      includeCourierLeg: false,
      orderDate: new Date('2026-05-11T09:00:00+03:00'),
    });

    expect(result.breakdown).toHaveLength(1);
    expect(result.breakdown[0].step).toBe('Procesare');
  });
});

describe('calculateEstimatedCompletion — full integration scenarios', () => {
  it('typical PF cazier: 3 days + Sameday → Mon order finishes Fri', () => {
    const order = new Date('2026-05-11T09:00:00+03:00'); // Mon 09:00 RO
    const result = calculateEstimatedCompletion({
      baseDays: 3,
      courier: 'sameday',
      orderDate: order,
    });

    expect(result.minDays).toBe(4); // 3 + 1
    expect(result.maxDays).toBe(4);
    expect(result.startDate).toBe('2026-05-11');
    expect(result.minDate).toBe('2026-05-15'); // Fri
  });

  it('urgent + Fan Courier on Friday afternoon pushes to next week', () => {
    const order = new Date('2026-05-15T14:00:00+03:00'); // Fri 14:00 RO (after noon)
    const result = calculateEstimatedCompletion({
      urgency: 'urgent',
      courier: 'fan',
      orderDate: order,
    });

    expect(result.startDate).toBe('2026-05-18'); // Mon
    expect(result.minDays).toBe(2); // 1 + 1
    expect(result.maxDays).toBe(5); // 2 + 3
  });

  it('order placed during Easter long-weekend skips holidays correctly', () => {
    // Order Sat April 11, 2026 (weekend; Friday Apr 10 was Vinerea Mare, Mon Apr 13 is Easter Mon)
    const order = new Date('2026-04-11T10:00:00+03:00'); // Sat
    const result = calculateEstimatedCompletion({
      baseDays: 1,
      includeCourierLeg: false,
      orderDate: order,
    });

    // Saturday → next business day = Tue Apr 14 (skip Sun, Easter Mon)
    expect(result.startDate).toBe('2026-04-14');
    expect(result.minDate).toBe('2026-04-15'); // +1 business day
  });

  it('cetățean străin + posta worst case (15+15 = 30 business days projected)', () => {
    const order = new Date('2026-05-11T09:00:00+03:00');
    const result = calculateEstimatedCompletion({
      urgency: 'strain',
      courier: 'posta',
      orderDate: order,
    });

    expect(result.minDays).toBe(14); // 7 + 7
    expect(result.maxDays).toBe(30); // 15 + 15
  });
});
