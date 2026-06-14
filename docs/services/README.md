# Servicii — documentație per serviciu

Index al documentației detaliate per serviciu. Fiecare serviciu are folderul lui cu `README.md`: SEO (URL canonic, interogări țintă, status pagină), fluxul de comandă (module wizard + câmpuri speciale), preț și status.

Vezi și: `docs/seo/gsc-data/SERVICE-RANKING-PLAYBOOK-2026-06-13.md` (analiza GSC per serviciu), `docs/admin/README.md` (generare documente).

## Servicii active

| Serviciu | Doc | URL SEO canonic | Preț (RON) | Categorie | Flux comandă special |
|---|---|---|--:|---|---|
| Cazier Judiciar (hub + PF + PJ) | [cazier-judiciar](cazier-judiciar/) | `/servicii/cazier-judiciar-online/` | 198 | juridice | personal-KYC |
| Extras Carte Funciară | [extras-carte-funciara](extras-carte-funciara/) | `/servicii/extras-de-carte-funciara/` | 79.99 | imobiliare | identificare imobil |
| Cazier Fiscal | [cazier-fiscal](cazier-fiscal/) | `/servicii/cazier-fiscal-online/` | 198 | fiscale | personal-KYC |
| Certificat Naștere | [certificat-nastere](certificat-nastere/) | `/servicii/eliberare-certificat-de-nastere/` | 998 | personale | **Date Stare Civilă** |
| Certificat Căsătorie | [certificat-casatorie](certificat-casatorie/) | `/servicii/eliberare-certificat-de-casatorie/` | 998 | personale | **Date Stare Civilă** |
| Certificat Celibat | [certificat-celibat](certificat-celibat/) | `/servicii/eliberare-certificat-de-celibat/` | 179 | personale | **Date Stare Civilă** |
| Certificat Constatator | [certificat-constatator](certificat-constatator/) | `/servicii/certificat-constatator-online/` | 119.99 / 499.99 | comerciale | **Detalii Certificat** (preț pe tip) |
| Certificat Integritate | [certificat-integritate](certificat-integritate/) | `/servicii/certificat-de-integritate-comportamentala/` | 250 | juridice | personal-KYC |
| Cazier Auto | [cazier-auto](cazier-auto/) | `/servicii/cazier-auto-online/` | 198 | auto | vehicul |
| Verificare Rovinietă (tool) | [rovinieta](rovinieta/) | `/tools/verificare-rovinieta-online/` | 0 (gratuit) | auto | widget erovinieta.net |

## Convenții arhitecturale comune

- **Slug parity WP:** paginile SEO sunt hardcodate la URL-ul WP cu trafic; slug-ul DB face 308-redirect acolo (`next.config.ts`). Link-urile interne folosesc `serviceUrl()` din `lib/seo/constants.ts` (niciodată prin redirect).
- **Schema:** `@graph` complet via `lib/seo/schema.ts` (Org + WebSite + Breadcrumb + Service + Offer + AggregateRating 4.9/450 + WebPage + reviewedBy). Fără FAQPage/HowTo.
- **Wizard modular:** pașii vin din `verification_config` (JSONB pe `services`) → `buildWizardSteps()`. Module dedicate: `civil-status` (certificate stare civilă), `constatator` (ONRC). Vezi `src/types/verification-modules.ts`.
- **Module noi (2026-06-14):** `civil-status` (migrarea 053) și `constatator` (migrarea 054, preț pe tip document).

## Automatizare viitoare

`certificat-constatator` (și viitor furnizare-informații) alimentează **botul ONRC** — vezi `docs/technical/specs/onrc-automation-plan.md`.
