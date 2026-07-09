/**
 * Migrate the LOCAL eghiseul number registry (number_ranges + number_registry)
 * into the CENTRAL registry Supabase project, and optionally import the
 * manual Google Sheets log used by cazierjudiciaronline/ecazier.
 *
 * Usage:
 *   npx tsx scripts/migrate-registry-to-central.ts            # full copy
 *   npx tsx scripts/migrate-registry-to-central.ts --delta    # deploy-window catch-up (upsert-only)
 *   npx tsx scripts/migrate-registry-to-central.ts --sheet=export.csv --sheet-platform=cazierjudiciaronline
 *   npx tsx scripts/migrate-registry-to-central.ts --dry-run  # print what would happen
 *
 * Env (read from .env.local):
 *   SUPABASE_DB_PASSWORD          — local eghiseul DB (pooler)
 *   REGISTRY_SUPABASE_URL         — central project URL
 *   REGISTRY_SUPABASE_SERVICE_KEY — central project service key
 *
 * Sheet CSV format (header row required, comma-separated):
 *   type,number,year,series,date,client_name,client_cnp,client_cui,service_type,amount,order_ref
 *   type: contract|delegation. order_ref optional (CJO-/EJC- order number).
 *
 * Safety:
 *   - Central UNIQUE (type, year, number) surfaces collisions between the
 *     eghiseul journal and the sheet → script REPORTS them and skips
 *     (resolve manually, then re-run).
 *   - After inserts, next_number on each central range is bumped to
 *     max(used)+1 so no allocated number is ever re-issued.
 */

import { readFileSync, existsSync } from 'fs';
import { Client as PgClient } from 'pg';
import { createClient } from '@supabase/supabase-js';

// ── env ──────────────────────────────────────────────────────────
const envFile = readFileSync('.env.local', 'utf8');
function env(name: string): string {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  const m = envFile.match(new RegExp(`^${name}=(.*)$`, 'm'));
  if (!m) throw new Error(`Missing env ${name}`);
  return m[1].trim().replace(/^["']|["']$/g, '');
}

const DRY_RUN = process.argv.includes('--dry-run');
const DELTA = process.argv.includes('--delta');
const sheetArg = process.argv.find((a) => a.startsWith('--sheet='));
const sheetPlatformArg = process.argv.find((a) => a.startsWith('--sheet-platform='));

const local = new PgClient({
  host: 'aws-1-eu-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.llbwmitdrppomeptqlue',
  password: env('SUPABASE_DB_PASSWORD'),
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

const central = createClient(env('REGISTRY_SUPABASE_URL'), env('REGISTRY_SUPABASE_SERVICE_KEY'), {
  auth: { persistSession: false },
});

async function main() {
  await local.connect();
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : DELTA ? 'DELTA' : 'FULL'}${sheetArg ? ' + SHEET' : ''}`);

  // ── 1. Ranges ──────────────────────────────────────────────────
  const { rows: ranges } = await local.query(`
    SELECT r.*, p.email AS created_by_email
    FROM number_ranges r
    LEFT JOIN profiles p ON p.id = r.created_by
    ORDER BY r.created_at
  `);
  console.log(`Local ranges: ${ranges.length}`);

  for (const r of ranges) {
    const payload = {
      id: r.id,
      type: r.type,
      year: r.year,
      range_start: r.range_start,
      range_end: r.range_end,
      next_number: r.next_number,
      series: r.series,
      status: r.status,
      notes: r.notes,
      created_by: r.created_by_email || 'migrated',
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
    if (DRY_RUN) {
      console.log('[range]', payload.type, payload.year, `${payload.range_start}-${payload.range_end}`, 'next:', payload.next_number);
      continue;
    }
    if (DELTA) {
      // Keep the max next_number between local and central (webhooks may have
      // advanced central since the full copy).
      const { data: existing } = await central.from('number_ranges').select('next_number, status').eq('id', r.id).maybeSingle();
      if (existing) {
        const next = Math.max(existing.next_number, r.next_number);
        const { error } = await central
          .from('number_ranges')
          .update({ next_number: next, status: next > r.range_end ? 'exhausted' : existing.status })
          .eq('id', r.id);
        if (error) throw new Error(`range delta ${r.id}: ${error.message}`);
        continue;
      }
    }
    const { error } = await central.from('number_ranges').upsert(payload, { onConflict: 'id', ignoreDuplicates: DELTA });
    if (error) throw new Error(`range ${r.id}: ${error.message}`);
  }

  // ── 2. Registry entries (join for friendly_order_id + emails) ──
  const { rows: entries } = await local.query(`
    SELECT nr.*,
           o.friendly_order_id,
           pc.email AS created_by_email,
           pv.email AS voided_by_email
    FROM number_registry nr
    LEFT JOIN orders o ON o.id = nr.order_id
    LEFT JOIN profiles pc ON pc.id = nr.created_by
    LEFT JOIN profiles pv ON pv.id = nr.voided_by
    ORDER BY nr.created_at
  `);
  console.log(`Local registry entries: ${entries.length}`);

  let inserted = 0, skipped = 0;
  const collisions: string[] = [];
  for (const e of entries) {
    const payload = {
      id: e.id,
      range_id: e.range_id,
      number: e.number,
      type: e.type,
      series: e.series,
      year: e.year,
      platform: e.order_id ? 'eghiseul' : null,
      order_ref: e.friendly_order_id || null,
      order_document_ref: e.order_document_id ? String(e.order_document_id) : null,
      client_name: e.client_name,
      client_email: e.client_email,
      client_cnp: e.client_cnp,
      client_cui: e.client_cui,
      service_type: e.service_type,
      description: e.description,
      amount: e.amount,
      source: e.source,
      date: e.date,
      created_by: e.created_by_email || (e.created_by ? String(e.created_by) : null),
      created_at: e.created_at,
      voided_at: e.voided_at,
      voided_by: e.voided_by_email || (e.voided_by ? String(e.voided_by) : null),
      void_reason: e.void_reason,
    };
    if (DRY_RUN) { inserted++; continue; }
    const { error } = await central.from('number_registry').upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
    if (error) {
      if (error.code === '23505') {
        collisions.push(`${e.type} ${e.year} #${e.number} (${e.client_name})`);
        skipped++;
      } else {
        throw new Error(`entry ${e.id}: ${error.message}`);
      }
    } else {
      inserted++;
    }
  }
  console.log(`Entries: ${inserted} upserted, ${skipped} skipped`);

  // ── 3. Optional Google Sheets import ───────────────────────────
  if (sheetArg) {
    const file = sheetArg.split('=')[1];
    const defaultPlatform = sheetPlatformArg ? sheetPlatformArg.split('=')[1] : null;
    if (!existsSync(file)) throw new Error(`Sheet file not found: ${file}`);
    const lines = readFileSync(file, 'utf8').trim().split(/\r?\n/);
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const idx = (name: string) => header.indexOf(name);
    if (idx('type') < 0 || idx('number') < 0 || idx('year') < 0) {
      throw new Error('Sheet CSV must have at least: type,number,year columns');
    }
    console.log(`Sheet rows: ${lines.length - 1}`);
    let sheetOk = 0;
    for (const line of lines.slice(1)) {
      const cols = line.split(',').map((c) => c.trim());
      const get = (name: string) => (idx(name) >= 0 ? cols[idx(name)] || null : null);
      const payload = {
        number: parseInt(get('number') || '', 10),
        type: get('type'),
        series: get('series') || (get('type') === 'delegation' ? 'SM' : null),
        year: parseInt(get('year') || '', 10),
        platform: get('platform') || defaultPlatform,
        order_ref: get('order_ref') || null,
        client_name: get('client_name') || 'import Google Sheets',
        client_cnp: get('client_cnp'),
        client_cui: get('client_cui'),
        service_type: get('service_type'),
        amount: get('amount') ? parseFloat(get('amount')!) : null,
        source: get('order_ref') ? 'platform' : 'manual',
        date: get('date') || new Date().toISOString().slice(0, 10),
        created_by: 'import-google-sheets',
        description: 'Import din registrul manual Google Sheets',
      };
      if (!payload.number || !payload.type || !payload.year) {
        console.warn('  skip malformed row:', line.slice(0, 80));
        continue;
      }
      if (DRY_RUN) { sheetOk++; continue; }
      const { error } = await central.from('number_registry').insert(payload);
      if (error) {
        if (error.code === '23505') {
          collisions.push(`SHEET ${payload.type} ${payload.year} #${payload.number} (${payload.client_name})`);
        } else {
          throw new Error(`sheet row #${payload.number}: ${error.message}`);
        }
      } else {
        sheetOk++;
      }
    }
    console.log(`Sheet: ${sheetOk} imported`);
  }

  // ── 4. Bump next_number past max used per central range ────────
  if (!DRY_RUN) {
    const { data: centralRanges } = await central.from('number_ranges').select('*');
    for (const r of centralRanges || []) {
      const { data: maxRow } = await central
        .from('number_registry')
        .select('number')
        .eq('type', r.type)
        .eq('year', r.year)
        .gte('number', r.range_start)
        .lte('number', r.range_end)
        .order('number', { ascending: false })
        .limit(1)
        .maybeSingle();
      const maxUsed = maxRow?.number ?? null;
      if (maxUsed !== null && maxUsed + 1 > r.next_number) {
        const next = maxUsed + 1;
        console.log(`Bump ${r.type}/${r.year} next_number ${r.next_number} → ${next}`);
        const { error } = await central
          .from('number_ranges')
          .update({ next_number: next, status: next > r.range_end ? 'exhausted' : r.status })
          .eq('id', r.id);
        if (error) throw new Error(`bump ${r.id}: ${error.message}`);
      }
    }
  }

  if (collisions.length > 0) {
    console.warn(`\n⚠️  ${collisions.length} COLLISIONS (skipped — resolve with the team, then re-run):`);
    for (const c of collisions) console.warn('   -', c);
  }

  await local.end();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
