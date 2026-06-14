# Certificat de Celibat

Dovada oficială de Stare Civilă că o persoană nu este căsătorită (numită și adeverință de celibat / certificat de stare civilă). Necesar mai ales pentru căsătoria în străinătate și dosare de cetățenie. Procesare 100% online.

| Atribut | Valoare |
|---|---|
| **Slug DB** | `certificat-celibat` |
| **URL SEO (canonic)** | `/servicii/eliberare-certificat-de-celibat/` |
| **Preț** | 179 RON (taxe incluse) |
| **Categorie** | Personale — Stare Civilă |
| **Termen** | 7 zile lucrătoare standard · 3 zile Urgent |

## SEO

- **URL canonic:** `/servicii/eliberare-certificat-de-celibat/` (slug WP, hardcoded pentru paritate). Slug-ul DB `certificat-celibat` face **308-redirect** către URL-ul SEO.
- **Schema slug:** `eliberare-certificat-de-celibat` (JSON-LD breadcrumb + offers).
- **Interogări țintă:** „certificat de celibat online", „adeverință de celibat", „certificat de celibat romania", „certificat de celibat căsătorie străinătate", „certificat de stare civilă".
- **Performanță GSC:** ~108k impresii.
- **Status pagină:** live, server component (`revalidate = 3600`). JSON-LD via `buildServicePageGraph` (Service + BreadcrumbList + offers 179 RON + aggregateRating 4.9/450). OG image `/og/certificat-celibat.png`.

## Flux comandă (wizard)

Flux modular PF: contact → date personale (CNP) → **Date Stare Civilă** → opțiuni → KYC (act + selfie) → semnătură → livrare → facturare → review.

### Pasul „Date Stare Civilă" (modul `civil-status`, `documentType: 'celibat'`)

Config-driven din `verification_config.civilStatus` (migrarea 053). Câmpuri activate pentru celibat:

- **Localitatea + Județul/Sectorul nașterii** (`birthLocality`, două inputuri).
- **Naționalitatea** (`nationality`).
- **Care este starea civilă actuală?** Necăsătorit(ă) / Căsătorit(ă) / Divorțat(ă) / Văduv(ă). (`maritalStatus`)
- **Istoric marital** (`maritalHistory`): „Ați mai fost căsătorit(ă) anterior?" → Da deschide: de câte ori (count) + „Ultima căsătorie s-a încheiat prin" Divorț/Deces. La **Divorț** → ⚠️ divorțul din străinătate trebuie recunoscut în RO. Sub-întrebare specifică celibatului: **„Mai dețineți vechiul certificat de căsătorie?"** (`stillHaveOldMarriageCert`).
- **Locul căsătoriei** (`marriagePlace`) — apare condițional dacă a existat o căsătorie anterioară; RO/Străinătate + ⚠️ transcriere.
- **Solicitați certificatul în vederea căsătoriei în străinătate?** Da/Nu. (`marriageAbroadIntent`)
- **Localitatea care a înregistrat actul** (`registrationPlace`).
- **Scopul obținerii** (`purpose`) + **Țara folosirii actului** (`countryOfUse`).

Notă: câmpul `renouncedCitizenship` a fost **scos** la celibat (nu apare pe formularul WP). Mirror fidel al WPForms-ului live (7 pași).

## Status & rămas

- ✅ Formular „Date Stare Civilă" fidel WP (localitate+județ naștere, naționalitate, stare civilă actuală, istoric marital + „mai dețineți vechiul certificat", intenție căsătorie străinătate). Build/tsc/eslint verzi.
- ⏳ **Upsell celibat → naștere** (cross-sell cu bundling): câmpurile WP „Dețineți certificatul de naștere nou (albastru)?" + „Doriți să vă ajutăm cu obținerea certificatului de naștere?" (WP 96/97) declanșează un sub-flux de comandă certificat naștere. **Deferred** — feature separat.
- ⏳ Picker limbă traducere + țară apostilă (UI peste logica existentă din `options-step.tsx`).
- ⏳ Livrare internațională (Poșta Română / DHL + selecție țară); a 3-a declarație pe propria răspundere.

## Fișiere cheie

- Pagină SEO: `src/app/servicii/eliberare-certificat-de-celibat/page.tsx`
- Step wizard: `src/components/orders/modules/civil-status/CivilStatusStep.tsx`
- Tipuri: `src/types/verification-modules.ts` (`CivilStatusConfig`, `CivilStatusState`)
- Config per serviciu: `supabase/migrations/053_civil_status_module.sql`
- Gap analysis: `docs/technical/specs/wp-form-gap-analysis-2026-06-14.md`
