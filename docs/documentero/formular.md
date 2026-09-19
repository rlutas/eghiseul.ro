# Formularul de comandă pe documentero.ro

Același wizard ca pe eghiseul (`src/components/orders/modular-order-wizard.tsx`,
rutele din `src/app/(order)/comanda/`), servit pe hostul documentero cu
header-ul, footer-ul și textele documentero prin `BrandProvider` și
`useBrand()`. Nu se scrie un al doilea formular. Ce diferă e cosmetica și
câteva texte; ce e comun e tot restul: salvarea draftului, contul, KYC,
semnătura, livrarea, plata, statusul.

## Pașii, cum îi vede clientul

| # | Pas (eticheta pe documentero) | Modulul din cod | Ce se cere |
|---|---|---|---|
| 1 | Contact | `contact` | email, telefon; codul comenzii se alocă aici |
| 2 | Date personale | `personal-data` | nume, CNP, date din act |
| 3 | Detalii act | `civil-status` | pentru naștere: unde a avut loc, județ, localitate, numele părinților, motivul, adult/minor; pentru căsătorie: data, localitatea, numele soțului înainte de căsătorie, divorț; pentru celibat: starea civilă actuală, căsătorii anterioare, țara și naționalitatea partenerului |
| 4 | Opțiuni | `options` | extras multilingv, apostilă, traducere, legalizare, pachet |
| 5 | Act de identitate | `personal-kyc` | poză față-verso + selfie; sărit dacă contul are KYC valid |
| 6 | Semnătură | `signature` | semnătura desenată; împuternicirea avocațială se generează |
| 7 | Livrare | `delivery` | curier RO / internațional / easybox, adresa |
| 8 | Plată | `billing` + `review` + checkout | facturare PF/PJ, cupon, card sau transfer bancar |

Machetele pentru pașii 3, 4 și 8 sunt în canvas („Formular · 3 ecrane”) plus
pasul 3 pe mobil. Restul pașilor iau același stil.

## Ce e specific documentero

- Header-ul documentero (fără mega-meniul eghiseul) și footerul documentero
  (`BrandFooter`). Deja implementat prin `(order)/layout.tsx`.
- Bara de progres cu opt etichete în limbaj de client, nu numele modulelor.
- Cardul lipicios din dreapta: codul comenzii, liniile de preț, totalul cu TVA,
  cele două reasigurări (salvat automat, date criptate), buton de WhatsApp.
- Textele cu numele site-ului (WhatsApp, disclosure, emailuri) vin din
  `useBrand()` și `brandForOrder()`. Deja implementat pentru wizard, checkout,
  status, succes, emailul de confirmare.
- Culorile: butonul principal mentă cu text pădure, starea selectată mentă
  deschisă, borduri `#DCE3DE`. Se introduc ca variabile CSS pe `[data-brand=
  "documentero"]` în `globals.css`, ca componentele comune să le ia fără fork.
- Pasul 4 întreabă țara în care se folosește documentul și dă un rând de
  explicație (pentru Italia, extrasul e suficient; apostila nu). Regula stă în
  `src/lib/orders/` ca tabel țară → recomandare, refolosibilă pe eghiseul.

## Ce nu se schimbă

Draftul pe server, restaurarea din alt dispozitiv, gardul KYC din `/submit`,
contractul, împuternicirea cu număr din registrul central, plata prin Stripe cu
`success_url` pe documentero.ro, transferul bancar cu dovadă, emailul de
confirmare, sincronizarea în cont, admin-ul. `orders.platform = 'documentero'`
se pune la crearea draftului din host.

## De făcut înainte de lansare

1. Variabilele CSS pe `[data-brand]` în `globals.css` și atributul pe `<body>`
   sau pe wrapper-ul din `(order)/layout.tsx`.
2. Etichetele pașilor și bara de progres în stil documentero (componenta
   `WizardProgress` primește `brand`).
3. `registryPlatform` din brandul comenzii la alocarea numerelor
   (`auto-generate.ts`, `generate-document`).
4. Emailurile secundare (transfer bancar, document gata, completare, reîncărcare
   poză, recovery) cu `brand`.
5. Textele „eghiseul.ro” rămase în `SelfieLegalNotice`, paginile de auth și
   `OrdersTab` din cont.
6. Test A→Z pe documentero cu plată de test, `is_test`, verificare în admin.
