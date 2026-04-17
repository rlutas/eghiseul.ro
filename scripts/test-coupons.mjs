#!/usr/bin/env node
/**
 * End-to-end smoke test for the coupons system.
 *
 * Strategy:
 *   1. Insert a test coupon (WELCOME10-TEST, 10%, min 100 RON, max 5 uses)
 *      directly via the pg pooler (bypasses RLS).
 *   2. Hit POST /api/coupons/validate with a valid subtotal -> expect discount.
 *   3. Hit with subtotal below min_amount -> expect error.
 *   4. Hit with a non-existent code -> expect error.
 *   5. Insert an already-expired coupon and validate -> expect error.
 *   6. Cleanup: delete both test coupons.
 *
 * Usage: node scripts/test-coupons.mjs
 * Requires: dev server running at BASE_URL (default http://localhost:3000).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Minimal .env.local loader
try {
  const raw = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
} catch {}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;
if (!PASSWORD) {
  console.error('Missing SUPABASE_DB_PASSWORD');
  process.exit(1);
}

const { Client } = pg;
const client = new Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.llbwmitdrppomeptqlue',
  password: PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

const VALID_CODE = 'WELCOME10-TEST';
const EXPIRED_CODE = 'EXPIRED-TEST';

let pass = 0;
let fail = 0;

function check(name, cond, extra = '') {
  if (cond) {
    pass++;
    console.log(`  OK    ${name}${extra ? ' - ' + extra : ''}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${extra ? ' - ' + extra : ''}`);
  }
}

async function validate(code, subtotal) {
  const res = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal }),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function main() {
  await client.connect();
  console.log('Connected to Supabase pooler');

  // Cleanup any leftovers from prior runs
  await client.query('DELETE FROM coupons WHERE code IN ($1, $2)', [VALID_CODE, EXPIRED_CODE]);

  // 1. Insert valid test coupon
  console.log('\nInserting test coupons...');
  await client.query(
    `INSERT INTO coupons (code, description, discount_type, discount_value, min_amount, max_uses, is_active)
     VALUES ($1, $2, 'percentage', 10, 100, 5, true)`,
    [VALID_CODE, 'E2E test coupon (auto-created)']
  );
  await client.query(
    `INSERT INTO coupons (code, description, discount_type, discount_value, min_amount, valid_until, is_active)
     VALUES ($1, $2, 'fixed', 20, 0, NOW() - INTERVAL '1 day', true)`,
    [EXPIRED_CODE, 'E2E expired coupon (auto-created)']
  );
  console.log('Inserted', VALID_CODE, 'and', EXPIRED_CODE);

  // Wait for server readiness
  console.log(`\nValidating via ${BASE_URL}/api/coupons/validate ...`);

  // Test A: valid coupon, subtotal=300 -> discount=30, final=270
  {
    const { status, json } = await validate(VALID_CODE, 300);
    check(`${VALID_CODE} @ 300 RON returns 200`, status === 200);
    check(`${VALID_CODE} @ 300 RON is valid`, json.success === true && json.data?.valid === true);
    check(
      `${VALID_CODE} @ 300 RON discount=30`,
      json.data?.discount === 30,
      `got ${json.data?.discount}`
    );
    check(
      `${VALID_CODE} @ 300 RON final=270`,
      json.data?.final === 270,
      `got ${json.data?.final}`
    );
    check(
      `${VALID_CODE} preserves coupon code in response`,
      json.data?.coupon?.code === VALID_CODE
    );
  }

  // Test B: valid coupon, subtotal below min -> 400
  {
    const { status, json } = await validate(VALID_CODE, 50);
    check(`${VALID_CODE} below min_amount rejected (400)`, status === 400);
    check(
      `${VALID_CODE} below min_amount has error message`,
      typeof json.error === 'string' && json.error.length > 0
    );
  }

  // Test C: non-existent code -> 404
  {
    const { status, json } = await validate('NOSUCHCOUPON', 500);
    check('non-existent code rejected (404)', status === 404, `got ${status}`);
    check('non-existent code has error message', typeof json.error === 'string');
  }

  // Test D: expired coupon -> 400
  {
    const { status, json } = await validate(EXPIRED_CODE, 500);
    check(`${EXPIRED_CODE} (expired) rejected (400)`, status === 400, `got ${status}`);
    check(
      `${EXPIRED_CODE} error mentions expired/invalid`,
      typeof json.error === 'string' && json.error.length > 0,
      json.error
    );
  }

  // Test E: case-insensitive lookup
  {
    const { status, json } = await validate(VALID_CODE.toLowerCase(), 300);
    check(
      `${VALID_CODE.toLowerCase()} (lowercase) accepted`,
      status === 200 && json.success === true,
      `status=${status}`
    );
  }

  // Cleanup
  console.log('\nCleaning up test coupons...');
  const del = await client.query('DELETE FROM coupons WHERE code IN ($1, $2)', [VALID_CODE, EXPIRED_CODE]);
  console.log(`Deleted ${del.rowCount} test coupons`);

  await client.end();

  console.log(`\nResults: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Test script error:', err.message);
  try {
    await client.query('DELETE FROM coupons WHERE code IN ($1, $2)', [VALID_CODE, EXPIRED_CODE]);
    await client.end();
  } catch {}
  process.exit(1);
});
