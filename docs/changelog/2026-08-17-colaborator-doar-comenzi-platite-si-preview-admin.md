# 2026-08-17 — Portalul colaboratorului: doar comenzi plătite + previzualizare din admin

## 1. Coșurile abandonate nu mai ajung la colaborator 🔴

**Ce era:** `/api/collaborator/orders` excludea doar `status = 'draft'`. Tot restul intra în lista
topografului: comenzi `pending` (neplătite) și `abandoned` (coșuri abandonate). În momentul
verificării, serviciile alocate colaboratorului aveau **5 comenzi `abandoned`** vizibile lângă
**3 comenzi reale** (2 `completed` + 1 `paid`) — adică jumătate din listă era gunoi.

Comentariul din cod promitea deja comportamentul corect („Only paid+ orders are relevant for
fulfilment") — implementarea nu-l respecta.

**Ce s-a schimbat:**

| Fișier | Schimbare |
|---|---|
| `src/app/api/collaborator/orders/route.ts` | `.neq('status','draft')` → `.eq('payment_status','paid')` |
| `src/app/api/collaborator/orders/[id]/route.ts` | 404 dacă `payment_status !== 'paid'` (nici prin link direct) |

`payment_status` are doar 3 valori în DB (`unpaid`, `paid`, `refunded`), deci filtrul scoate
automat și comenzile stornate — exact ca la decont, unde regula era deja corectă.

**Neatins (verificat, era deja curat):**
- `/api/collaborator/earnings` (decontul topografului) — `payment_status='paid'` + fără cancelled/refunded;
- `/api/admin/collaborators/orders` (tabul „Colaboratori servicii") — idem;
- `/api/admin/collaborators/avocat-decont` (tabul „Avocat — decont cabinet") — `payment_status='paid'`,
  fără `refunded`/`cancelled`.

**De știut despre rolul `avocat`:** e rol de **admin** (`orders.view`, `documents.view`,
`registry.manage`), deci vede tot `/admin/orders`, inclusiv tabul „Neplătite" (draft + pending +
abandoned). Decontul lui nu e afectat, dar lista de comenzi din admin nu e filtrată pe rol — dacă
vrem ca avocata să nu vadă deloc coșurile abandonate, e o schimbare separată în `orders-tabs.ts`.

## 2. „Vezi ce vede colaboratorul" — previzualizare din admin 🟣

Buton nou în `/admin/colaboratori` (tab „Colaboratori servicii", vizibil cu `users.manage`) care
deschide portalul colaboratorului selectat: `/colaborator/orders?as=<collaboratorId>`.

**Cum funcționează:**
- `src/lib/admin/collaborator-context.ts` — `resolveCollaboratorContext(userId, as)`: fără `?as=`
  cere rol `collaborator`; cu `?as=` cere `users.manage` pe cel care se uită + rol `collaborator` pe țintă.
- Rutele GET din `/api/collaborator/*` (orders, orders/[id], document, earnings, services) acceptă `?as=`.
- Rutele care SCRIU (`note`, `mark-ready`, `upload-pdf`) **nu** au fost atinse: ele cer în continuare
  rol `collaborator`, deci un admin nu poate lucra comanda în numele lui.
- `src/lib/collaborator/preview.ts` — `usePreviewAs()` (citit din `window.location.search` cu
  `useSyncExternalStore`, ca să nu ceară Suspense la prerender) + `withPreview()` care propagă `?as=`
  pe linkuri și fetch-uri.
- `src/app/colaborator/layout.tsx` — lasă rolurile de admin să intre DOAR în modul preview, arată
  banner galben („doar citire") și „Înapoi în admin" în loc de „Deconectare".
- `src/app/colaborator/orders/[id]/page.tsx` — în preview ascunde caseta de notă și butonul de
  încărcare PDF (nu doar le dezactivează).

Datele rămân la fel de restrânse ca pentru colaborator: doar `customer_data.property`, fără
contact/billing/KYC.
