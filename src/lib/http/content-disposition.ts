/**
 * Builds an attachment Content-Disposition header for a download.
 *
 * Quotes and escapes the ASCII form (our filenames contain spaces and can
 * contain parentheses) and adds the RFC 5987 `filename*` form so a name that
 * ever keeps a non-ASCII character still arrives intact.
 */
export function contentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
