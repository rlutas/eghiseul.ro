# 2026-07-29 — Factura scria „Chile" pe o comandă pentru Brazilia (a doua oară)

Raportat pe comanda `E-260728-YFHH2`: apostilă de la Haga pentru **Brazilia**, dar
factura `EGH-0194` tipărea „Apostilă de la Haga — **Chile**".

Aceeași manifestare ca incidentul `E-260714-WXGYQ` din 14 iulie, deși acela fusese
reparat (commit `a9a2c76`). Fixul de atunci era corect, dar incomplet: a rezolvat
**ce trimitem**, nu **ce reține Oblio**.

## Ce era corect deja

| Verificare | Rezultat |
|---|---|
| `orders.selected_options` în DB | `{"code":"apostila_haga","metadata":{"country":"Brazilia"}}` — corect |
| Numele trimis de aplicație la Oblio | `baseName` = „Apostilă de la Haga", fără sufix — corect |
| Fixul din 14 iulie (`a9a2c76`) | activ, cu teste verzi |

Nicăieri în lanțul nostru nu apărea „Chile".

## Cauza

Oblio ține un **nomenclator de produse cheiat pe `code`**. Când o linie de factură
trimite un `code` care există deja în nomenclator, Oblio **ignoră numele trimis și
tipărește numele memorat**.

Interogat direct prin API (`GET /api/nomenclature/products?code=...`):

| id | code | name memorat |
|---|---|---|
| 47105653 | `apostila_haga` | Apostilă de la Haga **— Chile** |
| 47105656 | `traducere` | Traducere Autorizată **— Engleză (UK)** |

Ambele intrări fuseseră salvate de Oblio **înainte** de fixul din 14 iulie, când încă
trimiteam numele cu sufixul de țară/limbă. Din acel moment, orice factură cu apostilă
sau traducere a purtat sufixul vechi, indiferent de țara reală a comenzii — inclusiv
după ce codul nostru începuse să trimită numele corect.

## Fix

**1. Liniile de opțiuni nu mai trimit `code`.** Fără cod, Oblio nu mai are ce potrivi
și folosește numele trimis. Codurile rămase pe factură sunt legate de comandă
(nr. comandă pe linia serviciului) sau de cupon (numele liniei conține oricum codul),
deci nu pot deriva de la o comandă la alta.

**2. Nomenclatorul Oblio, curățat.** API-ul Oblio expune doar `GET` pe produse, deci
redenumirea s-a făcut din interfață (Setări → Nomenclatoare → Produse), apoi a fost
confirmată prin API:

| cod | denumire acum |
|---|---|
| `apostila_haga` | Apostilă de la Haga |
| `traducere` | Traducere Autorizată |

Restul codurilor stabile erau deja curate: `legalizare`, `apostila_notari`, `urgenta`,
`extras_multilingv`, `extras_suplimentar`, `addon_certificat_integritate`.

Cele două măsuri sunt independente: chiar dacă una cedează, cealaltă ține numele corect.

**3. Gardă în teste.** Un test parcurge toate liniile generate pentru o comandă și
respinge orice `code` care nu e legat de comandă sau cupon — deci reintroducerea unui
cod stabil pe o linie de factură pică la CI, cu mesaj explicit. Verificat că garda
chiar devine roșie la regresie.

## cazierjudiciaronline.com — neafectat

Verificat: liniile de add-on din `src/lib/smartbill/build-invoice.ts` au nume
hardcodate fără țară/limbă și **nu trimit `code`**. Singurul cod e pe linia de
onorariu, `${order_number}-001`, unic per comandă.

## Rămâne așa

`EGH-0194` a fost emisă și trimisă la SPV. API-ul Oblio nu editează facturi emise, iar
un storno pentru un detaliu de denumire nu se justifică — decizie asumată de Raul.
