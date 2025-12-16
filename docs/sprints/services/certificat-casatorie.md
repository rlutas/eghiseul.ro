# Certificat de Căsătorie

## Overview

| Atribut | Valoare |
|---------|---------|
| **ID Serviciu** | SRV-009 |
| **Form ID WordPress** | 7923 |
| **Categorie** | Certificate Stare Civilă |
| **Status** | Activ |
| **Comenzi totale** | 604 |
| **API Disponibil** | Planificat |
| **KYC Necesar** | DA |

## Descriere

Serviciu de obținere duplicat certificat de căsătorie de la Starea Civilă. Include informații despre data căsătoriei, numele soțului/soției înainte de căsătorie, și opțiuni de traducere în 20 de limbi, apostilare și livrare internațională.

## Prețuri

### Preț Bază
| Serviciu | Preț |
|----------|------|
| Certificat de Căsătorie (Simplu) | 1.190,00 RON |

### Traduceri (20 limbi - prețuri diferențiate)
| Categorie | Limbi | Preț |
|-----------|-------|------|
| **Standard** | Engleză, Franceză, Germană, Italiană, Maghiară | 178,50 RON |
| **Mediu** | Portugheză, Spaniolă, Olandeză, Ucraineană | 238,00 RON |
| **Avansat** | Rusă, Bulgară, Croată, Cehă, Slovacă | 297,50 RON |
| **Premium** | Suedeză, Greacă, Poloneză | 357,00 RON |
| **Specialty** | Finlandeză, Daneză, Latină | 416,50 RON |

### Servicii Adiționale
| Serviciu | Preț |
|----------|------|
| Legalizare Traducere | +99,00 RON |
| Apostilă Haga | +238,00 RON |
| Apostilă Camera Notarilor | +83,30 RON |
| **Extras Multilingv Căsătorie** | +399,00 RON |

### Livrare
| Destinație | Metodă | Preț |
|------------|--------|------|
| România | Fan Curier | +25,00 RON |
| Străinătate | Poșta Română (7-10 zile) | +100,00 RON |
| Străinătate | DHL (1-3 zile) | +200,00 RON |

### Exemple Configurații
| Configurație | Total |
|--------------|-------|
| Certificat simplu + livrare RO | 1.215,00 RON |
| + Traducere EN + Apostilă Haga | 1.631,50 RON |
| + Extras Multilingv + DHL | 1.814,00 RON |

## Use Case Principal

**Duplicat certificat căsătorie** - pentru utilizare în străinătate, proceduri legale, sau înlocuire document pierdut/deteriorat.

## User Flow (7 pași)

### Step 1: Date Contact
```
┌─────────────────────────────────────────┐
│  Certificat de Căsătorie                │
│  ══════════════════════════════════════ │
│                                         │
│  Nume: [________] Prenume: [________] * │
│  Email: [________________] *            │
│  Telefon: [________________] *          │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 2: Serviciu Dorit
```
┌─────────────────────────────────────────┐
│  SERVICIU                               │
│  ☑ Certificat de Căsătorie (1.190 RON)* │
│                                         │
│  Data căsătoriei: [__/__/____] *        │
│                                         │
│  Numele complet al soțului/soției       │
│  înainte de căsătorie: [__________] *   │
│                                         │
│  ─────────────────────────────────────  │
│  STARE CIVILĂ                           │
│                                         │
│  Ați mai fost căsătorit(ă) anterior? *  │
│  ○ Da  ○ Nu                             │
│                                         │
│  [Dacă Da:]                             │
│  Ați fost divorțat(ă)? ○ Da ○ Nu *      │
│                                         │
│  [Dacă Nu la prima întrebare:]          │
│  Sunteți văduv(ă)? ○ Da ○ Nu *          │
│                                         │
│  ─────────────────────────────────────  │
│  LOCAȚIE & DESTINAȚIE                   │
│                                         │
│  Oficiul care a înregistrat actul       │
│  se află în localitatea: [________] *   │
│                                         │
│  Țara în care va fi folosit actul: *    │
│  [▼ 195+ țări]                          │
│                                         │
│  Numele complet al tatălui: [______] *  │
│  Numele complet al mamei: [______] *    │
│                                         │
│  Scopul obținerii: [________________] * │
│                                         │
│  ─────────────────────────────────────  │
│  OPȚIUNI EXTRA                          │
│                                         │
│  □ Traducere Autorizată                 │
│    Limba: [▼ 20 limbi]                  │
│    □ Legalizare Traducere (+99 RON)     │
│      □ Apostilă Camera Notarilor        │
│                                         │
│  □ Apostilă Haga (+238 RON)             │
│    Țara: [________________]             │
│                                         │
│  ─────────────────────────────────────  │
│  CROSS-SELL                             │
│  □ Extras Multilingv Căsătorie (+399)   │
│    ⚠ Nu se poate traduce/apostila       │
│                                         │
│  Total: XXX,XX RON                      │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 3: Opțiuni Livrare
```
┌─────────────────────────────────────────┐
│  LIVRARE                                │
│                                         │
│  Livrarea se va face: *                 │
│  ○ Electronic                           │
│  ○ Electronic & Livrare la adresă       │
│                                         │
│  [Dacă livrare fizică:]                 │
│  Unde livrăm? *                         │
│  ○ România (+25 RON Fan Curier)         │
│  ○ Străinătate                          │
│    ○ Poștă 7-10 zile (+100 RON)         │
│    ○ DHL 1-3 zile (+200 RON)            │
│                                         │
│  Adresa Livrare: *                      │
│  Strada: [________________]             │
│  Oraș: [________________]               │
│  Județ/Regiune: [________________]      │
│  Cod Poștal: [________________]         │
│  Țara: [▼ Select]                       │
│                                         │
│  Total: XXX,XX RON                      │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 4: Documente Necesare (KYC)
```
┌─────────────────────────────────────────┐
│  DOCUMENTE NECESARE                     │
│  Pași obligatorii (2/2)                 │
│                                         │
│  ⚠ Ai nevoie de DOUĂ fotografii:        │
│  1. Documentul de identitate            │
│  2. Selfie cu documentul în mână        │
│                                         │
│  Pasul 1/2 - Act Identitate *           │
│  ┌─────────────────────────────────┐    │
│  │  [Upload - max 2 fișiere]      │    │
│  │  Pentru buletin nou: față+verso │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Pasul 2/2 - Selfie cu document *       │
│  ┌─────────────────────────────────┐    │
│  │  [Upload Selfie + Act]          │    │
│  │  Fața și datele actului clare   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Vechiul Certificat (Opțional)          │
│  ┌─────────────────────────────────┐    │
│  │  [Upload dacă disponibil]       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ⚠ Fără selfie nu putem elibera actul!  │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 5: Semnare Contract
```
┌─────────────────────────────────────────┐
│  CONTRACT PRESTĂRI SERVICII             │
│  ┌─────────────────────────────────┐    │
│  │  [PDF Contract Embed]           │    │
│  └─────────────────────────────────┘    │
│  📄 Descarcă Contractul PDF             │
│                                         │
│  SEMNĂTURĂ *                            │
│  ┌─────────────────────────────────┐    │
│  │     [Canvas pentru semnătură]   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ☑ Am citit și sunt de acord cu T&C *   │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 6: Detalii Facturare
```
┌─────────────────────────────────────────┐
│  DATE FACTURARE                         │
│                                         │
│  Factură pe: *                          │
│  ○ Persoană fizică                      │
│  ○ Persoană juridică                    │
│                                         │
│  [Dacă PJ:]                             │
│  CUI: [________] [Caută Firma]          │
│  Nume Firmă: [________________]         │
│                                         │
│  [Dacă PF:]                             │
│  Nume/Prenume: [________________] *     │
│  CNP: [________________] *              │
│  Adresa: [________________] *           │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 7: Plată
```
┌─────────────────────────────────────────┐
│  PLATĂ                                  │
│                                         │
│  Cupon: [________] [Aplică Discount]    │
│                                         │
│  [Card] [MM/YY] [CVC]                   │
│                                         │
│  ─────────────────────────────────────  │
│  TOTAL DE PLATĂ:           XXX,XX RON   │
│                                         │
│              [Plătește XXX,XX RON →]    │
└─────────────────────────────────────────┘
```

## Date Colectate (Input)

### Date Personale
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| nume_complet | name | Da |
| email | string | Da |
| telefon | string | Da |
| nume_tata | name | Da |
| nume_mama | name | Da |

### Date Căsătorie
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| data_casatoriei | date | Da |
| nume_sot_inainte | string | Da |
| casatorit_anterior | boolean | Da |
| divortat | boolean | Condițional |
| vaduv | boolean | Condițional |

### Destinație
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| oficiu_localitate | string | Da |
| tara_utilizare | enum | Da (195+ țări) |
| scop_obtinere | string | Da |

### KYC
| Document | Obligatoriu | Note |
|----------|-------------|------|
| Act identitate | Da | Max 2 fișiere |
| Selfie cu act | Da | 1 fișier |
| Vechiul certificat | Nu | 1 fișier |
| Semnătură | Da | Canvas |

## Limbi Traducere (20)

| Tier | Limbi | Preț |
|------|-------|------|
| 1 | EN, FR, DE, IT, HU | 178,50 |
| 2 | PT, ES, NL, UK | 238,00 |
| 3 | RU, BG, HR, CZ, SK | 297,50 |
| 4 | SE, EL, PL | 357,00 |
| 5 | FI, DA, LA | 416,50 |

## Cross-sell Strategy

### Extras Multilingv Căsătorie
- **Preț**: +399 RON
- **Caracteristici**: Document standardizat internațional
- **Limitare**: Nu se poate traduce și nici apostila
- **Avantaj**: Valabil în toate țările UE fără traducere

## Documente Generate

| Document | Stocare |
|----------|---------|
| Contract prestări servicii | 10 ani |
| Împuternicire | 10 ani |
| Certificat de Căsătorie | Trimis client |
| Traducere | Trimis client |
| Factură | Conform legii |

## Business Rules

1. **Data căsătoriei**: Obligatorie pentru identificarea actului
2. **Nume soț/soție înainte**: Necesar pentru verificare
3. **Stare civilă**: Întrebări condiționale despre divorț/văduvie
4. **Extras Multilingv**: Nu poate fi tradus/apostilat (notificare în formular)
5. **20 limbi traducere**: Aceleași prețuri ca la Certificat Naștere
6. **Timp procesare**: 15-30 zile lucrătoare (documente stare civilă)

## Integrări

| Sistem | Scop |
|--------|------|
| Stripe | Procesare plată |
| Google Sheets | Tracking comenzi |
| Stare Civilă | Obținere certificat |
| Traducători | 20 limbi |
| Apostilă Haga | Legalizare |
| Fan Curier / DHL / Poștă | Livrare |

## Comparație cu Certificat Naștere

| Aspect | Cert. Căsătorie | Cert. Naștere |
|--------|-----------------|---------------|
| Preț bază | 1.190 RON | 1.190 RON |
| Traduceri | 20 limbi | 20 limbi |
| Extras Multilingv | +399 RON | +399 RON |
| Date specifice | Data căs., nume soț | Loc naștere |
| Întrebări stare civilă | Da | Da (doar adult) |

## Note Dezvoltare

- Formular complex (7 pași)
- Similar cu Certificat Naștere ca structură
- KYC complet cu semnătură
- Cross-sell Extras Multilingv cu limitări
- Întrebări stare civilă condiționale
- Timp procesare mai lung (15-30 zile)

## Istoric Modificări

| Data | Versiune | Modificare |
|------|----------|------------|
| 2024-12-15 | 1.0 | Documentat din WPForms JSON |
