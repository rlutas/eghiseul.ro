# 14.10.2026 — Extras CF: comuna și satul, în câmpuri separate
<!-- categorie: comenzi -->

## Pentru echipă

- Clientul care comandă extras de carte funciară (sau alt serviciu pe imobil) alege acum **Județ → Comună / Oraș** din listă și completează **satul** într-un câmp separat, obligatoriu. Câmpul îi sugerează satele comunei alese (lista oficială INS), dar poate scrie și altceva (comune desființate, denumiri vechi). Dacă comuna are un singur sat, sau e un sector din București, câmpul se completează singur.
- Tot acolo poate trece, opțional, **strada și numărul** (la bloc: bl., sc., ap.) și **numele proprietarului din cartea funciară**. Strada apare în admin și la Mircea.
- În portalul colaboratorului și în admin nu mai scrie „Localitate” la comună: apar separat **„Comună / Oraș (UAT)”** și **„Sat / Localitate”**.
- Mircea vede acum și **numele celui care a comandat** („Solicitant”). Telefonul, emailul și CNP-ul nu ajung la el.
- De ce: comanda spunea „Drajna”, iar imobilul era în satul Podurile, comuna Drajna. Un număr de CF vechi se poate repeta în sate diferite ale aceleiași comune, deci fără sat se poate scoate extrasul greșit.
- Comenzile vechi nu au satul. Dacă lipsește și numărul pare ambiguu, întrebați clientul înainte să scoateți extrasul.

Fișa serviciului: [Extras de carte funciară](../admin/servicii/extras-carte-funciara.md).

---

## Tehnic

- `PropertyDataStep`: „Localitate / UAT” → „Comună / Oraș”; câmp nou „Sat / Localitate” (`property.imobilLocality`, câmpul existent al convenției, mutat din cardul convenției în „Localizare imobil”), obligatoriu în `isFormValid`; „Numele proprietarului din cartea funciară” (`property.ownerName`) opțional pe tabul CF, ascuns când convenția îl cere deja (`beneficiaryName`).
- Sugestii: `src/lib/ancpi/sate-per-uat.json` (3.177 din 3.185 UAT-uri ANCPI; lipsesc cele 6 sectoare + 2 nepotrivite la nume), construit cu `scripts/build-sate-per-uat.py` din SIRUTA_s1 2026 (INS, data.gov.ro, CC BY 4.0); `<datalist>`, JSON încărcat cu `import()` doar pe pas (~80 KB gzip). Schimbarea județului/comunei golește satul.
- De ce satul și nu altceva: ePay cere doar județ + UAT + un identificator. CF-ul electronic e numerotat pe UAT (Ord. ANCPI 700/2014 art. 8, păstrat de 600/2023), dar cărțile vechi din zona Decretului-lege 115/1938 erau numerotate pe sate (art. 2), deci „CF vechi 123” se poate repeta în același UAT. Satul și proprietarul aleg rândul corect dintre rezultate.
- „Strada și numărul” opțional (`property.imobilStreet`) sub Sat, ascuns pe identificare (acolo e textarea de adresă); înlocuiește inputul de adresă care apărea doar la CF vechi (`propertyAddress` rămâne citit pentru comenzile vechi); scos din cardul convenției (generatorul îl citește din același câmp). Admin: eticheta „Strada și nr.”.
- Imobile suplimentare: `AdditionalImobil.imobilLocality` (opțional).
- Handoff spre Extras CF Colectiv duce și `imobilLocality`.
- `GET /api/collaborator/orders/[id]`: `customer_data.requester_name` = firma (PJ) sau numele (personal → billing → contact, `identifiableName`). Doar numele.
- Admin `PROPERTY_LABELS` + rezumatul imobilelor suplimentare: UAT și Sat separat.
- Fără migrare DB (totul stă în `customer_data.property`).
