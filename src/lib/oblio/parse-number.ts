/**
 * Split a stored Oblio invoice identifier (e.g. "EGH-0001") into the
 * `seriesName` + `number` parts that the Oblio API expects. We persist
 * invoices combined for display, but `/docs/cancel` needs them separate.
 *
 * Returns `null` if the input doesn't look like a valid Oblio combined
 * identifier — caller decides whether to fail loudly or skip.
 *
 * The format we emit (see `invoice.ts` `createInvoiceFromOrder`):
 *   `<series-uppercase>-<zero-padded-number>` e.g. `EGH-0001`
 * Edge cases tolerated:
 *   - Multi-segment series names (`EGH-PJ-0001` → seriesName: "EGH-PJ", number: "0001")
 *   - Numbers without padding (legacy rows may have "EGH-1")
 */

export interface ParsedInvoice {
  seriesName: string;
  number: string;
}

export function parseInvoiceNumber(combined: string): ParsedInvoice | null {
  if (!combined) return null;
  const trimmed = combined.trim();
  if (!trimmed) return null;
  // Last `-N+` group is the invoice number; everything before is the series.
  const match = trimmed.match(/^(.+)-(\d+)$/);
  if (!match) return null;
  const seriesName = match[1].trim();
  const number = match[2];
  if (!seriesName || !number) return null;
  return { seriesName, number };
}
