# Color System Quick Reference

**For:** Developers implementing eGhiseul.ro components
**Last Updated:** 2025-12-16

---

## TL;DR - Quick Colors

```tsx
// Primary Actions (CTAs, Main Buttons) - Gold
className="bg-primary-500 hover:bg-primary-600 text-secondary-900"

// Secondary/Nav (Headers, Text) - Navy
className="bg-secondary-900 text-white"

// Success/Legal Badges - Green
className="bg-success-500 text-white"

// Error/Destructive
className="bg-red-600 text-white"

// Text Colors
className="text-secondary-900"        // Primary text (Navy)
className="text-neutral-600"          // Secondary text
className="text-neutral-500"          // Subtle text
```

---

## Brand Color Tokens (HEX Values)

### Primary Colors - Gold (#ECB95F)
```css
--primary-50: #FDF8E8;
--primary-100: #FBF0CC;
--primary-200: #F7E199;
--primary-300: #F3D266;
--primary-400: #EFC43D;
--primary-500: #ECB95F;   /* Base Gold */
--primary-600: #D4A24A;
--primary-700: #B8893C;
--primary-800: #9A702F;
--primary-900: #7C5A26;
--primary-950: #5E4319;
```

### Secondary Colors - Navy (#06101F)
```css
--secondary-50: #E8EDF5;
--secondary-100: #D1DBE9;
--secondary-200: #A3B7D4;
--secondary-300: #7593BE;
--secondary-400: #4A6FA6;
--secondary-500: #2A4B7A;
--secondary-600: #1E3A5F;
--secondary-700: #142947;
--secondary-800: #0C1A2F;
--secondary-900: #06101F;   /* Base Navy */
--secondary-950: #030810;
```

### Neutral Colors - Grays
```css
--neutral-50: #F9FAFB;
--neutral-100: #F3F4F6;
--neutral-200: #E5E7EB;
--neutral-300: #D1D5DB;
--neutral-400: #9CA3AF;
--neutral-500: #6B7280;
--neutral-600: #4B5563;
--neutral-700: #374151;
--neutral-800: #1F2937;
--neutral-900: #111827;
```

---

## Usage in Components

### 1. Primary CTA Button (Gold)
```tsx
<Button className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-6 py-3 rounded-xl shadow-[0_4px_12px_rgba(236,185,95,0.25)]">
  Comandă Acum
  <ArrowRight className="ml-2" />
</Button>
```

### 2. Secondary Button (Navy)
```tsx
<Button className="bg-secondary-900 hover:bg-secondary-800 text-white font-bold px-6 py-3 rounded-xl">
  Vezi Toate Serviciile
</Button>
```

### 3. Ghost/Outline Button
```tsx
<Button variant="outline" className="border-2 border-neutral-200 text-secondary-700 hover:bg-neutral-50">
  Autentificare
</Button>
```

### 4. Service Card with Gold Accent
```tsx
<Card className="border-l-4 border-l-primary-500 border-t border-r border-b border-neutral-200 hover:shadow-lg transition-all">
  <CardHeader>
    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
      <FileText className="h-6 w-6" />
    </div>
    <CardTitle className="text-secondary-900">Cazier Fiscal</CardTitle>
  </CardHeader>
</Card>
```

### 5. Badge Styles
```tsx
// Urgent Badge (Gold)
<Badge className="bg-primary-500 text-secondary-900 font-bold">
  <Zap className="h-3 w-3 mr-1" />
  Urgent
</Badge>

// Popular Badge
<Badge className="bg-primary-500 text-secondary-900 font-bold">
  Popular
</Badge>

// New Badge (Green)
<Badge className="bg-success-500 text-white">
  NOU
</Badge>
```

### 6. Trust Badges
```tsx
<div className="flex items-center gap-1.5">
  <Clock className="w-4 h-4 text-primary-500" />
  <span className="text-neutral-600 text-sm font-medium">Livrare 24-48h</span>
</div>
```

---

## Page Sections

### Hero Section
```tsx
<section className="bg-gradient-to-b from-secondary-900 to-[#0C1A2F]">
  <h1 className="text-white text-3xl lg:text-5xl font-extrabold">
    Cazier Judiciar și Documente Oficiale –{' '}
    <span className="text-primary-500">Fără Cozi, Livrare 24-48h</span>
  </h1>
</section>
```

### Header/Navigation
```tsx
<header className="bg-white shadow-sm">
  <nav>
    <Link className="text-secondary-700 hover:text-secondary-900 hover:bg-neutral-50 px-4 py-2 rounded-lg">
      Acasă
    </Link>
    <Button className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl">
      Începe Acum
    </Button>
  </nav>
</header>
```

### Footer
```tsx
<footer className="bg-secondary-900 text-white">
  <h3 className="text-white font-bold">Servicii</h3>
  <Link className="text-white/70 hover:text-primary-500">
    Cazier Judiciar
  </Link>
</footer>
```

---

## Form Elements

### Input
```tsx
<Input
  className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
  placeholder="Email"
/>
```

### Radio/Checkbox Selection
```tsx
<label className={cn(
  "p-4 rounded-xl border-2 cursor-pointer transition-all",
  selected
    ? "border-primary-500 bg-primary-50"
    : "border-neutral-200 hover:border-neutral-300"
)}>
```

---

## Text Color Usage

| Use Case | Class | Color |
|----------|-------|-------|
| Page titles, headings | `text-secondary-900` | Navy #06101F |
| Body text | `text-neutral-700` | Gray #374151 |
| Secondary text | `text-neutral-600` | Gray #4B5563 |
| Muted/placeholder | `text-neutral-500` | Gray #6B7280 |
| Links/accent | `text-primary-600` | Gold #D4A24A |
| Error text | `text-red-600` | Red |
| Success text | `text-green-600` | Green |

---

## Responsive Patterns

### Mobile-First Typography
```tsx
// Headings scale up at breakpoints
<h1 className="text-2xl sm:text-3xl lg:text-5xl">
<h2 className="text-xl sm:text-2xl lg:text-4xl">
<p className="text-sm sm:text-base lg:text-lg">
```

### Mobile-First Spacing
```tsx
// Padding scales up
<section className="py-12 sm:py-16 lg:py-24">
<div className="px-4 sm:px-6">
<div className="gap-4 sm:gap-6 lg:gap-8">
```

### Mobile-First Touch Targets
```tsx
// Minimum 44px touch targets on mobile
<Button className="h-11 sm:h-12">
<Link className="min-h-[44px] py-3">
```

---

## Icon Sizes

| Device | Size | Class |
|--------|------|-------|
| Mobile | 14-16px | `w-3.5 h-3.5` or `w-4 h-4` |
| Desktop | 16-20px | `w-4 h-4` or `w-5 h-5` |

```tsx
<Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
```

---

## Shadow Utilities

### Gold Glow (Primary Buttons)
```tsx
shadow-[0_4px_12px_rgba(236,185,95,0.25)]
hover:shadow-[0_6px_16px_rgba(236,185,95,0.35)]
```

### Subtle Elevation (Cards)
```tsx
shadow-sm hover:shadow-lg transition-shadow
```

### Large Elevation (Modals, Services Box)
```tsx
shadow-2xl
```

---

## Don'ts

- Don't use pure black (#000000) for text - use secondary-900 (#06101F)
- Don't use bright/saturated colors as backgrounds
- Don't make gold buttons too small - ensure 44px+ touch targets
- Don't use gold (#ECB95F) for large text blocks
- Don't forget hover states on interactive elements

---

## Component Color Mapping

| Component | Background | Text | Border |
|-----------|-----------|------|--------|
| Primary Button | primary-500 | secondary-900 | - |
| Secondary Button | secondary-900 | white | - |
| Outline Button | transparent | secondary-700 | neutral-200 |
| Card | white | secondary-900 | neutral-200 |
| Card Accent | - | - | primary-500 (left) |
| Badge (urgent) | primary-500 | secondary-900 | - |
| Badge (new) | success-500 | white | - |
| Input | white | secondary-900 | neutral-300 |
| Input Focus | white | secondary-900 | primary-500 |

---

## Resources

- **globals.css:** `/src/app/globals.css` - CSS variables
- **Tailwind Config:** `/tailwind.config.ts` - Extended colors
- **Color Palette:** Primary Gold #ECB95F, Secondary Navy #06101F
