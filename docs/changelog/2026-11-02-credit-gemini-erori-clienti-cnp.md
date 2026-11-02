# 02.11.2026 — Credit Gemini în admin, Erori clienți, ajutor la CNP greșit
<!-- categorie: automatizari -->

## Pentru echipă

- **Credit Gemini (OCR)** — pagină nouă în admin (meniul „Credit Gemini”, doar cine are acces la Setări). Arată dacă citirea automată a actelor merge, cât credit a mai rămas (estimat) și pentru câte zile ajunge, plus câte citiri s-au făcut azi / 7 / 30 de zile pe fiecare site. **Raul: trece acolo suma încărcată azi în AI Studio** — fără ea nu apare estimarea.
- Când creditul estimat scade sub prag (implicit 5 $) sau mai ajunge pentru mai puțin de 7 zile, vine un email o singură dată. Încarci credit în AI Studio, apoi treci suma în pagină.
- **Erori clienți** — pagină nouă în admin. Vedeți câți clienți au primit „poza nu a putut fi decodificată”, „CNP invalid”, „nu am putut extrage datele” sau încărcare eșuată, pe zile și pe comenzi, cu link spre comandă. Fără CNP, nume sau poze — doar mesajul afișat și dispozitivul (ex. „iPhone iOS 15”).
- **CNP greșit în formular**: sub eroare clientul vede acum ce spune CNP-ul tastat (bărbat/femeie, data nașterii, județul) și ce să verifice. Dacă actul scanat arată alt sex decât prima cifră, i se spune direct.
- **Poza care nu se poate citi pe telefoane mai vechi**: în loc să blocăm clientul, trimitem poza originală (JPG/PNG până la 2,5 MB). Pozele HEIC și fișierele goale primesc același mesaj ca până acum.
- Procedura: [Credit Gemini și Erori clienți](../admin/credit-gemini-si-erori-clienti.md).

---

## Tehnic

- **Migrarea 199** (`199_ai_usage_and_client_errors.sql`, aplicată): `ai_usage_log` + `client_error_log`, RLS activ fără politici, `REVOKE ALL` de la `anon`/`authenticated`; scriere/citire doar cu service role. Verificat: service role insert/select OK, anon `permission denied`. Același format pe CJO (agent paralel).
- **Logare Gemini**: `src/lib/ai/usage-log.ts` — `trackGeminiModel(model, modelName, feature)` învelește `generateContent` în `document-ocr.ts` (7 extractoare), `kyc-validation.ts` (3), `auto-supplier-cost.ts` (chitanța ANCPI) și proba orară din `gemini-health.ts`. Un rând per apel din `usageMetadata` (`thoughtsTokenCount` intră la output), cu `http_status`/`error_code` (`402:credit_depleted`, `429:quota`). Inserția nu e așteptată (pe Vercel e ținută în viață prin `waitUntil` din request context) — nu întârzie răspunsul OCR, nu aruncă.
- **Prețuri** (USD / 1M tokeni, paid tier Standard, https://ai.google.dev/gemini-api/docs/pricing, verificat 02.11.2026): `gemini-2.5-flash-lite` 0,10 intrare / 0,40 ieșire; `gemini-2.5-flash` 0,30 / 2,50. Model necunoscut → prețul flash (estimare pesimistă).
- **Credit**: `admin_settings.gemini_credit = { topups: [{date, amount_usd, note}], alert_below_usd }`; rămas = Σ alimentări − Σ `est_cost_usd` de la prima alimentare, din ambele DB (CJO prin `createCjoClient()`; dacă tabela lipsește → notă, doar eghiseul). `src/lib/ai/gemini-credit.ts` (`summarizeCredit` pur + `loadGeminiCreditSummary`). API `GET/POST /api/admin/gemini-credit` (`settings.manage`). Pagina `/admin/credit-gemini`.
- **Alertă**: `checkGeminiCreditAndAlert` în cronul orar `invoice-health-check`; stare în `admin_settings.gemini_credit_alert = { sent_at, topups_total }` — un email per episod, rearmat când se schimbă totalul alimentărilor, șters când estimarea revine peste praguri. Fără alimentări → fără alertă.
- **Erori clienți**: `POST /api/client-errors` (public, 30 / 10 min / IP în memorie, body ≤ 4 KB, mereu `{success:true}`), sanitizare în `src/lib/client-errors/schema.ts` (allowlist de câmpuri și chei `meta`, mesaj ≤ 300 cu cifre lungi/emailuri înlocuite, `page` fără query). Helper browser `reportClientError` (sendBeacon / fetch keepalive, dedupe per pagină). Apelat din `KYCDocumentsStep` (compresie, format, mărime, poză duplicată), `PersonalDataStep` (compresie, OCR eșuat, CNP invalid la blur — doar codul `LENGTH/FIRST_DIGIT/DATE/COUNTY/CHECKSUM`), `IdScanner` și `KYCTab` din cont (compresie, face-match). Pagina `/admin/erori-clienti` (`orders.view` sau `settings.manage`): filtre 7/30 zile, tip, site; pe zile, pe comenzi (link pe uuid), ultimele 300; include rândurile CJO dacă tabela există.
- **CNP**: `src/lib/validations/cnp-help.ts` — `describeInvalidCnp(cnp, sexDinOCR)` + `cnpErrorCode`; nu calculează și nu sugerează cifra de control corectă; codul de județ nu e tratat ca eroare. Teste: `tests/unit/lib/validations/cnp-help.test.ts`.
- **Fallback poză**: `src/lib/images/prepare-upload.ts` — la `DECODE_FAILED`/`CANVAS_UNAVAILABLE`/`ENCODE_FAILED` pe `image/jpeg|png` ≤ 2,5 MB trimite originalul (`meta.fallback='original'`); peste → eroarea veche + `fallback='too_large'`. Limita vine din corpul JSON al draftului (toate actele în base64, Vercel refuză > 4,5 MB); serverul acceptă 10–12 MB per document. Teste: `tests/unit/lib/images/prepare-upload.test.ts`.
- `payment_error` e în lista de tipuri, dar încă nu e apelat din pagina de plată.
