/**
 * Turn a scanned ID document sent as PDF into one JPEG, in the browser.
 *
 * Why: an identity PDF travels as base64 inside every autosave and the request
 * limit is 4.5 MB, so `readPdfForUpload` refuses anything over 1.5 MB. A scan
 * from a phone app or an office scanner is often 2–8 MB, yet it is only a
 * picture wrapped in a PDF. Rendering the page gives back that picture, at a
 * size the wizard can carry.
 *
 * - First two pages only (front + back of an ID card), stacked top to bottom.
 * - pdf.js is loaded on demand: customers who upload photos never download it.
 * - The legacy build is used because older iOS Safari is a real share of the
 *   customers (see `compress.ts`).
 * - JPEG 2000 / JBIG2 images need the pdf.js wasm decoders, which are not
 *   shipped. Such a page renders empty; the blank check below turns that into
 *   a clear message instead of an unreadable document reaching the team.
 */

export const MAX_PDF_PAGES = 2;
/** Longest side of one rendered page, in pixels. A card on an A4 sheet stays readable. */
const PAGE_MAX_EDGE = 2600;
/** Encoded size the result is squeezed under (base64 adds a third). */
const TARGET_BYTES = 900 * 1024;
const RENDER_TIMEOUT_MS = 45_000;

export type PdfRenderErrorCode = 'PASSWORD' | 'BLANK' | 'UNREADABLE' | 'TIMEOUT' | 'UNSUPPORTED';

export class PdfRenderError extends Error {
  constructor(public code: PdfRenderErrorCode, message: string) {
    super(message);
    this.name = 'PdfRenderError';
  }
}

export interface RenderedPdf {
  /** Raw base64 (no `data:` prefix). */
  base64: string;
  /** Data URL, for the `<img>` preview. */
  dataUrl: string;
  mimeType: 'image/jpeg';
  sizeAfter: number;
  width: number;
  height: number;
  /** Pages in the PDF. */
  pageCount: number;
  /** Pages that made it into the picture (at most `MAX_PDF_PAGES`). */
  pagesUsed: number;
}

/**
 * Share of pixels that differ visibly from the page's dominant tone, on a
 * small sample. An empty page (or one whose only image could not be decoded)
 * is a single flat colour.
 */
export function looksBlank(pixels: Uint8ClampedArray): boolean {
  const count = pixels.length / 4;
  if (count === 0) return true;
  let sum = 0;
  const luma = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const l = 0.299 * pixels[i * 4] + 0.587 * pixels[i * 4 + 1] + 0.114 * pixels[i * 4 + 2];
    luma[i] = l;
    sum += l;
  }
  const mean = sum / count;
  let differing = 0;
  for (let i = 0; i < count; i++) if (Math.abs(luma[i] - mean) > 24) differing++;
  return differing / count < 0.004;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(blob);
  });
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))), 'image/jpeg', quality);
  });
}

function releaseCanvas(canvas: HTMLCanvasElement) {
  // Safari keeps canvas memory until the size is reset.
  canvas.width = 0;
  canvas.height = 0;
}

/** Lower the quality first, then the dimensions, until the picture fits. */
async function encodeUnderBudget(source: HTMLCanvasElement): Promise<{ blob: Blob; width: number; height: number }> {
  let canvas = source;
  try {
    for (let attempt = 0; attempt < 6; attempt++) {
      for (const quality of [0.82, 0.72, 0.62]) {
        const blob = await toJpeg(canvas, quality);
        if (blob.size <= TARGET_BYTES) return { blob, width: canvas.width, height: canvas.height };
      }
      const smaller = document.createElement('canvas');
      smaller.width = Math.max(1, Math.round(canvas.width * 0.8));
      smaller.height = Math.max(1, Math.round(canvas.height * 0.8));
      const ctx = smaller.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('no 2d ctx');
      ctx.drawImage(canvas, 0, 0, smaller.width, smaller.height);
      if (canvas !== source) releaseCanvas(canvas);
      canvas = smaller;
    }
    const blob = await toJpeg(canvas, 0.6);
    return { blob, width: canvas.width, height: canvas.height };
  } finally {
    if (canvas !== source) releaseCanvas(canvas);
  }
}

async function render(file: File): Promise<RenderedPdf> {
  let pdfjs: typeof import('pdfjs-dist');
  try {
    pdfjs = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as typeof import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    throw new PdfRenderError('UNSUPPORTED', 'Browserul nu poate deschide PDF-ul. Încarcă o poză a actului.');
  }

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  });

  const pageCanvases: HTMLCanvasElement[] = [];
  try {
    let pdf: Awaited<typeof loadingTask.promise>;
    try {
      pdf = await loadingTask.promise;
    } catch (error) {
      if ((error as { name?: string } | null)?.name === 'PasswordException') {
        throw new PdfRenderError('PASSWORD', 'PDF-ul este protejat cu parolă. Încarcă o poză a actului.');
      }
      throw new PdfRenderError('UNREADABLE', 'PDF-ul nu a putut fi deschis. Încarcă o poză a actului.');
    }

    const pageCount = pdf.numPages;
    const pagesUsed = Math.min(pageCount, MAX_PDF_PAGES);

    for (let n = 1; n <= pagesUsed; n++) {
      const page = await pdf.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const scale = PAGE_MAX_EDGE / Math.max(base.width, base.height);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new PdfRenderError('UNSUPPORTED', 'Browserul nu poate procesa PDF-ul. Încarcă o poză a actului.');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      pageCanvases.push(canvas);
      await page.render({ canvasContext: ctx, canvas, viewport }).promise;
      page.cleanup();
    }

    const width = Math.max(...pageCanvases.map((c) => c.width));
    const height = pageCanvases.reduce((total, c) => total + c.height, 0);
    const sheet = document.createElement('canvas');
    sheet.width = width;
    sheet.height = height;
    const sheetCtx = sheet.getContext('2d', { alpha: false });
    if (!sheetCtx) throw new PdfRenderError('UNSUPPORTED', 'Browserul nu poate procesa PDF-ul. Încarcă o poză a actului.');
    sheetCtx.fillStyle = '#ffffff';
    sheetCtx.fillRect(0, 0, width, height);
    let offset = 0;
    for (const canvas of pageCanvases) {
      sheetCtx.drawImage(canvas, Math.round((width - canvas.width) / 2), offset);
      offset += canvas.height;
    }

    try {
      const sample = document.createElement('canvas');
      sample.width = 96;
      sample.height = 96;
      const sampleCtx = sample.getContext('2d', { alpha: false, willReadFrequently: true });
      if (sampleCtx) {
        sampleCtx.drawImage(sheet, 0, 0, 96, 96);
        if (looksBlank(sampleCtx.getImageData(0, 0, 96, 96).data)) {
          throw new PdfRenderError('BLANK', 'Nu am putut citi imaginea din PDF. Încarcă o poză a actului.');
        }
      }

      const encoded = await encodeUnderBudget(sheet);
      const dataUrl = await blobToDataUrl(encoded.blob);
      const base64 = dataUrl.split(',')[1] ?? '';
      if (!base64) throw new PdfRenderError('UNREADABLE', 'PDF-ul nu a putut fi procesat. Încarcă o poză a actului.');
      return {
        base64,
        dataUrl,
        mimeType: 'image/jpeg',
        sizeAfter: encoded.blob.size,
        width: encoded.width,
        height: encoded.height,
        pageCount,
        pagesUsed,
      };
    } finally {
      releaseCanvas(sheet);
    }
  } catch (error) {
    if (error instanceof PdfRenderError) throw error;
    throw new PdfRenderError('UNREADABLE', 'PDF-ul nu a putut fi procesat. Încarcă o poză a actului.');
  } finally {
    pageCanvases.forEach(releaseCanvas);
    void loadingTask.destroy().catch(() => {});
  }
}

/** Browser only. Rejects with `PdfRenderError`, whose message is safe to show the customer. */
export async function renderPdfToImage(file: File): Promise<RenderedPdf> {
  if (typeof document === 'undefined') {
    throw new PdfRenderError('UNSUPPORTED', 'PDF-ul nu poate fi procesat aici. Încarcă o poză a actului.');
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new PdfRenderError('TIMEOUT', 'Procesarea PDF-ului durează prea mult. Încarcă o poză a actului.')),
      RENDER_TIMEOUT_MS
    );
  });
  try {
    return await Promise.race([render(file), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
