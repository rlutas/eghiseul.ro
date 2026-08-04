# 2026-08-04 — Tracking Poșta internațional: parcelsapp în loc de posta-romana.ro

## Simptom

Echipa (04.08): „awb posta tracking nu merge" — exemplu `E-260713-T5BVW`, AWB `RN755687985RO`. Pe `posta-romana.ro/track-trace.html?awb=` clientul vedea „trimiterea nu a fost încă înregistrată în baza de date poștală", deși coletul era în tranzit de 12 zile.

## Diagnostic (verificat în browser pe AWB-ul real)

Link-ul Poștei **nu e stricat** (pagina citește `?awb=` și răspunde) — dar pentru trimiterile **internaționale** baza Poștei nu are evenimente pe toată durata tranzitului. Evenimentele reale vin de la **poșta de destinație, prin UPU**: parcelsapp.com arăta pentru același AWB traseul complet România → Elveția (vamă trecută 26.07, sortare Zürich, 2 încercări de livrare eșuate, colet la punct de ridicare Adliswil din 29.07 — Swiss Post + UPU). Poșta Română nu-și publică evenimentele internaționale pe trackerul propriu.

## Fix (`src/app/api/admin/orders/[id]/set-awb/route.ts`)

`defaultTrackingUrl` pentru curier „posta": AWB-urile în **format UPU S10** (`^[A-Z]{2}\d{9}RO$`, ex. `RN755687985RO`) primesc link **`https://parcelsapp.com/en/tracking/{AWB}`** (deep-link stabil, agregă UPU + poșta de destinație). AWB-urile interne (numerice, ex. `1560604183`) rămân pe `track-trace.html?awb=`.

## Backfill (rulat prin REST, 04.08)

4 comenzi cu AWB UPU actualizate la parcelsapp: `E-260713-T5BVW`, `E-260716-RAFUG`, `E-260726-FHD3D` (shipped) + `E-260708-VYC2B` (completed). `E-260715-HUQ5T` (AWB numeric intern) păstrat pe Poșta.

## ⚠️ Rămas

- **Portare CJO + ecazier** — acolo link-ul Poșta se construiește la randare (fix retroactiv automat odată portat).
- parcelsapp e terț cu reclame — dacă deranjează, alternativa mai curată e trackerul poștei de destinație, dar aia diferă per țară; parcelsapp e compromisul universal (echipa îl folosea deja manual).

## Istoric înrudit

- 30.07: `awb.html` retras de Poștă (soft-404) → trecut pe `track-trace.html` (`docs/changelog/2026-07-30-tracking-posta-si-fixuri-cjo.md`). Fixul de azi e stratul următor: `track-trace` funcționează, dar e orb pe internațional.
