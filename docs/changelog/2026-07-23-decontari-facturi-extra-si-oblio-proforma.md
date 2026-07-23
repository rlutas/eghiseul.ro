# Decontări: facturi plăți extra + plăți proformă Oblio (2026-07-23)

## Problema (raportată de Raul)

Payout `po_1Tvo1eHGb8JBHhclhYWsTkWR` (23.07) avea un rând „nefacturat":
Eduard Popescu, 527,50 lei. Investigație: plata NU era o comandă din
platformă — cineva din echipă a emis manual **proforma EGIP 0319** din Oblio,
iar clientul a plătit-o prin **link-ul de plată cu cardul al Oblio**
(integrarea Oblio↔Stripe creează propriul Checkout Session pe contul nostru,
cu metadata doar `orderId` = ID-ul intern Oblio). Factura **EGH 0101** exista
în Oblio (emisă la încasare), dar sync-ul n-avea cum s-o lege.

Bonus descoperit la investigație: sync-ul nu citea deloc `extra_billing[]` —
plățile extra prin fluxul nostru (Modifică → link plată) apăreau fie
„nefacturat", fie cu factura ORIGINALĂ a comenzii, nu cu factura extra.

## Fixuri (toate în `src/lib/accounting/`)

### 1. Match pe extra_billing (eghiseul + CJO/ecazier)
`extra-invoice-match.ts` (pure, testat): `extraInvoiceForRow(entries, row)` —
match pe `paymentIntentId` (exact), fallback pe sumă exactă DOAR când e un
singur candidat (ambiguitatea nu ghicește). Aplicat în `enrichEghiseul` +
`enrichCjo` (select-urile includ acum `extra_billing` +
`stripe_payment_intent_id`); factura extra NU se aplică niciodată pe rândul
plății principale (guard pe PI-ul principal al comenzii).

Forme per platformă: eghiseul `{invoice, amount(RON), paymentIntentId}`;
CJO `{invoice, amount_bani, sessionId}` — webhook-ul CJO stochează de-acum și
`paymentIntentId` (patch în repo CJO) ca match-ul să fie exact pe viitor;
intrările istorice se prind pe fallback-ul de sumă.

### 2. Plăți proformă Oblio (`attachOblioProformaInvoices`)
Rândurile încă nefacturate cu `metadata.orderId` pur numeric (semnătura
Oblio) → lookup session (success_url oblio.eu / line item „Plata cu card-ul
pentru Proforma SERIE NNNN", parsat cu `parseOblioProformaDesc`) → căutăm în
lista de facturi Oblio (ultimele 45 zile) factura cu total exact + email
client; match unic → atașăm `SERIE-NNNN` + link. Fără match → rândul rămâne
nefacturat dar cu `service_name = "Proformă Oblio SERIE NNNN"` ca operatorul
să știe ce e. Fail-soft complet (env lipsă / API down → erori în rezultatul
sync-ului, nu crash).

### 3. Punctual
Rândul lui Eduard Popescu: atașat manual EGH-0101
(`scripts/attach-invoice-egh0101-2026-07-23.mjs`), apoi re-rulat sync-ul —
**noul pass l-a re-matchat singur** (validare end-to-end).

## Verificare

- `scripts/run-payout-sync-local.ts` (ENV_FILE cu env de producție) — rulat
  pe 7 zile: 5 payouts / 82 tranzacții / 0 erori; payout-ul problemă acum
  **32/32 facturat**; toate payout-urile recente 100% match.
- Teste noi `tests/unit/lib/accounting/extra-invoice-match.test.ts` (8):
  match PI, fallback sumă CJO, ambiguitate refuzată, FACTURA NEEMISĂ
  ignorată, parser proformă. Suite: 1236 verzi; tsc curat ambele repo-uri.

## Note operaționale

- ecazier: plățile lui merg pe contul Stripe al cabinetului (nu în aceste
  decontări); în sync EJC e mapat istoric la eghiseul — neatins.
- 2 rânduri vechi nefacturate rămase în payouts >7 zile (probabil era WP) —
  se pot prinde cu „Sincronizează" pe 60 zile dacă vrem.
