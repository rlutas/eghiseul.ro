# 12.11.2026 — Căutarea din lista de comenzi, reparată
<!-- categorie: admin -->

## Pentru echipă

Căutarea din „Comenzi” găsea greu sau deloc. Ce s-a schimbat:

- **Găsește și ciornele, și neplătitele.** Pe tabul „Toate”, căutarea trecea
  peste comenzile neterminate (ciornă, în așteptare, abandonată), deci un cod
  ca al unei comenzi abia începute „nu exista”. Acum, pe „Toate”, caută în
  absolut toate comenzile. Pe un alt tab, caută doar în tabul acela.
- **Numele complet merge.** „Popescu Ion” sau „Ion Popescu” găsesc clientul;
  înainte mergea doar un singur cuvânt.
- **Caută și în datele de facturare și în numele firmei**, nu doar la datele
  personale (comenzile de carte funciară și cele pe firmă țin numele acolo).
- **Nu mai sar rezultatele.** Când tastați repede, lista arăta uneori
  rezultatul unei căutări mai vechi. Acum rămâne mereu ultima căutare.
- Virgula sau paranteza în căsuță nu mai strică nimic.

Puteți căuta după: cod comandă, AWB, email, telefon, nume și prenume, nume de
firmă. Cifrele de pe taburi arată câte rezultate sunt în fiecare.

---

## Tehnic

- `src/lib/admin/order-search.ts`: `orderSearchTerms()` desparte fraza în
  cuvinte (max. 5) și scoate caracterele cu sens în filtrul PostgREST;
  `applyOrderSearch()` pune câte un `or(...)` pe cuvânt (grupurile se leagă cu
  AND). Câmpuri: 3 coloane + 8 căi JSON (`contact.email/phone`,
  `personal.firstName/lastName`, `billing.firstName/lastName/companyName`,
  `company.companyName`).
- `list/route.ts` și `counts/route.ts` folosesc același matcher (înainte lista
  căuta în 8 câmpuri, iar contoarele în 4). Cu text de căutare, tabul „Toate”
  nu mai aplică `notIn HIDDEN_FROM_DEFAULT`, nici în listă, nici în contor.
- `admin/orders/page.tsx`: răspunsurile vechi sunt ignorate (`fetchSeqRef`); la
  eroare lista se golește în loc să păstreze rezultatele dinainte.
- Teste: `tests/unit/lib/admin/order-search.test.ts`.

**Viteză.** Fiecare cale JSON costă ~110 ms pe interogare (JSON-ul comenzii e
mare), deci o căutare de un cuvânt rămâne la ~0,9 s, ca înainte, iar una de
două cuvinte ~1,8 s. Rezolvarea e o coloană de căutare precalculată pe
`orders` (migrare), nefăcută încă: cere aprobare pentru schimbare de schemă.
