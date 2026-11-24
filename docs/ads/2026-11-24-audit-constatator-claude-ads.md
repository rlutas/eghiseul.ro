# Audit Google Ads constatator, 24.11.2026 (cont 881-388-1795)

Audit doar de citire, după procedura `claude-ads` (ads-google). Nu s-a schimbat nimic în cont. Datele vin din interfața Google Ads (contul de Ads al constatatorului), intervalul 17–23.11.2026, dacă nu scrie altfel. GA4 nu e folosit: pe acest site e plin de roboți (vezi [changelog 24.11](../changelog/2026-11-24-constatator-cui-pe-prima-pagina.md)).

**Campania:** `Search-Constatator-Firma-2026-11`, pornită pe 11.11. Pe 17–23.11: 499 de afișări, 51 de clicuri, 205,55 lei, 0 conversii.

## Pe scurt

Nu suntem în licitație. Apărem la **sub 10%** din căutările unde concurenții apar la 38–79%. Cauza principală: Google a respins exact titlurile care conțin „certificat constatator”. Anunțul nu are cuvântul căutat în titlu, de aici calitate scăzută, afișări rare și clicuri scumpe. Bugetul, licitația și ora nu sunt problema. Fără titlu cu cuvântul cheie (deci fără certificare sau o contestație câștigată), campania nu poate concura, oricât de bună e pagina.

## Constatări, după impact

### 1. Cotă de afișări sub 10%, concurenții la 38–79% (critic)

**Ce am văzut** (Statistici privind licitațiile, 17–23.11):

| Domeniu | Cotă de afișări | Sus pe pagină |
|---|---|---|
| certificatconstatator.ro | 79,4% | 94,9% |
| constatator-online.ro | 75,8% | 96,1% |
| certificat-constatator-instant.ro | 55,2% | 88,6% |
| onrc.info.ro | 40,6% | 98,0% |
| constatatoronline.com | 38,9% | 82,9% |
| cc-onrc.ro | 37,9% | 97,1% |
| certificat-constatator-online.ro | 19,9% | 77,2% |
| econstatator.ro | 15,3% | 81,1% |
| **noi** | **< 10%** | 83,4% |
| constatator.ro | < 10% | 68,6% |

Sunt nouă concurenți în aceleași licitații. Când apărem, apărem sus (83%), dar apărem rar.

**Ce înseamnă:** clicurile noastre sunt resturile. Nu putem judeca nici pagina, nici prețul pe ~50 de clicuri pe săptămână.

**Ce facem:** constatările 2 și 3 sunt cauza. Bugetul nu: n-are rost să crească.

### 2. Titlurile cu „certificat constatator” sunt respinse (critic, cauza principală)

**Ce am văzut** (Anunțuri → Vedeți detaliile elementelor): 5 din 13 titluri sunt „Neeligibilă — Respins (Documente guvernamentale și servicii oficiale)”:
- „Certificat constatator online”
- „Certificat constatator firmă”
- „Pe email, de obicei în minute”
- „Fără cont, fără drum la ghișeu”
- „Pentru bancă sau licitație”

Rulează doar titlurile fără numele actului: „Pentru PFA, II și SRL”, „Taxa ONRC inclusă în preț”, „Preț final 89 lei”, „Doar CUI-ul firmei”, „Plată cu cardul, 2 minute”, „Comandă certificatul acum”, „Factură pe firmă”, „Serviciu privat, nu ONRC”. Toate cele 4 descrieri sunt eligibile, inclusiv una care conține „Certificatul de bază”. Puterea anunțului e „Medie”, cu sfatul Google „includeți mai multe cuvinte cheie în titlu”, exact ce a respins politica.

**Ce înseamnă:** cine caută „certificat constatator” vede un anunț care nu spune „certificat constatator”. Relevanța și CTR-ul așteptat scad, deci și scorul de calitate (constatarea 3) și cota de afișări (constatarea 1).

**Ce facem:**
- Contestarea titlurilor respinse, din dreptul fiecărui element. Contestația e pe element, nu editează anunțul. Risc mic, dar e o acțiune în cont, deci cere acordul lui Raul.
- Calea de fond rămâne certificarea, vezi [jurnalul](2026-11-12-google-ads-jurnal-incercari.md).
- NU rescriem anunțul ca să ascundă actul. Asta e pe lista „Ce nu facem” din jurnal.
- **Atinge anunțul? Nu**, dacă rămânem la contestație. O editare a anunțului l-ar retrimite la verificare: risc mare.

### 3. Patru din nouă cuvinte cheie „Afișat rar (scor de calitate scăzut)” (mare)

**Ce am văzut** (Cuvinte cheie, 17–23.11):

| Cuvânt cheie | Potrivire | Stare | Af. | Clicuri | Cost |
|---|---|---|---|---|---|
| "obtinere certificat constatator" | expresie | Eligibilă | 111 | 16 | 61,41 |
| "certificat constatator firma" | expresie | **Afișat rar (QS scăzut)** | 128 | 9 | 39,10 |
| [certificat constatator] | exactă | Eligibilă | 97 | 7 | 23,03 |
| "certificat constatator online" | expresie | Eligibilă | 46 | 7 | 36,76 |
| "eliberare certificat constatator" | expresie | **Afișat rar (QS scăzut)** | 71 | 6 | 24,62 |
| "certificat constatator pfa" | expresie | **Afișat rar (QS scăzut)** | 16 | 3 | 9,89 |
| [certificat constatator onrc] | exactă | Eligibilă | 24 | 2 | 7,78 |
| "certificat constatator rapid" | expresie | **Afișat rar (QS scăzut)** | 4 | 1 | 2,96 |
| "comanda certificat constatator" | expresie | Eligibilă | 2 | 0 | 0 |

Coloanele cu scorul de calitate (CTR așteptat, relevanța anunțului, experiența paginii) nu le-am adăugat în tabel, pentru că ar fi schimbat vizualizarea salvată. De citit la nevoie.

**Ce facem:** aceeași cauză ca la constatarea 2. Partea de „experiența paginii” poate crește după pagina nouă cu CUI (24.11). Nu umblăm la licitații pe aceste cuvinte până nu se schimbă titlurile.

**Atinge anunțul? Nu.**

### 4. Două treimi din bani merg pe „alți termeni”, pe care nu-i vedem (mare)

**Ce am văzut** (Termeni de căutare, 17–23.11): 17 clicuri (57,90 lei) pe termeni vizibili, toți relevanți („certificat constatator”, „cat costa un certificat constatator”, „constatator registrul comertului”, „certificat constatator pfa” ș.a.). **34 de clicuri (147,65 lei, 72% din cost)** stau la „alți termeni de căutare”, cu CPC 4,34 lei față de 3,41 pe cei vizibili.

Sunt 21 de cuvinte negative la nivel de campanie, de exemplu: agent, anaf, cazier, daune, deces, exemplu, formular, "cat este valabil", "ce este", "ce inseamna". Am citit doar primele 10 din 21.

**Ce înseamnă:** potrivirea pe expresie aduce căutări pe care Google nu le arată, mai scumpe. Nu putem spune dacă sunt relevante. Nu propunem cuvinte negative noi fără raport de termeni care să le justifice.

**Ce facem (sigur, la nivel de campanie):**
- Testăm potrivire exactă pe termenii care au adus clicuri vizibile: „obtinere certificat constatator”, „certificat constatator online”, „cat costa un certificat constatator”.
- Lăsăm expresia doar unde termenii vizibili arată bine. Revedem raportul după 7 zile.

**Atinge anunțul? Nu.**

### 5. Niciun element (sitelink, înștiințare, fragment structurat) (mediu)

**Ce am văzut:** Elemente → Asocieri este gol: nu avem sitelinkuri, înștiințări, fragmente structurate, nume de firmă sau siglă. Google recomandă singur sitelinkuri (+3,3% estimat). „Elemente create automat” e dezactivat, deci nu se adaugă nimic singur.

**Ce facem (sigur, la nivel de campanie):**
- 4 sitelinkuri, numai spre pagini existente: tipuri și prețuri, cu istoric, întrebări, despre.
- Înștiințări: „Taxa ONRC inclusă”, „Factură pe firmă”, „Plată cu cardul”, „Serviciu privat”.
- Fragment structurat „Tipuri”: de bază, pe persoană fizică, cu istoric.

Elementele trec și ele prin verificare. Dacă unul e respins, cade doar elementul, nu anunțul. Textele nu trebuie să conțină „oficial” și nu trebuie să sugereze că suntem ONRC.

**Atinge anunțul? Nu.**

### 6. Licitare „Maximizați numărul de clicuri” (mediu)

**Ce am văzut:** strategia caută cât mai multe clicuri la bugetul de 60 lei/zi. Obiectivul de conversie e „Achiziții” (acțiunea `Purchase`, principală, „Fiecare”, fereastră de 90 de zile, „Se așteaptă conversii”). Conversii îmbunătățite: pornite pe 16.11, după jurnal.

**Ce înseamnă:** cu 0 conversii nu există date pentru licitare inteligentă. Maximizarea clicurilor tinde spre clicurile ieftine din „alți termeni”. Bugetul nu e cheltuit integral: limita e cota de afișări, nu banii.

**Ce facem (sigur):** licitare manuală pe cuvânt cheie, cu sume mai mari pe exactele cu intenție de cumpărare și mai mici pe expresii. Abia după constatările 2 și 4: altfel plătim mai mult pentru aceeași afișare rară.

**Atinge anunțul? Nu.**

### 7. Confirmarea identității advertiserului până pe 23.12.2026 (critic ca termen)

**Ce am văzut:** banner în cont: „Confirmați-vă identitatea… până pe 2026-12-23”, altfel anunțurile se opresc.

**Ce facem:** Raul, cu actul de identitate, din butonul „Începeți”. Nu e o schimbare de campanie.

### 8. Ce e în regulă

- Rețele: doar căutare Google, fără parteneri, fără Display.
- Locații: România, doar „Prezență”.
- AI Max: oprit. Potrivire amplă: oprită. Personalizarea textului și extinderea URL: oprite.
- Program: toate orele, ceea ce e potrivit pentru o livrare automată 24/7.
- Pagina de destinație: o singură pagină, aleasă de noi (homepage).
- Dispozitive: mobil 34 de clicuri (140,69 lei), computer 17 (64,86 lei), tabletă 0. Fără ajustări pe dispozitiv; corect, cu atât de puține date.

## Ce n-am citit

- Coloanele cu scorul de calitate.
- Coloana „Clicuri nevalide”: am evitat schimbarea coloanelor, ca să nu modific vizualizarea.
- Pagina 2–3 a cuvintelor negative.
- Statisticile privind licitațiile pe 30 de zile (am citit doar 7).
- Starea exactă a conversiilor îmbunătățite în pagina acțiunii.

## Ordinea recomandată

1. **Acum, fără risc:** confirmarea identității (Raul); sitelinkuri, înștiințări și fragmente (constatarea 5).
2. **Cu acordul lui Raul:** contestația pe cele 5 titluri respinse (constatarea 2).
3. **După 7 zile de pagină nouă (de la 24.11):** potrivire exactă și licitare manuală (constatările 4 și 6), pe raportul de termeni de atunci.
4. **Regula de oprire:** rentabilitatea e la ~8–10 vânzări la 100 de clicuri (marjă ~41 lei). Dacă după 01.12 cota de afișări rămâne sub 10% și titlurile cu cuvântul cheie rămân respinse, oprim campania până la certificare. Cu cotă sub 10%, testul nu poate da un răspuns, nici bun, nici rău.

## Ce s-a făcut după audit (24.11.2026)

- **Contestația pe titluri (constatarea 2):** depusă cu acordul lui Raul, pentru tot grupul de anunțuri, cu motivul „Contestarea deciziei”. Google a primit-o la verificare. Motivul respingerii este „Este obligatoriu un certificat”, adică certificarea de advertiser, deci șansele sunt mici.
- **Extensiile (constatarea 5), la nivel de campanie:** 6 sitelinkuri, 4 înștiințări și un fragment „Tipuri”. Detaliile sunt în [changelog](../changelog/2026-11-24-constatator-ads-contestatie-extensii.md).
- **Neatins:** anunțul, licitațiile, cuvintele cheie.
- **Rămas:** confirmarea identității (Raul, până pe 23.12) și decizia pe 01.12 după regula de oprire de mai sus.
