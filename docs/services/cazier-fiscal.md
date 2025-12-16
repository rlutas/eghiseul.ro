# Cazier Fiscal Online

## Overview

| Atribut | Valoare |
|---------|---------|
| **ID Serviciu** | SRV-001 |
| **Form ID WordPress** | 7896 |
| **Categorie** | Caziere & Fișe |
| **Status** | Activ |
| **Comenzi totale** | 33,723 |
| **API Disponibil** | Planificat |
| **KYC Necesar** | DA |

## Descriere

Serviciu de obținere cazier fiscal online de la ANAF. Clientul încarcă actul de identitate, completează datele și primește cazierul fiscal electronic sau prin curier. Necesită KYC (selfie cu buletin) și semnătură electronică.

## Prețuri

### Preț Bază
| Serviciu | Preț |
|----------|------|
| Cazier Fiscal - Persoană Fizică | 250,00 RON |

### Livrare
| Destinație | Preț |
|------------|------|
| România (electronic + curier) | +25,00 RON |
| Străinătate | +89,25 RON |

### Add-ons
| Serviciu | Preț | Timp suplimentar |
|----------|------|------------------|
| Traducere Autorizată | +178,50 RON | +1 zi |
| Legalizare Traducere | +83,30 RON | - |

### Exemple Totale
| Configurație | Total |
|--------------|-------|
| Cazier simplu România | 275,00 RON |
| Cazier + traducere România | 453,50 RON |
| Cazier + traducere + legalizare străinătate | 601,05 RON |

## Tipuri Cetățenie

| Tip | Documente necesare |
|-----|-------------------|
| Română cu domiciliu în România | Buletin/Pașaport + Selfie KYC |
| Străină/Română fără domiciliu | + Permis Rezidență / Certificat Înregistrare Fiscală |

## User Flow (Multi-Step Form)

### Step 1: Date Contact & Cetățenie
```
┌─────────────────────────────────────────┐
│  Cazier Fiscal Online                   │
│  ══════════════════════════════════════ │
│                                         │
│  Email: [________________] *            │
│  Telefon: [________________] *          │
│  Nume: [________________] *             │
│  CNP: [________________] *              │
│                                         │
│  Am cetățenie: *                        │
│  ○ Română cu domiciliu în România       │
│  ○ Străină/Română fără domiciliu        │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 2: Documente & Motive
```
┌─────────────────────────────────────────┐
│  Motivul solicitării: *                 │
│  [▼ Alege motivul]                      │
│    - Angajare                           │
│    - Înființare firmă                   │
│    - Obținere autorizație/licență       │
│    - Licitație                          │
│    - Bancă                              │
│    - ... (28 opțiuni)                   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  ÎNCARCĂ BULETIN SAU PAȘAPORT * │    │
│  │  [Drag & Drop sau Click]        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Dacă cetățenie străină:]              │
│  ┌─────────────────────────────────┐    │
│  │  ÎNCARCĂ PERMIS REZIDENȚĂ /     │    │
│  │  CERTIFICAT ÎNREGISTRARE FISC.* │    │
│  └─────────────────────────────────┘    │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 3: KYC - Verificare Identitate
```
┌─────────────────────────────────────────┐
│  VERIFICARE IDENTITATE (KYC)            │
│  ══════════════════════════════════════ │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  ÎNCARCĂ FOTOGRAFIE CU DVS.     │    │
│  │  ȘI ACTUL DE IDENTITATE *       │    │
│  │                                 │    │
│  │  [Exemplu imagine]              │    │
│  │                                 │    │
│  │  [Drag & Drop sau Click]        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ⚠️ Fotografiați-vă ținând buletinul   │
│     lângă față, vizibil și clar        │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 4: Semnătură
```
┌─────────────────────────────────────────┐
│  SEMNĂTURĂ ELECTRONICĂ                  │
│  ══════════════════════════════════════ │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │     [Canvas pentru semnătură]   │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│  [Șterge] [Confirmă]                    │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 5: Livrare & Opțiuni
```
┌─────────────────────────────────────────┐
│  OPȚIUNI LIVRARE                        │
│                                         │
│  Livrarea se va face: *                 │
│  ○ Electronic                           │
│  ○ Electronic & Livrare la adresă       │
│                                         │
│  [Dacă livrare fizică:]                 │
│  Adresa Livrare: *                      │
│  [Strada, Nr, Bloc, Ap]                 │
│  [Oraș] [Județ] [Cod poștal]            │
│                                         │
│  Unde livrăm? *                         │
│  ○ România (+25 RON)                    │
│  ○ Străinătate (+89,25 RON)             │
│                                         │
│  □ Traducere Autorizată (+178,50 RON)   │
│    Limba: [▼ Engleză UK/SUA/Franceză...]│
│                                         │
│  □ Legalizare Traducere (+83,30 RON)    │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 6: Facturare & Plată
```
┌─────────────────────────────────────────┐
│  DATE FACTURARE                         │
│                                         │
│  Factură pe: *                          │
│  ○ Persoană fizică                      │
│  ○ Persoană juridică                    │
│                                         │
│  [Dacă PJ:]                             │
│  CUI: [____________] * [Verifică]       │
│  Nume Firmă: [____________] *           │
│                                         │
│  Adresă Facturare: *                    │
│  [Strada, Nr, Bloc, Ap, Oraș, Județ]    │
│                                         │
│  ─────────────────────────────────────  │
│  REZUMAT                                │
│  Cazier Fiscal PF          250,00 RON   │
│  Livrare România           +25,00 RON   │
│  ─────────────────────────────────────  │
│  TOTAL:                   275,00 RON    │
│                                         │
│  Cupon: [________] [Aplică]             │
│                                         │
│  Detalii Plată *                        │
│  [Card] [MM/YY] [CVC]                   │
│                                         │
│  ☑ Am citit și accept T&C *             │
│                                         │
│              [Plătește 275,00 RON →]    │
└─────────────────────────────────────────┘
```

## Date Colectate (Input)

### Date Personale
| Câmp | Tip | Obligatoriu | Validare |
|------|-----|-------------|----------|
| email | string | Da | Format email |
| telefon | string | Da | Format RO |
| nume_prenume | name | Da | - |
| cnp | number | Da | 13 cifre, checksum |
| cetatenie | enum | Da | RO domiciliu / Străină |

### Documente (Upload)
| Câmp | Tip | Obligatoriu | Condiție |
|------|-----|-------------|----------|
| buletin_pasaport | file | Da | Toți |
| permis_rezidenta | file | Condițional | Cetățenie străină |
| selfie_kyc | file | Da | KYC - selfie cu act |
| semnatura | signature | Da | Canvas semnătură |

### Detalii Comandă
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| motiv_solicitare | enum | Da (28 opțiuni) |
| tip_livrare | enum | Da |
| adresa_livrare | address | Condițional |
| destinatie | enum | Da (RO/Străinătate) |
| traducere | boolean | Nu |
| limba_traducere | enum | Condițional |
| legalizare | boolean | Nu |

### Date Facturare
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| tip_client | enum | Da (PF/PJ) |
| cui | string | Condițional (PJ) |
| nume_firma | string | Condițional (PJ) |
| adresa_facturare | address | Da |

## Motive Solicitare (28 opțiuni)

- Angajare
- Numirea în funcție
- Înființarea asociației / Fundației / GIE
- Obținere autorizație/Licență
- Înscriere Examen/Concurs
- Înscrierea în Barou
- Institutul Național de Magistratură
- Camera Consultanților Fiscali
- Licitație
- Accesare Fonduri
- Bancă / Asigurare
- Contract în Asigurări
- Încheierea Contractului
- APIA
- Programul RABLA
- Autorizare Agent Temporar
- Evidența Populației
- Direcția Generală a Vămilor
- Ministrul Muncii
- Înlesniri de Plată
- Administrarea Fondului de Mediu
- Dosar / Informare / Verificare Stare
- Alte motive

## Limbi Traducere

- Engleză (UK)
- Engleză (SUA)
- Franceză
- Italiană
- Spaniolă
- Portugheză
- Germană
- Arabă

## Documente Generate

| Document | Când | Stocare |
|----------|------|---------|
| Contract prestări servicii | La plasare | 10 ani |
| Împuternicire avocațială | La plasare | 10 ani |
| Cazier Fiscal ANAF | La finalizare | Trimis client |
| Traducere autorizată | Dacă solicitat | Trimis client |
| Factură | După plată | Conform legii |

## Integrări

| Sistem | Scop |
|--------|------|
| Stripe | Procesare plată |
| Olbio | Emitere factură |
| infocui.ro | Validare CUI |
| ANAF | Obținere cazier fiscal |
| Email | Confirmare + livrare |
| Curier | Livrare fizică |

## KYC Requirements

⚠️ **ACEST SERVICIU NECESITĂ KYC**

| Verificare | Metodă | Status actual |
|------------|--------|---------------|
| Act identitate | Upload fișier | ✅ Funcțional |
| Selfie cu act | Upload fișier | ⚠️ Probleme raportate |
| Semnătură | Canvas electronic | ✅ Funcțional |

**Probleme cunoscute:**
- Selfie cu buletinul nu se încarcă corect (menționat de client)
- Noul sistem: AI verification pentru face matching

## Business Rules

1. **Cetățenie străină**: Necesită documente suplimentare (permis rezidență)
2. **Traducere**: Disponibilă în 8 limbi, +1 zi procesare
3. **Legalizare**: Doar împreună cu traducere
4. **KYC obligatoriu**: Selfie + semnătură pentru toți clienții
5. **Livrare străinătate**: Preț diferit (+89,25 vs +25 RON)

## Note Dezvoltare

- Formular complex cu 6+ pași
- KYC critic - trebuie îmbunătățit în noul sistem
- Semnătură electronică - de integrat cu soluție profesională
- 28 motive predefinite - de menținut pentru ANAF
- Traducere în 8 limbi - parteneriat cu traducători autorizați

## Istoric Modificări

| Data | Versiune | Modificare |
|------|----------|------------|
| 2024-12-15 | 1.0 | Documentat din WPForms JSON |
