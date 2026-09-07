# Certificatul de celibat — research de piață pentru campania Meta (07.09.2026)

Raport de cercetare web pentru serviciul **eliberare certificat de celibat** (698 RON, ~15–30 zile
lucrătoare, obținut prin avocat colaborator, livrat pe email + curier).

**Notă de metodă.** Bugetul de WebSearch al sesiunii era epuizat (200/200) de la primul apel. Tot
research-ul e făcut prin Exa search, fetch direct pe surse oficiale, Brave/Yahoo ca motoare de
rezervă și — pentru Meta Ad Library și SERP-ul Google — **browser real (Playwright)**, singura cale
prin care Ad Library se poate citi (WebFetch/curl dau 403 sau shell JS gol).
Reddit e blocat tehnic din acest mediu (403 pe reddit.com, old.reddit, `.json`, mirrors, r.jina.ai) —
firele identificate sunt listate la final, necitate.
Unde n-am găsit sursă, scrie explicit **n-am găsit**. Nicio cifră din acest document nu e estimată
de mine; tot ce nu are link e marcat ca inferență.

---

## 0. Constatarea care schimbă poziționarea campaniei

**România NU eliberează „certificat de capacitate matrimonială" în formatul internațional pe care îl
cer autoritățile străine.** Nu e parte la Convenția CIEC nr. 20 (München, 5 septembrie 1980).

**Dovadă, două surse independente:**

- Lista părților contractante la Convenția nr. 20 —
  [ciec1.org](https://ciec1.org/en/convention/convention-no-20-on-the-issue-of-a-certificate-of-legal-capacity-to-marry/):
  Austria, Belgia (semnat, neratificat), Germania, Grecia, Italia, Luxemburg, Moldova, Olanda,
  Portugalia, Spania, Elveția, Turcia. **România lipsește complet din tabel.**
- Ambasada Germaniei la București, explicit: *„mehrsprachige Ehefähigkeitszeugnisse (nach dem
  **von Rumänien nicht ratifizierten** CIEC-Übereinkommen vom 05.09.1980)"* —
  [rumaenien.diplo.de](https://rumaenien.diplo.de/ro-de/service/2592466-2592466)

De aici derivă toată durerea pieței: primăria străină cere un document care nu există în forma
cerută, românul aduce altceva, i se respinge dosarul.

> ⚠️ **Atenție la o sursă falsă care circulă.**
> [contacthub.ro](https://www.contacthub.ro/cum-obtii-certificat-de-celibat-pentru-casatorie-in-strainatate/)
> afirmă că România emite un „Certificat de Capacitate Matrimonială [...] în conformitate cu
> Convenția de la Munchen (1980) [...] formular multilingv". **Este fals.** Nu prelua afirmația în
> copy — ar produce dosare respinse și reclamații.

**Ce eliberează efectiv România — trei documente diferite, des confundate:**

1. **Adeverința privind statutul civil / dovada de celibat** — model **Anexa 18** din normele
   metodologice 2024 (istoric și încă în vorbirea curentă: „Anexa 9", uneori „Anexa 8"). Se
   eliberează de starea civilă (primărie/SPCLEP) sau de misiunile diplomatice.
2. **Certificatul de cutumă / de legislație** — exclusiv consular, prin e-Consulat
   ([econsulat.ro](https://www.econsulat.ro/CertificatCutuma/DescriereServiciu/404000003)), taxă
   legală **30 EUR** (Legea 198/2007 privind taxele consulare).
3. **Nulla osta al matrimonio** — doar la consulatele din Italia, **gratuit**.

**Produsul nostru este (1).** Nu (2) și nu (3) — acelea sunt monopol consular.

---

## 1. Cine are nevoie, exact — pe țări

### Dimensiunea audienței

Date oficiale MAE, cetățeni români cu domiciliul/reședința în străinătate la finalul lui 2021
([diaspora.gov.ro, PDF](https://diaspora.gov.ro/images/content/resurse/Date_statistice_-_M.A.E._2021.pdf)):

| Țară | Cetățeni români |
|---|---|
| Italia | 1.137.728 |
| Spania | 1.087.923 |
| Marea Britanie | 949.810 |
| Germania | 826.154 |
| Belgia | 135.917 |
| Austria | 131.824 |
| Franța | 106.464 |

Total diaspora ~5,7 milioane. Cifră de control mai recentă pentru Spania: **1.136.518 permise de
ședere valabile** la finalul lui 2025, cea mai mare comunitate străină din țară
([StiriDiaspora, citând agenția spaniolă / EFE](https://www.stiridiaspora.ro/date-oficiale-cati-romani-se-afla-in-spania-e-cea-mai-mare-comunitate-straina-a-tarii_535122.html)).

### Ce cere fiecare țară

| Țară | Denumirea exactă cerută | Cine o cere | Emitent acceptat | Apostilă | Traducere | Valabilitate |
|---|---|---|---|---|---|---|
| **Italia** | ***nulla osta al matrimonio*** (art. 116 Codice Civile) — **NU** certificato di capacità matrimoniale | Ufficio Stato Civile al comunei | Consulatul român din Italia; se poate emite **pe baza atestatului de stare civilă din România** | Nu — România e pe lista de scutire de legalizare la Prefettura; dar **certificatul de naștere trebuie apostilat + tradus** | Da, în italiană | **6 luni** |
| **Spania** | *certificado de estado civil / fe de vida y estado / certificat de celibat* — **NU** certificado de capacidad matrimonial | Registro Civil (expediente matrimonial) | Consulatul român sau primăria din România | Nu, dacă e extras multilingv / formular UE 2016/1191 | Da, *traductor jurado* | **6 luni** |
| **Germania** | *Ehefähigkeitszeugnis* → imposibil → **Befreiung § 1309(2) BGB** de la OLG, pe baza *Ledigkeitsbescheinigung* **de la starea civilă a LOCULUI NAȘTERII** | Standesamt depune dosarul la Oberlandesgericht | Starea civilă din România (nu consulatul) + declarație pe propria răspundere | **Nu** — explicit *„Nicht erforderlich"* | Da, traducător autorizat în Germania | **6 luni** (§ 1309 BGB, și pentru zeugnis, și pentru Befreiung) |
| **Marea Britanie** | — **nu se cere** (CNI e doar pentru britanici) | Register office | — | — | Traducere în engleză pentru orice doc. străin | — (notice 28 zile; 70 fără status EUSS) |
| **Franța** | *certificat de coutume* **+** *certificat de célibat* — **două documente separate** | Mairie (dosar mariage / PACS) | Ambasada/Consulatul României; *célibat* și de la primăria de naștere | Nu (UE) | Da, *traducteur assermenté* | **< 6 luni** ambele |
| **Belgia** | *bewijs van ongehuwde staat / celibaatsattest* **+** *akte van gewoonterecht* | Ambtenaar van de burgerlijke stand | Consulatul român sau comuna | Nu (UE) | Da, *beëdigd vertaler* | „recent" — **n-am găsit termen numeric oficial** |
| **Austria** | *Ehefähigkeitszeugnis* | Standesamt | Ambasada/Consulatul României în Austria (nu există canal direct Standesamt→Standesamt; acordul acoperă doar DE/IT/CH) | Doar dacă nu e format internațional | Da, *Gerichtsdolmetscher* | **n-am găsit termen oficial** |

### Surse pe țară

**Italia.** PDF-ul oficial al Comune di Milano, „Documentazione Matrimonio in Italia per Cittadini
Stranieri" ([comune.milano.it](https://www.comune.milano.it/documents/20118/44162/DOCUMENTAZIONE+PUBBLICAZIONI++STRANIERI.pdf)):

> „**A.** il certificato di CAPACITA' MATRIMONIALE su modello plurilingue ai sensi della convenzione
> di Monaco [...] per i cittadini di Austria, Germania, Grecia, Lussemburgo, Moldova, Paesi Bassi,
> [...] Portogallo, Spagna, Svizzera e Turchia;
> **B. in tutti gli altri casi deve essere prodotto NULLA OSTA AL MATRIMONIO rilasciato
> dall'Autorità di Rappresentanza dello Stato di appartenenza in Italia (Consolato o Ambasciata) con
> firma legalizzata presso la Prefettura.** (sono esenti dalla legalizzazione della firma i seguenti
> Stati: Austria, Belgio, Bulgaria, [...] **Romania**, Russia, Spagna, Svezia, Svizzera, Ucraina,
> Turchia)"

Deci: **România nu e pe lista München → nulla osta**, dar **este** pe lista de scutire de legalizare
→ nulla osta de la consulatul român nu trebuie legalizat la Prefettura.

Valabilitate, aceeași sursă: *„il certificato di capacità matrimoniale e/o il nullaosta al matrimonio
**hanno validità di 6 mesi dalla data del rilascio** se non espressamente indicata validità diversa."*

Conținut obligatoriu: absența impedimentelor, nume, dată/loc naștere, cetățenie, rezidență, stare
civilă **și datele părinților** — *„Qualora nel certificato [...] non fossero indicate le generalità
dei genitori è necessario integrare alla documentazione l'atto di nascita."*

Femeie divorțată/văduvă: publicațiile nu se pot face decât după **300 de zile** de la divorț/deces,
altfel e nevoie de autorizarea Tribunalului (art. 116 c.2 + art. 89 c.c.) — Comune di Milano,
[Comune di Greve in Chianti](https://www.comune.greve-in-chianti.fi.it/servizi/anagrafe-e-stato-civile/matrimonio-di-cittadini-stranieri-italia).

Cadru legal general: [giustizia.it](https://www.giustizia.it/giustizia/page/it/coppie_di_nazionalita_diverse_matrimonio).

Partea românească — [Secția Consulară Roma](https://roma.mae.ro/node/472),
[CG Milano](https://milano.mae.ro/node/932), [CG Torino](http://torino.mae.ro/node/476) confirmă că
ele emit documentul, și că *„NULLA OSTA AL MATRIMONIO se poate elibera şi în baza unui atestat de
stare civilă emis de serviciul de stare civilă al primăriei de domiciliu din România (cu dată
recentă)"*.

> **N-am găsit** paginile comune.roma.it și comune.torino.it despre *matrimonio stranieri* (nu s-au
> lăsat fetch-uite). Acoperirea italiană se bazează pe Milano (PDF oficial) + Greve in Chianti,
> Montespertoli, Mandello del Lario, Sant'Ilario d'Enza, Besozzo — toate cu aceeași structură și
> toate listând România la scutirea de legalizare.

**Spania.** Fișa oficială a Registrului Civil Valencia (Generalitat Valenciana):
*„CERTIFICADO DE CAPACIDAD MATRIMONIAL para los ciudadanos de **Alemania, Austria, Grecia, Italia,
Luxemburgo, Moldavia, Países Bajos, Portugal, Suiza y Turquía**"* —
[cjusticia.gva.es, PDF](https://cjusticia.gva.es/documents/19318332/389447611/CAPACIDAD+MATRIMONIAL.pdf).
Românii nu sunt pe listă → li se cere dovada stării civile.
Aceeași fișă scutește de legalizare documentele *„PLURILINGÜES conforme al Convenio de Viena o [...]
conforme al Reglamento comunitario 2016/1191"*.

Valabilitate — regula generală în *expediente matrimonial*: *„Dicha documentación deberá presentarse
debidamente actualizada, dándose dicha circunstancia cuando las certificaciones u otro documento se
hayan expedido **dentro de los seis meses anteriores** a la fecha de presentación"* —
[BOE-A-2021-9326, Instrucción de 3 de junio de 2021, DGSJFP](https://www.boe.es/buscar/act.php?id=BOE-A-2021-9326).
Simetric, MAEC spaniol: *„Los extranjeros que necesiten un certificado de capacidad matrimonial deben
acudir a las autoridades del país de su nacionalidad"* —
[exteriores.gob.es](https://www.exteriores.gob.es/Consulados/francfort/es/ServiciosConsulares/Paginas/index.aspx?scca=Certificados&scco=Alemania&scd=144&scs=Certificado+de+capacidad+matrimonial).

Notă: consulatele românești din Spania (Madrid, Sevilla) **oficiază ele însele căsătorii** —
alternativă la Registro Civil, cu dosar complet diferit ([sevilla.mae.ro](https://sevilla.mae.ro/node/476)).

**Germania — cea mai clară și cea mai profitabilă.** Ambasada Germaniei la București:

> „Für eine Eheschließung in Deutschland wird unter anderem ein sogenanntes „Ehefähigkeitszeugnis"
> benötigt. [...] **Da das rumänische Recht die Ausstellung von Ehefähigkeitszeugnissen nicht
> vorsieht, können rumänische Staatsangehörige die „Befreiung von der Beibringung eines
> Ehefähigkeitszeugnisses" beantragen (§ 1309 Abs. 2 BGB). Dazu muss u.a. eine aktuelle rumänische
> Familienstandsbescheinigung („Adeverință de stare civilă") vorgelegt werden.**"
> — [rumaenien.diplo.de](https://rumaenien.diplo.de/ro-de/service/2012828-2012828)

Cererea **nu se depune de cetățean** — o preia Standesamt-ul și o trimite la președintele
Oberlandesgericht ([§ 1309 BGB](https://www.gesetze-im-internet.de/bgb/__1309.html),
[OLG Köln](https://www.olg-koeln.nrw.de/aufgaben/justizverwaltung/organisation_verwaltung/dez_7/ausl_ehesachen/index.php),
[OLG Stuttgart](https://oberlandesgericht-stuttgart.justiz-bw.de/pb/,Lde/Ehefaehigkeitsverfahren)).

Fișa de țară România (Länderverzeichnis, versiunea Sachsen, stand 08/2022; aceeași la Brandenburg,
stand 17.08.2022) cere de la un român:

> „a) [...] **Internationaler Auszug aus dem Personenstandsregister**;
> **Ledigkeits-/Familienstandsbescheinigung, ausgestellt vom Standesamt des Geburtsortes**;
> **Eigene eidesstattliche Erklärung** [...] abgegeben vor dem deutschen Standesbeamten oder einem
> rumänischen Notar.
> [...] **c) Legalisation / Apostille: Nicht erforderlich.**"
> — [justiz.sachsen.de, Rumänien.pdf](https://www.justiz.sachsen.de/olg/download/Ehefaehigkeit/Rumaenien.pdf)
> · [Länderverzeichnis Brandenburg](https://ordentliche-gerichtsbarkeit.brandenburg.de/ogb/de/oberlandesgericht/service-olg/auslaenderehesachen/befreiung-vom-auslaendischen-ehefaehigkeitszeugnis/laenderverzeichnis/)

> **N-am găsit** o pagină de Standesamt Berlin/München/Frankfurt care să numească explicit
> „Rumänien". Standesämter-ele trimit uniform la Länderverzeichnis-ul OLG (Hessen adoptă explicit
> lista OLG Köln). Fișele pe țară sunt sursa operativă reală.

**Marea Britanie — nu e piață pentru acest produs.** CNI e un document pe care UK îl *emite* pentru
proprii cetățeni, nu unul pe care îl cere de la străini.
[GOV.UK, documente la „giving notice"](https://www.gov.uk/marriages-civil-partnerships/documents-youll-need-to-give-notice)
nu listează niciun certificat de celibat din țara de origine.
[Brent Council](https://www.brent.gov.uk/births-deaths-marriages-nationality/marriages-civil-partnerships-and-ceremonies/give-notice-of-marriage-or-civil-partnership):
*„if requesting a Certificate of No Impediment (CONI) the notice appointment **can only be offered to
British Nationals**."*
Ce contează în UK e statutul EUSS: fără settled/pre-settled status, Home Office poate extinde
termenul de notice de la 28 la **70 de zile**
([gov.uk](https://www.gov.uk/marriages-civil-partnerships/give-notice)).

**Franța.** [Consulatul General Paris](https://cgparis.mae.ro/fr/node/548): *„**L'Ambassade délivre
généralement aux citoyens roumains souhaitant se marier ou conclure un PACS, un certificat de coutume
et une déclaration de célibat.**"*
Fișa de dosar a Ville de Strasbourg (2025) e cea mai precisă pe termene:

> „13. Le **certificat de célibat** délivré par le Pays d'origine, le Consulat ou l'Ambassade
> **datant de moins de 6 mois** [...] **Les attestations sur l'honneur ou d'après témoignage ne sont
> pas valables.**
> 14. Le **certificat de coutume** [...] délivré par le Consulat ou l'Ambassade du ressortissant,
> **datant de moins de 6 mois**"
> — [strasbourg.eu, dossier-mariage-2025.pdf](https://www.strasbourg.eu/documents/976405/1543848/dossier-mariage-2025.pdf)

Ambasada Franței la București confirmă că primăriile românești eliberează *„certificat de célibat
délivré par la mairie qui a enregistré la naissance"* —
[ro.diplomatie.gouv.fr, PDF](https://ro.diplomatie.gouv.fr/files/ro/files/Consulaire/mariage-entre-citoyens-francais-et-roumain.pdf).

*Distincție utilă pentru copy:* **certificat de coutume** = ce spune legea română despre condițiile
de căsătorie (vârstă, consimțământ, rudenie, publicații). **Certificat de célibat** = că persoana e
liberă să se căsătorească. Primăriile franceze le cer **separat**.

**Belgia.** Portalul federal [belgium.be](https://www.belgium.be/nl/familie/koppel/huwelijk/huwelijksformaliteiten)
cere *„een bewijs van ongehuwde staat"*. Broșura oficială IGVM/Unia: *„Dit bewijs wordt het
**'celibaatsattest'** genoemd. Je kan dit bekomen op het **consulaat van je land van herkomst**"* —
[igvm-iefh.belgium.be, PDF](https://igvm-iefh.belgium.be/sites/default/files/downloads/CGKR_intfamrecht-NL_def.pdf).
Al doilea document: *„**Akte van gewoonterecht (certificat de coutûme).** Alleen de partner met een
niet-Belgische nationaliteit moet dit document voorleggen"* +
*„Een attest van ongehuwde staat moet **recent** zijn"* —
[vreemdelingenrecht.be, Agentschap Integratie en Inburgering](https://www.vreemdelingenrecht.be/internationaal-personen-en-familierecht-ipr/huwen/huwen-belgie/hoe-sluit-je-een-huwelijk-af-belgie).
Belgia a semnat Convenția de la München în 1980 dar **nu a ratificat-o** (CIEC, coloana Ratification
= „/"), deci nici ea nu emite/cere certificate în format München.

> **N-am găsit** un termen de valabilitate numeric stipulat federal în Belgia. Textele spun doar
> „recent". Nu afirm 3 sau 6 luni.

**Austria.** *„**Staatsangehörige aus dem Ausland müssen für eine Heirat in Österreich ein
Ehefähigkeitszeugnis ihres jeweiligen Heimatstaats vorlegen.** Je nach Abkommen [...] wird das
Ehefähigkeitszeugnis direkt über das österreichische Standesamt eingeholt (**Deutschland, Italien,
Schweiz**). Andernfalls muss es über die zuständige Heimatbehörde bzw. **diplomatische
Vertretungsbehörde in Österreich** beantragt werden."* —
[oesterreich.gv.at](https://www.oesterreich.gv.at/de/lexicon/E/Seite.990048).
Pentru un român nu există canal direct → documentul vine de la ambasadă/consulat sau din România.
Documente pentru Viena: [digital.vienna.at, PDF](https://digital.vienna.at/bilder/specials/hochzeit/PDF/hochzeitsunterlagen.pdf) ·
[wien.gv.at](https://www.wien.gv.at/amtswege/eheschliessung-anmeldung).

> **N-am găsit** o pagină austriacă oficială care să spună explicit ce document românesc înlocuiește
> Ehefähigkeitszeugnis-ul (Austria nu publică un Länderverzeichnis ca Germania), nici un termen de
> valabilitate pentru documentul străin.

### Concluzia operațională a punctului 1

**Ordinea piețelor: Italia > Germania > Spania > Franța/Belgia > Austria. UK = ZERO cerere** pentru
acest produs (targetați UK doar pentru transcriere/cetățenie, nu pentru căsătorie).

Peste tot, documentul se cere de la **starea civilă a locului nașterii** — exact deplasarea pe care
un serviciu de intermediere o elimină. Germania o cere explicit
(*„ausgestellt vom Standesamt des Geburtsortes"*), Franța la fel
(*„la mairie qui a enregistré la naissance"*), iar Italia îl folosește ca bază pentru nulla osta.

> 🔴 **Decizie de business.** Pagina noastră spune că depunem cererea „în localitatea ta de
> domiciliu". Germania și Franța cer **locul nașterii**. Dacă depunem la domiciliu pentru un dosar
> german, riscăm respingerea la OLG. **De clarificat intern înainte de a scala campania pe DE/FR.**

---

## 2. Procedura oficială

### Temeiul legal al serviciului nostru (partea cea mai valoroasă și nefolosită)

Normele metodologice 2024 la Legea 119/1996 prevăd că SPCLEP:

> „eliberează, la cererea titularilor, a reprezentanților legali sau persoanelor împuternicite cu
> procură specială **ori împuternicire avocațială**, adeverință cu privire la statutul civil,
> potrivit modelului prevăzut în **anexa nr. 18**; adeverința în format electronic se semnează de
> emitent, se aplică sigiliul S.I.I.E.A.S.C. și se generează un cod de verificare care îi confirmă
> autenticitatea"
> — [Norma metodologică 2024, anexa 1](https://dgaspc5.ro/wp-content/uploads/2025/03/Norma-metodologica-2024-anexa-1.html)

Și, mai important, schimbarea din 2026:

> **Legea nr. 120/2026** (publicată în MO nr. 550 din 3 iulie 2026, **în vigoare 6 iulie 2026**) a
> modificat art. 59¹ din Legea 119/1996: cererile privind actele de stare civilă pot fi depuse
> **prin avocat împuternicit, în baza împuternicirii avocațiale**, *„fără a mai fi necesară
> întocmirea unei procuri autentice sau deplasarea în România"*.
> — [UNBR](https://unbr.ro/unbr-info-avocatii-pot-reprezenta-de-astazi-cetatenii-in-procedurile-privind-actele-de-stare-civila-inclusiv-pentru-transcrierea-actelor-emise-in-strainatate/)
> · analiză juridică: [Costaș, Negru & Asociații](https://costas-negru.ro/legea-nr-120-2026-mai-putin-formalism-pentru-reprezentarea-prin-avocati-in-materia-starii-civile/)

Costaș explică exact frecarea pe care o elimină legea: *„această formulare a condus adesea la
interpretarea potrivit căreia avocatul nu ar putea depune asemenea cereri doar în baza împuternicirii
avocațiale, fiind necesară și o procură notarială distinctă."*

**Asta e argumentul de campanie cu cel mai mare potențial neexploatat.** Majoritatea concurenților
încă cer clientului **procură notarială apostilată** — inclusiv cel care plătește reclamă (vezi
punctul 4). Noi putem spune, cu temei legal: *„Din iulie 2026, legea permite unui avocat să depună
cererea în locul tău. Fără procură la notar, fără apostilă pe procură, fără drum în România."*

> ⚠️ Nuanță de verificat juridic înainte de a o pune în copy: DJEP Hunedoara precizează că, pentru
> înscrierea de mențiuni, *„În cazul unei împuterniciri avocațiale, acesta are dreptul doar să depună
> cererea de înscriere a mențiunii, nu să și ridice certificatul de stare civilă"*
> ([evidentahunedoara.ro](https://evidentahunedoara.ro/stare-civila/inscrierea-de-mentiuni/)).
> Restricția e formulată pentru *certificate emise în urma mențiunilor*, nu pentru adeverința Anexa
> 18 — dar merită confirmată cu avocatul colaborator.

### Unde se depune și cât durează

| Cale | Ce obții | Cine emite | Termen oficial | Taxă |
|---|---|---|---|---|
| **Primărie / SPCLEP din România** (personal, prin procură specială sau prin **împuternicire avocațială**) | Adeverință privind statutul civil (Anexa 18) | Starea civilă care are actul de naștere, sau orice SPCLEP prin SIIEASC | **max. 30 de zile** ([Primăria Sector 5](https://sector5.ro/eliberarea-dovezii-de-celibat/)) | Taxe locale, stabilite prin hotărâre de consiliu local |
| **Consulat — nulla osta (Italia)** | Nulla osta al matrimonio | Consulatul român din Italia | Nespecificat pe pagină | **GRATUIT** — *„Serviciul este scutit de la plata taxelor consulare"* ([roma.mae.ro](https://roma.mae.ro/node/472)) |
| **Consulat — certificat de cutumă** | Certificat de cutumă / de legislație | Misiuni diplomatice, prin [e-Consulat](https://www.econsulat.ro/CertificatCutuma/DescriereServiciu/404000003) | Nespecificat | **30 EUR** (Legea 198/2007; +10 EUR regim de urgență) |
| **Consulat — Franța** | Certificat de coutume **+** déclaration de célibat | [CG Paris](https://cgparis.mae.ro/fr/node/548) | Programare obligatorie pe econsulat.ro | N-am găsit taxa publicată |

Acte cerute la starea civilă din România
([SPCEP Craiova](https://spcepcv.ro/stare-civla/diverse/adeverinta-de-celibat/)): act de identitate în
copie și original; procură specială autentificată (dacă se depune prin împuternicit) sau împuternicire
avocațială. Și un avertisment important: *„cererile transmise prin e-mail, sau prin postă nu pot fi
soluţionate favorabil"* — de aceea intermedierea fizică are valoare reală.

Acte cerute la consulat pentru nulla osta ([roma.mae.ro](https://roma.mae.ro/node/472)): pașaport sau
CI românească valabilă (original), certificat de naștere (original), copie act identitate partener,
pentru divorțați sentința de divorț definitivă și irevocabilă în original, pentru văduvi certificat de
căsătorie + certificat de deces.

### Apostilă: de ce în UE NU e nevoie

Două mecanisme suprapuse:

1. **Regulamentul (UE) 2016/1191**, aplicabil din 16 februarie 2019, scutește de legalizare și
   apostilă documentele oficiale privind, între altele, *„căsătoria, inclusiv capacitatea de căsătorie
   și starea civilă"*, când circulă între state membre
   ([EUR-Lex](https://eur-lex.europa.eu/legal-content/RO/TXT/HTML/?uri=OJ%3AC%3A2016%3A168%3AFULL) ·
   [DEPABD](https://depabd.mai.gov.ro/Regulament_1191_2016.html) ·
   [DJEP Hunedoara](https://evidentahunedoara.ro/legislatie-aplicabila/regulament-ue-20161191/)).
2. **Formularul standard multilingv** atașat documentului elimină și nevoia de traducere. Sursa
   oficială MAI:

   > „Cetăţenii români pot solicita eliberarea Formularelor standard multilingve, care însoţesc în mod
   > obligatoriu certificatele de stare civilă în original [...] Formularele standard multilingve pot
   > fi eliberate fie în acelaşi timp cu emiterea certificatului de stare civilă/**adeverinţa cu
   > privire la statutul civil** la care se ataşează, fie ulterior"
   > — [hub.mai.gov.ro, serviciu 103](https://hub.mai.gov.ro/serviciu/view?id=103)
   >
   > **Timp mediu: 5 zile lucrătoare. Timp maxim: 30 zile calendaristice. Taxă: GRATUIT.**

Confirmare germană independentă: fișa de țară România a OLG spune, pentru documentele românești,
*„Legalisation / Apostille: Nicht erforderlich"*.

> 🔴 **Decizie de business.** Pentru Italia, Spania, Germania, Franța, Belgia, Austria clientul
> **nu are nevoie** de add-on-ul nostru de apostilă (198 lei) și, dacă cere formularul multilingv,
> nici de traducerea legalizată (178,50 lei). Are nevoie de **formularul standard multilingv, care e
> gratuit de la stat**. A vinde apostilă pe un dosar UE e un risc reputațional direct (recenzie
> proastă când clientul află). Recomandare: **transformați „formular standard multilingv UE inclus"
> într-un diferențiator de campanie** și rezervați apostila pentru non-UE (SUA, UK, Turcia, Elveția,
> Canada etc.).

România **este** parte la Convenția CIEC nr. 16 (Viena, 8.09.1976) privind extrasele multilingve —
de aceea extrasul multilingv de naștere circulă fără formalități. Nu e parte la Convenția nr. 20
(München) — de aceea nu există certificat de capacitate matrimonială românesc.

---

## 3. Durerea reală — citate din forumuri și grupuri de diasporă

### 3.1. Nimeni nu știe cum se cheamă documentul. Nici juriștii, nici ambasadele.

Ambasadele se contrazic între ele — forum german, 07.12.2013:

> „Beim Standesamt weiss niemand, wie das auf rumänisch heisst. **Die deutsche Botschaft in Rumänien
> sagt, dass es „Certificat de cutuma" heisst. Die rumänische Botschaft in Deutschland wiederum sagt,
> dass es „Certificat de celibat" heisst und es kein „Certificat de cutuma" gibt.**"
> — user *Phantom*, [info4alien.de](https://www.info4alien.de/cgi-bin/forum/YaBB.cgi?num=1386404825)

Trei specialiști români, trei definiții diferite, în aceeași seară, la 9 minute distanță
([avocatnet.ro, 05.12.2011](https://www.avocatnet.ro/forum/discutie_253328/Casatorie-in-Germania.html)):

> „2. **Nu se elibereaza un astfel de act in Romania** (dupa cate stiu eu)."
> — *Elena Perianu, traducător autorizat*, ora 17:14
>
> „2. Certificatul se elibereaza la starea civila din orasul de domiciliu. [...] **se mai numeste si
> „Certificat de cutuma"**"
> — *Alexandru Munteanu, avocat*, ora 17:23
>
> „2. Certificatul de celibat la noi este **de fapt anexa 9**"
> — *Justitiarul71*, ora 21:46

Și, cu bilet de avion deja cumpărat (Turcia, 15.11.2023):

> „Ieri m-am trezit ca defapt am nevoie si de o Declaratie de Celibat si de un Certificat de Cutuma
> [...] **De fiecare data cand i-am intrebat pe cei de la primaria de care apartin, mi-au zis ca
> adeverinta de celibat este aceeasi cu certificatul de cutuma dar nu sunt una si acelasi lucru se
> pare.** [...] Am ajuns sa simt frustrari si stare de dezamagire cand vad ca una mi se zice si alta
> trebuie sa fac si ca trebuie sa aflu pe parcurs."
> — *RoxanaRRR*, [avocatnet.ro](https://www.avocatnet.ro/forum/discutie_824530/Urmeaza-sa-ma-casatoresc-in-Turcia-Autoritatila-din-Romania.html)

**Sunt patru nume în circulație pentru același lucru: certificat de celibat / certificat de cutumă /
Anexa 9 / Anexa 8** (+ Anexa 18, forma oficială actuală).

### 3.2. Documentul scos din România a fost RESPINS de autoritatea străină

Italia, 08.07.2014 — a mers fizic în țară, a parcurs tot lanțul, degeaba:

> „Am plecat o saptamana...bani cheltuiti ....in comuna in care m-am nascut mi s-a eliberat dovada de
> celibate, dupa aceea la prefectura pentru apostila pe original, la traducere, apoi la un alt notar
> public legalizat si in final la camera notarilor unde se aplica apostila de la haga! Am facut tot
> ce ni s-a spus in Romania....ne-am intors inapoi ne-am dus la primarie cu aceasta dovada de
> celibate [...] **si ne-a zis ca nu e bun..ca vor nulla osta al matrimonio...**"
>
> „cum se poate ca nulla osta eliberata de la ambasada sa fie ok si dovada de celibat eliberata din
> propria ta tara trecuta prin mainile tuturor sa nu fie buna? [...] Pe doamna care mi-a aplicat
> apostila de la haga am intrebat-o!!! Sunt bune aceste acte pt a ma casatorii in italia? mi-a
> raspuns da!!!!"
> — *alynaaa_2005*, [avocatnet.ro — „Nulla osta!"](https://www.avocatnet.ro/forum/discutie_435206/Nulla-osta.html)

Grecia, 29.11.2015 — respinsă pentru **o singură formulare lipsă**:

> „In lipsa acestei exprimări «se eliberează prezenta în vederea încheierii căsătoriei in
> străinătate» mi-a fost respinsa in Grecia adeverinta anexa9 apostilata etc.: Am înțeles că si in
> Italia nu este acceptată adeverinta anexa9. Vor ceva numit «nulla osta...» Solutia : cu 110 euro
> adeverinta bilingvă pentru casatorie la Consulat in baza adeverinței de stare civila din România."
> — *krisszz21*, [avocatnet.ro](https://www.avocatnet.ro/forum/discutie_513296/Certificat-de-celibat.html)

Belgia → Franța, 16.10.2023 — respinsă pentru **un cuvânt** din traducere:

> „J'ai eu juste un petit soucis avec mon certificat, car **le mot CELIBAT n'y figure pas
> directement** [...] Alors j'ai du demander a la traductrice d'écrire une info supplémentaire, car
> **mon dossier a été en halte**..."
> — [mariages.net](https://communaute.mariages.net/forum/mariage-civil-belge-qui-se-marie-en-france--t671176)

Germania — hârtia din țară nerecunoscută, drum dublu:

> „Iar o colega de-a mea care isi facuse in tara o cerere de celibat, **nu i-au recunoscut-o si a
> trebuit sa se duca si la consulat.** Asa ca intreaba din start de unde vor sa aiba declaratia de
> celibat. **Asta ca sa nu alergi de 2 ori.**"
> — [forum.desprecopii.com](https://forum.desprecopii.com/forum/topic-TOPIC_ID-31309-ARCHIVE-true-whichpage-3-nm-Casatorie-in-strainatate-si-schimbare-de-pasaport-pag-3.htm)

O cauză tehnică de respingere, explicată de un avocat: adeverința nu conține data nașterii, iar
*„autoritățile străine au refuzat luarea în considerare a adeverinței de stare civilă deoarece data
nașterii din pașaport nu coincidea cu cea din adeverința de stare civilă"*
([gabrieldragomir.ro](https://www.gabrieldragomir.ro/anexa-9-certificat-de-celibat-sau-adeverinta-de-stare-civila-documentul-care-confirma-starea-civila-actuala/)).

### 3.3. Programarea la consulat — nunta se amână

Cel mai proaspăt caz, 25.06.2026, româncă din Italia care se mărită pe 3 octombrie:

> „Ciao, scusami volevo chiederla com'è riuscita a prendere l'appuntamento all'ambasciata romena per
> nulla osta per matrimonio? **Sto cercando di fare in tutti modi ancora da maggio ma non riesco non
> mi da nessuna data disponibile** ho fatto la richiesta ma le date?! **Sono disperata perché dovrei
> sposarmi il 3 ottobre** 😭😭😭😭😭"
> — *Mihailina*, [community.matrimonio.com](https://community.matrimonio.com/forum/richiedere-nullaosta-al-matrimonio-per-cittadino-rumeno--t1126449)

Italia 2014 — programare fix în ziua nunții:

> „Am aflat ca pentru o programare la ambasada poti sa astepti si o luna de zile..."
> „...**mi-au facut programarea exact in ziua nuntii!!** adica trebuie sa anulez totul pentru ca
> actele din propria noastra tara nu sunt bune!!!"
> — [avocatnet.ro](https://www.avocatnet.ro/forum/discutie_435206/Nulla-osta.html)

Mireasă gravidă, invitații trimise, bilete de avion cumpărate, iar OLG-ul cere încă un act:

> „Pt. ca sunt gravida si nu vreau sa am o burta imensa la nunta, deci am fixat data pe 12.12. **Am
> facut si invitatiile iar familia mea a cumparat deja biletele de avion.** DAR ACUM AM O
> PROBLEMA!!!! Am primit o scrisoare de la Oberlandesgericht in care scrie ca le mai trebuie ceva....
> «Aktuelle Bescheinigung des rumänischen Geburtsstandesamtes für die Braut, dass im Geburtsregister
> keine Vermerke über eine Eheschließung [...] im Original mit Apostille und einer vollständigen
> Übersetzung in die deutsche Sprache.»
> Poate cineva sa ma ajute? **Ce inseamna asta? De unde obtin asa ceva?** [...] in max. 3-4 sapt.
> trebuie sa am Bescheinigung asta in mana...**altfel.....va trebui sa aman nunta...si toti
> invitatii....**"
> — *crista1976*, [forum.desprecopii.com](https://forum.desprecopii.com/forum/topic-TOPIC_ID-86988-ARCHIVE-true-nm-Acte-casatorie-in-GermaniaUrgent.htm)

Răspunsul comunității arată lanțul de 6 pași din Germania: *„procura o faci tu la un notar in
germania, si o trimiti persoanei din romania, care trebuie mai intai sa o traduca [...] si sa o
legalizeze. cu procura tradusa si legalizata, va merge la starea civila, de unde va ridica aceasta
Anexa 8, pe care ulterior o va depune la Prefectura [...] dupa apostilare, o va traduce [...] si apoi
traducerea va fi apostilata la Tribunalul sau Curtea de Apel [...] **stiu ca pare complicat**"*.

Belgia → Franța: *„on a eu la même réponse du consulat français en Belgique [...] avant de l'obtenir,
**il faudra patienter 8 semaines minimum**...."* —
[commentcamarche](https://droit-finances.commentcamarche.com/forum/affich-4030761-certificat-de-coutume).

UK → Cipru, 20.09.2022:

> „We have asked the embassy of Romania in London and waiting to see when they can book us an
> appointment. But still I'm not sure how long this paper will take. **I just I'm a bit worried if
> this takes more than 3 months.** I wanted to book the wedding on the 28th of December"
> — [justanswer.co.uk](https://www.justanswer.co.uk/european-law/k7o7j-partner-romanian-so-married.html)

### 3.4. Drumuri, zile de concediu, bani

> „They do give this piece of paper in Romania but **it's validity is for 30 days**. This gives us a
> very short frame of going to Romania, getting the paper and back to Cyprus to submit the papers.
> **Too much hassle and too many trips for no reason.**"
> — [justanswer.co.uk, 2022](https://www.justanswer.co.uk/european-law/k7o7j-partner-romanian-so-married.html)

> „getting the documents for everything was a huge hassle which took me **11 weeks almost 3 months**.
> my bf (Romanian) who doesn't work here, who **took 2 weeks of leave and then another 3 days of
> unpaid leave** just to do this marriage."
> — *cencendaya*, 28.10.2023, [expat.com](https://www.expat.com/en/forum/europe/romania/1048980-marriage-information-romania.html)

> „revin sa-ti zic ca daca tre' sa te prezinti in persoana, **mai bine te duci la paris, ai bilete de
> avion la 50€** primul pret la easy jet, ceea ce e mai ieftin ca trenul pina la marsilia."
> — *Chatonel*, [forum.desprecopii.com](https://forum.desprecopii.com/FORUM/topic-ARCHIVE-true-TOPIC_ID-48685-whichpage-11.htm)

### 3.5. Consulatul ca experiență

Scrisoare deschisă din Italia, 05.09.2016 — cea mai dură bucată găsită:

> „Activitatea în faţa consulatului începe la ora 5, 6 dimineaţa, odată cu primul cetăţean roman
> [...] Acesta se scrie pe o listă (foaie de hârtie) care este în faţa consulatului."
> „Toate aceste persoane stau pe trotuarul din faţa consulatului [...] **ne facem de râs cu toţii**
> [...] unde persoanele sunt obligate să aştepte afară, indiferent de timp, unii dintre ei având
> copiii foarte mici, poate chiar nou născuţi."
> „unde nu trebuie să stăm **ca animalele afară în canicula, ploaie, ger şi zăpadă**"
> — [Gazeta Românească Italia](https://www.gazetaromaneasca.com/observator/comunitate/la-consulatul-de-la-milano-se-fac-reguli-proprii-se-comporta-ca-stat-in-stat-in-loc-sa-respecte-directivele-mae/)

Londra, 26.06.2006 — lista de acte care crește pe parcurs, taxă necomunicată:

> „Deci in total 5 acte…ulterior aflam ca trebuie 7 acte."
> „…descopar cu uimire ca mai sunt adaugate **cu un oribil scris de mana** punctele: 6) act care sa
> ateste domiciliul din Romania si 7) copii pasapoarte martori."
> „Surpriza …….«150-200 lire, depinde de cat stabileste Consulul» …adica Dumnealui. **Deci taxa
> aceasta era secreta**"
> „D-l Consul le ia si mi le intinde inapoi adaugand «Nu, nuuuuu domnilor….va rog sa mi le asezati in
> ORDINE»"
> — *CryssUK*, [forum.desprecopii.com](https://forum.desprecopii.com/forum/topic-TOPIC_ID-79221-ARCHIVE-true-nm-Abuz-neprofesionalism-ilegalitate.htm)

Reguli diferite de la un consulat la altul, chiar în aceeași țară: *„Am întrebat la Oficiul Consular
din Milano şi ne-au răspuns foarte clar că **nu oficializează căsătorii** [...] Torino, Bologna, Roma
[...] cei de acolo oficializează căsătorii."* (Gazeta Românească, 2016; consulul a negat în drept la
replică).

Pontul de supraviețuire, repetat de mai mulți: *„de fata cu persoana de contact [...] notati-va tot
ce va spune ca va trebuie, dupa care ii cititi ce ati scris si o rugati sa confirme daca asta este
totul, o spun din proprie experienta, dupa ce am venit cu toate actele, mi-a mai cerut ceva...."*
([paginameadestart.ro](https://www.paginameadestart.ro/germania/conditii_de_viata_22.htm)).

### 3.6. Termenul de valabilitate — haos total

| Sursă | Termen |
|---|---|
| Diaspora, practica citată | **30 de zile** |
| [Consulatul General Bonn](https://bonn.mae.ro/node/427) | *„adeverința de stare civilă [...] **nu mai veche de 3 luni**, în original"* |
| Consilier pe [avocatnet.ro, 2010](https://www.avocatnet.ro/forum/discutie_160417/Valabilitate-certificat-de-celibat.html) | *„Adeverinta nu are un termen de valabilitate, **cred ca legiuitorul a omis acest lucru**, dar este de preferat [...] maxim de 3 luni"* |
| [avocatnet.ro, 04.02.2014](https://www.avocatnet.ro/forum/discutie_408955/Drepturi-privind-procurarea-certificatului-de-celibat.html) | *„valabila doar 3 luni de la eliberare"* |
| Germania (§ 1309 BGB; OLG Köln) | **6 luni** — *„Ledigkeitsbescheinigungen bzw. Familienstandsnachweise dürfen im Befreiungsverfahren nicht älter als sechs Monate [sein]"* ([OLG Köln, Allgemeiner Teil 08/2025](https://www.olg-koeln.nrw.de/aufgaben/justizverwaltung/organisation_verwaltung/dez_7/laender/allgemeiner-teil_august-2025.pdf)) |
| Italia (Comune di Milano), Franța (Strasbourg), Spania (BOE 2021) | **6 luni** |

Utilizatorul de rând nu are cum să știe care se aplică. Asta e o gaură de conținut și un
diferențiator instant pe landing page: **un tabel de valabilitate per țară**.

### 3.7. Divorțații și văduvii — dosar dublu

Consulatul Milano, în italiană: *„nel caso in cui il divorzio sia avvenuto in Italia, **è necessario
che le annotazioni di matrimonio e divorzio siano trascritte nel registro di stato civile in
Romania**"* ([milano.mae.ro](https://milano.mae.ro/it/node/674)). Dacă mențiunea nu e înscrisă în
România, **nu se poate elibera nimic**.

Iar adeverința unei persoane divorțate **nu scrie „necăsătorit"**, ci doar ce mențiuni figurează:

> „In adeverinta mea de celibat scrie ca pe marginea certificatului meu de nastere sunt urmatoarele
> mentiuni ....data la care am fost casatorita si data la care am divortat **si nu scrie ca in
> momentul de fata sunt necasatorita.**"
> — *RoxanaRRR*, 2023, [avocatnet.ro](https://www.avocatnet.ro/forum/discutie_824530/Urmeaza-sa-ma-casatoresc-in-Turcia-Autoritatila-din-Romania.html)

Segment mare, procedură mai scumpă, dispus să plătească mai mult. Merită **o campanie separată**.

### 3.8. Ce n-am putut acoperi

- **Reddit — blocat tehnic** (403 pe toate rutele). Fire identificate, **necitate**:
  [r/CasualRO — „Căsătorie în afara țării", feb. 2025](https://www.reddit.com/r/CasualRO/comments/1itrz4r/casatorie_in_afara_tarii/) ·
  [r/WomenRO — „Căsătorie în altă țară", sept. 2024](https://www.reddit.com/r/WomenRO/comments/1f9lknz/casatorie_in_alta_tara/) ·
  [r/dresden — Ehefähigkeitszeugnis, ~2,5 luni așteptare, apr. 2025](https://www.reddit.com/r/dresden/comments/1jz9n1j/).
  De redeschis dintr-un browser real.
- **TikTok / YouTube / comentarii Facebook** — inaccesibile (conținut gated).
- **Austria** — zero voci reale găsite.
- **Forum Softpedia** — nicio discuție relevantă indexată.

---

## 4. Competiția

### 4.1. Concurenți direcți

Prețuri citate de pe paginile publice, la 07.09.2026. Unde nu apare preț, scrie **preț neafișat**.

| # | Firmă | URL | Preț | Termen | Ce include | Mesaj-cheie |
|---|---|---|---|---|---|---|
| 1 | **cazierjudiciarfirma.ro** (SC Web Clerk SRL, CUI RO39710178, Iași; av. partener Cabinet Chende Ciprian-Dumitru, Baroul Sălaj) | [celibat-online](https://www.cazierjudiciarfirma.ro/celibat-online/) | **999 lei fix, „totul inclus"**; pachet internațional (apostilă + traducere + legalizare) **+500 lei**; curier internațional la tariful transportatorului | **„circa 5 zile lucrătoare"** de la semnarea împuternicirii | Redactare cerere + împuternicire, depunere dosar, taxe administrative, scan pe email, original prin curier în RO | „Certificat de Celibat Online, **obținut prin Avocat**" · preț fix afișat înainte de plată · valabil 6 luni · 5,0/5 din 165 recenzii. **Singurul care plătește reclamă** |
| 2 | **LaGhiseu.ro** | [link](https://laghiseu.ro/servicii-persoane-fizice/eliberare-certificat-de-celibat/) | **500 lei**; traducere +170 lei (+1 zi); apostilă Haga +180 lei (+1 zi); curier +30 lei | **10–20 zile lucrătoare** | 100% online, contract digital + upload act identitate + selfie, reprezentare prin avocat, livrare curier sau electronic | „100% Online, de oriunde din lume" · fără costuri ascunse · **garanție banii înapoi dacă documentul nu se obține** |
| 3 | **GhiseuRapid** (cazierrapid.ro / certificatrapid.ro) | [link](https://cazierrapid.ro/anexa9-adeverinta-de-celibat) | **650 lei**; livrare RO 30 / străinătate **60**; traducere EN/IT/FR 150–170; legalizare 70; **apostilă Haga 150**; extras multilingv 500 | Neafișat pe pagină; recenzii: „până la 20 de zile" estimat, unii sub 48h | Nu detaliază incluziunile; sistem de împuternicire (nu se precizează avocat) | „Obține adeverința de celibat simplu și rapid, online!" · social proof pe recenzii; av. Ancuța Ardelean menționată în recenzii |
| 4 | **Centrul de Vize și Legalizări T&B** | [centruldevize.ro](https://centruldevize.ro/Obtinere-certificat-celibat) | **Preț neafișat** — ofertă personalizată; facturare LEI (RO) sau EUR (străinătate) | **Neafișat** — „depinde de localitatea în care a fost înregistrată nașterea"; „termenele comunicate sunt estimative" | Intermediere + opțional traduceri, legalizare/apostilă, curier | **„Plata NU se face anticipat, ci după demararea procedurilor!"** · consultanță gratuită. **Poziția #1 organic** pe majoritatea head-terms |
| 5 | **Av. Gabriel Dragomir** | [link](https://www.gabrieldragomir.ro/certificat-de-celibat-online/) | **de la 250 EUR** (~1.270 lei), ofertă personalizată | Termen legal 30 zile; „de regulă o săptămână, 10 zile" | Obținere + opțional apostilare/supralegalizare. **Prin împuternicire avocațială**, invocă art. 10 Legea 119/1996 | „Certificat de Celibat Online **prin avocat**" · **„Aprobat de Baroul București"** · **„Plată doar la finalizare"** · conținut juridic foarte bun |
| 6 | **Inter Lexis** | [link](https://www.inter-lexis.ro/ro/certificat-de-celibat-din-rom-nia/56.html) | **Preț neafișat** | „în cel mai scurt timp posibil" | Certificat + opțional apostilă/supralegalizare/traducere; curier intern și internațional; prin procură | „Procedură 100% la distanță" (email/WhatsApp) |
| 7 | **IB Legal Family** (CA Ioana Bărbulescu, Baroul București) | [link](https://ib-legalfamily.com/services/certificat-de-celibat/) | **Preț neafișat** | **Neafișat** | Pagină pur informativ-juridică | Slabă comercial |
| 8 | **Sprachen Express** (birou traduceri, Germania) | [link](https://sprachen-express.de/ro/procura-certificat-celibat/) | **Preț neafișat** | **Neafișat** | Redactarea procurii, programare la notar, info apostilă, traduceri | **„Acte fără drum acasă"** — articol SEO 2026 targetat pe diaspora din DE |
| 9 | **Traduzioni-Servizi** (Milano) | [link](https://traduzioni-servizi.eu/certificat-de-celibat/) | Preț neafișat | — | Traduceri + certificat pentru românii din Italia | Nișă geografică Italia |
| 10 | Cluster Moldova: documentexpert.md (2100 MDL), expertconsulting.md, acte-moldova.com, emigrare.md | — | Neafișate (excepție documentexpert.md) | — | „Asistență în obținerea certificatului de celibat în România" | Rankează pe termeni RO, targetare MD — nu concurenți pe diaspora vestică |

Alți jucători care listează celibatul ca serviciu, fără preț:
[Academia de Traduceri](https://academiadetraduceri.ro/servicii-pentru-romanii-din-strainatate/),
[Traduceri Constanța](https://traduceri-constanta.ro/index.php/servicii-pentru-romanii-din-strainatate/),
[Cabinet Av. Stanciu Luciana](https://avocatstanciu-valcea.ro/servicii_diaspora_ro.php),
[apostille.expert](https://apostille.expert/ro/comandarea-documentelor-fara-deplasare/) — toate cer
**procură notarială apostilată**.

### 4.2. Poziționarea noastră în bandă

| | LaGhiseu | GhiseuRapid | **eGhișeul** | cazierjudiciarfirma |
|---|---|---|---|---|
| Preț | 500 lei | 650 lei | **698 lei** | 999 lei |
| Termen afișat | 10–20 zile lucr. | ~20 zile (recenzii) | **15–30 zile lucr.** | „circa 5 zile lucr." |
| Apostilă | +180 | +150 | **+198** | inclus în pachet +500 |
| Traducere | +170 | +150–170 | **+178,50** | inclus în pachet +500 |
| Curier internațional | +30 | +60 | (variabil) | la tarif transportator |
| Plata | în avans | în avans | **în avans** | în avans |
| Garanție | **banii înapoi** | — | — | preț fix |

**Suntem la mijlocul benzii de preț, dar ultimii pe termenul afișat.** Add-on-ul de apostilă (198 lei)
e peste toată piața de apostilare pură: [apostile.ro](https://apostile.ro/apostila-haga/) cere **100
lei / 24h**, 150 lei urgent (4–6h); [documentexpert.ro](https://www.documentexpert.ro/tarife.html)
100 lei Prefectura București, 125 lei Camera Notarilor.

### 4.3. „Certificat de cutumă" — zero competiție comercială

Căutările pe `"certificat de cutuma" obtinere pret avocat` returnează **exclusiv** surse oficiale și
informaționale: econsulat.ro (MAE), varsovia.mae.ro, toateactele.ro, avocatnet. **Niciun rezultat
comercial, niciun anunț plătit.** Explicația: certificatul de cutumă se eliberează de consulate, iar
nulla osta e gratuit — nu există marjă de intermediere. Ca termen, e **nișă de conținut, nu de
vânzare**.

### 4.4. Firme de apostilare — celibatul NU e ofertat ca add-on

| Firmă | Prețuri afișate | Are celibat? |
|---|---|---|
| [apostile.ro](https://apostile.ro/apostila-haga/) | Apostilă **100 lei / 24h**, urgent (4–6h) **150 lei**, 5+ documente 90 lei/buc, curier București 25 / național 35 | **NU** |
| [documentexpert.ro](https://www.documentexpert.ro/tarife.html) | Apostilă Prefectura București 100, alte județe 150, Tribunal București 100, Camera Notarilor 125; supralegalizare MAE 150; traduceri 35–300; legalizare notarială 60/ex. | **NU** (doar „transcriere acte stare civilă") |
| [diasporafix.ro](https://diasporafix.ro/apostile-traduceri/) | **Preț neafișat** (contact WhatsApp) | NU explicit — „pe bază de procură", acte de stare civilă generic |
| [babylonconsult.ro](https://babylonconsult.ro/) | **Preț neafișat** | **NU** |
| codess.ro, academiadetraduceri.ro, traducerisupralegalizari.ro | Liste de tarife traduceri/apostilare | Neverificat în detaliu; profil de birou de traduceri |

### 4.5. Reclame — verificat prin browser real, nu presupus

#### Meta Ad Library: ZERO reclame în nișă

Ad Library **nu se poate citi** prin WebFetch/curl (403 / SPA JS-only). Rezultatele de mai jos sunt
extrase din DOM cu browser real, `country=RO`:

| Interogare | Rezultate | Concluzie |
|---|---|---|
| `certificat de celibat`, toate | ~14 | **Toate irelevante** — reclame franceze la romane/ebooks (BoldReads, Fractured Flame Romance, MyReads, NovelVibes, Satin Souls) care conțin întâmplător „mariage/certificat", + una religioasă. **Zero firme de acte** |
| `adeverinta de celibat`, toate | 0 | „No ads match your search criteria" |
| `certificat de cutuma`, toate | 1 | Reclamă politică (Radu Pescar, consilier local, feb. 2024). Zero comercial |
| `celibat`, doar active | 3 | Croazieră pentru celibatari + ficțiune. Zero comercial |
| `acte stare civila strainatate`, active | 0 | Zero |
| `nulla osta`, toate | ~270 | Zgomot — reclame italiene la drame scurte și provini de calcio targetate pe RO. Niciun serviciu de acte |
| `Centrul de Vize`, toate | 8 | **T&B a rulat reclamă pe Meta** (procură auto Turcia, 29 mai 2024 – 28 oct. 2025) → au cont și infrastructură de ads, dar **n-au atins niciodată celibatul** |

Link de referință:
[Meta Ad Library, RO, „certificat de celibat"](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=RO&q=certificat%20de%20celibat&search_type=keyword_unordered)

**Meta e teren complet gol în nișa asta.** Nu e o piață saturată — e una pe care aproape nimeni nu o
cumpără.

#### Google Ads: un singur advertiser

Vezi secțiunea dedicată **„Anexă: dovada pentru plângerea către Google"** de la finalul documentului.

### 4.6. SERP-ul e dominat de instituții și de conținut gratuit

Pe head-terms, 5–7 din primele 10 rezultate sunt necomerciale: econsulat.ro (MAE), hub.mai.gov.ro,
primării (sector5.ro, primariasm.ro, servicii.primariatm.ro, spcepcv.ro, e-administratie.sibiu.ro),
forumuri (avocatnet.ro, notari.pro) și **[toateactele.ro](https://toateactele.ro/proceduri/certificat-celibat-cutuma)**
— un site independent care scrie negru pe alb *„Eliberarea documentului: GRATUITĂ — la toate
consulatele"*.

Asta e **cea mai mare frână de conversie din nișă**. Vezi tratarea ei la punctul 7.

---

## 5. Volumul căutărilor

> ⚠️ **N-am avut acces la niciun tool de volum.** DataForSEO nu e configurat în sesiune, Google Trends
> nu e fetchabil fără token. **Nu dau cifre de volum — nu le am.** Ce urmează sunt sugestiile reale
> din Google Autocomplete (API `suggestqueries.google.com`), care arată forma și geografia cererii,
> nu mărimea ei.

**Română, `hl=ro&gl=ro` — „certificat de celibat":**
`online` · `romania` · `celibatar` · **`valabilitate`** · **`ambasada romaniei`** · **`apostilat`** ·
**`de unde se elibereaza`** · **`multilingv`** · **`pret`**

**„certificat de cutuma":**
`pentru casatorie` · `model` · `pentru succesiune` · `romania` · `ce este` · `moldova` ·
**`cine elibereaza`** · `in engleza` · **`italia`**

**„adeverinta de celibat":**
**`anexa 9`** · `model` · `online` · `ce inseamna` · **`valabilitate`** · **`iasi`** · **`cluj`** ·
`romania` · **`sector 6`**

**„acte necesare casatorie in strainatate":** doar 2 sugestii —
`acte necesare casatorie cetatean roman cu domiciliul in strainatate`

**Italiană, `gl=it` — „nulla osta matrimonio rumeno":**
`italiano` · **`consolato rumeno torino`** · **`consolato rumeno milano`** · `consolato rumeno` ·
**`consolato rumeno trieste`** · **`va legalizzato`** · `cittadino rumeno` ·
**`consolato rumeno bologna`**

**Română, dar căutat din Italia (`hl=ro&gl=it`) — „certificat celibat":**
`online` · **`france`** · **`portugal`** · **`italie`** · `acte necesare` · **`consulat`**

**Germană, `gl=de` — „Ehefähigkeitszeugnis Rumänien":** doar 3 sugestii —
`beantragen`, **`befreiung ehefähigkeitszeugnis rumänien`**

**Spaniolă, `gl=es` — „certificado de capacidad matrimonial rumano":** o singură sugestie, fără
variante.

### Cum se citește asta

- Cererea e concentrată în **RO** și **IT**. Autocomplete-ul italian e dominat de
  **„consolato rumeno + oraș"** (Torino, Milano, Trieste, Bologna) → **gâtul de sticlă perceput e
  consulatul, nu documentul.** Exact ce confirmă și citatele de la punctul 3.
- **Germania e mică ca volum, dar cu intenția cea mai calificată** din tot setul: `befreiung` e un
  termen pe care îl caută doar cine e deja în procedura § 1309 BGB și știe că are o problemă.
- **Spania: aproape inexistent în spaniolă** — românii din Spania caută în română, nu în spaniolă.
  Nu construiți campanie pe termeni spanioli.
- Sugestii recurente care sunt, de fapt, **întrebări nerezolvate de nimeni**: `valabilitate`,
  `de unde se elibereaza`, `cine elibereaza`, `multilingv`, `apostilat`. Fiecare e o secțiune de
  landing page și un unghi de creative.

**Set de cuvinte pentru targetare și copy:** certificat de celibat · adeverință de celibat · anexa 9 ·
adeverință de stare civilă · certificat de cutumă · nulla osta consolato rumeno ·
Ehefähigkeitszeugnis Rumänien / Befreiung · certificat de célibat roumain · certificado de soltería
rumano · celibaatsattest Roemenië.

---

## 6. Sezonalitate

### Italia — piața nr. 1

ISTAT, „Matrimoni, unioni civili, separazioni e divorzi — Anno 2024", citat exact din PDF:

> „In generale, circa **otto matrimoni e otto unioni civili su 10 avvengono nel periodo che va da
> aprile a ottobre** (nel caso dei matrimoni religiosi più di nove su 10). Si osservano poi, in
> particolare, **due picchi** legati anche alla mitezza del clima: **uno a giugno e l'altro a
> settembre**."
> — [istat.it, PDF](https://www.istat.it/wp-content/uploads/2026/01/MATRIMONI-UNIONI-SEPARAZIONI-DIVORZI_anno-2024.pdf),
> secțiunea „Sabato il giorno preferito per nozze e unioni"

Context: 173.272 căsătorii în Italia în 2024, **61,3% civile** (față de 43,1% în 2014 — trend
crescător, deci mai multe dosare la comune).

### România — pentru diaspora care se întoarce în țară

- INS 2022: din 114.207 căsătorii, **cele mai multe în august (20.629)**, cele mai puține în noiembrie
  (4.097) — [Antena3, citând INS](https://www.antena3.ro/actualitate/inedit/ins-la-ce-varsta-se-casatoresc-romancele-august-luna-cele-mai-multe-nunti-667854.html)
- INS august 2024: **17.164 căsătorii, +30,8% față de iulie 2024**. În perioada ian. 2023 – aug. 2024,
  maximul a fost august 2023 (17.414), minimul ianuarie 2024 (3.700) —
  [Click, citând INS](https://click.ro/actualitate/national/in-romania-se-moare-mult-si-se-nasc-copii-putini-2393763.html)
- Studiu pe date INS 2010–2013: august = **de 2,3 ori media lunară** națională; iulie +74,4%;
  septembrie +69,1%. Cauza explicită, în text: *„August is the peak month of holidays, which increases
  the number of marriages, especially if we take into account the **young people left to work abroad,
  not few, who prefer to return to the country in the month of leave and to celebrate their
  marriage**"* — [Harja, 2014](https://doi.org/10.29358/sceco.v0i19.251)

### Cu cât înainte strâng actele — calcul, nu speculație

Trei constrângeri care se suprapun:

1. Documentul e valabil **6 luni** în majoritatea țărilor, dar **max. 3 luni** la Consulatul Bonn și
   în practica spaniolă.
2. În Germania, dosarul OLG durează, oficial:
   **3–6 săptămâni** ([OLG Oldenburg](https://oberlandesgericht-oldenburg.niedersachsen.de/startseite/service/verwaltungsverfahren_in_eheangelegenheiten/befreiung-von-der-beibringung-des-ehefaehigkeitszeugnisses-128632.html)),
   **3–8 săptămâni** ([OLG Celle](https://oberlandesgericht-celle.niedersachsen.de/startseite/service/ehefahigkeitsverfahren/allgemeine-hinweise-zum-verfahren-auf-befreiung-von-der-beibringung-des-ehefahigkeitszeugnisses-nach-1309-bgb-245573.html)),
   **2–3 luni** ([OLG Dresden](https://www.justiz.sachsen.de/olg/download/Leitfaden_Ehefaehigkeit.pdf)).
   Taxă **15–305 €** (Nr. 1330 JVKostG), calculată pe venitul net al solicitantului.
   Iar actul românesc **nu poate fi mai vechi de 6 luni** la depunere (OLG Köln).
3. Termenul nostru: **15–30 zile lucrătoare**.

**→ Fereastra de cumpărare: cu 2–5 luni înainte de nuntă.**

### Calendar de campanie

| Perioadă | Ce se întâmplă | Ce facem |
|---|---|---|
| **Ianuarie–martie** | Logodne de sărbători + planificare pentru nunțile de vară | **Buget principal.** Mesaj educativ: „ce document îți cere primăria din [țară]" |
| **Aprilie–iunie** | Dosare pentru vârful italian din septembrie și pentru august în RO | **Buget maxim + urgență reală.** „Actul e valabil 6 luni și durează ~30 de zile — dacă nunta e în septembrie, acum e momentul" |
| **Iulie–august** | Nunțile se întâmplă; cererea de acte scade | Buget redus, doar retargeting |
| **Septembrie–octombrie** | Al doilea vârf italian; începe planificarea pentru anul următor | Buget mediu |
| **Noiembrie–decembrie** | Cel mai slab (RO: 4.097 nunți în noiembrie) | Minim. **Excepție: sezonul cererilor în căsătorie de sărbători** → audiență „recently engaged", cu mesaj de planificare, nu de urgență |

Targetare Meta relevantă: „recently engaged (1 year)", interese nuntă/wedding planner, expați români
în IT / DE / ES / FR / BE / AT. **Nu targetați UK** pentru acest produs.

---

## 7. Obiecții și temeri la 698 lei

| Obiecția | De ce apare | Ce o dezamorsează |
|---|---|---|
| **„La consulat e gratis"** | Adevărat și documentat: nulla osta e 0 € ([roma.mae.ro](https://roma.mae.ro/node/472)), iar [toateactele.ro](https://toateactele.ro/proceduri/certificat-celibat-cutuma) rankează organic cu *„Eliberarea documentului: GRATUITĂ — la toate consulatele"* | **Nu contraziceți. Mutați discuția pe programare.** Citat real, iunie 2026: *„încerc în toate felurile din mai și nu-mi dă nicio dată disponibilă [...] trebuie să mă mărit pe 3 octombrie"*. Plus argumentul structural: consulatul emite nulla osta **pe baza** atestatului de stare civilă din România — pe care noi îl aducem. Cele două nu concurează, se completează. Formularea: *„Documentul de la consulat e gratuit. Programarea nu e — se plătește în luni de așteptare."* |
| **„E o țeapă, plătesc și nu primesc nimic"** | Frica standard la plata online din diaspora | 4,9/5 din **457 recenzii Google**; [ScamAdviser: „very likely not a scam but legit and reliable"](https://www.scamadviser.com/ro/verifica-un-website/eghiseul.ro); contract de asistență juridică cu avocat înscris în Barou; factură; **testimonial existent, perfect pentru acest produs**: *„Am avut nevoie urgentă de un certificat de celibat în Olanda. Am fost foarte plăcut surprinsă de profesionalism, comunicare și rapiditate."* |
| **„Cer bani în avans"** | Politica noastră (anulare doar 30 min, rambursare 70% — [contract](https://eghiseul.ro/wp-content/uploads/2025/04/Contract-Prestari-Servicii-SITEV4_compressed.pdf)). **Doi concurenți folosesc opusul ca armă**: T&B — *„Plata NU se face anticipat"*; av. Dragomir — *„Plată doar la finalizare"*; LaGhiseu — *garanție banii înapoi* | Cea mai dură obiecție și singura fără răspuns azi. Fie introducem o **garanție „banii înapoi dacă nu obținem documentul"** (LaGhiseu o are deja), fie rămâne dezavantaj structural. **Decizie de business, nu de copy.** |
| **„Sunteți mai scumpi (500 / 650 lei la alții)"** | Real | Nu concurați pe preț. Diferențiați pe **ce document exact cere țara lor**. Concurenții vând „certificat de celibat"; noi putem vinde **„dosarul corect pentru primăria din Milano / pentru Standesamt"**. Asta e valoarea, nu hârtia. |
| **„Durați 15–30 de zile, alții 5"** | Real ca afișare | Vezi analiza de credibilitate de mai jos — termenul lor de 5 zile **nu include** obținerea procurii notariale. Comunicați **termenul end-to-end**, nu termenul de la ghișeu. |
| **„Îmi trebuie oricum procură la notar — de ce vă plătesc?"** | Așa lucrează majoritatea concurenților, inclusiv cel care plătește reclamă | **Legea 120/2026**: împuternicire avocațială, fără procură notarială, fără apostilă pe procură, fără drum la notar sau consulat. **Cel mai tare argument din piață și nefolosit de nimeni.** |
| **„Și dacă documentul e respins de primăria din Italia/Germania?"** | Frica nr. 1, documentată continuu din 2006 până în 2026 | Promisiune de conformitate pe țară + **formular standard multilingv UE** + refacere gratuită dacă e respins pentru formă. |
| **„Sunt divorțat(ă) — se poate?"** | Segment mare; dacă mențiunea de divorț din străinătate nu e înscrisă în România, **nimic nu se poate elibera** | Campanie și pagină separate. Pachet mai scump (înscriere mențiune + adeverință). Dispoziție mare de plată. |
| **„Cât e valabil? Nu-l scot degeaba prea devreme?"** | Sugestie top-5 în Autocomplete; întrebare deschisă din 2010 | **Tabel de valabilitate per țară pe landing page.** Diferențiator instant, zero cost. |
| **„Plătesc apostilă și aflu că nu-mi trebuia"** | Reg. UE 2016/1191 + formular multilingv gratuit fac apostila inutilă în UE | Nu vindeți apostilă pentru dosare UE. Transformați formularul multilingv gratuit în argument de onestitate. |

---

## Anexă: dovada pentru plângerea către Google (tratament inegal)

Coordonatorul a cerut explicit textul complet al anunțului și linkul din Ads Transparency Center.
Iată ce am și ce **nu** am.

### Ce am confirmat direct

**Advertiser:** cazierjudiciarfirma.ro — SC Web Clerk SRL, CUI RO39710178, Iași.
Avocat partener declarat pe site: **Cabinet Avocat Chende Ciprian-Dumitru, Baroul Sălaj**.

**Landing page:** `https://www.cazierjudiciarfirma.ro/celibat-online/`

**Anunțul**, capturat din SERP prin browser real, prezent **top + bottom** pe fiecare din
interogările: `certificat de celibat`, `certificat de celibat online`,
`obtinere certificat de celibat online pret`, `adeverinta de celibat online urgent firma`,
`certificat de celibat pentru casatorie in strainatate online`.

Titluri rotite:
- „999 Lei, Totul Inclus – Comanzi Online în 3 Minute – Valabil 6 Luni"
- „999 Lei, Totul Inclus | Scan pe Email + Curier"
- „999 Lei, Totul Inclus | Oriunde Te Afli în Lume"

Descriere: *„999 lei totul inclus, afișat înainte de plată. Opțional apostilă și traducere
autorizată."*

Callout-uri: `Curier Internațional` · `Preț Fix 999 Lei` · `Scan pe Email` · `Totul Inclus` ·
`Răspuns pe WhatsApp`

Structured snippet (Services): `Certificat de celibat, Apostilă Haga, Traducere autorizată,
Legalizare notarială`

Sitelink-uri:
- **Cazier Auto** — 149 lei, totul inclus, pentru Uber/Bolt/Glovo
- **Cazier Judiciar Firmă** — pentru SRL, SA, PFA, 249 lei, prin avocat
- **Comandă Online** — formular direct pe pagină, buletin + certificat naștere

Extensie de apel activă („Apelează-ne").

Zero anunțuri pe `certificat de cutuma` și pe `apostila haga acte romania diaspora servicii pret`.

### Ce NU am

> 🔴 **N-am obținut un link din Google Ads Transparency Center** către advertiserul
> cazierjudiciarfirma.ro / SC Web Clerk SRL. `adstransparency.google.com` e SPA JS-only și nu s-a
> lăsat citit din acest mediu; nu am un URL de forma `/advertiser/AR...`.
> **Nu îl inventez.** Pentru plângere, el trebuie obținut manual: căutare după domeniu pe
> [adstransparency.google.com](https://adstransparency.google.com/?region=RO), apoi salvat URL-ul
> advertiserului + screenshot cu perioada de rulare și statutul de verificare.

De asemenea, textele de mai sus provin dintr-o **captură de SERP**, nu dintr-o sursă oficială Google.
Pentru un dosar de plângere, ele trebuie **refăcute cu screenshot datat** (SERP + Ads Transparency),
altfel nu au valoare probatorie.

### De ce contează pentru plângere

Un intermediar românesc de acte, care vinde **exact aceeași categorie de document de stat** ca noi,
rulează reclamă Google aprobată, cu:
- prețul în headline,
- unghiul **„obținut prin Avocat"** în H1 și în sitelink,
- sitelink-uri către alte documente de stat (cazier judiciar, cazier auto),

adică fix combinația pentru care noi am fost blocați pe categoria „Documente guvernamentale și
servicii oficiale" (vezi `docs/ads/` și memoria `google-ads-escaladare-tratament-egal`,
tichet 1-6533000041865). Aceasta e o dovadă de aplicare inegală a aceleiași politici, pe aceeași
piață, pe aceleași interogări.

### Despre termenul lui de „5 zile" — e credibil?

**Sursa:** pagina lui publică, citat exact: **„circa 5 zile lucrătoare"** — dar formularea completă
este *de la semnarea împuternicirii*, iar mecanismul de reprezentare declarat pe aceeași pagină este:

> „o redactăm noi — **o semnezi la notar sau la consulat**"

Adică **procură notarială**, nu împuternicire avocațială. Pentru un client din diaspora, ceasul lui
de 5 zile **pornește abia după** ce clientul: (a) prinde programare la notar local sau la consulat,
(b) semnează, (c) eventual apostilează procura, (d) o trimite în România. Programarea la consulat e
exact durerea documentată la punctul 3 (luni de zile).

**Concluzie: „5 zile lucrătoare" este real ca termen de procesare internă, dar nu este un termen
end-to-end comparabil cu al nostru.** Noi afișăm termenul total; el afișează doar segmentul de după
procură. Comparația directă 5 vs. 15–30 e înșelătoare în defavoarea noastră.

> **Recomandare de business:** comunicați explicit **„fără procură la notar — semnezi online"**
> (temei: Legea 120/2026) și afișați termenul ca **„~30 de zile, din care 0 zile de așteptat la
> notar sau consulat"**. Asta neutralizează simultan avantajul lui de termen și pe cel de preț.
> Separat, merită verificat operațional dacă termenul nostru real justifică „15–30 zile lucrătoare"
> sau poate fi strâns — e singurul indicator la care suntem ultimii în piață.

---

## Trei decizii de luat înainte de a porni bugetul

1. **Depunem la domiciliu sau la locul nașterii?** Germania și Franța cer expres locul nașterii;
   pagina noastră promite domiciliul. Risc de respingeri pe cele două piețe cu intenția cea mai
   calificată.
2. **Nu vindeți apostilă pentru UE.** Reg. 2016/1191 + formularul standard multilingv (gratuit,
   5 zile) o fac inutilă în IT/ES/DE/FR/BE/AT. Un client care află după ce a plătit 198 lei lasă o
   recenzie proastă. Transformați formularul multilingv în diferențiator.
3. **Garanția „banii înapoi".** Trei concurenți vând încredere prin plată amânată sau garanție.
   Fără un răspuns aici, obiecția „cer bani în avans" rămâne fără contraargument.

**Unghiul de campanie cu cel mai mare potențial**, susținut de toate cele 7 puncte: nu „îți luăm
certificatul de celibat", ci **„primăria din [Italia / Germania / Spania] nu cere ce crezi tu că cere
— noi știm exact ce act, în ce formă și cu ce valabilitate"**. Durerea nu mai e prețul și nu mai e
taxa consulară (nulla osta e gratuit). E **confuzia pe patru nume de documente** și **frica de a
rămâne cu nunta anulată și invitațiile deja trimise**.

---

## Surse principale

**Oficiale — internaționale:**
[CIEC Convenția nr. 20](https://ciec1.org/en/convention/convention-no-20-on-the-issue-of-a-certificate-of-legal-capacity-to-marry/) ·
[Reg. (UE) 2016/1191, EUR-Lex](https://eur-lex.europa.eu/legal-content/RO/TXT/HTML/?uri=OJ%3AC%3A2016%3A168%3AFULL) ·
[Portalul e-Justiție](https://online-forms.e-justice.europa.eu/public-documents_ro)

**Oficiale — România:**
[e-Consulat, certificat de cutumă](https://www.econsulat.ro/CertificatCutuma/DescriereServiciu/404000003) ·
[Secția Consulară Roma](https://roma.mae.ro/node/472) ·
[CG Milano](https://milano.mae.ro/node/932) · [CG Milano, it](https://milano.mae.ro/it/node/674) ·
[CG Torino](http://torino.mae.ro/node/476) · [CG Bonn](https://bonn.mae.ro/node/427) ·
[CG Paris](https://cgparis.mae.ro/fr/node/548) · [CG Sevilla](https://sevilla.mae.ro/node/476) ·
[hub.mai.gov.ro — formulare multilingve](https://hub.mai.gov.ro/serviciu/view?id=103) ·
[DEPABD](https://depabd.mai.gov.ro/Regulament_1191_2016.html) ·
[Norma metodologică 2024](https://dgaspc5.ro/wp-content/uploads/2025/03/Norma-metodologica-2024-anexa-1.html) ·
[Legea 119/1996, Portal Legislativ](https://legislatie.just.ro/public/DetaliiDocument/8624) ·
[UNBR — Legea 120/2026](https://unbr.ro/unbr-info-avocatii-pot-reprezenta-de-astazi-cetatenii-in-procedurile-privind-actele-de-stare-civila-inclusiv-pentru-transcrierea-actelor-emise-in-strainatate/) ·
[Primăria Sector 5](https://sector5.ro/eliberarea-dovezii-de-celibat/) ·
[SPCEP Craiova](https://spcepcv.ro/stare-civla/diverse/adeverinta-de-celibat/) ·
[DJEP Hunedoara](https://evidentahunedoara.ro/stare-civila/inscrierea-de-mentiuni/) ·
[MAE — date statistice diaspora 2021](https://diaspora.gov.ro/images/content/resurse/Date_statistice_-_M.A.E._2021.pdf)

**Oficiale — străine:**
[Comune di Milano, PDF](https://www.comune.milano.it/documents/20118/44162/DOCUMENTAZIONE+PUBBLICAZIONI++STRANIERI.pdf) ·
[giustizia.it](https://www.giustizia.it/giustizia/page/it/coppie_di_nazionalita_diverse_matrimonio) ·
[Registro Civil Valencia, PDF](https://cjusticia.gva.es/documents/19318332/389447611/CAPACIDAD+MATRIMONIAL.pdf) ·
[BOE-A-2021-9326](https://www.boe.es/buscar/act.php?id=BOE-A-2021-9326) ·
[exteriores.gob.es](https://www.exteriores.gob.es/Consulados/francfort/es/ServiciosConsulares/Paginas/index.aspx?scca=Certificados&scco=Alemania&scd=144&scs=Certificado+de+capacidad+matrimonial) ·
[Ambasada Germaniei, București](https://rumaenien.diplo.de/ro-de/service/2012828-2012828) ·
[§ 1309 BGB](https://www.gesetze-im-internet.de/bgb/__1309.html) ·
[OLG Sachsen — fișa România](https://www.justiz.sachsen.de/olg/download/Ehefaehigkeit/Rumaenien.pdf) ·
[OLG Köln, Allgemeiner Teil 08/2025](https://www.olg-koeln.nrw.de/aufgaben/justizverwaltung/organisation_verwaltung/dez_7/laender/allgemeiner-teil_august-2025.pdf) ·
[OLG Oldenburg](https://oberlandesgericht-oldenburg.niedersachsen.de/startseite/service/verwaltungsverfahren_in_eheangelegenheiten/befreiung-von-der-beibringung-des-ehefaehigkeitszeugnisses-128632.html) ·
[OLG Celle](https://oberlandesgericht-celle.niedersachsen.de/startseite/service/ehefahigkeitsverfahren/allgemeine-hinweise-zum-verfahren-auf-befreiung-von-der-beibringung-des-ehefahigkeitszeugnisses-nach-1309-bgb-245573.html) ·
[Leitfaden OLG Dresden, PDF](https://www.justiz.sachsen.de/olg/download/Leitfaden_Ehefaehigkeit.pdf) ·
[gov.uk](https://www.gov.uk/marriages-civil-partnerships/documents-youll-need-to-give-notice) ·
[Brent Council](https://www.brent.gov.uk/births-deaths-marriages-nationality/marriages-civil-partnerships-and-ceremonies/give-notice-of-marriage-or-civil-partnership) ·
[Strasbourg, dossier mariage 2025, PDF](https://www.strasbourg.eu/documents/976405/1543848/dossier-mariage-2025.pdf) ·
[Ambasada Franței, București, PDF](https://ro.diplomatie.gouv.fr/files/ro/files/Consulaire/mariage-entre-citoyens-francais-et-roumain.pdf) ·
[belgium.be](https://www.belgium.be/nl/familie/koppel/huwelijk/huwelijksformaliteiten) ·
[IGVM, PDF](https://igvm-iefh.belgium.be/sites/default/files/downloads/CGKR_intfamrecht-NL_def.pdf) ·
[vreemdelingenrecht.be](https://www.vreemdelingenrecht.be/internationaal-personen-en-familierecht-ipr/huwen/huwen-belgie/hoe-sluit-je-een-huwelijk-af-belgie) ·
[oesterreich.gv.at](https://www.oesterreich.gv.at/de/lexicon/E/Seite.990048) ·
[wien.gv.at](https://www.wien.gv.at/amtswege/eheschliessung-anmeldung)

**Statistice:**
[ISTAT 2024, PDF](https://www.istat.it/wp-content/uploads/2026/01/MATRIMONI-UNIONI-SEPARAZIONI-DIVORZI_anno-2024.pdf) ·
[Harja 2014, sezonalitate RO](https://doi.org/10.29358/sceco.v0i19.251) ·
[INS via Antena3](https://www.antena3.ro/actualitate/inedit/ins-la-ce-varsta-se-casatoresc-romancele-august-luna-cele-mai-multe-nunti-667854.html) ·
[INS via Click](https://click.ro/actualitate/national/in-romania-se-moare-mult-si-se-nasc-copii-putini-2393763.html)

**Voci reale:**
[avocatnet 513296](https://www.avocatnet.ro/forum/discutie_513296/Certificat-de-celibat.html) ·
[avocatnet 435206](https://www.avocatnet.ro/forum/discutie_435206/Nulla-osta.html) ·
[avocatnet 253328](https://www.avocatnet.ro/forum/discutie_253328/Casatorie-in-Germania.html) ·
[avocatnet 824530](https://www.avocatnet.ro/forum/discutie_824530/Urmeaza-sa-ma-casatoresc-in-Turcia-Autoritatila-din-Romania.html) ·
[avocatnet 160417](https://www.avocatnet.ro/forum/discutie_160417/Valabilitate-certificat-de-celibat.html) ·
[matrimonio.com](https://community.matrimonio.com/forum/richiedere-nullaosta-al-matrimonio-per-cittadino-rumeno--t1126449) ·
[info4alien.de](https://www.info4alien.de/cgi-bin/forum/YaBB.cgi?num=1386404825) ·
[desprecopii 86988](https://forum.desprecopii.com/forum/topic-TOPIC_ID-86988-ARCHIVE-true-nm-Acte-casatorie-in-GermaniaUrgent.htm) ·
[desprecopii 79221](https://forum.desprecopii.com/forum/topic-TOPIC_ID-79221-ARCHIVE-true-nm-Abuz-neprofesionalism-ilegalitate.htm) ·
[expat.com](https://www.expat.com/en/forum/europe/romania/1048980-marriage-information-romania.html) ·
[justanswer.co.uk](https://www.justanswer.co.uk/european-law/k7o7j-partner-romanian-so-married.html) ·
[mariages.net](https://communaute.mariages.net/forum/mariage-civil-belge-qui-se-marie-en-france--t671176) ·
[Gazeta Românească Italia](https://www.gazetaromaneasca.com/observator/comunitate/la-consulatul-de-la-milano-se-fac-reguli-proprii-se-comporta-ca-stat-in-stat-in-loc-sa-respecte-directivele-mae/)

**Concurenți:** linkurile din tabelele de la punctul 4.
