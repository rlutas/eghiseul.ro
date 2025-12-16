# Component Color Usage Guide

Quick reference for applying eGhiseul.ro colors to common UI components.

---

## Buttons

### Primary Button (Gold CTA)
```tsx
<button className="
  bg-primary-500
  text-secondary-900
  hover:bg-primary-600
  active:bg-primary-700
  focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  px-6 py-3
  rounded-lg
  font-semibold
  transition-colors
">
  Comandă Acum
</button>
```

**CSS Variables Alternative:**
```css
.button-primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-fg);
}

.button-primary:hover {
  background: var(--button-primary-hover);
}
```

---

### Secondary Button (Outline)
```tsx
<button className="
  bg-transparent
  border-2 border-primary-500
  text-secondary-900
  hover:bg-primary-50
  active:bg-primary-100
  focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  px-6 py-3
  rounded-lg
  font-semibold
  transition-colors
">
  Vezi Detalii
</button>
```

---

### Ghost Button
```tsx
<button className="
  bg-transparent
  text-primary-700
  hover:bg-primary-100
  active:bg-primary-200
  focus:ring-2 focus:ring-primary-500
  px-4 py-2
  rounded-lg
  font-medium
  transition-colors
">
  Află Mai Mult
</button>
```

---

### Destructive Button
```tsx
<button className="
  bg-error-500
  text-white
  hover:bg-error-600
  active:bg-error-700
  focus:ring-2 focus:ring-error-500 focus:ring-offset-2
  px-6 py-3
  rounded-lg
  font-semibold
  transition-colors
">
  Șterge
</button>
```

---

### Disabled Button
```tsx
<button
  disabled
  className="
    bg-neutral-300
    text-neutral-500
    cursor-not-allowed
    px-6 py-3
    rounded-lg
    font-semibold
  "
>
  Indisponibil
</button>
```

---

## Cards

### Service Card (White with Gold Accent)
```tsx
<div className="
  bg-card
  border border-neutral-200
  border-l-4 border-l-primary-500
  rounded-2xl
  p-6
  shadow-[0_6px_20px_rgba(6,16,31,0.08)]
  hover:shadow-[0_10px_30px_rgba(6,16,31,0.12)]
  transition-shadow
">
  {/* Icon container */}
  <div className="bg-primary-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
    <Icon className="w-7 h-7 text-primary-600" />
  </div>

  {/* Title */}
  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
    Cazier Fiscal
  </h3>

  {/* Description */}
  <p className="text-muted-foreground text-sm mb-4">
    Obține certificatul de cazier fiscal rapid și online, fără deplasări.
  </p>

  {/* Footer */}
  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
    <span className="text-2xl font-bold text-secondary-900">49 RON</span>
    <button className="bg-primary-500 text-secondary-900 px-4 py-2 rounded-lg hover:bg-primary-600">
      Comandă
    </button>
  </div>
</div>
```

---

### Info Card
```tsx
<div className="
  bg-card
  border border-neutral-200
  rounded-2xl
  p-6
">
  <h4 className="text-lg font-semibold text-secondary-900 mb-2">
    Informații Importante
  </h4>
  <p className="text-muted-foreground">
    Lorem ipsum dolor sit amet...
  </p>
</div>
```

---

### Featured Card (Gold Background)
```tsx
<div className="
  bg-primary-500
  text-secondary-900
  rounded-2xl
  p-6
  shadow-[0_10px_30px_rgba(6,16,31,0.12)]
">
  <span className="text-sm font-semibold uppercase tracking-wide">
    Cel mai popular
  </span>
  <h3 className="text-2xl font-bold mt-2">
    Pachet Premium
  </h3>
  <p className="mt-2 opacity-90">
    Toate serviciile incluse
  </p>
</div>
```

---

## Form Elements

### Text Input
```tsx
<div className="space-y-2">
  <label htmlFor="email" className="block text-sm font-medium text-secondary-900">
    Email
  </label>
  <input
    id="email"
    type="email"
    className="
      w-full
      border border-input
      bg-background
      text-foreground
      placeholder:text-muted-foreground
      focus:ring-2 focus:ring-ring focus:border-transparent
      rounded-lg
      px-4 py-2.5
      transition-all
    "
    placeholder="nume@exemplu.ro"
  />
</div>
```

---

### Text Input with Error
```tsx
<div className="space-y-2">
  <label htmlFor="email" className="block text-sm font-medium text-secondary-900">
    Email *
  </label>
  <input
    id="email"
    type="email"
    className="
      w-full
      border-2 border-error-500
      bg-background
      text-foreground
      placeholder:text-muted-foreground
      focus:ring-2 focus:ring-error-500 focus:border-error-500
      rounded-lg
      px-4 py-2.5
    "
    placeholder="nume@exemplu.ro"
    aria-invalid="true"
  />
  <p className="text-sm text-error-600">
    Vă rugăm introduceți o adresă de email validă.
  </p>
</div>
```

---

### Select Dropdown
```tsx
<div className="space-y-2">
  <label htmlFor="service" className="block text-sm font-medium text-secondary-900">
    Selectează serviciul
  </label>
  <select
    id="service"
    className="
      w-full
      border border-input
      bg-background
      text-foreground
      focus:ring-2 focus:ring-ring focus:border-transparent
      rounded-lg
      px-4 py-2.5
    "
  >
    <option>Cazier Fiscal</option>
    <option>Extras Carte Funciară</option>
    <option>Certificat Naștere</option>
  </select>
</div>
```

---

### Checkbox
```tsx
<div className="flex items-start gap-3">
  <input
    id="terms"
    type="checkbox"
    className="
      w-5 h-5 mt-0.5
      border-2 border-neutral-400
      rounded
      text-primary-500
      focus:ring-2 focus:ring-primary-500
    "
  />
  <label htmlFor="terms" className="text-sm text-secondary-900">
    Accept{' '}
    <a href="/termeni" className="text-primary-700 underline hover:text-primary-800">
      Termenii și condițiile
    </a>
  </label>
</div>
```

---

### Radio Buttons
```tsx
<fieldset className="space-y-3">
  <legend className="text-sm font-medium text-secondary-900 mb-3">
    Modalitate de livrare
  </legend>

  <div className="flex items-center gap-3">
    <input
      id="email-delivery"
      type="radio"
      name="delivery"
      className="
        w-5 h-5
        border-2 border-neutral-400
        text-primary-500
        focus:ring-2 focus:ring-primary-500
      "
    />
    <label htmlFor="email-delivery" className="text-sm text-secondary-900">
      Email (gratuit)
    </label>
  </div>

  <div className="flex items-center gap-3">
    <input
      id="courier-delivery"
      type="radio"
      name="delivery"
      className="
        w-5 h-5
        border-2 border-neutral-400
        text-primary-500
        focus:ring-2 focus:ring-primary-500
      "
    />
    <label htmlFor="courier-delivery" className="text-sm text-secondary-900">
      Curier (+15 RON)
    </label>
  </div>
</fieldset>
```

---

## Badges & Tags

### Status Badge - Success
```tsx
<span className="
  inline-flex items-center gap-1.5
  bg-success-100
  text-success-700
  border border-success-500
  px-3 py-1
  rounded-full
  text-sm font-medium
">
  <CheckCircle className="w-4 h-4" />
  Finalizat
</span>
```

---

### Status Badge - Pending
```tsx
<span className="
  inline-flex items-center gap-1.5
  bg-warning-100
  text-warning-700
  border border-warning-500
  px-3 py-1
  rounded-full
  text-sm font-medium
">
  <Clock className="w-4 h-4" />
  În Așteptare
</span>
```

---

### Status Badge - Error
```tsx
<span className="
  inline-flex items-center gap-1.5
  bg-error-100
  text-error-700
  border border-error-500
  px-3 py-1
  rounded-full
  text-sm font-medium
">
  <XCircle className="w-4 h-4" />
  Respins
</span>
```

---

### Status Badge - Processing
```tsx
<span className="
  inline-flex items-center gap-1.5
  bg-info-100
  text-info-700
  border border-info-500
  px-3 py-1
  rounded-full
  text-sm font-medium
">
  <Loader className="w-4 h-4 animate-spin" />
  În Procesare
</span>
```

---

### Category Tag
```tsx
<span className="
  inline-flex items-center
  bg-neutral-100
  text-neutral-700
  px-3 py-1
  rounded-md
  text-sm
">
  Documente
</span>
```

---

### Gold Accent Tag
```tsx
<span className="
  inline-flex items-center
  bg-primary-100
  text-primary-700
  border border-primary-500
  px-3 py-1
  rounded-md
  text-sm font-medium
">
  Premium
</span>
```

---

## Alerts & Notifications

### Success Alert
```tsx
<div className="
  bg-success-100
  border-l-4 border-l-success-500
  p-4
  rounded-lg
">
  <div className="flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
    <div>
      <h4 className="font-semibold text-success-800">Comandă plasată cu succes!</h4>
      <p className="text-sm text-success-700 mt-1">
        Veți primi un email de confirmare în câteva minute.
      </p>
    </div>
  </div>
</div>
```

---

### Warning Alert
```tsx
<div className="
  bg-warning-100
  border-l-4 border-l-warning-500
  p-4
  rounded-lg
">
  <div className="flex items-start gap-3">
    <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
    <div>
      <h4 className="font-semibold text-warning-800">Atenție</h4>
      <p className="text-sm text-warning-700 mt-1">
        Documentul necesită verificare suplimentară.
      </p>
    </div>
  </div>
</div>
```

---

### Error Alert
```tsx
<div className="
  bg-error-100
  border-l-4 border-l-error-500
  p-4
  rounded-lg
">
  <div className="flex items-start gap-3">
    <XCircle className="w-5 h-5 text-error-600 mt-0.5" />
    <div>
      <h4 className="font-semibold text-error-800">Eroare</h4>
      <p className="text-sm text-error-700 mt-1">
        A apărut o eroare. Vă rugăm încercați din nou.
      </p>
    </div>
  </div>
</div>
```

---

### Info Alert
```tsx
<div className="
  bg-info-100
  border-l-4 border-l-info-500
  p-4
  rounded-lg
">
  <div className="flex items-start gap-3">
    <Info className="w-5 h-5 text-info-600 mt-0.5" />
    <div>
      <h4 className="font-semibold text-info-800">Informație</h4>
      <p className="text-sm text-info-700 mt-1">
        Procesarea durează în medie 2-3 zile lucrătoare.
      </p>
    </div>
  </div>
</div>
```

---

## Navigation

### Top Navigation
```tsx
<nav className="bg-card border-b border-neutral-200">
  <div className="max-w-[1100px] mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Logo className="text-primary-500" />
        <span className="text-xl font-bold text-secondary-900">
          eGhiseul.ro
        </span>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <a href="/servicii" className="text-secondary-900 hover:text-primary-700 font-medium">
          Servicii
        </a>
        <a href="/despre" className="text-secondary-900 hover:text-primary-700 font-medium">
          Despre
        </a>
        <a href="/contact" className="text-secondary-900 hover:text-primary-700 font-medium">
          Contact
        </a>
        <button className="bg-primary-500 text-secondary-900 px-4 py-2 rounded-lg hover:bg-primary-600">
          Contul Meu
        </button>
      </div>
    </div>
  </div>
</nav>
```

---

### Breadcrumbs
```tsx
<nav className="flex items-center gap-2 text-sm">
  <a href="/" className="text-muted-foreground hover:text-primary-700">
    Acasă
  </a>
  <ChevronRight className="w-4 h-4 text-neutral-400" />
  <a href="/servicii" className="text-muted-foreground hover:text-primary-700">
    Servicii
  </a>
  <ChevronRight className="w-4 h-4 text-neutral-400" />
  <span className="text-secondary-900 font-medium">
    Cazier Fiscal
  </span>
</nav>
```

---

## Tables

### Data Table
```tsx
<table className="w-full border-collapse">
  <thead>
    <tr className="border-b-2 border-neutral-200">
      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-900">
        Comandă
      </th>
      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-900">
        Serviciu
      </th>
      <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-900">
        Status
      </th>
      <th className="text-right py-3 px-4 text-sm font-semibold text-secondary-900">
        Preț
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-neutral-200 hover:bg-neutral-50">
      <td className="py-3 px-4 text-sm text-secondary-900">#12345</td>
      <td className="py-3 px-4 text-sm text-secondary-900">Cazier Fiscal</td>
      <td className="py-3 px-4">
        <span className="bg-success-100 text-success-700 px-2 py-1 rounded-full text-xs">
          Finalizat
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-right font-semibold text-secondary-900">
        49 RON
      </td>
    </tr>
  </tbody>
</table>
```

---

## Modals & Dialogs

### Modal
```tsx
<div className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm flex items-center justify-center p-4">
  <div className="
    bg-card
    rounded-2xl
    shadow-[0_20px_50px_rgba(6,16,31,0.15)]
    max-w-md w-full
    p-6
  ">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-secondary-900">
        Confirmă Comanda
      </h2>
      <button className="text-neutral-500 hover:text-secondary-900">
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Content */}
    <p className="text-muted-foreground mb-6">
      Ești sigur că vrei să plasezi această comandă?
    </p>

    {/* Actions */}
    <div className="flex gap-3">
      <button className="flex-1 bg-neutral-200 text-secondary-900 py-2 rounded-lg hover:bg-neutral-300">
        Anulează
      </button>
      <button className="flex-1 bg-primary-500 text-secondary-900 py-2 rounded-lg hover:bg-primary-600">
        Confirmă
      </button>
    </div>
  </div>
</div>
```

---

## Loading States

### Skeleton Card
```tsx
<div className="bg-card border border-neutral-200 rounded-2xl p-6 animate-pulse">
  <div className="bg-neutral-200 w-14 h-14 rounded-lg mb-4" />
  <div className="bg-neutral-200 h-6 w-3/4 rounded mb-2" />
  <div className="bg-neutral-200 h-4 w-full rounded mb-1" />
  <div className="bg-neutral-200 h-4 w-2/3 rounded mb-4" />
  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
    <div className="bg-neutral-200 h-8 w-20 rounded" />
    <div className="bg-neutral-200 h-10 w-24 rounded-lg" />
  </div>
</div>
```

---

### Spinner
```tsx
<div className="flex items-center justify-center">
  <div className="
    w-8 h-8
    border-4 border-neutral-200
    border-t-primary-500
    rounded-full
    animate-spin
  " />
</div>
```

---

## Empty States

### No Results
```tsx
<div className="text-center py-12">
  <div className="bg-neutral-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
    <Search className="w-8 h-8 text-neutral-400" />
  </div>
  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
    Nu au fost găsite rezultate
  </h3>
  <p className="text-muted-foreground">
    Încercați să modificați criteriile de căutare.
  </p>
</div>
```

---

## Progress Indicators

### Progress Bar
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between text-sm">
    <span className="text-secondary-900 font-medium">Progres</span>
    <span className="text-muted-foreground">60%</span>
  </div>
  <div className="bg-neutral-200 h-2 rounded-full overflow-hidden">
    <div className="bg-primary-500 h-full w-[60%] rounded-full" />
  </div>
</div>
```

---

### Step Indicator
```tsx
<div className="flex items-center justify-between">
  {/* Step 1 - Completed */}
  <div className="flex flex-col items-center gap-2">
    <div className="w-10 h-10 rounded-full bg-success-500 text-white flex items-center justify-center font-semibold">
      ✓
    </div>
    <span className="text-xs text-success-700">Comandă</span>
  </div>

  <div className="flex-1 h-1 bg-success-500 mx-2" />

  {/* Step 2 - Current */}
  <div className="flex flex-col items-center gap-2">
    <div className="w-10 h-10 rounded-full bg-primary-500 text-secondary-900 flex items-center justify-center font-semibold">
      2
    </div>
    <span className="text-xs text-primary-700">Plată</span>
  </div>

  <div className="flex-1 h-1 bg-neutral-200 mx-2" />

  {/* Step 3 - Upcoming */}
  <div className="flex flex-col items-center gap-2">
    <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center font-semibold">
      3
    </div>
    <span className="text-xs text-neutral-600">Confirmare</span>
  </div>
</div>
```

---

**Last Updated:** 2025-12-16
