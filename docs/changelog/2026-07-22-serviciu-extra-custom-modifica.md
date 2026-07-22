# 2026-07-22 — Serviciu extra CUSTOM în dialogul „Modifică" (v1)

## Ce face
Admin → comandă plătită → Modifică → secțiunea „Serviciu extra (custom)":
denumire liberă + preț (1–20.000 RON, TVA inclus). Intră în diff → link de
plată Stripe cu denumirea pe el (sumar/line-item/proformă/email) → după plată
rămâne pe comandă în selected_options (code `custom_extra`) — vizibil în admin,
pe contract și în istoric. Fără câmpuri completate = comportament identic cu
înainte (20/20 teste). Commit fc4d620.

## ⚠️ DE ÎMBUNĂTĂȚIT (cerință Raul — v2 de discutat)
v1 e minimal. Limitări cunoscute:
- **Un singur serviciu custom per modificare** — de discutat rânduri multiple.
- La un al doilea „Modifică", rândul custom existent nu apare vizibil în lista
  de opțiuni cât timp catalogul e încărcat (rămâne bifat în state și se
  retrimite corect, dar UI-ul nu-l arată) — limitare preexistentă a modului
  catalog.
- `describeChanges` afișează codul brut `custom_extra` (nu denumirea) dacă un
  custom vechi e scos la o modificare ulterioară.
- Nu există listă de servicii custom frecvente (ex. dropdown cu „traducere
  legalizată", „apostilă suplimentară" + preț presetat editabil) — ar reduce
  tastarea și typo-urile.
- De discutat: TVA/contabilitate pe denumiri libere (Oblio primește denumirea
  din sumar — de verificat cu contabilul dacă e ok pe proformă/factură).
