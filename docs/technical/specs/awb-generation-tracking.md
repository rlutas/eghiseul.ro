# AWB Generation & Tracking System - Technical Specification

**Version:** 1.0
**Date:** 2026-02-13
**Status:** Ready for Implementation
**Sprint:** 5 - Admin Dashboard

---

## Table of Contents

1. [Overview](#overview)
2. [Part 1: Address Fields Refactoring](#part-1-address-fields-refactoring)
3. [Part 2: Admin Panel - AWB Generation](#part-2-admin-panel---awb-generation)
4. [Part 3: Database Changes](#part-3-database-changes)
5. [Part 4: API Endpoints](#part-4-api-endpoints)
6. [Part 5: Customer Tracking UI](#part-5-customer-tracking-ui)
7. [Part 6: Implementation Plan](#part-6-implementation-plan)
8. [Appendix: TypeScript Interfaces](#appendix-typescript-interfaces)

---

## Overview

### Purpose

Implement a comprehensive AWB (Air Waybill) generation and tracking system for the eGhiseul.ro admin panel. This system enables admins to generate shipping labels via Fan Courier and Sameday courier APIs, and provides customers with real-time tracking of their physical document deliveries.

### Goals

- **Admin Efficiency:** One-click AWB generation from order detail page
- **Multi-Courier Support:** Fan Courier + Sameday with automatic provider detection
- **Customer Visibility:** Live tracking timeline in account dashboard and public status page
- **Data Integrity:** Proper address field separation for Fan Courier API requirements
- **Automation:** Background tracking updates with customer notifications

### System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                       eGhiseul.ro Platform                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐         ┌─────────────────┐                │
│  │  Admin Panel   │────────▶│ AWB Generation  │                │
│  │  Order Detail  │         │  Fan / Sameday  │                │
│  └────────────────┘         └─────────────────┘                │
│         │                             │                          │
│         │                             ▼                          │
│         │                    ┌─────────────────┐                │
│         │                    │  Order Record   │                │
│         │                    │  + AWB Number   │                │
│         │                    │  + Tracking URL │                │
│         │                    └─────────────────┘                │
│         │                             │                          │
│         ▼                             ▼                          │
│  ┌────────────────┐         ┌─────────────────┐                │
│  │  Print Label   │         │ Tracking System │                │
│  │  (PDF/ZPL)     │         │ (30min polling) │                │
│  └────────────────┘         └─────────────────┘                │
│                                      │                           │
│                                      ▼                           │
│                             ┌─────────────────┐                 │
│                             │ Customer Views  │                 │
│                             │ • Account Page  │                 │
│                             │ • Status Page   │                 │
│                             └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Address Fields Refactoring

### Current Problem

The delivery form currently stores building details (Bloc/Scară/Etaj/Apartament) as a **single combined string** in the `building` field:

```typescript
// Current state (BROKEN)
{
  building: "Bl. A1, Sc. B, Et. 3, Ap. 45"
}
```

**Why this is a problem:**
- Fan Courier API requires **4 separate fields** (building, entrance, floor, apartment)
- Sameday accepts a combined string but loses granularity
- Cannot reliably parse the combined string back into components

### Solution: Separate Address Fields

Split building details into **4 distinct form fields**:

```typescript
// New state (CORRECT)
{
  building: "A1",       // Bloc
  staircase: "B",       // Scară
  floor: "3",           // Etaj
  apartment: "45"       // Apartament
}
```

### Files to Modify

#### 1. TypeScript Types

**File:** `/Users/raul/Projects/eghiseul.ro/src/types/verification-modules.ts`

```typescript
// BEFORE (line 274-286)
export interface AddressState {
  county: string;
  city: string;
  sector?: string;  // For București
  street: string;
  streetType?: string;
  number: string;
  building?: string;  // ❌ Combined field
  postalCode?: string;
}

// AFTER
export interface AddressState {
  county: string;
  city: string;
  sector?: string;  // For București
  street: string;
  streetType?: string;
  number: string;
  // Separate building details (NEW)
  building?: string;   // Bloc (e.g., "A1")
  staircase?: string;  // Scară (e.g., "B")
  floor?: string;      // Etaj (e.g., "3")
  apartment?: string;  // Apartament (e.g., "45")
  postalCode?: string;
}
```

#### 2. Delivery Form UI

**File:** `/Users/raul/Projects/eghiseul.ro/src/components/orders/steps-modular/delivery-step.tsx`

**Changes:**

1. **Update Zod Schema** (line 195-204):

```typescript
// BEFORE
const addressSchema = z.object({
  street: z.string().min(2, 'Strada este obligatorie'),
  number: z.string().min(1, 'Numărul este obligatoriu'),
  building: z.string().optional(),  // ❌ Single field
  apartment: z.string().optional(),
  city: z.string().min(2, 'Localitatea este obligatorie'),
  county: z.string().min(1, 'Județul este obligatoriu'),
  postalCode: z.string().regex(/^\d{6}$/, 'Codul poștal trebuie să aibă 6 cifre'),
});

// AFTER
const addressSchema = z.object({
  street: z.string().min(2, 'Strada este obligatorie'),
  number: z.string().min(1, 'Numărul este obligatoriu'),
  building: z.string().optional(),   // Bloc
  staircase: z.string().optional(),  // Scară (NEW)
  floor: z.string().optional(),      // Etaj (NEW)
  apartment: z.string().optional(),  // Apartament
  city: z.string().min(2, 'Localitatea este obligatorie'),
  county: z.string().min(1, 'Județul este obligatoriu'),
  postalCode: z.string().regex(/^\d{6}$/, 'Codul poștal trebuie să aibă 6 cifre'),
});
```

2. **Update Form Default Values** (line 268-276):

```typescript
// AFTER
defaultValues: {
  street: delivery.address?.street || '',
  number: delivery.address?.number || '',
  building: delivery.address?.building || '',    // Bloc
  staircase: delivery.address?.staircase || '',  // Scară (NEW)
  floor: delivery.address?.floor || '',          // Etaj (NEW)
  apartment: delivery.address?.apartment || '',  // Apartament
  city: delivery.address?.city || '',
  county: delivery.address?.county || '',
  postalCode: delivery.address?.postalCode || '',
}
```

3. **Update Form Fields** (replace line 1208-1221):

```tsx
{/* Building Details (4 separate fields in 2x2 grid) */}
<div className="col-span-2 grid grid-cols-2 gap-3 sm:gap-4">
  {/* Bloc */}
  <FormField
    control={form.control}
    name="building"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Bloc</FormLabel>
        <FormControl>
          <Input {...field} placeholder="A1" />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  {/* Scară */}
  <FormField
    control={form.control}
    name="staircase"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Scară</FormLabel>
        <FormControl>
          <Input {...field} placeholder="B" />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  {/* Etaj */}
  <FormField
    control={form.control}
    name="floor"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Etaj</FormLabel>
        <FormControl>
          <Input {...field} placeholder="3" />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  {/* Apartament */}
  <FormField
    control={form.control}
    name="apartment"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Apartament</FormLabel>
        <FormControl>
          <Input {...field} placeholder="45" />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</div>
```

4. **Update Context Sync** (line 771-787):

```typescript
// Update address in context
useEffect(() => {
  const subscription = form.watch((value) => {
    if (physicalRegion === 'romania') {
      updateDelivery({
        address: {
          street: value.street || '',
          number: value.number || '',
          building: value.building,      // Bloc
          staircase: value.staircase,    // Scară (NEW)
          floor: value.floor,            // Etaj (NEW)
          apartment: value.apartment,    // Apartament
          city: value.city || '',
          county: value.county || '',
          postalCode: value.postalCode || '',
        },
      });
    }
  });
  return () => subscription.unsubscribe();
}, [form, updateDelivery, physicalRegion]);
```

#### 3. Wizard Provider State

**File:** `/Users/raul/Projects/eghiseul.ro/src/providers/modular-wizard-provider.tsx`

No changes needed - the provider already uses `AddressState` from types, which we updated above.

### UI Layout

**Desktop (4 fields in 2x2 grid):**

```
┌───────────────────────┬───────────────────────┐
│ Bloc: [___]           │ Scară: [___]          │
├───────────────────────┼───────────────────────┤
│ Etaj: [___]           │ Apartament: [___]     │
└───────────────────────┴───────────────────────┘
```

**Mobile (2x2 grid):**

```
┌───────────────────────┐
│ Bloc: [___]           │
├───────────────────────┤
│ Scară: [___]          │
├───────────────────────┤
│ Etaj: [___]           │
├───────────────────────┤
│ Apartament: [___]     │
└───────────────────────┘
```

### Courier API Mapping

#### Fan Courier AWB Request

```typescript
// Fan Courier requires separate fields
recipient: {
  address: {
    street: address.street,
    streetNo: address.number,
    building: address.building || '',    // Bloc
    entrance: address.staircase || '',   // Scară
    floor: address.floor || '',          // Etaj
    apartment: address.apartment || '',  // Apartament
  }
}
```

#### Sameday AWB Request

```typescript
// Sameday accepts combined string
awbRecipient: {
  address: [
    request.recipient.street,
    request.recipient.streetNo ? `Nr. ${request.recipient.streetNo}` : '',
    request.recipient.building ? `Bl. ${request.recipient.building}` : '',
    request.recipient.staircase ? `Sc. ${request.recipient.staircase}` : '',
    request.recipient.floor ? `Et. ${request.recipient.floor}` : '',
    request.recipient.apartment ? `Ap. ${request.recipient.apartment}` : '',
  ]
    .filter(Boolean)
    .join(', ')
}
```

### Migration Plan for Existing Orders

**No migration needed** - existing orders with combined `building` field will continue to work:

- Old orders: `building: "Bl. A, Sc. B, Et. 3, Ap. 45"` → sent as-is to Sameday
- New orders: Use separate fields with proper mapping

---

## Part 2: Admin Panel - AWB Generation

### Overview

Add AWB generation functionality to the admin order detail page. The system automatically detects the courier provider from the order record and generates the AWB with a single click.

### User Flow

```
1. Admin opens order detail page (/admin/orders/[id])
2. Sees "Generează AWB" button (if no AWB exists)
3. Clicks button → AWB generated automatically
4. Order status updates to "shipped"/"expediat"
5. Customer receives notification (email + in-app)
6. Admin can now:
   - Print AWB label (PDF/ZPL)
   - Track shipment
   - Cancel AWB (if needed)
```

### UI Components

#### Order Detail Page Updates

**File:** `/Users/raul/Projects/eghiseul.ro/src/app/admin/orders/[id]/page.tsx` (NEW)

**Sections:**

1. **Order Header** - Basic info (order number, status, customer)
2. **Delivery Info** - Address, courier provider, quote details
3. **AWB Section** - Generation button or AWB details
4. **Order Timeline** - Status history

**AWB Section States:**

##### State 1: No AWB (Initial)

```tsx
<Card>
  <CardHeader>
    <CardTitle>Livrare prin Curier</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Courier logo */}
        <Image
          src={order.courier_provider === 'sameday' ? '/images/couriers/sameday.webp' : '/images/couriers/fancourier.svg'}
          alt={order.courier_provider === 'sameday' ? 'Sameday' : 'Fan Courier'}
          width={60}
          height={40}
        />
        <div>
          <p className="font-medium">{order.courier_service}</p>
          <p className="text-sm text-neutral-500">
            {order.courier_quote.serviceName}
          </p>
        </div>
      </div>

      {/* Generate AWB Button */}
      <Button
        onClick={handleGenerateAwb}
        disabled={generatingAwb || !order.courier_provider}
      >
        {generatingAwb ? (
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
  </CardContent>
</Card>
```

##### State 2: AWB Generated

```tsx
<Card>
  <CardHeader>
    <CardTitle>AWB Generat</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* AWB Number Display */}
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

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handlePrintLabel}>
          <Printer className="w-4 h-4 mr-2" />
          Printează Etichetă
        </Button>
        <Button variant="outline" onClick={handleTrackShipment}>
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
```

##### State 3: AWB Generation Error

```tsx
<Alert variant="destructive">
  <AlertCircle className="w-4 h-4" />
  <AlertTitle>Eroare la generarea AWB</AlertTitle>
  <AlertDescription>
    {error}
    <Button variant="link" onClick={handleGenerateAwb} className="mt-2">
      Încearcă din nou
    </Button>
  </AlertDescription>
</Alert>
```

### Component Logic

**File:** `/Users/raul/Projects/eghiseul.ro/src/app/admin/orders/[id]/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [generatingAwb, setGeneratingAwb] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAwb = async () => {
    if (!order || !order.courier_provider) return;

    setGeneratingAwb(true);
    setError(null);

    try {
      // Call AWB generation endpoint
      const response = await fetch(`/api/admin/orders/${order.id}/generate-awb`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to generate AWB');
      }

      // Update local order state
      setOrder({
        ...order,
        delivery_tracking_number: data.data.awb,
        delivery_tracking_url: data.data.trackingUrl,
        status: 'shipped',
      });

      // Show success message
      toast.success(`AWB generat: ${data.data.awb}`);

      // Refresh order data
      router.refresh();
    } catch (err) {
      console.error('AWB generation error:', err);
      setError(err instanceof Error ? err.message : 'Eroare necunoscută');
      toast.error('Nu s-a putut genera AWB');
    } finally {
      setGeneratingAwb(false);
    }
  };

  const handlePrintLabel = async () => {
    if (!order?.delivery_tracking_number) return;

    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/awb-label?format=pdf`,
        { method: 'GET' }
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
    if (!order?.delivery_tracking_number) return;

    const confirmed = confirm('Sigur doriți să anulați AWB-ul? Această acțiune este ireversibilă.');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/cancel-awb`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to cancel AWB');
      }

      // Update order state
      setOrder({
        ...order,
        delivery_tracking_number: null,
        delivery_tracking_url: null,
        status: 'document_ready',
      });

      toast.success('AWB anulat cu succes');
      router.refresh();
    } catch (err) {
      console.error('Cancel AWB error:', err);
      toast.error('Nu s-a putut anula AWB');
    }
  };

  // ... rest of component
}
```

### Button Behavior Rules

| Condition | Button State | Action |
|-----------|-------------|--------|
| No courier selected | Disabled | Show error: "Selectați mai întâi metoda de livrare" |
| AWB already exists | Hidden | Show AWB details instead |
| Generating AWB | Disabled + Spinner | Show "Se generează AWB..." |
| Generation failed | Enabled | Show "Încearcă din nou" |
| AWB generated | Hidden | Show Print/Track/Cancel buttons |

---

## Part 3: Database Changes

### New Columns on `orders` Table

**Migration:** `020_awb_tracking.sql`

```sql
-- Add AWB tracking columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS courier_provider VARCHAR(50),        -- 'fancourier', 'sameday'
  ADD COLUMN IF NOT EXISTS courier_service VARCHAR(100),        -- 'STANDARD', 'FANBOX', etc.
  ADD COLUMN IF NOT EXISTS courier_quote JSONB,                 -- Full quote data
  ADD COLUMN IF NOT EXISTS delivery_tracking_events JSONB,      -- Cached tracking events
  ADD COLUMN IF NOT EXISTS delivery_tracking_status VARCHAR(50), -- Normalized status
  ADD COLUMN IF NOT EXISTS delivery_tracking_last_update TIMESTAMPTZ; -- Last tracking fetch

-- Add indexes for tracking queries
CREATE INDEX IF NOT EXISTS idx_orders_courier_provider ON orders(courier_provider);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(delivery_tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_status ON orders(delivery_tracking_status);

-- Add check constraint for tracking status
ALTER TABLE orders
  ADD CONSTRAINT chk_delivery_tracking_status CHECK (
    delivery_tracking_status IS NULL OR
    delivery_tracking_status IN (
      'pending',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'failed_delivery',
      'returned',
      'cancelled',
      'unknown'
    )
  );

COMMENT ON COLUMN orders.courier_provider IS 'Courier provider code (fancourier, sameday)';
COMMENT ON COLUMN orders.courier_service IS 'Courier service code (STANDARD, FANBOX, LOCKER_NEXTDAY)';
COMMENT ON COLUMN orders.courier_quote IS 'Full courier quote data with pricing breakdown';
COMMENT ON COLUMN orders.delivery_tracking_events IS 'Cached tracking events from courier API';
COMMENT ON COLUMN orders.delivery_tracking_status IS 'Normalized tracking status across providers';
COMMENT ON COLUMN orders.delivery_tracking_last_update IS 'Timestamp of last tracking data fetch';
```

### JSONB Column Structures

#### `courier_quote` (JSONB)

Stores the full courier quote selected by the customer:

```json
{
  "provider": "fancourier",
  "providerName": "Fan Courier",
  "service": "STANDARD",
  "serviceName": "Standard 24H",
  "price": 18.50,
  "priceWithVAT": 22.01,
  "vat": 3.51,
  "currency": "RON",
  "estimatedDays": 2,
  "breakdown": {
    "basePrice": 15.00,
    "fuelCost": 2.50,
    "extraKmCost": 1.00
  },
  "lockerId": "12345",        // For locker services
  "lockerName": "FANbox Piața Unirii",
  "lockerAddress": "Piața Unirii 1, București"
}
```

#### `delivery_tracking_events` (JSONB)

Cached tracking events from courier API:

```json
[
  {
    "date": "2026-02-13",
    "time": "14:30",
    "status": "Livrat",
    "statusCode": "S2",
    "description": "Coletul a fost livrat",
    "location": "București, Sector 1",
    "signedBy": "Ion Popescu"
  },
  {
    "date": "2026-02-13",
    "time": "09:15",
    "status": "În livrare",
    "statusCode": "S1",
    "description": "Coletul este în livrare către destinatar",
    "location": "Hub București"
  },
  {
    "date": "2026-02-12",
    "time": "18:00",
    "status": "În tranzit",
    "statusCode": "H10",
    "description": "Coletul este în tranzit către depozitul de destinație",
    "location": "Hub Satu Mare"
  }
]
```

### Status Normalization Mapping

Map courier-specific status codes to normalized statuses:

| Normalized Status | Fan Courier Codes | Sameday Codes | Description |
|------------------|-------------------|---------------|-------------|
| `pending` | Initial state | Initial state | AWB created, not yet picked up |
| `picked_up` | C0, C1 | 2 | Package collected from sender |
| `in_transit` | H10, H11, H2, H12 | 3, 4, 5 | Package in transit |
| `out_for_delivery` | S1 | 6 | Out for delivery to recipient |
| `delivered` | S2 | 7 | Successfully delivered |
| `failed_delivery` | S6, S7, S15 | 8 | Delivery attempt failed |
| `returned` | S43, S33, S16 | 9 | Package returned to sender |
| `cancelled` | S38 | - | AWB cancelled |
| `unknown` | Other | Other | Unknown status |

---

## Part 4: API Endpoints

### 1. Generate AWB

**Endpoint:** `POST /api/admin/orders/[id]/generate-awb`
**Auth:** Admin only
**File:** `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/orders/[id]/generate-awb/route.ts`

#### Request

```typescript
POST /api/admin/orders/abc123/generate-awb
Content-Type: application/json
Authorization: Bearer <admin_token>

// No body required - all data from order record
```

#### Response (Success)

```json
{
  "success": true,
  "data": {
    "awb": "2380123456789",
    "provider": "fancourier",
    "trackingUrl": "https://www.fancourier.ro/awb-tracking/?awb=2380123456789",
    "estimatedDays": 2,
    "price": 18.50,
    "priceWithVAT": 22.01,
    "currency": "RON",
    "awbPdf": "https://api.fancourier.ro/awb/label?awbs[]=2380123456789&pdf=1"
  }
}
```

#### Response (Error)

```json
{
  "success": false,
  "error": {
    "code": "SHIPMENT_ERROR",
    "message": "Adresa incompletă: lipsește județul"
  }
}
```

#### Implementation

```typescript
// /src/app/api/admin/orders/[id]/generate-awb/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCourierProvider, getTrackingUrl } from '@/lib/services/courier';
import type { ShipmentRequest } from '@/lib/services/courier/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verify admin authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // 2. Fetch order with delivery details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    // 3. Validate order can have AWB generated
    if (order.delivery_tracking_number) {
      return NextResponse.json(
        { success: false, error: { code: 'AWB_EXISTS', message: 'AWB already generated' } },
        { status: 400 }
      );
    }

    if (!order.courier_provider || !order.delivery_address) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ORDER', message: 'Missing courier or address data' } },
        { status: 400 }
      );
    }

    // 4. Get courier provider instance
    const courierProvider = getCourierProvider(order.courier_provider);

    // 5. Build shipment request from order data
    const shipmentRequest: ShipmentRequest = {
      sender: {
        name: 'eGhiseul.ro',
        phone: '+40740123456',
        email: 'contact@eghiseul.ro',
        county: 'Satu Mare',
        city: 'Satu Mare',
        street: 'Str. Example',
        streetNo: '1',
        postalCode: '440000',
      },
      recipient: {
        name: order.customer_data?.personal?.full_name || 'Unknown',
        phone: order.customer_data?.contact?.phone || '',
        email: order.customer_data?.contact?.email || '',
        county: order.delivery_address.county,
        city: order.delivery_address.city,
        street: order.delivery_address.street,
        streetNo: order.delivery_address.number,
        building: order.delivery_address.building,
        staircase: order.delivery_address.staircase,
        floor: order.delivery_address.floor,
        apartment: order.delivery_address.apartment,
        postalCode: order.delivery_address.postalCode,
      },
      packages: [
        {
          weight: 0.5,
          length: 30,
          width: 22,
          height: 1,
          quantity: 1,
          type: 'envelope',
        },
      ],
      content: {
        description: `Documente eGhiseul.ro - ${order.friendly_order_id}`,
        declaredValue: 0,
        isDocument: true,
      },
      service: order.courier_service,
      paymentBy: 'sender',
      lockerId: order.courier_quote?.lockerId,
      orderReference: order.friendly_order_id,
    };

    // 6. Generate AWB via courier API
    const result = await courierProvider.createShipment(shipmentRequest);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'SHIPMENT_ERROR', message: 'Failed to create shipment' } },
        { status: 500 }
      );
    }

    // 7. Update order record with AWB
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        delivery_tracking_number: result.awb,
        delivery_tracking_url: getTrackingUrl(order.courier_provider, result.awb),
        delivery_tracking_status: 'pending',
        delivery_tracking_last_update: new Date().toISOString(),
        status: 'shipped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order with AWB:', updateError);
      // AWB was created but DB update failed - log for manual intervention
    }

    // 8. Add to order history
    await supabase.from('order_history').insert({
      order_id: order.id,
      event_type: 'awb_created',
      notes: `AWB generat: ${result.awb} via ${order.courier_provider}`,
      new_value: JSON.stringify({
        awb: result.awb,
        provider: order.courier_provider,
        service: order.courier_service,
      }),
      changed_by: user.id,
    });

    // 9. Return success with AWB details
    return NextResponse.json({
      success: true,
      data: {
        awb: result.awb,
        provider: order.courier_provider,
        trackingUrl: getTrackingUrl(order.courier_provider, result.awb),
        estimatedDays: result.estimatedDays,
        price: result.price,
        priceWithVAT: result.priceWithVAT,
        currency: result.currency,
        awbPdf: result.awbPdf,
      },
    });
  } catch (error) {
    console.error('[Generate AWB API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
```

### 2. Get AWB Label (Print)

**Endpoint:** `GET /api/admin/orders/[id]/awb-label`
**Auth:** Admin only
**File:** `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/orders/[id]/awb-label/route.ts`

#### Request

```
GET /api/admin/orders/abc123/awb-label?format=pdf
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `format`: `pdf` (default), `zpl`, or `html`

#### Response

Binary PDF file with AWB label.

#### Implementation

```typescript
// /src/app/api/admin/orders/[id]/awb-label/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verify admin auth (same as above)
    // ... auth check code ...

    // 2. Fetch order
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!order?.delivery_tracking_number) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_AWB', message: 'No AWB exists for this order' } },
        { status: 404 }
      );
    }

    // 3. Get courier provider
    const courierProvider = getCourierProvider(order.courier_provider);

    // 4. Get label URL from provider
    const format = request.nextUrl.searchParams.get('format') || 'pdf';
    const labelUrl = await courierProvider.getAwbLabel(
      [order.delivery_tracking_number],
      format as 'pdf' | 'zpl' | 'html'
    );

    // 5. Fetch label from courier API
    const response = await fetch(labelUrl);
    const blob = await response.blob();

    // 6. Return as file download
    return new NextResponse(blob, {
      headers: {
        'Content-Type': format === 'pdf' ? 'application/pdf' : 'text/plain',
        'Content-Disposition': `attachment; filename="AWB-${order.delivery_tracking_number}.${format}"`,
      },
    });
  } catch (error) {
    console.error('[AWB Label API] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch label' } },
      { status: 500 }
    );
  }
}
```

### 3. Cancel AWB

**Endpoint:** `POST /api/admin/orders/[id]/cancel-awb`
**Auth:** Admin only
**File:** `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/orders/[id]/cancel-awb/route.ts`

#### Request

```
POST /api/admin/orders/abc123/cancel-awb
Authorization: Bearer <admin_token>
```

#### Response

```json
{
  "success": true,
  "message": "AWB cancelled successfully"
}
```

#### Implementation

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth check
    // ... admin verification ...

    // 2. Fetch order
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!order?.delivery_tracking_number) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_AWB', message: 'No AWB to cancel' } },
        { status: 404 }
      );
    }

    // 3. Cancel AWB via courier API
    const courierProvider = getCourierProvider(order.courier_provider);
    const cancelled = await courierProvider.cancelShipment(order.delivery_tracking_number);

    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: { code: 'CANCEL_FAILED', message: 'Failed to cancel AWB' } },
        { status: 500 }
      );
    }

    // 4. Update order record
    await supabase
      .from('orders')
      .update({
        delivery_tracking_number: null,
        delivery_tracking_url: null,
        delivery_tracking_status: null,
        delivery_tracking_events: null,
        delivery_tracking_last_update: null,
        status: 'document_ready',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    // 5. Log to history
    await supabase.from('order_history').insert({
      order_id: order.id,
      event_type: 'awb_cancelled',
      notes: `AWB anulat: ${order.delivery_tracking_number}`,
      old_value: JSON.stringify({ awb: order.delivery_tracking_number }),
      changed_by: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'AWB cancelled successfully',
    });
  } catch (error) {
    console.error('[Cancel AWB API] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to cancel AWB' } },
      { status: 500 }
    );
  }
}
```

### 4. Customer Tracking Endpoint

**Endpoint:** `GET /api/orders/[id]/tracking`
**Auth:** User (order owner) or public with session ID
**File:** `/Users/raul/Projects/eghiseul.ro/src/app/api/orders/[id]/tracking/route.ts`

#### Request

```
GET /api/orders/abc123/tracking
Authorization: Bearer <user_token>
# OR
GET /api/orders/abc123/tracking?session_id=xyz789
```

#### Response

```json
{
  "success": true,
  "data": {
    "awb": "2380123456789",
    "provider": "fancourier",
    "trackingUrl": "https://www.fancourier.ro/awb-tracking/?awb=2380123456789",
    "status": "delivered",
    "statusDescription": "Coletul a fost livrat",
    "events": [
      {
        "date": "2026-02-13",
        "time": "14:30",
        "status": "Livrat",
        "statusCode": "S2",
        "description": "Coletul a fost livrat",
        "location": "București, Sector 1",
        "signedBy": "Ion Popescu"
      },
      {
        "date": "2026-02-13",
        "time": "09:15",
        "status": "În livrare",
        "statusCode": "S1",
        "description": "Coletul este în livrare către destinatar",
        "location": "Hub București"
      }
    ],
    "lastUpdate": "2026-02-13T14:45:00Z"
  }
}
```

#### Implementation

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // 1. Fetch order
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    // 2. Verify access (user owns order OR has valid session_id)
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = request.nextUrl.searchParams.get('session_id');

    const hasAccess = user?.id === order.user_id || sessionId === order.session_id;
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // 3. Check if AWB exists
    if (!order.delivery_tracking_number) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'pending',
          message: 'AWB not yet generated',
        },
      });
    }

    // 4. Check if we have cached tracking data (< 30 min old)
    const cacheExpiry = 30 * 60 * 1000; // 30 minutes
    const lastUpdate = order.delivery_tracking_last_update
      ? new Date(order.delivery_tracking_last_update).getTime()
      : 0;
    const now = Date.now();

    if (order.delivery_tracking_events && (now - lastUpdate) < cacheExpiry) {
      // Return cached data
      return NextResponse.json({
        success: true,
        data: {
          awb: order.delivery_tracking_number,
          provider: order.courier_provider,
          trackingUrl: order.delivery_tracking_url,
          status: order.delivery_tracking_status,
          statusDescription: order.delivery_tracking_events[order.delivery_tracking_events.length - 1]?.description || '',
          events: order.delivery_tracking_events,
          lastUpdate: order.delivery_tracking_last_update,
        },
      });
    }

    // 5. Fetch fresh tracking data from courier API
    const courierProvider = getCourierProvider(order.courier_provider);
    const trackingInfo = await courierProvider.trackShipment(order.delivery_tracking_number);

    // 6. Update order cache
    await supabase
      .from('orders')
      .update({
        delivery_tracking_events: trackingInfo.events,
        delivery_tracking_status: trackingInfo.status,
        delivery_tracking_last_update: new Date().toISOString(),
      })
      .eq('id', order.id);

    // 7. Return fresh data
    return NextResponse.json({
      success: true,
      data: {
        awb: trackingInfo.awb,
        provider: trackingInfo.provider,
        trackingUrl: trackingInfo.trackingUrl || order.delivery_tracking_url,
        status: trackingInfo.status,
        statusDescription: trackingInfo.statusDescription,
        events: trackingInfo.events,
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Tracking API] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tracking' } },
      { status: 500 }
    );
  }
}
```

### 5. Background Tracking Update (Cron)

**Endpoint:** `POST /api/cron/update-tracking`
**Auth:** Vercel Cron Secret
**File:** `/Users/raul/Projects/eghiseul.ro/src/app/api/cron/update-tracking/route.ts`

**Purpose:** Automatically update tracking for all active shipments (runs every 30 minutes).

#### Request

```
POST /api/cron/update-tracking
Authorization: Bearer <CRON_SECRET>
```

#### Implementation

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // 2. Get all orders with active shipments (not delivered/cancelled)
    const { data: orders } = await supabase
      .from('orders')
      .select('id, delivery_tracking_number, courier_provider, delivery_tracking_status')
      .not('delivery_tracking_number', 'is', null)
      .in('delivery_tracking_status', ['pending', 'picked_up', 'in_transit', 'out_for_delivery']);

    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    let updated = 0;

    // 3. Update tracking for each order
    for (const order of orders) {
      try {
        const courierProvider = getCourierProvider(order.courier_provider);
        const trackingInfo = await courierProvider.trackShipment(order.delivery_tracking_number);

        // Update order cache
        await supabase
          .from('orders')
          .update({
            delivery_tracking_events: trackingInfo.events,
            delivery_tracking_status: trackingInfo.status,
            delivery_tracking_last_update: new Date().toISOString(),
          })
          .eq('id', order.id);

        updated++;

        // If status changed to delivered, update order status
        if (trackingInfo.status === 'delivered' && order.delivery_tracking_status !== 'delivered') {
          await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', order.id);

          // TODO: Send notification to customer
        }
      } catch (error) {
        console.error(`Failed to update tracking for order ${order.id}:`, error);
        // Continue with next order
      }
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('[Tracking Cron] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
```

**Vercel Cron Configuration:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/update-tracking",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

---

## Part 5: Customer Tracking UI

### Overview

Customers can track their shipments in two places:
1. **Account page** → Orders → Order detail
2. **Public status page** → `/status/[order-number]`

Both pages show the same tracking timeline component.

### Tracking Timeline Component

**File:** `/Users/raul/Projects/eghiseul.ro/src/components/orders/tracking-timeline.tsx` (NEW)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  statusCode: string;
  description: string;
  location: string;
  signedBy?: string;
}

interface TrackingTimelineProps {
  orderId: string;
  sessionId?: string; // For guest access
  autoRefresh?: boolean; // Auto-refresh every 5 minutes
}

export function TrackingTimeline({ orderId, sessionId, autoRefresh = false }: TrackingTimelineProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<{
    awb: string;
    provider: string;
    trackingUrl: string;
    status: string;
    statusDescription: string;
    events: TrackingEvent[];
    lastUpdate: string;
  } | null>(null);

  const fetchTracking = async () => {
    try {
      const url = sessionId
        ? `/api/orders/${orderId}/tracking?session_id=${sessionId}`
        : `/api/orders/${orderId}/tracking`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch tracking');
      }

      setTrackingData(data.data);
      setError(null);
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();

    // Auto-refresh every 5 minutes if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchTracking, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [orderId, sessionId, autoRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-neutral-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Se încarcă datele de urmărire...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
        <XCircle className="w-5 h-5 inline-block mr-2" />
        {error}
      </div>
    );
  }

  if (!trackingData || !trackingData.events || trackingData.events.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
        <Package className="w-5 h-5 inline-block mr-2" />
        AWB-ul nu a fost generat încă. Veți fi notificat când coletul este expediat.
      </div>
    );
  }

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit':
      case 'picked_up':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed_delivery':
      case 'returned':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'in_transit':
      case 'picked_up':
        return <Package className="w-5 h-5 text-amber-600" />;
      default:
        return <MapPin className="w-5 h-5 text-neutral-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with AWB and status */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <div>
          <p className="text-sm text-neutral-500">AWB</p>
          <p className="font-mono text-lg font-bold text-secondary-900">
            {trackingData.awb}
          </p>
        </div>
        <div className={cn('px-4 py-2 rounded-full border font-medium', getStatusColor(trackingData.status))}>
          <div className="flex items-center gap-2">
            {getStatusIcon(trackingData.status)}
            {trackingData.statusDescription}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-4">
        {/* Vertical line */}
        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-neutral-200" />

        {trackingData.events.map((event, index) => {
          const isFirst = index === 0;
          const isLast = index === trackingData.events.length - 1;

          return (
            <div key={`${event.date}-${event.time}`} className="relative">
              {/* Dot */}
              <div
                className={cn(
                  'absolute -left-6 top-1 w-4 h-4 rounded-full border-2',
                  isFirst
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-neutral-300'
                )}
              />

              {/* Content */}
              <div className={cn('pb-4', !isLast && 'border-b border-neutral-100')}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className={cn('font-medium', isFirst && 'text-primary-600')}>
                      {event.description}
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 inline-block mr-1 -mt-px" />
                      {event.location}
                    </p>
                    {event.signedBy && (
                      <p className="text-sm text-neutral-500 mt-1">
                        Preluat de: <strong>{event.signedBy}</strong>
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-neutral-500 whitespace-nowrap">
                    <p className="font-medium text-secondary-900">{event.date}</p>
                    <p>{event.time}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking link */}
      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-sm text-neutral-600">
        <p>
          Urmăriți coletul direct pe site-ul {trackingData.provider === 'sameday' ? 'Sameday' : 'Fan Courier'}:{' '}
          <a
            href={trackingData.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline font-medium"
          >
            {trackingData.trackingUrl}
          </a>
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Ultima actualizare: {new Date(trackingData.lastUpdate).toLocaleString('ro-RO')}
        </p>
      </div>
    </div>
  );
}
```

### Account Page Integration

**File:** `/Users/raul/Projects/eghiseul.ro/src/components/account/orders-tab.tsx` (UPDATE)

Add tracking timeline to order detail view:

```tsx
// Inside OrderDetailDialog component
{order.delivery_tracking_number && (
  <div className="mt-6">
    <h4 className="font-semibold text-secondary-900 mb-4">Urmărire Colet</h4>
    <TrackingTimeline orderId={order.id} autoRefresh={true} />
  </div>
)}
```

### Public Status Page

**File:** `/Users/raul/Projects/eghiseul.ro/src/app/status/[orderNumber]/page.tsx` (UPDATE)

```tsx
// Add tracking section
{order.delivery_tracking_number && (
  <Card>
    <CardHeader>
      <CardTitle>Urmărire Colet</CardTitle>
    </CardHeader>
    <CardContent>
      <TrackingTimeline
        orderId={order.id}
        sessionId={order.session_id}
        autoRefresh={true}
      />
    </CardContent>
  </Card>
)}
```

---

## Part 6: Implementation Plan

### Phase 1: Address Fields Refactoring (2-3 hours)

**Priority:** HIGH
**Must be done first** - breaks AWB generation if skipped

**Tasks:**
1. Update `AddressState` type in `verification-modules.ts`
2. Update delivery form Zod schema
3. Update form UI (4 separate fields in 2x2 grid)
4. Update form default values and context sync
5. Test address saving/loading across wizard navigation
6. Test existing orders still work with combined building field

**Testing:**
- [ ] Form shows 4 separate fields (Bloc, Scară, Etaj, Apartament)
- [ ] Fields save to wizard state correctly
- [ ] Fields persist on page reload
- [ ] Existing orders with combined building field still display
- [ ] Mobile layout works (2x2 grid)

**Estimated Time:** 2-3 hours
**Complexity:** Low

---

### Phase 2: Database Schema Updates (1 hour)

**Tasks:**
1. Create migration `020_awb_tracking.sql`
2. Add new columns to `orders` table
3. Add indexes for tracking queries
4. Add check constraint for tracking status
5. Test migration in dev environment
6. Run migration in production

**Files:**
- `/Users/raul/Projects/eghiseul.ro/supabase/migrations/020_awb_tracking.sql`

**Testing:**
- [ ] Migration runs without errors
- [ ] All new columns created
- [ ] Indexes created successfully
- [ ] Check constraint works
- [ ] Existing orders unaffected

**Estimated Time:** 1 hour
**Complexity:** Low

---

### Phase 3: API Endpoints (6-8 hours)

**Priority:** HIGH
**Dependencies:** Phase 1, Phase 2

**Tasks:**
1. **Generate AWB** (`POST /api/admin/orders/[id]/generate-awb`)
   - Admin auth check
   - Order validation
   - Build shipment request
   - Call courier API
   - Update order record
   - Log to history

2. **Get AWB Label** (`GET /api/admin/orders/[id]/awb-label`)
   - Admin auth check
   - Fetch label from courier API
   - Return as file download

3. **Cancel AWB** (`POST /api/admin/orders/[id]/cancel-awb`)
   - Admin auth check
   - Call courier cancel API
   - Reset order AWB fields
   - Log to history

4. **Customer Tracking** (`GET /api/orders/[id]/tracking`)
   - User/session auth check
   - Check cache (30 min TTL)
   - Fetch from courier API if stale
   - Update order cache
   - Return tracking data

5. **Cron Tracking Update** (`POST /api/cron/update-tracking`)
   - Cron secret verification
   - Fetch active shipments
   - Update tracking for each
   - Trigger notifications on status changes

**Files:**
- `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/orders/[id]/generate-awb/route.ts`
- `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/orders/[id]/awb-label/route.ts`
- `/Users/raul/Projects/eghiseul.ro/src/app/api/admin/orders/[id]/cancel-awb/route.ts`
- `/Users/raul/Projects/eghiseul.ro/src/app/api/orders/[id]/tracking/route.ts`
- `/Users/raul/Projects/eghiseul.ro/src/app/api/cron/update-tracking/route.ts`
- `vercel.json` (cron config)

**Testing:**
- [ ] Generate AWB works for Fan Courier
- [ ] Generate AWB works for Sameday
- [ ] AWB label downloads as PDF
- [ ] Cancel AWB works
- [ ] Customer tracking returns data
- [ ] Cache works (30 min TTL)
- [ ] Cron updates all active shipments
- [ ] Error handling works for all endpoints

**Estimated Time:** 6-8 hours
**Complexity:** Medium-High

---

### Phase 4: Admin UI Components (4-5 hours)

**Tasks:**
1. Create admin order detail page (`/admin/orders/[id]`)
2. Build AWB section component (3 states: no AWB, generated, error)
3. Implement AWB generation logic
4. Implement print label logic
5. Implement cancel AWB logic
6. Add loading states and error handling
7. Style with shadcn/ui components

**Files:**
- `/Users/raul/Projects/eghiseul.ro/src/app/admin/orders/[id]/page.tsx`

**Testing:**
- [ ] Button shows correct state based on AWB existence
- [ ] Generate AWB shows loading spinner
- [ ] Success state shows AWB number and actions
- [ ] Print label downloads PDF
- [ ] Cancel AWB prompts confirmation
- [ ] Error messages display clearly
- [ ] UI matches design system

**Estimated Time:** 4-5 hours
**Complexity:** Medium

---

### Phase 5: Customer Tracking UI (3-4 hours)

**Tasks:**
1. Create tracking timeline component
2. Style timeline with Tailwind
3. Add status badges and icons
4. Integrate into account page (OrdersTab)
5. Integrate into public status page
6. Add auto-refresh logic (5 min interval)
7. Handle loading and error states

**Files:**
- `/Users/raul/Projects/eghiseul.ro/src/components/orders/tracking-timeline.tsx`
- `/Users/raul/Projects/eghiseul.ro/src/components/account/orders-tab.tsx` (update)
- `/Users/raul/Projects/eghiseul.ro/src/app/status/[orderNumber]/page.tsx` (update)

**Testing:**
- [ ] Timeline displays correctly
- [ ] Events sorted chronologically
- [ ] Status badges show correct colors
- [ ] Auto-refresh works
- [ ] Loading state shows
- [ ] Error state shows
- [ ] Link to courier tracking works
- [ ] Mobile layout works

**Estimated Time:** 3-4 hours
**Complexity:** Medium

---

### Phase 6: Testing & QA (4-6 hours)

**Tasks:**
1. **End-to-End Testing**
   - Complete order flow with Fan Courier
   - Complete order flow with Sameday
   - Complete order flow with FANbox
   - Complete order flow with EasyBox
   - AWB generation for each scenario
   - Tracking updates work
   - Customer sees tracking

2. **Edge Cases**
   - Missing address fields
   - Invalid courier provider
   - Courier API down
   - AWB already exists
   - Cancel AWB after delivery
   - Guest order tracking with session ID

3. **Error Handling**
   - Network errors
   - API rate limits
   - Invalid data
   - Permission errors

4. **Performance**
   - Tracking cache works
   - Cron runs on schedule
   - No N+1 queries
   - API response times < 2s

**Testing Checklist:**
- [ ] Fan Courier AWB generation works
- [ ] Sameday AWB generation works
- [ ] FANbox locker AWB generation works
- [ ] EasyBox locker AWB generation works
- [ ] Address fields map correctly to both APIs
- [ ] Tracking updates every 30 minutes
- [ ] Customer sees real-time tracking
- [ ] Print label works
- [ ] Cancel AWB works
- [ ] Error messages are user-friendly
- [ ] All endpoints have proper auth
- [ ] RLS policies prevent unauthorized access
- [ ] Cron secret verified

**Estimated Time:** 4-6 hours
**Complexity:** High

---

### Phase 7: Documentation & Deployment (2 hours)

**Tasks:**
1. Update API documentation (`docs/technical/api/`)
2. Update admin guide (how to generate AWB)
3. Update customer guide (how to track)
4. Add environment variables to Vercel
5. Configure cron job in Vercel
6. Deploy to production
7. Monitor for errors

**Files:**
- `/Users/raul/Projects/eghiseul.ro/docs/technical/api/awb-api.md` (NEW)
- `/Users/raul/Projects/eghiseul.ro/docs/admin/awb-generation-guide.md` (NEW)
- `vercel.json` (cron config)
- `.env.production` (environment variables)

**Deployment Checklist:**
- [ ] Environment variables set in Vercel
- [ ] Cron job configured and active
- [ ] Migration run in production
- [ ] API endpoints tested in production
- [ ] Admin can generate AWB
- [ ] Customer can track shipment
- [ ] Monitoring set up (Sentry, Vercel logs)

**Estimated Time:** 2 hours
**Complexity:** Low

---

### Total Implementation Time

| Phase | Estimated Time | Complexity |
|-------|---------------|-----------|
| Phase 1: Address Fields | 2-3 hours | Low |
| Phase 2: Database Schema | 1 hour | Low |
| Phase 3: API Endpoints | 6-8 hours | Medium-High |
| Phase 4: Admin UI | 4-5 hours | Medium |
| Phase 5: Customer UI | 3-4 hours | Medium |
| Phase 6: Testing & QA | 4-6 hours | High |
| Phase 7: Documentation | 2 hours | Low |
| **TOTAL** | **22-29 hours** | **3-4 days** |

---

## Appendix: TypeScript Interfaces

### AWB Generation Request

```typescript
interface GenerateAwbRequest {
  orderId: string;
  // All data pulled from order record
}
```

### AWB Generation Response

```typescript
interface GenerateAwbResponse {
  success: boolean;
  data?: {
    awb: string;
    provider: string;
    trackingUrl: string;
    estimatedDays: number;
    price: number;
    priceWithVAT: number;
    currency: string;
    awbPdf?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### Tracking Data

```typescript
interface TrackingData {
  awb: string;
  provider: string;
  trackingUrl: string;
  status: TrackingStatus;
  statusDescription: string;
  events: TrackingEvent[];
  lastUpdate: string;
}

interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  statusCode: string;
  description: string;
  location: string;
  signedBy?: string;
}

type TrackingStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'returned'
  | 'cancelled'
  | 'unknown';
```

### Order Type Extensions

```typescript
interface Order {
  // ... existing fields ...

  // AWB fields (NEW)
  courier_provider?: string;
  courier_service?: string;
  courier_quote?: CourierQuote;
  delivery_tracking_number?: string;
  delivery_tracking_url?: string;
  delivery_tracking_events?: TrackingEvent[];
  delivery_tracking_status?: TrackingStatus;
  delivery_tracking_last_update?: string;
}

interface CourierQuote {
  provider: string;
  providerName: string;
  service: string;
  serviceName: string;
  price: number;
  priceWithVAT: number;
  vat: number;
  currency: string;
  estimatedDays: number;
  breakdown?: {
    basePrice?: number;
    fuelCost?: number;
    extraKmCost?: number;
  };
  lockerId?: string;
  lockerName?: string;
  lockerAddress?: string;
}
```

---

**End of Specification**

**Status:** Ready for Implementation
**Next Steps:** Phase 1 - Address Fields Refactoring
**Owner:** Development Team
**Sprint:** 5 - Admin Dashboard
