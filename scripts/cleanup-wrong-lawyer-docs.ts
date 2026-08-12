/**
 * Curățenie: contracte de asistență juridică generate GREȘIT pe servicii fără avocat.
 *
 * Context: până la fixul din 2026-08-12, `no-lawyer-services.ts` enumera doar 5
 * slug-uri, deci serviciile imobiliare prin topograf (migrarea 084) primeau
 * contract-asistenta + număr de Barou din registrul central.
 *
 * Ce face:
 *   1. găsește order_documents de tip avocațial pe servicii FĂRĂ avocat;
 *   2. șterge fișierele din S3;
 *   3. șterge rândurile din order_documents;
 *   4. anulează (void) numerele de Barou în registrul central — numărul rămâne
 *      consumat, cu motiv scris, nu se refolosește.
 *
 * Rulare:
 *   npx tsx --env-file=.env.local scripts/cleanup-wrong-lawyer-docs.ts          # dry-run
 *   npx tsx --env-file=.env.local scripts/cleanup-wrong-lawyer-docs.ts --apply  # execută
 */

import { createAdminClient } from '../src/lib/supabase/admin';
import { deleteFile } from '../src/lib/aws/s3';
import { voidNumber } from '../src/lib/registry/client';
import { LAWYER_SERVICE_SLUGS } from '../src/lib/documents/no-lawyer-services';

const APPLY = process.argv.includes('--apply');
const LAWYER_DOC_TYPES = [
  'contract_asistenta',
  'contract_complet',
  'imputernicire',
  'cerere_eliberare_pf',
  'cerere_eliberare_pj',
];
const VOID_REASON =
  'Generat automat pe serviciu fără avocat (bug listă NO_LAWYER, reparat 2026-08-12)';

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  const { data: docs, error } = await db
    .from('order_documents')
    .select('id, order_id, type, s3_key, document_number, metadata, orders(friendly_order_id, services(slug, name))')
    .in('type', LAWYER_DOC_TYPES);

  if (error) throw new Error(`select order_documents: ${error.message}`);

  const targets = (docs ?? []).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (d: any) => !LAWYER_SERVICE_SLUGS.includes(d.orders?.services?.slug)
  );

  if (targets.length === 0) {
    console.log('Nimic de curățat.');
    return;
  }

  console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — ${targets.length} documente de șters:\n`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const d of targets as any[]) {
    console.log(
      `  ${d.orders?.friendly_order_id}  ${d.orders?.services?.slug}  ${d.type}  nr=${d.document_number}  registry=${d.metadata?.registry_id ?? '-'}`
    );
  }

  // Numere de registru distincte (un număr poate apărea pe mai multe rânduri
  // duplicate — regenerarea reutiliza alocarea idempotentă).
  const registryIds = [
    ...new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (targets as any[]).map((d) => d.metadata?.registry_id).filter(Boolean) as string[]
    ),
  ];
  console.log(`\n${registryIds.length} numere de Barou de anulat: ${registryIds.join(', ')}`);

  if (!APPLY) {
    console.log('\nDry-run. Rulează cu --apply pentru execuție.');
    return;
  }

  // 1. S3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const d of targets as any[]) {
    if (!d.s3_key) continue;
    try {
      await deleteFile(d.s3_key);
      console.log(`S3 șters: ${d.s3_key}`);
    } catch (e) {
      console.error(`S3 delete FAILED ${d.s3_key}:`, (e as Error).message);
    }
  }

  // 2. DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ids = (targets as any[]).map((d) => d.id);
  const { error: delErr } = await db.from('order_documents').delete().in('id', ids);
  if (delErr) throw new Error(`delete order_documents: ${delErr.message}`);
  console.log(`DB: ${ids.length} rânduri șterse din order_documents`);

  // 3. Registru central
  for (const rid of registryIds) {
    try {
      await voidNumber(rid, 'cleanup-no-lawyer-2026-08-12', VOID_REASON);
      console.log(`Registru: ${rid} anulat`);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes('already voided')) {
        console.log(`Registru: ${rid} era deja anulat`);
      } else {
        console.error(`Registru void FAILED ${rid}:`, msg);
      }
    }
  }

  console.log('\nGata.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
