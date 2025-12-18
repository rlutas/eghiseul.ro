# eGhiseul.ro - Comprehensive Test Plan

**Version:** 1.0
**Date:** 2025-12-18
**Status:** Active

## Table of Contents

1. [Overview](#overview)
2. [Test Categories](#test-categories)
3. [Authentication Testing](#authentication-testing)
4. [API Endpoint Testing](#api-endpoint-testing)
5. [Security Testing](#security-testing)
6. [Integration Testing](#integration-testing)
7. [Manual Testing Checklists](#manual-testing-checklists)
8. [Automated Testing](#automated-testing)
9. [Performance Testing](#performance-testing)
10. [Test Data](#test-data)

---

## Overview

### Test Objectives

- Verify all authentication flows work correctly
- Validate API endpoints return expected responses
- Ensure security features (rate limiting, PII encryption, audit logging) function properly
- Confirm proper error handling and validation
- Test integration points (Supabase, Stripe, Google AI)

### Testing Environment

```bash
Local:       http://localhost:3000
Development: [TBD]
Production:  https://eghiseul.ro
```

### Prerequisites

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# Edit .env.local with actual credentials

# 3. Run Supabase locally or configure remote instance
npx supabase start

# 4. Run database migrations
npm run db:migrate

# 5. Start development server
npm run dev

# 6. Install testing tools
brew install jq  # JSON processor (macOS)
```

---

## Test Categories

### 1. Authentication Tests (AUTH)
- User registration
- User login
- Password reset
- Session management
- Protected routes

### 2. API Tests (API)
- Services API
- Orders API
- OCR API
- KYC API
- Webhook handlers

### 3. Security Tests (SEC)
- Rate limiting
- PII encryption
- Audit logging
- Origin validation
- Input validation

### 4. Integration Tests (INT)
- Supabase authentication
- Stripe payments
- Google Gemini AI OCR
- Email notifications
- Database transactions

### 5. UI/UX Tests (UI)
- Page rendering
- Form validation
- Error messages
- Navigation
- Responsive design

---

## Authentication Testing

### Test Suite: AUTH-001 - User Registration

#### Test Case: AUTH-001-01 - Successful Registration

**Preconditions:** None
**Priority:** High

**Steps:**
1. Navigate to `/register`
2. Fill in email: `testuser@example.com`
3. Fill in password: `SecurePass123!`
4. Click "Create Account"

**Expected Result:**
- User is created in Supabase
- Confirmation email is sent
- Redirect to `/account` page
- Success message displayed

**Test Data:**
```json
{
  "email": "testuser@example.com",
  "password": "SecurePass123!"
}
```

**Validation:**
```bash
# Check Supabase for new user
# Verify email was sent
# Confirm redirect occurred
```

#### Test Case: AUTH-001-02 - Registration with Existing Email

**Preconditions:** User already exists
**Priority:** High

**Steps:**
1. Navigate to `/register`
2. Use existing email
3. Submit form

**Expected Result:**
- Error message: "Email already registered"
- Status code: 400
- User stays on registration page

#### Test Case: AUTH-001-03 - Registration with Invalid Email

**Priority:** Medium

**Test Cases:**
| Input | Expected Result |
|-------|----------------|
| `notanemail` | "Invalid email format" |
| `test@` | "Invalid email format" |
| `@example.com` | "Invalid email format" |
| `` | "Email is required" |

#### Test Case: AUTH-001-04 - Registration with Weak Password

**Priority:** Medium

**Test Cases:**
| Password | Expected Result |
|----------|----------------|
| `12345` | "Password must be at least 8 characters" |
| `password` | "Password must contain numbers and symbols" |
| `` | "Password is required" |

### Test Suite: AUTH-002 - User Login

#### Test Case: AUTH-002-01 - Successful Login

**Preconditions:** User exists
**Priority:** Critical

**Steps:**
1. Navigate to `/login`
2. Enter valid credentials
3. Click "Sign In"

**Expected Result:**
- Session created
- Redirect to `/account`
- User info displayed

**Manual Test:**
```bash
# 1. Open browser to http://localhost:3000/login
# 2. Enter credentials
# 3. Verify redirect and session cookie
```

#### Test Case: AUTH-002-02 - Login with Invalid Credentials

**Priority:** High

**Test Data:**
```json
{
  "email": "test@example.com",
  "password": "WrongPassword123!"
}
```

**Expected Result:**
- Error: "Invalid email or password"
- Status: 401
- No session created

#### Test Case: AUTH-002-03 - Login Rate Limiting

**Priority:** High

**Steps:**
1. Attempt login with wrong password 10 times
2. Check for rate limit error

**Expected Result:**
- After 5 failed attempts: "Too many failed login attempts"
- Temporary account lock (5 minutes)
- Audit log entry created

### Test Suite: AUTH-003 - Password Reset

#### Test Case: AUTH-003-01 - Request Password Reset

**Priority:** High

**Steps:**
1. Navigate to `/forgot-password`
2. Enter email
3. Submit form

**Expected Result:**
- Reset email sent
- Success message displayed
- Email contains reset link

**Validation:**
```bash
# Check email inbox for reset link
# Verify link format: /reset-password?token=xxx
# Confirm token expires in 1 hour
```

#### Test Case: AUTH-003-02 - Complete Password Reset

**Priority:** High

**Steps:**
1. Click reset link from email
2. Enter new password
3. Submit form

**Expected Result:**
- Password updated in database
- Success message shown
- Redirect to login page

### Test Suite: AUTH-004 - Protected Routes

#### Test Case: AUTH-004-01 - Access Protected Page Without Auth

**Priority:** Critical

**Test Routes:**
- `/account`
- `/orders`
- `/orders/[id]`

**Expected Result:**
- Redirect to `/login`
- Return URL preserved
- Error message: "Please sign in to continue"

**Manual Test:**
```bash
# Open incognito window
curl http://localhost:3000/account
# Expect 302 redirect to /login
```

#### Test Case: AUTH-004-02 - Access Protected Page With Auth

**Priority:** Critical

**Preconditions:** User is logged in

**Expected Result:**
- Page loads successfully
- User data displayed
- No redirect occurs

---

## API Endpoint Testing

### Test Suite: API-001 - Services API

#### Test Case: API-001-01 - GET /api/services (List All)

**Priority:** Critical
**Authentication:** None required

**Request:**
```bash
curl -X GET "http://localhost:3000/api/services" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "slug": "cazier-fiscal",
        "name": "Cazier Fiscal",
        "category": "fiscale",
        "basePrice": 149.00,
        "currency": "RON",
        "isActive": true,
        "isFeatured": true
      }
    ],
    "pagination": {
      "total": 3,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

**Status Code:** 200
**Response Time:** < 500ms

**Validation Checks:**
- [ ] Response is valid JSON
- [ ] `success` is true
- [ ] `services` array exists
- [ ] Each service has required fields
- [ ] Prices are positive numbers
- [ ] Only active services returned

#### Test Case: API-001-02 - GET /api/services?category=fiscale

**Priority:** High

**Request:**
```bash
curl -X GET "http://localhost:3000/api/services?category=fiscale" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Only services with `category: "fiscale"` returned
- Pagination metadata included

**Validation:**
```bash
# Verify all returned services have category=fiscale
curl -s "http://localhost:3000/api/services?category=fiscale" | \
  jq '.data.services[].category' | \
  grep -v "fiscale" && echo "FAIL" || echo "PASS"
```

#### Test Case: API-001-03 - GET /api/services?sort=price_asc

**Priority:** Medium

**Request:**
```bash
curl -X GET "http://localhost:3000/api/services?sort=price_asc"
```

**Validation:**
```bash
# Verify prices are in ascending order
curl -s "http://localhost:3000/api/services?sort=price_asc" | \
  jq '.data.services[].basePrice'
# Should show: 99.00, 129.00, 149.00
```

#### Test Case: API-001-04 - GET /api/services/[slug] (Get Single Service)

**Priority:** Critical

**Request:**
```bash
curl -X GET "http://localhost:3000/api/services/cazier-fiscal"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "uuid",
      "slug": "cazier-fiscal",
      "name": "Cazier Fiscal",
      "description": "...",
      "basePrice": 149.00,
      "options": [
        {
          "id": "uuid",
          "name": "Urgentare 24h",
          "type": "checkbox",
          "priceModifier": 50.00
        }
      ]
    }
  }
}
```

**Status Code:** 200

**Validation Checks:**
- [ ] Service details complete
- [ ] Options array present
- [ ] Each option has id, name, type, priceModifier

#### Test Case: API-001-05 - GET /api/services/invalid-slug

**Priority:** High

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "Service not found"
  }
}
```

**Status Code:** 404

### Test Suite: API-002 - Orders API

#### Test Case: API-002-01 - POST /api/orders (Create Order)

**Priority:** Critical
**Authentication:** Required

**Request:**
```bash
export TOKEN="your-jwt-token"

curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "serviceId": "service-uuid",
    "selectedOptions": [
      {
        "optionId": "option-uuid",
        "value": "yes"
      }
    ],
    "customerData": {
      "fullName": "Ion Popescu",
      "cnp": "1234567890123",
      "email": "ion@example.com",
      "phone": "0712345678",
      "address": {
        "street": "Str. Exemplu 123",
        "city": "Bucuresti",
        "county": "Bucuresti",
        "postalCode": "012345"
      }
    },
    "deliveryMethod": "email"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-2025-0000001",
      "status": "pending",
      "totalAmount": 199.00,
      "breakdown": {
        "basePrice": 149.00,
        "optionsTotal": 50.00,
        "subtotal": 199.00,
        "tax": 0,
        "total": 199.00
      },
      "paymentStatus": "unpaid",
      "createdAt": "2025-12-18T...",
      "estimatedCompletion": "2025-12-23T..."
    }
  }
}
```

**Status Code:** 201

**Validation Checks:**
- [ ] Order created in database
- [ ] Order number format correct
- [ ] Price calculation accurate
- [ ] Customer CNP encrypted
- [ ] Audit log entry created

#### Test Case: API-002-02 - POST /api/orders (Validation Errors)

**Priority:** High

**Test Cases:**

**Missing serviceId:**
```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"customerData": {...}}'
# Expected: 400 - "serviceId is required"
```

**Invalid CNP:**
```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "serviceId": "uuid",
    "customerData": {
      "fullName": "Test",
      "cnp": "invalid",
      "email": "test@test.com",
      "phone": "0712345678"
    }
  }'
# Expected: 400 - "CNP invalid"
```

**Invalid email:**
```bash
# Expected: 400 - "Invalid email format"
```

#### Test Case: API-002-03 - GET /api/orders (List User Orders)

**Priority:** High
**Authentication:** Required

**Request:**
```bash
curl -X GET "http://localhost:3000/api/orders" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderNumber": "ORD-2025-0000001",
        "service": {
          "name": "Cazier Fiscal",
          "category": "fiscale"
        },
        "status": "pending",
        "totalAmount": 199.00,
        "paymentStatus": "unpaid",
        "createdAt": "2025-12-18T..."
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

**Status Code:** 200

**Validation:**
- [ ] Only user's own orders returned
- [ ] Orders sorted by created_at DESC
- [ ] Pagination works correctly

#### Test Case: API-002-04 - GET /api/orders?status=pending

**Priority:** Medium

**Request:**
```bash
curl -X GET "http://localhost:3000/api/orders?status=pending" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- Only orders with status "pending" returned

**Valid Status Values:**
- `pending`
- `processing`
- `document_ready`
- `delivered`
- `completed`
- `rejected`

#### Test Case: API-002-05 - GET /api/orders/[id] (Get Order Details)

**Priority:** High
**Authentication:** Required

**Request:**
```bash
curl -X GET "http://localhost:3000/api/orders/order-uuid" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-2025-0000001",
      "service": {...},
      "status": "pending",
      "customerData": {
        "fullName": "Ion Popescu",
        "cnp": "1234567890123",
        "email": "ion@example.com"
      },
      "selectedOptions": [...],
      "timeline": [...]
    }
  }
}
```

**Security Check:**
- [ ] Users can only access their own orders
- [ ] Admin can access all orders
- [ ] CNP is decrypted for authorized user

#### Test Case: API-002-06 - POST /api/orders (Unauthenticated)

**Priority:** Critical

**Request:**
```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**Status Code:** 401

### Test Suite: API-003 - OCR API

#### Test Case: API-003-01 - GET /api/ocr/extract (Health Check)

**Priority:** High
**Authentication:** None

**Request:**
```bash
curl -X GET "http://localhost:3000/api/ocr/extract"
```

**Expected Response:**
```json
{
  "status": "ready",
  "service": "Document OCR",
  "provider": "Google Gemini 2.0 Flash Exp",
  "supportedDocuments": ["ci_front", "ci_back", "passport"],
  "features": [
    "Auto-detect document type",
    "Extract personal data (CNP, name, birth date, etc.)",
    "Extract address from CI back",
    "Support for Romanian ID cards and passports"
  ]
}
```

**Status Code:** 200

#### Test Case: API-003-02 - POST /api/ocr/extract (Auto Mode)

**Priority:** Critical
**Authentication:** Optional (affects rate limit)

**Request:**
```bash
# Convert image to base64
IMAGE_BASE64=$(base64 -i test-ci-front.jpg)

curl -X POST "http://localhost:3000/api/ocr/extract" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d "{
    \"mode\": \"auto\",
    \"imageBase64\": \"$IMAGE_BASE64\",
    \"mimeType\": \"image/jpeg\"
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "ocr": {
      "documentType": "ci_front",
      "confidence": "high",
      "extractedData": {
        "lastName": "POPESCU",
        "firstName": "ION",
        "cnp": "1234567890123",
        "nationality": "ROMÂNĂ",
        "birthDate": "01.01.1990",
        "sex": "M",
        "ciSeries": "AB",
        "ciNumber": "123456"
      }
    },
    "timestamp": "2025-12-18T..."
  }
}
```

**Status Code:** 200

**Validation Checks:**
- [ ] Document type detected correctly
- [ ] All fields extracted
- [ ] Confidence level provided
- [ ] Audit log created

#### Test Case: API-003-03 - POST /api/ocr/extract (Invalid Origin)

**Priority:** High

**Request:**
```bash
curl -X POST "http://localhost:3000/api/ocr/extract" \
  -H "Content-Type: application/json" \
  -H "Origin: https://malicious-site.com" \
  -d '{...}'
```

**Expected Response (Production Only):**
```json
{
  "error": "Forbidden",
  "message": "Invalid request origin"
}
```

**Status Code:** 403

#### Test Case: API-003-04 - POST /api/ocr/extract (Rate Limiting)

**Priority:** Critical

**Steps:**
1. Make 11 requests in 60 seconds (guest user)
2. Check 11th request

**Expected Response:**
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Try again in X seconds.",
  "retryAfter": 30
}
```

**Status Code:** 429
**Headers:**
- `Retry-After: 30`
- `X-RateLimit-Remaining: 0`

**Rate Limits:**
- Guest: 10 req/min
- Authenticated: 30 req/min

#### Test Case: API-003-05 - POST /api/ocr/extract (CI Complete Mode)

**Priority:** High

**Request:**
```bash
FRONT_BASE64=$(base64 -i ci-front.jpg)
BACK_BASE64=$(base64 -i ci-back.jpg)

curl -X POST "http://localhost:3000/api/ocr/extract" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d "{
    \"mode\": \"ci_complete\",
    \"front\": {
      \"imageBase64\": \"$FRONT_BASE64\",
      \"mimeType\": \"image/jpeg\"
    },
    \"back\": {
      \"imageBase64\": \"$BACK_BASE64\",
      \"mimeType\": \"image/jpeg\"
    }
  }"
```

**Expected Result:**
- Both sides processed
- Data merged correctly
- Address extracted from back

### Test Suite: API-004 - KYC Validation API

#### Test Case: API-004-01 - GET /api/kyc/validate (Health Check)

**Priority:** High

**Request:**
```bash
curl -X GET "http://localhost:3000/api/kyc/validate"
```

**Expected Response:**
```json
{
  "status": "ready",
  "service": "KYC Document Validation",
  "provider": "Google Gemini AI",
  "supportedDocuments": ["ci_front", "ci_back", "selfie"]
}
```

**Status Code:** 200

#### Test Case: API-004-02 - POST /api/kyc/validate (Single Document)

**Priority:** High

**Request:**
```bash
IMAGE_BASE64=$(base64 -i ci-front.jpg)

curl -X POST "http://localhost:3000/api/kyc/validate" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d "{
    \"mode\": \"single\",
    \"documentType\": \"ci_front\",
    \"imageBase64\": \"$IMAGE_BASE64\",
    \"mimeType\": \"image/jpeg\"
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "validation": {
      "isValid": true,
      "confidence": "high",
      "checks": {
        "documentIntegrity": {
          "passed": true,
          "score": 0.95
        },
        "visualAuthenticity": {
          "passed": true,
          "score": 0.92
        },
        "dataConsistency": {
          "passed": true,
          "score": 0.98
        }
      },
      "issues": []
    }
  }
}
```

**Status Code:** 200

#### Test Case: API-004-03 - POST /api/kyc/validate (Complete KYC)

**Priority:** Critical

**Request:**
```bash
curl -X POST "http://localhost:3000/api/kyc/validate" \
  -H "Content-Type: application/json" \
  -d "{
    \"mode\": \"complete\",
    \"ciFront\": {...},
    \"ciBack\": {...},
    \"selfie\": {...}
  }"
```

**Expected Response:**
- All 3 documents validated
- Face matching performed
- Overall KYC status determined

---

## Security Testing

### Test Suite: SEC-001 - Rate Limiting

#### Test Case: SEC-001-01 - OCR Rate Limit (Guest)

**Priority:** Critical

**Steps:**
1. Clear rate limit cache
2. Make 10 OCR requests rapidly
3. Check response for request 11

**Expected Result:**
- First 10 requests: 200 OK
- Request 11: 429 Too Many Requests
- Headers include `Retry-After`

**Automated Test:**
```bash
#!/bin/bash
for i in {1..11}; do
  echo "Request $i:"
  curl -s -w "%{http_code}\n" \
    -X POST "http://localhost:3000/api/ocr/extract" \
    -H "Content-Type: application/json" \
    -d '{...}' | tail -1
  sleep 0.5
done
```

#### Test Case: SEC-001-02 - OCR Rate Limit (Authenticated)

**Expected Result:**
- First 30 requests: 200 OK
- Request 31: 429 Too Many Requests

#### Test Case: SEC-001-03 - Order Creation Rate Limit

**Expected Limits:**
- Guest: 3 req/min
- Authenticated: 10 req/min

### Test Suite: SEC-002 - PII Encryption

#### Test Case: SEC-002-01 - CNP Encryption on Order Creation

**Priority:** Critical

**Steps:**
1. Create order with CNP
2. Query database directly
3. Verify CNP is encrypted

**SQL Verification:**
```sql
SELECT customer_data FROM orders WHERE id = 'order-uuid';
-- customer_data->>'cnp' should be encrypted (looks like random string)
```

**Expected:**
- CNP stored encrypted (AES-256)
- CI series/number encrypted
- Other data in plain text

#### Test Case: SEC-002-02 - CNP Decryption on Order Retrieval

**Steps:**
1. Fetch order via API
2. Verify CNP is decrypted

**Expected:**
- API returns decrypted CNP
- Only for authorized user/admin

### Test Suite: SEC-003 - Audit Logging

#### Test Case: SEC-003-01 - OCR Audit Logs

**Priority:** High

**Actions to Log:**
- OCR extraction request
- Rate limit violations
- Origin validation failures

**Log Entry Format:**
```json
{
  "action": "ocr_extract",
  "status": "success",
  "userId": "uuid",
  "ipAddress": "192.168.1.1",
  "userAgent": "...",
  "resourceType": "document",
  "metadata": {
    "mode": "auto",
    "documentType": "ci_front",
    "confidence": "high"
  },
  "timestamp": "2025-12-18T..."
}
```

**Validation:**
```sql
SELECT * FROM audit_logs
WHERE action = 'ocr_extract'
ORDER BY created_at DESC
LIMIT 10;
```

**Security Check:**
- [ ] No PII in metadata
- [ ] IP address logged
- [ ] Timestamp accurate

#### Test Case: SEC-003-02 - Order Audit Logs

**Actions to Log:**
- Order creation
- Order status changes
- Payment attempts

### Test Suite: SEC-004 - Origin Validation

#### Test Case: SEC-004-01 - Valid Origin

**Priority:** High

**Valid Origins:**
- `http://localhost:3000`
- `https://eghiseul.ro`
- `https://www.eghiseul.ro`

**Request:**
```bash
curl -X POST "http://localhost:3000/api/ocr/extract" \
  -H "Origin: http://localhost:3000" \
  -d '{...}'
```

**Expected:** 200 OK (in production, enforced)

#### Test Case: SEC-004-02 - Invalid Origin

**Request:**
```bash
curl -X POST "http://localhost:3000/api/ocr/extract" \
  -H "Origin: https://evil.com" \
  -d '{...}'
```

**Expected (Production):** 403 Forbidden

### Test Suite: SEC-005 - Input Validation

#### Test Case: SEC-005-01 - SQL Injection Protection

**Priority:** Critical

**Test Inputs:**
```sql
' OR '1'='1
'; DROP TABLE users; --
1' UNION SELECT * FROM users--
```

**Where to Test:**
- Order creation (customerData fields)
- Services filtering
- Search parameters

**Expected Result:**
- Input sanitized
- No SQL execution
- Error returned for invalid input

#### Test Case: SEC-005-02 - XSS Protection

**Test Inputs:**
```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
```

**Expected Result:**
- HTML entities escaped
- Scripts not executed
- Safe rendering in UI

#### Test Case: SEC-005-03 - File Upload Validation

**Test Cases:**
- Valid: JPEG, PNG (< 10MB)
- Invalid: EXE, ZIP, oversized files

**Expected:**
- Only allowed MIME types accepted
- File size limits enforced

---

## Integration Testing

### Test Suite: INT-001 - Supabase Integration

#### Test Case: INT-001-01 - Database Connection

**Priority:** Critical

**Test:**
```bash
curl http://localhost:3000/api/services
```

**Validation:**
- [ ] Connection established
- [ ] Query executed
- [ ] Data returned

#### Test Case: INT-001-02 - Row Level Security (RLS)

**Priority:** Critical

**Test:**
1. User A creates order
2. User B tries to access User A's order

**Expected:**
- User B cannot see User A's order
- 403 or 404 response

### Test Suite: INT-002 - Stripe Integration

#### Test Case: INT-002-01 - Create Payment Intent

**Priority:** High
**Authentication:** Required

**Request:**
```bash
curl -X POST "http://localhost:3000/api/orders/order-uuid/payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 19900,
    "currency": "ron"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "paymentIntent": {
      "id": "pi_xxx",
      "clientSecret": "pi_xxx_secret_xxx",
      "amount": 19900,
      "currency": "ron",
      "status": "requires_payment_method"
    }
  }
}
```

**Validation:**
- [ ] Payment intent created in Stripe
- [ ] Client secret returned
- [ ] Amount correct

#### Test Case: INT-002-02 - Webhook Processing

**Priority:** High

**Setup:**
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Test Events:**
- `payment_intent.succeeded`
- `payment_intent.failed`

**Expected:**
- Order status updated
- Payment status updated
- Notification sent

### Test Suite: INT-003 - Google AI OCR

#### Test Case: INT-003-01 - API Key Validation

**Priority:** Critical

**Test:**
```bash
# Remove API key temporarily
unset GOOGLE_AI_API_KEY

curl http://localhost:3000/api/ocr/extract
```

**Expected Response:**
```json
{
  "status": "not_configured",
  "service": "Document OCR"
}
```

#### Test Case: INT-003-02 - Document Processing

**Priority:** High

**Test with real document image**

**Validation:**
- [ ] Image processed
- [ ] Text extracted
- [ ] Data structured correctly

---

## Manual Testing Checklists

### Checklist: Authentication Flow

**Registration:**
- [ ] Navigate to `/register`
- [ ] Enter valid email and password
- [ ] Submit form
- [ ] Verify confirmation email received
- [ ] Click confirmation link
- [ ] Verify email confirmed in Supabase

**Login:**
- [ ] Navigate to `/login`
- [ ] Enter credentials
- [ ] Click "Sign In"
- [ ] Verify redirect to `/account`
- [ ] Check session cookie exists

**Password Reset:**
- [ ] Navigate to `/forgot-password`
- [ ] Enter email
- [ ] Check email inbox
- [ ] Click reset link
- [ ] Enter new password
- [ ] Verify can login with new password

**Logout:**
- [ ] Click logout button
- [ ] Verify redirect to home
- [ ] Verify session cleared
- [ ] Try accessing `/account` (should redirect to login)

### Checklist: Order Creation Flow

**Prerequisites:**
- [ ] User is logged in
- [ ] Services exist in database

**Steps:**
1. [ ] Browse services at `/services`
2. [ ] Click on a service
3. [ ] Select options
4. [ ] Click "Order Now"
5. [ ] Fill in customer data form
6. [ ] Submit order
7. [ ] Verify order confirmation page
8. [ ] Check order appears in `/orders`
9. [ ] Verify email notification sent
10. [ ] Check database for order record

**Validation:**
- [ ] Order number generated correctly
- [ ] Price calculated accurately
- [ ] Customer data saved
- [ ] CNP encrypted in database

### Checklist: Payment Flow

**Prerequisites:**
- [ ] Order created
- [ ] Stripe configured

**Steps:**
1. [ ] Navigate to order details
2. [ ] Click "Pay Now"
3. [ ] Enter test card: `4242 4242 4242 4242`
4. [ ] Enter future expiry date
5. [ ] Enter any CVV
6. [ ] Submit payment
7. [ ] Wait for confirmation

**Validation:**
- [ ] Payment processed
- [ ] Order status updated to "paid"
- [ ] Payment intent saved
- [ ] Receipt email sent

**Test Cards:**
| Card Number | Expected Result |
|-------------|----------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires authentication |

### Checklist: OCR Upload Flow

**Prerequisites:**
- [ ] Have test ID card images
- [ ] Google AI API key configured

**Steps:**
1. [ ] Navigate to KYC upload page
2. [ ] Select "Upload ID Card Front"
3. [ ] Choose file
4. [ ] Wait for upload
5. [ ] Verify data extracted
6. [ ] Check extracted fields pre-fill form
7. [ ] Upload back of ID
8. [ ] Verify address extracted
9. [ ] Submit form

**Validation:**
- [ ] Images uploaded successfully
- [ ] OCR extraction accurate
- [ ] Fields populated correctly
- [ ] Rate limiting not triggered

### Checklist: Admin Functions

**Prerequisites:**
- [ ] Admin account created
- [ ] Admin role assigned

**Steps:**
1. [ ] Login as admin
2. [ ] Access `/admin/orders`
3. [ ] View all orders
4. [ ] Update order status
5. [ ] Add admin notes
6. [ ] Download reports

**Validation:**
- [ ] Can see all users' orders
- [ ] Can update any order
- [ ] Changes logged in audit

---

## Automated Testing

### Unit Tests

**Location:** `__tests__/unit/`

**Coverage:**
- [ ] API route handlers
- [ ] Validation schemas (Zod)
- [ ] Encryption/decryption functions
- [ ] Rate limiter logic
- [ ] Price calculation

**Run Tests:**
```bash
npm run test:unit
```

### Integration Tests

**Location:** `__tests__/integration/`

**Coverage:**
- [ ] API endpoint flows
- [ ] Database operations
- [ ] Authentication flows
- [ ] Payment processing

**Run Tests:**
```bash
npm run test:integration
```

### End-to-End Tests

**Framework:** Playwright or Cypress

**Test Scenarios:**
- [ ] Complete order flow
- [ ] Payment processing
- [ ] Document upload
- [ ] User registration → order → payment

**Run Tests:**
```bash
npm run test:e2e
```

### API Test Scripts

**Quick Tests:**
```bash
cd docs/testing
chmod +x quick-api-tests.sh
./quick-api-tests.sh
```

**Comprehensive Tests:**
```bash
./test-api-endpoints.sh
```

**Results:**
- Console output
- Saved to `api-test-results.txt`

---

## Performance Testing

### Test Suite: PERF-001 - Response Time

#### Test Case: PERF-001-01 - API Response Times

**Endpoints to Test:**
| Endpoint | Expected Response Time |
|----------|----------------------|
| GET /api/services | < 500ms |
| GET /api/services/[slug] | < 300ms |
| POST /api/orders | < 1000ms |
| POST /api/ocr/extract | < 5000ms |
| POST /api/kyc/validate | < 5000ms |

**Tool:** Apache Bench or Artillery

**Test:**
```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:3000/api/services
```

**Success Criteria:**
- 95th percentile < expected time
- No failed requests
- No 500 errors

### Test Suite: PERF-002 - Load Testing

#### Test Case: PERF-002-01 - Concurrent Users

**Scenario:**
- 50 concurrent users
- Each makes 10 requests
- Duration: 1 minute

**Tool:** Artillery

**Config:**
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 50
scenarios:
  - flow:
    - get:
        url: "/api/services"
    - post:
        url: "/api/orders"
        headers:
          Authorization: "Bearer {{token}}"
```

**Run:**
```bash
artillery run load-test.yml
```

**Success Criteria:**
- Response time p95 < 2s
- Error rate < 1%
- No memory leaks

### Test Suite: PERF-003 - Database Performance

#### Test Case: PERF-003-01 - Query Performance

**Queries to Test:**
```sql
-- List services (with filters)
EXPLAIN ANALYZE
SELECT * FROM services
WHERE is_active = true
AND category = 'fiscale'
ORDER BY display_order;

-- Get user orders
EXPLAIN ANALYZE
SELECT o.*, s.name as service_name
FROM orders o
JOIN services s ON o.service_id = s.id
WHERE o.user_id = 'user-uuid'
ORDER BY o.created_at DESC;
```

**Success Criteria:**
- Query execution time < 50ms
- Proper index usage
- No sequential scans on large tables

---

## Test Data

### Test Users

```json
{
  "testuser1": {
    "email": "test1@example.com",
    "password": "TestPass123!",
    "role": "user"
  },
  "testuser2": {
    "email": "test2@example.com",
    "password": "TestPass123!",
    "role": "user"
  },
  "admin": {
    "email": "admin@eghiseul.ro",
    "password": "AdminPass123!",
    "role": "admin"
  }
}
```

### Test Services

**Service 1: Cazier Fiscal**
```json
{
  "id": "uuid-1",
  "slug": "cazier-fiscal",
  "name": "Cazier Fiscal",
  "category": "fiscale",
  "basePrice": 149.00,
  "currency": "RON",
  "requiresKyc": true,
  "estimatedDays": 5,
  "urgentAvailable": true,
  "urgentDays": 1
}
```

**Service 2: Extras Carte Funciara**
```json
{
  "id": "uuid-2",
  "slug": "extras-carte-funciara",
  "name": "Extras Carte Funciara",
  "category": "imobiliare",
  "basePrice": 99.00,
  "currency": "RON",
  "requiresKyc": false,
  "estimatedDays": 3
}
```

### Test Service Options

**Cazier Fiscal Options:**
```json
[
  {
    "id": "opt-1",
    "name": "Urgentare 24h",
    "type": "checkbox",
    "priceModifier": 50.00
  },
  {
    "id": "opt-2",
    "name": "Traducere legalizata",
    "type": "checkbox",
    "priceModifier": 75.00
  }
]
```

### Test Orders

**Sample Order:**
```json
{
  "serviceId": "uuid-1",
  "selectedOptions": [
    {
      "optionId": "opt-1",
      "value": "yes"
    }
  ],
  "customerData": {
    "fullName": "Ion Popescu",
    "cnp": "1900101234567",
    "email": "ion.popescu@example.com",
    "phone": "0712345678",
    "address": {
      "street": "Str. Victoriei 123",
      "city": "Bucuresti",
      "county": "Bucuresti",
      "postalCode": "010101"
    }
  },
  "deliveryMethod": "email"
}
```

### Test Images

**Location:** `test-data/images/`

**Files Needed:**
- `ci-front-valid.jpg` - Valid CI front
- `ci-back-valid.jpg` - Valid CI back
- `passport-valid.jpg` - Valid passport
- `selfie-valid.jpg` - Valid selfie
- `ci-front-blurry.jpg` - Blurry image
- `ci-front-fake.jpg` - Fake document

---

## Test Execution Summary

### Priority Levels

| Priority | When to Run | Must Pass Before |
|----------|-------------|------------------|
| Critical | Every commit | Deployment |
| High | Daily | Release |
| Medium | Weekly | Major release |
| Low | Monthly | N/A |

### Test Coverage Goals

| Category | Current | Target |
|----------|---------|--------|
| Unit Tests | 0% | 80% |
| Integration Tests | 0% | 70% |
| E2E Tests | 0% | 60% |
| API Tests | Manual | 100% |

### Regression Testing

**Run Before:**
- [ ] Each deployment
- [ ] Major feature releases
- [ ] Database migrations
- [ ] Security updates

**Quick Regression:**
```bash
npm run test:quick
./docs/testing/quick-api-tests.sh
```

**Full Regression:**
```bash
npm run test:all
```

---

## Test Environment Setup

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/yourusername/eghiseul.ro.git
cd eghiseul.ro

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Start Supabase (local)
npx supabase start

# 5. Run migrations
npm run db:migrate

# 6. Seed test data
npm run db:seed

# 7. Start dev server
npm run dev
```

### Staging Environment

```bash
# Deploy to staging
npm run deploy:staging

# Run smoke tests
npm run test:smoke -- --env=staging

# Monitor logs
npm run logs:staging
```

### Production Testing

**Smoke Tests Only:**
- [ ] Homepage loads
- [ ] API health checks pass
- [ ] Authentication works
- [ ] Critical paths functional

```bash
npm run test:smoke -- --env=production
```

---

## Reporting

### Test Report Format

**Daily Test Summary:**
```markdown
# Test Execution Report - 2025-12-18

## Summary
- Total Tests: 156
- Passed: 150
- Failed: 4
- Skipped: 2
- Duration: 5m 23s

## Failed Tests
1. AUTH-002-03 - Login rate limiting
   - Expected: 429, Got: 200
   - Action: Investigate rate limiter

## Coverage
- Unit: 78% (+2%)
- Integration: 65% (+5%)
- E2E: 55% (+3%)
```

### Bug Report Template

```markdown
## Bug Report

**ID:** BUG-2025-001
**Title:** Order creation fails with invalid CNP format
**Severity:** High
**Status:** Open

**Steps to Reproduce:**
1. Login as user
2. Create order
3. Enter CNP: "123"
4. Submit

**Expected:** Validation error
**Actual:** 500 Internal Server Error

**Environment:** Local development
**Logs:** [Attach logs]
**Screenshots:** [Attach screenshots]
```

---

## Maintenance

### Update Test Plan

**When to Update:**
- New features added
- API endpoints changed
- Security requirements updated
- Bug patterns identified

**Review Schedule:**
- Weekly: Test results review
- Monthly: Test plan updates
- Quarterly: Coverage analysis

### Test Data Refresh

**Monthly:**
- Clear old test data
- Regenerate test users
- Update test images

```bash
npm run test:cleanup
npm run test:seed
```

---

## Appendix

### Useful Commands

**Check API Health:**
```bash
curl http://localhost:3000/api/services | jq
```

**Get JWT Token:**
```bash
# Login and extract token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' | \
  jq -r '.access_token')

echo $TOKEN
```

**Database Query:**
```bash
# Via Supabase CLI
npx supabase db query "SELECT * FROM services LIMIT 5;"
```

**View Logs:**
```bash
# Development logs
npm run dev | grep ERROR

# Production logs (Vercel)
vercel logs
```

### Environment Variables

**Required for Testing:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google AI (OCR/KYC)
GOOGLE_AI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Encryption
ENCRYPTION_KEY=
```

### Tools Required

```bash
# Install testing tools
npm install -D @playwright/test
npm install -D vitest
npm install -D supertest

# System tools
brew install jq        # JSON processor
brew install curl      # HTTP client
brew install httpie    # User-friendly HTTP client
```

---

## Document Control

**Version:** 1.0
**Last Updated:** 2025-12-18
**Author:** Test Strategy Specialist
**Reviewers:** Development Team

**Change Log:**
- 2025-12-18: Initial version created
- [Future updates...]

**Related Documents:**
- `/docs/testing/API-TESTING-README.md`
- `/docs/testing/API-TEST-MANUAL.md`
- `/docs/testing/TEST-DATA-REFERENCE.md`
- `/docs/security/security-architecture.md`

---

**End of Test Plan**
