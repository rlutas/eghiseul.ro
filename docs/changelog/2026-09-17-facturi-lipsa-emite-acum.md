# 17.09.2026 — Buton „Emite acum" pe ambele platforme; pe CJO refăcut corect după un bug de duplicat
<!-- categorie: plati -->

## Pentru echipă

Contabilitatea a semnalat 3 comenzi cu factura lipsă: `E-260810-3H9DK` (avea
factură, EGH-0399 — fals pozitiv), `E-260917-KJYNS` și `CJO-20260813-73785`
(cea rămasă „de emis" din nota de pe 14.09). Ultimele două chiar nu aveau
factură — token Oblio expirat la momentul plății, pe ambele platforme.
Le-am emis manual azi: **EGH-0705** (eghiseul) și **EGH-0706** (CJO).

Ce a rămas, ca să nu mai ajungă la mine de fiecare dată:

- **Pe eghiseul.ro:** în comanda din admin, lângă numărul de factură lipsă
  apare butonul **„Emite acum"** — încearcă din nou emiterea, în siguranță
  (nu dublează dacă factura există deja în Oblio). Din **Decontări**, click
  pe numărul unei comenzi CJO te duce direct în admin-ul CJO.
- **Pe cazierjudiciaronline.com:** badge-ul **„Fără factură"** apare acum și
  pe comenzile CJO (nu doar ecazier), iar în „Detalii" comandă ai butonul
  **„Emite acum"**. Sistemul verifică singur, la fiecare oră, comenzile din
  ultimele 6 luni și emite ce lipsește. Un prim fix livrat dimineața avea un
  bug (ar fi dublat 69 de facturi vechi) și a fost retras; versiunea de acum
  are gărzile lipsă — vezi mai jos.
- **Comenzile de dinainte de 02.06.2026 (facturate atunci pe BMR) NU se
  ating:** nu apar ca „fără factură", butonul le refuză, cronul le sare.
  Facturăm doar pe EDIGITALIZARE; capitolul BMR e închis.
- Dacă Oblio răspunde „token expirat" la plată, sistemul reia singur, pe
  loc, cu token nou — cauza de azi nu se mai repetă.

## Cauza (de ce n-a mers factura)

Webhook-ul de plată apelează Oblio automat la achitare; dacă token-ul de
acces expirase chiar atunci, cererea pică cu
`401 - The access token provided has expired`. Nu blochează plata, doar
factura — se reîncearcă normal la ora următoare (cron).

Pe CJO, comanda a rămas nefacturată nedetectată o lună fiindcă sweep-ul orar
avea fereastra de doar 30 de zile, fără alertă la ieșirea din fereastră.

## De ce fix-ul de pe CJO a fost retras

Primul fix (`432c06e6`) muta gate-ul badge-ului „Fără factură" de pe
`source === "ecazier"` pe `billing_provider === "smartbill"`, și lărgea
fereastra cron-ului la 180 de zile. Ideea era corectă în principiu, dar
verificarea de după deploy a găsit un bug periculos: **69 de comenzi vechi
(aprilie–iunie 2026, sursa `cazierjudiciaronline`, `billing_provider='oblio'`)
au factură REALĂ emisă atunci de integrarea nativă Stripe→Oblio (sub compania
BMR, seria `BMR`), dar `invoice_number`/`oblio_invoice_number` nu s-au scris
niciodată în comandă** — exact riscul avertizat în comentariul original al
codului. Verificat direct în Oblio: `CJO-20260409-44096` are factura
`BMR-1536`, reală, din aprilie.

Cu fereastra cron extinsă la 180 de zile, aceste 69 de comenzi intrau în
verificarea orară — iar `ensureOblioInvoiceForOrder` caută duplicat doar prin
facturile emise **în ziua curentă**, deci nu găsea factura din aprilie. La
următoarea rulare a cron-ului, sistemul ar fi emis **facturi duplicate**
pentru comenzi deja facturate, automat, fără să apese nimeni pe nimic.
Verificat: nu apucase să se întâmple. Commit-ul a fost **revertat integral**
(`9c4b017f`) înainte de următorul tick de cron — fereastra e înapoi la 30 de
zile, badge-ul înapoi pe `source === "ecazier"`, butonul „Emite acum" scos.

## Refacerea corectă pe CJO (aceeași zi, după revert)

Constanta `APP_INVOICING_SINCE = "2026-06-02"` în `src/lib/order-status.ts`
e granița: tot ce e plătit înainte a fost facturat de integrarea nativă BMR
fără să persiste numărul. De la ea depind toate cele trei căi:

- `ensureOblioInvoiceForOrder` refuză comenzile pre-cutover
  (`skipped` / `legacy_pre_cutover`) — indiferent cine o cheamă (webhook,
  cron, buton).
- Sweep-ul din `cron/health-check` caută 180 de zile în urmă, dar cu podea la
  cutover.
- `isPaidButUninvoiced` e pe `paid_at >= cutover`, nu pe `source`; rândurile
  SmartBill rămân semnalate (gol real, doar că nu se repară prin Oblio).

Deduplicarea: `findInvoiceByStripeId` primește fereastră
(`issuedAfter`/`issuedBefore`, paginat 100/pagină) și se caută de la ziua
de dinaintea plății până azi. Facturile emise de aplicație au acum
`Comanda <order_number>` în `mentions`, iar dedup-ul potrivește și pe el —
vechiul match pe Stripe id nu prindea NICIODATĂ facturile emise de aplicație
(mentions-ul nu conținea id-ul), iar comenzile telefonice plătite prin
transfer/numerar n-au Stripe id deloc.

`oblioFetch()` în `src/lib/oblio/client.ts`: la 401 golește cache-ul de
token, reautorizează și reîncearcă o singură dată — cauza reală a ambelor
facturi lipsă de azi.

Teste: `tests/unit/lib/order-status-uninvoiced.test.ts` (granița cutover),
`tests/unit/lib/oblio-client-find-invoice.test.ts` (fereastră + paginare,
retry 401 fără buclă, order number în mentions).

Cele 69 de comenzi BMR rămân cu `invoice_number` gol în DB — decizie: nu
se leagă, nu se reemit; BMR e capitol închis.

## Fix (ce e live)

- `eghiseul.ro/src/app/api/admin/orders/[id]/emit-invoice/route.ts` (nou) +
  buton „Emite acum" lângă slotul de factură din pagina comenzii; metoda de
  încasare vine din `payment_method`.
- `eghiseul.ro/src/app/admin/decontari/[payoutId]/page.tsx` — numărul de
  comandă CJO e acum link către admin-ul CJO.
- cazierjudiciaronline.com — badge, buton „Emite acum", cron 180 zile,
  dedup pe istoric, retry 401, gardă cutover (commit-ul de refacere, după
  revertul `9c4b017f`).

## De reținut

Butonul „Emite acum" (eghiseul) apare doar la comenzi cu plata confirmată și
fără număr de factură; emite cu metoda de încasare reală a comenzii (card /
transfer bancar / numerar), nu „Card" implicit. Pe eghiseul nu există comenzi
SmartBill — acelea sunt doar pe ecazier (CJO, pre-migrare 08.2026) și se emit
manual din SmartBill/ANAF; pe CJO butonul nu apare la ele. Pe CJO, la o
comandă de dinainte de 02.06.2026 butonul răspunde că factura există deja în
Oblio pe seria BMR — n-o reemite, caut-o acolo.
