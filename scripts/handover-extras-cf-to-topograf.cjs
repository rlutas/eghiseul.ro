/**
 * ONE-TIME (2026-08-21): predă comenzile de extras CF către topograf, cât timp
 * portalul ANCPI e picat (din 13 iulie).
 *
 * 1. Cele 109 joburi `FAILED` trec pe `NEEDS_OPERATOR`. NU pe `PENDING`:
 *    un retry automat le-ar depune a doua oară → dublă plată la ANCPI.
 * 2. Alocă serviciul `extras-carte-funciara` colaboratorului topograf, ca
 *    lucrările să-i apară în portal cu cererile generate.
 *
 * Idempotent: joburile deja mutate nu mai sunt `FAILED`, iar alocarea are gardă
 * NOT EXISTS. Rulare: node scripts/handover-extras-cf-to-topograf.cjs
 */
const { Client } = require('pg');
const fs = require('fs');

for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const COLLABORATOR_EMAIL = 'mirceadumitrean@yahoo.com';
const SERVICE_SLUG = 'extras-carte-funciara';

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
  await c.query('BEGIN');

  const jobs = await c.query(`
    UPDATE ancpi_jobs
       SET status = 'NEEDS_OPERATOR',
           error_message = coalesce(error_message || ' | ', '')
             || 'Preluat manual de topograf (portal ANCPI picat din 13.07) - 2026-08-21. NU relua automat.',
           updated_at = now()
     WHERE status = 'FAILED'
     RETURNING order_id`);

  const assign = await c.query(
    `INSERT INTO collaborator_service_assignments (collaborator_id, service_id, can_upload_pdf)
     SELECT p.id, s.id, true
       FROM profiles p, services s
      WHERE p.email = $1 AND s.slug = $2
        AND NOT EXISTS (
          SELECT 1 FROM collaborator_service_assignments a
           WHERE a.collaborator_id = p.id AND a.service_id = s.id)
      RETURNING id`,
    [COLLABORATOR_EMAIL, SERVICE_SLUG]
  );

  await c.query('COMMIT');

  console.log('joburi trecute pe NEEDS_OPERATOR:', jobs.rowCount);
  console.log('alocări noi de serviciu:', assign.rowCount);

  const status = await c.query('SELECT status, count(*) FROM ancpi_jobs GROUP BY status ORDER BY count(*) DESC');
  console.table(status.rows);

  const svc = await c.query(
    `SELECT s.slug, a.can_upload_pdf
       FROM collaborator_service_assignments a
       JOIN profiles p ON p.id = a.collaborator_id
       JOIN services s ON s.id = a.service_id
      WHERE p.email = $1 AND s.slug = $2`,
    [COLLABORATOR_EMAIL, SERVICE_SLUG]
  );
  console.table(svc.rows);

  await c.end();
})().catch(e => {
  console.error('ERR', e.message);
  process.exit(1);
});
