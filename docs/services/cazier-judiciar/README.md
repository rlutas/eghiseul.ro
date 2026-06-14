# Cazier Judiciar

Serviciul flagship al platformei (cel mai mare volum comercial din GSC). Hub + 2 sub-pagini (PF/PJ), document oficial emis de Inspectoratul General al Poliției Române (IGPR) conform Legii 290/2004.

| Aspect | Hub | Persoană Fizică (PF) | Persoană Juridică (PJ) |
|---|---|---|---|
| **Slug DB** | `cazier-judiciar` | `cazier-judiciar-persoana-fizica` | `cazier-judiciar-persoana-juridica` |
| **URL SEO canonic** | `/servicii/cazier-judiciar-online/` | `/servicii/cazier-judiciar-online/persoana-fizica/` | `/servicii/cazier-judiciar-online/persoana-juridica/` |
| **Preț** | — (hub) | 198 RON (urgent +80 → 278) | 198 RON (urgent +80 → 278) |
| **Categorie** | Juridice | Juridice | Juridice |

Cetățean străin: 298 RON (verificări IGI suplimentare). Toate prețurile includ TVA 21%.

## SEO

- **URL-uri canonice:** paginile sunt hardcodate la URL-urile SEO de mai sus (nested sub hub, NU pe slug-ul DB). Slug-urile DB fac **308-redirect** către URL-urile canonice (`next.config.ts`: `/servicii/cazier-judiciar*` → `/servicii/cazier-judiciar-online/*`). `/comanda/{slug-DB}` rămâne pe slug DB (checkout). Slug→URL prin helper `serviceUrl()` în `lib/seo/constants.ts`; slug-urile redirectate sunt excluse din sitemap-ul dinamic (`DB_SLUGS_WITH_HARDCODED_PAGE`).
- **Snapshot GSC:** flagship — pagina comercială **4.014 clicks / 534.821 impresii / poz 9.74 / CTR 0.75%** (cel mai mare gap fixabil din site).
- **Interogări țintă principale (din playbook §2):**
  - `cazier judiciar online` — 214.707 impr / poz 6.64 (money-term principal)
  - `cazier online` — 91.545 impr / poz 6.59
  - `cazier judiciar online gratuit` — 50.484 impr / poz 6.04 (intent „gratuit", lever necaptat)
  - `cazier online gratuit` — 16.415 impr / poz 5.67
  - Brand-adjacent `ghiseul.ro cazier` — 82.265 impr / poz 4.53 (intent mismatch)
  - Cluster preț alimentează blogul `/taxa-cazier-judiciar/` (poz 6.18) — *canibalizează* serviciul ⚠️
- **Status pagini:**
  - Hub: secțiuni anti-canibalizare gata — „Alege Tipul de Cazier" (link PF+PJ), „Online vs Ghișeul Tradițional" (bloc gratuit-vs-plătit, M2 DONE), FAQ „Diaspora & Străinătate" (M3 parțial), 30+ use-cases, 18 FAQ, schema @graph completă.
  - PF/PJ: schema `@graph` completă (Org + WebSite + BreadcrumbList 4-nivele + Service + 2 Offers + AggregateRating + WebPage + reviewedBy), meta diferențiat anti-canibalizare, proză indexabilă adăugată în sprintul curent.
  - **Recenzii:** `aggregateRating` 4.9★ / **450** review-uri pe hub + PF + PJ.

## Flux comandă (wizard)

Wizard modular pornit din `/comanda/{slug-DB}`. Module active în ordine:

contact → **personal KYC** → opțiuni → KYC docs (upload act + selfie) → semnătură → livrare → facturare → review.

- Fluxul este **personal KYC, blocat pe PF** (nu există modul stare-civilă sau constatator). Verificare identitate: CI/pașaport (față+verso) + selfie, validare AI; semnătură desenată în wizard (eIDAS).
- **PF** (sub-pagina `/persoana-fizica`): țintește `cazier judiciar persoană fizică`; necesită CI/pașaport + selfie + date părinți (prenume mamă/tată) + CNP. Disponibil și pentru cetățeni străini.
- **PJ** (sub-pagina `/persoana-juridica`): țintește `cazier judiciar firmă / persoană juridică / licitații SEAP`; auto-completare CUI (ANAF/ONRC) + date reprezentant legal. **PFA/II/ÎF NU sunt PJ** — cazierul se eliberează pe persoana fizică titulară → redirect către fluxul PF (clarificat în prosa paginii).

## Status & rămas

**✅ Gata:**
- 3 pagini hardcodate la URL canonic + redirect-uri 308 DB→canonic + sitemap corectat (sub-rutele PF/PJ emise, slug-urile DB excluse).
- Schema @graph completă pe toate 3; meta diferențiat anti-canibalizare; proză indexabilă PF/PJ.
- Bloc onest „gratuit/oficial vs noi" (M2) + FAQ diaspora (M3 parțial) pe hub.
- Mega-menu + `serviceUrl()` wiring; recenzii 450.

**⏳ Rămâne (playbook §2.6):**
- Sub-pagină dedicată diaspora `/servicii/cazier-judiciar-online/din-strainatate` (acum doar FAQ pe hub) — țintă `cazier judiciar din strainatate / ambasada / fara sa fiu in tara`.
- Migrare blog `/taxa-cazier-judiciar/` (poz 6.18, 5.188 clicks, încă pe WP) ca **MDX re-țintit STRICT pe preț** + CTA + link UP la serviciu (M1 dezcanibalizare).
- Polish vizual hub (feedback 20 mai — „nu îmi place cum e organizat").
- Verificare LCP < 2.5s pe mobil (pagină lungă, multe carduri).

## Fișiere cheie

- `src/app/servicii/cazier-judiciar-online/page.tsx` — hub
- `src/app/servicii/cazier-judiciar-online/persoana-fizica/page.tsx` — PF
- `src/app/servicii/cazier-judiciar-online/persoana-juridica/page.tsx` — PJ
- `src/lib/seo/constants.ts` — `serviceUrl()`, `HARDCODED_SERVICE_SUBROUTE_PATHS`, `DB_SLUGS_WITH_HARDCODED_PAGE`
- `next.config.ts` — redirect-uri 308 DB-slug → URL canonic
- `src/app/sitemap.ts` — emite sub-rutele PF/PJ, exclude slug-urile redirectate
- `docs/seo/gsc-data/SERVICE-RANKING-PLAYBOOK-2026-06-13.md` (§2) — strategia de țintire
