# 2026-08-24 — Primul lot de remediere post spam-update (humanizer)

Context: [incidentul](../seo/2026-08-24-spam-update-prabusire-organica.md) —
August 2026 Spam Update a tăiat vizibilitatea pe toate interogările de
servicii/documente. Remedierea = rescrierea conținutului cu profil „scaled/AI",
în ordinea scorului din audit.

## Ce s-a livrat (commit `9518ca9`)

| Pagină | Scor înainte | Acțiune |
|---|---|---|
| `/totul-despre-cartea-funciara-colectiva/` | 20,7/1k | rescriere completă: 60+ boldări scoase, „esențial/crucial/rol vital" + „Concluzii" eliminate; substanță reală (Legea 7/1996, cum se actualizează efectiv cartea colectivă, ce blochează la notar) |
| `/rolul-si-atributiile-onrc-romania/` | 19,5 + thin | rescriere completă; scheletul „Rolul/Atribuțiile 1-2-3-4" înlocuit cu ce face ONRC concret |
| `/taxa-cazier-judiciar/` | 14,3 | rescriere completă + **corecții factuale**: cita OUG 80/2013 (taxele de timbru din instanțe — alt subiect) și prețul vechi 250 lei; realitatea: taxa eliminată la 1 feb 2017, ghișeul e GRATUIT, serviciul nostru 198 lei (= services.base_price). Scos și tabelul care denigra concurența |
| `/cele-4-tipuri-de-certificat-constatator-online/` | 15,5 | păstrat jumătatea bună din iulie (prețuri, comparația InfoCert); tăiată coada de 6KB moștenită din WP care repeta totul în Title Case |
| `/importanta-extras-de-carte-funciara-colectiva/` | 14,8 + thin (474 cuvinte) | **consolidare**: duplicat al ghidului principal → 301 către el, scos din sitemap/listing/registru |

Sincronizate: `src/lib/seo/last-modified.ts` + titlurile din `src/config/articles.ts`.

## Lecția scorerului

Scorul semnalează, ochiul decide: `certificat-constatator-pfa` (16,0) și restul
generației din iulie au ieșit „sus" din cauza copy-ului legitim de produs din
CTA-uri — la citire sunt bune și NU s-au rescris. Textele cu adevărat toxice
erau cele migrate din WordPress (DATE_PUBLISHED 2024-01-01) + părți din lotul
din iunie.

## Recrawl

Cerut DUPĂ deploy (altfel Google re-vede paginile vechi): sitemap-ul era deja
recitit pe 24.08 (Succes, 192 pagini — nu retrimis), iar cele 4 URL-uri
rescrise + redirectul au primit „Solicită indexarea" din URL Inspection.
Important de reținut: recrawl-ul NU anulează demotarea algoritmică — doar
grăbește re-evaluarea paginilor schimbate; recuperarea vine la refresh-urile
SpamBrain, în săptămâni–luni.

## Rămase în coadă (după scor)

`acte-necesare-certificat-de-nastere` (15,7 — dar la citire e ok, doar boldare
excesivă), `transcriere-certificat-de-casatorie` (15,2), lotul stare civilă din
iunie (12–15), paginile de locație cazier (11–11,8 — țintă sub 5/1k, ca CJO) și
restul listei din incident. Regulă nouă: fără publicare în loturi — max 1–2
articole/săptămână, cu adâncime.
