# Plan — ajutarea clientului blocat în formular (draft/abandonat)

**Data:** 2026-07-21. **Status:** GO pe fluxul draft/abandonat (Raul, 2026-07-21).

## Decizie Raul (2026-07-21)
- **DA** — mergem pe ajutarea draftului/abandonatului existent. **NU mai facem
  comanda nouă manuală** (operatorul nu re-creează comanda; ajută draftul curent).
- ⚠️ **Contract + KYC + plata rămân OBLIGATORIU la client** — operatorul NU le face
  în locul lui (constrângere legală/securitate). Operatorul ajută la FORMULAR
  (unde s-a blocat), apoi clientul continuă singur cu semnătură + KYC + plată.
- Deci Faza 4 „operator finalizează în locul clientului" = EXCLUSĂ pentru
  semnătură/KYC/plată; rămâne doar eventual editarea datelor de formular.

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

### Faza 2.5 — operator editează date formular (decis DA de Raul)
- Pe detaliul draft/abandonat, operatorul poate REPARA câmpuri din formular
  (nume/adresă/CNP greșit etc.) → salvează în `customer_data` → clientul continuă
  cu datele corectate. **NU atinge KYC / contract / plată** (rămân la client).
- eghiseul are deja `ModifyOrderDialog` + `/api/admin/orders/[id]/modify` (pt
  comenzi plătite) — de extins/refolosit pt drafturi, cu audit. CJO are edit admin.

## Ordine de execuție (agreată)
1. **Faza 1 — LIVRAT 2026-07-21 (eghiseul):** coloană `orders.current_step`
   (migrarea 129, rulată în prod); draft route o persistă (3 căi de scriere);
   lista admin arată „pas: X" pe draft/pending/abandoned; resume server-side
   revine la pasul salvat (reducerul RESTORE derivă numărul din stepId, nu mai
   hardcodează 'contact'). Rămas: panou detaliu (Faza 2), editare (2.5), buton
   link (3), apoi CJO.
2. **Faza 2** — panou admin „unde s-a blocat" (pas + câmpuri grupate + lipsuri).
3. **Faza 2.5** — operator editează date formular (fără KYC/contract/plată).
4. **Faza 3** — buton „Trimite link continuare" (+cupon), model securizat eghiseul.
5. (CJO e mai aproape: are `last_step` + `/admin/abandoned`; primește editarea +
   butonul de link cu securitatea întărită.)

Faza 4 (operator finalizează semnătură/KYC/plată) = EXCLUSĂ (constrângere Raul).

## Diferențe de reținut
- Model de date divergent: eghiseul = `orders.status='draft'` (fără coloană pas);
  CJO = `abandoned_sessions` dedicat cu `last_step` + UI admin. CJO e mai aproape.
- Securitate divergentă: la unificare, standard = modelul TARE al eghiseul, NU
  bearer-ul CJO.
