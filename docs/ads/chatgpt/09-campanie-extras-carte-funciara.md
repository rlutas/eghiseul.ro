# Campania extras de carte funciară

Scrisă și **pornită 17.09.2026**, pe politica OpenAI **v1.6 (10.09)**. Campania de constatator
e în `04-campanie-constatator.md`; aici se repetă doar ce diferă.

---

## ⏱️ Verificarea de fiecare zi — începe de aici

1. **Ads Manager → Campaigns**: notează, pentru `OAI_Click_ExtrasCF_2026-09`, **clicurile** și
   **cheltuiala**. Dacă statusul e încă `Not serving`, singurul motiv acceptabil e
   „Ad is in review"; orice alt motiv se scrie în jurnalul de la secțiunea M.
2. **Rulează**, cu cifrele de mai sus:
   ```bash
   node scripts/check-chatgpt-ads.mjs --spend-eur <cheltuiala> --clicks <clicuri>
   ```
   Îți dă comenzile atribuite pe anunț, CPC-ul efectiv, conversia clic → comandă și CPA-ul,
   comparat automat cu ținta de 20 de lei și cu pragul de rentabilitate de 50.
3. **Vercel Analytics**, ultimele 24 de ore, filtru pe referrer `chatgpt.com`: compară numărul
   de sesiuni cu clicurile facturate. 🔴 **Peste 30% diferență = oprește campania**, indiferent
   ce arată restul. Vezi secțiunea K și `10-research-practicieni-2026-09.md`, secțiunea 6.

Pragurile de decizie și criteriile de oprire sunt în secțiunea K. Nu improviza peste ele:
sunt scrise ca să oprească devreme, cu pierderea maximă plafonată la €100.

---

## A. De ce acest serviciu

Extrasul de carte funciară e cel mai mare serviciu al nostru dintre cele **fără avocat în
flux**, deci singurul cu volum real care e eligibil pe ChatGPT Ads. Ultimele 90 de zile:

| Serviciu | Comenzi plătite | Venit (lei) | Preț mediu | Conversie din draft |
|---|---|---|---|---|
| Extras carte funciară | 143 | 13.309 | 93 | 29,7% |
| Certificat constatator | 66 | 6.272 | 95 | 63,5% |
| Identificare imobil | 25 | 4.930 | 197 | 28,1% |

Dublu față de constatator, la același preț. Cererea există și în afara Google: în ultimele 30
de zile Bing a adus 8 comenzi plătite, iar ChatGPT organic 2, fără să plătim nimic.

## B. Aritmetica — de aici pornește tot

| Linie | Lei |
|---|---|
| Preț de listă (TVA 21% inclus) | 89,00 |
| Net după TVA | 73,55 |
| Taxa ANCPI (media reală pe 149 de comenzi înregistrate) | −20,67 |
| Procesare card (≈1,4% + 1 leu) | −2,25 |
| **Marjă brută pe comandă** | **≈ 50,60** |

Pragul de **rentabilitate** e un CPA de ~50 lei. Dar rentabil nu înseamnă util: la 50 de lei
reclamă pe comandă nu ne rămâne nimic.

🎯 **Ținta stabilită de Raul (17.09): CPA maximum 20 lei.** Adică **€3,92** la 5,1 lei/euro,
și ne rămân ~30 de lei pe comandă. Ăsta e numărul după care se judecă totul mai jos, nu cei 50.

Ce înseamnă în clicuri, la cele trei CPC-uri relevante:

| CPC | Clicuri per 20 lei | Conversie clic → comandă plătită necesară |
|---|---|---|
| €0,57 (cheltuială ÷ clicuri, observat la noi) | 6,9 | **14,5%** |
| €1,47 (Avg CPC afișat de platformă) | 2,7 | **37,5%** |
| €3,00 (media raportată în SUA) | 1,3 | **76,5%** |

Cifra de 29,7% din tabelul de sus e conversie **draft → plată**, nu clic → plată, deci nu se
compară direct. Clic → comandă începută e necunoscuta pe care campania asta o măsoară.
La 23 de clicuri pe constatator am avut 0 drafturi, deci nu avem încă nicio estimare.

**Cum arată asta față de restul lumii.** Cea mai bună rată de conversie raportată de cineva pe
canalul ăsta e **2,35%**, la un magazin online care a cheltuit 60.000 $. Patru teste
independente pe servicii și lead-gen au raportat **zero** conversii. La 2,35% și un CPC de 3 $,
o comandă ne-ar costa 115 EUR pentru 18 EUR venit. Detaliile și sursele sunt în
`10-research-practicieni-2026-09.md`.

Singurul lucru care ține aritmetica deschisă e că **noi nu plătim prețurile alea**. Pe
constatator am plătit 13,19 € pentru 23 de clicuri, adică **0,57 € efectiv**, de cinci ori mai
ieftin decât cei 2,77–3,50 $ raportați în SUA. România e inventar ieftin. Asta nu garantează
nimic, dar mută pragul din „imposibil" în „de măsurat".

### Verdictul onest, înainte de a cheltui un leu

La CPA 20 de lei avem nevoie de **14,5% conversie din clic în comandă plătită**, și doar dacă
CPC-ul rămâne la 0,57 €. Cea mai bună conversie raportată vreodată pe canalul ăsta e 2,35%.
Cerem de șase ori mai mult decât recordul, pe un buget de 20 € pe zi, într-o piață fără date.

Dacă CPC-ul urcă la valoarea afișată de platformă, 1,47 €, ținta devine 37,5%, ceea ce nu
există în publicitate plătită la produse de 89 de lei.

**Deci mergem cu așteptarea că pierdem bani, și cu pierderea dimensionată dinainte.** Rezultatul
util al testului nu e un plan de scalare, ci un **nu ieftin și rapid**. Vezi criteriile de
oprire de la secțiunea K — sunt scrise ca să oprească devreme, nu ca să justifice continuarea.

Un singur lucru ar schimba calculul complet: dacă se confirmă că platforma ne facturează
clicuri care nu ajung pe site (vezi secțiunea J), atunci CPC-ul real pe vizitator e mult mai
mare decât 0,57 € și canalul e închis din start. Asta se află în primele 3 zile.

⚠️ Nu porni cu așteptarea că se face profit pe prima comandă. **Recurența e slabă**: din 138 de
clienți de extras CF în 180 de zile, doar 5 au revenit, adică 3,6%. Nu e produs de abonament,
deci fiecare comandă trebuie să se susțină singură.

## C. 🔴 Blocant înainte de pornire: automatizarea ANCPI e moartă din 20 august

Pagina promite, în erou și în FAQ, extrasul **„în câteva minute, automat, 24/7"**. Asta nu mai
e adevărat.

Ce arată baza de date:

- Ultimul job ANCPI creat: **20.08.2026, ora 20:37**. De atunci, **zero** joburi noi.
- Toate cele 11 joburi din ultimele 30 de zile sunt `NEEDS_OPERATOR`, cu 4 reîncercări fiecare
  și aceeași eroare: `page.goto: net::ERR_NAME_NOT_RESOLVED at https://oassl.ancpi.ro/openam`.
- Din 116 joburi din istoric, doar 7 s-au terminat vreodată cu `DONE`, toate în iulie, cu o
  mediană de 3,6 minute. Restul, 109, sunt `NEEDS_OPERATOR`.
- Între timp s-au plătit **27 de comenzi de extras CF după 21 august**, toate livrate manual.

Pentru comparație, ONRC merge: 11 joburi `DONE` în septembrie, 28 în august.

**Cauza nu e la noi.** Gazdele ANCPI nu mai există în DNS. Verificat pe 17.09 cu resolverele
publice Cloudflare și Google:

| Gazdă | Rezultat |
|---|---|
| `oassl.ancpi.ro` (autentificare) | NXDOMAIN |
| `epay.ancpi.ro` (portal comenzi) | NXDOMAIN |
| `myeterra.ancpi.ro` (varianta gratuită) | NXDOMAIN |
| `ancpi.ro` | rezolvă normal |

Deci nu e un bug de worker și nu se repară cu un deploy. ANCPI a scos din DNS toată
infrastructura de servicii online. Avaria e înregistrată la noi din **13.07.2026** și e încă
deschisă: `/api/status/?service=ancpi` întoarce `operational: false`, cu `outageSince`
13 iulie, iar ONRC întoarce `operational: true`.

Partea bună, și contează: **site-ul deja spune adevărul**. Componenta `SystemStatus` de pe
pagina de serviciu arată vizitatorului că portalul ANCPI e picat înainte să plătească. Partea
proastă e că același ecran conține, mai sus, promisiunea „în câteva minute, automat, 24/7".
Un vizitator care citește ambele nu știe ce să creadă, iar un reviewer OpenAI citește
promisiunea.

⚠️ Pagina mai trimite clientul la două domenii care nu mai există: „verifică autenticitatea pe
portalul ANCPI (epay.ancpi.ro)" și descrierea variantei gratuite „prin platforma MyeTerra
(myeterra.ancpi.ro)". Mai apar și în `/extras-carte-funciara-gratuit/`. De corectat separat de
campanie, dar de corectat.

Timpul real de livrare, măsurat pe comenzile de după 14.09 (de când există `completed_at`):
comenzile plătite dimineața se închid în 53–123 de minute, cele plătite seara abia a doua zi
dimineață, la 946–1176 de minute. Tiparul e de om care lucrează în program, nu de robot.

**Trei consecințe, în ordinea importanței:**

1. **Nu putem cumpăra trafic pe o promisiune de minute.** „Misleading or deceptive ads"
   acoperă explicit „unfounded claims about capabilities, pricing, **outcomes**". Reviewul
   OpenAI citește landingul cu un model de limbaj; promisiunea e chiar în primul paragraf.
2. E o problemă de client, nu doar de reclamă. Omul care plătește seara așteptând „câteva
   minute" primește documentul dimineața.
3. Costul intern crește. La marjă de 50 de lei, fiecare comandă procesată manual mănâncă din ea.

### ✅ Rezolvat, 17.09 — blocantul e ridicat

Raul a confirmat termenul real: **nu se mai eliberează automat, dar documentul ajunge în
maximum 2 zile lucrătoare, de regulă chiar în aceeași zi lucrătoare.** Asta se potrivește cu
măsurătoarea din baza de date, și era deja adevărul din DB: `services.estimated_days = 2`,
`estimated_days_display = "2 zile lucrătoare"`. Doar pagina de marketing rămăsese în urmă.

Corectate pe `/servicii/extras-de-carte-funciara/`, 19 locuri:

- titlul paginii, „Online în 5 Minute — Automat, 24/7" → „pe Email în Max. 2 Zile Lucrătoare";
- meta description, descrierea din schema, eroul, lista de pași, cardul de livrare, statistica
  „Câteva minute / Eliberare automată 24/7", secțiunea de urgență, comparativul, 3 întrebări
  din FAQ;
- „**Eliberăm** extrase de carte funciară" → „**Obținem**". Noi obținem, instituția eliberează;
- „verifică autenticitatea pe portalul ANCPI (epay.ancpi.ro)" → formulare fără domeniul mort.

Rămân de curățat separat, în afara campaniei: referințele la `myeterra.ancpi.ro` din pagina de
serviciu și din `/extras-carte-funciara-gratuit/`. Domeniul nu mai există, deci descriem o
alternativă gratuită care nu mai e accesibilă.

Anunțurile din secțiunea F rămân **fără nicio promisiune de timp**: dacă robotul revine,
textele nu trebuie rescrise.

## D. Structura

```
Campanie: OAI_Click_ExtrasCF_2026-09   (obiectiv: Clicks | geo: România)
  buget: €20/zi | fără dată de final | bid pornire €1,95, ca la constatator
  ├── AG1  Verificare proprietate   — T3+D2   landing: /servicii/extras-de-carte-funciara/
  ├── AG2  Tranzacție / notar       — T1+D5   aceeași pagină
  └── AG3  Fără cont ANCPI          — T5+D3   aceeași pagină
```

Pornim cu **AG1 singur**. AG2 și AG3 intră după 5 zile, ca să nu împărțim €20/zi în trei și să
nu învățăm nimic din niciunul. Lecția de pe constatator: campania a stat 14 zile fără să
difuzeze, iar când a pornit tot bugetul a mers într-un singur ad group și tot n-a atins pragul.

## E. Context hints

Situații, nu cuvinte cheie. În română, la nivel de ad group.

**AG1 — Verificare proprietate**
```
Utilizatorul vrea să afle cine este proprietarul actual al unui imobil, dacă o casă sau un teren
are ipotecă, sarcini, litigii sau interdicții, sau dacă un apartament este intabulat. Întreabă
cum verifică un imobil înainte să dea avans, cum află suprafața reală sau vecinătățile, ce
document arată situația juridică a unei proprietăți, cum verifică dacă vânzătorul chiar e
proprietar. Cuvinte: extras de carte funciară, extras CF, carte funciară, număr cadastral,
intabulare, sarcini, ipotecă, proprietar imobil, verificare apartament, OCPI, ANCPI.
```

**AG2 — Tranzacție, notar, bancă**
```
Utilizatorul cumpără sau vinde un imobil și întreabă ce acte îi cere notarul la autentificare,
ce documente cere banca pentru un credit ipotecar sau o refinanțare, ce acte trebuie la
antecontract, la dezbaterea unei succesiuni, la partaj sau la donație. Menționează „extras de
carte funciară pentru autentificare", „extras CF nu mai vechi de 30 de zile", „extras de
informare". Cuvinte: acte vânzare apartament, credit ipotecar documente, notar acte imobil,
succesiune acte, antecontract, extras carte funciară notar.
```

**AG3 — Fără cont ANCPI**
```
Utilizatorul a încercat să obțină singur extrasul de carte funciară și s-a blocat: îi cere cont
ROeID, semnătură electronică calificată, verificare la birou, sau nu reușește pe platforma
MyeTerra ori pe portalul ePay al ANCPI. Întreabă dacă se poate obține extrasul fără cont, dacă
există variantă gratuită și ce diferență e față de cea contra cost. Cuvinte: MyeTerra, ROeID,
epay ANCPI, extras carte funciară online, extras CF gratuit, cont ANCPI.
```

⚠️ AG3 e cel mai atrăgător ca intenție și cel mai periculos ca marjă: omul care caută „gratuit"
are șanse mari să nu plătească 89 de lei. Se pornește ultimul și se judecă separat.

## F. Anunțuri

Limitele tehnice sunt 50 de caractere la titlu și 100 la descriere, **dar cardul taie mult mai
devreme: pe la 24, respectiv 48**. Vezi `10-research-practicieni-2026-09.md`, secțiunea 3 — e
cea mai ieftină îmbunătățire raportată pe canal, un practician raportează dublarea CTR-ului
doar din rescrierea textului ca să încapă înainte de tăietură.

Deci coloana care contează e „ce se vede", nu numărul total de caractere. Textele de mai jos
sunt construite invers: mesajul se termină înainte de caracterul 24, restul e bonus.

**Niciunul nu promite un termen de livrare**, din motivul de la secțiunea C.

| # | Titlu | Total | Ce se vede realist |
|---|---|---|---|
| T1 | Extras carte funciară online | 28 | „Extras carte funciară on" |
| T2 | Extras CF, 89 lei, pe email | 27 | „Extras CF, 89 lei, pe em" |
| T3 | Cine e proprietarul imobilului? | 31 | „Cine e proprietarul imob" |
| T4 | eGhișeul: extras carte funciară | 31 | „eGhișeul: extras carte f" |
| T5 | Extras CF fără cont ANCPI | 25 | „Extras CF fără cont ANCP" |
| T6 | 89 lei: extras carte funciară | 29 | „89 lei: extras carte fun" |

T4 e acolo ca test deliberat: în singurul test controlat publicat, titlul care începe cu
numele brandului a bătut varianta fără brand, 1,1% față de 1,0% CTR, la un CPC mai mic. E
invers față de obiceiul din Google Search, deci merită verificat pe noi.

| # | Descriere | Total | Ce se vede realist |
|---|---|---|---|
| D1 | Numărul cadastral, plata, extrasul pe email. Taxe ANCPI incluse, 89 lei. | 72 | „Numărul cadastral, plata, extrasul pe email. Tax" |
| D2 | Proprietar, suprafață, sarcini, ipoteci. 89 lei, taxe ANCPI incluse. | 68 | „Proprietar, suprafață, sarcini, ipoteci. 89 lei," |
| D3 | Fără cont ANCPI și fără drum la ghișeu. 89 lei, taxele incluse. Serviciu privat. | 80 | „Fără cont ANCPI și fără drum la ghișeu. 89 lei, " |
| D4 | Pentru notar, bancă sau vânzare. 89 lei, taxe incluse, documentul pe email. | 75 | „Pentru notar, bancă sau vânzare. 89 lei, taxe in" |
| D5 | Ai doar numărul cadastral? Ajunge. 89 lei, taxe ANCPI incluse, pe email. | 72 | „Ai doar numărul cadastral? Ajunge. 89 lei, taxe " |

Numărătoarea e verificată programatic, pe caractere Unicode, nu din ochi: diacriticele contează
ca un caracter, dar în română 24 de caractere înseamnă trei cuvinte.

Nume advertiser: **eGhișeul.ro**.

Interzise aici, ca peste tot pe canal: *oficial* lângă *document/act*, *avocat*, *juridic*,
*garantat*, *instant*, *cel mai*, *gratuit* (taxa există), *eliberăm/emitem*. Verbele corecte:
**obținem, depunem cererea, primești**. Prețul din anunț = prețul de pe pagină.

## G. Imagine

`assets/ad-extras-cf-1024.png` — 1024×1024, generată 17.09 în același stil cu cea de
constatator: document stilizat pe fundal bleumarin, bifă aurie, semnătura „eGhișeul.ro ·
Serviciu privat · pe email".

**Deliberat NU folosim specimenul real** (`public/images/specimens/extras-cf.png`): are antetul
ANCPI/OCPI, iar o reclamă cu antetul instituției intră direct în „Scams & fraud: ads that
impersonate individuals, brands, **official entities**, or trusted services". Aceeași logică
pentru care imaginea de constatator n-are sigla ONRC.

Logo de cont: `assets/eghiseul-favicon-128.png`, deja încărcat.

## H. URL-uri finale

`Link` (câmp separat de tracking):
```
https://eghiseul.ro/servicii/extras-de-carte-funciara/
```

`Tracking parameters`:
```
utm_source=chatgpt&utm_medium=cpc&utm_campaign=extras-cf-2026-09&utm_content=ag1-verificare&oai_ref={oppref}
```
(pentru AG2 și AG3, `utm_content=ag2-tranzactie` respectiv `ag3-fara-cont`)

⚠️ **`oppref` nu se scrie.** E parametru rezervat, îl adaugă OpenAI singur, iar salvarea lui
manuală e respinsă cu `Reserved query parameters are not supported: olref, oppref.` Folosim
`oai_ref={oppref}`, iar `attribution.ts` citește ambele nume.

Domeniul e `eghiseul.ro`, fără `www`, cu slash final. Verificat: URL-ul întoarce 200 fără
redirect; varianta fără slash dă 308 care păstrează query-ul.

## I. Licitare și buget

- Obiectiv **Clicks**, bid **Manual**, ca pe constatator. NU „Conversion optimization with
  impression billing", oricât o recomandă OpenAI: optimizarea pe conversii are nevoie de semnal,
  iar contorul nostru de conversii e 0. Plata pe afișări fără dovadă de conversie înseamnă să
  plătim tot inventarul.
- Bid de pornire **€1,95**. Sub ~€1,95 Ads Manager a arătat „May not deliver" pe constatator, iar
  CPC-ul real a ieșit oricum mult sub bid (€13,19 pe 23 de clicuri = €0,57 efectiv).
  ⚠️ Practicienii din SUA descriu un prag de livrare pe la 3 $ sub care afișările dispar tăcut,
  iar un practician din UE spune că a avut o afișare pe zi până a urcat biduri de 8 ori. **Pe noi
  nu s-a confirmat**: la €1,95 livrăm, și plătim o treime din bid. Dacă extrasul CF nu livrează
  în 3 zile, prima mișcare e bidul, nu textul.
- Buget **€20/zi**, fără dată de final. Nu se crește în primele 7 zile, indiferent de rezultate.
  ⚠️ **Bugetul zilnic e o medie pe 7 zile, nu un plafon.** Poate lua **2× într-o zi și 7× într-o
  săptămână**, deci €40 mâine și €140 săptămâna asta. Explică parțial de ce pe constatator
  cardul a fost debitat cu €15 plus un sold de €10,63 în timp ce raportul arăta €13,19.
  Și **nu** pune buget total pe campanie ca metodă de frânare: e limită de cheltuială, nu de
  ritm, iar un advertiser din SUA a consumat 500 $ de buget total în circa o oră.
- Fereastra de atribuire pe coloane: **30 de zile clic, 0 zile view**, ca să se potrivească cu
  evenimentul `order_created` care e deja configurat pe 30 de zile.

## J. Măsurare

Se judecă pe `orders.attribution`, nu pe ce zice platforma. Interogarea zilnică:

```sql
select order_number, status, payment_status, total_price,
       attribution->'last'->>'utm_content' as ad_group,
       attribution->'last'->>'oppref'      as oppref,
       attribution->'last'->>'landing'     as landing,
       created_at
from orders
where attribution::text ilike '%extras-cf-2026-09%'
order by created_at desc;
```

Patru lucruri se urmăresc, în ordine:

1. 🔴 **Clicurile facturate ajung pe site?** Zilnic, de la prima zi: numărul de clicuri din
   Ads Manager față de sesiunile cu referrer `chatgpt.com` din Vercel Analytics. Două conturi
   independente din SUA au găsit că doar 13%, respectiv ~35% din clicurile facturate ajungeau
   la ei. Dacă diferența trece de 30%, oprim. Asta explică și cele 23 de clicuri fără niciun
   draft de pe constatator, mult mai bine decât „n-a vrut nimeni să comande".
2. **Apar drafturi?** Primul semn că extrasul e altfel e un draft cu
   `utm_campaign=extras-cf-2026-09`. Până acolo, nu discutăm CPA.
3. **Vine `oppref`?** Dacă un draft are `oai_ref` dar nu `oppref`, adăugarea automată a OpenAI
   nu ajunge la noi și atribuirea lor pe clic nu se va închide niciodată.
4. **CPA real**, abia după primele comenzi plătite, comparat cu ținta de 20 de lei.

⚠️ Cifrele din platformă nu se iau de bune în primele zile. Pe constatator, „Spend" arăta €13,19
în timp ce cardul fusese debitat cu €15 plus un sold de €10,63, iar „Avg CPC" arăta €1,47 deși
cheltuiala împărțită la clicuri dă €0,57. Tot ce e marcat „Preliminary" se recitește după 2–3 zile.

De segmentat, folosind funcția nouă din 17.09: **platformă** (Android app / Android web /
desktop web / iOS app / iOS web). Ipoteza de verificat e că traficul din aplicația mobilă nu
convertește, fiindcă wizardul e greu în browserul din aplicație. Dacă se confirmă, excludem
aplicațiile și rămânem pe web.

## K. Criterii de decizie

Se evaluează la **ziua 14**, sau mai devreme dacă se atinge un prag.

Pierderea maximă acceptată pentru tot testul: **€100**, adică 5 zile la €20. Nu se depășește
fără o comandă plătită atribuită.

| Situație | Acțiune |
|---|---|
| CPA ≤ 20 lei | ținta e atinsă: buget €40/zi, pornim AG2 |
| CPA 20–35 lei | rentabil dar sub țintă: ținem €20/zi încă 7 zile și tăiem din CPC (bid mai mic, text pe trunchiere) |
| CPA 35–50 lei | mai bine decât nimic, dar nu e afacere: doar dacă restul semnalelor sunt bune |
| CPA > 50 lei | sub pragul de rentabilitate: oprim AG-ul |
| **100 clicuri și 0 comenzi plătite** | **oprim.** La 14,5% țintă, 100 de clicuri fără nicio comandă închid discuția statistic |
| **Clicurile facturate depășesc sesiunile verificate cu peste 30%** | **oprim imediat.** Plătim trafic care nu ajunge la noi; niciun text nu repară asta |
| 0 afișări după 3 zile | urcăm bidul la €3 pentru 3 zile; dacă tot nimic, notăm „nu se livrează la marja noastră" și oprim |

Al doilea criteriu e cel mai important și cel mai ușor de ratat. Două conturi independente din
SUA au măsurat că doar **13%**, respectiv **~35%** din clicurile facturate au ajuns efectiv pe
site. Dacă și la noi e așa, CPC-ul real pe vizitator nu e 0,57 € ci 1,6–4,4 €, iar canalul e
închis indiferent ce scriem în anunț.

## L. Checklist înainte de pornire

- [x] Promisiunea de timp corectată pe landing (secțiunea C)
- [x] `OAI-AdsBot/1.0` nu e blocat — testat 17.09, întoarce HTTP 200 pe pagina de serviciu, cu
      același conținut ca un browser. `robots.txt` nu are regulă pe el, deci intră pe `User-Agent: *`
      care permite `/servicii/`. De reverificat dacă se adaugă vreodată WAF sau rate-limiting
- [x] Imaginea 1024×1024 generată, fără însemne ANCPI
- [x] Textele scrise pe pragul de trunchiere, nu pe limita de caractere
- [x] Creată campania `OAI_Click_ExtrasCF_2026-09`, Clicks, România, €20/zi
- [x] Text customization **Off** (era pornit implicit)
- [x] AG1 cu hint-ul din D, `Link` + `Tracking parameters` din H, Max CPC €1,95
- [x] Două anunțuri, imagine `ad-extras-cf-1024.png`
- [x] Evenimentul `Order CreatedPurchase` legat de campanie la creare
- [ ] Setează coloanele pe 30 de zile clic / 0 view
- [ ] Test în incognito pe URL-ul cu UTM: verifică în `/admin/orders` că draftul are
      `attribution.last.utm_campaign = extras-cf-2026-09`
- [ ] Zilnic: clicuri din Ads Manager față de sesiuni `chatgpt.com` în Vercel Analytics

## M. Jurnal

| Data | Ce s-a întâmplat |
|---|---|
| 17.09 | Campania scrisă. Imaginea generată. FAQ-ul cu „Eliberăm" corectat. Descoperit blocantul: automatizarea ANCPI e moartă din 20.08, 27 de comenzi livrate manual, iar pagina promite „câteva minute, automat, 24/7". Campania NU s-a pornit; așteaptă decizia de la secțiunea C. |
| 17.09 13:50 | **PORNITĂ.** Raul a confirmat termenul real (maximum 2 zile lucrătoare, de regulă aceeași zi) și a dat undă verde. Landingul corectat în 19 locuri, plus descrierea serviciului din DB. Campania creată în Ads Manager: `OAI_Click_ExtrasCF_2026-09`, Standard, obiectiv **Clicks**, România, toate cele 5 platforme, **€20/zi**, fără dată de final, eveniment de conversie `Order CreatedPurchase` legat de la creare. Un singur ad group, `AG1 Verificare proprietate`, **Max CPC €1,95** cu indicator „Strong Delivery", hint-ul din secțiunea E cu adaosul despre notar și bancă. **Două anunțuri**, ambele cu imaginea noastră: `Ad1 T3-D2 proprietar` („Cine e proprietarul imobilului?") și `Ad2 T4-D4 brand primul` („eGhișeul: extras carte funciară"), diferențiate în DB prin `utm_term=t3d2-intrebare` și `t4d4-brand`. Status la creare: **`Not serving` cu UN SINGUR motiv, „Ad is in review"** — spre deosebire de constatator, care avea patru motive și a stat 14 zile; contul e deja trecut prin brand review. |
| | ⚠️ **Două lucruri de reținut din procesul de creare.** (1) Obiectivul implicit era **Conversions cu facturare pe afișări**, adică exact oCPM pe care research-ul îl descrie ca prematur la zero conversii; a trebuit schimbat manual pe Clicks. (2) Formularul a **pre-populat automat anunțul** din pagina de destinație, inclusiv cu o imagine trasă de pe landing care era **specimenul real de extras cu antet ANCPI**. Aia e fix „Scams & fraud: impersonate official entities". Am scos-o și am urcat imaginea noastră stilizată. Bugetul implicit era €65/zi, iar Text customization pornit. **Nimic din ce propune platforma implicit nu era ce voiam.** |
| | Confirmat la creare, cu cifrele lor: la €20/zi, „maximum daily spend is €40.00, maximum seven-day spend is €140.00" — exact 2× și 7×, cum spune research-ul. |
