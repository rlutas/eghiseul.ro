# 2026-07-09 — Registru central numere Barou, LIVE pe 3 platforme

> Documentația completă (arhitectură, fluxuri, operare, failure modes):
> **`docs/registru-central/README.md`** — acest entry e doar jurnalul livrării.

## Ce s-a livrat

- **Proiect Supabase dedicat** `registru-barou-central` (ksqkttalapjlgugshuks,
  eu-west-2) = sursa unică pentru numerele Barou (contract asistență +
  împuternicire), partajată de eghiseul.ro + cazierjudiciaronline.com +
  ecazier.ro. RPC `allocate_number` atomic și IDEMPOTENT; RLS zero-policies
  (doar service key).
- **Alocare DOAR după plată** pe toate platformele (webhook Stripe + fallback
  confirm-payment + cron sweep orar self-heal). eghiseul: submit generează
  doar contract-prestari; contract-asistenta se generează cu număr real DUPĂ
  plată. CJO/ecazier: numerele se scriu automat pe comandă + contractul PDF se
  regenerează cu „SM XXXXXX" (adio Google Sheets + tastare manuală).
- **Fix CJO**: a doua delegație (comenzi duale cazier+integritate) are coloana
  ei (`delegation_integritate_number`) — înainte o suprascria pe prima.
- **Admin eghiseul**: `/admin/registru` = registrul central (jurnal
  multi-platformă, badge CJO/ecazier, export CSV cu coloana Platforma, banner
  explicativ); `generate-document` refuză alocarea pe comenzi neplătite (400).
- **Migrare date**: 2 intervale legacy + 156 intrări copiate central
  (script `scripts/migrate-registry-to-central.ts`, cu `--delta` și
  `--sheet=csv`); migrarea 104 (eghiseul) + 025 (CJO) rulate cu backfill
  complet (13/13, respectiv 1736/1736 comenzi pre-cutover marcate).
- **Intervalele oficiale Barou 2026** (din adresa oficială) seedate la
  cutover: contracte 003551–006550 (next 005772), împuterniciri SM
  005051–008050 (next SM007255) — continuă EXACT de unde a rămas evidența
  manuală (ultimele folosite: 005771 / 007254). Intervalele legacy arhivate.

## Deploy

- eghiseul.ro `a6b8d45` + banner/docs follow-up · cazierjudiciaronline.com
  `c5a7a889` — ambele Production Ready 2026-07-09.
- Env `REGISTRY_SUPABASE_URL/SERVICE_KEY` pe Vercel (prod+preview, ambele
  proiecte).

## Follow-up (aceeași zi)

1. ✅ Jurnalul complet 2026 importat din CSV-uri Sheets (1982 contracte + 2203
   delegații, legate contract↔delegație prin coloana H; 007253 recuperată).
2. ✅ Prima comandă reală verificată end-to-end: CJO-20260709-14944 → contract
   005774 + delegație SM007256, alocate automat la plată.
3. ✅ Fix CJO `contract-pdf.ts`: numărul Barou mutat de pe titlul Prestări pe
   „Contract de Asistenta" (PDF-ul comenzii reale regenerat + verificat).
4. ✅ Jurnal: grupuri complete cross-pagină, numere padded (005774/SM007256),
   Sursa = site-ul, editare/anulare/restaurare/ștergere per număr, alocare
   manuală combo Contract+Delegatie.
5. ✅ TOATE 3 platformele verificate pe comenzi reale: CJO-20260709-14944
   (005774/007256), EJC-20260709-05461 ecazier (005775/007257),
   E-260709-V9G9M eghiseul (005778/SM007260 — pe numele persoanei, nu al
   firmei de facturare).
6. ✅ Fix dublu-SM pe CJO/ecazier: delegation_number stochează doar numărul
   padded (template-ul pune „SERIA: SM"); comenzile de azi corectate în DB.
7. ✅ Nume de familie primul pe documentele CJO/ecazier (registru,
   împuternicire, contract).
8. ✅ Fix eghiseul PF/PJ: lista admin + generarea documentelor urmează
   beneficiarul serviciului, nu entitatea de facturare (comandă PF cu factura
   pe angajator nu mai apare/generează ca PJ).

## Cazier auto: poza permisului obligatorie (regresie E-260709-WT4KL)

Comanda a intrat cu nr. permis (colectat din migrarea 075) dar FĂRĂ nicio poză
a permisului, iar nr. permisului nici nu se afișa în admin. Fix (migrarea 105):

- **Wizard**: pasul Documente KYC cere acum obligatoriu „Permis de Conducere —
  față" + „verso" la cazier-auto (config-driven:
  `personalKyc.extraDocuments: ['permis_fata','permis_verso']` — mecanism nou,
  reutilizabil pentru orice serviciu care are nevoie de documente extra; se
  cer și clienților cu KYC salvat în cont, permisul nu face parte din KYC).
- **Admin Detalii Serviciu**: afișează acum Nr. permis / Nr. înmatriculare /
  VIN din customer_data.vehicle (nu se afișau deloc).
- **Solicită documente**: tipuri noi `permis_fata`/`permis_verso` — pentru
  E-260709-WT4KL echipa cere pozele direct din admin (link de reîncărcare).
- Bonus fix latent: click-ul pe cardurile de upload act identitate deschidea
  input-ul greșit (cădea pe ref-ul certificatului) — mapare unificată.
