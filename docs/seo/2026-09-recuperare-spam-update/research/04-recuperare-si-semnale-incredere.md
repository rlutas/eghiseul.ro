# Recuperare după spam update și semnale de încredere — cercetare 09.09.2026

Context: eghiseul.ro (EDIGITALIZARE SRL, CUI RO49278701, J2023001097301, Satu
Mare) a fost demotat de August 2026 Spam Update (18–21.08), fără acțiune
manuală. Interogările de servicii au căzut la ~zero; supraviețuiesc doar
calculatoarele gratuite și brandul. Sora cazierjudiciaronline.com (același
proprietar) n-a fost afectată. Vezi
`docs/seo/2026-08-24-spam-update-prabusire-organica.md` pentru datele interne
(GSC, scoruri AI pe pagini, cronologie).

**Legendă evidence tier:** **(A)** afirmație explicită Google (blog oficial,
Search Central, John Mueller/Danny Sullivan documentați, Quality Rater
Guidelines) · **(B)** practician cu date publicate before/after (trafic,
screenshots) · **(C)** opinie/consens de industrie fără date verificabile.

---

## TL;DR + așteptări realiste

- **Nu există „reconsiderare" pentru demotări algoritmice.** Recuperarea vine
  doar din refresh-uri succesive ale clasificatorului (SpamBrain / core
  update), după ce site-ul s-a schimbat efectiv **(A)** — confirmat și de
  practicieni cu cazuri documentate **(B)**.
- **Baza reală de recuperare este proastă, nu bună.** Glenn Gabe a urmărit
  ~400 site-uri „obliterate" de Helpful Content Update (2023): la un an de la
  lovitură, doar **22% recuperaseră ≥20% din traficul pierdut** — nu 100%,
  20%. Lily Ray a analizat 130 din cele mai lovite site-uri: **129/130 au
  continuat doar să scadă**, niciun semn de recuperare **(B)**. Recuperarea
  completă la nivelul de dinainte e o **anomalie**, nu regula — cazul citat
  cel mai des (HouseFresh) a durat **2 ani și 1 lună**, și a avut nevoie și de
  o schimbare de politică la Google, nu doar de muncă pe site **(B)**.
- **Pentru pattern-ul nostru (scaled content abuse / site-wide)**, evidența
  practicienilor spune explicit: recuperarea se măsoară în **luni** în cel mai
  bun caz, iar pentru profiluri apropiate de „programmatic + subțire"
  recuperarea poate fi „foarte grea" fără restructurare fundamentală **(B)**.
  Nu există niciun caz documentat cu recuperare în sub 4-6 săptămâni pentru
  acest tip de demotare.
- **Nu există bullet-proofing.** Nimic din lista de mai jos garantează
  recuperarea — reduce doar probabilitatea de a rămâne clasificat drept
  „scaled/thin" la următorul refresh. Tratează planul ca pe un „nu mai da
  motive", nu ca pe un „acum sigur recuperăm".
- **Concluzie operațională**: fă schimbările pentru că sunt corecte oricum
  (calitate reală, încredere reală), nu pentru că garantează un ROI pe termen
  scurt. Pe venit, planul e diversificare (Ads, direct, brand), nu așteptare
  pasivă cu buget SEO oprit.

---

## Playbook de recuperare, în ordinea impactului

### 1. Elimină cauza structurală: clusterul, nu pagina (evidence: A + B)

Google descrie explicit **scaled content abuse** ca „multe pagini generate cu
scopul principal de a manipula clasarea, nu de a ajuta utilizatorul... oricât
de bun ar fi conținutul per pagină, dacă e generat la scară" **(A,
`developers.google.com/search/docs/essentials/spam-policies`)**. Cazurile
2026 documentate de Glenn Gabe confirmă că penalizarea e **site-wide**, nu
per-URL: un site cu 1,5M URL-uri indexate (85% conținut programatic
într-o singură secțiune) a fost lovit **pe tot domeniul**, „similar cu un core
update larg" **(B)**. Asta se potrivește exact cu diagnosticul din
`2026-08-24-spam-update-prabusire-organica.md`: nu o pagină, ci **clusterul**
(29 servicii × variante + 41 calculatoare + 58 articole, cadență de publicare
în loturi de 12/zi).

**Implicație practică**: rescrierea a 3-5 pagini nu schimbă clasificarea de
cluster. Trebuie atinsă **toată lista** (articole >10/1k din scorul AI intern,
cele 16 pagini de locație cazier) înainte ca refresh-ul să aibă ce
re-evalua — exact ce spune și checkpoint-ul din 28.08 din documentul sursă
(„fără schimbarea paginilor, refresh-ul SpamBrain nu are ce re-evalua").

### 2. Oprește cauza care a produs clusterul (evidence: A, prevenție directă)

Cadența de 12 articole/zi e exact tiparul pe care Google îl numește „generat
la scară... indiferent cum e produs" **(A)**. Continuarea publicării în ritm
mare — chiar cu conținut „mai curat" — riscă să mențină clasificarea. Planul
din documentul sursă (max 1-2 articole/săptămână) e aliniat cu evidența.

### 3. Rescrie cu adâncime reală, nu doar „curățare de tipare AI" (evidence: B)

Cazul citat de ingeniousnetsoft (blog tehnic SEO, cădere 58% pe top 12
pagini): recuperare la 90%+ traficul pre-cădere în 10 săptămâni **doar** pe
paginile unde s-au adăugat date originale (benchmark-uri din audituri proprii,
bio de autor cu nume real + LinkedIn, FAQ schema) — nu doar reformulare
**(B, un singur caz, fără al doilea exemplu independent în aceeași sursă)**.
Aceeași direcție confirmată de cazul HouseFresh: „testare de mână, cu poze și
video, pagini de expertiză pentru autori" **(B)**. Pentru noi: rescrierea
trebuie să adauge specific pe care doar noi îl avem (cifre reale de termene,
cazuri reale anonimizate, explicații pas-cu-pas ale procesului la instituție),
nu doar să scadă scorul de tipare AI.

### 4. Prune vs. rewrite vs. consolidate — vezi secțiunea dedicată mai jos.

### 5. Semnale de încredere / E-E-A-T pe site — impact incert dar aliniat cu ce citesc quality raters (evidence: A pentru rater guidelines, C pentru impact direct pe ranking)

Quality Rater Guidelines cer explicit evaluatorilor să găsească **„cine e
responsabil de website și cine a creat conținutul"** (secțiunea 2.5.2) și
notează calitate **Lowest** dacă scopul paginii e neclar sau ascunde cine
răspunde de conținut **(A)**. Ratingurile umane nu mișcă direct clasarea
**(A, confirmat chiar în guidelines — sunt folosite ca semnal de calitate
pentru antrenarea sistemelor, nu ca scor live)**, dar sistemele automate învață
din aceleași tipare pe care le caută raterii (contact clar, cine răspunde,
informații de business). Nu există date publice care să cuantifice „+X% dacă
ai pagină Despre" — e corelațional, nu cauzal dovedit **(C pentru mărime,
A pentru faptul că e criteriu explicit de evaluare)**.

### 6. Backlink hygiene — confirmat NU e cauza acestui update, dar tot bună practică (evidence: A)

Google a confirmat explicit că August 2026 Spam Update nu vizează link spam
sau site reputation abuse **(A, deja verificat în documentul sursă)**. Politica
de site reputation abuse (actualizată nov. 2024) e oricum strict despre
conținut terț publicat pe domeniul propriu — nu se aplică aici **(A,
`developers.google.com/search/blog/2024/11/site-reputation-abuse`)**. Nu e
prioritate pentru recuperarea asta specifică.

---

## Prune vs. rewrite vs. consolidate — reguli de decizie

Poziția Google explicită **(A)**: John Mueller a spus că ștergerea de conținut
„probabil nu are impact SEO" în sine — nu îmbunătățește automat clasarea
restului site-ului. A recomandat criterii combinate (vechime, trafic, bounce,
timp pe pagină) **ca punct de plecare, nu ca decizie automată**, și exemplul
lui explicit: o pagină „Despre noi" cu puțini cititori dar valoare unică **nu**
se șterge; „conținut fără valoare unică" se poate șterge. Danny Sullivan,
separat: „Ștergi conținut pentru că crezi că Google nu-i plac paginile
vechi? Asta nu-i un lucru [real]" **(A)**.

Cazul CNET (mii de articole șterse/redirecționate/repurpose-uite, analizat
pe pageviews + backlinkuri + vechime) e citat des ca „dovadă că pruning
funcționează", dar sursele disponibile nu conțin date before/after
verificabile publicate de CNET însuși — e mai degrabă un caz de proces
documentat de terți, nu un studiu cu cifre **(C, în ciuda titlurilor
senzaționale de tip „case study")**.

**Reguli practice pentru eghiseul.ro** (sintetizate din A + B, aplicate pe
lista de pagini din documentul sursă):

| Situație | Acțiune | De ce |
|---|---|---|
| Pagină thin (<800 cuvinte) + scor AI mare (>10/1k) + zero valoare unică (ex. `/rolul-si-atributiile-onrc-romania/`, 565 cuvinte) | **Extinde cu adâncime reală SAU consolidează** într-o pagină existentă mai bună + 301 | Sub pragul minim de utilitate; nu merită să existe separat |
| Pagini de locație aproape identice (16 pagini cazier, 79-82% Jaccard) | **Consolidează majoritatea într-un hub + păstrează doar cele cu diferențiere reală** (date locale, adrese instituții, termene specifice) | Exact tiparul „doorway/scaled" pe care update-ul îl vizează; CJO stă la 88-89% Jaccard dar cu scor AI de 2x mai mic — deci Jaccard mare nu e problema, densitatea de tipare AI e |
| Articol lung, scor AI mare, dar subiect cu cerere reală de căutare | **Rescrie cu adâncime** (nu șterge) — pierzi echitate de link/istoric degeaba | Mueller: nu șterge orbește ce are valoare potențială |
| Pagină fără trafic, fără backlinkuri, fără valoare unică, fără cerere de căutare | **Șterge (410) sau noindex**, nu doar ascunde | Reduce suprafața de „conținut la scară" pe care clasificatorul o vede |
| Pagină cu backlinkuri externe reale | **Niciodată ștearsă fără 301** | Mueller + Sullivan: ștergerea fără redirect pierde echitate fără beneficiu dovedit |

**Notă importantă**: noindex ascunde pagina din index dar **nu o scoate din
volumul total de conținut pe care Google îl crawlează și îl poate folosi ca
semnal de „câtă parte a site-ului e conținut la scară"** — pentru semnalul de
cluster, consolidarea/ștergerea reală contează mai mult decât noindex-ul
**(C, dedus din definiția „scaled content abuse", nu declarat explicit de
Google pentru acest caz)**.

---

## Semnale de încredere: ce lipsește tipic și ce conține o pagină „Despre noi" credibilă

### Ce am verificat deja pe eghiseul.ro (stare curentă, din cod)

- Există `/contact`, `/termeni-si-conditii`, `/politica-de-confidentialitate`.
- Footer conține deja: „eDigitalizare SRL · CUI RO49278701 · Reg. Com.
  J2023001097301 · Jud. Satu Mare, Com. Odoreu, Str. Salcâmilor nr. 2"
  (`src/components/home/footer.tsx:223`).
- **Nu am găsit** o pagină dedicată `/despre-noi` sau `/despre` în
  `src/app/` — informația de identitate e doar în footer, nu într-o pagină
  autonomă unde un rater (sau un clasificator) să găsească ușor „cine
  răspunde de site, ce experiență are, cum lucrează cu avocatul partener".

### Ce cere explicit Quality Rater Guidelines (A)

Secțiunea 2.5.2: raterii trebuie să găsească **cine** (persoană, firmă,
organizație) e responsabil de site și de conținut, și cât de ușor găsesc acea
informație. Pentru pagini YMYL: „informații nesatisfăcătoare despre cine
răspunde de website" = motiv de rating **Low**. Pentru pagini cu tranzacții:
informații de customer service nesatisfăcătoare = motiv de rating Low.

### Content outline concret pentru pagina „Despre noi" a eghiseul.ro

Bazat pe ce cere QRG + cum se prezintă intermediari legitimi analogi (agenții
de apostilă/viză din SUA verificate mai sus — toate au: adresă fizică vizibilă,
declarație explicită „nu suntem afiliați cu [instituția]", ani de experiență,
canal de contact uman):

1. **Cine suntem, explicit, sus de tot**: „eGhișeul.ro este operat de
   EDIGITALIZARE SRL (CUI RO49278701, Reg. Com. J2023001097301), o firmă
   românească din Satu Mare. **Nu suntem o instituție publică** — suntem un
   intermediar care pregătește și depune cereri de documente oficiale în
   numele clienților, prin împuternicire, în colaborare cu un cabinet de
   avocatură partener." — dezambiguizare explicită de la primul rând, exact
   ce cere raterul la 2.5.2.
2. **Ce facem concret și cum**: pas cu pas ce înseamnă „intermediere" — client
   completează formular → semnează împuternicire (mecanism legal citat: Legea
   214/2024, eIDAS art. 25, OUG 34/2014 — deja folosite intern pentru
   valabilitatea contractelor, vezi CLAUDE.md secțiunea Document Generation) →
   cabinetul de avocatură depune la instituție → clientul primește documentul.
   Această transparență e exact opusul cadrului pe care Google Ads l-a
   penalizat („documente oficiale" ca framing ambiguu) — pagina trebuie să
   spună clar ce NU suntem înainte să spună ce facem.
3. **De ce prin noi și nu direct**: onestitate, nu marketing agresiv — timp
   economisit, ghidare prin proces, livrare la domiciliu, fără drumuri la
   ghișeu. Nu revendica autoritate care nu ne aparține.
4. **Cine e avocatul/cabinetul partener**: nume, nr. Barou dacă e public,
   rolul exact în flux (numărul din registrul central Barou, deja existent
   intern — vezi `docs/registru-central/README.md`). Aceasta e experiența
   reală (E din E-E-A-T) — cabinetul are experiență directă cu instituțiile,
   noi avem experiență directă cu procesul de intermediere.
5. **Date de contact reale**: telefon funcțional, email, adresă fizică
   (deja în footer — trebuie replicată vizibil pe pagina Despre, nu doar în
   footer mic), program.
6. **Istoric/scară**: de când funcționăm, câte comenzi procesate (cifră reală,
   nu rotunjită suspect), pentru ce servicii (9 active).
7. **Link către Termeni și Confidențialitate** — deja există, doar trebuie
   legate vizibil din pagina Despre.
8. **Fără pretenții false**: nu folosi „oficial", „guvernamental" lipit de
   „document"/"acte" — exact eroarea deja documentată în
   `google-ads-documente-oficiale` (memory) și cauza problemelor de politică
   Google Ads. Coerența dintre ce spune pagina Despre și ce spun paginile de
   serviciu contează pentru un clasificator care corelează site-wide.

### Ce e evidence-based vs. „bune practici" fără dovadă directă

| Semnal | Evidence pentru impact pe ranking |
|---|---|
| Cine răspunde de conținut, clar identificabil | **(A)** — criteriu explicit QRG 2.5.2, folosit ca antrenament pentru sistemele de calitate |
| Informații de contact complete pe pagini YMYL/tranzacționale | **(A)** — QRG: lipsa lor = motiv explicit de rating Low |
| Pagină „Despre" separată (vs. doar footer) | **(C)** — nicio sursă nu cuantifică diferența; logica e doar că raterul/crawlerul o găsește mai ușor dacă e o pagină dedicată, linkată din navigare |
| Recenzii terțe (Trustpilot etc.) | **(C pentru ranking direct)** — Trustpilot nu alimentează algoritmul de local ranking al Google; efectul e indirect (CTR mai mare, encajare pe brand queries), nu confirmat ca semnal de ranking organic |
| Schema Organization/LegalService | **(C)** — „ajută consistența entității", nicio sursă nu arată creștere de ranking cauzată direct de schema |
| Prezență în registre publice (ONRC etc.) | **(C, dar coerent cu 2.5.2)** — nu e semnal algoritmic dovedit, dar susține exact ce raterul verifică manual („cum e vorbit despre ei în presă/recenzii") |
| Disclaimer explicit „nu suntem instituția X" | **(C pentru SEO, dar A pentru conformitate/Ads)** — nu există dovadă că disclaimer-ul mută ranking-ul, dar previne exact tipul de ambiguitate pe care QRG îl pedepsește la „scopul paginii neclar" |

---

## E-E-A-T pentru un intermediar: cum arăți experiență și încredere fără să pretinzi că ești instituția

Problema structurală: eghiseul.ro nu e sursa primară (nu eliberează cazier,
extras CF etc.) — e YMYL-adjacent prin natura documentelor, dar autoritatea
reală stă la ONRC/ANCPI/Poliție/Stare Civilă. QRG cere totuși ca **experiența**
demonstrată să fie relevantă pentru scopul paginii, nu pentru subiectul
abstract **(A)**: „experience that is relevant to the purpose of the page" —
pentru un intermediar, experiența relevantă nu e „cum se eliberează un
cazier" (asta o are Poliția), ci **„cum se navighează corect procesul de
obținere, ce greșeli evită clientul, cât durează efectiv, ce documente cer
diferite instituții"**. Astea sunt cunoștințe pe care le are un intermediar cu
volum real de comenzi, și sunt exact genul de conținut pe care CJO (neafectat)
pare să-l facă cu densitate mai mică de tipare AI și conținut mai puțin „la
scară" (10 servicii vs. 29 la noi + 41 calculatoare + 58 articole).

Recomandări concrete, aliniate cu ce arată cazurile de recuperare **(B)**:

1. **Experiență = cazuri reale de proces, nu explicații generice ale legii.**
   Exemplul HouseFresh (testare de mână cu poze reale) se traduce la noi ca:
   capturi din procesul real de depunere, termene reale observate pe comenzi
   (nu intervale generice „10-30 zile" copiate din lege), explicarea
   diferenței între ce spune legea și ce se întâmplă efectiv în practică.
2. **Autor/responsabilitate identificabilă pe conținut**, nu „Echipa
   eGhișeul". Măcar identitatea juridică (deja există) + rolul avocatului
   partener pe conținutul legal (contracte, împuterniciri).
3. **Trust = transparență despre limitele rolului nostru**: spune explicit
   unde se termină responsabilitatea noastră și unde începe cea a instituției
   (ex. „termenul de eliberare e stabilit de instituție, nu de noi; noi
   garantăm depunerea corectă și la timp a cererii").
4. **Nu revendica atribute ale instituției**: fără „oficial", fără limbaj
   care sugerează emitere directă. Aliniere directă cu ce a cerut deja Google
   Ads (memory: `google-ads-documente-oficiale`) — coerența cross-canal
   (Ads + organic) contează pentru credibilitate generală a brandului, chiar
   dacă nu e același algoritm.
5. **Autoritate construită în afara Google** (canal alternativ, nu doar SEO):
   HouseFresh a recuperat parțial datorită creșterii de brand prin
   YouTube/parteneriate, independent de Google — pentru noi echivalentul ar
   fi vizibilitate pe branded search, recenzii reale, recomandări. Nu e o
   soluție SEO, dar reduce dependența de organic în timp ce se așteaptă
   refresh-ul **(B, indirect)**.

---

## Timeline realist + ce faci cu veniturile între timp

**Timeline** (sintetizat din sursele B de mai sus, pentru profilul nostru
specific — scaled content abuse la nivel de cluster, fără thin affiliate pur):

- **Săptămânile 1-4**: implementare — rescriere/consolidare pe toată lista
  (nu doar top 3), oprire publicare în loturi, pagină Despre credibilă. Fără
  efect vizibil pe trafic în această fereastră.
- **Luna 1-3**: primul semn posibil e în **expuneri GSC pe clusterul
  servicii**, nu clicuri (așa cum spune deja documentul sursă) — dacă
  expunerile nu se mișcă deloc după ce toată lista a fost atinsă, e semn că
  fie schimbările n-au fost suficiente, fie refresh-ul încă n-a trecut peste
  domeniu.
- **Luna 3-6**: fereastra în care cazurile B raportează „recuperare posibilă"
  pentru site-uri care au făcut remediere reală și consecventă — dar aceeași
  fereastră e și cea în care majoritatea site-urilor din eșantionul Gabe/Ray
  **nu** arată recuperare.
- **6 luni+**: dacă nu există nicio mișcare de expuneri pe cluster până
  atunci, probabilitatea de recuperare organică fără un refresh de politică
  mai larg la Google (ca la HouseFresh) scade semnificativ — baza empirică
  spune că majoritatea rămân jos.
- **Probabilitate onestă**: cu remediere completă și consecventă, undeva sub
  25-30% recuperare parțială (≥20% din trafic) în 6-12 luni, bazat pe rata
  Gabe (22% la 1 an pentru HCU). Recuperare completă la nivelul de dinainte
  de 20.08 e statistic o anomalie, nu un obiectiv realist de planificat pe
  termen scurt.

**Ce faci cu veniturile între timp**: documentul sursă are deja punctul 6
(„Google Ads pe termen scurt, respingerile de politică se tratează separat").
De adăugat, din cercetarea asta:

- Nu opri munca de remediere organică în așteptarea unui refresh — dar nici
  nu bugeta pe baza unei recuperări certe într-un interval fix.
- Diversifică canalul de achiziție (Ads + brand + recomandări) explicit ca
  să nu depinzi de un singur refresh algoritmic pentru supraviețuirea
  cash-flow-ului — practicienii cu recuperare reușită (HouseFresh) au construit
  în paralel canale independente de Google, nu doar au așteptat.
- Monitorizează lunar, nu săptămânal — recuperarea din spam update se mișcă
  în refresh-uri, nu continuu; verificări prea dese nu arată semnal real și
  consumă timp fără informație nouă.

---

## Surse

**(A) Google explicit:**
- [Spam policies for Google Web Search — scaled content abuse](https://developers.google.com/search/docs/essentials/spam-policies)
- [Updating our site reputation abuse policy — Google Search Central Blog, nov. 2024](https://developers.google.com/search/blog/2024/11/site-reputation-abuse)
- [Google warns against content pruning as CNET deletes thousands of pages — Search Engine Land (citează Mueller + Sullivan direct)](https://searchengineland.com/google-warns-against-content-pruning-as-cnet-deletes-thousands-of-pages-430509)
- [Search Quality Rater Guidelines — secțiunea 2.5.2 „who is responsible" (sintetizat din surse secundare care citează direct guidelines-ul oficial)](https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf)
- [Google's site reputation abuse policy explained — practicalecommerce](https://www.practicalecommerce.com/googles-site-reputation-abuse-policy-explained)

**(B) Practicieni cu date publicate:**
- [Google's August 2026 Spam Update — Case Studies — Glenn Gabe / GSQI](https://www.gsqi.com/marketing-blog/august-2026-google-spam-update-case-studies/)
- [Google Core Update 2026: Traffic Recovery Guide — ingeniousnetsoft.com](https://ingeniousnetsoft.com/google-core-update-traffic-recovery-2026/)
- [HouseFresh recovery — ppc.land](https://ppc.land/housefresh-achieves-notable-traffic-recovery-after-google-algorithm-impacts-2/)
- [Small review site lost 91% of Google traffic — Search Engine Land](https://searchengineland.com/review-site-google-traffic-affiliate-seo-content-440143)
- [Helpful Content Update Recovery Study: Data From 400+ Sites — thestacc.com (citează metodologia Glenn Gabe, ~400 site-uri, 22% recuperare parțială la 1 an)](https://thestacc.com/blog/helpful-content-update-recovery/)
- [Google's August 2026 spam update done; recovery months away — bushletter.com](https://www.bushletter.com/google-s-august-spam-update-completes-recovery-takes-months/)

**(C) Consens/opinie industrie (folosit doar unde nu exista sursă A/B):**
- Diverse ghiduri de content pruning (Search Engine Land „guide", PushLeads, Customer Impact) — consistente între ele pe regula „noindex pentru pagini utile fără nevoie de a rank, delete pentru zero valoare".
- Rezultate de căutare despre practicile agențiilor legitime de apostilă/viză din SUA (visadc.com, federalapostille.com) — folosite ca analogie de prezentare, nu ca sursă normativă pentru piața românească.

---

## Notă despre acest document

Cercetarea de mai sus e externă (Google + practicieni SEO), coroborată cu
starea reală a codului (`src/components/home/footer.tsx`,
`src/app/contact`, `src/app/termeni-si-conditii`,
`src/app/politica-de-confidentialitate`) la 09.09.2026. Nu s-a modificat
niciun alt fișier din repo — acesta e doar document de cercetare, nu plan de
implementare.
