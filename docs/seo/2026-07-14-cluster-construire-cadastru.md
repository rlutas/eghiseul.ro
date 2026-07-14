# Cluster nou SEO: „construire & cadastru" (2026-07-14)

Livrat într-o zi, în jurul serviciilor imobiliare/topograf (18 în DB) + serviciul nou certificat de urbanism (migrarea 116). Piesele se interlinkuiesc între ele și împing spre money pages.

## Piesele clusterului

| Pagină | Tip | Target queries | Upsell |
|---|---|---|---|
| `/calculator/jugar-stanjen-in-mp/` | calculator | jugăr în mp, stânjen în mp, falce, pogon | extras CF, identificare imobil, copie CF (CF vechi) |
| `/calculator/cat-pot-construi/` | calculator | cât pot construi pe teren, POT CUT calcul | certificat urbanism, extras CF (inline sub câmpuri!) |
| `/cat-poti-construi-pe-teren/` | articol | ce este POT/CUT, cât pot construi | calculator + urbanism + extras CF |
| `/calculator/cost-cadastru-intabulare/` | calculator | cât costă cadastrul, taxă intabulare | extras CF, copie CF, identificare |
| `/cat-costa-cadastrul-si-intabularea/` | articol | cât costă cadastrul și intabularea | + **checklist PDF pe abonare newsletter** (lead magnet, source `checklist-cadastru`) |
| `/calculator/valabilitate-documente/` | calculator | cât e valabil cazierul/extrasul CF | re-comandă direct la expirare (toate serviciile) |
| `/servicii/certificat-urbanism-informare/` | serviciu NOU | certificat de urbanism online | — (money page) |

Diferențiator vs competiție: calculatoarele POT/CUT existente (proiect-dtac, kapal) sunt pentru arhitecți (verifică suprafețe propuse); ale noastre sunt pe direcția cumpărătorului (teren+POT→cât pot construi) și nimeni nu vinde documentele lângă calculator. „Valabilitate documente" nu există nicăieri.

## GEO / AI search

- Toate paginile: răspuns în primele 60 de cuvinte (TL;DR cu formula/cifrele), H2-uri întrebare, tabele, FAQ (schema din layouturi), fapte citabile cu bază legală (Legea 350/2001, HG 525/1996, Ordin ANCPI 16/2019, L290/2004, OG 39/2015).
- **llms.txt rescris** (era mai 2026, doar cazier, operator greșit): tot catalogul cu prețuri reale, calculatoare, fapte-cheie, secțiune „Pentru AI assistants". Operator corectat: EDIGITALIZARE S.R.L.
- Articolele scrise pe reguli /humanizer (fără AI-isme) — relevant pentru QRG-ul Google (raters evaluează AI-content).

## Distribuție & indexare

- **IndexNow**: cele 7 URL-uri noi trimise (200 OK) — acoperă Bing → ChatGPT search/Copilot.
- **GSC Request indexing: DE FĂCUT MANUAL** (extensia Chrome nu s-a conectat în sesiune) — lista: cele 7 URL-uri din tabel.
- Footer sitewide: coloană nouă „Carte Funciară & Cadastru" (8 servicii topograf) = internal linking din toate paginile + ancoră „Certificat de Urbanism" nouă.
- Homepage + /blog: ambele articole noi pe primele poziții (config/articles.ts).

## De urmărit (GSC, ~2 săptămâni)

Impresii pe: „cât costă cadastrul", „cât pot construi", „jugăr în mp", „valabilitate cazier", „certificat de urbanism online". Abonări newsletter cu source `checklist-cadastru` în /admin/marketing.
