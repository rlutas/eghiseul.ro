# 2026-07-09 — Registru central numere Barou, LIVE pe 3 platforme

> Documentația completă (arhitectură, fluxuri, operare, failure modes):
> **`docs/registru-central/README.md`** — acest entry e doar jurnalul livrării.

## Ce s-a livrat

- **Proiect Supabase dedicat** `registru-barou-central` (ksqkttalapjlgugshuks,
  eu-west-2) = sursa unică pentru numerele Barou (contract asistență +
  împuternicire), partajată de eghiseul.ro + cazierjudiciaronline.com +
  ecazier.ro. RPC `allocate_number` atomic și IDEMPOTENT; RLS zero-policies
  (doar service key).
- **Alocare DOAR după plată** pe toate platformele (webhook Stripe + fallback
  confirm-payment + cron sweep orar self-heal). eghiseul: submit generează
  doar contract-prestari; contract-asistenta se generează cu număr real DUPĂ
  plată. CJO/ecazier: numerele se scriu automat pe comandă + contractul PDF se
  regenerează cu „SM XXXXXX" (adio Google Sheets + tastare manuală).
- **Fix CJO**: a doua delegație (comenzi duale cazier+integritate) are coloana
  ei (`delegation_integritate_number`) — înainte o suprascria pe prima.
- **Admin eghiseul**: `/admin/registru` = registrul central (jurnal
  multi-platformă, badge CJO/ecazier, export CSV cu coloana Platforma, banner
  explicativ); `generate-document` refuză alocarea pe comenzi neplătite (400).
- **Migrare date**: 2 intervale legacy + 156 intrări copiate central
  (script `scripts/migrate-registry-to-central.ts`, cu `--delta` și
  `--sheet=csv`); migrarea 104 (eghiseul) + 025 (CJO) rulate cu backfill
  complet (13/13, respectiv 1736/1736 comenzi pre-cutover marcate).
- **Intervalele oficiale Barou 2026** (din adresa oficială) seedate la
  cutover: contracte 003551–006550 (next 005772), împuterniciri SM
  005051–008050 (next SM007255) — continuă EXACT de unde a rămas evidența
  manuală (ultimele folosite: 005771 / 007254). Intervalele legacy arhivate.

## Deploy

- eghiseul.ro `a6b8d45` + banner/docs follow-up · cazierjudiciaronline.com
  `c5a7a889` — ambele Production Ready 2026-07-09.
- Env `REGISTRY_SUPABASE_URL/SERVICE_KEY` pe Vercel (prod+preview, ambele
  proiecte).

## Rămas deschis

1. **Import CSV Google Sheets** — jurnalul istoric manual complet, pentru
   audit (NU blochează emiterea; next_number e deja corect).
2. **Verificare prime comenzi reale plătite** — una per platformă: rând nou în
   jurnalul central cu platforma corectă + numerele pe comandă/documente.
