/**
 * Regenerează documentele comenzilor la care numele de familie fusese
 * contaminat cu prefixul MRZ („PEROUPOPA" în loc de „POPA") — vezi
 * docs/changelog/2026-07-28-imputernicire-apostila-si-nume.md.
 *
 * Datele din `customer_data` au fost deja corectate; aici refacem DOCX-urile
 * care au plecat cu numele greșit. Doar comenzile DEPUSE (decizie Raul) —
 * ciornele și cele abandonate se regenerează oricum când merg mai departe.
 *
 * Cheia S3 e deterministă, deci fișierul se suprascrie; alocările de numere
 * din registrul Barou sunt idempotente per (comandă, tip), deci seria și
 * numărul de delegație rămân aceleași. Rândurile vechi din `order_documents`
 * care rămân în urmă (același file_name) sunt șterse, ca să nu apară dubluri
 * în admin.
 *
 *   npx tsx --env-file=.env.local scripts/regenerate-docs-name-fix-2026-07-28.ts [--apply]
 *
 * Fără `--apply` doar raportează ce ar face.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { autoGenerateOrderDocuments } from '@/lib/documents/auto-generate';

const ORDERS = ['E-260713-NYT6R', 'E-260718-ZZ4C5', 'E-260728-YFHH2'];
const APPLY = process.argv.includes('--apply');

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  for (const orderNumber of ORDERS) {
    const { data: order } = await db
      .from('orders')
      .select('id, order_number, status, customer_data')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (!order) {
      console.log(`⚠️  ${orderNumber}: negăsită`);
      continue;
    }

    const personal = order.customer_data?.personal ?? {};
    console.log(
      `\n=== ${orderNumber} (${order.status}) — nume în DB: ${personal.lastName} ${personal.firstName}`
    );

    const { data: before } = await db
      .from('order_documents')
      .select('id, type, file_name, created_at')
      .eq('order_id', order.id)
      .order('created_at');

    for (const d of before ?? []) console.log(`   vechi: ${d.file_name}`);

    if (!APPLY) {
      console.log('   (dry-run — rulează cu --apply ca să regenereze)');
      continue;
    }

    const startedAt = new Date().toISOString();
    const results = await autoGenerateOrderDocuments(order.id, null, 'post-payment');
    for (const r of results) {
      console.log(`   ${r.success ? '✓' : '✗'} ${r.template}${r.error ? ` — ${r.error}` : ''}`);
    }

    // Curăță rândurile vechi rămase în urmă pentru același fișier.
    const { data: after } = await db
      .from('order_documents')
      .select('id, file_name, created_at')
      .eq('order_id', order.id)
      .order('created_at');

    const fresh = new Set(
      (after ?? []).filter((d: { created_at: string }) => d.created_at >= startedAt).map((d: { file_name: string }) => d.file_name)
    );
    const stale = (after ?? []).filter(
      (d: { created_at: string; file_name: string }) => d.created_at < startedAt && fresh.has(d.file_name)
    );
    for (const d of stale) {
      await db.from('order_documents').delete().eq('id', d.id);
      console.log(`   ✂️  șters rândul vechi: ${d.file_name}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
