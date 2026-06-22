# Security Audit: Admin Supabase Client

**Date:** 2026-01-08
**Auditor:** Claude Security Agent
**Status:** IN PROGRESS - Fixes Required

---

## Executive Summary

The admin Supabase client (`src/lib/supabase/admin.ts`) bypasses RLS (Row Level Security) to handle guest orders. While the architectural pattern is correct, **4 CRITICAL vulnerabilities** and **3 HIGH-priority improvements** were identified.

---

## Files Audited

| File | Purpose | Risk Level |
|------|---------|------------|
| `src/lib/supabase/admin.ts` | Admin client creation | LOW (well isolated) |
| `src/app/api/orders/[id]/submit/route.ts` | Order submission | MEDIUM |
| `src/app/api/orders/draft/route.ts` | Draft CRUD | HIGH |
| `src/app/api/auth/register-from-order/route.ts` | Guest conversion | CRITICAL |

---

## CRITICAL Vulnerabilities

### 1. IDOR in Draft GET (CRITICAL)

**Location:** `src/app/api/orders/draft/route.ts` lines 546-549

**Issue:** Guest orders without email can be accessed by anyone who guesses the `friendly_order_id`.

**Vulnerable Code:**
```typescript
const isOwner =
  (user && order.user_id === user.id) ||
  (email && customerData?.contact?.email === email) ||
  (!order.user_id && !customerData?.contact?.email);  // ANYONE can access!
```

**Attack Vector:**
```bash
# Attacker brute-forces order IDs
curl "https://eghiseul.ro/api/orders/draft?id=ORD-20260108-XXXXX"
```

**Fix Required:**
```typescript
const isOwner =
  (user && order.user_id === user.id) ||
  (email && customerData?.contact?.email === email);

// Remove the permissive third condition
if (!isOwner) {
  return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
}
```

**Status:** [x] FIXED (2026-01-08)

---

### 2. Email Bypass in Register (CRITICAL)

**Location:** `src/app/api/auth/register-from-order/route.ts` lines 119-127

**Issue:** Orders without email can be claimed by any email address.

**Vulnerable Code:**
```typescript
if (orderEmail && String(orderEmail).toLowerCase() !== email.toLowerCase()) {
  // Only validates IF orderEmail exists
}
// If orderEmail is null, ANY email can claim the order!
```

**Fix Required:**
```typescript
if (!orderEmail) {
  return NextResponse.json(
    { error: 'Invalid order', message: 'Comanda nu conține email valid' },
    { status: 400 }
  );
}
// Then validate email match
```

**Status:** [x] FIXED (2026-01-08)

---

### 3. Unlimited Draft Creation (HIGH)

**Location:** `src/app/api/orders/draft/route.ts` POST

**Issue:** No rate limiting allows attackers to spam database with millions of draft orders.

**Fix Required:** Add rate limiting by IP address using Upstash Redis or similar.

**Status:** [ ] Not Fixed

---

### 4. Missing Ownership in Draft PATCH (HIGH)

**Location:** `src/app/api/orders/draft/route.ts` lines 360-371

**Issue:** Guest orders (user_id = null) have no ownership verification.

**Fix Required:** Require email match for guest order updates.

**Status:** [x] FIXED (2026-01-08)

---

## Good Practices Observed

1. Service role key properly isolated (server-side only)
2. Never exposed to client code
3. Authorization checks for authenticated users
4. Status validation (only draft orders modifiable)
5. Generic error messages (no info leakage)

---

## When Admin Client is Appropriate

| Use Case | Appropriate? | Reason |
|----------|--------------|--------|
| Guest order creation | YES | Guests can't have RLS policies |
| Order submission | YES | Need to create profiles |
| Guest-to-customer conversion | YES | Links orders to new accounts |
| Reading user's own orders | NO | Use regular client with RLS |
| Admin operations | YES | Full database access needed |

---

## Recommended RLS Policies

```sql
-- Allow guest draft creation
CREATE POLICY "Anyone can create draft orders"
  ON orders FOR INSERT
  WITH CHECK (status = 'draft');

-- Allow users to view their orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their drafts
CREATE POLICY "Users can update own drafts"
  ON orders FOR UPDATE
  USING (status = 'draft' AND (auth.uid() = user_id OR user_id IS NULL))
  WITH CHECK (status = 'draft');
```

---

## Action Items (Priority Order)

1. [x] Create admin client with proper isolation
2. [ ] **CRITICAL:** Fix IDOR in draft GET
3. [ ] **CRITICAL:** Fix email bypass in register-from-order
4. [ ] **HIGH:** Add rate limiting to draft POST
5. [ ] **HIGH:** Add ownership verification in draft PATCH
6. [ ] **MEDIUM:** Add input sanitization
7. [ ] **MEDIUM:** Verify .env.local in .gitignore

---

## Post-Fix Verification

After fixes are applied, test:

```bash
# Test 1: IDOR protection
curl "/api/orders/draft?id=ORD-KNOWN-ID"
# Should return 403 without email

# Test 2: Email bypass protection
POST /api/auth/register-from-order
{ "orderId": "order-without-email", "email": "attacker@evil.com" }
# Should return 400

# Test 3: Rate limiting
for i in {1..100}; do curl -X POST /api/orders/draft; done
# Should start returning 429 after threshold

# Test 4: Ownership in PATCH
PATCH /api/orders/draft
{ "friendly_order_id": "ORD-GUEST-ORDER", "customer_data": {...} }
# Should require email match
```

---

**Last Updated:** 2026-01-08
