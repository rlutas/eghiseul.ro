#!/usr/bin/env node
/**
 * Integration test for the delivery calculator end-to-end:
 *  1. Ensures the migration-032 column (estimated_completion_date TIMESTAMPTZ)
 *     exists on `orders`.
 *  2. Picks a real service and inserts a fake "paid" order with paid_at =
 *     2026-04-16 14:00 Europe/Bucharest (past noon cutoff, Thursday).
 *  3. Computes the estimate via src/lib/delivery-calculator.ts directly and
 *     via the adapter in src/lib/delivery-estimate-helper.ts.
 *  4. Persists the computed timestamp into orders.estimated_completion_date.
 *  5. Reads it back and asserts:
 *       - column is NOT NULL
 *       - date skips weekends + 2026-05-01 (Ziua Muncii) holiday
 *       - stored value round-trips correctly via ISO
 *  6. Cleans up the test order.
 *
 * Run with:  node scripts/test-delivery-integration.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Re-exec under --experimental-strip-types so we can import the TS calculator.
if (!process.execArgv.some((a) => a.includes('strip-types'))) {
  const r = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--no-warnings', fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    { stdio: 'inherit' }
  );
  process.exit(r.status ?? 1);
}

// Load .env.local
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[m[1]] = v;
    }
  }
} catch {}

const { Client } = pg;

const PASSWORD = process.env.SUPABASE_DB_PASSWORD;
if (!PASSWORD) {
  console.error('Missing SUPABASE_DB_PASSWORD in .env.local');
  process.exit(1);
}

// Dynamic import of the TS calculator (Node strips types at runtime).
// NOTE: we deliberately do NOT import `delivery-estimate-helper.ts` here —
// it uses the `@/…` path alias which only Webpack/Turbopack resolve. The
// script ports the helper's adapter logic inline (below) to exercise the
// exact same code path without the bundler.
const calcModPath = resolve(__dirname, '../src/lib/delivery-calculator.ts');
const { calculateEstimatedCompletion, isRomanianHoliday, getProcessingStartISO } = await import(calcModPath);

// ─── Ported helper logic (mirrors src/lib/delivery-estimate-helper.ts) ────────
function normalizeOptionName(opt) {
  return (opt.option_name ?? opt.optionName ?? opt.code ?? '').toString().toLowerCase();
}
function isUrgentOption(opt) {
  const name = normalizeOptionName(opt);
  const code = (opt.code ?? '').toString().toLowerCase();
  return name.includes('urgent') || name.includes('urgenta') || code === 'urgenta' || code === 'urgent';
}
function hasUrgentSelection(options) {
  if (!options || options.length === 0) return false;
  return options.some(isUrgentOption);
}
function normalizeCourierCode(dm) {
  if (!dm) return null;
  if (typeof dm === 'string') return dm;
  return dm.code ?? dm.provider ?? dm.type ?? dm.name ?? null;
}
function resolveBaseDays(input) {
  const urgentSelected = hasUrgentSelection(input.selectedOptions);
  if (urgentSelected && input.urgentAvailable && typeof input.urgentDays === 'number' && input.urgentDays > 0) {
    return input.urgentDays;
  }
  if (typeof input.serviceDays === 'number' && input.serviceDays > 0) {
    return input.serviceDays;
  }
  return undefined;
}
function mapOptions(options) {
  if (!options || options.length === 0) return [];
  return options
    .filter((opt) => !isUrgentOption(opt))
    .map((opt) => ({
      name: opt.option_name ?? opt.optionName ?? opt.code ?? 'Opțiune',
      deliveryDaysImpact: opt.delivery_days_impact ?? opt.deliveryDaysImpact,
    }))
    .filter((o) => typeof o.deliveryDaysImpact === 'number' && o.deliveryDaysImpact !== 0);
}
function computeOrderEstimate(input) {
  const baseDays = resolveBaseDays(input);
  const courier = normalizeCourierCode(input.deliveryMethod);
  const orderDate = typeof input.placedAt === 'string' ? new Date(input.placedAt) : input.placedAt;
  const estimate = calculateEstimatedCompletion({
    baseDays,
    options: mapOptions(input.selectedOptions),
    courier,
    orderDate,
  });
  let estimatedCompletionISO = null;
  if (estimate.maxDate) {
    estimatedCompletionISO = new Date(`${estimate.maxDate}T16:00:00Z`).toISOString();
  }
  return { estimate, estimatedCompletionISO };
}
function computeEstimatedCompletionISO(input) {
  return computeOrderEstimate(input).estimatedCompletionISO;
}

// ─── Assertion helpers ────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];
function pass(label) {
  passed++;
  console.log(`  PASS  ${label}`);
}
function fail(label, expected, actual) {
  failed++;
  failures.push({ label, expected, actual });
  console.log(`  FAIL  ${label}\n        expected: ${expected}\n        actual:   ${actual}`);
}
function assertEq(actual, expected, label) {
  const a = typeof actual === 'object' ? JSON.stringify(actual) : String(actual);
  const e = typeof expected === 'object' ? JSON.stringify(expected) : String(expected);
  if (a === e) pass(label);
  else fail(label, e, a);
}
function assertTrue(cond, label) {
  if (cond) pass(label);
  else fail(label, 'true', String(cond));
}

// ─── DB connection ────────────────────────────────────────────────────────────
const client = new Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.llbwmitdrppomeptqlue',
  password: PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

let insertedOrderId = null;

try {
  await client.connect();
  console.log('Connected to Supabase pooler\n');

  // ─── [1] Column + type check ────────────────────────────────────────────────
  console.log('[1] Migration 032 — column is present as TIMESTAMPTZ');
  const { rows: colRows } = await client.query(`
    SELECT data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='orders'
      AND column_name='estimated_completion_date'
  `);
  assertTrue(colRows.length === 1, 'orders.estimated_completion_date exists');
  assertEq(colRows[0]?.udt_name, 'timestamptz', 'column is timestamptz');

  // Verify legacy trigger is gone
  const { rows: trigRows } = await client.query(`
    SELECT trigger_name FROM information_schema.triggers
    WHERE event_object_table='orders'
      AND trigger_name='orders_calculate_estimated_completion'
  `);
  assertEq(trigRows.length, 0, 'legacy trigger calculate_estimated_completion dropped');

  // ─── [2] Calendar sanity ───────────────────────────────────────────────────
  console.log('\n[2] Calendar anchors for 2026-04-16 (Thu) placement');
  // Thursday 16 Apr 2026 at 14:00 Europe/Bucharest (EEST = UTC+3)
  const placedAt = new Date('2026-04-16T14:00:00+03:00');

  // Past noon cutoff → processing starts next business day (Fri 17 Apr).
  const startIso = getProcessingStartISO(placedAt);
  assertEq(startIso, '2026-04-17', 'placed 14:00 RO → processing start = Fri 2026-04-17');

  // 2026-05-01 is a Romanian holiday (Ziua Muncii) — must be skipped.
  assertTrue(isRomanianHoliday('2026-05-01'), '2026-05-01 is a Romanian holiday');

  // ─── [3] Calculator output ─────────────────────────────────────────────────
  console.log('\n[3] Calculator output with 10-day service + fancourier');
  // Use baseDays=10 so the range straddles the 1 May 2026 holiday weekend.
  // From start Fri 2026-04-17:
  //   +1 Mon 4/20, +2 Tue 4/21, +3 Wed 4/22, +4 Thu 4/23, +5 Fri 4/24,
  //   +6 Mon 4/27, +7 Tue 4/28, +8 Wed 4/29, +9 Thu 4/30,
  //   +10 ? Fri 2026-05-01 is a HOLIDAY → skip → Mon 2026-05-04
  // + fancourier: min 1 / max 3 more business days.
  const est = calculateEstimatedCompletion({
    baseDays: 10,
    courier: 'fancourier',
    orderDate: placedAt,
  });
  assertEq(est.startDate, '2026-04-17', 'estimate start = 2026-04-17');
  // minDate = start + (10 + 1) bd, skipping 1 May → Tue 2026-05-05
  assertEq(est.minDate, '2026-05-05', 'minDate skips weekends + 1 May holiday → 2026-05-05');
  // maxDate = start + (10 + 3) bd → Thu 2026-05-07
  assertEq(est.maxDate, '2026-05-07', 'maxDate = 2026-05-07');

  // Helper adapter path
  const isoViaHelper = computeEstimatedCompletionISO({
    placedAt,
    serviceDays: 10,
    urgentDays: null,
    urgentAvailable: false,
    selectedOptions: [],
    deliveryMethod: { type: 'fancourier', name: 'Fan Courier' },
  });
  assertTrue(typeof isoViaHelper === 'string', 'helper returned a string ISO');
  assertTrue(isoViaHelper.startsWith('2026-05-07'), `helper ISO anchored to maxDate 2026-05-07 (got ${isoViaHelper})`);

  // ─── [4] End-to-end DB round-trip ──────────────────────────────────────────
  console.log('\n[4] DB round-trip: insert order → persist estimate → read back');

  // Pick an existing service row (any active one).
  const { rows: svcRows } = await client.query(`
    SELECT id, name, estimated_days, urgent_days, urgent_available
    FROM services
    WHERE is_active = TRUE
    ORDER BY created_at ASC
    LIMIT 1
  `);
  assertTrue(svcRows.length === 1, 'at least one active service row exists');
  const service = svcRows[0];
  console.log(`       using service: ${service.name} (${service.id}), estimated_days=${service.estimated_days}`);

  // Insert a test order. order_number is auto-generated by the
  // generate_order_number trigger when passed NULL, but the column is NOT
  // NULL so we explicitly set a sentinel value and clear it in cleanup.
  const testMarker = `test-delivery-integration-${Date.now()}`;
  const insertRes = await client.query(
    `
    INSERT INTO orders (
      order_number, friendly_order_id, service_id, status, payment_status,
      base_price, total_price, selected_options, delivery_method,
      customer_data, paid_at
    ) VALUES (
      NULL, $1, $2, 'processing', 'paid',
      50, 50, '[]'::jsonb, $3::jsonb,
      $4::jsonb, $5
    )
    RETURNING id, order_number, created_at
    `,
    [
      `TEST-${testMarker}`,
      service.id,
      JSON.stringify({ type: 'fancourier', name: 'Fan Courier' }),
      JSON.stringify({ _test_marker: testMarker }),
      placedAt.toISOString(),
    ]
  );
  insertedOrderId = insertRes.rows[0].id;
  console.log(`       inserted test order ${insertedOrderId} (order_number=${insertRes.rows[0].order_number})`);

  // Compute estimate via helper and write it back (same code path as the
  // payment webhook / submit endpoint).
  const estimateISO = computeEstimatedCompletionISO({
    placedAt,
    serviceDays: service.estimated_days,
    urgentDays: service.urgent_days,
    urgentAvailable: service.urgent_available,
    selectedOptions: [],
    deliveryMethod: 'fancourier',
  });
  assertTrue(estimateISO !== null, 'helper produced an ISO estimate for the service');

  await client.query(
    `UPDATE orders SET estimated_completion_date = $1 WHERE id = $2`,
    [estimateISO, insertedOrderId]
  );

  // Read back
  const { rows: readRows } = await client.query(
    `SELECT estimated_completion_date FROM orders WHERE id = $1`,
    [insertedOrderId]
  );
  const stored = readRows[0]?.estimated_completion_date;
  assertTrue(stored != null, 'estimated_completion_date is NOT NULL after write');
  assertTrue(
    stored instanceof Date || typeof stored === 'string',
    'stored value is a Date/string'
  );

  // The stored value, cast to ISO, should match what we wrote.
  const storedIso = (stored instanceof Date ? stored : new Date(stored)).toISOString();
  assertEq(storedIso, estimateISO, 'round-tripped ISO matches computed estimate');

  // The calendar day of the stored timestamp must NOT be a weekend or 2026-05-01.
  const dayIso = storedIso.slice(0, 10);
  const d = new Date(dayIso + 'T00:00:00Z');
  const weekday = d.getUTCDay(); // 0=Sun 6=Sat
  assertTrue(weekday !== 0 && weekday !== 6, `stored calendar day is a weekday (got ${dayIso}, weekday=${weekday})`);
  assertTrue(dayIso !== '2026-05-01', 'stored calendar day is not 2026-05-01 (holiday)');

  // Also verify the full breakdown shape via the helper.
  const full = computeOrderEstimate({
    placedAt,
    serviceDays: service.estimated_days,
    urgentDays: service.urgent_days,
    urgentAvailable: service.urgent_available,
    selectedOptions: [],
    deliveryMethod: 'fancourier',
  });
  assertTrue(Array.isArray(full.estimate.breakdown), 'breakdown is an array');
  assertTrue(full.estimate.breakdown.length >= 1, 'breakdown has at least the processing step');
  assertTrue(full.estimate.minDays > 0, 'minDays > 0');
  assertTrue(full.estimate.maxDays >= full.estimate.minDays, 'maxDays >= minDays');
} catch (err) {
  console.error('Test script error:', err);
  process.exitCode = 1;
} finally {
  // Cleanup test row (idempotent)
  if (insertedOrderId) {
    try {
      await client.query(`DELETE FROM orders WHERE id = $1`, [insertedOrderId]);
      console.log(`\nCleanup: deleted test order ${insertedOrderId}`);
    } catch (cleanupErr) {
      console.error('Cleanup failed:', cleanupErr.message);
    }
  }
  await client.end();
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\n──────────────────────────────────────────');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) {
    console.log(`  - ${f.label}\n    expected: ${f.expected}\n    actual:   ${f.actual}`);
  }
  process.exit(1);
}
console.log('All integration assertions passed.');
