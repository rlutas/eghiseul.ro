# 21.10.2026 — Formularul mai rapid: „Plătește" și curierul nu mai așteaptă după servere din America
<!-- categorie: infrastructura -->

## Pentru echipă

- **Ce se întâmpla:** după „Plătește", clientul aștepta câteva secunde până la pagina de plată, iar la pasul Livrare prețurile de curier apăreau greu (1,5–2 secunde de fiecare dată).
- **De ce:** serverele site-ului rulau în America (Washington), deși baza de date e la Londra, iar curierii și fișierele sunt în Europa. Fiecare pas făcea zeci de drumuri peste ocean.
- **Acum:**
  - serverele rulează la Londra, lângă baza de date;
  - contractul se generează după ce clientul ajunge la plată, nu înainte;
  - prețurile de curier pentru aceeași localitate se rețin 5 minute, deci revenirea la pasul Livrare e instantanee.
- Pentru voi nu se schimbă nimic în admin. Dacă un client spune că formularul „se încarcă greu", spuneți-ne la ce pas.

---

- `vercel.json`: `"regions": ["lhr1"]` (implicit era `iad1`; Supabase e în `eu-west-2`, S3 în `eu-central-1`, API-urile Fan/Sameday în România). Se aplică tuturor funcțiilor, inclusiv cron-urilor.
- `/api/orders/[id]/submit`: `autoGenerateOrderDocuments` (mod `submit` = doar `contract-prestari`) rulează în `after()`; checkout-ul și plata nu depind de el.
- `/api/courier/quote`: `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600` când există cel puțin o cotație; răspunsurile goale nu se cachează.
- Măsurat înainte (din România, 21.10): quote 1,5–1,9 s; refuz `/submit` 0,4–0,6 s; antetul `x-vercel-id` arăta `fra1::iad1`.
