/**
 * Verifică ce facturi emise NU pot fi trimise în SPV și scrie rezultatul pe
 * comandă (invoice_spv_status / invoice_spv_error / invoice_spv_checked_at,
 * migrarea 138). Aceeași verificare rulează automat la emitere + orar în cron
 * invoice-health-check; scriptul e pentru sweep-ul istoric (backfill).
 *
 * Run din rădăcina repo-ului:
 *   npx tsx scripts/check-spv-invoices-2026-07-28.ts            → dry-run
 *   npx tsx scripts/check-spv-invoices-2026-07-28.ts --apply    → scrie în DB
 *   npx tsx scripts/check-spv-invoices-2026-07-28.ts --days=90  → alt interval
 */
import { readFileSync } from 'node:fs';
import { Client } from 'pg';
import { checkEinvoiceExport, splitInvoiceNumber } from '@/lib/oblio/einvoice-check';

const env: Record<string, string> = {};
for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = l.indexOf('=');
  if (i < 1 || l.trim().startsWith('#')) continue;
  env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}
for (const k of ['OBLIO_CLIENT_ID', 'OBLIO_CLIENT_SECRET', 'OBLIO_COMPANY_CIF']) {
  process.env[k] = env[k];
}

const APPLY = process.argv.includes('--apply');
const days = Number((process.argv.find((a) => a.startsWith('--days=')) || '').split('=')[1] || 60);

const c = new Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.llbwmitdrppomeptqlue',
  password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await c.connect();
  const { rows } = await c.query(
    `select id, friendly_order_id, invoice_number, invoice_issued_at::date as d
     from orders
     where invoice_number is not null
       and invoice_issued_at >= now() - ($1 || ' days')::interval
     order by invoice_issued_at`,
    [String(days)]
  );
  console.log(`Facturi de verificat (${days} zile): ${rows.length}${APPLY ? ' — se scrie în DB' : ' — dry-run'}\n`);

  const blocked: Record<string, string>[] = [];
  let ok = 0;

  for (const r of rows) {
    const parts = splitInvoiceNumber(r.invoice_number);
    if (!parts) continue;
    const res = await checkEinvoiceExport(parts.seriesName, parts.number);
    if (res.ok) ok++;
    else {
      blocked.push({
        factura: r.invoice_number,
        comanda: r.friendly_order_id,
        emisa: String(r.d).slice(0, 10),
        motiv: (res.error || '').slice(0, 120),
      });
      process.stdout.write('x');
    }
    if (res.ok) process.stdout.write('.');
    if (APPLY) {
      await c.query(
        `update orders set invoice_spv_status = $1, invoice_spv_error = $2, invoice_spv_checked_at = now() where id = $3`,
        [res.ok ? 'ok' : 'blocked', res.ok ? null : (res.error ?? 'Export e-Factura respins'), r.id]
      );
    }
  }

  console.log(`\n\nOK: ${ok} · BLOCATE: ${blocked.length}\n`);
  console.table(blocked);
  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
