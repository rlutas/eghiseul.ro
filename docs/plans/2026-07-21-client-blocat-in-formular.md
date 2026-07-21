# Plan — ajutarea clientului blocat în formular (draft/abandonat)

**Data:** 2026-07-21. **Status:** PLAN (nedemarat) — așteaptă GO de la Raul.

## Obiectiv (Raul)
Când clientul are probleme și nu poate continua în wizard, echipa să poată:
(a) intra în comanda draft/abandonată și **vedea unde s-a blocat** + ce a completat;
(b) **să-l ajute** (repară date / trimite link / ghidează);
(c) clientul **continuă aceeași comandă** până la final.

## Stare actuală (investigat pe ambele platforme)
| | eghiseul | CJO/ecazier |
|---|---|---|
| Date formular salvate incremental server | ✅ `orders.customer_data` (draft) | ✅ `abandoned_sessions.form_data` |
| **Pasul curent salvat pe server** | ❌ doar localStorage | ✅ `last_step` |
| Admin listă drafturi/abandonate | ✅ tab „Neplătite" (fără pas) | ✅ `/admin/abandoned` (cu pas) |
| Admin vede câmpurile completate grupat | ⚠️ deschizi comanda, citești JSON | ✅ grupe cu etichete + card documente |
| Resume rehidratează datele | ✅ | ✅ |
| **Resume sare la pasul corect** | ❌ repornește la pas 1 | ✅ |
| Securitate resume | ✅ tare (email-scoped, anti-hijack 88007c4) | ⚠️ token bearer simplu |

**Lipsă pe AMBELE:** semnalul „DE CE s-a blocat" (ce câmp/eroare l-a oprit) —
vezi pasul, nu blocajul. Și „operator continuă în locul clientului".

## Plan pe faze
### Faza 1 — eghiseul: persistă pasul (parity cu CJO) — RECOMANDAT PRIMA
- Coloană `current_step` pe `orders` (draft). Se scrie în POST/PATCH draft
  (valoarea deja se trimite în body — `modular-wizard-provider.tsx:1487` — dar e
  ignorată în `api/orders/draft/route.ts`). Afișat în lista admin. Resume revine
  la pasul corect (acum e hardcodat `contact`).
- Efort mic-mediu (1 migrare + ~4 puncte). Risc mic. Rezolvă simultan „vezi unde
  s-a blocat" + „resume la pasul corect".

### Faza 2 — panou „unde s-a blocat" în admin (ambele)
- Pe detaliul draft/abandonat: câmpuri completate grupate cu etichete + pasul +
  „următorul câmp necesar" + lista lipsurilor. Wizard-ul eghiseul deja calculează
  lista de erori (`data-wizard-error`, scroll-to-first-error) — o logăm pe draft.
- Port pattern-ul CJO `STEP_GROUPS`/`FIELD_LABELS` (`admin/abandoned/[id]`) pe
  eghiseul. Read-only, risc mic. Depinde de Faza 1 pt pas.

### Faza 3 — buton „Trimite link resume" în admin
- Un click → link + cupon, refolosind builder-ele din cron-ul recovery
  (`recovery-emails/route.ts buildResumeUrl` / CJO `?recover=TOKEN`).
- ⚠️ păstrăm modelul securizat eghiseul (email-scoped, unclaimed-only). NU portăm
  token-ul bearer slab de pe CJO. Lecția draft-hijack (E-260710-2S5EH).
- Efort mic-mediu.

### Faza 4 — operator „continuă în locul clientului" (co-pilot) — AMÂNAT
- Deschizi draftul, repari câmp, i-l dai înapoi la același pas SAU îl finalizezi.
- Efort mare, risc mediu-mare (concurență client↔operator, ownership, audit).
- Se leagă de **redesign-ul fluxului telefonic eghiseul** (marcat „DE REGÂNDIT"
  în docs/admin/comenzi-telefonice) — merge PE ala, nu peste fluxul respins.

## Recomandare
Începem cu **Faza 1 + Faza 2** (eghiseul ajunge la nivelul CJO + panou de
diagnoză pe ambele) = ~80% din obiectiv: vezi exact unde/în ce câmp s-a blocat.
Apoi Faza 3. Faza 4 doar la reproiectarea fluxului telefonic.

## Diferențe de reținut
- Model de date divergent: eghiseul = `orders.status='draft'` (fără coloană pas);
  CJO = `abandoned_sessions` dedicat cu `last_step` + UI admin. CJO e mai aproape.
- Securitate divergentă: la unificare, standard = modelul TARE al eghiseul, NU
  bearer-ul CJO.
