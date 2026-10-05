# Google Ads Search – pachet documentero.ro: stare civilă + cazier fiscal (cazier judiciar = faza 2)

Versiunea 2, 05.10.2026. Înlocuiește pachetul de dimineață (doar caziere), păstrat ca `ads-pack-v1-cazier.md`.

**Decizia de azi (05.10.2026):** pornim pe serviciile unde concurența NU face reclamă, în ordinea:

1. Certificat de celibat
2. Cazier fiscal (doar roghiseul.ro îl atinge, și acolo ca sitelink / anunț combinat cu judiciarul)
3. Certificat de naștere (duplicat)
4. Certificat de căsătorie (duplicat)
5. Extras multilingv

Cazierul judiciar rămâne în fișier, în **Anexa – Faza 2**, nelansat.

Contul, plata și publicarea le faci tu. Aici e conținutul, gata de lipit.

---

## 0. Verificarea cererii: cine face reclamă (05.10.2026, dimineața)

### SERP google.ro (`&pws=0`, cookie-uri respinse, IP din România)

| Căutare | Reclame afișate |
|---|---|
| certificat de celibat | **0** |
| certificat de celibat online | **0** |
| certificat de nastere duplicat | **0** |
| duplicat certificat de nastere online | **0** |
| certificat de casatorie duplicat | **0** |
| extras multilingv | **0** |
| extras multilingv certificat de nastere | **0** |
| cazier fiscal online | **0** (în acel moment) |
| cazier judiciar online *(control)* | **3**: infocazier.ro („Preț: 189 RON”) și roghiseul.ro ×2 („Cazier judiciar in aceeași zi”) |

Controlul arată că scriptul vede reclamele când ele există. Deci zero-urile de pe stare civilă sunt reale, nu o eroare de citire.

### google.it / .es / .de

**Nu am putut verifica.** La prima căutare pe google.it, Google a cerut CAPTCHA (HTTP 429). Conform instrucțiunii, nu l-am rezolvat și m-am oprit. Oricum, de pe un IP românesc SERP-ul din Italia nu e reprezentativ: Google decide după locația reală. Ce poți face tu: în Google Ads, la **Instrumente → Previzualizare și diagnosticare anunțuri**, alegi locația Italia / Spania / Germania și limba română, apoi cauți cele 3 fraze. Instrumentul nu consumă afișări.

### Ads Transparency Center (pe domeniu, ultimele 30 de zile)

| Domeniu | Advertiser (verificat) | Reclame RO | Reclame IT | Ce promovează |
|---|---|---|---|---|
| roghiseul.ro | CENTRUL DE SOLUȚII ADMINISTRATIVE S.R.L. | 24 | **12** | Cazier judiciar, cazier fiscal, certificat constatator. **Nimic pe stare civilă.** Rulează și în Italia, deci diaspora e deja targetată pe caziere. |
| infocazier.ro | Cabinet Avocat Grosu Alexandru | ~200 | 5 | Cazier judiciar (189 RON), cazier PJ (156 RON), integritate. Una dintre descrieri pomenește „duplicate certificate de naștere și căsătorie”, dar nu există grup dedicat sau titluri pe stare civilă. |
| econsulat.ro, acte-romania.ro, actedestarecivila.ro, certificatdecelibat.ro, certificat-celibat.ro, e-acte.ro | – | 0 | 0 | – |
| documentero.ro | – | 0 | 0 | cont nou, curat |

**Concluzie.** Pe celibat, naștere, căsătorie și multilingv nu face nimeni reclamă cu anunțuri dedicate, nici în România, nici în Italia (pentru restul țărilor, ATC nu a arătat alți advertiseri pe domeniile verificate). Asta înseamnă două lucruri:

- **CPC mic și impresii ieftine.** Licitezi practic singur.
- **Cerere nedovedită pentru varianta plătită.** Nimeni n-a validat că oamenii cumpără asta din reclamă. Primele 2–3 săptămâni sunt un test de cerere, nu de scalare. SERP-ul organic e dominat de primării și de econsulat.ro (calea gratuită), deci o parte mare din căutări sunt „fă-o singur”. Negativele de mai jos taie din ele, dar nu pe toate.

Un semnal pentru nota de politică (§7): **doi intermediari (unul e cabinet de avocat) rulează reclame active pe caziere, în RO și în IT, la 05.10.2026.**

---

## 1. Fapte de pe landinguri (citite live, 05.10.2026) – singura sursă pentru reclame

| Serviciu | URL | Preț (onorariu avocat, taxe, TVA incluse) | Termen | Opțiuni cu preț afișat |
|---|---|---|---|---|
| Certificat de celibat (adeverință privind statutul civil, Anexa 18, fosta Anexa 9) | `/certificat-de-celibat/` (index) | **698 lei** | legal **≤30 de zile**; valabil 6 luni în RO, majoritatea statelor UE îl cer mai nou de 90 de zile | apostilă Haga +198 · traducere +178,50 · legalizare +99 · apostilă notari +83,30; curierul se adaugă la final |
| Certificat de naștere, duplicat | `/certificat-de-nastere/` (index) | **998 lei** | legal ≤30 de zile | extras multilingv în aceeași comandă +398 · apostilă +198 · traducere +178,50 · legalizare +99 |
| Certificat de căsătorie, duplicat (și cu mențiunea de divorț) | `/certificat-de-casatorie/` (index) | **998 lei** | legal ≤30 de zile | extras multilingv căsătorie +398 · apostilă +198 · traducere +178,50 · legalizare +99 |
| Extras multilingv de naștere (Reg. UE 2016/1191) | `/extras-multilingv/` (index) | **798 lei** | legal ≤30 de zile; nu expiră | + duplicat certificat de naștere +498 |
| Extras multilingv de căsătorie | `/extras-multilingv/#casatorie` (secțiune pe aceeași pagină) | **798 lei** | legal ≤30 de zile | – |
| Cazier fiscal PF și PJ | `/cazier-fiscal-online/` (**noindex**, live) | **198 lei** | **3 zile lucrătoare**, standard; valabil 30 de zile | procesare urgentă +100 (= 298 lei, „prioritate la depunere”, **fără termen afișat**) · traducere +178,50 · apostilă Haga +198 |

**Ce NU am pus în reclame, pentru că nu se poate susține din pagină:**

- **Orice termen mai scurt de 30 de zile la stare civilă.** Paginile publică mediane reale (jumătate din comenzi ajung la client în ≤19 zile, la căsătorie în ≤22), dar pe eșantioane de 4–12 comenzi, marcate „eșantion mic”. O reclamă cu „în 19 zile” e promisiune, nu statistică. Folosim doar „Termen legal: max. 30 de zile”.
- **Urgent la stare civilă.** Nu există ca opțiune.
- **Termenul pentru urgent la fiscal.** Pagina dă doar prețul (+100 lei) și „prioritate la depunere”. Reclamele spun exact atât, fără zile.
- **Prețul curierului.** Pe landing nu apare o sumă, deci nu apare nici în reclame.
- **Rating și recenzii.** Landingurile arată „4,9 · 470 recenzii” cu sursa (profilul Google eDigitalizare), dar în textul reclamelor nu le punem. Dacă se califică, stelele vin automat, prin seller ratings.
- **„Banii înapoi”.** Pe pagină e condiționat („dacă primăria refuză și nu se poate rezolva”). Scurtat la 30 de caractere ar deveni promisiune necondiționată, așa că lipsește din reclame.

**Diferențe de corectat pe landinguri ÎNAINTE de lansare:**

1. **Footerul paginii `/cazier-fiscal-online/`** spune „Documentele sunt emise exclusiv de oficiile de stare civilă”. Pe o pagină de cazier fiscal e fals: îl eliberează ANAF. E textul pe care îl citește revizorul Google, deci footerul trebuie să depindă de serviciu.
2. **Celibat, primul paragraf:** „Documentul se numește oficial «adeverință privind statutul civil»” pune „oficial” lângă „document”, iar regula noastră interzice perechea. Înlocuiește cu „Numele legal al documentului este…”.
3. **Fiscal: documentero spune „3 zile lucrătoare”, eghiseul spune „1–3 zile lucrătoare”.** Reclamele merg pe documentero (3 zile). Decide dacă aliniezi eghiseul.
4. **Extras multilingv de căsătorie nu are landing propriu.** H1-ul paginii e despre naștere, iar căsătoria e o secțiune mai jos. Grupul X2 trimite la `#casatorie`. Dacă X2 primește clicuri, o pagină dedicată (sau `?act=casatorie`, cu H1 schimbat) îi crește Quality Score-ul.

---

## 2. Structura contului și bugetul (150 lei/zi)

Locația și limba se setează pe campanie. De aceea fiecare serviciu are campania lui: bugetul se mută între servicii fără să le amesteci.

| # | Campanie | Grupuri | Locații | Buget/zi | Pondere |
|---|---|---|---|---|---|
| C1 | **Certificat de celibat** | CB1 General · CB2 Căsătorie în străinătate | RO + IT, ES, DE, UK, FR, AT, BE, NL, IE | **45 lei** | 30% |
| C2 | **Cazier fiscal – RO** | F1 Persoană fizică · F2 Persoană juridică | România | **40 lei** | 27% |
| C3 | **Certificat de naștere** | N1 Duplicat · N2 Pierdut / model nou | RO + cele 9 țări | **25 lei** | 17% |
| C4 | **Certificat de căsătorie** | M1 Duplicat | RO + cele 9 țări | **15 lei** | 10% |
| C5 | **Extras multilingv** | X1 Naștere · X2 Căsătorie | RO + IT, ES, DE, FR, AT, BE, NL, IE (**fără UK**) | **25 lei** | 17% |
| – | *Faza 2: Cazier judiciar* | *J1–J5, Anexa* | – | *0* | – |
| | **Total** | | | **150 lei** | |

**De ce așa:**

- **Celibat și fiscal au 85 de lei din 150 (57%).** Sunt primele în decizie. Celibatul are cel mai clar profil de cumpărător (data căsătoriei e fixă, deci omul are un termen), iar fiscalul are cel mai mic preț, deci cel mai rapid feedback de conversie.
- **Extras multilingv fără Regatul Unit.** Regulamentul (UE) 2016/1191 se aplică doar între statele membre. În UK extrasul nu scutește de traducere și apostilă, deci un clic de acolo ar cumpăra produsul greșit. Pentru UK, landingul trimite la duplicat + apostilă + traducere (C3/C4).
- **România rămâne în campaniile de stare civilă.** Mulți comandă din țară pentru o căsătorie sau o rezidență în străinătate. Dacă după 14 zile RO cheltuie fără conversii, o excluzi (raportul **Locații → Unde s-au aflat utilizatorii**).
- **Cazierul fiscal doar în România.** Landingul nu are argument de diaspora, iar volumul din străinătate ar fi mic.
- **Fiecare campanie de stare civilă își acoperă singură toate țările.** Am ales să nu le spargem în „RO” și „Diaspora”, pentru că la 15–45 lei/zi împărțirea ar lăsa fiecare jumătate fără date. Separi abia când o țară depășește constant ~50% din cheltuială.

### Limba: română + limbile locale. De ce

Filtrul de limbă din Google Ads **nu** se uită la limba căutării, ci la semnalele utilizatorului: limba interfeței Google, a browserului și a telefonului, plus istoricul. Un român din Torino are de cele mai multe ori telefonul în italiană. Dacă campania țintește doar „română”, el nu vede reclama, chiar dacă tastează „certificat de celibat”.

Setare pe C1, C3, C4 și C5: **română, italiană, spaniolă, germană, engleză, franceză, olandeză**. Pe C2: română și engleză.

Riscul de a ajunge la nevorbitori de română e mic, din două motive:

1. Toate cuvintele cheie sunt în română, pe frază sau exact, și nu prind „certificato di stato libero”.
2. Reclamele și landingul sunt în română, deci cine nu citește română nu dă clic.

Primele zile, uită-te în raportul de termeni de căutare după variante locale (vezi negativele din §3.3).

**Nu adăugăm acum cuvinte cheie în limba locală** („nulla osta”, „certificado de soltería”, „Ehefähigkeitszeugnis”). Le caută mai ales partenerul străin sau oficiul, iar landingul e în română. Ar fi clicuri cu potrivire proastă și Quality Score mic. Se pot testa în faza 2, cu un landing tradus.

### Alte setări (toate campaniile)

| Setare | Valoare |
|---|---|
| Tip | Search. **Fără** Display Network, **fără** Search Partners la start. |
| Opțiune locație | **Prezență**: „persoane din sau prezente în mod regulat în locațiile vizate” (NU „interesate de”). |
| Program | **Toată ziua, toate zilele.** Fusul contului e al României, iar diaspora caută seara, în fusul ei. Ajustezi după 3–4 săptămâni, din raportul „Ziua și ora”. |
| Rotație reclame | Optimizare (implicit) |
| Auto-tagging | **ON** |
| AI Max / broad match / extindere automată a URL-ului final | **OFF** |
| Potrivire | Frază și exact. **Fără broad** până la 30+ conversii pe campanie. |

---

## 3. Cuvinte cheie și negative

Le-am scris fără diacritice, pentru că așa se caută. Notația: `[ ]` = exact, `" "` = frază.

### 3.1 Cuvinte cheie pe grupuri

**CB1 Celibat – general** (C1)

| Cuvânt cheie | Potrivire |
|---|---|
| [certificat de celibat] | exact |
| "certificat de celibat" | frază |
| [certificat de celibat online] | exact |
| "certificat celibat online" | frază |
| [adeverinta privind statutul civil] | exact |
| "adeverinta statut civil" | frază |
| "adeverinta anexa 18" | frază |
| "anexa 9 celibat" | frază |
| [dovada de celibat] | exact |
| "dovada de celibat" | frază |
| "adeverinta de celibat" | frază |
| [certificat de celibat romania] | exact |
| "obtinere certificat de celibat" | frază |
| "certificat de celibat prin avocat" | frază |
| [certificat de celibat pret] | exact |

**CB2 Celibat – căsătorie în străinătate** (C1)

| Cuvânt cheie | Potrivire |
|---|---|
| "certificat de celibat italia" | frază |
| "certificat de celibat spania" | frază |
| "certificat de celibat germania" | frază |
| "certificat de celibat anglia" | frază |
| "certificat de celibat uk" | frază |
| "certificat de celibat franta" | frază |
| "certificat de celibat belgia" | frază |
| "certificat de celibat olanda" | frază |
| "certificat de celibat austria" | frază |
| "certificat de celibat irlanda" | frază |
| "certificat de celibat pentru casatorie" | frază |
| "certificat de celibat din strainatate" | frază |
| [certificat de celibat apostilat] | exact |
| "certificat de celibat cu apostila" | frază |
| "certificat de celibat tradus" | frază |

Cross-group în C1: în CB1 adaugi ca negative exacte/frază `italia, spania, germania, anglia, uk, franta, belgia, olanda, austria, irlanda, strainatate, apostila, apostilat, tradus, casatorie`, ca acele căutări să meargă în CB2.

**F1 Cazier fiscal – PF** (C2)

| Cuvânt cheie | Potrivire |
|---|---|
| [cazier fiscal online] | exact |
| "cazier fiscal online" | frază |
| [cazier fiscal persoana fizica] | exact |
| "certificat de cazier fiscal" | frază |
| "cazier fiscal fara spv" | frază |
| [cazier fiscal anaf online] | exact |
| [cerere cazier fiscal online] | exact |
| "obtinere cazier fiscal" | frază |
| "cazier fiscal rapid" | frază |
| "cazier fiscal urgent" | frază |
| "cazier fiscal pe email" | frază |
| "cazier fiscal prin avocat" | frază |
| [cat costa cazierul fiscal] | exact |

**F2 Cazier fiscal – PJ** (C2). Landingul spune acum „PF și PJ”, deci grupul nu mai stă pe pauză.

| Cuvânt cheie | Potrivire |
|---|---|
| [cazier fiscal persoana juridica] | exact |
| "cazier fiscal firma" | frază |
| [cazier fiscal srl] | exact |
| "cazier fiscal pentru firma" | frază |
| "cazier fiscal societate" | frază |
| [cazier fiscal pj] | exact |
| [cazier fiscal firma online] | exact |
| "certificat cazier fiscal firma" | frază |
| "cazier fiscal pentru licitatie" | frază |

Cross-group în C2: în F1 adaugi ca negative `firma, srl, pj, juridica, societate, licitatie`.

**N1 Naștere – duplicat** (C3)

| Cuvânt cheie | Potrivire |
|---|---|
| [certificat de nastere duplicat] | exact |
| "certificat de nastere duplicat" | frază |
| [duplicat certificat de nastere] | exact |
| "duplicat certificat nastere" | frază |
| [duplicat certificat de nastere online] | exact |
| "eliberare duplicat certificat de nastere" | frază |
| [certificat de nastere online] | exact |
| "certificat de nastere din strainatate" | frază |
| "duplicat certificat de nastere din strainatate" | frază |
| "certificat de nastere prin avocat" | frază |
| [cerere duplicat certificat de nastere] | exact |

**N2 Naștere – pierdut / model nou** (C3)

| Cuvânt cheie | Potrivire |
|---|---|
| [certificat de nastere pierdut] | exact |
| "certificat de nastere pierdut" | frază |
| "am pierdut certificatul de nastere" | frază |
| [certificat de nastere deteriorat] | exact |
| "certificat de nastere nou" | frază |
| "certificat de nastere model nou" | frază |
| "certificat de nastere cu cnp" | frază |
| [inlocuire certificat de nastere] | exact |
| "schimbare certificat de nastere vechi" | frază |

Cross-group în C3: în N1 adaugi ca negative `pierdut, deteriorat, nou, cnp, vechi, inlocuire`.

**M1 Căsătorie – duplicat** (C4)

| Cuvânt cheie | Potrivire |
|---|---|
| [certificat de casatorie duplicat] | exact |
| "certificat de casatorie duplicat" | frază |
| [duplicat certificat de casatorie] | exact |
| "duplicat certificat casatorie" | frază |
| [certificat de casatorie pierdut] | exact |
| "certificat de casatorie pierdut" | frază |
| "certificat de casatorie cu mentiune de divort" | frază |
| "certificat de casatorie mentiune divort" | frază |
| [certificat de casatorie online] | exact |
| "certificat de casatorie din strainatate" | frază |
| "eliberare duplicat certificat de casatorie" | frază |

**X1 Extras multilingv – naștere** (C5)

| Cuvânt cheie | Potrivire |
|---|---|
| [extras multilingv] | exact |
| "extras multilingv" | frază |
| [extras multilingv certificat de nastere] | exact |
| "extras multilingv nastere" | frază |
| "extras multilingv act de nastere" | frază |
| [extras multilingv online] | exact |
| "certificat multilingv" | frază |
| "extras multilingv din strainatate" | frază |
| "extras multilingv italia" | frază |
| [extras multilingv pret] | exact |

**X2 Extras multilingv – căsătorie** (C5)

| Cuvânt cheie | Potrivire |
|---|---|
| [extras multilingv certificat de casatorie] | exact |
| "extras multilingv casatorie" | frază |
| "extras multilingv act de casatorie" | frază |
| "certificat multilingv casatorie" | frază |

Cross-group în C5: în X1 adaugi negativul `casatorie`.

### 3.2 Negative pe campanie (separă produsele între ele)

| Campanie | Negative (frază) |
|---|---|
| C1 Celibat | `multilingv`, `cazier`, `deces` |
| C2 Fiscal | `judiciar`, `auto`, `integritate`, `atestare` („certificat de atestare fiscală” e alt document, cel cu datoriile), `constatator` |
| C3 Naștere | `multilingv`, `celibat`, `casatorie`, `deces`, `cazier` |
| C4 Căsătorie | `multilingv`, `celibat`, `nastere`, `deces`, `cazier` |
| C5 Multilingv | `cazier`, `funciara`, `"carte funciara"`, `cf` (extrasul de CF), `celibat`, `deces`, `"extras de cont"` |

### 3.3 Listă negativă comună „Negative – stare civilă” (C1, C3, C4, C5)

Negativele **nu** prind variante apropiate: pune separat singular/plural și formele cu/fără articol, acolo unde contează.

| Negativ | Tip | De ce |
|---|---|---|
| gratuit, gratis, free | broad | Caută varianta gratuită de la primărie. |
| "model cerere", "model de cerere", "cerere tip", "model completat", formular | frază/broad | Vrea formularul ca să depună singur. NU pune `tipizat`: „am modelul vechi, tipizat” e client pentru N2. ⚠️ **NU pune `model` singur pe C3**: „certificat de nastere model nou” e cuvânt cheie în N2. Pe C1, C4 și C5 poți pune `model` broad. |
| pdf, descarcare, download, word, doc, docx | broad | Vrea să descarce o anexă. |
| primaria, primarie, primariei | broad | Varianta „primăria + oraș”: omul merge la ghișeu și caută adresa sau programul. ⚠️ Compromis: blochează și „certificat de celibat primaria iasi” căutat din Italia de cineva născut la Iași. Pornește CU negativul, apoi uită-te după 14 zile în raportul de termeni de căutare **excluși** (Insights). Dacă apar multe din străinătate, îl scoți și pui în loc `"primaria sector"`, `program`, `adresa`. |
| "sector 1", "sector 2", "sector 3", "sector 4", "sector 5", "sector 6", spclep, dgep, "evidenta persoanelor", "starea civila", "stare civila" | frază | Navigațional spre ghișeele din București sau spre DGEP. |
| program, orar, adresa, unde, telefon, programare | broad | Vrea să meargă fizic. |
| econsulat, "e-consulat", "hub mai", "hub.mai" | frază | Navighează spre portalul gratuit. ⚠️ NU pune `consulat` singur: „certificat de celibat consulat” e omul care ar aștepta 30–60 de zile, adică exact clientul. |
| "acte necesare", necesare, "ce acte", "ce documente" | frază/broad | Căutare informativă, de tip „fă-o singur”. |
| moldova, chisinau, asp, "republica moldova", "agentia servicii publice", md | broad/frază | Moldovenii din Italia și Spania caută în română actul **moldovenesc** (ASP). Reclamele au și titlul „Pentru Acte din România”, ca filtru. |
| transcriere, transcrierea, "certificat strain", "nascut in strainatate", "inscriere act" | frază/broad | Transcrierea e alt serviciu (landingul o explică). |
| rectificare, "schimbare nume", "schimbare de nume", "divort online", "divort notarial", "divort la primarie" | frază | Altă procedură. |
| "birou de traduceri", "traducator autorizat", "traduceri autorizate", "pret traducere" | frază | Vrea doar traducere. ⚠️ NU pune `tradus` sau `traducere` singure: „certificat de celibat tradus” e cuvânt cheie. |
| deces | broad | Nu oferim certificat de deces. |
| "ce este", definitie, wikipedia, lege, "hg 255", "hotararea 255", "norme metodologice" | broad/frază | Căutare informativă. |
| angajari, "ofiter stare civila", "locuri de munca" | broad/frază | Joburi. |
| anagrafe, comune, "stato civile", "registro civil", ayuntamiento, standesamt, mairie, "gov.uk" | broad/frază | Instituții locale din țara de rezidență: utilizatorul le scrie lângă cuvinte românești. |

### 3.4 Listă negativă „Negative – cazier fiscal” (C2)

Păstrează lista din pachetul v1 (gratuit, model, formular, „cerere pdf”, program, orar, adresa, unde, telefon, programare, „ce este”, angajari) și adaugă:

| Negativ | Tip | De ce |
|---|---|---|
| "spv login", "creare cont spv", "inregistrare spv", "parola spv", "spv anaf autentificare" | frază | Probleme cu contul SPV. ⚠️ NU pune `spv` singur: „cazier fiscal fara spv” e cuvânt cheie. |
| atestare, "certificat fiscal", datorii, "fisa sintetica", "situatie fiscala" | broad/frază | Caută certificatul de atestare fiscală sau situația datoriilor, care e alt document. |
| "anaf <oras>", "administratia financiara" | frază | Navigațional spre ghișeu. Adaugă orașele pe care le vezi în termenii de căutare. |
| "aceeasi zi", azi, "24 ore", "24h" | frază/broad | Nu avem termen garantat pentru urgent. |

---

## 4. Reclame (RSA)

Textele sunt validate cu un script (`gen_ads.py`, rulat la 05.10.2026; ieșirea: **9 grupuri, 18 RSA, 270 de titluri, 72 de descrieri, toate în limite**). Ce verifică:

- caracterele sunt numărate după normalizare NFC, cu diacritice;
- titluri ≤30, descrieri ≤90, căi afișate ≤15, sitelinkuri ≤25/35, callouts și snippeturi ≤25, price assets ≤25/25;
- exact 15 titluri și 4 descrieri în fiecare RSA, fără titluri duplicate;
- fiecare RSA are o singură descriere marcată PIN, iar aceasta conține „privat”; fiecare RSA conține și „neafiliat”;
- nicio reclamă nu conține „oficial”, „eliberăm”, „!”, „cel mai”, „garant…”, „ieftin”, „aceeași zi”, „24h” sau rating/recenzii;
- diacriticele sunt cu virgulă (ș/ț), nu cu sedilă.

**Verbul.** Noi **obținem** și **depunem**, iar starea civilă/ANAF **eliberează**. Nicăieri „eliberăm”.

**Pinning.** Fixează pe **poziția 1 la descrieri** descrierea marcată **[PIN descriere poz. 1]**. Așa disclaimerul „serviciu privat” apare în orice combinație. Titlurile nu le fixa.

**Prețul e în reclamă intenționat.** La 698–998 lei, cine nu acceptă prețul nu trebuie să dea clic. Prețul afișat filtrează clicurile scumpe fără intenție și e și cerința de transparență din politica Google.


### CB1 Celibat – general  
*Campanie:* C1 Certificat de celibat  
*Final URL:* `https://documentero.ro/certificat-de-celibat/`  
*Display path:* `documentero.ro/certificat/celibat`

**RSA A – ce e și cât costă**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Certificat de Celibat Online | 28 |
| H2 | Adeverință Statut Civil | 23 |
| H3 | Anexa 18, Fosta Anexa 9 | 23 |
| H4 | Obținut prin Avocat | 19 |
| H5 | 698 lei, Tot Inclus | 19 |
| H6 | Semnezi de pe Telefon | 21 |
| H7 | Fără Drum în România | 20 |
| H8 | Curier Oriunde în Lume | 22 |
| H9 | Serviciu Privat, Neafiliat | 26 |
| H10 | Documentero – Serviciu Privat | 29 |
| H11 | Apostilă și Traducere Opțional | 30 |
| H12 | Pentru Acte din România | 23 |
| H13 | Fără Procură la Notar | 21 |
| H14 | Comandă Certificatul Acum | 25 |
| H15 | Termen Legal: Max. 30 de Zile | 29 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Serviciu privat, neafiliat cu primăriile. Avocatul depune cererea cu împuternicire. **[PIN descriere poz. 1]** | 83 |
| D2 | 698 lei, onorariu avocat, taxe și TVA incluse. Apostila și traducerea se aleg separat. | 86 |
| D3 | Starea civilă eliberează adeverința; noi o obținem și ți-o trimitem prin curier. | 80 |
| D4 | Te căsătorești în străinătate? Semnezi pe telefon, fără procură și fără drum în țară. | 85 |

**RSA B – consulat vs avocat**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Certificat de Celibat | 21 |
| H2 | Dovadă de Celibat din România | 29 |
| H3 | Fără Programare la Consulat | 27 |
| H4 | Avocatul Depune la Primărie | 27 |
| H5 | Neafiliat cu Primăriile | 23 |
| H6 | Serviciu Privat Documentero | 27 |
| H7 | Tarif Serviciu: 698 lei | 23 |
| H8 | Scanul Vine pe Email | 20 |
| H9 | Originalul prin Curier | 22 |
| H10 | Apostilă de la Haga: +198 lei | 29 |
| H11 | Traducere Autorizată Opțională | 30 |
| H12 | Căsătorie în Străinătate | 24 |
| H13 | Vezi Prețul și Termenul | 23 |
| H14 | Comandă Online de Oriunde | 25 |
| H15 | Fără Nimeni în Țară | 19 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | La consulat, cererea ajunge tot la primărie, în 30–60 de zile. Noi mergem direct. | 81 |
| D2 | Documentero e serviciu privat, neafiliat cu instituțiile. Prețul e afișat: 698 lei. **[PIN descriere poz. 1]** | 83 |
| D3 | Adeverința e gratuită la ghișeu. Plătești avocatul, dosarul, urmărirea și livrarea. | 83 |
| D4 | Valabilă 6 luni în România; multe state UE o cer mai nouă de 90 de zile. Comandă la timp. | 89 |

### CB2 Celibat – căsătorie în străinătate  
*Campanie:* C1 Certificat de celibat  
*Final URL:* `https://documentero.ro/certificat-de-celibat/`  
*Display path:* `documentero.ro/celibat/strainatate`

**RSA A – căsătorie în altă țară**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Celibat pentru Căsătorie | 24 |
| H2 | Te Căsătorești în Străinătate? | 30 |
| H3 | Certificat de Celibat Online | 28 |
| H4 | Italia, Spania, Germania, UK | 28 |
| H5 | Cu Apostilă și Traducere | 24 |
| H6 | Apostila Înaintea Traducerii | 28 |
| H7 | 698 lei, Tot Inclus | 19 |
| H8 | Semnezi de pe Telefon | 21 |
| H9 | Curier Oriunde în Lume | 22 |
| H10 | Serviciu Privat, Neafiliat | 26 |
| H11 | Documentero – Serviciu Privat | 29 |
| H12 | Fără Drum în România | 20 |
| H13 | Obținut prin Avocat | 19 |
| H14 | Comandă Certificatul Acum | 25 |
| H15 | Spune-ne Țara în Formular | 25 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Serviciu privat, neafiliat cu primăriile. Obținem adeverința prin avocat. **[PIN descriere poz. 1]** | 73 |
| D2 | Apostila (+198 lei) și traducerea (+178,50 lei) le alegi în formular, după țară. | 80 |
| D3 | 698 lei cu onorariu, taxe și TVA. Scan pe email, originalul prin curier, oriunde ești. | 86 |
| D4 | Majoritatea statelor UE cer actul mai nou de 90 de zile. Comandă când știi data dosarului. | 90 |

**RSA B – gata de depus**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Celibat cu Apostilă de la Haga | 30 |
| H2 | Certificat de Celibat Tradus | 28 |
| H3 | Dovadă de Celibat din România | 29 |
| H4 | Fără Procură și Fără Consulat | 29 |
| H5 | Avocatul Depune la Primărie | 27 |
| H6 | Neafiliat cu Primăriile | 23 |
| H7 | Serviciu Privat Documentero | 27 |
| H8 | Tarif Serviciu: 698 lei | 23 |
| H9 | Apostilă de la Haga: +198 lei | 29 |
| H10 | Traducere Autorizată: +178,50 | 29 |
| H11 | Termen Legal: Max. 30 de Zile | 29 |
| H12 | Scanul Vine pe Email | 20 |
| H13 | Originalul prin Curier | 22 |
| H14 | Vezi Prețul și Termenul | 23 |
| H15 | Comandă Online de Oriunde | 25 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Documentero e serviciu privat. Adeverința o eliberează starea civilă; noi o obținem. **[PIN descriere poz. 1]** | 84 |
| D2 | Facem apostila și traducerea în ordinea corectă, ca să primești actul gata de folosit. | 86 |
| D3 | Unele state cer și certificatul de naștere. Îl poți comanda tot de aici, prin avocat. | 85 |
| D4 | Primăria o eliberează gratuit; la noi plătești avocatul, dosarul, urmărirea și livrarea. | 88 |

### F1 Cazier fiscal – persoană fizică  
*Campanie:* C2 Cazier fiscal – RO  
*Final URL:* `https://documentero.ro/cazier-fiscal-online/`  
*Display path:* `documentero.ro/cazier-fiscal/online`

**RSA A – preț și termen**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier Fiscal Online | 20 |
| H2 | Cazier Fiscal prin Avocat | 25 |
| H3 | 198 lei, 3 Zile Lucrătoare | 26 |
| H4 | Fără Cont SPV | 13 |
| H5 | Fără Drum la ANAF | 17 |
| H6 | Cazierul Fiscal în PDF | 22 |
| H7 | Serviciu Privat, Neafiliat | 26 |
| H8 | Documentero – Serviciu Privat | 29 |
| H9 | Prețul Include TVA | 18 |
| H10 | Cazier Fiscal Persoană Fizică | 29 |
| H11 | Gata de Pus la Dosar | 20 |
| H12 | Plată Online cu Cardul | 22 |
| H13 | Procesare Urgentă: +100 lei | 27 |
| H14 | Comandă Cazierul Fiscal | 23 |
| H15 | Semnezi de pe Telefon | 21 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Serviciu privat, neafiliat cu ANAF. Avocatul depune cererea, ANAF eliberează cazierul. **[PIN descriere poz. 1]** | 86 |
| D2 | 198 lei cu onorariu, taxe și TVA. Standard 3 zile lucrătoare. PDF pe email. | 75 |
| D3 | Fără cont SPV și fără drum la ghișeu: completezi formularul și plătești cu cardul. | 82 |
| D4 | Ai nevoie repede? Procesarea urgentă (prioritate la depunere) costă 100 lei în plus. | 84 |

**RSA B – SPV vs noi**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier Fiscal Fără SPV | 22 |
| H2 | N-ai Cont SPV? Te Ajutăm | 24 |
| H3 | Obținem Cazierul prin Avocat | 28 |
| H4 | Neafiliat cu ANAF | 17 |
| H5 | Serviciu Privat Documentero | 27 |
| H6 | Tarif Serviciu: 198 lei | 23 |
| H7 | Standard: 3 Zile Lucrătoare | 27 |
| H8 | Cazierul Vine pe Email, PDF | 27 |
| H9 | Formular Online, Fără Cozi | 26 |
| H10 | Semnezi Împuternicirea Online | 29 |
| H11 | Valabil 30 de Zile | 18 |
| H12 | Factură pe Email | 16 |
| H13 | Fără Drum la Ghișeul ANAF | 25 |
| H14 | Vezi Prețul și Termenul | 23 |
| H15 | Comandă Acum pe Documentero | 27 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Gratuit la ghișeu sau din SPV, dacă ai cont. Altfel, ne ocupăm noi contra 198 lei. | 82 |
| D2 | Documentero e serviciu privat, neafiliat cu ANAF. Prețul și termenul sunt afișate. **[PIN descriere poz. 1]** | 82 |
| D3 | Formular online, plată cu cardul, cazier fiscal PDF pe email în 3 zile lucrătoare. | 82 |
| D4 | Arată faptele fiscale sancționate, nu datoriile. Valabil 30 de zile, pentru scopul cerut. | 89 |

### F2 Cazier fiscal – persoană juridică  
*Campanie:* C2 Cazier fiscal – RO  
*Final URL:* `https://documentero.ro/cazier-fiscal-online/`  
*Display path:* `documentero.ro/cazier-fiscal/firma`

**RSA A – firmă**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier Fiscal pentru Firmă | 26 |
| H2 | Cazier Fiscal PJ Online | 23 |
| H3 | Cazier Fiscal SRL Online | 24 |
| H4 | Cazier Fiscal prin Avocat | 25 |
| H5 | 198 lei, 3 Zile Lucrătoare | 26 |
| H6 | Fără Cont SPV al Firmei | 23 |
| H7 | Fără Drum la ANAF | 17 |
| H8 | Cazierul Fiscal în PDF | 22 |
| H9 | Factură pe Email | 16 |
| H10 | Serviciu Privat, Neafiliat | 26 |
| H11 | Documentero – Serviciu Privat | 29 |
| H12 | Reprezentantul Semnează Online | 30 |
| H13 | Plată Online cu Cardul | 22 |
| H14 | Comandă pentru Firma Ta | 23 |
| H15 | Procesare Urgentă: +100 lei | 27 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Cazier fiscal pentru persoană juridică, prin avocat. Serviciu privat, neafiliat cu ANAF. **[PIN descriere poz. 1]** | 88 |
| D2 | 198 lei cu onorariu, taxe și TVA. Standard 3 zile lucrătoare, PDF pe email. | 75 |
| D3 | Cazierul fiscal îl eliberează ANAF; noi depunem cererea pentru firmă, prin avocat. | 82 |
| D4 | Alegi persoană juridică, completezi datele firmei, reprezentantul semnează online. | 82 |

**RSA B – fără SPV**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier Fiscal Firmă Fără SPV | 28 |
| H2 | Cazier Fiscal Societate | 23 |
| H3 | Obținem Cazierul prin Avocat | 28 |
| H4 | Neafiliat cu ANAF | 17 |
| H5 | Serviciu Privat Documentero | 27 |
| H6 | Tarif Serviciu: 198 lei | 23 |
| H7 | Standard: 3 Zile Lucrătoare | 27 |
| H8 | Cazierul Vine pe Email, PDF | 27 |
| H9 | Valabil 30 de Zile | 18 |
| H10 | Formular Online, Fără Cozi | 26 |
| H11 | Fără Drum pentru Administrator | 30 |
| H12 | Vezi Prețul și Termenul | 23 |
| H13 | Comandă Cazierul Firmei | 23 |
| H14 | Semnezi Împuternicirea Online | 29 |
| H15 | Gata de Pus la Dosar | 20 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Gratuit din SPV, dacă firma are cont activ. Altfel, ne ocupăm noi contra 198 lei. | 81 |
| D2 | Documentero e serviciu privat, neafiliat cu ANAF. Prețul și termenul sunt afișate. **[PIN descriere poz. 1]** | 82 |
| D3 | Fără drum la ANAF pentru administrator: formular online, semnătură, plată cu cardul. | 84 |
| D4 | Arată faptele fiscale sancționate ale firmei, nu datoriile. Valabil 30 de zile. | 79 |

### N1 Naștere – duplicat  
*Campanie:* C3 Certificat de naștere  
*Final URL:* `https://documentero.ro/certificat-de-nastere/`  
*Display path:* `documentero.ro/certificat/nastere`

**RSA A – duplicat prin avocat**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Certificat de Naștere Duplicat | 30 |
| H2 | Duplicat Certificat de Naștere | 30 |
| H3 | Obținut prin Avocat | 19 |
| H4 | 998 lei, Tot Inclus | 19 |
| H5 | Semnezi de pe Telefon | 21 |
| H6 | Fără Drum în România | 20 |
| H7 | Originalul prin Curier | 22 |
| H8 | Curier Oriunde în Lume | 22 |
| H9 | Serviciu Privat, Neafiliat | 26 |
| H10 | Documentero – Serviciu Privat | 29 |
| H11 | Model Nou, cu CNP | 17 |
| H12 | Pentru Acte din România | 23 |
| H13 | Fără Procură la Notar | 21 |
| H14 | Comandă Duplicatul Acum | 23 |
| H15 | Termen Legal: Max. 30 de Zile | 29 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Serviciu privat, neafiliat cu primăriile. Avocatul depune cererea cu împuternicire. **[PIN descriere poz. 1]** | 83 |
| D2 | 998 lei, onorariu avocat, taxe și TVA incluse. Apostila și traducerea se aleg separat. | 86 |
| D3 | Starea civilă eliberează duplicatul; noi îl obținem și ți-l trimitem prin curier. | 81 |
| D4 | Duplicatul iese pe modelul actual, cu CNP, indiferent de anul nașterii. | 71 |

**RSA B – din străinătate**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Certificat de Naștere Online | 28 |
| H2 | Fără Programare la Consulat | 27 |
| H3 | Avocatul Depune la Primărie | 27 |
| H4 | Neafiliat cu Primăriile | 23 |
| H5 | Serviciu Privat Documentero | 27 |
| H6 | Tarif Serviciu: 998 lei | 23 |
| H7 | Plus Extras Multilingv: +398 | 28 |
| H8 | Apostilă de la Haga: +198 lei | 29 |
| H9 | Traducere Autorizată Opțională | 30 |
| H10 | Originalul prin Curier | 22 |
| H11 | Pentru Rezidență sau Cetățenie | 30 |
| H12 | Vezi Prețul și Termenul | 23 |
| H13 | Comandă Online de Oriunde | 25 |
| H14 | Semnezi din Străinătate | 23 |
| H15 | Termen Legal: Max. 30 de Zile | 29 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Consulatul trimite cererea tot la primărie, în 30–60 de zile. Prin avocat, intră direct. | 88 |
| D2 | Documentero e serviciu privat, neafiliat cu instituțiile. Prețul e afișat: 998 lei. **[PIN descriere poz. 1]** | 83 |
| D3 | Pentru UE adaugi extrasul multilingv (+398 lei), în același plic, fără traducere. | 81 |
| D4 | Certificatul e gratuit la ghișeu. Plătești avocatul, dosarul, urmărirea și livrarea. | 84 |

### N2 Naștere – pierdut / model nou  
*Campanie:* C3 Certificat de naștere  
*Final URL:* `https://documentero.ro/certificat-de-nastere/`  
*Display path:* `documentero.ro/nastere/pierdut`

**RSA A – pierdut sau deteriorat**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Certificat de Naștere Pierdut | 29 |
| H2 | Ai Pierdut Certificatul? | 24 |
| H3 | Duplicat pentru Act Deteriorat | 30 |
| H4 | Obținut prin Avocat | 19 |
| H5 | 998 lei, Tot Inclus | 19 |
| H6 | Model Nou, cu CNP | 17 |
| H7 | Semnezi de pe Telefon | 21 |
| H8 | Originalul prin Curier | 22 |
| H9 | Serviciu Privat, Neafiliat | 26 |
| H10 | Documentero – Serviciu Privat | 29 |
| H11 | Fără Drum la Primărie | 21 |
| H12 | Pentru Acte din România | 23 |
| H13 | Comandă Duplicatul Acum | 23 |
| H14 | Termen Legal: Max. 30 de Zile | 29 |
| H15 | Curier Oriunde în Lume | 22 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Serviciu privat, neafiliat cu primăriile. Obținem duplicatul prin avocat. **[PIN descriere poz. 1]** | 73 |
| D2 | 998 lei, onorariu avocat, taxe și TVA incluse. Originalul vine prin curier, oriunde ești. | 89 |
| D3 | Ai pierdut sau ai deteriorat certificatul? Avocatul cere duplicatul în locul tău. | 81 |
| D4 | Ai modelul vechi, tipizat? Duplicatul iese pe formularul actual, cu CNP. | 72 |

**RSA B – model nou**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Duplicat Certificat Naștere | 27 |
| H2 | Certificat de Naștere Nou | 25 |
| H3 | Ai Modelul Vechi, Tipizat? | 26 |
| H4 | Avocatul Depune Cererea | 23 |
| H5 | Neafiliat cu Primăriile | 23 |
| H6 | Serviciu Privat Documentero | 27 |
| H7 | Tarif Serviciu: 998 lei | 23 |
| H8 | Pentru Pașaportul Copilului | 27 |
| H9 | Originalul prin Curier | 22 |
| H10 | Semnezi de pe Telefon | 21 |
| H11 | Vezi Prețul și Termenul | 23 |
| H12 | Fără Programare la Ghișeu | 25 |
| H13 | Comandă Online de Oriunde | 25 |
| H14 | Termen Legal: Max. 30 de Zile | 29 |
| H15 | Comandă Duplicatul Acum | 23 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Certificatul e gratuit la ghișeu. Plătești avocatul, dosarul, urmărirea și livrarea. | 84 |
| D2 | Documentero e serviciu privat. Duplicatul îl eliberează starea civilă; noi îl obținem. **[PIN descriere poz. 1]** | 86 |
| D3 | Duplicatul nu e transcriere: se cere doar pentru acte deja înregistrate în România. | 83 |
| D4 | Completezi în 5 minute și semnezi pe telefon. Originalul ajunge la tine prin curier. | 84 |

### M1 Căsătorie – duplicat  
*Campanie:* C4 Certificat de căsătorie  
*Final URL:* `https://documentero.ro/certificat-de-casatorie/`  
*Display path:* `documentero.ro/certificat/casatorie`

**RSA A – duplicat prin avocat**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Duplicat Certificat Căsătorie | 29 |
| H2 | Certificat de Căsătorie Online | 30 |
| H3 | Cu Mențiunea de Divorț | 22 |
| H4 | Obținut prin Avocat | 19 |
| H5 | 998 lei, Tot Inclus | 19 |
| H6 | Semnezi de pe Telefon | 21 |
| H7 | Oricare dintre Soți Poate Cere | 30 |
| H8 | Originalul prin Curier | 22 |
| H9 | Serviciu Privat, Neafiliat | 26 |
| H10 | Documentero – Serviciu Privat | 29 |
| H11 | Fără Drum în România | 20 |
| H12 | Pentru Acte din România | 23 |
| H13 | Comandă Duplicatul Acum | 23 |
| H14 | Termen Legal: Max. 30 de Zile | 29 |
| H15 | Curier Oriunde în Lume | 22 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Serviciu privat, neafiliat cu primăriile. Avocatul depune cererea cu împuternicire. **[PIN descriere poz. 1]** | 83 |
| D2 | 998 lei, onorariu avocat, taxe și TVA incluse. Apostila și traducerea se aleg separat. | 86 |
| D3 | Duplicatul poartă mențiunile ulterioare, inclusiv divorțul înregistrat în România. | 82 |
| D4 | Pentru UE, extrasul multilingv de căsătorie (+398 lei) merge fără traducere. | 76 |

**RSA B – din străinătate**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Certificat Căsătorie Pierdut | 28 |
| H2 | Fără Programare la Consulat | 27 |
| H3 | Avocatul Depune la Primărie | 27 |
| H4 | Neafiliat cu Primăriile | 23 |
| H5 | Serviciu Privat Documentero | 27 |
| H6 | Tarif Serviciu: 998 lei | 23 |
| H7 | Plus Extras Multilingv: +398 | 28 |
| H8 | Apostilă de la Haga: +198 lei | 29 |
| H9 | Pentru Rezidența Partenerului | 29 |
| H10 | Pentru Schimbarea Numelui | 25 |
| H11 | Originalul prin Curier | 22 |
| H12 | Vezi Prețul și Termenul | 23 |
| H13 | Comandă Online de Oriunde | 25 |
| H14 | Semnezi din Străinătate | 23 |
| H15 | Termen Legal: Max. 30 de Zile | 29 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Consulatul trimite cererea tot în țară, în 30–60 de zile. Prin avocat, intră direct. | 84 |
| D2 | Documentero e serviciu privat, neafiliat cu instituțiile. Prețul e afișat: 998 lei. **[PIN descriere poz. 1]** | 83 |
| D3 | Certificatul e gratuit la ghișeu. Plătești avocatul, dosarul, urmărirea și livrarea. | 84 |
| D4 | Pentru rezidență, schimbarea numelui sau pensia de urmaș, în țară sau în străinătate. | 85 |

### X1 Extras multilingv – naștere  
*Campanie:* C5 Extras multilingv  
*Final URL:* `https://documentero.ro/extras-multilingv/`  
*Display path:* `documentero.ro/extras/multilingv`

**RSA A – acceptat în UE**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Extras Multilingv de Naștere | 28 |
| H2 | Acceptat în UE Fără Traducere | 29 |
| H3 | Fără Apostilă în Statele UE | 27 |
| H4 | Obținut prin Avocat | 19 |
| H5 | 798 lei, Tot Inclus | 19 |
| H6 | Formularul UE 2016/1191 | 23 |
| H7 | Semnezi de pe Telefon | 21 |
| H8 | Curier Oriunde în UE | 20 |
| H9 | Serviciu Privat, Neafiliat | 26 |
| H10 | Documentero – Serviciu Privat | 29 |
| H11 | Plus Certificat: +498 lei | 25 |
| H12 | Pentru Acte din România | 23 |
| H13 | Comandă Extrasul Acum | 21 |
| H14 | Termen Legal: Max. 30 de Zile | 29 |
| H15 | Fără Drum în România | 20 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Serviciu privat, neafiliat cu primăriile. Avocatul depune cererea cu împuternicire. **[PIN descriere poz. 1]** | 83 |
| D2 | 798 lei cu onorariu, taxe și TVA. Acceptat în orice stat UE fără traducere și apostilă. | 87 |
| D3 | Adaugi și duplicatul certificatului de naștere, dintr-o singură depunere, cu +498 lei. | 86 |
| D4 | Pentru școala copilului, căsătorie, rezidență sau pensie în Italia, Spania, Germania. | 85 |

**RSA B – fără traducere**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Extras Multilingv Online | 24 |
| H2 | Certificat Multilingv Naștere | 29 |
| H3 | Fără Traducere, Fără Apostilă | 29 |
| H4 | Avocatul Depune la Primărie | 27 |
| H5 | Neafiliat cu Primăriile | 23 |
| H6 | Serviciu Privat Documentero | 27 |
| H7 | Tarif Serviciu: 798 lei | 23 |
| H8 | Extrasul Nu Expiră | 18 |
| H9 | Fără Programare la Consulat | 27 |
| H10 | Pentru Școală, Rezidență | 24 |
| H11 | Vezi Prețul și Termenul | 23 |
| H12 | Comandă Online de Oriunde | 25 |
| H13 | Semnezi din Străinătate | 23 |
| H14 | Acceptat în Orice Stat UE | 25 |
| H15 | Comandă Extrasul Acum | 21 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Extrasul e gratuit la ghișeu. Plătești avocatul, dosarul, urmărirea și livrarea. | 80 |
| D2 | Documentero e serviciu privat. Extrasul îl eliberează starea civilă; noi îl obținem. **[PIN descriere poz. 1]** | 84 |
| D3 | Regulamentul UE 2016/1191 a scos traducerea și apostila pentru actele de stare civilă. | 86 |
| D4 | Consulatul trimite cererea tot în țară, în 30–60 de zile. Prin avocat, intră direct. | 84 |

### X2 Extras multilingv – căsătorie  
*Campanie:* C5 Extras multilingv  
*Final URL:* `https://documentero.ro/extras-multilingv/#casatorie`  
*Display path:* `documentero.ro/extras/casatorie`

**RSA A – acceptat în UE**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Extras Multilingv Căsătorie | 27 |
| H2 | Acceptat în UE Fără Traducere | 29 |
| H3 | Fără Apostilă în Statele UE | 27 |
| H4 | Obținut prin Avocat | 19 |
| H5 | 798 lei, Tot Inclus | 19 |
| H6 | Oricare dintre Soți Poate Cere | 30 |
| H7 | Semnezi de pe Telefon | 21 |
| H8 | Serviciu Privat, Neafiliat | 26 |
| H9 | Documentero – Serviciu Privat | 29 |
| H10 | Pentru Rezidența Partenerului | 29 |
| H11 | Pentru Schimbarea Numelui | 25 |
| H12 | Pentru Acte din România | 23 |
| H13 | Comandă Extrasul Acum | 21 |
| H14 | Termen Legal: Max. 30 de Zile | 29 |
| H15 | Fără Drum în România | 20 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Serviciu privat, neafiliat cu primăriile. Avocatul depune cererea cu împuternicire. **[PIN descriere poz. 1]** | 83 |
| D2 | 798 lei cu onorariu, taxe și TVA. Instituțiile UE îl acceptă fără traducere și apostilă. | 88 |
| D3 | Dacă ai divorțat, mențiunea apare și pe extras, dacă e înscrisă pe actul din România. | 85 |
| D4 | Pentru rezidența partenerului, schimbarea numelui sau pensia de urmaș, în UE. | 77 |

**RSA B – fără traducere**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Extras Multilingv Online | 24 |
| H2 | Extras de Căsătorie Multilingv | 30 |
| H3 | Fără Traducere, Fără Apostilă | 29 |
| H4 | Avocatul Depune la Primărie | 27 |
| H5 | Neafiliat cu Primăriile | 23 |
| H6 | Serviciu Privat Documentero | 27 |
| H7 | Tarif Serviciu: 798 lei | 23 |
| H8 | Fără Programare la Consulat | 27 |
| H9 | Acceptat în Orice Stat UE | 25 |
| H10 | Cu Mențiunea de Divorț | 22 |
| H11 | Vezi Prețul și Termenul | 23 |
| H12 | Comandă Online de Oriunde | 25 |
| H13 | Semnezi din Străinătate | 23 |
| H14 | Comandă Extrasul Acum | 21 |
| H15 | Termen Legal: Max. 30 de Zile | 29 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Extrasul e gratuit la ghișeu. Plătești avocatul, dosarul, urmărirea și livrarea. | 80 |
| D2 | Documentero e serviciu privat. Extrasul îl eliberează starea civilă; noi îl obținem. **[PIN descriere poz. 1]** | 84 |
| D3 | Consulatul trimite cererea tot în țară, în 30–60 de zile. Prin avocat, intră direct. | 84 |
| D4 | Îl cere oricare dintre soți; avocatul depune la primăria care păstrează actul. | 78 |

---

## 4b. Assets (extensii)

### Sitelinkuri (text ≤25, descrieri ≤35) – la nivel de CAMPANIE, nu de cont

**Pe C1, C3, C4, C5 (stare civilă)**

| Text | Car. | Descriere 1 | Car. | Descriere 2 | Car. | URL |
|---|---|---|---|---|---|---|
| Certificat de celibat | 21 | 698 lei, tot inclus | 19 | Anexa 18, fosta Anexa 9 | 23 | `https://documentero.ro/certificat-de-celibat/` |
| Certificat de naștere | 21 | Duplicat, 998 lei | 17 | Model nou, cu CNP | 17 | `https://documentero.ro/certificat-de-nastere/` |
| Certificat de căsătorie | 23 | Duplicat, 998 lei | 17 | Și cu mențiunea de divorț | 25 | `https://documentero.ro/certificat-de-casatorie/` |
| Extras multilingv | 17 | 798 lei, acceptat în UE | 23 | Fără traducere și apostilă | 26 | `https://documentero.ro/extras-multilingv/` |
| Ghiduri | 7 | Apostila pe acte de stare civilă | 32 | Procură: notar, consulat, avocat | 32 | `https://documentero.ro/ghiduri/` |
| Despre noi și avocat | 20 | Serviciu privat, date firmă | 27 | Avocat înscris în Barou | 23 | `https://documentero.ro/despre/` |
| Contact | 7 | Email și telefon | 16 | L–V 08:00–16:00 | 15 | `https://documentero.ro/contact/` |
| Politica de anulare | 19 | Ce se întâmplă dacă anulezi | 27 | Condiții de rambursare | 22 | `https://documentero.ro/politica-de-anulare/` |

**Pe C2 (cazier fiscal)**

| Text | Car. | Descriere 1 | Car. | Descriere 2 | Car. | URL |
|---|---|---|---|---|---|---|
| Despre noi și avocat | 20 | Serviciu privat, date firmă | 27 | Avocat înscris în Barou | 23 | `https://documentero.ro/despre/` |
| Contact | 7 | Email și telefon | 16 | L–V 08:00–16:00 | 15 | `https://documentero.ro/contact/` |
| Politica de anulare | 19 | Ce se întâmplă dacă anulezi | 27 | Condiții de rambursare | 22 | `https://documentero.ro/politica-de-anulare/` |
| Termeni și condiții | 19 | Ce include serviciul | 20 | Drepturile tale de client | 25 | `https://documentero.ro/termeni-si-conditii/` |

### Callouts (≤25)

**Stare civilă (C1, C3, C4, C5)**

| Callout | Car. |
|---|---|
| Serviciu privat | 15 |
| Neafiliat cu instituțiile | 25 |
| Prin avocat | 11 |
| Semnezi pe telefon | 18 |
| Curier oriunde | 14 |
| Preț cu TVA inclus | 18 |
| Fără procură la notar | 21 |
| Apostilă la cerere | 18 |
| Traducere la cerere | 19 |
| Pentru acte din România | 23 |

**Cazier fiscal (C2)**

| Callout | Car. |
|---|---|
| Serviciu privat | 15 |
| Neafiliat cu ANAF | 17 |
| Prin avocat | 11 |
| Fără cont SPV | 13 |
| PDF pe email | 12 |
| Preț cu TVA inclus | 18 |
| Plată cu cardul | 15 |
| Factură pe email | 16 |
| Persoane fizice și firme | 24 |

### Structured snippets (valori ≤25)

**Civil – Servicii** (header Google: „Servicii”)

| Valoare | Car. |
|---|---|
| Certificat de celibat | 21 |
| Duplicat naștere | 16 |
| Duplicat căsătorie | 18 |
| Extras multilingv | 17 |
| Apostilă Haga | 13 |
| Traducere autorizată | 20 |

**Civil – Destinații** (header Google: „Destinații”)

| Valoare | Car. |
|---|---|
| Italia | 6 |
| Spania | 6 |
| Germania | 8 |
| Franța | 6 |
| Regatul Unit | 12 |
| Olanda | 6 |
| Belgia | 6 |

**Fiscal – Tipuri** (header Google: „Tipuri”)

| Valoare | Car. |
|---|---|
| Persoană fizică | 15 |
| Persoană juridică | 17 |

**Fiscal – Servicii** (header Google: „Servicii”)

| Valoare | Car. |
|---|---|
| Cazier fiscal | 13 |
| Procesare urgentă | 17 |
| Traducere autorizată | 20 |
| Apostilă Haga | 13 |

### Price assets (header ≤25, descriere ≤25, RON, calificator „Exact”, tip „Servicii”)

**Stare civilă (C1, C3, C4, C5)**

| Header | Car. | Descriere | Car. | Preț (lei) | URL |
|---|---|---|---|---|---|
| Certificat de celibat | 21 | Anexa 18, tot inclus | 20 | 698 | `https://documentero.ro/certificat-de-celibat/` |
| Duplicat naștere | 16 | Model nou, cu CNP | 17 | 998 | `https://documentero.ro/certificat-de-nastere/` |
| Duplicat căsătorie | 18 | Și cu mențiune de divorț | 24 | 998 | `https://documentero.ro/certificat-de-casatorie/` |
| Extras multilingv | 17 | Acceptat în UE | 14 | 798 | `https://documentero.ro/extras-multilingv/` |

**Cazier fiscal (C2)**

| Header | Car. | Descriere | Car. | Preț (lei) | URL |
|---|---|---|---|---|---|
| Cazier fiscal | 13 | Standard, 3 zile lucr. | 22 | 198 | `https://documentero.ro/cazier-fiscal-online/` |
| Cazier fiscal urgent | 20 | Prioritate la depunere | 22 | 298 | `https://documentero.ro/cazier-fiscal-online/` |
| Traducere autorizată | 20 | Opțională | 9 | 178,50 | `https://documentero.ro/cazier-fiscal-online/` |

**Pe ce nivel pui assets:**

- Totul **la nivel de campanie**. Sitelinkurile, callouts și price assets puse pe cont se lipesc pe toate campaniile, iar atunci reclama de cazier fiscal ar arăta „Certificat de celibat 698 lei”.
- În campaniile C1, C3, C4 și C5, sitelinkul spre propriul landing (de exemplu „Certificat de celibat” în C1) e redundant. Google îl ascunde când coincide cu URL-ul final, așa că îl poți lăsa.
- Snippetul „Destinații” arată țările în care livrăm. Pe C5 scoate „Regatul Unit” (extrasul nu se aplică acolo).
- Price assets: verifică că suma din fiecare rând e aceeași cu cea de pe landing în ziua publicării. Dacă prețul se schimbă în admin, **actualizezi asset-ul în aceeași zi**.

---

## 5. Licitare pe faze

Contul e nou și prețurile sunt mari, deci conversiile vor fi puține. Strategia se schimbă după volumul de conversii, nu după calendar.

| Fază | Când | Ce faci |
|---|---|---|
| **1. Test de cerere** | zilele 1–14 | **Maximize clicks** cu plafon CPC: celibat **3,50 lei**, naștere/căsătorie/multilingv **3 lei**, fiscal **2,50 lei**. Plafoanele sunt **estimări**, fără istoric: ATC n-a arătat concurenți pe stare civilă, deci CPC-ul real poate fi sub 1 leu. Verifică intervalul „top of page bid” din Keyword Planner la creare și cota de afișări pierdută din cauza rangului după 3–5 zile. Ziua 3, ziua 7 și ziua 14: raportul de termeni de căutare, cu negative noi. |
| **2. Strategie de portofoliu** | după ~15 conversii „Purchase” însumate pe C1+C3+C4+C5 | O singură strategie de portofoliu **Maximize conversions** pe cele 4 campanii de stare civilă. Le pune datele la comun, pentru că separat niciuna nu strânge 15 conversii pe lună. C2 rămâne separat: alt preț, alt public. |
| **3. Valoare** | ≥30 conversii pe 30 de zile pe portofoliu | **Maximize conversion value**, apoi tROAS la ROAS-ul real × 0,9. Valoarea contează aici: o comandă de celibat cu apostilă și traducere valorează altceva decât un extras simplu. |

**Dacă după 21 de zile un serviciu are sub 3 conversii:** nu treci la etapa 2 de licitare pe conversii puține. Ai două variante:

- (a) lași Maximize clicks încă 2 săptămâni, cu bugetul mutat spre serviciul care convertește;
- (b) folosești temporar ca conversie primară „Început comandă” (pasul 2 din wizard). Atenție: algoritmul învață să aducă oameni care încep, nu care plătesc. Revii la Purchase imediat ce ai 15.

**Când oprești un cuvânt cheie (regula mea, nu o cifră din date):** cuvântul a cheltuit cât un preț de comandă (≈700 lei pe stare civilă, ≈200 lei pe fiscal) fără nicio conversie. La fiscal, pragul se atinge repede, deci acolo te uiți săptămânal.

Nu schimba strategia în primele 7 zile după o schimbare: e perioada de învățare.

---

## 6. Tracking conversii – de verificat ÎNAINTE de lansare

Rămâne valabil tot ce era în v1:

1. **Conversia „Purchase” în contul nou:** valoare dinamică, RON, Count = One, fereastră de 30 de zile, setată Primary.
2. **ID-ul și eticheta Ads pe brand** (`src/lib/brand/`), nu din variabila globală `NEXT_PUBLIC_GOOGLE_ADS_*`. Altfel conversiile documentero ajung în contul eghiseul 677-995-5005.
3. **Enhanced conversions** (`user_data`).
4. **Consent Mode v2.**
5. **gclid pe comandă**, pentru import offline.
6. **Plata prin transfer bancar.** Pagina de succes nu trimite conversia, deci pe acest drum importul offline e singura sursă.
7. **Test A–Z** fără factură Oblio.
8. **Landingurile noindex** (`/cazier-fiscal-online/`) nu trebuie blocate pentru AdsBot în robots.txt.

**Ce se adaugă pentru stare civilă:**

- **Fereastra de conversie.** La 698–998 lei, omul compară și revine. Lasă **30 de zile** pentru clic, nu 7.
- **Valoarea.** `total_price` include apostila, traducerea și curierul. Pentru licitarea pe valoare (faza 3) e exact ce trebuie.
- **Diaspora și consimțământul.** Vizitatorii din UE refuză cookie-urile de marketing mai des. Fără Consent Mode v2 și import offline după gclid, o parte din conversiile din Italia și Spania nu se văd deloc, iar campania pare mai slabă decât e. Importul offline săptămânal devine **obligatoriu**, nu opțional.
- **Țara.** Verifică în raportul de conversii pe locație că o comandă de test făcută cu VPN din Italia apare la Italia.

---

## 7. Notă de risc – politica Google „Government documents and official services”

Politica (support.google.com/adspolicy/answer/13156083) restricționează reclamele terților care facilitează obținerea de documente sau servicii de stat. **Certificatele de naștere sunt date explicit ca exemplu** în politică. Celibatul, căsătoria și extrasul multilingv sunt acte de stare civilă din aceeași familie, iar cazierul fiscal e tot un document eliberat de stat. Pornește de la ipoteza că toate 5 sunt în scopul politicii.

**Ce știm din istoricul nostru:**

- contul eghiseul (677-995-5005) și campaniile ecazier au fost blocate pe această politică (aug. 2026);
- suportul Google a spus că intermediarii nu sunt eligibili pentru certificare;
- există o escaladare deschisă, pe tratament egal (tichet 6-4960000040774, menținut la 30.09).

**Ce e nou azi:**

- **Riscul se evaluează pe fiecare țară țintită.** Cu 10 țări, o respingere poate fi limitată la câteva („Eligibil (limitat)”) sau totală. Urmărește coloana „Stare” pe fiecare țară.
- **Concurenții care rulează în aceeași categorie** (roghiseul.ro, infocazier.ro / Cabinet Avocat Grosu, ambii verificați, activi în RO și IT la 05.10.2026) **nu sunt o garanție** că trecem și noi. Sunt însă material concret pentru escaladarea pe tratament egal. Fă capturi din ATC cu data.

**Probabilitatea de respingere e mare și pe contul nou.** Textele reduc riscul, dar politica privește tipul de serviciu, nu formularea. Ce fac textele:

- spun „serviciu privat” pe poziția 1 fixată;
- spun „neafiliat”;
- arată prețul;
- spun că actul e gratuit la ghișeu;
- folosesc verbul corect.

**Reguli care nu se negociază:**

- **Reclama spune întotdeauna că suntem serviciu privat** (descrierea fixată, callout-ul „Serviciu privat”, titlul „Documentero – Serviciu Privat”).
- **Oferta nu se ascunde niciodată.** Nu scoți prețul, nu scoți disclaimerul, nu scoți mențiunea variantei gratuite de pe landing, nu faci o pagină pentru AdsBot și alta pentru oameni (cloaking înseamnă suspendare pentru „Circumventing systems”).
- **Nu deschizi conturi noi** pentru aceeași ofertă după o respingere (tot „Circumventing systems”). O suspendare se întinde pe toate conturile legate prin plată, domeniu sau persoană, deci și peste eghiseul și CJO.

**Dacă reclamele sunt respinse:**

1. **O singură contestație** (Policy manager → Appeal), cu dovezi:
   - captura cu disclaimerul din footer și din hero;
   - prețul serviciului afișat;
   - tabelul „La ghișeu sau prin noi”, care arată varianta gratuită (e pe toate cele 4 landinguri de stare civilă);
   - datele firmei și ale avocatei (av. Tarța Ana Gabriela, Baroul Satu Mare);
   - explicația că serviciul e reprezentare prin împuternicire avocațială (Legea 51/1995, Legea 119/1996 art. 10), nu vânzarea documentului.
2. Dacă se menține: **nu** mai trimiți contestații în serie. Rămân canalele fără această restricție (Microsoft Advertising, SEO pe documentero, email către clienții existenți) și escaladarea deja deschisă.
3. Corectează înainte de lansare cele 2 texte de pe landing din §1 (footerul fiscal care pomenește stare civilă, „se numește oficial” pe celibat). Un revizor care vede „oficial” lângă document sau o instituție greșită are motiv să respingă pentru „Misrepresentation”.

---

## Anexa – Faza 2: Cazier judiciar (NU se lansează acum)

Conținutul de mai jos e păstrat din v1. **Înainte de lansare trebuie re-verificat pe landingul documentero, care diferă de eghiseul (sursa v1):**

| În reclamele v1 | Pe `documentero.ro/cazier-judiciar-online/` la 05.10.2026 | Ce schimbi |
|---|---|---|
| „3–5 zile lucrătoare” | **5 zile lucrătoare**, standard | Toate titlurile și descrierile cu „3–5” → „5 zile lucrătoare”. |
| „Urgent 278 lei, 1–2 zile” | Urgent **+80 lei** (= 278), „prioritate la depunere”, **fără termen** | Scoți „1–2 zile” peste tot. Rămâne doar „Urgent: +80 lei”. |
| Apostilă Haga 238 lei | **198 lei** | J3: „Apostilă Haga: 238 lei” → 198. |
| Grup J5 Persoană juridică | Landingul spune „Persoane fizice”, fără PJ | J5 stă pe **pauză** până când landingul acceptă PJ. |
| „PDF semnat pe email” | „PDF pe email și originalul prin curier” | Scoți „semnat”, dacă nu apare pe pagină. |
| Certificat de integritate | Opțiune nouă, +100 lei, în aceeași comandă | Poate fi callout sau titlu. |

După modificări, rulezi din nou validarea de caractere. Bugetul se ia din C2 sau din serviciul de stare civilă cu cel mai slab CPA, nu se adaugă peste 150 lei.

### Faza 2 – cuvinte cheie

**J1 Online (general)** – faza 2, RO

| Cuvânt cheie | Potrivire |
|---|---|
| [cazier judiciar online] | exact |
| "cazier judiciar online" | frază |
| [cazier online] | exact |
| "cazier judiciar prin avocat" | frază |
| [cerere cazier judiciar online] | exact |
| "obtinere cazier judiciar" | frază |
| [cazier judiciar fara deplasare] | exact |
| "cazier judiciar online pret" | frază |
| [cat costa cazierul judiciar online] | exact |
| [eliberare cazier judiciar online] | exact |
| "cazier judiciar pe email" | frază |
| "cazier judiciar electronic" | frază |
| [cazier judiciar persoana fizica online] | exact |
| "comanda cazier judiciar" | frază |

**J2 Urgent** – faza 2, RO

| Cuvânt cheie | Potrivire |
|---|---|
| [cazier judiciar urgent] | exact |
| "cazier judiciar urgent" | frază |
| [cazier judiciar urgent online] | exact |
| "cazier urgent" | frază |
| [cazier judiciar rapid] | exact |
| "cazier judiciar rapid online" | frază |
| [cazier judiciar repede] | exact |
| "cazier judiciar in 2 zile" | frază |
| [cazier judiciar express] | exact |
| "cazier judiciar cat mai repede" | frază |

**J3 Diaspora** – faza 2, diaspora

| Cuvânt cheie | Potrivire |
|---|---|
| [cazier judiciar din strainatate] | exact |
| "cazier judiciar din strainatate" | frază |
| [cazier judiciar diaspora] | exact |
| "cazier judiciar din italia" | frază |
| "cazier judiciar din spania" | frază |
| "cazier judiciar din germania" | frază |
| "cazier judiciar din anglia" | frază |
| "cazier judiciar din uk" | frază |
| "cazier judiciar din franta" | frază |
| "cazier judiciar romanesc" | frază |
| [cazier judiciar cu apostila] | exact |
| "cazier judiciar apostilat" | frază |
| "cazier judiciar tradus" | frază |
| [cazier judiciar online din strainatate] | exact |

**J4 Angajare / scop** – faza 2, RO

| Cuvânt cheie | Potrivire |
|---|---|
| "cazier judiciar pentru angajare" | frază |
| [cazier pentru angajare] | exact |
| [cazier judiciar angajare] | exact |
| "cazier judiciar pentru job" | frază |
| "cazier judiciar pentru serviciu" | frază |
| "cazier judiciar pentru dosar" | frază |
| "cazier judiciar pentru viza" | frază |
| "cazier judiciar pentru cetatenie" | frază |
| [cazier judiciar pentru loc de munca] | exact |
| "cazier judiciar pentru permis" | frază |

**J5 Persoană juridică** – faza 2, RO

| Cuvânt cheie | Potrivire |
|---|---|
| [cazier judiciar persoana juridica] | exact |
| "cazier judiciar persoana juridica" | frază |
| "cazier judiciar firma" | frază |
| [cazier judiciar srl] | exact |
| "cazier judiciar pentru firma" | frază |
| "cazier judiciar pentru licitatie" | frază |
| [cazier judiciar societate] | exact |
| [cazier judiciar pj online] | exact |
| "cazier judiciar pj" | frază |
| "cazier judiciar companie" | frază |

### Faza 2 – reclame (v1, de corectat după tabelul de mai sus)

#### J1 Online (general)  
*Campanie:* F2-J Cazier judiciar – RO (faza 2)  
*Final URL:* `https://documentero.ro/cazier-judiciar-online/`  
*Display path:* `documentero.ro/cazier-judiciar/online`

**RSA A – preț și termen**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier Judiciar Online | 22 |
| H2 | Cazier Judiciar prin Avocat | 27 |
| H3 | 198 lei, 3–5 Zile Lucrătoare | 28 |
| H4 | Urgent: 278 lei, 1–2 Zile | 25 |
| H5 | Serviciu Privat, Neafiliat | 26 |
| H6 | Documentero – Serviciu Privat | 29 |
| H7 | Fără Drum la Ghișeu | 19 |
| H8 | Primești PDF Semnat pe Email | 28 |
| H9 | Prețul Include TVA | 18 |
| H10 | Comandă Online de Acasă | 23 |
| H11 | Plată Securizată cu Cardul | 26 |
| H12 | Pentru Persoane Fizice și PJ | 28 |
| H13 | Obținem Cazierul în Locul Tău | 29 |
| H14 | Comandă Acum pe Documentero | 27 |
| H15 | Formular Online, Fără Cozi | 26 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Serviciu privat, neafiliat cu Poliția. Obținem cazierul prin avocat, cu împuternicire. **[PIN descriere poz. 1]** | 86 |
| D2 | Standard 198 lei (3–5 zile lucrătoare) sau urgent 278 lei (1–2 zile). TVA inclus. | 81 |
| D3 | Completezi formularul, plătești cu cardul și primești cazierul PDF semnat pe email. | 83 |
| D4 | Cazierul îl eliberează Poliția; noi depunem cererea prin avocat și ți-l trimitem. | 81 |

**RSA B – proces și transparență**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier Judiciar Fără Deplasare | 30 |
| H2 | Obținem Cazierul prin Avocat | 28 |
| H3 | Serviciu Privat Documentero | 27 |
| H4 | Neafiliat cu Poliția | 20 |
| H5 | Tarif Serviciu: 198 lei | 23 |
| H6 | Termen: 3–5 Zile Lucrătoare | 27 |
| H7 | Varianta Urgentă: 1–2 Zile | 26 |
| H8 | Completezi Formularul Online | 28 |
| H9 | Semnezi Împuternicirea Online | 29 |
| H10 | Cazierul Vine pe Email, PDF | 27 |
| H11 | Fără Cozi și Fără Programări | 28 |
| H12 | Persoane Fizice și Firme | 24 |
| H13 | Factură pentru Fiecare Comandă | 30 |
| H14 | Comandă Cazierul Acum | 21 |
| H15 | Vezi Prețul și Termenul | 23 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Varianta de stat e gratuită. Noi ne ocupăm de tot, prin avocat, contra 198 lei. | 79 |
| D2 | Documentero e un serviciu privat, neafiliat cu Poliția. Prețurile sunt afișate clar. **[PIN descriere poz. 1]** | 84 |
| D3 | 3 pași: formular online, plată cu cardul, cazier PDF pe email în 3–5 zile lucrătoare. | 85 |
| D4 | Ai nevoie mai repede? Varianta urgentă costă 278 lei și durează 1–2 zile lucrătoare. | 84 |

#### J2 Urgent  
*Campanie:* F2-J Cazier judiciar – RO (faza 2)  
*Final URL:* `https://documentero.ro/cazier-judiciar-online/?varianta=urgent`  
*Display path:* `documentero.ro/cazier-judiciar/urgent`

**RSA A – viteză și preț**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier Judiciar Urgent | 22 |
| H2 | Cazier Urgent în 1–2 Zile | 25 |
| H3 | Urgent: 278 lei cu TVA | 22 |
| H4 | 1–2 Zile Lucrătoare | 19 |
| H5 | Cazier Judiciar prin Avocat | 27 |
| H6 | Serviciu Privat, Neafiliat | 26 |
| H7 | Fără Drum la Ghișeu | 19 |
| H8 | PDF Semnat pe Email | 19 |
| H9 | Comandă Online, Fără Drum | 25 |
| H10 | Plată Securizată cu Cardul | 26 |
| H11 | Standard: 198 lei, 3–5 Zile | 27 |
| H12 | Pentru Persoane Fizice și PJ | 28 |
| H13 | Documentero – Serviciu Privat | 29 |
| H14 | Comandă Varianta Urgentă | 24 |
| H15 | Obținem Cazierul în Locul Tău | 29 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Varianta urgentă: 278 lei, 1–2 zile lucrătoare. Serviciu privat, neafiliat cu Poliția. **[PIN descriere poz. 1]** | 86 |
| D2 | Obținem cazierul prin avocat, cu împuternicire. Îl primești PDF semnat pe email. | 80 |
| D3 | Nu ai timp de ghișeu? Completezi formularul online și plătești cu cardul. | 73 |
| D4 | Dacă nu te grăbește, varianta standard costă 198 lei și durează 3–5 zile lucrătoare. | 84 |

**RSA B – termen clar**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Ai Nevoie Urgent de Cazier? | 27 |
| H2 | Cazier Judiciar în 1–2 Zile | 27 |
| H3 | Tarif Urgent: 278 lei | 21 |
| H4 | Termen în Zile Lucrătoare | 25 |
| H5 | Obținem Cazierul prin Avocat | 28 |
| H6 | Neafiliat cu Poliția | 20 |
| H7 | Serviciu Privat Documentero | 27 |
| H8 | Cazierul Vine pe Email, PDF | 27 |
| H9 | Formular Online, Fără Cozi | 26 |
| H10 | Semnezi Împuternicirea Online | 29 |
| H11 | Factură pentru Fiecare Comandă | 30 |
| H12 | Persoane Fizice și Firme | 24 |
| H13 | Comandă Cazierul Acum | 21 |
| H14 | Vezi Prețul și Termenul | 23 |
| H15 | Fără Programare la Ghișeu | 25 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Termenul urgent e de 1–2 zile lucrătoare de la plată. Preț afișat: 278 lei cu TVA. | 82 |
| D2 | Documentero e serviciu privat. Cazierul îl eliberează Poliția; noi depunem cererea. **[PIN descriere poz. 1]** | 83 |
| D3 | Varianta de stat e gratuită, dar cere drum la ghișeu. Noi ne ocupăm prin avocat. | 80 |
| D4 | Completezi datele, semnezi online, plătești cu cardul. Restul îl facem noi. | 75 |

#### J3 Diaspora  
*Campanie:* F2-J Cazier judiciar – Diaspora (faza 2)  
*Final URL:* `https://documentero.ro/cazier-judiciar-online/?livrare=strainatate`  
*Display path:* `documentero.ro/cazier/diaspora`

**RSA A – din străinătate**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier Judiciar din Diaspora | 28 |
| H2 | Cazier din Străinătate | 22 |
| H3 | Fără Drum în România | 20 |
| H4 | Cazier Judiciar prin Avocat | 27 |
| H5 | 198 lei, 3–5 Zile Lucrătoare | 28 |
| H6 | PDF Semnat pe Email | 19 |
| H7 | Apostilă Haga la Cerere | 23 |
| H8 | Traducere Autorizată Opțională | 30 |
| H9 | Curier Internațional Opțional | 29 |
| H10 | Serviciu Privat, Neafiliat | 26 |
| H11 | Documentero – Serviciu Privat | 29 |
| H12 | Comandă Online de Oriunde | 25 |
| H13 | Plată Securizată cu Cardul | 26 |
| H14 | Urgent: 278 lei, 1–2 Zile | 25 |
| H15 | Comandă Cazierul Acum | 21 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Ești în străinătate? Obținem cazierul românesc prin avocat, cu împuternicire. | 77 |
| D2 | Standard 198 lei, 3–5 zile lucrătoare. Apostila, traducerea și curierul costă separat. | 86 |
| D3 | Serviciu privat, neafiliat cu Poliția. Primești cazierul PDF semnat pe email. **[PIN descriere poz. 1]** | 77 |
| D4 | Completezi formularul online, semnezi împuternicirea și plătești cu cardul. | 75 |

**RSA B – apostilă și livrare**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier pentru Străinătate | 25 |
| H2 | Cazier cu Apostilă Haga | 23 |
| H3 | Apostilă Haga: 238 lei | 22 |
| H4 | Traducere: 178,50 lei | 21 |
| H5 | Curier Extern: 100–250 lei | 26 |
| H6 | Cazier Judiciar Online | 22 |
| H7 | Obținem Cazierul în Locul Tău | 29 |
| H8 | Neafiliat cu Poliția | 20 |
| H9 | Serviciu Privat Documentero | 27 |
| H10 | Tarif Serviciu: 198 lei | 23 |
| H11 | Termen: 3–5 Zile Lucrătoare | 27 |
| H12 | Fără Concediu pentru Ghișeu | 27 |
| H13 | Formular Online, Fără Cozi | 26 |
| H14 | Prețurile Sunt Afișate Clar | 27 |
| H15 | Vezi Prețul și Termenul | 23 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Cazier 198 lei. Opțional: apostilă Haga 238 lei, traducere 178,50 lei, curier extern. | 85 |
| D2 | Documentero e serviciu privat. Cazierul îl eliberează Poliția; noi depunem cererea. **[PIN descriere poz. 1]** | 83 |
| D3 | Varianta de stat e gratuită, dar cere drum la ghișeu sau semnătură calificată. | 78 |
| D4 | Prețul curierului internațional e 100–250 lei, după țară. Îl vezi înainte de plată. | 83 |

#### J4 Angajare / scop  
*Campanie:* F2-J Cazier judiciar – RO (faza 2)  
*Final URL:* `https://documentero.ro/cazier-judiciar-online/`  
*Display path:* `documentero.ro/cazier/angajare`

**RSA A – angajare**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier pentru Angajare | 22 |
| H2 | Cazier Judiciar pentru Job | 26 |
| H3 | Ai Nevoie de Cazier la Job? | 27 |
| H4 | Cazier Judiciar prin Avocat | 27 |
| H5 | 198 lei, 3–5 Zile Lucrătoare | 28 |
| H6 | Urgent: 278 lei, 1–2 Zile | 25 |
| H7 | Fără Drum la Ghișeu | 19 |
| H8 | PDF Semnat pe Email | 19 |
| H9 | Serviciu Privat, Neafiliat | 26 |
| H10 | Documentero – Serviciu Privat | 29 |
| H11 | Comandă Online de Acasă | 23 |
| H12 | Plată Securizată cu Cardul | 26 |
| H13 | Fără Zi Liberă pentru Ghișeu | 28 |
| H14 | Comandă Cazierul Acum | 21 |
| H15 | Obținem Cazierul în Locul Tău | 29 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Angajatorul cere cazier? Îl obținem prin avocat, fără să mergi la ghișeu. | 73 |
| D2 | Standard 198 lei (3–5 zile lucrătoare) sau urgent 278 lei (1–2 zile). TVA inclus. | 81 |
| D3 | Serviciu privat, neafiliat cu Poliția. Primești cazierul PDF semnat pe email. **[PIN descriere poz. 1]** | 77 |
| D4 | Completezi formularul, semnezi împuternicirea online și plătești cu cardul. | 75 |

**RSA B – fără zi liberă**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier Judiciar Online | 22 |
| H2 | Cazier pentru Dosarul de Job | 28 |
| H3 | Nu-ți Lua Liber pentru Ghișeu | 29 |
| H4 | Obținem Cazierul prin Avocat | 28 |
| H5 | Neafiliat cu Poliția | 20 |
| H6 | Serviciu Privat Documentero | 27 |
| H7 | Tarif Serviciu: 198 lei | 23 |
| H8 | Termen: 3–5 Zile Lucrătoare | 27 |
| H9 | Varianta Urgentă: 1–2 Zile | 26 |
| H10 | Cazierul Vine pe Email, PDF | 27 |
| H11 | Formular Online, Fără Cozi | 26 |
| H12 | Semnezi Împuternicirea Online | 29 |
| H13 | Factură pentru Fiecare Comandă | 30 |
| H14 | Vezi Prețul și Termenul | 23 |
| H15 | Comandă de pe Telefon | 21 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Varianta de stat e gratuită. Noi ne ocupăm de tot, prin avocat, contra 198 lei. | 79 |
| D2 | Cazierul îl eliberează Poliția; noi depunem cererea și ți-l trimitem pe email. | 78 |
| D3 | Pornește dosarul de angajare azi: formular online, plată cu cardul, PDF pe email. | 81 |
| D4 | Documentero e un serviciu privat, neafiliat cu Poliția. Prețurile sunt afișate clar. **[PIN descriere poz. 1]** | 84 |

#### J5 Persoană juridică  
*Campanie:* F2-J Cazier judiciar – RO (faza 2)  
*Final URL:* `https://documentero.ro/cazier-judiciar-online/?tip=pj`  
*Display path:* `documentero.ro/cazier/firma`

**RSA A – firmă**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier Judiciar pentru Firmă | 28 |
| H2 | Cazier Judiciar PJ Online | 25 |
| H3 | Pentru SRL, SA și Alte Firme | 28 |
| H4 | Cazier Judiciar prin Avocat | 27 |
| H5 | 198 lei, 3–5 Zile Lucrătoare | 28 |
| H6 | Urgent: 278 lei, 1–2 Zile | 25 |
| H7 | Pentru Licitații și Dosare | 26 |
| H8 | PDF Semnat pe Email | 19 |
| H9 | Factură pe Firmă | 16 |
| H10 | Serviciu Privat, Neafiliat | 26 |
| H11 | Documentero – Serviciu Privat | 29 |
| H12 | Fără Drum la Ghișeu | 19 |
| H13 | Plată Securizată cu Cardul | 26 |
| H14 | Comandă pentru Firma Ta | 23 |
| H15 | Obținem Cazierul în Locul Tău | 29 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Cazier judiciar pentru persoană juridică, obținut prin avocat, cu împuternicire. | 80 |
| D2 | Standard 198 lei (3–5 zile lucrătoare) sau urgent 278 lei (1–2 zile). TVA inclus. | 81 |
| D3 | Serviciu privat, neafiliat cu Poliția. Factură pe firmă, cazier PDF pe email. **[PIN descriere poz. 1]** | 77 |
| D4 | Introduci CUI-ul și datele reprezentantului, semnezi online și plătești cu cardul. | 82 |

**RSA B – licitații**

| # | Titlu (≤30) | Car. |
|---|---|---|
| H1 | Cazier Firmă pentru Licitație | 29 |
| H2 | Cazier Judiciar Societate | 25 |
| H3 | Obținem Cazierul prin Avocat | 28 |
| H4 | Neafiliat cu Poliția | 20 |
| H5 | Serviciu Privat Documentero | 27 |
| H6 | Tarif Serviciu: 198 lei | 23 |
| H7 | Termen: 3–5 Zile Lucrătoare | 27 |
| H8 | Varianta Urgentă: 1–2 Zile | 26 |
| H9 | Cazierul Vine pe Email, PDF | 27 |
| H10 | Factură pe Firmă | 16 |
| H11 | Fără Drum pentru Administrator | 30 |
| H12 | Formular Online, Fără Cozi | 26 |
| H13 | Vezi Prețul și Termenul | 23 |
| H14 | Comandă Cazierul Firmei | 23 |
| H15 | Persoane Fizice și Firme | 24 |

| # | Descriere (≤90) | Car. |
|---|---|---|
| D1 | Varianta de stat e gratuită. Noi ne ocupăm de tot, prin avocat, contra 198 lei. | 79 |
| D2 | Cazierul îl eliberează Poliția; noi depunem cererea pentru firmă și ți-l trimitem. | 82 |
| D3 | Ai termen la licitație? Varianta urgentă costă 278 lei și durează 1–2 zile lucrătoare. | 86 |
| D4 | Documentero e un serviciu privat, neafiliat cu Poliția. Prețurile sunt afișate clar. **[PIN descriere poz. 1]** | 84 |
