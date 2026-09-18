# 18.09.2026 — Decontări: anulările fără factură inițială se leagă de factura de taxă; Oblio reîncearcă la token expirat
<!-- categorie: plati -->

## Pentru echipă

Payout-ul `po_1UGTTLHGb8JBHhclSJd80vUX` arăta „nefacturat 2". Cele două erau
comenzi anulate cu refund 70% (E-260915-M4A4V pe eGhișeul, CJO-20260915-92116
pe CJO) la care **factura inițială nu apucase să fie emisă**: la prima, Oblio a
răspuns „token expirat" în momentul plății și comanda a fost anulată înainte
de reîncercarea automată; la a doua, CJO se facturează dimineața la 06:00,
iar refundul a venit la 05:51. Banii sunt corecți: 198 − 138,60 = 59,40 =
factura de taxă de anulare (EGH-0681 / EGH-0692).

Ce se schimbă:
- În Decontări, o încasare și refundul ei care n-au factură inițială și nici
  storno, dar au factura de taxă de anulare, se leagă de aceasta, cu mențiunea
  „taxă anulare 30%, fără factură inițială". Payout-ul apare 10/10 după
  următoarea sincronizare (butonul din pagină sau cronul).
- Oblio: când tokenul a expirat, se ia unul nou și cererea se reface pe loc.
  Până acum factura aștepta reîncercarea automată (16 cazuri în 60 de zile).

Nefăcut (decizia lui Raul): facturarea CJO la plată în loc de cronul de 06:00.

---

## Rezumat tehnic

- `lib/accounting/payout-sync.ts`: în `enrichEghiseul` și `enrichCjo`, când
  `!invoice_number && cancel_fee_invoice_number && refunded > 0`, rândul
  (charge sau refund) primește `cancel_fee_invoice_number/url` și sufix pe
  `description`. Select-urile includ `cancel_fee_invoice_url`,
  `refunded_amount` / `refunded_amount_bani`.
- `lib/oblio/client.ts`: `oblioRequest` reface cererea o dată după 401
  (`clearTokenCache` + token nou).
