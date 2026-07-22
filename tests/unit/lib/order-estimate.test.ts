import { describe, expect, it } from 'vitest';
import {
  computeEstimatedCompletionISOForOrder,
  extractCivilRegistrationPlace,
} from '@/lib/orders/order-estimate';
import { computeOrderEstimate } from '@/lib/delivery-estimate-helper';

// Regression guards (2026-07-22): civil-status services (naștere / căsătorie /
// celibat / extras multilingv) promise a term that depends on the registration
// office tier (5-7 / 7-15 / 15-30 zile lucrătoare), but the persisted
// estimated_completion_date was computed from the flat services.estimated_days
// (10) — so a București order was promised a date weeks too early and a
// Satu Mare order days too late.

const TIERS = {
  slow: { display: '15-30 zile lucrătoare', minDays: 15, maxDays: 30 },
  fast: { display: '5-7 zile lucrătoare', minDays: 5, maxDays: 7, counties: ['Satu Mare'] },
  default: { display: '7-15 zile lucrătoare', minDays: 7, maxDays: 15 },
};

function mockClient(value: unknown) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: value ? { value } : null, error: null }),
        }),
      }),
    }),
  };
}

describe('extractCivilRegistrationPlace', () => {
  it('reads snake_case civil_status.registrationPlace', () => {
    expect(
      extractCivilRegistrationPlace({ civil_status: { registrationPlace: 'Sibiu' } })
    ).toBe('Sibiu');
  });

  it('tolerates camelCase civilStatus', () => {
    expect(
      extractCivilRegistrationPlace({ civilStatus: { registrationPlace: 'Cluj' } })
    ).toBe('Cluj');
  });

  it('returns null for non-civil orders / empty values', () => {
    expect(extractCivilRegistrationPlace({ personal: {} })).toBe(null);
    expect(extractCivilRegistrationPlace(null)).toBe(null);
    expect(
      extractCivilRegistrationPlace({ civil_status: { registrationPlace: '  ' } })
    ).toBe(null);
  });
});

describe('computeOrderEstimate — serviceDaysRange override', () => {
  const MONDAY = new Date('2026-07-20T09:00:00+03:00'); // Mon before noon

  it('range wins over flat serviceDays', () => {
    const { estimate } = computeOrderEstimate({
      placedAt: MONDAY,
      serviceDays: 10,
      serviceDaysRange: { minDays: 15, maxDays: 30 },
      selectedOptions: null,
      deliveryMethod: null,
    });

    expect(estimate.minDays).toBe(15);
    expect(estimate.maxDays).toBe(30);
  });

  it('without range the flat serviceDays applies as before', () => {
    const { estimate } = computeOrderEstimate({
      placedAt: MONDAY,
      serviceDays: 10,
      serviceDaysRange: null,
      selectedOptions: null,
      deliveryMethod: null,
    });

    expect(estimate.minDays).toBe(10);
    expect(estimate.maxDays).toBe(10);
  });

  it('document add-ons stack on top of the range', () => {
    const { estimate } = computeOrderEstimate({
      placedAt: MONDAY,
      serviceDays: 10,
      serviceDaysRange: { minDays: 7, maxDays: 15 },
      selectedOptions: [{ code: 'traducere', option_name: 'Traducere Autorizată' }],
      deliveryMethod: null,
    });

    expect(estimate.minDays).toBe(8); // 7 + 1
    expect(estimate.maxDays).toBe(17); // 15 + 2
  });
});

describe('computeEstimatedCompletionISOForOrder — civil tier resolution', () => {
  const MONDAY = new Date('2026-07-20T09:00:00+03:00');

  it('București order uses the slow tier (15-30), not flat estimated_days', async () => {
    const iso = await computeEstimatedCompletionISOForOrder(
      mockClient(TIERS),
      {
        customer_data: { civil_status: { registrationPlace: 'București (Sectorul 3)' } },
        selected_options: null,
        delivery_method: null,
      },
      { estimated_days: 10, urgent_days: null, urgent_available: false },
      MONDAY
    );

    // 30 business days from Mon Jul 20 (day 1): Aug 28 (skips Aug 15 = Sat).
    expect(iso?.slice(0, 10)).toBe('2026-08-28');
  });

  it('Satu Mare order uses the fast tier (5-7)', async () => {
    const iso = await computeEstimatedCompletionISOForOrder(
      mockClient(TIERS),
      {
        customer_data: { civil_status: { registrationPlace: 'Satu Mare' } },
        selected_options: null,
        delivery_method: null,
      },
      { estimated_days: 10, urgent_days: null, urgent_available: false },
      MONDAY
    );

    // 7 business days from Mon Jul 20 (day 1) = Tue Jul 28.
    expect(iso?.slice(0, 10)).toBe('2026-07-28');
  });

  it('non-civil order keeps the flat estimated_days path', async () => {
    const iso = await computeEstimatedCompletionISOForOrder(
      mockClient(TIERS),
      { customer_data: { personal: {} }, selected_options: null, delivery_method: null },
      { estimated_days: 5, urgent_days: 2, urgent_available: true },
      MONDAY
    );

    // 5 business days from Mon Jul 20 (day 1) = Fri Jul 24.
    expect(iso?.slice(0, 10)).toBe('2026-07-24');
  });

  it.each([
    ['extras-carte-funciara'],
    ['extras-plan-cadastral'],
    ['certificat-constatator'],
  ])('instant service %s gets NO estimate (delivered in minutes / on hold during outage)', async (slug) => {
    const iso = await computeEstimatedCompletionISOForOrder(
      mockClient(TIERS),
      { customer_data: { personal: {} }, selected_options: null, delivery_method: null },
      { slug, estimated_days: 1, urgent_days: 2, urgent_available: false },
      MONDAY
    );

    expect(iso).toBe(null);
  });

  it('falls back to default tiers when admin_settings row is missing', async () => {
    const iso = await computeEstimatedCompletionISOForOrder(
      mockClient(null),
      {
        customer_data: { civil_status: { registrationPlace: 'Sibiu' } },
        selected_options: null,
        delivery_method: null,
      },
      { estimated_days: 10, urgent_days: null, urgent_available: false },
      MONDAY
    );

    // Default tier 7-15 → 15 business days from Mon Jul 20 (day 1) = Fri Aug 7.
    expect(iso?.slice(0, 10)).toBe('2026-08-07');
  });
});
