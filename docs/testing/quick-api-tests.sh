#!/bin/bash

# Quick API Tests for eGhiseul.ro
# Run this script to test the two main public endpoints

echo "========================================="
echo "eGhiseul.ro - Quick API Tests"
echo "========================================="
echo ""

BASE_URL="http://localhost:3000"

echo "Test 1: GET /api/services"
echo "----------------------------------------"
curl -X GET "$BASE_URL/api/services" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\nTime: %{time_total}s\n\n" \
  -s | jq .

echo ""
echo "========================================="
echo ""

echo "Test 2: GET /api/services/cazier-fiscal"
echo "----------------------------------------"
curl -X GET "$BASE_URL/api/services/cazier-fiscal" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\nTime: %{time_total}s\n\n" \
  -s | jq .

echo ""
echo "========================================="
echo ""

echo "Test 3: GET /api/services (with category filter)"
echo "----------------------------------------"
curl -X GET "$BASE_URL/api/services?category=fiscale" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\nTime: %{time_total}s\n\n" \
  -s | jq .

echo ""
echo "========================================="
echo ""

echo "Test 4: GET /api/services (with sorting)"
echo "----------------------------------------"
curl -X GET "$BASE_URL/api/services?sort=price_asc&limit=5" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\nTime: %{time_total}s\n\n" \
  -s | jq .

echo ""
echo "========================================="
echo ""

echo "Test 5: GET /api/services/non-existent (should 404)"
echo "----------------------------------------"
curl -X GET "$BASE_URL/api/services/non-existent-service" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\nTime: %{time_total}s\n\n" \
  -s | jq .

echo ""
echo "========================================="
echo "Tests completed!"
echo "========================================="
