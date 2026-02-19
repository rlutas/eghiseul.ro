# Admin Panel - RBAC, User Management & Settings

> **Status:** Implementat (Fazele 1-4 Complete)
> **Prioritate:** Users + Permissions -> Settings -> Dashboard Stats
> **Creat:** 2026-02-16
> **Implementat:** 2026-02-16

---

## 1. Sistemul de Roluri si Permisiuni (RBAC)

### 1.1 Roluri

| Rol | Descriere | Poate fi sters? |
|-----|-----------|-----------------|
| `super_admin` | Proprietar platforma (serviciiseonethut@gmail.com) | NU |
| `employee` | Angajat invitat cu permisiuni granulare | DA |
| `manager` | Manager cu acces extins (aproape toate permisiunile) | DA |
| `operator` | Operator comenzi si documente | DA |
| `contabil` | Contabil (vizualizare comenzi + verificare plati) | DA |
| `avocat` | Avocat (vizualizare comenzi + documente) | DA |
| `customer` | Client obisnuit (fara acces admin) | N/A |
| `partner` | Partener API (existent, viitor) | N/A |

### 1.2 Permisiuni Granulare

7 permisiuni individuale, stocate ca JSONB pe `profiles.permissions`:

| Permisiune | Ce permite |
|------------|------------|
| `orders.view` | Vizualizare lista comenzi, detalii comanda, timeline |
| `orders.manage` | Generare AWB, descarcare eticheta, anulare AWB, schimbare status |
| `payments.verify` | Aprobare/respingere transfer bancar, verificare plati |
| `users.manage` | Invitare/stergere angajati, editare permisiuni, vizualizare clienti |
| `settings.manage` | Configurare servicii, preturi, curieri, email templates, sistem |
| `documents.generate` | Generare documente (contracte, imputerniciri, cereri) din template-uri DOCX |
| `documents.view` | Vizualizare si descarcare documente generate (preview mammoth) |

### 1.3 Roluri Extended (5 roluri admin)

| Rol | Permisiuni implicite |
|-----|----------------------|
| `super_admin` | Toate (implicit, fara verificare JSONB) |
| `manager` | `orders.view`, `orders.manage`, `payments.verify`, `users.manage`, `settings.manage`, `documents.generate`, `documents.view` |
| `operator` | `orders.view`, `orders.manage`, `documents.generate`, `documents.view` |
| `contabil` | `orders.view`, `payments.verify`, `documents.view` |
| `avocat` | `orders.view`, `documents.view` |

**Reguli:**
- `super_admin` are TOATE permisiunile implicit (nu se verifica JSONB)
- `employee` are DOAR permisiunile bifate in JSONB
- `orders.manage` necesita implicit `orders.view`
- `payments.verify` necesita implicit `orders.view`
- `documents.generate` necesita implicit `documents.view` si `orders.view`
- `documents.view` necesita implicit `orders.view`

### 1.4 Modificari Baza de Date

#### Migration: Actualizare constraint role + adaugare permissions

```sql
-- 1. Actualizare constraint pe profiles.role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'super_admin', 'employee', 'partner'));

-- 2. Adaugare coloana permissions (JSONB)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- 3. Migrare rol admin existent -> super_admin
UPDATE profiles SET role = 'super_admin'
  WHERE email = 'serviciiseonethut@gmail.com' AND role = 'admin';

-- 4. Index pentru query-uri pe rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 5. Tabel invitatii angajati
CREATE TABLE IF NOT EXISTS employee_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  role TEXT NOT NULL DEFAULT 'employee',
  permissions JSONB NOT NULL DEFAULT '{}',
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS pe employee_invitations
ALTER TABLE employee_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage invitations"
  ON employee_invitations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Employees with users.manage can view invitations"
  ON employee_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'employee'
      AND (permissions->>'users.manage')::boolean = true
    )
  );
```

### 1.5 Middleware de Permisiuni (Server-side)

**Nou fisier: `src/lib/admin/permissions.ts`**

```typescript
export type Permission =
  | 'orders.view'
  | 'orders.manage'
  | 'payments.verify'
  | 'users.manage'
  | 'settings.manage'
  | 'documents.generate'
  | 'documents.view';

export async function checkPermission(
  userId: string,
  required: Permission | Permission[]
): Promise<boolean> {
  // 1. Fetch profile
  // 2. super_admin -> return true always
  // 3. employee -> check permissions JSONB
  // 4. Altfel -> return false
}

export async function requirePermission(
  userId: string,
  required: Permission | Permission[]
): Promise<void> {
  // Throws 403 if not authorized
}
```

**Actualizare toate endpoint-urile admin existente:**
- `/api/admin/orders/list` -> necesita `orders.view`
- `/api/admin/orders/lookup` -> necesita `orders.view`
- `/api/admin/orders/[id]` -> necesita `orders.view`
- `/api/admin/orders/[id]/generate-awb` -> necesita `orders.manage`
- `/api/admin/orders/[id]/awb-label` -> necesita `orders.manage`
- `/api/admin/orders/[id]/cancel-awb` -> necesita `orders.manage`
- `/api/admin/orders/[id]/process` -> necesita `orders.manage`
- `/api/admin/orders/[id]/verify-payment` -> necesita `payments.verify`
- `/api/admin/orders/[id]/generate-document` -> necesita `orders.manage`
- `/api/admin/orders/[id]/preview-document` -> necesita `orders.manage`

### 1.6 Client-side Permission Check

**Nou fisier: `src/hooks/use-admin-permissions.ts`**

```typescript
export function useAdminPermissions() {
  // Returns: { role, permissions, hasPermission(p), isSuperAdmin }
  // Loaded from admin layout context
}
```

**Admin Layout actualizat:**
- Stocheaza permissions in context
- Ascunde nav items fara permisiune
- Exemplu: "Utilizatori" vizibil doar cu `users.manage`

---

## 2. User Management (`/admin/users`)

### 2.1 Tab "Angajati"

**Componente:**
- Lista angajatilor cu: nume, email, rol, permisiuni active, data invitarii
- Badge-uri colorate pentru fiecare permisiune
- Buton "Invita angajat" (doar super_admin sau users.manage)
- Actiuni per angajat: editare permisiuni, dezactivare, stergere

**Invitatie Flow:**
1. Admin apasa "Invita angajat"
2. Modal: email + **dropdown rol** (employee, avocat, manager, operator, contabil) + checkboxes permisiuni
3. POST `/api/admin/users/invite` -> creaza record in `employee_invitations` (cu `role` column) + trimite email
4. Email contine link: `/admin/invite/accept?token=xxx`
5. Link -> verificare token ->
   - Daca are cont: actualizare role din invitatie + setare permissions
   - Daca nu are cont: redirect la register cu token, apoi auto-role
6. Invitatia expira in 7 zile

**Role Selector:** Modalul de invitatie contine un dropdown pentru selectarea rolului. Rolul selectat este salvat in coloana `role` din `employee_invitations` si este aplicat automat la acceptarea invitatiei. Rolurile disponibile: `employee`, `avocat`, `manager`, `operator`, `contabil`.

**RoleBadge:** Toate cele 6 roluri admin au badge-uri cu culori distincte in UI:
| Rol | Culoare Badge |
|-----|--------------|
| `super_admin` | Rosu |
| `manager` | Albastru |
| `operator` | Verde |
| `contabil` | Galben |
| `avocat` | Mov |
| `employee` | Gri |

**Editare Rol:** Modalul de editare permisiuni permite si schimbarea rolului angajatului. Lista angajati afiseaza toate rolurile admin (nu doar employee/super_admin).

**API Endpoints noi:**
```
POST   /api/admin/users/invite          - Trimite invitatie (accepts optional `role` parameter: employee, avocat, manager, operator, contabil)
GET    /api/admin/users/invitations     - Lista invitatii pending
DELETE /api/admin/users/invitations/[id] - Revoca invitatie
GET    /api/admin/users/employees       - Lista angajati
PATCH  /api/admin/users/employees/[id]  - Editare permisiuni
DELETE /api/admin/users/employees/[id]  - Stergere angajat (revert la customer)
GET    /api/admin/invite/accept         - Accept invitatie (public)
POST   /api/admin/invite/accept         - Procesare accept
```

### 2.2 Tab "Clienti"

**Componente:**
- Tabel clienti: nume, email, telefon, KYC status, nr. comenzi, data inregistrare
- Cautare: email, nume, CNP, telefon
- Filtrare: KYC status (verified/partial/unverified), activ/blocat
- Click pe client -> detalii:
  - Info profil
  - KYC documente (vizualizare, nu editare)
  - Istoric comenzi
  - Buton blocare/deblocare

**API Endpoints noi:**
```
GET    /api/admin/users/customers       - Lista clienti (paginat)
GET    /api/admin/users/customers/[id]  - Detalii client
PATCH  /api/admin/users/customers/[id]  - Blocare/deblocare
```

---

## 3. Pagina de Setari (`/admin/settings`)

### 3.1 Servicii

- Lista serviciilor active/inactive
- Toggle activare/dezactivare
- Editare pret, descriere, features, optiuni
- Editare `verification_config` (JSON editor simplu)
- Previzualizare wizard cu configuratia curenta

**API:**
```
GET    /api/admin/settings/services         - Lista servicii
PATCH  /api/admin/settings/services/[id]    - Editare serviciu
PATCH  /api/admin/settings/services/[id]/options - Editare optiuni serviciu
```

### 3.2 Curieri

- Configurare Fan Courier: credentiale, client ID, serviciu implicit
- Configurare Sameday: credentiale, demo/production
- Adresa expeditor (comuna pentru ambii)
- Test conexiune (buton verificare credentiale)

**API:**
```
GET    /api/admin/settings/couriers         - Configurare curieri
PATCH  /api/admin/settings/couriers         - Salvare configurare
POST   /api/admin/settings/couriers/test    - Test conexiune
```

### 3.3 Plati

- Configurare Stripe: publishable key, secret key, webhook secret
- IBAN pentru transfer bancar
- Configurare Oblio: client ID, secret, CIF, serie factura
- Test conexiune per provider

**API:**
```
GET    /api/admin/settings/payments         - Configurare plati
PATCH  /api/admin/settings/payments         - Salvare configurare
POST   /api/admin/settings/payments/test    - Test conexiune
```

### 3.4 Email Templates

- Lista template-uri (confirmare comanda, plata, expeditie, factura)
- Editor text cu variabile disponibile ({order_number}, {customer_name}, etc.)
- Previzualizare email
- Send test email

**API:**
```
GET    /api/admin/settings/email-templates         - Lista template-uri
PATCH  /api/admin/settings/email-templates/[id]    - Editare template
POST   /api/admin/settings/email-templates/[id]/test - Test send
```

### 3.5 Sistem

- GDPR: interval cleanup, vizualizare ultimul run
- Notificari: activare/dezactivare email/SMS per eveniment
- Maintenance mode: activare/dezactivare cu mesaj custom
- Cron jobs: status, ultimul run, fortare manuala

**API:**
```
GET    /api/admin/settings/system          - Setari sistem
PATCH  /api/admin/settings/system          - Salvare setari
POST   /api/admin/settings/system/maintenance - Toggle maintenance
```

---

## 4. Dashboard Complet (`/admin`)

### 4.1 Stats Cards (rand sus)

4 carduri cu date live:
- **Comenzi azi** - numar + comparatie cu ieri
- **Venituri luna** - suma + comparatie luna trecuta
- **De expediat** - comenzi cu status document_ready
- **Plati de verificat** - transferuri bancare pending

### 4.2 Grafic Comenzi (mijloc)

- Bar chart - comenzi pe ultimele 30 zile
- Linii colorate per status (platite, expediate, finalizate)
- Librarie: recharts (deja populara cu Next.js)

### 4.3 Comenzi Recente (stanga jos)

- Tabel compact cu ultimele 10 comenzi
- Coloane: nr., client, serviciu, status, total, data
- Link "Vezi toate" -> `/admin/orders`

### 4.4 Activitate Recenta (dreapta jos)

- Feed cronologic cu actiuni recente (24h)
- Sursa: `order_history` table
- Evenimente: AWB generat, plata verificata, comanda noua, etc.
- Iconite + timestamp relativ ("acum 5 min")

**API:**
```
GET    /api/admin/dashboard/stats          - Statistici agregate
GET    /api/admin/dashboard/chart          - Date grafic (30 zile)
GET    /api/admin/dashboard/activity       - Activitate recenta
```

---

## 5. Plan de Implementare

### Faza 1: RBAC Foundation (Prioritate MAXIMA)
1. **Migration DB** - Actualizare roles constraint, adaugare permissions JSONB, creare employee_invitations
2. **Permission middleware** - `src/lib/admin/permissions.ts` cu checkPermission/requirePermission
3. **Actualizare admin layout** - Permission context, nav items conditionate
4. **Actualizare endpoints existente** - Adaugare permission checks pe toate rutele admin
5. **Hook client-side** - `useAdminPermissions()` pentru UI conditionals

### Faza 2: User Management
6. **Employees tab** - Lista angajati, badge-uri permisiuni
7. **Invite flow** - Modal invitatie, email, accept page
8. **Permission editor** - Editare permisiuni per angajat
9. **Customers tab** - Lista clienti, cautare, detalii
10. **Customer actions** - Blocare/deblocare, vizualizare KYC

### Faza 3: Settings Pages
11. **Settings layout** - Sub-navigare cu tabs
12. **Services settings** - CRUD servicii, optiuni, preturi
13. **Courier settings** - Configurare Fan Courier + Sameday
14. **Payment settings** - Stripe, IBAN, Oblio
15. **Email templates** - Editor + previzualizare
16. **System settings** - GDPR, notificari, maintenance

### Faza 4: Dashboard Enhancement
17. **Stats API** - Endpoint agregare date
18. **Stats cards** - 4 carduri cu date live
19. **Chart** - Grafic comenzi 30 zile (recharts)
20. **Activity feed** - Activitate recenta din order_history
21. **Recent orders** - Tabel compact

### Faza 5: Polish & Security
22. **Audit log** - Log toate actiunile admin
23. **Rate limiting** - Pe invitatii si actiuni sensibile
24. **Error boundaries** - Pe fiecare sectiune admin
25. **Loading states** - Skeleton screens
26. **Mobile responsive** - Toate paginile noi

---

## 6. Setari Stocate in DB vs ENV

### Raman in .env.local (secrete):
- Chei API (Stripe secret, Supabase service role, AWS, etc.)
- Parole curieri (Fan Courier, Sameday)
- Credentiale Oblio

### Muta in DB (configurabile din admin):
- Servicii active/inactive, preturi, optiuni
- Adresa expeditor
- Template-uri email
- GDPR interval cleanup
- Maintenance mode status
- Notificari activare/dezactivare

### Tabel nou: `admin_settings`
```sql
CREATE TABLE admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exemple:
-- key: 'sender_address', value: {"name": "eGhiseul.ro SRL", "county": "Satu Mare", ...}
-- key: 'maintenance_mode', value: {"enabled": false, "message": ""}
-- key: 'gdpr_cleanup_days', value: {"draft": 7, "anonymize": true}
-- key: 'notifications', value: {"email_on_payment": true, "sms_on_shipping": true}
```

---

## 7. Securitate

### Permission Enforcement
- **Server-side**: Fiecare endpoint verifica permisiunea prin middleware
- **Client-side**: UI ascunde elemente, dar NU e sursa de adevar
- **Double-check**: Chiar daca UI ascunde un buton, API-ul refuza fara permisiune

### Protectii Super Admin
- `super_admin` nu poate fi degradat din UI
- Doar super_admin poate invita cu permisiunea `users.manage`
- Doar super_admin poate accesa `settings.manage` initial

### Audit Trail
- Toate actiunile admin loggate in `order_history` sau tabel dedicat `admin_audit_log`
- Cine a facut, ce a facut, cand, IP (optional)

### Invitatii
- Token-uri criptografic sigure (crypto.randomUUID sau similar)
- Expirare 7 zile
- Single-use (marcat accepted dupa utilizare)
- Rate limiting: max 10 invitatii/ora

---

## 8. Navigation Admin Actualizata

```
Sidebar:
+-- Dashboard           [vizibil pentru toti]
+-- Comenzi             [orders.view]
+-- Utilizatori         [users.manage]
+-- Setari              [settings.manage]
+-- Deconectare         [vizibil pentru toti]
```

Fiecare item din sidebar apare DOAR daca angajatul are permisiunea corespunzatoare.
Super admin vede tot.

---

## 9. Implementation Notes

> Aceasta sectiune documentiaza fisierele si migratiile create in implementare.

### 9.1 Database Migrations

| Migration | File | Description |
|-----------|------|-------------|
| 023 | `supabase/migrations/023_rbac_permissions.sql` | Role constraints (super_admin, employee, customer, partner), permissions JSONB, employee_invitations table with RLS, admin_settings table with RLS, admin->super_admin migration |
| 024 | `supabase/migrations/024_blocked_at.sql` | blocked_at column on profiles for customer blocking |
| 026 | `supabase/migrations/026_invitation_role_column.sql` | Added `role` column (default: 'employee') to `employee_invitations` table |

### 9.2 Server-side Permission System

| File | Purpose |
|------|---------|
| `src/lib/admin/permissions.ts` | Core permission middleware: `checkPermission()`, `requirePermission()`, `getUserPermissions()`, `requireAdmin()`, `ALL_PERMISSIONS` constant |

**Exports:**
- `Permission` type: `'orders.view' | 'orders.manage' | 'payments.verify' | 'users.manage' | 'settings.manage' | 'documents.generate' | 'documents.view'`
- `checkPermission(userId, required)` - Returns boolean
- `requirePermission(userId, required)` - Throws 403 NextResponse if unauthorized
- `getUserPermissions(userId)` - Returns `{ role, permissions, isSuperAdmin }`
- `requireAdmin(userId)` - Checks super_admin or employee role
- `ALL_PERMISSIONS` - Array of all 7 permissions
- `PERMISSION_DEPENDENCIES` - Map of permission dependency chains
- `ROLE_DEFAULTS` - Default permissions per role (manager, operator, contabil, avocat)

### 9.3 Client-side Permission Hook

| File | Purpose |
|------|---------|
| `src/hooks/use-admin-permissions.tsx` | React context provider + hook for client-side permission checks |

**Exports:**
- `AdminPermissionProvider` - Context provider (wraps admin layout children)
- `useAdminPermissions()` - Returns `{ role, permissions, hasPermission(p), isSuperAdmin }`

### 9.4 API Routes (Created)

| File | Endpoint | Methods |
|------|----------|---------|
| `src/app/api/admin/users/invite/route.ts` | `/api/admin/users/invite` | POST |
| `src/app/api/admin/users/invitations/route.ts` | `/api/admin/users/invitations` | GET |
| `src/app/api/admin/users/invitations/[id]/route.ts` | `/api/admin/users/invitations/[id]` | DELETE |
| `src/app/api/admin/users/employees/route.ts` | `/api/admin/users/employees` | GET |
| `src/app/api/admin/users/employees/[id]/route.ts` | `/api/admin/users/employees/[id]` | PATCH, DELETE |
| `src/app/api/admin/users/customers/route.ts` | `/api/admin/users/customers` | GET |
| `src/app/api/admin/users/customers/[id]/route.ts` | `/api/admin/users/customers/[id]` | GET, PATCH |
| `src/app/api/admin/invite/accept/route.ts` | `/api/admin/invite/accept` | GET, POST |
| `src/app/api/admin/settings/route.ts` | `/api/admin/settings` | GET, PATCH |
| `src/app/api/admin/settings/services/route.ts` | `/api/admin/settings/services` | GET, PATCH |
| `src/app/api/admin/dashboard/stats/route.ts` | `/api/admin/dashboard/stats` | GET |
| `src/app/api/admin/dashboard/activity/route.ts` | `/api/admin/dashboard/activity` | GET |

### 9.5 Admin Pages (Created)

| File | Route | Description |
|------|-------|-------------|
| `src/app/admin/users/page.tsx` | `/admin/users` | Full users management UI with 3 tabs (Employees, Customers, Invitations) |
| `src/app/admin/settings/page.tsx` | `/admin/settings` | Settings with 4 tabs (Services, Couriers, Payments, System) |
| `src/app/admin/invite/accept/page.tsx` | `/admin/invite/accept` | Invite acceptance page with 8 states |

### 9.6 Updated Existing Files

| File | Change |
|------|--------|
| `src/app/admin/layout.tsx` | Role check updated to super_admin/employee, fetches permissions, wraps children with AdminPermissionProvider, nav items filtered by permission |
| `src/app/admin/page.tsx` | Enhanced dashboard with stats cards, recent orders table, activity feed |
| All 7 existing admin API endpoints | Added `requirePermission()` checks |

### 9.7 Faza Implementation Status

| Faza | Status | Date |
|------|--------|------|
| Faza 1: RBAC Foundation | COMPLETE | 2026-02-16 |
| Faza 2: User Management | COMPLETE | 2026-02-16 |
| Faza 3: Settings Pages | COMPLETE | 2026-02-16 |
| Faza 4: Dashboard Enhancement | COMPLETE | 2026-02-16 |
| Faza 5: Polish & Security | PENDING | - |

### 9.8 Critical Bug Fixes (2026-02-16)

**Issue 1: Middleware role check blocking admin access**
- **File:** `src/lib/supabase/middleware.ts`
- **Problem:** Was checking `profile?.role !== 'admin'` (old role name)
- **Fix:** Changed to `!['super_admin', 'employee'].includes(profile.role)` to match new RBAC roles
- **Impact:** Admin panel now accessible with super_admin and employee roles

**Issue 2: Admin orders source-of-truth (RLS bypass)**
- **Files:** `src/app/admin/orders/page.tsx`, `src/app/admin/page.tsx`
- **Problem:** Admin pages were using `createClient()` (browser-side, subject to RLS `auth.uid() = user_id`), showing only admin's own orders
- **Fix:** Updated to call API endpoints (`/api/admin/orders/list`) that use `createAdminClient()` with service role (bypasses RLS)
- **Impact:** Admins can now see all orders in the system

**Issue 3: PostgREST nested JSONB search syntax**
- **File:** `src/app/api/admin/orders/list/route.ts`
- **Problem:** Used incorrect syntax `customer_data->>contact->>email` for nested JSON traversal
- **Fix:** Corrected to `customer_data->contact->>email` (proper PostgREST syntax: `->` for nested objects, `->>` for final text extraction)
- **Impact:** Admin order list email search now works correctly
