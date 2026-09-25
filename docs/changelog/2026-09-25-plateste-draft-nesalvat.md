# 25.09.2026 — „Plătește” trimitea comanda cu ultima modificare nesalvată
<!-- categorie: comenzi -->

## Pentru echipă

Unii clienți apăsau „Plătește” și nu se întâmpla nimic: apărea doar un mesaj
scurt, „Datele de facturare sunt incomplete: lipsește localitatea”, deși în
formular localitatea era aleasă. Cauza: ultima modificare din formular nu
apucase să se salveze. Acum formularul se salvează înainte de trimitere.
Dacă un client vă mai spune că „Plătește nu face nimic”, cereți-i o captură de
ecran și anunțați-l pe Raul.

---

## Tehnic

- Reprodus de două ori pe live (25.09, testul de identificare): județ + localitate alese
  rapid în facturare → `customer_data.billing.city = ''` în DB, UI arăta „Odoreu” →
  `POST /submit` = 400 `BILLING_INCOMPLETE`.
- Cauza: autosave-ul e debounced, iar `SAVE_SUCCESS` pune `isDirty=false` chiar dacă un
  câmp s-a schimbat cât salvarea era în zbor; efectul de autosave depinde doar de
  `isDirty`, deci modificarea rămânea doar în ecran până la următoarea editare.
- Reparație: `handleSubmitOrder` (`src/components/orders/modular-order-wizard.tsx`)
  apelează `await saveDraftNow()` înainte de `/submit`. Afectează toate serviciile.
- Rămâne de făcut: reducerul să nu șteargă `isDirty` când starea s-a schimbat în timpul
  salvării (versiune de stare), ca draftul de pe server să fie la zi și fără submit.
