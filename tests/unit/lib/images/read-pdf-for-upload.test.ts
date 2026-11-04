import { describe, it, expect } from 'vitest';
import { isPdfFile, readPdfForUpload, MAX_PDF_BYTES } from '@/lib/images/read-pdf-for-upload';

const pdf = (body = 'content', name = 'buletin.pdf', type = 'application/pdf') =>
  new File([`%PDF-1.7 ${body}`], name, { type });

describe('isPdfFile', () => {
  it('recognises the type and the extension, because phones can report an empty type', () => {
    expect(isPdfFile(pdf())).toBe(true);
    expect(isPdfFile(pdf('x', 'BULETIN.PDF', ''))).toBe(true);
    expect(isPdfFile(new File(['x'], 'poza.jpg', { type: 'image/jpeg' }))).toBe(false);
  });
});

describe('readPdfForUpload', () => {
  it('returns the file as base64 with its size', async () => {
    const file = pdf();
    const result = await readPdfForUpload(file);
    expect(result.mimeType).toBe('application/pdf');
    expect(result.sizeAfter).toBe(file.size);
    expect(atob(result.base64).startsWith('%PDF')).toBe(true);
  });

  it('refuses a file over the request limit with a message the customer can act on', async () => {
    const big = new File([new Uint8Array(MAX_PDF_BYTES + 1)], 'scan.pdf', { type: 'application/pdf' });
    await expect(readPdfForUpload(big)).rejects.toThrow(/prea mare.*poză/i);
  });

  it('refuses a file that is not a real PDF', async () => {
    const fake = new File(['not a pdf'], 'buletin.pdf', { type: 'application/pdf' });
    await expect(readPdfForUpload(fake)).rejects.toThrow(/nu poate fi citit/i);
  });

  it('refuses an empty file', async () => {
    const empty = new File([], 'buletin.pdf', { type: 'application/pdf' });
    await expect(readPdfForUpload(empty)).rejects.toThrow(/gol/i);
  });

  it('lets two PDFs and a compressed selfie fit in one 4.5 MB autosave', () => {
    const selfie = 250 * 1024;
    expect(((MAX_PDF_BYTES * 2 + selfie) * 4) / 3).toBeLessThan(4.5 * 1024 * 1024);
  });
});
