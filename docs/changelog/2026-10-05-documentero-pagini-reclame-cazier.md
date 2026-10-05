# 05.10.2026 — documentero.ro: pagini pentru reclame, cazier judiciar și cazier fiscal
<!-- categorie: comenzi -->

## Pentru echipă

- Pe documentero.ro se pot comanda acum și **cazierul judiciar (persoană fizică)** și **cazierul fiscal**, din două pagini făcute pentru reclame: documentero.ro/cazier-judiciar-online/ și documentero.ro/cazier-fiscal-online/.
- Prețurile sunt aceleași ca pe eghiseul (se citesc din aceleași setări din admin).
- Comenzile apar în admin ca toate celelalte, cu platforma „documentero”; emailurile către client vin de la documentero.
- Paginile nu apar în Google organic. Sunt doar pentru trafic plătit, ca să nu concureze cu eghiseul și cazierjudiciaronline.

---

## Rezumat tehnic

- `DOCUMENTERO_SERVICE_SLUGS` (`src/lib/brand/brands.ts`) + `cazier-judiciar-persoana-fizica`, `cazier-fiscal`; fallback-uri de preț în `src/lib/documentero/services.ts` (198 lei, 5 / 3 zile, valorile din DB la 05.10).
- Pagini noi `src/app/documentero/cazier-judiciar-online/` și `src/app/documentero/cazier-fiscal-online/`: `noindex: true` fix (nu depind de `DOCUMENTERO_INDEXABLE`), nu sunt în sitemap-ul documentero și nici în meniu. Conținut: disclosure „serviciu privat, nu Poliția/ANAF", variantele gratuite (ghișeu, hub.mai.gov.ro/ghiseul.ro, SPV), preț cu opțiuni din `service_options`, FAQ.
- Testul `brandSellsService` actualizat.
- Context: proprietarul deschide un cont Google Ads nou pe documentero; politica Google „Government documents and official services" poate respinge anunțurile — paginile spun exact ce vinde anunțul, fără variantă ascunsă.
