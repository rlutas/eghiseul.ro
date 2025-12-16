# Extras de Carte Funciară Online

## Overview

| Atribut | Valoare |
|---------|---------|
| **ID Serviciu** | SRV-031 |
| **Form ID WordPress** | 7888 |
| **Categorie** | Business & Imobiliare |
| **Status** | Activ |
| **Comenzi totale** | 34,816 |
| **API Disponibil** | Planificat |

## Descriere

Serviciu de obținere extras de carte funciară online pentru imobile din România. Clientul selectează județul, localitatea și furnizează numărul de carte funciară. Documentul este livrat electronic.

## Tipuri Servicii & Prețuri

| Serviciu | Preț | Timp livrare |
|----------|------|--------------|
| Extras de Carte Funciară | 79,99 RON | Standard |
| Extras de Plan Cadastral Ortofotoplan | 79,99 RON | Standard |
| Extras de Carte Funciară Colectivă | 169,99 RON | Standard |
| Identificare imobil după proprietar | 249,99 RON | Până la 5 zile |
| Identificare imobil după adresă | 249,99 RON | Până la 5 zile |

### Add-ons

| Add-on | Preț | Descriere |
|--------|------|-----------|
| Serviciu Urgență | +19,99 RON | Livrare în 30 minute |
| Urgență Colectiv | +29,99 RON | Livrare în 2 zile lucrătoare |
| Adaugă un Extras | +49,99 RON | Al doilea extras în aceeași comandă |

## User Flow (Multi-Step Form)

### Step 1: Date Contact
```
┌─────────────────────────────────────────┐
│  Extras de Carte Funciară Online        │
│  ══════════════════════════════════════ │
│                                         │
│  Email: [________________] *            │
│  Telefon: [________________] *          │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 2: Selectare Serviciu & Date Imobil
```
┌─────────────────────────────────────────┐
│  Alege Serviciul *                      │
│  ○ Extras de Carte Funciară (79,99 RON) │
│  ○ Extras Plan Cadastral (79,99 RON)    │
│  ○ Extras CF Colectivă (169,99 RON)     │
│  ○ Identificare după proprietar (249,99)│
│  ○ Identificare după adresă (249,99)    │
│                                         │
│  Județul Imobilului: [▼ Alege județ] *  │
│  Localitatea/UAT: [▼ Alege localit.] *  │
│                                         │
│  Nr. Carte Funciară: [____________] *   │
│  Nr. Cadastral: [____________] *        │
│  Nr. Topografic: [____________]         │
│  Motivul Solicitării: [____________]    │
│                                         │
│  □ Adaugă un Extras (+49,99 RON)        │
│    [Date pentru al doilea extras...]    │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

**Câmpuri condiționale pentru "Identificare imobil":**
- Adresa Imobilului (required)
- Numele Proprietarului (required)
- CNP / CUI (required)

### Step 3: Date Facturare
```
┌─────────────────────────────────────────┐
│  Factură pe: *                          │
│  ○ Persoană fizică                      │
│  ○ Persoană juridică                    │
│                                         │
│  [Dacă PF:]                             │
│  Nume / Prenume: [____________] *       │
│                                         │
│  [Dacă PJ:]                             │
│  CUI: [____________] * [Verifică]       │
│  Nume Firmă: [____________] *           │
│                                         │
│  Adresă Facturare: *                    │
│  [Strada, Nr, Bloc, Ap]                 │
│  [Oraș] [Județ] [Cod poștal]            │
│                                         │
│                        [Următorul →]    │
└─────────────────────────────────────────┘
```

### Step 4: Plată
```
┌─────────────────────────────────────────┐
│  Rezumat Comandă                        │
│  ─────────────────────────────────────  │
│  Extras de Carte Funciară    79,99 RON  │
│  Serviciu Urgență           +19,99 RON  │
│  ─────────────────────────────────────  │
│  TOTAL:                     99,98 RON   │
│                                         │
│  Cupon Reducere: [________] [Aplică]    │
│                                         │
│  □ Doresc Certificatul și pe WhatsApp   │
│                                         │
│  □ Doresc Serviciul de Urgență          │
│    Livrare în 30 minute (+19,99 RON)    │
│                                         │
│  Detalii de Plată *                     │
│  [Card Number] [MM/YY] [CVC]            │
│                                         │
│  ☑ Am acceptat termenii și condițiile * │
│                                         │
│              [Plătește 99,98 RON →]     │
└─────────────────────────────────────────┘
```

## Date Colectate (Input)

### Date Contact
| Câmp | Tip | Obligatoriu | Validare |
|------|-----|-------------|----------|
| email | string | Da | Format email |
| telefon | string | Da | Format RO |

### Date Imobil
| Câmp | Tip | Obligatoriu | Validare |
|------|-----|-------------|----------|
| tip_serviciu | enum | Da | Din lista |
| judet | enum | Da | 42 județe RO |
| localitate_uat | enum | Da | Condițional pe județ |
| nr_carte_funciara | string | Da | - |
| nr_cadastral | string | Da | - |
| nr_topografic | string | Nu | - |
| motiv_solicitare | string | Nu | - |

### Date Identificare (doar pentru servicii identificare)
| Câmp | Tip | Obligatoriu | Validare |
|------|-----|-------------|----------|
| adresa_imobil | string | Condițional | - |
| nume_proprietar | string | Condițional | - |
| cnp_cui | string | Condițional | CNP sau CUI |

### Date Facturare
| Câmp | Tip | Obligatoriu | Validare |
|------|-----|-------------|----------|
| tip_client | enum | Da | PF / PJ |
| nume_prenume | string | Da (PF) | - |
| cui | string | Da (PJ) | Validare infocui.ro |
| nume_firma | string | Da (PJ) | Auto-completat |
| adresa_facturare | object | Da | Adresă completă |

### Opțiuni
| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| urgenta | boolean | Nu |
| whatsapp_delivery | boolean | Nu |
| extras_suplimentar | boolean | Nu |
| cupon | string | Nu |
| accept_termeni | boolean | Da |

## Rezultat (Output)

| Câmp | Descriere |
|------|-----------|
| nr_comanda | Număr unic comandă |
| status | pending / processing / completed / delivered |
| document_pdf | Link descărcare extras CF |
| factura_pdf | Link descărcare factură |

## Business Rules

1. **Localități condiționale**: Lista de localități se încarcă bazat pe județul selectat
2. **Identificare imobil**: Serviciile de identificare pot dura până la 5 zile lucrătoare
3. **CUI auto-completare**: La introducere CUI se preiau automat datele firmei (infocui.ro)
4. **Urgență**: Disponibilă doar pentru extras standard (nu pentru identificare)
5. **WhatsApp delivery**: Opțional, documentul se trimite și pe WhatsApp
6. **Extras suplimentar**: Permite comandarea a 2 extrase în aceeași comandă

## Documente Generate

| Document | Când | Stocare |
|----------|------|---------|
| Contract prestări servicii | La plasare comandă | 10 ani |
| Împuternicire | La plasare comandă | 10 ani |
| Extras Carte Funciară | La finalizare | Trimis client |
| Factură | După plată (Olbio) | Conform legii |

## Integrări

| Sistem | Scop |
|--------|------|
| Stripe | Procesare plată |
| Olbio | Emitere factură |
| infocui.ro | Validare CUI |
| ANCPI / e-Terra | Obținere extras CF |
| WhatsApp API | Livrare opțională |
| Email | Confirmare + livrare |

## Notificări

| Eveniment | Canal | Mesaj |
|-----------|-------|-------|
| Comandă plasată | Email | Confirmare comandă + nr. comandă |
| Plată confirmată | Email + SMS | Plata a fost procesată |
| Document disponibil | Email + WhatsApp (opțional) | Link descărcare |

## Note Dezvoltare

- Formular multi-step (4 pași)
- Logică condițională complexă pentru localități (42 selecturi condiționale)
- Simplificare necesară: API pentru localități în loc de selecturi statice
- KYC: NU necesită KYC pentru acest serviciu
- Noul sistem: Trebuie să poată adăuga multiple extrase în coș

## Istoric Modificări

| Data | Versiune | Modificare |
|------|----------|------------|
| 2024-12-15 | 1.0 | Documentat din WPForms JSON |
