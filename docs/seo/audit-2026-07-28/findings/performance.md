# Performance — audit 28.07.2026 (extensie CONTEXT.md)

Nu repet CrUX 25-săptămâni / Lighthouse cazier-auto-online (deja în CONTEXT.md). Aici: 4 pagini noi analizate cu `pagespeed_check.py` (mobil+desktop, include CrUX per-URL). **`preload_check.py` pe cele 4 pagini și `crux_history.py` (trend pe săptămâni) NU au fost rulate** — instrucțiune explicită de a opri colectarea și scrie raportul cu ce există. Marcate „neverificat" mai jos.

## Scoruri Lighthouse + CWV lab (mobil / desktop)

| Pagină | Perf mobil | LCP lab mobil | Perf desktop | LCP lab desktop | CrUX LCP p75 (pagină) | CrUX CLS p75 |
|---|---|---|---|---|---|---|
| /calculator/varsta-pensionare/ | 85 | 3976 ms | 100 | 701 ms | 1311 ms good | 0.0 good |
| /tools/verificare-rovinieta-online/ | 88 | 3811 ms | 99 | 701 ms | 1029 ms good | 0.05 good |
| /servicii/eliberare-certificat-de-nastere/ | 90 | 3506 ms | 100 | 701 ms | 1524 ms good | 0.0 good |
| / (homepage) | 85 | 3844 ms | 95 | 800 ms | 1228 ms good | 0.01 good |

Observație structurală: **LCP lab mobil (3.5–4.0s) e mult peste LCP field/CrUX real (1.0–1.5s, toate "good")**. Diferența e simulare Lighthouse (CPU throttling 4x + rețea lentă), nu o problemă reală de infrastructură — dar tot indică unde se pierde timp pe conexiuni slabe reale (o parte din trafic).

## Q1 — De ce TTFB +19,9% / FCP +8,9% în 6 luni

Evidență directă a cauzei în cod **nu a fost verificată** (ar necesita `middleware.ts` + `next.config.ts` revalidate/ISR config — nu au fost citite, colectarea a fost oprită). Ce e verificat:

- TTFB curent per pagină (CrUX, fereastra 29.06–26.07.2026, toate "good", sub 800ms): pensionare 322ms, rovinieta 287ms, naștere 346ms, homepage 320ms. Origin-level din PSI: mobil 327ms / desktop 205ms.
- Gap mobil vs desktop TTFB e sistematic (~100-140ms mai mare pe mobil pe toate cele 4 pagini) — consistent cu RTT mai mare pe rețele mobile (round_trip_time CrUX 105-141ms), nu neapărat cu server-ul.
- **Neverificat**: dacă degradarea de 6 luni vine din ISR revalidate crescut, middleware nou adăugat (ex. `AttributionTracker`, cookie-consent gating), regiune Vercel, sau creștere trafic. Recomandare: rulează `vercel inspect <deployment> --logs` pe un sample de request-uri lente și verifică `src/middleware.ts` (dacă există) pentru orice fetch sincron adăugat recent (git log pe `middleware.ts` / `next.config.ts` din ultimele 6 luni).
- FCP: toate paginile arată **render-blocking CSS** ca literă mare — `814bad035791facf.css` (33KB, Tailwind global bundle) costă 751ms wasted pe mobil / 130-161ms pe desktop, identic pe toate cele 4 pagini (fișier CSS comun din root layout, nu per-pagină). E cel mai probabil contributor verificabil la FCP, nu payload sau TTFB.

## Q2 — Elementul LCP pe paginile de servicii/tools și de ce durează ~3.5s

**LCP e text, nu imagine, pe toate cele 4 pagini** — dovadă: niciuna dintre cele 4 rulări (mobil sau desktop) nu are audit-ul `prioritize-lcp-image` sau vreun `image-delivery-insight` legat de zona hero în `failed_audits`; singurele imagini flagged sunt footer icon (`icon.webp`, 10KB, în footer, ireleveant pentru LCP) și — doar pe homepage desktop — 127KB "image delivery" generic (probabil thumbnail-uri articole/testimoniale, nu hero).

Confirmat în cod: `src/components/home/hero-section.tsx` — coloana stângă e un `<h1>` (linia 25-28) + paragraf, fără `<img>`; coloana dreaptă ("Servicii Disponibile") e un card alb cu iconițe `lucide-react` (SVG inline), nu imagini. Deci LCP candidate = h1 sau card-ul alb, ambele text/DOM, blocate de:

1. **CSS render-blocking** (751ms mobil, vezi Q1) — h1-ul nu se poate picta până nu se rezolvă `814bad035791facf.css`.
2. **Font web (Inter)** — 2 fișiere woff2, 86KB + 49KB = 135KB, încărcate pe fiecare pagină (`src/app/layout.tsx` linia 10-13, `Inter({ subsets: ["latin", "latin-ext"] })`); latin-ext e necesar pentru diacritice RO, nu poate fi eliminat, dar sunt 2 request-uri separate.
3. **JS neutilizat** — Lighthouse estimează 450ms economisibili pe mobil din `unused-javascript` (chunk-uri `636a922bdb89731b.js` 54KB/44KB neutilizat = 81% risipă, și `64e28f22150572eb.js` 69KB/24KB neutilizat), identic pe toate paginile → bundle comun din root layout (`QueryProvider`, `Header`), nu cod per-pagină.
4. `legacy-javascript-insight` — 14KB polyfill inutil, **identic hash pe toate cele 4 pagini** (`64e28f22150572eb.js`) → un dependency transpilat prea conservator (probabil target ES prea vechi în build config sau o librărie terță needing polyfill pentru feature Baseline recent, ex. `scrollend`).

Ce ar scădea cel mai mult LCP: eliminarea render-blocking CSS (~750ms) + reducerea JS neutilizat (~450ms) = **potențial ~1.2s** din cele 3.5-4.0s lab pe mobil. `fetchpriority` **nu se aplică** — nu există o imagine LCP de prioritizat pe aceste 4 pagini.

## Q3 — Cauza creșterii CLS (0.005 → 0.02)

Lab (desktop, `layout-shifts` audit, `/calculator/varsta-pensionare/`) arată explicit 2 layout shifts:
- **"Cookie-uri pe eGhișeul.ro..."** (banner cookie consent) — scor 0.00223, cel mai mare shift observat.
- "Caută serviciu" (search din header) — scor 0.0000086, neglijabil.

Cod confirmat: `CookieConsent` e montat client-side în `src/app/layout.tsx` linia 80, după hidratare — bannerul apare cu întârziere față de primul paint și, dacă nu e complet scos din flow-ul documentului, produce shift-ul măsurat. CLS field rămâne "good" (0.02, prag 0.1) dar tendința e clar cauzată de acest banner (nu de fonturi/imagini fără dimensiuni — CLS lab pentru imagini e 0 pe toate cele 4 pagini).

Fix concret: în componenta cookie-consent (`src/components/consent/cookie-consent.tsx` — **conținutul nu a fost citit**, doar punctul de montare confirmat), verifică că bannerul e `position: fixed`/`position: sticky` (scos din flow) și că animația de intrare folosește `transform`/`opacity`, nu `height`/`margin`, ca să nu împingă restul paginii.

## Q4 — Third-party scripts și cost

Verificat prin `third-parties-insight` (Lighthouse):

| Domeniu | Pagină | Transfer | Main-thread time |
|---|---|---|---|
| **erovinieta.net** | /tools/verificare-rovinieta-online/ | 306.5-306.9 KB | 100-105 ms |

Niciun alt third-party detectat pe pensionare/naștere/homepage în această rulare. Motiv verificabil în cod: **GA4 nu se încarcă necondiționat** — comentariu explicit în `src/app/layout.tsx` linia 67-69: gtag.js e injectat de `CookieConsent` DOAR după opt-in, iar Lighthouse (fără consimțământ acceptat) nu-l declanșează. Deci costul real GA4 pentru utilizatori care acceptă cookies **e neverificat** în aceste măsurători (lab-ul mimimizează impactul lui, field data CrUX îl include implicit).

`WhatsAppFloat` și `AttributionTracker` (`src/app/layout.tsx` linii 6-8, 79/85) sunt componente proprii (first-party), nu apar în audit-ul third-party by domain — costul lor JS individual nu e izolat în date (neverificat).

Fix pentru rovinietă: widget-ul erovinieta.net (306KB, funcționalitate centrală a paginii) ar trebui încărcat la interacțiune (după submit număr/serie), nu la load inițial — locația exactă a componentei **nu a fost identificată** (probabil `src/app/tools/verificare-rovinieta-online/page.tsx`, neverificat cu certitudine).

## Alt pattern verificat — prefetch desktop excesiv (Medium, nou)

Pe toate cele 4 pagini, desktop transferă **de 2-3x mai multe request-uri și octeți** decât mobil, deși scorul de performanță e mai bun (pentru că LCP/TBT nu sunt afectate):

| Pagină | Requests mobil | Requests desktop | Bytes mobil | Bytes desktop |
|---|---|---|---|---|
| pensionare | 41 | 225 | 560 KB | 1523 KB |
| rovinieta | 56 | 244 | 872 KB | 1877 KB |
| naștere | 43 | 26* | 597 KB | 514 KB |
| homepage | 68 | 238 | 784 KB | 1836 KB |

(*naștere desktop e outlier — mai puține request-uri, posibil pagină simplă cu mai puține linkuri vizibile pe viewport.)

Categoria "Other" explodă pe desktop (170-174 request-uri pe pensionare/rovinieta/homepage) — consistent cu prefetch automat Next.js `<Link>` pentru rutele vizibile în viewport (viewport mai lat = mai multe linkuri vizibile simultan = mai mult prefetch RSC payload în fundal). Nu afectează CWV direct, dar umflă payload-ul și costul de bandwidth Vercel. Fix: `prefetch={false}` pe linkurile din footer (multe, repetitive — vezi și `identical-links-same-purpose` flagged pe toate paginile pentru linkurile PF/PJ din footer) și pe grid-ul de servicii din `hero-section.tsx` (linia 107, `<Link>` fără prop `prefetch` explicit = default `true`/viewport-based).

## Neverificat (marcat explicit)

- `preload_check.py` pe cele 4 pagini analizate (doar valoarea din CONTEXT pentru cazier-auto-online: 50/100).
- `crux_history.py` (trend săptămânal) pe paginile cu trafic mare — am folosit doar snapshot-ul CrUX per-URL din `pagespeed_check.py` (fereastra unică 29.06-26.07).
- Cauza exactă cod a degradării TTFB (middleware.ts, next.config.ts revalidate) — neinspectate.
- Conținutul `cookie-consent.tsx`, `header.tsx`, `query-provider.tsx`, componenta widget rovinietă — doar inferate din audit, nu citite direct.
- Costul real GA4/WhatsApp/AttributionTracker cu consimțământ acceptat.
