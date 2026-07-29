# 2026-07-29 — Împuternicirea de stare civilă: care căsătorie și ce stare civilă

Pe `E-260728-Z77WC` (certificat de căsătorie, dosar cetățenie) împuternicirea ieșea cu

```
să exercite următoarele activităţi: să obțină certificatul de căsătorie, stare status civil:-
```

Două probleme într-un singur rând: nu se știe **care** căsătorie, iar starea civilă e o
liniuță.

## De ce era goală starea civilă

`FILIATIE` se completa din `civil_status.maritalStatus`, dar acel câmp e colectat
**doar la certificatul de celibat**: în `verification_config`, `maritalStatus` e `false`
pe căsătorie și absent pe naștere. Din 88 de comenzi de stare civilă, doar 10 aveau
valoarea — restul primeau `''`, iar codul punea `|| '-'`.

Acum eticheta se deduce din răspunsurile pe care le avem:

| Situație | Etichetă |
|---|---|
| `maritalStatus` declarat (celibat) | valoarea declarată, acordată pe gen din CNP |
| căsătorit în prezent | căsătorit / căsătorită |
| nu acum **și** nici înainte | necăsătorit / necăsătorită |
| nu acum, a fost, încheiată prin **divorț** | divorțat / divorțată |
| nu acum, a fost, încheiată prin **deces** | văduv / văduvă |
| nu acum, a fost, dar nu știm cum | *gol* |
| nimic cunoscut | *gol* |

**Fără nicio întrebare nouă în wizard.** Cele patru stări civile se deduc din
răspunsuri care se colectează deja: „Sunt căsătorit(ă) în prezent?", „Am mai fost
căsătorit(ă)?" și „Ultima căsătorie s-a încheiat prin: divorț / deces". Un client
recăsătorit rămâne „căsătorit" — răspunsul despre prezent are prioritate. Se acceptă
și forma veche cu diacritice („Divorț"), salvată de versiuni anterioare ale pasului.

Fără `-` de umplutură: template-ul are deja punctele de completare, iar o liniuță arată
ca un câmp uitat. Pe un act juridic preferăm un spațiu liber unei presupuneri.

### Verificat generând documentul, nu doar funcțiile

Prima variantă trecea testele unitare, dar documentul real ieșea așa:

```
să obțină certificatul de căsătorie încheiată cu MUSAT DUMITRU la data de
28.03.1992, în Brăila, stare status civil:necăsătorită
```

Pe comanda cu răspunsuri contradictorii, eticheta dedusă („ambele nu" →
necăsătorită) ajungea pe același rând cu dovada căsătoriei. De aceea, când comanda
**demonstrează** o căsătorie (certificat de căsătorie cu data sau soțul completate),
eticheta „necăsătorit" e suprimată — inclusiv când ar fi declarată explicit. Rândul
rămâne gol, iar operatorul îl completează după acte.

## Care căsătorie

`ACTIVITATI_SC` numește acum și actul, pe cele două servicii de căsătorie:

```
să obțină certificatul de căsătorie încheiată cu MUSAT DUMITRU la data de 28.03.1992, în Brăila
```

Datele existau deja în comandă (`spouseNameBeforeMarriage`, `marriageDate`,
`registrationPlace`) — erau folosite pe *cerere*, dar nu ajungeau pe împuternicire.
Fiecare bucată e opțională: se adaugă doar ce s-a colectat, niciodată puncte sau
etichete goale.

**Template-ele .docx rămân neatinse** — textul intră prin tag-uri existente, deci nu e
nevoie să reîncarce nimeni vreun șablon.

## Cauza din spate: formularul accepta o combinație imposibilă

Comanda avea data căsătoriei și numele soțului completate, dar **ambele** bife pe „Nu":
`currentlyMarried: false`, `wasMarriedBefore: false`. Adică: „cer certificatul de
căsătorie, dar nu sunt și n-am fost căsătorită".

Pasul de stare civilă respinge acum combinația, cu mesaj explicit la «Continuă»:

> Ai bifat că nu ești și nu ai fost căsătorit(ă), dar ceri certificatul de căsătorie —
> corectează una dintre cele două întrebări

Așa nu mai ajung în lucru comenzi din care operatorul nu poate reconstitui starea
civilă — cazul semnalat, cu clienta căsătorită de două ori care nu completase corect.
