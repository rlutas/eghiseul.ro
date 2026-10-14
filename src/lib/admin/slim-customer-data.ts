/**
 * customer_data without embedded files, for admin LISTS.
 *
 * Drafts from before the S3 upload flow store ID scans as base64 strings
 * inside customer_data (personal.uploadedDocuments[].base64, ~500 KB each).
 * Lists only render names, contact and document types, so every large inline
 * file is replaced by a short marker. Shape and keys stay the same, so code
 * that counts filled fields (dataDepthScore) sees the same structure.
 */
const MAX_INLINE = 2_000;

export function slimCustomerData<T>(value: T): T {
  if (typeof value === 'string') {
    return (value.length > MAX_INLINE ? '[fișier]' : value) as T;
  }
  if (Array.isArray(value)) return value.map((v) => slimCustomerData(v)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = k === 'base64' && typeof v === 'string' ? '[fișier]' : slimCustomerData(v);
    }
    return out as T;
  }
  return value;
}
