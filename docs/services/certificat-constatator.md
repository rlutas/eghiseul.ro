# Certificat Constatator Online (ONRC)

## Overview

| Atribut | Valoare |
|---------|---------|
| **ID Serviciu** | SRV-030 |
| **Form ID WordPress** | 7908 |
| **Categorie** | Business & Imobiliare |
| **Status** | Activ |
| **Comenzi totale** | 6,201 |
| **API Disponibil** | Planificat |
| **KYC Necesar** | NU |

## Descriere

Serviciu de obținere certificat constatator de la Oficiul Național al Registrului Comerțului (ONRC). Disponibil pentru firme (SRL, SA, etc.) și persoane fizice autorizate. Document oficial cu date despre entitatea juridică.

## Prețuri

### Tipuri Document
| Tip | Preț | Descriere |
|-----|------|-----------|
| Certificat Constatator pe Firmă | 119,99 RON | Standard pentru PJ |
| Certificat Constatator Persoana Fizică | 119,99 RON | Pentru PFA, II, IF |
| Certificat Constatator cu Istoric | 499,99 RON | Include istoricul modificărilor |

### Add-ons
| Serviciu | Preț | Descriere |
|----------|------|-----------|
| Serviciu Urgență | +22,99 RON | Livrare în 30 minute |

### Exemple Totale
| Configurație | Total |
|--------------|-------|
| CC Standard | 119,99 RON |
| CC Standard + Urgență | 142,98 RON |
| CC cu Istoric | 499,99 RON |

## Tipuri Solicitanți

### Certificat pe Firmă (PJ)
Entități eligibile:
- SRL, S.R.L.
- SA, S.A.
- SCS, SCA, SNC
- Cooperative

### Certificat Persoana Fizică
Entități eligibile:
- PFA (Persoană Fizică Autorizată)
- II (Întreprindere Individuală)
- IF (Întreprindere Familială)

### Entități NEELIGIBILE (blocate în functions.php)
- Asociații, Fundații, ONG-uri
- Cabinete medicale, avocatură
- Federații, Ligi, Cluburi
- Sindicate
- Instituții de învățământ
- Entități religioase
- Puncte de lucru, Filiale, Sucursale

## User Flow (4 pași)

### Step 1: Date Contact & Firmă
```
┌─────────────────────────────────────────┐
│  Certificat Constatator Online          │
│  ══════════════════════════════════════ │
│                                         │
│  Email: [________________] *            │
│  Telefon: [________________] *          │
│                                         │
│  CUI / CIF Firmă: [________] *          │
│  → Auto-validare tip entitate           │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 2: Tip Document & Detalii
```
┌─────────────────────────────────────────┐
│  Tipul documentului: *                  │
│  ○ CC pe Firmă (119,99 RON)             │
│  ○ CC Persoana Fizică (119,99 RON)      │
│  ○ CC cu Istoric (499,99 RON)           │
│                                         │
│  [Dacă CC pe Firmă - subtipuri:]        │
│  Specificați tipul de raport: *         │
│  ○ Certificat constatator de bază       │
│  ○ Certificat constatator fonduri IMM   │
│  ○ Certificat constatator insolvență    │
│                                         │
│  [Dacă CC PF - subtipuri:]              │
│  ○ Certificat constatator CAS           │
│  ○ Certificat constatator pe persoana   │
│  ○ IGI - obținere viză                  │
│                                         │
│  Nume Firmă: [________________] *       │
│  (sau Nume Complet + CNP pentru PF)     │
│                                         │
│  Document solicitat spre a servi la: *  │
│  [▼ Selectează instituția]              │
│                                         │
│  Perioada certificatului: *             │
│  ○ De la înființare până în prezent     │
│  ○ Selectare Perioadă                   │
│    De la: [__/__/____]                  │
│    Până la: [__/__/____]                │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 3: Facturare
```
┌─────────────────────────────────────────┐
│  DATE FACTURARE                         │
│                                         │
│  Factură pe: *                          │
│  ○ Persoană fizică                      │
│  ○ Persoană juridică                    │
│                                         │
│  [Dacă PJ:]                             │
│  CUI facturare: [________] *            │
│  Nume Firmă: [________] *               │
│                                         │
│  [Dacă PF:]                             │
│  Nume / Prenume: [________] *           │
│                                         │
│  Adresă Facturare: *                    │
│  [Adresă completă]                      │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 4: Plată
```
┌─────────────────────────────────────────┐
│  FINALIZARE COMANDĂ                     │
│                                         │
│  □ Doresc Serviciul de Urgență          │
│    Livrare în 30 min (+22,99 RON)       │
│                                         │
│  □ Doresc Certificatul și pe WhatsApp   │
│                                         │
│  ─────────────────────────────────────  │
│  CC pe Firmă              119,99 RON    │
│  Serviciu Urgență         +22,99 RON    │
│  ─────────────────────────────────────  │
│  TOTAL:                  142,98 RON     │
│                                         │
│  Cupon: [________] [Aplică]             │
│                                         │
│  Detalii Plată *                        │
│  [Card] [MM/YY] [CVC]                   │
│                                         │
│  ☑ Am acceptat T&C *                    │
│                                         │
│              [Plătește 142,98 RON →]    │
└─────────────────────────────────────────┘
```

## Date Colectate (Input)

### Date Contact
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| email | string | Da |
| telefon | string | Da |

### Date Firmă/Solicitant
| Câmp | Tip | Obligatoriu | Note |
|------|-----|-------------|------|
| cui_cif | string | Da | Validare ONRC |
| nume_firma | string | Da | Auto sau manual |
| tip_document | enum | Da | 3 tipuri principale |
| tip_raport | enum | Condițional | Bazat pe tip document |
| scop_document | enum | Da | Instituția destinatară |
| perioada | enum | Da | Înființare sau custom |
| data_de_la | date | Condițional | Dacă perioadă custom |
| data_pana_la | date | Condițional | Dacă perioadă custom |

### Date PF (dacă CC Persoana Fizică)
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| nume_complet | name | Da |
| cnp | string | Da |

### Date Facturare
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| tip_factura | enum | Da (PF/PJ) |
| cui_facturare | string | Condițional |
| nume_firma_factura | string | Condițional |
| adresa_facturare | address | Da |

## Scopuri Document (Instituții)

### Pentru CC de bază (35+ opțiuni)
- Administrația Finanțelor Publice
- ANAF
- AFIR (Agenția pentru Finanțarea Investițiilor Rurale)
- APIA
- Administrația Fondului pentru Mediu
- Accesare Fonduri Europene
- Bănci
- Licitații
- Tribunal
- Altele

### Pentru CC Fonduri IMM
- Accesare Fonduri Europene
- APIA
- AFIR
- Fonduri IMM
- Ministerul Economiei

### Pentru CC Insolvență
- Birou Notar Public
- Licitație
- Tribunal

### Pentru CC PF - CAS
- Casa Națională de Asigurări de Sănătate

### Pentru CC PF - IGI
- Inspectoratul General pentru Imigrări

## Validări ONRC (din functions.php)

### Extensii Valide (acceptate)
```
SRL, S.R.L., SA, S.A., SCS, S.C.S., SCA, S.C.A., SNC, S.N.C.
II, I.I., IF, I.F., PFA, P.F.A.
COOPERATIVA, COOPERATIVĂ
```

### Tipuri Blocate (eroare afișată)
```
ASOCIAȚIA, FUNDAȚIA, FEDERAȚIA
ONG, CLUB, LIGA, SINDICAT
CABINET (medical, avocat, etc.)
PAROHIA, BISERICA, MĂNĂSTIRE
GRĂDINIȚA, ȘCOALA, LICEU
PUNCT DE LUCRU, FILIALA, SUCURSALA
BROKER ASIGURĂRI, EXECUTOR JUDECĂTORESC
BIROU NOTARIAL, NOTAR PUBLIC
```

**Mesaj eroare:**
> "ATENȚIE: Pentru acest tip de entitate (asociații, ONG-uri, cabinete medicale, fundații, etc.) nu se poate elibera certificat constatator de la ONRC!"

## Documente Generate

| Document | Când | Stocare |
|----------|------|---------|
| Contract prestări servicii | La plasare | 10 ani |
| Certificat Constatator ONRC | La finalizare | Trimis client |
| Factură | După plată | Conform legii |

## Integrări

| Sistem | Scop |
|--------|------|
| Stripe | Procesare plată |
| Olbio | Emitere factură |
| infocui.ro | Validare CUI + tip entitate |
| ONRC / Recom | Obținere certificat |
| WhatsApp API | Livrare opțională |
| Email | Confirmare + livrare |

## Business Rules

1. **Validare tip entitate**: Blocare automată pentru entități neeligibile
2. **CUI obligatoriu**: Nu se poate comanda fără CUI valid
3. **Urgență**: Livrare în 30 minute (doar zile lucrătoare)
4. **WhatsApp**: Opțional, trimis în plus față de email
5. **Perioadă custom**: Permite selectare interval specific pentru istoric
6. **Scop diferențiat**: Lista instituții diferă per tip document

## Note Dezvoltare

- Formular relativ simplu (4 pași)
- Validare ONRC critică - cod existent în functions.php
- Nu necesită KYC (doar CUI)
- Logică condițională pentru tipuri raport și scopuri
- WhatsApp delivery popular - de păstrat

## Istoric Modificări

| Data | Versiune | Modificare |
|------|----------|------------|
| 2024-12-15 | 1.0 | Documentat din WPForms JSON |
