# Audit tehnic SEO complet — eghiseul.ro

**Data:** 2026-08-07 · Verificat pe site-ul live (curl, DNS, TLS, sitemap, HTML brut), nu pe cod.
Completează [analiza organic](2026-08-07-analiza-organic-fiscal-nastere-topograf.md),
[auditul de concurență](2026-08-07-audit-concurenta-serp-real.md) și
[auditul paginilor de serviciu](2026-08-07-audit-pagini-serviciu.md).

---

## Scor tehnic: 78/100

| Categorie | Stare | Scor |
|---|---|---|
| Crawlability | ✅ pass | 95 |
| Indexabilitate | ✅ pass | 90 |
| Securitate | ⚠️ warn | 70 |
| Structură URL | ⚠️ warn | 65 |
| Mobil | ✅ pass | 85 |
| Core Web Vitals | ❓ neverificat azi | — |
| Date structurate | ✅ pass | 95 |
| Randare JS | ✅ pass | 100 |
| IndexNow | ✅ pass | 90 |

---

## CRITIC — de reparat imediat

### 1. `www.eghiseul.ro` dă eroare de securitate în browser

```
$ curl -I https://www.eghiseul.ro/
* Connected to www.eghiseul.ro (216.150.1.1) port 443
* subjectAltName does not match host name www.eghiseul.ro
cod=000
```

DNS-ul rezolvă către IP-urile Vercel, dar domeniul **nu e adăugat în proiectul Vercel**, deci
certificatul TLS nu îl acoperă. Oricine tastează „www.eghiseul.ro" sau dă clic pe un backlink scris
cu www primește avertisment de securitate de la browser, nu site-ul.

**Fix:** adaugă `www.eghiseul.ro` în Vercel → Domains, cu redirect 308 către `eghiseul.ro`.
Durează două minute și e singura problemă din audit care pierde vizitatori direct.

---

## RIDICAT — de reparat în această săptămână

### 2. Lanțuri de redirect cu 2 hopuri pe toate slug-urile vechi

```
/servicii/cazier-fiscal      → /servicii/cazier-fiscal/      → /servicii/cazier-fiscal-online/
/servicii/extras-carte-funciara → …/                          → /servicii/extras-de-carte-funciara/
/servicii/certificat-nastere → …/                             → /servicii/eliberare-certificat-de-nastere/
```

Cauza: `trailingSlash: true` adaugă un 308 înainte ca regula din `next.config.ts` să apuce să
redirecteze. Fiecare hop diluează din greutatea linkului și încetinește crawl-ul (0,5–0,76 s per
lanț măsurat). Sunt afectate **toate** slug-urile din `DB_SLUGS_WITH_HARDCODED_PAGE`, adică exact
URL-urile vechi de WordPress care au backlinkuri.

**Fix:** scrie `source` cu slash final în regulile de redirect din `next.config.ts`
(`/servicii/cazier-fiscal/` în loc de `/servicii/cazier-fiscal`), astfel încât redirectul să prindă
direct forma canonică.

### 3. Fără Content-Security-Policy

Headere prezente: `strict-transport-security: max-age=63072000`, `x-content-type-options: nosniff`,
`x-frame-options: SAMEORIGIN`, `referrer-policy: strict-origin-when-cross-origin`.
Lipsește CSP complet. HSTS există, dar **fără `includeSubDomains` și fără `preload`**.

Impact SEO direct: mic (HTTPS e semnal ușor). Impact real: pe un site care procesează plăți și
documente de identitate, CSP e o măsură de igienă, nu un moft.

---

## MEDIU — de rezolvat în luna asta

### 4. Imagini OG lipsă pe 18 din 29 de pagini de serviciu
Detaliat în [auditul paginilor de serviciu](2026-08-07-audit-pagini-serviciu.md). Toate folosesc
`/og/default`, deci 18 servicii diferite arată identic când linkul e dat pe WhatsApp sau Facebook.

### 5. 23 din 54 de articole fără imagine featured
Prompturi gata de folosit în
[prompturi imagini](2026-08-07-prompturi-imagini-articole.md).

---

## Ce e BINE — verificat, nu presupus

### robots.txt — cel mai bun lucru din audit
Nu doar corect, ci **declară explicit 14 crawlere AI** și le permite accesul, blocând doar zonele
private (`/admin/`, `/api/`, `/comanda/`, `/auth/`, `/account/`, `/orders/`):

GPTBot · OAI-SearchBot · ChatGPT-User · ClaudeBot · Claude-Web · Claude-SearchBot · Claude-User ·
PerplexityBot · Perplexity-User · Meta-ExternalAgent · MistralAI-User · Google-Extended ·
Applebot-Extended

Decizia de a le **permite** e corectă pentru noi: vizibilitatea în AI Overview și în răspunsurile
ChatGPT/Perplexity e canal de creștere, iar analiza din iulie arăta că suntem deja citați.
Sitemap declarat în robots.txt. ✅

### Indexabilitate
- `<meta name="robots" content="index, follow">` și `<link rel="canonical">` sunt în **HTML-ul
  brut**, nu injectate din JavaScript. Asta contează: din decembrie 2025 Google avertizează explicit
  că un canonical injectat prin JS care diferă de cel din HTML poate fi ignorat.
- Canonical self-referențial corect pe paginile verificate.
- HTTP → HTTPS: 308 ✅ · fără slash → cu slash: 308 consecvent ✅

### Date structurate — în HTML brut, nu prin JS
Pe `/servicii/cazier-fiscal-online/`: 11 perechi `Question`/`Answer`, `Service`, `Product`, `Offer`,
`Organization`, `WebSite`, `WebPage`, `BreadcrumbList`, `OfferShippingDetails`, `Person`,
`AggregateRating`. Randare server-side completă, deci nimic nu depinde de execuția JS.

⚠️ Observație: `src/lib/seo/schema.ts` are comentariul „FAQPage (rich results removed Aug 2023)" și
îl exclude, dar entitățile `Question`/`Answer` ajung oricum în pagină prin `ServiceFAQ`. Merită
reevaluat dacă să emitem explicit `FAQPage` — nu mai dă rich snippet, dar e folosit de AI Overview
și de motoarele LLM la extragerea răspunsurilor.

### Dimensiunea HTML — sub limita Googlebot
Googlebot ia primii 2 MB de HTML. Noi: homepage 498 KB, cazier fiscal 527 KB, **cazier judiciar
749 KB** (cea mai grea), ANCPI 310 KB. Marjă confortabilă, dar cazierul judiciar merită urmărit.

### Sitemap
188 de URL-uri, XML valid, `lastmod` real per articol. Verificat programatic: **0 slug-uri fără
pagină** (adică zero 404-uri trimise la Google) și **0 pagini existente neincluse**.

---

## Core Web Vitals — de re-măsurat

Nu am putut lua date de teren azi: PageSpeed Insights a returnat cotă depășită, iar CrUX cere cheie
API. Ultima măsurătoare cunoscută (memoria proiectului, 4 august): **PSI mobil 57 în laborator, dar
Core Web Vitals de teren PASSED** — deci scorul de laborator sperie, utilizatorii reali sunt bine.
Optimizări deja livrate: supabase-js lazy în header (−52 KB). Rămase din lista veche: Radix lazy,
CSS global, contrast pentru accesibilitate.

**De făcut:** configurează o cheie API Google (CrUX + PSI) ca să putem monitoriza lunar fără să
depindem de cota publică.

---

## Ce am reparat azi

| Reparație | Detaliu |
|---|---|
| 5 linkuri interne rupte | `/login`, `/privacy`, `/terms`, `/termeni`, `/account/settings` → 0 rupte din 121 |
| Eroare de fond pe pagina de cazier fiscal | spunea „lipsă datorii fiscale" (= atestare fiscală), corectat în „fapte sancționate" |
| Dată de modificare inconsistentă pe articolul ANCPI | `DATE_MODIFIED` era 4 august, eticheta afișată zicea 29 iulie |
| Registrul `lastModified` | sincronizat pentru articolul nou + ANCPI + articolul cadastral |

---

## Instrumente refolosibile adăugate

| Script | Ce face |
|---|---|
| `scripts/seo-linkcheck.py` | mapează toate `href="/..."` din `src/app` peste rutele reale, inclusiv segmentele dinamice; trebuie 0 rupte înainte de commit |
| `scripts/seo-ai-tells.py` | scanează conținutul după tiparele „Signs of AI writing" adaptate la română |

Comenzi de verificare tehnică, de rulat lunar:

```bash
curl -sI https://eghiseul.ro/ | grep -iE "strict-transport|content-security|x-frame"
curl -s -o /dev/null -w "%{num_redirects}\n" -L https://eghiseul.ro/servicii/cazier-fiscal
curl -s https://eghiseul.ro/sitemap.xml | grep -c '<loc>'
python3 scripts/seo-linkcheck.py
```
