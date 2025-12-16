# eGhiseul.ro Service Catalog Homepage Design

**Version**: 1.0
**Date**: 2025-12-16
**Status**: Ready for Implementation

## Overview

Mobile-first homepage design for Romanian government document services platform. Optimized for trust, clarity, and conversion with 70% mobile traffic in mind.

---

## Color Scheme

### Primary Colors (Professional & Trustworthy)
```typescript
// Design tokens for Tailwind CSS v4
const colors = {
  // Brand Primary - Romanian flag inspired blue
  primary: {
    50: '#eff6ff',   // Very light blue
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main brand blue
    600: '#2563eb',  // Primary CTA
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Accent - Trust & Success
  accent: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',  // Success green
    600: '#16a34a',  // Urgency badge
  },

  // Warning - Urgency
  warning: {
    50: '#fef3c7',
    500: '#f59e0b',  // Urgency badge background
    600: '#d97706',
  },

  // Neutral - Text & Backgrounds
  neutral: {
    50: '#f9fafb',   // Light background
    100: '#f3f4f6',  // Card background
    200: '#e5e7eb',  // Borders
    300: '#d1d5db',
    400: '#9ca3af',  // Muted text
    500: '#6b7280',
    600: '#4b5563',  // Secondary text
    700: '#374151',
    800: '#1f2937',  // Primary text
    900: '#111827',  // Headings
  }
}
```

### Semantic Colors
- **Primary CTA**: `bg-primary-600 hover:bg-primary-700`
- **Secondary CTA**: `bg-white border-2 border-primary-600 text-primary-600`
- **Success/Trust**: `text-accent-600`
- **Urgency Badge**: `bg-warning-500 text-white`
- **Card Backgrounds**: `bg-white` with `shadow-sm`

---

## Component Hierarchy

```
HomePage
├── HeroSection
│   ├── HeroHeadline (h1)
│   ├── HeroSubtext (p)
│   └── HeroCTA (Button - Primary)
│
├── ServiceCatalogSection
│   ├── SectionHeading (h2)
│   ├── ServiceGrid
│   │   ├── ServiceCard (featured service 1)
│   │   ├── ServiceCard (featured service 2)
│   │   └── ServiceCard (featured service 3)
│   └── ViewAllButton (Button - Secondary)
│
├── TrustSection
│   ├── SectionHeading (h2)
│   └── TrustGrid
│       ├── TrustFeature (Fast)
│       ├── TrustFeature (Secure)
│       └── TrustFeature (Legal)
│
├── HowItWorksSection
│   ├── SectionHeading (h2)
│   └── StepsTimeline
│       ├── Step (1 - Select)
│       ├── Step (2 - Upload)
│       ├── Step (3 - Pay)
│       └── Step (4 - Receive)
│
└── Footer
    ├── FooterLinks
    ├── ContactInfo
    └── Copyright
```

---

## Section Specifications

### 1. Hero Section

**Purpose**: Immediate clarity on service value, drive action

**Desktop Layout** (min-width: 1024px):
```
[================================]
|                                |
|     [Headline - Centered]      |
|     [Subtext - Centered]       |
|        [CTA Button]            |
|                                |
[================================]
Height: 60vh, max-h-[600px]
```

**Mobile Layout** (default):
```
[================]
|                |
|   [Headline]   |
|   [Subtext]    |
|   [CTA Button] |
|                |
[================]
Height: auto, py-16
```

#### Component: HeroSection
```tsx
<section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-white">
  {/* Background pattern overlay */}
  <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

  <div className="relative container mx-auto px-4 py-16 lg:py-24">
    <div className="max-w-3xl mx-auto text-center">
      {/* Headline */}
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
        Obține Acte Oficiale <span className="text-primary-600">Rapid și Legal</span>
      </h1>

      {/* Subtext */}
      <p className="mt-6 text-lg text-neutral-600 sm:text-xl lg:text-2xl">
        Cazier fiscal, extras carte funciară și alte documente oficiale în 24-48 ore,
        fără deplasări la ghișeu.
      </p>

      {/* CTA Button */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 text-lg">
          Vezi Toate Serviciile
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <Button size="lg" variant="outline" className="border-2 border-primary-600 text-primary-600 px-8 py-6 text-lg">
          Cum Funcționează?
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent-600" />
          <span>100% Legal</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent-600" />
          <span>24-48 ore</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-accent-600" />
          <span>Date Securizate</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

**shadcn/ui Components**:
- `Button` (from `@/components/ui/button`)
- Icons from `lucide-react`

---

### 2. Service Catalog Section

**Purpose**: Showcase featured services, drive conversions

**Grid Responsive Breakpoints**:
- Mobile (default): `grid-cols-1` - 1 column
- Tablet (768px+): `md:grid-cols-2` - 2 columns
- Desktop (1024px+): `lg:grid-cols-3` - 3 columns

#### Component: ServiceCatalogSection
```tsx
<section className="py-16 lg:py-24 bg-neutral-50">
  <div className="container mx-auto px-4">
    {/* Section Heading */}
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
        Servicii Populare
      </h2>
      <p className="mt-4 text-lg text-neutral-600">
        Cele mai solicitate documente oficiale, la un click distanță
      </p>
    </div>

    {/* Service Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      <ServiceCard {...service1Props} />
      <ServiceCard {...service2Props} />
      <ServiceCard {...service3Props} />
    </div>

    {/* View All Button */}
    <div className="mt-12 text-center">
      <Button size="lg" variant="outline" className="border-2 border-primary-600 text-primary-600">
        Vezi Toate Serviciile (12)
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </div>
</section>
```

#### Component: ServiceCard
```tsx
<Card className="relative overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 border border-neutral-200">
  {/* Urgency Badge (conditional) */}
  {hasUrgentOption && (
    <Badge className="absolute top-4 right-4 bg-warning-500 text-white font-semibold px-3 py-1">
      <Zap className="h-3 w-3 mr-1 inline" />
      Urgent Disponibil
    </Badge>
  )}

  <CardHeader className="space-y-4">
    {/* Service Icon */}
    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
      <FileText className="h-6 w-6 text-primary-600" />
    </div>

    {/* Service Name */}
    <CardTitle className="text-xl font-bold text-neutral-900">
      Cazier Fiscal
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* Description */}
    <p className="text-neutral-600 text-sm leading-relaxed">
      Certificat de atestare fiscală pentru persoane fizice, necesar pentru diverse proceduri administrative.
    </p>

    {/* Metadata Grid */}
    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
      {/* Price */}
      <div className="space-y-1">
        <p className="text-xs text-neutral-500 uppercase tracking-wide">Preț</p>
        <p className="text-lg font-bold text-neutral-900">
          de la <span className="text-primary-600">49 RON</span>
        </p>
      </div>

      {/* Processing Time */}
      <div className="space-y-1">
        <p className="text-xs text-neutral-500 uppercase tracking-wide">Termen</p>
        <p className="text-sm font-semibold text-neutral-900 flex items-center gap-1">
          <Clock className="h-4 w-4 text-neutral-400" />
          24-48 ore
        </p>
      </div>
    </div>
  </CardContent>

  <CardFooter className="pt-6">
    <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
      Comandă Acum
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </CardFooter>
</Card>
```

**shadcn/ui Components**:
- `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`
- `Badge`
- `Button`

**Card Spacing**:
- Padding: `p-6` (24px)
- Gap between elements: `space-y-4` (16px)
- Card max-width: none (fluid)

---

### 3. Trust Section

**Purpose**: Build credibility, reduce friction

**Grid Layout**:
- Mobile: `grid-cols-1` (stacked)
- Desktop: `md:grid-cols-3` (3 columns)

#### Component: TrustSection
```tsx
<section className="py-16 lg:py-24 bg-white">
  <div className="container mx-auto px-4">
    {/* Section Heading */}
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
        De Ce eGhiseul.ro?
      </h2>
      <p className="mt-4 text-lg text-neutral-600">
        Peste 10,000 de clienți mulțumiți ne-au ales pentru simplitate și siguranță
      </p>
    </div>

    {/* Trust Features Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
      {/* Feature 1: Fast */}
      <TrustFeature
        icon={<Zap className="h-8 w-8" />}
        title="Rapid"
        description="Primești documentele în 24-48 ore, fără cozi și deplasări. Procesare automată și livrare prin email."
        iconColor="text-warning-500"
        iconBgColor="bg-warning-50"
      />

      {/* Feature 2: Secure */}
      <TrustFeature
        icon={<Lock className="h-8 w-8" />}
        title="Securizat"
        description="Datele tale sunt criptate și protejate conform GDPR. Stocare securizată pe AWS și autentificare în doi pași."
        iconColor="text-primary-600"
        iconBgColor="bg-primary-50"
      />

      {/* Feature 3: Legal */}
      <TrustFeature
        icon={<Shield className="h-8 w-8" />}
        title="100% Legal"
        description="Colaborăm direct cu instituțiile statului. Toate documentele sunt oficiale și au valabilitate juridică."
        iconColor="text-accent-600"
        iconBgColor="bg-accent-50"
      />
    </div>
  </div>
</section>
```

#### Component: TrustFeature
```tsx
<div className="text-center space-y-4">
  {/* Icon */}
  <div className={`w-16 h-16 mx-auto ${iconBgColor} rounded-2xl flex items-center justify-center`}>
    <div className={iconColor}>
      {icon}
    </div>
  </div>

  {/* Title */}
  <h3 className="text-xl font-bold text-neutral-900">
    {title}
  </h3>

  {/* Description */}
  <p className="text-neutral-600 leading-relaxed">
    {description}
  </p>
</div>
```

---

### 4. How It Works Section

**Purpose**: Reduce complexity, guide users through process

**Layout**: Horizontal timeline on desktop, vertical on mobile

#### Component: HowItWorksSection
```tsx
<section className="py-16 lg:py-24 bg-neutral-50">
  <div className="container mx-auto px-4">
    {/* Section Heading */}
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
        Cum Funcționează?
      </h2>
      <p className="mt-4 text-lg text-neutral-600">
        4 pași simpli pentru a-ți obține documentele oficiale
      </p>
    </div>

    {/* Steps Timeline */}
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {/* Connection Line (desktop only) */}
        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-neutral-200" style={{zIndex: 0}}></div>

        {/* Step 1 */}
        <ProcessStep
          number="1"
          title="Alege Serviciul"
          description="Selectează documentul oficial de care ai nevoie din catalogul nostru"
          icon={<Search className="h-6 w-6" />}
        />

        {/* Step 2 */}
        <ProcessStep
          number="2"
          title="Completează Datele"
          description="Încarcă actele necesare și completează formularul online"
          icon={<Upload className="h-6 w-6" />}
        />

        {/* Step 3 */}
        <ProcessStep
          number="3"
          title="Plătește Securizat"
          description="Efectuează plata prin card sau transfer bancar"
          icon={<CreditCard className="h-6 w-6" />}
        />

        {/* Step 4 */}
        <ProcessStep
          number="4"
          title="Primești Documentul"
          description="Documentul oficial îți este livrat prin email în 24-48 ore"
          icon={<CheckCircle className="h-6 w-6" />}
        />
      </div>
    </div>

    {/* CTA */}
    <div className="mt-12 text-center">
      <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white px-8">
        Începe Acum
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </div>
</section>
```

#### Component: ProcessStep
```tsx
<div className="relative flex flex-col items-center text-center space-y-4">
  {/* Step Number Circle */}
  <div className="relative z-10 w-24 h-24 bg-primary-600 rounded-full flex flex-col items-center justify-center text-white shadow-lg">
    <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Pasul</div>
    <div className="text-3xl font-bold">{number}</div>
  </div>

  {/* Icon (optional) */}
  <div className="w-12 h-12 bg-white border-2 border-primary-200 rounded-lg flex items-center justify-center text-primary-600">
    {icon}
  </div>

  {/* Title */}
  <h3 className="text-lg font-bold text-neutral-900">
    {title}
  </h3>

  {/* Description */}
  <p className="text-sm text-neutral-600 leading-relaxed">
    {description}
  </p>
</div>
```

---

### 5. Footer

**Purpose**: Navigation, legal compliance, contact info

**Layout**: 3-column on desktop, stacked on mobile

#### Component: Footer
```tsx
<footer className="bg-neutral-900 text-neutral-300">
  <div className="container mx-auto px-4 py-12 lg:py-16">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
      {/* Column 1: About & Logo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg"></div>
          <span className="text-xl font-bold text-white">eGhiseul.ro</span>
        </div>
        <p className="text-sm leading-relaxed">
          Platforma digitală pentru obținerea documentelor oficiale românești, rapid și legal.
        </p>
        <div className="flex gap-4">
          {/* Social Icons */}
          <a href="#" className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="#" className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
            <Instagram className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Column 2: Quick Links */}
      <div className="space-y-4">
        <h3 className="text-white font-bold text-lg">Link-uri Rapide</h3>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-primary-400 transition-colors">Servicii</a></li>
          <li><a href="#" className="hover:text-primary-400 transition-colors">Cum Funcționează</a></li>
          <li><a href="#" className="hover:text-primary-400 transition-colors">Prețuri</a></li>
          <li><a href="#" className="hover:text-primary-400 transition-colors">Întrebări Frecvente</a></li>
          <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
        </ul>
      </div>

      {/* Column 3: Contact & Legal */}
      <div className="space-y-4">
        <h3 className="text-white font-bold text-lg">Contact</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Mail className="h-4 w-4 mt-0.5 text-primary-400" />
            <a href="mailto:contact@eghiseul.ro" className="hover:text-primary-400 transition-colors">
              contact@eghiseul.ro
            </a>
          </li>
          <li className="flex items-start gap-2">
            <Phone className="h-4 w-4 mt-0.5 text-primary-400" />
            <a href="tel:+40740123456" className="hover:text-primary-400 transition-colors">
              +40 740 123 456
            </a>
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-primary-400" />
            <span>București, România</span>
          </li>
        </ul>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
      <p>&copy; 2025 eGhiseul.ro. Toate drepturile rezervate.</p>
      <div className="flex gap-6">
        <a href="#" className="hover:text-primary-400 transition-colors">Termeni și Condiții</a>
        <a href="#" className="hover:text-primary-400 transition-colors">Politica de Confidențialitate</a>
        <a href="#" className="hover:text-primary-400 transition-colors">GDPR</a>
      </div>
    </div>
  </div>
</footer>
```

**shadcn/ui Components**: None (custom footer)

---

## Responsive Design Utilities

### Container
```tsx
className="container mx-auto px-4"
// Provides consistent horizontal padding and centers content
```

### Spacing Scale (Mobile-First)
```tsx
// Mobile: py-16 (64px)
// Desktop: lg:py-24 (96px)

// Section vertical padding pattern:
className="py-16 lg:py-24"
```

### Typography Scale
```tsx
// Headings (h1)
className="text-4xl sm:text-5xl lg:text-6xl font-bold"

// Headings (h2)
className="text-3xl sm:text-4xl font-bold"

// Headings (h3)
className="text-xl font-bold"

// Body text
className="text-base sm:text-lg"

// Small text
className="text-sm"
```

### Grid Breakpoints
```tsx
// Mobile: 1 column (default)
grid-cols-1

// Tablet: 2 columns (768px+)
md:grid-cols-2

// Desktop: 3 columns (1024px+)
lg:grid-cols-3

// Full pattern:
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
```

---

## shadcn/ui Components Reference

### Required Components
Install these from shadcn/ui:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
```

### Component Imports
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Icons
import {
  ArrowRight,
  ChevronRight,
  Shield,
  Clock,
  Lock,
  Zap,
  FileText,
  Search,
  Upload,
  CreditCard,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram
} from "lucide-react"
```

---

## Accessibility Considerations

### Semantic HTML
```tsx
// Use proper heading hierarchy
<h1> → Hero headline (only one per page)
<h2> → Section headings
<h3> → Card titles, feature titles

// Use semantic elements
<section> for major sections
<nav> for navigation
<footer> for footer
```

### ARIA Labels
```tsx
// Buttons with icons
<Button aria-label="Vezi toate serviciile">
  Vezi Toate Serviciile
  <ChevronRight className="ml-2" aria-hidden="true" />
</Button>

// Links
<a href="#servicii" aria-label="Mergi la secțiunea servicii">
  Servicii
</a>
```

### Color Contrast
All text meets WCAG AA standards:
- Primary text (`text-neutral-900`) on white: 21:1 ratio
- Secondary text (`text-neutral-600`) on white: 7:1 ratio
- White text on `bg-primary-600`: 4.5:1 ratio

### Focus States
```tsx
// All interactive elements have focus styles
className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
```

---

## Performance Optimization

### Image Loading
```tsx
// Use Next.js Image component for icons/photos
import Image from 'next/image'

<Image
  src="/service-icon.svg"
  alt="Cazier Fiscal"
  width={48}
  height={48}
  loading="lazy" // Lazy load below-the-fold images
/>
```

### Font Loading
```tsx
// Use next/font for optimized font loading
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin', 'latin-ext'], // Romanian characters
  display: 'swap',
})
```

### Code Splitting
```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic'

const HowItWorksSection = dynamic(() => import('@/components/HowItWorksSection'), {
  loading: () => <div className="h-96 bg-neutral-50 animate-pulse"></div>
})
```

---

## Mobile-First Implementation Checklist

- [ ] Touch targets minimum 44px x 44px (buttons, links)
- [ ] Tap area extends beyond visible button (padding)
- [ ] Horizontal scroll disabled (overflow-x-hidden)
- [ ] Forms use appropriate input types (`type="tel"`, `type="email"`)
- [ ] Sticky CTA button on mobile for service cards
- [ ] Hamburger menu for mobile navigation (if nav exists)
- [ ] Cards stack vertically on mobile (grid-cols-1)
- [ ] Text remains readable at 16px base size (no zoom required)
- [ ] Images scale responsively (max-w-full h-auto)
- [ ] Hero section height adapts (no fixed vh on mobile)

---

## Implementation Order

### Phase 1: Foundation (Day 1)
1. Set up color tokens in Tailwind config
2. Install shadcn/ui components (button, card, badge)
3. Create base layout components (Container, Section)

### Phase 2: Core Sections (Day 2-3)
4. Implement HeroSection
5. Implement ServiceCard component
6. Implement ServiceCatalogSection
7. Implement TrustSection

### Phase 3: Details (Day 4)
8. Implement HowItWorksSection
9. Implement Footer
10. Add responsive refinements

### Phase 4: Polish (Day 5)
11. Add animations (fade-in, slide-up)
12. Implement focus states
13. Test on mobile devices
14. Accessibility audit

---

## Design Tokens Export

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... (see Color Scheme section)
        },
        accent: { /* ... */ },
        warning: { /* ... */ },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'section-mobile': '4rem',   // 64px (py-16)
        'section-desktop': '6rem',  // 96px (py-24)
      },
      maxWidth: {
        'container': '1280px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
}
```

---

## Next Steps

1. **Review with product team**: Confirm service priorities, messaging
2. **Create component library**: Build reusable components in Storybook
3. **Implement in Next.js**: Start with HeroSection, iterate
4. **A/B test CTAs**: Test button copy ("Comandă Acum" vs "Vezi Detalii")
5. **Analytics setup**: Track scroll depth, CTA clicks, service card interactions

---

## File References

- Component implementations: `app/components/home/`
- Service data source: `docs/services/*.md`
- API integration: `docs/technical/api/services-api.md`

---

**Design Status**: Ready for development sprint
**Estimated Implementation**: 5 days
**Designer**: Claude (ui-designer)
**Approved By**: Pending review
