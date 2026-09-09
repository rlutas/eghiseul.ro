# Jurnal de execuție — ce a rămas după Fazele 0–5

Fazele 0–5 sunt LIVE din 09.09.2026 (vezi `PLAN-RECUPERARE.md`). Documentul ăsta
ține evidența muncii rămase, în ordinea agreată cu ownerul.

| # | De făcut | Stare | Commit |
|---|---|---|---|
| 1 | Soft 404 pe `/servicii/<orice>/` | ✅ livrat | `a3ea1c8` |
| 2 | Întrebări duplicate în FAQ + `llms.txt` + inlinkuri `/tools/` | ✅ parțial (partea necadastrală) | `c279e26` |
| 3 | Diferențierea celor 13 pagini cadastrale | ✅ livrat — 62/78 → **0/78** perechi | `4b9f392` |
| 4 | D3 refăcută (`extras-multilingv-*`) | ✅ livrat — 0,549 → 0,421; regula de mascare corectată | `5bd2583` |
| 5 | Cele 32 de pagini REWRITE, în loturi de 5–6 | 🔄 1/29 livrat (rovinietă `63f8f20`); lot de 5 în lucru | |
| 6 | Cele 29 KEEP + FIX | ⏳ | |

---

## 1. Soft 404 — `/servicii/<orice>/` răspundea 200

**Ce era.** Orice slug inexistent returna **HTTP 200**, cu două `<meta robots>`
care se contraziceau (`index, follow` din layout + `noindex` din not-found).
Adică un spațiu **infinit** de URL-uri „valide" — exact forma de conținut la
scară pe care tocmai o curățaserăm din site. Confirmat pe producție înainte de
reparare.

**Două cauze, nu una.**

1. `generateMetadata` întorcea metadata de consolare (`title: 'Serviciu
   indisponibil'`) în loc să dea 404. Pagina randa 404-ul, dar statusul spunea
   „există", iar titlul era greșit.
2. Chiar și după `notFound()` în metadata, statusul rămânea 200: 404-ul
   prerandat era servit ca pagină validă. A fost nevoie de
   `export const dynamicParams = false`.

**Compromisul, asumat explicit.** Un serviciu activat din admin
(`is_active = true`) nu e accesibil până la următorul deploy, fiindcă lista de
rute se citește din DB la build. Adăugarea unui serviciu e oricum o schimbare de
cod (modul de wizard, șabloane), deci deploy-ul vine oricum. E scris în cod, la
`dynamicParams`.

**Bonus.** `generateStaticParams` nu mai prerandează cele 12 slug-uri de DB care
au pagină dedicată la alt URL și doar redirectează. Fișierele alea inaccesibile
poluau auditul: cele „4 H1 duplicate și 3 titluri dublu-sufixate" raportate la
verificare **nu existau live**, erau doar în build.

**Verificat pe build local:** `/servicii/asdfgh/` → 404, toate cele 111 URL-uri
din sitemap → 200, redirecturile → 308.

---

## 2. Întrebări duplicate, `llms.txt`, linkuri către tool-uri

**Măsurătoarea.** 99 de pagini au `FAQPage`, cu **769 de întrebări distincte** —
deci nu e o fabrică de întrebări. Dar **30 se repetă**, iar acelea se repetă
mult:

| Întrebare | Pe câte pagini |
|---|---:|
| Cât durează eliberarea? | 18 |
| Am nevoie de cont ANCPI? | 14 |
| Cum primesc documentul? | 9 |
| Nu știu numărul cadastral. Ce fac? | 7 |

**Decizia despre marcaj.** Schema `FAQPage` **rămâne**. Oglindește conținut
vizibil real, deci e onestă; Google a restrâns rich results-urile de FAQ, dar
marcajul în sine nu e o încălcare. Problema măsurabilă era duplicarea
întrebărilor, nu existența marcajului.

**Livrat aici:** 17 întrebări reformulate pe cele 9 pagini necadastrale, fiecare
specifică documentului — „În cât timp primesc cazierul fiscal?", „Am doar adresa
terenului, nu și numărul cadastral. Se poate?", „Cum verific că extrasul primit e
autentic?". Restul, pe cele 13 pagini cadastrale, intră la pasul 3, împreună cu
textul lor.

**Verbul instituției.** „Eliberarea" a ieșit din întrebări. OCPI și ANAF
eliberează; noi obținem. Fusese corectat în text pe 12 fișiere, dar
supraviețuise în FAQ-uri — unde e chiar mai vizibil, fiindcă apare în rezultate.

**`llms.txt`.** Scoase două URL-uri consolidate pe 09.09 care acum dau 308,
adăugată secțiunea „Cine suntem" cu paginile de E-E-A-T. Toate cele 31 de
linkuri verificate: 31/31 dau 200.

**Tool-ul de rovinietă.** 32.589 de clicuri pe trei luni, cele mai multe de pe
site — și **două** linkuri interne. Poziția i-a căzut de la 5,95 la 31,92. E
legat acum din calculatoarele auto (impozit auto, amendă de circulație), unde
cererea e cea mai apropiată.

---

## Observație pe drum: unde e cererea geografică reală

Am verificat dacă ștergerea celor 48 de pagini de oraș lasă o gaură de
relevanță. **Nu lasă:** în exportul GSC nu există nicio interogare de tip
„cazier judiciar {oraș}" în primele 1.000. Toată cererea geografică de pe site e
pe **calculatorul de impozit auto**: `impozit auto cluj` 55 de clicuri,
`impozit auto 2026 bucuresti` 130, în total 446 de clicuri și 2.663 de expuneri.

Cele 48 de pagini erau construite pentru o cerere care nu există.

⚠️ De reținut pentru mai târziu: impozitul auto **chiar** are date locale reale
și diferite per localitate (taxele diferă efectiv, prin hotărâre de consiliu
local). E singurul caz de pagini de locație defensibil de pe site. Dar nu acum —
regula din `.claude/rules/content-and-seo.md` §1 spune că nu se construiește
până nu e dovedită recuperarea.

---

## 3. Cele 13 pagini cadastrale — diferențiate pe fond

Analiza le propunea consolidării (20 de clicuri pe toate, scrise în același
commit). Ownerul le-a păstrat: sunt servicii reale, cu venit. Deci trebuiau să
arate a 13 pagini, nu a una copiată de 13 ori.

**Cum s-a diferențiat.** Nu prin sinonime, ci prin ce e fiecare document de fapt,
cine îl cere, ce NU dovedește și cu ce e confundat. Perechile de confuzie sunt
reale și verificabile: releveu vs plan cadastral; copie in extenso vs extras de
informare (ipoteca radiată supraviețuiește în una, dispare din cealaltă);
încheiere de intabulare vs contract; certificat de sarcini vs datoriile la
întreținere (care NU sunt sarcini — cea mai scumpă neînțelegere de pe pagina
aia); actualizare adresă e o operațiune, nu o copie.

**FAQ.** 100 de întrebări, toate unice. Setul stampilat pe 13 pagini a dispărut.

**Măsurat** (HTML prerandat, shingles de 6, aceeași metodă ca la audit):

| | înainte | după |
|---|---:|---:|
| perechi peste 0,25 | 62 / 78 | **0 / 78** |
| cea mai rea pereche | 0,344 | 0,233 |
| mediană Jaccard | 0,266 | 0,221 |
| cuvinte, mediană | 1.714 | 1.772 |
| test de mascare (medie) | urcă +0,020 | **scade −0,002** |

Planșeul de ~0,20 care rămâne e cromul comun tuturor paginilor de serviciu:
`ReviewsSection` (~40% din text), `PrivateServiceNotice`, cardul de preț. Nu se
coboară sub el prin copywriting.

---

## 4. D3 — și corecția regulii de mascare

Perechea `extras-multilingv-*`: 0,751 la audit → 0,549 → **0,421**. Secțiuni care
există pe o pagină și nu pe cealaltă: „Copil născut în străinătate: ordinea
contează" (naștere) și „Schimbarea numelui după căsătorie, în alt stat"
(căsătorie).

**Regula §1 era greșită și am corectat-o.** Prima versiune spunea „dacă la mascare
similaritatea crește, pagina nu se publică". E imposibil de trecut: mascarea
înlocuiește tokenul X din A și tokenul Y din B cu același M, deci creează
potriviri și nu le poate distruge. Verificat pe toate cele patru seturi
măsurate — urcă și la paginile șterse ca doorway, și la cele rescrise în
profunzime. Regula are acum praguri de mărime: mascat > 0,65 sau salt > +0,12 =
nu se publică.

---

## 5. Rescrierile — lotul 1

**Livrat:** tool-ul de verificare rovinietă (`63f8f20`) — 32.589 de clicuri,
demotat de la 5,95 la 31,92. Umplutura care descria ecranul („procesul e simplu
și rapid") a fost înlocuită cu ce întreabă lumea: rovinieta urmează numărul, nu
proprietarul; categoria greșită = inexistentă la control; plata nu apare
instantaneu, nu cumpăra a doua oară; capcana drumului național prin municipiu.

**În lucru (agent, 5 pagini):** amendă rovinietă (scor 20,0, cel mai prost de pe
site), cum aflăm nr. cadastral (4.041 clicuri), ghid integritate (subțire),
info cazier auto (subțire), documente stare civilă 2025.

Din 32: 3 erau cadastrale (făcute la pasul 3), 1 livrată, 5 în lucru → rămân 23.
