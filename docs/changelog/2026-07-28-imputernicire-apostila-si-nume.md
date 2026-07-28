# 2026-07-28 — Împuternicirea de apostilă nu spunea pe ce document + numele clientului scris greșit

Trei defecte găsite pe aceeași comandă, `E-260728-YFHH2` (cazier judiciar PF + apostilă
de la Haga, pentru viză în Brazilia).

## 1. Apostila fără obiect

Împuternicirea scria:

> …să se prezinte la INSTITUȚIA PREFECTULUI - JUDEȚUL SATU MARE, **în vederea aplicării
> Apostilei de la Haga.** Motivul solicitării: VIZĂ.

Apostila se aplică **pe un document**, iar prefectura trebuie să știe pe care. Textul se
oprea fără obiect. Acum:

> …în vederea aplicării Apostilei de la Haga **pe Cazier Judiciar**. Motivul solicitării: VIZĂ.

Cauza: `buildInstitutie()` completa documentul-țintă doar pentru add-on-urile „bundled"
(apostilă pe un act secundar, ex. certificat de integritate). Când apostila e pe
**serviciul principal** — cazul obișnuit — `delegation_service_type` e simplu
(`apostila_haga`), deci nu exista slug de la care să ia documentul.

Fix: intrarea `apostila_haga` e marcată `appliesToDocument: true`, iar ținta se ia din
add-on-ul bundled dacă există, altfel din serviciul comenzii. Funcționează pentru toate
serviciile cu apostilă:

| Serviciu | Text generat |
|---|---|
| cazier judiciar | …aplicării Apostilei de la Haga **pe Cazier Judiciar** |
| certificat naștere | …**pe Certificat de Naștere** |
| certificat căsătorie | …**pe Certificat de Căsătorie** |
| cazier fiscal | …**pe Cazier Fiscal** |
| add-on integritate (bundled) | …**pe Certificat de Integritate Comportamentală** |

Împuternicirile care NU sunt de apostilă rămân neatinse („în vederea ridicării Cazier
Judiciar").

## 2. Caractere MRZ în nume: „ADRIAN<MIHAIL"

Pe împuternicire apărea `ADRIAN<MIHAIL PEROUPOPA`. Zona citibilă automat de pe pașaport
(MRZ) folosește `<` ca separator între prenume și ca umplutură; OCR-ul l-a întors ca
atare, iar caracterul a intrat în baza de date și de acolo în documentul avocațial.

Reparat în două locuri:
- **la sursă** — `parseGeminiOCRResponse()` curăță acum câmpurile de nume (`firstName`,
  `lastName`, `previousName`, `fatherName`, `motherName`, `birthName`, `spouseName`)
  pentru TOATE tipurile de document, nu doar CI. Câmpul `mrz` rămâne neatins: acolo `<`
  e informație, nu gunoi;
- **la afișare** — orice compunere de nume trece prin `cleanNamePart()`, deci datele
  vechi se randează corect fără migrare.

Scanarea întregului istoric: **o singură comandă** avea chevroni în nume (aceasta).
Datele ei au fost corectate în DB.

## 2b. „PEROU" lipit de numele de familie — a treia raportare, acum reparat

Aceeași comandă a scos la iveală un defect mai vechi, semnalat de colegi de **trei
ori** fără să fie prins: la pașapoarte, numele de familie venea cu „PEROU" în față.

| Comandă | Ce scria | Corect |
|---|---|---|
| `E-260713-NYT6R` | PEROU**ZAVATE** | ZAVATE |
| `E-260716-ENUUE` | PEROU**CIOBANU** | CIOBANU |
| `E-260718-ZZ4C5` | PEROU **MIHAI** | MIHAI |
| `E-260723-BM9UT` | PEROU**DUCIUC** | DUCIUC |
| `E-260728-YFHH2` | PEROU**POPA** | POPA |
| `E-260728-RAJ26` | IDROU**COMAN** | COMAN (carte de identitate) |

**Cauza:** linia 1 din MRZ-ul de pașaport (TD3) începe cu `P<ROU` — `P` = tipul
actului, `ROU` = țara emitentă. Modelul îl citea ca parte din nume și, pierzând `<`,
îl scria „PEROU". Exact același tipar exista deja la cărțile de identitate („IDROU"),
unde fusese reparat în iunie — dar corecția rula **doar** pe `ci_front`, nu și pe
pașapoarte. Ultimul rând din tabel arată că și varianta de CI mai scăpa când MRZ-ul
nu se parsa.

**Fix, pe trei niveluri:**
1. `recoverNamesFromMrz()` taie acum și prefixul de pașaport (`P<ROU`, generic
   `P<XXX` pentru orice țară emitentă), nu doar `IDROU`;
2. corecția din MRZ rulează și pe pașapoarte (`extractFromPassportOpened` +
   `extractFromPassport`), nu doar pe CI;
3. plasă de siguranță când MRZ-ul lipsește sau nu se parsează: `stripMrzCountryPrefix()`
   taie prefixul direct din numele de familie. Restrâns deliberat la combinațiile
   tip-act+țară — „Roua", „Peruzzi", „Idriceanu" rămân neatinse (testate).

Promptul de pașaport spune acum explicit că `P<ROU` nu face parte din nume, cu exemplu
corect și greșit — aceeași abordare ca la CI.

**Date corectate:** scanarea întregului istoric a găsit **6 comenzi** (nu 3, cât
raportase echipa). Toate au fost corectate în DB, în `personal` și `billing`.

⚠️ Patru dintre ele au deja documente generate pe numele greșit
(`E-260713-NYT6R` — depusă la instituție, `E-260718-ZZ4C5` — finalizată,
`E-260728-YFHH2`, `E-260728-RAJ26` — abandonată). Regenerarea din admin păstrează
numărul de delegație, deci e sigură.

## 3. Ordinea numelui: familie întâi

Documentele și listele scriau „Prenume Nume". Convenția românească în acte e invers:
**numele de familie primul** — „PEROUPOPA Adrian Mihail".

Nou: `src/lib/format/person-name.ts` — `cleanNamePart()`, `formatPersonName()`,
`formatPersonNameFrom()`, cu 12 teste. Aplicat în:

- generarea documentelor (`auto-generate.ts`, `buildClientDetailsBlock` — client PF și
  reprezentant PJ), preview contract, generare manuală din admin;
- admin: dashboard, lista de comenzi, detaliul comenzii, registru, portal colaboratori,
  costuri furnizori, link de plată extra;
- exportul de comenzi (era deja familie-întâi, dar necurățat);
- numele destinatarului la livrare — un `<` într-un AWB e o problemă reală la curier.

Când avem doar un câmp `name` compus, îl curățăm dar **nu** îl reordonăm: într-un șir
liber nu poți ști unde se termină numele de familie.

## De făcut manual

Împuternicirea deja generată pentru `E-260728-YFHH2` are textul și numele vechi.
Regenerarea din admin e sigură: alocarea de numere e idempotentă per (comandă, tip),
deci documentul refăcut **păstrează seria SM 007442** — nu consumă un număr nou.

## Verificare

`1.345` teste trec (12 noi pentru formatarea numelui, 3 actualizate pentru
comportamentul nou), `tsc` curat, lint fără erori. Textele de apostilă verificate pe
toate cele 5 servicii + varianta bundled.
