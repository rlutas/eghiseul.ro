# Costuri furnizori & marjă — cum funcționează (ghid echipă)

**Ce e:** un sistem intern (doar echipa îl vede) prin care înregistrăm pe
fiecare comandă cât ne-a costat PE NOI munca unui colaborator (traducător,
notar, apostilă, curier). Așa vedem profitul real per comandă și, la sfârșit
de lună, cât datorăm fiecărui furnizor — ca să combatem factura lui.

Livrat 2026-07-23. Vizibil doar rolurilor cu drepturi (nu apare la avocat).

> **⚡ Actualizat 2026-07-29** — sistemul nu mai așteaptă să-ți amintești tu de el:
> întreabă singur la finalizarea comenzii. Vezi secțiunea 0 și 2b. Motivul
> schimbării: de la livrare până pe 29 iulie s-au înregistrat **0 costuri** —
> cardul apărea pe toate comenzile, inclusiv pe cele fără niciun furnizor, deci
> nu-l completa nimeni. Detalii: `docs/changelog/2026-07-29-costuri-interne-pe-comanda.md`.

## 0. Ce s-a schimbat pe 29 iulie (citește întâi asta)

- **Cardul apare doar unde chiar avem un cost**: traducere, legalizare, apostilă
  notarială, supralegalizare, copie legalizată, serviciu extra — plus **taxele
  ONRC și ANCPI**, care înainte nu erau urmărite nicăieri. Un cazier simplu cu
  urgență nu mai afișează nimic.
- **Apostila de la Haga nu se trece nicăieri** — pe noi ne costă 0. Rămâne însă
  la „Încasat servicii", pentru că e venit real.
- **La finalizarea comenzii apare o fereastră** cu sumele de completat (secțiunea 2b).
- **Sumele vin pre-completate** din tarifele configurate (secțiunea 1b) sau din
  ultima sumă folosită pentru același serviciu.
- **Furnizorul e ales automat**: legalizare → Notar, apostilă notarială → Camera
  Notarilor, traducere → Traducător.
- **Pe comenzile cu două acte** (ex. cazier + certificat de integritate, fiecare
  cu traducerea lui) costul se cere **separat pe fiecare act**.

---

## 1. Întâi: adaugă furnizorii (o singură dată)

**Setări → tab „Furnizori"** (`/admin/settings`, nevoie de drept „Setări").

- Apeși **„Adaugă furnizor"**, scrii numele exact al firmei/persoanei
  (ex. `Firma Traduceri SRL`), alegi tipul (Traducător / Notar / Apostilă /
  Curier / Alt), lași „Activ" pornit, **Salvează**.
- Adaugă toți colaboratorii pe care îi plătești: firma de traduceri, notarul,
  eventual cine face apostilele.
- Numele contează — sub el se grupează totul în raportul lunar, deci scrie-l
  consecvent (nu „Traduceri SRL" azi și „firma trad" mâine).

## 1b. Tarifele (o singură dată, ca să nu mai tastezi sumele)

**Setări → Furnizori → cardul „Tarife furnizori"**. Două feluri:

- **pe pagină** (traducător, notar): prima pagină + fiecare pagină următoare.
  Ex. notar 45 + 5 → o legalizare de 3 pagini iese automat 55 lei.
- **sumă fixă pe serviciu** (ONRC, ANCPI): taxa pe care o plătim per document.

Cele 17 servicii ANCPI/ONRC sunt deja mapate, dar **fără sume** — se completează
după confirmarea de la furnizori. Până atunci sistemul folosește ultima sumă
introdusă manual.

⚠️ **Urgența ANCPI costă 5× tariful normal** (Ordin 16/2019). De aceea suma
rămâne editabilă pe fiecare comandă și nu se înregistrează automat.

## 2. Pe fiecare comandă: adaugă costul

Pe pagina comenzii (`/admin/orders/...`), în coloana din dreapta, cardul
**„Cost intern & marjă"**:

1. Alegi **furnizorul** (din lista de la pasul 1).
2. Alegi **categoria** (Traducere / Legalizare / Apostilă / Supralegalizare /
   Copie legalizată / Curier / Alt).
3. Scrii o **descriere** scurtă (ex. `Traducere cazier - Spaniolă`).
4. Pui **suma** în lei (cât ți-a facturat furnizorul pentru asta).
5. **+** → costul apare în listă.

Poți adăuga mai multe costuri pe aceeași comandă (ex. traducere de la
traducător + legalizare de la notar). Ștergi un cost cu coșul de gunoi.

**Marja se calculează automat** și apare în card:
- **Încasat servicii** = cât a plătit clientul pe serviciile cu valoare
  adăugată (traducere + legalizare + apostilă + servicii extra), NU prețul de
  bază al serviciului.
- **Cost intern** = suma costurilor pe care le-ai introdus.
- **Marjă** = Încasat − Cost (în lei și %). Verde = profit, roșu = pierdere.

## 2b. Fereastra de la finalizare (calea normală, de acum)

Când marchezi comanda ca **finalizată**, dacă are costuri neînregistrate apare
automat fereastra „Cât ne-a costat comanda X?", cu câte un rând per cost:

```
Traducere Autorizată · Italiană — Cazier Judiciar         [pagini: 2]  [ 180 ] lei
Legalizare Notarială — Cazier Judiciar                    [pagini: 3]  [  55 ] lei
Taxă ANCPI                                                             [  20 ] lei
```

Completezi sumele → **Salvează costurile**. Numărul de pagini recalculează
singur suma, cât timp n-ai scris tu una proprie.

**Dacă nu știi o sumă: „Completez mai târziu".** Comanda se finalizează normal,
iar ea rămâne în lista **„De completat"** din raportul lunar. **Nu inventa
cifre** — o sumă greșită e mai rea decât una lipsă, fiindcă nu se mai poate
verifica ulterior. Suma **0** e valabilă și se salvează ca atare: „am verificat,
n-a costat nimic" e altceva decât „n-am completat încă".

Fereastra apare doar la trecerea comenzii pe finalizat, nu de fiecare dată când
deschizi o comandă veche.

## 3. La sfârșit de lună: raportul per furnizor

**Meniu → „Costuri furnizori"** (`/admin/costuri-furnizori`, drept „Verificare
plăți").

- Alegi luna (sus, dreapta).
- Vezi **total lună** + câte înregistrări + câți furnizori.
- Pentru fiecare furnizor: câte lucrări, **total de plată**, și tabelul cu
  fiecare comandă (număr + client + categorie + descriere + sumă).
- Apeși pe numărul comenzii ca să sari direct la ea.

- Jos apare și **„De completat"**: comenzile finalizate în luna aceea care ar
  trebui să aibă un cost și n-au. Lista se calculează din comandă, nu dintr-un
  bifat manual, deci nu poate rămâne în urmă față de realitate.

Exact ce trebuie ca să iei factura traducătoarei și să verifici: „mi-a trecut
23 de traduceri, 1.035 lei — la mine în raport apar tot 23, 1.035 lei" ✅ / ❌.
Din 29 iulie, traducătoarea atașează pe fiecare document o notiță cu costul,
deci suma se ia de acolo, nu din memorie.

---

## Cine vede ce (drepturi)
- **Adăugat/șters cost pe comandă**: cine gestionează comenzi (operator,
  manager, super_admin).
- **Raportul lunar**: cine verifică plăți (contabil, manager, super_admin).
- **Gestionat lista de furnizori**: cine administrează setări (manager,
  super_admin).
- Avocatul NU vede nimic din astea.

## De ce ajută pe viitor
Orice serviciu nou care are costuri de la colaboratori (traduceri, apostile,
curieri speciali, alți furnizori) folosește EXACT aceeași infrastructură —
adaugi furnizorul o dată, înregistrezi costul pe comandă, vezi marja, ai
raportul lunar. Nu mai construim nimic separat.

## Tehnic (pentru dezvoltatori)
- Tabel: `order_supplier_costs` (migrația 136), service-role only.
- Lista furnizori: `admin_settings.suppliers`.
- Logica marjei (pură, testată): `src/lib/admin/supplier-costs.ts`.
- API: `/api/admin/orders/[id]/supplier-costs` (GET/POST/DELETE),
  `/api/admin/supplier-costs?month=YYYY-MM`.
- UI: cardul din `src/app/admin/orders/[id]/page.tsx`, tab-ul din
  `src/app/admin/settings/page.tsx`, pagina `src/app/admin/costuri-furnizori/`.
