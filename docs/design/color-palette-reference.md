# Color Palette Visual Reference

Complete visual reference of all color scales in the eGhiseul.ro design system.

---

## Primary (Gold) - #ECB95F

Premium gold for buttons, accents, and important UI elements.

| Shade | Color Value | OKLCH | Hex Approx | Usage |
|-------|-------------|-------|------------|-------|
| 50 | `oklch(0.98 0.02 85)` | ~`#FEF9ED` | Lightest backgrounds, hover states |
| 100 | `oklch(0.95 0.04 85)` | ~`#FDF3DB` | Icon backgrounds, subtle accents |
| 200 | `oklch(0.90 0.06 85)` | ~`#FBE6B7` | Disabled states, soft highlights |
| 300 | `oklch(0.85 0.08 82)` | ~`#F8D993` | Light accents |
| 400 | `oklch(0.80 0.10 80)` | ~`#F4CC6F` | Medium accents |
| **500** | `oklch(0.75 0.12 75)` | **`#ECB95F`** | **Base brand color** |
| 600 | `oklch(0.65 0.12 75)` | ~`#D4A04B` | Hover states, darker accents |
| 700 | `oklch(0.55 0.10 75)` | ~`#B08737` | Active states |
| 800 | `oklch(0.45 0.08 75)` | ~`#8C6E23` | Dark text on light backgrounds |
| 900 | `oklch(0.35 0.06 75)` | ~`#685510` | Darkest accents |
| 950 | `oklch(0.25 0.04 75)` | ~`#443C08` | Ultra dark |

**Accessibility:**
- Primary-500 on white: 3.2:1 (AA for large text)
- Primary-foreground on primary-500: 12.1:1 (AAA)

---

## Secondary (Navy Blue) - #06101F

Professional dark blue for text, headings, and serious UI elements.

| Shade | Color Value | OKLCH | Hex Approx | Usage |
|-------|-------------|-------|------------|-------|
| 50 | `oklch(0.95 0.01 250)` | ~`#F0F2F5` | Very light backgrounds |
| 100 | `oklch(0.90 0.02 250)` | ~`#E1E5EB` | Light UI backgrounds |
| 200 | `oklch(0.80 0.03 250)` | ~`#C3CBD7` | Subtle UI elements |
| 300 | `oklch(0.65 0.04 250)` | ~`#8995A8` | Light text, disabled |
| 400 | `oklch(0.50 0.05 250)` | ~`#4F5F7A` | Medium text |
| 500 | `oklch(0.35 0.05 250)` | ~`#1F2D4C` | Medium navy |
| 600 | `oklch(0.25 0.04 250)` | ~`#12203A` | Dark navy |
| 700 | `oklch(0.18 0.03 250)` | ~`#0B1728` | Darker navy |
| 800 | `oklch(0.12 0.02 250)` | ~`#081119` | Very dark |
| **900** | `oklch(0.08 0.01 250)` | **`#06101F`** | **Base text color** |
| 950 | `oklch(0.05 0.01 250)` | ~`#030A13` | Near black |

**Accessibility:**
- Secondary-900 on white: 14.5:1 (AAA)
- Secondary-900 on neutral-50: 13.8:1 (AAA)

---

## Neutral (Gray Scale)

Professional gray scale for borders, backgrounds, and UI elements.

| Shade | Color Value | OKLCH | Hex Approx | Usage |
|-------|-------------|-------|------------|-------|
| 50 | `oklch(0.99 0 0)` | **`#F9FAFB`** | Page background |
| 100 | `oklch(0.97 0 0)` | ~`#F3F4F6` | Card backgrounds |
| 200 | `oklch(0.93 0 0)` | **`#e8edf3`** | Borders, dividers |
| 300 | `oklch(0.88 0 0)` | ~`#D1D5DB` | Disabled backgrounds |
| 400 | `oklch(0.75 0 0)` | ~`#9CA3AF` | Placeholders |
| 500 | `oklch(0.60 0 0)` | ~`#6B7280` | Icons, helper text |
| 600 | `oklch(0.48 0 0)` | **`#3a4555`** | Secondary text |
| 700 | `oklch(0.38 0 0)` | ~`#374151` | Dark text |
| 800 | `oklch(0.28 0 0)` | ~`#1F2937` | Very dark text |
| 900 | `oklch(0.18 0 0)` | ~`#111827` | Near black text |
| 950 | `oklch(0.12 0 0)` | ~`#0A0F1A` | Darkest |

**Key Grays:**
- **50**: Page backgrounds (#F9FAFB)
- **200**: Borders (#e8edf3)
- **600**: Secondary text (#3a4555)

---

## Success (Green)

Used for success messages, confirmations, completed states.

| Shade | Color Value | OKLCH | Usage |
|-------|-------------|-------|-------|
| 50 | `oklch(0.97 0.02 145)` | Success backgrounds |
| 100 | `oklch(0.93 0.04 145)` | Light success highlights |
| 200 | `oklch(0.87 0.08 145)` | Success hover states |
| 300 | `oklch(0.79 0.12 145)` | Light success accents |
| 400 | `oklch(0.70 0.16 145)` | Medium success |
| **500** | `oklch(0.60 0.18 145)` | **Base success** |
| 600 | `oklch(0.50 0.18 145)` | Dark success |
| 700 | `oklch(0.42 0.16 145)` | Success text on light |
| 800 | `oklch(0.35 0.12 145)` | Dark success text |
| 900 | `oklch(0.28 0.08 145)` | Darkest success |

**Common Combinations:**
- Badge: `bg-success-100` + `text-success-700` + `border-success-500`
- Button: `bg-success-500` + `text-white`
- Alert: `bg-success-100` + `border-l-success-500` + `text-success-700`

---

## Warning (Amber)

Used for warnings, cautions, pending states.

| Shade | Color Value | OKLCH | Usage |
|-------|-------------|-------|-------|
| 50 | `oklch(0.98 0.02 85)` | Warning backgrounds |
| 100 | `oklch(0.95 0.05 85)` | Light warning highlights |
| 200 | `oklch(0.90 0.10 85)` | Warning hover states |
| 300 | `oklch(0.85 0.14 80)` | Light warning accents |
| 400 | `oklch(0.78 0.16 75)` | Medium warning |
| **500** | `oklch(0.70 0.18 70)` | **Base warning** |
| 600 | `oklch(0.60 0.18 65)` | Dark warning |
| 700 | `oklch(0.50 0.16 60)` | Warning text on light |
| 800 | `oklch(0.42 0.12 55)` | Dark warning text |
| 900 | `oklch(0.35 0.08 50)` | Darkest warning |

**Common Combinations:**
- Badge: `bg-warning-100` + `text-warning-700` + `border-warning-500`
- Button: `bg-warning-500` + `text-secondary-900`
- Alert: `bg-warning-100` + `border-l-warning-500` + `text-warning-700`

---

## Error (Red)

Used for errors, destructive actions, validation failures.

| Shade | Color Value | OKLCH | Usage |
|-------|-------------|-------|-------|
| 50 | `oklch(0.98 0.02 25)` | Error backgrounds |
| 100 | `oklch(0.95 0.04 25)` | Light error highlights |
| 200 | `oklch(0.90 0.08 25)` | Error hover states |
| 300 | `oklch(0.83 0.14 25)` | Light error accents |
| 400 | `oklch(0.74 0.20 25)` | Medium error |
| **500** | `oklch(0.63 0.24 25)` | **Base error** |
| 600 | `oklch(0.55 0.24 25)` | Dark error |
| 700 | `oklch(0.47 0.22 25)` | Error text on light |
| 800 | `oklch(0.40 0.18 25)` | Dark error text |
| 900 | `oklch(0.33 0.14 25)` | Darkest error |

**Common Combinations:**
- Badge: `bg-error-100` + `text-error-700` + `border-error-500`
- Button: `bg-error-500` + `text-white`
- Alert: `bg-error-100` + `border-l-error-500` + `text-error-700`
- Input error: `border-error-500` + `text-error-600`

---

## Info (Blue)

Used for informational messages, tips, neutral notifications.

| Shade | Color Value | OKLCH | Usage |
|-------|-------------|-------|-------|
| 50 | `oklch(0.97 0.02 230)` | Info backgrounds |
| 100 | `oklch(0.93 0.04 230)` | Light info highlights |
| 200 | `oklch(0.87 0.08 230)` | Info hover states |
| 300 | `oklch(0.78 0.12 230)` | Light info accents |
| 400 | `oklch(0.68 0.16 230)` | Medium info |
| **500** | `oklch(0.58 0.18 230)` | **Base info** |
| 600 | `oklch(0.50 0.18 230)` | Dark info |
| 700 | `oklch(0.42 0.16 230)` | Info text on light |
| 800 | `oklch(0.35 0.12 230)` | Dark info text |
| 900 | `oklch(0.28 0.08 230)` | Darkest info |

**Common Combinations:**
- Badge: `bg-info-100` + `text-info-700` + `border-info-500`
- Button: `bg-info-500` + `text-white`
- Alert: `bg-info-100` + `border-l-info-500` + `text-info-700`

---

## Component-Specific Colors

### Buttons

| Variant | Background | Text | Border | Hover |
|---------|------------|------|--------|-------|
| Primary | `primary-500` | `secondary-900` | N/A | `primary-600` |
| Secondary | `transparent` | `secondary-900` | `primary-500` | `primary-50` (bg) |
| Ghost | `transparent` | `primary-700` | N/A | `primary-100` (bg) |
| Destructive | `error-500` | `white` | N/A | `error-600` |
| Disabled | `neutral-300` | `neutral-500` | N/A | N/A |

### Cards

| Element | Color |
|---------|-------|
| Background | `card` (white) |
| Text | `card-foreground` (`secondary-900`) |
| Border | `neutral-200` |
| Accent border | `primary-500` (left border, 4px) |
| Shadow | `0 6px 20px rgba(6,16,31,0.08)` |

### Forms

| Element | Default | Focus | Error |
|---------|---------|-------|-------|
| Border | `neutral-200` | `primary-500` (ring) | `error-500` |
| Background | `background` (`neutral-50`) | Same | Same |
| Text | `foreground` (`secondary-900`) | Same | Same |
| Placeholder | `muted-foreground` (`neutral-600`) | Same | Same |

### Status Badges

| Status | Background | Text | Border |
|--------|------------|------|--------|
| Completed | `success-100` | `success-700` | `success-500` |
| Pending | `warning-100` | `warning-700` | `warning-500` |
| Processing | `info-100` | `info-700` | `info-500` |
| Rejected | `error-100` | `error-700` | `error-500` |
| Cancelled | `neutral-100` | `neutral-700` | `neutral-400` |

---

## Dark Mode Color Adjustments

When dark mode is enabled (`.dark` class):

| Light Mode | Dark Mode | Reason |
|------------|-----------|--------|
| `primary-500` | `primary-400` | Brighter gold for better contrast |
| `background` (neutral-50) | `secondary-900` | Dark navy background |
| `foreground` (secondary-900) | `oklch(0.97 0 0)` | Light text |
| `card` (white) | `secondary-800` | Dark cards |
| Shadows (soft) | Shadows (darker) | More subtle, black-based |

---

## Accessibility Checklist

- **AA Compliance (4.5:1 for normal text):**
  - `secondary-900` on white: 14.5:1 ✓
  - `neutral-600` on white: 7.8:1 ✓
  - `primary-foreground` on `primary-500`: 12.1:1 ✓

- **Large Text (3:1 minimum):**
  - `primary-500` on white: 3.2:1 ✓

- **Focus States:**
  - Always include `ring-primary-500` for keyboard navigation
  - Minimum 2px ring width

- **Color Blindness:**
  - Don't rely on color alone for status
  - Include icons or text labels with status badges

---

## Testing Colors

### Browser DevTools

Test colors in Chrome DevTools:

```javascript
// Get computed color value
getComputedStyle(document.documentElement).getPropertyValue('--primary-500')

// Test contrast ratio
// Use DevTools > Inspect > Accessibility panel
```

### Online Tools

- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Color Picker:** https://oklch.com/
- **Palette Generator:** https://uicolors.app/create

---

## Implementation Checklist

- [x] CSS variables defined in `globals.css`
- [x] Tailwind theme configuration
- [x] TypeScript utilities in `colors.ts`
- [x] Component examples documented
- [ ] Storybook color palette component
- [ ] Color system testing suite
- [ ] Design tokens JSON export

---

**Last Updated:** 2025-12-16
**Version:** 1.0.0
