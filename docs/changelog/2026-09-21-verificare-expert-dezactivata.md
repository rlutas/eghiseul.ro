# 21.09.2026 — „Verificare de expert” dezactivată; avocata depune fizic toate cazierele
<!-- categorie: comenzi -->

## Pentru echipă

Opțiunea **„Verificare de expert” (49 lei)** nu mai există: nu se mai poate
bifa nicăieri. Nu era un serviciu real și nimeni nu o mai cumpărase de luni de
zile. Dacă vedeți o comandă veche cu ea, nu e nimic de făcut în plus; la
nevoie o rambursați prin „Modifică”.

Confirmare de la Raul pentru fișele serviciilor: **avocata (Tarța
Ana-Gabriela) depune fizic** cazierul judiciar (PF și PJ), cazierul fiscal,
cazierul auto, certificatul de integritate și toate certificatele de stare
civilă. Fișele din Ghid spun acum exact asta.

---

Migrarea 185: `UPDATE service_options SET is_active=false WHERE code='verificare_expert'`
(6 rânduri active pe cazier judiciar hub/PF/PJ, fiscal, auto, integritate; 3
erau deja inactive). Wizardul o ascundea deja prin `HIDDEN_CODES` în
`options-step.tsx`; rămânea în lista de opțiuni de pe `/servicii/[slug]`
(prin `service-options-section.tsx`, care citește DB) și în dialogul
„Modifică comanda”. Proza „traducere, apostilă, legalizare sau verificare de
expert” de pe pagina generică de serviciu scurtată. Mapările din cod
(`avocat-decont.ts`, `modify-diff.ts`) rămân pentru comenzile istorice.
