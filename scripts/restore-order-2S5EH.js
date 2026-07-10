/**
 * Restore order E-260710-2S5EH (2cad49da-ff98-4289-99a8-623ee9c01c70) after the
 * 2026-07-10 draft-overwrite incident: a foreign logged-in test session opened
 * the customer's resume link and its autosave wiped property/billing and bound
 * user_id to the test account. The customer then PAID over the broken draft.
 *
 * What it does (single transaction):
 *  1. property  → restored to the values read from this order at 06:57 UTC
 *     (before the wipe): Brașov / Brasov / CF 129134-C1-U10.
 *  2. billing   → ANAF-verified company data for CUI RO22111530 (checked live
 *     against /api/company/validate: DAMPOP DISTRIBUTION SRL, active).
 *  3. user_id   → NULL (guest order again; the test account never owned it).
 *  4. ancpi_jobs → inserts the PENDING job exactly as ensureAncpiJobForPaidOrder
 *     would have (judetId 83 = Brașov, identifier type CF, prod 14200).
 *
 * Run: node --env-file=.env.local scripts/restore-order-2S5EH.js
 */
const { Client } = require('pg');
const fs = require('fs');

const ORDER_ID = '2cad49da-ff98-4289-99a8-623ee9c01c70';

(async () => {
  const url = fs
    .readFileSync('supabase/.temp/pooler-url', 'utf8')
    .trim()
    .replace('[YOUR-PASSWORD]', encodeURIComponent(process.env.SUPABASE_DB_PASSWORD));
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('BEGIN');

  const property = { county: 'Brașov', locality: 'Brasov', cadastral: '', carteFunciara: '129134-C1-U10' };
  const billing = {
    cui: 'RO22111530',
    type: 'persoana_juridica',
    source: 'company',
    regCom: 'J2007001913085',
    companyName: 'DAMPOP DISTRIBUTION SRL',
    companyAddress: 'JUD. BRAŞOV, MUN. BRAŞOV, STR. JEPILOR, NR.9, CAMERA 1, BL.C4, AP.15',
    cuiVerified: true,
    isValid: true,
  };

  const u = await c.query(
    `UPDATE orders
       SET customer_data = jsonb_set(jsonb_set(customer_data, '{property}', $1::jsonb), '{billing}', $2::jsonb),
           user_id = NULL,
           updated_at = now()
     WHERE id = $3
     RETURNING customer_data->'property' AS property, user_id`,
    [JSON.stringify(property), JSON.stringify(billing), ORDER_ID]
  );
  console.log('RESTORED:', JSON.stringify(u.rows[0]));

  const detail = {
    serviceType: 'extras-cf',
    imobile: [
      {
        judet: 'Brașov', judetId: 83, uat: 'Brasov', uatId: null,
        identificator: '129134-C1-U10', identificatorType: 'CF',
        carteFunciara: '129134-C1-U10', cadastral: '', topografic: null,
        immovableId: null, validatedAddress: null,
      },
    ],
    motiv: null, ownerName: null, ownerCnpCui: null, address: null,
  };
  const j = await c.query(
    `INSERT INTO ancpi_jobs (order_id, status, service_type, prod_id, detail)
     VALUES ($1, 'PENDING', 'EXTRAS_CF', '14200', $2::jsonb)
     ON CONFLICT (order_id) DO NOTHING
     RETURNING id, status`,
    [ORDER_ID, JSON.stringify(detail)]
  );
  console.log('ANCPI JOB:', JSON.stringify(j.rows));

  await c.query('COMMIT');

  const check = await c.query(
    `SELECT order_number, status, payment_status, user_id,
            customer_data->'property'->>'carteFunciara' AS cf,
            customer_data->'billing'->>'companyName' AS firma,
            (SELECT status FROM ancpi_jobs WHERE order_id = $1) AS job_status
       FROM orders WHERE id = $1`,
    [ORDER_ID]
  );
  console.log('FINAL:', JSON.stringify(check.rows[0], null, 1));
  await c.end();
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
