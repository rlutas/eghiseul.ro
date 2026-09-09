# 05 — Inventar & footprint site (măsurat, 2026-09-09)

Audit factual al amprentei publice a eghiseul.ro, pentru planul de recuperare
după **Google August 2026 Spam Update** (incidentul: [`../../2026-08-24-spam-update-prabusire-organica.md`](../../2026-08-24-spam-update-prabusire-organica.md)).

Totul de aici e **măsurat**, nu estimat. Metoda fiecărui număr e declarată în
secțiunea respectivă. Datele brute re-verificabile: [`data/`](data/).

---

## 0. Metodă (o dată, pentru tot documentul)

**Sursa de adevăr pentru conținut = HTML-ul prerandat de Next.js.**
Build-ul de producție din `.next/server/app/**/*.html` (BUILD_ID din
**2026-09-07 22:58**, 268 fișiere HTML). Nu am citit JSX și n-am estimat: am
numărat cuvintele din pagina randată, exact ce vede Googlebot.

Pipeline (`scratchpad/extract.js`, reproductibil):

1. elimin `<script>`, `<style>`, `<noscript>`, `<svg>`, `<template>`, comentarii
   (asta scoate și payload-ul RSC `self.__next_f`, care altfel dubla textul);
2. izolez fragmentul dintre primul `<main` și ultimul `</main>` →
   **`words` = corpul paginii, FĂRĂ header și footer**;
3. înlocuiesc tagurile cu spațiu, decodez entitățile, colapsez spațiile;
4. număr token-urile care conțin cel puțin o literă sau cifră.

`bodyWords` (în CSV) e același calcul pe tot `<body>`; diferența constantă
`bodyWords − words ≈ 345` = chrome-ul comun (header + footer + disclaimer).
Peste tot în raport folosesc **`words` (doar `<main>`)**, ca headerul/footerul
identic pe 231 de pagini să nu umfle nici lungimea, nici similaritatea.

**Validare împotriva producției (3/3 exact):**

| URL | build 07.09 | live `curl` 09.09 |
|---|---|---|
| `/servicii/extras-de-carte-funciara/arad/` | 747 | **747** |
| `/servicii/cazier-judiciar-online/cluj-napoca/` | 1359 | **1359** |
| `/totul-despre-cartea-funciara-colectiva/` | 988 | **988** |

**Universul de pagini.** Reuniunea dintre (a) `sitemap.xml` live
(`https://eghiseul.ro/sitemap.xml`, descărcat 09.09 — **191 URL-uri**) și (b)
rutele publice prerandate. Am exclus `/admin`, `/api`, `/auth`, `/account`,
`/comanda`, `/colaborator`, `/completare`, `/reincarca-poza`, `_not-found`.

Am mai exclus **12 rute `/servicii/<slug-DB>` care nu sunt pagini publice**: sunt
prerandate, dar `next.config.ts` le dă 308 spre pagina canonică (verificat live:
`/servicii/rovinieta/` → 308 → `/servicii/rovinieta-online/`). Sunt listate
separat în §1.4.

> **⚠️ Total real: 231 de pagini publice** (nu 191 — sitemap-ul omite cele 40 de
> pagini de oraș puse pe `noindex`, care sunt totuși live și crawlabile).

Clasificarea se bazează pe listele din `src/lib/seo/constants.ts`
(`HARDCODED_SERVICE_SLUGS`, `HARDCODED_ARTICLE_SLUGS`,
`HARDCODED_CALCULATOR_SLUGS`, `HARDCODED_TOOL_SLUGS`) și pe datele de locație
din `src/lib/seo/locations/cities.ts` (48 orașe) și `.../ocpi.ts` (42 județe).

---

## 1. Rezumat — tabelul de deasupra

### 1.1 Pagini pe clasă

| Clasă | N | în sitemap | mediană cuvinte | min | max | <800 cuv. | <400 cuv. |
|---|---:|---:|---:|---:|---:|---:|---:|
| homepage | 1 | 1 | 2.080 | 2.080 | 2.080 | 0 | 0 |
| pagină de serviciu | 31 | 31 | **2.316** | 759 | 4.650 | 1 | 0 |
| locație: cazier / oraș | 48 | **8** | 1.350 | 1.274 | 1.382 | 0 | 0 |
| locație: extras CF / județ | 42 | 42 | **746** | 734 | 961 | **27** | 0 |
| articol / ghid | 57 | 57 | 1.269 | 560 | 5.827 | 10 | 0 |
| calculator / tool | 42 | 42 | 1.337 | 487 | 1.820 | 2 | 0 |
| legal / trust | 6 | 6 | 547 | 207 | 1.668 | 4 | 3 |
| hub / index | 4 | 4 | 665 | 147 | 1.886 | 2 | 1 |
| **TOTAL** | **231** | **191** | **1.336** | 147 | 5.827 | **46** | **4** |

Volum total de text util: **314.228 cuvinte** în `<main>` pe 231 de pagini.

### 1.2 Similaritate mediană per set-template (Jaccard, 5-shingle, doar `<main>`)

| Set | N | Jaccard median | brut | **mascat pe locație** | propoziții identice pe TOATE | cuvinte identice | % din pagina mediană |
|---|---:|---:|---:|---:|---:|---:|---:|
| locație cazier / oraș | 48 | 0,66 | 0,61–0,73 | **0,72** | 33 | 522 | **37,6%** |
| locație extras CF / județ | 42 | 0,56 | 0,49–0,71 | **0,71** | 25 | 329 | **43,0%** |
| servicii cadastrale topograf | 14 | 0,30 | 0,24–0,39 | — | 32 | 597 | 25,6% |
| pagini servicii stare civilă | 3 | 0,25 | 0,23–0,32 | — | 31 | 547 | 20,0% |
| articole constatator (tip) | 4 | 0,036 | 0,027–0,060 | — | 2 | 32 | 3,6% |
| articole constatator (use-case) | 4 | 0,027 | 0,022–0,034 | — | 2 | 32 | 2,2% |
| articole certificat naștere | 6 | 0,017 | 0,011–0,086 | — | 2 | 32 | 2,4% |
| articole celibat | 3 | 0,022 | 0,017–0,030 | — | 2 | 32 | 2,0% |
| calculatoare | 42 | 0,019 | 0,003–0,052 | — | **0** | 0 | 0% |

### 1.3 Ce sare imediat în ochi

| Semnal | Măsurătoare |
|---|---|
| Pagini publicate în „loturi" (zile cu ≥3 pagini noi) | **221 din 231 (95,7%)**, pe doar **13 zile** |
| Cea mai mare zi | **2026-06-22 → 92 de pagini publice noi** |
| Fereastra 14–25 iunie 2026 | **196 de pagini** (84,8% din site) în 12 zile |
| Perechi de pagini cu Jaccard ≥ 0,20 | **2.204** din 26.565 posibile (8,3%) |
| `FAQPage` în JSON-LD | **221 din 231 de pagini (95,7%)** |
| Întrebări FAQ randate total / unice | 1.550 / 1.118 → **432 de duplicate** |
| Cea mai repetată întrebare | „Cât durează eliberarea cazierului judiciar?" — pe **48 de pagini** |
| `aggregateRating` 4,9 / 457 pe `Product` | pe **toate cele 31 de pagini de serviciu**, identic |
| Nod `Person` „Departamentul Juridic eGhișeul.ro" ca `reviewedBy` | **30 de pagini** — fără pagină de autor, fără bio |
| Byline editorial VIZIBIL („Conținut revizuit de…") | **1 pagină din 243 (0,4%)** |
| Pagină „Despre noi" / echipă | **ABSENTĂ** |
| Bylines / autori vizibili pe articole | **ABSENTE** (author în schema = Organization) |
| Dată „Publicat / Actualizat" vizibilă în pagină | **53 din 243 (21,8%)** — doar articolele |
| `datePublished` „2024-01-01" (placeholder rotund) | **12 articole** |
| Disclaimer „serviciu privat, nu suntem instituție de stat" | **243/243 pagini randate (100%)** — în footer, **DAR 0% pe wizard/checkout/success** (§8.1) |
| ANPC-SAL + SOL/ODR | **243/243 (100%)** — idem, aceeași excepție |
| Banner `PrivateServiceNotice` pe paginile de serviciu | **4 din 31 (13%)** |
| `reviewCount` diferit în schema pe același site | **3 valori: 457, 89, 64** |
| Titluri peste 60 de caractere | **206 din 231 (89%)** |

---

## 2. Inventarul complet pe rute (§1 din brief)

### 2.1 Homepage — 1

`/` — 2.080 de cuvinte. Schema: `Organization + WebSite + WebPage + ItemList + FAQPage`.

### 2.2 Pagini de serviciu — 31

29 din `HARDCODED_SERVICE_SLUGS` + 2 sub-rute
(`/servicii/cazier-judiciar-online/persoana-fizica|persoana-juridica`).
Se împart clar în trei sub-familii:

| Sub-familie | N | mediană cuvinte | observație |
|---|---:|---:|---|
| servicii „core" (cazier, stare civilă, constatator, CF, integritate, multilingv, urbanism, identificare, plan cadastral) | 16 | 2.633 | scrise separat, cele mai lungi |
| servicii cadastrale topograf (`copie-*`, `certificat-sarcini`, `plan-amplasament-delimitare`, `extras-cf-colectiv`, `actualizare-adresa-cf`, `identificare-imobile-proprietar`, `certificat-detineri-imobile`) | 14 | **2.333** | **un singur template** — vezi §4.3 |
| rovinieta-online | 1 | **759** | singura pagină de serviciu sub 800 |

### 2.3 Pagini de locație — 90

| Set | N | în sitemap | `noindex` | mediană cuvinte |
|---|---:|---:|---:|---:|
| `/servicii/cazier-judiciar-online/<oraș>/` | 48 | **8** | **40** | 1.350 |
| `/servicii/extras-de-carte-funciara/<județ>/` | 42 | 42 | 0 | 746 |

Cele 40 de pagini de oraș pe `noindex, follow` sunt o decizie deja luată
(`INDEXABLE_CITY_SLUGS` în `src/lib/seo/locations/index.ts`, 28.07.2026, după ce
GSC a confirmat că 40/48 nu erau indexate). **Rămân live și crawlabile** — deci
rămân în amprenta pe care o vede SpamBrain, chiar dacă nu sunt în sitemap.

### 2.4 Articole / ghiduri — 57

Toate cele 57 din `HARDCODED_ARTICLE_SLUGS`, la rădăcină (convenție WP păstrată,
fără prefix `/articole/`). Mediană 1.269 de cuvinte.

### 2.5 Calculatoare / tools — 42

40 din `HARDCODED_CALCULATOR_SLUGS` + `/tools/verificare-rovinieta-online` +
`/curs-valutar`. Mediană 1.337.
**Sunt singurul cluster care a supraviețuit update-ului** (vezi incidentul) — și,
necoincidență, singurul set cu **0 propoziții identice** între pagini.

### 2.6 Legal / trust — 6

`/contact` (207), `/gdpr` (213), `/politica-cookies` (374),
`/politica-de-anulare` (720), `/politica-de-confidentialitate` (1.256),
`/termeni-si-conditii` (1.668).

### 2.7 Hub / index — 4

`/servicii` (1.886), `/blog` (1.107), `/calculator` (521), `/tools` (147).
`/blog` și `/calculator` nu emit deloc JSON-LD.

### 2.8 Rute prerandate care NU sunt pagini publice (308 redirect) — 12

`/servicii/{rovinieta, certificat-constatator, extras-carte-funciara,
certificat-nastere, certificat-casatorie, certificat-celibat, cazier-judiciar,
cazier-judiciar-persoana-fizica, cazier-judiciar-persoana-juridica, cazier-auto,
cazier-fiscal, certificat-integritate}`.

234–415 cuvinte fiecare, servite din `/servicii/[slug]` cu date din DB. **Nu sunt
în sitemap și dau 308** (verificat live) — deci nu se pun la socoteală. Merită
totuși știut că build-ul le materializează: dacă vreodată cade un redirect din
`next.config.ts`, apar instant 12 duplicate subțiri ale paginilor principale.
(S-a mai întâmplat o dată: nota din `constants.ts` despre „Rovinieta Online
Online", audit 28.07.2026.)

---

## 3. Adâncimea conținutului (§2 din brief)

Metoda e cea din §0. Distribuția pe tot site-ul:

| Prag | Pagini | % |
|---|---:|---:|
| < 400 cuvinte | 4 | 1,7% |
| < 800 cuvinte | **46** | **19,9%** |
| 800–1.500 | 116 | 50,2% |
| > 1.500 | 69 | 29,9% |

### 3.1 Sub 400 de cuvinte (4)

| Cuvinte | Rută | Clasă |
|---:|---|---|
| 147 | `/tools` | hub/index |
| 207 | `/contact` | legal/trust |
| 213 | `/gdpr` | legal/trust |
| 374 | `/politica-cookies` | legal/trust |

Niciuna nu e o pagină de conținut. `/contact` la 207 de cuvinte e totuși un
semnal slab de încredere pentru un business care vinde servicii cu plată
anticipată (vezi §6).

### 3.2 Sub 800 de cuvinte (46)

**27 din 46 sunt pagini de județ pentru extras CF** — practic tot setul
(mediana setului e 746). Restul:

| Cuvinte | Rută | Clasă |
|---:|---|---|
| 487 | `/curs-valutar` | calculator/tool |
| 521 | `/calculator` | hub/index |
| 560 | `/model-certificat-de-casatorie` | articol |
| 626 | `/ce-este-planul-cadastral` | articol |
| 645 | `/rolul-si-atributiile-onrc-romania` | articol ⚠️ *și* scor AI 19,5/1k |
| 685 | `/ghid-complet-certificat-de-integritate-comportamentala` | articol |
| 704 | `/ce-este-un-releveu` | articol |
| 711 | `/transcriere-certificat-de-casatorie` | articol ⚠️ scor AI 15,2/1k |
| 714 | `/acte-necesare-certificat-de-nastere` | articol ⚠️ scor AI 15,7/1k |
| 717 | `/suspendare-activitate-firma-ghid` | articol |
| 720 | `/politica-de-anulare` | legal |
| 759 | `/servicii/rovinieta-online` | **serviciu** |
| 766 | `/calculator/valabilitate-documente` | calculator |
| 780 | `/informatii-cazier-auto-online` | articol |
| 781 | `/valabilitate-extras-de-carte-funciara` | articol |
| 734–764 | 27 × `/servicii/extras-de-carte-funciara/<județ>` | locație |

Lista completă cu cifre: [`data/05-inventar-pagini.csv`](data/05-inventar-pagini.csv).

> **Notă de calibrare:** raportul din 24.08 zicea „12 articole sub 800 de
> cuvinte". Măsurat acum pe HTML randat, sunt **10** — trei articole
> (`/totul-despre-cartea-funciara-colectiva` 988, `/taxa-cazier-judiciar` 1.052,
> `/cele-4-tipuri-de-certificat-constatator-online` 1.113) au fost extinse între
> timp, iar `/model-certificat-de-casatorie` (560) a rămas cel mai scurt. Nu e o
> contradicție, e efectul primului lot de rescrieri din 24.08.

### 3.3 Ce NU e o problemă de lungime

Lungimea e a doua problemă, nu prima. Mediana site-ului (1.336) e onorabilă;
paginile de serviciu au 2.316 mediană. **Problema e originalitatea, nu volumul**
— vezi secțiunea următoare, unde 42 de pagini de județ au ~746 de cuvinte din
care 329 sunt identice cuvânt cu cuvânt pe toate 42.

---

## 4. Duplicare de template / footprint (§3 din brief)

### 4.1 Metoda de similaritate

Pe textul `<main>` normalizat (lowercase, ghilimele scoase, spații colapsate):

- **shingles de 5 cuvinte**, set per pagină;
- **Jaccard** `|A∩B| / |A∪B|` pentru fiecare pereche din set;
- raportez mediana, min, max, p25, p75 (`data/similaritate-seturi.json`).

În plus, o a doua rulare **cu mascarea locației**: înlocuiesc cu `@LOC` orice
token care apare în datele de locație ale paginii respective (numele orașului /
județului, reședința, biroul, localitățile, adresa). Asta răspunde la întrebarea
reală: *dacă scoți numele proprii, ce mai rămâne diferit?*

**Propoziții „identice pe toate":** sparg textul în propoziții (≥5 cuvinte),
normalizez, și păstrez intersecția tuturor paginilor din set.

### 4.2 Set A — cazier judiciar pe oraș (48 de pagini)

| Metrică | Valoare |
|---|---|
| Jaccard median (brut) | **0,664** (0,610–0,731) |
| Jaccard median (mascat pe locație) | **0,722** (0,390–0,894) |
| Propoziții identice pe toate cele 48 | **33** |
| Cuvinte în acel bloc identic | **522** din 1.387 mediană = **37,6%** |
| Cuvinte „unice" per pagină (înainte de mascare) | mediană 814 (58,7%) |

**Ce e identic pe toate cele 48** (extras verbatim din randare, primele 12 din 33):

> „Valabilitate: de regulă 6 luni de la data emiterii."
> „Unele instituții pot cere însă un certificat mai recent (uneori emis în ultimele 30 de zile), așa că merită să verifici cerința exactă a celui care ți-l solicită."
> „Cazierul judiciar nu trebuie confundat cu Certificatul de Integritate Comportamentală (necesar pentru lucrul cu minorii) — sunt documente diferite, cu scopuri diferite."
> „Angajare — tot mai mulți angajatori cer cazierul la angajare, mai ales în pază, transport, educație, sănătate sau în sistemul financiar-bancar."
> „Emigrare și viză — necesar pentru viză, permis de ședere sau dosar de muncă în străinătate…"
> „Studii și Erasmus — universitățile și programele de mobilitate îl pot cere la înscriere…"
> „Licitații publice — administratorii de firme îl prezintă în dosarele de participare…"
> „Adopție și tutelă — obligatoriu în dosarele de adopție, plasament familial sau tutelă."
> „Funcție publică — cerut la concursurile pentru posturi în administrația publică…"
> „Pentru situații urgente există opțiunea de procesare prioritară."
> „Costul acoperă întocmirea și depunerea cererii prin împuternicire, taxele și livrarea documentului."
> „Reabilitare și ștergere cazier judiciar. Dacă figurezi cu o mențiune în cazier, aceasta poate fi ștearsă prin reabilitare. Există două forme: reabilitarea de drept… și reabilitarea judecătorească…"

Plus **4 întrebări FAQ identice** pe toate 48: „Cât durează eliberarea cazierului
judiciar?", „Cât este valabil cazierul judiciar?", „Documentul este oficial și
acceptat?", „Plata și datele mele sunt în siguranță?".

**Ce e genuin per-oraș** — 2–3 fraze de `localContext` + cardul IPJ + 2 întrebări
locale. Datele instituționale sunt reale (adresă IPJ pe 41/48 de orașe, telefon
pe 31/48, sursă `politiaromana.ro`). Problema e că paragraful de context **trece
testul de swap doar formal**:

> Cluj-Napoca: „Cluj-Napoca este al doilea oraș al țării și principalul centru
> universitar și IT din Transilvania. Cazierul judiciar este cerut frecvent aici
> pentru angajări în companiile de tehnologie, pentru concursuri în mediul
> universitar și pentru dosare de adopție sau asistență socială."

> Lugoj: „Lugoj este un important oraș secundar al județului Timiș, pe valea
> Timișului, cu o zonă industrială activă. Locuitorii din Lugoj au nevoie de
> cazier judiciar pentru angajări, pentru lucrul în străinătate și pentru dosare
> în mediul bugetar."

A doua e schema generică „<oraș> este un important oraș secundar al județului
<județ>… locuitorii au nevoie de cazier pentru angajări / străinătate / bugetar",
adevărată pentru orice localitate din România. **Asta e definiția unei doorway
page:** unicitate lexicală fără unicitate informațională. De aceea Jaccard-ul
*crește* de la 0,66 la 0,72 după mascare: singurul lucru care diferențiază
paginile sunt numele proprii.

Cele mai puțin unice: `lugoj` (690 cuvinte unice), `onesti` (693), `barlad`
(694), `medias` (694), `turda` (697).
Cele mai unice: `brasov` (852), `iasi` (845), `drobeta-turnu-severin` (843).
Amplitudinea totală: **690–852 de cuvinte unice din ~1.380** — adică toate cele
48 de pagini sunt în aceeași bandă de 160 de cuvinte. Nu există nicio pagină de
oraș substanțial mai bogată decât celelalte.

### 4.3 Set B — extras carte funciară pe județ (42 de pagini)

| Metrică | Valoare |
|---|---|
| Jaccard median (brut) | **0,556** (0,491–0,713) |
| Jaccard median (mascat pe locație) | **0,709** (0,388–0,960) |
| Propoziții identice pe toate cele 42 | **25** |
| Cuvinte în acel bloc identic | **329** din 766 mediană = **43,0%** |
| Cuvinte „unice" per pagină (înainte de mascare) | mediană 423 (55,2%) |

**Identic pe toate cele 42** (extras):

> „100% online, fără cont ANCPI, livrare pe email în câteva minute."
> „89 RON, taxe incluse."
> „Extras de informare — poate fi cerut de oricine, online; arată situația juridică la zi."
> „Extras de autentificare — se obține prin notar pentru încheierea unui act (vânzare); blochează temporar cartea funciară și are valabilitate scurtă."
> „Credit ipotecar — banca solicită extrasul de carte funciară pentru a constitui ipoteca pe imobil."
> „Moștenire / succesiune — necesar la dezbaterea succesorală la notar…"
> „Verificare sarcini — afli dacă imobilul are ipoteci, sechestre, servituți sau alte sarcini înscrise."
> „Interogăm sistemul oficial ANCPI (e-Terra) în numele tău."
> „Datele de identificare ale imobilului (suprafață, adresă, număr cadastral), proprietarii înscriși și cotele lor, precum și sarcinile — ipoteci, sechestre, servituți, interdicții."

Plus **4 întrebări FAQ identice** pe toate 42.

**Ce e genuin per-județ** — și aici e diferența față de setul A: **datele OCPI
sunt fapte verificabile, nu proză**:

> Arad: „OCPI Arad — Splaiul General Gheorghe Magheru nr. 13, Arad, 310329 ·
> 0257 256744 · ar@ancpi.ro · Depunere: Luni–Joi 8:30–14:00, Vineri 8:30–13:00 ·
> Eliberare: Luni–Joi 11:00–16:00, Vineri 9:30–13:30"

> Brașov: „OCPI Brașov — Str. … nr. 46A, Brașov · 0368 139959 · bv@ancpi.ro ·
> Depunere: Luni–Joi 8:30–14:00, Vineri 8:30–13:00 · Eliberare: Luni–Joi
> 11:00–16:00, **Vineri 9:00–13:30**"

Dar acoperirea e parțială: din 42 de județe, doar **15 au `highlight`** (paragraf
de piață locală), **15 au `localFaq`**, **15 au `localities`**, iar **16 au
`program: null`** (orar neverificat, deci neafișat). Cu alte cuvinte, **27 din 42
de pagini de județ = template + adresă + telefon + email, și atât** — exact cele
27 care pică sub 800 de cuvinte.

Cel mai puțin unic: `teleorman` (411 cuvinte unice), `bacau`/`bistrita-nasaud`/
`gorj`/`tulcea` (412). Cel mai unic: `brasov` (640), `sibiu` (634), `mures` (624).

**Ironia din date:** paginile de județ CF au fost promovate în `locations/index.ts`
drept contra-exemplul bun („sunt indexate 94%, fiindcă un județ are date proprii
reale"). Asta era adevărat *față de paginile de oraș*, dar în valoare absolută
sunt setul cu **cea mai mare proporție de text identic din pagină (43%)** și
**27 de pagini sub 800 de cuvinte**.

### 4.4 Set C — cele 14 pagini de servicii cadastrale topograf

Jaccard median **0,296** — mult mai bine, dar cu un asterisc: din cele 32 de
propoziții identice pe toate 14, **majoritatea sunt carusel de recenzii Google**
(nume reale, texte reale de clienți, ~500 de cuvinte), nu conținut editorial.
Blocul de recenzii se repetă identic pe fiecare pagină de serviciu.

Perechile cele mai apropiate din set: `copie-plan-incadrare` ↔
`plan-amplasament-delimitare` (0,385), `copie-plan-cadastral` ↔
`copie-plan-incadrare` (0,374), `copie-plan-cadastral` ↔ `extras-plan-cadastral`
(0,367).

### 4.5 Cea mai duplicată pereche din tot site-ul

| Jaccard | A | B |
|---:|---|---|
| **0,751** | `/servicii/extras-multilingv-certificat-casatorie` | `/servicii/extras-multilingv-certificat-nastere` |
| 0,441 | `/servicii/cazier-judiciar-online/persoana-fizica` | `/servicii/cazier-judiciar-online/persoana-juridica` |
| 0,385 | `/servicii/copie-plan-incadrare` | `/servicii/plan-amplasament-delimitare` |
| 0,316 | `/servicii/eliberare-certificat-de-casatorie` | `/servicii/eliberare-certificat-de-nastere` |

Cele două pagini de extras multilingv (2.450 și 2.458 de cuvinte) sunt practic
**același text cu „naștere" schimbat în „căsătorie"** — 75% shingles comune, la
2.400 de cuvinte fiecare. E cel mai clar candidat de consolidare din site.

Lista completă (2.204 perechi ≥0,20):
[`data/05-perechi-similare.csv`](data/05-perechi-similare.csv).

### 4.6 Amprenta FAQ (duplicare care se vede și în structured data)

**221 din 231 de pagini** emit `FAQPage`. Total 1.550 de întrebări randate, doar
**1.118 unice** → 432 de apariții duplicate. Top:

| Pagini | Întrebare |
|---:|---|
| 48 | „Cât durează eliberarea cazierului judiciar?" |
| 48 | „Cât este valabil cazierul judiciar?" |
| 48 | „Documentul este oficial și acceptat?" |
| 48 | „Plata și datele mele sunt în siguranță?" |
| 42 | „Cât durează obținerea extrasului de carte funciară online?" |
| 42 | „Ce conține extrasul de carte funciară?" |
| 42 | „Care e diferența dintre extrasul de informare și cel de autentificare?" |
| 42 | „Documentul este oficial?" |
| 20 | „Cât durează eliberarea?" |
| 14 | „Am nevoie de cont ANCPI?" |

Datele complete: [`data/05-faq-duplicate.csv`](data/05-faq-duplicate.csv).

---

## 5. Cadența de publicare (§4 din brief)

### 5.1 Metoda (și limita ei)

Două date, măsurate separat, fiindcă spun lucruri diferite:

**(a) `firstCommit`** — `git log --diff-filter=A --format=%aI -1 -- <fișier>`,
data primului commit care a adăugat fișierul în ACEST repo. Pentru cele 90 de
pagini de locație (rute dinamice, fără fișier propriu) am folosit
`git log -S"slug: '<slug>'" --reverse` pe `cities.ts` / `ocpi.ts` — data la care a
apărut intrarea de date care generează pagina.

**(b) `datePublishedDeclared`** — constanta `DATE_PUBLISHED` din fiecare
`page.tsx`, adică **exact ce îi spunem lui Google în `Article`/`WebPage`
schema**. Există pe 87 din 231 de pagini.

> **⚠️ Limită de interpretare, declarată explicit:** repo-ul începe pe
> **2025-12-16**, iar cutover-ul WP→Next.js a fost pe ~08.07.2026. O parte din
> articole existau pe WordPress ÎNAINTE de a intra în acest repo, deci
> `firstCommit` = „data la care pagina a intrat în codul actual", nu neapărat
> „prima publicare pe web". Pentru 12 articole `DATE_PUBLISHED = '2024-01-01'`
> (dată-placeholder rotundă) și pentru 2 `'2025-01-01'` — acelea sunt migrări WP.
> **Restul de 73 de pagini cu `DATE_PUBLISHED` declarat au date din 2026 care
> coincid cu commit-urile**, deci pentru ele cele două măsurători se confirmă
> reciproc.
>
> Concluzia despre loturi NU depinde de această ambiguitate: și pe datele
> DECLARATE (ce vede Google) ies aceleași vârfuri — 18 pagini pe 25.06, 12 pe
> 22.06, 12 pe „2024-01-01".

### 5.2 Toate zilele de publicare (`firstCommit`)

| Data | Pagini noi | Lot? | Compoziție |
|---|---:|:--:|---|
| 2025-12-16 | 1 | | homepage |
| 2026-01-05 | 3 | **⚠️** | 3 pagini de serviciu |
| 2026-04-17 | 1 | | hub |
| 2026-06-13 | 1 | | 1 serviciu |
| 2026-06-14 | 8 | **⚠️** | 7 servicii, 1 calculator |
| **2026-06-16** | **22** | **🔴** | 15 articole, 4 legale, 2 servicii, 1 hub |
| 2026-06-19 | 4 | **⚠️** | 4 articole |
| 2026-06-20 | 6 | **⚠️** | 5 pagini de oraș, 1 articol |
| **2026-06-21** | **48** | **🔴** | **32 pagini de oraș**, 15 calculatoare, 1 hub |
| **2026-06-22** | **92** | **🔴🔴** | **42 pagini de județ CF**, 22 calculatoare, 12 articole, 11 pagini de oraș, 3 servicii, 1 hub, 1 legal |
| **2026-06-25** | **16** | **🔴** | 14 servicii (cadastrale topograf), 2 articole |
| 2026-07-13 | 2 | | 2 articole |
| 2026-07-14 | 6 | **⚠️** | 4 calculatoare, 2 articole |
| 2026-07-15 | 3 | **⚠️** | 2 articole, 1 legal |
| 2026-07-17 | 4 | **⚠️** | 4 articole (cluster constatator use-case) |
| 2026-07-20 | 1 | | 1 articol |
| 2026-07-21 | 1 | | 1 serviciu (urbanism) |
| 2026-07-26 | 2 | | 2 articole |
| 2026-07-29 | 1 | | 1 articol |
| 2026-07-31 | 4 | **⚠️** | 4 articole |
| 2026-08-07 | 5 | **⚠️** | 5 articole |

### 5.3 Verdictul pe cadență

- **13 zile din 21** au avut ≥3 pagini publice noi.
- **221 din 231 de pagini (95,7%)** au apărut în acele 13 zile.
- **196 de pagini (84,8% din tot site-ul)** au apărut în fereastra
  **14–25 iunie 2026**, adică în **12 zile calendaristice**.
- Ziua-record: **22 iunie 2026 = 92 de pagini publice noi**, adică **40% din
  întregul site într-o singură zi**. Din ele, 42 sunt paginile de județ CF și 11
  pagini de oraș — deci **53 de pagini de locație generate din template într-o
  singură zi**, plus 22 de calculatoare și 12 articole.
- Din 26 iunie încoace cadența devine normală (0–6 pagini/zi, mediana 2), iar
  ultima pagină publică nouă e din **07.08.2026** — de o lună nu s-a mai publicat
  nimic nou (doar rescrieri).

Asta e „overnight dump"-ul din brief, cuantificat. **Nu e o problemă de trecut:**
tot ce a fost publicat între 14 și 25 iunie e încă live și încă indexat, iar
tiparul rămâne vizibil pentru orice sistem care se uită la
`first-seen`-ul URL-urilor.

Tabelul complet cu rutele fiecărei zile:
[`data/05-cadenta-publicare.csv`](data/05-cadenta-publicare.csv).

### 5.4 Cadența pe datele DECLARATE (ce citește Google din schema)

| `datePublished` | Pagini | Compoziție |
|---|---:|---|
| **2024-01-01** | **12** | 12 articole — placeholder rotund, migrări WP |
| 2025-01-01 | 2 | 2 articole — idem |
| 2026-04-16 | 3 | 3 servicii |
| 2026-06-14 | 7 | 7 servicii |
| 2026-06-19 | 4 | 4 articole |
| 2026-06-22 | 12 | 12 articole |
| **2026-06-25** | **18** | 16 servicii + 2 articole |
| 2026-07-17 | 4 | 4 articole |
| 2026-07-31 | 4 | 4 articole |
| 2026-08-07 | 5 | 5 articole |

Cele 12 pagini cu `"datePublished":"2024-01-01"` sunt un semnal **fals și
detectabil**: 12 articole distincte care pretind că au fost publicate toate în
prima zi a lui 2024. E o dată-placeholder pusă la migrare, nu o dată reală, și e
publicată în JSON-LD pe toate paginile respective (inclusiv pe
`/totul-despre-cartea-funciara-colectiva/`, cel cu scorul AI cel mai mare).

**144 de pagini** (calculatoare, locații, legale, huburi) n-au deloc
`datePublished` — doar `dateModified`. Pentru calculatoare, `dateModified` e
constanta globală `DATE_MODIFIED = '2026-06-22'` din
`src/components/calculators/calculator-layout.tsx`: **toate cele 41 de
calculatoare declară aceeași dată de modificare**, la nivel de layout, nu per
pagină.

---

## 6. Semnale de încredere (§5 din brief)

Metoda: grep pe HTML-ul randat (fără `<script>`) al celor **243 de fișiere
publice** din build, ca să pot da **acoperire reală**, nu doar „există undeva".

> **⚠️ Detaliu de arhitectură care schimbă toate procentele de mai jos:**
> footerul **nu e în root layout**. `src/app/layout.tsx:83` randează doar
> `<Header />` + `{children}`; fiecare pagină își importă singură `<Footer />`
> (comentariu explicit în `src/app/comanda/status/page.tsx:825-826`). Toate cele
> 243 de pagini publice prerandate îl au — dar **trei ecrane dinamice NU**:
> `comanda/[service]` (wizardul), `comanda/checkout/[orderId]` și
> `comanda/success/[orderId]` conțin **zero** referințe la `Footer`
> (verificat: `grep -c Footer` = 0 pe toate trei; `comanda/status` = 4).
> Deci pe ecranele unde utilizatorul dă CNP, poze de buletin și datele
> cardului nu apare **niciun** disclaimer de neafiliere, **niciun** link ANPC/SOL
> și **nicio** identificare de firmă.

### 6.1 Ce EXISTĂ, pe 100% din paginile de conținut (footer)

**Identificare firmă** — 243/243 pagini:

> „© 2026 eGhișeul.ro. Toate drepturile rezervate.
> **eDigitalizare SRL · CUI RO49278701 · Reg. Com. J2023001097301 · Jud. Satu
> Mare, Com. Odoreu, Str. Salcâmilor nr. 2**"

**Disclaimer de intermediar** — 243/243 pagini (vezi și §8):

> „eGhișeul.ro este un serviciu privat de asistență la obținerea de documente.
> Nu suntem o instituție de stat și nu suntem afiliați cu vreun organ
> guvernamental. Documentele sunt emise exclusiv de autoritățile competente din
> România, iar serviciile noastre sunt opționale — documentele pot fi solicitate
> și direct la instituțiile emitente. Tarifele noastre acoperă exclusiv
> asistența, reprezentarea prin avocați colaboratori înscriși în Barou sau
> topografi autorizați ANCPI/OCPI și livrarea."

**ANPC-SAL + SOL/ODR** — 243/243 pagini, badge-uri în footer:

> `<a href="https://anpc.ro/ce-este-sal/" rel="nofollow noopener" aria-label="ANPC — Soluționarea Alternativă a …">`

plus link către `https://ec.europa.eu/consumers/odr` (citat integral și în
`/termeni-si-conditii`, `src/app/termeni-si-conditii/page.tsx:230-231`).
✅ Obligația legală din România e acoperită și e pe fiecare pagină.

**Contact real în footer:** `+40 757 708 181`, `contact@eghiseul.ro`, WhatsApp,
`L-V: 08:00 - 16:00`.

**Dovadă socială:** „4.9/5 pe Google" în footer + carusel cu recenzii Google
reale (nume, text, vechime: „Ștefania Cimena — acum 4 zile", „Ana-Maria Denisa
Zaharia — acum o săptămână"…) pe paginile de serviciu. Sursa unică de adevăr e
`SOCIAL_PROOF` din `src/lib/seo/constants.ts` (4,9 / 457), cu notă în cod:
„Ultima verificare: 28.07.2026 (Raul, din profil)", legat de profilul GBP prin
`sameAs: ['https://share.google/stngA2rQbVPY2l57p']`.

### 6.2 Pagina de contact (`/contact`, 207 cuvinte)

Conține **tot ce trebuie legal**, dar e scurtă:

> „Telefon +40 757 708 181 — Luni–Vineri, în programul de lucru. |
> Email contact@eghiseul.ro — Răspundem de regulă în aceeași zi lucrătoare. |
> WhatsApp +40 757 708 181 | Program de lucru: Luni – Vineri: 08:00 – 16:00;
> Sâmbătă, Duminică: închis. | **Date firmă: eDigitalizare SRL, CUI RO49278701,
> Reg. Com. J2023001097301, Str. Salcâmilor nr. 2, Com. Odoreu, Jud. Satu Mare**"

Adresa e **sediul social** (o comună din Satu Mare), nu un birou cu program de
public — corect declarat, dar **nu susține E-E-A-T** pentru un cumpărător care
plătește 89–278 RON în avans.

### 6.3 Ce LIPSEȘTE

| Semnal | Stare | Detaliu |
|---|---|---|
| Pagină **Despre noi / Despre** | **ABSENTĂ** | Nu există nicio rută `despre*`/`about*`/`echipa*`/`cine-suntem*` în `src/app` (73 de foldere de rută verificate), și nu e linkată din footer — `legalLinks` din `src/components/home/footer.tsx:87-93` are doar cele 5 pagini legale. Singura potrivire de nume e articolul `/totul-despre-cartea-funciara-colectiva`. |
| **Cine scrie / bio de autor** | **ABSENT** | `ArticleLayout` (`src/components/articole/article-layout.tsx:18-34`) **n-are deloc prop `author`**. `buildArticlePageGraph` e apelat dintr-un singur loc (`:54`) și nu pasează niciodată `author` → în tot build-ul, singura valoare de autor e `"author":{"@id":"https://eghiseul.ro/#organization"}`. Nu există pagină de autor. |
| **Byline vizibil** | **1 pagină din 243** | Singura notă editorială randată e pe `/servicii/cazier-judiciar-online` (`page.tsx:1165-1178`, sub comentariul `{/* EDITORIAL NOTE — E-E-A-T */}`): „**Conținut revizuit de Departamentul Juridic eGhișeul.ro** — specialiști drept administrativ, eDigitalizare SRL. Ultima actualizare: … · Sursă legislativă: Legea 290/2004, Legea 214/2024, OUG 34/2014, Regulamentul UE 910/2014 (eIDAS)". |
| **Reviewer real** | **RISC** (vezi §7) | 30 de pagini de serviciu declară `reviewedBy` → nod `Person` „Departamentul Juridic eGhișeul.ro". Un departament nu e o persoană, n-are pagină, n-are bio, n-are `sameAs`. **29 din 30 nu arată nimic despre asta pe ecran** — semnalul există doar în structured data. |
| **Data „Publicat/Actualizat" vizibilă** | **53 din 243 (21,8%)** | Se randează doar prin `ArticleLayout` (`:105-118`: `Publicat: …` / `Actualizat: …`). Paginile de serviciu, calculatoarele, cele 90 de pagini de locație și huburile **n-au nicio dată vizibilă**. Registrul `src/lib/seo/last-modified.ts` e explicit doar pentru `<lastmod>` în sitemap, nu pentru afișare. |
| **Pagină de recenzii / testimoniale dedicată** | ABSENTĂ | Recenziile apar doar ca modul pe paginile de serviciu + homepage. |
| **Politici/echipă editorială, metodologie, surse** | ABSENTE | Nicio pagină de tip „cum verificăm informația". |

### 6.3.1 Trei probleme de exactitate găsite în copy (nu SEO, dar erodează încrederea)

**(a) Contradicție de garanție, la 15 rânduri distanță, în pasul de plată.**
`src/components/orders/steps-modular/review-step.tsx:604-607`:

> „**Garanție rambursare:** Dacă nu ești mulțumit de serviciu, îți returnăm banii
> în **30 de zile, fără întrebări**."

vs. `/politica-de-anulare` (`page.tsx:66-71`) și endpoint-ul real de anulare
(`src/components/orders/self-cancel-card.tsx:63,121`):

> „ai **30 de minute** de la confirmarea plății… primești înapoi **70% din suma
> plătită**" / „Diferența de 30% acoperă comisioanele Stripe + procesarea deja
> începută."

Iar la `review-step.tsx:592`, imediat deasupra, clientul bifează: „Solicit
executarea imediată a serviciului și **renunț la dreptul de retragere de 14
zile** (OUG 34/2014, art. 16 lit. a)." Cele trei afirmații nu pot fi simultan
adevărate.

**(b) Afirmație falsă într-o pagină legală.**
`src/app/politica-cookies/page.tsx:53`:

> „NU folosim cookie-uri de retargetare proprii (**Facebook Pixel**, TikTok etc.
> — **nu există pe site**)."

Meta Pixel **există** — `src/components/consent/cookie-consent.tsx:91-113`
(`NEXT_PUBLIC_META_PIXEL_ID`, `fbq`), încărcat după consimțământ. Copy-ul e din
înaintea integrării Meta (03.09) și trebuie corectat: e o declarație GDPR
inexactă într-un document de politică.

**(c) Cifre nesusținute și date de recenzii înghețate.**
„**150k+ Clienți**" / „Peste 150.000 de români" apare în 5 componente
(`hero-section.tsx:156`, `why-us-section.tsx:69`, `testimonials-section.tsx:9,32`,
`social-proof-section.tsx:13`) fără nicio sursă. Iar recenziile din
`src/config/reviews.ts` sunt hardcodate cu etichete **relative** înghețate la
data scrape-ului (2026-06-16): „acum 4 zile", „acum o săptămână" — care, în
septembrie, sunt pur și simplu false pe ecran.

### 6.4 Paginile legale (toate 6 există)

| Rută | Cuvinte | „Actualizat" declarat | Ce e |
|---|---:|---|---|
| `/termeni-si-conditii` | 1.668 | 8 iulie 2026 | 18 secțiuni numerotate (definiții, comandă, plată, termene, anulare, semnătură electronică, GDPR, răspundere, litigii); identificare completă a firmei la `:30-31` și `:236`; clauza ANPC-SAL + SOL la `:228-232`; ANSPDCP la `:210` |
| `/politica-de-confidentialitate` | 1.256 | 27 iunie 2026 | notificare GDPR completă: categorii de date, scop, temei, împuterniciți, retenție, drepturi |
| `/politica-de-anulare` | 720 | 15 iulie 2026 | fereastra de 30 min / 70%, cu lista de excepții **citită live din DB** (`processing_config.allow_self_cancel`) |
| `/politica-cookies` | 374 | 15 iulie 2026 | inventar de cookie-uri + comportamentul bannerului ⚠️ conține afirmația falsă de la §6.3.1(b) |
| `/gdpr` | 213 | 27 iunie 2026 | rezumat scurt cu trimitere la politica completă; numește explicit împuterniciții: „avocatul partener…, topograful autorizat ANCPI/OCPI și furnizori tehnici" |
| `/contact` | 207 | — | vezi §6.2 |

Toate cele 5 pagini legale folosesc `LegalLayout` cu `revalidate = 86400` și
afișează vizibil data de actualizare — **singurele pagini în afara articolelor
care o fac**.

---

## 7. Structured data / JSON-LD (§6 din brief)

Metoda: am parsat toate blocurile `<script type="application/ld+json">` din cele
243 de fișiere HTML publice și am inventariat `@type`-urile.

### 7.1 Ce se emite, pe tip de pagină

| Tip de pagină | N | Graful JSON-LD |
|---|---:|---|
| homepage | 1 | `Organization + ImageObject + PostalAddress + Country + ContactPoint + WebSite + WebPage + ItemList + FAQPage` |
| pagină de serviciu | 30 | `Organization + WebSite + BreadcrumbList + Service + Offer[] + **Product** + Brand + AggregateOffer + MerchantReturnPolicy + OfferShippingDetails + **AggregateRating** + WebPage(+`reviewedBy` **Person**) + FAQPage` |
| pagină de serviciu (rovinieta) | 1 | ca mai sus, fără `AggregateOffer`/`MerchantReturnPolicy` |
| locație (oraș & județ) | 90 | `Organization + WebSite + BreadcrumbList + Service(areaServed: **City**) + Offer + FAQPage` |
| articol | 57 | `Organization + WebSite + BreadcrumbList + **Article** + WebPage + FAQPage` |
| calculator | 41 | `Organization + WebSite + BreadcrumbList + **WebApplication** + Offer(price 0) + WebPage + FAQPage` |
| legal | 5 | doar `BreadcrumbList` |
| `/contact` | 1 | `Organization + WebSite + BreadcrumbList + ContactPage` |
| `/blog`, `/calculator` | 2 | **niciun JSON-LD** |

### 7.2 Ce e corect / deliberat bine

- **Zero `LocalBusiness`** pe tot site-ul. Decizia e documentată în cod:
  `src/lib/seo/locations/index.ts` — *„FĂRĂ LocalBusiness (n-avem birou fizic)"*.
  ✅ Exact ce trebuie pentru un business fără sediu cu public.
- `Organization` cu date reale, verificabile la ANAF (CUI 49278701, J2023001097301,
  adresa sediului), `sameAs` → profilul Google real.
- Paginile de locație folosesc `Service` + `areaServed: City`, nu `LocalBusiness`
  la fiecare oraș. ✅
- `logo` a fost mutat pe `og/default.png` fiindcă `/logo.png` dădea 404 (notă în
  `constants.ts`) — nodul `Organization` e valid.

### 7.3 Ce e riscant

**(a) `aggregateRating` identic pe 31 de `Product` diferite.**

```json
"aggregateRating": { "@type":"AggregateRating",
  "ratingValue":4.9, "reviewCount":457, "bestRating":5, "worstRating":1 }
```

Cifra e **reală** (Google Business Profile, verificată 28.07.2026, sursă unică
`SOCIAL_PROOF` în `src/lib/seo/constants.ts:270-293`). Problema nu e că e falsă,
ci că e **reputația firmei aplicată ca rating de produs pe 31 de produse
distincte**. Ghidul Google pentru review snippets cere ca ratingul să fie colectat
*pentru acel item*. „4,9 din 457 de recenzii" pentru `Product: Copie Inventar de
Coordonate` nu îndeplinește condiția — e self-serving markup, exact categoria pe
care update-urile de spam o verifică. **Risc: mediu-mare. Cost de remediere: mic**
(scoate `aggregateRating` de pe `Product`, ține „4,9 pe Google" ca text + link
către profil).

**Agravant: trei valori diferite pentru același `reviewCount`, pe același site.**

| `reviewCount` | Unde | Pagini |
|---:|---|---:|
| **457** | `SERVICE_AGGREGATE_RATING` (`src/lib/seo/constants.ts:290`) | 30 |
| **89** | hardcodat în `src/app/servicii/rovinieta-online/page.tsx:60` | 1 |
| **64** | hardcodat în `src/app/servicii/[slug]/page.tsx:269` | 12 (rutele 308) |

Comentariul din `constants.ts` spune explicit că `SOCIAL_PROOF` e „sursă unică,
fiindcă înainte cifra era scrisă de mână în 6 componente + 28 de pagini de
servicii și ajunsese să difere" (audit 28.07.2026) — dar două locuri au scăpat
refactorizării. În plus, `src/config/contact.ts:34-36` menține în paralel
`GOOGLE_RATING = 4.9` + `GOOGLE_REVIEW_COUNT_LABEL = 'peste 450'`, deci există
efectiv două „surse unice de adevăr".

**(b) Nod `Person` care nu e o persoană.**

```json
{"@type":"Person","@id":"https://eghiseul.ro/#person-departamentul-juridic-eghi-eul-ro",
 "name":"Departamentul Juridic eGhișeul.ro",
 "jobTitle":"Echipă de specialiști drept administrativ",
 "worksFor":{"@type":"Organization","name":"eDigitalizare SRL"}}
```

Legat prin `"reviewedBy"` + `"lastReviewed":"2026-08-31"` pe 30 de pagini de
serviciu. Declară o **revizuire editorială de către o persoană care nu există**,
n-are pagină, n-are bio, n-are `sameAs`. E fix genul de semnal E-E-A-T fabricat
pe care documentația Google îl dă ca exemplu negativ. **Risc: mare. Cost: mic**
(ori scoți `reviewedBy`, ori pui o persoană reală cu pagină de autor).

**(c) `Product` + `MerchantReturnPolicy` + `OfferShippingDetails` pentru un
serviciu.**

Markup de merchant listing (shipping 0 RON, `MerchantReturnNotPermitted`) pe un
serviciu de intermediere. Nu e fals, dar e markup de e-commerce forțat pe ceva ce
schema.org modelează deja corect ca `Service` — și `Service` e emis oricum, în
paralel, pe aceleași pagini. Dublarea `Service` + `Product` pentru același lucru,
doar ca să prindă `aggregateRating`, e evident intenționată pentru rich results.

**(d) `FAQPage` pe 95,7% din site.**

221 de pagini cu `FAQPage`, 432 de întrebări duplicate (§4.6). Google a redus
rich results pentru FAQ în august 2023 la site-uri „well-known, authoritative
government and health websites" — deci markup-ul **nu mai aduce nimic**, dar
rămâne ca semnal de conținut generat la scară după același tipar. Pe 4 întrebări
identice × 48 de pagini, e o amprentă vizibilă.

**(e) `datePublished` fals pe 12 pagini** (`2024-01-01`) — vezi §5.4.

**(f) `dateModified` global pe calculatoare** — o singură constantă
`'2026-06-22'` în `calculator-layout.tsx` pentru toate cele 41 de calculatoare,
plus `lastReviewed` cu aceeași dată. Declară că toate au fost revizuite în
aceeași zi.

**(g) Două pagini fără JSON-LD** — `/blog` și `/calculator`, ambele huburi.

---

## 8. Dezvăluirea calității de intermediar (§7 din brief)

Aici site-ul stă **bine**, și e important de spus explicit fiindcă e singura
politică majoră din update pe care NU o încalcă.

### 8.1 Acoperire măsurată

| Formulare | Pagini randate care o conțin | % |
|---|---:|---:|
| „serviciu privat" | **243 / 243** | 100% |
| „nu suntem o instituție (de stat)" | **243 / 243** | 100% |
| „nu suntem afiliați" | **243 / 243** | 100% |
| link ANPC-SAL | 243 / 243 | 100% |
| link SOL / ODR | 243 / 243 | 100% |
| CUI `RO49278701` | 243 / 243 | 100% |
| banner `PrivateServiceNotice` (sub hero, cu link către instituție) | **4 / 31** pagini de serviciu | 13% |
| dezambiguizare explicită față de `ghiseul.ro` (portalul guvernamental) | **1 / 243** | 0,4% |

Disclaimerul e în componenta de footer (`src/components/home/footer.tsx:238-248`),
deci apare pe **fiecare** pagină de conținut — inclusiv pe cele 40 de pagini de
oraș `noindex` și pe calculatoare.

> **Excepția care contează.** Footerul nu e în root layout (vezi caseta din §6).
> `comanda/[service]`, `comanda/checkout/[orderId]` și
> `comanda/success/[orderId]` **nu importă `Footer`** și, în plus, un
> `grep -inE "serviciu privat|nu suntem|instituți[ea] de stat|neafili"` pe tot
> `src/components/orders/` + `src/app/comanda/` returnează **zero** rezultate.
> Adică: pe wizard, pe checkout și pe pagina de succes a plății nu există
> disclaimer de neafiliere, link ANPC/SOL sau date de firmă. Din perspectiva
> Google Ads (politica „Documente guvernamentale și servicii oficiale") și a
> ANPC, astea sunt exact paginile în care trebuie să existe.

### 8.1b Bannerul dedicat de pe paginile de serviciu — 4 din 31

Componenta `src/components/services/private-service-notice.tsx` a fost scrisă
special pentru asta (comentariu în cod: *„cerință a politicii Google Ads…
serviciul privat trebuie declarat vizibil pe landing, cu trimitere la canalul
direct al instituției"*), dar e folosită doar pe:

`cazier-judiciar-online`, `certificat-constatator-online`,
`eliberare-certificat-de-nastere`, `eliberare-certificat-de-casatorie`.

Lipsește de pe `cazier-fiscal-online`, `cazier-auto-online`,
`certificat-de-integritate-comportamentala`, `eliberare-certificat-de-celibat`,
`extras-de-carte-funciara`, toate cele 14 pagini cadastrale, ambele extrase
multilingve, `/servicii` (indexul) și de pe template-ul DB `/servicii/[slug]`.
Textul lui:

> „eGhișeul.ro este un **serviciu privat de asistență și intermediere** — nu
> suntem instituție de stat și nu suntem afiliați autorităților. Documentele
> sunt emise exclusiv de autoritățile competente, iar serviciul nostru este
> opțional: poți solicita documentul și direct, [la instituție]."

### 8.2 Textul exact (footer, pe toate cele 243 de pagini de conținut)

> „**eGhișeul.ro este un serviciu privat de asistență la obținerea de
> documente. Nu suntem o instituție de stat și nu suntem afiliați cu vreun organ
> guvernamental.** Documentele sunt emise exclusiv de autoritățile competente din
> România, iar serviciile noastre sunt opționale — documentele pot fi solicitate
> și direct la instituțiile emitente. Tarifele noastre acoperă exclusiv
> asistența, reprezentarea prin avocați colaboratori înscriși în Barou sau
> topografi autorizați ANCPI/OCPI și livrarea."

Are toate cele patru elemente pe care le cere și politica Google pentru
„government documents and official services", și pe care competiția le-a adăugat
în august (vezi memoria `google-ads-smecheria-competitorilor`): (1) e serviciu
privat, (2) neafiliere, (3) documentul e emis de autoritate, (4) alternativa
gratuită/directă e menționată explicit.

### 8.3 Textul exact (pagina `/contact`) — singurul loc cu dezambiguizare de nume

> „**eGhișeul.ro este un serviciu privat** de asistență pentru obținerea
> documentelor — nu suntem o instituție de stat și **nu suntem afiliați cu
> portalul guvernamental ghiseul.ro**. Documentele sunt emise de instituțiile
> abilitate; noi depunem cererile în numele tău și ți le livrăm."

**Aceasta e singura pagină din 243** care numește explicit `ghiseul.ro`. Dat fiind
că brandul e `eGhișeul.ro` — un caracter distanță de portalul guvernamental
`ghiseul.ro` — asta e exact fraza care ar trebui să fie în footer, nu doar pe
contact. **Recomandare cu cost zero: mută propoziția asta în footer.**

### 8.4 Unde limbajul se poate citi greșit

Nu există niciun „portal oficial" și niciun „instituția noastră". Dar există un
tipar sistematic de verb greșit — **„eliberăm"**, care e ce face autoritatea, nu
intermediarul. Apare pe **16 pagini (6,6%)**, concentrat exact pe cele 15 pagini
cadastrale care NU au bannerul de neafiliere:

| Fișier:linie | Citat |
|---|---|
| `servicii/extras-plan-cadastral/page.tsx:557` | „Extrasul de plan cadastral pe care **ți-l eliberăm noi** este documentul OCPI/ANCPI…" |
| `ancpi-nu-functioneaza/page.tsx:19` (meta description → ajunge în SERP) | „**Noi eliberăm extrasul de carte funciară în 2 zile lucrătoare**, prin partener autorizat." |
| `servicii/plan-amplasament-delimitare/page.tsx:321` | „Prin eGhișeul **îți eliberăm** o copie din arhiva OCPI a planului de amplasament…" |
| `servicii/extras-de-carte-funciara/page.tsx:892` | „Identificăm imobilul… și **îți eliberăm direct extrasul de carte funciară**." |
| `servicii/copie-intabulare/page.tsx:370, 410, 549` | „…apoi **îți eliberăm** copia de intabulare" (×3) |
| idem `copie-plan-incadrare`, `copie-plan-cadastral`, `extras-plan-cadastral` | ~22 de apariții în total pe setul imobiliar |

Alte formulări de calibrat:

- **`servicii/cazier-judiciar-online/page.tsx:622-627`** — caseta „Baza legală":
  > „**Baza legală:** Eliberarea cazierului online se face prin **contract de
  > prestări servicii cu eGhișeul.ro (eDigitalizare SRL)**, conform Legii
  > 214/2024… Documentul rămâne emis de IGPR, identic cu varianta clasică."

  Un contract comercial privat prezentat sub titlul „Baza legală" se citește ca
  temei statutar. Ultima frază corectează, dar titlul e cel care rămâne.
- **`src/components/home/faq-data.tsx:51-57`** — prima întrebare din FAQ-ul
  homepage-ului (emisă și ca `FAQPage` JSON-LD):
  > Î: „Documentele obținute prin eGhișeul sunt legale și oficiale?"
  > R: „**Da, 100% legale și oficiale.** Toate documentele sunt eliberate de
  > instituțiile statului român: …"

  Clarificarea („noi oferim asistență") vine abia în ultima frază.
- **`src/components/home/why-us-section.tsx:88-93`** — „…te reprezintă în fața
  autorităților pentru obținerea… și a altor **documente oficiale**". Perechea
  „documente" + „oficiale" e exact ce memoria proiectului
  (`google-ads-documente-oficiale`) spune să nu se folosească niciodată pe site.
- **„oficial/oficială" apare pe 174 din 243 de pagini (72%)** — în rest, în
  context corect (despre DOCUMENT sau despre sistemul ANCPI, nu despre site):
  „cazierul judiciar oficial emis de Poliția Română (IPJ)", „interogăm sistemul
  oficial ANCPI (e-Terra)".
- Formularea din footer „reprezentarea prin avocați colaboratori înscriși în
  Barou" apare pe **toate** paginile, inclusiv pe cele 42 de pagini de extras CF
  și pe cele 14 de servicii topograf, unde nu e implicat niciun avocat
  (vezi `LAWYER_SERVICE_SLUGS`, memoria `servicii-cu-avocat-lista-inversata`).
  Fraza spune „avocați **sau** topografi", deci nu e falsă, dar e imprecisă.

**Context de brand:** domeniul `eghiseul.ro` e la un caracter de `ghiseul.ro`
(portalul statului), paleta e instituțională (auriu pe bleumarin), iar singurele
locuri care explică diferența sunt `/contact` și articolul anti-fraudă
`/sms-fals-amenda-ghiseul-ro` (`page.tsx:70,156-157`). **Niciuna dintre cele 31
de pagini de serviciu nu face dezambiguizarea.**

**Verdict §7: dezvăluirea nu e problema.** Dacă update-ul din august a lovit
pentru „scaled content abuse" / „doorway", asta nu se repară din disclaimer — se
repară din §4 și §5.

---

## 9. Ce spun datele, pe scurt

1. **Amprenta e mai mare decât credeam:** 231 de pagini publice, nu 191. Cele 40
   de pagini de oraș `noindex` sunt scoase din sitemap, dar rămân live,
   crawlabile și în profilul site-ului.
2. **95,7% din site a apărut în 13 zile, 40% într-o singură zi (22.06).** Ăsta e
   tiparul cel mai greu de explicat altfel decât „conținut generat la scară".
3. **Cele două seturi de locație sunt cele mai duplicate:** 37,6% și 43,0% din
   pagină e text identic cuvânt cu cuvânt pe toate paginile setului, iar după
   mascarea numelor proprii similaritatea *crește* (0,72 și 0,71) — semnul clasic
   de doorway.
4. **27 din 42 de pagini de județ CF sunt sub 800 de cuvinte și n-au niciun
   `highlight`/`localFaq`/`localities`** — template + adresa OCPI, atât.
5. **Cea mai duplicată pereche nu e o pagină de locație**, ci două pagini de
   serviciu de 2.450 de cuvinte fiecare: extras multilingv naștere vs. căsătorie,
   Jaccard 0,751.
6. **Schema conține patru semnale fabricate, toate ieftin de reparat:**
   `aggregateRating` 4,9/457 pe 31 de produse (plus două valori paralele, 89 și
   64), un `Person` care e de fapt un departament, `datePublished: 2024-01-01` pe
   12 articole, și `dateModified` global identic pe toate cele 41 de calculatoare.
7. **Semnalele de trust legale sunt complete pe paginile de conținut** (firmă,
   CUI, ANPC, SOL, disclaimer de intermediar — 243/243) — **dar lipsesc complet
   de pe wizard, checkout și pagina de succes**, fiindcă footerul nu e în root
   layout. Asta e cel mai ieftin fix din tot documentul și are efect și pe zona
   Ads, nu doar SEO.
8. **Ce lipsește cu adevărat e E-E-A-T uman:** nicio pagină „Despre noi", niciun
   autor, un singur byline vizibil pe 243 de pagini, dată de actualizare vizibilă
   doar pe 21,8% din site. Pe un site care vinde asistență juridică și cadastrală
   cu plată anticipată, **nu există nicio persoană reală nicăieri** — doar un
   „Departament Juridic" care apare exclusiv în JSON-LD.
9. **Trei inexactități de reparat imediat, independent de SEO:** garanția „30 de
   zile, fără întrebări" din wizard contrazice politica reală (30 min / 70%);
   politica de cookies afirmă că Facebook Pixel „nu există pe site" deși e
   integrat din septembrie; recenziile hardcodate afișează „acum 4 zile" pentru
   texte scrape-uite în iunie.

---

## Anexă A — Toate cele 231 de pagini

Fișier complet, cu clasă, cuvinte, `bodyWords`, lungime titlu/descriere, tipuri
JSON-LD, prima dată de commit, sursa datei, `datePublished` declarat, ultimul
commit, număr de commit-uri și flag de indexare:

**[`data/05-inventar-pagini.csv`](data/05-inventar-pagini.csv)** (231 de rânduri).

Extras — cele mai lungi 10 și cele mai scurte 10 pagini de conținut:

| Cuvinte | Rută | Clasă | Prima dată în repo |
|---:|---|---|---|
| 5.827 | `/ancpi-nu-functioneaza` | articol | 2026-07-15 |
| 4.650 | `/servicii/cazier-judiciar-online` | serviciu | 2026-01-05 |
| 3.777 | `/servicii/extras-de-carte-funciara` | serviciu | 2026-01-05 |
| 3.156 | `/servicii/certificat-constatator-online` | serviciu | 2026-06-14 |
| 2.973 | `/servicii/eliberare-certificat-de-nastere` | serviciu | 2026-06-14 |
| 2.969 | `/servicii/cazier-auto-online` | serviciu | 2026-06-14 |
| 2.670 | `/servicii/eliberare-certificat-de-casatorie` | serviciu | 2026-06-14 |
| 2.633 | `/servicii/cazier-fiscal-online` | serviciu | 2026-01-05 |
| 2.573 | `/servicii/certificat-de-integritate-comportamentala` | serviciu | 2026-06-14 |
| 2.458 | `/servicii/extras-multilingv-certificat-casatorie` | serviciu | 2026-06-22 |
| … | | | |
| 781 | `/valabilitate-extras-de-carte-funciara` | articol | 2026-06-16 |
| 780 | `/informatii-cazier-auto-online` | articol | 2026-06-16 |
| 766 | `/calculator/valabilitate-documente` | calculator | 2026-07-14 |
| 759 | `/servicii/rovinieta-online` | serviciu | 2026-07-20 |
| 734–764 | 42 × `/servicii/extras-de-carte-funciara/<județ>` | locație | **2026-06-22** |
| 720 | `/politica-de-anulare` | legal | 2026-06-22 |
| 717 | `/suspendare-activitate-firma-ghid` | articol | 2026-06-16 |
| 714 | `/acte-necesare-certificat-de-nastere` | articol | 2026-06-19 |
| 711 | `/transcriere-certificat-de-casatorie` | articol | 2026-06-19 |
| 704 | `/ce-este-un-releveu` | articol | 2026-06-25 |
| 685 | `/ghid-complet-certificat-de-integritate-comportamentala` | articol | 2026-06-16 |
| 645 | `/rolul-si-atributiile-onrc-romania` | articol | 2026-06-16 |
| 626 | `/ce-este-planul-cadastral` | articol | 2026-06-25 |
| 560 | `/model-certificat-de-casatorie` | articol | 2026-06-20 |
| 521 | `/calculator` | hub | 2026-06-21 |
| 487 | `/curs-valutar` | calculator | 2026-06-22 |
| 374 | `/politica-cookies` | legal | 2026-06-16 |
| 213 | `/gdpr` | legal | 2026-06-16 |
| 207 | `/contact` | legal | 2026-06-16 |
| 147 | `/tools` | hub | 2026-06-21 |

---

## Anexă B — Fișiere de date brute

Toate în [`data/`](data/), regenerabile cu scripturile descrise în §0/§4.1/§5.1.

| Fișier | Conținut |
|---|---|
| `05-inventar-pagini.csv` | 231 de rânduri × 15 coloane — inventarul complet |
| `05-cadenta-publicare.csv` | 21 de zile de publicare, cu flag `DUMP` și lista rutelor |
| `05-similaritate-seturi.json` / `.tsv` | Jaccard median/min/max/p25/p75 + propozițiile identice, per set |
| `05-unicitate-pagini-locatie.csv` | 90 de rânduri — cuvinte unice și % unic per pagină de locație |
| `05-perechi-similare.csv` | 2.204 perechi de pagini cu Jaccard ≥ 0,20 |
| `05-faq-duplicate.csv` | 1.118 întrebări FAQ unice, cu numărul de pagini pe care apar |

**Reproducere:** build-ul analizat e `.next/` din 2026-09-07 (BUILD_ID
`.next/BUILD_ID`). Un `npm run build` nou + rularea din nou a scripturilor din
`§0` dă aceleași numere, cu excepția paginilor modificate între timp.

### Scripturi (`data/05-scripts/`)

| Script | Ce face |
|---|---|
| `extract.cjs` | parcurge `.next/server/app/**/*.html`, extrage textul din `<main>` + `<body>`, titlul, descrierea și tipurile JSON-LD → `pages.json` |
| `analyze.cjs` | join între sitemap-ul live, listele din `src/lib/seo/constants.ts` + `locations/`, datele din git și `pages.json` → clasificarea și inventarul |
| `similarity.cjs` | shingles de 5 cuvinte + Jaccard pe perechi + intersecția de propoziții, per set-template |

Extensia e `.cjs` intenționat: ESLint lintează și `docs/**/*.js`, iar scripturile
folosesc `require()` (vezi memoria `eslint-linteaza-docs-js` — un `.js` cu
`require()` în `docs/` a stricat 4 build-uri pe 03.09).

Rulare (din rădăcina proiectului, după `npm run build`):

```bash
node docs/seo/2026-09-recuperare-spam-update/research/data/05-scripts/extract.cjs /tmp/pages.json
```

⚠️ `analyze.cjs` și `similarity.cjs` au căi absolute către directorul de lucru al
sesiunii în care au fost scrise (constanta `SP` din capul fișierului) — schimbă-o
cu directorul în care ai pus `pages.json` înainte de rulare.

---

**Autor:** audit automat, 2026-09-09.
**Următorul pas natural:** prioritizarea remedierilor — §9 punctele 2, 3, 4 și 6
ating direct politicile vizate de August 2026 Spam Update; punctele 7 și 9 sunt
fixuri de câteva minute, cu efect și pe zona Ads.
