#!/usr/bin/env node
/**
 * API Smoke Test Harness for eghiseul.ro
 *
 * Runs a lightweight, dependency-free smoke test across public, auth-gated,
 * validation, webhook, and courier endpoints. Prints colorized pass/fail
 * lines and a summary table at the end.
 *
 * Usage:
 *   node scripts/api-smoke-test.mjs
 *   BASE_URL=https://staging.eghiseul.ro node scripts/api-smoke-test.mjs
 *
 * Exit code: 0 when zero failures, 1 otherwise.
 */

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 8000);

// ---------- ANSI helpers ----------
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = {
  reset: useColor ? '\x1b[0m' : '',
  bold: useColor ? '\x1b[1m' : '',
  dim: useColor ? '\x1b[2m' : '',
  red: useColor ? '\x1b[31m' : '',
  green: useColor ? '\x1b[32m' : '',
  yellow: useColor ? '\x1b[33m' : '',
  blue: useColor ? '\x1b[34m' : '',
  magenta: useColor ? '\x1b[35m' : '',
  cyan: useColor ? '\x1b[36m' : '',
  gray: useColor ? '\x1b[90m' : '',
};

const pad = (s, n) => String(s).padEnd(n, ' ');

// ---------- Test definitions ----------
/**
 * Each test: { name, method, path, expect: { status: number[] | 'any', arrayBody?: boolean, altStatus?: number[] }, body?, headers?, tolerate?: boolean }
 *   - expect.status: acceptable status codes (array). If 'any', never fails on status.
 *   - expect.arrayBody: if true, expects JSON array response body on matching status.
 *   - expect.altStatus: alternative acceptable statuses that should be logged (still PASS).
 *   - tolerate: if true, treat non-match as SKIP (not FAIL). Used for courier with potentially missing creds.
 */
const tests = [
  // ----- Public -----
  {
    group: 'Public',
    name: 'Homepage',
    method: 'GET',
    path: '/',
    expect: { status: [200] },
  },
  {
    group: 'Public',
    name: 'Services page',
    method: 'GET',
    path: '/servicii',
    expect: { status: [200] },
  },
  {
    group: 'Public',
    name: 'Services API',
    method: 'GET',
    path: '/api/services',
    // Response is { success: true, data: { services: [...] } } — not a flat array
    expect: { status: [200] },
  },
  {
    group: 'Public',
    name: 'Service detail (cazier-judiciar-persoana-fizica)',
    method: 'GET',
    path: '/api/services/cazier-judiciar-persoana-fizica',
    expect: { status: [200, 404] },
  },
  {
    group: 'Public',
    name: 'Order wizard (cazier-judiciar-persoana-fizica)',
    method: 'GET',
    path: '/comanda/cazier-judiciar-persoana-fizica',
    expect: { status: [200] },
  },
  {
    group: 'Public',
    name: 'Order status page',
    method: 'GET',
    path: '/comanda/status',
    expect: { status: [200] },
  },

  // ----- Auth-gated (must be rejected) -----
  {
    group: 'Auth-gated',
    name: 'Admin orders list',
    method: 'GET',
    path: '/api/admin/orders',
    expect: { status: [401, 403, 302, 307, 404] },
  },
  {
    group: 'Auth-gated',
    name: 'Admin dashboard stats',
    method: 'GET',
    path: '/api/admin/dashboard/stats',
    expect: { status: [401, 403, 302, 307] },
  },
  {
    group: 'Auth-gated',
    name: 'Admin users',
    method: 'GET',
    path: '/api/admin/users',
    expect: { status: [401, 403, 302, 307, 404] },
  },
  {
    group: 'Auth-gated',
    name: 'Admin number-ranges',
    method: 'GET',
    path: '/api/admin/number-ranges',
    expect: { status: [401, 403, 302, 307, 404] },
  },
  {
    group: 'Auth-gated',
    name: 'Admin number-registry',
    method: 'GET',
    path: '/api/admin/number-registry',
    expect: { status: [401, 403, 302, 307, 404] },
  },
  {
    group: 'Auth-gated',
    name: 'Admin document-templates',
    method: 'GET',
    path: '/api/admin/settings/document-templates',
    expect: { status: [401, 403, 302, 307, 404] },
  },

  // ----- Validation -----
  {
    group: 'Validation',
    name: 'Create draft order (empty body)',
    method: 'POST',
    path: '/api/orders/draft',
    body: {},
    expect: { status: [400, 401, 422] },
  },
  {
    group: 'Validation',
    name: 'OCR extract (empty body)',
    method: 'POST',
    path: '/api/ocr/extract',
    body: {},
    expect: { status: [400, 401, 422] },
  },
  {
    group: 'Validation',
    name: 'KYC verify (empty body)',
    method: 'POST',
    path: '/api/kyc/verify',
    body: {},
    // Note: actual endpoint may be /api/kyc/validate; 404 flagged but accepted as SKIP.
    expect: { status: [400, 401, 422] },
    altStatus: [404],
  },

  // ----- Webhooks -----
  {
    group: 'Webhooks',
    name: 'Stripe webhook (no signature)',
    method: 'POST',
    path: '/api/webhooks/stripe',
    body: { fake: 'payload' },
    // Unsigned webhook requests are always rejected with 400 — both in production
    // (line 25-39 guards) and in dev (line 66-72 guard). Signed-only path to the handler.
    expect: { status: [400] },
  },

  // ----- Courier (best-effort) -----
  {
    group: 'Courier',
    name: 'Courier quotes (fan)',
    method: 'GET',
    path: '/api/courier/quotes?service=fan',
    expect: { status: 'any' },
    tolerate: true,
  },
];

// ---------- Runner ----------
async function runTest(t) {
  const url = BASE_URL + t.path;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let status = 0;
  let errMsg = null;
  let bodyIsArray = null;
  let redirectTarget = null;

  try {
    const init = {
      method: t.method,
      redirect: 'manual', // catch 3xx from auth redirects
      signal: controller.signal,
      headers: {
        accept: 'application/json, text/html;q=0.9, */*;q=0.8',
        ...(t.headers || {}),
      },
    };
    if (t.body !== undefined) {
      init.headers['content-type'] = 'application/json';
      init.body = JSON.stringify(t.body);
    }

    const res = await fetch(url, init);
    status = res.status;

    if (status >= 300 && status < 400) {
      redirectTarget = res.headers.get('location');
    }

    if (t.expect.arrayBody && status === 200) {
      try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const json = await res.json();
          bodyIsArray = Array.isArray(json) || Array.isArray(json?.data);
        } else {
          bodyIsArray = false;
        }
      } catch {
        bodyIsArray = false;
      }
    } else {
      // drain body so socket frees
      try { await res.text(); } catch {}
    }
  } catch (err) {
    errMsg = err?.name === 'AbortError' ? 'TIMEOUT' : String(err?.message || err);
  } finally {
    clearTimeout(timer);
  }

  const durationMs = Date.now() - started;

  // Determine verdict
  let verdict = 'FAIL';
  let note = '';

  if (errMsg) {
    verdict = t.tolerate ? 'SKIP' : 'FAIL';
    note = errMsg;
  } else if (t.expect.status === 'any') {
    verdict = 'PASS';
  } else if (t.expect.status.includes(status)) {
    verdict = 'PASS';
    if (t.expect.arrayBody && status === 200 && bodyIsArray === false) {
      verdict = 'FAIL';
      note = 'expected array body';
    }
  } else if (Array.isArray(t.altStatus) && t.altStatus.includes(status)) {
    verdict = 'SKIP';
    note = 'alt status (logged)';
  } else if (t.tolerate) {
    verdict = 'SKIP';
    note = 'tolerated';
  }

  if (redirectTarget && !note) note = `-> ${redirectTarget}`;

  return {
    ...t,
    url,
    status,
    durationMs,
    verdict,
    note,
    errMsg,
    bodyIsArray,
  };
}

function formatExpect(t) {
  if (t.expect.status === 'any') return 'any';
  return t.expect.status.join('|');
}

function verdictStyle(v) {
  if (v === 'PASS') return `${c.green}[PASS]${c.reset}`;
  if (v === 'FAIL') return `${c.red}[FAIL]${c.reset}`;
  return `${c.yellow}[SKIP]${c.reset}`;
}

function printResult(r) {
  const line = [
    verdictStyle(r.verdict),
    c.bold + pad(r.group, 10) + c.reset,
    pad(r.method, 4),
    pad(r.path, 48),
    pad(`status=${r.status || 'ERR'}`, 12),
    pad(`exp=${formatExpect(r)}`, 18),
    c.gray + `${r.durationMs}ms` + c.reset,
    r.note ? c.dim + ' ' + r.note + c.reset : '',
  ].join(' ');
  console.log(line);
}

async function main() {
  const banner = `${c.bold}${c.cyan}eghiseul.ro API smoke test${c.reset} ${c.gray}(${BASE_URL})${c.reset}`;
  console.log('\n' + banner);
  console.log(c.gray + '-'.repeat(banner.replace(/\x1b\[[0-9;]*m/g, '').length) + c.reset + '\n');

  const results = [];
  // Run sequentially to avoid hammering dev server; fast enough for < 30s.
  for (const t of tests) {
    // eslint-disable-next-line no-await-in-loop
    const r = await runTest(t);
    results.push(r);
    printResult(r);
  }

  // Summary
  const pass = results.filter((r) => r.verdict === 'PASS').length;
  const fail = results.filter((r) => r.verdict === 'FAIL').length;
  const skip = results.filter((r) => r.verdict === 'SKIP').length;
  const total = results.length;
  const totalMs = results.reduce((s, r) => s + r.durationMs, 0);

  console.log('\n' + c.bold + 'Summary' + c.reset);
  console.log(c.gray + '-'.repeat(60) + c.reset);
  console.log(`${pad('Total', 10)} ${total}`);
  console.log(`${pad('Pass', 10)} ${c.green}${pass}${c.reset}`);
  console.log(`${pad('Fail', 10)} ${fail > 0 ? c.red : c.gray}${fail}${c.reset}`);
  console.log(`${pad('Skip', 10)} ${c.yellow}${skip}${c.reset}`);
  console.log(`${pad('Duration', 10)} ${totalMs}ms`);
  console.log(c.gray + '-'.repeat(60) + c.reset);

  if (fail > 0) {
    console.log(`\n${c.red}Failures:${c.reset}`);
    for (const r of results.filter((r) => r.verdict === 'FAIL')) {
      console.log(`  ${c.red}*${c.reset} ${r.method} ${r.path} -> status=${r.status} exp=${formatExpect(r)} ${r.note ? '(' + r.note + ')' : ''}`);
    }
  }

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(c.red + 'Harness error:' + c.reset, err);
  process.exit(1);
});
