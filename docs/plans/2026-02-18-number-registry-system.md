# Number Registry System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the legacy `increment_document_counter` system with a proper number range management and registry journal for Bar Association numbers.

**Architecture:** Two new DB tables (`number_ranges`, `number_registry`) with atomic RPC functions (`allocate_number`, `void_number`, `find_existing_number`). Seven new API endpoints under `/api/admin/settings/number-*`. Integration replaces all `increment_document_counter` calls in `auto-generate.ts` and `generate-document/route.ts`. New admin UI tab "Registru Numere" in existing settings page.

**Tech Stack:** PostgreSQL (via Supabase + `pg` module for DDL), Next.js API routes, TypeScript, React (shadcn/ui), Tailwind v4

**Spec:** `docs/technical/specs/number-registry-system.md`

---

## Task 1: Database Migration - Tables, Functions, Seed Data

**Files:**
- Create: `supabase/migrations/027_number_registry.sql`

**Step 1: Write the migration SQL file**

Create the migration file with the full DDL from spec sections 6 and 7:

```sql
-- Tables: number_ranges, number_registry
-- Functions: allocate_number, void_number, find_existing_number
-- RLS policies, indexes, comments
-- Seed initial ranges from current admin_settings.document_counters
```

Copy the exact SQL from spec sections 6.1, 6.2, 7.1, 7.2, 7.3, and 13 (Faza 2 seed data).

Important notes:
- The `number_registry` table has a trigram index (`gin_trgm_ops`). Check if the `pg_trgm` extension is enabled; if not, add `CREATE EXTENSION IF NOT EXISTS pg_trgm;` at the top.
- The `find_existing_number` function should use the extended version from spec 12.7 that includes `p_service_type` parameter.
- Include the deprecation comment on `increment_document_counter`.

**Step 2: Execute the migration against the database**

Use the `pg` npm module to run the DDL against the Supabase pooler:
- Host: `aws-1-eu-west-2.pooler.supabase.com`
- Port: `6543`
- User: `postgres.llbwmitdrppomeptqlue`
- Password: from `.env.local` `SUPABASE_DB_PASSWORD`
- SSL: `{ rejectUnauthorized: false }`
- Database: `postgres`

Write a temporary Node.js script, run it, then delete it.

**Step 3: Verify migration**

Query both tables to confirm they exist and the seed data is correct:
- `SELECT * FROM number_ranges;` should show 2 rows (contract + delegation)
- `SELECT current_setting('server_version');` to verify connection
- Test `allocate_number('contract')` RPC call via Supabase REST API

**Step 4: Commit**

```bash
git add supabase/migrations/027_number_registry.sql
git commit -m "feat(db): add number_ranges and number_registry tables with RPC functions"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/number-registry.ts`

**Step 1: Create the types file**

Copy the exact interfaces from spec section 8.1:
- `NumberRange`
- `NumberRangeWithStats`
- `NumberRegistryEntry`
- `AllocateNumberResult`
- `FindExistingNumberResult`
- `CreateNumberRangeParams`
- `ManualNumberEntryParams`
- `NumberRegistryFilters`

**Step 2: Update DocumentContext type in generator.ts**

In `src/lib/documents/generator.ts`, update the `document_numbers` field in `DocumentContext`:

```typescript
document_numbers?: {
  contract_number?: number;
  contract_series?: string | null;
  imputernicire_number?: number;
  imputernicire_series?: string;
  registry_ids?: {
    contract?: string;
    delegation?: string;
  };
};
```

**Step 3: Commit**

```bash
git add src/types/number-registry.ts src/lib/documents/generator.ts
git commit -m "feat(types): add NumberRange and NumberRegistryEntry interfaces"
```

---

## Task 3: API Endpoints - Number Ranges (CRUD)

**Files:**
- Create: `src/app/api/admin/settings/number-ranges/route.ts` (GET + POST)
- Create: `src/app/api/admin/settings/number-ranges/[id]/route.ts` (PATCH)

**Step 1: Create GET + POST endpoint for number ranges**

`GET /api/admin/settings/number-ranges`:
- Auth + `requirePermission(userId, 'settings.manage')`
- Query params: `year` (default current), `type`, `status`
- Fetch from `number_ranges` table via adminClient
- Compute stats per range: `total`, `used`, `available`, `usage_percent`
- Return `{ success: true, data: NumberRangeWithStats[] }`

`POST /api/admin/settings/number-ranges`:
- Auth + `requirePermission(userId, 'settings.manage')`
- Body: `CreateNumberRangeParams`
- Validation: range_start > 0, range_end >= range_start, series required for delegation, no overlapping ranges
- Set `next_number = range_start` on insert
- Return created range

**Step 2: Create PATCH endpoint for range update/archive**

`PATCH /api/admin/settings/number-ranges/[id]`:
- Auth + `requirePermission(userId, 'settings.manage')`
- Can update: `notes`, `status` (only to `archived`), `series`
- Cannot change: `range_start`, `range_end`, `type`, `year`
- Return updated range

**Step 3: Verify endpoints**

Test via curl or browser:
- `GET /api/admin/settings/number-ranges?year=2026`
- `POST` a test range (then delete it)

**Step 4: Commit**

```bash
git add src/app/api/admin/settings/number-ranges/
git commit -m "feat(api): add number-ranges CRUD endpoints"
```

---

## Task 4: API Endpoints - Number Registry (List, Manual Entry, Void, Export)

**Files:**
- Create: `src/app/api/admin/settings/number-registry/route.ts` (GET + POST)
- Create: `src/app/api/admin/settings/number-registry/[id]/void/route.ts` (POST)
- Create: `src/app/api/admin/settings/number-registry/export/route.ts` (GET)

**Step 1: Create GET + POST for registry**

`GET /api/admin/settings/number-registry`:
- Auth + `requirePermission(userId, 'settings.manage')`
- Query params: `type`, `year`, `source`, `date_from`, `date_to`, `search`, `order_id`, `page`, `per_page`
- Search uses `ilike` on `client_name`, `client_email`, `client_cnp`, `client_cui`
- Pagination with `total` count
- Return `{ success: true, data: [...], pagination: {...} }`

`POST /api/admin/settings/number-registry`:
- Auth + `requirePermission(userId, 'settings.manage')`
- Body: `ManualNumberEntryParams`
- Calls `allocate_number` RPC with `source = 'manual'`
- Returns the allocated number details

**Step 2: Create void endpoint**

`POST /api/admin/settings/number-registry/[id]/void`:
- Auth + `requirePermission(userId, 'settings.manage')`
- Body: `{ reason: string }`
- Calls `void_number` RPC
- Returns the voided entry

**Step 3: Create CSV export endpoint**

`GET /api/admin/settings/number-registry/export`:
- Auth + `requirePermission(userId, 'settings.manage')`
- Same filters as GET registry (minus pagination)
- Returns CSV with headers: `Nr,Tip,Serie,Data,Client,Email,CNP,CUI,Serviciu,Descriere,Suma,Sursa,Comanda,Anulat,Motiv Anulare`
- Content-Type: `text/csv; charset=utf-8`
- Content-Disposition: `attachment; filename="registru-numere-{year}.csv"`
- Date format: DD.MM.YYYY

**Step 4: Commit**

```bash
git add src/app/api/admin/settings/number-registry/
git commit -m "feat(api): add number-registry endpoints (list, manual, void, export)"
```

---

## Task 5: Update Document Generation - auto-generate.ts

**Files:**
- Modify: `src/lib/documents/auto-generate.ts`

**Step 1: Rewrite number allocation logic**

Current code (lines 170-186) does this for BOTH templates:
```typescript
// WRONG: contract-prestari calls increment_document_counter
const { data: counterResult } = await adminClient.rpc('increment_document_counter', { counter_key: 'contract_number' });
```

Replace with:
1. **`contract-prestari`**: NO Barou number. Uses `friendly_order_id` as identifier. Remove the `increment_document_counter` call entirely.
2. **`contract-asistenta`**: Call `find_existing_number(order_id, 'contract')` first. If found, reuse. If not, call `allocate_number('contract', ...)` with client data.

Key changes:
- Line 176-181: Remove `increment_document_counter` call for `contract-prestari`
- Line 183-186: Replace with `find_existing_number` + `allocate_number` for `contract-asistenta`
- Line 235-237: Fix `docNumber` logic - for `contract-prestari` use `order.friendly_order_id`, for `contract-asistenta` use padded Barou number
- Line 249: Add `registry_id` to metadata
- After insert succeeds (line 239-257), update `number_registry.order_document_id` with the inserted doc ID

**Step 2: Update order_documents insert**

For `contract-prestari`:
```typescript
const docNumber = order.friendly_order_id;
```

For `contract-asistenta`:
```typescript
const docNumber = documentNumbers.contract_number
  ? String(documentNumbers.contract_number).padStart(6, '0')
  : null;
```

**Step 3: Link back to registry**

After successful insert into `order_documents`, get the inserted row's ID and update the registry entry:
```typescript
if (documentNumbers.registry_ids?.contract) {
  await adminClient
    .from('number_registry')
    .update({ order_document_id: insertedDoc.id })
    .eq('id', documentNumbers.registry_ids.contract);
}
```

Note: To get the inserted ID, change the insert to use `.select('id').single()` or use `Prefer: return=representation`.

**Step 4: Verify**

Build check: `npm run build` should succeed (no type errors).

**Step 5: Commit**

```bash
git add src/lib/documents/auto-generate.ts
git commit -m "feat(docs): replace increment_document_counter with allocate_number in auto-generate"
```

---

## Task 6: Update Document Generation - generate-document/route.ts

**Files:**
- Modify: `src/app/api/admin/orders/[id]/generate-document/route.ts`

**Step 1: Replace contract numbering logic**

Current code (lines 137-156):
- Lines 137-139: Calls `increment_document_counter('contract_number')` for ALL contract templates
- Lines 141-156: Calls `increment_document_counter('imputernicire_number')` for imputernicire

Replace with:
1. **`contract-prestari`**: No Barou number, use `friendly_order_id`
2. **`contract-asistenta`** / **`contract-complet`**: `find_existing_number` + `allocate_number('contract')`
3. **`imputernicire`**: `find_existing_number(order_id, 'delegation', service_type)` + `allocate_number('delegation')` -- also fetch contract number for cross-reference

**Step 2: Fix imputernicire document_number bug**

Current code (line 246):
```typescript
document_number: documentNumbers.contract_number ? String(documentNumbers.contract_number).padStart(6, '0') : null,
```

This saves the contract number for ALL doc types including imputernicire. Fix:
```typescript
// Determine document_number based on template type
let docNumber: string | null = null;
if (template === 'contract-prestari') {
  docNumber = order.friendly_order_id;
} else if (['contract-asistenta', 'contract-complet'].includes(template)) {
  docNumber = documentNumbers.contract_number
    ? String(documentNumbers.contract_number).padStart(6, '0')
    : null;
} else if (template === 'imputernicire') {
  docNumber = documentNumbers.imputernicire_number
    ? `${documentNumbers.imputernicire_series || 'SM'}${String(documentNumbers.imputernicire_number).padStart(6, '0')}`
    : null;
}
```

**Step 3: Add registry linkback after insert**

Same pattern as Task 5 Step 3.

**Step 4: Remove `document_counters` from fetched settings**

Line 79: Remove `'document_counters'` from the `in()` array since it's no longer needed.

**Step 5: Verify**

Build check: `npm run build`.

**Step 6: Commit**

```bash
git add src/app/api/admin/orders/[id]/generate-document/route.ts
git commit -m "feat(docs): replace increment_document_counter in generate-document route, fix imputernicire number bug"
```

---

## Task 7: Admin UI - Number Registry Tab

**Files:**
- Modify: `src/app/admin/settings/page.tsx`

This is the largest task. The settings page is a single `page.tsx` file with all tab components inline (ServicesTab, CouriersTab, PaymentsTab, CompanyTab, SystemTab). Add a new `NumberRegistryTab` component following the same pattern.

**Step 1: Add the tab trigger and content**

After the "system" TabsTrigger (line 198), add:
```tsx
<TabsTrigger value="registry">
  <Hash className="h-4 w-4 mr-1.5" />
  Registru
</TabsTrigger>
```

After the "system" TabsContent (line 215), add:
```tsx
<TabsContent value="registry">
  <NumberRegistryTab />
</TabsContent>
```

**Step 2: Build the NumberRegistryTab component**

The component has 5 sections following the spec section 11:

**Section E - Alerts** (top):
- Fetch ranges and check usage_percent
- Show yellow alert if available < 10%
- Show red alert if exhausted or no active range

**Section A - Active Ranges**:
- Cards grouped by type showing progress bars
- Progress bar color: green (<70%), yellow (70-90%), red (>90%)
- Stats: used/total, percentage, next number
- Archive button per range

**Section B - Add Range Dialog**:
- Form: type (select), year (number), range_start, range_end, series (if delegation), notes
- Validation: end >= start, no overlap
- POST to `/api/admin/settings/number-ranges`

**Section C - Registry Journal Table**:
- Filters: type, year, source, date_from, date_to, search
- Table columns: Nr, Tip, Serie, Data, Client, CNP/CUI, Serviciu, Suma, Sursa, Comanda, Actiuni
- Voided rows: strikethrough + red tint
- Pagination
- Order link: clickable to `/admin/orders/{id}`

**Section D - Manual Entry Dialog**:
- Form: type, client_name, cnp, cui, email, service/description, amount, date
- POST to `/api/admin/settings/number-registry`
- Success toast with allocated number

**Export Button**:
- Downloads CSV from `/api/admin/settings/number-registry/export`

Use the same patterns as existing tabs (useState for data, useEffect for fetch, toast for notifications, Dialog for forms, skeleton for loading).

Import types from `@/types/number-registry`.

**Step 3: Verify**

- `npm run build` passes
- Navigate to `/admin/settings`, click "Registru" tab
- Verify ranges display correctly with seed data
- Test add range dialog
- Test manual number entry
- Test void
- Test CSV export

**Step 4: Commit**

```bash
git add src/app/admin/settings/page.tsx
git commit -m "feat(admin): add Registru Numere tab to settings page"
```

---

## Task 8: Data Backfill and Verification

**Step 1: Backfill registry from existing order_documents**

Run the backfill SQL from spec section 13 Faza 3 via the `pg` module.
Use a temporary Node.js script. Only backfill `contract_asistenta` type documents (not `contract_prestari` since those don't consume Barou numbers).

Note the spec's warning: imputernicire backfill may need manual review due to the existing bug where document_number stores contract_number instead of delegation_number. Skip imputernicire backfill for now -- the admin can manually enter historical imputerniciri if needed.

**Step 2: Verify backfill**

```sql
SELECT type, year, COUNT(*) FROM number_registry GROUP BY type, year;
```

Compare counts with expected data.

**Step 3: Commit**

No code changes to commit (data-only operation).

---

## Task 9: Documentation Updates

**Files:**
- Modify: `docs/README.md` - add link to number-registry-system spec
- Modify: `docs/DEVELOPMENT_MASTER_PLAN.md` - mark this task as completed
- Modify: `docs/technical/specs/admin-document-system.md` - add reference to new system

**Step 1: Update docs**

Add the number registry system to the documentation index and mark the relevant sprint task as done.

**Step 2: Build verification**

Final `npm run build` to ensure everything compiles.

**Step 3: Commit**

```bash
git add docs/
git commit -m "docs: add number registry system references"
```

---

## Implementation Order & Dependencies

```
Task 1 (DB Migration) ──► Task 2 (Types) ──► Task 3 (Range APIs) ──┐
                                            └──► Task 4 (Registry APIs) ──┤
                                                                          ├──► Task 7 (Admin UI)
Task 5 (auto-generate.ts) ◄── Task 2                                     │
Task 6 (generate-document) ◄── Task 2                                    │
                                                                          │
Task 8 (Backfill) ◄── Task 1                                             │
Task 9 (Docs) ◄── All tasks                                              │
```

Tasks 3, 4, 5, 6 can run in parallel after Task 2 is done.
Task 7 requires Tasks 3 and 4.
Task 8 can run anytime after Task 1.
Task 9 is last.
