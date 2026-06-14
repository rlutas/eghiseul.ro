# Certificat de Căsătorie

Duplicat / copie legalizată după certificatul de căsătorie, eliberat de Starea Civilă (Direcția de Evidență a Persoanelor). Procesare 100% online, fără drum la primărie (util și din diaspora, prin împuternicire).

| Atribut | Valoare |
|---|---|
| **Slug DB** | `certificat-casatorie` |
| **URL SEO (canonic)** | `/servicii/eliberare-certificat-de-casatorie/` |
| **Preț** | 998 RON (taxe incluse) |
| **Categorie** | Personale — Stare Civilă |
| **Termen** | 7 zile lucrătoare standard · 3 zile Urgent |

## SEO

- **URL canonic:** `/servicii/eliberare-certificat-de-casatorie/` (slug WP, hardcoded pentru paritate + backlink-uri indexate). Slug-ul DB `certificat-casatorie` face **308-redirect** către URL-ul SEO.
- **Schema slug:** `eliberare-certificat-de-casatorie` (JSON-LD breadcrumb + offers).
- **Interogări țintă:** „certificat de căsătorie online", „duplicat certificat de căsătorie", „certificat de căsătorie pierdut", „eliberare certificat de căsătorie", „certificat căsătorie cetățenie / divorț / succesiune".
- **Performanță GSC:** ~168k impresii, poziție medie ~1.8.
- **Status pagină:** live, server component (`revalidate = 3600`). JSON-LD via `buildServicePageGraph` (Service + BreadcrumbList + offers 998 RON + aggregateRating 4.9/450). OG image `/og/certificat-casatorie.png`.

## Flux comandă (wizard)

Flux modular PF: contact → date personale (CNP) → **Date Stare Civilă** → opțiuni → KYC (act + selfie) → semnătură → livrare → facturare → review.

### Pasul „Date Stare Civilă" (modul `civil-status`, `documentType: 'casatorie'`)

Config-driven din `verification_config.civilStatus` (migrarea 053). Câmpuri activate pentru căsătorie:

- **Istoric marital** (`maritalHistory`): „Ați mai fost căsătorit(ă) anterior?" → Da deschide: de câte ori (count) + „Ultima căsătorie s-a încheiat prin" Divorț/Deces. La **Divorț** → ⚠️ divorțul pronunțat în străinătate trebuie recunoscut/transcris în RO, altfel căsătoria anterioară figurează în vigoare.
- **Locul căsătoriei** (`marriagePlace`): România / Străinătate. Pentru `documentType === 'casatorie'` câmpul e **mereu vizibil** → la „Străinătate" apare ⚠️ avertisment de **transcriere** (dacă actul din străinătate nu e transcris în RO, nu se poate elibera).
- **Data căsătoriei** (`marriageDate`, input `type="date"`).
- **Numele complet al soțului/soției înainte de căsătorie** (`spouseName`).
- **Numele de naștere** (`birthName`) al solicitantului.
- **Numele tatălui + mamei** (`parentNames`, ambele obligatorii).
- **Vechiul certificat mi-a fost:** Pierdut / Deteriorat / Furat / Altul. (`oldCertificateReason`)
- **Ați renunțat la cetățenia română?** (`renouncedCitizenship`) → la „Da" ℹ️ notă: certificatul **nu va mai avea CNP**.
- **Localitatea care a înregistrat actul** (`registrationPlace`).
- **Scopul obținerii** (`purpose`) + **Țara folosirii actului** (`countryOfUse`).

Mirror fidel al WPForms-ului live (7 pași). Validarea pasului cere completarea fiecărui câmp vizibil obligatoriu.

## Status & rămas

- ✅ Formular „Date Stare Civilă" fidel WP (istoric marital + divorț-străinătate, avertisment transcriere căsătorie, notă CNP la renunțare cetățenie). Preț 998 RON. Build/tsc/eslint verzi.
- ⏳ Picker limbă traducere + țară apostilă (UI peste logica existentă din `options-step.tsx`).
- ⏳ Livrare internațională (Poșta Română / DHL + selecție țară).
- ⏳ Upload „vechiul certificat" (opțional); a 3-a declarație pe propria răspundere.

## Fișiere cheie

- Pagină SEO: `src/app/servicii/eliberare-certificat-de-casatorie/page.tsx`
- Step wizard: `src/components/orders/modules/civil-status/CivilStatusStep.tsx`
- Tipuri: `src/types/verification-modules.ts` (`CivilStatusConfig`, `CivilStatusState`)
- Config per serviciu: `supabase/migrations/053_civil_status_module.sql`
- Gap analysis: `docs/technical/specs/wp-form-gap-analysis-2026-06-14.md`
