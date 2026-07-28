# Plan de acțiune — audit SEO 28.07.2026

Ordonat după **impact pe bani / efort**, nu după severitatea teoretică. Fiecare item are dovada în
[`FULL-AUDIT-REPORT.md`](FULL-AUDIT-REPORT.md) și fișierele din `findings/`.

---

## Faza 1 — fixuri de cod, ieftine (câteva ore, un singur deploy)

| # | Ce | Unde | Efect așteptat |
|---|---|---|---|
| 1.1 | Adaugă `'rovinieta'` în `DB_SLUGS_WITH_HARDCODED_PAGE` + redirect 308 `/servicii/rovinieta` → `/servicii/rovinieta-online/` | `src/lib/seo/constants.ts:72`, `next.config.ts` | elimină duplicatul și titlul „Online Online" |
| 1.2 | Unifică programul de lucru | `footer.tsx:188` vs `contact/page.tsx:110-112` | clientul nu mai sună degeaba vineri după 15:00 |
| 1.3 | Unifică numărul de recenzii afișat | `social-proof-section.tsx:20` („450") vs `testimonials-section.tsx:7` („400+") | consistență |
| 1.4 | `lastmod` în sitemap | `src/app/sitemap.ts` | Google poate prioritiza recrawl-ul — ajută direct la problema 2.1 |
| 1.5 | `address` + `email` în `organizationNode()` | `src/lib/seo/schema.ts:55-72` | aliniere cu nodul complet de pe homepage |
| 1.6 | Curăță linia `Host:` din robots.txt | `public/robots.txt` sau ruta care îl generează | sintaxă depreciată |

## Faza 2 — canibalizarea (impact direct pe comenzi)

**Problema:** homepage-ul ia ~19.000 de afișări pe „cazier judiciar online", pagina de serviciu 495.

| # | Ce | Note |
|---|---|---|
| 2.1 | Decide strategia: fie homepage-ul trimite clar mai departe (secțiune dedicată + link intern puternic cu anchor exact), fie pagina de serviciu primește semnalele care lipsesc (linkuri interne din articolele care rankează, titlu/H1 mai apropiat de interogare) | Nu se rezolvă cu canonical — sunt pagini diferite, cu intenții diferite |
| 2.2 | Verifică același tipar pe celelalte servicii comerciale (extras CF, constatator, certificat naștere) cu `gsc_query.py --dimensions query,page` | Datele sunt deja accesibile, e o interogare |
| 2.3 | Re-măsoară după 3-4 săptămâni | Metrica: afișări pe pagina de serviciu vs homepage |

## Faza 3 — cele ~40 de pagini-oraș neindexate

**Decizie de business, nu doar tehnică.** Ai 3 opțiuni, în ordinea efortului:

| Opțiune | Ce implică | Când o alegi |
|---|---|---|
| **A. Îmbogățire** | date locale reale per oraș (adresă/program IPJ local, timp mediu de eliberare pe județ, particularități) — nu variații de text | dacă orașele contează comercial și ai datele |
| **B. Consolidare** | grupare regională (Moldova/Ardeal/Muntenia) în loc de 50 de pagini aproape identice | cel mai realist raport efort/rezultat |
| **C. `noindex` temporar** | pe orașele fără trafic, până sunt îmbogățite | oprește diluarea percepției de calitate imediat |

Recomandarea mea: **C acum** (oprește sângerarea, 30 min de lucru) **+ B pe termen mediu**. Contra-argument
onest la A: paginile de județ CF sunt indexate 94% cu conținut și mai scurt, deci diferența nu e volumul —
e că un județ e o entitate cu date proprii, iar „cazier judiciar în Turda" e practic același serviciu ca în
Cluj-Napoca, fără nimic local de spus.

Verifică separat de ce **București** n-a fost crawlat niciodată — o pagină în sitemap, cu 200, necrawlată luni
de zile e anormal chiar și pentru conținut slab. Merită un `gsc_inspect` + cerere de indexare manuală.

## Faza 4 — E-E-A-T (efort mediu, efect pe încredere și pe AI)

| # | Ce |
|---|---|
| 4.1 | Pagină `/despre-noi/`: firma, echipa, avocatul colaborator **cu nume și număr de Barou**, foto, ani de experiență |
| 4.2 | Nume + credențiale ale avocatului pe paginile de servicii (înlocuiește „înscris în Barou" anonim) |
| 4.3 | `author` real pe articole (persoană, nu Organization) |
| 4.4 | `sameAs` extins în Organization: profil Google, plus rețelele pe care le folosim efectiv |

## Faza 5 — performanță (efect pe CWV + conversie)

| # | Ce | Unde |
|---|---|---|
| 5.1 | Critical CSS — 751 ms render-blocking | ⚠️ **testat 28.07: `experimental.optimizeCss` NU face nimic** (build trece, dar 0 taguri `<style>` inline în HTML). Cere dependența `beasties`. CSS-ul e 211 KB brut / **33 KB gzip**, un singur bundle. De testat pe preview, nu pe main. |
| 5.2 | Code-split `QueryProvider` / `Header` — ~450 ms JS neutilizat | `src/app/layout.tsx` |
| 5.3 | Banner cookie pe `position:fixed` + animație pe `transform/opacity` | `src/components/consent/cookie-consent.tsx` |
| ~~5.4~~ | ✅ **FĂCUT 28.07** — `prefetch={false}` pe linkurile de footer. | |
| ~~5.5~~ | ~~Investighează cauza TTFB~~ | **REZOLVAT 28.07** — cauza: `src/proxy.ts` (Next 16 a redenumit `middleware.ts` → `proxy.ts`, de-aia n-a fost găsit la audit) rula `supabase.auth.getUser()` pe FIECARE cerere, inclusiv pagini publice. Matcher restrâns la zonele cu sesiune. Măsurat live, mediana din 5 cereri după încălzire: homepage 237→180 ms (−24%), /contact/ 233→179 ms (−23%), calculator 198→175 ms (−12%), pagină serviciu 207→177 ms (−15%). Confirmare finală în CrUX peste ~3 săptămâni. |

## Faza 6 — AI search (ieftin, efect pe citări)

| # | Ce |
|---|---|
| ~~6.1~~ | ✅ **FĂCUT 28.07** — 11 ghiduri + 3 instrumente (inclusiv tool-ul de rovinietă, 11.309 clicuri/lună, care lipsea complet). |
| 6.2 | Rescrie intro-ul `/taxa-cazier-judiciar/` ca răspuns direct în primele 40-60 de cuvinte (acum are ~65 de cuvinte de intro generic) |
| ~~6.3~~ | ⚠️ **Finding greșit, închis 28.07.** Tool-ul e un **iframe terț** (erovinieta.net) — nu poate fi randat de noi. Conținutul editorial și JSON-LD-ul SUNT server-rendered; bailout-ul din HTML vine de la un widget client-only, nu de la conținut. |
| 6.4 | ✅ **FĂCUT 28.07** — FAQ-urile mutate pe `<details>` server-side: pe homepage 11 din 12 răspunsuri NU existau în HTML (`{open && ...}`), invizibile pentru crawlerele AI. Acum toate sunt în HTML, acordeon exclusiv nativ, zero JS. |

## Faza 7 — securitate (nu SEO, dar a ieșit la audit)

| # | Ce |
|---|---|
| 7.1 | Content-Security-Policy — absent complet. Începe cu `default-src 'self'` + excepții Stripe/S3/GA |
| 7.2 | HSTS: adaugă `includeSubDomains; preload` (verifică întâi toate subdomeniile pe HTTPS) |

## Faza 8 — de verificat manual de Raul (nu pot automatiza)

- **Profilul Google Business**: categorie principală + secundare, poze, Q&A, postări, rata de răspuns la recenzii,
  numărul real actual de recenzii (pentru actualizarea cifrei din schema).
- Dacă short-link-ul din `sameAs` rezolvă corect la profil.

---

## Monitorizare

Auditul ăsta e **baseline-ul**. De acum:

```bash
# lunar — trend CWV pe utilizatori reali
~/.claude/skills/seo/bin/claude-seo run crux_history.py https://eghiseul.ro

# după fiecare deploy important — ce s-a stricat
~/.claude/skills/seo/bin/claude-seo run drift_compare.py <url>

# săptămânal — striking distance
~/.claude/skills/seo/bin/claude-seo run gsc_query.py --days 28 --dimensions query --limit 100
```

Metrici de urmărit, cu valorile de plecare de azi: **8/48 pagini-oraș indexate**, afișări pagină de
serviciu cazier **495** (vs 19.243 homepage pe aceeași interogare), LCP lab **3,5 s**, TTFB CrUX
**266 ms**, CLS **0,02**, sitemap **182 URL-uri**.

### Ce s-a livrat pe 28.07 (rezumat)

Fazele 1 (integral), 3 (paginile-oraș), 5.4 + 5.5 (prefetch + TTFB), 6.1 + 6.4 (llms.txt + FAQ), plus
H1-ul rupt pe 30 de pagini — descoperit în timpul lucrului, nu în audit. Detalii și măsurători:
[`docs/changelog/2026-07-28-audit-seo-si-fixuri.md`](../../changelog/2026-07-28-audit-seo-si-fixuri.md).

Rămase deschise: 2 (canibalizarea — de re-măsurat), 4 (E-E-A-T, la Raul), 5.1-5.3 (CSS/JS/CLS),
6.2, 7 (CSP + HSTS), 8 (verificări manuale GBP).
