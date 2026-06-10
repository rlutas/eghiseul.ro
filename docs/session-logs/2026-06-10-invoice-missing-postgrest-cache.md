# Sesiune 2026-06-10 (17) — Comenzi plătite fără factură (cache PostgREST + găuri în căile de plată)

**Status:** ✅ Aplicat (factură backfill E-260610-NMU25, cache reîncărcat, cod deployat, build OK)
**Simptom raportat:** „am făcut o comandă - E-260610-NMU25 ... și factura nu o văd!"

---

## Ce se întâmpla

Comanda **E-260610-NMU25** (Cazier Fiscal PF, 198 RON) era **plătită** dar `invoice_number = NULL`
și nu exista niciun eveniment `payment_confirmed` în istoric. Nu era un caz izolat — orice comandă
cu cardul de după un anumit deploy rămânea fără factură.

## Cauza reală (3 probleme suprapuse)

1. **Cache PostgREST stricat (cauza principală).** Migrarea 049 a adăugat coloana
   `orders.invoice_generating_at` cu `ADD COLUMN IF NOT EXISTS`. Pe DB live coloana exista deja
   când a rulat 049 → ALTER-ul a fost **no-op** → **nu** a declanșat trigger-ul Supabase
   `pgrst_ddl_watch` → cache-ul PostgREST nu a aflat de coloană. Astfel claim-ul lock-ului din
   webhook (`UPDATE ... SET invoice_generating_at`) **crăpa în tăcere** cu
   `column orders.invoice_generating_at does not exist` → webhook-ul ieșea devreme → **nicio factură.**
2. **`confirm-payment` nu emitea factură.** Calea de fallback folosită când webhook-ul întârzie/ratează
   (Hosted Checkout) doar marca comanda `paid` — nu crea factura deloc. A doua gaură.
3. **Client PF „N/A" pe factură.** `createInvoiceFromOrder` lua numele/CNP/adresa doar din
   `billing`/`contact`, niciodată din `customer_data.personal` (unde stau datele KYC la billing „self").

## Fix

- **Backfill NMU25:** factură **EGI2024-24077** creată (date corecte: GORBA ALBERTO-GEORGE, CNP, adresă).
- **Cache reîncărcat:** migrare **052** — `COMMENT ON COLUMN` (DDL real → declanșează trigger-ul) +
  `NOTIFY pgrst, 'reload schema'`. Verificat cu client supabase-js nou.
- **Chokepoint unic `lib/oblio/ensure-invoice.ts`** (`ensureInvoiceForPaidOrder`): claim atomic +
  creare Oblio + istoric, **self-heal** (eliberează lock-ul la eșec) și **degradare grațioasă**
  (dacă PostgREST nu vede coloana lock, creează factura oricum, după re-check `invoice_number` ca
  să evite duplicate). Folosit de webhook **și** confirm-payment.
- **`confirm-payment`** emite acum factura + face backfill când comanda e deja plătită fără factură.
- **`createInvoiceFromOrder` PF** are fallback pe `customer_data.personal`.
- **Cron `invoice-health-check`** acum **auto-vindecă** (creează factura) în loc să doar alerteze;
  alertează pe Slack doar comenzile pe care nu le-a putut repara.
- **Regulă nouă** în `.claude/rules/database.md`: migrările care schimbă schema TREBUIE să termine cu
  `NOTIFY pgrst, 'reload schema'` + un DDL real (ex. COMMENT), și verificare cu client nou.

## De ce nu se mai repetă la servicii noi
Facturarea e centralizată într-un singur loc folosit de toate căile de plată → orice serviciu nou pe
checkout-ul standard primește factură. Riscul de cache ține de migrări (nu de serviciu) și e acoperit
de: degradarea grațioasă din cod + cron-ul de auto-vindecare + regula de migrare.

## Fișiere
- `src/lib/oblio/ensure-invoice.ts` (nou), `src/lib/oblio/invoice.ts`, `src/lib/oblio/index.ts`
- `src/app/api/webhooks/stripe/route.ts`, `src/app/api/orders/[id]/confirm-payment/route.ts`
- `src/app/api/cron/invoice-health-check/route.ts`
- `supabase/migrations/052_reload_invoice_lock_schema_cache.sql` (rulat)
- `tests/unit/lib/oblio/invoice.test.ts`, `tests/unit/api/orders-confirm-payment.test.ts`
- `.claude/rules/database.md`

## Verificare
- `tsc` + `eslint` curate; `npm run build` OK.
- Teste: invoice lib 21/21 (inclusiv regresie PF „self"), confirm-payment 11/11.
- NMU25: `invoice_number = EGI2024-24077`, `invoice_issued_at` setat, `invoice_url` setat. ✓
