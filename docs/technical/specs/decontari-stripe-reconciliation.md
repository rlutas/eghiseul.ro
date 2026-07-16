# Decontări Stripe — reconciliere cross-platform + proformă la extra charges

**UI:** `/admin/decontari` (permisiunea `payments.verify` — contabil, manager, super_admin)
**Migrări:** eghiseul 113 (aplicată) · CJO 026 (`supabase/migrations/026_extra_billing_proforma.sql` — **de aplicat manual în SQL Editor**, nu avem creds DDL pe DB-ul CJO)
**Plan original:** `/Users/raul/.claude/plans/super-acuma-as-vrea-zazzy-pearl.md`

## Problema

eghiseul.ro + cazierjudiciaronline.com = aceeași firmă (EDIGITALIZARE SRL), același cont Stripe, același Oblio. Payout-urile Stripe vin mixte (`E-*` + `CJO-*`); contabilitatea se făcea manual: print balanță per decontare + scris de mână nr. facturii Oblio per tranzacție. **ecazier NU e inclus** — alt cont Stripe (cabinet_tarta) + SmartBill.

## 1. Reconcilierea payouts (eghiseul admin — hub central)

**Date:** `stripe_payouts` + `stripe_payout_transactions` (migrarea 113), sume în **bani**.

**Sync** (`src/lib/accounting/payout-sync.ts`):
- `stripe.payouts.list` (fereastră 30/90 zile) → per payout `balanceTransactions.list({payout, expand: data.source})` cu paginare
- Atribuire platformă: `metadata.app_id==='cjo'` → cjo · prefix comandă `E-`/`EJC-` → eghiseul · `CJO-/CAO-/CFO-/CIC-` → cjo · regex pe description ca fallback → altfel `necunoscut`
- Îmbogățire: eghiseul din DB propriu (invoice_number/url, client, serviciu); CJO prin client read-only `src/lib/supabase/cjo.ts` (env `CJO_SUPABASE_URL` + `CJO_SUPABASE_SERVICE_KEY`)
- Declanșare: buton „Sincronizează" (`POST /api/admin/decontari/sync`, 30/90 zile) + cron zilnic 05:30 `GET /api/cron/payout-sync` (GET→POST passthrough, Bearer CRON_SECRET)
- Payout-urile din ultimele 30 zile se re-sincronizează (in_transit→paid, facturi întârziate)

**UI:**
- Listă: dată, sumă, tranzacții, badge „X/Y facturate" (roșu când incomplet), status
- Detaliu `/admin/decontari/[payoutId]`: Comandă (link) · Platformă (badge) · Client · Serviciu · Factură Oblio (link PDF) · Brut/Fee/Net + rambursări + TOTAL cu verificare `sum(net)==payout.amount` · **Print** (CSS print) · **Export CSV**
  - **Numele clientului (eghiseul)** — lanț fallback în `payout-sync.ts` (fix 2026-07-16): `personal` (scanare CI) → `billing` persoană → `billing/company` firmă → numele de pe card din Stripe (`charge.billing_details.name`). Serviciile imobiliare nu au scanare CI — fără fallback rândurile arătau doar emailul. Backfill = re-sync (upsert).
- Export lunar: `GET /api/admin/decontari/export?month=YYYY-MM` — CSV BOM UTF-8, toate tranzacțiile + rând TOTAL

## 2. Proformă → factură la extra charges (ambele platforme)

Flux: admin creează extra charge → **proformă Oblio** (link PDF în emailul de plată — CJO include; eghiseul persistă pe comandă) → clientul plătește → webhook emite **factura fiscală** cu `referenceDocument: {type:'Proforma',...}` → totul salvat în `extra_billing` (jsonb array: proforma + invoice + sumă + paidAt).

- Serii de proforme (de creat manual în Oblio, Setări → Serii): `PEGH` (eghiseul), `PCJO` (CJO). Env: `OBLIO_PROFORMA_SERIES`. **Fără env setat, proforma se sare (warn) — linkul de plată merge oricum, factura se emite fără referință.**
- Lib: `src/lib/oblio/proforma.ts` în ambele repo-uri (create/invoiceFromProforma/cancel)

### Fix inclus: fluxul extra charge de pe eghiseul era RUPT
- Vechiul flux crea un PaymentIntent + email cu link spre `/comanda/plata-extra/{id}` — **pagina nu a existat niciodată**, iar webhook-ul nu credita `additional_paid_amount`
- Acum: **Hosted Checkout Session** (`purpose:'extra_charge'`) cu URL plătibil direct; webhook-ul are branch dedicat (`handleExtraChargePaid`): creditează `additional_paid_amount`, curăță `pending_extra_*`, emite factura, history row. Guard: PI-urile extra NU mai intră pe fulfilment-ul normal (ar fi re-facturat comanda).
- CJO: fluxul de plată era OK; adăugat doar proforma + factura la plată (extra-urile nu se facturau deloc înainte).

## Setup manual (o singură dată)

1. **CJO migrarea 026** — Supabase SQL Editor (proiect ntnjvzpxctbxvvofqsyy) → rulează conținutul `supabase/migrations/026_extra_billing_proforma.sql` (codul e defensiv: merge și fără coloane, doar nu persistă proforma)
2. **Oblio**: creează seriile de proforme `PEGH` + `PCJO`
3. **Vercel env eghiseul**: `CJO_SUPABASE_URL`, `CJO_SUPABASE_SERVICE_KEY` (valori din CJO), `OBLIO_PROFORMA_SERIES=PEGH` → redeploy
4. **Vercel env CJO**: `OBLIO_PROFORMA_SERIES=PCJO` → redeploy
5. Prima rulare: `/admin/decontari` → butonul „90z" (backfill 90 de zile)

## Verificare
- Payout-ul exemplu `po_1TsuSSHGb8JBHhclKsKnNlQB` (1.049,73 RON, 6 charges mixte) trebuie să apară cu toate cele 6 tranzacții atribuite + facturi
- Extra charge test (test mode): modify → proformă în Oblio → plată → factură cu referință + `extra_billing` populat
- Cron: log `[cron/payout-sync]` în Vercel după 05:30

## Istoric: linkarea retroactivă (2026-07-14)

Tranzacțiile din era WP (până 8 iul) n-au număr de comandă în Stripe. Legate retroactiv de facturile lor Oblio (EGI2024, emise atunci de integrarea WP) prin scripturi de match strict (scratchpad: `link_cjo_june.js`, `link_wp_era.js`):
- comenzile CJO iunie: 76/77 linkate pe orders (email+sumă+dată ±3d, unic; perechile identice — cronologic comandă↔număr factură)
- tranzacțiile WP: 53 linkate direct pe `stripe_payout_transactions` (email+sumă+dată; fallback sumă+dată T+3 unic bidirecțional)
- **125 rămân „nefacturat"**: clustere ambigue (mai multe plăți identice în aceeași fereastră — nedecidabil automat) — sumele payouts oricum bat la ban; verificabile manual după sumă+dată în Oblio
- sync-ul **prezervă** linkurile manuale (nu le suprascrie cu null) — fix `e674e14`
- tipul Stripe `payment` (Payment Links WP) = încasare, numărat peste tot — fix `ae096e8`
- comanda fără nicio factură emisă: CJO-20260601-85107 (305,10) — decizie user

Verificare completă: toate cele 29 payouts reconciliază exact (sum(net)==payout), 0 tranzacții neexplicate. Scriptul de audit: scratchpad `verify_all_payouts.py`.

### Corecție 2026-07-14 (a doua trecere)

Afirmația inițială „9 încasări nefacturate" era GREȘITĂ pentru 7 din ele — fereastra de dată era prea strâmtă: **Payment Links (type `payment`) se decontează la T+5**, nu T+3 ca charge-urile card. Regăsite și legate prin email exact + sumă exactă (EGI2024-24008/24153/24230/24235/24239/24242/24277).

**Rămase real nefacturate: 3** (~605 RON):
1. 50 RON, 17 iun — Link by Stripe, metadata `orderId:122280853`, sursă neidentificată (nu există în dump WP, nici în DB-urile noi)
2. 250 RON, 22 iun — idem, `orderId:122469196`
3. CJO-20260601-85107, 305,10 RON, 1 iun — comandă reală CJO, integrarea WP a ratat factura

Lecție: la match-ul pe dată folosește T+3 pt card (`charge`) și T+5 pt Payment Links (`payment`).

### Incident + reparație finală (14 iul, a treia trecere)

User a prins o atribuire greșită (factura lui Florea Mihai pe tranzacția lui Geanta Constantin). Cauza: euristica „closest-of-N" + patch-ul țintit fără set de facturi-folosite → 9 facturi duplicate pe câte 2 rânduri și 10 nepotriviri de email. **Reparație**: audit charge-cu-charge (email Stripe = autoritate, comparat cu emailul de pe factura Oblio) → 21 de rânduri re-legate strict pe emailul propriu. Audit final: **0 duplicate, 0 nepotriviri pe toate cele 175 de rânduri euristice**, sumele reconciliază pe toate 29.

Nefacturate REALE (4 tranzacții + 1 comandă): hunkjaku 182,30 (extra DHL recreat manual 13.07, fără factură) · ratskawines 307,80 (extra CJO pre-feature) · 50 + 250 RON (Link by Stripe, orderId 122M — sursă neidentificată, nu există în dump WP) · CJO-20260601-85107 305,10 (în afara ferestrei de payouts).

Script de audit reutilizabil: scratchpad `audit_links.js` — de rulat după orice linkare retroactivă.

### Serie unică EGH (decizie user, 14 iul)

CJO emitea pe seria EGI2024 (moștenită din integrarea WP). Pentru decontări liniare, **ambele platforme emit de acum pe seria EGH**: `companies.oblio_series_name` = 'EGH' în DB-ul CJO (setat 14 iul prin REST; codul CJO citește DB-ul, nu env-ul). Istoric: EGI2024 = era WP + CJO până la 14 iul; EGH = eghiseul app + CJO app + emiteri manuale. Extra-ul RATSKA 307,80 fusese facturat MANUAL pe EGH-0016 (9 iul) — legat.

## Faza 2 — Extras de cont BT (LIVE, 14 iul)

**UI:** `/admin/decontari/banca` · **Migrarea 114** (`bank_statement_entries`, aplicată) · **Lib:** `src/lib/accounting/bank-statement.ts`

- **Import CSV BT** („Lista de tranzacții" din BT24): parser cu antet + dedup referințe duplicate (BT refolosește Referinta pe leguri corelate)
- **Categorii automate** (prima regulă câștigă; ordinea contează — POS-urile externe conțin „comision tranzacție 0.00" și trebuie prinse ÎNAINTEA regulii de comisioane): decontări Stripe · traduceri (Kenna Zwenna) · taxe ONRC (POS ONRC București) · taxe ANCPI (NETOPIA) · **furnizori externi** (POS în USD/EUR — Vercel/Google/Amazon; `needs_invoice=true` → alertă roșie „facturi de descărcat/listat pentru contabil, nu apar în SPV") · curierat · salarii · ANAF/Trezorerie · leasing/asigurări auto · combustibil · telecom · comisioane bancă · aport
- **Match payout↔bancă**: credit Stripe cu sumă exactă ±3 zile → `stripe_payouts.bank_matched_at` + link din extras spre decontare. Iunie importat: 19/29 payouts confirmate în bancă (restul = iulie, vin cu extrasul următor)
- Reguli noi de categorisire: se adaugă în `RULES` din `bank-statement.ts`

## Verificare SPV (14 iul)

`invoice/list?withEinvoiceStatus=1` — câmpul `einvoice` = link XML când e trimisă. **Toate cele 398 de facturi active (1 iun–14 iul, EGH 43 + EGI2024 355) sunt trimise în SPV, 0 netrimise.** Facturile furnizorilor STRĂINI (Vercel etc.) nu apar în SPV prin natura lor — de aia există alerta roșie din pagina de bancă.
