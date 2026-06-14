# Cazier Fiscal Online

| | |
|---|---|
| **Slug DB** | `cazier-fiscal` |
| **URL SEO** | `/servicii/cazier-fiscal-online/` |
| **Preț** | 198 RON (taxe ANAF incluse) |
| **Categorie** | Fiscale (emitent: ANAF) |

Document oficial ANAF care atestă lipsa datoriilor fiscale ale unei persoane fizice la bugetul general consolidat. Valabil **30 de zile** de la emitere. Procesare 100% online, fără cont SPV.

## SEO

- **URL canonic:** `/servicii/cazier-fiscal-online/` (slug WP, păstrează URL-ul indexat + backlink-urile).
- **Redirect:** slug DB `cazier-fiscal` face 308 către URL-ul canonic (`next.config.ts`). `/comanda/cazier-fiscal` rămâne pe slug DB pentru checkout. Slug-ul DB e în `DB_SLUGS_WITH_HARDCODED_PAGE` (exclus din sitemap-ul dinamic); `serviceUrl('cazier-fiscal')` întoarce URL-ul canonic.
- **Volum GSC:** ~506k impresii / poz medie ~7.03 / CTR 2.79% (#4 ca prioritate). Multe interogări în striking-distance (poz 4-7).
- **Clustere țintă:** `anaf cazier fiscal online`, `cazier fiscal` (persoană fizică), `cazier fiscal gratuit / SPV`, `valabilitate cazier fiscal` (30 zile), `diferența cazier fiscal vs cazier judiciar`.
- **Bloc onest:** secțiune „cazier fiscal gratuit prin SPV vs. online prin eGhișeul" (captează intentul „gratuit").

### Status pagină hardcodată + schema
- Pagină hardcodată la slug-parity WP: `src/app/servicii/cazier-fiscal-online/page.tsx` (prerendată static, `revalidate = 3600`).
- Schema `@graph` completă via `buildServicePageGraph` (Organization + WebSite + BreadcrumbList + Service + Offer 198 RON + AggregateRating 4.9/450 + WebPage + reviewedBy).
- Meta via `buildPageMetadata` (canonical + OG `/og/cazier-fiscal.png` + twitter + robots).
- Proză indexabilă: „ce este / de unde se obține", use-cases, „ce atestă", „valabilitate 30 zile", FAQ 8×.

## Flux comandă (module wizard)

Comandă personal-KYC pe slug DB (`/comanda/cazier-fiscal`):
1. **Formular date** — date personale persoană fizică, inclusiv CNP.
2. **Verificare identitate (KYC)** — upload act de identitate + selfie (Gemini face matching).
3. **Plată securizată** — Stripe (card / Apple Pay / Google Pay), taxa ANAF inclusă.
4. **Livrare** — PDF semnat electronic ANAF pe email; opțional curier.

## Status & rămas

- Pagină SEO + schema + redirect: **gata** (batch 2, 2026-06-14).
- Rămas: meta-descriere depășește 160 caractere (doar truncare în SERP, neblocant); imagine OG `/og/cazier-fiscal.png` de generat; eventuală variantă persoană juridică (procedură/acte diferite — momentan doar PF).

## Fișiere cheie

- Pagină: `src/app/servicii/cazier-fiscal-online/page.tsx`
- Wizard comandă: `src/components/orders/modular-order-wizard.tsx` (module în `src/components/orders/modules/`, `steps-modular/`)
- SEO helpers: `src/lib/seo/` (`buildServicePageGraph`, `buildPageMetadata`, `serviceUrl`, `DB_SLUGS_WITH_HARDCODED_PAGE`)
- Redirect: `next.config.ts`
- Sitemap: `src/app/sitemap.ts`
