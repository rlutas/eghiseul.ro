# 17.09.2026 — Telefoanele care nu sunau și ce scrie acum despre păstrarea actelor
<!-- categorie: clienti -->

## Pentru echipă

Două lucruri, amândouă găsite testând comanda pas cu pas pe telefon.

**1. Aveam 46 de comenzi cu numărul de telefon greșit în sistem.**

Formularul de comandă arată deja „+40" în câmp, iar omul își scrie numărul cum îl
spune: 0712 345 678. Rezultatul salvat era `+400712345678` — cu un zero în plus.
Comanda mergea mai departe fără să spună nimic, dar **acel număr ajungea pe AWB și
pe factură**, iar curierul care-l forma nu ajungea la nimeni.

- 46 de comenzi reparate (numerele lor sunt acum corecte);
- 5 profiluri de client reparate;
- de acum înainte zeroul se taie automat, la orice formular de pe site.

Dacă ai avut colete întoarse cu „nu răspunde la telefon" în ultimele luni, asta
poate fi explicația pentru o parte dintre ele.

**2. Am schimbat ce promitem despre actul de identitate și selfie.**

Politica de confidențialitate spunea că le ștergem în 30 de zile de la livrare.
Nu le ștergeam, și nici nu putem: sunt dovada că am verificat identitatea
persoanei pentru care am depus cererea, iar la un control trebuie să o putem
arăta. Acum scrie adevărul: **le păstrăm cât ține contractul plus 3 ani**,
împreună cu dosarul comenzii, iar clientul poate cere ștergerea când nu mai avem
o obligație legală care să ne oprească.

Dacă te întreabă un client cât păstrăm poza: 3 ani de la finalizarea comenzii,
pentru dovadă la control.

---

## Ce s-a livrat tehnic

### Telefonul: zeroul național după prefix

`react-international-phone` nu taie zeroul de trunchi când câmpul afișează deja
prefixul (verificat în browser, pe producție). `isValidPhoneNumber` îl acceptă —
recunoaște 0 ca prefix național al României — deci comanda NU era blocată și
nimic nu semnala problema. Paguba era în aval: `+400712345678` e ce salvăm, ce
punem pe AWB și ce trimitem la Oblio.

`src/lib/format/phone-trunk-zero.ts` taie zeroul o singură dată, în câmpul comun,
pentru toate formularele. **Italia e exclusă deliberat**: fixele italiene își
păstrează zeroul (`+39 06 …` e Bucureștiul lor), iar Italia e una dintre țările
preferate din câmp, din cauza diasporei. 8 teste.

### Telefonul: o singură formă în bază

Contul avea un `type="tel"` liber, unde oamenii scriau `0712 345 678`; wizardul
produce E.164. Amândouă scriu `profiles.phone`, iar wizardul citește coloana ca
să prefill-eze pasul de contact — deci un număr salvat în cont se întorcea
într-o formă pe care câmpul nu o înțelegea. `normalizePhone()` rulează acum la
fiecare scriere: `PATCH /api/user/profile` și metadatele de la înregistrare, pe
care `handle_new_user()` le copiază în profil. Ce nu se poate parsa se păstrează
cum a fost scris — un telefon pe care nu-l putem citi e tot unul pe care echipa
îl poate suna.

**Reparat în producție:** 46 de comenzi cu `+400…` și 5 profiluri în format
național. Ambele numărători sunt acum zero.

### Retenția actelor de identitate

Decizia proprietarului: nu ștergem. Politica promitea 30 de zile de la livrare;
codul nu ștergea nimic, iar documentația S3 spunea 3 ani — trei surse care se
contraziceau. Politica spune acum ce se întâmplă: durata contractului + 3 ani,
împreună cu dosarul comenzii, în temeiul art. 17 alin. 3 lit. b și e GDPR
(apărarea unui drept în instanță, respectiv obligația de a dovedi verificarea
identității la control). Se potrivește cu regula de lifecycle deja documentată
pe prefixul `kyc/` (1095 de zile), iar textul de lângă uploaderul de selfie
spune același număr.

Politica numește acum și selfie-ul drept **dată biometrică** (art. 9 GDPR) și
spune cine compară fețele: Google (Gemini) în cont, un coleg la comenzile din
formular.

⚠️ **De verificat manual, o singură comandă:** regula de lifecycle pe bucket
chiar e aplicată? `aws s3api get-bucket-lifecycle-configuration --bucket eghiseul-documents`.
Dacă nu e, nu șterge nimic nimic, niciodată — și atunci „3 ani" din politică
rămâne o promisiune neacoperită.
