# Analiza concurenților: certificat constatator (11.11.2026)

Analiză a paginilor care apar organic sau în reclame pe Google.ro pentru „certificat constatator online”. Am descărcat cu curl homepage-ul fiecărui site, sitemap-ul, robots.txt și câteva pagini de produs sau ghid. Pentru digigov.ro și dianex.ro am analizat doar pagina de certificat constatator. Am citit HTML-ul servit de server, fără să execut JavaScript, cu o singură excepție: la constatator-online.ro am citit bundle-ul JS, pentru că serverul trimite doar o pagină goală. Nu am trimis formulare și nu am plasat comenzi.

Numărul de cuvinte e aproximativ: textul vizibil din HTML, cu meniul și footerul incluse. Citatele sunt scurte și servesc doar ca dovadă. Prețurile sunt cele afișate în ziua analizei.

---

## 1. Rezumat pe scurt

- Prețul de bază pe piață: **59 până la 145 lei**. Majoritatea site-urilor stau între 79 și 99 lei, cu taxa ONRC inclusă.
- Modul în care e tratat TVA-ul diferă mult și face comparația înșelătoare. Unii afișează „+ TVA”, alții „preț final”, alții „TVA inclus”.
- Toți promit livrare pe email în minute. Promisiunile variază de la „~3 minute” la „10 minute”, plus garanția „30 de minute”.
- Comanda pornește de pe homepage la toate site-urile dedicate. Nimeni nu cere cont. Primul ecran cere aproape peste tot doar CUI-ul. **Niciun site nu cere CUI + email pe primul ecran.**
- Niciun site nu folosește AggregateRating în schema. Un singur site afișează o notă Google cu număr de recenzii.
- Doar certificat-constatator-instant.ro are conținut în profunzime (aproximativ 2.550 de cuvinte pe homepage, plus în jur de 25 de ghiduri). Celelalte două site-uri din top 3 organic sunt subțiri sau goale pentru crawler.
- Mai multe site-uri par să împartă cod sau operator (același telefon, același widget, aceleași greșeli de scriere). Setul real de competitori e mai mic decât cele 10 domenii.

---

## 2. Tabel comparativ

### 2.1 Prețuri, normalizate

| Site | Preț afișat (de bază) | Tratare TVA | Total plătit estimat | Alte produse |
|---|---|---|---|---|
| certificatconstatator.ro | 84,90 lei + TVA | TVA separat; două facturi (serviciu + taxa ONRC) | probabil aproximativ 96,50 lei (TVA doar pe comision, după structura cu două facturi; neconfirmat) | Cu istoric 399,90 + TVA |
| certificat-constatator-instant.ro | 84,99 lei + TVA | TVA doar pe comision, taxa ONRC fără TVA | **96,54 lei** (afișat în tabel) | RBR la zi 119,99 + TVA (145,19); RBR istoric 199,99 + TVA (241,99); Raport istoric 399,99 + TVA (431,49) |
| constatator-online.ro | 88 lei (cu reducere variabilă) + TVA la facturare pe firmă | „+ TVA” doar când factura e pe persoană juridică | neafișat static | Furnizare informații (pe CNP) 59; RBR 165 la zi / 247 istoric; Cu istoric 399 |
| constatator.ro | 99 lei + TVA pe card și în JSON-LD; **69 lei** în sumarul formularului | inconsecvent | 69 sau aproximativ 120 lei, neclar | RBR 119 + TVA; Cu istoric 399 + TVA |
| cc-onrc.ro | 79 lei „preț final” (homepage); 59 lei pe /serviciu-urgent | „fără taxe ascunse”, TVA nemenționat | 79 sau 59 | Cu istoric 379 (homepage) / 349 (urgent); RBR 119 |
| certificat-constatator-extins.ro | 99 lei | nemenționat | 99 | doar „extins”, cu trei scopuri (de bază, IMM, insolvență) |
| eliberare-certificat-constatator-online.ro (ECCO) | 99 lei total | TVA inclus; spune explicit taxa oficială de 30 lei | 99 | Fonduri IMM 99; Insolvență 99; RBR 129; Raport istoric 450 |
| onrc.info.ro | 99 lei + TVA 21% pe tot | TVA pe toată suma | **119,79 lei** | Cu istoric 399 + TVA (482,79); opțiuni: prioritar 19, WhatsApp 9, verificare specialist 9 (toate + TVA) |
| digigov.ro | 122 lei Standard (≤2 ore); 145,40 Urgent (~5 min) | TVA inclus | 122 / 145,40 | Pe persoană fizică 122; RBR istoric 284,70; Cu istoric 508,40; verificare suplimentară 142,30 |
| dianex.ro | 90 lei | TVA inclus | 90 | Pe persoană fizică 90; Cu istoric 499 |

Observații:
- Structura „comision + TVA, taxa ONRC fără TVA” (instant, probabil și certificatconstatator.ro) duce la aproximativ 96,5 lei plătiți. onrc.info.ro aplică TVA pe tot și ajunge la 119,79.
- **Decizie deschisă pentru noi:** 89 lei înseamnă cu TVA sau fără? Cu TVA inclus suntem în grupul ieftin (sub 96,54 și sub 99). Cu „89 + TVA” pe toată suma ajungem la aproximativ 108 lei, peste instant și ECCO.
- ECCO e singurul care scrie explicit cât e taxa oficială (30 lei) și ce act normativ o stabilește. Afirmația trebuie verificată pe onrc.ro înainte să o folosim.
- cc-onrc are un landing mai ieftin (59 lei) decât homepage-ul (79 lei), probabil pentru reclame.

### 2.2 Livrare, formular, cont

| Site | Promisiune livrare | Non-stop | Primul ecran al formularului | Lookup după CUI | Cont | Comanda pe homepage |
|---|---|---|---|---|---|---|
| certificatconstatator.ro | 10 minute; widget „timp mediu” live (4 min la momentul analizei) | da, 24/7 | doar CUI | da | nu | da, în hero |
| certificat-constatator-instant.ro | ~3 minute | da | **tipul documentului** (document, variantă, scop); CUI abia la pasul 2 | da (denumire, nr. registru, adresă) | nu | da |
| constatator-online.ro | „pe loc”, „câteva minute”; 15-30 min când ONRC e încărcat | da | tab Firmă/PFA (CUI) sau Persoană fizică (CNP) + buton de căutare | da, inclusiv după CNP | nu | da (aplicație JS) |
| constatator.ro | 2-3 minute în medie, „Garanția celor 30 de minute” | da | CUI sau CNP | da | nu | da |
| cc-onrc.ro | 5 minute | da | doar CUI/CIF | da | nu | da |
| certificat-constatator-extins.ro | 10 minute (în alte locuri 5) | implicit | identificarea firmei; motivul și emailul la pasul 2 | da | nu | da |
| ECCO | ~7 minute, **în programul registrului** | comanda da, emiterea nu | identificarea firmei după denumire sau CUI | da | nu | da |
| onrc.info.ro | „câteva minute” | „solicitări nonstop” | doar CUI, cu denumirea afișată pentru confirmare | da | nu | da |
| digigov.ro | Urgent ~5 min; Standard ≤2 ore, zile lucrătoare 08-18 | nu | formular pe pagină separată (/cerere/...), nevăzut fără JS | probabil | nu | nu, buton către cerere |
| dianex.ro | 10-90 min, zile lucrătoare 08:00-16:30 | nu | tipul documentului + scopul; CUI la pasul 2 | da (din ANAF) | nu | da, pe pagina de produs |

Niciun site nu cere CUI + email pe primul ecran. Emailul vine mereu la pasul 2, 3 sau 4. Mai multe formulare cer **scopul** cererii dintr-o listă lungă (40+ instituții: bancă, licitație, AFIR, IGI, CNAS, ARR etc.). Lista pare preluată din formularul ONRC.

### 2.3 Ce documente numesc „automat”

| Site | Ce e prezentat ca automat |
|---|---|
| certificatconstatator.ro | „Eliberare automată la orice oră”, pentru certificat (titlu și hero); refund automat; facturi automate |
| certificat-constatator-instant.ro | „procesarea prin ONRC este automată, 24/7”, despre certificat; completare automată după CUI; factură automată |
| constatator-online.ro | în bundle: certificatele InfoCert și InfoRBR se eliberează automat, în câteva minute (certificat + extras RBR) |
| constatator.ro | titlul: „Certificat Constatator și Extras RBR Online, Eliberare Automată” |
| cc-onrc.ro | „Eliberare automată la orice oră”, despre certificat |
| ECCO | doar plata cu cardul e „procesată automat”; mai spune că InfoCert emite automat pe portal, dar emiterea prin ei urmează programul registrului |
| onrc.info.ro | doar afișarea automată a denumirii după CUI; emiterea nu e numită automată |
| certificat-constatator-extins.ro | nimic numit automat |
| digigov.ro | nimic numit automat; termene în ore lucrătoare |
| dianex.ro | doar completarea automată din ANAF; subliniază că verificarea e umană |

Raportul istoric nu e numit „automat” nicăieri. ECCO îi dă ~15 minute, digigov îl tratează separat, cu alte termene.

### 2.4 Elemente de încredere

| Site | Recenzii | Date firmă | Garanție / refund | Neafiliere ONRC | „oficial” / sigla ONRC |
|---|---|---|---|---|---|
| certificatconstatator.ro | 6 testimoniale pe site (prenume + inițială), fără sursă externă; „Peste 10.000 de clienți” | **nu am găsit denumirea firmei** pe homepage; doar email și telefon | „Garantat banii înapoi dacă nu ești mulțumit”; refund automat în 1-3 zile | nu am găsit | „Original de la registrul comertului”; zid de logo-uri de mari companii („au comandat prin noi”) |
| certificat-constatator-instant.ro | fără recenzii; „1.500+ documente în ultimele 30 de zile”; zid de logo-uri | da (SRL, CUI, J, adresă) | „Banii înapoi dacă documentul nu poate fi eliberat” | da: „Serviciu independent de intermediere” | **folosește sigla ONRC** (imagine „Logo ONRC”) |
| constatator-online.ro | nimic | da, în bundle (SRL, CUI, J, adresă) | nu am găsit | nu am găsit | „Documente oficiale ONRC” |
| constatator.ro | 6 testimoniale Facebook ale grupului-mamă, cu link la postări; „Peste 40.000 de clienți” ai grupului; schema Review cu nod Person | da; expert contabil CECCAR, cu numărul autorizației | „Garanția celor 30 de minute”, cu returnarea banilor | da, explicit | „certificatelor oficiale” |
| cc-onrc.ro | nimic | da, în footer | „Garantat banii înapoi” (pe landingul urgent) | da: „platformă privată online, independentă” | domeniul conține „onrc”; link „www.ONRC.ro” în footer |
| certificat-constatator-extins.ro | nimic | nu am găsit în pagină | nu | nu am găsit | „document oficial” de mai multe ori; „Server ONRC FUNCTIONAL” |
| ECCO | **5,0 din 165 de recenzii Google**, profilul unei firme partenere | da, cu partenerul numit; „din 2024” | nu | da, în header și footer: „Nu suntem ONRC” | „portalul oficial” (despre ONRC, corect) |
| onrc.info.ro | nimic | da, cu program de suport | refund la procesarea prioritară nelivrată | da, cel mai explicit dintre toate | domeniul conține „onrc”; logo-ul de text „ONRC.Info” |
| digigov.ro | nimic pe pagină; „300.000+ documente”, „10.000+ certificate constatatoare” | da | nu pe pagină | da („Serviciu privat de asistență”) | titlul homepage folosește „Acte și certificate oficiale” |
| dianex.ro | 4,8/5 pe Google, în footer, fără număr | da, două firme; CECCAR, CCF | „Garanție 100% Satisfacție” în footer; politică de anulare clară | da, explicit | nu |

### 2.5 FAQ și schema

| Site | FAQ | Nr. întrebări | Schema JSON-LD |
|---|---|---|---|
| certificatconstatator.ro | accordion (`<details>`) | 11 | Service, Offer, FAQPage, Organization |
| certificat-constatator-instant.ro | accordion (`<details>`) | 12 | Product, Offer, AggregateOffer, Service, FAQPage, Organization, MerchantReturnPolicy, OfferShippingDetails, ShippingDeliveryTime, WebSite |
| constatator-online.ro | invizibil pentru crawler | ? | niciuna (doar meta) |
| constatator.ro | nu există | 0 | Offer, PriceSpecification, Organization, Review, Person, WebPage |
| cc-onrc.ro | nu există | 0 | WebPage, WebSite, Organization (Yoast) |
| certificat-constatator-extins.ro | vizibil, H3 | 5 | niciuna |
| ECCO | vizibil | 4 | Service, Offer, Organization, BreadcrumbList, WebPage (fără FAQPage) |
| onrc.info.ro | accordion (`<details>`) | 10 | Service, Offer, FAQPage, Organization, BreadcrumbList, SearchAction |
| digigov.ro | H3 + accordion | 15 | Product, Brand, Offer, Service, FAQPage, BreadcrumbList |
| dianex.ro | accordion | 5 | Service, Offer, FAQPage, BreadcrumbList |

**Niciun site nu are AggregateRating.** Nici ECCO, care afișează nota Google în pagină.

### 2.6 Ghiduri și blog

| Site | Ghiduri | Observații |
|---|---|---|
| certificat-constatator-instant.ro | 97 URL-uri în sitemap: 9 versiuni de limbă, 42 de pagini pe județ (oficiile ONRC), în jur de 13 landing-uri pe intenție și în jur de 25 de articole | landing-uri: `/certificat-constatator-licitatie/`, `-banca/`, `-leasing/`, `-pfa/`, `-punct-de-lucru/`, `-fonduri-imm/`, `-fonduri-europene/`, `-insolventa/`, `-auto/`, `-pentru-autoritatea-rutiera-romana-arr/`, `-extins/`, `/cat-costa-certificat-constatator/`, `/valabilitate-certificat-constatator-onrc/`, `/tipuri-de-certificatelor-constatatoare-onrc/`, `/starea-firmei-registrul-comertului/`, `/recom-online-infocert-portal-onrc/`, `/raport-istoric-onrc/`, `/registrul-beneficiarilor-reali/`, `/declaratia-privind-beneficiarii-reali/`, `/actualizare-caen-rev-3/`, `/e-factura-b2c/`, `/verificare-firma/` |
| ECCO | 6 articole + 7 landing-uri | `/certificat-constatator-extins/`, `-detaliat/`, `-pfa/`, `-fonduri-imm/`, `/valabilitate-certificat-constatator/`, `/certificat-constatator-portal-onrc/`, `/certificat-constatator-cu-istoric-raport-istoric-onrc/`; articole: `/firma/`, `/punct-de-lucru/`, `/inmatriculare-auto/`, licitație, contract comercial, documente în firmă |
| onrc.info.ro | 7 landing-uri | `/certificat-constatator/`, `-online/`, `-onrc/`, `/certificat-onrc/`, `-persoana-fizica/`, `-dupa-cnp/`, `-cu-istoric/`; domeniu înregistrat în august 2026 |
| digigov.ro | pagina de serviciu + 42 de pagini pe oraș (`/certificat-constatator/<oras>`) + 1 articol (`/blog/certificat-constatator-de-baza-extins-detaliat`) | site multi-serviciu |
| dianex.ro | 3 pagini de produs (firmă, persoană fizică, istoric) + 2 articole de blog | site de contabilitate |
| certificatconstatator.ro | **nu are sitemap** (aplicația întoarce homepage-ul pe orice URL); paginile găsite: `/`, `/business`, `/contact` | /business: abonament, comenzi multiple, API |
| constatator.ro | nu are sitemap, blog sau robots.txt | o singură pagină + subdomeniu „corporate” |
| cc-onrc.ro | 5 pagini de produs WooCommerce, fără ghiduri | |
| certificat-constatator-extins.ro | doar homepage + pagini legale | |
| constatator-online.ro | aplicație cu o singură pagină | |

### 2.7 Vechimea domeniilor (whois.rotld.ro)

| Domeniu | Înregistrat |
|---|---|
| dianex.ro | 2005-08-30 |
| certificatconstatator.ro | 2018-12-22 |
| constatator.ro | 2022-03-16 |
| constatator-online.ro | 2023-01-25 |
| digigov.ro | 2023-08-02 |
| certificat-constatator-instant.ro | 2023-11-28 |
| eliberare-certificat-constatator-online.ro | 2024-03-26 |
| cc-onrc.ro | 2024-12-05 |
| certificat-constatator-extins.ro | 2024-12-18 |
| onrc.info.ro | 2026-08-12 |

---

## 3. Fișe pe site

### 3.1 certificatconstatator.ro

- **Title:** „Certificat Constatator Online, Eliberare Automată în 10 Minute”. **Meta:** eliberare automată non-stop, 10 minute, „peste 10.000 de clienți”.
- **H1:** „Certificat Constatator în 10 minute”.
- **H2/H3:** Completează datele de mai jos; Comanda certificat constatator online; (H3) 10 minute, Semnat electronic, Serviciu asigurat NON STOP, Toate tipurile de certificate; Taxa inclusă, niciun ban în plus; (H3) Certificat constatator, Certificat Constatator cu istoric; Original de la registrul comertului; Peste 10.000 de clienți mulțumiți; Întrebări frecvente; Ai nevoie de mai multe certificate constatatoare?
- **Cuvinte:** aproximativ 1.100.
- **Produse:** de bază 84,90 + TVA; cu istoric 399,90 + TVA. Ca tipuri, menționează și fonduri IMM, insolvență și „furnizare informații”. Pe /business: abonament (5, 20 sau 60 de certificate pe lună), comenzi multiple dintr-o listă de CUI-uri, API, o factură pe lună.
- **Livrare:** email, SMS și WhatsApp; 10 minute; widget live cu starea ONRC și timpul mediu.
- **Formular:** 4 pași (CUI, tip, facturare, contact). Primul ecran cere doar CUI-ul.
- **Încredere:** zid de logo-uri de mari companii, testimoniale interne, garanția banilor înapoi, plată Stripe, două facturi. Explică pe larg semnătura calificată, marca temporală, watermark-ul și codul de bare verificabil în InfoCert. Nu am găsit pe homepage disclaimer de neafiliere și nici denumirea firmei.
- **FAQ (11):** ce certificat mi se potrivește; ce e fișierul de furnizare informații; cât durează; e original și valabil; pot comanda pentru altă firmă; contează scopul; cum plătesc; ce se întâmplă dacă nu primesc documentul; primesc factură; contact; diferența dintre de bază și cu istoric.

### 3.2 certificat-constatator-instant.ro

- **Title:** „Certificat Constatator Online, Eliberat de ONRC în 3 Minute”. **Meta:** emis de ONRC, ~3 minute non-stop, 84,99 + TVA, taxa inclusă.
- **H1:** „Certificat constatator online”.
- **H2/H3, în ordine:** Comandă online (Alege documentul, Firma, Date și plată); Companii care au comandat certificate prin noi; Certificatul constatator, în 4 pași simpli; Ce document îți trebuie? (Certificat constatator, Beneficiari reali, Raport istoric firmă); Ce conține certificatul constatator ONRC; Când îți cere cineva certificat constatator (Bancă, credit sau cont de firmă; Licitații SEAP/SICAP; Fonduri europene și granturi IMM; Insolvență și lichidare; ANAF; Leasing și achiziții auto; ARR; PFA, II și puncte de lucru); Cât costă un certificat constatator online; Oficiile Registrului Comerțului pe județe; Întrebări frecvente; Ghiduri utile; Primești certificatul în câteva minute.
- **Cuvinte:** aproximativ 2.550, cel mai mult dintre site-urile dedicate.
- **Produse:** certificat (variante de bază, fonduri IMM, insolvență) 84,99 + TVA; RBR la zi 119,99 / istoric 199,99 + TVA; raport istoric 399,99 + TVA; comandă pentru până la 50 de CUI-uri.
- **Poziție de conținut:** spune clar că ONRC eliberează un singur certificat, iar „extins” și „detaliat” sunt denumiri folosite de instituții. Mai spune că „furnizarea de informații” nu se mai emite separat, că certificatul nu conține beneficiarii reali și că valabilitatea uzuală e de 30 de zile (15 la unele licitații). Oferă modele PDF cenzurate pentru fiecare scop.
- **Formular:** documentul întâi, apoi CUI-ul cu completare automată, apoi email, telefon, facturare și plată (Netopia sau transfer bancar). Bifă de renunțare la dreptul de retragere.
- **Încredere:** date complete ale firmei, disclaimer „serviciu independent de intermediere”, refund dacă documentul nu poate fi eliberat, contor „1.500+ în 30 de zile”, zid de logo-uri. Folosește sigla ONRC lângă text.
- **FAQ (12):** ce conține; ce s-a întâmplat cu furnizarea de informații; cât durează; cât costă; aceeași valoare ca la ghișeu; cât e valabil; trebuie cont ONRC; pentru o firmă care nu e a mea; diferența față de beneficiari reali; weekend sau noapte; cum verific autenticitatea; ce fac dacă nu primesc emailul.

### 3.3 constatator-online.ro

- Serverul trimite aproximativ 9 cuvinte (`<div id="root">` gol). Crawlerele care nu execută JS nu văd nimic. Title: „Certificat Constatator - ONRC Online - eliberare pe loc”. Meta: eliberare pe loc, 3 pași, non-stop, fără taxă de urgență.
- Din bundle-ul JS: comandă pe firmă/PFA (CUI) sau pe persoană fizică (CNP), cu căutare în ONRC și mesaje de eroare specifice (CNP inexistent în registru, entitate radiată, punct de lucru care trebuie cerut pe CUI-ul firmei-mamă). Indicator „Sistem ONRC activ / supraîncărcat”. Livrare pe email și SMS (telefon opțional). Plată cu cardul sau prin OP, cu proformă. Modele PDF pentru fiecare tip. Lista de scopuri e aceeași ca la instant.
- Prețuri: certificat 88 minus o reducere variabilă (+ TVA pe firmă); furnizare informații 59; RBR 165 / 247; cu istoric 399.
- Nu am găsit în bundle disclaimer de neafiliere, garanție sau recenzii.

### 3.4 constatator.ro

- **Title:** „Certificat Constatator și Extras RBR Online, Eliberare Automată”. **H1:** „Obține instant Certificatul Constatator”.
- **H2/H3:** Livrare ultrarapidă, Garanția celor 30 de minute; Certificat Constatator; Extras RBR; Raport Istoric; 100% Original; Eliberare instant; 100% Autentic; Toate tipurile de certificate; Disponibil 24/7; Tarife clare, Taxa ONRC inclusă; Peste 40.000 de clienți au folosit serviciile grupului.
- **Cuvinte:** aproximativ 1.240, din care mult text repetat de formular.
- **Produse:** certificat 99 + TVA (formularul arată însă 69 lei subtotal și total); RBR 119 + TVA; cu istoric 399 + TVA; pe CUI sau CNP.
- **Diferențiator:** garanția de 30 de minute cu returnarea banilor, statistici de livrare „actualizate la fiecare 30 min”, operator expert contabil CECCAR care invocă statutul de entitate raportoare AML/KYC pentru acces la RBR.
- **FAQ:** nu are. **Schema:** recenziile sunt marcate ca Review cu Person, deși sunt testimoniale Facebook ale grupului, nu ale acestui serviciu.

### 3.5 cc-onrc.ro

- **Title:** „Certificat Constatator ONRC online, fără cont”. **H1:** „Obține certificatul constatator online în 5 minute”.
- **H2/H3:** Completează aici; Comenzile tale din ultimele 7 zile; Prețuri; Certificat Constatator 79 lei; Certificat Constatator cu Istoric 379 lei; Original de la registrul comertului.
- **Cuvinte:** aproximativ 500. WordPress + WooCommerce, cu 5 produse.
- Disclaimer clar de platformă privată și independentă. Pe landingul urgent: 59 / 119 (RBR) / 349 lei și „Garantat banii înapoi”. Formular în 4 pași care începe cu CUI-ul. Fără FAQ, fără ghiduri.

### 3.6 certificat-constatator-extins.ro

- **Title:** „Certificat Constatator Extins ONRC, 99 RON, Livrat în 10 minute”. **H1:** „Certificat Constatator Extins, Documentul complet pentru verificarea situației unei firme”.
- **H2/H3:** acceptat de orice instituție; Tot ce trebuie să știi...; Beneficiile comenzii online; Pentru cine este recomandat; Caracteristici cheie; Cum se folosește; Rezultate și avantaje față de alternative; Contraindicații sau limitări; Variante eliberare; Întrebări frecvente (5).
- **Cuvinte:** aproximativ 1.100, text generic.
- Vinde „extins” ca produs separat, apoi spune că toate variantele sunt extinse. Promisiunile de timp diferă de la un loc la altul (2, 5 și 10 minute). Afișează „Server ONRC FUNCTIONAL”. Nu are schema și nici disclaimer de neafiliere. Are același telefon și același formular ca ECCO.

### 3.7 eliberare-certificat-constatator-online.ro (ECCO)

- **Title:** „Certificat constatator online: 99 lei, pe email în ~7 minute”. **H1:** „Certificat constatator online prin ECCO: emis de ONRC, pe email în ~7 minute”. Afișează data actualizării („31 octombrie 2026”).
- **H2:** Comandă certificatul; Pe scurt; Ce este și ce conține; Cât costă și în cât timp; Cum comanzi, pas cu pas; De bază, extins sau detaliat: care îți trebuie?; Prin ECCO sau direct la registru; Cât timp e valabil; E valabil la bancă un certificat primit pe email?; Pentru ce situații; Cine este ECCO?; Întrebări frecvente; Comandă acum.
- **Cuvinte:** aproximativ 2.260.
- **Diferențiatori:** cel mai onest ton din piață. Spune că varianta directă pe portal e mai ieftină, că emiterea se face în programul registrului, că taxa oficială e de 30 lei și din ce ordin vine. Citează Legea 265/2022, Legea 214/2024 și eIDAS și pune o secțiune de surse oficiale. Afișează o notă Google cu număr de recenzii. Mai susține că ghișeele de casierie ONRC s-au închis pe 15.10.2026; de verificat.
- **FAQ vizibil (4):** există certificat gratuit; „extras ONRC” e același lucru; seara sau în weekend; pentru o firmă care nu e a mea. Nu are FAQPage în schema.

### 3.8 onrc.info.ro

- **Title:** „Certificat constatator online, eliberat de ONRC | Solicitare pe CUI”. **H1:** „ONRC.Info Obține certificatul constatator în doar câteva minute!”
- **H2:** Formular de solicitare; Cum se solicită (4 etape); Ce se întâmplă după plată; Ce conține; Valabilitatea; Prin această platformă sau direct de la ONRC; Când este solicitat (bancă, achiziții publice, finanțare, raporturi comerciale); Tarife; Întrebări frecvente.
- **Cuvinte:** aproximativ 1.720. Domeniu din august 2026, deja cu 7 landing-uri pe variații de keyword (`-online`, `-onrc`, `-dupa-cnp`, `-persoana-fizica`).
- **Diferențiatori:** cronologia „ce se întâmplă după plată”; secțiunea „ce NU conține” (date financiare, datorii, angajați); explică faptul că tipărirea anulează semnătura; upsell-uri plătite (procesare prioritară, WhatsApp, verificare de specialist).
- **FAQ (10):** raportul cu ONRC; de ce tariful e peste taxa oficială; cât durează; ce e verificarea de specialist; ce se întâmplă dacă ONRC e căzut; pentru altă firmă; PFA/II; trebuie tipărit; conține date financiare; factură.

### 3.9 digigov.ro (pagina /certificat-constatator)

- **Title:** „Certificat constatator online, eliberat de ONRC | DigiGov”. **H1:** „Certificat constatator online”.
- **H2:** Când îți trebuie; Ce primești și ce verifici înainte să comanzi; Cum obții certificatul, pas cu pas; Prin DigiGov sau pe cont propriu?; Cât costă; Ce date trebuie să pregătești (firmă / persoană fizică); Ai CUI-ul firmei?; Ce este; Ți s-a cerut «de bază», «extins» sau «detaliat»?; FAQ (15); Surse; Alte documente; Registrul Comerțului pe județe.
- **Cuvinte:** aproximativ 2.640, cu meniul mare inclus.
- Poziție: pe formularul ONRC nu alegi o variantă, ci bifezi **scopul**. Certificatul pe persoană e tratat separat (CNAS, viza IGI). Are livrare în două trepte de preț (Standard ≤2 ore, Urgent ~5 min), cu termene în zile lucrătoare. Formularul e pe o pagină separată. Are 42 de pagini pe oraș.

### 3.10 dianex.ro (pagina /obtinere-documente/certificat-constatator-online/)

- **Title:** „Certificat Constatator Online, Eliberat de ONRC”. **H1:** „Certificat Constatator Firmă, comandat complet online”.
- **H2:** Completează comanda; Dianex din 2005; Proces local clar; Livrare electronică; Suport uman; Ce este; Ce informații conține; Când îți este necesar; Cum obții documentul; Ce este inclus în preț; Ai nevoie doar de; Document electronic cu semnătură calificată; Condiții de livrare și procesare; FAQ (5).
- **Cuvinte:** aproximativ 2.380, din care o mare parte e meniul site-ului de contabilitate.
- **Diferențiatori:** cel mai mic preț cu TVA inclus (90 lei); verificare umană înainte de depunere; bifă de împuternicire explicită (numele lor apare ca solicitant pe certificat); politică de anulare clară. Termen lent: 10-90 min, doar în zile lucrătoare.

---

## 4. Sinteză

### 4.1 Ce are orice site din top (table stakes)

1. Formular de comandă pe homepage, fără cont, care pornește de la CUI, cu lookup automat al denumirii.
2. Preț afișat cu „taxa ONRC inclusă”, la vedere, în hero sau imediat sub el.
3. Promisiune de timp în minute în title și H1 (3, 5, 7 sau 10).
4. Livrare pe email a PDF-ului semnat electronic de ONRC. Des și pe SMS sau WhatsApp.
5. Produsul de bază plus „cu istoric”. Aproape toți vând și extrasul RBR.
6. Lista de scopuri ale cererii în formular (bancă, licitație, fonduri, IGI etc.).
7. Factură fiscală automată, cu opțiunea firma din certificat / altă firmă / persoană fizică.
8. Specimen de certificat (imagine sau PDF).
9. FAQ despre durată, valabilitate, original vs copie, altă firmă, de bază vs istoric.
10. Plată cu cardul (Stripe sau Netopia). Cei mai mulți oferă și transfer bancar cu proformă.

### 4.2 Ce diferențiază top 3 organic

| | certificatconstatator.ro | certificat-constatator-instant.ro | constatator-online.ro |
|---|---|---|---|
| Vechime domeniu | 2018 (cea mai mare dintre site-urile dedicate) | 2023 | 2023 |
| Conținut servit crawlerului | aproximativ 1.100 cuvinte, 3 URL-uri, fără sitemap | aproximativ 2.550 pe homepage + aproximativ 85 de pagini | aproximativ 9 cuvinte (doar JS) |
| Promisiune | 10 min, widget live cu timpul mediu | ~3 min, cel mai agresiv | „pe loc”, status ONRC live |
| Preț | 84,90 + TVA | 84,99 + TVA (96,54 total) | 88 + TVA |
| Canale de livrare | email + SMS + WhatsApp | email + WhatsApp | email + SMS |
| Încredere | logo-uri de mari companii, garanția banilor | date firmă, neafiliere, refund, contor de volum | aproape nimic vizibil |
| B2B | abonament + API + listă de CUI-uri | până la 50 de CUI-uri | nu |
| Persoană fizică (CNP) | nu | nu | da |

Doar instant câștigă clar la conținut. Pentru celelalte două nu deduc de ce se clasează: datele de aici nu răspund la întrebare. Vechimea domeniului și istoricul de linkuri ar putea conta, dar nu le-am măsurat.

### 4.3 Amprente comune (observații, nu concluzii despre proprietari)

- **certificat-constatator-extins.ro și ECCO:** același număr de telefon și același formular în 4 pași, cu aceleași texte.
- **certificatconstatator.ro, cc-onrc.ro și constatator-online.ro:** același widget „Sistem ONRC activ. Eliberare pe loc” și aceeași structură de formular în 4 pași (CUI, tip, facturare, contact).
- **certificatconstatator.ro și cc-onrc.ro:** același H2 „Original de la registrul comertului”, cu aceeași lipsă de diacritice.
- **certificatconstatator.ro și instant:** același H2 „Companii care au comandat certificate prin noi” și o listă de logo-uri care se suprapune în mare parte.
- **instant, constatator-online.ro, ECCO și dianex:** aceeași listă lungă de scopuri, în aceeași ordine. Probabil e preluată din nomenclatorul ONRC.

Consecință: concurența reală e mai mică decât 10 domenii. Câteva backend-uri par să alimenteze mai multe site-uri.

### 4.4 Contradicții între concurenți (de verificat pe onrc.ro înainte să scriem)

1. **„Furnizare informații”:** certificatconstatator.ro o numește echivalentul certificatului de bază. Instant spune că nu se mai emite separat. constatator-online.ro o vinde încă, la 59 lei, pe CNP.
2. **„Extins”/„detaliat”:** certificat-constatator-extins.ro o vinde ca produs. Instant, ECCO și digigov spun că e același document și că pe formularul ONRC se bifează doar scopul.
3. **Program de emitere:** cinci site-uri promit emitere automată 24/7. ECCO, digigov și dianex spun că emiterea urmează programul registrului sau zilele lucrătoare.
4. **Taxa oficială:** doar ECCO o cifrează (30 lei, cu actul normativ). Restul spun doar „inclusă”.
5. **Valabilitate:** toți spun că nu există termen legal. Cifrele practice diferă (30 de zile; 15 zile la unele licitații).

Cine lămurește aceste puncte cu surse oficiale citate are cel mai solid conținut din nișă.

### 4.5 Goluri (oportunități pentru noi)

1. **CUI + email pe primul ecran:** nimeni nu o face. Am obține lead pentru recuperare chiar dacă omul nu plătește, plus o comandă mai scurtă.
2. **Preț total cu TVA, afișat o singură dată:** piața e confuză („+ TVA”, „preț final”, 69 contra 99 pe același site). Un singur număr final, cu defalcarea taxă oficială / serviciu / TVA, e un avantaj clar. Ține de decizia 89 cu sau fără TVA (secțiunea 2.1).
3. **Onestitate despre program:** o promisiune de ~3 minute cu explicație clară pentru cazul în care ONRC e căzut sau închis (ce se întâmplă cu comanda, când primești documentul, ce refund primești). Doar ECCO și onrc.info.ro o fac parțial. Un status ONRC real (nu un text static „activ”) ar fi verificabil.
4. **„Cum citești certificatul”:** nimeni nu explică secțiunile documentului primit (starea firmei, mențiunile, indicatorii financiari, ce înseamnă o mențiune de insolvență sau de suspendare). E o intenție informațională rămasă fără răspuns.
5. **Recenzii reale, verificabile:** doar ECCO are o notă Google cu număr. Nimeni nu are AggregateRating, și e corect: fără recenzii reale nu se pune (regula noastră din content-and-seo).
6. **Persoana fizică (CNP):** doar constatator-online, constatator.ro, digigov și dianex oferă certificat pe persoană. E o nișă mică, dar clară (CNAS, IGI, verificarea funcțiilor unei persoane).
7. **Punct de lucru și PFA:** sunt tratate în ghiduri la instant și ECCO, dar numai constatator-online avertizează în formular că punctul de lucru se cere pe CUI-ul firmei-mamă. Validarea în formular e un câștig de UX.
8. **Ce NU conține certificatul** (datorii, bilanț complet, cazier fiscal), cu trimitere la documentul potrivit. Doar onrc.info.ro face asta. Pentru noi e și o punte firească spre cazierul fiscal.
9. **Verificarea autenticității pas cu pas** (InfoCert, cod de bare, Adobe), cu capturi. Toți o menționează, nimeni nu o arată concret.

### 4.6 Grupuri de intenție acoperite de H2 și FAQ

| Intenție | Cine o acoperă |
|---|---|
| Ce este / ce conține | instant, ECCO, onrc.info, digigov, dianex |
| Ce NU conține | onrc.info |
| Cât costă / tarif oficial | instant, ECCO, onrc.info, digigov, dianex, certificatconstatator |
| În cât timp / non-stop / weekend | toți |
| Valabilitate (30 / 15 zile) | instant, ECCO, onrc.info, digigov |
| Tipuri: de bază / extins / detaliat / scop | instant, ECCO, digigov, dianex, certificatconstatator |
| Furnizare informații (ce s-a întâmplat cu ea) | instant, certificatconstatator |
| Cu istoric / raport istoric | toți (ca produs); instant și ECCO (ghid) |
| Beneficiari reali (RBR), diferența față de certificat | instant, constatator.ro, digigov |
| PFA / II / IF | instant, ECCO, onrc.info, dianex |
| Punct de lucru / sedii secundare | instant, ECCO |
| Pentru licitație (SEAP/SICAP) | instant, ECCO, onrc.info, digigov |
| Pentru bancă / credit / leasing | instant, ECCO, onrc.info |
| Pentru fonduri IMM / europene / AFIR | instant, ECCO, onrc.info |
| Insolvență / lichidare | instant (ca variantă: mulți) |
| ANAF / TVA / ROI | instant |
| ARR / auto / înmatriculare | instant, ECCO |
| Persoană fizică (CNAS, IGI) | digigov, onrc.info (landing), dianex |
| Online vs direct ONRC (InfoCert, ghișeu) | ECCO, onrc.info, digigov, instant (ghid) |
| Original vs copie / semnătură electronică / tipărire | instant, onrc.info, ECCO, certificatconstatator |
| Verificarea autenticității | instant, certificatconstatator, digigov |
| Pentru altă firmă (date publice) | instant, ECCO, onrc.info, certificatconstatator, digigov |
| Ce fac dacă nu primesc / ONRC căzut | instant, onrc.info, certificatconstatator |
| Factură | certificatconstatator, onrc.info |
| Certificat gratuit / „extras ONRC” | ECCO |
| Cum citești certificatul | nimeni |

### 4.7 Tipare de evitat

- **Pagini pe județ și pe oraș:** instant (42 de județe) și digigov (42 de orașe) le au. Certificatul e același oriunde și se obține online indiferent de județ. Paginile ar diferi doar prin adresa oficiului, deci exact tiparul tăiat de update-ul de spam (regula 1 din `.claude/rules/content-and-seo.md`). Nu le copiem.
- **Versiuni în 9 limbi** (instant): fără cerere dovedită, e conținut subțire la scară.
- **Landing-uri pe variații de keyword** (onrc.info.ro: `-online`, `-onrc`, `/certificat-onrc/`): același risc.
- **Zid de logo-uri de mari companii fără dovadă**, testimoniale de grup marcate ca Review: intră sub regula „zero date inventate”.
- **„Oficial” lângă numele nostru, sigla ONRC, domeniu sau nume care sugerează instituția:** de evitat. Noi **obținem** documentul, ONRC îl **eliberează**.
