# Mesaj echipă — împuternicirea la stare civilă (29 iul 2026)

De trimis pe grupul echipei. Context tehnic:
[`../changelog/2026-07-29-imputernicire-stare-civila.md`](../changelog/2026-07-29-imputernicire-stare-civila.md).

---

**Subiect:** Împuternicirea la stare civilă — completare automată

Salut,

Am îmbunătățit împuternicirea pentru certificatele de stare civilă (căsătorie,
naștere, celibat, extrase multilingve). Două lucruri se completează acum singure.

**1. Se vede despre ce căsătorie e vorba.** Pe certificatul de căsătorie și pe
extrasul multilingv, împuternicirea scrie acum:

*„să obțină certificatul de căsătorie încheiată cu MUSAT DUMITRU la data de
28.03.1992, în Brăila"*

Înainte se oprea la „să obțină certificatul de căsătorie", iar ofițerul de stare
civilă nu știa ce act să caute. Datele se iau din ce a completat clientul în
comandă — nu trebuie să le scrieți voi.

**2. Starea civilă se completează automat.** Unde înainte apărea o liniuță
(„stare status civil:-"), acum scrie *căsătorit(ă)*, *necăsătorit(ă)*,
*divorțat(ă)* sau *văduv(ă)*, dedus din răspunsurile clientului din pasul de
stare civilă. E acordat corect după gen.

**Dacă rămâne gol, e intenționat.** Se întâmplă când din răspunsurile clientului
nu reiese sigur starea civilă — de exemplu a spus că a mai fost căsătorit, dar nu
a spus dacă prin divorț sau deces. Nu completăm cu presupuneri pe un act semnat de
avocat. În cazurile astea, completați voi de mână după acte, pe punctele din
document.

**Ce s-a schimbat pentru client:** dacă cineva cere certificat de căsătorie și
bifează că nu e și nu a fost căsătorit, formularul nu-l mai lasă să continue până
nu corectează. Am avut o comandă exact așa, cu data căsătoriei și numele soțului
completate, dar ambele răspunsuri pe „nu" — de aceea ieșea împuternicirea goală.

**Pentru comenzile mai vechi:** dacă regenerați împuternicirea din admin, iese cu
textul nou. Documentele deja generate rămân cum sunt.

Mulțumesc,
Raul

---

## Reguli, pe scurt (pentru referință internă)

| Ce a răspuns clientul | Ce scrie pe împuternicire |
|---|---|
| căsătorit în prezent | căsătorit / căsătorită |
| nu acum, nici înainte | necăsătorit / necăsătorită |
| nu acum, a fost, prin divorț | divorțat / divorțată |
| nu acum, a fost, prin deces | văduv / văduvă |
| nu acum, a fost, dar nu se știe cum | *gol* |
| comandă de căsătorie care dovedește căsătoria (dată/soț), dar răspunsuri „necăsătorit" | *gol* — nu punem o contradicție pe același rând cu actul |

Nicio întrebare nouă în wizard: totul se deduce din ce se colecta deja.
Template-ele `.docx` sunt neatinse — textul intră prin tag-uri existente.
