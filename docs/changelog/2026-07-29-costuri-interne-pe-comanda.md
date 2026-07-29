# 2026-07-29 — Costurile interne se cer când sunt cunoscute, nu pe fiecare comandă

Cardul „Cost intern & marjă" apărea pe **toate** comenzile, inclusiv pe un cazier
simplu unde nu plătim niciun furnizor. Rezultatul se vedea în date: de la livrarea
feature-ului, **0 costuri înregistrate**. Un formular care apare unde nu are sens nu
se completează nicăieri.

## Cardul apare doar unde chiar avem un cost

*Opțiune cu cost intern* = una pentru care plătim un terț.

| Opțiune | Cost intern | Declanșează |
|---|---|---|
| `traducere` | traducător | da |
| `legalizare`, `copie_legalizata` | notar | da |
| `apostila_notari`, `supralegalizare` | Camera Notarilor | da |
| `custom_extra` | orice | da |
| `apostila_haga` | **0** | nu |
| `urgenta`, `cetatean_strain`, `extras_*` | 0 | nu |

Apostila de la Haga nu ne costă nimic, deci nu declanșează cardul — dar **rămâne în
formula de venit**: pe o comandă cu traducere + Haga, cei 198 lei sunt venit real cu
cost zero, iar excluderea lor ar subestima marja.

## Taxele ONRC și ANCPI sunt tot costuri interne

Plătim taxa la fiecare document emis de workeri, iar până acum nu apărea nicăieri.
Ambele devin furnizori obișnuiți, cu categoria `taxa_institutie`: ONRC pentru
certificatul constatator, ANCPI pentru cele 16 servicii de carte funciară/cadastru.
Deci cardul apare acum și pe comenzile care n-au nicio opțiune.

Taxele **nu** se înregistrează automat în fundal: apar pre-completate, editabile.
Urgența ANCPI costă 5× tariful normal (Ordin 16/2019), iar un cost greșit scris
automat e mai greu de depistat decât unul confirmat de un om.

## Pop-up la finalizare

Se deschide la trecerea comenzii pe „finalizat", cu un rând per cost lipsă:

```
Traducere Autorizată · Italiană    [Traducător]        [pagini: 2]  [ 180 ] lei
Legalizare Notarială               [Notar]             [pagini: 3]  [  55 ] lei
Taxă ANCPI                         [ANCPI]                          [  20 ] lei
```

Furnizorul e dedus din categorie — legalizarea se face la notar, apostila notarială
la Camera Notarilor — deci operatorul nu îl alege de fiecare dată.

Declanșatorul e **tranziția de status**, nu un buton anume: comanda se poate finaliza
din secțiunea de procesare, din cardul AWB sau din dropdown-ul de status, iar un hook
pe buton ar rata tăcut calea adăugată data viitoare (aceeași capcană ca lista albă de
statusuri care făcea să dispară secțiunea de procesare). Pe comenzile deja finalizate
deschise din nou nu apare — ar deveni sâcâitor.

Se poate ieși cu **„Completez mai târziu"**. Blocarea strictă a fost respinsă
deliberat: când omul nu știe cifra, o inventează ca să poată închide comanda, iar
costuri false sunt mai rele decât costuri lipsă. Suma `0` e valoare validă și se
salvează ca atare — „am verificat, n-a costat nimic" e altceva decât „n-am completat".

## Costul se atribuie actului pentru care a fost cumpărat

O comandă poate conține două servicii: cazier judiciar + certificat de integritate.
Wizardul oferă opțiunile de traducere/legalizare/apostilă **pe fiecare dintre ele**
(`BUNDLED_OPTION_CODES` în `src/lib/services/bundled-options.ts`), iar opțiunile alese
sub al doilea serviciu se salvează cu `bundled_for.parent_option_id` = id-ul add-on-ului.

Deci fiecare opțiune spune deja singură pentru ce act a fost cumpărată, iar costurile
se atribuie exact așa:

```
Traducere Autorizată · Italiană — Cazier Judiciar          [ 180 ] lei
Traducere Autorizată · Italiană — Certificat Integritate   [ 180 ] lei
Legalizare Notarială — Cazier Judiciar                     [  55 ] lei
```

Dacă legalizarea e bifată doar pe cazier, se cere doar pentru cazier — nu inventăm
linii pentru acte care n-au opțiunea. Pe comenzile cu un singur serviciu nu apare
niciun sufix. Apostila de la Haga nu creează un act în plus: e o procedură aplicată
pe un act existent.

Se acceptă ambele forme ale metadatelor (`bundled_for` din DB și `bundledFor` din
API). Documentul se salvează în `order_supplier_costs.document_label` (migrarea 141),
deci raportul lunar arată pe ce act s-a lucrat — util la verificarea facturii
traducătoarei. Costul înregistrat pe un act nu îl ascunde pe celălalt.

## Echipa poate adăuga un serviciu pentru un anumit act

În dialogul de modificare a comenzii, „Serviciu extra (custom)" primește un selector
**„Pentru documentul"**, care apare doar când comanda are mai multe acte. Așa echipa
adaugă, de exemplu, „traducere legalizată maghiară" explicit pentru certificatul de
integritate: intră în plata suplimentară, iar la finalizare costul se cere pentru
acel act, nu pentru toate.

De ce prin serviciul extra și nu prin dublarea opțiunii din catalog: `toggleOption`
este pornit/oprit pe `optionId`, iar diferența de preț (`modify-diff.ts`) lucrează pe
mulțimi de coduri — două opțiuni `traducere` pe aceeași comandă ar fi fost numărate ca
una singură și clientul ar fi fost taxat greșit. Serviciul extra are preț propriu,
e deja proiectat pentru exact acest caz (exemplul din cod e „traducere legalizată
maghiară") și nu atinge calculul diferenței.

## Tarife, ca să nu se tasteze de fiecare dată

Setări → Furnizori, secțiune nouă. Două forme:

- **pe pagină** (traducător, notar): prima pagină + fiecare pagină următoare —
  ex. notar 45 + 5 → 3 pagini = 55 lei, recalculat live când schimbi numărul de pagini
- **fix per serviciu** (ONRC, ANCPI): sumă pe slug de serviciu

Ordinea de pre-completare: **tarif configurat → ultima sumă folosită pentru aceeași
combinație (furnizor, categorie, limbă) → gol**. Până se configurează tarifele,
sistemul învață din istoric; după, cifrele devin exacte. Dacă operatorul scrie o sumă
proprie, schimbarea numărului de pagini nu i-o mai suprascrie.

## Ce a rămas de completat

Listă în `/admin/costuri-furnizori`: comenzi finalizate în lună care ar trebui să aibă
cost și nu au. **Derivată, nu stocată** — niciun flag „completat" care să se
desincronizeze la prima ștergere de cost.

## Neschimbat

- CJO și ecazier: feature-ul lipsește acolo complet (nu apare greșit — nu există).
  Se portează după ce echipa folosește varianta de pe eghișeul; structura e diferită
  (coloane pe comandă, nu opțiuni JSON).
- Costurile rămân invizibile clientului, permisiune `orders.manage`.

Migrare 140 (furnizori canonici + `supplier_tariffs`), design:
`docs/plans/2026-07-29-costuri-interne-design.md`.
