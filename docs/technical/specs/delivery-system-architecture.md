# Delivery System Architecture

**Version:** 2.0
**Date:** 10 Februarie 2026
**Status:** Fan Courier Live, Sameday awaiting credentials

---

## Overview

Sistemul de livrare pentru eGhiseul.ro este complet modular, permițând configurarea per serviciu a opțiunilor de livrare disponibile. Fiecare document poate avea cerințe diferite de livrare.

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
| **Sameday** | ⚠️ Code ready, credentials issue | Romania | Quotes, AWB, Tracking, EasyBox |
| **DHL** | ⏳ Planned | International | Quotes, AWB, Tracking |
| **UPS** | ⏳ Planned | International | Quotes, AWB, Tracking |
| **FedEx** | ⏳ Planned | International | Quotes, AWB, Tracking |

### 7.1 Sameday Integration Details

**Code status:** Fully implemented (`src/lib/services/courier/sameday.ts`, ~1137 lines)
- Authentication, quotes (estimate + base price fallback), AWB creation, tracking, EasyBox lockers
- Multi-provider UI in delivery step (both couriers shown side-by-side)
- Mock data fallback when API unavailable

**Credential issue (Feb 2026):**
The current account (`r.lutas@yahoo.com`) authenticates successfully (returns a token), but the token is **rejected with 401** on all subsequent API calls (counties, estimates, lockers). This indicates the account does not have API client permissions — it's likely a web portal account, not an API-enabled client account.

**What to request from Sameday:**
See section 7.2 below.

### 7.2 Sameday API Credentials Request

Contact: **app.support@sameday.ro** or your designated Sameday sales agent.

**Email template:**

> Bună ziua,
>
> Suntem eGhișeul.ro SRL și dorim să integrăm serviciile Sameday în platforma noastră.
>
> Avem nevoie de:
>
> 1. **Cont API client** pentru mediul de producție (`api.sameday.ro`) — contul curent (`r.lutas@yahoo.com`) se autentifică dar token-ul returnat primește 401 pe toate endpoint-urile (counties, estimate, ooh-locations). Credem că nu are permisiuni de client API.
>
> 2. **Cont de test/sandbox** pentru mediul demo (`sameday-api.demo.zitec.com`) — credențialele demo publice (`sameday`/`DH32ghf732gq`) nu mai funcționează (403 Forbidden).
>
> 3. **Punct de ridicare (pickup point)** configurat pe contul API — avem nevoie de pickup point ID pentru a genera AWB-uri.
>
> 4. **Servicii activate pe cont:**
>    - Standard 24H (service ID 7) — livrare la adresă
>    - Locker Nextday (service ID 15) — livrare în EasyBox
>    - PUDO Nextday (service ID 57) — livrare în punct fix (opțional)
>
> 5. **Persoană de contact** asociată punctului de ridicare.
>
> Date firmă:
> - Denumire: eGhișeul.ro SRL
> - CUI: [completează]
> - Adresă punct de ridicare: [completează adresa reală de expediție]
> - Persoană contact: [nume], [telefon]
>
> Tipul coletelor: documente oficiale (greutate ~0.1-0.5 kg, tip plic/envelope).
>
> Vă mulțumim!

**After receiving credentials, update:**
```env
# .env.local
SAMEDAY_USERNAME=<new_username>
SAMEDAY_PASSWORD=<new_password>
SAMEDAY_USE_DEMO=false
```

### 7.3 Delivery Timing Rules

All physical deliveries follow these rules:

- Livrarea se efectuează **doar după eliberarea documentelor**
- Termenul de livrare se calculează începând cu **a 2-a zi lucrătoare** de la eliberarea documentului
- Documentele eliberate vineri sau în weekend vor fi **expediate luni**
- Termenele afișate (1-2 zile lucrătoare) sunt ale curierului, calculate de la momentul expedierii

### 7.4 Price Markup

A **15% markup** is applied to all courier prices (configurable in `delivery-step.tsx`):
```
DELIVERY_MARKUP_PERCENTAGE = 0.15
Displayed price = API price × 1.15
```

---

## 8. Environment Configuration

```env
# Fan Courier (Romania) ✅ Live
FANCOURIER_USERNAME=your_username
FANCOURIER_PASSWORD=your_password
FANCOURIER_CLIENT_ID=your_client_id

# Sameday (Romania) ⚠️ Needs valid API credentials
SAMEDAY_USERNAME=         # API client username (NOT web portal)
SAMEDAY_PASSWORD=         # API client password
SAMEDAY_USE_DEMO=false    # true = demo API, false = production

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
- [x] Locker/FANbox/EasyBox selector (scrollable card list with distance sorting)
- [x] Delivery timing note (documents issued before shipping, business days)
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
- [x] Sameday integration (code complete, awaiting valid API credentials)
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
