# 14.10.2026 — Admin: ce articole și calculatoare aduc comenzi
<!-- categorie: seo -->

## Pentru echipă

- În **Admin → Marketing** e un tabel nou, **„Ce pagini aduc comenzi (blog, calculatoare)”**: pentru fiecare articol sau calculator, câte comenzi au început și câte s-au plătit pornind de acolo, plus venitul. Se poate alege 7 / 30 / 90 de zile.
- Coloana **„Din click pe card”** arată câte au venit apăsând pe cardurile noi de servicii (banda de jos, cardul din dreapta, bara fixă pe telefon, caseta din text). Se măsoară de azi; restul sunt comenzi care doar au intrat pe site prin acel articol.
- Pe pagina fiecărei comenzi, la **„Proveniență client”**, apare acum și rândul **„Din conținut”**: articolul sau calculatorul de pe care a venit clientul și pe ce card a apăsat.
- Primul calcul, pe ultimele 30 de zile: „ANCPI nu funcționează” (8 începute, 4 plătite) și „Cum afli numărul de carte funciară” (11 începute, 3 plătite) sunt articolele care aduc cele mai multe comenzi.

---

## Tehnic

- `attribution.content` (`ContentClick`: page, placement, service, at) scris de `recordContentClick()` în `src/lib/analytics/attribution.ts`, apelat din `TrackedLink` la fiecare click pe card; ajunge pe comandă prin draft (`orders.attribution`, fără migrare).
- `src/lib/analytics/content-attribution.ts`: `contentSource()` (click > last.landing > first.landing, doar pagini de conținut), `contentKind()`, `PLACEMENT_LABEL`; teste în `tests/unit/lib/analytics/content-attribution.test.ts`.
- `GET /api/admin/marketing/content?days=` (settings.manage) + `ContentAttributionCard` în `/admin/marketing`; rândul „Din conținut” în `admin/orders/[id]`. Documentat în `docs/technical/specs/lifecycle-emails.md`.
- `attribution-channel.ts` (copiat și pe CJO) nu a fost atins.
