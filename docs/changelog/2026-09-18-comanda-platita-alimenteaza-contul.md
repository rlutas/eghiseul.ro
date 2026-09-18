# 18.09.2026 — Comanda plătită alimentează contul: adresă, facturare, acte
<!-- categorie: clienti -->

## Pentru echipă

Până azi, legătura cont ↔ comandă mergea într-un singur sens pentru cine avea
deja cont: contul completa comanda, dar comanda nu dădea nimic înapoi în cont.
Un client logat comanda, scria adresa de livrare și datele de facturare, își
fotografia actul, plătea — și la următoarea vizită în cont, checklistul îi
cerea din nou adresa și facturarea, iar tabul de act era gol. Doar contul
creat DIN comandă (pe pagina de succes) primea aceste date.

**De acum, la fiecare plată confirmată** (card, transfer bancar confirmat de
voi, „Marchează plătită", sincronizare Stripe), comanda pune în contul
clientului:

- adresa de livrare, ca adresă salvată (o singură dată, chiar dacă o scrie
  ușor diferit la comenzi diferite);
- datele de facturare, ca profil de facturare (o dată per persoană / per
  firmă);
- actele de identitate din comandă, dacă în cont nu există deja un act valabil;
  contul devine „KYC verificat" doar dacă printre ele e un act de identitate;
- telefon / nume / CNP / data nașterii, doar în câmpurile goale ale
  profilului. Nimic din ce era deja în profil nu se suprascrie.

Dacă o plată a trecut pe un drum care a ratat pasul, se repară singur la
următoarea intrare a clientului în cont.

**În admin** nu se schimbă nimic: pe comandă vedeți în continuare „Client
înregistrat" + starea KYC a contului, citite din contul legat de comandă.

---

## Rezumat tehnic

### `src/lib/account/sync-paid-order.ts`

`syncPaidOrderToAccount(orderId)`: nu aruncă niciodată, idempotent prin marker
`customer_data.account_sync = { userId, at, addressSaved, billingSaved,
documentsCopied }`. Sare peste comenzile de guest și cele neplătite.

1. Profil: `normalizePhone(contact.phone)`, nume, CNP, dată — doar câmpurile
   goale (`/submit` face același lucru la trimitere; aici prinde și comenzile
   confirmate altfel).
2. Adresă: `savedAddressFromDelivery(orders.delivery_address)` → `null` fără
   stradă + localitate (locker, formular gol); dedup prin `sameAddress`
   (stradă + număr + localitate, fără diacritice, fără „str./nr./bl./ap."),
   `is_default` doar dacă e prima.
3. Facturare: `companyProfileFromOrder` / `personProfileFromOrder` (aceleași
   ca la `register-from-order`); dedup prin `sameBillingProfile` (CNP pentru PF,
   CUI fără „RO" pentru PJ).
4. Acte: `copyOrderKycDocumentsToAccount` (nou, `copy-order-kyc.ts`, extras
   din `register-from-order`, care acum îl apelează), doar dacă
   `kyc_verifications` active nu conțin un tip de identitate;
   `kyc_verified` ridicat doar de un act de identitate.

`syncUnsyncedPaidOrdersForUser(userId, limit=5)`: pagina contului îl rulează
după `claim_guest_orders`, pentru comenzile plătite fără marker.

### Unde e legat

`api/webhooks/stripe` (după factură), `lib/orders/fulfil-paid.ts` (după
Barou), `api/orders/[id]/confirm-payment`, `api/admin/orders/[id]/verify-payment`
(transfer bancar), `api/admin/orders/[id]/sync-stripe`, plus
`(customer)/account/page.tsx`.

### Verificat

6 teste noi pe helperii puri (`sync-paid-order.test.ts`); suita completă
1954 verzi; `register-from-order` refactorizat fără schimbare de comportament
(aceeași buclă, aceleași loguri, prefix `register-from-order`).

Nu s-a rulat pe o comandă reală: nu există comenzi plătite de test fără efecte
secundare (factură, emailuri). Prima confirmare vine din logurile Vercel,
prefix `[account-sync]`, la prima plată a unui client cu cont.
