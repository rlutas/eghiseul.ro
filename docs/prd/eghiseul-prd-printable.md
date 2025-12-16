# eGhiseul.ro - PRD Summary
## Versiune pentru discutii echipa | Dec 2024

---

# PARTEA 1: CE CONSTRUIM?

## Viziune

**eGhiseul.ro** = Platforma digitala pentru documente guvernamentale romanesti

**De la:** WordPress + WPForms + Google Sheets (manual, problematic)
**La:** Next.js + Node.js (modern, scalabil, API-first)

---

## Servicii existente (12)

### Categoria A: Caziere (KYC obligatoriu)
| Serviciu | Pret baza | Urgenta | Comenzi |
|----------|-----------|---------|---------|
| Cazier Judiciar | 250 RON | +100 RON | 1.288 |
| Cazier Fiscal | 250 RON | +100 RON | 167 |
| Cazier Auto | 199-349 RON | Da | 809 |
| Certificat Integritate | 250 RON | +100 RON | 30 |

### Categoria B: Certificate Stare Civila (KYC + complex)
| Serviciu | Pret baza | Traduceri | Comenzi |
|----------|-----------|-----------|---------|
| Certificat Nastere | 1.190 RON | 20 limbi | 109 |
| Certificat Casatorie | 1.190 RON | 20 limbi | 604 |
| Certificat Celibat | 699 RON | 20 limbi | 67 |
| Multilingv Nastere | 799 RON | N/A | 82 |
| Multilingv Casatorie | 799 RON | N/A | 32 |

### Categoria C: Business (fara KYC)
| Serviciu | Pret baza | Comenzi |
|----------|-----------|---------|
| Extras Carte Funciara | 79-249 RON | 34 |
| Certificat Constatator | 119-499 RON | 5 |
| Rovinieta | variabil | - |

**TOTAL: ~3.200+ comenzi**

---

# PARTEA 2: PENTRU CINE?

## Personas principale

### Maria (Diaspora) - 60% clienti
- Romanca in Germania/UK/Italia
- Nevoie: documente pentru job/locuinta
- Pain: nu poate veni in RO
- Servicii: Cazier, Certificate, Apostila

### Andrei (Business) - 25% clienti
- HR Manager / Administrator firma
- Nevoie: caziere angajati, docs firma
- Pain: volum mare, timp
- Servicii: Cazier bulk, Cert. Constatator

### Ion (Romania) - 15% clienti
- Cetatean din oras mic/rural
- Nevoie: evita birocratie
- Pain: cozi, deplasari
- Servicii: Extras CF, Rovinieta

---

# PARTEA 3: CUM FUNCTIONEAZA?

## Flow standardizat - 6 PASI

```
[1] CONTACT          [2] DATE           [3] OPTIUNI
 Email*               CNP*               Urgenta?
 Telefon*             Mama/Tata          Traducere?
 Nume*                Motiv              Apostila?
                      Tara dest.         Cross-sell?
      |                    |                  |
      v                    v                  v
[4] KYC              [5] LIVRARE        [6] PLATA
 Upload CI*           Electronic         Rezumat
 Selfie*              sau Fizic          PF/PJ
 Semnatura*           Adresa             Cupon
                      Contract           Card
                      T&C*
```

**Timp completare target: <10 minute**

---

## Flow vizual detaliat

```
                    CLIENT ACCESEAZA SERVICIUL
                              |
                              v
            +----------------------------------+
            |     PAS 1: DATE CONTACT          |
            |  Email* -> Telefon* -> Nume*     |
            +----------------------------------+
                              |
                              v
            +----------------------------------+
            |     PAS 2: DATE PERSONALE        |
            |  CNP, Parinti, Motiv, Tara       |
            |  [Cetatean RO?]                  |
            |   Da -> CI    Nu -> Pasaport     |
            +----------------------------------+
                              |
                              v
            +----------------------------------+
            |     PAS 3: OPTIUNI               |
            |  [Urgenta?] +100 RON / 1-2 zile  |
            |  [Traducere?] Selecteaza limba   |
            |  [Apostila?] +238 RON            |
            |  [Cross-sell?] + alt serviciu   |
            +----------------------------------+
                              |
                              v
            +----------------------------------+
            |     PAS 4: KYC                   |
            |  Upload CI/Pasaport*             |
            |  Selfie cu document*             |
            |  [Cazier Auto?] + Permis         |
            |  [Minor?] + Acte parinti         |
            +----------------------------------+
                              |
                              v
            +----------------------------------+
            |     PAS 5: LIVRARE + CONTRACT    |
            |  Electronic / Fizic              |
            |  RO +25 / Posta +100 / DHL +200  |
            |  Vizualizare contract            |
            |  Semnatura electronica*          |
            |  Accept T&C*                     |
            +----------------------------------+
                              |
                              v
            +----------------------------------+
            |     PAS 6: PLATA                 |
            |  Rezumat comanda                 |
            |  Facturare PF / PJ               |
            |  [Cupon?] Aplica                 |
            |  Plata card Stripe               |
            +----------------------------------+
                              |
                              v
                    CONFIRMARE + EMAIL
                    (Contract + Factura)
```

---

## Cross-sell Map

```
+------------------+          +-------------------+
| CAZIER JUDICIAR  |<-------->| CERT. INTEGRITATE |
|     250 RON      |  +150    |      250 RON      |
+------------------+          +-------------------+

+------------------+          +-------------------+
| CERT. NASTERE    |--------->| MULTILINGV NAST.  |
|    1.190 RON     |   +399   |      799 RON      |
+------------------+          +-------------------+
        ^
        | +999
+------------------+
| CERT. CELIBAT    |
|     699 RON      |
+------------------+

+------------------+          +-------------------+
| CERT. CASATORIE  |--------->| MULTILINGV CAS.   |
|    1.190 RON     |   +399   |      799 RON      |
+------------------+          +-------------------+

! LIPSA cross-sell pentru: Cazier Fiscal, Cazier Auto
  -> Oportunitate de imbunatatire!
```

---

# PARTEA 4: CE CONSTRUIM NOU?

## Features P0 (MVP - Must Have)

### 1. Admin Dashboard
- Lista comenzi cu filtre
- Detalii comanda + documente
- Schimbare status -> notificare client
- Upload document final
- Creare comanda manuala

### 2. Sistem Contracte (LEGAL OBLIGATORIU)
- Generare automata contract
- Numerotare automata
- Template-uri editabile
- Stocare 10 ani
- Export PDF

### 3. KYC Complet
- Upload CI + Selfie
- Semnatura electronica (canvas)
- Validare fisiere
- Stocare securizata

### 4. Notificari
- Email confirmare comanda
- Email schimbare status
- Email document final
- Alerte admin

---

## Features P1 (Faza 2)

### 5. Conturi Utilizatori
- Inregistrare/login
- Istoric comenzi
- Date salvate
- KYC reutilizabil

### 6. Status Public
- Verificare cu Nr. comanda + Email
- Fara login necesar

### 7. API Parteneri
- REST API complet
- API keys
- Webhooks
- Documentatie OpenAPI

### 8. Cos Cumparaturi
- Multi-serviciu
- Salvare cos
- Discount comenzi multiple

---

## Features P2 (Faza 3)

### 9. AI Features
- OCR documente
- Face matching
- Pre-completare automata

### 10. Loyalty
- Puncte
- Referral
- Discounturi clienti fideli

---

# PARTEA 5: TECH STACK

## Arhitectura

```
+-------------------+     +-------------------+
|    FRONTEND       |     |    ADMIN          |
|    Next.js        |     |    Next.js        |
|  Landing Pages    |     |    Dashboard      |
|  Form Wizard      |     |    Rapoarte       |
+--------+----------+     +--------+----------+
         |                         |
         v                         v
+------------------------------------------+
|              BACKEND API                 |
|           Node.js / NestJS               |
|  Orders | Payments | Docs | Notif | KYC  |
+------------------------------------------+
         |
         v
+------------------------------------------+
|           SERVICII EXTERNE               |
|  Stripe | Olbio | S3 | SendGrid | CUI    |
+------------------------------------------+
```

## Integrari

| Sistem | Scop | Prioritate |
|--------|------|------------|
| Stripe | Plati card | P0 |
| Olbio | Facturi | P0 |
| AWS S3 | Documente | P0 |
| SendGrid | Email | P0 |
| infocui.ro | Validare CUI | P0 |
| Fan Curier | Livrare RO | P1 |
| DHL | Livrare int. | P1 |

---

# PARTEA 6: TIMELINE

## Faza 1: MVP (8-10 sapt)
- Auth + Roles
- Engine servicii (flow 6 pasi)
- 3 servicii live (Cazier, Cert. Nastere, Extras CF)
- KYC + Semnatura
- Plati Stripe
- Contracte PDF
- Admin dashboard basic
- Email notifications

## Faza 2: Full Services (4-6 sapt)
- Toate 12 serviciile
- Cross-sell
- Traduceri complete
- Apostila
- Conturi utilizatori
- Status public

## Faza 3: Growth (4-6 sapt)
- API parteneri
- Cos cumparaturi
- Loyalty
- Rapoarte avansate
- SMS

---

# PARTEA 7: METRICI SUCCES

## Target vs Current

| Metric | Acum | Target |
|--------|------|--------|
| Timp completare formular | 15+ min | <10 min |
| Abandon rate | ~40% | <25% |
| Clienti care revin | ~15% | >30% |
| Cross-sell adoption | ~5% | 20% |
| Comenzi/luna | ~250 | 500+ |
| Revenue din API | 0% | 15% |

---

# PARTEA 8: ECHIPA NECESARA

| Rol | Nr. | Alocare |
|-----|-----|---------|
| Full-stack dev | 2 | 100% |
| Frontend dev | 1 | 100% |
| Designer UI/UX | 1 | 50% |
| Product Manager | 1 | 50% |
| QA | 1 | 50% |

---

# INTREBARI PENTRU DISCUTIE

1. **Prioritizare servicii MVP** - Care 3 servicii lansam primul?
   - Propunere: Cazier Judiciar, Certificat Nastere, Extras CF

2. **Cross-sell** - Adaugam pentru Cazier Fiscal/Auto?

3. **Conturi utilizatori** - P0 sau P1?

4. **API** - Cat de urgent pentru parteneri?

5. **Mobile** - PWA sau app nativa mai tarziu?

6. **Loyalty** - Implementam din start sau dupa?

---

# ANEXA: PRETURI TRADUCERI

## Tier 1 - Standard (178.50 RON)
Engleza, Franceza, Germana, Italiana, Maghiara

## Tier 2 - Mediu (238 RON)
Portugheza, Spaniola, Olandeza, Ucraineana

## Tier 3 - Avansat (297.50 RON)
Rusa, Bulgara, Croata, Ceha, Slovaca

## Tier 4 - Premium (357 RON)
Suedeza, Greaca, Poloneza

## Tier 5 - Specialty (416.50 RON)
Finlandeza, Daneza, Latina

---

# ANEXA: STATUS COMANDA

```
[*] --> DRAFT (formular inceput)
    --> PENDING (formular completat)
    --> PAID (plata reusita)
    --> PROCESSING (admin preia)
    --> DOCUMENT_READY
        --> IN_TRANSLATION (daca e cazul)
        --> READY_FOR_APOSTILLE (daca e cazul)
    --> SHIPPED (expediat fizic)
    --> DELIVERED (livrat)
    --> COMPLETED

Exceptii:
    PENDING --> PAYMENT_FAILED --> PENDING (retry)
    PROCESSING --> REJECTED --> PROCESSING (client corecteaza)
    * --> REFUNDED (rambursare)
```

---

*Document generat: 15 Decembrie 2024*
*Pentru diagrame vizuale, vezi: `/docs/analysis/diagrams/`*
