# Services Page Design System

## Overview

Documentație pentru designul paginilor de servicii pe eGhiseul.ro. Folosim Cazier Fiscal ca template principal.

## Culori Brand

```css
/* Primary - Gold */
--primary-500: #ECB95F;
--primary-600: #D4A54A;

/* Secondary - Navy */
--secondary-900: #06101F;
--secondary-800: #0C1A2F;

/* Neutral */
--neutral-50: #FAFAFA;
--neutral-100: #F5F5F5;
--neutral-200: #E5E5E5;
--neutral-500: #737373;
--neutral-600: #525252;
```

## Structura Paginii

### 1. Hero Section

**Background:** Navy gradient (`from-secondary-900 to-[#0C1A2F]`)

**Layout:**
- Desktop: `flex-row` - content stânga, price card dreapta
- Mobile: `flex-col-reverse` - price card sus, content jos

**Componente:**
- Breadcrumb (Acasă > Servicii > Nume Serviciu)
- Icon serviciu în container gold transparent
- Badge-uri (Urgent Disponibil, Categorie)
- H1 SEO-optimizat
- Descriere serviciu
- SEO Content Box cu checklist
- Google Reviews badge

### 2. Price Card (Hero Right)

**Design:**
```
┌─────────────────────────────────────┐
│  ████████ HEADER NAVY █████████████ │
│  ┌─────────────────────────────────┐│
│  │     PREȚ COMPLET (gold badge)   ││
│  │         250 RON (white)         ││
│  │     Fără taxe ascunse           ││
│  └─────────────────────────────────┘│
│                                     │
│  [Clock green] Livrare în 5 zile    │
│  [Zap gold] Urgent: 1-2 zile +99RON │
│  [Mail blue] Livrare pe Email       │
│                                     │
│  [═══ COMANDĂ ACUM (gold) ═══]      │
│                                     │
│  🔒 Securizat  ✓ Garanție           │
└─────────────────────────────────────┘
```

**Clase Tailwind:**
- Container: `bg-white rounded-3xl shadow-2xl`
- Header: `bg-gradient-to-br from-secondary-900 via-secondary-800 to-[#0C1A2F]`
- Preț: `text-5xl lg:text-6xl font-black text-white`
- CTA: `bg-primary-500 hover:bg-primary-600 text-secondary-900`

### 3. Service Options Section

**Layout:** `grid grid-cols-2 lg:grid-cols-4`
**Card Design:** Border hover gold, padding compact

### 4. Use Cases Section (Când Ai Nevoie)

**Layout:** `grid md:grid-cols-2 lg:grid-cols-3`
**6 categorii per serviciu**

**Card Design:**
```
┌─────────────────────────────────────┐
│ [1] Titlu Categorie                 │
│ ✓ Item 1                            │
│ ✓ Item 2                            │
│ ✓ Item 3                            │
└─────────────────────────────────────┘
```

### 5. How It Works Section

**Layout:** `grid md:grid-cols-2 lg:grid-cols-4`
**4 pași cu săgeți între ele**

**Card Design:**
- Număr în cercul gold
- Icon
- Titlu bold
- Descriere text

### 6. Required Documents Section

**Layout:** 2 coloane
**Cards cu icon verde CheckCircle**

### 7. FAQ Section (Accordion)

**Component:** `ServiceFAQ` (client component)
**Style:** Expandable/collapsible cu ChevronDown
**Active state:** `border-primary-300 shadow-lg`

### 8. CTA Section

**Background:** Navy gradient (same as homepage)
**Buttons:** Gold primary, Gold outline secondary
**Trust indicators:** Clock, Shield, CheckCircle
**Contact cards:** Phone + Email
**Google Rating:** 5 stars, 4.9/5

## Servicii Implementate

### Cazier Fiscal (SRV-001)
- **Preț:** 250 RON
- **Urgență:** +99 RON (1-2 zile)
- **Use Cases:** 6 categorii (Angajare, Companie, Licitații, Financiar, Autorizații, Altele)
- **FAQ:** 12 întrebări specifice

### Extras Carte Funciară (SRV-031)
- **Preț:** 79.99 RON
- **Urgență:** +19.99 RON (30 min)
- **Use Cases:** 6 categorii (Tranzacții, Credite, Verificare, Notariat, Construcții, Altele)
- **FAQ:** 8 întrebări specifice

### Certificat Constatator (SRV-030)
- **Preț:** 119.99 RON
- **Urgență:** +22.99 RON (30 min)
- **Use Cases:** 6 categorii (Licitații, Fonduri, Parteneriate, Bănci, Autorități, Altele)
- **FAQ:** 8 întrebări specifice

## Components

### ServiceFAQ Component
```tsx
// Location: src/components/services/service-faq.tsx
interface ServiceFAQProps {
  faqs: { q: string; a: string }[];
  title?: string;
}
```

## Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## Spacing System

- Section padding: `py-12 lg:py-20`
- Container max-width: `max-w-[1400px]` sau `max-w-[1280px]`
- Gap between elements: `gap-4` to `gap-8`

## Typography

- H1: `text-3xl sm:text-4xl lg:text-5xl font-extrabold`
- H2: `text-2xl sm:text-3xl font-bold`
- H3: `text-base font-bold`
- Body: `text-sm` to `text-base`
- Small: `text-xs`

## Shadows

- Price card: `shadow-2xl`
- Cards: `shadow-sm` → `hover:shadow-md` / `hover:shadow-lg`
- CTA buttons: `shadow-[0_4px_14px_rgba(236,185,95,0.4)]`

## Animations

- Hover transitions: `transition-all`
- Card hover: `hover:-translate-y-0.5`
- FAQ accordion: `transition-all duration-300`
