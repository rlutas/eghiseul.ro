# Certificat de Integritate Comportamentală Online

| | |
|---|---|
| **Slug DB** | `certificat-integritate` |
| **URL SEO** | `/servicii/certificat-de-integritate-comportamentala/` |
| **Preț** | 250 RON (cel mai mare preț din catalog; taxe oficiale incluse) |
| **Categorie** | Juridice (emitent: IGPR / Poliția Română) |

Document oficial IGPR introdus prin **Legea 118/2019**, care atestă că persoana nu a fost sancționată pentru infracțiuni împotriva unor categorii vulnerabile, în special **minori**. Cerut tot mai des la angajarea în roluri cu contact direct cu copii sau persoane vulnerabile. Valabilitate uzuală ~6 luni (depinde de cerințele angajatorului).

## SEO

- **URL canonic:** `/servicii/certificat-de-integritate-comportamentala/` (slug-parity WP).
- **Redirect:** redirecturile existente din `next.config.ts` mapează atât `certificat-integritate` (slug DB) cât și varianta `-comportamentala` la URL-ul canonic (308, fără lanț de redirect). `/comanda/certificat-integritate` rămâne pe slug DB. Slug-ul DB e în `DB_SLUGS_WITH_HARDCODED_PAGE` (exclus din sitemap dinamic); `serviceUrl('certificat-integritate')` întoarce URL-ul canonic.
- **Volum GSC:** ~148k impresii / poz medie ~6.46 (deja **poz 3-4** pe money-terms) / CTR 1.34% (#6; push spre #1, preț cel mai mare → valoare comercială mare).
- **Clustere țintă:** `certificat integritate comportamentala` (+ `eliberare ... online`), `igpr`, `lucru cu minori`, intent `gratuit`, `diferența față de cazierul judiciar`, `valabilitate`.
- **Anti-canibalizare:** link UP din pagina serviciu către cazierul judiciar (`/servicii/cazier-judiciar-online/`) cu anchor diferențiat.

### Status pagină hardcodată + schema
- Pagină hardcodată la slug-parity WP: `src/app/servicii/certificat-de-integritate-comportamentala/page.tsx` (prerendată static, `revalidate = 3600`).
- Schema `@graph` completă via `buildServicePageGraph` (Organization + WebSite + BreadcrumbList + Service + Offer 250 RON + AggregateRating 4.9/450 + WebPage + reviewedBy).
- Meta via `buildPageMetadata` (canonical + OG `/og/certificat-integritate.png` + twitter + robots).
- Proză indexabilă: „ce este" (Legea 118/2019), use-cases (lucru cu minori, sport, voluntariat, medii sensibile), bloc „gratuit/oficial vs noi", diferență față de cazierul judiciar + valabilitate, FAQ 8×.

## Flux comandă (module wizard)

Comandă personal-KYC pe slug DB (`/comanda/certificat-integritate`):
1. **Formular date** — date personale pentru cererea la IGPR.
2. **Verificare identitate (KYC)** — upload act de identitate + selfie (cerut de procedura oficială).
3. **Plată securizată** — Stripe (card / Apple Pay / Google Pay), taxe oficiale incluse.
4. **Livrare** — PDF semnat electronic IGPR pe email; opțional curier.

## Status & rămas

- Pagină SEO + schema + redirect: **gata** (batch 2, 2026-06-14).
- Rămas: imagine OG `/og/certificat-integritate.png` de generat; eventuală migrare ca MDX a articolului-cluster de tip „ghid integritate comportamentală" cu link UP la serviciu.

## Fișiere cheie

- Pagină: `src/app/servicii/certificat-de-integritate-comportamentala/page.tsx`
- Wizard comandă: `src/components/orders/modular-order-wizard.tsx` (`steps-modular/`, `modules/`)
- SEO helpers: `src/lib/seo/` (`buildServicePageGraph`, `buildPageMetadata`, `serviceUrl`, `DB_SLUGS_WITH_HARDCODED_PAGE`)
- Redirect: `next.config.ts`
- Sitemap: `src/app/sitemap.ts`
