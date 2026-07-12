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
});
