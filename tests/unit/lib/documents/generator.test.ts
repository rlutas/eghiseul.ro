import { describe, expect, it } from 'vitest';
import {
  buildClientDetailsBlock,
  hasUrgentOption,
  buildDeliveryTerms,
  buildInstitutie,
  buildCIInfo,
  buildOptionsText,
} from '@/lib/documents/generator';

// These helpers produce the actual TEXT that ends up in legal contracts.
// A regression here = wrong contract content sent to clients (signed and
// archived as legal proof). Critical for legal validity.

describe('buildClientDetailsBlock — PF (persoană fizică)', () => {
  const baseClient = {
    name: 'POPESCU ION',
    firstName: 'ION',
    lastName: 'POPESCU',
    cnp: '1820507211209',
    ci_series: 'SM',
    ci_number: '584285',
    document_issued_by: 'SPCLEP Slobozia',
    email: 'ion@example.com',
    phone: '+40712345678',
    is_pj: false,
  };

  it('produces the canonical Romanian legal identification format', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      address_parts: { street: 'Bujorului', number: '2', city: 'Slobozia', county: 'Ialomița' },
    });

    expect(text).toContain('POPESCU ION');
    expect(text).toContain('legitimat/ă cu CI seria SM nr. 584285');
    expect(text).toContain('emisă de SPCLEP Slobozia');
    expect(text).toContain('CNP 1820507211209');
    expect(text).toContain('cu domiciliul în');
    expect(text).toContain('Str. Bujorului');
    expect(text).toContain('Localitatea Slobozia');
    expect(text).toContain('Jud. Ialomița');
  });

  it('omits CI emisă de when document_issued_by is missing', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      document_issued_by: undefined,
    });
    expect(text).toContain('legitimat/ă cu CI seria SM nr. 584285');
    expect(text).not.toContain('emisă de');
  });

  it('builds a full structured address with optional bloc/scară/etaj/ap', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      address_parts: {
        street: 'Aleea Florilor', number: '12', building: 'A1', staircase: 'B',
        floor: '2', apartment: '15', city: 'București', county: 'Sector 3',
      },
    });
    expect(text).toContain('Str. Aleea Florilor, Nr. 12, Bl. A1, Sc. B, Et. 2, Ap. 15');
    expect(text).toContain('Localitatea București');
    expect(text).toContain('Jud. Sector 3');
  });

  it('falls back to flat address string when address_parts not provided', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      address: 'Str. Test 1, București',
    });
    expect(text).toContain('cu domiciliul în Str. Test 1, București');
  });

  it('uses firstName + lastName when canonical "name" is empty', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      name: '',
      firstName: 'ION',
      lastName: 'POPESCU',
    });
    expect(text).toContain('ION POPESCU');
  });

  it('omits CI block entirely when both series and number missing', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      ci_series: undefined,
      ci_number: undefined,
    });
    expect(text).not.toContain('legitimat');
    expect(text).toContain('CNP 1820507211209'); // CNP still present
  });

  it('omits CNP block when CNP missing (foreign citizen flow)', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      cnp: undefined,
    });
    expect(text).not.toContain('CNP');
  });
});

describe('buildClientDetailsBlock — PJ (persoană juridică)', () => {
  const basePJ = {
    name: 'ACME SRL',
    firstName: 'ION',
    lastName: 'POPESCU',
    cnp: '1820507211209',
    ci_series: 'IF',
    ci_number: '999999',
    company_name: 'ACME SRL',
    cui: 'RO12345678',
    company_reg: 'J40/1234/2020',
    company_address: 'Str. Test 1, București',
    email: 'office@acme.ro',
    phone: '+40212345678',
    is_pj: true,
  };

  it('starts with company name + CUI + Reg. Com. + sediu', () => {
    const text = buildClientDetailsBlock(basePJ);
    expect(text).toContain('ACME SRL');
    expect(text).toContain('CUI: RO12345678');
    expect(text).toContain('Nr. Reg. Com.: J40/1234/2020');
    expect(text).toContain('cu sediul în Str. Test 1, București');
  });

  it('appends representative with full CI + CNP (legal requirement for PJ)', () => {
    const text = buildClientDetailsBlock(basePJ);
    expect(text).toContain('reprezentată prin ION POPESCU');
    expect(text).toContain('legitimat/ă cu CI seria IF nr. 999999');
    expect(text).toContain('CNP 1820507211209');
  });

  it('omits representative block when name + firstName + lastName all empty', () => {
    const text = buildClientDetailsBlock({
      ...basePJ,
      firstName: '',
      lastName: '',
    });
    expect(text).not.toContain('reprezentată prin');
  });
});

describe('hasUrgentOption', () => {
  it('returns true when any option name contains "urgent" (case-insensitive)', () => {
    expect(hasUrgentOption([{ option_name: 'Procesare Urgentă' }])).toBe(true);
    expect(hasUrgentOption([{ optionName: 'URGENT delivery' }])).toBe(true);
    expect(hasUrgentOption([{ option_name: 'urgentă' }])).toBe(true);
  });

  it('returns false when no urgent option present', () => {
    expect(hasUrgentOption([{ option_name: 'Apostila Haga' }])).toBe(false);
    expect(hasUrgentOption([{ option_name: 'Traducere' }])).toBe(false);
  });

  it('returns false for empty / undefined options', () => {
    expect(hasUrgentOption()).toBe(false);
    expect(hasUrgentOption([])).toBe(false);
    expect(hasUrgentOption(undefined)).toBe(false);
  });

  it('reads both snake_case (DB) and camelCase (wizard state) field names', () => {
    expect(hasUrgentOption([{ option_name: 'urgent' }])).toBe(true);
    expect(hasUrgentOption([{ optionName: 'urgent' }])).toBe(true);
  });
});

describe('buildDeliveryTerms', () => {
  // Helper: build a minimal order context. The function only reads the
  // delivery-relevant fields; the rest are required by the type but unused.
  type OrderArg = Parameters<typeof buildDeliveryTerms>[0];
  const order = (extra: Partial<OrderArg> = {}): OrderArg => ({
    order_number: 'X',
    friendly_order_id: 'X',
    total_price: 0,
    service_name: 'X',
    service_price: 0,
    created_at: '2026-04-27',
    ...extra,
  });

  it('renders standard term in singular when estimated_days = 1', () => {
    const text = buildDeliveryTerms(order({ estimated_days: 1 }), []);
    expect(text).toContain('1 zi lucrătoare');
    expect(text).not.toContain('1 zile');
  });

  it('renders standard term in plural when estimated_days > 1', () => {
    const text = buildDeliveryTerms(order({ estimated_days: 5 }), []);
    expect(text).toContain('5 zile lucrătoare');
  });

  it('uses urgent_days when urgent option selected and urgent_available=true', () => {
    const text = buildDeliveryTerms(
      order({ estimated_days: 5, urgent_days: 2, urgent_available: true }),
      [{ option_name: 'Procesare urgentă' }],
    );
    expect(text).toContain('2 zile lucrătoare (procesare urgentă)');
    expect(text).not.toContain('5 zile lucrătoare');
  });

  it('falls back to estimated when urgent option selected but service NOT urgent_available', () => {
    const text = buildDeliveryTerms(
      order({ estimated_days: 5, urgent_days: 2, urgent_available: false }),
      [{ option_name: 'Procesare urgentă' }],
    );
    expect(text).toContain('5 zile lucrătoare');
    expect(text).not.toContain('procesare urgentă');
  });

  it('always appends the 10-day extension disclaimer', () => {
    const text = buildDeliveryTerms(order({ estimated_days: 3 }), []);
    expect(text).toContain('verificări suplimentare');
    expect(text).toContain('10 zile lucrătoare');
  });

  it('returns generic fallback when no estimated_days nor urgent_days configured', () => {
    const text = buildDeliveryTerms(order(), []);
    expect(text).toContain('comunicat de prestator');
  });
});

describe('buildInstitutie', () => {
  it.each([
    ['cazier-judiciar', 'IPJ SATU MARE - CAZIER JUDICIAR'],
    ['cazier-judiciar-persoana-fizica', 'IPJ SATU MARE - CAZIER JUDICIAR'],
    ['cazier-judiciar-persoana-juridica', 'IPJ SATU MARE - CAZIER JUDICIAR'],
    ['cazier-auto', 'IPJ SATU MARE - CAZIER AUTO'],
    ['cazier-fiscal', 'ANAF SATU MARE'],
    ['certificat-nastere', 'OFICIUL DE STARE CIVILĂ'],
    ['certificat-casatorie', 'OFICIUL DE STARE CIVILĂ'],
    ['certificat-celibat', 'OFICIUL DE STARE CIVILĂ'],
    ['certificat-integritate-comportamentala', 'IPJ SATU MARE - CAZIER JUDICIAR'],
    ['extras-carte-funciara', 'OCPI SATU MARE'],
    ['certificat-constatator', 'ONRC SATU MARE'],
  ])('maps service slug "%s" → "%s"', (slug, expected) => {
    expect(buildInstitutie(slug)).toBe(expected);
  });

  it('returns the slug as-is when no mapping exists (graceful fallback)', () => {
    expect(buildInstitutie('serviciu-nou')).toBe('serviciu-nou');
  });

  it('returns empty string for missing slug', () => {
    expect(buildInstitutie()).toBe('');
    expect(buildInstitutie(undefined)).toBe('');
  });
});

describe('buildCIInfo', () => {
  const ciBase = { name: 'X', email: 'x@x.com', phone: '+40700000000', is_pj: false };

  it('produces "seria X nr. Y emisă de Z" when all parts present', () => {
    expect(buildCIInfo({
      ...ciBase, ci_series: 'SM', ci_number: '584285', document_issued_by: 'SPCLEP Slobozia',
    })).toBe('seria SM nr. 584285 emisă de SPCLEP Slobozia');
  });

  it('omits issuer when missing', () => {
    expect(buildCIInfo({
      ...ciBase, ci_series: 'SM', ci_number: '584285',
    })).toBe('seria SM nr. 584285');
  });

  it('returns empty string when no series and no number', () => {
    expect(buildCIInfo(ciBase)).toBe('');
  });
});

describe('buildOptionsText', () => {
  it('joins option names with comma + space', () => {
    expect(buildOptionsText([
      { option_name: 'Apostila Haga' },
      { option_name: 'Traducere' },
      { optionName: 'Urgentă' }, // camelCase variant
    ])).toBe('Apostila Haga, Traducere, Urgentă');
  });

  it('skips empty / undefined names', () => {
    expect(buildOptionsText([
      { option_name: 'Apostila' },
      { option_name: '' },
      { option_name: undefined },
      { option_name: 'Traducere' },
    ])).toBe('Apostila, Traducere');
  });

  it('returns empty string for empty / undefined options', () => {
    expect(buildOptionsText()).toBe('');
    expect(buildOptionsText([])).toBe('');
  });
});
