# Database Schema - Sprint 2: Services Core

**Migration:** `002_services.sql`
**Created:** 2025-12-16
**Status:** Ready for Implementation

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                            PROFILES                                  │
│  (from migration 001)                                                │
├─────────────────────────────────────────────────────────────────────┤
│  id (PK)                  UUID                                       │
│  first_name               VARCHAR(100)                               │
│  last_name                VARCHAR(100)                               │
│  cnp                      VARCHAR(13)                                │
│  email                    VARCHAR(255)                               │
│  role                     VARCHAR(50)  [customer, admin, partner]    │
│  kyc_verified             BOOLEAN                                    │
│  created_at               TIMESTAMPTZ                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N (user orders)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                             ORDERS                                   │
├─────────────────────────────────────────────────────────────────────┤
│  id (PK)                  UUID                                       │
│  order_number (UK)        VARCHAR(50)      [YYYY-NNNNNN]             │
│  user_id (FK)             UUID → profiles.id                         │
│  service_id (FK)          UUID → services.id                         │
│  partner_id (FK)          UUID → profiles.id                         │
│  status                   VARCHAR(50)      [draft, pending, ...]     │
│  customer_data            JSONB            [personal, contact, ...]  │
│  selected_options         JSONB            [urgenta, traducere, ...] │
│  delivery_method          VARCHAR(50)      [email, mail, courier]    │
│  delivery_address         JSONB                                      │
│  base_price               DECIMAL(10,2)                              │
│  options_price            DECIMAL(10,2)                              │
│  delivery_price           DECIMAL(10,2)                              │
│  total_price              DECIMAL(10,2)                              │
│  payment_status           VARCHAR(50)      [unpaid, paid, ...]      │
│  stripe_payment_intent_id VARCHAR(255)                               │
│  kyc_documents            JSONB            [CI, selfie, signature]   │
│  contract_url             TEXT                                       │
│  final_document_url       TEXT                                       │
│  assigned_to (FK)         UUID → profiles.id                         │
│  created_at               TIMESTAMPTZ                                │
│  updated_at               TIMESTAMPTZ                                │
└─────────────────────────────────────────────────────────────────────┘
         │                               ▲
         │                               │ N:1 (service reference)
         │                               │
         │ 1:N (order history)           │
         ▼                               │
┌────────────────────────────┐  ┌───────────────────────────────────┐
│    ORDER_HISTORY           │  │         SERVICES                   │
├────────────────────────────┤  ├───────────────────────────────────┤
│  id (PK)        UUID       │  │  id (PK)         UUID              │
│  order_id (FK)  UUID       │  │  slug (UK)       VARCHAR(100)      │
│  changed_by     UUID       │  │  code (UK)       VARCHAR(20)       │
│  event_type     VARCHAR    │  │  name            VARCHAR(255)      │
│  old_value      JSONB      │  │  category        VARCHAR(100)      │
│  new_value      JSONB      │  │  base_price      DECIMAL(10,2)     │
│  notes          TEXT       │  │  is_active       BOOLEAN           │
│  ip_address     INET       │  │  requires_kyc    BOOLEAN           │
│  user_agent     TEXT       │  │  estimated_days  INTEGER           │
│  created_at     TIMESTAMPTZ│  │  urgent_days     INTEGER           │
└────────────────────────────┘  │  config          JSONB             │
                                │  created_at      TIMESTAMPTZ       │
                                └───────────────────────────────────┘
                                         │
                                         │ 1:N (service options)
                                         ▼
                                ┌───────────────────────────────────┐
                                │      SERVICE_OPTIONS               │
                                ├───────────────────────────────────┤
                                │  id (PK)         UUID              │
                                │  service_id (FK) UUID              │
                                │  code            VARCHAR(50)       │
                                │  name            VARCHAR(255)      │
                                │  price           DECIMAL(10,2)     │
                                │  price_type      VARCHAR(20)       │
                                │  is_active       BOOLEAN           │
                                │  max_quantity    INTEGER           │
                                │  config          JSONB             │
                                │  display_order   INTEGER           │
                                │  created_at      TIMESTAMPTZ       │
                                │  UNIQUE(service_id, code)          │
                                └───────────────────────────────────┘
```

---

## Table Relationships

### Primary Relationships

| Parent Table | Child Table | Relationship | Cascade |
|-------------|-------------|--------------|---------|
| `profiles` | `orders` | 1:N | SET NULL |
| `services` | `orders` | 1:N | RESTRICT |
| `services` | `service_options` | 1:N | CASCADE |
| `orders` | `order_history` | 1:N | CASCADE |

### Reference Relationships

| Table | References | Purpose |
|-------|-----------|---------|
| `orders.assigned_to` | `profiles.id` | Admin assignment |
| `orders.partner_id` | `profiles.id` | Partner orders (Phase 2) |
| `orders.kyc_verified_by` | `profiles.id` | KYC approval tracking |
| `order_history.changed_by` | `profiles.id` | Audit trail |

---

## JSONB Column Structures

### services.config

```json
{
  "required_fields": ["cnp", "first_name", "last_name"],
  "optional_fields": ["company_name", "cui"],
  "delivery_methods": ["email", "registered_mail", "courier"],
  "validation_rules": {
    "cnp": {
      "type": "regex",
      "pattern": "^[1-9]\\d{12}$",
      "message": "CNP invalid"
    }
  },
  "document_templates": {
    "contract": "contracts/service-contract.pdf"
  },
  "kyc_requirements": {
    "identity_card": true,
    "selfie": true,
    "signature": true
  },
  "processing_steps": [
    "Step 1",
    "Step 2"
  ]
}
```

### service_options.config

```json
{
  "affects_delivery_time": true,
  "delivery_days_reduction": 3,
  "additional_fields": ["target_language"],
  "dependencies": ["option_code"],
  "conflicts_with": ["other_option_code"]
}
```

### orders.customer_data

```json
{
  "personal": {
    "cnp": "1850101123456",
    "first_name": "Ion",
    "last_name": "Popescu",
    "birth_date": "1985-01-01",
    "address": "Full address"
  },
  "contact": {
    "email": "email@example.com",
    "phone": "+40712345678",
    "preferred_contact": "email"
  },
  "purpose": "Document purpose"
}
```

### orders.selected_options

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
  }
}
```

### orders.kyc_documents

```json
{
  "identity_card_front": "s3://bucket/path/ci_front.jpg",
  "identity_card_back": "s3://bucket/path/ci_back.jpg",
  "selfie": "s3://bucket/path/selfie.jpg",
  "signature": "data:image/png;base64,...",
  "ocr_data": {
    "cnp": "1850101123456",
    "name": "ION POPESCU",
    "confidence": 0.98
  },
  "face_match": {
    "confidence": 0.95,
    "matched": true
  }
}
```

---

## Index Strategy

### Standard B-tree Indexes

```sql
-- Services
idx_services_slug            ON services(slug)
idx_services_code            ON services(code)
idx_services_category        ON services(category)

-- Service Options
idx_service_options_service_id  ON service_options(service_id)
idx_service_options_code        ON service_options(code)

-- Orders
idx_orders_user_id           ON orders(user_id)
idx_orders_service_id        ON orders(service_id)
idx_orders_partner_id        ON orders(partner_id)
idx_orders_status            ON orders(status)
idx_orders_payment_status    ON orders(payment_status)
idx_orders_created_at        ON orders(created_at DESC)
idx_orders_assigned_to       ON orders(assigned_to)

-- Order History
idx_order_history_order_id   ON order_history(order_id)
idx_order_history_created_at ON order_history(created_at DESC)
idx_order_history_event_type ON order_history(event_type)
```

### Partial Indexes (Optimized)

```sql
-- Only active services (most queries)
idx_services_active ON services(is_active) WHERE is_active = TRUE

-- Only featured services (homepage)
idx_services_featured ON services(is_featured) WHERE is_featured = TRUE

-- Only active options (most queries)
idx_service_options_active ON service_options(is_active) WHERE is_active = TRUE

-- Submitted orders only (exclude drafts)
idx_orders_submitted_at ON orders(submitted_at DESC) WHERE submitted_at IS NOT NULL

-- Orders with tracking
idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL
```

### GIN Indexes (JSONB)

```sql
-- Fast JSONB queries
idx_services_config         ON services USING GIN (config)
idx_orders_customer_data    ON orders USING GIN (customer_data)
idx_orders_selected_options ON orders USING GIN (selected_options)
idx_orders_kyc_documents    ON orders USING GIN (kyc_documents)
```

**Example JSONB Query:**
```sql
-- Find orders by CNP (uses GIN index)
SELECT * FROM orders
WHERE customer_data @> '{"personal": {"cnp": "1850101123456"}}';

-- Find services requiring selfie (uses GIN index)
SELECT * FROM services
WHERE config @> '{"kyc_requirements": {"selfie": true}}';
```

---

## Triggers and Automation

### Automatic Triggers

| Trigger | Function | Purpose |
|---------|----------|---------|
| `orders_generate_number` | `generate_order_number()` | Auto-generate order numbers (YYYY-NNNNNN) |
| `orders_updated_at` | `update_updated_at()` | Update timestamp on changes |
| `orders_set_submitted_at` | `set_order_submitted_at()` | Set submission timestamp |
| `orders_calculate_estimated_completion` | `calculate_estimated_completion()` | Calculate completion date |
| `orders_log_status_change` | `log_order_status_change()` | Log all status changes |
| `profiles_updated_at` | `update_updated_at()` | Update profile timestamp |
| `service_options_updated_at` | `update_updated_at()` | Update option timestamp |

### Trigger Flow Example

**When creating an order:**
```
1. INSERT INTO orders (...) VALUES (...)
2. BEFORE INSERT triggers:
   → generate_order_number() → Sets order_number
   → calculate_estimated_completion() → Sets estimated_date
3. Record inserted
4. AFTER INSERT triggers: (none currently)
```

**When updating order status:**
```
1. UPDATE orders SET status = 'kyc_approved' WHERE id = '...'
2. BEFORE UPDATE triggers:
   → update_updated_at() → Sets updated_at
   → set_order_submitted_at() → Sets submitted_at (if applicable)
3. Record updated
4. AFTER UPDATE triggers:
   → log_order_status_change() → Inserts into order_history
```

---

## Security: Row Level Security (RLS)

### RLS Policy Matrix

| Table | Role | SELECT | INSERT | UPDATE | DELETE |
|-------|------|--------|--------|--------|--------|
| **services** | Public | Active only | ✗ | ✗ | ✗ |
| **services** | Admin | All | ✓ | ✓ | ✓ |
| **service_options** | Public | Active only | ✗ | ✗ | ✗ |
| **service_options** | Admin | All | ✓ | ✓ | ✓ |
| **orders** | User | Own only | Own only | Own drafts | ✗ |
| **orders** | Admin | All | ✓ | All | ✗ |
| **orders** | Partner | Own partner orders | ✓ | Own partner orders | ✗ |
| **order_history** | User | Own order history | ✗ | ✗ | ✗ |
| **order_history** | Admin | All | ✓ | ✗ | ✗ |
| **order_history** | System | - | ✓ | ✗ | ✗ |

### Policy Examples

**User Access to Orders:**
```sql
-- Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update draft/kyc_pending orders
CREATE POLICY "Users can update own draft orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('draft', 'kyc_pending'))
  WITH CHECK (auth.uid() = user_id AND status IN ('draft', 'kyc_pending'));
```

**Admin Access:**
```sql
-- Admins have full access (checked via role in profiles)
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

---

## Data Types and Constraints

### Enumerated Values (CHECK Constraints)

**Service Categories:**
```sql
category VARCHAR(100) CHECK (category IN (
  'fiscale', 'juridice', 'imobiliare',
  'comerciale', 'auto', 'personale'
))
```

**Order Status:**
```sql
status VARCHAR(50) CHECK (status IN (
  'draft', 'pending', 'processing',
  'kyc_pending', 'kyc_approved', 'kyc_rejected',
  'in_progress', 'document_ready', 'shipped',
  'delivered', 'completed', 'cancelled', 'refunded'
))
```

**Payment Status:**
```sql
payment_status VARCHAR(50) CHECK (payment_status IN (
  'unpaid', 'pending', 'paid', 'failed',
  'refunded', 'partially_refunded'
))
```

**Delivery Methods:**
```sql
delivery_method VARCHAR(50) CHECK (delivery_method IN (
  'email', 'registered_mail', 'courier'
))
```

**Price Type:**
```sql
price_type VARCHAR(20) CHECK (price_type IN (
  'fixed', 'percentage'
))
```

### Validation Constraints

```sql
-- Prices must be positive
base_price DECIMAL(10,2) CHECK (base_price >= 0)

-- Order numbers are unique
order_number VARCHAR(50) UNIQUE

-- Service codes are unique
code VARCHAR(20) UNIQUE

-- One option code per service
UNIQUE(service_id, code)
```

---

## Helper Functions

### 1. calculate_order_total(order_id UUID)

**Purpose:** Calculate total order price from components

**Returns:** DECIMAL

**Usage:**
```sql
SELECT calculate_order_total('order-uuid-here');
```

**Logic:**
- Sum base_price (from service)
- Sum options prices (from selected_options JSONB)
- Add delivery_price
- Subtract discount_amount

---

### 2. get_order_statistics(start_date, end_date)

**Purpose:** Get order statistics for date range

**Returns:** TABLE with metrics

**Usage:**
```sql
SELECT * FROM get_order_statistics(
  '2025-01-01'::DATE,
  '2025-12-31'::DATE
);
```

**Returns:**
- `total_orders` - Total order count
- `completed_orders` - Completed count
- `pending_orders` - Pending count
- `total_revenue` - Sum of paid orders
- `avg_order_value` - Average order value
- `completion_rate` - Percentage completed

---

## Performance Benchmarks

### Expected Query Performance

| Query Type | Expected Time | Index Used |
|-----------|---------------|------------|
| Get service by slug | < 1ms | idx_services_slug |
| Get user's orders | < 5ms | idx_orders_user_id |
| Filter by status | < 10ms | idx_orders_status |
| JSONB customer search | < 20ms | idx_orders_customer_data (GIN) |
| Order history lookup | < 5ms | idx_order_history_order_id |
| Statistics calculation | < 100ms | Multiple indexes |

### Optimization Tips

1. **Always use indexes** - Filter by indexed columns first
2. **Limit result sets** - Use LIMIT/OFFSET for pagination
3. **Avoid SELECT *** - Select only needed columns
4. **Use JSONB operators** - `@>`, `?`, `?&` for JSONB queries
5. **Materialized views** - For complex aggregations

---

## Scaling Considerations

### Current Capacity

- **Services:** Designed for 50+ services
- **Orders:** Scalable to 100K+ orders/year
- **Options:** 5-20 options per service
- **History:** Unlimited audit trail

### Future Optimizations

**When reaching 100K+ orders:**
1. Partition orders table by year
2. Archive old order_history to cold storage
3. Add read replicas for reporting
4. Consider caching layer (Redis)

**When reaching 10+ partners:**
1. Partition by partner_id
2. Add partner-specific indexes
3. Implement multi-tenant isolation

---

## Migration Checklist

- [x] Tables created with proper structure
- [x] Relationships and foreign keys defined
- [x] Indexes created (B-tree, partial, GIN)
- [x] RLS policies configured
- [x] Triggers implemented
- [x] Helper functions added
- [x] Initial data seeded (3 MVP services)
- [x] Service options seeded
- [ ] Migration tested in development
- [ ] Data validation tested
- [ ] Performance tested with sample data
- [ ] RLS policies tested for all roles
- [ ] Rollback plan documented

---

## Rollback Plan

If migration fails or needs rollback:

```sql
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS order_history CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS service_options CASCADE;
DROP TABLE IF EXISTS services CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_order_total(UUID);
DROP FUNCTION IF EXISTS get_order_statistics(DATE, DATE);
DROP FUNCTION IF EXISTS generate_order_number();
DROP FUNCTION IF EXISTS set_order_submitted_at();
DROP FUNCTION IF EXISTS calculate_estimated_completion();
DROP FUNCTION IF EXISTS log_order_status_change();
```

---

## Files Created

1. `/Users/raullutas/eghiseul.ro/supabase/migrations/002_services.sql` - Migration file
2. `/Users/raullutas/eghiseul.ro/docs/sprints/sprint-2-services.md` - Sprint documentation
3. `/Users/raullutas/eghiseul.ro/docs/technical/database-schema-sprint2.md` - This file

---

## Sprint 3-4 Schema Updates (Addendum)

> **Added:** 2026-01-07
> **Migrations:** 006-015

### New Tables

#### 1. audit_logs (Migration 006)

Security audit logging for PII access.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  metadata JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT TRUE
);
```

**Indexes:** user_id, timestamp DESC
**RLS:** Admin-only access

#### 2. user_saved_data (Migration 015)

Store user's saved personal/company data for prefill.

```sql
CREATE TABLE user_saved_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL, -- 'personal', 'company', 'address'
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data_type)
);
```

#### 3. kyc_verifications (Migration 015)

Track KYC verification status per user.

```sql
CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, valid, expired, rejected
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- 180 days after verification
  document_hashes JSONB, -- hashes of uploaded docs (not PII)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. billing_profiles (Migration 015)

Store billing information for PF/PJ invoicing.

```sql
CREATE TABLE billing_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_type VARCHAR(10) NOT NULL, -- 'pf' or 'pj'
  name VARCHAR(255) NOT NULL,
  -- PF fields
  cnp VARCHAR(13),
  -- PJ fields
  cui VARCHAR(20),
  reg_com VARCHAR(50),
  -- Common fields
  address TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Modified Tables

#### orders (Multiple migrations)

New columns added:

| Column | Migration | Type | Purpose |
|--------|-----------|------|---------|
| `friendly_order_id` | 008 | VARCHAR(20) | Human-readable ID: ORD-YYYYMMDD-XXXXX |
| `session_id` | 009 | UUID | For guest order tracking |
| `anonymized_at` | 009 | TIMESTAMPTZ | GDPR cleanup tracking |

#### services (Migration 010)

New column:

| Column | Type | Purpose |
|--------|------|---------|
| `verification_config` | JSONB | Module configuration for modular wizard |

Example `verification_config`:

```json
{
  "modules": ["client-type", "personal-data", "kyc-documents", "signature"],
  "kyc_required": true,
  "document_types": ["ci_front", "ci_back", "selfie"],
  "personal_data_fields": ["cnp", "full_name", "address"]
}
```

#### profiles (Migration 015)

New columns:

| Column | Type | Purpose |
|--------|------|---------|
| `birth_date` | DATE | For prefill |
| `birth_place` | VARCHAR(255) | For prefill |

### Encrypted Columns (Migration 007)

PII encryption using pgcrypto AES-256:

| Table | Encrypted Column | Original Column |
|-------|------------------|-----------------|
| orders | `encrypted_cnp` | customer_data.personal.cnp |
| orders | `encrypted_ci_series` | customer_data.personal.ci_series |
| orders | `encrypted_ci_number` | customer_data.personal.ci_number |

**Functions:**
- `encrypt_pii(plaintext TEXT)` → BYTEA
- `decrypt_pii(ciphertext BYTEA)` → TEXT
- `mask_cnp(cnp TEXT)` → TEXT (returns: 1***********3456)

### GDPR Cleanup (Migration 009)

Automated cleanup of draft orders older than 7 days:

```sql
CREATE OR REPLACE FUNCTION anonymize_stale_drafts()
  -- Anonymizes customer_data in drafts older than 7 days
  -- Triggered by cron or /api/admin/cleanup endpoint
```

### Service Options (Migration 014)

New service options for Cazier Judiciar:

| Code | Name | Price |
|------|------|-------|
| URGENTA | Procesare Urgentă | 99.00 RON |
| TRADUCERE_EN | Traducere Engleză | 150.00 RON |
| APOSTILA | Apostilă Haga | 238.00 RON |

---

**Status:** ✅ Deployed to Production
**Last Migration:** 015_user_data_persistence.sql
**Documentation Updated:** 2026-01-07
**Owner:** Development Team
