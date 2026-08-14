# 2026-08-14 — Cazier auto & certificat integritate: doar împuternicire, fără cerere de eliberare

Semnalat de Raul: pe comenzile de **cazier auto** și **certificat de integritate
comportamentală** apărea butonul „Cerere eliberare PF" — dar aceste două
documente se ridică DOAR pe baza împuternicirii, nu au formular de eliberare.

## Cauza

Nici `cazier-auto`, nici `certificat-integritate` nu au folder propriu în
`src/templates/`, deci cererea cădea pe fallback-ul
`templates/shared/cerere-eliberare-pf.docx` — **formularul de cazier judiciar**.
Cu alte cuvinte, butonul producea un document greșit, pe care echipa îl vedea în
lista de documente și trebuia să-l ignore.

Situația din DB înainte de fix: 6 cereri `cerere_eliberare_pf` generate pe
comenzi de integritate; pe cazier auto (11 comenzi) niciuna.

## Fix — eghiseul.ro

`src/lib/documents/cerere-items.ts`:
- `SERVICES_WITHOUT_CERERE = { cazier-auto, certificat-integritate }`;
- `computeCerereItems()` întoarce **listă goală** pentru ele (înainte punea mereu
  serviciul principal ca item 0);
- **excepție deliberată**: opțiunea `addon_cazier_judiciar` (există doar pe
  certificat integritate) adaugă cererea de **cazier judiciar** ca item secundar,
  pe template-ul `cazier-judiciar` — comanda respectivă chiar are nevoie de ea
  (1 comandă reală în DB).

Consumatori:
- UI „Procesare comandă" — `generableDocTypes` scoate ambele tipuri de cerere
  (PF și PJ) când lista de cereri e goală; documentele generate în trecut rămân
  vizibile în lista de „alte documente", nu se pierde nimic;
- `POST /api/admin/orders/[id]/generate-document` — gardă server-side, HTTP 400
  pe orice template `cerere-eliberare*` când comanda nu are cerere (butonul
  ascuns nu e suficient — un POST direct trecea).

Setul de documente rămâne neschimbat în rest: `contract-prestari` +
`contract-asistenta` + `imputernicire` + numărul de Barou (ambele servicii sunt
în continuare prin avocat — vezi `LAWYER_SERVICE_SLUGS`).

Test nou: `tests/unit/lib/documents/cerere-items.test.ts`.

## Fix — cazierjudiciaronline.com / ecazier

Fișier nou `src/lib/cerere-required.ts` cu `orderNeedsCerere(order)`:
`service_type` în `{cazier-auto, certificat-integritate}` → fără cerere, cu
aceeași excepție (`certificat-integritate` + add-on `cazier_judiciar = true`).

- `/(admin)/admin/orders/[id]` — tot cardul „Cerere ..." nu se mai randează;
- `POST /api/admin/cerere` — 400 cu același mesaj.

Test nou: `tests/unit/cerere-required.test.ts`.

## Documentație

- `docs/technical/specs/admin-document-system.md` — secțiune nouă „Servicii fără
  cerere de eliberare" + notă în tabelul de template-uri;
- CJO: `docs/technical/specs/cerere-pdf-system.md` — aceeași secțiune.

## Bonus: împuternicirile ieșeau pe antetul vechi

Semnalat de Raul în aceeași sesiune: toate împuternicirile generate arătau vechi,
deși pe cazierjudiciaronline.com antetul e cel nou (logo cabinet + bloc de contact
+ Baroul Satu Mare).

Cauza: `loadTemplate()` încearcă `src/templates/<slug>/imputernicire.docx` și abia
apoi `shared/`. Slug-urile reale din DB sunt `cazier-judiciar-persoana-fizica` /
`-persoana-juridica`, `cazier-auto`, `cazier-fiscal`, `certificat-integritate` —
**niciunul nu are folder propriu**, deci toate comenzile luau
`shared/imputernicire.docx`, rămas pe antetul vechi (text simplu, adresa veche
„Str. Aurel Popp, nr.2"). Folderul `cazier-judiciar/`, singurul cu antetul nou,
corespunde slug-ului legacy — 1 comandă, neplătită.

Fix: `shared/imputernicire.docx` sincronizat cu varianta cu antet (corp și
placeholder-e identice, verificat). Randare de control (LibreOffice) — identică cu
împuternicirea de pe CJO. Afectate: cazier judiciar PF/PJ, cazier auto, cazier
fiscal, certificat integritate.

Test de regresie: `tests/unit/lib/documents/imputernicire-antet.test.ts` (antet
prezent, cu imagini, fără adresa veche + identic cu `cazier-judiciar/`).

Împuternicirile de **stare civilă** nu se schimbă: sunt formularul oficial UNBR
„Anexa nr. II", alt document, cu antetul Baroului.

## Rămas de decis

Cele 6 cereri generate greșit pe comenzile de integritate sunt încă în
`order_documents` (+ S3). Nu au fost șterse — de confirmat cu Raul dacă le
curățăm (rândul din DB + fișierul), cum s-a procedat pe 12.08 cu documentele
avocațiale de pe serviciile topograf.
