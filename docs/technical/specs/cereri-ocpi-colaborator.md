# Cereri OCPI generate pentru topograf (extras carte funciară)

**Status:** livrat 2026-08-21 · **Scope:** doar `extras-carte-funciara`

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
| `GET /api/collaborator/cereri` | ZIP cu tot ce are de depus (max 100 comenzi) |
| `POST /api/collaborator/orders/[id]/depunere` | nr. înregistrare + cost |
| `scripts/build-cf-cerere-pdf-template.ts` | builder-ul asset-urilor |

## Reguli de reținut

- **Doar extras CF.** Plan cadastral și identificare imobil folosesc alte
  formulare, pe care nu le avem — o comandă de tipul ăla nu trebuie să primească
  tăcut o Anexă 6. Ruta dă 400 pe orice alt slug.
- **Antetul rămâne OCPI/BCPI Satu Mare** (decizia lui, 21.08) — el depune de
  acolo indiferent de județul imobilului. Județul contează în **denumire**.
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
  cererea: carte funciară veche (cu `/`), text liber, CF colectivă. La rularea
  peste cele 109 comenzi în așteptare: **117 cereri, 6 marcate**.
- Costul eliberării se scrie în `order_supplier_costs` (`ANCPI` /
  `taxa_institutie`), deci intră direct în marja pe comandă și în raportul de
  costuri furnizori.

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
