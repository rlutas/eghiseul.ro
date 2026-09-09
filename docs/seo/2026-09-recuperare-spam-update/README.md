# Recuperare după Google August 2026 Spam Update

Dosarul complet al analizei și al planului. Start: **[`PLAN-RECUPERARE.md`](PLAN-RECUPERARE.md)**.

## Ordinea de citit

1. **[`PLAN-RECUPERARE.md`](PLAN-RECUPERARE.md)** — diagnosticul, ce e cauza, ce nu e, planul pe faze, ce aștept de la owner
2. [`00-decizii-owner.md`](00-decizii-owner.md) — deciziile luate de Raul (D1–D6)
3. [`07-date-gsc-analytics-business.md`](07-date-gsc-analytics-business.md) — impactul măsurat: GSC, GA4, comenzi din DB

## Analize (8 agenți, 09.09.2026)

| Doc | Ce conține |
|---|---|
| [`research/01-spam-update-august-2026-stadiu.md`](research/01-spam-update-august-2026-stadiu.md) | ce se știe la 09.09 despre update, cazuri de recuperare documentate, ce nu funcționează |
| [`research/02-politici-google-checklist.md`](research/02-politici-google-checklist.md) | politicile de spam verbatim + checklist de 25 de itemi binari |
| [`research/03-pagini-locatie-programmatic.md`](research/03-pagini-locatie-programmatic.md) | ce face o pagină de locație defensibilă; cadența nu e semnal Google |
| [`research/04-recuperare-si-semnale-incredere.md`](research/04-recuperare-si-semnale-incredere.md) | playbook, reguli prune/rewrite/consolidate, outline „Despre noi", rate de bază |
| [`research/05-inventar-si-footprint-site.md`](research/05-inventar-si-footprint-site.md) | 231 de pagini publice, cadență, similaritate cu mascare, schema, disclosure |
| [`research/06-comparatie-eghiseul-vs-cjo.md`](research/06-comparatie-eghiseul-vs-cjo.md) | de ce a căzut unul și nu celălalt — clasamentul cauzelor, ipoteze eliminate |
| [`research/08-audit-tehnic-screamingfrog.md`](research/08-audit-tehnic-screamingfrog.md) | 21 de probleme tehnice, ordonate după gravitate |
| [`research/09-lista-decizii-per-pagina.md`](research/09-lista-decizii-per-pagina.md) | verdict KEEP/REWRITE/CONSOLIDATE/DELETE pe fiecare din cele 191 de URL-uri |

## Date brute

- `gsc/full-3luni/` — export GSC 07.06 → 06.09.2026, site întreg
- `gsc/compare-post-vs-pre/` — 23.08–08.09 vs 01–17.08 (ferestre egale de 17 zile)
- `research/data/` — CSV-uri derivate + scripturi re-rulabile (prefixate `05-`, `06-`, `08-`)
- `research/data/decizii-per-pagina.csv` — tabelul de decizii, 191 × 28 coloane
- `../../EXPORT SCREAMINGFROG/` — crawl 09.09.2026 (⚠️ fără Crawl Analysis)

## Concluzia în trei rânduri

Nu e demotare de domeniu (calculatoarele au supraviețuit și au urcat), nu e scriitura AI
(CJO scorează mai prost și e #1), nu sunt backlinkurile, nu e tehnic. E **clusterul
comercial generat din template, la scară** — 63 de pagini din 3 șabloane în 5 zile, cu
coeziune internă de 7 ori mai slabă decât la CJO. **93 din 191 de pagini indexabile ies
din index pentru 0,23% din clicuri.**
