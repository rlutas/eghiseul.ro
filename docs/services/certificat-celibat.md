# Certificat de Celibat (Anexa 9)

## Overview

| Atribut | Valoare |
|---------|---------|
| **ID Serviciu** | SRV-012 |
| **Form ID WordPress** | 8566 |
| **Categorie** | Certificate Stare Civilă |
| **Status** | Activ |
| **Comenzi totale** | 4,708 |
| **API Disponibil** | Planificat |
| **KYC Necesar** | DA |

## Descriere

Serviciu de obținere Certificat de Celibat (Anexa 9) - document care atestă că solicitantul nu este căsătorit. Folosit preponderent pentru încheierea căsătoriei în străinătate. Include opțiuni de traducere în 20 de limbi și apostilare.

## Prețuri

### Preț Bază
| Serviciu | Preț |
|----------|------|
| Certificat de Celibat (România) | 699,00 RON |

### Cross-sell: Certificat Naștere
| Serviciu | Preț | Note |
|----------|------|------|
| Certificat Naștere Tip Nou (ALBASTRU) | +999,00 RON | Necesar pentru celibat |

### Traduceri (20 limbi)
| Tier | Limbi | Preț |
|------|-------|------|
| Standard | EN, FR, DE, IT, HU | 178,50 RON |
| Mediu | PT, ES, NL, UK, RU | 238,00 RON |
| Avansat | BG, HR, CZ, SK | 297,50 RON |
| Premium | SE, EL, PL | 357,00 RON |
| Specialty | FI, DA, LA | 416,50 RON |

### Servicii Adiționale
| Serviciu | Preț |
|----------|------|
| Apostilă Haga | +238,00 RON |
| Legalizare Traducere | +99,00 RON |
| Apostilă Camera Notarilor | +83,30 RON |

### Livrare
| Destinație | Metodă | Preț |
|------------|--------|------|
| România | Fan Curier | +25,00 RON |
| Străinătate | Poșta Română | +100,00 RON |
| Străinătate | DHL | +200,00 RON |

### Exemple Configurații
| Configurație | Total |
|--------------|-------|
| Celibat simplu + livrare RO | 724,00 RON |
| + Traducere EN + Apostilă | 1.140,50 RON |
| + Certificat Naștere nou | 2.139,50 RON |

## Use Case Principal

**Căsătorie în străinătate** - majoritatea clienților solicită certificatul pentru a se căsători într-o altă țară care cere dovada că nu sunt deja căsătoriți.

## User Flow (7 pași)

### Step 1: Date Contact
```
┌─────────────────────────────────────────┐
│  Certificat de Celibat (Anexa 9)        │
│  ══════════════════════════════════════ │
│                                         │
│  Email: [________________] *            │
│  Telefon: [________________] *          │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 2: Date Personale & Stare Civilă
```
┌─────────────────────────────────────────┐
│  Nume Complet: [________________] *     │
│  CNP: [________________] *              │
│                                         │
│  Localitatea nașterii: [________] *     │
│  Județul nașterii: [________] *         │
│  Naționalitatea: [▼ 185 opțiuni] *      │
│                                         │
│  Numele complet al tatălui: [______] *  │
│  Numele complet al mamei: [______] *    │
│                                         │
│  Oficiul Stare Civilă (localitatea): *  │
│  [________________]                     │
│                                         │
│  ─────────────────────────────────────  │
│  STARE CIVILĂ                           │
│                                         │
│  Ați mai fost căsătorit(ă) anterior? *  │
│  ○ Da  ○ Nu                             │
│                                         │
│  [Dacă Da:]                             │
│  Mai dețineți vechiul certificat? *     │
│  ○ Da  ○ Nu                             │
│                                         │
│  Ați fost divorțat(ă)? *                │
│  ○ Da  ○ Nu                             │
│                                         │
│  Sunteți văduv(ă)? *                    │
│  ○ Da  ○ Nu                             │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 3: Serviciu & Destinație
```
┌─────────────────────────────────────────┐
│  SERVICIU SOLICITAT                     │
│                                         │
│  ☑ Certificat de Celibat (699 RON) *    │
│                                         │
│  Certificatul e pentru căsătorie în     │
│  străinătate? *                         │
│  ○ Da  ○ Nu                             │
│                                         │
│  Țara în care va fi folosit: *          │
│  [▼ 195 țări]                           │
│                                         │
│  Scopul obținerii: [________________] * │
│                                         │
│  ─────────────────────────────────────  │
│  CERTIFICAT NAȘTERE (necesar)           │
│                                         │
│  Dețineți certificat naștere nou        │
│  (albastru)? *                          │
│  ○ Da  ○ Nu                             │
│                                         │
│  [Dacă Nu:]                             │
│  Doriți să vă ajutăm cu obținerea? *    │
│  ○ Da (+999 RON)  ○ Nu                  │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 4: Documente & KYC
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
│  Vechiul certificat (dacă aveți):       │
│  ☑ Pierdut / Furat / Deteriorat         │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 5: Semnare Contract
```
┌─────────────────────────────────────────┐
│  SEMNĂTURĂ CONTRACT                     │
│                                         │
│  Adresa Domiciliu România: *            │
│  [Adresă completă]                      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │     [Canvas pentru semnătură]   │    │
│  └─────────────────────────────────┘    │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 6: Opțiuni & Livrare
```
┌─────────────────────────────────────────┐
│  OPȚIUNI EXTRA                          │
│                                         │
│  □ Traducere Autorizată                 │
│    Limba: [▼ 20 limbi]                  │
│                                         │
│  □ Apostilă Haga (+238 RON)             │
│  □ Legalizare Traducere (+99 RON)       │
│  □ Apostilă Camera Notarilor (+83,30)   │
│                                         │
│  ─────────────────────────────────────  │
│  LIVRARE                                │
│  ○ Electronic                           │
│  ○ Electronic & Livrare la adresă       │
│                                         │
│  Unde livrăm? *                         │
│  ○ România (+25 RON)                    │
│  ○ Străinătate (Poștă +100 / DHL +200)  │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 7: Facturare & Plată
```
┌─────────────────────────────────────────┐
│  DATE FACTURARE                         │
│                                         │
│  Factură pe: ○ PF  ○ PJ                 │
│  [Date facturare...]                    │
│                                         │
│  ─────────────────────────────────────  │
│  REZUMAT                                │
│  Certificat Celibat        699,00 RON   │
│  Certificat Naștere       +999,00 RON   │
│  Traducere EN             +178,50 RON   │
│  Apostilă Haga            +238,00 RON   │
│  Livrare DHL              +200,00 RON   │
│  ─────────────────────────────────────  │
│  TOTAL:                 2.314,50 RON    │
│                                         │
│  Cupon: [________] [Aplică]             │
│  ☑ Am acceptat T&C *                    │
│  [Card] [MM/YY] [CVC]                   │
│                                         │
│            [Plătește 2.314,50 RON →]    │
└─────────────────────────────────────────┘
```

## Date Colectate (Input)

### Date Personale
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| nume_complet | name | Da |
| cnp | number | Da |
| localitate_nastere | string | Da |
| judet_nastere | string | Da |
| nationalitate | enum | Da (185 opțiuni) |
| nume_tata | name | Da |
| nume_mama | name | Da |
| oficiu_stare_civila | string | Da |

### Stare Civilă (Toate obligatorii)
| Câmp | Tip | Note |
|------|-----|------|
| casatorit_anterior | boolean | Dacă Da → întrebare certificat |
| vechiul_certificat | boolean | Condițional |
| divortat | boolean | |
| vaduv | boolean | |
| pentru_casatorie_strainatate | boolean | Use case principal |

### Certificat Naștere
| Câmp | Tip | Note |
|------|-----|------|
| are_certificat_nou | boolean | Albastru (tip nou) |
| doreste_ajutor_nastere | boolean | Cross-sell +999 RON |

### Destinație
| Câmp | Tip |
|------|-----|
| tara_utilizare | enum (195 țări) |
| scop_obtinere | string |

## Cross-sell Strategy

### Certificat Naștere Tip Nou
- **Trigger**: Când clientul nu are certificat naștere "albastru"
- **Preț**: +999 RON
- **Motiv**: Certificatul de celibat necesită certificat naștere actualizat
- **Conversie estimată**: Ridicată (este necesar)

## Documente Generate

| Document | Stocare |
|----------|---------|
| Contract prestări servicii | 10 ani |
| Împuternicire | 10 ani |
| Certificat de Celibat (Anexa 9) | Trimis client |
| Certificat Naștere (dacă solicitat) | Trimis client |
| Traducere | Trimis client |
| Factură | Conform legii |

## Business Rules

1. **Certificat Naștere**: Majoritatea clienților au nevoie și de acesta
2. **Căsătorie străinătate**: Use case principal - afectează opțiunile
3. **Stare civilă complexă**: Divorțați/văduvi au flow diferit
4. **Apostilă**: Aproape mereu necesară pentru străinătate
5. **20 limbi traducere**: Aceleași prețuri ca la Certificat Naștere

## Note Dezvoltare

- Cross-sell puternic cu Certificat Naștere
- Întrebări stare civilă critice pentru procesare
- KYC standard (selfie + semnătură)
- Formular similar cu Certificat Naștere
- Preț mediu comandă ridicat datorită cross-sell

## Istoric Modificări

| Data | Versiune | Modificare |
|------|----------|------------|
| 2024-12-15 | 1.0 | Documentat din WPForms JSON |
