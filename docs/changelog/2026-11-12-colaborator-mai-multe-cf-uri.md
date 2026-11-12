# 12.11.2026 — Portal colaborator: comenzile cu mai multe cărți funciare se văd de sus
<!-- categorie: comenzi -->
<!-- audienta: colaborator -->

## Pentru echipă

Când un client cere mai multe extrase pe aceeași comandă, în portalul
topografului caseta **„Date pentru lucrare”** arăta doar primul imobil. Celelalte
apăreau abia mai jos, la lista de cereri, și puteau fi scăpate din vedere.

Acum:

- în **„Date pentru lucrare”** apare un avertisment galben: „Atenție: comanda
  are 2 imobile — 2 cărți funciare de lucrat”;
- fiecare imobil are rubrica lui, **CF 1**, **CF 2** și tot așa, cu numărul de
  carte funciară, numărul cadastral sau topografic, UAT-ul și satul;
- în **lista de comenzi**, lângă codul comenzii apare eticheta **„2 CF”**
  (sau câte sunt).

La comenzile cu un singur imobil nu se schimbă nimic. Cererile de depus la OCPI
rămân câte una pe imobil, ca până acum.

---

## Tehnic

Primul imobil stă pe `customer_data.property`, restul în
`property.additionalImobile`; pagina citea doar câmpurile de pe `property`.

- `src/lib/ancpi/imobile-for-work.ts`: `imobileForWork(property)` întoarce
  toate imobilele, numerotate de la 1. Rândurile adăugate și lăsate goale se
  sar (aceeași regulă ca `cereriForOrder`); un imobil suplimentar fără UAT ia
  UAT-ul principal.
- `colaborator/orders/[id]/page.tsx`: blocuri „CF n din N” când sunt cel puțin
  două; `colaborator/orders/page.tsx`: eticheta „N CF”.
- Teste: `tests/unit/lib/ancpi/imobile-for-work.test.ts`.

Verificat pe date reale prin funcție (o comandă cu 2 imobile, una cu 9), nu în
browser: portalul cere cont de colaborator.
