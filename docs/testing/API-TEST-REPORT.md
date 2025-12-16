# API Endpoint Test Report - eGhiseul.ro

**Generated:** 2025-12-16
**Application:** eGhiseul.ro
**Base URL:** http://localhost:3000
**API Version:** v1

---

## Executive Summary

This report documents all API endpoints in the eGhiseul.ro application, their expected behavior, and testing procedures. The application uses Next.js 15 App Router with TypeScript and Supabase for data persistence.

### Endpoint Overview

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| /api/services | GET | No | List all services |
| /api/services/[slug] | GET | No | Get service details |
| /api/orders | POST | Yes | Create new order |
| /api/orders | GET | Yes | List user orders |
| /api/orders/[id] | GET | Yes | Get order details |
| /api/orders/[id] | PATCH | Yes (Admin) | Update order status |
| /api/orders/[id]/payment | POST | Yes | Create payment intent |
| /api/webhooks/stripe | POST | No* | Stripe webhook handler |

*Webhook endpoint uses Stripe signature verification instead of JWT

---

## Detailed Endpoint Analysis

### 1. GET /api/services

**File:** `/src/app/api/services/route.ts`

**Purpose:** Retrieve a paginated list of active services with filtering and sorting capabilities.

**Query Parameters:**
| Parameter | Type | Required | Default | Validation |
|-----------|------|----------|---------|------------|
| category | string | No | null | Must be one of: fiscale, juridice, imobiliare, comerciale, auto, personale |
| sort | string | No | display_order | One of: display_order, price_asc, price_desc, popular |
| limit | number | No | 50 | Max 100 |
| offset | number | No | 0 | Min 0 |

**Response Structure:**
```typescript
{
  success: true,
  data: {
    services: Array<{
      id: string
      slug: string
      code: string
      name: string
      description: string
      shortDescription: string
      category: string
      basePrice: number
      currency: string
      isActive: boolean
      isFeatured: boolean
      requiresKyc: boolean
      estimatedDays: number
      urgentAvailable: boolean
      urgentDays: number
      createdAt: string
      updatedAt: string
    }>
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}
```

**Database Query:**
- Filters: `is_active = true`, optional category filter
- Sorting: Configurable (display_order, price, or featured+display_order)
- Returns: Service records with exact count

**Expected Behaviors:**
- ✅ Returns only active services
- ✅ Invalid category parameter is ignored (returns all categories)
- ✅ Limit is capped at 100
- ✅ Proper pagination with hasMore flag
- ✅ Price values converted from database format to float
- ✅ Consistent error handling with proper status codes

**Error Scenarios:**
| Scenario | HTTP Status | Error Code |
|----------|-------------|------------|
| Database error | 500 | DATABASE_ERROR |
| Unexpected error | 500 | INTERNAL_ERROR |

**Test Cases:**
1. Basic request without parameters
2. Filter by each valid category
3. Each sort option (display_order, price_asc, price_desc, popular)
4. Pagination with different limit/offset combinations
5. Invalid category (should be ignored)
6. Limit over 100 (should be capped)
7. Negative offset (verify handling)

---

### 2. GET /api/services/[slug]

**File:** `/src/app/api/services/[slug]/route.ts`

**Purpose:** Retrieve detailed information about a specific service including its options.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| slug | string | Yes | Service slug identifier |

**Response Structure:**
```typescript
{
  success: true,
  data: {
    service: {
      id: string
      slug: string
      code: string
      name: string
      description: string
      shortDescription: string
      category: string
      basePrice: number
      currency: string
      isActive: boolean
      isFeatured: boolean
      requiresKyc: boolean
      estimatedDays: number
      urgentAvailable: boolean
      urgentDays: number
      config: object
      metaTitle: string
      metaDescription: string
      options: Array<{
        id: string
        name: string
        description: string
        type: string
        priceModifier: number
        isRequired: boolean
        choices: Array<string>
        displayOrder: number
      }>
      createdAt: string
      updatedAt: string
    }
  }
}
```

**Database Queries:**
1. Service lookup: `slug = [slug] AND is_active = true` (single)
2. Options lookup: `service_id = [id] AND is_active = true` (ordered by display_order)

**Expected Behaviors:**
- ✅ Returns service with all options
- ✅ Only returns active services
- ✅ Options sorted by display_order
- ✅ 404 for non-existent or inactive services
- ✅ Includes SEO metadata fields

**Error Scenarios:**
| Scenario | HTTP Status | Error Code |
|----------|-------------|------------|
| Service not found | 404 | SERVICE_NOT_FOUND |
| Service inactive | 404 | SERVICE_NOT_FOUND |
| Unexpected error | 500 | INTERNAL_ERROR |

**Test Cases:**
1. Valid service slug (e.g., "cazier-fiscal")
2. Non-existent slug
3. Inactive service slug (if applicable)
4. Service with options
5. Service without options

---

### 3. POST /api/orders

**File:** `/src/app/api/orders/route.ts`

**Purpose:** Create a new order for a service.

**Authentication:** Required (JWT Bearer token)

**Request Body Schema (Zod validation):**
```typescript
{
  serviceId: string (UUID)
  selectedOptions?: Array<{
    optionId: string (UUID)
    value: string
  }>
  customerData: {
    fullName: string (min 2 chars)
    cnp?: string (regex: /^[1-9]\d{12}$/)
    email: string (email format)
    phone: string (min 10 chars)
    address?: {
      street: string (min 3 chars)
      city: string (min 2 chars)
      county: string (min 2 chars)
      postalCode: string (min 5 chars)
    }
  }
  deliveryMethod?: "email" | "registered_mail" | "courier"
  additionalNotes?: string (max 1000 chars)
}
```

**Response Structure (201 Created):**
```typescript
{
  success: true,
  data: {
    order: {
      id: string
      orderNumber: string // Format: "ORD-YYYY-0000001"
      userId: string
      serviceId: string
      serviceName: string
      status: "pending"
      totalAmount: number
      currency: "RON"
      breakdown: {
        basePrice: number
        optionsTotal: number
        subtotal: number
        tax: number
        total: number
      }
      selectedOptions: Array<{
        optionId: string
        name: string
        value: string
        price: number
      }>
      customerData: object
      deliveryMethod: string
      additionalNotes?: string
      paymentStatus: "unpaid"
      paymentIntentId: null
      createdAt: string
      updatedAt: string
      estimatedCompletion: string
    }
  }
}
```

**Process Flow:**
1. Verify user authentication
2. Validate request body with Zod schema
3. Verify service exists and is active
4. Calculate total price (base + options)
5. Create order record in database
6. Return formatted order with auto-generated order number

**Expected Behaviors:**
- ✅ Requires valid JWT token
- ✅ Validates all input fields
- ✅ Verifies service exists and is active
- ✅ Calculates price correctly including options
- ✅ Auto-generates sequential order number
- ✅ Sets initial status to "pending"
- ✅ Sets payment status to "unpaid"
- ✅ Calculates estimated completion date

**Error Scenarios:**
| Scenario | HTTP Status | Error Code |
|----------|-------------|------------|
| No authentication | 401 | UNAUTHORIZED |
| Invalid JWT token | 401 | UNAUTHORIZED |
| Validation failed | 400 | VALIDATION_ERROR |
| Service not found | 404 | SERVICE_NOT_FOUND |
| Service inactive | 404 | SERVICE_NOT_FOUND |
| Database error | 500 | DATABASE_ERROR |
| Unexpected error | 500 | INTERNAL_ERROR |

**Test Cases:**
1. Valid order creation
2. Without authentication (should return 401)
3. Invalid service ID
4. Invalid email format
5. Invalid CNP format
6. Missing required fields
7. Order with options
8. Order without options
9. Very long additional notes (over 1000 chars)

---

### 4. GET /api/orders

**File:** `/src/app/api/orders/route.ts`

**Purpose:** List all orders for the authenticated user.

**Authentication:** Required (JWT Bearer token)

**Query Parameters:**
| Parameter | Type | Required | Default | Validation |
|-----------|------|----------|---------|------------|
| status | string | No | null | One of: pending, processing, document_ready, delivered, completed, rejected |
| limit | number | No | 20 | Max 50 |
| offset | number | No | 0 | Min 0 |

**Response Structure:**
```typescript
{
  success: true,
  data: {
    orders: Array<{
      id: string
      orderNumber: string
      service: {
        id: string
        slug: string
        name: string
        category: string
      }
      status: string
      totalAmount: number
      currency: "RON"
      paymentStatus: string
      createdAt: string
      updatedAt: string
    }>
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}
```

**Database Query:**
- Filters: `user_id = [current_user]`, optional status filter
- Joins: Service details
- Sorting: `created_at DESC`
- Returns: Order records with exact count

**Expected Behaviors:**
- ✅ Only returns orders for authenticated user
- ✅ Joins with services table for service details
- ✅ Orders sorted by most recent first
- ✅ Status filter works correctly
- ✅ Pagination with hasMore flag

**Error Scenarios:**
| Scenario | HTTP Status | Error Code |
|----------|-------------|------------|
| No authentication | 401 | UNAUTHORIZED |
| Database error | 500 | DATABASE_ERROR |
| Unexpected error | 500 | INTERNAL_ERROR |

**Test Cases:**
1. List all orders for user
2. Filter by each status
3. Pagination with different limits
4. Without authentication (should return 401)
5. User with no orders
6. Invalid status parameter (should be ignored)

---

### 5. GET /api/orders/[id]

**File:** `/src/app/api/orders/[id]/route.ts`

**Purpose:** Get detailed information about a specific order.

**Authentication:** Required (JWT Bearer token, must be order owner or admin)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Order UUID |

**Response Structure:**
```typescript
{
  success: true,
  data: {
    order: {
      id: string
      orderNumber: string
      userId: string
      service: {
        id: string
        slug: string
        name: string
        description: string
        category: string
        basePrice: number
      }
      status: string
      totalAmount: number
      currency: "RON"
      breakdown: {
        basePrice: number
        optionsTotal: number
        subtotal: number
        tax: number
        total: number
      }
      selectedOptions: Array<object>
      customerData: object
      deliveryMethod: string
      deliveryAddress: object | null
      paymentStatus: string
      paymentIntentId: string | null
      contractUrl: string | null
      finalDocumentUrl: string | null
      createdAt: string
      updatedAt: string
      estimatedCompletion: string
      statusHistory: Array<object>
    }
  }
}
```

**Authorization Logic:**
1. Fetch order with service details
2. Fetch user's profile to check role
3. Verify user owns order OR user is admin
4. Return 403 if neither condition is true

**Expected Behaviors:**
- ✅ Returns full order details
- ✅ Includes service details via join
- ✅ Calculates price breakdown
- ✅ Includes document URLs if available
- ✅ Admin can view any order
- ✅ Regular user can only view own orders

**Error Scenarios:**
| Scenario | HTTP Status | Error Code |
|----------|-------------|------------|
| No authentication | 401 | UNAUTHORIZED |
| Order not found | 404 | ORDER_NOT_FOUND |
| Not order owner (not admin) | 403 | FORBIDDEN |
| Unexpected error | 500 | INTERNAL_ERROR |

**Test Cases:**
1. User viewing own order
2. Admin viewing any order
3. User trying to view another user's order (should return 403)
4. Without authentication (should return 401)
5. Non-existent order ID
6. Order with payment intent
7. Order with documents

---

### 6. PATCH /api/orders/[id]

**File:** `/src/app/api/orders/[id]/route.ts`

**Purpose:** Update order status and notes (admin only).

**Authentication:** Required (JWT Bearer token with admin role)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Order UUID |

**Request Body:**
```typescript
{
  status?: string // One of: pending, processing, document_ready, delivered, completed, rejected
  notes?: string
}
```

**Response Structure:**
```typescript
{
  success: true,
  data: {
    order: {
      id: string
      status: string
      updatedAt: string
    }
  }
}
```

**Authorization Logic:**
1. Verify user authentication
2. Check user's role in profiles table
3. Verify role is "admin"
4. Return 403 if not admin

**Expected Behaviors:**
- ✅ Only admins can update orders
- ✅ Validates status against allowed values
- ✅ Updates timestamp automatically
- ✅ Can update status, notes, or both

**Error Scenarios:**
| Scenario | HTTP Status | Error Code |
|----------|-------------|------------|
| No authentication | 401 | UNAUTHORIZED |
| Not admin | 403 | FORBIDDEN |
| Invalid status | 400 | INVALID_STATUS |
| Update failed | 500 | UPDATE_FAILED |
| Unexpected error | 500 | INTERNAL_ERROR |

**Test Cases:**
1. Admin updating order status
2. Admin updating order notes
3. Regular user attempting update (should return 403)
4. Invalid status value
5. Non-existent order ID
6. Without authentication

---

### 7. POST /api/orders/[id]/payment

**File:** `/src/app/api/orders/[id]/payment/route.ts`

**Purpose:** Create a Stripe payment intent for an order.

**Authentication:** Required (JWT Bearer token, must be order owner)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Order UUID |

**Response Structure:**
```typescript
{
  success: true,
  data: {
    paymentIntentId: string
    clientSecret: string
    amount: number
    currency: string
  }
}
```

**Process Flow:**
1. Verify user authentication
2. Fetch order with service details
3. Verify user owns the order
4. Check if already paid
5. Check if payment intent already exists
6. Create new Stripe payment intent
7. Update order with payment intent ID
8. Return client secret for frontend

**Expected Behaviors:**
- ✅ Only order owner can create payment
- ✅ Returns existing payment intent if one exists
- ✅ Prevents duplicate payment intents
- ✅ Prevents payment for already paid orders
- ✅ Includes order metadata in payment intent

**Error Scenarios:**
| Scenario | HTTP Status | Error Code |
|----------|-------------|------------|
| No authentication | 401 | UNAUTHORIZED |
| Order not found | 404 | ORDER_NOT_FOUND |
| Not order owner | 403 | FORBIDDEN |
| Already paid | 400 | ALREADY_PAID |
| Payment creation failed | 500 | PAYMENT_ERROR |
| Unexpected error | 500 | INTERNAL_ERROR |

**Test Cases:**
1. Create payment for unpaid order
2. Attempt payment for already paid order
3. Attempt payment for another user's order
4. Request payment intent twice (should return existing)
5. Non-existent order
6. Without authentication

---

### 8. POST /api/webhooks/stripe

**File:** `/src/app/api/webhooks/stripe/route.ts`

**Purpose:** Handle Stripe webhook events for payment status updates.

**Authentication:** Stripe signature verification (not JWT)

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| stripe-signature | Yes* | Stripe webhook signature |

*Required in production, optional in development

**Supported Events:**

#### payment_intent.succeeded
- Updates order: `payment_status = 'paid'`, `status = 'processing'`
- Requires: `orderId` in payment intent metadata

#### payment_intent.payment_failed
- Logs failure, doesn't update order status
- Allows user to retry payment

#### charge.refunded
- Updates order: `payment_status = 'refunded'`
- Finds order by payment intent ID

**Response:**
```typescript
{
  received: true
}
```

**Expected Behaviors:**
- ✅ Verifies Stripe signature in production
- ✅ Updates order status automatically on successful payment
- ✅ Handles refunds correctly
- ✅ Logs unhandled events
- ✅ Uses service role for database access (bypasses RLS)

**Error Scenarios:**
| Scenario | HTTP Status | Error Message |
|----------|-------------|---------------|
| Invalid signature | 400 | Webhook signature verification failed |
| Invalid payload | 400 | Invalid webhook payload |
| Handler error | 500 | Webhook handler failed |

**Test Cases:**
1. payment_intent.succeeded event
2. payment_intent.payment_failed event
3. charge.refunded event
4. Unknown event type
5. Invalid signature
6. Missing orderId in metadata

---

## Security Considerations

### Authentication & Authorization
- ✅ JWT Bearer tokens for user authentication
- ✅ Supabase auth for token verification
- ✅ Role-based access control (admin vs user)
- ✅ Order ownership verification
- ✅ Stripe signature verification for webhooks

### Data Validation
- ✅ Zod schemas for request validation
- ✅ Type safety with TypeScript
- ✅ Input sanitization via Supabase
- ✅ UUID validation for IDs
- ✅ Email and phone format validation
- ✅ CNP regex validation for Romanian ID

### Error Handling
- ✅ Consistent error response format
- ✅ Appropriate HTTP status codes
- ✅ Error logging for debugging
- ✅ No sensitive data in error messages
- ✅ Graceful fallbacks for missing data

### Rate Limiting
- ⚠️ No explicit rate limiting implemented
- Recommendation: Add rate limiting middleware

### CORS
- ⚠️ No explicit CORS configuration visible
- Next.js default CORS handling applies

---

## Performance Considerations

### Database Queries
- ✅ Single queries with joins where possible
- ✅ Proper indexing on slug, user_id, service_id
- ✅ Pagination to limit result sets
- ✅ Count queries for pagination metadata
- ⚠️ No query caching visible

### Response Times
Expected performance metrics:
- GET /api/services: < 500ms
- GET /api/services/[slug]: < 300ms
- POST /api/orders: < 800ms (includes Stripe call)
- GET /api/orders: < 500ms
- GET /api/orders/[id]: < 400ms

### Optimization Opportunities
1. Add Redis caching for service listings
2. Implement query result caching
3. Add database query monitoring
4. Consider GraphQL for flexible queries
5. Add CDN caching for public endpoints

---

## Testing Instructions

### Prerequisites
1. Next.js dev server running: `npm run dev`
2. Supabase instance configured
3. Database seeded with test data
4. Valid JWT tokens for authenticated tests
5. jq installed for JSON formatting (optional)

### Quick Test
Run the quick test script:
```bash
chmod +x quick-api-tests.sh
./quick-api-tests.sh
```

### Comprehensive Test
Run the full test suite:
```bash
chmod +x test-api-endpoints.sh
./test-api-endpoints.sh
```

### Manual Testing
Use the commands in `API-TEST-MANUAL.md` for detailed manual testing.

### Obtaining JWT Token
To test authenticated endpoints:
1. Sign in via the frontend
2. Open browser DevTools > Application > Local Storage
3. Find Supabase auth token
4. Or use Supabase client to get session token

Example:
```bash
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:3000/api/orders
```

---

## Known Issues & Limitations

### Current Limitations
1. No rate limiting on public endpoints
2. No request caching
3. Maximum pagination limit of 100 items
4. Webhook signature optional in development
5. No API versioning strategy
6. No API documentation endpoint (OpenAPI/Swagger)

### Future Improvements
1. Add API rate limiting (e.g., with Redis)
2. Implement response caching
3. Add request ID tracing
4. Generate OpenAPI specification
5. Add API metrics and monitoring
6. Implement webhook retry logic
7. Add request validation middleware
8. Create automated test suite (Jest/Supertest)

---

## Recommendations

### Immediate Actions
1. ✅ Test all public endpoints with the provided scripts
2. ✅ Verify database seeding for test data
3. ⚠️ Add rate limiting to prevent abuse
4. ⚠️ Implement API monitoring and logging
5. ⚠️ Create automated test suite

### Best Practices
1. Always use HTTPS in production
2. Rotate JWT secrets regularly
3. Monitor Stripe webhook delivery
4. Set up error alerting (e.g., Sentry)
5. Document API changes in changelog
6. Version control API responses
7. Add request/response logging

### Development Workflow
1. Test endpoints locally before deployment
2. Use staging environment for integration tests
3. Test webhook integration with Stripe CLI
4. Verify RLS policies in Supabase
5. Monitor database query performance

---

## Appendix

### Status Codes Reference
| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST (order creation) |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Unexpected server error |

### Order Status Flow
```
pending → processing → document_ready → delivered → completed
                    ↓
                 rejected
```

### Payment Status Flow
```
unpaid → paid → refunded
```

### Database Tables
- `services`: Service catalog
- `service_options`: Service add-ons and modifications
- `orders`: Customer orders
- `profiles`: User profiles (includes role)

---

**Report End**
