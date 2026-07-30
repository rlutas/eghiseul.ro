# 2026-07-30 — Împuternicirea de căsătorie: formatul modelului completat de mână

Raul a adus modelul completat de mână de colegă (`SM 007455 / 30.07.2026`, extras
multilingv de căsătorie) și a cerut ca documentul generat să iasă la fel:

```
activităţi: Să obţină Extrasul Multilingv de Căsătorie încheiată cu TAKACS ENIKO
NICOLETA la data de 07.02.1987, în Localitatea: Oradea, Judetul: Bihor.
Stare Status Civil: Căsătorit
```

Generatorul scria totul pe un singur rând, cu litere mici:

```
activităţi: să obțină extrasul multilingv de căsătorie încheiată cu X la data de
07.02.1987, în Bihor, stare status civil:căsătorit
```

## Ce s-a schimbat

**Cod** (`src/lib/documents/generator.ts`):

1. **Numele documentului capitalizat** — `CIVIL_STATUS_DOCUMENT_MAP` trece pe Title
   Case („Extrasul Multilingv de Căsătorie", „Certificatul de Naștere"...), iar
   `buildActivitatiStareCivila` începe cu „Să obțină" (S mare). Se aplică pe toate
   cele 5 servicii de stare civilă — stil unitar.
2. **Locul cu etichete** — pe cele două servicii de căsătorie, locul devine
   „în **Localitatea: X, Județul: X**" (în ordinea cerută: localitatea, apoi județul).
   Wizardul colectează UN singur câmp de loc (`registrationPlace` = județul care a
   înregistrat actul), deci aceeași valoare umple ambele etichete — aceeași convenție
   folosită deja pe cererea ANEXA 4 (rândurile „localitatea"/„județul" primesc
   amândouă `registrationPlace`).
3. **Punct final pe textul de căsătorie** — fraza se închide cu „." pentru că ce
   urmează nu mai e pe același rând.
4. **Eticheta stării civile capitalizată** — `{{FILIATIE}}` iese „Căsătorit(ă)", nu
   „căsătorit(ă)" (`capitalizeFirst` la mapare; `buildStareCivilaLabel` rămâne
   neschimbat).

**Template-uri** (de data asta DA s-au modificat — spre deosebire de sesiunea din
29.07):

- `src/templates/certificat-casatorie/imputernicire.docx`
- `src/templates/extras-multilingv-certificat-casatorie/imputernicire.docx`

Literalul dintr-un singur run `{{ACTIVITATI_SC}}, stare status civil:` a devenit
`{{ACTIVITATI_SC}}<w:br/>Stare Status Civil: ` — deci „Stare Status Civil:" coboară
pe rând nou, capitalizat, cu `{{FILIATIE}}` imediat după. Stilul (bold, subliniat,
albastru) e al run-ului existent, moștenit și de rândul nou.

Template-urile de **naștere/celibat NU s-au atins**: acolo literalul vechi
`, stare status civil:` rămâne în șablon, de aceea textul non-căsătorie NU primește
punct final (virgula din șablon urmează imediat după tag).

## Rezultat generat (căsătorie)

```
să exercite următoarele activităţi: Să obțină Extrasul Multilingv de Căsătorie
încheiată cu TAKACS ENIKO NICOLETA la data de 07.02.1987, în Localitatea: Oradea,
Județul: Bihor.
Stare Status Civil: Căsătorit
```

## Partea a 2-a (aceeași zi): localitatea REALĂ a căsătoriei se colectează acum

Prima variantă umplea ambele etichete cu județul („Localitatea: Bihor, Județul:
Bihor") pentru că wizardul colecta un singur câmp de loc. Raul a decis: **vrem
localitatea și județul, amândouă, pe document.**

- **Wizard** (`CivilStatusStep.tsx`): câmp nou obligatoriu „Localitatea în care a
  avut loc căsătoria" (`marriageLocality`), afișat DOAR la `documentType ===
  'casatorie'` (certificat + extras multilingv), chiar deasupra județului. Fără
  migrare — se activează pe gate-ul existent `fields.registrationPlace`.
- **Persistență**: `customer_data.civil_status.marriageLocality` →
  `client.marriage_locality` (auto-generate.ts).
- **Documente**: împuternicirea scrie „Localitatea: Oradea, Județul: Bihor";
  `buildLocCasatorie` (cererile ANEXA 4/59, rândul „în localitatea …, județul …")
  preferă localitatea și abia apoi cade pe județ. `buildJudetCasatorie` rămâne pe
  județ. **Comenzile vechi** (fără localitate): județul umple ambele etichete —
  comportamentul de dinainte, nimic nu se strică.
- **Admin**: rând nou „Localitatea căsătoriei" în cardul de stare civilă.

## Partea a 3-a: rezumatul de comandă pe mobil se poate închide vizibil

Un client a deschis „Rezumat comandă" din bara sticky de jos și n-a mai știut să-l
închidă (30.07, screenshot WhatsApp). Existau două căi ne-evidente: tap pe backdrop
și chevron-ul de jos („Apasă pentru a ascunde"). Adăugat **buton X** dreapta-sus pe
panoul deschis (`modular-order-wizard.tsx`), cu fundal alb + umbră ca să se vadă
peste conținut. Backdrop-ul rămâne.

## Verificat

- `tests/unit/lib/documents/generator.test.ts` — 71/71 trec (test nou: localitate ≠
  județ → „Localitatea: Oradea, Județul: Bihor").
- `npx tsc --noEmit` curat (CI type-checkează și testele).
- XML-ul ambelor template-uri verificat după patch (`{{ACTIVITATI_SC}}</w:t><w:br/>…Stare Status Civil: `).
