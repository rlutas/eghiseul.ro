# Testing Documentation

This folder contains all testing-related documentation and scripts for eGhiseul.ro.

## Contents

| File | Description |
|------|-------------|
| `API-TEST-MANUAL.md` | Complete API testing guide with curl examples |
| `test-api-endpoints.sh` | Full automated test suite |
| `quick-api-tests.sh` | Quick validation script |

## Running Tests

### Prerequisites
- Dev server running at `http://localhost:3000`
- Database migrations applied
- Test data seeded

### Quick Test
```bash
chmod +x quick-api-tests.sh
./quick-api-tests.sh
```

### Full Test Suite
```bash
chmod +x test-api-endpoints.sh
./test-api-endpoints.sh
```

## Test Results

Results are saved to `api-test-results.txt` after running the full test suite.

---
**Last Updated:** 2025-12-16
