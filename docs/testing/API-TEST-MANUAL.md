# API Endpoint Testing Manual

## Overview
This document provides manual testing instructions for all eGhiseul.ro API endpoints.

**Base URL:** `http://localhost:3000`

---

## Public Endpoints (No Authentication Required)

### 1. GET /api/services
**Description:** List all active services with optional filtering, sorting, and pagination.

**Query Parameters:**
- `category` (optional): Filter by category (fiscale, juridice, imobiliare, comerciale, auto, personale)
- `sort` (optional): Sort order (display_order, price_asc, price_desc, popular)
- `limit` (optional): Number of results per page (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "slug": "service-slug",
        "code": "SERVICE_CODE",
        "name": "Service Name",
        "description": "Full description",
        "shortDescription": "Brief description",
        "category": "fiscale",
        "basePrice": 99.99,
        "currency": "RON",
        "isActive": true,
        "isFeatured": false,
        "requiresKyc": false,
        "estimatedDays": 5,
        "urgentAvailable": true,
        "urgentDays": 2,
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 10,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

**Test Commands:**
```bash
# Basic request
curl -X GET http://localhost:3000/api/services -H "Content-Type: application/json"

# With category filter
curl -X GET "http://localhost:3000/api/services?category=fiscale" -H "Content-Type: application/json"

# With sorting
curl -X GET "http://localhost:3000/api/services?sort=price_asc" -H "Content-Type: application/json"

# With pagination
curl -X GET "http://localhost:3000/api/services?limit=5&offset=0" -H "Content-Type: application/json"
```

---

### 2. GET /api/services/[slug]
**Description:** Get detailed information about a specific service, including its options.

**URL Parameters:**
- `slug`: The service slug (e.g., "cazier-fiscal")

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "uuid",
      "slug": "cazier-fiscal",
      "code": "CAZIER_FISCAL",
      "name": "Cazier Fiscal",
      "description": "Full description with requirements",
      "shortDescription": "Brief description",
      "category": "fiscale",
      "basePrice": 49.99,
      "currency": "RON",
      "isActive": true,
      "isFeatured": true,
      "requiresKyc": true,
      "estimatedDays": 3,
      "urgentAvailable": true,
      "urgentDays": 1,
      "config": {},
      "metaTitle": "SEO Title",
      "metaDescription": "SEO Description",
      "options": [
        {
          "id": "uuid",
          "name": "Option Name",
          "description": "Option description",
          "type": "select",
          "priceModifier": 10.00,
          "isRequired": false,
          "choices": ["Choice 1", "Choice 2"],
          "displayOrder": 1
        }
      ],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

**Test Commands:**
```bash
# Valid service
curl -X GET http://localhost:3000/api/services/cazier-fiscal -H "Content-Type: application/json"

# Non-existent service (should return 404)
curl -X GET http://localhost:3000/api/services/non-existent -H "Content-Type: application/json"
```

---

## Authenticated Endpoints (JWT Token Required)

### 3. POST /api/orders
**Description:** Create a new order for a service.

**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "serviceId": "uuid",
  "selectedOptions": [
    {
      "optionId": "uuid",
      "value": "selected value"
    }
  ],
  "customerData": {
    "fullName": "John Doe",
    "cnp": "1234567890123",
    "email": "john@example.com",
    "phone": "0712345678",
    "address": {
      "street": "Str. Principala 123",
      "city": "Bucuresti",
      "county": "Bucuresti",
      "postalCode": "010101"
    }
  },
  "deliveryMethod": "email",
  "additionalNotes": "Optional notes"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-2025-0000001",
      "userId": "uuid",
      "serviceId": "uuid",
      "serviceName": "Service Name",
      "status": "pending",
      "totalAmount": 99.99,
      "currency": "RON",
      "breakdown": {
        "basePrice": 49.99,
        "optionsTotal": 50.00,
        "subtotal": 99.99,
        "tax": 0,
        "total": 99.99
      },
      "selectedOptions": [],
      "customerData": {},
      "deliveryMethod": "email",
      "paymentStatus": "unpaid",
      "createdAt": "2025-01-01T00:00:00Z",
      "estimatedCompletion": "2025-01-08T00:00:00Z"
    }
  }
}
```

**Test Commands:**
```bash
# With authentication
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "serviceId": "valid-uuid",
    "customerData": {
      "fullName": "Test User",
      "email": "test@example.com",
      "phone": "0712345678"
    }
  }'

# Without authentication (should return 401)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "valid-uuid",
    "customerData": {
      "fullName": "Test User",
      "email": "test@example.com",
      "phone": "0712345678"
    }
  }'
```

---

### 4. GET /api/orders
**Description:** List all orders for the authenticated user.

**Authentication:** Required (JWT Bearer token)

**Query Parameters:**
- `status` (optional): Filter by status (pending, processing, document_ready, delivered, completed, rejected)
- `limit` (optional): Number of results per page (default: 20, max: 50)
- `offset` (optional): Pagination offset (default: 0)

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
          "id": "uuid",
          "slug": "cazier-fiscal",
          "name": "Cazier Fiscal",
          "category": "fiscale"
        },
        "status": "pending",
        "totalAmount": 99.99,
        "currency": "RON",
        "paymentStatus": "unpaid",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

**Test Commands:**
```bash
# With authentication
curl -X GET http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# With status filter
curl -X GET "http://localhost:3000/api/orders?status=pending" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Without authentication (should return 401)
curl -X GET http://localhost:3000/api/orders \
  -H "Content-Type: application/json"
```

---

### 5. GET /api/orders/[id]
**Description:** Get detailed information about a specific order.

**Authentication:** Required (JWT Bearer token, must be order owner or admin)

**URL Parameters:**
- `id`: The order UUID

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-2025-0000001",
      "userId": "uuid",
      "service": {
        "id": "uuid",
        "slug": "cazier-fiscal",
        "name": "Cazier Fiscal",
        "description": "Full description",
        "category": "fiscale",
        "basePrice": 49.99
      },
      "status": "pending",
      "totalAmount": 99.99,
      "currency": "RON",
      "breakdown": {
        "basePrice": 49.99,
        "optionsTotal": 50.00,
        "subtotal": 99.99,
        "tax": 0,
        "total": 99.99
      },
      "selectedOptions": [],
      "customerData": {},
      "deliveryMethod": "email",
      "deliveryAddress": null,
      "paymentStatus": "unpaid",
      "paymentIntentId": null,
      "contractUrl": null,
      "finalDocumentUrl": null,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z",
      "estimatedCompletion": "2025-01-08T00:00:00Z",
      "statusHistory": []
    }
  }
}
```

**Test Commands:**
```bash
# With authentication
curl -X GET http://localhost:3000/api/orders/YOUR_ORDER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Without authentication (should return 401)
curl -X GET http://localhost:3000/api/orders/YOUR_ORDER_ID \
  -H "Content-Type: application/json"

# Non-existent order (should return 404)
curl -X GET http://localhost:3000/api/orders/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. PATCH /api/orders/[id]
**Description:** Update order status (admin only).

**Authentication:** Required (JWT Bearer token, admin role)

**URL Parameters:**
- `id`: The order UUID

**Request Body:**
```json
{
  "status": "processing",
  "notes": "Order is being processed"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "status": "processing",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

**Test Commands:**
```bash
# With admin authentication
curl -X PATCH http://localhost:3000/api/orders/YOUR_ORDER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "status": "processing",
    "notes": "Order is being processed"
  }'

# Without admin role (should return 403)
curl -X PATCH http://localhost:3000/api/orders/YOUR_ORDER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -d '{
    "status": "processing"
  }'
```

---

### 7. POST /api/orders/[id]/payment
**Description:** Create a Stripe payment intent for an order.

**Authentication:** Required (JWT Bearer token, must be order owner)

**URL Parameters:**
- `id`: The order UUID

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "paymentIntentId": "pi_xxxxxxxxxxxxx",
    "clientSecret": "pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx",
    "amount": 9999,
    "currency": "ron"
  }
}
```

**Test Commands:**
```bash
# With authentication
curl -X POST http://localhost:3000/api/orders/YOUR_ORDER_ID/payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Without authentication (should return 401)
curl -X POST http://localhost:3000/api/orders/YOUR_ORDER_ID/payment \
  -H "Content-Type: application/json"

# Already paid order (should return 400)
curl -X POST http://localhost:3000/api/orders/PAID_ORDER_ID/payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 8. POST /api/webhooks/stripe
**Description:** Stripe webhook endpoint for payment events.

**Authentication:** Not required (uses Stripe signature verification)

**Headers:**
- `stripe-signature`: Stripe webhook signature

**Request Body:** Stripe event object (JSON)

**Expected Response:**
```json
{
  "received": true
}
```

**Supported Events:**
- `payment_intent.succeeded`: Marks order as paid and processing
- `payment_intent.payment_failed`: Logs payment failure
- `charge.refunded`: Marks order as refunded

**Test Commands:**
```bash
# Note: This endpoint is designed to be called by Stripe, not manually
# For testing, you can use Stripe CLI:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Error Response Format

All API errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional, for validation errors
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401): Authentication required or invalid token
- `FORBIDDEN` (403): User doesn't have permission
- `SERVICE_NOT_FOUND` (404): Service not found or inactive
- `ORDER_NOT_FOUND` (404): Order not found
- `VALIDATION_ERROR` (400): Invalid request data
- `DATABASE_ERROR` (500): Database operation failed
- `INTERNAL_ERROR` (500): Unexpected server error
- `PAYMENT_ERROR` (500): Payment processing failed
- `ALREADY_PAID` (400): Order already paid

---

## Testing Checklist

### Public Endpoints
- [ ] GET /api/services - Returns list of services
- [ ] GET /api/services with category filter - Returns filtered services
- [ ] GET /api/services with sorting - Returns sorted services
- [ ] GET /api/services with pagination - Respects limit/offset
- [ ] GET /api/services/[slug] - Returns service details
- [ ] GET /api/services/[slug] with invalid slug - Returns 404

### Authentication Errors
- [ ] POST /api/orders without auth - Returns 401
- [ ] GET /api/orders without auth - Returns 401
- [ ] GET /api/orders/[id] without auth - Returns 401
- [ ] POST /api/orders/[id]/payment without auth - Returns 401

### Validation
- [ ] Invalid category parameter - Ignored or validated
- [ ] Invalid sort parameter - Defaults to display_order
- [ ] Limit over 100 - Capped at 100
- [ ] Negative offset - Handles gracefully

### Response Structure
- [ ] All responses have `success` field
- [ ] Success responses include `data` field
- [ ] Error responses include `error.code` and `error.message`
- [ ] Pagination includes total, limit, offset, hasMore

### Performance
- [ ] Response times under 1 second for simple queries
- [ ] Response times acceptable for complex queries
- [ ] No timeout errors
