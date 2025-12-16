# Certificat de Integritate Comportamentală

## Overview

| Atribut | Valoare |
|---------|---------|
| **ID Serviciu** | SRV-013 |
| **Form ID WordPress** | 7990 |
| **Categorie** | Caziere & Fișe |
| **Status** | Activ |
| **Comenzi totale** | 2,201 |
| **API Disponibil** | Planificat |
| **KYC Necesar** | DA |

## Descriere

Certificatul de Integritate Comportamentală atestă că titularul nu a săvârșit infracțiuni sexuale, de exploatare a persoanelor sau asupra minorilor. Obligatoriu pentru persoanele care lucrează cu copii (învățământ, asistenți maternali, adopții, etc.).

## Prețuri

### Preț Bază
| Serviciu | Preț |
|----------|------|
| Certificat Integritate Comportamentală | 250,00 RON |

### Regim Procesare
| Regim | Preț | Timp |
|-------|------|------|
| Standard | +0 RON | 3-5 zile lucrătoare |
| Urgent | +100,00 RON | 1-2 zile lucrătoare |

### Servicii Adiționale
| Serviciu | Preț |
|----------|------|
| Traducere Autorizată | +178,50 RON |
| Apostilă Haga | +238,00 RON |
| Legalizare Traducere | +99,00 RON |
| Apostilă Camera Notarilor | +83,30 RON |

### Cross-sell: Cazier Judiciar
| Serviciu | Preț |
|----------|------|
| Cazier Judiciar (bundle) | +150,00 RON |
| + Traducere pentru Cazier | +178,50 RON |
| + Apostilă Haga pentru Cazier | +238,00 RON |
| + Legalizare pentru Cazier | +99,00 RON |
| + Apostilă Camera Notarilor | +83,30 RON |

### Livrare
| Destinație | Preț |
|------------|------|
| România | +25,00 RON |
| Străinătate | +90,00 RON |

### Exemple Configurații
| Configurație | Total |
|--------------|-------|
| CIC simplu + livrare RO | 275,00 RON |
| CIC urgent + traducere + livrare RO | 553,50 RON |
| CIC + Cazier bundle + livrare RO | 425,00 RON |

## Use Cases Principale

| Motiv | Descriere |
|-------|-----------|
| **Angajare** | Obligatoriu pentru joburi cu copii |
| **Adopție** | Cerință legală |
| **Asistent Maternal** | Obligatoriu DGASPC |
| **Concurs** | Posturi în învățământ |
| **Voluntariat** | Activități cu minori |

## User Flow (6 pași)

### Step 1: Date Contact
```
┌─────────────────────────────────────────┐
│  Certificat Integritate Comportamentală │
│  ══════════════════════════════════════ │
│                                         │
│  Email: [________________] *            │
│  Telefon: [________________] *          │
│  Nume Complet: [________________] *     │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 2: Date Personale
```
┌─────────────────────────────────────────┐
│  CNP: [________________] *              │
│  Prenume Mamă: [________________] *     │
│  Prenume Tată: [________________] *     │
│  Nume Anterior: [________________]      │
│                                         │
│  Motivul solicitării: *                 │
│  [▼ Selectează]                         │
│    - Angajare                           │
│    - Adopție                            │
│    - Asistent Maternal                  │
│    - Concurs                            │
│    - Alte motive                        │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 3: Documente & KYC
```
┌─────────────────────────────────────────┐
│  DOCUMENTE NECESARE                     │
│                                         │
│  Pasul 1/2 - Act Identitate *           │
│  ┌─────────────────────────────────┐    │
│  │  [Upload Buletin/Pașaport]      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Pasul 2/2 - Selfie cu document *       │
│  ┌─────────────────────────────────┐    │
│  │  [Upload Selfie + Act]          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ─────────────────────────────────────  │
│  SEMNĂTURĂ *                            │
│  ┌─────────────────────────────────┐    │
│  │     [Canvas pentru semnătură]   │    │
│  └─────────────────────────────────┘    │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 4: Serviciu & Opțiuni
```
┌─────────────────────────────────────────┐
│  SERVICIU                               │
│  ○ Persoană Fizică (250 RON) *          │
│                                         │
│  Regim procesare: *                     │
│  ○ Standard 3-5 zile (+0 RON)           │
│  ○ Urgent 1-2 zile (+100 RON)           │
│                                         │
│  ─────────────────────────────────────  │
│  CROSS-SELL                             │
│  □ Doresc și Cazier Judiciar (+150 RON) │
│                                         │
│    [Dacă selectat:]                     │
│    □ Traducere Cazier (+178,50 RON)     │
│    □ Apostilă Haga Cazier (+238 RON)    │
│    □ Legalizare Cazier (+99 RON)        │
│    □ Apostilă Camera Notarilor (+83,30) │
│                                         │
│  ─────────────────────────────────────  │
│  OPȚIUNI CIC                            │
│  □ Traducere Autorizată (+178,50 RON)   │
│    Limba: [▼ 9 limbi]                   │
│  □ Apostilă Haga (+238 RON)             │
│    Țara: [________________]             │
│  □ Legalizare Traducere (+99 RON)       │
│  □ Apostilă Camera Notarilor (+83,30)   │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 5: Livrare
```
┌─────────────────────────────────────────┐
│  LIVRARE                                │
│                                         │
│  Livrarea se va face: *                 │
│  ○ Electronic                           │
│  ○ Electronic & Livrare la adresă       │
│                                         │
│  Unde livrăm? *                         │
│  ○ România (+25 RON)                    │
│  ○ Străinătate (+90 RON)                │
│                                         │
│  Adresa Livrare: [________________]     │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 6: Facturare & Plată
```
┌─────────────────────────────────────────┐
│  DATE FACTURARE                         │
│                                         │
│  Factură pe: ○ PF  ○ PJ                 │
│  [Date facturare...]                    │
│                                         │
│  ─────────────────────────────────────  │
│  REZUMAT                                │
│  CIC                       250,00 RON   │
│  Urgent                   +100,00 RON   │
│  Cazier Judiciar          +150,00 RON   │
│  Livrare RO                +25,00 RON   │
│  ─────────────────────────────────────  │
│  TOTAL:                   525,00 RON    │
│                                         │
│  Cupon: [________] [Aplică]             │
│  ☑ Am acceptat T&C *                    │
│  [Card] [MM/YY] [CVC]                   │
│                                         │
│              [Plătește 525,00 RON →]    │
└─────────────────────────────────────────┘
```

## Date Colectate (Input)

### Date Personale
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| email | string | Da |
| telefon | string | Da |
| nume_complet | name | Da |
| cnp | number | Da |
| prenume_mama | string | Da |
| prenume_tata | string | Da |
| nume_anterior | string | Nu |

### Serviciu
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| motiv_solicitare | enum | Da (11 opțiuni) |
| regim_procesare | enum | Da |
| limba_traducere | enum | Condițional (9 limbi) |
| tara_apostila | string | Condițional |

### KYC
| Document | Obligatoriu |
|----------|-------------|
| Act identitate | Da |
| Selfie cu act | Da |
| Semnătură | Da |

## Motive Solicitare (11 opțiuni)

- Adopție
- Angajare
- Asistent Maternal
- Concurs
- Voluntariat
- Învățământ
- Tutore legal
- Îngrijitor
- Alte motive

## Limbi Traducere (9)

- Engleză (UK)
- Engleză (SUA)
- Engleză (AUS)
- Franceză
- Italiană
- Spaniolă
- Germană
- Portugheză
- Arabă

## Cross-sell Strategy

### Bundle Cazier Judiciar
- **Trigger**: Majoritatea care iau CIC au nevoie și de Cazier
- **Preț bundle**: +150 RON (vs 250 RON separat = economie 100 RON)
- **Add-ons separate**: Traducere/apostilă pentru fiecare document

**Note**: Acest cross-sell este inversat în formularul Cazier Judiciar (acolo CIC e add-on +150 RON)

## Documente Generate

| Document | Stocare |
|----------|---------|
| Contract prestări servicii | 10 ani |
| Împuternicire | 10 ani |
| Certificat Integritate Comportamentală | Trimis client |
| Cazier Judiciar (dacă solicitat) | Trimis client |
| Traducere | Trimis client |
| Factură | Conform legii |

## Business Rules

1. **KYC obligatoriu**: Selfie + semnătură pentru toți
2. **Bundle reciproc**: CIC și Cazier se vând împreună frecvent
3. **Urgență**: 1-2 zile vs 3-5 zile standard
4. **Traduceri**: 9 limbi disponibile
5. **Preț bundle avantajos**: 150 RON vs 250 RON separat

## Note Dezvoltare

- Formular mai simplu decât Cazier Judiciar
- Cross-sell bidirecțional cu Cazier
- KYC standard (selfie + semnătură)
- 11 motive predefinite
- Livrare simplificată (2 opțiuni)

## Istoric Modificări

| Data | Versiune | Modificare |
|------|----------|------------|
| 2024-12-15 | 1.0 | Documentat din WPForms JSON |
