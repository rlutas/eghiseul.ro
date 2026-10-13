# 13.10.2026 — Extras CF: termenul de pe pagină, corectat după comenzile reale
<!-- categorie: seo -->

## Pentru echipă

Pagina de extras de carte funciară promitea „de obicei în aceeași zi lucrătoare” și, în tabelul de comparație, „câteva minute”. Am verificat comenzile: din septembrie, 31 din 34 au ajuns la client în mai puțin de 24 de ore, dar doar aproximativ una din cinci în aceeași zi. Acum pagina spune „de regulă în 24 de ore, maximum 2 zile lucrătoare”. Când vorbiți cu un client despre extrasul CF, promiteți la fel: de regulă în 24 de ore.

---

## Ce s-a schimbat

`src/app/(eghiseul)/servicii/extras-de-carte-funciara/page.tsx` (D4 din `2026-10-plan-a-z-vanzari.md`):

- descrierea meta avea un fragment rupt („… maximum 2 zile lucrătoare. inclusiv noaptea …”) și ratingul în ea; acum: termen real, „comanzi oricând”, taxa ANCPI inclusă;
- „aceeași zi lucrătoare” → „de regulă în 24 de ore” în hero, pași, cardul de livrare, tabelul „Pe scurt”, FAQ și descrierea din schema `Service`;
- tabelul de comparație: „Câteva minute” → „De regulă sub 24 de ore”;
- `DATE_MODIFIED` = 2026-10-13.

## Datele

Comenzi plătite `extras-carte-funciara`, timp de la `paid_at` la primul `document_ready`/`completed` din `order_history`:

| Săptămâna | Comenzi | Sub 24 h | Sub 72 h | Mediana |
|---|---|---|---|---|
| 17.08 (avaria ANCPI) | 23 | 5 | 6 | 191 h |
| 31.08–05.10 | 34 | 31 | 34 | 15–19 h |

Aceeași zi calendaristică: 14 din 65 în ultimele 60 de zile.

## Context

Analiza D4/D3 din 13.10: pagina e indexată și recitită de Google (10.10), dar e pe pozițiile 29–60 din 20.08. Cauza e retrogradarea la nivel de domeniu, nu pagina. Pagina de cazier rescrisă pe 06.10 (D2) nu s-a mișcat încă. De aceea D4 primește doar corecturi, nu rescriere. D3 (prima pagină) așteaptă verdictul pe D2, pe 20.10. Măsurăm D4 pe 27.10.
