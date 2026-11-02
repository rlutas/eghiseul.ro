# Analiză competitivă SEO — cazier judiciar (CJO + eghiseul), 02.11.2026

**Metodă.** HTML static luat cu curl (UA de browser). caziere.ro și infocazier.ro sunt SPA-uri React fără conținut în HTML, așa că le-am randat în Playwright. SERP-ul e luat din Google cu `hl=ro&gl=ro&pws=0`, fără login și cu cookie-urile refuzate: **un singur snapshot, dintr-o singură locație**. Jaccard-ul e pe shingle-uri de 5 cuvinte, cu și fără orașul/județul mascat. Marchez **[V]** ce am verificat și **[I]** ce am dedus.

---

## 1. SERP-ul de azi (snapshot, [V])

| Query | Ordinea rezultatelor organice (fără reclame) |
|---|---|
| cazier iasi | is.politiaromana.ro · **hub.mai.gov.ro** · infocazier · **CJO (4)** · caziere.ro · digigov · cazierul-judiciar-online.ro · iasi365 · facebook |
| cazier brasov | bv.politiaromana.ro · digigov · hub.mai · caziere.ro · infocazier · **CJO (6)** · research.gov · scribd · cazierul-judiciar-online.ro |
| program cazier brasov | bv.politiaromana · digigov · infocazier · caziere.ro · **CJO (5)** · cazierul-judiciar-online.ro · prefectura · scribd · hub.mai |
| cazier judiciar online | hub.mai · mai.gov.ro · hub.mai · caziere.ro (4) · b.politiaromana · hub.mai PJ · facebook · research.gov · **CJO (9)** |
| cazier auto online | hub.mai · digigov · hub.mai · caziere.ro · **CJO (5)** · facebook · research.gov · politiaromana · cazierul-judiciar-online.ro (blog) |

**AI Overview [V]:**
- „cazier iasi": citează MAI (hub), apoi **cazierul-judiciar-online.ro** pentru adresă și **DigiGov** pentru program, cost și termen.
- „cazier brasov": citează DigiGov și MAI.
- „cazier auto online": îi numește explicit pe „DigiGov.ro sau Caziere.ro" drept alternative contra cost.
- „cazier judiciar online": doar MAI.

**Ce înseamnă [I]:**
- Pe query-urile de oraș am ieșit în snapshot **la paritate cu competitorii privați**: ne amestecăm cu ei pe pozițiile 3–7.
- Ce ne-a mutat de pe 2 pe 4–5 e, cel mai probabil, faptul că **site-urile guvernamentale au urcat** (pagina IPJ și hub.mai pe 1–2), plus un AI Overview care răspunde deja la întrebarea „unde și când". Asta explică impresii stabile cu clicuri ÷10 mai bine decât o penalizare care ne-ar lovi doar pe noi.
- Cu un singur snapshot nu pot exclude și o demotare proprie (vezi §4, C1). Dar caziere.ro, care are cea mai slabă calitate on-page, stă în același bloc cu noi.

---

## 2. Comparație pe pagini

### Pagina de oraș (Iași / Brașov)

| | **CJO** `/cazier-judiciar-online/iasi` | **cazierul-judiciar-online.ro** `/iasi/` | **caziere.ro** `/servicii/cazier-judiciar-online-iasi` | **infocazier.ro** `/cazier-judiciar/iasi/` | **digigov.ro** `/cazier-judiciar/brasov` |
|---|---|---|---|---|---|
| Title | „Cazier judiciar online Iași, fără drum la poliție" | „Cazier judiciar Iași **2026 – program ghișee** și online 24–48h" | „Cazier judiciar online Iași - Obțineți acum de la distanță…" | „Unde scoți cazierul judiciar în Iași: **adrese și program**" | „Cazier judiciar Brașov — **program ghișeu**" |
| H1 | „Cazier judiciar online Iași fără drum la poliție" | „Cazier judiciar Iași" | „Cazier judiciar online Iași" | „Cazierul judiciar în Iași" | „Cazier judiciar Brașov" |
| Primul ecran | **wizardul de comandă** (pasul 1/6), apoi preț, apoi date IPJ | „**Pe scurt:**" 2 ghișee + adrese + preț + CTA, imediat tabelul de program | formular + text generic | eticheta „**ACTUALIZAT OCTOMBRIE 2026**", apoi „PE SCURT" + adrese + program | adresă + program + telefon |
| Cuvinte (main) | 820 (Iași) / 759 (Brașov), cu tot cu formular și blocul de 38 de orașe | **2.129** / 1.603 | 1.876 / 1.946 (generic) | 873 / 878 | 616 |
| Date locale | IPJ: adresă, program, telefon; ghișeele din județ doar cu program, fără adresă | **2 ghișee în oraș cu adresă**, repere („lângă Palas", „nu confunda cu Rutiera nr. 29"), **tabel comună → cel mai apropiat ghișeu**, link Google Maps | **zero** (nicio adresă, niciun program) | 2 ghișee + program + GeoCoordinates | adresă, program, telefon, ghișeele din județ |
| Dată de prospețime | „Verificat 05.10.2026" | „**Verificat la 01.11.2026**" | — | „Actualizat octombrie 2026" | „Verificat pe 23 septembrie 2026" (în meta description) |
| Preț | 198 lei / 3–5 zile | **149 lei / 24–48h** | nu apare | de la 189 lei / 24–48h | 198 lei |
| FAQ | 3 întrebări | **9 întrebări** locale (student, Copou vs Palas, diaspora, școala de șoferi) | — | 6 | da |
| Schema | Service, Offer, FAQPage, Breadcrumb, AdministrativeArea | + **GovernmentOffice + OpeningHoursSpecification + PostalAddress**, City | **niciuna** | GovernmentOffice + **GeoCoordinates** + OpeningHours, FAQ | GovernmentOffice + OpeningHours |
| Linkuri interne în conținut | 43 (din care 38 = blocul „alte județe") | 14, contextuale: 5 județe vecine, cazier auto, integritate, firme | 2 | 22 | 8 |
| Canonical | self | self | **toate paginile → homepage** (în DOM-ul randat) | self | self |
| Jaccard Iași↔Brașov (normal / mascat) | **0,39 / 0,47** | **0,05 / 0,06** | 0,25 / 0,25 (tot body-ul) | 0,34 / 0,38 | n/m |
| Câte pagini de oraș | 39 în sitemap | ~55 orașe + sectoare + articole „cazier auto <oraș>" | 9 (doar în footer) | **3.284** (fiecare comună) | 49 (+145 CF, 43 constatator) |
| Domeniu înregistrat | 2023 | 2024-10 | 2022-01 | 2025-03 | 2023-08 |

### Homepage și cazier auto

| | CJO | cazierul-judiciar-online.ro | caziere.ro |
|---|---|---|---|
| Title home | „Cazier Judiciar Online fără Cont pe HUB MAI · 198 lei" | „Cazier judiciar online: 149 lei, scan pe email în 24–48h" | „Cazier judiciar online - Eliberare cazier rapid…" |
| Cuvinte home | 2.342 | 3.422 | 2.167 |
| Recenzii | **5 testimoniale hardcodate** (vezi C1) + „4.9/5" | pagină `/recenziile-noastre/` cu recenzii video și widget Google Maps („peste 160") | — |
| Cazier auto | 1.237 cuvinte, **fără diacritice** în H2 („Intrebari", „Obtine"), 5 linkuri interne | 2.387 cuvinte, 16 H2: rutier = auto, DRPCIV, valabilitate, durată, legalitate | 1.828 cuvinte, generic |

---

## 3. Ce fac ei și noi nu

1. **Pagina de oraș răspunde întâi la intenția reală a query-ului** („unde, când, ce acte"), cu formularul după. Titlurile și H1-urile câștigătorilor sunt informaționale: „Cazier judiciar Iași", „program ghișeu", „adrese și program". Ale noastre sunt tranzacționale („online, fără drum la poliție"). Query-urile care ne-au scăzut („cazier iasi", „program cazier brasov") sunt navigaționale. **[V]** pentru titluri; **[I]** pentru efectul pe CTR.
2. **„Pe scurt" chiar sub H1** (cazierul-judiciar-online.ro, infocazier). E un paragraf de 2–3 propoziții, cu adresă, zile și preț, pe care AI Overview îl poate cita ca atare. AIO-ul pe „cazier iasi" a citat chiar adresa din pagina lor. **[V]**
3. **Toate ghișeele din oraș, cu adresă și repere.** La Iași noi punem Poliția Municipiului la „alte ghișee în județ", fără adresă. Ei o pun ca al doilea ghișeu principal, cu „Otilia Cazimir 14, lângă Palas", și avertizează să nu fie confundată cu Rutiera de la nr. 29. **[V]**
4. **Tabel „din ce comună vii → cel mai apropiat ghișeu"** (cazierul-judiciar-online.ro). Acoperă căutările din jurul orașului fără să creeze pagini noi pe comune. **[V]**
5. **Dată de verificare recentă și reală** (01.11, la ei) față de 05.10 la noi. digigov o pune chiar în meta description. **[V]**
6. **FAQ de 8–9 întrebări locale** față de 3 la noi. **[V]**
7. **Schema `GovernmentOffice` + `OpeningHoursSpecification` (+ `GeoCoordinates`)** pe ghișeu, separată de oferta noastră. Noi avem doar `AdministrativeArea`. **[V]**
8. **Linkuri contextuale către județele vecine** (5), nu un bloc de 38 de orașe identic pe fiecare pagină. Blocul nostru e o bucată mare din similaritatea rămasă. **[V]/[I]**
9. **Preț și termen mai agresive**: 149 lei / 24–48h la cazierul-judiciar-online.ro, 189 lei la infocazier, față de 198 lei / 3–5 zile la noi. Asta ține de CTR și de conversie, nu de ranking. **[V]**
10. **Recenzii reale cu sursă** (video + Google Maps), nu testimoniale scrise de mână. **[V]**
11. **Pagină de cazier auto completă**: sinonimul „cazier rutier", DRPCIV, valabilitate, durată, „e legal?". Plus articole „cazier auto <oraș>" pe blog. **[V]**
12. **Pagini de oraș scrise de mână, cu adevărat diferite.** Iași↔Brașov dă la ei 0,05, la noi 0,47 mascat. Și structura H2 diferă de la un oraș la altul. **[V]**

### Ce NU copiem

- **infocazier: 3.284 de pagini pe comune**, toate cu `lastmod` 28.10, din același șablon (Zlatna↔Zerind 0,22, Iași↔Brașov 0,38 mascat). Încalcă regula 1 (granularitatea pe care instituția nu o are) și regula 2 (loturi). E exact profilul tăiat la eghiseul în august. Câștigă acum, dar e un risc pentru ei, nu un model pentru noi.
- **caziere.ro: SPA fără SSR, fără schema, fără preț, canonical spre homepage pe toate paginile, text generic „spinning".** Rankează **în ciuda** paginilor, nu datorită lor [I]. Avantajul probabil: brand/vechime (2022), backlinkuri și titluri exact-match. Nu am verificat backlinkurile, pentru că nu am avut o sursă gratuită fiabilă.
- **digigov: 145 de pagini CF + 43 de constatator pe județ.** Același tip de cluster pe care eghiseul l-a șters. Nu-l reproducem.
- **Formulări de tip „Document emis de Poliția Română"** în trust bar (cazierul-judiciar-online.ro). La noi se folosește verbul „obținem", iar instituția eliberează. OK ca fapt, dar nu ca badge.

---

## 4. Plan de acțiune CJO

### CRITIC

**C1. Scoate testimonialele inventate și schema `Review` aferentă.**
- **Observația [V]:** `src/components/sections/TestimonialsSection.tsx` are 5 testimoniale hardcodate („Maria Popescu, București", „Andrei Ionescu"…), toate cu rating 5. `datePublished` e **calculat** („2026-01-01" sau „2025-12-01"), iar recenziile intră în JSON-LD ca `Review` pe homepage, cazier auto, cazier fiscal, integritate și diaspora. Textul „L-am primit în aceeași zi" contrazice și termenul afișat (3–5 zile). E fix ce interzice regula 3 și ce politica Google tratează ca recenzii self-serving sau false. Nu putem dovedi că a contribuit la demotare, dar e cel mai clar semnal de spam găsit pe site.
- **Ce punem în loc:** recenzii reale, cu sursă și link: Google Business, dacă există un profil al CJO, sau export din comenzi. Nicio schema `Review`/`aggregateRating` până nu avem recenzii vizibile pentru acel serviciu.
- **Verifică și** „4.9/5 · 441 recenzii Google" pe `/cazier-judiciar-pentru-angajare`: are sursă curentă?
- **Cum știm că a eșuat:** Rich Results Test încă arată `Review` pe pagină, sau orice testimonial fără sursă rămâne în HTML.
- **Indicator GSC:** impresiile pe homepage și pe `/cazier-auto-online` peste 4–8 săptămâni. Nu ne așteptăm la un efect rapid.

**C2. Pe paginile de oraș, conținutul care răspunde la query trebuie să fie primul în HTML și în primul ecran.**
- **Observația [V]:** după rescrierea din 05.10 (IPJ întâi), commit-ul `4812265e` din 08.10 a pus „order form back above the fold". Acum H2-ul 1 e „Comandă cazierul online", iar textul începe cu pașii wizardului. Toți cei trei câștigători locali deschid cu „Pe scurt" + adresă + program.
- **Propunerea:** H1 = „Cazier judiciar <Oraș>". Imediat sub el, un paragraf „Pe scurt": toate ghișeele din oraș cu adresă, zilele cu program după-amiaza și oferta noastră (preț + termen) într-o propoziție, cu CTA. Formularul vine după tabelul de program, sau într-o coloană laterală pe desktop. Pe mobil: „Pe scurt" + CTA în primul ecran, wizardul imediat după.
- **Conflictul de conversie:** decizia din 08.10 a avut un motiv de conversie, iar lecția CJO din 05–08.10 (formularul sub pliu = formulare ÷3) rămâne valabilă. Propunerea e un compromis: CTA în primul ecran, formularul la al doilea scroll. Se testează pe 5–6 orașe, nu pe toate.
- **Cum știm că a eșuat:** formularele pornite pe paginile de oraș scad cu >25% în 2 săptămâni.
- **Indicator GSC:** CTR pe „cazier <oraș>" și „program cazier <oraș>" la poziție constantă. Și citarea în AI Overview pe „cazier iasi", verificată manual cu `&pws=0`.

### HIGH

**H1. Title/meta pe intenția de program.**
- **Observația [V]:** toți cei 4 competitori pun „program" sau „adrese" în title. Noi punem „online, fără drum la poliție".
- **Propunerea:** „Cazier judiciar <Oraș>: program ghișee, adrese și varianta online". Meta description: „Verificat la <dată reală>" + preț.
- **Cum știm că a eșuat:** CTR-ul pe query-urile de oraș nu crește în 3–4 săptămâni la poziție egală.
- **Indicator GSC:** CTR pe paginile de oraș, segmentat pe query-uri care conțin „program".

**H2. Date locale complete, verificate lunar.**
- **Observația [V]:** la Iași ne lipsea adresa Poliției Municipiului, deși ea e în oraș. Concurentul are repere, link spre hartă, mapping comună→ghișeu și o dată de verificare mai nouă.
- **Propunerea:** pentru fiecare oraș, toate ghișeele din municipiu ca ghișee principale, cu adresă și reper. Un tabel „localitate → cel mai apropiat ghișeu" pentru comunele mari, **în aceeași pagină** (nu pagini noi). Data „Verificat la" chiar actualizată: se reverifică site-ul IPJ, nu se schimbă doar data.
- **Ritm:** maximum 1–2 orașe rescrise în profunzime pe săptămână (regula 2), începând cu cele care au pierdut cele mai multe clicuri: Iași, Brașov, Timișoara, Constanța, Sibiu, Arad, Baia Mare.
- **Cum știm că a eșuat:** Jaccard-ul mascat Iași↔Brașov nu scade sub 0,30 (azi e 0,47, concurentul are 0,06).
- **Indicator GSC:** impresiile pe query-uri long-tail noi pe pagină (străzi, comune, „după-amiaza").

**H3. Înlocuiește blocul de 38 de orașe cu 4–6 linkuri spre județele vecine, plus linkuri contextuale spre auto, integritate și firme.**
- **Observația [V]:** blocul nostru e identic pe 39 de pagini și umflă similaritatea. Câștigătorii leagă doar vecinii, în text.
- **Grija:** fiecare pagină de oraș trebuie să primească în continuare linkuri, deci menținem un hub (`/cazier-judiciar-online` sau homepage) care le listează pe toate (regula 5).
- **Cum știm că a eșuat:** inlinkurile pe pagină scad sub 5 în crawl-ul Screaming Frog.
- **Indicator GSC:** pagini indexate din clusterul de orașe, care nu trebuie să scadă.

**H4. Schema ghișeului.**
- **Observația [V]:** câștigătorii au `GovernmentOffice` + `OpeningHoursSpecification` (+ `GeoCoordinates`).
- **Propunerea:** marcăm **ghișeul IPJ** așa (nu pe noi, că nu suntem LocalBusiness), separat de `Service`/`Offer`, care rămâne al nostru.
- **Cum știm că a eșuat:** erori în Rich Results Test sau Search Console › Enhancements.
- **Indicator GSC:** nu e unul direct. Urmărim citarea în AI Overview pe programul ghișeului.

**H5. FAQ local de 6–8 întrebări pe oraș, cu răspunsuri care țin de oraș** (exemplu: „Copou sau Palas?", „sunt student", „vin din Pașcani"). Nu întrebări generice copiate între orașe.
- **Cum știm că a eșuat:** întrebările se repetă între orașe și cresc Jaccard-ul.

### MEDIUM

**M1. Rescrie `/cazier-auto-online`.**
- **Observația [V]:** 1.237 de cuvinte, fără diacritice, 5 linkuri interne, față de 2.387 la concurent, care acoperă sinonimul „cazier rutier", DRPCIV, valabilitate, durată și „e legal?".
- **Propunerea:** un H2 „Cazier rutier = cazier auto". Pe query-ul „cazier auto online", AIO-ul îi numește pe DigiGov și pe Caziere.ro ca alternative contra cost; noi nu suntem acolo.
- **Indicator GSC:** impresiile pe „cazier rutier" și „istoric sanctiuni".

**M2. Homepage: titlul.**
- **Observația [V]:** title-ul „…fără Cont pe HUB MAI" duce chiar unghiul HUB, pe care Raul îl vrea abandonat. Și H1-ul promite „în 1-2 Zile", deși standardul e 3–5 zile.
- **Propunerea:** un title pe beneficiul nostru (avocat, apostilă/traducere, diaspora, hârtie + curier), fără HUB. Un H1 coerent cu termenul standard.
- **Cum știm că a eșuat:** CTR-ul pe „cazier judiciar online" scade față de baseline, la poziție egală.

**M3. Preț și termen.** Asta e decizie de business, nu SEO: 149 lei / 24–48h la concurent față de 198 lei / 3–5 zile la noi. Merită măcar comunicat clar în snippet ce primește clientul în plus (hârtia originală, apostila, avocatul). **[I]**

**M4. Monitorizează SERP-ul săptămânal** cu `&pws=0` pe 10 query-uri. Semnalul care contează: dacă hub.mai.gov.ro și paginile IPJ rămân pe 1–2, plafonul de clicuri pe oraș e structural și nu reflectă un defect al paginii noastre.

---

## 5. eghiseul.ro (scurt)

- **Paginile de servicii sunt lungi** (cazier 4.067 de cuvinte, constatator 3.344, CF 4.542), cu schema bogată și fără testimoniale fabricate găsite (`Maria Popescu` nu apare în cod). **[V]** Aici nu e de copiat lungime.
- **digigov are 49 de pagini cazier, 145 CF și 43 constatator pe județ** (cele de CF: „program OCPI și birouri", 799 de cuvinte). **Nu copiem**: e exact clusterul șters la eghiseul în august. Echivalentul permis e o **singură** secțiune pe pagina CF / constatator, cu tabelul „birouri OCPI/ONRC pe județ" (adresă, program, sursă, dată), cu ancore interne, fără pagini noi.
- **Linkuri interne în conținut:** 5 pe constatator, 11 pe cazier. Sunt puține față de pagina locală a concurentului (14) și față de regula 5. **[V]**
- **Meta description la constatator** are „,," (typo). **[V]**
- **Pentru cazierul de pe eghiseul**, același răspuns „Pe scurt" (3 propoziții citabile: cine eliberează, cât costă la noi, termen) sus în pagină, pentru AIO. **[I]**

---

## 6. Limite

- SERP-ul e un singur snapshot (headless, fără login, o singură locație). Pozițiile reale din GSC sunt mediate.
- Backlinkurile nu sunt măsurate, pentru că nu am avut o sursă gratuită fiabilă. Avantajul caziere.ro rămâne **neexplicat on-page** și probabil ține de linkuri și brand. De verificat cu Ahrefs/Semrush, dacă există acces.
- Jaccard-ul nostru include formularul și blocul de orașe din `main`. Doar pe textul editorial ar fi mai mic. Al competitorilor a fost măsurat pe `main` (cazierul-judiciar-online, infocazier) sau pe tot body-ul (caziere.ro).
- Nu am atribuit cauzal scăderea niciunui factor. Notă din istoric: înainte de 05.10, paginile de oraș CJO aveau 0,76–0,92 Jaccard mascat (commit `2e4d5a28`), adică exact în fereastra update-ului din septembrie. Recuperarea după un clasificator de spam durează de regulă luni, nu săptămâni, deci rescrierea din 05.10 nu are cum să se vadă încă. **[I]**
