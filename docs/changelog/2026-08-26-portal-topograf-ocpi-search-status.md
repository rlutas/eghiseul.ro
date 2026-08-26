# 2026-08-26 — Portal topograf: căutare după nr. depunere OCPI, cost automat la CF direct, status setat de el

Cerințele au ieșit din discuția cu Mircea de azi: fluxul lui real e „depun la
ghișeu → primesc un număr → peste 2 zile ridic documentul **cu numărul acela în
mână**" — iar în portal nu putea căuta după el. Plus două fricțiuni: la CF-urile
obținute pe loc (online) trecea degeaba prin formularul de depunere, iar când o
comandă avea o problemă nu putea semnala echipei decât prin notă liberă.

## Ce s-a livrat

**1. Nr. de depunere OCPI e pe comandă și căutabil.**
`POST /api/collaborator/orders/[id]/depunere` salvează acum numărul și în
`customer_data.ocpi_submission` (`registration_number`, `submitted_at`, `by`),
nu doar în nota de istoric. Lista din portal îl expune, intră în haystack-ul
căutării (alături de comandă/CF/localitate) și se afișează sub numărul
comenzii în tabel. Formularul de depunere îl precompletează pe cel salvat —
re-post = corecție, exact ca la cost.

**2. CF obținut direct online → fără depunere, cost înregistrat automat.**
Decizie: acolo nu există nr. de depunere, deci nu i-l mai cerem. La
`upload-pdf` (care oricum livrează într-un pas), dacă serviciul are taxă
cunoscută (`taxe-eliberare.ts` / `processing_config.ancpi_cost_ron`) și comanda
n-are **niciun** rând `ANCPI / taxa_institutie` în `order_supplier_costs`,
costul se inserează singur: taxă × nr. imobile (numărate cu
`cereriForOrderSlug`, ca în restul portalului), cu notă de istoric
„înregistrat automat la livrarea directă". Dacă depunerea sau echipa a pus
deja un cost — nu se atinge nimic: zero dublă contabilizare. Eșecul
auto-costului nu blochează niciodată livrarea (doar log).

**3. Statusul comenzii îl schimbă și el.**
Rută nouă `POST /api/collaborator/orders/[id]/status` + card „Schimbă statusul
comenzii" în pagina de detaliu. Subset din statusurile de **admin** (aceleași
valori, deci echipa vede în admin exact ce a selectat el):

| El vede | Status |
|---|---|
| În lucru (în procesare) | `processing` |
| Depusă la OCPI | `submitted_to_institution` |
| Problemă — necesare informații de la client | `standby` (notă **obligatorie**) |
| Documentul este eliberat | `document_ready` |
| Finalizată | `completed` |

Istoricul se semnează `colaborator: <nume>` cu nota lui — echipa vede în
timeline cine și de ce. Statusurile de bani (`cancelled`, `refunded`,
`cancellation_requested`) sunt blocate server-side.

## Fișiere

- `src/app/api/collaborator/orders/[id]/depunere/route.ts` — salvează `ocpi_submission`
- `src/app/api/collaborator/orders/[id]/status/route.ts` — **nou**
- `src/app/api/collaborator/orders/[id]/upload-pdf/route.ts` — `autoBookAncpiCost`
- `src/app/api/collaborator/orders/route.ts`, `[id]/route.ts` — expun `ocpi_submission`
- `src/app/colaborator/orders/page.tsx` — căutare + afișare nr. OCPI
- `src/app/colaborator/orders/[id]/page.tsx` — card status, prefill nr., hint cost automat

Spec actualizat: `docs/technical/specs/cereri-ocpi-colaborator.md`.
Fără migrări — totul în `customer_data` (jsonb) și tabele existente.
