# Servicii & Capabilități — ce avem, ce putem face

Inventar complet al serviciilor active + capabilitățile platformei. Pentru documentația detaliată per serviciu, vezi folderele de mai jos (fiecare cu `README.md`: SEO, flux comandă, câmpuri speciale).

> **Sursă de adevăr pentru preț/termen:** tabela `services` din DB (coloanele `base_price`, `estimated_days`, `processing_config`). Editabile din `/admin/settings` → Servicii (preț, zile, termen afișat). Valorile de mai jos = snapshot 2026-06-23 (migrațiile 077-079).

## Servicii active (DB)

| Serviciu | Preț (RON) | Termen standard | Urgent | KYC | Add-on / specific | Automatizare |
|---|--:|---|---|:--:|---|---|
| Cazier Judiciar (hub + PF + PJ) | 198 | 2-4 zile lucrătoare | 1-2 zile | da | apostilă/traducere/legalizare, +Certificat Integritate | — |
| Cazier Fiscal | 198 | 2-4 zile lucrătoare | — | da | apostilă/traducere/legalizare | — |
| Cazier Auto | 198 | 2-4 zile lucrătoare | 1-2 zile | da | număr permis | — |
| Certificat Integritate | 198 | 2-4 zile lucrătoare | 1-2 zile | da | +Cazier Judiciar | — |
| Certificat Naștere | 998 | 7-15 zile* | — | da | **+Extras Multilingv 399** | — |
| Certificat Căsătorie | 998 | 7-15 zile* | — | da | **+Extras Multilingv 399** | — |
| Certificat Celibat | 698 | 7-15 zile* | — | da | — | — |
| Certificat Constatator | 89+ (pe tip) | câteva minute (24/7) | — | nu | preț pe tip document | **worker ONRC** A→Z |
| Extras Carte Funciară | 89 | câteva minute (24/7) | — | nu | extra imobil (multi-imobil) | **worker ANCPI** A→Z |
| Extras Plan Cadastral | 79.99 | câteva minute (24/7) | — | nu | — | ANCPI |
| Identificare Imobil | 198 | 2-4 zile lucrătoare | — | nu | — | — |
| Verificare Rovinietă (tool) | 0 (gratuit) | instant | — | nu | widget erovinieta.net | — |

\* **Termen dinamic pe oficiul de stare civilă** (naștere/căsătorie/celibat): București + sectoare = 15-30 zile, oficii rapide (listă editabilă admin, ex. Satu Mare) = 5-7 zile, restul = 7-15 zile. Logică: `src/lib/civil-status/delivery-terms.ts`; editabil din `/admin/settings` → „Termene stare civilă".

## Capabilități platformă (features)

**Wizard de comandă (modular):**
- Pași dinamici din `verification_config` (JSONB) → `buildWizardSteps()`. Module: `personal-kyc`, `company-kyc`, `civil-status`, `constatator`, `property`, `vehicle`, `signature`.
- Pasul „Opțiuni" sărit automat la serviciile digitale fără opțiuni (constatator + property/CF).
- Secțiune generică „Documente suplimentare" în pasul Opțiuni (randează orice add-on activ ne-tratat de secțiunile dedicate — ex. extras multilingv).
- Add-on-uri cross-service (combini servicii într-o comandă: ex. integritate + cazier judiciar).
- Lanț apostilă/traducere/legalizare cu dependențe + țară/limbă.

**Preț & termen (editabile din admin, fără cod):**
- `/admin/settings` → Servicii → Edit: preț, zile estimare, **termen standard + termen urgent** (string afișat).
- `/admin/settings` → Termene stare civilă: cele 3 tiers + lista oficii rapide.
- Termenul se propagă peste tot (pagini `/servicii/*` + wizard) via `formatEstimatedDays`/`formatUrgentDays` + `resolveCivilTermTier`.

**KYC & documente:** OCR Gemini (CI/pașaport, MRZ), face matching, generare DOCX (contract prestări/asistență, împuternicire, cerere) cu semnături multiple (client + firmă + avocat), numerotare (Barou).

**Plăți & facturare:** Stripe (card/Apple Pay/Google Pay), facturare Oblio (e-factura), reconciliere (backlog).

**Curier:** Fan Courier + Sameday (RO), AWB + tracking, curier internațional (backlog paritate).

**Automatizare instituții:** worker ONRC (constatator — toate tipurile A→Z, ~minute) + worker ANCPI (extras CF — emite PDF automat). Ambii pe Railway, repo-uri separate. Vezi `docs/technical/specs/railway-workers.md`.

## Convenții arhitecturale comune

- **Slug parity WP:** paginile SEO sunt hardcodate la URL-ul WP cu trafic; slug-ul DB face 308-redirect (`next.config.ts`). Link-uri interne via `serviceUrl()` din `lib/seo/constants.ts`.
- **Schema:** `@graph` complet via `lib/seo/schema.ts` (Org + WebSite + Breadcrumb + Service + Offer + AggregateRating + WebPage).
- **Wizard modular:** pașii din `verification_config` → `buildWizardSteps()`. Vezi `src/types/verification-modules.ts`.

## Backlog servicii (vezi `../DEVELOPMENT_MASTER_PLAN.md`)
- Standalone Extras Multilingv (799 lei) — paginile SEO există, lipsește fluxul de comandă.
- Specimene PNG vechi pe 4 pagini (integritate/auto/fiscal/constatator) — fără WebP 2025.
- Constatator: filtrare „scop" pe tip raport.
