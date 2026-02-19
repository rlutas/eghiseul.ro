# Sameday Courier API Integration

**Version:** 1.0
**API Version:** 3.1 (dated 21.03.2025)
**Date:** 11 February 2026
**Status:** Production Live
**Author:** Technical Documentation

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Authentication](#2-authentication)
3. [Services (Delivery Types)](#3-services-delivery-types)
4. [OOH Locations (EasyBox + PUDO)](#4-ooh-locations-easybox--pudo)
5. [Geolocation / Nomenclature](#5-geolocation--nomenclature)
6. [AWB Creation](#6-awb-creation)
7. [Tracking](#7-tracking)
8. [Pricing](#8-pricing)
9. [Implementation Files](#9-implementation-files)
10. [Known Limitations and Notes](#10-known-limitations-and-notes)
11. [Issues Fixed (February 2026 Audit)](#11-issues-fixed-february-2026-audit)
12. [TODO / Future Improvements](#12-todo--future-improvements)

---

## 1. API Overview

Sameday is a domestic Romanian courier with a large EasyBox locker network and next-day delivery across Romania. Our integration covers home delivery (Standard 24H), locker delivery (EasyBox), and tracking.

### Base URLs

| Environment | URL |
|-------------|-----|
| **Production** | `https://api.sameday.ro` |
| **Demo** | `https://sameday-api.demo.zitec.com` |

### Our Configuration

| Setting | Value |
|---------|-------|
| Username | `edigitalizareAPI` |
| Environment | **Production** (not demo) |
| `SAMEDAY_USE_DEMO` | `false` |
| Pickup Point | Pickup ONB RO49278701 (ID: `476043`) |
| Available Services | **21** (domestic + crossborder) |

The environment variable `SAMEDAY_USE_DEMO` in `.env.local` controls which API base URL is used. When set to `false` (our default), all requests go to the production API at `api.sameday.ro`.

```env
# .env.local
SAMEDAY_USERNAME=edigitalizareAPI
SAMEDAY_PASSWORD=<password>
SAMEDAY_USE_DEMO=false
```

### Request Format

All authenticated requests must include the `X-AUTH-TOKEN` header. Request bodies for POST endpoints use JSON (`Content-Type: application/json`) except for the authentication endpoint, which uses `application/x-www-form-urlencoded`.

---

## 2. Authentication

### Endpoint

```
POST /api/authenticate
```

### Request

**Headers:**

| Header | Value |
|--------|-------|
| `X-AUTH-USERNAME` | API username |
| `X-AUTH-PASSWORD` | API password |
| `Content-Type` | `application/x-www-form-urlencoded` |

**Body** (form-urlencoded):

```
remember_me=1&_format=json
```

The `_format=json` parameter is required to receive a JSON response. Without it, the API may return HTML. The `remember_me=1` parameter extends the token lifetime from 12 hours to 14 days.

### Response

```json
{
  "token": "eyJhbGciOiJSUz...",
  "expire_at": "2026-02-25 10:30",
  "expire_at_utc": "2026-02-25 08:30"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | JWT token for subsequent requests |
| `expire_at` | string | Expiry in local time (`YYYY-MM-DD HH:MM`) |
| `expire_at_utc` | string | Expiry in UTC (`YYYY-MM-DD HH:MM`). **Preferred for parsing.** |

### Token Lifetime

| Mode | Duration |
|------|----------|
| Default | 12 hours |
| With `remember_me=1` | 14 days |

### Rate Limit

**12 authentication requests per IP per minute.** This is critical in serverless environments (Vercel) where cold starts may trigger re-authentication. Our implementation mitigates this with token caching and a 30-second cooldown after auth failures.

### Subsequent Requests

All API calls after authentication must include:

```
X-AUTH-TOKEN: <token>
```

### Our Token Caching Strategy

The implementation uses a two-tier caching approach:

1. **In-memory cache** -- Module-level variable shared across requests within the same process. Token is refreshed only when within 5 minutes of expiry.

2. **File cache** -- Token is persisted to `.sameday-token.json` in the project root. This survives server restarts but **will not work on read-only filesystems** (Vercel). In that case, the implementation silently falls back to in-memory only.

3. **Auth failure cooldown** -- After a failed authentication attempt, the provider enters a 30-second cooldown to avoid hammering the API. The cooldown state is stored on `globalThis` to survive Next.js HMR (hot module replacement).

```
Token Resolution Flow:
1. Check in-memory cache (> 5 min until expiry?)
2. Check file cache (.sameday-token.json)
3. Authenticate with API
4. On 401 during API call: invalidate cache, retry once, then cooldown
```

### Authentication Error Handling

| Scenario | Behavior |
|----------|----------|
| No credentials configured | Throws `AuthenticationError`, skips API calls |
| HTTP 401/403 response | Sets 30s cooldown, falls back to mock data |
| Network error | Sets 30s cooldown, falls back to mock data |
| Token rejected (401 on API call) | Invalidates cache, retries once, then cooldown |

---

## 3. Services (Delivery Types)

Our account has access to the following services. Service IDs are confirmed from the production API.

### Primary Services (Used in Our Integration)

| Service | ID | Code | Description | Use Case |
|---------|-----|------|-------------|----------|
| **Standard 24H** | 7 | `24H` | Home delivery, next business day | Default for address delivery |
| **Locker NextDay** | 15 | `LN` | EasyBox parcel locker delivery | Customer picks up from locker |
| **PUDO NextDay** | 57 | -- | Sameday Point (stores, gas stations) | Alternative pickup point |
| **Retur Standard** | 10 | -- | Standard return shipment | Return flow |
| **Locker Retur** | 24 | -- | Return via EasyBox locker | Customer drops off return in locker |

### All Available Services on Our Account (Confirmed Feb 2026)

Our account has **21 services** total (not just the 5 domestic ones above). The full list includes crossborder and specialty services:

| ID | Name | Notes |
|----|------|-------|
| 7 | 24H | Default home delivery |
| 10 | Retur Standard | Standard return |
| 15 | Locker NextDay | EasyBox delivery |
| 17 | Locker Home Delivery | Locker-to-home |
| 22 | Colet la schimb | Exchange parcel |
| 23 | Retur Documente | Document return |
| 24 | Locker Retur | EasyBox return |
| 28-31, 38 | Crossborder services | International shipping (not used) |
| 49-50 | Home to Locker | Home-to-locker services |
| 57-62 | PUDO services | PUDO NextDay and variants |
| 65 | Redirect Locker2Pudo | Redirect from locker to PUDO |

These are defined as constants in the implementation:

```typescript
// src/lib/services/courier/sameday.ts
export const SAMEDAY_SERVICES = {
  STANDARD_24H: 7,
  LOCKER_NEXTDAY: 15,
  PUDO_NEXTDAY: 57,
  STANDARD_RETURN: 10,
  LOCKER_RETURN: 24,
} as const;
```

### Service Selection Logic

Our implementation currently offers two services to customers:

- **Standard 24H** (ID 7) -- For home/office address delivery
- **Locker NextDay** (ID 15) -- For EasyBox locker delivery

PUDO NextDay (ID 57) is defined but not yet exposed in the UI.

---

## 4. OOH Locations (EasyBox + PUDO)

### Current Endpoint (Use This)

```
GET /api/client/ooh-locations
```

### Deprecated Endpoint (Do Not Use)

```
GET /api/client/lockers
```

The `/api/client/lockers` endpoint will be decommissioned by Sameday. All new code must use `/api/client/ooh-locations`.

### Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `oohList` | string | -- | Filter by specific OOH list |
| `listingType` | integer | -- | `0` = EasyBox lockers only, `1` = all OOH (lockers + PUDOs) |
| `countPerPage` | integer | 100 | Results per page (we use 500) |
| `countryCode` | string | -- | Country filter (use `RO`) |
| `_locale` | string | -- | Response language |
| `page` | integer | 1 | Pagination page |

### Response Fields

Each location object includes:

| Field | Type | Description |
|-------|------|-------------|
| `oohId` | integer | Unique location identifier |
| `name` | string | Location name (e.g., "EasyBox - Mega Image Calea Victoriei") |
| `county` | string | County name |
| `countyId` | integer | County numeric ID |
| `city` | string | City name |
| `cityId` | integer | City numeric ID |
| `address` | string | Street address |
| `postalCode` | string | Postal code |
| `lat` | float | Latitude |
| `lng` | float | Longitude |
| `oohType` | integer | `0` = EasyBox, `1` = PUDO |
| `supportedPayment` | array | Payment methods accepted at location |
| `schedule` | array | Operating hours per day of week |
| `photos` | array | Location photos (URLs) |

### OOH Type Identification

| `oohId` Range | `oohType` | Location Type |
|---------------|-----------|---------------|
| `< 500000` | `0` | EasyBox (parcel locker) |
| `>= 500000` | `1` | PUDO (Sameday Point -- store, gas station, etc.) |

### Scale

As of February 2026 (confirmed via production API):

| Metric | Count |
|--------|-------|
| **EasyBox lockers** | **6,073** |
| **Total OOH** (EasyBox + PUDO) | **6,388** (~315 PUDO points) |
| **Counties** | **42** |
| **Arad EasyBox lockers** | 12 (example county) |

### Our Caching Strategy

Locker locations are cached for **24 hours** at the module level. The full list of all locations is fetched once, then filtered in-memory by city/county for each request.

```
Locker Cache Flow:
1. Check if cache exists and is < 24 hours old
2. If yes: filter from cache and return
3. If no: fetch ALL lockers (paginated, 500/page)
4. Store unfiltered list in cache
5. Filter by city/county and return
```

Filtering uses diacritics-insensitive matching (NFD normalization + regex removal of combining marks). This handles queries like "Bucuresti" matching "Bucure\u0219ti".

### Example: Fetching Lockers

```typescript
// Our API endpoint
GET /api/courier/pickup-points?provider=sameday&county=Cluj

// Sameday API call (internal)
GET /api/client/ooh-locations?countPerPage=500&page=1&listingType=0&countryCode=RO
```

---

## 5. Geolocation / Nomenclature

Sameday uses its own internal IDs for counties and cities. Our implementation resolves human-readable names to these numeric IDs before making API calls.

### Counties

```
GET /api/geolocation/county
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Filter by county name |
| `countryCode` | string | Country code (e.g., `RO`) |
| `page` | integer | Page number |
| `countPerPage` | integer | Results per page (we use 50) |

**Response:**

```json
{
  "data": [
    { "id": 1, "name": "Alba", "code": "AB" },
    { "id": 2, "name": "Arad", "code": "AR" }
  ]
}
```

### Cities

```
GET /api/geolocation/city
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Filter by city name |
| `county` | integer | Sameday county ID (**must be numeric**, e.g., `3` for Arad). County names do NOT work and return empty results. |
| `postalCode` | string | Filter by postal code |
| `countryCode` | string | Country code |
| `page` | integer | Page number |
| `countPerPage` | integer | Results per page (we use 500) |

> **Confirmed (Feb 2026):** The `county` parameter **only accepts numeric county IDs** (e.g., `county=3` for Arad). Passing a county name string (e.g., `county=Arad`) returns an empty result set with no error. Our code correctly uses numeric IDs from `resolveCountyId()`.

**Response:**

```json
{
  "total": 350,
  "pages": 1,
  "data": [
    {
      "id": 1234,
      "name": "Cluj-Napoca",
      "county": { "id": 12, "name": "Cluj" },
      "postalCode": "400001"
    }
  ]
}
```

### Our Name Resolution

Counties and cities are resolved by fuzzy matching:

1. **Exact match** -- Normalized (lowercase, no diacritics) name comparison
2. **Partial match** -- Substring inclusion in either direction
3. **Special case** -- "Bucuresti" / "Bucharest" patterns matched to the relevant county

Counties are cached at module level (loaded once, never expires within a process lifecycle). Cities are cached per county ID in a `Map`.

```
Name Resolution Flow:
1. Load all counties (lazy, cached forever in-process)
2. Normalize input: lowercase + remove diacritics
3. Try exact match, then partial match
4. For cities: load all cities for resolved county (paginated, cached per county)
5. Same matching logic as counties
```

---

## 6. AWB Creation

### Endpoint

```
POST /api/awb
```

### Key Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `service` | string | Yes | Service ID as string (e.g., `"7"` for Standard 24H) |
| `packageType` | string | Yes | `"0"` = parcel, `"1"` = package/envelope, `"2"` = large parcel |
| `packageNumber` | string | Yes | Total number of parcels |
| `packageWeight` | string | Yes | Total weight in kg |
| `pickupPoint` | string | No | Pickup point ID (uses default if omitted) |
| `contactPerson` | string | No | Contact person ID at pickup point |
| `awbPayment` | string | Yes | `"1"` = sender pays, `"2"` = recipient pays |
| `cashOnDelivery` | string | Yes | COD amount (`"0"` if none) |
| `insuredValue` | string | Yes | Declared value for insurance (`"0"` if none) |
| `thirdPartyPickup` | string | No | `"0"` = no third party |
| `observation` | string | No | Delivery notes |
| `clientInternalReference` | string | No | Our order reference |
| `awbRecipient` | object | Yes | Recipient details (see below) |
| `parcels` | array | Yes | Parcel dimensions (see below) |
| `oohLastMile` | string | No | Locker/PUDO ID for last-mile delivery. **Replaces deprecated `lockerLastMile`.** |
| `oohFirstMile` | string | No | PUDO ID for first-mile pickup |

### awbRecipient Object

**For home delivery:**

```json
{
  "name": "Ion Popescu",
  "phoneNumber": "0740123456",
  "personType": "0",
  "county": "12",
  "city": "1234",
  "address": "Strada Avram Iancu, Nr. 25, Bl. A1, Ap. 15",
  "postalCode": "400001"
}
```

**For locker delivery:**

```json
{
  "name": "Ion Popescu",
  "phoneNumber": "0740123456",
  "personType": "0",
  "email": "ion@example.com"
}
```

When delivering to a locker, the address fields are omitted. The locker is specified via the `oohLastMile` parameter at the top level of the request.

### parcels Array

Each parcel entry:

```json
{
  "weight": "0.5",
  "width": "22",
  "length": "30",
  "height": "1"
}
```

All values are strings. Dimensions are in centimeters, weight in kilograms.

### Response

```json
{
  "awbNumber": "1SD1234567890",
  "awbCost": 14.50,
  "parcels": [
    { "position": 1, "awbNumber": "1SD1234567890001" }
  ],
  "pdfLink": "https://api.sameday.ro/api/awb/download/1SD1234567890"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `awbNumber` | string | Main AWB number |
| `awbCost` | number | Shipping cost (VAT inclusion unclear -- see section 10) |
| `parcels` | array | Individual parcel AWB numbers with position |
| `pdfLink` | string | URL to download the AWB label PDF |

### Our AWB Creation Flow

```
1. Resolve county name -> Sameday county ID
2. Resolve city name -> Sameday city ID
3. Fetch pickup points -> find default pickup point + contact person
4. Determine service ID from request (STANDARD_24H or LOCKER_NEXTDAY)
5. Build AWB request body
6. If locker delivery: add oohLastMile with locker ID, omit address
7. POST /api/awb
8. Return AWB number, cost, PDF link
```

### Cancelling an AWB

```
DELETE /api/awb/{awbNumber}
```

Returns success if the AWB has not yet been picked up by the courier.

---

## 7. Tracking

### Web Tracking URL

For end users, Sameday provides a public tracking page:

```
https://sameday.ro/tracking/awb/{AWB_NUMBER}
```

Our `trackingUrl` in the factory is configured as `https://sameday.ro/tracking/awb/` and the AWB number is appended.

### API Tracking

```
GET /api/client/status-sync
```

**Important:** This endpoint returns status transitions for ALL AWBs within a given time window. It is designed for batch polling, not single-AWB lookup.

| Parameter | Type | Description |
|-----------|------|-------------|
| `startTimestamp` | integer | Window start as **Unix timestamp** (seconds since epoch). Example: `1770817871` |
| `endTimestamp` | integer | Window end as **Unix timestamp** (seconds since epoch). Example: `1770825071` |
| `page` | integer | Page number |
| `countPerPage` | integer | Results per page |

> **Confirmed (Feb 2026):** The `startTimestamp` and `endTimestamp` parameters **must** be Unix timestamps (seconds since epoch). ISO 8601 strings (e.g., `2026-02-11T13:51:11`) and datetime strings are rejected with HTTP 400. Example: `startTimestamp=1770817871&endTimestamp=1770825071`.

**Constraint:** The time window between `startTimestamp` and `endTimestamp` must be **no more than 2 hours**. Larger windows will be rejected.

Alternatively, for single-AWB queries, the `awb[]` query parameter can be used:

```
GET /api/client/status-sync?awb[]=1SD1234567890
```

### Response Structure

```json
{
  "data": [
    {
      "awbNumber": "1SD1234567890",
      "awbHistory": [
        {
          "status": "Colet preluat",
          "statusId": 2,
          "statusState": "picked_up",
          "statusDate": "2026-02-10 16:00",
          "county": "București",
          "reason": "",
          "transitLocation": "Hub București"
        },
        {
          "status": "Colet in tranzit",
          "statusId": 5,
          "statusState": "in_transit",
          "statusDate": "2026-02-11 10:30",
          "county": "Cluj",
          "reason": "",
          "transitLocation": "Hub Cluj-Napoca"
        }
      ]
    }
  ]
}
```

### Crossborder Tracking

For international shipments (not currently used):

```
GET /api/client/xb-status-sync
```

### Status Normalization

Our implementation maps Romanian status strings to a normalized `TrackingStatus` enum:

| Provider Status (Romanian) | Normalized Status |
|----------------------------|-------------------|
| "livrat", "delivered", "predat" | `delivered` |
| "in livrare", "out for delivery" | `out_for_delivery` |
| "tranzit", "transit", "plecat", "sosit" | `in_transit` |
| "preluat", "picked", "ridicat" | `picked_up` |
| "esuat", "failed", "nelivrat", "refuzat" | `failed_delivery` |
| "returnat", "return" | `returned` |
| "anulat", "cancel" | `cancelled` |
| "inregistrat", "created", "nou" | `pending` |

This normalization is handled in `src/lib/services/courier/utils.ts` by `normalizeTrackingStatus()`.

---

## 8. Pricing

### No Public Estimate Endpoint

The Sameday API **does not provide a public cost estimation endpoint**. The `POST /api/awb/estimate` endpoint is not documented in the official API and **returns HTTP 405 Method Not Allowed** (confirmed Feb 2026). Our code attempts it as a best-effort call but does not depend on it.

### How We Handle Pricing

Our implementation uses a layered approach:

1. **Try estimate endpoint** (best effort) -- If `POST /api/awb/estimate` returns a valid cost, use it.
2. **Fall back to base price formula** -- Hardcoded approximation based on weight.
3. **Actual cost at AWB creation** -- The `awbCost` field in the AWB creation response provides the real price.

### Base Price Formula

```
Standard 24H:   ~14 RON + 4 RON/kg (base, without VAT)
EasyBox Locker:  Standard price * 0.85 (approximately 15% cheaper)
COD fee:         +4 RON (if cash on delivery is requested)
VAT:             +19%
```

These are approximate figures for display purposes. Actual pricing is account-specific and negotiated with Sameday.

### Price Markup

A **15% markup** is applied to all courier prices displayed to customers (configurable in the delivery step UI component). This is applied on top of the base price estimate.

```
Displayed price = Estimated price * 1.15
```

### VAT Ambiguity

It is currently unclear whether the `awbCost` returned by the AWB creation endpoint includes VAT or not. Our implementation treats it as net (without VAT) and adds 19% on top. This needs verification with Sameday support (see section 12).

---

## 9. Implementation Files

### Core Provider

| File | Purpose |
|------|---------|
| `src/lib/services/courier/sameday.ts` | Main Sameday provider class (~1157 lines). Handles authentication, token caching, quotes, AWB creation, tracking, and EasyBox locations. |
| `src/lib/services/courier/types.ts` | Shared TypeScript interfaces for all courier providers (`CourierProvider`, `ShippingQuote`, `ShipmentRequest`, `TrackingInfo`, etc.) |
| `src/lib/services/courier/utils.ts` | Shared utilities: tracking status normalization, address formatting, phone validation, date helpers, price helpers. |
| `src/lib/services/courier/factory.ts` | Provider factory with singleton caching. Registry of all courier providers. Quote aggregation across providers. |
| `src/lib/services/courier/index.ts` | Module barrel export. Re-exports types, factory, utils, and provider classes. |

### API Routes

| File | Endpoint | Method | Description |
|------|----------|--------|-------------|
| `src/app/api/courier/pickup-points/route.ts` | `/api/courier/pickup-points` | GET | Returns EasyBox/PUDO locations filtered by provider, county, and city. |
| `src/app/api/courier/quote/route.ts` | `/api/courier/quote` | GET | Returns shipping quotes from one or all providers for a given route. |
| `src/app/api/courier/ship/route.ts` | `/api/courier/ship` | POST | Creates a shipment (AWB). Requires authentication. Updates order record with AWB info. |
| `src/app/api/courier/track/route.ts` | `/api/courier/track` | GET | Tracks a single AWB. Auto-detects provider from AWB format. |
| `src/app/api/courier/track/route.ts` | `/api/courier/track` | POST | Tracks multiple AWBs (batch). Max 50 per request. |

### Provider Architecture

```
CourierProvider (interface)
    |
    +-- FanCourierProvider (domestic)
    |
    +-- SamedayProvider (domestic)    <-- this integration
    |
    +-- DHLProvider (international, planned)
    +-- UPSProvider (international, planned)
    +-- FedExProvider (international, planned)
```

The `SamedayProvider` class implements the full `CourierProvider` interface:

```typescript
interface CourierProvider {
  readonly info: CourierProviderInfo;

  // Authentication
  authenticate(): Promise<AuthToken>;
  isAuthenticated(): boolean;

  // Quotes
  getQuote(request: QuoteRequest): Promise<ShippingQuote>;
  getQuotes(request: QuoteRequest): Promise<ShippingQuote[]>;

  // Shipments
  createShipment(request: ShipmentRequest): Promise<ShipmentResponse>;
  cancelShipment(awb: string): Promise<boolean>;

  // Tracking
  trackShipment(awb: string): Promise<TrackingInfo>;
  trackMultiple(awbs: string[]): Promise<TrackingInfo[]>;

  // Pickup (not supported by Sameday -- managed on their platform)
  schedulePickup(request: PickupRequest): Promise<PickupResponse>;
  cancelPickup(pickupId: string): Promise<boolean>;

  // Geographic data (optional)
  getCounties?(): Promise<County[]>;
  getLocalities?(county: string): Promise<Locality[]>;
  getServicePoints?(city: string, county?: string): Promise<ServicePoint[]>;
}
```

### Key Design Decisions

1. **Mock data fallback** -- When the API is unavailable (credentials missing, auth failed, cooldown active), the provider returns mock data with base price estimates rather than throwing errors. This ensures the UI always has something to display.

2. **Singleton providers** -- Provider instances are cached in a `Map` in the factory. The same `SamedayProvider` instance is reused across all requests, sharing the token cache.

3. **Graceful degradation** -- County/city resolution silently returns empty arrays on auth failure, allowing the UI to fall back to our own Romanian counties list from `infocui`.

---

## 10. Known Limitations and Notes

### API Limitations

| Limitation | Details |
|------------|---------|
| **No cost estimation endpoint** | `POST /api/awb/estimate` returns HTTP 405 Method Not Allowed (confirmed Feb 2026). Prices shown to users are estimates based on our formula. Actual cost is only known at AWB creation time. |
| **Tracking window max 2 hours** | The `status-sync` endpoint requires `startTimestamp` and `endTimestamp` to be at most 2 hours apart. You cannot query 30 days of history in one call. |
| **Auth rate limit** | 12 requests per IP per minute. In serverless environments with frequent cold starts, this can be hit. Our 30-second cooldown and token caching mitigate this. |

### Deployment Considerations

| Consideration | Details |
|---------------|---------|
| **File-based token cache** | `.sameday-token.json` is written to `process.cwd()`. On read-only filesystems (Vercel, Docker), the write fails silently and the system falls back to in-memory caching only. |
| **Cold starts** | Each serverless function cold start loses the in-memory token cache. If the file cache is also unavailable, a new auth request is made. With 12 req/min limit, rapid scaling could be problematic. |
| **HMR in development** | Module-level variables reset on hot reload. The auth failure cooldown is stored on `globalThis` to survive HMR. |

### Data Mapping

| Issue | Details |
|-------|---------|
| **County/city nomenclature** | Sameday uses its own numeric IDs for counties and cities. Our code resolves names to IDs via fuzzy matching. Mismatches can cause AWB creation failures. |
| **`awbCost` VAT status** | Unclear whether `awbCost` from AWB creation includes or excludes VAT. Our code assumes it excludes VAT and adds 19%. Needs verification with Sameday. |
| **Pickup scheduling** | Not supported via API. The `schedulePickup` method always returns `{ success: false }`. Pickups are managed through the Sameday platform. |

---

## 11. Issues Fixed (February 2026 Audit)

The following issues were identified and resolved during the February 2026 integration audit:

| Issue | Problem | Fix |
|-------|---------|-----|
| **Auth body format** | Was sending JSON body; API expects `application/x-www-form-urlencoded` | Changed to form-urlencoded with `remember_me=1&_format=json` |
| **Missing `_format=json`** | API returned HTML instead of JSON when `_format=json` was omitted | Added `_format=json` to auth body |
| **Token expiry fallback** | Code defaulted to 12 minutes instead of 12 hours when expiry was missing | Changed fallback to `Date.now() + 12 * 60 * 60 * 1000` |
| **Use `expire_at_utc`** | `expire_at` is in local server time (ambiguous). `expire_at_utc` is unambiguous. | Now parses `expire_at_utc` first, falls back to `expire_at` |
| **Locker cache** | Lockers were fetched on every request | Added 24-hour TTL cache for full locker list |
| **Diacritics-insensitive filtering** | Searches for "Bucuresti" failed to match "Bucure\u0219ti" | Added NFD normalization + diacritics stripping |
| **Missing `countryCode=RO`** | OOH locations returned results for all countries | Added `countryCode=RO` to request parameters |
| **Estimate endpoint removed** | `POST /api/awb/estimate` returned 405, caused error logs | Wrapped in try/catch, falls back to base price formula |
| **Tracking window fix** | Code attempted 30-day windows; API limit is 2 hours | For single AWB: use `awb[]` parameter instead of time window |
| **Tracking timestamp format** | `startTimestamp`/`endTimestamp` were sent as ISO 8601 strings; API returns 400 | Changed to Unix timestamps (seconds since epoch, e.g., `1770817871`) |
| **Tracking URL added** | No public tracking URL was configured | Added `https://sameday.ro/tracking/awb/` to factory |
| **Log message cooldown mismatch** | Log said "60s cooldown" but code used 30s | Aligned log message to match actual 30s cooldown |

---

## 12. TODO / Future Improvements

### Short-term

- [ ] **Verify `awbCost` VAT inclusion** -- Contact Sameday support to confirm whether the cost returned at AWB creation includes or excludes TVA 19%.
- [x] **~~Verify city endpoint parameter format~~** -- **Confirmed (Feb 2026):** The city endpoint `county` parameter only accepts numeric county IDs (e.g., `county=3`). County name strings return empty results. Our `resolveCountyId()` implementation is correct.
- [ ] **Verify `packageNumber` matches `parcels` array length** -- The API documentation suggests these should match. Our code should validate this before sending.

### Medium-term

- [ ] **Add PUDO support** -- Change `listingType` from `0` to `1` in OOH requests to include PUDO locations. Distinguish `oohType` 0 (EasyBox) from 1 (PUDO) in the UI.
- [ ] **Display `supportedPayment`** -- Show whether a locker/PUDO accepts card payment, enabling ramburs la locker.
- [ ] **Display `occupancyLevel`** -- If available in the API response, show locker availability to help customers choose less-crowded lockers.
- [ ] **Implement Sameday Locker Plugin SDK** -- Sameday offers a React/JS SDK for an embedded locker map with search, filtering, and selection. Consider replacing our custom locker list with this widget.

### Long-term

- [ ] **Redis token cache** -- Replace file-based token caching with Redis for proper serverless support.
- [ ] **Webhook-based tracking** -- If Sameday adds webhook support, switch from polling to push-based status updates.
- [ ] **Return flow integration** -- Implement Retur Standard (ID 10) and Locker Retur (ID 24) services for customer returns.

---

## Appendix A: Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SAMEDAY_USERNAME` | Yes | -- | API username (production: `edigitalizareAPI`) |
| `SAMEDAY_PASSWORD` | Yes | -- | API password |
| `SAMEDAY_USE_DEMO` | No | `false` | Set to `true` to use demo API (`sameday-api.demo.zitec.com`) |

---

## Appendix B: Error Types

The implementation uses typed error classes for different failure modes:

| Error Class | Code | When Thrown |
|-------------|------|------------|
| `AuthenticationError` | `AUTH_FAILED` | Credentials missing, invalid, or API returned non-200 |
| `QuoteError` | `QUOTE_FAILED` | No quotes available for the given route |
| `ShipmentError` | `SHIPMENT_FAILED` | AWB creation failed (bad address, API error, etc.) |
| `CourierError` | `API_ERROR` | Generic API error (non-200 response on any endpoint) |
| `CourierError` | `AUTH_INVALID` | Token rejected after re-authentication attempt |
| `CourierError` | `AWB_NOT_FOUND` | Tracking returned no results for the given AWB |

All error classes extend `CourierError`, which extends `Error` and includes `code`, `provider`, and optional `details` fields.

---

## Appendix C: Quick Reference for Common Operations

### Get EasyBox lockers near a city

```typescript
import { getCourierProvider } from '@/lib/services/courier';

const sameday = getCourierProvider('sameday');
const lockers = await sameday.getServicePoints('Cluj-Napoca', 'Cluj');
// Returns ServicePoint[] with id, name, address, coordinates, etc.
```

### Get shipping quotes

```typescript
import { getAllQuotes, QuoteRequest } from '@/lib/services/courier';

const request: QuoteRequest = {
  sender: { city: 'București', county: 'București', postalCode: '', country: 'RO' },
  recipient: { city: 'Cluj-Napoca', county: 'Cluj', postalCode: '', country: 'RO' },
  packages: [{ weight: 0.5, type: 'envelope', quantity: 1 }],
};

// From all providers (Fan Courier + Sameday)
const allQuotes = await getAllQuotes(request);

// From Sameday only
const sameday = getCourierProvider('sameday');
const samedayQuotes = await sameday.getQuotes(request);
```

### Create an AWB

```typescript
import { getCourierProvider, ShipmentRequest } from '@/lib/services/courier';

const sameday = getCourierProvider('sameday');

const request: ShipmentRequest = {
  sender: { /* sender address */ },
  recipient: {
    name: 'Ion Popescu',
    phone: '0740123456',
    street: 'Strada Avram Iancu',
    streetNo: '25',
    city: 'Cluj-Napoca',
    county: 'Cluj',
    postalCode: '400001',
    country: 'RO',
  },
  packages: [{ weight: 0.5, type: 'envelope', quantity: 1, length: 30, width: 22, height: 1 }],
  content: { description: 'Documente oficiale', isDocument: true },
  service: 'STANDARD_24H',
  paymentBy: 'sender',
  orderReference: 'E-260211-ABCDE',
};

const result = await sameday.createShipment(request);
// result: { success, awb, awbPdf, price, priceWithVAT, currency, estimatedDays }
```

### Create an AWB for locker delivery

```typescript
const request: ShipmentRequest = {
  // ... same as above, but:
  service: 'LOCKER_NEXTDAY',
  lockerId: '12345', // EasyBox oohId
  recipient: {
    name: 'Ion Popescu',
    phone: '0740123456',
    email: 'ion@example.com',
    // No street/city/county needed for locker
    street: '', city: '', county: '', postalCode: '', country: 'RO',
  },
  // ...
};
```

### Track an AWB

```typescript
const sameday = getCourierProvider('sameday');
const tracking = await sameday.trackShipment('1SD1234567890');
// tracking: { awb, provider, status, statusDescription, events[], lastUpdate }
```

---

**Last Updated:** 11 February 2026
**Maintainer:** eGhiseul.ro Engineering
