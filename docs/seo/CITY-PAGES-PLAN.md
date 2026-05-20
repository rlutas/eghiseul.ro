# City Pages Plan — Programmatic SEO pentru Cazier Judiciar

**Data:** 2026-05-20
**Sursa competitivă:** analiza GSC + scrape competitori (caziere.ro, cazierjudiciaronline.com)
**Obiectiv:** Long-tail capture pe queries de tipul „cazier judiciar [oraș]", „cazier judiciar online [oraș]". Estimat **+5-15K clicuri/lună** la indexare completă.

---

## Competitive landscape

| Competitor | City pages | Originalitate | URL pattern |
|---|---|---|---|
| **caziere.ro** | **5 confirmate** (Buc, Cluj, Brașov, Iași, Timișoara) | ~20% (template + city swap) | `/servicii/cazier-judiciar-online-[city]` |
| **cazierjudiciaronline.com** ⚠️ threat real | **12+** (Buc, Cluj, Timișoara, Iași, Brașov, Sibiu, Constanța, Craiova, Oradea, Arad, Galați, Satu Mare, Târgu Mureș) | ~20-30% | `/cazier-judiciar-online/[city]` |
| cazier-judiciar-online.ro | ~2 (Buc, Cluj) | ~25% | `/cazier-online-bucuresti/` |
| cazierul-judiciar-online.ro | ~1 (Cluj) | ~30% | `/ghisee/[city]/cazier-judiciar-[city]/` |
| **ghiseul.ro** (oficial) | ZERO | — | doar national |

**Ce face cazierjudiciaronline.com (threat real) — pattern detectat:**
- Schelet H2 identic 1:1 la toate orașele
- Body: ~80% identic, 20% city-specific
- City-specific = (a) adresă DGPMB/IPJ + telefon + program, (b) 1-2 FAQ-uri locale (ex: Sibiu menționează „Continental Sibiu" — angajator local), (c) numele orașului repetat 25+ ori (keyword density)
- Word count: 2,800-3,200 / pagină
- Mențiuni schema: Service + FAQPage + BreadcrumbList (probabil — neconfirmat din scrape)
- Zero embed Google Maps
- Internal cross-links la celelalte 12 orașe

---

## Strategia noastră — beat them cu ~40% originalitate

Va trebui **2x mai mult conținut city-specific decât competiția**. Per city:

### Conținut diferențiat (~40% per pagină) — sursa de avantaj

| Element | Sursă | Exemplu Cluj |
|---|---|---|
| **Adresă IPJ Cluj** | Date publice politiaromana.ro | Str. Traian, nr. 27, Cluj-Napoca, 400006 |
| **Telefon ghișeu cazier** | Date publice | 0264 432 727 |
| **Program ghișeu** | Date publice | Luni-Vineri 8:30-16:00 |
| **Google Maps embed** | iframe (zero competitor are asta!) | Marker IPJ + zoom 14 |
| **Distanță medie diaspora → ghișeu** | Calculat | „Pentru clienții din diaspora — drum de 1,200+ km dus-întors" |
| **Profil demografic local** | Wikipedia / INSEE / date publice | „Populație: 324,576 (recensământ 2021). 12% diaspora în Germania/Italia" |
| **Top angajatori locali ce cer cazier** | LinkedIn / job boards | Continental, Bombardier, Emerson, Robert Bosch, Banca Transilvania |
| **Instituții locale ce cer cazier** | Date publice | Universitatea Babeș-Bolyai (titularizare), DGASPC Cluj (asistent maternal), Inspectoratul Școlar |
| **FAQ specifice orașului** | 3-5 întrebări locale | „Pot obține cazier la Cluj-Napoca dacă lucrez în Germania?", „Cum diferă procesul în Cluj față de București?" |
| **Testimonial local** | Date reale clienți (cu acord) | „Maria M., Cluj-Napoca: «Am primit cazierul în 2 zile pentru aplicare la Babeș-Bolyai»" |

### Conținut shared (~60% per pagină) — template comun

- Hero cu H1 personalizat
- Ce este cazierul judiciar (definiție generală)
- Cum funcționează (4 pași)
- Prețuri standard
- De ce online vs ghișeu (cu specific „pierzi 4-6 ore + drum la sediul X")
- Servicii conexe (cazier-fiscal, integritate, auto)
- CTA-uri

**Total target:** 2,500-3,500 cuvinte / pagină, cu ~40% diferențiat.

---

## URL Strategy

**Pattern:** `/servicii/cazier-judiciar-online-[city]/`
**Match exact cu caziere.ro** — același pattern. Nu inventăm structuri noi care fragmentează autoritatea.

**Slug-uri (no diacritics, hyphen for multi-word):**
- `bucuresti`, `cluj-napoca`, `timisoara`, `iasi`, `brasov`, `constanta`, `craiova`, `sibiu`, `oradea`, `galati`, `ploiești` → `ploiesti`, `pitesti`, `bacau`, `braila`, `targu-mures`, `satu-mare`

---

## Tier 1 — 10 orașe (lansare imediată)

Bazat pe (a) populație, (b) trafic diaspora din GSC (Germania/UK/Italia → cetățeni din orașe mari), (c) competitorul cazierjudiciaronline.com le acoperă:

| # | Oraș | Slug | Populație | Concurență | Effort |
|---|---|---|---|---|---|
| 1 | București | `bucuresti` | 1.7M | 4 competitori | 4h (6 sectoare!) |
| 2 | Cluj-Napoca | `cluj-napoca` | 325K | 3 | 3h |
| 3 | Timișoara | `timisoara` | 250K | 2 | 3h |
| 4 | Iași | `iasi` | 270K | 2 | 3h |
| 5 | Brașov | `brasov` | 235K | 2 | 3h |
| 6 | Constanța | `constanta` | 263K | 1 | 3h |
| 7 | Craiova | `craiova` | 234K | 1 | 3h |
| 8 | Sibiu | `sibiu` | 134K | 1 (cazierjudiciaronline) | 3h |
| 9 | Oradea | `oradea` | 196K | 1 | 3h |
| 10 | Galați | `galati` | 217K | 1 | 3h |

**Effort total Tier 1:** ~30h (1 sprint scurt).

## Tier 2 — 5 orașe (post-launch +30 zile)

| # | Oraș | Slug | Populație |
|---|---|---|---|
| 11 | Arad | `arad` | 145K |
| 12 | Ploiești | `ploiesti` | 200K |
| 13 | Pitești | `pitesti` | 154K |
| 14 | Bacău | `bacau` | 144K |
| 15 | Brăila | `braila` | 154K |

**Effort Tier 2:** ~15h.

## Tier 3 (optional, lung-tail) — 5 orașe mici

| # | Oraș | Slug |
|---|---|---|
| 16 | Târgu Mureș | `targu-mures` |
| 17 | Satu Mare | `satu-mare` |
| 18 | Baia Mare | `baia-mare` |
| 19 | Buzău | `buzau` |
| 20 | Suceava | `suceava` |

---

## Schema Tehnică

### Structură fișiere

```
src/app/servicii/cazier-judiciar-online-[city]/
  ├── page.tsx           — pagina propriu-zisă
  ├── (data optionally)  — city data sourced from data file
```

SAU mai bine — **un singur folder dinamic cu data per oraș:**

```
src/app/servicii/cazier-judiciar-online-[city]/page.tsx   — dynamic [city] segment
src/data/cities.ts                                          — array cu toate datele per oraș
```

**Recomandare:** dynamic route cu data file. Add 10-20 entries în `cities.ts` once, page.tsx scrie content. Each city renders ca SSG via `generateStaticParams`.

### Data file shape — `src/data/cities.ts`

```typescript
export interface CityData {
  slug: string;           // 'cluj-napoca'
  name: string;           // 'Cluj-Napoca'
  county: string;         // 'Cluj'
  countyCode: string;     // 'CJ'
  population: number;     // 324576
  region: string;         // 'Transilvania'
  policeStation: {
    name: string;         // 'IPJ Cluj — Birou Cazier Judiciar'
    address: string;
    postalCode: string;
    phone: string;
    schedule: string;     // 'Luni-Vineri 8:30-16:00'
    coordinates: { lat: number; lng: number };
  };
  topEmployers: string[];     // ['Continental', 'Bosch', 'Banca Transilvania', ...]
  localInstitutions: string[]; // ['Universitatea Babeș-Bolyai', 'DGASPC Cluj']
  diasporaProfile?: string;    // 'Comunitate românească mare în Germania (Munchen) + Italia (Torino)'
  localFaqs: { q: string; a: string }[];  // 3-5 city-specific FAQs
  testimonial?: { name: string; city: string; quote: string };
}
```

### Page.tsx — render structure

Same H1-H6 skeleton + same FAQ + same schema, dar **populated cu data city**.

**Crucial:** schema include **LocalBusiness** + **Service** + **BreadcrumbList** + **FAQPage NU** (vezi master plan — deprecated 2023 pentru non-gov). Adăugăm **GeoCoordinates** + **PostalAddress** pentru police station — semnal local SEO foarte puternic.

```typescript
{
  '@type': 'LocalBusiness',
  '@id': `${url}#localbusiness`,
  name: 'eGhișeul.ro — Servicii Cazier Judiciar pentru [City]',
  description: '...',
  areaServed: {
    '@type': 'City',
    name: 'Cluj-Napoca',
    containedInPlace: { '@type': 'AdministrativeArea', name: 'Cluj' }
  },
  geo: { '@type': 'GeoCoordinates', latitude: 46.7712, longitude: 23.6236 },
  // ... etc
}
```

---

## Internal Linking

### Cross-link între city pages (CRITICĂ — Google parses asta)

Footer pe fiecare city page: „Cazier judiciar online în alte orașe" cu link-uri la toate Tier 1 + Tier 2.

### Hub page → city pages

Adăugăm pe `/servicii/cazier-judiciar-online/` o secțiune nouă „Servicii Cazier Judiciar pe Orașe" cu cele 10-15 city links.

### Sitemap.ts update

Adăugăm un nou array `HARDCODED_CITY_PAGES` în `src/lib/seo/constants.ts`, iar `sitemap.ts` îl include automat.

---

## Roadmap Execuție

### Faza 1 (1 săptămână, ~30h)

1. **Data collection** (4h): Adresă, telefon, program pentru fiecare IPJ din cele 10 orașe Tier 1 (sursă: politiaromana.ro)
2. **Top employers research** (3h): Pentru fiecare oraș, 5-10 angajatori locali ce cer cazier (LinkedIn / job boards)
3. **City-specific FAQs** (5h): 3-5 întrebări specifice per oraș (50 total)
4. **`src/data/cities.ts`** populated (3h)
5. **`src/app/servicii/cazier-judiciar-online-[city]/page.tsx`** build (8h)
6. **Schema LocalBusiness + GeoCoordinates** integration (3h)
7. **Sitemap update + internal cross-linking** (2h)
8. **Hub page section „Cazier Judiciar pe Orașe"** (2h)

### Faza 2 (1 săptămână, ~15h)

Tier 2 — 5 orașe.

### Faza 3 (opțional, +1 săptămână)

Tier 3 — 5 orașe.

### Faza 4 — București sectoare (opțional, +8h)

București ar putea avea 6 sub-pages per sector (cazier-judiciar-bucuresti-sector-1, etc.) pentru o capturare extrem fină.

---

## Risc / Atenție

- **Google poate vedea conținut prea similar = thin content / doorway pages penalty**. Soluție: ~40% conținut unic per pagină (vs 20-30% competiție). Cifra crucială.
- **NU folosim AI-generated content fără editare umană** — Google penalizează (March 2024 algorithm update).
- **NU adăugăm 50+ city pages pentru orașe minuscule** — diluție autoritate. Stop la 20.
- **Date police station verificate** — date inventate = catastrofă (legal risk).

---

## Așteptări de impact

**Trafic estimat la 6 luni post-launch (toate Tier 1+2 indexate):**
- Queries de tip „cazier judiciar [oraș]" — estimat ~5K impressions/lună/oraș × 15 = 75K impressions/lună
- CTR target 5% = 3,750 clicks/lună adițional
- Ranking target: pos 1-3 pe minim 8 din 15 orașe (competitori slabi)

**Compound effect:** city pages cresc autoritate de domain pentru queries generale → boost și pe pagina principală cazier-judiciar-online.

---

**Decizia de luat:** lansăm Tier 1 imediat după ce terminăm Pagina #2 (cazier-fiscal-online) sau facem cazier-fiscal + city pages în paralel?
