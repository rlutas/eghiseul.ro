# Legal and Regulatory Compliance Research - eGhiseul.ro

**Document Version:** 1.0
**Date:** 15 December 2024
**Business:** eGhiseul.ro - Romanian government document acquisition service
**Author:** Legal Research Team

---

## Executive Summary

eGhiseul.ro operates in a highly regulated space, intersecting GDPR data protection, Romanian contract law, e-commerce consumer protection, and document representation services. This document provides comprehensive legal research and compliance requirements.

**Critical Findings:**
- DPO (Data Protection Officer) is MANDATORY due to regular systematic monitoring of personal data
- 10-year contract retention is REQUIRED by Romanian fiscal law (Art. 22, Law 82/1991)
- Electronic signatures via qualified service provider are legally required for full validity
- 14-day withdrawal right has EXCEPTIONS for urgent services at customer request
- E-factura mandatory from 2024 for B2B, timeline extends to 2025 for B2C
- Data can be stored in EU/EEA cloud providers (GDPR compliant)
- Power of attorney (împuternicire) must meet Civil Code requirements (Art. 2009-2043)

---

## 1. GDPR Compliance (EU Regulation 2016/679)

### 1.1 Data Retention Requirements and Limits

#### Legal Framework
- **General Principle (Art. 5(1)(e))**: Personal data must be kept no longer than necessary
- **Romanian Implementation**: Law 190/2018
- **Retention Balance**: GDPR minimization vs. legal obligations to retain

#### Specific Requirements for eGhiseul.ro

| Data Type | Retention Period | Legal Basis | Notes |
|-----------|-----------------|-------------|-------|
| **Contracts** | 10 years | Law 82/1991 (fiscal code), Art. 22 | Mandatory for tax purposes |
| **Invoices** | 10 years | Fiscal Code, ANAF requirements | Tax audit protection |
| **KYC Documents** | Duration of relationship + 5 years | Anti-fraud, legal claims | Can be longer if justified |
| **Identity Documents (copies)** | Duration of service + legal claims period (3 years) | Contract performance, legal claims (Civil Code Art. 2517) | Must document justification |
| **Transaction Logs** | 5 years | Payment Services Directive 2 (PSD2) | For payment-related data |
| **Marketing Consents** | Until withdrawal or 2 years inactivity | Consent (Art. 6(1)(a)) | Review annually |
| **Email Communications** | Duration of relationship + 1 year | Legitimate interest, evidence | Customer service records |

#### Data Retention Policy Requirements

**Must Document:**
1. **Specific retention periods** per data category
2. **Legal basis** for each retention period
3. **Automated deletion processes** or periodic manual reviews
4. **Retention register** - what data, why, how long

**Best Practice:**
- Automated deletion workflows after retention expires
- Annual audit of retained data
- Clear data retention schedule in Privacy Policy
- Document conflicts between GDPR minimization and legal obligations

### 1.2 Right to be Forgotten (RTBF) vs. Legal Obligations

#### Art. 17 GDPR - Exceptions to Erasure

**Critical Exception for eGhiseul.ro:**
Art. 17(3)(b) - Right to erasure does NOT apply when retention is necessary for:
> "compliance with a legal obligation which requires processing by Union or Member State law"

**Application:**
- Contracts, invoices, and fiscal records: **CANNOT be deleted** during 10-year period (overrides RTBF)
- KYC documents: Can be retained for legal claims defense (Art. 17(3)(e))
- Marketing data, browsing history: **MUST be deleted** upon request (no legal obligation)

#### Handling RTBF Requests - Action Plan

| Data Category | Response to RTBF Request |
|---------------|-------------------------|
| Contracts & Invoices (< 10 years) | **REFUSE** - Legal obligation (provide Art. 17(3)(b) explanation) |
| KYC documents during active disputes | **REFUSE** - Legal claims defense Art. 17(3)(e) |
| KYC after service completion + no disputes | **DELETE** within 30 days unless fraud risk documented |
| Marketing emails/preferences | **DELETE** immediately |
| Customer account (no active orders) | **PSEUDONYMIZE** contract data, delete personal identifiers |
| Payment data | **DELETE** from systems, retain minimal data in invoices (legal obligation) |

**Response Template Required:**
- Acknowledge request within 72 hours
- Explain what can/cannot be deleted
- Cite specific GDPR article for refusals
- Offer pseudonymization where full deletion impossible
- Complete action within 30 days

### 1.3 Data Processing Consent Requirements

#### Lawful Basis (Art. 6 GDPR)

eGhiseul.ro must identify correct legal basis for each processing activity:

| Processing Activity | Lawful Basis | Notes |
|-------------------|--------------|-------|
| **Processing orders** | Art. 6(1)(b) - Contract performance | No consent needed |
| **KYC identity verification** | Art. 6(1)(b) - Contract performance + Art. 6(1)(c) - Legal obligation | Fraud prevention, legal representation |
| **Storing contracts** | Art. 6(1)(c) - Legal obligation | Fiscal Code requirement |
| **Payment processing** | Art. 6(1)(b) - Contract performance | PSD2 compliance |
| **Email order updates** | Art. 6(1)(b) - Contract performance | No consent needed for transactional |
| **Marketing emails** | Art. 6(1)(a) - Consent | MUST be opt-in, withdrawable |
| **SMS notifications** | Art. 6(1)(a) - Consent | Paid service (+5 RON) = implied consent, but document |
| **Analytics (GA4)** | Art. 6(1)(f) - Legitimate interest | Cookie consent for non-essential |
| **Sharing with courier partners** | Art. 6(1)(b) - Contract performance | For delivery - document as processor |
| **API partner data sharing** | Art. 6(1)(b) - Contract performance | Customer contracts with API clients |

**Critical Distinction:**
- **Consent NOT required** for core service delivery (contract performance)
- **Consent REQUIRED** for marketing, non-essential cookies, third-party sharing beyond service delivery

#### Consent Management Requirements

**For Marketing:**
- Explicit opt-in checkbox (not pre-ticked)
- Separate from T&C acceptance
- Clear statement of purpose
- Easy withdrawal mechanism (every email, account settings)
- Record of consent: timestamp, IP, consent text version

**For Cookies:**
- Cookie banner compliant with ePrivacy Directive
- Granular consent (essential vs. analytics vs. marketing)
- Reject all option as easy as Accept all
- No cookie wall (denying service for refusing non-essential cookies)

### 1.4 Cross-Border Data Transfer (Diaspora Customers)

#### Legal Framework
- GDPR Chapter V (Art. 44-50)
- Personal data of EU residents processed in Romania (✓ OK - EU Member State)
- Data stored in cloud providers (AWS S3) - location matters

#### Compliance Requirements

**Scenario 1: Customer in Germany orders from eGhiseul.ro (Romania)**
- ✓ Legal - Both EU member states
- No additional safeguards needed
- Same GDPR protections apply

**Scenario 2: Data stored on AWS servers**

| AWS Region | GDPR Compliance | Action Required |
|-----------|----------------|-----------------|
| **EU regions** (Frankfurt, Ireland, Paris, Stockholm) | ✓ Full compliance | **RECOMMENDED** - Use EU-only regions |
| **US regions** (with EU-US Data Privacy Framework) | ⚠️ Conditional | Ensure AWS signed DPF, SCCs in place |
| **Non-EU regions** | ❌ High risk | **AVOID** unless absolutely necessary with SCCs |

**AWS Compliance:**
- AWS offers GDPR Data Processing Addendum (DPA) - **MUST execute**
- Use EU regions for data residency
- Standard Contractual Clauses (SCCs) automatic with AWS DPA
- Document in Privacy Policy: "Data stored in EU AWS regions"

**Third-Party Processors:**

| Service | Purpose | Data Transfer | Action Required |
|---------|---------|---------------|-----------------|
| **Stripe** | Payments | EU entity (Stripe Payments Europe, Dublin) | ✓ GDPR compliant, review DPA |
| **Olbio** | Invoicing | Romania | ✓ EU - standard processor agreement |
| **SendGrid/Resend** | Email | US/EU | Ensure EU routing, SCCs in DPA |
| **Twilio** | SMS | US company | US-EU DPF certified, SCCs required |
| **Fan Curier** | Delivery | Romania | ✓ EU - processor agreement |
| **DHL** | International delivery | Global | GDPR-compliant EU entity, DPA |

**Action Items:**
1. Execute Data Processing Agreements (DPA) with ALL processors
2. Maintain register of processors (Art. 30 GDPR)
3. Document data transfer mechanisms (EU adequacy, SCCs, DPF)
4. Privacy Policy must list all processors and transfer safeguards

### 1.5 DPO (Data Protection Officer) Requirement

#### Art. 37 GDPR - Mandatory DPO When:

1. Processing by public authority (except courts) - **NOT applicable**
2. Core activities consist of processing requiring **regular and systematic monitoring** of data subjects on a large scale - **APPLICABLE**
3. Core activities consist of processing **special categories** of data on a large scale - **NOT applicable** (no health, biometric for auth)

#### Analysis for eGhiseul.ro

**Regular and Systematic Monitoring:**
- ✓ Collecting CNP (Personal Numeric Code) - unique identifier
- ✓ Processing ID document copies - systematic
- ✓ Selfie with ID - face images (borderline biometric)
- ✓ Tracking order status - systematic monitoring
- ✓ Storing data for up to 10 years - systematic

**Large Scale:**
EDPB Guidelines - factors:
- Number of data subjects: Current ~250 orders/month = 3,000/year
- Volume of data: High (ID copies, CNP, addresses, signatures)
- Geographical extent: EU-wide (diaspora)
- Duration: 10 years retention

**Conclusion: DPO is RECOMMENDED NOW, MANDATORY when scaling >5,000 customers/year**

Even if not legally mandatory yet, appointing DPO demonstrates compliance commitment.

#### DPO Options

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| **Internal DPO** | Salary + training | Full control, dedicated | Conflict of interest if also management |
| **External DPO** | €500-2,000/month | Independent, expertise | Less availability |
| **DPO-as-a-Service** | €200-800/month | Cost-effective for startups | Shared resource |

**DPO Responsibilities:**
- Monitor GDPR compliance
- Conduct Data Protection Impact Assessments (DPIA)
- Train staff on data protection
- Point of contact for supervisory authority (ANSPDCP in Romania)
- Advise on RTBF requests, data breaches

**Recommendation:** Appoint external DPO initially, transition to internal when team >10 people

### 1.6 Privacy Policy Requirements

#### Mandatory Disclosures (Art. 13 GDPR)

**Must Include:**
1. **Identity and contact** of data controller (eGhiseul.ro / EDIGITALIZARE SRL)
2. **Contact details of DPO** (email, address)
3. **Purposes and legal basis** for each processing activity (see table 1.3)
4. **Legitimate interests** if applicable (analytics, fraud prevention)
5. **Recipients of data** (Stripe, Olbio, couriers, government institutions)
6. **Data retention periods** (specific - see table 1.1)
7. **Data subject rights**:
   - Right to access (Art. 15)
   - Right to rectification (Art. 16)
   - Right to erasure (Art. 17)
   - Right to restriction (Art. 18)
   - Right to data portability (Art. 20)
   - Right to object (Art. 21)
   - Right to withdraw consent (Art. 7(3))
   - Right to lodge complaint with ANSPDCP
8. **Automated decision-making** (if any - disclose)
9. **Data transfers** (AWS regions, third-party countries, safeguards)
10. **Source of data** (directly from customer, OCR extraction)

#### Additional Romanian Requirements (Law 190/2018)

- Privacy Policy in **Romanian language** (mandatory)
- Submit to ANSPDCP if processing sensitive data at scale (optional notification)
- Cookie policy separate or integrated

#### ANSPDCP (Romanian Supervisory Authority)

**Contact:** Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal
- Website: dataprotection.ro
- Email: anspdcp@dataprotection.ro
- No mandatory registration for private businesses (unlike Spain, etc.)
- Must notify data breaches within 72 hours (Art. 33 GDPR)

**Data Breach Notification Plan:**
1. Detect breach
2. Assess risk to individuals
3. Notify ANSPDCP within 72 hours if high risk
4. Notify affected individuals if high risk to rights/freedoms
5. Document breach in breach register (even if not reportable)

---

## 2. Romanian Contract Law

### 2.1 Electronic Signature Legal Validity (Law 455/2001)

#### Legal Framework
- **Law 455/2001** on electronic signatures (aligned with eIDAS Regulation 910/2014)
- **eIDAS Regulation** - EU-wide recognition of electronic signatures
- **Civil Code** (Law 287/2009) - contracts, proof requirements

#### Three Types of Electronic Signatures

| Type | Legal Effect | Requirements | Cost | Use Case |
|------|-------------|--------------|------|----------|
| **Simple Electronic Signature (SES)** | Data in electronic form attached to other data | Any digital mark (typed name, scanned image, checkbox) | Free | Low-value, low-risk |
| **Advanced Electronic Signature (AdES)** | Uniquely linked to signatory, capable of identifying signatory, created with means under sole control | Qualified signature pad, cryptographic keys | €5-50/signature | Medium risk |
| **Qualified Electronic Signature (QES)** | = Advanced + created by qualified signature device + qualified certificate | Smart card, USB token from certified provider | €50-150/year + per-signature fees | **Equivalent to handwritten** (Art. 25(2) eIDAS) |

#### Application to eGhiseul.ro

**Current Approach:** Canvas signature (Simple Electronic Signature)

**Legal Validity:**
- ✓ Admissible as evidence (Art. 25(1) eIDAS - cannot be denied solely because electronic)
- ⚠️ **Rebuttable** - customer could claim "I didn't sign this" and burden of proof on eGhiseul.ro
- ✓ Sufficient for **low-risk contracts** (service agreements, authorization)
- ❌ **NOT equivalent** to handwritten signature (only QES is)

**Risk Assessment:**

| Scenario | Risk with SES (Canvas) | Recommended Signature Type |
|----------|----------------------|---------------------------|
| Customer disputes contract terms | Medium - could claim didn't sign | AdES or QES |
| Customer claims unauthorized processing | Low - IP logs, email confirms consent | SES acceptable |
| Court requires proof of customer intent | Medium-High - SES weak evidence | QES recommended |
| Tax audit of contracts | Low-Medium - ANAF accepts scanned signatures typically | SES acceptable with supporting evidence |
| Customer claims fraud/identity theft | **HIGH** - SES easily repudiated | **AdES minimum, QES preferred** |

**Legal Requirements for SES to be Defensible:**

Under Romanian jurisprudence, Simple Electronic Signatures are stronger when:
1. **Written consent** to use electronic signatures (checkbox in flow)
2. **Identity verification** before signature (KYC with ID + selfie) ✓
3. **Audit trail** (IP address, timestamp, device info) ✓
4. **Copy provided** to customer immediately (email with PDF) ✓
5. **Non-repudiation clause** in T&C (customer acknowledges validity)

**eGhiseul.ro Current Strengths:**
- ✓ KYC with ID + selfie BEFORE signature
- ✓ Timestamped, IP-logged
- ✓ Immediate email with signed contract
- ✓ Customer must check T&C accepting electronic signature

**Weaknesses:**
- Canvas signature can be drawn by anyone with access to device
- No cryptographic non-repudiation
- In dispute, customer could claim "someone else completed form with my ID"

#### Recommendations

**Short-term (MVP):**
- Continue with SES (canvas signature)
- Add explicit consent: "I agree to use electronic signature with legal validity per Law 455/2001"
- Strengthen audit trail: Browser fingerprint, session recording metadata (not content)
- Add to T&C: "By signing electronically, you acknowledge this has same legal effect as handwritten signature and waive any challenge based solely on electronic format"

**Medium-term (Scale):**
- Integrate **AdES provider** for higher-value contracts
- Options:
  - **Adobe Sign** - €10-30/month for small volume
  - **DocuSign** - AdES compliant in EU
  - **Namirial** (Italian, popular in Romania)
  - **Certinomis** (French, eIDAS qualified)
- Use AdES for contracts >500 RON or when customer requests

**Long-term (Enterprise/B2B):**
- Offer **QES option** for corporate customers
- Integrate with Romanian QES providers:
  - **Certinomis Romania**
  - **Namirial**
  - Allow customers to sign with Romanian eID card (if available)

### 2.2 Contract Storage Requirements

#### Legal Framework
- **Law 82/1991** (Accounting Law) - Art. 22
- **Fiscal Procedure Code** (Law 207/2015)
- **OMFP 2634/2015** - Accounting documents retention

#### Mandatory Retention: 10 Years

**Scope:** All documents supporting financial/fiscal operations:
- Contracts for services
- Invoices
- Payment records
- Accounting ledgers

**Starting Point:** End of fiscal year when document was created
- Example: Contract signed March 2024 → Retain until 31 December 2034

**Format:** Original format (electronic contracts remain electronic)
- No requirement to print electronic documents
- Must ensure readability throughout retention period
- Must protect against alteration (checksums, immutable storage recommended)

#### Storage Requirements

**Technical:**
- ✓ Readable format (PDF/A recommended for long-term preservation)
- ✓ Searchable/retrievable (by contract number, customer, date)
- ✓ Protected against unauthorized access (encryption at rest)
- ✓ Protected against alteration (version control, audit logs)
- ✓ Backup and disaster recovery (3-2-1 rule: 3 copies, 2 media, 1 offsite)

**Legal:**
- Must be producible upon ANAF (tax authority) request within reasonable timeframe
- Must be in original format (scanned printouts of electronic docs NOT acceptable)
- Must include all annexes, amendments

**Compliance Actions for eGhiseul.ro:**
1. Store contracts in S3 with:
   - Versioning enabled (immutability)
   - Lifecycle policy: Archive to Glacier after 3 years (cost optimization, still retrievable)
   - Encryption at rest (S3 AES-256)
   - Cross-region replication (disaster recovery)
2. Database retention:
   - Contract metadata in PostgreSQL (contract number, customer, date, status)
   - Link to S3 object
   - Automated reports for contracts approaching deletion date
3. Annual audit:
   - Generate report of all contracts stored
   - Verify integrity (checksum validation)
   - Test retrieval process

### 2.3 Power of Attorney (Împuternicire) Requirements

#### Legal Framework
- **Civil Code (Law 287/2009)** - Art. 2009-2043 (Mandate/Representation)
- **Specific agency requirements** (ANP for criminal records, city halls for certificates)

#### Împuternicire vs. Delegație

| Document | Use | Requirements | Notarization |
|----------|-----|--------------|--------------|
| **Împuternicire** | General authorization for legal acts | Written, signed by principal, specific powers listed | Not required for non-notarized acts |
| **Delegație** | Specific one-time task (pick up document) | Written, signed, ID copies | Not required |
| **Procură Autentică** | Notarized power of attorney | Notary public authentication | Required for property transactions |

#### Requirements for eGhiseul.ro Services

**Cazier Judiciar (Criminal Record):**
- **ANP Requirements:** Written authorization (împuternicire/delegație) + ID copy of both principal and representative
- **Can be:** Simple signed document (SES acceptable as principal confirms via KYC)
- **Must Include:**
  - Principal full name, CNP, address, ID details
  - Representative (eGhiseul.ro / EDIGITALIZARE SRL) full details
  - Specific task: "to obtain criminal record certificate on my behalf"
  - Signature and date
  - ID copies attached

**Certificates (Birth, Marriage, etc.):**
- **City Hall Requirements:** Vary by locality
- **Most accept:** Simple authorization letter with ID copies
- **Some require:** Notarized împuternicire (rare)
- **Best practice:** Template that meets highest standard (accepted everywhere)

**ONRC Certificat Constatator:**
- **For legal entities:** Legal representative (administrator) must sign
- **If not legal rep:** Notarized împuternicire from administrator
- **For physical persons (PFA, II):** Simple authorization OK

#### Template Requirements (Legal Validity)

**Minimal împuternicire must contain:**
1. Place and date of issuance
2. Principal identity (name, CNP, ID number, address)
3. Representative identity (EDIGITALIZARE SRL, CUI, representative name)
4. Specific powers granted ("to request, receive, and sign for [specific document]")
5. Duration (specific date or "until task completion")
6. Principal signature
7. Attachments: Principal ID copy, representative ID/registration copy

**Template Generation in eGhiseul.ro:**
- Auto-populate from order data
- Pre-fill principal info from KYC
- Include electronic signature from canvas
- Attach scanned ID automatically
- Generate PDF with all elements

**Legal Risk Mitigation:**
- Institution could reject if considers electronic signature insufficient
- Fallback: Offer customer to download, print, handwritten sign, and re-upload
- For repeat rejections: Recommend notarized împuternicire (customer pays notary fee)

### 2.4 Consumer Protection Obligations

#### Legal Framework
- **Law 296/2004** - Consumer Protection Code
- **OUG 34/2014** - Consumer Rights Directive implementation (distance/off-premises contracts)
- **ANPC** - National Authority for Consumer Protection (regulatory body)

#### Pre-Contractual Information Requirements (Art. 4 OUG 34/2014)

**Must Provide BEFORE Order Completion:**
1. **Main characteristics of service** (what document, how obtained, timeline)
2. **Total price** including all taxes and fees (no hidden costs)
3. **Identity of trader:**
   - Trade name (EDIGITALIZARE SRL)
   - Registered office
   - CUI (tax ID)
   - Contact (phone, email)
4. **Payment methods** accepted
5. **Delivery arrangements** (electronic, courier, timeline, cost)
6. **Right of withdrawal** terms (14 days) and exceptions
7. **Complaint handling** policy
8. **Duration of contract** (one-time service vs. ongoing)
9. **Functionality of digital content** (if applicable - e.g., PDF format)

**Where to Display:**
- Service landing page (summary)
- Checkout page (full details)
- T&C (comprehensive)
- Confirmation email (recap)

**Language:** Romanian (mandatory), English (optional for UX)

#### Distance Selling Specific Rules

**Definition:** Contract concluded without simultaneous physical presence (all eGhiseul.ro sales)

**Additional Requirements:**
- **Durable medium confirmation:** Email with contract terms within reasonable time after order
- **Information format:** Clear, comprehensible, in Romanian
- **Accessible T&C:** Downloadable, printable before order

#### ANPC Registration and Compliance

**SOL (Online Dispute Resolution) Platform:**
- EU Regulation 524/2013 requires link to https://ec.europa.eu/consumers/odr
- Must be on website footer
- Must inform customers of ODR availability

**ANPC Contact:**
- Display ANPC contact for complaints: 0800.080.999 or anpc.ro
- Handle complaints within 30 days

**Consumer Rights Poster:**
- Not required for online-only businesses (required for physical locations)

---

## 3. KYC and Identity Verification

### 3.1 Legal Requirements for Identity Verification

#### Legal Framework
- **Law 129/2019** - Prevention of money laundering and terrorism financing
- **GDPR** - Lawful basis for processing ID documents
- **Contract Law** - Verification of contracting party identity
- **Fraud Prevention** - Legitimate interest (Art. 6(1)(f) GDPR)

#### When is KYC Required?

**Money Laundering Law (129/2019) - Obligated Entities:**
- Banks, financial institutions
- Lawyers, notaries
- Real estate agents
- **NOT** service providers like eGhiseul.ro (unless payment >€10,000 in cash)

**Conclusion:** AML/KYC law does NOT mandate identity verification for eGhiseul.ro

**However, Identity Verification is JUSTIFIED by:**
1. **Contract performance** (Art. 6(1)(b) GDPR) - need to verify who is contracting
2. **Legitimate interest** (Art. 6(1)(f) GDPR) - fraud prevention, ensuring correct person receives sensitive documents
3. **Legal obligation** (implicit) - cannot legally represent someone without verifying their identity
4. **Service requirement** - government institutions require ID verification to release documents

#### What KYC Can Legally Collect

| Document | Legal Basis | Retention | Notes |
|----------|-------------|-----------|-------|
| **ID card/Passport copy** | Contract performance + legitimate interest | Duration of service + 3 years (legal claims) | Must verify authenticity |
| **Selfie with ID** | Legitimate interest (fraud prevention) | Same as ID | Enhanced security measure |
| **CNP** | Contract performance (required by government agencies) | 10 years (in contract) | Minimize exposure, encrypt |
| **Driving license** | Contract performance (for Cazier Auto specifically) | Same as ID | Only when service requires |
| **Parent IDs** | Contract performance (for minor certificates) | Same as ID | Only when legally required |

**Cannot Collect Without Specific Justification:**
- Health information
- Biometric data FOR AUTHENTICATION (face image for verification is OK, face template storage for login is NOT without explicit consent and higher protection)
- Political opinions, religion
- Bank account details (Stripe handles payment, eGhiseul.ro doesn't need to store)

### 3.2 Document Retention for Fraud Prevention

#### Balancing GDPR Minimization with Fraud Prevention

**GDPR Position:**
- Data minimization (Art. 5(1)(c)) - collect only necessary data
- Storage limitation (Art. 5(1)(e)) - keep only as long as necessary
- **BUT** legitimate interest (Art. 6(1)(f)) allows fraud prevention

**Recommended Retention:**

| Document Type | Retention Period | Justification |
|---------------|-----------------|---------------|
| **ID copies for completed orders, no issues** | 3 years after service completion | Civil Code statute of limitations (Art. 2517 - 3 years for service contracts) |
| **ID copies for disputed/fraudulent orders** | Until resolution + 3 years | Legal claims defense |
| **Selfie with ID** | Same as ID | Part of KYC verification |
| **Transaction logs (IP, device fingerprint)** | 5 years | Fraud pattern analysis, PSD2 compliance |
| **Flagged fraudulent attempts** | 5-7 years | Blacklist, fraud prevention network sharing (with consent/legal basis) |

**After Retention Period:**
- **Pseudonymize** before deletion (replace personal identifiers with random IDs)
- Keep statistical data (anonymized) indefinitely for business intelligence
- Document deletion in audit log

### 3.3 GDPR vs. Anti-Money Laundering (AML) Requirements

#### Interaction Between Regimes

**For eGhiseul.ro:**
- AML Law 129/2019 does NOT apply (not an obligated entity)
- GDPR DOES apply fully
- No conflict - GDPR legitimate interest sufficient for KYC

**If in Future eGhiseul.ro Processes >€10,000 Cash:**
- Would become AML obligated entity
- Must conduct Customer Due Diligence (CDD)
- Retention: 5 years MANDATORY (overrides GDPR minimization per Art. 6(1)(c) legal obligation)
- Must appoint Compliance Officer
- Report suspicious transactions to ONPCSB (Romanian FIU)

**Current Recommendation:**
- Avoid cash transactions >€10,000
- Stripe handles all payment processing (out of scope for eGhiseul.ro AML obligations)
- Continue KYC under GDPR legitimate interest + contract performance

---

## 4. E-commerce Regulations (OUG 34/2014)

### 4.1 Consumer Rights Directive Implementation

#### 14-Day Withdrawal Right (Art. 9-17 OUG 34/2014)

**General Rule:** Consumers have **14 calendar days** from contract conclusion (for services) to withdraw WITHOUT giving reason and WITHOUT penalty.

**Critical Exception - Art. 16(1)(a) OUG 34/2014:**
> "The right of withdrawal does not apply to service contracts after the service has been **fully performed**, if performance has begun **with the consumer's prior express consent** and with the acknowledgment that he will lose his right of withdrawal once the contract has been fully performed by the trader."

#### Application to eGhiseul.ro Services

**Standard Services (3-5 days processing):**
- Customer cannot wait 14 days to withdraw (service completed before withdrawal period ends)
- **If customer orders standard service:** Right of withdrawal applies UNTIL service completed
- **If customer orders urgent service:** Can waive withdrawal right (see below)

**Urgent/Express Services:**
- **Customer explicitly requests** urgent processing (checkbox/option)
- **Service begins immediately**
- **Customer acknowledges** waiving withdrawal right
- ✓ **Exception applies** - no withdrawal right

**Legal Requirements to Invoke Exception:**
1. **Customer expressly consents** to immediate performance
2. **Customer acknowledges** losing withdrawal right
3. **Before order completion**, customer must check box: "I request immediate processing and acknowledge I will lose my right of withdrawal once service is completed"
4. **Confirmation email** must restate this

**Implementation in eGhiseul.ro:**

**At Checkout (before payment):**
- Checkbox (REQUIRED to proceed): "I request that eGhiseul.ro begins processing my order immediately. I understand that once the service is completed, I will lose my right to withdraw from this contract per Art. 16(1)(a) OUG 34/2014."
- For urgent services: Already implied by urgency selection, but still show checkbox

**In T&C:**
- Section on withdrawal rights
- Explain 14-day right
- Explain exception for completed services
- Explain how to exercise withdrawal (email to contact@eghiseul.ro)

**In Confirmation Email:**
- "You have requested immediate processing. Per your consent, you will lose your right of withdrawal once we complete the service."

**If Customer Withdraws Before Completion:**
- Must honor withdrawal
- Refund payment minus proportional cost for services already performed (if any)
- Example: If cazier already obtained but not yet translated, refund translation cost

**If Customer Withdraws After Completion:**
- Can refuse withdrawal
- Cite Art. 16(1)(a) exception
- Provide evidence of prior consent (screenshot of checkbox, T&C, confirmation email)

### 4.2 Pre-Contractual Information Requirements

#### Art. 4 OUG 34/2014 - Information Obligations

Must provide IN CLEAR, COMPREHENSIBLE MANNER before order:

1. **Main characteristics of services:**
   - What document (cazier judiciar, certificate, etc.)
   - Processing time (standard, urgent)
   - Delivery method (electronic, physical)
   - Requirements (CNP, ID, etc.)

2. **Trader identity and contact:**
   - EDIGITALIZARE SRL
   - CUI: [insert]
   - Registered office: [insert]
   - Email: contact@eghiseul.ro
   - Phone: [insert]

3. **Total price:**
   - Base service price
   - Options (urgency, translation, apostille) itemized
   - Delivery fees
   - All taxes included (TVA)
   - **FINAL TOTAL before payment**
   - No hidden fees

4. **Payment arrangements:**
   - Stripe card payment
   - When charged (immediately upon order)
   - Currency (RON)

5. **Delivery:**
   - Electronic: Within X days to email
   - Physical Romania: +X days via Fan Curier
   - Physical International: +X days via DHL/Post
   - Costs for each option

6. **Right of withdrawal:**
   - 14 days
   - Exception for completed services
   - How to exercise (template form link)
   - Consequences (refund timeline)

7. **Complaints:**
   - Email contact@eghiseul.ro
   - ANPC contact (0800.080.999)
   - SOL platform link

8. **Contract duration:**
   - One-time service (not subscription)

9. **Digital content (if applicable):**
   - PDF format
   - Compatible with standard PDF readers
   - No DRM

**Where to Display:**
- Service page: Summary
- Checkout: Full details, link to T&C
- T&C document: Comprehensive
- Confirmation email: Recap

**Standard Contractual Terms Document:**
- Must be downloadable as PDF
- Version control (update date)
- Customer consent: "I have read and accept the Terms & Conditions and Privacy Policy"

### 4.3 Price Display Requirements

#### Legal Framework
- **Law 296/2004** - Consumer Protection Code
- **OUG 34/2014** - Distance contracts
- **OUG 99/2000** - Price display for services

#### Mandatory Price Information

**All Prices Must:**
1. **Include ALL taxes** (TVA 19% for services in Romania)
2. **Be in LEI (RON)** - local currency mandatory
3. **Show final total** before purchase
4. **Not include hidden fees** - all costs disclosed upfront

**Price Display Format:**

✓ **Correct:**
- "Cazier Judiciar - 150 RON (TVA inclus)"
- "Total: 428 RON (include: serviciu 150 RON + urgenta 100 RON + traducere 78 RON + apostila 100 RON, TVA inclus)"

❌ **Incorrect:**
- "Cazier Judiciar - 126 RON + TVA"
- "From 150 RON" (unless clearly "de la" with full price breakdown available)
- Showing price, then adding fees at payment (bait-and-switch)

**Dynamic Pricing (Options):**
- Base price displayed on service page
- Additional costs (urgency, translation, etc.) shown in real-time as selected
- Running total updated continuously
- Final total prominently displayed before payment button

**Delivery Costs:**
- Must be clearly communicated before checkout finalization
- If variable (depends on customer location), show calculator or table
- Cannot charge MORE than displayed - can charge less (discount)

**Discount/Coupon Display:**
- Show original price (strikethrough)
- Show discount amount
- Show final price after discount
- Clearly state discount terms (expiry, conditions)

**PJ Volume Discounts:**
- Display discount tiers table
- Auto-apply based on quantity
- Show "You save X RON" message

**Recommendations:**
1. Price breakdown widget visible throughout flow
2. "No hidden fees" badge
3. Comparison to market prices (if competitive)
4. Money-back guarantee terms (if offered)

### 4.4 Additional E-Commerce Requirements

#### Website Footer Must Include:

1. **Company details:**
   - Legal name: EDIGITALIZARE SRL
   - CUI: [insert]
   - Reg. Com.: [insert]
   - Registered office address
   - Contact email, phone

2. **Legal links:**
   - Terms & Conditions
   - Privacy Policy
   - Cookie Policy
   - Return/Refund Policy
   - ANPC link (anpc.ro)
   - SOL platform (https://ec.europa.eu/consumers/odr)

3. **Payment security:**
   - "Secure payment via Stripe" with logo
   - SSL certificate indicator

#### Complaint Handling (ANPC Requirements)

**Timeline:**
- Must respond within **30 calendar days** of complaint receipt
- If cannot resolve, inform customer of next steps

**Process:**
1. Customer emails complaint to contact@eghiseul.ro
2. Acknowledge receipt within 48 hours
3. Investigate and propose solution within 30 days
4. If customer unsatisfied, inform of SOL/ANPC options

**Internal Complaint Register:**
- Track all complaints
- Resolution status
- Response time
- Use for quality improvement

**SOL (Online Dispute Resolution):**
- Link: https://ec.europa.eu/consumers/odr
- Customers can file complaint if unresolved
- eGhiseul.ro must respond via SOL platform

---

## 5. Invoicing and Fiscal Compliance

### 5.1 E-Factura (RO e-Invoicing) Requirements

#### Legal Framework
- **OUG 120/2021** - E-transport and e-invoice
- **ANAF Order 1669/2022** - E-invoice implementation
- **Timeline:**
  - B2B (PJ → PJ): Mandatory from 1 January 2024
  - B2G (PJ → Public institutions): Mandatory from 1 July 2022
  - B2C (PJ → PF): **Voluntary** until further notice (expected mandatory 2025-2026)

#### Current Requirements (2024)

**For B2B (Company Customers):**
- **Mandatory:** Generate e-invoice in RO_CIUS format (XML)
- **Upload to ANAF SPV** (Virtual Private Space) via API or web portal
- **Timeline:** Within **5 days** of invoice date
- **Validation:** ANAF validates and assigns unique index number

**For B2C (Individual Customers):**
- **Currently voluntary** - can issue traditional PDF invoices
- **Recommended:** Prepare for future mandate - use e-invoice system for all
- **Alternative:** Use invoicing provider (Olbio) that supports both formats

#### E-Factura Integration Options

**Option 1: Direct ANAF API Integration**
- Pros: Full control, no fees
- Cons: Complex, requires developer resources, OAuth2 setup, XML generation, error handling
- Cost: Development time ~40-80 hours

**Option 2: Invoicing Provider (Olbio, SmartBill, Factura.ro)**
- Pros: Handles ANAF upload, compliance, format conversion
- Cons: Monthly fee, dependency on third party
- Cost: €10-50/month depending on volume

**eGhiseul.ro Current Setup:**
- Using **Olbio** for invoicing
- ✓ Olbio supports e-factura upload to ANAF
- Action: Ensure Olbio integration sends B2B invoices to ANAF automatically

**Implementation Checklist:**
1. Verify Olbio e-factura module enabled
2. Test B2B invoice flow:
   - Customer provides CUI
   - Invoice generated
   - Olbio uploads to ANAF SPV
   - Customer can download from ANAF
3. Monitor for ANAF errors/rejections
4. For B2C: Continue PDF invoices, prepare for future switch

### 5.2 Invoice Storage Requirements

#### Fiscal Code (Law 82/1991) - Art. 22

**Mandatory Retention: 10 years**
- From end of fiscal year when issued
- Example: Invoice issued March 2024 → Retain until 31 Dec 2034

**Format:**
- Original format (PDF for traditional, XML + PDF for e-factura)
- Must be readable, printable, searchable
- Protected against alteration

**Access:**
- Producible upon ANAF request
- Reasonable timeframe (typically 5-10 business days)

**Compliance:**
- Same storage requirements as contracts (see Section 2.2)
- S3 storage with versioning, encryption
- Database index for quick retrieval

### 5.3 PF vs. PJ Invoicing Differences

#### Persoană Fizică (PF - Individual) Invoice

**Required Fields:**
1. Invoice number (sequential, no gaps)
2. Issue date
3. Seller:
   - EDIGITALIZARE SRL
   - CUI
   - Registered address
   - Reg. Com.
4. Buyer:
   - Full name
   - CNP (optional but recommended for individuals)
   - Address
5. Service description
6. Quantity (typically 1 for services)
7. Unit price
8. Total before VAT
9. VAT 19%
10. Total including VAT
11. Payment method
12. Signature (electronic or printed)

**VAT:**
- Standard rate **19%** for services
- Included in displayed prices (B2C pricing convention)

**Delivery:**
- Email as PDF
- Available in customer account

#### Persoană Juridică (PJ - Company) Invoice

**Additional Requirements:**
1. **Buyer CUI** (mandatory)
2. **Buyer Reg. Com.** number
3. **Buyer registered office** address
4. **E-factura:** Must upload to ANAF SPV (B2B mandatory)

**Reverse Charge:**
- NOT applicable for domestic B2B services (standard 19% VAT applies)
- Applies only for intra-EU B2B services (if eGhiseul.ro provides services to EU company)
- If reverse charge: Invoice shows 0% VAT with mention "Reverse charge - Art. 196 Fiscal Code"

**Volume Discounts:**
- Show on invoice: Original price, discount %, final price
- Example:
  - "10 x Cazier Judiciar @ 150 RON = 1,500 RON"
  - "Discount 10% (10-19 employees) = -150 RON"
  - "Subtotal = 1,350 RON"
  - "VAT 19% = 256.50 RON"
  - "Total = 1,606.50 RON"

#### Series and Numbering

**Legal Requirement:**
- Sequential numbering per series
- No gaps (if invoice 101, then next must be 102, cannot skip to 103)
- Can have multiple series (e.g., EG-2024-0001, EG-2024-0002)

**Best Practice:**
- One series per year: "EG-2024-XXXX"
- Reset annually or continue sequentially

**Handling Cancelled Invoices:**
- DO NOT delete or skip number
- Issue credit note (nota de credit) referencing cancelled invoice
- Reason for cancellation

---

## 6. Document Services Specific Regulations

### 6.1 Authorization Requirements to Obtain Documents on Behalf

#### General Representation Law

**Civil Code (Art. 2009-2043) - Mandate:**
- Contract by which one party (mandatar) undertakes to perform legal acts for another party (mandant)
- Requires written authorization for acts beyond ordinary management
- Mandatar must act in mandant's interest

**Application:**
- eGhiseul.ro acts as **mandatar** (representative)
- Customer is **mandant** (principal)
- Contract + împuternicire = legal basis to act

#### Specific Document Requirements

**1. Cazier Judiciar (Criminal Record) - ANP**

**Legal Basis:**
- Law 290/2004 - Criminal record organization
- ANP Procedure (updated periodically)

**Requirements for Representative:**
- Written authorization (împuternicire/delegație)
- Copy of principal's ID
- Copy of representative's ID (EDIGITALIZARE SRL legal rep)
- Specific mention of cazier judiciar request

**Methods:**
- In person at ANP office
- Online via ANP portal (requires citizen digital certificate - NOT viable for eGhiseul.ro)
- By mail with notarized împuternicire (some offices)

**eGhiseul.ro Process:**
1. Customer provides data + KYC
2. eGhiseul.ro generates împuternicire
3. eGhiseul.ro rep goes to ANP office with documents
4. ANP issues cazier to eGhiseul.ro rep
5. eGhiseul.ro delivers to customer

**Potential Issue:**
- Some ANP offices strict about electronic signatures
- Mitigation: Have template, most accept with ID copies
- If rejected: Customer must send notarized or handwritten-signed version

**2. Certificat de Cazier Fiscal (Fiscal Record) - ANAF**

**Legal Basis:**
- Fiscal Procedure Code (Law 207/2015)

**Requirements:**
- Similar to cazier judiciar
- Împuternicire + ID copies
- Can be requested online via SPV (Virtual Private Space) if customer has ANAF credentials (most don't)

**eGhiseul.ro Process:**
- In-person request at ANAF office with împuternicire

**3. Certificates (Birth, Marriage, Death) - City Halls**

**Legal Basis:**
- Civil Status Law 119/1996

**Requirements:**
- Vary by city hall
- Generally: Împuternicire + ID copies
- Some larger cities accept email requests
- Some small communes require in-person only

**Challenges:**
- 3,181 communes in Romania - inconsistent procedures
- Some require notarized authorization
- Some require proof of relationship (for family member requests)

**eGhiseul.ro Approach:**
- Standard împuternicire template
- For recurring rejections (same city hall), offer notarized option to customer
- Build relationship with frequently-used city halls

**4. Certificat de Integritate (Integrity Certificate) - ANI**

**Legal Basis:**
- Law 176/2010 - Integrity in public sector

**Requirements:**
- Similar to cazier judiciar
- ANI accepts împuternicire + ID copies

**5. Certificat Constatator (Ascertaining Certificate) - ONRC**

**Legal Basis:**
- Law 26/1990 - Trade Register

**Requirements:**
- For PJ: Legal representative must sign OR notarized împuternicire from legal rep
- For PFA/II: Simple împuternicire OK
- Can be requested online via ONRC portal (paid)

**eGhiseul.ro Process:**
- Online request via ONRC portal
- Payment via ONRC system
- Download certificate
- No physical presence needed (easier than others)

**6. Extras Carte Funciară (Land Registry Extract) - ANCPI**

**Legal Basis:**
- Law 7/1996 - Cadastre and Land Registry

**Requirements:**
- **Anyone can request** (public information)
- NO împuternicire needed
- Just need cadastral number or address

**eGhiseul.ro Process:**
- Customer provides address/cadastral number
- eGhiseul.ro requests online via ANCPI portal
- Download extract
- Simplest service (no KYC technically needed, but good practice for billing)

### 6.2 Apostille Service Regulations

#### Legal Framework
- **Hague Convention 1961** - Abolishing requirement of legalization
- **Romania:** Party since 1999
- **Authority:** Ministry of Justice (for documents issued by courts, prosecutors, notaries)
- **Ministry of Internal Affairs:** For documents issued by police, city halls
- **Ministry of Education:** For education documents

#### Apostille Process

**What is Apostille:**
- Certification that document is genuine
- Allows use in other Hague Convention countries (>100 countries)
- Replaces embassy legalization

**eGhiseul.ro Services Requiring Apostille:**
- Criminal records (for work/residence abroad)
- Birth/marriage certificates (for family reunification, marriage abroad)
- Fiscal records (for business abroad)

**Process:**
1. Obtain original document (e.g., cazier judiciar)
2. Submit to competent apostille authority (depends on document type)
3. Authority affixes apostille stamp/sticker
4. Return apostilled document

**Timeline:**
- Standard: 5-10 business days
- Urgent: 1-3 days (higher fee)

**Cost:**
- Official apostille fee: ~50-100 RON (depends on authority)
- eGhiseul.ro margin + service fee
- Total to customer: 238 RON (per PRD)

**eGhiseul.ro Requirements:**
- Împuternicire from customer to request apostille
- Original document or certified copy
- Payment of official fees

**Legal Risk:**
- Must ensure correct apostille authority (different per document type)
- Must preserve document integrity (no alterations)

### 6.3 Translation Certification Requirements

#### Legal Framework
- Law 178/1997 - Authorized translators
- Ministry of Justice - Register of authorized translators

#### Types of Translations

| Type | Use | Legal Effect | Provider |
|------|-----|--------------|----------|
| **Informative translation** | Personal understanding | Not legally valid | Anyone |
| **Certified translation** | Official use abroad | Legally recognized | Authorized translator (licensed by MOJ) |
| **Sworn translation** | Court proceedings | Evidence in court | Sworn translator |

#### eGhiseul.ro Translation Services

**Offering:** Certified translations in 20 languages

**Requirements:**
1. **Use authorized translators** - Must be on MOJ register
2. **Translator stamp and signature** on each page
3. **Translation certificate** attached (translator certifies accuracy)
4. **Legalization** (optional) - Some countries require translation legalization

**Legal Relationship:**
- eGhiseul.ro acts as intermediary
- Subcontracts to authorized translators
- Customer contract is with eGhiseul.ro, eGhiseul.ro has contract with translator

**Pricing:**
- Per-word or per-page rates from translator
- eGhiseul.ro margin
- Tiered pricing (per PRD) based on language rarity:
  - Tier 1 (English, German, etc.): Lower rates
  - Tier 5 (Japanese, Arabic, etc.): Higher rates

**Quality Assurance:**
- Use same trusted translators
- Review translator credentials (MOJ registration)
- Customer can dispute translation quality (translator liability, but eGhiseul.ro first point of contact)

**Legalization of Translations:**
- Some countries require translation legalization (different from apostille)
- Additional service eGhiseul.ro can offer
- Process: Translation → Notary authentication → Apostille/Legalization

---

## 7. Data Localization and Storage

### 7.1 Where Must Data Be Stored?

#### GDPR Data Localization

**Answer: NO mandatory data localization within specific EU country**

GDPR allows free flow of personal data within EU/EEA:
- Can store data anywhere in EU/EEA
- No requirement to store Romanian customer data in Romania
- No notification to Romanian DPA (ANSPDCP) for storage in other EU countries

**Best Practice for eGhiseul.ro:**
- Use EU regions (Frankfurt, Paris, Ireland, Stockholm)
- Avoid non-EU regions unless adequacy decision or SCCs in place

#### Data Transfers Outside EU/EEA

**Prohibited unless:**
1. **Adequacy decision** (EU Commission determined adequate protection)
   - Countries: UK, Switzerland, Japan, South Korea, etc.
   - NOT USA (previous Safe Harbor and Privacy Shield invalidated)
2. **Standard Contractual Clauses (SCCs)**
   - Pre-approved contract terms ensuring GDPR-level protection
   - Must conduct Transfer Impact Assessment (TIA) per Schrems II ruling
3. **Binding Corporate Rules (BCRs)** - For multinational corporations
4. **Specific derogations** (Art. 49) - Explicit consent, contract necessity (limited)

**US Data Transfers (AWS US, SendGrid, Twilio):**
- **EU-US Data Privacy Framework** (DPF) - Adopted July 2023
- US companies can self-certify to DPF for adequacy
- However, Schrems III challenge pending - risk of invalidation
- **Recommendation:** Use EU services where possible, SCCs for US providers

### 7.2 Cloud Provider Requirements

#### AWS S3 for Document Storage

**GDPR Compliance:**
1. **Data Processing Agreement (DPA)**
   - AWS provides standard DPA - MUST execute
   - Available at: aws.amazon.com/compliance/gdpr-center
   - Includes SCCs for non-EU regions

2. **Region Selection:**
   - Use EU regions only: eu-central-1 (Frankfurt), eu-west-1 (Ireland)
   - Configure S3 bucket with region lock (prevent accidental migration)

3. **Encryption:**
   - Encryption at rest: S3 default SSE (AES-256) ✓
   - Encryption in transit: TLS/HTTPS ✓
   - Key management: AWS KMS or customer-managed keys (CMK for sensitive data)

4. **Access Control:**
   - IAM policies: Least privilege
   - Bucket policies: Block public access
   - Presigned URLs: Time-limited access for customer document download

5. **Audit Logging:**
   - S3 access logs: Enable
   - CloudTrail: Track all API calls
   - Retention: 3 years minimum

**Compliance Certifications:**
- AWS ISO 27001, ISO 27017 (cloud security), ISO 27018 (personal data)
- SOC 2 Type II
- Verify at: aws.amazon.com/compliance/programs

#### PostgreSQL Database (Supabase / RDS)

**Supabase:**
- Built on AWS
- EU region available (eu-west-1)
- GDPR-compliant DPA available
- Encrypted at rest

**AWS RDS:**
- Same requirements as S3
- EU region
- Encryption at rest (AES-256)
- Automated backups (encrypted)
- VPC isolation (not public internet)

**Data in Database:**
- **Encrypt sensitive fields:** CNP, passport numbers (application-level encryption)
- **Hash passwords:** Bcrypt/Argon2
- **Minimize PII in logs:** Don't log CNPs, IDs

#### Stripe (Payment Processing)

**Data Flow:**
- Customer enters card details on Stripe Elements (iframe)
- Card data NEVER touches eGhiseul.ro servers
- Stripe tokenizes, eGhiseul.ro stores only token

**GDPR:**
- Stripe Payments Europe Ltd. (Dublin, Ireland) - EU entity
- DPA: Automatic for EU customers
- Stripe is data processor for payment data
- eGhiseul.ro stores minimal payment data (transaction ID, amount, status)

**Compliance:**
- PCI DSS Level 1 (Stripe handles)
- eGhiseul.ro NOT in scope for PCI DSS (no card data stored)

#### Email Provider (SendGrid / Resend)

**SendGrid (Twilio):**
- US company
- EU-US DPF certified (check annually)
- EU data hosting available
- DPA with SCCs

**Resend:**
- EU-friendly alternative
- Check current data location and DPA

**Data Minimization:**
- Store emails only as needed for service delivery
- Delete marketing emails after campaign + reasonable period

#### SMS Provider (Twilio)

**Compliance:**
- US company
- EU-US DPF certified
- DPA with SCCs
- Phone numbers: Personal data under GDPR

**Opt-in:**
- Customer pays for SMS (+5 RON) = consent implied
- Document in T&C and Privacy Policy
- Opt-out mechanism (reply STOP)

---

## 8. Compliance Checklist

### 8.1 GDPR Compliance

- [ ] **Appoint Data Protection Officer (DPO)**
  - Internal or external
  - Publish contact details
  - Register with ANSPDCP (optional but recommended)

- [ ] **Publish Privacy Policy**
  - All Art. 13 GDPR disclosures
  - Romanian language mandatory
  - Accessible footer link
  - Version control, update date

- [ ] **Cookie Policy & Banner**
  - Distinguish essential vs. non-essential cookies
  - Opt-in for analytics/marketing cookies
  - Reject option as easy as accept
  - Cookie settings page

- [ ] **Data Processing Agreements (DPAs)**
  - AWS (S3, RDS)
  - Stripe
  - Olbio
  - Email provider (SendGrid/Resend)
  - SMS provider (Twilio)
  - Courier partners (Fan Curier, DHL)
  - Translator subcontractors
  - Maintain register of processors (Art. 30)

- [ ] **Data Retention Policy**
  - Document retention periods per data type
  - Implement automated deletion workflows
  - Annual audit of retained data

- [ ] **Data Subject Rights Procedures**
  - Right to access (SAR process)
  - Right to rectification
  - Right to erasure (handle exceptions for legal obligations)
  - Right to data portability (export function)
  - Right to object
  - 30-day response SLA

- [ ] **Data Breach Response Plan**
  - Breach detection and assessment
  - Notification to ANSPDCP within 72 hours (if high risk)
  - Notification to individuals (if high risk to rights/freedoms)
  - Breach register

- [ ] **Data Protection Impact Assessment (DPIA)**
  - Required for high-risk processing (Art. 35)
  - KYC with ID copies + face images = borderline
  - Conduct DPIA, document findings, mitigation

- [ ] **Records of Processing Activities (ROPA)**
  - Art. 30 GDPR requirement
  - Inventory of all processing activities
  - Update annually

- [ ] **Staff Training**
  - GDPR basics
  - Data handling procedures
  - Incident reporting

### 8.2 Romanian Contract Law

- [ ] **Electronic Signature Compliance**
  - Implement SES (canvas) with consent checkbox
  - Add T&C clause acknowledging electronic signature validity
  - Audit trail: IP, timestamp, device fingerprint
  - Roadmap: Integrate AdES for higher-value contracts

- [ ] **Contract Storage**
  - 10-year retention in original format
  - S3 storage with versioning, encryption
  - Lifecycle policy: Archive to Glacier after 3 years
  - Cross-region replication for disaster recovery
  - Annual integrity audit (checksum validation)

- [ ] **Împuternicire (Power of Attorney) Templates**
  - Per service type (cazier, certificates, etc.)
  - Auto-generate from order data
  - Include all legal requirements:
    - Principal and representative identity
    - Specific powers granted
    - Date, signature, ID attachments
  - PDF generation with embedded documents

- [ ] **Consumer Protection Compliance (OUG 34/2014)**
  - Pre-contractual information on all service pages
  - Total price display (all-inclusive)
  - T&C accessible and downloadable
  - 14-day withdrawal right disclosure with exceptions
  - Withdrawal right waiver checkbox at checkout
  - Confirmation email with contract terms

- [ ] **Website Footer Legal Requirements**
  - Company details (EDIGITALIZARE SRL, CUI, address, contact)
  - T&C, Privacy Policy, Cookie Policy links
  - ANPC contact link
  - SOL platform link
  - Payment security badges

- [ ] **Complaint Handling Process**
  - Email intake (contact@eghiseul.ro)
  - 30-day response SLA
  - Complaint register
  - SOL escalation process

### 8.3 E-commerce and Invoicing

- [ ] **E-Factura Implementation**
  - Verify Olbio e-factura module enabled
  - Test B2B invoice upload to ANAF
  - Monitor ANAF SPV for errors
  - Prepare for future B2C mandate

- [ ] **Invoice Storage**
  - 10-year retention
  - Same S3 storage as contracts
  - Original format (PDF + XML for e-factura)
  - Database index for retrieval

- [ ] **PF vs. PJ Invoice Templates**
  - PF: Name, CNP (optional), address
  - PJ: Name, CUI, Reg. Com., address, e-factura upload
  - Sequential numbering per series
  - VAT 19% included
  - Credit note process for cancellations

- [ ] **Price Display**
  - All prices include VAT
  - Dynamic pricing calculator in flow
  - Final total before payment
  - No hidden fees
  - Discount/coupon transparency

### 8.4 KYC and Document Services

- [ ] **KYC Process**
  - ID upload (front, back for new format)
  - Selfie with ID
  - File validation (type, size)
  - Secure storage (S3 encrypted)
  - Retention: 3 years after service completion (or longer if justified)
  - Document lawful basis in Privacy Policy

- [ ] **Service-Specific Requirements**
  - Cazier Judiciar: ANP-compliant împuternicire, ID copies
  - Cazier Fiscal: ANAF împuternicire
  - Certificates: City hall-compliant authorization
  - Certificat Constatator: ONRC online process
  - Extras CF: No împuternicire needed (public data)

- [ ] **Apostille Process**
  - Identify correct authority per document type
  - Împuternicire for apostille request
  - Track apostille status
  - Quality control (verify apostille authenticity)

- [ ] **Translation Services**
  - Use only MOJ-authorized translators
  - Translator contracts (subcontractor agreements)
  - Verify translator credentials
  - Quality assurance process
  - Customer dispute resolution

### 8.5 Data Localization and Security

- [ ] **Cloud Provider Compliance**
  - AWS DPA executed
  - S3 buckets in EU regions only (eu-central-1 or eu-west-1)
  - Encryption at rest (AES-256)
  - Encryption in transit (TLS)
  - IAM least privilege access
  - Logging enabled (S3 access logs, CloudTrail)

- [ ] **Database Security**
  - PostgreSQL in EU region
  - Encryption at rest
  - VPC isolation (no public access)
  - Application-level encryption for CNP, sensitive fields
  - Password hashing (Bcrypt/Argon2)

- [ ] **Third-Party Processor Compliance**
  - Stripe: EU entity, DPA verified
  - Olbio: Processor agreement
  - Email: DPA with SCCs if non-EU
  - SMS: DPA with SCCs if non-EU
  - Couriers: Processor agreements

- [ ] **Backup and Disaster Recovery**
  - Automated backups (daily)
  - Cross-region replication
  - 30-day backup retention
  - Tested recovery process (quarterly)

- [ ] **Access Control**
  - Role-based access (Admin, Operator, Customer)
  - Multi-factor authentication for admin
  - Audit logs for sensitive actions
  - Annual access review

### 8.6 Operational Compliance

- [ ] **Staff Training and Policies**
  - GDPR training for all staff handling personal data
  - Data handling procedures manual
  - Incident response training
  - Annual refresher training

- [ ] **Documentation**
  - Records of Processing Activities (ROPA)
  - Data retention schedule
  - Processor register
  - Data breach register
  - Compliance audit log

- [ ] **Monitoring and Audits**
  - Quarterly GDPR compliance review
  - Annual data retention audit
  - Annual processor compliance verification (review DPAs, certifications)
  - Customer complaint analysis (monthly)

- [ ] **Insurance**
  - Cyber liability insurance (recommended)
  - Professional indemnity insurance
  - Coverage for data breaches, service errors

---

## 9. Required Legal Documents and Policies

### 9.1 Privacy Policy (Politica de Confidențialitate)

**Language:** Romanian (mandatory)
**Location:** Website footer, accessible before order
**Content:** See Section 1.6 for full requirements

**Template Sections:**
1. Data Controller Identity
2. DPO Contact
3. What Data We Collect (table)
4. Why We Collect It (purposes + legal basis)
5. Who We Share It With (processors, government institutions)
6. How Long We Keep It (retention table)
7. Your Rights (access, rectification, erasure, portability, object, complain)
8. How to Exercise Rights (email, forms)
9. Cookies and Tracking
10. Data Security Measures
11. Data Transfers (AWS regions, third countries)
12. Changes to Policy (version control)

**Update Frequency:** Review annually, update when business changes

### 9.2 Terms & Conditions (Termeni și Condiții)

**Language:** Romanian (mandatory)
**Location:** Accessible before order, checkbox consent required

**Template Sections:**
1. **Definitions** (Customer, Service, Platform, etc.)
2. **Service Description** (what eGhiseul.ro provides)
3. **Eligibility** (18+, valid ID, etc.)
4. **Order Process** (6-step flow)
5. **Pricing** (all-inclusive, currency, VAT)
6. **Payment** (Stripe, when charged, refund policy)
7. **KYC Requirements** (ID upload, selfie, why needed)
8. **Electronic Signatures** (legal validity per Law 455/2001, consent to use)
9. **Power of Attorney** (customer authorizes eGhiseul.ro to act as representative)
10. **Service Timeline** (standard, urgent, delays)
11. **Delivery** (electronic, physical, customer responsibility for address accuracy)
12. **Withdrawal Right** (14 days, exception for completed services, how to exercise)
13. **Complaints** (process, ANPC/SOL links)
14. **Limitation of Liability** (force majeure, government institution errors, etc.)
15. **Intellectual Property** (eGhiseul.ro owns platform, customer owns their data)
16. **Data Protection** (reference Privacy Policy)
17. **Governing Law** (Romanian law)
18. **Dispute Resolution** (Romanian courts, SOL platform)
19. **Changes to T&C** (notification, continued use = acceptance)
20. **Contact Information**

### 9.3 Cookie Policy (Politica de Cookie-uri)

**Language:** Romanian
**Location:** Footer link, cookie banner

**Content:**
1. What Cookies Are
2. Why We Use Them
3. Types of Cookies:
   - Essential (session, authentication)
   - Analytics (GA4)
   - Marketing (if any)
4. How to Control Cookies (browser settings, banner preferences)
5. Third-Party Cookies (Google, Stripe)
6. Updates to Policy

### 9.4 Refund Policy (Politica de Rambursare)

**Language:** Romanian
**Location:** T&C section, FAQ

**Content:**
1. **When Refunds Apply:**
   - Order not yet processed (full refund)
   - Government institution rejects (full refund or reprocess)
   - Error by eGhiseul.ro (full refund)
   - Customer withdrawal before service completion (proportional refund)
2. **When Refunds Don't Apply:**
   - Service completed and customer accepted immediate processing
   - Customer provided incorrect information (can reprocess with additional fee)
   - Customer not reachable for delivery (after reasonable attempts)
3. **Refund Timeline:** Within 14 days of approval
4. **Refund Method:** Original payment method (Stripe refund)
5. **Partial Refunds:** Calculation method for partially completed services

### 9.5 Service Contract (Contract de Prestări Servicii)

**Auto-generated per order**
**Language:** Romanian
**Format:** PDF with electronic signature

**Template Sections:**
1. **Parties:**
   - Provider: EDIGITALIZARE SRL (full details)
   - Customer: [Name, CNP/CUI, Address]
2. **Service Scope:** [Specific document(s) ordered]
3. **Service Details:** [Options: urgency, translation, apostille, delivery]
4. **Price:** [Breakdown + total]
5. **Payment Terms:** Paid in advance via Stripe
6. **Timeline:** [Standard/urgent processing time]
7. **Provider Obligations:**
   - Act as customer's representative
   - Obtain document from government institution
   - Deliver per customer's chosen method
8. **Customer Obligations:**
   - Provide accurate information
   - Provide valid ID and KYC
   - Pay full price
   - Accept delivery
9. **Delivery:** [Electronic/Physical details]
10. **Withdrawal Right:** [14 days, exception if immediate processing requested]
11. **Personal Data:** [Reference Privacy Policy, consent to processing for service]
12. **Limitation of Liability:** [Force majeure, government delays, etc.]
13. **Governing Law:** Romanian law
14. **Dispute Resolution:** Amicable, then Romanian courts
15. **Signatures:**
    - Provider: [Electronic signature or stamp]
    - Customer: [Electronic signature from canvas, timestamp]
16. **Annexes:**
    - Împuternicire (Power of Attorney)
    - Customer ID copies

**Numbering:** Sequential per year (e.g., EG-2024-0001)
**Storage:** 10 years in S3

### 9.6 Împuternicire (Power of Attorney) Template

**Auto-generated per service**
**Language:** Romanian
**Format:** PDF attached to contract

**Template Content:**

```
ÎMPUTERNICIRE

Subsemnatul/Subsemnata [FULL NAME], domiciliat/domiciliată în [ADDRESS],
identificat/identificată cu [CI/PASAPORT] seria [XX] nr. [XXXXXX],
CNP [XXXXXXXXXXXXX],

ÎMPUTERNICESC

pe EDIGITALIZARE SRL, CUI [XXXXXX], cu sediul în [ADDRESS],
reprezentată legal prin [LEGAL REP NAME],

SĂ MĂ REPREZINTE în vederea:
- solicitării și ridicării [SPECIFIC DOCUMENT NAME] de la [INSTITUTION NAME]
- semnării în numele meu a documentelor necesare obținerii documentului
- primirii documentului în numele meu

Prezenta împuternicire este valabilă de la data [DATE] până la [DATE / finalizarea serviciului].

Data: [AUTO-FILLED]
Semnătura: [ELECTRONIC SIGNATURE FROM CANVAS]

ANEXE:
- Copie CI/Pașaport mandant
- Copie certificat înregistrare mandatar (EDIGITALIZARE SRL)
```

**Service-Specific Variations:**
- Cazier Judiciar: "obținerii Certificatului de Cazier Judiciar de la Administrația Națională a Penitenciarelor"
- Certificate: "obținerii Certificatului de [Naștere/Căsătorie/Celibat] de la Primăria [CITY]"
- Etc.

### 9.7 Data Processing Agreement (DPA) Templates

**For Subprocessors (Translators, Couriers, etc.)**

**Required if subcontractor processes personal data**

**Template Sections:**
1. **Definitions** (Controller, Processor, Subprocessor, Personal Data)
2. **Scope:** What data is processed, for what purpose
3. **Processor Obligations:**
   - Process only per controller's instructions
   - Confidentiality
   - Security measures (Art. 32 GDPR)
   - Sub-subprocessor approval
   - Data subject rights assistance
   - Breach notification (within 24 hours)
   - Deletion/return of data after service
4. **Controller Rights:** Audit, inspection
5. **Liability and Indemnification**
6. **Term and Termination**
7. **Governing Law:** Romanian law
8. **Annexes:**
   - Annex 1: Details of processing
   - Annex 2: Technical and organizational measures

**Execute DPA With:**
- Translators (process name, CNP, ID copies)
- Couriers (process name, address, phone)
- Any service provider with access to personal data

**Maintain Register:** Spreadsheet of all processors, DPA status, review date

### 9.8 Data Subject Access Request (DSAR) Response Template

**Email Template for Responding to Access Requests**

```
Subject: Your Data Access Request - Reference [TICKET_NUMBER]

Dear [CUSTOMER NAME],

Thank you for your data access request received on [DATE] per Art. 15 GDPR.

We confirm that we process the following personal data about you:

**Contact Information:**
- Email: [EMAIL]
- Phone: [PHONE]

**Identity Data:**
- Full Name: [NAME]
- CNP: [CNP - REDACTED PARTIALLY FOR SECURITY]
- Address: [ADDRESS]
- ID Document: [TYPE] [NUMBER - REDACTED PARTIALLY]

**Order History:**
[TABLE OF ORDERS: Order #, Date, Service, Status, Amount]

**Documents Stored:**
- ID Card/Passport Copy (uploaded [DATE], retained until [DATE])
- Selfie with ID (uploaded [DATE], retained until [DATE])
- Service Contract [NUMBER] (signed [DATE], retained until [DATE + 10 years])
- Invoice [NUMBER] (issued [DATE], retained until [DATE + 10 years])

**Processing Purposes:**
- Service delivery (contract performance)
- Legal compliance (invoicing, contract retention)
- Fraud prevention (legitimate interest)

**Recipients of Your Data:**
- Stripe (payment processing)
- [COURIER] (delivery)
- [GOVERNMENT INSTITUTION] (document issuance)
- [TRANSLATOR if applicable]

**Data Retention:**
- Contracts and invoices: 10 years (legal obligation)
- KYC documents: 3 years after service completion
- Marketing consents: Until withdrawal

**Your Rights:**
You have the right to:
- Rectification (if any data is inaccurate)
- Erasure (subject to legal retention obligations)
- Restriction of processing
- Data portability
- Object to processing
- Lodge a complaint with ANSPDCP (dataprotection.ro)

To exercise any right, reply to this email.

If you would like a machine-readable copy of your data, please confirm and we will provide a JSON/CSV file.

Best regards,
eGhiseul.ro Data Protection Team
[DPO CONTACT]
```

---

## 10. Risk Assessment and Mitigation

### 10.1 Legal Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **GDPR non-compliance fine** | Medium | High (up to €20M or 4% revenue) | Appoint DPO, implement all GDPR measures, annual audit |
| **Data breach** | Medium | High (reputation, fines, lawsuits) | Encryption, access control, incident response plan, insurance |
| **Customer disputes contract validity** | Low | Medium (legal costs, refunds) | Strong KYC, audit trail, T&C consent, consider AdES signatures |
| **ANPC consumer complaint** | Medium | Low-Medium (fine, reputation) | Clear pricing, T&C, withdrawal rights, 30-day response SLA |
| **Government institution rejects împuternicire** | Medium | Low (operational delay, customer frustration) | Standard templates, relationships with institutions, fallback: notarized option |
| **ANAF tax audit (contract/invoice issues)** | Low | Medium (fines, back taxes) | 10-year retention, proper invoicing, e-factura compliance |
| **Customer RTBF request for data under legal retention** | Medium | Low (no fine if handled correctly) | Clear procedures, document legal basis for refusal, pseudonymize where possible |
| **Cross-border data transfer violation** | Low | High (GDPR Art. 83) | Use EU cloud providers, execute SCCs, avoid non-adequate countries |
| **Sub-processor non-compliance** | Medium | Medium (controller liability for processor) | Execute DPAs, annual compliance verification, choose reputable vendors |

### 10.2 Operational Risks

| Risk | Mitigation |
|------|------------|
| **Fraud (fake IDs)** | Face matching (selfie vs. ID), manual review for high-risk orders, blacklist repeat offenders |
| **Payment fraud** | Stripe fraud detection, 3D Secure, monitor chargebacks |
| **Document delivery failure** | Track shipments, insurance for lost packages, offer reissuance |
| **Government institution delays** | Set realistic timelines, communicate proactively with customer, offer refunds if excessive |
| **Translation quality disputes** | Use certified translators only, review process, revision policy |

### 10.3 Recommended Insurance

1. **Cyber Liability Insurance**
   - Coverage: Data breaches, GDPR fines, notification costs, legal defense
   - Recommended limit: €500K - €1M
   - Provider: Hiscox, AIG, Allianz

2. **Professional Indemnity (Errors & Omissions)**
   - Coverage: Service errors, document mistakes, missed deadlines
   - Recommended limit: €250K - €500K

3. **General Liability**
   - Coverage: Third-party injury, property damage
   - Standard business insurance

---

## 11. Implementation Roadmap

### Phase 1: Immediate (Before MVP Launch)

**Legal:**
- [ ] Draft Privacy Policy (Romanian)
- [ ] Draft Terms & Conditions (Romanian)
- [ ] Draft Cookie Policy
- [ ] Draft Refund Policy
- [ ] Design Contract template
- [ ] Design Împuternicire templates (per service)
- [ ] Add legal footer links to website
- [ ] Implement cookie banner
- [ ] Add T&C/Privacy Policy consent checkboxes
- [ ] Add withdrawal right waiver checkbox
- [ ] Add electronic signature consent clause

**GDPR:**
- [ ] Decide on DPO (internal/external) - at least designate privacy contact
- [ ] Execute AWS DPA
- [ ] Execute Stripe DPA (verify)
- [ ] Execute Olbio processor agreement
- [ ] Configure S3 in EU region only
- [ ] Enable S3 encryption and versioning
- [ ] Create ROPA (basic)
- [ ] Implement data retention schedule in code (automated deletion)

**Invoicing:**
- [ ] Verify Olbio e-factura enabled for B2B
- [ ] Test invoice generation (PF and PJ)
- [ ] Configure invoice storage (S3 + database index)

### Phase 2: Post-Launch (Month 1-3)

**GDPR:**
- [ ] Appoint formal DPO (external service recommended)
- [ ] Conduct DPIA for KYC processing
- [ ] Implement DSAR process (customer data export)
- [ ] Create data breach response plan
- [ ] Train staff on GDPR
- [ ] Execute DPAs with all processors (couriers, translators, email/SMS)

**Compliance:**
- [ ] Register with ANPC ODR if required
- [ ] Set up complaint handling process
- [ ] Create internal compliance calendar (quarterly reviews)

**Legal Documents:**
- [ ] Review all templates with Romanian lawyer (recommended)
- [ ] Adjust based on operational learnings

### Phase 3: Scaling (Month 4-12)

**Advanced GDPR:**
- [ ] Implement automated DSAR response
- [ ] Annual GDPR audit (external)
- [ ] Consider ISO 27001 certification (if B2B scaling)

**Legal:**
- [ ] Integrate AdES signature provider for high-value contracts
- [ ] Review and update all policies (annual)
- [ ] Add multi-language support for T&C/Privacy (English for diaspora UX)

**Insurance:**
- [ ] Obtain cyber liability insurance
- [ ] Obtain professional indemnity insurance

---

## 12. Recommended External Advisors

### 12.1 Legal Counsel

**Romanian Law Firm (for Contract/Consumer Law):**
- Specialization: E-commerce, consumer protection, contract law
- Services: T&C review, dispute resolution, ANPC compliance
- Estimated Cost: €150-300/hour, retainer €500-2,000/month

**GDPR Specialist:**
- Specialization: Data protection, GDPR compliance
- Services: Privacy Policy, DPA review, DPIA, DPO services
- Estimated Cost: €100-250/hour, DPO-as-a-service €200-800/month

### 12.2 Compliance Services

**DPO-as-a-Service Providers (Romania):**
- **GDPR Advisor Romania**
- **Avocatoo GDPR Services**
- **Deloitte / PwC** (for enterprise)

**Tax/Fiscal Advisor:**
- Services: E-factura compliance, ANAF audit support, invoice review
- Estimated Cost: €100-200/hour

### 12.3 Insurance Brokers

**Cyber Insurance:**
- **Hiscox Romania**
- **Marsh Romania**
- **Allianz**

---

## 13. Conclusions and Recommendations

### 13.1 Critical Compliance Actions

**Must-Have Before Launch:**
1. Privacy Policy and T&C in Romanian
2. Cookie banner with consent management
3. GDPR-compliant data storage (EU AWS, encryption, DPAs)
4. 10-year contract retention system
5. Electronic signature with audit trail and consent
6. Withdrawal right disclosure with waiver checkbox
7. Pre-contractual information (pricing, timelines, delivery)
8. Împuternicire templates per service

**Should-Have Soon After Launch:**
1. Formal DPO appointment (within 3 months)
2. DPIA for KYC processing
3. Data breach response plan
4. Processor agreements with all subcontractors
5. Complaint handling process (ANPC/SOL)
6. E-factura full compliance for B2B

**Nice-to-Have for Scaling:**
1. AdES signature integration
2. ISO 27001 certification
3. Cyber liability insurance
4. Annual external GDPR audit
5. Multi-language legal documents

### 13.2 Legal Basis Summary

| Activity | GDPR Lawful Basis | Notes |
|----------|------------------|-------|
| Process orders | Art. 6(1)(b) Contract performance | No consent needed |
| KYC verification | Art. 6(1)(b) Contract + 6(1)(f) Legitimate interest | Document justification |
| Store contracts 10 years | Art. 6(1)(c) Legal obligation | Law 82/1991, overrides RTBF |
| Marketing emails | Art. 6(1)(a) Consent | Opt-in required, easy withdrawal |
| Analytics cookies | Art. 6(1)(f) Legitimate interest + ePrivacy consent | Cookie banner |
| Payment processing | Art. 6(1)(b) Contract performance | Stripe DPA |
| Share with couriers | Art. 6(1)(b) Contract performance | For delivery, processor agreement |

### 13.3 Key Regulatory Contacts

| Authority | Scope | Contact |
|-----------|-------|---------|
| **ANSPDCP** | GDPR enforcement | anspdcp@dataprotection.ro, dataprotection.ro |
| **ANPC** | Consumer protection | 0800.080.999, anpc.ro |
| **ANAF** | Tax, e-factura | anaf.ro |
| **ANP** | Criminal records | anp.gov.ro |
| **ONRC** | Trade register | onrc.ro |

### 13.4 Estimated Compliance Costs

**One-Time (Setup):**
- Legal counsel (T&C, Privacy Policy review): €1,500 - €3,000
- GDPR consultant (DPIA, ROPA, processes): €2,000 - €5,000
- Development (compliance features): Included in product development

**Recurring (Annual):**
- DPO service: €2,400 - €9,600/year (€200-800/month)
- Legal retainer (optional): €6,000 - €24,000/year
- Tax advisor: €1,000 - €3,000/year
- GDPR audit: €2,000 - €5,000/year
- Insurance (cyber + professional): €1,500 - €5,000/year
- **Total Estimated: €13,000 - €46,600/year**

For a startup, budget conservatively **€15,000 - €20,000/year** for compliance.

---

## Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 15 Dec 2024 | Legal Research Team | Initial comprehensive research |

---

**DISCLAIMER:** This document is for informational purposes only and does not constitute legal advice. eGhiseul.ro should consult with qualified Romanian legal counsel to ensure full compliance with all applicable laws and regulations. Laws and regulations are subject to change; this document should be reviewed and updated regularly.
