# Feedback validare wizard („de ce nu pot continua")

Înainte: butonul „Continuă" era doar **dezactivat** pe un pas invalid — clientul nu știa CE lipsește. Acum, la apăsare pe pas invalid, primește **lista a ce lipsește + scroll automat** la problemă (esențial pe mobil).

## Mecanism (provider + wizard)
- `ModularWizardContext` expune `validationAttempt: number` + `requestValidation()`.
- Butonul „Continuă" e apăsabil; `handleNext` → dacă pasul e invalid: `requestValidation()` (incrementează counter-ul) + **toast** universal „mai sunt câmpuri obligatorii". NU avansează.
- Fiecare pas care implementează feedback ascultă `validationAttempt` → afișează lista + face `scrollIntoView` la banner.

## Pași cu listă detaliată (KYC)
- **PersonalDataStep** — `getMissingItems()`: CNP valid, nume, prenume, dată naștere, set complet scanări per tip act (CI vechi față / CI nou față+spate+RO CEI PDF / pașaport), date cetățean străin (localitate+țară naștere, adresă). Banner roșu „Nu poți continua — completează:".
- **KYCDocumentsStep** — `getMissingItems()`: pașaport (străin), selfie, act față+spate (ruta manuală), certificat domiciliu, permis rezidență. Banner „Nu poți continua — încarcă:".

Ambele: banner cu `ref` → scroll smooth `block:'center'` când `validationAttempt` crește.

## Restul pașilor
Butonul tot dă feedback prin **toast** (plasă de siguranță); pașii non-KYC au deja validare inline pe câmpuri.

## Fișiere
- `src/providers/modular-wizard-provider.tsx` (validationAttempt + requestValidation)
- `src/components/orders/modular-order-wizard.tsx` (handleNext + toast)
- `src/components/orders/modules/personal-kyc/{PersonalDataStep,KYCDocumentsStep}.tsx`

## Viitor
- Scroll direct la PRIMUL câmp invalid (acum scroll la banner-ul rezumat).
- Extindere listă detaliată la contact / billing / civil-status dacă e nevoie.
