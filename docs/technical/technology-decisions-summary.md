# Technology Decisions Summary - eGhiseul.ro

**Date:** December 15, 2025
**Status:** Research Complete
**Next Step:** Final PRD Update

---

## Executive Summary

Based on comprehensive research from multiple specialist agents (technology-researcher, legal-advisor, security review), here are the final technology recommendations for eGhiseul.ro.

---

## 1. BACKEND DECISION: Supabase for Phase 1

### Recommendation: Start with Supabase, Evolve to Hybrid

| Criterion | Supabase | NestJS+PostgreSQL | Decision |
|-----------|----------|-------------------|----------|
| Time to Market | 3-4 months | 6-9 months | **Supabase** |
| Initial Dev Cost | $40-60K | $80-120K | **Supabase** |
| Year 3 Ops Cost | ~$1,600/yr | ~$16,000/yr | **Supabase** |
| GDPR Compliance | Built-in | Manual | **Supabase** |
| Customization | Medium | High | NestJS |
| Vendor Lock-in | Medium-High | None | NestJS |

### Key Features Validated

**Authentication with 2FA:** Native TOTP support in Supabase
**Multi-tenancy:** Excellent Row Level Security (RLS)
**Real-time:** Built-in WebSocket subscriptions (500 connections Pro tier)
**File Storage:** 100GB included, more expensive than S3 at scale
**Mobile SDK:** Official SDKs for Flutter, Swift, Kotlin

### Implementation Strategy

**Phase 1 (Year 1-2):** Supabase MVP
- Fast launch in 3-4 months
- Validate product-market fit
- Cost: ~$600/year operational

**Phase 2 (Year 2-3):** Optimize
- Move file storage to AWS S3 (cost savings)
- Add custom NestJS microservices for complex logic
- Keep Supabase for auth, database, real-time

**Phase 3 (Year 3+):** Evaluate
- If users > 100,000: consider full migration
- If costs > $1,500/month: evaluate alternatives
- Decision based on actual data, not projections

---

## 2. OCR DECISION: AWS Textract (NOT Gemini)

### Recommendation: AWS Textract with Custom Parser

**Critical finding:** Google Gemini API should NOT be used for Romanian ID documents due to privacy concerns.

### Privacy Comparison

| Aspect | Google Gemini | AWS Textract | Winner |
|--------|---------------|--------------|--------|
| Data Retention | Up to 210 days | **0 days** | AWS |
| Training on Data | Not explicit | **Never** | AWS |
| GDPR Compliance | Complex | **Built-in** | AWS |
| Legal Risk | **Medium-High** | **Low** | AWS |

### Why NOT Gemini for ID Documents

1. **No explicit no-training guarantee** - Google doesn't explicitly state customer data won't be used for model improvement
2. **Long retention periods** - up to 210 days after deletion request
3. **Diagnostic logging risks** - may capture sensitive data
4. **Pre-GA warnings** - documentation warns against processing personal data with Preview features
5. **Legal ambiguity** - no explicit permission for ID document processing

### Why AWS Textract

1. **Zero retention** - documents processed in-memory only, never stored
2. **Explicit policy** - "Customer content is NEVER used for service improvement or model training"
3. **GDPR compliant** - AWS DPA explicitly covers special categories of personal data
4. **Purpose-built** - AnalyzeID API designed for identity documents
5. **Used by banks** - financial institutions use it for KYC compliance

### Cost Analysis (Romanian IDs)

| Volume/month | Textract DetectText | Textract AnalyzeID | Gemini |
|--------------|--------------------|--------------------|--------|
| 1,000 | $1.50 | $2,000 | $1-2 |
| 10,000 | $15 | $20,000 | $10-20 |

**Recommendation:** Use DetectDocumentText ($0.0015/page) + custom parser for Romanian ID fields

### Implementation

```
User uploads ID → S3 (encrypted) → Lambda →
AWS Textract DetectDocumentText → Custom parser →
Validate CNP, dates → Store structured data →
Delete original image
```

---

## 3. COMPLETE TECHNOLOGY STACK

### Approved Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend** | Next.js 14+ | React ecosystem, SSR, SEO |
| **Backend** | Supabase (Phase 1) | Fast MVP, built-in features |
| **Database** | PostgreSQL (via Supabase) | Standard, RLS for multi-tenancy |

### Database Connection Info

**Project Reference:** `llbwmitdrppomeptqlue`
**Region:** West EU (London)
**Dashboard:** https://supabase.com/dashboard/project/llbwmitdrppomeptqlue

**Running Migrations:**
```bash
# Using Supabase CLI (recommended - project already linked)
supabase db push

# Manual: Copy SQL to Supabase Dashboard > SQL Editor
```

**Migration Files Location:** `supabase/migrations/`

**Applied Migrations:**
- `001_initial_schema.sql` - Base tables (profiles, partners, etc.)
- `002_services_orders.sql` - Services, service_options, orders tables
- `003_fix_rls_recursion.sql` - Fixed RLS infinite recursion with SECURITY DEFINER functions
| **File Storage** | Supabase Storage → AWS S3 | Start simple, optimize later |
| **OCR** | AWS Textract | Privacy, GDPR, zero retention |
| **KYC** | AWS Rekognition (Phase 1) → Veriff (Phase 2) | Cost-effective, then premium |
| **Payments** | Stripe | Best UX, Romanian cards supported |
| **SMS** | SMSLink.ro | 70% cheaper than Twilio for RO |
| **Email** | Resend | Modern DX, free tier |
| **Invoicing** | SmartBill | E-factura compliant, market leader |
| **Courier (RO)** | Fan Courier | Best coverage Romania |
| **Courier (Intl)** | DHL | Global network |
| **CUI Lookup** | ANAF API (free) | Official source |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
│       Web (Next.js) │ iOS │ Android │ Partner APIs      │
└────────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴─────────────────┐
            │                                  │
            ▼                                  ▼
┌───────────────────────┐          ┌───────────────────────┐
│      Supabase         │          │   AWS Services        │
│  - Authentication     │          │  - Textract (OCR)     │
│  - PostgreSQL + RLS   │          │  - Rekognition (KYC)  │
│  - Real-time          │          │  - S3 (Phase 2)       │
│  - Edge Functions     │          │  - Lambda             │
└───────────────────────┘          └───────────────────────┘
            │                                  │
            └────────────────┬─────────────────┘
                             │
            ┌────────────────┴─────────────────┐
            │                                  │
            ▼                                  ▼
┌───────────────────────┐          ┌───────────────────────┐
│   Romanian Services   │          │  External Services    │
│  - SMSLink.ro         │          │  - Stripe             │
│  - SmartBill          │          │  - Resend             │
│  - Fan Courier        │          │  - DHL                │
│  - ANAF API           │          │  - FCM (push)         │
└───────────────────────┘          └───────────────────────┘
```

---

## 4. COST PROJECTIONS

### Year 1 (MVP - 5,000 users)

| Service | Monthly Cost |
|---------|--------------|
| Supabase Pro | $25 |
| AWS Textract | $20 |
| AWS Rekognition | $10 |
| SMSLink.ro | $30 |
| Resend | $0 (free tier) |
| SmartBill | €50 |
| Monitoring | $10 |
| **Total** | **~$150/month** |

### Year 3 (50,000 users)

| Service | Monthly Cost |
|---------|--------------|
| Supabase Pro (scaled) | $113 |
| AWS Services | $80 |
| SMS | $100 |
| Email | $20 |
| Invoicing | $50 |
| CUI Lookup | $29 |
| Monitoring | $50 |
| **Total** | **~$450/month** |

---

## 5. COMPLIANCE STATUS

### GDPR Compliance

- [x] Data Processing Agreements (all providers have DPAs)
- [x] EU Data Residency (Supabase Frankfurt, AWS Frankfurt)
- [x] Zero retention OCR (AWS Textract)
- [x] 10-year contract retention (Romanian law)
- [ ] DPO appointment (required as scale grows)
- [ ] DPIA completion (before launch)

### Romanian Specific

- [x] E-factura via SmartBill
- [x] ANAF API for CUI validation
- [x] Local SMS provider (SMSLink.ro)
- [x] Local courier (Fan Courier)
- [x] Romanian electronic signature validity (Law 455/2001)

---

## 6. NEXT STEPS

### Immediate (Week 1-2)

1. [ ] Set up Supabase project (EU region - Frankfurt)
2. [ ] Design database schema with RLS policies
3. [ ] Set up AWS account with Textract in eu-central-1
4. [ ] Create development environment

### Short-term (Month 1)

5. [ ] Implement authentication with 2FA
6. [ ] Build document upload flow with Textract OCR
7. [ ] Implement multi-tenancy (municipalities/partners)
8. [ ] Set up Stripe payment integration

### Medium-term (Month 2-3)

9. [ ] Complete KYC flow with Rekognition
10. [ ] Integrate SmartBill for invoicing
11. [ ] Integrate SMS notifications
12. [ ] Build mobile app (Flutter)

### Launch (Month 4)

13. [ ] Security audit
14. [ ] DPIA completion
15. [ ] Beta testing
16. [ ] Production deployment

---

## 7. RISK MITIGATION

| Risk | Mitigation |
|------|------------|
| Supabase vendor lock-in | Open-source, can self-host if needed |
| OCR accuracy for Romanian IDs | Custom parser, fallback to manual review |
| GDPR non-compliance | AWS zero-retention OCR, DPO appointment |
| Cost overrun at scale | Migration path to AWS S3, NestJS services |
| Security breach | Encryption at rest/transit, audit logging |

---

## 8. DOCUMENTS CREATED

1. **TECHNOLOGY_RECOMMENDATIONS.md** - Complete tech stack analysis
2. **compliance-research.md** - Legal/GDPR requirements
3. **security-architecture.md** - Security framework
4. **technology-decisions-summary.md** - This document

---

**Document Status:** Complete
**Confidence Level:** High
**Recommended Review:** Before implementation begins
