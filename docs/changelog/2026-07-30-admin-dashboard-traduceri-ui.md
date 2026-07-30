# 2026-07-30 — Dashboard admin: taguri traduse + sursă unică de statusuri + UI curățat

Raul: „/admin trebuie aranjat neapărat — tagurile să fie traduse, tot aranjat frumos".
Trecut prin dashboard cu skill-ul ui-ux-pro-max (recomandare: Data-Dense Dashboard,
fără ornamente, KPI cards + row highlighting).

## Problema principală: statusuri netraduse

Dashboard-ul avea o COPIE veche de 9 statusuri a config-ului de badge-uri, în timp
ce workflow-ul real are 26. Orice comandă în `submitted_to_institution`,
`documents_generated`, `standby`, `la_tradus`… apărea în „Distribuție pe status" și
în „Comenzi recente" ca **slug brut englezesc**. Activitatea recentă arăta
`→ document_ready` netradus + evenimente brute (`status_change`, `admin_action`,
`documents_requested`…).

## Fix

1. **Sursă unică**: `src/lib/admin/status-badges.ts` — toate cele 26 de statusuri
   cu etichetă RO + variantă + culoare, extrase din pagina de comenzi (care avea
   config-ul complet). Dashboard + orders list importă amândouă de aici; orice
   status nou se adaugă O dată. Fallback vizibil: status necunoscut = pill outline
   cu slug-ul brut (se vede că lipsește traducerea, nu crapă).
2. **Activitate recentă**: `EVENT_CONFIG` completat cu TOATE cele ~30 de
   `event_type` scrise în `order_history` (plăți extra, facturi, reupload poze,
   OCR, recovery, note, admin) — etichete RO + iconițe Lucide dedicate. Statusul
   țintă la „Status schimbat" vine acum din `new_value` (API-ul îl trimitea,
   UI-ul nu-l citea) și e afișat TRADUS.
3. **Diacritice** pe tot dashboard-ul: Plătită, față de ieri, Actualizează,
   Nicio comandă încă, Activitate recentă…
4. **Header**: „Total (all time)" (EN + metrică amestecată: comenzi istorice ·
   venit lunar) → „Total istoric: X comenzi · Y clienți"; rândul duplicat de
   totaluri de jos a dispărut.
5. **KPI cards**: iconițe în chip-uri colorate (albastru/verde/mov/chihlimbar),
   `tabular-nums` pe toate cifrele, hover border+shadow și focus ring pe cardurile
   clicabile (De expediat, Plăți de verificat), `cursor-pointer`.
6. **Bare orizontale**: coloana de etichete lărgită (w-40, încap „Documente
   generate"), barele în container flex (nu se mai suprapun cu cifra la
   procente mari).

Verificat: `tsc --noEmit` + `eslint --quiet` curate. Vizual: de confirmat pe
producție după deploy (admin are login wall, nu s-a putut screenshotui local).

## Completare (aceeași zi): incident + cifrele de vânzări reparate

**Incident post-deploy**: dashboardul a picat în error boundary („A apărut o
eroare") — React #31: `order_history.new_value` nu e mereu string (evenimentele
de recovery scriu acolo `{coupon_code, discount_percent}`), iar feedul de
activitate îl punea în JSX prin fallback. Hotfix `2ecd6ac`: doar string-urile trec.
Lecție: `new_value` e coloană polimorfă — NU se randează fără typeof check.

**Cifrele de vânzări — auditate pe DB și reparate** (`c48b613`), semnalate de
Raul („rezultatele cu vânzări azi erau greșite"):

| Problemă | Efect | Fix |
|---|---|---|
| lista „plătite" avea 5/16 statusuri | iulie afișa 43.056 RON; real **54.623 RON** (comenzile în depus/standby/traducere invizibile) | listă completă + venit ancorat pe `paid_at` (fallback `created_at` legacy) |
| „Comenzi azi" = create azi non-draft, zi UTC | afișa 6; plătite real 4 (număra coșuri neplătite + granița 03:00) | `paid_at` în ziua României (Europe/Bucharest via Intl); etichetă „Comenzi plătite azi" |
| `is_test` numărat peste tot | test în venit/total/distribuții | exclus cu `.not('is_test','is',true)` (atenție: `.neq(true)` ar fi scos și NULL-urile) |
| rata recovery pe lista scurtă | „recuperate" subnumărat | aceeași listă completă |

Iunie = 0 e corect (platforma a pornit în iulie) — „prima lună" în card.

## Completare 2: coloana „Client" afișa N/A pe toate comenzile (`29514e6`)

A treia copie divergentă găsită în aceeași zi: dashboardul avea o versiune
simplificată a lui `getCustomerName` care citea doar `customer_data.personalData`
— dar wizardul actual scrie persoana în **`personal`**, iar comenzile pe firmă /
fără pas personal țin numele în `company`/`billing`. Pagina de comenzi avea
versiunea corectă.

Fix: `src/lib/admin/customer-name.ts` — sursă unică cu lanțul complet de
fallback (firmă KYC → contact.name → nume+prenume din contact/personal/billing →
firmă facturare → billing.name), importată de dashboard + orders list; copiile
locale șterse.

**Lecția zilei (de 3 ori aceeași boală)**: dashboardul clona config-uri din
pagina de comenzi (statusuri, evenimente, numele clientului) și copiile
rămâneau în urmă. Orice config partajat între suprafețe admin merge în
`src/lib/admin/`, nu se copiază în pagină.
