# Testing Documentation

This folder contains all testing-related documentation and scripts for eGhiseul.ro.

## Contents

| File | Description |
|------|-------------|
| `API-TEST-MANUAL.md` | Complete API testing guide with curl examples |
| `test-api-endpoints.sh` | Full automated test suite |
| `quick-api-tests.sh` | Quick validation script |

## E2E Tests (Playwright)

**Locație:** `/tests/` (root folder)

Vezi documentația completă la:
- `/tests/README.md` - Quick start și rezultate teste
- `/tests/docs/VISUAL_TEST_REPORT.md` - Raport vizual complet cu screenshots

### Rezultate Recente (2026-01-07)

| Test | Status |
|------|--------|
| OCR cu CI real | ✅ PASS - 100% accuracy |
| Auto-fill formular | ✅ PASS |
| Wizard complet (8 pași) | ✅ PASS |
| Creare cont din comandă | ✅ PASS |
| Auto-login | ⚠️ Necesită dezactivare email confirmation |

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

### Playwright E2E Tests
```bash
cd tests
npm install
npx playwright test --project=chromium
```

## Test Results

Results are saved to `api-test-results.txt` after running the full test suite.

---
**Last Updated:** 2026-01-07
