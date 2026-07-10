# 2026-07-10 — Incident draft E-260710-2S5EH + fixuri securitate draft & UX facturare PJ

## Incident (rezolvat)

Comanda **E-260710-2S5EH** (extras CF, 89 RON, guest): clienta nu putea plăti de pe mobil,
apoi — după ce a reușit — comanda apărea fără date în admin, legată de contul de test, și fără job ANCPI.

**Două cauze independente, ambele reale:**

1. **CUI neverificat** — clienta a ales facturare PJ și a completat datele firmei manual, fără
   să apese „Verifică". Validarea cere `cuiVerified`, dar singurul feedback era un toast generic
   invizibil pe mobil → butonul „Plătește" părea mort.
2. **Draft hijack prin link de resume** — link-ul de resume al comenzii, deschis dintr-o sesiune
   de browser logată pe alt cont (sesiunea de test internă), a declanșat autosave cu state gol:
   `property`+`billing` golite, `user_id` legat de contul străin. Clienta a plătit peste draftul stricat.

**Recovery:** `scripts/restore-order-2S5EH.js` — restaurare `property`/`billing` (valori pre-wipe +
ANAF), `user_id → NULL`, insert manual în `ancpi_jobs`. Workerul a livrat extrasul în ~15 min,
comanda `completed`. ⚠️ Factura **EGH-0022** a fost emisă cu billing gol → de stornat/re-emis
manual în Oblio pe DAMPOP DISTRIBUTION SRL (CUI RO22111530).

## Fixuri securitate `/api/orders/draft` (commit 88007c4)

| Gaură | Fix |
|---|---|
| POST-upsert după `friendly_order_id` fără NICIO verificare (oricine putea suprascrie orice draft) | gate `canUpdateDraft` identic cu PATCH |
| PATCH: orice user logat putea revendica (user_id) orice draft guest | claim doar dacă emailul sesiunii = emailul de contact al draftului |
| `customer_data` suprascris integral (secțiune goală ștergea secțiune plină) | `mergeCustomerData` server-side pe POST și PATCH |
| GET: draft de CONT expus prin `?email=` din URL | acces prin email doar la drafturi guest (`user_id IS NULL`) |
| `Math.random()` la generarea order-id (enumerabil) | `crypto.getRandomValues` |

Client-side (provider): restore-ul din server nu includea `property`/`vehicle` → ORICE resume de
serviciu imobiliar restaura module goale (rădăcina wipe-ului); prefill-ul din profil nu mai
suprascrie contactul unui draft restaurat; self-heal la 403 (draft nou, datele completate păstrate).

## UX facturare PJ + mobil (cerute de Raul)

- PJ: întâi doar CUI + „Verifică"; datele firmei apar după verificare ANAF, **read-only**
- **Auto-verificare CUI**: debounce ~1s la tastare + automat la apăsarea „Plătește"
- Serviciile cadastrale nu mai au sursă de facturare preselectată (alegi explicit PF/PJ)
- Erori inline (alege sursa / CUI neverificat); toast cu mesajul serverului la eșec submit
- Carduri PF/PJ pe un rând pe mobil; Județ/UAT și Nume/Prenume pe un rând
- Spațiu redus între header și H1 pe mobil; WhatsApp float ridicat deasupra barelor fixe pe `/comanda/*`

## Email (aceeași zi)

- Trimitere platformă de pe **comenzi@eghiseul.ro** (era contact@) — `RESEND_FROM`/`RESEND_REPLY_TO`
  în Vercel + `.env.local`; display name „eGhiseul.ro" fără diacritice
- Header emailuri branded: iconiță scut + wordmark „eGhiseul.ro" (`branded-layout.ts`)
- Semnături Zoho per persoană în `semnatura-email/` (Raul/Carla/Angela/Maria + generică);
  logo PNG hostat la `/images/brand/logo-wide.png`

## Lecție operațională

**Nu deschide link-uri de resume ale clienților într-un browser cu sesiune activă** — inspecția
comenzilor se face din DB (SELECT) sau admin panel.
