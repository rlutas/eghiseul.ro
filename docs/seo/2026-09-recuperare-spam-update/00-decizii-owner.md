# Decizii luate de owner (Raul) — 2026-09-09

> ⚠️ **NIMIC NU SE EXECUTĂ ÎNCĂ.** Ordin explicit: se așteaptă analiza completă
> (toți agenții) + planul complet de reparare, apoi se execută. Fișierul ăsta e
> doar registrul deciziilor, ca să intre în plan.

## D1 — Autor real pe site (E-E-A-T)

**Decis:** autorul site-ului e **Luțaș Raul Cătălin**, absolvent **BSc,
University of Roehampton — computing technologies**.

De făcut (în plan, nu acum):
- pagină de autor dedicată (`/despre/raul-lutas` sau similar), cu bio, calificare,
  rol în firmă, legătura cu cabinetul de avocatură partener;
- `author` real în `ArticleLayout` (azi prop-ul nu există deloc) + byline vizibilă
  pe articole;
- schema `Person` reală, legată de pagina de autor, în locul nodului fabricat
  „Departamentul Juridic eGhișeul.ro" folosit azi ca `reviewedBy` pe 30 de pagini.

⚠️ **Observație de acuratețe, de rezolvat la redactare:** o diplomă în computing
NU e expertiză topicală pentru conținut juridic/administrativ. Google evaluează
experiența RELEVANTĂ. Bio-ul trebuie să conducă cu experiența operațională reală
și verificabilă (de când funcționează serviciul, câte dosare procesate, cum
lucrăm cu avocata parteneră, ce răspundem noi și ce nu), iar studiile să apară ca
background — nu invers. Nimic nu se inventează: doar ce se poate susține.

## D2 — `datePublished` corect pe articolele vechi

Azi: `datePublished: "2024-01-01"` hardcodat pe 12 articole + un singur
`dateModified` global pe toate cele 41 de calculatoare. De înlocuit cu date
reale (prima publicare / ultima modificare de fond), plus dată de actualizare
vizibilă în pagină — azi apare pe doar 21,8% din site.

## D3 — Rescriere `extras-multilingv-*` cu `/humanizer`

Cea mai duplicată pereche de pe site: `extras-multilingv-certificat-casatorie`
↔ `extras-multilingv-certificat-nastere`, **Jaccard 0,751 la ~2.450 de cuvinte**
— literalmente același text cu „naștere" înlocuit cu „căsătorie".

De făcut: rescriere prin skill-ul `humanizer`, **diferențiate pe conținut și pe
utilizare reală** (la ce folosește fiecare act, cine îl cere, în ce țări, ce
anexă legală, ce termene) — nu doar sinonimizare.

## D4 — Cleanup pe paginile de locație (ștergere)

**Preferința ownerului: se șterg.**

Susținut de date: 43 de pagini de locație = **208 clicuri în 3 luni** (0,1% din
trafic, 5 clicuri/pagină/trimestru); mascând numele proprii, similaritatea
**crește** la 0,72 (48 orașe) / 0,71 (42 județe) — adică singurul lucru care le
diferențiază e numele locului; 33 de fraze identice pe toate cele 48 de pagini
de oraș (37,6% din pagina mediană), 25 pe toate cele 42 de județe (43%); 27 din
42 de județe n-au niciun conținut local.

⚠️ **De tranșat cu datele din lista de decizii per pagină (agentul încă rulează),
înainte de execuție** — două nuanțe care pot schimba forma, nu direcția:
1. **Oraș vs județ.** Cele 48 de pagini de oraș n-au sursă de date locale reale
   (cazierul se emite la nivel de IPJ **județean**, două orașe din același județ
   au fix același birou) → candidat clar la ștergere. Cele 42 de județe stau pe
   date OCPI reale, 15 dintre ele au primit conținut local pe 21.07 și au și
   clicuri (București 24, Brașov 15, Cluj 15) → posibil consolidare, nu ștergere.
2. **Ștergere (410) vs consolidare (301).** Regula: 301 către părinte oriunde
   există inlinkuri, backlinkuri sau clicuri istorice; 410 doar unde nu există
   niciunul. Se aplică mecanic pe lista per-pagină, nu din ochi.

Tot aici: cele **40 de pagini de oraș pe `noindex` sunt încă live și crawlabile**
(scoase din sitemap ≠ scoase din footprint). Cleanup-ul le include.

## D5 — Pagină E-E-A-T „Despre" + tot ce se poate

Azi: zero pagină Despre pe site (nici CJO n-are — deci nu e discriminatorul,
dar rămâne o lipsă reală). De construit: cine suntem, firma (EDIGITALIZARE SRL,
CIF RO49278701), cum funcționează serviciul pas cu pas, relația cu cabinetul de
avocatură, ce facem și ce **nu** facem, de ce nu suntem instituția statului.

## D6 — Recenziile: cifra reală e 4,9 / 464

**Confirmat de owner (09.09, captură din profilul Google):** eGhiseul.ro are
**4,9 stele din 464 de recenzii**, profil real cu sediu în Satu Mare
(„Information services in Satu Mare"), cu fotografii și Street View.

Deci recenziile NU sunt inventate — **cifrele de pe site sunt greșite**:
- `ratingValue: 4.8, reviewCount: 64` hardcodat în
  `src/app/servicii/[slug]/page.tsx:268-269`, identic pe **29 de servicii**;
- alt hardcode `4.8 / 89` pe rovinietă;
- cifra aproape-corectă (4,9 / 457) există în `constants.ts:281` dar **nu e
  folosită nicăieri**.

Trei note diferite pe același site, niciuna corectă.

De făcut: o singură sursă de adevăr la **4,9 / 464**; `aggregateRating` pe
**`Organization`**, nu replicat pe 31 de noduri `Product` (marcajul de recenzii
pe un produs cere recenzii pentru ACEL produs, vizibile pe pagină); recenziile
reale afișate acolo unde marcajul rămâne; stampila „acum 4 zile" de pe
recenziile hardcodate ori se leagă de sursă reală, ori dispare.

⚠️ Cu 464 de recenzii reale și sediu fizic, `LocalBusiness` + profil GBP legat
corect devin un semnal de încredere **legitim** — de evaluat la Faza 4. Și
intră în pagina „Despre noi" (D5).

## Ce am semnalat, dar NU e decis (intră în plan ca propuneri)

- **Disclosure lipsă pe fluxul de comandă** — `comanda/[service]`, `checkout` și
  `success` n-au footer, deci n-au nici neafiliere, nici ANPC/SOL, nici date de
  firmă. Exact ecranele unde clientul dă CNP, scan de act și card.
- **`PrivateServiceNotice` pe 4 din 31 de pagini de serviciu** — lipsește de pe
  toate cele 15 cadastrale, unde apare de ~22 de ori „eliberăm" (verbul
  instituției).
- **Defecte de acuratețe** — wizardul promite „30 de zile, fără întrebări" la 15
  rânduri de checkboxul de renunțare la 14 zile, în timp ce politica reală e
  30 de minute / 70%; `/politica-cookies` scrie că Facebook Pixel „nu există pe
  site", deși Meta Pixel e integrat.
