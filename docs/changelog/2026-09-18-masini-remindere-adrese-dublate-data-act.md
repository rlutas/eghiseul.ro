# 18.09.2026 — Remindere pentru mașini (rovinietă/ITP/RCA), adrese fără dubluri, data actului citită corect, CUI primul la firmă
<!-- categorie: clienti -->

## Pentru echipă

Patru lucruri din testul lui Raul pe cont, toate live.

**1. Mașinile din cont primesc remindere pe email.** Formularul „Mașini" cere
acum doar ce contează: numărul, un nume opțional, marca/modelul și cele trei
termene — rovinietă, ITP, RCA. Nr. de permis, VIN-ul și anul au dispărut din
formular. Cu 14 zile înainte de expirare (și până la 30 de zile după), clientul
primește un email; pentru rovinietă emailul trimite pe **erovinieta.net**, cu
numărul deja completat — e platforma noastră, deci fiecare reînnoire e a
noastră. ITP și RCA primesc doar reminderul. Un singur email per termen, iar
după ce clientul pune data nouă, ciclul reîncepe. Se pornește/oprește din
`/admin/marketing` → „Reminder mașini"; e pornit.

În formular există și „Verifică aici" cu widgetul erovinieta.net: arată dacă
rovinieta e valabilă, dar **nu ne dă data înapoi** — clientul o copiază în
câmp. Ca să se completeze singură ne trebuie un API pe erovinieta.net (de
discutat).

**2. Adresele nu se mai dublează.** Scanarea actului salva „Adresă din act" de
două ori (o dată la citirea actului, o dată la salvarea datelor personale).
Acum aceeași adresă — stradă + număr + localitate, oricum ar fi scrisă — e
recunoscută și nu se salvează a doua oară, indiferent de unde vine. Dublura de
pe contul lui Raul a fost ștearsă.

**3. „Valabil până la: Invalid Date"** la actul de identitate: data citită de
pe act („02.07.2029") nu era înțeleasă. Acum se afișează „2 iulie 2029" și se
salvează corect ca dată de expirare.

**4. La profilul de facturare pe firmă, CUI-ul e primul**: îl scrii, apeși
„Verifică", ANAF completează denumirea, Registrul Comerțului și sediul.
Eticheta profilului a coborât la final și se completează singură (numele
firmei sau al persoanei) când ajungi pe ea.

---

## Rezumat tehnic

### Remindere mașini

- Migrarea **175**: `user_saved_vehicles.rovinieta_reminded_for / itp_reminded_for /
  insurance_reminded_for` (DATE) = data de expirare pentru care s-a trimis.
- `src/lib/vehicles/reminders.ts` (pur, testat): fereastra [−14, +30] zile,
  o dată per dată de expirare; `daysUntil` pe miezul nopții local.
- `src/lib/email/templates/vehicle-reminder.ts`: subiect + corp pe tip; CTA
  rovinietă → `https://erovinieta.net/checkout?plate=<nr>&utm_source=eghiseul&utm_medium=email&utm_campaign=rovinieta-expiry`;
  ITP/RCA → `/account/?tab=vehicles`. Notă de dezabonare din registrul de
  contacte (`marketing-footer`).
- `GET|POST /api/cron/vehicle-reminders` (zilnic 07:50 UTC în `vercel.json`):
  `CRON_SECRET`, gate `admin_settings.lifecycle_emails.vehicleReminder`
  (implicit pornit), `.or()` doar pe SELECT, contact creat din email-ul
  profilului dacă lipsește (`sources: ['platforma:cont-masini']`),
  `canReceiveMarketing`, `idempotencyKey` = `vehicle-<tip>-<id>-<dată>`,
  coloana `*_reminded_for` scrisă DUPĂ trimitere, max 150/rulare, `?dry=1`
  listează cine e „due" fără să trimită. Verificat local cu `dry=1`: mașină
  cu rovinieta la +7 zile → 1 reminder.
- Admin: `lifecycle-card.tsx` + `api/admin/settings` acceptă `vehicleReminder`.
- `VehiclesTab`: formular redus + card „Termene" + `ErovinietaEmbed`
  pliabil. Coloanele `vin`/`year`/`driving_license` rămân în tabel.

### Adrese

- `src/lib/account/same-address.ts`: `sameAddress` / `findSameAddress`
  (stradă + număr + localitate, fără diacritice/punctuație/„str., nr., bl.").
  `sync-paid-order.ts` îl re-exportă de aici.
- `POST /api/user/addresses` întoarce rândul existent (`deduplicated: true`)
  pentru aceeași adresă, cu `is_default` respectat; lookup-ul e fail-soft.
- `POST /api/user/kyc/save` caută aceeași adresă sub orice etichetă, nu doar
  „Adresă din act", și o actualizează în loc să insereze.

### Data actului

- `src/lib/format/romanian-date.ts`: `isoFromRomanianDate`, `toIsoDate`
  (RO / ISO / timestamp → `YYYY-MM-DD`, `null` altfel), `formatRoDateLoose`.
  `personal-fields.ts` re-exportă de aici.
- `GET /api/user/profile` normalizează `expiryDate`/`expires_at`;
  `kyc/save` parsează tolerant (`new Date('02.07.2029')` arunca);
  `ProfileTab` afișează prin `formatRoDateLoose`.

### Facturare

`BillingProfileForm`: câmpul „Etichetă profil" mutat la final, cu `onFocus`
care propune numele firmei / `formatPersonName`; ordinea PJ: CUI → Verifică
(ANAF) → denumire → Reg. Com. → sediu → bancă → etichetă.

### Teste

`tests/unit/lib/vehicles/reminders.test.ts` (fereastră, o dată per dată,
date românești, adresă identică) + test de dedupe în
`tests/unit/api/user-addresses.test.ts`. Suita: 1963 verzi.
