# AWB manual pentru Poșta/internațional + nume destinatar corect la Fan (2026-07-23)

## Problema (raportată de Raul, comanda E-260716-RAFUG)

1. **Nu apărea „Adaugă AWB manual" la Poșta Română / curieri internaționali.**
   Comanda RAFUG = „Poșta Română International", dar `delivery_method` avea doar
   `name` (fără câmp `provider`/`code`), deci detecția returna null → secțiunea
   AWB pica pe fallback-ul „Generează AWB" (Fan/Sameday), care ar fi eșuat.
   Formularul manual apărea DOAR când provider-ul era detectat ȘI ne-Fan.

2. **La generarea AWB pe Fan Courier nu se punea numele cerut în „Date livrare".**
   Ruta `generate-awb` construia destinatarul din `customer_data.contact` /
   `personalData` (numele celui care comandă), IGNORÂND
   `delivery_address.recipientName` — exact numele pe care echipa/clientul îl
   introduce pentru livrare (livrare către altă persoană / nume în străinătate).
   Admin-ul afișa corect destinatarul, dar AWB-ul pleca cu alt nume.

## Fixuri

### 1. AWB manual pentru orice curier ne-Fan/Sameday
- Detecție extinsă (`detectedCourierProvider`): recunoaște acum din numele
  metodei și `poșta/posta`, `dhl`, `easybox` (nu doar `fan`/`sameday`).
- `AwbSection`: formularul manual apare acum când `!hasAwb` și provider-ul NU e
  Fan/Sameday — INCLUSIV când provider-ul e necunoscut/nedetectat. Butonul
  „Generează AWB" (automat) rămâne doar pentru Fan/Sameday.
- Endpoint-ul `set-awb` (existent) construiește link de tracking pentru
  Poșta/DHL automat.

### 2. Numele destinatarului la Fan AWB
`generate-awb` folosește acum ACEEAȘI prioritate ca afișarea din admin:
`delivery_address.recipientName || delivery_address.name || contact.name ||
contact/personal firstName+lastName`. La fel pentru telefon
(`recipientPhone`). Bonus: `personal` (nu doar `personalData`) e citit corect.

## Fișiere
- `src/app/admin/orders/[id]/page.tsx` — detecție + AwbSection.
- `src/app/api/admin/orders/[id]/generate-awb/route.ts` — destinatar corect.

## Verificare
tsc + lint curate. RAFUG (Poșta, shipped, fără AWB) arată acum formularul
manual de AWB. Paritate cu cazierjudiciaronline.com (AWB manual pt. curieri
neautomatizați).
