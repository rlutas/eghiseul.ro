/**
 * When may an order consume Barou numbers (contract asistență, împuterniciri)?
 *
 * Barou numbers are finite (post-payment allocation policy, 2026-07), so the
 * default is `payment_status = 'paid'`. Since 14.09.2026 an operator can start
 * work on a bank-transfer order after verifying the payment proof
 * („Dovadă verificată — pornește lucrul"): `proof_verified_at` is set
 * deliberately, before the money arrives, and counts as paid for allocation.
 * If the money never comes, the numbers are RELEASED in the central registry
 * (release, not void — see docs/registru-central/).
 *
 * Shared by the manual admin generator (generate-document route) and the
 * automatic post-payment allocation (ensure-barou-documents), so the two
 * paths can never disagree again (15.09.2026: the manual „Generează
 * împuternicire" refused an order the automatic path had already allocated).
 */
export function canAllocateBarouNumbers(order: {
  payment_status?: string | null;
  proof_verified_at?: string | null;
}): boolean {
  return order.payment_status === 'paid' || !!order.proof_verified_at;
}
