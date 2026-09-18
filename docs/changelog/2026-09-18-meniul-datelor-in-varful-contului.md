# 18.09.2026 — Datele clientului, ca meniu în vârful contului; tabul deschis se actualizează după popup
<!-- categorie: clienti -->

## Pentru echipă

Două lucruri văzute de Raul testând contul pe telefon.

**1. „Am completat în popup și nu apare la Datele mele."** Apărea în baza de
date, dar tabul deja deschis pe ecran (Profil, Adrese, Facturare) nu se reîncărca
după salvarea din popup — arăta ce era înainte. Acum, orice salvare din popup
reîmprospătează tabul deschis pe loc, fără reload.

**2. Secțiunea cu datele clientului e prima pe pagină, ca un meniu.** Patru
rânduri, mereu aceleași: Telefon de contact, Date personale, Adresă de livrare,
Date de facturare. Un rând necompletat deschide formularul în popup. Un rând
completat arată ce e salvat (numărul, numele, adresa, pe cine se facturează) și
duce în tabul unde se poate modifica. Procentajul apare doar cât timp lipsește
ceva; când e totul complet, secțiunea rămâne, cu titlul „Datele tale".

Dacă un client zice „nu găsesc unde îmi schimb telefonul": e primul rând de pe
pagina contului.

---

## Rezumat tehnic

### Tabul deschis nu se reîncărca

Fiecare tab (`ProfileTab`, `AddressesTab`, `BillingTab`…) își citește datele la
montare; `router.refresh()` din `ProfileStepDialog` re-randa doar componentele
de server (checklistul), nu remonta tabul. Fix: dialogul emite pe `window`
evenimentul `ACCOUNT_DATA_SAVED_EVENT` (`account-events.ts`) după salvare,
iar `AccountTabs` îl ascultă și incrementează o cheie pe conținutul tabului —
remontare, deci refetch. Verificat: pe `?tab=profile`, salvarea telefonului din
popup apare în tab fără reload.

### Meniul

- `profileCompleteness()` întoarce pe fiecare pas și `summary` (ce e salvat):
  telefonul, `formatPersonName(lastName, firstName)`, prima linie a adresei
  implicite, persoana/firma profilului de facturare implicit. Pagina contului
  citește pentru asta adresa implicită (`user_saved_data`, `data_type='address'`,
  `is_default` întâi) și profilul de facturare implicit, câte un rând.
- `ProfileChecklist`: toate cele 4 rânduri vizibile; rând `done` = `<Link>` către
  tabul lui (fără `&edit=1`), rând nefăcut = `<button>` care deschide
  `ProfileStepDialog`. Iconițe per pas, bifă verde pe cele făcute, textul de
  beneficiu pe două rânduri (`line-clamp-2`), valoarea salvată pe unul
  (`truncate`). Nu se mai ascunde la 100%.
- Pagina: checklistul e primul bloc pentru toată lumea, deasupra întrebării de
  onboarding; ramura care îl muta sub comenzi (D2) a dispărut — la 4 rânduri de
  52px nu mai împinge lista de comenzi sub fold.
- 2 teste noi pentru `summary`.

### Verificarea legăturilor cont → comandă → admin (cerută de Raul)

Testat local cu un cont de test (șters după): `/comanda/cazier-fiscal` pasul 1
preia email + telefon din cont, pasul 2 nume + CNP + data nașterii; draftul
`E-260918-T66KM` avea `user_id` al contului și `customer_data.contact/personal`
din cont; `GET /api/admin/orders/[id]` citește profilul după `user_id` și
pagina admin arată „Client înregistrat" + KYC cont. La `/submit`, profilul
primește telefon/nume/CNP/dată doar dacă lipseau.

**Gol rămas:** pentru un cont existent, comanda plătită NU copiază în cont
adresa de livrare, datele de facturare și actele din wizard —
`migrate_order_to_profile` + copierea S3 rulează doar în `register-from-order`
(cont nou). Urmează.
