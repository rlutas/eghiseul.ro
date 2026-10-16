# 16.10.2026 — Cursul BNR afișa cursul de rezervă: BNR a mutat fișierul cu cursuri
<!-- categorie: seo -->

## Pentru echipă

- Pagina **Curs valutar BNR** și comutatorul €/Lei din calculatoare nu mai arătau cursul zilei: tabelul era gol, iar calculatoarele foloseau un curs fix de 5,07 lei/EUR.
- Cauza: BNR a mutat adresa de unde se iau cursurile. Adresa veche trimite acum spre prima pagină a BNR, iar site-ul nostru nu își dădea seama că a primit altceva.
- **Acum** cursurile vin de la adresa nouă a BNR: toate cele 37 de valute, variația zilnică și graficele pe 10 zile.
- Dacă BNR mai schimbă ceva, eroarea apare în loguri, nu mai trece neobservată. Cursul de rezervă a fost actualizat la 5,33 lei/EUR.

---

## Tehnic

- `src/lib/bnr.ts`: `www.bnr.ro/nbrfxrates.xml` și `nbrfxrates10days.xml` răspund 302 → `https://www.bnr.ro/` (HTML, 200). `res.ok` trecea, regex-ul nu găsea nimic, deci `getBnrRates()` întorcea `{ date: null, rates: [], eur: 5.07 }` fără log.
- Feed-urile noi: `https://curs.bnr.ro/nbrfxrates.xml` și `https://curs.bnr.ro/nbrfxrates10days.xml`. Formatul XML e identic (aceleași `<Cube date>` / `<Rate currency multiplier>`), parserul nu s-a schimbat.
- Constanta `BNR_FEED_BASE`; `getBnrRates` aruncă la 0 rate, `getBnrHistory` la 0 `Cube`, deci ajung în `console.error`.
- `FALLBACK_EUR` 5,07 → 5,33 (BNR 16.10.2026: 5,3368).
- Verificat local: 37 valute, EUR 5,3368, 10 zile (05.10–16.10).
- Afectate: `/curs-valutar`, `/api/bnr-rate` (toggle €/Lei din calculatoarele taxe notariale, dobândă legală, grad îndatorare etc.).
