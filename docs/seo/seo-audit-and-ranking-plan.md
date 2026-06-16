# Audit tehnic SEO + plan de ranking (cutover & link-building)

**Data:** 2026-06-16 · **Pagină auditată:** `/servicii/extras-de-carte-funciara/` (preview Vercel)

## 1. Rezultate audit tehnic (pe live preview)

| Verificare | Status |
|---|---|
| HTTP 200, indexabil (`robots: index, follow`) | ✅ |
| Canonical → `https://eghiseul.ro/...` (corect pentru cutover) | ✅ |
| Meta title/description, OG complet | ✅ |
| Schema `@graph`: Organization, WebSite, Service, Offer, AggregateRating, WebPage, Person, BreadcrumbList | ✅ |
| Schema **FAQPage** (17 Q&A, universal via ServiceFAQ) | ✅ |
| H1×1, H2×13, H3×24 — ierarhie corectă | ✅ |
| `robots.txt` permite TOȚI crawlerii AI (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended…) → GEO | ✅ |
| `sitemap.xml` prezent, URL-uri canonice eghiseul.ro | ✅ |
| Static prerender + `next/image` (webp) + lazy load → CWV bun din construcție | ✅ |
| **Titlu cu brand dublu** („… \| eGhișeul \| eGhiseul.ro") | 🔧 REZOLVAT (strip pe 32 pagini) |
| **OG image 404** (`/og/*.png` inexistent) | 🔧 REZOLVAT (`/og/default.png` branded + repoint 13 pagini) |

**Scor on-page estimativ: ~92/100.** Singurele minusuri rămase sunt off-page (autoritate/backlinks) și OG per-serviciu (avem default branded; custom = nice-to-have).

## 2. ⚠️ BLOCANT #1 — Cutover pe eghiseul.ro

Tot ce am construit rulează pe `eghiseul-ro.vercel.app`. **`eghiseul.ro` este încă WordPress.** Până la cutover, NIMIC nu rankează pe domeniul real. Pași:

1. **Pre-cutover (acum):**
   - Verifică în Vercel că domeniul `eghiseul.ro` + `www` sunt adăugate la proiect (Settings → Domains).
   - Confirmă că toate redirect-urile WP→Next există (slug-uri vechi → noi) în `next.config.ts`.
   - Export final GSC + listă URL-uri vechi WP cu trafic (ai deja în `docs/seo/gsc-data/`).
   - Build de producție verde (✅ deja).
2. **Cutover (fereastră de trafic mic, ex. noapte):**
   - Schimbă DNS-ul `eghiseul.ro` → Vercel (A/CNAME conform Vercel). TTL mic înainte cu o zi.
   - Activează SSL pe Vercel (automat).
3. **Imediat după cutover:**
   - GSC: confirmă `https://eghiseul.ro` ca proprietate; **Submit sitemap** `https://eghiseul.ro/sitemap.xml`.
   - GSC → URL Inspection → Request indexing pe paginile-cheie (CF, cazier, articolele top).
   - Verifică 20-30 redirect-uri vechi WP cu `curl -I` (să dea 301 → noul URL, nu 404).
   - Bing Webmaster Tools la fel.
4. **Săptămâna 1-2:** monitorizează GSC Coverage (erori 404/redirect), Core Web Vitals (field data începe să curgă).

## 3. Plan de ranking „extras de carte funciară" (poz. 6-10 + AI Overviews)

Top 1-5 SERP = ANCPI oficial (nu le luăm). Țintă realistă = pozițiile competitorilor comerciali/blog (cfunciara #8, storia #9, nexentbank #6, juridice #7).

**On-page (DONE):** pagină mai completă decât cfunciara, schema completă, FAQ exact-match, cluster cadastru, internal linking, conversie. ✅

**Off-page (DE FĂCUT — aici se câștigă/pierde):**
- **Backlinks** (cel mai important factor rămas):
  - Directoare de afaceri RO (firme, servicii juridice), profiluri Google Business.
  - PR/articole pe site-uri imobiliare/juridice (guest posts) cu link către `/servicii/extras-de-carte-funciara/`.
  - Parteneriate cu agenții imobiliare / notari (resource links).
  - Răspunsuri utile pe forumuri/Reddit/Quora RO (imobiliare) — link contextual.
- **Trust/brand signals** (paritate cfunciara): nr. autorizare firmă, sigle ANPC, link verificare ANCPI (✅ pus în specimen) — adaugă un trust band vizibil sus.
- **Brand mentions** (pentru GEO/AI): cât mai multe mențiuni „eGhișeul" + „extras de carte funciară" pe web.

**Conținut de susținere (DONE/parțial):**
- Articol cluster `cum-aflam-numarul-cf-cadastral` (33k) migrat, leagă UP la serviciu. ✅
- De adăugat intern: linkuri din alte articole/servicii către pagina CF.

## 4. Timeline realist

| Moment | Așteptare |
|---|---|
| T0: cutover + submit sitemap | Google începe re-crawl |
| T+1-2 săpt. | Paginile noi indexate, vechile URL-uri 301 transferă autoritatea |
| T+4-8 săpt. | Stabilizare poziții; on-page-ul își arată efectul |
| T+8-12 săpt. | Cu backlinks → intrare realistă poz. 6-10 + AI Overviews |

## 5. Verdict

On-page = **top-tier în segmentul comercial**. Ranking-ul real depinde acum de **cutover + backlinks + timp**. Fără cutover, scorul on-page nu contează. Fără backlinks, greu de trecut de competitorii cu autoritate de domeniu.

## 6. Backlog SEO concret

- [ ] Cutover DNS eghiseul.ro → Vercel + submit sitemap GSC/Bing.
- [ ] Verificare redirect-uri WP→Next (curl -I pe top URL-uri).
- [ ] Trust band sus pe paginile de servicii (autorizare + ANPC + verificare ANCPI).
- [ ] Campanie backlinks (directoare, PR, parteneriate).
- [ ] OG images per-serviciu custom (avem default branded acum).
- [ ] Monitorizare lunară GSC: poziții „extras de carte funciara" + variații.
- [ ] Aplică același nivel SEO (cine poate cere + FAQ exact-match) pe restul serviciilor.
