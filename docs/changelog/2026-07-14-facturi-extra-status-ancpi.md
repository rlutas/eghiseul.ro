# 2026-07-14 (după-amiază) — Facturi corecte, plăți extra vizibile, status ANCPI sincer

Trei incidente descoperite pe comanda reală **E-260714-WXGYQ** (certificat naștere, client în Italia) + un fix de zgomot pe workerul ANCPI.

## 1. 🔴 Factura afișa detalii greșite la opțiuni („— Chile", „— Engleză (UK)")

- **Simptom:** factura EGH-0047 avea „Apostilă de la Haga — Chile" și „Traducere Autorizată — Engleză (UK)". În DB comanda era CORECTĂ: apostilă → Italia, traducere → Italiană.
- **Cauza sufixului greșit:** nedeterminată cu certitudine (suspect: stare veche de draft la momentul emiterii); DB-ul actual e corect, dialogul de modificare nu atinge metadata.
- **Fix definitiv (`a9a2c76`):** liniile de factură Oblio folosesc `baseName` (fără sufixul țară/limbă din metadata) — pe un document fiscal, un detaliu greșit e mai rău decât niciun detaliu. Detaliul complet rămâne în admin, sumarul clientului și Stripe. `normalize.ts` expune acum `baseName`; teste noi pe normalize + invoice.
- **⚠️ EGH-0047 NU se re-emite din butonul admin** cât timp extra-plata era în curs — ar fi produs factură de 1.806,80 vs 1.624,50 încasat (colectarea folosește `total_price`, liniile includeau add-on-urile). Corecție doar manual în Oblio dacă clientul o cere.

## 2. 🔴 Plata extra: factura fiscală eșuase silențios + zero vizibilitate în admin

- **Context:** comanda a primit prin dialogul „Modifică" două opțiuni noi (legalizare 99 + apostilă notari 83,30) cu link de plată extra. Clientul a plătit (182,30, settle 12:14). Webhook-ul a emis **doar proforma PEGH-0001** — emiterea facturii fiscale a eșuat silențios (`extra_billing[0].invoice: null`), și nimic din toate astea nu era vizibil în admin.
- **Fix (`22a4101`):**
  - **Pagina comenzii admin (paritate CJO):** banner amber „⏳ Așteptăm plată extra" cu link copiabil (`pending_extra_payment_url`) cât timp clientul n-a plătit; banner verde „Plătit suplimentar X · Total încasat Y" după settle. La **Facturare**, sub factura principală: fiecare factură extra cu număr + link PDF + proforma; dacă lipsește → „⚠️ neemisă — se emite automat".
  - **Heal automat:** cron-ul orar `invoice-health-check` are acum un sweep pentru `extra_billing` cu `invoice: null` (14 zile lookback, max 10/rulare) → `createInvoiceFromProforma` + write-back + `order_history`.
- **Notă operațională:** Oblio răspunde cu HTML („Pagina inexistenta") la orice request non-browser de pe IP-ul local — emiterea/testarea Oblio se poate face DOAR de pe Vercel. CRON_SECRET e „Sensitive" în Vercel (nu se poate extrage cu `vercel env pull`) — declanșarea manuală a cronului nu e posibilă local; rularea orară programată face heal-ul.
- Opțiunile extra se adaugă pe comandă la momentul modificării (înainte de plată) — bannerul amber semnalează starea „neplătit încă"; nu s-a schimbat timing-ul.

## 3. 🔴 Badge „Sistem operațional" pe wizard în timpul unui outage ANCPI de 14h

- **Simptom:** `/comanda/extras-carte-funciara` afișa verde „Portal ANCPI: operațional" în timp ce admin → Stare portaluri arăta corect „Indisponibil, 14h+" (outage din 13.07 23:02).
- **Cauza:** `/api/status` avea două semnale optimiste care băteau realitatea: (1) ping-ul propriu din Vercel primea un 302 „sănătos" de la edge; (2) heartbeat-ul workerului era tratat ca dovadă că portalul merge — dar heartbeat-ul dovedește doar că workerul ajunge la API-ul NOSTRU. Tabelul `platform_outages` (scris de proba reală a workerului) nu era consultat deloc.
- **Fix (`21b699b`):** fereastra deschisă din `platform_outages` câștigă peste orice semnal optimist → `operational: false` + câmp nou `outageSince`. Verificat pe prod: API-ul raportează acum exact ce vede admin-ul.

## 4. Worker ANCPI: proba de portal la 15 min (era la 60s)

- Proba HTTP către ANCPI rula pe fiecare tick de poll (1.440/zi). Acum: rezultat cached 15 min (`PROBE_INTERVAL_MS`, worker commit `623bc6f`), raportat în continuare la FIECARE tick (freshness-ul din admin neafectat). **Poll-ul de joburi rămâne la 60s** — eliberarea instant nu e atinsă. Compromis: închiderea unui outage se vede cu până la 15 min întârziere.
- Deploy: `railway up` (autorizat de Raul), deployment SUCCESS 14.07 13:37 UTC.

## 5. Copy pe widget în timpul outage-ului (cerință Raul)

Când statusul e „indisponibil", widget-ul de pe paginile de comandă afișează un box amber: „Poți plasa comanda fără grijă: se procesează automat, cu prioritate, imediat ce platforma ANCPI/ONRC redevine funcțională. Te anunțăm pe email când documentul e eliberat." — outage-ul nu mai sperie clienții, comenzile se pun în coadă.

## Fișiere cheie

`src/lib/orders/normalize.ts` (baseName), `src/lib/oblio/invoice.ts`, `src/app/admin/orders/[id]/page.tsx` (ExtraPaymentBanners + facturi extra la Facturare), `src/app/api/cron/invoice-health-check/route.ts` (sweep extra), `src/app/api/status/route.ts` (platform_outages), `worker-ancpi/src/probe-portal.ts` (throttle).
