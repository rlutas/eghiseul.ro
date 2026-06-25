# 2026-06-25 — Cont colaborator (topograf) + catalog servicii ANCPI/OCPI

Pe baza analizei concurentului **cfunciara.ro** am adăugat infrastructura pentru servicii
cadastrale fulfilate manual de un topograf autorizat (Mircea) + catalogul de servicii noi.

## Rol nou „collaborator" + scoping pe servicii
Migrare **083_collaborator_role.sql**:
- `profiles.role` acceptă `collaborator`; helper `is_collaborator()` (mirror `is_partner()`).
- tabel `collaborator_service_assignments(collaborator_id, service_id, can_upload_pdf)` — fiecare colaborator e legat de serviciile lui.
- RLS: colaboratorul vede (SELECT) doar `orders` + `order_documents` ale serviciilor alocate; doar super_admin/manager gestionează alocările.

RBAC (`src/lib/admin/permissions.ts`):
- permisiune nouă `orders.pdf_upload`; `ROLE_DEFAULTS.collaborator = ['orders.view','orders.pdf_upload']`.
- `collaborator` **NU** e în `ADMIN_ROLES` → fără acces la `/admin`.
- helperi: `getCollaboratorServices()`, `requireCollaboratorForOrder()` (scope check la fiecare rută).

## Portal colaborator `/colaborator`
- `layout.tsx` — guard strict `role === 'collaborator'`, chrome minimal.
- `orders/page.tsx` — listă comenzile serviciilor alocate (filtrate prin API + scope).
- `orders/[id]/page.tsx` — datele clientului + imobilul, încărcare PDF, „Marchează gata & livrează".

API `src/app/api/collaborator/`:
- `GET /orders`, `GET /orders/[id]` — scoped pe servicii alocate.
- `POST /orders/[id]/upload-pdf` — validează `%PDF-` + ≤20MB, **comprimă cu CloudConvert**, urcă în S3 (`generateFinalDocumentKey`), atașează în `order_documents` ca **nevizibil clientului** (`metadata.source='collaborator'`).
- `POST /orders/[id]/mark-ready` — auto-livrare.

## Compresie PDF + auto-livrare
- `src/lib/documents/pdf-compress.ts` — CloudConvert `optimize` (recompresie imagini scanate). Fallback dur la PDF original dacă lipsește cheia / eșuează / iese mai mare. Nu blochează niciodată upload-ul.
- `src/lib/collaborator/deliver.ts` — `deliverCollaboratorResult()` (mirror `ancpi/deliver.ts`): face documentele vizibile clientului, status `document_ready`, email idempotent. Flux: **plătit → Mircea lucrează → auto-livrare**.

## Catalog servicii (grup A+B)
Migrare **084_topograf_services.sql** — 14 servicii noi `imobiliare`, manuale (fără KYC/semnătură), reutilizând `PropertyDataStep` (zero cod React):
- **căutare după imobil**: certificat de sarcini, copie CF in extenso, copie plan cadastral, copie inventar coordonate Stereo 70, copie intabulare, copie releveu, copie din arhiva OCPI, copie contract V-C, PAD, copie plan încadrare, extras CF colectivă, actualizare adresă CF.
- **căutare după proprietar** (`identificationService`): identificare imobile după proprietar, certificat deținere imobile.
- Orderabile imediat la `/comanda/[slug]` (wizard slug-driven).
- ⚠️ **Prețuri = placeholder**, editabile din `/admin/settings → Servicii`, în așteptarea listei lui Mircea.

## Pagini content/SEO (14 noi)
Pentru fiecare serviciu nou, pagină `/servicii/[slug]` pe template-ul CF (`extras-plan-cadastral`):
hero + price card (ex-TVA/TVA din `base_price`), trust strip, intro „Ce este X", identifiers,
use-cases, timeline „Cum funcționează", ReviewsSection, cross-links (`serviceUrl()`), `ServiceFAQ`
(8-9 Q&A inline + schema FAQPage prin `buildServicePageGraph`), CTA, MobileStickyCTA. ~1000-1400
cuvinte unice RO/pagină. Constrângerea Google Ads respectată (fără „oficiale"+„documente"). Sitemap
le include automat (fallback dinamic pe slug-uri DB); `serviceUrl()` rezolvă direct la `/servicii/<slug>/`.

## Cont Mircea (test)
Creat direct: `mircea@yahoo.com`, rol `collaborator`, 14 servicii alocate. (Fără UI de invitare —
creare directă, la cererea userului.)

## Verificat
- Migrări 083+084 aplicate și verificate pe DB (17 servicii imobiliare total, RLS + policies prezente).
- `npm run build` OK (toate 14 pagini noi randate static ○), lint curat.
- Cont colaborator funcțional; serviciile orderabile la `/comanda/<slug>`.

## Prețuri + termene + urgență (aliniate la cfunciara) — migrări 085+086
Sursă: `docs/services/ancpi-servicii-costuri.csv`. `base_price` e cu TVA → `cfunciara_bază × 1.21`
(139→168.19, 179→216.59, 250→302.50). Termene din CSV (4/5/15 zile) în `estimated_days` +
`processing_config.estimated_days_display`.

**Urgență per document** (analiză cfunciara — diferă mult): opțiune `service_options` code=`urgenta`
(`Procesare Prioritară`, preț fix), + `urgent_available`/`urgent_days`. Surcharge ×1.21:
- copii simple (inventar, releveu, arhivă): **+134.31** → 2 zile
- extrase/CF colectivă (copie CF, extras-cf-colectiv): **+182.71** → 2 zile
- copii cu lucrare topograf (plan cadastral, intabulare, contract, PAD, plan încadrare): **+255.31** → 2 zile
- actualizare adresă: **+423.50** → 5 zile (vs 15)
- fără urgență (ca cfunciara): certificat-sarcini, identificare-imobile-proprietar, certificat-detineri-imobile

## Dropdown schimbare serviciu (cfunciara-style)
`ServiceSwitcher` (`src/components/services/service-switcher.tsx`) + helper `getImobiliareServices()`
(`src/lib/services/imobiliare.ts`). Two moduri: `order` (→ `/comanda/<slug>`) pe pagina wizardului
pentru servicii `imobiliare`; `page` (→ `serviceUrl(slug)`) pe toate cele 17 pagini `/servicii`
imobiliare. Permite comutarea rapidă între documentele cadastrale fără pierderea contextului.

## Admin: secțiune Colaboratori + onorariu topograf (migrare 087)
- `services.lawyer_fee_ron = 15` pe cele 14 servicii imobiliare (același mecanism ca onorariul avocatului). Linia de factură Oblio se numește **„Onorariu Topograf"** pentru serviciile `imobiliare` (vs „Onorariu Avocat") — `lib/oblio/invoice.ts` (`fee_label`/`fee_description`) + `ensure-invoice.ts` (după `category`).
- `/admin/colaboratori` (permisiune `orders.view`): selectezi colaboratorul + luna → sumar (nr comenzi, încasări, onorarii) + tabel comenzi + **export CSV/TSV**. API: `/api/admin/collaborators` + `/api/admin/collaborators/orders` (cu `format=tsv`).
- Separat de secțiunea ANCPI (aceea rămâne pentru workerul automat). Onorariile avocat rămân pe serviciile lor; topograf pe cele imobiliare.

## Rămas (backlog)
- UI admin de invitare/management colaboratori (acum: creare directă în DB).
- Pass SEO fin (GSC keywords, location pages unde aplică) + listare în indexul `/servicii`.
- Grup C cfunciara (certificate urbanism, pachete Casa Verde/credit ipotecar) — val 2.
