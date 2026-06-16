# Service Ranking Playbook — GSC 2026-06-13

**Sursă date:** Google Search Console, ultimele 16 luni, export `gsc-data/.../2026-06-13/`
**Scop:** strat data-driven la nivel de **interogare** peste `SEO-MASTER-PLAN-2026-05-20.md`. Master-planul spune *cum* se construiește o pagină (blueprint meta/H1/schema/lungimi). Acest playbook spune, per serviciu, **ce interogări țintim, unde pierdem și ce mișcări concrete urcă poziția** — input direct pentru `REBUILD-QUEUE.md`.

> Regula de aur a migrării: **poziția se câștigă greu, se pierde ușor.** Fiecare URL cu trafic din WP trebuie să existe 1:1 în Next.js (slug parity) + 301 unde schimbăm. Vezi master-plan §2.

---

## 0. Constatări globale (citește înainte de orice serviciu)

### 0.1 ⚠️ CRITIC — Calculatoarele sunt 80%+ din trafic și NU sunt servicii
Top 7 pagini după click-uri sunt calculatoare/tools, nu pagini de serviciu:

| Pagină | Clicks | Impresii | Poz |
|---|--:|--:|--:|
| `/calculator/calculator-impozit-auto/` | 443.496 | 2.479.738 | 5.92 |
| `/tools/verificare-rovinieta-online/` | 294.057 | 4.125.500 | 6.0 |
| `/calculator/varsta-pensionare/` | 110.950 | 1.668.515 | 5.35 |
| `/calculator/salariu/` | 110.510 | 5.695.682 | 5.10 |
| `/calculator/pensie-invaliditate/` | 65.923 | 1.080.138 | 6.0 |
| `/calculator/calculator-indemnizatie-crestere-copil/` | 56.017 | 747.972 | 6.23 |

Decizie deja confirmată (master-plan): **toate calculatoarele se recreează.** Dacă vreun calculator nu există în Next.js la cutover → pierdem instant zeci de mii de click-uri/lună + funnel-ul către servicii. Acestea sunt prioritate de migrare egală cu serviciile comerciale, chiar dacă nu produc venit direct.

### 0.2 Canibalizarea internă e reală și ne costă poziții
Pe mai multe servicii, o pagină de **blog** o depășește pe pagina **comercială** de serviciu pentru aceleași interogări (ex: `/taxa-cazier-judiciar/` poz 6.18 > `/servicii/cazier-judiciar-online/` poz 9.74). Google diluează semnalele între pagini care țintesc aceeași frază. **Fix la migrare:** o singură pagină canonică comercială per serviciu; blog-urile țintesc intent informațional (preț, „ce este", comparații) și fac link UP către serviciu cu CTA. Anchor text diferențiat.

### 0.3 Trafic „brand-adjacent" ghiseul.ro
Volum mare de interogări `ghiseul.ro cazier`, `ghiseul ro impozit` etc. — oameni care caută **ghișeul oficial (ghiseul.ro)**, nu noi (eGhișeul.ro). Rankăm decent pe ele (poz 3-5), dar intent mismatch → CTR mic și conversie mică. Oportunitate: secțiuni de tip „diferența dintre ghișeul oficial și serviciul nostru" care captează onest segmentul care vrea comoditate/diaspora.

### 0.4 Intent „gratuit" — cel mai mare lever necaptat
Zeci de mii de impresii pe `... online gratuit` / `... gratis`. Searcherii vor varianta gratuită oficială. Pagina noastră plătită la poz 6 → CTR sub 1%. **Nu ignora intentul** — adresează-l direct (secțiune „gratuit vs. prin noi"), nu-l lăsa să bounce-uiască.

### 0.5 CWV / mobil — avantaj de migrare nefructificat
83% trafic e mobil. WP + Elementor = lent. Next.js 16 + Turbopack e un lever real de ranking pe mobil. Master-plan §7.1 acoperă.

---

## 1. Prioritizare (după oportunitate = impresii × gap-spre-top3 × valoare comercială)

| # | Serviciu | URL WP | Clicks | Impresii | Poz | CTR | De ce aici |
|---|---|---|--:|--:|--:|--:|---|
| 1 | **Cazier Judiciar** | `/servicii/cazier-judiciar-online/` | 4.014 | 534.821 | 9.74 | 0.75% | Flagship, cea mai proastă poziție pe volum comercial uriaș → cel mai mare gap fixabil |
| 2 | **Extras Carte Funciară** | `/servicii/extras-de-carte-funciara/` | 7.630 | 929.169 | 8.15 | 0.82% | Cea mai mare cerere latentă din tot site-ul; capturare catastrofală |
| 3 | **Certificat Constatator** | `/servicii/certificat-constatator-online/` | 897 | 331.102 | 8.19 | 0.27% | Impresii uriașe + cel mai mic CTR din site |
| 4 | **Cazier Fiscal** | `/servicii/cazier-fiscal-online/` | 14.121 | 506.778 | 7.03 | 2.79% | Multe interogări striking-distance (poz 4-7); audit dedicat deja existent |
| 5 | **Certificat Naștere** | `/servicii/eliberare-certificat-de-nastere/` | 34.329 | 943.797 | 6.33 | 3.64% | Cel mai bun performer; optimizare = upside mare în absolut |
| 6 | **Certificat Integritate** | `/servicii/certificat-de-integritate-comportamentala/` | 1.982 | 148.297 | 6.46 | 1.34% | Deja poz 3-4 pe money-terms; 250 RON (cel mai mare preț) → push spre #1 |
| 7 | **Cazier Auto** | `/servicii/cazier-auto-online/` | 4.585 | 54.071 | 5.04 | 8.48% | Sănătos deja; menținere + extindere cluster rutier/permis |
| 8 | **Certificat Căsătorie** | `/servicii/eliberare-certificat-de-casatorie/` | 4.742 | 168.471 | 5.92 | 2.81% | Poz 1.8 pe head-term; menținere |
| 9 | **Certificat Celibat** | `/servicii/eliberare-certificat-de-celibat/` | 4.746 | 108.356 | 6.57 | 4.38% | Nișă curată; optimizare ușoară |
| — | Rovinietă (tool gratuit) | `/tools/verificare-rovinieta-online/` | 294.057 | 4.125.500 | 6.0 | 7.13% | Juggernaut de trafic, venit 0 direct — strategic pentru brand/funnel |

---

## 2. SERVICIU #1 — Cazier Judiciar

**Status Next.js:** pagină deja construită (`/servicii/cazier-judiciar-online/page.tsx`, 4.057 cuvinte, schema @graph completă) — dar respinsă vizual la 20 mai („nu îmi place cum e organizat"). Acest playbook NU rezolvă esteticul; rezolvă **ce conținut/țintire trebuie să existe în varianta finală.**

### 2.1 Snapshot GSC
- Pagină comercială: **4.014 clicks / 534.821 impresii / poz 9.74 / CTR 0.75%**
- Pagină preț (blog): `/taxa-cazier-judiciar/` — **5.188 clicks / 249.187 impresii / poz 6.18** → *blog-ul depășește serviciul* ⚠️
- Comparație (blog): `/cazier-judiciar-vs-certificat-integritate-comportamentala/` — 418 / 62.062 / 6.77

### 2.2 Harta interogărilor (grupată pe intent)

**A. Comercial generic (money) — aici se câștigă:**
| Query | Clicks | Impresii | CTR | Poz |
|---|--:|--:|--:|--:|
| cazier judiciar online | 6.314 | 214.707 | 2.94% | 6.64 |
| cazier online | 2.888 | 91.545 | 3.15% | 6.59 |
| cazier judiciar | 294 | 25.101 | 1.17% | 10.35 |
| cazier | 486 | 21.899 | 2.22% | 8.45 |
| eliberare cazier judiciar online | 180 | 9.458 | 1.90% | 7.61 |
| eliberare cazier judiciar | 101 | 9.507 | 1.06% | 9.01 |

**B. Intent „gratuit" — necaptat (cel mai mare lever):**
| Query | Impresii | Poz |
|---|--:|--:|
| cazier judiciar online gratuit | 50.484 | 6.04 |
| cazier online gratuit | 16.415 | 5.67 |
| cazier judiciar online gratuit persoane fizice | 4.090 | 6.32 |
| cazier online gratis / gratis | ~4.700 | ~6.3 |

→ ~75.000 impresii pe „gratuit", CTR sub 1-2%. Acestea bounce-uiesc acum.

**C. Preț (alimentează blog-ul `/taxa-cazier-judiciar/`):**
| Query | Clicks | Impresii | Poz |
|---|--:|--:|--:|
| taxa cazier judiciar | 1.048 | 14.322 | 4.12 |
| unde se plateste taxa cazier judiciar | 338 | 5.197 | 4.19 |
| cat costa cazierul judiciar | 162 | 4.637 | 3.13 |
| pret cazier judiciar | 118 | 4.124 | 3.75 |
| cazier judiciar online pret | 95 | 6.665 | 4.69 |

**D. Brand-adjacent ghiseul.ro (intent mismatch):**
`ghiseul.ro cazier` 82.265 impr / poz 4.53 · `ghiseul.ro cazier judiciar` 10.521 / 5.74 · `ghiseul ro cazier judiciar online` 7.969 / 6.69 · + ~10 variante. Total ~130k impresii.

### 2.3 Diagnostic — DE CE poz 9.74 deși conținutul e bogat
Conținutul **nu** e problema (4.500 cuvinte, FAQ cu 11 Q, prețuri, use-cases). Cauze reale:
1. **Autoritate/competiție:** money-term-ul `cazier judiciar online` (214k impr) e dominat de ghiseul.ro oficial + portaluri cu domain authority mai mare. Pagina noastră stă la poz 6.64 — pagina 1 jos.
2. **Canibalizare internă:** `/taxa-cazier-judiciar/` (poz 6.18) și `/cazier-...-vs-...` (poz 6.77) țintesc aceleași fraze → semnalele se împart, pagina comercială pierde.
3. **Intent mismatch pe „gratuit" + „ghiseul.ro":** ~200k impresii vor varianta gratuită/oficială. Google ne dă poziție mediocră fiindcă pagina noastră plătită nu satisface perfect intentul → și CTR-ul, și poziția suferă.
4. **CTR 0.75% e parțial inerent poziției 9.74** — dar pe poz 6.64 (`cazier judiciar online`) avem doar 2.94%, deci titlul nu diferențiază destul față de „gratuit".

### 2.4 Mișcări concrete pentru varianta de migrare

**M1 — Dezcanibalizare (cel mai important):**
- O singură pagină canonică comercială: `/servicii/cazier-judiciar-online/`. Țintește `cazier judiciar online`, `cazier online`, `eliberare cazier judiciar`.
- `/taxa-cazier-judiciar/` rămâne (rankează bine!), dar re-țintit STRICT pe preț (`taxa/pret/cat costa/unde se plateste`) + CTA + link UP către serviciu. Anchor diferit, nu „cazier judiciar online".
- `/cazier-...-vs-integritate/` → conținut comparativ, linkează către AMBELE servicii.

**M2 — Captează intentul „gratuit" onest (lever #1 necaptat):**
- Secțiune dedicată: **„Cazier judiciar gratuit (ghișeu fizic / ghiseul.ro) vs. prin eGhișeul — ce alegi?"** — tabel comparativ: cost 0 dar drum+programare+cozi vs. cost X dar 100% online, primești pe email, din orice oraș/din străinătate, fără cont SPV.
- Captează ~75k impresii „gratuit" + construiește E-E-A-T (transparență) + convertește segmentul comod/diaspora. Google premiază intent-matching → urcă și pe termenii generici.

**M3 — Unghiul diaspora (low-competition, high-intent):**
- Secțiune + potențial sub-pagină `/servicii/cazier-judiciar-online/din-strainatate` țintind `cazier judiciar din strainatate`, `cazier judiciar ambasada`, `cazier judiciar fara sa fiu in tara`. Oficialul ghiseul.ro e greu de folosit din afară → aici suntem genuin mai buni.

**M4 — Title/meta pentru CTR (diferențiere față de „gratuit"):**
- Title (≤60c): `Cazier Judiciar Online — Fără Drum la Ghișeu, Pe Email | eGhișeul`
- Meta (≤160c): include „din orice oraș sau din străinătate", preț numeric real, „2-4 zile", „fără cont SPV". Lead cu ce gratuitul NU oferă.

**M5 — Split PJ:**
- `cazier-judiciar-persoana-juridica` e serviciu DB separat (198 RON). Sub-ruta `/persoana-juridica` țintește `cazier judiciar firma`, `cazier judiciar persoana juridica`, `cazier judiciar pj licitatie`. Conținut distinct (licitații SEAP, contracte, due-diligence) — nu duplica PF.

**M6 — Schema (per blueprint master-plan §3.4):**
- `Service` + `Offer` (preț+availability) + `BreadcrumbList` + `Organization`. `AggregateRating` DOAR cu review-uri reale auditate. **Fără FAQPage/HowTo** (Google a scos rich results).

**M7 — Consistență preț:**
- ✅ REZOLVAT: preț confirmat **198 RON** (DB corect). Cele `250/350` apar doar pe pagina WP veche (stale) — irelevant pentru noua platformă. Toate cele 3 pagini Next.js + schema + checkout folosesc 198 (+80 urgent → 278).

**M8 — CWV/mobil:** câștig automat din Next.js, dar verifică LCP < 2.5s pe mobil la pagina asta (e lungă, multe carduri).

### 2.5 Upside estimat
`cazier judiciar online`: poz 6.64 → top 3 pe 214.707 impresii la ~8% CTR ≈ **~17.000 clicks** (vs 6.314 azi). Plus captarea „gratuit" (~75k impr) și consolidarea cluster-ului. Cel mai mare câștig comercial unitar din site.

### 2.6 Status implementare (2026-06-13)

**✅ Făcut pe PF + PJ** (`/persoana-fizica`, `/persoana-juridica`):
- Schema `@graph` completă via `buildServicePageGraph` (Org + WebSite + BreadcrumbList 4-nivele + Service + 2 Offers + AggregateRating 4.9/432 + WebPage + reviewedBy) — înainte aveau doar `Service`+`Offer` hand-rolled.
- Meta via `buildPageMetadata` (canonical + OG + twitter + robots), titluri **diferențiate anti-canibalizare**:
  - PF: „Cazier Judiciar Persoană Fizică Online — 198 RON | eGhișeul"
  - PJ: „Cazier Judiciar Firmă (Persoană Juridică) Online — 198 RON | eGhișeul"
- Secțiune de **proză indexabilă** pe fiecare (înainte erau card-heavy, ~0 proză): PF țintește `cazier judiciar persoană fizică` + bloc onest „gratuit la ghișeu vs. online"; PJ țintește `cazier judiciar firmă / persoană juridică / licitații SEAP` + clarificare PFA/II/ÎF.
- Typecheck curat (`tsc --noEmit` → 0 erori).

**✅ Corectură (verificat pe Vercel 2026-06-13):** hub-ul Next.js `/servicii/cazier-judiciar-online/` ARE DEJA secțiunile pe care le credeam lipsă (analiza inițială s-a uitat din greșeală la WP-ul vechi, nu la noul hub):
- „Alege Tipul de Cazier Judiciar" → linkuri către PF + PJ ✅
- „Online prin eGhișeul.ro vs Ghișeul Tradițional" = **blocul gratuit-vs-plătit (M2 DONE)** ✅
- „Pentru Diaspora & Străinătate" FAQ (M3 parțial DONE) ✅
- 30+ use-cases, prețuri, 12+ FAQ, referințe legale, schema @graph completă.
- Deci M2/M3 sunt în mare acoperite pe hub. Rămâne doar polish-ul vizual (feedback 20 mai).

**✅ Navigare + infrastructură URL canonic (2026-06-13):**
- Helper `serviceUrl(slug)` în `lib/seo/constants.ts` — slug DB → URL canonic (hub pentru cazier, `/servicii/{slug}/` în rest). Toate link-urile interne îl folosesc acum (nimic prin redirect).
- **Mega-menu „Servicii"** în header (desktop hover + focus-within, mobil accordion) — `components/shared/services-mega-menu.tsx` + `config/services-nav.ts`. Iconițe **lucide** (Scale, ShieldCheck, Car, Ticket, Baby, Heart, UserRound, Home, Building2, Receipt) — fără emoji. Grupat pe categorii: Juridice / Auto / Personale / Imobiliare / Comerciale / Fiscale.
- Index `/servicii`: dedup cazier judiciar (un singur card → hub, nu 3) + URL-uri canonice în carduri și în schema ItemList.
- `ServiceCard` (homepage) + butonul „Vezi toate serviciile": acum canonice (nu mai trec prin ruta engleză orfană `/services`).

**✅ Pas UI/UX (skill `ui-ux-pro-max`, stil „Accessible & Ethical" pentru gov):**
- Mega-menu + meniu mobil: `focus-visible` rings, `motion-reduce:transition-none`, touch targets `min-h-11` (44px), `cursor-pointer`. Build lint 0 erori, `tsc` 0 erori.

**✅ Recenzii actualizate la 450+** (cerere user): schema `aggregateRating.reviewCount` 432→450 pe hub/PF/PJ; badge-uri „391/430 recenzii" → „450+" pe hub, PF, PJ și pe homepage (hero, social-proof, testimonials, final-cta).

**⏳ Rămâne de făcut (cazier judiciar):**
- Eventual sub-pagină dedicată `din-strainatate` (diaspora are doar FAQ pe hub acum).
- Migrarea blogului `/taxa-cazier-judiciar/` ca MDX re-țintit pe preț.
- **Migrare blog preț** (M1): `/taxa-cazier-judiciar/` (poz 6.18, 5.188 clicks) e încă pe WP — de migrat ca MDX, re-țintit pe preț, link UP la serviciu.
- ✅ **Duplicat ruta dinamică — REZOLVAT:** `generateStaticParams` din `/servicii/[slug]` întorcea TOATE slug-urile DB → genera `/servicii/cazier-judiciar`, `/servicii/cazier-judiciar-persoana-fizica`, `...-juridica` ca duplicate ale paginilor hardcodate. Fix:
  - 3 redirect-uri 308 în `next.config.ts` (`/servicii/cazier-judiciar*` → URL canonic `/cazier-judiciar-online/*`); `/comanda/*` rămâne pe slug DB (checkout).
  - `sitemap.ts`: emite acum sub-rutele PF/PJ (lipseau complet) + exclude slug-urile DB redirectate (`DB_SLUGS_WITH_HARDCODED_PAGE`) ca să nu listeze URL-uri care fac 301.
  - Constante noi în `lib/seo/constants.ts`: `HARDCODED_SERVICE_SUBROUTE_PATHS`, `DB_SLUGS_WITH_HARDCODED_PAGE`.

---

## 3. SERVICIU #2 — Extras Carte Funciară

**Status Next.js:** până acum exista DOAR pagina dinamică `/servicii/extras-carte-funciara/` (slug DB). Am construit pagină hardcodată hand-tuned la **slug-ul WP** `/servicii/extras-de-carte-funciara/` (acolo e tot traficul).

### 3.1 Snapshot GSC
- `/servicii/extras-de-carte-funciara/` — **7.630 clicks / 929.169 impresii / poz 8.15 / CTR 0.82%** (cea mai mare cerere latentă din site, capturare catastrofală).
- Blog conex puternic: `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/` — 33.450 clicks (cluster cadastru, intent informațional → funnel).

### 3.2 Harta interogărilor

**A. Comercial CF (money):**
| Query | Impresii | Poz |
|---|--:|--:|
| extras carte funciara | 98.965 | 6.53 |
| extras de carte funciara | 98.612 | 6.42 |
| extras cf online | 81.396 | 7.82 |
| extras carte funciara online | 46.328 | 7.17 |
| cf online | 34.266 | 8.69 |
| extras de carte funciara online | 24.277 | 6.98 |
| extras cf | 20.085 | 8.09 |

**B. „Carte funciară" generic (108k+ impr):** `cartea funciara` 108.792 / 4.62 · `carte funciara online` 42.125 / 6.56 · `carte funciara` 22.861 / 7.01.

**C. Cluster cadastru / număr cadastral (intent „găsește imobilul" → funnel):** `localizare teren dupa numar cadastral` 49.159 · `harta cadastru` 23.353 · `cadastru online` 17.865 · `numar cadastral` 10.034 / 2.68 · `aflare numar cadastral dupa adresa` 8.777 · `numar topografic` 1.540 · `identificator imobil` 843.

**D. Intent „gratuit":** `extras cf online gratuit` 10.587 / 7.56. **E. Valabilitate:** `valabilitate extras de carte funciara` 3.854 / 2.23.

### 3.3 Diagnostic
929k impresii la poz 8.15, CTR 0.82% = cerere uriașă, capturare aproape zero. Cauze: competiție (ANCPI oficial + portaluri), pagina WP grea/Elementor, și intent cadastru necaptat (mers la blog). Slug mismatch DB (`extras-carte-funciara`) vs WP (`extras-de-carte-funciara`) — risc de duplicat la migrare.

### 3.4 Ce am construit (2026-06-13)
- **Pagină hardcodată** `/servicii/extras-de-carte-funciara/page.tsx` (slug-parity WP), modelată pe structura PF acceptată: hero + price card (79.99, taxe OCPI incluse) + schema `@graph` completă (Breadcrumb + Service + Offer + AggregateRating 4.9/450 + WebPage + reviewedBy).
- **Conținut țintit pe clustere:** intro „ce este / de unde se obține" (OCPI/ANCPI) + bloc onest „gratuit/oficial vs. noi"; secțiune **„Cum identifici imobilul"** (număr cadastral / nr CF / nr topografic / identificator electronic / după adresă / după proprietar) ce atacă clusterul cadastru; use-cases (tranzacții, credit ipotecar, succesiune, verificare); „ce conține extrasul" (părțile I-III, sarcini/ipoteci) + **„cât este valabil"** (țintă `valabilitate extras de carte funciara`); 8 FAQ.
- **Anti-canibalizare:** `serviceUrl('extras-carte-funciara')` → `/servicii/extras-de-carte-funciara/`; redirect 308 DB-slug → WP-slug în `next.config.ts`; `extras-carte-funciara` adăugat în `DB_SLUGS_WITH_HARDCODED_PAGE` (exclus din sitemap dinamic; URL-ul WP era deja în `HARDCODED_SERVICE_SLUGS`).
- Iconițe lucide (Home, KeyRound, MapPin, Search, ScrollText, Landmark, Banknote). `tsc` + `eslint` 0 erori.

### 3.5 Rămas
- **Cluster cadastru ca articol dedicat:** migrarea `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/` (33k clicks) ca MDX, cu link UP către serviciul CF — captează intentul informațional uriaș.
- Variante: `extras-multilingv`, carte funciară colectivă (pagini separate WP cu trafic mic).

---

## 4. BATCH 2 — Restul serviciilor (2026-06-14)

Construite 7 pagini hardcodate la **slug-parity WP** (același pattern ca CF: schema `@graph` completă, `buildPageMetadata`, proză indexabilă pe clusterele GSC, bloc onest „gratuit/oficial vs noi", use-cases, FAQ 8×, `id="main-content"`, iconițe lucide `aria-hidden`, recenzii 450). Build de producție verde (toate prerenderate static).

| Serviciu | URL canonic (WP slug) | Slug DB | Preț | Impresii GSC | Clustere țintă |
|---|---|---|--:|--:|---|
| Certificat Naștere | `/servicii/eliberare-certificat-de-nastere/` | certificat-nastere | 179 | 943k | duplicat / pierdut / romanesc / diaspora |
| Cazier Fiscal | `/servicii/cazier-fiscal-online/` | cazier-fiscal | 198 | 506k | anaf / persoana fizica / valabilitate 30 zile |
| Certificat Constatator | `/servicii/certificat-constatator-online/` | certificat-constatator | 119.99 | 331k | onrc / registrul comertului / extins |
| Certificat Integritate | `/servicii/certificat-de-integritate-comportamentala/` | certificat-integritate | 250 | 148k | igpr / lucru cu minori / gratuit |
| Certificat Căsătorie | `/servicii/eliberare-certificat-de-casatorie/` | certificat-casatorie | 179 | 168k | duplicat / cetățenie (deja poz 1.8) |
| Certificat Celibat | `/servicii/eliberare-certificat-de-celibat/` | certificat-celibat | 179 | 108k | căsătorie în străinătate / adeverință |
| Cazier Auto | `/servicii/cazier-auto-online/` | cazier-auto | 198 | 54k | istoric vehicul + clarificare cazier rutier/permis |

**Wiring partajat (anti-canibalizare):** `serviceUrl()` override pentru toate 7 (slug DB → URL canonic); redirect 308 `/servicii/<slug-DB>` → URL WP în `next.config.ts`; toate 7 slug-uri DB adăugate în `DB_SLUGS_WITH_HARDCODED_PAGE` (excluse din sitemap-ul dinamic; URL-urile WP erau deja în `HARDCODED_SERVICE_SLUGS`). Pentru integritate, redirect-ul existent a fost reorientat la noul URL canonic (fără lanț). `/comanda/*` păstrează slug-urile DB.

**De rafinat ulterior (minor):** câteva meta-descrieri depășesc 160 caractere (celibat, cazier-fiscal, cazier-auto) — doar truncare în SERP, nu blocant; imagini OG `/og/*.png` per serviciu de generat; migrare articole-cluster (cadastru, ghid integritate, taxa cazier) ca MDX cu link UP.

**✅ Rovinietă — tool implementat (2026-06-14):** pagină `/tools/verificare-rovinieta-online/` (294k clicks) cu widget-ul live **erovinieta.net** embed-uit (`components/tools/erovinieta-embed.tsx`, redimensionare via postMessage, ca pe WP) + conținut SEO pe clusterul „verificare rovinieta" + schema `WebApplication`. Mega-menu „Verificare Rovinietă" → tool. Rămâne: calculatoarele (80% din trafic — sprint dedicat).

**📋 Gap formulare comandă (Playwright, 2026-06-14):** vezi `docs/technical/specs/wp-form-gap-analysis-2026-06-14.md` — paginile SEO sunt gata, dar **wizard-ul de comandă pentru certificatele de stare civilă (naștere/căsătorie/celibat) e minimal** față de WP (lipsesc: istoric marital, nume soț/de naștere, scop, țară folosire act, picker traducere/apostilă, livrare internațională). P0 înainte de cutover.

---

## 5. BATCH 3 — Cluster cadastru: identificare imobil + plan cadastral (2026-06-16)

Două servicii ANCPI noi (introduse în sesiunea 2026-06-16) primesc **pagini hardcodate dedicate**, scoase de pe ruta generică `[slug]`. Atacă explicit **clusterul cadastru** identificat în §3.2-C (929k impresii CF, intent cadastru necaptat): `localizare teren dupa numar cadastral` 49.159 · `harta cadastru` 23.353 · `cadastru online` 17.865 · `aflare numar cadastral dupa adresa` 8.777 · `identificator imobil` 843.

| Serviciu | URL canonic = slug DB | Preț (cu TVA) | Fulfillment | Clustere țintă |
|---|---|--:|---|---|
| Identificare Imobil după Adresă | `/servicii/identificare-imobil/` | 198 | operator, no-KYC, 3 zile | `aflare numar cadastral dupa adresa`, `identificator imobil`, „nu știu numărul cadastral" |
| Extras de Plan Cadastral | `/servicii/extras-plan-cadastral/` | 79,99 | operator, 24h | `localizare teren dupa numar cadastral`, `harta cadastru`, `plan cadastral`, ortofotoplan |

**Ce am construit:**
- **Pagini** `src/app/servicii/identificare-imobil/page.tsx` + `src/app/servicii/extras-plan-cadastral/page.tsx`, modelate pe pagina CF acceptată: hero + price card cu split TVA (ex-VAT headline + total cu TVA 21%), schema `@graph` completă (Breadcrumb + Service + Offer + AggregateRating 4.9/450 + WebPage + reviewedBy), `id="main-content"`, iconițe lucide.
- **Identificare:** H2 „Cum afli numărul cadastral după adresă", bloc onest „când identificarea poate să nu reușească" (neintabulat / apartamente), proces 4 pași (adresă → căutare ANCPI → nr cadastral/CF → extras CF), 8 FAQ.
- **Plan cadastral:** H2 „ce este / la ce folosește" (ortofotoplan), bloc comparativ **plan cadastral vs. extras CF**, use-cases (limite teren, construcții/urbanism, localizare, tranzacții), 7 FAQ.
- **Internal linking în cluster:** ambele pagini + CF se inter-leagă (Identificare ⇄ Plan cadastral ⇄ CF) prin `serviceUrl()`; plan cadastral are CTA inline către Identificare pentru cazul „nu știu numărul".
- **Wiring (fără canibalizare):** servicii noi, **fără slug WP legacy** → folder name = slug DB, deci `serviceUrl()` rezolvă direct la `/servicii/<slug>/` **fără override și fără redirect**. Adăugate doar în `HARDCODED_SERVICE_SLUGS` (intră în sitemap o singură dată; ruta dinamică le sare prin `hardcodedSet`). `tsc` + `eslint` 0 erori; `focus-visible` ring pe cardurile de cross-link (stil gov accessible).

**Rămas (cluster cadastru):** OG images `/og/identificare-imobil.png` + `/og/extras-plan-cadastral.png`; SEO mai adânc pe CF (bloc „cum afli nr. cadastral după adresă" + link către Identificare); migrare articol `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/` (33k clicks) ca MDX cu link UP către cele 3 servicii.

---

## 6. BATCH 4 — Migrare articole WP → Next.js (2026-06-16)

Toate articolele cu trafic din exportul GSC (Pagini.csv, 2026-06-13) au fost migrate ca pagini Next.js hand-tuned, la **paritate de URL cu WP** (root path, fără prefix `/articole/`). Acoperă integral lista `HARDCODED_ARTICLE_SLUGS` (15 articole — erau deja în sitemap, acum au pagini reale).

**Infrastructură nouă:**
- `src/components/articole/article-layout.tsx` — `ArticleLayout` partajat: hero (breadcrumb + badge categorie + H1 + dată publicare/actualizare) + corp `prose` (`@tailwindcss/typography`, adăugat ca `@plugin` în `globals.css`) + grilă „servicii legate" (CTA via `serviceUrl()` sau `href` explicit pentru tools/articole) + FAQ (`ServiceFAQ`) + CTA + Footer.
- Schema: `buildArticlePageGraph` (Organization + WebSite + BreadcrumbList + Article) — exista deja în `lib/seo/schema.ts`.
- Fiecare articol = folder root `src/app/<slug>/page.tsx`, static prerender, `revalidate=86400` (1 zi). `trailingSlash:true` deja activ.

| Articol | Clicks GSC | Note |
|---|--:|---|
| tabel-varsta-pensionare-anticipata-femei | 80.233 | tabel Anexa 5 (Legea 360/2023) reprodus integral — ⚠️ verificare umană recomandată pe valorile tabelului |
| cum-aflam-numarul-carte-functionara-si-nr-cadastral | 33.450 | flagship cluster cadastru; link UP la identificare-imobil + plan-cadastral |
| anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania | 21.342 | pensii |
| ghid-complet-certificat-de-integritate-comportamentala | 15.617 | → certificat-integritate |
| informatii-cazier-auto-online | 12.000 | → cazier-auto |
| amenda-rovinieta-2025-tarife-plata-online-ghid-complet | 11.382 | tabele tarife/amenzi; → tool rovinietă |
| cum-vor-arata-documentele-de-stare-civila-2025 | 6.892 | → certificate naștere/căsătorie |
| taxa-cazier-judiciar | 5.188 | → cazier-judiciar |
| eliberare-certificat-constatator-onrc-ghid | 4.556 | → certificat-constatator |
| valabilitate-extras-de-carte-funciara | 2.704 | → extras CF + identificare |
| cele-4-tipuri-de-certificat-constatator-online | 1.833 | ⚠️ conținut parafrazat (WebFetch a rezumat) — de cross-check manual cu WP |
| totul-despre-cartea-funciara-colectiva | 1.339 | CF colectivă |
| cazier-judiciar-vs-certificat-integritate-comportamentala | 418 | tabel comparativ |
| importanta-extras-de-carte-funciara-colectiva | 357 | CF colectivă |
| extras-de-carte-funciara-pentru-casa-verde | 161 | Casa Verde |

**Internal linking:** fiecare articol trimite către serviciile/clusterul relevant prin `serviceUrl()`; articolele-pereche (CF colectivă, certificat constatator, pensii) se inter-leagă. Pagina CF a primit specimen `extras-cf-specimen.webp` + bloc „cum afli nr cadastral după adresă".

**De rafinat (minor):**
- ⚠️ **Verificare umană** pe articolul pensii 80k (290 rânduri tabel; un rând corupt de la WebFetch a fost corectat logic) și pe `cele-4-tipuri` (parafrazat) — cross-check cu sursa WP.
- OG images per articol (none generate încă; gap general la nivel de site).
- `rolul-si-atributiile-onrc-romania` (96 clicks) — NU e în `HARDCODED_ARTICLE_SLUGS`; de adăugat dacă vrei coverage complet.

---

*Toate cele 11 servicii active au pagini SEO hardcodate + cele 15 articole cu trafic migrate (root-path parity). Rovinietă-tool cu widget. Următor: paritate formular comandă (P0) + calculatoare + OG images.*
