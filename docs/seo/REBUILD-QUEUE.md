# Rebuild Queue — Toate paginile WP de recreat în Next.js

**Sursa:** GSC export 2026-05-20, ultimele 16 luni
**Filtru:** Toate paginile cu **> 100 click-uri** (42 pagini totale)
**Total trafic în joc:** ~1.43M click-uri / 16 luni (~89K/lună medie)
**Strategy:** una câte una, în ordinea priorității, păstrând URL WP exact

---

## Coloane

- **#** = ordinea de execuție (1 = primul)
- **URL** = path-ul WP (păstrat literal în Next.js)
- **Tip** = `S` servicii / `C` calculator / `B` blog / `T` tool / `H` homepage / `P` policy
- **Clicks** = click-uri în ultimele 16 luni
- **Imp.** = impressions
- **CTR** = current click-through rate
- **Pos** = average position
- **Effort** = ore estimate
- **Status** = ⬜ pending / 🟡 în lucru / ✅ done

---

## 🥇 BATCH 1 — Service Pages Tier 1 (10 pagini × ~10h = ~100h)
**De ce primul:** convertesc direct (revenue), 4.85M impressions cumulate, păstrăm flagship-ul.

| # | URL | Tip | Clicks | Imp. | CTR | Pos | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | `/servicii/cazier-judiciar-online/` | S | 4,057 | **534K** | 0.76% | **9.82** | 12h estimat → 24h actual | ⚠️ tehnic ✅ / vizual user feedback negativ |
| 2 | `/servicii/cazier-fiscal-online/` | S | 14,807 | 519K | 2.86% | 6.99 | 12h | ⬜ |
| 3 | `/servicii/verificare-rovinieta-online/` | S | 15,978 | 504K | 3.17% | 6.36 | 12h | ⬜ |
| 4 | `/servicii/cazier-auto-online/` | S | 3,898 | 47K | 8.22% | 5.14 | 10h | ⬜ |
| 5 | `/servicii/certificat-de-integritate-comportamentala/` | S | 1,989 | 152K | 1.3% | 6.44 | 10h | ⬜ |
| 6 | `/servicii/eliberare-certificat-de-nastere/` | S | **35,415** | **947K** | 3.74% | 6.31 | 12h | ⬜ |
| 7 | `/servicii/extras-de-carte-funciara/` | S | 8,156 | **978K** | **0.83%** | 8.15 | 12h | ⬜ |
| 8 | `/servicii/certificat-constatator-online/` | S | 896 | 328K | **0.27%** | 8.15 | 12h | ⬜ |
| 9 | `/servicii/eliberare-certificat-de-casatorie/` | S | 5,015 | 170K | 2.95% | 5.92 | 8h | ⬜ |
| 10 | `/servicii/eliberare-certificat-de-celibat/` | S | 4,712 | 107K | 4.39% | 6.59 | 8h | ⬜ |

**Subtotal:** 95K clicks/16mo, 4.3M impressions, ~108h

---

## 🥈 BATCH 2 — Service Pages Tier 2 (5 pagini × ~6h = ~30h)
**De ce:** completare catalog servicii + diaspora targeting + index pages.

| # | URL | Tip | Clicks | Imp. | CTR | Pos | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| 11 | `/servicii/` (index) | S | 361 | 182K | 0.20% | 7.50 | 8h (listing + filter) | ⬜ |
| 12 | `/servicii/extras-multilingv-certificat-nastere/` | S | 1,263 | 38K | 3.33% | 8.57 | 6h | ⬜ |
| 13 | `/servicii/extras-multilingv-certificat-casatorie/` | S | 250 | 15K | 1.64% | 12.58 | 6h | ⬜ |
| 14 | `/servicii/rovinieta-online/` | S | 133 | 63K | 0.21% | 11.42 | 4h (sau redirect 301 către `/servicii/verificare-rovinieta-online/` — decizie) | ⬜ |
| 15 | `/contact/` | P | 2,377 | 137K | 1.74% | 7.08 | 4h | ⬜ |

**Subtotal:** 4,400 clicks, 435K impressions, ~28h

---

## 💰 BATCH 3 — Calculator Pages (11 calculatoare × ~8h med = ~90h)
**De ce:** 900K+ clicks/an juggernaut + funnel către servicii. Build ca SSG (force-static).

| # | URL | Tip | Clicks | Imp. | CTR | Pos | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| 16 | `/calculator/calculator-impozit-auto/` | C | **434,403** | **2.3M** | 18.5% | 6.02 | 16h (formula complexă + 2026 rates) | ⬜ |
| 17 | `/calculator/varsta-pensionare/` | C | 111,317 | 1.63M | 6.82% | 5.36 | 14h (legea 360/2023) | ⬜ |
| 18 | `/calculator/salariu/` | C | 104,307 | 5.31M | 1.96% | 5.12 | 16h (net/brut, CAS 25%, CASS 10%, impozit 10%) | ⬜ |
| 19 | `/calculator/pensie-invaliditate/` | C | 63,778 | 1.05M | 6.06% | 6.01 | 10h | ⬜ |
| 20 | `/calculator/calculator-indemnizatie-crestere-copil/` | C | 53,979 | 715K | 7.55% | 6.24 | 10h | ⬜ |
| 21 | `/calculator/tva/` | C | 20,721 | 811K | 2.56% | 5.05 | 4h (trivial) | ⬜ |
| 22 | `/calculator/termene-judiciare/` | C | 10,786 | 290K | 3.72% | 4.47 | 8h | ⬜ |
| 23 | `/calculator/calculator-procente/` | C | 5,365 | 460K | 1.17% | 5.12 | 4h (trivial) | ⬜ |
| 24 | `/calculator/reabilitare/` | C | 2,885 | 86K | 3.35% | 6.91 | 8h | ⬜ |
| 25 | `/calculator/taxa-judiciara-de-timbru/` | C | 2,168 | 166K | 1.31% | 7.45 | 6h | ⬜ |
| 26 | `/tools/verificare-rovinieta-online/` | T | **280,002** | **3.89M** | 7.2% | 6.11 | 12h (necesită integrare API RAR — verificăm dacă există) | ⬜ |

**Subtotal:** 1.09M clicks, 16.7M impressions, ~108h

---

## 📝 BATCH 4 — Blog Articles (12 articole × ~5h med = ~60h)
**De ce:** E-E-A-T signals, long-tail keywords, internal linking în servicii. MDX → static.

| # | URL | Tip | Clicks | Imp. | CTR | Pos | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| 27 | `/tabel-varsta-pensionare-anticipata-femei/` | B | 83,600 | **1.81M** | 4.62% | 6.01 | 6h (tabel + content) | ⬜ |
| 28 | `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/` | B | 35,459 | 831K | 4.27% | 6.65 | 6h | ⬜ |
| 29 | `/anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania/` | B | 21,773 | 274K | 7.95% | 5.19 | 5h | ⬜ |
| 30 | `/ghid-complet-certificat-de-integritate-comportamentala/` | B | 15,394 | 248K | 6.2% | 4.36 | 5h | ⬜ |
| 31 | `/informatii-cazier-auto-online/` | B | 12,375 | 282K | 4.38% | 6.25 | 5h | ⬜ |
| 32 | `/amenda-rovinieta-2025-tarife-plata-online-ghid-complet/` | B | 10,998 | 370K | 2.97% | 4.45 | 5h | ⬜ |
| 33 | `/cum-vor-arata-documentele-de-stare-civila-2025/` | B | 6,890 | 142K | 4.84% | 5.47 | 4h | ⬜ |
| 34 | `/taxa-cazier-judiciar/` | B | 4,988 | 235K | 2.12% | 6.12 | 4h | ⬜ |
| 35 | `/eliberare-certificat-constatator-onrc-ghid/` | B | 4,829 | 433K | 1.11% | 7.33 | 5h | ⬜ |
| 36 | `/valabilitate-extras-de-carte-funciara/` | B | 3,021 | 115K | 2.62% | 9.56 | 4h | ⬜ |
| 37 | `/cele-4-tipuri-de-certificat-constatator-online/` | B | 1,720 | 217K | 0.79% | 8.91 | 4h | ⬜ |
| 38 | `/totul-despre-cartea-funciara-colectiva/` | B | 1,351 | 212K | 0.64% | 7.08 | 4h | ⬜ |
| 39 | `/cazier-judiciar-vs-certificat-integritate-comportamentala/` | B | 399 | 60K | 0.67% | 6.72 | 4h | ⬜ |
| 40 | `/importanta-extras-de-carte-funciara-colectiva/` | B | 395 | 34K | 1.16% | 15.34 | 4h | ⬜ |
| 41 | `/extras-de-carte-funciara-pentru-casa-verde/` | B | 219 | 34K | 0.65% | 23.05 | 3h | ⬜ |

**Subtotal:** 203K clicks, 5.3M impressions, ~68h

---

## 🏠 BATCH 5 — Foundational (homepage + tehnical)

| # | URL | Tip | Clicks | Imp. | CTR | Pos | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| 42 | `/` (homepage) | H | 46,450 | 2.15M | 2.16% | 6.63 | 12h (refresh deja există, dar lipsește calculator showcase) | ⬜ |

**Plus tehnical foundations (înainte de orice batch):**
- `src/app/sitemap.ts` dinamic (2h) ⬜
- `src/app/robots.ts` (1h) ⬜
- `trailingSlash: true` + redirects în `next.config.ts` (1h) ⬜
- Șterge `/services/[slug]` orfan (30 min) ⬜
- `src/lib/seo/` — helpers shared (Schema.org, metadata builders) (4h) ⬜

**Subtotal tehnical:** ~8h

---

## 📊 Total Effort & Impact

| Batch | Pagini | Clicks/16mo | Effort | Status |
|---|---|---|---|---|
| Tehnical foundations | 5 | — | ~8h | ⬜ |
| **Batch 1** (Tier 1 services) | 10 | 95,025 | 108h | ⬜ |
| Batch 2 (Tier 2 services) | 5 | 4,384 | 28h | ⬜ |
| Batch 3 (Calculatoare + tools) | 11 | 1,089,711 | 108h | ⬜ |
| Batch 4 (Blog) | 15 | 203,011 | 68h | ⬜ |
| Batch 5 (Homepage) | 1 | 46,450 | 12h | ⬜ |
| **TOTAL** | **47 pagini** | **~1.44M clicks** | **~332h** | — |

**Realist:** 1 dev cu 30h/săptămână → **~11 săptămâni** până gata tot.
**Optimist (2 devs paralel):** ~5-6 săptămâni.

---

## 🎯 Strategie de execuție — „Una câte una"

### Loop pentru fiecare pagină:

1. **Fetch WP source** — `curl -sL "https://eghiseul.ro/[path]/" -o /tmp/wp-[name].html`
2. **Extract conținut existent** — H1, H2, H3, paragrafe, FAQ, schema
3. **Identifică gap-uri** — vs blueprint din `docs/seo/SEO-MASTER-PLAN-2026-05-20.md` secțiunea 3
4. **Plan content extension** — minimum 3,000-4,500 cuvinte, 15+ FAQ, 20+ use cases
5. **Build pagina Next.js** — la path-ul WP exact, cu Schema completă, meta, mobile-first
6. **Internal links** — 2-3 servicii related + 2-3 blog articles + CTA primary
7. **Validation** — Lighthouse ≥ 90 mobile, Schema validator pass, GSC submit
8. **Status update** — `✅` în acest fișier + commit

### Template default pentru fiecare:

```
src/app/servicii/[wp-slug]/page.tsx           # static page
src/app/servicii/[wp-slug]/content.tsx        # extras content sections (optional)
```

Pentru calculatoare:
```
src/app/calculator/[wp-slug]/page.tsx         # SSG with `force-static`
src/app/calculator/[wp-slug]/calculator.tsx   # interactive React component (client)
```

Pentru blog:
```
content/articole/[wp-slug].mdx                # Markdown source
src/app/[wp-slug]/page.tsx                    # NO /articole/ prefix — WP path exact
```
**Notă:** articolele WP NU au `/articole/` prefix — sunt la root (`/taxa-cazier-judiciar/` etc.). Păstrăm.

---

## 📋 Checklist execuție pe fiecare pagină

```markdown
- [ ] Fetch WP source HTML
- [ ] Extract: title, meta description, H1, H2-H6, body text, images, FAQ if exists
- [ ] Identify SEO gaps vs blueprint (sec. 3 din SEO-MASTER-PLAN)
- [ ] Write/expand content (3000-4500 cuvinte target)
- [ ] Add 15+ FAQ entries cu răspuns 50-150 cuvinte
- [ ] Add Schema.org @graph: Service + Offer + BreadcrumbList + Organization
- [ ] Add 3 CTA points: hero + mid-page + sticky mobile bottom
- [ ] Internal links: ↑ servicii index + ↔ 2-3 related + ↓ 2-3 blog
- [ ] Mobile responsive — touch targets 48px+, inputmode pe form-uri
- [ ] Validate cu Schema.org Validator
- [ ] Lighthouse audit ≥ 90 mobile / 95 desktop
- [ ] Mark ✅ in REBUILD-QUEUE.md + commit
```

---

## 🚀 PROGRES & STATUS

### Pasul 0 — Tehnical foundations ✅ DONE (2026-05-20)
- ✅ `src/app/sitemap.ts` + `src/app/robots.ts`
- ✅ `src/lib/seo/` toolkit (constants, metadata, schema builders)
- ✅ `next.config.ts` cu `trailingSlash: true` + redirects
- ✅ `public/llms.txt` pentru AI crawlers
- ✅ Șters `src/app/services/` orphan

### Pasul 1 — Page #1 `/servicii/cazier-judiciar-online/` ⚠️ MIXED (2026-05-20)
- ✅ Tehnic: 4,057 cuvinte, Schema.org @graph complet (Organization + WebSite + BreadcrumbList + Service + 4 Offers + AggregateRating + WebPage + Person)
- ✅ A11y complet (focus-visible, skip-link, reduced-motion, sticky mobile CTA)
- ✅ Build + 738 tests pass
- ⚠️ User feedback (end of day 2026-05-20): „nu imi place cum arata cum ii organizat"
  - Specific feedback NOT given — necesită clarificare la reluare
  - Toate aspectele tehnice (SEO 95/100, GEO 88/100, UI/UX 96/100) sunt completate
  - Problema e probabil de **identitate vizuală** / **organizare secțiuni** / **estetică generală** — nu de implementare

### Decizii pentru reluare
1. Cere user feedback specific pe Page #1
2. OR treci la Page #2 (`/servicii/cazier-fiscal-online/`) cu lessons learned, polish #1 mai târziu

### Decizii confirmate la 2026-05-20
- ✅ `trailingSlash: true` în next.config — DA
- ✅ AI crawlers (GPTBot, ClaudeBot, PerplexityBot) — PERMITEM
- ✅ Calculatoare + articole — TOATE de recreat
- ✅ Pricing range — afișăm „2-4 zile" via `processing_config.estimated_days_display`
