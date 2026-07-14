# 2026-07-14 — Job ANCPI manual din admin (extras CF după identificare)

## Problema

Pentru comenzile de **identificare imobil** (client are doar adresa), operatorul găsea CF-ul cu unealta `/admin/identifica-imobil`, dar apoi trebuia să emită extrasul **de mână** pe ePay ANCPI și să-l încarce manual. Workerul ANCPI știa să facă tot fluxul, dar joburile se creau **doar automat la plată** și **doar pentru slug-ul `extras-carte-funciara`** (`ensure-ancpi-job.ts`).

## Soluția

Operatorul introduce CF-ul găsit direct pe pagina comenzii → workerul emite și livrează extrasul automat.

### Endpoint nou

`POST /api/admin/orders/[id]/ancpi-create-job` — body `{ judet, localitate, identificator, identificatorType?: 'CF'|'CAD'|'TOPO', motiv? }`.

- `requirePermission('orders.manage')`.
- Validează județul contra nomenclatorului ANCPI (`resolveJudetId`), normalizează identificatorul (`effectiveIdentifier`).
- **Guard anti-risipă:** doar comenzi cu `payment_status` `paid`/`succeeded` (extrasul consumă 1 punct din creditul prepaid ePay).
- Inserează `ancpi_jobs` PENDING cu `service_type='EXTRAS_CF'`, `prod_id='14200'`, `detail` în exact forma pe care o așteaptă workerul (identică cu `ensure-ancpi-job.ts`, plus `createdManuallyBy`).
- **409** dacă există deja job pe comandă (index unic `ancpi_jobs.order_id`) — idempotent la dublu-click.
- Loghează eveniment `created_manual` în `ancpi_job_events` (vizibil în jurnalul din `/admin/ancpi`).

### UI

`src/app/admin/ancpi/AncpiCreateJob.tsx` — buton „⚙️ Generează extras CF (worker ANCPI)" pe pagina comenzii admin, sub secțiunea „Date imobil", afișat pentru comenzile **plătite** cu slug `identificare-imobil`, `identificare-imobile-proprietar` sau `extras-carte-funciara` (fallback când auto-queue-ul de la plată n-a pornit — ex. date imobil lipsă).

- Județ + Localitate/UAT = **dropdown-uri din exact aceleași liste ca wizard-ul de pe site** (`COUNTY_NAMES` din `judete.ts` + `uat-nomenclator.json`, dependente: județ → UAT-urile lui) — fără text liber, fără typo-uri pe care workerul nu le poate rezolva. Server-side, localitatea e validată contra nomenclatorului (400 dacă nu există în județ). Prefill din `customer_data.property` doar dacă valorile există în liste.
- Select tip identificator (CF / cadastral / topografic).
- Avertizări live `checkCf` (reformulate pentru operator): CF colectivă → workerul rutează la „Necesită operator"; format vechi / suspect → atenție înainte de a consuma punctul.
- După creare: workerul preia la următorul poll (~1 min); livrarea către client e automată (`/api/ancpi/result` → `deliver.ts`).

### Fluxul complet identificare imobil acum

1. Client comandă cu adresa (fără CF).
2. Operator: `/admin/identifica-imobil` → geoportal → găsește CF.
3. Operator: pagina comenzii → „Generează extras CF" → introduce CF → job PENDING.
4. Worker: plasează pe ePay, plătește din credit, descarcă PDF, livrează clientului. Zero pași manuali rămași.

## Fișiere

- `src/app/api/admin/orders/[id]/ancpi-create-job/route.ts` (nou)
- `src/app/admin/ancpi/AncpiCreateJob.tsx` (nou)
- `src/app/admin/orders/[id]/page.tsx` (montare sub Date imobil)
- `src/app/admin/ancpi/page.tsx` (label eveniment `created_manual`)
- `docs/technical/specs/ancpi-automation-plan.md` (secțiune nouă §11)

## Verificare

- `tsc --noEmit` + ESLint curat; pagina compilează în dev (Turbopack).
- Endpoint fără auth → 401 ✓. Nu s-a creat job pe comenzi reale (ar consuma credit) — prima folosire reală = prima comandă de identificare.
