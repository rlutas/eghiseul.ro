# Update articol ANCPI — status la zi (ziua 13 de blocaj)

**Data:** 2026-07-26
**Fișier:** `src/app/ancpi-nu-functioneaza/page.tsx`

## Context

Articolul `/ancpi-nu-functioneaza/` e o pagină de tip „status live" și era înghețat pe
informația din 20 iulie (migrare în Cloudul Guvernamental, termen estimat 22 iulie).
Între timp: 22 iulie a trecut fără repunerea serviciilor, iar pe 23 iulie premierul
Bolojan a estimat reluarea activității ANCPI „în cursul săptămânii viitoare" (27–31 iulie).
ANCPI nu a comunicat nicio dată fermă; cel mai recent anunț de pe ancpi.ro rămâne cel din 22 iulie.

Organic (GSC, export 20 iulie): 365 clicuri / 5.767 expuneri / CTR 6,33% / poziție medie 4,88
în primele ~4 zile de la publicare — pagina intră direct în top 10 al site-ului. Pe query-uri
de tip „ancpi nu functioneaza" iese pe prima poziție. Miza update-ului e freshness: e exact
tipul de pagină în care conținutul vechi de 6 zile pierde încrederea și CTR-ul.

## Ce s-a schimbat

- **Contor zile de blocaj calculat la render** (`outageDayCount()`, referință 14 iulie,
  `revalidate = 3600`) — folosit în intro, în secțiunea de status și în update-ul de 26 iulie.
  Evită numărul scris de mână care se învechește în 24h.
- **DATE_MODIFIED / updatedLabel** → 26 iulie 2026; meta description rescrisă pe situația curentă.
- **Intro rescris:** ambele termene depășite (20 și 22 iulie), lipsa unei date ferme ANCPI,
  estimarea 27–31 iulie.
- **Cronologie:** două intrări noi — 23 iulie (estimarea Bolojan, marcată „Estimare guvern",
  devine cea mai recentă) și 22 iulie (termen migrare depășit fără repunere).
- **FAQ:** „Până când e picat ANCPI?" rescris pe estimarea 27–31 iulie + FAQ nou
  „Migrarea s-a terminat pe 22 iulie. De ce tot nu funcționează?".
- **Secțiunea Actualizări:** paragrafe noi pentru 26, 23 și 22 iulie.
- **Tabelul „ești în mijlocul unei tranzacții"**, rândul TVA 9%: avertisment că, și dacă ANCPI
  revine pe 28–30 iulie, rămân zile puține și o coadă națională de dosare amânate.

## Atribuire

Estimarea 27–31 iulie e **guvernamentală** (declarație Bolojan, 23 iulie), nu comunicat ANCPI —
formulat explicit ca atare în toate locurile din articol, ca să nu promitem un termen asumat.

## De urmărit

- La revenirea reală a sistemelor: update articol + eliberarea automată a cozii de comenzi CF.
- Export GSC nou după 26 iulie pentru evoluția reală a paginii (ultimul export e din 20 iulie).
