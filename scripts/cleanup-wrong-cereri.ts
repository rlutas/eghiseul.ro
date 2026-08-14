/**
 * Curățenie: cereri de eliberare generate GREȘIT pe serviciile care nu au cerere.
 *
 * Context: până la fixul din 2026-08-14, butonul „Cerere eliberare PF" exista și
 * pe cazier auto / certificat integritate. Cum niciunul nu are folder propriu în
 * `src/templates/`, cererea cădea pe `templates/shared/cerere-eliberare-pf.docx`
 * — formularul de CAZIER JUDICIAR. Document greșit, care încurca echipa.
 *
 * NU se șterg cererile legitime: o comandă de certificat integritate cu add-on-ul
 * `addon_cazier_judiciar` chiar are nevoie de cererea de cazier judiciar
 * (`computeCerereItems` o întoarce în continuare) — filtrată explicit mai jos.
 *
 * Ce face:
 *   1. găsește order_documents `cerere_*` pe serviciile din SERVICES_WITHOUT_CERERE;
 *   2. sare peste comenzile care mai au nevoie de cerere (add-on cazier judiciar);
 *   3. șterge fișierele din S3;
 *   4. șterge rândurile din order_documents.
 *
 * Cererile nu consumă numere de Barou, deci nu e nimic de anulat în registru.
 *
 * Rulare:
 *   npx tsx --env-file=.env.local scripts/cleanup-wrong-cereri.ts          # dry-run
 *   npx tsx --env-file=.env.local scripts/cleanup-wrong-cereri.ts --apply  # execută
 */

import { createAdminClient } from '../src/lib/supabase/admin';
import { deleteFile } from '../src/lib/aws/s3';
import {
  SERVICES_WITHOUT_CERERE,
  computeCerereItems,
} from '../src/lib/documents/cerere-items';

const APPLY = process.argv.includes('--apply');
const CERERE_DOC_TYPES = ['cerere_eliberare_pf', 'cerere_eliberare_pj', 'cerere_eliberare'];

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  const { data: docs, error } = await db
    .from('order_documents')
    .select(
      'id, order_id, type, s3_key, visible_to_client, orders(friendly_order_id, status, selected_options, services(slug, name))'
    )
    .in('type', CERERE_DOC_TYPES);

  if (error) throw new Error(`select order_documents: ${error.message}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onNoCerereService = (docs ?? []).filter((d: any) =>
    SERVICES_WITHOUT_CERERE.has(d.orders?.services?.slug)
  );

  // Comenzile care MAI au o cerere legitimă (integritate + add-on cazier
  // judiciar) rămân neatinse — documentul lor este formularul corect.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const targets = onNoCerereService.filter((d: any) => {
    const items = computeCerereItems({
      services: d.orders?.services,
      selected_options: d.orders?.selected_options,
    });
    return items.length === 0;
  });

  const kept = onNoCerereService.length - targets.length;
  if (kept > 0) {
    console.log(`${kept} cereri PĂSTRATE (comenzi cu add-on cazier judiciar).`);
  }

  if (targets.length === 0) {
    console.log('Nimic de curățat.');
    return;
  }

  console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — ${targets.length} cereri de șters:\n`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const d of targets as any[]) {
    console.log(
      `  ${d.orders?.friendly_order_id}  ${d.orders?.services?.slug}  ${d.type}  status=${d.orders?.status}  vizibil_client=${d.visible_to_client}`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visible = (targets as any[]).filter((d) => d.visible_to_client);
  if (visible.length > 0) {
    console.log(
      `\n⚠ ${visible.length} documente sunt VIZIBILE clientului — verifică înainte de --apply.`
    );
  }

  if (!APPLY) {
    console.log('\nDry-run. Rulează cu --apply pentru execuție.');
    return;
  }

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ids = (targets as any[]).map((d) => d.id);
  const { error: delErr } = await db.from('order_documents').delete().in('id', ids);
  if (delErr) throw new Error(`delete order_documents: ${delErr.message}`);
  console.log(`DB: ${ids.length} rânduri șterse din order_documents`);

  console.log('\nGata.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
