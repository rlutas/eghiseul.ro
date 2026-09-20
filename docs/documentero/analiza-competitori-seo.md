# Analiza competitorilor SEO: naștere, căsătorie, celibat (20.09.2026)

Ce am verificat: SERP-ul real din `google.ro` (`hl=ro`, `gl=ro`, `pws=0`,
filtrul „Web” `udm=14`, pozițiile 1–20) pentru cele trei interogări comerciale
principale, paginile primilor competitori privați, paginile noastre de pe
documentero.ro așa cum le vede un crawler fără JavaScript (`curl` cu
`User-Agent: GPTBot`), similaritatea între paginile documentero și surorile
lor de pe eghiseul, și exporturile GSC din
`../seo/2026-09-recuperare-spam-update/gsc/`. Prețurile competitorilor sunt
cele afișate public la 20.09.2026.

Scopul: să știm ce trebuie pe pagini ÎNAINTE să scoatem `noindex`, ce ghiduri
scriem primele și cum legăm paginile între ele. Planul e în §6.

## 1. Pe scurt

- **Pe naștere, eghiseul a ieșit din top 20.** „certificat de nastere online”
  și „duplicat certificat de nastere online” (împreună 418 clicuri pe trei luni,
  cele mai mari interogări ale clusterului) nu mai au eghiseul în primele două
  pagini la 20.09. GSC încă raportează clicuri pe ele (media e pe 90 de zile și
  pe toate geolocațiile), dar SERP-ul live e sursa, nu GSC
  (`serp-real-vs-gsc`). Documentero preia clusterul de naștere de la zero.
- **Pe căsătorie și celibat, eghiseul e pe locul 1.** Documentero intră ca a
  doua pagină a aceleiași firme pe aceleași interogări; nu canibalizăm, dar nici
  nu mutăm nimic cu 301 până când documentero nu depășește eghiseul
  (regula din `continut-si-seo.md`).
- **SERP-ul de naștere e instituțional.** 7 din 10 rezultate sunt Hub MAI,
  primării, DLEP-uri și consulate. Singurii privați în top 10: centruldevize.ro
  (locul 1) și infocazier.ro (locul 4). Google afișează un „Rezumat generat de
  AI” care trimite la Hub MAI și spune că „în multe cazuri este necesară o
  prezentare fizică”. Exact golul pe care îl umplem: cererea prin avocat, cu
  temei legal, fără prezență.
- **Paginile documentero sunt curate, dar subțiri.** 900–1.200 de cuvinte față
  de 1.200–2.400 la competitorii care rankează; 6–13 linkuri interne din
  conținut față de ținta de 20; fără `FAQPage` pe paginile de serviciu; fără
  dată vizibilă de actualizare; trei linkuri „ghid” care duc la indexul
  `/ghiduri/` pentru că ghidul nu există încă.
- **Similaritatea e rezolvată.** Jaccard mascat între fiecare pagină documentero
  și sora ei de pe eghiseul: 0,001–0,003. Între paginile documentero: maximum
  0,185 (naștere vs căsătorie). Pragul e 0,65. Nu e nimic de rescris pe motiv
  de duplicat.
- **Suntem cei mai scumpi pe naștere și căsătorie** (998 lei față de 500–800 la
  ceilalți). Nu e un factor de ranking, dar e primul lucru pe care îl compară
  omul care deschide trei taburi. Vezi §5.

## 2. SERP-ul real, 20.09.2026

### „certificat de nastere online” (846 afișări / 3 luni pe eghiseul)

| Loc | Pagină | Tip |
|---|---|---|
| AI | Rezumat generat de AI → Hub MAI, DLEP Iași | |
| 1 | centruldevize.ro/Obtinere-certificat-nastere | privat (traduceri + vize) |
| 2 | hub.mai.gov.ro/serviciu/view?id=99 | instituție |
| 3 | primariasm.ro/inregistrarea-nasterilor | primărie |
| 4 | infocazier.ro/certificat-de-nastere/ | privat, hub cu 42 județe + 40 orașe |
| 5 | spcepcv.ro (Craiova) | DLEP |
| 6 | nasteri.pentrusectorul2.ro | primărie |
| 7 | econsulat.ro | MAE |
| 8 | dlep-iasi.ro | DLEP |
| 9 | cglondra.mae.ro | consulat |
| 10 | evp-oradea.ro | DLEP |
| 11 | gabrieldragomir.ro (avocat) | privat |
| 12–20 | punctul.ro, YouTube, sector5.ro, Cluj, digi24, roeid.ro, laghiseu.ro, primariatm.ro, evp-deva.ro | |
| — | **eghiseul.ro: absent din top 20** | |

### „duplicat certificat de nastere online” (1.943 afișări / 3 luni, cea mai mare)

Top 10: spcepcv, Hub MAI, DLEP Iași, centruldevize, econsulat, infocazier,
cglondra, Facebook DLEP S6, primariatm, sector 2. Pagina 2: sector5,
gabrieldragomir, infocons, Baia Mare, Oradea, digi24, infocazier/bucuresti,
dpepscs1, laghiseu, roeid. **eghiseul.ro: absent din top 20.**

### „certificat de casatorie online” (357 afișări)

| Loc | Pagină |
|---|---|
| 1 | **eghiseul.ro/servicii/eliberare-certificat-de-casatorie/** |
| 2 | Hub MAI |
| 3 | certsign.ro (căsătorii cu semnătură electronică, alt subiect) |
| 4 | econsulat.ro |
| 5 | centruldevize.ro/Obtinere-certificat-casatorie |
| 6 | DLEP Iași |
| 7 | YouTube (noile certificate) |
| 8 | starecivila.mai.gov.ro |
| 9 | infocazier.ro/comanda/certificat-de-casatorie |
| 10 | spcepcv.ro |

### „certificat de celibat online” (299 afișări)

| Loc | Pagină |
|---|---|
| 1 | **eghiseul.ro/servicii/eliberare-certificat-de-celibat/** |
| 2 | centruldevize.ro/Obtinere-certificat-celibat |
| 3 | econsulat.ro (certificat de cutumă) |
| 4 | gabrieldragomir.ro (Anexa 9) |
| 5 | servicii.primariatm.ro/adeverinta-celibat |
| 6 | spcepcv.ro — „Adeverință privind statutul civil – Anexa 18” |
| 7 | Hub MAI |
| 8 | sector5.ro — „Eliberarea dovezii de celibat” |
| 9 | dlep-iasi.ro — „Adeverință cu privire la statutul civil (fosta Anexa 9)” |
| 10 | e-administratie.sibiu.ro |

Observație pe celibat: primăriile îi spun documentului în patru feluri
(„dovadă de celibat”, „adeverință de celibat”, „adeverință privind statutul
civil – Anexa 18”, „fosta Anexa 9”). Noi spunem pe pagină „Anexa 9” ca nume
legal. După noua metodologie (H.G. 255/2024, citată de Hub MAI ca bază legală),
numărul anexei pare să se fi schimbat. **De verificat în metodologie înainte de
lansare** și, dacă e Anexa 18 acum, spunem „Anexa 18 (fosta Anexa 9)” peste
tot: în titlu, în hero, în FAQ. E singura noastră afirmație factuală pe care
SERP-ul o contrazice.

## 3. Ce au competitorii privați

| Site | Locul | Preț afișat (20.09) | Cuvinte | Ce are și noi nu | Ce n-are |
|---|---|---|---|---|---|
| centruldevize.ro | 1 naștere, 2 celibat, 5 căsătorie | fără preț (cere ofertă) | ~2.200 | H2-uri în formă de întrebare (10), transcriere pentru născuți în străinătate, Convenția nr. 16 CIEC (Viena 1976) pentru extrasul multilingv, „valabil 6 luni” sus pe pagină | preț, termen, schema, FAQ marcat, recenzii |
| infocazier.ro | 4 naștere, 9 căsătorie | 500 lei + TVA + curier 25/90 (~605) | ~2.300 | „Pe scurt” online vs primărie, pași numerotați cu link fiecare, 7 situații, 4 scopuri, „actualizat septembrie 2026”, ~110 linkuri interne, 42 județe + 40 orașe | schema, recenzii, avocat numit |
| gabrieldragomir.ro | 11 naștere, 4 celibat | fără preț | 700–1.400 | „duplicat, NU transcriere”, divorț pronunțat în străinătate, nepotrivirea datei nașterii pașaport vs act, art. 12 L. 119/1996 + HG 64/2011, contract descărcabil | preț, FAQ, schema, termen concret |
| laghiseu.ro | 18 naștere | 500 celibat / 999 naștere; apostilă +180 | ~3.500 | 5 FAQ, garanție banii înapoi, „nu suntem instituție de stat” repetat, 10–20 zile lucrătoare | schema, text propriu (mult boilerplate) |
| ghiseurapid.ro / certificatrapid.ro | în afara top 20 | 800 / 800 / 650 | ~3.000 | 30+ recenzii cu nume, „până la 20 de zile”, dropdown pe județe | FAQ, schema, text |
| sprachen-express.de | (Germania) | fără preț | ~1.300 | procură la notar vs la consulat vs fără om în țară, Ehefähigkeitszeugnis, ce alte acte cere oficiul german | serviciul în sine |

Niciunul nu are JSON-LD `Service`/`Product`/`FAQPage`. Noi avem `Service`,
`Product` cu `AggregateOffer`, `BreadcrumbList`, `WebPage`; ne lipsește
`FAQPage` pe paginile de serviciu (întrebările sunt pe pagină, deci e
permis).

Hub MAI (locul 2, sursa Rezumatului AI): 1.200 de cuvinte, secțiuni
„Beneficiari / Pașii procedurali / Taxe / Baza legală / Timpii de livrare”,
spune explicit că cererea poate fi depusă de „avocați împuterniciți” în temeiul
Legii 51/1995 și al Statutului profesiei (Hotărârea 64/2011), termen mediu 3
zile lucrătoare, maxim 30. Asta e formularea pe care o citează Google. Pagina
noastră trebuie să spună același lucru, cu aceleași referințe, în 50 de cuvinte,
sus.

## 4. Unde stau paginile documentero azi

Măsurat pe producție, fără JavaScript (ce vede GPTBot/ClaudeBot), 20.09:

| Pagină | Cuvinte în `<main>` | Linkuri din conținut (unice) | H2 | FAQ pe pagină | FAQPage schema | Recenzii |
|---|---|---|---|---|---|---|
| `/` | 1.023 | 4 (doar cele 4 servicii) | 6 | 5 | da | 9 |
| `/certificat-de-nastere/` | 983 | 6 | 7 | 6 | nu | nu |
| `/certificat-de-casatorie/` | 908 | 5 | 6 | 6 | nu | nu |
| `/certificat-de-celibat/` | 1.187 | 6 | 9 | 6 | nu | nu |
| `/extras-multilingv/` | 924 | 6 | 8 | 6 | nu | nu |
| `/ghiduri/` | 254 | 4 | 0 | | | |
| `/ghiduri/certificat-de-nastere-pierdut/` | 474 | 3 | 7 | | Article | |
| `/ghiduri/apostila-acte-stare-civila/` | 830 | 7 | 7 | | Article | |
| `/despre/` | 338 | 1 | 3 | | | |

Ce e bine: conținutul e în HTML, nu după Suspense (problema de pe eghiseul din
`accessibility-tree-ai-agents-2026-09` nu există aici); `robots.txt` lasă
toți crawlerii AI; canonical, OG, breadcrumb, `Organization` cu
`parentOrganization`; prețurile din DB; textul e scris de la zero (similaritate
≈ 0 față de eghiseul).

Ce e slab:

1. **Linkurile „ghid” care nu duc nicăieri.** Pe naștere, trei carduri de
   situație și un card de ghid trimit la `/ghiduri/` (indexul) pentru că ghidul
   „model vechi”, „deteriorat”, „pentru minor” nu există. Pe căsătorie și
   celibat la fel (ghidul cu mențiunea de divorț, valabilitatea celibatului,
   actele pe țări). Pentru crawler sunt 3–4 linkuri identice către o pagină de
   254 de cuvinte. Se scot sau se scriu ghidurile.
2. **Ținta de 20 de linkuri primite nu e atinsă.** Header + footer dau 2 pe
   pagină de serviciu. Din conținut: acasă → 4 servicii; celibat → naștere +
   extras; apostilă → toate patru; pierdut → doar comanda. Naștere primește
   ~6 din conținut, căsătorie ~3, celibat ~3. Matricea din §6.C repară.
3. **`noindex, nofollow`.** `buildPageMetadata({ noindex })` pune și
   `nofollow`. Corect pentru staging, dar înseamnă că până la flip Google nu
   învață nimic din structura internă. Nu schimbăm (staging = staging), doar
   să știm că la flip totul pornește de la zero, inclusiv graful de linkuri.
4. **Fără dată vizibilă.** `datePublished`/`dateModified` sunt doar în
   schema. infocazier scrie „actualizat septembrie 2026” sub H1; Google și
   modelele AI îl citesc ca semnal de prospețime.
5. **Fără răspuns citabil sus.** Hero-ul e bun pentru om, dar prima propoziție
   care răspunde la „cum obțin certificatul de naștere online” e în `SeoBlock`,
   la 40% din pagină. Rezumatul AI citează pasaje de 40–60 de cuvinte care
   răspund direct.
6. **Fără recenzii pe paginile de serviciu.** Cele 9 recenzii reale sunt doar pe
   acasă. Fiecare recenzie menționează un act; se pot filtra pe pagină (3 pe
   naștere, 2 pe căsătorie etc.), cu aceeași notă de proveniență.
7. **Ghidul „pierdut” are 474 de cuvinte** și e listat la 590 volum. digi24 și
   infocons au 1.000+. Se extinde la 1.200+ cu cazuri concrete (furt, incendiu,
   minor, născut înainte de 1990, act la altă primărie).

## 5. Prețul, ca fapt

| Serviciu | documentero (din DB) | infocazier | laghiseu | ghiseurapid | centruldevize / gabrieldragomir |
|---|---|---|---|---|---|
| Certificat de naștere | 998 | ~605 cu TVA și curier | 999 | 800 | fără preț public |
| Certificat de căsătorie | 998 | — | — | 800 | fără preț public |
| Certificat de celibat | 698 | — | 500 | 650 | fără preț public |
| Extras multilingv naștere | 798 | — | — | 500 (opțiune) | — |

Nu e o recomandare de preț (decizia e a lui Raul și ține de decontul avocatei).
E un motiv în plus ca pagina să spună clar CE cumperi: avocat numit, cerere
depusă fizic, scan în ziua ridicării, curier oriunde, banii înapoi dacă
primăria refuză. Toate sunt deja pe pagină, dar împrăștiate; le strângem într-un
bloc „Ce plătești, de fapt” lângă preț.

## 6. Planul

Ordinea contează: A înainte de a scoate `noindex`, B și C în primele două
săptămâni după, D la cadența de 1–2 ghiduri pe săptămână.

### A. Cod, înainte de `DOCUMENTERO_INDEXABLE = true` (o zi)

1. `FAQPage` în `documenteroServiceGraph` (parametru `faq`), pe cele patru
   pagini de serviciu. Întrebările există deja pe pagină.
2. Bloc „Pe scurt” imediat sub hero, 40–60 de cuvinte, în formă de răspuns:
   *„Duplicatul certificatului de naștere se eliberează de orice primărie din
   România, pe baza actului din registrul de stare civilă. Cererea o poate
   depune titularul, părintele minorului sau un avocat cu împuternicire
   (Legea 119/1996, Legea 51/1995). Termen: în medie 3 zile lucrătoare, maxim
   30. Taxa de stat: 0 lei sau o taxă locală.”* Câte unul pe pagină, cu datele
   actului respectiv. Ăsta e pasajul pe care îl vrem în Rezumatul AI.
3. „Actualizat la DD.MM.YYYY” vizibil sub H1 sau la finalul `SeoBlock`, legat
   de `DATE_MODIFIED` (aceeași constantă alimentează schema). Se schimbă doar
   când se schimbă conținutul.
4. Linkurile către ghiduri nescrise: fie ghidul se scrie înainte de flip (D1,
   D2), fie cardul rămâne fără link (text simplu). Zero linkuri către
   `/ghiduri/` din carduri de situație.
5. Secțiunea „Ai nevoie și de” (există doar pe celibat) pe naștere, căsătorie
   și extras. Trei carduri, conform matricei din C.
6. Recenzii filtrate pe act pe paginile de serviciu (componenta există,
   `src/lib/documentero/reviews.ts` are textul; se adaugă un câmp `service`).
7. Baza legală, o singură dată, corect: Legea 119/1996 art. 10 (eliberarea
   certificatelor) + Legea 51/1995 și Statutul profesiei (împuternicirea
   avocațială) + metodologia în vigoare (H.G. 255/2024, de verificat numărul
   și numele actual al anexei pentru celibat). Aceeași listă în FAQ „Cum poate
   un avocat să ceară în locul meu?”.
8. Acasă: paragraful de prezentare primește linkuri în text spre cele două
   ghiduri și spre `/despre/`; `/ghiduri/` primește un paragraf de 150 de
   cuvinte cu linkuri spre cele patru servicii; `/despre/` linkuri spre
   servicii în textul „Cum lucrăm”.
9. `llms.txt` pe host-ul documentero (opțional, ignorat de Google; util pentru
   agenții care îl citesc): lista celor 4 servicii + ghiduri, cu o linie
   fiecare. Cost zero, `src/app/documentero/llms.txt/route.ts` după modelul
   `robots.txt`.

### B. Conținut pe paginile de serviciu (cu date proprii, nu copiate)

**Naștere** (ținta: 1.600–1.800 de cuvinte)
- „Duplicat, nu transcriere”: cine s-a născut în străinătate și n-are act
  românesc are nevoie de transcriere, alt serviciu (nu îl vindem încă; spunem
  clar și trimitem la ghidul de transcriere, D6). Confuzia asta aduce comenzi
  greșite și e prima secțiune la gabrieldragomir.
- „Cine poate cere”: titularul, părintele/tutorele pentru minor, avocatul cu
  împuternicire, moștenitorul pentru succesiune (extras, nu duplicat).
- „Cât durează, de fapt”: mediana noastră din cele 44 de comenzi plătite din
  07.07.2026 (de calculat din `orders.completed_at - paid_at`, pe
  `service_slug`), lângă termenul legal. Cifră proprie, sursă proprie.
- „Când datele nu se potrivesc”: nume cu diacritice diferite pe pașaport vs
  act, data nașterii greșită; ce se întâmplă (rectificare, alt drum).
- Sectoarele București, ca tabel de 6 rânduri: sectorul, direcția, dacă cere
  programare. Nu pagini separate.
- Bloc „Ce plătești, de fapt” lângă preț (§5).

**Căsătorie** (ținta: 1.500)
- Divorț pronunțat în străinătate: mențiunea apare doar după înscrierea în
  România (ce înseamnă, cine o face, cât durează); sentința nu ține loc de
  certificat.
- „Ce nu înlocuiește duplicatul”: extrasul pentru uz oficial, certificatul de
  divorț de la notar, hotărârea judecătorească.
- Deces al unuia dintre soți: duplicatul pentru pensia de urmaș și succesiune.
- Schimbarea numelui după căsătorie/divorț: ce cer banca, angajatorul, DEPABD.
- Tabel „Ce cer instituțiile din UE” (rezidența partenerului, Anmeldung,
  pensie): extras multilingv sau duplicat + apostilă.

**Celibat** (ținta: 1.500)
- Numele documentului după noua metodologie (Anexa 18 / fosta Anexa 9): prima
  secțiune, pentru că SERP-ul e împărțit între cele două nume.
- Tabel pe țări (Italia, Spania, Germania, Franța, UK, SUA): ce cer, apostilă
  da/nu, traducere da/nu, cât de nou (90 de zile / 6 luni).
- „Procură la notar vs la consulat vs avocat”: singurul competitor care
  explică asta e din Germania și nu vinde serviciul. Trei coloane, cu cost și
  timp.
- Nepotrivirea datei nașterii între pașaport și act (motivul nr. 1 de refuz în
  străinătate, din experiența noastră; de confirmat cu Ana).
- Ghidul de valabilitate (D4) linkat din secțiunea „6 luni / 90 de zile”.

**Extras multilingv**: Convenția nr. 16 CIEC (Viena, 1976) lângă Regulamentul
(UE) 2016/1191, cu ce diferă (formularul standard multilingv e ANEXAT
certificatului, nu îl înlocuiește); lista de state care acceptă fără traducere.

### C. Matricea de linkuri interne (ținta: ≥ 20 primite pe pagină de serviciu)

| Din → spre | naștere | căsătorie | celibat | extras | ghiduri |
|---|---|---|---|---|---|
| header (mega-meniu) | ✓ | ✓ | ✓ | ✓ | ✓ |
| footer | ✓ | ✓ | ✓ | ✓ | ✓ (2) |
| acasă: carduri + text | ✓ + text | ✓ + text | ✓ + text | ✓ + text | text |
| naștere | — | „Ai nevoie și de” | „Ai nevoie și de” (căsătorie în străinătate) | card UE + text | pierdut, model vechi, acte |
| căsătorie | „Ai nevoie și de” | — | „Ai nevoie și de” (recăsătorie în străinătate) | text + card | divorț, apostilă |
| celibat | „Ai nevoie și de” (există) | text (divorț) | — | „Ai nevoie și de” (există) | valabilitate, țări |
| extras | text (duplicat nou întâi) | secțiunea #casatorie | text | — | apostilă |
| fiecare ghid | „Comandă” + text | text unde e cazul | text unde e cazul | text unde e cazul | „Citește și” (2) |
| despre | text „Cum lucrăm” | text | text | | |
| ghiduri (index) | paragraf | paragraf | paragraf | paragraf | — |
| pagini legale | — | — | — | — | — |

Cu 8 ghiduri publicate și fiecare linkând spre 1–2 servicii, naștere ajunge la
~22 de linkuri primite, căsătorie și celibat la ~16–18. Diferența o acoperă
linkurile din text pe acasă și despre.

Din eghiseul: linkul din footer și cel de pe pagina de naștere există. La flip
se adaugă câte un link din text pe eghiseul căsătorie și celibat („ghidul
complet pe documentero.ro”), dofollow, plus footerul pe ecazier.ro și
cazierjudiciaronline.com (alte repo-uri).

### D. Ghidurile, reordonate după SERP

| # | Ghid | De ce acum | Linkuri spre |
|---|---|---|---|
| 1 | Certificat de naștere pierdut (există; se extinde la 1.200+) | 590 volum, 2.041 afișări, poziția 7 pe eghiseul | naștere |
| 2 | Certificatul vechi, tipizat, mai e valabil? | 480 volum; singurul articol de stare civilă care încă merge pe eghiseul (poz. 1,8) | naștere, extras |
| 3 | Acte necesare pentru duplicat + tabelul sectoarelor | 390 + 320 + 2.350 pe cluster sectoare | naștere, căsătorie |
| 4 | Valabilitatea certificatului de celibat: 6 luni sau 90 de zile | eghiseul are pagina, poz. 3,7; leagă secțiunea de pe celibat | celibat |
| 5 | Procură din străinătate: notar, consulat sau avocat | nimeni în RO n-o explică; răspunde exact la „fără să vin în țară” | celibat, naștere, căsătorie |
| 6 | Transcrierea certificatului emis în străinătate | confuzia nr. 1 pe naștere (centruldevize și gabrieldragomir o tratează) | naștere |
| 7 | Duplicat certificat de căsătorie cu mențiunea de divorț | secțiunea #divort are nevoie de adâncime | căsătorie, celibat |
| 8 | Acte pentru căsătoria în străinătate, pe țări | tabelul de pe celibat, extins | celibat, extras, naștere |

Apostila (publicat 20.09) rămâne al nouălea, deja linkat din toate patru.

### E. GEO (Rezumat AI, ChatGPT, Perplexity)

- Rezumatul AI pe naștere citează Hub MAI și DLEP Iași pentru că au secțiuni
  scurte, cu titluri-întrebare și cifre (3 zile / 30 de zile / 0 lei). A2 și
  A7 ne dau același format.
- H2-uri în formă de întrebare acolo unde e natural („Cine poate cere
  duplicatul?”, „Cât durează?”, „Cât costă la primărie și cât la noi?”).
  centruldevize (locul 1) are 10 astfel de H2.
- Fiecare cifră cu sursa lângă ea (lege, DB-ul nostru, Hub MAI). Fără
  „rapid”, „simplu”, „garantat” fără cifră.
- Numele avocatei și pagina de autor pe fiecare pagină (există în `Article`,
  lipsește pe paginile de serviciu; se adaugă o linie „Cererile sunt depuse de
  av. Tarța Ana Gabriela, Baroul …” cu link spre `/despre/`).
- `llms.txt` (A9). Nu schimbă nimic la Google.
- Verificarea: după flip, o dată pe săptămână, `curl -A GPTBot` pe cele 4
  pagini (conținutul să rămână în HTML) + căutarea celor 3 interogări în
  ChatGPT search și Perplexity, notat în `continut-si-seo.md`.

### F. Ce NU facem

- Pagini pe județe sau orașe, chiar dacă infocazier rankează cu ele. Cazierul
  ne-a costat 78% din clicuri cu exact modelul ăsta (regula §1 din
  `content-and-seo.md`). Sectoarele intră ca tabel într-un ghid.
- Pagini „documentero vs X” cu numele competitorilor. Nu există căutări
  („eghiseul vs infocazier” = 0), iar comparația utilă e „la ghișeu / procură /
  avocat”, pe care o facem ca ghid (D5).
- Rating sau număr de recenzii inventat; `aggregateRating` pe `Product`.
- Redirect de pe eghiseul înainte ca documentero să depășească eghiseul pe
  aceeași interogare (căsătorie și celibat sunt pe locul 1 acolo).

### G. Măsurare

- GSC documentero: interogările din §2, urmărite săptămânal; primul semn e
  afișările, nu clicurile.
- SERP live cu `pws=0&udm=14`, aceleași 4 interogări, notat în tabel cu data.
- eghiseul: dacă naștere nu revine în top 20 în 30 de zile după flip-ul
  documentero, se discută 301 de pe pagina eghiseul spre documentero (are
  1.714 clicuri istorice și backlinkuri → 301, nu 410).

## Surse

- SERP: `google.ro`, 20.09.2026, `hl=ro&gl=ro&pws=0&udm=14`, pozițiile 1–20.
- Competitori: paginile citite la 20.09.2026 (centruldevize.ro, infocazier.ro,
  gabrieldragomir.ro, laghiseu.ro, ghiseurapid.ro/certificatrapid.ro,
  sprachen-express.de, hub.mai.gov.ro/serviciu/view?id=99).
- GSC eghiseul: `../seo/2026-09-recuperare-spam-update/gsc/full-3luni/` și
  `compare-post-vs-pre/`.
- Similaritate: shingles de 5 cuvinte pe `<main>`, numele actelor mascate,
  paginile de producție la 20.09.2026.
- Prețuri documentero: `AggregateOffer` din paginile de producție (din
  `services`/`service_options`).
