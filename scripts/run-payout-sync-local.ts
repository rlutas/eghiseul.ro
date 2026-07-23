/**
 * Run the Decontări payout sync locally with PRODUCTION env — equivalent to
 * pressing "Sincronizează cu Stripe" in /admin/decontari. Used to validate
 * sync changes end-to-end (extra_billing matching + Oblio-proforma pass).
 *
 * Usage:
 *   ENV_FILE=/path/to/.env.prod npx tsx scripts/run-payout-sync-local.ts [sinceDays]
 */
import { readFileSync } from 'node:fs';

// Comma-separated env files, first wins per key; empty values are skipped
// (vercel env pull leaves integration-managed vars empty).
const envFiles = (process.env.ENV_FILE ?? '').split(',').filter(Boolean);
if (!envFiles.length) {
  console.error('Set ENV_FILE to one or more env files (comma-separated).');
  process.exit(1);
}
for (const file of envFiles) {
  for (const l of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const i = l.indexOf('=');
    if (i < 1 || l.trim().startsWith('#')) continue;
    const k = l.slice(0, i).trim();
    const v = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (v && !(k in process.env)) process.env[k] = v;
  }
}

const sinceDays = Number(process.argv[2] ?? 7);

async function main() {
  const { syncPayouts } = await import('@/lib/accounting/payout-sync');
  const result = await syncPayouts({ sinceDays });
  console.log(JSON.stringify(result, null, 2));
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
