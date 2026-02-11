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
| **Company Data** | `company-data` | CUI, denumire firmă, validare ANAF API | Pentru servicii PJ sau când e nevoie de date firmă |
| **Property Data** | `property-data` | Județ, localitate, nr. cadastral | Extras CF, servicii imobiliare |
| **Vehicle Data** | `vehicle-data` | Nr. înmatriculare, categorie | Rovinieta, servicii auto |
| **Company Documents** | `company-documents` | Upload certificat înregistrare, certificat constatator | Servicii PJ care necesită documente firmă |
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
   - Validare CUI prin ANAF API (gratis, oficial)
   - Câmpuri: cui, companyName, regCom, companyAddress, bankName, bankIban
   - Tip: `persoana_juridica`

**Fișiere relevante:**
- `src/components/orders/steps-modular/billing-step.tsx` - Componentă UI
- `src/types/verification-modules.ts` - BillingState, BillingType, BillingSource

### Company Documents Step (NOU - 2026-02-10)

Pasul de documente firmă permite încărcarea documentelor companiei necesare pentru serviciile PJ. Apare doar pentru clienți de tip Persoană Juridică și se inserează automat **după** pasul `company-data` și **înainte** de `personal-data`.

**Condiții de vizibilitate:**
- `clientType === 'PJ'` (selectat la pasul Tip Client)
- `companyKyc.documentsRequired === true` (configurat în `verification_config`)

**Module type:** `companyDocuments`

**Documente suportate:**

| Cod | Denumire | Descriere |
|-----|----------|-----------|
| `company_registration_cert` | Certificat de Inregistrare | Document emis de Registrul Comertului cu CUI-ul firmei |
| `company_statement_cert` | Certificat Constatator | Certificat constatator emis de ONRC |

**Funcționalități principale:**

1. **Drag & drop file upload**
   - Formate acceptate: JPEG, PNG, PDF
   - Dimensiune maximă: 10MB per fișier
   - Previzualizare inline pentru imagini
   - Afișare info fișier (nume, tip) pentru PDF-uri

2. **Banner "Deja verificat"**
   - Apare pentru utilizatori logați care au deja documente firmă verificate în cont
   - Permite continuarea la pasul următor fără reîncărcare
   - Opțiune de reîncărcare documente noi (înlocuiește verificarea existentă)

3. **Sumar progres**
   - Afișează vizual care documente cerute sunt deja încărcate
   - Indicator numeric/check per document

**Configurare `companyKyc` în `verification_config`:**

```json
{
  "companyKyc": {
    "enabled": true,
    "condition": "client_type == 'PJ'",
    "validation": "infocui",
    "autoComplete": true,
    "allowedTypes": ["SRL", "SA", "PFA"],
    "blockedTypes": [],
    "specialRules": [],
    "documentsRequired": true,
    "requiredDocuments": ["company_registration_cert"]
  }
}
```

Câmpuri relevante pentru acest pas:

| Câmp | Tip | Descriere |
|------|-----|-----------|
| `documentsRequired` | `boolean` | Dacă `true`, pasul `company-documents` este adăugat în wizard |
| `requiredDocuments` | `('company_registration_cert' \| 'company_statement_cert')[]` | Lista documentelor obligatorii |

**Tipuri TypeScript:**

```typescript
// CompanyKYCConfig (câmpuri noi)
interface CompanyKYCConfig {
  // ... câmpuri existente
  documentsRequired: boolean;
  requiredDocuments: ('company_registration_cert' | 'company_statement_cert')[];
}

// CompanyKYCState (câmp pentru documente)
interface CompanyKYCState {
  // ... câmpuri existente
  uploadedDocuments: UploadedDocumentState[];
}

// UploadedDocumentState (partajat cu KYC personal)
interface UploadedDocumentState {
  id: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  base64?: string;
  s3Key?: string;
}
```

**Validare pas:**
- Dacă utilizatorul are documente verificate și nu a ales reîncărcarea, pasul este valid automat
- Altfel, toate documentele din `requiredDocuments` trebuie încărcate

**Fișiere relevante:**
- `src/components/orders/modules/company-kyc/CompanyDocumentsStep.tsx` - Componenta UI
- `src/types/verification-modules.ts` - CompanyKYCConfig, CompanyKYCState, UploadedDocumentState
- `src/lib/verification-modules/step-builder.ts` - Logica de inserare pas (după `company-data`)
- `src/lib/verification-modules/registry.ts` - Înregistrare modul și dynamic loader
- `src/providers/modular-wizard-provider.tsx` - `updateCompanyKycDocuments` action

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
    validation: 'infocui' | 'onrc' | 'manual';  // 'infocui' uses ANAF API (free)
    autoComplete: boolean;
    allowedTypes: string[];
    blockedTypes: string[];
    documentsRequired: boolean;  // Activează pasul company-documents
    requiredDocuments: ('company_registration_cert' | 'company_statement_cert')[];
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
    "validation": "infocui",      // Uses ANAF API (free, official)
    "autoComplete": true
  },
  "signature": { "enabled": true, "required": true }
}
```

**Pași pentru PF:** Contact → Tip Client → Date Personale → Opțiuni → KYC → Semnătură → Livrare → Review
**Pași pentru PJ:** Contact → Tip Client → Date Firmă → Documente Firmă → Date Reprezentant → Opțiuni → KYC → Semnătură → Livrare → Review

> **Notă:** Pasul "Documente Firmă" apare doar dacă `companyKyc.documentsRequired === true`.

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

    // Company Documents - dacă PJ și documentsRequired
    if (config.companyKyc.documentsRequired) {
      steps.push({ id: 'company-documents', condition: state => state.clientType === 'PJ', ... });
    }
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
│       ├── company-kyc/                    # CompanyDataStep + CompanyDocumentsStep
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

**Actualizat:** 2026-02-10
**Versiune:** 1.1
