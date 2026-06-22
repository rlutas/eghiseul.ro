---
description: Scaffold un serviciu nou (modular wizard) cu toate touchpoint-urile de înregistrare. Folosește când userul cere un serviciu nou.
argument-hint: [nume-serviciu]
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

Adaugă serviciul nou: **$ARGUMENTS**

Urmează ghidul `docs/technical/specs/modular-wizard-guide.md`. Touchpoint-uri de înregistrare (verifică FIECARE — un serviciu „pe jumătate înregistrat" e bug clasic):

1. **Config serviciu în DB** (`services` table) — slug, preț, is_active, module wizard.
2. **Wizard** — module în `src/components/orders/modules/` + `steps-modular/` dacă are pași custom.
3. **Pagină serviciu** `/servicii/{slug}/` (`src/app/servicii/{slug}/page.tsx`) + metadata + schema.
4. **Sitemap** — adaugă slug în `HARDCODED_SERVICE_SLUGS` (`src/lib/seo/constants.ts`).
5. **Mega-meniu** — `src/config/services-nav.ts`.
6. **Document generation** dacă are contracte/cereri (`src/templates/` + `lib/documents/`).
7. **Order pipeline** — status workflow în `/api/admin/orders/[id]/process` dacă are flux custom.

Reguli: TypeScript strict, absolute imports `@/...`, server components by default, UI românește / cod engleză, `createClient()`/`createAdminClient()` pt Supabase, `requirePermission()` pe endpoint-uri admin. La final: `npm run build` + verifică în sitemap + actualizează `docs/` (regula documentation.md).

Verifică întâi paritatea cu `/Users/raul/Projects/cazierjudiciaronline.com` dacă serviciul există acolo.
