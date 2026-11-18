/**
 * How the „Procesare comanda" card on the admin order page behaves for a
 * given order status.
 *
 * - `hidden`   — unpaid orders (draft / abandoned): nothing was generated.
 * - `readonly` — dead orders (cancelled / refunded): the work already done
 *                stays visible and downloadable, but nothing can be generated,
 *                regenerated or advanced. The documents are the proof of work
 *                behind the 30% we keep, so regenerating them is not allowed
 *                (the file is stored under a fixed key and would be replaced).
 * - `full`     — every other status, including ones added later.
 *
 * Deny-list on purpose: an allow-list hid the card on every status added
 * after it was written (standby, translation steps). And until 18.11.2026
 * cancelled / refunded returned nothing at all, so the team lost the documents
 * of E-260711-TFVDH the moment the order was marked refunded.
 */
export type ProcessingSectionMode = 'hidden' | 'readonly' | 'full';

const HIDDEN_STATUSES = ['draft', 'abandoned'];
const READONLY_STATUSES = ['cancelled', 'refunded'];

export function processingSectionMode(status: string | null | undefined): ProcessingSectionMode {
  const value = status || 'draft';
  if (HIDDEN_STATUSES.includes(value)) return 'hidden';
  if (READONLY_STATUSES.includes(value)) return 'readonly';
  return 'full';
}
