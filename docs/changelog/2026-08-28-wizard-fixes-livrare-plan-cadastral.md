# 2026-08-28 — Fixuri wizard: extras multilingv, telefon RO la curier, plan cadastral doar teren

Trei corecții cerute de Raul în aceeași zi + reactivarea predării Sameday în easybox.

## 1. Extras multilingv: scoasă declarația „actul original devine nul"

Pasul de semnătură arăta declarația „documentul anterior își pierde valabilitatea (devine nul)"
la ORICE serviciu cu `civilStatus` în `verification_config` — inclusiv la extrasele multilingve
de naștere și căsătorie, care moștenesc configul de la certificate. Greșit juridic: extrasul
multilingv NU înlocuiește și NU anulează certificatul original.

Fix în `SignatureStep.tsx`: declarația apare doar la serviciile care emit certificat nou
(slug fără prefix `extras-multilingv`). Declarația de corectitudine a datelor rămâne peste tot.
Commit `6e8afa1`.

## 2. Livrare România (Fan/Sameday): telefon de destinatar obligatoriu RO

Fluxul domestic refolosea tăcut telefonul din pasul Contact (care acceptă orice țară) —
un client din diaspora cu +49 producea AWB pe care curierul nu putea anunța livrarea
(SMS/apel doar pe numere RO).

- **Wizard** (`delivery-step.tsx`): dacă livrarea e România și telefonul de contact nu e
  număr RO valid, apare câmp obligatoriu „Telefon destinatar în România" (și la adresă,
  și la easybox/locker). Validare cu libphonenumber-js cu check explicit `country === 'RO'`
  (un +49 cu prefix e respins). Numărul se salvează E.164 în `address.recipientPhone` —
  sursa pe care `generate-awb` o preferă deja.
- **Admin** (`generate-awb`): refuz 400 dacă telefonul rezolvat al destinatarului nu e
  număr RO valid — acoperă comenzile vechi.
- Teste: fixture-urile cu `phone: '0700'` (invalid) înlocuite cu număr valid + 2 teste noi
  pe guard. Commits `7f829c7`, `db45d64`. Spec: `docs/technical/specs/delivery-system-architecture.md` §2.3.

## 3. Sameday: predarea în easybox activată (în sfârșit)

Resemnalat: AWB Sameday tot cu „curier alocat pentru ridicare". Cauza NU era cod —
feature-ul din 17.08 era complet, dar cheia `sameday_dropoff` **nu fusese niciodată
salvată** în `admin_settings` (checklist nebifat). Activată pe 28.08 direct în DB:
`{enabled: true, oohId: "2556"}` = Easybox CC Someșul (C. Coposu 14, Satu Mare).
Detalii: `docs/changelog/2026-08-17-sameday-predare-easybox.md` (follow-up).

## 4. Extras de plan cadastral: doar CF de teren

OCPI respinge automat cererile de extras de plan cadastral pe apartamente — planul
cadastral există doar pentru parcelă (teren). Wizardul lăsa clientul să introducă orice
CF și afla de respingere abia după plată.

Fix în `PropertyDataStep.tsx`, doar pe slug `extras-plan-cadastral`: un CF care se termină
în `-C<n>` (construcție) sau `-C<n>-U<n>` (apartament) **blochează** pasul, cu alert roșu
sub input + mesaj în sumarul de validare: „introdu numărul CF al terenului (doar cifre)".
E singura excepție de la principiul „warn, don't block" al `checkCf` — aici respingerea
OCPI e certă, nu doar probabilă. Celelalte servicii cadastrale rămân neblocate.

## 5. Status nou: „Blocat — instituție indisponibilă" (`on_hold_institution`)

Mircea (pe grup): lucrările pe care NU le poate onora acum (ANCPI picat, registrul
proprietarilor inaccesibil) rămâneau pe „Plătită" și se amestecau cu cele lucrabile —
„nu pot să îi dau nimic": `standby` înseamnă „lipsesc informații de la CLIENT" (cere
notă despre client), iar restul statusurilor lui sunt flux normal. Nu era bug de select.

Livrat (migrarea 150, RULATĂ):
- status nou `on_hold_institution` în CHECK-ul `orders_status_check`;
- **SLA pauzat** exact ca la standby (aceleași coloane `standby_started_at` /
  `standby_total_seconds`) — și în ruta de admin, și în cea de colaborator;
  bonus fix: ruta de colaborator NU pauza SLA nici la standby până acum;
- **admin**: opțiune în „Actualizează Status" (grup special, cu avertismentul de SLA),
  badge roșu „Blocat instituție", tab dedicat în /admin/orders (separat de „Așteptare
  client"), banner SLA pe detaliu, exclus din alertele overdue/deadline;
- **portal colaborator**: opțiune nouă în „Schimbă statusul comenzii" („Blocată —
  instituția indisponibilă"), fără notă obligatorie; listă: etapă nouă
  „Blocate/așteptare" (on_hold + standby), scoase din „De depus";
- **client** (/comanda/status): „În așteptare — instituția emitentă e momentan
  indisponibilă".
