# Google Ads pe documente: jurnalul încercărilor

Un singur loc pentru tot ce am încercat ca să rulăm reclame Google pe serviciile de documente, ce a ieșit și ce urmează. Se completează la fiecare pas nou. Dosarul de plângeri (Google, ANCOM, Consiliul Concurenței) rămâne în [`registru-demersuri.md`](registru-demersuri.md).

## Întrebarea la care căutăm răspuns

Concurenții rulează reclame pe aceleași documente, în aceeași țară, pe SRL-uri obișnuite. Noi suntem respinși pe politica „Documente guvernamentale și servicii oficiale”. De ce ei da și noi nu?

## În așteptare acum

| Ce | Unde | Trimis | Răspuns până la | Stare |
|---|---|---|---|---|
| Cerere „în afara politicii” pentru cazierfiscal.com | formularul Google de certificare, cont 933-520-0143 | 12.11.2026, de Raul | ~26.11.2026 (10 zile lucrătoare), pe `r.lutas@yahoo.com` | confirmare „Your email has been sent” |
| Contestație pe anunțul de constatator | cont 881-388-1795, Anunțuri → stare → „Contestați” → „Contestarea deciziei” | 12.11.2026, de Raul | de obicei câteva zile lucrătoare | în cont: „În așteptarea soluționării contestației, Respins” |

Cât așteptăm: nicio a doua contestație pe 881-388-1795, nicio cerere nouă pe cazierfiscal.com. Regula „nicio campanie pe 933-520-0143” a fost înlocuită pe 16.11.2026: Raul a decis un test, cu campania publicată pe pauză.

## Ce am încercat, în ordine

| Data | Cont | Ce am încercat | Rezultat |
|---|---|---|---|
| mai–aug 2026 | ecazier 885-622-8494 (advertiser: Cabinet de Avocat Țarța) | campanii cazier | au rulat până ~05.08, apoi toate anunțurile „Neeligibile” pe politică |
| 19.08.2026 | eghiseul 677-995-5005 (EDIGITALIZARE) | campanii constatator | respinse pe politică |
| 01.09.2026 | cont nou 243-638-4990 | test | „Este obligatoriu un certificat”, pe loc |
| 01–07.09.2026 | tichet 1-6533000041865 | întrebat suportul | „intermediarii nu sunt eligibili”, apoi „certificare posibilă cu link de pe un site guvernamental” |
| sept–oct 2026 | 677-995-5005 | campanii imobiliare (cadastru, urbanism) | **au rulat** (202 clicuri, 266 lei între 13.09 și 12.10); oprite de noi |
| 07.10.2026 | documentero 809-020-5311 | campanie certificat de celibat | respinsă pe politică, deși celibatul nu e în lista Google |
| 12.10.2026 | — | 4 anunțuri ale concurenților raportate; plângere DSA la ANCOM; sesizare la Consiliul Concurenței | anunțurile rulau încă pe 01.11 |
| 11.11.2026 | cont nou 881-388-1795 | campanie constatator pe certificat-constatator-express.ro | 12.11: anunț „Respins — Este obligatoriu un certificat”; cont activ, cuvinte cheie eligibile |
| 12.11.2026 | 881-388-1795 | contestație („Contestarea deciziei”) | în așteptare |
| 12.11.2026 | cont nou 933-520-0143 | cerere „în afara politicii” pentru cazierfiscal.com, **înainte** de orice campanie | în așteptare |
| 16.11.2026 | 881-388-1795 | verificare la 5 zile | anunțul nu mai e „Respins”, ci **„Eligibil (limitat)”**: „Acest anunț este difuzat unui public limitat”, motiv „Documente guvernamentale și servicii oficiale — Este obligatoriu un certificat”. Rulează. Rezultatul contestației nu a fost citit separat („Urmăriți contestația”). |
| 16.11.2026 | 933-520-0143 | campanie de cazier fiscal `Search-CazierFiscal-2026-11`, la decizia lui Raul, fără să așteptăm răspunsul la cerere | publicată și pusă pe pauză; anunțul „În examinare”. Detalii: [`../cazier-fiscal/google-ads-campanie.md`](../cazier-fiscal/google-ads-campanie.md) |

## Verificarea din 16.11.2026 (campania de constatator)

Cifre din cont, 11–16.11: 321 de afișări, 25 de clicuri, 137,16 lei, CPC mediu 5,49 lei, **0 conversii**.

- **Comenzi pe certificat-constatator-express.ro:** niciuna plătită. Există 3 ciorne din 13.11, toate cu același telefon și cu emailuri de formă, deci cel mai probabil teste (deducție, nu confirmare).
- **Constatator pe eghiseul.ro, aceeași perioadă:** 3 comenzi plătite (11, 13 și 14.11), la 80,10 lei, adică prețul cu reducerea de Black Friday. Sunt pe eghiseul, nu vin din reclamă.
- **Conversia „Purchase” din Ads e „Inactiv”:** Google nu a primit niciodată un semnal. Codul e în regulă la citire, iar eticheta `AW-18568994286/…` e în pagina de succes live. Testul cu o comandă reală (pasul 4 din `docs/certificat-constatator/google-ads-cont-nou.md`) nu a fost făcut, deci lanțul nu e dovedit cap-coadă. Tag-ul se încarcă doar după acordul pentru cookie-uri de marketing: cine refuză nu se numără.
- **Cuvinte cheie:** „certificat constatator online” aduce cele mai multe clicuri (CTR 12%); `[certificat constatator]` are 95 de afișări și CTR 3%. Două cuvinte au scor de calitate scăzut („certificat constatator firma”, „certificat constatator rapid”).
- **Pragul:** la CPC 5,5 lei și marjă de circa 41 lei pe comandă, trebuie o vânzare la 7–8 clicuri. 25 de clicuri fără nicio comandă începută e un semnal slab, dar prea puțin pentru o concluzie.

**Verificarea tag-ului, 16.11 (în browser, pe site-ul live):**

- Înainte de acord: consimțământ implicit „denied”, niciun script Google încărcat.
- După „Accept toate”: `consent update` cu toate patru pe „granted”, se încarcă `G-X5Q7NDPHPL` și `AW-18568994286` (cu `allow_enhanced_conversions`), iar `gclid`-ul din URL ajunge în cookie-ul `_gcl_aw` și în cererile către Google (`gcs=G111`).
- Cererile `collect` au apărut cu 503 în browserul de test, deși aceleași adrese răspund normal din afara lui. Cauza nu e stabilită (posibil o extensie); nu e dovadă că Google primește datele.
- În cont: etichetarea automată e pornită; „Condiții privind datele despre clienți” sunt **neacceptate**, deci conversiile îmbunătățite nu funcționează, deși site-ul trimite emailul și telefonul.
- Limită cunoscută: tag-ul se încarcă abia după acord. Cine acceptă cookie-urile pe altă pagină decât cea de aterizare pierde `gclid`-ul, iar vânzarea nu se leagă de reclamă.
- Rămâne nedovedit: evenimentul de conversie de pe pagina de succes. Se dovedește doar cu o comandă plătită.

**Comanda de test, 16.11 (plătită de Raul, 89 lei, cu cookie-uri acceptate):** pagina de succes a trimis evenimentul `conversion` către `AW-18568994286`, cu eticheta de conversie, valoarea 89 RON și numărul comenzii; cererea a primit răspuns 200. A plecat și `purchase` în GA4. Cookie-ul de clic din browserul de test era unul fals, deci Google nu leagă această conversie de un clic real. Conversiile îmbunătățite au fost pornite în cont în aceeași zi (metoda „Eticheta Google”), după acceptarea condițiilor. Rămâne de verificat: starea acțiunii „Purchase” în cont după câteva ore și dacă datele îmbunătățite (email, telefon) ajung.

**Reverificare, 16.11 după-amiaza:** acțiunea „Purchase” din 881-388-1795 a trecut din „Inactiv” în „Nu există conversii recente”, cu 0 conversii numărate: Google a primit semnalul comenzii de test, dar nu l-a legat de un clic (cookie-ul de clic din browserul de test era fals). Certificatul comenzii de test a fost eliberat de ONRC la 11:29.

Contul 933-520-0143 (cazierfiscal.com) are din 16.11 o campanie pe pauză; vezi rândul din tabelul de mai sus.

## Verificare completă, 18.11.2026

**Constatator, cont 881-388-1795, 11–17.11** (din contul Google Ads):

| | |
|---|---|
| Afișări / clicuri / CTR | 588 / 61 / 10,37% |
| Cost / CPC mediu | 328,14 lei / 5,38 lei |
| Telefoane | 45 clicuri, 244,94 lei |
| Computere | 16 clicuri, 83,20 lei |
| Conversii înregistrate | 0 |
| Stare anunț | „Eligibil (limitat)”, politica „Documente guvernamentale și servicii oficiale” |
| Cuvinte cheie „Afișat rar (scor de calitate scăzut)” | 5 din 10, inclusiv [certificat constatator] și „certificat constatator firma” |

**Ce s-a întâmplat pe site** (baza de date, comenzi reale pe certificat-constatator-express.ro):

- Două comenzi începute de vizitatori veniți din reclamă: E-261116-4VKDT (a semnat, a ajuns la pagina de plată, nu a plătit; la telefon a spus că nu mai vrea) și E-261117-TCLAS (oprită la pasul de date).
- Nicio comandă plătită din reclamă. Singura comandă plătită de pe site e cea de test din 16.11.
- Google nu are deci nicio conversie reală de primit. „0 conversii” din cont e corect, nu o pierdere de raportare.

**Ce arată Google Analytics** (proprietatea site-ului, 11–18.11): 502 vizitatori, din care 480 cu același profil: Chrome pe Linux, ecran 1920×1080, aterizare pe prima pagină, orașe diferite din România. Doar 2 vizitatori au ajuns pe formularul de comandă. Profilul e de trafic automat, nu de clienți. Google a facturat doar 16 clicuri de pe computere, deci cea mai mare parte a acestui trafic nu e plătită. Originea lui nu e stabilită.

De pe telefoane: 45 de clicuri plătite, 15 sesiuni măsurate. Analytics și eticheta de conversie se încarcă doar după acordul de cookie-uri, deci cine nu apasă pe banner nu e măsurat, iar o eventuală comandă a lui nu ajunge la Google ca și conversie.

**Cazier fiscal, cont 933-520-0143:** campania `Search-CazierFiscal-2026-11` e pe pauză din 16.11. Nu a rulat nicio zi. În cont, acțiunea „Purchase” apare cu eticheta neverificată, pentru că nu a existat nicio vizită din reclamă.

**Organic, 04–15.11** (Search Console): cazierfiscal.com 69 afișări, 0 clicuri; certificat-constatator-express.ro 13 afișări, 1 clic.

**Eroare reparată:** comenzile din reclamă erau etichetate „Căutare organică” în admin. Detalii: [`../changelog/2026-11-18-reclama-comenzi-etichetate-organic.md`](../changelog/2026-11-18-reclama-comenzi-etichetate-organic.md).

**Analiza traficului automat** (jurnalul de acorduri cookie, 05–18.11):

- 607 acorduri cu exact același browser declarat (Chrome 156 pe Linux, desktop). Înainte de 13.11 erau 1–5 pe zi; apoi 134, 165, 165, 95, 46 pe zi (13–17.11) și 4 pe 18.11. Valul a început în ziua în care anunțul a devenit eligibil.
- 348 de adrese IP diferite, cel mult 9 vizite de pe una. Aproape toate sunt din plajele de internet rezidențial ale unui singur furnizor din România. E tiparul unei rețele de proxy-uri rezidențiale: adresele sunt ale unor abonați reali și se schimbă la fiecare vizită.
- 580 din 629 au apăsat „Accept” pe bannerul de cookie-uri și au stat în medie aproape 3 minute, cu derulare. Robotul imită un vizitator interesat.
- Analytics a numărat 277 de sesiuni cu clic pe reclamă, iar Google a facturat 16 clicuri de pe computere (83,20 lei). Diferența arată că Google a filtrat singur cea mai mare parte ca trafic nevalid. Nu am citit coloana „Clicuri nevalide” din cont, deci cifra exactă a celor filtrate lipsește.

Concluzii: paguba directă e de cel mult 83 lei până acum, nu tot bugetul; cele 45 de clicuri de pe telefoane (244,94 lei) nu au acest profil. Blocarea pe IP nu funcționează: sunt sute de adrese care se rotesc și aparțin unor clienți reali ai aceluiași furnizor, deci am bloca și cumpărători. Lista adreselor nu se ține în repo (date personale).

**Rentabilitate constatator, la cifrele de până acum:** prețul e 89 lei cu TVA, adică 73,55 lei fără TVA. Taxa ONRC înregistrată pe comenzi e 30 lei, deci rămân 43,55 lei pe comandă înainte de comisionul de card. La 5,38 lei pe clic, reclama se acoperă doar dacă un clic din 8 plătește (12,4%). Până acum: 61 de clicuri, zero plăți. Verificat exact în baza de date: pe certificat-constatator-express.ro există 6 comenzi în total, una singură plătită, cea de test. Cele 11 comenzi de constatator plătite în noiembrie sunt de pe eghiseul.ro, venite direct sau din email.

**Cazier fiscal pornit, 18.11.2026:** la cererea lui Raul, campania `Search-CazierFiscal-2026-11` a fost trecută din „Întreruptă” în activă. Stare după pornire: campania „Eligibilă (învață)”, anunțul „Eligibilă”, fără mențiune de politică. Buget 30 lei/zi.

### Audit de cont, 18.11.2026 (după-amiaza)

Sursa: interfața Google Ads, cont 881-388-1795, interval 11–17.11. Ce nu am citit e trecut la sfârșit.

| Zonă | Ce am găsit |
|---|---|
| Conversia de test | Nu apare în cont: „Achiziții: 0”. Explicație: testul din 16.11 a fost făcut cu un identificator de clic inventat, iar Google numără doar conversiile legate de un clic real pe reclamă. Eticheta a trimis evenimentul (răspuns 200); lipsa din cont nu arată o defecțiune. |
| Dovada că măsurarea merge cap-coadă | Lipsește. Se obține doar cu o comandă plătită după un clic real pe anunț, cu cookie-urile acceptate. |
| Strategie de licitare | „Maximizați numărul de clicuri”, cu limită de CPC. Campania e optimizată pe clicuri, nu pe vânzări; fără conversii nu se poate trece pe licitare după conversii. |
| Limita de CPC | **Schimbată din 6,00 în 3,00 lei pe 18.11**, la cererea lui Raul. Verificată după salvare. |
| Rețele, locație, program | Doar Căutare Google; România; toată ziua; fără ajustări pe dispozitive. Limba nu e setată. |
| Extinderea URL-ului și personalizarea textului | Dezactivate. |
| Stare | „Eligibil (limitat)”: licitare limitată, toate anunțurile limitate de politică. |
| Anunț | Un singur anunț adaptabil, putere „Medie”. |
| Cuvinte cheie | 10; 5 marcate „Afișat rar (scor de calitate scăzut)”. Cele două care aduc cele mai multe clicuri („obtinere…”, „…online”) sunt eligibile, cu CTR de 15–16%. |
| Termeni de căutare | Cei vizibili sunt la obiect (constatator online, onrc, registrul comerțului). Apar și căutări de preț („cât costă un certificat constatator”, 4 clicuri) și „ieftin”. 227 lei din 328 sunt la „alți termeni”, pe care Google nu îi arată. |
| Dispozitive | 45 de clicuri de pe telefoane, 16 de pe computere. |

**De ce nu vinde, pe ce arată datele:**

1. Volum prea mic pentru o concluzie: 61 de clicuri. La o rată obișnuită de câteva procente ar însemna 1–3 comenzi; zero e posibil și din întâmplare.
2. Economia e strânsă la orice rată realistă: 43,55 lei rămași pe comandă, 5,38 lei pe clic. De aici limita de 3 lei.
3. O parte din clicuri caută prețul oficial sau varianta ieftină. La ONRC certificatul costă mai puțin decât la noi, deci acești vizitatori compară și pleacă.
4. Trei vizitatori reali au început comanda: doi au semnat și au ajuns la pagina de plată fără să plătească, unul s-a oprit la datele firmei. Jurnalul de erori al site-ului nu are nicio eroare de pe acest domeniu în perioadă.

**Ce nu am verificat:** componentele scorului de calitate pe fiecare cuvânt cheie, cota de afișări și statisticile de licitație, coloana „Clicuri nevalide”, viteza paginii pe telefon. Cazier fiscal (933-520-0143) a pornit azi și nu are încă date de auditat.

**Identificatorul de clic și încărcarea offline:** din 18.11 clicul pe reclamă rămâne pe comandă, pe toate site-urile, iar în Marketing există exportul pentru Google Ads. Detalii și pașii dinaintea primei încărcări: [`../changelog/2026-11-18-conversii-offline-google-ads.md`](../changelog/2026-11-18-conversii-offline-google-ads.md).

**Decizii deschise (Raul):**

1. ~~Pornirea campaniei de cazier fiscal.~~ Pornită 18.11.
2. Pe constatator: 328 lei pentru două comenzi începute și niciuna plătită, la un preț de 89 lei. De hotărât dacă testul continuă până la 14 zile sau se oprește.
3. Raportarea conversiilor pentru cei care nu acceptă cookie-urile: exportul există din 18.11, dar Google cere la conectarea datelor offline o bifă de conformitate cu politica de consimțământ din UE, care nu ar fi adevărată pentru acești cumpărători. Acțiunea de conversie nu a fost creată. Detalii în changelog-ul din 18.11.
4. Direcționarea după lista de clienți: făcută pe 18.11 doar în contul de constatator (881-388-1795). 21.033 de cumpărători eghiseul, în hash SHA-256; Google o permite pe acest cont doar pentru observare și excluderi. Neatașată încă la campanie; în contul de cazier fiscal (933-520-0143) nu e încărcată. Detalii: [`../changelog/2026-11-18-politica-confidentialitate-publicitate-google.md`](../changelog/2026-11-18-politica-confidentialitate-publicitate-google.md).

**De verificat peste câteva zile (notat 18.11):**

| Când | Ce | Cum |
|---|---|---|
| 19–20.11 | cazier fiscal: afișări, clicuri, iar anunțul rămâne „Eligibilă” după primele afișări | cont 933-520-0143 → Anunțuri; rezultatul intră în „Rețeta conturilor noi” |
| 19.11 | constatator: afișările după plafonul de 3 lei pe clic; numărul de potriviri al listei de clienți (minim 1.000), apoi atașare la campanie pe „Observare” | cont 881-388-1795 → Segmente de public |
| ~25.11 | favicon-ul certificat-constatator-express.ro apare în rezultatele Google | căutare `site:certificat-constatator-express.ro` cu `&pws=0`; detalii mai jos |
| după 20.11, decizia lui Raul | lista de clienți și pe contul de cazier fiscal, pentru direcționare | Raul bifează acordul pentru datele clienților în 933-520-0143, apoi se încarcă același fișier hash |

**Favicon constatator (verificat 18.11):** pe site nu e nimic stricat. `/favicon.ico` (48×48), `/icon.png` (192×192, fulger verde pe fond închis) și `/apple-icon.png` răspund 200 pe domeniul constatatorului, cu iconița lui, inclusiv pentru Googlebot. `robots.txt` le permite, iar pagina principală are `<link rel="icon">`. În Search Console pagina principală e „Submitted and indexed”, dar Google a citit-o **o singură dată, pe 11.11**, în ziua lansării. Google afișează favicon-ul abia după ce îl preia separat, iar la un site nou durează de la câteva zile la câteva săptămâni. Până atunci arată globul gri. Cazierfiscal.com are aceeași configurare și a fost citit ultima dată pe 13.11. Ce ar grăbi: „Solicitați indexarea” pe pagina principală, în Search Console. Detaliu minor: eticheta spune `sizes="512x512"`, iar fișierul are 192×192. E tot multiplu de 48, deci acceptat de Google; se poate înlocui cu un fișier de 512 când există sursa grafică.

## Ce știm sigur

- **Nu e firma.** Reclamele imobiliare au rulat pe EDIGITALIZARE; ecazier a fost blocat pe numele cabinetului de avocat; motivul scris pe anunț e politica.
- **Nu e facturarea sau vechimea contului.** Aceeași respingere pe un cont vechi verificat și pe trei conturi noi.
- **Politica, din sursă** (în vigoare din 05.10.2026): rulează doar guvernul și „furnizorii autorizați”, adică domenii legate de pe un site guvernamental care le numește autorizate. Contractele, licențele și înscrierile în registre nu se acceptă.
- **Unde intră serviciile noastre:** constatatorul la „Business identifiers”, cazierul judiciar și integritatea la „Criminal background checks”, nașterea la „Birth or death certificates”. România nu e exceptată la niciuna. Cazierul fiscal, celibatul, căsătoria și cazierul auto nu apar în listă. Rovinieta e exceptată în text.
- **Formularul de certificare** are patru opțiuni; pentru serviciile din listă nu putem completa cinstit niciuna (analiza: [`2026-11-04-ce-putem-rula-acum.md`](2026-11-04-ce-putem-rula-acum.md), secțiunea din 12.11).
- **Concurența rulează** (12.11, căutare fără personalizare): certificatconstatator.ro, constatator-online.ro (OPENCODE SRL, „Confirmat”, mai multe conturi pe același domeniu), constatatoronline.com, onrc.info.ro.

## Ce nu știm încă

De ce trec concurenții. Trei explicații posibile, niciuna confirmată:

1. **Au certificatul Google pe cont**, primit pe regulile de dinainte de 05.10.2026.
2. **Robotul îi clasifică altfel.** Pe 02.11 un anunț nou al caziere.ro apărea la „Finanțe”, nu la „Legi și guverne”.
3. **Regula nu li s-a aplicat încă.** Anunțurile raportate pe 12.10 rulau și pe 01.11.

## Ce ne spune fiecare răspuns

| Dacă… | Atunci… |
|---|---|
| cererea pentru cazierfiscal.com e aprobată | pornim o campanie doar de cazier fiscal pe 933-520-0143; aceeași cerere se poate face pentru celibat și căsătorie, pe un cont doar al lor |
| cererea e respinsă cu o categorie numită | știm unde încadrează Google cazierul fiscal; răspunsul scris intră în dosarul de tratament egal |
| cererea e respinsă fără motiv | cerem motivarea în scris (P2B art. 4) și o adăugăm la ANCOM |
| contestația la constatator e admisă | anunțul rulează; notăm exact ce s-a schimbat |
| contestația e respinsă | confirmă că pe constatator calea e doar certificatul; nu mai contestăm |

## Rețeta conturilor noi (ce am făcut diferit, 11–18.11.2026)

Scrisă pe 18.11 ca să o putem repeta la alte servicii. Pe două conturi noi am ajuns la anunțuri care rulează, după ce pe conturile vechi totul era „Neeligibil” pe politica „Documente guvernamentale și servicii oficiale”.

**Ce s-a întâmplat, exact:**

- **Constatator (881-388-1795):** anunțul a fost **respins** pe 12.11 („Este obligatoriu un certificat”). Raul a apăsat „Contestați” în aceeași zi. Pe 16.11 anunțul era „Eligibil (limitat)”: rulează, dar unui public restrâns. Nu știm dacă a schimbat starea contestația sau reexaminarea automată.
- **Cazier fiscal (933-520-0143):** anunțul **nu a fost respins niciodată**. „Neeligibilă” din 16.11 însemna „campania e pe pauză”, nu politică. După pornire, pe 18.11, anunțul e „Eligibilă”, fără „limitat” și fără mențiune de politică. Stare citită după ~40 de minute de rulare, fără nicio afișare încă, deci **neconfirmată la scară**: un anunț poate fi limitat sau respins și după primele afișări.

**Pașii comuni ai ambelor conturi:**

1. Cont Google Ads nou, pe aceeași firmă (EDIGITALIZARE), pentru un singur serviciu, permanent.
2. Domeniu separat, dedicat acelui serviciu (certificat-constatator-express.ro, cazierfiscal.com), nu o pagină din eghiseul.ro.
3. Landing cu neafiliere clară („serviciu privat, nu ANAF / ONRC”), datele firmei, ANPC/SOL, prețul total vizibil (cu onorariu și TVA).
4. Textul anunțului spune ce suntem: „Serviciu privat, nu ANAF”, „Depunere prin avocat”, prețul, termenul. Fără „oficial”, „emis”, „portal”, „gratuit”, „urgent”.
5. Doar Rețeaua de căutare: fără parteneri, fără Display, fără AI Max, fără potrivire amplă, fără elemente automate.
6. Campania se publică **pe pauză**. Examinarea de politică se face și așa, fără cheltuială. Se pornește doar după ce anunțul nu mai e „În examinare”.
7. La cazier fiscal, **înainte** de campanie: cererea „în afara politicii” din formularul de certificare (12.11), cu domeniul. La constatator: contestație imediat după respingere.
8. Tag de conversie propriu pe domeniu, iar cookie-urile se încarcă doar după acord. Pentru vizitatorii care refuză: export de conversii offline din admin (Marketing).

**Când îl aplicăm la alt serviciu:**

- Merge pentru un serviciu care **nu** a fost respins încă pe alt cont: de exemplu căsătorie sau alt act nou.
- Pentru un serviciu deja respins pe un cont (celibat pe 809-020-5311, cazier judiciar pe ecazier/eghiseul), un cont nou doar ca să-l repornim e exact „ocolirea sistemului” de mai jos. Acolo calea e contestația sau certificatul, pe contul unde a fost respins.
- Serviciile cu avocat care sunt **în lista** politicii (cazier judiciar, stare civilă emisă de instituție) nu primesc cerere „în afara politicii”.
- Un singur serviciu nou o dată. Notăm aici rezultatul înainte să trecem la următorul.

**De confirmat (19–20.11):** cazier fiscal are afișări și clicuri, iar anunțul rămâne „Eligibilă” după primele afișări. Dacă devine „limitat” sau „respins”, rețeta nu e confirmată pentru cazier fiscal și notăm aici.

## Ce nu facem

- Cont pe persoană fizică sau pe altă firmă pentru un anunț deja respins: Google o tratează ca ocolire a sistemului și poate suspenda toate conturile legate.
- Anunțuri rescrise ca să ascundă documentul.
- Opțiunea „în afara politicii” pentru un serviciu care e în listă: garanția ar fi falsă.
- Cod de ofertă pe conturile noi: firma are deja oferta de bun-venit pe 881-388-1795.

## Conturile, pe scurt

| Cont | Login | Pentru | Stare |
|---|---|---|---|
| 677-995-5005 | eghiseul@gmail.com | eghiseul | activ, campanii oprite de noi |
| 885-622-8494 | serviciiseonethut@gmail.com | ecazier | oprit din august |
| 809-020-5311 | serviciiseonethut@gmail.com | documentero | celibat respins 07.10 |
| 243-638-4990 | eghiseul@gmail.com | test 01.09 | nefolosit |
| 881-388-1795 | r.lutas@yahoo.com | constatator | anunț respins, contestație în curs |
| 933-520-0143 | r.lutas@yahoo.com | cazierfiscal.com | campanie activă din 18.11, anunț „Eligibilă”; cerere în curs; **doar cazier fiscal, permanent** |
| 889-005-5301 | eghiseul@gmail.com | erovinieta.net | în afara politicii; nu se folosește pentru teste |
