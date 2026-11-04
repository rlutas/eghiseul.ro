# Monitorizare: credit Gemini și erori clienți (API)

Livrat 02.11.2026 (migrarea 199). Procedura echipei: [`docs/admin/credit-gemini-si-erori-clienti.md`](../../admin/credit-gemini-si-erori-clienti.md).

## POST /api/client-errors

Public, fără autentificare. Înregistrează o eroare arătată clientului în browser în `client_error_log`.

**Body** (JSON, max. 4 KB):

```json
{
  "kind": "image_decode",
  "code": "DECODE_FAILED",
  "message": "Imaginea nu a putut fi decodificată. Încearcă altă poză.",
  "page": "/comanda/cazier-judiciar",
  "step": "kyc-documents",
  "serviceSlug": "cazier-judiciar",
  "orderRef": "E-261102-XXXXX",
  "meta": { "mime": "image/jpeg", "sizeBucket": "1-3MB", "fallback": "original", "docType": "selfie" }
}
```

- `kind` ∈ `image_decode`, `image_compress`, `upload_failed`, `cnp_invalid`, `ocr_failed`, `kyc_failed`, `payment_error`, `save_failed`, `module_load_failed`, `other`; altceva → ignorat.
- Câmpuri în afara listei sunt ignorate; `code`/`step`/`serviceSlug` doar `[A-Za-z0-9_\-./]`; `orderRef` doar format de cod de comandă; `message` ≤ 300 cu cifre lungi și emailuri înlocuite; `page` fără query/hash; `meta` doar cheile `mime`, `sizeBucket`, `fallback`, `docType`, `status`, `attempt`, `source`.
- `platform` din host (`brandFromRequest`), `user_agent` din header.
- Limită: 30 de cereri / 10 minute / IP (în memorie); peste limită → ignorat.
- **Răspuns mereu** `200 { "success": true }` (inclusiv pentru cereri ignorate).

Client: `reportClientError()` din `src/lib/client-errors/report.ts` (sendBeacon, fallback `fetch` cu `keepalive`, nu aruncă niciodată).

## GET /api/admin/gemini-credit

Permisiune `settings.manage`. Răspuns `{ success, data: GeminiCreditSummary }`:
`settings` (`topups`, `alert_below_usd`), `topupsTotal`, `firstTopupDate`, `spentSinceFirstTopup`, `remaining` (null fără alimentări), `burnPerDay7d`, `daysLeft` (null = fără consum sau fără alimentări), `lastCall`, `lastError`, `windows.{today,d7,d30}.{total,byPlatform,byFeature}` (`calls`, `errors`, `cost`), `sources` (eghiseul/CJO + notă dacă lipsește tabela pe CJO), `lowCredit`.

## POST /api/admin/gemini-credit

Permisiune `settings.manage`. Scrie `admin_settings.gemini_credit`.

| `action` | Câmpuri | Validare |
|---|---|---|
| `add_topup` | `amount_usd`, `date` (YYYY-MM-DD), `note?` | 0 < sumă ≤ 10.000 |
| `remove_topup` | `index` (în lista sortată după dată) | index existent |
| `set_threshold` | `alert_below_usd` | 0–1000 |

Răspuns `{ success, data: settings }` sau `{ success: false, error }` (400/500).

## Pagini admin

- `/admin/credit-gemini` — `settings.manage`.
- `/admin/erori-clienti` — `orders.view` sau `settings.manage`; query `days=7|30`, `kind`, `platform`.

## Alertă

`checkGeminiCreditAndAlert()` (`src/lib/ai/gemini-credit.ts`) rulează în cronul orar `/api/cron/invoice-health-check`, după proba `checkGeminiAndAlert()`.
