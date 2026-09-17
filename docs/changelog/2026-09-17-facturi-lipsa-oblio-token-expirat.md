# 17.09.2026 — 2 facturi lipsă emise manual (token Oblio expirat); sistemul de prevenție e în lucru
<!-- categorie: plati -->

## Pentru echipă

- Contabilitatea a semnalat 3 comenzi „nefacturate". Verificate una câte una:
  - **E-260810-3H9DK** — avea deja factură, **EGH-0399**. Fals pozitiv.
  - **E-260917-KJYNS** — chiar nu avea factură. Emisă acum: **EGH-0705**.
  - **CJO-20260813-73785** (contabilul scrisese anul greșit, 2027 în loc de
    2026; comanda TIE SERVICES INTERNATIONAL SRL, 270 lei) — chiar nu avea
    factură, era semnalată deja din 14.09 (vezi entry-ul de atunci) și rămăsese
    neemisă o lună. Emisă acum: **EGH-0706**.
- **Cauza, la ambele:** la momentul plății, cererea către Oblio a picat cu
  „token expirat" (eroare 401). Nu afectează plata clientului, doar factura —
  dar dacă nimeni nu observă în fereastra de reîncercare automată, comanda
  rămâne nefacturată la nesfârșit, fără alertă vizibilă pe CJO.
- **De reparat, ca să nu se mai repete** (nu e făcut încă, e planul imediat
  următor):
  1. reîncercare automată în același request când Oblio răspunde „token
     expirat" (nu doar la ora următoare, prin cron);
  2. fereastra de reîncercare pe cazierjudiciaronline.com (azi 30 de zile,
     fără alertă) extinsă + alertă când o comandă iese din fereastră tot
     nefacturată;
  3. secțiune „Facturi lipsă" în **Decontări**, cu ambele platforme la un loc;
  4. marcaj vizibil pe **lista de comenzi din CJO** când o comandă plătită nu
     are factură emisă, ca să nu mai depindem de contabil ca să aflăm.

---

## Rezumat tehnic

**Flux normal (ambele platforme):** la `payment_status='paid'`, webhook-ul
Stripe cheamă chokepoint-ul de emitere facturii (`ensureInvoiceForPaidOrder`
pe eghiseul — `src/lib/oblio/ensure-invoice.ts`; `ensureOblioInvoiceForOrder`
pe CJO — cazierjudiciaronline.com `src/lib/oblio/ensure-invoice.ts`), cu lock
atomic anti-dublare. Dacă apelul eșuează, lock-ul se eliberează și un cron
orar (`invoice-health-check` pe eghiseul, `health-check` pe CJO) reîncearcă.

**E-260917-KJYNS** — `order_history` arată eroarea exactă:
`Oblio API error: 401 - "The access token provided has expired"`. Cache-ul de
token (`getOblioToken()`, modul-level, pe process) golește cache-ul la 401
(`clearTokenCache()`) dar NU reîncearcă în același apel — doar aruncă eroarea.
Reparat manual: rulat `ensureInvoiceForPaidOrder` (același cod ca la cron) →
al doilea apel a luat token nou → **EGH-0705**.

**CJO-20260813-73785** — verificat direct în Oblio (căutare pe 13.08, nicio
factură pe TIE SERVICES / 270 lei) — confirmat că factura NU exista nicăieri,
nu doar nescrisă în DB. Cauza structurală: sweep-ul CJO
(`src/app/api/cron/health-check/route.ts`, cazierjudiciaronline.com) are
fereastră `paid_at >= now - 30 zile` — comanda plătită acum 35 de zile ieșise
din fereastră și nu mai era reîncercată, **fără nicio alertă** la ieșire (spre
deosebire de eghiseul, care postează pe Slack orice comandă rămasă nefacturată
după reîncercare). Reparat manual: rulat `ensureOblioInvoiceForOrder` direct
→ **EGH-0706**, scris în `orders.oblio_invoice_number` / `invoice_number` /
`invoice_url`.

**Nefăcut încă (plan imediat):**
- retry-on-401 în `oblioRequest`/`getAccessToken` (ambele platforme): la 401,
  golește cache-ul ȘI reîncearcă o dată în același apel, nu doar la cron;
- pe CJO: extinde fereastra sweep-ului (sau elimină plafonul, cu alertă Slack
  pe `stillMissing`, exact ca la eghiseul);
- `/admin/decontari` (eghiseul) citește deja CJO prin `createCjoClient`
  (`src/lib/supabase/cjo.ts`, folosit în `src/lib/admin/avocat-decont.ts` și
  `src/lib/accounting/payout-sync.ts`) — punct natural pentru o secțiune
  „Facturi lipsă" unificată pe ambele platforme;
- pe lista de comenzi din admin-ul CJO: badge vizibil când o comandă plătită
  nu are `oblio_invoice_number`/`invoice_number`.
