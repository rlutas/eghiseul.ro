/**
 * Sync the "certificat-constatator" wizard purposes (per report type) to the
 * EXACT set the official ONRC portal offers.
 *
 * Source of truth (verified live 2026-06-14): the ONRC UI populates the
 * "Document solicitat spre a servi la" dropdown from the INTERSECTION of
 *   GET /common-nomen/cc-reasons/active                      (active master list)
 *   GET /common-nomen/cc-reasons/cc-reasons-subtype-association/{code}
 * The association endpoint alone returns extra INACTIVE/legacy reasons (e.g. IMM
 * "Accesare Fonduri"/"SAPARD"/"MINIMIS", insolvență "Procedura de insolvență")
 * that the UI hides — submitting one routes the request to the ONRC backoffice.
 *
 * Report subtype codes: 070 = de bază, 071 = insolvență, 072 = fonduri IMM.
 * Counts at capture time: de bază 37, fonduri IMM 7, insolvență 3.
 *
 * The valid lists below were captured from ONRC; re-run against ONRC if they
 * change. Updates services.verification_config (reportTypes[].purposes) in place.
 */
import { readFileSync } from 'node:fs';

const VALID = {
  imm: [
    'Accesare Fonduri Europene', 'Fonduri IMM',
    'Agenția de Plăți și Intervenții în Agricultură',
    'Agenţia pentru Finanţarea Investiţiilor Rurale (AFIR)',
    'Ministerul Muncii și Justiţiei Sociale',
    'Ministerul Economiei, Energiei și Mediului de Afaceri', 'Primãrie',
  ],
  insolv: ['Licitație', 'Birou notar public', 'Tribunal'],
  // de bază is left to its DB list (37-item, works instant); pass --debaza to also sync it.
};

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const url = env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m)[1].trim();
const key = env.match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m)[1].trim();
const h = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

const svc = (await (await fetch(`${url}/rest/v1/services?select=id,verification_config&slug=eq.certificat-constatator`, { headers: h })).json())[0];
const cfg = svc.verification_config;
const pick = (name) => /imm/i.test(name) ? VALID.imm : /insolven/i.test(name) ? VALID.insolv : null;
let changed = 0;
(function walk(o) {
  if (o && typeof o === 'object') {
    if (Array.isArray(o.reportTypes)) for (const rt of o.reportTypes) {
      if (rt && rt.name) { const v = pick(rt.name); if (v) { rt.purposes = v; changed++; } }
    }
    for (const k in o) walk(o[k]);
  }
})(cfg);
const r = await fetch(`${url}/rest/v1/services?id=eq.${svc.id}`, { method: 'PATCH', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify({ verification_config: cfg }) });
console.log('reportTypes updated:', changed, '| ok:', r.ok);
