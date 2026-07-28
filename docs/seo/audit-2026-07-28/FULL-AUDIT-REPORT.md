# Audit SEO complet — eghiseul.ro · 28.07.2026

Primul audit pe **date reale de la Google** (Search Console API, CrUX, PageSpeed), nu pe exporturi manuale.
Rulat cu claude-seo v2.2.4: 7 audituri specializate + verificări proprii ale afirmațiilor importante.

**Scor de sănătate SEO: 69/100**

| Categorie | Pondere | Scor | Ce trage în jos |
|---|---|---|---|
| Technical SEO | 22% | 62 | ~40 pagini-oraș neindexate, fără CSP, sitemap fără `lastmod` |
| Content Quality | 23% | 72 | gol E-E-A-T (avocat nenominalizat, fără /despre-noi), pagină duplicat |
| On-Page SEO | 20% | 60 | canibalizare homepage↔pagini de serviciu, titlu buggy |
| Schema | 10% | 85 | curat tehnic; doar cifre statice de recenzii |
| Performance (CWV) | 10% | 75 | CSS render-blocking 751ms, TTFB/FCP în degradare |
| AI Search (GEO) | 10% | 78 | llms.txt ignoră articolele, un singur `sameAs` |
| Images | 5% | — | **neauditat** (scor renormalizat pe 95%) |

Metodologie și limite: 44 URL-uri inspectate individual în GSC (din 223), 7 pagini analizate pentru conținut,
4 pentru performanță. Tot ce n-a fost verificat e marcat explicit „neverificat" în fișierele din `findings/`.

---

## Cele 5 probleme care contează

### 1. 🔴 ~40 din 50 de pagini-oraș nu sunt indexate — inclusiv București

Investiția în location SEO pentru cazier judiciar e, în cea mai mare parte, **capital mort**.

| Cluster | Indexare |
|---|---|
| Pagini „nucleu" (homepage, servicii, calculatoare, articole) | **9/9** ✅ |
| Județe extras CF (`extras-de-carte-funciara/{județ}`) | **15/16 (94%)** ✅ |
| Orașe cazier (`cazier-judiciar-online/{oraș}`) | **4/19 (21%)** ❌ |

Verificat direct de mine: `/servicii/cazier-judiciar-online/bucuresti/` întoarce HTTP 200, e în sitemap, dar
Google raportează **„URL is unknown to Google", Last Crawl: None** — n-a fost crawlată niciodată. Cluj-Napoca,
în schimb, e indexată (crawl 12.07).

**Cauza, măsurată:** paginile de oraș au 1650-1770 de cuvinte și diferă între ele doar prin 1-2 paragrafe —
tipar de *doorway pages*. Google indexează selectiv doar orașele mari și le ignoră pe restul.

Contrastul cu paginile de județ CF (94% indexate, ~1130-1340 cuvinte) arată că **nu lungimea e problema, ci
diferențierea reală**.

### 2. 🔴 Homepage-ul fură traficul paginilor care vând

Pe „cazier judiciar online", în ultimele 28 de zile:

| Pagina servită de Google | Clicuri | Afișări | Poziție |
|---|---|---|---|
| `/` (homepage) | 497 | **19.243** (cumulat) | ~7,2 |
| `/servicii/cazier-judiciar-online/` | 18 | **495** | 7,5 |

Raport **~39:1 în favoarea paginii greșite**. Pozițiile sunt aproape identice (7,2 vs 7,5), deci pagina de
serviciu nu e „mai slabă" — pur și simplu Google alege hub-ul generic ca răspuns. Pagina comercială, cu
Product + Offer + recenzii, stă pe bară.

### 3. 🟠 Golul de încredere: avocatul nu are nume

Pe toate paginile, avocatul colaborator apare de 10+ ori ca „înscris în Barou" — dar **niciodată cu nume,
număr de Barou sau fotografie**. Nu există nici pagină `/despre-noi/` (doar `/contact/`, care are CUI și adresă).

Pentru un serviciu YMYL care cere CNP, buletin și selfie, ăsta e cel mai mare minus de E-E-A-T. Conținutul
în sine e bun (77-89/100, zero filler, zero pattern-uri AI) — deci nu textul e problema, ci **dovada că în
spate e cineva real**.

### 4. 🟠 Pagină duplicat live, cu titlu stricat

`/servicii/rovinieta/` și `/servicii/rovinieta-online/` sunt ambele live (200), ambele auto-canonice, ambele
în sitemap. Prima are titlul **„Rovinieta Online Online — Livrare rapidă"**.

Cauza, găsită în cod: `DB_SLUGS_WITH_HARDCODED_PAGE` (`src/lib/seo/constants.ts:72`) conține 13 slug-uri, dar
**nu și `rovinieta`** — deci mecanismul care exclude din sitemap și redirecționează 308 nu se aplică.

### 5. 🟡 Performanța: cauzele reale, nu cele presupuse

Toate metricile CrUX sunt încă „good", dar **TTFB +19,9%** și **FCP +8,9%** în 6 luni.

Ce blochează LCP-ul (3,5-4 s în lab pe mobil):
- **CSS render-blocking** — 751 ms pierduți, același fișier pe toate paginile
- **JS neutilizat** — ~450 ms, din chunk-urile comune ale layout-ului

⚠️ LCP-ul e **text (h1), nu imagine** — deci `fetchpriority` pe imagini, cum sugera scriptul generic, n-ar
avea niciun efect aici.

CLS-ul crescut (0,005 → 0,02) are vinovat identificat: **banner-ul de cookie-uri** (`layout.tsx:80`).

---

## Ce merge bine (verificat, nu presupus)

- **Indexare pe conținutul principal: 9/9**, cu canonical ales de Google = cel declarat peste tot. Zero mismatch.
- **Rich results active**: GSC confirmă Product, Breadcrumb și Review detectate pe paginile de servicii.
- **SEO tehnic on-page: 100/100** în Lighthouse (10/10 verificări).
- **Schema fără niciun tip retras** de Google în 2025 (verificat prin grep pe tot `src/`).
- **Pregătire AI peste medie**: robots permite explicit GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot,
  Google-Extended, Applebot; `llms.txt` conține fapte cu cifre; 3 din 4 pagini testate răspund în primele
  40-60 de cuvinte; FAQPage peste tot.
- **`/ancpi-nu-functioneaza/`** e cea mai citabilă pagină pentru AI: cronologie datată, cifre exacte, surse
  atribuite — și **nu** canibalizează pagina de extras CF (are deja 2 CTA-uri corecte către ea).
- Redirect http→https curat, un singur hop. Headere de securitate în mare parte corecte.

---

## Probleme mai mici, dar reale

| Problemă | Dovadă | Severitate |
|---|---|---|
| Program de lucru diferit pe site | `footer.tsx:188` „L-V 08:00-16:00" vs `contact/page.tsx:110` „L-J 08:00-16:00, V 08:00-15:00" | Medium |
| Număr de recenzii inconsistent | „Peste 450" (`social-proof-section.tsx:20`) vs „400+" (`testimonials-section.tsx:7`) | Low |
| Fără Content-Security-Policy | header absent pe homepage | High (securitate) |
| HSTS incomplet | fără `includeSubDomains`/`preload` | Medium |
| Sitemap fără `lastmod` | Google nu poate prioritiza recrawl-ul | Medium |
| Tool-ul de rovinietă nu e în HTML | `BAILOUT_TO_CLIENT_SIDE_RENDERING`, 0 `<input>` în sursă | Medium (invizibil pentru crawlerele AI, care nu execută JS) |
| `llms.txt` ignoră articolele | acoperă doar servicii + calculatoare, nu ANCPI/pensionare (traficul mare) | Medium |
| Un singur `sameAs` în Organization | doar short-link Google | Low |
| Prefetch agresiv pe desktop | 2-3× mai multe request-uri decât pe mobil | Low |
| `Host:` malformat în robots.txt | sintaxă depreciată, Google o ignoră | Low |

---

## Decizii ale proprietarului, consemnate

- **`aggregateRating` (4.9/450) rămâne neschimbat.** Cifrele provin din recenzii Google reale, copiate manual
  în cod. Se actualizează când numărul real crește semnificativ. Nu se scoate. Detalii: `findings/schema.md`.

---

## Ce NU s-a auditat (ca să nu pară acoperit)

- **Imagini** (alt text, formate, dimensiuni) — agentul nu a fost rulat.
- **Backlink-uri** — n-avem chei Moz/Bing; Common Crawl singur = date prea vechi.
- **Profilul Google Business** — Google a blocat 5 încercări de citire automată (perete de consimțământ →
  JS-wall → anti-bot). Rămâne de verificat manual: categorie principală, poze, Q&A, postări, rata de răspuns
  la recenzii.
- **179 din 223 URL-uri** din sitemap — n-au fost inspectate individual în GSC.
- **IndexNow**, headerele de securitate pe alte tipuri de pagini, cauza exactă a degradării TTFB.
- **Ecommerce / Maps geo-grid** — irelevante pentru modelul nostru (serviciu online național, fără vitrină).

---

## Fișiere

`findings/technical.md` · `findings/content.md` · `findings/schema.md` · `findings/performance.md` ·
`findings/geo.md` · `findings/sxo.md` · `findings/local.md` · `CONTEXT.md` (datele de intrare)

Plan de acțiune prioritizat: [`ACTION-PLAN.md`](ACTION-PLAN.md)
