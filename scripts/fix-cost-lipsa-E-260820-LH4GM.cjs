/**
 * Corecție unică: taxa OCPI lipsă pe E-260820-LH4GM.
 *
 * Comanda are DOUĂ cărți funciare (62216 și 56742, Luduș) și două extrase
 * încărcate de topograf, deci am plătit taxa de două ori — dar în evidența de
 * costuri era înregistrat un singur rând de 20 lei, așa că marja pe comandă
 * apărea cu 20 de lei mai mare decât în realitate.
 *
 * Cauza e reparată separat (formularul de depunere precompletează acum
 * taxă × număr de imobile), asta doar completează rândul care lipsește.
 *
 * Idempotent: dacă evidența arată deja 40 de lei, nu mai scrie nimic.
 * Rulare: node scripts/fix-cost-lipsa-E-260820-LH4GM.cjs
 */
const { Client } = require('pg');
const fs = require('fs');

for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const ORDER = 'E-260820-LH4GM';
const TAXA_PE_IMOBIL = 20;

(async () => {
  const c = new Client({
    host: 'aws-1-eu-west-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.llbwmitdrppomeptqlue',
    password: process.env.SUPABASE_DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  const { rows } = await c.query(
    `SELECT o.id,
            1 + jsonb_array_length(coalesce(o.customer_data->'property'->'additionalImobile','[]'::jsonb)) AS imobile,
            (SELECT coalesce(sum(amount_ron),0) FROM order_supplier_costs s WHERE s.order_id=o.id) AS inregistrat
       FROM orders o WHERE o.friendly_order_id = $1`,
    [ORDER]
  );
  if (rows.length === 0) throw new Error(`comanda ${ORDER} nu există`);

  const { id, imobile, inregistrat } = rows[0];
  const asteptat = TAXA_PE_IMOBIL * Number(imobile);
  const lipsa = asteptat - Number(inregistrat);
  console.log(`${ORDER}: ${imobile} imobile → aşteptat ${asteptat} lei, înregistrat ${inregistrat} lei`);

  if (lipsa <= 0) {
    console.log('nimic de completat — evidenţa e deja corectă');
    await c.end();
    return;
  }

  await c.query(
    `INSERT INTO order_supplier_costs (order_id, supplier, category, description, amount_ron, recorded_by)
     VALUES ($1, 'ANCPI', 'taxa_institutie', $2, $3, 'corectie-audit')`,
    [id, `Taxă OCPI extras CF ${ORDER} — al doilea imobil (corecţie audit 21.08.2026)`, lipsa]
  );
  console.log(`adăugat rând de ${lipsa} lei`);

  const after = await c.query(
    `SELECT supplier, category, amount_ron, description, recorded_by
       FROM order_supplier_costs WHERE order_id = $1 ORDER BY created_at`,
    [id]
  );
  console.table(after.rows);
  const total = after.rows.reduce((s, r) => s + Number(r.amount_ron), 0);
  console.log('TOTAL acum:', total, 'lei');

  await c.end();
})().catch(e => {
  console.error('ERR', e.message);
  process.exit(1);
});
