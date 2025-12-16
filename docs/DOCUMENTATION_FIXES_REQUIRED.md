# Critical Documentation Fixes Required

**Priority:** HIGH
**Date:** 2025-12-16
**Related:** DOCUMENTATION_AUDIT_REPORT.md

---

## Critical Issues (Fix Within 48 Hours)

### 1. API Endpoint Path Errors

**File:** `/docs/technical/api/services-api.md`

#### Issue #1: Order Status Update Endpoint

**Documented (WRONG):**
```
PATCH /api/orders/[id]/status
```

**Actual Implementation:**
```
PATCH /api/orders/[id]
```

**Fix:** Update lines 529-644 in services-api.md

---

#### Issue #2: Payment Intent Endpoint

**Documented (WRONG):**
```
POST /api/payments/create-intent
```

**Actual Implementation:**
```
POST /api/orders/[id]/payment
```

**Fix:** Update lines 647-736 in services-api.md

---

### 2. Response Schema Field Names

**File:** `/docs/technical/api/services-api.md`

#### Incorrect Field Names Throughout API Docs

| Documented | Actual | Endpoints Affected |
|------------|--------|-------------------|
| `personalInfo` | `customerData` | POST /api/orders, GET /api/orders/[id] |
| `selectedOptions` | `options` | POST /api/orders, GET /api/orders/[id] |
| `serviceThumbnail` | Not returned | GET /api/orders |
| `popularity` | Not returned | GET /api/services |
| `processingTime` | `estimatedDays`, `urgentDays`, `urgentAvailable` | GET /api/services |

**Fix Required:**
- Search and replace all instances of `personalInfo` with `customerData`
- Update POST /api/orders request/response examples (lines 216-294)
- Update GET /api/orders/[id] response (lines 422-494)

---

### 3. Order Status Values Mismatch

**Documented:**
```
'pending' | 'processing' | 'completed' | 'cancelled'
```

**Actual Implementation:**
```typescript
'pending' | 'processing' | 'document_ready' | 'delivered' | 'completed' | 'rejected'
```

**Files to Update:**
- `/docs/technical/api/services-api.md` (lines 356, 551-559)
- `/docs/sprints/sprint-2-services.md` (verify consistency)

---

### 4. Database Column Name Discrepancy

**File:** `/docs/technical/database-schema-sprint2.md`

**Documented:**
```sql
service_options (
  price DECIMAL(10,2),
  price_type VARCHAR(20)
)
```

**Actual Migration:**
```sql
service_options (
  price_modifier DECIMAL(10,2),
  option_type VARCHAR(20)
)
```

**Fix:** Update lines 145-175 in database-schema-sprint2.md

---

### 5. Sprint 1 Status Outdated

**File:** `/docs/sprints/sprint-1-auth.md`

**Current Status Indicators:**
```
- [ ] Configurare Supabase Auth
- [x] Auth pages (login, register, forgot)  // Wrong symbol
```

**Should Be:**
```
- [x] Configurare Supabase Auth (COMPLETE)
- [x] Auth pages (login, register, forgot) (COMPLETE)
- [x] Protected routes middleware (COMPLETE)
```

**Files Actually Exist:**
- `/src/app/(auth)/login/page.tsx` ✅
- `/src/app/(auth)/register/page.tsx` ✅
- `/src/app/(auth)/forgot-password/page.tsx` ✅
- `/src/middleware.ts` ✅
- `/src/lib/supabase/client.ts` ✅
- `/src/lib/supabase/server.ts` ✅

**Fix:** Update all checkboxes to checked (lines 12-17)

---

## Quick Fix Checklist

Use this checklist to track fixes:

### API Documentation Fixes
- [ ] Fix PATCH /api/orders/[id]/status → /api/orders/[id]
- [ ] Fix POST /api/payments/create-intent → /api/orders/[id]/payment
- [ ] Replace all `personalInfo` with `customerData`
- [ ] Replace all `selectedOptions` with `options`
- [ ] Update order status enum to include all 6 statuses
- [ ] Remove `popularity` and `thumbnail` from GET /api/services response
- [ ] Update `processingTime` to `estimatedDays`, `urgentDays`, `urgentAvailable`

### Database Documentation Fixes
- [ ] Update service_options column names: `price` → `price_modifier`
- [ ] Update service_options column names: verify `option_type` usage

### Sprint Documentation Fixes
- [ ] Mark Sprint 1 auth tasks as complete
- [ ] Update progress log with actual completion dates
- [ ] Verify all file paths in "Files Created" section

---

## Testing After Fixes

After making these changes, verify:

1. **API Documentation Accuracy:**
   ```bash
   # Test each endpoint with curl
   curl http://localhost:3000/api/services
   curl http://localhost:3000/api/services/cazier-fiscal
   ```

2. **Database Schema Match:**
   ```sql
   -- Verify column names
   \d service_options
   \d orders
   ```

3. **File Existence:**
   ```bash
   # Check all documented files exist
   ls -la src/app/(auth)/login/
   ls -la src/middleware.ts
   ```

---

## Impact Analysis

### High Impact Issues
- ❌ **API endpoints with wrong paths:** Developers will get 404 errors following docs
- ❌ **Wrong field names:** Frontend integration will fail
- ⚠️ **Missing status values:** Status transitions will be incomplete

### Medium Impact Issues
- ⚠️ **Database column name mismatch:** Confusion when querying database
- ⚠️ **Outdated Sprint 1 status:** Unclear what's actually complete

### Low Impact Issues
- ℹ️ **Missing fields in response:** Extra fields documented but not returned

---

## Recommended Workflow

1. **Make fixes in this order:**
   - Fix API endpoint paths (highest impact)
   - Fix API field names (high impact)
   - Update order statuses (medium impact)
   - Fix database column names (medium impact)
   - Update Sprint 1 status (low impact)

2. **Verify each fix:**
   - Read the actual code
   - Test with curl/Postman
   - Update documentation
   - Mark checkbox above

3. **Create PR with documentation fixes**
   - Group related fixes together
   - Reference this document
   - Request review from developer who wrote the code

---

## Files to Update

### Must Update (Critical)
1. `/docs/technical/api/services-api.md` - Multiple endpoint and schema fixes
2. `/docs/technical/database-schema-sprint2.md` - Column name fixes
3. `/docs/sprints/sprint-1-auth.md` - Status updates

### Should Review (Important)
4. `/docs/sprints/sprint-2-services.md` - Verify consistency with actual implementation
5. `/DEVELOPMENT_MASTER_PLAN.md` - Update Sprint 1/2 completion status
6. `/docs/technical/database-quick-reference.md` - Verify column names in examples

---

## Questions to Answer

Before making fixes, clarify:

1. ✅ Are the statuses `document_ready`, `delivered`, `rejected` final?
2. ✅ Is the endpoint really `/api/orders/[id]` or should it be `/api/orders/[id]/status`?
3. ✅ Should we standardize on `customerData` or `personalInfo`? (Code uses `customer_data`)
4. ❓ Is `cancelled` status planned but not implemented yet?
5. ❓ Are `popularity` and `thumbnail` fields planned for services table?

---

**Created:** 2025-12-16
**Status:** Ready for implementation
**Estimated Time:** 2-3 hours for all fixes
