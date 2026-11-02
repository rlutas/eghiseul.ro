# 02.11.2026 — Abandonuri nu mai arată clienții din Recuperare telefonică
<!-- categorie: clienti -->

## Pentru echipă

- Un client se sună dintr-un singur loc. Pe **eGhiseul** și pe **CazierJudiciarOnline**, lista **Abandonuri** ascunde clienții care sunt în **Recuperare telefonică**, au fost **sunați** în ultimele 60 de zile sau au bifă **„Nu a răspuns”**.
- Clientul e recunoscut după email sau telefon: dispar toate comenzile lui din Abandonuri, nu doar cea sunată. Când marcați un apel din Abandonuri, rândul dispare la reîncărcare.
- Deasupra listei scrie câte sunt ascunse. Bifa **„Arată și cele din recuperare telefonică”** le arată, cu eticheta „Sunat” sau „În Recuperare telefonică”. Pe ăștia nu-i sunați din Abandonuri.
- Când căutați un client, lista arată tot. Cifra de pe tabul „Neplătite” (eGhiseul) numără în continuare toate comenzile neplătite.
- Pe eGhiseul, un apel pe oricare comandă a clientului îl scoate și din „De sunat”: nu mai urcă o altă comandă a lui în listă.
- Procedura: [Recuperare telefonică](../admin/recuperare-telefonica.md).

---

Cerere echipă 12.10.2026, rămasă deschisă după eticheta „Sunat” din 13.10: „neapărat să faci pe ambele platforme ca ce intră la recuperare telefonică să dispară de la abandonuri, deoarece așa am sunat pe aceiași clienți”.

**Suprapunerea.**
- eGhiseul: „Abandonuri” din meniu = `/admin/orders?status=abandoned` (tabul „Neplătite”: toate `draft/pending/abandoned`). Coada `priority-calls` e un subset al ACELORAȘI comenzi (draft/abandoned ≤30 z, cu date dincolo de contact, cu nume, email real, neplătit între timp), un rând pe email. Deci fiecare rând din coadă era și rând în Abandonuri, plus celelalte comenzi ale clientului. La livrare: 179 din 1.093 comenzi neplătite țin de clienți sunați în ultimele 60 de zile. În plus, coada filtra sunații în SQL pe comandă (`phone_contacted_at is null`): dacă apelul era pe comanda cea mai nouă, o comandă mai veche a aceluiași client urca în „De sunat” (22 de comenzi în 30 de zile, create înainte de apelul pe altă comandă).
- CJO: Abandonuri = `abandoned_sessions` (sesiuni de formular, pas ≥2); Recuperare telefonică = `orders` `pending/abandoned` neplătite din 14 zile (au ajuns la Stripe). Același client are o sesiune neconvertită ȘI o comandă: înregistrări diferite, legate doar prin email/telefon. La livrare: 352 de sesiuni neconvertite din 90 de zile țin de clienți sunați în ultimele 60 de zile; toți cei 6 clienți din coada de azi fuseseră deja sunați.

**Regula (aceeași pe ambele).** Un rând din Abandonuri e ascuns când clientul lui (email normalizat sau ultimele 9 cifre ale telefonului) are un „claim”: `queue` (e în populația cozii, sunat sau nu, neplătit între timp), `called` (apel ≤60 z pe orice comandă, iar pe CJO și pe orice sesiune) sau `no_answer` (ultima bifă ≤60 z). Motivul cel mai puternic câștigă: called > no_answer > queue. Potrivirea rulează peste rândurile create în ultimele 90 de zile (citirea contactului din `customer_data` pe toate draft-urile vechi costă ~1 s la rece; un `or` cu 40 de condiții pe JSON a dat statement timeout). Fără ascundere: cu `search`, cu `includeRecovery=1`, pe CJO la sesiuni convertite și la filtrul „Convertite”.

**Paginare.** Cu rânduri ascunse, lista ia id-urile în ordinea listei (prefix `offset + limit + ascunse`, în bucăți de 1000), sare peste cele ascunse (`pickVisibleIds`), apoi citește pagina cu `.in('id', …)`. `total` = numărul exact cu filtrele minus ascunse. Pe CJO ordinea primește tie-breaker `id` ca paginarea să fie stabilă.

**Contoare.** Badge-ul tabului „Neplătite” (`/api/admin/orders/counts`) și „Coșuri abandonate” de pe dashboard rămân neschimbate (toate neplătitele); bara de deasupra listei spune câte sunt ascunse. KPI-urile din Recuperare telefonică (apeluri 7/30 z, recuperate, lei) nu se schimbă. Pe eGhiseul „nesunate în 7 zile” nu mai numără comenzile unui client sunat pe altă comandă.

**eGhiseul — fișiere.** `src/lib/orders/recovery-claims.ts` (pur: `buildClaimIndex`, `findClaim`, `isRecoveryQueueCandidate`, `pickVisibleIds`), `src/lib/orders/recovery-claims-loader.ts`, `src/app/api/admin/orders/list/route.ts` (filtrele într-o singură funcție `withFilters`, `includeRecovery`, `recoveryHidden`, `recovery_claim`), `src/app/api/admin/orders/priority-calls/route.ts` (eligibilitate prin `isRecoveryQueueCandidate`, apelurile clientului aplicate pe toate comenzile lui), `src/app/(eghiseul)/admin/orders/page.tsx` (bara + bifa + eticheta), `tests/unit/lib/orders/recovery-claims.test.ts`.

**CJO — fișiere.** `src/lib/recovery-claims.ts` (pur: aceleași funcții + `isInRecoveryQueue`, `sessionClaim`), `src/lib/recovery-claims-loader.ts` (coadă + `loadCallIndex` + bife), `src/app/api/admin/abandoned/route.ts`, `src/app/(admin)/admin/abandoned/page.tsx`, `tests/unit/lib/recovery-claims.test.ts`, notă în `docs/decisions/2026-11-02-abandonuri-fara-recuperare.md`.

Fără migrări.
