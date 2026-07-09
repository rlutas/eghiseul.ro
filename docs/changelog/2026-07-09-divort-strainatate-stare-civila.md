# 2026-07-09 — Întrebări divorț la stare civilă + minim livrare 25 lei + admin RO + fix motiv PJ

## Fix: motivul solicitării lipsea la comenzile PJ (cazier)

- **Cauza**: în `contact-step.tsx`, dropdown-ul „Motivul solicitării" era gated
  pe `clientType === 'PF'` — la cazier PJ (și orice serviciu PJ cu listă de
  motive) motivul NU se colecta deloc. Regresie găsită pe comanda
  **E-260708-VC4GH** (cazier PJ fără motiv în `customer_data`).
- **Fix wizard**: dropdown-ul apare acum ori de câte ori serviciul are listă de
  motive (`showsPurpose = !!purposeOptions`), indiferent de PF/PJ/null.
  Validarea pasului cere motiv ales (nu poți continua fără).
- **Fix admin**: la „Detalii Serviciu", pe serviciile cazier/integritate, dacă
  motivul lipsește din date apare explicit **„necompletat — cere clientului"**
  (chihlimbar), în loc să dispară rândul. Comenzile vechi fără motiv (ca
  E-260708-VC4GH) nu pot fi backfill-uite — echipa vede semnalul și cere
  motivul de la client.

## Admin: layout comenzi stare civilă + format date

- „Date stare civilă" mutat **lângă** „Informații Client" (coloana dreaptă,
  primul card), cu Livrare + Facturare dedesubt — cerință user.
- Datele ISO din cardul civil (ex. `marriageDate` din `<input type="date">`)
  se afișează acum **dd.mm.yyyy** (prin `formatDateOnly`), consecvent cu
  restul admin-ului.

## Minim livrare România: 25 lei cu TVA (era 20)

- `MIN_DELIVERY_PRICE_WITH_VAT = 25` — mutat ca constantă de config în
  `src/components/orders/steps-modular/delivery-step.tsx` (lângă
  `DELIVERY_MARKUP_PERCENTAGE = 0.15`).
- **Cum funcționează prețul livrării**: quote LIVE de la API Fan/Sameday →
  +15% markup → floor 25 lei cu TVA. Floor-ul se aplică la TOATE cotele
  domestice (Fan standard, FANbox, Sameday standard, EasyBox), după markup.
  Prețul afișat = `delivery_price` în DB = ce plătește clientul în Stripe
  (nu există recalcul server-side).
- Verificat live pe Cluj-Napoca: FANbox 25.00, Fan standard 25.00 (ambele
  ridicate de floor), EasyBox 33.48, Sameday 24H 39.38 (peste floor, nemodificate).
- Motivație: să nu vindem livrarea sub cost (procesare, plic, manoperă).

## Ce s-a livrat

La toate cele 5 servicii de stare civilă cu istoric marital (certificat
naștere, căsătorie, celibat + extras multilingv naștere și căsătorie), când
clientul alege **„Ultima căsătorie s-a încheiat prin → Divorț"** apar două
întrebări noi în wizard:

1. **„Unde s-a făcut divorțul?"** — România / Străinătate (obligatoriu)
2. Dacă Străinătate → **„A fost înregistrat divorțul în România?"** — Da / Nu
   (obligatoriu)

Warning-ul existent („divorțul pronunțat în străinătate trebuie
recunoscut/transcris...") nu mai apare mereu la Divorț — apare **doar** când
divorțul e în străinătate și **nu** a fost înregistrat în România (răspuns Nu).

## Detalii tehnice

- **Fără migrare DB** — nu s-a schimbat `verification_config`; întrebările apar
  automat unde `civilStatus.fields.maritalHistory = true` și clientul alege
  Divorț.
- State nou în `CivilStatusState` (`src/types/verification-modules.ts`):
  `divorcePlace?: 'ro' | 'strainatate'`, `divorceRegisteredInRomania?: boolean`.
- UI + validare: `src/components/orders/modules/civil-status/CivilStatusStep.tsx`
  — răspunsurile se curăță automat dacă clientul schimbă pe „Deces" sau înapoi
  pe „România".
- Datele curg automat în `customer_data.civil_status` (provider-ul salvează
  obiectul întreg).
- Admin (`src/app/admin/orders/[id]/page.tsx`): etichete noi în „Date stare
  civilă" („Divorțul a avut loc în", „Divorț înregistrat în România") + valorile
  brute (true/false, ro/strainatate, divort/deces) se afișează acum în română
  (Da/Nu, România/Străinătate, Divorț).

## Bonus: admin — „Date stare civilă" complet în română + rânduri cu separator

- **Toate cheile** din cardul „Date stare civilă" au acum etichete românești
  (înainte apăreau brute: `bornAbroad`, `applicantType`, `marriageAbroad`,
  `currentlyMarried`, `wasMarriedBefore`, `registrationPlace`,
  `oldCertificateReason`). Cheile necunoscute încă apar verbatim (nu se ascund).
- **Valorile** se afișează în română: true/false → Da/Nu, adult/minor →
  Adult/Minor, necasatorit/divortat/vaduv → Necăsătorit(ă)/Divorțat(ă)/Văduv(ă),
  pierdut/distrus/furat → capitalizate.
- **Stil rânduri** (după modelul cazierjudiciaronline): linie separatoare sub
  fiecare rând (`border-b border-border/60 py-1.5 last:border-b-0`) — aplicat
  pe `InfoRow` + toate rândurile inline label/valoare din pagina de comandă
  individuală admin (toate cardurile: client, firmă, livrare, facturare,
  Stripe, imobil, stare civilă).

## Verificare

Testat vizual în wizard pe `certificat-nastere` (localhost): întrebările apar
la Divorț, sub-întrebarea + warning-ul apar doar la Străinătate + Nu, și dispar
la schimbarea răspunsului. `tsc --noEmit` curat. Partea de admin (etichete +
separatoare) verificată doar prin typecheck — de confirmat vizual pe o comandă
reală de stare civilă.
