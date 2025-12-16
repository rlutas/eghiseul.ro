# API Testing Guide - eGhiseul.ro

This directory contains comprehensive API testing resources for the eGhiseul.ro application.

## Quick Start (30 seconds)

```bash
# 1. Ensure dev server is running
npm run dev

# 2. Run quick tests
chmod +x quick-api-tests.sh
./quick-api-tests.sh
```

You should see output showing 5 successful API tests with JSON responses.

---

## Files Overview

### Test Scripts (Executable)

| File | Tests | Duration | Purpose |
|------|-------|----------|---------|
| **quick-api-tests.sh** | 5 | ~10s | Fast validation of basic functionality |
| **test-api-endpoints.sh** | 14 | ~30s | Comprehensive test suite with error cases |

### Documentation (Reference)

| File | Pages | Purpose |
|------|-------|---------|
| **API-TESTING-SUMMARY.md** | 10 | Quick start guide (read this first) |
| **API-TEST-MANUAL.md** | 15 | Detailed manual testing guide with curl commands |
| **API-TEST-REPORT.md** | 30 | Complete API documentation and analysis |
| **TEST-DATA-REFERENCE.md** | 12 | Actual test data from database |
| **API-TESTING-README.md** | 2 | This file |

---

## Testing Workflow

### Step 1: Quick Validation (Required)

Verify the API is working with basic tests:

```bash
./quick-api-tests.sh
```

**Expected Output:**
- ✅ Test 1: GET /api/services - Returns 3 services
- ✅ Test 2: GET /api/services/cazier-fiscal - Returns service details
- ✅ Test 3: Filter by category - Returns filtered results
- ✅ Test 4: Sort by price - Returns sorted results
- ✅ Test 5: Error handling - Returns 404 for non-existent service

**If any test fails, see the Troubleshooting section in API-TESTING-SUMMARY.md**

---

### Step 2: Comprehensive Testing (Optional)

Run the full test suite including error cases:

```bash
./test-api-endpoints.sh
```

**Expected Output:**
- 6 public endpoint tests
- 4 authentication tests (should return 401)
- 4 error handling tests
- Results saved to `api-test-results.txt`

---

### Step 3: Manual Testing (As Needed)

Use the detailed guides for specific testing scenarios:

**For curl commands:** See `API-TEST-MANUAL.md`
- Individual endpoint testing
- Authentication testing
- Validation testing
- Payment testing

**For test data:** See `TEST-DATA-REFERENCE.md`
- Service IDs and slugs
- Available options
- Price calculations
- Sample request bodies

**For API documentation:** See `API-TEST-REPORT.md`
- Complete endpoint documentation
- Request/response schemas
- Error codes
- Security considerations

---

## What Gets Tested

### Public Endpoints (No Auth Required)

✅ **GET /api/services**
- List all active services
- Filter by category
- Sort by price
- Pagination

✅ **GET /api/services/[slug]**
- Get service details
- Include service options
- Error handling for non-existent services

### Authenticated Endpoints (JWT Required)

⚠️ **Require valid JWT token to test:**

- POST /api/orders - Create new order
- GET /api/orders - List user's orders
- GET /api/orders/[id] - Get order details
- PATCH /api/orders/[id] - Update order (admin only)
- POST /api/orders/[id]/payment - Create payment intent

**To test these:** See "Authentication Testing" section in API-TESTING-SUMMARY.md

---

## Available Test Services

The database includes 3 test services:

1. **Cazier Fiscal** (149.00 RON)
   - Slug: `cazier-fiscal`
   - Category: fiscale
   - 4 options available

2. **Extras Carte Funciară** (99.00 RON)
   - Slug: `extras-carte-funciara`
   - Category: imobiliare
   - 2 options available

3. **Certificat Constatator** (129.00 RON)
   - Slug: `certificat-constatator`
   - Category: comerciale
   - 2 options available

**See TEST-DATA-REFERENCE.md for complete details**

---

## Success Criteria

Your API is working correctly if:

- ✅ All quick tests pass (5/5)
- ✅ Services endpoint returns 3 services
- ✅ Each service has correct price and category
- ✅ Service details include options array
- ✅ Error handling returns proper 404 responses
- ✅ Response times are < 500ms
- ✅ All responses are valid JSON

---

## Common Issues

### "Services not found" (Empty array)

**Solution:** Run database migration
```bash
# In Supabase SQL Editor, run:
# supabase/migrations/002_services.sql
```

### "Connection refused"

**Solution:** Start the dev server
```bash
npm run dev
```

### "Unauthorized" errors

**Solution:** You're testing authenticated endpoints without a token. Either:
1. Use the public endpoints first
2. Get a JWT token (see API-TESTING-SUMMARY.md)

### "jq: command not found"

**Solution:** Install jq for JSON formatting
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

---

## Next Steps

After running the tests:

1. **Review Results**
   - Check `api-test-results.txt` for detailed output
   - Verify all tests passed
   - Note any slow response times

2. **Test Authenticated Endpoints** (Optional)
   - Set up authentication
   - Get JWT token
   - Test order creation and management

3. **Test Stripe Integration** (Optional)
   - Configure Stripe keys
   - Test payment intent creation
   - Use Stripe CLI for webhook testing

4. **Performance Testing** (Optional)
   - Use Apache Bench or similar tools
   - Test under load
   - Monitor database performance

---

## File Descriptions

### quick-api-tests.sh
**What it does:** Runs 5 essential tests to verify the API is working
**When to use:** Every time you make API changes or start testing
**Output:** Console output with JSON responses and HTTP status codes

### test-api-endpoints.sh
**What it does:** Comprehensive test suite with 14 tests including error cases
**When to use:** Before deploying or when you need thorough validation
**Output:** Console output + saved to api-test-results.txt

### API-TESTING-SUMMARY.md
**What it contains:** Quick start guide, test checklist, troubleshooting
**When to read:** First time testing or when encountering issues
**Format:** Markdown documentation

### API-TEST-MANUAL.md
**What it contains:** Detailed curl commands for each endpoint
**When to use:** When you need to test specific endpoints manually
**Format:** Markdown with code examples

### API-TEST-REPORT.md
**What it contains:** Complete API documentation and analysis
**When to read:** When you need detailed information about endpoints
**Format:** Technical documentation

### TEST-DATA-REFERENCE.md
**What it contains:** Actual test data from database migrations
**When to use:** When you need service IDs, option IDs, or sample data
**Format:** Reference guide with examples

---

## Getting Help

1. **For quick issues:** Check API-TESTING-SUMMARY.md troubleshooting section
2. **For endpoint details:** See API-TEST-REPORT.md
3. **For test data:** See TEST-DATA-REFERENCE.md
4. **For manual testing:** See API-TEST-MANUAL.md

---

## Testing Checklist

Before marking API testing as complete:

- [ ] Dev server is running (npm run dev)
- [ ] Database migrations have been run
- [ ] Quick tests pass (5/5)
- [ ] Services endpoint returns 3 services
- [ ] Each service has correct data
- [ ] Error handling works correctly
- [ ] Response times are acceptable (< 500ms)
- [ ] (Optional) Authenticated endpoints tested
- [ ] (Optional) Payment integration tested
- [ ] (Optional) Performance testing completed

---

## Summary

You have everything you need to test the eGhiseul.ro API:

- ✅ Automated test scripts
- ✅ Detailed documentation
- ✅ Test data reference
- ✅ Troubleshooting guides
- ✅ Manual testing commands

**Start with quick-api-tests.sh and go from there!**

---

*Generated: 2025-12-16*
*For: eGhiseul.ro API Testing*
*Version: 1.0*
