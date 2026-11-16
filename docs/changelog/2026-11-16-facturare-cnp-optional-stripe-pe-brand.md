# 16.11.2026 — Facturare: CNP opțional și nume în ordinea corectă; pagina Stripe arată brandul comenzii
<!-- categorie: plati -->

## Pentru echipă

Trei lucruri s-au schimbat la plată, pe toate cele patru site-uri din platformă (eghiseul, documentero, cazierfiscal, certificat-constatator-express):

- **CNP-ul nu mai e obligatoriu la facturarea pe persoană fizică.** Clientul îl poate lăsa gol și comanda merge mai departe. Pe factură punem atunci 13 zerouri, ca să plece în SPV fără blocaj. Nu mai sunați clientul doar pentru CNP-ul de pe factură.
- **La certificatul constatator pe persoană fizică, numele se completa invers la facturare** (numele de familie ajungea la „Prenume”). Acum intră corect: primul cuvânt la „Nume”, restul la „Prenume”.
- **Pagina de plată Stripe** arată logoul și culorile site-ului de pe care a venit comanda, nu logoul eghiseul peste tot. Sub numele serviciului apare și pentru cine e documentul și numărul comenzii.

Facturile deja emise nu se schimbă.

---

## CNP la facturare

- `billing-step.tsx`: `isPfBillingComplete(..., { cnpOptional: true })` pe toate serviciile (înainte doar la serviciile de carte funciară și la adresă din străinătate). Eticheta câmpului: „CNP (opțional)”.
- `sanitizePfCnp()` din `src/lib/oblio/invoice.ts`: CNP lipsă → `0000000000000` (înainte rămânea gol). CNP cu cifră de control greșită → tot 13 zerouri, ca până acum.
- Excepție păstrată: facturare în străinătate fără CNP → câmpul rămâne gol, ca înainte.
- Când facturarea e pe titular („self”) și CNP-ul din act există, factura îl folosește în continuare.

Decizia din 29.07 („CNP lipsă rămâne gol”) e înlocuită de aceasta, la cererea lui Raul.

## Nume la constatator pe persoană

Câmpul din pasul de cerere cere „Nume și prenume”. Precompletarea de la facturare punea primul cuvânt la `firstName`. Acum primul cuvânt merge la `lastName`, restul la `firstName`.

## Pagina Stripe pe brand

Un singur cont Stripe servește toate brandurile, iar logoul implicit al contului e cel eghiseul.

- `stripeBrandingForOrder()` în `src/lib/brand/for-order.ts`: nume, iconiță, logo și culori după `orders.platform`.
- `createHostedCheckoutSession()` trimite `branding_settings`. Dacă Stripe refuză setările, sesiunea se creează din nou fără ele: aspectul nu are voie să coste o plată.
- Logourile desenate cu alb (cazierfiscal, documentero) primesc fundalul închis al brandului.
- `buildStripeLineItems()` primește `serviceDescription`: „Pentru: <firmă sau persoană> · Comanda <număr>”.

Verificat pe cheia de test Stripe, cu câte o sesiune pentru fiecare brand; văzute în browser paginile de constatator și cazierfiscal.

Limite: titlul filei din browser rămâne numele contului Stripe. Linkul de plată suplimentară (`extra-payment-link.ts`) nu a fost schimbat.

## Teste

`tests/unit/lib/oblio/build-client.test.ts` (CNP lipsă → 13 zerouri; străinătate fără CNP rămâne gol). Suita unitară: 2540 de teste trec.
