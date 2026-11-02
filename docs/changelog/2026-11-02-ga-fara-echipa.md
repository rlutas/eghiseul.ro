# 02.11.2026 — Google Analytics nu mai numără echipa
<!-- categorie: admin -->

## Pentru echipă

- Când lucrați în admin sau în portalul colaboratorului, nu mai apăreți în Google Analytics ca vizitatori ai site-ului.
- Cifrele din GA (utilizatori activi, pagini vizitate) arată acum doar clienții.
- Nu trebuie să faceți nimic diferit.

---

## Tehnic

- `isInternalPath()` în `src/lib/consent.ts`: `/admin` și `/colaborator` (prefix exact).
- `CookieConsent` setează `window['ga-disable-<GA_ID>']` la fiecare schimbare de rută, înainte de efectul care încarcă gtag.js, deci opt-out-ul acoperă și navigarea client-side spre admin.
- Motiv: pe 02.11 `/admin/orders/` apărea în topul paginilor din „Pagini în timp real”.
- Test: `tests/unit/consent-internal-path.test.ts`.
- Clarificare pentru Raul: 107 în „Pagini în timp real” = ultimele 4 ore, 17 în „Prezentare generală” = ultimele 30 de minute; nu e o scădere de trafic.
