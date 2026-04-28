# Tests — eGhiseul.ro

Comprehensive test infrastructure: unit, integration, E2E, and smoke tests.
Goal: every behavior change has a test that fails first, then passes once shipped.

**Stare 2026-04-28:** 596 unit tests + 8 integration + 13 E2E + 17 smoke = ~634 cazuri test
distincte. CI verde cu lint/tsc/tests/build blocking. 0 erori TS, 0 erori ESLint
(3 warnings informaționale React Compiler pentru librării externe).

## Layout

```
tests/
├── unit/                                          596 unit tests, ~1-2s
│   ├── api/
│   │   ├── admin-cancel-awb.test.ts               (8)  /api/admin/orders/[id]/cancel-awb — graceful degradation
│   │   ├── admin-coupons.test.ts                  (17) /api/admin/coupons — list/create/PATCH/DELETE
│   │   ├── admin-generate-awb.test.ts             (10) /api/admin/orders/[id]/generate-awb — idempotency, locker delivery
│   │   ├── admin-invite-accept.test.ts            (7)  /api/admin/invite/accept — token validation, auto-expire, idempotency
│   │   ├── admin-invite.test.ts                   (21) /api/admin/users/invite — RBAC, email validation, duplicate detection
│   │   ├── admin-orders-process.test.ts           (19) /api/admin/orders/[id]/process — status transitions
│   │   ├── admin-verify-payment.test.ts           (13) /api/admin/orders/[id]/verify-payment — bank transfer admin flow
│   │   ├── coupons-validate.test.ts               (21) /api/coupons/validate — public coupon flow
│   │   ├── courier-quote.test.ts                  (15) /api/courier/quote — multi-provider pricing
│   │   ├── cron-update-tracking.test.ts           (7)  /api/cron/update-tracking — CRON_SECRET + filter logic
│   │   ├── orders-confirm-payment.test.ts         (11) /api/orders/[id]/confirm-payment
│   │   ├── orders-tracking.test.ts                (8)  /api/orders/[id]/tracking — access control + cache TTL
│   │   ├── user-addresses.test.ts                 (16) /api/user/addresses — CRUD with IDOR protection
│   │   ├── user-billing-profiles.test.ts          (13) /api/user/billing-profiles — PF/PJ types
│   │   ├── user-kyc-save.test.ts                  (17) /api/user/kyc/save — versioning + expiry logic
│   │   ├── user-profile.test.ts                   (8)  /api/user/profile — PATCH/GET, snake_case mapping
│   │   └── webhooks-stripe.test.ts                (8)  /api/webhooks/stripe security
│   └── lib/
│       ├── admin/permissions.test.ts              (37) RBAC role + JSONB + implied
│       ├── delivery-calculator.test.ts            (43) holidays, noon cutoff, courier matrix
│       ├── documents/generator.test.ts            (39) PF/PJ legal block, delivery terms, institutions
│       ├── images/compress.test.ts                (9)  HEIC reject + compressedToFile
│       ├── kyc/face-match.test.ts                 (10) runFaceMatch + fetchImageAsBase64
│       ├── oblio/invoice.test.ts                  (20) PF/PJ invoice, vatPayer logic, line items
│       ├── security/audit-logger.test.ts          (32) GDPR PII redaction + DB persistence
│       ├── security/rate-limiter.test.ts          (14) windowing + IP extraction
│       ├── services/courier-utils.test.ts         (71) packages, address, phone, tracking, VAT, counties
│       ├── services/infocui.test.ts               (21) CUI Romanian checksum, ANAF + county/address parsing
│       ├── services/kyc-validation.test.ts        (13) Gemini orchestration (CIFront/Back/Selfie)
│       ├── stripe.test.ts                         (18) payment intent + customer + CNP masking
│       └── validations/cnp.test.ts                (50) checksum + gender×century + edge dates
├── integration/                                   Real DB/API/Gemini, opt-in via RUN_INTEGRATION=1
│   ├── kyc-face-match.test.mjs                    (3) end-to-end Gemini face match
│   └── order-submit.test.mjs                      (6) draft → patch → submit → DB invariants + audit trail
├── e2e/                                           Playwright browser automation — separate runner
│   ├── auth/, smoke/, wizard/, orders/, services/, api/
└── reports/                                       Output (JUnit XML, HTML, screenshots) — gitignored
```

Plus `scripts/api-smoke-test.mjs` — standalone HTTP smoke harness with summary table (~17 endpoints).

## Quick reference

| Command | Runs | Speed | Needs |
|---------|------|-------|-------|
| `npm test` | All 596 unit tests | ~1-2s | nothing |
| `npm run test:watch` | Unit tests in watch mode | live | nothing |
| `npm run test:ui` | Vitest UI dashboard | live | nothing |
| `npm run test:unit` | Just `tests/unit/**` | ~1-2s | nothing |
| `npm run test:integration` | `tests/integration/**` (real Gemini, DB) | 20-60s | dev server on :3000, GEMINI key |
| `npm run test:smoke` | `scripts/api-smoke-test.mjs` | ~10s | dev server on :3000 |
| `npm run test:e2e` | Playwright (multi-browser) | 1-5min | dev server (auto-starts) |
| `npm run test:all` | unit + smoke | ~15s | dev server on :3000 |

## Adding a test (TDD discipline)

1. **Write the failing test first.** Don't write code, then test — that proves nothing.
2. **Run it.** It must fail because the code doesn't exist yet (or fails for the expected reason).
3. **Write the minimum code** to make it pass.
4. **Refactor** with confidence — the test catches regressions.

Example for a new lib helper:

```ts
// tests/unit/lib/foo/bar.test.ts
import { describe, expect, it } from 'vitest';
import { bar } from '@/lib/foo/bar';

describe('bar', () => {
  it('returns frob when given baz', () => {
    expect(bar('baz')).toBe('frob');
  });
});
```

Run only that file while iterating:

```bash
npx vitest tests/unit/lib/foo/bar.test.ts
```

## Test categories

### Unit (`tests/unit/`) — fast, isolated

- No network, no DB, no real APIs
- Mock external dependencies with `vi.stubGlobal('fetch', vi.fn())` etc.
- Browser APIs (DOM, canvas) need `// @vitest-environment jsdom` at top of file
- One assertion per behavior, descriptive names ("returns X when Y"), avoid "and"

### Integration (`tests/integration/`) — real services, opt-in

- Hits real `/api/*` endpoints on `http://localhost:3000` (override via `TEST_BASE_URL`)
- May call real Gemini, real Stripe test mode, real Supabase
- Skipped by default (`describe.runIf(process.env.RUN_INTEGRATION === '1')`)
- Run before releases or when touching auth/payment/KYC code

For KYC face-match testing, image paths default to operator's local Downloads;
override per environment with `KYC_TEST_CI`, `KYC_TEST_SELFIE_OK`, `KYC_TEST_SELFIE_WRONG`.

### E2E (`tests/e2e/`) — Playwright

- Real browser, real UI, real wizard flow
- Configured for Chromium + Firefox + WebKit + Mobile Chrome + Mobile Safari
- Auto-starts dev server (`webServer` block in `playwright.config.ts`)
- Use for: page renders, navigation, form submission, click paths
- Don't use for: pure logic (use unit), slow data validation (use integration)

### Smoke (`scripts/api-smoke-test.mjs`) — production health check

- Hits ~17 critical endpoints with expected status checks
- Designed to run against staging or production with `BASE_URL=https://...`
- Exit code 0 = all green, 1 = any failure

## Bug fix workflow

1. **Reproduce in a test first.** Write the smallest failing test that demonstrates the bug.
   - Pure logic bug → unit test
   - API behavior bug → integration test
   - User-flow bug → E2E test
2. Confirm it fails for the *right reason* (the bug, not a typo).
3. Fix the code.
4. Confirm the test passes.
5. Run the relevant suite (`npm test`) to confirm no regression.
6. Commit test + fix together.

The test stays forever as a regression guard.

## Environment variables

| Var | Purpose | Default |
|-----|---------|---------|
| `RUN_INTEGRATION` | Enable integration tests (real APIs) | unset |
| `TEST_BASE_URL` | Base URL for integration/smoke targets | `http://localhost:3000` |
| `BASE_URL` | (Playwright only) base URL for E2E | `http://localhost:3000` |
| `CI` | Sets retries=2, workers=1, JUnit reporter | unset |
| `KYC_TEST_CI` | Path to test CI image | local Downloads |
| `KYC_TEST_SELFIE_OK` | Path to matching selfie | local Downloads |
| `KYC_TEST_SELFIE_WRONG` | Path to mismatched selfie | local Downloads |

## What's covered today (2026-04-27)

### 🔴 Security (well-covered)
| Area | Unit | Integration | E2E | Smoke |
|------|:----:|:-----------:|:---:|:-----:|
| RBAC permissions | ✅ 37 tests | — | — | ✅ admin guard |
| CNP validation (checksum, dates, county) | ✅ 50 tests | — | — | — |
| Audit logging (GDPR PII redaction) | ✅ 32 tests | — | — | — |
| Rate limiting | ✅ 14 tests | — | — | — |

### 💳 Payment (well-covered)
| Area | Unit | Integration | E2E | Smoke |
|------|:----:|:-----------:|:---:|:-----:|
| Stripe payment intent (cents, customer, CNP mask) | ✅ 18 tests | — | — | — |
| Stripe webhook signature (rejection paths) | ✅ 8 tests | — | — | ✅ unsigned 400 |
| Confirm-payment fallback | ✅ 11 tests | — | — | — |

### 📦 Business critical
| Area | Unit | Integration | E2E | Smoke |
|------|:----:|:-----------:|:---:|:-----:|
| Delivery calculator (holidays, cutoff, courier matrix) | ✅ 43 tests | — | — | — |
| Document generator (PF/PJ legal block, delivery terms) | ✅ 39 tests | — | — | — |
| Courier utils (package, address, phone, tracking, VAT) | ✅ 71 tests | — | — | — |
| Oblio invoice (PF/PJ, vatPayer, line items) | ✅ 20 tests | — | — | — |
| KYC face match orchestration | ✅ 10 tests | ✅ 2 (real Gemini) | — | — |
| KYC validation services (CI/selfie via Gemini) | ✅ 13 tests | — | — | — |
| Image compression | ✅ 9 tests | — | — | — |

### 🛡️ Admin endpoints
| Area | Unit | Integration | E2E | Smoke |
|------|:----:|:-----------:|:---:|:-----:|
| Order processing (status transitions, doc upload) | ✅ 19 tests | — | — | ✅ |
| Bank transfer payment verification (approve/reject) | ✅ 13 tests | — | — | — |
| AWB generation (FAN/Sameday, idempotency, locker) | ✅ 10 tests | — | — | — |
| AWB cancellation (graceful courier-fail degradation) | ✅ 8 tests | — | — | — |
| Coupon CRUD (admin list/create/PATCH/DELETE) | ✅ 17 tests | — | — | — |
| Employee invite (RBAC + email validation + dup-check) | ✅ 21 tests | — | — | — |
| RBAC enforcement on admin routes | ✅ via `permissions.ts` (37) | — | — | ✅ guard |

### 🚚 Courier integration (A-Z)
| Area | Unit | Integration | E2E | Smoke |
|------|:----:|:-----------:|:---:|:-----:|
| Multi-provider quote `/api/courier/quote` | ✅ 15 tests | — | — | ✅ |
| Admin AWB generation (idempotency + locker) | ✅ 10 tests | — | — | — |
| Admin AWB cancellation (graceful) | ✅ 8 tests | — | — | — |
| Cron tracking refresh (CRON_SECRET + active filter) | ✅ 7 tests | — | — | — |
| Customer tracking display (cache + final-status skip) | ✅ 8 tests | — | — | — |
| Provider utils (packages, address, phone, status norm) | ✅ 71 tests | — | — | — |

### 👤 User CRUD
| Area | Unit | Integration | E2E | Smoke |
|------|:----:|:-----------:|:---:|:-----:|
| User addresses (list/create/update/delete + IDOR) | ✅ 16 tests | — | — | — |
| User billing profiles (PF/PJ types + IDOR) | ✅ 13 tests | — | — | — |
| User profile (PATCH/GET, snake_case mapping) | ✅ 8 tests | — | — | — |
| User KYC save (versioning, expiry, document types) | ✅ 17 tests | — | — | — |
| Public coupon validation (rate limit + business rules) | ✅ 21 tests | — | — | — |

### 🌐 UI / Routes
| Area | Unit | Integration | E2E | Smoke |
|------|:----:|:-----------:|:---:|:-----:|
| Auth flows (login/register/forgot) | — | — | ✅ 3 specs | — |
| Wizard PF flow + UI elements | — | — | ✅ 2 specs | — |
| Public/services routes | — | — | ✅ 5 specs | ✅ harness |
| Order flow E2E | — | — | ✅ 2 specs | — |
| OCR extraction | — | — | — | ✅ |

### ⚪ Gaps (not yet covered — TODO future rounds)
| Area | Why important | Priority |
|------|---------------|----------|
| Sameday + FanCourier provider class internals (auth, getQuotes, createShipment HTTP payloads) | Internals not directly tested — covered indirectly via routes | 🟢 LOW (integration with API mock) |
| Admin doc-generation `/api/admin/orders/[id]/generate-document` | DOCX helpers acoperiți; route still uses helpers + S3 | 🟢 LOW |
| Cetățean străin flow | Currently covered ad-hoc in `scripts/test-cetatean-strain.mjs` | 🟢 LOW (migrate) |

### 🐛 Bugs found by these tests (and fixed)
1. **`audit-logger.ts:115` PII redaction case bug** — list contained `'imageBase64'` (mixed case) but comparison used `key.toLowerCase()`, so `imageBase64` field was never redacted. Raw base64 of CI/selfie was leaking into audit logs. Fixed via lowercase entry. **Critical for GDPR.**
2. **`order_history.event_type` CHECK constraint missing 6 values** — caught by `tests/integration/order-submit.test.mjs`. The submit endpoint and 5 other endpoints insert audit events (`order_submitted`, `payment_rejected`, `payment_verified`, `tracking_update`, `payment_proof_submitted`, `document_generation_failed`) that violate the existing CHECK constraint. The INSERTs are wrapped in try/catch in callers, so the constraint violations did not surface as user-visible errors but **silently truncated the audit trail** (consent snapshot, IP, document hash for submitted orders; payment verification decisions; tracking transitions). Fixed via migration `035_order_history_event_types.sql`. **Critical for legal/GDPR compliance.**

## Migrating existing scripts to proper tests

`scripts/test-*.mjs` were ad-hoc verification harnesses. Going forward, new
verification belongs in `tests/integration/` so it runs via `npm run test:integration`
in CI. Legacy scripts kept for one-off CLI debugging.

## Pre-commit / CI (future)

Recommended GitHub Actions:

```yaml
# .github/workflows/test.yml (NOT YET CREATED)
- name: Lint
  run: npm run lint
- name: Unit tests
  run: npm test
- name: Build
  run: npm run build
```

Integration + E2E reserved for nightly or pre-release runs (slow + need secrets).
