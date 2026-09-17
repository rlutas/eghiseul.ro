# Campania extras de carte funciară — gata de introdus

Scrisă 17.09.2026, pe politica OpenAI **v1.6 (10.09)**. Campania de constatator e în
`04-campanie-constatator.md`; aici se repetă doar ce diferă.

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

Deci **pragul de rentabilitate e un CPA de ~50 lei, adică ~€9,90** la 5,1 lei/euro. Mai
larg decât la constatator (≈40 lei), dar tot îngust.

Ce înseamnă asta în clicuri, la cele două CPC-uri pe care le-am văzut pe constatator:

| CPC | Clicuri per 50 lei | Conversie clic → comandă plătită necesară |
|---|---|---|
| €0,57 (cheltuială ÷ clicuri) | 17,4 | **5,7%** |
| €1,47 (Avg CPC afișat de platformă) | 6,7 | **14,9%** |

Cifra de 29,7% din tabelul de sus e conversie **draft → plată**, nu clic → plată, deci nu se
compară direct. Clic → comandă începută e necunoscuta pe care campania asta o măsoară.
La 23 de clicuri pe constatator am avut 0 drafturi, deci nu avem încă nicio estimare.

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

**Recomandarea mea: varianta B, și campania pornește azi pe textul corectat.** Varianta A nu
depinde de noi, iar avaria durează de 66 de zile. Cele 27 de comenzi livrate manual arată că
serviciul funcționează; doar promisiunea e greșită.

**Decizia rămâne a lui Raul. Cele două variante:**

- **Varianta A, reparăm robotul.** Nu depinde de noi: gazdele nu există în DNS. Singurele căi
  sunt să aflăm de la ANCPI noua adresă a portalului pentru profesioniști, sau să mutăm robotul
  pe ruta manuală pe care echipa o folosește deja de 27 de comenzi. Până atunci, varianta A nu
  e disponibilă.
- **Varianta B, spunem adevărul.** Înlocuim „în câteva minute, automat, 24/7" cu termenul real,
  de tipul „de obicei în aceeași zi lucrătoare". Pierdem un argument de vânzare, dar câștigăm
  o pagină care trece reviewul și un client care nu se simte păcălit.

Anunțurile din secțiunea E sunt scrise deliberat **fără nicio promisiune de timp**, ca să fie
valabile în ambele variante.

> ✅ Reparat deja, 17.09: întrebarea din FAQ „Pot obține extrasul pentru un imobil din alt
> județ?" începea cu „**Eliberăm** extrase de carte funciară". Noi obținem, instituția
> eliberează. Schimbat în „Obținem".

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

Titlu ≤ 50 caractere, descriere ≤ 100, esențialul în primele 24 respectiv 48.
**Niciunul nu promite un termen de livrare**, din motivul de la secțiunea C.

| # | Titlu | Caractere |
|---|---|---|
| T1 | Extras de carte funciară pe email | 33 |
| T2 | Extras carte funciară, 89 lei | 29 |
| T3 | Cine e proprietarul? Extras CF | 30 |
| T4 | Verifici un imobil? Extras CF online | 36 |
| T5 | Extras CF fără cont ANCPI | 25 |
| T6 | Extras de carte funciară online | 31 |

| # | Descriere | Caractere |
|---|---|---|
| D1 | Completezi numărul cadastral, plătești, primești extrasul pe email. Taxe ANCPI incluse. | 87 |
| D2 | Proprietar, suprafață, sarcini și ipoteci. 89 lei, taxe incluse. Serviciu privat. | 81 |
| D3 | Fără cont ANCPI, fără semnătură electronică, fără drum la ghișeu. 89 lei, pe email. | 83 |
| D4 | Ai nevoie de numărul cadastral sau CF și localitatea. Restul îl facem noi. 89 lei. | 82 |
| D5 | Pentru notar, bancă sau vânzare. Extrasul CF pe email, 89 lei cu taxele incluse. | 80 |

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
- Buget **€20/zi**, fără dată de final. Nu se crește în primele 7 zile, indiferent de rezultate.
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

Trei lucruri se urmăresc, în ordine:

1. **Apar drafturi?** Pe constatator, 23 de clicuri au dat 0 drafturi. Primul semn că
   extrasul e altfel e un draft cu `utm_campaign=extras-cf-2026-09`. Până acolo, nu discutăm CPA.
2. **Vine `oppref`?** Dacă un draft are `oai_ref` dar nu `oppref`, adăugarea automată a OpenAI
   nu ajunge la noi și atribuirea lor pe clic nu se va închide niciodată.
3. **CPA real**, abia după primele comenzi plătite.

⚠️ Cifrele din platformă nu se iau de bune în primele zile. Pe constatator, „Spend" arăta €13,19
în timp ce cardul fusese debitat cu €15 plus un sold de €10,63, iar „Avg CPC" arăta €1,47 deși
cheltuiala împărțită la clicuri dă €0,57. Tot ce e marcat „Preliminary" se recitește după 2–3 zile.

De segmentat, folosind funcția nouă din 17.09: **platformă** (Android app / Android web /
desktop web / iOS app / iOS web). Ipoteza de verificat e că traficul din aplicația mobilă nu
convertește, fiindcă wizardul e greu în browserul din aplicație. Dacă se confirmă, excludem
aplicațiile și rămânem pe web.

## K. Criterii de decizie

Se evaluează la **ziua 14**, sau mai devreme dacă se atinge un prag.

| Situație | Acțiune |
|---|---|
| CPA ≤ 35 lei | scalăm: buget €40/zi, pornim AG2 și AG3 |
| CPA 35–50 lei | ținem €20/zi încă 14 zile, adăugăm AG2 (notar/bancă, intenție mai comercială) |
| CPA > 50 lei | sub pragul de rentabilitate: oprim AG-ul respectiv |
| ≥ 150 clicuri și 0 comenzi plătite | oprim campania și scriem concluzia aici; înseamnă că traficul din ChatGPT nu cumpără documente la 89 de lei, ceea ce e un răspuns valoros și pentru constatator |
| 0 afișări după 3 zile | urcăm bidul la €3 pentru 3 zile; dacă tot nimic, notăm „nu se livrează la marja noastră" |

## L. Checklist înainte de pornire

- [ ] 🔴 Decizia de la secțiunea C: reparăm robotul ANCPI **sau** corectăm promisiunea de timp
- [ ] Verifică `ancpi_jobs` — dacă tot `NEEDS_OPERATOR`, varianta B e obligatorie
- [ ] Creează campania `OAI_Click_ExtrasCF_2026-09`, Clicks, România, €20/zi
- [ ] Text customization **Off** (altfel platforma rescrie anunțul fără reviewul nostru)
- [ ] AG1 cu hint-ul din D, `Link` + `Tracking parameters` din H
- [ ] Anunț T3 + D2, imagine `ad-extras-cf-1024.png`
- [ ] Leagă evenimentul `Order CreatedPurchase` de campanie
- [ ] Setează coloanele pe 30 de zile clic / 0 view
- [ ] Test în incognito pe URL-ul cu UTM: verifică în `/admin/orders` că draftul are
      `attribution.last.utm_campaign = extras-cf-2026-09`
- [ ] Notează în jurnalul de mai jos data și ora pornirii

## M. Jurnal

| Data | Ce s-a întâmplat |
|---|---|
| 17.09 | Campania scrisă. Imaginea generată. FAQ-ul cu „Eliberăm" corectat. Descoperit blocantul: automatizarea ANCPI e moartă din 20.08, 27 de comenzi livrate manual, iar pagina promite „câteva minute, automat, 24/7". Campania NU s-a pornit; așteaptă decizia de la secțiunea C. |
