/**
 * Who may write to a DRAFT order without being staff — the draft route and
 * the client-file upload route share this gate.
 */

import { timingSafeEqual } from 'crypto';

/**
 * Ownership gate shared by the POST-upsert and PATCH paths.
 * Rules (guest cross-device resume stays possible via matching email):
 *  - session user owns the order → allowed
 *  - unclaimed (guest) draft → allowed only when the draft has no email yet,
 *    or the request/session email matches the stored contact email
 *  - anything else → denied
 */
export function canUpdateDraft(
  user: { id: string; email?: string } | null,
  order: { user_id: string | null; customer_data: unknown; resume_token?: string | null; resume_token_expires_at?: string | null },
  requestEmail: string | undefined,
  resumeToken?: string
): boolean {
  const existingEmail = (
    (order.customer_data as { contact?: { email?: string } } | null)?.contact?.email || ''
  ).toLowerCase() || undefined;
  const sessionEmail = user?.email?.toLowerCase();

  if (user && order.user_id === user.id) return true;
  // The admin-issued continuation link: the customer finishes, as a guest, a
  // draft the operator started (which carries the operator's user_id).
  if (order.user_id && resumeToken && order.resume_token) {
    const a = Buffer.from(resumeToken);
    const b = Buffer.from(order.resume_token);
    const live = !!order.resume_token_expires_at && new Date(order.resume_token_expires_at).getTime() > Date.now();
    if (live && a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  if (order.user_id && order.user_id !== (user?.id ?? null)) return false;
  if (!order.user_id) {
    if (!existingEmail) return true; // first contact entry on a fresh draft
    return existingEmail === requestEmail || existingEmail === sessionEmail;
  }
  return false;
}
