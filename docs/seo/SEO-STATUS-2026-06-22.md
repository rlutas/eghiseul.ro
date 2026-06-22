# SEO Status — Location pages & topical clusters (2026-06-22)

Rezumat al expansiunii location-SEO + clustere construite pe 22 iunie 2026. Tot e **live pe main**, CI verde, în sitemap (186 URL-uri total). Strategia de scope: vezi memoria `location-seo-scope` + `docs/plans/2026-06-19-location-seo-engine.md`.

## 📁 Foldere dedicate (per treabă)
- [`carte-funciara/`](carte-funciara/README.md) — 42 pagini CF pe județe (date OCPI) + analiză competiție.
- [`cazier-judiciar/`](cazier-judiciar/README.md) — 48 orașe cazier (date IPJ).
- [`onrc-certificat-constatator/`](onrc-certificat-constatator/README.md) — 4 pagini use-case.
- [`stare-civila/`](stare-civila/README.md) — 8 ghiduri (celibat/naștere/căsătorie).
- [`rovinieta/`](rovinieta/README.md) — tool verificare + pagină cumpărare (afiliere).
- [`keywords/`](keywords/) — keyword research per serviciu.

## Ce s-a construit

### 1. Extras Carte Funciară pe județe — 42 pagini (P1) ✅
- Rute: `/servicii/extras-de-carte-funciara/{judet}/` (toate 41 județe + București).
- Date reale birou **OCPI** per județ (adresă, telefon, email, program) din surse oficiale ANCPI → anti-doorway. Date: `src/lib/seo/locations/ocpi.ts`.
- Componentă: `src/components/services/carte-funciara-location-page.tsx`; rută `[judet]`. ~830 cuvinte/pagină, schema Service/areaServed/breadcrumb/WebPage.
- Linkate din hub (secțiune „pe județe") + între ele + sitemap.
- Corecții reale aplicate (aggregatorii greșeau): Brăila (Str. Justiției 1), Buzău (Calea Eroilor 10), Sălaj (relocat Piața Iuliu Maniu 2, iun. 2025), București (Bd. Expoziției 1A, NU sediul ANCPI național).

### 2. Cazier Judiciar — extins 37 → 48 orașe ✅
- +5 reședințe cu date IPJ reale (politiaromana.ro): Târgu Jiu (Gorj), Piatra Neamț (Neamț), Slatina (Olt), Satu Mare, Ilfov (ghișeul fizic în București S2).
- +6 orașe secundare mari (`officeNote` → IPJ județean): Turda, Mediaș, Lugoj, Bârlad, Sebeș, Onești.
- Acoperire completă: toate 41 județe + București + secundare. Date: `src/lib/seo/locations/cities.ts` (gate anti-doorway `quality.ts`).

### 3. Cluster ONRC — certificat constatator use-case (4 pagini) ✅
- `certificat-constatator-pentru-{banca, licitatie, notar, fonduri-europene}` (root pages, ArticleLayout).
- Mesaj standardizat verificat: PDF e-semnat = **original**, termen **30 de zile**, versiunea **de bază (30 lei)** suficientă; istoric (~250 lei) doar pentru due-diligence. Sursă: myportal.onrc.ro, Ordin MJ 380/C/2024.

### 4. Cluster Stare Civilă (8 pagini) ✅
- Celibat: `certificat-de-celibat` (pilon — **Anexa 9** = denumirea legală corectă, HG 64/2011), `valabilitate-certificat-de-celibat` (6 luni RO / 90 zile străinătate), `certificat-de-celibat-pentru-casatorie-in-strainatate` (apostilă Prefectură + traducere).
- Naștere/căsătorie: `duplicat-certificat-de-nastere`, `transcriere-certificat-de-nastere`, `duplicat-certificat-de-casatorie`, `acte-necesare-casatorie` (declarație 10 zile, certificate medicale 14 zile), `inregistrare-nastere-copil-nou-nascut` (termen 30 zile, primul certificat gratuit).
- Toate înregistrate în `src/config/articles.ts` (apar în `/blog`) + `HARDCODED_ARTICLE_SLUGS` (sitemap).

## Navigare (cum sunt accesibile)
- **Pagini de județ/oraș:** din hub-ul serviciului (secțiune „pe județe"/„pe orașe") + internal linking + sitemap. **NU** în meniul principal (corect — ar fi doorway/menu bloat).
- **Ghiduri (ONRC + stare civilă):** în `/blog` (din `articles.ts`) + linkate intern din paginile de serviciu.

## Sitemap — verificat 2026-06-22
- Total: **186 URL-uri**. 42 CF județe ✓, 48 cazier orașe (+2 sub-rute PF/PJ) ✓, 12 ghiduri noi ✓.

## Validare GSC (keyword cross-check, date mai-iunie 2026)
Paginile construite țintesc cerere REALĂ confirmată în GSC (sursă: `gsc-data/.../Interogări.csv`):

| Cluster | Query reprezentativ | Clickuri | Impresii | Poziție | Pagina |
|---|---|---|---|---|---|
| Carte funciară | „extras carte funciara" | 993 | 98.965 | 6.5 | hub + 42 județe (long-tail local) |
| ONRC | „certificat constatator online" | 781 | 103.550 | 7.7 | hub + 4 use-case |
| Stare civilă | „duplicat certificat de nastere online" | 4.390 | 17.220 | 2.6 (CTR 25%) | `duplicat-certificat-de-nastere` ✅ |
| Stare civilă | „certificat de celibat" | 365 | 5.231 | 5.8 | `certificat-de-celibat` (pilon) ✅ |
| Rovinietă | „rovinieta online" | 778 | 134.402 | **10.3** | `/servicii/rovinieta-online/` (nou) |
| Calculatoare | „calculator salariu net" | 19.588 | 1.157.494 | 4.2 | `/calculator/salariu/` |
| Calculatoare | „calculator impozit auto 2026" | 72.471 | 136.774 | **1.6 (CTR 53%)** | `/calculator/calculator-impozit-auto/` — domină |
| Calculatoare | „calcul varsta pensionare legea noua" | 21.369 | 133.936 | 2.4 | `/calculator/varsta-pensionare/` |

**Concluzii:**
- Toate clusterele construite au cerere reală mare; paginile noi sunt aliniate la query-uri existente.
- **Oportunități striking-distance** (poz 6-10, impresii mari) de urmărit după indexare: CF „extras carte funciara" (poz 6.5, 99K), ONRC „certificat constatator online" (poz 7.7, 103K), Rovinietă „rovinieta online" (poz 10.3, 134K → noua pagină de cumpărare).
- Calculatoarele = motorul de trafic (salariu 1.1M impresii, impozit auto domină la poz 1.6/CTR 53%, pensie 130K+).

## De ce NU s-au făcut anumite pagini (decizii anti-doorway)
- **Cazier auto** pe orașe — emis de Poliția Rutieră, fără dataset per-oraș → doorway trap.
- **Cazier fiscal, identificare imobil** — centralizate (ANAF/geoportal), fără date locale unice.
- **Plan cadastral pe județe** — aceleași birouri OCPI ca CF → ar duplica; opțional doar cu conținut diferențiat (urbanism).
- **Stare civilă pe orașe** — ~3.200 primării, biroul relevant ≠ orașul userului → topical cluster, nu matrice.
- **ONRC pe orașe** — document național → use-case cluster, nu geografie.

## Rămas
1. **Validare indexare GSC** (~3-4 săptămâni) — % indexare per tip înainte de a scala.
2. Plan cadastral pe județe (opțional, diferențiat).

**Last updated:** 2026-06-22.
