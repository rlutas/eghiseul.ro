# Fan Courier Integration

## Overview

Integrare completă cu Fan Courier API v2.0 pentru livrări în România, incluzând:
- Autentificare cu token caching (24h validitate)
- Calcul tarife în timp real
- Suport pentru FANbox (lockere)
- Markup configurabil pentru acoperirea costurilor

## Arhitectură

### Fișiere Principale

| Fișier | Scop |
|--------|------|
| `src/lib/services/courier/fancourier.ts` | Provider Fan Courier cu API v2.0 |
| `src/lib/services/courier/types.ts` | Tipuri TypeScript comune |
| `src/lib/services/courier/index.ts` | Factory pentru courierii |
| `src/app/api/courier/quote/route.ts` | API endpoint pentru tarife |
| `src/app/api/courier/pickup-points/route.ts` | API endpoint pentru FANbox-uri |
| `src/components/orders/steps-modular/delivery-step.tsx` | UI pentru selecția livrării |

### Flow Autentificare

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Verificare cache în memorie (cachedToken)                │
│    ↓ nu există sau expirat                                  │
│ 2. Verificare cache pe disc (.fancourier-token.json)        │
│    ↓ nu există sau expirat                                  │
│ 3. Request către API Fan Courier /auth/token                │
│    ↓ răspuns cu token                                       │
│ 4. Salvare în cache (memorie + disc)                        │
│    Token valid 24h                                          │
└─────────────────────────────────────────────────────────────┘
```

### Token Caching

Conform documentației Fan Courier, token-ul trebuie salvat și reutilizat (24h validitate).

```typescript
// Module-level cache
let cachedToken: string | null = null;
let cachedTokenExpiry: Date | null = null;

// File persistence pentru restart aplicație
const TOKEN_CACHE_FILE = path.join(process.cwd(), '.fancourier-token.json');
```

**Important:** `.fancourier-token.json` este adăugat în `.gitignore`.

## Configurare

### Environment Variables

```env
FANCOURIER_USERNAME=your_username
FANCOURIER_PASSWORD="your_password_with#special_chars"  # Ghilimele pentru caractere speciale
FANCOURIER_CLIENT_ID=7276967  # ID-ul corect al clientului
```

### Markup pentru Costuri

În `delivery-step.tsx`:

```typescript
// 15% markup pentru acoperirea costurilor și taxelor
const DELIVERY_MARKUP_PERCENTAGE = 0.15;

function applyMarkup(price: number): number {
  return Math.round((price * (1 + DELIVERY_MARKUP_PERCENTAGE)) * 100) / 100;
}
```

**Pentru modificarea markup-ului:** Schimbați valoarea `DELIVERY_MARKUP_PERCENTAGE` (0.15 = 15%, 0.20 = 20%, etc.)

## API Endpoints

### GET /api/courier/quote

Obține tarife pentru livrare.

**Parametri:**
- `senderCounty` - Județul expeditorului
- `senderCity` - Localitatea expeditorului
- `recipientCounty` - Județul destinatarului
- `recipientCity` - Localitatea destinatarului
- `weight` - Greutate (kg), default 0.5 pentru documente
- `provider` - Curier (momentan doar "fancourier")

**Răspuns:**
```json
{
  "success": true,
  "data": {
    "quotes": [
      {
        "provider": "fancourier",
        "providerName": "Fan Courier",
        "service": "Standard",
        "serviceName": "Curier Standard",
        "price": 15.50,
        "priceWithVAT": 18.45,
        "estimatedDays": 2,
        "lockerAvailable": false
      },
      {
        "provider": "fancourier",
        "providerName": "Fan Courier",
        "service": "FANbox",
        "serviceName": "FANbox (Locker)",
        "price": 18.00,
        "priceWithVAT": 21.42,
        "estimatedDays": 2,
        "lockerAvailable": true
      }
    ]
  }
}
```

### GET /api/courier/pickup-points

Obține lista FANbox-uri (lockere).

**Parametri:**
- `county` - Filtru după județ (opțional)
- `city` - Filtru după localitate (opțional)

**Răspuns:**
```json
{
  "success": true,
  "data": [
    {
      "id": "FANBOX_123",
      "type": "locker",
      "name": "FANbox Kaufland Satu Mare",
      "address": "Str. Fabricii nr. 5",
      "city": "Satu Mare",
      "county": "Satu Mare",
      "provider": "fancourier"
    }
  ]
}
```

## Prețuri și Servicii

### Standard vs FANbox

| Serviciu | Descriere | Preț |
|----------|-----------|------|
| **Standard** | Livrare la adresă | Variabil (depinde de distanță) |
| **FANbox** | Ridicare din locker | Preț fix premium |

**Important:** FANbox este un serviciu premium și poate fi mai scump decât Standard pentru adrese din orașe. FANbox devine mai avantajos pentru:
- Zone îndepărtate (unde Standard are `extraKmCost`)
- Când destinatarul nu e acasă
- Pentru conveniență (ridicare oricând)

### Componente Preț (de la Fan Courier API)

```typescript
{
  extraKmCost: number;    // Cost suplimentar pentru localități îndepărtate
  weightCost: number;     // Cost bazat pe greutate
  insuranceCost: number;  // Asigurare
  optionsCost: number;    // Opțiuni suplimentare
  fuelCost: number;       // Suprataxă combustibil
  costNoVAT: number;      // Total fără TVA
  vat: number;            // TVA
  total: number;          // Total cu TVA
}
```

## UI Flow

### Delivery Step - 3 Pași

1. **Selecție tip livrare:**
   - Email (PDF) - Gratuit, instant
   - Livrare Fizică - Curier

2. **Selecție regiune:** (doar pentru fizic)
   - România - Fan Courier
   - Internațional - În curând (DHL, UPS, FedEx)

3. **Adresă și opțiuni:** (doar România)
   - Formular adresă (județ, localitate, stradă, etc.)
   - Selectare serviciu (Standard, FANbox, Express)
   - Pentru FANbox: dropdown cu lockere din județ, **sortate după distanță**

### Salvare Date Comandă

Datele de livrare sunt salvate în `order.form_data.delivery`:

```typescript
interface DeliveryState {
  method: 'email' | 'courier' | 'registered_mail' | null;
  methodName: string;  // Ex: "Fan Courier - Standard"
  price: number;
  estimatedDays: number;
  address?: AddressState;
  courierProvider?: string;  // 'fancourier'
  courierService?: string;   // 'Standard', 'FANbox', etc.
  courierQuote?: {
    provider: string;
    service: string;
    priceWithVAT: number;
    // Pentru FANbox:
    lockerId?: string;
    lockerName?: string;
    lockerAddress?: string;
  };
}
```

## FANbox - Calcul Distanță

### Funcționalitate

Când utilizatorul selectează FANbox, sistemul:
1. Cere permisiunea pentru geolocație (browser)
2. Calculează distanța de la utilizator la fiecare locker
3. Sortează lockerele după distanță (cel mai apropiat primul)
4. Afișează distanța în dropdown și la locker-ul selectat

### Implementare

```typescript
// Haversine formula pentru calcul distanță
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raza Pământului în km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

### UI Elements

- **Badge "Cel mai apropiat"** - pe primul locker din listă
- **Indicator distanță** - "2.3 km" sau "850 m" lângă fiecare locker
- **Text "sortate după distanță"** - în header când geolocația e disponibilă
- **"La X km de locația dvs."** - afișat după selectarea locker-ului

### Fallback

Dacă utilizatorul refuză geolocația:
- Lockerele se afișează fără distanță
- Sortarea se face alfabetic după oraș

## Logo Fan Courier

**Locație:** `/public/images/couriers/fancourier.svg`

Pentru a înlocui logo-ul:
1. Înlocuiți fișierul din `/public/images/couriers/fancourier.svg`
2. Păstrați dimensiunile viewport-ului (200x60)

## Troubleshooting

### Eroare Autentificare

Verificați:
1. Credențialele în `.env.local`
2. Parola trebuie pusă între ghilimele dacă conține caractere speciale (`#`, `$`, etc.)
3. Client ID corect (verificat prin `/reports/branches`)

### Tarife Nu Se Încarcă

1. Verificați consola browser pentru erori
2. Verificați `/api/courier/quote` direct cu parametri
3. Token-ul expirat se regenerează automat

### FANbox-uri Nu Apar

1. Verificați dacă județul selectat are FANbox-uri
2. API-ul `/api/courier/pickup-points?county=X` returnează liste goale pentru județe fără lockere

## Localities Autocomplete (NEW - 2026-01-13)

### Funcționalitate

Când utilizatorul selectează județul în formularul de livrare:
1. Se încarcă automat localitățile din Fan Courier API
2. Câmpul localitate devine un dropdown (nu text liber)
3. Asigură compatibilitate AWB (adresele match-uiesc nomenclatorul Fan Courier)

### API Endpoint

```
GET /api/courier/localities?county=Satu%20Mare&provider=fancourier
```

**Răspuns:**
```json
{
  "success": true,
  "data": {
    "type": "localities",
    "county": { "code": "Satu Mare", "name": "Satu Mare" },
    "localities": [
      { "id": "12345", "name": "Satu Mare", "county": "Satu Mare" },
      { "id": "12346", "name": "Carei", "county": "Satu Mare" }
    ],
    "source": "fancourier"
  }
}
```

### API Streets (Autocomplete Străzi)

```
GET /api/courier/streets?county=Cluj&locality=Cluj-Napoca
```

**Răspuns:**
```json
{
  "success": true,
  "data": {
    "type": "streets",
    "county": "Cluj",
    "locality": "Cluj-Napoca",
    "streets": [
      { "id": "111531", "name": "Alee Azuga", "locality": "Cluj-Napoca", "county": "Cluj" },
      { "id": "622", "name": "Bulevard Eroilor", "locality": "Cluj-Napoca", "county": "Cluj" }
    ],
    "total": 999,
    "source": "fancourier"
  }
}
```

**Note:**
- Străzile includ tipul (Alee, Bulevard, Strada, Cale, etc.) în numele afișat
- Max 1000 străzi per localitate (limită API Fan Courier)
- UI oferă opțiune "introdu manual" pentru străzi care nu sunt în listă

### Fișiere Modificate

- `src/app/api/courier/localities/route.ts` - Adăugat suport `provider=fancourier`
- `src/app/api/courier/streets/route.ts` - Endpoint nou pentru autocomplete străzi
- `src/lib/services/courier/fancourier.ts` - Metoda `getStreets()` pentru API Fan Courier
- `src/components/orders/steps-modular/delivery-step.tsx` - Dropdown pentru localități și străzi

### De Ce Fan Courier și Nu ANAF API?

Pentru adresele de livrare, folosim Fan Courier API pentru că:
1. **Compatibilitate AWB** - localitățile trebuie să existe în nomenclatorul lor
2. **Info extra** - Fan Courier returnează `exteriorKm` care afectează prețul
3. **ANAF API** (free, official) - folosit pentru validare companii (CUI) și adrese sediu social

---

## Roadmap

### Completat
- [x] Autentificare cu token caching (24h)
- [x] Calcul tarife în timp real (Standard, FANbox)
- [x] FANbox locker selection cu sortare după distanță
- [x] Localities autocomplete din Fan Courier API
- [x] UI delivery options cu radio buttons vizibile
- [x] Street autocomplete din Fan Courier API (`/reports/streets`) ✅ 2026-01-13

### În Lucru / De Făcut
- [ ] Caching localități (să nu se apeleze repetat pentru același județ)
- [ ] Integrare Sameday (Easybox)
- [ ] Integrare DHL pentru internațional
- [ ] Tracking AWB în timp real
- [ ] Generare AWB automat la confirmare comandă

---

**Ultima actualizare:** 2026-01-13
**Versiune API Fan Courier:** 2.0
