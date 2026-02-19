# Admin Order Processing Workflow - Design Document

**Version:** 1.2
**Date:** 17 Februarie 2026
**Status:** Implemented and Working
**Author:** Technical Architecture Team
**Scope:** Cazier Judiciar (first implementation), extensible to all services
**Changelog:**
- v1.2 -- Added signature management (sec. 3.2, 3.3, 6.4.1), contract preview in wizard (sec. 15), updated admin_settings JSON with signature S3 keys
- v1.1 -- Added template separation analysis (sec. 12), updated RBAC roles (sec. 13), service processing_config (sec. 14)

---

## Table of Contents

1. [Current State](#1-current-state)
2. [Order Status Flow](#2-order-status-flow)
3. [Admin Settings - Date Firma & Avocat](#3-admin-settings---date-firma--avocat)
4. [Orders Page - Service Tabs](#4-orders-page---service-tabs)
5. [Order Detail - Processing Section](#5-order-detail---processing-section)
6. [Document Generation (DOCX to PDF)](#6-document-generation-docx-to-pdf)
7. [Notification System](#7-notification-system)
8. [Client Document Access](#8-client-document-access)
9. [Database Changes](#9-database-changes)
10. [Implementation Priority](#10-implementation-priority)
11. [Technical Considerations](#11-technical-considerations)
12. [Template Analysis & Separation](#12-template-analysis--separation)
13. [Updated RBAC Roles](#13-updated-rbac-roles)
14. [Service Processing Configuration](#14-service-processing-configuration)
15. [Contract Preview in Order Wizard](#15-contract-preview-in-order-wizard-implemented)

---

## 1. Current State

The admin panel already has a solid foundation. The following features are built and operational.

### What Already Exists

| Feature | Location | Status |
|---------|----------|--------|
| Admin layout with sidebar navigation | `src/app/admin/layout.tsx` | Complete |
| Dashboard with stats, activity feed, recent orders | `src/app/admin/page.tsx` | Complete |
| Orders list page with search, status filter, pagination | `src/app/admin/orders/page.tsx` | Complete |
| Order detail page (contact, PF/PJ data, billing, payment, delivery, timeline) | `src/app/admin/orders/[id]/page.tsx` | Complete |
| AWB generation (Fan Courier + Sameday) | `src/app/api/admin/orders/[id]/generate-awb/route.ts` | Complete |
| AWB label print + cancel | `generate-awb`, `awb-label`, `cancel-awb` routes | Complete |
| Bank transfer payment verification | `src/app/api/admin/orders/[id]/verify-payment/route.ts` | Complete |
| RBAC permission system (super_admin, employee) | `src/lib/admin/permissions.ts` | Complete |
| Employee invitation system | `src/app/api/admin/users/invite/route.ts` | Complete |
| Users management (employees + customers) | `src/app/admin/users/page.tsx` | Complete |
| Settings page (Servicii, Curieri, Plati, Sistem tabs) | `src/app/admin/settings/page.tsx` | Complete |
| `admin_settings` table (key-value JSONB store) | Migration `023_rbac_permissions.sql` | Complete |
| Order history / timeline tracking | `order_history` table + UI component | Complete |
| GDPR cleanup (7-day draft anonymization) | `src/app/api/admin/cleanup/route.ts` | Complete |

### Current Order Statuses in Database

The `orders` table constraint currently allows:

```sql
CHECK (status IN (
  'draft', 'pending', 'processing', 'kyc_pending', 'kyc_approved',
  'kyc_rejected', 'in_progress', 'document_ready', 'shipped',
  'delivered', 'completed', 'cancelled', 'refunded'
))
```

### Current Admin Settings Keys

The `admin_settings` table currently stores:

| Key | Purpose |
|-----|---------|
| `sender_address` | Courier sender address |
| `bank_details` | Bank transfer IBAN, bank name, holder |
| `maintenance_mode` | Maintenance mode toggle + message |
| `notifications` | Email/SMS notification toggles |
| `company_data` | Company data for contracts (includes `signature_s3_key`) |
| `lawyer_data` | Lawyer data for imputerniciri (includes `signature_s3_key`, `stamp_s3_key`) |
| `document_counters` | Auto-increment counters for contract and imputernicire numbering |

### What Needs to Be Built

This document describes the design for the next phase:

- Extended order status flow with granular processing states
- Company and lawyer data management in admin settings
- Service-based tab filtering on the orders page
- Contextual action buttons for status progression
- DOCX template-based document generation (contracts, power of attorney, applications)
- Extra options completion checklist
- In-app notification system for employees
- Client-facing document access in their account

---

## 2. Order Status Flow

### 2.1 Complete Status Progression (Cazier Judiciar)

The status flow is designed as a linear pipeline. Each transition is triggered by a single contextual button in the admin UI. No dropdown selectors -- one button, one action.

```
                                    ┌─────────────────────────┐
                                    │  extras_in_progress     │
                                    │  (Traducere / Apostila) │
                                    └─────────┬───────────────┘
                                              │
                                              │ (only if extras exist)
                                              │
[paid] → [processing] → [documents_generated] → [submitted_to_institution] → [document_received]
                                                                                      │
                                                                  ┌───────────────────┤
                                                                  │                   │
                                                                  ▼                   ▼
                                                          (has extras)          (no extras)
                                                                  │                   │
                                                                  ▼                   │
                                                   [extras_in_progress]               │
                                                                  │                   │
                                                                  ▼                   │
                                                          [document_ready] ◄──────────┘
                                                                  │
                                                                  ▼
                                                             [shipped]
                                                                  │
                                                                  ▼
                                                           [completed]
```

### 2.2 Status Reference Table

| Status | Label RO | Set By | What Happens | Contextual Button |
|--------|----------|--------|--------------|-------------------|
| `paid` | Platita | Auto (Stripe webhook / bank transfer verification) | Contract + Imputernicire auto-generated as PDF. Order appears in admin "Platite" queue. | -- (automatic) |
| `processing` | In procesare | Employee (clicks button) | Employee begins work. Verifies client data (CNP, address, CI validity). Starts preparation of application form. | "Incepe procesarea" |
| `documents_generated` | Documente generate | Employee (clicks button) | "Cerere eliberare cazier" PDF generated from admin dashboard using DOCX template. Employee reviews generated documents. | "Genereaza cerere eliberare" |
| `submitted_to_institution` | Depusa la institutie | Employee (clicks button) | Application physically submitted to IPJ (Inspectoratul de Politie Judetean). Employee marks the submission date. | "Marcheaza depusa la IPJ" |
| `document_received` | Document primit | Employee (clicks button + uploads file) | Criminal record received from IPJ. Employee uploads scanned copy. System checks if order has extras. | "Incarca document primit" |
| `extras_in_progress` | Traducere / Apostila | Employee (conditional -- only if order has extra options like translation or apostille) | Document sent to translator / apostille office. Employee tracks progress via checklist. | "Trimite la traducere" |
| `document_ready` | Gata de expediere | Employee (after extras complete, or directly if no extras) | All documents finalized. Final document uploaded to S3. Ready for shipping. | "Marcheaza gata de expediere" or auto when all extras checked |
| `shipped` | Expediata | Employee (after AWB generation) | AWB generated via Fan Courier or Sameday. Package handed to courier. Client receives tracking notification. | "Genereaza AWB" |
| `completed` | Finalizata | Auto (courier tracking confirms delivery) or Employee (manual) | Order lifecycle complete. Client can download final document from their account. | "Finalizeaza comanda" |

### 2.3 Status Transition Rules

Each status can only move forward to its next valid state. No skipping, no going back.

```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  'paid':                     ['processing'],
  'processing':               ['documents_generated'],
  'documents_generated':      ['submitted_to_institution'],
  'submitted_to_institution': ['document_received'],
  'document_received':        ['extras_in_progress', 'document_ready'],
  'extras_in_progress':       ['document_ready'],
  'document_ready':           ['shipped'],
  'shipped':                  ['completed'],
};
```

The branching at `document_received` is determined automatically:
- If the order has selected options with codes `TRADUCERE_*` or `APOSTILA` -> `extras_in_progress`
- Otherwise -> `document_ready`

### 2.4 New Statuses to Add

The following statuses need to be added to the database constraint:

| New Status | Purpose |
|------------|---------|
| `documents_generated` | Application form (cerere) has been generated |
| `submitted_to_institution` | Application submitted to government institution |
| `document_received` | Official document received from institution |
| `extras_in_progress` | Translation / apostille / extras being processed |

The `paid` status also needs to be added (currently payment sets `processing` directly).

---

## 3. Admin Settings - Date Firma & Avocat

### 3.1 New Settings Tab

A new tab "Date firma & Avocat" is added to the existing Settings page (`/admin/settings`).

```
[Servicii] [Curieri] [Plati] [Date firma & Avocat] [Sistem]
                                      ▲ NEW
```

### 3.2 Company Data (EDIGITALIZARE SRL)

Stored in `admin_settings` with key `company_data`.

| Field | Value (Default) | Type |
|-------|-----------------|------|
| Denumire firma | EDIGITALIZARE SRL | text |
| CUI | RO49278701 | text |
| Nr. Inregistrare | J30/1097/2023 | text |
| Adresa | Jud. Satu Mare, com. Odoreu, str. Salcamilor, Nr. 2 | text |
| IBAN | RO82BTRLRONCRT0CP9350501 | text |
| Banca | Banca Transilvania | text |
| Email | (company email) | text |
| Telefon | (company phone) | text |
| Semnatura prestator | S3 key to PNG image | text (S3 key) |

```json
{
  "key": "company_data",
  "value": {
    "name": "EDIGITALIZARE SRL",
    "cui": "RO49278701",
    "registration_number": "J30/1097/2023",
    "address": "Jud. Satu Mare, com. Odoreu, str. Salcamilor, Nr. 2",
    "iban": "RO82BTRLRONCRT0CP9350501",
    "bank": "Banca Transilvania",
    "email": "contact@eghiseul.ro",
    "phone": "0740000000",
    "signature_s3_key": "signatures/company_signature/1708123456789.png"
  }
}
```

### 3.3 Lawyer Data (Cabinet de Avocat)

Stored in `admin_settings` with key `lawyer_data`.

| Field | Value (Default) | Type |
|-------|-----------------|------|
| Denumire cabinet | Cabinet de avocat Tarta Ana-Gabriela | text |
| Nume avocat | Tarta Ana-Gabriela | text |
| Sediu profesional | Satu Mare, str. Aurel Popp, nr. 2 | text |
| CIF | 40198820 | text |
| Serie imputernicire | SM | text |
| Onorariu avocat | 15 RON | number |
| Semnatura avocat | S3 key to PNG image | text (S3 key) |
| Stampila avocat | S3 key to PNG image | text (S3 key) |

```json
{
  "key": "lawyer_data",
  "value": {
    "cabinet_name": "Cabinet de avocat Tarta Ana-Gabriela",
    "lawyer_name": "Tarta Ana-Gabriela",
    "professional_address": "Satu Mare, str. Aurel Popp, nr. 2",
    "cif": "40198820",
    "imputernicire_series": "SM",
    "fee": 15.00,
    "signature_s3_key": "signatures/lawyer_signature/1708123456790.png",
    "stamp_s3_key": "signatures/lawyer_stamp/1708123456791.png"
  }
}
```

### 3.4 Document Counters (Auto-Increment)

Stored in `admin_settings` with key `document_counters`.

These counters auto-increment every time a contract or power of attorney is generated. They produce sequential numbers for legal documents.

| Counter | Current Value | Format Example |
|---------|---------------|----------------|
| `contract_number` | 4256 | 004256, 004257, 004258... |
| `imputernicire_number` | 5738 | SM 005738, SM 005739... |

```json
{
  "key": "document_counters",
  "value": {
    "contract_number": 4256,
    "imputernicire_number": 5738
  }
}
```

**Increment logic (atomic):**

```typescript
// Pseudo-code for atomic counter increment
async function getNextDocumentNumber(counterKey: string): Promise<number> {
  // Use Supabase RPC or raw SQL for atomic increment
  // SELECT value->'contract_number' + 1 FROM admin_settings WHERE key = 'document_counters'
  // UPDATE admin_settings SET value = jsonb_set(value, '{contract_number}', ...)
  // Return the new value
  // IMPORTANT: Must be done in a single transaction to prevent duplicates
}
```

### 3.5 Admin Settings API Changes

The existing `/api/admin/settings` route needs its `ALLOWED_KEYS` array extended:

```typescript
const ALLOWED_KEYS = [
  'sender_address',
  'bank_details',
  'maintenance_mode',
  'notifications',
  // NEW:
  'company_data',
  'lawyer_data',
  'document_counters',
];
```

---

## 4. Orders Page - Service Tabs

### 4.1 Service Tab Bar

The orders list page gets a horizontal tab bar for filtering by service category.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [Toate]  [Cazier Judiciar (8)]  [Cazier Fiscal (3)]  [Certificat      │
│           Nastere (2)]  [Certificat Casatorie (0)]  [Altele (1)]        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Tab behavior:**
- "Toate" shows all orders (default, current behavior)
- Each service tab filters by `service_id` (fetched from the services table)
- Tab labels include live order count (excluding `draft` and `cancelled`)
- Tabs are dynamically generated from active services in the database

### 4.2 Status Sub-Filters Within Each Tab

Within each service tab, a secondary horizontal filter shows status groups with counters:

```
In asteptare (3)  |  In procesare (5)  |  La institutie (2)  |  De expediat (1)  |  Expediate (4)
```

| Filter Group | Statuses Included | Badge Color |
|-------------|-------------------|-------------|
| In asteptare | `paid` | Green |
| In procesare | `processing`, `documents_generated` | Blue |
| La institutie | `submitted_to_institution`, `document_received`, `extras_in_progress` | Orange |
| De expediat | `document_ready` | Indigo |
| Expediate | `shipped` | Purple |
| Finalizate | `completed` | Green (dark) |

### 4.3 API Changes

The existing `/api/admin/orders/list` route needs:

- New query parameter: `service_id` (UUID, optional)
- New query parameter: `status_group` (string, optional) -- maps to multiple statuses
- Response should include `status_counts` object for rendering badges

```typescript
// Response shape
{
  success: true,
  data: OrderRow[],
  total: number,
  status_counts: {
    paid: 3,
    processing: 2,
    documents_generated: 3,
    submitted_to_institution: 2,
    document_received: 1,
    extras_in_progress: 0,
    document_ready: 1,
    shipped: 4,
    completed: 12,
  }
}
```

---

## 5. Order Detail - Processing Section

### 5.1 New Section: "Procesare comanda"

A new card is added to the order detail page, positioned prominently between the service info and the AWB section.

The card contains three sub-sections:

**A) Contextual Action Button**
**B) Generated Documents List**
**C) Extra Options Checklist**

### 5.2 Contextual Action Button

A single large button that changes based on the current order status. Only one primary action is available at a time.

| Current Status | Button Label | Button Action | Icon | Color |
|---------------|-------------|---------------|------|-------|
| `paid` | "Incepe procesarea" | Set status to `processing` | PlayCircle | Blue |
| `processing` | "Genereaza cerere eliberare" | Generate "cerere" PDF, set status to `documents_generated` | FileText | Blue |
| `documents_generated` | "Marcheaza depusa la IPJ" | Set status to `submitted_to_institution`, record submission date | Building2 | Orange |
| `submitted_to_institution` | "Incarca document primit" | Upload dialog + set status to `document_received` | Upload | Green |
| `document_received` (has extras) | "Trimite la traducere / apostila" | Set status to `extras_in_progress` | Languages | Purple |
| `document_received` (no extras) | "Marcheaza gata de expediere" | Set status to `document_ready` | CheckCircle | Green |
| `extras_in_progress` | "Incarca document final" | Upload final document + set status to `document_ready` | FileCheck | Green |
| `document_ready` | "Genereaza AWB" | (existing AWB generation flow) | Truck | Purple |

**UI wireframe:**

```
┌─────────────────────────────────────────────────────────┐
│  Procesare comanda                                       │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ►  Genereaza cerere eliberare                    │  │
│  │     Genereaza PDF cu cererea de eliberare cazier   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Documente generate:                                     │
│  ✓ Contract prestari servicii       [Descarca PDF]      │
│  ✓ Contract asistenta juridica      [Descarca PDF]      │
│  ✓ Imputernicire avocatiala         [Descarca PDF]      │
│  ○ Cerere eliberare cazier          (negenerat)         │
│  ○ Document final                   (neincarcat)        │
│                                                          │
│  Optiuni extra:                                          │
│  [ ] Traducere Legalizata Engleza - 80 RON              │
│  [ ] Apostila de la Haga - 150 RON                      │
│  [✓] Copie Suplimentara - 30 RON                        │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Generated Documents List

Displays all documents associated with the order, both auto-generated and manually uploaded.

| Document | Generated When | Generated By | Download |
|----------|---------------|--------------|----------|
| Contract prestari servicii (PDF) | Automatically at payment confirmation | System | Yes |
| Contract asistenta juridica (PDF) | Automatically at payment confirmation | System | Yes |
| Imputernicire avocatiala (PDF) | Automatically at payment confirmation | System | Yes |
| Cerere eliberare cazier (PDF) | Manually by employee via button | Employee | Yes |
| Document primit de la IPJ (PDF/JPG) | Uploaded by employee | Employee | Yes |
| Document final (PDF) | Uploaded by employee after extras | Employee | Yes |

Each document row shows:
- Document name
- Status indicator (green check if exists, gray circle if pending)
- Generation date
- Download button (links to presigned S3 URL)

### 5.4 Extra Options Checklist

Shows the order's selected extras as a checklist. The employee checks each item when it is completed.

```typescript
interface OrderOptionStatus {
  option_code: string;       // e.g., 'TRADUCERE_EN'
  option_name: string;       // e.g., 'Traducere Legalizata Engleza'
  price: number;             // e.g., 80.00
  completed: boolean;        // employee toggles this
  completed_at: string | null;
  completed_by: string | null; // employee user_id
}
```

**Auto-transition rule:** When all extras are checked as completed and the order is in `extras_in_progress`, the system automatically transitions the order to `document_ready`.

### 5.5 Processing API Endpoint

A new API endpoint handles all status transitions:

```
POST /api/admin/orders/[id]/process
```

**Request body:**

```json
{
  "action": "start_processing" | "generate_cerere" | "mark_submitted" |
            "upload_received" | "start_extras" | "upload_final" |
            "mark_ready" | "complete_option",
  "data": {
    // action-specific data
    "file_key": "...",           // for upload actions (S3 key)
    "option_code": "...",        // for complete_option
    "submission_date": "..."     // for mark_submitted
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "new_status": "processing",
    "generated_documents": [...],  // if documents were generated
    "timeline_event": {...}        // the new history entry
  }
}
```

---

## 6. Document Generation (DOCX to PDF)

### 6.1 Architecture Overview

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  DOCX Template   │────►│  docxtemplater  │────►│   Filled     │
│  (in src/        │     │  (npm library)  │     │   DOCX       │
│   templates/)    │     └─────────────────┘     └──────┬───────┘
└──────────────────┘                                     │
                                                         ▼
                                              ┌──────────────────┐
                                              │  PDF Conversion  │
                                              │  (libreoffice or │
                                              │   docx-pdf npm)  │
                                              └──────┬───────────┘
                                                     │
                                                     ▼
                                              ┌──────────────────┐
                                              │  Upload to S3    │
                                              │  contracts/      │
                                              │   {year}/{month}/│
                                              │   {order_id}/    │
                                              └──────────────────┘
```

### 6.2 Template File Structure

```
src/templates/
├── cazier-judiciar/
│   ├── contract-prestari.docx         ← Contract prestari servicii
│   │                                    + Contract asistenta juridica
│   │                                    + Nota informare GDPR
│   │                                    (all in one document)
│   ├── imputernicire.docx             ← Imputernicire avocatiala
│   ├── cerere-eliberare-pf.docx       ← Cerere eliberare cazier PF
│   └── cerere-eliberare-pj.docx       ← Cerere eliberare cazier PJ
├── cazier-fiscal/
│   └── ... (future templates)
├── certificat-nastere/
│   └── ... (future templates)
└── shared/
    └── header-footer.docx             ← Shared header/footer elements
```

### 6.3 Template Placeholders

Templates use `{{variable}}` syntax (docxtemplater standard).

**Client data placeholders:**

| Placeholder | Source | Example |
|-------------|--------|---------|
| `{{client_name}}` | `order.customer_data.contact.name` or `firstName + lastName` | Ion Popescu |
| `{{client_cnp}}` | `order.customer_data.personalData.cnp` | 1850101123456 |
| `{{client_ci_series}}` | `order.customer_data.personalData.ci_series` | SM |
| `{{client_ci_number}}` | `order.customer_data.personalData.ci_number` | 123456 |
| `{{client_address}}` | Formatted from `personalData.address` | Str. Mihai Eminescu nr. 1, Satu Mare |
| `{{client_email}}` | `order.customer_data.contact.email` | ion@example.com |
| `{{client_phone}}` | `order.customer_data.contact.phone` | 0712345678 |
| `{{client_cui}}` | `order.customer_data.companyData.cui` (PJ only) | RO12345678 |
| `{{client_company_name}}` | `order.customer_data.companyData.companyName` (PJ only) | SC Exemplu SRL |

**Company data placeholders (from `admin_settings.company_data`):**

| Placeholder | Source |
|-------------|--------|
| `{{company_name}}` | `company_data.name` |
| `{{company_cui}}` | `company_data.cui` |
| `{{company_reg_number}}` | `company_data.registration_number` |
| `{{company_address}}` | `company_data.address` |
| `{{company_iban}}` | `company_data.iban` |
| `{{company_bank}}` | `company_data.bank` |
| `{{company_email}}` | `company_data.email` |
| `{{company_phone}}` | `company_data.phone` |

**Lawyer data placeholders (from `admin_settings.lawyer_data`):**

| Placeholder | Source |
|-------------|--------|
| `{{lawyer_name}}` | `lawyer_data.lawyer_name` |
| `{{lawyer_cabinet}}` | `lawyer_data.cabinet_name` |
| `{{lawyer_address}}` | `lawyer_data.professional_address` |
| `{{lawyer_cif}}` | `lawyer_data.cif` |
| `{{lawyer_fee}}` | `lawyer_data.fee` |

**Document-specific placeholders:**

| Placeholder | Source |
|-------------|--------|
| `{{contract_number}}` | Auto-incremented from `document_counters.contract_number` |
| `{{imputernicire_number}}` | `lawyer_data.imputernicire_series` + padded number |
| `{{date}}` | Current date formatted as `DD.MM.YYYY` |
| `{{date_long}}` | Current date formatted as `16 februarie 2026` |
| `{{order_number}}` | `order.friendly_order_id` or `order.order_number` |
| `{{total_price}}` | `order.total_price` formatted with 2 decimals |
| `{{service_name}}` | `order.services.name` |
| `{{service_price}}` | `order.base_price` formatted with 2 decimals |

### 6.4 Generation Flow

```
1. Employee clicks "Genereaza cerere eliberare" button (or auto-trigger at payment)
         │
         ▼
2. API reads company_data + lawyer_data from admin_settings
         │
         ▼
3. API reads client data from order.customer_data
         │
         ▼
4. API fetches 3 signature sources:
   a) Client signature: from order.customer_data.signature_base64
      (saved when client signs in wizard)
   b) Company signature: downloaded from S3 using company_data.signature_s3_key
   c) Lawyer signature: downloaded from S3 using lawyer_data.signature_s3_key
   (Lawyer stamp: lawyer_data.stamp_s3_key -- defined but not yet embedded in generation)
         │
         ▼
5. API atomically increments document_counters
   (e.g., contract_number: 4256 → 4257)
         │
         ▼
6. API loads DOCX template from src/templates/cazier-judiciar/
         │
         ▼
7. docxtemplater fills {{placeholders}} with actual data
         │
         ▼
8. Post-processing: signature marker text in DOCX replaced with actual
   signature images (client, company, lawyer) using docx image replacement
         │
         ▼
9. Filled DOCX uploaded to S3:
   contracts/{year}/{month}/{ref}/{filename}.docx
         │
         ▼
10. order_documents row inserted with s3_key, type, metadata
         │
         ▼
11. order_history event logged: "Document generat: Contract prestari #004257"
         │
         ▼
12. Order status updated (if applicable)
```

### 6.4.1 Signature Sources Summary

The document generation system uses three distinct signature sources, each obtained differently:

| Signature | Source | Storage | Obtained By |
|-----------|--------|---------|-------------|
| Client signature | Drawn by client in wizard signature step | `order.customer_data.signature_base64` (base64 in order JSONB) | Read directly from order data |
| Company signature | Uploaded by admin in Settings > Date firma | `signatures/company_signature/{timestamp}.png` in S3 | Downloaded from S3 using `company_data.signature_s3_key` |
| Lawyer signature | Uploaded by admin in Settings > Date firma | `signatures/lawyer_signature/{timestamp}.png` in S3 | Downloaded from S3 using `lawyer_data.signature_s3_key` |
| Lawyer stamp | Uploaded by admin in Settings > Date firma | `signatures/lawyer_stamp/{timestamp}.png` in S3 | Defined in `lawyer_data.stamp_s3_key` (not yet embedded in generation) |

**Implementation:** `src/app/api/admin/orders/[id]/generate-document/route.ts` (lines 154-182)

### 6.5 Auto-Generated Documents (at payment)

When payment is confirmed (Stripe webhook or admin bank transfer verification), the system automatically generates three documents:

1. **Contract prestari servicii** -- includes contract + contract asistenta juridica + GDPR note
2. **Imputernicire avocatiala** -- power of attorney with unique serial number

These are generated using a background job triggered by the payment confirmation handler.

### 6.6 Technology Stack for Document Generation

| Component | Library | Purpose | Status |
|-----------|---------|---------|--------|
| Template filling | `docxtemplater` + `pizzip` (npm) | Replace `{{placeholders}}` in DOCX files | Implemented |
| Signature insertion | Post-processing in `generator.ts` | Replace signature marker text with actual PNG images in DOCX binary | Implemented |
| Document preview | `mammoth` (npm) | Server-side DOCX-to-HTML conversion for admin preview and wizard contract preview | Implemented |
| File storage | AWS S3 (existing) | Store generated DOCX documents | Implemented |
| PDF conversion | `libreoffice --headless --convert-to pdf` | DOCX to PDF conversion | Planned |
| PDF fallback | `docx-pdf` (npm) | Simpler but less accurate conversion | Planned |

### 6.7 Template Management

Templates are editable by the admin:

- **Download template:** Admin downloads the current DOCX template from the settings page
- **Edit in Word:** Admin edits placeholders in Microsoft Word or LibreOffice Writer
- **Re-upload:** Admin uploads the modified template via the settings page
- **Validation:** System validates that all required placeholders exist in the uploaded template

Template storage location:
- **Development:** `src/templates/` in the codebase (version controlled)
- **Production override:** `admin_settings` key `custom_templates` with S3 keys pointing to uploaded templates

---

## 7. Notification System

### 7.1 In-App Notifications for Employees

Employees see a bell icon in the admin header bar with an unread count badge.

```
┌────────────────────────────────────────────────────────────┐
│  [Menu]                               [Bell 🔔 (3)]  Admin │
└────────────────────────────────────────────────────────────┘
```

Clicking the bell opens a dropdown panel showing recent notifications.

### 7.2 Notification Types

| Type | Trigger | Message Example |
|------|---------|-----------------|
| `new_paid_order` | Order payment confirmed | "Comanda noua platita: E-260216-12345 (Cazier Judiciar)" |
| `bank_transfer_submitted` | Client uploads bank transfer proof | "Transfer bancar de verificat: E-260216-12345" |
| `client_document_uploaded` | Client uploads a document to their order | "Document incarcat de client: E-260216-12345" |
| `order_reminder` | Order stuck in a status for >48h | "Comanda E-260216-12345 este in asteptare de 3 zile" |

### 7.3 Database Schema: `notifications` Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read)
  WHERE read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 7.4 Notification API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/notifications` | GET | List notifications for current user (paginated, newest first) |
| `/api/admin/notifications/unread-count` | GET | Get count of unread notifications |
| `/api/admin/notifications/[id]/read` | PATCH | Mark a single notification as read |
| `/api/admin/notifications/read-all` | PATCH | Mark all notifications as read |

---

## 8. Client Document Access

### 8.1 Client Account - Order Detail

The client sees their generated documents in their account page at `/account/orders/[id]`.

**Documents visible to client:**

| Document | When Available | Download |
|----------|---------------|----------|
| Contract prestari servicii (PDF) | After payment | Yes |
| Contract asistenta juridica (PDF) | After payment | Yes |
| Imputernicire avocatiala (PDF) | After payment | Yes |
| Factura (PDF) | After invoice issued (via Oblio) | Yes |
| Document final (cazier / certificat) | When status is `document_ready` or later | Yes |

### 8.2 Client-Facing UI

```
┌─────────────────────────────────────────────────────────────┐
│  Comanda E-260216-12345                                      │
│  Cazier Judiciar - Persoana Fizica                          │
│  Status: Gata de expediere                                   │
│                                                              │
│  Documente:                                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📄 Contract prestari servicii       [Descarca PDF]    │  │
│  │ 📄 Contract asistenta juridica      [Descarca PDF]    │  │
│  │ 📄 Imputernicire avocatiala         [Descarca PDF]    │  │
│  │ 📄 Factura EGH-0001                 [Descarca PDF]    │  │
│  │ 📄 Cazier Judiciar                  [Descarca PDF]    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Istoric:                                                    │
│  ● Finalizata - 20.02.2026                                  │
│  ● Expediata (AWB: 123456789) - 19.02.2026                 │
│  ● Document primit de la IPJ - 18.02.2026                  │
│  ● Depusa la institutie - 16.02.2026                        │
│  ● Plata confirmata - 15.02.2026                            │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Document Visibility Rules

Not all documents should be visible to the client at all times. The `order_documents` table includes a `visible_to_client` column:

| Document Type | `visible_to_client` |
|--------------|---------------------|
| `contract_prestari` | `true` (always visible after generation) |
| `contract_asistenta` | `true` |
| `imputernicire` | `true` |
| `cerere_eliberare` | `false` (internal processing document) |
| `document_received` | `false` (raw scan from institution) |
| `document_final` | `true` (the final delivered document) |
| `invoice` | `true` |

---

## 9. Database Changes

### 9.1 Update Order Status Constraint

Add new statuses to the existing constraint on the `orders` table.

```sql
-- Drop existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add updated constraint with new statuses
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'draft',
    'pending',
    'paid',                      -- NEW: payment confirmed, contracts auto-generated
    'processing',
    'documents_generated',       -- NEW: cerere eliberare generated
    'submitted_to_institution',  -- NEW: application submitted to IPJ/ANAF/etc.
    'document_received',         -- NEW: document received from institution
    'extras_in_progress',        -- NEW: translation/apostille in progress
    'kyc_pending',
    'kyc_approved',
    'kyc_rejected',
    'in_progress',
    'document_ready',
    'shipped',
    'delivered',
    'completed',
    'cancelled',
    'refunded'
  ));
```

### 9.2 New Table: `order_documents`

Tracks all documents associated with an order (generated, uploaded, or received).

```sql
CREATE TABLE order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
    -- Types: 'contract_prestari', 'contract_asistenta', 'imputernicire',
    --        'cerere_eliberare', 'document_received', 'document_final', 'invoice'
  s3_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,               -- bytes
  mime_type TEXT DEFAULT 'application/pdf',
  document_number TEXT,            -- e.g., '004257' for contracts, 'SM 005738' for imputernicire
  visible_to_client BOOLEAN DEFAULT FALSE,
  generated_by UUID REFERENCES profiles(id),  -- null if auto-generated
  metadata JSONB DEFAULT '{}',     -- additional data (e.g., template version)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_documents_order_id ON order_documents(order_id);
CREATE INDEX idx_order_documents_type ON order_documents(type);
CREATE INDEX idx_order_documents_visible ON order_documents(order_id, visible_to_client)
  WHERE visible_to_client = TRUE;
```

### 9.3 New Table: `order_option_status`

Tracks completion status of extra options (translation, apostille, etc.).

```sql
CREATE TABLE order_option_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  option_code TEXT NOT NULL,        -- e.g., 'TRADUCERE_EN', 'APOSTILA'
  option_name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(order_id, option_code)
);

CREATE INDEX idx_order_option_status_order ON order_option_status(order_id);
```

### 9.4 New Table: `notifications`

See section 7.3 above for full schema.

### 9.5 Update `order_history` Event Types

The `order_history.event_type` constraint needs new event types:

```sql
-- Drop old constraint
ALTER TABLE order_history DROP CONSTRAINT IF EXISTS order_history_event_type_check;

-- Add updated constraint (or remove constraint entirely and use text)
ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check
  CHECK (event_type IN (
    'created', 'status_changed', 'status_change',
    'payment_received', 'payment_confirmed', 'payment_created',
    'kyc_submitted', 'kyc_approved', 'kyc_rejected',
    'document_uploaded', 'document_generated',   -- NEW
    'shipped', 'delivered', 'cancelled', 'refunded',
    'note_added', 'assigned',
    'awb_created', 'awb_cancelled',
    'draft_created', 'order_created', 'order_completed',
    'option_completed',                          -- NEW
    'bank_transfer_submitted'
  ));
```

### 9.6 Admin Settings - New Allowed Keys

Add `company_data`, `lawyer_data`, and `document_counters` to the allowed keys in the API route (see section 3.5).

### 9.7 Migration File

All database changes will be consolidated into a single migration file:

```
supabase/migrations/025_admin_workflow.sql
```

---

## 10. Implementation Priority

### Phase 1 -- MVP (Sprint 5.1)

Core processing workflow for Cazier Judiciar.

| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| DB migration: new statuses, `order_documents`, `order_option_status` tables | P0 | 2h | None |
| Admin settings: "Date firma & Avocat" tab with company + lawyer forms | P0 | 4h | DB migration |
| Status flow: contextual action button on order detail page | P0 | 6h | DB migration |
| `POST /api/admin/orders/[id]/process` endpoint | P0 | 8h | DB migration |
| DOCX template creation for Cazier Judiciar (contract, imputernicire, cerere) | P0 | 6h | None |
| Document generation: `docxtemplater` integration + PDF conversion | P0 | 8h | Templates, admin settings |
| Auto-generate contracts at payment confirmation | P0 | 4h | Document generation |
| Generated documents list in order detail | P1 | 3h | `order_documents` table |
| Extra options checklist UI + auto-transition logic | P1 | 4h | `order_option_status` table |
| Document upload for "document received" and "document final" | P1 | 3h | S3 integration (exists) |
| Service tabs on orders list page | P1 | 4h | API changes |

**Estimated total Phase 1:** ~52 hours

### Phase 2 -- Polish (Sprint 5.2)

Notifications, client access, and additional services.

| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| Notification system: `notifications` table + API | P1 | 6h | DB migration |
| In-app notification UI: bell icon + dropdown | P1 | 4h | Notification API |
| Client document access in `/account/orders/[id]` | P1 | 6h | `order_documents` table |
| Status sub-filters within service tabs | P2 | 3h | Service tabs |
| Template management: upload/download custom templates | P2 | 6h | S3, admin settings |
| Additional service templates (Cazier Fiscal, etc.) | P2 | 4h/service | DOCX templates |
| Oblio invoice auto-generation integration | P2 | 8h | Oblio API |
| Email notifications to clients (status changes) | P2 | 6h | Resend integration |

**Estimated total Phase 2:** ~43 hours

---

## 11. Technical Considerations

### 11.1 Atomic Counter Increments

Document counters (contract numbers, imputernicire numbers) must be incremented atomically to prevent duplicate numbers under concurrent access. The recommended approach is a Supabase RPC function:

```sql
CREATE OR REPLACE FUNCTION increment_document_counter(counter_key TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_val INTEGER;
  new_val INTEGER;
BEGIN
  -- Lock the row to prevent concurrent increments
  SELECT (value->>counter_key)::INTEGER INTO current_val
  FROM admin_settings
  WHERE key = 'document_counters'
  FOR UPDATE;

  new_val := COALESCE(current_val, 0) + 1;

  UPDATE admin_settings
  SET value = jsonb_set(value, ARRAY[counter_key], to_jsonb(new_val)),
      updated_at = NOW()
  WHERE key = 'document_counters';

  RETURN new_val;
END;
$$ LANGUAGE plpgsql;
```

### 11.2 PDF Conversion Strategy

Two approaches, with a preference order:

1. **`libreoffice --headless`** (preferred for production)
   - High fidelity DOCX-to-PDF conversion
   - Requires LibreOffice installed on the server (or in Docker container)
   - Command: `libreoffice --headless --convert-to pdf --outdir /tmp output.docx`

2. **`docx-pdf` npm package** (fallback / development)
   - Pure JavaScript, no system dependencies
   - Lower fidelity for complex formatting
   - Sufficient for simple templates

For Vercel deployment, a serverless function with LibreOffice is impractical. Options:
- Use an external conversion service (e.g., CloudConvert API)
- Use a self-hosted conversion microservice (Docker with LibreOffice)
- Use `docx-pdf` npm for simpler output

### 11.3 Template Validation

Before generating a document, validate that all required placeholders exist in the template:

```typescript
const REQUIRED_PLACEHOLDERS: Record<string, string[]> = {
  'contract-prestari': [
    'client_name', 'company_name', 'company_cui',
    'contract_number', 'date', 'total_price',
  ],
  'imputernicire': [
    'client_name', 'client_cnp', 'lawyer_name',
    'lawyer_cabinet', 'imputernicire_number', 'date',
  ],
  'cerere-eliberare-pf': [
    'client_name', 'client_cnp', 'client_address',
    'client_ci_series', 'client_ci_number',
  ],
};
```

### 11.4 S3 Storage Organization

Generated documents follow the existing S3 structure:

```
eghiseul-documents/
└── contracts/
    └── {year}/
        └── {month}/
            └── {order_id}/
                ├── contract-prestari-004257.pdf
                ├── contract-asistenta-004257.pdf
                ├── imputernicire-SM005738.pdf
                ├── cerere-eliberare.pdf
                ├── document-received-ipj.pdf
                └── document-final.pdf
```

### 11.5 Existing Code Impact

The following existing files will need modifications:

| File | Change |
|------|--------|
| `src/app/admin/orders/[id]/page.tsx` | Add processing section, documents list, options checklist |
| `src/app/admin/orders/page.tsx` | Add service tabs, status sub-filters |
| `src/app/admin/settings/page.tsx` | Add "Date firma & Avocat" tab |
| `src/app/api/admin/settings/route.ts` | Add new allowed keys |
| `src/app/api/admin/orders/list/route.ts` | Add `service_id` filter, `status_counts` |
| `src/app/api/admin/orders/[id]/generate-awb/route.ts` | No changes (AWB generation stays the same) |
| `src/app/api/webhooks/stripe/route.ts` | Trigger auto-document generation on payment |
| `src/lib/admin/permissions.ts` | Add new permission: `documents.generate` (optional) |

### 11.6 Error Handling

All document generation operations should be idempotent and recoverable:

- If PDF generation fails after counter increment, the counter is not rolled back (gap is acceptable in legal numbering)
- If S3 upload fails after PDF generation, the operation can be retried
- Each operation logs detailed events to `order_history` for audit trail
- Failed operations show clear error messages in the UI with retry options

### 11.7 Security Considerations

- Document download URLs are presigned S3 URLs with 15-minute expiry (existing pattern)
- Client-visible documents are filtered by `visible_to_client = TRUE`
- All processing actions require `orders.manage` permission
- Settings changes require `settings.manage` permission
- Document counters are protected by row-level locking (see section 11.1)

---

---

## 12. Template Analysis & Separation

### 12.1 Current State

The existing template file `Contract Template SITE cu Client si Imputernicire avocatiala.docx` combines three distinct legal documents into a single file. This creates problems for:

- Individual document generation (e.g., only generating the power of attorney)
- Independent versioning and updates per document type
- Conditional inclusion based on service type (some services do not require a lawyer)
- Separate download links in client account and admin panel

### 12.2 Proposed Separation

The combined template must be separated into individual document templates:

| # | Template File | Document Name (RO) | Purpose |
|---|--------------|---------------------|---------|
| 1 | `contract-prestari-servicii.docx` | Contract de prestari servicii | Service contract between EDIGITALIZARE SRL and the client (PF or PJ) |
| 2 | `contract-asistenta-juridica.docx` | Contract de asistenta juridica + Nota GDPR | Legal assistance contract between Cabinet Avocat Tarta and client, including the GDPR information note |
| 3 | `imputernicire-avocatiala.docx` | Imputernicire avocatiala | Power of attorney authorizing the lawyer to act on behalf of the client (already a separate template) |
| 4 | `cerere-eliberare-cazier-pf.docx` | Cerere eliberare cazier judiciar PF | Application form for criminal record -- natural person |
| 5 | `cerere-eliberare-cazier-pj.docx` | Cerere eliberare cazier judiciar PJ | Application form for criminal record -- legal entity |

**Updated file structure:**

```
src/templates/
├── cazier-judiciar/
│   ├── contract-prestari-servicii.docx    ← Separated from combined template
│   ├── contract-asistenta-juridica.docx   ← Separated from combined template
│   ├── imputernicire-avocatiala.docx      ← Already separate
│   ├── cerere-eliberare-cazier-pf.docx    ← Application form PF
│   └── cerere-eliberare-cazier-pj.docx    ← Application form PJ
├── cazier-fiscal/
│   └── ... (future templates)
├── certificat-nastere/
│   └── ... (future templates)
└── shared/
    └── header-footer.docx
```

### 12.3 Current Placeholders (from existing template)

These placeholders already exist in the combined template and will be preserved in the separated files:

**Order & Client placeholders:**

| Placeholder | Description | Used In |
|-------------|-------------|---------|
| `{{NRCOMANDA}}` | Order number (e.g., E-260216-12345) | Contract prestari, Contract asistenta |
| `{{NUMECLIENT}}` | Client full name | All documents |
| `{{CNP/CUI}}` | Client CNP (PF) or CUI (PJ) | All documents |
| `{{EMAIL}}` | Client email address | Contract prestari, Contract asistenta |
| `{{NUMESERVICIU}}` | Service name (e.g., "Cazier Judiciar PF") | Contract prestari |
| `{{TOTALPLATA}}` | Total payment amount | Contract prestari |

**Company (EDIGITALIZARE) placeholders:**

| Placeholder | Description | Used In |
|-------------|-------------|---------|
| `{{NUMEFIRMAN}}` | Company name | Contract prestari |
| `{{CUIFIRMAN}}` | Company CUI | Contract prestari |
| `{{NRORDINEFIRMAN}}` | Company registration number (J30/...) | Contract prestari |
| `{{IBANFIRMAN}}` | Company IBAN | Contract prestari |
| `{{JUDETFIRMAN}}` | Company county | Contract prestari |
| `{{COMUNAFIRMA}}` | Company locality | Contract prestari |
| `{{STRADASINRFIRMA}}` | Company street and number | Contract prestari |

**Document metadata placeholders:**

| Placeholder | Description | Used In |
|-------------|-------------|---------|
| `{{NRCONTRACT}}` | Contract sequential number (e.g., 004257) | Contract prestari, Contract asistenta |
| `{{DATA}}` | Current date (DD.MM.YYYY) | All documents |
| `{{DATACOMANDA}}` | Order creation date | Contract prestari |
| `{{SEMNATURA}}` | Signature placeholder / image | Contract prestari, Imputernicire |
| `{{zap_meta_human_now}}` | Zapier timestamp -- **TO BE REPLACED** with `{{GENERATED_AT}}` | Legacy, remove |

### 12.4 New Placeholders to Add

The following placeholders are missing from the current template and must be added during the separation process:

**Client identity placeholders:**

| Placeholder | Description | Source | Used In |
|-------------|-------------|--------|---------|
| `{{CLIENT_PHONE}}` | Client phone number | `order.customer_data.contact.phone` | Contract prestari, Contract asistenta |
| `{{CLIENT_ADDRESS}}` | Client full address (formatted) | `order.customer_data.personalData.address` | Contract asistenta, Imputernicire, Cerere |
| `{{CLIENT_CI_SERIES}}` | ID card series (e.g., SM) | `order.customer_data.personalData.ci_series` | Imputernicire, Cerere |
| `{{CLIENT_CI_NUMBER}}` | ID card number (e.g., 123456) | `order.customer_data.personalData.ci_number` | Imputernicire, Cerere |

**PJ (legal entity) placeholders:**

| Placeholder | Description | Source | Used In |
|-------------|-------------|--------|---------|
| `{{CLIENT_COMPANY_NAME}}` | Company name | `order.customer_data.companyData.companyName` | Contract prestari (PJ variant) |
| `{{CLIENT_COMPANY_REG}}` | Company registration number | `order.customer_data.companyData.registrationNumber` | Contract prestari (PJ variant) |
| `{{CLIENT_COMPANY_ADDRESS}}` | Company registered address | `order.customer_data.companyData.address` | Contract prestari (PJ variant) |

**Lawyer / legal placeholders:**

| Placeholder | Description | Source | Used In |
|-------------|-------------|--------|---------|
| `{{LAWYER_FEE}}` | Lawyer fee amount (currently hardcoded "15 RON") | `admin_settings.lawyer_data.fee` | Contract asistenta |
| `{{IPJ_LOCATION}}` | Institution location (currently hardcoded "IPJ SATU MARE") | `service.processing_config.institution` or admin override | Cerere, Imputernicire |
| `{{MOTIV_SOLICITARE}}` | Request reason (currently hardcoded "ACCESARE FONDURI") | `service.processing_config.default_motiv` or order form | Cerere |
| `{{IMPUTERNICIRE_NR}}` | Power of attorney sequential number | `admin_settings.document_counters.imputernicire_number` | Imputernicire |
| `{{IMPUTERNICIRE_SERIA}}` | Power of attorney series (e.g., SM) | `admin_settings.lawyer_data.imputernicire_series` | Imputernicire |

**System metadata placeholders:**

| Placeholder | Description | Source | Used In |
|-------------|-------------|--------|---------|
| `{{GENERATED_AT}}` | Document generation timestamp (replaces `{{zap_meta_human_now}}`) | `new Date().toLocaleString('ro-RO')` | All documents |

### 12.5 Placeholder Migration Map

Mapping from old (Zapier-era) placeholders to the new standardized naming:

| Old Placeholder | New Placeholder | Notes |
|----------------|-----------------|-------|
| `{{NRCOMANDA}}` | `{{order_number}}` | Align with section 6.3 naming |
| `{{NUMECLIENT}}` | `{{client_name}}` | Align with section 6.3 naming |
| `{{CNP/CUI}}` | `{{client_cnp}}` / `{{client_cui}}` | Split into PF and PJ variants |
| `{{EMAIL}}` | `{{client_email}}` | Align with section 6.3 naming |
| `{{NUMESERVICIU}}` | `{{service_name}}` | Align with section 6.3 naming |
| `{{TOTALPLATA}}` | `{{total_price}}` | Align with section 6.3 naming |
| `{{NUMEFIRMAN}}` | `{{company_name}}` | Align with section 6.3 naming |
| `{{CUIFIRMAN}}` | `{{company_cui}}` | Align with section 6.3 naming |
| `{{NRORDINEFIRMAN}}` | `{{company_reg_number}}` | Align with section 6.3 naming |
| `{{IBANFIRMAN}}` | `{{company_iban}}` | Align with section 6.3 naming |
| `{{JUDETFIRMAN}}` | `{{company_county}}` | New, extracted from `company_address` |
| `{{COMUNAFIRMA}}` | `{{company_locality}}` | New, extracted from `company_address` |
| `{{STRADASINRFIRMA}}` | `{{company_street}}` | New, extracted from `company_address` |
| `{{NRCONTRACT}}` | `{{contract_number}}` | Align with section 6.3 naming |
| `{{DATA}}` | `{{date}}` | Align with section 6.3 naming |
| `{{DATACOMANDA}}` | `{{order_date}}` | Align with section 6.3 naming |
| `{{SEMNATURA}}` | `{{signature}}` | Image placeholder |
| `{{zap_meta_human_now}}` | `{{GENERATED_AT}}` | Zapier removal |

### 12.6 PF/PJ Conditional Logic

The `docxtemplater` library supports conditional sections using block syntax. This allows a single template to handle both PF and PJ clients without maintaining separate template variants.

**Syntax:**

```
{#isPF}
This text only appears for Persoana Fizica clients.
CNP: {client_cnp}
Domiciliat in: {client_address}
{/isPF}

{#isPJ}
This text only appears for Persoana Juridica clients.
Denumire: {CLIENT_COMPANY_NAME}
CUI: {client_cui}
Nr. Inregistrare: {CLIENT_COMPANY_REG}
Sediul: {CLIENT_COMPANY_ADDRESS}
Reprezentata de: {client_name}, CNP {client_cnp}
{/isPJ}
```

**Template data preparation:**

```typescript
// In the document generation service
const templateData = {
  // Conditional flags
  isPF: order.customer_data.clientType === 'pf',
  isPJ: order.customer_data.clientType === 'pj',

  // Common fields
  client_name: order.customer_data.contact.name,
  client_email: order.customer_data.contact.email,
  client_phone: order.customer_data.contact.phone,

  // PF-specific
  client_cnp: order.customer_data.personalData?.cnp,
  client_address: formatAddress(order.customer_data.personalData?.address),
  client_ci_series: order.customer_data.personalData?.ci_series,
  client_ci_number: order.customer_data.personalData?.ci_number,

  // PJ-specific
  CLIENT_COMPANY_NAME: order.customer_data.companyData?.companyName,
  client_cui: order.customer_data.companyData?.cui,
  CLIENT_COMPANY_REG: order.customer_data.companyData?.registrationNumber,
  CLIENT_COMPANY_ADDRESS: order.customer_data.companyData?.address,

  // ... other fields
};
```

**Documents that use conditional PF/PJ sections:**

| Template | PF/PJ Conditional Sections |
|----------|---------------------------|
| `contract-prestari-servicii.docx` | Yes -- client identification section differs |
| `contract-asistenta-juridica.docx` | Yes -- client identification section differs |
| `imputernicire-avocatiala.docx` | Yes -- representation clause differs for PJ |
| `cerere-eliberare-cazier-pf.docx` | No -- PF-only template |
| `cerere-eliberare-cazier-pj.docx` | No -- PJ-only template |

---

## 13. Updated RBAC Roles

### 13.1 Expanded Role Definitions

The current role system (`super_admin`, `employee`) is expanded to support specialized roles aligned with the business operations:

| Role | Admin Access | Description |
|------|-------------|-------------|
| `super_admin` | Full | Platform owner. All permissions implicit. Cannot be degraded from UI. |
| `manager` | Almost full | Team management, reports, approve operations. Can do everything except platform-level settings. |
| `operator` | Orders + processing | Process orders, generate documents, create AWB. Day-to-day operational work. |
| `contabil` | Payments + invoices | Verify payments, manage Oblio invoices, view payment-related orders. |
| `avocat` | Legal documents | View and sign imputerniciri, contracts de asistenta juridica. Limited order visibility. |

**Database constraint update:**

```sql
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'super_admin', 'manager', 'operator', 'contabil', 'avocat', 'partner'));
```

**Note:** The `employee` role is deprecated and replaced by the more specific roles above. Existing employees with the `employee` role will be migrated to `operator` as the default.

### 13.2 Updated Permission Matrix

| Permission | super_admin | manager | operator | contabil | avocat |
|------------|:-----------:|:-------:|:--------:|:--------:|:------:|
| `orders.view` | Always | Yes | Yes | Yes (payment-related orders only) | Yes (own assigned docs only) |
| `orders.manage` | Always | Yes | Yes | No | No |
| `payments.verify` | Always | Yes | No | Yes | No |
| `users.manage` | Always | Yes | No | No | No |
| `settings.manage` | Always | Yes | No | No | No |
| `documents.generate` | Always | Yes | Yes | No | No |
| `documents.view` | Always | Yes | Yes | Yes | Yes |
| `documents.sign` | Always | No | No | No | Yes |

**New permissions added:**

| Permission | Description |
|------------|-------------|
| `documents.generate` | Generate contracts, imputerniciri, cereri from DOCX templates |
| `documents.view` | View and download generated documents (PDF) |
| `documents.sign` | Digitally sign legal documents (imputernicire, contract asistenta) |

**Dependency rules (enforced in middleware):**

- `orders.manage` requires `orders.view`
- `payments.verify` requires `orders.view`
- `documents.generate` requires `orders.view` and `documents.view`
- `documents.sign` requires `documents.view`

### 13.3 Role Assignment Flow

```
super_admin invites new team member
         │
         ▼
Select role: manager | operator | contabil | avocat
         │
         ▼
Permissions auto-assigned based on role defaults
         │
         ▼
super_admin / manager can override individual permissions
```

**Default permissions per role:**

```typescript
const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  manager: [
    'orders.view', 'orders.manage', 'payments.verify',
    'users.manage', 'settings.manage',
    'documents.generate', 'documents.view',
  ],
  operator: [
    'orders.view', 'orders.manage',
    'documents.generate', 'documents.view',
  ],
  contabil: [
    'orders.view', 'payments.verify', 'documents.view',
  ],
  avocat: [
    'orders.view', 'documents.view', 'documents.sign',
  ],
};
```

---

## 14. Service Processing Configuration

### 14.1 Overview

Each service in the `services` table gets a new `processing_config` JSONB column that defines how orders for that service are processed. This configuration drives:

- Which document templates are used
- Which documents are auto-generated at payment
- Which documents require manual generation by an operator
- Whether the service requires lawyer involvement
- What institution processes the request
- Sequential document numbering settings

### 14.2 Schema

```sql
-- Add processing_config to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS processing_config JSONB DEFAULT '{}';
```

### 14.3 Configuration Structure

```json
{
  "requires_lawyer": true,
  "document_templates": [
    "contract-prestari-servicii",
    "contract-asistenta-juridica",
    "imputernicire-avocatiala"
  ],
  "auto_generate_at_payment": [
    "contract-prestari-servicii",
    "contract-asistenta-juridica",
    "imputernicire-avocatiala"
  ],
  "manual_generate": [
    "cerere-eliberare"
  ],
  "numbering": {
    "contract": true,
    "imputernicire": true
  },
  "institution": "IPJ",
  "default_motiv": "ACCESARE FONDURI"
}
```

### 14.4 Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `requires_lawyer` | `boolean` | Whether this service involves legal assistance (lawyer contract + imputernicire) |
| `document_templates` | `string[]` | All document templates relevant to this service |
| `auto_generate_at_payment` | `string[]` | Templates auto-generated when payment is confirmed |
| `manual_generate` | `string[]` | Templates generated manually by operator during processing |
| `numbering.contract` | `boolean` | Whether the service contract gets a sequential number |
| `numbering.imputernicire` | `boolean` | Whether the power of attorney gets a sequential number |
| `institution` | `string` | Government institution that processes the request (IPJ, ANAF, Primarie, etc.) |
| `default_motiv` | `string` | Default reason for the request (can be overridden per order) |

### 14.5 Service Type Examples

**Services WITH lawyer (requires_lawyer: true):**

These services require legal representation and generate the full document set:

```json
// Cazier Judiciar PF / PJ
{
  "requires_lawyer": true,
  "document_templates": [
    "contract-prestari-servicii",
    "contract-asistenta-juridica",
    "imputernicire-avocatiala",
    "cerere-eliberare"
  ],
  "auto_generate_at_payment": [
    "contract-prestari-servicii",
    "contract-asistenta-juridica",
    "imputernicire-avocatiala"
  ],
  "manual_generate": ["cerere-eliberare"],
  "numbering": { "contract": true, "imputernicire": true },
  "institution": "IPJ",
  "default_motiv": "ACCESARE FONDURI"
}
```

**Services WITHOUT lawyer (requires_lawyer: false):**

These services only generate the basic service contract:

```json
// Certificat Nastere, Extras CF, etc.
{
  "requires_lawyer": false,
  "document_templates": ["contract-prestari-servicii"],
  "auto_generate_at_payment": ["contract-prestari-servicii"],
  "manual_generate": [],
  "numbering": { "contract": true, "imputernicire": false },
  "institution": "Primarie",
  "default_motiv": null
}
```

### 14.6 Impact on Document Generation Flow

The `processing_config` drives the generation logic at payment confirmation:

```typescript
async function onPaymentConfirmed(order: Order, service: Service) {
  const config = service.processing_config;

  // Auto-generate documents listed in auto_generate_at_payment
  for (const templateName of config.auto_generate_at_payment) {
    await generateDocument(order, templateName, {
      numbering: config.numbering,
      institution: config.institution,
      default_motiv: config.default_motiv,
    });
  }

  // If service requires lawyer, include lawyer data in templates
  if (config.requires_lawyer) {
    const lawyerData = await getAdminSetting('lawyer_data');
    // Lawyer data injected into contract-asistenta and imputernicire templates
  }
}
```

### 14.7 Impact on Admin Order Detail

The processing section (section 5) adapts based on `processing_config`:

- **With lawyer:** Shows all document rows (contract prestari + contract asistenta + imputernicire + cerere + final)
- **Without lawyer:** Shows only contract prestari + final document
- **Manual generate buttons:** Only shown for documents in `manual_generate` array
- **Institution label:** Contextual button says "Marcheaza depusa la {institution}" (e.g., "Marcheaza depusa la IPJ" or "Marcheaza depusa la ANAF")

---

## 15. Contract Preview in Order Wizard (Implemented)

### 15.1 Overview

The order wizard includes a contract preview feature at the signature step (typically step 10 in the Cazier Judiciar flow). This allows clients -- including guests who are not logged in -- to read the full contract text before signing electronically.

### 15.2 Architecture

```
Client draws signature on canvas
         │
         ├── Signature saved as base64 in wizard state
         │
         ▼
ContractPreview component (at signature step)
         │
         ├── POST /api/contracts/preview (no auth required)
         │         │
         │         ├── Fetches company_data + lawyer_data from admin_settings
         │         ├── Builds ClientData from request body (wizard form data)
         │         ├── Generates DOCX using contract-complet template
         │         │   with DRAFT document numbers (contract: 0, imputernicire: 0)
         │         ├── Converts DOCX to HTML via mammoth
         │         ├── Smart signature placement:
         │         │     ├── sig-placeholder: client signature areas (dashed border, interactive)
         │         │     └── sig-other: company/lawyer signature areas (static, grayed out)
         │         └── Returns HTML string
         │
         ▼
Client-side reactive replacement:
  When signatureBase64 changes in wizard state,
  all <div class="sig-placeholder"> elements are replaced
  with <img src="data:image/png;base64,{signatureBase64}" />
```

### 15.3 API Endpoint

**Endpoint:** `POST /api/contracts/preview`
**Authentication:** None required (guests use this during the order wizard)
**File:** `src/app/api/contracts/preview/route.ts`

**Request Body:**

```json
{
  "serviceSlug": "cazier-judiciar",
  "serviceName": "Cazier Judiciar - Persoana Fizica",
  "contact": { "email": "ion@example.com", "phone": "0712345678" },
  "personalData": {
    "firstName": "Ion",
    "lastName": "Popescu",
    "cnp": "1850101123456",
    "documentSeries": "SM",
    "documentNumber": "123456",
    "address": { "street": "Mihai Eminescu", "number": "1", "city": "Satu Mare", "county": "Satu Mare" }
  },
  "billing": { "type": "persoana_fizica" },
  "totalPrice": 279,
  "servicePrice": 180,
  "orderId": "uuid-or-null",
  "friendlyOrderId": "E-260217-00001"
}
```

**Response:**

```json
{
  "success": true,
  "html": "<p><strong>CONTRACT DE PRESTARI SERVICII</strong></p>..."
}
```

### 15.4 Signature Placement Classes

The contract preview HTML uses CSS classes to differentiate between client signature areas and company/lawyer signature areas:

| CSS Class | Purpose | Behavior |
|-----------|---------|----------|
| `.sig-placeholder` | Client signature area | Dashed border, replaced with drawn signature image when client signs |
| `.sig-other` | Company/lawyer signature area | Static gray box, labeled "Semnatura prestator" or "Semnatura avocat" |
| `.sig-image` | Rendered signature image | Appears after client draws signature (replaces `.sig-placeholder`) |

### 15.5 Smart Signature Table Detection

The preview API parses the mammoth-generated HTML and identifies signature tables by their content:

1. **Table 1 (Contract Prestari):** Detected by "PRESTATOR" text. Left cell = company signature (`sig-other`), right cell = client signature (`sig-placeholder`)
2. **Table 2 (Contract Asistenta):** Detected by "FORMA DE EXERCITARE" text. Left cell = lawyer signature (`sig-other`), right cell = client signature (`sig-placeholder`)
3. **Table 3 (Nota de Informare):** Single-column table. Cell with client name gets `sig-placeholder`

### 15.6 Component

**File:** `src/components/orders/modules/signature/ContractPreview.tsx`

Key features:
- Collapsible card with expand/collapse toggle
- Loading spinner while preview generates
- Error state with user-friendly message
- `useMemo` for efficient re-rendering when signature changes
- Scroll container (max-height 500px) for long contracts
- Serif font styling (Times New Roman) matching actual contract appearance

---

**Last Updated:** 2026-02-17
**Next Review:** Before Sprint 6 implementation start
