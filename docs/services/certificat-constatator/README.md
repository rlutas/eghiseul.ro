# Certificat Constatator ONRC Online

| | |
|---|---|
| **Slug DB** | `certificat-constatator` |
| **URL SEO** | `/servicii/certificat-constatator-online/` |
| **Preț / Tip** | Document price-bearing (option A): pe Firmă 119.99 RON · Persoană Fizică 119.99 RON · cu Istoric 499.99 RON (taxe ONRC incluse) |
| **Categorie** | Comerciale (emitent: ONRC — Registrul Comerțului) |

Document oficial ONRC care atestă datele actuale ale unei firme: denumire, formă juridică, sediu social, CUI, asociați, administratori, capital social și obiect de activitate. Folosit la licitații publice (SEAP/SICAP), due diligence, contracte/parteneriate și credit firmă. Procesare 100% online, livrare PDF semnat electronic pe email.

## SEO

- **URL canonic:** `/servicii/certificat-constatator-online/` (slug WP `certificat-constatator-online`, păstrează URL-ul indexat + backlink-urile).
- **Redirect:** slug DB `certificat-constatator` face 308 către URL-ul canonic. `/comanda/certificat-constatator` rămâne pe slug DB pentru checkout.
- **Volum GSC:** ~331k impresii / CTR 0.27% — **cel mai slab CTR din portofoliu**, deci cerere latentă mare. Prioritate de optimizare a titlului/descrierii și a snippet-ului.
- **Clustere țintă:** `certificat constatator online`, `certificat constatator extins / la zi`, `ce conține certificatul constatator`, `valabilitate certificat constatator` (uzual ≤30 zile), `certificat constatator ONRC / Registrul Comerțului`, `certificat constatator după denumire / CUI`.
- **Bloc onest:** secțiune „certificat constatator de pe portalul RECOM ONRC vs. online prin eGhișeul" (captează intentul „gratuit / fără cont RECOM").

### Status pagină hardcodată + schema
- Pagină hardcodată la slug-parity WP: `src/app/servicii/certificat-constatator-online/page.tsx` (prerendată static, `revalidate = 3600`).
- Schema `@graph` completă via `buildServicePageGraph` (Organization + WebSite + BreadcrumbList + Service + Offer 119.99 RON + AggregateRating 4.9/450 + WebPage + reviewedBy).
- Meta via `buildPageMetadata` (canonical + OG `/og/certificat-constatator.png` + robots).
- Proză indexabilă: „ce este / de unde se obține", „ce conține" (4 carduri), use-cases (licitații / contracte / due diligence / bancă), „cum funcționează" 4 pași, tipuri (simplu / extins / cu istoric) + valabilitate, FAQ 8×.

## Flux comandă (module wizard)

Comandă company-KYC pe slug DB (`/comanda/certificat-constatator`):

1. **Contact** — date de contact solicitant.
2. **Detalii Certificat** (modul `constatator`) — tipul documentului (firmă/PF/istoric) e ales primul (drive CUI vs CNP).
3. **Date firmă** — CUI + autocomplete (doar pentru firmă/istoric).
4. **Documente firmă** — upload documente companie (modul company-kyc, condiționat).
5. **Facturare** — date de facturare.

> **Serviciu digital — pașii Opțiuni și Livrare sunt SĂRITE** (constatatorul e auto-emis, doar email PDF, fără
> curier). Vezi `step-builder.ts` (`isConstatator`). La fel ca extras carte funciară.

**Fără documente avocațiale** (în `NO_LAWYER_SERVICES`): se generează doar `contract-prestari`, fără contract de
asistență juridică / împuternicire / cerere / nr. Barou. **Partea contractantă din contract = datele de facturare**
(PF: nume+CNP / PJ: firmă+CUI) — nu există buletin scanat. Admin: cardul „Date personale" e ascuns când e gol.

### Pasul „Detalii Certificat" (modul `constatator`)

Component: `src/components/orders/modules/constatator/ConstatatorStep.tsx`. Citește `verification_config.constatator` (migration 054). Câmpuri:

- **Tipul documentului** (`documentType`) — **price-bearing (option A): selecția suprascrie prețul de bază al comenzii**:
  - `firma` — Certificat Constatator pe Firmă — **119.99 RON**
  - `pf` — Certificat Constatator Persoană Fizică — **119.99 RON**
  - `istoric` — Certificat Constatator cu Istoric — **499.99 RON**
- **Tip raport** (`reportType`, condiționat) — apare doar pentru tipurile cu `reportTypes` definite în config (`pf` și `istoric`). Pentru `firma` nu se cere.
- **Document solicitat spre a servi la** (`purpose`) — destinația: CNAS, Administrația Finanțelor Publice, ANAF, AFIR, Autorizare, Eliberare cazier judiciar, Informare, Înregistrare în scopuri de TVA, Poliție, Primărie, **Altele** (la „Altele" se completează `otherPurpose` text liber).
- **Perioada** (`period`) — `founding` (de la înființare până în prezent) sau `custom` (interval `periodFrom`/`periodTo`).
- **Persoană solicitantă** — `requesterName` (nume complet) + `requesterCnp` (13 cifre, validat).

Datele se salvează în `customer_data.constatator` (+ `customer_data.company` din pasul date firmă).

## Status & rămas

- ✅ **Modul `constatator` + prețul pe tip (option A)** — live; config aplicat via REST în migration `054_constatator_module.sql` (2026-06-14). Oglindește formularul WPForms live.
- ⚠️ **Maparea tip-raport (`reportTypes`) este o presupunere ajustabilă** — valorile per tip de document (ex. `pf`: „de bază / fonduri IMM / insolvență"; `istoric`: „CAS / pe persoană / IGI viză") sunt preluate din formularul WP și se pot ajusta ulterior fără schemă (update value-only pe `verification_config`).
- ✅ **Automatizare ONRC LIVE** — botul/worker-ul ONRC emite automat (firmă de bază/IMM/insolvență + PF + istoric); job creat la plata confirmată, document atașat + email. Vezi `docs/technical/specs/onrc-automation-plan.md`. Pasul `constatator` captează `documentType`, `reportType`, `purpose`, `period{,From,To}`, `requesterName`, `requesterCnp` + `customer_data.company`.
- Rămas: imagine OG `/og/certificat-constatator.png` de generat; CTR de optimizat (cel mai slab din portofoliu).

## Fișiere cheie

- `src/app/servicii/certificat-constatator-online/page.tsx` — pagina SEO hardcodată.
- `src/components/orders/modules/constatator/ConstatatorStep.tsx` — pasul „Detalii Certificat".
- `src/types/verification-modules.ts` — `ConstatatorConfig`, `ConstatatorState`.
- `supabase/migrations/054_constatator_module.sql` — config `verification_config.constatator` (tipuri + preț + purposes).
- `docs/technical/specs/onrc-automation-plan.md` — plan bot automation ONRC (consumă `customer_data.constatator`).
