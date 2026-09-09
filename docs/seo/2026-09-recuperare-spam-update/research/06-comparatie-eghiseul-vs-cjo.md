# eghiseul.ro vs cazierjudiciaronline.com — ce diferă REAL între site-ul lovit și cel neatins

**Data măsurătorii:** 09.09.2026 · **Metodă:** fetch live al tuturor URL-urilor din
sitemap-ul fiecărui site (191 + 71, toate 200 OK), extragere text din `<main>`,
plus o măsurătoare separată pe codul sursă la commit-ul de dinaintea update-ului
(19.08). Toate scripturile și datele brute: `data/06-*` și `data/06-scripts/`.

> **Scopul documentului:** să izoleze discriminatorul real, nu să repete
> presupuneri. Verifică și *contrazice* pe alocuri analiza din
> `docs/seo/2026-08-24-spam-update-prabusire-organica.md`.

---

## TL;DR — verdictul în 6 rânduri

1. **Nu e scriitura AI.** Măsurat identic pe ambele site-uri, la aceeași dată,
   CJO are scoruri de tipare formulaice **mai mari** decât eghiseul (articole
   15,5 vs 9,5 /1k live; 13,8 vs 10,4 /1k pe sursă la 19.08). Afirmația veche
   „eghiseul 10/1k vs CJO 5–8/1k" **nu se reproduce**.
2. **Nu sunt paginile de locație.** Paginile CJO de oraș sunt **mai templatizate**
   (86% boilerplate, 13,8% conținut unic) decât ale noastre (76–77% boilerplate,
   20–23% unic) — și n-au fost lovite. Confirmă analiza veche.
3. **Nu sunt semnalele de încredere.** Aceeași firmă, aceeași adresă, același
   telefon, același disclaimer, același ANPC/SOL, aceleași recenzii
   auto-declarate în schema. Pagina de contact a eghiseul e chiar *mai* bogată.
4. **Controlul intern decisiv:** cele 38 de calculatoare au fost publicate în
   ACELAȘI lot de 2 zile (21–22.06) ca paginile de județ și ghidurile — și
   **au supraviețuit**. Deci nici cadența, nici stilul, nici domeniul nu explică
   demotarea. A murit exact clusterul comercial.
5. **Ce diferă real:** eghiseul are **83 de perechi de pagini non-locație cu
   ≥25% suprapunere** (inclusiv o familie de **13 pagini de serviciu cadastral
   cvasi-identice**); CJO are **ZERO**. Plus **27 din 42** pagini de județ sunt
   template pur la ~740 cuvinte. Plus **linking intern de 7× mai slab**
   (mediană 5 pagini inbound vs 38 la CJO).
6. **Ce e de reparat, în ordine:** duplicarea/templatizarea clusterului comercial
   → coeziunea internă a clusterului → subțirimea (37 pagini sub 800 cuvinte).
   NU: încă o rundă de humanizer pe articole, NU pagini „Despre noi" ca leac
   principal, NU backlinkuri.

---

## 0. Metodologie (ca să poți re-verifica)

| Pas | Ce am făcut | Fișier |
|---|---|---|
| Fetch | toate URL-urile din `sitemap.xml`-ul fiecărui site, live, 09.09 | `data/06-scripts/fetch.mjs`, `06-egh-urls.txt`, `06-cjo-urls.txt` |
| Extragere text | cel mai mare bloc `<main>`, fără `script/style/svg`; deci **fără header/footer** pe ambele | `06-scripts/extract.mjs` |
| Clasificare pagini | pe path, reguli explicite în cod (home / service / location / article / tool / hub / legal) | `06-scripts/analyze.mjs` |
| Scor tipare formulaice | lexicon RO cu 7 grupe, aplicat **identic** pe ambele | `06-scripts/lexicon.mjs` |
| Similaritate | Jaccard pe tokeni (≥3 litere) **și** pe shingles de 5 cuvinte; boilerplate = shingles de 6 cuvinte prezente pe ≥50% din set | `06-scripts/boiler.mjs`, `06-scripts/nearvdup.mjs` |
| Cadență | `git log --diff-filter=A` pe fișierele de rută publică + istoricul fișierelor de date pentru rutele dinamice | `06-scripts/gitpages2.sh`, `06-git-*.txt` |
| Control pre-update | același lexicon pe textul JSX extras din sursă la commit-ul de dinainte de 19.08, pe ambele repo-uri | `06-scripts/pre-update.mjs` |

**Limite, spuse din start:**
- Măsor site-ul **de azi**. eghiseul a rescris 11 articole (24 și 28.08, commits
  `9518ca9`, `2110d18`, `5478b6e`) și a scos 40 de pagini-oraș din index pe
  28.07. De aceea am refăcut măsurătoarea de stil și pe sursa de la 19.08.
- „CJO nu a fost lovit" e preluat din analiza din 24.08 (GSC + SERP `pws=0`),
  nu re-verificat aici.
- Jaccard/shingles măsoară suprapunere lexicală, nu intenție. Doorway-ul pe
  variante de interogare (aceeași intenție, pagini diferite) NU se vede în
  aceste cifre — îl tratez separat, în secțiunea 7.
- Nu am modificat nimic în `cazierjudiciaronline.com` (read-only).

---

## 1. Forma site-ului

### 1.1 Inventar

| | **eghiseul.ro** | **CJO** |
|---|---|---|
| URL-uri în sitemap (toate 200) | **191** | **71** |
| URL-uri indexabile în afara sitemap-ului | 0 | 4 (`cazier-fiscal-pentru-{credit-bancar,licitatii-publice,cetatean-strain}`, `verificare-cazier-fiscal-online`) |
| Pagini `noindex` | 0 din 191 (dar 40 pagini-oraș scoase din index pe 28.07 nu mai sunt în sitemap) | 2 (`/ppc/*`) |
| Cuvinte totale în `<main>` | **260.572** | **103.154** |
| Canonical self-referențial | 191/191 | 71/71 |
| Pagini cu ≠1 `<h1>` | 0 | 0 |
| Pagini fără meta description | 0 | 0 |

### 1.2 Pe tip de pagină

| Clasă | EGH n | EGH mediană cuvinte | EGH sub 800 cuv. | CJO n | CJO mediană cuvinte | CJO sub 800 cuv. |
|---|---|---|---|---|---|---|
| home | 1 | 2.080 | 0 | 1 | 2.176 | 0 |
| service (comercial) | **31** | 2.316 | 1 | **7** | 1.991 | 0 |
| location | **50** | **747,5** | **27** | **39** | **1.381** | **0** |
| article / ghid | **57** | 1.269 | **10** | **18** | 1.240 | **0** |
| tool / calculator | **42** | 1.336,5 | 2 | 1 (status) | 18 | 1 |
| hub (index-uri) | 4 | 665,5 | 2 | 1 | 1.036 | 0 |
| legal + contact | 6 | 547 | 4 | 4 | 852 | 2 |

### 1.3 Raport comercial / conținut

| | EGH | CJO |
|---|---|---|
| Pagini tranzacționale (home + service + location) | 82 = **43%** | 47 = **66%** |
| Pagini de conținut (article + tool + hub) | 103 = **54%** | 19 = **27%** |
| Pagini de conținut per serviciu monetizat | 103 / 9 ≈ **11,4** | 19 / 4 ≈ **4,8** |

### 1.4 Lățime tematică — aici e diferența de formă, cuantificată

Am atribuit fiecărei pagini o verticală tematică (reguli în
`06-scripts/topics.mjs`, rezultat în `06-topics.json`):

| Verticală | EGH | CJO |
|---|---|---|
| imobiliare / cadastru | **74** | 0 |
| stare civilă | 21 | 0 |
| cazier judiciar & integritate | 19 | **59** |
| **muncă & pensii** *(nu vindem nimic aici)* | **18** | 0 |
| firme / ONRC | 18 | 0 |
| **fiscal-financiar general** *(nu vindem nimic)* | **9** | 0 |
| auto & rovinietă | 8 | 1 |
| cazier fiscal | 5 | 3 |
| **utilitare diverse** *(nu vindem nimic)* | **5** | 0 |
| legal / contact | 6 | 5 |

- **CJO: 63 din 71 de pagini (89%) într-o singură verticală.** Un site
  mono-produs, în care fiecare pagină e despre același document.
- **eghiseul: 8 verticale, 39 de pagini (20%) în verticale unde nu vindem
  nimic** (pensii, salarii, credite, TVA, taxe notariale, termene judiciare,
  jugăre și stânjeni).

**Da, eghiseul e pur și simplu mult mai lat.** 2,7× mai multe pagini, 2,5× mai
multe cuvinte, 8 verticale vs 1. Dar vezi secțiunea 8: lățimea singură nu
explică ce a murit, pentru că partea *cea mai* off-topic (calculatoarele) e
exact partea care a supraviețuit.

### 1.5 Navigație

| | EGH | CJO |
|---|---|---|
| Linkuri în `<header>` (home) | **47** (mega-menu: 6 categorii de servicii + 20+ calculatoare) | **5** (Servicii, Orașe, Blog, Contact, Verifică Status) |
| Linkuri în `<footer>` | 37 | 14 |
| Home = ? | **director de servicii** (12 linkuri către /servicii/certificat-constatator-online, 7 către cazier…) | **pagină tranzacțională**: formularul de comandă „Pasul 1 din 6" e chiar în hero |

---

## 2. Conținut per pagină — merge CJO mai în adâncime?

**Pe articole: nu.** Mediana e practic egală (EGH 1.269 vs CJO 1.240 cuvinte).
Diferența e la **coada subțire**: eghiseul are 10 articole sub 800 de cuvinte
(min 560), CJO are **zero** (min 819).

**Pe pagini comerciale: da, dar invers decât te-ai aștepta.** Paginile de
serviciu eghiseul sunt mai lungi (2.316 vs 1.991 mediană). Unde CJO câștigă
clar e la **paginile de locație: 1.381 vs 747,5 cuvinte** — și niciuna sub 800.

**Distribuția e bimodală la noi, pe județe** (`06-boilerplate.json`):

| Grup | n | Cuvinte | Conținut unic (6-grame) |
|---|---|---|---|
| județe cu conținut local scris (commit `1cd2526`, 21.07) | **15** | 915–961 | 28,5–33,1% |
| județe rămase template pur | **27** | **734–764** | **19,8–22,6%** |

Cele 27 diferă între ele practic doar prin numele județului și adresa OCPI.

---

## 3. Pagini de locație — aceeași metodă pe ambele seturi

Trei măsurători, aplicate identic:

| Set | n | Jaccard tokeni (medie) | Jaccard shingles-5 (medie) | Boilerplate (6-grame pe ≥50% din set) | 6-grame unice / pagină (mediană) | % unic (mediană) |
|---|---|---|---|---|---|---|
| **CJO** cazier orașe | 39 | **0,909** | **0,723** | **86,0%** | 182 | **13,8%** |
| EGH cazier orașe | 8 | 0,880 | 0,625 | 75,7% | **316** | **23,5%** |
| EGH extras CF județe | 42 | **0,777** | **0,544** | **76,9%** | 147 | 20,5% |

**Pe toate cele trei metrici, paginile CJO de oraș sunt mai duplicate decât ale
noastre.** Confirmă și întărește constatarea din analiza de la 24.08 (acolo:
Jaccard 88–89% CJO vs 79–82% noi). Setul CJO e și mai omogen: toate cele 39
între 1.357 și 1.540 de cuvinte.

### Ce e unic, de fapt, pe fiecare set

**CJO / Cluj-Napoca** — unicitatea e „date reale de instituție", plus un
paragraf de context local:

> „IPJ Cluj - Serviciul Cazier Judiciar, Statistică și Evidențe Operative /
> Str. Decebal nr. 26, Cluj-Napoca, jud. Cluj, 400027 / 0264 505 248 /
> https://cj.politiaromana.ro / Program de lucru: Luni 09:00 - 13:00, Marți
> 09:00 - 13:00, Miercuri 11:00 - 13:00, 15:00 - 19:00 …"

Plus `LocalBusiness` schema pe 40 de pagini. Comentariul din
`src/config/city-data.ts` e sincer: *„Top 5 cities have detailed placeholder
data; remaining 34 have minimal data."*

**eghiseul / Cluj-Napoca (cazier)** — unicitate cel puțin la fel de „reală",
uneori mai bogată:

> „Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Cluj /
> Str. Decebal nr. 26 … Date publice, preluate de pe pagina oficială a IPJ
> Cluj." + „cazierul judiciar este cerut frecvent pentru angajare la
> Universitatea Babeș-Bolyai, companiile IT (Bosch, Endava, NTT Data), Banca
> Transilvania"

**eghiseul / Cluj (extras CF)** — date OCPI reale + un paragraf de piață:

> „OCPI Cluj / Str. Alexandru Vaida Voevod nr. 53, Cluj-Napoca, 400436 /
> 0264 431666 / cj@ancpi.ro" + „Comuna Florești — cea mai populată comună din
> România — generează singură un volum mare de cereri de extras"

**Verdict pe secțiunea 3:** unicitatea CJO **nu** e mai „semnificativă" decât a
noastră. Pe paginile de cazier suntem net mai unici (316 vs 182 6-grame unice).
Singurul punct unde pierdem: cele **27 de județe de 740 de cuvinte, template
pur**, care n-au primit niciodată conținut local — dar și acelea au adresa,
telefonul și emailul OCPI real.

---

## 4. Semnale de încredere și legitimitate — ipoteza pică

Aceeași firmă operează ambele site-uri, iar semnalele sunt aproape identice.

| Semnal | eghiseul.ro | CJO |
|---|---|---|
| Identitate juridică în footer | **eDigitalizare SRL · CUI RO49278701 · Reg. Com. J2023001097301 · Jud. Satu Mare, Com. Odoreu, Str. Salcâmilor nr. 2** | **EDIGITALIZARE S.R.L. · CUI: 49278701 · J2023001097301** |
| Adresă completă | pe toate 191 paginile (footer) + pagina de contact | pe pagina de contact („Str. Salcâmilor 2, Sat Odoreu Com. Odoreu, SATU MARE"), CUI+J în footer |
| Telefon / WhatsApp / email | `tel:` pe 191/191, `mailto:` pe 191/191, `wa.me` pe 191/191 | `tel:` pe 71/71, `mailto:` pe 3/71, `wa.me` pe 60/71 |
| Program de lucru | L–V 08:00–16:00, în header + footer + contact | L–V 08:00–16:00, pe contact |
| ANPC + SOL/ODR | **191/191 pagini** | **71/71 pagini** |
| Termeni / Confidențialitate / Anulare | da (+ GDPR + Cookies + setări cookie) | da (3) |
| Disclaimer de neafiliere | „**eGhișeul.ro este un serviciu privat de asistență… Nu suntem o instituție de stat și nu suntem afiliați cu vreun organ guvernamental.** Documentele sunt emise exclusiv de autoritățile competente din România, iar serviciile noastre sunt opționale — documentele pot fi solicitate și direct la instituțiile emitente." | „**Serviciu privat de asistență. Nu suntem o instituție de stat și nu suntem afiliați cu niciun organ guvernamental.** … nu are nicio legătură cu instituțiile guvernamentale sau platforma ghiseul.ro." |
| Divulgare avocat/partener | „**Avocatul nostru colaborator, înscris în Barou**, se ocupă de întreaga procedură legală în numele dumneavoastră" — cuvântul „Barou" apare pe **191/191** pagini | „avocat" pe 52/71 pagini, „Barou" pe **2/71** |
| Recenzii / rating | „Google Reviews **4,9 • 457 recenzii**", „150k+ Clienți", „Peste 200.000 de proceduri" | „**4.9 · 441 recenzii verificate**", „100.000+ Clienți", „150.000+ Documente eliberate" |
| Schema cu `AggregateRating` + `Review` cu persoane numite | 31 pagini (`Product`+`AggregateRating`) | 5 pagini (`Product`+`AggregateRating`+`Review`: „Maria Popescu — Am primit cazierul in mai putin de 24 de ore…") |
| Pagină „Despre noi" / autor | **NU există** | **NU există** |

**Concluzie:** pe axa „arăt ca o afacere reală", eghiseul e la paritate sau
*peste* CJO (adresă pe fiecare pagină, divulgarea avocatului pe fiecare pagină,
formular de contact cu consimțământ GDPR, GDPR + cookie settings în plus).
Ambele fac exact aceleași lucruri discutabile: recenzii auto-declarate în
markup, cifre de volum neverificabile, zero pagină „Despre noi", zero autor.
**Ipoteza „CJO arată mai mult a business real" nu se susține pe date.**

Nuanța care rămâne: brandul „eGhișeul.ro" e la o literă de portalul de stat
`ghiseul.ro`, iar CJO are un nume pur descriptiv. E o diferență reală de
percepție, dar: (a) ambele au disclaimer explicit, (b) numele n-a fost o
problemă doi ani. O las ca ipoteză de rangul 3, nu ca leac.

---

## 5. Istoric de publicare — cadența, la nivel de URL

Nu la nivel de fișier (rutele dinamice generează zeci de URL-uri dintr-un
singur fișier). Am reconstituit din `git log --diff-filter=A` + istoricul
fișierelor de date (`src/lib/seo/locations/`, `src/config/city-data.ts`).

### eghiseul.ro

| Zi | URL-uri publice noi | Ce |
|---|---|---|
| 13–14.06 | 9 | pagini de serviciu (paritate slug cu WP) |
| **16.06** | 22 | **15 = MIGRARE articole WP** (`9b8e078` „migrate 14 top-performing WP articles", `8571599` articolul-fanion) + /blog + 4 pagini legale |
| 19–20.06 | 6 + **5 orașe** | pilot pagini-oraș cazier („date IPJ reale") |
| **21.06** | 16 + **32 orașe** = **48** | 16 calculatoare; orașe 5 → 37 în 4 commit-uri |
| **22.06** | 40 + **11 orașe** + **43 județe** = **94** | 22 calculatoare, 10 ghiduri noi („cluster ONRC use-case (4) + stare civilă (6)"), 43 pagini extras CF pe județe |
| 25.06 | 16 | clusterul cadastral (14 pagini rescrise + hub-and-spoke) |
| iulie (9 zile) | 24 | ritm normal |
| **07.08** | 5 | „4 articole noi pe golurile identificate" + cazier fiscal PF |

**Total 20–25.06: ~165 de URL-uri indexabile noi în 6 zile**, pe un domeniu
care avea ~30 de pagini în Next.js. Vârf: **94 într-o singură zi**.

### CJO (exclus `/ecazier/*`, care e alt domeniu)

| Zi | URL-uri publice noi |
|---|---|
| 31.03 | 7 (rebuild-ul) |
| **05.04** | **53** = 14 pagini statice + **toate cele 39 de pagini de oraș, într-un singur commit** |
| 18.04 | 4 |
| 29.04 | 4 |
| 25.05 | 4 |
| 15.07 | 1 |

*(cele 10 pagini din 03.08 sunt pe ecazier.ro, alt domeniu — nu intră în
comparație.)*

### Ce spune asta

Afirmația veche „12 pagini într-o zi (16.06)" e **greșită ca interpretare**:
16.06 a fost **migrarea** unor articole care existau deja pe WordPress, pe
aceleași slug-uri. Cadența reală, îngrijorătoare, e **20–25.06: 165 de URL-uri
în 6 zile, cu vârf de 94/zi**.

Dar și CJO a publicat **53 de URL-uri într-o zi** (39 dintre ele pagini de oraș
template) și nu a pățit nimic. Deci cadența, **singură**, nu discriminează.
Diferența e de amplitudine (94 vs 53 într-o zi; 165 vs 53 în total), nu de
natură.

---

## 6. Amprenta de scriere formulaică / AI — afirmația veche NU rezistă

Lexicon RO cu 7 grupe (promo, hedging, false ranges, filler, „reprezintă/
constituie", gerunzii de adâncime, em/en-dash), aplicat **identic**, plus
numărarea listelor `<strong>Termen:</strong>`. Cod: `06-scripts/lexicon.mjs`.

### 6.1 Site-ul live (09.09), mediană per 1.000 de cuvinte

| Clasă | EGH total | EGH fără em-dash | CJO total | CJO fără em-dash |
|---|---|---|---|---|
| article | **9,5** | **1,9** | **15,5** | **6,1** |
| service | 7,5 | 1,3 | 15,1 | 8,4 |
| location | 16,2 | **0,0** | 16,0 | **10,2** |
| tool | 11,3 | 1,6 | — | — |
| home | 14,4 | 1,4 | 17,0 | 14,3 |

### 6.2 Totaluri pe site, per 1.000 de cuvinte

| Grup | EGH | CJO |
|---|---|---|
| promoțional („esențial", „crucial", „joacă un rol"…) | **0,17** | **0,55** |
| hedging („este important să", „de obicei", „ar putea"…) | **0,53** | **1,07** |
| intervale („3-5 zile", „1-2 zile") | 0,82 | **6,72** |
| filler („în ziua de azi", „în concluzie", „nu doar… ci și") | **0,35** | 0,11 |
| gerunzii de adâncime | 0,04 | 0,01 |
| em/en-dash | **9,64** | 7,91 |
| liste `<strong>Termen:</strong>` (total absolut) | 324 | 134 |

### 6.3 Controlul pre-update: sursa la 19.08, înainte de orice humanizer

(Extras din JSX, aceeași metodă pe ambele repo-uri; `06-pre-update-source-scores.json`)

| | EGH (136 pagini) | CJO (33 pagini) |
|---|---|---|
| mediană totală /1k | **10,42** | **13,80** |
| fără em-dash | 1,22 | **4,81** |
| fără em-dash și fără intervale | 0,86 | 0,89 |

### 6.4 Verdict

- Cifra veche pentru eghiseul **se reproduce** (10,42 ≈ „10,0/1k").
- Cifra veche pentru CJO **nu se reproduce deloc**: la aceeași dată, cu același
  script, CJO iese **13,8**, nu „5–8". Cel mai probabil, în auditul din 24.08
  cele două site-uri n-au fost măsurate identic (site live vs sursă, sau doar
  un subset de pagini CJO).
- Când scoți em-dash-urile și intervalele de livrare — care nu sunt semnale de
  spam, ci punctuație și termene reale — **ambele site-uri sunt la ~0,9/1k**.
  Adică markerii de proză formulaică sunt rari pe amândouă.
- Afirmația „pagini de locație 10,6–11,8 la noi vs 5,0 la CJO" e **inversă
  față de realitate**: fără em-dash, paginile noastre de locație ies **0,0**,
  ale CJO **10,2**.

**Consecință practică: încă o rundă de „humanizer" pe articole e efort cu
randament aproape nul.** Cele 11 articole rescrise pe 24 și 28.08 au fost
igienă bună, dar nu sunt levierul.

---

## 7. Ce face CJO structural și noi nu

### 7.1 Duplicare în afara paginilor de locație — diferența cea mai brutală

Similaritate pe shingles de 6 cuvinte, toate perechile din fiecare site
(`06-near-duplicates.json`):

| | EGH | CJO |
|---|---|---|
| Perechi cu Jaccard ≥ 0,25 | 972 | 741 |
| dintre care perechi **locație–locație** | 889 | **741 (toate)** |
| **Perechi non-locație ≥ 0,25** | **83** | **0** |
| Pagini non-locație implicate | **21** | **0** |

La CJO, absolut toată suprapunerea vine din setul de orașe. În afara lui, nicio
pereche de pagini nu trece de 25%. La noi există o familie clar identificabilă:

| Pagină | În câte perechi ≥0,25 |
|---|---|
| `/servicii/copie-plan-cadastral` | 14 |
| `/servicii/extras-plan-cadastral` | 13 |
| `/servicii/certificat-sarcini` | 13 |
| `/servicii/copie-plan-incadrare` | 12 |
| `/servicii/plan-amplasament-delimitare` | 12 |
| `/servicii/copie-inventar-coordonate` | 12 |
| `/servicii/copie-contract-vanzare` | 12 |
| `/servicii/copie-releveu` | 12 |
| `/servicii/copie-intabulare` | 12 |
| `/servicii/copie-carte-funciara` | 12 |
| `/servicii/copie-arhiva-ocpi` | 11 |
| `/servicii/extras-cf-colectiv` | 11 |
| `/servicii/actualizare-adresa-cf` | 10 |

**13 pagini de serviciu cadastral, toate ~2.200–2.350 de cuvinte, toate scrise
în același commit** (`06-25`, „rescriere copy pe cele 14 pagini cadastrale"),
cu 30–36% shingles comuni două câte două. Plus perechile
`extras-multilingv-casatorie ↔ nastere` (**0,713**) și
`cazier-judiciar/persoana-fizica ↔ persoana-juridica` (**0,409**).

Adunat: **13 cadastrale + 42 județe + 8 (inițial 48) orașe = 63 de pagini
comerciale generate din 3 template-uri**, într-o fereastră de 5 zile. Asta e
forma pe care o descrie politica „scaled content abuse / doorway", și e exact
partea care a dispărut din SERP.

### 7.2 Coeziunea internă — 7× mai slabă la noi

| | EGH | CJO |
|---|---|---|
| Linkuri interne **primite**, mediană pagini distincte | **5** | **38** |
| Linkuri interne **emise**, mediană | **8** | **43** |
| Pagini orfane (0 linkuri interne) | **0** | 1 (`/politica-de-anulare`) |

CJO e un site mic în care **fiecare pagină linkează spre mai mult de jumătate
din site** și e linkată de mai mult de jumătate. Fiecare pagină de oraș are 7
ancore către formular. Rezultatul: un cluster dens, evident despre un singur
lucru.

La noi, pagina medie e linkată de 5 pagini. Cele 42 de județe și cele 13
cadastrale sunt sateliți slab legați, atârnați de un site care în rest vorbește
despre pensii și salarii. Din perspectiva unui clasificator la nivel de site,
diferența nu e „calitatea textului", ci **cât de mult arată clusterul ca o
anexă adăugată dintr-o dată, versus ca site-ul însuși**.

### 7.3 Doorway pe variante de interogare — există pe AMBELE

Ca să fim onești: și CJO are familii de pagini pe variante ale aceleiași
intenții (`cazier-judiciar-pentru-angajare`, `-pentru-viza`, `-urgent`,
`-diaspora`, `-gratuit`, `taxa-`, `valabilitate-`, `acte-necesare-`,
`eliberare-`, `cerere-model`). Deci varianta-de-interogare, în sine, nu e
discriminatorul.

Diferența e **ce sunt** paginile: la CJO fiecare variantă **e** tranzacția
(formularul e în pagină sau la 7 ancore distanță) și e din același subiect. La
noi, variantele sunt articole separate, în verticale diferite, care trimit spre
o pagină de serviciu — de ex. **9 articole despre certificat constatator**
(`-de-baza`, `-cu-istoric`, `-pfa`, `-insolventa`, `-pentru-banca`,
`-pentru-notar`, `-pentru-licitatie`, `-pentru-fonduri-europene`,
`cele-4-tipuri-de-…`) care pâlnie spre `/servicii/certificat-constatator-online`.

### 7.4 Igienă pe care CJO o face și noi nu

- **CJO ține 4 pagini indexabile în afara sitemap-ului** (variantele fiscale) și
  a consolidat una prin 301 (`totul-despre-cazier-fiscal-online` →
  `/cazier-fiscal-online`, cu comentariu explicit în `sitemap.ts`). Adică
  sitemap-ul CJO e o listă *curatoriată*, nu un dump al rutelor.
- **CJO pune `noindex, nofollow` pe paginile PPC.** Noi n-avem pagini PPC, dar
  n-avem nici selecție: 191 din 191 URL-uri sunt `index, follow`.
- **Schema:** CJO adaugă `LocalBusiness` pe 40 de pagini de oraș și `HowTo` pe 6;
  noi punem `City` + `Service`. Diferență minoră, dar în favoarea lor pe
  paginile de locație.
- **Ambele** folosesc `AggregateRating`+`Review` auto-declarate (self-serving
  review markup, contrar policy-ului de date structurate Google). CJO cu nume
  inventate în markup („Maria Popescu"). **Nu e discriminatorul**, dar e risc
  de rich-result pe ambele.

---

## 8. Controlul intern care taie 3 ipoteze dintr-o lovitură

Pe 21–22.06, în aceleași două zile, eghiseul a publicat:

- **38 de calculatoare** (`/calculator/*`), și
- **43 de pagini de județ + 11 pagini de oraș + 10 ghiduri de serviciu**.

Dintre acestea, după 20.08, Google a continuat să servească **exact
calculatoarele** (calcul vârstă pensionare, impozit auto…) și a tăiat tot
clusterul de servicii/locație.

Calculatoarele au:
- **cel mai prost scor de tipare** dintre toate clasele noastre (11,3/1k
  mediană, vârf 27,5) — mai prost decât articolele (9,5);
- **cea mai mare densitate de liste `<strong>Termen:</strong>`** (mediană 5 pe
  pagină, vs 0 la articole și servicii) — exact tiparul semnalat în auditul din
  24.08;
- **cea mai off-topic** poziție față de business (pensii, salarii, credite,
  TVA — nu vindem nimic acolo);
- **aceeași cadență de publicare în lot** ca paginile lovite.

Și au supraviețuit.

**Deci, în interiorul aceluiași site, în același lot, cu același autor:**
stilul de scriere, densitatea tiparelor AI, cadența de publicare și lățimea
tematică **nu** separă ce a murit de ce a trăit. Ce separă e:
**calculatoarele sunt unice unele față de altele și utile prin ele însele;
paginile de serviciu/locație sunt 63 de pagini din 3 template-uri, subțiri,
comerciale și slab legate între ele.**

---

## 9. Clasamentul diferențelor, după cât de plauzibil explică demotarea

### Rangul 1 — explică cel mai bine (acționează aici)

| # | Diferență | Dovada |
|---|---|---|
| **1** | **Cluster comercial generat din template, la scară.** 13 pagini cadastrale cvasi-identice + 42 județe (27 dintre ele template pur, 740 cuv.) + 48 orașe (40 scoase din index abia pe 28.07) = 63 de pagini din 3 template-uri, în 5 zile. | 83 de perechi non-locație ≥0,25 la noi vs **0** la CJO; bimodalitatea 15 vs 27 județe; §7.1, §2 |
| **2** | **Coeziune internă slabă a clusterului.** Pagina medie are 5 linkuri interne primite; la CJO, 38. Clusterul arată ca o anexă, nu ca site-ul. | §7.2 |
| **3** | **Subțirime pe paginile care trebuie să vândă.** 27 de județe la 740 de cuvinte + 10 articole sub 800; CJO: **zero** pagini sub 800 în afara celor legale. | §1.2, §2 |

### Rangul 2 — contribuie, dar nu explică singure

| # | Diferență | De ce doar rangul 2 |
|---|---|---|
| 4 | **Amplitudinea lotului de publicare** (165 URL-uri în 6 zile, 94 într-o zi) | CJO a publicat 53 într-o zi, inclusiv 39 pagini de oraș template, și n-a pățit nimic. Diferență de amplitudine, nu de natură. |
| 5 | **Lățimea tematică** (8 verticale, 39 de pagini fără produs, vs 89% mono-verticală la CJO) | Partea cea mai off-topic (calculatoarele) e exact partea care a supraviețuit. Diluează autoritatea, dar nu e trăgaciul. |
| 6 | **Doorway pe variante de interogare** (9 articole „certificat constatator …") | CJO face același lucru și n-a fost lovit; diferă doar prin faptul că la ei varianta e tranzacția. |
| 7 | **Numele de brand lipit de portalul de stat** (eGhișeul.ro ≈ ghiseul.ro) | Disclaimer explicit pe toate paginile, pe ambele site-uri; n-a fost o problemă 2 ani. |

### Rangul 3 — aproape sigur NU e cauza. Nu mai cheltui efort aici.

| # | Ipoteză eliminată | Dovada care o elimină |
|---|---|---|
| **A** | **Backlinkurile plătite** | Google a declarat explicit că update-ul nu vizează link spam / site reputation abuse. (Deja retrasă în 24.08 — rămâne retrasă.) |
| **B** | **Scriitura „AI" / tiparele formulaice** | Măsurat identic, la aceeași dată: CJO **13,8/1k** vs eghiseul **10,4/1k** pe sursă la 19.08; live: articole 15,5 vs 9,5. Fără em-dash și intervale, ambele ~0,9/1k. Cifra „CJO 5–8/1k" din auditul vechi nu se reproduce. §6 |
| **C** | **Paginile de locație ca formulă** | CJO e **mai** duplicat pe toate cele 3 metrici (Jaccard tokeni 0,909; shingles 0,723; boilerplate 86%) și e #1. §3 |
| **D** | **Semnalele de încredere / E-E-A-T de pagină** | Identice sau în favoarea noastră: aceeași firmă, aceeași adresă pe fiecare pagină, ANPC+SOL pe 100% din pagini pe ambele, divulgarea avocatului pe 191/191 la noi vs 2/71 la ei, niciunul n-are „Despre noi" sau autor. §4 |
| **E** | **SEO tehnic** | 191/191 URL-uri 200, canonical self-referențial 100%, un singur H1 peste tot, meta description peste tot, **zero pagini orfane** (CJO are una). §1.1, §7.2 |
| **F** | **Em-dash-urile** | Sunt 78% din scorul brut și le avem doar cu ~20% mai dese per cuvânt decât CJO (9,64 vs 7,91/1k). Curățarea lor n-a fost și nu va fi levierul. §6.2 |
| **G** | **Calculatoarele / conținutul gratuit off-topic** | E singurul lucru care a supraviețuit update-ului. Nu-l atinge. §8 |

---

## 10. Ce înseamnă asta pentru planul de recuperare

Ordinea de lucru care rezultă din date (detalii de execuție în
`04-recuperare-si-semnale-incredere.md` și `03-pagini-locatie-programmatic.md`):

1. **Cele 13 pagini de serviciu cadastral** — de consolidat sau de diferențiat
   real. Sunt cea mai clară semnătură de template la scară de pe site și n-au
   corespondent la CJO. (Lista exactă: §7.1.)
2. **Cele 27 de județe rămase template pur** (740 cuvinte, ~20% unic) — ori
   primesc conținutul local pe care l-au primit cele 15 din 21.07, ori
   `noindex`, ori 301 către hub. Ținta de referință: 1.381 cuvinte, ca la CJO.
3. **Linking intern pe clusterul comercial** — de urcat de la mediana 5 spre
   ceva apropiat de densitatea CJO. E cea mai ieftină intervenție din listă și
   n-a fost făcută deloc.
4. **Cele 10 articole sub 800 de cuvinte** — extindere sau consolidare.
5. **Sitemap curatoriat** (ca la CJO), nu dump de rute: ce e subțire și nu se
   repară acum, iese din sitemap și din index.
6. **NU** mai investi în: rescriere anti-AI pe articole, pagini de încredere ca
   leac principal, dezavuări de linkuri, atins calculatoarele.

---

## Anexă — fișiere de date

| Fișier | Conținut |
|---|---|
| `data/06-pages.csv` | o linie per pagină, ambele site-uri: clasă, cuvinte, scor/1k pe grupe, liste bold, H2, robots |
| `data/06-report.json` | agregatele pe clasă, similaritatea pe seturile de locație, linking intern, tipurile de schema |
| `data/06-boilerplate.json` | per pagină de locație: % shingles unice, % boilerplate, cuvinte |
| `data/06-near-duplicates.json` | toate perechile ≥0,25, cu perechile non-locație listate integral |
| `data/06-topics.json` | verticalele tematice per site |
| `data/06-pre-update-source-scores.json` | scorurile de stil pe sursă la 19.08, ambele repo-uri |
| `data/06-git-egh2.txt`, `data/06-git-cjo2.txt` | data de adăugare a fiecărei rute publice |
| `data/06-pages-flat.json` | metadate complete per pagină (titlu, description, canonical, schema, H1/H2, linkuri interne) |
| `data/06-scripts/` | toate scripturile, ca să poată fi rulate din nou |

**Reproducere:** `node fetch.mjs <urls.txt> <dir>` → `node extract.mjs <dir> <out.json>`
→ `node analyze.mjs` → `node boiler.mjs` / `node nearvdup.mjs` / `node topics.mjs`
→ `node pre-update.mjs`.
