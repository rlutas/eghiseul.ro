import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_VALIDITY_DAYS,
  CROSS_SELL_MAP,
  expiryDate,
  isInExpiryWindow,
  promisedCalendarDays,
  wasOnTime,
} from '@/lib/lifecycle/rules';

const d = (iso: string) => new Date(iso);

describe('expiry window', () => {
  it('cazier judiciar = 180 zile; extras CF / stare civilă nu expiră', () => {
    expect(DOCUMENT_VALIDITY_DAYS['cazier-judiciar-persoana-fizica']).toBe(180);
    expect(expiryDate(d('2026-01-01T00:00:00Z'), 'cazier-fiscal')?.toISOString()).toBe('2026-01-31T00:00:00.000Z');
    expect(expiryDate(d('2026-01-01T00:00:00Z'), 'extras-carte-funciara')).toBeNull();
    expect(expiryDate(d('2026-01-01T00:00:00Z'), 'certificat-nastere')).toBeNull();
  });

  it('fereastra: [expirare − 14 zile, expirare + 30 zile]', () => {
    const completed = d('2026-01-01T00:00:00Z'); // cazier-fiscal → expiră 31.01
    expect(isInExpiryWindow(completed, 'cazier-fiscal', d('2026-01-16T00:00:00Z'))).toBe(false); // −15
    expect(isInExpiryWindow(completed, 'cazier-fiscal', d('2026-01-17T00:00:00Z'))).toBe(true); // −14
    expect(isInExpiryWindow(completed, 'cazier-fiscal', d('2026-01-31T00:00:00Z'))).toBe(true); // ziua
    expect(isInExpiryWindow(completed, 'cazier-fiscal', d('2026-03-02T00:00:00Z'))).toBe(true); // +30
    expect(isInExpiryWindow(completed, 'cazier-fiscal', d('2026-03-03T00:00:00Z'))).toBe(false); // +31
  });
});

describe('promisedCalendarDays', () => {
  it('ia limita superioară și convertește zilele lucrătoare', () => {
    expect(promisedCalendarDays('3-5 zile lucrătoare')).toBe(8); // ceil(5*7/5)+1
    expect(promisedCalendarDays('15 zile lucrătoare')).toBe(22);
    expect(promisedCalendarDays('1-2 zile')).toBe(3);
    expect(promisedCalendarDays(null)).toBeNull();
    expect(promisedCalendarDays('imediat')).toBeNull();
  });
});

describe('wasOnTime', () => {
  const base = {
    paidAt: d('2026-03-01T10:00:00Z'),
    completedAt: d('2026-03-04T10:00:00Z'),
    estimatedCompletionDate: null as Date | null,
    estimatedDaysDisplay: '3-5 zile lucrătoare' as string | null,
    hadNegativeEvent: false,
  };

  it('incident (standby/reupload) → niciodată recenzie', () => {
    expect(wasOnTime({ ...base, hadNegativeEvent: true })).toBe(false);
  });

  it('cu termen estimat: comparat pe zile calendaristice, ora nu contează', () => {
    expect(wasOnTime({ ...base, estimatedCompletionDate: d('2026-03-04T00:00:00Z') })).toBe(true);
    expect(wasOnTime({ ...base, estimatedCompletionDate: d('2026-03-03T23:59:00Z') })).toBe(false);
  });

  it('fără termen estimat: cade pe promisiunea din pagina serviciului', () => {
    expect(wasOnTime(base)).toBe(true); // 3 zile ≤ 8
    expect(wasOnTime({ ...base, completedAt: d('2026-03-12T10:00:00Z') })).toBe(false); // 11 > 8
  });

  it('fără nicio referință de termen → false (nu cerem recenzie pe ghicite)', () => {
    expect(wasOnTime({ ...base, estimatedDaysDisplay: null })).toBe(false);
    expect(wasOnTime({ ...base, paidAt: null })).toBe(false);
  });
});

describe('CROSS_SELL_MAP', () => {
  it('nu recomandă niciodată ce a cumpărat deja (slug-ul cheie nu e în lista lui)', () => {
    for (const [slug, list] of Object.entries(CROSS_SELL_MAP)) {
      expect(list).not.toContain(slug);
      expect(list.length).toBeGreaterThan(0);
    }
  });
});
