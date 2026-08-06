/**
 * Corectează numele contaminat cu prefixul MRZ „PEROU" pe comenzile Stanciu.
 *
 * Context: pașaportul are tipul actului „PE" în MRZ, deci linia 1 începe cu
 * „PEROU" (PE = tip act, ROU = țara). Modelul a scris prefixul lipit de nume:
 * „PEROUSTANCIU" în loc de „STANCIU". Pașaportul (pagina de date) confirmă
 * Numele/Surname = STANCIU.
 *
 * Atinge DOAR câmpurile de formular (personal.lastName, billing.lastName).
 * `ocrResults[].extractedData` rămâne neschimbat — e scanul brut, ținut separat
 * de datele editate, ca să se poată compara ulterior în admin.
 *
 * Rulare: npx tsx --env-file=.env.local scripts/fix-mrz-prefix-2026-08-06.ts
 */

import { Client } from 'pg';

const ORDERS = ['E-260805-AX99C', 'E-260804-XMMDB'];

async function main() {
  const client = new Client({
    host: 'aws-1-eu-west-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.llbwmitdrppomeptqlue',
    password: process.env.SUPABASE_DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const { rows } = await client.query(
    `update orders
        set customer_data = jsonb_set(
              jsonb_set(customer_data, '{personal,lastName}', '"STANCIU"'),
              '{billing,lastName}', '"STANCIU"')
      where friendly_order_id = any($1)
        and customer_data->'personal'->>'lastName' = 'PEROUSTANCIU'
      returning friendly_order_id,
                customer_data->'personal'->>'lastName' as personal_last_name,
                customer_data->'billing'->>'lastName'  as billing_last_name,
                customer_data->'personal'->'ocrResults'->0->'extractedData'->>'lastName' as ocr_raw`,
    [ORDERS]
  );

  console.table(rows);
  console.log(`${rows.length} comenzi corectate.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
