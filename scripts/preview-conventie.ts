/**
 * Randează convenția („angajament de execuție documentație") pentru o comandă
 * reală, ca fișier local — verificare vizuală fără să atingi S3 sau DB.
 *
 *   npx tsx --env-file=.env.local scripts/preview-conventie.ts E-260810-EP896
 *
 * Rezultatul: /tmp/conventie-<comanda>.docx (deschide-l sau convertește-l cu
 * `soffice --headless --convert-to pdf`).
 */

import { writeFileSync } from 'fs';
import { createAdminClient } from '../src/lib/supabase/admin';
import { generateDocument, type DocumentContext } from '../src/lib/documents/generator';
import { formatPersonName } from '../src/lib/format/person-name';

async function main() {
  const friendlyId = process.argv[2];
  if (!friendlyId) {
    console.error('Folosire: npx tsx --env-file=.env.local scripts/preview-conventie.ts <FRIENDLY_ORDER_ID>');
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data: order, error } = await db
    .from('orders')
    .select('*, services(id, name, slug, base_price, verification_config)')
    .eq('friendly_order_id', friendlyId)
    .single();

  if (error || !order) throw new Error(`Comanda ${friendlyId} nu există: ${error?.message}`);

  const cd = order.customer_data || {};
  const billing = cd.billing || {};
  const contact = cd.contact || {};
  const conventieConfig = order.services?.verification_config?.conventie ?? {
    // Config-ul poate lipsi încă în DB (migrarea 142) — folosim valorile ei.
    executantName: 'Dumitrean Mircea Adrian',
    executantAuthorization: 'Seria RO-SM-F nr. 0092/2013',
  };

  const context: DocumentContext = {
    client: {
      name:
        formatPersonName(billing.lastName, billing.firstName) ||
        billing.companyName ||
        'N/A',
      firstName: billing.firstName || '',
      lastName: billing.lastName || '',
      cnp: '',
      email: contact.email || '',
      phone: contact.phone || '',
      address: [billing.address, billing.city, billing.county].filter(Boolean).join(', '),
      is_pj: billing.type === 'persoana_juridica',
    },
    company: {},
    order: {
      order_number: order.order_number || '',
      friendly_order_id: order.friendly_order_id || '',
      total_price: order.total_price || 0,
      service_name: order.services?.name || '',
      service_slug: order.services?.slug || '',
      service_price: order.services?.base_price || 0,
      created_at: order.created_at,
    },
    client_ip: cd.signature_metadata?.ip_address || 'N/A',
    property: cd.property ?? null,
    conventie: {
      executantName: conventieConfig.executantName,
      executantAuthorization: conventieConfig.executantAuthorization,
    },
  };

  const buffer = generateDocument(order.services?.slug || '', 'conventie', context);
  const out = `/tmp/conventie-${friendlyId}.docx`;
  writeFileSync(out, buffer);
  console.log(`Scris: ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
