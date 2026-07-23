# Status client: istoric curat + AWB manual pentru curieri internaționali (2026-07-23)

## Problema (raportată de Raul, comanda E-260719-LS53Y)

Pagina publică de status (`/comanda/status`) afișa în „Istoricul comenzii"
evenimente interne, brute, în engleză, cu iconița generică de ceas:

- **„abandoned"** + **„recovery email sent"** (cu tot cu codul cuponului de
  recovery) — zgomot pre-plată pe care clientul plătitor nu trebuie să-l vadă
- **„extra payment sent"** cu nota de audit completă: emailul adminului,
  ID-ul Stripe (cs_live_...), diff-ul intern de modificări
- **„la tradus"** fără etichetă românească

## Fixuri

### 1. Server — `/api/orders/status` (sursa timeline-ului)
- `INTERNAL_EVENTS` extins: `abandoned`, `recovery_email_sent`,
  `resume_link_generated`, `document_viewed_by_client`,
  `extra_invoice_issued`, `standby_started` (pe lângă cele existente).
- Statusurile `abandoned`/`draft` filtrate și când vin prin rânduri
  `status_changed`.
- **Sanitizare note**: evenimentele generate de admin nu mai trimit nota
  brută. `extra_payment_sent` → „Ți-am trimis pe email un link de plată
  pentru serviciile adăugate (X RON)" (suma din `new_value.diff`);
  `extra_payment_received` → „Plata suplimentară a fost confirmată";
  `awb_created` → text despre urmărirea coletului. Restul evenimentelor
  ne-whitelistate trimit doar eticheta, fără notă.

### 2. Client — etichete RO + iconițe noi în `STATUS_CONFIG`
`la_tradus`/`la_legalizat`/`la_apostilat` („La tradus" etc.),
`extra_payment_sent` („Plată suplimentară solicitată"),
`extra_payment_received`, `awb_created` („Colet predat curierului"),
`cancellation_requested`.

### 3. AWB manual (cerere: „unde introducem AWB la DHL?")
Generarea automată acoperă doar Fan Courier + Sameday. Pentru DHL/Poșta/
internațional NU exista niciun câmp — acum:
- **`POST /api/admin/orders/[id]/set-awb`** (orders.manage): validare AWB,
  tracking URL construit automat pentru DHL/Poșta (sau primit explicit),
  scrie `delivery_tracking_number/url` + `courier_provider` + eveniment
  `awb_created` în istoric.
- **Formular în cardul Livrare** (admin, comandă): apare la curierii fără
  generare automată — input + „Salvează AWB". Clientul vede imediat cardul
  „Urmărire Colet" pe status page (număr + link tracking).
- Butoanele „Printează eticheta"/„Anulează AWB" ascunse la AWB-urile
  manuale (API-urile Fan/Sameday ar eșua pe ele).

## Verificări conexe (aceeași comandă)

- **Termenul 31.07 e CORECT**: plătit 22.07 09:47 (înainte de cutoff) →
  ziua 1 = 22.07; cazier PF 5 + traducere 2 + legalizare 1 = 8 zile
  lucrătoare → 31.07. Serviciul extra custom nu adaugă zile.
- **Plata extra (824,50 lei cu DHL) e ÎNCĂ PENDING** — link trimis 22.07
  10:50, neplătit (`additional_paid_amount=0`). Link-ul e pe pagina admin.
- **Livrarea comenzii actualizată** la „Email + DHL Express International"
  (era doar Email deși extra-ul include DHL) — script
  `scripts/fix-delivery-LS53Y-2026-07-23.mjs` + notă în istoric.
