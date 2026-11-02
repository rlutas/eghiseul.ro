# 02.11.2026 — CJO: traducerea are preț pe limbă, ca pe eGhișeul
<!-- categorie: plati -->

## Pentru echipă

- Pe cazierjudiciaronline.com traducerea autorizată costă acum în funcție de limbă, cu aceleași prețuri ca pe eGhișeul. Exemple: engleză, franceză, germană 178,50; rusă, poloneză 249; daneză, suedeză 349.
- Când documentul are și Apostilă Haga, traducerea are un supliment pe limbă, tot ca pe eGhișeul. Germană + apostilă = 248,50; engleză + apostilă = 218,50.
- Clientul alege din 20 de limbi (înainte erau 9). Aceeași listă apare și la comanda nouă din admin și la „Modifică comanda".
- Paginile site-ului scriu acum „de la 178,50 lei".
- Comenzile plătite înainte rămân la prețul plătit. Dacă la „Modifică comanda" vedeți o diferență doar din cauza prețului nou, nu e plată în plus de cerut.

Cerut din Ghid (traducerea pentru un document apostilat se încasa la prețul fix).

---

## Tehnic

- CJO `src/config/translation-prices.ts`: `translationPriceBani(language, withApostila, fallback)`; tabelul = `translation_price_list` activ de pe eGhișeul. Folosit în `checkout-line-items.ts` (Stripe), `order-total.ts`, `order-line-items.ts`, `smartbill/build-invoice.ts`, Step4/Step6, admin comandă nouă/modifică.
- Suplimentul vine din apostila ACELUIAȘI document: `traducere`←`apostila_haga`, `cert_traducere`←`cert_apostila`, `cazier_traducere`←`cazier_apostila`.
- Fix colateral: modify ștergea `limba_traducere` când `traducere` era oprită, deși `cert_traducere`/`cazier_traducere` erau pornite.
- Teste CJO: `tests/unit/config/translation-prices.test.ts`, `tests/unit/lib/translation-pricing-parity.test.ts` (paritate Stripe / total / contract / factură).
