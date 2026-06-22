# Carte Funciară — pagini pe județe (location SEO)

**Status:** ✅ LIVE (2026-06-22) · **P1** din strategia location-SEO · 42 pagini

## Ce este
Pagini de extras carte funciară per județ, ancorate pe biroul **OCPI** local real (anti-doorway).

- **Rute:** `/servicii/extras-de-carte-funciara/{judet}/` — toate 41 județe + București = **42**.
- **Date OCPI:** `src/lib/seo/locations/ocpi.ts` (adresă, telefon, email, program, cod auto/subdomeniu, nr. BCPI).
- **Componentă:** `src/components/services/carte-funciara-location-page.tsx`.
- **Rută dinamică:** `src/app/servicii/extras-de-carte-funciara/[judet]/page.tsx` (generateStaticParams + metadata).
- **Conținut:** ~830 cuvinte/pagină — ce este extrasul, tipuri (informare vs autentificare), use-cases, online vs ghișeu OCPI, pași, preț 89 RON, FAQ.
- **Schema:** Service + areaServed + WebPage + BreadcrumbList (`buildLocationPageGraph`).
- **Navigare:** linkate din hub (`/servicii/extras-de-carte-funciara/` → secțiune „pe județe") + între ele + sitemap.

## Sursa datelor OCPI
Subdomeniile oficiale ANCPI: `{cod}.ancpi.ro` (cod = 2 litere, ex. `cj`, `tm`) sau, pentru 5 județe fără subdomeniu, `www.ancpi.ro/ocpi/{cod}/` (Galați, Brăila, Buzău, Ilfov, Prahova, Vrancea, Tulcea). Email uniform `{cod}@ancpi.ro`. Master cross-check: directorul Excel ANCPI `www.ancpi.ro/oficii-teritoriale-contact/`.

## Corecții reale aplicate (aggregatorii greșeau)
- **Brăila:** Str. Justiției nr. 1 (NU Calea Călărașilor 27).
- **Buzău:** Calea Eroilor nr. 10 (NU Bd. N. Bălcescu 48).
- **Sălaj:** Piața Iuliu Maniu nr. 2, Zalău — relocat iunie 2025 (NU Str. Corneliu Coposu 31/A).
- **București:** Bd. Expoziției nr. 1A, sector 1 (Splaiul Independenței 202A = sediul ANCPI **național**, altă entitate).

## Acoperire date
42/42 cu adresă+telefon+email verificate. Program verificat la 27; la 16 lăsat necompletat (nu se afișează program neverificat).

## Decizii de scope
- **Granularitate:** per-județ. STOP la nivel BCPI — **niciodată per-comună** (= doorway).
- **Plan cadastral:** NU pagini separate pe județe (aceleași birouri OCPI → ar duplica CF). Vezi memoria `location-seo-scope`.

## Vezi și
- `competitor-analysis.md` (în acest folder) — analiză extrase.ro / cfunciara.ro.
- `../SEO-STATUS-2026-06-22.md` — overview.
