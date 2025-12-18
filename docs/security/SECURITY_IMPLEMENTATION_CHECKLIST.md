# Security Implementation Checklist - eGhiseul.ro

**Based on Security Audit Report:** 2025-12-17
**Target Completion:** 90 days from report date
**Owner:** Development Team

---

## Week 1: CRITICAL Fixes (P0)

### Day 1-2: OCR Endpoint Security

- [ ] **Add authentication to OCR endpoint**
  - File: `src/app/api/ocr/extract/route.ts`
  - Add `createClient()` and `auth.getUser()` check
  - Return 401 if not authenticated
  - Test: Call endpoint without auth token (should fail)

- [ ] **Implement rate limiting**
  - Create: `src/lib/rate-limit.ts`
  - Use Redis or in-memory store
  - Limit: 5 requests per minute per user
  - Test: Make 6 requests in 1 minute (6th should be 429)

### Day 3-5: Audit Logging

- [ ] **Create audit logs table**
  - File: `supabase/migrations/006_audit_logs.sql`
  - Columns: id, user_id, action, resource_type, resource_id, timestamp, ip_address, metadata
  - Create indexes for performance
  - Enable RLS policies

- [ ] **Implement audit logging helper**
  - Create: `src/lib/audit/logger.ts`
  - Function: `auditLog({ userId, action, resourceType, ... })`
  - Test: Insert log, verify in database

- [ ] **Add audit logging to OCR endpoint**
  - Log: `ocr_extract_success`, `ocr_extract_failed`, `ocr_extract_unauthorized`
  - Include: user_id, document_type, confidence (NOT CNP/PII)
  - Test: Extract document, check audit_logs table

### Day 6-7: Verification & Deployment

- [ ] **Legal: Verify Google AI DPA**
  - Review Google Cloud AI Terms of Service
  - Check for Data Processing Agreement
  - Document: Google's data retention policy
  - Set `GOOGLE_DPA_VERIFIED=true` in .env after confirmation

- [ ] **Deploy to staging**
  - Run migrations
  - Test all endpoints
  - Check logs

- [ ] **Deploy to production**
  - Run migrations during low-traffic window
  - Monitor error rates
  - Check audit logs populating

---

## Week 2-3: Encryption Implementation (P1)

### Week 2: Database Changes

- [ ] **Enable pgcrypto extension**
  ```sql
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  ```

- [ ] **Add encrypted columns**
  - File: `supabase/migrations/007_add_encryption.sql`
  - Add: `cnp_encrypted BYTEA`, `ci_series_encrypted BYTEA`, `ci_number_encrypted BYTEA`
  - Create indexes

- [ ] **Create encrypt/decrypt functions**
  ```sql
  CREATE FUNCTION encrypt_pii(plaintext TEXT) RETURNS BYTEA;
  CREATE FUNCTION decrypt_pii(ciphertext BYTEA) RETURNS TEXT;
  ```

- [ ] **Generate encryption key**
  ```bash
  openssl rand -hex 32
  ```
  - Store in AWS Secrets Manager or .env.local

- [ ] **Test encryption locally**
  - Insert encrypted data
  - Retrieve and decrypt
  - Verify roundtrip

### Week 3: Dual-Write Mode

- [ ] **Update order creation API**
  - File: `src/app/api/orders/route.ts`
  - Write to BOTH plaintext and encrypted columns
  - Example:
    ```typescript
    customer_data: customerData,  // Old
    cnp_encrypted: await encrypt(customerData.personal.cnp),  // New
    ```

- [ ] **Deploy dual-write to production**
  - Monitor for errors
  - All new orders should have encrypted data

- [ ] **Backfill existing orders (10%)**
  - Script: `scripts/backfill-encryption.ts`
  - Run on 10% of data first
  - Verify correctness

---

## Week 4: Data Retention & Deletion (P1)

- [ ] **Create data deletion tables**
  - File: `supabase/migrations/008_data_retention.sql`
  - Table: `data_deletion_requests`
  - Add columns: `retention_expires_at`, `pseudonymized`

- [ ] **Implement retention expiry calculation**
  - Function: `calculate_retention_expiry()`
  - Trigger: `set_retention_expiry` on order status change
  - Test: Complete order, check `retention_expires_at` = created_at + 10 years

- [ ] **Create automated deletion job**
  - File: `src/lib/cron/data-retention.ts`
  - Function: `runDataRetentionJob()`
  - Pseudonymize expired orders
  - Delete KYC documents from S3

- [ ] **Create RTBF API endpoint**
  - File: `src/app/api/data-deletion/route.ts`
  - POST: Create deletion request
  - GET: Check request status
  - Handle legal retention exceptions

- [ ] **Test deletion workflow**
  - Create test order with past date
  - Set retention_expires_at to yesterday
  - Run job
  - Verify pseudonymization

---

## Month 2: High Priority Items

### Week 5-6: Complete Encryption Migration

- [ ] **Backfill remaining 90% of data**
  - Run in batches of 1000
  - Monitor database load
  - Verify no data loss

- [ ] **Switch reads to encrypted columns**
  - Update all SELECT queries
  - Use `decrypt_pii()` function
  - Test all user-facing pages

- [ ] **Verify dual-read mode**
  - All data readable from encrypted columns
  - No errors in logs
  - Performance acceptable

- [ ] **Remove plaintext columns (FINAL STEP)**
  - Backup database first
  - `ALTER TABLE orders DROP COLUMN customer_data;`
  - Monitor for 48 hours
  - If issues, restore from backup

### Week 7: PII Minimization

- [ ] **Remove PII from OCR data after validation**
  - File: `src/app/api/orders/route.ts`
  - Before storing, redact `kyc_documents.ocr_data`
  - Keep only: `valid`, `confidence`, `documentType`
  - Remove: `extractedData` with CNP, names, etc.

- [ ] **Clear client-side blobs after upload**
  - File: `src/components/orders/steps/personal-data-step.tsx`
  - Call `URL.revokeObjectURL(preview)` immediately after upload
  - Clear React state after order submission

### Week 8: Google AI Migration

- [ ] **Switch to stable Gemini model**
  - File: `src/lib/services/document-ocr.ts`
  - Change: `gemini-2.0-flash-exp` → `gemini-1.5-pro`
  - Test OCR accuracy
  - Deploy to production

- [ ] **Document Google data retention**
  - Review Google Cloud AI data retention policy
  - Update Privacy Policy to mention Google as processor
  - Add to DPA registry

---

## Month 3: Medium Priority & Documentation

### Week 9-10: Access Controls

- [ ] **Implement column-level masking for admins**
  - File: `supabase/migrations/009_column_masking.sql`
  - Create `mask_cnp()` function
  - Create `orders_masked` view for non-super-admins
  - Update RLS policies

- [ ] **Test admin access**
  - Admin should see masked CNP: `1***********3`
  - Super admin should see full CNP
  - Regular users should see own data

### Week 11: Additional GDPR Features

- [ ] **Implement data export (GDPR Art. 20)**
  - File: `src/app/api/data-export/route.ts`
  - Generate JSON with all user data
  - Include: orders, personal_data, kyc_documents (URLs)
  - Exclude: payment details (link to Stripe)

- [ ] **Test data export**
  - Request export as user
  - Verify JSON completeness
  - Check file size limits

### Week 12: Documentation & Training

- [ ] **Complete GDPR documentation**
  - Records of Processing Activities (Art. 30)
  - Data flow diagrams
  - DPA registry (all processors)

- [ ] **Update Privacy Policy**
  - Add: Encryption practices
  - Add: Data retention schedule
  - Add: Third-party processors (Google, Stripe, AWS)
  - Add: RTBF instructions

- [ ] **Update Cookie Policy**
  - Implement cookie consent banner
  - Granular consent (essential, analytics, marketing)

- [ ] **Staff training**
  - Security best practices
  - GDPR obligations
  - Incident response procedures

---

## Continuous: Security Monitoring

### Ongoing Tasks

- [ ] **Weekly: Review audit logs**
  - Check for suspicious access patterns
  - Verify no unauthorized PII access
  - Tool: Admin dashboard or SQL query

- [ ] **Monthly: Encryption key rotation**
  - Rotate every 90 days
  - Re-encrypt sample data
  - Verify old keys deprecated

- [ ] **Quarterly: Security assessment**
  - Run penetration tests
  - Review access logs
  - Update threat model

---

## Testing Checklist

### Security Tests

- [ ] **Authentication tests**
  - [ ] OCR endpoint rejects unauthenticated requests
  - [ ] Invalid tokens return 401
  - [ ] Expired tokens are rejected

- [ ] **Rate limiting tests**
  - [ ] 6th request in 1 minute returns 429
  - [ ] Rate limit resets after window

- [ ] **Encryption tests**
  - [ ] CNP encrypted in database
  - [ ] Decryption returns original value
  - [ ] Encrypted data not readable as plaintext

- [ ] **Audit logging tests**
  - [ ] PII access is logged
  - [ ] Logs contain required fields
  - [ ] No PII in log metadata

- [ ] **RTBF tests**
  - [ ] Deletion request created
  - [ ] Legal retention respected
  - [ ] Marketing data deleted immediately
  - [ ] Contract data pseudonymized after 10 years

### Performance Tests

- [ ] **Encryption overhead**
  - Measure: Query time with encryption
  - Target: <50ms additional latency

- [ ] **Audit log writes**
  - Measure: Log insertion time
  - Target: <10ms per log

- [ ] **Deletion job**
  - Measure: Time to pseudonymize 1000 orders
  - Target: <5 minutes

---

## Deployment Plan

### Staging Deployment

1. **Database migrations**
   - Run all migrations
   - Verify schema changes

2. **Environment variables**
   - Set `DATABASE_ENCRYPTION_KEY`
   - Set `GOOGLE_DPA_VERIFIED`
   - Set `REDIS_URL` (for rate limiting)

3. **Application deployment**
   - Deploy code changes
   - Run smoke tests

4. **Validation**
   - Create test order
   - Upload ID card
   - Verify encryption
   - Check audit logs

### Production Deployment

1. **Pre-deployment**
   - [ ] Database backup
   - [ ] Announce maintenance window (optional)
   - [ ] Prepare rollback plan

2. **Deployment (low-traffic window)**
   - [ ] Run migrations
   - [ ] Deploy application
   - [ ] Enable new features

3. **Post-deployment monitoring**
   - [ ] Check error rates (target: <0.1%)
   - [ ] Verify audit logs populating
   - [ ] Check encryption working
   - [ ] Monitor database load

4. **Rollback criteria**
   - Error rate >1%
   - Data loss detected
   - Encryption failures
   - Critical bug discovered

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Security Lead** | | | |
| **Dev Lead** | | | |
| **Legal Counsel** | | | |
| **Product Owner** | | | |

---

## Notes

- All code changes should be reviewed by 2+ developers
- Database migrations should be tested on staging first
- Encryption keys should NEVER be committed to git
- Legal team must approve all GDPR-related changes
- Customer communication plan for major security updates

---

**Last Updated:** 2025-12-17
**Next Review:** 2025-01-17 (30 days)
