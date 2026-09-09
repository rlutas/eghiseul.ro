# Pagini de locație / programmatic SEO — ce le face să supraviețuiască vs. să fie marcate doorway / scaled content abuse

Cercetare externă (septembrie 2026), pentru planul de recuperare după August 2026 Spam Update.
Context intern citit: `docs/seo/2026-08-24-spam-update-prabusire-organica.md`.

**Notă despre metodologie**: am etichetat fiecare afirmație cu nivelul de dovadă —
**(A)** declarație explicită Google, **(B)** practician cu date before/after publicate
și verificabile, **(C)** opinie/consens fără date. Câteva surse găsite (marcate mai
jos) sunt ele însele conținut de tip "scaled content" scris de agenții SEO — cifre
rotunde, fără site numit, fără linkuri către GSC/Ahrefs reale. Le-am păstrat doar
ca (C), cu avertisment explicit, exact ca să nu repetăm greșeala de a trata folclor
ca fapt.

---

## TL;DR — verdict

**REBUILD, nu delete; restructurare la granularitate județ (nu oraș) pentru cazier;
CF rămâne dar rescrie textul.**

1. **Nu șterge** cele 16 pagini cazier judiciar și cele 43 pagini extras CF. Ambele
   seturi au acces la date locale reale (IPJ, respectiv OCPI/BCPI — vezi secțiunea
   dedicată) care le pot face defensibile exact ca modelul Zillow/Yelp/TripAdvisor
   (pagină = date genuine, nu text reformulat). **(B/C, coroborat cu (A)** — politica
   Google de scaled content abuse vorbește explicit despre „valoare", nu despre
   „similaritate de șablon".)

2. **Rescrie conținutul**, nu doar structura. Auditul intern arată că paginile de
   locație (cazier + CF) au scor 10,6–11,8 tipare AI/1.000 cuvinte, aproape identic
   pe ambele seturi — inclusiv CF, care ARE date OCPI reale. Asta confirmă concluzia
   din research: **a avea date locale reale e necesar dar nu suficient** — dacă
   textul din jurul lor e umplutură cu tipare generice ([oras]/[judet] swap +
   „esențial", „reprezintă", hedging), Google le tratează ca low-value indiferent
   de datele subiacente. Nu e nevoie de al doilea set de dovezi pentru asta — e
   chiar definiția Google **(A)**: *„little to no value to users, no matter how
   it's created."*

3. **Cazier judiciar: schimbă granularitatea din oraș în județ.** Cazierul judiciar
   se eliberează de IPJ (Inspectoratul de Poliție Județean) — o entitate per JUDEȚ
   (41 + București), nu per oraș. Cele 16 (din 48 planificate) pagini de oraș
   construite acum nu au de fapt un corespondent instituțional real la nivel de
   oraș — datele reale (adresă, telefon, program, acte necesare) există doar la
   nivel de IPJ județean. Restructurarea la 42 pagini județ (exact modelul CF, care
   deja merge pe granularitatea corectă — OCPI e tot per județ) e simultan (a) mai
   defensibilă factual, (b) mai puține pagini de întreținut la calitate, (c)
   consistentă cu propriul exemplu CJO, care a supraviețuit cu pagini de județ.
   Nu construi restul de 32 de orașe planificate până nu e dovedită recuperarea pe
   cele existente. **(C, dar logică factuală directă, nu opinie SEO)**

4. **Consolidare (301), nu ștergere, pentru ce rămâne sub-prag.** Practica
   documentată de content pruning (Search Engine Land, Clearscope — **(C)**,
   consens fără studiu de caz Google-specific) spune: șterge doar ce n-are nicio
   valoare (fără trafic, fără linkuri, fără motiv să existe); noindex pentru ce are
   valoare non-organică; consolidează (301) ce se suprapune tematic. Pentru
   eghiseul: nu poți încă judeca traficul per pagină individual (tot clusterul e la
   ~0 din cauza demotării site-wide), deci decizia de consolidare trebuie luată pe
   bază structurală (granularitate corectă, vezi punctul 3), nu pe bază de
   performanță — datele de performanță per pagină sunt momentan inutilizabile.

5. **Cadența de publicare NU e un semnal Google documentat** — e opusul: John
   Mueller a spus explicit pe 18 martie 2024 (chiar în ziua March 2024 update) că
   publicarea în bloc nu e considerată spam din cauza modului de publicare **(A)**.
   Planul intern de „max 1–2 articole/săptămână" rămâne oricum o decizie bună —
   dar motivul corect e control de calitate uman (timp să verifici fiecare
   articol înainte de publicare), nu pentru că Google „numără" pattern-uri de
   burst. Vezi secțiunea dedicată mai jos — e diferența dintre corelație
   (burst + calitate slabă merg des împreună) și cauzalitate (Google n-a spus
   niciodată că detectează ritmul).

---

## Criteriile care fac o pagină de locație defensibilă (checklist, cu evidence tier)

| Criteriu | Ce înseamnă concret | Tier |
|---|---|---|
| Conținutul NU e doar text identic cu orașul/județul schimbat | Politica oficială Google (doorway abuse): *„having multiple domain names or pages targeted at specific regions or cities that funnel users to one page"* și *„substantially similar pages"* sunt exemple explicite de abuz | **A** — text exact din `developers.google.com/search/docs/essentials/spam-policies` |
| Fiecare pagină oferă „little to no value... no matter how it's created" testul invers | Scaled content abuse = pagini generate în masă fără valoare originală, indiferent dacă sunt scrise de om, AI, sau combinat | **A** — definiție oficială Google |
| Date structurate unice per pagină (nu doar 1 variabilă schimbată) | Studiile de caz citate (Zillow/Yelp/TripAdvisor) arată minim 3+ puncte de date reale per pagină (preț, adresă, program, recenzii) | **B/C** — pattern observat, nu are cifră Google oficială, dar aliniat cu definiția A |
| Pagină „About" și „Contact" reale, nu genericate | Consens recurent în ghidurile de doorway/local SEO (RicketyRoo, BrightLocal) — semnal de încredere, nu semnal de ranking documentat separat | **C** — nicio sursă nu are date izolate care să demonstreze efectul cauzal al unei pagini Contact asupra ranking-ului |
| Fotografii/testimoniale reale, specifice locației | Aceleași ghiduri — „real photos from the region", „real testimonials" | **C** — folclor practicieni, fără test izolat |
| Similaritatea de șablon (Jaccard) NU e discriminatorul singur | Cazul propriu CJO (88–89% Jaccard, nelovit) vs eghiseul (79–82%, lovit) — confirmă empiric | **B** (intern, verificat) — coroborat cu faptul că politica Google nu menționează niciodată „template similarity" ca metrică, doar „value" |
| Densitate de tipare AI/limbaj generic pe pagină, nu doar lungime | Pragul intern de audit (10/1.000 cuvinte eghiseul vs 5/1.000 CJO) e un proxy util, nu o metrică Google publicată | **C** (metodologie proprie, nu validată extern) — dar consistentă cu tendința generală: „100% din site-urile dezindexate martie 2024 aveau semne de conținut AI" **(B)** |
| Granularitatea geografică să corespundă unei entități reale | Pagină de oraș fără corespondent instituțional real = funnel artificial; pagină de județ pentru un serviciu emis la nivel de județ = corespondent real | Concluzie logică directă din structura instituțională RO, nu dintr-o sursă SEO — marcată **C** ca „opinie" doar formal, dar bazată pe fapt instituțional verificabil |
| Volum total al site-ului per raportul pagini-valoroase/pagini-totale | *„A large site can publish thousands of useful pages and be fine. A small site can publish fifty thin, templated pages and violate the policy."* | **C** (consens practicieni, fără prag numeric Google) |

---

## Ce date locale REALE există în România pentru serviciile noastre

Cercetate explicit ca material pentru diferențiere genuină (nu doar pentru raport):

- **Cazier judiciar → IPJ (Inspectoratul de Poliție Județean), per JUDEȚ (41 + Municipiul
  București), nu per oraș.** Fiecare IPJ are pagină proprie pe `politiaromana.ro`
  (subdomeniu de 2 litere, ex. `bh.politiaromana.ro`, `ct.politiaromana.ro`) cu:
  Serviciul Cazier Judiciar — adresă, telefon/fax, email dedicat (ex.
  `cazier@bh.politiaromana.ro`), program cu publicul specific. Acestea sunt date
  publice, verificabile, unice per județ — exact tipul de „real local reference"
  cerut de checklist. **Nu există la nivel de oraș** (Cluj-Napoca și Turda, de
  exemplu, sunt deservite de același IPJ Cluj) — deci pagina de oraș nu are ce
  informație reală unică să afișeze dincolo de ce arată deja pagina de județ.

- **Extras carte funciară → OCPI/BCPI (Oficiul/Biroul de Cadastru și Publicitate
  Imobiliară), per JUDEȚ + municipiul București** — 41 OCPI + 1 (București), cu
  BCPI-uri locale subordonate (total ~184 birouri cu adrese, telefoane, program).
  Site-uri proprii per județ (`cj.ancpi.ro`, `hd.ancpi.ro` etc.). Aceasta e deja
  structura folosită de eghiseul (43 pagini județ) — corect ca granularitate,
  problema fiind (per audit intern) TEXTUL din jurul datelor, nu structura.
  ANCPI publică și date deschise prin `data.gov.ro` (CSV/GeoJSON) — sursă
  suplimentară de diferențiere reală (statistici, hărți) neexploatată încă.

- **ANAF** — structură pe direcții regionale + administrații județene; utilă pentru
  serviciile fiscale (cazier fiscal, certificate ANAF), aceeași logică de
  granularitate județeană.

- **Primării** — relevante doar pentru servicii de stare civilă (certificate
  naștere/căsătorie), unde procedura diferă efectiv per primărie/UAT, nu doar per
  județ — aici *ar* fi defensibilă o granularitate mai fină, DAR site-ul nu are
  (conform CLAUDE.md — `location-seo-scope`) pagini de locație pentru stare civilă,
  deci nu e cazul curent.

- **ONRC** — structură per oficiu registrul comerțului de pe lângă tribunal, tot
  județeană; posibil relevant dacă se reiau paginile de locație pentru constatator.

Concluzie: pentru AMBELE seturi de pagini de locație existente, unitatea instituțională
reală din România e **județul**, nu orașul. CF a nimerit granularitatea corectă din
start; cazierul nu.

---

## Cazuri documentate: seturi de pagini de locație care au supraviețuit / au căzut

### Au supraviețuit (prin actualizările 2024–2026)

- **Zillow, Yelp, TripAdvisor** — pagină per proprietate/business/destinație,
  construită pe date live (MLS pentru Zillow — preț, mp, istoric taxe; profiluri
  de business revendicate și actualizate de proprietari pentru Yelp — adresă,
  program, recenzii; recenzii + rating călători pentru TripAdvisor). **(C)** —
  sursă e un blog agregator (tryvizup.com/heroicrankings.com), nu un studiu de caz
  cu cifre before/after specifice acestor site-uri; e observație calitativă
  general acceptată, nu date publicate. Util ca *model de pattern*, nu ca dovadă
  cantitativă.

- **Un portofoliu de 512 pagini programmatic, 3 familii de șabloane** (glosar,
  oraș, integrări), susține că a supraviețuit atât March 2024 core update cât și
  un „November 2025 helpful content refresh", cu cifre precise (11.840 clicuri/lună,
  87% indexare, ROI 14x). **Marcat (C) cu avertisment explicit**: sursa
  (`thestacc.com`) nu numește site-ul, nu leagă cifrele de un export GSC/GA
  verificabil, iar formatul (cifre rotunde perfecte, „luna 6 inflection point")
  seamănă cu conținut generat pentru a vinde credibilitate unui ghid SEO, nu cu un
  raport de audit real. Nu-l folosi ca bază de decizie, doar ca ilustrare a
  criteriilor calitative (3+ puncte de date per pagină, linking dens) care APAR și
  în sursele tier A/B.

### Au căzut

- **Martie 2024 — 837 din 49.345 site-uri monitorizate (1,7%) dezindexate complet**,
  responsabile de peste 20,7 milioane vizite organice/lună înainte de acțiune;
  100% aveau semne de conținut AI, 50% cu 90–100% din articole generate AI.
  **(B)** — analiză Ian Nuttall, citată de SearchEngineJournal/iPullRank și alte
  publicații specializate, cu metodologie de monitorizare declarată (49k site-uri
  urmărite), deși nu e Google însuși care confirmă cifrele.

- **Cazul „textbook scaled content abuse"** deja documentat în raportul nostru
  intern (`2026-08-24-spam-update...md`): site de calculatoare, ~130 articole AI,
  278→20 vizitatori/zi. Rămâne cea mai apropiată analogie de profilul eghiseul.

- **Decembrie 2024 spam update — 5 cazuri (Marie Haynes / gsqi.com)**, incluzând un
  caz cu 140.000–160.000 URL-uri doorway generate programatic din care doar ~12%
  ajungeau în top 100 chiar înainte de update (deja ineficiente), și un caz cu
  ~5 milioane de URL-uri într-o secțiune ascunsă. **(B)** — grafice Sistrix/Ahrefs
  reale, dar fără cifre absolute de trafic/venituri; calitativ solid, cantitativ
  parțial.

- **„March 2026 update" — 87% pierdere medie de trafic pentru site-urile lovite,
  60–90% scădere ranking, recuperare mediană 14 zile** — cifre din
  `digitalapplied.com`. **Marcat (C) cu avertisment identic** ca mai sus: articol
  de blog SEO fără site numit, cifre rotunde suspect de precise pentru un
  fenomen „mediu" pe tot web-ul. Nu exclude ca update-ul să fi existat (ține de
  fondul general de actualizări spam din 2026), dar cifrele specifice nu sunt
  verificabile și nu ar trebui citate ca fapt în decizii interne.

---

## Consolidare vs ștergere vs noindex — recomandare cu dovezi

Cadrul practicienilor de „content pruning" (Search Engine Land ghid, Clearscope,
alte agenții — **toate (C)**, consens fără studiu Google-specific izolat) e
consistent pe 3 opțiuni:

1. **Ștergere** — doar pentru pagini fără trafic, fără linkuri, fără conversii,
   fără motiv să existe. Nu se potrivește deocamdată nici pentru cazier
   (16 pagini), nici pentru CF (43 pagini) — ambele au avut trafic/expuneri reale
   înainte de demotare (conform GSC citat în raportul din 24.08), deci nu sunt
   „fără motiv să existe", ci „momentan penalizate site-wide".

2. **Noindex** — recomandat când pagina are valoare pentru vizitatori direcți
   (link din comandă, referință) dar nu merită să concureze organic. Nu e cazul
   principal aici — scopul e recuperare organică, nu retragere din index.

3. **Consolidare (301)** — recomandat când paginile se suprapun tematic fără
   diferențiere reală. Exemplu citat: un studiu de caz de fuziune a 2 pagini
   canibalizate → +92% expuneri / +70% clicuri în 5 săptămâni **(C — sursă de tip
   agenție, fără link direct verificat la cazul specific, dar mecanismul —
   concentrarea semnalelor de ranking pe o singură URL — e documentat generic de
   Google pentru 301 redirects)**.

   **Aplicat la eghiseul**: consolidarea corectă nu e „toate cele 16 orașe într-un
   singur hub" (asta ar recrea exact problema — o pagină generică fără date
   locale reale), ci **restructurare la granularitatea instituțională corectă**
   (județ, vezi mai sus). Practic: cele 16 orașe → hărțuite pe cele ~10–12 județe
   corespondente (din care unele orașe cad în același județ), cu 301 de pe
   URL-urile de oraș vechi către pagina de județ nouă, îmbogățită cu date IPJ
   reale. Nu există un caz documentat public identic (oraș→județ pentru servicii
   guvernamentale RO), deci recomandarea e (C) — inferență logică din principiile
   de mai sus, nu dintr-un studiu de caz citat.

**Nu există în sursele găsite niciun caz documentat public unde cineva a
consolidat 40+ pagini de oraș într-un singur hub și a raportat rezultatul** —
deci afirmația „301-ing 40 city pages into one hub" nu are dovadă directă nici în
sens pozitiv, nici negativ. Recomandarea de mai sus (restructurare la județ, nu la
un hub unic) e mai degrabă motivată de faptul instituțional (IPJ e per județ) decât
de un precedent SEO documentat.

---

## Cadența de publicare — ce e dovedit, ce e folclor

**Dovedit (A)**: John Mueller (Google), 18 martie 2024, ca reacție directă la o
întrebare despre publicarea a 40–50 articole simultan:

> „Content is generally not considered spam just from the way that you publish
> it. Some sites switch on a big batch of awesome content, and awesome is
> awesome. Some sites publish small amounts of junk, and well, it's junk not
> because of how it's published."

Asta e o negare explicită, directă, contemporană cu March 2024 update, a ideii că
ritmul de publicare în sine e un semnal de spam. Nu există nicio declarație Google
ulterioară (2024–2026) care să contrazică asta.

**Folclor (C)**: mai multe ghiduri SEO 2026 (digitalapplied.com și altele) susțin
că „bursty publishing... produce the same look" ca scaled content abuse, sau că
Google „will notice" salturile de la 5 articole/săptămână la 200. Aceste afirmații
nu citează nicio sursă Google — sunt corelaționale: echipele care publică în
rafale sunt și cele care sar peste control editorial, deci rafala + calitate
slabă apar împreună empiric, dar cauza reală (per Google însuși) e calitatea, nu
rafala.

**Aplicație practică pentru eghiseul**: planul intern de reducere la 1–2
articole/săptămână rămâne o decizie bună, dar recadrată corect — **e control de
calitate umană (timp de revizuit fiecare bucată înainte de publicare)**, nu o
„reparație" a unui semnal de ritm pe care Google l-ar detecta separat. Dacă
resursele ar permite verificare de calitate reală (rescriere + fact-check) pentru
10 articole/săptămână, cadența n-ar fi problema — dar realist, ritmul lent e un
proxy util pentru „a avut cineva timp să verifice asta", nu o cerință Google.

---

## Surse

**Tier A — Google explicit:**
- [Spam Policies for Google Web Search](https://developers.google.com/search/docs/essentials/spam-policies) — definiții oficiale doorway abuse și scaled content abuse (text citat integral mai sus)
- [Google: Content Publishing Frequency Not A Ranking Signal](https://www.seroundtable.com/google-content-frequency-25367.html) și [Google Says Publishing Content In Bulk Is Not Spam](https://www.seroundtable.com/google-publishing-content-in-bulk-spam-37077.html) — citat John Mueller, 18.03.2024

**Tier B — practicieni cu date verificabile:**
- [Google's March 2024 Core Update Impact: Hundreds Of Websites Deindexed](https://www.searchenginejournal.com/googles-march-2024-core-update-impact-hundreds-of-websites-deindexed/510981/) — analiza Ian Nuttall (837/49.345 site-uri)
- [The 2024 Core and Spam Update Breakdown](https://ipullrank.com/2024-core-update-analysis) — iPullRank
- [Google December 2024 Spam Update Analysis — 5 Case Studies](https://www.gsqi.com/marketing-blog/google-december-2024-spam-update-case-studies/) — Marie Haynes / GSQi, cu grafice Sistrix/Ahrefs
- Audit intern eghiseul vs CJO (Jaccard 79–82% vs 88–89%, scor tipare AI) — `docs/seo/2026-08-24-spam-update-prabusire-organica.md`

**Tier C — consens/opinie, folosit cu avertisment explicit:**
- [Location Pages: What Crosses the Line to Doorway Abuse & Spammy Content?](https://ricketyroo.com/blog/location-page-spam/) — RicketyRoo
- [How to craft unique and helpful location pages + free checklist](https://www.brightlocal.com/learn/location-pages/) — BrightLocal
- [Programmatic SEO Examples: Real Page Types](https://www.tryvizup.com/blog/programmatic-seo-examples-real-page-types-that-can-scale-organic-traffic) — pattern Zillow/Yelp/TripAdvisor (fără date proprii)
- [Programmatic SEO Case Study: 512 Pages, 18 Months](https://thestacc.com/blog/programmatic-seo-case-study/) — folosit doar ca ilustrare calitativă, site nenumit, cifre neverificabile
- [Programmatic SEO After March 2026: Scaled Content Survival](https://www.digitalapplied.com/blog/programmatic-seo-after-march-2026-surviving-scaled-content-ban) — idem, cifre neverificabile
- [Content pruning: Boost SEO by removing underperformers](https://searchengineland.com/guide/content-pruning) — Search Engine Land, cadru delete/noindex/consolidate
- [What Is Content Pruning and Why It Matters for SEO](https://www.clearscope.io/blog/what-is-content-pruning) — Clearscope
- [Doorway page](https://en.wikipedia.org/wiki/Doorway_page) — Wikipedia, context istoric

**Date instituționale RO (verificare structură, nu opinie SEO):**
- Pagini IPJ per județ, ex. [I.P.J. Bihor — Serviciul Cazier Judiciar](https://bh.politiaromana.ro/ro/utile/program-cu-publicul-acte-necesare/serviciul-cazier-judiciar), [I.P.J. Gorj](https://gj.politiaromana.ro/ro/utile/documente-eliberari-acte/cazier-judiciar), [I.P.J. Constanța](https://ct.politiaromana.ro/ro/ipj-constanta/servicii-judetene)
- [Oficii de Cadastru OCPI/BCPI din România — Listă pe Județe](https://funciara.com/oficii-cadastru)
- [ANCPI — Instituții — data.gov.ro](https://data.gov.ro/organization/datarequest/ancpi)
