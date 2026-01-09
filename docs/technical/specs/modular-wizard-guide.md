# Ghid Dezvoltare Servicii cu Wizard Modular

## Introducere

Sistemul modular de wizard permite crearea de formulare personalizate pentru fiecare serviciu, folosind doar modulele necesare. În loc să ai un wizard cu 6 pași fix pentru toate serviciile, acum poți configura exact ce module are nevoie fiecare serviciu.

## Arhitectură

```
/comanda/[service]/page.tsx     → Încarcă serviciul și opțiunile
         ↓
ModularWizardProvider           → Gestionează starea wizard-ului
         ↓
ModularOrderWizard              → Renderizează pașii dinamici
         ↓
Step Builder                    → Generează pașii pe baza verification_config
         ↓
Module Components               → Componentele individuale pentru fiecare pas
```

## Module Disponibile

| Modul | Step ID | Descriere | Când se folosește |
|-------|---------|-----------|-------------------|
| **Contact** | `contact` | Email, telefon, preferință contact | ÎNTOTDEAUNA (obligatoriu) |
| **Client Type** | `client-type` | Selectare PF / PJ | Servicii care suportă ambele tipuri |
| **Personal Data** | `personal-data` | Nume, CNP, adresă, date document | Când serviciul necesită KYC personal |
| **Company Data** | `company-data` | CUI, denumire firmă, validare InfoCUI | Pentru servicii PJ sau când e nevoie de date firmă |
| **Property Data** | `property-data` | Județ, localitate, nr. cadastral | Extras CF, servicii imobiliare |
| **Vehicle Data** | `vehicle-data` | Nr. înmatriculare, categorie | Rovinieta, servicii auto |
| **KYC Documents** | `kyc-documents` | Upload CI, selfie, certificate | Servicii care necesită verificare identitate |
| **Signature** | `signature` | Semnătură electronică pe canvas | Servicii care necesită semnătură |
| **Options** | `options` | Opțiuni suplimentare (urgență, traduceri) | ÎNTOTDEAUNA (obligatoriu) |
| **Delivery** | `delivery` | Metodă livrare, adresă | ÎNTOTDEAUNA (obligatoriu) |
| **Billing** | `billing` | Date facturare PF/PJ | ÎNTOTDEAUNA (obligatoriu) |
| **Review** | `review` | Rezumat și confirmare termeni | ÎNTOTDEAUNA (obligatoriu) |

### Billing Step (NOU - 2026-01-08)

Pasul de facturare oferă 3 opțiuni:

1. **"Facturează pe mine"** (source: `self`)
   - Auto-populează datele din actul de identitate scanat
   - Câmpuri: firstName, lastName, cnp, address
   - Tip: `persoana_fizica`

2. **"Altă persoană fizică"** (source: `other_pf`)
   - Introducere manuală date persoană
   - Câmpuri: firstName, lastName, cnp, address
   - Tip: `persoana_fizica`

3. **"Persoană juridică"** (source: `company`)
   - Validare CUI prin InfoCUI API
   - Câmpuri: cui, companyName, regCom, companyAddress, bankName, bankIban
   - Tip: `persoana_juridica`

**Fișiere relevante:**
- `src/components/orders/steps-modular/billing-step.tsx` - Componentă UI
- `src/types/verification-modules.ts` - BillingState, BillingType, BillingSource

## Cum Adaugi un Serviciu Nou

### Pasul 1: Definește verification_config în Supabase

```sql
UPDATE services
SET verification_config = '{
  "clientTypeSelection": {
    "enabled": false
  },
  "personalKyc": {
    "enabled": true,
    "acceptedDocuments": ["ci_vechi", "ci_nou_front", "ci_nou_back", "passport"],
    "requireAddressCertificate": "ci_nou_passport",
    "selfieRequired": true,
    "signatureRequired": false,
    "expiredDocumentAllowed": false,
    "citizenshipFlows": {
      "romanian": { "documents": ["ci"] },
      "european": { "documents": ["passport", "residence_permit"] },
      "foreign": { "documents": ["passport", "residence_permit"] }
    },
    "parentDataRequired": false,
    "parentDocuments": { "enabled": false }
  },
  "companyKyc": {
    "enabled": false
  },
  "propertyVerification": {
    "enabled": false
  },
  "vehicleVerification": {
    "enabled": false
  },
  "signature": {
    "enabled": true,
    "required": true
  }
}'::jsonb
WHERE slug = 'cazier-fiscal';
```

### Pasul 2: Structura verification_config

```typescript
interface ServiceVerificationConfig {
  // Selectare tip client (PF/PJ)
  clientTypeSelection?: {
    enabled: boolean;
    options?: Array<{
      value: 'PF' | 'PJ';
      label: string;
      description?: string;
    }>;
  };

  // KYC Personal
  personalKyc: {
    enabled: boolean;
    acceptedDocuments: DocumentType[];
    requireAddressCertificate: 'always' | 'ci_nou_passport' | 'never';
    selfieRequired: boolean;
    signatureRequired: boolean;
    expiredDocumentAllowed: boolean;
    citizenshipFlows: { ... };
    parentDataRequired: boolean;
    parentDocuments: { enabled: boolean; condition?: string; };
  };

  // KYC Companie
  companyKyc: {
    enabled: boolean;
    condition?: string;  // ex: "client_type == 'PJ'"
    validation: 'infocui' | 'onrc' | 'manual';
    autoComplete: boolean;
    allowedTypes: string[];
    blockedTypes: string[];
  };

  // Verificare Imobil
  propertyVerification: {
    enabled: boolean;
    requireCadastral: boolean;
    requireCarteFunciara: boolean;
  };

  // Verificare Vehicul
  vehicleVerification: {
    enabled: boolean;
    requireVIN: boolean;
    categories: string[];
  };

  // Semnătură
  signature: {
    enabled: boolean;
    required: boolean;
  };
}
```

## Exemple de Configurații

### Cazier Fiscal (PF simplu)

```json
{
  "clientTypeSelection": { "enabled": false },
  "personalKyc": {
    "enabled": true,
    "acceptedDocuments": ["ci_vechi", "ci_nou_front", "ci_nou_back", "passport"],
    "selfieRequired": true,
    "signatureRequired": false
  },
  "companyKyc": { "enabled": false },
  "propertyVerification": { "enabled": false },
  "vehicleVerification": { "enabled": false },
  "signature": { "enabled": true, "required": true }
}
```

**Pași generați:** Contact → Date Personale → Opțiuni → KYC Documents → Semnătură → Livrare → Review

### Cazier Judiciar (PF + PJ)

```json
{
  "clientTypeSelection": {
    "enabled": true,
    "options": [
      { "value": "PF", "label": "Persoană Fizică" },
      { "value": "PJ", "label": "Persoană Juridică" }
    ]
  },
  "personalKyc": { "enabled": true, ... },
  "companyKyc": {
    "enabled": true,
    "condition": "client_type == 'PJ'",
    "validation": "infocui",
    "autoComplete": true
  },
  "signature": { "enabled": true, "required": true }
}
```

**Pași pentru PF:** Contact → Tip Client → Date Personale → Opțiuni → KYC → Semnătură → Livrare → Review
**Pași pentru PJ:** Contact → Tip Client → Date Firmă → Date Reprezentant → Opțiuni → KYC → Semnătură → Livrare → Review

### Extras Carte Funciară

```json
{
  "clientTypeSelection": { "enabled": false },
  "personalKyc": { "enabled": true, "selfieRequired": false },
  "propertyVerification": {
    "enabled": true,
    "requireCadastral": true,
    "requireCarteFunciara": true
  },
  "signature": { "enabled": false, "required": false }
}
```

**Pași:** Contact → Date Imobil → Date Personale → Opțiuni → Livrare → Review

### Rovinieta

```json
{
  "personalKyc": { "enabled": true, "selfieRequired": false },
  "vehicleVerification": {
    "enabled": true,
    "requireVIN": false,
    "categories": ["A", "B", "C", "D"]
  },
  "signature": { "enabled": false }
}
```

**Pași:** Contact → Date Vehicul → Date Personale → Opțiuni → Livrare → Review

## Cum Funcționează Step Builder

Fișier: `src/lib/verification-modules/step-builder.ts`

```typescript
export function buildWizardSteps(
  config: ServiceVerificationConfig,
  clientType?: 'PF' | 'PJ'
): ModularStep[] {
  const steps: ModularStep[] = [];

  // Contact - ÎNTOTDEAUNA
  steps.push({ id: 'contact', ... });

  // Client Type - dacă enabled
  if (config.clientTypeSelection?.enabled) {
    steps.push({ id: 'client-type', ... });
  }

  // Company - pentru PJ
  if (config.companyKyc.enabled && clientType === 'PJ') {
    steps.push({ id: 'company-data', ... });
  }

  // Personal - dacă enabled
  if (config.personalKyc.enabled) {
    steps.push({ id: 'personal-data', ... });
  }

  // Property - dacă enabled
  if (config.propertyVerification.enabled) {
    steps.push({ id: 'property-data', ... });
  }

  // Vehicle - dacă enabled
  if (config.vehicleVerification.enabled) {
    steps.push({ id: 'vehicle-data', ... });
  }

  // Options, KYC Documents, Signature, Delivery, Review...
  // ...similar logic

  return steps;
}
```

## Cum Adaugi un Modul Nou

### 1. Creează tipurile în `src/types/verification-modules.ts`

```typescript
export interface NewModuleConfig {
  enabled: boolean;
  // alte opțiuni specifice
}

export interface NewModuleState {
  // câmpurile de state
}
```

### 2. Creează componenta în `src/components/orders/modules/new-module/`

```typescript
// NewModuleStep.tsx
export default function NewModuleStep({ config }: { config: NewModuleConfig }) {
  const { state, updateNewModule } = useModularWizard();
  // ...
}
```

### 3. Înregistrează în registry

```typescript
// src/lib/verification-modules/registry.ts
'new-module': {
  stepId: 'new-module',
  label: 'New Module',
  labelRo: 'Modul Nou',
  componentPath: '@/components/orders/modules/new-module/NewModuleStep',
},
```

### 4. Adaugă în step builder

```typescript
// src/lib/verification-modules/step-builder.ts
if (config.newModule.enabled) {
  steps.push({ id: 'new-module', ... });
}
```

### 5. Adaugă în provider

```typescript
// src/providers/modular-wizard-provider.tsx
// - Adaugă în state inițial
// - Adaugă action pentru update
// - Adaugă în context value
```

## URL-uri

- **Comandă nouă:** `/comanda/[service-slug]`
- **Exemplu:** `/comanda/cazier-fiscal`
- **Exemplu PF:** `/comanda/cazier-judiciar-persoana-fizica`

## Testare

1. Navighează la http://localhost:3000
2. Click pe un serviciu
3. Click "Comandă Acum"
4. Verifică că pașii corespund cu verification_config din DB

## Fișiere Cheie

```
src/
├── app/comanda/[service]/page.tsx          # Pagina de comandă
├── components/orders/
│   ├── modular-order-wizard.tsx            # Wizard principal
│   ├── wizard-progress-modular.tsx         # Progress bar
│   ├── price-sidebar-modular.tsx           # Sidebar preț
│   ├── steps-modular/                      # Pașii core
│   │   ├── contact-step.tsx
│   │   ├── options-step.tsx
│   │   ├── delivery-step.tsx
│   │   └── review-step.tsx
│   └── modules/                            # Module specializate
│       ├── personal-kyc/
│       ├── company-kyc/
│       ├── property/
│       ├── vehicle/
│       ├── signature/
│       └── client-type/
├── lib/verification-modules/
│   ├── registry.ts                         # Registry module
│   ├── step-builder.ts                     # Generator pași
│   └── index.ts
├── providers/
│   └── modular-wizard-provider.tsx         # Provider state
└── types/
    └── verification-modules.ts             # Tipuri TypeScript
```

---

**Actualizat:** 2025-01-05
**Versiune:** 1.0
