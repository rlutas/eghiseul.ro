import { describe, expect, it } from 'vitest';
import {
  buildServicesBreakdown,
  buildDeliveryTermsDetailed,
  type SelectedOption,
} from '@/lib/documents/generator';

// Tests the contract-side helpers added 2026-05-27 so the printed contract
// shows the same itemized services and the same delivery timeline the
// customer saw on the order summary at checkout.
//
// These build raw text that ends up on a signed legal document — a wrong
// number here means a customer signed a contract that disagrees with what
// they paid for. High-stakes regression target.

describe('buildServicesBreakdown', () => {
  // Use .normalize('NFC') on both source and expected substrings to avoid
  // NFC-vs-NFD diacritic mismatches between this test file and the source
  // file. Some editors save Romanian text in NFD (a + combining breve)
  // while TypeScript string literals are NFC — the two look identical but
  // fail toContain comparison.
  const normNFC = (s: string) => s.normalize('NFC');

  it('renders just the main service when no add-ons selected', () => {
    const text = normNFC(buildServicesBreakdown('Cazier Judiciar PF', 198, [], 198));
    expect(text).toContain(normNFC('Cazier Judiciar PF 198.00 RON'));
    expect(text).toContain(normNFC('Total comandă 198.00 RON'));
    expect(text).not.toMatch(/^\s*•/m); // no bullet rows
  });

  it('lists direct add-ons as indented bullets under the main service', () => {
    const options: SelectedOption[] = [
      { optionId: 'urg', optionName: 'Procesare Urgenta', priceModifier: 80, quantity: 1, code: 'urgenta' },
      { optionId: 'haga', optionName: 'Apostila de la Haga', priceModifier: 198, quantity: 1, code: 'apostila_haga' },
    ];
    const text = normNFC(buildServicesBreakdown('Cazier Judiciar PF', 198, options, 476));

    expect(text).toContain('Cazier Judiciar PF 198.00 RON');
    expect(text).toContain('Procesare Urgenta');
    expect(text).toContain('+80.00 RON');
    expect(text).toContain('Apostila de la Haga');
    expect(text).toContain('+198.00 RON');
    expect(text).toContain('Total comandă'.normalize('NFC'));
    expect(text).toContain('476.00 RON');
    // Bullet rows must be indented so they render as nested under the main service.
    expect(text).toMatch(/^\s{2,}•\s+Procesare Urgenta/m);
  });

  it('renders a secondary service with its bundled add-ons nested under it', () => {
    const options: SelectedOption[] = [
      { optionId: 'integritate', optionName: 'Certificat Integritate (adaugă în aceeași comandă)', priceModifier: 100, quantity: 1 },
      {
        optionId: 'integ-haga',
        optionName: 'Apostila de la Haga (Certificat Integritate (adaugă în aceeași comandă))',
        priceModifier: 198,
        quantity: 1,
        code: 'apostila_haga',
        bundledFor: { parentOptionId: 'integritate' },
      },
    ];
    const text = normNFC(buildServicesBreakdown('Cazier Judiciar PF', 198, options, 496));

    // Sub-service header carries the "(serviciu secundar)" label and the
    // marketing suffix is stripped from the visible name.
    expect(text).toContain('Certificat Integritate (serviciu secundar)');
    expect(text).toContain('+100.00 RON');
    expect(text).not.toContain('adaugă în aceeași comandă'.normalize('NFC'));

    // The bundled child renders indented after its parent, with the parent
    // wrapper stripped from its name too.
    const integLine = text.indexOf('Certificat Integritate');
    const kidLine = text.indexOf('Apostila de la Haga');
    expect(integLine).toBeGreaterThan(-1);
    expect(kidLine).toBeGreaterThan(integLine); // child comes after parent
  });

  it('uses snake_case option fields when camelCase is missing', () => {
    const options: SelectedOption[] = [
      { option_id: 'urg', option_name: 'Procesare Urgenta', price_modifier: 80, quantity: 1, code: 'urgenta' },
    ];
    const text = normNFC(buildServicesBreakdown('Cazier Judiciar PF', 198, options, 278));
    expect(text).toContain('Procesare Urgenta');
    expect(text).toContain('+80.00 RON');
  });
});

describe('buildDeliveryTermsDetailed', () => {
  const baseOrder = {
    order_number: 'E-260527-X',
    friendly_order_id: 'E-260527-X',
    total_price: 0,
    service_name: 'Cazier Judiciar PF',
    service_price: 198,
    created_at: new Date().toISOString(),
    estimated_days: 4,
    urgent_days: 2,
    urgent_available: true,
  } as const;

  it('formats a per-step breakdown matching the calculator output', () => {
    const text = buildDeliveryTermsDetailed(baseOrder, [], {
      minDays: 5,
      maxDays: 7,
      breakdown: [
        { step: 'Procesare urgentă', minDays: 1, maxDays: 2 },
        { step: 'Traducere', minDays: 1, maxDays: 2 },
        { step: 'Legalizare', minDays: 1, maxDays: 1 },
        { step: 'Apostilă Haga', minDays: 1, maxDays: 1 },
        { step: 'Apostilă Notari', minDays: 1, maxDays: 1 },
      ],
    });

    expect(text).toContain('Termen estimat: 5-7 zile lucrătoare');
    expect(text).toContain('• Procesare urgentă: 1-2 zile');
    expect(text).toContain('• Traducere: 1-2 zile');
    expect(text).toContain('• Legalizare: 1 zi');
    expect(text).toContain('• Apostilă Haga: 1 zi');
    expect(text).toContain('Pentru situații care necesită verificări suplimentare');
  });

  it('uses singular "1 zi" when min === max === 1', () => {
    const text = buildDeliveryTermsDetailed(baseOrder, [], {
      minDays: 1,
      maxDays: 1,
      breakdown: [{ step: 'Apostilă Haga', minDays: 1, maxDays: 1 }],
    });
    expect(text).toContain('Termen estimat: 1 zi lucrătoare');
    expect(text).toContain('• Apostilă Haga: 1 zi');
  });

  it('falls back to the legacy single-line term when no estimate is provided', () => {
    // Services without delivery-calculator coverage still need a sensible
    // contract line — the helper should reuse buildDeliveryTerms.
    const text = buildDeliveryTermsDetailed(baseOrder, [], null);
    expect(text).toMatch(/zile lucrătoare/);
    expect(text).not.toContain('Termen estimat:');
  });
});
