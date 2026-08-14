# SEO — index

Index al documentației SEO. Status curent al expansiunii: [`SEO-STATUS-2026-06-22.md`](SEO-STATUS-2026-06-22.md).

## Foldere dedicate (per treabă)
| Folder | Ce conține |
|---|---|
| [`carte-funciara/`](carte-funciara/) | 42 pagini extras CF pe județe (date OCPI) + analiză competiție |
| [`cazier-judiciar/`](cazier-judiciar/) | 48 orașe cazier (date IPJ) |
| [`onrc-certificat-constatator/`](onrc-certificat-constatator/) | 4 pagini use-case (bancă/licitație/notar/fonduri) |
| [`stare-civila/`](stare-civila/) | 8 ghiduri (celibat/naștere/căsătorie) |
| [`rovinieta/`](rovinieta/) | tool verificare + pagină cumpărare (afiliere) |
| [`keywords/`](keywords/) | keyword research per serviciu |
| [`gsc-data/`](gsc-data/) | exporturi Google Search Console (interogări, pagini) |

## Planuri & referințe (vii)
| Fișier | Rol |
|---|---|
| [`2026-08-14-analiza-imobiliare-seo-comenzi.md`](2026-08-14-analiza-imobiliare-seo-comenzi.md) | **CURENT** — indexare + trafic + comenzi pe cele 18 pagini cadastrale: toate indexate; extras CF = 920 clicuri/90z de pe poziția 8–10 (pârghia principală); cele 12 servicii topograf n-au cerere în căutare (3 interogări/90z), deci nu e problemă de SEO; ⚠️ 87 de comenzi plătite de extras CF stau nelivrate (8.034 lei) din cauza blocajului ANCPI |
| [`2026-07-31-articole-backlinks-plan.md`](2026-07-31-articole-backlinks-plan.md) | **CURENT** — pachet backlinks CUMPĂRAT (6 publicații): poziții GSC 28 zile per serviciu, regulile fiecărui site (brand/nr. linkuri/imagini), brief-uri finale per articol, export GSC 31.07 + diagnostic servicii topograf (trafic dar 24 ciorne / 1 plată) + §7 baseline & calendar urmărire post-publicare |
| [`2026-07-31-goluri-continut-si-calculatoare.md`](2026-07-31-goluri-continut-si-calculatoare.md) | **CURENT** — cerere vs site REAL: ICC și amendă rovinietă EXISTĂ și performează (ICC top 5 pe site; amenda blocată în „2025" pe 80k impresii = refresh urgent); goluri reale doar: apostilă Haga, certificat deces, succesiune, harta cadastrală, înființare firmă; + verdictele pe constatator (on-page complet, lipseau linkuri), urbanism (pagină nouă, răbdare), topograf (blocaj la PLATĂ, funnel 8% vs 26% la geamănul vechi) |
| [`../changelog/2026-08-12-servicii-fara-avocat-si-numere-eliberate.md`](../changelog/2026-08-12-servicii-fara-avocat-si-numere-eliberate.md) | ⚠️ **Confirmarea Search Console** — proprietatea a picat pe „neverificat" (12.08): fișierul `googleXXXX.html` rămăsese pe WordPress. Acum e meta tag în `src/app/layout.tsx` (`metadata.verification.google`), deci se re-deployează singură. **Nu șterge blocul.** Confirmarea prin Analytics NU merge: gtag se încarcă doar după consimțământ |
| [`TOOLING-claude-seo.md`](TOOLING-claude-seo.md) | **CURENT** — tooling SEO pe date reale (claude-seo v2.2.4, instalat 28.07): Search Console prin API, CrUX 25 săpt., PageSpeed/Lighthouse. Unde stau credențialele, capcanele (Python 3.10+, proprietate URL-prefix nu Domain, API de activat în GCP), comenzile, măsurătorile de referință |
| [`ANALIZA-MIGRARE-WP-NEXT-2026-07-20.md`](ANALIZA-MIGRARE-WP-NEXT-2026-07-20.md) | **CURENT** — a afectat migrarea SEO-ul? Verdict pe date: trafic existent intact (−2%), gol vs trend YoY +32%→+3% (~300–450 cl/zi, confundat cu AIO), CF/cazier fiscal = probleme pre-existente; re-măsurare 4 aug |
| [`2026-07-26-analiza-organic-servicii.md`](2026-07-26-analiza-organic-servicii.md) | **CURENT** — de ce paginile de servicii nu vând: GSC + comenzi DB + SERP verificat manual; 62% trafic pe calculatoare fără punți, canibalizare articol↔serviciu, plan P0/P1/P2 |
| [`2026-07-26-conformitate-si-sesizari-concurenta.md`](2026-07-26-conformitate-si-sesizari-concurenta.md) | **CURENT** — politica Google „government documents" (oct. 2025), dovezi pe competitori, expunerea noastră, plan self-audit → dosar → sesizări |
| [`STRATEGY-2026-07-13-post-cutover.md`](STRATEGY-2026-07-13-post-cutover.md) | **CURENT** — strategie post-cutover pe GSC live: indexare (66/204!), striking distance, GEO/AI, autoritate |
| [`2026-07-17-analiza-verificare-proprietar-constatator-per-tip.md`](2026-07-17-analiza-verificare-proprietar-constatator-per-tip.md) | **EXECUTAT 17.07** — decizii format Front D: articol verificare-proprietar + 3 landing-uri constatator (de bază/insolvență/PFA) cu `?tip=` preselect în wizard |
| [`2026-07-14-cluster-construire-cadastru.md`](2026-07-14-cluster-construire-cadastru.md) | **CURENT** — cluster nou „construire & cadastru": 4 calculatoare + 2 articole + serviciu urbanism + lead magnet + llms.txt; ce e de urmărit |
| [`2026-07-13-analiza-competitie-cf-constatator.md`](2026-07-13-analiza-competitie-cf-constatator.md) | **CURENT** — analiză competiție SERP: extras CF (#14, plan recuperare) + certificat constatator (#3); profiluri competitori + plan de acțiune A-D |
| [`SEO-ANALYSIS-2026-06-22.md`](SEO-ANALYSIS-2026-06-22.md) | Analiză GSC: ce rankează, ce merge, oportunități + plan go-live |
| [`SEO-STATUS-2026-06-22.md`](SEO-STATUS-2026-06-22.md) | Status curent expansiune location-SEO + clustere |
| [`SEO-MASTER-PLAN-2026-05-20.md`](SEO-MASTER-PLAN-2026-05-20.md) | Plan SEO master (migrare WP→Next) |
| [`REBUILD-QUEUE.md`](REBUILD-QUEUE.md) | Coada de pagini de rebuilt |
| [`CITY-PAGES-PLAN.md`](CITY-PAGES-PLAN.md) | Plan pagini pe orașe |
| [`gsc-data/SERVICE-RANKING-PLAYBOOK-2026-06-13.md`](gsc-data/SERVICE-RANKING-PLAYBOOK-2026-06-13.md) | Playbook ranking pe servicii (din GSC) |
| [`calculator-formulas-2026.md`](calculator-formulas-2026.md) | Formulele verificate ale calculatoarelor |
| [`seo-audit-and-ranking-plan.md`](seo-audit-and-ranking-plan.md) | Audit tehnic + plan ranking/backlinks |
| [`service-pages-onpage-optimization-2026-06-17.md`](service-pages-onpage-optimization-2026-06-17.md) | Optimizare on-page pagini servicii |

## Strategie de scope (decizii)
Ce servicii primesc pagini pe locație și care NU: memoria `location-seo-scope` + planul [`../plans/2026-06-19-location-seo-engine.md`](../plans/2026-06-19-location-seo-engine.md). Pe scurt: CF (per județ), cazier (per oraș) DA; cazier auto/fiscal, identificare imobil, plan cadastral NU; ONRC = use-case; stare civilă = topical cluster.

> Materiale istorice (cazier-fiscal 2025, status vechi): `../archive/seo/`.
