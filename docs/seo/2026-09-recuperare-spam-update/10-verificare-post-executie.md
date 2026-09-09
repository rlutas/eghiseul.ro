# Verificare post-execuție — change set-ul de recuperare (24f07ed → d0997df)

**Data:** 09.09.2026 · **Metodă:** măsurare, nu inspecție vizuală. Build de producție
proaspăt (`.next/BUILD_ID` 10:43, ultimul commit 10:36 — build-ul e mai nou decât codul),
server `next start` real pe `:3111`, fiecare redirect și fiecare URL din sitemap chemat cu
`curl`, JSON-LD parsat cu `json.loads()`, similaritate calculată pe shingles de 6 cuvinte
cu boilerplate-ul scos.

**Scop:** să găsesc ce s-a stricat, nu să confirm ce a mers.

---

## VERDICT

> **DA, se poate pune în producție — dar întâi repară P1 (un rând) și pregătește-te să
> repari P2 imediat după.**

Partea grea a change set-ului — 110 redirecturi, 90 de pagini de locație + 32 de articole
scoase, sitemap, registre — este **corectă la nivel de măsurătoare**: zero lanțuri, zero
bucle, zero rute vii înghițite de wildcard, zero linkuri interne rupte către paginile
șterse, zero pagini KEEP/REWRITE pierdute, 111 URL-uri în sitemap = 111 rute publice reale,
toate 200. `tsc --noEmit` = 0 erori, 1597/1597 teste, `eslint` 0 erori.

Ce trebuie reparat **înainte** de deploy:

| # | Problemă | De ce blochează |
|---|---|---|
| **P1** | `Product` fără `offers` pe `/servicii/rovinieta-online/` | **eroare NOUĂ**, introdusă de acest change set. GSC va raporta „Missing field offers" pe o pagină cu 39 de clicuri. Fix = 1 bloc șters sau 6 rânduri adăugate. |

Ce trebuie reparat **imediat după** (nu blochează deploy-ul, dar sunt regresii de calitate
introduse sau ratate de change set):

| # | Problemă |
|---|---|
| **P2** | Două noduri `Person` deconectate pentru aceeași persoană, pe toate cele 25 de articole |
| **P3** | `PrivateServiceNotice` lipsește de pe 9 pagini de serviciu vii, deși Faza 0.7 zice „se extinde pe toate" |
| **P4** | Recenziile hardcodate cu „acum 4 zile" (culese 16.06) au rămas neatinse — item explicit din Faza 0.1 |
| **P5** | Trei surse de adevăr paralele pentru rating/număr de recenzii, deși regula nouă spune că e una |

---

## 1. Tabelul verificărilor

Legendă: **PASS** = măsurat și curat · **FAIL** = măsurat și rupt · **PARȚIAL** = făcut pe
jumătate · **INFO** = măsurat, nu e defect.

### 1.1 Redirecturi

| # | Verificare | Rezultat | Dovada |
|---|---|---|---|
| R1 | Toate cele 110 `source`→`destination` extrase din `next.config.ts` | INFO | 48 orașe + 1 wildcard județe + 32 articole = **81 noi**; 29 preexistente |
| R2 | Surse duplicate în listă | **PASS** | 0 |
| R3 | **Lanțuri de redirect** (ținta e ea însăși sursă) | **PASS** | 0 din 110, verificat static + prin `curl` |
| R4 | **Bucle** (`source == destination`) | **PASS** | 0 |
| R5 | Ținta fiecărui redirect există ca rută construită | **PASS** | 0 lipsă (110/110; `/services/:slug` verificat prin substituție) |
| R6 | **Redirect care înghite o rută vie** | **PASS** | 0. Cheia: cele 48 de orașe sunt **enumerate explicit**, nu wildcard — de-asta `/servicii/cazier-judiciar-online/persoana-fizica/` și `/persoana-juridica/` răspund **200** |
| R7 | Wildcard-ul `/servicii/extras-de-carte-funciara/:judet/` nu prinde nimic viu | **PASS** | sub ruta aia nu mai există niciun subfolder; `/servicii/extras-de-carte-funciara/` = 200, `/cluj/` și `/bucuresti/` = 308 |
| R8 | Fiecare redirect ajunge la 200 într-un **singur** hop | **PARȚIAL** | 96/110 single-hop. **14 fac 2 hopuri**, toate **preexistente** (vezi P8) |
| R9 | Toate cele 93 de pagini `CONSOLIDATE` din CSV chiar redirectează | **PASS** cu excepție documentată | 82/93 dau 308. Cele 11 care dau 200 sunt **exact** paginile păstrate prin decizie de owner (9 cadastrale + cazier PF/PJ) |
| R10 | Ținta reală == ținta planificată în `decizii-per-pagina.csv` | **PASS** | **0 mismatch** pe toate cele 82 |
| R11 | Sursele redirecturilor sunt genuin dispărute din app | **PASS** | 32 `page.tsx` de articol + `[oras]/page.tsx` + `[judet]/page.tsx` șterse; niciuna nu mai apare în `app-path-routes-manifest.json` |
| R12 | `permanent: true` → cod HTTP | INFO | Next emite **308**, nu 301. Google le tratează identic; nu e defect |

### 1.2 Orfane și linkuri moarte

| # | Verificare | Rezultat | Dovada |
|---|---|---|---|
| O1 | **Linkuri interne din `src/` către paginile șterse** | **PASS** | **0** referințe către vreunul din cele 90 de URL-uri de locație sau 32 de articole |
| O2 | Linkuri interne către URL-uri care redirectează (hop inutil) | **PASS**\* | 1: `src/app/not-found.tsx:13` → `/servicii/extras-carte-funciara` (preexistent) |
| O3 | Linkuri interne complet moarte (404) | **FAIL (preexistent)** | 9 destinații: `/termeni`, `/confidentialitate`, `/terms`, `/privacy`, `/login`, `/register`, `/forgot-password`, `/account/settings`, `/comanda` (în `robots.ts`). Toate confirmate 404 prin `curl`. Vezi P6 |
| O4 | Intrare de sitemap către pagină ștearsă/redirectată | **PASS** | **111/111 URL-uri din sitemap dau 200**, niciun 3xx, niciun 404 |
| O5 | Pagină vie lipsă din sitemap | **PASS** | 111 rute publice statice ↔ 111 URL-uri în sitemap, **potrivire 1:1, diferență zero** |
| O6 | `src/config/articles.ts` — intrări fără rută | **PASS** | 25 intrări, 25 rute, 0 dangling, 0 duplicate. Înainte: 57 |
| O7 | `HARDCODED_ARTICLE_SLUGS` sincron cu `articles.ts` | **PASS** | 25 = 25, diferență simetrică **goală** în ambele sensuri |
| O8 | `last-modified.ts` — chei fără rută / articole fără dată | **PASS** | 25 chei, 0 orfane, 0 articole fără dată |
| O9 | `HARDCODED_SERVICE_SLUGS` / `_CALCULATOR_` / `_TOOL_` / `_SUBROUTE_` | **PASS** | 29 / 40 / 1 / 2 — toate au rută reală |
| O10 | Registre externe (`public/llms.txt`) | **FAIL** | **Nu a fost actualizat.** Mai listează 2 articole consolidate: `/cazier-judiciar-online-gratuit/` și `/certificat-de-nastere-din-strainatate/`, ambele 308. Vezi P9 |

### 1.3 Ce trebuia să supraviețuiască

| # | Verificare | Rezultat | Dovada |
|---|---|---|---|
| K1 | KEEP (37) + KEEP+FIX (29) + REWRITE (32) = 98 pagini, toate încă rute vii | **PASS** | **0 dispărute** |
| K2 | Toate 98 încă în sitemap | **PASS** | **0 lipsă** |
| K3 | Cele 11 pagini păstrate prin decizie de owner | **PASS** | Toate 11 = 200 + în sitemap: `copie-releveu`, `copie-arhiva-ocpi`, `copie-inventar-coordonate`, `copie-contract-vanzare`, `copie-intabulare`, `copie-plan-cadastral`, `copie-plan-incadrare`, `certificat-detineri-imobile`, `extras-cf-colectiv`, + `cazier-judiciar-online/persoana-fizica` și `/persoana-juridica` |
| K4 | URL-uri cu trafic GSC (3 luni) care acum dau 404 | **PASS** | 6 URL-uri, **0 clicuri**, 29 expuneri cumulate. Vezi P10 |
| K5 | Clicuri post-update pierdute prin consolidare | **PASS** | **4 clicuri** în total (23.08–08.09) pe toate cele 122 de URL-uri scoase |

### 1.4 Schema

| # | Verificare | Rezultat | Dovada |
|---|---|---|---|
| S1 | Tot JSON-LD-ul parsează | **PASS** | 121 pagini cu JSON-LD, **0 erori de parsare** |
| S2 | `@id` dangling | **PASS** | 0 referințe nerezolvate, 0 cross-page |
| S3 | **`aggregateRating` / `ratingValue` / `reviewCount` / `Review`** | **PASS** | **ZERO apariții** în tot build-ul. Înainte: 32 fișiere sursă |
| S4 | Nodul `Person` fabricat („Departamentul Juridic") | **PASS** | 0 apariții; singura mențiune rămasă e comentariul explicativ din `src/lib/seo/author.ts:6` |
| S5 | `Person` real, cu pagină care există | **PASS** | 52 noduri, o singură persoană, `url` = `/despre-noi/raul-lutas/`, rută reală |
| S6 | `Person` — un singur nod coerent per pagină | **FAIL** | **2 noduri deconectate** pe fiecare articol. Vezi P2 |
| S7 | `Product` bine format fără rating | **FAIL** | **1/43 invalid**: `/servicii/rovinieta-online/` — `Product` fără `offers`. Vezi P1 |
| S8 | `BreadcrumbList` — poziții contigue, `name` + `item` | **PASS** | 118 noduri, 0 erori de structură |
| S9 | Breadcrumb care indică o rută inexistentă / o sursă de redirect | **INFO** | 12 cazuri, toate pe paginile-fantomă din P7 (inaccesibile în producție) |
| S10 | `datePublished` de umplutură `2024-01-01` | **PASS** | 0 apariții |
| S11 | `dateModified` în viitor / < `datePublished` | **PASS** | 0 |
| S12 | `dateModified` real per calculator | **PARȚIAL** | 5 valori distincte pe 40 de pagini, dar **31/40 tot pe `2026-06-22`**. Vezi P11 |
| S13 | `<meta name="keywords">` | **PASS** | **0 apariții** în build și **0** în `src/`. Înainte: 231/233 pagini |
| S14 | Afirmații fabricate în schema (premii, „nr. 1", rating) | **PASS** | 22 hituri brute, toate verificate manual: numere de lege („Legea nr. 118/2019"), praguri fiscale („4.860 lei"), formulări factuale („cel mai scurt termen"). **0 auto-laudative** |
| S15 | `FAQPage` — amprentă de duplicat | **INFO / risc** | 99 pagini, 844 întrebări, **30 de întrebări identice pe 2+ pagini**; „Cât durează eliberarea?" pe **18 pagini**, „Am nevoie de cont ANCPI?" pe **14**. Vezi P12 |

### 1.5 Paginile noi

| # | Verificare | `/despre-noi/` | `/despre-noi/raul-lutas/` |
|---|---|---|---|
| N1 | HTTP | **200** | **200** |
| N2 | Canonical self, cu slash | ✅ `https://eghiseul.ro/despre-noi/` | ✅ `.../raul-lutas/` |
| N3 | robots | `index, follow` | `index, follow` |
| N4 | Title / lungime | 70 car. — **peste 65** | 55 car. ✅ |
| N5 | Meta description / lungime | **169 car. — se trunchiază** | 156 car. ✅ |
| N6 | H1 | 1 ✅ „Despre noi" | 1 ✅ „Luțaș Raul Cătălin" |
| N7 | H2 | 6 | 4 |
| N8 | OG complet (title/desc/url/image/type) | ✅ | ✅ (`og:type=website`, ar fi `profile`) |
| N9 | Breadcrumb în schema | ✅ 2 nivele | ✅ 3 nivele |
| N10 | Schema `Person` | ✅ legat de `#organization` | ✅ + `CollegeOrUniversity` |
| N11 | În sitemap | ✅ prioritate 0.6 | ✅ prioritate 0.5 |
| N12 | Linkuri **primite** | **125 pagini** (footer sitewide) | **27** (25 articole + despre-noi + self) |
| N13 | Linkuri **emise** interne | 61 | 60 |
| N14 | Cuvinte (incl. shell) | 860 | **616 — sub pragul de 800 pe care planul îl folosește ca definiție a subțirimii** |

### 1.6 Regresie generală

| # | Verificare | Rezultat | Dovada |
|---|---|---|---|
| G1 | Canonical lipsă | **PASS** | 0 |
| G2 | Canonical ≠ URL propriu | **PASS** | 0 |
| G3 | Title lipsă / duplicat | **PASS** | 0 / 0 grupuri |
| G4 | Title > 65 caractere | **INFO (preexistent)** | 71 pagini; sufixul fix ` \| eGhiseul.ro` (14 car.) e cauza sistemică. Max: 99 car. pe `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/` |
| G5 | Meta description lipsă / duplicată | **PASS** | 0 / 0 |
| G6 | Meta description > 165 car. | **INFO (preexistent)** | 62 pagini; max 350 car. pe `/ancpi-nu-functioneaza/` |
| G7 | 0 sau >1 `<h1>` | **PASS** | 0 pagini cu 0 H1, 0 pagini cu >1 |
| G8 | `noindex` rămas pe conținut public | **PASS** | **0**. Cele 40 de pagini-oraș pe noindex au dispărut odată cu rutele — nu au rămas reziduuri |
| G9 | OG lipsă | **PASS**\* | `og:image` lipsește pe **1** pagină reală: `/servicii/` (hub-ul comercial). Restul de 12 sunt paginile-fantomă din P7 |
| G10 | `og:url` ≠ canonical | **PASS** | 0 |
| G11 | hreflang | **PASS** | 0 pagini — corect, site monolingv |
| G12 | `alt` lipsă la imagini | **PASS** | 123 „lipsuri" = aceeași iconiță `alt="" aria-hidden="true"` din header. **Fals pozitiv, nimic de reparat** |
| G13 | `robots.txt` | **PASS** | 14 user-agenți, disallow `/admin/ /api/ /comanda/ /auth/ /account/ /orders/`, `Sitemap:` corect, fără `host:` |
| G14 | Trailing slash consistent | **PASS** | `trailingSlash: true`, toate canonicalele cu slash, toate sursele noi de redirect cu slash |
| G15 | **Regresie față de baseline Screaming Frog** (109 URL-uri comune) | **PASS cu 1 observație** | 0 titluri pierdute, 0 meta pierdute, 0 canonicale schimbate, 0 H1 pierdute, 0 `noindex` nou. Singura schimbare: `/blog/` −39% cuvinte (1953→1188) — consecință așteptată a scoaterii a 32 de carduri din listare |
| G16 | URL-uri din baseline care au dispărut | **PASS** | 126, din care 122 explicabile (48 orașe + 42 județe + 32 articole). Restul 4: 2 artefacte `_next/image` (400 în baseline), 1 variantă cu UTM, 1 rută dinamică (`/embed/ancpi/`) care nu produce `.html` static |
| G17 | `410` pe cadavrele de WordPress | **PASS** | `/wp-admin/`, `/wp-content/uploads/*.pdf`, `/wp-includes/*`, `/wp-login.php`, `/xmlrpc.php`, `/wp-content/` → toate **410 + `X-Robots-Tag: noindex`** |
| G18 | `tsc --noEmit` | **PASS** | exit 0 |
| G19 | `npm run test:unit` | **PASS** | **1597/1597**, 113 fișiere |
| G20 | `npm run lint` | **PASS** | 0 erori, 33 warninguri preexistente |

### 1.7 Coeziune internă (Faza 2) — măsurat pe graful real de linkuri

| Pagină | Inlinkuri ÎNAINTE (din plan) | Inlinkuri ACUM | Δ |
|---|---:|---:|---:|
| Cele 9 pagini cadastrale-clonă | ≤3 | **17–19** | ×6 |
| `copie-carte-funciara`, `plan-amplasament-delimitare`, `certificat-sarcini`, `identificare-imobil`, `identificare-imobile-proprietar`, `actualizare-adresa-cf`, `certificat-urbanism-informare` | ≤3 | **125** | ×40 |
| `/calculator/pensie-invaliditate/` (7.201 clicuri) | 2 | **129** | ×64 |
| `/calculator/calculator-indemnizatie-crestere-copil/` (8.877 clicuri) | 3 | **129** | ×43 |
| Mediana pe tot site-ul | 5 | **129** pe paginile comerciale/tool | — |

`RelatedServicesLinks` (linkuri `<a>` reale) e montat pe 17 pagini; `ServiceSwitcher`
(`<select>` + `router.push()`, invizibil pentru crawler) a rămas alături de el, ceea ce e
corect — nu strică nimic, doar nu contează.

**Aceasta e cea mai bine executată parte din tot change set-ul.**

---

## 2. Probleme găsite, în ordinea severității

### P1 — BLOCANT · `Product` fără `offers` pe `/servicii/rovinieta-online/` (regresie NOUĂ)

**Ce s-a întâmplat.** Commit-ul `24f07ed` a scos blocul `aggregateRating` din nodul
`Product` scris de mână în `src/app/servicii/rovinieta-online/page.tsx:49-57`. Nodul
rămas are `name`, `description`, `image`, `url`, `brand` — și **nimic altceva**.

```
src/app/servicii/rovinieta-online/page.tsx:49-57
{
  '@type': 'Product',
  '@id': `${PAGE_URL}#product`,
  name: 'Rovinieta Online',
  description: DESCRIPTION,
  image: `${BASE_URL}/og/default.png`,
  url: PAGE_URL,
  brand: { '@type': 'Brand', name: 'eGhișeul.ro' },
}        ← nici offers, nici review, nici aggregateRating
```

**De ce contează.** `Product` cere cel puțin unul dintre `offers` / `review` /
`aggregateRating`. Fără niciunul, GSC raportează eroare („Missing field `offers`") pe o
pagină cu 39 de clicuri și intenție comercială. Ironia: change set-ul care a fost făcut ca
să curețe schema **introduce** o eroare de schema.

Pe celelalte 42 de noduri `Product` problema nu apare, fiindcă `productNode()` din
`schema.ts:167` a fost rescris exact ca să se apere de asta:
`if (input.offers.length === 0) return null;`. Rovinieta e singura pagină care **nu**
folosește helper-ul, ci scrie nodul de mână — și de-asta a scăpat.

**Fixul (alege unul):**

- **Recomandat, 9 rânduri șterse:** elimină complet nodul `Product` din
  `rovinieta-online/page.tsx`. Pagina păstrează nodul `Service` (rândurile 40-46), care e
  tipul corect pentru ce vindem acolo, iar prețul rovinietei nu e al nostru — e tariful
  CNAIR, variabil pe categorie și durată. Un `Product` fără preț nu spune nimic.
- **Alternativ:** adaugă `offers` cu `AggregateOffer` peste tarifele reale
  (`lowPrice`, `highPrice`, `priceCurrency: 'RON'`, `offerCount`), plus
  `MERCHANT_RETURN_POLICY` și `OFFER_SHIPPING_DETAILS` din `schema.ts`, ca pe restul.

**Cum știu că fixul a mers:** `grep -c '"@type":"Product"'` pe
`.next/server/app/servicii/rovinieta-online.html` → 0 (varianta 1), sau nodul conține
`offers` cu `priceCurrency` (varianta 2). În GSC: „Produse" fără erori după recrawl.

---

### P2 — MARE · Două noduri `Person` deconectate pentru aceeași persoană, pe 25 de articole

**Ce am măsurat.** Fiecare pagină de articol emite **două** noduri `Person` pentru Luțaș
Raul Cătălin:

1. inline, în `Article.author`, **fără `@id`** — `schema.ts:279-285`;
2. standalone, cu `@id: https://eghiseul.ro/#autor-raul-lutas` — `authorNode()` adăugat în
   `buildArticlePageGraph()`, `schema.ts:300`.

Nodul cu `@id` **nu e referit de nimic**: nici `author`, nici `reviewedBy`, nici altceva.
Pentru un parser sunt două entități distincte cu același nume; nodul „bun" (cel cu
`jobTitle` și `worksFor`) e cel care atârnă în gol.

**De ce contează.** Exact opusul obiectivului Fazei 4: în loc de un autor identificabil,
graful spune „acest articol e scris de o persoană anonimă pe nume X" plus „mai există,
separat, o persoană pe nume X care lucrează la eGhișeul.ro".

**Fixul, în `src/lib/seo/schema.ts:279-285`** — înlocuiește nodul inline cu o referință:

```ts
author: input.author ? { '@id': SITE_AUTHOR.schemaId }
                     : { '@id': `${BASE_URL}/#organization` },
```

(`authorNode()` rămâne în `@graph` și devine ținta referinței; importă `SITE_AUTHOR` din
`./author`.) Ține prop-ul `author` doar pentru byline-ul vizibil; dacă vrei să suporți
autori multipli mai târziu, `authorNode()` trebuie să primească persoana ca argument.

**Cum știu că a mers:** pe orice articol, `Article.author` e `{"@id": ".../#autor-raul-lutas"}`
și există exact **un** nod `Person` în graf.

---

### P3 — MARE · `PrivateServiceNotice` lipsește de pe 9 pagini de serviciu vii

Faza 0.7 spune „se extinde pe toate". Măsurat în HTML-ul prerandat (marker: fraza
„poți solicita documentul și direct"), nota **specifică** lipsește de pe:

```
/servicii/cazier-auto-online/                        1.692 clicuri
/servicii/cazier-fiscal-online/                        577 clicuri
/servicii/eliberare-certificat-de-celibat/             488 clicuri
/servicii/extras-multilingv-certificat-nastere/        481 clicuri
/servicii/certificat-de-integritate-comportamentala/    86 clicuri
/servicii/extras-multilingv-certificat-casatorie/       56 clicuri
/servicii/rovinieta-online/                             39 clicuri
/servicii/cazier-judiciar-online/persoana-fizica/        8 clicuri
/servicii/cazier-judiciar-online/persoana-juridica/      1 clic
```

Împreună: **3.428 de clicuri pe 3 luni**, adică majoritatea traficului comercial rămas.
Sunt și fix categoriile cu istoric de respingere la Google Ads („Documente guvernamentale
și servicii oficiale"). Progres real: de la 4 pagini la 21 — dar nu 30.

Nota din footer („serviciu privat de asistență la obținerea de documente") e prezentă pe
toate — e mai slabă și e sub fold.

**Fix:** adaugă `<PrivateServiceNotice institutionLabel=... institutionUrl=... />` sub hero
pe cele 9 pagini, cu instituția corectă per serviciu (IPJ/hub.mai.gov.ro pentru caziere,
ANAF/SPV pentru cazier fiscal, Starea Civilă pentru celibat și extrasele multilingve,
CNAIR/erovinieta.ro pentru rovinietă). Ruta dinamică `/servicii/[slug]` n-o are nici ea,
dar acolo e discutabil dacă merită (paginile ei sunt oricum redirectate).

---

### P4 — MEDIE · Recenziile cu ștampilă de timp care se învechește singură — item din Faza 0.1, **nefăcut**

`src/config/reviews.ts` a rămas **neatins** de change set (`git diff --stat` pe fișier:
gol). Docstring-ul zice „pulled … 2026-06-16"; prima recenzie afișată pe homepage scrie
`when: 'acum 4 zile'`. Azi e 09.09 — deci pagina afirmă că o recenzie de acum ~3 luni e de
acum 4 zile. Toate cele 19 intrări au ștampile relative („acum o săptămână", „acum o lună"
×5, „acum 3 luni" ×5) care sunt toate false acum.

Planul cerea explicit: „ori se leagă de sursă reală, ori se scoate ștampila de timp".

**Fix (cel ieftin):** scoate câmpul `when` din `Review` și din randarea din
`src/components/home/testimonials-section.tsx`. Recenzia rămâne adevărată; doar data
dispare. Alternativ, stochează data absolută (`2026-06-12`) și afișeaz-o ca lună/an.

---

### P5 — MEDIE · Trei surse paralele pentru dovada socială, deși regula spune că e una

`.claude/rules/content-and-seo.md` §3: „Sursa unică pentru dovada socială: `SOCIAL_PROOF`".
În realitate coexistă:

| Sursă | Valoare | Fișier |
|---|---|---|
| `SOCIAL_PROOF` | `4.9 / 464` | `src/lib/seo/constants.ts:248` |
| `GOOGLE_RATING` | `4.9` | `src/config/contact.ts:34` |
| `GOOGLE_REVIEW_COUNT_LABEL` | `'peste 450'` | `src/config/contact.ts:36` |
| docstring `reviews.ts` | `4,9 ★ / 451 recenzii` | `src/config/reviews.ts:4` |
| literal `"4,9"` în `aria-label` | hardcodat | `src/components/home/hero-section.tsx:54` |

Momentan toate spun 4,9, deci nu e o minciună — dar e exact mecanismul care a produs
„4,8/64 pe 29 de pagini" data trecută. `testimonials-section.tsx` chiar amestecă sursele:
ratingul din `GOOGLE_RATING`, numărul din `SOCIAL_PROOF`.

**Fix:** șterge `GOOGLE_RATING` și `GOOGLE_REVIEW_COUNT_LABEL` din `config/contact.ts`,
repointează consumatorii pe `SOCIAL_PROOF`, înlocuiește literalul din `hero-section.tsx:54`
cu `SOCIAL_PROOF.ratingValue`, actualizează docstring-ul din `reviews.ts`.

Tot aici, necuantificat nicăieri: „Peste 200.000 documente procesate" (bara de sus),
„Peste 150.000 de români" și „150k+ clienți mulțumiți" (`testimonials-section.tsx`) sunt
trei cifre diferite pentru același lucru, niciuna cu sursă.

---

### P6 — MEDIE · 9 linkuri interne moarte, dintre care 2 chiar pe ecranele de plată (preexistent)

Confirmate 404 prin `curl`:

| Link mort | Unde |
|---|---|
| `/termeni` | `SignatureStep.tsx:330`, `save-data-modal.tsx:328`, `review-step.tsx:576`, `EmbeddedCheckoutBlock.tsx:89`, `StripeCheckoutForm.tsx:123` |
| `/confidentialitate` | `SignatureStep.tsx:340`, `save-data-modal.tsx:351`, `review-step.tsx:585`, `EmbeddedCheckoutBlock.tsx:93`, `StripeCheckoutForm.tsx:127` |
| `/terms`, `/privacy` | `register-form.tsx:215,219` |
| `/login`, `/register`, `/forgot-password` | `login-form.tsx:98,125`, `register-form.tsx:85,236` |
| `/account/settings` | `header.tsx:265` |
| `/comanda` (fără slash) | `robots.ts:23` — comentariu, inofensiv |

Preexistente (`git log -S` dă `a0ae898`), **dar** ironia e că `review-step.tsx` a fost
atins tocmai de acest change set (fixul „30 de zile" → „30 de minute / 70%", corect și
consistent cu T&C §8, rândurile 113/135/137) — la 9 rânduri deasupra unui link rupt către
chiar acei Termeni. `OrderFlowDisclosure`, adăugat tot acum, linkează corect
`/termeni-si-conditii/` și `/politica-de-confidentialitate/` — deci pe același ecran ai un
link bun și unul rupt către același document.

Zero impact SEO (`/comanda/` e `Disallow` în robots.txt) — impact 100% pe consumator: sunt
casetele de bifat „am citit termenii" de deasupra butonului de plată.

**Fix:** `/termeni` → `/termeni-si-conditii/`, `/confidentialitate` și `/privacy` →
`/politica-de-confidentialitate/`, `/terms` → `/termeni-si-conditii/`, `/login` →
`/auth/login/`, `/register` → `/auth/register/`, `/forgot-password` →
`/auth/forgot-password/`, `/account/settings` → scoate din meniu sau creează pagina.

---

### P7 — MEDIE · 12 pagini-fantomă prerandate din slug-uri de DB (preexistent, dar amplificat)

`generateStaticParams()` din `src/app/servicii/[slug]/page.tsx:91-100` ia **toate**
`services.slug` cu `is_active=true`, deci build-ul produce `.html` complet (title, meta,
canonical self, JSON-LD cu `Product` + `BreadcrumbList`) pentru 12 slug-uri care în
`next.config.ts` **redirectează 308** către URL-ul WP-parity:

`cazier-auto`, `cazier-fiscal`, `cazier-judiciar`, `cazier-judiciar-persoana-fizica`,
`cazier-judiciar-persoana-juridica`, `certificat-casatorie`, `certificat-celibat`,
`certificat-constatator`, `certificat-integritate`, `certificat-nastere`,
`extras-carte-funciara`, `rovinieta`.

În producție sunt inaccesibile (redirectul se aplică înainte de rutare), deci **nu e o
problemă de index**. E o problemă de igienă și de zgomot în orice audit: sunt sursa a 4
grupuri de H1 duplicat, a 12 din cele 13 lipsuri de `og:image`, a 8 din cele 15 pagini
„thin", și a 3 titluri dublu-sufixate (`… | eGhiseul.ro | eGhiseul.ro` pe `cazier-fiscal`,
`certificat-constatator`, `extras-carte-funciara` — `services.meta_title` din DB conține
deja sufixul).

**Fix:** `is_active = false` pe cele 12 slug-uri în tabela `services` (comenzile folosesc
`/comanda/<slug>`, nu `/servicii/<slug>`, deci verifică întâi că nimic din pipeline-ul de
comandă nu citește `is_active` pentru ele) **sau** filtrează în `generateStaticParams()`
cu `DB_SLUGS_WITH_HARDCODED_PAGE`, care există deja și le conține pe toate 12 plus 2.
A doua variantă e mai sigură — o linie:

```ts
return (data || [])
  .filter((s) => !DB_SLUGS_WITH_HARDCODED_PAGE.includes(s.slug))
  .map((s) => ({ slug: s.slug }));
```

---

### P8 — MICĂ · 14 redirecturi fac 2 hopuri din cauza `trailingSlash: true` (preexistent)

`source`-urile fără slash final primesc întâi un 308 de normalizare, apoi 308-ul real:

```
/categorii_servicii/caziere → /categorii_servicii/caziere/ → /servicii/cazier-judiciar-online/
```

Afectate: cele 6 `/categorii_servicii/*`, cele 3 `/category/*`, `/cookies-policy`,
`/services/:slug`, `/services/:slug/order`, `/comanda/certificat-integritate-comportamentala`.
**Toate preexistente — niciunul din cele 81 de redirecturi noi nu are problema asta**
(toate sursele noi au slash final; verificat: 96/110 single-hop, iar cele 14 sunt exact
astea).

**Fix:** adaugă `/` la finalul acelor `source` în `next.config.ts`.

Legat: `/services/cazier-judiciar` → `/servicii/cazier-judiciar/` → (al treilea hop)
`/servicii/cazier-judiciar-online/`. Wildcard-ul `/services/:slug` nu știe de
canonicalizarea slug-urilor de DB. Trafic zero, dar e un lanț real de 3 hopuri.

---

### P9 — MICĂ · `public/llms.txt` nu a fost actualizat

Ultima atingere: commit `01f891f`. Listează 31 de URL-uri, din care **2 acum redirectează**:
`/cazier-judiciar-online-gratuit/` și `/certificat-de-nastere-din-strainatate/` (ambele 308).
Nu listează `/despre-noi/` sau `/despre-noi/raul-lutas/` — exact paginile de E-E-A-T pe
care le-ai construit ca să spună cine ești, absente din fișierul pe care îl citesc
crawlerele AI.

**Fix:** scoate cele 2 URL-uri moarte, adaugă cele 2 pagini noi.

---

### P10 — MICĂ · 6 URL-uri cu expuneri istorice rămân 404

| URL | Clicuri | Expuneri |
|---|---:|---:|
| `/tools/alegeri-prezidentiale-2024-prezenta-la-vot/` | 0 | 14 |
| `/blog/page/2/` | 0 | 6 |
| `/category/informatii-utile/page/2/` | 0 | 3 |
| `/categorii_servicii/persoane-fizice/page/2/` | 0 | 3 |
| `/cum-aflam-numarul-carte-functionara-nr-cadastral/` | 0 | 2 |
| `/calculator/impozit-chirie/income-tax/` | 0 | 1 |

Zero clicuri, 29 de expuneri în total — irelevant ca trafic. Dar arată o gaură reală de
acoperire: redirecturile legacy sunt scrise ca **prefix exact**, nu ca wildcard, deci
paginarea WordPress `/page/N/` cade prin ele.

**Fix (2 rânduri, prinde toate variantele de paginare la un loc):**

```ts
{ source: '/category/:path*',            destination: '/blog/',     permanent: true },
{ source: '/categorii_servicii/:path*',  destination: '/servicii/', permanent: true },
```
plasate **după** cele 9 mapări specifice existente. `/cum-aflam-numarul-carte-functionara-nr-cadastral/`
(varianta fără „si-") merită și ea un 301 către pagina reală, care are 4.041 de clicuri.

---

### P11 — MICĂ · `dateModified` per calculator: mecanismul există, datele nu

`CalculatorLayout` a primit prop-ul `dateModified` (bun), dar din 40 de calculatoare
**31 rulează în continuare pe default-ul `2026-06-22`**, adică au în schema și în textul
vizibil („actualizat iunie 2026") aceeași dată globală pe care Faza 0.4 voia s-o elimine.
5 valori distincte, dintre care una acoperă 77,5% din pagini.

Nu e o regresie — e o schimbare **pe jumătate aplicată**. Fie treci data reală acolo unde
chiar ai atins calculatorul, fie recunoaște că data e „ultima verificare a ratelor" și
scoate `lastReviewed`.

Tot acolo: `reviewedBy: { '@id': '#organization' }` + textul vizibil „Verificat de Echipa
eGhișeul.ro". Ai acum un autor real cu pagină; „Echipa" e exact tipul de atribuire vagă pe
care restul change set-ului a eliminat-o.

---

### P12 — MICĂ, dar e chiar amprenta diagnosticată · 30 de întrebări FAQ identice pe pagini diferite

99 de pagini emit `FAQPage`, cu 844 de întrebări. 30 de texte de întrebare apar identic pe
2+ pagini:

| Pagini | Întrebare |
|---:|---|
| 18 | „Cât durează eliberarea?" |
| 14 | „Am nevoie de cont ANCPI?" |
| 9 | „Cum primesc documentul?" |
| 7 | „Nu știu numărul cadastral. Ce fac?" |

Două lucruri:

1. **Google a retras rich results-urile FAQ pentru toate site-urile pe 7 mai 2026.** Cele
   844 de întrebări marcate nu mai produc niciun rezultat îmbogățit. Ce rămâne din ele e
   exclusiv semnal de duplicat — fix ce a fost diagnosticat drept cauză.
2. „Cât durează **eliberarea**?" pe 18 pagini contrazice regula §7 din
   `.claude/rules/content-and-seo.md` („noi obținem, instituția eliberează"). Verbul a fost
   corectat în paragrafe, dar a rămas în întrebările FAQ.

**Fix:** rescrie cele 30 de întrebări duplicate cu formularea specifică serviciului („Cât
durează obținerea unui extras de carte funciară?"), sau elimină FAQ-ul de pe paginile unde
e umplutură de șablon. Nu recomand scoaterea marcajului `FAQPage` în sine.

---

### P13 — OBSERVAȚIE · Soft 404 pe `/servicii/<orice>/` (preexistent, confirmat în producție)

```
curl https://eghiseul.ro/servicii/aaaa-nu-exista/   → 200
curl https://eghiseul.ro/pagina-care-nu-exista/     → 404
```

Pagina răspunde **200** cu `<title>Serviciu indisponibil</title>`, **canonical către
homepage**, **zero `<h1>`** și **două `<meta name="robots">` contradictorii**
(`index, follow` din layout + `noindex`). `next start` chiar a scris în cache
`.next/server/app/servicii/aaaa-nu-exista.html` — deci pagina-fantomă se și memorează.

Nu e introdus de change set (`generateMetadata` cheamă `notFound()` corect la
`page.tsx:202`; statusul rămâne 200). Impactul de index e mic (`noindex` câștigă), dar în
GSC ăsta e exact profilul „Soft 404" și e un spațiu de URL-uri nelimitat sub cel mai
comercial director al site-ului. Merită investigat separat — de ce `notFound()` nu produce
404 pe ruta asta.

---

### P14 — OBSERVAȚIE · `next/link` cu URL absolut în byline

`SITE_AUTHOR.url` întoarce `https://eghiseul.ro/despre-noi/raul-lutas/`, iar
`article-layout.tsx:117` îl pune direct în `<Link href>`. Rezultatul e `<a
href="https://eghiseul.ro/...">` — link crawlabil valid (l-am numărat: 27 inlinkuri către
pagina de autor), dar pentru Next.js e o navigare externă: fără prefetch, cu reîncărcare
completă de pagină.

**Fix:** folosește `SITE_AUTHOR.path` în `<Link href>` și păstrează `.url` pentru schema.

---

### P15 — OBSERVAȚIE · Ecranele publice de comandă necuprinse de `OrderFlowDisclosure`

Componenta e montată corect pe `comanda/[service]`, `comanda/checkout/[orderId]` și
`comanda/success/[orderId]`. Nu e pe `/completare/[token]` și `/reincarca-poza/[token]` —
ecranele din fluxul de comenzi telefonice, unde clientul introduce date personale și
încarcă acte, deschise dintr-un link primit prin SMS/email.

---

## 3. Ce a rămas nefăcut

### 3.1 Cunoscut deschis, confirmat prin măsurare

**Cele 32 de pagini REWRITE — 0 făcute.** Excepția e perechea `extras-multilingv-*` (D3),
livrată în `3a28be1` — dar **nu a trecut testul din propria regulă**:

| Măsură (shingles-6, boilerplate scos) | Valoare |
|---|---|
| Jaccard `nastere` ↔ `casatorie` | **0,549** |
| Jaccard cu numele proprii mascate | **0,629** |

Mascarea **crește** similaritatea, la fel ca înainte. Adică singurul lucru care le
diferențiază e cuvântul „naștere" vs „căsătorie" — exact criteriul de nepublicare din
`.claude/rules/content-and-seo.md` §1. Rescrierea a schimbat text, nu a adăugat informație
care nu poate exista pe cealaltă pagină. **D3 trebuie considerată nefăcută.**

Restul de 31, în ordinea clicurilor pe 3 luni:

| Clicuri | Pagină | Cuvinte main |
|---:|---|---:|
| 32.589 | `/tools/verificare-rovinieta-online` | 871 |
| 4.567 | `/` (homepage) | 2.080 |
| 4.041 | `/cum-aflam-numarul-carte-functionara-si-nr-cadastral` | 1.585 |
| 1.714 | `/servicii/eliberare-certificat-de-nastere` | 2.973 |
| 1.692 | `/servicii/cazier-auto-online` | 2.969 |
| 1.549 | `/servicii/extras-de-carte-funciara` | 3.777 |
| 1.463 | `/amenda-rovinieta-2025-tarife-plata-online-ghid-complet` | 849 |
| 925 | `/ghid-complet-certificat-de-integritate-comportamentala` | 685 |
| 822 | `/informatii-cazier-auto-online` | 780 |
| 577 | `/servicii/cazier-fiscal-online` | 2.633 |
| … | (restul de 21, în `research/data/decizii-per-pagina.csv`) | |

**Cele 9 clone cadastrale — nediferențiate.** Măsurat pe build:

| Măsură | Valoare |
|---|---|
| Perechi cu Jaccard ≥0,25 (13 pagini cadastrale) | **78 din 78** |
| Jaccard median | 0,303 (nivelul de boilerplate comun al site-ului: 0,32 brut) |
| Perechea cea mai apropiată | `copie-plan-incadrare` ↔ `plan-amplasament-delimitare` = **0,382** |
| Interval de cuvinte pe 13 pagini | 2.797 – 3.021 (**8% dispersie** = semnătură de șablon) |

Pe tot site-ul, pe pagini accesibile: **123 de perechi cu Jaccard ≥0,25** (planul măsurase
83 înainte, cu altă metodă și incluzând paginile de locație). Din primele 25, **24 sunt
pagini de serviciu**. Amprenta comercială de șablon **nu a fost redusă** — au fost tăiate
paginile de locație și articolele satelit, adică vecinătățile ei, nu ea.

### 3.2 Deschis și nesemnalat până acum

| Din plan | Stare | Unde |
|---|---|---|
| **Faza 0.1** — recenzii fără ștampilă auto-învechitoare | **NEFĂCUT** | P4 |
| **Faza 0.1** — o singură sursă de adevăr | **PARȚIAL** — 3 surse paralele | P5 |
| **Faza 0.4** — `dateModified` real per calculator | **PARȚIAL** — 31/40 pe data veche | P11 |
| **Faza 0.4** — dată de actualizare vizibilă în pagină | **PARȚIAL** — pe calculatoare afișează data veche | P11 |
| **Faza 0.5** — linkurile moarte către IPJ-uri | **N/A** — au dispărut odată cu paginile de locație; 0 referințe `politiaromana.ro` rămase în `src/` | — |
| **Faza 0.7** — `PrivateServiceNotice` „pe toate" | **PARȚIAL** — 21/30 | P3 |
| **Faza 0.8** — „30 de zile fără întrebări" | **FĂCUT**, consistent cu T&C §8 | — |
| **Faza 0.8** — Facebook Pixel în politica de cookies | **FĂCUT** | — |
| **Faza 3.2** — cele 27 de județe rămase șablon | **N/A** — consolidate, nu rescrise (decizia D4) | — |
| **KEEP+FIX (29 pagini)** | **0 executate** | `/contact` (207 cuvinte pe 190 clicuri, fără date de firmă), `/tools` (514 cuvinte, 1 clic, **2 inlinkuri** — „ori index real, ori noindex"), `/taxa-cazier-judiciar` (62,9k expuneri pe 847 cuvinte), 14 calculatoare cu scor mare de tipare, `/servicii` (hub-ul comercial) |
| **Faza 5 pct. 5** — bifează Crawl Analysis la următorul crawl SF | **de făcut la crawl** | coloanele de near-duplicate și Link Score au fost goale și la ăsta |

---

## 4. Lucruri noi, nesemnalate de nimeni până acum

1. **Change set-ul introduce o eroare de schema** (P1) — un `Product` fără `offers` pe
   rovinietă. Singura regresie funcțională reală din tot pachetul.
2. **Nodul `Person` „bun" nu e legat de nimic** (P2). Pagina de autor, schema `Person` și
   byline-ul vizibil există toate — dar graful nu le leagă. Toată Faza 4 stă pe asta.
3. **`productNode()` s-a schimbat tăcut de la „doar cu rating" la „doar cu offers"**
   (`schema.ts:167`). Consecință nediscutată: sunt acum **43 de noduri `Product`** în
   build, adică marcaj de produs comercial pe pagini care înainte n-aveau niciun `Product`.
   Pentru un serviciu prestat, `Product` e o alegere discutabilă — merită o decizie
   explicită, nu un efect secundar al ștergerii ratingului.
4. **12 pagini-fantomă prerandate din DB** (P7), cu tot cu title dublu-sufixat. Nimeni nu
   le-a numărat până acum fiindcă în producție redirectează.
5. **Soft 404 pe tot spațiul `/servicii/<orice>/`** (P13), confirmat pe producție, cu două
   directive `robots` contradictorii pe aceeași pagină.
6. **99 de pagini cu `FAQPage` care nu mai produc nimic** de la 7 mai 2026, dintre care 30
   de întrebări literal identice pe 2+ pagini (P12) — amprentă pură, beneficiu zero.
7. **Verbul „eliberarea" a supraviețuit în 18 întrebări FAQ**, deși a fost corectat în
   corpul textului (P12).
8. **`OrderFlowDisclosure` a fost montat pe pagini pe care Googlebot nu are voie să intre**
   (`Disallow: /comanda/`). Corect ca protecția consumatorului, dar zero efect SEO — merită
   spus explicit, ca să nu fie contabilizat drept câștig de încredere în ochii Google.
9. **Pe același ecran de plată coexistă un link corect și unul rupt către aceiași Termeni**
   (P6): `OrderFlowDisclosure` → `/termeni-si-conditii/` (200), checkboxul de deasupra →
   `/termeni` (404).
10. **`/tools/` are 2 inlinkuri și 514 cuvinte**, dar găzduiește `/tools/verificare-rovinieta-online/`
    — pagina cu **32.589 de clicuri, cea mai mare de pe site**. Faza 2 a legat
    calculatoarele între ele și serviciile între ele, dar a lăsat hub-ul de tools izolat.
11. **`/despre-noi/raul-lutas/` are 616 cuvinte** — sub pragul de 800 pe care planul îl
    folosește ca definiție a subțirimii („37 de pagini sub 800 de cuvinte" e cauza #3 din
    diagnostic). Pagina care trebuie să demonstreze E-E-A-T e sub propriul standard.
12. **Redirecturile legacy nu prind paginarea WordPress** `/page/N/` (P10) — gaură
    structurală, nu doar 3 URL-uri.

---

## 5. Verificări care au trecut și merită spuse ca atare

Ca să fie clar unde **nu** e nevoie de efort:

- **Redirecturile sunt corecte.** 110 verificate una câte una pe un server real: 0 lanțuri,
  0 bucle, 0 rute vii înghițite, 0 ținte lipsă, 0 mismatch față de planul din CSV. Decizia
  de a enumera cele 48 de orașe în loc de wildcard a fost corectă și a salvat
  `/persoana-fizica/` și `/persoana-juridica/`.
- **Registrele sunt perfect sincrone.** 57 → 25 articole în trei fișiere simultan, fără
  niciun rest.
- **Sitemap-ul e chiar curatoriat.** 111 = 111, potrivire exactă cu rutele publice, toate
  200.
- **Nu s-a pierdut nimic din ce trebuia păstrat.** 98 de pagini KEEP/KEEP+FIX/REWRITE,
  toate vii, toate în sitemap. 4 clicuri post-update pierdute în total.
- **`aggregateRating` a dispărut complet.** 0 apariții în 121 de pagini cu JSON-LD.
- **`<meta name="keywords">` a dispărut complet.** De la 231/233 la 0.
- **410-urile de WordPress funcționează** cu `X-Robots-Tag: noindex`.
- **Coeziunea internă e reparată real**, cu cifre: ×6 până la ×64 pe paginile care aveau
  nevoie.
- **Build verde**: `tsc` 0 erori, 1597/1597 teste, lint 0 erori — claim-ul din plan e
  adevărat.

---

## 6. Ordinea recomandată

1. **Înainte de push:** P1 (5 minute).
2. **Același push sau imediat după:** P2, P3, P6, P9 — toate mici, toate cu fix exact mai sus.
3. **Săptămâna asta:** P4, P5, P10, P11, P14.
4. **Investigație separată:** P13 (soft 404) și P7 (cele 12 slug-uri din DB).
5. **Faza 3, cum era planificată:** cele 32 REWRITE și diferențierea celor 9 cadastrale —
   inclusiv **refacerea D3**, care nu a trecut testul de mascare.

Măsurătoarea de urmărit rămâne cea din plan: **expunerile pe clusterul `/servicii/`**,
zilnic, cu ANCPI exclus. Adaugă un al doilea indicator, ieftin și local: rulează periodic
numărul de **perechi cu Jaccard ≥0,25** pe build (azi: **123**). Dacă Faza 3 chiar
funcționează, cifra aia scade; dacă scad doar clicurile, n-ai schimbat nimic din cauză.
