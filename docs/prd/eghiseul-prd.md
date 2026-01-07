# eGhiseul.ro - Product Requirements Document

**Version:** 2.0
**Date:** 7 Ianuarie 2026
**Author:** Product Team

> **Update History:**
> - v2.0 (2026-01-07): Updated tech stack (Google Gemini for OCR/KYC), modular wizard architecture
> - v1.0 (2024-12-15): Initial PRD

## Product overview

### Product summary

eGhiseul.ro este o platforma digitala care simplifica accesul la documente si servicii guvernamentale pentru cetatenii romani, in special cei din diaspora. Platforma permite comandarea online de documente oficiale (caziere, certificate de stare civila, extrase), gestionand intregul proces de la comanda pana la livrare.

**Rebuild motivation:** Platforma actuala WordPress cu WPForms prezinta limitari semnificative:
- Lipsa unui admin dashboard centralizat (comenzi in Google Sheets)
- Proces manual de generare contracte
- KYC problematic (upload-uri nesigure)
- Inconsistente intre flow-urile serviciilor
- Scalabilitate limitata

**Target:** Rebuild complet in Next.js + Node.js cu arhitectura API-first pentru scalabilitate, integrari B2B si potential white-label.

### Scope

| In Scope | Out of Scope |
|----------|--------------|
| 12 servicii existente | Servicii noi nedefinite |
| Admin dashboard | Mobile app nativa (Faza 1) |
| Sistem contracte | AI chatbot avansat |
| KYC si verificare | White-label full (Faza 1) |
| Notificari email/SMS | Integrare directa CNAIR/ANAF |
| API pentru parteneri | |
| Conturi utilizatori | |

## Goals

### Business goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| BG-1 | Cresterea eficientei operationale | Timp procesare comanda | -50% |
| BG-2 | Reducerea erorilor manuale | Rate erori | <2% |
| BG-3 | Cresterea conversiilor | Conversion rate | +30% |
| BG-4 | Diversificarea veniturilor | Revenue din API/B2B | 20% din total |
| BG-5 | Retentie clienti | Repeat customers | +40% |
| BG-6 | Conformitate legala | Contracte stocate corect | 100% |

### User goals

| # | Goal | Description |
|---|------|-------------|
| UG-1 | Comanda rapida | Finalizare comanda in <10 minute |
| UG-2 | Transparenta | Vizibilitate clara status si pret |
| UG-3 | Incredere | KYC si contracte profesionale |
| UG-4 | Comoditate | Livrare la adresa, oriunde in lume |
| UG-5 | Suport | Raspuns la intrebari in <24h |

### Non-goals

- Nu construim integrari directe cu institutiile statului (CNAIR, ANAF, Politie) in MVP
- Nu oferim servicii juridice sau consultanta legala
- Nu procesam plati in numerar
- Nu dezvoltam aplicatii mobile native in prima faza
- Nu construim un marketplace pentru alti furnizori

## User personas

### Persona 1: Maria - Romanca in diaspora

| Attribute | Detail |
|-----------|--------|
| **Age** | 28-45 ani |
| **Location** | Germania, UK, Italia, Spania |
| **Occupation** | Angajat |
| **Tech savvy** | Mediu-inalt |
| **Primary need** | Documente pentru job/locuinta in strainatate |
| **Pain points** | Nu poate veni in Romania, nu cunoaste procesul |
| **Services used** | Cazier judiciar, Certificate stare civila, Apostila |

### Persona 2: Andrei - Reprezentant firma

| Attribute | Detail |
|-----------|--------|
| **Age** | 30-50 ani |
| **Location** | Romania |
| **Occupation** | HR Manager / Administrator |
| **Tech savvy** | Mediu |
| **Primary need** | Caziere pentru angajati, documente firma |
| **Pain points** | Volum mare, timp pierdut, KYC pentru fiecare angajat |
| **Services used** | Cazier judiciar bulk, Certificat constatator, Cazier fiscal |

### Persona 3: Ion - Cetatean roman

| Attribute | Detail |
|-----------|--------|
| **Age** | 25-60 ani |
| **Location** | Romania (oras mic sau rural) |
| **Occupation** | Variat |
| **Tech savvy** | Scazut-mediu |
| **Primary need** | Documente fara deplasare la institutii |
| **Pain points** | Lipsa timp, cozi, birocratie |
| **Services used** | Extras carte funciara, Rovinieta, Certificate |

### Persona 4: Admin operator

| Attribute | Detail |
|-----------|--------|
| **Role** | Operator comenzi eGhiseul |
| **Primary need** | Procesare rapida si corecta a comenzilor |
| **Pain points** | Date dispersate, lipsa overview, procese manuale |
| **Key features** | Dashboard centralizat, automatizari, notificari |

### Role-based access

| Role | Permissions |
|------|-------------|
| **Guest** | Vizualizare servicii, preturi, FAQ |
| **Customer** | Comanda, plata, vizualizare comenzi proprii, KYC |
| **Registered Customer** | + Istoric, date salvate, KYC persistent |
| **Operator** | Gestiune comenzi, upload documente, schimbare status |
| **Admin** | + Configurare servicii, preturi, rapoarte, useri |
| **Super Admin** | + Acces complet, logs, configurare sistem |

## Functional requirements

### FR-1: Servicii si comenzi (P0) ✅ IMPLEMENTED

> **Implementation:** Modular Wizard System at `/comanda/[service-slug]`
> See `docs/technical/specs/modular-wizard-guide.md` for architecture.

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-1.1 | Sistem modular pentru 12+ servicii | P0 | ✅ Done (via `verification_config` JSONB) |
| FR-1.2 | Flow dinamic bazat pe configurația serviciului | P0 | ✅ Done (Modular Wizard) |
| FR-1.3 | Configurare serviciu: pret, campuri, optiuni, KYC required | P0 | ✅ Done |
| FR-1.4 | Cross-sell intre servicii (Cazier + CIC, Certificate + Multilingv) | P0 | ⏳ Sprint 5 |
| FR-1.5 | Optiuni: urgenta, traducere (20 limbi), apostila | P0 | ✅ Done |
| FR-1.6 | Calcul pret dinamic bazat pe selectii | P0 | ✅ Done |

### FR-2: KYC - Know Your Customer (P0) ✅ IMPLEMENTED

> **Implementation:** Google Gemini 1.5 Flash via `/api/kyc/validate`
> See `docs/technical/api/ocr-kyc-api.md` for API documentation.

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-2.1 | Upload act identitate (CI/Pasaport) - max 2 fisiere | P0 | ✅ Done |
| FR-2.2 | Upload selfie cu document in mana | P0 | ✅ Done |
| FR-2.3 | Semnatura electronica (canvas) | P0 | ✅ Done |
| FR-2.4 | Upload documente suplimentare (permis auto, acte parinti) | P0 | ✅ Done |
| FR-2.5 | Validare format si marime fisiere | P0 | ✅ Done |
| FR-2.6 | Stocare securizata documente (S3 encrypted) | P0 | ⏳ Sprint 4 |
| FR-2.7 | Face matching între ID și selfie | P0 | ✅ Done |
| FR-2.8 | Confidence scores pentru validare | P0 | ✅ Done |

### FR-3: Plati si facturare (P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | Integrare Stripe (card, 3D Secure) | P0 |
| FR-3.2 | Suport PF si PJ (tax ID ro_tin) | P0 |
| FR-3.3 | Integrare Olbio pentru facturi automate | P0 |
| FR-3.4 | Cupoane de reducere | P0 |
| FR-3.5 | Email confirmare plata cu factura | P0 |
| FR-3.6 | Plata manuala (transfer bancar) - admin only | P1 |

### FR-4: Contracte si documente legale (P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Generare automata contract prestari servicii | P0 |
| FR-4.2 | Generare imputernicire/delegatie | P0 |
| FR-4.3 | Numerotare automata (Nr. contract sequential) | P0 |
| FR-4.4 | Template-uri editabile per serviciu | P0 |
| FR-4.5 | Stocare 10 ani conform legii | P0 |
| FR-4.6 | Export PDF contract semnat | P0 |

### FR-5: Admin dashboard (P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Lista comenzi cu filtre (status, serviciu, data, client) | P0 |
| FR-5.2 | Detalii comanda (date client, documente, istoric) | P0 |
| FR-5.3 | Schimbare status comanda cu notificare automata | P0 |
| FR-5.4 | Upload document final pentru client | P0 |
| FR-5.5 | Creare comanda manuala | P0 |
| FR-5.6 | Statistici si rapoarte | P1 |

### FR-6: Notificari (P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6.1 | Email confirmare comanda noua | P0 |
| FR-6.2 | Email la schimbare status | P0 |
| FR-6.3 | Email cu document final | P0 |
| FR-6.4 | Notificare admin la comanda noua | P0 |
| FR-6.5 | SMS notificari (optional) | P1 |

### FR-7: Livrare (P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-7.1 | Livrare electronica (email cu document) | P0 |
| FR-7.2 | Livrare fizica Romania (Fan Curier +25 RON) | P0 |
| FR-7.3 | Livrare internationala Posta Romana (+100 RON) | P0 |
| FR-7.4 | Livrare internationala DHL (+200 RON) | P0 |
| FR-7.5 | Tracking livrare | P1 |

### FR-8: Conturi utilizatori (P1)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-8.1 | Inregistrare cu email | P1 |
| FR-8.2 | Login cu email/parola sau magic link | P1 |
| FR-8.3 | Istoric comenzi | P1 |
| FR-8.4 | Date pre-completate | P1 |
| FR-8.5 | KYC salvat si reutilizabil | P1 |

### FR-9: API pentru parteneri (P1)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-9.1 | REST API pentru toate serviciile | P1 |
| FR-9.2 | Autentificare API keys | P1 |
| FR-9.3 | Webhooks pentru status updates | P1 |
| FR-9.4 | Rate limiting | P1 |
| FR-9.5 | Documentatie OpenAPI/Swagger | P1 |

### FR-10: Cart System - Cos cumparaturi (P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-10.1 | Adaugare multiple servicii in cos | P0 |
| FR-10.2 | Vizualizare si editare cos | P0 |
| FR-10.3 | Pre-fill date pentru aceeasi persoana | P0 |
| FR-10.4 | Checkout unic pentru tot cosul | P0 |
| FR-10.5 | Salvare cos (localStorage + server daca logat) | P1 |
| FR-10.6 | Email reminder cos abandonat (24h) | P1 |

### FR-11: OCR si Smart Pre-fill (P0) ✅ IMPLEMENTED

> **Implementation:** Google Gemini 2.0 Flash Exp via `/api/ocr/extract`
> See `docs/technical/api/ocr-kyc-api.md` for API documentation.

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-11.1 | Upload CI/Pasaport la inceputul flow-ului | P0 | ✅ Done |
| FR-11.2 | OCR extragere date: CNP, Nume, Adresa completă (Jud, Str, Nr, Bl, Sc, Et, Ap) | P0 | ✅ Done |
| FR-11.3 | Verificare expirare act identitate | P0 | ✅ Done |
| FR-11.4 | Pre-completare automata campuri formular | P0 | ✅ Done |
| FR-11.5 | Calcul data nastere din CNP | P0 | ✅ Done |
| FR-11.6 | Detectie tip document (CI vechi, CI nou, Pasaport, Certificat Atestare) | P0 | ✅ Done |
| FR-11.7 | MRZ extraction din Pasaport | P0 | ✅ Done |
| FR-11.8 | Cross-validation CI + Certificat Atestare Domiciliu | P0 | ✅ Done |

### FR-12: KYC Persistent (P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-12.1 | KYC salvat in cont utilizator | P0 |
| FR-12.2 | Valabilitate KYC: 180 zile | P0 |
| FR-12.3 | Skip KYC daca valid la comanda noua | P0 |
| FR-12.4 | Notificare expirare KYC | P1 |
| FR-12.5 | Re-verificare KYC la expirare | P1 |

### FR-13: SMS Notificari (P1)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-13.1 | Optiune SMS notificari la checkout (+5 RON) | P1 |
| FR-13.2 | SMS la confirmare plata | P1 |
| FR-13.3 | SMS la document obtinut | P1 |
| FR-13.4 | SMS la expediere + AWB | P1 |
| FR-13.5 | SMS la livrare confirmata | P1 |

### FR-14: PJ Bulk - Comenzi firme (P1)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-14.1 | Flow special pentru firme (CUI lookup) | P1 |
| FR-14.2 | Adaugare angajati manual (1-10) | P1 |
| FR-14.3 | Upload template Excel (10+) | P1 |
| FR-14.4 | Validare date din Excel | P1 |
| FR-14.5 | KYC per angajat (firma upload sau link individual) | P1 |
| FR-14.6 | Discount volum (5%/10%/15%/20%) | P1 |
| FR-14.7 | Factura unica pe firma | P1 |
| FR-14.8 | Tracking individual per angajat | P1 |

### FR-15: Discount volum PJ

| Nr. angajati | Discount |
|--------------|----------|
| 1-4 | 0% |
| 5-9 | 5% |
| 10-19 | 10% |
| 20-49 | 15% |
| 50+ | 20% |

## User experience

### Entry points

| Entry Point | Description |
|-------------|-------------|
| Homepage | Prezentare servicii, search, CTA-uri principale |
| Service landing page | Pagina dedicata per serviciu cu detalii si pret |
| Direct link | Link direct la formular (din email, ads) |
| API | Integrari externe |
| User dashboard | Pentru clienti cu cont - acces rapid |

### Core experience - Modular Wizard System

> **Implementation Note (2026-01):** The original "Smart Flow v2.0" has been replaced with a
> **Modular Wizard System** that dynamically generates steps based on service configuration.
> See `docs/technical/specs/modular-wizard-guide.md` for implementation details.

**Principii cheie:**
1. **OCR-First** - Upload CI devreme, extrage date automat (Google Gemini 2.0 Flash)
2. **KYC o singura data** - Salvat 180 zile in cont (Google Gemini 1.5 Flash validation)
3. **Modular Steps** - Fiecare serviciu definește modulele necesare în `verification_config`
4. **Smart Pre-fill** - Aceeasi persoana = 0 campuri noi
5. **InfoCUI Integration** - Validare CUI cu auto-fill date firmă

**Arhitectura Modular Wizard:**

```
URL: /comanda/[service-slug]

CORE STEPS (toate serviciile):
├── Contact Step (email, telefon)
├── [DYNAMIC MODULES] ← din verification_config
├── Options Step (urgenta, traducere, apostila)
├── Delivery Step (electronic/fizic)
└── Review Step (sumar + plata)

AVAILABLE MODULES:
├── client-type      → Selectie PF/PJ
├── personal-data    → Date personale + adresa
├── company-data     → Date firma (CUI validation via InfoCUI)
├── property-data    → Date proprietate (Carte Funciara)
├── vehicle-data     → Date vehicul (Rovinieta)
├── kyc-documents    → Upload CI + Selfie + OCR extraction
└── signature        → Semnatura electronica canvas

EXAMPLE: Cazier Judiciar PF
verification_config: {
  "modules": ["client-type", "personal-data", "kyc-documents", "signature"]
}
→ Generates: Contact → Client Type → Personal Data → KYC → Signature → Options → Delivery → Review
```

### Service-specific variations

| Serviciu | KYC | Traduceri | Apostila | Cross-sell |
|----------|-----|-----------|----------|------------|
| Cazier Judiciar | CI + Selfie | 9 limbi | Da | Cert. Integritate +150 |
| Cazier Fiscal | CI + Selfie | 8 limbi | Da | - |
| Cazier Auto | CI + Selfie + Permis | 9 limbi | Da | - |
| Cert. Integritate | CI + Selfie | 9 limbi | Da | Cazier Judiciar +150 |
| Cert. Nastere | CI + Selfie (+parinti daca minor) | 20 limbi | Da | Multilingv +399 |
| Cert. Casatorie | CI + Selfie | 20 limbi | Da | Multilingv +399 |
| Cert. Celibat | CI + Selfie | 20 limbi | Da | Cert. Nastere +999 |
| Multilingv Nastere | CI + Selfie | N/A | N/A | Duplicat +790 |
| Multilingv Casatorie | CI + Selfie | N/A | N/A | Duplicat +790 |
| Extras CF | - | - | - | - |
| Cert. Constatator | - | - | - | - |
| Rovinieta | - | - | - | - |

### UI/UX highlights

1. **Progress indicator** - Vizibil in toate pasii, indica progresul
2. **Mobile-first** - Optimizat pentru completare pe telefon
3. **Smart validation** - Validare in timp real, mesaje clare de eroare
4. **Auto-save** - Salvare automata progress (localStorage + server)
5. **Cross-sell contextual** - Oferte relevante la momentul potrivit
6. **Pricing transparency** - Pret total vizibil si actualizat in timp real

## Narrative

Maria locuieste in Germania de 5 ani si are nevoie de un cazier judiciar cu apostila pentru angajatorul ei. Nu are timp sau posibilitatea sa vina in Romania. Cauta pe Google "cazier judiciar online" si gaseste eGhiseul.ro. In 8 minute completeaza formularul: introduce datele personale, selecteaza traducere in germana si apostila, incarca o poza cu buletinul si un selfie, semneaza contractul digital si plateste 428 RON cu cardul. Primeste imediat pe email confirmarea si contractul. Dupa 3 zile primeste notificare ca documentul este gata, iar in 5 zile il primeste prin DHL la adresa din Germania. Angajatorul accepta documentul fara probleme. Maria ramane client fidel si recomanda serviciul prietenilor.

## Success metrics

### User-centric metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Time to complete order | 15+ min | <10 min | Analytics |
| Form abandonment rate | ~40% | <25% | Analytics |
| Customer satisfaction (NPS) | N/A | >50 | Survey |
| Return customer rate | ~15% | >30% | Database |
| Support tickets per order | ~0.3 | <0.1 | Helpdesk |

### Business metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Monthly orders | ~250 | 500+ | Database |
| Average order value | ~350 RON | 400+ RON | Stripe |
| Revenue growth | baseline | +50% YoY | Finance |
| Cross-sell adoption | ~5% | 20% | Analytics |
| API revenue share | 0% | 15% | Finance |

### Technical metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page load time | <2s | Lighthouse |
| API response time | <200ms | Monitoring |
| Uptime | 99.9% | Monitoring |
| Error rate | <0.1% | Logging |
| Mobile performance score | >90 | Lighthouse |

## Technical considerations

### Integration points

| System | Purpose | Priority | Status |
|--------|---------|----------|--------|
| **Stripe** | Plati card, 3D Secure | P0 | ✅ Integrated |
| **SmartBill** | Facturare automata (e-factura compliant) | P0 | ⏳ Sprint 4 |
| **AWS S3** | Stocare documente (eu-central-1) | P0 | ⏳ Sprint 4 |
| **Resend** | Email transactional | P0 | ✅ Configured |
| **Google Gemini 2.0 Flash** | OCR document extraction | P0 | ✅ Integrated |
| **Google Gemini 1.5 Flash** | KYC face matching & validation | P0 | ✅ Integrated |
| **InfoCUI.ro** | Validare CUI firme (via eghiseul.ro API) | P0 | ✅ Integrated |
| **SMSLink.ro** | SMS notificari (provider românesc) | P1 | ⏳ Sprint 5 |
| **Fan Curier API** | Livrare Romania | P1 | ⏳ Planned |
| **DHL API** | Livrare internationala | P1 | ⏳ Planned |

### Data storage and privacy

| Aspect | Approach |
|--------|----------|
| **Database** | PostgreSQL (Supabase/RDS) |
| **Documents** | AWS S3 encrypted, presigned URLs |
| **Contracts** | 10 years retention, encrypted |
| **PII** | Encrypted at rest, minimal exposure |
| **GDPR** | Consent tracking, data export, deletion |
| **Backups** | Daily automated, 30 days retention |

### Scalability and performance

| Aspect | Approach |
|--------|----------|
| **Frontend** | Next.js with SSG/ISR for landing pages |
| **API** | Node.js/NestJS stateless, horizontally scalable |
| **Database** | Connection pooling, read replicas if needed |
| **File uploads** | Direct to S3 with presigned URLs |
| **Caching** | Redis for sessions, API responses |
| **CDN** | CloudFront for static assets |

### Potential challenges

| Challenge | Mitigation |
|-----------|------------|
| KYC fraud | Face matching, manual review flag |
| Payment failures | Retry logic, clear error messages, WhatsApp support |
| Document upload issues | Client-side validation, compression, fallback |
| High traffic spikes | Auto-scaling, queue for heavy operations |
| Legal compliance | Regular audits, template reviews |

## Milestones and sequencing

### Team size estimate

| Role | Count | Allocation |
|------|-------|------------|
| Full-stack developer | 2 | 100% |
| Frontend developer | 1 | 100% |
| Designer (UI/UX) | 1 | 50% |
| Product manager | 1 | 50% |
| QA | 1 | 50% |

### Phase 1: MVP (Core Platform)

**Duration:** 8-10 saptamani

| Deliverable | Description |
|-------------|-------------|
| Auth & Users | Admin login, roles |
| Service engine | Configurare servicii, flow 6 pasi |
| 3 servicii live | Cazier Judiciar, Certificat Nastere, Extras CF |
| KYC module | Upload, semnatura, validare |
| Payments | Stripe integration |
| Contracts | Generare PDF, stocare |
| Admin dashboard | Comenzi, statusuri, upload documente |
| Notifications | Email confirmare, status |

### Phase 2: Full Services

**Duration:** 4-6 saptamani

| Deliverable | Description |
|-------------|-------------|
| All 12 services | Migrare toate serviciile |
| Cross-sell | Implementare logica cross-sell |
| Translations | 20 limbi, pricing tiers |
| Apostille | Flow apostila |
| Customer accounts | Inregistrare, login, istoric |
| Status page | Verificare status public |

### Phase 3: Growth Features

**Duration:** 4-6 saptamani

| Deliverable | Description |
|-------------|-------------|
| API | REST API pentru parteneri |
| Cart | Cos cumparaturi multi-serviciu |
| Loyalty | Puncte, discounturi, referral |
| Reports | Rapoarte avansate admin |
| SMS | Notificari SMS |

## User stories

### Authentication and access

#### US-001: Admin login
**As an** admin operator
**I want to** log in securely to the admin dashboard
**So that** I can manage orders and operations

**Acceptance criteria:**
- Email/password authentication
- 2FA optional
- Session timeout after 8 hours inactivity
- Password reset via email
- Audit log for login attempts

#### US-002: Customer registration
**As a** customer
**I want to** create an account
**So that** I can save my data and track orders

**Acceptance criteria:**
- Registration with email
- Email verification required
- Password requirements (8+ chars, mixed)
- Optional phone number
- Consent checkboxes (T&C, marketing)

#### US-003: Customer login
**As a** registered customer
**I want to** log in to my account
**So that** I can access my order history and saved data

**Acceptance criteria:**
- Email/password login
- Magic link option
- Remember me (30 days)
- Forgot password flow
- Show recent orders after login

### Service ordering

#### US-004: Browse services
**As a** visitor
**I want to** see all available services with prices
**So that** I can find what I need

**Acceptance criteria:**
- Service cards with name, description, starting price
- Category filtering
- Search functionality
- Clear CTAs to start order

#### US-005: Start order - Contact step
**As a** customer
**I want to** provide my contact information
**So that** I can be reached about my order

**Acceptance criteria:**
- Email field with validation
- Phone field with format validation
- Full name field
- Pre-fill if logged in
- Progress indicator shows step 1/6

#### US-006: Service data step
**As a** customer
**I want to** provide service-specific information
**So that** the correct document can be obtained

**Acceptance criteria:**
- Dynamic fields based on service type
- CNP validation (13 digits, checksum)
- Required fields marked with asterisk
- Conditional fields (e.g., marital status questions)
- Country dropdown (195+ countries)

#### US-007: Options selection
**As a** customer
**I want to** select additional options
**So that** I get the complete service I need

**Acceptance criteria:**
- Urgency option with price difference shown
- Translation dropdown (20 languages)
- Price tier displayed per language
- Apostille checkbox with destination country
- Cross-sell banner for related services
- Running total updated in real-time

#### US-008: KYC document upload
**As a** customer
**I want to** upload my identification documents
**So that** my identity can be verified

**Acceptance criteria:**
- ID upload (front + back for new format)
- Selfie with ID upload
- File type validation (jpg, png, pdf)
- File size limit (10MB)
- Preview uploaded images
- Clear instructions with examples
- Conditional: driving license for Cazier Auto
- Conditional: parent IDs for minor certificates

#### US-009: Electronic signature
**As a** customer
**I want to** sign the service contract digitally
**So that** I can authorize the service

**Acceptance criteria:**
- Canvas signature pad
- Clear/redo button
- Touch and mouse support
- Minimum stroke validation
- Contract PDF preview before signing
- T&C checkbox required

#### US-010: Delivery selection
**As a** customer
**I want to** choose how to receive my document
**So that** it arrives conveniently

**Acceptance criteria:**
- Electronic only option (email)
- Romania delivery (+25 RON Fan Curier)
- International Post (+100 RON)
- International DHL (+200 RON)
- Address fields when physical selected
- Estimated delivery time shown

#### US-011: Payment
**As a** customer
**I want to** pay for my order
**So that** processing can begin

**Acceptance criteria:**
- Order summary with all items
- Billing type selection (PF/PJ)
- PJ: CUI lookup with auto-fill
- PF: Name, CNP, address
- Coupon code field
- Stripe card input
- 3D Secure support
- Clear error messages in Romanian
- Success redirect to confirmation page

#### US-012: Order confirmation
**As a** customer
**I want to** receive confirmation of my order
**So that** I know it was successful

**Acceptance criteria:**
- Confirmation page with order number
- Email with order details
- Contract PDF attached
- Invoice PDF attached
- Status tracking link
- Estimated completion time

### Cross-sell

#### US-013: Cross-sell suggestion
**As a** customer ordering Cazier Judiciar
**I want to** be offered Certificat Integritate
**So that** I can get both documents efficiently

**Acceptance criteria:**
- Banner appears at options step
- Shows discount/bundle price
- One-click add to order
- Combined KYC (no duplicate uploads)
- Updated total immediately

### Order management (Admin)

#### US-014: View orders list
**As an** admin operator
**I want to** see all orders in a filterable list
**So that** I can manage my workload

**Acceptance criteria:**
- Table with: Order #, Date, Customer, Service, Status, Amount
- Filters: status, service type, date range
- Search by order #, customer name, email
- Sortable columns
- Pagination
- Quick status indicators (colors)

#### US-015: View order details
**As an** admin operator
**I want to** see complete order information
**So that** I can process it correctly

**Acceptance criteria:**
- Customer contact info
- Service details and options
- KYC documents (viewable/downloadable)
- Signed contract
- Payment status and details
- Status history timeline
- Notes field

#### US-016: Update order status
**As an** admin operator
**I want to** change the order status
**So that** the customer is informed of progress

**Acceptance criteria:**
- Status dropdown with valid transitions
- Automatic email to customer on change
- Status history recorded
- Optional note with status change
- Statuses: Pending, Paid, Processing, DocumentReady, InTranslation, Apostilled, Shipped, Delivered, Completed, Rejected, Refunded

#### US-017: Upload final document
**As an** admin operator
**I want to** upload the completed document
**So that** the customer can receive it

**Acceptance criteria:**
- File upload (PDF, images)
- Preview before confirm
- Automatic email to customer with document
- Document stored securely
- Link expires after X days

#### US-018: Create manual order
**As an** admin operator
**I want to** create an order manually
**So that** I can serve customers who call/email

**Acceptance criteria:**
- All form fields available
- Payment status can be set manually
- Note field for context
- Sends confirmation to customer
- Appears in normal order list

### Customer order tracking

#### US-019: Check order status (public)
**As a** customer
**I want to** check my order status without logging in
**So that** I know when to expect my document

**Acceptance criteria:**
- Input: Order # + Email
- Shows: Current status, history, ETA
- Download available documents
- No sensitive data exposed
- Link to contact support

#### US-020: View order history (logged in)
**As a** registered customer
**I want to** see all my past orders
**So that** I can track and reference them

**Acceptance criteria:**
- List of all orders with status
- Click to see details
- Download documents
- Reorder similar service

### Notifications

#### US-021: New order notification (admin)
**As an** admin
**I want to** be notified of new orders
**So that** I can process them promptly

**Acceptance criteria:**
- Dashboard notification badge
- Email notification
- Slack/webhook integration (optional)

#### US-022: Status change notification (customer)
**As a** customer
**I want to** be notified when my order status changes
**So that** I stay informed

**Acceptance criteria:**
- Email for each status change
- Clear status explanation
- Next steps if applicable
- ETA update if available

### Reporting

#### US-023: Sales reports
**As an** admin
**I want to** see sales statistics
**So that** I can track business performance

**Acceptance criteria:**
- Revenue by period (day/week/month)
- Orders by service type
- Average order value
- Conversion funnel
- Export to CSV

### API

#### US-024: API order creation
**As a** partner
**I want to** create orders via API
**So that** I can integrate eGhiseul into my platform

**Acceptance criteria:**
- POST /api/v1/orders endpoint
- API key authentication
- Request validation
- Returns order ID and payment URL
- Webhook for status updates

#### US-025: API status check
**As a** partner
**I want to** check order status via API
**So that** I can display it in my platform

**Acceptance criteria:**
- GET /api/v1/orders/{id} endpoint
- Returns current status, history
- Document download URLs when ready

### Edge cases

#### US-026: Payment failure handling
**As a** customer
**I want to** retry payment if it fails
**So that** I don't lose my form progress

**Acceptance criteria:**
- Clear error message in Romanian
- Retry button
- Form data preserved
- Alternative: WhatsApp support link
- Max 3 retries before redirect to support

#### US-027: Document rejection
**As an** admin
**I want to** reject an order with reason
**So that** the customer can correct issues

**Acceptance criteria:**
- Rejection reason (dropdown + custom)
- Email to customer with reason
- Customer can resubmit documents
- Order stays in system

#### US-028: Refund processing
**As an** admin
**I want to** process a refund
**So that** customers are compensated when needed

**Acceptance criteria:**
- Refund button on paid orders
- Partial or full refund
- Stripe refund triggered
- Status updated to Refunded
- Email to customer
- Audit log entry

### Cart system

#### US-029: Add service to cart
**As a** customer
**I want to** add a configured service to my cart
**So that** I can order multiple services at once

**Acceptance criteria:**
- After completing service configuration, option to add to cart
- Cart icon shows number of items
- Can continue shopping or checkout
- Cart persists during session

#### US-030: View and edit cart
**As a** customer
**I want to** view and modify my cart
**So that** I can review before checkout

**Acceptance criteria:**
- List all services with details
- Show subtotal per service
- Edit button to modify options
- Delete button to remove
- Total updated in real-time

#### US-031: Add service for same person
**As a** customer
**I want to** add another service for the same person
**So that** I don't have to re-enter data

**Acceptance criteria:**
- Option to select existing person from cart
- All personal data pre-filled
- Only service-specific questions shown
- KYC not required again

#### US-032: Checkout from cart
**As a** customer
**I want to** checkout all items in my cart
**So that** I pay once for everything

**Acceptance criteria:**
- Single delivery selection for all items
- Single contract covering all services
- Single payment for total
- Single confirmation with all items

### OCR and smart pre-fill

#### US-033: Upload ID for OCR
**As a** customer
**I want to** upload my ID early in the flow
**So that** my data is extracted automatically

**Acceptance criteria:**
- Upload field at step 1 (contact)
- Accepts CI and Passport images
- Processing indicator while OCR runs
- Error handling for unreadable images

#### US-034: Auto-fill from OCR
**As a** customer
**I want to** see my data pre-filled from my ID
**So that** I don't have to type it manually

**Acceptance criteria:**
- CNP extracted and filled
- Full name extracted and filled
- Birth date calculated from CNP
- Address extracted if readable
- Fields marked as "extracted" vs "manual"
- All fields editable

#### US-035: Expired ID detection
**As a** customer
**I want to** be warned if my ID is expired
**So that** I don't waste time completing the form

**Acceptance criteria:**
- Expiry date extracted from ID
- Warning if expired
- Block form progression with expired ID
- Suggest to upload valid ID

### KYC persistent

#### US-036: Save KYC to account
**As a** registered customer
**I want to** save my KYC verification
**So that** I don't repeat it every order

**Acceptance criteria:**
- After successful KYC, prompt to save to account
- KYC stored securely (180 days)
- Associated with user account

#### US-037: Skip KYC if valid
**As a** logged-in customer with valid KYC
**I want to** skip the KYC step
**So that** I can order faster

**Acceptance criteria:**
- Check KYC status at KYC step
- If valid, show "KYC verified" message
- Skip selfie upload
- Option to re-verify if needed

#### US-038: KYC expiry notification
**As a** registered customer
**I want to** be notified when my KYC expires
**So that** I can re-verify proactively

**Acceptance criteria:**
- Email 7 days before expiry
- Dashboard shows KYC status
- Easy re-verification flow

### SMS notifications

#### US-039: Opt-in SMS notifications
**As a** customer
**I want to** receive SMS updates about my order
**So that** I'm always informed

**Acceptance criteria:**
- Checkbox at checkout (+5 RON)
- Phone number validated
- Price added to total
- Clear description of what SMS will be sent

#### US-040: SMS status updates
**As a** customer who opted for SMS
**I want to** receive SMS at key milestones
**So that** I don't have to check email

**Acceptance criteria:**
- SMS on payment confirmed
- SMS on document obtained
- SMS on shipment with AWB
- SMS on delivery
- All SMS include order reference

### PJ bulk orders

#### US-041: Company order setup
**As a** company representative
**I want to** order documents for multiple employees
**So that** I can manage HR needs efficiently

**Acceptance criteria:**
- CUI lookup with auto-fill company data
- Select number of employees
- Choose method: manual or Excel upload
- Contact person for order

#### US-042: Manual employee entry
**As a** company representative with few employees
**I want to** add employees one by one
**So that** I can order for a small team

**Acceptance criteria:**
- Add employee form
- Upload CI per employee
- OCR extraction per employee
- List of added employees
- Add more or proceed

#### US-043: Excel bulk upload
**As a** company representative with many employees
**I want to** upload employee data via Excel
**So that** I can order efficiently for large teams

**Acceptance criteria:**
- Download template Excel
- Upload completed Excel
- Validation with error report
- Preview of parsed data
- Correction interface for errors

#### US-044: Bulk KYC management
**As a** company representative
**I want to** manage KYC for all employees
**So that** the order can be processed

**Acceptance criteria:**
- Option 1: Company uploads all CI
- Option 2: Generate individual KYC links
- Send links to employees via email
- Track completion status
- Reminder for incomplete KYC

#### US-045: Volume discount
**As a** company ordering in bulk
**I want to** receive volume discounts
**So that** I save money on large orders

**Acceptance criteria:**
- Discount tiers displayed (5-9: 5%, 10-19: 10%, etc.)
- Auto-apply based on quantity
- Show savings vs individual price
- Discount reflected in total
