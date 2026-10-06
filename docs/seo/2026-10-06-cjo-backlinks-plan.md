# Linkuri către cazierjudiciaronline.com: se merită și cum le facem fără risc

**Data:** 06.10.2026 · **Cerut de:** Raul („putem face linkuri către CJO, se merită, ajută organicul?”)
**Stare:** analiză, nimic implementat. Decizii de luat: §6.

---

## 1. Pe scurt

- **Linkurile nu vor aduce comenzi în octombrie.** Un link nou se vede în poziții după 4–12 săptămâni, dacă se vede. Pârghiile pentru octombrie rămân CTR-ul (titlu și meta, făcute pe 05.10), conversia pe paginile de oraș (H2) și emailurile (pornite azi).
- **Unde ar conta linkurile:** pe cuvântul principal. „cazier judiciar online” are 14.314 afișări în 14 zile, dar CJO e pe **poziția 6,1, cu CTR 0,61%**. Prima pagină e pe **7,4**, cu 34.463 de afișări. Pe orașe suntem deja pe 2–4, iar acolo linkurile ar schimba puțin.
- **CJO are deja linkuri plătite fără `rel="sponsored"`.** Sunt patru, două pe Antena 3 și câte unul pe ProTV și infocons.ro, cu 3 linkuri dofollow fiecare, unele cu ancora exactă „cazier judiciar online”. Ăsta e riscul principal acum, nu lipsa de linkuri (§3).
- **Experiența eghiseul spune să nu mai cumpărăm.** Paginile care au primit linkuri plătite dofollow în iulie (pachetul de 880 €) au căzut după spam update-ul din august: extras CF de la 7,84 la 22,32, constatator de la 14,3 la 21,2. Asta nu dovedește că linkurile au cauzat căderea. Dovedește însă că nu le-au protejat.
- **Recomandarea:** puțini pași, siguri, fără bani pe linkuri (§5).

## 2. Ce arată Search Console (CJO, `sc-domain:cazierjudiciaronline.com`)

Proprietatea de domeniu are date doar din **20.09.2026**, deci comparația e pe săptămâni, nu pe 28 de zile.

| Săptămâna ISO | Clicuri | Afișări |
|---|---|---|
| 39 (21–27.09) | 3.823 | 95.754 |
| 40 (28.09–04.10) | 2.718 | 76.663 |

Clicurile au scăzut cu 29%, iar afișările cu 20%, în aceeași săptămână în care comenzile au coborât la 17. Spam update-ul din septembrie a început pe 24.09.

**Cuvinte cheie de bani, 20.09–03.10:**

| Căutare | Afișări | Clicuri | CTR | Poziție | Unde ajută un link |
|---|---|---|---|---|---|
| cazier judiciar online | 14.314 | 87 | 0,61% | 6,1 | **da** (zona 4–10) |
| ghiseul.ro cazier | 7.290 | 58 | 0,8% | 4,4 | nu: e navigațională, omul caută statul |
| cazier online | 5.171 | 62 | 1,2% | 6,3 | **da** |
| cazier judiciar online gratuit | 2.913 | 58 | 2,0% | 6,2 | nu: intenție gratuită |
| cazier judiciar | 2.894 | 53 | 1,8% | 6,8 | **da** |
| cazier fiscal online | 963 | 12 | 1,25% | 6,9 | puțin: volum mic |
| cazier auto online | 742 | 60 | 8,1% | 2,6 | nu: deja sus |
| cazier + oraș (Iași, Sibiu, Constanța, Brașov, Arad…) | 250–950 fiecare | 40–120 | 10–28% | 1,7–3,3 | nu: deja top 3 |

**Pagini** (top după afișări): `/` 34.463 afișări, poziția 7,4, CTR 0,62%; `/cazier-judiciar-gratuit` 13.859, poziția 6,1; `/cazier-judiciar-online/bucuresti` 12.796, poziția 7,5, CTR 1,03%; `/cazier-fiscal-online` 6.212, poziția 6,5, CTR 0,74%. Paginile de oraș din provincie stau pe pozițiile 3–5, cu CTR de 5–10%.

**Concluzie:** dacă facem linkuri, le îndreptăm spre **`/`** (cuvântul principal) și **`/cazier-judiciar-online/bucuresti`** (cel mai mare volum dintre orașe, încă pe 7,5). Nu le îndreptăm spre orașele care sunt deja pe 2–3.

## 3. Profilul de linkuri actual

Surse gratuite: căutare web după mențiuni plus verificarea directă a paginilor. Common Crawl n-a fost interogat: graful pe domenii cere descărcări de ordinul GB și n-ar fi schimbat concluziile. Raportul „Linkuri” din GSC nu e disponibil prin API.

| Sursă | Tip | Linkuri către CJO | Atribut | Ancoră |
|---|---|---|---|---|
| antena3.ro, „Conținut plătit” (735646) | plătit | 3 (`/`, `/cazier-auto-online/`, `/cazier-fiscal-online/`) | **dofollow** | — |
| antena3.ro, „Conținut plătit” (687027) | plătit | 3 × `/` | **dofollow** | — |
| stirileprotv.ro „(P)” | plătit | 3 × `/` | **dofollow** | „Cazier Judiciar Online”, „cazier judiciar online”, „obținerea cazierului judiciar online” |
| infocons.ro | probabil plătit | 3 (`/`, auto, fiscal) | **dofollow** | — |
| wall-street.ro, articolul „Redefinirea procesului…” | probabil plătit | nu apare în HTML-ul livrat (posibil încărcat prin JS sau scos) | ? | — |
| cotidianul.ro | plătit (pentru eghiseul) | 0 către CJO; 2 către eghiseul | dofollow | ancoră exactă |
| ecazier.ro | rețea proprie | 0 linkuri (doar textul „cazierjudiciaronline.com”, fără `<a>`) | — | — |
| eghiseul.ro (pagini publice) | rețea proprie | **0** | — | — |
| avocat-tarta.ro | rețea proprie | **0** (1 link către ecazier, în articolul de apărare penală) | — | — |

**Riscul:** politica Google cere `rel="sponsored"` (sau `nofollow`) pe linkurile plătite. Articolele marcate „Conținut plătit” sau „(P)”, cu ancore exacte dofollow, sunt exact tiparul pe care Google îl penalizează prin SpamBrain: algoritmic, de regulă prin anularea linkurilor, mai rar printr-o acțiune manuală. Nu putem dovedi că ele au cauzat scăderea din săptămâna 40. Ce putem spune e că nu ajută și pot strica.

**Concurența pe „cazier judiciar online”:** primele rezultate sunt presă (antena3, stirileprotv, newsweek, profit.ro, economedia), statul (hub.mai.gov.ro, ghiseul.ro) și avocatnet.ro. Nu există un concurent comercial cu un profil de linkuri evident mai bun. SERP-ul e dominat de autoritate editorială și de stat, iar asta nu se cumpără cu 3–5 linkuri.

## 4. Planul de linkuri, de la cel mai sigur la cel mai riscant

### a) Rețeaua proprie: puține linkuri, naturale, fără reciprocitate

Regula: doar unde cititorul chiar are nevoie de pagina CJO, cu ancoră descriptivă, nu comercială. Nimic în footer pe toate paginile. Nu punem link de pe pagini `/servicii/` eghiseul spre CJO, pentru că pe „cazier judiciar online” cele două site-uri sunt concurente și ar însemna să ne canibalizăm singuri.

| # | Sursă (pagină exactă) | Ancoră propusă | Țintă CJO | De ce e natural |
|---|---|---|---|---|
| 1 | eghiseul `/calculator/reabilitare/` | „ghidul complet despre reabilitare și ștergerea din cazier” | `/ghid-reabilitare-cazier` (poz. 4,0) | calculatorul dă termenul, ghidul explică procedura; eghiseul nu are pagina asta |
| 2 | eghiseul `/cazier-judiciar-vs-certificat-integritate-comportamentala/` | „după cât timp se șterge o condamnare din cazier” | `/dupa-cat-timp-se-sterge-cazierul` (poz. 4,0) | subiect conex, neacoperit pe eghiseul |
| 3 | avocat-tarta.ro, articolul `drept-penal/apararea-penala-procedura` (lângă linkul existent spre ecazier) | „reabilitarea: cum dispare condamnarea din cazier” | `/ghid-reabilitare-cazier` | avocata scrie despre penal; reabilitarea e pasul de după dosar |
| 4 | avocat-tarta.ro, pagina „Despre” | „cazierjudiciaronline.com” (marcă, nu ancoră comercială) | `/` | fapt: cabinetul depune cererile venite prin platformă |
| 5 | ecazier.ro, textul de pe prima pagină care deja numește CJO | „cazierjudiciaronline.com” (link pe numele existent) | `/` | transformă o mențiune existentă în link, fără text nou |

Impact estimat: mic, dar pozitiv pe paginile informaționale, care stau deja pe 4,0. Pe cuvântul principal, aproape zero. Risc: foarte mic, cu condiția să rămână 3–5 linkuri contextuale, nu zeci.

### b) Linkuri câștigate: singura variantă cu impact real pe cuvântul principal

1. **PR cu date proprii** (cel mai bun raport impact/risc). CJO are peste 500 de comenzi plătite, cu motivul declarat (angajare, viză, permis de armă, străinătate) și cu localitatea. Un comunicat de tipul „Pentru ce cer românii cazierul judiciar în 2026: X% pentru angajare, Y% din diaspora” sau „Orașele din care se cer cele mai multe caziere online” se poate trimite la newsweek.ro, profit.ro, economedia.ro, alba24.ro și la presa locală. Toate au scris deja despre cazierul online, deci subiectul le e familiar. Linkurile sunt editoriale, deci nu cer `sponsored`. Cost: o zi de lucru pentru date și text. Datele se scot din DB, agregate, fără date personale.
2. **Presa diasporei, cu articol de expert semnat de avocată** („Cazierul din străinătate: consulat, procură sau avocat”). Ținte găsite: *Românul* din Spania (periodicoelrumano.es), plus publicațiile diasporei din Italia și Germania. Dacă publicația cere bani, e conținut plătit și se aplică §4c.
3. **Răspunsuri reale pe avocatnet.ro** (subiectele „eliberare cazier judiciar”, „certificat de cazier judiciar” apar în SERP), date de avocată, cu semnătură. Linkurile de acolo sunt nofollow, deci aduc trafic de referință, nu ranking. Sunt utile pentru încredere.
4. **Instituții (consulate, universități, HR):** listează procedura oficială gratuită și nu pun linkuri spre servicii private. Șanse aproape nule, nu merită timpul.

### c) Articole plătite: doar cu `rel="sponsored"`, iar acum nu le recomand

- Prețuri cunoscute din oferta din iulie: pachetul de 6 publicații a costat 880 €; adevarul.ro ~400 €; digi24.ro 2.135 €.
- Un articol plătit cu `rel="sponsored"` nu transmite ranking, dar aduce trafic și vizibilitate de brand. La CTR-urile din presă, câteva zeci de vizite pe lună.
- Un articol plătit dofollow transmite ranking, dar încalcă politica Google. După două spam update-uri în două luni, riscul e prea mare pentru singurul site care încă vinde din organic.
- **Verdict:** nu cumpărăm linkuri pentru CJO în octombrie. Banii merg mai bine în emailuri, recuperare telefonică și CRO.

### d) Ce NU facem

- Footer sau sidebar pe toate paginile cu linkuri între eghiseul, ecazier, documentero și CJO. E rețea evidentă, iar coeziunea internă trebuie să rămână *în* fiecare site.
- Linkuri reciproce „tu mie, eu ție” între site-urile noastre.
- Ancore exacte comerciale („cazier judiciar online”) din rețeaua proprie.
- Pachete de linkuri, PBN-uri, comentarii, directoare, profiluri.
- Linkuri spre paginile de oraș (CJO e deja pe 2–3, iar 69 de pagini de oraș cu linkuri cumpărate arată a doorway).
- Încă un pachet de presă dofollow.

## 5. Primii pași, în ordine

1. **Linkurile plătite existente** (Antena 3 ×2, ProTV, infocons.ro): **decizia lui Raul**. Varianta prudentă e să cerem publicațiilor `rel="sponsored"`. Pierdem eventualul efect de ranking, dar scoatem riscul. Varianta cu risc e să le lăsăm cum sunt. Eu recomand varianta prudentă, cel puțin pentru ProTV, unde sunt 3 ancore exacte.
2. **Rețeaua proprie, linkurile 1–5 din §4a**: o oră de lucru, fără risc. Se pot publica săptămâna asta.
3. **PR cu date** (§4b.1): scoatem statistica din comenzile CJO, scriem comunicatul și îl trimitem la 5–8 redacții, în săptămâna 42.
4. **Articolul de expert pentru diaspora**, semnat de avocată (§4b.2): o publicație pe lună, editorial, nu plătit.
5. **Măsurare pe 26.10:** poziția pe „cazier judiciar online” și pe `/`, plus pe `/ghid-reabilitare-cazier`. Fără mișcare și cu comenzile în scădere, linkurile nu mai sunt prioritate.

**Ce nu fac linkurile:** nu opresc scăderea din săptămâna 40 și nu aduc comenzi în octombrie. Pentru asta rămân CTR-ul, conversia pe paginile de oraș (H2), emailurile după livrare, campania de recâștigare și recuperarea telefonică.

## 6. Decizii pentru Raul

1. Cerem `rel="sponsored"` pe articolele plătite existente (Antena 3, ProTV, infocons.ro)? Da sau nu.
2. Publicăm linkurile 1–5 din §4a?
3. Facem comunicatul cu date din comenzi (agregate, fără date personale)?
4. Pe avocat-tarta.ro e site-ul avocatei: este de acord cu linkurile 3–4?

## Surse

- Search Console API, `sc-domain:cazierjudiciaronline.com`, 20.09–03.10.2026 (cont de serviciu claude-seo).
- Paginile verificate direct (HTML, 06.10.2026):
  - https://www.antena3.ro/continut-platit/cazier-judiciar-online-simplificarea-accesului-la-documente-oficiale-735646.html
  - https://www.antena3.ro/continut-platit/cazier-judiciar-digital-revolutionand-serviciile-publice-prin-tehnologie-687027.html
  - https://stirileprotv.ro/s/p-cazier-judiciar-online-modernizarea-serviciilor-publice-in-era-digitala.html
  - https://infocons.ro/cum-putem-obtine-cazierul-online/
  - https://www.cotidianul.ro/cazierul-judiciar-si-cazierul-fiscal-online-proceduri-si-pasi-simpli/
  - https://www.wall-street.ro/articol/Auto/302006/redefinirea-procesului-de-accesare-a-cazierului-judiciar-auto.html
- SERP „cazier judiciar online”: newsweek.ro, profit.ro, economedia.ro, antena3.ro, avocatnet.ro.
- Diaspora: https://periodicoelrumano.es/ (Românul, Spania).
- Istoric eghiseul: `docs/seo/2026-07-29-analiza-oferte-backlinks.md`, `docs/seo/2026-07-31-articole-backlinks-plan.md`, `docs/seo/2026-09-recuperare-spam-update/11-jurnal-executie.md` (rândurile 26 și 32), `PLAN-RECUPERARE.md`.
- Google Search Central: politica privind spamul de linkuri și calificarea linkurilor plătite (`rel="sponsored"`).
