# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: eghiseul.ro

Platforma digitala pentru Romania - servicii publice digitalizate (9 servicii active in DB; 12 planificate in catalog). Rebuild complet din WordPress, arhitectura API-first.

---

## Principiu

> **Documentatia detaliata este in `docs/`.** Acest fisier este un ghid concis cu referinte. NU duplica informatii din docs aici. Regulile de cod, DB si documentatie sunt in `.claude/rules/`.

---

## Navigare Documentatie

| Caut... | Gasesc in... |
|---------|-------------|
| **Status proiect & sprint** | `docs/DEVELOPMENT_MASTER_PLAN.md` |
| **Status curent (ce merge, probleme, testare)** | `docs/STATUS_CURRENT.md` |
| **Index complet docs** | `docs/README.md` |
| **Changelog (ce s-a livrat, pe sesiuni)** | `docs/changelog/` |
| **SEO (location pages, clustere, keywords, GSC)** | `docs/seo/README.md` |
| **🔴 Recuperare după spam update (plan + reguli)** | `docs/seo/2026-09-recuperare-spam-update/` + `.claude/rules/content-and-seo.md` |
| **WebMCP (tools pentru agenți AI)** | `docs/technical/webmcp.md` |
| **Cum adaug serviciu nou** | `docs/technical/specs/modular-wizard-guide.md` |
| **API endpoints** | `docs/technical/api/` + `docs/README.md` (summary) |
| **Admin panel** | `docs/admin/README.md` |
| **Comenzi telefonice (admin A→Z, link plată, link completare)** | `docs/admin/comenzi-telefonice/README.md` |
| **Plată prin transfer bancar (IBAN, „Așteptare plată", confirmare încasare)** | `docs/admin/plata-transfer-bancar.md` |
| **RBAC & permisiuni** | `docs/admin/rbac-permissions.md` |
| **Document generation** | `docs/technical/specs/admin-document-system.md` |
| **KYC identity & face matching** | `docs/technical/specs/kyc-identity-verification.md` |
| **Registru central numere Barou (3 platforme, alocare post-plată)** | `docs/registru-central/README.md` |
| **Number registry (Barou) — spec istoric pre-central** | `docs/technical/specs/number-registry-system.md` |
| **AWB & tracking** | `docs/technical/specs/awb-generation-tracking.md` |
| **Delivery system** | `docs/technical/specs/delivery-system-architecture.md` |
| **Sameday API** | `docs/technical/specs/sameday-api-integration.md` |
| **Fan Courier API** | `docs/technical/specs/fan-courier-integration.md` |
| **Plati & facturare** | `docs/technical/specs/stripe-oblio-payment-invoicing.md` |
| **Workeri Railway (ONRC/ANCPI) — deploy & status** | `docs/technical/specs/railway-workers.md` ⚠️ deploy DIFERĂ: ONRC=`git push`, ANCPI=`railway up` |
| **Security** | `docs/security/README.md` |
| **Cookie consent / GDPR (banner + consent receipts)** | `docs/technical/specs/cookie-consent.md` |
| **Vercel deploy & Stripe webhook** | `docs/deployment/VERCEL_DEPLOYMENT.md` |
| **S3 setup** | `docs/deployment/AWS_S3_SETUP.md` |
| **Variabile de mediu (lista + capcane)** | `.claude/rules/environment.md` (se încarcă automat când atingi `.env*`) + `.env.example` |
| **DB migrations guide** | `docs/deployment/DATABASE_MIGRATIONS.md` |
| **PRD** | `docs/prd/eghiseul-prd.md` |
| **Agenti & orchestrare** | `docs/agents/` |
| **Backlog & features viitoare** | `docs/DEVELOPMENT_MASTER_PLAN.md` (sectiunea BACKLOG) |
| **Referință produs (sister project)** | `/Users/raul/Projects/cazierjudiciaronline.com` — Next.js, sister project, single-tenant flow. Folosește-l ca SURSĂ pentru paritate UX/pricing/features când vine cerința „fă ca acolo". Are detectEntityType pentru PFA/II/IF în `src/components/form/steps/Step2PersonalData.tsx:24-92`, CUI lookup prin infocui.ro în `src/app/api/cui-lookup/route.ts`, courier internațional în `src/components/form/steps/Step4Options.tsx`. NU porta cod orbește — cazierjudiciaronline e single-tenant, noi suntem multi-service multi-tenant. |

---

## Reguli & Conventii

### Database Operations
Vezi `.claude/rules/database.md` pentru reguli detaliate. Ghid complet: `docs/deployment/DATABASE_MIGRATIONS.md`

### Admin Panel

- URL: `/admin/*` (rute protejate)
- Necesita `role = 'super_admin'` sau `'employee'` in tabela `profiles`
- RBAC: 5 roluri (super_admin, manager, operator, contabil, avocat)
- 7 permisiuni: `orders.view`, `orders.manage`, `payments.verify`, `users.manage`, `settings.manage`, `documents.generate`, `documents.view`
- Server: `src/lib/admin/permissions.ts` | Client: `src/hooks/use-admin-permissions.tsx`
- Detalii: `docs/admin/rbac-permissions.md`

### Document Generation

- Auto-generated la submit: `contract-prestari`, `contract-asistenta`
- Custom templates (uploadate de admin): `imputernicire`, `cerere-eliberare-pf`, `cerere-eliberare-pj`
- Multi-signature: client (drawn in wizard) + company + lawyer (predefined PNG din S3)
- Signature embedding: DrawingML inline images via `signature-inserter.ts`
- Detalii: `docs/technical/specs/admin-document-system.md`

### Order Status Workflow
```
paid → processing → documents_generated → submitted_to_institution → document_received → extras_in_progress/document_ready → shipped → completed
```
Plata prin transfer bancar intră înainte de `paid`: `awaiting_payment` (+
`payment_status='awaiting_verification'`) — comanda așteaptă banii, cronul
auto-abandon nu o atinge, iar ieșirea se face DOAR prin butonul „Confirmă plata"
din admin, nu din dropdown-ul de status.
Tranzitii valide enforce-uite server-side in `/api/admin/orders/[id]/process`.

### Contract Legal Validity
- Server-side audit: IP, user agent, server timestamp, SHA-256 document hash
- Consent: Law 214/2024, eIDAS Art. 25, OUG 34/2014
- Metadata salvat in `customer_data.signature_metadata`

### S3 Storage
- Region: eu-central-1, Bucket: eghiseul-documents
- Folders: `kyc/`, `orders/`, `contracts/`, `signatures/`, `templates/custom/`, `invoices/`, `temp/`
- Detalii: `docs/deployment/AWS_S3_SETUP.md`

---

**Last Updated:** 2026-06-22
**Version:** 5.1 (docs reorganizate: root cu 3 docuri vii, `changelog/` nou, foldere index per zonă, istoric în `archive/`)
