# Sprint 3: KYC & Documents

**Duration:** Week 9-10 (2 weeks)
**Status:** In Progress
**Team Velocity:** Target 47 story points
**Sprint Goal:** Enable complete order creation flow with KYC verification and document upload capabilities

---

## Executive Summary

Sprint 3 transforms the backend foundation into a customer-facing platform. This sprint delivers the complete order creation flow (6-step wizard), KYC document collection, OCR-powered data extraction, and user dashboard. By the end of this sprint, customers can browse services, create orders, upload identity documents, and track their orders.

**Critical Success Factors:**
- Seamless 6-step order wizard with real-time validation
- Secure KYC document upload to AWS S3 with encryption
- Accurate OCR extraction with AWS Textract (95%+ accuracy)
- CNP validation matching uploaded ID card
- Intuitive user dashboard with order tracking

---

## Sprint Goals & Objectives

### Primary Goals

1. **Service Discovery** - Enable customers to browse and select services
2. **Order Creation** - Implement 6-step wizard for order placement
3. **KYC Collection** - Secure upload of identity documents and selfie
4. **Data Extraction** - OCR-powered data extraction from ID cards
5. **User Dashboard** - Order tracking and status visibility

### Business Objectives

- Reduce order creation time to < 5 minutes
- Achieve 95%+ OCR accuracy for CNP extraction
- Zero data leakage in KYC document handling
- Enable 100% self-service order placement
- Provide real-time order status visibility

### Technical Objectives

- AWS S3 integration with server-side encryption
- AWS Textract integration for ID card OCR
- Client-side canvas for electronic signature
- Responsive UI supporting mobile devices (70%+ of traffic)
- GDPR-compliant data handling throughout

---

## User Stories with Acceptance Criteria

### EPIC 1: Service Catalog & Discovery

#### US-301: Service Catalog Homepage Display
**As a** customer
**I want to** see available services on the homepage
**So that** I can quickly find and select the service I need

**Story Points:** 5

**Acceptance Criteria:**
- [ ] Homepage displays 3 featured services (Cazier Fiscal, Extras CF, Certificat Constatator)
- [ ] Each service card shows: name, price, processing time, short description
- [ ] "Urgenta" badge displayed if urgent processing available
- [ ] Service cards are clickable and navigate to service detail page
- [ ] Responsive grid layout: 3 columns desktop, 2 tablet, 1 mobile
- [ ] Loading state with skeleton components
- [ ] Empty state if no services available
- [ ] Services fetched from `/api/services?is_active=true&is_featured=true`

**Technical Notes:**
- Use `@tanstack/react-query` for data fetching
- Implement service card component: `/components/services/service-card.tsx`
- Use shadcn/ui Card, Badge components

**Dependencies:**
- Sprint 2 API `/api/services` (Complete)

---

#### US-302: Service Detail Page
**As a** customer
**I want to** view detailed information about a service
**So that** I can understand requirements before ordering

**Story Points:** 3

**Acceptance Criteria:**
- [ ] Service detail page at `/services/[slug]`
- [ ] Displays: full description, price breakdown, processing time, requirements
- [ ] Shows all available options with prices (urgenta, traducere, apostila, etc.)
- [ ] "What You Need" section lists required documents/data
- [ ] "How It Works" section shows processing steps
- [ ] "Order Now" CTA button prominent and sticky on mobile
- [ ] Breadcrumb navigation (Home > Services > [Service Name])
- [ ] SEO meta tags from service.meta_title and meta_description
- [ ] Data fetched from `/api/services/[slug]`

**Technical Notes:**
- Server component for SEO benefits
- generateStaticParams for static generation of 3 MVP services
- Processing steps rendered from service.config.processing_steps

**Dependencies:**
- Sprint 2 API `/api/services/[slug]` (Complete)

---

### EPIC 2: Order Creation Flow

#### US-303: 6-Step Order Wizard Shell
**As a** customer
**I want to** navigate through a clear step-by-step order process
**So that** I can complete my order without confusion

**Story Points:** 5

**Acceptance Criteria:**
- [ ] Wizard at `/orders/new?service=[slug]`
- [ ] Progress indicator shows: 1.Contact → 2.Data → 3.Options → 4.KYC → 5.Delivery → 6.Payment
- [ ] Current step highlighted, completed steps checkmarked
- [ ] "Next" and "Back" navigation buttons
- [ ] Form state persisted in React Context across steps
- [ ] Browser back button navigates to previous step
- [ ] "Save Draft" functionality stores order in database with status='draft'
- [ ] Mobile-responsive stepper (vertical on small screens)
- [ ] Exit confirmation modal if form is dirty
- [ ] Order draft auto-saved every 30 seconds

**Technical Notes:**
- Use React Context for wizard state management
- URL state: `/orders/new?service=cazier-fiscal&step=2`
- Implement `useOrderWizard` hook
- Debounced auto-save with `/api/orders POST`

**Dependencies:**
- US-302 (Service Detail Page)
- Sprint 2 API `/api/orders POST` (Complete)

---

#### US-304: Step 1 - Contact Information
**As a** customer
**I want to** provide my contact details
**So that** eGhiseul can reach me about my order

**Story Points:** 2

**Acceptance Criteria:**
- [ ] Form fields: Email (pre-filled from auth), Phone, Preferred Contact Method
- [ ] Email validation (RFC 5322 compliant)
- [ ] Phone validation (Romanian format: +40 7XX XXX XXX)
- [ ] Phone input with country code selector (default: +40)
- [ ] Preferred contact: Radio buttons (Email / Phone / WhatsApp)
- [ ] All fields required with Zod validation
- [ ] Error messages displayed inline
- [ ] Form state saved to order context
- [ ] Auto-format phone number on blur
- [ ] "Next" button disabled until valid

**Technical Notes:**
- Use react-hook-form + Zod
- Phone validation: `^\\+40\\s?7[0-9]{2}\\s?[0-9]{3}\\s?[0-9]{3}$`
- Component: `/components/orders/steps/contact-step.tsx`

**Validation Schema:**
```typescript
const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+40\s?7[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}$/),
  preferred_contact: z.enum(['email', 'phone', 'whatsapp'])
});
```

**Dependencies:**
- US-303 (Wizard Shell)

---

#### US-305: Step 2 - Personal Data
**As a** customer
**I want to** provide my personal information
**So that** documents can be issued in my name

**Story Points:** 5

**Acceptance Criteria:**
- [ ] Dynamic form based on service.config.required_fields
- [ ] Standard fields: CNP, First Name, Last Name, Birth Date, Birth Place, Address
- [ ] Service-specific fields loaded from service configuration
- [ ] CNP validation: 13 digits, valid checksum algorithm
- [ ] CNP auto-populates birth date and gender
- [ ] Birth date: Date picker (must be 18+ years old)
- [ ] Address: Autocomplete with Romanian addresses (optional: Google Places API)
- [ ] All required fields marked with asterisk
- [ ] Field-level validation on blur
- [ ] Form-level validation before "Next"
- [ ] Data saved to order.customer_data.personal

**Technical Notes:**
- Implement CNP validation function: `lib/validations/cnp.ts`
- CNP checksum algorithm per Romanian standard
- Age validation: min 18 years
- Component: `/components/orders/steps/personal-data-step.tsx`

**CNP Validation Algorithm:**
```typescript
// Validate CNP format and checksum
// First digit: 1-8 (gender + century)
// Digits 2-7: Birth date YYMMDD
// Digits 8-9: County code
// Digits 10-12: Sequential number
// Digit 13: Checksum
```

**Dependencies:**
- US-303 (Wizard Shell)
- Service configuration loaded

---

#### US-306: Step 3 - Service Options Selection
**As a** customer
**I want to** select additional options for my order
**So that** I can customize the service to my needs

**Story Points:** 3

**Acceptance Criteria:**
- [ ] Display all service options from service_options table
- [ ] Options grouped: Processing Speed / Translations / Add-ons
- [ ] Each option shows: name, description, price, delivery impact
- [ ] Checkboxes for toggle options (urgenta, traducere, apostila)
- [ ] Quantity selector for multi-quantity options (copii_suplimentare)
- [ ] Real-time price calculation showing: Base + Options + Delivery = Total
- [ ] Price breakdown displayed in sidebar (sticky on desktop)
- [ ] Estimated delivery date updates based on urgenta selection
- [ ] "No thanks, continue with standard" option to skip
- [ ] Selected options saved to order.selected_options

**Technical Notes:**
- Options fetched with service details in US-302
- Price calculation client-side for real-time feedback
- Component: `/components/orders/steps/options-step.tsx`
- Helper: `lib/utils/calculate-order-price.ts`

**Price Calculation:**
```typescript
const total = basePrice +
  sum(selectedOptions.map(opt => opt.price * opt.quantity)) +
  deliveryPrice - discountAmount;
```

**Dependencies:**
- US-303 (Wizard Shell)
- Service options loaded from API

---

#### US-307: Step 4 - KYC Document Upload
**As a** customer
**I want to** upload my identity documents securely
**So that** my identity can be verified for the order

**Story Points:** 8 (Complex)

**Acceptance Criteria:**
- [ ] Three upload sections: ID Card Front, ID Card Back, Selfie with Document
- [ ] Drag-and-drop file upload with click-to-browse fallback
- [ ] Image preview after upload with crop/rotate tools
- [ ] Accepted formats: JPEG, PNG (max 10MB per file)
- [ ] Client-side image compression before upload (max 2MB after compression)
- [ ] Upload to AWS S3 via pre-signed URL from backend
- [ ] Upload progress indicator with percentage
- [ ] Retry mechanism on upload failure (3 attempts)
- [ ] Uploaded files stored at: `s3://eghiseul-documents/kyc/{user_id}/{order_id}/`
- [ ] File naming: `ci_front.jpg`, `ci_back.jpg`, `selfie.jpg`
- [ ] S3 URLs saved to order.kyc_documents JSONB
- [ ] Camera capture option on mobile devices
- [ ] Validation: Face visible in selfie, ID card clearly readable
- [ ] "Upload Guidelines" tooltip for each section

**Technical Notes:**
- S3 pre-signed URL endpoint: `/api/upload/presigned-url`
- Client-side compression: browser-image-compression library
- Image crop/rotate: react-easy-crop
- File upload: native fetch with progress tracking
- Component: `/components/orders/steps/kyc-upload-step.tsx`

**S3 Bucket Structure:**
```
eghiseul-documents/
  kyc/
    {user_id}/
      {order_id}/
        ci_front.jpg
        ci_back.jpg
        selfie.jpg
```

**Upload Flow:**
1. Request pre-signed URL from backend
2. Compress image client-side
3. Upload directly to S3 using pre-signed URL
4. Save S3 URL to order record
5. Trigger OCR processing (background job)

**Dependencies:**
- US-303 (Wizard Shell)
- AWS S3 configured (Sprint 0)
- `/api/upload/presigned-url` endpoint (New)

---

#### US-308: Step 5 - Electronic Signature
**As a** customer
**I want to** sign electronically using my mouse/finger
**So that** I can authorize the order digitally

**Story Points:** 3

**Acceptance Criteria:**
- [ ] Canvas component for signature capture
- [ ] Canvas size: 600x200px (responsive on mobile)
- [ ] "Clear" button to restart signature
- [ ] Signature preview below canvas
- [ ] Signature saved as base64 PNG data
- [ ] Minimum stroke detection (prevent empty signature)
- [ ] Touch support for mobile devices
- [ ] "Type your name" alternative option for accessibility
- [ ] Signature declaration text: "I confirm all information provided is accurate and authorize eGhiseul.ro to act on my behalf"
- [ ] Checkbox to accept terms before proceeding
- [ ] Signature data saved to order.kyc_documents.signature

**Technical Notes:**
- Use react-signature-canvas library
- Export as PNG base64: `canvas.toDataURL('image/png')`
- Store in database (< 50KB typical size)
- Component: `/components/orders/steps/signature-step.tsx`

**Signature Validation:**
- Minimum 10 stroke points
- Canvas must not be blank (checksum validation)

**Dependencies:**
- US-303 (Wizard Shell)

---

#### US-309: Step 6 - Delivery Method Selection
**As a** customer
**I want to** choose how I receive my documents
**So that** I get them in the most convenient way

**Story Points:** 3

**Acceptance Criteria:**
- [ ] Three delivery options: Email (Free), Registered Mail (+20 RON), Courier (+35 RON)
- [ ] Radio button selection with visual cards
- [ ] Email option: Documents sent as password-protected PDF
- [ ] Registered Mail: Requires full postal address (autocomplete)
- [ ] Courier: Requires address + phone confirmation
- [ ] Address validation for Romanian addresses
- [ ] Delivery price added to total
- [ ] Estimated delivery time shown for each method
- [ ] Selected method saved to order.delivery_method
- [ ] Delivery address saved to order.delivery_address (if applicable)
- [ ] Order summary sidebar updated with delivery cost

**Technical Notes:**
- Delivery options from service.config.delivery_methods
- Address validation: Romanian postal code format (6 digits)
- Component: `/components/orders/steps/delivery-step.tsx`

**Delivery Prices:**
- Email: 0 RON (default)
- Registered Mail: 20 RON (Posta Romana)
- Courier: 35 RON (Fan Courier)

**Dependencies:**
- US-303 (Wizard Shell)
- US-306 (Price calculation updated)

---

#### US-310: Order Review & Payment
**As a** customer
**I want to** review my order before payment
**So that** I can verify all details are correct

**Story Points:** 5

**Acceptance Criteria:**
- [ ] Full order summary page before payment
- [ ] Sections: Service Details, Personal Info, Selected Options, KYC Documents (thumbnails), Delivery Method
- [ ] "Edit" links for each section returning to that step
- [ ] Price breakdown table: Base + Options + Delivery - Discount = Total
- [ ] Terms & Conditions checkbox (required)
- [ ] Privacy Policy acknowledgment
- [ ] "Proceed to Payment" button creates Stripe payment intent
- [ ] Order status changes from 'draft' to 'pending'
- [ ] Order submitted_at timestamp recorded
- [ ] Redirect to Stripe Checkout
- [ ] Loading state during payment intent creation

**Technical Notes:**
- Use `/api/orders/[id]/payment POST` to create payment intent
- Order ID passed to Stripe metadata
- Success URL: `/orders/[id]/success`
- Cancel URL: `/orders/[id]?step=6`
- Component: `/components/orders/steps/review-payment-step.tsx`

**Order Submission Flow:**
1. Validate all steps completed
2. Update order status to 'pending'
3. Create Stripe payment intent
4. Redirect to Stripe Checkout
5. Stripe webhook updates order on payment success

**Dependencies:**
- US-303 to US-309 (All previous steps)
- Sprint 2 API `/api/orders/[id]/payment` (Complete)
- Stripe configured (Sprint 0)

---

### EPIC 3: OCR & Data Validation

#### US-311: AWS Textract Integration
**As a** system
**I want to** extract text from uploaded ID cards
**So that** customer data can be auto-verified

**Story Points:** 8 (Complex)

**Acceptance Criteria:**
- [ ] Backend endpoint `/api/ocr/extract` processes ID card images
- [ ] AWS Textract AnalyzeDocument API called with TABLES and FORMS features
- [ ] Extract fields: CNP, Name, Birth Date, Issue Date, Expiry Date, Document Number
- [ ] OCR confidence scores stored for each field (threshold: 90%)
- [ ] Low-confidence fields flagged for manual admin review
- [ ] Extracted data compared with user-entered data (US-305)
- [ ] Mismatch alerts shown to customer with option to correct
- [ ] OCR results saved to order.kyc_documents.ocr_data JSONB
- [ ] Processing time < 5 seconds per document
- [ ] Error handling for unclear/damaged documents
- [ ] Retry mechanism for transient AWS failures

**Technical Notes:**
- AWS Textract client: `@aws-sdk/client-textract`
- Method: `AnalyzeDocumentCommand` with FeatureTypes: ['TABLES', 'FORMS']
- Implementation: `/src/app/api/ocr/extract/route.ts`
- Helper: `/lib/ocr/textract-parser.ts`

**OCR Processing Flow:**
1. Order submitted with KYC documents uploaded
2. Background job triggered (Supabase Edge Function or Vercel Serverless)
3. Fetch images from S3
4. Send to AWS Textract
5. Parse response and extract structured data
6. Compare with user-entered data
7. Update order.kyc_documents.ocr_data
8. Flag for admin review if confidence < 90% or mismatch

**Field Extraction Map:**
```typescript
interface OCRResult {
  cnp: { value: string; confidence: number };
  name: { value: string; confidence: number };
  birth_date: { value: string; confidence: number };
  issue_date: { value: string; confidence: number };
  expiry_date: { value: string; confidence: number };
  document_number: { value: string; confidence: number };
  verified: boolean;
  mismatch_fields: string[];
}
```

**Dependencies:**
- US-307 (KYC Upload)
- AWS Textract configured (Sprint 0)
- S3 documents accessible

---

#### US-312: CNP Validation Against OCR
**As a** system
**I want to** validate user-entered CNP matches ID card
**So that** fraud is prevented

**Story Points:** 3

**Acceptance Criteria:**
- [ ] CNP extracted from ID card via OCR compared to user input
- [ ] If match: order.kyc_documents.ocr_data.verified = true
- [ ] If mismatch: customer shown warning modal with both values
- [ ] Customer can correct mistake or confirm OCR error
- [ ] Admin notification created for all mismatches
- [ ] Validation includes checksum verification for both values
- [ ] Fuzzy matching for OCR errors (e.g., 1/I, 0/O confusion)
- [ ] Birth date derived from CNP compared to user-entered birth date
- [ ] Mismatch threshold: 0 tolerance (must match exactly or manual review)

**Technical Notes:**
- Implement in OCR processing pipeline (US-311)
- Fuzzy match library: Levenshtein distance < 2
- Component: `/components/orders/cnp-validation-modal.tsx`

**Validation Logic:**
```typescript
function validateCNP(userCNP: string, ocrCNP: string): ValidationResult {
  // Exact match
  if (userCNP === ocrCNP) return { valid: true };

  // Fuzzy match for OCR errors
  if (levenshtein(userCNP, ocrCNP) <= 1) {
    return { valid: true, corrected: ocrCNP, requiresReview: true };
  }

  // Mismatch
  return { valid: false, requiresAdminReview: true };
}
```

**Dependencies:**
- US-311 (OCR Integration)
- US-305 (Personal Data Input)

---

### EPIC 4: User Dashboard

#### US-313: User Orders Dashboard
**As a** customer
**I want to** view all my orders in one place
**So that** I can track their progress

**Story Points:** 5

**Acceptance Criteria:**
- [ ] Dashboard page at `/account/orders`
- [ ] List all orders for authenticated user (newest first)
- [ ] Each order card shows: Order Number, Service Name, Status, Date, Total Price
- [ ] Status badge with color coding (pending=yellow, processing=blue, completed=green, etc.)
- [ ] Filter by status: All / Pending / Processing / Completed / Cancelled
- [ ] Search by order number or service name
- [ ] Pagination: 10 orders per page
- [ ] "View Details" link to order detail page
- [ ] Empty state if no orders: "You haven't placed any orders yet" + CTA to browse services
- [ ] Loading skeleton during data fetch
- [ ] Data fetched from `/api/orders GET`

**Technical Notes:**
- Use @tanstack/react-query with infinite scroll (optional)
- Component: `/src/app/(customer)/account/orders/page.tsx`
- Filter implementation: URL query params `?status=pending`

**Status Badge Colors:**
- draft: gray
- pending: yellow
- processing: blue
- kyc_pending: orange
- kyc_approved: green
- kyc_rejected: red
- in_progress: blue
- completed: green
- cancelled: gray
- refunded: purple

**Dependencies:**
- Sprint 2 API `/api/orders GET` (Complete)
- Sprint 1 Auth (Complete)

---

#### US-314: Order Detail Page
**As a** customer
**I want to** view detailed information about a specific order
**So that** I can see its current status and next steps

**Story Points:** 5

**Acceptance Criteria:**
- [ ] Order detail page at `/account/orders/[id]`
- [ ] Header: Order Number, Status Badge, Service Name
- [ ] Progress timeline showing order lifecycle stages
- [ ] Current stage highlighted with checkmarks for completed stages
- [ ] Customer data displayed (redacted CNP: 1******3456)
- [ ] Selected options listed with prices
- [ ] KYC documents section: thumbnails with "View" links (if uploaded)
- [ ] Delivery information: Method, Address (if applicable), Tracking Number
- [ ] Price breakdown table
- [ ] Payment status and method
- [ ] Estimated completion date and actual completion date
- [ ] Download buttons: Contract (if signed), Final Document (if available), Invoice (if issued)
- [ ] "Need Help?" section with support contact
- [ ] Action buttons based on status: "Upload KYC" (if kyc_pending), "Download Document" (if completed)
- [ ] Order history timeline showing all status changes with timestamps

**Technical Notes:**
- Data fetched from `/api/orders/[id] GET`
- Component: `/src/app/(customer)/account/orders/[id]/page.tsx`
- Timeline component: `/components/orders/order-timeline.tsx`

**Progress Timeline Stages:**
1. Order Placed
2. Payment Received
3. KYC Verification
4. Processing
5. Document Ready
6. Shipped/Delivered

**Dependencies:**
- Sprint 2 API `/api/orders/[id] GET` (Complete)
- US-313 (Orders Dashboard)

---

#### US-315: Re-upload KYC Documents
**As a** customer
**I want to** re-upload KYC documents if rejected
**So that** my order can proceed after correction

**Story Points:** 3

**Acceptance Criteria:**
- [ ] "Re-upload Documents" button visible when order status = 'kyc_rejected'
- [ ] Shows admin rejection reason prominently
- [ ] Opens same KYC upload component from US-307
- [ ] Pre-fills with previously uploaded documents (viewable but replaceable)
- [ ] Submit button creates new entry in order_history
- [ ] Order status changes from 'kyc_rejected' to 'kyc_pending'
- [ ] Admin notified of re-submission
- [ ] Previous rejected documents retained in order history for audit
- [ ] "Rejection Reason" displayed above upload sections
- [ ] Max 3 re-upload attempts before manual intervention required

**Technical Notes:**
- Reuse component from US-307
- API: `PATCH /api/orders/[id]` to update status and documents
- Component: `/components/orders/kyc-reupload.tsx`

**Dependencies:**
- US-307 (KYC Upload)
- US-314 (Order Detail Page)

---

### EPIC 5: Infrastructure & API

#### US-316: S3 Pre-signed URL Endpoint
**As a** backend system
**I want to** generate pre-signed S3 URLs for secure uploads
**So that** clients can upload directly without exposing AWS credentials

**Story Points:** 3

**Acceptance Criteria:**
- [ ] POST endpoint `/api/upload/presigned-url`
- [ ] Requires authentication
- [ ] Request body: `{ order_id, file_type: 'ci_front' | 'ci_back' | 'selfie' }`
- [ ] Validates user owns the order
- [ ] Generates S3 pre-signed URL valid for 5 minutes
- [ ] S3 key format: `kyc/{user_id}/{order_id}/{file_type}.jpg`
- [ ] Enforces file size limit: 10MB
- [ ] Returns: `{ upload_url, file_url }`
- [ ] Server-side encryption enabled (AES-256)
- [ ] CORS headers configured for S3 bucket

**Technical Notes:**
- Use @aws-sdk/s3-request-presigner
- Method: `getSignedUrl(new PutObjectCommand({...}))`
- Expiration: 300 seconds
- Implementation: `/src/app/api/upload/presigned-url/route.ts`

**Request Example:**
```typescript
POST /api/upload/presigned-url
{
  "order_id": "uuid",
  "file_type": "ci_front"
}
```

**Response Example:**
```typescript
{
  "upload_url": "https://eghiseul-documents.s3.eu-central-1.amazonaws.com/kyc/...",
  "file_url": "https://eghiseul-documents.s3.eu-central-1.amazonaws.com/kyc/...",
  "expires_in": 300
}
```

**Dependencies:**
- AWS S3 configured (Sprint 0)
- Sprint 2 orders table (Complete)

---

#### US-317: S3 Document Retrieval Endpoint
**As a** backend system
**I want to** retrieve uploaded documents securely
**So that** only authorized users can view KYC documents

**Story Points:** 2

**Acceptance Criteria:**
- [ ] GET endpoint `/api/orders/[id]/documents/[file_type]`
- [ ] Requires authentication
- [ ] Validates user owns the order OR user is admin
- [ ] Generates temporary pre-signed URL for viewing (expires in 60 seconds)
- [ ] Returns pre-signed URL for S3 object
- [ ] Supports file_types: ci_front, ci_back, selfie
- [ ] Rate limited: 10 requests per minute per user
- [ ] Logs all document access in order_history
- [ ] Returns 404 if document doesn't exist
- [ ] Returns 403 if unauthorized

**Technical Notes:**
- Use @aws-sdk/s3-request-presigner
- Method: `getSignedUrl(new GetObjectCommand({...}))`
- Implementation: `/src/app/api/orders/[id]/documents/[file_type]/route.ts`

**Response Example:**
```typescript
{
  "url": "https://eghiseul-documents.s3.eu-central-1.amazonaws.com/kyc/...?X-Amz-Signature=...",
  "expires_in": 60
}
```

**Dependencies:**
- US-316 (Upload endpoint)
- Sprint 2 orders API (Complete)

---

#### US-318: OCR Processing Background Job
**As a** system
**I want to** process OCR asynchronously after KYC upload
**So that** users don't wait for Textract processing

**Story Points:** 5

**Acceptance Criteria:**
- [ ] Background job triggered after KYC documents uploaded
- [ ] Implements retry logic (3 attempts with exponential backoff)
- [ ] Processing timeout: 30 seconds per document
- [ ] Updates order.kyc_documents.ocr_data on completion
- [ ] Order status remains 'kyc_pending' during processing
- [ ] Admin notification if OCR fails after retries
- [ ] Job status trackable in order_history
- [ ] Graceful degradation: Manual admin review if OCR unavailable

**Technical Notes:**
- Implementation: Supabase Edge Function or Vercel Serverless Function
- Trigger: Database trigger on order status change to 'kyc_pending'
- Alternative: Polling job from frontend every 5s
- Error handling: Log to Sentry/error tracking service

**Job Flow:**
1. Order status changed to 'kyc_pending'
2. Edge function triggered via webhook
3. Fetch documents from S3
4. Call AWS Textract (US-311)
5. Parse and validate results (US-312)
6. Update order record
7. Log completion in order_history

**Dependencies:**
- US-311 (Textract Integration)
- US-307 (KYC Upload)

---

## Task Breakdown & Story Points

### By Epic

| Epic | Story Points | Complexity |
|------|--------------|------------|
| EPIC 1: Service Catalog | 8 | Low-Medium |
| EPIC 2: Order Creation | 34 | High |
| EPIC 3: OCR & Validation | 11 | High |
| EPIC 4: User Dashboard | 13 | Medium |
| EPIC 5: Infrastructure | 10 | Medium |
| **TOTAL** | **76** | **High** |

### Prioritized Task List

**Week 1: Foundation (Days 1-5)**

| Priority | Task | Points | Assignee | Dependencies |
|----------|------|--------|----------|--------------|
| P0 | US-301: Service Catalog Homepage | 5 | Frontend Dev | Sprint 2 API |
| P0 | US-302: Service Detail Page | 3 | Frontend Dev | US-301 |
| P0 | US-316: S3 Pre-signed URL Endpoint | 3 | Backend Dev | AWS config |
| P1 | US-303: Order Wizard Shell | 5 | Frontend Dev | US-302 |
| P1 | US-304: Contact Information Step | 2 | Frontend Dev | US-303 |
| P1 | US-305: Personal Data Step | 5 | Frontend Dev | US-303 |
| P2 | US-306: Options Selection Step | 3 | Frontend Dev | US-303 |
| P2 | US-313: Orders Dashboard | 5 | Frontend Dev | Sprint 2 API |

**Week 2: KYC & Integration (Days 6-10)**

| Priority | Task | Points | Assignee | Dependencies |
|----------|------|--------|----------|--------------|
| P0 | US-307: KYC Document Upload | 8 | Frontend + Backend | US-316 |
| P0 | US-311: AWS Textract Integration | 8 | Backend Dev | US-307 |
| P1 | US-308: Electronic Signature | 3 | Frontend Dev | US-303 |
| P1 | US-309: Delivery Method Selection | 3 | Frontend Dev | US-303 |
| P1 | US-310: Order Review & Payment | 5 | Frontend Dev | US-303-309 |
| P1 | US-312: CNP Validation | 3 | Backend Dev | US-311 |
| P2 | US-314: Order Detail Page | 5 | Frontend Dev | US-313 |
| P2 | US-317: Document Retrieval Endpoint | 2 | Backend Dev | US-316 |
| P2 | US-315: Re-upload KYC | 3 | Frontend Dev | US-307, US-314 |
| P3 | US-318: OCR Background Job | 5 | Backend Dev | US-311 |

---

## Dependencies & Risks

### External Dependencies

| Dependency | Type | Status | Risk Level | Mitigation |
|------------|------|--------|------------|------------|
| AWS S3 | Storage | Configured | LOW | Already configured in Sprint 0 |
| AWS Textract | OCR | Configured | MEDIUM | Test accuracy with sample IDs; fallback to manual review |
| Stripe | Payment | Configured | LOW | Already integrated in Sprint 2 |
| React Query | Library | Installed | LOW | Well-documented, stable library |
| Signature Canvas | Library | To Install | LOW | Lightweight, no known issues |

### Technical Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| OCR accuracy < 95% for Romanian IDs | HIGH | MEDIUM | Manual admin review for low confidence; collect sample IDs for testing |
| S3 upload failures on slow connections | MEDIUM | MEDIUM | Implement retry logic + chunked upload for large files |
| Mobile camera quality insufficient | MEDIUM | LOW | Provide upload guidelines; allow multiple attempts |
| Wizard state loss on browser refresh | MEDIUM | MEDIUM | Auto-save draft every 30s; warn before exit |
| Textract processing time > 10s | LOW | LOW | Async processing + status polling |
| CNP validation false negatives | HIGH | LOW | Fuzzy matching for OCR errors; admin override |

### Cross-Team Dependencies

| Team/Role | Dependency | Required By | Status |
|-----------|------------|-------------|--------|
| UX Designer | Wizard flow mockups | Day 1 | To Request |
| UX Designer | Mobile-responsive upload UI | Day 3 | To Request |
| System Architect | S3 bucket security review | Day 2 | To Request |
| Legal/Compliance | KYC requirements validation | Day 1 | To Request |
| DevOps | AWS Textract IAM permissions | Day 5 | To Request |
| QA | Sample Romanian ID cards for testing | Day 4 | To Request |

---

## Definition of Done

### Story-Level DoD

- [ ] Code complete and peer-reviewed
- [ ] Unit tests written (>80% coverage for business logic)
- [ ] Integration tests for API endpoints
- [ ] Manual QA on desktop (Chrome, Safari, Firefox)
- [ ] Manual QA on mobile (iOS Safari, Android Chrome)
- [ ] Accessibility audit (WCAG 2.1 Level AA)
- [ ] Error states tested and handled
- [ ] Loading states implemented
- [ ] Documentation updated (API docs, inline comments)
- [ ] No console errors or warnings
- [ ] Security review (input validation, XSS, CSRF)

### Sprint-Level DoD

- [ ] All P0 and P1 user stories completed
- [ ] End-to-end order flow tested: Browse → Order → KYC → Payment → Dashboard
- [ ] OCR accuracy validated with 20+ real Romanian ID cards (target: 95%+)
- [ ] Performance benchmarks met:
  - Homepage load: < 2s (3G)
  - Order wizard step transition: < 200ms
  - S3 upload: < 5s (10MB image on 4G)
  - Textract processing: < 10s
- [ ] Mobile responsiveness verified on iPhone 12, Samsung Galaxy S21
- [ ] GDPR compliance verified:
  - KYC documents encrypted at rest (S3 SSE)
  - No PII in browser console/network logs
  - Pre-signed URLs expire correctly
- [ ] User acceptance testing with 3 beta testers
- [ ] Production deployment successful to Vercel
- [ ] Monitoring dashboards configured (Vercel Analytics)
- [ ] Rollback plan documented and tested

---

## Sprint Backlog (Organized by Priority)

### Must Have (P0) - 24 Points

These are critical for the sprint goal and must be completed.

1. **US-301: Service Catalog Homepage** (5 pts)
   - Display featured services
   - Enable service discovery

2. **US-302: Service Detail Page** (3 pts)
   - Service information
   - Order CTA

3. **US-303: Order Wizard Shell** (5 pts)
   - Navigation framework
   - State management

4. **US-307: KYC Document Upload** (8 pts)
   - ID card upload
   - Selfie capture
   - S3 integration

5. **US-316: S3 Pre-signed URL Endpoint** (3 pts)
   - Secure upload mechanism

### Should Have (P1) - 31 Points

These are important for a complete feature but can be partially deferred.

6. **US-304: Contact Information** (2 pts)
7. **US-305: Personal Data** (5 pts)
8. **US-306: Options Selection** (3 pts)
9. **US-308: Electronic Signature** (3 pts)
10. **US-309: Delivery Method** (3 pts)
11. **US-310: Review & Payment** (5 pts)
12. **US-311: AWS Textract Integration** (8 pts)
13. **US-312: CNP Validation** (3 pts)

### Could Have (P2) - 15 Points

These add value but are not critical for MVP.

14. **US-313: Orders Dashboard** (5 pts)
15. **US-314: Order Detail Page** (5 pts)
16. **US-315: Re-upload KYC** (3 pts)
17. **US-317: Document Retrieval** (2 pts)

### Won't Have This Sprint (P3) - 5 Points

These are deferred to Sprint 4.

18. **US-318: OCR Background Job** (5 pts)
    - Can be implemented synchronously for MVP
    - Async processing improves UX but not critical

### Velocity Adjustment

**Target Velocity:** 47 story points (based on 2-week sprint, 2 developers)
**Sprint 3 Backlog:** 76 total points

**Recommended Scope:**
- P0 (Must Have): 24 points - ALL
- P1 (Should Have): 23 points - PARTIAL (skip US-311, US-312 or implement basic version)
- P2 (Could Have): 0 points - DEFER

**Realistic Sprint 3 Delivery:** 47 points
- Complete order wizard (US-303 to US-310)
- Service catalog (US-301, US-302)
- KYC upload to S3 (US-307, US-316)
- Basic orders dashboard (US-313)

**Deferred to Sprint 4:**
- OCR integration (US-311, US-312, US-318) - Can launch with manual admin verification
- Advanced dashboard features (US-314, US-315, US-317)

---

## Daily Standup Format

### Questions

1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers or impediments?
4. Any risks to sprint goal?

### Sprint Progress Metrics

Track daily:
- **Story points completed** (burndown chart)
- **Stories in progress** (WIP limit: 3 per developer)
- **Impediments count** (target: resolve within 24h)
- **Velocity trend** (compare to Sprint 1, Sprint 2)

### Blocker Categories

- **Technical:** Code issues, bugs, architecture decisions
- **External:** AWS, Stripe, third-party APIs
- **Team:** Waiting for code review, design, QA
- **Scope:** Unclear requirements, changing priorities

---

## Sprint Ceremonies

### Sprint Planning (Day 0 - 4 hours)

**Part 1: Goal Setting (2h)**
- Review Sprint 2 accomplishments
- Present Sprint 3 objectives and scope
- Confirm team capacity (vacation, holidays, other commitments)
- Finalize sprint goal and success criteria

**Part 2: Task Breakdown (2h)**
- Walk through each user story
- Estimate story points (Planning Poker)
- Identify dependencies and risks
- Assign initial ownership
- Create sub-tasks in project management tool

**Attendees:** Dev Team, Product Manager, Scrum Master

---

### Daily Standup (15 minutes)

**Time:** 10:00 AM daily
**Format:** Round-robin (each developer)
**Tool:** Zoom/Google Meet (remote) or in-person

**Focus:**
- Progress toward sprint goal
- Blockers requiring immediate attention
- Coordination between team members

---

### Sprint Review (Day 10 - 2 hours)

**Demo Agenda:**
1. Service catalog browsing (US-301, US-302)
2. Complete order wizard walkthrough (US-303 to US-310)
3. KYC document upload demo (US-307)
4. Orders dashboard (US-313)
5. Mobile responsiveness showcase
6. Performance metrics review

**Attendees:** Dev Team, Product Manager, Stakeholders, UX Designer

**Feedback Collection:**
- What worked well?
- What needs improvement?
- Any missing features for MVP launch?

---

### Sprint Retrospective (Day 10 - 1.5 hours)

**Format:** Start-Stop-Continue

**Topics:**
1. Technical challenges (OCR, S3 uploads, wizard state)
2. Team collaboration effectiveness
3. Process improvements (code review, testing)
4. Tooling and infrastructure
5. Action items for Sprint 4

**Attendees:** Dev Team, Scrum Master

**Action Items:**
- Assign owners
- Set deadlines
- Track in backlog

---

## Success Metrics & KPIs

### Sprint Completion Metrics

- **Velocity:** Target 47 story points
- **Completed stories:** Target 100% of P0, 75% of P1
- **Sprint goal achieved:** Yes/No
- **Code coverage:** > 80% for new code
- **Bugs introduced:** < 5 P1/P2 bugs

### Quality Metrics

- **OCR accuracy:** > 95% for CNP extraction
- **Upload success rate:** > 99%
- **Order completion rate:** > 90% (users who start finish)
- **Mobile usability score:** > 85% (System Usability Scale)
- **Accessibility score:** WCAG AA compliance

### Performance Metrics

- **Homepage load time:** < 2s (3G)
- **Wizard step transition:** < 200ms
- **S3 upload time:** < 5s (10MB, 4G)
- **Textract processing:** < 10s
- **API response time (p95):** < 500ms

### User Experience Metrics

- **Order wizard abandonment:** < 20%
- **KYC re-upload rate:** < 10%
- **Time to complete order:** < 5 minutes (average)
- **Customer support tickets:** < 5% of orders

---

## Impediment Tracking

### Current Impediments

| ID | Description | Impact | Owner | Status | ETA |
|----|-------------|--------|-------|--------|-----|
| - | None yet | - | - | - | - |

### Impediment Resolution Process

1. **Identify:** Raised in daily standup or async
2. **Log:** Add to impediments table (above)
3. **Assign:** Scrum Master or team member takes ownership
4. **Resolve:** Target < 48h resolution
5. **Verify:** Confirm blocker removed
6. **Close:** Update status and document resolution

### Escalation Path

- **Level 1:** Scrum Master (technical, team coordination)
- **Level 2:** Product Manager (scope, priorities)
- **Level 3:** CTO/Engineering Lead (architecture, external dependencies)

---

## Cross-Functional Collaboration

### Roles Needed for Sprint 3

| Role | Responsibilities | Time Commitment |
|------|-----------------|-----------------|
| **Frontend Developer (2x)** | React components, wizard flow, mobile UI | Full-time (100%) |
| **Backend Developer (1x)** | API endpoints, S3 integration, OCR | Full-time (100%) |
| **UX Designer** | Wizard mockups, mobile layouts, upload guidelines | 30% (3 days) |
| **QA Engineer** | Manual testing, bug verification, UAT | 50% (5 days) |
| **DevOps Engineer** | AWS permissions, S3 config, deployment | 20% (2 days) |
| **Product Manager** | Requirements clarification, priority decisions | 40% (4 days) |
| **Scrum Master** | Facilitation, impediment removal, metrics | 30% (3 days) |

### Communication Channels

- **Daily Standup:** Zoom (10:00 AM)
- **Code Reviews:** GitHub Pull Requests
- **Questions:** Slack #eghiseul-dev
- **Documentation:** Notion or Confluence
- **Bug Tracking:** GitHub Issues
- **Design:** Figma (shared link)

---

## Testing Strategy

### Test Pyramid

**Unit Tests (70%)**
- Zod validation schemas
- CNP validation algorithm
- Price calculation logic
- OCR parsing functions
- File upload utilities

**Integration Tests (20%)**
- API endpoints with Supabase
- S3 upload/download flows
- Stripe payment intent creation
- OCR end-to-end flow

**E2E Tests (10%)**
- Complete order wizard flow
- KYC upload and validation
- Orders dashboard navigation
- Mobile responsiveness

### Test Environments

- **Local:** Developer machines
- **Staging:** Vercel preview deployments
- **Production:** eghiseul.ro (after Sprint 6)

### Test Data

- **Sample Romanian IDs:** 20 images (provided by QA or mock)
- **Test users:** 5 accounts with various states
- **Test orders:** Draft, Pending, Completed states
- **Edge cases:** Missing data, expired IDs, low-quality images

---

## Documentation Updates

### Required Documentation

- [ ] `/docs/technical/api/kyc-upload-api.md` - S3 upload endpoints
- [ ] `/docs/technical/ocr-integration.md` - Textract setup and usage
- [ ] `/docs/user-guides/order-creation.md` - Customer-facing guide
- [ ] `/docs/technical/wizard-architecture.md` - State management approach
- [ ] Update `/DEVELOPMENT_MASTER_PLAN.md` - Sprint 3 status
- [ ] Update `/README.md` - New features available

### Code Documentation

- Inline comments for complex logic (CNP validation, OCR parsing)
- JSDoc for public functions and components
- README for new directories (`/components/orders/`, `/lib/ocr/`)

---

## Rollout Plan

### Sprint 3 Deliverables

**End of Week 1:**
- Service catalog live (US-301, US-302)
- Order wizard shell functional (US-303)
- Contact and personal data steps complete (US-304, US-305)

**End of Week 2:**
- Complete order wizard (US-303 to US-310)
- KYC upload to S3 (US-307, US-316)
- Orders dashboard (US-313)
- Basic order detail page (US-314)

### Feature Flags

Use feature flags for gradual rollout:
- `FEATURE_ORDER_WIZARD_ENABLED` - Toggle wizard availability
- `FEATURE_KYC_UPLOAD_ENABLED` - Toggle KYC upload (test S3 first)
- `FEATURE_OCR_ENABLED` - Toggle Textract (fallback: manual review)

### Rollback Strategy

If critical bugs found in production:
1. Disable feature flag
2. Revert to Sprint 2 state (API-only)
3. Fix bugs in hotfix branch
4. Redeploy with fix

---

## Sprint 3 Retrospective Questions

### What Went Well?

- (To be filled during retro)

### What Didn't Go Well?

- (To be filled during retro)

### What Should We Improve?

- (To be filled during retro)

### Action Items for Sprint 4

- (To be filled during retro)

---

## Appendix

### Glossary

- **CNP:** Cod Numeric Personal (Romanian National ID Number)
- **KYC:** Know Your Customer (identity verification)
- **OCR:** Optical Character Recognition (text extraction from images)
- **S3:** Amazon Simple Storage Service
- **Textract:** AWS OCR service for document analysis
- **RLS:** Row Level Security (Supabase database security)
- **Pre-signed URL:** Temporary URL for secure S3 access

### Related Documents

- [Sprint 0: Project Setup](/Users/raullutas/eghiseul.ro/docs/sprints/sprint-0-setup.md)
- [Sprint 1: Authentication](/Users/raullutas/eghiseul.ro/docs/sprints/sprint-1-auth.md)
- [Sprint 2: Services Core](/Users/raullutas/eghiseul.ro/docs/sprints/sprint-2-services.md)
- [Development Master Plan](/Users/raullutas/eghiseul.ro/DEVELOPMENT_MASTER_PLAN.md)
- [Security Architecture](/Users/raullutas/eghiseul.ro/docs/security/security-architecture.md)

### Sample Code Snippets

**CNP Validation Example:**
```typescript
// /lib/validations/cnp.ts
export function validateCNP(cnp: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Length check
  if (cnp.length !== 13) {
    errors.push('CNP must be exactly 13 digits');
    return { valid: false, errors };
  }

  // Numeric check
  if (!/^\d{13}$/.test(cnp)) {
    errors.push('CNP must contain only digits');
    return { valid: false, errors };
  }

  // Gender + century check (first digit)
  const firstDigit = parseInt(cnp[0]);
  if (firstDigit < 1 || firstDigit > 8) {
    errors.push('Invalid CNP: first digit must be 1-8');
    return { valid: false, errors };
  }

  // Extract birth date
  const year = parseInt(cnp.substring(1, 3));
  const month = parseInt(cnp.substring(3, 5));
  const day = parseInt(cnp.substring(5, 7));

  // Month validation
  if (month < 1 || month > 12) {
    errors.push('Invalid month in CNP');
    return { valid: false, errors };
  }

  // Day validation
  if (day < 1 || day > 31) {
    errors.push('Invalid day in CNP');
    return { valid: false, errors };
  }

  // Checksum validation (Luhn-like algorithm)
  const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp[i]) * weights[i];
  }
  const checksum = sum % 11 === 10 ? 1 : sum % 11;

  if (checksum !== parseInt(cnp[12])) {
    errors.push('Invalid CNP checksum');
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}
```

**Order Wizard Context Example:**
```typescript
// /contexts/order-wizard-context.tsx
interface OrderWizardState {
  currentStep: number;
  serviceId: string;
  contactData: ContactData;
  personalData: PersonalData;
  selectedOptions: SelectedOptions;
  kycDocuments: KYCDocuments;
  signature: string | null;
  deliveryMethod: DeliveryMethod;
  orderId: string | null;
}

export const OrderWizardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderWizardReducer, initialState);

  const nextStep = () => dispatch({ type: 'NEXT_STEP' });
  const prevStep = () => dispatch({ type: 'PREV_STEP' });
  const updateContactData = (data) => dispatch({ type: 'UPDATE_CONTACT', payload: data });
  const saveDraft = async () => {
    // Auto-save to database
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ ...state, status: 'draft' })
    });
  };

  return (
    <OrderWizardContext.Provider value={{ state, nextStep, prevStep, updateContactData, saveDraft }}>
      {children}
    </OrderWizardContext.Provider>
  );
};
```

---

**Document Status:** Ready for Sprint Planning
**Last Updated:** 2025-12-16
**Owner:** Scrum Master
**Reviewers:** Product Manager, Tech Lead, UX Designer

---

## Quick Reference Card

### Sprint 3 at a Glance

**Goal:** Complete order creation flow with KYC verification

**Duration:** 2 weeks (10 working days)

**Team:** 2 Frontend + 1 Backend + 0.3 UX + 0.5 QA

**Scope:** 47 story points (P0 + partial P1)

**Key Features:**
1. Service catalog browsing
2. 6-step order wizard
3. KYC document upload to S3
4. Electronic signature
5. Orders dashboard

**Critical Paths:**
- US-301 → US-302 → US-303 (Wizard foundation)
- US-316 → US-307 (S3 upload)
- US-303 → US-304...310 (Wizard steps)

**Success Criteria:**
- Customer can complete order end-to-end
- KYC documents upload successfully to S3
- Orders visible in dashboard
- Mobile responsive
- < 5 min order completion time

**Daily Standup:** 10:00 AM
**Sprint Review:** Day 10, 2:00 PM
**Sprint Retro:** Day 10, 4:00 PM
