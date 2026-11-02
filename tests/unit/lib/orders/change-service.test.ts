import { describe, expect, it } from 'vitest';
import {
  describeDocumentImpact,
  evaluateServiceSwitch,
  invoiceNote,
  remapSelectedOptions,
  type ServiceForSwitch,
  type SwitchEvaluationInput,
  type TargetOptionForSwitch,
} from '@/lib/orders/change-service';

const personalKyc = { enabled: true, selfieRequired: true };

const judiciarPF: ServiceForSwitch = {
  id: 'svc-jpf',
  slug: 'cazier-judiciar-persoana-fizica',
  name: 'Cazier Judiciar Persoană Fizică',
  base_price: '198.00',
  is_active: true,
  verification_config: { signature: { required: true }, personalKyc: { ...personalKyc, parentDataRequired: true } },
};
const fiscal: ServiceForSwitch = {
  id: 'svc-fiscal',
  slug: 'cazier-fiscal',
  name: 'Cazier Fiscal Persoană Fizică',
  base_price: '198.00',
  is_active: true,
  verification_config: { signature: { required: true }, personalKyc },
};
const auto: ServiceForSwitch = {
  id: 'svc-auto',
  slug: 'cazier-auto',
  name: 'Cazier Auto',
  base_price: '198.00',
  is_active: true,
  verification_config: {
    signature: { required: false },
    personalKyc: { ...personalKyc, extraDocuments: ['permis_fata'] },
    vehicleVerification: { enabled: true, foreignLicense: { enabled: true, price: 350 } },
  },
};
const judiciarPJ: ServiceForSwitch = {
  id: 'svc-jpj',
  slug: 'cazier-judiciar-persoana-juridica',
  name: 'Cazier Judiciar Persoană Juridică',
  base_price: '198.00',
  is_active: true,
  verification_config: { companyKyc: { enabled: true }, personalKyc },
};
const nastere: ServiceForSwitch = {
  id: 'svc-nastere',
  slug: 'certificat-nastere',
  name: 'Certificat de Naștere',
  base_price: '998.00',
  is_active: true,
  verification_config: { civilStatus: { enabled: true }, personalKyc },
};
const extrasCF: ServiceForSwitch = {
  id: 'svc-cf',
  slug: 'extras-carte-funciara',
  name: 'Extras CF',
  base_price: '198.00',
  is_active: true,
  verification_config: {},
};

const propVc = (over: Record<string, unknown> = {}) => ({
  signature: { required: true },
  personalKyc: { enabled: false },
  conventie: { enabled: true },
  propertyVerification: {
    enabled: true,
    fields: {
      county: { required: true },
      locality: { required: true },
      carteFunciara: { required: true },
      cadastral: { required: false },
      topografic: { required: false },
    },
    identificationService: { enabled: false },
  },
  ...over,
});
const copieIntabulare: ServiceForSwitch = {
  id: 'svc-ci',
  slug: 'copie-intabulare',
  name: 'Copie Încheiere Intabulare',
  base_price: '216.59',
  is_active: true,
  verification_config: propVc(),
};
const copieContract: ServiceForSwitch = {
  id: 'svc-ccv',
  slug: 'copie-contract-vanzare',
  name: 'Copie Contract Vânzare',
  base_price: '216.59',
  is_active: true,
  verification_config: propVc(),
};
const identProprietar: ServiceForSwitch = {
  id: 'svc-idp',
  slug: 'identificare-imobile-proprietar',
  name: 'Identificare imobile după proprietar',
  base_price: '298.00',
  is_active: true,
  verification_config: propVc({
    conventie: undefined,
    signature: { required: false },
    propertyVerification: {
      enabled: true,
      fields: { county: { required: true }, locality: { required: true }, carteFunciara: { required: false } },
      identificationService: { enabled: true, extraFields: ['ownerName', 'address'] },
    },
  }),
};
const identImobil: ServiceForSwitch = { ...identProprietar, id: 'svc-idi', slug: 'identificare-imobil', name: 'Identificare imobil' };

const property = {
  county: 'Cluj',
  locality: 'Cluj-Napoca',
  imobilLocality: 'Cluj-Napoca',
  carteFunciara: '123456',
  beneficiaryName: 'Pop Ion',
  beneficiaryCnp: '0000000000000',
  beneficiaryAddress: 'Str. X 1',
  beneficiaryIdSeries: 'CJ',
  beneficiaryIdNumber: '123456',
};

const imobOrder = (over: Partial<SwitchEvaluationInput['order']> = {}, cdOver: Record<string, unknown> = {}): SwitchEvaluationInput['order'] => ({
  status: 'processing',
  payment_status: 'paid',
  base_price: '216.59',
  selected_options: [],
  customer_data: { property, signature_s3_key: 'signatures/x.png', ...cdOver },
  ...over,
});

const evaluateImob = (over: Partial<SwitchEvaluationInput> = {}) =>
  evaluateServiceSwitch({
    order: imobOrder(),
    source: copieIntabulare,
    target: copieContract,
    targetOptions: [],
    brandSellsTarget: true,
    sourceCollaboratorIds: ['mircea'],
    targetCollaboratorIds: ['mircea'],
    ...over,
  });

const opts = (svc: string, codes: Array<[string, boolean?]>): TargetOptionForSwitch[] =>
  codes.map(([code, active = true]) => ({ id: `${svc}-${code}`, code, is_active: active }));

const paidOrder = (over: Partial<SwitchEvaluationInput['order']> = {}): SwitchEvaluationInput['order'] => ({
  status: 'processing',
  payment_status: 'paid',
  base_price: '198.00',
  selected_options: [],
  customer_data: {
    personal: { cnp: '0000000000000', fatherName: 'A', motherName: 'B', uploadedDocuments: [{ type: 'act_identitate' }] },
    signature_s3_key: 'signatures/x.png',
  },
  ...over,
});

const evaluate = (over: Partial<SwitchEvaluationInput> = {}) =>
  evaluateServiceSwitch({
    order: paidOrder(),
    source: judiciarPF,
    target: fiscal,
    targetOptions: opts('fiscal', [['traducere'], ['urgenta', false]]),
    brandSellsTarget: true,
    ...over,
  });

describe('evaluateServiceSwitch', () => {
  it('allows judiciar PF → fiscal at the same price with nothing missing', () => {
    const ev = evaluate();
    expect(ev.eligible).toBe(true);
    expect(ev.blockers).toEqual([]);
    expect(ev.basePriceDelta).toBe(0);
  });

  it('blocks when CURRENT catalogue prices differ and points the team to Modifică', () => {
    const ev = evaluate({ target: { ...fiscal, base_price: 219 } });
    expect(ev.eligible).toBe(false);
    expect(ev.basePriceDelta).toBe(21);
    expect(ev.blockers.join(' ')).toContain('Modifică');
  });

  it('compares current catalogue prices: equal today → allowed', () => {
    const ev = evaluate({ source: { ...judiciarPF, base_price: 250 }, target: { ...fiscal, base_price: '250.00' } });
    expect(ev.eligible).toBe(true);
    expect(ev.basePriceDelta).toBe(0);
  });

  it('an order paid at an OLD price is allowed when both services cost the same today', () => {
    const ev = evaluate({ order: paidOrder({ base_price: '179.00' }) });
    expect(ev.eligible).toBe(true);
    expect(ev.changes.join(' ')).toContain('preț vechi');
    expect(ev.changes.join(' ')).toContain('Banii nu se mișcă');
  });

  it('the paid price never unblocks a current-price difference', () => {
    // paid 219 = target today, but the current service costs 198 today → still blocked
    const ev = evaluate({ order: paidOrder({ base_price: 219 }), target: { ...fiscal, base_price: 219 } });
    expect(ev.eligible).toBe(false);
  });

  it('blocks unpaid, cancelled, refunded and cancellation-requested orders', () => {
    expect(evaluate({ order: paidOrder({ payment_status: 'unpaid' }) }).eligible).toBe(false);
    for (const status of ['cancelled', 'refunded', 'cancellation_requested']) {
      const ev = evaluate({ order: paidOrder({ status }) });
      expect(ev.eligible).toBe(false);
    }
  });

  it('allows completed / shipped / delivered with a warning and keeps the deadline', () => {
    for (const status of ['completed', 'shipped', 'delivered']) {
      const ev = evaluate({ order: paidOrder({ status }) });
      expect(ev.eligible).toBe(true);
      expect(ev.keepEstimate).toBe(true);
      expect(ev.warnings[0]).toMatch(/^Comanda e deja „.+": schimbarea corectează doar evidența; documentele deja depuse\/livrate nu se schimbă\.$/);
      expect(ev.changes.join(' ')).toContain('Statusul rămâne');
    }
    expect(evaluate({ order: paidOrder({ status: 'completed' }) }).warnings[0]).toContain('Finalizată');
  });

  it('warns (does not block) once the request may already be filed, and recomputes the term', () => {
    const ev = evaluate({ order: paidOrder({ status: 'submitted_to_institution' }) });
    expect(ev.eligible).toBe(true);
    expect(ev.warnings).toHaveLength(1);
    expect(ev.warnings[0]).toContain('corectează doar evidența');
    expect(ev.keepEstimate).toBe(false);
  });

  it('blocks inactive, hub, same and other-brand targets', () => {
    expect(evaluate({ target: { ...fiscal, is_active: false } }).eligible).toBe(false);
    expect(evaluate({ target: { ...fiscal, slug: 'cazier-judiciar', config: { is_hub_page: true } } }).eligible).toBe(false);
    expect(evaluate({ target: judiciarPF }).eligible).toBe(false);
    expect(evaluate({ brandSellsTarget: false }).eligible).toBe(false);
  });

  it('blocks instant automated services (extras CF, plan cadastral, constatator)', () => {
    const toCf = evaluate({ target: extrasCF });
    expect(toCf.eligible).toBe(false);
    expect(toCf.blockers.join(' ')).toContain('emise automat');
    expect(evaluate({ source: extrasCF }).eligible).toBe(false);
    // even from an imobiliare service at the same price
    const fromCopie = evaluateImob({ target: { ...extrasCF, base_price: '216.59', verification_config: propVc() } });
    expect(fromCopie.eligible).toBe(false);
    expect(fromCopie.family).toBe('other');
    expect(fromCopie.blockers.join(' ')).toContain('emise automat');
  });

  it('blocks lawyer ↔ imobiliare cross switches in both directions', () => {
    const toImob = evaluate({ target: { ...copieIntabulare, base_price: '198.00' }, targetOptions: [] });
    expect(toImob.eligible).toBe(false);
    expect(toImob.blockers.join(' ')).toContain('aceeași familie');
    const toLawyer = evaluateImob({ target: { ...fiscal, base_price: '216.59' } });
    expect(toLawyer.eligible).toBe(false);
    expect(toLawyer.blockers.join(' ')).toContain('aceeași familie');
  });

  it('blocks an option the target does not offer (inactive urgență at fiscal)', () => {
    const ev = evaluate({
      order: paidOrder({ selected_options: [{ code: 'urgenta', option_name: 'Procesare Urgentă', price_modifier: 80 }] }),
    });
    expect(ev.eligible).toBe(false);
    expect(ev.blockers[0]).toContain('Procesare Urgentă');
  });

  it('ignores custom extras and bundled children when checking options', () => {
    const ev = evaluate({
      order: paidOrder({
        selected_options: [
          { code: 'custom_extra', optionName: 'DHL', priceModifier: 250 },
          { code: 'addon_x', bundled_for: { parent_option_id: 'p' } },
          { code: 'traducere', price_modifier: 178.5 },
        ],
      }),
    });
    expect(ev.eligible).toBe(true);
  });

  it('blocks person ↔ company switches', () => {
    expect(evaluate({ target: judiciarPJ }).eligible).toBe(false);
    expect(evaluate({ source: judiciarPJ, target: fiscal }).eligible).toBe(false);
  });

  it('blocks civil-status targets without civil data (and price)', () => {
    const ev = evaluate({ target: { ...nastere, base_price: 198 } });
    expect(ev.eligible).toBe(false);
    expect(ev.blockers.join(' ')).toContain('stare civilă');
  });

  it('cazier auto: asks to confirm a Romanian licence, then lists the permis photo as to-do', () => {
    const before = evaluate({ target: auto, targetOptions: [] });
    expect(before.eligible).toBe(false);
    expect(before.needsLicenseConfirmation).toBe(true);
    expect(before.blockers.join(' ')).toContain('permisului');

    const after = evaluate({ target: auto, targetOptions: [], licenseConfirmedRomanian: true });
    expect(after.eligible).toBe(true);
    expect(after.todo.join(' ')).toContain('Permis de conducere');
  });

  it('cazier auto: a foreign licence is never same-price', () => {
    const ev = evaluate({
      target: auto,
      targetOptions: [],
      licenseConfirmedRomanian: true,
      order: paidOrder({ customer_data: { personal: { cnp: '0000000000000' }, vehicle: { licenseIssuedAbroad: true } } }),
    });
    expect(ev.eligible).toBe(false);
  });

  it('auto → fiscal: missing signature and parents are to-dos, not blockers', () => {
    const ev = evaluate({
      source: auto,
      target: judiciarPF,
      targetOptions: [],
      order: paidOrder({ customer_data: { personal: { cnp: '0000000000000' } } }),
    });
    expect(ev.eligible).toBe(true);
    expect(ev.todo.join(' ')).toContain('semnătura');
    expect(ev.todo.join(' ')).toContain('părinților');
  });
});

describe('evaluateServiceSwitch — imobiliare prin topograf', () => {
  it('allows copie intabulare → copie contract vânzare at the same price, same topograf', () => {
    const ev = evaluateImob();
    expect(ev.blockers).toEqual([]);
    expect(ev.eligible).toBe(true);
    expect(ev.family).toBe('property');
    expect(ev.changes.join(' ')).toContain('același topograf');
  });

  it('allows identificare imobil ↔ identificare după proprietar with only an address', () => {
    const ev = evaluateImob({
      source: identImobil,
      target: identProprietar,
      order: imobOrder({ base_price: 298 }, { property: { county: 'Cluj', locality: 'Dej', propertyAddress: 'Str. Y 2' } }),
    });
    expect(ev.blockers).toEqual([]);
  });

  it('blocks an identificare → copie switch when the order has no CF number', () => {
    const ev = evaluateImob({
      source: { ...identImobil, base_price: '216.59' },
      order: imobOrder({}, { property: { ...property, carteFunciara: '' , propertyAddress: 'Str. Y 2' } }),
    });
    expect(ev.eligible).toBe(false);
    expect(ev.blockers.join(' ')).toContain('carte funciară');
  });

  it('blocks when the convention owner data is missing at the target', () => {
    const ev = evaluateImob({ order: imobOrder({}, { property: { county: 'Cluj', locality: 'Dej', carteFunciara: '1' } }) });
    expect(ev.eligible).toBe(false);
    expect(ev.blockers.join(' ')).toContain('convenția');
  });

  it('blocks once the topograf filed at OCPI', () => {
    const ev = evaluateImob({ order: imobOrder({}, { ocpi_submission: { registration_number: '69000', submitted_at: '2026-10-30' } }) });
    expect(ev.eligible).toBe(false);
    expect(ev.blockers.join(' ')).toContain('depus deja cererea la OCPI (nr. 69000)');
  });

  it('blocks once the topograf reported an identification or uploaded the document', () => {
    expect(evaluateImob({ order: imobOrder({}, { identified_property: { cf: '1' } }) }).eligible).toBe(false);
    expect(evaluateImob({ existingDocTypes: ['contract_prestari', 'collaborator-document'] }).eligible).toBe(false);
  });

  it('blocks a completed imobiliare order (the work at OCPI is done)', () => {
    const ev = evaluateImob({ order: imobOrder({ status: 'completed' }) });
    expect(ev.eligible).toBe(false);
    expect(ev.blockers.join(' ')).toContain('Finalizată');
  });

  it('blocks when an ANCPI job already started', () => {
    for (const job of [
      { id: 'j1', status: 'PROCESSING', ancpi_order_id: null },
      { id: 'j1', status: 'PENDING', ancpi_order_id: '10054451' },
      { id: 'j1', status: 'NEEDS_OPERATOR', ancpi_order_id: null },
    ]) {
      const ev = evaluateImob({ ancpiJob: job });
      expect(ev.eligible).toBe(false);
      expect(ev.blockers.join(' ')).toContain('Robotul ANCPI');
      expect(ev.deletePendingAncpiJobId).toBeNull();
    }
  });

  it('a queued, never-started ANCPI job is deleted on apply', () => {
    const ev = evaluateImob({ ancpiJob: { id: 'j1', status: 'PENDING', ancpi_order_id: null } });
    expect(ev.eligible).toBe(true);
    expect(ev.deletePendingAncpiJobId).toBe('j1');
    expect(ev.changes.join(' ')).toContain('se șterge');
  });

  it('blocks when the topograf handling the order does not work on the target', () => {
    const ev = evaluateImob({ targetCollaboratorIds: [] });
    expect(ev.eligible).toBe(false);
    expect(ev.blockers.join(' ')).toContain('portalul lui');
  });

  it('a per-order collaborator assignment survives the switch', () => {
    const ev = evaluateImob({
      order: imobOrder({ assigned_collaborator_id: 'mircea' }),
      sourceCollaboratorIds: [],
      targetCollaboratorIds: [],
    });
    expect(ev.eligible).toBe(true);
  });
});

describe('remapSelectedOptions', () => {
  it('points catalog options at the target ids and keeps paid prices', () => {
    const out = remapSelectedOptions(
      [
        { code: 'traducere', option_id: 'old', price_modifier: 178.5 },
        { code: 'custom_extra', optionId: 'custom-1', priceModifier: 250 },
      ],
      opts('fiscal', [['traducere']])
    );
    expect(out[0]).toMatchObject({ option_id: 'fiscal-traducere', price_modifier: 178.5 });
    expect(out[1]).toMatchObject({ optionId: 'custom-1' });
  });
});

describe('describeDocumentImpact', () => {
  it('judiciar → auto: regenerate docs, the cerere is no longer used', () => {
    const imp = describeDocumentImpact(judiciarPF, auto, ['contract_prestari', 'imputernicire', 'cerere_eliberare_pf', 'collaborator-document']);
    expect(imp.toRegenerate.map((d) => d.type)).toEqual(['contract_prestari', 'imputernicire', 'cerere_eliberare_pf']);
    expect(imp.targetHasCerere).toBe(false);
    expect(imp.notes.join(' ')).toContain('nu se mai folosește');
  });

  it('imobiliare: the convention is regenerated, no Barou numbers', () => {
    const imp = describeDocumentImpact(copieIntabulare, copieContract, ['contract_prestari', 'conventie', 'collaborator-document']);
    expect(imp.toRegenerate.map((d) => d.type)).toEqual(['contract_prestari', 'conventie']);
    expect(imp.notes.join(' ')).toContain('fără numere de Barou');
    expect(imp.notes.join(' ')).not.toContain('cerere de eliberare');
  });

  it('auto → fiscal: a cerere is now needed', () => {
    const imp = describeDocumentImpact(auto, fiscal, []);
    expect(imp.toRegenerate).toEqual([]);
    expect(imp.notes.join(' ')).toContain('are nevoie de cerere');
  });
});

describe('invoiceNote', () => {
  it('names the invoice and who redoes it', () => {
    expect(invoiceNote('EGH-0001', 'Cazier Judiciar')).toContain('Raul / contabila');
    expect(invoiceNote(null, 'X')).toContain('nu are încă factură');
  });
});
