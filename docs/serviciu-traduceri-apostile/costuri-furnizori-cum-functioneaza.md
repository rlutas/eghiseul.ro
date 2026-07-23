# Costuri furnizori & marjă — cum funcționează (ghid echipă)

**Ce e:** un sistem intern (doar echipa îl vede) prin care înregistrăm pe
fiecare comandă cât ne-a costat PE NOI munca unui colaborator (traducător,
notar, apostilă, curier). Așa vedem profitul real per comandă și, la sfârșit
de lună, cât datorăm fiecărui furnizor — ca să combatem factura lui.

Livrat 2026-07-23. Vizibil doar rolurilor cu drepturi (nu apare la avocat).

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

## 3. La sfârșit de lună: raportul per furnizor

**Meniu → „Costuri furnizori"** (`/admin/costuri-furnizori`, drept „Verificare
plăți").

- Alegi luna (sus, dreapta).
- Vezi **total lună** + câte înregistrări + câți furnizori.
- Pentru fiecare furnizor: câte lucrări, **total de plată**, și tabelul cu
  fiecare comandă (număr + client + categorie + descriere + sumă).
- Apeși pe numărul comenzii ca să sari direct la ea.

Exact ce trebuie ca să iei factura traducătoarei și să verifici: „mi-a trecut
23 de traduceri, 1.035 lei — la mine în raport apar tot 23, 1.035 lei" ✅ / ❌.

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
