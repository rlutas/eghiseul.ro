# Rovinietă — tool verificare + pagină cumpărare

**Status:** ✅ LIVE · monetizare prin afiliere erovinieta.net

## Două pagini, două intenții
| Pagină | Intenție | GSC (mai 2026) |
|---|---|---|
| `/tools/verificare-rovinieta-online/` | **verificare** validitate (gratuit) | „verificare rovinieta" 138.410 clickuri, poz 3.4 · ~280K clickuri total (juggernaut) |
| `/servicii/rovinieta-online/` | **cumpărare** rovinietă | „rovinieta online" 778 clickuri din **134.402 impresii, poz 10.3** → oportunitate |

## Verificare (deja exista)
- Componentă: `src/components/tools/erovinieta-embed.tsx` (iframe `erovinieta.net/embed/verificare-rovinieta` + redimensionare postMessage).
- Pagină: `src/app/tools/verificare-rovinieta-online/page.tsx`. Schema WebApplication.
- Cluster „verificare rovinieta" = uriaș (138K clickuri la poz 3) — deja capturat.

## Cumpărare (construit 2026-06-22)
- Pagină: `src/app/servicii/rovinieta-online/page.tsx` (hero + formular + tarife + FAQ + schema Service).
- Formular: `src/components/rovinieta/rovinieta-purchase-form.tsx` ('use client') → redirect către
  `erovinieta.net/checkout?category=&period=&plate=&utm_*` (afiliere cu UTM tracking).
- Țintă: „rovinieta online", „cumpara rovinieta online", „plata rovinieta online".

## Corecții vs HTML-ul WP vechi (erau GREȘITE)
- **Categorii oficiale CNAIR A-H** (nu A-G cu motociclete/tractoare). **Motocicletele sunt SCUTITE** de rovinietă.
  - A=autoturisme ≤3,5t · B=marfă ≤3,5t · C=3,5-7,5t · D=7,5-12t · E=≥12t max 3 axe · F=≥12t min 4 axe · G=9-23 locuri · H=>23 locuri.
- **Perioade categoria A:** 1 zi, 10 zile, 30 zile, 60 zile, 12 luni (NU 7/90 zile/6 luni — alea sunt pt comerciale).
- **Tarife cat. A ian. 2026** (1 EUR = 5,0963 lei): 1zi 3,5€/18lei · 10zile 6€/31lei · 30zile 9,5€/48lei · 60zile 15€/76lei · 12luni 50€/255lei.
- ⚠️ **De la 1 iulie 2026** tarifele se schimbă (diferențiate pe norma Euro) — flag pe pagină, re-verifică după.

## Fix-uri SEO aplicate (next.config.ts)
- Vechiul redirect `/servicii/rovinieta-online` → `/servicii/verificare-rovinieta-online/` ducea într-un **404** → eliminat (acum pagină reală).
- `/servicii/verificare-rovinieta-online` (16K clickuri GSC, era 404) → redirecționat la `/tools/verificare-rovinieta-online/` (tool-ul real). Recuperare trafic.

## Update final (2026-06-22)
- **Conținut importat de pe paginile live eghiseul.ro** (care rankează), nu scris de la zero: verificare (ce e rovinieta, drumuri unde e necesară/NU, excepții, tarife A+B, FAQ real) + cumpărare (4 beneficii, amenzi 250-1.500 lei, electronică din 2010, camere CNAIR).
- **Funnel bidirecțional:** verificare → „cumpără rovinieta online" și invers.
- **Layout consistent cu calculatoarele** (hero cu badge, widget overlapping un singur card, „Pe scurt", FAQ, CTA). Fix: embed-ul erovinieta e deja card alb → fără wrapper alb dublu.
- **Pagină nouă `/tools/`** (Instrumente): listează verificare rovinietă + calculatoare. Schema CollectionPage, în sitemap.

## Surse
CNAIR „Contravaloare Rovinietă Ianuarie 2026" (PDF oficial), cnadnr.ro, erovinieta.net/categorii-rovinieta.
