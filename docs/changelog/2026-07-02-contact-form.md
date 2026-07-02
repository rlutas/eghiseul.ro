# 2026-07-02 — Formular de contact + notificare email/DB

## Context
Pagina `/contact` exista dar avea doar carduri (telefon/email/WhatsApp) + program + date firmă — **fără formular**. Adăugat formular funcțional, linkat din navigație.

## Livrat

### Bază de date
- **Migrație 090** (`090_contact_messages.sql`) — tabelă `contact_messages`:
  - Câmpuri: `name, email, phone, order_number, subject, message, status (new/read/replied/spam), ip, user_agent, handled_by, handled_at`.
  - RLS: SELECT + UPDATE doar pentru `super_admin/employee/manager/operator`. Insert prin service-role (bypass RLS) din API.
  - Index pe `created_at DESC` + `status`.

### API
- **`POST /api/contact`** (`src/app/api/contact/route.ts`):
  - **Honeypot** — câmp ascuns `website`; dacă e completat → răspuns `success` fals dar mesajul e ignorat (nu învață botul).
  - **Rate-limit** — 5 mesaje / 10 min per IP (`checkRateLimit`).
  - **Validare** — nume 2–120, email regex + max 254, mesaj 10–5000.
  - Insert în `contact_messages` (admin client) → apoi **email Resend** la `contact@eghiseul.ro` cu `reply-to` = adresa clientului. Emailul eșuat NU pierde mesajul (deja persistat) — doar log.

### Frontend
- **`src/components/contact/contact-form.tsx`** — form client: nume/email/telefon(opt)/nr.comandă(opt)/subiect(select 5 opțiuni)/mesaj + stări sending/sent/error + honeypot ascuns + link politică confidențialitate.
- **`src/lib/email/templates/contact-message.ts`** — template email notificare (HTML + text, escape la boundary).
- Montat pe `/contact` — secțiune „Scrie-ne un mesaj" deasupra cardurilor existente.

### Navigație
- **Header** — `Contact` repointat din hash `/#contact` (scroll homepage) → rută `/contact/`. `navLinks` tipat explicit `NavLink[]` (păstrează suport `hash` pt viitor).
- **Footer** — adăugat link „Formular de contact" → `/contact/`.

## Verificat (E2E, dev)
- Submit valid → `200` + rând în DB.
- Honeypot (bot) → `200` dar **nu** se inserează.
- Email invalid / mesaj scurt → `400` cu mesaj RO.
- `/contact` randează `200` cu form. `tsc` + `eslint` clean.

## Deschis
- **Fără UI admin** pt citit `contact_messages` — mesajele vin pe email (canal principal) + DB (istoric/backup). De adăugat inbox în `/admin` dacă e nevoie.
- **Prod**: notificarea email merge doar cu `RESEND_API_KEY`/`RESEND_FROM`/`RESEND_REPLY_TO` setate pe Vercel prod (blocker launch existent).
