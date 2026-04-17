#!/usr/bin/env node
/**
 * Unit-test style script for src/lib/delivery-calculator.ts
 *
 * Run with:  node scripts/test-delivery-calculator.mjs
 *
 * Asserts:
 *  - Noon cutoff: order at 11:59 vs 12:01 Romania-local gives different starts
 *  - 1 May 2026 (Fri) is a holiday; next business day = 4 May 2026 (Mon)
 *  - Orthodox Easter 2027: 2 May (Sun) + 3 May Lunea Paștilor (Mon) skipped
 *  - Crăciun 2026: 25 Dec (Fri) + 26 Dec (Sat) + 27 Dec (Sun) → next bd = 28 Dec (Mon)
 *  - Add 3 business days to 2026-05-27 (Wed) = 2026-06-01 (Mon)
 *
 * Uses Node's --experimental-strip-types so the TypeScript source can be
 * imported directly without a build step.
 */

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

// If we weren't launched with --experimental-strip-types, re-exec ourselves
// with the flag so `import(...ts)` works on Node versions that still gate it.
if (!process.execArgv.some((a) => a.includes('strip-types'))) {
  const r = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--no-warnings', fileURLToPath(import.meta.url)],
    { stdio: 'inherit' }
  )
  process.exit(r.status ?? 1)
}

const modPath = resolve(__dirname, '../src/lib/delivery-calculator.ts')
const {
  calculateEstimatedCompletion,
  isRomanianHoliday,
  addBusinessDays,
  getProcessingStartISO,
  ROMANIAN_HOLIDAYS_2026_2028,
} = await import(modPath)

// ─── Minimal assert helpers ─────────────────────────────────────────────────

let passed = 0
let failed = 0
const failures = []

function assertEq(actual, expected, label) {
  const a = typeof actual === 'object' ? JSON.stringify(actual) : String(actual)
  const e = typeof expected === 'object' ? JSON.stringify(expected) : String(expected)
  if (a === e) {
    passed++
    console.log(`  PASS  ${label}`)
  } else {
    failed++
    failures.push({ label, actual: a, expected: e })
    console.log(`  FAIL  ${label}\n        expected: ${e}\n        actual:   ${a}`)
  }
}

function assertTrue(cond, label) {
  assertEq(Boolean(cond), true, label)
}

// Helper: construct a Date that corresponds to a given Romania-local wall clock.
// Europe/Bucharest is UTC+2 (standard) or UTC+3 (DST). We explicitly pass the
// offset in the ISO string so the Date is unambiguous regardless of the
// server's local TZ.
function roDate(isoWithOffset) {
  const d = new Date(isoWithOffset)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${isoWithOffset}`)
  }
  return d
}

// ─── Test 1: noon cutoff ─────────────────────────────────────────────────────

console.log('\n[1] Noon cutoff (12:00 Europe/Bucharest)')
{
  // Wednesday 2026-05-27 is a regular business day.
  // Romania in late May is on EEST (UTC+3).
  const before = roDate('2026-05-27T11:59:00+03:00')
  const after = roDate('2026-05-27T12:01:00+03:00')

  const startBefore = getProcessingStartISO(before)
  const startAfter = getProcessingStartISO(after)

  assertEq(startBefore, '2026-05-27', 'order at 11:59 starts same day')
  assertEq(startAfter, '2026-05-28', 'order at 12:01 starts next business day')
  assertTrue(startBefore !== startAfter, 'cutoff produces different start dates')
}

// ─── Test 2: 1 May 2026 holiday ──────────────────────────────────────────────

console.log('\n[2] 1 May 2026 (Fri) is Ziua Muncii; next business day = 4 May (Mon)')
{
  assertTrue(isRomanianHoliday('2026-05-01'), '2026-05-01 is a Romanian holiday')
  assertTrue(isRomanianHoliday(new Date('2026-05-01T00:00:00Z')), 'Date-input variant works')

  // Starting Thu 30 Apr 2026 and adding 1 business day should skip Fri 1 May
  // (holiday) and Sat/Sun, landing on Mon 4 May 2026.
  const result = addBusinessDays(new Date('2026-04-30T00:00:00Z'), 1)
  const iso = result.toISOString().slice(0, 10)
  assertEq(iso, '2026-05-04', '30 Apr 2026 + 1 bd = 4 May 2026 (skips Fri holiday + weekend)')
}

// ─── Test 3: Orthodox Easter 2027 ────────────────────────────────────────────

console.log('\n[3] Paștele Ortodox 2027 = 2 Mai (Sun), Lunea Paștilor = 3 Mai (Mon)')
{
  assertTrue(isRomanianHoliday('2027-05-03'), '2027-05-03 (Lunea Paștilor) is a holiday')
  // Easter Sunday itself (2 May 2027) is a Sunday — so it's a non-business day
  // regardless of holiday flag. Our list doesn't need to include it, but our
  // list DOES include Vinerea Mare 2027-04-30 (Fri).
  assertTrue(isRomanianHoliday('2027-04-30'), '2027-04-30 (Vinerea Mare) is a holiday')

  // Starting Thu 29 Apr 2027 and adding 1 business day must skip:
  //  Fri 30 Apr (Vinerea Mare), Sat 1 May, Sun 2 May (Easter), Mon 3 May (Lunea)
  // and land on Tue 4 May 2027.
  const result = addBusinessDays(new Date('2027-04-29T00:00:00Z'), 1)
  const iso = result.toISOString().slice(0, 10)
  assertEq(
    iso,
    '2027-05-04',
    '29 Apr 2027 + 1 bd = 4 May 2027 (skips Vinerea Mare + weekend + Lunea Paștilor)'
  )
}

// ─── Test 4: Crăciun 2026 ────────────────────────────────────────────────────

console.log('\n[4] Crăciun 2026: 25 Dec (Fri) + 26 Dec (Sat) + 27 Dec (Sun) → 28 Dec (Mon)')
{
  assertTrue(isRomanianHoliday('2026-12-25'), '2026-12-25 is a holiday')
  assertTrue(isRomanianHoliday('2026-12-26'), '2026-12-26 is a holiday (even though Sat)')

  // Starting Thu 24 Dec 2026 + 1 business day should land on Mon 28 Dec 2026.
  const result = addBusinessDays(new Date('2026-12-24T00:00:00Z'), 1)
  const iso = result.toISOString().slice(0, 10)
  assertEq(iso, '2026-12-28', '24 Dec 2026 + 1 bd = 28 Dec 2026 (Mon)')
}

// ─── Test 5: basic business-day math ─────────────────────────────────────────

console.log('\n[5] Business-day basics: 2026-05-27 (Wed) + 3 bd = 2026-06-01 (Mon)')
{
  // Wed 27 May 2026 + 3 business days:
  //   +1 = Thu 28 May, +2 = Fri 29 May, +3 = Mon 1 Jun 2026 (skip Sat/Sun).
  //   Mon 1 Jun 2026 is ALSO Ziua Copilului + Rusalii Lunea (holiday!), so
  //   actually the next landing day must skip it → Tue 2 Jun 2026.
  // Prompt says 2026-06-01 but that's a holiday in our table — verify prompt
  // intent. We'll test WITHOUT holidays influence by using a date where the
  // +3 landing is clean. Use 2026-03-04 (Wed): +3 = 2026-03-09 (Mon).
  // But the prompt explicitly asks for 2026-05-27 + 3 = 2026-06-01. Since
  // 2026-06-01 IS a holiday, we report BOTH the naive math and the holiday-
  // aware math for transparency.

  const naive = addBusinessDays(new Date('2026-05-27T00:00:00Z'), 3)
  const naiveIso = naive.toISOString().slice(0, 10)

  // With holidays, 1 June 2026 is skipped → Tue 2 June 2026.
  // Without holidays (pure weekday math): Mon 1 June 2026.
  // Our library IS holiday-aware, so we expect 2026-06-02.
  console.log(
    `  NOTE  2026-06-01 is a Romanian holiday (Ziua Copilului + Rusalii), so holiday-aware math lands on 2026-06-02 (Tue), not 2026-06-01.`
  )
  assertEq(naiveIso, '2026-06-02', '2026-05-27 + 3 bd (holiday-aware) = 2026-06-02')

  // Also verify the pure weekend-only skip test the prompt described, using a
  // different Wed where no holidays interfere. 2026-03-04 (Wed) + 3 bd:
  //   +1 Thu 5 Mar, +2 Fri 6 Mar, +3 Mon 9 Mar.
  const clean = addBusinessDays(new Date('2026-03-04T00:00:00Z'), 3)
  const cleanIso = clean.toISOString().slice(0, 10)
  assertEq(cleanIso, '2026-03-09', '2026-03-04 (Wed) + 3 bd = 2026-03-09 (Mon, pure weekend skip)')
}

// ─── Test 6: end-to-end estimate ─────────────────────────────────────────────

console.log('\n[6] End-to-end calculateEstimatedCompletion')
{
  const est = calculateEstimatedCompletion({
    baseDays: 3,
    options: [{ name: 'Traducere', deliveryDaysImpact: 2 }],
    courier: 'fan',
    orderDate: roDate('2026-05-27T09:00:00+03:00'), // Wed morning, before cutoff
  })
  assertEq(est.startDate, '2026-05-27', 'start = same day (before noon, Wed)')
  assertEq(est.minDays, 6, 'min = 3 base + 2 option + 1 fan')
  assertEq(est.maxDays, 8, 'max = 3 base + 2 option + 3 fan')
  assertTrue(est.breakdown.length === 3, 'breakdown has 3 steps')
  assertTrue(
    est.minDate <= est.maxDate && est.minDate.startsWith('2026-'),
    'min/max dates are ordered ISO strings'
  )
}

// ─── Test 7: holiday constant sanity ─────────────────────────────────────────

console.log('\n[7] Holiday constant sanity')
{
  assertTrue(Array.isArray(ROMANIAN_HOLIDAYS_2026_2028), 'constant is an array')
  assertTrue(
    ROMANIAN_HOLIDAYS_2026_2028.length >= 30,
    `has 30+ entries (got ${ROMANIAN_HOLIDAYS_2026_2028.length})`
  )
  assertTrue(
    ROMANIAN_HOLIDAYS_2026_2028.includes('2026-12-01'),
    'includes Ziua Națională 2026-12-01'
  )
  assertTrue(
    ROMANIAN_HOLIDAYS_2026_2028.includes('2028-04-17'),
    'includes Lunea Paștilor 2028-04-17'
  )
}

// ─── Summary ────────────────────────────────────────────────────────────────

console.log('\n──────────────────────────────────────────')
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
if (failed > 0) {
  console.log('\nFailures:')
  for (const f of failures) {
    console.log(`  - ${f.label}\n    expected: ${f.expected}\n    actual:   ${f.actual}`)
  }
  process.exit(1)
} else {
  console.log('All assertions passed.')
  process.exit(0)
}
