# Post-Order Photo Re-Upload (selfie)

**Last Updated:** 2026-06-09
**Version:** 1.0
**Status:** ⛔ SUPERSEDED (2026-07-08) — fluxul a fost extins la multi-document
(„Solicită documente"), cu auto-standby + notificare echipă. Vezi
[`document-request-system.md`](document-request-system.md). Acest doc rămâne
doar ca istoric al versiunii doar-selfie (migrarea 048).

Lets the team request a fresh KYC photo (currently the **selfie**) from a
customer **after** the order is placed, via a secure single-use link. Built
after the automatic AI selfie↔ID face-match was removed in favour of manual
review (see [`kyc-identity-verification.md`](./kyc-identity-verification.md)).

---

## 1. Why

The AI face-match was slow and unreliable, so the team now verifies selfies
manually in admin. When a selfie is wrong/unclear, the operator needs a way to
get a corrected photo without the customer redoing the whole order.

Direction chosen with the product owner:
- **Trigger:** admin requests the link on demand (not always-on for the client).
- **Scope:** selfie only (schema is generic, extensible to CI/passport later).
- **Delivery:** email (Resend) + manual WhatsApp share (`wa.me`) from admin —
  there is no WhatsApp API in the stack.

---

## 2. Flow

```
Admin order page → "Cere poză nouă (selfie)" (+ optional reason)
   → POST /api/admin/orders/[id]/request-reupload   (orders.manage)
   → creates reupload_requests row (opaque token, 7-day expiry)
   → emails the link (Resend) + returns it for Copy / WhatsApp share
        ↓
Customer opens /reincarca-poza/<token>  (no login, mobile-first)
   → GET  /api/reupload/[token]   (info: doc type, status, usable)
   → POST /api/reupload/[token]   (uploads compressed photo)
        → S3 put: kyc/<orderId>/selfie_reupload_<reqId>.<ext>
        → swaps the selfie s3Key in customer_data (personal + personalData)
        → re-flags order for review (kyc_verified_at=null, clears
          adminVerifiedAt, selfie.needsManualReview=true)
        → reupload_requests.status='completed' (single-use)
        → order_history: 'kyc_photo_resubmitted'
```

---

## 3. Data model — `reupload_requests`

Migration: `supabase/migrations/048_reupload_requests.sql`. RLS **on**, no public
policies → only the service-role client touches it.

| Column | Notes |
|--------|-------|
| `id` uuid PK | |
| `order_id` uuid → orders | ON DELETE CASCADE |
| `document_type` varchar | `'selfie'` (generic for future CI/passport) |
| `token` varchar UNIQUE | opaque `randomBytes(32).base64url`, URL segment |
| `token_expires_at` timestamptz | default 7 days |
| `status` varchar | `pending` / `completed` / `expired` / `cancelled` |
| `reason` text | optional operator note |
| `requested_by` uuid → profiles | admin who triggered it |
| `requested_at`, `completed_at` | |
| `new_s3_key` varchar | S3 key of the re-uploaded photo |

> **Not yet in `types/supabase.ts`** — accessed via `(admin as any)` (existing
> convention). Add it at the next type regeneration.

---

## 4. Endpoints

### `POST /api/admin/orders/[id]/request-reupload` — auth `orders.manage`
Body: `{ documentType?: 'selfie', reason?: string }`.
Returns: `{ reuploadRequestId, token, reuploadUrl, expiresAt, emailSent }`.
Side effects: insert request, send email (skipped if `RESEND_API_KEY` unset →
`emailSent:false`), `order_history` `reupload_requested`.

### `GET /api/reupload/[token]` — public
Returns minimal `{ documentType, documentLabel, status, usable }` (no PII).

### `POST /api/reupload/[token]` — public
Body: `{ imageBase64, contentType }`. Validates token (pending + not expired,
single-use), image type (jpeg/png/webp) and size, uploads to S3, updates the
order, marks the request completed. `410` if expired/used, `404` if invalid.

---

## 5. UI

- **Admin button** `RequestSelfieReuploadButton` (in
  `src/app/admin/orders/[id]/page.tsx`, next to "Verificat manual"): reason box
  → send → shows the link with **Copiază** + **WhatsApp** (`wa.me/<phone>?text=…`)
  + email status.
- **Public page** `src/app/reincarca-poza/[token]/page.tsx`: mobile-first,
  client-side image compression, states loading / invalid / expired / used /
  success.

- **Email template** `src/lib/email/templates/reupload-request.ts`.

---

## 6. Notes / follow-ups

- WhatsApp is a **manual share** via `wa.me`, not an API send.
- Only selfie today; `document_type` is generic for future docs.
- No internal "customer re-uploaded" notification yet (only `order_history`) —
  could add an internal email.
- `reupload_requests` to be added to generated Supabase types.
