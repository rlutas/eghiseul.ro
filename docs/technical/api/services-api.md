# Services API Documentation

## Overview

RESTful API for managing services, orders, and payments in the eGhiseul.ro platform.

**Base URL**: `/api`
**Authentication**: JWT tokens via Supabase Auth
**Content-Type**: `application/json`

---

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

Public endpoints (no auth required):
- `GET /api/services`
- `GET /api/services/[slug]`
- `POST /api/webhooks/stripe`

Admin-only endpoints:
- `PATCH /api/orders/[id]/status`

---

## Endpoints

### 1. List Services

Retrieve all active services available for purchase.

**Endpoint**: `GET /api/services`
**Auth**: None (public)

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by service category |
| sort | string | No | Sort order: `price_asc`, `price_desc`, `popular` |
| limit | number | No | Number of results (default: 50, max: 100) |
| offset | number | No | Pagination offset (default: 0) |

#### Response: 200 OK

```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "slug": "carte-identitate",
        "name": "Carte de Identitate",
        "description": "Eliberare sau reinnoire carte de identitate",
        "category": "identitate",
        "basePrice": 7.00,
        "currency": "RON",
        "processingTime": "10 zile lucratoare",
        "isActive": true,
        "popularity": 150,
        "thumbnail": "https://cdn.eghiseul.ro/services/ci.jpg",
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### Error Responses

```json
// 400 Bad Request
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "Invalid query parameters",
    "details": {
      "limit": "Must be between 1 and 100"
    }
  }
}

// 500 Internal Server Error
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

### 2. Get Service Details

Retrieve detailed information about a specific service including all available options.

**Endpoint**: `GET /api/services/[slug]`
**Auth**: None (public)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| slug | string | Yes | Unique service identifier (URL-friendly) |

#### Response: 200 OK

```json
{
  "success": true,
  "data": {
    "service": {
      "id": "uuid",
      "slug": "carte-identitate",
      "name": "Carte de Identitate",
      "description": "Eliberare sau reinnoire carte de identitate",
      "fullDescription": "Serviciu complet pentru...",
      "category": "identitate",
      "basePrice": 7.00,
      "currency": "RON",
      "processingTime": "10 zile lucratoare",
      "isActive": true,
      "popularity": 150,
      "thumbnail": "https://cdn.eghiseul.ro/services/ci.jpg",
      "images": [
        "https://cdn.eghiseul.ro/services/ci-1.jpg",
        "https://cdn.eghiseul.ro/services/ci-2.jpg"
      ],
      "requiredDocuments": [
        "Certificat de nastere",
        "Dovada domiciliului"
      ],
      "options": [
        {
          "id": "uuid",
          "name": "Urgenta 24h",
          "description": "Prelucrare in 24 de ore",
          "type": "addon",
          "priceModifier": 50.00,
          "isRequired": false,
          "order": 1
        },
        {
          "id": "uuid",
          "name": "Tip solicitare",
          "description": "Eliberare prima data sau reinnoire",
          "type": "select",
          "priceModifier": 0,
          "isRequired": true,
          "order": 2,
          "choices": [
            {
              "value": "prima-eliberare",
              "label": "Prima eliberare",
              "priceModifier": 0
            },
            {
              "value": "reinnoire",
              "label": "Reinnoire",
              "priceModifier": 0
            }
          ]
        }
      ],
      "metadata": {
        "legalBasis": "Legea 122/2018",
        "authority": "DEPABD"
      },
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

#### Error Responses

```json
// 404 Not Found
{
  "success": false,
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "Service with slug 'invalid-slug' not found"
  }
}
```

---

### 3. Create Order

Create a new order for a service.

**Endpoint**: `POST /api/orders`
**Auth**: Required (user token)

#### Request Body

```json
{
  "serviceId": "uuid",
  "selectedOptions": [
    {
      "optionId": "uuid",
      "value": "urgenta-24h"
    },
    {
      "optionId": "uuid",
      "value": "reinnoire"
    }
  ],
  "personalInfo": {
    "fullName": "Ion Popescu",
    "email": "ion.popescu@example.com",
    "phone": "+40712345678",
    "address": {
      "street": "Str. Libertatii nr. 10",
      "city": "Bucuresti",
      "county": "Bucuresti",
      "postalCode": "010101"
    }
  },
  "additionalNotes": "Va rog sa contactati dupa-amiaza"
}
```

#### Response: 201 Created

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-2025-0001234",
      "userId": "uuid",
      "serviceId": "uuid",
      "serviceName": "Carte de Identitate",
      "status": "pending",
      "totalAmount": 57.00,
      "currency": "RON",
      "breakdown": {
        "basePrice": 7.00,
        "optionsTotal": 50.00,
        "subtotal": 57.00,
        "tax": 0,
        "total": 57.00
      },
      "selectedOptions": [
        {
          "optionId": "uuid",
          "name": "Urgenta 24h",
          "value": "urgenta-24h",
          "price": 50.00
        }
      ],
      "personalInfo": {
        "fullName": "Ion Popescu",
        "email": "ion.popescu@example.com",
        "phone": "+40712345678",
        "address": {
          "street": "Str. Libertatii nr. 10",
          "city": "Bucuresti",
          "county": "Bucuresti",
          "postalCode": "010101"
        }
      },
      "additionalNotes": "Va rog sa contactati dupa-amiaza",
      "paymentStatus": "unpaid",
      "paymentIntentId": null,
      "createdAt": "2025-12-16T10:30:00Z",
      "updatedAt": "2025-12-16T10:30:00Z",
      "estimatedCompletion": "2025-12-17T10:30:00Z"
    }
  }
}
```

#### Error Responses

```json
// 400 Bad Request - Invalid Data
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid order data",
    "details": {
      "personalInfo.email": "Invalid email format",
      "selectedOptions": "Missing required option: Tip solicitare"
    }
  }
}

// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// 404 Not Found
{
  "success": false,
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "Service not found or inactive"
  }
}

// 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "INVALID_OPTIONS",
    "message": "Selected options are not valid for this service",
    "details": {
      "invalidOptionIds": ["uuid"]
    }
  }
}
```

---

### 4. List User Orders

Retrieve all orders for the authenticated user.

**Endpoint**: `GET /api/orders`
**Auth**: Required (user token)

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: `pending`, `processing`, `completed`, `cancelled` |
| limit | number | No | Number of results (default: 20, max: 100) |
| offset | number | No | Pagination offset (default: 0) |
| sortBy | string | No | Sort by: `created_desc`, `created_asc`, `amount_desc`, `amount_asc` |

#### Response: 200 OK

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderNumber": "ORD-2025-0001234",
        "serviceId": "uuid",
        "serviceName": "Carte de Identitate",
        "serviceThumbnail": "https://cdn.eghiseul.ro/services/ci.jpg",
        "status": "processing",
        "totalAmount": 57.00,
        "currency": "RON",
        "paymentStatus": "paid",
        "createdAt": "2025-12-16T10:30:00Z",
        "estimatedCompletion": "2025-12-17T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### Error Responses

```json
// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

### 5. Get Order Details

Retrieve detailed information about a specific order.

**Endpoint**: `GET /api/orders/[id]`
**Auth**: Required (user token, must own the order or be admin)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Order UUID |

#### Response: 200 OK

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-2025-0001234",
      "userId": "uuid",
      "serviceId": "uuid",
      "serviceName": "Carte de Identitate",
      "serviceSlug": "carte-identitate",
      "serviceThumbnail": "https://cdn.eghiseul.ro/services/ci.jpg",
      "status": "processing",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2025-12-16T10:30:00Z",
          "note": "Order created"
        },
        {
          "status": "processing",
          "timestamp": "2025-12-16T11:00:00Z",
          "note": "Payment confirmed, processing started",
          "updatedBy": "system"
        }
      ],
      "totalAmount": 57.00,
      "currency": "RON",
      "breakdown": {
        "basePrice": 7.00,
        "optionsTotal": 50.00,
        "subtotal": 57.00,
        "tax": 0,
        "total": 57.00
      },
      "selectedOptions": [
        {
          "optionId": "uuid",
          "name": "Urgenta 24h",
          "value": "urgenta-24h",
          "price": 50.00
        }
      ],
      "personalInfo": {
        "fullName": "Ion Popescu",
        "email": "ion.popescu@example.com",
        "phone": "+40712345678",
        "address": {
          "street": "Str. Libertatii nr. 10",
          "city": "Bucuresti",
          "county": "Bucuresti",
          "postalCode": "010101"
        }
      },
      "additionalNotes": "Va rog sa contactati dupa-amiaza",
      "paymentStatus": "paid",
      "paymentIntentId": "pi_abc123",
      "paymentMethod": "card",
      "documents": [
        {
          "id": "uuid",
          "name": "certificat-nastere.pdf",
          "uploadedAt": "2025-12-16T10:35:00Z",
          "url": "https://cdn.eghiseul.ro/uploads/secured/xyz.pdf"
        }
      ],
      "createdAt": "2025-12-16T10:30:00Z",
      "updatedAt": "2025-12-16T11:00:00Z",
      "estimatedCompletion": "2025-12-17T10:30:00Z"
    }
  }
}
```

#### Error Responses

```json
// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to view this order"
  }
}

// 404 Not Found
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found"
  }
}
```

---

### 6. Update Order Status (Admin)

Update the status of an order. Admin-only endpoint.

**Endpoint**: `PATCH /api/orders/[id]/status`
**Auth**: Required (admin token)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Order UUID |

#### Request Body

```json
{
  "status": "processing",
  "note": "Documents verified, processing started"
}
```

#### Valid Status Transitions

| From | To | Description |
|------|-----|-------------|
| pending | processing | Payment confirmed, work started |
| pending | cancelled | Order cancelled before processing |
| processing | completed | Service completed |
| processing | cancelled | Order cancelled during processing (with refund) |

#### Response: 200 OK

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-2025-0001234",
      "status": "processing",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2025-12-16T10:30:00Z",
          "note": "Order created"
        },
        {
          "status": "processing",
          "timestamp": "2025-12-16T12:00:00Z",
          "note": "Documents verified, processing started",
          "updatedBy": "admin@eghiseul.ro"
        }
      ],
      "updatedAt": "2025-12-16T12:00:00Z"
    }
  }
}
```

#### Error Responses

```json
// 400 Bad Request - Invalid Status
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS",
    "message": "Invalid status value",
    "details": {
      "status": "Must be one of: pending, processing, completed, cancelled"
    }
  }
}

// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin privileges required"
  }
}

// 404 Not Found
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found"
  }
}

// 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "INVALID_TRANSITION",
    "message": "Cannot transition from 'completed' to 'processing'",
    "details": {
      "currentStatus": "completed",
      "requestedStatus": "processing",
      "allowedTransitions": []
    }
  }
}
```

---

### 7. Create Payment Intent

Create a Stripe payment intent for an order.

**Endpoint**: `POST /api/payments/create-intent`
**Auth**: Required (user token)

#### Request Body

```json
{
  "orderId": "uuid",
  "returnUrl": "https://eghiseul.ro/orders/uuid"
}
```

#### Response: 200 OK

```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_abc123_secret_xyz",
    "paymentIntentId": "pi_abc123",
    "amount": 5700,
    "currency": "ron",
    "publishableKey": "pk_test_..."
  }
}
```

#### Error Responses

```json
// 400 Bad Request - Order Already Paid
{
  "success": false,
  "error": {
    "code": "ORDER_ALREADY_PAID",
    "message": "This order has already been paid"
  }
}

// 400 Bad Request - Order Cancelled
{
  "success": false,
  "error": {
    "code": "ORDER_CANCELLED",
    "message": "Cannot create payment for cancelled order"
  }
}

// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to pay for this order"
  }
}

// 404 Not Found
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found"
  }
}

// 502 Bad Gateway - Stripe Error
{
  "success": false,
  "error": {
    "code": "PAYMENT_PROVIDER_ERROR",
    "message": "Unable to create payment intent",
    "details": "Stripe API error message"
  }
}
```

---

### 8. Stripe Webhook Handler

Handle Stripe webhook events for payment processing.

**Endpoint**: `POST /api/webhooks/stripe`
**Auth**: None (verified via Stripe signature)

#### Headers

```
Stripe-Signature: t=timestamp,v1=signature
```

#### Request Body

Raw Stripe webhook payload (verified by Stripe SDK).

#### Supported Events

- `payment_intent.succeeded`: Payment completed successfully
- `payment_intent.payment_failed`: Payment failed
- `payment_intent.canceled`: Payment cancelled
- `charge.refunded`: Refund processed

#### Response: 200 OK

```json
{
  "received": true
}
```

#### Error Responses

```json
// 400 Bad Request - Invalid Signature
{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Invalid webhook signature"
  }
}

// 400 Bad Request - Unknown Event
{
  "success": false,
  "error": {
    "code": "UNKNOWN_EVENT",
    "message": "Unsupported webhook event type"
  }
}
```

---

## Data Models

### Service

```typescript
interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  fullDescription?: string;
  category: string;
  basePrice: number;
  currency: string;
  processingTime: string;
  isActive: boolean;
  popularity: number;
  thumbnail: string;
  images?: string[];
  requiredDocuments?: string[];
  options?: ServiceOption[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### ServiceOption

```typescript
interface ServiceOption {
  id: string;
  name: string;
  description?: string;
  type: 'addon' | 'select' | 'text' | 'checkbox';
  priceModifier: number;
  isRequired: boolean;
  order: number;
  choices?: OptionChoice[];
}

interface OptionChoice {
  value: string;
  label: string;
  priceModifier: number;
}
```

### Order

```typescript
interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  serviceSlug?: string;
  serviceThumbnail?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  statusHistory?: StatusHistoryEntry[];
  totalAmount: number;
  currency: string;
  breakdown: PriceBreakdown;
  selectedOptions: SelectedOption[];
  personalInfo: PersonalInfo;
  additionalNotes?: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'failed';
  paymentIntentId?: string;
  paymentMethod?: string;
  documents?: OrderDocument[];
  createdAt: string;
  updatedAt: string;
  estimatedCompletion?: string;
}
```

### PersonalInfo

```typescript
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    county: string;
    postalCode: string;
  };
}
```

### PriceBreakdown

```typescript
interface PriceBreakdown {
  basePrice: number;
  optionsTotal: number;
  subtotal: number;
  tax: number;
  total: number;
}
```

---

## HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PATCH requests |
| 201 | Created | Successful POST creating new resource |
| 400 | Bad Request | Invalid request data or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Valid request but business logic error |
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | External service (Stripe) error |

---

## Error Response Format

All errors follow this consistent format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: any;          // Optional additional context
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| INVALID_PARAMS | 400 | Invalid query parameters |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| SERVICE_NOT_FOUND | 404 | Service doesn't exist |
| ORDER_NOT_FOUND | 404 | Order doesn't exist |
| INVALID_OPTIONS | 422 | Invalid service options |
| ORDER_ALREADY_PAID | 400 | Order already paid |
| ORDER_CANCELLED | 400 | Order is cancelled |
| INVALID_STATUS | 400 | Invalid order status |
| INVALID_TRANSITION | 422 | Invalid status transition |
| PAYMENT_PROVIDER_ERROR | 502 | Stripe API error |
| INTERNAL_ERROR | 500 | Unexpected error |

---

## Rate Limiting

Rate limits apply per IP address or authenticated user:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Public endpoints | 100 requests | 15 minutes |
| Authenticated endpoints | 1000 requests | 15 minutes |
| Order creation | 10 requests | 1 hour |
| Payment intents | 20 requests | 1 hour |

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1734350400
```

---

## Versioning

Current API version: **v1** (implicit, no version in URL)

Future versions will use URL versioning:
- `/api/v2/services`

Breaking changes will result in new API versions. Non-breaking changes will be added to current version.

---

## Security Considerations

1. **Authentication**:
   - JWT tokens via Supabase Auth
   - Tokens expire after 1 hour
   - Refresh tokens for long-lived sessions

2. **Authorization**:
   - Users can only access their own orders
   - Admin endpoints require admin role in JWT claims

3. **Webhook Security**:
   - Stripe webhooks verified via signature
   - Invalid signatures rejected

4. **Data Protection**:
   - Personal information encrypted at rest
   - Sensitive data (phone, address) only visible to order owner and admins
   - Document URLs are signed and expire after 1 hour

5. **Input Validation**:
   - All inputs validated and sanitized
   - SQL injection prevention via parameterized queries
   - XSS prevention via output encoding

6. **CORS**:
   - Restricted to eghiseul.ro domain
   - Credentials allowed for authenticated requests

---

## Implementation Guidelines

### Next.js 14 App Router Structure

```
src/app/api/
├── services/
│   ├── route.ts              # GET /api/services
│   └── [slug]/
│       └── route.ts          # GET /api/services/[slug]
├── orders/
│   ├── route.ts              # GET /api/orders, POST /api/orders
│   └── [id]/
│       ├── route.ts          # GET /api/orders/[id]
│       └── status/
│           └── route.ts      # PATCH /api/orders/[id]/status
├── payments/
│   └── create-intent/
│       └── route.ts          # POST /api/payments/create-intent
└── webhooks/
    └── stripe/
        └── route.ts          # POST /api/webhooks/stripe
```

### Middleware Recommendations

1. **Authentication Middleware** (`src/middleware/auth.ts`):
   - Verify JWT tokens
   - Attach user info to request
   - Handle token refresh

2. **Admin Middleware** (`src/middleware/admin.ts`):
   - Check admin role in JWT claims
   - Return 403 for non-admins

3. **Rate Limiting Middleware** (`src/middleware/rateLimit.ts`):
   - Track request counts
   - Return 429 when limit exceeded

4. **Error Handler** (`src/middleware/errorHandler.ts`):
   - Catch all errors
   - Format consistent error responses
   - Log errors for monitoring

### Database Schema Considerations

Required Supabase tables:

1. **services**:
   - id (uuid, primary key)
   - slug (text, unique)
   - name, description, category
   - base_price (decimal)
   - is_active (boolean)
   - created_at, updated_at

2. **service_options**:
   - id (uuid, primary key)
   - service_id (foreign key)
   - name, type, price_modifier
   - is_required, order

3. **orders**:
   - id (uuid, primary key)
   - order_number (text, unique)
   - user_id (foreign key)
   - service_id (foreign key)
   - status, payment_status
   - total_amount
   - personal_info (jsonb)
   - created_at, updated_at

4. **order_status_history**:
   - id (uuid, primary key)
   - order_id (foreign key)
   - status, note
   - updated_by
   - timestamp

### Stripe Integration

1. **Payment Intent Creation**:
   - Use `stripe.paymentIntents.create()`
   - Store `payment_intent_id` in order
   - Set metadata with `orderId`

2. **Webhook Handling**:
   - Verify signature: `stripe.webhooks.constructEvent()`
   - Update order status based on event
   - Handle idempotency (events may be sent multiple times)

3. **Test Mode**:
   - Use test keys for development
   - Test cards: 4242 4242 4242 4242 (success)

---

## Testing

### Test Scenarios

1. **Services**:
   - List all services
   - Filter by category
   - Get service with options
   - Handle inactive services

2. **Orders**:
   - Create order with required options
   - Create order with optional addons
   - Calculate price correctly
   - Validate personal info
   - List user orders
   - Get order details

3. **Payments**:
   - Create payment intent
   - Handle successful payment
   - Handle failed payment
   - Prevent double payment

4. **Admin**:
   - Update order status
   - Invalid status transitions
   - Non-admin access

### Example Test with curl

```bash
# List services
curl https://eghiseul.ro/api/services

# Get service details
curl https://eghiseul.ro/api/services/carte-identitate

# Create order (authenticated)
curl -X POST https://eghiseul.ro/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "uuid",
    "selectedOptions": [...],
    "personalInfo": {...}
  }'

# Get user orders
curl https://eghiseul.ro/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Changelog

### v1.0.0 (2025-12-16)
- Initial API design
- Services endpoints
- Orders management
- Payment integration
- Stripe webhooks

---

## Support

For API questions or issues:
- Email: dev@eghiseul.ro
- Documentation: https://docs.eghiseul.ro/api
- Status: https://status.eghiseul.ro
