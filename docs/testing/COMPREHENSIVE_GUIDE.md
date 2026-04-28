# Comprehensive Testing Guide — eghiseul.ro

Practical reference for the testing stack: Vitest 4 (unit + integration), Playwright (E2E), and a bash/Node smoke harness. Discipline: every behaviour change ships with a test that failed first.

**Current state (2026-04-27):** 596 unit tests, 8 integration specs, 13 E2E specs, ~17 smoke endpoints. CI green on push/PR to `main`.

---

## 1. Quick Start

```bash
# Run everything that's fast and self-contained
npm test                     # 596 unit tests, ~1-2s, no deps

# Iterating on a single change
npm run test:watch           # live re-run on file save
npm run test:ui              # Vitest dashboard in browser
npx vitest tests/unit/api/coupons-validate.test.ts   # one file only

# Targeted suites
npm run test:unit            # unit only,           ~1-2s, nothing
npm run test:integration     # opt-in, real APIs,   20-60s, dev server + GEMINI key
npm run test:e2e             # Playwright,          1-5min, auto-starts dev server
npm run test:smoke           # HTTP smoke harness,  ~10s, dev server on :3000
npm run test:all             # unit + smoke,        ~15s, dev server on :3000
```

Integration is opt-in (`RUN_INTEGRATION=1`) so accidental `npm test` never hits a real Gemini key or your local DB.

---

## 2. Architecture (4 Layers)

```
┌─────────────────────────────────────────────────────────────┐
│  E2E (Playwright)         tests/e2e/**.spec.ts              │
│  Real browser, real UI    auth, wizard, services pages      │
│  ~minutes, flaky-ish      Mobile Chrome / Safari / Firefox  │
├─────────────────────────────────────────────────────────────┤
│  Smoke (bash/Node)        scripts/api-smoke-test.mjs        │
│  Production health        17 endpoints, status-code only    │
│  ~10s                     Run against staging/prod          │
├─────────────────────────────────────────────────────────────┤
│  Integration (Vitest)     tests/integration/**.test.mjs     │
│  Real DB + real APIs      Gemini face match, order submit   │
│  20-60s, opt-in           Audit-trail + DB-invariant checks │
├─────────────────────────────────────────────────────────────┤
│  Unit (Vitest)            tests/unit/{api,lib}/**.test.ts   │
│  Isolated, all mocked     596 tests, ~1-2s                  │
│  RBAC, validators, calc.  Route handlers w/ mocked Supabase │
└─────────────────────────────────────────────────────────────┘
```

**When to use which:**

| Change | Layer |
|---|---|
| Pure function (CNP checksum, delivery date math, courier address parser) | unit `tests/unit/lib/` |
| Route handler logic (auth, validation, status transitions, DB writes) | unit `tests/unit/api/` |
| Multi-step flow that touches real DB or real Gemini | integration |
| User-visible wizard step / page render / form submit | E2E |
| "Is staging up?" / regression on critical endpoints | smoke |

Concrete examples in repo:

- `tests/unit/lib/validations/cnp.test.ts` (50 tests) — pure logic, zero mocks
- `tests/unit/api/admin-orders-process.test.ts` (19 tests) — route + auth + RBAC + Supabase mock
- `tests/integration/order-submit.test.mjs` — real `/api/orders/submit` + DB invariants + audit trail
- `tests/e2e/wizard/pf-flow.spec.ts` — full PF user journey
- `scripts/api-smoke-test.mjs` — `GET /api/services` 200, webhooks 400 unsigned, etc.

---

## 3. Adding a New Test

### TDD workflow

1. Pick the layer (table above).
2. Write the failing test first. Confirm it fails for the right reason.
3. Write the minimum code to pass.
4. Refactor. Test stays as a regression guard forever.

### Naming + folders

```
tests/unit/api/{route-name-kebab}.test.ts          # one file per route handler
tests/unit/lib/{path-mirroring-src}/{name}.test.ts # mirrors src/lib structure
tests/integration/{flow-name}.test.mjs             # end-to-end DB-touching specs
tests/e2e/{area}/{spec-name}.spec.ts               # Playwright
```

`describe('Module', () => { describe('Feature', () => { it('does X when Y') }) })`.
One assertion per behaviour. Avoid "and" in `it()` names.

### Mock pattern: Supabase route handler

This is the load-bearing pattern used in 17 route handler specs. The persistent chain captures the module-level `adminClient` even when the route grabs it once at import time.

```ts
// tests/unit/api/coupons-validate.test.ts (real, lines 5-12)
const persistentFrom = vi.fn();
const persistentClient = { from: persistentFrom };

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => persistentClient),
}));

const { POST } = await import('@/app/api/coupons/validate/route');
```

Each test re-points the chain via `mockImplementation`:

```ts
function setupCoupon(coupon: CouponRow | null, error: unknown = null) {
  persistentFrom.mockImplementation(() => ({
    select: vi.fn().mockReturnValue({
      ilike: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: coupon, error }),
        }),
      }),
    }),
  }));
}
```

Always `persistentFrom.mockReset()` in `beforeEach`.

### Mock pattern: route with auth + RBAC

```ts
// tests/unit/api/admin-orders-process.test.ts (real, lines 9-21)
const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser } }),
}));

const { requirePermission } = vi.hoisted(() => ({ requirePermission: vi.fn() }));
vi.mock('@/lib/admin/permissions', () => ({ requirePermission }));

beforeEach(() => {
  // default: authenticated admin with permission
  getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
  requirePermission.mockResolvedValue(undefined);
});
```

`vi.hoisted` is mandatory — `vi.mock` is hoisted to the top of the file by Vitest, and the factory runs before any top-level `const` would be initialised. `vi.hoisted` lets the factory close over a real reference.

### Mock pattern: Stripe

`STRIPE_SECRET_KEY` is provided to the test runner via `vitest.config.ts`'s `env` block. The exported `stripe` singleton is real; spy on its methods.

```ts
// tests/unit/lib/stripe.test.ts (real, lines 12-15)
import { createPaymentIntent, stripe } from '@/lib/stripe';

beforeEach(() => {
  vi.spyOn(stripe.paymentIntents, 'create').mockResolvedValue(
    { id: 'pi_test123', amount: 0, currency: 'ron' } as never
  );
});
```

### Mock pattern: Gemini AI

`new GoogleGenerativeAI()` is called at module scope, so the SDK has to be replaced with a real class — Vitest 4 will not let an arrow function stand in for `new`.

```ts
// tests/unit/lib/services/kyc-validation.test.ts (real, lines 6-16)
const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock('@google/generative-ai', () => {
  class FakeGoogleGenerativeAI {
    getGenerativeModel() {
      return { generateContent };
    }
  }
  return { GoogleGenerativeAI: FakeGoogleGenerativeAI };
});

import { validateCIFront } from '@/lib/services/kyc-validation';
```

Per-test you control the response with `generateContent.mockResolvedValueOnce({ response: { text: () => '{...json...}' } })`.

### Building a NextRequest

```ts
function makeRequest(body: unknown, ip = '203.0.113.1'): NextRequest {
  return new NextRequest('http://localhost:3000/api/coupons/validate', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'x-forwarded-for': ip, 'Content-Type': 'application/json' },
  });
}
```

For dynamic routes the params are a Promise (Next 16):

```ts
return POST(req, { params: Promise.resolve({ id: orderId }) });
```

---

## 4. Debugging a Failing Test

1. **Run only that file:** `npx vitest tests/unit/api/coupons-validate.test.ts`. Add `--reporter=verbose` to see every assertion.
2. **Read the assertion message before doing anything.** Vitest prints expected vs received as a diff.
3. **Verify the mock setup:** add `console.log(persistentFrom.mock.calls)` to see whether the route even hit the mock and what arguments were passed.
4. **Check `vi.hoisted` ordering:** if you see `Cannot access X before initialization`, the factory is referencing a non-hoisted const. Wrap the dependency in `vi.hoisted(() => ({ ... }))`.
5. **Confirm import order:** the `await import('@/app/api/.../route')` for the SUT must come **after** all `vi.mock` calls, otherwise the route captures the real client.
6. **Strip flakiness:** if the test passes alone but fails in suite, you have shared state. Reset all spies in `beforeEach` and `vi.restoreAllMocks()` in `afterEach`.
7. **Last resort:** `it.only(...)` + `console.error` inside the route + `vi.spyOn(console, 'error').mockImplementation(() => {})` removed temporarily.

---

## 5. Bug Fix via TDD — Real Cases (2026-04-27)

Both bugs found this round were caught by tests that were written *before* a fix. They live forever as regression guards.

### Bug 1 — `audit-logger.ts:115` GDPR PII leak (case mismatch)

The redaction list contained `'imageBase64'` (mixed case) but comparison used `key.toLowerCase()`, so the field was never redacted. Raw base64 of CI/selfie was leaking into audit logs.

The test was written first against a `metadata` containing both `email` (already lowercased) and `imageBase64`. It asserted both were redacted — the second assertion failed:

```ts
it('redacts imageBase64 (case-insensitive)', () => {
  const out = sanitizeMetadata({ imageBase64: 'AAAA...', email: 'a@b.com' });
  expect(out.imageBase64).toBe('[REDACTED]');   // FAILED
  expect(out.email).toBe('[REDACTED]');         // passed
});
```

Fix: lowercase the entry in the redaction list. Test went green. **Critical for GDPR.**

### Bug 2 — `order_history.event_type` CHECK constraint missing 6 values

The submit endpoint and 5 sibling endpoints insert audit events (`order_submitted`, `payment_rejected`, `payment_verified`, `tracking_update`, `payment_proof_submitted`, `document_generation_failed`) that violated the existing CHECK constraint. INSERTs were wrapped in try/catch in callers, so users never saw an error — but **the audit trail was silently truncated** (consent snapshot, IP, document hash on submitted orders; payment verification decisions; tracking transitions).

Caught by an integration spec that drove the real `/api/orders/submit` and then asserted the row count in `order_history`:

```ts
// tests/integration/order-submit.test.mjs (paraphrased)
it('writes order_submitted audit row with consent snapshot + IP + hash', async () => {
  await fetch(`${BASE}/api/orders/submit`, { method: 'POST', body: ... });
  const { data } = await supabase.from('order_history')
    .select('event_type, metadata')
    .eq('order_id', orderId)
    .eq('event_type', 'order_submitted');
  expect(data).toHaveLength(1);  // FAILED — CHECK constraint silently dropped row
});
```

Fix: migration `035_order_history_event_types.sql` extending the CHECK list. Test went green. **Critical for legal/GDPR compliance.**

---

## 6. CI Flow

`.github/workflows/test.yml` runs on every push and PR to `main`. Two jobs:

**Job 1 — Lint + Unit:**

1. `actions/checkout@v5`
2. `actions/setup-node@v5` (Node 22, npm cache)
3. `npm install --no-audit --no-fund` (not `ci` — tolerates `@emnapi/runtime` platform-specific deps in macOS-generated lockfile)
4. `npm run lint` (blocks on any error; tech debt cleaned 2026-04-28)
5. `npx tsc --noEmit`
6. `npm test` (with `CI=true` → retries=2, JUnit reporter)
7. Upload `tests/reports/` as artifact (14-day retention)

**Job 2 — Production Build** (depends on Job 1):

1. Same checkout + Node 22
2. `npm run build` with **dummy env vars** for every module-level constructor (Stripe, Supabase, Gemini, AWS, Oblio, Resend, SMSLink). Real values come from Vercel.

Notes:

- All actions pinned to `v5` (Node 24-compatible). `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` future-proofs through June 2026.
- `concurrency: cancel-in-progress: true` — only the latest commit per branch keeps running.
- Integration + E2E **not in CI** (slow, need real secrets). Reserved for nightly / pre-release.

---

## 7. Coverage Matrix (Snapshot)

| Domain | Unit | Integration | E2E | Smoke |
|---|:---:|:---:|:---:|:---:|
| Security (RBAC, CNP, audit, rate limit) | 133 | — | — | guard |
| Payment (Stripe, webhook, confirm) | 37 | — | — | unsigned 400 |
| Delivery + Document gen + Oblio + Courier utils | 173 | — | — | — |
| KYC (face match, validation) | 23 | 2 (real Gemini) | — | — |
| Admin (orders, AWB, coupons, invite, RBAC) | 95 | — | — | guard |
| Courier (quote, AWB, cron, tracking) | 119 | — | — | quote |
| User CRUD (addresses, billing, KYC, profile) | 75 | — | — | — |
| UI flows (auth, wizard, services) | — | — | 13 specs | services |

Full breakdown + gap list in `tests/README.md`.

---

## 8. Rules & Conventions

- **TDD for bugs and new features.** Test first, fail for the right reason, then fix.
- **Characterization for legacy code.** When wrapping untested code, write a test that pins down current behaviour before changing anything.
- **Mock at boundaries only:** HTTP, DB, AI SDK, S3 SDK. Don't mock your own helpers — call them and let them run.
- **One assertion per behaviour.** `it('does X when Y')`. Never use "and" in the name.
- **No shared mutable state across tests.** `beforeEach` resets, `afterEach` restores.
- **Romanian for UI text in assertions** (`expect(error).toMatch(/expirat/i)`), English for variable names and comments.
- **Snake_case on DB rows, camelCase in TypeScript** — apply to test fixtures too.
- **Commit test + fix together.** A test alone doesn't prove the fix shipped.

---

## 9. Anti-patterns (Real Mistakes, Don't Repeat)

- **`let captured = ...` reassigned across closures inside `mockImplementation`.** TypeScript will let you, but a stale closure will read the old value. Prefer `const captured: Record<string, unknown> = {}` and mutate, or `const calls: Args[] = []; calls.push(args)`.
- **Mocking your own implementation.** Don't `vi.mock('@/lib/delivery-calculator')` from the route test — you stop testing the real path. Mock only the thing the route doesn't own (Supabase, Stripe, Gemini).
- **Asserting on cache contents or in-memory rate limiter buckets without resetting.** Tests pollute each other. Either reset module state in `beforeEach`, or use a unique key (e.g. random IP) per test — see `tests/unit/api/coupons-validate.test.ts:275`.
- **Forgetting `vi.hoisted` and getting `Cannot access X before initialization`.** Any reference inside `vi.mock(...)` factory must come from `vi.hoisted` or be inline.
- **Importing the route at the top of the file.** The mock has to be registered first. Use `const { POST } = await import('@/app/.../route')` *after* all `vi.mock` calls.
- **Asserting on internal mock-fn calls instead of observable behaviour.** Bad: `expect(supabase.from).toHaveBeenCalledTimes(3)`. Good: `expect(res.status).toBe(200)` plus one `toHaveBeenCalledWith` for the boundary call you actually care about.
- **Snapshot-testing route response bodies.** Snapshots rot and people accept the diff blindly. Assert on the specific field that documents the behaviour.
- **Skipping the failing-test step.** "I'll test it after I fix it" — you have no proof the test fails for the right reason, so you have no proof the fix works.

---

## 10. Resources

- Vitest 4 docs — https://vitest.dev/
- Playwright docs — https://playwright.dev/docs/intro
- Next.js 16 route testing — https://nextjs.org/docs/app/building-your-application/testing
- Supabase types regen — `npx supabase gen types typescript --project-id llbwmitdrppomeptqlue > src/types/supabase.ts`
- Project docs index — `docs/README.md`
- Test inventory + gap matrix — `tests/README.md`
- DB migration guide — `docs/deployment/DATABASE_MIGRATIONS.md`
- RBAC reference (for permission mocks) — `docs/admin/rbac-permissions.md`

---

**Last updated:** 2026-04-27
**Maintained alongside:** `tests/README.md`, `.github/workflows/test.yml`, `vitest.config.ts`
