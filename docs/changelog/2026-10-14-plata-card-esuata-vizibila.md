# 14.10.2026 — Plata cu cardul eșuată se vede în Neplătite și în Recuperare telefonică
<!-- categorie: clienti -->

## Pentru echipă

Până azi, când banca refuza cardul clientului, comanda apărea doar „abandonată, pas: Facturare”, ca și cum clientul s-ar fi oprit în formular. Acum vedeți exact ce s-a întâmplat:

- **„Plată cu cardul eșuată”** (roșu), cu motivul refuzului: clientul voia să plătească și banca a zis nu. Spuneți-i că poate plăti **prin transfer bancar (IBAN)**: deschide comanda din linkul primit pe email și alege „Transfer bancar”. Poate încerca și cu alt card. Acești clienți apar primii în Recuperare telefonică.
- **„A ajuns la plata cu cardul”** (galben): a deschis pagina de plată și a ieșit fără să plătească.
- **„pas: …”**: s-a oprit în formular, înainte de plată.

Se vede în **Comenzi → Neplătite** (sub status) și în **Recuperare telefonică** (sub serviciu). Fiecare refuz apare și în istoricul comenzii. Procedura completă: [Recuperare telefonică](../admin/recuperare-telefonica.md).

Merge doar pe eGhiseul și doar pentru încercările de plată de azi încolo.

---

## Context

E-261014-GD94K (Certificat constatator, 89 lei): Stripe a trimis două `payment_intent.payment_failed` („Your card was declined”, 10:04 ora României). Webhook-ul doar le scria în log (`handlePaymentFailed`), iar comanda a trecut pe `abandoned` după 30 de minute cu `current_step='billing'`. Carla a sunat-o fără să știe că clientul încercase să plătească.

`current_step` nu ajunge niciodată dincolo de ultimul pas din wizard: pagina de plată nu-l actualizează. Deci „pas: Facturare” apărea și la clienții care ajunseseră la card.

## Ce s-a schimbat

- Migrarea `194_payment_failure_signal.sql`: `orders.payment_failed_count`, `payment_last_failed_at`, `payment_last_error` (codul Stripe: `decline_code` sau `code`); `order_history.event_type` acceptă `payment_failed`.
- `src/app/api/webhooks/stripe/route.ts` → `handlePaymentFailed` incrementează contorul, salvează codul și scrie în istoric. Sare peste PI-urile `extra_charge` și peste comenzile deja plătite.
- `src/lib/admin/payment-signal.ts`: `paymentSignal()` alege eticheta: refuz > sesiune Stripe creată (`stripe_checkout_session_id`) > pasul din wizard. `declineReason()` traduce codurile Stripe.
- `src/components/admin/payment-signal-note.tsx`: aceeași etichetă în `admin/orders` (compact) și `admin/recuperare-telefonica` (cu sugestia IBAN).
- `api/admin/orders/list` și `api/admin/orders/priority-calls` întorc câmpurile noi. Coada telefonică pune refuzurile primele. La deduplicarea pe email, refuzul de pe o comandă mai veche a clientului se păstrează.
- Teste: `tests/unit/lib/admin/payment-signal.test.ts`.

## Limite

- Istoricul de dinainte nu se poate reface: refuzurile erau doar în logurile Vercel, iar căutarea pe mai multe zile dă timeout. E-261014-GD94K a fost completată manual (2 refuzuri, `card_declined`).
- CazierJudiciarOnline are alt repo și alt Stripe. Acolo nu s-a schimbat nimic.
