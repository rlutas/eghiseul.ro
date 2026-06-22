# Sprint 0: Project Setup

**Status:** ✅ Complet
**Durată:** 1 zi
**Data:** 2025-12-16

---

## Obiective

- [x] Inițializare proiect Next.js 14
- [x] Configurare TypeScript, Tailwind CSS
- [x] Setup shadcn/ui design system
- [x] Instalare dependențe (Supabase, AWS, Stripe)
- [x] Creare structură foldere
- [x] Setup Git și push GitHub

---

## Tech Stack Instalat

| Categorie | Tehnologie | Versiune |
|-----------|------------|----------|
| Framework | Next.js | 14+ |
| Language | TypeScript | 5+ |
| Styling | Tailwind CSS | 4+ |
| UI Components | shadcn/ui | latest |
| Database | Supabase | latest |
| Storage | AWS S3 SDK | latest |
| Payments | Stripe | latest |
| Forms | react-hook-form + zod | latest |
| State | TanStack Query | latest |

---

## Structură Proiect Creată

```
eghiseul.ro/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth routes
│   │   ├── (customer)/       # Customer routes
│   │   ├── (admin)/          # Admin routes
│   │   ├── services/         # Service pages
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── ui/               # shadcn components
│   │   ├── forms/            # Form components
│   │   ├── order/            # Order flow
│   │   ├── kyc/              # KYC components
│   │   ├── admin/            # Admin components
│   │   └── shared/           # Shared components
│   ├── lib/
│   │   ├── supabase/         # Supabase clients
│   │   ├── aws/              # AWS utilities
│   │   └── stripe.ts         # Stripe client
│   ├── hooks/                # Custom hooks
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── docs/                     # Documentation
├── public/                   # Static assets
└── supabase/                 # DB migrations
```

---

## Componente shadcn Instalate

| Component | Folosit pentru |
|-----------|----------------|
| button | Acțiuni, CTA |
| input | Form inputs |
| label | Form labels |
| card | Containers |
| form | Form management |
| select | Dropdowns |
| checkbox | Opțiuni |
| textarea | Text lung |
| dialog | Modals |
| dropdown-menu | Menus |
| avatar | User avatars |
| badge | Status tags |
| separator | Dividers |
| tabs | Tab navigation |
| table | Data tables |
| skeleton | Loading states |
| sonner | Toast notifications |

---

## Utilities Create

### CNP Validator (`src/utils/cnp-validator.ts`)
- Validare CNP românesc (13 cifre)
- Extragere: sex, data nașterii, județ
- Verificare cifră de control

### Price Calculator (`src/utils/price-calculator.ts`)
- Calcul preț dinamic bazat pe opțiuni
- Breakdown detaliat al prețului
- Formatare RON

---

## Environment Variables

Fișier: `.env.example` → `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AWS
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

---

## Git Commits

| Commit | Descriere |
|--------|-----------|
| `f085319` | Initial project setup with Next.js 14, Supabase, and shadcn/ui |

---

## Next Steps

→ **Sprint 1: Auth & Users**
- Configurare Supabase Auth
- Setup 2FA
- Creare pagini login/register
- Protected routes
