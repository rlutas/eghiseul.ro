# Delivery System Architecture

**Version:** 2.1
**Date:** 13 Februarie 2026
**Status:** Fan Courier Live, Sameday Live, UX Improvements Complete

---

## Overview

Sistemul de livrare pentru eGhiseul.ro este complet modular, permițând configurarea per serviciu a opțiunilor de livrare disponibile. Fiecare document poate avea cerințe diferite de livrare.

### Recent Improvements (Feb 13, 2026)

**Performance Optimizations:**
- FANbox 24-hour server-side cache (reduces API load, faster responses)

**UX Enhancements:**
- Postal code auto-fill from Sameday data (99.6% locality coverage)
- Smart form field reset on county/city change (prevents invalid addresses)
- Mobile-optimized 2-column layout (better screen utilization)

**Technical Details:**
- Form validation improvements (no premature red errors)
- Street-level geocoding for accurate locker distance sorting
- Delivery state persistence across wizard navigation

---

## 1. Delivery Configuration per Service

### 1.1 Service Delivery Options

Fiecare serviciu are configurație în `verification_config.delivery`:

```typescript
interface ServiceDeliveryConfig {
  // Available delivery methods for this service
  methods: {
    pdf: {
      enabled: boolean;
      required: boolean;  // If true, PDF is always included
      price: number;      // Usually 0
    };
    physical: {
      enabled: boolean;
      required: boolean;  // If true, physical is mandatory (e.g., original documents)
      defaultProvider?: 'fancourier' | 'sameday';
    };
  };

  // Default package info for this service type
  package: {
    weight: number;       // kg (default 0.5 for documents)
    type: 'envelope' | 'parcel';
    description: string;  // e.g., "Documente oficiale"
  };

  // Restrictions
  restrictions?: {
    domesticOnly?: boolean;      // Only Romania delivery
    internationalOnly?: boolean; // Only international
    noLocker?: boolean;          // Cannot use FANbox/Easybox
  };
}
```

### 1.2 Example Configurations

**Cazier Judiciar PF** (PDF obligatoriu, fizic opțional):
```json
{
  "delivery": {
    "methods": {
      "pdf": { "enabled": true, "required": true, "price": 0 },
      "physical": { "enabled": true, "required": false }
    },
    "package": { "weight": 0.1, "type": "envelope", "description": "Cazier judiciar" }
  }
}
```

**Certificate Stare Civilă** (Original fizic obligatoriu):
```json
{
  "delivery": {
    "methods": {
      "pdf": { "enabled": true, "required": false, "price": 0 },
      "physical": { "enabled": true, "required": true }
    },
    "package": { "weight": 0.1, "type": "envelope", "description": "Certificat stare civilă" },
    "restrictions": { "noLocker": true }
  }
}
```

**Extras Carte Funciară** (Doar PDF):
```json
{
  "delivery": {
    "methods": {
      "pdf": { "enabled": true, "required": true, "price": 0 },
      "physical": { "enabled": false, "required": false }
    }
  }
}
```

---

## 2. Delivery Flow - Customer Journey

### 2.1 Delivery Step UI Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PASUL: LIVRARE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Cum dorești să primești documentul?                                    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ○ PDF pe Email                                      GRATUIT     │   │
│  │   Primești documentul în format digital pe email                │   │
│  │   ⚡ Instant după procesare                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ○ Livrare Fizică                                   de la X RON  │   │
│  │   Primești documentul original prin curier                      │   │
│  │   📦 2-5 zile lucrătoare                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  [Dacă physical.required = true, doar opțiunea fizică e disponibilă]   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Physical Delivery - Destination Selection

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     LIVRARE FIZICĂ                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Unde trimitem documentul?                                              │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ○ România                                                        │   │
│  │   Livrare prin Fan Courier                                      │   │
│  │   [Logo Fan Courier]                                            │   │
│  │   📦 2 zile lucrătoare • de la 18 RON                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ○ Internațional                                                  │   │
│  │   Livrare prin DHL Express                                      │   │
│  │   [Logo DHL]                                                    │   │
│  │   📦 3-5 zile lucrătoare • de la 150 RON                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Romania Delivery - Address & Pricing

```
┌─────────────────────────────────────────────────────────────────────────┐
│          LIVRARE ROMÂNIA - Fan Courier                                   │
│          [Logo Fan Courier - mare, frumos]                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Adresa de livrare                                                      │
│                                                                          │
│  Județ *                          Localitate *                          │
│  ┌─────────────────────────┐     ┌─────────────────────────┐           │
│  │ Cluj                  ▼ │     │ Cluj-Napoca          ▼ │           │
│  └─────────────────────────┘     └─────────────────────────┘           │
│  [Dropdown cu autocomplete]       [Autocomplete după județ]            │
│                                                                          │
│  Strada *                                      Nr. *                    │
│  ┌─────────────────────────────────────────┐  ┌──────────┐             │
│  │ Strada Avram Iancu                      │  │ 25       │             │
│  └─────────────────────────────────────────┘  └──────────┘             │
│                                                                          │
│  Bloc        Scara       Etaj        Apartament                         │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                        │
│  │ A1     │  │ B      │  │ 3      │  │ 15     │                        │
│  └────────┘  └────────┘  └────────┘  └────────┘                        │
│                                                                          │
│  Cod Poștal              Telefon *                                      │
│  ┌──────────────┐        ┌──────────────────────────┐                  │
│  │ 400001       │        │ 0740 123 456             │                  │
│  └──────────────┘        └──────────────────────────┘                  │
│  [Auto-completat]                                                       │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  💰 Cost livrare:                              23.80 RON        │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │  Serviciu: Standard (2 zile)                    18.00 RON       │   │
│  │  TVA (19%):                                      3.42 RON       │   │
│  │  Taxă zonă extinsă:                              2.38 RON       │   │
│  │  ────────────────────────────────────────────────────────────   │   │
│  │  📅 Livrare estimată: Miercuri, 15 Ianuarie 2026               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  [ ] Doresc livrare în FANbox (locker) - 15.00 RON                     │
│      [Selectează FANbox din hartă]                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.4 International Delivery

```
┌─────────────────────────────────────────────────────────────────────────┐
│          LIVRARE INTERNAȚIONALĂ - DHL Express                           │
│          [Logo DHL - mare]                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Țara *                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🇩🇪 Germania                                                  ▼ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Oraș *                           Cod Poștal *                          │
│  ┌─────────────────────────┐     ┌─────────────────────────┐           │
│  │ Berlin                  │     │ 10115                   │           │
│  └─────────────────────────┘     └─────────────────────────┘           │
│                                                                          │
│  Adresa *                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Friedrichstraße 123, Apt 4B                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Selectează serviciul:                                                  │
│                                                                          │
│  ○ DHL Express (3-5 zile)                              178.50 RON      │
│  ○ DHL Express 12:00 (2-3 zile)                        245.00 RON      │
│  ○ UPS Standard (4-6 zile)                             165.00 RON      │
│  ○ FedEx International Priority (2-3 zile)             220.00 RON      │
│                                                                          │
│  📅 Livrare estimată: 17-20 Ianuarie 2026                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow

### 3.1 Quote Request Flow

```
Customer enters address
         │
         ▼
┌─────────────────────┐
│  Validate Address   │  ← ANAF API (Romania)
│  via ANAF API       │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Get Shipping       │  ← Fan Courier API / DHL API
│  Quotes             │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Display Prices     │  → Real-time pricing shown to customer
│  with Breakdown     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Customer Confirms  │  → Selected quote saved to order
│  Selection          │
└─────────────────────┘
```

### 3.2 Order Data Structure

```typescript
interface OrderDeliveryData {
  method: 'pdf' | 'physical';

  // If physical
  destination?: 'romania' | 'international';

  // Courier details
  courier?: {
    provider: 'fancourier' | 'sameday' | 'dhl' | 'ups' | 'fedex';
    service: string;           // e.g., 'STANDARD', 'EXPRESS'
    quote: {
      price: number;
      priceWithVAT: number;
      currency: string;
      estimatedDays: number;
      breakdown: {
        basePrice: number;
        fuelSurcharge?: number;
        zoneSurcharge?: number;
        vat: number;
      };
    };
  };

  // Address
  address?: {
    name: string;
    phone: string;
    email?: string;
    country: string;
    county?: string;          // For Romania
    city: string;
    postalCode: string;
    street: string;
    streetNo?: string;
    building?: string;
    entrance?: string;
    floor?: string;
    apartment?: string;
  };

  // Tracking (filled after AWB creation)
  awb?: string;
  trackingUrl?: string;
  awbCreatedAt?: string;

  // Delivery to locker
  locker?: {
    id: string;
    name: string;
    address: string;
  };
}
```

---

## 4. Admin Workflow

### 4.1 Order Processing with AWB

```
┌─────────────────────────────────────────────────────────────────────────┐
│  COMANDA: E-260112-ABC12                                     [Deschide] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Status: ✅ Document obținut                                            │
│  Livrare: 📦 Fizică România - Fan Courier Standard                      │
│                                                                          │
│  Adresa livrare:                                                        │
│  Ion Popescu                                                            │
│  Str. Avram Iancu 25, Bl. A1, Sc. B, Et. 3, Ap. 15                    │
│  400001 Cluj-Napoca, Jud. Cluj                                         │
│  Tel: 0740 123 456                                                      │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Document atașat: cazier_E-260112-ABC12.pdf                [Descarcă]  │
│                                                                          │
│  AWB: Nu a fost generat                                                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │   [🚚 GENEREAZĂ AWB FAN COURIER]                                │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 After AWB Generation

```
┌─────────────────────────────────────────────────────────────────────────┐
│  COMANDA: E-260112-ABC12                                     [Deschide] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Status: 🚚 Expediat                                                    │
│                                                                          │
│  AWB: 2175820048592                                                     │
│  Curier: Fan Courier - Standard                                         │
│  Generat: 12 Ian 2026, 14:30                                           │
│                                                                          │
│  [📄 Descarcă AWB PDF]  [🔍 Tracking]  [❌ Anulează AWB]              │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Tracking:                                                              │
│  ✓ 12 Ian 14:30 - AWB înregistrat                                      │
│  ✓ 12 Ian 16:00 - Preluat de curier                                    │
│  ○ În tranzit...                                                        │
│  ○ În livrare                                                           │
│  ○ Livrat                                                               │
│                                                                          │
│  [🔄 Actualizează tracking]                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Admin Actions

| Action | Endpoint | Description |
|--------|----------|-------------|
| Generate AWB | `POST /api/admin/orders/{id}/generate-awb` | Creates AWB via courier API |
| Download AWB | `GET /api/admin/orders/{id}/awb-pdf` | Returns AWB label PDF |
| Cancel AWB | `DELETE /api/admin/orders/{id}/awb` | Cancels AWB if not shipped |
| Refresh Tracking | `POST /api/admin/orders/{id}/refresh-tracking` | Updates tracking status |
| Mark Shipped | `POST /api/admin/orders/{id}/ship` | Manual status update |
| Mark Delivered | `POST /api/admin/orders/{id}/deliver` | Manual delivery confirmation |

---

## 5. Customer Account - Tracking

### 5.1 Order Detail in Account

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Comanda E-260112-ABC12                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Serviciu: Cazier Judiciar Persoană Fizică                             │
│  Data comandă: 12 Ianuarie 2026                                         │
│  Status: 🚚 În livrare                                                  │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                          │
│  📦 TRACKING LIVRARE                                                    │
│                                                                          │
│  AWB: 2175820048592                                                     │
│  Curier: [Logo Fan Courier] Fan Courier                                │
│  Serviciu: Standard (2 zile lucrătoare)                                │
│                                                                          │
│  [🔍 Vezi pe Fan Courier]                                              │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Cronologie:                                                            │
│                                                                          │
│  ✅ 12 Ian, 14:30  AWB generat                                         │
│  │                  Coletul a fost înregistrat în sistemul Fan Courier │
│  │                                                                      │
│  ✅ 12 Ian, 16:45  Preluat de curier                                   │
│  │                  Coletul a fost preluat din București               │
│  │                                                                      │
│  ✅ 13 Ian, 08:20  În tranzit                                          │
│  │                  Coletul este în tranzit către Cluj-Napoca          │
│  │                                                                      │
│  🔵 13 Ian, 14:00  În livrare                                          │
│  │                  Coletul este în curs de livrare                    │
│  │                  Curier: Ionescu Marian - 0740 XXX XXX              │
│  │                                                                      │
│  ○ Livrare estimată: Astăzi, 13 Ianuarie                               │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Adresa de livrare:                                                     │
│  Ion Popescu                                                            │
│  Str. Avram Iancu 25, Bl. A1, Sc. B, Et. 3, Ap. 15                    │
│  400001 Cluj-Napoca                                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. API Endpoints

### 6.1 Customer-Facing APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courier/quote` | GET | Get shipping quotes for route |
| `/api/courier/localities` | GET | Get counties/cities for autocomplete |
| `/api/courier/localities` | POST | Validate address |
| `/api/courier/track` | GET | Track shipment by AWB |

### 6.2 Admin APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/orders/{id}/generate-awb` | POST | Generate AWB |
| `/api/admin/orders/{id}/awb-pdf` | GET | Download AWB label |
| `/api/admin/orders/{id}/cancel-awb` | DELETE | Cancel AWB |
| `/api/admin/orders/{id}/refresh-tracking` | POST | Update tracking |

---

## 7. Courier Integration Status

| Provider | Status | Type | Features |
|----------|--------|------|----------|
| **Fan Courier** | ✅ Live | Romania | Quotes, AWB, Tracking, FANbox |
| **Sameday** | ✅ Live | Romania | Quotes, AWB, Tracking, EasyBox (6073 lockers) |
| **DHL** | ⏳ Planned | International | Quotes, AWB, Tracking |
| **UPS** | ⏳ Planned | International | Quotes, AWB, Tracking |
| **FedEx** | ⏳ Planned | International | Quotes, AWB, Tracking |

### 7.1 Sameday Integration Details

**Status:** LIVE with production credentials (as of Feb 2026)

**Account:** `edigitalizareAPI` on production API (`api.sameday.ro`)
- Authentication: Token-based, 14-day validity
- 6073 EasyBox lockers available
- 21 services available

**Confirmed service IDs:**
- Service ID 7: Standard 24H (livrare la adresa)
- Service ID 15: Locker NextDay (livrare in EasyBox)
- Service ID 57: PUDO NextDay (livrare in punct fix)

**Implementation:** `src/lib/services/courier/sameday.ts` (~1137 lines)
- Authentication, quotes (base price fallback), AWB creation, tracking, EasyBox lockers
- Multi-provider UI in delivery step (both couriers shown side-by-side)
- Mock data fallback when API unavailable

**Known limitation:** The estimate endpoint returns 405 on this account, so pricing falls back to base price quotes. This is working as designed.

### 7.2 Sameday Configuration

```env
# .env.local
SAMEDAY_USERNAME=edigitalizareAPI
SAMEDAY_PASSWORD=<password>
SAMEDAY_USE_DEMO=false    # false = production (api.sameday.ro)
```

### 7.3 Locker Distance Sorting (Street-Level Geocoding)

**Status:** ✅ Live (Feb 2026)

Locker locations (EasyBox and FANbox) are sorted by distance from the customer's delivery address using street-level geocoding for maximum accuracy.

**Geocoding Strategy (3-tier fallback):**

1. **Street-level geocoding** (preferred)
   - Builds full address query: "Strada [street] [number], [city], [county], Romania"
   - Uses Nominatim OpenStreetMap API (free, 1 req/sec limit)
   - Provides most accurate distance sorting (especially in large cities)
   - Example: "Strada Minerva 45, Baia Mare, Maramureș, Romania"

2. **City-level geocoding** (fallback)
   - If street not found by Nominatim, falls back to "city, county, Romania"
   - Sorts from city center (less accurate in large cities like București, Cluj)
   - Difference from street-level: ~400m in small cities, 2-5km in large cities

3. **Browser geolocation** (last resort)
   - If geocoding fails completely, uses navigator.geolocation API
   - User must grant permission
   - Most accurate for current location, but not suitable for delivery planning

**Implementation Details:**

- **File:** `src/components/orders/steps-modular/delivery-step.tsx`
- **Function:** `getDeliveryLocation(county, city, street?, number?)`
- **Return:** `{ lat, lng, source: 'geocoded_street' | 'geocoded_city' | 'gps' }`
- **Re-sort trigger:** 1-second debounced effect when street field changes (min 3 characters)
- **Rate limiting:** Respects Nominatim 1 req/sec limit with debounce
- **Caching:** Locker coordinates cached after initial county fetch (no redundant API calls)

**User Experience:**

1. Customer selects county + city → lockers load, sorted by city center distance
2. Customer types street name → after 1 second, lockers re-sort by street-level distance
3. Distance badge updates: "0.4 km" instead of "2.1 km" for nearby lockers
4. No visible loading state (seamless re-sort in background)

**Performance:**

- Nominatim query: ~200-400ms
- Distance recalculation: ~10ms (6073 EasyBox lockers)
- Debounce: 1 second (prevents excessive API calls while typing)

### 7.4 FANbox 24-Hour Cache

**Status:** ✅ Live (Feb 2026)

FANbox locker locations are cached server-side for 24 hours to improve performance and reduce API calls.

**Implementation Details:**

- **File:** `src/lib/services/courier/fancourier.ts`
- **Cache Variables:**
  - `fanboxCache`: Stores locker data (array)
  - `fanboxCacheTimestamp`: Last fetch timestamp (Date)
  - `FANBOX_CACHE_TTL`: 24 hours (86400000 ms)
- **Pattern:** Same module-level caching as Sameday EasyBox
- **Behavior:**
  - First request to `/api/courier/pickup-points?provider=fancourier` fetches from API
  - Subsequent requests within 24h use cached data
  - Cache expires after 24h, next request refreshes
  - Cache is shared across all users (server-level)

**Benefits:**

- Reduces Fan Courier API load (locker locations change rarely)
- Faster response times for customers (no API roundtrip)
- Consistent with Sameday EasyBox caching strategy

### 7.5 Postal Code Auto-Fill

**Status:** ✅ Live (Feb 2026)

When a customer selects a city, the postal code field auto-fills from Sameday's locality data (238/239 Romanian localities have postal codes).

**Implementation Details:**

- **File:** `src/app/api/courier/localities/route.ts`
- **Process:**
  1. Fetch Fan Courier localities (counties + cities)
  2. Enrich with Sameday postal codes via cross-reference
  3. Return augmented `LocalityItem[]` with `postalCode?: string`
- **Frontend:** `src/components/orders/steps-modular/delivery-step.tsx`
  - `watchedCity` useEffect triggers after field reset
  - Auto-fills postal code if available
  - User can override if needed

**Coverage:**

- 238 out of 239 Sameday localities have postal codes (99.6% coverage)
- Major cities and towns all covered
- Rural areas may require manual entry

**User Experience:**

1. Customer selects county (e.g., "Cluj")
2. Customer selects city (e.g., "Cluj-Napoca")
3. Postal code auto-fills (e.g., "400001")
4. Customer can edit if auto-filled value is incorrect

### 7.6 Form Field Reset on Location Change

**Status:** ✅ Live (Feb 2026)

Address form fields intelligently reset when the user changes location to prevent invalid combinations.

**Reset Behavior:**

**County Change:**
- Resets: city, street, number, building, postalCode
- Clears validation errors for dependent fields
- Uses `form.setValue(..., { shouldValidate: false })` to prevent premature red errors

**City Change:**
- Resets: street, number, building
- Auto-fills postal code from Sameday data
- Preserves county selection

**Implementation:**

- **File:** `src/components/orders/steps-modular/delivery-step.tsx`
- **Pattern:** React Hook Form with controlled resets
- **Timing:** Reset happens before auto-fill to avoid race conditions

**Benefits:**

- Prevents invalid address combinations (e.g., wrong street for city)
- Clean UX: no red error messages on fields not yet filled
- Smooth workflow: user doesn't need to manually clear dependent fields

### 7.7 Mobile Layout Improvements

**Status:** ✅ Live (Feb 2026)

Delivery address form optimized for mobile with compact 2-column layout.

**Layout Changes:**

```tsx
// Before: Single column on mobile
grid-cols-1 sm:grid-cols-2

// After: Always 2 columns (better mobile space usage)
grid-cols-2

// Specific rows:
- County + City: 2 columns (equal width)
- Street + Number: grid-cols-[1fr_80px] sm:grid-cols-[1fr_100px]
- Building + Postal Code: 2 columns (equal width)
```

**Benefits:**

- Better mobile screen utilization
- Reduced scrolling on small screens
- Street + Number on same row (intuitive grouping)
- Matches typical Romanian address format

### 7.8 Delivery Timing Rules

All physical deliveries follow these rules:

- Livrarea se efectuează **doar după eliberarea documentelor**
- Termenul de livrare se calculează începând cu **a 2-a zi lucrătoare** de la eliberarea documentului
- Documentele eliberate vineri sau în weekend vor fi **expediate luni**
- Termenele afișate (1-2 zile lucrătoare) sunt ale curierului, calculate de la momentul expedierii

### 7.9 Price Markup

A **15% markup** is applied to all courier prices (configurable in `delivery-step.tsx`):
```
DELIVERY_MARKUP_PERCENTAGE = 0.15
Displayed price = API price × 1.15
```

### 7.10 Troubleshooting

#### Environment Variable Quoting Issue

**Symptom:** Sameday API returns 0 results or HTTP 403 Forbidden, while direct Node.js test scripts work fine.

**Root cause:** If `SAMEDAY_PASSWORD` contains special characters like `#`, Next.js's `.env.local` parser treats `#` as a comment delimiter, truncating the password.

**Example:**
```env
# WRONG - password truncated to "Lp7k"
SAMEDAY_PASSWORD=Lp7k#Qg2

# CORRECT - wrapped in quotes
SAMEDAY_PASSWORD="Lp7k#Qg2"
```

**Fix:** Always wrap passwords containing special characters (`#`, `$`, spaces, etc.) in double quotes in `.env.local`.

**Applies to:** `FANCOURIER_PASSWORD`, `SAMEDAY_PASSWORD`, any env var with special characters.

---

## 8. Environment Configuration

```env
# Fan Courier (Romania) ✅ Live
FANCOURIER_USERNAME=your_username
FANCOURIER_PASSWORD=your_password
FANCOURIER_CLIENT_ID=your_client_id

# Sameday (Romania) ✅ Live
SAMEDAY_USERNAME=         # Production API username (edigitalizareAPI)
SAMEDAY_PASSWORD=         # Production API password
SAMEDAY_USE_DEMO=false    # false = production (api.sameday.ro)

# DHL (International - planned)
DHL_API_KEY=
DHL_API_SECRET=
DHL_ACCOUNT_NUMBER=

# Sender Address (eGhiseul office)
SENDER_NAME="eGhiseul.ro SRL"
SENDER_PHONE="+40XXX XXX XXX"
SENDER_EMAIL="expeditii@eghiseul.ro"
SENDER_STREET="Strada X"
SENDER_CITY="București"
SENDER_COUNTY="București"
SENDER_POSTAL_CODE="XXXXXX"
```

---

## 9. Implementation Checklist

### Phase 1: Core Infrastructure ✅
- [x] Courier types and interfaces
- [x] Factory pattern for providers
- [x] Fan Courier provider implementation
- [x] Quote API endpoint
- [x] Track API endpoint
- [x] Ship API endpoint
- [x] Localities API endpoint
- [x] ANAF API address validation

### Phase 2: Customer UI ✅
- [x] Delivery step redesign (multi-provider, quote cards with logos)
- [x] Address autocomplete component (county → city → street cascading)
- [x] Real-time price calculator component (15% markup, both providers)
- [x] Courier selector with logos (Fan Courier + Sameday side-by-side)
- [x] Locker/FANbox/EasyBox selector (scrollable card list with street-level distance sorting)
- [x] Delivery timing note (documents issued before shipping, business days)
- [x] FANbox 24-hour server-side cache (performance optimization)
- [x] Postal code auto-fill from Sameday data (238/239 localities)
- [x] Form field reset on county/city change (prevents invalid addresses)
- [x] Mobile layout improvements (2-column grid, street+number grouping)
- [ ] International address form

### Phase 3: Admin Dashboard
- [ ] AWB generation button
- [ ] AWB PDF download
- [ ] Tracking display
- [ ] Bulk AWB generation
- [ ] Delivery status management

### Phase 4: Customer Account
- [ ] Tracking timeline component
- [ ] AWB display and link
- [ ] Delivery notifications
- [ ] SMS integration for delivery updates

### Phase 5: Additional Couriers
- [x] Sameday integration (production live, 6073 EasyBox lockers, 21 services)
- [ ] DHL integration
- [ ] UPS integration
- [ ] FedEx integration

---

## 10. Price Calculation Example

**Comanda: Cazier Judiciar PF cu livrare în Cluj-Napoca**

```
Serviciu: Cazier Judiciar PF              150.00 RON
Opțiune: Procesare Urgentă                 99.00 RON
─────────────────────────────────────────────────────
Subtotal servicii:                        249.00 RON

Livrare: Fan Courier Standard
  - Tarif de bază:                         18.00 RON
  - TVA livrare (19%):                      3.42 RON
─────────────────────────────────────────────────────
Subtotal livrare:                          21.42 RON

═════════════════════════════════════════════════════
TOTAL COMANDĂ:                            270.42 RON
═════════════════════════════════════════════════════
```
