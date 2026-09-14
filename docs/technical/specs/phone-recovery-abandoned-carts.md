# Recuperare telefonică — comenzi abandonate

**Status:** ✅ LIVRAT 2026-09-14 · migrația 156
**Context:** completează sistemul de recovery automat (`docs/admin/abandoned-carts.md`) — cronul email+cupon 10% are 1,4% redemption (20 din 1.444 cupoane), confirmă că o parte din recuperare trebuie umană. Detalii de business/cercetare în `docs/marketing/email-marketing-plan-2026-09.md`.

## Update 2026-09-14 (aceeași zi, a doua rundă)

Rafinare pe baza feedback-ului lui Raul:
- **Scor de profunzime** (`dataDepthScore` în `abandoned-progress.ts`) — comenzile
  cu mai multe câmpuri completate (dincolo de contact/billing) apar înaintea
  celor cu progres minim, în interiorul aceluiași tier. "Cine a introdus multe
  date nu a abandonat din prima."
- **Filtru de nume** (`hasIdentifiableName`) — comenzile fără niciun nume
  identificabil (doar email/telefon) sunt excluse din coadă complet, indiferent
  de tier. Nu merită efortul unui apel; email-ul automat le acoperă oricum.
- Ghid tipărit pentru echipă: `docs/marketing/ghid-echipa-recuperare-telefonica.pdf`
  (generat din HTML cu Chromium headless, nu pandoc — fără LaTeX pe mașină).

## Decizii de design (brainstorming 2026-09-14)

3 alegeri făcute explicit cu Raul înainte de implementare:

1. **Fără istoric de apeluri** — un singur set de coloane pe `orders`
   (`phone_contacted_at/_by/_notes`), suprascris la fiecare sunare. Nu un
   tabel `order_call_logs` cu mai multe încercări — simplitate aleasă în
   locul istoricului complet.
2. **Cupon custom = extinde `/admin/coupons` existent**, nu formular nou.
   `system_kind` primește a doua valoare (`phone_recovery`), UI-ul de creare
   e prefilled prin query string din pagina de recuperare telefonică.
3. **Coadă de priorizare = pagină nouă dedicată** (`/admin/recuperare-telefonica`),
   nu doar un filtru în tabul „Abandonuri" existent — vizual mai curat pentru
   o coadă de lucru zilnică a echipei.

## Schema DB (migrația 156)

```sql
ALTER TABLE orders ADD COLUMN phone_contacted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN phone_contacted_by TEXT;      -- email admin
ALTER TABLE orders ADD COLUMN phone_contact_notes TEXT;

CREATE INDEX idx_orders_phone_contacted_at ON orders (phone_contacted_at)
  WHERE phone_contacted_at IS NOT NULL;

-- order_history: event_type nou 'phone_contact_logged' (audit, chiar dacă
-- UI-ul arată doar ultima bifă)
-- coupons: system_kind extins cu 'phone_recovery' (pe lângă 'recovery')
```

## Coada de priorizare — `GET /api/admin/orders/priority-calls`

Permisiune: `orders.view`. Reia populația țintă a cronului `recovery-emails`
(status `draft`/`abandoned`, ≤30 zile, draft filtrat prin
`hasProgressBeyondContact` — extras în `src/lib/orders/abandoned-progress.ts`,
partajat acum cu cronul) și o sortează pentru un om, nu pentru un cron:

- **tier 2** — telefon străin (`isForeignPhone`, regex mobil românesc) ȘI
  serviciu de stare civilă (`certificat-nastere`, `certificat-casatorie`,
  `extras-multilingv-certificat-nastere`). Diaspora + termen real (ambasadă,
  oficiu stare civilă) = cea mai bună rată de conversie la telefon
  (cercetare: valoare + urgență = prioritate universală în call-center).
- **tier 1** — telefon străin SAU serviciu de stare civilă (unul din două).
- **tier 0** — restul.

În fiecare tier, cele mai recente abandonuri primele (fereastra utilă de apel
se închide rapid — cercetare: conversie scade mult după 24h de la abandon).

`?includeContacted=1` arată și comenzile deja sunate (implicit ascunse).
Răspunsul include `conversion: { contactedTotal, contactedConverted }` —
proxy simplu: din toate comenzile sunate vreodată, câte au ieșit din
`draft`/`abandoned`/`cancelled` (= au dus comanda mai departe).

## Marcare contact — `POST /api/admin/orders/[id]/phone-contact`

Permisiune: `orders.manage`. Body `{ notes?: string }` (opțional, max 2000
caractere). Suprascrie `phone_contacted_at/_by/_notes` cu apelul curent +
insert în `order_history` (`phone_contact_logged`) pentru audit.

## Cupon custom — extensie `/admin/coupons`

`POST /api/admin/coupons` acceptă acum `system_kind: 'recovery' | 'phone_recovery'`.
Din `/admin/recuperare-telefonica`, butonul „Cupon" deschide
`/admin/coupons?order=<friendly_id>&system_kind=phone_recovery`: pagina
detectează query string-ul, deschide dialogul de creare cu descrierea
pre-completată (`Cupon telefonic — comanda <id>`), cod sugerat `TEL-XXXXXX`,
`max_uses` implicit 1 — **dar procentul/suma rămân la latitudinea agentului**,
nu sunt fixate. Cercetare: discount discreționar, potrivit obiecției reale a
clientului, convertește mai bine decât un procent fix generic dat de sistem.
Tabelul de cupoane arată badge „Telefonic" (albastru) vs „Auto" (galben,
`system_kind='recovery'`) pentru distincție rapidă.

## UI — `/admin/recuperare-telefonica`

Tabel cu prioritate/client/telefon/serviciu/valoare/vechime/status apel +
acțiuni (`tel:` link, bifează sunat cu notă, cupon custom, deschide comanda).
Header arată numărul de comenzi în coadă și rata de conversie curentă.
Nav: `/admin/layout.tsx`, lângă „Abandonuri", permisiune `orders.view`,
ascuns pentru rolul `avocat` (la fel ca restul secțiunii operaționale).

## Fișiere

- `supabase/migrations/156_phone_recovery_tracking.sql`
- `src/lib/orders/abandoned-progress.ts` (nou, extras din cronul recovery-emails)
- `src/app/api/admin/orders/[id]/phone-contact/route.ts`
- `src/app/api/admin/orders/priority-calls/route.ts`
- `src/app/admin/recuperare-telefonica/page.tsx`
- `src/app/api/admin/coupons/route.ts` (extins cu `system_kind`)
- `src/app/admin/coupons/page.tsx` (extins cu prefill din query string + badge)
- `tests/unit/lib/orders/abandoned-progress.test.ts`

## Ce NU face (scop redus intenționat)

- Nu ține istoric de apeluri multiple — vezi decizia 1 de mai sus.
- Nu trimite SMS/WhatsApp automat — doar link `tel:` pentru apel manual.
- Nu calculează "conversie" per apel individual, doar per comandă (proxy).
