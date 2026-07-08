# Solicită Documente — cerere documente de la client (post-comandă)

**Data:** 2026-07-08 · **Status:** LIVE · **Migrări:** 048 (bază), 101 (multi-doc)

Sistem prin care echipa cere clientului să (re)încarce documente DUPĂ plasarea
comenzii — selfie neclar, buletin lipsă, act firmă expirat etc. Înlocuiește
vechiul flux „Cere poză nouă (selfie)" (un singur tip de document).

## Flux complet

```
Admin (pagina comenzii)                    Client                         Sistem
──────────────────────                     ──────                         ──────
„Solicită documente"
  → bifezi documentele + motiv
  → Trimite cererea
                                                                          • cererile pending vechi → cancelled
                                                                          • rând nou în reupload_requests
                                                                            (token unic, valabil 7 zile)
                                                                          • comanda → status 'standby'
                                                                            (SLA pauzat; statusul anterior
                                                                            salvat în return_status)
                                                                          • email către client cu lista + link
                                           primește email
                                           SAU vede banner portocaliu
                                           pe pagina de status comandă
                                           → /reincarca-poza/<token>
                                           → încarcă fiecare document
                                             (poze; PDF la actele firmei)
                                                                          • fiecare upload: S3 + customer_data
                                                                            + kyc_verified_at reset (reverificare)
                                                                            + order_history (n/total)
                                           … ultimul document …
                                                                          • cererea → completed
                                                                          • comanda iese din standby →
                                                                            return_status; termen estimat
                                                                            mutat cu zilele pauzate
                                                                          • email către contact@eghiseul.ro
                                                                            cu link direct spre admin
```

## Componente

| Piesă | Fișier |
|-------|--------|
| Catalog documente (labels, hint, țintă, PDF da/nu) | `src/lib/reupload/doc-types.ts` |
| API admin (creare cerere + auto-standby) | `src/app/api/admin/orders/[id]/request-reupload/route.ts` |
| API public upload (token-gated, fără login) | `src/app/api/reupload/[token]/route.ts` |
| Pagina client de upload | `src/app/reincarca-poza/[token]/page.tsx` |
| Buton + modal admin | `RequestDocumentsButton` în `src/app/admin/orders/[id]/page.tsx` |
| Banner pe status comandă | `src/app/comanda/status/page.tsx` + `pendingReupload` în `/api/orders/status` |
| Email client (lista documente + link) | `src/lib/email/templates/reupload-request.ts` |
| Email echipă (documente primite) | `src/lib/email/templates/reupload-completed.ts` |
| SLA / standby math | `src/lib/orders/standby.ts` (exista deja) |

## Documente disponibile (catalog)

`selfie`, `ci_vechi`, `ci_nou_front`, `ci_nou_back`, `passport`,
`certificat_domiciliu` → ajung în `customer_data.personal/personalData.uploadedDocuments`.
`company_registration_cert`, `company_statement_cert` (acceptă PDF) → ajung în
`customer_data.company.uploadedDocuments`.

Adaugi un tip nou = o intrare în `REUPLOAD_DOC_SPECS` (zero migrare — coloana
`document_types` e JSONB).

## Reguli & decizii

- **Un singur link activ per comandă** — o cerere nouă anulează automat cererile
  pending anterioare (clientul nu poate folosi un link vechi cu alt set de documente).
- **Auto-standby doar din statusuri active** (`STANDBY_ELIGIBLE_STATUSES`:
  paid, processing, documents_generated, submitted_to_institution,
  document_received, extras_in_progress, pending_documents). Comenzile
  neplătite/finalizate nu sunt atinse.
- **Ieșirea din standby e condiționată**: se face doar dacă comanda e ÎNCĂ în
  standby la momentul ultimului upload — dacă un operator a mutat-o manual între
  timp, nu o suprascriem.
- **Fail-open pe notificări**: eșecul emailului către echipă sau al ieșirii din
  standby nu blochează upload-ul clientului (log + continuă).
- **Token**: opaque random (32 bytes base64url), single-use per cerere, expiră
  în 7 zile. Tabela `reupload_requests` are RLS fără politici publice — acces
  doar prin service role.
- **Expunerea linkului pe pagina de status e sigură**: API-ul de status cere
  deja codul comenzii + emailul comenzii.
- **Reverificare obligatorie**: orice upload resetează `kyc_verified_at` și
  (la selfie) re-flag `kycValidation.selfie.needsManualReview` — comanda apare
  din nou la verificare KYC în admin.

## Schema (reupload_requests, după 101)

- `document_type` VARCHAR — legacy, primul tip (compat rânduri vechi)
- `document_types` JSONB — array-ul cerut (sursa de adevăr pentru cereri noi)
- `completed_documents` JSONB — `[{type, s3Key, at}]`, progres per document
- `return_status` VARCHAR — statusul de restaurat la finalizare
- `status`: pending → completed / cancelled / expired

## Istoric

- 2026-06 (migrarea 048): flux inițial doar-selfie.
- 2026-07-08 (migrarea 101): multi-document + auto-standby + banner status +
  notificare echipă. Context: E-260708-VC4GH (cazier PJ fără buletin
  administrator + selfie — vezi migrarea 100).
