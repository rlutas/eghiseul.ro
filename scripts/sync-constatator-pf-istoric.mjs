/**
 * Sync the constatator wizard config for "persoană fizică" (pf) and "cu istoric"
 * to match the ONRC portal EXACTLY (captured live 2026-06-15):
 *   - pf  → ONRC subtype 160 "Certificat constatator pe persoana": 10 active reasons.
 *   - istoric → ONRC FI_RAPORT_ISTORIC flow has NO "Tip Document"/motiv step, so
 *     the type must carry NO reportTypes and NO purposes (only the period applies).
 *
 * Updates services.verification_config.constatator.documentTypes in place.
 * Re-run if ONRC changes its lists.
 */
import { readFileSync } from 'node:fs';

// The 10 active PF reasons (subtype 160 ∩ cc-reasons/active). Exact ONRC strings.
const PF_PURPOSES = [
  'Informare',
  'Agenția Națională de Administrare Fiscală',
  'Administrația Finanțelor Publice',
  'Înregistrare în scopuri de TVA',
  'Eliberare cazier judiciar',
  'Poliție',
  'Autorizare',
  'Agenţia pentru Finanţarea Investiţiilor Rurale (AFIR)',
  'Primãrie',
  'Altele',
];

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const url = env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m)[1].trim();
const key = env.match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m)[1].trim();
const h = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

const svc = (await (await fetch(`${url}/rest/v1/services?select=id,verification_config&slug=eq.certificat-constatator`, { headers: h })).json())[0];
const cfg = svc.verification_config;
const dts = cfg?.constatator?.documentTypes ?? [];

let changes = [];
for (const dt of dts) {
  if (dt.value === 'pf') {
    dt.purposes = PF_PURPOSES;
    delete dt.reportTypes; // PF has a single report type (handled by the worker); show only purposes
    changes.push(`pf → ${PF_PURPOSES.length} purposes`);
  }
  if (dt.value === 'istoric') {
    delete dt.reportTypes; // ONRC istoric has no Tip Document step
    delete dt.purposes;
    changes.push('istoric → no reportTypes/purposes (period only)');
  }
}

const r = await fetch(`${url}/rest/v1/services?id=eq.${svc.id}`, {
  method: 'PATCH', headers: { ...h, Prefer: 'return=representation' },
  body: JSON.stringify({ verification_config: cfg }),
});
console.log('ok:', r.ok, '| changes:', changes.join(' | '));
if (!r.ok) console.error(await r.text());
