# Plata prin transfer bancar (IBAN) — cum funcționează și ce face echipa

> Scris 10.09.2026, după ce s-a descoperit că fluxul nu funcționase niciodată.
> Istoricul defectului: [changelog](../changelog/2026-09-10-plata-transfer-bancar-reparata.md).

---

## Pe scurt, pentru echipă

O comandă plătită prin IBAN **nu mai apare la abandonuri**. Are tab propriu în
`/admin/orders` → **„Așteptare plată"**. Când banii apar în extras, deschizi
comanda și apeși **„Confirmă plata"**. Fără apăsarea aia nu se emite factura și
clientul nu primește confirmarea.

**Din 14.09.2026 nu mai aștepți banii ca să începi lucrul.** Dacă ai văzut
dovada plății (ordinul de plată încărcat în checkout, trimis pe email sau pe
WhatsApp), apeși **„Dovadă verificată — pornește lucrul"** în același panou.
Comanda trece pe „În procesare", se generează contractul de asistență,
împuternicirea și cererea, și poți depune la instituție. „Confirmă plata" rămâne
de apăsat când intră banii — atunci pleacă factura și emailul de confirmare.

---

## Ce se întâmplă la client

1. Alege „Transfer bancar" în checkout.
2. Apasă **„Confirm plata prin transfer bancar"**. Dovada de plată e
   **opțională** — nu i se cere să încarce nimic ca să meargă mai departe.
3. Primește imediat pe email: beneficiarul, banca, IBAN-ul (RON și EUR),
   SWIFT-ul, suma și **numărul comenzii, de trecut la „detalii plată"**.
4. Ecranul de succes îi spune că mai are de făcut transferul și că verificăm
   încasarea în 1-3 zile lucrătoare.
5. Face transferul când vrea, din aplicația băncii. Comanda **nu expiră** și nu
   se auto-abandonează.

## Ce se întâmplă în platformă

| | |
|---|---|
| Statusul comenzii | `awaiting_payment` — badge portocaliu „Așteptare plată" (sau `processing`, dacă lucrul a pornit pe dovadă) |
| Starea plății | `awaiting_verification` — rămâne așa până la „Confirmă plata", chiar dacă lucrul a pornit |
| Tab admin | **„Așteptare plată"** = toate comenzile cu `payment_status='awaiting_verification'`, inclusiv cele deja în lucru; badge de număr; comanda apare și în „Toate" |
| Dashboard | cardul „Plăți de verificat" numără exact aceste comenzi și duce în tab |
| Cron auto-abandon | **nu o atinge** |
| Email către echipă | heads-up pe `contact@eghiseul.ro` la fiecare comandă nouă cu IBAN |

## Ce face operatorul

1. Deschide tabul **„Așteptare plată"**.
2. Caută în extrasul de cont suma comenzii. Clientul a fost instruit să treacă
   numărul comenzii la „detalii plată", deci acolo trebuie să apară.
3. Deschide comanda. Panoul portocaliu **„Plată prin transfer bancar"** arată
   suma de căutat, numărul comenzii și dacă a atașat vreo dovadă.
4. Scrie **referința plății** (numărul tranzacției din extras) — e obligatorie,
   ajunge pe comandă și în decontări.
5. Apasă **„Confirmă plata"**.

Din acel moment pornește **exact același lanț ca la plata cu cardul**:

- factură Oblio cu colectare „Transfer bancar";
- contactul clientului salvat în registru;
- emailul de confirmare a comenzii către client;
- joburile ONRC/ANCPI, unde e cazul;
- documentele de Barou (contract de asistență, împuternicire, numere).

Dacă banii nu vin deloc, în același panou există **„Banii nu au venit —
abandonează"**, care mută comanda la abandonuri.

## Lucrul pornește pe dovadă, nu pe bani (14.09.2026)

Transferul ajunge în cont a doua zi lucrătoare, uneori la două zile. Comanda
`E-260912-5SNRM` (certificat de căsătorie, 1.248 lei) a stat blocată din 12.09
deși clientul trimisese ordinul de plată: fluxul de procesare pornea doar din
„Plătită", iar documentele Barou se generau exclusiv după plată.

Panoul portocaliu are acum un al doilea buton, **„Dovadă verificată — pornește
lucrul"**, vizibil doar pe comenzile de pe „Așteptare plată":

1. Deschide dovada (linkul „deschide dovada" din panou, dacă a fost încărcată
   în checkout; altfel emailul sau WhatsApp-ul clientului).
2. Apasă butonul și confirmă. Comanda trece pe **„În procesare"**, se alocă
   numerele de Barou și se generează automat contractul de asistență — exact
   ca după plată.
3. Împuternicirea și cererea le generezi ca de obicei, din panoul Documente
   („Generează"). Din 15.09.2026 butonul merge și pe comenzile pornite pe
   dovadă; înainte răspundea „Numerele Barou se alocă doar după plată".
4. Lucrezi normal: depui, ridici, treci prin statusuri.
5. Când banii apar în extras, apeși **„Confirmă plata"** ca de obicei. Abia
   atunci se emite factura Oblio și pleacă emailul de confirmare către client.
   Statusul de lucru nu se pierde.

Ce **nu** se întâmplă la „pornește lucrul": factura, emailul de confirmare a
plății, joburile automate ONRC/ANCPI (acelea costă bani reali la instituție și
pornesc doar la confirmarea încasării). Pe comanda pornită pe dovadă bannerul e
**galben** („În lucru pe dovada de transfer — încasarea NU e confirmată încă"),
ca să se deosebească de roșul unei comenzi avansate din greșeală fără plată.

Comanda **rămâne în tabul „Așteptare plată"** până la „Confirmă plata" — tabul
filtrează după starea plății, nu după statusul de lucru — deci coada de
confirmat nu pierde nimic. Apare în paralel și în „În procesare".

Dacă banii nu mai vin deloc după ce lucrul a pornit, numerele de Barou consumate
se **eliberează** din registrul central (nu se anulează), ca la orice comandă
neîncasată — vezi `docs/registru-central/`.

Butonul nu cere dovadă încărcată în checkout: `E-260912-5SNRM` nu avea fișier
atașat, ordinul de plată a venit pe alt canal. Decizia e a operatorului.

## Legătura cu decontările (Extras bancă)

`/admin/decontari/banca` importă extrasul BT în CSV. Din 10.09.2026 recunoaște
și **încasările de la clienți**, nu doar decontările Stripe:

- orice linie de **credit** care poartă IBAN-ul plătitorului primește categoria
  **„Încasare client"** (aportul propriu și Stripe rămân pe categoriile lor);
- linia se leagă automat de comandă, după numărul comenzii din „detalii plată";
- dacă numărul lipsește, se încearcă **suma exactă**, dar numai când o singură
  comandă neconfirmată din ultimele 90 de zile are exact suma aia. Când sunt
  două comenzi de 89 lei în aceeași săptămână nu ghicește nimic — rămâne un
  triunghi galben și o rezolvi tu;
- pe linia potrivită apare **„Confirmă plata"**, care deschide comanda cu
  **referința tranzacției deja completată**. Nu mai copiezi nimic de mână.

Fluxul recomandat, o dată pe zi sau pe săptămână: exporți extrasul din BT, îl
urci în „Extras bancă", apoi confirmi din coloana „Comandă". Importul **nu**
marchează nimic ca plătit singur — confirmarea rămâne decizia unui om.

Comenzile deja confirmate se leagă și ele, ca linia să nu rămână orfană când
urci extrasul după ce ai apăsat butonul. Acolo coloana arată numărul comenzii cu
o bifă, iar la hover vezi numărul facturii. Potrivirea lor se face **doar** pe
numărul comenzii sau pe referința tranzacției, niciodată pe sumă — o comandă
plătită nu are voie să fure linia uneia care chiar așteaptă banii.

### Plățile din străinătate

La un transfer SEPA în euro suma din extras **nu** e egală cu totalul comenzii:
banca face conversia la cursul ei. Cazul real din 08.09.2026 — 324,66 EUR la
curs 5,2508 pentru o comandă de 1.646,00 RON. De aceea potrivirea pe sumă nu are
nicio șansă acolo, și de aceea contează ca numărul comenzii să ajungă în
„detalii plată": e singurul lucru care traversează conversia neschimbat.

Factura se emite pe **totalul comenzii în lei**, nu pe echivalentul încasat.
Diferența de curs e chestiune de contabilitate, nu de facturare.

## ⚠️ De reținut

- **Nu muta comanda pe „Plătită" din dropdown-ul de status.** Ar sări peste
  factură, peste emailul de confirmare și peste alocarea numerelor de Barou.
  Singura cale corectă e butonul „Confirmă plata".
- **Comanda nu se mai trage înapoi.** Dacă ai început deja lucrul, confirmarea
  plății îi păstrează statusul de lucru și schimbă doar starea plății.
- **Ca să începi lucrul înainte de bani folosește „Dovadă verificată — pornește
  lucrul", nu dropdown-ul de status.** Dropdown-ul mută statusul, dar nu
  generează documentele Barou și lasă comanda cu banner roșu.
- **Bannerul roșu „Comandă în lucru, dar plata NU e confirmată"** apare pe orice
  comandă avansată în flux fără plată confirmată și fără „pornește lucrul". Când
  îl vezi, nu s-a emis factura și clientul nu a primit confirmarea — rezolvă
  înainte de livrare. Varianta **galbenă** înseamnă lucru pornit deliberat pe
  dovadă: confirmă încasarea când intră banii, tot înainte de livrare.
- Referința e obligatorie tocmai ca încasarea să poată fi găsită mai târziu în
  extras, la reconciliere.
- Cel mai devreme moment în care banii pot apărea e a doua zi lucrătoare;
  transferurile de vineri seara ajung de regulă luni.

## Legături

- Marcarea manuală a plății pe comenzile telefonice:
  [comenzi-telefonice](comenzi-telefonice/README.md)
- Facturare și decontări:
  [stripe-oblio-payment-invoicing](../technical/specs/stripe-oblio-payment-invoicing.md)

## Dovada plății de pe pagina comenzii (18.09.2026)

Clientul poate încărca dovada și mai târziu, din pagina comenzii
(`/comanda/status`, cu codul comenzii și emailul), fără cont. Cardul „Plata
prin transfer bancar" îi arată IBAN-ul, suma și referința și are butonul
„Încarcă dovada plății". Voi primiți un email o singură dată pentru fiecare
dovadă nouă; în istoricul comenzii „dovadă primită" apare doar când există
o dovadă, iar alegerea transferului apare ca „Așteptăm plata prin transfer
bancar".
