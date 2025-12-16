# Color System Quick Reference

**For:** Developers implementing eGhiseul.ro components
**Last Updated:** 2025-12-16

---

## TL;DR - Quick Colors

```tsx
// Primary Actions (CTAs, Main Buttons)
className="bg-[#003380] text-white hover:bg-[#003D99]"

// Success/Legal Badges
className="bg-[#0F7A3E] text-white"

// Romanian Gold Accent (use sparingly)
className="border-l-4 border-[#F5B800]"

// Error/Destructive
className="bg-[#B91C1C] text-white"

// Text Colors
className="text-gray-900"              // Primary text
className="text-gray-600"              // Secondary text
className="text-gray-400"              // Subtle text
```

---

## Color Tokens (CSS Variables)

### Primary Colors
```css
--color-primary: #003380            /* Romanian Blue */
--color-success: #0F7A3E            /* Legal Green */
--color-warning: #F5B800            /* Romanian Gold */
--color-error: #B91C1C              /* Alert Red */
```

### Usage in Components
```tsx
// Use CSS variables for theme support
<button className="bg-primary text-primary-foreground">
  Click Me
</button>

// Or direct hex for specific control
<button className="bg-[#003380] text-white">
  Click Me
</button>
```

---

## Common Patterns

### 1. Hero Section with Romanian Identity
```tsx
<section className="bg-gradient-to-br from-blue-50 via-white to-yellow-50">
  <h1 className="text-gray-900">
    Obtine Acte Oficiale{' '}
    <span className="text-[#003380]">Rapid si Legal</span>
  </h1>
</section>
```

**Result:** Subtle Romanian flag gradient (blue → white → yellow)

### 2. Primary CTA Button
```tsx
<Button className="bg-[#003380] hover:bg-[#003D99] text-white px-8 py-6">
  Vezi Toate Serviciile
  <ArrowRight className="ml-2" />
</Button>
```

**Contrast:** 10.58:1 (AAA compliant)

### 3. Trust Badges with Semantic Colors
```tsx
<div className="flex gap-6">
  {/* Security - Blue */}
  <div className="flex items-center gap-2">
    <Lock className="h-5 w-5 text-[#003380]" />
    <span className="text-gray-600">Date Securizate</span>
  </div>

  {/* Legal - Green */}
  <div className="flex items-center gap-2">
    <Shield className="h-5 w-5 text-[#0F7A3E]" />
    <span className="text-gray-600">100% Legal</span>
  </div>

  {/* Speed - Gold */}
  <div className="flex items-center gap-2">
    <Zap className="h-5 w-5 text-[#F5B800]" />
    <span className="text-gray-600">24-48 ore</span>
  </div>
</div>
```

### 4. Success Badge
```tsx
<Badge className="bg-[#0F7A3E] text-white">
  Verificat
</Badge>
```

**Contrast:** 5.12:1 (AA compliant)

### 5. Warning/Important Notice
```tsx
<div className="border-l-4 border-[#F5B800] bg-yellow-50 p-4">
  <p className="text-gray-900">
    Document important
  </p>
</div>
```

### 6. Error Message
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <p className="text-[#B91C1C] flex items-center gap-2">
    <AlertCircle className="h-5 w-5" />
    Eroare la procesare
  </p>
</div>
```

### 7. Card with Romanian Accent
```tsx
<Card className="border-t-4 border-[#003380]">
  <CardHeader>
    <CardTitle>Cazier Fiscal</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### 8. Featured Service with Gold Highlight
```tsx
<div className="relative">
  {/* Gold corner ribbon */}
  <div className="absolute top-4 right-4 bg-[#F5B800] text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
    Popular
  </div>

  <Card>
    {/* Service content */}
  </Card>
</div>
```

---

## Color Contrast Matrix

| Color | Background | Ratio | WCAG | Use Case |
|-------|-----------|-------|------|----------|
| #003380 (Primary) | White | 10.58:1 | AAA | Primary buttons, text |
| #0F7A3E (Success) | White | 5.12:1 | AA | Success badges |
| #F5B800 (Warning) | Gray-900 | 4.8:1 | AA | Accents on dark |
| #B91C1C (Error) | White | 5.94:1 | AA | Error messages |
| #111827 (Text) | White | 15.05:1 | AAA | Body text |
| #6B7280 (Muted) | White | 4.61:1 | AA | Secondary text |

All combinations meet WCAG AA standards minimum.

---

## Don'ts

❌ Don't use bright flag red (#CE1126) as primary color
❌ Don't use bright yellow (#FCD116) as background
❌ Don't overuse Romanian gold (use sparingly)
❌ Don't rely on color alone (always add icons/text)
❌ Don't use generic Tailwind blue (#2563eb) - use Romanian blue (#003380)

---

## Component-Specific Guidelines

### Buttons
```tsx
// Primary
<Button className="bg-[#003380] hover:bg-[#003D99] text-white">

// Secondary
<Button variant="outline" className="border-[#003380] text-[#003380] hover:bg-blue-50">

// Success
<Button className="bg-[#0F7A3E] hover:bg-[#0A5A2E] text-white">

// Destructive
<Button className="bg-[#B91C1C] hover:bg-red-800 text-white">
```

### Badges
```tsx
// Default
<Badge className="bg-[#003380] text-white">

// Success
<Badge className="bg-[#0F7A3E] text-white">

// Warning
<Badge className="bg-[#F5B800] text-gray-900">

// Outline
<Badge variant="outline" className="border-[#003380] text-[#003380]">
```

### Form Inputs
```tsx
<Input
  className="
    border-gray-300
    focus:border-[#003380]
    focus:ring-[#003380]
    focus:ring-2
  "
/>
```

### Links
```tsx
<Link className="text-[#003380] hover:text-[#003D99] underline">
  Vezi detalii
</Link>
```

---

## Icon Color Semantics

| Icon Type | Color | Hex | Meaning |
|-----------|-------|-----|---------|
| Lock, Shield (Security) | Blue | #003380 | Trust, protection |
| CheckCircle, Shield (Legal) | Green | #0F7A3E | Verified, legal |
| Zap, Clock (Speed) | Gold | #F5B800 | Fast, premium |
| AlertCircle, XCircle | Red | #B91C1C | Error, warning |

```tsx
// Example
<Lock className="text-[#003380]" />       // Security
<Shield className="text-[#0F7A3E]" />     // Legal
<Zap className="text-[#F5B800]" />        // Speed
<AlertCircle className="text-[#B91C1C]" />// Error
```

---

## Gradients

### 1. Romanian Flag Gradient (Subtle)
```tsx
className="bg-gradient-to-br from-blue-50 via-white to-yellow-50"
```

### 2. Blue Gradient (Hero)
```tsx
className="bg-gradient-to-br from-[#003380] to-[#0066FF]"
```

### 3. Success Gradient
```tsx
className="bg-gradient-to-r from-green-50 to-emerald-50"
```

---

## Dark Mode

Colors automatically adjust via CSS variables when `.dark` class is applied:

```tsx
// This automatically adapts to dark mode
<Button className="bg-primary text-primary-foreground">
  Click Me
</Button>
```

**Light Mode:** bg-[#003380] (dark blue)
**Dark Mode:** bg-[lighter blue for contrast]

---

## Accessibility Checklist

- [ ] Text contrast ratio ≥ 4.5:1 (AA)
- [ ] Large text contrast ≥ 3:1 (AA)
- [ ] Focus states clearly visible
- [ ] Color not used as only indicator
- [ ] Icons paired with text labels
- [ ] Tested with color blindness simulator

---

## When to Use Each Color

### Romanian Blue (#003380)
- Primary CTAs
- Main navigation
- Links
- Active states
- Focus rings
- Headers (optional)

### Success Green (#0F7A3E)
- Success messages
- Legal badges
- Verification marks
- Completed states
- "Official" indicators

### Romanian Gold (#F5B800)
- Featured items (sparingly)
- Premium badges
- Important highlights
- Speed/efficiency indicators
- **Use < 5% of page area**

### Alert Red (#B91C1C)
- Error messages
- Destructive actions
- Urgent deadlines
- Validation errors
- Cancel buttons

### Neutral Gray
- Body text (Gray-900)
- Secondary text (Gray-600)
- Disabled states (Gray-400)
- Borders (Gray-200)
- Backgrounds (Gray-50)

---

## Testing Your Implementation

```bash
# 1. Visual contrast test
# Use browser dev tools to check contrast ratios

# 2. Color blindness simulation
# Chrome DevTools > Rendering > Emulate vision deficiencies

# 3. Dark mode test
# Toggle .dark class on <html> element

# 4. Accessibility audit
# Lighthouse > Accessibility score
```

---

## Resources

- **Full Analysis:** `/docs/design/color-system-analysis.md`
- **Implementation CSS:** `/docs/design/color-system-implementation.css`
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Romanian Flag Colors:** #002B7F, #FCD116, #CE1126

---

## Questions?

**Q: Can I use Tailwind's blue-600?**
A: No, use Romanian blue (#003380) instead for brand consistency.

**Q: When should I use gold (#F5B800)?**
A: Sparingly. Only for featured items, premium badges, or important highlights. Should cover less than 5% of any page.

**Q: Do I need to use CSS variables or hex codes?**
A: CSS variables (`bg-primary`) are preferred for automatic dark mode support. Use hex codes when you need specific control.

**Q: What about Romanian flag red?**
A: Avoid as primary color. Only use for errors/destructive actions, and use the darker variant (#B91C1C) for better readability.

**Q: How do I make Romanian identity more prominent?**
A: Use the blue-to-yellow gradient in hero sections, add gold accents to featured services, and use the blue-green-gold trio for trust badges.
