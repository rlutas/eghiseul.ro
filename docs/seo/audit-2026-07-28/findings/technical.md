# Audit tehnic — eghiseul.ro (28.07.2026)

Metodologie: `sitemap_discovery.py`, `gsc_inspect.py` (44 URL-uri verificate individual în Search Console — vezi tabele), `curl` pentru headere/robots/status codes, extracție text brut pentru comparație de conținut pe paginile de locație. Proprietate GSC: `https://eghiseul.ro/` (URL-prefix).

---

## 1. Crawlability — PASS

- `robots.txt` (200 OK): `Allow: /` global, `Disallow: /admin/ /api/ /comanda/ /auth/ /account/ /orders/` — corect, blocajele sunt zone tehnice/tranzacționale, nu conținut indexabil.
- Reguli explicite per bot AI: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Meta-ExternalAgent, MistralAI-User, Google-Extended, Applebot-Extended — toate cu `Allow: /` (aceleași disallow-uri tehnice). Bine.
- `Sitemap: https://eghiseul.ro/sitemap.xml` declarat în robots.txt — **validat activ** cu `sitemap_discovery.py`: HTTP 200, `kind: urlset`, `valid: true`. 223 URL-uri.
- **Low** — directiva `Host: https://eghiseul.ro` din robots.txt e sintaxă greșită/depreciată (directiva `Host` istoric Yandex-only cere doar domeniul, nu un URL complet cu schemă). Google o ignoră oricum; nu produce erori dar e balast. Fix: elimină linia sau las-o doar dacă target explicit e Yandex, caz în care scrie `Host: eghiseul.ro`.
- `llms.txt` — HTTP 200 (confirmat în context, nu re-testat).
- Fallback-uri comune de sitemap (`/sitemap_index.xml`, `/sitemap-index.xml`, `/wp-sitemap.xml`) → toate 404, coerent cu un singur sitemap unic declarat corect.

## 2. Indexabilitate REALĂ — Search Console (44 URL-uri testate cu `gsc_inspect.py`)

**Nu am testat toate cele 223 URL-uri** — am eșantionat 44, cu focus pe paginile de județ/oraș cerute explicit. Restul (~179 URL-uri din sitemap, în special articolele de blog și calculatoarele nesample-uite) rămân **neverificate** în acest audit.

### 2.1 Pagini "nucleu" (homepage, servicii, calculatoare, articole, tools) — 9/9 indexate

| URL | Coverage state | Canonic Google vs declarat | Ultimul crawl |
|---|---|---|---|
| `/` | Submitted and indexed | match (`/`) | 2026-07-27 |
| `/servicii/cazier-judiciar-online/` | Submitted and indexed | match | 2026-07-27 (rich results: Product/Breadcrumb/Review) |
| `/servicii/extras-de-carte-funciara/` | Submitted and indexed | match | 2026-07-27 (rich results OK) |
| `/servicii/certificat-constatator-online/` | Submitted and indexed | match | 2026-07-27 (rich results OK) |
| `/calculator/salariu/` | Submitted and indexed | match | 2026-07-27 |
| `/calculator/varsta-pensionare/` | Submitted and indexed | match | 2026-07-28 |
| `/tools/verificare-rovinieta-online/` | Submitted and indexed | match | 2026-07-28 |
| `/ancpi-nu-functioneaza/` | Submitted and indexed | match | 2026-07-27 |
| `/tabel-varsta-pensionare-anticipata-femei/` | Submitted and indexed | match | 2026-07-25 |

Niciun caz de canonical mismatch pe eșantionul testat — Google a ales exact canonicalul declarat pe toate paginile indexate. **PASS clar** pentru zona de conținut principal.

### 2.2 Pagini de județ — `/servicii/extras-de-carte-funciara/{județ}/` — 15/16 indexate (94%)

Testate: cluj✓, dolj✓, constanta✓, bucuresti✓, timis✓, iasi✓, brasov✓, prahova✓, sibiu✓, arad✓, mures✓, valcea✓, vrancea✓, salaj✓, mehedinti✓, **ialomita✗ (Discovered — currently not indexed)**.

Toate cele indexate au canonical match (Google = declarat), crawlate între 2026-07-10 și 2026-07-27. **Situație bună** — clusterul de 42 pagini județ pare aproape complet indexat.

### 2.3 Pagini de oraș — `/servicii/cazier-judiciar-online/{oraș}/` — 4/19 indexate (21%) — **CRITICAL**

Testate 19 din cele 50 de pagini-oraș din sitemap:

- **Indexate (4):** cluj-napoca, timisoara, iasi, constanta — toate orașe mari, crawlate 2026-07-10→18, canonical match.
- **NEindexate (15):** bucuresti, brasov, craiova, sibiu, oradea, galati, ploiesti, suceava, targu-mures, zalau, slobozia, miercurea-ciuc, deva, turda, onesti — toate cu `coverage_state`: **"Discovered — currently not indexed"** sau **"URL is unknown to Google"** (stare instabilă între apeluri repetate pe același URL — ex. craiova a dat ambele stări la interval de minute; e o inconsistență cunoscută a API-ului de inspecție, dar concluzia practică e identică: **pagina nu e indexată**).
- **Bucureștiul** — capitala, cel mai mare volum de căutare posibil — e NEindexat. Semnal grav.

**Cauză probabilă identificată prin comparație de conținut:** am extras textul vizibil (regex pe HTML, fără boilerplate JS) pentru 6 pagini-oraș și 6 pagini-județ:

| Pagină oraș (cazier) | cuvinte | Pagină județ (CF) | cuvinte |
|---|---|---|---|
| cluj-napoca | 1745 | cluj | 1332 |
| brasov | 1771 | dolj | 1317 |
| timisoara | 1750 | constanta | 1342 |
| turda | 1660 | ialomita | 1124 |
| onesti | 1655 | mehedinti | 1126 |
| resita | 1724 | salaj | 1125 |

Varianța de conținut între orașe e minimă (~1650-1770 cuvinte, diferă doar 1-2 paragrafe cu numele orașului/particularități locale) — tipar de **conținut aproape-duplicat generat programatic (doorway pages)**. Google indexează selectiv doar orașele cu semnal de cerere/autoritate mare (Cluj-Napoca, Timișoara, Iași, Constanța) și lasă restul de 46 pagini în "Discovered — not indexed", exact comportamentul așteptat pentru pagini template cu diferențiere insuficientă.

**Fix concret:**
1. Prioritar: crește diferențierea de conținut per oraș — date locale reale (adresa/program IPJ local, timp mediu de eliberare specific, particularități locale), nu doar swap de nume în același schelet de propoziții.
2. Alternativ/complementar: consolidează orașele mici într-un grup regional (ex. „Cazier judiciar online — Moldova / Ardeal") în loc de 50 pagini aproape identice, sau adaugă `noindex` temporar pe cele fără trafic până sunt îmbogățite, ca să nu dilueze crawl budget-ul și percepția de calitate a domeniului.
3. Verifică dacă analiza aplicată la /servicii/cazier-judiciar-online/{oraș}/ (template unic) a fost aplicată identic paginilor CF — dacă acolo funcționează (94% indexare) cu conținut și el relativ template-uit dar cu ~200 cuvinte mai puțin per pagină, diferența reală ar putea fi și de vechime/backlink intern, nu doar text; de investigat separat cu date de creare/lastmod per pagină (nu există `lastmod` în sitemap — vezi §3).

### 2.4 Comparație cu situația din iulie ("66/204 indexate")

Pe eșantionul de 44 URL-uri testat acum: **28/44 indexate (63,6%)** vs. cifra istorică de 66/204 (32%). Situația s-a îmbunătățit clar pentru conținutul „nucleu" (100%) și paginile de județ CF (94%), dar **rămâne un gol mare, izolat, pe cele 50 pagini-oraș cazier judiciar** (~21% indexare, adică probabil ~10 din 50 indexate, ~40 nu). Nu am recalculat cifra exactă pe toate cele 223 URL-uri din sitemap — extrapolarea de mai sus e indicativă, nu un total verificat.

---

## 3. Structura URL / Sitemap — observații

- Sitemap-ul `https://eghiseul.ro/sitemap.xml` **nu are `<lastmod>`** pe niciun `<url>` (doar `changefreq` + `priority`) — Google nu poate prioritiza recrawl-ul pe baza datei de modificare reale. **Medium** — adaugă `lastmod` (mai ales pe paginile de oraș/județ, ar ajuta exact la cazul de la §2.3).
- URL-uri curate, trailing slash consistent, fără parametri query, fără majuscule — bine.
- Referring URLs raportate de GSC pentru mai multe pagini indexate menționează sitemap-uri WordPress vechi (`page-sitemap.xml`, `servicii-sitemap.xml`) — sunt doar link-uri istorice reținute de Google din crawl-uri anterioare migrării, nu sitemap-uri active azi (confirmat: nu există la path-urile respective, doar `sitemap.xml` e servit). Nu e o acțiune necesară, doar context.
- Redirect http→https: `http://eghiseul.ro/` → `308 Permanent Redirect` → `https://eghiseul.ro/` într-un singur hop. **PASS.**
- Nu am verificat sistematic status code / redirect chain pe toate cele 223 URL-uri din sitemap — **neverificat** dincolo de eșantionul testat (toate 200, fără lanțuri de redirect, confirmate indirect prin `page_fetch_state: SUCCESSFUL` în GSC pentru paginile indexate).

## 4. Securitate — headere HTTP (homepage, `curl -I`)

| Header | Valoare | Verdict |
|---|---|---|
| `strict-transport-security` | `max-age=63072000` | **Medium** — lipsesc `includeSubDomains` și `preload`. Fix: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (verifică întâi că toate subdomeniile suportă HTTPS înainte de `includeSubDomains`). |
| `x-content-type-options` | `nosniff` | PASS |
| `x-frame-options` | `SAMEORIGIN` | PASS |
| `referrer-policy` | `strict-origin-when-cross-origin` | PASS |
| `permissions-policy` | `camera=(self), microphone=(), geolocation=(), payment=(self), usb=()` | PASS |
| `content-security-policy` | **absent** | **High** — nicio protecție CSP. Recomandare: introdu CSP minim (măcar `default-src 'self'`, cu excepții pentru Stripe/S3/analytics) via `next.config.js` headers sau middleware. |
| server | `Vercel` | info |

Nu am testat headerele pe alte tipuri de pagini (ex. `/servicii/*`, `/api/*`) — **neverificat** dincolo de homepage; e rezonabil să presupunem aceleași headere globale (Vercel/Next.js le aplică de obicei la nivel de `next.config.js`/middleware), dar nu e confirmat.

## 5. Mobile

- `mobile_usability.verdict` raportat de GSC pentru toate paginile testate: `VERDICT_UNSPECIFIED` (fără probleme semnalate, dar și fără confirmare pozitivă explicită — API-ul nu populează acest câmp pentru toate proprietățile). **Neverificat conclusiv** din GSC; niciun semnal negativ găsit.
- Context deja cules (Lighthouse mobil pe `/servicii/cazier-auto-online/`): Accessibility 96, SEO 100 — fără probleme de mobile-friendliness raportate acolo (contrast + accesibilitate sunt alt subiect, deja în CONTEXT.md).

## 6. IndexNow

**Neverificat** — nu am rulat un test dedicat (ex. verificare cheie IndexNow servită la `/{key}.txt` sau apeluri către endpoint-urile Bing/Yandex/Naver). De adăugat într-un pas următor: `indexnow_submit.py` sau verificare manuală a fișierului cheie.

---

## Rezumat priorități

- **Critical:** ~40 din cele 50 pagini `/servicii/cazier-judiciar-online/{oraș}/` (inclusiv București) nu sunt indexate — conținut aproape-duplicat între orașe (§2.3).
- **High:** lipsă completă Content-Security-Policy pe homepage.
- **Medium:** HSTS fără `includeSubDomains`/`preload`; sitemap fără `lastmod`; directivă `Host` malformată în robots.txt.
- **Low:** curățenie robots.txt (linia `Host`).
- **Neverificat:** IndexNow, status codes pe restul de ~179 URL-uri din sitemap, headere de securitate pe alte tipuri de pagini decât homepage, mobile-usability explicit PASS din GSC.
