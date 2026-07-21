# 2026-07-21 — Badge colorat pe serviciu în lista de comenzi (admin)

## Cerință
În `/admin/orders`, coloana „Serviciu" era text simplu, trunchiat și greu de
observat. Ca pe cazierjudiciaronline.com, serviciile principale primesc un badge
colorat ca operatorul să le diferențieze dintr-o privire.

## Implementare
`ServiceBadge` în `src/app/admin/orders/page.tsx` — culoare pe slug:

| Serviciu | Culoare | Clasă |
|---|---|---|
| Cazier Judiciar (PF/PJ) | albastru | `bg-blue-100 text-blue-800` |
| Cazier Auto | galben | `bg-amber-100 text-amber-800` |
| Cazier Fiscal | verde | `bg-emerald-100 text-emerald-800` |
| Certificat Integritate | mov | `bg-violet-100 text-violet-800` |
| Stare civilă (naștere/căsătorie/celibat) | roz | `bg-pink-100 text-pink-800` |
| restul (extras CF, constatator, identificare, rovinietă...) | gri neutru | `bg-neutral-100 text-neutral-600` |

Culorile judiciar/auto/fiscal/integritate = identice cu CJO
(`admin/orders/[id]/page.tsx` serviceTypeConfig). Roz = nou pentru stare civilă.

Alte modificări:
- „Cazier Judiciar Persoană Fizică/Juridică" **prescurtat** → „Cazier Judiciar
  PF" / „Cazier Judiciar PJ" (textul complet se tăia).
- Scos `max-w-[180px] truncate` de pe celulă → badge-ul se vede întreg,
  aliniat la stânga (mai vizibil).

## Timp relativ sub nr. comandă + dată scurtată
- Sub numărul comenzii apare acum **timpul relativ** de la plasare („acum 5
  zile", „acum 2h", „ieri", „chiar acum") — ca pe CJO. Helper nou
  `src/lib/relative-time.ts` (`formatRelative`, portat din CJO).
- Coloana „Dată" afișează doar `DD.MM` (fără an) — încape mai bine în rând.
  „Termenul" era deja scurt (DeadlineCell = DD.MM).
