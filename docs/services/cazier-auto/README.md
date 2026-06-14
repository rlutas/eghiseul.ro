# Cazier Auto Online

| | |
|---|---|
| **Slug DB** | `cazier-auto` |
| **URL SEO** | `/servicii/cazier-auto-online/` |
| **Preț** | 198 RON (fără taxe ascunse) |
| **Categorie** | Auto (istoric vehicul) |

Raport cu istoricul complet al unui vehicul: **accidente și daune, kilometraj real (alerte fraudă km), proprietari anteriori**, plus verificări de furt, leasing și gajuri. Comanda pe baza numărului de înmatriculare sau a seriei de șasiu (VIN).

## SEO

- **URL canonic:** `/servicii/cazier-auto-online/` (slug SEO țintind interogarea principală).
- **Redirect:** slug DB `cazier-auto` face 308 către URL-ul canonic (`next.config.ts`). `/comanda/cazier-auto` rămâne pe slug DB. Slug-ul DB e în `DB_SLUGS_WITH_HARDCODED_PAGE` (exclus din sitemap dinamic); `serviceUrl('cazier-auto')` întoarce URL-ul canonic.
- **Volum GSC:** ~54k impresii / poz medie ~5.04 / **CTR 8.48%** (#7; serviciu deja sănătos — menținere + extindere cluster).
- **Clustere țintă:** `cazier auto` / `istoric auto` (vehicul), `verificare mașină second-hand`, `kilometraj real / fraudă km`, `VIN`.
- **Dublu intent (clarificat pe pagină):** cazier auto = istoricul **vehiculului** vs. „cazier rutier" / „cazier permis auto" = situația **șoferului** (puncte de penalizare, abateri la **DRPCIV / Poliția Rutieră**). Pagina diferențiază explicit ambele pentru a capta și a redirecta corect intentul șofer.

### Status pagină hardcodată + schema
- Pagină hardcodată la slug-parity WP: `src/app/servicii/cazier-auto-online/page.tsx` (prerendată static, `revalidate = 3600`).
- Schema `@graph` completă via `buildServicePageGraph` (Organization + WebSite + BreadcrumbList + Service + Offer 198 RON + AggregateRating 4.9/450 + WebPage + reviewedBy).
- Meta via `buildPageMetadata` (canonical + OG `/og/cazier-auto.png` + twitter + robots).
- Proză indexabilă: „ce este / ce conține", „ce verifici" (4 carduri), use-cases, bloc clarificare vehicul vs. șofer, FAQ 8×.

## Flux comandă (module wizard)

Comandă personal-KYC pe slug DB (`/comanda/cazier-auto`):
1. **Date vehicul** — număr de înmatriculare sau serie de șasiu (VIN).
2. **Verificare identitate (KYC)** — pas comun fluxului personal-KYC.
3. **Plată securizată** — Stripe (card / Apple Pay / Google Pay), fără taxe ascunse.
4. **Livrare** — raport PDF complet pe email.

## Status & rămas

- Pagină SEO + schema + redirect: **gata** (batch 2, 2026-06-14).
- Rămas: meta-descriere depășește 160 caractere (doar truncare în SERP, neblocant); imagine OG `/og/cazier-auto.png` de generat; eventuală pagină/cluster dedicat „cazier rutier / permis auto" (DRPCIV) pentru intentul șofer.

## Fișiere cheie

- Pagină: `src/app/servicii/cazier-auto-online/page.tsx`
- Wizard comandă: `src/components/orders/modular-order-wizard.tsx` (`steps-modular/`, `modules/`)
- SEO helpers: `src/lib/seo/` (`buildServicePageGraph`, `buildPageMetadata`, `serviceUrl`, `DB_SLUGS_WITH_HARDCODED_PAGE`)
- Redirect: `next.config.ts`
- Sitemap: `src/app/sitemap.ts`
