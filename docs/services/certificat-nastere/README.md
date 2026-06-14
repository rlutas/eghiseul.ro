# Certificat de Naștere

Duplicat / copie legalizată după certificatul de naștere, eliberat de Serviciul de Stare Civilă. Procesare 100% online, fără deplasare (util mai ales din diaspora, prin împuternicire).

| Atribut | Valoare |
|---|---|
| **Slug DB** | `certificat-nastere` |
| **URL SEO (canonic)** | `/servicii/eliberare-certificat-de-nastere/` |
| **Preț** | 998 RON (taxe incluse) |
| **Categorie** | Personale — Stare Civilă |
| **Termen** | 7 zile lucrătoare standard · 3 zile Urgent |

## SEO

- **URL canonic:** `/servicii/eliberare-certificat-de-nastere/` (slug WP, hardcoded pentru paritate). Slug-ul DB `certificat-nastere` face **308-redirect** către URL-ul SEO.
- **Schema slug:** `eliberare-certificat-de-nastere` (folosit în JSON-LD breadcrumb + offers).
- **Interogări țintă:** „certificat de naștere online", „duplicat certificat de naștere", „certificat de naștere pierdut", „eliberare certificat de naștere", „certificat de naștere din diaspora", „certificat de naștere cetățenie".
- **Performanță GSC:** ~943k impresii — **cel mai bun performer** din catalog.
- **Status pagină:** live, server component (`revalidate = 3600`). JSON-LD via `buildServicePageGraph` (Service + BreadcrumbList + offers 998 RON + aggregateRating 4.9/450). OG image `/og/certificat-nastere.png`.

## Flux comandă (wizard)

Flux modular PF: contact → date personale (CNP) → **Date Stare Civilă** → opțiuni → KYC (act + selfie) → semnătură → livrare → facturare → review.

### Pasul „Date Stare Civilă" (modul `civil-status`, `documentType: 'nastere'`)

Config-driven din `verification_config.civilStatus` (migrarea 053). Câmpuri activate pentru naștere:

- **Pentru cine se solicită?** — Minor (sub 18) / Adult. (`applicantType`) Dacă e Minor, întrebările de istoric marital se ascund (`isAdult` gating).
- **Nașterea a avut loc în:** România / Străinătate. (`birthPlace`) → la „Străinătate" apare ⚠️ avertisment de **transcriere**: dacă nașterea din străinătate nu a fost transcrisă în RO (Ambasadă/Consulat/DEP), documentul nu poate fi eliberat.
- **Sunteți căsătorit(ă)?** Da/Nu. (`currentlyMarried`, doar adulți)
- **Istoric marital** (`maritalHistory`, doar adulți): „Ați mai fost căsătorit(ă) anterior?" → Da deschide: de câte ori (count) + „Ultima căsătorie s-a încheiat prin" Divorț/Deces. La **Divorț** → ⚠️ divorțul pronunțat în străinătate trebuie recunoscut/transcris în RO.
- **Locul căsătoriei** (`marriagePlace`) — apare condițional doar dacă e/a fost căsătorit(ă); RO/Străinătate + ⚠️ transcriere.
- **Numele de naștere** (`birthName`).
- **Numele tatălui + mamei** (`parentNames`, ambele obligatorii).
- **Vechiul certificat mi-a fost:** Pierdut / Deteriorat / Furat / Altul. (`oldCertificateReason`)
- **Ați renunțat la cetățenia română?** (`renouncedCitizenship`) → la „Da" ℹ️ notă: certificatul **nu va mai avea CNP** (se anulează la renunțare).
- **Localitatea care a înregistrat actul** (`registrationPlace`).
- **Scopul obținerii** (`purpose`) + **Țara folosirii actului** (`countryOfUse`).

Mirror fidel al WPForms-ului live (7 pași). Validarea pasului cere completarea fiecărui câmp vizibil obligatoriu.

## Status & rămas

- ✅ Formular „Date Stare Civilă" fidel WP (avertismente transcriere naștere/căsătorie, divorț-străinătate, notă CNP la renunțare cetățenie). Preț 998 RON. Build/tsc/eslint verzi.
- ⏳ Picker limbă traducere + țară apostilă (UI peste logica existentă din `options-step.tsx`).
- ⏳ Livrare internațională (Poșta Română / DHL + selecție țară).
- ⏳ Upload „vechiul certificat" + upload acte de identitate părinți (specific naștere); a 3-a declarație pe propria răspundere.

## Fișiere cheie

- Pagină SEO: `src/app/servicii/eliberare-certificat-de-nastere/page.tsx`
- Step wizard: `src/components/orders/modules/civil-status/CivilStatusStep.tsx`
- Tipuri: `src/types/verification-modules.ts` (`CivilStatusConfig`, `CivilStatusState`)
- Config per serviciu: `supabase/migrations/053_civil_status_module.sql`
- Gap analysis: `docs/technical/specs/wp-form-gap-analysis-2026-06-14.md`
