# Ce raportează practicienii PPC despre OpenAI Ads (research 17.09.2026)

Research pe piața externă, cerut ca să nu improvizăm pe un canal nou. Concluzia de sus:
**corpusul serios e mic**, vreo șase-opt relatări de primă mână cu tabele complete, plus două
investigații de presă de specialitate. Restul e conținut de marketing produs de agenții care
vând administrare de ChatGPT Ads și care se citează între ele, așa că o cifră poate apărea în
douăzeci de locuri și tot să vină dintr-un singur test de 415 $.

⚠️ **Nu există nicio relatare de primă mână dintr-un cont UE cu cifre reale.** Europa a pornit
pe 24.08, self-serve pe 31.08. Pentru România, doar articole de lansare. Deci datele noastre
din contul propriu valorează mai mult decât orice benchmark de mai jos.

## 1. Cât costă și cât convertește

| Cine | Când | Piață | Cheltuit | Clicuri | CTR | CPC | Conversii |
|---|---|---|---|---|---|---|---|
| Workshop Digital, B2B | 08.2026 | SUA | 2.319 $ | 739 | 1,1% | 3,14 $ | **0 lead-uri calificate** |
| SE Ranking, SaaS B2B | 06.2026 | SUA/CA/AU/NZ | ~3.990 $ | 1.263 | 1,30% | 3,16 $ | „aproape nicio înscriere" |
| Choice OMG, servicii locale | 06.2026 | Canada | 415 CA$ | 58 | 0,65% | 7,16 CA$ | **0 lead-uri**, oprit în 15 zile |
| Out of the Box Advisors | 07.2026 | SUA | 675 $ | 208 | — | 2,77–3,50 $ | 0 lead-uri / 1 eveniment |
| Opascope, magazin online | 06.2026 | probabil SUA | ~60.000 $ | — | — | **1,72 $** | CVR **2,35%**, ROAS 1,49 |

**Ce se adună din asta:** CTR se strânge în 0,6–1,3%. CPC se strânge în 2,77–3,50 $ când
licitezi la pragul recomandat, adică plătești cam cât ți se spune să licitezi. Singura excepție
e Opascope, la scară de 60.000 $, care e și singura dovadă că CPC-ul scade cu volumul.

Comparația directă cu Google, același advertiser, aceeași perioadă: pe ChatGPT clicul a fost cu
**54% mai ieftin**, dar CTR-ul pe Google a fost cu **79% mai mare**, iar Google a produs 2
lead-uri calificate față de 0. Clicuri mai ieftine, clicuri mai proaste.

OpenAI nu publică niciun benchmark și spune asta explicit. Orice tabel cu „CPC mediu pe
industrie" pe care îl vezi e inventat.

### 🔵 Unde datele noastre bat benchmark-urile

Pe constatator am plătit **13,19 € pentru 23 de clicuri, adică 0,57 € efectiv**. Asta e de
cinci ori mai ieftin decât media raportată în SUA. Mai multe surse descriu un prag de livrare
pe la 3 $ sub care afișările dispar; la noi, la un bid de €1,95, livrează. **România e inventar
ieftin, iar asta e singurul lucru care ține deschisă aritmetica noastră.**

## 2. Context hints

Oficial, sunt „îndrumare de intenție și temă, nu cuvinte cheie", iar exemplul lor e „pantofi de
alergare cu amortizare pentru începători care se pregătesc de primul 5K", nu „pantofi alergare".

**Singurul test A/B publicat contrazice sfatul oficial.** Workshop Digital a testat în același
cont: hint-uri de tip cuvinte cheie au dat **1,2% CTR**, hint-uri de tip situație conversațională
**0,9%**. Un practician ceh raportează exact invers, clicuri cu 16% mai ieftine pe hint-uri
conversaționale. Contradicția e nerezolvată, iar CTR-ul oricum n-a produs lead-uri în niciunul
din cazuri, deci testul dovedește mai puțin decât pare.

**Ce nu e contradictoriu: hint-urile înguste mor de foame.** La SE Ranking, cele mai largi două
grupuri din opt au luat jumătate din afișări, iar cel mai îngust a primit 857 de afișări față
de 51.867. OpenAI însăși numește „context hints prea înguste" printre cauzele principale de
nelivrare.

🔴 **Nu există raport de termeni de căutare.** Nu poți vedea ce conversații ți-au declanșat
reclama. SE Ranking numește asta cea mai mare pierdere de diagnostic față de Search. Optimizarea
hint-urilor e ghicit, iar asta e un argument în plus să pornim larg.

## 3. Creativ — cea mai utilă descoperire din tot research-ul

**Cardul taie textul mult înainte de limita de caractere:**

| Element | Limită tehnică | Se vede realist |
|---|---|---|
| Titlu | 50 | **~24** |
| Descriere | 100 | **~48** |

Workshop Digital confirmă: „titlurile și descrierile se puteau trunchia mai devreme decât ne
așteptam, chiar și când textul respecta limitele platformei". Concluzia lor, textual: pune
mesajul important la început. Un alt practician raportează **dublarea CTR-ului dintr-o singură
schimbare**, rescrierea anunțurilor ca să încapă înainte de tăietură — sursă unică, neverificată,
dar ieftin de aplicat.

Alte rezultate măsurate, toate din același cont:

- **Numele brandului primul în titlu**: 1,1% CTR și 3,07 $ CPC, față de 1,0% și 3,30 $ fără.
  Invers față de obiceiul din Google Search.
- **Imaginea contează și nu e logo-ul.** Imagine specifică domeniului: 1,2% CTR. Grafică
  generică: 0,9% CTR și CPC mai mare cu 10%. Diferență de o treime, doar din imagine.
- **Livrarea se concentrează brutal.** La SE Ranking, un singur anunț dintr-un grup a luat
  11.074 afișări. Sistemul alege repede un câștigător și înfometează restul.

## 4. Licitare și buget

- **Prag practic de livrare pe la 3 $**, repetat de mai multe surse, dar niciodată de OpenAI.
  Un practician din UE spune că 30 de campanii au produs o afișare pe zi până a urcat bidurile
  de 8 ori. La noi nu s-a confirmat.
- OpenAI recomandă 3–5 $ CPC maxim și **nu publică** niciun bid recomandat pentru oCPC/oCPM.
- 🔴 **Capcană pe campaniile de conversii:** din 06.08.2026 OpenAI a redefinit Bid Cap din
  „maximul pe clic" în „maximul pe **conversie**", dar facturarea rămâne pe clic valid. Cine
  mută un plafon de 4 $ pe clic într-un câmp de bid oCPC tocmai a declarat un CPA țintă de 4 $.
- **Buget minim zilnic: 25 $ pe campanie.** Nu există minim publicat în EUR. Presa din România
  scrie 15 EUR/zi. Sursele nu sunt de acord, deci se verifică în contul propriu.
- 🔴 **Bugetul zilnic e o medie pe 7 zile, nu un plafon**, din ~29.07.2026: maximum **2× într-o
  zi** și **7× într-o săptămână**. O campanie de 20 €/zi poate lua legal 40 € mâine.
- **Bugetul total pe campanie nu e control de ritm.** Un advertiser american a consumat 500 $ de
  buget total în circa o oră.
- **Obiectivul, tipul de campanie și evenimentul de conversie se blochează la creare.** Trecerea
  de la CPC la oCPC înseamnă reconstrucție, nu comutare.
- **Perioada de învățare nu e documentată.** OpenAI nu dă nici durată, nici număr minim de
  conversii. Practicienii spun între 14 zile și 6 săptămâni; Opascope arată că ROAS-ul zilnic
  a oscilat între 0,2× și 2,9×, deci sub ~15 zile totul e zgomot.

## 5. Conversion optimization cu facturare pe afișări (oCPM)

**Zero relatări de primă mână. Funcția a devenit general disponibilă pe 16.09, adică ieri.**
Cine îți oferă azi benchmark-uri de oCPM le inventează.

Ce e documentat: două tipuri de campanii de conversii, oCPC (optimizează pe conversii
post-clic, facturează pe clic valid) și oCPM (optimizează pe conversii din clicuri **și
vizualizări**, facturează pe afișare). Urmărirea conversiilor trebuie să funcționeze **înainte**
de crearea campaniei; un singur eveniment standard per campanie; evenimentele personalizate nu
sunt acceptate pentru optimizare. Conversiile din vizualizare se raportează separat, pe o
fereastră fixă de 1 zi care **nu se poate schimba**, și sunt **excluse** din totalul de conversii
și din CPA-ul afișat.

**Cât volum de conversii trebuie ca oCPM să bată CPC: niciun prag publicat, nici oficial nici
observat.**

Pentru noi, argumentul e simplu: la 7 clicuri pe zi și o conversie realistă de 2–3% producem
mult sub o conversie pe săptămână, adică sub orice prag de învățare plauzibil. **Pornim pe CPC.**

### Event Quality Score

Scor 1–10 per sursă de date, în Tools → Conversions. Ce îl ridică, după OpenAI: rezolvarea
avertismentelor listate (informații de potrivire lipsă, evenimente de server întârziate,
evenimente trimise repetat); includerea unui **email sau a unui identificator stabil de client**
pe evenimentele eligibile, același pentru aceeași persoană; și trimiterea doar de evenimente
reale. Explicit interzis: „nu trimite evenimente în plus, nu inventa identificatori și nu
modifica momentul evenimentelor ca să îmbunătățești un scor". **Scorul se recalculează zilnic pe
ultimele 7 zile calendaristice complete**, deci o reparație se vede abia după o săptămână.

Niciun practician n-a raportat încă ce scor corelează cu ce performanță.

## 6. Măsurare — partea care ne privește cel mai direct

### Pixel și `oppref`

- `oppref` e click ID-ul, echivalentul `gclid`. SDK-ul de browser **îl capturează automat** și
  îl pune într-un cookie first-party `__oppref`, valabil 30 de zile.
- 🔴 **Conversions API NU capturează `oppref` pentru tine.** Trebuie citit și trimis manual pe
  evenimentul de server. E numită cea mai frecventă cauză de atribuire server-side ruptă.
- 🔴 **Orice lanț de redirect care taie parametrii din URL distruge tăcut atribuirea.** Numită
  repetat drept cauza numărul unu de tracking pierdut. La noi, URL-ul de aterizare întoarce 200
  fără redirect, iar varianta fără slash final dă 308 care păstrează query-ul — verificat.
- Potrivirea avansată automată face SHA-256 în browser pe datele clientului și e **pornită
  implicit pe pixelii noi**. E o problemă de consimțământ în UE, pe care o gestionăm noi.
- Deduplicare: același `event_id` pe browser și pe server. Fără el, pixel plus CAPI numără dublu.

### Atribuire

Ferestre de clic 7/14/30 de zile, fereastră de vizualizare 0 sau 1 zi. Clicul are prioritate
față de vizualizare. Conversiile apar după 24–48 de ore și „pot include conversii modelate".
Nu există studii de lift, nu există export la nivel de log, nu există verificare terță. Singurele
segmentări: dispozitiv, țară, și noul split pe 5 platforme.

### 🔴 Practicienii nu au încredere în cifrele platformei

- **Out of the Box Advisors:** din **140 de clicuri facturate**, doar **~13%** au ajuns
  verificabil pe site. Pe o a doua campanie, 68% din 68 de clicuri. Fraza lor: „un clic de
  3,50 $ care produce un prospect real e rezonabil; unul care nu ajunge niciodată pe site nu e
  ieftin, e scump".
- **Nicholas Verity (Cleverly):** ChatGPT a raportat **57 de clicuri**, Google Analytics a văzut
  **sub 20 de vizite**.
- **Opascope**, în sens invers: tabloul de bord **sub**-raporta conversiile.
- **Improvado**, rezumatul cel mai onest: „fiecare număr din interfață e OpenAI corectându-și
  singură lucrarea".

⚠️ **Asta e o explicație mult mai bună pentru cele 23 de clicuri fără niciun draft de pe
constatator decât „n-a vrut nimeni să comande".** Dacă la noi ajunge 13–35%, cele 23 de clicuri
au fost 3–8 vizite reale, iar zero drafturi din 3–8 vizite e pur zgomot. Devine prima verificare
zilnică din campania nouă.

### Capcană GA4

Clicurile netagate aterizează în GA4 ca trafic **organic** de pe `chatgpt.com`, amestecând
plătitul cu organicul. La noi UTM-urile sunt puse, dar merită știut: avem 13 comenzi istorice cu
referrer organic `chatgpt.com`, iar dacă am fi rulat reclamă netagată nu le-am fi putut separa.

## 7. Moduri de eșec documentate

- **Sublivrare cronică în pilotul american, februarie–aprilie 2026.** Un advertiser a cheltuit
  **2.500 $ dintr-un angajament de 250.000 $ în patru săptămâni**. Citate de la Digiday
  Programmatic Summit: „cred că au fost orbiți de venituri și au făcut multe lucruri înainte să
  fie pregătiți"; „n-a existat niciodată destul inventar la lansare". Umplerea și-a revenit
  30–50% spre sfârșitul lui aprilie.
- **Suportul nu stăpânea noțiuni elementare de media**, de exemplu de ce advertiserii vor
  bugetele necheltuite eliberate.
- **Livrare foarte inegală în interiorul contului**, vezi secțiunea 2.
- 🔴 **Blocarea botului omoară eligibilitatea.** `OAI-AdsBot/1.0` trebuie să treacă prin WAF/CDN
  pentru validarea anunțului și evaluarea relevanței, iar OpenAI **nu publicase intervale de IP**
  în august. ✅ **Verificat la noi pe 17.09: întoarce HTTP 200 cu conținut identic cu al unui
  browser. Nu suntem blocați.**
- **Politica.** Reviewul citește experiența întreagă, inclusiv pagina de destinație, și respinge
  anunțuri „a căror destinație introduce conținut nepermis". Confirmă ce știam deja: serviciile
  cu avocat în flux sunt închise.

## 8. B2B și servicii, spre deosebire de comerț electronic

Zona cea mai bine acoperită, și veștile sunt proaste. **Patru teste independente de lead-gen,
de patru ori zero sau aproape zero:** Workshop Digital 739 de clicuri, 0 lead-uri calificate;
SE Ranking 1.263 de clicuri, „aproape nicio înscriere"; Choice OMG 58 de clicuri, 0 lead-uri;
Cleverly, 0 conversii, oprit imediat.

🔴 **Explicația structurală, la care două agenții au ajuns independent:** reclamele se arată
**doar utilizatorilor Free și Go**, iar cumpărătorii profesioniști stau disproporționat pe
planuri plătite, fără reclame. Formularea SE Ranking: „cu cât cineva seamănă mai mult cu
clientul nostru ideal, cu atât e mai probabil să fie pe un plan plătit, fără reclame".

**Ce înseamnă pentru noi, concret.** Cumpărătorul de extras de carte funciară e adesea notar,
bancher, agent imobiliar sau contabil, adică exact profilul care plătește ChatGPT. Dar e și
persoana care cumpără un apartament o dată în viață și verifică vânzătorul, adică fix
„intenție de research de consum", singurul profil pe care cineva a raportat rezultate decente.
**Extrasul CF are ambele fețe, și asta îl face mai potrivit decât constatatorul**, care e
aproape exclusiv B2B.

Singura verticală cu cifre credibile pozitive rămâne comerțul electronic la scară.

## Ce am schimbat în plan după research

1. Textele rescrise pe **pragul de trunchiere de 24/48**, nu pe limita de 50/100.
2. Un titlu de test care **începe cu numele brandului**.
3. Imaginea rămâne **specifică documentului**, nu logo.
4. Pornim **larg**, pe un singur ad group; hint-urile înguste mor de foame.
5. Rămânem pe **CPC manual**. Nici oCPC, nici oCPM.
6. Prima verificare zilnică devine **clicuri facturate față de sesiuni reale**, nu CPA.
7. Criterii de oprire scrise ca să oprească devreme, cu pierdere maximă €100.

## Surse

Workshop Digital · SE Ranking · Choice OMG · Out of the Box Advisors · Opascope · Improvado ·
Digiday (26.05.2026) · MediaPost/Yahoo Finance (08.2026) · ppc.land (16.09.2026) ·
help.openai.com și developers.openai.com/ads. Lista completă cu URL-uri și date e în raportul
de research din sesiunea 17.09.2026.
