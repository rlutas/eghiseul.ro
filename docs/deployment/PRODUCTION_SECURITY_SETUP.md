# Production Security Setup Guide

**Document Version:** 1.0
**Last Updated:** 2025-12-17
**Status:** REQUIRED BEFORE PRODUCTION LAUNCH

---

## Overview

This document describes all security configurations required for production deployment of eGhiseul.ro. Follow ALL steps in order.

---

## 1. Environment Variables

### Required Variables

Add these to your production environment (Vercel, etc.):

```bash
# PII Encryption Key - REQUIRED
# Must be at least 32 characters, use a secure random string
# Generate with: openssl rand -base64 32
PII_ENCRYPTION_KEY=your-secure-32-character-key-here

# Supabase (should already be set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google AI (for OCR)
GOOGLE_AI_API_KEY=your-google-ai-key
```

### How to Generate a Secure Key

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**IMPORTANT:**
- Store this key securely (password manager, Vercel encrypted env vars)
- NEVER commit this key to git
- Backup this key - if lost, encrypted data CANNOT be recovered

---

## 2. Supabase Database Configuration

### Step 2.1: Set Database Session Variable

In Supabase Dashboard → SQL Editor, run:

```sql
-- Set the encryption key for the database
-- This enables the auto-encryption trigger
ALTER DATABASE postgres SET "app.pii_encryption_key" = 'YOUR-SAME-KEY-FROM-ENV';

-- Verify it's set
SHOW "app.pii_encryption_key";
```

**Note:** Use the SAME key as `PII_ENCRYPTION_KEY` in your environment variables.

### Step 2.2: Migrate Existing Data (if any)

If you have existing orders with unencrypted PII:

```sql
-- Check how many orders need migration
SELECT COUNT(*)
FROM orders
WHERE pii_encrypted_at IS NULL
AND customer_data->'personal' IS NOT NULL;

-- Run the migration (replace with your actual key)
SELECT * FROM migrate_pii_to_encrypted('YOUR-ENCRYPTION-KEY');

-- Verify migration
SELECT
  id,
  customer_data->'personal'->>'cnp_masked' as cnp_masked,
  encrypted_cnp IS NOT NULL as is_encrypted,
  pii_encrypted_at
FROM orders
LIMIT 10;
```

### Step 2.3: Verify Encryption is Working

```sql
-- Create a test order to verify auto-encryption
INSERT INTO orders (
  order_number,
  service_id,
  base_price,
  total_price,
  customer_data
) VALUES (
  'TEST-' || to_char(NOW(), 'YYYYMMDD-HH24MISS'),
  (SELECT id FROM services LIMIT 1),
  100,
  100,
  '{"personal": {"cnp": "1234567890123", "ci_series": "XV", "ci_number": "123456", "first_name": "Test", "last_name": "User"}}'::jsonb
)
RETURNING
  id,
  customer_data->'personal' as personal_data,
  encrypted_cnp IS NOT NULL as cnp_encrypted;

-- Should show:
-- - personal_data with cnp_masked (not raw cnp)
-- - cnp_encrypted = true

-- Clean up test order
DELETE FROM orders WHERE order_number LIKE 'TEST-%';
```

---

## 3. Vercel Configuration

### Step 3.1: Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `PII_ENCRYPTION_KEY` | (your 32+ char key) | Production |
| `GOOGLE_AI_API_KEY` | (your key) | Production |

### Step 3.2: Configure Allowed Origins

The OCR endpoint validates request origins. Update `src/app/api/ocr/extract/route.ts` if your production domain differs:

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://eghiseul.ro',
  'https://www.eghiseul.ro',
  // Add any other production domains
];
```

---

## 4. Security Checklist

### Before Going Live

- [ ] `PII_ENCRYPTION_KEY` set in Vercel (32+ characters)
- [ ] Same key set in Supabase database (`app.pii_encryption_key`)
- [ ] Existing data migrated with `migrate_pii_to_encrypted()`
- [ ] Test order created and verified encryption works
- [ ] Test order deleted
- [ ] Production domain added to allowed origins
- [ ] Google AI API key set

### After Going Live

- [ ] Verify audit logs are being recorded
- [ ] Verify rate limiting is working (test with 11+ rapid requests)
- [ ] Verify OCR extraction works from production domain
- [ ] Verify order creation encrypts PII automatically

---

## 5. Monitoring & Alerts

### What to Monitor

1. **Audit Logs** - Check for blocked requests
   ```sql
   SELECT * FROM audit_logs
   WHERE status = 'blocked'
   ORDER BY created_at DESC
   LIMIT 20;
   ```

2. **Rate Limiting** - Check for abuse attempts
   ```sql
   SELECT
     ip_address,
     COUNT(*) as blocked_count,
     MAX(created_at) as last_blocked
   FROM audit_logs
   WHERE status = 'blocked'
   AND metadata->>'reason' = 'rate_limited'
   AND created_at > NOW() - INTERVAL '24 hours'
   GROUP BY ip_address
   ORDER BY blocked_count DESC;
   ```

3. **Encryption Failures** - Check for unencrypted orders
   ```sql
   SELECT COUNT(*) as unencrypted_orders
   FROM orders
   WHERE pii_encrypted_at IS NULL
   AND customer_data->'personal'->>'cnp' IS NOT NULL;
   ```

### Set Up Alerts

Consider setting up alerts for:
- More than 100 blocked requests per hour from same IP
- Any orders created without encryption
- Database errors related to encryption functions

---

## 6. Key Rotation (Annual)

The encryption key should be rotated annually. Process:

### Step 6.1: Generate New Key

```bash
openssl rand -base64 32
```

### Step 6.2: Re-encrypt All Data

```sql
-- First, decrypt with old key and re-encrypt with new key
-- This is a complex migration - create a backup first!

-- 1. Create backup
CREATE TABLE orders_backup AS SELECT * FROM orders;

-- 2. Decrypt and re-encrypt (pseudo-code - needs custom function)
-- Contact development team for this operation

-- 3. Update database session variable
ALTER DATABASE postgres SET "app.pii_encryption_key" = 'NEW-KEY';

-- 4. Update Vercel environment variable
```

### Step 6.3: Update All Environments

1. Update `PII_ENCRYPTION_KEY` in Vercel
2. Update `app.pii_encryption_key` in Supabase
3. Trigger new deployment

---

## 7. Troubleshooting

### Encryption Not Working

**Symptom:** Orders show raw CNP instead of masked version

**Check:**
1. Is `app.pii_encryption_key` set in database?
   ```sql
   SHOW "app.pii_encryption_key";
   ```
2. Is the trigger active?
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trg_encrypt_order_pii';
   ```

### Decryption Failing

**Symptom:** API returns null for PII fields

**Check:**
1. Is `PII_ENCRYPTION_KEY` set in environment?
2. Does the key match the database key?
3. Check logs for `[SECURITY] PII decryption error`

### Rate Limiting Too Aggressive

**Symptom:** Legitimate users getting 429 errors

**Adjust in** `src/lib/security/rate-limiter.ts`:
```typescript
export const RATE_LIMITS = {
  ocr: {
    guest: { windowMs: 60 * 1000, maxRequests: 10 },     // Increase if needed
    authenticated: { windowMs: 60 * 1000, maxRequests: 30 },
  },
};
```

---

## 8. Emergency Procedures

### Data Breach Response

1. **Immediate:** Disable public access to database
2. **Notify:** Legal team and ANSPDCP within 72 hours
3. **Investigate:** Check audit logs for unauthorized access
4. **Rotate:** Generate new encryption key
5. **Document:** Create incident report

### Lost Encryption Key

**WARNING:** If the encryption key is lost, encrypted data CANNOT be recovered.

1. Check all backup locations (password manager, secure notes)
2. Check Vercel environment variable history
3. If truly lost: encrypted PII is unrecoverable, must notify affected users

---

## 9. Files Reference

| File | Purpose |
|------|---------|
| `supabase/migrations/006_audit_logs.sql` | Audit logging table |
| `supabase/migrations/007_pii_encryption.sql` | Encryption functions |
| `src/lib/security/audit-logger.ts` | API audit logging |
| `src/lib/security/rate-limiter.ts` | Rate limiting |
| `src/lib/security/pii-encryption.ts` | Encryption helpers |
| `src/app/api/ocr/extract/route.ts` | Secured OCR endpoint |

---

## 10. Contacts

| Role | Contact | For |
|------|---------|-----|
| Security Lead | TBD | Security incidents |
| Legal | TBD | GDPR compliance |
| DevOps | TBD | Deployment issues |

---

**Document Owner:** Development Team
**Next Review:** 2026-01-17
