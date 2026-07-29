# 2026-07-29 — Motivul pe împuternicirea de apostilă + data plății în lista de comenzi

Două semnalări de la echipă, ambele verificate pe date și pe documente generate.

## 1. „Motivul solicitării" nu are ce căuta pe apostila de la Haga

Împuternicirea ieșea așa:

> …să se prezinte la INSTITUȚIA PREFECTULUI - JUDEȚUL SATU MARE, în vederea aplicării
> Apostilei de la Haga pe Cazier Judiciar. **Motivul solicitării: ALTE MOTIVE.**

Motivul ține de actul de bază (de ce ceri cazierul), nu de apostilare — prefectura
aplică apostila indiferent de motiv. Pe delegația de apostilă a fost scos, inclusiv
când apostila se aplică pe un act adăugat ca add-on. Pe restul delegațiilor rămâne.

### Defect mai vechi, găsit generând documentul

Testul pe DOCX real a arătat că motivul apărea **de două ori** pe fiecare
împuternicire de cazier:

> …ridicării Cazier Judiciar. Motivul solicitării: ALTE MOTIVE**., motivul
> solicitării: ALTE MOTIVE**

O dată din `{{INSTITUTIE}}` (adăugat în cod de `buildInstitutie`) și o dată din textul
fix „, motivul solicitării: {{MOTIV}}" din șablon. În poza trimisă de echipă nu se
vedea, fiind tăiată exact înainte.

Fraza a devenit **un singur tag**, `{{MOTIV_FRAZA}}`, care poate lipsi cu totul și
care poartă și punctul final — altfel rezulta „Cazier Judiciar**., **motivul". Două
șabloane au fost editate o dată pentru asta (`cazier-judiciar` și `shared`, unde
textul era fix); restul folosesc `ACTIVITATI_SC` și nu au fost atinse.

Verificat prin generare efectivă:

| Caz | Rezultat |
|---|---|
| apostilă Haga | `…Apostilei de la Haga pe Cazier Judiciar.` — fără motiv |
| serviciu principal | `…ridicării Cazier Judiciar, motivul solicitării: ALTE MOTIVE.` |
| apostilă pe add-on (bundled) | fără motiv, cu actul corect |
| extras CF (șablonul `shared`) | punctuat corect |

## 2. Lista de comenzi arăta data începerii, nu a plății

`E-260723-HM6X7` apărea „acum 6 zile" deși plata intrase în aceeași dimineață:
comanda fusese **începută pe 23 iulie** și **plătită pe 29, la 06:21**.

Sortarea era deja pe `paid_at` — se rezolvase în trecut exact aceeași confuzie — dar
câmpul **nu era selectat în API**, deci interfața nu-l avea de unde afișa și rămăsese
pe `created_at`. De aici contradicția: comanda apărea corect în capul listei, cu o
dată veche lângă ea.

Acum data din coloană și timpul relativ de sub numărul comenzii vin din momentul
plății; comenzile neplătite rămân pe data începerii, cu tooltip care spune asta. Când
cele două zile diferă, data poartă un `*` discret și tooltipul le arată pe amândouă —
informația că un client a stat câteva zile până a plătit rămâne utilă pentru
recuperarea coșurilor.

Pe pagina comenzii, lângă „Creata" apare acum **„Plătită"**, evidențiat.

**Nu era caz izolat:** 12 comenzi au fost plătite la cel puțin o zi după ce au fost
începute, deci pentru toate data afișată inducea în eroare.
