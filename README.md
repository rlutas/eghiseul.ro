# eGhiseul.ro — Platforma Digitala de Servicii Publice

[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-4-6e9f18.svg)](https://vitest.dev)
[![License](https://img.shields.io/badge/License-Private-red.svg)](#)

Platformă API-first pentru digitalizarea serviciilor publice din România. **9 servicii active** (Cazier Judiciar PF/PJ, Certificate Domiciliu, etc., 12 planificate), cu wizard modular de comenzi, KYC cu AI (Gemini 2.5), plăți Stripe, curierat Fan Courier + Sameday, generare documente DOCX cu semnături multiple, și panou admin cu RBAC.

**Status (2026-04-28):** Sprint 6 ~98% complet · Performance recovery 10x · 596 unit tests · CI verde pe `main`.

---

## Quick Start

### Prerequisites

- Node.js **22+** (CI rulează 22 LTS)
- npm 10+
- `.env.local` configurat — vezi [`.env.example`](.env.example)

### Setup local

```bash
git clone <repo>
cd eghiseul.ro
npm install
cp .env.example .env.local
# completează cheile Supabase, AWS S3, Stripe, Gemini
npm run dev                # http://localhost:3000 (Turbopack)
```

### Comenzi uzuale

```bash
npm run dev                # dev server (Turbopack)
npm run build              # production build
npm run lint               # ESLint
npm test                   # 596 unit tests (vitest, ~1-2s)
npm run test:watch         # watch mode
npm run test:integration   # 8 teste reale (Gemini + DB), opt-in
npm run test:e2e           # Playwright (real browser)
npm run test:smoke         # 17 endpoint smoke checks
npm run test:all           # unit + smoke
```

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind v4, shadcn/ui |
| **Backend** | Supabase (PostgreSQL + Auth + RLS), Node.js API routes |
| **Storage** | AWS S3 (eu-central-1) — `eghiseul-documents` |
| **AI / OCR** | Google Gemini 2.5 Flash (KYC) + Flash Lite (OCR documente) |
| **Plăți** | Stripe (card, Apple Pay, Google Pay) + transfer bancar |
| **Curier** | Fan Courier + Sameday API (RO) |
| **Facturare** | Oblio (e-factura) |
| **Notificări** | Resend (email), SMSLink (SMS) — Sprint 6 |
| **Documente** | docxtemplater + pizzip (DOCX), mammoth (preview HTML) |

---

## Features

- **Modular Order Wizard** — pași dinamici: contact, tip client (PF/PJ), KYC, opțiuni, livrare, billing, semnătură
- **KYC cu Face Match** — Gemini compară selfie cu poza CI, tracking confidence per document
- **Document Generation** — auto: `contract-prestari`, `contract-asistenta`; custom (admin): `imputernicire`, `cerere-eliberare-pf/pj`
- **Multi-Signature** — semnătura clientului (desenată în wizard) + companie + avocat (PNG predefiniți din S3) embedați ca DrawingML inline images
- **Number Registry (Barou)** — alocare atomică numere, reuse logic, export CSV pentru contabilitate
- **Admin Panel** — gestionare comenzi, RBAC (5 roluri × 7 permisiuni), KYC review, generare AWB, dashboard
- **Courier Integration** — quotes multi-provider, locker picker, tracking real-time
- **Audit Trail** — log GDPR-compliant, semnături cu IP/UA/timestamp/SHA-256

---

## Structură Proiect

```
src/
├── app/
│   ├── (auth)/          # login, register, reset
│   ├── (customer)/      # account
│   ├── admin/           # admin panel
│   ├── comanda/         # order wizard + status
│   └── api/             # services, orders, admin, courier, ocr, kyc, webhooks
├── components/
│   ├── orders/          # modular wizard + steps + signature + KYC modules
│   └── ui/              # shadcn/ui
├── lib/
│   ├── admin/permissions.ts   # RBAC server-side
│   ├── aws/s3.ts              # S3 ops
│   ├── documents/             # docxtemplater + signature embedding
│   ├── images/compress.ts     # client-side compresie cu EXIF
│   ├── kyc/face-match.ts      # util reutilizabil pentru validare KYC
│   ├── services/courier/      # Fan Courier + Sameday
│   └── services/document-ocr.ts
└── proxy.ts             # auth middleware (Next.js 16 convention)

supabase/migrations/     # 32 migrații
tests/
├── unit/                # 596 teste Vitest (~1-2s)
├── integration/         # 8 teste reale (Gemini + DB), opt-in
├── e2e/                 # Playwright (real browser)
└── README.md            # ghid testing
docs/                    # documentație completă
```

---

## Documentație

| Caut... | Vezi |
|---------|------|
| Status curent (ce merge, probleme) | [`docs/STATUS_CURRENT.md`](docs/STATUS_CURRENT.md) |
| Index complet docs | [`docs/README.md`](docs/README.md) |
| Sprint plan & backlog | [`docs/DEVELOPMENT_MASTER_PLAN.md`](docs/DEVELOPMENT_MASTER_PLAN.md) |
| Testing guide | [`docs/testing/COMPREHENSIVE_GUIDE.md`](docs/testing/COMPREHENSIVE_GUIDE.md) + [`tests/README.md`](tests/README.md) |
| Cum adaug serviciu nou | [`docs/technical/specs/modular-wizard-guide.md`](docs/technical/specs/modular-wizard-guide.md) |
| Admin panel + RBAC | [`docs/admin/README.md`](docs/admin/README.md) |
| Document generation | [`docs/technical/specs/admin-document-system.md`](docs/technical/specs/admin-document-system.md) |
| Courier integration | [`docs/technical/specs/awb-generation-tracking.md`](docs/technical/specs/awb-generation-tracking.md) |
| Stripe + Oblio | [`docs/technical/specs/stripe-oblio-payment-invoicing.md`](docs/technical/specs/stripe-oblio-payment-invoicing.md) |
| Security | [`docs/security/README.md`](docs/security/README.md) |
| AI guidelines (CLAUDE) | [`CLAUDE.md`](CLAUDE.md) |
| Session log recent | [`docs/session-logs/2026-04-27-performance-image-compression.md`](docs/session-logs/2026-04-27-performance-image-compression.md) |

---

## Recent Wins (2026-04-27/28)

- **Performance dev mode 10x** — `next dev --turbopack` (PATCH `/api/orders/draft` 58s → 200-2500ms)
- **Admin orders list** — `count='estimated'` + exclude drafts (25-39s → 3-5s)
- **Image compression client-side** — 5 MB CI → 207 KB JPEG cu EXIF orientation; aplicat în 4 componente
- **Gemini hibrid** — OCR cu `flash-lite` (~2s, 98% confidence), KYC cu `flash` (face match acurat)
- **KYC security gap închis** — `runFaceMatch()` util reutilizabil; pagina cont validează acum face match la upload
- **Test infrastructure** — 596 unit + 8 integration + 13 E2E + 17 smoke; CI lint+tsc+tests+build verde
- **2 GDPR bugs găsite & fixate prin TDD** — audit-logger redaction case, order_history event_type CHECK constraint
- **Next.js 16 migration** — `src/middleware.ts` → `src/proxy.ts` (convenția Next.js 16)
- **Security cleanup** — script cu `SUPABASE_SERVICE_ROLE_KEY` leaked șters, GitHub Secret Scanning Alert #1 acoperit

---

## ⚠️ Pending Action (User)

**Rotire `SUPABASE_SERVICE_ROLE_KEY` pe Supabase Dashboard** — cheia veche a fost expusă în istoric git (commit Feb 11), fișierul șters dar cheia rămâne în history. Pași: rotire pe https://supabase.com/dashboard → update Vercel env vars → update `.env.local` → restart dev.

---

## Contributing

1. Branch: `git checkout -b feat/<feature>`
2. **TDD** — testul întâi, apoi codul (vezi [`tests/README.md`](tests/README.md))
3. `npm test` + `npm run lint` local
4. Push — CI rulează lint + tsc + 596 tests + build (blocking)
5. Open PR

---

## License

Privat / Internal.
