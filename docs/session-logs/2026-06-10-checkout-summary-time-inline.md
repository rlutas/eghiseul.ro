# Sesiune 2026-06-10 (13) — Checkout: timp în rezumat, fără card separat/badge-uri; placeholder adresă

**Status:** ✅ Aplicat (tsc/lint/build OK)
**Fișiere:**
- `src/components/payment/OrderSummaryCard.tsx`, `src/components/orders/order-sidebar.tsx`
- `src/app/comanda/checkout/[orderId]/page.tsx`
- `src/components/orders/steps-modular/billing-step.tsx`

---

## Feedback

1. La facturare, câmpul „Stradă, număr, bloc, ap." — placeholder-ul părea text scris. Să iasă în evidență că trebuie completat.
2. La ultima pagină înainte de plată (checkout): scoate cardul separat „Timp estimat livrare" + badge-urile „Plată securizată/Garanție" — pune timpul în **rezumatul comenzii**, la serviciul de bază.

## Ce s-a făcut

### Placeholder adresă (billing)
`placeholder:text-neutral-400 placeholder:italic` → clar exemplu, nu valoare.

### Timp estimat în rezumat (checkout)
- `OrderSummaryCard` are acum prop opțional `deliveryTimeText` → afișat inline sub „Serviciu de bază": „🕐 Timp estimat: 3 zile lucrătoare".
- `OrderSidebar` are prop `timeInSummary` care transmite timpul către card.
- Checkout: `<OrderSidebar variant="summary" timeInSummary />` → **scoate** cardul separat de timp ȘI badge-urile de încredere; timpul apare acum în rezumat. Wizard-ul rămâne neschimbat (nu pasează `timeInSummary`).

## Rămas / de confirmat
- Cuponul: userul nu e sigur unde („să facă parte din alege metoda plată eventual sau nu știu"). Momentan e în blocul de rezumat (primul pe mobil, sub sumar). De decis dacă-l mutăm lângă selectorul de metodă.

## Verificare
`tsc`/`lint`/`build` curate.
