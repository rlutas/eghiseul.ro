# Sesiune 2026-06-10 (3) — TVA curieri 21% + număr suport hardcodat

**Status:** ✅ Aplicat (1042 teste pass, build OK)
**Fișiere:**
- `src/lib/services/courier/sameday.ts`
- `src/lib/services/courier/fancourier.ts`
- `src/lib/services/courier/utils.ts`
- `src/components/orders/help-contact-card.tsx`
- `tests/unit/lib/services/courier-utils.test.ts`

---

## Cerință

1. Aliniază **Sameday** la TVA **21%** (era 19%).
2. Numărul de suport: **nu există/nu se dorește în Vercel** — pune direct pe site numărul corect (**+40 757 708 181**).

## Ce s-a făcut

### TVA 21% (aliniere la sistem)
- **Sameday** (`sameday.ts`): fallback `getBasePriceQuotes` `standardVat`/`lockerVat` `0.19 → 0.21`; cost AWB `1.19 → 1.21`.
- **Fan Courier** (`fancourier.ts`): aliniat și fallback-ul lui (era tot 19%) — `vat 0.19→0.21`, express `1.19→1.21`/`0.19→0.21`, FANbox la fel. (Calea principală folosește TVA-ul real din API-ul curierului — neatinsă.)
- **Helpers** (`utils.ts`): `addVAT` / `extractVAT` default `0.19 → 0.21`.
- Teste actualizate (`courier-utils.test.ts`): default-ul e acum 21%; păstrat un caz cu rată custom 19%.

> Notă: aceste valori sunt în căile de **fallback** (când API-ul curierului nu răspunde cu preț). Calea normală Fan Courier ia TVA-ul din API. Sameday fallback + costul AWB sunt acum 21%.

### Număr de telefon suport
- `help-contact-card.tsx`: `SUPPORT_PHONE` **hardcodat** `'+40 757 708 181'` (scos `process.env.NEXT_PUBLIC_SUPPORT_PHONE`). Numărul trăiește în cod → mereu corect pe site, fără env pe Vercel.
- Singura apariție a numărului în `src/` (verificat cu grep). Numărul vechi `+40 745 850 700` nu mai există nicăieri.

## Verificare
- `npx tsc --noEmit` → 0; `eslint` → 0; `vitest run tests/unit` → **1042 passed**; `npm run build` → OK.
