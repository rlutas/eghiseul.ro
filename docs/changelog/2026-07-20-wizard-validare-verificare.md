# 2026-07-20 — Verificare mecanism erori wizard + 2 fix-uri UX

Cerere echipă: verificat că highlight-ul + scroll-ul la eroare (când clientul greșește sau uită un câmp) funcționează în tot formularul, pe toate serviciile.

## Rezultatul verificării: mecanismul de bază E OK

`scroll-to-first-error.ts` (livrat 16.07) funcționează. Testat în browser pe 3 servicii cu pași diferiți — extras CF, cazier judiciar, certificat constatator:
- la «Continuă» cu date lipsă, pagina derulează automat prima eroare în centrul ecranului (verificat cu coordonate — eroarea ajunge în viewport)
- mesajele listează **concret** ce lipsește („mai lipsește: alege tipul de client, alege scopul solicitării"), nu un generic „completează câmpurile"

Toate cele 18 componente de pas/modul au marcaj de eroare (`data-wizard-error` sau `aria-invalid`), deci scroll-ul le găsește pe toate.

## Fix 1: eroarea apărea înainte ca clientul să apese Continuă

Trei pași — **PropertyDataStep, VehicleDataStep, SignatureStep** — afișau caseta roșie **permanent** cât timp formularul era invalid, adică din secunda în care intrai pe pas. Te certau pentru un formular pe care nici nu-l începuseși.

Cel mai prost la semnătură: pasul se deschidea cu „Semnătura ta este obligatorie" pe un canvas gol — reproș, nu instrucțiune.

Restul pașilor foloseau deja convenția corectă. Fix: baseline `useState(validationAttempt)` la mount, eroarea se arată doar după prima apăsare pe «Continuă». Baseline-ul împiedică scurgerea unei încercări eșuate de pe pasul anterior. (Aceeași convenție ca `review-step`.)

## Fix 2: „Date Vehicul" la cazier auto = de fapt date conducător auto

Modulul `vehicle` e partajat între două servicii cu înțeles opus:
- **cazier auto** — cere numărul **permisului** (fișa conducătorului de la Poliția Rutieră)
- **rovinietă** — cere numărul de înmatriculare + categorie (chiar despre mașină)

Ambele afișau „Date Vehicul", deci clientul de cazier auto căuta plăcuța/VIN care nu există în pas.

Fix: eticheta se alege din ce colectează efectiv pasul. `drivingLicense` required + `plateNumber` nu → **„Date Conducător Auto"** (în stepper + titlu card + descriere). Rovinietă rămâne „Date Vehicul".

## Acoperire — ce s-a testat și cum

**Analiză de cod: toate serviciile.** Cele 9 servicii active (31 de variante) folosesc aceleași ~18 componente modulare; verificarea la nivel de componentă le acoperă pe toate.

**Test în browser: 5 tipuri de pași**, alese ca să atingă toate modulele:
- extras CF → contact + **property** + billing + review
- cazier judiciar → contact + client-type + KYC + **signature** + review
- certificat constatator → contact + **company/constatator** + review
- cazier auto → contact + **vehicle** (aici s-a găsit numele greșit)
- (stare civilă — CivilStatusStep — de retestat live după deploy)

Modulele atinse direct: contact, property, signature, company/constatator, vehicle, options, billing, review, KYC. Rămâne de confirmat live doar CivilStatusStep (certificate de stare civilă), care folosește aceeași convenție `validationAttempt` verificată la celelalte.

## Fișiere

`src/components/orders/modules/property/PropertyDataStep.tsx` · `.../vehicle/VehicleDataStep.tsx` · `.../signature/SignatureStep.tsx` · `src/lib/verification-modules/step-builder.ts`
