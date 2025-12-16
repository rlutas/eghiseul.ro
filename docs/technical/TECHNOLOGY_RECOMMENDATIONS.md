# Technology Stack Recommendations for eGhiseul.ro

**Document Version:** 1.0
**Last Updated:** December 2025
**Platform:** Romanian Document Services Platform

---

## Executive Summary

This document provides comprehensive technology recommendations for building eGhiseul.ro, a Romanian document services platform. Each recommendation considers pricing, Romanian market specifics, integration complexity, and compliance requirements.

**Base Stack:** Next.js + NestJS + PostgreSQL + AWS S3 ✓ (Approved)

---

## 1. OCR for Romanian ID Cards (CI/Buletin)

### Requirements
- Extract: CNP, Name, Address, Expiry Date
- Support: Romanian ID cards (Buletin/CI) and passports
- Handle Romanian characters (ă, â, î, ș, ț)

### Recommended Solutions

#### **Option A: AWS Textract (RECOMMENDED)**
**Pros:**
- Native AWS integration (already using S3)
- AnalyzeID API specifically designed for identity documents
- Supports 100+ ID types including Romanian documents
- Excellent Romanian diacritics support
- Good accuracy for structured documents
- GDPR compliant with EU data residency options

**Cons:**
- Higher cost at scale
- May require fine-tuning for older Romanian ID formats

**Pricing:**
- AnalyzeID: $0.04 per page (ID cards)
- AnalyzeDocument: $0.015 per page (general OCR)
- 1,000 IDs/month = ~$40

**Integration Complexity:** Medium (3-5 days)
```javascript
// AWS SDK integration
import { TextractClient, AnalyzeIDCommand } from "@aws-sdk/client-textract";
```

**Romanian Specifics:**
- Test with both old format (laminated) and new format (biometric) Romanian IDs
- CNP extraction requires post-processing validation (13 digits, checksum)
- Address field may span multiple lines

---

#### **Option B: Google Cloud Vision + Document AI**
**Pros:**
- Document AI has pre-trained models for identity documents
- Excellent OCR accuracy
- Good Romanian language support
- AutoML capability for custom training

**Cons:**
- Requires separate cloud provider integration
- Data residency considerations (ensure EU region)
- Slightly more complex setup

**Pricing:**
- Document AI ID Processor: $0.05 per page
- Vision API OCR: $1.50 per 1,000 images (first 1,000 free)
- 1,000 IDs/month = ~$50

**Integration Complexity:** Medium (4-6 days)

---

#### **Option C: Specialized ID Verification Services**

##### **IDScan.net**
- **Focus:** ID verification and extraction
- **Pricing:** ~$0.10-0.15 per scan
- **Pros:** Purpose-built for IDs, includes fraud detection
- **Cons:** Higher cost, external dependency

##### **Veriff (with OCR)**
- **Focus:** Identity verification + OCR
- **Pricing:** ~$1-2 per verification (includes OCR + liveness check)
- **Pros:** All-in-one solution, see KYC section
- **Cons:** Expensive if you only need OCR

##### **Microblink BlinkID**
- **Focus:** Client-side ID scanning SDK
- **Pricing:** ~$0.05-0.10 per scan or licensing model
- **Pros:** On-device processing (privacy), fast, offline capability
- **Cons:** Client-side dependency, SDK integration

---

#### **Option D: Open Source - Tesseract OCR**
**Pros:**
- Free and open source
- Full control and customization
- No per-transaction costs
- Can train for Romanian ID format

**Cons:**
- Requires significant development effort
- Lower accuracy without training
- Manual maintenance of character recognition models
- Need to implement document preprocessing

**Pricing:** Free (compute costs only)

**Integration Complexity:** High (10-15 days + ongoing maintenance)

**Romanian Specifics:**
- Requires Romanian language data: `tesseract image.jpg stdout -l ron`
- Need to implement preprocessing (deskew, contrast, noise reduction)
- CNP extraction requires regex pattern matching

---

### RECOMMENDATION: AWS Textract AnalyzeID

**Why:**
1. Best price-to-performance ratio at expected scale
2. Native AWS integration (reduces infrastructure complexity)
3. Proven accuracy for structured documents
4. EU data residency for GDPR compliance
5. Managed service (no maintenance overhead)

**Implementation Strategy:**
```typescript
// Hybrid approach for better accuracy
1. AWS Textract AnalyzeID for initial extraction
2. Post-processing validation layer:
   - CNP validation (checksum algorithm)
   - Date format normalization
   - Address field consolidation
   - Romanian character verification
3. Confidence scoring (flag low-confidence extractions for manual review)
4. Fallback to manual review for confidence < 85%
```

**Cost Projection:**
- Year 1: 500 IDs/month = $20/month
- Year 2: 2,000 IDs/month = $80/month
- Year 3: 5,000 IDs/month = $200/month

---

## 2. KYC/Identity Verification

### Requirements
- Selfie with ID matching (liveness detection)
- Identity document verification
- Romanian market compliance
- GDPR compliance

### Recommended Solutions

#### **Option A: Veriff (RECOMMENDED FOR FULL SERVICE)**
**Pros:**
- Comprehensive solution: OCR + liveness + verification
- Supports 11,000+ document types including Romanian IDs
- Strong fraud detection
- GDPR compliant (EU-based company, Estonia)
- Good reputation in European fintech
- Manual review fallback included

**Cons:**
- Expensive ($1-3 per verification depending on volume)
- External dependency
- May be overkill if you don't need full KYC

**Pricing:**
- Startup tier: ~$2 per verification
- Growth tier (1,000+/month): ~$1-1.50 per verification
- Enterprise: Custom pricing

**Integration Complexity:** Low-Medium (2-3 days)
- SDK available for web and mobile
- Webhook callbacks for results

**Romanian Specifics:**
- Explicitly supports Romanian identity documents
- Available in Romanian language
- EU data processing

---

#### **Option B: Onfido**
**Pros:**
- Market leader in identity verification
- Excellent API and documentation
- Studio feature for custom workflows
- Real-time verification
- Strong fraud detection

**Cons:**
- Premium pricing ($1.50-3 per check)
- May have less focus on Romanian market vs Western Europe

**Pricing:**
- Standard tier: $2-3 per check
- Scale tier: $1-1.50 per check
- Document + facial similarity + liveness: ~$2.50

**Integration Complexity:** Low-Medium (2-4 days)

---

#### **Option C: Jumio**
**Pros:**
- Strong in financial services sector
- Good fraud prevention
- Supports Romanian documents
- Real Identity Platform

**Cons:**
- Higher enterprise focus (may be harder for startups)
- Pricing typically higher

**Pricing:**
- Contact for quote (typically $1.50-2.50 per verification)

---

#### **Option D: Build Custom Solution**
**Components Needed:**
1. OCR for document extraction (covered in section 1)
2. Liveness detection (face match + anti-spoofing)
3. Face comparison engine

**Recommended Stack:**
- **OCR:** AWS Textract (covered above)
- **Face Detection:** AWS Rekognition or Face++
- **Liveness Detection:** AWS Rekognition DetectFaces with quality checks
- **Face Comparison:** AWS Rekognition CompareFaces

**Pros:**
- Lower per-transaction cost at scale (~$0.10-0.20 per verification)
- Full control over UX and workflow
- No vendor lock-in
- Data stays in your infrastructure

**Cons:**
- Significant development effort (4-6 weeks)
- Ongoing maintenance
- Fraud detection logic responsibility
- May have lower accuracy than specialized providers
- Compliance burden (proving accuracy for regulated use cases)

**Pricing (AWS Rekognition):**
- Face detection: $0.001 per image
- Face comparison: $0.001 per comparison
- Liveness: Included in face detection
- 1,000 verifications/month = ~$5-10

**Integration Complexity:** High (15-25 days)

---

### RECOMMENDATION: Hybrid Approach

**Phase 1 (MVP/Year 1): AWS Rekognition Custom Build**
- Lower cost for validation phase
- Sufficient for low-risk document services
- Cost: ~$0.15 per verification

**Phase 2 (Scale/Year 2+): Migrate to Veriff for high-value transactions**
- Use custom solution for low-risk verifications
- Use Veriff for high-value services requiring stronger compliance
- Risk-based routing

**Why:**
1. Minimize initial costs during market validation
2. AWS Rekognition provides adequate accuracy for document services
3. Can upgrade to Veriff when serving financial/legal clients
4. Flexibility to route based on risk profile

**Implementation:**
```typescript
// Risk-based routing
if (transactionValue > 500 || userRiskScore > threshold) {
  // Use Veriff for high-risk/high-value
  await veriffVerification(userId);
} else {
  // Use custom AWS Rekognition for standard
  await customKYC(userId);
}
```

---

## 3. Electronic Signature

### Requirements
- Canvas-based signature capture
- Legal validity in Romania
- Contract signing workflow

### Legal Framework in Romania

**eIDAS Regulation (EU 910/2014)** applies in Romania:
- **Simple Electronic Signature (SES):** Canvas/drawn signature - LIMITED legal validity
- **Advanced Electronic Signature (AES):** Requires identity verification
- **Qualified Electronic Signature (QES):** Highest legal value (equivalent to handwritten)

**Romanian Specifics:**
- Law 455/2001 on electronic signatures (updated for eIDAS)
- Canvas signatures are valid BUT can be challenged in court
- For high-value contracts, consider AES or QES

### Recommended Solutions

#### **Option A: Canvas Signature (signature_pad.js) - RECOMMENDED FOR STANDARD USE**
**Use Case:** Internal agreements, service terms, low-value contracts

**Pros:**
- Simple implementation
- Good UX
- Free and open source
- Works on all devices (touch/mouse)

**Cons:**
- Limited legal validity (can be challenged)
- No built-in identity verification
- No qualified certificate

**Library:** [signature_pad](https://github.com/szimek/signature_pad)
```javascript
import SignaturePad from 'signature_pad';
const canvas = document.querySelector("canvas");
const signaturePad = new SignaturePad(canvas);
```

**Pricing:** Free

**Integration Complexity:** Low (1-2 days)

**Legal Enhancement:**
- Combine with timestamp service
- Store IP address, user agent, timestamp
- Keep audit log of signing process
- Add email confirmation
- Store alongside identity verification (from KYC)

---

#### **Option B: Adobe Sign**
**Use Case:** High-value contracts, B2B agreements

**Pros:**
- Legally recognized globally
- Supports AES and QES
- Enterprise features (templates, workflows)
- Strong audit trail

**Cons:**
- Expensive ($10-50 per user/month)
- Overkill for simple use cases

**Pricing:**
- Individual: $12.99/month (limited transactions)
- Small Business: $29.99/month per user
- Enterprise: Custom

**Integration Complexity:** Medium (3-5 days)

---

#### **Option C: DocuSign**
**Similar to Adobe Sign:**
- Industry leader
- Strong legal validity
- Higher cost
- Better for B2B/enterprise clients

**Pricing:**
- Personal: $10/month (5 envelopes)
- Standard: $25/month per user
- Business Pro: $40/month per user

---

#### **Option D: European Providers (eIDAS Compliant)**

##### **Namirial (Italy/EU)**
- Strong eIDAS compliance
- Popular in EU
- Supports Romanian qualified certificates

##### **Certum (Poland)**
- Qualified Trust Service Provider
- Operates in Romania
- QES certificates available

##### **CertDigital (Romania)**
- Local Romanian provider
- Qualified certificates for Romanian citizens
- May have better local market understanding

**Pricing:** Typically per-signature (€0.20-1.00) or subscription

---

### RECOMMENDATION: Tiered Approach

**Tier 1: Canvas Signature (signature_pad.js) - 90% of use cases**
- Service agreements
- Terms acceptance
- Low-value contracts (< €1,000)

**Enhanced validity through:**
```typescript
// Signature metadata for legal validity
const signatureData = {
  signature: signaturePad.toDataURL(),
  timestamp: new Date().toISOString(),
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  userId: user.id,
  kycVerified: user.kycStatus === 'verified',
  documentHash: sha256(documentContent),
  geoLocation: userLocation // if available
};

// Send confirmation email with signed document
await sendSignatureConfirmation(user.email, signatureData);
```

**Tier 2: Partnership with CertDigital - High-value contracts**
- Real estate documents
- Financial agreements
- Legal contracts (> €1,000)
- Government-related documents

**Why:**
1. 90% of transactions don't require qualified signatures
2. Cost-effective for standard operations
3. Ability to upgrade for high-value use cases
4. Local Romanian provider for qualified signatures
5. Compliance with Romanian legal requirements

---

## 4. Payment Processing - Romania

### Requirements
- Online card payments
- Romanian market support
- PSD2 SCA compliance
- Multi-currency (RON, EUR)

### Romanian Payment Landscape
- Card penetration: Growing but lower than Western EU
- Cash still popular
- Bank transfers widely used
- Mobile payments increasing

### Recommended Solutions

#### **Option A: Stripe (PLANNED) - RECOMMENDED**
**Pros:**
- Excellent developer experience
- Strong documentation and SDKs
- PSD2 SCA compliant
- Multi-currency support
- Romanian cards supported
- Apple Pay / Google Pay
- Subscription billing built-in

**Cons:**
- Slightly higher fees than local processors
- Romania is supported but not primary market
- Limited Romanian bank integrations

**Pricing:**
- European cards: 1.5% + €0.25 per transaction
- Non-European cards: 2.9% + €0.25
- No setup or monthly fees

**Integration Complexity:** Low-Medium (3-5 days)

**Romanian Specifics:**
- Supports RON currency
- Works with all major Romanian banks
- PSD2 Strong Customer Authentication (SCA) built-in
- Connect platform for marketplace features

---

#### **Option B: Local Romanian Payment Processors**

##### **euplatesc.ro**
**Pros:**
- Local Romanian company
- Lower fees for RON transactions
- Better Romanian bank integrations
- Local support in Romanian

**Cons:**
- Less sophisticated API than Stripe
- Weaker documentation
- Fewer features (subscriptions, etc.)
- Less international recognition

**Pricing:**
- Setup: €200-400 one-time
- Per transaction: 1.2% - 1.8% + fixed fee
- Monthly fee: €15-30

##### **netopia-payments.com (formerly mobilPay)**
**Pros:**
- Largest local processor
- Wide Romanian bank support
- Local support
- Installment payments

**Cons:**
- Similar API limitations
- Higher setup costs

**Pricing:**
- Similar to euplatesc
- Negotiable based on volume

---

#### **Option C: PayU**
**Pros:**
- International presence in Central/Eastern Europe
- Good for regional expansion
- Better API than local-only providers
- Supports Romanian market

**Cons:**
- More expensive than local providers
- Less features than Stripe

**Pricing:**
- Around 2% + fixed fee
- Setup fees apply

---

### Additional Payment Methods for Romania

#### **Bank Transfer / IBAN Payment**
- **Very popular in Romania** for larger amounts
- Consider: Manual IBAN payments with payment confirmation upload
- Or: GoCardless for SEPA Direct Debit (1% fee, €0.20-2 per transaction)

#### **Cash on Delivery (for physical deliveries)**
- Still relevant in Romanian market
- Coordinate with courier services

#### **Romanian Card-specific Features**
- Consider Star/Benefit card support (meal vouchers - popular in Romania)
- Through: Up Romania, Benefit Systems

---

### RECOMMENDATION: Stripe + Manual Bank Transfers

**Primary: Stripe**
- Modern card payments
- International cards
- Subscriptions
- Best UX

**Secondary: Manual Bank Transfer**
- For larger transactions (> 500 RON)
- Lower fees (free except bank fees)
- Popular with Romanian businesses
- Implementation:
```typescript
// Generate unique payment reference
const paymentRef = `EGHI-${orderId}-${randomString(6)}`;

// Display bank details with reference
const bankDetails = {
  beneficiary: "eGhiseul SRL",
  iban: "RO49AAAA1B31007593840000",
  bank: "ING Bank Romania",
  reference: paymentRef, // Important for reconciliation
  amount: totalAmount,
  currency: "RON"
};

// User uploads payment proof or automated reconciliation via banking API
```

**Future Addition (Phase 2): euplatesc or Netopia**
- Add if Stripe fees become significant (> €1,000/month in fees)
- Or if customers request local payment methods

---

## 5. SMS Provider

### Requirements
- OTP/2FA messages
- Transactional notifications
- Romanian phone numbers (+40)
- Delivery reliability

### Recommended Solutions

#### **Option A: Local Romanian Providers**

##### **SMSLink.ro (RECOMMENDED)**
**Pros:**
- Local Romanian provider
- **Significantly cheaper** for Romanian numbers
- Excellent delivery rates in Romania
- Romanian support
- Sender ID support
- Two-way SMS

**Cons:**
- Limited international coverage
- Simpler API than Twilio
- No advanced features (voice, video)

**Pricing:**
- Bulk SMS: €0.025-0.035 per SMS (2.5-3.5 bani)
- No monthly fees
- No setup fees
- Volume discounts available

**Integration Complexity:** Low (1-2 days)
```php
// REST API available
POST https://www.smslink.ro/sms/gateway
```

##### **iSMS.ro**
- Similar to SMSLink
- Pricing: €0.03-0.04 per SMS
- Good alternative

---

#### **Option B: Twilio (PLANNED)**
**Pros:**
- World-class reliability
- Excellent API and documentation
- Advanced features (voice, video, verify API)
- Global coverage
- Programmable messaging

**Cons:**
- **3-4x more expensive** for Romanian SMS
- Overkill for simple SMS needs

**Pricing:**
- Romania SMS: $0.10-0.12 per SMS (€0.09-0.11)
- Verify API (OTP): $0.05 per verification + SMS costs
- Monthly fees for phone numbers: $1-5

**Integration Complexity:** Low (1-2 days)

---

#### **Option C: Vonage (formerly Nexmo)**
**Pros:**
- Good international coverage
- Verify API for OTP
- Competitive pricing
- Good documentation

**Cons:**
- Still more expensive than local providers for Romania
- Similar to Twilio

**Pricing:**
- Romania SMS: €0.07-0.09 per SMS
- Verify API: Similar to Twilio

---

#### **Option D: AWS SNS**
**Pros:**
- Native AWS integration
- Pay-as-you-go
- No monthly fees
- Good reliability

**Cons:**
- Romania pricing similar to Twilio
- Less SMS-specific features

**Pricing:**
- Romania SMS: $0.08-0.10 per SMS

---

### RECOMMENDATION: SMSLink.ro

**Why:**
1. **70% cost savings** vs Twilio for Romanian numbers
2. Excellent delivery rates in Romania (99%+)
3. No monthly fees
4. Local support
5. Sufficient features for OTP/notifications

**Cost Comparison (1,000 SMS/month):**
- SMSLink.ro: €30/month
- Twilio: €100/month
- **Savings: €70/month (€840/year)**

**Implementation Strategy:**
```typescript
// Primary: SMSLink for Romanian numbers
if (phoneNumber.startsWith('+40')) {
  await smsLinkProvider.send(phoneNumber, message);
} else {
  // Fallback: Twilio for international
  await twilioProvider.send(phoneNumber, message);
}
```

**Future Consideration:**
- Add Twilio only if expanding internationally
- Or if advanced features needed (voice, video)

---

## 6. Transactional Email

### Requirements
- Account emails (registration, password reset)
- Transaction notifications
- Document delivery
- High deliverability
- Template management

### Recommended Solutions

#### **Option A: Resend (RECOMMENDED)**
**Pros:**
- **Modern developer experience** (best API design)
- Excellent documentation
- React Email integration (type-safe emails)
- Simple pricing
- Great deliverability
- EU infrastructure available
- No credit card required to start

**Cons:**
- Newer player (less proven at massive scale)
- Fewer enterprise features than SendGrid

**Pricing:**
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Scale: $100/month for 1M emails
- **Best price-to-feature ratio**

**Integration Complexity:** Very Low (1 day)
```typescript
import { Resend } from 'resend';
const resend = new Resend('re_123456789');

await resend.emails.send({
  from: 'noreply@eghiseul.ro',
  to: user.email,
  subject: 'Welcome to eGhiseul',
  react: WelcomeEmail({ name: user.name })
});
```

---

#### **Option B: Postmark**
**Pros:**
- **Highest deliverability** (claim 99%+ inbox rate)
- Fast delivery (seconds)
- Focus on transactional (not marketing)
- Excellent bounce/spam tracking
- Great API and webhooks
- EU infrastructure

**Cons:**
- Slightly more expensive than Resend
- No marketing email features

**Pricing:**
- Free: 100 emails/month
- 10,000 emails: $15/month ($1.50 per 1,000)
- 50,000 emails: $50/month ($1.00 per 1,000)

**Integration Complexity:** Low (1-2 days)

---

#### **Option C: SendGrid**
**Pros:**
- Market leader
- Proven at scale
- Marketing + transactional
- Advanced features
- Templates and automation

**Cons:**
- More expensive
- More complex (feature bloat)
- API less modern than Resend
- Reputation issues (shared IPs, spam concerns)

**Pricing:**
- Free: 100 emails/day (3,000/month)
- Essentials: $19.95/month for 50,000 emails
- Pro: $89.95/month for 100,000 emails

**Integration Complexity:** Medium (2-3 days)

---

#### **Option D: Amazon SES**
**Pros:**
- **Cheapest** ($0.10 per 1,000 emails)
- Native AWS integration
- Scalable
- Good for high volume

**Cons:**
- Requires more setup (SMTP or SDK)
- Need to manage sender reputation
- No built-in templates (use with React Email or handlebars)
- Deliverability requires work (warm-up, monitoring)

**Pricing:**
- $0.10 per 1,000 emails
- First 62,000 emails/month free (if sent from EC2)

**Integration Complexity:** Medium-High (3-5 days)

---

### RECOMMENDATION: Resend

**Why:**
1. **Best developer experience** (Next.js + React Email integration)
2. **Fair pricing** with generous free tier
3. EU infrastructure (GDPR compliance)
4. Modern API design
5. Simple template management with React
6. Good deliverability out of the box

**Pricing Analysis:**
- Year 1 (< 3,000/month): Free
- Year 2 (< 50,000/month): $20/month
- Year 3 (< 100,000/month): $35/month

**React Email Template Example:**
```typescript
// emails/welcome.tsx
import { Button, Html } from '@react-email/components';

export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <h1>Bun venit, {name}!</h1>
      <p>Contul tău eGhiseul a fost creat cu succes.</p>
      <Button href="https://eghiseul.ro/dashboard">
        Accesează Dashboard
      </Button>
    </Html>
  );
}
```

**Alternative for High Volume (100k+/month): AWS SES**
- Switch to SES if email volume exceeds 100,000/month
- Cost: $10/month vs $50+/month
- Requires more setup but worth it at scale

---

## 7. Invoice Integration & E-Factura

### Requirements
- Invoice generation
- E-factura compliance (Romania)
- Integration with accounting
- ANAF reporting

### Romanian E-Factura Context

**E-factura System (RO e-Invoice):**
- **Mandatory** since July 2022 for B2G (business to government)
- **Extended** to B2B for large companies (> €15M revenue)
- Expected to become mandatory for all B2B by 2024-2025
- Operated by ANAF (Romanian tax authority)
- Based on UBL format (Universal Business Language)

**Key Requirements:**
- XML format (UBL 2.1)
- Digital signature (qualified certificate)
- ANAF SPV (Public Virtual Space) transmission
- Real-time validation

---

### Recommended Solutions

#### **Option A: Olbio.ro (PLANNED) - GOOD CHOICE**
**Pros:**
- Romanian SaaS platform
- E-factura compliant
- Modern interface
- API available
- Handles ANAF transmission
- Digital signature included

**Cons:**
- Requires subscription
- API documentation may be limited

**Pricing:**
- Starter: ~50-100 RON/month
- Professional: ~150-300 RON/month
- Depends on invoice volume

**Integration Complexity:** Medium (3-5 days)

---

#### **Option B: smartbill.ro**
**Pros:**
- **Most popular** Romanian invoicing platform
- E-factura compliant
- REST API available
- Wide adoption
- Good documentation
- Handles ANAF reporting
- Cloud storage

**Cons:**
- Subscription required
- May be more expensive at scale

**Pricing:**
- Basic: 99 RON/month
- Standard: 249 RON/month
- Premium: 499 RON/month
- API access included in all plans

**Integration Complexity:** Low-Medium (2-4 days)
```php
// SmartBill API
POST https://ws.smartbill.ro/SBORO/api/invoice
```

---

#### **Option C: facturis.ro**
**Pros:**
- Romanian platform
- E-factura integration
- Competitive pricing
- API available

**Cons:**
- Smaller player
- Less comprehensive than SmartBill

**Pricing:**
- Similar to Olbio (~100-200 RON/month)

---

#### **Option D: Direct ANAF E-Factura Integration**
**Pros:**
- No third-party dependency
- Full control
- No recurring costs

**Cons:**
- **Very complex implementation**
- Requires qualified certificate (CertDigital, etc.)
- Need to implement UBL XML generation
- Must handle ANAF API directly
- Ongoing maintenance burden
- Compliance responsibility

**Cost:**
- Qualified certificate: ~500-1,000 RON/year
- Development: 20-40+ days
- Ongoing compliance updates

**Integration Complexity:** Very High (30+ days)

---

#### **Option E: Build Invoice Generation + Use Service for E-Factura**

**Hybrid Approach:**
1. Build invoice generation in-house (PDF, data storage)
2. Use service only for E-factura transmission

**Pros:**
- Full control over invoice design and data
- Lower per-invoice costs
- Flexibility

**Libraries for Invoice Generation:**
- **pdfkit** (Node.js): Generate PDF invoices
- **react-pdf**: Generate PDFs from React components
- **puppeteer**: HTML to PDF

**E-factura Services (API-only):**
- **anaf-connector**: Open-source libraries for ANAF API
- Some providers offer API-only plans

---

### RECOMMENDATION: SmartBill

**Why:**
1. **Market leader** in Romania (proven reliability)
2. **E-factura compliant** (handles all ANAF complexity)
3. Good API documentation
4. Includes digital signature
5. Handles both invoicing and e-factura
6. Wide adoption = better support/community

**Implementation Strategy:**
```typescript
// Use SmartBill for Romanian invoices
if (customer.country === 'RO' && customer.type === 'business') {
  // E-factura required
  await smartbill.createInvoice({
    client: customer,
    items: invoiceItems,
    sendEfactura: true
  });
} else {
  // Generate PDF invoice in-house
  await generatePDFInvoice(invoiceData);
}
```

**Cost Analysis:**
- Year 1: 249 RON/month = €50/month
- Saves 20-40 days of development
- Eliminates compliance burden
- **ROI: Positive from day 1**

**Alternative: Olbio**
- Consider if SmartBill pricing becomes prohibitive
- Or if their API better fits your workflow

---

## 8. Courier API Integration

### Requirements
- Domestic shipping (Romania): Fan Courier
- International shipping: DHL
- API integration for tracking
- Label generation
- Price calculation

### Romanian Courier Market
- **Fan Courier**: Largest Romanian courier
- **Cargus**: Second largest
- **DPD Romania**: International presence
- **GLS Romania**: Growing presence
- **Sameday**: Local player

---

### Recommended Solutions

#### **Domestic: Fan Courier (PLANNED) - GOOD CHOICE**

**API Availability:** YES - REST API available

**Pros:**
- Largest network in Romania
- Best coverage including rural areas
- Good delivery times
- Cash-on-delivery (ramburs) support
- API for AWB generation, tracking, pricing

**Cons:**
- API documentation could be better
- Some legacy systems

**API Features:**
- AWB (shipping label) generation
- Price calculation
- Tracking
- Pickup scheduling
- POD (Proof of Delivery)

**Pricing:**
- Contract-based (negotiate rates based on volume)
- Typical: 10-15 RON per shipment domestic
- Ramburs (COD): +2-3% fee

**Integration Complexity:** Medium (5-7 days)

**API Endpoints:**
```
POST /export_awb_integrat.php - Generate AWB
POST /awb_tracking_integrat.php - Track shipment
POST /get_tarif.php - Calculate price
```

**Documentation:**
- Available at: https://www.fancourier.ro/documente/
- SOAP and REST options

---

#### **Alternative: Cargus (Recommended Backup)**

**Pros:**
- Second largest in Romania
- Good API documentation (better than Fan Courier)
- Competitive pricing
- Modern platform

**Cons:**
- Slightly smaller network than Fan Courier

**API:** Well-documented REST API

**Integration Complexity:** Medium (4-6 days)

**Why as Alternative:**
- Diversification (don't rely on single courier)
- Leverage for negotiations
- Redundancy for high-value shipments

---

#### **International: DHL (PLANNED) - GOOD CHOICE**

**API Availability:** YES - Excellent APIs

**DHL API Services:**
- **DHL Express API**: International shipping, tracking, rates
- **DHL Parcel API**: Economy shipping
- **MyDHL+ API**: Modern REST API (recommended)

**Pros:**
- Global network
- Excellent API documentation
- Real-time tracking
- Rate shopping
- Label generation
- Customs documentation

**Cons:**
- More expensive than regional alternatives
- May be overkill for European shipments

**Pricing:**
- Contract-based
- Typical international: €20-50+ depending on destination/weight

**Integration Complexity:** Low-Medium (3-5 days)

**API Example:**
```typescript
// DHL Express REST API
POST https://api.dhl.com/mydhlapi/shipments
{
  "plannedShippingDateAndTime": "2025-12-15T13:00:00",
  "pickup": { /* Romania address */ },
  "productCode": "P", // DHL Express Worldwide
  "accounts": [{ "typeCode": "shipper", "number": "123456789" }],
  // ...
}
```

**Documentation:**
- https://developer.dhl.com/
- Sandbox available for testing

---

#### **International Alternatives**

##### **DPD Romania**
**Pros:**
- Good European network
- Cheaper than DHL for EU destinations
- API available
- Strong in Eastern Europe

**Cons:**
- Weaker outside Europe

**Use Case:** EU shipments (cheaper alternative to DHL)

##### **UPS**
**Pros:**
- Global network
- Good API
- Competitive with DHL

**Cons:**
- Less presence in Romania vs DHL

---

#### **Multi-Carrier Aggregator Services**

**Consider: Sameday Courier (Romania)**
- **Pros:**
  - Partners with multiple couriers
  - Single API for multiple carriers
  - Locker network in Romania
  - Good for domestic + regional

- **Cons:**
  - Adds middleware layer
  - May have higher fees

**Consider: Shippo or EasyShip (International Aggregators)**
- **Pros:**
  - Single API for multiple carriers
  - Rate shopping
  - Label management
  - Good for startups

- **Cons:**
  - Additional fees (per-label or percentage)
  - External dependency
  - May not have best Romanian courier rates

---

### RECOMMENDATION: Fan Courier + DHL + Cargus Backup

**Domestic (Romania):**
- **Primary:** Fan Courier (best coverage)
- **Backup:** Cargus (redundancy, negotiation leverage)

**International:**
- **EU:** DHL Express (or DPD for budget option)
- **Global:** DHL Express

**Implementation Strategy:**
```typescript
// Courier selection logic
function selectCourier(destination: string, weight: number, value: number) {
  if (destination.country === 'RO') {
    // Domestic: Fan Courier (or Cargus if Fan Courier unavailable)
    return fanCourier.available ? 'fan-courier' : 'cargus';
  } else if (destination.isEU) {
    // EU: DPD for budget, DHL for premium
    return value > 500 ? 'dhl' : 'dpd';
  } else {
    // International: DHL
    return 'dhl';
  }
}

// Multi-carrier rate shopping
async function getBestRate(shipment: Shipment) {
  const [fanRate, cargusRate, dhlRate] = await Promise.all([
    fanCourier.getRate(shipment),
    cargus.getRate(shipment),
    dhl.getRate(shipment)
  ]);

  return selectBestOption([fanRate, cargusRate, dhlRate]);
}
```

**Contract Negotiation Tips:**
- Negotiate volume discounts
- Ask for API access (may require business account)
- Request dedicated account manager
- Get COD (ramburs) fee discounts

---

## 9. CUI Lookup (Romanian Company Registry)

### Requirements
- Company validation (CUI number)
- Company data retrieval (name, address, registration)
- Tax registration verification
- VAT validation

### Romanian Context

**CUI (Cod Unic de Identificare):**
- Unique company identification number in Romania
- Used for tax, invoicing, legal purposes
- Managed by ANAF (tax authority) and ONRC (trade registry)

---

### Recommended Solutions

#### **Option A: Official ANAF API (RECOMMENDED - FREE)**

**API Availability:** YES - Since 2020

**ANAF SPV API:**
- **Endpoint:** https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva
- **Free to use**
- **Official data** (most reliable)
- Returns: CUI, company name, address, VAT registration, status

**Pros:**
- Free
- Official source
- Real-time data
- No registration required (for basic use)
- Rate limits are generous

**Cons:**
- Documentation in Romanian (mostly)
- No advanced search features
- Basic error handling

**Response Data:**
- CUI validity
- Company registration date
- VAT payer status (plătitor de TVA)
- Company name
- Address
- Status (active/inactive)

**Integration Complexity:** Low (1-2 days)

**Example Request:**
```bash
POST https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva
Content-Type: application/json

[
  {
    "cui": 31738024,
    "data": "2025-12-15"
  }
]
```

**Example Response:**
```json
{
  "cod": 200,
  "message": "Success",
  "found": [
    {
      "cui": 31738024,
      "data": "2025-12-15",
      "denumire": "COMPANY NAME SRL",
      "adresa": "BUCURESTI, SECTOR 1, ...",
      "scpTVA": true,
      "data_inregistrare": "2013-08-01",
      "statusInactivi": false
    }
  ]
}
```

**Documentation:**
- https://static.anaf.ro/static/10/Anaf/Informatii_R/documentatie_SW_PTV_deschis.txt

---

#### **Option B: openapi.ro (RECOMMENDED - ENHANCED)**

**Pros:**
- **Built on ANAF API** (uses official data)
- **Better developer experience** (cleaner API)
- Additional features (company search, bulk lookup)
- Better documentation
- Caching (faster responses)
- **Free tier available**

**Cons:**
- Third-party dependency
- May have rate limits on free tier

**Pricing:**
- Free: 100 requests/day
- Starter: 29 EUR/month (10,000 requests)
- Business: 99 EUR/month (50,000 requests)

**Integration Complexity:** Very Low (1 day)

**API Example:**
```bash
GET https://api.openapi.ro/api/companies/ro31738024
Authorization: Bearer YOUR_API_KEY
```

**Features:**
- CUI validation
- Company search by name
- Company officers/shareholders
- Financial data
- Historical data

**Documentation:**
- https://docs.openapi.ro/

---

#### **Option C: infocui.ro (PLANNED) - ALTERNATIVE**

**Pros:**
- Romanian service
- User-friendly interface
- Bulk lookup features
- Additional company data

**Cons:**
- **Paid service** (no free tier)
- API may be limited vs direct ANAF
- Less clear pricing

**Pricing:**
- Contact for API access
- Typically per-request pricing

**Use Case:**
- If you need enhanced data beyond ANAF
- Bulk company data enrichment

---

#### **Option D: ONRC API (Trade Registry)**

**ONRC (Oficiul Național al Registrului Comerțului):**
- **Official** trade registry
- **Most comprehensive** company data
- Includes: financial statements, company officers, changes

**Pros:**
- Most authoritative source
- Complete company information
- Legal validity

**Cons:**
- **Paid service** (per request)
- Requires contract/registration
- More complex integration
- **Overkill** for simple CUI validation

**Pricing:**
- Per-request fees (variable)
- Requires business agreement

**Use Case:**
- Deep company due diligence
- Financial analysis
- Legal verification

---

### RECOMMENDATION: ANAF API (Free) + openapi.ro (Paid Tier)

**Implementation Strategy:**

**Phase 1 (MVP): Direct ANAF API**
- Free
- Sufficient for CUI validation
- Real-time official data
- Cost: €0

**Phase 2 (Scale): openapi.ro**
- Better developer experience
- Additional features (search, history)
- Caching for performance
- Cost: €29/month

**Implementation:**
```typescript
// Service layer with fallback
class CUILookupService {
  async validateCUI(cui: string): Promise<CompanyData> {
    try {
      // Primary: openapi.ro (if API key available and not rate-limited)
      if (this.hasOpenAPIKey()) {
        return await this.openApiLookup(cui);
      }
    } catch (error) {
      console.error('OpenAPI failed, falling back to ANAF', error);
    }

    // Fallback: Direct ANAF API
    return await this.anafLookup(cui);
  }

  async anafLookup(cui: string) {
    const response = await fetch('https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        cui: parseInt(cui.replace(/[^0-9]/g, '')), // Clean CUI
        data: new Date().toISOString().split('T')[0]
      }])
    });

    const data = await response.json();

    if (data.found && data.found.length > 0) {
      return {
        cui: data.found[0].cui,
        name: data.found[0].denumire,
        address: data.found[0].adresa,
        vatPayer: data.found[0].scpTVA,
        active: !data.found[0].statusInactivi,
        registrationDate: data.found[0].data_inregistrare
      };
    }

    throw new Error('CUI not found');
  }
}
```

**Caching Strategy:**
```typescript
// Cache company data (it doesn't change frequently)
const cacheKey = `cui:${cui}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const companyData = await cuiService.validateCUI(cui);

// Cache for 7 days
await redis.set(cacheKey, JSON.stringify(companyData), 'EX', 604800);

return companyData;
```

**Cost Analysis:**
- Year 1 (< 100 lookups/day): Free (ANAF API)
- Year 2 (> 100 lookups/day): €29/month (openapi.ro)
- **Recommendation:** Start free, upgrade when needed

---

## 10. Additional Considerations

### A. GDPR Compliance

**Critical for Romanian/EU operations:**

1. **Data Processing Agreement (DPA):**
   - Ensure all third-party services have EU DPAs
   - AWS, Stripe, Veriff all provide standard DPAs

2. **Data Residency:**
   - Use EU regions for all services
   - AWS: eu-west-1 (Ireland) or eu-central-1 (Frankfurt)
   - Avoid US-only services without adequacy decisions

3. **User Consent:**
   - Cookie consent (consider Cookiebot, OneTrust)
   - Privacy policy and terms (Romanian language)

4. **Data Subject Rights:**
   - Implement data export (GDPR Article 20)
   - Implement data deletion (right to be forgotten)

5. **Breach Notification:**
   - 72-hour reporting to ANSPDCP (Romanian DPA)
   - User notification procedures

**Recommended Tools:**
- **Cookie Consent:** CookieYes (free tier) or custom
- **Privacy Policy Generator:** iubenda, TermsFeed
- **GDPR Tools:** DataGuard, Secure Privacy

---

### B. PSD2 / Strong Customer Authentication (SCA)

**Applies to payments:**
- Stripe handles SCA automatically
- 3D Secure 2.0 required for EU payments
- Exemptions: Low-value (< €30), recurring after first

**Implementation:**
- Ensure Stripe integration uses PaymentIntents API (SCA-ready)
- Handle authentication redirects

---

### C. Security Best Practices

1. **SSL/TLS:**
   - Use Let's Encrypt (free) or AWS Certificate Manager
   - Enforce HTTPS everywhere

2. **Secrets Management:**
   - Use AWS Secrets Manager or Parameter Store
   - Never commit API keys

3. **Database Security:**
   - Encryption at rest (PostgreSQL with AWS RDS encryption)
   - Encryption in transit (SSL connections)
   - Regular backups

4. **API Security:**
   - Rate limiting (consider Redis + express-rate-limit)
   - JWT tokens with short expiry
   - API key rotation

5. **Monitoring:**
   - AWS CloudWatch for infrastructure
   - Sentry for error tracking
   - LogRocket for user session replay (optional)

---

### D. Backup & Disaster Recovery

**AWS S3:**
- Enable versioning
- Cross-region replication
- Lifecycle policies

**PostgreSQL:**
- Automated backups (AWS RDS automatic backups)
- Point-in-time recovery
- Read replicas for high availability

**Strategy:**
- Daily automated backups
- Weekly manual backup verification
- Quarterly disaster recovery testing

---

### E. Monitoring & Observability

**Recommended Stack:**
1. **Application Monitoring:** Sentry (errors) + LogTail/BetterStack (logs)
2. **Infrastructure:** AWS CloudWatch
3. **Uptime Monitoring:** UptimeRobot (free) or Pingdom
4. **Analytics:** Plausible (privacy-friendly) or Google Analytics

---

### F. Development & Deployment

**CI/CD:**
- GitHub Actions (free for public repos, affordable for private)
- Deploy to AWS ECS/Fargate or Vercel (Next.js frontend)

**Environments:**
- Development (local)
- Staging (AWS or Vercel preview)
- Production (AWS)

**Infrastructure as Code:**
- Terraform or AWS CDK
- Version control all infrastructure

---

## 11. Cost Summary & Projections

### Year 1 (MVP - 1,000 users, 500 transactions/month)

| Service | Provider | Monthly Cost |
|---------|----------|--------------|
| **Hosting** | AWS (ECS + RDS + S3) | €100-150 |
| **OCR** | AWS Textract | €20 |
| **KYC** | Custom (AWS Rekognition) | €10 |
| **Signature** | signature_pad (custom) | €0 |
| **Payments** | Stripe (1.5% + €0.25) | Variable* |
| **SMS** | SMSLink.ro | €30 |
| **Email** | Resend | €0 (free tier) |
| **Invoicing** | SmartBill | €50 |
| **Courier** | Fan Courier + DHL | Variable** |
| **CUI Lookup** | ANAF API | €0 |
| **Monitoring** | Sentry + UptimeRobot | €10 |
| **Domain & SSL** | Namecheap + Let's Encrypt | €1 |
| **Total Fixed** | | **~€220/month** |

*Stripe fees: On €10,000 revenue = €165 in fees
**Courier fees: Passed to customers

### Year 2 (Growth - 10,000 users, 2,000 transactions/month)

| Service | Monthly Cost |
|---------|--------------|
| **Hosting** | €300-500 |
| **OCR** | €80 |
| **KYC** | €40 (or €2,000 if Veriff) |
| **SMS** | €100 |
| **Email** | €20 (Resend Pro) |
| **Invoicing** | €50 |
| **CUI Lookup** | €29 (openapi.ro) |
| **Other** | €50 |
| **Total Fixed** | **~€670/month** (or €2,600 with Veriff) |

### Year 3 (Scale - 50,000 users, 10,000 transactions/month)

| Service | Monthly Cost |
|---------|--------------|
| **Hosting** | €1,000-1,500 |
| **OCR** | €400 |
| **KYC** | Veriff ~€15,000 |
| **SMS** | €400 |
| **Email** | €50 |
| **Invoicing** | €100 |
| **Total** | **~€17,500/month** |

**Note:** At this scale, consider:
- Negotiating enterprise pricing with all vendors
- Building custom solutions for high-volume services
- Dedicated account managers

---

## 12. Implementation Roadmap

### Phase 1: MVP (Months 1-3)

**Priority 1 (Must-Have):**
1. AWS Textract (OCR) - Week 1
2. Custom KYC (AWS Rekognition) - Week 2-3
3. Canvas signature (signature_pad) - Week 1
4. Stripe payments - Week 1
5. SMSLink.ro (SMS) - Week 1
6. Resend (email) - Week 1
7. SmartBill (invoicing) - Week 2
8. ANAF API (CUI lookup) - Week 1

**Priority 2 (Should-Have):**
9. Fan Courier integration - Week 3-4
10. DHL integration - Week 4

**Total:** 4-6 weeks of integration work

---

### Phase 2: Growth (Months 4-12)

1. Evaluate KYC solution (custom vs Veriff)
2. Add Cargus as backup courier
3. Upgrade to openapi.ro for CUI lookup
4. Optimize based on usage patterns
5. Consider DPD for EU shipping

---

### Phase 3: Scale (Year 2+)

1. Negotiate enterprise pricing
2. Consider custom solutions for high-volume services
3. Add redundancy (multi-region, failover)
4. Advanced fraud detection
5. Machine learning for document processing

---

## 13. Final Recommendations Summary

| Category | Recommended Solution | Alternative |
|----------|---------------------|-------------|
| **OCR** | AWS Textract | Google Vision AI |
| **KYC** | Custom (Phase 1) → Veriff (Phase 2) | Onfido |
| **Signature** | signature_pad.js + CertDigital (high-value) | Adobe Sign |
| **Payments** | Stripe + Manual Bank Transfer | euplatesc.ro |
| **SMS** | SMSLink.ro | Twilio (international) |
| **Email** | Resend | Postmark |
| **Invoicing** | SmartBill | Olbio.ro |
| **Courier (RO)** | Fan Courier + Cargus | Sameday |
| **Courier (Intl)** | DHL | DPD/UPS |
| **CUI Lookup** | ANAF API → openapi.ro | Direct ONRC |

---

## 14. Key Takeaways

1. **Start Lean:** Use cost-effective solutions for MVP (SMSLink, ANAF API, custom KYC)
2. **Leverage AWS:** You're already on AWS - use Textract and Rekognition for OCR/KYC
3. **Local Matters:** Romanian providers (SMSLink, SmartBill, Fan Courier) offer better value
4. **Scale Smart:** Plan migration path to enterprise solutions (Veriff, premium tiers)
5. **Compliance First:** GDPR, e-factura, and electronic signature regulations are critical
6. **Hybrid Approach:** Mix custom and third-party solutions based on cost/complexity

---

## 15. Next Steps

1. **Set up development environment** with selected services
2. **Create sandbox accounts** for testing:
   - AWS Textract
   - Stripe (test mode)
   - SMSLink (test credits)
   - Resend (free tier)
   - SmartBill (trial)
3. **Implement MVP integrations** (4-6 weeks)
4. **Test with Romanian documents** (real ID cards, invoices)
5. **Document Romanian-specific workflows** (e-factura, CUI validation)
6. **Prepare GDPR compliance** (privacy policy, DPAs, consent)

---

## 16. Resources & Links

### Official Romanian APIs
- ANAF CUI Lookup: https://webservicesp.anaf.ro/
- E-factura Portal: https://efactura.anaf.ro/
- ONRC (Trade Registry): https://www.onrc.ro/

### Service Providers (Romanian)
- SMSLink: https://www.smslink.ro/
- SmartBill: https://www.smartbill.ro/
- Fan Courier: https://www.fancourier.ro/
- openapi.ro: https://openapi.ro/

### International Services
- AWS Textract: https://aws.amazon.com/textract/
- Stripe: https://stripe.com/
- Resend: https://resend.com/
- DHL Developer: https://developer.dhl.com/

### Compliance
- GDPR (Romanian): https://www.dataprotection.ro/
- eIDAS Regulation: https://ec.europa.eu/digital-single-market/en/trust-services-and-eid

---

**Document Status:** Complete
**Confidence Level:** High (based on current market knowledge as of January 2025)
**Recommended Review:** Quarterly (pricing and features change)

---

*This document should be treated as a living document and updated as the Romanian market evolves and new services become available.*
