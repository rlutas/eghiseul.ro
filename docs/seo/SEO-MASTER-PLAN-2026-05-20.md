# SEO Master Plan — eghiseul.ro Pre-Launch
**Data analiză:** 2026-05-20
**Premisă:** WordPress live cu trafic + backlinks; Next.js în dev (nu deployed pe `eghiseul.ro`); migrare la un moment dat în viitor.
**Obiectiv:** Pregătire Next.js astfel încât la lansare să **EGALEZE și DEPĂȘEASCĂ** pozițiile actuale WP. Zero pierdere de trafic la cutover.
**Sursa date:** GSC export 2026-05-20 (16 luni — 1.43M clicks, 26M impressions).

---

## 1. Cifrele care contează (current WP — ce trebuie BĂTUT)

### Top queries comerciale (paginile noastre de servicii)

| Query (cuvânt cheie) | WP poziție | Impressions | Click-uri | CTR | **Target Next.js** |
|---|---|---|---|---|---|
| **cazier judiciar online** | **6.79** | 197K | 5,692 | 2.9% | **🎯 pos 1-3** |
| cazier judiciar online gratuit | 6.00 | 46K | 2,060 | 4.5% | pos 1-2 |
| taxa cazier judiciar | 4.24 | 14K | 1,014 | 7.3% | pos 1-2 |
| **cazier fiscal online** | **4.19** | 43K | 6,047 | 14% | **🎯 pos 1-2** |
| cazier fiscal persoana fizica | 7.54 | 12K | 431 | 3.6% | pos 1-3 |
| **cazier auto online** | **3.69** | 27K | 3,656 | 13.5% | **🎯 pos 1** |
| cazier auto | 5.02 | 23K | 2,027 | 8.8% | pos 1-2 |
| **certificat de integritate comportamentala** | **3.47** | 59K | 2,860 | 4.9% | **🎯 pos 1** |
| **certificat constatator online** | **7.86** | **103K** | 786 | **0.76%** | **🎯 pos 2-3 (FIX URGENT)** |
| **extras carte funciara** | 6.61 | 107K | 1,060 | 0.99% | **🎯 pos 2-3 (FIX URGENT)** |
| extras de carte funciara | 6.52 | 105K | 768 | 0.73% | aceeași pagină |
| **verificare rovinieta** | **3.38** | **1.73M** | **138K** | 8% | **🎯 pos 1-2 (juggernaut!)** |
| valabilitate rovinieta | 4.19 | 86K | 5,785 | 6.8% | pos 1-2 |
| certificat de nastere | 2.63 | 18K | 295 | 1.6% | pos 1 |
| duplicat certificat de nastere online | 2.63 | 18K | 4,524 | 25% | pos 1 |

### Top queries informaționale (paginile blog — atrag funnel-ul)

| Query | WP poziție | Impressions | Click-uri |
|---|---|---|---|
| calcul varsta pensionare legea noua | 2.43 | 143K | 24K |
| tabel varsta pensionare anticipata femei | 3.98 | 232K | 10K |
| anii lucrati in strainatate se pun la pensie | 1.79 | 25K | 5.5K |
| pensie de invaliditate gradul 3 forum | 2.71 | 48K | 6.4K |

**Mesajul GSC:** site-ul nostru e dominant pe queries comerciale dar **pierdem CTR pe pagini cu poziții mediocre** (cazier-judiciar 6.79 @ 197K impressions = ratăm ~30K clicks/lună). Și **certificat constatator 0.76% CTR la pos 7.86 = title/meta sunt complet greșite** sau pagina nu e relevantă.

---

## 2. URL Strategy — Slug Parity cu WP

### Decizia: păstrăm slug-urile WP literal (matching exact)

**De ce:** la lansare URL-urile vor fi schimbate prin DNS de la WP la Next.js. Backlinks-urile externe duc la URL-uri WP. Singura cale să nu pierdem nimic e ca **toate URL-urile populare să existe în Next.js cu același path**.

### Mapping (verificat în codebase + GSC)

| WP URL (cu trafic) | Slug DB curent | Acțiune |
|---|---|---|
| `/servicii/cazier-judiciar-online/` | `cazier-judiciar` | ✅ Există pagină hardcodată `/servicii/cazier-judiciar-online/page.tsx` — păstrăm |
| `/servicii/cazier-judiciar-online/persoana-fizica` | — | ✅ Există sub-route — păstrăm |
| `/servicii/cazier-judiciar-online/persoana-juridica` | — | ✅ Există sub-route — păstrăm |
| `/servicii/cazier-fiscal-online/` | `cazier-fiscal` | ❌ Trebuie **pagină hardcodată nouă** |
| `/servicii/cazier-auto-online/` | `cazier-auto` | ❌ Trebuie **pagină hardcodată nouă** |
| `/servicii/verificare-rovinieta-online/` | `rovinieta` | ❌ Trebuie **pagină hardcodată nouă** |
| `/servicii/rovinieta-online/` | — | ❌ Trebuie sau redirect 301 → verificare-rovinieta-online |
| `/servicii/eliberare-certificat-de-nastere/` | `certificat-nastere` | ❌ Trebuie **pagină hardcodată nouă** (35K clicks!) |
| `/servicii/eliberare-certificat-de-casatorie/` | `certificat-casatorie` | ❌ Trebuie pagină hardcodată |
| `/servicii/eliberare-certificat-de-celibat/` | `certificat-celibat` | ❌ Trebuie pagină hardcodată |
| `/servicii/extras-de-carte-funciara/` | `extras-carte-funciara` | ❌ Trebuie **pagină hardcodată nouă** (978K impressions!) |
| `/servicii/certificat-constatator-online/` | `certificat-constatator` | ❌ Trebuie **pagină hardcodată nouă** |
| `/servicii/certificat-de-integritate-comportamentala/` | `certificat-integritate-comportamentala` | ❌ Trebuie pagină hardcodată |
| `/servicii/extras-multilingv-certificat-nastere/` | — | ❌ Trebuie pagină nouă |
| `/servicii/extras-multilingv-certificat-casatorie/` | — | ❌ Trebuie pagină nouă |

**Strategia tehnică:**

1. **Două layere de routing servicii:**
   - **Layer A (hardcodat, SEO-optimized):** `/servicii/cazier-fiscal-online/page.tsx` etc. — folder per URL WP, content hand-tuned, schema rich, internal links
   - **Layer B (dinamic fallback):** `/servicii/[slug]/page.tsx` — pentru servicii noi adăugate din admin, fără SEO custom

2. **`/services/[slug]` (englezesc) — ȘTERGEM** (duplicat orfan).

3. **DB stays as-is** — slug-urile DB (`cazier-fiscal`) sunt identificatorii interni pentru order pipeline. URL-urile SEO sunt SEPARATE, mapate manual în pagini hardcodate prin slug lookup.

### Calculator + Tools pages (separate sprint, dar URL-uri rezervate)

| WP URL | Click-uri/16 luni | Acțiune Next.js |
|---|---|---|
| `/calculator/calculator-impozit-auto/` | 434K | Build calculator pură React |
| `/tools/verificare-rovinieta-online/` | 280K | Necesită integrare API RAR — investigăm |
| `/calculator/varsta-pensionare/` | 111K | Pure React |
| `/calculator/salariu/` | 104K | Pure React (CAS/CASS/impozit 10%) |
| `/calculator/pensie-invaliditate/` | 64K | Pure React |
| `/calculator/calculator-indemnizatie-crestere-copil/` | 54K | Pure React |
| `/calculator/tva/` | 21K | Pure React (trivial) |
| `/calculator/termene-judiciare/` | 11K | Pure React |
| `/calculator/calculator-procente/` | 5K | Pure React (trivial) |
| `/calculator/reabilitare/` | 3K | Pure React |
| `/calculator/taxa-judiciara-de-timbru/` | 2K | Pure React |

**Atenție:** decizia user-ului — vrem să recreem calculatoarele sau nu? Dacă DA → 900K+ clicks/an juggernaut + funnel către servicii. Dacă NU → redirect 301 din `/calculator/*` → homepage cu mesaj „instrument retras".

### Blog / articole (separate sprint)

Articole cu trafic > 1,000 clicks/16 luni:
- `/tabel-varsta-pensionare-anticipata-femei/` (84K)
- `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/` (35K)
- `/anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania/` (22K)
- `/ghid-complet-certificat-de-integritate-comportamentala/` (15K)
- `/informatii-cazier-auto-online/` (12K)
- `/amenda-rovinieta-2025-tarife-plata-online-ghid-complet/` (11K)
- `/cum-vor-arata-documentele-de-stare-civila-2025/` (7K)
- `/taxa-cazier-judiciar/` (5K)
- `/eliberare-certificat-constatator-onrc-ghid/` (5K)
- `/cele-4-tipuri-de-certificat-constatator-online/` (1.7K)
- `/totul-despre-cartea-funciara-colectiva/` (1.3K)
- `/cazier-judiciar-vs-certificat-integritate-comportamentala/` (399)
- `/valabilitate-extras-de-carte-funciara/` (3K)

Total ~200K clicks/an doar blog. Migrare ca MDX în `/content/articole/*.md`, render via `next-mdx-remote`.

---

## 3. Per-Service SEO Blueprint — Standard pentru fiecare pagină

**Aceasta e șablonul nenegociabil pentru fiecare /servicii/* pagină.**

### 3.1 Meta tags (in `generateMetadata`)

```typescript
export const metadata: Metadata = {
  title: '[Service Name] Online — [USP] | eGhișeul',
  description: '[100-160 chars] [primary keyword] + [USP] + [price] + [delivery time] + [trust signal].',
  alternates: { canonical: 'https://eghiseul.ro/servicii/[wp-slug]' },
  openGraph: {
    type: 'website',
    url: 'https://eghiseul.ro/servicii/[wp-slug]',
    title: '...',
    description: '...',
    images: [{ url: '/og/[service].png', width: 1200, height: 630 }],
    siteName: 'eGhișeul.ro',
    locale: 'ro_RO',
  },
  twitter: { card: 'summary_large_image', title: '...', description: '...' },
  robots: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
};
```

**Reguli stricte:**
- Title 50-60 chars, primary keyword în primele 30 chars
- Description 140-160 chars, include preț numeric (e.g., „198 RON"), CTA implicit
- ZERO emoji-uri în meta tags

### 3.2 Structura H1-H6

```
<h1> Cazier Judiciar Online — Obține Rapid Fără Drumuri (198 RON)
  <h2> Ce este Cazierul Judiciar
  <h2> Când Ai Nevoie de Cazier Judiciar (Use Cases)
    <h3> Pentru Angajare în România
    <h3> Pentru Angajare în Străinătate
    <h3> Pentru Vize și Imigrare
    <h3> Pentru Adopție
    <h3> Pentru Achiziție Armă
    ...
  <h2> Cum Funcționează — Proces în 4 Pași
  <h2> Documente Necesare
  <h2> Termene de Livrare
  <h2> Prețuri și Add-on-uri
    <h3> Cazier Judiciar Standard — 198 RON
    <h3> Procesare Urgentă — +80 RON
    <h3> Traducere Autorizată — +178.50 RON
    <h3> Apostilă Haga — +238 RON
  <h2> Întrebări Frecvente
    <h3> Cât durează eliberarea cazierului judiciar?
    <h3> Care este valabilitatea cazierului judiciar?
    <h3> Pot obține cazier judiciar dacă am condamnări?
    ... (minim 15 Q-uri per pagină)
  <h2> De Ce eGhișeul.ro
```

**Reguli:**
- Un singur H1 per pagină, conține primary keyword exact
- Folosim 20+ use cases (sursă: `motiv-options.ts` — avem 219 motive!)
- Minim 15 FAQ-uri (răspunsuri 50-150 cuvinte fiecare — drivers pentru featured snippets)

### 3.3 Conținut — Minimum lengths

| Section | Cuvinte minime |
|---|---|
| Intro (înainte de prima sub-section) | 100-150 |
| Use cases section | 800-1,200 (cu 20+ cazuri concrete) |
| FAQ section | 1,500-2,500 (15+ Q-uri × 100 cuvinte) |
| Process / How it works | 300-500 |
| Documentation needed | 300-500 |
| **Total pagină** | **3,000-4,500 cuvinte** |

WP-ul actual la cazier-judiciar are probabil sub 1,500 cuvinte → asta e gap-ul principal de bătut.

### 3.4 Schema.org markup (în page.tsx)

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': 'https://eghiseul.ro/servicii/cazier-judiciar-online#service',
      name: 'Cazier Judiciar Online',
      serviceType: 'Document Processing',
      description: '...',
      provider: { '@id': 'https://eghiseul.ro/#organization' },
      areaServed: { '@type': 'Country', name: 'Romania' },
      offers: [
        { '@type': 'Offer', name: 'Standard', price: 198, priceCurrency: 'RON', availability: 'https://schema.org/InStock' },
        { '@type': 'Offer', name: 'Urgent', price: 278, priceCurrency: 'RON', availability: 'https://schema.org/InStock' },
      ],
      aggregateRating: { '@type': 'AggregateRating', ratingValue: 4.9, reviewCount: 1247 }, // dacă avem
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://eghiseul.ro/' },
        { '@type': 'ListItem', position: 2, name: 'Servicii', item: 'https://eghiseul.ro/servicii/' },
        { '@type': 'ListItem', position: 3, name: 'Cazier Judiciar Online', item: 'https://eghiseul.ro/servicii/cazier-judiciar-online/' },
      ],
    },
    {
      '@type': 'Organization',
      '@id': 'https://eghiseul.ro/#organization',
      name: 'eGhișeul.ro',
      url: 'https://eghiseul.ro',
      logo: 'https://eghiseul.ro/logo.png',
      contactPoint: { '@type': 'ContactPoint', telephone: '+40...', contactType: 'customer service' },
    },
  ],
};
```

**IMPORTANT:**
- ❌ NU adăuga `FAQPage` schema — Google a eliminat rich results pentru FAQ în Aug 2023 (păstrăm doar pentru gov/healthcare)
- ❌ NU adăuga `HowTo` schema — Google a eliminat rich results în Sept 2023
- ✅ `Service` + `Offer` (price + availability) — eligibil pentru product rich results
- ✅ `BreadcrumbList` — încă valid și folosit
- ✅ `AggregateRating` doar dacă avem date reale (review-uri auditate). Schema fake → penalty.

### 3.5 Internal linking (obligatoriu)

Fiecare pagină servicii **trebuie** să linkeze:
- ⬆️ Înapoi la `/servicii/` (categorie părinte)
- ↔️ La 2-3 servicii related (cazier-judiciar ↔ certificat-integritate; cazier-fiscal ↔ certificat-constatator; rovinieta ↔ cazier-auto)
- ⬇️ La 2-3 articole blog tematice (când le facem) — pentru E-E-A-T
- 🎯 CTA primary la `/comanda/[slug]` (3 puncte: hero, mid-page, sticky bottom mobile)

### 3.6 Core Web Vitals (target)

| Metric | Target | Reason |
|---|---|---|
| LCP | < 2.5s | Hero image optimizat, preload font critic |
| INP | < 200ms | Înlocuiește FID din 2024 — orice tap pe mobil < 200ms |
| CLS | < 0.1 | Zero layout shift — width/height pe toate imaginile |

**Implementare:**
- `next/image` pe TOATE imaginile cu width/height explicit
- `font-display: swap` + `<link rel="preload">` pe font primar
- `loading="eager"` doar pe hero, `loading="lazy"` pe rest
- Mobile = priority (83% trafic)

---

## 4. Prioritizare — Ordin de construire

Bazat pe **GSC impressions × CTR gap × position gap** (pierdere reală):

### 🥇 Tier 1 (LANSAREA NU SE FACE FĂRĂ ASTEA)

| # | Pagină Next.js | Reason | Effort |
|---|---|---|---|
| 1 | `/servicii/cazier-judiciar-online/` (refresh existent) | 197K imp @ pos 6.79 — flagship, deja există structura | 8h |
| 2 | `/servicii/cazier-fiscal-online/` | 43K imp @ pos 4.19 — content exists in docs/seo/ | 12h |
| 3 | `/servicii/cazier-auto-online/` | 27K imp @ pos 3.69 + 23K queries — easy win | 10h |
| 4 | `/servicii/verificare-rovinieta-online/` | **1.73M impressions** — juggernautul | 12h |
| 5 | `/servicii/certificat-de-integritate-comportamentala/` | 59K imp @ pos 3.47 — keep position | 10h |
| 6 | `/servicii/eliberare-certificat-de-nastere/` | 947K impressions, 35K clicks | 12h |
| 7 | `/servicii/extras-de-carte-funciara/` | **978K impressions @ CTR 0.83%** — biggest CTR gap | 12h |
| 8 | `/servicii/certificat-constatator-online/` | **328K impressions @ CTR 0.27%** — worst CTR | 12h |
| 9 | `/servicii/eliberare-certificat-de-casatorie/` | 170K impressions | 8h |
| 10 | `/servicii/eliberare-certificat-de-celibat/` | 107K impressions | 8h |

**Total Tier 1:** ~104 ore = ~2.5 sprints de 1 dev.

### 🥈 Tier 2 (post-launch, primele 3 luni)

| Pagină | Reason |
|---|---|
| `/servicii/extras-multilingv-certificat-nastere/` | 38K impressions — diaspora |
| `/servicii/extras-multilingv-certificat-casatorie/` | 15K impressions — diaspora |
| `/articole/` index + 5 articole top blog | 200K impressions/an total |

### 🥉 Tier 3 (sprint dedicat)

- Calculatoare (900K clicks/an) — decizie strategică separată
- Tools (verificare rovinieta — necesită API)

---

## 5. Fundament Tehnic — Build ACUM (1-2 zile)

### 5.1 `src/app/sitemap.ts` — Dynamic XML sitemap

```typescript
import { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/public';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://eghiseul.ro';
  const supabase = createPublicClient();
  
  // Static pages (homepage + servicii index)
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/servicii/`, changeFrequency: 'weekly', priority: 0.9 },
  ];
  
  // Hardcoded SEO-optimized service pages
  const HARDCODED_SERVICES = [
    'cazier-judiciar-online',
    'cazier-fiscal-online',
    'cazier-auto-online',
    'verificare-rovinieta-online',
    'eliberare-certificat-de-nastere',
    'eliberare-certificat-de-casatorie',
    'eliberare-certificat-de-celibat',
    'extras-de-carte-funciara',
    'certificat-constatator-online',
    'certificat-de-integritate-comportamentala',
    'extras-multilingv-certificat-nastere',
    'extras-multilingv-certificat-casatorie',
  ];
  
  const servicePages = HARDCODED_SERVICES.map((slug) => ({
    url: `${baseUrl}/servicii/${slug}/`,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));
  
  // Dynamic DB services (fallback for any not hardcoded)
  const { data: dbServices } = await supabase
    .from('services')
    .select('slug, updated_at')
    .eq('is_active', true);
  
  const dynamicPages = (dbServices ?? [])
    .filter((s) => !HARDCODED_SERVICES.includes(s.slug))
    .map((s) => ({
      url: `${baseUrl}/servicii/${s.slug}/`,
      lastModified: new Date(s.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  
  return [...staticPages, ...servicePages, ...dynamicPages];
}
```

### 5.2 `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/comanda/', '/auth/'] },
      // Block AI crawlers if we don't want training data scraped
      // { userAgent: 'GPTBot', disallow: '/' },
      // { userAgent: 'CCBot', disallow: '/' },
    ],
    sitemap: 'https://eghiseul.ro/sitemap.xml',
    host: 'https://eghiseul.ro',
  };
}
```

**Decizie de luat:** blocăm GPTBot / ClaudeBot / PerplexityBot sau le permitem? **Recomandare:** PERMITEM (E-E-A-T signal modern + AI search vizibilitate). Dacă ne îngrijorăm de scraping, blocăm doar `CCBot` (Common Crawl).

### 5.3 Canonical URLs — Standard pe toate paginile

```typescript
// In generateMetadata
alternates: {
  canonical: 'https://eghiseul.ro/servicii/[wp-slug]/',
},
```

Path trailing slash **CONSISTENT** (cu sau fără — pick one). WP foloseste cu trailing slash → folosim cu trailing slash în Next.js.

### 5.4 `next.config.ts` — Trailing slash + redirects

```typescript
const nextConfig: NextConfig = {
  trailingSlash: true, // match WP convention
  async redirects() {
    return [
      // Cleanup old English routes (orphan duplicates)
      { source: '/services/:slug', destination: '/servicii/:slug/', permanent: true },
      // Future: any URL renames go here
    ];
  },
};
```

**Atenție:** `trailingSlash: true` schimbă comportamentul TUTUROR rutelor. Testat înainte de production.

---

## 6. Cutover Plan — Ziua Migrării

### Pre-launch (T-7 zile)

- [ ] Toate paginile Tier 1 deployed pe staging (`staging.eghiseul.ro`)
- [ ] Crawl complet cu Screaming Frog — zero broken links, zero 5xx, zero duplicate titles
- [ ] Lighthouse score per pagină ≥ 90 mobile / 95 desktop
- [ ] Schema markup validat cu Schema.org Validator + Google Rich Results Test
- [ ] Sitemap.xml accesibil și include toate URL-urile servicii
- [ ] robots.txt blochează /admin, /api, /comanda
- [ ] Canonical tags pe fiecare pagină
- [ ] Internal links audit — zero link-uri către `/services/` (englez)

### Migration day (T-0)

- [ ] **Pasul 1:** Switch DNS la Vercel (TTL coborât la 300s cu 24h înainte)
- [ ] **Pasul 2:** Verificare propagare DNS (5-15 min)
- [ ] **Pasul 3:** Submit sitemap în GSC: `eghiseul.ro/sitemap.xml`
- [ ] **Pasul 4:** Request indexing manual pe top 10 servicii în GSC
- [ ] **Pasul 5:** Verifică `Coverage report` GSC — zero erori 404 pe URL-uri WP populare
- [ ] **Pasul 6:** Tweet/email blast + Google Business Profile update

### Post-launch monitoring (T+1 to T+30 days)

| Metric | Frecvență check | Action threshold |
|---|---|---|
| GSC clicks (daily) | zilnic primele 14 zile | -20% vs pre-launch → investigăm |
| GSC errors (404 / 5xx) | zilnic | orice URL cu > 100 impressions → fix imediat |
| Average position (top 10 queries) | săptămânal | drop > 2 poziții → investigăm |
| Bing Webmaster Tools | săptămânal | (Bing reindexează mai încet) |
| Backlinks (Ahrefs/Semrush) | bilunar | drop > 10 referring domains → outreach |

### Backlink preservation

Backlink-urile WP duc la URL-uri ca `/servicii/cazier-judiciar-online/`. Strategia:
1. **URL parity** — păstrăm path identic în Next.js (DEJA strategy-ul nostru)
2. **Linkurile rămân vii** — niciun redirect necesar dacă path-urile matchează
3. **Excepții cu redirect 301:** doar pentru URL-uri WP cu trafic > 100 clicks dar **fără pagină directă** (e.g., `/servicii/rovinieta-online/` → `/servicii/verificare-rovinieta-online/`)

---

## 7. Optimizări pe care WP-ul curent NU le are (advantajul nostru)

Build-uim DIRECT cu acestea — ne diferențiază:

### 7.1 Performance — Next.js 16 + Turbopack

- LCP sub 2s pe mobil (WP probabil 3-5s)
- INP < 100ms (WP probabil 200-400ms pe pluginuri)
- Bundle size minim (Next.js tree-shaking vs WP plugin bloat)

### 7.2 Mobile-first UX (83% trafic mobil)

- Touch targets ≥ 48×48px
- Sticky CTA bar pe mobil (nu pe desktop)
- Form-uri optimizate pentru tastatura virtuală (`inputmode="numeric"` pe CNP)

### 7.3 Structured pricing + comparison

WP-ul afișează prețul „250 RON" undeva pierdut. La noi:
- Pricing table comparativă (Standard / Urgent / + Add-ons)
- Schema Offer per variant → Google poate afișa preț în SERP

### 7.4 Trust signals dense

- Count comenzi procesate (live din DB)
- Recenzii client (când avem)
- Logo securitate (Stripe, Cloudflare, SSL)
- „Procesat de la 2024" badge

### 7.5 E-E-A-T signals modern (Dec 2025 update)

Google a extins E-E-A-T peste tot (nu doar YMYL). Trebuie:
- **Expertise:** „Articol revizuit de [avocat / consilier juridic]" + linkedin link
- **Experience:** „Peste 33,000 comenzi procesate din 2024"
- **Authority:** Author bylines, About page robustă, contact real (telefon + adresă)
- **Trust:** SSL HTTPS, GDPR disclosure, refund policy vizibil în footer

### 7.6 AI Search readiness (GEO — Generative Engine Optimization)

În 2026 ChatGPT/Perplexity/Google AI Overview generează 15-25% din traficul de discovery. Asigurăm:
- **llms.txt** la root (declarație folosire AI)
- Conținut **passage-level citable** — paragrafe scurte, factuale, cu intent clear
- Permitem GPTBot, ClaudeBot, PerplexityBot în robots.txt
- Schema `Article` cu `dateModified` pentru freshness signal

---

## 8. Resurse interne (deja scrise — refolosim)

| Fișier | Conținut | Folosit pentru |
|---|---|---|
| `docs/seo/CAZIER-FISCAL-SEO-AUDIT.md` (911 linii) | Gap analysis complet | Template pentru toate auditurile |
| `docs/seo/CONTENT-IMPLEMENTATION-GUIDE.md` (791 linii) | Copy ready-to-use pentru cazier-fiscal | Refolosit + adaptat pentru fiecare serviciu |
| `docs/seo/EXECUTIVE-SUMMARY.txt` | Quick executive overview | Format pentru rapoarte progres |
| `src/app/servicii/cazier-judiciar-online/page.tsx` (378 linii) | Schema + structură existentă | Template pentru noile pagini |
| `src/config/motiv-options.ts` | 219 motive prioritizate | Use cases per pagină serviciu |

---

## 9. Decizii imediate (de luat înainte să apuc cu coding)

1. **Trailing slash?** WP folosește `/`. Recomandare: **DA** `trailingSlash: true`.
2. **Calculatoare/Tools — restaurăm?** 900K clicks/an. Dacă nu → redirect 301 la lansare (pierdem trafic dar nu blocăm migrare).
3. **Articole blog — migrăm acum sau post-launch?** ~200K clicks/an. Recomandare: post-launch (Tier 2/3).
4. **`AggregateRating` schema?** Doar dacă avem review-uri reale. Inventezi cifre → penalty Google.
5. **AI crawler policy?** Recomandare: permitem (GPTBot, ClaudeBot, PerplexityBot).
6. **Migrăm tot conținutul WP sau scriem from scratch?** Recomandare: from scratch, mai relevant și ne dă șansa să optimizăm de la zero.

---

## 10. Next Steps — Ordinea propusă

### Săptămâna asta (2-3 zile)
1. ✅ Plan aprobat (acest doc)
2. Implementare fundamentală tehnică:
   - `src/app/sitemap.ts` dinamic
   - `src/app/robots.ts`
   - `trailingSlash: true` în next.config + redirects către `/servicii/`
   - Șterge `/services/[slug]` orfan
3. Cleanup `/servicii/[slug]` dinamic — verifică să serveze drept fallback corect

### Sprint 1 (1 săpt.) — Tier 1 part 1
4. Refresh `/servicii/cazier-judiciar-online/` (existent — extindere conținut 1500 → 4000 cuvinte, FAQ extins, Offer schema)
5. Build `/servicii/cazier-fiscal-online/` (folosind CONTENT-IMPLEMENTATION-GUIDE.md)
6. Build `/servicii/cazier-auto-online/`
7. Build `/servicii/verificare-rovinieta-online/` (juggernautul!)
8. Build `/servicii/certificat-de-integritate-comportamentala/`

### Sprint 2 (1 săpt.) — Tier 1 part 2
9. Build `/servicii/eliberare-certificat-de-nastere/`
10. Build `/servicii/extras-de-carte-funciara/`
11. Build `/servicii/certificat-constatator-online/`
12. Build `/servicii/eliberare-certificat-de-casatorie/`
13. Build `/servicii/eliberare-certificat-de-celibat/`

### Sprint 3 — Polish + cutover prep
14. Schema validation, Lighthouse audit, Screaming Frog crawl
15. Staging deployment + manual QA
16. Cutover checklist execution

---

**ETA realist pentru launch:** ~3-4 săptămâni de la GO. Trafic post-launch (target): **EGAL sau mai bun decât WP curent** la 30 zile, +20-40% la 90 zile (datorită conținut mai bun + schema + performance).

**Decizie de luat ACUM:** începem cu **fundamentele tehnice** (sitemap + robots + trailing slash) sau direct cu **refresh-ul `/servicii/cazier-judiciar-online/`** (cea mai mare oportunitate single-page)?
