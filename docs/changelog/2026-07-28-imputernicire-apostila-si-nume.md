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
