import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { generateCerereExtrasCfPdf } from '@/lib/documents/cerere-extras-cf-pdf';

/**
 * The cerere is generated from committed assets (base PDF + line map). If those
 * ever drift — a rebuild with different coordinates, a missing font — the
 * collaborator gets a blank or broken form and only finds out at the OCPI
 * counter. These are the cheap guards against that.
 */
describe('generateCerereExtrasCfPdf', () => {
  it('produces a single-page A4-ish PDF', async () => {
    const buffer = await generateCerereExtrasCfPdf({
      uat: 'Baile Govora',
      carteFunciara: '101010',
      cfLocalitate: 'Baile Govora',
      cadastral: '101010',
      date: '21.08.2026',
    });

    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');

    const pdf = await PDFDocument.load(buffer);
    expect(pdf.getPageCount()).toBe(1);
    const { width, height } = pdf.getPage(0).getSize();
    expect(Math.round(width)).toBe(612);
    expect(Math.round(height)).toBe(792);
  });

  it('renders Romanian diacritics without throwing (Ș/Ț are outside WinAnsi)', async () => {
    await expect(
      generateCerereExtrasCfPdf({
        uat: 'Târgu Mureș',
        carteFunciara: '55',
        cfLocalitate: 'Sânpaul',
        cadastral: '',
        date: '21.08.2026',
      })
    ).resolves.toBeInstanceOf(Buffer);
  });

  it('leaves the cadastral slot empty instead of inventing a number', async () => {
    const withCadastral = await generateCerereExtrasCfPdf({
      uat: 'Odoreu', carteFunciara: '108465', cfLocalitate: 'Odoreu', cadastral: '108465', date: '21.08.2026',
    });
    const without = await generateCerereExtrasCfPdf({
      uat: 'Odoreu', carteFunciara: '108465', cfLocalitate: 'Odoreu', cadastral: '', date: '21.08.2026',
    });

    // Same form, strictly less drawn content when the number is missing.
    expect(without.length).toBeLessThan(withCadastral.length);
  });
});
