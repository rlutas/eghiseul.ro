# 18.09.2026 — Cupon de bun-venit pe cont, meniul „Datele mele" ca butoane, pasul 1 nu mai pierde telefonul
<!-- categorie: clienti -->

## Pentru echipă

**1. Fiecare cont primește un cupon de bun-venit.** 10% la prima comandă din
cont, valabil 30 de zile, o singură folosire, doar pe contul lui. Apare în
cont ca un card cu codul (`BUNVENIT-…`) și se aplică singur când comanda
pornește din „Ce pot comanda" — clientul nu trebuie să scrie nimic. În
`/admin/coupons` aceste cupoane au eticheta **Bun-venit**. Dacă un client
încearcă codul altcuiva, comanda îl refuză: „Cuponul este personal".

**2. „Datele mele"** (Profil, Act identitate, Adrese, Facturare, Mașini) arată
acum ca „Comandă / Comenzi": butoane cu chenar, pe alb.

**3. Bug găsit și reparat la pasul 1 al comenzii.** Un client logat fără
telefon în profil scria numărul, iar datele din cont soseau exact atunci:
pasul sărea în modul „Date preluate din contul tău" cu numărul pe jumătate
scris, restul cifrelor se pierdeau, iar comanda mergea mai departe **fără cod
de comandă** — la plată nu s-ar fi salvat nimic. Acum modul „date preluate"
apare doar pentru date venite chiar din profil și niciodată cât timp clientul
tastează.

Ghidul complet al contului, pentru voi: [Contul clientului](../admin/contul-clientului.md).

---

## Rezumat tehnic

### Cupon de bun-venit

- Migrarea **174**: `coupons.owner_user_id` (FK `profiles`, index parțial) +
  `system_kind` acceptă `'welcome'`.
- `src/lib/coupons/welcome.ts`: `ensureWelcomeCouponForUser(userId)` — un
  singur cupon per cont (`system_kind='welcome'`, `owner_user_id`), creat la
  prima încărcare a `/account`; `BUNVENIT-XXXXXXXX` din `generateCouponCode`,
  `percentage` 10, `max_uses` 1, `valid_until` +30 zile; retry o dată la
  `23505`. Întoarce `null` când cuponul e folosit/expirat/inactiv
  (`welcomeCouponIsUsable`) — nu se reemite.
- `WelcomeCouponCard` sub checklist; `AccountTabs` → `ServicesTab` primesc
  `couponCode` și linkurile devin `/comanda/<slug>/?coupon=<cod>`; wizardul
  păstrează parametrii străini între pași și `review-step` îl aplică singur
  (mecanismul existent de la recovery).
- `POST /api/orders/[id]/coupon`: un cupon cu `owner_user_id` se aplică doar
  dacă `orders.user_id` sau utilizatorul logat e proprietarul; altfel 400.
- Admin: enum + badge „Bun-venit". Cronul de recovery șterge doar
  `recovery`/`phone_recovery`, deci nu atinge cupoanele de bun-venit.
- Verificat local: cont nou → card cu cod → link cu `?coupon=` → draft
  `E-260918-UJN3G` → `POST coupon` → 198 → 178,20 RON.

### Pasul 1: modul „date preluate" pornea de la ce tasta clientul

`contact-step.tsx`: `hasValidPrefilledData` citea `state.contact` (ce se
tastează) cu `length >= 8`. Când `PREFILL_FROM_PROFILE` sosea în timpul
tastării, `+4074585` trecea, cardul read-only înlocuia formularul, restul
cifrelor se pierdeau, iar `nextStep()` nu mai trecea de `hasValidContactData`
(≥ 10) → fără `friendlyOrderId` → fără draft pe server (aceeași consecință
ca incidentul „Nu știu" din 14.09). Acum: `isPrefilled && !form.formState.isDirty
&& profileEmail && isValidPhoneNumber(profilePhone)`, cu datele din
`prefillData`, nu din state. Reprodus și confirmat reparat în browser.

### Navigare

`AccountNav`: rândurile secundare primesc `emphasis` (chenar + fundal alb), ca
cele primare.
