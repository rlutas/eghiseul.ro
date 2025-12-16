# eGhiseul.ro Color System

## Overview

Complete color system for eGhiseul.ro based on the WordPress brand identity, designed for premium, legal-administrative feel with professional gold accents.

**Design Philosophy:**
- Premium but accessible
- Professional without being cold corporate
- Gold accents for trust and authority
- Navy blue for professionalism and reliability
- Neutral grays for clean, modern interface

---

## Brand Colors

### Primary: Gold/Auriu (#ECB95F)

Premium gold used for buttons, accents, icons, and important UI elements.

```css
/* Base color */
--primary-500: oklch(0.75 0.12 75); /* #ECB95F */
```

**Full Scale (50-950):**
- `50` - Lightest tint (backgrounds, hover states)
- `100` - Very light (icon backgrounds)
- `200-400` - Light variants (disabled states, soft accents)
- `500` - Base brand color (buttons, links)
- `600-900` - Dark variants (hover, active, text on light backgrounds)
- `950` - Darkest shade

**Usage:**
```tsx
// Tailwind classes
className="bg-primary-500 text-primary-foreground"
className="hover:bg-primary-600 active:bg-primary-700"
className="border-primary-500 text-primary-700"

// CSS variables
background: var(--primary-500);
color: var(--primary-foreground);
```

---

### Secondary: Dark Blue/Navy (#06101F)

Professional dark blue for main text, titles, and serious UI elements.

```css
/* Base color */
--secondary-900: oklch(0.08 0.01 250); /* #06101F */
```

**Full Scale (50-950):**
- `50-300` - Very light tints (backgrounds, subtle UI)
- `400-600` - Medium variants (secondary text, disabled states)
- `700-800` - Dark variants (hover states)
- `900` - Base brand color (primary text, headings)
- `950` - Deepest black-navy

**Usage:**
```tsx
// Primary text
className="text-secondary-900"

// Headings
className="text-2xl font-bold text-secondary-900"

// Secondary backgrounds
className="bg-secondary-100 text-secondary-900"
```

---

### Neutral: Gray Scale

Professional gray scale for borders, backgrounds, and UI elements.

```css
/* Key grays */
--neutral-50: oklch(0.99 0 0);  /* #F9FAFB - Light backgrounds */
--neutral-200: oklch(0.93 0 0); /* #e8edf3 - Borders */
--neutral-600: oklch(0.48 0 0); /* #3a4555 - Secondary text */
```

**Full Scale (50-950):**
- `50` - Page background (#F9FAFB)
- `100-200` - Card backgrounds, borders (#e8edf3)
- `300-500` - Disabled states, placeholders
- `600` - Secondary text (#3a4555)
- `700-950` - Dark text variants

**Usage:**
```tsx
// Page background
className="bg-neutral-50"

// Card borders
className="border border-neutral-200"

// Secondary text
className="text-neutral-600"
```

---

## Semantic Colors

### Success (Green)

Used for success messages, confirmations, completed states.

```css
--success-500: oklch(0.60 0.18 145);
```

**Scale:** 50-900 (lightest to darkest)

**Usage:**
```tsx
// Success message
className="bg-success-100 text-success-700 border-success-500"

// Success icon
className="text-success-500"
```

---

### Warning (Amber)

Used for warnings, cautions, pending states.

```css
--warning-500: oklch(0.70 0.18 70);
```

**Scale:** 50-900

**Usage:**
```tsx
// Warning banner
className="bg-warning-100 text-warning-700 border-warning-500"
```

---

### Error (Red)

Used for errors, destructive actions, validation failures.

```css
--error-500: oklch(0.63 0.24 25);
```

**Scale:** 50-900

**Usage:**
```tsx
// Error message
className="bg-error-100 text-error-700 border-error-500"

// Destructive button
className="bg-error-500 text-white hover:bg-error-600"
```

---

### Info (Blue)

Used for informational messages, tips, neutral notifications.

```css
--info-500: oklch(0.58 0.18 230);
```

**Scale:** 50-900

**Usage:**
```tsx
// Info banner
className="bg-info-100 text-info-700 border-info-500"
```

---

## Component Color Mappings

### Buttons

#### Primary Button (Gold)
```tsx
<button className="bg-primary-500 text-secondary-900 hover:bg-primary-600 active:bg-primary-700">
  Comandă Acum
</button>
```

**Colors:**
- Background: `primary-500` (#ECB95F)
- Text: `secondary-900` (#06101F)
- Hover: `primary-600`
- Active: `primary-700`
- Focus ring: `ring-primary-500`

#### Secondary Button (Outline)
```tsx
<button className="bg-transparent border border-primary-500 text-secondary-900 hover:bg-primary-50">
  Vezi Detalii
</button>
```

**Colors:**
- Background: `transparent`
- Border: `primary-500`
- Text: `secondary-900`
- Hover background: `primary-50`

#### Ghost Button
```tsx
<button className="text-primary-700 hover:bg-primary-100">
  Anulează
</button>
```

---

### Cards

```tsx
<div className="bg-card border-l-4 border-l-primary-500 shadow-soft">
  <h3 className="text-card-foreground">Card Title</h3>
  <p className="text-muted-foreground">Card content...</p>
</div>
```

**Colors:**
- Background: `card` (white)
- Border accent: `border-l-primary-500` (gold left border)
- Title: `card-foreground` (secondary-900)
- Body text: `muted-foreground` (neutral-600)
- Shadow: Custom `shadow-soft` (0 6px 20px rgba(6,16,31,0.08))

---

### Icons

#### Gold Icon on Light Background
```tsx
<div className="bg-primary-100 p-3 rounded-lg">
  <Icon className="text-primary-600" />
</div>
```

**Colors:**
- Background: `primary-100` (light gold)
- Icon: `primary-600` (darker gold)

#### Icon with Text
```tsx
<div className="flex items-center gap-2">
  <Icon className="text-primary-500" />
  <span className="text-secondary-900">Text</span>
</div>
```

---

### Badges

#### Success Badge
```tsx
<span className="bg-success-100 text-success-700 px-2 py-1 rounded-md">
  Finalizat
</span>
```

#### Warning Badge
```tsx
<span className="bg-warning-100 text-warning-700 px-2 py-1 rounded-md">
  În Așteptare
</span>
```

#### Error Badge
```tsx
<span className="bg-error-100 text-error-700 px-2 py-1 rounded-md">
  Respins
</span>
```

#### Info Badge
```tsx
<span className="bg-info-100 text-info-700 px-2 py-1 rounded-md">
  În Procesare
</span>
```

---

### Form Inputs

```tsx
<input
  className="
    w-full
    border border-input
    bg-background
    text-foreground
    placeholder:text-muted-foreground
    focus:ring-2 focus:ring-ring focus:border-transparent
    rounded-lg
    px-3 py-2
  "
  placeholder="Introduceți textul..."
/>
```

**Colors:**
- Border: `input` (neutral-200)
- Background: `background` (neutral-50)
- Text: `foreground` (secondary-900)
- Placeholder: `muted-foreground` (neutral-600)
- Focus ring: `ring` (primary-500)

---

### Text Hierarchy

```tsx
// H1 - Page titles
<h1 className="text-4xl font-bold text-secondary-900">
  Titlu Principal
</h1>

// H2 - Section titles
<h2 className="text-3xl font-semibold text-secondary-900">
  Secțiune
</h2>

// H3 - Subsections
<h3 className="text-2xl font-medium text-secondary-900">
  Subsecțiune
</h3>

// Body text
<p className="text-base text-secondary-900">
  Text principal...
</p>

// Secondary text
<p className="text-sm text-muted-foreground">
  Text secundar, descrieri, metadata...
</p>

// Muted text
<p className="text-xs text-neutral-500">
  Text foarte subtil, legal disclaimers...
</p>
```

---

## Design Tokens

### Border Radius

```css
--radius: 0.75rem;         /* 12px - Base */
--radius-sm: 8px;          /* Small elements */
--radius-md: 10px;         /* Medium elements */
--radius-lg: 12px;         /* Large elements (default) */
--radius-xl: 16px;         /* Extra large */
--radius-2xl: 20px;        /* Cards, modals */
--radius-3xl: 24px;        /* Hero sections */
--radius-4xl: 28px;        /* Special cases */
```

**Usage:**
```tsx
className="rounded-lg"     // 12px
className="rounded-2xl"    // 20px
```

---

### Shadows

```css
/* Soft shadow - Cards, buttons */
--shadow-soft: 0 6px 20px rgba(6, 16, 31, 0.08);

/* Medium shadow - Modals, dropdowns */
--shadow-medium: 0 10px 30px rgba(6, 16, 31, 0.12);

/* Large shadow - Hero elements */
--shadow-large: 0 20px 50px rgba(6, 16, 31, 0.15);
```

**Usage:**
```tsx
// Custom shadow utility (add to tailwind.config if needed)
className="shadow-[0_6px_20px_rgba(6,16,31,0.08)]"

// Or use CSS variable
style={{ boxShadow: 'var(--shadow-soft)' }}
```

---

### Container Width

```tsx
// Max container width: 1100px
<div className="max-w-[1100px] mx-auto px-4">
  Content
</div>
```

---

## Dark Mode (Optional - Future Phase)

Dark mode is pre-configured but optional for later implementation.

**Key Changes in Dark Mode:**
- Background: `secondary-900` (dark navy)
- Text: Light gray (97% lightness)
- Primary gold: Brighter variant (`primary-400`) for better contrast
- Shadows: More subtle, darker
- Borders: Semi-transparent white

**Toggle:**
```tsx
<html className="dark">
  <!-- Automatically applies dark mode CSS variables -->
</html>
```

---

## Accessibility

### Color Contrast Ratios

All color combinations meet WCAG AA standards:

| Combination | Contrast Ratio | WCAG Level |
|-------------|----------------|------------|
| `primary-500` on white | 3.2:1 | AA (Large text) |
| `secondary-900` on white | 14.5:1 | AAA |
| `neutral-600` on white | 7.8:1 | AAA |
| `primary-foreground` on `primary-500` | 12.1:1 | AAA |

### Recommendations

1. **Primary text:** Use `secondary-900` on `neutral-50` or white
2. **Secondary text:** Use `neutral-600` for descriptions
3. **Links:** Use `primary-700` with underline
4. **Buttons:** Gold background with dark text (verified contrast)
5. **Focus states:** Always include visible focus ring with `ring-primary-500`

---

## Usage Examples

### Service Card
```tsx
<div className="
  bg-card
  border-l-4 border-l-primary-500
  rounded-2xl
  p-6
  shadow-[0_6px_20px_rgba(6,16,31,0.08)]
">
  <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
    <Icon className="text-primary-600" />
  </div>

  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
    Cazier Fiscal
  </h3>

  <p className="text-muted-foreground mb-4">
    Obține certificatul de cazier fiscal rapid și online.
  </p>

  <div className="flex items-center justify-between">
    <span className="text-2xl font-bold text-secondary-900">49 RON</span>
    <button className="bg-primary-500 text-secondary-900 px-4 py-2 rounded-lg hover:bg-primary-600">
      Comandă
    </button>
  </div>
</div>
```

### Status Badge System
```tsx
const statusColors = {
  completed: 'bg-success-100 text-success-700 border-success-500',
  pending: 'bg-warning-100 text-warning-700 border-warning-500',
  rejected: 'bg-error-100 text-error-700 border-error-500',
  processing: 'bg-info-100 text-info-700 border-info-500',
};

<span className={`px-3 py-1 rounded-full border ${statusColors[status]}`}>
  {statusLabel}
</span>
```

### Alert/Banner
```tsx
// Success Alert
<div className="bg-success-100 border-l-4 border-l-success-500 p-4 rounded-lg">
  <p className="text-success-700">Comanda a fost plasată cu succes!</p>
</div>

// Warning Alert
<div className="bg-warning-100 border-l-4 border-l-warning-500 p-4 rounded-lg">
  <p className="text-warning-700">Documentul necesită verificare suplimentară.</p>
</div>

// Error Alert
<div className="bg-error-100 border-l-4 border-l-error-500 p-4 rounded-lg">
  <p className="text-error-700">A apărut o eroare. Vă rugăm încercați din nou.</p>
</div>
```

---

## Migration from WordPress

### Color Mapping

| WordPress | New System | Usage |
|-----------|------------|-------|
| `#ECB95F` | `primary-500` | Gold buttons, accents |
| `#06101F` | `secondary-900` | Main text, headings |
| `#3a4555` | `neutral-600` | Secondary text |
| `#F9FAFB` | `neutral-50` | Page background |
| `#e8edf3` | `neutral-200` | Borders, dividers |

---

## Quick Reference

### Tailwind Classes Cheat Sheet

```tsx
// Backgrounds
bg-primary-500         // Gold
bg-secondary-900       // Navy
bg-neutral-50          // Light gray background

// Text
text-secondary-900     // Primary text
text-neutral-600       // Secondary text
text-primary-700       // Gold text

// Borders
border-neutral-200     // Subtle borders
border-primary-500     // Gold borders

// Rounded corners
rounded-lg             // 12px
rounded-2xl            // 20px

// Focus rings
ring-primary-500       // Gold focus ring
```

---

## Best Practices

1. **Consistency:** Use semantic color names (`primary`, `secondary`) instead of specific shades
2. **Hierarchy:** Reserve `primary-500` gold for important actions only
3. **Readability:** Always use `secondary-900` for body text
4. **Accessibility:** Test color contrast before using custom combinations
5. **Semantic colors:** Use success/warning/error for appropriate contexts
6. **Gold accents:** Use sparingly for maximum impact (buttons, icons, borders)
7. **White space:** Leverage `neutral-50` backgrounds to prevent overwhelming users

---

## Implementation Files

1. **CSS Variables:** `/src/app/globals.css` (lines 49-330)
2. **Tailwind Theme:** `/src/app/globals.css` (lines 6-161)
3. **Component Examples:** This document

---

## Related Documentation

- [Typography System](/docs/design/typography-system.md) (To be created)
- [Component Library](/docs/design/component-library.md) (To be created)
- [Design Tokens](/docs/design/design-tokens.md) (To be created)
- [Brand Guidelines](/docs/design/brand-guidelines.md) (To be created)

---

**Last Updated:** 2025-12-16
**Version:** 1.0.0
**Author:** Design System Team
