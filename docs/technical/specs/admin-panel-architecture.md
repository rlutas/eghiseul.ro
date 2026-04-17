# Admin Panel Architecture - Technical Specification

**Version:** 1.0
**Date:** 2026-02-13
**Status:** Ready for Implementation
**Sprint:** 5 - Admin Dashboard
**Owner:** Development Team

---

## Quick Start

### Access the Admin Panel

**URL:**
- Local: `http://localhost:3000/admin`
- Production: `https://eghiseul.ro/admin`

**Authentication:**
The admin panel requires a user with `role` set to `'admin'` or `'employee'` in the `profiles` table.

**Current Admin User:** `serviciiseonethut@gmail.com` (role: admin)

### Setting Admin Role

```bash
# Via Supabase REST API (replace EMAIL with the user's email)
curl -s "https://llbwmitdrppomeptqlue.supabase.co/rest/v1/profiles?email=eq.EMAIL" \
  -H "apikey: SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -X PATCH \
  -d '{"role": "admin"}'
```

### Roles

| Role | Access |
|------|--------|
| `admin` | Full access - orders, AWB generation, users, settings |
| `employee` | Orders & AWB only - cannot manage users or settings |
| `customer` | No admin access - customer account only |

### Admin Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/admin` | Quick stats and links |
| Orders List | `/admin/orders` | All orders with filters, search |
| Order Detail | `/admin/orders/[id]` | Full order info + Generate AWB button |
| Users | `/admin/users` | User management (employees, customers, invitations) + Add User invite for super_admin |
| Registru | `/admin/registru` | Number Registry (Barou) -- ranges, journal, manual entry, void, CSV export, document download |
| Settings | `/admin/settings` | System settings (services, couriers, payments, company/lawyer data, templates, system) |

### AWB Generation Flow

1. Go to `/admin/orders` and find the order
2. Click the order row to open detail page
3. Click "Generează AWB" button (auto-detects Fan Courier or Sameday)
4. AWB is generated and order status changes to "Expediat"
5. Use "Printează Etichetă" to download the label PDF
6. Customer automatically sees tracking in their account

---

## Table of Contents

1. [Overview & Goals](#overview--goals)
2. [Navigation & Layout](#navigation--layout)
3. [Dashboard Page](#dashboard-page)
4. [Orders Management](#orders-management)
5. [AWB Generation Flow](#awb-generation-flow)
6. [Payment Verification](#payment-verification)
7. [User Management](#user-management)
8. [Settings & Configuration](#settings--configuration)
9. [Technical Architecture](#technical-architecture)
10. [Implementation Phases](#implementation-phases)

---

## Overview & Goals

### Purpose

The Admin Panel is a comprehensive management interface for eGhiseul.ro platform administrators to oversee orders, manage users, process payments, generate shipping labels, and configure system settings.

### Key Objectives

- **Order Management:** Full lifecycle management from draft to delivered
- **Payment Processing:** Verify bank transfers, refunds, payment status
- **AWB Generation:** One-click shipping label generation (Fan Courier + Sameday)
- **User Support:** Quick order lookup, customer information, communication tools
- **Analytics:** Real-time statistics, revenue tracking, performance metrics
- **System Configuration:** Service settings, courier options, pricing

### User Roles

| Role | Access Level | Permissions |
|------|-------------|-------------|
| `admin` | Full access | All admin features + settings |
| `employee` | Limited access | View orders, generate AWBs, no settings |
| `user` | No access | N/A |

### Design Principles

1. **Efficiency First:** Minimize clicks for common tasks
2. **Quick Actions:** Inline actions without page reloads
3. **Search Everything:** Fast search across orders, users, AWBs
4. **Visual Clarity:** Clear status badges, color-coded states
5. **Mobile Responsive:** Works on tablets for on-the-go management

---

## Navigation & Layout

### Overall Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN PANEL LAYOUT                                              │
├──────────────┬──────────────────────────────────────────────────┤
│              │  Top Bar                                          │
│  Sidebar     │  - Breadcrumbs                                   │
│  (Fixed)     │  - User Menu                                     │
│              │  - Search                                        │
│              ├──────────────────────────────────────────────────┤
│  - Dashboard │  Page Content                                    │
│  - Comenzi   │  (Dynamic based on selected route)               │
│  - Clienți   │                                                  │
│  - Registru  │                                                  │
│  - Setări    │                                                  │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

### Sidebar Navigation

**File:** `/Users/raul/Projects/eghiseul.ro/src/app/admin/layout.tsx`

```tsx
// Sidebar Items
const navigationItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Comenzi',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: pendingOrdersCount, // Real-time count
  },
  {
    label: 'Clienți',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Registru',
    href: '/admin/registru',
    icon: BookOpen,
    // Number Registry (Barou) - ranges, journal, manual entry, void, CSV export
  },
  {
    label: 'Setări',
    href: '/admin/settings',
    icon: Settings,
    roles: ['admin'], // Admin only
  },
];
```

### Top Bar

**Components:**
- **Breadcrumbs:** `/admin > Comenzi > #E-260213-00123`
- **Global Search:** Omnisearch (orders, users, AWBs)
- **Notifications:** Pending actions (bank transfers, failed deliveries)
- **User Menu:** Profile, logout

### Mobile Layout

**Tablet (768px+):**
- Sidebar collapses to icons only
- Top bar remains

**Mobile (<768px):**
- Sidebar becomes hamburger menu
- Top bar simplified (no breadcrumbs)

---

## Dashboard Page

**Route:** `/admin`
**File:** `/Users/raul/Projects/eghiseul.ro/src/app/admin/page.tsx`

### Wireframe

```
┌───────────────────────────────────────────────────────────────┐
│  Dashboard                                                     │
├───────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │ Comenzi    │ │ Venituri   │ │ Clienți    │ │ Acțiuni    │ │
│  │ Astăzi     │ │ Luna Asta  │ │ Noi        │ │ Pending    │ │
│  │ 127        │ │ 45,890 RON │ │ 34         │ │ 8          │ │
│  │ +12% ↑     │ │ +8% ↑      │ │ +15% ↑     │ │ -2 ↓       │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│                                                                │
│  ┌──────────────────────────────┬─────────────────────────┐   │
│  │ Comenzi pe Status            │ Activitate Recentă      │   │
│  │                              │                         │   │
│  │ ▮▮▮▮▮ Finalizate (78%)       │ • Comandă #E-...        │   │
│  │ ▮▮▮ În procesare (12%)       │   plată confirmată      │   │
│  │ ▮▮ În livrare (7%)           │ • Comandă #E-...        │   │
│  │ ▮ Probleme (3%)              │   AWB generat           │   │
│  │                              │ • Client nou            │   │
│  └──────────────────────────────┴─────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Comenzi Recente                                         │  │
│  ├──────┬──────────┬─────────────┬──────────┬─────────────┤  │
│  │ ID   │ Client   │ Serviciu    │ Status   │ Acțiuni     │  │
│  │ E-.. │ Ion P.   │ Cazier      │ Pending  │ Vezi ⋯     │  │
│  │ E-.. │ Maria S. │ Extras CF   │ Shipped  │ Vezi ⋯     │  │
│  └──────┴──────────┴─────────────┴──────────┴─────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Stats Cards (Row 1)

**Data Sources:**
- **Comenzi Astăzi:** Count of orders with `created_at` = today
- **Venituri Luna Asta:** Sum of `amount_paid` for current month
- **Clienți Noi:** Count of profiles created this month
- **Acțiuni Pending:** Count of orders needing attention (bank transfers, failed delivery)

**Component:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard
    title="Comenzi Astăzi"
    value={todayOrdersCount}
    change={+12}
    trend="up"
    icon={ShoppingCart}
  />
  <StatsCard
    title="Venituri Luna Asta"
    value={`${monthlyRevenue.toLocaleString('ro-RO')} RON`}
    change={+8}
    trend="up"
    icon={DollarSign}
  />
  <StatsCard
    title="Clienți Noi"
    value={newUsersCount}
    change={+15}
    trend="up"
    icon={Users}
  />
  <StatsCard
    title="Acțiuni Pending"
    value={pendingActionsCount}
    change={-2}
    trend="down"
    icon={AlertCircle}
    variant="warning"
  />
</div>
```

### Charts Section (Row 2)

**Left: Orders by Status (Pie Chart)**
- Finalizate (delivered)
- În procesare (processing, document_ready)
- În livrare (shipped)
- Probleme (failed_delivery, returned)

**Right: Recent Activity Feed**
- Last 10 events (order created, payment confirmed, AWB generated, status change)
- Real-time updates via polling or WebSocket

### Recent Orders Table (Row 3)

**Columns:**
- Order ID (E-YYMMDD-XXXXX)
- Customer Name
- Service
- Status Badge
- Actions (Vezi detalii, Generează AWB if applicable)

**Quick Actions:**
- Click row → Navigate to order detail
- Hover → Show quick preview tooltip

---

## Orders Management

### Orders List Page

**Route:** `/admin/orders`
**File:** `/Users/raul/Projects/eghiseul.ro/src/app/admin/orders/page.tsx`

#### Wireframe

```
┌───────────────────────────────────────────────────────────────┐
│  Comenzi                                                       │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Filtre:  [Status ▼] [Dată ▼] [Serviciu ▼] [Curier ▼]  │  │
│  │ Căutare: [___________________________________] 🔍        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Acțiuni: [Export CSV] [Export Excel]                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────┬─────────┬──────────┬─────────┬──────────┬────────┐ │
│  │ ID   │ Client  │ Serviciu │ Plată   │ Status   │ Acțiuni│ │
│  ├──────┼─────────┼──────────┼─────────┼──────────┼────────┤ │
│  │ E-.. │ Ion P.  │ Cazier   │ Card ✓  │ Shipped  │ [Vezi] │ │
│  │ E-.. │ Maria S.│ Extras CF│ Pending │ Pending  │ [Vezi] │ │
│  │ E-.. │ Dan A.  │ Cert.Con │ Transfer│ Pending  │ [Vezi] │ │
│  └──────┴─────────┴──────────┴─────────┴──────────┴────────┘ │
│                                                                │
│  Pagină 1 din 23   [Prev] [1] [2] [3] ... [23] [Next]        │
└───────────────────────────────────────────────────────────────┘
```

#### Filters & Search

**Filter Options:**
- **Status:** Draft, Pending, Processing, Document Ready, Shipped, Delivered, Cancelled
- **Date Range:** Today, This Week, This Month, Custom Range
- **Service:** All, Cazier Fiscal, Extras CF, etc.
- **Courier:** All, Fan Courier, Sameday
- **Payment Method:** All, Card, Bank Transfer
- **Payment Status:** All, Paid, Pending

**Search:**
- Order ID (E-YYMMDD-XXXXX)
- Customer name
- AWB number
- Email
- Phone

#### Table Columns

| Column | Description | Sortable |
|--------|-------------|----------|
| ID | Order number (E-YYMMDD-XXXXX) | Yes |
| Client | Customer name | Yes |
| Serviciu | Service name | Yes |
| Plată | Payment method + status | Yes |
| Status | Order status badge | Yes |
| Dată | Created date | Yes (default desc) |
| Acțiuni | View, Edit, Delete (soft) | No |

#### Bulk Actions

- **Export CSV:** Download filtered orders as CSV
- **Export Excel:** Download filtered orders as Excel
- **Change Status:** Change status for multiple orders
- **Send Email:** Send notification to multiple customers

### Order Detail Page

**Route:** `/admin/orders/[id]`
**File:** `/Users/raul/Projects/eghiseul.ro/src/app/admin/orders/[id]/page.tsx`

#### Page Structure

```
┌───────────────────────────────────────────────────────────────┐
│  Comandă #E-260213-00123                                       │
│  Breadcrumb: Dashboard > Comenzi > #E-260213-00123            │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📋 Informații Comandă                                   │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Status: [Pending ▼]           Dată: 13 Feb 2026         │  │
│  │ Serviciu: Cazier Fiscal       Preț: 180 RON            │  │
│  │ Opțiuni: Procesare Urgentă (+99 RON)                   │  │
│  │ Total: 279 RON (cu livrare)                            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 👤 Date Client                                          │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Nume: Ion Popescu                CNP: 1****3456         │  │
│  │ Email: ion@example.com           Tel: 0740******        │  │
│  │ Adresă: Str. Exemplu 12, Bl. A, Sc. B, Ap. 5           │  │
│  │          București, Sector 1, 012345                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 💳 Plată                                                │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Metodă: Card (Stripe)            Status: ✓ Plătit      │  │
│  │ Sumă: 279 RON                    Dată: 13 Feb 14:30    │  │
│  │ Stripe ID: pi_xxxxxxxxxxxxx                            │  │
│  │ [Vezi Receipt] [Rambursare]                            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 🚚 AWB Generat                                          │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ AWB: 2380123456789               Status: ✓ Expediat    │  │
│  │ Curier: Fan Courier              Serviciu: Standard    │  │
│  │ Tracking: [Link]                                       │  │
│  │ [Printează Etichetă] [Tracking] [Anulează AWB]        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📄 Documente KYC                                        │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ CI Față: [Vizualizare] [Descarcă]                      │  │
│  │ CI Spate: [Vizualizare] [Descarcă]                     │  │
│  │ Selfie: [Vizualizare] [Descarcă]                       │  │
│  │ Status KYC: ✓ Verificat                                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📝 Istoric Comandă                                      │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ ● 13 Feb 14:45 - AWB generat (#2380123456789)          │  │
│  │ ● 13 Feb 14:30 - Plată confirmată (Card, 279 RON)      │  │
│  │ ● 13 Feb 14:25 - Comandă creată                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 💬 Notițe Interne (Admin only)                         │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ [Adaugă notiță...]                                     │  │
│  │                                                         │  │
│  │ - 14 Feb 09:00 (Admin): Client a sunat, document      │  │
│  │   lipsește semnătura. Refăcut.                         │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

#### Sections Breakdown

**1. Order Information Card**
- Status dropdown (change status inline)
- Service details
- Options selected
- Pricing breakdown

**2. Customer Information Card**
- Name (masked CNP for privacy)
- Contact details (masked phone)
- Delivery address
- Client type (PF/PJ)

**3. Payment Card**
- Payment method (Card, Bank Transfer)
- Payment status
- Stripe/Bank reference
- Actions: View receipt, Refund (admin only)

**4. AWB Card** (See [AWB Generation Flow](#awb-generation-flow))
- AWB number
- Courier provider
- Tracking link
- Actions: Print label, Track, Cancel

**5. KYC Documents Card**
- Document viewer (inline preview)
- Download links
- KYC verification status

**6. Order Timeline**
- Chronological history of all order events
- Automated events (payment, AWB, status changes)
- Manual admin actions

**7. Internal Notes**
- Admin-only notes for customer support
- Visible to all admins
- Logged with timestamp + admin name

---

## AWB Generation Flow

**Reference:** `docs/technical/specs/awb-generation-tracking.md`

### Overview

The AWB Generation section is integrated into the order detail page. It automatically detects the courier provider (Fan Courier or Sameday) from the order record and generates the AWB with a single click.

### UI States

#### State 1: No AWB (Initial)

```
┌─────────────────────────────────────────────────────────┐
│ 🚚 Livrare prin Curier                                  │
├─────────────────────────────────────────────────────────┤
│ [Fan Courier Logo]    Standard 24H                      │
│                       Livrare la adresă                 │
│                       18.50 RON (fără TVA)              │
│                                                         │
│                       [Generează AWB]                   │
└─────────────────────────────────────────────────────────┘
```

**Button Behavior:**
- Enabled if: `courier_provider` exists, status = `document_ready`
- Disabled if: No courier selected, AWB already exists
- On click: Call `POST /api/admin/orders/[id]/generate-awb`

#### State 2: Generating (Loading)

```
┌─────────────────────────────────────────────────────────┐
│ 🚚 Livrare prin Curier                                  │
├─────────────────────────────────────────────────────────┤
│ [Fan Courier Logo]    Standard 24H                      │
│                                                         │
│                       [⏳ Se generează AWB...]          │
└─────────────────────────────────────────────────────────┘
```

#### State 3: AWB Generated (Success)

```
┌─────────────────────────────────────────────────────────┐
│ 🚚 AWB Generat                                          │
├─────────────────────────────────────────────────────────┤
│ ✓ Expediat                                              │
│                                                         │
│ AWB: 2380123456789                                      │
│ Curier: Fan Courier - Standard 24H                      │
│ Tracking: https://fancourier.ro/tracking?awb=...       │
│                                                         │
│ [Printează Etichetă] [Track Shipment] [Anulează AWB]   │
└─────────────────────────────────────────────────────────┘
```

**Actions:**
- **Printează Etichetă:** Download PDF label (`GET /api/admin/orders/[id]/awb-label?format=pdf`)
- **Track Shipment:** Open tracking page in new tab
- **Anulează AWB:** Cancel AWB and reset order to `document_ready` (`POST /api/admin/orders/[id]/cancel-awb`)

#### State 4: Error

```
┌─────────────────────────────────────────────────────────┐
│ 🚚 Livrare prin Curier                                  │
├─────────────────────────────────────────────────────────┤
│ ❌ Eroare la generarea AWB                              │
│                                                         │
│ Adresa incompletă: lipsește județul                     │
│                                                         │
│ [Încearcă din nou]                                      │
└─────────────────────────────────────────────────────────┘
```

### Implementation

**Component:** `/Users/raul/Projects/eghiseul.ro/src/components/admin/awb-section.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Printer, MapPin, XCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AWBSectionProps {
  order: {
    id: string;
    courier_provider?: string;
    courier_service?: string;
    courier_quote?: CourierQuote;
    delivery_tracking_number?: string;
    delivery_tracking_url?: string;
    status: string;
  };
  onSuccess?: (awb: string) => void;
}

export function AWBSection({ order, onSuccess }: AWBSectionProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAwb = async () => {
    if (!order.courier_provider) {
      toast.error('Nicio metodă de livrare selectată');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/generate-awb`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Eroare la generarea AWB');
      }

      toast.success(`AWB generat: ${data.data.awb}`);
      onSuccess?.(data.data.awb);
    } catch (err) {
      console.error('AWB generation error:', err);
      setError(err instanceof Error ? err.message : 'Eroare necunoscută');
      toast.error('Nu s-a putut genera AWB');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintLabel = async () => {
    if (!order.delivery_tracking_number) return;

    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/awb-label?format=pdf`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AWB-${order.delivery_tracking_number}.pdf`;
      a.click();
    } catch (err) {
      console.error('Print label error:', err);
      toast.error('Nu s-a putut descărca eticheta');
    }
  };

  const handleCancelAwb = async () => {
    if (!order.delivery_tracking_number) return;

    const confirmed = confirm('Sigur doriți să anulați AWB-ul?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/cancel-awb`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Eroare la anularea AWB');
      }

      toast.success('AWB anulat cu succes');
      onSuccess?.(null);
    } catch (err) {
      console.error('Cancel AWB error:', err);
      toast.error('Nu s-a putut anula AWB');
    }
  };

  // State 1: No AWB
  if (!order.delivery_tracking_number) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Livrare prin Curier</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <XCircle className="w-5 h-5 inline-block mr-2" />
              {error}
              <Button variant="link" onClick={handleGenerateAwb} className="mt-2">
                Încearcă din nou
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    order.courier_provider === 'sameday'
                      ? '/images/couriers/sameday.webp'
                      : '/images/couriers/fancourier.svg'
                  }
                  alt={order.courier_provider === 'sameday' ? 'Sameday' : 'Fan Courier'}
                  width={60}
                  height={40}
                />
                <div>
                  <p className="font-medium">{order.courier_service}</p>
                  <p className="text-sm text-neutral-500">
                    {order.courier_quote?.serviceName || 'Livrare standard'}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleGenerateAwb}
                disabled={generating || !order.courier_provider}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Se generează AWB...
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 mr-2" />
                    Generează AWB
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // State 3: AWB Generated
  return (
    <Card>
      <CardHeader>
        <CardTitle>AWB Generat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-neutral-500">AWB</p>
                <p className="font-mono text-xl font-bold text-secondary-900">
                  {order.delivery_tracking_number}
                </p>
              </div>
            </div>
            <Badge variant="success">Expediat</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrintLabel}>
              <Printer className="w-4 h-4 mr-2" />
              Printează Etichetă
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(order.delivery_tracking_url, '_blank')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Track Shipment
            </Button>
            <Button variant="destructive" onClick={handleCancelAwb}>
              <XCircle className="w-4 h-4 mr-2" />
              Anulează AWB
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/orders/[id]/generate-awb` | POST | Generate AWB (auto-detect provider) |
| `/api/admin/orders/[id]/awb-label` | GET | Download AWB label (PDF/ZPL) |
| `/api/admin/orders/[id]/cancel-awb` | POST | Cancel AWB and reset order |

**See:** `docs/technical/specs/awb-generation-tracking.md` for full API specifications.

---

## Payment Verification

### Overview

Admins can manually verify bank transfer payments when customers upload proof of payment. This section appears on the order detail page when payment method is "bank transfer" and status is "pending payment".

### UI Component

**Location:** Order Detail Page (Payment Card)

```
┌─────────────────────────────────────────────────────────┐
│ 💳 Plată - Transfer Bancar                              │
├─────────────────────────────────────────────────────────┤
│ Status: ⚠️ Așteaptă Verificare                          │
│ Sumă: 279 RON                                           │
│ Referință: PAY-20260213-00123                           │
│                                                         │
│ Dovadă încărcată: [Vizualizare] [Descarcă]             │
│ Dată încărcare: 13 Feb 2026, 14:35                     │
│                                                         │
│ [✓ Confirmă Plata] [✗ Respinge]                        │
└─────────────────────────────────────────────────────────┘
```

### Workflow

1. **Customer uploads proof:** Via order status page or email link
2. **Admin reviews proof:** Views uploaded document (screenshot, PDF)
3. **Admin verifies:** Checks amount, reference, date
4. **Admin confirms:** Clicks "Confirmă Plata"
   - Order status → `processing`
   - Payment status → `paid`
   - Customer receives confirmation email
5. **OR Admin rejects:** Clicks "Respinge"
   - Customer notified with reason
   - Order remains `pending_payment`

### Implementation

**Component:** `/Users/raul/Projects/eghiseul.ro/src/components/admin/payment-verification.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentVerificationProps {
  order: {
    id: string;
    payment_proof_url?: string;
    payment_proof_uploaded_at?: string;
    amount_total: number;
    payment_reference?: string;
  };
  onVerified?: () => void;
}

export function PaymentVerification({ order, onVerified }: PaymentVerificationProps) {
  const [verifying, setVerifying] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleConfirmPayment = async () => {
    setVerifying(true);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Eroare la confirmarea plății');
      }

      toast.success('Plată confirmată cu succes');
      onVerified?.();
    } catch (err) {
      console.error('Payment verification error:', err);
      toast.error('Nu s-a putut confirma plata');
    } finally {
      setVerifying(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectReason.trim()) {
      toast.error('Introduceți un motiv pentru respingere');
      return;
    }

    setVerifying(true);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          reason: rejectReason,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Eroare la respingerea plății');
      }

      toast.success('Plată respinsă');
      onVerified?.();
    } catch (err) {
      console.error('Payment rejection error:', err);
      toast.error('Nu s-a putut respinge plata');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plată - Transfer Bancar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-500">Status</p>
              <Badge variant="warning">Așteaptă Verificare</Badge>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Sumă</p>
              <p className="font-semibold">{order.amount_total} RON</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-neutral-500">Referință</p>
              <p className="font-mono">{order.payment_reference}</p>
            </div>
          </div>

          {order.payment_proof_url && (
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neutral-500" />
                  <div>
                    <p className="font-medium">Dovadă încărcată</p>
                    <p className="text-sm text-neutral-500">
                      {new Date(order.payment_proof_uploaded_at!).toLocaleString('ro-RO')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(order.payment_proof_url, '_blank')}
                  >
                    Vizualizare
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!showRejectForm ? (
            <div className="flex items-center gap-2">
              <Button onClick={handleConfirmPayment} disabled={verifying}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmă Plata
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectForm(true)}
                disabled={verifying}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Respinge
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                placeholder="Motiv respingere (vizibil pentru client)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-2">
                <Button variant="destructive" onClick={handleRejectPayment} disabled={verifying}>
                  Confirmă Respingere
                </Button>
                <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                  Anulează
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### API Endpoint

**Endpoint:** `POST /api/admin/orders/[id]/verify-payment`
**File:** `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/orders/[id]/verify-payment/route.ts`

**Request:**

```json
{
  "action": "approve" | "reject",
  "reason": "Motiv respingere (doar pentru reject)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

**Implementation:** See existing implementation at `/api/admin/orders/[id]/verify-payment`.

---

## User Management

### Users List Page

**Route:** `/admin/users`
**File:** `/Users/raul/Projects/eghiseul.ro/src/app/admin/users/page.tsx`

#### Wireframe

```
┌───────────────────────────────────────────────────────────────┐
│  Clienți                                                       │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Filtre:  [Rol ▼] [Status KYC ▼] [Data Înreg. ▼]        │  │
│  │ Căutare: [___________________________________] 🔍        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────┬─────────────┬────────┬──────────┬──────────┬──────┐│
│  │ ID   │ Nume        │ Email  │ KYC      │ Comenzi  │ Acț. ││
│  ├──────┼─────────────┼────────┼──────────┼──────────┼──────┤│
│  │ 1234 │ Ion Popescu │ ion@.. │ ✓ Verif. │ 5        │ Vezi ││
│  │ 1235 │ Maria S.    │ maria@ │ ⚠️ Partial│ 2        │ Vezi ││
│  │ 1236 │ Dan Andrei  │ dan@.. │ ✗ Neverif│ 0        │ Vezi ││
│  └──────┴─────────────┴────────┴──────────┴──────────┴──────┘│
│                                                                │
│  Pagină 1 din 45   [Prev] [1] [2] [3] ... [45] [Next]        │
└───────────────────────────────────────────────────────────────┘
```

#### Features

**Filters:**
- **Rol:** All, User, Admin
- **KYC Status:** All, Verified, Partial, Unverified
- **Registration Date:** Today, This Week, This Month, All Time

**Search:**
- Name
- Email
- Phone
- CNP (masked)

**Table Columns:**
- User ID
- Full Name
- Email (masked)
- KYC Status Badge
- Orders Count
- Actions (View, Edit, Block)

### User Detail Page

**Route:** `/admin/users/[id]`
**File:** `/Users/raul/Projects/eghiseul.ro/src/app/admin/users/[id]/page.tsx`

#### Sections

1. **User Profile**
   - Name, Email, Phone
   - CNP (masked for privacy)
   - Registration date
   - Last login

2. **KYC Status**
   - Document status (CI front/back, selfie)
   - Verification date
   - Document viewer

3. **Orders History**
   - List of all orders
   - Quick link to order detail

4. **Addresses**
   - Saved addresses
   - Default address

5. **Billing Profiles**
   - PF/PJ billing data
   - Default profile

6. **Admin Actions**
   - Reset password (send email)
   - Block/Unblock user
   - Delete account (soft delete with GDPR compliance)

---

## Settings & Configuration

**Route:** `/admin/settings`
**Access:** Admin role only

### Tabs

#### 1. Services Settings

**Manage services, prices, and options:**

```
┌───────────────────────────────────────────────────────────────┐
│  Servicii                                                      │
├───────────────────────────────────────────────────────────────┤
│  ┌──────────────────┬──────┬────────────┬─────────┬─────────┐ │
│  │ Serviciu         │ Preț │ Opțiuni    │ Activ   │ Acțiuni │ │
│  ├──────────────────┼──────┼────────────┼─────────┼─────────┤ │
│  │ Cazier Fiscal    │ 180  │ 3 opțiuni  │ ✓       │ Edit    │ │
│  │ Extras CF        │ 290  │ 2 opțiuni  │ ✓       │ Edit    │ │
│  │ Cert. Const.     │ 150  │ 1 opțiune  │ ✓       │ Edit    │ │
│  └──────────────────┴──────┴────────────┴─────────┴─────────┘ │
│                                                                │
│  [Adaugă Serviciu Nou]                                         │
└───────────────────────────────────────────────────────────────┘
```

**Features:**
- Edit service price
- Add/Edit/Delete service options
- Enable/Disable service
- Reorder services

#### 2. Courier Settings

**Manage courier providers and credentials:**

```
┌───────────────────────────────────────────────────────────────┐
│  Curieri                                                       │
├───────────────────────────────────────────────────────────────┤
│  Fan Courier                                                   │
│  Username: [__________]                                        │
│  Password: [__________]                                        │
│  Client ID: [__________]                                       │
│  ✓ Activ                                                       │
│  [Testează Conexiune]                                          │
│                                                                │
│  Sameday                                                       │
│  Username: [__________]                                        │
│  Password: [__________]                                        │
│  ✓ Activ  ✗ Use Demo Mode                                     │
│  [Testează Conexiune]                                          │
│                                                                │
│  [Salvează Setări]                                             │
└───────────────────────────────────────────────────────────────┘
```

#### 3. Payment Settings

**Stripe + Oblio configuration:**

```
┌───────────────────────────────────────────────────────────────┐
│  Plăți                                                         │
├───────────────────────────────────────────────────────────────┤
│  Stripe                                                        │
│  Secret Key: [sk_live_***************]                         │
│  Publishable Key: [pk_live_***************]                    │
│  Webhook Secret: [whsec_***************]                       │
│  ✓ Activ                                                       │
│                                                                │
│  Oblio (Facturare)                                             │
│  Client ID: [__________]                                       │
│  Client Secret: [__________]                                   │
│  CIF Companie: [__________]                                    │
│  Serie Facturi: [EGH]                                          │
│  ✓ Activ                                                       │
│                                                                │
│  [Salvează Setări]                                             │
└───────────────────────────────────────────────────────────────┘
```

#### 4. Email Templates

**Customize email notifications:**

```
┌───────────────────────────────────────────────────────────────┐
│  Email Templates                                               │
├───────────────────────────────────────────────────────────────┤
│  Template: [Confirmare Comandă ▼]                              │
│                                                                │
│  Subiect: [Comandă confirmată #{{order_id}}]                  │
│                                                                │
│  Corp:                                                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Bună {{customer_name}},                                 │  │
│  │                                                         │  │
│  │ Comanda ta #{{order_id}} a fost confirmată.            │  │
│  │ Vei primi documentele în {{delivery_days}} zile.       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  Variabile disponibile: {{order_id}}, {{customer_name}}, ...  │
│                                                                │
│  [Previzualizare] [Salvează] [Resetare la Default]            │
└───────────────────────────────────────────────────────────────┘
```

#### 5. System Settings

**General settings:**

```
┌───────────────────────────────────────────────────────────────┐
│  Sistem                                                        │
├───────────────────────────────────────────────────────────────┤
│  GDPR                                                          │
│  Draft Cleanup: [7 zile ▼]                                     │
│  Data Retention: [10 ani ▼]                                    │
│  ✓ Auto-cleanup activ                                          │
│                                                                │
│  Notificări                                                    │
│  ✓ Email notificări pentru clienți                            │
│  ✓ SMS notificări pentru statusuri importante                 │
│  ✓ Admin alerts pentru plăți noi                              │
│                                                                │
│  Mențineză                                                     │
│  [Rulează Cleanup Manual]                                      │
│  [Export Date (GDPR)]                                          │
│  [Backup Database]                                             │
│                                                                │
│  [Salvează Setări]                                             │
└───────────────────────────────────────────────────────────────┘
```

---

## Technical Architecture

### Routing Structure

```
/admin/
├── page.tsx                    # Dashboard
├── layout.tsx                  # Admin layout (sidebar + top bar)
├── orders/
│   ├── page.tsx                # Orders list
│   └── [id]/
│       └── page.tsx            # Order detail
├── users/
│   ├── page.tsx                # Users list (employees, customers, invitations + Add User invite)
│   └── [id]/
│       └── page.tsx            # User detail
├── registru/
│   └── page.tsx                # Number Registry (Barou) - ranges, journal, document links
└── settings/
    └── page.tsx                # Settings tabs
```

### Authentication & Authorization

#### Middleware Protection

**File:** `/Users/raul/Projects/eghiseul.ro/src/middleware.ts` (UPDATE)

```typescript
// Add admin route protection
if (pathname.startsWith('/admin')) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'employee') {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
```

#### RLS Policies (Row-Level Security)

**File:** `/Users/raul/Projects/eghiseul.ro/supabase/migrations/022_admin_rls.sql`

```sql
-- Admin can view all orders
CREATE POLICY "admin_view_all_orders" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'employee')
    )
  );

-- Admin can update all orders
CREATE POLICY "admin_update_all_orders" ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can view all profiles
CREATE POLICY "admin_view_all_profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin
      WHERE admin.id = auth.uid()
      AND admin.role IN ('admin', 'employee')
    )
  );
```

### Database Schema Updates

**Migration:** `022_admin_features.sql`

```sql
-- Add order notes table for admin comments
CREATE TABLE IF NOT EXISTS order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  note TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_notes_order_id ON order_notes(order_id);
CREATE INDEX idx_order_notes_admin_id ON order_notes(admin_id);

-- Add payment proof tracking
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof_uploaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_verified_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_rejection_reason TEXT;

COMMENT ON COLUMN orders.payment_proof_url IS 'S3 URL to bank transfer proof (screenshot/PDF)';
COMMENT ON COLUMN orders.payment_verified_by IS 'Admin who verified/rejected the payment';
COMMENT ON COLUMN orders.payment_rejection_reason IS 'Reason for payment rejection (shown to customer)';

-- Add admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL, -- 'order_status_change', 'payment_verified', 'awb_generated', etc.
  resource_type VARCHAR(50) NOT NULL, -- 'order', 'user', 'service', etc.
  resource_id UUID NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_admin_id ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX idx_admin_activity_action ON admin_activity_log(action);
```

### API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard/stats` | GET | Dashboard statistics |
| `/api/admin/orders/list` | GET | List orders with filters |
| `/api/admin/orders/lookup` | GET | Lookup order by code/email |
| `/api/admin/orders/[id]` | GET | Order details |
| `/api/admin/orders/[id]` | PATCH | Update order status |
| `/api/admin/orders/[id]/notes` | GET, POST | Order notes |
| `/api/admin/orders/[id]/generate-awb` | POST | Generate AWB (see AWB spec) |
| `/api/admin/orders/[id]/awb-label` | GET | Download AWB label |
| `/api/admin/orders/[id]/cancel-awb` | POST | Cancel AWB |
| `/api/admin/orders/[id]/verify-payment` | POST | Verify bank transfer ✅ (exists) |
| `/api/admin/users/customers` | GET | List customers |
| `/api/admin/users/employees` | GET | List employees |
| `/api/admin/users/invitations` | GET | List pending invitations |
| `/api/admin/users/invite` | POST | Invite new employee |
| `/api/admin/users/[id]` | GET | User details |
| `/api/admin/users/[id]` | PATCH | Update user (role, block) |
| `/api/admin/settings/services` | GET, PATCH | Services config |
| `/api/admin/settings/couriers` | GET, PATCH | Courier credentials |
| `/api/admin/settings/payments` | GET, PATCH | Payment settings |
| `/api/admin/cleanup` | GET, POST | GDPR cleanup ✅ (exists) |

### State Management

**Use Server Components + React Query for data fetching:**

```typescript
// Example: Dashboard stats fetching
// /admin/page.tsx

import { createClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/admin/stats-card';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch stats server-side
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date().toISOString().split('T')[0]);

  const { data: monthlyRevenue } = await supabase
    .from('orders')
    .select('amount_paid')
    .eq('status', 'delivered')
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const totalRevenue = monthlyRevenue?.reduce((sum, order) => sum + (order.amount_paid || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Comenzi Astăzi" value={todayOrders?.length || 0} />
        <StatsCard title="Venituri Luna Asta" value={`${totalRevenue} RON`} />
        {/* ... */}
      </div>
    </div>
  );
}
```

### Error Handling

**Consistent error response format:**

```typescript
// API error response
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR",
    "message": "Human-readable error message",
    "details": {} // Optional additional info
  }
}
```

**Error boundaries for UI:**

```tsx
// /admin/error.tsx
'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold text-red-600">Ceva nu a mers bine</h2>
      <p className="text-neutral-600 mt-2">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
      >
        Încearcă din nou
      </button>
    </div>
  );
}
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (4-5 hours)

**Priority:** HIGH
**Dependencies:** None

**Tasks:**
1. Create admin layout with sidebar + top bar
2. Add admin route protection (middleware + RLS)
3. Create database migration for admin features
4. Set up admin role in profiles table
5. Create reusable admin components (StatsCard, DataTable, etc.)

**Files:**
- `/Users/raul/Projects/eghiseul.ro/src/app/admin/layout.tsx`
- `/Users/raul/Projects/eghiseul.ro/src/middleware.ts` (update)
- `/Users/raul/Projects/eghiseul.ro/supabase/migrations/022_admin_features.sql`

**Testing:**
- [ ] Admin layout renders correctly
- [ ] Non-admin users redirected
- [ ] Sidebar navigation works
- [ ] Mobile layout collapses properly

**Estimated Time:** 4-5 hours
**Complexity:** Medium

---

### Phase 2: Dashboard Page (3-4 hours)

**Priority:** HIGH
**Dependencies:** Phase 1

**Tasks:**
1. Create dashboard page with stats cards
2. Implement real-time stats fetching
3. Build orders by status chart
4. Build recent activity feed
5. Build recent orders table

**Files:**
- `/Users/raul/Projects/eghiseul.ro/src/app/admin/page.tsx`
- `/Users/raul/Projects/eghiseul.ro/src/components/admin/stats-card.tsx`
- `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/dashboard/stats/route.ts`

**Testing:**
- [ ] Stats display correct values
- [ ] Charts render properly
- [ ] Recent orders list works
- [ ] Click order → Navigate to detail

**Estimated Time:** 3-4 hours
**Complexity:** Medium

---

### Phase 3: Orders Management (6-8 hours)

**Priority:** HIGH
**Dependencies:** Phase 1

**Tasks:**
1. Create orders list page with filters
2. Implement search functionality
3. Build data table with pagination
4. Create order detail page (all sections except AWB)
5. Implement order status change
6. Build internal notes system
7. Add order timeline

**Files:**
- `/Users/raul/Projects/eghiseul.ro/src/app/admin/orders/page.tsx`
- `/Users/raul/Projects/eghiseul.ro/src/app/admin/orders/[id]/page.tsx`
- `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/orders/route.ts`
- `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/orders/[id]/notes/route.ts`

**Testing:**
- [ ] Filters work correctly
- [ ] Search finds orders
- [ ] Pagination works
- [ ] Order detail loads all data
- [ ] Status change updates order
- [ ] Notes save and display

**Estimated Time:** 6-8 hours
**Complexity:** Medium-High

---

### Phase 4: AWB Generation Integration (2-3 hours)

**Priority:** HIGH
**Dependencies:** Phase 3, AWB Spec (already implemented)

**Tasks:**
1. Add AWB section component to order detail page
2. Integrate existing AWB API endpoints
3. Test AWB generation for Fan Courier
4. Test AWB generation for Sameday
5. Test print label functionality
6. Test cancel AWB functionality

**Files:**
- `/Users/raul/Projects/eghiseul.ro/src/components/admin/awb-section.tsx`
- `/Users/raul/Projects/eghiseul.ro/src/app/admin/orders/[id]/page.tsx` (update)

**Testing:**
- [ ] Generate AWB button shows correct state
- [ ] AWB generation works for both couriers
- [ ] Print label downloads PDF
- [ ] Cancel AWB resets order
- [ ] Error handling displays clearly

**Estimated Time:** 2-3 hours
**Complexity:** Low (APIs already exist)

---

### Phase 5: Payment Verification (3-4 hours)

**Priority:** HIGH
**Dependencies:** Phase 3

**Tasks:**
1. Build payment verification component
2. Add document viewer for payment proof
3. Implement confirm payment logic
4. Implement reject payment logic
5. Add email notifications for payment status

**Files:**
- `/Users/raul/Projects/eghiseul.ro/src/components/admin/payment-verification.tsx`
- `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/orders/[id]/verify-payment/route.ts` (update existing)

**Testing:**
- [ ] Payment proof displays correctly
- [ ] Confirm payment updates order
- [ ] Reject payment with reason works
- [ ] Customer receives email notification

**Estimated Time:** 3-4 hours
**Complexity:** Medium

---

### Phase 6: User Management (5-6 hours)

**Priority:** MEDIUM
**Dependencies:** Phase 1

**Tasks:**
1. Create users list page with filters
2. Implement user search
3. Build user detail page
4. Display KYC documents
5. Show order history
6. Implement user actions (reset password, block, delete)

**Files:**
- `/Users/raul/Projects/eghiseul.ro/src/app/admin/users/page.tsx`
- `/Users/raul/Projects/eghiseul.ro/src/app/admin/users/[id]/page.tsx`
- `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/users/route.ts`
- `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/users/[id]/route.ts`

**Testing:**
- [ ] Users list loads
- [ ] Filters work
- [ ] User detail shows all info
- [ ] KYC documents display
- [ ] Order history links work
- [ ] Block user works
- [ ] Delete user (soft) works

**Estimated Time:** 5-6 hours
**Complexity:** Medium

---

### Phase 7: Settings & Configuration (4-5 hours)

**Priority:** MEDIUM
**Dependencies:** Phase 1

**Tasks:**
1. Create settings page with tabs
2. Build services management tab
3. Build courier settings tab
4. Build payment settings tab
5. Build email templates tab
6. Build system settings tab
7. Implement save/update logic for each tab

**Files:**
- `/Users/raul/Projects/eghiseul.ro/src/app/admin/settings/page.tsx`
- `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/settings/*/route.ts`

**Testing:**
- [ ] All tabs render
- [ ] Services CRUD works
- [ ] Courier credentials save
- [ ] Payment settings save
- [ ] Email template editor works
- [ ] System settings update

**Estimated Time:** 4-5 hours
**Complexity:** Medium

---

### Phase 8: Polish & Testing (4-5 hours)

**Priority:** MEDIUM
**Dependencies:** All phases

**Tasks:**
1. Responsive design fixes
2. Loading states for all actions
3. Error handling improvements
4. Add toast notifications
5. Performance optimization (caching, pagination)
6. Accessibility audit
7. End-to-end testing

**Testing:**
- [ ] Mobile layout works
- [ ] All loading states show
- [ ] Errors display user-friendly messages
- [ ] Pagination doesn't break
- [ ] No memory leaks
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

**Estimated Time:** 4-5 hours
**Complexity:** Medium

---

### Phase 9: Documentation & Deployment (2 hours)

**Priority:** LOW
**Dependencies:** All phases

**Tasks:**
1. Update API documentation
2. Create admin user guide
3. Add environment variables to Vercel
4. Deploy to production
5. Monitor for errors

**Files:**
- `/Users/raul/Projects/eghiseul.ro/docs/technical/api/admin-api.md` (NEW)
- `/Users/raul/Projects/eghiseul.ro/docs/admin/user-guide.md` (NEW)

**Testing:**
- [ ] Documentation complete
- [ ] Admin can follow guide
- [ ] Production deployment successful
- [ ] No errors in logs

**Estimated Time:** 2 hours
**Complexity:** Low

---

### Total Implementation Time

| Phase | Estimated Time | Complexity | Priority |
|-------|---------------|-----------|----------|
| Phase 1: Infrastructure | 4-5 hours | Medium | HIGH |
| Phase 2: Dashboard | 3-4 hours | Medium | HIGH |
| Phase 3: Orders Management | 6-8 hours | Medium-High | HIGH |
| Phase 4: AWB Integration | 2-3 hours | Low | HIGH |
| Phase 5: Payment Verification | 3-4 hours | Medium | HIGH |
| Phase 6: User Management | 5-6 hours | Medium | MEDIUM |
| Phase 7: Settings | 4-5 hours | Medium | MEDIUM |
| Phase 8: Polish & Testing | 4-5 hours | Medium | MEDIUM |
| Phase 9: Documentation | 2 hours | Low | LOW |
| **TOTAL** | **33-42 hours** | **4-5 days** | - |

---

## Security Considerations

### Authentication

- **Admin-only routes:** Middleware checks `role` from `profiles` table
- **Session validation:** Supabase Auth handles token refresh
- **2FA:** Future enhancement (Sprint 6)

### Authorization

- **RLS Policies:** Database-level access control for orders, users
- **Role-based access:** `admin` (full), `employee` (limited), `user` (none)
- **Audit logging:** All admin actions logged to `admin_activity_log`

### Data Protection

- **Masked PII:** CNP, phone, email partially hidden in lists
- **Full data in detail:** Only admin can see full PII
- **S3 presigned URLs:** Time-limited access to KYC documents
- **HTTPS only:** All admin endpoints require HTTPS

### Rate Limiting

- **Admin endpoints:** 100 requests/min per admin user
- **Search endpoints:** 50 requests/min to prevent abuse

---

## Accessibility

### WCAG 2.1 AA Compliance

- **Keyboard navigation:** All interactive elements accessible via keyboard
- **Screen reader support:** Proper ARIA labels and roles
- **Color contrast:** Minimum 4.5:1 for text
- **Focus indicators:** Visible focus states for all interactive elements

### Best Practices

- Use semantic HTML (`<table>`, `<button>`, `<nav>`)
- Proper heading hierarchy (H1 → H2 → H3)
- Alt text for all images
- Form labels for all inputs

---

## Performance

### Optimization Strategies

- **Server-side rendering:** Use Next.js RSC for initial page loads
- **Client-side caching:** React Query for data fetching with stale-while-revalidate
- **Pagination:** Limit table results to 50/page
- **Lazy loading:** Load order details only when needed
- **Database indexes:** Add indexes for common queries (order_id, user_id, status)

### Monitoring

- **Vercel Analytics:** Track page load times
- **Supabase Dashboard:** Monitor query performance
- **Sentry:** Error tracking and alerts

---

**Document Status:** ✅ Ready for Implementation
**Last Modified:** 2026-02-18
**Next Review:** After Phase 3 completion
**Owner:** Development Team
**Sprint:** 5 - Admin Dashboard
