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

  it('blocks a different base price and points the team to Modifică', () => {
    const ev = evaluate({ target: { ...fiscal, base_price: 219 } });
    expect(ev.eligible).toBe(false);
    expect(ev.basePriceDelta).toBe(21);
    expect(ev.blockers.join(' ')).toContain('Modifică');
  });

  it('compares the paid base, not the total — a coupon does not block', () => {
    // Coupons live in discount_amount/total_price; base_price stays the list price.
    const ev = evaluate({ order: paidOrder({ base_price: 198 }) });
    expect(ev.eligible).toBe(true);
  });

  it('blocks unpaid, cancelled, refunded and completed orders', () => {
    expect(evaluate({ order: paidOrder({ payment_status: 'unpaid' }) }).eligible).toBe(false);
    for (const status of ['cancelled', 'refunded', 'completed', 'shipped']) {
      expect(evaluate({ order: paidOrder({ status }) }).eligible).toBe(false);
    }
  });

  it('warns (does not block) once the request may already be filed', () => {
    const ev = evaluate({ order: paidOrder({ status: 'submitted_to_institution' }) });
    expect(ev.eligible).toBe(true);
    expect(ev.warnings).toHaveLength(1);
  });

  it('blocks inactive, hub, same and other-brand targets', () => {
    expect(evaluate({ target: { ...fiscal, is_active: false } }).eligible).toBe(false);
    expect(evaluate({ target: { ...fiscal, slug: 'cazier-judiciar', config: { is_hub_page: true } } }).eligible).toBe(false);
    expect(evaluate({ target: judiciarPF }).eligible).toBe(false);
    expect(evaluate({ brandSellsTarget: false }).eligible).toBe(false);
  });

  it('blocks instant automated services and non-lawyer services', () => {
    const toCf = evaluate({ target: extrasCF });
    expect(toCf.eligible).toBe(false);
    expect(toCf.blockers.join(' ')).toContain('emise automat');
    const fromCf = evaluate({ source: extrasCF });
    expect(fromCf.eligible).toBe(false);
    const imob = evaluate({ target: { ...extrasCF, slug: 'copie-intabulare' } });
    expect(imob.blockers.join(' ')).toContain('prin avocat');
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
