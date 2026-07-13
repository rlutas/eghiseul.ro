# 2026-07-13 — Analiză SEO post-cutover (GSC live) + quick wins executate

## Analiza (docs/seo/STRATEGY-2026-07-13-post-cutover.md)

- GSC citit live (Playwright, cont user) + verificare incognito SERP + export CSV complet (999 interogări, 160 pagini, 3 luni).
- **Mit spulberat:** „nu apărem pe certificat de naștere online" — FALS. Incognito: #3 organic + citați nominal în AI Overview. Căsătorie: #1 + citați cu badge sursă. AI Overview prezent pe toate cele 5 query-uri comerciale testate; eGhișeul citat pe 4/5.
- **Probleme reale:** (1) cazier — homepage rankează în locul paginii de serviciu (47,8K exp, CTR 0,89%, poz 8,5); (2) CF — poz 13,7, competiție „gratuit/49 lei", județele neindexate; (3) constatator — articolul #3, serviciul poz 13,3; (4) coverage report arăta 66/204 indexate (STALE — verificare live: majoritatea indexate deja).

## Executat (commit 54d109e)

1. **Dezcanibalizare cazier:** homepage FAQ → link anchor exact spre pagina serviciu; hero answer-first (termen+emitent+lege); dateModified refresh.
2. **Dezcanibalizare constatator:** articolul „Cele 4 tipuri" (rank #3) → link anchor exact „certificat constatator online" spre pagina de serviciu.
3. **Titluri CTR:** preț 998 RON scos din title naștere/căsătorie (ucidea CTR pe head-uri informaționale: 0,42%/0,55% la poz 2,6/1,9 — prețul rămâne în description); titluri rescrise termene-judiciare + salariu (net↔brut).
4. **Linkuri interne lipsă:** hub naștere → ghiduri duplicat + transcriere.
5. **IndexNow:** cheie publică + `scripts/indexnow-ping.mjs` (204 URL-uri → Bing; Bing alimentează ChatGPT search + Copilot). Prima trimitere: 403 verificare în curs — retry automat.
6. **robots.ts:** UA-uri AI noi (Claude-SearchBot, Claude-User, Perplexity-User, Meta-ExternalAgent, MistralAI-User).
7. **Request Indexing GSC:** cazier bucurești/timișoara/brașov trimise; cluj/iași/constanța + CF mari erau deja indexate.

## De făcut (fronturile C+D din strategie)

- Retrofit GEO answer-first pe restul serviciilor + top articole; E-E-A-T „Despre noi" + avocat.
- Bing Webmaster Tools (cere login user — 2 clickuri, „Import from GSC").
- Șters sitemap vechi WP din GSC (`/sitemap_index.xml` failed).
- Articole noi prin /humanizer; Reddit/foruri; PR.
- Cleanup: `serp-certificat-nastere-online.jpeg` comis accidental în root — de șters la următorul commit funcțional.
