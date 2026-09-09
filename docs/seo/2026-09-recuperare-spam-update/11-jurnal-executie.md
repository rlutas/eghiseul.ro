# Jurnal de execuție — ce a rămas după Fazele 0–5

Fazele 0–5 sunt LIVE din 09.09.2026 (vezi `PLAN-RECUPERARE.md`). Documentul ăsta
ține evidența muncii rămase, în ordinea agreată cu ownerul.

| # | De făcut | Stare | Commit |
|---|---|---|---|
| 1 | Soft 404 pe `/servicii/<orice>/` | ✅ livrat | `a3ea1c8` |
| 2 | Întrebări duplicate în FAQ + `llms.txt` + inlinkuri `/tools/` | ✅ parțial (partea necadastrală) | `c279e26` |
| 3 | Diferențierea celor 13 pagini cadastrale | 🔄 în lucru | |
| 4 | D3 refăcută (`extras-multilingv-*`) | ⏳ | |
| 5 | Cele 32 de pagini REWRITE, în loturi de 5–6 | ⏳ | |
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
