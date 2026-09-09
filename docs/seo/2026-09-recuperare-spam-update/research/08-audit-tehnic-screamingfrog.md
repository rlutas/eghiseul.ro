# 08 — Audit tehnic din crawl-ul Screaming Frog (09.09.2026)

Sursa: `docs/EXPORT SCREAMINGFROG/` (crawl 09.09.2026, 415 URL-uri).
Datele derivate, re-verificabile: `research/data/08-*.csv`.
Se construiește peste `2026-08-24-spam-update-prabusire-organica.md` și
`07-date-gsc-analytics-business.md` — nu le repetă.

---

## 0. Metodă și o avertizare importantă despre export

Toate cifrele sunt calculate cu `csv.DictReader` din Python peste fișierele brute
(BOM `utf-8-sig`, câmpuri cu ghilimele). **Separatorul zecimal din export e virgula**
(`Text Ratio` = „3,683" înseamnă 3,683%, nu 3683) — cine reface calculele cu `float()`
direct obține valori de 1.000× mai mari.

### ⚠️ Crawl Analysis NU a fost rulată în Screaming Frog

Coloanele care depind de post-procesarea „Crawl Analysis" sunt **goale pe toate cele
233 de pagini HTML**:

| Coloană | Valori ne-goale | Consecință |
|---|---:|---|
| `Closest Near Duplicate Match` | 0/233 | secțiunea 4 nu poate folosi detectorul SF |
| `No. Near Duplicates` | 0/233 | idem |
| `Closest Semantically Similar Address` / `Semantic Similarity Score` | 0/233 | fără similaritate semantică |
| `Link Score` | 0/233 | fără scor de link intern SF |
| `Spelling Errors` / `Grammar Errors` | 0/415 | fără verificare lingvistică |

Singurul semnal de duplicare livrat de export e coloana `Hash` (hash exact al
conținutului): **233 hash-uri distincte, o singură coliziune** —
`/ancpi-nu-functioneaza/` și varianta ei cu `?utm_source=embed…`.

**Ce am făcut în loc:** am reconstruit clusterele de duplicat din amprenta
structurală pe care crawl-ul chiar o conține (Word Count, Sentence Count, Text
Ratio, Size, Outlinks, Unique Inlinks) + șabloane de Title/Meta/H1/H2 cu tokenul
de locație mascat, și le-am confruntat cu Jaccard-ul pe corp de text calculat în
doc. 05 (`data/05-similaritate-seturi.tsv`). Metoda e descrisă în secțiunea 4.

**De refăcut la următorul crawl:** Configuration → Content → Duplicates → *Enable
Near Duplicates* (prag 90%), apoi *Crawl Analysis → Start*. Altfel exportul nu
conține exact datele pentru care e cerut.

### Clasificarea tipurilor de pagină (folosită peste tot)

Derivată din path, în `data/08-pagini-crawl.csv`, coloana `tip`:

| Tip | Regulă | n (HTTP 200) | din care indexabile |
|---|---|---:|---:|
| articol | orice altceva la rădăcină | 59 | 58 |
| locatie-cazier | `/servicii/cazier-judiciar-online/<oraș>/` | 48 | **8** |
| locatie-cf | `/servicii/extras-de-carte-funciara/<județ>/` | 42 | 42 |
| calculator | `/calculator/*` | 40 | 40 |
| serviciu | `/servicii/<slug>/` | 29 | 29 |
| legal | contact, gdpr, politici, T&C | 6 | 6 |
| hub | `/servicii/`, `/blog/`, `/calculator/`, `/tools/` | 4 | 4 |
| variant-serviciu | `…/persoana-fizica`, `…/persoana-juridica` | 2 | 2 |
| homepage / tool / embed | | 1 / 1 / 1 | 1 / 1 / 0 |
| **Total HTML 200** | | **233** | **191** |

191 = exact numărul de pagini din setul indexabil folosit în doc. 05/06
(`data/06-pages-flat.json`, 191 intrări EGH) — cele două seturi coincid.

---

## 1. Status codes și indexabilitate

### 1.1 Distribuția globală (415 rânduri `internal_all.csv`)

| Status | n | Ce sunt |
|---|---:|---|
| 200 | 377 | 233 HTML + 71 JS + 71 imagini + 2 CSS |
| 0 | 36 | **blocate de robots.txt** (nefetchate) |
| 400 | 2 | două URL-uri `/_next/image?…w=3840` |
| 3xx | **0** | zero redirecturi interne — **zero lanțuri de redirect** |

Zero `rel=next/prev`, zero `X-Robots-Tag`, zero hreflang, zero amphtml, zero
`http://`. Un singur `<meta refresh>` (`/embed/ancpi/`, refresh 300s — widget,
noindex, corect).

### 1.2 Non-indexabile: 42 URL-uri HTTP 200

| Motiv | n | Verdict |
|---|---:|---|
| `noindex` | 41 | 40 pagini de locație cazier + `/embed/ancpi/` |
| `Canonicalised` | 1 | varianta `?utm_source=embed…` a `/ancpi-nu-functioneaza/` — corect |

Plus 36 URL-uri `/comanda/*` blocate de robots.txt (toate, verificat: 100% sunt
sub `/comanda/`) — corect, sunt pași de wizard.

### 1.3 🔴 Constatarea majoră: 40 din 48 pagini de locație cazier sunt `noindex, follow`

| Oraș | Indexabilitate | Clicuri GSC 3 luni | Expuneri 3 luni |
|---|---|---:|---:|
| cluj-napoca, constanta, focsani, iasi, piatra-neamt, ramnicu-valcea, satu-mare, timisoara (8) | **Indexable** | 88 (5–26/pagină) | 290–778/pagină |
| alba-iulia, alexandria, arad, bacau, baia-mare, barlad, bistrita, botosani, braila, brasov, bucuresti, buzau, calarasi, craiova, deva, drobeta-turnu-severin, galati, giurgiu, ilfov, lugoj, medias, miercurea-ciuc, onesti, oradea, pitesti, ploiesti, resita, sebes, sfantu-gheorghe, sibiu, slatina, slobozia, suceava, targoviste, targu-jiu, targu-mures, tulcea, turda, vaslui, zalau (40) | **noindex, follow** | **0** | **0** |

Corelația e perfectă: exact paginile cu 0 clicuri și 0 expuneri în 3 luni au fost
noindexate; cele 8 care aduceau ceva au rămas indexabile. Deci noindex-ul e o
intervenție deliberată (selecție pe performanță), nu un accident.

**Problema care rămâne, și e structurală:** cele 40 de pagini `noindex` sunt în
continuare **complet integrate în linking-ul intern** — fiecare are **exact 49
inlinks unice și exact 142 outlinks** (identic cu cele 8 indexabile). Adică:
- 40 de pagini care nu pot intra în index consumă crawl budget la fiecare pas;
- ele formează în continuare **plasa de cross-linking oraș↔oraș** (48 pagini ×
  47 surori) — amprenta de doorway rămâne vizibilă în graful de linkuri chiar
  dacă paginile nu mai sunt indexabile;
- ele continuă să trimită 82 de linkuri către URL-uri externe cu HTTP 500 (§2).

`noindex` ascunde pagina din index; **nu** șterge tiparul de „set generat la scară,
cross-linkat integral" pe care îl vede un crawler.

### 1.4 Nimic important nu e exclus din indexare accidental

Toate cele 29 de pagini de serviciu, cele 42 de pagini CF/județ, cele 40 de
calculatoare, homepage-ul, hub-urile și cele 58 de articole sunt `Indexable`,
cu self-canonical. Zero noindex accidental.

### 1.5 Canonicals

| Situație | n |
|---|---:|
| self-canonical corect | 231 / 233 |
| canonical cross-URL (corect, varianta utm) | 1 |
| fără canonical | 1 (`/embed/ancpi/`, noindex — irelevant) |
| canonical mismatch (protocol / trailing slash / host) | **0** |

Nimic de reparat aici. Concluzia din 24.08 („NU tehnic — canonicals corecte")
se confirmă și în crawl-ul de acum.

### 1.6 Cele 2 erori 400

| URL | Depth | Pagina-sursă (dedus) |
|---|---|---|
| `/_next/image/?url=%2Fimages%2Farticole%2Fce-este-planul-cadastral.webp&w=3840&q=75` | 3 | `/ce-este-planul-cadastral/` |
| `/_next/image/?url=%2Fimages%2Farticole%2Fce-este-un-releveu.webp&w=3840&q=75` | 3 | `/ce-este-un-releveu/` |

Doar breakpoint-ul de 3840px din `srcset` dă 400; imaginile există la lățimi mai
mici. Cosmetic, dar sunt singurele 4xx din tot site-ul.

---

## 2. 🔴 Linkuri externe rupte — 43 URL-uri moarte, 84 de linkuri

`external_all.csv` (57 rânduri) + `response_codes_server_error_(5xx).csv` (42 rânduri).
Confirmat: **toate sunt externe**, niciun 5xx pe domeniul nostru.

| Status | n URL | Total linkuri de la noi |
|---|---:|---:|
| **500** Internal Server Error | 41 (subdomenii `*.politiaromana.ro`) | **82** |
| **502** Bad Gateway | 1 (`hub.mai.gov.ro/serviciu/view?id=90`) | 1 |
| **404** | 1 (`ancpi.ro/verificare/dc_index.php`) | 1 |
| **0** conexiune eșuată | 1 (`anpc.ro/ce-este-sal/`) | **233** (footer sitewide) |
| 301 | 2 (`politiaromana.ro/` 48×, `ec.europa.eu/consumers/odr` 233×) | 281 |

### 2.1 Cele 41 de IPJ-uri județene cu HTTP 500 — și paginile noastre care le citează

Fiecare pagină de locație cazier linkează **de două ori** către IPJ-ul județului ei
(41 URL × 2 inlinks = 82). Maparea e 1:1 și deterministă (verificată prin `External
Outlinks`: cele 41 de pagini au 7 outlinks externe, cele 7 fără IPJ propriu au 5).
Lista completă e în `data/08-linkuri-externe-rupte.csv`. Rezumat:

| Județ (subdomeniu) | Pagina noastră | Indexabilă? |
|---|---|---|
| Alba (ab) | /servicii/cazier-judiciar-online/alba-iulia/ | noindex |
| Argeș (ag) | …/pitesti/ | noindex |
| Arad (ar) | …/arad/ | noindex |
| Bacău (bc) | …/bacau/ | noindex |
| Bihor (bh) | …/oradea/ | noindex |
| Bistrița-Năsăud (bn) | …/bistrita/ | noindex |
| Brăila (br) | …/braila/ | noindex |
| Botoșani (bt) | …/botosani/ | noindex |
| Brașov (bv) | …/brasov/ | noindex |
| Buzău (bz) | …/buzau/ | noindex |
| **Cluj (cj)** | **…/cluj-napoca/** | **Indexable** |
| Călărași (cl) | …/calarasi/ | noindex |
| Caraș-Severin (cs) | …/resita/ | noindex |
| **Constanța (ct)** | **…/constanta/** | **Indexable** |
| Covasna (cv) | …/sfantu-gheorghe/ | noindex |
| Dâmbovița (db) | …/targoviste/ | noindex |
| Dolj (dj) | …/craiova/ | noindex |
| Gorj (gj) | …/targu-jiu/ | noindex |
| Galați (gl) | …/galati/ | noindex |
| Giurgiu (gr) | …/giurgiu/ | noindex |
| Hunedoara (hd) | …/deva/ | noindex |
| Harghita (hr) | …/miercurea-ciuc/ | noindex |
| Ilfov (if) | …/ilfov/ | noindex |
| Ialomița (il) | …/slobozia/ | noindex |
| **Iași (is)** | **…/iasi/** | **Indexable** |
| Mehedinți (mh) | …/drobeta-turnu-severin/ | noindex |
| Maramureș (mm) | …/baia-mare/ | noindex |
| Mureș (ms) | …/targu-mures/ | noindex |
| **Neamț (nt)** | **…/piatra-neamt/** | **Indexable** |
| Olt (ot) | …/slatina/ | noindex |
| Prahova (ph) | …/ploiesti/ | noindex |
| Sibiu (sb) | …/sibiu/ | noindex |
| Sălaj (sj) | …/zalau/ | noindex |
| **Satu Mare (sm)** | **…/satu-mare/** | **Indexable** |
| Suceava (sv) | …/suceava/ | noindex |
| Tulcea (tl) | …/tulcea/ | noindex |
| **Timiș (tm)** | **…/timisoara/** | **Indexable** |
| Teleorman (tr) | …/alexandria/ | noindex |
| **Vâlcea (vl)** | **…/ramnicu-valcea/** | **Indexable** |
| **Vrancea (vn)** | **…/focsani/** | **Indexable** |
| Vaslui (vs) | …/vaslui/ | noindex |

**8 pagini indexabile citează un URL oficial care returnează 500.** Exact „referința
locală reală" pe care se sprijină argumentul de utilitate al unei pagini de locație
este moartă. Restul de 33 sunt pe pagini noindex — nu contează pentru index, dar
consumă crawl.

⚠️ Nuanță de verificat manual: 41 de subdomenii diferite care returnează **toate**
500 simultan sugerează și posibilitatea ca politiaromana.ro să blocheze user-agentul
Screaming Frog. Trebuie confirmat cu un `curl` de browser înainte de a le trata ca
definitiv moarte. **Nu contează pentru decizia de conținut**: chiar dacă e blocare de
bot, e un link pe care Googlebot îl poate vedea la fel de prost.

### 2.2 `anpc.ro/ce-este-sal/` — 233 inlinks, status 0

E linkul obligatoriu ANPC/SAL din footer, deci apare pe **fiecare** pagină a
site-ului. La momentul crawl-ului nu s-a putut deschide (status 0 = eșec de
conexiune). Împreună cu `ec.europa.eu/consumers/odr` (301 sitewide), sunt cele
două linkuri externe cu cea mai mare acoperire.

### 2.3 Cele 7 pagini fără link IPJ

`/bucuresti/`, `/turda/`, `/onesti/`, `/lugoj/`, `/sebes/`, `/barlad/`, `/medias/` —
exact „al doilea oraș" al unui județ (+ București). Ele linkează doar
`politiaromana.ro/` (301). Adică diferența „reală, locală" dintre `/turda/` și
`/cluj-napoca/` e că a doua are un link în plus.

---

## 3. Titles / meta descriptions / H1

### 3.1 Lipsă și duplicate exacte

| | Title | Meta description | H1 |
|---|---:|---:|---:|
| Lipsă | 0 | 1 (`/embed/ancpi/`) | 1 (`/embed/ancpi/`) |
| Duplicate exacte (grupuri) | 1 | 1 | 1 |
| URL-uri în duplicate | 2 | 2 | 2 |

Singurul grup duplicat, pe toate trei câmpurile, e
`/ancpi-nu-functioneaza/` + varianta ei `?utm_source=embed&utm_medium=widget&utm_campaign=ancpi-status`,
care e deja canonicalizată. **Zero duplicate exacte reale.**

### 3.2 Lungimi — problema e sistematică

| Metrică | Valoare |
|---|---|
| Title, mediană | **73 caractere** |
| Title > 60 caractere | **207 / 233** (89%) |
| Title > 70 caractere | 138 / 233 |
| Title > 80 caractere | 42 / 233 |
| Title > 561px (prag de trunchiere SF) | **198 / 233** (85%) |
| Meta description, mediană | **164 caractere** |
| Meta > 160 caractere | **137 / 233** (59%) |
| Meta > 200 caractere | 40 / 233 |
| Meta > 985px | 110 / 233 |
| H1 > 70 caractere | 24 |

Mediana pe tip: articole 77, locatie-cf 80, locatie-cazier 70, servicii 69,
calculatoare 65, legal 37.

Cele mai lungi titluri (top 5): 99c `/cum-aflam-numarul-carte-functionara-…/`,
98c `/calculator/valabilitate-documente/`, 97c `/sms-fals-amenda-ghiseul-ro/`,
96c `/cazier-fiscal-persoana-fizica/`, 94c `/valabilitate-certificat-de-celibat/`.

Cele mai lungi meta: 350c `/ancpi-nu-functioneaza/`, 321c
`/cazier-judiciar-online-gratuit/`, 316c `/servicii/actualizare-adresa-cf/`,
293c `/tva-9-locuinte-31-iulie-2026/`, 271c `/cazier-fiscal-firma/`.

Efectul e că Google rescrie titlul pe ~85% din pagini — deci ce am optimizat noi
în title nu e neapărat ce se afișează.

### 3.3 🔴 Șabloane: grupuri unde variază DOAR tokenul de locație

Metodă: se maschează în text tokenul preluat din ultimul segment al URL-ului (plus
lista de nume de județe), apoi se grupează. Export complet: `data/08-clustere-sablon.csv`.

| Câmp | n URL | Șablon |
|---|---:|---|
| **Title** | **48** | `Cazier Judiciar Online {LOC} — Fără Drum la IPJ {LOC} \| eGhiseul.ro` |
| **Title** | **42** | `Extras de Carte Funciară Online {LOC} — 89 RON, Fără Drum la OCPI \| eGhiseul.ro` |
| **Meta** | **48** | `Obține cazierul judiciar în {LOC} online, fără cozi la IPJ {LOC}. Depunem cererea în numele tău, livrare în 3-5 zile pe email sau curier. Comandă în 5 …` |
| **Meta** | **42** | `Obține extrasul de carte funciară pentru un imobil din județul {LOC} online, fără drum la OCPI {LOC}. 89 RON, taxe incluse, livrare pe email în câteva …` |
| **H1** | **48** | `Cazier Judiciar Online {LOC} — Rapid, Fără Drum la Ghișeu` |
| **H2-1** | **42** | `Ce este extrasul de carte funciară` (identic, fără niciun token de locație) |
| **H2-1+H2-2** | **42** | `Ce este extrasul de carte funciară` + `Tipuri de extras de carte funciară` — **identice literal pe toate 42** |
| H1 | 15 | `Calculator {LOC} 2026` |
| Title | 2 | `{LOC} de {LOC} 2026 — pentru UE, Fără Traducere` (extras multilingv naștere/căsătorie) |
| Title | 2 | `{LOC} de {LOC} Online — Duplicat de la Starea Civilă` (eliberare cert. naștere/căsătorie) |
| Title | 2 | `Calculator {LOC} 2026 — Indemnizație` (concediu maternitate / medical) |
| Title | 2 | `{LOC} de {LOC} din Străinătate: Ghid Complet` (transcriere naștere/căsătorie) |
| Title | 2 | `Calculator {LOC} 2026` (concediu paternal / zile lucrătoare) |
| H1 | 5 | `{LOC} de {LOC} Online` (5 pagini de serviciu) |
| H1 | 4 | `{LOC}` (calculator-procente, contact, cazier-judiciar-online, verificare-rovinieta) |

Alte semnale de boilerplate în title/meta, pe cele 233 de pagini:
`| eGhiseul.ro` pe **231**; „Fără Drum" în **91** de titluri; em-dash `—` în **152**
de titluri; „2026" în 43; „RON" în 45. În meta: „online" în 147, „fără" în 118,
„livrare" în 108, „Obține" în 96.
**59 de pagini au H1 identic cu Title-ul minus sufixul de brand.**

Concluzia din crawl: **90 din cele 191 de pagini indexabile (47%) au title, meta
și H1 generate dintr-un singur șablon** în care singura variabilă e numele
localității. Asta e literalmente definiția „doorway pages" din documentația Google.

---

## 4. Clustere de duplicat (reconstruite — detectorul SF nu a rulat)

### 4.1 Ce a livrat crawl-ul

Duplicat **exact** (coloana `Hash`): un singur grup, de 2 URL-uri, deja
canonicalizat. Near-duplicate: coloană goală (vezi §0).

### 4.2 Metoda de reconstrucție

Pentru fiecare set de pagini am măsurat 5 amprente independente pe care crawl-ul
chiar le conține:

1. **Outlinks și Unique Outlinks identice** — dacă toate paginile dintr-un set au
   exact același număr de linkuri ieșite, structura HTML e generată din același
   template, cu același bloc de cross-linking.
2. **Unique Inlinks identice** — poziție identică în graful intern.
3. **Coeficient de variație (CV = sd/medie)** pe Word Count, Text Ratio, Size —
   cât de „strâns" e setul. Conținut scris de om are CV mare; conținut generat din
   template are CV mic.
4. **Șabloane Title/Meta/H1/H2** (§3.3).
5. **Jaccard pe corpul de text**, calculat separat în doc. 05
   (`data/05-similaritate-seturi.tsv`) — confirmare independentă, nu din crawl.

Export: `data/08-clustere-duplicat.csv` și `data/08-amprenta-structurala.csv`.

### 4.3 Rezultat

| Cluster | n | Indexabile | Outlinks identice | Unique Inlinks identice | CV word count | CV text ratio | CV size | Jaccard median (doc 05) | Clicuri GSC 3 luni |
|---|---:|---:|---|---|---:|---:|---:|---:|---:|
| **locatie-cazier** | **48** | 8 | **48/48 la 142** | **48/48 la 49** | **2,3%** | **0,9%** | **1,2%** | **0,66** | 88 |
| **locatie-cf** | **42** | 42 | **42/42 la 101** | **42/42 la 14** | 11,4% | 3,7% | 3,8% | **0,56** | 111 |
| variant-serviciu | 2 | 2 | 1/2 la 87 | 2/2 la 232 | 0,9% | 0,6% | 0,5% | 0,41 (pereche) | 9 |
| serviciu | 29 | 29 | 7/29 la 91 | 20/29 la 232 | 26,0% | 7,5% | 15,8% | 0,25–0,30 (subseturi) | 7.445 |
| calculator | 40 | 40 | 13/40 la 88 | 18/40 la 232 | 13,8% | 8,3% | 2,9% | **0,019** | 47.768 |
| articol | 59 | 58 | 11/59 la 88 | 14/59 la 3 | 68,1% | 27,5% | 17,0% | 0,02–0,04 | 41.589 |

### 4.4 Citire

**Cluster 1 — cazier/oraș (48 pagini).** Cel mai strâns set de pe site și, de
departe, cel mai clar tipar de generare la scară:
- Outlinks: **142 pe toate 48**, fără nicio excepție. Unique Outlinks: **103 pe toate 48**.
- Unique Inlinks: **49 pe toate 48** (fiecare pagină e linkată de celelalte 47 + 2).
  Adică o plasă completă oraș↔oraș.
- Word count 1.322–1.443 (CV 2,3%), Text Ratio 3,52–3,68% (CV **0,9%**),
  dimensiune HTML 320–334 KB (CV 1,2%).
- Titlu, meta și H1: un singur șablon (§3.3).
- Jaccard median pe corp de text: **0,66** (min 0,61, max 0,73).
- Diferența reală între pagini se reduce la: numele orașului, numele județului,
  linkul IPJ (care e 500) și 33,5 cuvinte de variație (sd).

**Cluster 2 — extras CF/județ (42 pagini).** Mai puțin strâns, dar cu un semnal
și mai brutal: **H2-1 și H2-2 sunt identice literal pe toate 42** („Ce este
extrasul de carte funciară" / „Tipuri de extras de carte funciară") — nici măcar
tokenul de județ nu apare în primele două titluri de secțiune. Outlinks 101 și
Unique Inlinks 14 pe toate 42. Jaccard median 0,56.

Setul e bimodal ca dimensiune: **27 de pagini cu 9 secțiuni H2 și 772–801 cuvinte**
vs. **15 pagini cu 10 secțiuni H2 și 955–1.002 cuvinte** — a doua variantă are în
plus o secțiune „Ce localități acoperim în {județ}". Deci nici măcar variația nu
e organică: sunt două șabloane, nu 42 de pagini scrise separat.
(Secvențele H2 complete: recalculate din `data/06-pages-flat.json`, câmpul `h2`.)

**Cluster 3 — perechile de servicii oglindă (câte 2).** Nu-s „scaled content", dar
sunt pagini construite din același text:
- `/servicii/extras-multilingv-certificat-casatorie/` ↔ `…-nastere/` — Jaccard
  **0,75** (cel mai mare din tot site-ul non-locație), title/meta/H1 din același
  șablon, 11 H2 identice după mascare.
- `/servicii/cazier-judiciar-online/persoana-fizica/` ↔ `…/persoana-juridica/` —
  Jaccard 0,41, word count 2.235 vs 2.275 (CV 0,9%), Unique Inlinks 232 amândouă.
- `/servicii/eliberare-certificat-de-casatorie/` ↔ `…-de-nastere/` — același șablon
  de title și meta.
- `/transcriere-certificat-de-casatorie/` ↔ `/transcriere-certificat-de-nastere/` —
  același șablon de title și H1.

**Cluster 4 — cele 9 servicii OCPI „copie-*".** Jaccard 0,35–0,39 între
`copie-plan-incadrare` / `plan-amplasament-delimitare` / `extras-plan-cadastral` /
`copie-plan-cadastral`, word count 2.172–2.319 (interval de 147 de cuvinte pe 9
pagini). Sunt aceleași 9 pagini care au și 3–8 inlinks (§6) — set generat, ne-linkat,
fără trafic.

**Ce NU e duplicat.** Calculatoarele (Jaccard 0,019, CV 13,8%) și articolele
(Jaccard 0,02–0,04, CV 68%). Sunt exact clusterele care **au supraviețuit** update-ului
pe expuneri (doc. 07). Corelația dintre „set strâns structural" și „cluster executat"
e completă în datele noastre.

---

## 5. Pagini thin

Baza: cele **191 de pagini indexabile** HTTP 200. Listă completă, sortată crescător
pe Word Count, cu clicurile GSC pe 3 luni alături: `data/08-thin-pages.csv`.

| Prag | n | % din indexabile |
|---|---:|---:|
| < 400 cuvinte | **3** | 1,6% |
| < 800 cuvinte | **43** | 22,5% |
| < 1.000 cuvinte | **71** | 37,2% |

### 5.1 Cross-tab tip × prag (doar indexabile)

| Tip | <400 | 400–799 | 800–999 | ≥1.000 | Total | Mediana cuvinte |
|---|---:|---:|---:|---:|---:|---:|
| articol | 0 | 9 | 11 | 38 | 58 | 1.298 |
| **locatie-cf** | 0 | **26** | **15** | 1 | 42 | **785** |
| calculator | 0 | 1 | 0 | 39 | 40 | 1.398 |
| serviciu | 0 | 1 | 0 | 28 | 29 | 2.303 |
| locatie-cazier | 0 | 0 | 0 | 8 | 8 | 1.426 |
| legal | 2 | 2 | 0 | 2 | 6 | 594 |
| hub | 1 | 1 | 1 | 1 | 4 | 702 |
| variant-serviciu | 0 | 0 | 0 | 2 | 2 | 2.255 |
| tool | 0 | 0 | 1 | 0 | 1 | 920 |
| homepage | 0 | 0 | 0 | 1 | 1 | 2.384 |

**41 din cele 43 de pagini sub 800 de cuvinte sunt pagini de locație CF sau
articole scurte.** Practic tot clusterul CF/județ e thin: 26/42 sub 800, 41/42
sub 1.000, un singur județ trece de 1.000 (Brașov, 1.002).

### 5.2 Sub 400 de cuvinte (3)

| Cuvinte | Pagină | Tip | Clicuri 3L |
|---:|---|---|---:|
| 166 | `/tools/` | hub | 1 |
| 236 | `/contact/` | legal | 190 |
| 239 | `/gdpr/` | legal | 0 |

### 5.3 Sub 800 de cuvinte, non-locație (17) — ordonate crescător

| Cuvinte | Pagină | Tip | Clicuri 3L | Expuneri 3L |
|---:|---|---|---:|---:|
| 166 | /tools/ | hub | 1 | 52 |
| 236 | /contact/ | legal | 190 | 17.337 |
| 239 | /gdpr/ | legal | 0 | 46 |
| 407 | /politica-cookies/ | legal | 1 | 697 |
| 502 | /curs-valutar/ | articol | 336 | 186.503 |
| 566 | /calculator/ | hub | 17 | 475 |
| 587 | /model-certificat-de-casatorie/ | articol | 1 | 84 |
| 648 | /ce-este-planul-cadastral/ | articol | 4 | 215 |
| 668 | /rolul-si-atributiile-onrc-romania/ | articol | 17 | 30.042 |
| 717 | /ghid-complet-certificat-de-integritate-comportamentala/ | articol | 925 | 28.959 |
| 727 | /ce-este-un-releveu/ | articol | 20 | 1.208 |
| 736 | /transcriere-certificat-de-casatorie/ | articol | **0** | **0** |
| 746 | /servicii/rovinieta-online/ | **serviciu** | 39 | 7.575 |
| 747 | /acte-necesare-certificat-de-nastere/ | articol | 3 | 458 |
| 750 | /suspendare-activitate-firma-ghid/ | articol | **0** | **0** |
| 768 | /calculator/valabilitate-documente/ | calculator | 6 | 2.870 |
| 781 | /politica-de-anulare/ | legal | 3 | 159 |

`/curs-valutar/` (502 cuvinte) a produs 186.503 expuneri — thin nu înseamnă
automat inutil. Dar `/transcriere-certificat-de-casatorie/`,
`/suspendare-activitate-firma-ghid/`, `/schimbare-sediu-social-srl-ghid/` (879),
`/certificat-constatator-pfa/` (887), `/certificat-constatator-insolventa/` (913),
`/certificat-constatator-de-baza/`, `/cazier-judiciar-online-gratuit/` au
**0 clicuri și 0 expuneri în 3 luni** — thin + fără cerere + în lista de scoruri
AI mari din auditul din 24.08.

### 5.4 Setul CF/județ

26 sub 800, 15 între 800 și 1.000, 1 peste. **17 din 42 au 0 clicuri în 3 luni**
(arges, bacau, bihor, galati, gorj, hunedoara, ialomita, teleorman, vaslui,
botosani*, calarasi*, caras-severin*, dambovita*, harghita*, mehedinti*, mures*,
timis* — cele cu * au expuneri, dar zero clicuri). Cele mai bune: bucuresti 24,
brasov 15, braila 9, satu-mare 9.

---

## 6. Linking intern

⚠️ `Link Score` e gol (Crawl Analysis nerulată), deci distribuția de Link Score
**nu poate fi produsă din acest export**. Folosesc Inlinks / Unique Inlinks /
Crawl Depth. Export: `data/08-linking-intern.csv`.

### 6.1 Distribuția Unique Inlinks (233 pagini HTML 200)

| Unique Inlinks | n pagini | Ce sunt |
|---:|---:|---|
| 0 | 1 | `/embed/ancpi/` (orfană — widget) |
| 2 | 19 | 8 articole, 7 calculatoare, hub `/tools/`, varianta utm, … |
| 3 | 21 | 15 articole, 4 calculatoare, 3 servicii OCPI |
| 4 | 18 | |
| 5–13 | 31 | |
| **14** | **42** | **toate paginile CF/județ, exact** |
| **49** | **48** | **toate paginile cazier/oraș, exact** |
| **232** | **52** | tot ce e în meniu + footer (sitewide) |

Distribuția e brutal bimodală: ori ești în navigație (232 de inlinks), ori ești
într-un bloc generat (14 sau 49), ori ai 2–6 linkuri și atât. **Nu există gradient
editorial.**

### 6.2 Adâncimea de crawl

| Depth | n |
|---:|---:|
| 0 | 1 |
| 1 | 54 |
| 2 | 176 |
| 3 | 1 (`/embed/ancpi/`) |
| 4 | 1 (varianta utm) |

**Nicio pagină reală la depth ≥ 3.** Arhitectura e plată — ceea ce e bine pentru
crawl, dar înseamnă și că nu există ierarhie tematică: totul atârnă direct de
homepage / meniu. Folder depth: 69 la nivel 1, 71 la 2, 92 la 3.

### 6.3 🔴 41 de pagini cu ≤ 3 inlinks unice

| Unique Inlinks | Tip | Pagină | Cuvinte |
|---:|---|---|---:|
| 0 | embed | /embed/ancpi/ | 31 |
| 2 | articol | /acte-necesare-casatorie/ | 1.429 |
| 2 | articol | /amenda-rovinieta-2025-tarife-plata-online-ghid-complet/ | 875 |
| 2 | articol | /cazier-fiscal-fara-spv/ | 1.970 |
| 2 | articol | /cazier-fiscal-firma/ | 1.999 |
| 2 | articol | /certificat-constatator-pentru-fonduri-europene/ | 1.437 |
| 2 | articol | /certificat-de-nastere-pentru-buletin-pasaport/ | 2.314 |
| 2 | articol | /extras-de-carte-funciara-pentru-casa-verde/ | 1.143 |
| 2 | articol | /sms-fals-amenda-ghiseul-ro/ | 1.030 |
| 2 | articol | /valabilitate-certificat-de-celibat/ | 1.710 |
| 2 | articol | /verificare-cazier-fiscal/ | 1.924 |
| 2 | calculator | /calculator/calculator-data/ | 1.507 |
| 2 | calculator | /calculator/diurna/ | 1.342 |
| 2 | calculator | /calculator/grad-indatorare/ | 1.512 |
| 2 | calculator | /calculator/inflatie/ | 1.465 |
| 2 | calculator | /calculator/pensie-invaliditate/ | 1.282 |
| 2 | calculator | /calculator/spor-salarial/ | 1.352 |
| 2 | calculator | /calculator/zile-lucratoare/ | 1.242 |
| 2 | hub | **/tools/** | 166 |
| 3 | articol | /cazier-judiciar-online-gratuit/ | 1.547 |
| 3 | articol | /cazier-si-certificat-de-integritate-pentru-profesori/ | 1.396 |
| 3 | articol | /ce-este-un-releveu/ | 727 |
| 3 | articol | /certificat-constatator-pentru-banca/ | 1.579 |
| 3 | articol | /certificat-constatator-pentru-licitatie/ | 1.284 |
| 3 | articol | /certificat-constatator-pentru-notar/ | 1.470 |
| 3 | articol | /certificat-de-celibat-pentru-casatorie-in-strainatate/ | 1.637 |
| 3 | articol | /certificat-de-nastere-din-strainatate/ | 1.444 |
| 3 | articol | /cum-vor-arata-documentele-de-stare-civila-2025/ | 1.032 |
| 3 | articol | /ghid-complet-certificat-de-integritate-comportamentala/ | 717 |
| 3 | articol | /model-certificat-de-casatorie/ | 587 |
| 3 | articol | /rolul-si-atributiile-onrc-romania/ | 668 |
| 3 | articol | /tabel-varsta-pensionare-anticipata-femei/ | 2.560 |
| 3 | articol | /verificare-proprietar-imobil/ | 1.405 |
| 3 | calculator | /calculator/calculator-indemnizatie-crestere-copil/ | 1.881 |
| 3 | calculator | /calculator/concediu-maternitate/ | 1.383 |
| 3 | calculator | /calculator/concediu-paternal/ | 1.384 |
| 3 | calculator | /calculator/cost-cadastru-intabulare/ | 1.494 |
| 3 | **serviciu** | **/servicii/copie-arhiva-ocpi/** | 2.319 |
| 3 | **serviciu** | **/servicii/copie-contract-vanzare/** | 2.223 |
| 3 | **serviciu** | **/servicii/copie-intabulare/** | 2.278 |

`/calculator/calculator-indemnizatie-crestere-copil/` are 3 inlinks unice — și
este unul dintre calculatoarele care ne aduc bani (261 de clicuri în fereastra
de după update, doc. 07). `/amenda-rovinieta-…/` are 2 inlinks și 1.463 de clicuri
în 3 luni. Cele mai valoroase pagini de trafic sunt cel mai prost linkate intern.

### 6.4 Ce tipuri sunt înfometate de linkuri

| Tip | n | Mediana Unique Inlinks | Min | Max |
|---|---:|---:|---:|---:|
| **articol** | 59 | **4** | 2 | 232 |
| **calculator** | 40 | **6** | 2 | 232 |
| locatie-cf | 42 | 14 | 14 | 14 |
| locatie-cazier | 48 | 49 | 49 | 49 |
| serviciu | 29 | 232 | **3** | 232 |
| legal / hub / homepage / tool | 12 | 232 | 2 | 232 |

Paradoxul: **paginile de locație (0,1% din clicuri) au de 3–12× mai multe linkuri
interne decât articolele și calculatoarele care produc 76% din clicuri.**
Iar 9 pagini de serviciu (toate „copie-*"/OCPI) au 3–8 inlinks pentru că nu sunt
în meniu:

| Unique Inlinks | Pagină de serviciu | Cuvinte |
|---:|---|---:|
| 3 | /servicii/copie-intabulare/ | 2.278 |
| 3 | /servicii/copie-contract-vanzare/ | 2.223 |
| 3 | /servicii/copie-arhiva-ocpi/ | 2.319 |
| 4 | /servicii/certificat-detineri-imobile/ | 2.403 |
| 4 | /servicii/copie-inventar-coordonate/ | 2.274 |
| 5 | /servicii/copie-plan-incadrare/ | 2.172 |
| 5 | /servicii/extras-cf-colectiv/ | 2.287 |
| 6 | /servicii/copie-releveu/ | 2.201 |
| 8 | /servicii/copie-plan-cadastral/ | 2.196 |

### 6.5 Volumul de linkuri pe pagină

Fiecare pagină de locație cazier are **142 de outlinks** (103 unice); paginile CF
au **101** (67 unice); boilerplate-ul de meniu+footer e ~83–88 de linkuri pe orice
pagină. Deci pe o pagină cazier/oraș de 1.400 de cuvinte există ~103 linkuri unice —
raport ~13 cuvinte / link.

---

## 7. Amprentă structurală: ce arată generat la scară

### 7.1 🔴 `<meta name="keywords">` identic pe 231 din 233 de pagini

`meta_keywords_all.csv`: 232/233 de pagini au meta keywords; **231 au exact același
șir**, lung exact 160 de caractere:

> `cazier judiciar online,cazier fiscal,certificat constatator,extras carte funciară,certificat de integritate comportamentală,documente online,acte online România`

Sunt doar **2 seturi distincte** pe tot site-ul (al doilea e homepage-ul). Adică:
`/calculator/tva/`, `/gdpr/`, `/politica-cookies/`, `/curs-valutar/` și
`/calculator/zile-lucratoare/` declară toate că sunt despre „cazier judiciar
online, cazier fiscal, certificat constatator". Meta keywords nu e folosit de
Google la ranking din 2009, dar:
- e un **marker de legacy/spam** clasic în orice audit automat,
- e literalmente keyword stuffing sitewide, pe pagini fără nicio legătură cu
  cuvintele injectate,
- combinat cu §3.3 și §4, contribuie la profilul „conținut turnat dintr-un template".

### 7.2 Metrici structurale identice — dovada de generare

| Semnal | Valoare | Set |
|---|---|---|
| Outlinks identice pe toate paginile | **142** | 48 pagini cazier/oraș |
| Unique Outlinks identice | **103** | aceleași 48 |
| Unique Inlinks identice | **49** | aceleași 48 |
| Text Ratio, CV | **0,9%** (3,52–3,68%) | aceleași 48 |
| Size HTML, CV | 1,2% (320–334 KB) | aceleași 48 |
| Outlinks identice | **101** | 42 pagini CF/județ |
| Unique Outlinks identice | **67** | aceleași 42 |
| Unique Inlinks identice | **14** | aceleași 42 |
| H2-1 + H2-2 identice literal | 42/42 | aceleași 42 |
| Titluri cu sufix `\| eGhiseul.ro` | 231/233 | tot site-ul |
| H1 == Title fără sufix | 59/233 | |

Pentru comparație, aceleași metrici pe seturile care **nu** au fost lovite:
calculatoare CV word count 13,8%, articole CV 68,1% și Text Ratio CV 27,5%.

### 7.3 Secvențe H2 identice

Recalculat din `data/06-pages-flat.json` (câmpul `h2`, 191 de pagini indexabile),
cu tokenul de locație mascat:

| n pagini | n secțiuni H2 | Secvența |
|---:|---:|---|
| **27** | 9 | Ce este extrasul de carte funciară → Tipuri de extras → La ce îți folosește în județul {L} → Online vs. la ghișeu OCPI {L} → Cum obții extrasul online, în {L} → Preț → Întrebări… |
| **15** | 10 | idem + „Ce localități acoperim în {L}" |
| 6+ | 12 | Cazier judiciar {L} la ghișeu — sediul IPJ {L} → Ce este cazierul judiciar… → Când ai nevoie… → Acte necesare… (toate cele 8 pagini cazier indexabile au 12 H2) |
| 2 | 11 | extras multilingv căsătorie / naștere |

### 7.4 🔴 `AggregateRating` fabricat, identic pe 31 de pagini de serviciu

Din schema JSON-LD (`data/06-pages-flat.json`, `schemaTypes`), **31 de pagini
poartă `AggregateRating`** — toate paginile `/servicii/*`. Sursa din cod:

- `src/app/servicii/[slug]/page.tsx:268-269` — `ratingValue: 4.8, reviewCount: 64`,
  **hardcodat**, aplicat identic tuturor celor 29 de servicii;
- `src/app/servicii/rovinieta-online/page.tsx:59-60` — `4.8 / 89`, altă valoare
  hardcodată;
- `src/lib/seo/constants.ts:281-282` — `SOCIAL_PROOF = { ratingValue: 4.9,
  reviewCount: 457 }`, cifra reală din profilul Google, plus
  `SERVICE_AGGREGATE_RATING` construit din ea — **dar nefolosit** de paginile de
  serviciu.

Deci site-ul publică trei note diferite (4,8/64, 4,8/89, 4,9/457) și afirmă că
29 de „produse" distincte au fiecare exact 64 de recenzii, fără nicio recenzie
vizibilă pe pagină. Sub politica Google pentru review snippets asta e
self-serving + fabricat; sub un spam update e exact genul de semnal on-page pe
care îl caută clasificatorul. **Nu e teorie: e o cifră inventată, repetată
identic pe 31 de URL-uri.**

### 7.5 `FAQPage` pe 181 din 191 de pagini indexabile (95%)

Singurele fără sunt hub-urile și paginile legale. Inclusiv toate cele 40 de
calculatoare și toate paginile de locație au FAQPage. Împreună cu duplicarea de
FAQ măsurată în doc. 05 (`data/05-faq-duplicate.csv`), e încă un strat de
template aplicat uniform.

### 7.6 Alte semnale de amprentă

- **Timp de răspuns**: mediană 0,108 s, maxim 0,633 s, zero pagini peste 1 s —
  performanța serverului nu e o problemă.
- **Dimensiune HTML**: mediană 254 KB, maxim 770 KB
  (`/servicii/cazier-judiciar-online/`), **30 de pagini peste 500 KB**. Mult HTML
  pentru puțin text: Text Ratio median 3,0–3,6% pe paginile de serviciu și de
  locație (5,4% pe calculatoare). Adică ~96% din payload e markup.
- **URL-uri**: mediană 61 de caractere, maxim 134, 12 peste 115. Zero majuscule
  în URL-uri de conținut, zero caractere care necesită encodare. Curat.
- **Imagini**: 71 în crawl, zero fără inlinks, 6 peste 150 KB (cele mai mari:
  specimenele de documente, 158–228 KB). `images_all.csv` nu conține coloana
  „Alt Text", deci **acoperirea alt nu poate fi auditată din acest export.**

---

## 8. Alte lucruri greșite găsite în date

### 8.1 32 de URL-uri au expuneri în GSC dar nu există în crawl

Confruntare `gsc/full-3luni/Pagini.csv` (207 URL-uri) × crawl (233 HTML 200).
Export: `data/08-gsc-vs-crawl.csv`.

| Clicuri 3L | Expuneri 3L | URL | Ce e |
|---:|---:|---|---|
| 19 | 1.215 | /importanta-extras-de-carte-funciara-colectiva/ | 301-at pe 24.08 (confirmă remedierea) |
| 10 | 239 | /categorii_servicii/certificate-nastere/ | **legacy WordPress** |
| 3 | 88 | /categorii_servicii/certificate-casatorie/ | legacy WP |
| 2 | 232 | /categorii_servicii/persoane-fizice/ | legacy WP |
| 2 | 7 | /wp-content/uploads/2025/03/Contract-Prestari-Servicii-SITE-INCARCAT.pdf | **PDF legacy indexat** |
| 1 | 226 | /category/informatii-utile/ | legacy WP |
| 1 | 141 | /cookies-policy/ | slug legacy |
| 1 | 88 | /servicii/asistenta-pentru-obtinere-cazier-online/ | serviciu dispărut |
| 1 | 21 | /comanda/status/ | blocat de robots, dar are expuneri |
| 1 | 6 | /comanda/copie-inventar-coordonate/ | idem |
| 0 | 65 | /wp-admin/* | **`/wp-admin` cu expuneri** |
| 0 | 45 | /category/informatii-utile/extras-de-carte-funciara/ | legacy WP |
| 0 | 17 | /category/informatii-utile/cazier-judiciar-online/ | legacy WP |
| 0 | 14 | /tools/alegeri-prezidentiale-2024-prezenta-la-vot/ | tool retras |
| 0 | 11 | /category/informatii-utile/certificat-constatator/ | legacy WP |
| 0 | 6 | /blog/page/2/ | paginare legacy |
| 0 | 3 | /categorii_servicii/persoane-fizice/page/2/ | legacy WP |
| 0 | 3 | /category/informatii-utile/page/2/ | legacy WP |
| 0 | 2 | /cum-aflam-numarul-carte-functionara-nr-cadastral/ | slug vechi al unui articol viu |
| 0 | 1 | /servicii/extras-carte-funciara/ | slug vechi |
| 0 | 1 | /calculator/impozit-chirie/income-tax/ | URL parazit |
| 0 | 25–8 | încă 5 PDF-uri `wp-content/uploads/*Contract*.pdf` | **contracte PDF indexate** |
| 0 | 1–23 | 6 URL-uri `/comanda/*` | blocate de robots, dar cu expuneri |

Trei probleme separate aici:
1. **Suprafață legacy WordPress încă în index** — `categorii_servicii/*`,
   `category/informatii-utile/*`, paginări `page/2`. Crawl-ul nu le găsește
   (nu sunt linkate de nicăieri), deci nu le pot verifica statusul din acest
   export; trebuie testate manual (301 sau 410?).
2. **6 PDF-uri de contract din `/wp-content/uploads/` sunt indexate** și au
   expuneri. Sunt documente contractuale vechi, cu date de firmă, servite de pe
   un path care nu mai există în arhitectura Next.js.
3. **`/comanda/*` are expuneri deși e blocat de robots.txt** — comportament normal
   (blocat ≠ deindexat). Dacă nu se dorește prezența lor în SERP, robots.txt e
   instrumentul greșit; trebuie `noindex` servit, deci deblocare + noindex.

### 8.2 58 de pagini din crawl au 0 date GSC pe 3 luni

40 sunt paginile cazier noindex (așteptat), 9 sunt pagini CF/județ, restul 9 sunt
articole/pagini fără nicio expunere:
`/cazier-judiciar-online-gratuit/`, `/certificat-constatator-de-baza/`,
`/certificat-constatator-insolventa/`, `/certificat-constatator-pfa/`,
`/schimbare-sediu-social-srl-ghid/`, `/suspendare-activitate-firma-ghid/`,
`/transcriere-certificat-de-casatorie/`, `/embed/ancpi/`, varianta utm.
Patru dintre ele sunt în top-10 scoruri AI din auditul din 24.08.

### 8.3 `/tools/` — hub de 166 de cuvinte cu 2 inlinks

Hub-ul care ar trebui să susțină `/tools/verificare-rovinieta-online/` (32.589 de
clicuri în 3 luni, cea mai performantă pagină a site-ului) are 166 de cuvinte și
2 linkuri interne. Tool-ul în sine are 920 de cuvinte.

### 8.4 Pagina `/embed/ancpi/` e orfană (0 inlinks) și are `<meta refresh 300>`

Corect noindexată, dar e singura pagină cu meta refresh de pe site și singura cu
0 inlinks. Fără impact SEO; de menționat doar pentru completitudine.

---

## 9. Probleme, în ordinea gravității

| # | Problemă | Dovadă (număr + fișier) | URL-uri afectate | Severitate |
|---|---|---|---:|---|
| 1 | **Două clustere generate din șablon**, cu title/meta/H1 identice minus tokenul de locație și amprentă structurală identică (Outlinks 142/101 pe toate, Unique Inlinks 49/14 pe toate, Text Ratio CV 0,9%) | `08-clustere-sablon.csv`, `08-clustere-duplicat.csv`, `08-amprenta-structurala.csv` | **90** (48 cazier + 42 CF) | **blocant** |
| 2 | **`AggregateRating` fabricat și identic** (4,8/64) pe toate paginile de serviciu, fără recenzii vizibile; 3 valori diferite pe site | `06-pages-flat.json` (31 pagini cu AggregateRating) + `src/app/servicii/[slug]/page.tsx:268-269`, `src/app/servicii/rovinieta-online/page.tsx:59-60`, `src/lib/seo/constants.ts:281` | **31** | **blocant** |
| 3 | **`meta name="keywords"` identic, 160 caractere, pe 231 de pagini** — keyword stuffing sitewide pe pagini fără legătură | `meta_keywords_all.csv`: 2 seturi distincte / 232 pagini | **231** | **blocant** |
| 4 | **40 de pagini noindex rămân complet cross-linkate** (49 inlinks + 142 outlinks fiecare) — plasa de doorway e intactă în graful de linkuri, crawl budget irosit | `internal_all.csv` + `08-linking-intern.csv` | **40** | **mare** |
| 5 | **41 de linkuri către IPJ-uri județene cu HTTP 500** (82 de linkuri), 8 dintre ele pe pagini indexabile — „referința locală reală" e moartă | `response_codes_server_error_(5xx).csv` (42 rânduri), `08-linkuri-externe-rupte.csv` | 41 URL externe / 41 pagini ale noastre | **mare** |
| 6 | **Cluster CF/județ integral thin**: 26/42 sub 800 de cuvinte, 41/42 sub 1.000, H2-1+H2-2 identice literal pe toate 42, 17 cu 0 clicuri în 3 luni | `08-thin-pages.csv`, `h2_all.csv` | **42** | **mare** |
| 7 | **`FAQPage` pe 95% din pagini** (181/191), inclusiv pe calculatoare — template aplicat uniform | `06-pages-flat.json`, `05-faq-duplicate.csv` | 181 | **mare** |
| 8 | **Linking intern invers față de valoare**: articolele (mediană 4 inlinks) și calculatoarele (6) produc 76% din clicuri; paginile de locație (49 / 14) produc 0,1% | `08-linking-intern.csv`; doc. 07 §4 | 41 pagini cu ≤3 inlinks | **mare** |
| 9 | **9 pagini de serviciu cu 3–8 inlinks** (toate „copie-*"/OCPI), 2.172–2.403 cuvinte, Jaccard 0,35–0,39 între ele, fără trafic | `08-linking-intern.csv`, `05-similaritate-seturi.tsv` | 9 | **mare** |
| 10 | **Suprafață legacy WordPress încă în index**: `categorii_servicii/*`, `category/informatii-utile/*`, `/cookies-policy/`, `/wp-admin/*` + **6 PDF-uri de contract** din `/wp-content/uploads/` | `08-gsc-vs-crawl.csv`: 32 URL în GSC, 0 în crawl | 32 | **mediu** |
| 11 | **Title prea lungi sistematic**: mediană 73 caractere, 207/233 peste 60, 198/233 peste 561px → Google rescrie titlul pe 85% din pagini | `page_titles_all.csv` | 207 | **mediu** |
| 12 | **Meta description prea lungi**: mediană 164 caractere, 137/233 peste 160, 40 peste 200 (max 350) | `meta_description_all.csv` | 137 | **mediu** |
| 13 | **`/comanda/*` blocat de robots.txt dar cu expuneri în GSC** — robots.txt nu deindexează | `08-gsc-vs-crawl.csv` (8 URL `/comanda/*` cu expuneri) | 36 | **mediu** |
| 14 | **Perechi de servicii/articole oglindă** cu Jaccard 0,41–0,75 și șabloane comune de title/meta (extras multilingv, eliberare certificat, transcriere, persoană fizică/juridică) | `05-perechi-similare.csv`, `08-clustere-sablon.csv` | 8 | **mediu** |
| 15 | **Text Ratio 3,0–3,6% pe serviciile și locațiile** (30 de pagini peste 500 KB HTML, max 770 KB) — ~96% markup | `internal_all.csv` | 30 | **mediu** |
| 16 | **`/tools/` hub de 166 de cuvinte cu 2 inlinks**, deși susține pagina cu cele mai multe clicuri de pe site | `08-thin-pages.csv`, `08-linking-intern.csv` | 1 | **mediu** |
| 17 | **7 pagini indexabile cu 0 clicuri și 0 expuneri în 3 luni**, thin, în top-10 scoruri AI din 24.08 | `08-gsc-vs-crawl.csv` | 7 | **mediu** |
| 18 | **2 erori 400** pe `/_next/image?…w=3840` (breakpoint-ul mare din srcset) | `internal_all.csv` | 2 (articole: planul-cadastral, releveu) | **cosmetic** |
| 19 | **`anpc.ro/ce-este-sal/` status 0** din footer sitewide, `ec.europa.eu/consumers/odr` 301 sitewide | `external_all.csv` | 233 (footer) | **cosmetic** |
| 20 | **`/embed/ancpi/`** orfană (0 inlinks), fără canonical, cu `<meta refresh 300>` | `internal_all.csv` | 1 | **cosmetic** |
| 21 | **Exportul nu conține near-duplicates, Link Score, spelling/grammar, semantic similarity** — Crawl Analysis nu a fost rulată | 0/233 valori pe 6 coloane | — | **de refăcut** |

### Ce NU e o problemă (verificat, ca să nu se mai reia)

- Canonicals: 231/233 self-canonical, 0 mismatch, 0 lanțuri de redirect, 0 3xx interne.
- Duplicate exacte de title/meta/H1: **zero** (în afara variantei utm canonicalizate).
- HTTPS peste tot, 0 URL `http://`, 0 hreflang greșit (nu există hreflang), 0 amphtml.
- Adâncime de crawl: nicio pagină reală peste depth 2.
- Timp de răspuns: mediană 0,108 s, max 0,633 s.
- Structura URL: mediană 61 de caractere, fără majuscule sau caractere de encodat.
- Duplicate hash exact: 1 singur, deja rezolvat prin canonical.

---

## Fișiere derivate (`research/data/`)

| Fișier | Conținut |
|---|---|
| `08-pagini-crawl.csv` | 233 pagini HTML 200 × 28 de coloane (crawl + tip + clicuri/expuneri GSC 3 luni) — tabelul-master |
| `08-thin-pages.csv` | cele 191 de pagini indexabile sortate crescător pe Word Count, cu pragul și datele GSC |
| `08-linking-intern.csv` | toate paginile sortate pe Unique Inlinks, cu depth și tip |
| `08-linkuri-externe-rupte.csv` | cele 43 de URL-uri externe rupte + maparea județ → pagina noastră + indexabilitatea ei |
| `08-clustere-sablon.csv` | grupurile de Title/Meta/H1/H2-1 identice după mascarea tokenului de locație |
| `08-clustere-duplicat.csv` | rezumatul clusterelor: n, indexabile, outlinks/inlinks identice, CV-uri, Jaccard, clicuri |
| `08-amprenta-structurala.csv` | min/mediană/max/sd/CV pentru 9 metrici × fiecare tip de pagină |
| `08-gsc-vs-crawl.csv` | URL-uri în GSC dar nu în crawl (32) și în crawl dar fără date GSC (58) |
