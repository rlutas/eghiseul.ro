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
