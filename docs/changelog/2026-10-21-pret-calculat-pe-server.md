# 21.10.2026 — Prețul comenzii se calculează pe server la „Plătește"
<!-- categorie: plati -->

## Pentru echipă

- La „Plătește", prețul (serviciu, opțiuni, livrare, cupon) se recalculează acum pe server, din prețurile din admin. Clientul plătește exact ce e setat în admin, iar suma e aceeași la card și la transfer bancar.
- Prețul traducerii pe limbă (de exemplu daneza, mai scumpă) se aplică corect. Înainte, verificarea făcea un calcul greșit, apoi era ignorată.
- Pentru voi nu se schimbă nimic. Dacă schimbați un preț în admin, comenzile trimise după aceea îl folosesc pe cel nou.
- Am verificat pe toate cele 115 comenzi plătite din 15.09 încoace: calculul nou dă exact suma plătită. Singura excepție e o comandă modificată de echipă după plată.

---

- `src/lib/orders/server-pricing.ts` (`computeServerPricing`, `couponDiscount`): bază (tarif permis străin / tip document constatator / serviciu), opțiuni din `service_options` (după `option_id`, fallback după `code` în serviciul comenzii; traducere după `translation_price_list` + supliment cu apostilă Haga; cantitate între 1 și `max_quantity`), livrare cu minim 25 lei la Fan/Sameday, reducere doar din cupon valid (aceleași reguli ca la `/payment`).
- `/api/orders/[id]/submit`: scrie `base_price`, `options_price`, `delivery_price`, `discount_amount`, `total_price` și `selected_options` din calculul de pe server; înlocuiește cele două corecții punctuale de dinainte (permis străin, traducere — aceasta din urmă citea `priceModifier` în loc de `price_modifier`). Hash-ul contractului folosește totalul de pe server.
- Teste: `tests/unit/lib/orders/server-pricing.test.ts`.
