# Roadmap — features cont client (user dashboard)

**Data:** 2026-06-24
**Status:** Faza 1 livrată; Fazele 2-4 planificate

Bazat pe analiza a 3 agenți (zona /account, documente per comandă, fezabilitate mașini/adrese salvate).

## Stare actuală (ce MERGE deja)

- Dashboard `/account` cu tab-uri: Profil, KYC, **Adrese salvate**, Facturare (PF/PJ + ANAF lookup), Comenzi. (`src/components/account/*Tab.tsx`)
- Persistență user: `user_saved_data`, `kyc_verifications`, `billing_profiles` (migrația 015).
- **Documente per comandă VIZIBILE clientului**: `order_documents.visible_to_client` + download presigned (15 min) + owner-check. Vizibile: contract prestări (auto la plată), constatator (worker ONRC), extras CF (worker ANCPI). (`account/orders/[id]/page.tsx`, `api/orders/[id]/documents/[docId]/download`)
- **Prefill API există**: `GET /api/user/prefill-data` (personal + adrese + KYC + billing) — DAR neintegrat în wizard.

## Faza 1 — LIVRAT 2026-06-24
- ✅ Footer adăugat în `(customer)/layout.tsx` (lipsea în /account).
- ✅ Facturi (Oblio) vizibile în detaliul comenzii (`invoiceUrl`/`invoiceNumber` în API + card UI).
- ✅ (legat) Urgent scos de unde nu există (migrația 080); footer/reviews/urgent pe paginile servicii.
- ⏳ Spațiu alb sub header în /account — cauza = banda spacer-ului global (`header.tsx:570`, h-16/h-112) deasupra hero-ului dark. Necesită confirmare vizuală (hero bleed sub header).

## Faza 2 — Prefill wizard (quick win, ~25h)
API-ul există; lipsește integrarea în provider + steps.
- `modular-wizard-provider`: `useEffect` fetch `/api/user/prefill-data` la init (user logat) + action `PREFILL_FROM_PROFILE`.
- PersonalKYCStep: auto-fill CNP/nume/dată/loc naștere/adresă + badge „pre-completat".
- KYC step: „Already Verified" + warning expirare.
- Address/Property: dropdown adrese salvate.

## Faza 3 — Mașini salvate + reminder (~45h)
NU există tabel/UI.
- Migrație: `user_saved_vehicles` (user_id, label, data JSONB {plateNumber, vin, brand, model, year, drivingLicense}, is_default).
- API CRUD `/api/user/vehicles` + RLS.
- Tab cont „Mașinile mele" (CRUD + reminder ITP/asigurare/rovinietă — badge + email alerts).
- Integrare VehicleDataStep (dropdown din vehicule salvate → pre-fill plate/permis) la cazier-auto + rovinietă.

## Faza 4 — Imobile salvate (~40h sau ~15h pe adrese existente)
- Variant A (tabel dedicat `user_saved_properties`: county, locality, carteFunciara, cadastral, topografic).
- Variant B (refolosire `user_saved_data` type='property') — mai ieftin.
- Tab „Imobilele mele" + integrare PropertyDataStep (dropdown → pre-fill county/locality/CF/cadastral) la extras CF.

## Fișiere cheie
- `src/providers/modular-wizard-provider.tsx` (prefill integration)
- `src/components/orders/modules/{vehicle,property,personal-kyc}/*`
- `src/components/account/*Tab.tsx`
- `src/app/api/user/prefill-data/route.ts`
- `supabase/migrations/015_user_data_persistence.sql`
- Spec existent: `docs/technical/specs/user-data-persistence-implementation.md`
