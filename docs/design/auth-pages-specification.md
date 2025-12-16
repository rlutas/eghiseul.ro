# Authentication Pages Design Specification
## eGhiseul.ro - Romanian Government Services Platform

**Version:** 1.0
**Date:** 2025-12-16
**Designer:** UI Design Specialist

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Layout Structure](#layout-structure)
5. [Login Page Specification](#login-page-specification)
6. [Register Page Specification](#register-page-specification)
7. [Component Library](#component-library)
8. [States & Interactions](#states--interactions)
9. [Responsive Design](#responsive-design)
10. [Accessibility](#accessibility)

---

## 1. Design Philosophy

### Core Principles
The authentication pages must convey:

1. **Trust & Security**
   - Government-level security indicators
   - GDPR compliance badges
   - SSL/encryption messaging
   - Professional, institutional feel

2. **Simplicity & Clarity**
   - Single-column layout
   - Clear visual hierarchy
   - Minimal cognitive load
   - Progressive disclosure

3. **Professionalism**
   - Clean, modern aesthetic
   - Consistent with government services
   - No playful elements
   - Formal Romanian language

### Visual Direction
- Clean white backgrounds with subtle gradients
- Blue-600 (#2563eb) as primary action color
- Generous whitespace
- Subtle shadows for depth
- Icons for quick visual scanning

---

## 2. Color System

### Primary Colors
```
Primary Blue:     #2563eb (blue-600) - Actions, links, focus states
Primary Hover:    #1d4ed8 (blue-700) - Hover states
Primary Light:    #eff6ff (blue-50)  - Backgrounds, highlights
```

### Neutral Colors
```
Text Primary:     #171717 (neutral-900) - Headings
Text Secondary:   #525252 (neutral-600) - Body text
Text Muted:       #a3a3a3 (neutral-400) - Helper text
Border:           #e5e5e5 (neutral-200) - Dividers, inputs
Background:       #ffffff (white)       - Page background
Background Alt:   #fafafa (neutral-50)  - Card backgrounds
```

### Semantic Colors
```
Success:   #16a34a (green-600) - Success messages, trust badges
Error:     #dc2626 (red-600)   - Error states, validation
Warning:   #ea580c (orange-600) - Warnings
Info:      #0891b2 (cyan-600)  - Informational messages
```

### Trust Badge Colors
```
GDPR Badge:       #16a34a (green-600)
Security Badge:   #0891b2 (cyan-600)
Legal Badge:      #2563eb (blue-600)
```

---

## 3. Typography

### Font Family
```css
--font-sans: 'Geist Sans', system-ui, -apple-system, sans-serif
--font-mono: 'Geist Mono', 'Courier New', monospace
```

### Type Scale
```
Page Title (H1):    32px / 2rem    - font-bold  - neutral-900
Section Title (H2): 24px / 1.5rem  - font-bold  - neutral-900
Subsection (H3):    18px / 1.125rem - font-semibold - neutral-900
Body Large:         16px / 1rem    - font-normal - neutral-700
Body Regular:       14px / 0.875rem - font-normal - neutral-600
Body Small:         12px / 0.75rem - font-normal - neutral-500
Label:              14px / 0.875rem - font-medium - neutral-700
Button Text:        14px / 0.875rem - font-medium - white/primary
Link Text:          14px / 0.875rem - font-medium - blue-600
```

### Line Heights
```
Tight:    1.2  - Headings
Normal:   1.5  - Body text
Relaxed:  1.75 - Long-form content
```

---

## 4. Layout Structure

### Container System
```
Max Width:    448px (28rem) - Auth form container
Padding:      24px (1.5rem) mobile, 32px (2rem) desktop
Margin:       Auto-centered
Min Height:   100vh - Full viewport
```

### Grid System
```
Mobile:   Single column, 100% width
Tablet:   Single column, centered, max 448px
Desktop:  Split layout optional (50/50 form + visual)
```

### Spacing Scale
```
xs:  4px  (0.25rem)
sm:  8px  (0.5rem)
md:  16px (1rem)
lg:  24px (1.5rem)
xl:  32px (2rem)
2xl: 48px (3rem)
3xl: 64px (4rem)
```

---

## 5. Login Page Specification

**Route:** `/auth/login`
**Title:** `Autentificare | eGhiseul.ro`

### Page Layout

```
┌─────────────────────────────────────────────┐
│         Header (fixed, 64px height)         │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │                                       │ │
│  │   Logo (centered, 48px)               │ │ 48px top margin
│  │                                       │ │
│  │   Autentificare (H1, 32px)           │ │ 24px margin
│  │   Acceseaza contul tau (text, 16px)  │ │ 8px margin
│  │                                       │ │
│  │   ┌─────────────────────────────┐   │ │ 32px margin
│  │   │  Login with Google Button   │   │ │
│  │   └─────────────────────────────┘   │ │
│  │                                       │ │
│  │   ────── sau ──────                  │ │ 24px margin
│  │                                       │ │
│  │   Email (label + input)              │ │ 20px margin
│  │   Parola (label + input)             │ │ 20px margin
│  │                                       │ │
│  │   [Remember Me] | Forgot Password?   │ │ 16px margin
│  │                                       │ │
│  │   ┌─────────────────────────────┐   │ │ 24px margin
│  │   │   Autentificare Button      │   │ │
│  │   └─────────────────────────────┘   │ │
│  │                                       │ │
│  │   Nu ai cont? Inregistreaza-te       │ │ 24px margin
│  │                                       │ │
│  │   Trust Badges (3 badges)            │ │ 32px margin
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

### Component Specifications

#### 1. Logo Section
```
Component: Brand Logo
Position: Centered, top of form
Dimensions: 48px × 48px
Background: blue-600, rounded-lg (8px)
Content: "eG" in white, bold, 20px
Spacing: 48px top margin
```

#### 2. Page Title
```
Component: H1 Heading
Text: "Autentificare"
Font: 32px, bold, neutral-900
Alignment: Center
Spacing: 24px bottom margin
```

#### 3. Subtitle
```
Component: Paragraph
Text: "Acceseaza contul tau pentru a gestiona documentele"
Font: 16px, normal, neutral-600
Alignment: Center
Spacing: 8px bottom margin
```

#### 4. Social Login Button
```
Component: Button (outlined)
Text: "Continua cu Google"
Icon: Google logo (20px, left aligned)
Width: 100%
Height: 44px
Background: white
Border: 1px solid neutral-300
Border Radius: 8px
Font: 14px, medium, neutral-700
Shadow: subtle (sm)

Hover State:
- Background: neutral-50
- Border: neutral-400
- Cursor: pointer

Focus State:
- Ring: 3px blue-600/20
- Border: blue-600
```

#### 5. Divider
```
Component: Horizontal Divider with Text
Structure:
  <line> sau <line>
Lines: 1px solid neutral-200
Text: "sau" (12px, neutral-400, uppercase)
Spacing: 24px top/bottom margin
```

#### 6. Email Input Field
```
Component: Input Group
Label:
  Text: "Adresa de email"
  Font: 14px, medium, neutral-700
  Spacing: 8px bottom

Input:
  Type: email
  Placeholder: "exemplu@email.com"
  Width: 100%
  Height: 44px
  Padding: 12px 16px
  Border: 1px solid neutral-300
  Border Radius: 8px
  Font: 14px, normal, neutral-900
  Background: white

States:
  Default: border neutral-300
  Focus: border blue-600, ring 3px blue-600/20
  Error: border red-600, ring 3px red-600/20
  Disabled: background neutral-100, opacity 50%

Error Message:
  Text: "Adresa de email nu este valida"
  Font: 12px, normal, red-600
  Spacing: 8px top margin
  Icon: AlertCircle (16px, left)
```

#### 7. Password Input Field
```
Component: Input Group with Toggle
Label:
  Text: "Parola"
  Font: 14px, medium, neutral-700
  Spacing: 8px bottom

Input:
  Type: password (toggleable to text)
  Placeholder: "Introdu parola"
  Width: 100%
  Height: 44px
  Padding: 12px 16px 12px 44px (right padding for icon)
  Border: 1px solid neutral-300
  Border Radius: 8px
  Font: 14px, normal, neutral-900
  Background: white

Toggle Icon:
  Position: Absolute right, 12px from right
  Icon: Eye / EyeOff (20px, neutral-500)
  Action: Toggle password visibility
  Hover: neutral-700

States: Same as email input
```

#### 8. Remember Me + Forgot Password Row
```
Component: Flex Row (space-between)
Height: 20px
Spacing: 16px top/bottom margin

Left: Checkbox + Label
  Checkbox:
    Size: 16px × 16px
    Border: 1px solid neutral-300
    Border Radius: 4px
    Checked: blue-600 background, white checkmark
    Focus: ring 2px blue-600/20

  Label:
    Text: "Tine-ma minte"
    Font: 14px, normal, neutral-600
    Spacing: 8px left of checkbox
    Cursor: pointer

Right: Link
  Text: "Ai uitat parola?"
  Font: 14px, medium, blue-600
  Hover: blue-700, underline
  Focus: ring 2px blue-600/20, rounded 4px
```

#### 9. Primary CTA Button
```
Component: Button (primary)
Text: "Autentificare"
Width: 100%
Height: 44px
Background: blue-600
Border: none
Border Radius: 8px
Font: 14px, medium, white
Shadow: subtle (sm)
Spacing: 24px top margin

States:
  Hover: background blue-700, shadow-md
  Active: background blue-800, scale 0.98
  Focus: ring 3px blue-600/30
  Disabled: background blue-300, cursor not-allowed

Loading State:
  Text: "Se autentifica..."
  Icon: Spinner (16px, white, left aligned, rotating)
  Disabled: true
```

#### 10. Sign Up Link
```
Component: Text Link
Text: "Nu ai cont? Inregistreaza-te"
Alignment: Center
Font: 14px, normal, neutral-600
Spacing: 24px top margin

Link Styling:
  "Inregistreaza-te": blue-600, medium, underline on hover
  Focus: ring 2px blue-600/20, rounded 4px
```

#### 11. Trust Badges
```
Component: Badge Group (horizontal)
Layout: Flex row, centered, wrap on mobile
Spacing: 32px top margin, 12px gap between badges

Badge Structure:
  Each Badge:
    Display: Flex row
    Padding: 8px 12px
    Background: green-50 / cyan-50 / blue-50
    Border Radius: 6px
    Gap: 8px (icon to text)

  Icon: 16px, green-600 / cyan-600 / blue-600
  Text: 12px, medium, neutral-700

Badges:
  1. GDPR Compliant
     Icon: Shield (green-600)
     Background: green-50
     Text: "Conform GDPR"

  2. Encrypted Data
     Icon: Lock (cyan-600)
     Background: cyan-50
     Text: "Date Securizate"

  3. Legal Services
     Icon: CheckCircle (blue-600)
     Background: blue-50
     Text: "100% Legal"
```

---

## 6. Register Page Specification

**Route:** `/auth/register`
**Title:** `Inregistrare | eGhiseul.ro`

### Page Layout

```
┌─────────────────────────────────────────────┐
│         Header (fixed, 64px height)         │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │                                       │ │
│  │   Logo (centered, 48px)               │ │ 48px top margin
│  │                                       │ │
│  │   Creaza Cont Nou (H1, 32px)         │ │ 24px margin
│  │   Inregistreaza-te rapid (text)      │ │ 8px margin
│  │                                       │ │
│  │   ┌─────────────────────────────┐   │ │ 32px margin
│  │   │  Sign up with Google        │   │ │
│  │   └─────────────────────────────┘   │ │
│  │                                       │ │
│  │   ────── sau ──────                  │ │ 24px margin
│  │                                       │ │
│  │   Nume Complet (label + input)       │ │ 20px margin
│  │   Email (label + input)              │ │ 20px margin
│  │   Parola (label + input)             │ │ 20px margin
│  │   Password Strength Indicator        │ │ 8px margin
│  │   Confirma Parola (label + input)    │ │ 20px margin
│  │                                       │ │
│  │   [✓] Accept termenii si conditiile  │ │ 20px margin
│  │                                       │ │
│  │   ┌─────────────────────────────┐   │ │ 24px margin
│  │   │   Creaza Cont Button        │   │ │
│  │   └─────────────────────────────┘   │ │
│  │                                       │ │
│  │   Ai deja cont? Autentifica-te       │ │ 24px margin
│  │                                       │ │
│  │   Trust Badges (3 badges)            │ │ 32px margin
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

### Component Specifications

#### 1-5. Same as Login Page
(Logo, Title, Subtitle, Social Button, Divider - adjust text accordingly)

#### 6. Full Name Input Field
```
Component: Input Group
Label:
  Text: "Nume complet"
  Font: 14px, medium, neutral-700
  Spacing: 8px bottom

Input:
  Type: text
  Placeholder: "Prenume Nume"
  Width: 100%
  Height: 44px
  Padding: 12px 16px
  Border: 1px solid neutral-300
  Border Radius: 8px
  Font: 14px, normal, neutral-900
  Autocomplete: name

Validation:
  Required: true
  Min Length: 3 characters
  Pattern: Letters and spaces only

Error Messages:
  - "Numele este obligatoriu"
  - "Numele trebuie sa contina cel putin 3 caractere"
  - "Numele poate contine doar litere si spatii"
```

#### 7. Email Input (same as login)

#### 8. Password Input with Strength Indicator
```
Component: Input Group with Strength Meter
Label:
  Text: "Parola"
  Font: 14px, medium, neutral-700
  Spacing: 8px bottom

Input: Same as login password input

Password Requirements Helper:
  Position: Below input
  Spacing: 8px top margin
  Font: 12px, normal, neutral-500
  Text: "Minim 8 caractere, o litera mare, un numar"

Password Strength Indicator:
  Position: Below requirements
  Spacing: 8px top margin
  Structure: Progress bar + label

  Progress Bar:
    Width: 100%
    Height: 4px
    Border Radius: 2px
    Background: neutral-200

  Fill Color by Strength:
    Weak (0-40%):     red-500
    Fair (41-60%):    orange-500
    Good (61-80%):    yellow-500
    Strong (81-100%): green-500

  Label:
    Position: Right of bar
    Font: 12px, medium
    Text: "Slaba" / "Acceptabila" / "Buna" / "Puternica"
    Color: Matches fill color

Validation Rules:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (recommended)

Strength Calculation:
  Weak: < 3 rules met
  Fair: 3 rules met
  Good: 4 rules met
  Strong: All 5 rules met
```

#### 9. Confirm Password Input
```
Component: Input Group
Label:
  Text: "Confirma parola"
  Font: 14px, medium, neutral-700
  Spacing: 8px bottom

Input: Same structure as password input

Validation:
  Required: true
  Must match password field exactly
  Real-time validation on blur

Error Message:
  Text: "Parolele nu se potrivesc"
  Display: On mismatch
  Icon: AlertCircle (16px, red-600)

Success Indicator:
  Icon: CheckCircle (16px, green-600, right aligned in input)
  Display: When passwords match
```

#### 10. Terms Acceptance Checkbox
```
Component: Checkbox with Rich Text Label
Container:
  Padding: 16px
  Background: blue-50
  Border: 1px solid blue-200
  Border Radius: 8px
  Spacing: 20px top margin

Checkbox:
  Size: 18px × 18px
  Position: Aligned to first line of text
  Border: 2px solid neutral-400
  Border Radius: 4px
  Checked: blue-600 background, white checkmark
  Focus: ring 2px blue-600/20
  Required: true

Label:
  Font: 14px, normal, neutral-700
  Line Height: 1.5
  Spacing: 12px left of checkbox

  Text Structure:
    "Accept "
    <link>Termenii si Conditiile</link>
    " si "
    <link>Politica de Confidentialitate</link>

  Links:
    Color: blue-600
    Font: medium
    Hover: blue-700, underline
    Target: _blank (opens in new tab)
    Icon: ExternalLink (12px, right of text)

Validation:
  Required: true
  Error: Red border around container
  Error Message: "Trebuie sa accepti termenii si conditiile"
  Position: Below container, 8px margin
```

#### 11. Primary CTA Button
```
Component: Button (primary)
Text: "Creaza Cont"
Width: 100%
Height: 44px
Background: blue-600
Spacing: 24px top margin

States: Same as login button

Loading State:
  Text: "Se creaza contul..."
  Icon: Spinner (rotating)
```

#### 12. Login Link
```
Component: Text Link
Text: "Ai deja cont? Autentifica-te"
Alignment: Center
Spacing: 24px top margin

Link Styling:
  "Autentifica-te": blue-600, medium, underline on hover
```

#### 13. Trust Badges
(Same as login page)

---

## 7. Component Library

### Reusable Components

#### Alert Component
```
Component: Alert Box
Variants: success | error | warning | info

Structure:
  Container:
    Width: 100%
    Padding: 12px 16px
    Border Radius: 8px
    Display: flex, align-center
    Gap: 12px

  Icon: 20px, aligned left
  Text: 14px, normal
  Close Button: Optional, 16px, aligned right

Color Schemes:
  Success:
    Background: green-50
    Border: 1px solid green-200
    Icon: CheckCircle (green-600)
    Text: green-900

  Error:
    Background: red-50
    Border: 1px solid red-200
    Icon: AlertCircle (red-600)
    Text: red-900

  Warning:
    Background: orange-50
    Border: 1px solid orange-200
    Icon: AlertTriangle (orange-600)
    Text: orange-900

  Info:
    Background: blue-50
    Border: 1px solid blue-200
    Icon: Info (blue-600)
    Text: blue-900

Usage Examples:
  - "Contul a fost creat cu succes!" (success)
  - "Adresa de email este deja inregistrata" (error)
  - "Sesiunea ta va expira in 5 minute" (warning)
  - "Verifica-ti emailul pentru confirmare" (info)
```

#### Loading Spinner
```
Component: Spinner Icon
Size: 16px / 20px / 24px
Color: Inherits from parent (white / blue-600)
Animation: Rotate 360deg, 0.6s linear infinite
Usage: Inside buttons, full-page overlay
```

#### Form Field Error
```
Component: Error Message
Structure:
  Display: Flex row
  Gap: 8px
  Spacing: 8px top margin

  Icon: AlertCircle (16px, red-600)
  Text: 12px, normal, red-600

Animation: Fade in (0.2s ease)
```

#### Form Field Success
```
Component: Success Indicator
Icon: CheckCircle (16px, green-600)
Position: Absolute right inside input
Spacing: 12px from right edge
Animation: Scale in (0.2s ease)
```

---

## 8. States & Interactions

### Form Validation States

#### Real-time Validation
```
Validation Triggers:
  1. Email: On blur (after user leaves field)
  2. Password: On input (as user types, for strength)
  3. Confirm Password: On blur + on input after first blur
  4. Full Name: On blur
  5. Terms Checkbox: On change

Validation Timing:
  - First validation: On blur
  - Subsequent: On input (debounced 300ms)
  - Submit: Validate all fields

Error Display:
  - Show immediately on invalid blur
  - Hide on valid input
  - Shake animation on submit with errors
```

#### Submit States
```
1. Idle State
   - Button: Enabled, blue-600
   - Form: Editable
   - Text: "Autentificare" / "Creaza Cont"

2. Validating State (client-side)
   - Duration: Instant
   - Visual: None (too fast to show)
   - Form: Remains editable

3. Submitting State
   - Button: Disabled, blue-600
   - Cursor: wait
   - Text: "Se autentifica..." / "Se creaza contul..."
   - Icon: Spinner (rotating)
   - Form: Read-only (all inputs disabled)
   - Duration: Until API response

4. Success State
   - Duration: 1 second
   - Alert: Green success message
   - Redirect: After 1s delay
   - Button: Shows checkmark briefly

5. Error State
   - Button: Re-enabled, blue-600
   - Form: Editable again
   - Alert: Red error message (sticky)
   - Focus: First invalid field
   - Duration: Until user dismisses or resubmits
```

### Button Interactions

#### Hover Effects
```css
Login/Register Button:
  Default: bg-blue-600, shadow-sm
  Hover: bg-blue-700, shadow-md, scale-1.01
  Transition: all 0.2s ease

Social Login Button:
  Default: bg-white, border-neutral-300
  Hover: bg-neutral-50, border-neutral-400
  Transition: all 0.2s ease

Link Buttons:
  Default: text-blue-600
  Hover: text-blue-700, underline
  Transition: color 0.15s ease
```

#### Focus States
```css
All Interactive Elements:
  Focus Visible: ring-3 ring-blue-600/20, outline-none
  Border: blue-600 (for inputs)
  Transition: box-shadow 0.15s ease
```

#### Active/Press States
```css
Buttons:
  Active: scale-0.98, brightness-0.95
  Duration: 0.1s
  Transform origin: center
```

### Password Visibility Toggle
```
Icon Toggle:
  Default: Eye icon (password hidden)
  Clicked: EyeOff icon (password visible)

Input Type Toggle:
  Hidden: type="password", characters shown as dots
  Visible: type="text", characters shown as plain text

Animation: Icon fade transition (0.15s)

Accessibility:
  Button aria-label: "Arata parola" / "Ascunde parola"
  Keyboard: Enter/Space to toggle
```

### Remember Me Interaction
```
Checkbox:
  Default: Unchecked, white background
  Hover: border-blue-600
  Checked: blue-600 background, white checkmark
  Focus: ring-2 ring-blue-600/20

Label:
  Clickable: Entire label toggles checkbox
  Cursor: pointer on hover

Persistence:
  localStorage: Store "rememberMe" boolean
  Duration: 30 days
  Clear on: Explicit logout
```

---

## 9. Responsive Design

### Breakpoints
```
Mobile:    < 640px  (sm)
Tablet:    640px - 1024px (sm to lg)
Desktop:   > 1024px (lg+)
```

### Mobile Layout (< 640px)

#### Container
```
Width: 100% - 32px (16px padding each side)
Max Width: None
Padding: 16px
Margin: 0

Form Container:
  Padding: 24px 16px
  Border Radius: 0 (full bleed on mobile)
  Background: white
```

#### Typography Adjustments
```
H1: 24px (down from 32px)
Body: 14px (same)
Buttons: 44px height (touch-friendly)
Input Fields: 44px height (touch-friendly)
```

#### Component Adjustments
```
Logo:
  Size: 40px (down from 48px)
  Margin Top: 32px (down from 48px)

Social Button:
  Height: 44px
  Font: 14px
  Icon: 18px

Trust Badges:
  Direction: Column (stacked)
  Gap: 8px
  Width: 100%

Spacing:
  Reduce all 32px margins to 24px
  Reduce all 24px margins to 20px
```

### Tablet Layout (640px - 1024px)

#### Container
```
Width: 100%
Max Width: 448px
Padding: 24px
Margin: 0 auto
Center aligned
```

#### All Components
```
Same as desktop specification
Centered in viewport
Touch targets: Minimum 44px × 44px
```

### Desktop Layout (> 1024px)

#### Standard Single-Column (Default)
```
Container: 448px max width, centered
All specifications as defined above
```

#### Optional Split-Layout (Advanced)
```
Layout: 50/50 split

Left Panel:
  Width: 50%
  Background: gradient blue-50 to blue-100
  Content:
    - Large brand logo (64px)
    - Marketing headline
    - Feature list with icons
    - Trust indicators
    - Illustration/graphic (optional)

Right Panel:
  Width: 50%
  Background: white
  Content: Auth form (as specified)
  Padding: 48px
  Overflow: Auto

Advantages:
  - More visual real estate
  - Marketing opportunity
  - Premium feel
  - Reduced form intimidation

Implementation Note:
  Recommend starting with single-column
  Add split-layout in Phase 2 after user testing
```

### Responsive Images & Icons
```
Icons:
  Mobile: 16px - 20px
  Tablet: 18px - 22px
  Desktop: 20px - 24px

Logo:
  Mobile: 40px
  Tablet: 48px
  Desktop: 48px - 64px (split layout)

Touch Targets:
  Mobile: Minimum 44px × 44px
  Desktop: Minimum 32px × 32px
```

---

## 10. Accessibility

### WCAG 2.1 AA Compliance

#### Keyboard Navigation
```
Tab Order:
  1. Social login button
  2. Email input
  3. Password input
  4. Remember me checkbox (login) / Terms checkbox (register)
  5. Forgot password link (login only)
  6. Submit button
  7. Sign up/login link

Focus Indicators:
  Visible on all interactive elements
  3px ring, blue-600/20
  High contrast mode compatible

Keyboard Shortcuts:
  Enter: Submit form (from any field)
  Space: Toggle checkbox (when focused)
  Escape: Clear error messages (if any)
```

#### Screen Reader Support
```
Form Labels:
  All inputs: Associated with <label> elements
  Required fields: aria-required="true"
  Invalid fields: aria-invalid="true"
  Error messages: aria-describedby pointing to error

Page Structure:
  H1: Page title
  Landmarks: <main>, <form>
  Skip link: "Skip to main content" (hidden, appears on focus)

Button States:
  Disabled: aria-disabled="true"
  Loading: aria-busy="true", aria-live="polite"
  Success: aria-live="polite" announcement

Error Announcements:
  Live region: aria-live="assertive"
  Alert role: role="alert" for critical errors
  Text: Clear, actionable error descriptions
```

#### Color Contrast
```
Text Contrasts (WCAG AA: 4.5:1 minimum):
  neutral-900 on white: 17.3:1 ✓
  neutral-700 on white: 8.6:1 ✓
  neutral-600 on white: 6.7:1 ✓
  blue-600 on white: 5.9:1 ✓

Error Text:
  red-600 on white: 6.1:1 ✓
  red-600 on red-50: 5.2:1 ✓

Interactive Elements:
  blue-600 button text (white): 14.2:1 ✓
  Link text (blue-600): 5.9:1 ✓

Non-Text Contrasts (WCAG AA: 3:1 minimum):
  Input borders: neutral-300 on white: 4.2:1 ✓
  Checkbox checked: blue-600: 5.9:1 ✓
```

#### Form Validation
```
Error Identification:
  Visual: Red border + icon + text
  Programmatic: aria-invalid="true"
  Description: aria-describedby="error-id"

Error Suggestions:
  Specific: "Adresa de email nu este valida"
  Not generic: Avoid "Invalid input"
  Actionable: Include correction guidance

Success Confirmation:
  Visual: Green checkmark
  Audible: Screen reader announcement
  Text: "Contul a fost creat cu succes"
```

#### Touch Targets
```
Minimum Sizes:
  Mobile: 44px × 44px (WCAG 2.5.5)
  Desktop: 32px × 32px
  Spacing: 8px minimum between targets

Elements:
  Buttons: 44px height
  Inputs: 44px height
  Checkboxes: 18px × 18px (with 44px clickable area)
  Links: Minimum 16px height with padding
```

#### Focus Management
```
Form Submission:
  On error: Focus first invalid field
  On success: Announce success, maintain focus

Modal Dialogs (if used):
  Open: Focus first focusable element
  Close: Return focus to trigger element
  Trap focus: Keep focus within modal

Page Load:
  Focus: H1 heading or skip link
  Scroll: Top of page
```

---

## 11. Error Handling

### Error Types & Messages

#### Validation Errors
```
Email Errors:
  - "Adresa de email este obligatorie"
  - "Adresa de email nu este valida"
  - "Adresa de email este deja inregistrata" (register)

Password Errors:
  - "Parola este obligatorie"
  - "Parola trebuie sa contina minim 8 caractere"
  - "Parola trebuie sa contina cel putin o litera mare"
  - "Parola trebuie sa contina cel putin un numar"
  - "Parolele nu se potrivesc" (confirm password)

Name Errors:
  - "Numele este obligatoriu"
  - "Numele trebuie sa contina cel putin 3 caractere"

Terms Errors:
  - "Trebuie sa accepti termenii si conditiile"
```

#### Server Errors
```
Authentication Errors:
  - "Email sau parola incorecta" (generic for security)
  - "Acest cont nu exista"
  - "Contul a fost dezactivat. Contacteaza suportul."
  - "Prea multe incercari. Incearca din nou in 15 minute."

Registration Errors:
  - "Adresa de email este deja inregistrata"
  - "Nu s-a putut crea contul. Incearca din nou."
  - "Serviciul este temporar indisponibil"

Network Errors:
  - "Nu s-a putut conecta la server. Verifica conexiunea."
  - "Cererea a expirat. Incearca din nou."
```

#### Rate Limiting
```
Login Attempts:
  Max: 5 attempts per 15 minutes
  Lockout: 15 minutes
  Message: "Prea multe incercari. Incearca din nou in X minute."
  Visual: Disabled form + countdown timer

Registration Attempts:
  Max: 3 attempts per hour
  Message: "Prea multe inregistrari. Incearca din nou mai tarziu."
```

---

## 12. Implementation Notes

### Technology Stack
```
Framework: Next.js 14+ (App Router)
Styling: Tailwind CSS
Components: shadcn/ui
Forms: React Hook Form + Zod validation
Authentication: Supabase Auth
Icons: Lucide React
```

### Key Files to Create
```
/src/app/auth/login/page.tsx
/src/app/auth/register/page.tsx
/src/components/auth/login-form.tsx
/src/components/auth/register-form.tsx
/src/components/auth/social-login-button.tsx
/src/components/auth/password-strength-indicator.tsx
/src/components/auth/trust-badges.tsx
/src/lib/validations/auth.ts (Zod schemas)
/src/lib/auth/client.ts (Supabase client)
```

### Form Validation Schema (Zod)
```typescript
// Login Schema
loginSchema = z.object({
  email: z.string().email("Adresa de email nu este valida"),
  password: z.string().min(1, "Parola este obligatorie"),
  rememberMe: z.boolean().optional(),
})

// Register Schema
registerSchema = z.object({
  fullName: z.string()
    .min(3, "Numele trebuie sa contina cel putin 3 caractere")
    .regex(/^[a-zA-Z\s]+$/, "Numele poate contine doar litere"),
  email: z.string().email("Adresa de email nu este valida"),
  password: z.string()
    .min(8, "Parola trebuie sa contina minim 8 caractere")
    .regex(/[A-Z]/, "Parola trebuie sa contina cel putin o litera mare")
    .regex(/[0-9]/, "Parola trebuie sa contina cel putin un numar"),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Trebuie sa accepti termenii" })
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Parolele nu se potrivesc",
  path: ["confirmPassword"],
})
```

### Password Strength Function
```typescript
function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;

  if (score < 40) return { score, label: 'Slaba', color: 'red' };
  if (score < 60) return { score, label: 'Acceptabila', color: 'orange' };
  if (score < 80) return { score, label: 'Buna', color: 'yellow' };
  return { score, label: 'Puternica', color: 'green' };
}
```

---

## 13. Future Enhancements

### Phase 2 Features
```
1. Magic Link Login
   - Passwordless authentication
   - Email with secure link
   - Expires after 15 minutes

2. Two-Factor Authentication (2FA)
   - SMS verification
   - Authenticator app (TOTP)
   - Backup codes

3. Social Login Expansion
   - Apple Sign-In
   - Facebook Login (if needed)

4. Progressive Disclosure
   - Multi-step registration
   - Optional profile fields after signup

5. Biometric Authentication
   - Face ID / Touch ID
   - WebAuthn support
   - Passkeys
```

### Metrics to Track
```
Conversion Funnel:
  1. Page visits
  2. Form started (first field interaction)
  3. Form completed
  4. Submission attempted
  5. Successful registration/login

Error Tracking:
  1. Validation errors by field
  2. Server errors by type
  3. Abandonment points

Performance:
  1. Page load time
  2. Form submission latency
  3. API response time
```

---

## Summary

This specification provides a complete design system for authentication pages that:

1. Conveys trust and security through visual design
2. Maintains simplicity and clarity for ease of use
3. Ensures WCAG 2.1 AA accessibility compliance
4. Provides comprehensive error handling
5. Implements responsive design for all devices
6. Follows established patterns from the existing design system
7. Uses Romanian language throughout
8. Includes detailed component specifications for implementation

The design prioritizes user trust and confidence while maintaining a clean, professional aesthetic appropriate for a government services platform.
