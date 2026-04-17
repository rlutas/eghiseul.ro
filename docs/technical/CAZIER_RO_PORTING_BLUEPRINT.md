# Cazier.ro — Porting Blueprint for eghiseul.ro

**Source:** `/Users/raul/Projects/cazierjudiciaronline.com` | **Date:** 2026-04-16
**Status:** LIVE with customers — use as reference for behavioral parity.

## Architecture Overview

```
Landing pages (/cazier-judiciar-online/[city], /cazier-fiscal-online,
               /cazier-auto-online, /certificat-integritate-comportamentala)
        |
        v
<OrderForm serviceConfig={...} />  — single 6-step wizard, no separate wizard per service
        |
        v
Step4Options  (add-ons, pricing, delivery, coupon)
Step5Contract (inline JSX contract, checkbox consent, IP capture — NO canvas signature)
Step6Payment  (POST /api/stripe/create-payment-intent -> redirect to Stripe Checkout)
        |
        v
Stripe Checkout (hosted page)
        |
        v
/api/stripe/webhook  ->  status=paid, Slack, Google Sheets, email, Oblio invoice fetch
        |
        v
Admin panel (/admin/*)  — custom HMAC cookie auth, NOT Supabase Auth, no RBAC
```

---

## 1. Cross-Service Add-ons

**Where the flag lives:** `src/config/service-configs.ts:31-32` defines `enableCazierJudiciar: boolean` and `enableCertificatIntegritate: boolean` on `ServiceConfig`. `src/config/integritate.config.ts:21` sets `enableCazierJudiciar: true`. The judiciar config sets `enableCertificatIntegritate: true` (bidirectional).

**UI rendering:** `src/components/form/steps/Step4Options.tsx:480-573`. The entire add-on block is guarded by `{serviceConfig.enableCazierJudiciar && (...)}`. It renders a toggle button (`+150 RON label` at line 498, though actual price in useMemo at line 138 is `+100`) plus a collapsible sub-options tree: Apostila Haga (+238), Traducere (+178.50), Legalizare (+99, requires Traducere), Apostila Notari (+83.30, requires Legalizare).

**Pricing:** No bundle discount anywhere. Flat add-on stacked on top of full-price main service. useMemo at lines 109-179 of Step4Options.tsx computes the running total.

**Data model — single order, extra flat columns:** No second DB row created. One `orders` row with dedicated booleans inserted in `/api/stripe/create-payment-intent/route.ts:128-132`: `cazier_judiciar`, `cazier_traducere`, `cazier_apostila`, `cazier_legalizare`, `cazier_apostila_notari`. The add-on appears as a separate Stripe line item in the same checkout session.

**Document generation for add-on:** The admin generates documents manually on demand (delegation + cerere per service type). `src/lib/delegation-generator.ts` uses docxtemplater to fill `templates/delegatie-template.docx`. `src/lib/cerere-generator.ts` has separate template paths per service type.

---

## 2. Landing Pages Inventory

| Path | Service | Key sections | Dynamic content |
|------|---------|-------------|-----------------|
| `/cazier-judiciar-online/[city]/page.tsx` | Cazier Judiciar | Hero+form, Trust signals, Ce este, Use cases, Police office (conditional), Schedule table, Online vs Ghiseu comparison, How it works, Acte necesare, Pricing, FAQ, Testimonials, CrossSell, Other cities grid | City from slug; police office from `src/config/city-data.ts`; FAQ merged generic+city-specific |
| `/cazier-fiscal-online/page.tsx` | Cazier Fiscal | Hero+form, Trust signals, Use cases, WhyChooseUs, Pricing, FAQ, Testimonials, CrossSell | Hardcoded |
| `/cazier-auto-online/page.tsx` | Cazier Auto | Hero+form, Trust signals, FAQ, Testimonials, CrossSell | Hardcoded |
| `/certificat-integritate-comportamentala/page.tsx` | CIC | Hero+form, TrustSignals, Use cases, Pricing accordion, FAQ, Testimonials, CrossSell | Hardcoded |

City pages use `generateStaticParams()` from `siteConfig.seo.cities` (SSG pre-rendering). JSON-LD schemas (BreadcrumbList, LocalBusiness, FAQPage) injected per page. All content is hardcoded in TypeScript.

**Shared section components:**
- `src/components/sections/TrustSignals.tsx`
- `src/components/sections/CrossSellSection.tsx`
- `src/components/sections/TestimonialsSection.tsx`
- `src/components/sections/FAQSection.tsx`
- `src/components/sections/CityLandingSection.tsx`

---

## 3. Wizard Architecture

**Root:** `src/components/form/OrderForm.tsx`. Receives `ServiceConfig` prop. No context/provider. Plain `useState` for `formData` (flat `Record<string, unknown>`) and `currentStep`. Always 6 steps (no dynamic step count). Service selected by which landing page embeds `<OrderForm serviceConfig={...} />`.

**Flag-to-UI mapping in steps:**
- Step1: `enablePJ` gates person type selector
- Step2: `enableParentNames`, `enableCetateanStrain`, `enableNumarPermis`, `enablePermisStrain`, `enableCetatenie` each gate fields
- Step4: `enableUrgency`, `enableCertificatIntegritate`, `enableCazierJudiciar`, `enableTraducere`, `enableApostilaHaga`, `enableLegalizare`, `enableApostilaNotari`, `enableVerificareExpert` gate UI blocks
- Step5: `serviceConfig.contractTitle`, `serviceConfig.contractSubject` used in contract

**Session persistence:** Every `handleStepComplete` fires `POST /api/sessions` (non-blocking) storing `{session_token, email, step, form_data, service_type}`. Recovery via `?recover=TOKEN`. Table: `sessions`.

---

## 4. Admin Architecture

**Auth:** Custom HMAC cookie (`src/lib/admin-auth.ts`). Token format: `base64url(payload).hmac_sha256`. 24h expiry. Single admin account. No RBAC.

**Admin pages:**

| Route | Capabilities |
|-------|--------------|
| `/admin` | Dashboard: revenue stats, recent orders |
| `/admin/orders` | List with search, status tabs, service filter |
| `/admin/orders/[id]` | Status change, generate delegation, generate cerere, Oblio invoice link |
| `/admin/coupons` | Create/edit coupons (manual + recovery types) |
| `/admin/settings` | Company profile, multi-company list for Oblio |
| `/admin/abandoned` | List abandoned sessions, send recovery email |
| `/admin/login` | Login form |

**Cannot do:** Add/edit services, change prices — all hardcoded in TypeScript.

**DB tables:** `orders`, `order_status_history`, `sessions`, `coupons`, `company_profile`, `companies`.

---

## 5. Stripe + Order Flow

1. Step4Options computes `amount_total` client-side via `useMemo`
2. Step5Contract captures IP via ipify, timestamp, user agent
3. Step6Payment calls `POST /api/stripe/create-payment-intent` with entire `formData`
4. Server inserts `orders` row with `status: "pending"` before touching Stripe
5. Server calls `POST /api/contracts/generate` non-blocking — jsPDF contract stored in Supabase Storage `documents` bucket
6. Server builds `lineItems[]` from scratch using `serviceConfig.pricing.*` — never trusts client. Avocat fee 15 RON always split as separate line item
7. Server re-validates coupon from DB `coupons` table, creates ephemeral Stripe coupon if valid
8. Creates Stripe Checkout Session with `metadata.app_id="cjo"` (tenant isolation)
9. Returns `{ url: session.url }` — client redirects
10. Webhook `checkout.session.completed`: verifies `app_id`, updates `status: "paid"`, recomputes delivery deadline, inserts `order_status_history`, sends Slack + Sheets + email + Oblio invoice

**Status workflow:** `pending` → `paid` → `document_pregatit` → `depus_eliberare` → `eliberat_cazier` → `ridicat_curier` → `completed`.

---

## 6. Tech Diff vs eghiseul.ro

| Area | cazier.ro | eghiseul.ro | Impact |
|------|-----------|-------------|--------|
| UI library | shadcn/ui | shadcn/ui | No diff |
| Pricing | Hardcoded TypeScript | DB-driven | Major: add-on pricing must come from DB |
| Admin auth | Custom HMAC cookie | Supabase Auth + RBAC | eghiseul more advanced — keep |
| Customer auth | None | Supabase Auth | eghiseul has customer accounts |
| Contract | jsPDF programmatic | docxtemplater + signature DrawingML | eghiseul superior |
| Coupons | Full system | Not implemented | Port |
| Abandonment | Sessions + recovery | Autosave, no recovery | Add |
| Notifications | Slack + Sheets + email | Email only | Add Slack + Sheets |
| City SEO pages | SSG `[city]` routes | Not implemented | New feature |
| Delivery tracking | Manual AWB | Fan Courier + Sameday APIs | eghiseul superior |

---

## 7. Porting Plan for eghiseul.ro

### Maps 1:1
- `ServiceConfig` flag pattern → DB-driven flags on `services` or `service_options` JSON
- Coupon system → `coupons` table + validate endpoint + server revalidation
- Abandonment `sessions` table + recovery email cron
- City landing page SSG pattern (`[city]/page.tsx` + `generateStaticParams`)

### Needs adaptation
- **Add-on pricing:** cazier hardcodes `+100 RON`. eghiseul reads from DB. Add `service_options` rows for cross-service addons.
- **Add-on data model:** add flat boolean columns to `orders` (`includes_cazier_judiciar`, `includes_cert_integritate`) OR use JSONB `bundled_addons`. Flat columns = simpler.
- **Wizard gates:** add `enableCazierJudiciarAddon` / `enableCertIntegritateAddon` to the service config equivalent read from DB.
- **Contract:** keep docxtemplater+signature approach. Add service-specific template routing.

### New code needed

| Feature | Effort |
|---------|--------|
| Cross-service add-on UI + DB + line items | 2 days |
| Coupon system | 2 days |
| City SEO landing pages | 2-3 days |
| Abandonment recovery | 1-2 days |
| Slack + Sheets notifications | 0.5 day |
| **Total** | **~8-10 days** |

---

## Essential Files Reference

- `src/config/service-configs.ts` — ServiceConfig type, registry
- `src/config/integritate.config.ts:21` — `enableCazierJudiciar: true`
- `src/components/form/OrderForm.tsx` — wizard root
- `src/components/form/steps/Step4Options.tsx:109,480` — add-on UI + pricing useMemo
- `src/app/api/stripe/create-payment-intent/route.ts:59-162,265-278` — order insert, line items, avocat split
- `src/app/api/stripe/webhook/route.ts:34` — payment confirmed
- `src/app/api/contracts/generate/route.ts` — contract PDF + Storage
- `src/lib/contract-pdf.ts` — jsPDF contract (ASCII-only diacritics)
- `src/lib/delegation-generator.ts` — docxtemplater delegation DOCX
- `src/lib/cerere-generator.ts` — docxtemplater cerere DOCX per service
- `src/lib/admin-auth.ts` — custom HMAC cookie
- `src/lib/order-status.ts` — status enum + workflow
- `src/app/cazier-judiciar-online/[city]/page.tsx` — city landing template (928 lines)

---

## 8. Key findings summary

1. **Add-ons are flat DB columns on `orders`** — no separate order rows. Simple approach.
2. **No canvas signature in cazier** — Step5 is checkbox consent + IP capture. eghiseul.ro's DrawingML signature is superior.
3. **Admin auth is custom HMAC cookie**, not Supabase Auth. eghiseul's RBAC is better.
4. **All pricing hardcoded** in TypeScript — admin cannot edit. eghiseul's DB-driven is better.
5. **Coupons are complete + production-tested** — highest ROI to port.
