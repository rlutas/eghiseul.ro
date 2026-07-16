import { describe, it, expect } from 'vitest';
import { buildOblioClient, getMissingInvoiceClientFields } from '@/lib/oblio/invoice';

describe('buildOblioClient', () => {
  it('issues to the firm for a PJ order (type persoana_juridica) — regression: not N/A', () => {
    // Exact shape stored by the wizard for a company order (E-260614-UKM7K).
    const c = buildOblioClient({
      billing: {
        cui: '47872731',
        type: 'persoana_juridica',
        regCom: 'J2023000314302',
        source: 'company',
        companyName: 'NETHUT DIGITAL S.R.L.',
        companyAddress: 'JUD. SATU MARE, SAT ODOREU COM. ODOREU, STR. SALCÂMILOR, NR.2',
      },
      company: { cui: '47872731', companyName: 'NETHUT DIGITAL S.R.L.', autoCompleteData: { vatPayer: true } },
      contact: { email: 'x@y.ro', phone: '+40700000000' },
    });
    expect(c.name).toBe('NETHUT DIGITAL S.R.L.');
    expect(c.cif).toBe('RO47872731'); // VAT payer → RO prefix
    expect(c.vatPayer).toBe(true);
    expect(c.save).toBe(true);
    expect(c.name).not.toBe('N/A');
  });

  it('does not RO-prefix a non-VAT-payer company', () => {
    const c = buildOblioClient({
      billing: { cui: '12345678', type: 'persoana_juridica', companyName: 'MICĂ SRL' },
      company: { cui: '12345678', autoCompleteData: { vatPayer: false } },
    });
    expect(c.cif).toBe('12345678');
    expect(c.vatPayer).toBe(false);
  });

  it('still supports the legacy type "company"', () => {
    const c = buildOblioClient({ billing: { type: 'company', cui: 'RO99', companyName: 'LEGACY SRL' } });
    expect(c.cif).toBe('RO99');
    expect(c.name).toBe('LEGACY SRL');
  });

  it('treats a bare CUI (no explicit type) as a company', () => {
    const c = buildOblioClient({ billing: { cui: '47872731', companyName: 'FĂRĂ TIP SRL' } });
    expect(c.name).toBe('FĂRĂ TIP SRL');
    expect(c.cif).toContain('47872731');
  });

  it('builds a PF client from billing name + CNP', () => {
    const c = buildOblioClient({
      billing: { type: 'persoana_fizica', firstName: 'Ion', lastName: 'Pop', cnp: '1900101080011' },
    });
    expect(c.name).toBe('Ion Pop');
    expect(c.cif).toBe('1900101080011');
    expect(c.vatPayer).toBe(false);
    expect(c.save).toBe(false);
  });

  it('falls back to KYC personal data for PF "self" billing', () => {
    const c = buildOblioClient({
      billing: { type: 'persoana_fizica', source: 'self' },
      personal: { firstName: 'Ana', lastName: 'Ionescu', cnp: '2900202080022' },
    });
    expect(c.name).toBe('Ana Ionescu');
    expect(c.cif).toBe('2900202080022');
  });
});

describe('buildOblioClient — foreign billing country (facturare pe altă țară)', () => {
  const foreignBilling = {
    type: 'persoana_fizica' as const,
    source: 'other_pf' as const,
    firstName: 'Miklos',
    lastName: 'Nyeste',
    address: 'Anger 5',
    city: 'Töpen',
    country: 'Germania',
  };

  it('passes the country through and defaults state to "-" when no region given', () => {
    const c = buildOblioClient({ billing: foreignBilling });
    expect(c.country).toBe('Germania');
    expect(c.state).toBe('-'); // Oblio FAQ convention for foreign clients
    expect(c.city).toBe('Töpen');
  });

  it('uses the region as state when provided', () => {
    const c = buildOblioClient({ billing: { ...foreignBilling, county: 'Bavaria' } });
    expect(c.state).toBe('Bavaria');
  });

  it('does NOT inherit the buyer\'s KYC CNP for a foreign person without CNP', () => {
    // other_pf abroad without CNP must not get the buyer's CNP on the invoice.
    const c = buildOblioClient({
      billing: foreignBilling,
      personal: { firstName: 'Ana', lastName: 'Ionescu', cnp: '2900202080022' },
    });
    expect(c.cif).toBe('');
  });

  it('keeps the CNP when the foreign-billed person has one (diaspora)', () => {
    const c = buildOblioClient({
      billing: { ...foreignBilling, cnp: '1990623314029' },
    });
    expect(c.cif).toBe('1990623314029');
  });

  it('domestic self billing still falls back to the KYC CNP (regression)', () => {
    const c = buildOblioClient({
      billing: { type: 'persoana_fizica', source: 'self', country: 'Romania' },
      personal: { firstName: 'Ana', lastName: 'Ionescu', cnp: '2900202080022' },
    });
    expect(c.cif).toBe('2900202080022');
    expect(c.state).toBe('');
    expect(c.country).toBe('Romania');
  });
});

describe('getMissingInvoiceClientFields (server-side submit guard)', () => {
  it('flags the E-260712-VQ3WA shape: PF billing with only a partial last name', () => {
    // Exact billing block that reached payment on 2026-07-12 — client typed 4
    // chars of the surname and the wizard's step validation was bypassed.
    const missing = getMissingInvoiceClientFields({
      billing: { type: 'persoana_fizica', source: 'self', lastName: 'Papa' },
      contact: { email: 'x@y.ro', phone: '+40700000000' },
    });
    expect(missing).toContain('numele complet');
    expect(missing).toContain('adresa (stradă, număr)');
    expect(missing).toContain('localitatea');
    expect(missing).toContain('județul');
  });

  it('passes a complete PF billing block (no CNP — CF services keep it optional)', () => {
    const missing = getMissingInvoiceClientFields({
      billing: {
        type: 'persoana_fizica', source: 'self',
        firstName: 'Elena Daniela', lastName: 'Papara',
        address: 'Str. Soarelui 5', city: 'Brasov', county: 'Brașov',
      },
    });
    expect(missing).toEqual([]);
  });

  it('passes an empty PF billing block when KYC personal data is complete (fallback path)', () => {
    // Real paid orders (e.g. E-260708-U5LC9) have a sparse billing block but a
    // full KYC scan — the invoice falls back to personal data and issues fine.
    const missing = getMissingInvoiceClientFields({
      billing: { type: 'persoana_fizica', source: 'self' },
      personal: {
        firstName: 'Ana', lastName: 'Ionescu', cnp: '2900202080022',
        address: { street: 'Str. Lungă 1', city: 'Cluj-Napoca', county: 'Cluj' },
      },
    });
    expect(missing).toEqual([]);
  });

  it('PJ needs only firm name + CUI (Oblio completes the address from ANAF)', () => {
    // Real order E-260710-2S5EH: company billing with no address/city/county —
    // invoice EGH-0022 issued fine.
    const missing = getMissingInvoiceClientFields({
      billing: { type: 'persoana_juridica', source: 'company', companyName: 'DAMPOP DISTRIBUTION SRL', cui: '22111530' },
    });
    expect(missing).toEqual([]);
  });

  it('flags a PJ billing block missing the CUI', () => {
    const missing = getMissingInvoiceClientFields({
      billing: { type: 'persoana_juridica', source: 'company', companyName: 'FĂRĂ CUI SRL' },
    });
    expect(missing).toEqual(['CUI-ul firmei']);
  });

  it('passes a foreign PF billing block without county and without CNP', () => {
    // The '-' state fallback keeps the guard satisfied — no relaxation needed.
    const missing = getMissingInvoiceClientFields({
      billing: {
        type: 'persoana_fizica', source: 'other_pf',
        firstName: 'Miklos', lastName: 'Nyeste',
        address: 'Anger 5', city: 'Töpen', country: 'Germania',
      },
    });
    expect(missing).toEqual([]);
  });

  it('still flags a domestic PF billing block missing the county', () => {
    const missing = getMissingInvoiceClientFields({
      billing: {
        type: 'persoana_fizica', source: 'self',
        firstName: 'Ion', lastName: 'Pop',
        address: 'Str. Lungă 1', city: 'Cluj-Napoca', country: 'Romania',
      },
    });
    expect(missing).toEqual(['județul']);
  });
});
