# Master list SEO — ce mai avem de făcut

**Data:** 2026-08-07 · Consolidează cele cinci audituri făcute azi. Fiecare punct e validat cu date,
nu cu opinii. Ordinea e după raportul dintre efort și bani, nu după categorie.

Documentele-sursă:
[analiza organic](2026-08-07-analiza-organic-fiscal-nastere-topograf.md) ·
[concurență / SERP real](2026-08-07-audit-concurenta-serp-real.md) ·
[pagini de serviciu](2026-08-07-audit-pagini-serviciu.md) ·
[audit tehnic](2026-08-07-audit-tehnic-complet.md) ·
[inventar articole](2026-08-07-plan-articole-inventar.md) ·
[prompturi imagini](2026-08-07-prompturi-imagini-articole.md)

---

## Contextul în trei cifre

| | |
|---|---|
| Clicuri organice, 3 luni | 192.000 |
| Din care pe pagini de unde se poate comanda | **4,9 %** |
| Comenzi plătite / lună · venit | ~206 · ~59.000 RON |

Nu avem problemă de trafic. Avem problemă de **trafic comercial**: 77,8 % din clicuri stau pe
calculatoare și pe verificarea rovinietei, unde nimeni nu cumpără nimic.

---

## Nivelul 0 — de făcut azi sau mâine (minute, nu zile)

| # | Ce | De ce | Unde |
|---|---|---|---|
| 1 | Adaugă `www.eghiseul.ro` în Vercel → Domains, redirect 308 | acum dă **eroare de securitate în browser** (`subjectAltName does not match`); orice backlink scris cu www e pierdut | Vercel dashboard |
| 2 | Verifică campania Google Ads „OTP-CAZIER NOU" | apare **ÎNTRERUPTĂ** în panoul din SERP — anunțurile nu rulează | Google Ads |
| 3 | Repară ad customizer-ul de pe CJO | anunțul afișează literal `Cazier Online {LOCATION(City)` în rezultate | Google Ads |
| 4 | Deploy-ul de azi | conține fixul lanțurilor de redirect + articolul nou + update ANCPI | push făcut |

## Nivelul 1 — săptămâna asta

| # | Ce | Date care justifică |
|---|---|---|
| 5 | **Punte tool → serviciu** în `/tools/verificare-rovinieta-online/` | tool-ul are **866.032 expuneri / 46.478 clicuri**; `/servicii/rovinieta-online/` are CTR 0,4 % și poziția 10,5. Cel mai vizitat lucru de pe site nu trimite nicăieri |
| 6 | Rescris title + meta pe `/servicii/cazier-judiciar-online/` | 44.377 expuneri, **CTR 0,9 %**, poziția 8,3 |
| 7 | Rescris title + meta pe `/servicii/certificat-constatator-online/` | 15.243 expuneri, **CTR 0,59 %**, poziția 12,6 — canibalizat de articolul „cele 4 tipuri" care stă pe 6,5 |
| 8 | Trimite articolele la click.ro și economica.net | ultimele 2 din pachetul de 6 backlinkuri plătit pe 31 iulie |
| 9 | Content-Security-Policy + `includeSubDomains` la HSTS | site care procesează plăți și acte de identitate, fără CSP |

## Nivelul 2 — următoarele două săptămâni

| # | Ce | Date |
|---|---|---|
| 10 | **3 articole pe cazier fiscal**: firmă / fără SPV / verificare | conversia pe fiscal e **64 %, cea mai bună din site**; în SERP-ul real 5 din 9 rezultate sunt articole, iar noi aveam zero până azi |
| 11 | Comasează `certificat-de-nastere-pierdut` + `duplicat-certificat-de-nastere`, 301 pe cealaltă | 1.625 + 593 expuneri, ambele pe poziția 9,5 cu CTR sub 2 % |
| 12 | Articol nou „certificat de naștere pentru buletin / pașaport / botez" | intenție de blocaj, singurul gol real din clusterul naștere; comanda medie pe naștere e **1.260 RON** |
| 13 | 18 imagini OG pentru paginile de serviciu | 18 servicii diferite arată identic când linkul e dat pe WhatsApp |
| 14 | 23 imagini featured pentru articole | prompturile sunt scrise, per articol |
| 15 | Linkuri interne pe grupul cadastral | 14 pagini cu **2 linkuri** fiecare, față de 8–12 la paginile care rankează |

## Nivelul 3 — luna următoare

| # | Ce | Date |
|---|---|---|
| 16 | Rezolvă blocajul de plată pe serviciile topograf | `identificare-imobile-proprietar`: **1 plătită din 13**, iar din cele 12 nefinalizate doar 1 ajunge cu billing valid |
| 17 | Rescrie `/servicii/rovinieta-online/` | 989 cuvinte, 6 întrebări, 3 linkuri — cea mai slabă pagină de serviciu |
| 18 | `/servicii/copie-releveu/` | poziția **29,7** — pagina practic nu există pentru Google |
| 19 | Cheie API Google (CrUX + PSI) | azi nu am putut măsura CWV: cotă publică depășită |
| 20 | Decide: pe cazier fiscal împingem eghiseul sau CJO? | CJO ne bate pe **ambele** interogări verificate (#4–5 vs. #6–8). Ne canibalizăm |
| 21 | Reevaluează emiterea explicită de `FAQPage` | nu mai dă rich snippet, dar e folosit de AI Overview și de motoarele LLM |

## Ce NU facem, deși pare tentant

| Idee | De ce nu |
|---|---|
| Optimizat pagina de serviciu pe cazier fiscal | e deja mai bună decât a lui digigov care ne bate: 2.200 cuvinte vs. 1.300, 10 întrebări vs. 5, preț afișat, schema completă. Diferența e autoritatea, nu on-page |
| Atacat termenul-cap „certificat de nastere" | în SERP-ul real e 100 % instituțional (primării, MAI, Wikipedia) și nu apărem în top 9, deși GSC raportează poziția 3,0 |
| Articole noi pe cadastru | 12 articole existente, pagina noastră e pe locul 4; blocajul e conversia, nu traficul |
| Backlinkuri plătite pentru CJO | problema lui e **CTR-ul de 0,4 %** la poziția 7,7, adică snippetul. Un link urcă poziția, nu repară titlul |
| Curățat listele cu antet îngroșat din calculatoare și pagini legale | acolo e alegere de lizibilitate corectă, nu slop AI |

---

## Livrat azi

- Articol nou `/cazier-fiscal-persoana-fizica/`, trecut prin humanizer (linii de pauză 20 → 1)
- Articolul cadastral-far întărit cu 3 tabele și 5 linkuri noi către servicii (98.060 expuneri)
- Articolul ANCPI actualizat cu situația de 5–7 august + meta description + FAQ + etichetă de dată
- **Lanțuri de redirect reparate**: 14 reguli, de la 2 hopuri la 1
- 5 linkuri interne rupte reparate (0 rupte din 121)
- Eroare de fond corectată pe pagina de cazier fiscal
- Humanizer pe 4 articole (ANCPI: 68 → 35 linii de pauză)
- Registrul `lastModified` sincronizat, testul trece
- Scripturi noi: `scripts/seo-linkcheck.py`, `scripts/seo-ai-tells.py`

## Cum măsurăm peste o lună

| Metrică | 7 aug 2026 | Țintă |
|---|---|---|
| % clicuri pe pagini de serviciu | 4,9 % | 8 % |
| `/servicii/cazier-fiscal-online/` poziție | 8,8 | sub 5 |
| `/servicii/cazier-judiciar-online/` CTR | 0,9 % | peste 2,5 % |
| `/servicii/certificat-constatator-online/` poziție | 12,6 | sub 8 |
| Conversie certificat naștere | 12,7 % | 25 % |
| Comenzi plătite / lună | ~206 | — |
