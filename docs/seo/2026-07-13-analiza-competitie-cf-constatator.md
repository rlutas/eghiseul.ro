# Analiză competiție SERP — Extras CF + Certificat Constatator

**Data:** 2026-07-13 (SERP-uri live Google RO, incognito, pws=0)
**Context:** ranking organic slab pe cele două servicii cu automatizare completă (workeri Railway).

---

## 1. Poziții actuale eghiseul.ro

| Keyword | Poziția noastră | Pagina |
|---|---|---|
| extras de carte funciara online | **#14** | /servicii/extras-de-carte-funciara/ |
| extras carte funciara | **absent top 20** | — |
| carte funciara online | **absent top 20** | — |
| certificat constatator online | **#3** (articol) + **#9** (serviciu) | /cele-4-tipuri…/ + /servicii/… |
| certificat constatator | **#3** (articol) + **#7** (serviciu) | idem |
| certificat constatator onrc pret | **#2** (serviciu) + **#7** (ghid) | /servicii/… + /eliberare-…-ghid/ |

**Concluzie:** Constatator stă bine (top 3 pe tot ce contează). Carte funciară e problema reală.

---

## 2. SERP „extras de carte funciara online" — cine domină și de ce

Top 15:
1–5. **ANCPI oficial** (epay.ancpi.ro ×4 + ancpi.ro) — monopol pe prima jumătate
6. juridice.ro — articol „extrasele se pot elibera **gratuit** prin MyTerra"
7. **myeterra.ancpi.ro** — platforma oficială gratuită
8. **ancpi.info.ro** — privat, 19 lei+TVA „rapid", ~2.500-3.000 cuvinte, disclaimer neoficial
9. **efunciara.ro** — privat, title „49 Lei | Livrare 20 Min 24/7", ~1.800-2.000 cuvinte
10. agerpres.ro — **comunicat OTS plătit** (rankează pe kw!)
11. avocatnet.ro — ghid „cum se obține **gratuit**"
13. extrasdecartefunciara.ro — EMD (exact-match domain)
14. **noi**
15. cfunciara.ro — pagina lor „extras gratuit" (unghi gratuit, iar!)

### De ce pierdem aici
1. **Intentul s-a mutat pe „gratuit"**: de când MyTerra dă extrasul de informare gratuit, Google umple SERP-ul cu oficial + ghiduri „gratuit" (3 sloturi: juridice, avocatnet, cfunciara). Sloturile comerciale au rămas ~3-4 și sunt luate de EMD-uri vechi.
2. **Preț în title împotriva noastră**: noi afișăm „89 RON" în title; efunciara „49 Lei", ancpi.info „19 lei+TVA rapid". La CTR pierdem înainte de click.
3. **EMD-uri + site-uri focusate**: efunciara/extrasdecartefunciara/cfunciara au domenii exact-match, vechime și un singur subiect. Noi suntem multi-serviciu pe domeniu abia migrat (cutover 13 iul).
4. **Fără stele în SERP** până acum (rating-ul era pe Service = invalid; fixat azi, commit 6d84852 — Product node).

## 3. SERP „certificat constatator online"

Top: onrc.ro #1 (oficial), **certificatconstatator.ro #2** (EMD, „10.000 clienți", 64,90+TVA, ~1.000 cuvinte thin), noi #3 (articol), constatator-online.ro #4, myportal #5, YouTube #6, dianex #7, certificat-constatator-instant #8, **noi #9** (serviciu). Coadă lungă de EMD-uri thin (certcons, constatatoare, certificat.cc, digigov, onrc.srl…).

### Situația reală
- Articolul „cele 4 tipuri" e un asset — prinde head-term la #3 și e citat de AI Overview.
- Pagina de serviciu e sub 3 microsituri EMD thin (sub 1.000 cuvinte, zero conținut real). Diferența nu e conținut (noi 3.200+ cuvinte), e **vechime + focus domeniu + CTR**.
- Pe „pret" suntem #2 — intentul tranzacțional matur ne găsește.

---

## 3b. Profiluri competitori (site-uri analizate individual)

### Carte funciară

| Competitor | Poziție | Preț | Promisiune | Blog/Articole | Conținut | Note |
|---|---|---|---|---|---|---|
| **efunciara.ro** | #9 | **49 lei TVA inclus** | 20 min, 24/7 | ❌ nu | ~1.800-2.000 cuvinte, FAQ | IMG DEVELOPMENT SRL; preț mic în title = arma principală |
| **ancpi.info.ro** | #8 | 74 lei+TVA / rapid **19 lei+TVA** | 10-15 min | ❌ nu | ~2.500-3.000 cuvinte, FAQ 10 | Disclaimer „nu suntem ANCPI"; social proof aproape zero |
| **extrasdecartefunciara.ro** | #13 | neafișat | 3 zile lucrătoare (!) | ❌ nu | moderat, FAQ 6 | EMD; 4,95★/153 recenzii; serviciu UNIC |
| **cfunciara.ro** | #15 | 68 lei+TVA, +19 lei/15 min | 15 min premium | ✅ „Noutăți" + suport/ghiduri | extins | **Cel mai apropiat de modelul nostru**: 25+ servicii, pagini per-județ, autorizație cadastru afișată; are pagină dedicată „extras gratuit" care rankează |
| myeterra.ancpi.ro | #7 | **GRATUIT** | instant | — | — | Oficial. Motivul mutării intentului |

### Certificat constatator

| Competitor | Poziție | Preț | Promisiune | Blog/Articole | Conținut | Note |
|---|---|---|---|---|---|---|
| **certificatconstatator.ro** | #2 | 64,90+TVA / istoric 399,90+TVA | 10 min | ❌ nu | **~800-1.000 cuvinte (THIN)** | „10.000 clienți", 6 testimoniale; EMD vechi |
| **constatator-online.ro** | #4 | neafișat | „pe loc" | ❌ nu | minimal | EMD thin |
| **dianex.ro** | #7 | n/a | 10 min | site mai mare (documente ONRC multiple) | mediu | singura firmă multi-serviciu peste noi |
| **certificat-constatator-instant.ro** | #8 | 79,99 lei | **3 minute** | ❌ (footer only) | FAQ detaliat, specimene descărcabile, 9 limbi | fără testimoniale |
| Restul cozii (#10-19) | — | — | — | ❌ | thin | certcons, constatatoare, certificat.cc, digigov, onrc.srl, certificat-onrc — EMD-uri thin |

### Concluzia profilurilor
**Competitorii NU câștigă prin conținut sau bloguri** — majoritatea sunt microsituri thin fără articole. Câștigă prin:
1. **Vechime domeniu + EMD** (exact-match: „certificatconstatator", „efunciara", „constatator-online")
2. **Preț mic afișat agresiv în title** (49 lei / 19 lei+TVA / 64,90)
3. **Promisiuni de viteză extreme** (3-20 minute)
4. **Focus mono-serviciu** = toată autoritatea domeniului pe un singur subiect

Noi avem conținut superior (3.200-4.000 cuvinte, comparații, specimene, recenzii 4.9★/450) dar domeniu multi-serviciu proaspăt migrat. Bătălia se câștigă pe CTR (title/stele), intent coverage („gratuit") și autoritate (linkuri/PR), nu pe volum de conținut suplimentar pe paginile existente.

---

## 4. Plan de acțiune

### A. Quick wins (săptămâna asta)
1. **Title CF fără preț mare**: `Extras Carte Funciară Online în 5 Minute — Fără Cont, Fără Drumuri | eGhiseul.ro`. Preț mare în title = anti-CTR când competiția afișează 19-49 lei. La constatator „de la 89 RON" e OK (competiția 64,90+TVA ≈ 77 all-in, diferență mică).
2. **Stele în SERP**: fix-ul Product schema e live — GSC → Validate fix + Request indexing pe ambele pagini. CTR boost gratuit.
3. **Secțiune „gratuit vs plătit" pe pagina CF**: onest — „poți obține gratuit prin MyTerra (cu cont, certificat, timpi); la noi fără cont, în 5 min, 24/7". Captează căutătorul de „gratuit" fără să-l mintă, și taie obiecția.

### B. Conținut (2 săptămâni)
4. **Articol dedicat: „Extras de carte funciară GRATUIT prin MyTerra — ghid + limite (2026)"** — intentul dominant al SERP-ului. juridice/avocatnet/cfunciara dovedesc că rankează. Funnel intern → serviciu. Target și „myeterra extras carte funciara".
5. **Cluster CF**: interlink agresiv articol nou ↔ pagina serviciu ↔ paginile per-județ (există toate 41) ↔ identificare-imobil. Ancore variate pe „extras carte funciară online/gratuit/urgent".
6. **Constatator — pagini/secțiuni per tip** (de bază / extins / insolvență / istoric): articolul „4 tipuri" #3 arată apetitul; long-tail-urile „certificat constatator de baza pret", „certificat constatator insolventa" sunt luabile ușor contra EMD-urilor thin.

### C. Autoritate (1-2 luni)
7. **Comunicat OTS (Agerpres/comunicatedepresa)**: ambele SERP-uri au comunicate plătite în top 15 — link + slot SERP ocupat de noi în loc de alții. Cost mic.
8. **Recenzii Google reale + volum**: certificatconstatator.ro flutură „10.000 clienți". Noi avem 450 recenzii 4.9 — afișează numărul și în copy-ul SERP (meta description) pe ambele pagini.
9. **Backlink-uri tematice**: imobiliare/juridic (storia blog, avocatnet guest, forumuri notariat) pe paginile CF; contabilitate/antreprenoriat pe constatator.

### D. De monitorizat / decizie business
10. **Prețul CF: DECIS 2026-07-13 — rămâne 89 RON.** Poziționarea = **eliberare instant, automat 24/7** (workerii Railway) — competitorii procesează manual, în program de lucru; niciunul nu livrează efectiv non-stop. Diferențiatorul se comunică în title/meta/FAQ/comparații, nu prin preț.
11. Poziții re-check în 2-3 săptămâni post-revalidare snippets (nu re-verifica zilnic).

### Executat 2026-07-13 seara (etapa 1 — CTR & poziționare 24/7)
- Title CF: `Extras Carte Funciară Online în 5 Minute — Automat, 24/7` (scos „89 RON" — anti-CTR lângă 19-49 lei ai competiției)
- Title constatator: `Certificat Constatator ONRC Online 24/7 — de la 89 RON` (păstrat prețul — suntem #2 pe „pret")
- Meta descriptions: ambele refăcute pe instant + 24/7 + noaptea/weekend + 4.9★/450 recenzii
- FAQ nou pe ambele pagini: „Pot obține … noaptea sau în weekend?" — țintește long-tail fără competiție + citabilitate AI Overview
- dateModified actualizat → semnal freshness

---

**Fișiere relevante:** `src/app/servicii/extras-de-carte-funciara/page.tsx`, `src/app/servicii/certificat-constatator-online/page.tsx`, strategia generală în `STRATEGY-2026-07-13-post-cutover.md`.

## Anexă: verificare poziții toate serviciile (14 iul 2026, incognito pws=0)

| Keyword | Poziția eghiseul | Note |
|---|---|---|
| cazier judiciar online | **#5** (homepage) + #8 (serviciu) | + CJO al nostru #3 — 3 sloturi de-ale noastre în top 10 |
| cazier fiscal online | **#5** | + CJO #2 |
| cazier auto online | **#1** (articol) + #6 (serviciu) | + CJO #2 — dominăm |
| certificat de naștere online | **#1** 🏆 | băteam centruldevize (#2 acum) |
| certificat de căsătorie online | **#1** 🏆 | |
| certificat de celibat | **#2** | centruldevize #1 |
| identificare imobil după adresă | #3 (articol) + #8 (serviciu) | |
| copie carte funciară | #5 | |
| certificat de sarcini imobil | #4 | |
| extras plan cadastral | #3 | |
| extras carte funciară colectivă | **#1** + #5 | ambele articole |
| plan de amplasament și delimitare | ABSENT (pagina indexată) | keyword de firme de cadastru locale — pagină tânără, are nevoie de conținut+linkuri |
| copie arhivă OCPI | #18 (pagina greșită) | pagina proprie indexată dar nu rankează încă |
| certificat dețineri imobile | NEINDEXATĂ → **request indexing cerut 14 iul** | |

**Concluzie:** portofoliul rankează excelent (5 poziții #1-#2). Slabe doar 3 pagini topograf foarte tinere (sub 3 săpt): plan-amplasament, copie-arhiva-ocpi, certificat-detineri. Acțiuni: indexare cerută (dețineri), restul = timp + interlinking din articolele CF (deja făcut parțial) — re-check la 27 iul odată cu CF/constatator.

---

## Update 31 iul 2026: anatomia dianex.ro și cfunciara.ro (cerut de Raul)

### dianex.ro (constatator #7) — puterea NU vine din articole

Sitemap complet analizat (168 articole + ~120 pagini):
- **Blogul lor e despre ALTCEVA**: contabilitate, PFA, SSM, case de marcat. Pe constatator
  au DOAR 3 articole subțiri (cum obții, tipurile, PF) din 2025, neactualizate.
- **Puterea = arhitectura de servicii ONRC**: 30+ pagini de serviciu interconectate —
  înființări (SRL/PFA/ONG/IF), TOATE mențiunile (schimbare sediu/denumire/CAEN/administrator,
  cesiune, majorare capital, suspendare/reluare/radiere, punct de lucru), documente ONRC.
  Domeniul întreg „respiră" registrul comerțului → relevanță topică pe care Google o
  răsplătește la constatator, deși pagina lor în sine nu-i specială.
- Sunt firmă reală de contabilitate (Ploiești, top CECCAR) = E-E-A-T de business real.

**Lecție pentru noi:** nu-i batem copiindu-le blogul (n-au blog pe subiect). Diferența lor
= lățimea serviciilor ONRC. Opțiuni: (a) acceptăm — noi nu facem mențiuni ONRC; (b) construim
lățimea prin CONȚINUT (ghiduri: schimbare sediu, radiere, suspendare — fără să vindem
serviciul, cu CTA pe constatator/cazier fiscal, care se cer în fix procesele alea). Varianta
(b) = cluster ONRC de 6-8 ghiduri, cost doar timp de scris.

### cfunciara.ro (CF #15 head, dar mașină de long-tail) — programmatic pe geografie

Sitemap: **~1.500 URL-uri**, fără lastmod, toate changefreq=daily:
- Matrice serviciu × județ/oraș pentru TOATE serviciile topograf (extras CF, copie
  intabulare, certificat sarcini, plan cadastral, inventar coordonate, plan amplasament,
  releveu, identificare după adresă, copie contract v-c — fix portofoliul nostru din
  migrarea 084!).
- **Pagini per instituție: OCPI și BCPI pentru fiecare birou** — „OCPI Cluj", „BCPI Turda"
  etc. Cerere locală+instituțională pe care noi n-o atingem deloc.
- Pe head terms NU domină (#15) — 1.500 de pagini le aduc long-tail-ul, nu head-ul.

**Lecție pentru noi:** modelul serviciu×județ îl avem doar pe extras CF (42 pagini).
Extinderea pe TOATE serviciile topograf = capcana quality-gates (30+ pagini/serviciu ×
14 servicii = mii de pagini thin — exact ce ne-am interzis în location-seo-scope).
Ce MERITĂ copiat, țintit:
1. **Pagini OCPI per județ (42)** — „OCPI [Județ]: program, contact, taxe, cum obții
   extrasul online" — informațional-instituțional, se leagă natural de paginile CF
   județene EXISTENTE (pereche ghid↔serviciu), cerere reală („ocpi cluj program").
   Pilot pe 5 județe mari înainte de rollout.
2. Identificare după adresă per oraș — DOAR dacă pilotul OCPI performează.

### Ce NU s-a schimbat
Concluziile din 13-14 iul rămân: portofoliul nostru rankează bine pe long-tail
(5× #1-#2), problema e head terms (extras CF, constatator) = autoritate → linkurile
plătite trimise pe 31 iul + timpul.
