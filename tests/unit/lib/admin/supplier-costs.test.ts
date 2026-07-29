import { describe, expect, it } from 'vitest';
import {
  validateSupplierCost,
  totalSupplierCost,
  serviceRevenueForMargin,
  computeMargin,
  pendingCostRows,
  tariffAmount,
  findTariff,
  lastAmountKey,
  pendingRowKey,
} from '@/lib/admin/supplier-costs';

describe('validateSupplierCost', () => {
  const ok = { supplier: 'Traducător X', category: 'traducere', amountRon: 45 };
  it('accepts a valid cost', () => {
    expect(validateSupplierCost(ok)).toBe(null);
  });
  it('rejects missing supplier', () => {
    expect(validateSupplierCost({ ...ok, supplier: '' })).toContain('Furnizorul');
  });
  it('rejects invalid category', () => {
    expect(validateSupplierCost({ ...ok, category: 'xyz' })).toContain('Categoria');
  });
  it('rejects negative / absurd amount', () => {
    expect(validateSupplierCost({ ...ok, amountRon: -5 })).toContain('Suma');
    expect(validateSupplierCost({ ...ok, amountRon: 999999 })).toContain('Suma');
  });
});

describe('totalSupplierCost', () => {
  it('sums amounts', () => {
    expect(totalSupplierCost([{ amount_ron: 45 }, { amount_ron: 60.5 }])).toBe(105.5);
  });
  it('empty = 0', () => {
    expect(totalSupplierCost([])).toBe(0);
  });
});

describe('serviceRevenueForMargin', () => {
  it('sums only value-added option codes + additional paid', () => {
    const opts = [
      { code: 'traducere', priceModifier: 178.5, quantity: 1 },
      { code: 'legalizare', priceModifier: 99, quantity: 1 },
      { code: 'copii_suplimentare', priceModifier: 50, quantity: 2 }, // ignored
      { code: 'urgenta', priceModifier: 80, quantity: 1 }, // ignored
    ];
    expect(serviceRevenueForMargin(opts, 0)).toBe(277.5);
  });
  it('includes additional paid (extra flow)', () => {
    expect(serviceRevenueForMargin([], 824.5)).toBe(824.5);
  });
  it('counts custom_extra + apostille', () => {
    const opts = [
      { code: 'apostila_haga', priceModifier: 150, quantity: 1 },
      { code: 'custom_extra', priceModifier: 200, quantity: 1 },
    ];
    expect(serviceRevenueForMargin(opts, 0)).toBe(350);
  });
});

describe('computeMargin', () => {
  it('revenue − cost, with pct', () => {
    const m = computeMargin(277.5, 105.5);
    expect(m.margin).toBe(172);
    expect(m.marginPct).toBeCloseTo(62, 0);
  });
  it('negative margin flagged', () => {
    expect(computeMargin(100, 150).margin).toBe(-50);
  });
  it('zero revenue → null pct', () => {
    expect(computeMargin(0, 45).marginPct).toBe(null);
  });
});

describe('pendingCostRows — ce cere echipei la finalizare', () => {
  it('nu cere nimic pe o comandă simplă (cazier + urgență)', () => {
    expect(
      pendingCostRows({
        options: [{ code: 'urgenta', option_name: 'Procesare Urgentă' }],
        serviceSlug: 'cazier-judiciar',
      }),
    ).toEqual([]);
  });

  it('apostila Haga NU declanșează nimic — nu ne costă', () => {
    expect(
      pendingCostRows({
        options: [
          { code: 'apostila_haga', option_name: 'Apostilă de la Haga', metadata: { country: 'Brazilia' } },
        ],
        serviceSlug: 'cazier-judiciar',
      }),
    ).toEqual([]);
  });

  it('cere traducerea cu limba din comandă și furnizorul implicit', () => {
    const rows = pendingCostRows({
      options: [
        { code: 'traducere', option_name: 'Traducere Autorizată', metadata: { language: 'Italiană' } },
      ],
      serviceSlug: 'certificat-nastere',
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      category: 'traducere',
      supplier: 'Traducător',
      language: 'Italiană',
      label: 'Traducere Autorizată · Italiană',
    });
  });

  it('mapează legalizarea la notar și apostila notarială la Camera Notarilor', () => {
    const rows = pendingCostRows({
      options: [
        { code: 'legalizare', option_name: 'Legalizare Notarială' },
        { code: 'apostila_notari', option_name: 'Apostilă Notari' },
      ],
    });
    expect(rows.map((r) => [r.category, r.supplier])).toEqual([
      ['legalizare', 'Notar'],
      ['apostila', 'Camera Notarilor'],
    ]);
  });

  it('cere taxa de instituție pe comenzile ONRC/ANCPI, fără nicio opțiune', () => {
    const rows = pendingCostRows({
      options: [],
      serviceSlug: 'extras-carte-funciara',
      institutionFeeSuppliers: { 'extras-carte-funciara': 'ANCPI' },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ category: 'taxa_institutie', supplier: 'ANCPI' });
  });

  it('nu cere din nou o categorie deja înregistrată', () => {
    const rows = pendingCostRows({
      options: [
        { code: 'traducere', option_name: 'Traducere' },
        { code: 'legalizare', option_name: 'Legalizare' },
      ],
      existingKeys: [pendingRowKey('traducere', null)],
    });
    expect(rows.map((r) => r.category)).toEqual(['legalizare']);
  });

  it('pre-completează din tarif, cu prioritate față de istoric', () => {
    const rows = pendingCostRows({
      options: [{ code: 'legalizare', option_name: 'Legalizare' }],
      tariffs: [{ supplier: 'Notar', category: 'legalizare', firstPageRon: 45, extraPageRon: 5 }],
      lastAmounts: { [lastAmountKey('Notar', 'legalizare', null)]: 90 },
    });
    expect(rows[0]).toMatchObject({ suggestedAmount: 45, suggestionSource: 'tarif' });
  });

  it('cade pe ultima sumă folosită când nu există tarif', () => {
    const rows = pendingCostRows({
      options: [{ code: 'traducere', option_name: 'Traducere', metadata: { language: 'Italiană' } }],
      lastAmounts: { [lastAmountKey('Traducător', 'traducere', 'Italiană')]: 180 },
    });
    expect(rows[0]).toMatchObject({ suggestedAmount: 180, suggestionSource: 'istoric' });
  });

  it('rămâne gol când nu știe nimic', () => {
    const rows = pendingCostRows({ options: [{ code: 'traducere', option_name: 'Traducere' }] });
    expect(rows[0]).toMatchObject({ suggestedAmount: null, suggestionSource: null });
  });
});

describe('tariffAmount — prima pagină + pagini suplimentare', () => {
  const notar = { supplier: 'Notar', category: 'legalizare', firstPageRon: 45, extraPageRon: 5 };

  it('o pagină = prima pagină', () => {
    expect(tariffAmount(notar, 1)).toBe(45);
  });

  it('3 pagini = 45 + 5 + 5', () => {
    expect(tariffAmount(notar, 3)).toBe(55);
  });

  it('tratează 0 / valori absurde ca o pagină', () => {
    expect(tariffAmount(notar, 0)).toBe(45);
    expect(tariffAmount(notar, -4)).toBe(45);
  });

  it('tariful fix ignoră numărul de pagini', () => {
    const ancpi = { supplier: 'ANCPI', category: 'taxa_institutie', serviceSlug: 'extras-carte-funciara', amountRon: 20 };
    expect(tariffAmount(ancpi, 5)).toBe(20);
  });

  it('null când tariful nu produce un număr', () => {
    expect(tariffAmount(null)).toBeNull();
    expect(tariffAmount({ supplier: 'X', category: 'traducere' })).toBeNull();
  });
});

describe('findTariff', () => {
  const tariffs = [
    { supplier: 'Traducător', category: 'traducere', firstPageRon: 60 },
    { supplier: 'Traducător', category: 'traducere', language: 'Italiană', firstPageRon: 80 },
    { supplier: 'ANCPI', category: 'taxa_institutie', serviceSlug: 'extras-carte-funciara', amountRon: 20 },
  ];

  it('preferă tariful pe limbă', () => {
    expect(findTariff(tariffs, { category: 'traducere', language: 'Italiană' })?.firstPageRon).toBe(80);
  });

  it('cade pe tariful general al categoriei', () => {
    expect(findTariff(tariffs, { category: 'traducere', language: 'Suedeză' })?.firstPageRon).toBe(60);
  });

  it('găsește taxa după serviciu', () => {
    expect(findTariff(tariffs, { category: 'taxa_institutie', serviceSlug: 'extras-carte-funciara' })?.amountRon).toBe(20);
  });

  it('null când categoria nu e configurată', () => {
    expect(findTariff(tariffs, { category: 'curier' })).toBeNull();
  });
});

describe('pendingCostRows — comandă cu două servicii (bundled)', () => {
  // Scenariul real: cazier judiciar + certificat de integritate, iar clientul
  // bifează traducere/legalizare pe FIECARE serviciu. Wizardul salvează
  // opțiunile celui de-al doilea serviciu cu `bundled_for.parent_option_id` =
  // id-ul add-on-ului, deci fiecare opțiune spune singură pentru ce act e.
  const INTEGRITATE_ID = 'af01bb9e-addon-integritate';
  const order = {
    serviceName: 'Cazier Judiciar',
    serviceSlug: 'cazier-judiciar',
    options: [
      {
        code: 'addon_certificat_integritate',
        option_id: INTEGRITATE_ID,
        option_name: 'Certificat Integritate',
      },
      { code: 'traducere', option_name: 'Traducere Autorizată', metadata: { language: 'Italiană' } },
      {
        code: 'traducere',
        option_name: 'Traducere Autorizată',
        metadata: { language: 'Italiană' },
        bundled_for: { parent_option_id: INTEGRITATE_ID, bundled_option_code: 'traducere' },
      },
      { code: 'legalizare', option_name: 'Legalizare Notarială' },
    ],
  };

  it('atribuie fiecare opțiune actului pentru care a fost cumpărată', () => {
    const rows = pendingCostRows(order);
    expect(rows.map((r) => [r.category, r.documentLabel])).toEqual([
      ['traducere', 'Cazier Judiciar'],
      ['traducere', 'Certificat Integritate'],
      ['legalizare', 'Cazier Judiciar'],
    ]);
  });

  it('NU inventează costuri pentru acte fără opțiunea respectivă', () => {
    // Legalizarea e bifată doar pe cazier → nu se cere și pe integritate.
    const rows = pendingCostRows(order);
    expect(
      rows.filter((r) => r.category === 'legalizare').map((r) => r.documentLabel)
    ).toEqual(['Cazier Judiciar']);
  });

  it('acceptă și forma camelCase a metadatelor de bundling', () => {
    const rows = pendingCostRows({
      serviceName: 'Cazier Judiciar',
      options: [
        { code: 'addon_certificat_integritate', optionId: INTEGRITATE_ID, optionName: 'Certificat Integritate' },
        {
          code: 'traducere',
          optionName: 'Traducere Autorizată',
          bundledFor: { parentOptionId: INTEGRITATE_ID },
        },
      ],
    });
    expect(rows.map((r) => r.documentLabel)).toEqual(['Certificat Integritate']);
  });

  it('costul pus pe un act nu îl ascunde pe celălalt', () => {
    const rows = pendingCostRows({
      ...order,
      existingKeys: [pendingRowKey('traducere', 'Cazier Judiciar')],
    });
    expect(rows.map((r) => [r.category, r.documentLabel])).toEqual([
      ['traducere', 'Certificat Integritate'],
      ['legalizare', 'Cazier Judiciar'],
    ]);
  });

  it('un singur serviciu → fără sufix de document', () => {
    const rows = pendingCostRows({
      serviceName: 'Cazier Judiciar',
      options: [{ code: 'traducere', option_name: 'Traducere Autorizată' }],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].label).toBe('Traducere Autorizată');
    expect(rows[0].documentLabel).toBeNull();
  });

  it('apostila Haga nu creează un act în plus', () => {
    const rows = pendingCostRows({
      serviceName: 'Cazier Judiciar',
      options: [
        { code: 'apostila_haga', option_name: 'Apostilă de la Haga' },
        { code: 'traducere', option_name: 'Traducere Autorizată' },
      ],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].documentLabel).toBeNull();
  });
});

describe('pendingCostRows — extra legat explicit de un document', () => {
  // Echipa adaugă din admin „traducere maghiară" pentru certificatul de
  // integritate. Odată ce spune PENTRU CE act e, nu mai are sens să întrebăm
  // și pentru celelalte acte ale comenzii.
  it('cere costul doar pentru documentul indicat', () => {
    const rows = pendingCostRows({
      serviceName: 'Cazier Judiciar',
      options: [
        { code: 'addon_certificat_integritate', option_id: 'addon-1', option_name: 'Certificat Integritate' },
        {
          code: 'custom_extra',
          option_name: 'Traducere legalizată maghiară',
          metadata: { document: 'Certificat Integritate' },
        },
      ],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      documentLabel: 'Certificat Integritate',
      label: 'Traducere legalizată maghiară — Certificat Integritate',
    });
  });

  it('fără document indicat, extra-ul cade pe serviciul principal', () => {
    const rows = pendingCostRows({
      serviceName: 'Cazier Judiciar',
      options: [
        { code: 'addon_certificat_integritate', option_id: 'addon-1', option_name: 'Certificat Integritate' },
        { code: 'custom_extra', option_name: 'Serviciu extra' },
      ],
    });
    expect(rows.map((r) => r.documentLabel)).toEqual(['Cazier Judiciar']);
  });
});
