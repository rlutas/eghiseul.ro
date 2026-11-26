import { describe, expect, it } from 'vitest';
import PizZip from 'pizzip';
import {
  fieldsForKinds,
  missingIdentityFields,
  placeholderData,
  prefillFields,
  renderSignableDocx,
  sanitizeFields,
} from '@/lib/signature-requests/documents';
import { checkIdentity, effectiveFields, parseRequestInput, type SignatureRequestRow } from '@/lib/signature-requests/service';

/**
 * Documente de semnat: what the client signs after the order. The documents go
 * to OCPI, so the checks run on the generated DOCX text, not only on helpers.
 * All data below is fictional.
 */

function docxText(buffer: Buffer): string {
  const xml = new PizZip(buffer).file('word/document.xml')?.asText() || '';
  return xml.replace(/<w:p[ >]/g, '\n<w:p ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

const VALID_CNP = '1900101401233';

const order = () => ({
  friendly_order_id: 'E-260101-TEST1',
  created_at: '2026-08-13T08:00:00Z',
  total_price: 198,
  customer_data: {
    contact: { email: 'client@example.com', phone: '+40700000000' },
    billing: { firstName: 'Ion', lastName: 'Popescu', cnp: VALID_CNP, city: 'Otopeni', county: 'Ilfov', address: 'Str. Exemplu nr. 1' },
    property: { county: 'București', locality: 'București Sectorul 4', carteFunciara: '', cadastral: '' },
    identified_property: { county: 'București', locality: 'București Sectorul 4', carteFunciara: '123456', cadastral: '123456' },
  },
  services: { name: 'Identificare Imobile după Proprietar', verification_config: null },
});

const fullFields = () => ({
  ...prefillFields(order(), { email: 'topograf@example.com', phone: '0711111111' }, new Date('2026-11-26T10:00:00Z')),
  ci_serie: 'XX',
  ci_numar: '123456',
  imobil_adresa: 'str. Test nr. 7',
  documente_solicitate: 'Act notarial nr. 1 din 01.01.2024 emis de notar Exemplu',
});

describe('prefillFields', () => {
  it('takes the identified property over what the client typed, and the topograph contact when he asks', () => {
    const f = prefillFields(order(), { email: 'topograf@example.com', phone: '0711111111' }, new Date('2026-11-26T10:00:00Z'));
    expect(f.nume).toBe('Popescu Ion');
    expect(f.cnp).toBe(VALID_CNP);
    expect(f.cf_numar).toBe('123456');
    expect(f.ocpi).toBe('BUCUREȘTI');
    expect(f.bcpi).toBe('SECTORUL 4');
    expect(f.email).toBe('topograf@example.com');
    expect(f.onorariu).toBe('198,00 lei, TVA inclus');
    expect(f.data_contract).toBe('13.08.2026');
    expect(f.data_termen).toBe('26.11.2026');
    expect(f.executant_nume).toBeTruthy();
  });

  it('falls back to the client contact when the team asks', () => {
    expect(prefillFields(order(), null).email).toBe('client@example.com');
  });

  it('reports the missing ID data (the property services never collect it)', () => {
    const f = prefillFields(order(), null);
    expect(missingIdentityFields(f)).toEqual(['ci_serie', 'ci_numar']);
  });
});

describe('sanitizeFields / parseRequestInput', () => {
  it('keeps only the known keys of the chosen documents and valid choices', () => {
    const out = sanitizeFields(['conventie'], { nume: ' A ', ocpi: 'X', onorariu: 5, evil: '<x>' });
    expect(out).toEqual({ nume: 'A', onorariu: '5' });
    expect(sanitizeFields(['cerere-arhiva-ocpi'], { comunicare: 'telegraf' })).toEqual({});
  });

  it('refuses a request without documents', () => {
    expect(parseRequestInput({ kinds: ['altceva'] }).ok).toBe(false);
    const ok = parseRequestInput({ kinds: ['conventie', 'conventie'], askIdentity: true });
    expect(ok.ok && ok.data.kinds).toEqual(['conventie']);
  });

  it('a field shared by both documents appears once', () => {
    const keys = fieldsForKinds(['cerere-arhiva-ocpi', 'conventie']).map((f) => f.key);
    expect(keys.filter((k) => k === 'nume')).toHaveLength(1);
  });
});

describe('renderSignableDocx', () => {
  it('fills the OCPI archive request completely (no placeholder left)', () => {
    const text = docxText(renderSignableDocx('cerere-arhiva-ocpi', fullFields(), { orderNumber: 'E-260101-TEST1' }));
    expect(text).not.toContain('{{');
    expect(text).toContain('OFICIUL DE CADASTRU ȘI PUBLICITATE IMOBILIARĂ BUCUREȘTI');
    expect(text).toContain('BIROUL DE CADASTRU ȘI PUBLICITATE IMOBILIARĂ SECTORUL 4');
    expect(text).toContain('Popescu Ion');
    expect(text).toContain(VALID_CNP);
    expect(text).toContain('Act notarial nr. 1 din 01.01.2024');
    expect(text).toContain('e-mail [x]');
    expect(text).toContain('prin poștă [ ]');
    expect(text).toContain('Previzualizare');
  });

  it('fills the convention with the term date and the contract date kept apart', () => {
    const text = docxText(renderSignableDocx('conventie', fullFields(), { orderNumber: 'E-260101-TEST1' }));
    expect(text).not.toContain('{{');
    expect(text).toContain('începând cu data 26.11.2026');
    expect(text).toContain('nr. E-260101-TEST1 din 13.08.2026');
    expect(text).toContain('198,00 lei, TVA inclus');
    expect(text).toContain('CF nr. 123456');
  });

  it('leaves dotted blanks, not holes, for empty fields', () => {
    const data = placeholderData({}, { orderNumber: 'X' });
    expect(data.CNP).toBe('……………');
    expect(data.SEMNATURA_CLIENT).toBe('');
  });

  it('embeds the signature image and the audit line when signed', () => {
    // 1×1 transparent PNG
    const png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const buffer = renderSignableDocx('cerere-arhiva-ocpi', fullFields(), {
      orderNumber: 'E-260101-TEST1',
      signatureBase64: png,
      signedAt: new Date('2026-11-26T10:00:00Z'),
      ip: '203.0.113.7',
    });
    const zip = new PizZip(buffer);
    expect(zip.file('word/media/signature_client.png')).toBeTruthy();
    const text = docxText(buffer);
    expect(text).not.toContain('SIG_CLIENT');
    expect(text).toContain('Semnat electronic de Popescu Ion');
    expect(text).toContain('IP 203.0.113.7');
  });
});

describe('identity completed by the client', () => {
  const row = (ask: boolean): SignatureRequestRow => ({
    id: '00000000-0000-0000-0000-000000000001',
    order_id: '00000000-0000-0000-0000-000000000002',
    kinds: ['conventie'],
    fields: { nume: 'Popescu Ion', onorariu: '198 lei' },
    ask_identity: ask,
    note: null,
    status: 'pending',
    requested_by: null,
    requested_by_type: 'collaborator',
    requested_by_name: 'Topograf',
    signed_at: null,
    signature_metadata: null,
    signed_document_ids: null,
    created_at: '2026-11-26T10:00:00Z',
  });

  it('takes the identity the client typed only when the request asks for it — never the other fields', () => {
    const typed = { nume: 'Popescu Ion Dan', cnp: VALID_CNP, onorariu: '0 lei' };
    expect(effectiveFields(row(true), typed)).toMatchObject({ nume: 'Popescu Ion Dan', cnp: VALID_CNP, onorariu: '198 lei' });
    expect(effectiveFields(row(false), typed).nume).toBe('Popescu Ion');
  });

  it('rejects an invalid CNP and missing ID data', () => {
    const ok = { nume: 'A', cnp: VALID_CNP, ci_serie: 'XX', ci_numar: '1', dom_localitate: 'B', dom_adresa: 'C' };
    expect(checkIdentity(ok)).toBeNull();
    expect(checkIdentity({ ...ok, cnp: '1900101401234' })).toMatch(/CNP/);
    expect(checkIdentity({ ...ok, ci_numar: '' })).toMatch(/Completează/);
  });
});
