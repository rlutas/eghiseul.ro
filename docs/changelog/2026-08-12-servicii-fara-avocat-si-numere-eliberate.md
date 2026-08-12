# 2026-08-12 — Serviciile prin topograf primeau documente avocațiale; numerele de Barou arse se pun înapoi în circulație

## 1. Cauza: lista „fără avocat" enumera doar 5 servicii

Semnalat de Raul pe `E-260810-EP896` (Plan de Amplasament și Delimitare): comanda avea contract de asistență juridică generat, plus butoanele de împuternicire avocațială și cerere PF în „Procesare comandă".

`src/lib/documents/no-lawyer-services.ts` era o listă albă de 5 slug-uri (`certificat-constatator`, `extras-carte-funciara` + alias, `extras-plan-cadastral`, `identificare-imobil`). Cele 14 servicii imobiliare adăugate prin migrarea 084 (topograf) nu erau în ea → cădeau pe ramura „cu avocat": contract de asistență + număr de Barou din registrul central + numere de delegație.

**Fix — lista e acum INVERSATĂ:** whitelist `LAWYER_SERVICE_SLUGS` (cazier judiciar PF/PJ/legacy, cazier auto, cazier fiscal, naștere, căsătorie, celibat, integritate, extras multilingv ×2), **tot restul catalogului = fără avocat**, doar `contract-prestari` + factură. Catalogul imobiliar crește constant, deci default-ul sigur e „fără avocat". Slug lipsă/gol e tratat ca „cu avocat" (fail-safe — mai bine un document în plus decât unul legal lipsă).

Consumatori aliniați:
- `auto-generate.ts` (submit + post-payment), `ensure-barou-documents.ts` (sweep-ul de după plată)
- `api/admin/orders/[id]/generate-document` — **gardă server-side nouă**: 400 pe orice template ≠ `contract-prestari` la serviciile fără avocat (până acum butoanele erau doar ascunse în UI, un POST direct trecea)
- UI „Procesare comandă" (lista de documente generabile)
- `api/admin/orders/list` — rolul `avocat` vede acum DOAR serviciile prin avocat (include-only, nu excludere pe listă)

Test nou: `tests/unit/lib/documents/no-lawyer-services.test.ts` mapează TOT catalogul real (11 servicii cu avocat + 20 fără), ca lista să nu mai poată rămâne în urmă.

## 2. Curățenie: 5 comenzi, 10 numere de Barou

Auditul (`scripts/audit-registry-no-lawyer.mjs`) a găsit exact 10 numere alocate pe servicii fără avocat, pe 5 comenzi (`E-260722-M58C5`, `E-260804-YEYBF`, `E-260804-9K23B`, `E-260810-EP896`, `E-260811-U2AWZ`): 5 contracte (005907, 005986, 005989, 006024, 006028) + **5 delegații** (SM007408, SM007496, SM007499, SM007538, SM007542) — delegațiile erau încă ACTIVE, deși împuternicirile nu existau ca documente.

- Documentele: 6 rânduri `order_documents` + fișierele din S3 șterse (`scripts/cleanup-wrong-lawyer-docs.ts`). Niciunul nu fusese vizibil clientului (`visible_to_client = false`).
- Comenzile rămân cu `contract_prestari` + factură, cum trebuie.

## 3. Numerele nu mai rămân goluri în registru

`void_number` marchează numărul consumat pe veci — corect pentru un contract REAL anulat (rămâne cu mențiune în registrul fizic), dar nejustificat pentru o alocare care n-ar fi trebuit să existe.

Migrare nouă `supabase/registry/002_released_numbers.sql` (aplicată pe proiectul dedicat de registru):
- tabel `released_numbers` — lista de numere libere, cu urma greșelii (platformă, comandă, client, motiv, cine, când)
- RPC `release_number(registry_id, released_by, reason)` — scoate rândul din jurnal și pune numărul în listă (idempotent pe număr)
- `allocate_number` consumă **întâi cel mai mic număr liber** (`FOR UPDATE SKIP LOCKED`), abia apoi avansează `next_number`

Efect: golul se umple singur la următoarele comenzi plătite prin avocat, fără intervenție. ❌ „Ștergere definitivă" din `/admin/registru` trece acum tot prin `release_number` — numerele nu se mai pierd nici acolo.

Client: `releaseNumber()` în `src/lib/registry/client.ts` (fișier identic în repo-urile surori — de copiat și acolo).

## 4. Admin: cine face lucrarea

Caseta scria „nealocat (echipa internă)" pe orice comandă — inclusiv pe un PAD, deși topograful o vedea deja în portal (`/api/collaborator/orders` filtrează pe `service_id IN (serviciile lui) OR assigned_collaborator_id = el`). Părea că lucrarea n-are stăpân.

Acum secțiunea se numește „Cine face lucrarea" și spune direct:
- serviciu alocat colaboratorului → „**Topograf — <nume>** · comanda îi apare automat în portal", iar opțiunea implicită din select scrie `— implicit: <nume> (prin serviciu) —`
- serviciu intern (cazier, extras CF, constatator) → „**Echipa internă** · serviciul se face la noi", cu selectorul strâns sub „Trimite totuși la topograf (excepție)" — escape hatch-ul pentru identificare imobil rămâne intact

## 5. Cererile de anulare rămân la vedere în „În procesare"

Când clientul cere anularea, comanda trece pe `cancellation_requested` — status care nu era în niciun grup de tab, deci pica doar în „Toate", sortată după `paid_at`. Adică jos în listă, ușor de ratat, deși e muncă de făcut (cineva trebuie să decidă și să dea refundul). Semnalat pe `CJO-20260811-23113`.

`cancellation_requested` e acum în `PROCESSING_GROUP` (`src/lib/admin/orders-tabs.ts`) — sursă unică pentru listă, pentru badge-ul de pe tab și pentru dashboard. Rândul poartă deja badge-ul roșu „Anulare solicitată", deci se distinge imediat între celelalte.

Același fix pe CJO/ecazier (repo `cazierjudiciaronline.com`): lista era duplicată în `api/admin/orders/route.ts` și `api/admin/orders/counts/route.ts` — au fost înlocuite cu `PROCESSING_TAB_STATUSES` din `src/lib/order-status.ts`, ca să nu mai poată diverge.

Nemodificat intenționat: `cancellation_requested` rămâne cu deadline-ul oprit și în afara statusurilor de venit — schimbăm doar vizibilitatea, nu contabilitatea. Teste de regresie pe ambele codebase-uri.

## 6. Search Console: proprietatea eghiseul.ro picase pe „neverificat"

Metoda de confirmare era „fișier HTML", iar `googleXXXX.html` trăia pe WordPress — la migrarea pe Next.js n-a fost portat, deci Google nu mai găsea nimic la adresa aia (`public/` n-avea niciun `google*.html`). Nu era problemă de hosting: `/73975f21070e43bc6ecac26b917d8cf1.txt` răspunde 200, iar `www` merge (308 → apex).

Confirmarea stă acum **în cod**: `metadata.verification.google` în `src/app/layout.tsx`, deci pleacă la fiecare deploy și nu se mai poate pierde la o migrare. Verificat în HTML-ul de producție după deploy.

Confirmarea prin Google Analytics NU e o opțiune aici: `gtag.js` se încarcă doar după acceptul de cookie-uri (Consent Mode v2), deci robotul Google nu-l vede. GA4 (`G-8LFRWD479Z`) funcționează — verificat live în browser: `gtag/js` 200 + `page_view` → 204. GTM nu e folosit deloc; tag-ul Google Ads `AW-11464910041` vine din legătura GA4↔Ads, nu din cod.

## 7. Certificat constatator „fonduri IMM" — verificare, nu bug

Semnalat că `E-260811-GC4MA` (ELIEZER PROD SRL) pare emis „de bază" deși s-a cerut „fonduri IMM", și că cele două comenzi ale firmei par identice. Verificat pe documentele reale din S3, comparativ cu două certificate „de bază" emise în aceleași zile: **ambele sunt corect IMM** (13 pagini + secțiunea „ISTORIC PE SEDII SI/SAU ACTIVITATI AUTORIZATE"; „de bază" = 5 pagini, fără). Par identice fiindcă sunt pe aceeași firmă, la o zi distanță — diferă scopul tipărit la final (Fonduri Europene vs AFIR), numărul de raport și codul de verificare. Detalii + capcana din worker: `docs/services/certificat-constatator/README.md`.

## 8. Articolul ANCPI actualizat: e-Terra a repornit, platformele publice NU

Comunicat ANCPI/Guvern: marți **11 august, ora 15:00**, e-Terra a fost repornită **etapizat** pentru personalul ANCPI, OCPI și notarii publici; de **miercuri 12 august, ora 8:30**, accesul s-a extins la topografii autorizați, experții tehnici judiciari și executorii judecătorești.

Nuanța pe care o ratează majoritatea titlurilor din presă și pe care articolul o pune în față: **platformele online destinate publicului rămân oprite** („se repun etapizat, cu anunț prealabil"), inclusiv cea prin care se eliberează extrasele de carte funciară. Verificat de noi în aceeași zi: `epay.ancpi.ro` nu răspunde deloc. Deci serviciul nostru rămâne blocat, comenzile stau în coadă.

Actualizat în `src/app/ancpi-nu-functioneaza/page.tsx`:
- H1 + titlul SERP („ce funcționează azi"), descrierea, `dateModified` → 12.08
- intro „situația la zi" + secțiunea de status live: răspunsul la „mai e picat?" e acum **„parțial"**, cu explicația cine are acces și cine nu
- cronologie: două intrări noi (11 și 12 august), cu ~94.000 de cereri cu rang protejat, termene prelungite, prelungirea valabilității extraselor emise înainte de incident, avertismentul privind timpii de răspuns și PDF-urile temporar indisponibile, plus numerele de call center
- „Actualizări": secțiune nouă pentru 12 august
- FAQ: întrebare nouă („am citit că e-Terra a repornit, de ce tot nu-mi iau extrasul?") + rescrise răspunsurile despre obținerea extrasului și despre tranzacțiile programate (notarii pot înregistra din nou actele, dar extrasele de autentificare n-au fost disponibile din prima zi)

## Verificare

- `npx tsc --noEmit` curat, `npm run lint` 0 erori, `npm run build` OK, 1483 teste verzi (34 noi).
- Reutilizarea numerelor testată pe tranzacție cu ROLLBACK pe registrul real: contract → 005907, delegație → SM007408, a doua alocare → 005986, `next_number` neatins, lista de libere neschimbată după rollback.
- Audit re-rulat după curățenie: **0** numere pe servicii fără avocat, **0** documente avocațiale rămase.
- CJO/ecazier: `tsc` curat, 422 teste verzi (5 noi).
- Eticheta GSC confirmată în HTML-ul de producție; GA4 verificat live în browser (page_view → 204).
