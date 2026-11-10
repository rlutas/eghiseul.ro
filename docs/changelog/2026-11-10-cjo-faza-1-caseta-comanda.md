# 10.11.2026 — CJO: casetă de comandă pe ghidurile care aduc trafic; recenziile rămân fără marcaj
<!-- categorie: seo -->

## Pentru echipă

- Pe cinci ghiduri de pe CazierJudiciarOnline.com care apar sus în Google, dar nu aduceau comenzi, apare acum o casetă scurtă: „Nu vrei să mergi la ghișeu? Îl obținem noi.” Caseta arată prețul, termenul și un buton spre formular. Ghidurile sunt: modelul de cerere, reabilitarea, după cât timp se șterge cazierul, valabilitatea și cazierul pentru angajare.
- Dacă un client spune că a ajuns la noi „de pe pagina cu modelul de cerere”, așa a ajuns.
- Stelele cu recenzii Google NU se mai pun înapoi în rezultatele Google pentru CJO. Regulile Google nu permit asta pentru recenzii luate de pe profilul Google al firmei. Recenziile rămân vizibile în pagină, doar că Google nu le mai arată ca stele.

Planul complet: [plan de creștere organică](../seo/2026-11-10-plan-crestere-organic/README.md).

---

## 1.5 — caseta de comandă (commit CJO `d6426af0`)

`src/components/sections/OrderShortcutBox.tsx`, componentă de server, cu link simplu spre `/#formular`. Prețul și termenele vin din `judiciarConfig.pricing` (198 lei; 3–5 zile; urgent 1–2 zile). Disclaimerul vine din `siteConfig.legal.disclaimerShort`. Fiecare ghid are o frază proprie (`lead`). Caseta stă după prima secțiune de conținut, nu în hero, ca să nu taie răspunsul pe care l-a căutat cititorul.

Pagini: `/cerere-cazier-judiciar-model`, `/ghid-reabilitare-cazier`, `/dupa-cat-timp-se-sterge-cazierul`, `/valabilitate-cazier-judiciar`, `/cazier-judiciar-pentru-angajare`.

Indicator: `begin_checkout` cu `landing` pe aceste cinci pagini. Atribuirea există pe CJO din 06.10. Eșec dacă după 4 săptămâni nu e nicio comandă de pe ele.

## 1.6 — marcaj de recenzii: anulat

Ghidul Google pentru fragmentele cu recenzii (`developers.google.com/search/docs/appearance/structured-data/review-snippet`, citit pe 10.11) exclude trei lucruri:
- „Don't aggregate reviews or ratings from other websites.” Recenziile noastre sunt copiate de pe profilul Google eGhișeul.ro.
- Recenziile despre o firmă, puse pe site-ul aceleiași firme, inclusiv prin widget de Google Business, fac pagina neeligibilă pentru stele (regula „self-serving”).
- `Service` nu e tip eligibil. Pe `Product`, recenziile trebuie să fie despre acel produs, nu despre firmă.

Marcajul ar fi fost „structured data spammy”, adică risc de acțiune manuală imediat după spam update. Commit-ul CJO `5c665293` (02.11) scosese schema exact pe acest motiv. Recenziile rămân vizibile în pagină, fără schema.
