# Convenția cu topograful — „Angajament de execuție documentație"

> Livrat 2026-08-14. Documentul pe care clientul îl semnează cu **executantul**
> (PFA-ul topograf) odată cu contractul nostru de prestări servicii, pe cele 14
> servicii imobiliare fulfilate de colaborator.

## De ce există

Serviciile prin topograf nu merg prin avocat, deci nu au împuternicire
avocațială (vezi `LAWYER_SERVICE_SLUGS` în `no-lawyer-services.ts`). Executantul
are totuși nevoie de **mandatul scris al proprietarului** ca să:

- ceară informații și date din arhiva BCPI pentru imobil;
- depună documentația la BCPI și să ridice înscrisurile în numele lui.

Până acum convenția se completa de mână, pe hârtie, după fiecare comandă
(modelul lui Mircea). Acum se generează automat, cu datele comenzii, și e
semnată electronic de client în wizard.

## Ce a fost nevoie să se schimbe în flux

Serviciile topograf **nu aveau deloc pas de semnătură** (`signature.enabled =
false`) — nici contractul de prestări nu era semnat de client. Migrarea 142
activează pasul; clientul semnează **o singură dată**, iar semnătura intră în
ambele documente.

Nici datele de identificare nu se colectau (`personalKyc` e off pe aceste
servicii). Se cer acum în pasul „Date imobil", într-un bloc care apare **doar**
când convenția e activă.

## Configurare (sursă unică)

`services.verification_config.conventie`:

```json
{
  "enabled": true,
  "executantName": "Dumitrean Mircea Adrian",
  "executantAuthorization": "Seria RO-SM-F nr. 0092/2013"
}
```

Tip: `ConventieConfig` în `src/types/verification-modules.ts`. Același flag e
citit de wizard (câmpuri + previzualizare), de `auto-generate.ts` (generare la
submit) și de gardele server-side. Migrarea 142 îl pune pe toate serviciile
asignate unui colaborator care au modulul `propertyVerification` activ.

> ⚠️ Un serviciu NOU asignat topografului trebuie să primească același bloc
> (rulează din nou migrarea 142 — e idempotentă), altfel nu primește convenție
> și nici pas de semnătură.

## Date colectate în wizard (pasul „Date imobil")

| Câmp | Obligatoriu | Unde ajunge în convenție |
|---|---|---|
| Nume și prenume proprietar | da | partea „Proprietar/Beneficiar" |
| Domiciliul proprietarului | da | „cu domiciliul în …" |
| CNP proprietar | da (validat) | „identificat cu CNP …" |
| Serie + număr act de identitate | da | „seria … nr. …" |
| Localitatea imobilului | nu | „Localitatea …" (pct. 1) |
| Strada și numărul imobilului | nu | „str. …" (pct. 1) |
| Județ / UAT / CF / nr. cadastral | deja existente | „CF nr. … cu nr. cad. … din UAT …" |

Proprietarul se cere **separat de facturare**: partea din convenție e cel din
cartea funciară, nu plătitorul (comandă plătită de copil pentru părinte, de
firmă pentru asociat), iar pasul de semnătură vine oricum înaintea facturării.

Se salvează în `customer_data.property` (`beneficiaryName`, `beneficiaryAddress`,
`beneficiaryCnp`, `beneficiaryIdSeries`, `beneficiaryIdNumber`, `imobilLocality`,
`imobilStreet`).

## Șablonul

- `src/templates/shared/conventie.docx` — generat din
  `src/templates/sources/conventie.html` cu
  `soffice --headless --convert-to "docx:MS Word 2007 XML"`. **Editează HTML-ul,
  apoi regenerează DOCX-ul** (altfel modificările se pierd la următoarea
  regenerare).
- Placeholdere proprii: `CONV_NUME`, `CONV_ADRESA`, `CONV_CNP`, `CONV_SERIE_CI`,
  `CONV_NUMAR_CI`, `CF_NUMAR`, `NR_CADASTRAL`, `UAT`, `LOCALITATE_IMOBIL`,
  `STRADA_IMOBIL`, `OBIECT_LUCRARE`, `ONORARIU`, `EXECUTANT_NUME`,
  `EXECUTANT_AUTORIZARE`, plus `SEMNATURA_CLIENT` (marker de imagine) și
  `DATA` / `DATACOMANDA` / `NRCOMANDA` / `CLIENT_IP` din setul comun.
- Câmpurile necompletate ies cu puncte („……………"), ca să poată fi scrise de mână,
  nu ca spații goale care rup fraza.

### Abateri de la modelul pe hârtie (deliberate)

Punctul 4 din modelul lui Mircea prevedea plata în două tranșe (50% la
măsurători, 50% la depunere) direct către executant. În realitate clientul
plătește **integral, în avans, platformei**, deci textul spune asta și trimite
la contractul de prestări. Restul documentului e identic cu modelul.

Onorariul trecut = **suma plătită de client** (TVA inclus).

## Generare

| Când | Unde | Ce se întâmplă |
|---|---|---|
| La submit (pre-plată) | `auto-generate.ts`, mode `submit` | `contract-prestari` + `conventie`, ambele cu semnătura clientului |
| Manual, din admin | `POST /api/admin/orders/[id]/generate-document` cu `template: "conventie"` | regenerare (garda pentru serviciile fără avocat acceptă `contract-prestari` + `conventie`) |
| Previzualizare la semnătură | `POST /api/contracts/preview` | randează exact ce va semna clientul |

Tip document: `conventie`; fișier în S3 la `orders/<comanda>/conventii/`.
`visible_to_client = true` — clientul o semnează, deci îi rămâne în pagina de
status.

> Bonus reparat în aceeași livrare: previzualizarea de la semnătură genera
> `contract-asistenta` pe TOATE serviciile, inclusiv pe cele fără avocat, care
> nu-l primesc niciodată. Acum previzualizarea respectă aceleași reguli ca
> generarea reală.

## Cine o vede

- **Clientul** — în pagina de status a comenzii (document vizibil).
- **Admin** — în „Documente generate", cu previzualizare/descărcare + buton de
  regenerare (`Angajament de executie (conventie topograf)`).
- **Colaboratorul** — în `/colaborator/orders/[id]`, secțiunea „Angajament de
  execuție documentație": „Deschide PDF" + varianta Word.
  Endpoint: `GET /api/collaborator/orders/[id]/document?docId=…[&format=docx]`,
  care servește **doar** convenția și propriile lui încărcări; restul
  documentelor comenzii rămân inaccesibile.

## Verificare rapidă

```bash
# randează convenția pentru o comandă reală, fără să atingi S3/DB
npx tsx --env-file=.env.local scripts/preview-conventie.ts E-260810-EP896
soffice --headless --convert-to pdf --outdir /tmp /tmp/conventie-E-260810-EP896.docx
```

Teste: `tests/unit/lib/documents/conventie.test.ts` (conținutul DOCX-ului
generat, nu doar helperii).

## Capcană: două module dinamice consecutive

Activarea semnăturii a pus, pe aceste servicii, două module încărcate dinamic
unul după altul („Date imobil" → „Semnătură"). Încărcarea e asincronă, deci
componenta veche se re-randa cu configul pasului nou și cădea
(`config.identificationService` undefined). Reparat în
`modular-order-wizard.tsx`: componenta dinamică se ține împreună cu `stepId`-ul
pentru care a fost încărcată și se randează doar la potrivire.

**Dacă mai activezi un modul pe un serviciu**, verifică fluxul în browser, nu
doar tipurile: un modul nou lipit de altul e exact combinația care nu se testa
niciodată înainte.
