# Sesiune 2026-06-10 (6) — Fix zoom iOS la „Motivul solicitării" (și alte câmpuri)

**Status:** ✅ Aplicat (tsc/lint/build OK)
**Fișiere:**
- `src/components/shared/SearchableSelect.tsx`
- `src/components/orders/steps-modular/contact-step.tsx`

---

## Bug raportat

Pe mobil, la pasul 1, când apeși pe „Motivul solicitării" ca să alegi motivul, pagina face un **zoom ciudat**.

## Cauză

Comportament clasic **iOS Safari**: focusarea oricărui `<input>`/`<select>` cu `font-size < 16px` declanșează auto-zoom. „Motivul solicitării" folosește `SearchableSelect`, al cărui input de căutare avea `text-sm` (14px) → zoom la tap.

## Fix

`text-base sm:text-sm` (16px pe mobil, 14px de la `sm` în sus) pe câmpurile focusabile — previne zoom-ul iOS, păstrează compact pe desktop:
- **`SearchableSelect`** (input-ul de căutare) → acoperă „Motivul solicitării" ȘI „Localitate" (livrare).
- **`ForeignBirthFields`** (contact-step): input native „Localitatea Nașterii" + select native „Țara Nașterii".

## Ce NU avea nevoie de fix

- `Input` shadcn (email, stradă, nr, bloc...) — deja `text-base md:text-sm` (16px pe mobil).
- `Select` shadcn (Județ) — e buton Radix custom, nu `<select>` native → nu face zoom.
- Telefon (`react-international-phone`) — deja `!text-base`.

## Verificare
- `npx tsc --noEmit` → 0; `eslint` → 0 erori; `npm run build` → OK.
