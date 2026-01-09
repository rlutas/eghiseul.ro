# Database Migrations Guide

## Quick Reference

### Supabase Project Info
- **Project Ref:** `llbwmitdrppomeptqlue`
- **Region:** Frankfurt (eu-central-1)
- **Dashboard:** https://supabase.com/dashboard/project/llbwmitdrppomeptqlue

### Connection String
```
postgresql://postgres:[PASSWORD]@db.llbwmitdrppomeptqlue.supabase.co:5432/postgres
```

---

## Running Migrations

### Method 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/llbwmitdrppomeptqlue/sql/new
2. Copy the migration SQL from `supabase/migrations/XXX_name.sql`
3. Paste and click "Run"

### Method 2: Using psql (Local)

```bash
# Install psql if not available
# macOS: brew install postgresql
# Ubuntu: apt install postgresql-client

# Run migration
psql "postgresql://postgres:YOUR_PASSWORD@db.llbwmitdrppomeptqlue.supabase.co:5432/postgres" \
  -f supabase/migrations/015_user_data_persistence.sql
```

### Method 3: Using the Migration Script

```bash
# From project root
./scripts/run-migration.sh 015_user_data_persistence.sql
```

---

## Migration Files

| Migration | Description | Status |
|-----------|-------------|--------|
| 001_profiles.sql | User profiles table | Applied |
| 002_services.sql | Services and orders | Applied |
| 003_fix_rls_recursion.sql | RLS fix | Applied |
| 004_fix_service_prices.sql | Price columns | Applied |
| 005_seo_meta_tags.sql | SEO metadata | Applied |
| 006_audit_logs.sql | Audit logging | Applied |
| 007_pii_encryption.sql | PII encryption | Applied |
| 008_friendly_order_id.sql | Order ID format | Applied |
| 009_draft_auto_cleanup.sql | GDPR cleanup | Applied |
| 010_verification_config.sql | Modular verification | Applied |
| 011_cazier_judiciar_pf_pj.sql | Cazier services | Applied |
| 012_cazier_judiciar_separate_services.sql | Service separation | Applied |
| 013_fix_delivery_method_type.sql | Delivery fix | Applied |
| 014_cazier_judiciar_options.sql | Service options | Applied |
| 015_user_data_persistence.sql | User data persistence | Applied |

---

## Verifying Migrations

### Check if tables exist

```bash
curl -s "https://llbwmitdrppomeptqlue.supabase.co/rest/v1/user_saved_data?select=id&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

# Should return [] if table exists, or error if not
```

### Check table structure

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_saved_data';
```

---

## Rollback

If needed, run the rollback SQL:

```sql
-- Rollback 015_user_data_persistence
DROP TABLE IF EXISTS billing_profiles CASCADE;
DROP TABLE IF EXISTS kyc_verifications CASCADE;
DROP TABLE IF EXISTS user_saved_data CASCADE;
DROP FUNCTION IF EXISTS migrate_order_to_profile(UUID, UUID);
DROP FUNCTION IF EXISTS check_kyc_expiry(UUID, INTEGER);
ALTER TABLE profiles DROP COLUMN IF EXISTS birth_date;
ALTER TABLE profiles DROP COLUMN IF EXISTS birth_place;
```

---

## Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://llbwmitdrppomeptqlue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_PASSWORD=your_db_password
```

---

---

## Migration 015: User Data Persistence

**Applied:** 2026-01-06

### Tables Created:
- `user_saved_data` - Stores reusable personal data, addresses, contacts
- `kyc_verifications` - Stores verified KYC documents for reuse
- `billing_profiles` - Stores billing profiles (PF/PJ)

### Functions Created:
- `migrate_order_to_profile(order_id, user_id)` - Migrates guest order data to user profile
- `check_kyc_expiry(user_id, days)` - Returns expiring KYC documents

### API Endpoints:
- `GET /api/user/prefill-data` - Fetch saved data for logged users
- `POST /api/auth/register-from-order` - Create account from guest order

---

## Database Updates: 2026-01-08

### Orders Table Status Constraint

The `orders` table has a CHECK constraint limiting valid status values:

```sql
CHECK (status IN ('draft', 'pending', 'processing', 'completed', 'cancelled', 'rejected'))
```

**Important:** `pending_payment` is NOT a valid status. Use `pending` instead.

### Manual Updates Performed

Fixed orders stuck in 'draft' status after submission:

```bash
# Update order status from 'draft' to 'pending'
curl -s "https://llbwmitdrppomeptqlue.supabase.co/rest/v1/orders?friendly_order_id=eq.ORD-XXXXXXXX-XXXXX" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -X PATCH \
  -d '{"status": "pending"}'

# Fix order total_price if incorrect
curl -s "https://llbwmitdrppomeptqlue.supabase.co/rest/v1/orders?friendly_order_id=eq.ORD-XXXXXXXX-XXXXX" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -X PATCH \
  -d '{"total_price": 250.00}'
```

### New API Endpoint: Order Submit

**File:** `src/app/api/orders/[id]/submit/route.ts`

**Purpose:** Submits a draft order, changing status from 'draft' to 'pending'.

```bash
POST /api/orders/{order_id}/submit

# Request body (optional)
{
  "total_price": 250.00  # Updates total if provided
}

# Response
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "friendly_order_id": "ORD-20260108-XXXXX",
      "status": "pending",
      "total_price": 250.00
    }
  }
}
```

**Behavior:**
- Only allows submitting orders with status 'draft'
- Links order to authenticated user if not already linked
- Sets `submitted_at` timestamp

### Order Flow Updated

```
1. User fills form → Order created as 'draft'
2. User submits   → POST /api/orders/{id}/submit → status becomes 'pending'
3. Payment        → POST /api/orders/{id}/payment → creates Stripe intent
4. Success        → status becomes 'paid' (via Stripe webhook)
```

---

**Last Updated:** 2026-01-08
