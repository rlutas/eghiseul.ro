# Plan de recuperare — Google August 2026 Spam Update

**Data:** 2026-09-09 · **Stare:** aprobat pentru scriere, **neexecutat**
**Bază:** 9 documente de analiză (8 agenți) + exporturi GSC + crawl Screaming Frog + DB producție

> Regula acestui plan: fiecare acțiune are o **dovadă măsurată** în spate. Ce n-are, e
> marcat ca ipoteză. Am mai pierdut o lună pe o ipoteză nemăsurată (backlinkurile);
> nu repetăm.

---

## 1. Diagnostic

### Ce s-a întâmplat

Rollout 18–21.08.2026. Pe ferestre egale de 17 zile (01–17.08 vs 23.08–08.09):
**clicuri −78%, expuneri −96%, comenzi −70%, venit −75%** (11–15k RON/săpt → 2,6–4,3k).
Fără acțiune manuală în GSC, indexare intactă, crawl sănătos.

### Ce NU e cauza — eliminat cu dovezi, nu mai cheltuim efort aici

| Ipoteză | Dovada care o elimină |
|---|---|
| Backlinkurile plătite | Google a declarat explicit că update-ul nu vizează link spam / site reputation abuse |
| **Scriitura „AI" / tiparele formulaice** | Măsurat identic pe ambele site-uri, aceeași zi: **CJO 13,8/1k vs noi 10,4/1k**. CJO e „mai AI" și e #1. Cifra veche „CJO 5–8" nu se reproduce — cele două site-uri nu fuseseră măsurate identic |
| **Paginile de locație ca formulă** | CJO e **mai** duplicat pe toate 3 metricile (Jaccard 0,909 vs 0,880; boilerplate 86% vs 76%) și e neafectat |
| Semnalele de încredere de pagină | Paritate sau în favoarea noastră: ANPC+SOL pe 100% din pagini pe ambele, avocatul divulgat pe 191/191 la noi vs 2/71 la ei, niciunul n-are „Despre noi" |
| SEO tehnic | 231/233 self-canonical, 0 redirecturi interne, 0 lanțuri, 0 orfane, 0 pagini peste depth 2, răspuns median 0,108 s |
| Cadența de publicare, în sine | CJO a publicat 53 de pagini într-o zi, din care 39 de oraș din template, fără consecințe. John Mueller (18.03.2024): publicarea în volum nu e tratată ca spam |
| **Calculatoarele** | Sunt singurul lucru care a supraviețuit — ba au și urcat. **Nu se atinge nimic acolo** |

**Controlul intern care taie 3 ipoteze dintr-o lovitură:** cele 38 de calculatoare au
fost publicate în același lot de 2 zile ca paginile de județ, au **cel mai prost** scor
de tipare de pe site (11,3/1k) și sunt cele mai off-topic — și sunt exact ce a
supraviețuit. Deci nici stilul, nici cadența, nici lățimea tematică nu separă ce a
murit de ce a trăit.

### Ce ESTE cauza — în ordinea plauzibilității

**1. Cluster comercial generat din template, la scară.** 63 de pagini din 3 șabloane,
în 5 zile: 13 pagini cadastrale cvasi-identice + 42 de județe (27 template pur, 740
cuvinte) + 48 de orașe. Dovada decisivă: **83 de perechi de pagini non-locație cu ≥25%
suprapunere pe shingles de 6 cuvinte la noi — 0 la CJO.**

Iar la paginile de locație, **mascarea numelor proprii CREȘTE similaritatea** (0,66→0,72
la orașe, 0,56→0,71 la județe): singurul lucru care le diferențiază e numele locului.
33 de fraze identice pe toate cele 48 de orașe (37,6% din pagina mediană), 25 pe toate
cele 42 de județe (43%).

**2. Coeziune internă slabă.** Pagina medie primește 5 linkuri interne; la CJO, **38**.
Clusterul comercial arată ca o anexă atârnată de site, nu ca site-ul. Și e invers față
de valoare: locațiile au 14–49 inlinkuri pentru 0,1% din clicuri, articolele au mediană
4 și calculatoarele 6 pentru 76% din clicuri.

**3. Subțirime pe paginile care trebuie să vândă.** 37 de pagini sub 800 de cuvinte.
CJO: **zero**, în afara celor legale.

### Corecție de măsurare — obligatorie pentru tot ce urmează

O parte din cele 1,9 milioane de expuneri pierdute **nu e penalizare**:
`/ancpi-nu-functioneaza/` a pierdut 566.789 expuneri fiindcă **avaria ANCPI s-a
încheiat** (portalul a repornit 11–12.08) — poziția noastră pe `ancpi` chiar a urcat
(6,74 → 4,71). Dacă pui asta la socoteala penalizării, vei măsura greșit recuperarea.

---

## 2. Principii de execuție

1. **Nu atinge calculatoarele.** 54% din clicuri, nedemotate, unele în creștere.
2. **Un lucru pe rând, cu dată.** Altfel nu știm ce a funcționat.
3. **Măsoară EXPUNERILE pe clusterul `/servicii/`**, nu clicurile — expunerile se mișcă
   primele. Zilnic, în GSC.
4. **SERP-ul real se verifică doar cu `&pws=0`.** Poziția din GSC e mediată pe
   interogările servite; când dispare coada lungă, media se mișcă din compoziție.
5. **Nimic nu se inventează.** Nici recenzii, nici date, nici autori, nici calificări.
6. **301 unde există inlinkuri/backlinkuri/clicuri istorice; 410 doar unde nu există
   niciunul.** Regula se aplică mecanic, nu din ochi.

---

## 3. FAZA 0 — Igienă și adevăr (1–2 zile, fără risc, se face prima)

Sunt lucruri care ori sunt neadevărate pe site, ori sunt semnale proaste gratuite.
Niciunul nu e probabil cauza demotării; toate sunt ieftin de reparat și greu de apărat
dacă rămân.

### 0.1 Recenziile — de la fabricat la real

**Realitatea:** avem un profil Google real, în Satu Mare, cu **4,9 din 464 de recenzii**.
**Pe site:** `ratingValue: 4.8, reviewCount: 64` hardcodat în
`src/app/servicii/[slug]/page.tsx:268-269`, identic pe **29 de servicii distincte**;
alt hardcode `4.8/89` pe rovinietă; iar cifra reală (4,9/457) există în
`constants.ts:281` **dar nu e folosită nicăieri**. Trei note diferite pe același site,
niciuna corectă.

De făcut:
- o singură sursă de adevăr, actualizată la **4,9 / 464**;
- `aggregateRating` mutat pe **`Organization`**, NU replicat pe 31 de noduri `Product`
  — marcajul de recenzii pe un produs cere recenzii pentru **acel** produs, vizibile pe
  pagină (politica Google de date structurate);
- recenziile reale afișate pe pagină acolo unde marcajul rămâne;
- recenziile Google hardcodate care scriu **„acum 4 zile"** pentru text cules în iunie —
  ori se leagă de sursă reală, ori se scoate stampila de timp.

⚠️ Cu 464 de recenzii reale și sediu fizic în Satu Mare, `LocalBusiness` + un profil GBP
legat corect devin un semnal de încredere legitim — de evaluat la Faza 4, nu acum.

### 0.2 Nodul `Person` fabricat

„Departamentul Juridic eGhișeul.ro" e folosit ca `reviewedBy` pe 30 de pagini, fără
pagină de autor, iar pe 29 din ele fără nimic vizibil pe ecran. Se scoate acum și se
înlocuiește la Faza 4 cu autorul real.

### 0.3 `<meta name="keywords">` identic pe 231 din 233 de pagini

160 de caractere, două seturi distincte pe tot site-ul, inclusiv pe `/gdpr/`,
`/curs-valutar/` și calculatoare. Google îl ignoră de ~15 ani; ca amprentă, e semnătura
perfectă de generare la scară. **Se elimină complet.**

### 0.4 Datele false din schema

- `datePublished: "2024-01-01"` pe 12 articole → date reale (**decizia D2**);
- un singur `dateModified` global pe toate cele 41 de calculatoare → dată reală per
  pagină;
- dată de actualizare **vizibilă** în pagină (azi apare pe 21,8% din site).

### 0.5 Linkurile moarte către instituții

**41 de linkuri către IPJ-uri județene dau HTTP 500** (82 de linkuri în total, 8 pe
pagini indexabile). „Referința locală reală" a paginilor de locație e moartă. Se repară
sau se scot — mapare 1:1 județ→pagină în `research/data/08-*.csv`.

### 0.6 Cadavrele de WordPress

32 de URL-uri legacy încă iau expuneri, între care 6 PDF-uri de contract din
`/wp-content/uploads/` și `/wp-admin/*`. Verificat azi: dau **403**, deci **nu e
scurgere de date** — dar 403 e semnalul greșit, Google le ține în index. Se pune
**410** (sau 301 unde există echivalent).

### 0.7 Disclosure pe fluxul de comandă

Footerul **nu e în root layout**: `comanda/[service]`, `comanda/checkout/[orderId]` și
`comanda/success/[orderId]` n-au nici notificare de neafiliere, nici ANPC/SOL, nici date
de firmă. Exact ecranele unde clientul dă CNP, scan de act de identitate și card.
Se adaugă.

Tot aici: `PrivateServiceNotice` rulează pe **4 din 31** de pagini de serviciu —
lipsește de pe toate cele 15 cadastrale, unde apare de ~22 de ori „eliberăm", verbul
instituției. Se extinde pe toate + se schimbă verbul.

### 0.8 Două neconcordanțe de acuratețe

- wizardul promite **„30 de zile, fără întrebări"** la 15 rânduri de checkboxul de
  renunțare la dreptul de retragere de 14 zile, în timp ce politica reală e
  **30 de minute / 70%**;
- `/politica-cookies` scrie că Facebook Pixel **„nu există pe site"**, deși Meta Pixel
  e integrat.

Astea două nu sunt SEO. Sunt expuneri de protecția consumatorului și GDPR.

---

## 4. FAZA 1 — Tăierea amprentei (cea mai importantă)

**Cifra care decide:** din 191 de pagini indexabile, **93 ies din index pentru 0,23% din
clicuri**. 48,7% din amprentă, pentru mai puțin de un sfert de procent de trafic. Nu e un
compromis între trafic și igienă — paginile alea nu produc trafic.

| Verdict | Pagini | Clicuri/3 luni |
|---|---:|---:|
| KEEP — nu atinge | 37 | 93.115 (48,8%) |
| KEEP + FIX — defect punctual | 29 | 43.614 (22,9%) |
| REWRITE — cerere reală, pagină slabă | 32 | 53.606 (28,1%) |
| **CONSOLIDATE (301)** | **93** | **439 (0,23%)** |
| DELETE (410) | 0 | 0 |

Lista completă, pagină cu pagină: `research/09-lista-decizii-per-pagina.md` +
`research/data/decizii-per-pagina.csv`.

### 1.1 Paginile de locație — **decizia D4: cleanup**

**Cazier / oraș (48):** consolidare pe tot setul. Granularitate greșită instituțional —
cazierul se emite la nivel de **IPJ județean**, două orașe din același județ au fix
același birou, deci nu există sursă de date locale reale. 40 din 48 sunt deja pe
`noindex` (exact cele cu 0 clicuri și 0 expuneri), iar cele 8 indexabile au făcut 88 de
clicuri în 3 luni.

⚠️ **Cele 40 de pagini pe `noindex` sunt încă live și complet cross-linkate** — fiecare
are exact 49 inlinkuri și 142 outlinkuri, identic cu cele indexabile. Noindex-ul ascunde
paginile; **plasa de doorway rămâne intactă în graful de linkuri**. Cleanup-ul trebuie
să scoată și linkurile, nu doar paginile.

**Carte funciară / județ (42):** consolidare, dar e cazul mai greu — aici granularitatea
e **corectă** (OCPI chiar e per județ). Datele decid: 43% din pagina mediană identică pe
toate 42, H2-1 și H2-2 identice literal pe toate 42, 26/42 sub 800 de cuvinte, 17 cu
zero clicuri, 9 cu **zero expuneri în trei luni**.

Recomandare în doi timpi: **301 acum**, reconstruiești 4–5 județe reale (București,
Cluj, Brașov, Timiș) abia după ce recuperarea e dovedită — cu conținut care nu poate
exista pe altă pagină. Alternativa mai puțin ireversibilă, dacă vrei să nu tai definitiv:
`noindex, follow` + scoaterea din sitemap și din linkuri.

### 1.2 Cele 13 pagini de serviciu cadastral

Cea mai clară semnătură de template la scară de pe site și fără corespondent la CJO:
`copie-carte-funciara`, `copie-plan-cadastral`, `copie-releveu`, `copie-intabulare`,
`copie-contract-vanzare`, `copie-arhiva-ocpi`, `copie-inventar-coordonate`,
`copie-plan-incadrare`, `plan-amplasament-delimitare`, `certificat-sarcini`,
`certificat-detineri-imobile`, `actualizare-adresa-cf`, `extras-cf-colectiv`.

Scrise în același commit, ~20 de clicuri pe toate la un loc.

⚠️ **Cere decizia ta:** sunt pagini de vânzare pentru o linie de venit activă (Mircea).
Consolidarea lor într-un hub „Documente din arhiva OCPI" cu secțiuni per tip e
recomandarea, **dar numai dacă nu există trafic offline/direct pe URL-urile
individuale** (linkuri trimise clienților, oferte, materiale tipărite). Confirmă înainte.

### 1.3 Cele 16 pagini indexabile cu zero expuneri în trei luni

Zero expuneri **inclusiv în perioada de vârf** (10–16.08, 4.000–5.900 clicuri/zi) =
Google nu le-a servit niciodată. 9 județe CF + 7 articole (`certificat-constatator-de-baza`,
`-pfa`, `-insolventa`, `cazier-judiciar-online-gratuit`, `schimbare-sediu-social-srl-ghid`,
`suspendare-activitate-firma-ghid`, `transcriere-certificat-de-casatorie`). Toate ies.

**Faptul neplăcut care confirmă diagnosticul:** cele 4 articole de constatator rescrise
pe 24.08 (`certificat-constatator-cu-istoric` 25,1→3,7 scor AI,
`rolul-si-atributiile-onrc` 22,2→3,1) au în continuare **ZERO expuneri**. Nu textul era
problema — ci existența a 8 pagini satelit pentru un subiect care are deja un ghid cu
479 de clicuri.

### 1.4 Sitemap curatoriat

Ca la CJO: sitemap-ul e o listă curatoriată, nu un dump de rute. Ce e subțire și nu se
repară acum, iese din sitemap și din index.

---

## 5. FAZA 2 — Coeziune internă (ieftin, nefăcut deloc)

Mediana de linkuri interne primite: **5 la noi, 38 la CJO** — de 7 ori mai slab. E cea
mai ieftină intervenție din listă.

- linkuri din articolele cu trafic real către paginile de serviciu corespunzătoare
  (azi articolele au mediană 4 inlinkuri și duc 22% din clicuri);
- punte tool→serviciu pe calculatoarele cu volum (rovinietă, cadastral) — atenție,
  **fără a modifica conținutul calculatoarelor**, doar linkuri contextuale;
- hub-uri tematice reale pentru fiecare verticală, cu linkuri în ambele sensuri;
- scoaterea linkurilor către paginile consolidate (altfel rămâne plasa).

---

## 6. FAZA 3 — Adâncime pe ce rămâne

### 3.1 `extras-multilingv-*` — **decizia D3**

Cea mai duplicată pereche de pe site: `extras-multilingv-certificat-casatorie` ↔
`extras-multilingv-certificat-nastere`, **Jaccard 0,751 la ~2.450 de cuvinte** —
literalmente același text cu „naștere" schimbat în „căsătorie".

Rescriere cu skill-ul `humanizer`, **diferențiate pe conținut și pe utilizare reală**:
la ce folosește fiecare act, cine îl cere, în ce țări, ce anexă legală (Anexa 4 vs
formularul de căsătorie), ce termene, ce documente cere oficiul. Nu sinonimizare.

### 3.2 Cele 27 de județe rămase template pur (dacă NU se consolidează)

740 de cuvinte, ~20% unic. Ori primesc conținutul local pe care l-au primit cele 15 din
21.07, ori ies. Ținta de referință: **1.381 de cuvinte**, ca la CJO.

### 3.3 Cele 32 de pagini REWRITE

Au cerere reală în căutare dar pagină slabă. Prioritatea nu e scorul de tipare — e
**adâncimea reală**: surse, cifre, proceduri specifice, ce nu poate exista pe altă pagină.
Lista în `research/09-lista-decizii-per-pagina.md`.

⚠️ Scorurile AI din raportul de pe 24.08 sunt **depășite** — cel puțin 11 pagini au fost
rescrise între timp. Lista de decizii folosește scorul curent.

---

## 7. FAZA 4 — E-E-A-T real (deciziile D1 + D5)

Notă onestă: **impactul direct pe ranking nu e dovedit** (Quality Rater Guidelines cer
explicit raterilor să identifice „cine e responsabil pentru conținut" — dar niciun studiu
nu cuantifică efectul unei pagini „Despre" asupra pozițiilor). Se face fiindcă e corect
și fiindcă e singura parte din plan care are efect și pe conversie, nu doar pe SEO.

### 4.1 Autor real — **D1**

**Luțaș Raul Cătălin**, absolvent **BSc, University of Roehampton — computing
technologies**.

- pagină de autor dedicată, cu bio, rol, legătura cu cabinetul de avocatură partener;
- `author` real în `ArticleLayout` — azi prop-ul **nu există deloc**; o singură semnătură
  vizibilă pe 243 de pagini;
- schema `Person` reală, legată de pagina de autor, în locul nodului fabricat.

⚠️ **De redactat cu grijă:** o diplomă în computing nu e expertiză topicală pentru
conținut juridic/administrativ, iar Google evaluează experiența **relevantă**. Bio-ul
conduce cu ce e verificabil și specific — de când funcționează serviciul, câte dosare
procesate, cum lucrăm cu avocata parteneră, ce răspundem noi și ce nu — iar studiile
apar ca background. Altfel pagina de autor devine exact semnalul artificial pe care
încercăm să-l scoatem.

### 4.2 Pagina „Despre noi" — **D5**

Nu există azi (nici CJO n-are, deci nu e discriminatorul — dar e o lipsă reală).
Conținut: cine suntem, firma (EDIGITALIZARE SRL, CIF RO49278701), sediul din Satu Mare,
cum funcționează serviciul pas cu pas, relația cu cabinetul de avocatură, **ce facem și
ce NU facem**, de ce nu suntem instituția statului, cele **464 de recenzii reale cu 4,9**
legate de profilul Google.

### 4.3 Cum arăți încredere ca intermediar

Fără să pretinzi că ești instituția: procesul explicit (împuternicire avocațială →
depunere → ridicare → livrare), prețul afișat, termenul real, ce se întâmplă dacă
instituția refuză. Asta rezolvă și problema separată de la Google Ads cu formularea
„documente oficiale".

---

## 8. FAZA 5 — Prevenție

1. **Nicio pagină nouă din template fără date proprii per pagină.** Testul: dacă
   schimbi locul/varianta și pagina sună la fel, nu se publică. (Măsurabil: mascarea
   numelor proprii nu trebuie să crească similaritatea.)
2. **Fără loturi.** Nu pentru că Google penalizează cadența — nu penalizează — ci
   pentru că 92 de pagini într-o zi nu pot fi controlate calitativ de un om.
3. **Sitemap curatoriat**, nu generat din rute.
4. **Zero date inventate** în schema: rating, autor, dată, recenzie.
5. La următorul crawl Screaming Frog: **bifează Crawl Analysis**, altfel coloanele de
   near-duplicate și Link Score sunt goale (au fost goale la ăsta).

---

## 9. Măsurare și așteptări realiste

### Cum măsurăm

- **Expunerile pe clusterul `/servicii/`**, zilnic, în GSC. Primul semn de recuperare.
- **Exclude ANCPI din orice comparație** — cererea a dispărut, nu poziția.
- SERP real cu `&pws=0` pe un set fix de interogări-țintă.
- Comenzi plătite din DB, săptămânal.

### Cât durează, realist

- Recuperarea după un spam update vine la **următorul refresh**, nu la recrawl. Cazul
  cel mai bine documentat (site lovit în iunie): a stat la zero **7 săptămâni**, până la
  următorul refresh de tip spam update. Istoric, refresh-urile au fost la ~2–3 luni
  (martie → iunie → august).
- Deci **mișcare vizibilă înainte de octombrie–noiembrie ar fi o surpriză**, nu un semn
  că planul e greșit.

### Rata de bază, spusă direct

Glenn Gabe a urmărit ~400 de site-uri lovite de Helpful Content Update 2023: **doar 22%
au recuperat ≥20% din traficul pierdut într-un an.** Lily Ray: 129 din 130 dintre cele
mai lovite au continuat să scadă. HouseFresh — cazul de recuperare completă cel mai
citat — a durat **2 ani și o lună** și a cerut o schimbare de politică a Google, nu doar
muncă pe site.

**Nu construi bugetul pe recuperare.** Planul se execută fiindcă e corect, nu fiindcă e
garantat.

### Venitul între timp

Google Ads e canalul de compensare, cu problemele lui de politică tratate separat în
`docs/ads/`. Restul: brand, clienți existenți, recomandări, cele două platforme surori.

---

## 10. Ce am nevoie de la tine înainte de execuție

1. **Cele 13 pagini cadastrale** — există trafic offline/direct pe URL-urile
   individuale (linkuri trimise clienților, oferte, materiale)? Dacă da, nu se
   consolidează.
2. **Cele 42 de județe CF** — 301 definitiv acum, sau `noindex, follow` ca pas
   reversibil?
3. **Ordinea:** propun Faza 0 → Faza 1 → Faza 2, apoi 3 și 4 în paralel. Confirmi?
4. **Recenziile** — confirmi 4,9 / 464 ca sursă unică și legarea de profilul Google?

---

## Baza de dovezi

| Doc | Ce conține |
|---|---|
| `00-decizii-owner.md` | deciziile tale (D1–D5) |
| `07-date-gsc-analytics-business.md` | impactul măsurat: GSC, GA4, comenzi din DB |
| `research/01-spam-update-august-2026-stadiu.md` | ce se știe la 09.09 despre update, cazuri de recuperare |
| `research/02-politici-google-checklist.md` | politicile de spam, verbatim, + checklist de 25 de itemi |
| `research/03-pagini-locatie-programmatic.md` | ce face o pagină de locație defensibilă |
| `research/04-recuperare-si-semnale-incredere.md` | playbook, reguli prune/rewrite, outline „Despre noi" |
| `research/05-inventar-si-footprint-site.md` | 231 de pagini, cadență, similaritate, schema, disclosure |
| `research/06-comparatie-eghiseul-vs-cjo.md` | de ce a căzut unul și nu celălalt — clasamentul cauzelor |
| `research/08-audit-tehnic-screamingfrog.md` | 21 de probleme tehnice, ordonate |
| `research/09-lista-decizii-per-pagina.md` | verdict per URL + `data/decizii-per-pagina.csv` |
