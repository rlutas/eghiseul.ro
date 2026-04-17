#!/usr/bin/env node
/**
 * API Route Inventory for eghiseul.ro
 *
 * Scans src/app/api/**\/route.ts and prints a JSON inventory of
 *   { path, methods: ['GET', 'POST', ...] }
 * to stdout, and writes the same data to docs/testing/api-routes-inventory.json.
 *
 * Detection: greps for `export async function GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD`.
 *
 * Usage:
 *   node scripts/api-route-inventory.mjs
 */

import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const API_ROOT = join(PROJECT_ROOT, 'src', 'app', 'api');
const OUTPUT_FILE = join(PROJECT_ROOT, 'docs', 'testing', 'api-routes-inventory.json');

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
// Matches: `export async function GET(...)` or `export function POST(...)`
// Also catches `export const GET = ...` forms (Next.js also accepts these).
const METHOD_REGEXES = HTTP_METHODS.map((m) => ({
  method: m,
  asyncFn: new RegExp(`export\\s+async\\s+function\\s+${m}\\b`),
  syncFn: new RegExp(`export\\s+function\\s+${m}\\b`),
  constForm: new RegExp(`export\\s+const\\s+${m}\\s*=`),
}));

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (e.isFile() && e.name === 'route.ts') {
      files.push(full);
    }
  }
  return files;
}

/**
 * Convert a file system path like
 *   src/app/api/admin/orders/[id]/route.ts
 * to a URL path like
 *   /api/admin/orders/[id]
 */
function filePathToRoute(absPath) {
  const rel = relative(join(PROJECT_ROOT, 'src', 'app'), absPath);
  const parts = rel.split(sep);
  // drop trailing 'route.ts'
  parts.pop();
  // Filter Next.js route groups: (group)
  const clean = parts.filter((p) => !(p.startsWith('(') && p.endsWith(')')));
  return '/' + clean.join('/');
}

function detectMethods(source) {
  const found = new Set();
  for (const { method, asyncFn, syncFn, constForm } of METHOD_REGEXES) {
    if (asyncFn.test(source) || syncFn.test(source) || constForm.test(source)) {
      found.add(method);
    }
  }
  return Array.from(found).sort();
}

async function main() {
  try {
    await stat(API_ROOT);
  } catch {
    console.error(`API root not found: ${API_ROOT}`);
    process.exit(1);
  }

  const files = await walk(API_ROOT);
  files.sort();

  const inventory = [];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const path = filePathToRoute(file);
    const methods = detectMethods(source);
    inventory.push({ path, methods, file: relative(PROJECT_ROOT, file) });
  }

  // Sort by path for stable output
  inventory.sort((a, b) => a.path.localeCompare(b.path));

  const json = JSON.stringify(inventory, null, 2);

  // Ensure output directory exists
  await mkdir(dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, json + '\n', 'utf8');

  // Print to stdout
  console.log(json);
  console.error(`\n[inventory] ${inventory.length} routes written to ${relative(PROJECT_ROOT, OUTPUT_FILE)}`);
}

main().catch((err) => {
  console.error('Inventory error:', err);
  process.exit(1);
});
