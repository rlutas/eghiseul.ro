/**
 * Cazier auto — permis emis în străinătate (28.07.2026, paritate cu
 * cazierjudiciaronline.com): alt tarif (350 vs 198) și alt termen
 * (7-10 vs 3-5 zile lucrătoare), termen care NU se scurtează cu urgență.
 */
import { describe, it, expect } from 'vitest';
import { hasForeignDrivingLicense } from '@/lib/orders/order-estimate';
import { estimateFromSelectedOptions } from '@/lib/delivery-calculator';

describe('hasForeignDrivingLicense', () => {
  it('true doar când flagul e explicit true', () => {
    expect(hasForeignDrivingLicense({ vehicle: { licenseIssuedAbroad: true } })).toBe(true);
    expect(hasForeignDrivingLicense({ vehicle: { licenseIssuedAbroad: false } })).toBe(false);
    expect(hasForeignDrivingLicense({ vehicle: {} })).toBe(false);
    expect(hasForeignDrivingLicense({})).toBe(false);
    expect(hasForeignDrivingLicense(null)).toBe(false);
  });

  it('tolerează forma camelCase a modulului (drafturi vechi)', () => {
    expect(hasForeignDrivingLicense({ vehicleData: { licenseIssuedAbroad: true } })).toBe(true);
  });
});

describe('estimateFromSelectedOptions — baseRange', () => {
  const orderDate = new Date('2026-07-28T08:00:00.000Z'); // marți dimineață

  it('intervalul de bază înlocuiește zilele fixe ale serviciului', () => {
    const est = estimateFromSelectedOptions({
      selectedOptions: [],
      baseDays: 5,
      baseRange: { minDays: 7, maxDays: 10 },
      orderDate,
    });
    expect(est.minDays).toBe(7);
    expect(est.maxDays).toBe(10);
  });

  // Urgența nu poate scurta termenul unei autorități străine — în wizard
  // opțiunea e ascunsă, dar calculul trebuie să fie corect și dacă un draft
  // vechi o cară după el.
  it('urgența NU scurtează intervalul de bază', () => {
    const est = estimateFromSelectedOptions({
      selectedOptions: [{ code: 'urgenta', option_name: 'Procesare Urgentă' }],
      baseDays: 5,
      baseRange: { minDays: 7, maxDays: 10 },
      orderDate,
    });
    expect(est.minDays).toBe(7);
    expect(est.maxDays).toBe(10);
  });

  it('fără baseRange, urgența funcționează ca înainte', () => {
    const est = estimateFromSelectedOptions({
      selectedOptions: [{ code: 'urgenta', option_name: 'Procesare Urgentă' }],
      baseDays: 5,
      orderDate,
    });
    expect(est.maxDays).toBeLessThan(5);
  });

  it('add-on-urile se adaugă peste intervalul de bază', () => {
    const withAddon = estimateFromSelectedOptions({
      selectedOptions: [{ code: 'traducere', option_name: 'Traducere Autorizată' }],
      baseRange: { minDays: 7, maxDays: 10 },
      orderDate,
    });
    expect(withAddon.maxDays).toBeGreaterThan(10);
  });
});
