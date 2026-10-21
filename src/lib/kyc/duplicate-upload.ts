/**
 * Detects a KYC upload that is the same picture as a document already on the
 * order (real case: E-261021-2446F — the ID back uploaded again as the
 * selfie). The server refuses such an order at submit (`KYC_INCOMPLETE`), so
 * the wizard must catch it at upload, where the customer can still fix it.
 *
 * Both sides come out of the same `compressImage` pipeline, so identical
 * source files give identical bytes. While the other document is still in
 * memory we compare its base64; after a draft reload only the S3 key and the
 * byte size survive, so equal size is the fallback signal.
 */

interface ComparableDocument {
  type: string;
  fileSize?: number;
  base64?: string;
}

const stripDataUrl = (b64: string) => b64.replace(/^data:[^;]+;base64,/, '');

export function findDuplicateUpload<T extends ComparableDocument>(
  type: string,
  base64: string,
  fileSize: number,
  existing: readonly T[]
): T | null {
  const candidate = stripDataUrl(base64);
  for (const doc of existing) {
    // Replacing the same slot is not a duplicate.
    if (doc.type === type) continue;
    if (doc.base64) {
      if (stripDataUrl(doc.base64) === candidate) return doc;
      continue;
    }
    if (fileSize > 0 && doc.fileSize === fileSize) return doc;
  }
  return null;
}
