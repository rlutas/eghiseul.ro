import { describe, expect, it } from 'vitest';
import { normalizeOrderOption } from '@/lib/orders/normalize';

// Regression guards for the bundle-grouping pipeline that drives the order
// summary (sticky sidebar + checkout sidebar). Two real production bugs
// motivated these:
//
//   1) (2026-05-27) `normalizeOrderOption` was dropping `optionId` —
//      checkout page received normalized options without an id, so the
//      child→parent match (bundled add-on under a secondary service) failed
//      silently and bundled rows rendered flat at the bottom of the summary.
//
//   2) `isBundledSelected` on the wizard was using a different key
//      (bundled.id vs synthetic `bundled:<parent>:<child>`) — fixed in
//      options-step. The grouping below depends on the same synthetic id
//      being kept consistent between selection and display.
//
// These tests pin the contract that the summary grouping relies on:
// every option carries an `optionId`, and bundled children carry a
// `bundledForParentId` that exactly matches the parent's `optionId`.

describe('normalizeOrderOption — optionId is preserved', () => {
  it('keeps option_id from snake_case DB rows', () => {
    const r = normalizeOrderOption({
      option_id: 'd00f881f-07ec-4134-85e3-a077f1915069',
      option_name: 'Certificat Integritate',
      price_modifier: 100,
    });
    expect(r.optionId).toBe('d00f881f-07ec-4134-85e3-a077f1915069');
  });

  it('keeps optionId from camelCase wizard state', () => {
    const r = normalizeOrderOption({
      optionId: 'abc-123',
      optionName: 'Procesare Urgentă',
      priceModifier: 80,
    });
    expect(r.optionId).toBe('abc-123');
  });

  it('keeps the synthetic `bundled:<parent>:<child>` id on bundled rows', () => {
    // The wizard writes bundled add-ons under a synthetic id so the
    // selection state can map back to the parent. The display layer must
    // preserve it so the same key flows into Stripe metadata + the admin
    // order detail.
    const r = normalizeOrderOption({
      optionId: 'bundled:d00f881f-07ec:8a84a70d-bf3f',
      optionName: 'Apostila de la Haga',
      priceModifier: 238,
      bundledFor: { parentOptionId: 'd00f881f-07ec' },
    });
    expect(r.optionId).toBe('bundled:d00f881f-07ec:8a84a70d-bf3f');
    expect(r.bundledForParentId).toBe('d00f881f-07ec');
  });

  it('returns undefined optionId when neither field is present (legacy rows)', () => {
    const r = normalizeOrderOption({
      option_name: 'Legacy Option',
      price_modifier: 50,
    });
    expect(r.optionId).toBeUndefined();
  });
});

describe('Order summary grouping — child→parent join', () => {
  // Simulates the matching logic <OrderSummaryCard> uses. Kept as a
  // standalone helper here so we test the JOIN behavior independently of
  // React rendering. If the layout component is rewritten, this still
  // guards the canonical data contract.
  function groupOptions(
    options: ReturnType<typeof normalizeOrderOption>[]
  ): {
    parents: ReturnType<typeof normalizeOrderOption>[];
    childrenByParent: Map<string, ReturnType<typeof normalizeOrderOption>[]>;
    orphans: ReturnType<typeof normalizeOrderOption>[];
  } {
    const topLevel = options.filter((o) => !o.bundledForParentId);
    const childrenByParent = new Map<
      string,
      ReturnType<typeof normalizeOrderOption>[]
    >();
    for (const o of options) {
      if (o.bundledForParentId) {
        const list = childrenByParent.get(o.bundledForParentId) ?? [];
        list.push(o);
        childrenByParent.set(o.bundledForParentId, list);
      }
    }
    const orphans = options.filter(
      (o) =>
        o.bundledForParentId &&
        !topLevel.some((p) => p.optionId === o.bundledForParentId)
    );
    return { parents: topLevel, childrenByParent, orphans };
  }

  it('groups bundled add-ons under their secondary-service parent', () => {
    // The real production order combo: Cazier Judiciar with Certificat
    // Integritate as a secondary service, four bundled add-ons under it.
    const parent = normalizeOrderOption({
      option_id: 'd00f881f-07ec',
      option_name: 'Certificat Integritate (adaugă în aceeași comandă)',
      price_modifier: 100,
    });
    const buildKid = (childIdSuffix: string, name: string, price: number) =>
      normalizeOrderOption({
        option_id: `bundled:d00f881f-07ec:${childIdSuffix}`,
        option_name: name,
        price_modifier: price,
        bundled_for: { parent_option_id: 'd00f881f-07ec' },
      });
    const options = [
      parent,
      buildKid('haga', 'Apostila de la Haga (Certificat Integritate (adaugă în aceeași comandă))', 198),
      buildKid('trad', 'Traducere Autorizată (Certificat Integritate (adaugă în aceeași comandă))', 178.5),
      buildKid('leg', 'Legalizare Notarială (Certificat Integritate (adaugă în aceeași comandă))', 99),
      buildKid('notari', 'Apostila Notari (Certificat Integritate (adaugă în aceeași comandă))', 83.3),
    ];

    const { parents, childrenByParent, orphans } = groupOptions(options);

    expect(parents).toHaveLength(1);
    expect(parents[0].optionId).toBe('d00f881f-07ec');
    expect(orphans).toHaveLength(0);
    const kids = childrenByParent.get('d00f881f-07ec') ?? [];
    expect(kids).toHaveLength(4);
    // Marketing suffix should be gone from every name (via normalizeOrderOption).
    for (const opt of [parent, ...kids]) {
      expect(opt.name).not.toContain('adaugă în aceeași comandă');
    }
  });

  it('renders a bundled child as orphan when its parent is missing from the list', () => {
    // Defensive — if an order has bundled children whose parent isn't in the
    // payload (data corruption / partial save), the layout falls back to
    // rendering them flat so the customer still sees what they paid for.
    const options = [
      normalizeOrderOption({
        option_id: 'bundled:ghost:child',
        option_name: 'Orphan Bundled',
        price_modifier: 50,
        bundled_for: { parent_option_id: 'ghost' },
      }),
    ];
    const { parents, orphans } = groupOptions(options);
    expect(parents).toHaveLength(0);
    expect(orphans).toHaveLength(1);
  });

  it('handles a real production order shape', () => {
    // Snapshot of the actual API payload for order E-260527-A2XJ9 — keeps
    // the test pinned to real-world data not a hypothetical.
    const raw = [
      { option_id: 'a610-urgent', option_name: 'Procesare Urgentă', price_modifier: 80, code: 'urgenta' },
      { option_id: '21b8-haga', option_name: 'Apostilă de la Haga', price_modifier: 198, code: 'apostila_haga' },
      { option_id: 'd00f-integ', option_name: 'Certificat Integritate (adaugă în aceeași comandă)', price_modifier: 100 },
      {
        option_id: 'bundled:d00f-integ:8a84-haga',
        option_name: 'Apostilă de la Haga (Certificat Integritate (adaugă în aceeași comandă))',
        price_modifier: 198,
        bundled_for: { parent_option_id: 'd00f-integ' },
      },
    ];
    const opts = raw.map(normalizeOrderOption);
    const { parents, childrenByParent, orphans } = groupOptions(opts);

    expect(parents.map((p) => p.optionId)).toEqual([
      'a610-urgent',
      '21b8-haga',
      'd00f-integ',
    ]);
    expect(childrenByParent.get('d00f-integ')).toHaveLength(1);
    expect(orphans).toHaveLength(0);
  });
});
