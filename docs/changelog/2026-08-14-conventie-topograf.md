# 2026-08-14 — Convenția cu topograful: „Angajament de execuție documentație"

Cerut de Raul, pe baza modelului pe hârtie folosit de Mircea (topograful): pe
serviciile imobiliare, clientul semnează — odată cu contractul nostru de
prestări — și convenția cu executantul, în care trec UAT-ul, numărul cadastral
și numărul de carte funciară.

## Ce lipsea în flux

Verificarea fluxului actual a scos trei lucruri, nu unul:

1. serviciile topograf **nu aveau deloc pas de semnătură** (`signature.enabled =
   false` pe toate 14) — nici contractul de prestări nu era semnat de client;
2. nu se colectau date de identificare (`personalKyc` off), deci convenția n-ar
   fi avut ce scrie la „Proprietar/Beneficiar";
3. previzualizarea de la semnătură genera `contract-asistenta` pe **toate**
   serviciile, inclusiv pe cele fără avocat, care nu-l primesc niciodată.

## Ce s-a livrat

**Document nou `conventie`** — `src/templates/shared/conventie.docx`, fidel
modelului lui Mircea, generat din sursa HTML păstrată în
`src/templates/sources/conventie.html`. Se emite automat la submit, alături de
contractul de prestări, cu semnătura clientului în ambele.

**Pas de semnătură activat** pe cele 14 servicii (migrarea 142): clientul vede
contractul + convenția și semnează o singură dată.

**Câmpuri noi în pasul „Date imobil"** (apar doar unde convenția e activă):
nume și prenume proprietar, domiciliu, CNP (validat), serie + număr act de
identitate, plus localitatea și strada imobilului. Proprietarul se cere separat
de facturare — partea din convenție e cel din cartea funciară, nu plătitorul.

**Onorariul** trecut în convenție = suma plătită de client (TVA inclus).
Punctul 4 din modelul pe hârtie prevedea plată în două tranșe direct către
executant; textul spune acum realitatea — plată integrală, în avans, prin
platformă, cu trimitere la contractul de prestări. Restul documentului e
identic cu modelul.

**Colaboratorul o vede la el**: `/colaborator/orders/[id]` are secțiunea
„Angajament de execuție documentație" cu „Deschide PDF" + varianta Word.
Endpoint nou `GET /api/collaborator/orders/[id]/document`, care servește DOAR
convenția și propriile lui încărcări — restul documentelor comenzii (contract,
cereri, date client) rămân inaccesibile.

**Echipa o vede în admin**, în „Documente generate", cu previzualizare,
descărcare și buton de regenerare.

**Previzualizarea reparată**: la semnătură se randează exact documentele care se
și generează (prin avocat → prestări + asistență; prin topograf → prestări +
convenție; restul → doar prestări).

## Verificare

- `tests/unit/lib/documents/conventie.test.ts` — verifică textul DOCX-ului
  generat (imobil, proprietar, onorariu, executant, spațiile punctate).
- `scripts/preview-conventie.ts <FRIENDLY_ORDER_ID>` — randează convenția pentru
  o comandă reală, local, fără să atingă S3 sau DB. Rulat pe `E-260810-EP896`
  (comanda pentru care Mircea completase convenția de mână) — iese identic.

Spec: [`technical/specs/conventie-topograf.md`](../technical/specs/conventie-topograf.md).

## De urmărit

Migrarea 142 trebuie rulată din nou (e idempotentă) când un serviciu NOU e
asignat topografului — altfel acel serviciu nu primește nici convenție, nici pas
de semnătură.
