import { describe, it, expect, vi } from 'vitest';
import {
  IdPdfError,
  isPdfFile,
  prepareIdPdfForUpload,
  readPdfForUpload,
  MAX_ID_PDF_BYTES,
  MAX_PDF_BYTES,
} from '@/lib/images/read-pdf-for-upload';
import { looksBlank, PdfRenderError } from '@/lib/images/pdf-to-image';

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

describe('prepareIdPdfForUpload', () => {
  const bigPdf = (bytes: number, name = 'pasaport.pdf') => {
    const body = new Uint8Array(bytes);
    body.set([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
    return new File([body], name, { type: 'application/pdf' });
  };
  const rendered = (pageCount = 1) => ({
    base64: 'AAAA',
    dataUrl: 'data:image/jpeg;base64,AAAA',
    mimeType: 'image/jpeg' as const,
    sizeAfter: 400_000,
    width: 1800,
    height: 2600,
    pageCount,
    pagesUsed: Math.min(pageCount, 2),
  });
  const deps = (render: () => Promise<ReturnType<typeof rendered>>) => ({ render: vi.fn(render), report: vi.fn() });

  it('sends a small PDF as it is, without loading the renderer', async () => {
    const d = deps(async () => rendered());
    const result = await prepareIdPdfForUpload(pdf(), {}, d);
    expect(result.converted).toBe(false);
    expect(result.mimeType).toBe('application/pdf');
    expect(result.fileName).toBe('buletin.pdf');
    expect(d.render).not.toHaveBeenCalled();
  });

  it('turns a PDF over 1.5 MB into a JPEG instead of refusing it', async () => {
    const d = deps(async () => rendered());
    const result = await prepareIdPdfForUpload(bigPdf(MAX_PDF_BYTES + 1), {}, d);
    expect(result.converted).toBe(true);
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.fileName).toBe('pasaport.jpg');
    expect(result.dataUrl).toMatch(/^data:image\/jpeg/);
    expect(result.notice).toBeNull();
  });

  it('tells the customer when only the first two pages were used', async () => {
    const d = deps(async () => rendered(5));
    const result = await prepareIdPdfForUpload(bigPdf(3 * 1024 * 1024), {}, d);
    expect(result.notice).toMatch(/5 pagini.*primele 2/);
  });

  it('refuses a PDF over 10 MB', async () => {
    const d = deps(async () => rendered());
    await expect(prepareIdPdfForUpload(bigPdf(MAX_ID_PDF_BYTES + 1), {}, d)).rejects.toThrow(/10 MB.*poză/);
    expect(d.render).not.toHaveBeenCalled();
  });

  it('refuses a large file that is not a real PDF', async () => {
    const fake = new File([new Uint8Array(2 * 1024 * 1024)], 'act.pdf', { type: 'application/pdf' });
    const d = deps(async () => rendered());
    await expect(prepareIdPdfForUpload(fake, {}, d)).rejects.toThrow(/nu poate fi citit/i);
    expect(d.render).not.toHaveBeenCalled();
  });

  it('reports a failed conversion once and shows a message the customer can act on', async () => {
    const d = deps(async () => {
      throw new PdfRenderError('PASSWORD', 'PDF-ul este protejat cu parolă. Încarcă o poză a actului.');
    });
    const attempt = prepareIdPdfForUpload(bigPdf(2 * 1024 * 1024), { docType: 'passport_opened', orderRef: 'E-TEST' }, d);
    await expect(attempt).rejects.toBeInstanceOf(IdPdfError);
    await expect(attempt).rejects.toThrow(/parolă.*poză/);
    expect(d.report).toHaveBeenCalledTimes(1);
    expect(d.report.mock.calls[0][0]).toMatchObject({
      kind: 'image_decode',
      code: 'PDF_PASSWORD',
      orderRef: 'E-TEST',
      meta: { mime: 'application/pdf', sizeBucket: '1-3MB', docType: 'passport_opened' },
    });
  });

  it('keeps the converted picture small enough for the autosave next to another PDF and a selfie', () => {
    // pdf-to-image squeezes the JPEG under 900 KB.
    expect(((900 * 1024 + MAX_PDF_BYTES + 250 * 1024) * 4) / 3).toBeLessThan(4.5 * 1024 * 1024);
  });
});

describe('looksBlank', () => {
  const pixels = (fill: (i: number) => number) => {
    const data = new Uint8ClampedArray(96 * 96 * 4);
    for (let i = 0; i < 96 * 96; i++) {
      const v = fill(i);
      data.set([v, v, v, 255], i * 4);
    }
    return data;
  };

  it('flags an empty page, white or black', () => {
    expect(looksBlank(pixels(() => 255))).toBe(true);
    expect(looksBlank(pixels(() => 0))).toBe(true);
  });

  it('accepts a page with a document on it', () => {
    // a card covering about a sixth of an A4 sheet
    expect(looksBlank(pixels((i) => (i % 96 < 40 && i < 96 * 40 ? 90 : 255)))).toBe(false);
  });
});
