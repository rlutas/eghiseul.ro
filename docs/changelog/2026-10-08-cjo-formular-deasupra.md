# 08.10.2026 — CJO: formularul urcă din nou sus, pe paginile de oraș, prima pagină și fiscal
<!-- categorie: seo -->

## Pentru echipă

Din 06.10, pe cazierjudiciaronline.com se începeau de 3–4 ori mai puține comenzi
(16–19 pe zi în loc de 55–75), deși oamenii veneau din Google aproape la fel.
Cauza: paginile de oraș spuneau întâi „programul ghișeului” și că cazierul se ia
de la poliție, iar formularul ajunsese mai jos pe telefon. Am pus formularul
înapoi imediat sub titlu, titlurile vorbesc iar de comanda online, iar adresa și
programul ghișeului au rămas în pagină, sub formular. Pentru voi nu se schimbă
nimic în admin. Dacă vedeți mai multe comenzi începute de joi încolo, de aici
vin.

---

## Ce s-a întâmplat

| Zi | Formulare începute (pasul 1) | Clicuri GSC | La 100 de clicuri |
|---|---|---|---|
| 21.09–04.10, zile lucrătoare | 55–87 | 550–800 | 9–12 |
| Luni 05.10 (deploy pagini oraș la 10:28) | 40 | 541 | 7,4 |
| Marți 06.10 | 16 | — (întârziere GSC) | ~3 la trafic egal |
| Miercuri 07.10 | 17 | — | ~3 |

Comenzi plătite CJO luni–miercuri: 12 · 13 · 12 · 11 → 6.

Două schimbări au împins formularul în jos:
- **05.10, paginile de oraș (C1):** titlul „Cazier judiciar X: program ghișeu și
  varianta online”, prima frază „îl eliberează IPJ, gratuit, la ghișeu”, apoi
  caseta ghișeului, apoi oferta. Pe mobil formularul începea la 1,17 ecrane.
  Snippetul aducea oameni care voiau să meargă singuri, iar pagina le dădea
  exact asta.
- **06.10, blocurile „Pe scurt” (H14)** pe prima pagină și pe fiscal, puse
  deasupra formularului, tot cu „gratuit”.

## Ce s-a schimbat (CJO `4812265e`)

- Paginile de oraș: titlul „Cazier judiciar online X, fără drum la poliție”;
  descrierea vinde comanda și menționează că adresa și programul ghișeului sunt în pagină.
- Hero pe oraș, prima pagină și fiscal: titlu + preț → **formular** → blocul
  „Pe scurt”, caseta ghișeului, insignele. Pe desktop formularul rămâne în dreapta.
  Pe mobil formularul începe la 0,45 ecrane (oraș), 0,63 (prima pagină), 0,66 (fiscal).
- Fără „gratuit” în blocurile de sus: cazierul „se poate elibera la ghișeul IPJ X”,
  respectiv „se poate obține și din SPV sau de la ghișeul ANAF”. Tabelele de
  comparație de mai jos rămân neschimbate.
- Datele IPJ verificate rămân în pagină, deci similaritatea între orașe nu crește.

## Cum verificăm

- Zilnic: formularele începute pe zi (`abandoned_sessions`, sursa
  `cazierjudiciaronline`) trebuie să revină spre 50+ în zilele lucrătoare.
- 13.10: raportul formulare începute / clicuri GSC pe 09–12.10, ținta 9%+.
- Excepție asumată de la regula „o pagină o dată la 14 zile”: pierdeam ~6 comenzi
  pe săptămână. Testul de titluri P1 de pe 21.10 nu e afectat (alte pagini).
