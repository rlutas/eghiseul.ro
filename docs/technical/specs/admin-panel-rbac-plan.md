# Admin Panel - RBAC, User Management & Settings

> **Status:** Plan aprobat, în așteptare implementare
> **Prioritate:** Users + Permissions → Settings → Dashboard Stats
> **Creat:** 2026-02-16

---

## 1. Sistemul de Roluri și Permisiuni (RBAC)

### 1.1 Roluri

| Rol | Descriere | Poate fi șters? |
|-----|-----------|-----------------|
| `super_admin` | Proprietar platformă (serviciiseonethut@gmail.com) | NU |
| `employee` | Angajat invitat cu permisiuni granulare | DA |
| `customer` | Client obișnuit (fără acces admin) | N/A |
| `partner` | Partener API (existent, viitor) | N/A |

### 1.2 Permisiuni Granulare

5 permisiuni individuale, stocate ca JSONB pe `profiles.permissions`:

| Permisiune | Ce permite |
|------------|------------|
| `orders.view` | Vizualizare listă comenzi, detalii comandă, timeline |
| `orders.manage` | Generare AWB, descărcare etichetă, anulare AWB, schimbare status |
| `payments.verify` | Aprobare/respingere transfer bancar, verificare plăți |
| `users.manage` | Invitare/ștergere angajați, editare permisiuni, vizualizare clienți |
| `settings.manage` | Configurare servicii, prețuri, curieri, email templates, sistem |

**Reguli:**
- `super_admin` are TOATE permisiunile implicit (nu se verifică JSONB)
- `employee` are DOAR permisiunile bifate în JSONB
- `orders.manage` necesită implicit `orders.view`
- `payments.verify` necesită implicit `orders.view`

### 1.3 Modificări Bază de Date

#### Migration: Actualizare constraint role + adăugare permissions

```sql
-- 1. Actualizare constraint pe profiles.role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'super_admin', 'employee', 'partner'));

-- 2. Adăugare coloană permissions (JSONB)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- 3. Migrare rol admin existent → super_admin
UPDATE profiles SET role = 'super_admin'
  WHERE email = 'serviciiseonethut@gmail.com' AND role = 'admin';

-- 4. Index pentru query-uri pe rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 5. Tabel invitații angajați
CREATE TABLE IF NOT EXISTS employee_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id),
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

### 1.4 Middleware de Permisiuni (Server-side)

**Nou fișier: `src/lib/admin/permissions.ts`**

```typescript
export type Permission =
  | 'orders.view'
  | 'orders.manage'
  | 'payments.verify'
  | 'users.manage'
  | 'settings.manage';

export async function checkPermission(
  userId: string,
  required: Permission | Permission[]
): Promise<boolean> {
  // 1. Fetch profile
  // 2. super_admin → return true always
  // 3. employee → check permissions JSONB
  // 4. Altfel → return false
}

export async function requirePermission(
  userId: string,
  required: Permission | Permission[]
): Promise<void> {
  // Throws 403 if not authorized
}
```

**Actualizare toate endpoint-urile admin existente:**
- `/api/admin/orders/list` → necesită `orders.view`
- `/api/admin/orders/lookup` → necesită `orders.view`
- `/api/admin/orders/[id]/generate-awb` → necesită `orders.manage`
- `/api/admin/orders/[id]/awb-label` → necesită `orders.manage`
- `/api/admin/orders/[id]/cancel-awb` → necesită `orders.manage`
- `/api/admin/orders/[id]/verify-payment` → necesită `payments.verify`

### 1.5 Client-side Permission Check

**Nou fișier: `src/hooks/use-admin-permissions.ts`**

```typescript
export function useAdminPermissions() {
  // Returns: { role, permissions, hasPermission(p), isSuperAdmin }
  // Loaded from admin layout context
}
```

**Admin Layout actualizat:**
- Stochează permissions în context
- Ascunde nav items fără permisiune
- Exemplu: "Utilizatori" vizibil doar cu `users.manage`

---

## 2. User Management (`/admin/users`)

### 2.1 Tab "Angajați"

**Componente:**
- Lista angajaților cu: nume, email, rol, permisiuni active, data invitării
- Badge-uri colorate pentru fiecare permisiune
- Buton "Invită angajat" (doar super_admin sau users.manage)
- Acțiuni per angajat: editare permisiuni, dezactivare, ștergere

**Invitație Flow:**
1. Admin apasă "Invită angajat"
2. Modal: email + checkboxes permisiuni
3. POST `/api/admin/users/invite` → creează record în `employee_invitations` + trimite email
4. Email conține link: `/admin/invite/accept?token=xxx`
5. Link → verificare token →
   - Dacă are cont: actualizare role=employee + setare permissions
   - Dacă nu are cont: redirect la register cu token, apoi auto-role
6. Invitația expiră în 7 zile

**API Endpoints noi:**
```
POST   /api/admin/users/invite          - Trimite invitație
GET    /api/admin/users/invitations     - Lista invitații pending
DELETE /api/admin/users/invitations/[id] - Revocă invitație
GET    /api/admin/users/employees       - Lista angajați
PATCH  /api/admin/users/employees/[id]  - Editare permisiuni
DELETE /api/admin/users/employees/[id]  - Ștergere angajat (revert la customer)
GET    /api/admin/invite/accept         - Accept invitație (public)
POST   /api/admin/invite/accept         - Procesare accept
```

### 2.2 Tab "Clienți"

**Componente:**
- Tabel clienți: nume, email, telefon, KYC status, nr. comenzi, data înregistrare
- Căutare: email, nume, CNP, telefon
- Filtrare: KYC status (verified/partial/unverified), activ/blocat
- Click pe client → detalii:
  - Info profil
  - KYC documente (vizualizare, nu editare)
  - Istoric comenzi
  - Buton blocare/deblocare

**API Endpoints noi:**
```
GET    /api/admin/users/customers       - Lista clienți (paginat)
GET    /api/admin/users/customers/[id]  - Detalii client
PATCH  /api/admin/users/customers/[id]  - Blocare/deblocare
```

---

## 3. Pagina de Setări (`/admin/settings`)

### 3.1 Servicii

- Lista serviciilor active/inactive
- Toggle activare/dezactivare
- Editare preț, descriere, features, opțiuni
- Editare `verification_config` (JSON editor simplu)
- Previzualizare wizard cu configurația curentă

**API:**
```
GET    /api/admin/settings/services         - Lista servicii
PATCH  /api/admin/settings/services/[id]    - Editare serviciu
PATCH  /api/admin/settings/services/[id]/options - Editare opțiuni serviciu
```

### 3.2 Curieri

- Configurare Fan Courier: credențiale, client ID, serviciu implicit
- Configurare Sameday: credențiale, demo/production
- Adresă expeditor (comună pentru ambii)
- Test conexiune (buton verificare credențiale)

**API:**
```
GET    /api/admin/settings/couriers         - Configurare curieri
PATCH  /api/admin/settings/couriers         - Salvare configurare
POST   /api/admin/settings/couriers/test    - Test conexiune
```

### 3.3 Plăți

- Configurare Stripe: publishable key, secret key, webhook secret
- IBAN pentru transfer bancar
- Configurare Oblio: client ID, secret, CIF, serie factură
- Test conexiune per provider

**API:**
```
GET    /api/admin/settings/payments         - Configurare plăți
PATCH  /api/admin/settings/payments         - Salvare configurare
POST   /api/admin/settings/payments/test    - Test conexiune
```

### 3.4 Email Templates

- Lista template-uri (confirmare comandă, plată, expediție, factură)
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
- Notificări: activare/dezactivare email/SMS per eveniment
- Maintenance mode: activare/dezactivare cu mesaj custom
- Cron jobs: status, ultimul run, forțare manuală

**API:**
```
GET    /api/admin/settings/system          - Setări sistem
PATCH  /api/admin/settings/system          - Salvare setări
POST   /api/admin/settings/system/maintenance - Toggle maintenance
```

---

## 4. Dashboard Complet (`/admin`)

### 4.1 Stats Cards (rând sus)

4 carduri cu date live:
- **Comenzi azi** - număr + comparație cu ieri
- **Venituri luna** - sumă + comparație luna trecută
- **De expediat** - comenzi cu status document_ready
- **Plăți de verificat** - transferuri bancare pending

### 4.2 Grafic Comenzi (mijloc)

- Bar chart - comenzi pe ultimele 30 zile
- Linii colorate per status (plătite, expediate, finalizate)
- Librărie: recharts (deja populară cu Next.js)

### 4.3 Comenzi Recente (stânga jos)

- Tabel compact cu ultimele 10 comenzi
- Coloane: nr., client, serviciu, status, total, data
- Link "Vezi toate" → `/admin/orders`

### 4.4 Activitate Recentă (dreapta jos)

- Feed cronologic cu acțiuni recente (24h)
- Sursa: `order_history` table
- Evenimente: AWB generat, plată verificată, comandă nouă, etc.
- Iconițe + timestamp relativ ("acum 5 min")

**API:**
```
GET    /api/admin/dashboard/stats          - Statistici agregate
GET    /api/admin/dashboard/chart          - Date grafic (30 zile)
GET    /api/admin/dashboard/activity       - Activitate recentă
```

---

## 5. Plan de Implementare

### Faza 1: RBAC Foundation (Prioritate MAXIMĂ)
1. **Migration DB** - Actualizare roles constraint, adăugare permissions JSONB, creare employee_invitations
2. **Permission middleware** - `src/lib/admin/permissions.ts` cu checkPermission/requirePermission
3. **Actualizare admin layout** - Permission context, nav items condiționate
4. **Actualizare endpoints existente** - Adăugare permission checks pe toate rutele admin
5. **Hook client-side** - `useAdminPermissions()` pentru UI conditionals

### Faza 2: User Management
6. **Employees tab** - Lista angajați, badge-uri permisiuni
7. **Invite flow** - Modal invitație, email, accept page
8. **Permission editor** - Editare permisiuni per angajat
9. **Customers tab** - Lista clienți, căutare, detalii
10. **Customer actions** - Blocare/deblocare, vizualizare KYC

### Faza 3: Settings Pages
11. **Settings layout** - Sub-navigare cu tabs
12. **Services settings** - CRUD servicii, opțiuni, prețuri
13. **Courier settings** - Configurare Fan Courier + Sameday
14. **Payment settings** - Stripe, IBAN, Oblio
15. **Email templates** - Editor + previzualizare
16. **System settings** - GDPR, notificări, maintenance

### Faza 4: Dashboard Enhancement
17. **Stats API** - Endpoint agregare date
18. **Stats cards** - 4 carduri cu date live
19. **Chart** - Grafic comenzi 30 zile (recharts)
20. **Activity feed** - Activitate recentă din order_history
21. **Recent orders** - Tabel compact

### Faza 5: Polish & Security
22. **Audit log** - Log toate acțiunile admin
23. **Rate limiting** - Pe invitații și acțiuni sensibile
24. **Error boundaries** - Pe fiecare secțiune admin
25. **Loading states** - Skeleton screens
26. **Mobile responsive** - Toate paginile noi

---

## 6. Setări Stocate în DB vs ENV

### Rămân în .env.local (secrete):
- Chei API (Stripe secret, Supabase service role, AWS, etc.)
- Parole curieri (Fan Courier, Sameday)
- Credențiale Oblio

### Mută în DB (configurabile din admin):
- Servicii active/inactive, prețuri, opțiuni
- Adresă expeditor
- Template-uri email
- GDPR interval cleanup
- Maintenance mode status
- Notificări activare/dezactivare

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
- **Server-side**: Fiecare endpoint verifică permisiunea prin middleware
- **Client-side**: UI ascunde elemente, dar NU e sursa de adevăr
- **Double-check**: Chiar dacă UI ascunde un buton, API-ul refuză fără permisiune

### Protecții Super Admin
- `super_admin` nu poate fi degradat din UI
- Doar super_admin poate invita cu permisiunea `users.manage`
- Doar super_admin poate accesa `settings.manage` inițial

### Audit Trail
- Toate acțiunile admin loggate în `order_history` sau tabel dedicat `admin_audit_log`
- Cine a făcut, ce a făcut, când, IP (opțional)

### Invitații
- Token-uri criptografic sigure (crypto.randomUUID sau similar)
- Expirare 7 zile
- Single-use (marcat accepted după utilizare)
- Rate limiting: max 10 invitații/oră

---

## 8. Navigation Admin Actualizată

```
Sidebar:
├── 📊 Dashboard           [vizibil pentru toți]
├── 📋 Comenzi             [orders.view]
├── 👥 Utilizatori         [users.manage]
├── ⚙️  Setări              [settings.manage]
└── 🚪 Deconectare         [vizibil pentru toți]
```

Fiecare item din sidebar apare DOAR dacă angajatul are permisiunea corespunzătoare.
Super admin vede tot.
