# 17.09.2026 — Comenzi plătite fără factură: se văd peste tot și se repară cu un click
<!-- categorie: plati -->

## Pentru echipă

Contabilitatea a semnalat 3 comenzi cu factura lipsă: `E-260810-3H9DK` (avea
factură, EGH-0399 — fals pozitiv), `E-260917-KJYNS` și `CJO-20260813-73785`
(cea rămasă „de emis" din nota de pe 14.09). Ultimele două chiar nu aveau
factură — token Oblio expirat la momentul plății, pe ambele platforme.
Le-am emis manual azi: **EGH-0705** (eghiseul) și **EGH-0706** (CJO).

Ca să nu mai ajungă la mine de fiecare dată:

- În comanda din admin (eghiseul ȘI cazierjudiciaronline.com), lângă numărul
  de factură lipsă apare acum butonul **„Emite acum"** — încearcă din nou
  emiterea, în siguranță (nu dublează dacă factura există deja în Oblio).
- Pe cazierjudiciaronline.com, alerta roșie „Fără factură" nu mai era
  afișată NICIODATĂ în lista de comenzi — de-aia n-a văzut-o nimeni 35 de
  zile. Acum apare corect.
- Din **Decontări**, click pe numărul unei comenzi CJO te duce direct în
  admin-ul CJO, la comanda respectivă, unde poți emite factura pe loc.
- Verificarea automată orară nu mai renunță la o comandă veche de peste 30
  de zile — acum ține evidența 180 de zile.

## Cauza

**De ce nu s-a emis factura.** Webhook-ul de plată apelează Oblio automat la
achitare; dacă token-ul de acces expirase chiar atunci, cererea pică cu
`401 - The access token provided has expired`. Nu blochează plata, doar
factura — se reîncearcă normal la ora următoare (cron).

**De ce nu s-a reparat singură — CJO.** `isPaidButUninvoiced()`
(`src/lib/order-status.ts`, cazierjudiciaronline.com) era gândită doar pentru
`source === "ecazier"` (motiv istoric: comenzile vechi BMR nu aveau
`invoice_number` salvat deloc, ar fi apărut toate roșii fals). Rezultatul: pe
cazierjudiciaronline.com — sursa comenzii `CJO-20260813-73785` — bagheta de
alertă nu apărea NICIODATĂ, indiferent de comandă. Riscul real ținea de
`billing_provider === "smartbill"` (fluxul vechi), nu de sursă — am mutat
condiția pe coloana corectă.

**De ce nu s-a reparat singură — cron-ul.** Sweep-ul orar de pe CJO uita de o
comandă mai veche de 30 de zile — o extindere anterioară (14.09) adăugase
statusul `completed` în verificare, dar fereastra de 30 de zile expirase deja
pentru această comandă înainte să prindă vreo rulare eligibilă. Extinsă la
180 de zile.

## Fix

- `cazierjudiciaronline.com/src/lib/order-status.ts` — `isPaidButUninvoiced()`
  filtrează pe `billing_provider !== 'smartbill'`, nu pe sursă.
- `cazierjudiciaronline.com/src/app/api/cron/health-check/route.ts` — geam de
  detecție 30 → 180 zile.
- `cazierjudiciaronline.com/src/app/api/admin/orders/[id]/emit-invoice/route.ts`
  (nou) + buton „Emite acum" în dialogul de detalii comandă.
- `eghiseul.ro/src/app/api/admin/orders/[id]/emit-invoice/route.ts` (nou) +
  buton „Emite acum" lângă slotul de factură din pagina comenzii.
- `eghiseul.ro/src/app/admin/decontari/[payoutId]/page.tsx` — numărul de
  comandă CJO e acum link către admin-ul CJO.

## De reținut

Butonul „Emite acum" refuză singur comenzile SmartBill (ecazier, pre-migrare
08.2026) — acelea se emit manual din SmartBill/ANAF, nu prin Oblio.
