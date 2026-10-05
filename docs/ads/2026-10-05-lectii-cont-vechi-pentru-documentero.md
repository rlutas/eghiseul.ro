# Ce ne învață contul vechi de Google Ads pentru campaniile documentero (05.10.2026)

Surse: exportul complet al contului eghiseul **677-995-5005** din 31.08.2026 (`data/2026-08-31/` +
raportul brut de termeni de căutare din `data/raw/`, 53.069 termeni, 5 ian. 2024 – 31 aug. 2026),
analizele din 18.08 și 31.08, research-ul de celibat (`meta/12`, `meta/13`) și comenzile plătite din DB
(platforma nouă, 07.07 – 05.10.2026). Comparat cu pachetul `2026-10-05-documentero-campanii.md`.

## Pentru echipă

- **Cazierul fiscal e singurul serviciu din listă care a făcut bani dovediți pe Google Ads:** cost per
  vânzare ~42 lei, la un preț de 198 lei. Îi dăm mai mult buget decât în pachet.
- **Certificatul de celibat e al doilea:** a vândut din reclamă (~35 de comenzi, ~200 lei costul unei
  vânzări). La prețul de azi, cu opțiunile incluse (media e 1.204 lei/comandă), iese pe plus.
- **Naștere și căsătorie nu au vândut aproape nimic din reclamă în contul vechi.** Pe naștere s-au dus
  9.100 de lei, pe căsătorie 5.700, și aproape niciun leu din ele n-a adus o comandă de naștere sau de
  căsătorie. Pornim cu buget mic și ne uităm la ele ca la un test.
- **Clienții de stare civilă sunt aproape toți din străinătate**: 4 din 5 comenzi plătite. Elveția și
  Cipru apar în comenzi, dar lipsesc din pachet.
- **Cine începe o comandă de naștere sau de celibat o plătește rar:** cam 1 din 7. Clicurile din
  reclamă vor avea aceeași problemă dacă formularul nu se repară.
- Repetăm ce a mers: cuvinte cheie exacte, excluderi încă din prima zi, o campanie separată pentru
  fiecare serviciu și o singură conversie, „Achiziție".

---

## 0. Cât de mult ne putem baza pe date

| Limită | Ce înseamnă |
|---|---|
| **Conversiile vechi sunt amestecate.** Contul număra ca „Purchase” și evenimente cu valoare 1 leu (coș, apeluri, „Eliberare certificat de naștere” ca acțiune separată). | Unde valoarea medie pe conversie e de câțiva lei, conversiile nu sunt vânzări. Tabelele de mai jos estimează **vânzările reale după valoare**, nu după numărul brut. |
| Valorile vechi sunt la prețurile de atunci (celibat ~400 lei, fiscal ~140 lei). | ROAS-ul istoric subestimează ce ar ieși azi la aceeași rată de conversie. |
| Raportul de termeni acoperă doar o parte din cost (Google ascunde termenii rari): ~44% la celibat, ~50% la naștere. | Lista de termeni irosiți e o margine inferioară. |
| Comenzile cu atribuire există abia de la cutover (iul. 2026), iar în perioada asta contul a fost blocat pe politică. | **0 comenzi cu `gclid`** pe cele 5 servicii în ultimele 3 luni. Datele din DB arată cererea organică, nu Ads. |
| Locația țintită de vechile campanii de stare civilă nu apare în export. | Nu putem spune dacă naștere/căsătorie au eșuat din cauza produsului sau pentru că au țintit doar România. |

---

## 1. Pe serviciu: ce a produs contul vechi

### 1.1 Rezultate pe campanie (toată perioada)

| Campanie veche | Cost | Clicuri | CPC mediu | Conv. brute | Rată conv. | Valoare | ROAS nominal | **Vânzări reale estimate** | **CPA real** |
|---|---|---|---|---|---|---|---|---|---|
| OTP – CAZIER FISCAL | 105.010 | 72.085 | **1,46** | 2.499 | **3,5%** | 348.414 | **3,32** | ~2.400 (valoare medie 139 lei = vânzări) | **~42 lei** |
| OTP – CERTIFICAT DE CELIBAT | 8.075 | 1.886 | **4,28** | 39 | 2,1% | 14.480 | 1,79 | **~35** (cuvântul „certificat de celibat”: 34 conv., 13.774 lei) | **~200–230 lei** |
| OTP – CERTIFICAT DE NAȘTERE | 9.112 | 4.975 | 1,83 | 54 | 1,1% | 8.342 | 0,92 | **~0**: 8.100 din cei 8.342 lei valoare vin din cuvinte de **cazier și constatator** puse greșit în campanie; cuvintele de naștere au adus 235 lei | **n/a** |
| OTP – CERTIFICAT CĂSĂTORIE | 5.672 | 1.348 | **4,21** | 3 | 0,2% | 82 | 0,01 | **0** | **n/a** |
| OPT – Căsătorie + Naștere | 305 | 359 | 0,85 | 0 | 0% | 0 | 0 | 0 | n/a |
| Extras multilingv | *fără campanie proprie*; 456 lei pe termeni „multilingv/internațional”, 0 vânzări de extras | | | | | | | **fără date** | |

Alte campanii au prins și ele termeni de fiscal: pe toate campaniile, termenii cu „fiscal” au costat
124.097 lei pentru 3.006 conversii, **CPA 41 lei**. Campania generică „ASSISTENTA NOU” a prins
556 dintre ele, la CPA ~23 lei.

### 1.2 Fiscal pe tip de potrivire (doar campania OTP – CAZIER FISCAL)

| Potrivire | Clicuri | Cost | Conv. | CPA |
|---|---|---|---|---|
| Exactă | 24.362 | 40.870 | 1.094 | **37** |
| Exactă (variantă apropiată) | 7.244 | 12.282 | 290 | 42 |
| Expresie | 827 | 1.349 | 38 | **35** |
| Amplă | 26.469 | 32.320 | 692 | 47 |

Exact și frază ies cel mai bine, deci pachetul are dreptate să nu folosească broad.

### 1.3 Ce înseamnă azi (valoarea comenzii din DB)

| Serviciu | Plătite (07.07–05.10) | AOV azi | Din străinătate (telefon/livrare) | Plată / comenzi începute | CPA maxim (analiza 18.08) | Rată conv. istorică ⇒ **CPC maxim sustenabil** |
|---|---|---|---|---|---|---|
| Cazier fiscal | 29 (9 în ultimele 30 de zile) | **198** (nimeni n-a luat urgența) | 2/29 (UK) | **63%** | 70 | 3,5% ⇒ **2,45 lei** |
| Celibat | 7 | **1.204** (698 + opțiuni 299 + livrare 207) | **5/7** (DE ×2, UK, ES, SK, BE, CY; **0 din Italia**) | **15%** | 200 | 2,1% ⇒ **4,20 lei** |
| Naștere (duplicat) | 16 | **1.258** | **12/16** (IT ×3, UK + Jersey ×2, DE ×2, NL, CH, CY, MD) | **15%** (94 de comenzi neplătite) | 200 | necunoscută; la 1% ⇒ **2 lei** |
| Căsătorie (duplicat) | 5 | **1.208** | 4/5 (DE ×2, FR, IT) | 25% | 200 | necunoscută ⇒ **2 lei** |
| Extras multilingv naștere | 15 | **1.031** | **13/15** (**CH ×3**, FR ×3, IT ×3, DE ×2, NL, BE) | 42% | 200 | necunoscută ⇒ 3 lei |
| Extras multilingv căsătorie | 5 | **1.052** | 4/5 (IT, BE, AT, ES) | 56% | 200 | idem |

Atribuirea ultimei vizite: pe toate serviciile, ~⅓ din comenzi vin din Google organic, ~⅔ fără
referrer (direct sau în-app), una din ChatGPT și una din Bing. **Nicio comandă din Google Ads.**

### 1.4 Cuvintele care au convertit (termeni reali, toată perioada)

**Cazier fiscal** (CPA = cost / conversii; valori reale)

| Termen | Clicuri | Cost | Conv. | CPA | În pachet? |
|---|---|---|---|---|---|
| cazier fiscal online | 20.351 | 37.152 | 1.089 | **34** | ✅ exact + frază |
| **cazier fiscal** | 8.652 | 16.723 | 389 | **43** | ❌ **lipsește**, al doilea ca volum |
| cazier fiscal persoana fizica | 3.310 | 9.811 | 155 | 63 | ✅ exact |
| cazier fiscal anaf online | 1.728 | 2.757 | 78 | 35 | ✅ exact |
| **anaf cazier fiscal online** | 1.899 | 2.487 | 62 | 40 | ❌ (ordinea inversă nu e variantă apropiată sigură) |
| cazier fiscal persoana fizica online | 1.030 | 2.244 | 54 | 42 | ❌ |
| certificat de cazier fiscal | 1.057 | 2.033 | 51 | 40 | ✅ frază |
| **certificat cazier fiscal online** | 421 | 825 | 36 | **23** | ❌ |
| **cazier fiscal anaf** / **anaf cazier fiscal** | 1.640 | 2.471 | 62 | 32–46 | ❌ |
| **eliberare cazier fiscal online** / **eliberare cazier fiscal** | 1.021 | 1.779 | 41 | 32–61 | ❌ |
| eliberare cazier fiscal online persoane fizice | 827 | 1.025 | 28 | 37 | ❌ |
| cazier financiar | 1.228 | 1.431 | 22 | 64 | ❌ |
| cazier fiscal firma online / persoana juridica online | 893 | 1.704 | 18 | **75–290** | ✅ F2: **slab** |

**Celibat**

| Termen | Clicuri | Cost | Conv. | CPA | Notă |
|---|---|---|---|---|---|
| certificat de celibat (cuvânt cheie, toate termenii) | 1.517 | 5.841 | 34 | **172** | singurul motor real |
| certificat de celibat online | 59 | 171 | 3 | 57 | |
| certificat de celibat romania | 178 | 515 | 3 | 176 | |
| anexa 9 stare civila | 66 | 579 | 1 | 579 | CPC **8,77**, prea scump |
| certificat celibat online | 18 | 218 | 0 | – | CPC **12** |
| adeverinta de celibat | 50 | 158 | 0,2 | 633 | |

**Naștere / căsătorie:** singurele termene cu o vânzare plauzibilă sunt „eliberare duplicat certificat
de nastere” (2 conv. / 44 lei), „duplicat certificat de nastere online” (1,5 / 258 lei) și „duplicat
certificat de casatorie” (1 / 9 lei). **„Certificat de nastere online” a costat 2.165 lei pe cuvântul
cheie, cu 8 „conversii” în valoare totală de 107 lei, deci zero vânzări.** În pachet e cuvânt cheie exact.

### 1.5 Bani irosiți (termeni reali, 0 conversii)

| Unde | Ce | Cost | Acoperit de pachet? |
|---|---|---|---|
| Campaniile de stare civilă | **termeni din alte servicii** (cazier judiciar „gratuit”, constatator, ONRC, integritate, „criminal record”) | **5.013 lei = 38%** din costul termenilor | parțial: doar `cazier` e negativ |
| Stare civilă | gratuit / gratis | 1.160 (8,7%) | ✅ |
| Stare civilă | oraș / sector („eliberare certificat de nastere galati”, „…craiova”, „certificat de celibat bucuresti”) | 906 (6,8%) | doar sectoarele ❌ orașele |
| Stare civilă | model / formular / cerere / pdf / anexa | 446 | ✅ |
| Stare civilă | primărie, SPCLEP, ambasadă | 273 | ✅ primăria; ❌ `ambasada` (vezi §2.3) |
| Naștere | „certificat de nastere **romanesc**” (+ „programare online”, „dupa juramant”, „depunere”) = transcriere după cetățenie | ~290 | ❌ |
| Naștere / căsătorie | „international”, „european”, „digital” | ~150 | ❌ |
| Naștere | „la urgente”, „la urgenta” | 62 | ❌ (nu avem urgent la stare civilă) |
| Celibat | „certificat de cutuma” (monopol consular, nu e produsul nostru) | 57 | ❌ |
| Celibat | „celibatar” (3 variante) | 140 | – (nu e cuvânt cheie; doar de urmărit) |
| Fiscal | „certificat fiscal” / „atestare fiscală” / auto / mașină | **20.276 (22%)**, 457 conv. | ✅ negativ. **Păstrează-l**: e alt document (vezi §2.3) |
| Fiscal | „cum scot”, „de unde se obține”, „ce înseamnă” | ~330 | parțial (`unde`) |
| Fiscal | taxă cazier fiscal | 49 | ❌ |

În tot contul, din 53.069 de termeni, **46 au fost excluși vreodată**. Restul de 52.354 au „Niciunul”
la coloana de excluderi.

---

## 2. Modificări concrete în pachet

### 2.1 Buget (150 lei/zi rămân)

| Campanie | Pachet | **Propus** | De ce |
|---|---|---|---|
| C1 Celibat | 45 | **45** | Al doilea serviciu dovedit (CPA ~200, AOV 1.204). |
| C2 Cazier fiscal | 40 | **50** | Singurul dovedit la scară: CPA 34–43 pe cuvintele de bază, la un CPA maxim de 70. Cu 3,5% conversie, 50 lei/zi aduc ~1 comandă pe zi, deci cel mai rapid semnal pentru licitare. |
| C3 Naștere | 25 | **20** | Contul vechi: zero vânzări din 9.100 lei. Cerere organică reală (16 comenzi), dar plata se face doar la ~15% din comenzile începute. |
| C4 Căsătorie | 15 | **10** | Contul vechi: zero vânzări din 5.700 lei, CPC 3,4–6,6. Volum organic mic (5). |
| C5 Multilingv | 25 | **25** | Nicio campanie în trecut, dar 20 de comenzi organice, 85% din diaspora și cea mai bună rată de plată din stare civilă (42–56%). |

### 2.2 Plafoane CPC (faza 1, Maximize clicks)

| Campanie | Pachet | **Propus** | Calcul |
|---|---|---|---|
| C1 Celibat | 3,50 | **3,50** (urci la 4 doar dacă pierzi >50% din afișări pe rang) | CPA 200 × 2,1% = 4,20 maxim; istoric 3,85 cu concurent, azi fără concurent |
| C2 Fiscal | 2,50 | **2,50** ✅ | 70 × 3,5% = 2,45. Testul din aug. 2026 (cu roghiseul în licitație) a plătit 2,82–2,96, deci așteaptă-te la cotă de afișări mică pe [cazier fiscal online] |
| C3 Naștere | 3 | **2** | CPC istoric 1,0–1,6 pe termenii de duplicat; rata de conversie e nedovedită |
| C4 Căsătorie | 3 | **2** | idem; la 3 lei și 0,2% conversie, o vânzare ar costa 1.500 lei |
| C5 Multilingv | 3 | **3** ✅ | fără istoric; cea mai bună rată de plată din stare civilă |

### 2.3 Cuvinte cheie: adaugă / scoate

| Grup | Adaugă | Scoate sau pune pe pauză | Motiv |
|---|---|---|---|
| F1 | `[cazier fiscal]`, `[anaf cazier fiscal online]`, `[cazier fiscal anaf]`, `[anaf cazier fiscal]`, `"eliberare cazier fiscal"`, `[certificat cazier fiscal online]`, `[cazier fiscal persoana fizica online]`, `[cazier financiar]` | `[cat costa cazierul fiscal]` (termenii de preț și taxă: 40 lei, 0 conv.; campania din aug. îl avea ca negativ) | cuvintele din §1.4 cu CPA 23–64 |
| F1 | – | `"cazier fiscal rapid"`, `"urgent"`, `"pe email"`, `"prin avocat"` pot rămâne, dar n-au istoric | – |
| F2 | – | ține doar exactele `[cazier fiscal persoana juridica]`, `[cazier fiscal firma online]`, `[cazier fiscal srl]`; frazele pe pauză | istoric CPA 75–290; 2 din 29 de comenzi sunt PJ |
| N1 | `[eliberare duplicat certificat de nastere]` | **`[certificat de nastere online]`** (2.165 lei, 0 vânzări) | |
| N2 | – | `"certificat de nastere nou"` → doar exact `[certificat de nastere model nou]` | „certificat de nastere nou” / „certificat nastere nou”: 35 lei, 0 conv.; fraza e prea largă |
| M1 | – | `[certificat de casatorie online]` → pauză (169 lei / 1 conv. și CPC istoric 6,58) | |
| X1 | `"certificat de nastere international"`, `"certificat de casatorie international"` (în X2) | – | Oamenii numesc extrasul „internațional”. În contul vechi acești termeni ajungeau pe pagina de duplicat (0 conv.), deci îi trimitem la pagina corectă. |
| CB1 | – | `"anexa 9 celibat"`, `"adeverinta anexa 18"` → exact, nu frază | „anexa 9 stare civila” a avut CPC 8,77 și CPA 579 |

### 2.4 Negative lipsă

**Pe C1, C3, C4 și C5 (lista „Negative – stare civilă”)**

| Negativ | Tip | Dovada |
|---|---|---|
| `constatator`, `onrc`, `judiciar`, `integritate`, `grefa`, `"criminal record"`, `firma` | broad | 38% din costul termenilor vechi a mers pe alte servicii |
| `urgent`, `urgenta`, `urgente` | broad | „certificat de nastere la urgente”: 0 conv. Urgentul nu există la stare civilă. |
| `inseamna`, `"ce inseamna"` | frază | termeni informativi, 0 conv. |
| `digital`, `pdf` (pdf există deja) | broad | Actul e pe hârtie. Vechile reclame promiteau „PDF/emis digital”, iar cine căuta asta nu cumpăra. |
| orașele reședință de județ (lista de 41) + `bucuresti` | broad, **doar pe C3 și C4** | 906 lei pe oraș + certificat. Din 2024 duplicatul se cere la orice primărie, deci căutarea „oraș + certificat” caută ghișeul. Pe C1 nu le pui: din diaspora, omul caută des cu orașul natal (vezi compromisul cu `primaria` din pachet). |

**Doar pe C3 și C4:** `romanesc`, `romanesti`, `juramant`, `"programare online"`, `depunere`, `international`,
`european`. „Certificat de nastere romanesc” înseamnă transcriere după cetățenie, care e alt produs.
Termenii cu „internațional” se mută în C5.

**Doar pe C1:** `cutuma`, `"nulla osta"`. Sunt documente consulare, nu produsul nostru (research `meta/12` §0).

**De urmărit, NU de exclus acum:** `ambasada` și `"ambasada romaniei"` pe C1 (162 lei, 0 conv. în contul
vechi, însă pachetul păstrează intenționat `consulat` ca intenție de client). Dacă trec de 150 lei fără
nicio comandă, îi excluzi.

**C2 Fiscal:**

| Schimbare | Dovada |
|---|---|
| **Păstrează** `atestare` și `"certificat fiscal"` ca negative | 22% din costul istoric, CPA nominal 44, dar e **alt document** (datoriile). Changelog-ul din 25.09 arată că site-ul vechi spunea greșit că cazierul fiscal „atestă lipsa datoriilor”, deci acele vânzări erau probabil comenzi pentru produsul greșit. |
| Adaugă `masina`, `impozit`, `"taxe locale"`, `primarie`, `"al transportatorului"`, `"cum scot"`, `"cum se obtine"`, `"ce inseamna"`, `taxa` | termeni irosiți din §1.5 |
| **Reconsideră `gratuit`** pe fiscal | „cazier fiscal online gratuit” a avut **30 conv. la CPA 39**, ca media. Reclama spune deja „Gratuit la ghișeu sau din SPV”, deci clicul vine informat. Propunere: **nu** îl excluzi din prima zi și decizi după 14 zile pe datele tale. Pe stare civilă rămâne exclus. |

### 2.5 Locații

| Campanie | Pachet | Propus | Dovada |
|---|---|---|---|
| C1 Celibat | RO + IT, ES, DE, UK, FR, AT, BE, NL, IE | **+ CH, CY**. UK rămâne (1 comandă din 7, deși research-ul spunea zero cerere). | Comenzi celibat: DE ×2, UK, ES, SK, BE, CY. **Italia: 0**, deși research-ul o punea prima. Nu da prioritate Italiei în buget până nu o confirmă datele. |
| C3 Naștere / C4 Căsătorie | RO + 9 țări | **+ CH, CY** | Naștere: CH, CY, Jersey |
| C5 Multilingv | fără UK | **+ CH (de verificat)** | **3 din 15** extrase de naștere au mers în Elveția. Elveția nu e în UE, deci întâi verifici că landingul nu promite „fără apostilă” pentru CH. Dacă promite, CH merge doar în C3/C4. |

### 2.6 Neconcordanțe în documente (de corectat)

1. **Numărarea conversiei.** Pachetul (§6) spune „Count = One”, iar contul are „Fiecare” cu deduplicare
   pe `transaction_id`. Pentru achiziții, „Fiecare” e corect, deci se corectează textul din pachet.
2. **Regula de oprire.** Pachetul (§5) oprește un cuvânt cheie după ~700 lei fără conversie, iar
   documentul de lansare (§8) oprește grupul la 2× CPA maxim (400 lei stare civilă, 140 fiscal).
   Propunere: **grupul la 2× CPA maxim**, cuvântul cheie la 1× AOV. Pe celibat, cu CPA așteptat
   ~200, probabilitatea de 0 vânzări în 400 lei din pură întâmplare e ~14%, deci regula e acceptabilă.

---

## 3. Ce a eșuat în contul vechi și nu se repetă

| # | Greșeala | Cât a costat | Regula în contul documentero |
|---|---|---|---|
| 1 | **Conversii amestecate** (coș, apeluri, „Eliberare certificat de naștere” ca acțiune separată, valoare 1 leu), cu tROAS pe ele | Extras CF: 12.280 de „conversii” la ~19 lei valoare; algoritmul a optimizat pe evenimente ieftine | O singură acțiune primară: **Achiziție documentero**. Nimic altceva Primary, niciodată. |
| 2 | **Cuvinte cheie puse în campania greșită**: „cazier judiciar online gratuit” și „certificat constatator” în campania de naștere, „acte necesare pentru certificat de nastere” în cea de căsătorie | 38% din costul pe stare civilă; ROAS-ul campaniei de naștere arăta 0,92 deși naștere vânduse ~0 | Negative încrucișate pe fiecare campanie (§2.4) și verificare, la creare, că fiecare cuvânt cheie aparține serviciului din titlul campaniei. |
| 3 | **Zero excluderi** | >52.000 lei pe căutări de instituție (`onrc`, `ghiseul ro`); 52.354 de termeni neexcluși | Lista de negative din ziua 1, plus raportul de termeni în ziua 3, 7 și 14, apoi săptămânal |
| 4 | **Broad, PMax, AI Max** pe termeni generici | PMAX-GENERAL: 23.644 lei, valoare 0,66 lei. Pe stare civilă, broad a luat 43% din cost. | Doar exact și frază; fără PMax și AI Max până la 30+ conversii pe campanie |
| 5 | **Remarketing pe Search cu licitare liberă** | CPC 17,87, cost 8.344 lei, ROAS 0,06 | Fără RLSA sau remarketing în faza 1 |
| 6 | **Alocare pe dos**: banii pe ce nu mergea | fiscal (ROAS 3,3): 105.000 lei; Extras CF (ROAS 0,48): 495.000 lei | Bugetul urmează CPA-ul real, verificat săptămânal |
| 7 | **Reclamă la un produs care nu se livra** (Extras CF cu ANCPI picat) | ~257.000 lei pierdere brută | Înainte de a crește bugetul pe un serviciu, verifici livrarea în DB. Azi: naștere 13/16 livrate, celibat 6/7, căsătorie 5/5, multilingv 19/20, fiscal 28/29. |
| 8 | **Reclame care promiteau ce nu e adevărat**: „Certificat în format PDF”, „emis digital”, „Il emitem oficial”, „Eliberăm dovada de celibat”, „Model certificat căsătorie” | aduceau căutări de formular sau gratuitate; risc de Misrepresentation | Pachetul nou e curat. Păstrezi verbul „obținem”, fără „oficial” și fără „PDF” la stare civilă. |
| 9 | **Sitelinkuri la nivel de cont** | au propagat respingerile de politică pe campanii nevinovate (19.08) | Toate asset-urile la nivel de campanie |
| 10 | **Conturi noi după respingere** | contul 243-638-4990 (01.09) a fost respins pe loc: „Este obligatoriu un certificat” | ⚠️ Contul 809-020-5311 e **al treilea**, are același login cu ecazier (blocat) și același plătitor. Dacă primești același mesaj „certificat obligatoriu”: **o singură contestație**, fără alt cont (`Circumventing systems` se întinde pe eghiseul și CJO). |
| 11 | **Wizardul pierde cuvintele și anunțul** la refresh sau la navigare | 2 reconstrucții (18.08, 31.08) | Completezi pasul dintr-o bucată, apeși „Terminat”, verifici „Probleme” înainte de publicare |

---

## 4. Riscul cel mai mare, care nu ține de reclamă

Comenzile de **naștere** și **celibat** se plătesc la ~15% din cele începute (94 de comenzi de naștere
neplătite în 3 luni), față de 42–63% la multilingv și fiscal. Analiza din 18.09 (memoria
`abandonuri-pas-2`) arată că majoritatea abandonurilor sunt la pasul 2, înainte de plată. Fiecare clic
plătit pe naștere sau celibat intră în același formular. Dacă după 14 zile campaniile au clicuri și
comenzi începute, dar nu plătite, problema e formularul, nu licitarea.
