# 02.11.2026 — Hub MAI scos de la stare civilă, împuternicirea semnată la distanță, originalul doar la cerere
<!-- categorie: seo -->

## Pentru echipă

- Paginile de certificat de naștere și de căsătorie nu mai trimit clientul pe Hub MAI. Hub-ul nu eliberează acte de stare civilă; varianta directă rămâne serviciul de stare civilă al oricărei primării.
- La cazierul fiscal, textul spune acum peste tot același lucru: avocatul depune cererea la ANAF pe baza împuternicirii avocațiale semnate la distanță. Nu mai apare „împuternicire civilă" și nici „doar contractul e suficient".
- La certificatul de integritate, la cazierul judiciar și la cazierul fiscal: clientul primește documentul scanat pe email; originalul pe hârtie îl trimitem prin curier doar dacă îl cere. Dacă un client întreabă „vine pe hârtie sau pe email?", răspunsul e: scanat pe email, originalul la cerere.
- Se aplică pe eGhiseul, documentero, CazierJudiciarOnline și ecazier.

---

## Tehnic

Decizii Raul, 02.11.2026.

**Hub MAI (stare civilă).** `PrivateServiceNotice` pe `/servicii/eliberare-certificat-de-nastere/` și
`/servicii/eliberare-certificat-de-casatorie/`: eticheta „la orice serviciu de stare civilă din țară",
link `https://depabd.mai.gov.ro/` (DGEP) în loc de `hub.mai.gov.ro`. documentero: scoasă fraza „Hub-ul MAI
dă ca medie 3 zile lucrătoare" din `/certificat-de-nastere/` și `/ghiduri/certificat-de-nastere-pierdut/`;
comentariul din `src/lib/documentero/content.ts` și JSDoc-ul `PrivateServiceNotice` curățate. Mențiunile
Hub MAI pentru cazier judiciar, cazier auto și integritate rămân. Tabela `services`: doar `cazier-judiciar`
pomenește Hub-ul. CJO/ecazier: nicio mențiune Hub la stare civilă.

**Împuternicire cazier fiscal.** eghiseul `/cazier-fiscal-fara-spv/` și documentero `/cazier-fiscal-online/`:
„împuternicire avocațială semnată la distanță". CJO/ecazier: aceeași formulare pe `/cazier-fiscal-online`
(+ `FiscalIntentMatchBlock`), `/verificare-cazier-fiscal-online`, `/cazier-fiscal-persoana-juridica`,
`/valabilitate-cazier-fiscal`, `/cazier-fiscal-vs-cazier-judiciar`, `/cazier-fiscal-pentru-cetatean-strain`,
`/ppc/cazier-fiscal`, ecazier `/cazier-fiscal`; `/acte-necesare-cazier-judiciar` nu mai spune că semnătura pe
contract e suficientă fără împuternicire.

**Livrare.** Integritate (eghiseul + CJO), cazier judiciar și cazier fiscal (eghiseul, documentero, CJO):
„Scan + original / Email și curier" și „Pe hârtie: ... avocatul îl ridică" înlocuite cu „scan pe email;
originalul prin curier, la cerere".

Date: `DATE_MODIFIED` + `last-modified.ts` pe `/servicii/cazier-judiciar-online/` și `cazier-fiscal-fara-spv`;
restul paginilor aveau deja 2026-11-02.
