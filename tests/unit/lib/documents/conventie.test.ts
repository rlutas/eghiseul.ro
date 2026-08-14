import { describe, expect, it } from 'vitest';
import PizZip from 'pizzip';
import {
  buildObiectLucrare,
  generateDocument,
  type DocumentContext,
} from '@/lib/documents/generator';

/**
 * Convenția cu topograful („angajament de execuție documentație").
 *
 * E documentul prin care clientul îl împuternicește pe executant să ceară date
 * din arhiva BCPI și să depună documentația în numele lui — pe serviciile
 * imobiliare ține locul împuternicirii avocațiale. Dacă identificarea
 * imobilului sau a proprietarului iese greșită, documentul e inutilizabil la
 * OCPI, deci conținutul se verifică pe DOCX-ul generat, nu doar pe helperi.
 */

/** Textul vizibil din DOCX-ul generat (fără markup). */
function docxText(buffer: Buffer): string {
  const xml = new PizZip(buffer).file('word/document.xml')?.asText() || '';
  return xml
    .replace(/<w:p[ >]/g, '\n<w:p ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const baseContext = (): DocumentContext => ({
  client: {
    name: 'IMBREA ALINA',
    firstName: 'ALINA',
    lastName: 'IMBREA',
    cnp: '',
    email: 'alina@example.com',
    phone: '0712345678',
    address: 'Str. Grivitei nr. 1, ap. 5, Prajila, jud. Vâlcea',
    is_pj: false,
  },
  company: {
    name: 'EDIGITALIZARE SRL',
    cui: 'RO12345678',
    registration_number: 'J30/123/2024',
    address: 'Str. Mihai Viteazu nr. 20A, Satu Mare',
    iban: 'RO00XXXX',
    bank: 'Banca',
    email: 'contact@eghiseul.ro',
    phone: '0700000000',
  },
  order: {
    order_number: 'ord-1',
    friendly_order_id: 'E-260810-EP896',
    total_price: 216.59,
    service_name: 'Plan de Amplasament și Delimitare',
    service_slug: 'plan-amplasament-delimitare',
    service_price: 216.59,
    created_at: '2026-08-10T10:00:00.000Z',
  },
  client_ip: '172.225.225.14',
  property: {
    county: 'Vâlcea',
    locality: 'Baile Govora',
    carteFunciara: '35923',
    cadastral: '35923',
    motiv: 'Verificare',
    beneficiaryName: 'POPESCU ION',
    beneficiaryAddress: 'Str. Grivitei nr. 1, ap. 5, Prajila, jud. Vâlcea',
    beneficiaryCnp: '2850101385566',
    beneficiaryIdSeries: 'VX',
    beneficiaryIdNumber: '123456',
    imobilLocality: 'Prajila',
    imobilStreet: 'Grivitei nr. 1',
  },
  conventie: {
    executantName: 'Dumitrean Mircea Adrian',
    executantAuthorization: 'Seria RO-SM-F nr. 0092/2013',
  },
});

describe('conventie — DOCX generat', () => {
  it('identifică imobilul și proprietarul din datele comenzii', () => {
    const text = docxText(
      generateDocument('plan-amplasament-delimitare', 'conventie', baseContext())
    );

    expect(text).toContain('ANGAJAMENT DE EXECUȚIE DOCUMENTAȚIE');
    // Proprietarul din CF, nu plătitorul comenzii.
    expect(text).toContain('POPESCU ION');
    expect(text).toContain('2850101385566');
    expect(text).toContain('seria VX nr. 123456');
    expect(text).toContain('CF nr. 35923');
    expect(text).toContain('UAT Baile Govora');
    expect(text).toContain('Localitatea Prajila');
    expect(text).toContain('str. Grivitei nr. 1');
    expect(text).toContain('Dumitrean Mircea Adrian');
    expect(text).toContain('Seria RO-SM-F nr. 0092/2013');
  });

  it('trece onorariul exact cât a plătit clientul', () => {
    const text = docxText(
      generateDocument('plan-amplasament-delimitare', 'conventie', baseContext())
    );
    expect(text).toContain('216,59 lei');
    expect(text).toContain('E-260810-EP896');
  });

  it('lasă puncte de completat acolo unde clientul nu a dat datele', () => {
    const ctx = baseContext();
    ctx.property = { ...ctx.property, beneficiaryCnp: '', beneficiaryIdSeries: '', beneficiaryIdNumber: '', imobilStreet: '' };
    const text = docxText(generateDocument('plan-amplasament-delimitare', 'conventie', ctx));

    // Fraza rămâne citibilă, cu spații punctate — nu „CNP  și având seria  nr. ."
    expect(text).toContain('identificat cu CNP ……………');
    expect(text).not.toMatch(/CNP\s+și având/);
  });

  it('nu inventează executantul când configurarea lipsește', () => {
    const ctx = baseContext();
    ctx.conventie = null;
    const text = docxText(generateDocument('plan-amplasament-delimitare', 'conventie', ctx));
    expect(text).not.toContain('Dumitrean');
  });
});

describe('buildObiectLucrare', () => {
  it('folosește numele serviciului comandat', () => {
    expect(buildObiectLucrare(baseContext())).toBe(
      'Obținerea Plan de Amplasament și Delimitare (scop: Verificare)'
    );
  });

  it('fără scop declarat, rămâne doar lucrarea', () => {
    const ctx = baseContext();
    ctx.property = { ...ctx.property, motiv: '' };
    expect(buildObiectLucrare(ctx)).toBe('Obținerea Plan de Amplasament și Delimitare');
  });
});
