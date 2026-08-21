# 2026-08-21 — Cererile de extras CF se generează singure pentru topograf

Portalul ANCPI e picat din 13 iulie, iar comenzile de extras carte funciară se
adună plătite (87 nelivrate, 8.034 lei, la analiza din 14 august). Mircea le
poate depune manual — semnează electronic cererea și creează lucrarea — dar a
cerut ajutor la partea care nu scalează:

> „Am nevoie de ajutor daca aveti cereri multe. Va trimit modelul de cerere care
> trebuie completat." … „Ma intereseaza sa fie corect trecut in denumirea
> fisierului pdf numarul de carte funciara, uat-ul localitatii si judetul …
> pentru ca eu imi iau informatia direct din denumirea pdf-ului, nu mai deschid
> cererea sa o citesc."

## Ce face acum platforma

- **Generează cererea completată** (Anexa nr. 6, „extras de carte funciara
  pentru informare") din datele imobilului de pe comandă. El doar o semnează.
- **O denumește în convenția lui**: `cf 101010 - Baile Govora-Valcea.pdf`.
  UAT-ul vine din nomenclatorul ANCPI validat în wizard, deci nu poate fi scris
  greșit de mână, iar numele și conținutul ies din aceleași date — nu pot
  diverge.
- **Un imobil = o cerere** (cerința lui). Comenzile cu mai multe imobile dau mai
  multe cereri, indexate.
- **ZIP cu toate cererile de depus**, din lista de comenzi — partea de „cereri
  multe". Numele care s-ar suprapune (același CF pe două comenzi) primesc
  numărul comenzii în paranteză, ca ZIP-ul să nu piardă o lucrare plătită.
- **Raportarea depunerii**: nr. de înregistrare OCPI + costul eliberării. Trece
  comanda în „Trimis instituție" (statusul clientului nu mai stă în „procesare"
  cât e lucrarea la ghișeu) și scrie costul în `order_supplier_costs`
  (ANCPI / taxă instituție), deci marja pe comandă rămâne reală.

## Detaliul tehnic care contează

PDF-ul primit de la el **nu e completabil** (`AcroForm` fără niciun widget — el
scrie peste cu typewriter-ul Foxit), și are datele lui de solicitant tipărite în
text. Așa că baza rămâne forma lui, cu **cele 4 linii variabile șterse din
content stream** — nu acoperite cu alb: un dreptunghi alb lasă „108465" din
exemplul lui extractibil la copy-paste, adică exact greșeala de număr CF pe care
fluxul ăsta o previne. Peste ele se desenează valorile comenzii, cu
LiberationSerif (metric Times, 0,3% diferență față de sursă), deci literalele se
reașază pe aceleași poziții și o localitate lungă împinge eticheta următoare, nu
o suprapune.

Mecanismul e cel de la cererea de cazier fiscal: bază înghețată + hartă de
segmente. Asset-urile se reconstruiesc cu
`scripts/build-cf-cerere-pdf-template.ts`, care primește PDF-ul sursă ca
argument — sursa nu e în git (dublează datele lui personale fără câștig).

## Verificat pe cele 109 comenzi reale în așteptare

Rulat generatorul peste tot ce e plătit și nelivrat (cea mai veche: 14 iulie,
a doua zi după ce a picat portalul): **117 cereri din 109 comenzi**, toate cu
județ, UAT și identificator completate — niciuna nu blochează generarea.
Verificare finală, cu PDF-urile chiar randate: **117/117 generate, 0 eșecuri,
0 nume duplicate, 0 cereri fără județ, 7 marcate `verifica`**.

Datele reale au scos și un bug: `normalizeCf` (cea folosită de worker) șterge
toate spațiile interne, deci CF-uri tastate ca **„431001 C1 U2"** sau
**„41971 Moara"** ar fi ieșit pe cerere ca `431001C1U2` / `41971MOARA` — număr
greșit pe o cerere depusă. Fluxul are acum normalizare proprie, care repară doar
ce e neambiguu și lasă restul verbatim.

**6 cereri** au numere pe care nu le putem garanta (carte veche cu `/`, „CF vechi
21 FUNDATICA", CF colectivă) — denumirea lor începe cu `verifica `, singurul caz
în care vrem ca el să deschidă documentul. Iar două comenzi diferite chiar au
același CF (424643-C1-U1, Moșnița Nouă) — dezambiguizarea pe numărul comenzii
nu era teoretică.

## Decizii luate cu Raul (21.08)

| Întrebare | Răspuns |
|---|---|
| Antetul OCPI/BCPI pe județul imobilului? | **Da** (revenire asupra deciziei inițiale) — OCPI și BCPI urmează județul comenzii; la București, sectorul |
| Serie CI / CNP | Rămân goale (de reconfirmat cu Mircea) |
| „fiindu-mi necesar la" | Mereu „informare" |
| Plan cadastral / identificare imobil | **Nu acum** — formulare diferite, pe care nu le avem |
| Mai multe CF-uri pe o cerere? | Nu, un imobil per cerere |

## Corecții după prima verificare pe comenzi reale

- 🔴 **Județul lipsea de pe cerere** (`E-260820-HRHDX` scria doar „Otopeni", fără
  Ilfov; la fel `E-260820-YXEUS` cu Stâlpu/Buzău). Anexa 6 nu are câmp de județ
  pentru imobil, iar cererile se depun la Satu Mare pentru toată țara — deci
  județul merge lângă localitate: **„Otopeni, jud. Ilfov"**. Sectoarele
  Bucureștiului îl au deja în nume, nu se dublează. Liniile erau exact la
  marginea din dreapta, așa că valorile mai lungi scurtează automat punctele de
  umplutură din formular, fără să atingă textul real.
- 🔴 **Județul lipsea tocmai la reședințele de județ**: prima variantă sărea
  peste el când localitatea se numea ca județul („Iași"), dar nomenclatorul are
  un **Satu Mare în Harghita și în Suceava** și un **Călărași în Botoșani, Cluj
  și Dolj** — deci exact reședința devenea cazul ambiguu, pe o cerere depusă la
  BCPI Satu Mare. Acum județul se scrie mereu, mai puțin la sectoarele
  Bucureștiului.
- 🔴 **CF de 1–3 cifre marcat pentru verificare**: pe `E-260803-KLJAW` clientul a
  scris „1" la carte funciară și identificatorul real (`175587-C1-U9`) la
  cadastral — denumirea ar fi trimis topograful să ceară CF 1 în Brașov.
- 🔴 **Previzualizarea de admin ascundea secțiunile de lucru** (`?as=`), deci nu
  se putea verifica din admin dacă topograful chiar are formularul de depunere și
  butonul de încărcare — acum se văd, dezactivate, cu notă.

## Antetul pe județul imobilului + prioritizarea pe vechime

- 🟣 **Antetul nu mai e fix Satu Mare**: `OFICIUL … IMOBILIARĂ ILFOV` /
  `BIROUL … IMOBILIARĂ ILFOV`, centrat, din județul ales de client în
  nomenclatorul ANCPI. La **București** biroul e exact, fiindcă acolo BCPI-urile
  chiar sunt sectoarele, iar sectorul e în numele UAT-ului. Verificat pe toată
  coada: **34 de antete distincte, 0 probleme**.
  ⚠️ BCPI-ul nu e unul per județ (Cluj are 5 birouri, Ilfov n-are niciunul numit
  „Ilfov"), iar maparea UAT → BCPI nu e publicată de ANCPI — adresăm biroul
  județean, topograful corectează excepțiile.
- 🟣 **Comenzile, de la cea mai veche la cea mai nouă** în portalul
  colaboratorului, plus coloana **„Așteaptă"** (roșu peste 21 de zile, portocaliu
  peste 7): clientul care așteaptă de o lună se vede primul, fără căutat.

## Predarea, executată în aceeași zi

- Serviciul `extras-carte-funciara` **alocat lui Mircea** → cele 109 comenzi îi
  apar în portal, cu cererile generate.
- Cele **109 joburi ANCPI `FAILED` → `NEEDS_OPERATOR`** (nu `PENDING`: un retry
  automat le-ar depune a doua oară, adică am plăti de două ori la ANCPI).
- **Nu se mai pun joburi în coadă** pentru comenzile noi de extras CF
  (`HANDED_OVER_TO_COLLABORATOR` în `ensure-ancpi-job.ts`) — altfel, la revenirea
  portalului, worker-ul ar depune peste ce a depus topograful.
- Costul eliberării e **precompletat cu 20 lei** (taxa OCPI standard), editabil.
- Încărcarea PDF-ului **finalizează singură** comanda: document vizibil clientului,
  status `document_ready`, e-mail — nu mai e nevoie de niciun buton în plus.

## Rămas de făcut

- Când revine portalul ANCPI: flagul pe `false` + de decis ce se face cu
  lucrările aflate la topograf.
- De reconfirmat cu Mircea: serie CI / CNP goale și localitatea de pe CF.
- Localitatea de pe cartea funciară o completăm cu UAT-ul, fiindcă wizardul nu
  cere satul (în exemplul lui: UAT Odoreu, CF a localității Eteni). De văzut
  dacă e o problemă la ghișeu.

Detalii: [spec](../technical/specs/cereri-ocpi-colaborator.md)
