# eGhiseul.ro Design System

Complete design system documentation for the eGhiseul.ro platform.

---

## Overview

The eGhiseul.ro design system provides a comprehensive, scalable foundation for building consistent, accessible, and premium-quality user interfaces.

**Design Philosophy:**
- Premium yet accessible
- Professional without being cold
- Gold accents for trust and authority
- Navy blue for professionalism
- Clean, modern aesthetics

---

## Quick Start

### Installation

The color system is already configured in the project. No additional installation needed.

### Basic Usage

```tsx
import { Button } from '@/components/examples/ColorSystemDemo';

export default function MyPage() {
  return (
    <div className="bg-neutral-50 p-8">
      <h1 className="text-2xl font-bold text-secondary-900">
        Welcome to eGhiseul.ro
      </h1>

      <Button variant="primary">
        Comandă Acum
      </Button>
    </div>
  );
}
```

---

## Documentation Structure

### 1. Color System
**Primary documentation for colors, palettes, and usage.**

- **[Color System Guide](./color-system.md)** - Complete color system overview
  - Brand colors (Gold, Navy, Neutrals)
  - Semantic colors (Success, Warning, Error, Info)
  - Component color mappings
  - Accessibility guidelines
  - Dark mode support

- **[Color Palette Reference](./color-palette-reference.md)** - Visual color scales
  - All color shades (50-950)
  - Hex/OKLCH values
  - Accessibility contrast ratios
  - Component-specific combinations

- **[Component Color Guide](./component-color-guide.md)** - Ready-to-use examples
  - Buttons, cards, forms
  - Alerts, badges, navigation
  - Tables, modals, loading states
  - Copy-paste code snippets

### 2. Implementation

- **CSS Variables:** `/src/app/globals.css`
- **TypeScript Utilities:** `/src/lib/design/colors.ts`
- **Example Components:** `/src/components/examples/ColorSystemDemo.tsx`

---

## Color System at a Glance

### Brand Colors

| Color | Value | Usage |
|-------|-------|-------|
| Primary (Gold) | `#ECB95F` | Buttons, accents, icons |
| Secondary (Navy) | `#06101F` | Text, headings |
| Neutral Gray | `#F9FAFB` - `#3a4555` | Backgrounds, borders, secondary text |

### Semantic Colors

| Color | Usage |
|-------|-------|
| Success (Green) | Confirmations, completed states |
| Warning (Amber) | Cautions, pending states |
| Error (Red) | Errors, destructive actions |
| Info (Blue) | Information, tips |

---

## Component Examples

### Button
```tsx
<button className="bg-primary-500 text-secondary-900 hover:bg-primary-600 px-6 py-3 rounded-lg">
  Comandă Acum
</button>
```

### Service Card
```tsx
<div className="bg-card border-l-4 border-l-primary-500 rounded-2xl p-6 shadow-soft">
  <div className="bg-primary-100 w-14 h-14 rounded-lg flex items-center justify-center">
    <Icon className="text-primary-600" />
  </div>
  <h3 className="text-xl font-semibold text-secondary-900">Service Title</h3>
  <p className="text-muted-foreground">Description...</p>
</div>
```

### Status Badge
```tsx
<span className="bg-success-100 text-success-700 border border-success-500 px-3 py-1 rounded-full">
  Finalizat
</span>
```

---

## Design Tokens

### Border Radius
- `rounded-lg` - 12px (default)
- `rounded-2xl` - 20px (cards, modals)

### Shadows
- `shadow-soft` - `0 6px 20px rgba(6,16,31,0.08)` (cards)
- `shadow-medium` - `0 10px 30px rgba(6,16,31,0.12)` (dropdowns)
- `shadow-large` - `0 20px 50px rgba(6,16,31,0.15)` (hero elements)

### Container Width
- `max-w-[1100px]` - Maximum content width

---

## Accessibility

All color combinations meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text).

**Key Ratios:**
- Primary text (`secondary-900` on white): 14.5:1 (AAA)
- Secondary text (`neutral-600` on white): 7.8:1 (AAA)
- Gold buttons (`primary-500` on white): 3.2:1 (AA for large text)

**Best Practices:**
- Always include focus rings (`ring-primary-500`)
- Use semantic colors appropriately
- Don't rely on color alone for status
- Test with color blindness simulators

---

## TypeScript Utilities

### Color Access
```tsx
import { primary, secondary, cssVars } from '@/lib/design/colors';

// Direct color values
const goldColor = primary[500]; // oklch(0.75 0.12 75)

// CSS variables
const primaryColor = cssVars.primary; // var(--primary)
```

### Status Badges
```tsx
import { getStatusBadgeClasses } from '@/lib/design/colors';

<span className={getStatusBadgeClasses('completed')}>
  Finalizat
</span>
```

---

## Component Library

Pre-built components demonstrating the color system:

```tsx
import {
  Button,
  ServiceCard,
  StatusBadge,
  Alert,
  Input,
  ProgressBar,
  StepIndicator,
} from '@/components/examples/ColorSystemDemo';
```

See `/src/components/examples/ColorSystemDemo.tsx` for full implementation.

---

## Migration from WordPress

### Color Mapping

| WordPress | New System | Tailwind Class |
|-----------|------------|----------------|
| `#ECB95F` | `primary-500` | `bg-primary-500` |
| `#06101F` | `secondary-900` | `text-secondary-900` |
| `#3a4555` | `neutral-600` | `text-neutral-600` |
| `#F9FAFB` | `neutral-50` | `bg-neutral-50` |
| `#e8edf3` | `neutral-200` | `border-neutral-200` |

### Before (WordPress)
```css
.button-primary {
  background-color: #ECB95F;
  color: #06101F;
}
```

### After (Tailwind)
```tsx
<button className="bg-primary-500 text-secondary-900">
  Button
</button>
```

---

## Future Enhancements

- [ ] Typography system documentation
- [ ] Spacing scale guide
- [ ] Icon system
- [ ] Animation guidelines
- [ ] Component library expansion
- [ ] Storybook integration
- [ ] Figma design tokens export

---

## Related Documentation

- [Typography System](./typography-system.md) (Coming soon)
- [Component Library](./component-library.md) (Coming soon)
- [Design Tokens](./design-tokens.md) (Coming soon)
- [Brand Guidelines](./brand-guidelines.md) (Coming soon)

---

## Support & Questions

For design system questions or suggestions:
1. Check existing documentation
2. Review example components
3. Test in browser DevTools
4. Consult with design team

---

**Version:** 1.0.0
**Last Updated:** 2025-12-16
**Maintained by:** eGhiseul.ro Design Team
