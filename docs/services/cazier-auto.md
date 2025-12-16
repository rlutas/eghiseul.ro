# Cazier Auto (Rutier)

## Overview

| Atribut | Valoare |
|---------|---------|
| **ID Serviciu** | SRV-008 |
| **Form ID WordPress** | 10110 |
| **Categorie** | Caziere & Fișe |
| **Status** | Activ |
| **Comenzi totale** | 809 |
| **API Disponibil** | Planificat |
| **KYC Necesar** | DA |

## Descriere

Cazierul Auto (Rutier) este un document oficial care atestă dacă titularul are sau nu fapte înregistrate în baza de date a Poliției Rutiere. Necesar pentru angajare în domeniul transporturilor, obținere calificări profesionale (ARR), sau interes personal.

**Notă specială**: Permisele de conducere străine pot fi verificate doar pentru fapte comise pe teritoriul României.

## Prețuri

### Preț Bază (Permis Românesc)
| Regim | Preț | Timp |
|-------|------|------|
| Urgent | 249,00 RON | 1-2 zile lucrătoare |
| Standard | 199,00 RON | 3-5 zile lucrătoare |

### Preț Permis Străin
| Regim | Preț | Timp |
|-------|------|------|
| Standard | 349,00 RON | 7-10 zile lucrătoare |

### Servicii Adiționale
| Serviciu | Preț |
|----------|------|
| Traducere Autorizată | +178,50 RON |
| Apostilă Haga | +238,00 RON |
| Legalizare Traducere | +99,00 RON |
| Apostilă Camera Notarilor | +83,30 RON |

### Livrare
| Destinație | Metodă | Preț |
|------------|--------|------|
| România | Fan Curier | +25,00 RON |
| Străinătate | Poșta Română (7-10 zile) | +90,00 RON |
| Străinătate | DHL (1-3 zile) | +200,00 RON |

### Exemple Configurații
| Configurație | Total |
|--------------|-------|
| Cazier Auto simplu urgent + livrare RO | 274,00 RON |
| Cazier Auto + traducere EN + Apostilă | 665,50 RON |
| Permis străin + DHL | 549,00 RON |

## Use Cases Principale

| Motiv | Descriere |
|-------|-----------|
| **Loc de muncă** | Angajare ca șofer profesionist |
| **Interes personal** | Verificare proprie |
| **Înscriere concurs** | Concursuri transport |
| **Înscriere curs** | Cursuri ARR, taxi, etc. |
| **Obținere calificări** | Certificări profesionale |
| **Alte motive** | Diverse |

## User Flow (6 pași)

### Step 1: Date Contact & Permis
```
┌─────────────────────────────────────────┐
│  Cazier Auto Online                     │
│  ══════════════════════════════════════ │
│                                         │
│  Email: [________________] *            │
│  Telefon: [________________] *          │
│  Nume Complet: [________________] *     │
│                                         │
│  Numărul Permisului: [__________] *     │
│  (Punctul 5 pe permisul românesc)       │
│                                         │
│  □ Permis de conducere din străinătate  │
│    ⚠ Dacă nu dețineți permis românesc   │
│                                         │
│  Motivul solicitării: *                 │
│  [▼ Selectează]                         │
│    - Loc de muncă                       │
│    - Interes personal                   │
│    - Înscriere concurs                  │
│    - Înscriere curs                     │
│    - Obținere calificări/certificări    │
│    - Alte motive                        │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 2: Opțiuni Extra
```
┌─────────────────────────────────────────┐
│  REGIM PROCESARE (Permis RO) *          │
│  ○ Urgent 1-2 zile (249 RON)            │
│  ○ Standard 3-5 zile (199 RON)          │
│                                         │
│  [Dacă permis străin:]                  │
│  ○ Standard 7-10 zile (349 RON)         │
│  ⚠ Documentul va fi o confirmare        │
│    pentru fapte comise în România       │
│                                         │
│  ─────────────────────────────────────  │
│  OPȚIUNI EXTRA                          │
│                                         │
│  □ Traducere Autorizată (+178,50 RON)   │
│    Limba: [▼ 9 limbi]                   │
│                                         │
│  □ Apostilă Haga (+238 RON)             │
│    Țara: [________________]             │
│                                         │
│  [Dacă traducere selectată:]            │
│  □ Legalizare Traducere (+99 RON)       │
│    □ Apostilă Camera Notarilor (+83,30) │
│                                         │
│  ─────────────────────────────────────  │
│  LIVRARE                                │
│  ○ Electronic                           │
│  ○ Electronic & Livrare la adresă       │
│                                         │
│  [Dacă livrare fizică:]                 │
│  Unde livrăm? *                         │
│  ○ România (+25 RON)                    │
│  ○ Străinătate                          │
│    ○ DHL 1-3 zile (+200 RON)            │
│    ○ Poștă 7-10 zile (+90 RON)          │
│                                         │
│  [Date livrare dacă selectat]           │
│  Nume Contact: [________________]       │
│  Telefon: [________________]            │
│  Adresa: [________________]             │
│                                         │
│  Total: XXX,XX RON                      │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 3: Verificare Identitate (KYC)
```
┌─────────────────────────────────────────┐
│  DOCUMENTE NECESARE                     │
│  Pași obligatorii (2/2)                 │
│                                         │
│  ⚠ Ai nevoie de DOUĂ fotografii:        │
│  1. Documentul de identitate            │
│     (buletin/pașaport + PERMISUL AUTO)  │
│  2. Selfie cu documentul în mână        │
│                                         │
│  Pasul 1/2 - Act Identitate + Permis *  │
│  ┌─────────────────────────────────┐    │
│  │  [Upload - max 3 fișiere]      │    │
│  │  Pentru buletin nou: față+verso │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Pasul 2/2 - Selfie cu document *       │
│  ┌─────────────────────────────────┐    │
│  │  [Upload Selfie + Act]          │    │
│  │  Fața și datele actului clare   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ⚠ Fără selfie nu putem elibera actul!  │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 4: Semnare Contract
```
┌─────────────────────────────────────────┐
│  CONTRACT PRESTĂRI SERVICII             │
│  ┌─────────────────────────────────┐    │
│  │  [PDF Contract Embed]           │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│  📄 Descarcă Contractul PDF             │
│                                         │
│  SEMNĂTURĂ *                            │
│  ┌─────────────────────────────────┐    │
│  │     [Canvas pentru semnătură]   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ☑ Am citit și sunt de acord cu T&C *   │
│    Comanda nu poate fi anulată după     │
│    plasare.                             │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 5: Detalii Facturare
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
│  Adresa (din CI): [________________] *  │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 6: Plată
```
┌─────────────────────────────────────────┐
│  PLATĂ                                  │
│                                         │
│  Cupon: [________] [Aplică Reducere]    │
│                                         │
│  [Card] [MM/YY] [CVC]                   │
│                                         │
│  ─────────────────────────────────────  │
│  TOTAL DE PLATĂ:             XXX,XX RON │
│                                         │
│              [Plătește XXX,XX RON →]    │
└─────────────────────────────────────────┘
```

## Date Colectate (Input)

### Date Contact
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| email | string | Da |
| telefon | string | Da |
| nume_complet | name | Da |

### Date Permis
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| numar_permis | string | Da |
| tip_permis | checkbox | Nu (default: RO) |
| motiv_solicitare | enum | Da (6 opțiuni) |

### KYC
| Document | Obligatoriu | Note |
|----------|-------------|------|
| Act identitate + Permis | Da | Max 3 fișiere |
| Selfie cu act | Da | 1 fișier |
| Semnătură | Da | Canvas |

### Serviciu
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| regim_procesare | enum | Da |
| limba_traducere | enum | Condițional (9 limbi) |
| tara_apostila | string | Condițional |

## Limbi Traducere (9)

- Engleză (UK)
- Engleză (SUA)
- Engleză (AUS)
- Franceză
- Italiană
- Spaniolă
- Portugheză
- Germană
- Olandeză

## Motive Solicitare (6)

1. Loc de muncă
2. Interes personal
3. Înscriere concurs
4. Înscriere curs
5. Obținere calificări/certificări
6. Alte motive

## Documente Generate

| Document | Stocare |
|----------|---------|
| Contract prestări servicii | 10 ani |
| Împuternicire | 10 ani |
| Cazier Auto | Trimis client |
| Traducere | Trimis client |
| Factură | Conform legii |

## Business Rules

1. **Permis străin**: Timp procesare mai lung (7-10 zile) și preț diferit (349 RON)
2. **Permis străin**: Documentul confirmă doar faptele din România
3. **KYC special**: Necesită atât CI/pașaport CÂT ȘI permisul auto
4. **Fără cross-sell**: Nu există bundle-uri cu alte servicii
5. **Număr permis**: Obligatoriu - punctul 5 pe permisul românesc
6. **Traduceri**: 9 limbi disponibile (mai puține decât alte servicii)

## Integrări

| Sistem | Scop |
|--------|------|
| Stripe | Procesare plată |
| Google Sheets | Multiple foi pentru tracking |
| Slack | Notificări comenzi noi |
| Webhook | Automatizare contracte |

## Diferențe față de alte Caziere

| Aspect | Cazier Auto | Cazier Judiciar | Cazier Fiscal |
|--------|-------------|-----------------|---------------|
| Preț bază | 199-249 RON | 250 RON | 250 RON |
| Permis străin | Da (+349 RON) | N/A | N/A |
| Cross-sell | Nu | Da (CIC) | Nu |
| Motive | 6 | 28 | 28 |
| Limbi traducere | 9 | 9 | 8 |
| KYC extra | Permis auto | Nu | Nu |

## Note Dezvoltare

- Formular mai simplu (6 pași)
- KYC include permisul auto (specifică acestui serviciu)
- Logică condițională pentru permis străin
- Prețuri diferențiate: RO vs străin
- Fără opțiuni cross-sell
- Integrare Google Sheets cu multiple foi

## Istoric Modificări

| Data | Versiune | Modificare |
|------|----------|------------|
| 2024-12-15 | 1.0 | Documentat din WPForms JSON |
