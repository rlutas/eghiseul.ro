# Sesiune 2026-06-10 (10) — Bară sticky cu sumar/preț pe toți pașii wizard (mobil)

**Status:** ✅ Aplicat (tsc/lint/build OK, E2E nou verde)
**Fișiere:**
- `src/components/orders/modular-order-wizard.tsx`
- `tests/e2e/wizard/ui-elements.spec.ts`

---

## Cerință

Pe mobil, pe paginile de formular (pașii 1-6), să existe un **sumar sticky jos** care arată mereu **prețul** — la fel ca bara de pe pagina „finalizează comanda / plată".

## Problemă

Wizard-ul avea prețul doar în sidebar-ul de preț (`PriceSidebarModular`), care pe mobil stă **sub** cardul de pas și **dispare la scroll**. Butoanele Înapoi/Continuă erau într-un footer inline (în card), tot scrollabil.

## ⚠️ Corecție (commit 21a9d62) — design final

Versiunea inițială pusese și butoanele **Înapoi/Continuă/Plătește** în bara sticky și ascunsese footer-ul inline pe mobil → la ultimul pas singurul buton de plată era în sticky și clientul se putea bloca („nu mă lasă să merg la plătește"). **Reparat:**
- Footer-ul **Înapoi/Continuă/Plătește rămâne în formular** pe toate dimensiunile (ca înainte) — plata merge pe mobil.
- Bara sticky e **doar sumar**: arată totalul, iar la apăsare se expandează tot „Rezumat comandă" (`PriceSidebarModular`) ca **dropdown** cu backdrop. Fără butoane de navigare.
- Cardul „Rezumat comandă" inline e ascuns pe mobil (`hidden lg:block`) — dropdown-ul îl înlocuiește; desktop păstrează sidebar-ul sticky.

## Soluție (versiunea inițială — vezi corecția de mai sus)

- **Bară `fixed bottom-0` doar pe mobil** (`lg:hidden`): stânga „Total: X RON" (mereu vizibil, reflectă reducerea), dreapta Înapoi (icon) + Continuă/Plătește. Mesajele de eroare apar pe un rând sub bară.
- Footer-ul de navigare inline devine **desktop-only** (`hidden lg:block`) — pe mobil navigarea e în bara sticky, fără dublură.
- Container: `pb-28 lg:pb-8` ca să rezerve spațiu pentru bara fixă (conținutul nu e acoperit).
- Pe ultimul pas butonul din bară e „Plătește" (suma e deja în stânga barei → nu o dublăm).

Folosește `priceBreakdown.totalPrice` + handlerele existente (`handleNext`, `prevStep`, `stepValid`, `isFirstStep`, `isLastStep`) — aceeași logică ca footer-ul de desktop.

## Verificare

- `tsc --noEmit` 0, `eslint` 0, `npm run build` OK.
- E2E nou (iPhone 12): bara sticky cu „Total" + „X RON" + „Continuă" e vizibilă. Wizard E2E 16/16 verde (desktop folosește footer-ul inline).
