import { describe, it, expect } from 'vitest';
import { vehicleRemindersDue, daysUntil } from '@/lib/vehicles/reminders';
import { toIsoDate, formatRoDateLoose } from '@/lib/format/romanian-date';
import { sameAddress, findSameAddress } from '@/lib/account/same-address';

const today = new Date('2026-09-18T09:00:00');
const base = {
  itp_expiry: null,
  insurance_expiry: null,
  rovinieta_expiry: null,
  itp_reminded_for: null,
  insurance_reminded_for: null,
  rovinieta_reminded_for: null,
};

describe('vehicleRemindersDue', () => {
  it('is due from 14 days before to 30 days after, once per expiry date', () => {
    expect(vehicleRemindersDue({ ...base, rovinieta_expiry: '2026-10-02' }, today).map((d) => d.kind)).toEqual(['rovinieta']);
    expect(vehicleRemindersDue({ ...base, rovinieta_expiry: '2026-10-03' }, today)).toEqual([]);
    expect(vehicleRemindersDue({ ...base, itp_expiry: '2026-08-19' }, today).map((d) => d.kind)).toEqual(['itp']);
    expect(vehicleRemindersDue({ ...base, itp_expiry: '2026-08-18' }, today)).toEqual([]);
    expect(vehicleRemindersDue({ ...base, insurance_expiry: '2026-09-20', insurance_reminded_for: '2026-09-20' }, today)).toEqual([]);
    expect(vehicleRemindersDue({ ...base, insurance_expiry: '2026-09-20', insurance_reminded_for: '2025-09-20' }, today).map((d) => d.kind)).toEqual(['insurance']);
  });

  it('counts whole days', () => {
    expect(daysUntil('2026-09-18', today)).toBe(0);
    expect(daysUntil('2026-09-25', today)).toBe(7);
    expect(daysUntil('2026-09-10', today)).toBe(-8);
    expect(vehicleRemindersDue({ ...base, rovinieta_expiry: '2026-09-25' }, today)[0].daysLeft).toBe(7);
  });

  it('ignores a date it cannot read', () => {
    expect(vehicleRemindersDue({ ...base, rovinieta_expiry: '25.09.2026' }, today)).toEqual([]);
  });
});

describe('romanian-date', () => {
  it('reads what the OCR prints and what the database stores', () => {
    expect(toIsoDate('02.07.2029')).toBe('2029-07-02');
    expect(toIsoDate('2029-07-02')).toBe('2029-07-02');
    expect(toIsoDate('2029-07-02T00:00:00.000Z')).toBe('2029-07-02');
    expect(toIsoDate('nu e dată')).toBeNull();
    expect(toIsoDate(null)).toBeNull();
  });

  it('never shows „Invalid Date"', () => {
    expect(formatRoDateLoose('02.07.2029')).toBe('2 iulie 2029');
    expect(formatRoDateLoose('garbage')).toBe('garbage');
  });
});

describe('same-address', () => {
  it('treats the scanned and the typed spelling as one place', () => {
    const scanned = { street: 'Strada Salcâmilor', number: '2', city: 'Odoreu' };
    const typed = { street: 'Salcamilor', number: 'Nr. 2', city: 'ODOREU' };
    expect(sameAddress(scanned, typed)).toBe(true);
    expect(findSameAddress([{ id: 'a', data: scanned }], typed)?.id).toBe('a');
    expect(findSameAddress([{ id: 'a', data: scanned }], { ...typed, number: '4' })).toBeNull();
  });
});
