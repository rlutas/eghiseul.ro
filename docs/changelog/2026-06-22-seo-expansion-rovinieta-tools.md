# 2026-06-22 — Expansiune SEO, rovinietă, /tools/, reorganizare docs

Sesiune mare. Tot live pe `main`, CI verde.

## Calculatoare (36) — îmbogățire + GEO
- Toate 36 paginile de calculator duse la **600-972 cuvinte** (exemple pas cu pas, tabele, greșeli frecvente, context legal, FAQ). Cifrele verificate păstrate.
- **GEO / AI Overviews** la nivel de `CalculatorLayout`: bloc „Pe scurt" (TL;DR) pe toate 36, `dateModified` în schema (WebApplication + WebPage), linie „Actualizat", autor E-E-A-T „Echipa eGhișeul.ro", breadcrumb complet.
- **WebMCP** (experimental) — 4 calculatoare expuse ca tools pentru agenți AI, feature-detected. Verdict: zero trafic azi, pariu pe 2027. Doc: `../technical/webmcp.md`.
- **Meniu calculatoare limitat la 15 populare** (5/categorie, după trafic GSC) + „Vezi toate" → `/calculator/` (toate 36).

## Location SEO + clustere (66 pagini noi)
Vezi `../seo/SEO-STATUS-2026-06-22.md` + folderele dedicate din `../seo/`.
- **Extras Carte Funciară pe județe (42)** — date OCPI reale per județ. `../seo/carte-funciara/`.
- **Cazier judiciar 37→48 orașe** — 5 reședințe noi (IPJ real) + 6 secundare. `../seo/cazier-judiciar/`.
- **ONRC certificat constatator (4 use-case)** — bancă/licitație/notar/fonduri. `../seo/onrc-certificat-constatator/`.
- **Stare civilă (8 ghiduri)** — celibat (Anexa 9), valabilitate, duplicat/transcriere naștere & căsătorie, acte căsătorie, înregistrare nou-născut. `../seo/stare-civila/`.

## Rovinietă
- Pagină nouă **`/servicii/rovinieta-online/`** (cumpărare → erovinieta.net, afiliere). Conținut importat de pe live (rankează). Categorii corecte A-H, tarife 2026.
- **`/tools/verificare-rovinieta-online/`** restructurat consistent cu calculatoarele + conținut bogat importat.
- Funnel bidirecțional verificare ↔ cumpărare. 2 bug-uri SEO reparate (redirect rupt + URL 16k clickuri 404). `../seo/rovinieta/`.

## /tools/ (Instrumente)
- Pagină index nouă `/tools/` — listează verificare rovinietă + calculatoare. Schema CollectionPage, în sitemap.

## Reorganizare documentație
- Creat `docs/changelog/`. Root `docs/` curățat (doar README + DEVELOPMENT_MASTER_PLAN + STATUS_CURRENT).
- Arhivat clusterele istorice (paritate cazier apr 2026, doc-audit, sprints, catalog WPForms legacy, testing API curl, analiză pre-build, SEO cazier-fiscal 2025).
- `docs/README.md` rescris ca index curat; foldere dedicate per treabă în `docs/seo/`.

## Sitemap
186+ URL-uri. Toate paginile noi verificate în sitemap.
