# Security Documentation - eGhiseul.ro

**Last Updated:** 2026-01-07
**Security Status:** PARTIALLY RESOLVED (Critical issues fixed, ongoing items in progress)

## Overview

This directory contains comprehensive security documentation for eGhiseul.ro, a platform handling sensitive personal data including Romanian CNP, identity documents, biometric data, and payment information.

## Quick Navigation

| Need | Start Here |
|------|------------|
| **Check what's fixed** | `SECURITY_AUDIT_SUMMARY.md` |
| **Developer quick fixes** | `SECURITY_QUICK_REFERENCE.md` |
| **Full implementation tasks** | `SECURITY_IMPLEMENTATION_CHECKLIST.md` |
| **Architecture overview** | `security-architecture.md` |
| **Decision making** | `security-recommendations-summary.md` |

## Documents

### Audit Reports (2025-12-17)

#### SECURITY_AUDIT_REPORT_2025-12-17.md
**Status:** Reference Document
**Audience:** Security auditors, legal, management

Full security audit report with all findings, risk assessments, and recommendations.

#### SECURITY_AUDIT_SUMMARY.md ⭐ START HERE
**Status:** Updated 2026-01-07
**Audience:** Everyone

Executive summary of audit findings with current status:
- ✅ CRIT-001: CNP Encryption - DEPLOYED
- ✅ CRIT-003: OCR Endpoint Security - FIXED
- ✅ CRIT-004: CI Encryption - DEPLOYED
- ✅ CRIT-005: Audit Logging - FIXED
- ✅ HIGH-004: Rate Limiting - FIXED
- 🔴 CRIT-002: Google AI DPA - Pending verification
- ⏳ HIGH-001/002: Data Retention - In progress

---

### Implementation Guides

#### SECURITY_IMPLEMENTATION_CHECKLIST.md
**Status:** Updated 2026-01-07 (Week 1 tasks marked complete)
**Audience:** Developers

Task-oriented checklist based on audit:
- Week 1: Critical Fixes ✅ COMPLETE
- Week 2-3: Encryption (deployed, needs environment setup)
- Week 4: Data Retention (in progress)
- Month 2-3: Additional features

#### SECURITY_QUICK_REFERENCE.md ⭐ FOR DEVELOPERS
**Status:** Updated 2026-01-07
**Audience:** Developers

Quick reference with copy-paste code examples:
- OCR endpoint security ✅ IMPLEMENTED
- Audit logging ✅ IMPLEMENTED
- Rate limiting ✅ IMPLEMENTED
- Secure coding checklist
- Common mistakes to avoid

---

### Architecture & Planning

#### security-architecture.md
**Length:** ~50 pages
**Audience:** Technical team, security auditors

Complete security architecture:
- Threat model and risk assessment
- Detailed implementation guides
- Infrastructure security
- GDPR compliance requirements
- Incident response procedures

#### security-implementation-checklist.md (lowercase)
**Length:** ~30 pages
**Audience:** Developers

Detailed implementation guide with code examples:
- Authentication patterns
- Encryption setup
- File storage security
- Payment security

#### security-recommendations-summary.md
**Length:** ~15 pages
**Audience:** CTO, product managers

Executive-level recommendations:
- Technology stack decisions
- Cost-benefit analysis
- Quick decision matrix

---

## Quick Start

### For Developers
1. Start with: **Implementation Checklist**
2. Reference: **Security Architecture** for detailed implementation
3. Use: Code examples directly from the documents

### For Management
1. Start with: **Recommendations Summary**
2. Review: Cost estimates and timeline
3. Approve: Security budget and priorities

### For Security Auditors
1. Start with: **Security Architecture**
2. Review: Compliance section (GDPR, PCI DSS)
3. Verify: Implementation against checklist

---

## Critical Security Areas

### 1. Authentication (P0 - Critical)
- **Admin:** 2FA with TOTP (Google Authenticator)
- **Customer:** Magic link (passwordless) + optional password
- **Session:** JWT with httpOnly cookies, 8h timeout (admin), 7d (customer)

**See:**
- Architecture: Section "Authentication & Authorization"
- Checklist: Section 1
- Summary: "Authentication Strategy"

---

### 2. Data Encryption (P0 - Critical)
- **At Rest:** AES-256-GCM with AWS KMS
- **In Transit:** TLS 1.3 (minimum TLS 1.2)
- **Fields:** CNP, ID numbers, phone, addresses, signatures

**See:**
- Architecture: Section "Data Protection"
- Checklist: Section 2
- Summary: "Data Encryption"

---

### 3. File Storage (P0 - Critical)
- **Platform:** AWS S3 with KMS encryption
- **Access:** Pre-signed URLs (5 min upload, 1h download)
- **Security:** Magic bytes verification, virus scanning, EXIF stripping

**See:**
- Architecture: Section "File Storage Security"
- Checklist: Section 3
- Summary: "File Storage"

---

### 4. Payment Security (P0 - Critical)
- **Provider:** Stripe with 3D Secure
- **Compliance:** PCI DSS SAQ A
- **Fraud:** Stripe Radar + custom checks

**See:**
- Architecture: Section "Payment Security"
- Checklist: Section 4
- Summary: "Payment Security"

---

### 5. API Security (P0 - Critical)
- **Rate Limiting:** 100 req/15min (public), 5 req/15min (auth)
- **Validation:** Zod schemas, CNP checksum, SQL injection prevention
- **Authentication:** JWT (users), API keys (partners)

**See:**
- Architecture: Section "API Security"
- Checklist: Section 5
- Summary: "API Security"

---

### 6. Infrastructure (P0 - Critical)
- **WAF:** Cloudflare (recommended) or AWS WAF
- **Monitoring:** CloudWatch Logs, Alarms, SNS notifications
- **Secrets:** AWS Secrets Manager (never in code)

**See:**
- Architecture: Section "Infrastructure Security"
- Checklist: Section 7
- Summary: "Infrastructure Security"

---

### 7. GDPR Compliance (P0 - Critical)
- **Privacy:** Privacy policy, T&C, cookie consent
- **Rights:** Data export, deletion (anonymization)
- **DPO:** Required (outsourced recommended)
- **DPIA:** Required for biometric data

**See:**
- Architecture: Section "Compliance & Auditing"
- Checklist: Section 8
- Summary: "Compliance (GDPR)"

---

### 8. Incident Response (P0 - Critical)
- **Detection:** CloudWatch alerts, audit logs
- **Response:** P0 (15 min), P1 (1h), P2 (4h), P3 (1d)
- **Breach:** 72-hour notification to ANSPDCP

**See:**
- Architecture: Section "Incident Response"
- Checklist: Section 10
- Summary: "Monitoring & Incident Response"

---

## Implementation Timeline

### Phase 1: Pre-Launch (Weeks 1-4) - CRITICAL
- [ ] Authentication (2FA, magic links, RBAC)
- [ ] TLS/HTTPS setup (Let's Encrypt)
- [ ] S3 bucket hardening (encryption, private)
- [ ] Encryption at rest (AWS KMS)
- [ ] Stripe integration (3D Secure, webhooks)
- [ ] Rate limiting (express-rate-limit)
- [ ] Input validation (Zod schemas)
- [ ] Security headers (Helmet.js, CSP)

**Goal:** Platform secure enough to launch with real data.

---

### Phase 2: First 3 Months - IMPORTANT
- [ ] WAF configuration (Cloudflare or AWS)
- [ ] Comprehensive logging (CloudWatch)
- [ ] Audit trail (security events)
- [ ] GDPR features (export, deletion)
- [ ] Privacy policy and T&C
- [ ] DPO designation
- [ ] DPIA (biometric data)
- [ ] Fraud detection enhancements

**Goal:** Full GDPR compliance, enterprise-ready.

---

### Phase 3: Ongoing - CONTINUOUS
- [ ] Monthly: Dependency scans, access reviews, log analysis
- [ ] Quarterly: DAST scans, infrastructure audits, incident drills
- [ ] Annual: Penetration testing, GDPR audit, policy updates

**Goal:** Maintain security as platform evolves.

---

## Cost Summary

### Monthly Recurring Costs
| Category | Cost | Priority |
|----------|------|----------|
| Cloudflare Pro | $20 | P0 |
| AWS Secrets Manager | $1-5 | P0 |
| CloudWatch Logs | $10-50 | P0 |
| S3 + KMS | $10-50 | P0 |
| RDS PostgreSQL | $20-100 | P0 |
| Snyk (dependencies) | $0-100 | P1 |
| Sentry (errors) | $0-30 | P1 |
| DPO (outsourced) | $500-1000 | P0 |
| **Total** | **$565-1375** | |

### Annual One-Time Costs
- Penetration Testing: $5,000-15,000 (required)
- SOC 2 (optional): $15,000-50,000 initial

**Budget Recommendation:** $700-1500/month + $5,000-15,000 annual

---

## Security Stack

### Backend
- Authentication: `next-auth`, `jsonwebtoken`, `speakeasy`
- Encryption: `crypto`, AWS KMS
- Rate Limiting: `express-rate-limit`, Redis
- Validation: `zod`, `validator`
- ORM: `@prisma/client` (SQL injection prevention)
- Logging: `winston`, CloudWatch

### Infrastructure
- Hosting: AWS (EC2, ECS, or Lambda)
- Database: PostgreSQL (RDS) with SSL
- Storage: S3 with KMS encryption
- WAF/CDN: Cloudflare or AWS CloudFront + WAF
- Secrets: AWS Secrets Manager
- Monitoring: CloudWatch, Sentry

### Third-Party
- Payments: Stripe
- Invoicing: Olbio
- Email: SendGrid or AWS SES
- Virus Scanning: ClamAV or commercial

---

## Key Contacts

### Internal
- CTO: [name, email, phone]
- Lead Developer: [name, email, phone]
- DPO: dpo@eghiseul.ro

### External
- Romanian DPA (ANSPDCP): anspdcp@dataprotection.ro, +40 21 252 5599
- Security Consultant: [firm, contact]
- Legal Counsel: [firm, contact]

### Emergency
- Security incidents: security@eghiseul.ro
- Data breaches: dpo@eghiseul.ro + ANSPDCP (72h notification)

---

## Common Questions

**Q: Where do I start?**
A: Read "Recommendations Summary" first, then follow "Implementation Checklist" in order.

**Q: How much will this cost?**
A: $565-1375/month recurring + $5,000-15,000 annual penetration testing.

**Q: When do we need a DPO?**
A: Now. GDPR requires DPO for biometric data processing. Outsource for ~$500-1000/month.

**Q: Can we skip 2FA for admins?**
A: No. This is non-negotiable for accounts with access to customer PII.

**Q: Do we need penetration testing?**
A: Yes, annually minimum. Required for compliance and customer trust.

**Q: What if we get hacked?**
A: Follow incident response plan (Architecture, Section 11). Notify ANSPDCP within 72 hours.

**Q: Can we use Firebase instead of custom auth?**
A: Yes, but prefer Supabase (EU-hosted) or next-auth for GDPR compliance.

---

## Red Flags (Never Do This)

- [ ] Store passwords in plain text
- [ ] Store credit card numbers
- [ ] Log sensitive data (CNP, passwords)
- [ ] Use HTTP for any data
- [ ] Hardcode secrets in code
- [ ] Skip input validation
- [ ] Trust client-side validation alone
- [ ] Ignore security updates
- [ ] Skip backups
- [ ] Expose admin without auth

---

## Security Checklist (Pre-Launch)

Use this as final verification before going live:

### Authentication (P0)
- [ ] 2FA enabled for all admin accounts
- [ ] Magic link authentication implemented
- [ ] Session timeout configured (8h admin, 7d customer)
- [ ] Account lockout after failed attempts

### Data Protection (P0)
- [ ] AES-256-GCM encryption for sensitive fields
- [ ] AWS KMS configured with rotation
- [ ] TLS 1.3 enforced (minimum TLS 1.2)
- [ ] HSTS header configured
- [ ] No secrets in code or environment

### File Storage (P0)
- [ ] S3 public access blocked
- [ ] S3 default encryption enabled (SSE-KMS)
- [ ] Pre-signed URLs with short expiry
- [ ] File upload validation (client + server)
- [ ] MIME type verification
- [ ] Virus scanning configured

### Payment Security (P0)
- [ ] Stripe.js (no card data touches server)
- [ ] 3D Secure required for payments > 150 RON
- [ ] Webhook signature verification
- [ ] Idempotency keys to prevent duplicates
- [ ] PCI DSS SAQ A completed

### API Security (P0)
- [ ] Rate limiting configured
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention (Prisma)
- [ ] CORS configured correctly
- [ ] Security headers (CSP, HSTS, etc.)

### Infrastructure (P0)
- [ ] WAF configured (Cloudflare or AWS)
- [ ] CloudWatch Logs and Alarms
- [ ] Secrets in AWS Secrets Manager
- [ ] RDS backups enabled (7 days)
- [ ] S3 cross-region replication

### Compliance (P0)
- [ ] Privacy policy published
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] DPO designated
- [ ] DPIA conducted
- [ ] Breach notification procedure documented

### Testing (P0)
- [ ] Penetration testing completed
- [ ] DAST scan (OWASP ZAP)
- [ ] Dependency scanning automated
- [ ] Disaster recovery tested
- [ ] Incident response plan documented

**If all checked: Ready to launch!**

---

## Additional Resources

### Documentation
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- GDPR: https://gdpr.eu/
- Stripe Security: https://stripe.com/docs/security
- AWS Security Best Practices: https://aws.amazon.com/security/best-practices/
- Romanian DPA (ANSPDCP): https://www.dataprotection.ro/

### Tools
- SAST: Semgrep, CodeQL, SonarQube
- DAST: OWASP ZAP, Burp Suite
- Dependencies: Snyk, npm audit, Dependabot
- Secrets: AWS Secrets Manager, git-secrets
- Monitoring: CloudWatch, Sentry, Datadog

### Training
- OWASP Secure Coding: https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/
- AWS Security Training: https://aws.amazon.com/training/learn-about/security/
- GDPR Training: https://gdpr.eu/training/

---

**Last Updated:** 2025-12-15
**Next Review:** 2026-01-15 (monthly)
**Document Owner:** CTO
**Classification:** Internal

For questions or security concerns: security@eghiseul.ro
