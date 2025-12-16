# Security Architecture - eGhiseul.ro

**Version:** 1.0
**Date:** 2025-12-15
**Classification:** Internal - Security Sensitive

## Executive Summary

This document defines the security architecture for eGhiseul.ro, a platform handling highly sensitive personal data including Romanian CNP (personal identification numbers), identity documents, biometric data (selfies), signatures, and payment information. The platform must comply with GDPR, Romanian data protection laws, and industry best practices for PII handling.

**Risk Profile:** HIGH
- Handles government ID documents and biometric data
- Processes Romanian CNP (equivalent to SSN)
- Stores contracts with legal validity
- Serves diaspora community (international data transfers)
- Target for identity fraud and document forgery

## Table of Contents

1. [Security Principles](#security-principles)
2. [Threat Model](#threat-model)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Protection](#data-protection)
5. [File Storage Security](#file-storage-security)
6. [Payment Security](#payment-security)
7. [API Security](#api-security)
8. [Application Security](#application-security)
9. [Infrastructure Security](#infrastructure-security)
10. [Compliance & Auditing](#compliance--auditing)
11. [Incident Response](#incident-response)
12. [Security Checklist](#security-checklist)

---

## Security Principles

### Core Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Principle of Least Privilege**: Minimal access rights by default
3. **Zero Trust**: Verify every request, trust nothing
4. **Privacy by Design**: GDPR compliance built-in from start
5. **Fail Secure**: System defaults to secure state on failure
6. **Audit Everything**: Comprehensive logging for forensics

### Data Classification

| Classification | Examples | Protection Level |
|----------------|----------|------------------|
| **Critical** | CNP, Passport numbers, ID scans, Biometrics | AES-256, encrypted at rest, limited access, audit all |
| **Sensitive** | Names, addresses, phone, email, signatures | AES-256, encrypted at rest, RBAC |
| **Confidential** | Contracts, invoices, order details | TLS in transit, access controls |
| **Public** | Service descriptions, pricing, FAQ | Standard web security |

---

## Threat Model

### High-Priority Threats

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|------------|------------|
| **Identity Theft** | Critical | High | Strong KYC, document verification, manual review flags |
| **Data Breach** | Critical | Medium | Encryption at rest/transit, access controls, monitoring |
| **Payment Fraud** | High | Medium | Stripe 3D Secure, fraud detection, transaction monitoring |
| **Account Takeover** | High | Medium | 2FA for admins, magic links, session management |
| **Document Forgery** | High | Medium | OCR validation, manual review, watermark detection |
| **Insider Threat** | High | Low | RBAC, audit logs, data minimization, background checks |
| **DDoS Attack** | Medium | High | WAF, rate limiting, CDN, auto-scaling |
| **API Abuse** | Medium | Medium | Rate limiting, API keys, webhook signatures |
| **SQL Injection** | Critical | Low | Parameterized queries, ORM, input validation |
| **XSS Attacks** | High | Low | CSP, output encoding, sanitization |

### Attack Vectors

1. **Customer Portal**: Malicious file uploads, XSS in forms, CSRF
2. **Admin Dashboard**: Credential stuffing, privilege escalation, insider threats
3. **API Endpoints**: Injection attacks, authentication bypass, rate limit abuse
4. **Payment Flow**: Man-in-the-middle, card testing, fraud
5. **File Storage**: Unauthorized access, data exfiltration, ransomware
6. **Third-Party Integrations**: Supply chain attacks (Stripe, Olbio, infocui.ro)

---

## Authentication & Authorization

### Customer Authentication

#### Magic Link Authentication (Recommended)
```
Best practice for customer-facing applications with minimal friction

Implementation:
- Generate cryptographically secure token (32+ bytes)
- Store token hash in database with expiration (15 minutes)
- Send link via email to verified address
- Single-use token, invalidate after use
- Rate limit: 3 requests per 15 minutes per email
- Log all authentication attempts

Security benefits:
- No password storage/management
- Resistant to credential stuffing
- Phishing resistant (token in URL)
- Mobile-friendly

Libraries:
- next-auth (supports magic links)
- @supabase/auth-js
```

#### Password-Based Authentication (Alternative)
```
For users who prefer traditional login

Requirements:
- Minimum 12 characters (not 8)
- Mix of uppercase, lowercase, numbers, symbols
- Password strength meter (zxcvbn library)
- Bcrypt with cost factor 12+ (or Argon2id)
- Account lockout: 5 failed attempts, 15 min lockout
- Password reset via email with token expiry

Protection:
- Rate limiting: 5 attempts per 15 minutes per IP
- CAPTCHA after 2 failed attempts
- Email notification on password change
- Force password reset on breach detection (Have I Been Pwned API)
```

### Admin Authentication

#### Multi-Factor Authentication (REQUIRED)
```
All admin accounts MUST use 2FA

Recommended: TOTP (Time-based One-Time Password)
- Google Authenticator, Authy, 1Password
- 6-digit codes, 30-second window
- Backup codes (10 single-use codes)
- Store secret encrypted in database

Implementation:
- Library: speakeasy (Node.js)
- QR code generation for setup
- Enforce 2FA within 7 days of account creation
- Recovery process via super admin approval

Alternative: SMS (less secure, but better than nothing)
- Use Twilio Verify API
- Rate limit to prevent SMS bombing
- Not recommended as primary due to SIM swapping risk

Hardware keys (Future):
- WebAuthn/FIDO2 support
- YubiKey, Google Titan
- Most secure option
```

#### Session Management
```
Admin sessions:
- JWT stored in httpOnly, secure, SameSite=Strict cookies
- Session timeout: 8 hours of inactivity
- Absolute timeout: 24 hours
- Concurrent session limit: 3 per account
- Force re-authentication for sensitive operations (delete, refund)

Customer sessions:
- JWT stored in httpOnly, secure, SameSite=Strict cookies
- Session timeout: 7 days with "Remember me"
- Session timeout: 24 hours without
- IP address binding (optional, may cause issues with mobile)

JWT Configuration:
- Algorithm: RS256 (asymmetric) preferred over HS256
- Payload: user_id, role, issued_at, expires_at, session_id
- Secret rotation: Every 90 days
- Revocation: Maintain blacklist in Redis with TTL
```

### Role-Based Access Control (RBAC)

```typescript
// Role definitions
enum Role {
  SUPER_ADMIN = 'super_admin',      // Full system access
  ADMIN = 'admin',                   // Order management, reports
  OPERATOR = 'operator',             // Order processing, status updates
  CUSTOMER = 'customer',             // Own orders only
  API_PARTNER = 'api_partner',       // API access only
  GUEST = 'guest'                    // Public pages
}

// Permission model
const permissions = {
  super_admin: ['*'],  // All permissions
  admin: [
    'orders:read', 'orders:write', 'orders:delete',
    'customers:read', 'customers:write',
    'reports:read', 'reports:export',
    'settings:read', 'settings:write',
    'users:read', 'users:write'
  ],
  operator: [
    'orders:read', 'orders:update_status', 'orders:upload',
    'customers:read',
    'reports:read'
  ],
  customer: [
    'orders:read_own', 'orders:create',
    'profile:read', 'profile:write'
  ],
  api_partner: [
    'api:orders:create', 'api:orders:read', 'api:webhooks'
  ],
  guest: [
    'services:read', 'public:read'
  ]
}

// Middleware example
function requirePermission(permission: string) {
  return async (req, res, next) => {
    const user = req.user; // from JWT
    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

### OAuth 2.0 for API Partners
```
API authentication strategy:

1. API Key Authentication (Simple)
   - Generate cryptographically random API key (32+ bytes)
   - Store hash in database (SHA-256)
   - Include in header: Authorization: Bearer <api_key>
   - Rate limit per key
   - Ability to rotate keys
   - Audit all API usage

2. OAuth 2.0 Client Credentials Flow (Enterprise)
   - Client ID + Client Secret
   - Token exchange endpoint
   - Short-lived access tokens (1 hour)
   - Refresh tokens for renewed access
   - Scope-based permissions
   - Token introspection endpoint

Implementation:
- Library: oauth2-server (Node.js)
- Store secrets encrypted
- HTTPS only
- Rate limiting per client
```

---

## Data Protection

### Encryption at Rest

#### Database Encryption
```
Strategy: Application-level encryption + database-level encryption

PostgreSQL Configuration:
- Enable SSL/TLS for all connections
- Use pgcrypto extension for column-level encryption
- OR application-level encryption for critical fields

Application-level encryption (Recommended):
- Library: node-forge, crypto (Node.js built-in)
- Algorithm: AES-256-GCM (authenticated encryption)
- Key management: AWS KMS or HashiCorp Vault

Fields requiring encryption:
- CNP (personal identification number)
- ID document numbers (CI, passport)
- Phone numbers
- Addresses (after 30 days of order completion)
- Signatures (digital signature data)
- Parent names (for minors)

Example implementation:
```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// Fetch encryption key from KMS/Vault
async function getEncryptionKey(): Promise<Buffer> {
  // AWS KMS or HashiCorp Vault integration
  const kmsKey = await kms.decrypt({ KeyId: 'alias/eghiseul-data-key' });
  return Buffer.from(kmsKey.Plaintext);
}

function encrypt(plaintext: string, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Return: iv + tag + encrypted (all hex encoded)
  return iv.toString('hex') + tag.toString('hex') + encrypted;
}

function decrypt(ciphertext: string, key: Buffer): string {
  const iv = Buffer.from(ciphertext.slice(0, IV_LENGTH * 2), 'hex');
  const tag = Buffer.from(ciphertext.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex');
  const encrypted = ciphertext.slice((IV_LENGTH + TAG_LENGTH) * 2);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Database model example
class Customer {
  id: string;
  email: string;
  cnp_encrypted: string;  // encrypted CNP
  cnp_hash: string;       // for searching without decryption
  name: string;
  phone_encrypted: string;

  static async create(data: CustomerInput) {
    const key = await getEncryptionKey();

    return db.customers.create({
      ...data,
      cnp_encrypted: encrypt(data.cnp, key),
      cnp_hash: hashCNP(data.cnp), // SHA-256 for search
      phone_encrypted: encrypt(data.phone, key)
    });
  }
}
```

### Key Management

#### AWS KMS (Recommended)
```
Setup:
1. Create Customer Master Key (CMK) in AWS KMS
   - Alias: alias/eghiseul-data-key
   - Key rotation: Enabled (automatic yearly)
   - Multi-region: If deploying in multiple regions

2. Create Data Encryption Key (DEK)
   - Generate from CMK
   - Cache decrypted DEK in memory (max 1 hour)
   - Encrypt DEK at rest

3. IAM Policies
   - Restrict kms:Decrypt to application role only
   - Audit all KMS operations via CloudTrail
   - Alert on anomalous usage

Benefits:
- AWS manages key rotation
- HSM-backed security
- Audit trail via CloudTrail
- Fine-grained access control
- Multi-region replication

Cost: ~$1/month per key + $0.03 per 10,000 requests
```

#### HashiCorp Vault (Alternative)
```
Setup:
1. Deploy Vault cluster (highly available)
2. Enable Transit Secrets Engine
3. Create encryption key: eghiseul-data-key
4. Enable automatic rotation
5. Configure AppRole authentication for application

Benefits:
- Self-hosted option
- Dynamic secrets
- Secret leasing and renewal
- Detailed audit logs
- Multi-cloud support

Considerations:
- Requires infrastructure maintenance
- Higher operational overhead
- Better for multi-cloud or on-prem
```

### Encryption in Transit

#### TLS Configuration
```
Minimum: TLS 1.3 (TLS 1.2 acceptable for compatibility)

nginx configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name eghiseul.ro www.eghiseul.ro;

    # TLS Configuration
    ssl_certificate /etc/letsencrypt/live/eghiseul.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eghiseul.ro/privkey.pem;
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
    ssl_prefer_server_ciphers off;

    # HSTS (31536000 seconds = 1 year)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/eghiseul.ro/chain.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name eghiseul.ro www.eghiseul.ro;
    return 301 https://$server_name$request_uri;
}
```

#### Certificate Management
```
Provider: Let's Encrypt (free, automated)

Renewal:
- Automated via certbot
- 90-day validity, renew at 60 days
- Monitor expiry alerts
- Test renewal process monthly

Backup:
- Store certificates in S3 encrypted
- Document manual renewal process

Monitoring:
- Alert 14 days before expiry
- Monitor certificate transparency logs
```

#### Internal Service Communication
```
All internal service-to-service communication must use TLS:

- API to Database: SSL/TLS connections
- API to S3: HTTPS only
- API to Stripe: TLS 1.2+ (enforced by Stripe)
- API to Olbio: HTTPS
- API to Email provider: TLS

Mutual TLS (mTLS) for high-security services:
- Certificate-based authentication
- Both client and server verify certificates
```

### Data Minimization & Retention

```
GDPR Principle: Collect only what's necessary, retain only as long as needed

Collection:
- Only collect data required for service delivery
- No tracking beyond essential analytics
- Explicit consent for marketing communications

Retention Policy:
| Data Type | Retention Period | Reason | Deletion Method |
|-----------|------------------|--------|-----------------|
| Contracts | 10 years | Legal requirement (Romanian law) | Hard delete after period |
| KYC documents | 180 days (active) + 5 years | AML compliance, reuse | Hard delete after 5 years |
| Order data | 7 years | Accounting, tax, legal | Anonymize after 3 years, delete after 7 |
| Customer PII | Active + 3 years | Business operations | Anonymize on request or after period |
| Access logs | 1 year | Security, forensics | Archive to cold storage, delete after 1 year |
| Payment data | 7 years | Accounting, disputes | Anonymize card data immediately, retain transaction ID |
| Session data | 30 days | Security | Auto-expire |
| Marketing data | Until consent withdrawn | Marketing | Delete immediately on opt-out |

Anonymization strategy:
- Replace CNP with hash or pseudonym
- Remove names, addresses, phone numbers
- Keep statistical data (order count, revenue) with anonymized ID
- Maintain referential integrity where needed

Implementation:
- Scheduled job runs nightly
- Checks retention policies
- Moves to archive or deletes
- Logs all deletions
- Admin review for bulk deletions
```

### Data Masking & Redaction

```
Display rules for PII:

Customer portal:
- Show full data (it's their own)

Admin dashboard:
- CNP: 1******1234 (first + last 4 digits)
- Phone: +40 7** *** 123
- Email: r***l@example.com
- Address: Show full (needed for shipping)
- Card: **** **** **** 1234 (last 4 only)

Logs:
- Never log CNP, card numbers, passwords
- Hash or redact PII in logs
- Use request IDs for correlation

Example middleware:
```typescript
function maskCNP(cnp: string): string {
  if (cnp.length !== 13) return '***';
  return `${cnp[0]}******${cnp.slice(-4)}`;
}

function redactLogs(data: any): any {
  const sensitiveFields = ['cnp', 'password', 'card_number', 'cvv'];

  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (sensitiveFields.includes(key.toLowerCase())) {
      return '[REDACTED]';
    }
    return value;
  }));
}

// Winston logger example
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format((info) => {
      info = redactLogs(info);
      return info;
    })(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'application.log' })
  ]
});
```

---

## File Storage Security

### S3 Bucket Configuration

#### Bucket Security Hardening
```yaml
Bucket Name: eghiseul-documents-production

S3 Bucket Policy:
- Block all public access: ENABLED
- Block public ACLs: ENABLED
- Ignore public ACLs: ENABLED
- Block public bucket policies: ENABLED
- Restrict public buckets: ENABLED

Encryption:
- Default encryption: SSE-S3 or SSE-KMS (recommended)
- Algorithm: AES-256
- Bucket key: ENABLED (reduces KMS costs)

Versioning:
- Status: ENABLED
- Allows recovery from accidental deletion
- Enables point-in-time recovery

Object Lock (Optional):
- Compliance mode for contracts (10 years)
- Prevents deletion even by root account

Lifecycle Policies:
1. KYC Documents:
   - Transition to S3 Glacier after 180 days
   - Delete after 5 years + 180 days

2. Contracts:
   - Transition to S3 Glacier after 1 year
   - Delete after 10 years

3. Order documents:
   - Transition to S3 Standard-IA after 90 days
   - Transition to S3 Glacier after 1 year
   - Delete after 7 years

CORS Configuration:
- AllowedOrigins: ['https://eghiseul.ro', 'https://www.eghiseul.ro']
- AllowedMethods: ['GET', 'PUT', 'POST']
- AllowedHeaders: ['*']
- ExposeHeaders: ['ETag']
- MaxAgeSeconds: 3600

Logging:
- Server access logging: ENABLED
- Log bucket: eghiseul-logs-production
- Log prefix: s3-access/
- Object-level logging (CloudTrail): ENABLED
```

#### IAM Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowApplicationUpload",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/eghiseul-api-role"
      },
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::eghiseul-documents-production/uploads/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "aws:kms"
        }
      }
    },
    {
      "Sid": "AllowApplicationRead",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/eghiseul-api-role"
      },
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::eghiseul-documents-production/*"
    },
    {
      "Sid": "DenyUnencryptedUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::eghiseul-documents-production/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": ["aws:kms", "AES256"]
        }
      }
    },
    {
      "Sid": "DenyInsecureTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::eghiseul-documents-production/*",
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

### Pre-Signed URLs

```typescript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  region: 'eu-central-1',
  signatureVersion: 'v4'
});

// Generate upload URL (customer uploads)
async function generateUploadUrl(
  orderId: string,
  fileType: string,
  documentType: 'id_front' | 'id_back' | 'selfie' | 'additional'
): Promise<{ uploadUrl: string; fileKey: string }> {

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(fileType)) {
    throw new Error('Invalid file type');
  }

  // Generate unique file key
  const fileKey = `uploads/${orderId}/${documentType}/${Date.now()}-${crypto.randomUUID()}`;

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: 'eghiseul-documents-production',
    Key: fileKey,
    Expires: 300, // 5 minutes
    ContentType: fileType,
    ServerSideEncryption: 'aws:kms',
    SSEKMSKeyId: 'alias/eghiseul-documents-key',
    Metadata: {
      'order-id': orderId,
      'document-type': documentType,
      'uploaded-by': 'customer'
    }
  });

  return { uploadUrl, fileKey };
}

// Generate download URL (customer/admin downloads)
async function generateDownloadUrl(
  fileKey: string,
  userId: string,
  userRole: string
): Promise<string> {

  // Authorization check
  const order = await getOrderByFileKey(fileKey);
  if (userRole === 'customer' && order.userId !== userId) {
    throw new Error('Unauthorized');
  }

  const downloadUrl = s3.getSignedUrl('getObject', {
    Bucket: 'eghiseul-documents-production',
    Key: fileKey,
    Expires: 3600, // 1 hour
    ResponseContentDisposition: 'inline', // or 'attachment' for download
    ResponseCacheControl: 'no-cache, no-store, must-revalidate'
  });

  // Log download access
  await auditLog.create({
    action: 'document_download',
    userId,
    fileKey,
    timestamp: new Date()
  });

  return downloadUrl;
}

// Security best practices:
// 1. Short expiry times (5 min upload, 1 hour download)
// 2. Single-use URLs where possible
// 3. Validate file types and sizes on client AND server
// 4. Log all URL generations
// 5. Check authorization before generating URL
// 6. Use metadata to track uploads
```

### File Upload Validation

```typescript
// Client-side (pre-upload validation)
function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Tip fișier invalid. Acceptăm doar JPG, PNG, PDF.' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Fișier prea mare. Maxim 10 MB.' };
  }

  if (file.size < 1024) { // 1 KB minimum
    return { valid: false, error: 'Fișier prea mic. Minimum 1 KB.' };
  }

  return { valid: true };
}

// Server-side (post-upload verification)
import fileType from 'file-type';
import sharp from 'sharp';

async function verifyUploadedFile(fileKey: string): Promise<void> {
  // Download file from S3
  const fileBuffer = await s3.getObject({
    Bucket: 'eghiseul-documents-production',
    Key: fileKey
  }).promise();

  // Verify MIME type (magic bytes, not just extension)
  const type = await fileType.fromBuffer(fileBuffer.Body as Buffer);

  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!type || !allowedMimes.includes(type.mime)) {
    // Delete file and throw error
    await s3.deleteObject({ Bucket: 'eghiseul-documents-production', Key: fileKey }).promise();
    throw new Error('Invalid file type detected');
  }

  // For images: verify it's actually an image and scan for malware indicators
  if (type.mime.startsWith('image/')) {
    try {
      const metadata = await sharp(fileBuffer.Body as Buffer).metadata();

      // Basic checks
      if (metadata.width < 100 || metadata.height < 100) {
        throw new Error('Image too small');
      }
      if (metadata.width > 10000 || metadata.height > 10000) {
        throw new Error('Image too large');
      }

      // Strip EXIF data (privacy) and create sanitized version
      await sharp(fileBuffer.Body as Buffer)
        .rotate() // auto-rotate based on EXIF
        .withMetadata({ exif: {} }) // remove EXIF
        .toBuffer()
        .then(buffer => {
          return s3.putObject({
            Bucket: 'eghiseul-documents-production',
            Key: fileKey,
            Body: buffer,
            ServerSideEncryption: 'aws:kms'
          }).promise();
        });

    } catch (error) {
      await s3.deleteObject({ Bucket: 'eghiseul-documents-production', Key: fileKey }).promise();
      throw new Error('Invalid or corrupt image file');
    }
  }

  // For PDFs: verify structure and scan for malicious content
  if (type.mime === 'application/pdf') {
    // Use pdf-parse to validate PDF structure
    const pdfParse = require('pdf-parse');

    try {
      await pdfParse(fileBuffer.Body);
    } catch (error) {
      await s3.deleteObject({ Bucket: 'eghiseul-documents-production', Key: fileKey }).promise();
      throw new Error('Invalid or corrupt PDF file');
    }
  }

  // Update database to mark file as verified
  await db.files.update({
    where: { key: fileKey },
    data: { verified: true, verifiedAt: new Date() }
  });
}
```

### Virus Scanning

```
Solution 1: ClamAV (Self-hosted)
- Deploy ClamAV daemon in ECS/Lambda
- Scan files after upload via S3 event trigger
- Quarantine infected files in separate bucket
- Alert security team
- Cost: Infrastructure only

Solution 2: AWS Macie (Managed)
- Automated sensitive data discovery
- Detects PII exposure
- Anomaly detection
- Cost: ~$1/GB scanned (can be expensive)

Solution 3: Third-party (CloudOne or similar)
- Specialized file security scanning
- Malware detection
- Content analysis
- Cost: ~$0.01-0.05 per file

Recommendation: Start with ClamAV, upgrade to commercial if volume increases
```

### Document Expiration

```typescript
// Auto-delete temporary documents after expiry

async function scheduleDocumentExpiry(fileKey: string, expiryDays: number): Promise<void> {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);

  await db.files.update({
    where: { key: fileKey },
    data: { expiresAt: expiryDate }
  });
}

// Daily cron job to clean expired files
async function cleanExpiredDocuments(): Promise<void> {
  const expiredFiles = await db.files.findMany({
    where: {
      expiresAt: { lte: new Date() },
      deleted: false
    }
  });

  for (const file of expiredFiles) {
    // Move to archive bucket (optional)
    await s3.copyObject({
      Bucket: 'eghiseul-archive-production',
      CopySource: `eghiseul-documents-production/${file.key}`,
      Key: file.key
    }).promise();

    // Delete from main bucket
    await s3.deleteObject({
      Bucket: 'eghiseul-documents-production',
      Key: file.key
    }).promise();

    // Mark as deleted in database
    await db.files.update({
      where: { id: file.id },
      data: { deleted: true, deletedAt: new Date() }
    });

    // Log deletion
    await auditLog.create({
      action: 'document_expired_deleted',
      fileId: file.id,
      fileKey: file.key,
      expiryDate: file.expiresAt
    });
  }
}

// Document expiry policies:
// - KYC documents for guests: 180 days
// - KYC documents for registered users: 180 days + 5 years (after last use)
// - Final delivered documents: 90 days download access
// - Contracts: 10 years (legal requirement)
// - Temporary uploads: 7 days (if order not completed)
```

---

## Payment Security

### PCI DSS Compliance

```
Compliance Level: SAQ A (Stripe handles all card data)

Stripe handles:
- Card number capture and storage
- PCI DSS compliance
- 3D Secure authentication
- Fraud detection
- Tokenization

Your responsibilities:
- Never log, store, or process card data
- Use Stripe.js for card input (iframe)
- Only store Stripe payment IDs and metadata
- Ensure HTTPS for all Stripe API calls
- Validate webhook signatures
- Implement proper error handling

SAQ A Requirements (simplified):
1. Install and maintain firewall: YES (WAF)
2. Secure passwords: YES (authentication section)
3. Protect stored data: N/A (no card data stored)
4. Encrypt transmission: YES (TLS 1.3)
5. Use antivirus: YES (server/workstation protection)
6. Secure systems: YES (patching, hardening)
7. Restrict data access: YES (RBAC)
8. Unique IDs: YES (per-user authentication)
9. Restrict physical access: YES (AWS datacenter)
10. Track access: YES (audit logs)
11. Test security: YES (pen testing)
12. Maintain security policy: YES (this document)
```

### Stripe Integration Security

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
  maxNetworkRetries: 2,
  timeout: 10000,
});

// Create Payment Intent (server-side only)
async function createPaymentIntent(
  amount: number,
  currency: string,
  orderId: string,
  customerId: string,
  billingDetails: BillingDetails
): Promise<Stripe.PaymentIntent> {

  // Input validation
  if (amount < 50) { // Stripe minimum for RON
    throw new Error('Amount below minimum');
  }
  if (amount > 100000 * 100) { // 100,000 RON
    throw new Error('Amount above maximum, contact support');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount), // in bani (cents for RON)
    currency: currency.toLowerCase(),

    // Metadata for reconciliation
    metadata: {
      order_id: orderId,
      customer_id: customerId,
      environment: process.env.NODE_ENV
    },

    // Customer billing details
    receipt_email: billingDetails.email,

    // Romanian tax ID for invoicing
    payment_method_options: {
      card: {
        // Require 3D Secure for amounts > 30 EUR equivalent (~150 RON)
        request_three_d_secure: amount > 15000 ? 'required' : 'automatic'
      }
    },

    // Fraud detection
    radar_options: {
      session: 'CUSTOMER_SESSION_ID' // from Stripe.js
    },

    // Idempotency key (prevent duplicate charges on retry)
    idempotencyKey: `order-${orderId}`
  });

  // Never log payment intent secret
  logger.info('Payment intent created', {
    paymentIntentId: paymentIntent.id,
    orderId,
    amount
  });

  return paymentIntent;
}

// Webhook handler (verify signatures)
async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body (not JSON parsed)
      sig,
      webhookSecret
    );
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment);
      break;

    case 'charge.dispute.created':
      const dispute = event.data.object as Stripe.Dispute;
      await handleDispute(dispute);
      break;

    default:
      logger.warn('Unhandled webhook event type', { type: event.type });
  }

  res.json({ received: true });
}

// Payment success handler
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata.order_id;

  await db.orders.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'paid',
      paymentId: paymentIntent.id,
      paidAt: new Date(),
      paymentMethod: paymentIntent.payment_method
    }
  });

  // Trigger order processing
  await processOrder(orderId);

  // Send confirmation email
  await sendPaymentConfirmationEmail(orderId);

  // Generate invoice via Olbio
  await generateInvoice(orderId);

  // Audit log
  await auditLog.create({
    action: 'payment_success',
    orderId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount
  });
}
```

### Fraud Prevention

```typescript
// Fraud detection rules

interface FraudCheckResult {
  allowed: boolean;
  reason?: string;
  riskScore: number; // 0-100
}

async function checkFraudRisk(order: Order, paymentIntent: Stripe.PaymentIntent): Promise<FraudCheckResult> {
  let riskScore = 0;

  // Check 1: Velocity checks (multiple orders same email)
  const recentOrders = await db.orders.count({
    where: {
      email: order.email,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24h
    }
  });

  if (recentOrders > 5) {
    riskScore += 30;
  }

  // Check 2: High-risk countries (based on IP)
  const highRiskCountries = ['...'];
  if (highRiskCountries.includes(paymentIntent.charges.data[0]?.billing_details?.address?.country)) {
    riskScore += 20;
  }

  // Check 3: Email domain checks (disposable emails)
  const disposableDomains = ['tempmail.com', 'guerrillamail.com', ...];
  const emailDomain = order.email.split('@')[1];
  if (disposableDomains.includes(emailDomain)) {
    riskScore += 25;
  }

  // Check 4: Mismatched billing and delivery addresses (if provided)
  if (order.deliveryCountry !== paymentIntent.charges.data[0]?.billing_details?.address?.country) {
    riskScore += 15;
  }

  // Check 5: Stripe Radar score
  const radarRisk = paymentIntent.charges.data[0]?.outcome?.risk_level;
  if (radarRisk === 'elevated') riskScore += 20;
  if (radarRisk === 'highest') riskScore += 40;

  // Check 6: Unusual order patterns (e.g., many Cazier Judiciar in short time)
  // ...

  // Decision thresholds
  if (riskScore > 70) {
    return { allowed: false, reason: 'High fraud risk detected', riskScore };
  }

  if (riskScore > 50) {
    // Flag for manual review
    await db.orders.update({
      where: { id: order.id },
      data: { flaggedForReview: true, riskScore }
    });

    // Alert admin
    await sendAdminAlert({
      type: 'fraud_risk',
      orderId: order.id,
      riskScore
    });
  }

  return { allowed: true, riskScore };
}
```

### Refund Security

```typescript
// Secure refund process with approval workflow

async function requestRefund(
  orderId: string,
  amount: number,
  reason: string,
  requestedBy: string,
  approvedBy?: string
): Promise<void> {

  const order = await db.orders.findUnique({ where: { id: orderId } });

  if (!order.paymentId) {
    throw new Error('No payment found for this order');
  }

  // Authorization check
  if (!approvedBy) {
    // Create refund request for approval
    await db.refundRequests.create({
      data: {
        orderId,
        amount,
        reason,
        requestedBy,
        status: 'pending',
        createdAt: new Date()
      }
    });

    // Notify admin for approval
    await sendAdminAlert({
      type: 'refund_request',
      orderId,
      amount,
      reason
    });

    return;
  }

  // Process approved refund
  const refund = await stripe.refunds.create({
    payment_intent: order.paymentId,
    amount, // partial or full
    reason: 'requested_by_customer',
    metadata: {
      order_id: orderId,
      requested_by: requestedBy,
      approved_by: approvedBy
    }
  });

  // Update database
  await db.orders.update({
    where: { id: orderId },
    data: {
      paymentStatus: amount === order.totalAmount ? 'refunded' : 'partially_refunded',
      refundId: refund.id,
      refundedAmount: amount,
      refundedAt: new Date()
    }
  });

  // Send email to customer
  await sendRefundConfirmationEmail(orderId, amount);

  // Audit log
  await auditLog.create({
    action: 'refund_processed',
    orderId,
    refundId: refund.id,
    amount,
    requestedBy,
    approvedBy
  });
}
```

---

## API Security

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Public API rate limits
const publicApiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:public:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 min
  message: 'Prea multe cereri. Încercați din nou mai târziu.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    auditLog.create({
      action: 'rate_limit_exceeded',
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
});

// Authentication endpoints (stricter)
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 min
  skipSuccessfulRequests: true, // only count failed attempts
  message: 'Prea multe încercări de autentificare. Cont blocat temporar.'
});

// Payment endpoints
const paymentLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:payment:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour per IP
  keyGenerator: (req) => {
    // Rate limit by IP + user ID if authenticated
    return req.user ? `${req.ip}-${req.user.id}` : req.ip;
  }
});

// API partner rate limits (per API key)
const apiKeyLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:apikey:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 req/min per API key
  keyGenerator: (req) => {
    const apiKey = req.headers['x-api-key'];
    return apiKey || req.ip;
  },
  skip: (req) => !req.headers['x-api-key'], // only apply to API key requests
  handler: (req, res) => {
    auditLog.create({
      action: 'api_rate_limit_exceeded',
      apiKey: req.headers['x-api-key'],
      ip: req.ip
    });
    res.status(429).json({ error: 'API rate limit exceeded. Upgrade your plan.' });
  }
});

// Apply rate limiters
app.use('/api/public', publicApiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/payment', paymentLimiter);
app.use('/api/v1', apiKeyLimiter);

// DDoS protection: Distributed rate limiting
// Use Cloudflare or AWS WAF for network-level rate limiting
```

### API Key Management

```typescript
import crypto from 'crypto';

// Generate API key
function generateApiKey(): string {
  // Format: egs_live_randomstring (eGhiseul Secret)
  const prefix = process.env.NODE_ENV === 'production' ? 'egs_live_' : 'egs_test_';
  const randomBytes = crypto.randomBytes(32).toString('base64url');
  return prefix + randomBytes;
}

// Hash API key for storage
function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Create API key for partner
async function createApiKey(
  partnerId: string,
  name: string,
  permissions: string[]
): Promise<{ apiKey: string; keyId: string }> {

  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKey(apiKey);

  const keyRecord = await db.apiKeys.create({
    data: {
      partnerId,
      name,
      keyHash: apiKeyHash,
      permissions,
      lastUsedAt: null,
      createdAt: new Date(),
      expiresAt: null // or set expiration
    }
  });

  // IMPORTANT: Only show API key once
  return {
    apiKey, // Show this to partner ONCE
    keyId: keyRecord.id
  };
}

// Validate API key middleware
async function validateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // Check format
  if (!apiKey.startsWith('egs_')) {
    return res.status(401).json({ error: 'Invalid API key format' });
  }

  const apiKeyHash = hashApiKey(apiKey);

  // Lookup in database
  const keyRecord = await db.apiKeys.findUnique({
    where: { keyHash: apiKeyHash },
    include: { partner: true }
  });

  if (!keyRecord) {
    await auditLog.create({
      action: 'invalid_api_key',
      apiKeyPrefix: apiKey.substring(0, 12),
      ip: req.ip
    });
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Check if expired
  if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
    return res.status(401).json({ error: 'API key expired' });
  }

  // Check if revoked
  if (keyRecord.revokedAt) {
    return res.status(401).json({ error: 'API key revoked' });
  }

  // Update last used
  await db.apiKeys.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() }
  });

  // Attach to request
  req.apiKey = keyRecord;
  req.partner = keyRecord.partner;

  next();
}

// Rotate API key
async function rotateApiKey(keyId: string): Promise<{ newApiKey: string }> {
  const oldKey = await db.apiKeys.findUnique({ where: { id: keyId } });

  // Create new key with same permissions
  const { apiKey: newApiKey } = await createApiKey(
    oldKey.partnerId,
    oldKey.name + ' (rotated)',
    oldKey.permissions
  );

  // Revoke old key (with grace period)
  await db.apiKeys.update({
    where: { id: keyId },
    data: {
      revokedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days grace period
    }
  });

  return { newApiKey };
}
```

### Input Validation

```typescript
import { z } from 'zod';
import validator from 'validator';

// CNP validation (Romanian personal ID)
const cnpSchema = z.string().refine((cnp) => {
  if (cnp.length !== 13) return false;
  if (!/^\d{13}$/.test(cnp)) return false;

  // Checksum validation
  const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp[i]) * weights[i];
  }
  const checksum = sum % 11;
  const expectedChecksum = checksum === 10 ? 1 : checksum;

  return parseInt(cnp[12]) === expectedChecksum;
}, 'CNP invalid');

// Order creation schema
const createOrderSchema = z.object({
  serviceId: z.string().uuid(),

  contact: z.object({
    email: z.string().email().transform(val => val.toLowerCase()),
    phone: z.string().refine(val => validator.isMobilePhone(val, 'ro-RO')),
    fullName: z.string().min(3).max(100)
  }),

  data: z.object({
    cnp: cnpSchema,
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    birthPlace: z.string().min(2).max(100),
    fatherName: z.string().min(2).max(100).optional(),
    motherName: z.string().min(2).max(100).optional(),
    address: z.string().min(5).max(200).optional(),
    reason: z.string().min(10).max(500)
  }),

  options: z.object({
    urgency: z.enum(['standard', 'urgent']),
    translation: z.string().length(2).optional(), // ISO 639-1 code
    apostille: z.boolean(),
    apostilleCountry: z.string().length(2).optional() // ISO 3166-1 alpha-2
  }),

  delivery: z.object({
    type: z.enum(['electronic', 'courier_ro', 'post_intl', 'dhl_intl']),
    address: z.string().min(10).max(300).optional(),
    city: z.string().min(2).max(100).optional(),
    country: z.string().length(2).optional(),
    postalCode: z.string().optional()
  }).refine((data) => {
    // Address required for physical delivery
    if (data.type !== 'electronic') {
      return !!data.address && !!data.city && !!data.country;
    }
    return true;
  }),

  billing: z.object({
    type: z.enum(['PF', 'PJ']),
    name: z.string().min(2).max(200),
    taxId: z.string().optional(), // CNP for PF, CUI for PJ
    address: z.string().min(5).max(300)
  })
});

// Validation middleware
function validateRequest(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

// Usage
app.post('/api/orders', validateRequest(createOrderSchema), async (req, res) => {
  // req.body is now validated and type-safe
  const order = await createOrder(req.body);
  res.json(order);
});

// SQL injection prevention (using Prisma ORM)
// Prisma automatically parameterizes queries, preventing SQL injection

// Example of UNSAFE query (DO NOT USE):
// const users = await db.$queryRaw`SELECT * FROM users WHERE email = ${email}`; // UNSAFE!

// Safe query:
const users = await db.user.findMany({
  where: { email: email }
}); // Prisma handles parameterization
```

### CORS Configuration

```typescript
import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests from frontend domains
    const allowedOrigins = [
      'https://eghiseul.ro',
      'https://www.eghiseul.ro',
      'https://admin.eghiseul.ro'
    ];

    // Allow localhost in development
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
    }

    // Allow API partners (check API key)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  credentials: true, // Allow cookies

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-CSRF-Token'
  ],

  exposedHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],

  maxAge: 86400 // 24 hours preflight cache
};

app.use(cors(corsOptions));
```

### Webhook Security

```typescript
// Verify webhook signatures (e.g., from Stripe, Fan Curier)

import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Webhook handler
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  // Stripe uses its own verification
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    auditLog.create({
      action: 'webhook_verification_failed',
      source: 'stripe',
      ip: req.ip
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Process event
  await handleStripeWebhook(event);
  res.json({ received: true });
});

// Generic webhook handler (for other services)
app.post('/webhooks/courier', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['x-signature'] as string;
  const payload = req.body.toString('utf8');

  if (!verifyWebhookSignature(payload, sig, process.env.COURIER_WEBHOOK_SECRET)) {
    auditLog.create({
      action: 'webhook_verification_failed',
      source: 'courier',
      ip: req.ip
    });
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
  const data = JSON.parse(payload);
  await handleCourierWebhook(data);
  res.json({ received: true });
});

// Webhook replay protection
const processedWebhooks = new Set<string>();

async function preventReplay(webhookId: string): Promise<boolean> {
  if (processedWebhooks.has(webhookId)) {
    return false; // Already processed
  }

  // Check in Redis for distributed systems
  const exists = await redis.get(`webhook:${webhookId}`);
  if (exists) {
    return false;
  }

  // Mark as processed (TTL: 24 hours)
  await redis.setex(`webhook:${webhookId}`, 86400, '1');
  processedWebhooks.add(webhookId);

  return true;
}
```

---

## Application Security

### Cross-Site Scripting (XSS) Prevention

```typescript
// Content Security Policy (CSP)
import helmet from 'helmet';

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // For Next.js (unavoidable)
        'https://js.stripe.com', // Stripe.js
        'https://www.googletagmanager.com' // GTM
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // For styled-components
        'https://fonts.googleapis.com'
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com'
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:', // For external images (S3, etc.)
      ],
      connectSrc: [
        "'self'",
        'https://api.stripe.com',
        'https://api.eghiseul.ro'
      ],
      frameSrc: [
        'https://js.stripe.com', // Stripe iframe
        'https://hooks.stripe.com'
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      blockAllMixedContent: []
    }
  })
);

// Output encoding (React automatically escapes)
// But for user-generated content, use additional sanitization

import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
}

// For signature canvas (stored as data URL), validate format
function validateSignatureDataUrl(dataUrl: string): boolean {
  const regex = /^data:image\/(png|jpeg|jpg);base64,/;
  return regex.test(dataUrl);
}

// For rich text (if ever needed), use safe libraries
// - React-Quill with sanitization
// - draft-js with output encoding
```

### Cross-Site Request Forgery (CSRF) Protection

```typescript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());

// CSRF protection middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Apply to state-changing operations
app.post('/api/orders', csrfProtection, async (req, res) => {
  // req.csrfToken() generates token
  // Automatically validates token in request
});

// Send CSRF token to frontend
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Frontend: Include CSRF token in requests
// Example with fetch:
const csrfToken = await fetch('/api/csrf-token').then(r => r.json()).then(d => d.csrfToken);

fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(orderData)
});

// Next.js with next-auth includes CSRF protection by default
```

### Clickjacking Protection

```typescript
// X-Frame-Options header (already in helmet)
app.use(helmet.frameguard({ action: 'deny' }));

// Or allow only same origin
app.use(helmet.frameguard({ action: 'sameorigin' }));

// CSP also prevents clickjacking via frame-ancestors
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      frameAncestors: ["'self'"]
    }
  })
);
```

### File Upload Security

```
Already covered in "File Storage Security" section.

Additional application-level checks:

1. Client-side validation:
   - File type, size before upload
   - Preview before submission
   - Progress indicator

2. Server-side validation:
   - MIME type verification (magic bytes)
   - File size limits
   - Malware scanning
   - EXIF data stripping

3. Upload flow:
   - Generate pre-signed URL
   - Client uploads directly to S3
   - Webhook/event triggers server-side verification
   - Mark file as verified after checks pass

4. Never serve user uploads from main domain
   - Use separate subdomain: docs.eghiseul.ro
   - Or S3 CloudFront distribution
   - Set Content-Disposition: attachment for downloads
```

### Sensitive Data Exposure

```
Prevent accidental PII leaks:

1. API responses:
   - Never include passwords, tokens, secrets
   - Mask CNP, phone numbers in admin UI
   - Use DTOs (Data Transfer Objects) to control response shape

2. Error messages:
   - Generic errors to users: "Ceva nu a funcționat"
   - Detailed errors to logs only
   - Never expose stack traces to frontend

3. Logging:
   - Redact PII before logging
   - Separate security logs from application logs
   - Monitor logs for exposed secrets (AWS Secrets Manager Detector)

4. Database:
   - Encrypt sensitive columns
   - Use views for admin queries (pre-masked data)
   - Audit all direct database access

Example DTO pattern:
```typescript
class OrderResponseDto {
  id: string;
  serviceId: string;
  status: string;
  totalAmount: number;
  createdAt: Date;

  // Masked PII
  customerName: string;
  customerEmail: string;
  maskedCNP: string; // 1******1234

  // Exclude sensitive fields
  static fromOrder(order: Order, isAdmin: boolean = false): OrderResponseDto {
    return {
      id: order.id,
      serviceId: order.serviceId,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      maskedCNP: isAdmin ? order.cnp : maskCNP(order.cnp)
    };
  }
}
```

---

## Infrastructure Security

### Web Application Firewall (WAF)

```
Recommended: AWS WAF or Cloudflare WAF

AWS WAF Configuration:
1. Use AWS Managed Rules:
   - Core rule set (common attacks)
   - Known bad inputs
   - SQL injection rule set
   - Linux/Windows OS rule sets
   - PHP application rule set

2. Rate-based rules:
   - 2000 requests per 5 minutes per IP (general)
   - 100 requests per 5 minutes to /api/auth (login protection)
   - 50 requests per 5 minutes to /api/payment

3. Geo-blocking (optional):
   - Allow: Romania, EU, major diaspora countries
   - Block: Known high-risk countries (if fraud is high)

4. IP reputation lists:
   - Block known malicious IPs
   - Integrate with threat intelligence feeds

5. Custom rules:
   - Block requests with suspicious user agents
   - Block requests with no referrer to sensitive endpoints
   - Require specific headers for admin access

Cost: ~$5/month base + $1 per million requests

Cloudflare (Alternative):
- Easier setup, more affordable
- DDoS protection included
- Bot management
- Caching and CDN
- Cost: Free tier available, Pro at $20/month
```

### DDoS Protection

```
Multi-layer approach:

Layer 3/4 (Network/Transport):
- AWS Shield Standard (free, automatic)
- AWS Shield Advanced ($3000/month, enterprise)
- OR Cloudflare (included in all plans)

Layer 7 (Application):
- WAF rate limiting
- API rate limiting (express-rate-limit)
- Queue heavy operations (Bull/Redis)
- Auto-scaling for burst traffic

Application-level protection:
- Identify and cache static content (CDN)
- Optimize database queries
- Use read replicas for heavy reads
- Implement backpressure (reject requests if overloaded)

Recommendation: Start with Cloudflare Free + AWS Shield Standard
```

### Logging and Monitoring

```
Strategy: Centralized logging with alerting

Logging Stack:
- Application logs: Winston (Node.js) → CloudWatch Logs
- Access logs: nginx → CloudWatch Logs
- Security logs: Separate log group
- Audit logs: Database table + CloudWatch

CloudWatch Configuration:
1. Log groups:
   - /eghiseul/production/application
   - /eghiseul/production/security
   - /eghiseul/production/audit
   - /eghiseul/production/nginx

2. Retention:
   - Security logs: 1 year
   - Application logs: 90 days
   - Access logs: 30 days

3. Metric filters:
   - HTTP 5xx errors > 10 per minute → Alert
   - Failed login attempts > 20 per minute → Alert
   - Payment failures > 5 per minute → Alert
   - New API key created → Notification
   - Refund processed → Notification

4. CloudWatch Alarms:
   - CPU > 80% for 5 minutes
   - Memory > 80% for 5 minutes
   - Disk space < 20%
   - Failed health checks
   - Database connection errors

5. SNS notifications:
   - Email to: security@eghiseul.ro
   - SMS for critical alerts
   - Slack/Discord webhook for team notifications
```

```typescript
// Winston logger configuration
import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'eghiseul-api',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console (local development)
    new winston.transports.Console({
      format: winston.format.simple()
    }),

    // CloudWatch Logs (production)
    new CloudWatchTransport({
      logGroupName: '/eghiseul/production/application',
      logStreamName: () => {
        const date = new Date().toISOString().split('T')[0];
        return `api-${date}`;
      },
      awsRegion: 'eu-central-1',
      retentionInDays: 90
    })
  ]
});

// Security logger (separate)
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'eghiseul-security' },
  transports: [
    new CloudWatchTransport({
      logGroupName: '/eghiseul/production/security',
      logStreamName: 'security-events',
      awsRegion: 'eu-central-1',
      retentionInDays: 365
    })
  ]
});

// Usage
logger.info('Order created', { orderId: 'abc123', amount: 150 });
securityLogger.warn('Failed login attempt', { email: 'user@example.com', ip: '1.2.3.4' });
securityLogger.error('Unauthorized API access', { apiKey: 'egs_***', ip: '1.2.3.4' });
```

### Audit Trail

```typescript
// Comprehensive audit logging

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string; // e.g., 'order_created', 'user_login', 'payment_processed'
  actorId: string; // user or system ID
  actorType: 'user' | 'admin' | 'system' | 'api';
  resourceType: string; // e.g., 'order', 'user', 'payment'
  resourceId: string;
  changes?: any; // JSON diff for updates
  metadata?: any; // Additional context
  ip?: string;
  userAgent?: string;
  success: boolean;
}

class AuditLog {
  static async create(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    // Store in database
    await db.auditLog.create({
      data: {
        ...entry,
        timestamp: new Date()
      }
    });

    // Also send to CloudWatch for real-time monitoring
    securityLogger.info('Audit event', entry);
  }

  static async query(filters: {
    actorId?: string;
    resourceType?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLogEntry[]> {
    return db.auditLog.findMany({
      where: filters,
      orderBy: { timestamp: 'desc' }
    });
  }
}

// Audit important actions
await AuditLog.create({
  action: 'order_created',
  actorId: req.user.id,
  actorType: 'user',
  resourceType: 'order',
  resourceId: order.id,
  metadata: { serviceId: order.serviceId, amount: order.totalAmount },
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  success: true
});

await AuditLog.create({
  action: 'user_deleted',
  actorId: req.admin.id,
  actorType: 'admin',
  resourceType: 'user',
  resourceId: userId,
  changes: { before: oldUser, after: null },
  ip: req.ip,
  success: true
});

// Immutable audit log (append-only)
// Consider using AWS CloudTrail or AWS QLDB for immutable audit trail
```

### Infrastructure as Code (IaC)

```yaml
# Terraform example (AWS infrastructure)

# VPC and networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "eghiseul-vpc"
  }
}

# Security groups
resource "aws_security_group" "api" {
  name        = "eghiseul-api-sg"
  description = "Security group for API servers"
  vpc_id      = aws_vpc.main.id

  # Allow HTTPS from ALB only
  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Allow outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "main" {
  identifier     = "eghiseul-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn

  username = "eghiseul_admin"
  password = random_password.db_password.result

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "eghiseul-db-final-snapshot"

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
}

# S3 bucket for documents
resource "aws_s3_bucket" "documents" {
  bucket = "eghiseul-documents-production"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket = aws_s3_bucket.documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# KMS keys
resource "aws_kms_key" "s3" {
  description             = "KMS key for S3 encryption"
  enable_key_rotation     = true
  deletion_window_in_days = 30
}

# More resources...
```

### Secrets Management

```
DO NOT store secrets in:
- Environment variables in plain text
- Code repositories (.env files)
- Docker images
- Container environment directly

DO store secrets in:
- AWS Secrets Manager (recommended)
- AWS Systems Manager Parameter Store
- HashiCorp Vault

AWS Secrets Manager Setup:
1. Create secrets:
   - eghiseul/production/database (connection string)
   - eghiseul/production/stripe (API keys)
   - eghiseul/production/jwt (signing keys)
   - eghiseul/production/encryption (data encryption keys)

2. Automatic rotation:
   - Database credentials: 30 days
   - API keys: 90 days
   - Encryption keys: 1 year

3. Access control:
   - Grant least privilege to IAM roles
   - API role can read only required secrets
   - Audit all secret access via CloudTrail

4. Application integration:
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'eu-central-1' });

async function getSecret(secretName: string): Promise<any> {
  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );
    return JSON.parse(response.SecretString);
  } catch (error) {
    logger.error('Failed to retrieve secret', { secretName, error });
    throw error;
  }
}

// Load secrets on startup
const secrets = await getSecret('eghiseul/production/app-secrets');
const stripeKey = secrets.STRIPE_SECRET_KEY;
const jwtSecret = secrets.JWT_SECRET;

// Cache secrets in memory (refresh every 1 hour)
```

### Backup and Disaster Recovery

```
Backup Strategy:

1. Database (PostgreSQL):
   - Automated daily backups (AWS RDS)
   - Retention: 7 days
   - Manual snapshots before major changes
   - Cross-region replication (optional, for high availability)
   - Test restore process monthly

2. S3 Documents:
   - Versioning enabled (automatic backup)
   - Cross-region replication to eu-west-1 (Paris)
   - Lifecycle policy to Glacier after 1 year
   - Object lock for contracts (10 years)

3. Application code:
   - Git repository (primary source of truth)
   - GitHub/GitLab automatic backups
   - Docker images in ECR with retention policy

4. Configuration:
   - Infrastructure as Code (Terraform state in S3 with versioning)
   - Secrets in AWS Secrets Manager (automatic backups)

Recovery Time Objective (RTO): 4 hours
Recovery Point Objective (RPO): 1 hour (last automated backup)

Disaster Recovery Plan:
1. Database failure → Restore from latest RDS snapshot
2. S3 bucket deletion → Restore from versioning or cross-region replica
3. Application failure → Redeploy from Docker image
4. Complete region failure → Failover to secondary region (eu-west-1)

Incident Response Team:
- Primary: CTO
- Secondary: Lead Developer
- Escalation: External security consultant

Test DR plan quarterly.
```

---

## Compliance & Auditing

### GDPR Compliance

```
eGhiseul.ro processes personal data of EU residents and must comply with GDPR.

Key Requirements:

1. Lawful Basis for Processing:
   - Contract: Processing necessary to fulfill service (Art. 6.1.b)
   - Legal obligation: 10-year contract retention (Art. 6.1.c)
   - Consent: Marketing communications (Art. 6.1.a)

2. Data Subject Rights:
   - Right to access (Art. 15): Provide all data on request
   - Right to rectification (Art. 16): Allow profile updates
   - Right to erasure (Art. 17): Delete data after retention period
   - Right to data portability (Art. 20): Export data in JSON format
   - Right to object (Art. 21): Opt-out of marketing
   - Right to restrict processing (Art. 18): Pause non-essential processing

3. Data Protection Impact Assessment (DPIA):
   - REQUIRED due to biometric data (selfies) processing
   - Document risks and mitigation measures
   - Review annually or when significant changes occur

4. Data Processing Agreement (DPA):
   - Sign DPA with all processors: Stripe, AWS, Olbio, email provider
   - Ensure processors are GDPR compliant

5. Breach Notification:
   - Notify supervisory authority within 72 hours of breach
   - Notify affected individuals if high risk
   - Maintain breach register

6. Privacy by Design:
   - Data minimization: Only collect what's needed
   - Encryption: Protect data at rest and in transit
   - Access controls: Limit who can access PII
   - Anonymization: Remove PII when possible

7. Privacy Policy:
   - Clear explanation of data processing
   - Contact: DPO or privacy contact
   - Available in Romanian
   - Updated regularly

8. Consent Management:
   - Explicit consent for marketing
   - Easy to withdraw consent
   - Record consent with timestamp and IP

9. Data Transfers:
   - EU to US: Ensure Stripe uses SCCs (Standard Contractual Clauses)
   - AWS: Use EU regions (eu-central-1)
   - International customers: Explicit consent for data transfer
```

Implementation:
```typescript
// GDPR-compliant data export
async function exportUserData(userId: string): Promise<any> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        include: {
          documents: true,
          payments: true
        }
      },
      kycDocuments: true,
      auditLogs: true
    }
  });

  // Exclude internal IDs, replace with human-readable format
  return {
    personal_data: {
      email: user.email,
      name: user.name,
      phone: user.phone,
      created_at: user.createdAt,
    },
    orders: user.orders.map(order => ({
      order_number: order.orderNumber,
      service: order.serviceName,
      status: order.status,
      amount: order.totalAmount,
      date: order.createdAt
    })),
    kyc_documents: user.kycDocuments.map(doc => ({
      type: doc.type,
      uploaded_at: doc.uploadedAt,
      // Do not include document URLs (sensitive)
    })),
    // ... more data
  };
}

// GDPR-compliant data deletion
async function deleteUserData(userId: string): Promise<void> {
  // Check if deletion is allowed (no pending orders, retention period passed)
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { orders: true }
  });

  const hasRecentOrders = user.orders.some(order => {
    const threeeYearsAgo = new Date();
    threeeYearsAgo.setFullYear(threeeYearsAgo.getFullYear() - 3);
    return order.createdAt > threeeYearsAgo;
  });

  if (hasRecentOrders) {
    throw new Error('Cannot delete data during retention period');
  }

  // Anonymize instead of hard delete (preserve transaction history)
  await db.user.update({
    where: { id: userId },
    data: {
      email: `deleted_${userId}@anonymized.local`,
      name: 'DELETED USER',
      phone: null,
      address: null,
      cnp: null,
      deleted: true,
      deletedAt: new Date()
    }
  });

  // Delete KYC documents from S3
  for (const doc of user.kycDocuments) {
    await s3.deleteObject({
      Bucket: 'eghiseul-documents-production',
      Key: doc.fileKey
    }).promise();
  }

  await db.kycDocuments.deleteMany({
    where: { userId }
  });

  // Audit log
  await AuditLog.create({
    action: 'user_data_deleted',
    actorId: userId,
    actorType: 'user',
    resourceType: 'user',
    resourceId: userId,
    success: true
  });
}

// Consent management
async function updateConsent(userId: string, consentType: string, granted: boolean): Promise<void> {
  await db.consent.upsert({
    where: {
      userId_type: {
        userId,
        type: consentType
      }
    },
    create: {
      userId,
      type: consentType,
      granted,
      grantedAt: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    },
    update: {
      granted,
      grantedAt: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }
  });
}
```

### Data Protection Officer (DPO)

```
GDPR requires a DPO if:
- Public authority
- Large-scale systematic monitoring
- Large-scale processing of sensitive data

eGhiseul.ro processes biometric data (selfies) and CNP at scale → DPO RECOMMENDED

DPO Responsibilities:
- Monitor GDPR compliance
- Train staff on data protection
- Conduct audits and DPIAs
- Serve as contact point for data subjects
- Cooperate with supervisory authority

Options:
1. Hire full-time DPO (if company size justifies)
2. Outsource to DPO service provider (~500-1000 EUR/month)
3. Designate internal person with training (if qualified)

Contact: dpo@eghiseul.ro (must be published in privacy policy)
```

### Security Audits

```
Regular security assessments:

1. Code Reviews:
   - Frequency: Every pull request
   - Tools: GitHub Advanced Security, SonarQube
   - Focus: OWASP Top 10, hardcoded secrets, SQL injection

2. Dependency Scanning:
   - Frequency: Continuous (automated)
   - Tools: Dependabot, npm audit, Snyk
   - Action: Update vulnerable dependencies within 7 days (critical) or 30 days (medium)

3. Static Application Security Testing (SAST):
   - Frequency: Every commit (CI/CD)
   - Tools: Semgrep, CodeQL
   - Block deployment if critical vulnerabilities found

4. Dynamic Application Security Testing (DAST):
   - Frequency: Weekly
   - Tools: OWASP ZAP, Burp Suite
   - Test production-like environment

5. Penetration Testing:
   - Frequency: Annually + after major releases
   - Provider: External security firm
   - Scope: Full application, API, infrastructure
   - Cost: ~5,000-15,000 EUR per test

6. Infrastructure Audits:
   - Frequency: Quarterly
   - Review: AWS security groups, IAM policies, S3 permissions
   - Tools: AWS Trusted Advisor, Prowler

7. Compliance Audits:
   - Frequency: Annually
   - Audit: GDPR compliance, data retention, incident response
   - Consider: SOC 2 Type II certification (if B2B grows)
```

### SOC 2 Considerations

```
SOC 2 Type II certification:
- Demonstrates commitment to security
- Required by many enterprise customers
- Focuses on security, availability, confidentiality, privacy

Trust Service Criteria:
1. Security: Access controls, encryption, monitoring
2. Availability: Uptime, disaster recovery
3. Confidentiality: Data protection, NDAs
4. Privacy: GDPR compliance, consent management

Process:
1. Gap analysis (3-6 months)
2. Remediation (6-12 months)
3. Audit (3 months)
4. Annual surveillance audits

Cost: $15,000-$50,000 initially, $10,000-$30,000 annually

Recommendation: Consider SOC 2 when annual revenue > $1M or targeting enterprise B2B clients
```

---

## Incident Response

### Incident Response Plan

```
Phases:

1. Preparation:
   - Define incident response team
   - Document contact information
   - Prepare incident response tools
   - Conduct tabletop exercises quarterly

2. Detection and Analysis:
   - Monitor alerts (CloudWatch, WAF, logs)
   - Classify severity: Critical, High, Medium, Low
   - Determine scope of incident

3. Containment:
   - Isolate affected systems
   - Preserve evidence (logs, snapshots)
   - Block malicious IPs/accounts
   - Revoke compromised credentials

4. Eradication:
   - Remove malware/backdoors
   - Patch vulnerabilities
   - Close security gaps

5. Recovery:
   - Restore from clean backups
   - Verify system integrity
   - Monitor for re-infection
   - Gradually restore services

6. Post-Incident:
   - Document timeline and actions taken
   - Conduct lessons learned meeting
   - Update security controls
   - Notify affected parties (GDPR: 72 hours)
```

### Incident Severity Classification

```
Critical (P0): Immediate response required
- Data breach: CNP, ID documents, biometric data exposed
- Complete service outage
- Ransomware attack
- Database compromised

Response time: 15 minutes
Escalation: Immediate notification to CEO, DPO, legal
Communication: Status updates every 30 minutes

High (P1): Urgent response required
- Payment system failure
- Unauthorized admin access
- Partial service outage
- Failed intrusion attempt

Response time: 1 hour
Escalation: Notification to CTO, lead developer
Communication: Status updates every 2 hours

Medium (P2): Standard response
- Isolated security issue
- Performance degradation
- Non-critical feature failure

Response time: 4 hours
Escalation: Standard on-call process

Low (P3): Routine response
- Informational alerts
- Minor bugs
- Documentation issues

Response time: 1 business day
```

### Data Breach Response

```
Specific procedure for data breaches:

Step 1: Contain (within 1 hour):
- Isolate affected systems
- Revoke exposed credentials
- Block unauthorized access
- Preserve evidence

Step 2: Assess (within 4 hours):
- Determine what data was exposed
- How many individuals affected
- How breach occurred
- Risk to individuals

Step 3: Notify (within 72 hours):
- Romanian supervisory authority: ANSPDCP (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal)
- Affected individuals (if high risk)
- Law enforcement (if criminal activity)

Step 4: Remediate:
- Fix vulnerability
- Enhance security controls
- Update incident response plan

Template breach notification:
```
Subject: Important Security Notice - eGhiseul.ro

Dear [Customer Name],

We are writing to inform you of a security incident that may have affected your personal data.

What happened:
[Description of incident]

What data was affected:
[List of data types]

What we are doing:
- [Containment measures]
- [Security enhancements]
- [Law enforcement involvement]

What you should do:
- [Recommended actions: change password, monitor credit, etc.]

For questions, contact us at: security@eghiseul.ro

We sincerely apologize for this incident and are committed to protecting your data.

Sincerely,
eGhiseul.ro Team
```

### Incident Response Contacts

```
Internal:
- CTO: [name, phone, email]
- Lead Developer: [name, phone, email]
- Operations: [name, phone, email]

External:
- Security Consultant: [company, phone, email]
- Legal Counsel: [firm, phone, email]
- PR Firm: [company, phone, email]
- ANSPDCP (Data Protection Authority): +40 21 252 5599, anspdcp@dataprotection.ro

Tools:
- Communication: Slack emergency channel, Signal group
- Documentation: Google Docs template
- Status Page: status.eghiseul.ro (if customer-facing)
```

---

## Security Checklist

### Pre-Launch Security Checklist

#### Authentication & Authorization
- [ ] 2FA enabled for all admin accounts
- [ ] Magic link authentication implemented and tested
- [ ] Session timeout configured (8 hours admin, 7 days customer)
- [ ] JWT signing keys rotated and stored securely
- [ ] RBAC implemented and permissions tested
- [ ] Password policy enforced (if using passwords)
- [ ] Account lockout after failed attempts
- [ ] Audit logging for all authentication events

#### Data Protection
- [ ] AES-256-GCM encryption for sensitive fields
- [ ] KMS or Vault configured for key management
- [ ] TLS 1.3 enforced for all connections
- [ ] Database connections use SSL/TLS
- [ ] HSTS header configured
- [ ] Data retention policies implemented
- [ ] Automated data deletion jobs scheduled
- [ ] PII masking in admin UI
- [ ] No secrets in code or environment variables
- [ ] Secrets stored in AWS Secrets Manager

#### File Storage
- [ ] S3 bucket public access blocked
- [ ] S3 default encryption enabled (SSE-KMS)
- [ ] S3 versioning enabled
- [ ] Pre-signed URLs with short expiration (5 min upload, 1 hour download)
- [ ] File upload validation (client + server)
- [ ] MIME type verification (magic bytes)
- [ ] File size limits enforced
- [ ] Virus scanning configured (ClamAV or commercial)
- [ ] EXIF data stripped from images
- [ ] Cross-region replication for critical documents
- [ ] Lifecycle policies configured

#### Payment Security
- [ ] Stripe integration uses Stripe.js (no card data touches server)
- [ ] 3D Secure required for payments > 150 RON
- [ ] Webhook signature verification implemented
- [ ] Payment failure fraud checks in place
- [ ] Idempotency keys used to prevent duplicate charges
- [ ] PCI DSS SAQ A completed
- [ ] Stripe test mode tested thoroughly
- [ ] Refund approval workflow implemented

#### API Security
- [ ] Rate limiting configured (per IP, per API key)
- [ ] API key authentication implemented
- [ ] API keys hashed in database
- [ ] Input validation on all endpoints (Zod schemas)
- [ ] SQL injection prevention (parameterized queries/ORM)
- [ ] CORS configured correctly
- [ ] Webhook replay protection
- [ ] API documentation does not expose secrets
- [ ] API error messages do not leak sensitive info

#### Application Security
- [ ] Content Security Policy (CSP) configured
- [ ] CSRF protection enabled for state-changing operations
- [ ] XSS prevention (output encoding, DOMPurify)
- [ ] Clickjacking protection (X-Frame-Options)
- [ ] Security headers configured (Helmet.js)
- [ ] No sensitive data in frontend code
- [ ] Error messages are generic (no stack traces to users)
- [ ] Logging does not include PII
- [ ] Dependencies scanned for vulnerabilities (npm audit)
- [ ] No hardcoded credentials or API keys

#### Infrastructure Security
- [ ] WAF configured (AWS WAF or Cloudflare)
- [ ] DDoS protection enabled (Shield + Cloudflare)
- [ ] Security groups restrict access (least privilege)
- [ ] Database not publicly accessible
- [ ] SSH access restricted to bastion host or VPN
- [ ] Auto-scaling configured for traffic spikes
- [ ] CloudWatch alarms configured
- [ ] Centralized logging (CloudWatch Logs)
- [ ] Audit trail for all security events
- [ ] Backup and restore tested
- [ ] Disaster recovery plan documented

#### Compliance
- [ ] Privacy policy published and GDPR-compliant
- [ ] Terms of service published
- [ ] Cookie consent banner (if using analytics)
- [ ] GDPR data export functionality
- [ ] GDPR data deletion functionality
- [ ] Consent management implemented
- [ ] DPO designated and contact published
- [ ] DPIA conducted (biometric data processing)
- [ ] Data processing agreements signed with processors
- [ ] Breach notification procedure documented
- [ ] Incident response plan documented and tested

#### Monitoring & Alerting
- [ ] Failed login attempts monitored
- [ ] Payment failures monitored
- [ ] API rate limit exceeded alerts
- [ ] 5xx error alerts
- [ ] Database connection error alerts
- [ ] Certificate expiry monitoring (14 days before)
- [ ] Disk space alerts
- [ ] Memory/CPU alerts
- [ ] Security event alerts (unauthorized access, privilege escalation)

#### Testing
- [ ] Penetration testing completed
- [ ] DAST scan completed (OWASP ZAP)
- [ ] SAST integrated in CI/CD (Semgrep, CodeQL)
- [ ] Dependency scanning automated (Dependabot, Snyk)
- [ ] Load testing completed
- [ ] Disaster recovery plan tested
- [ ] Incident response tabletop exercise conducted

### Ongoing Security Checklist (Monthly)

- [ ] Review access logs for anomalies
- [ ] Review audit logs for suspicious activity
- [ ] Rotate JWT signing keys (every 90 days)
- [ ] Review and update dependencies
- [ ] Review IAM policies and permissions
- [ ] Review S3 bucket policies
- [ ] Test backup restore process
- [ ] Review CloudWatch alarms and logs
- [ ] Review rate limiting effectiveness
- [ ] Check for exposed secrets (git-secrets, TruffleHog)

### Quarterly Security Checklist

- [ ] Conduct security training for team
- [ ] Review and update security policies
- [ ] Conduct infrastructure security audit (AWS Trusted Advisor, Prowler)
- [ ] Review third-party integrations (Stripe, Olbio, etc.)
- [ ] Test disaster recovery plan
- [ ] Review GDPR compliance (data retention, consent, etc.)
- [ ] Conduct vulnerability scan (DAST)

### Annual Security Checklist

- [ ] Conduct external penetration testing
- [ ] Review and update incident response plan
- [ ] Review and update business continuity plan
- [ ] Conduct GDPR compliance audit
- [ ] Review data processing agreements with processors
- [ ] Update DPIA if significant changes
- [ ] Review and update privacy policy
- [ ] SOC 2 audit (if applicable)

---

## Recommended Security Tools

### Development
- **Dependency Scanning**: Snyk, Dependabot, npm audit
- **SAST**: Semgrep, CodeQL, SonarQube
- **Secrets Detection**: git-secrets, TruffleHog, GitHub Advanced Security
- **Code Review**: GitHub, GitLab with security scanning

### Testing
- **DAST**: OWASP ZAP, Burp Suite Professional
- **Penetration Testing**: External security firm (annual)
- **Load Testing**: k6, Artillery
- **API Testing**: Postman with security checks

### Monitoring & Logging
- **Logging**: Winston, CloudWatch Logs
- **Monitoring**: CloudWatch, Datadog, New Relic
- **Alerting**: CloudWatch Alarms, PagerDuty
- **APM**: Sentry (error tracking), Datadog

### Infrastructure
- **WAF**: AWS WAF, Cloudflare
- **DDoS**: AWS Shield, Cloudflare
- **CDN**: CloudFront, Cloudflare
- **Secrets**: AWS Secrets Manager, HashiCorp Vault
- **IaC**: Terraform, AWS CloudFormation

### Compliance
- **GDPR**: OneTrust, TrustArc (consent management)
- **Security Audits**: External firms (annual pen testing)
- **SOC 2**: Vanta, Drata (compliance automation)

---

## Conclusion

This security architecture provides comprehensive protection for eGhiseul.ro's sensitive data processing operations. Implementation should be phased:

**Phase 1 (Pre-Launch)**: Critical security controls
- Authentication, encryption, secure file storage, payment security

**Phase 2 (First 3 months)**: Enhanced monitoring and compliance
- Advanced logging, audit trails, GDPR compliance features

**Phase 3 (Ongoing)**: Continuous improvement
- Regular audits, penetration testing, SOC 2 preparation

**Estimated Costs**:
- Infrastructure security (WAF, monitoring): ~$200-500/month
- Secrets management (AWS Secrets Manager): ~$1-5/month
- Penetration testing: ~$5,000-15,000/year
- SOC 2 (optional): ~$15,000-50,000 initially, $10,000-30,000/year
- Security tools (Snyk, Sentry): ~$100-300/month

**Security is not a one-time project but an ongoing commitment.** Regular reviews, updates, and training are essential to maintain a strong security posture as the platform grows.

---

**Document Owner**: CTO
**Last Reviewed**: 2025-12-15
**Next Review**: 2026-03-15 (quarterly)
**Classification**: Internal - Security Sensitive

For questions or to report security issues: security@eghiseul.ro
