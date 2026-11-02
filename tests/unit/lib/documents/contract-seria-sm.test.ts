import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import PizZip from 'pizzip';
import { buildPlaceholderData, generateDocument } from '@/lib/documents/generator';

/**
 * Contractul de asistență juridică poartă seria Baroului ca delegația
 * (SM021651, nu 021651). Cerere echipă din Ghid, 02.11.2026.
 */
const TEMPLATES_DIR = join(process.cwd(), 'src', 'templates');

describe('contract asistență — seria SM lângă număr', () => {
  for (const rel of [
    'shared/contract-asistenta.docx',
    'cazier-judiciar/contract-asistenta.docx',
    'shared/contract-complet.docx',
  ]) {
    it(`${rel}: fiecare {{NRCONTRACT}} e precedat de {{CONTRACT_SERIA}}`, () => {
      const xml = new PizZip(readFileSync(join(TEMPLATES_DIR, rel))).file('word/document.xml')!.asText();
      const all = xml.match(/\{\{NRCONTRACT\}\}/g) || [];
      const withSeries = xml.match(/\{\{CONTRACT_SERIA\}\}\{\{NRCONTRACT\}\}/g) || [];
      expect(all.length).toBeGreaterThan(0);
      expect(withSeries.length).toBe(all.length);
    });
  }

  it('împuternicirea NU primește seria a doua oară (are deja „serie {{SERIE}}")', () => {
    const xml = new PizZip(readFileSync(join(TEMPLATES_DIR, 'shared/imputernicire.docx'))).file('word/document.xml')!.asText();
    expect(xml).not.toContain('{{CONTRACT_SERIA}}');
  });
});

describe('CONTRACT_SERIA — valoarea', () => {
  const ctx = (numbers: Record<string, unknown> | undefined) =>
    ({
      order: { total_price: 0, service_price: 0, order_number: 'E-TEST', service_name: 'Test' },
      company: {},
      lawyer: {},
      client: { name: 'Ion Test', email: 'test@example.com', phone: '+40740000000' },
      document_numbers: numbers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

  it('SM implicit când registrul nu dă serie pe contract', () => {
    const data = buildPlaceholderData(ctx({ contract_number: 21651, contract_series: null }));
    expect(`${data.CONTRACT_SERIA}${data.NRCONTRACT}`).toBe('SM021651');
  });

  it('respectă seria intervalului când există', () => {
    const data = buildPlaceholderData(ctx({ contract_number: 7, contract_series: 'AB' }));
    expect(`${data.CONTRACT_SERIA}${data.NRCONTRACT}`).toBe('AB000007');
  });

  it('gol pe draft fără număr (nu „SM" singur)', () => {
    expect(buildPlaceholderData(ctx(undefined)).CONTRACT_SERIA).toBe('');
  });

  it('contractul randat conține SM021651', () => {
    const buf = generateDocument('cazier-judiciar-persoana-fizica', 'contract-asistenta', ctx({ contract_number: 21651 }));
    const text = new PizZip(buf).file('word/document.xml')!.asText().replace(/<[^>]+>/g, '');
    expect(text).toContain('Nr. SM021651');
    expect(text).toContain('sub nr. SM021651');
  });
});
