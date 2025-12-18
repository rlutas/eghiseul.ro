# Security Quick Reference - Developers

**Last Updated:** 2025-12-17
**Critical Status:** IMMEDIATE ACTION REQUIRED

---

## Critical Vulnerabilities Summary

### STOP - Do Not Deploy Without These Fixes

1. **OCR Endpoint is Public (CVSS 9.3)**
   - File: `src/app/api/ocr/extract/route.ts`
   - Issue: Anyone can extract PII from ID cards
   - Fix: Add authentication check (see code below)

2. **CNP Stored Unencrypted (CVSS 9.8)**
   - Table: `orders.customer_data`
   - Issue: Romanian SSN in plaintext
   - Fix: Implement pgcrypto encryption

3. **No Audit Logging (CVSS 8.7)**
   - Issue: Cannot detect breaches
   - Fix: Log all PII access

---

## Quick Fixes (Copy-Paste Ready)

### 1. Secure OCR Endpoint (30 minutes)

```typescript
// File: src/app/api/ocr/extract/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 1. AUTHENTICATION (CRITICAL)
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // 2. RATE LIMITING (TODO: Implement proper rate limiting)
  // For now, check session timestamp

  // 3. Continue with existing OCR logic
  const body = await request.json();
  // ... rest of code
}
```

### 2. Add Audit Logging (1 hour)

**Step 1: Create table**

```sql
-- File: supabase/migrations/006_audit_logs.sql

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

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);
```

**Step 2: Create helper**

```typescript
// File: src/lib/audit/logger.ts

import { createClient } from '@/lib/supabase/server';

export async function auditLog({
  userId,
  action,
  resourceType,
  resourceId,
  metadata = {},
  request,
}: {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  request?: Request;
}) {
  const supabase = createClient();

  // CRITICAL: Never log PII
  const sanitized = { ...metadata };
  delete sanitized.cnp;
  delete sanitized.ci_series;
  delete sanitized.ci_number;
  delete sanitized.password;

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    ip_address: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip'),
    metadata: sanitized,
  });
}
```

**Step 3: Use in endpoints**

```typescript
// Add to any endpoint accessing PII
await auditLog({
  userId: user.id,
  action: 'ocr_extract',
  resourceType: 'kyc_document',
  metadata: {
    document_type: 'ci_front',
    confidence: 98,
    // NO CNP, NO NAMES
  },
  request,
});
```

### 3. Implement Rate Limiting (2 hours)

```typescript
// File: src/lib/rate-limit.ts

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(identifier: string): Promise<{ success: boolean }> {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return { success: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { success: false };
  }

  record.count++;
  return { success: true };
}

// Usage:
const result = await rateLimit(user.id);
if (!result.success) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}
```

---

## Secure Coding Checklist

### Before Writing Code

- [ ] Will this code access PII (CNP, CI, names, addresses)?
- [ ] Will this code store PII?
- [ ] Will this code send PII to third parties?
- [ ] Does this endpoint require authentication?
- [ ] Should this action be audit logged?

### API Endpoint Checklist

```typescript
export async function POST(request: NextRequest) {
  // 1. AUTHENTICATION
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. RATE LIMITING (if public or high-impact)
  const rateLimit = await checkRateLimit(user.id);
  if (!rateLimit.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  // 3. INPUT VALIDATION
  const body = await request.json();
  if (!body.required_field) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  // 4. AUDIT LOGGING (if accessing PII)
  await auditLog({
    userId: user.id,
    action: 'action_name',
    resourceType: 'resource_type',
    request,
  });

  // 5. BUSINESS LOGIC

  // 6. ERROR HANDLING (don't leak sensitive info)
  try {
    // ... logic
  } catch (error) {
    console.error('Internal error:', error); // Detailed error in logs
    return NextResponse.json(
      { error: 'Internal server error' }, // Generic error to user
      { status: 500 }
    );
  }
}
```

---

## PII Handling Rules

### DO

✅ Encrypt CNP, CI series/number before storing
✅ Use HTTPS for all requests
✅ Log PII access in audit logs
✅ Validate input (CNP format, CI format)
✅ Use parameterized queries (ORM)
✅ Clear client-side PII after submission
✅ Set short session timeouts

### DON'T

❌ Log CNP, names, addresses in console.log
❌ Store PII in localStorage/sessionStorage
❌ Send PII in URL parameters
❌ Include PII in error messages
❌ Store PII in analytics (Google Analytics)
❌ Display full CNP to admins (mask it)
❌ Keep PII longer than necessary

---

## Common Mistakes

### Mistake 1: Logging PII

```typescript
// ❌ BAD
console.log('User data:', { cnp: '1850101123456', name: 'Ion Popescu' });

// ✅ GOOD
console.log('User data processed', { user_id: user.id, success: true });
```

### Mistake 2: Storing PII in React State

```typescript
// ❌ BAD
const [userData, setUserData] = useState({
  cnp: '1850101123456',
  ci_series: 'XV',
  // ... stored in memory for entire session
});

// ✅ GOOD
// Submit immediately to API, don't keep in state
const handleSubmit = async (data) => {
  await fetch('/api/orders', { method: 'POST', body: JSON.stringify(data) });
  // Clear form after submission
  setUserData({});
};
```

### Mistake 3: No Authentication on Sensitive Endpoints

```typescript
// ❌ BAD
export async function GET(request: NextRequest) {
  const orders = await supabase.from('orders').select('*');
  return NextResponse.json(orders); // Anyone can access
}

// ✅ GOOD
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id); // RLS enforces this too
  return NextResponse.json(orders);
}
```

### Mistake 4: SQL Injection Vulnerability

```typescript
// ❌ BAD (manual SQL)
const query = `SELECT * FROM orders WHERE id = '${orderId}'`; // Vulnerable!

// ✅ GOOD (Supabase ORM)
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('id', orderId); // Parameterized, safe
```

---

## Encryption Quick Reference

### When to Encrypt

| Data | Encryption Required | Method |
|------|---------------------|--------|
| CNP | YES (Critical) | pgcrypto or app-level |
| CI Series/Number | YES (Critical) | pgcrypto or app-level |
| Full Name | Recommended | pgcrypto |
| Address | Recommended | pgcrypto |
| Email | No (but access control) | None |
| Phone | No (but access control) | None |
| Passwords | YES (Always) | bcrypt/argon2 (NOT encryption) |

### Encryption Example (pgcrypto)

```sql
-- Encrypt
INSERT INTO orders (cnp_encrypted)
VALUES (pgp_sym_encrypt('1850101123456', current_setting('app.encryption_key')));

-- Decrypt
SELECT pgp_sym_decrypt(cnp_encrypted, current_setting('app.encryption_key')) AS cnp
FROM orders
WHERE id = '...';
```

### Application-Level Encryption

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

export function decrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
```

---

## Testing Security

### Test Authentication

```typescript
// Test: Unauthorized access returns 401
test('OCR endpoint requires authentication', async () => {
  const response = await fetch('/api/ocr/extract', {
    method: 'POST',
    body: JSON.stringify({ imageBase64: '...' }),
  });

  expect(response.status).toBe(401);
});
```

### Test Rate Limiting

```typescript
// Test: 6th request in 1 minute is blocked
test('Rate limit enforced', async () => {
  const token = await getAuthToken();

  // Make 5 requests (allowed)
  for (let i = 0; i < 5; i++) {
    const res = await fetch('/api/ocr/extract', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ imageBase64: '...' }),
    });
    expect(res.status).toBe(200);
  }

  // 6th request (blocked)
  const res = await fetch('/api/ocr/extract', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ imageBase64: '...' }),
  });
  expect(res.status).toBe(429);
});
```

### Test Audit Logging

```typescript
// Test: PII access is logged
test('Audit log created for PII access', async () => {
  const token = await getAuthToken();
  await fetch('/api/orders/123', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const logs = await supabase
    .from('audit_logs')
    .select('*')
    .eq('action', 'order_viewed')
    .eq('resource_id', '123');

  expect(logs.length).toBeGreaterThan(0);
});
```

---

## Environment Variables

```bash
# Required for security features

# Encryption
DATABASE_ENCRYPTION_KEY=a3f8d9e2c1b4567890abcdef1234567890abcdef1234567890abcdef12345678

# Google AI (after DPA verification)
GOOGLE_DPA_VERIFIED=true

# Rate Limiting (production)
REDIS_URL=redis://localhost:6379

# Audit Logging
AUDIT_LOG_RETENTION_DAYS=1825  # 5 years
```

---

## Emergency Contacts

| Issue | Contact | Response Time |
|-------|---------|---------------|
| Data breach | security@eghiseul.ro | Immediate |
| GDPR complaint | legal@eghiseul.ro | 72 hours |
| Critical bug | dev-team@eghiseul.ro | 1 hour |

---

## Key Resources

- **Full Security Audit:** `docs/security/SECURITY_AUDIT_REPORT_2025-12-17.md`
- **Implementation Checklist:** `docs/security/SECURITY_IMPLEMENTATION_CHECKLIST.md`
- **GDPR Compliance:** `docs/legal/compliance-research.md`
- **Security Architecture:** `docs/security/security-architecture.md`

---

**Remember:** When in doubt, ask. Security is everyone's responsibility.
