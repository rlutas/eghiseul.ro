# 14.10.2026 — Extras CF: comuna și satul, în câmpuri separate
<!-- categorie: comenzi -->

## Pentru echipă

- Clientul care comandă extras de carte funciară (sau alt serviciu pe imobil) alege acum **Județ → Comună / Oraș** din listă și **scrie satul** într-un câmp separat, obligatoriu.
- Tot acolo poate trece, opțional, **numele proprietarului din cartea funciară**.
- În portalul colaboratorului și în admin nu mai scrie „Localitate” la comună: apar separat **„Comună / Oraș (UAT)”** și **„Sat / Localitate”**.
- Mircea vede acum și **numele celui care a comandat** („Solicitant”). Telefonul, emailul și CNP-ul nu ajung la el.
- De ce: comanda spunea „Drajna”, iar imobilul era în satul Podurile, comuna Drajna. Un număr de CF vechi se poate repeta în sate diferite ale aceleiași comune, deci fără sat se poate scoate extrasul greșit.
- Comenzile vechi nu au satul. Dacă lipsește și numărul pare ambiguu, întrebați clientul înainte să scoateți extrasul.

Fișa serviciului: [Extras de carte funciară](../admin/servicii/extras-carte-funciara.md).

---

## Tehnic

- `PropertyDataStep`: „Localitate / UAT” → „Comună / Oraș”; câmp nou „Sat / Localitate” (`property.imobilLocality`, câmpul existent al convenției, mutat din cardul convenției în „Localizare imobil”), obligatoriu în `isFormValid`; „Numele proprietarului din cartea funciară” (`property.ownerName`) opțional pe tabul CF, ascuns când convenția îl cere deja (`beneficiaryName`).
- Imobile suplimentare: `AdditionalImobil.imobilLocality` (opțional).
- Handoff spre Extras CF Colectiv duce și `imobilLocality`.
- `GET /api/collaborator/orders/[id]`: `customer_data.requester_name` = firma (PJ) sau numele (personal → billing → contact, `identifiableName`). Doar numele.
- Admin `PROPERTY_LABELS` + rezumatul imobilelor suplimentare: UAT și Sat separat.
- Fără migrare DB (totul stă în `customer_data.property`).
