/**
 * How long a stored identity document stays usable without being re-uploaded.
 *
 * 90 days, counted from the moment the document was verified — not the
 * document's own expiry date, which is used instead when the OCR read one.
 * The number lived as a private `const` in three routes
 * (`api/user/kyc`, `api/user/kyc/save`, `api/auth/register-from-order`), which
 * meant a document copied from an order could silently outlive one uploaded in
 * the account.
 */
export const KYC_VALIDITY_DAYS = 90;
