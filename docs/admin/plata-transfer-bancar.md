# Plata prin transfer bancar (IBAN) — cum funcționează și ce face echipa

> Scris 10.09.2026, după ce s-a descoperit că fluxul nu funcționase niciodată.
> Istoricul defectului: [changelog](../changelog/2026-09-10-plata-transfer-bancar-reparata.md).

---

## Pe scurt, pentru echipă

O comandă plătită prin IBAN **nu mai apare la abandonuri**. Are tab propriu în
`/admin/orders` → **„Așteptare plată"**. Când banii apar în extras, deschizi
comanda și apeși **„Confirmă plata"**. Fără apăsarea aia nu se emite factura și
clientul nu primește confirmarea.

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
| Statusul comenzii | `awaiting_payment` — badge portocaliu „Așteptare plată" |
| Starea plății | `awaiting_verification` |
| Tab admin | **„Așteptare plată"**, cu badge de număr; comanda apare și în „Toate" |
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

## ⚠️ De reținut

- **Nu muta comanda pe „Plătită" din dropdown-ul de status.** Ar sări peste
  factură, peste emailul de confirmare și peste alocarea numerelor de Barou.
  Singura cale corectă e butonul „Confirmă plata".
- **Comanda nu se mai trage înapoi.** Dacă ai început deja lucrul, confirmarea
  plății îi păstrează statusul de lucru și schimbă doar starea plății.
- **Bannerul roșu „Comandă în lucru, dar plata NU e confirmată"** apare pe orice
  comandă avansată în flux fără plată confirmată. Când îl vezi, nu s-a emis
  factura și clientul nu a primit confirmarea — rezolvă înainte de livrare.
- Referința e obligatorie tocmai ca încasarea să poată fi găsită mai târziu în
  extras, la reconciliere.
- Cel mai devreme moment în care banii pot apărea e a doua zi lucrătoare;
  transferurile de vineri seara ajung de regulă luni.

## Legături

- Marcarea manuală a plății pe comenzile telefonice:
  [comenzi-telefonice](comenzi-telefonice/README.md)
- Facturare și decontări:
  [stripe-oblio-payment-invoicing](../technical/specs/stripe-oblio-payment-invoicing.md)
