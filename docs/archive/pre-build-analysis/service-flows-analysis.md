# Analiza Flow-urilor Servicii eGhiseul

## Executive Summary

După analizarea celor 12 servicii existente din WPForms, am identificat **pattern-uri comune**, **inconsistențe** și **oportunități de standardizare** pentru noua platformă.

### Concluzii Principale

1. **3 categorii distincte de servicii** cu flow-uri diferite
2. **Inconsistențe în ordinea pașilor** între servicii similare
3. **KYC duplicat** - aceleași câmpuri cerute în moduri diferite
4. **Cross-sell neuniform** - unele servicii au, altele nu
5. **Prețuri traduceri identice** dar prezentate diferit

---

## Partea 1: Categorizarea Serviciilor

### Categoria A: Caziere & Fișe (KYC Obligatoriu)

| Serviciu | Preț Bază | Urgență | Traduceri | Cross-sell |
|----------|-----------|---------|-----------|------------|
| Cazier Judiciar | 250 RON | Da (+100) | 9 limbi | CIC (+150) |
| Cazier Fiscal | 250 RON | Da (+100) | 8 limbi | Nu |
| Cazier Auto | 199-249 RON | Da | 9 limbi | Nu |
| Cert. Integritate | 250 RON | Da (+100) | 9 limbi | Cazier (+150) |

**Observații:**
- Prețuri similare (199-250 RON)
- Toate au opțiune urgență
- Cazier Judiciar și CIC au cross-sell bidirecțional
- Cazier Fiscal și Auto nu au cross-sell (oportunitate!)

### Categoria B: Certificate Stare Civilă (KYC + Complexitate Mare)

| Serviciu | Preț Bază | Traduceri | Cross-sell |
|----------|-----------|-----------|------------|
| Cert. Naștere | 1.190 RON | 20 limbi (5 tiers) | Multilingv (+399) |
| Cert. Căsătorie | 1.190 RON | 20 limbi (5 tiers) | Multilingv (+399) |
| Cert. Celibat | 699 RON | 20 limbi (5 tiers) | Cert. Naștere (+999) |
| Multilingv Naștere | 799 RON | N/A | Duplicat (+790) |
| Multilingv Căsătorie | 799 RON | N/A | Duplicat (+790) |

**Observații:**
- Prețuri mai mari (699-1.190 RON)
- Sistem traduceri complex cu 5 tiers de preț
- Cross-sell strategic între certificate
- Multilingv = nu necesită traducere (avantaj de promovat!)

### Categoria C: Documente Business (Fără KYC)

| Serviciu | Preț Bază | KYC | Complexitate |
|----------|-----------|-----|--------------|
| Extras Carte Funciară | 79.99-249.99 RON | NU | Medie |
| Certificat Constatator | 119.99-499.99 RON | NU | Mică |
| Rovinieta | Variabil | NU | Foarte mică |

**Observații:**
- Nu necesită KYC (verificare identitate)
- Procesare mai rapidă
- Cert. Constatator cel mai simplu

---

## Partea 2: Comparație Flow-uri Actuale

### Flow Cazier Judiciar vs Cazier Fiscal

```mermaid
flowchart TB
    subgraph CJ["CAZIER JUDICIAR - 7 pasi"]
        CJ1[1. Date Contact] --> CJ2[2. Date Personale + Motiv]
        CJ2 --> CJ3[3. Optiuni Serviciu]
        CJ3 --> CJ4[4. KYC Documente]
        CJ4 --> CJ5[5. Semnatura Contract]
        CJ5 --> CJ6[6. Livrare]
        CJ6 --> CJ7[7. Facturare + Plata]
    end

    subgraph CF["CAZIER FISCAL - 6 pasi"]
        CF1[1. Date Contact] --> CF2[2. Date Personale]
        CF2 --> CF3[3. Serviciu + Motiv]
        CF3 --> CF4[4. Livrare]
        CF4 --> CF5[5. KYC + Semnatura]
        CF5 --> CF6[6. Facturare + Plata]
    end
```

**Diferențe identificate:**
| Aspect | Cazier Judiciar | Cazier Fiscal |
|--------|-----------------|---------------|
| Nr. pași | 7 | 6 |
| Ordinea KYC | Pas 4 | Pas 5 |
| Ordinea Livrare | Pas 6 | Pas 4 |
| Cross-sell | Da (CIC) | Nu |
| Motiv solicitare | 28 opțiuni | 28 opțiuni |
| Cetățenie | Da (RO/străin) | Nu |

### Flow Certificate Stare Civilă

```mermaid
flowchart TB
    subgraph CN["CERTIFICAT NASTERE - 7 pasi"]
        CN1[1. Contact] --> CN2[2. Date Personale + Minor/Adult]
        CN2 --> CN3[3. Serviciu + Destinatie]
        CN3 --> CN4[4. KYC Documente]
        CN4 --> CN5[5. Semnatura]
        CN5 --> CN6[6. Optiuni + Livrare]
        CN6 --> CN7[7. Facturare + Plata]
    end

    subgraph CC["CERTIFICAT CASATORIE - 7 pasi"]
        CC1[1. Contact] --> CC2[2. Serviciu + Date Casatorie]
        CC2 --> CC3[3. Livrare]
        CC3 --> CC4[4. KYC Documente]
        CC4 --> CC5[5. Semnatura]
        CC5 --> CC6[6. Facturare]
        CC6 --> CC7[7. Plata]
    end
```

**Problema:** Opțiunile și Livrarea sunt în pași diferiți!

---

## Partea 3: Inconsistențe Identificate

### 1. Ordinea Pașilor Variază

| Serviciu | Contact | Date | Serviciu | KYC | Semnătură | Livrare | Plată |
|----------|---------|------|----------|-----|-----------|---------|-------|
| Cazier Judiciar | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| Cazier Fiscal | 1 | 2 | 3 | 5 | 5 | 4 | 6 |
| Cert. Naștere | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| Cert. Căsătorie | 1 | 2 | 3 | 4 | 5 | 3 | 7 |
| Cazier Auto | 1 | 1 | 2 | 3 | 4 | 2 | 6 |

**Problema:** Utilizatorul nu are o experiență consistentă între servicii.

### 2. Câmpuri KYC Diferite

| Câmp | CJ | CF | CA | CIC | CN | CC |
|------|----|----|----|----|----|----|
| Upload CI | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Selfie cu CI | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Semnătură | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Upload Pașaport | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Upload Permis | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Acte Părinți | ✗ | ✗ | ✗ | ✗ | ✓* | ✗ |

*doar pentru minori

### 3. Traduceri - Prețuri Inconsistente

| Limbă | Caziere | Stare Civilă |
|-------|---------|--------------|
| Engleză | 178.50 | 178.50 |
| Franceză | 178.50 | 178.50 |
| Germană | 178.50 | 178.50 |
| Rusă | - | 238.00/297.50 |
| Arabă | 178.50 | - |

**Problema:** Lista de limbi diferă între servicii.

### 4. Cross-sell Neuniform

```mermaid
graph LR
    CJ[Cazier Judiciar] <-->|+150 RON| CIC[Cert. Integritate]
    CN[Cert. Nastere] -->|+399 RON| MN[Multilingv Nastere]
    MN -->|+790 RON| CN
    CC[Cert. Casatorie] -->|+399 RON| MC[Multilingv Casatorie]
    MC -->|+790 RON| CC
    CEL[Cert. Celibat] -->|+999 RON| CN

    CF[Cazier Fiscal] -.-|LIPSA| X1[???]
    CA[Cazier Auto] -.-|LIPSA| X2[???]
```

**Oportunități:**
- Cazier Fiscal + Cazier Judiciar bundle?
- Cazier Auto + Cazier Judiciar pentru șoferi profesioniști?

---

## Partea 4: Flow Standardizat Propus

### Principii de Design

1. **Consistență** - Aceeași ordine a pașilor pentru servicii similare
2. **Progressive Disclosure** - Informații complexe doar când sunt relevante
3. **Cross-sell Strategic** - Oferte relevante la momentul potrivit
4. **Mobile-First** - Optimizat pentru completare pe telefon

### Flow Universal Propus (6 pași)

```mermaid
flowchart TB
    subgraph Step1["PAS 1: IDENTIFICARE"]
        S1A[Email] --> S1B[Telefon]
        S1B --> S1C[Nume Complet]
    end

    subgraph Step2["PAS 2: DATE SERVICIU"]
        S2A[Date specifice serviciului]
        S2B[Motiv solicitare]
        S2C[Destinatie / Tara utilizare]
    end

    subgraph Step3["PAS 3: OPTIUNI"]
        S3A[Regim procesare]
        S3B[Traduceri]
        S3C[Apostila]
        S3D[Cross-sell]
    end

    subgraph Step4["PAS 4: KYC"]
        S4A[Upload Document]
        S4B[Selfie Verificare]
        S4C[Documente Extra]
    end

    subgraph Step5["PAS 5: LIVRARE si CONTRACT"]
        S5A[Metoda Livrare]
        S5B[Adresa]
        S5C[Semnatura Electronica]
        S5D[Accept TandC]
    end

    subgraph Step6["PAS 6: PLATA"]
        S6A[Rezumat Comanda]
        S6B[Facturare PF/PJ]
        S6C[Cupon Reducere]
        S6D[Plata Card]
    end

    Step1 --> Step2 --> Step3 --> Step4 --> Step5 --> Step6
```

### Flow Detaliat per Categorie

#### A. Flow Caziere (Standardizat)

```mermaid
flowchart TB
    Start([Client acceseaza serviciul]) --> P1

    subgraph P1["PAS 1: DATE CONTACT"]
        P1A[Email *] --> P1B[Telefon *]
        P1B --> P1C[Nume Complet *]
    end

    P1 --> P2

    subgraph P2["PAS 2: DATE PERSONALE"]
        P2A[CNP *]
        P2B[Prenume Mama *]
        P2C[Prenume Tata *]
        P2D{Cetatean RO?}
        P2D -->|Da| P2E[Date CI]
        P2D -->|Nu| P2F[Date Pasaport + Viza]
        P2G[Motiv Solicitare *]
    end

    P2 --> P3

    subgraph P3["PAS 3: SERVICIU si OPTIUNI"]
        P3A[Tip Serviciu]
        P3B{Urgenta?}
        P3B -->|Da| P3C[+100 RON / 1-2 zile]
        P3B -->|Nu| P3D[Standard 3-5 zile]
        P3E{Traducere?}
        P3E -->|Da| P3F[Selecteaza Limba]
        P3G{Apostila?}
        P3G -->|Da| P3H[Tara destinatie]
        P3I{Cross-sell?}
        P3I -->|CJ| P3J[+ Cert. Integritate?]
        P3I -->|CIC| P3K[+ Cazier Judiciar?]
    end

    P3 --> P4

    subgraph P4["PAS 4: VERIFICARE IDENTITATE"]
        P4A[Upload CI/Pasaport *]
        P4B[Selfie cu Document *]
        P4C{Cazier Auto?}
        P4C -->|Da| P4D[Upload Permis *]
    end

    P4 --> P5

    subgraph P5["PAS 5: LIVRARE si CONTRACT"]
        P5A{Tip Livrare}
        P5A -->|Electronic| P5B[Doar email]
        P5A -->|Fizic| P5C{Unde?}
        P5C -->|RO| P5D[Fan Curier +25]
        P5C -->|Strainatate| P5E[DHL/Posta]
        P5F[Adresa Livrare]
        P5G[Vizualizare Contract]
        P5H[Semnatura Electronica *]
        P5I[Accept TandC *]
    end

    P5 --> P6

    subgraph P6["PAS 6: FACTURARE si PLATA"]
        P6A{Tip Factura}
        P6A -->|PF| P6B[Nume + CNP + Adresa]
        P6A -->|PJ| P6C[CUI + Auto-completare]
        P6D[Cupon Reducere]
        P6E[Rezumat Total]
        P6F[Plata Card Stripe]
    end

    P6 --> Success([Confirmare + Email])
```

#### B. Flow Certificate Stare Civilă (Standardizat)

```mermaid
flowchart TB
    Start([Client acceseaza serviciul]) --> P1

    subgraph P1["PAS 1: DATE CONTACT"]
        P1A[Email *] --> P1B[Telefon *]
    end

    P1 --> P2

    subgraph P2["PAS 2: DATE PERSONALE"]
        P2A[Nume Complet *]
        P2B[CNP *]
        P2C{Tip Certificat}
        P2C -->|Nastere| P2D{Minor/Adult?}
        P2D -->|Adult| P2E[Intrebari Stare Civila]
        P2D -->|Minor| P2F[Date Parinti]
        P2C -->|Casatorie| P2G[Data Casatorie + Nume Sot]
        P2C -->|Celibat| P2H[Oficiu Stare Civila]
        P2I[Nume Tata *]
        P2J[Nume Mama *]
        P2K[Loc Nastere *]
    end

    P2 --> P3

    subgraph P3["PAS 3: DESTINATIE si OPTIUNI"]
        P3A[Tara Utilizare *]
        P3B[Scop Obtinere *]
        P3C{Extras Multilingv?}
        P3C -->|Da| P3D[Nu necesita traducere!]
        P3C -->|Nu| P3E{Traducere?}
        P3E -->|Da| P3F[Selecteaza Limba - 20 optiuni]
        P3G{Apostila Haga?}
        P3H{Cross-sell?}
        P3H -->|Nastere| P3I[+ Multilingv? +399]
        P3H -->|Celibat| P3J[+ Cert. Nastere? +999]
    end

    P3 --> P4

    subgraph P4["PAS 4: VERIFICARE IDENTITATE"]
        P4A[Upload CI *]
        P4B[Selfie cu CI *]
        P4C{Minor?}
        P4C -->|Da| P4D[Upload CI Parinti *]
        P4E[Vechiul Certificat - optional]
    end

    P4 --> P5

    subgraph P5["PAS 5: LIVRARE si CONTRACT"]
        P5A{Tip Livrare}
        P5A -->|Electronic| P5B[Email]
        P5A -->|Fizic RO| P5C[Fan Curier +25]
        P5A -->|Fizic Strain| P5D[Posta +100 / DHL +200]
        P5E[Adresa Livrare]
        P5F[Semnatura Contract *]
        P5G[Accept TandC *]
    end

    P5 --> P6

    subgraph P6["PAS 6: FACTURARE si PLATA"]
        P6A[Tip: PF / PJ]
        P6B[Date Facturare]
        P6C[Rezumat Comanda]
        P6D[Cupon]
        P6E[Plata Stripe]
    end

    P6 --> Success([Confirmare + Contract pe Email])
```

---

## Partea 5: Journey Complet A-Z

### Customer Journey Map

```mermaid
journey
    title Journey Client - Cazier Judiciar
    section Descoperire
      Cauta pe Google: 5: Client
      Gaseste eGhiseul: 4: Client
      Citeste pagina serviciu: 3: Client
    section Completare Formular
      Introduce date contact: 5: Client
      Completeaza date personale: 4: Client
      Selecteaza optiuni: 4: Client
      Upload documente: 3: Client
      Semneaza contract: 4: Client
      Alege livrare: 5: Client
    section Plata
      Completeaza facturare: 4: Client
      Plateste cu cardul: 5: Client
      Primeste confirmare: 5: Client, System
    section Procesare
      Asteptare procesare: 2: Client
      Primeste notificari status: 4: System
    section Livrare
      Document finalizat: 5: System
      Primeste pe email: 5: Client
      Primeste fizic optional: 4: Curier
```

### Sequence Diagram - Flow Tehnic

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant B as Backend API
    participant S as Stripe
    participant O as Olbio Facturi
    participant E as Email Service
    participant A as Admin

    C->>F: Acceseaza formular
    F->>C: Afiseaza Pas 1

    loop Fiecare Pas
        C->>F: Completeaza date
        F->>F: Validare client-side
        F->>C: Afiseaza pas urmator
    end

    C->>F: Submit formular complet
    F->>B: POST /orders
    B->>B: Validare server-side
    B->>B: Generare Contract PDF
    B->>B: Generare Nr. Contract

    B->>S: Creare Payment Intent
    S->>C: 3D Secure daca necesar
    C->>S: Confirma plata
    S->>B: Webhook: payment_succeeded

    B->>O: Generare Factura
    O->>B: Factura PDF

    par Notificari Paralele
        B->>E: Email confirmare client
        E->>C: Email cu contract + factura
        B->>A: Notificare Slack/Dashboard
    end

    B->>F: Redirect pagina succes
    F->>C: Afiseaza confirmare + rezumat

    Note over A: Procesare manuala/automata

    A->>B: Update status: In procesare
    B->>E: Email notificare client

    A->>B: Update status: Finalizat
    B->>B: Ataseaza document final
    B->>E: Email cu document
    E->>C: Primeste documentul
```

### State Machine - Status Comanda

```mermaid
stateDiagram-v2
    [*] --> Draft: Formular inceput
    Draft --> Pending: Formular completat
    Pending --> PaymentFailed: Plata esuata
    PaymentFailed --> Pending: Reincearca
    Pending --> Paid: Plata reusita
    Paid --> Processing: Admin preia
    Processing --> DocumentReady: Document obtinut
    DocumentReady --> InTranslation: Necesita traducere
    InTranslation --> ReadyForApostille: Tradus
    DocumentReady --> ReadyForApostille: Nu necesita traducere
    ReadyForApostille --> Apostilled: Apostilat
    Apostilled --> ReadyForDelivery: Gata de expediere
    DocumentReady --> ReadyForDelivery: Fara traducere/apostila
    ReadyForDelivery --> Shipped: Expediat
    Shipped --> Delivered: Livrat
    ReadyForDelivery --> Completed: Doar electronic
    Delivered --> Completed: Confirmat
    Completed --> [*]

    Processing --> Rejected: Problema documente
    Rejected --> Processing: Client retrimite
    Rejected --> Refunded: Rambursare
    Refunded --> [*]
```

---

## Partea 6: Recomandări pentru Noua Platformă

### 1. Standardizare Flow-uri

```mermaid
flowchart LR
    subgraph Actual["ACTUAL: 4 flow-uri diferite"]
        A1[Caziere - 6-7 pasi]
        A2[Stare Civila - 7 pasi]
        A3[Business - 5-6 pasi]
        A4[Rovinieta - 3 pasi]
    end

    subgraph Propus["PROPUS: 2 flow-uri standard"]
        P1[Flow cu KYC - 6 pasi]
        P2[Flow fara KYC - 4 pasi]
    end

    A1 --> P1
    A2 --> P1
    A3 --> P2
    A4 --> P2
```

### 2. Componente Reutilizabile

| Componentă | Servicii care o folosesc |
|------------|-------------------------|
| `<ContactStep>` | Toate |
| `<KYCUploader>` | Caziere, Stare Civilă |
| `<SignatureCanvas>` | Caziere, Stare Civilă |
| `<TranslationSelector>` | Toate cu traduceri |
| `<DeliveryOptions>` | Toate |
| `<BillingForm>` | Toate |
| `<StripePayment>` | Toate |
| `<CrossSellBanner>` | Selectate |

### 3. Îmbunătățiri UX Propuse

#### A. Progress Indicator Unificat
```
┌─────────────────────────────────────────────────────────┐
│  ○ Contact  ●━━━○ Date  ○━━━○ Opțiuni  ○━━━○ KYC  ○━━━○ Plată │
│                  ↑                                      │
│             Ești aici                                   │
└─────────────────────────────────────────────────────────┘
```

#### B. Smart Cross-sell (contextual)
```
┌─────────────────────────────────────────────────────────┐
│  💡 Știai că 73% din clienții care comandă Cazier       │
│     Judiciar au nevoie și de Certificat Integritate?    │
│                                                         │
│     [+ Adaugă la comandă: doar 150 RON] [Nu, mulțumesc] │
└─────────────────────────────────────────────────────────┘
```

#### C. Salvare Automată Draft
```
┌─────────────────────────────────────────────────────────┐
│  ✓ Progresul tău a fost salvat automat                  │
│    Poți continua oricând de pe acest dispozitiv        │
│    sau [Trimite link pe email]                          │
└─────────────────────────────────────────────────────────┘
```

#### D. AI Pre-fill din CI
```
┌─────────────────────────────────────────────────────────┐
│  📷 Am detectat datele din documentul încărcat:         │
│                                                         │
│  Nume: POPESCU ION                    [✓ Corect]       │
│  CNP: 1850315123456                   [✓ Corect]       │
│  Adresă: Str. Victoriei 10, București [✎ Editează]    │
│                                                         │
│  [Confirmă și continuă]                                 │
└─────────────────────────────────────────────────────────┘
```

### 4. Arhitectură Tehnică Propusă

```mermaid
flowchart TB
    subgraph Frontend["FRONTEND (Next.js)"]
        FE1[Landing Pages]
        FE2[Form Wizard]
        FE3[Dashboard Client]
        FE4[Stripe Elements]
    end

    subgraph Backend["BACKEND (Node.js/NestJS)"]
        BE1[Orders API]
        BE2[Payments Service]
        BE3[Documents Service]
        BE4[Notifications Service]
        BE5[KYC/AI Service]
    end

    subgraph External["SERVICII EXTERNE"]
        EX1[Stripe]
        EX2[Olbio]
        EX3[SendGrid/Resend]
        EX4[AWS S3]
        EX5[OpenAI/Claude]
    end

    subgraph Admin["ADMIN DASHBOARD"]
        AD1[Comenzi]
        AD2[Clienti]
        AD3[Rapoarte]
        AD4[Contracte]
    end

    Frontend --> Backend
    Backend --> External
    Admin --> Backend
```

---

## Partea 7: Acțiuni Recomandate

### Prioritate 1: Quick Wins
- [ ] Standardizare ordine pași (Contact → Date → Opțiuni → KYC → Livrare → Plată)
- [ ] Unificare liste limbi traducere
- [ ] Adăugare cross-sell la Cazier Fiscal și Cazier Auto

### Prioritate 2: Îmbunătățiri Medium
- [ ] Componente reutilizabile pentru fiecare pas
- [ ] Salvare automată draft
- [ ] Progress indicator vizual consistent

### Prioritate 3: Features Avansate
- [ ] AI OCR pentru extragere date din CI
- [ ] Smart cross-sell bazat pe comportament
- [ ] Dashboard client pentru tracking comenzi

---

## Anexă: Mapping Câmpuri

### Câmpuri Comune (toate serviciile cu KYC)

| Câmp | Tip | Validare |
|------|-----|----------|
| email | string | Email valid |
| telefon | string | Format RO/internațional |
| nume_complet | string | Min 3 caractere |
| cnp | string | 13 cifre, validare algoritm |
| tip_factura | enum | PF / PJ |
| cui | string | Validare ANAF API |
| tip_livrare | enum | electronic / fizic |
| adresa_livrare | object | Dacă fizic |
| semnatura | base64 | Canvas signature |
| accept_tc | boolean | Obligatoriu true |

### Câmpuri Specifice per Serviciu

| Serviciu | Câmpuri Unice |
|----------|---------------|
| Cazier Judiciar | cetatenie, tara_nastere, viza_resedinta |
| Cazier Fiscal | - (cel mai simplu) |
| Cazier Auto | numar_permis, tip_permis |
| Cert. Naștere | loc_nastere, minor_adult, acte_parinti |
| Cert. Căsătorie | data_casatorie, nume_sot_inainte |
| Cert. Celibat | oficiu_stare_civila, casatorit_anterior |
| Cert. Integritate | - (similar Cazier) |

---

*Document generat: 15 Decembrie 2024*
*Versiune: 1.0*
