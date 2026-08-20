# 2026-08-20 — CNP-uri REALE respinse: „Codul județului din CNP este invalid"

Semnalat de Raul pe `E-260819-XHHD5` (cazier PJ, MARIN CONSTANTIN): OCR-ul
scosese CNP-ul de pe buletin, iar wizardul răspundea **„Nu am putut citi CNP-ul
de pe documentul scanat"** + eroarea **„Codul județului din CNP este invalid"**
sub câmpul completat manual. Clientul n-a putut trimite comanda; a rămas draft.

## Nu poza era problema

Ipoteza inițială: poza actului era rotită 90°, deci AI-ul n-a citit bine. Am
rulat OCR-ul nostru pe exact acea imagine, în ambele orientări:

| Imagine | Rezultat |
|---|---|
| rotită 90° (cum a trimis clientul) | `success`, CNP **1860125471335**, nume corect, încredere 95, cu observația proprie „Image is rotated. Manual rotation was performed" |
| dreaptă | `success`, CNP **1860125471335**, încredere 98 |

Gemini citește actul rotit fără probleme. **CNP-ul extras era corect** — noi
îl refuzam.

## Cauza reală

CNP-ul lui are codul de județ **47**. Validatorul nostru avea o listă albă
(01–46, 51, 52) și arunca orice altceva. Verificare pe date reale:

- Cifra de control a CNP-ului **corespunde** — deci e un CNP emis, nu o eroare
  de tastare.
- Pe CJO/ecazier avem comenzi **PLĂTITE și FINALIZATE** cu cod **47** (trei) și
  **80** (patru; printre ei oameni născuți în Moldova și Maroc). Toate cu cifra
  de control corectă.
- Validatorul de pe CJO (`src/lib/cnp-utils.ts`) **nu verifică deloc județul** —
  de-asta acolo au trecut, iar pe eghiseul se blocau.

Lista clasică de coduri nu e exhaustivă; registrul emite și în afara ei. Să
refuzi un CNP cu cifra de control corectă fiindcă nu recunoaștem județul
înseamnă să ne credem mai deștepți decât registrul populației.

## Fix

`src/lib/validations/cnp.ts`: codul de județ nu mai e listă albă. Rămâne
refuzat doar **`00`** (nu se atribuie niciodată și e ce folosesc datele de
test). Integritatea o dă **cifra de control**, care era deja verificată.
`COUNTY_CODES` rămâne doar pentru AFIȘAREA numelui județului
(`getCountyFromCNP`) — cod necunoscut = n-avem nume, nu „CNP invalid".

Aceeași corecție și în `src/utils/cnp-validator.ts` (copie nefolosită, ca să
nu reînvie bug-ul).

## Coșuri abandonate afectate

Din 783 de comenzi draft/abandonate/pending, **2** au rămas blocate exact aici:

| Comandă | Data | CNP salvat | Client |
|---|---|---|---|
| `E-260819-XHHD5` | 19.08 | `186012` (trunchiat; real `…47133…`, județ **47**) | gabrielmarin.trans@yahoo.com / +40764456909 |
| `E-260719-7JW4K` | 19.07 | `198082380776` (12 cifre; județ **80**) | victortomita98@gmail.com / +447599495807 |

Restul (10) au CNP gol, date de test sau sunt cetățeni străini fără CNP — nu
țin de asta. Ambii clienți pot fi recuperați acum: cu fix-ul în producție,
CNP-ul lor trece.

## Teste

`tests/unit/lib/validations/cnp.test.ts`: codurile 47/48/49/50/53/80/99 sunt
acceptate (erau respinse), CNP-ul real din `E-260819-XHHD5` trece, `00` rămâne
refuzat, iar `getCountyFromCNP` întoarce `null` pentru coduri fără nume — fără
să invalideze CNP-ul.
