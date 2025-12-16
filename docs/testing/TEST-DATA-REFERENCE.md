# Test Data Reference - eGhiseul.ro API

This document contains the actual test data from the database that you can use to test the API endpoints.

## Available Services (from migration 002_services.sql)

### Service 1: Cazier Fiscal
- **Slug:** `cazier-fiscal`
- **Code:** `SRV-001`
- **Name:** Cazier Fiscal
- **Category:** fiscale
- **Base Price:** 149.00 RON
- **Estimated Days:** 5 days (normal), 2 days (urgent)
- **KYC Required:** Yes
- **Featured:** Yes
- **Status:** Active

**Available Options:**
1. **Urgență** (urgenta) - 100.00 RON - Reduces delivery to 2 days
2. **Traducere Engleză** (traducere_en) - 150.00 RON - English translation
3. **Apostilă** (apostila) - 120.00 RON - Apostille for international use
4. **Copii Suplimentare** (copii_suplimentare) - 25.00 RON each (max 10)

**Required Fields:**
- cnp, first_name, last_name, birth_date, address, phone, email

**Test URL:**
```bash
curl http://localhost:3000/api/services/cazier-fiscal
```

---

### Service 2: Extras Carte Funciară
- **Slug:** `extras-carte-funciara`
- **Code:** `SRV-031`
- **Name:** Extras Carte Funciară
- **Category:** imobiliare
- **Base Price:** 99.00 RON
- **Estimated Days:** 5 days (normal), 2 days (urgent)
- **KYC Required:** Yes
- **Featured:** Yes
- **Status:** Active

**Available Options:**
1. **Urgență** (urgenta) - 100.00 RON - Reduces delivery to 2 days
2. **Copii Suplimentare** (copii_suplimentare) - 25.00 RON each (max 10)

**Required Fields:**
- cnp, first_name, last_name, phone, email, nr_cadastral

**Test URL:**
```bash
curl http://localhost:3000/api/services/extras-carte-funciara
```

---

### Service 3: Certificat Constatator
- **Slug:** `certificat-constatator`
- **Code:** `SRV-030`
- **Name:** Certificat Constatator
- **Category:** comerciale
- **Base Price:** 129.00 RON
- **Estimated Days:** 5 days (normal), 2 days (urgent)
- **KYC Required:** Yes
- **Featured:** Yes
- **Status:** Active

**Available Options:**
1. **Urgență** (urgenta) - 100.00 RON - Reduces delivery to 2 days
2. **Copii Suplimentare** (copii_suplimentare) - 25.00 RON each (max 10)

**Required Fields:**
- cnp, first_name, last_name, phone, email, cui, company_name

**Test URL:**
```bash
curl http://localhost:3000/api/services/certificat-constatator
```

---

## Test Commands with Actual Data

### 1. Get All Services
```bash
curl -X GET http://localhost:3000/api/services \
  -H "Content-Type: application/json" | jq .
```

**Expected Response:**
- Should return 3 services
- All should have `isActive: true`
- All should have `isFeatured: true`
- Categories: fiscale, imobiliare, comerciale

---

### 2. Filter by Category

#### Get Fiscal Services
```bash
curl -X GET "http://localhost:3000/api/services?category=fiscale" \
  -H "Content-Type: application/json" | jq .
```
**Expected:** 1 service (Cazier Fiscal)

#### Get Real Estate Services
```bash
curl -X GET "http://localhost:3000/api/services?category=imobiliare" \
  -H "Content-Type: application/json" | jq .
```
**Expected:** 1 service (Extras Carte Funciară)

#### Get Commercial Services
```bash
curl -X GET "http://localhost:3000/api/services?category=comerciale" \
  -H "Content-Type: application/json" | jq .
```
**Expected:** 1 service (Certificat Constatator)

---

### 3. Sort by Price

#### Lowest Price First
```bash
curl -X GET "http://localhost:3000/api/services?sort=price_asc" \
  -H "Content-Type: application/json" | jq .
```
**Expected Order:**
1. Extras Carte Funciară (99.00)
2. Certificat Constatator (129.00)
3. Cazier Fiscal (149.00)

#### Highest Price First
```bash
curl -X GET "http://localhost:3000/api/services?sort=price_desc" \
  -H "Content-Type: application/json" | jq .
```
**Expected Order:**
1. Cazier Fiscal (149.00)
2. Certificat Constatator (129.00)
3. Extras Carte Funciară (99.00)

---

### 4. Get Service Details with Options

#### Cazier Fiscal (should have 4 options)
```bash
curl -X GET http://localhost:3000/api/services/cazier-fiscal \
  -H "Content-Type: application/json" | jq .
```

**Expected Options:**
1. Urgență - 100.00 RON
2. Traducere Engleză - 150.00 RON
3. Apostilă - 120.00 RON
4. Copii Suplimentare - 25.00 RON

**Expected Fields in Response:**
- `service.options` should be an array of 4 items
- Each option should have: id, name, description, type, priceModifier, isRequired, choices, displayOrder

#### Extras Carte Funciară (should have 2 options)
```bash
curl -X GET http://localhost:3000/api/services/extras-carte-funciara \
  -H "Content-Type: application/json" | jq .
```

**Expected Options:**
1. Urgență - 100.00 RON
2. Copii Suplimentare - 25.00 RON

---

### 5. Test Error Cases

#### Non-existent Service (404)
```bash
curl -X GET http://localhost:3000/api/services/non-existent-service \
  -H "Content-Type: application/json" -w "\nHTTP Status: %{http_code}\n" | jq .
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "Service with slug 'non-existent-service' not found"
  }
}
```
**HTTP Status:** 404

#### Invalid Category (should be ignored)
```bash
curl -X GET "http://localhost:3000/api/services?category=invalid" \
  -H "Content-Type: application/json" | jq .
```

**Expected:** Returns all 3 services (category filter ignored)

---

## Sample Order Creation (Authenticated)

### Prerequisites
You need to obtain a valid JWT token first. You can:
1. Sign up/login via the frontend
2. Use Supabase Auth API
3. Use the Supabase dashboard to create a test user

### Create Order for Cazier Fiscal (No Options)

```bash
# Replace YOUR_SERVICE_ID with the actual UUID from the services table
# Replace YOUR_JWT_TOKEN with your actual token

curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "serviceId": "YOUR_SERVICE_ID",
    "customerData": {
      "fullName": "Ion Popescu",
      "cnp": "1850101123456",
      "email": "ion.popescu@example.com",
      "phone": "0712345678",
      "address": {
        "street": "Str. Exemplu nr. 1",
        "city": "Bucuresti",
        "county": "Bucuresti",
        "postalCode": "010101"
      }
    },
    "deliveryMethod": "email"
  }' | jq .
```

**Expected Response:**
- HTTP Status: 201 Created
- Order number format: "ORD-2025-0000001"
- Status: "pending"
- Payment status: "unpaid"
- Total amount: 149.00 RON
- Estimated completion: 5 business days from now

---

### Create Order with Options (Urgență + Traducere)

```bash
# Get the service and option IDs first
SERVICE_ID="..." # From /api/services/cazier-fiscal
OPTION_URGENTA_ID="..."  # From service.options array
OPTION_TRADUCERE_ID="..."  # From service.options array

curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "serviceId": "'$SERVICE_ID'",
    "selectedOptions": [
      {
        "optionId": "'$OPTION_URGENTA_ID'",
        "value": "Da"
      },
      {
        "optionId": "'$OPTION_TRADUCERE_ID'",
        "value": "Engleza"
      }
    ],
    "customerData": {
      "fullName": "Maria Ionescu",
      "cnp": "2920202234567",
      "email": "maria.ionescu@example.com",
      "phone": "0723456789"
    },
    "deliveryMethod": "email",
    "additionalNotes": "Urgent pentru interviu job"
  }' | jq .
```

**Expected Response:**
- Total amount: 149.00 + 100.00 + 150.00 = 399.00 RON
- Estimated completion: 2 business days (urgent)
- Selected options should include both urgență and traducere_en

---

## Validation Test Cases

### Invalid CNP Format
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "serviceId": "YOUR_SERVICE_ID",
    "customerData": {
      "fullName": "Test User",
      "cnp": "123",
      "email": "test@example.com",
      "phone": "0712345678"
    }
  }' | jq .
```

**Expected Response:**
- HTTP Status: 400
- Error code: VALIDATION_ERROR
- Error details should mention CNP validation failed

---

### Invalid Email Format
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "serviceId": "YOUR_SERVICE_ID",
    "customerData": {
      "fullName": "Test User",
      "cnp": "1850101123456",
      "email": "not-an-email",
      "phone": "0712345678"
    }
  }' | jq .
```

**Expected Response:**
- HTTP Status: 400
- Error code: VALIDATION_ERROR
- Error details should mention email validation failed

---

### Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "serviceId": "YOUR_SERVICE_ID",
    "customerData": {
      "fullName": "Test User"
    }
  }' | jq .
```

**Expected Response:**
- HTTP Status: 400
- Error code: VALIDATION_ERROR
- Error details should list missing required fields (email, phone)

---

## Price Calculation Examples

### Cazier Fiscal - Base Only
- Base Price: 149.00 RON
- **Total: 149.00 RON**

### Cazier Fiscal - With Urgență
- Base Price: 149.00 RON
- Urgență: +100.00 RON
- **Total: 249.00 RON**

### Cazier Fiscal - Full Package
- Base Price: 149.00 RON
- Urgență: +100.00 RON
- Traducere EN: +150.00 RON
- Apostilă: +120.00 RON
- 2x Copii: +50.00 RON
- **Total: 569.00 RON**

### Extras Carte Funciară - With Urgență
- Base Price: 99.00 RON
- Urgență: +100.00 RON
- **Total: 199.00 RON**

### Certificat Constatator - With Urgență + 3 Copies
- Base Price: 129.00 RON
- Urgență: +100.00 RON
- 3x Copii: +75.00 RON
- **Total: 304.00 RON**

---

## Database Queries for Getting Test IDs

If you have access to the Supabase SQL Editor, run these queries to get the actual UUIDs:

```sql
-- Get all services with their IDs
SELECT id, slug, name, base_price, category
FROM services
WHERE is_active = TRUE
ORDER BY display_order;

-- Get Cazier Fiscal ID
SELECT id FROM services WHERE slug = 'cazier-fiscal';

-- Get all options for Cazier Fiscal
SELECT
  so.id,
  so.code,
  so.name,
  so.price,
  s.slug as service_slug
FROM service_options so
JOIN services s ON s.id = so.service_id
WHERE s.slug = 'cazier-fiscal'
  AND so.is_active = TRUE
ORDER BY so.display_order;

-- Get urgență option ID for a specific service
SELECT so.id
FROM service_options so
JOIN services s ON s.id = so.service_id
WHERE s.slug = 'cazier-fiscal'
  AND so.code = 'urgenta';
```

---

## Expected Response Times

Based on the API implementation:

| Endpoint | Expected Time | Notes |
|----------|---------------|-------|
| GET /api/services | < 500ms | Simple query with filter |
| GET /api/services/[slug] | < 300ms | Single query + options join |
| POST /api/orders | < 800ms | Multiple queries + validation |
| GET /api/orders | < 500ms | User orders with join |
| GET /api/orders/[id] | < 400ms | Single order with joins |
| POST /api/orders/[id]/payment | < 1000ms | Includes Stripe API call |

---

## Quick Verification Script

Save this as `verify-services.sh`:

```bash
#!/bin/bash

echo "Verifying eGhiseul.ro Services..."
echo ""

# Test 1: Count total services
echo "1. Total active services:"
curl -s http://localhost:3000/api/services | jq '.data.services | length'

# Test 2: Get Cazier Fiscal
echo "2. Cazier Fiscal details:"
curl -s http://localhost:3000/api/services/cazier-fiscal | jq '{
  name: .data.service.name,
  price: .data.service.basePrice,
  optionCount: (.data.service.options | length)
}'

# Test 3: Price range
echo "3. Price range:"
curl -s "http://localhost:3000/api/services?sort=price_asc" | jq '{
  lowest: .data.services[0].basePrice,
  highest: .data.services[-1].basePrice
}'

# Test 4: Categories available
echo "4. Available categories:"
curl -s http://localhost:3000/api/services | jq '[.data.services[].category] | unique'

echo ""
echo "Verification complete!"
```

Make it executable:
```bash
chmod +x verify-services.sh
./verify-services.sh
```

---

## Notes

1. **Database Seeding:** The migration file includes INSERT statements for 3 services with all their options. Make sure this migration has been run.

2. **RLS Policies:** Services are publicly viewable when `is_active = TRUE`. No authentication needed for GET /api/services endpoints.

3. **Order Creation:** Requires authentication. You must have a valid Supabase auth session.

4. **UUIDs:** Service and option IDs are generated by the database. You need to fetch them via API first.

5. **Order Numbers:** Auto-generated in format `YYYY-NNNNNN` (e.g., 2025-000001).

6. **Payment:** Payment intents require unpaid orders. Test with Stripe test mode keys.

---

## Troubleshooting

### Services Not Found
- Check if migration 002_services.sql has been run
- Verify services are marked as `is_active = TRUE`
- Check Supabase logs for RLS policy issues

### Authentication Errors
- Ensure JWT token is valid and not expired
- Check Authorization header format: `Bearer YOUR_TOKEN`
- Verify user exists in profiles table

### Validation Errors
- CNP must be exactly 13 digits starting with 1-9
- Email must be valid email format
- Phone must be at least 10 characters
- All required fields must be provided

### Price Calculation Issues
- Verify service base_price is set correctly
- Check option price_modifier values
- Ensure selected options belong to the service
