#!/bin/bash

# eGhiseul.ro API Endpoint Testing Script
# This script tests all public and authenticated API endpoints
# Server should be running at http://localhost:3000

BASE_URL="http://localhost:3000"
RESULTS_FILE="api-test-results.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================" | tee $RESULTS_FILE
echo "eGhiseul.ro API Endpoint Testing" | tee -a $RESULTS_FILE
echo "Started at: $(date)" | tee -a $RESULTS_FILE
echo "========================================" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local auth_header=$4
    local data=$5

    echo -e "\n${YELLOW}Testing:${NC} $description" | tee -a $RESULTS_FILE
    echo "Endpoint: $method $endpoint" | tee -a $RESULTS_FILE

    if [ -z "$data" ]; then
        if [ -z "$auth_header" ]; then
            response=$(curl -s -w "\n\nHTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}" \
                -X $method \
                -H "Content-Type: application/json" \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n\nHTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}" \
                -X $method \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth_header" \
                "$BASE_URL$endpoint")
        fi
    else
        if [ -z "$auth_header" ]; then
            response=$(curl -s -w "\n\nHTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}" \
                -X $method \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n\nHTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}" \
                -X $method \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth_header" \
                -d "$data" \
                "$BASE_URL$endpoint")
        fi
    fi

    http_code=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    time_total=$(echo "$response" | grep "TIME_TOTAL:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_STATUS:/,$d')

    echo "HTTP Status: $http_code" | tee -a $RESULTS_FILE
    echo "Response Time: ${time_total}s" | tee -a $RESULTS_FILE

    # Check if response is valid JSON
    if echo "$body" | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Valid JSON response" | tee -a $RESULTS_FILE
        echo "Response:" | tee -a $RESULTS_FILE
        echo "$body" | jq . | tee -a $RESULTS_FILE
    else
        echo -e "${RED}✗${NC} Invalid JSON response" | tee -a $RESULTS_FILE
        echo "Response:" | tee -a $RESULTS_FILE
        echo "$body" | tee -a $RESULTS_FILE
    fi

    echo "----------------------------------------" | tee -a $RESULTS_FILE
}

# ========================================
# PUBLIC ENDPOINTS
# ========================================
echo -e "\n${GREEN}========================================${NC}" | tee -a $RESULTS_FILE
echo -e "${GREEN}TESTING PUBLIC ENDPOINTS${NC}" | tee -a $RESULTS_FILE
echo -e "${GREEN}========================================${NC}" | tee -a $RESULTS_FILE

# Test 1: Get all services
test_endpoint "GET" "/api/services" "List all services (public)"

# Test 2: Get all services with category filter
test_endpoint "GET" "/api/services?category=fiscale" "List services filtered by category (fiscale)"

# Test 3: Get all services with sorting
test_endpoint "GET" "/api/services?sort=price_asc" "List services sorted by price (ascending)"

# Test 4: Get all services with pagination
test_endpoint "GET" "/api/services?limit=5&offset=0" "List services with pagination (limit=5)"

# Test 5: Get specific service by slug
test_endpoint "GET" "/api/services/cazier-fiscal" "Get specific service (cazier-fiscal)"

# Test 6: Get non-existent service
test_endpoint "GET" "/api/services/non-existent-service" "Get non-existent service (should return 404)"

# ========================================
# AUTHENTICATED ENDPOINTS (without auth)
# ========================================
echo -e "\n${GREEN}========================================${NC}" | tee -a $RESULTS_FILE
echo -e "${GREEN}TESTING AUTH-REQUIRED ENDPOINTS (No Auth)${NC}" | tee -a $RESULTS_FILE
echo -e "${GREEN}Should return 401 Unauthorized${NC}" | tee -a $RESULTS_FILE
echo -e "${GREEN}========================================${NC}" | tee -a $RESULTS_FILE

# Test 7: List orders without auth
test_endpoint "GET" "/api/orders" "List orders without authentication (should return 401)"

# Test 8: Create order without auth
order_data='{
  "serviceId": "00000000-0000-0000-0000-000000000000",
  "customerData": {
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "0712345678"
  }
}'
test_endpoint "POST" "/api/orders" "Create order without authentication (should return 401)" "" "$order_data"

# Test 9: Get order by ID without auth
test_endpoint "GET" "/api/orders/00000000-0000-0000-0000-000000000000" "Get order without authentication (should return 401)"

# Test 10: Create payment intent without auth
test_endpoint "POST" "/api/orders/00000000-0000-0000-0000-000000000000/payment" "Create payment intent without auth (should return 401)"

# ========================================
# ERROR HANDLING TESTS
# ========================================
echo -e "\n${GREEN}========================================${NC}" | tee -a $RESULTS_FILE
echo -e "${GREEN}TESTING ERROR HANDLING${NC}" | tee -a $RESULTS_FILE
echo -e "${GREEN}========================================${NC}" | tee -a $RESULTS_FILE

# Test 11: Invalid category parameter
test_endpoint "GET" "/api/services?category=invalid_category" "Invalid category parameter"

# Test 12: Invalid sort parameter
test_endpoint "GET" "/api/services?sort=invalid_sort" "Invalid sort parameter"

# Test 13: Very large limit parameter
test_endpoint "GET" "/api/services?limit=10000" "Very large limit (should cap at 100)"

# Test 14: Negative offset
test_endpoint "GET" "/api/services?offset=-10" "Negative offset"

# ========================================
# SUMMARY
# ========================================
echo -e "\n${GREEN}========================================${NC}" | tee -a $RESULTS_FILE
echo -e "${GREEN}TEST SUMMARY${NC}" | tee -a $RESULTS_FILE
echo -e "${GREEN}========================================${NC}" | tee -a $RESULTS_FILE
echo "Completed at: $(date)" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE
echo "Full results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE
echo -e "${YELLOW}Note:${NC} Authenticated endpoints require a valid JWT token." | tee -a $RESULTS_FILE
echo "To test authenticated endpoints, obtain a token and set:" | tee -a $RESULTS_FILE
echo "  JWT_TOKEN=\"your-token-here\"" | tee -a $RESULTS_FILE
echo "Then run authenticated tests with the token." | tee -a $RESULTS_FILE
