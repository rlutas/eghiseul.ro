# 2026-07-30 — Taxele ONRC/ANCPI se înregistrează SINGURE ca cost intern

Raul: workerii știu exact cât costă fiecare serviciu (ei plătesc taxele) și salvează
și chitanțe — echipa nu trebuie să mai introducă manual taxa în pop-up-ul de
costuri de pe `/admin/costuri-furnizori` / finalizarea comenzii.

## Cum funcționează acum

La fiecare job de worker care ajunge pe **DONE** (`/api/onrc/result`,
`/api/ancpi/result`), se inserează automat un rând în `order_supplier_costs`
(categoria `taxa_institutie`), idempotent (un singur rând per comandă; retry-urile
sar). Livrarea NU e blocată de o eroare la înregistrarea costului.

**Rezolvarea sumei, în ordine** (`src/lib/admin/auto-supplier-cost.ts`):

1. **Taxă fixă portal** (sursa: constantele workerului / docs):
   - ONRC după `detail.documentType`: firma/PF = **30 lei**, istoric = **250 lei**
     (oglindă la `worker-onrc/src/onrc/api-submit.ts`, taxele 7515/7715).
   - ANCPI după `service_type`: EXTRAS_CF = **20 lei × nr. imobile** (prodId 1420).
2. **Chitanța ANCPI din S3** citită cu Gemini — DOAR fallback: pe preplătit
   chitanța ePay arată **0,00 lei** (plata iese din puncte cumpărate în avans),
   deci nu poate fi sursa primară. Gardă: 0 / >2000 lei = respins.
3. **Tariful flat din Setări → Furnizori** (`taxa_institutie` + serviceSlug) × nr.
   imobile — pentru viitoare servicii ANCPI neautomatizate încă.
4. Nimic → rândul rămâne în pop-up-ul manual, ca înainte.

Descrierea rândului spune de unde vine suma: „Auto — worker ANCPI · nr. înreg.
69000 · taxă fixă portal". Pop-up-ul de finalizare NU mai cere taxa (categoria
există deja pe comandă → `existingKeys` o filtrează).

## Backfill istoric — RULAT

`scripts/backfill-institution-fees-2026-07-30.ts` (dry-run implicit, `--apply`
scrie): toate cele **32 de joburi DONE** au acum cost înregistrat — 24 ONRC
(30/250 lei după variantă) + 7 ANCPI (20 lei) + 1 preexistent manual.

## Limite cunoscute

- Uploadul MANUAL de document (operator, `onrc-upload`/`ancpi-upload` după
  NEEDS_OPERATOR) nu auto-înregistrează — operatorul a plătit pe alt drum, suma
  rămâne pe pop-up-ul manual.
- Tarifele `taxa_institutie` din Setări sunt în continuare NULL — nu mai e nevoie
  de ele pentru constatator + extras CF (taxă fixă în cod), dar serviciile ANCPI
  viitoare (plan cadastral, identificări) vor cădea pe tarif → de completat când
  se automatizează.
- Dacă ONRC/ANCPI schimbă taxele, se actualizează `onrcFeeRon`/`ancpiFeeRon`
  (un singur loc, comentat cu sursa).
