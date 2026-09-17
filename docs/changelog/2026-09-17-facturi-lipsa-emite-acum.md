# 17.09.2026 — Buton „Emite acum" pe eghiseul.ro; fix-ul de pe CJO a fost RETRAS (bug de duplicat)
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
- **Pe cazierjudiciaronline.com: NIMIC nou, deocamdată.** A fost livrat un
  fix (badge „Fără factură" + buton „Emite acum" + fereastră cron 30→180
  zile), dar avea un bug real — vezi mai jos — și a fost **retras în aceeași
  zi**. Rămâne de refăcut corect, separat.

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

**De refăcut corect, separat:** gate-ul trebuie pus pe un semnal real (de
exemplu `paid_at` înainte de data migrării pe EDIGITALIZARE, nu
`billing_provider`), iar deduplicarea din `ensureOblioInvoiceForOrder` /
`findInvoiceByStripeId` trebuie să caute pe tot istoricul, nu doar pe ziua
curentă, înainte să redeschidem fereastra cron-ului peste 30 de zile.

## Fix (ce a rămas live)

- `eghiseul.ro/src/app/api/admin/orders/[id]/emit-invoice/route.ts` (nou) +
  buton „Emite acum" lângă slotul de factură din pagina comenzii.
- `eghiseul.ro/src/app/admin/decontari/[payoutId]/page.tsx` — numărul de
  comandă CJO e acum link către admin-ul CJO.
- ~~cazierjudiciaronline.com — badge, buton, fereastră cron~~ **retras**,
  vezi mai sus.

## De reținut

Butonul „Emite acum" (eghiseul) refuză singur comenzile SmartBill (ecazier,
pre-migrare 08.2026) — acelea se emit manual din SmartBill/ANAF, nu prin
Oblio. Pe CJO, folosește doar emiterea manuală directă (nu există încă buton
de admin) până se reface corect fix-ul de mai sus.
