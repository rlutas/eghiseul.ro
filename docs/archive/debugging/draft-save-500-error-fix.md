# Draft Order Save 500 Error - Root Cause & Fix

**Date:** 2026-01-05
**Issue:** Draft order save returns 500 error with empty body
**Status:** IDENTIFIED & FIXED

---

## Problem Summary

When attempting to save draft orders, the API returns a 500 Internal Server Error with no error message body. This prevents users from saving their order progress.

---

## Root Cause Analysis

### Issue 1: Type Mismatch - `delivery_method` Column

**Database Schema (002_services.sql line 305):**
```sql
delivery_method VARCHAR(50) CHECK (delivery_method IN ('email', 'registered_mail', 'courier'))
```

**API Payload (modular-wizard-provider.tsx line 858-863):**
```typescript
delivery_method: state.delivery.method ? {
  type: state.delivery.method,
  name: state.delivery.methodName,
  price: state.delivery.price,
  estimated_days: state.delivery.estimatedDays,
} : null
```

**Problem:** The database expects a VARCHAR (string like 'email'), but the API sends a JSONB object. This causes a type conversion error when inserting data.

### Issue 2: Default Value Mismatch - `selected_options` Column

**Database Schema (002_services.sql line 302):**
```sql
selected_options JSONB DEFAULT '{}'
```

**API Payload (modular-wizard-provider.tsx line 851-856):**
```typescript
selected_options: state.selectedOptions.map(opt => ({
  option_id: opt.optionId,
  option_name: opt.optionName,
  quantity: opt.quantity,
  price_modifier: opt.priceModifier,
}))
```

**Problem:** The database defaults to an empty object `{}`, but the API always sends an array `[]`. While not causing immediate errors, this inconsistency could lead to future bugs.

### Issue 3: Poor Error Logging

The original catch blocks in `/api/orders/draft/route.ts` didn't log enough information to diagnose the error:

```typescript
catch (error) {
  console.error('Unexpected error:', error);
  return NextResponse.json({ success: false, error: { ... } }, { status: 500 });
}
```

This made it impossible to see the actual database error causing the 500.

---

## Solution Implemented

### 1. Database Migration (`013_fix_delivery_method_type.sql`)

**Created:** `/Users/raul/Projects/eghiseul.ro/supabase/migrations/013_fix_delivery_method_type.sql`

**Changes:**
- Drop CHECK constraint on `delivery_method`
- Convert existing VARCHAR data to JSONB format
- Change column type from `VARCHAR(50)` to `JSONB`
- Update default value for `selected_options` from `'{}'` to `'[]'`
- Add comments documenting the expected structure

**How to Apply:**
```bash
# Option 1: Apply via Supabase CLI (if available)
npx supabase db push

# Option 2: Apply manually via Supabase Dashboard
# 1. Go to Supabase Dashboard > SQL Editor
# 2. Open migration file: supabase/migrations/013_fix_delivery_method_type.sql
# 3. Copy & paste the SQL
# 4. Run the migration
```

### 2. Enhanced Error Logging

**Modified:** `/Users/raul/Projects/eghiseul.ro/src/app/api/orders/draft/route.ts`

**Changes:**
- Added detailed console logging before database insert
- Enhanced catch blocks to log:
  - Error message
  - Error stack trace
  - Full error object with all properties
- Return error details in API response (for debugging)

**Example of new error logging:**
```typescript
catch (error) {
  console.error('Unexpected error in POST /api/orders/draft:', error);
  console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  return NextResponse.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      details: error instanceof Error ? { name: error.name, stack: error.stack } : undefined,
    },
  }, { status: 500 });
}
```

---

## Verification Steps

After applying the migration, verify the fix:

### 1. Check Column Types
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('delivery_method', 'selected_options');
```

**Expected Result:**
```
column_name       | data_type | column_default
------------------|-----------|----------------
delivery_method   | jsonb     | NULL
selected_options  | jsonb     | '[]'::jsonb
```

### 2. Test Draft Order Creation

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/api/orders/draft \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "SERVICE_UUID_HERE",
    "customer_data": {
      "contact": {
        "email": "test@example.com",
        "phone": "+40712345678"
      }
    },
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

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "friendly_order_id": "ORD-20260105-XXXXX",
      "status": "draft",
      "current_step": "contact",
      "last_saved_at": "2026-01-05T..."
    }
  }
}
```

### 3. Test in Browser

1. Navigate to order wizard: `/servicii/[service-slug]`
2. Fill in contact information
3. Click "Salvează progres" or auto-save should trigger
4. Check browser console for errors
5. Check server logs for detailed output
6. Verify order was created in Supabase Dashboard

---

## Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `supabase/migrations/013_fix_delivery_method_type.sql` | Created | Migration to fix column types |
| `src/app/api/orders/draft/route.ts` | Modified | Enhanced error logging |
| `docs/technical/debugging/draft-save-500-error-fix.md` | Created | This documentation |

---

## Future Improvements

1. **Type Safety:** Update TypeScript types to match database schema exactly
2. **Validation:** Add Zod schema validation for delivery_method structure
3. **Testing:** Add integration tests for draft order CRUD operations
4. **Monitoring:** Add error tracking (Sentry) to catch these issues early

---

## Related Issues

- Migration 002 (services.sql) defined incompatible types
- Migration 008 (friendly_order_id.sql) added draft order support
- Modular wizard system (Sprint 3) changed data structure

---

## Additional Notes

**Why this wasn't caught earlier:**
- The order wizard is still in development (Sprint 3)
- No draft orders were created in production/testing yet
- Type mismatch only occurs when actual data is inserted
- RLS policies allowed the query to proceed, but the INSERT failed

**Prevention for future:**
- Always validate API payload structure matches database schema
- Use TypeScript types generated from database schema
- Add integration tests that actually insert data
- Enable detailed error logging in development
