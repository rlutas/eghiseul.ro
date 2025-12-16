# Rovinieta Online

## Overview

| Atribut | Valoare |
|---------|---------|
| **ID Serviciu** | SRV-EXT-001 |
| **Platformă** | erovinieta.net (externă) |
| **Categorie** | Taxe & Viniete |
| **Status** | Activ (Referral) |
| **Tip Integrare** | Landing Page + Redirect |
| **KYC Necesar** | NU |

## Descriere

Serviciu de achiziție rovinietă online pentru circulația pe drumurile naționale și autostrăzile din România. **Notă importantă**: Acest serviciu funcționează ca landing page pe eGhiseul care redirectează către platforma externă **erovinieta.net** pentru procesarea efectivă.

## Model Business

| Aspect | Detalii |
|--------|---------|
| **Tip** | Affiliate / Referral |
| **Procesare** | erovinieta.net |
| **Tracking** | UTM Parameters |
| **Revenue** | Comision referral |

## Categorii Vehicule (7)

| Categorie | Descriere | Exemple |
|-----------|-----------|---------|
| **A** | Autoturisme sub 3.5t | Mașini personale |
| **B** | Vehicule 3.5t - 7.5t | Utilitare mici |
| **C** | Vehicule 7.5t - 12t | Camioane medii |
| **D** | Vehicule peste 12t (2-3 axe) | Camioane mari |
| **E** | Vehicule peste 12t (4+ axe) | TIR-uri |
| **F** | Motociclete | Toate tipurile |
| **G** | Tractoare agricole | Agricole/forestiere |

## Perioade Disponibile (6)

| Perioada | Cod | Note |
|----------|-----|------|
| 12 Luni | TWELVE_MONTHS | Cea mai populară |
| 6 Luni | SIX_MONTHS | Economic |
| 90 Zile | NINETY_DAYS | Trimestrial |
| 30 Zile | THIRTY_DAYS | Lunar |
| 7 Zile | SEVEN_DAYS | Vacanțe scurte |
| 1 Zi | ONE_DAY | Deplasări ocazionale |

## Prețuri Orientative 2025 (Categoria A)

| Perioada | Preț RON | Preț EUR |
|----------|----------|----------|
| 1 Zi | ~17,82 | ~3,56 |
| 10 Zile | ~30,54 | ~6,11 |
| 30 Zile | ~48,36 | ~9,67 |
| 60 Zile | ~76,35 | ~15,27 |
| 12 Luni | ~254,51 | ~50,90 |

**Notă**: Prețurile sunt gestionate de erovinieta.net și pot varia.

## User Flow (Simplu - 3 pași)

### Landing Page eGhiseul
```
┌─────────────────────────────────────────┐
│  Rovinieta Online 2025                  │
│  Cumpără și Verifică în 2 Minute        │
│  ══════════════════════════════════════ │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  CUMPĂRĂ ROVINIETA              │    │
│  │                                 │    │
│  │  Categorie Vehicul: *           │    │
│  │  [▼ A - Autoturisme sub 3.5t]   │    │
│  │                                 │    │
│  │  Perioada de Valabilitate: *    │    │
│  │  [▼ 12 Luni - Cea mai populară] │    │
│  │                                 │    │
│  │  Număr de Înmatriculare: *      │    │
│  │  [B 123 ABC_______________]     │    │
│  │                                 │    │
│  │  [Continuă către Plată →]       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🔒 Securizat  ✓ Oficial  ⚡ Instant    │
└─────────────────────────────────────────┘
```

### Redirect către erovinieta.net
```
URL: https://erovinieta.net/checkout
     ?category=A
     &period=TWELVE_MONTHS
     &plate=B123ABC
     &utm_source=eghiseul
     &utm_medium=referral
     &utm_campaign=rovinieta-landing
     &utm_content=hero-form
```

### Procesare pe erovinieta.net
- Plată cu card (Visa/Mastercard)
- Activare instant după plată
- Confirmare pe email
- Verificare disponibilă imediat

## Date Colectate (pe eGhiseul)

| Câmp | Tip | Obligatoriu |
|------|-----|-------------|
| categoria | enum (A-G) | Da |
| perioada | enum (6 opțiuni) | Da |
| nr_inmatriculare | string | Da |

**Format număr înmatriculare**: Auto-uppercase, minim 4 caractere

## Beneficii Promovate

| Beneficiu | Descriere |
|-----------|-----------|
| **Valabilă Instant** | Activă imediat după plată |
| **Plată Securizată** | 3D Secure, certificate bancare |
| **Orice Dispozitiv** | Telefon, tabletă, PC |
| **Confirmare Email** | Document oficial pentru verificare |

## Amenzi (informativ)

| Categorie | Amendă |
|-----------|--------|
| A (autoturisme) | 250 - 500 RON |
| B-E (camioane) | 750 - 1.500 RON |

## Integrări

| Sistem | Scop |
|--------|------|
| erovinieta.net | Platformă procesare |
| UTM Tracking | Monitorizare conversii |
| Google Analytics | Tracking trafic |

## Diferențe față de alte servicii eGhiseul

| Aspect | Rovinieta | Alte Servicii |
|--------|-----------|---------------|
| Platformă | Externă (erovinieta.net) | Internă (WPForms) |
| Procesare plată | erovinieta.net | Stripe direct |
| KYC | NU | DA (majoritatea) |
| Contract | NU | DA |
| Documente upload | NU | DA |
| Model business | Referral/Affiliate | Direct |
| Timp completare | 2 minute | 5-15 minute |

## SEO Keywords (din landing page)

- rovinieta online (principal)
- cumpara rovinieta online
- plata rovinieta online
- verificare rovinieta online
- pret rovinieta 2025

## Business Rules

1. **Redirect extern**: Toate plățile se procesează pe erovinieta.net
2. **Tracking obligatoriu**: UTM parameters pentru atribuire
3. **Fără KYC**: Doar numărul de înmatriculare necesar
4. **Instant**: Valabilitate imediată după plată
5. **Verificare gratuită**: Link către verificare rovinieta

## Link-uri Externe

| Pagină | URL |
|--------|-----|
| Checkout | https://erovinieta.net/checkout |
| Verificare | https://erovinieta.net/verificare-rovinieta |
| Prețuri | https://erovinieta.net/preturi |

## Note Dezvoltare (pentru rebuild)

### Opțiuni pentru noua platformă:

1. **Păstrare model actual** (Referral)
   - Menține landing page
   - Redirectează către erovinieta.net
   - Revenue din comision referral

2. **Integrare API CNAIR** (Full Service)
   - Integrare directă cu sistemul CNAIR
   - Procesare plăți intern
   - Full control și margin mai mare
   - Necesită aprobare/acreditare CNAIR

3. **White-label erovinieta**
   - Integrare API erovinieta
   - Procesare pe eGhiseul
   - Branding propriu

### Recomandare:
Investigare API CNAIR sau parteneriat white-label pentru control mai mare și marje mai bune.

## Istoric Modificări

| Data | Versiune | Modificare |
|------|----------|------------|
| 2024-12-15 | 1.0 | Documentat din landing page HTML |
