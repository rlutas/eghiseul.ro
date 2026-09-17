# 17.09.2026 — Comenzile din cont spun unde sunt și cine le ține
<!-- categorie: clienti -->

## Pentru echipă

Lista de comenzi din contul clientului e acum un card pe comandă, care răspunde
la trei întrebări, în ordinea asta:

1. **Unde e comanda** — statusul în română, plus **cine o ține acum**: „Lucrăm
   noi", „La instituție" sau „Depinde de tine". Și termenul, ca **dată** („marți,
   23 septembrie"), nu ca interval.
2. **Trebuie să facă ceva clientul** — dacă da, cardul se colorează și are un
   singur buton. Dacă nu, cardul stă liniștit.
3. **Unde-i sunt documentele** — link direct la documente, la factură și la
   urmărirea coletului.

**Ce se schimbă la telefon:**

- **„La instituție" e scris pe card.** Până acum, o comandă depusă la IPJ arăta
  la fel ca una la care nu începusem: „în curs". Omul suna să întrebe de ce
  durează. Acum scrie negru pe alb cine o ține.
- **Comenzile care așteaptă ceva de la client apar primele**, oriunde ar fi
  cronologic. Sunt cele 15 comenzi în „Așteptare client".
- **Termenul pe pauză e explicat, nu ascuns.** La „Blocată la instituție" scrie
  că termenul e pe pauză. Un termen care lipsește fără explicație se citește ca
  un termen ratat.
- **Factura se descarcă direct din listă.**

---

## Ce s-a livrat tehnic

Faza 4 din `docs/dashboard-client/PLAN.md`, plus decizia D4.

### D4: clientul vede toate stările, dar nu la fel

Reducerea listei ne-ar fi întors exact la ce aveam înainte de Faza 0: „În
așteptare" pentru o comandă plătită, depusă și expediată deopotrivă. Traducerea
există deja — `customer-status.ts` scrie toate cele 24 de stări în limbajul
clientului (20 din lista operatorului plus cele dinainte de plată).

Ce se reduce e accentul. `src/lib/orders/customer-next-step.ts` (nou, 16 teste)
adaugă peste fiecare status: **cine acționează** (`noi` / `institutia` / `tu` /
`nimeni`), ce urmează, și dacă lucrul chiar e blocat de client.
`needsCustomerAction` e adevărat pentru 4 stări din 24, iar una singură e „vie":
`standby`.

Testul de acoperire citește lista de statusuri a adminului: un status adăugat în
flux fără un „ce urmează" pică testul, nu ajunge tăcut în fața clientului.

### Termenul: o singură sursă

Cardul putea să-și calculeze singur data din `estimated_days`, în timp ce pagina
comenzii o calculează prin calculatorul care știe de weekenduri, sărbători,
ora-limită, urgență și tamponul de două zile. Ar fi fost **două date diferite
pentru aceeași comandă** — exact felul în care un tracker încetează să mai fie
crezut.

`GET /api/orders` rezolvă acum data la fel ca ruta de detaliu:
`estimated_completion_date` când există (234 din 439 de comenzi plătite în 120 de
zile), altfel același calcul. `estimatedReadyDate()` decide doar dacă se
afișează: la `on_hold_institution`, `standby` sau înainte de plată, întoarce
`null`, fiindcă o dată despre care știm că e greșită e mai rea decât niciuna.

### Restul

`GET /api/orders` mai întoarce: `paidAt`, `tracking`, `documentsAvailable`
(numărate dintr-un singur query pe toată pagina, doar rândurile marcate vizibile
clientului — 646 din 1468 de documente sunt interne), `invoiceIssued` și
`invoiceUrl`.

🔴 Prins pe drum: la orice eroare a API-ului, lista afișa clientului
**„[object Object]"** — codul vechi făcea `throw new Error(result.error)`, dar
ruta întoarce `error: { code, message }`. Acum e un mesaj în română. Tot acolo:
fetch-ul nu avea gardă de unmount.

Caseta albastră „Despre comenzi" a fost ștearsă — repeta ce spune fiecare card și
promitea notificări pe email pe care nu le controlăm din ecranul ăsta.

Build verde, 1918 teste.

### Rămase, mici și știute

- `GET /api/orders` are `limit` implicit 20 și lista nu are paginare. Azi
  maximul măsurat e 4 comenzi pe client.
- `validStatuses` din aceeași rută e o listă albă veche (fără `draft`, `paid`,
  `standby`, `shipped`): nu ne afectează, fiindcă nu filtrăm după status, dar o
  filtrare viitoare ar cădea tăcut pe „fără filtru".
