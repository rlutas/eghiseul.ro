# eGhiseul.ro - Development Master Plan

**Version:** 1.0
**Last Updated:** 2025-12-15
**Status:** Ready for Development

---

## TECH STACK DEFINITIV

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                     │
│                                                                      │
│   Next.js 14+ (App Router)                                          │
│   - React 18+                                                       │
│   - TypeScript                                                      │
│   - Tailwind CSS                                                    │
│   - shadcn/ui (componente)                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND                                      │
│                                                                      │
│   Supabase (Backend-as-a-Service)                                   │
│   - PostgreSQL database (RLS pentru multi-tenancy)                  │
│   - Authentication (email/password + 2FA TOTP)                      │
│   - Edge Functions (Deno) pentru logică custom                      │
│   - Real-time subscriptions (WebSocket)                             │
│   - Region: EU (Frankfurt)                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         STORAGE                                      │
│                                                                      │
│   AWS S3 (Frankfurt - eu-central-1)                                 │
│   - Contracte și documente legale (10 ani retenție)                │
│   - Documente KYC (CI, selfie, semnătură)                          │
│   - Documente finale pentru clienți                                 │
│   - Server-side encryption (AES-256)                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICII EXTERNE                                  │
│                                                                      │
│   OCR:        AWS Textract (zero retention, GDPR)                   │
│   KYC:        AWS Rekognition (face matching) → Veriff (Phase 2)    │
│   Payments:   Stripe (card, Apple Pay, Google Pay)                  │
│   Invoicing:  SmartBill (e-factura compliant)                       │
│   SMS:        SMSLink.ro (provider românesc)                        │
│   Email:      Resend                                                │
│   Courier:    Fan Courier (RO) + DHL (internațional)               │
│   CUI:        ANAF API (gratis)                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## DOCUMENTAȚIE INDEX

| Document | Locație | Conține | Când să actualizezi |
|----------|---------|---------|---------------------|
| **PRD** | `docs/prd/eghiseul-prd.md` | Cerințe funcționale, personas, features | La modificări de scope/features |
| **Servicii** | `docs/services/README.md` | Catalog 12 servicii | La adăugare/modificare serviciu |
| **Security** | `docs/security-architecture.md` | Arhitectură securitate, encryption | La schimbări de securitate |
| **Legal** | `docs/legal/compliance-research.md` | GDPR, contracte, legi | La cerințe legale noi |
| **Tech Stack** | `docs/TECHNOLOGY_RECOMMENDATIONS.md` | Analiză tehnologii | La schimbări de stack |
| **Feature Analysis** | `docs/analysis/feature-completeness-analysis.md` | Gap analysis vs competitori | La adăugare features noi |
| **Service Flows** | `docs/analysis/service-flows-analysis.md` | Flow-uri servicii | La modificări UX |
| **Security Checklist** | `docs/security-implementation-checklist.md` | Checklist implementare | Pe parcurs dezvoltare |

---

## FAZE DEZVOLTARE

### FAZA 1: MVP (Luni 1-4)

**Obiectiv:** Platformă funcțională cu 3 servicii core

#### Sprint 0: Setup (Săptămâna 1-2)

| Task | Status | Fișiere de creat/modificat |
|------|--------|---------------------------|
| [ ] Setup Next.js 14 project | ⏳ | `package.json`, `next.config.js` |
| [ ] Setup Supabase project (Frankfurt) | ⏳ | `.env.local`, `lib/supabase.ts` |
| [ ] Setup AWS account (eu-central-1) | ⏳ | `.env.local` |
| [ ] Configurare S3 buckets | ⏳ | Bucket: `eghiseul-documents`, `eghiseul-contracts` |
| [ ] Setup Stripe account | ⏳ | `.env.local` |
| [ ] CI/CD cu GitHub Actions | ⏳ | `.github/workflows/` |
| [ ] Design system setup (Tailwind + shadcn) | ⏳ | `tailwind.config.js`, `components/ui/` |

**Buckets S3 necesare:**
```
eghiseul-documents/
├── kyc/                    # CI, selfie, semnătură (șterge după 180 zile)
│   └── {user_id}/
│       └── {order_id}/
├── contracts/              # Contracte semnate (păstrează 10 ani)
│   └── {year}/
│       └── {month}/
├── final-documents/        # Documente finale pentru client
│   └── {order_id}/
└── templates/              # Template-uri contract (public read)
```

#### Sprint 1: Auth & Users (Săptămâna 3-4)

| Task | Status | Componente |
|------|--------|------------|
| [ ] Supabase Auth config | ⏳ | Email/password, magic link |
| [ ] 2FA TOTP setup | ⏳ | Speakeasy, QR code |
| [ ] User profile schema | ⏳ | `profiles` table |
| [ ] Login/Register pages | ⏳ | `app/(auth)/` |
| [ ] Protected routes | ⏳ | `middleware.ts` |
| [ ] Admin role setup | ⏳ | RLS policies |

**Schema DB - Users:**
```sql
-- Profiles (extinde auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  cnp VARCHAR(13),              -- encrypted
  phone VARCHAR(20),
  email VARCHAR(255),
  kyc_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only see own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

#### Sprint 2: Servicii Core (Săptămâna 5-8)

| Task | Status | Servicii |
|------|--------|----------|
| [ ] Schema servicii | ⏳ | `services`, `service_options` tables |
| [ ] Service config (JSON) | ⏳ | Prețuri, câmpuri, opțiuni |
| [ ] Flow 6 pași | ⏳ | Contact → Date → Opțiuni → KYC → Livrare → Plată |
| [ ] Cazier Fiscal | ⏳ | SRV-001 |
| [ ] Extras Carte Funciară | ⏳ | SRV-031 |
| [ ] Certificat Constatator | ⏳ | SRV-030 |

**Schema DB - Services:**
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  requires_kyc BOOLEAN DEFAULT TRUE,
  config JSONB NOT NULL,  -- câmpuri, opțiuni, reguli
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,  -- numerotare automată
  user_id UUID REFERENCES profiles(id),
  service_id UUID REFERENCES services(id),
  status VARCHAR(50) DEFAULT 'pending',
  customer_data JSONB NOT NULL,
  options JSONB,
  delivery_method VARCHAR(50),
  delivery_address JSONB,
  total_price DECIMAL(10,2),
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  stripe_payment_intent VARCHAR(255),
  contract_url TEXT,
  final_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pentru performanță
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

#### Sprint 3: KYC & Documents (Săptămâna 9-10)

| Task | Status | Componente |
|------|--------|------------|
| [ ] Upload CI (front + back) | ⏳ | Dropzone, S3 presigned URL |
| [ ] Upload selfie cu document | ⏳ | Camera capture |
| [ ] Semnătură electronică (canvas) | ⏳ | SignaturePad component |
| [ ] OCR cu AWS Textract | ⏳ | Lambda function |
| [ ] Face matching (Rekognition) | ⏳ | Lambda function |
| [ ] Validare CNP | ⏳ | Custom validation |

**OCR Flow:**
```
1. Client uploadează CI → S3 (encrypted)
2. Lambda trigger → AWS Textract DetectDocumentText
3. Custom parser extrage: CNP, Nume, Data naștere, Valabilitate
4. Validează CNP (algoritm românesc)
5. Salvează date parsate în order.customer_data
6. Șterge imaginea originală din S3 (sau marchează pentru ștergere)
```

#### Sprint 4: Payments & Contracts (Săptămâna 11-12)

| Task | Status | Componente |
|------|--------|------------|
| [ ] Stripe integration | ⏳ | Payment Intent, 3D Secure |
| [ ] Apple Pay / Google Pay | ⏳ | Stripe Payment Request |
| [ ] Calcul preț dinamic | ⏳ | Bazat pe opțiuni selectate |
| [ ] Generare contract PDF | ⏳ | Template + puppeteer/react-pdf |
| [ ] Numerotare automată contract | ⏳ | Nr. {YEAR}-{SEQUENTIAL} |
| [ ] Semnătură pe contract | ⏳ | Embed semnătura din KYC |
| [ ] Stocare contract S3 (10 ani) | ⏳ | Lifecycle policy |
| [ ] SmartBill facturare | ⏳ | API integration |

**Contract Template Variables:**
```json
{
  "contract_number": "2025-00001",
  "date": "15.12.2025",
  "client": {
    "name": "Ion Popescu",
    "cnp": "1850101123456",
    "address": "Str. Example nr. 1, București"
  },
  "service": {
    "name": "Cazier Fiscal",
    "description": "Obținere cazier fiscal...",
    "price": 149.00
  },
  "options": ["urgenta", "traducere_engleza"],
  "total": 299.00,
  "signature_image": "base64...",
  "signature_date": "15.12.2025 14:30"
}
```

#### Sprint 5: Admin Dashboard (Săptămâna 13-14)

| Task | Status | Componente |
|------|--------|------------|
| [ ] Admin layout | ⏳ | Sidebar, header, protected |
| [ ] Lista comenzi (filtre, search) | ⏳ | DataTable, pagination |
| [ ] Detalii comandă | ⏳ | Customer data, KYC docs, timeline |
| [ ] Schimbare status | ⏳ | Dropdown + notificare automată |
| [ ] Upload document final | ⏳ | Pentru client |
| [ ] Statistici basic | ⏳ | Charts, KPIs |

**Status-uri comandă:**
```
pending → processing → document_ready → delivered → completed
                  ↓
              rejected (cu motiv)
```

#### Sprint 6: Notifications & Polish (Săptămâna 15-16)

| Task | Status | Componente |
|------|--------|------------|
| [ ] Email templates | ⏳ | Confirmare, status, document ready |
| [ ] Resend integration | ⏳ | Transactional emails |
| [ ] SMS notificări (optional) | ⏳ | SMSLink.ro |
| [ ] Notificări real-time admin | ⏳ | Supabase Realtime |
| [ ] Error handling global | ⏳ | Error boundaries, toasts |
| [ ] Loading states | ⏳ | Skeletons, spinners |
| [ ] Mobile responsive | ⏳ | Test pe toate device-urile |

---

### FAZA 2: Extended (Luni 5-8)

| Feature | Sprint | Status |
|---------|--------|--------|
| [ ] Restul 9 servicii | S7-S8 | ⏳ |
| [ ] Conturi utilizatori complet | S9 | ⏳ |
| [ ] Livrare tracking | S10 | ⏳ |
| [ ] Multi-language (EN, DE, IT) | S11 | ⏳ |
| [ ] Live chat (Tawk.to) | S11 | ⏳ |
| [ ] API pentru parteneri | S12 | ⏳ |
| [ ] Mobile app (Flutter) | S13-S14 | ⏳ |
| [ ] Loyalty program | S15 | ⏳ |
| [ ] Advanced analytics | S16 | ⏳ |

---

### FAZA 3: Scale (Luni 9-12)

| Feature | Status |
|---------|--------|
| [ ] Migrare storage la S3 complet | ⏳ |
| [ ] CDN (CloudFront) | ⏳ |
| [ ] Caching (Redis via Upstash) | ⏳ |
| [ ] Background jobs (Inngest) | ⏳ |
| [ ] Advanced KYC (Veriff) | ⏳ |
| [ ] White-label pentru parteneri | ⏳ |
| [ ] B2B portal pentru firme | ⏳ |

---

## STRUCTURĂ PROIECT

```
eghiseul.ro/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Routes autentificare
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (customer)/               # Routes customer
│   │   ├── account/
│   │   ├── orders/
│   │   └── kyc/
│   ├── (admin)/                  # Routes admin (protected)
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── services/
│   │   ├── customers/
│   │   └── settings/
│   ├── services/                 # Pagini servicii publice
│   │   ├── [slug]/
│   │   │   └── order/            # Flow comandă
│   ├── api/                      # API routes
│   │   ├── webhooks/
│   │   │   ├── stripe/
│   │   │   └── smartbill/
│   │   └── v1/                   # Partner API
│   ├── layout.tsx
│   └── page.tsx                  # Homepage
│
├── components/
│   ├── ui/                       # shadcn components
│   ├── forms/                    # Form components
│   ├── order/                    # Order flow components
│   ├── kyc/                      # KYC components
│   ├── admin/                    # Admin components
│   └── shared/                   # Shared components
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── admin.ts              # Admin client
│   ├── aws/
│   │   ├── s3.ts                 # S3 operations
│   │   ├── textract.ts           # OCR
│   │   └── rekognition.ts        # Face matching
│   ├── stripe.ts
│   ├── smartbill.ts
│   ├── smslink.ts
│   └── resend.ts
│
├── hooks/                        # Custom hooks
├── types/                        # TypeScript types
├── utils/                        # Utility functions
│   ├── cnp-validator.ts
│   ├── contract-generator.ts
│   └── price-calculator.ts
│
├── supabase/
│   ├── migrations/               # Database migrations
│   └── functions/                # Edge functions
│
├── docs/                         # Documentație (existentă)
├── public/
└── .env.local                    # Environment variables
```

---

## ENVIRONMENT VARIABLES

```env
# App
NEXT_PUBLIC_APP_URL=https://eghiseul.ro

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# AWS
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET_DOCUMENTS=eghiseul-documents
AWS_S3_BUCKET_CONTRACTS=eghiseul-contracts

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SmartBill
SMARTBILL_API_KEY=xxx
SMARTBILL_EMAIL=xxx

# SMS (SMSLink.ro)
SMSLINK_API_KEY=xxx
SMSLINK_SENDER=eGhiseul

# Email (Resend)
RESEND_API_KEY=re_xxx
EMAIL_FROM=comenzi@eghiseul.ro
```

---

## SECURITY CHECKLIST

### Înainte de Launch

| Check | Status | Document |
|-------|--------|----------|
| [ ] HTTPS peste tot | ⏳ | - |
| [ ] CSP headers configurate | ⏳ | `next.config.js` |
| [ ] CORS restricționat | ⏳ | API routes |
| [ ] Rate limiting | ⏳ | Middleware |
| [ ] Input validation (Zod) | ⏳ | Forms, API |
| [ ] SQL injection protected | ⏳ | Supabase RLS |
| [ ] XSS protection | ⏳ | React default |
| [ ] CSRF tokens | ⏳ | Next.js built-in |
| [ ] Secrets în env vars | ⏳ | Vercel/hosting |
| [ ] Audit logging | ⏳ | `audit_logs` table |
| [ ] Encryption at rest (S3) | ⏳ | AWS config |
| [ ] Encryption in transit | ⏳ | TLS 1.3 |
| [ ] 2FA pentru admin | ⏳ | Obligatoriu |
| [ ] Backup database | ⏳ | Supabase daily |
| [ ] DPIA completed | ⏳ | `docs/legal/` |

---

## COMPLIANCE CHECKLIST

### GDPR

| Requirement | Status | Implementare |
|-------------|--------|--------------|
| [ ] Privacy Policy | ⏳ | `/privacy` page |
| [ ] Cookie Consent | ⏳ | Cookie banner |
| [ ] Data Processing Agreement | ⏳ | Toate serviciile externe |
| [ ] Right to access | ⏳ | Export data button |
| [ ] Right to erasure | ⏳ | Delete account flow |
| [ ] Data minimization | ⏳ | Only collect necessary |
| [ ] Purpose limitation | ⏳ | Clear purpose per field |
| [ ] Storage limitation | ⏳ | Auto-delete policies |

### Legal Românesc

| Requirement | Status | Document |
|-------------|--------|----------|
| [ ] Contracte valide | ⏳ | Template-uri legale |
| [ ] Termeni și Condiții | ⏳ | `/terms` page |
| [ ] E-factura (SmartBill) | ⏳ | Integration |
| [ ] 10 ani arhivare contracte | ⏳ | S3 lifecycle |
| [ ] Semnătură electronică | ⏳ | Legea 455/2001 |

---

## COSTURI ESTIMATE

### Development (One-time)

| Item | Cost |
|------|------|
| Development (4 luni) | $40,000 - $60,000 |
| Design UI/UX | $5,000 - $10,000 |
| Security audit | $2,000 - $5,000 |
| **Total** | **$47,000 - $75,000** |

### Operaționale (Lunar)

| Service | Cost/lună |
|---------|-----------|
| Supabase Pro | $25 |
| AWS (S3 + Textract + Rekognition) | $50-100 |
| Vercel Pro | $20 |
| Stripe fees | 1.4% + €0.25/trx |
| SmartBill | €30-50 |
| Resend | $0 (free tier) |
| SMSLink.ro | $20-50 |
| Domain + SSL | $50/an |
| **Total estimat** | **$150-300/lună** |

---

## CÂND SĂ ACTUALIZEZI CE

| Eveniment | Documente de actualizat |
|-----------|------------------------|
| Serviciu nou | `docs/services/README.md`, `docs/services/{serviciu}.md`, acest fișier |
| Modificare preț | `docs/services/{serviciu}.md`, admin config |
| Schimbare tech stack | `DEVELOPMENT_MASTER_PLAN.md`, `docs/TECHNOLOGY_RECOMMENDATIONS.md` |
| Cerință legală nouă | `docs/legal/compliance-research.md`, acest fișier |
| Schimbare securitate | `docs/security-architecture.md`, `docs/security-implementation-checklist.md` |
| Feature nou | `docs/prd/eghiseul-prd.md`, acest fișier |
| Bug/Issue rezolvat | GitHub Issues, acest fișier (dacă afectează checklist) |
| Modificare API | `docs/api/` (de creat), acest fișier |

---

## NEXT ACTIONS

### Această săptămână

1. [ ] **Setup Next.js project** - `npx create-next-app@latest`
2. [ ] **Setup Supabase** - Create project în Frankfurt
3. [ ] **Setup AWS** - Account, S3 buckets, IAM roles
4. [ ] **Setup Stripe** - Account, API keys
5. [ ] **First commit** - Basic structure

### Comenzi de start

```bash
# 1. Create project
npx create-next-app@latest eghiseul --typescript --tailwind --app --src-dir

# 2. Install dependencies
cd eghiseul
npm install @supabase/supabase-js @supabase/ssr
npm install @aws-sdk/client-s3 @aws-sdk/client-textract
npm install stripe @stripe/stripe-js
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react
npm install @tanstack/react-query

# 3. Setup shadcn
npx shadcn-ui@latest init

# 4. Create .env.local with all variables
```

---

**Document Status:** ✅ Ready
**Next Review:** După Sprint 0
**Owner:** Development Team
