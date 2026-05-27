import { describe, expect, it } from 'vitest';
import { computeOrderEstimate } from '@/lib/delivery-estimate-helper';

// Regression guards for the submission-time delivery-estimate helper.
// Bug (2026-05-27): the helper used to ignore traducere / legalizare /
// apostila_* codes because `delivery_days_impact` isn't persisted on the
// order row. Result: an order with apostila + traducere + legalizare went
// out as "estimated 2 zile" on the status page, while the wizard sidebar
// (using the central OPTION_DELIVERY_IMPACT table) correctly showed 5-7.
// Fix: helper now falls back to OPTION_DELIVERY_IMPACT when no explicit
// impact is present.

const FIXED_ORDER_DATE = new Date('2026-09-23T06:00:00.000Z'); // Wed 09:00 RO

describe('computeOrderEstimate — code-based fallback (2026-05-27)', () => {
  it('reproduces the production combo: urgent + apostila + traducere + legalizare + apostila_notari → 5-7 zile', () => {
    // Real bug fixture: customer order with all four document add-ons +
    // urgenta — must report 5-7 business days, not the previous 1-2.
    const { estimate } = computeOrderEstimate({
      placedAt: FIXED_ORDER_DATE,
      serviceDays: 4,
      urgentDays: 2,
      urgentAvailable: true,
      selectedOptions: [
        { code: 'urgenta', option_name: 'Procesare Urgentă' },
        { code: 'apostila_haga', option_name: 'Apostilă de la Haga' },
        { code: 'traducere', option_name: 'Traducere Autorizată' },
        { code: 'legalizare', option_name: 'Legalizare Notarială' },
        { code: 'apostila_notari', option_name: 'Apostilă Notari' },
      ],
      deliveryMethod: null,
    });

    expect(estimate.minDays).toBe(5); // 1 urgent + 1 trad + 1 leg + 1 apostila + 1 notari
    expect(estimate.maxDays).toBe(7); // 2 urgent + 2 trad + 1 leg + 1 apostila + 1 notari
  });

  it('adds traducere (1-2 zile) on top of the standard base when not urgent', () => {
    const { estimate } = computeOrderEstimate({
      placedAt: FIXED_ORDER_DATE,
      serviceDays: 4,
      urgentDays: null,
      urgentAvailable: false,
      selectedOptions: [
        { code: 'traducere', option_name: 'Traducere Autorizată' },
      ],
      deliveryMethod: null,
    });

    expect(estimate.minDays).toBe(4 + 1);
    expect(estimate.maxDays).toBe(4 + 2);
  });

  it('dedupes bundled duplicates by code so each step counts once', () => {
    // Customer picked Apostila Haga both at top level (cazier) AND under
    // the bundled secondary service (Certificat Integritate). It's done
    // once in practice — the timeline must not double up.
    const { estimate } = computeOrderEstimate({
      placedAt: FIXED_ORDER_DATE,
      serviceDays: 4,
      urgentDays: null,
      urgentAvailable: false,
      selectedOptions: [
        { code: 'apostila_haga', option_name: 'Apostilă de la Haga' },
        {
          code: 'apostila_haga',
          option_name: 'Apostilă de la Haga (Certificat Integritate)',
          bundled_for: { parent_option_id: 'integ-id' },
        },
      ],
      deliveryMethod: null,
    });

    expect(estimate.minDays).toBe(4 + 1);
    expect(estimate.maxDays).toBe(4 + 1);
  });

  it('still honors cetatean_strain (+7 zile) — legacy code path unchanged', () => {
    const { estimate } = computeOrderEstimate({
      placedAt: FIXED_ORDER_DATE,
      serviceDays: 4,
      urgentDays: null,
      urgentAvailable: false,
      selectedOptions: [
        { code: 'cetatean_strain', option_name: 'Cetățean Străin' },
      ],
      deliveryMethod: null,
    });
    expect(estimate.maxDays).toBe(4 + 7);
  });

  it('returns the base when no recognized add-ons are picked', () => {
    const { estimate } = computeOrderEstimate({
      placedAt: FIXED_ORDER_DATE,
      serviceDays: 4,
      urgentDays: null,
      urgentAvailable: false,
      selectedOptions: [
        // Verificare expert / copii suplimentare don't move the timeline.
        { code: 'verificare_expert', option_name: 'Verificare Expert' },
      ],
      deliveryMethod: null,
    });
    expect(estimate.minDays).toBe(4);
    expect(estimate.maxDays).toBe(4);
  });
});
