# Cazier Judiciar Online

## Overview

| Atribut | Valoare |
|---------|---------|
| **ID Serviciu** | SRV-002 |
| **Form ID WordPress** | 7876 |
| **Categorie** | Caziere & Fișe |
| **Status** | Activ |
| **Comenzi totale** | ~5,000+ |
| **API Disponibil** | Planificat |
| **KYC Necesar** | DA |

## Descriere

Serviciu de obținere cazier judiciar online de la Poliția Română. Formular complex cu opțiuni pentru persoane fizice/juridice, cetățeni români și străini, cu posibilitate de traducere, apostilare și livrare internațională.

## Prețuri

### Preț Bază
| Tip Client | Preț |
|------------|------|
| Persoană Fizică | 250,00 RON |
| Persoană Juridică | 250,00 RON |

### Regim Procesare
| Regim | Preț | Timp |
|-------|------|------|
| Standard | +0 RON | 3-5 zile lucrătoare |
| Urgent | +100,00 RON | 1-2 zile lucrătoare |
| Extins (cetățeni străini) | 119,00 RON | 7-15 zile lucrătoare |

### Servicii Adiționale
| Serviciu | Preț | Timp extra |
|----------|------|------------|
| Traducere Autorizată | +178,50 RON | +1-2 zile |
| Apostilă Haga | +238,00 RON | +1 zi |
| Legalizare Traducere | +99,00 RON | - |
| Apostilă Camera Notarilor | +83,30 RON | - |

### Certificat Integritate Comportamentală (Bundle)
| Serviciu | Preț |
|----------|------|
| Certificat Integritate | +150,00 RON |
| + Traducere pentru CIC | +178,50 RON |
| + Apostilă Haga pentru CIC | +238,00 RON |
| + Legalizare pentru CIC | +99,00 RON |
| + Apostilă Camera Notarilor CIC | +83,30 RON |

### Livrare
| Destinație | Metodă | Preț | Timp |
|------------|--------|------|------|
| România | Fan Curier | +25,00 RON | 1-2 zile |
| Străinătate | DHL | +200,00 RON | 1-3 zile |
| Străinătate | Poșta Română | +90,00 RON | 7-10 zile |

## Tipuri Clienți & KYC

| Tip Client | Documente Necesare |
|------------|-------------------|
| **PF Cetățean Român** | Buletin/Pașaport + Selfie KYC |
| **PF Cetățean European** | Pașaport/CI + Permis rezidență + Selfie |
| **PF Cetățean Străin** | Pașaport + Permis ședere + Certificat înregistrare + Selfie |
| **Persoană Juridică** | CUI (validare infocui.ro) + KYC reprezentant |

## User Flow (7 pași)

1. **Date Contact** - Email, telefon, nume
2. **Tip Client** - PF/PJ, cetățenie, CNP, date naștere, părinți
3. **Documente KYC** - Upload acte + selfie (diferit per tip cetățenie)
4. **Semnătură** - Contract pe canvas electronic
5. **Opțiuni** - Motivul, regim procesare, livrare
6. **Servicii Extra** - Traducere, apostilă, bundle CIC
7. **Facturare & Plată** - Date facturare, Stripe

## Date Colectate

### Date Personale Obligatorii
- CNP, Localitate naștere, Țară naștere
- Prenume mamă, Prenume tată
- Nume anterior (opțional)

### Date PJ (dacă firmă)
- CUI → auto-completare: nume, cod înmatriculare, adresă, stare

### Motive Solicitare
**200+ opțiuni** grupate în:
- Angajare / Instituții (ANAF, APIA, ARR, etc.)
- Autorizații / Licențe / Examene
- Bancă / Asigurări / Licitații
- Emigrare / Vize / Adopție

## Validări Speciale (din functions.php)

| Tip Entitate | Rezultat |
|--------------|----------|
| SRL, SA, etc. | ✅ Cazier PJ normal |
| ONG, Asociație, Fundație | ⚠️ Necesită Extras Registrul Asociațiilor |
| PFA, II, IF | ⚠️ Se eliberează cazier PF (nu au personalitate juridică) |

## Documente Generate

- Contract prestări servicii (10 ani)
- Împuternicire avocațială (10 ani)
- Cazier Judiciar (livrat client)
- Certificat Integritate (dacă solicitat)
- Traducere autorizată (dacă solicitat)
- Factură

## Bundle Cross-sell

**Certificat Integritate Comportamentală** (+150 RON)
- Poate avea servicii separate de cazier (traducere, apostilă proprie)
- Bun pentru upselling

## Note Dezvoltare

- Cel mai complex formular din platformă
- KYC diferențiat: 2 pași (RO) vs 3 pași (străin)
- Semnătură electronică obligatorie
- 200+ motive - listă completă necesară pentru instituții
- Selfie KYC - **problemă cunoscută** (nu se încarcă)

---

## Analiză Competitori (Dec 2025)

### Comparație Piață

| Competitor | Preț Standard | Timp Livrare | KYC | Diferențiator |
|------------|--------------|--------------|-----|---------------|
| **ghișeul.ro (oficial)** | GRATUIT | Instant | Card 3D Secure | Gratuit, dar necesită cont validat |
| **cazierul-judiciar-online.ro** | 149 RON | 12-48h | CI copie | Cel mai ieftin, WhatsApp delivery |
| **cazierrapid.ro** | 150 RON | 24-48h | CI copie | Similar cu cel de sus |
| **eGhiseul.ro (noi)** | 250 RON | 3-5 zile | CI + Selfie | Cross-sell, urgență, internațional |

### Ce face bine competiția

1. **Preț mai mic** - 149 RON vs 250 RON (diferență 100 RON)
2. **Flow simplu 3 pași** - formular, plată, contract = done
3. **Livrare WhatsApp** - foarte convenabil pentru diaspora
4. **Timp mai rapid** - 12-48h vs 3-5 zile standard
5. **Mesaje clare** - "Fără cozi, fără deplasări, fără programare"

### Ce facem noi mai bine

1. **KYC robust** - selfie cu document (previne frauda identitate)
2. **Cross-sell complet** - traduceri, apostilă, certificat integritate
3. **Opțiune urgentă** - pentru cei care au nevoie în 1-2 zile
4. **Livrare internațională** - DHL pentru diaspora
5. **Suport PJ complet** - validare CUI automată

### Flow Competitor (cazierul-judiciar-online.ro)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Formular   │ →  │   Plată     │ →  │  Contract   │ →  │  Document   │
│  (date+CI)  │    │  149 RON    │    │  electronic │    │ WhatsApp/   │
│             │    │             │    │             │    │   Email     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ↓                                                       ↓
   5 minute                                               12-48 ore
```

### Recomandări pentru Noua Platformă

| Recomandare | Prioritate | Impact | Implementare |
|-------------|------------|--------|--------------|
| **Adaugă WhatsApp delivery** | P0 | Mare | Twilio/SMSLink |
| **Flow vizual 3 pași** | P0 | Mare | UI simplificat |
| **Progress bar prominent** | P0 | Mare | Reduce abandon |
| **Preț competitiv 199 RON** | P1 | Mare | Evaluare marjă |
| **Timer urgență** | P1 | Mediu | "Primești în 24h" countdown |
| **Testimoniale vizibile** | P1 | Mediu | Social proof |
| **Chat live** | P2 | Mediu | Tawk.to/Intercom |

### Mesaje de Marketing (de la competitori)

**Headlines eficiente:**
- "Cazier Judiciar Online - Fără Cozi, Fără Programare"
- "Primești cazierul în 24-48 ore, direct pe email"
- "149 RON - Preț final, fără costuri ascunse"
- "Valabil la orice instituție din România și străinătate"

**Trust signals folosite:**
- "Parteneriat cu avocați autorizați"
- "Peste 10.000 de clienți mulțumiți"
- "Document semnat electronic, valabil legal"

### Oportunități Identificate

1. **Segment neglijat: Firme (HR)** - nimeni nu face bulk orders bine
2. **Bundle agresiv** - Cazier + CIC la 350 RON (vs 400 RON separat)
3. **Abonament lunar** - pentru firme cu angajări frecvente
4. **API pentru integratori** - ATS-uri, platforme HR

### Riscuri de Monitorizat

1. **Prețul oficial = 0** - ghișeul.ro e gratuit
2. **Timp competiție** - 12-48h vs noi 3-5 zile
3. **Simplitate** - 3 pași vs 7 pași
4. **WhatsApp** - canal preferat diaspora

---

## Istoric

| Data | Modificare |
|------|------------|
| 2025-12-15 | Adăugat analiză competitori și recomandări |
| 2024-12-15 | Documentat din WPForms JSON |
