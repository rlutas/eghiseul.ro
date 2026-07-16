# 2026-07-16 — Decontări: nume client lipsă la comenzile eGhișeul fără KYC

**Simptom:** în `/admin/decontari`, rândurile eGhișeul afișau doar emailul (fără nume), în timp ce CJO avea nume. Excepție: comenzile cu scanare CI (cazier) aveau nume.

**Cauza:** `src/lib/accounting/payout-sync.ts` construia numele DOAR din `customer_data.personal` (datele din scanarea actului). Serviciile imobiliare (Extras CF, Identificare imobil etc.) nu au scanare CI → `personal` gol → nume gol. Comenzile pe firmă la fel.

## Fix

- **Lanț de fallback la enrichment:** `personal` (KYC) → `billing.firstName/lastName` (persoana de pe factură) → `billing.companyName` → `company.companyName`.
- **Baseline din Stripe:** `client_name` se inițializează acum din `charge.billing_details.name` (numele de pe card, colectat de Checkout) — acoperă și rândurile WP-era/nematchuite.

## Backfill

Sync-ul face **upsert** pe `stripe_payout_transactions` → după deploy, un click pe **„Sincronizează"** (sau „Backfill 90 zile") în `/admin/decontari` rescrie toate rândurile cu numele corecte. Audit la zi: 9 rânduri eGhișeul fără nume, toate rezolvabile din `customer_data` (6 PF + 3 firme: DAMPOP, RNWE, BLU IT).
