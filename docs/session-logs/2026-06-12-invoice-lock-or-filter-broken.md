# Sesiune 2026-06-12 — Factură Oblio duplicată DIN NOU (E-260612-QT376) — lock-ul atomic nu a funcționat niciodată

**Status:** ✅ Cauză reală găsită + lock reparat + test de regresie; rămâne storno EGI2024-24097 în Oblio
**Fișiere:**
- `src/lib/oblio/ensure-invoice.ts` (claim rescris fără `.or()`)
- `tests/unit/lib/oblio/ensure-invoice.test.ts` (nou — 8 teste, inclusiv cursa webhook/confirm-payment)
- `.claude/rules/database.md` (regulă nouă: niciodată `.or()` pe mutații)

---

## Incident

Comanda `E-260612-QT376` (396 RON, card) a generat **2 facturi în Oblio**, ambele încasate:
- `EGI2024-24097` (06:04:49.78 UTC) — orfană, comanda NU pointează la ea
- `EGI2024-24098` (06:04:50.89 UTC) — pe comandă (`invoice_number`)

Același simptom ca pe 10 iunie (E-260610-ZHGXB), DEȘI lock-ul atomic din migrarea 049 +
helper-ul centralizat `ensureInvoiceForPaidOrder` (sesiunile din 10 iunie) erau live.

## Cauza reală — filtrul `.or()` pe UPDATE e respins de PostgREST

Dovezi (replay cu client supabase-js proaspăt, UUID inexistent, reproductibil 100%):

| Query | Rezultat |
|---|---|
| UPDATE cu `invoice_generating_at` doar în body | OK |
| UPDATE + filtru `.is('invoice_generating_at', null)` | OK |
| **UPDATE + filtru `.or(...)` — orice coloană** | **42703 "column does not exist"** |
| SELECT + același filtru `.or(...)` | OK |

Coloana EXISTĂ (verificat direct în Postgres prin pooler). Instanța PostgREST a
Supabase respinge `or=` pe **orice mutație** (UPDATE/DELETE), iar mesajul de
eroare repetă numele coloanei din filtru — complet înșelător.

Lanțul eșecului:
1. Claim-ul de lock (scris pe 10 iunie cu `.or()`) a eșuat la **FIECARE** apel, de la început.
2. Eroarea 42703 + numele coloanei în mesaj se potrivea exact cu regexul căii de
   **graceful degradation** (scrisă pentru cache-ul stale PostgREST) → fiecare
   apelant continua FĂRĂ lock, convins că e problema de cache din 10 iunie.
3. La 06:04, webhook-ul Stripe și `confirm-payment` (fallback-ul de pe pagina de
   succes) au rulat simultan → ambele au degradat → 2 facturi la 1,1 s distanță.
4. Verificarea din 10 iunie a testat `update().eq()` simplu (care merge), NU
   forma reală a claim-ului cu `.or()` → fals „rezolvat".

Dovadă suplimentară: `invoice_generating_at` era `null` pe comandă deși calea de
succes nu îl ștergea — deci nimeni nu a setat vreodată lock-ul.

Singura comandă afectată din 10 iunie încoace (verificat tot `order_history`).

## Rezolvare

### Claim atomic fără `.or()` (două UPDATE-uri condiționale secvențiale)
```
2a. UPDATE ... SET invoice_generating_at = now
    WHERE id = $1 AND invoice_number IS NULL AND invoice_generating_at IS NULL
2b. (dacă 2a = 0 rânduri) UPDATE ... SET invoice_generating_at = now
    WHERE id = $1 AND invoice_number IS NULL AND invoice_generating_at < now - 2min
```
Fiecare UPDATE e atomic singur (Postgres reevaluează WHERE sub row lock), deci
doi apelanți concurenți nu pot câștiga amândoi. Ambele forme verificate contra
PostgREST-ului de producție.

### Eliberarea lock-ului la succes
Update SEPARAT (best-effort) după scrierea `invoice_number` — nu în același
update, ca un eventual cache stale să nu strice scrierea critică a facturii.

### Test de regresie
`tests/unit/lib/oblio/ensure-invoice.test.ts` — fake supabase care emulează
exact semantica PostgREST de producție (`.or()` pe update → 42703) + simularea
cursei webhook/confirm-payment cu apelul Oblio ținut deschis. Pe codul vechi:
2 facturi (pică). Pe codul nou: 1 factură + `locked`.

### Calea de degradare rămâne
Pentru cache stale REAL (PGRST204) — acum e accesibilă doar în acel caz, nu la
fiecare apel.

## Curățenie necesară (manual)
- **Storno `EGI2024-24097` în Oblio** — ambele facturi sunt încasate, deci
  ștergerea nu mai e posibilă; storno e calea corectă. Comanda pointează
  corect la `EGI2024-24098`, în DB nu e nimic de schimbat.

## Lecții
1. **Verifică forma EXACTĂ a query-ului** contra producției (UUID imposibil —
   erorile apar chiar la 0 rânduri). Un query „similar" care merge nu dovedește nimic.
2. **Căile de degradare pot masca buguri**: regexul generos pe mesajul de eroare
   a transformat un bug de query permanent într-un „cache stale" invizibil.
3. `.or()` pe mutații supabase-js = interzis în acest proiect (regulă în
   `.claude/rules/database.md`).
