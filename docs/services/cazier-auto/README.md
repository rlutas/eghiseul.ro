# Cazier Auto Online

| | |
|---|---|
| **Slug DB** | `cazier-auto` |
| **URL SEO** | `/servicii/cazier-auto-online/` |
| **Preț** | 198 RON standard · **350 RON pentru permis emis în străinătate** |
| **Termen** | 3-5 zile lucrătoare (1-2 urgent) · **7-10 zile la permis emis în străinătate** (fără urgență) |
| **Categorie** | Auto — fișa de evidență a conducătorului auto |

**Fișa de evidență a conducătorului auto** eliberată de Poliția Rutieră: sancțiuni rutiere, puncte de penalizare active, suspendări ale permisului. Este despre **șofer**, se obține pe baza permisului de conducere — NU e un raport despre vehicul (fără VIN/număr de înmatriculare; descrierea din DB a fost corectată prin migrarea 120, iar VIN-ul scos prin 121).

⚠️ Secțiunile de SEO mai jos au fost scrise când pagina era poziționată pe „istoric vehicul"; pagina actuală descrie corect fișa conducătorului auto. De reverificat clusterele când se atinge din nou SEO-ul acestui serviciu.

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
1. **Date contact** — email, telefon, motivul solicitării. ⚠️ NU are „Sunt cetățean străin" (`personalKyc.allowForeignCitizen = false`, migrarea 139): la auto contează unde a fost emis permisul, nu cetățenia.
2. **Date personale** — scan CI (OCR) sau completare manuală.
3. **Permis de Conducere** — o singură întrebare: **„Permisul de conducere a fost emis în: România / Străinătate"**. Numărul permisului NU se mai cere (se citește din poza permisului — `drivingLicense.required = false` din migrarea 139).
   - „Străinătate" → preț **350 RON** și termen **7-10 zile lucrătoare**, actualizate live în sidebar; procesarea urgentă se ascunde (termenul e al autorității emitente). Config:
     `verification_config.vehicleVerification.foreignLicense` = `{enabled, price, minDays, maxDays, daysDisplay}`.
   - Prețul e recalculat server-side la `/submit` (un payload modificat nu poate plăti tariful de permis românesc).
4. **Opțiuni** — urgență (doar la permis românesc) + traducere/legalizare/apostile.
5. **Documente KYC** — act de identitate (față + spate), selfie cu actul, **poza feței permisului**. Versoul permisului NU se cere (migrarea 139).
6. **Plată securizată** — Stripe (card / Apple Pay / Google Pay), fără taxe ascunse.
7. **Livrare** — document PDF pe email (opțional și fizic prin curier).

Paritate cu `cazierjudiciaronline.com` (`src/config/auto.config.ts`: `enablePermisStrain`, tarif 350, termen 7-10 zile).

## Fixuri 28.07.2026 (raportate de Raul)

- **„Cazier Auto PF" în rezumatul comenzii** — sufixul PF/PJ se adăuga oriunde exista un CNP, fiindcă
  pagina de checkout îl DEDUCEA (`cd.personal?.cnp ? 'PF' : null`), nu îl citea din configul serviciului.
  La un serviciu care există doar pentru persoane fizice, „PF" e zgomot: nu există varianta PJ de care
  să-l deosebești. Acum sufixul apare doar când `verification_config.clientTypeSelection.enabled === true`
  (adică la cazierul judiciar), iar flagul vine din API ca `service.offersClientType`.
- **Termen greșit la checkout pentru permis străin** — estimarea se calcula din `estimated_days` al
  serviciului (3-5 zile), deci clientul cu permis emis în străinătate vedea 3-5 zile la plată, deși
  comanda durează 7-10. API-ul expune acum `service.foreignLicense`, iar checkout-ul îl folosește ca
  `baseRange` (același mecanism ca în wizard).

## Status & rămas

- Pagină SEO + schema + redirect: **gata** (batch 2, 2026-06-14).
- Rămas: meta-descriere depășește 160 caractere (doar truncare în SERP, neblocant); imagine OG `/og/cazier-auto.png` de generat; eventuală pagină/cluster dedicat „cazier rutier / permis auto" (DRPCIV) pentru intentul șofer.

## Fișiere cheie

- Pagină: `src/app/servicii/cazier-auto-online/page.tsx`
- Wizard comandă: `src/components/orders/modular-order-wizard.tsx` (`steps-modular/`, `modules/`)
- SEO helpers: `src/lib/seo/` (`buildServicePageGraph`, `buildPageMetadata`, `serviceUrl`, `DB_SLUGS_WITH_HARDCODED_PAGE`)
- Redirect: `next.config.ts`
- Sitemap: `src/app/sitemap.ts`
