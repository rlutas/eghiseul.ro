# How to Apply Migration 013: Fix delivery_method Type

**Migration File:** `supabase/migrations/013_fix_delivery_method_type.sql`
**Issue:** Draft orders fail with 500 error due to type mismatch
**Required:** Apply this migration ASAP to fix draft order saving

---

## Quick Start

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `eghiseul.ro`

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy Migration SQL**
   - Open: `supabase/migrations/013_fix_delivery_method_type.sql`
   - Copy entire file contents

4. **Paste & Execute**
   - Paste SQL into the editor
   - Click "Run" button
   - Wait for "Success" message

5. **Verify**
   - Run verification query:
   ```sql
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_name = 'orders'
     AND column_name IN ('delivery_method', 'selected_options');
   ```
   - Expected: `delivery_method` should be `jsonb`, `selected_options` default should be `'[]'::jsonb`

---

### Option 2: Supabase CLI (If Available)

```bash
# Check if Supabase CLI is available
which supabase

# If available, apply migration
npx supabase db push

# Or manually run the migration
npx supabase db execute < supabase/migrations/013_fix_delivery_method_type.sql
```

---

### Option 3: Direct SQL Connection

If you have direct PostgreSQL access:

```bash
# Using psql
psql "$DATABASE_URL" < supabase/migrations/013_fix_delivery_method_type.sql

# Or using a SQL client
# 1. Connect to your Supabase PostgreSQL instance
# 2. Copy & paste the migration SQL
# 3. Execute
```

---

## What This Migration Does

### 1. Fixes `delivery_method` Column Type
- **Before:** `VARCHAR(50)` with CHECK constraint
- **After:** `JSONB` (allows storing delivery method objects)

### 2. Fixes `selected_options` Default Value
- **Before:** Default `'{}'` (empty object)
- **After:** Default `'[]'` (empty array)

### 3. Preserves Existing Data
- Converts any existing VARCHAR values to JSONB format
- No data loss

---

## Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
-- Rollback: Change delivery_method back to VARCHAR
ALTER TABLE orders
ALTER COLUMN delivery_method TYPE VARCHAR(50) USING
  CASE
    WHEN delivery_method IS NULL THEN NULL
    ELSE (delivery_method->>'type')::VARCHAR(50)
  END;

-- Rollback: Add CHECK constraint back
ALTER TABLE orders
ADD CONSTRAINT orders_delivery_method_check
CHECK (delivery_method IN ('email', 'registered_mail', 'courier'));

-- Rollback: Change selected_options default back
ALTER TABLE orders
ALTER COLUMN selected_options SET DEFAULT '{}'::jsonb;
```

---

## Post-Migration Testing

After applying the migration, test draft order creation:

### Test 1: Create Draft Order

```bash
# Using the API
curl -X POST http://localhost:3000/api/orders/draft \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "YOUR_SERVICE_UUID",
    "customer_data": {"contact": {"email": "test@example.com"}},
    "selected_options": [],
    "delivery_method": {
      "type": "email",
      "name": "Email",
      "price": 0,
      "estimated_days": 0
    },
    "base_price": 100,
    "total_price": 100
  }'
```

### Test 2: Verify in Database

```sql
-- Check the latest draft order
SELECT
  id,
  friendly_order_id,
  status,
  delivery_method,
  selected_options,
  created_at
FROM orders
WHERE status = 'draft'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- `delivery_method` should be a JSON object: `{"type": "email", "name": "Email", ...}`
- `selected_options` should be an array: `[]` or `[{...}]`

---

## Troubleshooting

### Error: "column delivery_method cannot be cast automatically to type jsonb"

**Solution:** Run the migration SQL manually, which includes the proper USING clause for conversion.

### Error: "duplicate key value violates unique constraint"

**Solution:** This is unrelated to the migration. Check if you're trying to insert duplicate `friendly_order_id` values.

### Error: "permission denied for table orders"

**Solution:** Make sure you're using a database user with sufficient privileges (service_role key or postgres user).

---

## Next Steps After Migration

1. **Test the order wizard** in your local environment
2. **Monitor server logs** for any new errors
3. **Check Sentry/error tracking** for any issues in production
4. **Update TypeScript types** to reflect the new schema

---

## Questions?

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify the migration was applied: `SELECT * FROM supabase_migrations.schema_migrations;`
3. Review this document's troubleshooting section
4. Check Supabase Dashboard > Database > Tables > orders for column details
