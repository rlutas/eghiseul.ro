/**
 * PDF compression for collaborator-uploaded scans.
 *
 * Why: a topograph scans the official document and uploads it. Phone/scanner
 * PDFs are image-heavy and can be 5–20MB; stored as-is they inflate S3 costs.
 * pdf-lib cannot recompress embedded images, so we use the CloudConvert
 * `optimize` operation (same EU sync API already used for DOCX→PDF) which
 * downsamples/recompresses the embedded images.
 *
 * Hard rule: compression must NEVER block the upload. If the API key is
 * missing, the call fails, or the "optimized" result is somehow larger, we
 * return the ORIGINAL buffer. The caller always gets a usable PDF.
 */

export interface CompressResult {
  buffer: Buffer;
  originalSize: number;
  finalSize: number;
  /** True only when we actually shrank the file via CloudConvert. */
  compressed: boolean;
}

async function optimizeViaCloudConvert(pdf: Buffer, apiKey: string): Promise<Buffer> {
  // Sync API: resolves only when the whole job is finished (EU processing).
  const res = await fetch('https://sync.api.cloudconvert.com/v2/jobs', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tasks: {
        'import-pdf': {
          operation: 'import/base64',
          file: pdf.toString('base64'),
          filename: 'document.pdf',
        },
        'optimize-pdf': {
          operation: 'optimize',
          input: 'import-pdf',
          input_format: 'pdf',
          // Recompress embedded images; good balance of size vs legibility for scans.
          image_quality: 75,
          flatten: false,
        },
        'export-pdf': {
          operation: 'export/url',
          input: 'optimize-pdf',
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`CloudConvert optimize failed: ${res.status} ${await res.text()}`);
  }

  const job = (await res.json()) as {
    data?: { tasks?: Array<{ name: string; result?: { files?: Array<{ url?: string }> } }> };
  };
  const exportTask = job.data?.tasks?.find((t) => t.name === 'export-pdf');
  const fileUrl = exportTask?.result?.files?.[0]?.url;
  if (!fileUrl) {
    throw new Error('CloudConvert optimize returned no export URL');
  }

  const out = await fetch(fileUrl);
  if (!out.ok) {
    throw new Error(`CloudConvert optimized PDF download failed: ${out.status}`);
  }
  return Buffer.from(await out.arrayBuffer());
}

/**
 * Compress a PDF buffer. Always returns a usable buffer — falls back to the
 * original on any failure or if no backend is configured.
 */
export async function compressPdf(pdf: Buffer): Promise<CompressResult> {
  const originalSize = pdf.length;
  const apiKey = process.env.CLOUDCONVERT_API_KEY;

  if (!apiKey) {
    return { buffer: pdf, originalSize, finalSize: originalSize, compressed: false };
  }

  try {
    const optimized = await optimizeViaCloudConvert(pdf, apiKey);
    // Only keep the optimized version if it is actually smaller.
    if (optimized.length > 0 && optimized.length < originalSize) {
      return {
        buffer: optimized,
        originalSize,
        finalSize: optimized.length,
        compressed: true,
      };
    }
    return { buffer: pdf, originalSize, finalSize: originalSize, compressed: false };
  } catch (err) {
    console.error('[pdf-compress] optimization failed, using original:', err instanceof Error ? err.message : err);
    return { buffer: pdf, originalSize, finalSize: originalSize, compressed: false };
  }
}
