# 2026-07-30 — Tracking Poșta Română reparat (toate platformele) + fixuri CJO

## 1. Link-ul de tracking Poșta Română ducea în 404

Echipa a raportat (screenshot WhatsApp): butonul „Tracking" pe comenzile cu Poșta
Română deschidea pagina „Pagina pe care o cauți nu există" (AWB
`RN7556879850RO`, comanda `E-260713-T5BVW`).

**Cauza**: Poșta și-a retras pagina `awb.html`. Capcană: răspunde **HTTP 200**
dar servește conținut de 404 (soft-404), deci un health-check pe status nu ar fi
prins-o.

**Fixul** — trackerul oficial curent: `https://www.posta-romana.ro/track-trace.html?awb=<AWB>`.
Verificat în browser real: pagina preia AWB-ul din query și interoghează singură
`/cnpr-app/modules/track-and-trace/ajax/status.php` — fără intervenția clientului.

| Platformă | Înainte | Cum s-a reparat |
|---|---|---|
| eghiseul | `posta-romana.ro/awb.html?awb=` (mort) | `set-awb/route.ts` generează link-ul nou; URL-ul e **persistat** în `orders.delivery_tracking_url` → backfill RULAT pe 5 comenzi shipped (`scripts/backfill-posta-tracking-url-2026-07-30.ts`) |
| CJO + ecazier | `awb.woot.ro` (agregator-scraper, funcțional dar neoficial) | `src/lib/courier-tracking.ts` (sursă unică, link construit la randare) → comenzile vechi primesc automat linkul nou, fără backfill |

**De știut pentru echipă**: AWB-urile proaspăt predate apar în sistemul Poștei cu
întârziere de câteva ore — pagina afișează „trimiterea nu a fost încă
înregistrată" până atunci. Nu e link stricat.

Istoric URL Poșta: `pfrpost.ro` (mort, HTTP 000) → `awb.woot.ro` (22.05) →
`awb.html` oficial (eghiseul) → **`track-trace.html` oficial (30.07, ambele
codebase-uri)**.

Commits: eghiseul `6cd78c3`, CJO `20629851`.

## 2. CJO/ecazier: termenul estimat — ziua intrării = ziua 0

`CJO-20260730-56780` (urgent 1-2 zile, plătită joi 10:58) promitea min **azi** /
max **mâine**. Semantica nouă: ziua intrării comenzii = ziua ZERO, datele =
intrare + N zile lucrătoare, **fără cutoff 12:00** → vineri/luni. Comenzile de
după-amiază ies identic ca înainte (plângerea inversă din 22.07 rămâne
rezolvată — ambele comenzi reale sunt teste de regresie).

⚠️ **eghiseul are calculator separat (`order-estimate.ts`) și e încă pe semantica
veche (start = ziua 1, cu cutoff)** — de decis dacă se aliniază.

Detalii: `docs/decisions/2026-07-30-termen-ziua-intrarii-e-ziua-zero.md` (repo CJO).
Backfill CJO (8/14 comenzi active): rulat de Raul cu
`npx tsx scripts/backfill-estimates-2026-07-30.ts --apply`.

## 3. CJO: statusul se salvează automat pe pagina comenzii

Echipa schimba selectul de status și pleca fără să apese „Actualizeaza" —
statusul nu se salva. Auto-save-ul NU fusese implementat pe pagina individuală
(doar credeam). Acum: selectezi → PATCH imediat, toast succes/eroare, revert la
eșec, butonul eliminat. Commit CJO `4ab6d39f`.
