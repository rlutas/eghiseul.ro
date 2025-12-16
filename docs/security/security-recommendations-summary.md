# Security Recommendations Summary - eGhiseul.ro

**Executive Summary for Quick Decision Making**

## Critical Security Decisions

### 1. Authentication Strategy

**Recommendation: Magic Links + Optional 2FA**

**For Customers:**
- Primary: Magic link authentication (passwordless)
- Alternative: Password with bcrypt (cost factor 12+)
- Session: 7 days with "remember me", 24 hours without

**For Admins:**
- REQUIRED: 2FA using TOTP (Google Authenticator, Authy)
- Session: 8-hour inactivity timeout, 24-hour absolute
- Backup codes: 10 single-use codes

**Why:**
- Magic links reduce credential stuffing attacks
- No password management overhead for customers
- 2FA protects high-privilege accounts
- Mobile-friendly for diaspora users

**Libraries:** `speakeasy`, `jsonwebtoken`, `bcrypt`, `next-auth`

---

### 2. Data Encryption

**Recommendation: AES-256-GCM + AWS KMS**

**Encryption at Rest:**
- Algorithm: AES-256-GCM (authenticated encryption)
- Key Management: AWS KMS with automatic rotation
- Encrypted Fields: CNP, ID numbers, phone, addresses, signatures

**Encryption in Transit:**
- TLS 1.3 (minimum TLS 1.2)
- HSTS with preload
- Let's Encrypt certificates (auto-renew)

**Database:**
- PostgreSQL with SSL connections
- Application-level encryption for sensitive fields
- RDS encryption enabled

**Why:**
- Industry standard for sensitive data
- AWS KMS handles key rotation automatically
- GDPR compliance requirement
- Protects against data breaches

**Cost:** ~$1-5/month (AWS KMS)

---

### 3. File Storage

**Recommendation: AWS S3 with Pre-Signed URLs**

**Configuration:**
- Bucket: Private (block all public access)
- Encryption: SSE-KMS (server-side)
- Versioning: Enabled
- Lifecycle: Glacier after 180 days, delete after retention period
- Access: Pre-signed URLs only (5 min upload, 1 hour download)

**Security:**
- Client uploads directly to S3 (reduces server load)
- Server-side verification after upload (magic bytes, virus scan)
- EXIF data stripped from images
- Document expiration policies

**Why:**
- Cost-effective (~$0.023/GB/month + $0.005/1000 requests)
- Highly available (99.99%)
- Built-in encryption and access control
- Scalable for growth

**Cost:** ~$10-50/month (depending on volume)

---

### 4. Payment Security

**Recommendation: Stripe with 3D Secure**

**Implementation:**
- Use Stripe.js (card data never touches your server)
- Require 3D Secure for payments > 150 RON
- Webhook signature verification
- Idempotency keys to prevent duplicate charges
- PCI DSS SAQ A compliance (simplest level)

**Fraud Prevention:**
- Stripe Radar (built-in fraud detection)
- Velocity checks (max 5 orders per 24h per email)
- Disposable email blocking
- Manual review for risk score > 50

**Why:**
- Stripe handles PCI compliance
- Built-in fraud detection
- Romanian tax ID support (ro_tin)
- 3D Secure reduces chargeback risk

**Cost:** 2.9% + 1.20 RON per transaction (Stripe fees)

---

### 5. API Security

**Recommendation: Rate Limiting + API Keys + Input Validation**

**Rate Limits:**
- Public API: 100 requests / 15 min per IP
- Auth endpoints: 5 requests / 15 min per IP
- Payment: 10 requests / hour per IP
- API partners: 60 requests / min per API key

**Authentication:**
- JWT for user sessions (RS256 algorithm)
- API keys for partner integrations (hashed with SHA-256)
- OAuth 2.0 for enterprise partners (future)

**Input Validation:**
- Zod schemas for all endpoints
- CNP validation with checksum
- SQL injection prevention (Prisma ORM)
- XSS prevention (output encoding)

**Why:**
- Prevents abuse and DDoS
- Protects against common attacks (OWASP Top 10)
- API monetization ready

**Libraries:** `express-rate-limit`, `zod`, `@prisma/client`

**Cost:** ~$5-10/month (Redis for rate limiting)

---

### 6. Infrastructure Security

**Recommendation: Cloudflare + AWS WAF (Optional)**

**Option A: Cloudflare (Recommended for Start)**
- Cost: Free to $20/month
- DDoS protection included
- Bot management
- CDN (faster page loads)
- SSL/TLS termination
- Easy setup (just change DNS)

**Option B: AWS WAF (Enterprise)**
- Cost: ~$5-20/month + $1 per million requests
- More granular control
- AWS-native integration
- Managed rules for common attacks

**Additional:**
- CloudWatch Logs for monitoring
- SNS alerts for security events
- RDS automated backups (7 days)
- S3 cross-region replication

**Why:**
- Cloudflare is cost-effective and easy to set up
- Provides immediate value (DDoS, CDN, bot blocking)
- Can upgrade to AWS WAF later if needed

**Recommendation:** Start with Cloudflare Free/Pro, add AWS WAF if DDoS or compliance requires it.

---

### 7. Compliance (GDPR)

**Recommendation: Privacy by Design + DPO**

**Requirements:**
- Privacy policy (Romanian language)
- Terms of service
- Cookie consent banner
- Data export (JSON format)
- Data deletion (anonymization after retention)
- Consent management
- Data Processing Agreements with processors
- Data Protection Impact Assessment (DPIA) - required for biometric data

**Data Retention:**
- Contracts: 10 years (legal requirement)
- KYC: 180 days active + 5 years
- Orders: 7 years (accounting)
- Logs: 1 year

**DPO (Data Protection Officer):**
- Required due to biometric data processing at scale
- Options: Outsource (~500-1000 EUR/month) or designate internal
- Contact: dpo@eghiseul.ro

**Breach Notification:**
- Romanian DPA (ANSPDCP): 72-hour notification
- Affected individuals: if high risk

**Why:**
- Legal requirement (GDPR)
- Builds customer trust
- Reduces liability
- Required for B2B partnerships

**Cost:** ~$500-1000/month (outsourced DPO) or internal designation

---

### 8. Monitoring & Incident Response

**Recommendation: CloudWatch + Incident Response Plan**

**Monitoring:**
- CloudWatch Logs (1-year retention for security)
- Metrics: Failed logins, payment failures, 5xx errors, CPU, memory
- Alarms: SNS notifications to security@eghiseul.ro
- Audit trail: All security events logged (append-only)

**Incident Response:**
- Severity levels: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- Response times: 15 min (P0), 1 hour (P1), 4 hours (P2), 1 day (P3)
- Contacts: CTO, Lead Dev, DPO, Legal, External security firm
- Quarterly tabletop exercises

**Breach Response:**
1. Contain (1 hour): Isolate, revoke access, preserve evidence
2. Assess (4 hours): Determine scope and risk
3. Notify (72 hours): ANSPDCP, affected individuals, law enforcement
4. Remediate: Fix vulnerability, enhance controls

**Why:**
- Early detection reduces impact
- Compliance requirement (GDPR breach notification)
- Demonstrates due diligence
- Reduces liability

**Cost:** ~$20-50/month (CloudWatch)

---

## Technology Stack Summary

### Backend Security
```
Authentication: next-auth, jsonwebtoken, speakeasy
Encryption: crypto (Node.js), AWS KMS
Rate Limiting: express-rate-limit, Redis
Validation: zod, validator
Database: Prisma ORM (SQL injection prevention)
Logging: winston, CloudWatchTransport
```

### Infrastructure
```
Hosting: AWS (EC2, ECS, or Lambda)
Database: PostgreSQL (RDS) with SSL
Storage: S3 with KMS encryption
CDN/WAF: Cloudflare (recommended) or AWS CloudFront + WAF
Secrets: AWS Secrets Manager
Monitoring: CloudWatch Logs, Alarms, SNS
```

### Third-Party Services
```
Payments: Stripe
Invoicing: Olbio
Email: SendGrid or AWS SES
SMS: Twilio (optional)
Company Lookup: infocui.ro
Virus Scanning: ClamAV or commercial
```

---

## Cost Breakdown (Monthly)

| Category | Service | Cost | Priority |
|----------|---------|------|----------|
| **Security** | Cloudflare Pro | $20 | P0 |
| | AWS WAF (optional) | $5-20 | P1 |
| | AWS Secrets Manager | $1-5 | P0 |
| | ClamAV (self-hosted) | $0 | P0 |
| **Monitoring** | CloudWatch Logs | $10-50 | P0 |
| | Sentry (errors) | $0-30 | P1 |
| | Snyk (dependencies) | $0-100 | P1 |
| **Storage** | S3 + KMS | $10-50 | P0 |
| **Database** | RDS PostgreSQL | $20-100 | P0 |
| **Compliance** | DPO (outsourced) | $500-1000 | P0 |
| **Total** | | **$565-1375** | |

**Annual Costs:**
- Penetration Testing: $5,000-15,000 (required annually)
- SOC 2 (optional): $15,000-50,000 initial, $10,000-30,000 annual

---

## Implementation Timeline

### Phase 1: Pre-Launch (Weeks 1-4)
**Critical Security Controls**
- [ ] Authentication (2FA, magic links)
- [ ] TLS/HTTPS configuration
- [ ] S3 bucket hardening
- [ ] Encryption at rest (KMS)
- [ ] Stripe integration with 3D Secure
- [ ] Rate limiting
- [ ] Input validation
- [ ] Security headers (CSP, HSTS, etc.)

**Goal:** Platform is secure enough to launch with real customer data.

---

### Phase 2: First 3 Months
**Enhanced Security & Compliance**
- [ ] WAF configuration (Cloudflare or AWS)
- [ ] Comprehensive logging and monitoring
- [ ] Audit trail implementation
- [ ] GDPR features (data export, deletion)
- [ ] Privacy policy and T&C
- [ ] DPO designation
- [ ] DPIA (biometric data processing)
- [ ] Fraud detection enhancements

**Goal:** Full GDPR compliance, enterprise-ready security.

---

### Phase 3: Ongoing (Monthly/Quarterly)
**Continuous Improvement**
- [ ] Security audits (monthly dependency scans)
- [ ] Vulnerability assessments (quarterly DAST)
- [ ] Penetration testing (annual)
- [ ] Incident response drills (quarterly)
- [ ] Key rotation (90 days)
- [ ] Access reviews (quarterly)
- [ ] Policy updates

**Goal:** Maintain security posture as platform evolves.

---

## Quick Decision Matrix

### "Should I use...?"

| Technology | Recommendation | Reason |
|------------|----------------|--------|
| **Magic links vs Passwords** | Magic links (primary) | Simpler, more secure, mobile-friendly |
| **AWS KMS vs HashiCorp Vault** | AWS KMS | Easier setup, automatic rotation, lower ops overhead |
| **Cloudflare vs AWS WAF** | Cloudflare (start) | Cheaper, easier, includes DDoS + CDN |
| **PostgreSQL vs MongoDB** | PostgreSQL | Better for structured data, ACID compliance |
| **Self-hosted vs Managed** | Managed (RDS, S3) | Less ops overhead, better security by default |
| **Stripe vs other payment** | Stripe | Best developer experience, handles PCI compliance |
| **ClamAV vs commercial AV** | ClamAV (start) | Free, sufficient for moderate volume |
| **Internal DPO vs outsourced** | Outsourced (start) | Expertise, compliance knowledge, less liability |

---

## Red Flags to Avoid

**Never do this:**
- [ ] Store passwords in plain text
- [ ] Store credit card numbers
- [ ] Log sensitive data (CNP, passwords, card numbers)
- [ ] Use HTTP for any data transmission
- [ ] Hardcode secrets in code
- [ ] Commit secrets to Git
- [ ] Skip input validation
- [ ] Trust client-side validation alone
- [ ] Ignore security updates
- [ ] Skip backups
- [ ] Use default passwords or keys
- [ ] Expose admin endpoints publicly without authentication
- [ ] Return detailed error messages to users (stack traces)
- [ ] Process payments without 3D Secure
- [ ] Ignore GDPR data subject requests

---

## Security Metrics to Track

### KPIs
- Failed login attempts (threshold: <5%)
- API rate limit hits (threshold: <1% of requests)
- Payment fraud rate (threshold: <0.5%)
- Security vulnerabilities (target: 0 critical, <5 medium)
- Time to patch critical vulnerabilities (target: <7 days)
- Incident response time (target: <15 min for P0)
- Backup success rate (target: 100%)
- Uptime (target: 99.9%)

### Monthly Review
- Review failed login patterns
- Analyze fraud detection effectiveness
- Check for new security vulnerabilities (npm audit)
- Review audit logs for anomalies
- Verify backup integrity
- Test disaster recovery plan

### Quarterly Review
- Penetration testing (or DAST scan)
- Infrastructure audit (AWS Trusted Advisor)
- Access review (remove unnecessary permissions)
- Policy updates
- Incident response drill

### Annual Review
- External penetration testing
- GDPR compliance audit
- SOC 2 audit (if applicable)
- Security training for team
- Update threat model

---

## Common Security Questions

### Q: Do we need SOC 2 certification?
**A:** Not immediately, but consider it when:
- Annual revenue > $1M
- Targeting enterprise B2B clients
- Partners require it contractually

**Timeline:** 12-18 months from start to certification
**Cost:** $15,000-50,000 initial, $10,000-30,000 annual

---

### Q: How do we handle Romanian-specific data (CNP)?
**A:**
- CNP is equivalent to SSN (highly sensitive)
- Encrypt with AES-256-GCM
- Hash for search/lookup (SHA-256)
- Mask in admin UI: 1******1234
- Validate checksum algorithm before storing
- GDPR applies (same as any PII)

---

### Q: What if we get hacked?
**A:** Follow incident response plan:
1. **Contain** (1 hour): Isolate systems, revoke access
2. **Assess** (4 hours): Determine scope and impact
3. **Notify** (72 hours): ANSPDCP (Romanian DPA), affected users
4. **Remediate**: Fix vulnerability, enhance security
5. **Post-mortem**: Document and learn

Contact: security@eghiseul.ro

---

### Q: Can we use Firebase/Supabase instead of building custom auth?
**A:** Yes, both are good options:

**Supabase:**
- Pros: Open source, PostgreSQL-based, GDPR-compliant, EU hosting
- Cons: Less mature than Firebase
- **Recommendation:** Good fit for eGhiseul.ro

**Firebase:**
- Pros: Mature, easy to use, Google-backed
- Cons: US-hosted (GDPR concerns), vendor lock-in
- **Recommendation:** Requires SCCs for GDPR compliance

**Custom Auth:**
- Pros: Full control, no vendor lock-in
- Cons: More work, need to maintain
- **Recommendation:** Only if specific requirements

**Decision:** Use Supabase Auth or next-auth for simplicity, custom auth if special needs.

---

### Q: Do we need a bug bounty program?
**A:** Not initially. Consider when:
- Revenue > $500K/year
- Handling >10,000 customer orders/month
- Targeting enterprise clients

**Alternative:** Responsible disclosure policy (free)
- security@eghiseul.ro email
- Acknowledge and fix reported issues
- Public thanks (if researcher consents)

**When ready for bug bounty:**
- Platforms: HackerOne, Bugcrowd
- Budget: $5,000-10,000/year
- Scope: Define what's in/out of scope

---

### Q: How often should we do penetration testing?
**A:**
- **Annual:** Required minimum
- **Quarterly:** Recommended for high-growth
- **After major releases:** Best practice

**Cost:** $5,000-15,000 per test
**Duration:** 1-2 weeks
**Deliverable:** Report with vulnerabilities and recommendations

---

## Next Steps

1. **Review full documentation:**
   - `/docs/security-architecture.md` (comprehensive guide)
   - `/docs/security-implementation-checklist.md` (step-by-step tasks)

2. **Set up critical security (Week 1-2):**
   - Authentication (2FA, magic links)
   - TLS/HTTPS
   - S3 bucket hardening
   - Rate limiting

3. **Implement data protection (Week 3-4):**
   - Encryption at rest (KMS)
   - Pre-signed URLs
   - Stripe integration
   - Input validation

4. **Add monitoring and compliance (Month 2-3):**
   - CloudWatch Logs and Alarms
   - Audit trail
   - GDPR features
   - Privacy policy

5. **Test and audit (Before launch):**
   - Penetration testing
   - DAST scan (OWASP ZAP)
   - Disaster recovery drill
   - Incident response tabletop

---

## Contacts

**Internal:**
- CTO: [name, email, phone]
- Lead Developer: [name, email, phone]
- DPO: dpo@eghiseul.ro

**External:**
- Romanian DPA (ANSPDCP): anspdcp@dataprotection.ro, +40 21 252 5599
- Security Consultant: [firm, contact]
- Legal Counsel: [firm, contact]

**Emergency:**
- Security incidents: security@eghiseul.ro
- Data breaches: dpo@eghiseul.ro + anspdcp@dataprotection.ro

---

**Document Owner:** CTO
**Last Updated:** 2025-12-15
**Next Review:** 2026-01-15 (monthly)
**Classification:** Internal
