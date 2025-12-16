# Security Implementation Checklist - eGhiseul.ro

**Quick Reference Guide for Development Team**

## Priority Matrix

| Priority | Scope | Timeline |
|----------|-------|----------|
| **P0 - Critical** | Must have before launch | Blocking |
| **P1 - High** | Should have in first month | Important |
| **P2 - Medium** | Nice to have in first quarter | Recommended |
| **P3 - Low** | Future enhancement | Optional |

---

## 1. Authentication & Authorization

### Admin Authentication (P0)
- [ ] Implement 2FA using TOTP (speakeasy library)
  - Generate QR code for initial setup
  - Store encrypted secret in database
  - Provide 10 backup codes
  - Enforce 2FA within 7 days of account creation
- [ ] Session management with JWT
  - Use RS256 algorithm (asymmetric)
  - httpOnly, secure, SameSite=Strict cookies
  - 8-hour inactivity timeout
  - 24-hour absolute timeout
- [ ] Failed login protection
  - Lock account after 5 failed attempts
  - 15-minute lockout period
  - CAPTCHA after 2 failed attempts
  - Email notification on lockout
- [ ] Audit logging for all admin actions
  - Login/logout events
  - Permission changes
  - Sensitive operations (refunds, deletions)

**Libraries**:
- `speakeasy` (TOTP)
- `qrcode` (QR generation)
- `jsonwebtoken` (JWT)

**Code example**:
```typescript
// Admin 2FA middleware
async function require2FA(req, res, next) {
  const { token } = req.body;
  const user = req.user;

  const verified = speakeasy.totp.verify({
    secret: decrypt(user.totpSecret),
    encoding: 'base32',
    token: token,
    window: 1
  });

  if (!verified) {
    await auditLog('2fa_failed', user.id);
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }

  next();
}
```

---

### Customer Authentication (P0)
- [ ] Magic link authentication
  - Generate secure token (32 bytes)
  - Store hashed token with 15-minute expiry
  - Single-use tokens
  - Rate limit: 3 requests per 15 min per email
- [ ] Optional password authentication
  - Bcrypt with cost factor 12+
  - Password strength meter (zxcvbn)
  - Minimum 12 characters
  - Account lockout after 5 attempts
- [ ] Session management
  - 7-day session with "Remember me"
  - 24-hour session without
  - Secure cookie storage

**Libraries**:
- `bcrypt` (password hashing)
- `zxcvbn` (password strength)
- `crypto` (token generation)

**Code example**:
```typescript
// Magic link generation
function generateMagicLink(email: string): string {
  const token = crypto.randomBytes(32).toString('base64url');
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  await db.magicLinks.create({
    email,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  });

  return `https://eghiseul.ro/auth/verify?token=${token}`;
}
```

---

### RBAC Implementation (P0)
- [ ] Define roles: super_admin, admin, operator, customer, api_partner
- [ ] Create permission matrix
- [ ] Implement permission middleware
- [ ] Test all role combinations

**Code example**:
```typescript
const permissions = {
  admin: ['orders:*', 'users:read', 'reports:*'],
  operator: ['orders:read', 'orders:update_status'],
  customer: ['orders:read_own', 'orders:create']
};

function requirePermission(permission: string) {
  return (req, res, next) => {
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

---

## 2. Data Protection

### Encryption at Rest (P0)
- [ ] Identify fields requiring encryption
  - CNP, ID numbers, phone, addresses, signatures
- [ ] Set up AWS KMS
  - Create Customer Master Key (CMK)
  - Enable automatic rotation
  - Configure IAM policies
- [ ] Implement encryption/decryption functions
  - Algorithm: AES-256-GCM
  - Generate unique IV per encryption
  - Store IV + tag + ciphertext
- [ ] Encrypt existing data (migration script)

**Libraries**:
- `crypto` (Node.js built-in)
- `@aws-sdk/client-kms` (AWS KMS)

**Code example**:
```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function encrypt(plaintext: string, key: Buffer): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return iv.toString('hex') + tag.toString('hex') + encrypted;
}

function decrypt(ciphertext: string, key: Buffer): string {
  const iv = Buffer.from(ciphertext.slice(0, 32), 'hex');
  const tag = Buffer.from(ciphertext.slice(32, 64), 'hex');
  const encrypted = ciphertext.slice(64);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

---

### Encryption in Transit (P0)
- [ ] TLS 1.3 configuration (TLS 1.2 minimum)
- [ ] Let's Encrypt certificate setup
  - Automated renewal with certbot
  - Monitor expiry (alert 14 days before)
- [ ] HSTS header
  - max-age=31536000
  - includeSubDomains
  - preload
- [ ] Redirect HTTP to HTTPS
- [ ] Test SSL configuration (SSLLabs)

**nginx configuration**:
```nginx
server {
    listen 443 ssl http2;
    server_name eghiseul.ro;

    ssl_certificate /etc/letsencrypt/live/eghiseul.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eghiseul.ro/privkey.pem;
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

---

### Data Retention & Deletion (P0)
- [ ] Implement retention policies
  - Contracts: 10 years
  - KYC: 180 days (active) + 5 years
  - Orders: 7 years
  - Logs: 1 year
- [ ] Scheduled deletion jobs (daily cron)
- [ ] GDPR data export functionality
- [ ] GDPR data deletion (anonymization)

**Code example**:
```typescript
// Daily cron job
async function cleanExpiredData() {
  // Delete expired KYC documents
  const expiredKYC = await db.kycDocuments.findMany({
    where: {
      expiresAt: { lte: new Date() }
    }
  });

  for (const doc of expiredKYC) {
    await s3.deleteObject({
      Bucket: 'eghiseul-documents-production',
      Key: doc.fileKey
    }).promise();

    await db.kycDocuments.delete({ where: { id: doc.id } });
    await auditLog('kyc_expired_deleted', doc.id);
  }

  // Anonymize old orders (>3 years)
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  await db.orders.updateMany({
    where: {
      createdAt: { lte: threeYearsAgo },
      anonymized: false
    },
    data: {
      cnp: null,
      phone: null,
      address: null,
      anonymized: true
    }
  });
}
```

---

## 3. File Storage Security

### S3 Bucket Configuration (P0)
- [ ] Block all public access
- [ ] Enable default encryption (SSE-KMS)
- [ ] Enable versioning
- [ ] Configure lifecycle policies
  - KYC → Glacier after 180 days → Delete after 5 years
  - Contracts → Glacier after 1 year → Delete after 10 years
- [ ] Set up access logging
- [ ] Configure CORS (restrict to eghiseul.ro)

**AWS CLI commands**:
```bash
# Block public access
aws s3api put-public-access-block \
  --bucket eghiseul-documents-production \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket eghiseul-documents-production \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms","KMSMasterKeyID":"alias/eghiseul-documents-key"}}]}'

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket eghiseul-documents-production \
  --versioning-configuration Status=Enabled
```

---

### Pre-Signed URLs (P0)
- [ ] Implement upload URL generation (5 min expiry)
- [ ] Implement download URL generation (1 hour expiry)
- [ ] Authorization checks before URL generation
- [ ] Audit logging for all URL generations

**Code example**:
```typescript
async function generateUploadUrl(
  orderId: string,
  documentType: string,
  fileType: string
): Promise<{ uploadUrl: string; fileKey: string }> {

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(fileType)) {
    throw new Error('Invalid file type');
  }

  const fileKey = `uploads/${orderId}/${documentType}/${Date.now()}-${crypto.randomUUID()}`;

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: 'eghiseul-documents-production',
    Key: fileKey,
    Expires: 300, // 5 minutes
    ContentType: fileType,
    ServerSideEncryption: 'aws:kms'
  });

  await auditLog('upload_url_generated', { orderId, fileKey });

  return { uploadUrl, fileKey };
}
```

---

### File Upload Validation (P0)
- [ ] Client-side validation
  - File type (MIME)
  - File size (max 10 MB)
  - Minimum size (1 KB)
- [ ] Server-side validation
  - Magic bytes verification (file-type library)
  - Image integrity check (sharp)
  - PDF structure validation (pdf-parse)
  - EXIF data stripping
- [ ] Virus scanning (ClamAV or commercial)

**Code example**:
```typescript
import fileType from 'file-type';
import sharp from 'sharp';

async function verifyUploadedFile(fileKey: string): Promise<void> {
  const fileBuffer = await s3.getObject({
    Bucket: 'eghiseul-documents-production',
    Key: fileKey
  }).promise();

  // Verify MIME type (magic bytes)
  const type = await fileType.fromBuffer(fileBuffer.Body as Buffer);
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];

  if (!type || !allowedMimes.includes(type.mime)) {
    await s3.deleteObject({ Bucket: 'eghiseul-documents-production', Key: fileKey }).promise();
    throw new Error('Invalid file type');
  }

  // For images: strip EXIF and verify integrity
  if (type.mime.startsWith('image/')) {
    const sanitized = await sharp(fileBuffer.Body as Buffer)
      .rotate()
      .withMetadata({ exif: {} })
      .toBuffer();

    await s3.putObject({
      Bucket: 'eghiseul-documents-production',
      Key: fileKey,
      Body: sanitized,
      ServerSideEncryption: 'aws:kms'
    }).promise();
  }

  await db.files.update({
    where: { key: fileKey },
    data: { verified: true }
  });
}
```

---

## 4. Payment Security

### Stripe Integration (P0)
- [ ] Use Stripe.js for card input (never touch card data)
- [ ] Implement PaymentIntent flow
- [ ] Require 3D Secure for amounts > 150 RON
- [ ] Webhook signature verification
- [ ] Idempotency keys to prevent duplicate charges
- [ ] Fraud detection checks
- [ ] Test mode thoroughly before production

**Code example**:
```typescript
async function createPaymentIntent(
  amount: number,
  orderId: string
): Promise<Stripe.PaymentIntent> {

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // in bani
    currency: 'ron',

    metadata: { order_id: orderId },

    payment_method_options: {
      card: {
        request_three_d_secure: amount > 150 ? 'required' : 'automatic'
      }
    },

    idempotencyKey: `order-${orderId}`
  });

  return paymentIntent;
}

// Webhook handler
async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    await handlePaymentSuccess(event.data.object);
  }

  res.json({ received: true });
}
```

---

### Fraud Prevention (P1)
- [ ] Velocity checks (max 5 orders per 24h per email)
- [ ] Disposable email detection
- [ ] Stripe Radar integration
- [ ] Manual review flags for high-risk orders
  - Risk score > 50: flag for review
  - Risk score > 70: block

**Code example**:
```typescript
async function checkFraudRisk(order: Order): Promise<number> {
  let riskScore = 0;

  // Check 1: Multiple recent orders
  const recentOrders = await db.orders.count({
    where: {
      email: order.email,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  });
  if (recentOrders > 5) riskScore += 30;

  // Check 2: Disposable email
  const disposableDomains = ['tempmail.com', 'guerrillamail.com'];
  const emailDomain = order.email.split('@')[1];
  if (disposableDomains.includes(emailDomain)) riskScore += 25;

  // Check 3: Stripe Radar
  const radarRisk = order.paymentIntent.charges.data[0]?.outcome?.risk_level;
  if (radarRisk === 'elevated') riskScore += 20;
  if (radarRisk === 'highest') riskScore += 40;

  if (riskScore > 50) {
    await db.orders.update({
      where: { id: order.id },
      data: { flaggedForReview: true, riskScore }
    });
  }

  return riskScore;
}
```

---

## 5. API Security

### Rate Limiting (P0)
- [ ] Public API: 100 req / 15 min per IP
- [ ] Auth endpoints: 5 req / 15 min per IP
- [ ] Payment: 10 req / hour per IP
- [ ] API keys: 60 req / min per key
- [ ] Use Redis for distributed rate limiting

**Code example**:
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const redis = new Redis(process.env.REDIS_URL);

const publicApiLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:public:' }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Prea multe cereri. Încercați din nou mai târziu.'
});

const authLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:auth:' }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});

app.use('/api/public', publicApiLimiter);
app.use('/api/auth', authLimiter);
```

---

### Input Validation (P0)
- [ ] Implement Zod schemas for all endpoints
- [ ] CNP validation (checksum algorithm)
- [ ] Email validation
- [ ] Phone number validation (Romanian format)
- [ ] Sanitize all inputs
- [ ] Parameterized database queries (Prisma ORM)

**Code example**:
```typescript
import { z } from 'zod';

// CNP validation
const cnpSchema = z.string().refine((cnp) => {
  if (cnp.length !== 13 || !/^\d{13}$/.test(cnp)) return false;

  const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp[i]) * weights[i];
  }
  const checksum = sum % 11;
  const expected = checksum === 10 ? 1 : checksum;

  return parseInt(cnp[12]) === expected;
}, 'CNP invalid');

// Order schema
const createOrderSchema = z.object({
  contact: z.object({
    email: z.string().email(),
    phone: z.string().regex(/^(\+40|0)[0-9]{9}$/),
    fullName: z.string().min(3).max(100)
  }),
  data: z.object({
    cnp: cnpSchema,
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    // ...
  })
});

// Middleware
function validateRequest(schema: z.ZodSchema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    }
  };
}
```

---

### CORS Configuration (P0)
- [ ] Restrict origins to eghiseul.ro domains
- [ ] Allow credentials (cookies)
- [ ] Whitelist methods and headers
- [ ] 24-hour preflight cache

**Code example**:
```typescript
import cors from 'cors';

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://eghiseul.ro',
      'https://www.eghiseul.ro',
      'https://admin.eghiseul.ro'
    ];

    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push('http://localhost:3000');
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  maxAge: 86400
};

app.use(cors(corsOptions));
```

---

### API Key Management (P1)
- [ ] Generate cryptographically secure keys
- [ ] Hash keys before storage (SHA-256)
- [ ] Per-key rate limiting
- [ ] Key rotation functionality
- [ ] Audit all API key usage

**Code example**:
```typescript
function generateApiKey(): string {
  const prefix = process.env.NODE_ENV === 'production' ? 'egs_live_' : 'egs_test_';
  const random = crypto.randomBytes(32).toString('base64url');
  return prefix + random;
}

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key required' });

  const hash = hashApiKey(apiKey);
  const keyRecord = await db.apiKeys.findUnique({ where: { keyHash: hash } });

  if (!keyRecord || keyRecord.revokedAt) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.apiKey = keyRecord;
  next();
}
```

---

## 6. Application Security

### XSS Prevention (P0)
- [ ] Content Security Policy (CSP)
- [ ] Output encoding (React does this automatically)
- [ ] Sanitize user-generated content (DOMPurify)
- [ ] Validate signature canvas data URLs

**Code example**:
```typescript
import helmet from 'helmet';

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["https://js.stripe.com"],
      objectSrc: ["'none'"]
    }
  })
);
```

---

### CSRF Protection (P0)
- [ ] Enable CSRF tokens for state-changing operations
- [ ] Use SameSite=Strict cookies
- [ ] Validate CSRF token on POST/PUT/DELETE

**Code example**:
```typescript
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

app.post('/api/orders', csrfProtection, async (req, res) => {
  // CSRF token automatically validated
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

---

### Security Headers (P0)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] HSTS
- [ ] CSP

**Code example**:
```typescript
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
```

---

## 7. Infrastructure Security

### AWS WAF (P0)
- [ ] Enable AWS Managed Rules
  - Core rule set
  - Known bad inputs
  - SQL injection
- [ ] Configure rate-based rules
  - 2000 req / 5 min (general)
  - 100 req / 5 min to /api/auth
- [ ] IP reputation lists
- [ ] Geo-blocking (if needed)

**Terraform example**:
```hcl
resource "aws_wafv2_web_acl" "main" {
  name  = "eghiseul-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimitRule"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "RateLimitRule"
      sampled_requests_enabled  = true
    }
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled  = true
    }
  }
}
```

---

### Cloudflare (Alternative to AWS WAF) (P0)
- [ ] Point DNS to Cloudflare
- [ ] Enable proxy (orange cloud)
- [ ] Configure security level: High
- [ ] Enable Bot Fight Mode
- [ ] Configure rate limiting rules
- [ ] Enable DDoS protection (automatic)

**Benefits**:
- Easier setup than AWS WAF
- Cheaper ($0-20/month vs $5+/month)
- Better DDoS protection
- CDN included

---

### Logging & Monitoring (P0)
- [ ] CloudWatch Logs for all services
- [ ] Separate log groups: application, security, audit
- [ ] Retention: 1 year (security), 90 days (application)
- [ ] CloudWatch Alarms
  - HTTP 5xx > 10/min
  - Failed logins > 20/min
  - CPU > 80%
  - Memory > 80%
- [ ] SNS notifications to security@eghiseul.ro

**Code example**:
```typescript
import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new CloudWatchTransport({
      logGroupName: '/eghiseul/production/application',
      logStreamName: () => `api-${new Date().toISOString().split('T')[0]}`,
      awsRegion: 'eu-central-1'
    })
  ]
});

// Usage
logger.info('Order created', { orderId: 'abc123' });
logger.error('Payment failed', { orderId: 'abc123', error: err.message });
```

---

### Secrets Management (P0)
- [ ] Move all secrets to AWS Secrets Manager
  - Database credentials
  - Stripe API keys
  - JWT signing keys
  - Encryption keys
- [ ] Never commit secrets to Git
- [ ] Rotate secrets regularly (90 days)
- [ ] Audit secret access via CloudTrail

**Code example**:
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'eu-central-1' });

async function getSecret(secretName: string): Promise<any> {
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  return JSON.parse(response.SecretString);
}

// Load on startup
const secrets = await getSecret('eghiseul/production/app-secrets');
process.env.STRIPE_SECRET_KEY = secrets.STRIPE_SECRET_KEY;
```

---

### Backup & DR (P0)
- [ ] Enable RDS automated backups (7 days retention)
- [ ] S3 versioning (already done)
- [ ] S3 cross-region replication (to eu-west-1)
- [ ] Test restore process monthly
- [ ] Document disaster recovery plan
  - RTO: 4 hours
  - RPO: 1 hour

---

## 8. Compliance

### GDPR (P0)
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent banner
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Consent management
- [ ] Designate DPO (dpo@eghiseul.ro)
- [ ] Conduct DPIA (biometric data)
- [ ] Sign DPAs with processors (Stripe, AWS, Olbio)
- [ ] Breach notification procedure documented

**Code example**:
```typescript
// Data export
async function exportUserData(userId: string): Promise<any> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { orders: true, kycDocuments: true }
  });

  return {
    personal_data: {
      email: user.email,
      name: user.name,
      phone: user.phone
    },
    orders: user.orders.map(o => ({
      order_number: o.orderNumber,
      service: o.serviceName,
      amount: o.totalAmount
    }))
  };
}

// Data deletion (anonymization)
async function deleteUserData(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      email: `deleted_${userId}@anonymized.local`,
      name: 'DELETED USER',
      phone: null,
      cnp: null,
      deleted: true
    }
  });
}
```

---

### Audit Trail (P0)
- [ ] Log all security events
  - Login/logout
  - Permission changes
  - Data access
  - Refunds
  - Deletions
- [ ] Store audit logs in database + CloudWatch
- [ ] Retention: 1 year minimum
- [ ] Immutable (append-only)

**Code example**:
```typescript
interface AuditLogEntry {
  action: string;
  actorId: string;
  actorType: 'user' | 'admin' | 'system';
  resourceType: string;
  resourceId: string;
  ip?: string;
  success: boolean;
}

async function auditLog(entry: AuditLogEntry): Promise<void> {
  await db.auditLog.create({ data: { ...entry, timestamp: new Date() } });
  securityLogger.info('Audit event', entry);
}
```

---

## 9. Testing & Monitoring

### Security Testing (P0)
- [ ] Dependency scanning (npm audit, Snyk)
- [ ] SAST in CI/CD (Semgrep, CodeQL)
- [ ] DAST scan (OWASP ZAP) - weekly
- [ ] Penetration testing - annually
- [ ] SSL/TLS testing (SSLLabs) - quarterly

---

### Ongoing Monitoring (P0)
- [ ] Failed login attempts
- [ ] Payment failures
- [ ] API rate limit exceeded
- [ ] 5xx errors
- [ ] Certificate expiry
- [ ] Disk space
- [ ] CPU/Memory

---

## 10. Incident Response

### Incident Response Plan (P0)
- [ ] Define incident response team
  - CTO, Lead Developer, DPO
- [ ] Document contact information
- [ ] Define severity levels (P0-P3)
- [ ] Data breach notification process
  - Romanian DPA (ANSPDCP): anspdcp@dataprotection.ro
  - 72-hour notification requirement
- [ ] Conduct tabletop exercises quarterly

**Incident Response Phases**:
1. **Detection**: Monitor alerts
2. **Containment**: Isolate systems, block access
3. **Eradication**: Remove threat, patch vulnerabilities
4. **Recovery**: Restore from backups, monitor
5. **Post-Incident**: Document, lessons learned

---

## Priority Implementation Timeline

### Week 1-2: Critical Security (P0)
- [ ] Authentication (2FA, magic links, session management)
- [ ] TLS/HTTPS setup
- [ ] S3 bucket hardening
- [ ] Input validation
- [ ] Rate limiting

### Week 3-4: Data Protection (P0)
- [ ] Encryption at rest (KMS setup)
- [ ] Pre-signed URLs
- [ ] File upload validation
- [ ] Stripe integration
- [ ] Security headers

### Month 2: Enhanced Security (P1)
- [ ] WAF configuration
- [ ] Logging and monitoring
- [ ] Audit trail
- [ ] GDPR compliance features
- [ ] Fraud detection

### Month 3: Compliance & Testing (P1)
- [ ] DPIA
- [ ] Privacy policy
- [ ] DPO designation
- [ ] Penetration testing
- [ ] Incident response plan

---

## Estimated Costs

| Item | Cost (Monthly) | Priority |
|------|----------------|----------|
| AWS WAF | $5-20 | P0 |
| Cloudflare Pro (alternative) | $20 | P0 |
| AWS Secrets Manager | $1-5 | P0 |
| CloudWatch Logs | $10-50 | P0 |
| Snyk (dependency scanning) | $0-100 | P1 |
| Sentry (error tracking) | $0-30 | P1 |
| **Total Monthly** | **~$50-200** | |
| | | |
| Penetration Testing | $5,000-15,000 | P0 (annual) |
| SOC 2 (optional) | $15,000-50,000 | P2 (initial) |

---

## Resources

### Documentation
- Main document: `/docs/security-architecture.md`
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- GDPR: https://gdpr.eu/
- Stripe Security: https://stripe.com/docs/security

### Tools
- **SAST**: Semgrep, CodeQL, SonarQube
- **DAST**: OWASP ZAP, Burp Suite
- **Dependency**: Snyk, npm audit, Dependabot
- **Secrets**: AWS Secrets Manager, HashiCorp Vault
- **Monitoring**: CloudWatch, Datadog, Sentry

### Contact
- **Security Issues**: security@eghiseul.ro
- **DPO**: dpo@eghiseul.ro
- **Romanian DPA**: anspdcp@dataprotection.ro

---

**Last Updated**: 2025-12-15
**Review Schedule**: Monthly
**Owner**: CTO
