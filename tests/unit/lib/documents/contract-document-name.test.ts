import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import PizZip from 'pizzip';
import { generateDocument } from '@/lib/documents/generator';
import { LAWYER_SERVICE_SLUGS } from '@/lib/documents/no-lawyer-services';
import { contractDocumentGenitive, DOCUMENT_GENITIVE_FALLBACK } from '@/lib/documents/contract-document-name';

/**
 * „Contractul se încheie pe durata obținerii cazierului judiciar." era text fix
 * în contractul de asistență, deci apărea și pe certificat de celibat, cazier
 * fiscal etc. Semnalat de client pe E-261028-LJ9V3 (12.11.2026).
 */
const TEMPLATES_DIR = join(process.cwd(), 'src', 'templates');
const textOf = (buf: Buffer) => new PizZip(buf).file('word/document.xml')!.asText().replace(/<[^>]+>/g, '');

const ctx = (slug: string) =>
  ({
    order: { total_price: 0, service_price: 0, order_number: 'E-TEST', service_name: 'Test', service_slug: slug },
    company: {},
    lawyer: {},
    client: { name: 'Ion Test', email: 'test@example.com', phone: '+40740000000' },
    document_numbers: { contract_number: 1 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

describe('contract asistență — documentul din fraza de durată', () => {
  for (const rel of [
    'shared/contract-asistenta.docx',
    'cazier-judiciar/contract-asistenta.docx',
    'shared/contract-complet.docx',
  ]) {
    it(`${rel}: fraza folosește {{DOCUMENT_GENITIV}}, nu un document fix`, () => {
      const text = textOf(readFileSync(join(TEMPLATES_DIR, rel)));
      expect(text).toContain('pe durata obținerii {{DOCUMENT_GENITIV}}.');
      expect(text).not.toMatch(/pe durata obținerii (cazier|certificat)/);
    });
  }

  it('fiecare serviciu cu avocat are numele documentului (nu varianta neutră)', () => {
    for (const slug of LAWYER_SERVICE_SLUGS) {
      expect(contractDocumentGenitive(slug), slug).not.toBe(DOCUMENT_GENITIVE_FALLBACK);
    }
  });

  it('serviciu necunoscut → formulare neutră, niciodată alt document', () => {
    expect(contractDocumentGenitive('serviciu-nou')).toBe('documentului solicitat');
    expect(contractDocumentGenitive(null)).toBe('documentului solicitat');
  });

  it.each([
    ['certificat-celibat', 'certificatului de celibat'],
    ['certificat-nastere', 'certificatului de naștere'],
    ['cazier-fiscal', 'cazierului fiscal'],
    ['cazier-auto', 'cazierului auto'],
    ['cazier-judiciar-persoana-fizica', 'cazierului judiciar'],
    ['cazier-judiciar', 'cazierului judiciar'],
  ])('contractul randat pentru %s spune „%s"', (slug, expected) => {
    const text = textOf(generateDocument(slug, 'contract-asistenta', ctx(slug)));
    expect(text).toContain(`Contractul se încheie pe durata obținerii ${expected}.`);
    expect(text).not.toContain('{{');
  });
});
