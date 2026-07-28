# Context comun — audit eghiseul.ro, 28.07.2026

Date deja culese (NU le re-culege; folosește-le ca punct de plecare).

## Site

Platformă RO de servicii publice digitalizate (cazier judiciar/auto/fiscal, stare civilă, extras carte funciară, certificat constatator ONRC, rovinietă). Next.js 16 pe Vercel, SSR/ISR. Comenzile trec printr-un wizard (`/comanda/*` — blocat în robots, intenționat).

- Sitemap: `https://eghiseul.ro/sitemap.xml` — **223 URL-uri**
- `robots.txt`: permite tot mai puțin `/admin/ /api/ /comanda/ /auth/ /account/ /orders/`; are reguli explicite pentru GPTBot și OAI-SearchBot
- `llms.txt`: există (HTTP 200)

## Search Console (30.06 → 25.07, 28 zile)

Total: **54.539 clicuri · 1.596.526 afișări · CTR 3,42%**

Top pagini (clicuri · afișări · poziție):

| Pagină | Clicuri | Afișări | Poz. |
|---|---|---|---|
| /tools/verificare-rovinieta-online/ | 11.309 | 243.822 | 5,0 |
| /calculator/varsta-pensionare/ | 9.592 | 133.347 | 5,3 |
| /calculator/calculator-impozit-auto/ | 7.195 | 95.794 | 3,8 |
| /calculator/salariu/ | 5.431 | 406.577 | 5,3 |
| /calculator/calculator-indemnizatie-crestere-copil/ | 2.874 | 41.393 | 4,8 |
| /calculator/pensie-invaliditate/ | 2.455 | 37.301 | 5,2 |
| /ancpi-nu-functioneaza/ | 2.231 | 66.408 | 4,7 |
| /tabel-varsta-pensionare-anticipata-femei/ | 1.600 | 46.398 | 6,2 |
| / (homepage) | 1.371 | 55.252 | 7,6 |
| /servicii/eliberare-certificat-de-nastere/ | 633 | 16.728 | 6,8 |
| /servicii/cazier-auto-online/ | 598 | 7.262 | 4,7 |
| /servicii/extras-de-carte-funciara/ | 352 | 10.933 | 8,9 |

**Observația centrală, deja documentată în `docs/seo/2026-07-26-analiza-organic-servicii.md`:** traficul stă pe calculatoare + rovinietă + articole, iar paginile care VÂND (`/servicii/*`) iau firimituri. Nu re-descoperi asta — caută CAUZE și soluții noi.

Striking distance (poz. 4-7, volum mare): `verificare rovinieta` (4,8 · 109.820 afișări), `calculator salariu net` (4,3 · 72.781), `calculator salariu` (5,2 · 30.064), `cazier judiciar online` (7,2 · 15.008).

## Core Web Vitals — CrUX, 25 săptămâni (utilizatori reali)

| Metrică | Trend | Valori |
|---|---|---|
| LCP | −5,6% (bine) | 1172 → 1106 ms |
| INP | −2,5% (stabil) | 141 → 138 ms |
| TTFB | **+19,9%** | 222 → 266 ms |
| FCP | **+8,9%** | 898 → 978 ms |
| CLS | **+300%** | 0,005 → 0,02 |

Toate încă sub pragurile Google. Problema e direcția, nu nivelul.

## Lighthouse (mobil) — /servicii/cazier-auto-online/

Performance 91 · Accessibility 96 · Best practices 100 · SEO 100 (10/10).
LCP lab **3,5 s** (scor 65%): JS nefolosit ~450 ms/67 KiB, render-blocking ~580 ms, legacy JS 14 KiB.
`preload_check`: **50/100** — zero Speculation Rules, imagine LCP fără `fetchpriority="high"`.
Accesibilitate: contrast insuficient + elemente cu text vizibil fără nume accesibil corespunzător.

## Tooling disponibil

Prefix: `~/.claude/skills/seo/bin/claude-seo run <script> <args>`

Credențiale ACTIVE (Tier 1): PageSpeed, CrUX, CrUX History, Search Console API, Indexing API.
Proprietatea GSC e **URL-prefix**: `https://eghiseul.ro/` (NU `sc-domain:`).

Scripturi utile: `gsc_query.py` (`--dimensions query|page|country`, `--days`, `--limit`, `--json`),
`gsc_inspect.py <url>` (indexare/canonic), `pagespeed_check.py`, `crux_history.py`, `preload_check.py`,
`content_quality.py`, `render_page.py --mode auto`, `parse_html.py`, `schema_generate.py`.

## Ce știm deja (nu repeta)

Citește, dacă e relevant pentru tine: `docs/seo/2026-07-26-analiza-organic-servicii.md` (analiza pe bani),
`docs/seo/ANALIZA-MIGRARE-WP-NEXT-2026-07-20.md` (efectul migrării), `docs/seo/2026-07-13-analiza-competitie-cf-constatator.md`.

## Reguli de raportare

- Scrie DOAR fapte verificate cu tool-uri, cu dovada (număr, URL, citat). Fără presupuneri.
- Fiecare finding: severitate (Critical/High/Medium/Low), dovada, fix concret (fișier/linie unde se poate).
- Dacă ceva nu s-a putut verifica, spune explicit „neverificat", nu inventa.
- Constrângere de business: **NU** recomanda formulări care asociază „oficial" cu „documente/acte" (politica Google Ads „governmental documents" ne-a limitat contul deja).
