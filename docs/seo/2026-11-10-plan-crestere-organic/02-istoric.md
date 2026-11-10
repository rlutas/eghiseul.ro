# 02 — SEO history: what we already know and decided (4 sites, Jul–Nov 2026)

Compiled 10.11.2026. I only read files and did not edit the repo. Sites covered: **eghiseul.ro** (egh), **cazierjudiciaronline.com** (CJO), **ecazier.ro**, **documentero.ro** (docx). CJO and ecazier live in `/Users/raul/Projects/cazierjudiciaronline.com`. eghiseul and documentero live in `/Users/raul/Projects/eghiseul.ro`.

Path shorthands: `seo/` = `/Users/raul/Projects/eghiseul.ro/docs/seo/` · `rec/` = `seo/2026-09-recuperare-spam-update/` · `aud/` = `seo/2026-11-02-audit-4-site-uri/` · `cl/` = `/Users/raul/Projects/eghiseul.ro/docs/changelog/` · `cjo/` = `/Users/raul/Projects/cazierjudiciaronline.com/docs/` · `mem/` = `/Users/raul/.claude/projects/-Users-raul-Projects-eghiseul-ro/memory/`.

---

## 1. Timeline, July–November 2026

| Date | Site | Event / action | Source |
|---|---|---|---|
| 19.06–22.06 | egh | Location engine: 43 CF county pages, 37→48 cazier city pages, use-case and civil-status clusters. **92 pages were published on 22.06** (40% of the site), and 95.7% of the site went live within 13 days | `mem/location-seo-scope.md`, `rec/research/05-inventar-si-footprint-site.md` |
| 23.06 | egh | Google Ads rep: the phrase „documente/acte oficiale” triggers the government-documents policy. The site was swept (~119 occurrences in 55 files) | `mem/google-ads-documente-oficiale.md` |
| 07.07 | egh | WordPress → Next.js cutover (DNS). Click volume held (−2% on matched days), but YoY growth slowed from +32% to +3% | `seo/ANALIZA-MIGRARE-WP-NEXT-2026-07-20.md` |
| 13.07 | egh | First post-cutover GSC read: only 66 of 204 sitemap URLs indexed. Services bring 5% of clicks. Cazier/constatator/CF service pages are "sick" (CTR 0,3–0,9%, homepage/article rank instead) | `seo/STRATEGY-2026-07-13-post-cutover.md` |
| 17.07 | egh | 3 constatator landings per type (`?tip=`) and an owner-check article | `cl/README.md` 2026-07-17 |
| 26.07 | egh | Two new articles (cazier gratuit, birth certificate from abroad) and a cannibalisation fix. Compliance and competitor-reporting file on the Google "government documents" policy | `seo/2026-07-26-analiza-organic-servicii.md`, `seo/2026-07-26-conformitate-si-sesizari-concurenta.md` |
| 28.07 | egh | Audit score 69. 40 of 48 city pages unindexed, so they got `noindex, follow` and left the sitemap (222→182 URLs). TTFB −24% | `seo/audit-2026-07-28/`, `cl/README.md` 2026-07-28 |
| 29.07 | egh | Teachers digital-PR article plus an embed widget for the press | `seo/2026-07-29-digital-pr-profesori-septembrie.md` |
| 31.07 | egh | **Paid backlink pack bought** (6 outlets, ~880 €). 4 new articles (apostila, ONRC cluster) | `seo/2026-07-31-articole-backlinks-plan.md` |
| 07.08 | egh | 5 audits in one day (organic, real SERP, service pages, technical 78/100, article inventory). Fixed: www TLS, 2-hop redirect chains. 4/6 backlinks live and verified | `seo/2026-08-07-MASTER-CE-MAI-AVEM-DE-FACUT.md` |
| ~05.08 | ecazier/egh | Google Ads blocked on the government-documents policy | `mem/ecazier-ads-istoric-politica.md` (index), `aud/06-infocazier.md` §3 |
| 12.08 | egh | GSC property went "unverified" (the HTML file had stayed on WP). Fixed with a meta tag in `src/app/layout.tsx` | `mem/gsc-verificare-meta-tag.md` |
| 11–12.08 | egh | ANCPI outage ends. `/ancpi-nu-functioneaza/` loses 566k impressions from lost demand, not from a penalty | `rec/PLAN-RECUPERARE.md` §1 |
| **18–21.08** | egh | **August 2026 Spam Update. On 20–22.08 clicks fell −78%, impressions −96%, orders −70% and revenue −75%.** No manual action. Only calculators and brand survived | `seo/2026-08-24-spam-update-prabusire-organica.md`, `rec/PLAN-RECUPERARE.md` |
| 24.08 | egh | First diagnosis ("AI writing"), later **refuted**. First humanizer batch on 3 articles | `seo/2026-08-24-…` (marked "DEPĂȘIT PARȚIAL") |
| 09.09 | egh | 8-agent analysis, owner decisions D1–D6. **Phases 0, 1, 2, 4, 5 went live 11:20 (commit `36b6d8f`): 122 pages 301'd (48 city + 42 county + 32 satellite articles), aggregateRating, meta keywords and fake Person removed, author page and „Despre noi” added, disclosure on order flow.** Content rules written | `rec/README.md`, `rec/00-decizii-owner.md`, `rec/PLAN-RECUPERARE.md`, `.claude/rules/content-and-seo.md` |
| 09.09 | egh | Soft-404 fix, FAQ de-duplication, 13 cadastral pages differentiated (62/78 → 0/78 pairs over threshold), D3 multilingv (0,751→0,421). Rewrites lots 1/2A/2B: 20 of 32 pages | `rec/11-jurnal-executie.md` |
| 09.09 | egh | Suspense `loading.tsx` hid content from fetch-only AI bots. Fixed (PR #5) | `seo/2026-09-09-accessibility-tree-ai-agents.md` |
| 07.09–12.10 | all | Google Ads "equal treatment" escalation (ticket 1-6533000041865). Google requires a link of authorisation from a government site | `mem/google-ads-escaladare-tratament-egal.md` |
| 19.09 | docx | Decision on a civil-status satellite: yes as a standalone brand with its own checkout, not as a redirect site. documentero.ro built in the same repo | `seo/2026-09-19-site-satelit-stare-civila.md`, `mem/documentero-al-doilea-brand.md` |
| 20.09 | docx | Competitor/SERP analysis. Live SERP: egh absent from top 20 on birth queries (later corrected to #1 on „duplicat…online”) and #1 on marriage/celibacy | `/Users/raul/Projects/eghiseul.ro/docs/documentero/analiza-competitori-seo.md` |
| **21.09** | docx | **documentero indexable** (`DOCUMENTERO_INDEXABLE=true`). 14 pages, 4 guides, links from egh/CJO/ecazier/avocat-tarta | `cl/2026-09-21-documentero-lansare.md` |
| 21.09 | ecazier/CJO | ecazier added to GSC (2 of 15 pages indexed), `sc-domain` properties created. CJO slid on „cazier judiciar online” 4,7→7 | `cjo/ecazier.ro/10-seo-gsc-indexare-2026-09-21.md`, `cjo/session-logs/2026-09-21-seo-cjo-cadere-ecazier-gsc.md` |
| **24.09–~08.10** | all | **September 2026 Spam Update.** No recovery on egh (`/servicii/` 771 impr/wk vs 29,1k in 03–09.08) | `rec/2026-09-25-ce-spun-expertii-recuperare.md` |
| 25–26.09 | egh | Factual errors fixed (cazier fiscal does not show debts, first ANCPI registration costs 0 lei, any primărie). Catalogue descriptions without „oficial” (migr. 189/190) | `cl/2026-09-25-…`, `cl/2026-09-26-catalog-fara-oficial.md` |
| 05.10 | CJO | 39 city pages rewritten with verified IPJ data (masked Jaccard 0,76–0,92 → 0,38–0,46). New homepage title. Unverifiable figures removed | `cjo/seo/2026-10-05-pagini-oras-date-ipj-verificate.md` |
| 05.10 | ecazier/docx | Internal links on ecazier, links from egh/CJO/avocat-tarta. docx guides „model vechi” and „valabilitate celibat” | `seo/2026-10-05-ecazier-documentero-stare-organic.md` |
| 05–08.10 | CJO | **Incident: form below the fold** (IPJ counter / „gratuit” / GEO block first). Form starts fell from 55–87/day to 16–19/day. Reverted 08.10 (`4812265e`) | `mem/cjo-formular-sub-pliu-incident.md`, `cl/2026-10-08-cjo-formular-deasupra.md` |
| 06.10 | egh/docx | Sitemap `lastmod` real (112/112), IndexNow, „Pe scurt” answer blocks on 7 service pages, AI-bot robots groups, `/servicii/cazier-judiciar-online/` rewritten (D2), unverifiable header figures removed, links to CJO reabilitare guides, multilingv = CIEC Convention 16 | `cl/2026-10-06-*.md` |
| 06.10 | all | Indexing audit: 215/216 indexed. CJO backlinks plan and drafts (nothing sent). GEO plan | `seo/2026-10-06-audit-indexare-4-site-uri.md`, `seo/2026-10-06-cjo-backlinks-plan.md`, `seo/2026-10-06-cjo-linkuri-drafturi.md`, `seo/2026-10-06-geo-ai-citari-plan.md` |
| 07.10 | CJO/all | 6 CJO titles rewritten. Ad channel map: Google ❌, Microsoft ❌, ChatGPT only for constatator/CF, Meta ✅ | `cl/2026-10-07-titluri-cjo.md`, `seo/2026-10-07-unde-stam-seo-ai-reclame.md` |
| 12.10 | all | Competitors reported to Google. Complaints to ANCOM and the Consiliul Concurenței | `seo/2026-11-04-cjo-diagnostic-trafic.md` (coincidence note) |
| 13–14.10 | egh | CF term corrected (24 h, not "same day"). Constatator page made truthful (real ~4 min, 30 lei ONRC fee). Sale cards plus **sticky mobile bar on all articles and calculators**. Content attribution. Cadastru sistematic and „cum citești extrasul” guides | `cl/2026-10-13-…`, `cl/2026-10-14-*.md` |
| **15–19.10** | egh+CJO | **Unannounced step-down.** CJO −68% clicks (break 18–19.10), egh −44% (from 15–17.10). egh stabilised from 25.10, CJO kept falling 30–40%/wk | `seo/2026-11-03-cadere-mijloc-octombrie-urmarire.md`, `seo/2026-11-04-cjo-diagnostic-trafic.md` |
| 02.11 | all | Audit /seo on 4 sites (egh 72, CJO 72, ecazier 71, docx 82) with a 15-point plan. Infocazier and competitor teardown. Same day: CJO real reviews, aligned prices, Iași/Brașov/Timișoara + Constanța guides, homepage hub (39 cities, 23 guides), `llms.txt`, Product/HowTo/LocalBusiness out, `/cazier-judiciar-online` 301. egh homepage = brand hub, single-source facts, Product out. ecazier: fake testimonials, ONLINE10 and „documente oficiale” removed. docx guide „cât durează”. Monthly GSC monitor. **Owner decision: no new public pages on egh until recovery** | `aud/README.md`, `aud/00-sinteza.md`, `cjo/seo/2026-11-02-*.md`, `cl/2026-11-02-*.md`, `mem/curatenie-spam-update-live.md` (DECIZIE 02.11) |
| 03–04.11 | egh+CJO | Diagnosis of the October drop: no manual action, 71/71 indexed, no sabotage evidence. **Freeze on bulk CJO changes until 17.11** | `seo/2026-11-03-…`, `seo/2026-11-04-cjo-diagnostic-trafic.md` |
| 04.11 | CJO | 4 live fiscal guides added to the sitemap | CJO git `2026-11-04 fix(seo): list four live cazier fiscal guides in the sitemap` |
| 09.11 | all | Week 02–08.11: 35 paid / 11.043 lei (+45%), driven by email and direct, not Google. CJO 135 clicks/day (still falling), egh 366 (flat) | `seo/2026-11-03-…` weekly table, `mem/cadere-mijloc-octombrie-2026.md` |
| 10.11 | all | Bing API in the monthly report: egh Bing clicks +25% while Google fell. GA4 readable on all 4 | `mem/monitorizare-seo-lunara.md` |

**Revenue context:** Aug 320 orders / 77,3k lei, Sep 202 / 57,4k, Oct 150 / 44,9k (egh+CJO). In Jul–Oct, egh+CJO took ≈106,5k / 78,1k / 57,7k / 44,9k lei. Sources: `seo/2026-11-03-…`, `/Users/raul/Projects/eghiseul.ro/docs/ads/2026-11-04-ce-putem-rula-acum.md`.

---

## 2. Diagnoses already made

### 2.1 Before the update (Jul–Aug): traffic exists but it is not commercial
- On egh, 192k clicks in 3 months split into **77,8% tools/calculators, 13,9% articles, 4,9% service pages, 3,4% homepage**. Rovinieta check alone = 46k clicks. Evidence: `seo/2026-08-07-analiza-organic-fiscal-nastere-topograf.md`, `mem/analiza-organic-2026-08-07.md`.
- **Cannibalisation**: the homepage ranks for „cazier judiciar online” instead of the service page, and the „cele 4 tipuri” article ranks instead of the constatator service. Evidence: `seo/STRATEGY-2026-07-13-post-cutover.md` table (cazier service CTR 0,89% pos 8,5; constatator 0,46% pos 13,3; CF 0,31% pos 13,7).
- **Birth-certificate CTR is low because of intent, not the title**: „certificat de nastere” is institutional (no egh in the real top 9), while „duplicat … online” is #1 with 17% CTR. Evidence: `seo/2026-08-07-audit-concurenta-serp-real.md`.
- The migration did not lose traffic. The CF and cazier fiscal problems were pre-existing. Evidence: `seo/ANALIZA-MIGRARE-WP-NEXT-2026-07-20.md`.
- Topograf services have **no search demand** (3 queries in 90 days), so the problem is not SEO. The block was at payment. Evidence: `seo/2026-08-14-analiza-imobiliare-seo-comenzi.md`.

### 2.2 The August 2026 Spam Update (egh only)
- **Cause (ranked):** (1) a commercial cluster generated from templates at scale: 63 pages from 3 templates in 5 days, 83 non-location pairs with ≥25% shingle overlap vs 0 at CJO, and location pages whose similarity is mostly names (masked 0,72 cities / 0,71 counties). (2) Internal cohesion 7× weaker (median 5 inlinks vs 38 at CJO). (3) 37 pages under 800 words (CJO: 0). Evidence: `rec/PLAN-RECUPERARE.md` §1, `rec/research/06-comparatie-eghiseul-vs-cjo.md`, `rec/research/05-inventar-si-footprint-site.md`.
- **Ruled out, with measurements:** AI writing (CJO 13,8/1k vs egh 10,4/1k, so CJO is "more AI" and survived), location pages as a formula (CJO more duplicated: 0,909 vs 0,880), backlinks (the update does not target link spam), technical SEO, trust signals, publishing cadence (CJO published 53 in one day), domain demotion (calculators survived and rose). Evidence: same files plus `mem/spam-update-aug-2026-prabusire.md`.
- **Measurement correction:** exclude ANCPI. 566k of the lost impressions came from demand ending after the outage, while position actually rose (6,74 → 4,71).
- **After the cleanup:** `/servicii/` impressions went 1.154/wk (07.09) → 842 (05.10) → 534 (26.10), still falling. Informational queries rank at 1–3 and commercial ones at 25–90 (cazier judiciar online 28,5, cazier fiscal 66,8, constatator 36,2, extras CF 64). Inference: **suppression of commercial intent at cluster or site level**, waiting for a future core/spam update. Evidence: `aud/02-eghiseul.md` C2, "Pe topicuri". On 02.11 constatator had ~5.000 impressions/wk before 24.08 and 13–45 after: indexed but not served, so a site-wide filter. Evidence: `mem/curatenie-spam-update-live.md`.
- Mueller (07.09.2026): systems "lost faith" in the whole site because of the programmatic pages, and recovery takes "significant time and effort". Base case **3–6 months, full recovery not guaranteed**. Evidence: `rec/2026-09-25-ce-spun-expertii-recuperare.md`.

### 2.3 The step-down of 15–19.10 (CJO + egh)
- **Not a penalty, not technical**: no manual action, no security issue, 71/71 indexed, crawl healthy, CWV good, Trends flat, no CJO deploy between 13.10 and 01.11. Evidence: `seo/2026-11-04-cjo-diagnostic-trafic.md`.
- **What was hit (CJO, 14d vs 14d):** cities −68% clicks (pos 4,83→5,84), commercial −54% (6,76→9,05), guides only −32% (6,27→6,59). „cazier iasi”: same impressions, pos 2,1→5,2, clicks 60→3. „cazier judiciar online” fell to page 2 (6,0→9,3).
- **Most probable cause:** an unannounced Google re-ranking of commercial pages in this niche, combined with a **SERP squeeze**. Hub MAI „Serviciu GRATUIT” sits at #1–2 everywhere (3 of the top 8 on „cazier judiciar online”), Poliția/IPJ and **digigov.ro** have risen, and 4 competitors run Ads on top while we are blocked. No AI Overview on the 6 queries checked on 03.11. Evidence: `seo/2026-11-03-cadere-mijloc-octombrie-urmarire.md`.
- **Why CJO keeps falling and egh does not:** a weak domain (63 external links from 31 sites vs 207 for egh) and **no brand searches** („cazierjudiciaronline” is auto-corrected to the generic query). This is an inference.
- **CJO conversion is not the cause:** the paid share of sessions held at 7,2–9,8%. Evidence: `seo/2026-11-03-…` "Verificare 05.11".
- **egh's October dip** is mostly the pension-news demand fading (position stable, „calcul pensie 2026” 298→9 impressions at pos 1) plus 1.069 long-tail queries lost. The sticky sale bar from 14.10 is a low-confidence coincidence (H3). Evidence: `aud/02-eghiseul.md` "Diagnosticul treptei din octombrie", H3.

### 2.4 Site-specific diagnoses
- **CJO CTR problem, not authority:** on „cazier judiciar online” egh had CTR 2,76% and CJO 0,40% at neighbouring positions. Fix the title/meta before spending on links. Evidence: `mem/cjo-ctr-nu-autoritate.md`.
- **ecazier:** indexing is fine (15/15). It lacks domain trust, and Google picks CJO for fiscal (CJO ~6 vs ecazier 28). The only real niche is cazier auto long-tail (positions 4–8), with 0 cazier auto orders in 60 days. Evidence: `seo/2026-10-05-ecazier-documentero-stare-organic.md`, `seo/2026-10-06-documentero-ecazier-pasi-urmatori.md`.
- **documentero:** a new domain being tested on the long tail (positions 7–15). Monthly 2.288 impressions / 74 clicks (Oct). Service pages do not catch the head queries, guides pull. On 06.10, 4 orders started, 0 paid (abandoned at personal data). Evidence: `aud/04-documentero.md`, `seo/monitorizare/2026-11.md`.
- **Cross-site risk:** one firm, 4 domains, the same services, cross-footers and the same review profile. The risk is "many sites → one funnel" where niches overlap, not duplicate text (CJO↔ecazier Jaccard 0,005–0,046). Evidence: `aud/00-sinteza.md` §2.

---

## 3. Recommendations already made, with status

Legend: **DONE**, **PARTLY DONE**, **NOT DONE**, plus **CANCELLED** or **DEFERRED (by rule)** where an owner decision applies. "Evidence" is a file or line I checked today unless marked (doc).

### 3.1 Recovery plan (09.09) — `rec/PLAN-RECUPERARE.md`, `rec/11-jurnal-executie.md`

| # | Recommendation | Status | Evidence |
|---|---|---|---|
| R1 | 301 the 48 city + 42 county location pages, enumerated (not wildcard on cities) | DONE | `next.config.ts:115-…` (one rule per city → `/servicii/cazier-judiciar-online/`); `next.config.ts:164` `/servicii/extras-de-carte-funciara/:judet/` → hub |
| R2 | 301 the 32 satellite articles | DONE | e.g. `next.config.ts:194`, `:219`; commit `36b6d8f` (doc) |
| R3 | Remove `aggregateRating` everywhere (not moved to Organization) | DONE | grep finds only comments: `src/lib/seo/schema.ts:138`, `src/lib/seo/homepage-schema.ts:60` |
| R4 | Remove identical `meta keywords` | DONE | comments at `src/app/layout.tsx:27`, `src/app/(eghiseul)/servicii/[slug]/page.tsx:154` |
| R5 | Real author (D1): page + `Person` instead of „Departamentul Juridic” | DONE | `src/app/(eghiseul)/despre-noi/raul-lutas/page.tsx` |
| R6 | „Despre noi” (D5), extended per outline in `rec/research/04-…` | PARTLY | page exists (`src/app/(eghiseul)/despre-noi/page.tsx`), but the 02.11 audit says 507 words, no contextual inlinks, last crawled 10.09 (`aud/02-eghiseul.md` M4). Last git change 2026-09-19 |
| R7 | Disclosure on wizard/checkout/success | DONE | `src/components/legal/order-flow-disclosure.tsx` used in `src/app/(order)/comanda/{[service],checkout/[orderId],success/[orderId]}/page.tsx` |
| R8 | Remove the closed SOL/ODR link | PARTLY | gone from site pages, still in the auth email `src/lib/email/templates/supabase-auth.ts:111` |
| R9 | Internal cohesion: crawlable links (`RelatedServicesLinks`), not `<select>` | PARTLY | `RelatedServicesLinks` added, but `ServiceSwitcher` still sits on ≥9 service pages and the wizard. Median inlinks only 7 on 02.11, with articles at 2–3 (`aud/02-eghiseul.md` H4) |
| R10 | Soft 404 on `/servicii/<anything>/` | DONE | commit `a3ea1c8` (doc `rec/11-…` §1) |
| R11 | Differentiate the 13 cadastral clones (owner kept them) | DONE | `4b9f392`: 62/78 → 0/78 pairs (doc) |
| R12 | D3: rewrite `extras-multilingv-*` pair | DONE | `5bd2583`: 0,751 → 0,421 (doc) |
| R13 | Rewrite the 32 "REWRITE" pages (depth, primary sources) | PARTLY | 20 done on 09.09, cazier judiciar 06.10, homepage reworked 02.11. **Not done:** `/curs-valutar`, `/servicii/rovinieta-online` (lot 3), and full rewrites of cazier fiscal, CF, birth, auto, marriage, celibacy, integrity and constatator (lot 4, "săpt. 43–45" in `docs/2026-10-plan-a-z-vanzari.md` D5 ⬜). CF got only corrections (13.10), constatator only facts (14.10) |
| R14 | 29 "KEEP + FIX" pages | NOT DONE | still ⏳ in `rec/11-jurnal-executie.md`, no later record |
| R15 | Real `datePublished`/`dateModified`/`lastmod` (D2) | DONE | `cl/2026-10-06-sitemap-lastmod.md` (112/112) |
| R16 | De-duplicate FAQ questions | DONE | `c279e26` + cadastral step (doc) |
| R17 | `llms.txt` corrected, rovinieta marked as affiliate | DONE | `src/app/llms.txt/route.ts` (ISR from DB), `cl/2026-11-02-seo-homepage-termene-schema.md` |
| R18 | Impozit-auto local pages (the only defensible location set: real local tax data) | DEFERRED (by rule) | `rec/11-…` "Observație pe drum". Only `src/app/(eghiseul)/calculator/calculator-impozit-auto/page.tsx` exists |
| R19 | Rebuild 4–5 real CF county pages only after proven recovery | DEFERRED | `rec/PLAN-RECUPERARE.md` §1.1 |
| R20 | Next Screaming Frog crawl with Crawl Analysis on | NOT DONE (no record) | the 02.11 audit used a curl mini-crawl |
| R21 | Fix the 120 lei ANCPI contradiction in the cadastru calculator | DONE (likely) | no „120 lei” in `src/app/(eghiseul)/calculator/cost-cadastru-intabulare/page.tsx`. The PDF checklist was not checked |
| R22 | Amendă rovinietă table after L. 226/2023 (TODO 01.10) | DONE | git `2026-10-13 content: articol amendă rovinietă rescris pentru Legea 226/2023` |

### 3.2 August master list — `seo/2026-08-07-MASTER-CE-MAI-AVEM-DE-FACUT.md`

| Recommendation | Status | Evidence |
|---|---|---|
| Add `www.eghiseul.ro` in Vercel (TLS error) | DONE | doc "STARE 7 aug"; `aud/02-eghiseul.md` "www→apex 308" |
| Redirect chains 2 → 1 hop | DONE | doc |
| Tool → service bridge on rovinieta | PARTLY | CTA under the widget plus links from auto calculators (09.09). Rovinieta is an affiliate (erovinieta.net), UTMs are lost, 0 paid orders ever (`mem/rovinieta-afiliere-nu-produs.md`) |
| Title/meta on cazier judiciar and constatator | DONE | `cl/2026-10-06-pagina-cazier-judiciar-rescrisa.md`, `cl/2026-10-14-constatator-pagina-adevarata.md` |
| 3 cazier fiscal articles | DONE | `src/app/(eghiseul)/cazier-fiscal-fara-spv/` and the others (doc) |
| Merge „certificat pierdut” + „duplicat” articles | CANCELLED | Raul's decision (doc). Later both became satellite redirects or moved to documentero |
| Finish click.ro and economica.net in the backlink pack | UNKNOWN | last status 07.08: click resent, economica "de trimis" (`seo/2026-07-31-articole-backlinks-plan.md` l.129–136) |
| CSP / HSTS preload | NOT VERIFIED | outside SEO scope |

### 3.3 Unified 15-point plan (02.11) — `aud/00-sinteza.md` §4

| # | Recommendation | Status | Evidence |
|---|---|---|---|
| 1 | ecazier: remove invented testimonials | DONE | no „Andreea N.” or „Maria Popescu” in `cazierjudiciaronline.com/src`; `cjo/decisions/2026-11-02-ecazier-recenzii-termene-oficiale.md` |
| 2 | ecazier: no automatic ONLINE10 | DONE | no `ONLINE10` in `src/app/ecazier` |
| 3 | CJO: request indexing on 8 pages | NOT VERIFIABLE | GSC action, no record |
| 4 | CJO `llms.txt` rewritten | DONE | `cjo/seo/2026-11-02-cjo-llms-schema-lastmod-constanta.md` |
| 5 | egh: one source for term/price on homepage and llms | DONE | `src/lib/services/public-facts.ts`, `src/components/home/faq-data.tsx:13` comment, no „24-48”/„instant” left in `src/components/home/` |
| 6 | ecazier: one standard term | DONE | decision file above |
| 7 | egh homepage = brand hub, exact-anchor links | DONE (measure ~30.11) | `src/app/layout.tsx:16` HOME_TITLE „…Servicii de obținere a documentelor, fără ghișeu”, `service-links-section.tsx` (doc) |
| 8 | ecazier homepage: auto first | DONE | decision file |
| 9 | CJO homepage title without „HUB MAI”, honest H1 | DONE | `cazierjudiciaronline.com/src/app/page.tsx:46` „Cazier judiciar online prin avocat: hârtie, apostilă, diaspora” |
| 10 | CJO cities on the Iași model, 1–2/week | PARTLY (paused) | `cazierjudiciaronline.com/src/config/city-guides.ts` has Iași, Brașov, Timișoara, Constanța. Tg. Mureș, Sibiu, Ploiești, Satu Mare and the rest are NOT done. **Freeze until the 17.11 comparison** |
| 11 | ecazier: no „documente oficiale” | DONE | grep in `src/app/ecazier` + Footer: 0 |
| 12 | Drop `Product`/`HowTo`/`LocalBusiness` on services | DONE | egh `src/lib/seo/schema.ts:132-139`; CJO doc; docx commit `32d37807` |
| 13 | Real `lastmod` on CJO/ecazier/docx | DONE | CJO doc 02.11; egh/docx `cl/2026-10-06-sitemap-lastmod.md` |
| 14 | docx: 1 guide/week, ≥5 inlinks, celibacy description ≤155 | PARTLY | 7 guides in `src/app/documentero/ghiduri/`, the last one on 02.11. The celibacy `DESCRIPTION` is still long (`src/app/documentero/certificat-de-celibat/page.tsx:17-18`) |
| 15 | Weekly measurement | PARTLY | CJO/egh weekly table filled for 02–08.11 (`seo/2026-11-03-…`). The docx table in `docs/documentero/continut-si-seo.md` stops at 21.09. The competitor checklist in `seo/monitorizare/2026-11.md` is empty |

### 3.4 egh audit extras (02.11) — `aud/02-eghiseul.md`

| Recommendation | Status | Evidence |
|---|---|---|
| C2/lot 4: rewrite fiscal → constatator → CF → auto service pages, 1–2/week | NOT DONE | the promised report `aud/07-*.md` ("curățenie șabloane imobiliare + constatator", `mem/curatenie-spam-update-live.md`) does not exist. No such commits since 02.11 |
| H3: test removing the sticky bar on 5 stable calculators | NOT DONE | `src/components/calculators/calculator-layout.tsx:396` `<ArticleStickyBar … allWidths />` on every calculator |
| H4: 3–5 contextual links into weak articles | NOT DONE | no record |
| M3: byline „Verificat de Echipa” → real person | NOT DONE | `calculator-layout.tsx:319` |
| M4: extend `/despre-noi/` | NOT DONE | see R6 |
| Constatator meta typo „,,” | NOT DONE | `src/app/(eghiseul)/servicii/certificat-constatator-online/page.tsx:46` |
| L1: 301 old WP sitemap/policy URLs | NOT VERIFIED | |
| egh cazier page: freeze for 4 weeks after 06.10, do not revert | RESPECTED | |

### 3.5 Infocazier and competitor actions (02.11) — `aud/06-infocazier.md` §7, `aud/05-competitie-caziere.md` §4

| Recommendation | Status | Evidence |
|---|---|---|
| A1: decide whether one brand (ecazier) moves to "the law office sells" (legal/fiscal decision) | NOT DONE | `docs/ads/2026-11-04-ce-putem-rula-acum.md` lists it as step 4, a decision for the lawyer and accountant |
| E1: do not touch egh birth/marriage pages, no 301 to docx | RESPECTED | |
| E3: remove „oficial” and „· IGPR” on CJO `/eliberare-cazier-judiciar-online` | DONE | `cjo/seo/2026-11-02-hub-cazier.md` §3 (16 → 0) |
| D1: docx intent guides (cost, duration, other city, child, appointment) | PARTLY | only „cât durează” (`src/app/documentero/ghiduri/cat-dureaza-duplicat-certificat-de-nastere/`) |
| D2: docx birth hub title „online sau la starea civilă” + guide list section | NOT DONE | `src/app/documentero/certificat-de-nastere/page.tsx:16` is still „Certificat de Naștere Online: Duplicat prin Avocat, Livrat Acasă” |
| C1: CJO cazier hub on homepage (39 cities + 23 guides), 3–6 neighbours instead of the 38-link block | DONE | `cjo/seo/2026-11-02-hub-cazier.md`, `src/config/city-neighbours.ts` |
| C2: CJO pages only for localities with a real police counter | NOT DONE | |
| M1: monthly SERP + Ads Transparency check on infocazier | PARTLY | checklist exists, unfilled (`seo/monitorizare/2026-11.md` "Concurenți") |
| CJO H1–H5 (program titles, every counter, GovernmentOffice, local FAQ) | PARTLY | applied to the 4 guide cities only |
| CJO M1: rewrite `/cazier-auto-online` (cazier rutier, DRPCIV, no diacritics) | NOT DONE (no record) | |

### 3.6 October diagnosis actions — `seo/2026-11-04-cjo-diagnostic-trafic.md`, `seo/2026-11-03-…`

| Recommendation | Status | Evidence |
|---|---|---|
| Add 4 live fiscal guides to the CJO sitemap | DONE | `cazierjudiciaronline.com/src/app/sitemap.ts:214-220`, commit 04.11 |
| Check `/cazier-fiscal-persoana-juridica` (6,5→18,4 since before 16.10) | NOT DONE | |
| Compare guide cities vs the rest on 17.11 | PENDING (date not reached) | |
| CJO city titles for people who cannot use Hub MAI (abroad, no 3DS card, apostille, firms) | PARTLY | the 4 guide cities only |
| Analyse digigov.ro | NOT DONE | no doc found |
| Microsoft Ads test 20–30 lei/day | NOT DONE, and doubtful | the 04.11 correction says Microsoft also bans third-party government documents (`docs/ads/2026-11-04-ce-putem-rula-acum.md`) |
| Build the CJO brand (GBP, its own reviews, mentions) | NOT DONE | reviews still point at the eGhișeul profile |
| Google Ads escalation with competitor evidence | ONGOING | `docs/ads/registru-demersuri.md` (G4b, G10) |

### 3.7 Links, GEO and other proposals

| Recommendation | Status | Evidence |
|---|---|---|
| Own-network contextual links (egh→CJO reabilitare, egh/CJO/avocat-tarta → ecazier/docx) | DONE | `cl/2026-10-06-linkuri-catre-cjo.md`, `cl/2026-10-05-linkuri-ecazier.md`, `mem/documentero-backlinks-surse.md` |
| Ask Antena 3 ×2, ProTV and infocons to add `rel="sponsored"` to paid CJO links | NOT DONE | drafts only, "Nimic nu a fost trimis" (`seo/2026-10-06-cjo-linkuri-drafturi.md` §A) |
| PR release with CJO order data (400 orders, reasons) | NOT DONE | draft only (same file §B) |
| Diaspora press article signed by the lawyer; real answers on avocatnet | NOT DONE (no record) | `seo/2026-10-06-cjo-backlinks-plan.md` §4b |
| Institutional links (Barou, primării, CCI, universities) | NOT DONE (no record) | `seo/2026-07-29-lista-tinte-backlinks.md` §1 |
| GEO: „Pe scurt” answer blocks, AI bot access, visible freshness | DONE | `cl/2026-10-06-raspuns-pe-scurt-si-roboti-ai.md` |
| GEO: brand mentions off-site (the strongest signal per Ahrefs), YouTube | NOT DONE | `seo/2026-10-06-geo-ai-citari-plan.md` "propunere"; videos stay off GitHub (`mem/youtube-eghiseul-clipuri.md` index) |
| Remove the „Oficial CNAIR” badge on the rovinieta form | NOT DONE (awaiting Raul) | `src/components/rovinieta/rovinieta-purchase-form.tsx:123`; `mem/erovinieta-net-cnair-neautorizat.md` |
| ecazier: stop active investment if `/cazier-auto` is not in the top 10 by 19.10 | DEFERRED (F4 ⏸) | `docs/2026-10-plan-a-z-vanzari.md` F4 |
| CJO C5: consolidate city pages under 200 impressions/month if impressions keep falling | ON HOLD (⏸) | same file C5 |

---

## 4. Hard rules and constraints

**Content rules** (`/Users/raul/Projects/eghiseul.ro/.claude/rules/content-and-seo.md`):
1. **No template page without its own data.** Jaccard on 5–6-word shingles of `<main>` vs sibling pages: a page does not ship if **masked > 0,65** or if masking raises the score by **more than +0,12**. Normal > 0,45 means fix it. (The rule's first version, "must not rise when masked", was mathematically impossible and was corrected on 09.09.) Corollary: **no page at a granularity the institution does not have** (cazier is issued per county IPJ, so city pages were all the same page).
2. **No batches: at most 1–2 new public pages per week**, and per `aud/00-sinteza.md` §5, at most 1–2 new or rewritten pages per week **per site** and 3 new guides per week across all 4.
3. **Zero invented data**: no rating/review counts without a real current source, no `aggregateRating` on Product/Organization, no fake `Person` authors, no filler dates, no aging timestamps („acum 4 zile”). Single sources: `SOCIAL_PROOF` (`src/lib/seo/constants.ts`) and `SITE_AUTHOR` (`src/lib/seo/author.ts`). The real figure is 4,9 / 464 Google reviews for the company (D6).
4. **Curated sitemap**, not generated from routes.
5. **Internal links count as much as content.** No page ships without inlinks. A `<select>` with `router.push` is not a link. When you consolidate a page, repoint its links to the target.
6. **301 to the thematic parent** wherever inlinks, backlinks or clicks exist. **410** only where none exist. Never hard-delete a page with backlinks. Check redirect chains first.
7. **Private-service disclosure on every public page and on the order screens** (`OrderFlowDisclosure`): non-affiliation, company data, ANPC/SOL. Verb rule: **we „obținem”, the institution „eliberează”**. Do not write that the institution issues something „gratuit” as a headline. Say „se poate elibera la ghișeul IPJ/ANAF” (`mem/cjo-formular-sub-pliu-incident.md`).
8. **Measurement:** watch `/servicii/` impressions before clicks, check the real SERP only with `&pws=0`, exclude ANCPI from comparisons, and turn on Screaming Frog Crawl Analysis.

**Wording and ad-policy constraints:**
- Never pair „oficial/oficiale” with „documente/acte/document/act”. Allowed: „taxa oficială”, „portalul oficial”. Source: `mem/google-ads-documente-oficiale.md`.
- No „instant”, „24-48h” or terms shorter than the config. Do not copy competitors' 149 lei / 24–48h. Source: `aud/00-sinteza.md` §5.
- **Google Ads "Government documents and services"** (policy updated 22.10.2025, enforcement tightened 05.10.2026): only certified governments or "authorized providers" linked from a government site may advertise. Covered categories include criminal background checks, birth/death certificates, business identifiers (constatator) and road tolls. **A new account is "circumventing systems"** (the documentero account was rejected on celibacy on 07.10). Possible path: an exclusion request for cazier fiscal / celibacy / marriage (draft, unsent). Sources: `seo/2026-07-26-conformitate-si-sesizari-concurenta.md`, `docs/ads/2026-11-04-ce-putem-rula-acum.md`.
- **Microsoft Ads** also bans third-party sale of state documents (US-only authorized program). **ChatGPT Ads** bans legal services / document preparation outside the US, so only constatator and CF qualify (no lawyer in the flow). Meta is open. Sources: `docs/ads/2026-11-04-…`, `mem/chatgpt-ads-romania.md`.
- Rovinieta is an affiliate, not our product: no paid traffic. The „Oficial CNAIR” badge is a risk. Sources: `mem/rovinieta-afiliere-nu-produs.md`, `mem/erovinieta-net-cnair-neautorizat.md`.

**Structural and owner decisions:**
- **No new public pages on egh until recovery.** New content goes to documentero (1 useful guide per week). Owner decision of 02.11 (`mem/curatenie-spam-update-live.md`).
- **No location pages**: no communes, sectors, counties or cities on egh, ecazier or docx. CJO only for localities with a real police counter, and only after the existing cities are rewritten. Bucharest sectors and commune→counter mappings go as **tables inside existing pages**. Sources: `aud/00-sinteza.md` §5, `docs/documentero/analiza-competitori-seo.md` §F.
- **Do not touch calculators** (they survived and rose) except for contextual links. Source: `rec/PLAN-RECUPERARE.md` §2.
- **No 301 egh → documentero** until docx beats egh on the same measured query (egh is #1 on „duplicat … online” and on marriage/celibacy). Sources: `docs/documentero/continut-si-seo.md`, `aud/06-infocazier.md` E1.
- **No revert** of the CJO city rewrite of 05.10 or of the egh cazier page of 06.10. **No bulk CJO changes before 17.11.** No more title rewrites for now (changed 07.10 and 02.11). Source: `seo/2026-11-04-cjo-diagnostic-trafic.md`.
- **The order form stays in the first mobile screen** on sales pages (CJO incident 05–08.10: form starts ÷3). Measure the form top at 390×844 (< 0,7 screens) and watch `abandoned_sessions` for 3 days after any SEO/GEO edit. Source: `mem/cjo-formular-sub-pliu-incident.md`.
- **Do not buy links in a hurry, no disavow without evidence, no indexing-request loops, no Indexing API.** The July paid links did not protect the pages. Sources: `seo/2026-11-04-…` "Ce nu facem", `seo/2026-10-06-cjo-backlinks-plan.md`.
- Never mix egh and CJO in the same paid advertorial. Do not link egh `/servicii/*` to CJO, because they compete on „cazier judiciar online”. Sources: `mem/cjo-ctr-nu-autoritate.md`, `seo/2026-10-06-cjo-backlinks-plan.md` §4a.
- ecazier: auto + fiscal + guides for drivers only, no cities and no CJO clones. Cross-brand links stay contextual, not sitewide blocks. Source: `aud/00-sinteza.md` §5.
- Do not align the foreign-citizen price between CJO (350) and ecazier (315) ("rămâne așa"). Source: same.
- Do not add or remove `FAQPage` as a tactic. Source: same.
- Before writing a new article, check existing pages (`HARDCODED_ARTICLE_SLUGS`, `ls src/app`) and strengthen the ranking page instead of cannibalising it. Source: `mem/serp-real-vs-gsc.md`.
- Repo `rlutas/eghiseul.ro` is **public**: no personal data in `docs/`, and `git add` only with explicit paths.

---

## 5. Open hypotheses, not yet tested

1. **The sticky sale bar or cards from 14.10** contributed to the −40% egh article/calculator step of 16–17.10 (low confidence). The proposed A/B on 5 calculators has not been run (`aud/02-eghiseul.md` H3).
2. **"The law office sells" model** (infocazier: the advertiser, merchant and contract are all Cabinet Avocat Grosu) is why they are Ads-eligible in the restricted category. Unproven, because Transparency Center does not show certifications (`aud/06-infocazier.md` §3.3).
3. **CJO keeps falling because of weak authority / no brand demand** (63 links from 31 sites, no branded queries). Competitor link profiles were never measured (no Moz/Ahrefs key) (`seo/2026-11-04-…` cause 4).
4. **Competitor reports to Google** (after our 12.10 complaints) are a coincidence to watch, with no evidence.
5. **"Pe scurt" city-guide format beats the generic template** (Iași/Brașov/Timișoara/Constanța vs the rest). The test reads on 17.11.
6. **The egh homepage as a brand hub** removes the cannibalisation on „cazier*”. Indicator: service/homepage impressions on cazier queries were 20/474. Check after 4 weeks (~30.11).
7. **egh commercial recovery needs a future core/spam update** (Nov 2026 – Feb 2027 estimate). Rewriting lot 4 is the only lever meanwhile, and its effect is unproven.
8. **Higher-intent traffic is thinner on CJO**: step-2 abandon rose from 31% to 46–50% from 23.10 with unchanged code (`seo/2026-11-03-…`).
9. **Infocazier's ~3.240 commune pages will be hit by a future update.** Watch the zlatna/albac/campeni SERP monthly (`aud/06-infocazier.md` §5).
10. **Price as a CTR/conversion factor**: 198 lei / 3–5 days vs 189 lei (infocazier) and 149 lei / 24–48h (cazierul-judiciar-online.ro). For birth: 998 lei vs 600+30. Untested, and it is a business decision (`aud/06-infocazier.md` E2).
11. **Bing as an under-used channel**: egh Bing clicks +25% while Google fell, and earlier 8 paid orders/30d from Bing (`mem/monitorizare-seo-lunara.md`, `mem/cazier-judiciar-canale-reclama.md`). Not exploited.
12. **Commune→nearest-counter table inside a city page** (cazierul-judiciar-online.ro) covers rural queries without new pages. Not built, because the distances would be our own inference, not sourced (`cjo/seo/2026-11-02-orase-pe-scurt-…`).
13. **Lighter HTML** (egh service pages 520–780 KB of RSC payload) could matter for fetchers that truncate. No evidence (`seo/2026-10-06-geo-ai-citari-plan.md`).
14. **Moving the egh birth page to documentero by 301** if egh does not return to the top 20 within 30 days of the docx flip. Superseded: egh is #1 on „duplicat … online” (`docs/documentero/analiza-competitori-seo.md` §G vs `aud/06-infocazier.md` §2.1).

---

## 6. Backlinks and off-page work done

- **Paid pack, 31.07** (Comunicatedepresa.ro, ~880 €): money.ro (3 dofollow), risco.ro (3), startupcafe.ro (2), start-up.ro (2, the only commercial anchor „certificat constatator online”) were live and verified by 07.08. click.ro was resent and economica.net was still to send, and their final status is unrecorded. Targets were the CF service and constatator service. Outcome: **the CF page fell 7,84→22,32 and constatator 14,3→21,2 after the August update**, so the links did not protect them. Sources: `seo/2026-07-31-articole-backlinks-plan.md`, `mem/backlinks-pachet-cumparat.md`, `seo/2026-10-06-cjo-backlinks-plan.md` §1.
- **Older advertorials:** egh has 2 on antena3.ro `/continut-platit/`, 3 on ziare.com and 2 on cotidianul.ro (exact anchor). Repeat links from the same domain add little (`seo/2026-07-29-analiza-oferte-backlinks.md`).
- **CJO paid links without `rel="sponsored"`:** Antena 3 ×2, Știrile ProTV „(P)” with exact anchors, infocons.ro (each with 3 dofollow). The risk is flagged and the correction emails are drafted but **not sent** (`seo/2026-10-06-cjo-linkuri-drafturi.md`).
- **Profile size (GSC, 04.11):** egh 207 external links, CJO 63 from 31 sites (`seo/2026-11-04-cjo-diagnostic-trafic.md`). Top linking sites export for egh: `seo/gsc-data/top-linking-sites-2026-07-29.csv`.
- **Own network** (4 sites + avocat-tarta.ro, repo `/Users/raul/Projects/avocat-tarta-gabriela`, Netlify):
  - docx gets footer + in-text links from egh (birth, marriage, celibacy, multilingv, „model vechi”), a footer on CJO and ecazier, and footer + 2 articles on avocat-tarta (21.09) (`mem/documentero-backlinks-surse.md`);
  - ecazier gets egh footer + 3 article links, 4 CJO in-text links and avocat-tarta footer + 1 article (05.10);
  - CJO gets links from egh `/calculator/reabilitare/` and the cazier-vs-integrity article to CJO reabilitare guides (06.10).
  - Rule: contextual, a few links each, never from egh `/servicii/`.
- **Digital PR:** a teachers/integrity pitch to Edupedu and others was prepared on 29.07 (`seo/2026-07-29-digital-pr-profesori-septembrie.md`), with an embed widget for the press (changelog 29.07). Whether anything was published is unrecorded.
- **Institutional targets listed, not pursued:** Barou Satu Mare, primării "linkuri utile", CCI, universities (`seo/2026-07-29-lista-tinte-backlinks.md`). The 06.10 plan judges institutions as near-zero chance.
- **Reporting and complaints (off-page or competitive):** Google Ads reports of competitor ads (2 rounds, G4b), complaints to ANCOM and the Consiliul Concurenței (12.10), ANSPDCP complaints on 4 competitors prepared. See `docs/ads/registru-demersuri.md`. Note: team complaint files must not go to the public repo (incident 14.10).
- **Bing/IndexNow:** all 4 sites are in Bing Webmaster with IndexNow keys and crons. Old WP sitemaps were removed from Bing on 10.11.
- **GBP:** a real eGhișeul profile (Satu Mare, 4,9/464). CJO has no profile of its own.

---

## 7. Data findings worth reusing

**CTR and position facts**
- On „cazier judiciar online” (3 months to 31.07), egh had pos 6,34 with CTR **2,76%** and CJO pos 7,68 with **0,40%**. At similar positions CJO took 7× fewer clicks, which is a snippet problem (`mem/cjo-ctr-nu-autoritate.md`).
- CJO homepage, Mar 2026: 195.686 impressions at **0,46% CTR**. Oct: `/` 34.463 impressions, pos 7,4, CTR 0,62% (`cjo/seo/README.md`, `seo/2026-10-06-cjo-backlinks-plan.md`).
- CJO city queries at pos 1,7–3,3 had CTR **10–28%** before October. Moving from rank 3–4 to 5–6, under police + map + Hub MAI, cut clicks −80–90% at flat impressions. „cazier oradea” went pos 2,0→2,2 with CTR 12,6%→8,5%, so **CTR also falls at equal position** (17 queries: 7,18%→5,05%) (`seo/2026-11-04-…`).
- „duplicat certificat de nastere online” is egh **#1**, with real CTR 17,3% in Aug and GSC pos 1,4 in Oct. „certificat de nastere” is an institutional SERP: GSC pos 3,0 but not in the real top 9, CTR 0,1–0,3% (`seo/2026-08-07-audit-concurenta-serp-real.md`).
- **GSC position ≠ SERP place.** GSC averages over all surfaces. Always check `google.ro/search?q=…&hl=ro&gl=ro&pws=0&num=20` (or `udm=14`) (`mem/serp-real-vs-gsc.md`).
- 28-day snapshots mislead on seasonal services: cazier fiscal shows 6,6 on 28 days vs 8,85 on 3 months. Use 3-month **page-level** position (`mem/cjo-ctr-nu-autoritate.md`).
- In GSC, compare **the same weekday**. Fri/Sat are always low, and GSC days run on Pacific time (they start 10:00 RO) (`seo/2026-11-04-…`).
- Conversion by topic (Aug): **cazier fiscal 64%** (14/22, best on the site). Birth 12,7%, but the **average order is 1.260 lei**. Civil status was ~50% of revenue before the update (44 orders / 51.176 lei in 90 days) (`mem/analiza-organic-2026-08-07.md`, `seo/2026-09-19-site-satelit-stare-civila.md`).
- CJO converts 0,7% of clicks (~15k clicks/month → ~110 orders), with paid share of sessions 7–10%. 85% of CJO buyers are PF, 85% take electronic only. Reasons: employment 29%, transport 17%, tenders 12%, abroad 9% (`cjo/seo/2026-10-05-…`, `seo/2026-10-06-cjo-linkuri-drafturi.md` §B).
- AI assistants (egh, 90 days to 06.10) started 25 orders, 5 paid, 2.290 lei. Bing Copilot (3 months) gave 70,7k citations, mostly calculators. On sold documents: marriage (890+581), integrity (710), birth (~590), CF (~570), celibacy only 14 (`seo/2026-10-06-geo-ai-citari-plan.md`, `seo/2026-10-07-unde-stam-seo-ai-reclame.md`).
- Monthly baseline (03–30.10 vs 05.09–02.10): egh 13.554 clicks (−28%, mostly the pension calculators), CJO 278/day vs 527 (−47%), docx 74 clicks, ecazier 46. docx's best page is the guide `/ghiduri/certificat-de-nastere-vechi-tipizat/` (33 clicks, pos 4,6) (`seo/monitorizare/2026-11.md`).
- Weekly tracking baseline: 26.10–01.11 = 20 egh + 11 CJO orders, 7.601 lei, CJO 155 clicks/day, egh 378. **Recovery signal:** CJO > 250 clicks/day for 2 weeks or > 25 CJO orders/week. **Alarm:** CJO < 100/day or < 5 orders/week (`seo/2026-11-03-…`).

**SERP features seen**
- **Hub MAI** (hub.mai.gov.ro) titled „Serviciu GRATUIT pentru certificatul de cazier judiciar” at #1–2 on every cazier query, taking 3 of the top 8 on „cazier judiciar online” (03.11). On birth queries the Hub MAI page says lawyers may file under Law 51/1995 (avg 3 working days, max 30), and Google quotes it (`seo/2026-11-03-…`, `docs/documentero/analiza-competitori-seo.md` §3).
- **AI Overview:** present on all 5 key egh queries on 13.07 and 07.08 (egh cited by name on 4/5, not on CF). It was absent on the 6 cazier queries on 03.11. On 02.11 the AIO on „cazier iasi” cited MAI, cazierul-judiciar-online.ro (address) and digigov (hours/cost), and on „cazier auto online” it named „DigiGov.ro sau Caziere.ro” as paid alternatives. On birth, the AI summary cites Hub MAI and DLEP Iași („prezentare fizică necesară”) (`seo/STRATEGY-2026-07-13-…`, `aud/05-competitie-caziere.md` §1, `mem/serp-stare-civila-2026-09-20.md`).
- **Police IPJ pages** (`<jud>.politiaromana.ro`) at #1 on city queries, plus maps.
- **Competitor Ads on cazier (03.11):** „cazier judiciar online” had infocazier, caziere.ro and roghiseul. „cazier judiciar” had infocazier, obtinecazier and roghiseul. „cazier timisoara” had roghiseul and obtinecazier. „cazier judiciar craiova” had roghiseul. infocazier also bids on communes. **Zero ads on any birth/marriage query** (02.11), which makes it the top Ads target if an account ever becomes eligible.
- Review snippets lost on CJO (3.706 impressions / 41 clicks → 0) after the fake reviews were removed. Accepted (`seo/2026-11-04-…`).
- Google has dropped FAQ rich results (May 2026), so FAQPage is neutral.

**Competitors**
- **infocazier.ro** (domain registered 14.03.2025, React SPA homepage, pre-rendered content; `aud/06-infocazier.md`):
  - size: 3.732 URLs (cazier 3.284 incl. communes, birth 223 with 22 intent guides, marriage 225 with 25 guides), all with batch `lastmod` 28.10;
  - linking: hub `/cazier-judiciar/` has 143 links in `<main>`, the birth hub 116 (ours 15–17);
  - titles answer the informational intent first („online sau la primărie”, „ghișee, program”), with a „Pe scurt” block and „actualizat octombrie 2026”;
  - schema: GovernmentOffice + GeoCoordinates + OpeningHours;
  - lawyer named (Av. Grosu, since 2008); prices 189 lei cazier / 24–48h and 600+30 lei birth; unsourced „10.000+ documente”;
  - ranking: birth #2–3 everywhere, #1 on „certificat de nastere online pret”; commune pages are #1 on zlatna/albac/campeni;
  - similarity: commune pages pass our Jaccard (0,14–0,39 masked) through computed data and rotated H2s. Birth city pages fail (0,59–0,68 masked);
  - Ads: 59 Search ads, advertiser „Cabinet Avocat Grosu Alexandru” (AR04106916843048927233), labelled "Legi și guvernare", running 02.11.2025 → 01.11.2026, 250–300k impressions on one creative.
- **cazierul-judiciar-online.ro** (2024-10) is the model to follow on cities: handwritten pages (Iași↔Brașov Jaccard 0,05), 2.129 words, every counter with landmarks, a commune→counter table, „Verificat la 01.11”, 9 local FAQs, GovernmentOffice schema, 149 lei / 24–48h, real video and Maps reviews. Its trust bar says „Document emis de Poliția Română” (do not copy as a badge) (`aud/05-competitie-caziere.md`).
- **caziere.ro** (2022) ranks despite its pages: SPA without SSR, no schema, no price, canonical to the homepage everywhere, spun text. It probably wins on brand, age and links (unmeasured). Ads labelled "Finanțe".
- **digigov.ro** (2023-08) is new near the top: 49 cazier city pages, 145 CF county pages, 43 constatator county pages, 198 lei, „Verificat pe…” in the meta description, cited in AIO. Its cluster is the one egh deleted. **Not analysed yet.**
- **roghiseul.ro** (CENTRUL DE SOLUȚII ADMINISTRATIVE SRL, Satu Mare) runs 24 confirmed ads and uses „documente oficiale” freely. Its landing pattern: "asistență și intermediere" positioning, a non-affiliation disclaimer, visible prices. **obtinecazier** shows 249 RON, form in the first screen, 616 words. **constatator-online.ro** advertises on constatator (`mem/google-ads-smecheria-competitorilor.md`, `seo/2026-11-04-…`).
- **Birth/civil status:** centruldevize.ro (#1 on birth, no price, 10 question-H2s, CIEC Convention 16), gabrieldragomir.ro (lawyer), laghiseu.ro (999 lei birth, money-back), ghiseurapid/certificatrapid (800 lei). On price, we are the most expensive (998 lei vs 500–800) (`docs/documentero/analiza-competitori-seo.md` §3).
- **CF:** efunciara.ro („49 Lei, 20 min, 24/7”), cfunciara.ro (egh copied its real-estate price grid), extrase.ro (7.000-word guide; per-commune pages = doorway), hartilidar.eu (guide at #2) (`seo/STRATEGY-2026-07-13-…`, `seo/2026-08-07-audit-concurenta-serp-real.md`).
- **Cazier fiscal:** SERPs are 5 of 9 informational (ANAF, serviciipublice.gov.ro, startco, startarium, keez, lege5). digigov is #2–3. CJO outranks egh (`seo/2026-08-07-audit-concurenta-serp-real.md`).

**Other reusable facts**
- Demand (Semrush, June): birth cluster 27.670/month at KD 11% (head „certificat de nastere” 1.900, „duplicat … online” 1.000, „pierdut” 590, „schimbare … vechi” 480), marriage 5.850/month, Bucharest sectors 2.350 on the cluster (`seo/2026-09-19-…`, `docs/documentero/continut-si-seo.md`).
- There is **no "cazier judiciar {oraș}" query in egh's top 1.000**. The only real geographic demand on egh is the auto tax calculator (446 clicks), where local tax data really differs per locality (`rec/11-jurnal-executie.md`).
- Base rates (treat as indicative, unverified): 22% of ~400 HCU-hit sites recovered ≥20% within a year. HouseFresh took 2 years (`rec/2026-09-25-…` §8).
- Ahrefs 2026 studies cited in the GEO plan: added schema does not raise AI citations, `llms.txt` gets almost no AI requests (97% of files had zero), brand mentions correlate 3× better than backlinks, and AI cites fresher content (`seo/2026-10-06-geo-ai-citari-plan.md`).
- egh CWV is good (LCP 1,34 s, INP 125 ms) but degrading over 25 weeks (TTFB 216→428 ms). HTML is heavy at 520–780 KB (`aud/02-eghiseul.md`).
- Access: GSC/GA4/Bing via the service account `claude-seo@caziere` and `gsc_query.py` (`mem/gsc-acces-si-export.md`, `mem/monitorizare-seo-lunara.md`). GA4 IDs: egh 422029610, docx 555162763, CJO 402467033, ecazier 536020358. CJO and ecazier GSC data start only on 20.09.2026. Monthly monitor: `scripts/seo/monitor-lunar.py` → `seo/monitorizare/`.
