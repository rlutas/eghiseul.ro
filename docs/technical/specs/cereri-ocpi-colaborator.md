# Cereri OCPI generate pentru topograf (extras CF, plan cadastral, identificări)

**Status:** livrat 2026-08-21 (extras CF); extins 2026-08-24 (plan cadastral +
identificări) · **Scope:** `extras-carte-funciara`, `extras-plan-cadastral`,
`identificare-imobil`/`identificare-imobile-proprietar` (după raportarea
identificării)

## De ce

Portalul ANCPI (ePay) e picat din 13 iulie — [worker-ul ANCPI](railway-workers.md)
nu poate depune nimic, iar comenzile de extras CF se adună plătite și nelivrate.
Mircea (topograful colaborator) le poate depune manual: el semnează electronic
cererea și creează lucrarea în sistem.

Ce a cerut el, cuvânt cu cuvânt:

> „Va trimit modelul de cerere care trebuie completat. Cineva sa le intocmeasca,
> mi le trimite in format pdf, le semnez electronic si eu voi crea lucrarea si
> incarc in sistem." … „Ma intereseaza sa fie corect trecut in denumirea
> fisierului pdf numarul de carte funciara, uat-ul localitatii si judetul …
> pentru ca eu imi iau informatia direct din denumirea pdf-ului, nu mai deschid
> cererea sa o citesc."

Deci **denumirea fișierului este interfața**, nu un detaliu cosmetic. De aceea
numele și conținutul se generează din aceleași date ale comenzii — nu pot
diverge.

## Ce s-a livrat

| | |
|---|---|
| Cererea | Anexa nr. 6 — „Cerere pentru eliberare extras de carte funciara pentru informare", completată automat |
| Denumire | `cf 101010 - Baile Govora-Valcea.pdf` (convenția lui) |
| Granularitate | **un imobil = o cerere** (comanda poate avea mai multe imobile) |
| Descărcare | per imobil, din pagina comenzii + **ZIP cu toate cererile de depus** |
| Raportare | „Am depus cererea la OCPI" — nr. de înregistrare + costul eliberării |

## Cum e construit PDF-ul

Solicitantul de pe cerere este **el**, nu clientul — numele, adresa, telefonul și
e-mailul lui sunt constante, doar imobilul se schimbă. PDF-ul lui nu are câmpuri
editabile (`AcroForm` fără widget-uri; el scrie peste cu typewriter-ul Foxit),
deci nu putem „completa" fișierul primit.

Mecanismul e cel de la [cererea de cazier fiscal](admin-document-system.md):
un PDF de bază înghețat + o hartă de segmente, redesenate la runtime.

```
src/templates/ancpi/
  cerere-extras-cf-base.pdf        ← forma lui, cu cele 4 linii variabile ȘTERSE
  cerere-extras-cf-fields.json     ← harta de segmente (literal vs câmp)
  LiberationSerif-{Regular,Bold}.ttf
```

Liniile variabile (UAT, nr. CF, localitatea CF, nr. cadastral, data) sunt
**eliminate din content stream**, nu acoperite cu alb: un dreptunghi alb lasă
numărul de CF din exemplu extractibil, iar un „108465" fantomă care reapare la
copy-paste e exact greșeala pe care fluxul ăsta o previne. Fiecare text din
fișier e un bloc `BT..ET` propriu cu `Tm`, deci ștergerea pe linie e exactă.

Fontul: sursa are fonturi CID subsetate, nereutilizabile; corpul e metric Times,
iar LiberationSerif măsoară la 0,3% de el — literalele se reașază pe aceleași
poziții, iar o valoare lungă împinge eticheta următoare la dreapta în loc să o
suprapună.

**Rebuild** (doar dacă se schimbă formularul):

```bash
npm i --no-save pdfjs-dist
npx tsx --tsconfig tsconfig.json scripts/build-cf-cerere-pdf-template.ts <cerere-sursa.pdf>
```

PDF-ul sursă **nu e în git** (conține datele lui personale de două ori fără
niciun câștig) — se dă ca argument. Baza derivată e în git, pentru că e nevoie
de ea la runtime.

## Fișiere

| Fișier | Rol |
|---|---|
| `src/lib/documents/cerere-extras-cf-pdf.ts` | randează PDF-ul din bază + hartă |
| `src/lib/ancpi/cerere-filename.ts` | denumirea în convenția lui + coliziuni |
| `src/lib/ancpi/cereri-for-order.ts` | comandă → listă de cereri (una per imobil) |
| `src/lib/ancpi/cerere-scope.ts` | slug-ul acoperit + stările „gata" |
| `src/lib/ancpi/cerere-date.ts` | data, în fusul Bucureștiului |
| `GET /api/collaborator/orders/[id]/cerere?imobil=N` | o cerere |
| `GET /api/collaborator/cereri[?judet=]` | ZIP cu tot ce are de depus (max 100 comenzi), opțional pe județ |
| `POST /api/admin/orders/[id]/priority` | marchează comanda urgentă (`orders.priority`, migrarea 145) |
| `POST /api/collaborator/orders/[id]/depunere` | nr. înregistrare + cost |
| `scripts/build-cf-cerere-pdf-template.ts` | builder-ul asset-urilor |

## Reguli de reținut

- **Extras CF + plan cadastral + identificări** (din 24.08). Harta slug →
  template e `CERERE_SLUGS` în `cerere-scope.ts`; orice alt slug dă 400 — o
  comandă de alt tip nu primește tăcut o Anexă 6.
- **Plan cadastral** („extras din planul cadastral, pe ortofotoplan", cod
  2.7.7, taxă 15 lei): ANCPI nu are anexă dedicată în ODG 700/2014 — OCPI-urile
  folosesc un derivat al Anexei 1.30 „Cerere de informații" cu același corp.
  Baza noastră e derivată DIN BAZA CF din git
  (`scripts/build-plan-cadastral-cerere-template.ts`, reproductibil fără PDF-ul
  sursă al lui Mircea): se șterg din content stream eticheta „ANEXA NR. 6",
  titlul și fraza cu obiectul, și se redesenează cu „extras din planul
  cadastral, pe ortofotoplan". Denumirea primește prefixul `plan`
  (`plan cf 108650 - Medgidia-Constanta.pdf`) — el citește serviciul din nume.
  ⚠️ Prima cerere de plan depusă trebuie validată de Mircea (formatul e derivat,
  nu modelul lui).
- **Identificările** pornesc de la adresă/proprietar, fără CF — nu au ce depune
  până nu identifică imobilul. El raportează CF-ul găsit în portal („Am
  identificat imobilul": județ + UAT + nr. CF/cadastral →
  `POST /api/collaborator/orders/[id]/identificare`, salvat în
  `customer_data.identified_property`, NICIODATĂ peste `property`-ul
  clientului), iar platforma îi generează pe loc cererea de extras CF (Anexa 6)
  din datele raportate — după identificare are nevoie de extras ca să livreze.
  Județul se validează pe nomenclatorul ANCPI (antetul OCPI/BCPI iese din el).
- **Antetul urmează județul imobilului** (decizie 21.08, revizuită în aceeași zi):
  `OFICIUL … IMOBILIARĂ <JUDEȚ>` / `BIROUL … IMOBILIARĂ <JUDEȚ>`, centrat, luat
  din județul ales de client în nomenclatorul ANCPI. La **București** biroul e
  exact — BCPI-urile CHIAR sunt sectoarele, iar sectorul e în numele UAT-ului
  („București Sectorul 6" → `BIROUL … SECTORUL 6`).
  ⚠️ **BCPI-ul nu e unul per județ** (Cluj are Cluj-Napoca, Turda, Dej, Gherla,
  Huedin; Ilfov are Buftea și Cornetu). ANCPI nu publică maparea UAT → BCPI
  într-o formă utilizabilă, iar nomenclatorul de la ei pe care îl avem ține doar
  județ → UAT (3185 de intrări, fără birou). Adresăm deci biroul județean;
  dacă un birou secundar e competent, topograful corectează. `ocpi-header.ts`.
- **Serie CI / CNP rămân goale**, iar scopul e mereu „informare" — la fel ca în
  cererile pe care le depune azi.
- **Județul se scrie lângă localitate** („Otopeni, jud. Ilfov"): Anexa 6 NU are
  câmp de județ pentru imobil, iar cererea se depune la Satu Mare pentru imobile
  din toată țara — fără el, funcționarul nu știe ce Drăgănești e (semnalat pe
  `E-260820-HRHDX` și `E-260820-YXEUS`). Excepție: sectoarele Bucureștiului, care
  îl au deja în nume. Liniile fiind exact la marginea din dreapta, valorile mai
  lungi scurtează automat punctele de umplutură (`cerere-line-fit.ts`) — textul
  formularului nu se pierde niciodată.
- **Localitatea CF = UAT-ul.** Wizardul cere doar UAT-ul, nu satul de pe carte
  (în exemplul lui: UAT Odoreu, CF a localității Eteni). Dacă devine o problemă
  la ghișeu, ne trebuie un câmp separat în wizard.
- **Coliziunile de denumire** primesc `friendly_order_id` în paranteză: două
  comenzi pot avea legitim același CF, iar un ZIP care suprascrie ar pierde o
  lucrare plătită. Se întâmplă în date reale (424643-C1-U1, Moșnița Nouă, două
  comenzi).
- **`normalizeCfForCerere`, nu `normalizeCf`.** Cea din `cf-format.ts` șterge
  toate spațiile interne — pe valorile reale tastate de clienți („431001 C1 U2",
  „41971 Moara") ar scrie pe cerere `431001C1U2` și `41971MOARA`. Cea nouă
  repară doar ce e neambiguu (separatoare, localitatea lipită după număr) și
  altfel lasă valoarea verbatim.
- **Prefixul `verifica `** pe denumire = singurul caz în care VREM să deschidă
  cererea: carte funciară veche (cu `/`), text liber, CF colectivă, sau un CF de
  1–3 cifre (pe `E-260803-KLJAW` clientul a pus „1" la carte funciară și
  identificatorul real, `175587-C1-U9`, la cadastral). La rularea peste cele 109
  comenzi în așteptare: **117 cereri generate, 0 eșecuri, 0 nume duplicate, 7
  marcate**.
- Costul eliberării se scrie în `order_supplier_costs` (`ANCPI` /
  `taxa_institutie`), deci intră direct în marja pe comandă și în raportul de
  costuri furnizori. Se precompletează din `taxe-eliberare.ts`, pe serviciu:
  **20 lei** extras CF (cod 2.7.6), **15 lei** extras din planul cadastral
  (cod 2.7.7). Formularul de depunere apare la orice serviciu cu taxă cunoscută,
  chiar dacă nu-i generăm cererea.

## Ordinea de lucru

`priority DESC, created_at ASC`, peste tot (listă, ZIP): întâi comenzile marcate
urgent din admin, apoi cea mai veche. Coloana „Așteaptă" arată vechimea, roșu
peste 21 de zile. Lista are filtre pe etapă, județ și căutare liberă, iar
filtrul de județ se propagă în ZIP — el depune pe județe.

## Predarea către topograf (21.08, executată)

| Acțiune | Rezultat |
|---|---|
| Serviciul `extras-carte-funciara` alocat colaboratorului | 109 comenzi îi apar în portal |
| Cele 109 `ancpi_jobs` `FAILED` → **`NEEDS_OPERATOR`** | niciun retry automat; NU pe `PENDING`, ar însemna dublă depunere/plată |
| `HANDED_OVER_TO_COLLABORATOR = true` în `ensure-ancpi-job.ts` | comenzile NOI nu mai intră în coada worker-ului |

Script: `scripts/handover-extras-cf-to-topograf.cjs` (idempotent).

**Când revine portalul ANCPI:** pune flagul pe `false` ȘI decide ce se întâmplă
cu lucrările aflate la topograf — altfel worker-ul depune peste el.

## Rămas de făcut

- De reconfirmat cu Mircea: serie CI / CNP goale, și localitatea de pe cartea
  funciară (noi punem UAT-ul).
- ZIP-ul e plafonat la 100 de comenzi per descărcare (117 cereri în așteptare →
  două apăsări).
- La comenzile cu două imobile, primul PDF încărcat livrează deja comanda
  (`document_ready` + e-mail); al doilea re-rulează livrarea. De încărcat ambele
  extrase înainte, dacă nu vrem două notificări.
