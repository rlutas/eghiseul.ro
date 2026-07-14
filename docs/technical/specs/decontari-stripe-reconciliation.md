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
