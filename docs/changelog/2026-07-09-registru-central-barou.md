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

## Admin & documente — finisaje (după feedback echipă)

- **CJO/ecazier, lista comenzi**: numerele Barou vizibile sub nr. comenzii
  („SM 005774 · 007256", + delegația integritate la duale); iconița de livrare
  electronică nu mai e fulger albastru (părea urgență) — plic gri; fulgerul
  PORTOCALIU rămâne doar pe urgente.
- **eghiseul, lista comenzi**: fulger portocaliu lângă client la comenzile cu
  procesare urgentă (nu exista niciun marcaj).
- **Împuternicire eghiseul** ({{INSTITUTIE}}): text complet „să se prezinte la
  IPJ SATU MARE, în vederea ridicării Cazier Auto. Motivul solicitării: ..."
  (motivul din wizard; înainte scria doar „IPJ SATU MARE - CAZIER AUTO" fără
  motiv). CJO/ecazier aveau deja formatul corect în template.
- Împuternicirile deja generate cu textul vechi: Regenereaza din admin —
  numărul se refolosește (idempotent), doar textul se corectează.

## Tracking: „clientul a vizualizat documentul" (migrarea 106)

La comenzile ONRC/ANCPI (și orice document livrat), după emailul „documentul
e gata" adminul vede acum dacă clientul chiar l-a deschis:

- **order_documents**: `first/last_viewed_by_client_at` + `client_view_count`,
  incrementate la preview-ul de pe pagina de status și la download-ul din cont
  (`track-client-view.ts`, non-fatal).
- **Admin, comandă**: badge pe fiecare document client-visible — verde
  „✓ vizualizat de client · 09.07.2026 14:30 (×3)" sau gri „nevizualizat de
  client"; + event în istoricul comenzii la prima vizualizare.
- **Bonus fix**: CHECK-ul `order_history.event_type` respingea SILENȚIOS
  `document_generation_failed` (vechi) și `barou_allocation_failed` (de azi) —
  evenimentele astea nu apăreau niciodată în istoric. Constraint extins.

## Acces avocat la registru (permisiunea `registry.manage`)

- Permisiune nouă `registry.manage` — separă registrul de `settings.manage`
  (care o implică, deci nimeni nu pierde acces). Rolul **avocat** o primește
  implicit: doamna avocat intră în /admin, vede DOAR comenzile (read-only),
  documentele și **Registrul** (alocă manual contract+delegație pentru
  cazurile ei, editează, anulează, exportă CSV pentru Barou) — fără setări,
  utilizatori sau plăți.
- Cont: /admin/users → Invită → rol „avocat".
- Fix teste CI: buildInstitutie testele verificau formatul VECHI al textului
  împuternicirii — actualizate la fraza completă cu motiv (11 → verzi).
- Scopare listă comenzi pentru rolul avocat: vede DOAR comenzile serviciilor
  CU avocat (constatator/CF/cadastru — excluse; același principiu ca scoparea
  colaboratorului pe serviciile asignate).
- Cont creat: gabriela_tarta@yahoo.com (rol avocat).
