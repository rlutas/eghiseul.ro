# Sesiune 2026-06-09 — Re-încărcare selfie după comandă (link securizat declanșat de admin)

**Status:** ✅ Aplicat (migrare rulată, tsc + lint + build OK, smoke-test endpoint public OK)

---

## Cerință

După eliminarea verificării AI la selfie, echipa verifică manual. Dacă poza nu e ok, vor să poată cere clientului o poză nouă **după** plasarea comenzii, printr-un link, iar comanda se actualizează. Direcție aleasă cu userul:
- Declanșare: **admin trimite link la cerere**
- Doar **selfie-ul**
- Trimitere: **email** (Resend) + buton **WhatsApp** în admin (link `wa.me` precompletat) — nu există API WhatsApp în stack.

## Ce s-a construit

1. **DB — `reupload_requests`** (`supabase/migrations/048_reupload_requests.sql`, rulată):
   token opac unic + `token_expires_at` (7 zile) + `status` (pending/completed/expired/cancelled) + `order_id`, `document_type`, `reason`, `requested_by`, `new_s3_key`. RLS ON, fără policy-uri publice → doar service role.

2. **API admin** `POST /api/admin/orders/[id]/request-reupload` (`orders.manage`):
   generează token (`randomBytes(32).base64url`), inserează cererea, trimite email cu linkul (Resend), scrie `order_history` (`reupload_requested`). Întoarce `reuploadUrl` + `expiresAt` + `emailSent`.

3. **Email** `src/lib/email/templates/reupload-request.ts` (HTML + text inline, brand).

4. **API public** `GET/POST /api/reupload/[token]` (fără login, token-gated):
   - GET → info minimă (doc type, status, usable), fără PII.
   - POST → validează token (pending + neexpirat), urcă poza în S3 (`kyc/{orderId}/selfie_reupload_{reqId}.{ext}`), înlocuiește `s3Key`-ul selfie-ului în `customer_data` (ambele shape-uri `personal`/`personalData`), **re-flag** comanda (`kyc_verified_at=null`, șterge `adminVerifiedAt`, selfie `needsManualReview`), marchează cererea `completed` (single-use), scrie `order_history` (`kyc_photo_resubmitted`). Limite: tip imagine (jpeg/png/webp) + dimensiune.

5. **Pagină publică** `src/app/reincarca-poza/[token]/page.tsx` (mobile-first):
   verifică linkul → upload cu compresie client-side → stări loading/invalid/expirat/folosit/succes.

6. **Buton admin** `RequestSelfieReuploadButton` în pagina comenzii (lângă „Verificat manual"):
   „Cere poză nouă (selfie)" → motiv opțional → trimite → afișează linkul cu **Copiază** + **WhatsApp** (`wa.me/<telefon>?text=...`) + status email.

## Verificare

- Migrare aplicată (coloane confirmate).
- `npx tsc --noEmit` → 0 (tabel nou accesat cu `(admin as any)` — nu e încă în `types/supabase.ts`; nu putem regenera fără `SUPABASE_ACCESS_TOKEN`).
- `eslint` → 0 erori; `npm run build` → OK.
- Smoke-test live: GET token invalid → 404; GET token valid (inserat manual) → 200 `usable:true`; rând de test șters.

## Note / follow-up

- WhatsApp e „share manual" prin `wa.me`, nu API. Dacă pe viitor vrem trimitere automată, e nevoie de un provider (Twilio WhatsApp / Meta Cloud API).
- `reupload_requests` nu e în tipurile generate Supabase — de adăugat la următoarea regenerare a `types/supabase.ts`.
- Momentan doar selfie. Schema (`document_type`) e generică, deci se extinde ușor la CI/pașaport.
- Nu am pus încă o notificare către echipă când clientul reîncarcă (doar `order_history`). Se poate adăuga un email intern dacă vrei.
