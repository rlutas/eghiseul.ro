# 03 — CJO on-page and technical audit (+ ecazier.ro)

Date: 10.11.2026. Read-only. Crawled live with curl from the two live sitemaps (CJO 75 URLs, ecazier 15 URLs), one request every ~0.6 s per host. GSC numbers come from the Search Console API (property `sc-domain:…`), window **13.10–07.11.2026 (26 days)**: CJO 4,861 clicks, 235k impressions; ecazier 49 clicks, 2.35k impressions. The caller's figures for the key queries are monthly; mine are for 26 days, and both show the same picture.

Method notes:
- "Content" links are links inside `<main>`. Links in `<header>`/`<nav>` count as nav and links in `<footer>` count as footer. Breadcrumb "Acasă" links sit inside `<main>`, which is why `/` shows 61 content inlinks.
- "Price in first screen" means a `NNN lei/RON` amount in the first 120 words of main text.
- Word count is the visible text in `<main>` of the server HTML. It includes the order-form labels on pages that embed the form.
- Raw data, scripts and HTML are in `scratchpad/seo-plan/raw/` and `scratchpad/seo-plan/scripts/`.

---

## 0. Prioritized issue list

| # | Sev | Issue | Evidence | Controlled by |
|---|---|---|---|---|
| 1 | **HIGH** | **Any slug under `/cazier-judiciar-online/` renders a 200, self-canonical, indexable "city" page.** This is an unbounded doorway URL space. | `/cazier-judiciar-online/xyzabc` → 200, title "Cazier judiciar online xyzabc, fără drum la poliție", canonical to itself. `/paris`, `/ilfov` and `/hunedoara` behave the same way. The code falls back with `cityInfo?.name \|\| city` and has no `notFound()` or `dynamicParams = false`. Anyone (a scraper, a spammer, a typo link) can create indexable template pages under our domain, which is exactly the pattern the spam update punished. | `src/app/cazier-judiciar-online/[city]/page.tsx` (`generateMetadata` + `CityPage`; add `export const dynamicParams = false` or `notFound()` when the slug is not in `siteConfig.seo.cities`) |
| 2 | **HIGH** | **The header "Servicii" and "Orașe" menus do not exist in the HTML.** Crawlers see no nav links to any service page. | The desktop dropdowns are rendered only after a click (`{servicesOpen && …}`, `{citiesOpen && …}`), and the mobile menu is a Radix Sheet that is closed in SSR. The SSR `<nav>` contains only `/`, `/blog`, `/contact` and `/status-comanda`. Every service page therefore has **0 nav inlinks**. This is the same mistake as `ServiceSwitcher` on eghiseul (rule 5: what isn't an `<a>` in HTML isn't a link). | `src/components/shared/Header.tsx` (lines ~55–118, ~150–256): render the links always and hide them with CSS, or add a server-rendered service and city strip |
| 3 | **HIGH** | **"cazier judiciar online" is split across 19 URLs, and the money query converts at 0.43%.** | 13,495 impressions and 55 clicks in 26 days. `/` gets 11,640 impressions at pos 7.0. `/eliberare-cazier-judiciar-online` gets 499 at 10.9 with **0 clicks**. Cluj gets 367 at 9.2, București 352 at 11.5, Oradea 197, and so on. "cazier online" is split across 24 URLs (home CTR 0.18%). The `/eliberare…` H1 is literally "Eliberare Cazier Judiciar Online" and competes with home. | `src/app/page.tsx` (home metadata); `src/app/eliberare-cazier-judiciar-online/page.tsx` (H1/title: re-aim it at "eliberare / procedură / termene") |
| 4 | **HIGH** | **The home snippet doesn't answer the "why pay when it's free" objection in the SERP.** The Hub MAI result says GRATUIT and competitor ads sit above us. | Title: "Cazier judiciar online prin avocat: hârtie, apostilă, diaspora" (62). It leads with niche needs (paper, apostille, diaspora) rather than the main one: no account, no queue, fast. The description opens with a question about hub.mai, which is good, but the benefit sits at character 110+. See §3. | `src/app/page.tsx` `metadata` (l. 37–50) |
| 5 | **HIGH** | **Certificat de integritate: pos 5.5, CTR 0.13% (3,000 impressions → 4 clicks).** | The title ends in "· 198 lei", which reads as a price tag for an informational, usually free query ("ce este", "de unde se scoate"). The H1 has no diacritics ("Comportamentala"). No title or description element answers "where do I get it / is it free". | `src/app/certificat-integritate-comportamentala/page.tsx` (l. 41–45) |
| 6 | MED | **"ghiseul.ro cazier" (4,838 impressions, pos 5.9, CTR 0.5%) lands on `/cazier-judiciar-gratuit`, but that page's title and description never mention ghiseul.ro.** | Title: "Cazier judiciar gratuit: cum îl obții la ghișeu, pas cu pas". "ghișeu" (counter) is not "ghiseul.ro" (portal). Searchers asking whether ghiseul.ro issues the cazier don't see their question answered, so they skip. The body says some police stations take "programare prealabilă online prin ghiseul.ro", which is a factual claim to verify. | `src/app/cazier-judiciar-gratuit/page.tsx` (l. 36–40 + body) |
| 7 | MED | **Strong informational pages are weakly linked (≤3 content inlinks, no nav or footer).** | `/conditii-de-calatorie-cu-minori`: 1 inlink, 8,133 impressions, pos 7.5. `/verificare-cazier-fiscal-online`: 1, 1,287, pos 10.4. `/cazier-fiscal-pentru-cetatean-strain`: 1, 1,139. `/valabilitate-cazier-fiscal`: 3, 1,351. `/cazier-judiciar-pentru-angajare`: 3, 1,511, pos 4.8. `/corectarea-informatiilor…`: 3. `/comparatie-servicii`: 2. Full list in §2. | page bodies + `src/components/shared/Footer.tsx`; a related-links block on articles |
| 8 | MED | **City template pages: 19 sibling pairs (15 pages) above the 0.45 "repair" threshold on normal Jaccard.** All pages pass the hard rule (masked ≤ 0.65, jump ≤ +0.12). | Template pages: mean 0.404 normal / 0.488 masked / +0.084 jump; max pair Brăila–Galați 0.490 / 0.590. 404 shingles (~56% of a template page's ~725) appear on ≥ 90% of template pages, mostly the embedded order form plus the price, "options" and "how it works" blocks. The 4 hand-written guides sit at 0.06–0.07. See §4. | `src/app/cazier-judiciar-online/[city]/page.tsx`, `src/config/city-data.ts`, `src/config/city-guides.ts` |
| 9 | MED | **`dateModified` = 2026-11-02 on 63 of 75 pages.** | One sitewide bump. `page-dates.ts` says the change was price alignment (home, fiscal, auto, integritate) and then the city template. Rule 3 bans filler dates. A price change on 4 pages doesn't justify a new date on 63, including blog articles. | `src/config/page-dates.ts` |
| 10 | MED | **Authors are organisations, not people.** | All 27 `Article` nodes have `author: Organization "EDIGITALIZARE S.R.L."`, and visible bylines say "De echipa EDIGITALIZARE S.R.L.". The lawyer is real and named on the pages (Cabinet de Avocat Tarța Ana-Gabriela, Baroul Satu Mare) but is not used as a reviewer. ecazier: `Organization "eCazier.ro"`. The rule forbids fake persons, not organisations, so this is weak E-E-A-T rather than a violation. | article templates (`src/components/…/Article*`, page JSON-LD) |
| 11 | MED | **Legacy URL with impressions returns 404.** | `/cazier-judiciar-oradea-program-ghiseu-si-varianta-online`: 39 impressions at pos 1 in GSC, live 404. Rule 6: 301 to `/cazier-judiciar-online/oradea`. | `next.config.ts` redirects |
| 12 | LOW | **Long or duplicated-brand titles.** | 21 titles > 60 chars and 15 > 70. 20 titles end in "\| Cazier Judiciar Online" from the layout template. `/ghid-reabilitare-cazier` is 105 chars with **two** brands ("\| CazierJudiciarOnline.com \| Cazier Judiciar Online"). `/cazier-auto-online` is 92 chars with "Sanctiuni" (no diacritics) and the brand "Cazier Judiciar Online" on a cazier auto snippet. 56 of 75 descriptions are > 160 chars. | `src/app/layout.tsx` (`template: "%s \| …"`); per-page `metadata`; `src/app/ghid-reabilitare-cazier/page.tsx` l. 24 |
| 13 | LOW | **H1 words glued in the text (no space between spans).** | 24 pages, for example `Cazier judiciar online<span class="block">prin avocat…` → "onlineprin". Browsers render it on two lines, but text extractors and non-JS AI crawlers read "onlineprin", "AutoOnline", "IntegritateComportamentala". | `src/components/sections/HeroSection.tsx` and the article hero (add `{" "}` before the span) |
| 14 | LOW | **`/multumim` has no noindex and no canonical** and inherits the default title. `/status-comanda` (18 words) is in the sitemap and indexable on CJO, while ecazier's equivalent is `noindex, follow`. | Live headers and meta. | `src/app/multumim/page.tsx` (client page, needs a layout with `robots`); `src/app/status-comanda/page.tsx`; `src/app/sitemap.ts` |
| 15 | LOW | **`http://www.` takes 2 hops** (→ `https://www.` → apex). Everything else is 1 hop. | 308 chain. | Vercel domain config |
| 16 | LOW | **Money pages without a price in the first screen:** `/cazier-judiciar-diaspora` (2,692 words, has the form, no price in the hero). | Parsed first screen. | `src/app/cazier-judiciar-diaspora/page.tsx` |
| 17 | INFO | `GovernmentOffice` nodes (IPJ addresses and opening hours) sit on 4 guide pages with `@id` on our domain. That's fine as data, but keep them out of `provider` or `publisher` so the page is not read as the office's own page. | JSON-LD on iasi, timisoara, brasov, constanta. | `src/app/cazier-judiciar-online/[city]/CityGuideView.tsx` |

What is fine (verified):
- All 75 sitemap URLs return 200 with no redirect. Canonical equals the URL on all 75.
- No `noindex`. No hreflang (correct: single-language `lang="ro"`).
- Trailing slash → 308 to no-slash, consistently. Internal links never use a trailing slash or `www`.
- All 79 internal link targets return 200: **no internal redirects, no internal 404s**. `?utm_` pages canonicalise to the clean URL.
- robots.txt is clean (AI bots allowed; `/api`, `/admin`, `/ppc` and WP paths disallowed).
- Zero `aggregateRating` and zero `Review` nodes. Testimonials are attributed in the text to the eGhișeul.ro Google profile.
- No orphans in the sitemap.
- The `ecazier` routes on the CJO host 308 to ecazier.ro.

---

## 1. Page table — cazierjudiciaronline.com (75 URLs)

Robots meta: none on any page, so the default `index, follow` applies.

| URL | St | Canon ok | Title (len) | Desc len | H1 | Words | In content / nav / footer | Out content | JSON-LD (main types) | Author | Price 1st screen | gratuit/oficial/ghișeu in T+D | GSC clicks / impr / pos (26 d) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 200 | yes | Cazier judiciar online prin avocat: hârtie, apostilă, diaspora (62) | 159 | Cazier judiciar onlineprin avocat, în 3–5 zile luc | 2969 | 61 / 74 / 74 | 61 | AggOffer, FAQ, Offer, Svc, Speakable, WebSite | - | yes | - | 142 / 31367 / 8.2 |
| /ghid-reabilitare-cazier | 200 | yes | Ghid Reabilitare Cazier - Cum sa Obtii Cazierul Curat / CazierJudiciarOnline.com / Cazier Judiciar Online (105) | 201 | Reabilitarea: Calea Ta SpreUn Cazier Curat | 2039 | 12 / 0 / 74 | 5 | Art, FAQ | Organization | no | - | 198 / 7534 / 4.4 |
| /cazier-auto-online | 200 | yes | Cazier Auto Online 2026 — Istoric Sanctiuni Rutiere / De la 198 RON / Cazier Judiciar Online (92) | 185 | Cazier AutoOnline | 1380 | 47 / 0 / 74 | 4 | FAQ, Offer, Svc | - | yes | - | 149 / 8090 / 8.3 |
| /cazier-fiscal-online | 200 | yes | Cazier Fiscal Online fără SPV — ANAF, 198 lei (45) | 165 | Cazier Fiscal Online ANAFLivrare în 1-3 Zile | 2509 | 50 / 0 / 74 | 9 | Art, FAQ, LegalSvc, Offer, Svc, Speakable | Organization | yes | - | 86 / 11016 / 7.9 |
| /contact | 200 | yes | Contact / Cazier Judiciar Online (32) | 172 | Contacteaza-ne | 107 | 6 / 74 / 74 | 0 |  | - | no | - | 0 / 52 / 11.9 |
| /termeni-si-conditii | 200 | yes | Termeni si Conditii / Cazier Judiciar Online (44) | 136 | Termeni si Conditii | 1561 | 1 / 0 / 74 | 2 |  | - | no | - | 0 / 10 / 7.6 |
| /politica-de-confidentialitate | 200 | yes | Politica de Confidentialitate / Cazier Judiciar Online (54) | 111 | Politica de Confidentialitate | 1367 | 1 / 0 / 74 | 0 |  | - | no | - | 0 / 12 / 22.8 |
| /politica-de-anulare | 200 | yes | Politica de Anulare si Rambursare / Cazier Judiciar Online (58) | 149 | Politica de Anulare si Rambursare | 466 | 0 / 0 / 74 | 2 |  | - | no | - | 2 / 11 / 4.5 |
| /cazier-judiciar-persoane-fizice-ghid | 200 | yes | Acte necesare pentru cazierul judiciar și de unde îl scoți (58) | 167 | Cazier JudiciarPersoane Fizice | 1172 | 5 / 0 / 0 | 3 | Art, FAQ | Organization | no | - | 76 / 13185 / 8.6 |
| /impact-cazier-angajare | 200 | yes | Cazier Judiciar si Angajare — Cum Te Afecteaza / Ghid 2026 / Cazier Judiciar Online (83) | 129 | Impactul Cazierului Judiciarasupra Angajarii | 1383 | 5 / 0 / 0 | 2 | Art, FAQ | Organization | no | - | 45 / 2036 / 4.0 |
| /tari-pentru-care-este-nevoie-de-apostila | 200 | yes | Apostila Haga — Lista Tarilor 2026 + Cum Se Obtine / Cazier Judiciar Online (75) | 137 | Apostila HagaTari si Cerinte | 1005 | 5 / 0 / 0 | 1 | Art, FAQ | Organization | no | - | 18 / 1456 / 7.4 |
| /cazier-judiciar-persoane-juridice-ghid | 200 | yes | Cazier Judiciar Persoane Juridice (SRL, SA) 2026 — Ghid Online / Cazier Judiciar Online (87) | 146 | Cazier JudiciarPersoane Juridice | 860 | 6 / 0 / 0 | 1 | Art, FAQ | Organization | no | - | 100 / 4524 / 5.6 |
| /corectarea-informatiilor-din-cazierul-judiciar | 200 | yes | Corectare Cazier Judiciar — Procedura in 5 Pasi / Ghid 2026 / Cazier Judiciar Online (84) | 130 | Corectarea Informatiilordin Cazierul Judiciar | 1016 | 3 / 0 / 0 | 1 | Art, FAQ | Organization | no | - | 21 / 636 / 6.3 |
| /conditii-de-calatorie-cu-minori | 200 | yes | Călătorie cu minori în străinătate: ce acte îți trebuie (55) | 157 | Calatorie cu Minoriin Strainatate | 1003 | 1 / 0 / 0 | 1 | Art, FAQ | Organization | no | - | 46 / 8133 / 7.5 |
| /blog | 200 | yes | Blog Cazier Judiciar — Ghiduri, Informații și Resurse Utile 2026 / Cazier Judiciar Online (89) | 156 | Ghiduri și Articole Despre Cazier Judiciar | 1076 | 2 / 74 / 74 | 29 | Coll, WebSite | - | no | - | 1 / 1227 / 12.6 |
| /taxa-cazier-judiciar | 200 | yes | Taxa cazier judiciar 2026: gratuit la ghișeu, 198 lei online (60) | 163 | Taxa Cazier Judiciar 2026Cat Costa si Cum Se Plate | 912 | 7 / 0 / 0 | 1 | Art, FAQ | Organization | no | gratuit,ghișeul | 99 / 7314 / 5.0 |
| /cazier-judiciar-gratuit | 200 | yes | Cazier judiciar gratuit: cum îl obții la ghișeu, pas cu pas (59) | 161 | Cazier Judiciar Gratuit 2026Cum se obține la ghișe | 2884 | 42 / 0 / 0 | 9 | Art, FAQ | Organization | no | gratuit,ghișeul | 87 / 12825 / 8.2 |
| /dupa-cat-timp-se-sterge-cazierul | 200 | yes | Dupa Cat Timp Se Sterge Cazierul Judiciar — Timeline 2026 / Cazier Judiciar Online (82) | 141 | Dupa Cat Timp Se StergeCazierul Judiciar | 907 | 6 / 0 / 0 | 2 | Art, FAQ | Organization | no | - | 154 / 3149 / 4.1 |
| /valabilitate-cazier-judiciar | 200 | yes | Cât este valabil cazierul judiciar? 6 luni de la eliberare (58) | 138 | Valabilitate Cazier JudiciarCat Timp Este Valabil? | 893 | 6 / 0 / 0 | 1 | Art, FAQ | Organization | no | - | 61 / 6582 / 4.4 |
| /valabilitate-cazier-fiscal | 200 | yes | Valabilitate Cazier Fiscal: 30 de Zile, pentru un Singur Scop (61) | 172 | Valabilitate Cazier Fiscal30 de zile, pentru un si | 1202 | 3 / 0 / 0 | 6 | Art, FAQ | Organization | no | - | 4 / 1351 / 8.3 |
| /certificat-integritate-comportamentala | 200 | yes | Certificat de integritate comportamentală online · 198 lei (58) | 165 | Certificat de IntegritateComportamentala | 1445 | 45 / 0 / 74 | 4 | Art, FAQ, Offer, Svc | Organization | yes | - | 6 / 5440 / 6.6 |
| /comparatie-servicii | 200 | yes | Cazier Judiciar vs Fiscal vs Auto — Comparatie Completa 2026 / Cazier Judiciar Online (85) | 136 | Cazier Judiciar vs Fiscal vs AutoComparatie Comple | 1030 | 2 / 0 / 0 | 3 | Art, FAQ | Organization | no | - | 1 / 475 / 8.1 |
| /cazier-judiciar-diaspora | 200 | yes | Cazier Judiciar din Străinătate — UK, DE, IT, ES, FR / Livrare / Cazier Judiciar Online (87) | 151 | Cazier Judiciardin Străinătate | 2692 | 9 / 0 / 74 | 5 | FAQ, Offer, Svc | - | no | - | 16 / 1131 / 7.8 |
| /cazier-judiciar-pentru-viza | 200 | yes | Cazier Judiciar pentru Viză 2026 — Cerințe SUA, Canada, UK / Cazier Judiciar Online (83) | 148 | Cazier Judiciar pentru VizăGhid complet 2026 | 2743 | 4 / 0 / 0 | 8 | Art, FAQ | Organization | no | - | 3 / 159 / 6.5 |
| /cazier-judiciar-pentru-angajare | 200 | yes | Cazier Judiciar pentru Angajare — Drepturi Codul Muncii 2026 / Cazier Judiciar Online (85) | 162 | Cazier Judiciar pentru AngajareCodul Muncii 2026 | 3175 | 3 / 0 / 0 | 10 | Art, FAQ | Organization | no | - | 24 / 1511 / 4.8 |
| /eliberare-cazier-judiciar-online | 200 | yes | Eliberare cazier judiciar: la ghișeu sau online prin avocat (59) | 187 | Eliberare Cazier Judiciar OnlineCum și cât durează | 3072 | 8 / 0 / 0 | 16 | Art, FAQ | Organization | no | - | 9 / 3264 / 10.3 |
| /acte-necesare-cazier-judiciar | 200 | yes | Acte Necesare pentru Cazier Judiciar 2026 — Lista Completă / Cazier Judiciar Online (83) | 144 | Acte Necesare pentru Cazier JudiciarLista Completă | 2265 | 40 / 0 / 0 | 7 | Art, FAQ | Organization | no | - | 12 / 3449 / 8.8 |
| /cerere-cazier-judiciar-model | 200 | yes | Model Cerere Cazier Judiciar 2026 — Anexa 7 PF + PJ Download / Cazier Judiciar Online (85) | 169 | Model Cerere Cazier JudiciarAnexa 7 — Download 202 | 1994 | 40 / 0 / 0 | 10 | Art, FAQ | Organization | no | gratuit | 376 / 3736 / 5.6 |
| /status-comanda | 200 | yes | Verifica Status Comanda / Cazier Judiciar Online (48) | 151 | Verifica Status Comanda | 18 | 2 / 74 / 0 | 0 |  | - | no | - | 3 / 95 / 7.5 |
| /cazier-judiciar-urgent | 200 | yes | Cazier Judiciar Urgent — Cum Obții în 24 de Ore (Ghid 2026) / Cazier Judiciar Online (84) | 159 | Cazier Judiciar UrgentCum îl obții în 24 de ore | 1938 | 40 / 0 / 0 | 8 | Art, FAQ | Organization | no | - | 3 / 348 / 8.7 |
| /cazier-fiscal-vs-cazier-judiciar | 200 | yes | Cazier Fiscal vs Cazier Judiciar — Diferențe & Când ai nevoie (61) | 155 | Cazier fiscal vs cazier judiciarCare e diferența ș | 2145 | 8 / 0 / 0 | 5 | Art, FAQ | Organization | no | - | 6 / 526 / 14.1 |
| /cazier-fiscal-persoana-juridica | 200 | yes | Cazier Fiscal pentru Firmă: al Firmei sau al Administratorului? (63) | 191 | Cazier fiscal pentru firmăCe se cere de fapt și cu | 1438 | 4 / 0 / 0 | 6 | Art, FAQ | Organization | no | - | 7 / 880 / 16.3 |
| /verificare-cazier-fiscal-online | 200 | yes | Verificare Cazier Fiscal Online ANAF: 3 Metode / Ghid 2026 (58) | 163 | Verificare cazier fiscal onlineTrei metode, costur | 958 | 1 / 0 / 0 | 3 | Art, FAQ | Organization | yes | gratuit | 42 / 1287 / 10.4 |
| /cazier-fiscal-pentru-cetatean-strain | 200 | yes | Cazier Fiscal pentru Cetățeni Străini cu NIF — Ghid 2026 (56) | 172 | Cazier fiscal pentru cetățeni străiniNIF, rezidenț | 1553 | 1 / 0 / 0 | 3 | Art, FAQ | Organization | yes | - | 8 / 1139 / 7.9 |
| /cazier-fiscal-pentru-credit-bancar | 200 | yes | Cazier Fiscal pentru Credit Bancar — Ghid Aplicație 2026 (56) | 175 | Cazier fiscal pentru credit bancarCe trebuie să șt | 1123 | 2 / 0 / 0 | 3 | Art, FAQ | Organization | yes | - | 1 / 82 / 8.9 |
| /cazier-fiscal-pentru-licitatii-publice | 200 | yes | Cazier Fiscal pentru Licitații Publice (SEAP/SICAP) — Ghid 2026 (63) | 167 | Cazier fiscal pentru licitații publiceCerințele SE | 1534 | 3 / 0 / 0 | 3 | Art, FAQ | Organization | yes | - | 0 / 19 / 5.4 |
| /cazier-judiciar-online/bucuresti | 200 | yes | Cazier judiciar online București, fără drum la poliție (54) | 174 | Cazier judiciar online Bucureștifără drum la poliț | 723 | 8 / 0 / 0 | 13 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 92 / 15791 / 8.8 |
| /cazier-judiciar-online/cluj | 200 | yes | Cazier judiciar online Cluj-Napoca, fără drum la poliție (56) | 176 | Cazier judiciar online Cluj-Napocafără drum la pol | 817 | 9 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 123 / 8096 / 6.7 |
| /cazier-judiciar-online/timisoara | 200 | yes | Cazier judiciar Timișoara — program ghișee, adrese, online (58) | 173 | Cazier judiciar Timișoara | 947 | 6 / 0 / 0 | 7 | AdminArea, FAQ, GovOffice, Offer, Svc | - | yes | - | 182 / 6347 / 5.5 |
| /cazier-judiciar-online/iasi | 200 | yes | Cazier judiciar Iași — program ghișee, adrese, online (53) | 187 | Cazier judiciar Iași | 922 | 6 / 0 / 0 | 8 | AdminArea, FAQ, GovOffice, Offer, Svc | - | yes | - | 155 / 8891 / 5.7 |
| /cazier-judiciar-online/brasov | 200 | yes | Cazier judiciar Brașov — program ghișee, adrese, online (55) | 180 | Cazier judiciar Brașov | 856 | 10 / 0 / 0 | 10 | AdminArea, FAQ, GovOffice, Offer, Svc | - | yes | ghișeul | 124 / 5586 / 6.1 |
| /cazier-judiciar-online/sibiu | 200 | yes | Cazier judiciar online Sibiu, fără drum la poliție (50) | 170 | Cazier judiciar online Sibiufără drum la poliție | 705 | 6 / 0 / 0 | 13 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 79 / 4809 / 5.3 |
| /cazier-judiciar-online/constanta | 200 | yes | Cazier judiciar Constanța — program ghișee, adrese, online (58) | 202 | Cazier judiciar Constanța | 1152 | 6 / 0 / 0 | 8 | AdminArea, FAQ, GovOffice, Offer, Svc | - | yes | ghișeul | 187 / 6043 / 5.0 |
| /cazier-judiciar-online/craiova | 200 | yes | Cazier judiciar online Craiova, fără drum la poliție (52) | 172 | Cazier judiciar online Craiovafără drum la poliție | 757 | 4 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 166 / 4453 / 4.4 |
| /cazier-judiciar-online/oradea | 200 | yes | Cazier judiciar online Oradea, fără drum la poliție (51) | 171 | Cazier judiciar online Oradeafără drum la poliție | 712 | 6 / 0 / 0 | 13 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 152 / 2493 / 4.0 |
| /cazier-judiciar-online/arad | 200 | yes | Cazier judiciar online Arad, fără drum la poliție (49) | 169 | Cazier judiciar online Aradfără drum la poliție | 764 | 6 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 108 / 2721 / 5.1 |
| /cazier-judiciar-online/galati | 200 | yes | Cazier judiciar online Galați, fără drum la poliție (51) | 171 | Cazier judiciar online Galațifără drum la poliție | 688 | 5 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 186 / 3808 / 4.2 |
| /cazier-judiciar-online/satu-mare | 200 | yes | Cazier judiciar online Satu Mare, fără drum la poliție (54) | 174 | Cazier judiciar online Satu Marefără drum la poliț | 716 | 4 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 48 / 1530 / 4.2 |
| /cazier-judiciar-online/ploiesti | 200 | yes | Cazier judiciar online Ploiești, fără drum la poliție (53) | 173 | Cazier judiciar online Ploieștifără drum la poliți | 741 | 6 / 0 / 0 | 13 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 165 / 5127 / 4.7 |
| /cazier-judiciar-online/pitesti | 200 | yes | Cazier judiciar online Pitești, fără drum la poliție (52) | 172 | Cazier judiciar online Piteștifără drum la poliție | 766 | 7 / 0 / 0 | 13 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 19 / 1886 / 5.6 |
| /cazier-judiciar-online/bacau | 200 | yes | Cazier judiciar online Bacău, fără drum la poliție (50) | 170 | Cazier judiciar online Bacăufără drum la poliție | 736 | 6 / 0 / 0 | 13 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 121 / 2524 / 4.1 |
| /cazier-judiciar-online/buzau | 200 | yes | Cazier judiciar online Buzău, fără drum la poliție (50) | 170 | Cazier judiciar online Buzăufără drum la poliție | 677 | 6 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 75 / 1809 / 4.3 |
| /cazier-judiciar-online/baia-mare | 200 | yes | Cazier judiciar online Baia Mare, fără drum la poliție (54) | 174 | Cazier judiciar online Baia Marefără drum la poliț | 708 | 6 / 0 / 0 | 13 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 56 / 2327 / 4.7 |
| /cazier-judiciar-online/botosani | 200 | yes | Cazier judiciar online Botoșani, fără drum la poliție (53) | 173 | Cazier judiciar online Botoșanifără drum la poliți | 688 | 4 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 45 / 967 / 4.7 |
| /cazier-judiciar-online/suceava | 200 | yes | Cazier judiciar online Suceava, fără drum la poliție (52) | 172 | Cazier judiciar online Suceavafără drum la poliție | 678 | 7 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 84 / 2610 / 5.0 |
| /cazier-judiciar-online/targu-mures | 200 | yes | Cazier judiciar online Târgu Mureș, fără drum la poliție (56) | 176 | Cazier judiciar online Târgu Mureșfără drum la pol | 719 | 7 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 127 / 3121 / 4.8 |
| /cazier-judiciar-online/piatra-neamt | 200 | yes | Cazier judiciar online Piatra Neamț, fără drum la poliție (57) | 177 | Cazier judiciar online Piatra Neamțfără drum la po | 717 | 7 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 56 / 1551 / 4.8 |
| /cazier-judiciar-online/ramnicu-valcea | 200 | yes | Cazier judiciar online Râmnicu Vâlcea, fără drum la poliție (59) | 179 | Cazier judiciar online Râmnicu Vâlceafără drum la  | 700 | 6 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 41 / 1096 / 4.3 |
| /cazier-judiciar-online/deva | 200 | yes | Cazier judiciar online Deva, fără drum la poliție (49) | 169 | Cazier judiciar online Devafără drum la poliție | 768 | 6 / 0 / 0 | 13 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 17 / 1245 / 6.3 |
| /cazier-judiciar-online/alba-iulia | 200 | yes | Cazier judiciar online Alba Iulia, fără drum la poliție (55) | 175 | Cazier judiciar online Alba Iuliafără drum la poli | 833 | 8 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 34 / 1253 / 5.2 |
| /cazier-judiciar-online/bistrita | 200 | yes | Cazier judiciar online Bistrița, fără drum la poliție (53) | 173 | Cazier judiciar online Bistrițafără drum la poliți | 671 | 5 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 33 / 971 / 4.0 |
| /cazier-judiciar-online/focsani | 200 | yes | Cazier judiciar online Focșani, fără drum la poliție (52) | 172 | Cazier judiciar online Focșanifără drum la poliție | 666 | 7 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 153 / 1746 / 3.3 |
| /cazier-judiciar-online/tulcea | 200 | yes | Cazier judiciar online Tulcea, fără drum la poliție (51) | 171 | Cazier judiciar online Tulceafără drum la poliție | 700 | 4 / 0 / 0 | 11 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 28 / 1034 / 4.6 |
| /cazier-judiciar-online/braila | 200 | yes | Cazier judiciar online Brăila, fără drum la poliție (51) | 171 | Cazier judiciar online Brăilafără drum la poliție | 671 | 7 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 52 / 2430 / 4.2 |
| /cazier-judiciar-online/targoviste | 200 | yes | Cazier judiciar online Târgoviște, fără drum la poliție (55) | 175 | Cazier judiciar online Târgoviștefără drum la poli | 716 | 6 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 69 / 2005 / 4.2 |
| /cazier-judiciar-online/resita | 200 | yes | Cazier judiciar online Reșița, fără drum la poliție (51) | 171 | Cazier judiciar online Reșițafără drum la poliție | 671 | 4 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 3 / 562 / 6.2 |
| /cazier-judiciar-online/drobeta-turnu-severin | 200 | yes | Cazier judiciar online Drobeta-Turnu Severin, fără drum la poliție (66) | 186 | Cazier judiciar online Drobeta-Turnu Severinfără d | 682 | 4 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 46 / 707 / 4.1 |
| /cazier-judiciar-online/miercurea-ciuc | 200 | yes | Cazier judiciar online Miercurea Ciuc, fără drum la poliție (59) | 179 | Cazier judiciar online Miercurea Ciucfără drum la  | 712 | 7 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 23 / 845 / 4.9 |
| /cazier-judiciar-online/sfantu-gheorghe | 200 | yes | Cazier judiciar online Sfântu Gheorghe, fără drum la poliție (60) | 180 | Cazier judiciar online Sfântu Gheorghefără drum la | 714 | 6 / 0 / 0 | 13 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 43 / 1090 / 4.8 |
| /cazier-judiciar-online/zalau | 200 | yes | Cazier judiciar online Zalău, fără drum la poliție (50) | 170 | Cazier judiciar online Zalăufără drum la poliție | 695 | 5 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 60 / 892 / 3.4 |
| /cazier-judiciar-online/calarasi | 200 | yes | Cazier judiciar online Călărași, fără drum la poliție (53) | 173 | Cazier judiciar online Călărașifără drum la poliți | 691 | 5 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 22 / 1388 / 5.6 |
| /cazier-judiciar-online/giurgiu | 200 | yes | Cazier judiciar online Giurgiu, fără drum la poliție (52) | 172 | Cazier judiciar online Giurgiufără drum la poliție | 634 | 5 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 21 / 1057 / 4.7 |
| /cazier-judiciar-online/alexandria | 200 | yes | Cazier judiciar online Alexandria, fără drum la poliție (55) | 175 | Cazier judiciar online Alexandriafără drum la poli | 694 | 5 / 0 / 0 | 12 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 0 / 26 / 5.9 |
| /cazier-judiciar-online/slobozia | 200 | yes | Cazier judiciar online Slobozia, fără drum la poliție (53) | 173 | Cazier judiciar online Sloboziafără drum la poliți | 662 | 7 / 0 / 0 | 14 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 17 / 760 / 5.3 |
| /cazier-judiciar-online/vaslui | 200 | yes | Cazier judiciar online Vaslui, fără drum la poliție (51) | 171 | Cazier judiciar online Vasluifără drum la poliție | 671 | 7 / 0 / 0 | 13 | AdminArea, FAQ, Offer, Svc | - | yes | ghișeul | 68 / 2560 / 5.2 |

---

## 2. Internal link graph

- **Nav (SSR): 4 targets only** (`/`, `/blog`, `/contact`, `/status-comanda`). The Servicii and Orașe dropdowns are client-only (issue 2).
- **Footer: 10 targets.** These are `/`, `/blog`, `/cazier-auto-online`, `/cazier-fiscal-online`, `/certificat-integritate-comportamentala`, `/cazier-judiciar-diaspora`, `/ghid-reabilitare-cazier`, `/contact` and the 3 legal pages. **`/eliberare-cazier-judiciar-online` and `/cerere-cazier-judiciar-model` (the top click page) are not in the footer.**
- **City pages** get content links from: home (links all 39), 4–7 neighbouring city pages ("Județele vecine") and, for iasi, `/eliberare…`. That's 4–10 content inlinks each. Nothing in the nav or footer points to them.
- **Orphans:** none.
- **Weak (≤ 3 content inlinks), excluding legal pages:**

| URL | Content inlinks | GSC clicks / impressions / pos |
|---|---|---|
| /conditii-de-calatorie-cu-minori | 1 | 46 / 8,133 / 7.5 |
| /verificare-cazier-fiscal-online | 1 | 42 / 1,287 / 10.4 |
| /cazier-fiscal-pentru-cetatean-strain | 1 | 8 / 1,139 / 7.9 |
| /cazier-fiscal-pentru-credit-bancar | 2 | 1 / 82 / 8.9 |
| /comparatie-servicii | 2 | 1 / 475 / 8.1 |
| /blog | 2 (+ nav + footer) | 1 / 1,227 / 12.6 |
| /corectarea-informatiilor-din-cazierul-judiciar | 3 | 21 / 636 / 6.3 |
| /valabilitate-cazier-fiscal | 3 | 4 / 1,351 / 8.3 |
| /cazier-judiciar-pentru-angajare | 3 | 24 / 1,511 / 4.8 |
| /cazier-fiscal-pentru-licitatii-publice | 3 | 0 / 19 / 5.4 |

Near-weak (4–6): the 5 ghid pages (persoane fizice: 13,185 impressions at pos 8.6 with only 5 inlinks), `/cazier-judiciar-pentru-viza` (4), `/cazier-fiscal-persoana-juridica` (4), and most city pages.

---

## 3. SERP snippets of the money pages

SERP context (from the caller): Hub MAI is marked **GRATUIT**, and competitor ads sit above. Our snippet has to answer "why pay" within the first ~55 characters of the title and ~120 of the description.

| Page | Title (len) | Description (len) | Main queries (26 d, GSC) | What makes a searcher skip us |
|---|---|---|---|---|
| `/` | "Cazier judiciar online prin avocat: hârtie, apostilă, diaspora" (62) | "Nu ai cont pe hub.mai.gov.ro sau îți trebuie cazierul pe hârtie, cu apostilă ori traducere? Avocatul îl obține pentru tine: 198 lei, 3–5 zile; urgent 1–2 zile." (159) | cazier judiciar online 11,640 impr / pos 7.0 / CTR 0.43%; …gratuit 3,176 / 7.4 / 0.88%; cazier online 2,727 / 7.4 / 0.18% | (a) The title's second half (paper, apostille, diaspora) fits maybe 10% of searchers. The main reason people pay (no queue, no account, no MAI login, fast) is missing. (b) Nothing next to GRATUIT explains the trade-off: the free route needs an account or ROeID plus a trip or wait, and we do it for 198 lei. The description mentions it but backwards, as a question. (c) "prin avocat" is a real differentiator but sounds expensive without "198 lei" in the title. (d) Position 7, below ads and Hub MAI, means 2–3 screens down on mobile; only a sharp title wins there. |
| `/eliberare-cazier-judiciar-online` | "Eliberare cazier judiciar: la ghișeu sau online prin avocat" (59) | "Eliberare cazier judiciar online prin Cabinet de Avocat Tarța — 198 RON, livrare în 3-5 zile (urgent: 278 RON, 1-2 zile). Document IGPR cu semnătură electronică. Fără deplasare la ghișeu." (187) | cazier judiciar online 499 / 10.9 / **0 clicks**; cazier online 401 / 10.8 | It's an article (breadcrumb "Blog") that Google tests for the money query, then rejects. The description is a sales pitch with a lawyer's name a searcher doesn't recognise, and it's cut at ~155 chars. Decide its role: informational ("procedura, termene, program") with a link to `/`. Don't let it chase "cazier judiciar online". |
| `/cazier-auto-online` | "Cazier Auto Online 2026 — Istoric Sanctiuni Rutiere \| De la 198 RON \| Cazier Judiciar Online" (92) | "Obtine cazierul auto online — istoric sanctiuni rutiere, puncte de penalizare. Necesar pentru atestat profesional (taxi, transport). Livrare 3-5 zile sau 1-2 zile urgent. De la 198 RON." (185) | cazier auto online 1,448 / 5.5 / 3.3% (OK); page total 8,090 impressions at pos 8.3 / 1.84% | Truncated at ~60 chars, so the price and brand are cut. No diacritics ("Sanctiuni", "Obtine"), which reads as low effort next to Hub MAI. Uber and Bolt drivers, the biggest segment on ecazier, aren't named. The brand "Cazier Judiciar Online" on a cazier auto snippet is confusing. |
| `/certificat-integritate-comportamentala` | "Certificat de integritate comportamentală online · 198 lei" (58) | "Pentru adopție, școală sau asistent maternal. Avocatul obține certificatul (adeverința) de integritate pentru tine: 198 lei, 3–5 zile lucrătoare; urgent în 1–2 zile." (165) | certificat de integritate comportamentala 3,000 / 5.5 / **0.13%**; "…online" 132 / 13.2; "de unde se scoate…" 91 / 4.8 / 0 | The query is mostly "what is it / where do I get it". The title answers with a price, which a free-seeking searcher skips at once, especially next to a GRATUIT result. A better shape: "Certificat de integritate comportamentală: ce e, de unde îl iei (gratuit sau online)", with the price in the description. H1 "Certificat de IntegritateComportamentala" has no diacritics and glued words. |
| `/cazier-fiscal-online` | "Cazier Fiscal Online fără SPV — ANAF, 198 lei" (45) | "Cazier fiscal de la ANAF pentru persoane fizice, fără cont SPV și fără drum la ghișeu. Arată faptele fiscale sancționate, nu datoriile. 198 lei, 1–3 zile lucrătoare." (165) | cazier fiscal online 1,506 / 6.4 / 1.0%; page 11,016 / 7.9 / 0.78% | "ANAF, 198 lei" side by side can read as "ANAF charges 198 lei". 45 chars leaves room for the benefit (for example a firm, credit or licitație). The description is good ("nu datoriile" is useful) but runs 5 chars over. Firms (PJ) are a large share of fiscal demand, and the title says nothing to them. |
| `/cerere-cazier-judiciar-model` | "Model Cerere Cazier Judiciar 2026 — Anexa 7 PF + PJ Download \| Cazier Judiciar Online" (85) | "Descarcă gratuit cererea-tip … Anexa 7 pentru persoane fizice și Anexa 10 pentru persoane juridice. PDF + ghid…" (169) | cerere cazier judiciar 230 / 4.0 / 8.7%; …persoana juridica 94 / 2.3 / 18%; page 376 clicks / 10.06% | **Best snippet on the site; don't break it.** Small fixes only: drop the suffix brand (it gets truncated anyway) and "Download" (English). Fix the annex wording: the title says "Anexa 7", the first H2 says "Anexa 22, formularul «Anexa 7»", and the source comment says Anexa 7 replaces Anexa 22. Pick one formulation. "gratuit" here is true (the form is free). |
| `/cazier-judiciar-gratuit` (gets "ghiseul.ro cazier") | "Cazier judiciar gratuit: cum îl obții la ghișeu, pas cu pas" (59) | "Cazierul judiciar se eliberează gratuit la ghișeul poliției, cu buletinul. … Dacă nu poți merge, îl obține avocatul: 198 lei." (161) | ghiseul.ro cazier 4,507 / 5.9 / 0.5%; ghiseul ro cazier judiciar gratuit 677 / 6.7 | The query is a portal name. Neither title nor description says whether ghiseul.ro issues the cazier, which is the question. A line like "Se poate scoate cazierul pe ghiseul.ro? Nu: …" in the description would answer it. Much of this volume is navigational (people want ghiseul.ro itself), so the CTR ceiling is low. Don't expect 5%. |

City snippets (for reference; they work): "Cazier judiciar Iași — program ghișee, adrese, online" plus a description with the actual addresses and the verification date. Queries are local and informational ("cazier galati", "program cazier galati": Galați pos 2.4–2.7, 186 clicks). Leave these alone.

---

## 4. City pages — similarity

39 city pages in the sitemap (`siteConfig.seo.cities`). 4 are hand-written guides (iasi, brasov, timisoara, constanta, from `city-guides.ts`). 35 use the `city-data.ts` template, with real IPJ addresses, hours, phone numbers and other offices in the county per city.

Method: visible `<main>` text, lowercased, diacritics stripped, 5-word shingles, Jaccard over all 741 pairs. Masked: every city and county name (39 cities, their counties, and county names used in "Județele vecine") replaced with one token.

| Group | Pairs | Mean normal | Mean masked | Mean jump | Max normal | Max masked |
|---|---|---|---|---|---|---|
| template × template | 595 | 0.404 | 0.488 | +0.084 | 0.490 | 0.590 |
| guide × template | 140 | 0.061 | 0.065 | +0.004 | 0.074 | 0.078 |
| guide × guide | 6 | 0.140 | 0.162 | +0.022 | 0.159 | 0.181 |

Against the rule (`.claude/rules/content-and-seo.md` §1):
- **Masked > 0.65: no page** (max 0.590, Brăila–Galați).
- **Jump > +0.12: no page** (max per-page mean +0.086).
- **Normal > 0.45 ("de reparat"): 19 pairs touching 15 template pages.** The top pairs are Brăila–Galați 0.490, Focșani–Galați 0.470, Drobeta–Vaslui 0.466, Focșani–Zalău 0.462, Brăila–Slobozia 0.459, Alexandria–Focșani 0.457, Focșani–Giurgiu 0.457 and Giurgiu–Târgoviște 0.457. The smaller counties with only one IPJ counter and short "other offices" lists are the ones closest to each other.
- Shared core: 404 shingles appear on ≥ 90% of template pages, against ~725 shingles per page. Most of that is the embedded order form (Pasul 1 din 6, Email, Telefon…), the price and options table, and the "Ce variantă ți se potrivește" block.

Per page (mean against the other 38):

| City | Hand-written guide | Tokens | Mean J normal | Mean J masked | Jump | Max J masked | Closest sibling |
|---|---|---|---|---|---|---|---|
| focsani |  | 700 | 0.392 | 0.476 | +0.084 | 0.570 | galati |
| drobeta-turnu-severin |  | 741 | 0.384 | 0.470 | +0.086 | 0.572 | vaslui |
| braila |  | 708 | 0.386 | 0.468 | +0.082 | 0.590 | galati |
| giurgiu |  | 707 | 0.387 | 0.467 | +0.080 | 0.558 | focsani |
| vaslui |  | 736 | 0.384 | 0.465 | +0.081 | 0.572 | drobeta-turnu-severin |
| slobozia |  | 704 | 0.383 | 0.463 | +0.080 | 0.567 | braila |
| galati |  | 735 | 0.383 | 0.461 | +0.079 | 0.590 | braila |
| alexandria |  | 750 | 0.382 | 0.460 | +0.078 | 0.555 | focsani |
| suceava |  | 742 | 0.380 | 0.460 | +0.080 | 0.554 | focsani |
| botosani |  | 740 | 0.378 | 0.457 | +0.078 | 0.552 | alexandria |
| zalau |  | 736 | 0.381 | 0.457 | +0.076 | 0.554 | focsani |
| baia-mare |  | 755 | 0.375 | 0.455 | +0.080 | 0.551 | suceava |
| resita |  | 735 | 0.373 | 0.454 | +0.080 | 0.550 | braila |
| buzau |  | 783 | 0.374 | 0.451 | +0.077 | 0.549 | focsani |
| piatra-neamt |  | 782 | 0.368 | 0.451 | +0.082 | 0.558 | drobeta-turnu-severin |
| ramnicu-valcea |  | 748 | 0.371 | 0.450 | +0.080 | 0.541 | focsani |
| miercurea-ciuc |  | 767 | 0.369 | 0.448 | +0.080 | 0.545 | drobeta-turnu-severin |
| tulcea |  | 749 | 0.373 | 0.446 | +0.073 | 0.543 | focsani |
| bistrita |  | 750 | 0.369 | 0.446 | +0.077 | 0.529 | braila |
| sfantu-gheorghe |  | 775 | 0.367 | 0.446 | +0.079 | 0.552 | drobeta-turnu-severin |
| targu-mures |  | 789 | 0.366 | 0.444 | +0.079 | 0.523 | focsani |
| satu-mare |  | 774 | 0.365 | 0.443 | +0.078 | 0.544 | braila |
| calarasi |  | 758 | 0.367 | 0.442 | +0.074 | 0.532 | giurgiu |
| sibiu |  | 751 | 0.365 | 0.439 | +0.074 | 0.514 | slobozia |
| oradea |  | 769 | 0.360 | 0.437 | +0.077 | 0.514 | botosani |
| targoviste |  | 813 | 0.365 | 0.437 | +0.072 | 0.544 | giurgiu |
| bacau |  | 801 | 0.361 | 0.436 | +0.075 | 0.519 | focsani |
| deva |  | 875 | 0.358 | 0.432 | +0.074 | 0.517 | focsani |
| ploiesti |  | 834 | 0.353 | 0.425 | +0.072 | 0.509 | vaslui |
| pitesti |  | 866 | 0.351 | 0.420 | +0.070 | 0.506 | suceava |
| craiova |  | 809 | 0.350 | 0.419 | +0.069 | 0.491 | giurgiu |
| cluj |  | 873 | 0.336 | 0.410 | +0.073 | 0.499 | galati |
| arad |  | 875 | 0.338 | 0.404 | +0.066 | 0.473 | focsani |
| alba-iulia |  | 962 | 0.324 | 0.392 | +0.067 | 0.468 | drobeta-turnu-severin |
| bucuresti |  | 811 | 0.351 | 0.382 | +0.032 | 0.450 | resita |
| brasov | yes | 943 | 0.072 | 0.078 | +0.006 | 0.181 | timisoara |
| iasi | yes | 1076 | 0.069 | 0.074 | +0.005 | 0.176 | timisoara |
| timisoara | yes | 1028 | 0.067 | 0.072 | +0.005 | 0.181 | brasov |
| constanta | yes | 1533 | 0.062 | 0.067 | +0.005 | 0.151 | timisoara |

Read with care: **galati (186 clicks/26 d, pos 2.4 on "program cazier galati"), constanta (187), timisoara (182) and iasi (155) are top earners.** Galați is a *template* page, so the template itself is not the problem: it ranks because it carries the real counter data. Nothing here justifies removal. The cheapest way to pull pairs below 0.45 is to lighten what all pages share: show the form behind a button, or put the shared price block in one compact component. That beats writing more per-city text. The rule's own corollary (cazier is issued per county IPJ) is met: one page per county seat, no sub-city pages. The real exposure is issue 1, an unlimited number of fake city URLs.

---

## 5. Technical checks

| Check | Result |
|---|---|
| robots.txt (CJO) | OK. AI UAs allowed except `/api /admin /completare /multumim /ppc`. `*` disallows `/api /admin /ppc` plus WP paths. The sitemap is declared. `/multumim` is not disallowed for `*` and has no noindex (issue 14). |
| robots.txt (ecazier) | OK. Served via the rewrite to `/ecazier-robots.txt`. |
| hreflang | None on either site. Correct, since both are Romanian-only. |
| https / www → apex | `http://` → `https://` apex in 1 hop. `https://www.` → apex in 1 hop. `http://www.` → `https://www.` → apex in **2 hops** (issue 15). ecazier is the same, 1 hop each. |
| Trailing slash | `/x/` → 308 `/x` on both hosts. Sitemaps, canonicals and internal links all use no slash. |
| Case | `/CAZIER-AUTO-ONLINE` → 404 (fine). |
| Unknown paths | `/nu-exista-pagina` → 404. **But `/cazier-judiciar-online/<anything>` → 200** (issue 1). |
| Internal redirect chains | None: 79 internal targets fetched, all 200. |
| Internal 404s | None. |
| Legacy URLs | `/totul-despre-cazier-fiscal-online` → 308 to `/cazier-fiscal-online` (OK). `/cazier-judiciar-online` → 301 to `/` (OK). `/cazier-judiciar-oradea-program-ghiseu-si-varianta-online` → **404** while GSC still shows impressions (issue 11). |
| PDFs | `/cerere-cazier-judiciar-model-{PF,PJ,Minor}.pdf` → 200 `application/pdf`. One shows in GSC (2 impressions). Fine. |
| Canonical | Matches the URL on 75/75 CJO and 15/15 ecazier pages. |
| Response time (curl, cold) | 0.32–0.73 s, except home at 1.8 s on the first hit. Home HTML is 348 KB (RSC payload plus the form). |

## 6. Core Web Vitals

The keyless PSI API returned **429 (daily quota exhausted)**. I ran it again through the SEO skill's configured key (`pagespeed_check.py`, mobile) and pulled CrUX History for the origin.

| URL | Lab perf | Lab LCP | TBT | CLS | Field LCP p75 | Field INP p75 | Field CLS p75 |
|---|---|---|---|---|---|---|---|
| `/` | 86 | **4.1 s** | 20 ms | 0 | 2.16 s (good) | 113 ms (origin) | 0.09 |
| `/cerere-cazier-judiciar-model` (top clicks) | 100 | 1.1 s | 10 ms | 0 | 2.34 s* | 113 ms* | 0 |
| `/cazier-judiciar-online/constanta` (top city) | 98 | 0.9 s | 0 ms | 0 | 2.60 s (needs improvement) | 138 ms | 0 |

\*Probably origin-level fallback, since the values are identical to the origin.

CrUX origin, phone, latest 28 days to 07.11: LCP p75 2,317 ms (79% good), INP 116 ms, CLS 0.00, FCP 2,104 ms (67% good, "needs improvement"), TTFB 447 ms. **The trend is worse:** LCP p75 went from 1,911 ms (Apr–May) to 2,317 ms, and FCP from 1,894 to 2,104 ms, with the last 3 weeks the worst. Still "good" overall, but heading toward the 2.5 s line. On home, PSI suggests about 300 ms of savings from unused JS. Total weight is 778 KiB, and the lab LCP of 4.1 s is probably the hero/form area. Not a ranking blocker today. Worth watching after the Black Friday banner comes down.

---

## 7. ecazier.ro (15 URLs) — brief

| URL | St | Canon ok | Title (len) | Desc len | H1 | Words | In content / nav / footer | Out content | JSON-LD (main types) | Author | Price 1st screen | gratuit/oficial/ghișeu in T+D | GSC clicks / impr / pos (26 d) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 200 | yes | Cazier Auto, Fiscal și Judiciar Online prin Avocat / eCazier.ro (63) | 180 | Cazier Auto, Fiscal și Judiciar Online, fără drumu | 1218 | 5 / 14 / 0 | 12 | AggOffer, FAQ, Offer, Svc, WebSite | - | no | - | 16 / 443 / 19.7 |
| /cazier-fiscal | 200 | yes | Cazier Fiscal Online ANAF în 1-3 Zile / eCazier (47) | 156 | Cazier Fiscal Online | 1185 | 5 / 14 / 14 | 2 | FAQ, Offer, Svc | - | no | - | 7 / 330 / 25.2 |
| /cazier-auto | 200 | yes | Cazier Auto Online: 198 lei, Gata în 3-5 Zile / eCazier (55) | 135 | Cazier Auto Online | 1331 | 10 / 14 / 14 | 10 | AggOffer, FAQ, Offer, Svc | - | yes | - | 4 / 397 / 13.8 |
| /ghiduri | 200 | yes | Ghiduri și Articole — Cazier Judiciar, Fiscal și Auto / eCazier (63) | 148 | Tot ce trebuie să știi despre caziere | 342 | 9 / 14 / 14 | 11 | Art, Coll | - | no | - | 0 / 33 / 13.5 |
| /fisa-evidenta-conducator-auto | 200 | yes | Fișa Conducătorului Auto: Ce Conține, Cum o Obții / eCazier (59) | 147 | Fișa de evidență a conducătorului auto: ce este și | 1487 | 10 / 0 / 0 | 10 | Art, FAQ | Organization | no | - | 2 / 68 / 5.7 |
| /cazier-auto-uber-bolt | 200 | yes | Cazier Auto pentru Uber și Bolt: Ce Se Cere / eCazier (53) | 142 | Cazier auto pentru Uber și Bolt: ghidul șoferului  | 1670 | 8 / 0 / 0 | 10 | Art, FAQ | Organization | no | - | 8 / 276 / 6.2 |
| /puncte-penalizare-cazier-auto | 200 | yes | Puncte de Penalizare: Cum Afli Câte Ai / eCazier (48) | 140 | Punctele de penalizare: cum le verifici oficial | 1670 | 8 / 0 / 0 | 7 | Art, FAQ | Organization | no | - | 1 / 45 / 6.6 |
| /acte-necesare-cazier-auto | 200 | yes | Acte Necesare Cazier Auto: Ghișeu vs Online / eCazier (53) | 138 | Actele necesare pentru cazierul auto | 1685 | 8 / 0 / 0 | 6 | Art, FAQ | Organization | no | - | 0 / 172 / 12.5 |
| /valabilitate-cazier-auto | 200 | yes | Cât e Valabil Cazierul Auto? Răspunsul pe Scurt / eCazier (57) | 142 | Cât este valabil cazierul auto? | 1614 | 8 / 0 / 0 | 8 | Art, FAQ | Organization | no | - | 0 / 187 / 7.8 |
| /cazier-auto-strainatate-preschimbare-permis | 200 | yes | Cazier Auto din Diaspora, Preschimbare Permis / eCazier (55) | 145 | Cazier auto pentru preschimbarea permisului în str | 1740 | 8 / 0 / 0 | 8 | Art, FAQ | Organization | no | - | 3 / 82 / 6.2 |
| /cazier-auto-vs-cazier-judiciar | 200 | yes | Cazier Auto vs Cazier Judiciar: Diferențe / eCazier (51) | 142 | Cazier auto vs. cazier judiciar: care e diferența? | 1683 | 9 / 0 / 0 | 10 | Art, FAQ | Organization | no | - | 1 / 266 / 9.2 |
| /ghid-alegere-tip-cazier | 200 | yes | Ce Tip de Cazier Îmi Trebuie? Judiciar, Fiscal sau Auto / eCazier (65) | 146 | Ce tip de cazier îmi trebuie: judiciar, fiscal sau | 1681 | 9 / 0 / 0 | 10 | Art, FAQ | Organization | no | - | 7 / 307 / 11.3 |
| /termeni-si-conditii | 200 | yes | Termeni și Condiții / eCazier (29) | 155 | Termeni și Condiții | 1678 | 1 / 0 / 14 | 2 |  | - | no | - | 0 / 1 / 10 |
| /politica-de-anulare | 200 | yes | Politica de Anulare și Rambursare / eCazier (43) | 149 | Politica de Anulare și Rambursare | 455 | 0 / 0 / 14 | 2 |  | - | no | - | 0 / 1 / 3 |
| /politica-de-confidentialitate | 200 | yes | Politica de Confidențialitate / eCazier (39) | 178 | Politica de Confidențialitate | 1400 | 1 / 0 / 14 | 0 |  | - | no | - | 0 / 1 / 4 |

GSC (26 d): 49 clicks, 2,352 impressions, average position 12.5. Best page: `/cazier-auto-uber-bolt` at pos 6.2. Money pages: `/cazier-auto` pos 13.8 and `/cazier-fiscal` pos 25.2.

Top 5 issues:
1. **No authority, not on-page.** The money pages rank 12–25 ("cazier auto online" 12.4, "cazier fiscal online" 17.8) even though the on-page work is clean (canonicals, `index, follow`, real nav and footer links, 1,200–1,700-word guides with 8–10 inlinks). The lever is links and brand. The only internal-network links today are CJO footer → `/cazier-auto` and the documentero footer.
2. **The home page promises "Judiciar" with no judiciar page.** Title and H1 say "Cazier Auto, Fiscal și Judiciar Online", but the sitemap has no cazier judiciar landing (only `/comanda`). That risks a mismatch for "cazier judiciar online" searchers and also competes with CJO. Either drop "Judiciar" from home or say clearly that ecazier is auto + fiscal. (`src/app/ecazier/page.tsx`)
3. **No price in the first screen on home and `/cazier-fiscal`.** The price only appears inside the form ("Total de Plătit 198 RON"). `/cazier-auto` shows it in the title ("198 lei, Gata în 3-5 Zile"), which is the better pattern. (`src/app/ecazier/page.tsx`, `src/app/ecazier/cazier-fiscal/page.tsx`)
4. **Authors are `Organization "eCazier.ro"`** on all 8 guides, and the H1 "Punctele de penalizare: cum le verifici **oficial**" uses "oficial", which the ads and copy rule asks us to avoid. (`src/app/ecazier/puncte-penalizare-cazier-auto/page.tsx`, guide JSON-LD)
5. **Legal pages are near-duplicates of CJO** (politica-de-anulare Jaccard 0.89, confidentialitate 0.73, termeni 0.47). Harmless by itself, but these are 3 of only 15 sitemap URLs. Consider `noindex, follow` on the ecazier legal pages, or dropping them from the sitemap. Cross-domain similarity of the content pages is low (0.003–0.17), so there is no duplicate-content problem between the brands.

Fine on ecazier: `/comanda` and `/status-comanda` are `noindex, follow`, with no soft-404 (`/nu-exista` → 404), no hreflang, 1-hop redirects and no internal redirects or 404s.

---

## Files that control what (CJO repo)

- Titles and descriptions: per-route `src/app/<slug>/page.tsx` `metadata`; title template in `src/app/layout.tsx` (l. 34–35).
- City pages: `src/app/cazier-judiciar-online/[city]/page.tsx` (+ `CityGuideView.tsx`); data in `src/config/city-data.ts`, `src/config/city-guides.ts`, `src/config/city-neighbours.ts`; list in `src/config/site.config.ts` (`seo.cities`).
- Nav and footer: `src/components/shared/Header.tsx`, `src/components/shared/Footer.tsx`.
- Dates: `src/config/page-dates.ts`. Hero H1: `src/components/sections/HeroSection.tsx`.
- Sitemap and robots: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/ecazier-sitemap.xml/route.ts`, `src/app/ecazier-robots.txt`. Host rewrite: `src/proxy.ts`. Redirects: `next.config.ts`.
- ecazier pages: `src/app/ecazier/**`.
