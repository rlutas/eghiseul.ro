# 06.11.2026 — Trackingul nu mai dă eroare la curierii fără urmărire automată
<!-- categorie: livrare -->

## Pentru echipă

- Comenzile trimise prin Poșta Internațională sau DHL nu mai produc erori în loguri când clientul are pagina de urmărire deschisă.
- Clientul vede în continuare linkul de urmărire pus de voi la AWB.
- Nu se schimbă nimic la pașii voștri: AWB-ul și linkul se pun la fel ca până acum.
- Fan Courier și Sameday se actualizează automat, ca înainte.

---

## Ce s-a schimbat

`/api/orders/[id]/tracking` și `/api/cron/update-tracking` cereau un provider și pentru curierii fără API (`posta_intl`, `dhl_intl`, `dhl`, `posta`). `getCourierProvider` arunca `Unknown courier provider`, iar ruta loga o eroare la fiecare interogare a paginii, adică la 5 minute pe E-261026-B9HW3.

`hasLiveTracking()` din `src/lib/services/courier/live-tracking.ts` limitează interogarea la `fancourier` și `sameday`. Pentru ceilalți curieri, ruta returnează statusul din cache și `delivery_tracking_url`, fără `fetchError`. Cronul îi sare.

Test: `tests/unit/api/orders-tracking.test.ts`.
