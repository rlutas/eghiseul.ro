# Mașini salvate (saved vehicles)

Clientul logat își salvează mașinile (nr înmatriculare + date) împreună cu termenele **ITP / asigurare RCA / rovinietă**, le **refolosește** în wizard (cazier auto / rovinietă) și vede **când expiră** fiecare termen.

## DB — `user_saved_vehicles` (migrația 082)
Coloane: `id`, `user_id` (→ profiles, CASCADE), `label`, `plate_number` (obligatoriu), `vin`, `brand`, `model`, `year`, `driving_license`, `itp_expiry`, `insurance_expiry`, `rovinieta_expiry`, `is_default`, `created_at`, `updated_at`.
- Index pe `user_id`; unic pe „default" per user.
- **RLS**: 4 policies (select/insert/update/delete) cu `auth.uid() = user_id` → fiecare vede doar mașinile lui.

## API (user-scoped, RLS)
| Metodă | Rută | Acțiune |
|---|---|---|
| GET | `/api/user/vehicles` | listează mașinile userului |
| POST | `/api/user/vehicles` | adaugă (whitelist câmpuri; default unic) |
| PATCH | `/api/user/vehicles/[id]` | actualizează |
| DELETE | `/api/user/vehicles/[id]` | șterge |

Notă: `user_saved_vehicles` nu e încă în tipurile generate Supabase → clientul e castat `Db = any` în rute.

## UI cont — tab „Mașinile mele"
`src/components/account/VehiclesTab.tsx` (înregistrat în `AccountTabs`, URL `/account?tab=vehicles`):
- listă carduri cu nr înmatriculare + marcă/model/an + **badge-uri de expirare** (ITP/RCA/rovinietă): 🟢 valabil · 🟠 ≤30 zile · 🔴 expirat;
- adaugă / editează / șterge / marchează implicită.

## Wizard — prefill
`SavedVehiclePicker` (în `VehicleDataStep`): la user logat cu mașini salvate, apare un dropdown „Folosește o mașină salvată" → completează automat plate/VIN/marcă/model/an/permis (editabile). Guest → nu apare.

## Logica de expirare (testată)
`src/lib/vehicles/expiry.ts` — `expiryStatus(date, now?)` → `{ tone, days, text }`. Pură + testabilă. Teste: `tests/unit/vehicles/expiry.test.ts` (5).

## Backlog / viitor
- **Remindere email** automate (cron) când ITP/RCA/rovinietă expiră în X zile (acum doar badge vizual în cont).
- Prefill și pe pasul de rovinietă (categorie/perioadă) dacă se salvează.
