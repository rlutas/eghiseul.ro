# Admin Panel Documentation

> Central index for all admin panel documentation, architecture, and implementation plans.

**Last Updated:** 2026-02-17
**Sprint:** 5 - Admin Dashboard
**Overall Status:** Implemented (Phases 1-4 Complete, Phase 5 Pending)

---

## Quick Navigation

| Document | Description | Status |
|----------|-------------|--------|
| [Architecture](./architecture.md) | Full technical specification: layout, pages, components, API endpoints, database schema, implementation phases | Implemented |
| [RBAC & Permissions](./rbac-permissions.md) | Role-based access control system, granular permissions, user management, settings pages | Implemented |
| [Security Audit](./security-audit.md) | Security audit of admin Supabase client, IDOR fixes, RLS policy recommendations | 3/4 Critical Fixed |
| [Workflow Design](./workflow-design.md) | Order processing workflow: status flow, document generation, DOCX templates, template separation, company/lawyer settings, RBAC roles, processing_config, notifications | Design Complete (v1.1) |

---

## Overview

The Admin Panel (`/admin`) is the management interface for eGhiseul.ro, providing order lifecycle management, AWB generation, payment verification, user management, and system configuration.

**Access URL:**
- Local: `http://localhost:3000/admin`
- Production: `https://eghiseul.ro/admin`

**Current Admin User:** `serviciiseonethut@gmail.com` (role: `super_admin`)

---

## Current Implementation Status

### Built and Working

| Feature | Location | Notes |
|---------|----------|-------|
| Admin layout (sidebar + top bar) | `src/app/admin/layout.tsx` | Responsive, collapsible sidebar, permission-filtered nav |
| Admin route protection | `src/middleware.ts` | Checks `role` from `profiles` table (super_admin/employee) |
| RBAC permission system | `src/lib/admin/permissions.ts` | 5 granular permissions, server-side middleware |
| Client-side permission hook | `src/hooks/use-admin-permissions.tsx` | AdminPermissionProvider context + useAdminPermissions |
| Dashboard with live stats | `src/app/admin/page.tsx` | Stats cards, recent orders table, activity feed |
| Dashboard stats API | `/api/admin/dashboard/stats` | Orders today, revenue, pending shipments, pending payments |
| Dashboard activity API | `/api/admin/dashboard/activity` | Recent activity from order_history |
| Orders list with filters | `src/app/admin/orders/page.tsx` | Status, date, service, courier filters |
| Order detail page | `src/app/admin/orders/[id]/page.tsx` | Full order info display |
| AWB generation (Fan Courier + Sameday) | `src/components/admin/awb-section.tsx` | One-click AWB with auto-detect |
| AWB label download (PDF) | `/api/admin/orders/[id]/awb-label` | Print-ready labels |
| AWB cancellation | `/api/admin/orders/[id]/cancel-awb` | Cancel AWB and revert status |
| Payment verification (bank transfer) | `/api/admin/orders/[id]/verify-payment` | Approve/reject with reason |
| GDPR cleanup | `/api/admin/cleanup` | Manual + automatic draft cleanup |
| Order lookup by ID | `/api/admin/orders/lookup` | Quick search |
| Users management page | `src/app/admin/users/page.tsx` | 3 tabs: Employees, Customers, Invitations |
| Employee invite flow | `/api/admin/users/invite` | Email invitation with permissions |
| Invite accept page | `src/app/admin/invite/accept/page.tsx` | Token validation + 8 UI states |
| Employee management | `/api/admin/users/employees` | List, edit permissions, remove |
| Customer management | `/api/admin/users/customers` | List with search/filter, detail view, block/unblock |
| Settings pages | `src/app/admin/settings/page.tsx` | 5 tabs: Services, Couriers, Payments, Date firma & Avocat, System |
| Services settings | `/api/admin/settings/services` | Toggle active, edit price/description |
| General settings | `/api/admin/settings` | Key-value settings from admin_settings table |
| Signature management | Settings > Date firma & Avocat | Company signature, lawyer signature, lawyer stamp (PNG upload via S3) |

### Recently Implemented (Sprint 5)

| Feature | Location | Notes |
|---------|----------|-------|
| Order processing workflow (status flow, contextual buttons) | `src/app/admin/orders/[id]/page.tsx` | ProcessingSection with validated state machine transitions |
| Document generation (DOCX: contracts, imputernicire, cerere) | `src/lib/documents/generator.ts` | docxtemplater + pizzip, mammoth preview, robust error handling (S3/DB failures) |
| Document download in admin | `src/app/admin/orders/[id]/page.tsx` | "Descarca" button on every document row, presigned S3 URL |
| Template separation (individual DOCX templates) | `src/templates/cazier-judiciar/` | 5 templates: contract-prestari, contract-asistenta, imputernicire, cerere-pf, cerere-pj |
| Expanded RBAC roles (5 roles) | `src/lib/admin/permissions.ts` | super_admin, manager, operator, contabil, avocat |
| Company & lawyer data settings tab | Settings > Date firma & Avocat | Company data, lawyer data, document counters |
| Signature management (company, lawyer, stamp) | Settings > Date firma & Avocat | PNG upload via S3 presigned URLs, used in document generation |
| Contract preview in wizard | `src/components/orders/modules/signature/ContractPreview.tsx` | Live preview with signature placeholder replacement |
| Document preview (admin) | `/api/admin/orders/[id]/preview-document` | mammoth DOCX-to-HTML server-side preview with "Descarca DOCX" button, info note, `?print=1` auto-print |
| Document download (admin) | Order detail > ProcessingSection | "Descarca" button on every document row (presigned S3 URL download) |
| Client documents visible in admin | Order detail page | KYC docs, company docs visible |

### Planned (Not Yet Built)

| Feature | Document | Priority |
|---------|----------|----------|
| Service processing_config (per-service document/institution config) | [Workflow Design](./workflow-design.md#14-service-processing-configuration) | HIGH |
| Service tabs on orders page | [Workflow Design](./workflow-design.md#4-orders-page---service-tabs) | HIGH |
| In-app notification system | [Workflow Design](./workflow-design.md#7-notification-system) | MEDIUM |
| Client document access in account | [Workflow Design](./workflow-design.md#8-client-document-access) | MEDIUM |
| Dashboard charts (recharts) | [Architecture](./architecture.md#charts-section-row-2) | MEDIUM |
| Email template editor | [Architecture](./architecture.md#4-email-templates) | LOW |
| Admin activity/audit log | [Architecture](./architecture.md#database-schema-updates) | LOW |
| Rate limiting on draft creation | [Security Audit](./security-audit.md#3-unlimited-draft-creation-high) | HIGH |
| Bulk actions (export CSV/Excel) | - | LOW |

---

## Role System

### Current Roles (Implemented)

| Role | Admin Access | Description |
|------|-------------|-------------|
| `super_admin` | Full | Platform owner. All permissions implicit. Cannot be degraded from UI. |
| `employee` | Limited | Invited staff with granular permissions (JSONB on `profiles.permissions`). **Deprecated -- see Planned Roles below.** |
| `customer` | None | Regular customer. No access to `/admin`. |
| `partner` | None (API only) | Future API partner access. |

### Expanded Roles (Implemented)

The `employee` role has been replaced by specialized roles. See [Workflow Design - Updated RBAC Roles](./workflow-design.md#13-updated-rbac-roles) for full details.

| Role | Admin Access | Description |
|------|-------------|-------------|
| `super_admin` | Full | Platform owner. All permissions implicit. |
| `manager` | Almost full | Team management, reports, approve operations. |
| `operator` | Orders + processing | Process orders, generate documents, create AWB. |
| `contabil` | Payments + invoices | Verify payments, manage Oblio invoices. |
| `avocat` | Legal documents | View/sign imputerniciri, contracts de asistenta juridica. |

### Permission Matrix (Current -- Implemented)

| Permission | super_admin | employee | customer |
|------------|:-----------:|:--------:|:--------:|
| `orders.view` | Always | If granted | Never |
| `orders.manage` | Always | If granted | Never |
| `payments.verify` | Always | If granted | Never |
| `users.manage` | Always | If granted | Never |
| `settings.manage` | Always | If granted | Never |

### Permission Matrix (Implemented -- With Expanded Roles)

| Permission | super_admin | manager | operator | contabil | avocat |
|------------|:-----------:|:-------:|:--------:|:--------:|:------:|
| `orders.view` | Always | Yes | Yes | Yes (payment orders) | Yes (own docs) |
| `orders.manage` | Always | Yes | Yes | No | No |
| `payments.verify` | Always | Yes | No | Yes | No |
| `users.manage` | Always | Yes | No | No | No |
| `settings.manage` | Always | Yes | No | No | No |
| `documents.generate` | Always | Yes | Yes | No | No |
| `documents.view` | Always | Yes | Yes | Yes | Yes |
| `documents.sign` | Always | No | No | No | Yes |

**Dependency rules (enforced in middleware):**
- `orders.manage` requires `orders.view`
- `payments.verify` requires `orders.view`
- `documents.generate` requires `orders.view` and `documents.view`
- `documents.sign` requires `documents.view`

**Implementation files:**
- Server-side: `src/lib/admin/permissions.ts` (checkPermission, requirePermission, getUserPermissions, requireAdmin, ALL_PERMISSIONS)
- Client-side: `src/hooks/use-admin-permissions.tsx` (AdminPermissionProvider, useAdminPermissions)
- Database: Migration 023 (role constraints, permissions JSONB, employee_invitations, admin_settings)
- Database: Migration 024 (blocked_at column on profiles)

**Details:** See [RBAC & Permissions](./rbac-permissions.md) for the current permission system. See [Workflow Design - Updated RBAC Roles](./workflow-design.md#13-updated-rbac-roles) for the planned expansion.

---

## Admin Pages

| Page | Route | Permission Required | Status |
|------|-------|-------------------|--------|
| Dashboard | `/admin` | Any admin role | Implemented |
| Orders List | `/admin/orders` | `orders.view` | Implemented |
| Order Detail | `/admin/orders/[id]` | `orders.view` | Implemented |
| Users - Employees | `/admin/users` (tab) | `users.manage` | Implemented |
| Users - Customers | `/admin/users` (tab) | `users.manage` | Implemented |
| Users - Invitations | `/admin/users` (tab) | `users.manage` | Implemented |
| Settings | `/admin/settings` | `settings.manage` | Implemented |
| Invite Accept | `/admin/invite/accept` | Public (token-based) | Implemented |

---

## Admin API Endpoints

### All Implemented

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/admin/orders/lookup` | GET | `orders.view` | Lookup order by ID |
| `/api/admin/orders/list` | GET | `orders.view` | List orders with filters |
| `/api/admin/orders/[id]/verify-payment` | POST | `payments.verify` | Verify bank transfer |
| `/api/admin/orders/[id]/generate-awb` | POST | `orders.manage` | Generate shipping AWB |
| `/api/admin/orders/[id]/awb-label` | GET | `orders.manage` | Download AWB label PDF |
| `/api/admin/orders/[id]/cancel-awb` | POST | `orders.manage` | Cancel AWB |
| `/api/admin/cleanup` | GET, POST | `settings.manage` | GDPR cleanup |
| `/api/admin/dashboard/stats` | GET | Any admin | Dashboard statistics |
| `/api/admin/dashboard/activity` | GET | Any admin | Recent activity feed |
| `/api/admin/users/invite` | POST | `users.manage` | Send employee invitation |
| `/api/admin/users/invitations` | GET | `users.manage` | List pending invitations |
| `/api/admin/users/invitations/[id]` | DELETE | `users.manage` | Revoke invitation |
| `/api/admin/users/employees` | GET | `users.manage` | List employees |
| `/api/admin/users/employees/[id]` | PATCH, DELETE | `users.manage` | Edit/remove employee |
| `/api/admin/users/customers` | GET | `users.manage` | List customers (paginated) |
| `/api/admin/users/customers/[id]` | GET, PATCH | `users.manage` | Customer details/block |
| `/api/admin/settings` | GET, PATCH | `settings.manage` | General admin settings |
| `/api/admin/settings/services` | GET, PATCH | `settings.manage` | Services config |
| `/api/admin/invite/accept` | GET, POST | Public (token) | Validate/accept invitation |

### Recently Added Endpoints

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/admin/orders/[id]/process` | POST | `orders.manage` | Transition order status (validated state machine) |
| `/api/admin/orders/[id]` | GET | `orders.view` | Order detail with documents and option statuses |
| `/api/admin/orders/[id]/generate-document` | POST | `orders.manage` | Generate DOCX document (contract, imputernicire, cerere) |
| `/api/admin/orders/[id]/preview-document` | GET | `documents.view` | Preview DOCX as HTML via mammoth (server-side), includes "Descarca DOCX" button, `?print=1` auto-print |
| `/api/contracts/preview` | POST | Public (no auth) | Contract preview for wizard signature step |

### Planned (Not Yet Built)

| Endpoint | Method | Permission | Description |
|----------|--------|------------|-------------|
| `/api/admin/orders/[id]/notes` | GET, POST | `orders.view` | Order notes |
| `/api/admin/settings/email-templates` | GET, PATCH | `settings.manage` | Email templates |

---

## Implementation Phases

### Phase 1: RBAC Foundation -- COMPLETE

Priority: HIGH | Completed: 2026-02-16

1. [x] Database migration (role constraints, permissions JSONB, employee_invitations table, admin_settings table)
2. [x] Permission middleware (`src/lib/admin/permissions.ts`)
3. [x] Update admin layout with permission context
4. [x] Add permission checks to all existing admin endpoints (7 endpoints)
5. [x] Client-side `useAdminPermissions()` hook + AdminPermissionProvider
6. [x] Migration 024: blocked_at column on profiles

**Details:** [RBAC Plan - Faza 1](./rbac-permissions.md#5-plan-de-implementare)

### Phase 2: User Management -- COMPLETE

Priority: HIGH | Completed: 2026-02-16

1. [x] Employees tab (list, permission badges, invite button)
2. [x] Employee invitation flow (modal, API, accept page with 8 states)
3. [x] Permission editor per employee (PATCH permissions)
4. [x] Customers tab (list, search, filter, pagination)
5. [x] Customer actions (block/unblock, view details)
6. [x] Invitations tab (list pending, revoke)

**Details:** [RBAC - User Management](./rbac-permissions.md#2-user-management-adminusers)

### Phase 3: Settings Pages -- COMPLETE

Priority: MEDIUM | Completed: 2026-02-16 (updated 2026-02-17)

1. [x] Settings layout with 5 tabs
2. [x] Services settings (toggle active, edit price/description)
3. [x] Courier settings (display configuration)
4. [x] Payment settings (display configuration)
5. [x] Date firma & Avocat (company data, lawyer data, document counters)
6. [x] Signature management (company signature, lawyer signature, lawyer stamp -- PNG upload via S3)
7. [x] System settings (display configuration)
8. [ ] Email templates editor (deferred to Sprint 6)

**Details:** [RBAC - Settings](./rbac-permissions.md#3-pagina-de-setari-adminsettings)

### Phase 4: Dashboard Enhancement -- COMPLETE

Priority: HIGH | Completed: 2026-02-16

1. [x] Stats API with aggregated data
2. [x] Stats cards (orders today, revenue, pending shipments, pending payments)
3. [x] Recent orders table
4. [x] Activity feed from order_history
5. [ ] Charts with recharts (deferred)

**Details:** [Architecture - Dashboard Page](./architecture.md#dashboard-page)

### Phase 5: Orders Management -- PARTIALLY DONE

Priority: HIGH

1. [x] Orders list with filters and search
2. [x] Order detail page with all sections
3. [x] AWB generation (Fan Courier + Sameday)
4. [x] Payment verification
5. [ ] Order status change (inline dropdown)
6. [ ] Internal notes system
7. [ ] Bulk actions (export CSV/Excel)

**Details:** [Architecture - Orders Management](./architecture.md#orders-management)

### Phase 6: Polish & Security -- NOT STARTED

Priority: MEDIUM

1. [ ] Audit logging for all admin actions
2. [ ] Rate limiting on sensitive endpoints
3. [ ] Error boundaries per section
4. [ ] Skeleton loading states
5. [ ] Mobile responsive improvements

**Details:** [Architecture - Security](./architecture.md#security-considerations), [Security Audit](./security-audit.md)

---

## Database Tables (Admin-specific)

| Table | Status | Purpose |
|-------|--------|---------|
| `profiles` (role, permissions, blocked_at columns) | Implemented (Migrations 023, 024, 025) | User roles (5 roles), permissions, block status |
| `employee_invitations` | Implemented (Migration 023) | Track employee invitation tokens with RLS |
| `admin_settings` | Implemented (Migration 023) | Configurable key-value settings with RLS |
| `order_documents` | Implemented (Migration 025) | Generated/uploaded documents per order |
| `order_option_status` | Implemented (Migration 025) | Extras completion tracking (translation, apostille) |
| `services.processing_config` (JSONB column) | Planned ([Workflow Design](./workflow-design.md#14-service-processing-configuration)) | Per-service document templates, institution, lawyer requirement |
| `notifications` | Planned ([Workflow Design](./workflow-design.md#7-notification-system)) | In-app employee notifications |
| `order_notes` | Planned | Internal admin notes on orders |
| `admin_activity_log` | Planned | Audit trail for admin actions |

### Admin Settings Keys

| Key | Purpose | Notable Fields |
|-----|---------|----------------|
| `sender_address` | Courier sender address | company, street, city, county, postalCode |
| `bank_details` | Bank transfer IBAN, bank name, holder | iban, bank_name, account_holder |
| `maintenance_mode` | Maintenance mode toggle + message | enabled, message |
| `notifications` | Email/SMS notification toggles | email_enabled, sms_enabled |
| `company_data` | Company data for contracts | name, cui, registration_number, address, iban, bank, **signature_s3_key** |
| `lawyer_data` | Lawyer data for imputerniciri | cabinet_name, lawyer_name, professional_address, cif, imputernicire_series, fee, **signature_s3_key**, **stamp_s3_key** |
| `document_counters` | Auto-increment document numbering | contract_number, imputernicire_number |

---

## Security Summary

- **Authentication:** Middleware checks `role` from `profiles` table for all `/admin` routes (super_admin or employee)
- **Authorization:** RBAC with 5 granular permissions enforced on every admin API endpoint
- **Client-side:** AdminPermissionProvider context hides UI elements without permission (not source of truth)
- **Server-side:** requirePermission() middleware on all endpoints (source of truth)
- **RLS:** Database-level policies on employee_invitations and admin_settings
- **PII Protection:** CNP, phone, email masked in customer list views
- **Invitations:** Cryptographically secure tokens, 7-day expiry, single-use, validated server-side
- **Audit Trail:** Planned `admin_activity_log` table for all admin actions
- **Rate Limiting:** Planned for draft creation and invitation endpoints

For the full security audit, see [Security Audit](./security-audit.md).

---

## Known Issues Fixed

### Session: 16 Februarie 2026 - Critical Bug Fixes

**1. Middleware Role Check Fix**
- **Issue:** Middleware was checking `profile?.role !== 'admin'`, blocking all access since role was changed to `super_admin` and `employee`
- **Fix:** Updated `src/lib/supabase/middleware.ts` to check `!['super_admin', 'employee'].includes(profile.role)`
- **Impact:** Admin panel now accessible with new RBAC roles

**2. Admin Orders Source-of-Truth Fix**
- **Issue:** Admin pages (`/admin/orders` and `/admin`) were using `createClient()` (browser-side, subject to RLS policy `auth.uid() = user_id`), causing admins to only see their own orders
- **Fix:** Updated pages to call API endpoints that use `createAdminClient()` (service role, bypasses RLS):
  - `src/app/admin/orders/page.tsx` - now calls `/api/admin/orders/list`
  - `src/app/admin/page.tsx` - dashboard `fetchRecentOrders` now calls the API
- **Impact:** Admins can now see all orders as intended

**3. PostgREST JSONB Search Fix**
- **Issue:** `/api/admin/orders/list` used incorrect syntax `customer_data->>contact->>email` for nested JSONB traversal
- **Fix:** Corrected to `customer_data->contact->>email` (PostgREST nested JSON path syntax)
- **Impact:** Admin order list email search now works correctly

---

## Key Source Files

| File | Purpose |
|------|---------|
| `src/app/admin/layout.tsx` | Admin layout (sidebar, top bar, auth check, permission context) |
| `src/app/admin/page.tsx` | Dashboard page (stats cards, recent orders, activity feed) |
| `src/app/admin/orders/page.tsx` | Orders list |
| `src/app/admin/orders/[id]/page.tsx` | Order detail (processing section, documents, timeline) |
| `src/app/admin/users/page.tsx` | Users management (3 tabs: employees, customers, invitations) |
| `src/app/admin/settings/page.tsx` | Settings (5 tabs: services, couriers, payments, date firma & avocat, system) |
| `src/app/admin/invite/accept/page.tsx` | Invite acceptance page (8 states) |
| `src/components/admin/awb-section.tsx` | AWB generation component |
| `src/components/admin/payment-verification.tsx` | Payment verification component |
| `src/middleware.ts` | Route protection (admin check) |
| `src/lib/supabase/admin.ts` | Admin Supabase client (bypasses RLS) |
| `src/lib/admin/permissions.ts` | Permission middleware (checkPermission, requirePermission, getUserPermissions, requireAdmin) |
| `src/hooks/use-admin-permissions.tsx` | Client-side AdminPermissionProvider + useAdminPermissions hook |
| `src/lib/documents/generator.ts` | Document generation (docxtemplater + pizzip) |
| `src/lib/aws/s3.ts` | S3 operations (includes `generateDocumentKey()`, `generateSignatureKey()`) |
| `src/templates/cazier-judiciar/*.docx` | DOCX templates for Cazier Judiciar service |
| `src/templates/shared/*.docx` | Shared DOCX templates (contract-complet) |
| `src/components/orders/modules/signature/ContractPreview.tsx` | Contract preview in wizard (signature step) |
| `src/app/api/contracts/preview/route.ts` | Contract preview API (public, no auth) |
| `src/app/api/admin/orders/[id]/generate-document/route.ts` | Document generation with signatures |
| `src/app/api/admin/orders/[id]/preview-document/route.ts` | Document preview (mammoth DOCX-to-HTML) |
| `src/app/api/admin/orders/[id]/process/route.ts` | Order status transitions (state machine) |
| `src/app/api/upload/route.ts` | Presigned URL generation (supports 'signatures' category) |
| `src/app/api/admin/users/invite/route.ts` | POST invite employee |
| `src/app/api/admin/users/invitations/route.ts` | GET list invitations |
| `src/app/api/admin/users/invitations/[id]/route.ts` | DELETE revoke invitation |
| `src/app/api/admin/users/employees/route.ts` | GET list employees |
| `src/app/api/admin/users/employees/[id]/route.ts` | PATCH/DELETE employee |
| `src/app/api/admin/users/customers/route.ts` | GET list customers |
| `src/app/api/admin/users/customers/[id]/route.ts` | GET/PATCH customer |
| `src/app/api/admin/invite/accept/route.ts` | GET/POST invite acceptance |
| `src/app/api/admin/settings/route.ts` | GET/PATCH admin settings |
| `src/app/api/admin/settings/services/route.ts` | GET/PATCH services config |
| `src/app/api/admin/dashboard/stats/route.ts` | GET dashboard statistics |
| `src/app/api/admin/dashboard/activity/route.ts` | GET recent activity |
