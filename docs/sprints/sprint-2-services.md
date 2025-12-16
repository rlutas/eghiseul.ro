# Sprint 2: Services Core

**Duration:** Week 5-8
**Status:** Planning
**Migration:** `002_services.sql`

---

## Overview

Sprint 2 establishes the core services functionality with a complete database schema for services, orders, and service options. This sprint implements the foundation for the 3 MVP services (Cazier Fiscal, Extras CF, Certificat Constatator) with full order lifecycle tracking.

---

## Database Schema

### Tables Created

1. **services** - Service catalog with JSONB configuration
2. **service_options** - Optional add-ons (urgency, translations, apostille)
3. **orders** - Complete order lifecycle management
4. **order_history** - Audit log for all order changes

---

## Services Table

### Structure

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY,
  slug VARCHAR(100) UNIQUE,           -- URL-friendly identifier
  code VARCHAR(20) UNIQUE,            -- Internal code (SRV-001, etc)
  name VARCHAR(255),
  description TEXT,
  short_description VARCHAR(500),
  category VARCHAR(100),              -- fiscale, juridice, imobiliare, etc

  -- Pricing
  base_price DECIMAL(10,2),
  currency VARCHAR(3),

  -- Status
  is_active BOOLEAN,
  is_featured BOOLEAN,
  requires_kyc BOOLEAN,

  -- Processing time
  estimated_days INTEGER,
  urgent_available BOOLEAN,
  urgent_days INTEGER,

  -- Configuration (JSONB)
  config JSONB,

  -- SEO
  display_order INTEGER,
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Config JSON Structure

The `config` JSONB column stores flexible service configuration:

```json
{
  "required_fields": [
    "cnp",
    "first_name",
    "last_name",
    "birth_date",
    "address",
    "phone",
    "email"
  ],
  "optional_fields": [
    "company_name",
    "cui"
  ],
  "delivery_methods": [
    "email",
    "registered_mail",
    "courier"
  ],
  "validation_rules": {
    "cnp": {
      "type": "regex",
      "pattern": "^[1-9]\\d{12}$",
      "message": "CNP invalid. Trebuie să conțină 13 cifre."
    },
    "cui": {
      "type": "anaf_api",
      "validate_online": true
    }
  },
  "document_templates": {
    "contract": "contracts/cazier-fiscal-contract.pdf",
    "instructions": "instructions/cazier-fiscal.md"
  },
  "kyc_requirements": {
    "identity_card": true,
    "selfie": true,
    "signature": true
  },
  "processing_steps": [
    "Verificare documente KYC",
    "Generare procură",
    "Depunere cerere la ANAF",
    "Ridicare cazier fiscal",
    "Livrare către client"
  ]
}
```

### Indexes

- `idx_services_slug` - Fast lookup by URL slug
- `idx_services_code` - Fast lookup by internal code
- `idx_services_category` - Filter by category
- `idx_services_active` - Partial index for active services only
- `idx_services_featured` - Partial index for featured services
- `idx_services_config` - GIN index for JSONB queries

### RLS Policies

- **Public**: View active services only
- **Admins**: Full CRUD access
- **Multi-tenancy ready**: Partner isolation for Phase 2

---

## Service Options Table

### Structure

```sql
CREATE TABLE service_options (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  code VARCHAR(50),                    -- urgenta, traducere_en, apostila
  name VARCHAR(255),
  description TEXT,

  -- Pricing
  price DECIMAL(10,2),
  price_type VARCHAR(20),              -- fixed, percentage

  -- Configuration
  is_active BOOLEAN,
  is_required BOOLEAN,
  max_quantity INTEGER,

  -- Additional config (JSONB)
  config JSONB,

  -- Display
  display_order INTEGER,
  icon VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,

  UNIQUE(service_id, code)
);
```

### Available Options (MVP)

| Code | Name | Price | Available For |
|------|------|-------|---------------|
| `urgenta` | Procesare Urgentă | 100 RON | All services |
| `traducere_en` | Traducere Engleză | 150 RON | Cazier Fiscal |
| `apostila` | Apostilă | 120 RON | Cazier Fiscal |
| `copii_suplimentare` | Copii Suplimentare | 25 RON | All services |

### Config Examples

**Urgency Option:**
```json
{
  "affects_delivery_time": true,
  "delivery_days_reduction": 3
}
```

**Translation Option:**
```json
{
  "additional_fields": ["target_language"],
  "processing_days_add": 2
}
```

**Apostille Option:**
```json
{
  "processing_days_add": 3,
  "requires_original": true
}
```

---

## Orders Table

### Structure

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,     -- Format: YYYY-NNNNNN

  -- References
  user_id UUID REFERENCES profiles(id),
  service_id UUID REFERENCES services(id),
  partner_id UUID,                     -- Future: partner orders

  -- Status tracking
  status VARCHAR(50),                  -- See lifecycle below

  -- Customer data (JSONB)
  customer_data JSONB,
  selected_options JSONB,

  -- Delivery
  delivery_method VARCHAR(50),
  delivery_address JSONB,
  delivery_tracking_number VARCHAR(255),
  delivery_tracking_url TEXT,

  -- Pricing
  base_price DECIMAL(10,2),
  options_price DECIMAL(10,2),
  delivery_price DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  total_price DECIMAL(10,2),
  currency VARCHAR(3),

  -- Payment
  payment_status VARCHAR(50),
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  paid_at TIMESTAMPTZ,

  -- KYC
  kyc_documents JSONB,
  kyc_verified_at TIMESTAMPTZ,
  kyc_verified_by UUID,
  kyc_rejection_reason TEXT,

  -- Documents
  contract_url TEXT,
  contract_signed_at TIMESTAMPTZ,
  final_document_url TEXT,
  final_document_uploaded_at TIMESTAMPTZ,

  -- Invoicing
  invoice_number VARCHAR(100),
  invoice_url TEXT,
  invoice_issued_at TIMESTAMPTZ,

  -- Admin
  admin_notes TEXT,
  internal_status_notes JSONB,
  assigned_to UUID,

  -- Dates
  estimated_completion_date DATE,
  actual_completion_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);
```

### Order Number Generation

Orders are automatically numbered using the format `YYYY-NNNNNN`:

- **2025-000001** - First order of 2025
- **2025-000002** - Second order of 2025
- **2026-000001** - First order of 2026 (resets annually)

Implemented via `generate_order_number()` trigger.

### Order Lifecycle

```
draft → pending → processing → kyc_pending → kyc_approved →
in_progress → document_ready → shipped → delivered → completed

Alternative paths:
├─ kyc_rejected (requires resubmission)
├─ cancelled (customer/admin cancellation)
└─ refunded (payment refunded)
```

**Status Definitions:**

| Status | Description | Customer Action | Admin Action |
|--------|-------------|-----------------|--------------|
| `draft` | Order being created | Fill form | - |
| `pending` | Payment pending | Complete payment | - |
| `processing` | Payment received | Wait | Process KYC |
| `kyc_pending` | Waiting for KYC docs | Upload docs | - |
| `kyc_approved` | KYC approved | Wait | Start processing |
| `kyc_rejected` | KYC rejected | Resubmit docs | Review |
| `in_progress` | Document being obtained | Wait | Work on document |
| `document_ready` | Document ready | - | Prepare shipping |
| `shipped` | Document shipped | Wait for delivery | - |
| `delivered` | Document delivered | Confirm receipt | - |
| `completed` | Order completed | - | Archive |
| `cancelled` | Order cancelled | - | Process refund |
| `refunded` | Payment refunded | - | - |

### Customer Data Structure

```json
{
  "personal": {
    "cnp": "1850101123456",
    "first_name": "Ion",
    "last_name": "Popescu",
    "birth_date": "1985-01-01",
    "birth_place": "Bucuresti",
    "address": "Str. Example nr. 1, Sector 1, Bucuresti"
  },
  "contact": {
    "email": "ion.popescu@example.com",
    "phone": "+40712345678",
    "preferred_contact": "email"
  },
  "purpose": "Obținere loc de muncă",
  "company": {
    "name": "SRL Example",
    "cui": "12345678"
  }
}
```

### Selected Options Structure

```json
{
  "urgenta": {
    "quantity": 1,
    "price": 100.00
  },
  "traducere_en": {
    "quantity": 1,
    "price": 150.00,
    "target_language": "en"
  },
  "copii_suplimentare": {
    "quantity": 3,
    "price": 75.00
  }
}
```

### KYC Documents Structure

```json
{
  "identity_card_front": "s3://eghiseul-documents/kyc/user_id/order_id/ci_front.jpg",
  "identity_card_back": "s3://eghiseul-documents/kyc/user_id/order_id/ci_back.jpg",
  "selfie": "s3://eghiseul-documents/kyc/user_id/order_id/selfie.jpg",
  "signature": "data:image/png;base64,...",
  "ocr_data": {
    "cnp": "1850101123456",
    "name": "ION POPESCU",
    "birth_date": "01.01.1985",
    "confidence": 0.98,
    "verified": true
  },
  "face_match": {
    "confidence": 0.95,
    "matched": true
  }
}
```

### Indexes

**Standard Indexes:**
- `idx_orders_user_id` - User's orders lookup
- `idx_orders_service_id` - Service orders lookup
- `idx_orders_partner_id` - Partner orders (Phase 2)
- `idx_orders_status` - Status filtering
- `idx_orders_payment_status` - Payment filtering
- `idx_orders_created_at` - Chronological sorting
- `idx_orders_submitted_at` - Submitted orders (partial)
- `idx_orders_assigned_to` - Admin assignments (partial)
- `idx_orders_stripe_payment_intent` - Payment lookup (partial)

**GIN Indexes (JSONB):**
- `idx_orders_customer_data` - Query customer fields
- `idx_orders_selected_options` - Query selected options
- `idx_orders_kyc_documents` - Query KYC data

### RLS Policies

- **Users**: View/update own orders (drafts and kyc_pending only)
- **Admins**: Full access to all orders
- **Partners**: View their own orders (Phase 2)

### Automated Triggers

1. **Order Number Generation** - Auto-generate sequential numbers
2. **Updated At** - Auto-update timestamp on changes
3. **Submitted At** - Set when status changes from draft
4. **Estimated Completion** - Calculate based on service + options
5. **Status Change Logging** - Auto-log to order_history

---

## Order History Table

### Structure

```sql
CREATE TABLE order_history (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  changed_by UUID REFERENCES profiles(id),

  event_type VARCHAR(50),              -- See event types below
  old_value JSONB,
  new_value JSONB,

  notes TEXT,
  metadata JSONB,

  -- Security tracking
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ
);
```

### Event Types

| Event Type | Triggered When | Logged By |
|-----------|----------------|-----------|
| `created` | Order created | System |
| `status_changed` | Status updated | System/Admin |
| `payment_received` | Payment confirmed | Stripe webhook |
| `kyc_submitted` | Customer uploads KYC | System |
| `kyc_approved` | Admin approves KYC | Admin |
| `kyc_rejected` | Admin rejects KYC | Admin |
| `document_uploaded` | Final doc uploaded | Admin |
| `shipped` | Order shipped | Admin |
| `delivered` | Delivery confirmed | System/Customer |
| `cancelled` | Order cancelled | Admin/Customer |
| `refunded` | Payment refunded | Admin |
| `note_added` | Admin adds note | Admin |
| `assigned` | Order assigned | Admin |

### Automatic Logging

Status changes are automatically logged via trigger:

```sql
-- Trigger logs every status change
CREATE TRIGGER orders_log_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();
```

---

## MVP Services

### 1. Cazier Fiscal (SRV-001)

**Details:**
- **Category:** Fiscale
- **Base Price:** 149 RON
- **Processing:** 5 days (2 days urgent)
- **Requires KYC:** Yes

**Required Fields:**
- CNP, First Name, Last Name
- Birth Date, Address
- Phone, Email

**Available Options:**
- Urgență (100 RON)
- Traducere EN (150 RON)
- Apostilă (120 RON)
- Copii suplimentare (25 RON/buc)

**Processing Steps:**
1. Verificare documente KYC
2. Generare procură
3. Depunere cerere la ANAF
4. Ridicare cazier fiscal
5. Livrare către client

---

### 2. Extras Carte Funciară (SRV-031)

**Details:**
- **Category:** Imobiliare
- **Base Price:** 99 RON
- **Processing:** 5 days (2 days urgent)
- **Requires KYC:** Yes

**Required Fields:**
- CNP, First Name, Last Name
- Phone, Email
- Număr cadastral

**Optional Fields:**
- Județ, Localitate
- Adresa imobil

**Available Options:**
- Urgență (100 RON)
- Copii suplimentare (25 RON/buc)

**Processing Steps:**
1. Verificare documente KYC
2. Identificare imobil în ANCPI
3. Depunere cerere la OCPI
4. Ridicare extras CF
5. Livrare către client

---

### 3. Certificat Constatator (SRV-030)

**Details:**
- **Category:** Comerciale
- **Base Price:** 129 RON
- **Processing:** 5 days (2 days urgent)
- **Requires KYC:** Yes

**Required Fields:**
- CNP, First Name, Last Name
- Phone, Email
- CUI, Company Name

**Optional Fields:**
- Nr. Reg. Com.

**Validation:**
- CUI validated via ANAF API

**Available Options:**
- Urgență (100 RON)
- Copii suplimentare (25 RON/buc)

**Processing Steps:**
1. Verificare documente KYC
2. Verificare firmă în ANAF
3. Depunere cerere la ONRC
4. Ridicare certificat
5. Livrare către client

---

## Helper Functions

### 1. Calculate Order Total

```sql
SELECT calculate_order_total('order_uuid');
```

Calculates total price from:
- Base price (from service)
- Options price (from selected_options)
- Delivery price
- Discount amount

### 2. Order Statistics

```sql
SELECT * FROM get_order_statistics(
  '2025-01-01'::DATE,  -- start_date
  '2025-12-31'::DATE   -- end_date
);
```

Returns:
- Total orders
- Completed orders
- Pending orders
- Total revenue
- Average order value
- Completion rate

---

## Performance Considerations

### Indexing Strategy

1. **Standard B-tree indexes** for foreign keys and frequent filters
2. **Partial indexes** for common WHERE conditions (is_active, status)
3. **GIN indexes** for JSONB columns (enables fast JSON queries)
4. **Composite indexes** can be added later if query patterns emerge

### Query Optimization

**Good practices:**
```sql
-- Use indexes effectively
SELECT * FROM orders WHERE user_id = 'uuid' AND status = 'pending';

-- JSONB queries use GIN index
SELECT * FROM orders WHERE customer_data @> '{"personal": {"cnp": "1850101123456"}}';

-- Partial index for active services
SELECT * FROM services WHERE is_active = TRUE;
```

**Avoid:**
```sql
-- Full table scans
SELECT * FROM orders WHERE LOWER(admin_notes) LIKE '%search%';

-- Use materialized views for heavy aggregations instead
```

---

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- **Public access** - Active services/options only
- **User access** - Own orders only
- **Admin access** - Full access
- **Partner access** - Own orders (Phase 2)

### Audit Trail

- All status changes logged to `order_history`
- IP address and user agent tracked
- Immutable log (no UPDATE/DELETE policies)

### Data Protection

- CNP stored encrypted in customer_data
- KYC documents stored in S3 with encryption
- Sensitive fields not exposed via RLS policies

---

## Migration Instructions

### Running the Migration

```bash
# In Supabase Dashboard
# SQL Editor > New Query > Paste migration > Run

# Or via Supabase CLI
supabase db push
```

### Verification Queries

```sql
-- Check services
SELECT slug, name, base_price, is_active FROM services;

-- Check service options
SELECT s.name, so.name, so.price
FROM service_options so
JOIN services s ON s.id = so.service_id;

-- Test order number generation
INSERT INTO orders (user_id, service_id, total_price, customer_data)
VALUES (auth.uid(), (SELECT id FROM services LIMIT 1), 149.00, '{}');

SELECT order_number FROM orders ORDER BY created_at DESC LIMIT 1;

-- Check statistics function
SELECT * FROM get_order_statistics();
```

---

## Next Steps (Sprint 3)

1. **KYC Flow Implementation**
   - Upload CI (front + back)
   - Selfie capture
   - Signature canvas
   - S3 integration

2. **OCR Integration**
   - AWS Textract setup
   - CNP extraction
   - Data validation
   - Face matching (Rekognition)

3. **Order Flow UI**
   - 6-step wizard
   - Form validation
   - Price calculator
   - Preview/review step

---

## API Examples (Future Reference)

### Create Order

```typescript
const { data, error } = await supabase
  .from('orders')
  .insert({
    user_id: user.id,
    service_id: 'service_uuid',
    customer_data: {
      personal: { cnp: '1850101123456', ... },
      contact: { email: '...', phone: '...' }
    },
    selected_options: {
      urgenta: { quantity: 1, price: 100.00 }
    },
    total_price: 249.00
  })
  .select()
  .single();
```

### Update Order Status

```typescript
const { data, error } = await supabase
  .from('orders')
  .update({
    status: 'kyc_approved',
    kyc_verified_at: new Date().toISOString(),
    kyc_verified_by: admin_id
  })
  .eq('id', order_id)
  .select()
  .single();

// Status change automatically logged to order_history
```

### Query Orders with Filters

```typescript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    service:services(*),
    customer:profiles(*)
  `)
  .eq('status', 'processing')
  .order('created_at', { ascending: false })
  .range(0, 9);  // Pagination
```

---

## Checklist

- [x] Database schema designed
- [x] RLS policies configured
- [x] Indexes optimized
- [x] Triggers implemented
- [x] Helper functions created
- [x] MVP services seeded
- [x] Service options seeded
- [ ] Migration tested
- [ ] Documentation complete
- [ ] API examples added

---

**Migration File:** `/Users/raullutas/eghiseul.ro/supabase/migrations/002_services.sql`
**Created:** 2025-12-16
**Last Updated:** 2025-12-16
