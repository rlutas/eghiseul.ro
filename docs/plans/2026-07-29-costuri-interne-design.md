# Costuri interne per comandă — design

**Data:** 2026-07-29
**Stare:** validat cu Raul, în implementare
**Context:** `docs/serviciu-traduceri-apostile/`, migrarea 136 (`order_supplier_costs`)

## Problema

Cardul „Cost intern & marjă" apare pe **toate** comenzile, inclusiv pe cele care nu
implică niciun furnizor (cazier simplu + urgență). Zgomot pe fiecare comandă, iar
rezultatul se vede în date: **0 costuri înregistrate** de la livrarea feature-ului.
Nimeni nu completează un formular care apare unde nu are sens.

## Decizii

### 1. Cardul apare doar unde există cost intern

*Opțiune cu cost intern* = una pentru care plătim un terț.

| Cod opțiune | Cost intern | Declanșează cardul |
|---|---|---|
| `traducere` | traducător | da |
| `legalizare` | notar | da |
| `apostila_notari` | Camera Notarilor | da |
| `supralegalizare` | Camera Notarilor | da |
| `copie_legalizata` | notar | da |
| `custom_extra` | orice | da |
| `apostila_haga` | **0** | nu |
| `urgenta`, `cetatean_strain`, `extras_*` | 0 | nu |

`apostila_haga` **rămâne în formula de venit** (`MARGIN_OPTION_CODES`): pe o comandă
cu traducere + Haga, cei 198 lei sunt venit real cu cost zero, iar excluderea lor ar
subestima marja. Doar că nu declanșează cardul singură.

`cetatean_strain` rămâne neatins la venit — comenzile de cetățean străin cer adesea
traducere sau legalizare, care declanșează cardul pe cont propriu.

### 2. Pop-up la finalizare, blocant cu ieșire

Suma e cunoscută la finalizare: traducătoarea și notarul spun prețul la predarea
lucrării. Deci momentul e corect.

Pop-up-ul apare la acțiunea de finalizare **doar** dacă comanda are opțiuni cu cost
intern fără cost înregistrat. Un rând per opțiune, cu contextul luat din comandă:

```
Traducere Autorizată · Italiană    [Traducător ▾]      [pagini: 2]  [ 180 ] lei
Legalizare Notarială               [Notar ▾]           [pagini: 3]  [  55 ] lei
Apostilă Notari                    [Camera Notarilor ▾][pagini: 1]  [  84 ] lei
```

Ieșiri: **Salvează și finalizează** sau **Completez mai târziu** (finalizează oricum).
Blocant strict a fost respins deliberat: când omul nu știe cifra, o inventează ca să
poată închide comanda, iar date false sunt mai rele decât date lipsă.

Suma `0` e valoare validă și se salvează ca atare — „am verificat, n-a costat nimic"
e altceva decât „n-am completat încă".

### 3. Furnizor implicit per categorie

Operatorul nu alege furnizorul manual; se preselectează din categorie:

| Categorie | Furnizor implicit |
|---|---|
| `traducere` | Traducător |
| `legalizare`, `copie_legalizata` | Notar |
| `apostila_notari`, `supralegalizare` | Camera Notarilor |

### 4. Grilă de tarife (Setări) — prima pagină + pagini suplimentare

Cheie nouă în `admin_settings`: `supplier_tariffs`. Per furnizor + categorie
(+ limbă, la traduceri):

```json
{ "supplier": "Notar", "category": "legalizare", "language": null,
  "firstPageRon": 45, "extraPageRon": 5 }
```

Pop-up-ul cere numărul de pagini și calculează: 3 pagini = 45 + 5 + 5 = 55 lei,
editabil dacă furnizorul a taxat altfel.

**Ordinea de pre-completare:** tarif configurat → ultima sumă folosită pentru aceeași
combinație (furnizor, categorie, limbă) → gol. Până confirmă echipa tarifele reale,
sistemul merge pe istoric; după introducerea lor, cifrele devin exacte.

### 5. Taxele de instituție (ONRC, ANCPI) sunt tot costuri interne

Plătim taxa la fiecare document emis de workeri, iar azi nu apare nicăieri în
evidență. Se modelează ca furnizori obișnuiți, cu categoria `taxa_institutie`:

| Furnizor | Servicii | Formă tarif |
|---|---|---|
| ONRC | `certificat-constatator` | sumă per document |
| ANCPI | `extras-carte-funciara`, `extras-plan-cadastral`, `copie-*`, `identificare-*`, `certificat-sarcini`, … | sumă per serviciu, **×5 la urgență** |

Deci grila `supplier_tariffs` are două forme:

1. **per pagină** (traducător, notar, Camera Notarilor): `firstPageRon` + `extraPageRon`
2. **fix per serviciu** (ONRC, ANCPI): `serviceSlug` + `amountRon`

Cardul apare, în consecință, și pe comenzile ONRC/ANCPI — regula devine: *serviciul
are taxă de instituție configurată* SAU *comanda are opțiuni cu cost intern*.

Taxele NU se înregistrează automat în fundal: apar ca rând **pre-completat** în
același pop-up, editabil. Urgența ANCPI (tarif ×5, Ordin 16/2019) ar strica orice
auto-înregistrare oarbă, iar un cost greșit scris automat e mai greu de depistat
decât unul confirmat de un om.

Tarifele oficiale ANCPI există în `src/lib/ancpi/tarife-oficiale.ts`, dar ca text
pentru echipă („20 lei online / 25 lei la ghișeu"), uneori ca formulă procentuală —
nu sunt numere, deci nu pot alimenta grila automat. Se completează o dată, manual,
cu ce plătim efectiv.

### 6. Comenzi cu costuri necompletate — derivat, nu stocat

Fără coloană nouă și fără flag: lista = comandă finalizată + are opțiuni cu cost
intern + n-are rânduri în `order_supplier_costs` pentru ele. Un flag stocat s-ar
desincroniza de realitate la prima ștergere de cost; derivarea nu poate minți.

Afișată în `/admin/costuri-furnizori`, cu completare direct din listă.

## Ce NU facem

- Nu blocăm finalizarea (vezi 2).
- Nu adăugăm coloane pentru starea „completat" (vezi 5).
- Nu portăm pe CJO/ecazier în acest pas — feature-ul lipsește acolo complet, iar
  structura e diferită (coloane pe comandă, nu opțiuni JSON). Se portează după ce
  echipa folosește varianta de pe eghișeul.

## Permisiuni

`orders.manage`, ca pe endpoint-ul existent `/api/admin/orders/[id]/supplier-costs`.
Costurile interne rămân invizibile clientului.
