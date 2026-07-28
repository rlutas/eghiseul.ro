# 2026-07-28 — „Sunteți căsătorit(ă) în prezent?" pe toate certificatele de stare civilă

**Cerință Raul:** întrebarea despre starea civilă exista doar la o parte din servicii. Varianta bună e cea de la certificat de naștere — „Sunteți căsătorit(ă) în prezent?" da/nu — și trebuie să apară identic la naștere, căsătorie și ambele extrase multilingve.

## Ce am verificat înainte (config LIVE, nu doar migrarea 053)

| Serviciu | `currentlyMarried` (da/nu) | `maritalStatus` (4 opțiuni) |
|---|:-:|:-:|
| `certificat-nastere` | ✅ avea | — |
| `extras-multilingv-certificat-nastere` | ✅ avea | — |
| `certificat-casatorie` | ❌ **lipsea** | — |
| `extras-multilingv-certificat-casatorie` | ❌ **lipsea** | — |
| `certificat-celibat` | — | ✅ avea |

Deci la căsătorie (și la extrasul de căsătorie) nu se întreba **nimic** despre starea civilă actuală. Originalul WPForms (`docs/technical/specs/wp-form-gap-analysis-2026-06-14.md`) avea aceeași gaură — cerință nouă, nu regresie.

## Ce s-a livrat

**Migrarea 137** (`137_stare_civila_casatorit_in_prezent.sql`), aplicată pe DB și verificată:

- `currentlyMarried = true` la `certificat-casatorie` + `extras-multilingv-certificat-casatorie` (naștere & extras naștere incluse explicit, idempotent).
- `maritalStatus = false` la cele două servicii de căsătorie. Cele 4 opțiuni („Care este starea civilă actuală?" Necăsătorit/Căsătorit/Divorțat/Văduv) rămân **exclusiv la celibat** — decizie Raul: peste da/nu ar întreba clientul de două ori aceeași informație.

**Cod** (`CivilStatusStep.tsx`): eticheta `currentlyMarried` era „Sunteți căsătorit(ă)?" → acum „Sunteți căsătorit(ă) **în prezent**?" (formularea cerută, aceeași pe toate serviciile care o afișează, inclusiv naștere).

## Ordinea în pas, la căsătorie

1. Sunteți căsătorit(ă) în prezent? (da/nu)
2. Ați mai fost căsătorit(ă) anterior? → Da deschide: de câte ori + cum s-a încheiat (divorț/deces) + divorț în străinătate recunoscut în RO
3. Căsătoria a avut loc în: România / Străinătate (mereu vizibilă la `documentType === 'casatorie'`, cu avertisment de transcriere la Străinătate)
4. Data căsătoriei, numele soțului/soției înainte de căsătorie, ...

Pagina `/comanda/[service]` e dinamică (fără `revalidate`) → întrebarea apare pe prod imediat după migrare, fără deploy. Eticheta „în prezent" cere deploy.

## Notă pe `applicantType`

La naștere, `currentlyMarried` se afișează doar pentru Adult (`isAdult` din `applicantType`). Căsătoria/extrasul de căsătorie nu au `applicantType`, deci `isAdult` e implicit true → întrebarea se afișează mereu. Corect: nu există certificat de căsătorie pentru minor solicitat ca minor.

## Fișiere

- `supabase/migrations/137_stare_civila_casatorit_in_prezent.sql`
- `src/components/orders/modules/civil-status/CivilStatusStep.tsx`
- `src/types/verification-modules.ts` (comentarii câmpuri: `currentlyMarried` = 4 servicii, `maritalStatus` = doar celibat, nu se cumulează)
- `docs/services/certificat-casatorie/README.md`
