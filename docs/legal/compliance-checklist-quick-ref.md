# eGhiseul.ro - Legal Compliance Quick Reference Checklist

**Last Updated:** 15 December 2024
**Status Legend:** ✅ Completed | 🟡 In Progress | ⚠️ Critical | ❌ Not Started

---

## Pre-Launch Critical Items (MUST HAVE)

### Legal Documents
- [ ] ⚠️ Privacy Policy (Romanian) - published on website
- [ ] ⚠️ Terms & Conditions (Romanian) - accessible before order
- [ ] ⚠️ Cookie Policy - published with banner
- [ ] ⚠️ Refund Policy - in T&C or separate page
- [ ] ⚠️ Service Contract template - auto-generated per order
- [ ] ⚠️ Împuternicire templates - per service type

### GDPR Fundamentals
- [ ] ⚠️ AWS DPA executed
- [ ] ⚠️ S3 configured in EU region only (eu-central-1 or eu-west-1)
- [ ] ⚠️ S3 encryption enabled (AES-256)
- [ ] ⚠️ S3 versioning enabled (immutability)
- [ ] ⚠️ Stripe DPA verified (automatic for EU)
- [ ] ⚠️ Data retention policy documented (10 years contracts/invoices)
- [ ] ⚠️ Automated deletion workflows implemented

### Website Compliance
- [ ] ⚠️ Cookie consent banner (essential vs. analytics separation)
- [ ] ⚠️ Footer legal links (T&C, Privacy, Cookie, Contact)
- [ ] ⚠️ Company info in footer (EDIGITALIZARE SRL, CUI, address)
- [ ] ⚠️ ANPC contact link (0800.080.999, anpc.ro)
- [ ] ⚠️ SOL platform link (https://ec.europa.eu/consumers/odr)
- [ ] ⚠️ Pre-contractual info on service pages (price, timeline, delivery)

### Order Flow
- [ ] ⚠️ T&C consent checkbox (required before payment)
- [ ] ⚠️ Privacy Policy consent checkbox
- [ ] ⚠️ Electronic signature consent clause
- [ ] ⚠️ Withdrawal right waiver checkbox ("I request immediate processing...")
- [ ] ⚠️ Total price display (all-inclusive, before payment button)
- [ ] ⚠️ KYC consent explanation (why needed, legal basis)

### Invoicing
- [ ] ⚠️ Olbio e-factura module enabled (B2B mandatory)
- [ ] ⚠️ PF invoice template (name, CNP optional, address)
- [ ] ⚠️ PJ invoice template (CUI, Reg. Com., ANAF upload)
- [ ] ⚠️ Sequential invoice numbering (no gaps)
- [ ] ⚠️ 10-year invoice storage (S3 + database index)

### Data Security
- [ ] ⚠️ PostgreSQL in EU region
- [ ] ⚠️ Database encryption at rest
- [ ] ⚠️ CNP field application-level encryption
- [ ] ⚠️ Password hashing (Bcrypt/Argon2)
- [ ] ⚠️ IAM least privilege (AWS)
- [ ] ⚠️ S3 presigned URLs for document download (time-limited)

---

## Month 1-3 (Post-Launch)

### GDPR Advanced
- [ ] 🟡 Appoint DPO (external service: €200-800/month)
- [ ] Conduct DPIA (Data Protection Impact Assessment) for KYC
- [ ] Create ROPA (Records of Processing Activities)
- [ ] Implement DSAR process (customer data export function)
- [ ] Data breach response plan documented
- [ ] Staff GDPR training (basic)

### Processor Agreements
- [ ] Olbio - Data Processing Agreement
- [ ] Fan Curier - Data Processing Agreement
- [ ] DHL - Data Processing Agreement
- [ ] Email provider (SendGrid/Resend) - DPA with SCCs
- [ ] SMS provider (Twilio) - DPA with SCCs
- [ ] Translator subcontractors - DPA template
- [ ] Maintain processor register (spreadsheet)

### Compliance Processes
- [ ] Complaint handling procedure (30-day SLA)
- [ ] RTBF (Right to be Forgotten) request procedure
- [ ] Data subject rights request templates
- [ ] Internal compliance calendar (quarterly reviews)

### Legal Review
- [ ] Hire Romanian lawyer - review all templates (€1,500-3,000)
- [ ] Verify împuternicire templates with target institutions
- [ ] Test contract generation with real order data

---

## Month 4-12 (Scaling)

### Advanced Features
- [ ] AdES signature provider integration (for >500 RON contracts)
- [ ] Automated DSAR response (export customer data as JSON/CSV)
- [ ] Multi-language legal documents (English for diaspora UX)
- [ ] Customer account settings: Privacy preferences, data download

### Audits & Certifications
- [ ] Annual GDPR external audit (€2,000-5,000)
- [ ] Annual data retention audit (verify S3 integrity, checksums)
- [ ] Annual processor compliance verification (review DPAs, certs)
- [ ] Consider ISO 27001 (if B2B scaling)

### Insurance
- [ ] Cyber liability insurance (€500K-1M coverage)
- [ ] Professional indemnity insurance (€250K-500K)

### Monitoring
- [ ] Quarterly GDPR compliance review
- [ ] Monthly customer complaint analysis
- [ ] Annual policy updates (T&C, Privacy, Cookie)

---

## Quick Reference: Data Retention Periods

| Data Type | Retention | Legal Basis |
|-----------|-----------|-------------|
| Contracts | 10 years | Law 82/1991 (fiscal) |
| Invoices | 10 years | Fiscal Code |
| KYC Documents (ID, selfie) | 3 years after service | Legal claims (Civil Code Art. 2517) |
| Transaction logs | 5 years | PSD2 |
| Marketing consents | Until withdrawal or 2 years inactivity | GDPR Art. 6(1)(a) |
| Email communications | Duration + 1 year | Legitimate interest |

---

## Quick Reference: When to Refuse RTBF (Right to Erasure)

Customer requests deletion of:
- **Contracts/Invoices (<10 years old):** ❌ REFUSE - Legal obligation (Art. 17(3)(b))
- **KYC during active disputes:** ❌ REFUSE - Legal claims defense (Art. 17(3)(e))
- **KYC after service completion, no disputes:** ✅ DELETE within 30 days
- **Marketing emails/preferences:** ✅ DELETE immediately
- **Customer account, no active orders:** ✅ PSEUDONYMIZE contract data, delete personal identifiers

**Response template:** Always cite GDPR article, explain why retention necessary, offer pseudonymization where deletion impossible.

---

## Quick Reference: Withdrawal Right Exceptions

14-day withdrawal right does NOT apply if:
1. Service has been **fully performed** AND
2. Customer gave **prior express consent** to immediate performance AND
3. Customer **acknowledged** losing withdrawal right

**Implementation:**
- Checkbox at checkout: "I request immediate processing and acknowledge I will lose my right of withdrawal once service is completed per Art. 16(1)(a) OUG 34/2014"
- Confirmation email restates waiver
- T&C explains exception

**If customer withdraws before completion:**
- Must honor, refund payment minus proportional cost for work already done

---

## Quick Reference: DPO Requirement

**When is DPO MANDATORY?**
- Regular and systematic monitoring of data subjects on large scale
- eGhiseul.ro: Collecting CNP, ID copies, selfies, 10-year storage = YES

**Current scale (<5,000 customers/year):**
- Recommended but not strictly enforced
- Demonstrates compliance commitment

**When scaling >5,000 customers/year:**
- MANDATORY

**Options:**
- Internal DPO: Salary + training (avoid conflict of interest)
- External DPO: €500-2,000/month
- DPO-as-a-Service: €200-800/month (recommended for startup)

**DPO Responsibilities:**
- Monitor GDPR compliance
- Conduct DPIAs
- Train staff
- Point of contact for ANSPDCP
- Advise on RTBF, data breaches

---

## Quick Reference: E-Factura Timeline

| Customer Type | E-Factura Requirement | Timeline |
|--------------|----------------------|----------|
| **B2B (PJ → PJ)** | Mandatory | Since 1 Jan 2024 |
| **B2G (PJ → Government)** | Mandatory | Since 1 Jul 2022 |
| **B2C (PJ → PF)** | Voluntary | Expected mandatory 2025-2026 |

**Current Action:**
- Ensure Olbio uploads B2B invoices to ANAF SPV automatically
- Prepare for B2C mandate (use e-factura for all now)

---

## Quick Reference: Electronic Signature Validity

| Type | Legal Effect | Requirements | Use Case |
|------|-------------|--------------|----------|
| **Simple (SES)** - Canvas | Admissible but rebuttable | Any digital mark | eGhiseul.ro current (OK for <500 RON) |
| **Advanced (AdES)** | Stronger evidence | Crypto keys, signature pad | Recommended for >500 RON |
| **Qualified (QES)** | = Handwritten | Qualified cert, smart card | Equivalent to handwritten, highest validity |

**To strengthen SES (current approach):**
- ✅ Explicit consent to electronic signature (checkbox)
- ✅ KYC (ID + selfie) before signature
- ✅ Audit trail (IP, timestamp, device)
- ✅ Immediate copy to customer (email PDF)
- ✅ T&C clause: Customer acknowledges legal validity per Law 455/2001

**Future:** Integrate AdES for contracts >500 RON (Adobe Sign, DocuSign, Namirial)

---

## Quick Reference: Cloud Provider Compliance

### AWS S3
- [x] DPA executed
- [x] EU region only (eu-central-1 Frankfurt or eu-west-1 Ireland)
- [x] Encryption at rest (AES-256)
- [x] Versioning enabled
- [x] Access logs enabled
- [x] CloudTrail for API audit
- [x] Presigned URLs for customer downloads (time-limited)
- [x] Lifecycle: Archive to Glacier after 3 years (cost optimization)
- [x] Cross-region replication (disaster recovery)

### PostgreSQL
- [x] EU region
- [x] Encryption at rest
- [x] VPC isolation (no public access)
- [x] Application-level encryption for CNP
- [x] Password hashing (Bcrypt/Argon2)
- [x] Daily backups (30-day retention)

### Stripe
- [x] EU entity (Stripe Payments Europe, Dublin)
- [x] DPA automatic
- [x] PCI DSS Level 1 (Stripe handles)
- [x] eGhiseul.ro NOT in scope (no card data stored)
- [x] Store only: transaction ID, amount, status (not card details)

---

## Quick Reference: Required Website Sections

### Footer (Every Page)
- Company: EDIGITALIZARE SRL, CUI [X], Address
- Contact: Email, Phone
- Links: T&C, Privacy Policy, Cookie Policy, Refund Policy
- ANPC: Link to anpc.ro, phone 0800.080.999
- SOL: https://ec.europa.eu/consumers/odr
- Payment: "Secure payment via Stripe" badge

### Service Page (Before Order)
- Service description (what document, how obtained)
- Price (all-inclusive, VAT included)
- Timeline (standard, urgent)
- Delivery options (electronic, physical, costs)
- Requirements (CNP, ID, etc.)
- CTA: Clear "Order Now" button

### Checkout (Before Payment)
- Order summary (itemized)
- Total price (final, no hidden fees)
- Billing type (PF/PJ)
- Delivery selection
- Checkboxes:
  - T&C consent (required)
  - Privacy Policy consent (required)
  - Electronic signature consent (required)
  - Withdrawal right waiver ("I request immediate processing...")
  - Marketing opt-in (optional, not pre-ticked)
- Payment button (Stripe)

### Confirmation Email (After Order)
- Order number
- Service details
- Total paid
- Timeline estimate
- Attachments: Contract PDF, Invoice PDF
- Status tracking link
- Contact for support

---

## Quick Reference: Împuternicire (Power of Attorney) Requirements

**Must Include:**
1. Place and date
2. Principal identity (name, CNP, ID, address)
3. Representative identity (EDIGITALIZARE SRL, CUI, legal rep)
4. Specific powers ("to request, receive, and sign for [specific document]")
5. Duration ("until task completion" or specific date)
6. Principal signature (electronic canvas signature)
7. Attachments: Principal ID copy, EDIGITALIZARE SRL registration cert

**Service-Specific:**
- Cazier Judiciar: "obținerii Certificatului de Cazier Judiciar de la ANP"
- Certificates: "obținerii Certificatului de [Type] de la Primăria [City]"
- Cazier Fiscal: "obținerii Certificatului de Cazier Fiscal de la ANAF"
- Certificat Constatator: "obținerii Certificatului Constatator de la ONRC"
- Extras CF: NOT needed (public information)

**Fallback if Institution Rejects Electronic Signature:**
- Offer customer: Download, print, handwritten sign, scan, re-upload
- For corporate clients: Recommend notarized împuternicire (customer pays notary ~50-100 RON)

---

## Quick Reference: Annual Compliance Calendar

| Month | Task |
|-------|------|
| **January** | - Review and update T&C, Privacy Policy, Cookie Policy<br>- Annual data retention audit (verify S3 integrity)<br>- Reset invoice numbering series (optional) |
| **February** | - Execute/renew DPAs with all processors<br>- Verify processor certifications (AWS, Stripe, etc.) |
| **March** | - Q1 GDPR compliance review<br>- Review customer complaints (identify patterns) |
| **April** | - Staff GDPR refresher training<br>- Update ROPA (if business changes) |
| **May** | - External GDPR audit (annual)<br>- Review cyber insurance policy |
| **June** | - Q2 GDPR compliance review<br>- Review e-factura compliance (B2B invoices uploaded to ANAF?) |
| **July** | - Test data breach response plan (simulation)<br>- Review backup/disaster recovery procedures |
| **August** | - Review pricing display compliance (all-inclusive, VAT?)<br>- Check SOL/ANPC links functional |
| **September** | - Q3 GDPR compliance review<br>- Review withdrawal right process (any disputes?) |
| **October** | - Annual legal counsel review (optional but recommended)<br>- Update împuternicire templates if institutions changed requirements |
| **November** | - Prepare for annual tax audit (ANAF)<br>- Verify 10-year retention compliance |
| **December** | - Q4 GDPR compliance review<br>- Plan next year compliance budget<br>- Review DPO performance (if external) |

---

## Emergency Contacts

| Authority/Service | Contact | Use Case |
|------------------|---------|----------|
| **ANSPDCP** (Data Protection) | anspdcp@dataprotection.ro, dataprotection.ro | Data breach (notify within 72h), GDPR questions |
| **ANPC** (Consumer Protection) | 0800.080.999, anpc.ro | Consumer complaints, compliance questions |
| **ANAF** (Tax Authority) | anaf.ro | E-factura issues, tax questions |
| **DPO** (if appointed) | [DPO Email] | All GDPR matters, DSAR, DPIA |
| **Legal Counsel** | [Lawyer Email/Phone] | Contract disputes, legal interpretation |
| **Cyber Insurance** | [Insurance Contact] | Data breach, cyber incident |

---

## Cost Summary (Annual Estimate)

| Item | Cost (EUR/year) |
|------|----------------|
| DPO service (external) | €2,400 - €9,600 |
| Legal counsel (retainer, optional) | €6,000 - €24,000 |
| Tax advisor | €1,000 - €3,000 |
| Annual GDPR audit | €2,000 - €5,000 |
| Cyber + professional liability insurance | €1,500 - €5,000 |
| **Total** | **€13,000 - €46,600** |

**Conservative Startup Budget:** €15,000 - €20,000/year

---

## Next Steps (Prioritized)

### Week 1 (Critical)
1. Draft Privacy Policy (Romanian)
2. Draft Terms & Conditions (Romanian)
3. Configure S3 in EU region with encryption + versioning
4. Execute AWS DPA
5. Implement cookie consent banner

### Week 2 (High Priority)
6. Draft Cookie Policy
7. Draft Refund Policy
8. Add footer legal links
9. Add T&C/Privacy consent checkboxes to checkout
10. Add withdrawal right waiver checkbox

### Week 3 (Medium Priority)
11. Design Contract template (auto-generate)
12. Design Împuternicire templates (per service)
13. Implement 10-year storage + automated deletion
14. Verify Olbio e-factura for B2B
15. Test invoice generation (PF and PJ)

### Week 4 (Before Launch)
16. Review all legal docs with Romanian lawyer (recommended)
17. Test full order flow (legal compliance perspective)
18. Appoint interim privacy contact (before formal DPO)
19. Create basic ROPA
20. Document data retention policy

### Month 2-3 (Post-Launch)
21. Appoint formal DPO (external service)
22. Conduct DPIA
23. Execute all processor DPAs
24. Implement DSAR process
25. Data breach response plan

---

**Document Status:** Living document - update after each compliance review

**Owner:** Legal/Compliance Team

**Review Frequency:** Quarterly or upon business changes

**Last Reviewed:** 15 December 2024
