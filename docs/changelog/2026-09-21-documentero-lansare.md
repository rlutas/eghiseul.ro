# 21.09.2026 — documentero.ro este LIVE pentru Google
<!-- categorie: seo -->

## Pentru echipă

documentero.ro, site-ul nostru doar pentru acte de stare civilă, e din seara
asta vizibil pentru Google. Până acum era ascuns (neindexat) cât timp scriam
paginile.

- Clienții pot găsi documentero.ro în Google în următoarele săptămâni; primele
  comenzi de acolo intră în admin exact ca cele de pe eghiseul, cu eticheta
  „documentero” la platformă. Emailurile, factura și contractul pleacă pe
  brandul documentero, automat.
- Nimic nu se schimbă în ce faceți: aceleași servicii (naștere, căsătorie,
  celibat, extrase multilingve), același avocat, aceleași prețuri.
- Când un client întreabă cât durează, pe site scrie acum termenul nostru real
  (jumătate din duplicatele de naștere au ajuns în cel mult 19 zile de la
  plată). Nu promiteți mai puțin.
- Certificatul de celibat se numește oficial „adeverință privind statutul
  civil, Anexa 18” (fosta Anexa 9). E același act.

---

## Ce s-a făcut la lansare

- `DOCUMENTERO_INDEXABLE = true` în `src/config/documentero-nav.ts`: toate
  paginile publice `index,follow`, sitemap-ul curatoriat (14 URL-uri) servit
  la `/sitemap.xml`.
- Search Console: proprietatea `https://documentero.ro/` verificată pe
  sishuletz@gmail.com (al doilea token în layout; cel din 20.09 e al altui
  cont). Sitemap trimis (`/sitemap.xml`, 14 URL-uri, 200 ca Googlebot; GSC
  îl arată „Couldn't fetch”/„Temporary processing error” în primele minute,
  normal). Indexare cerută manual, în ordinea asta: acasă, naștere,
  căsătorie, celibat, extras multilingv, ghidul „pierdut”, ghidul „apostilă”.
  Ultima accesare Googlebot a fost 20.09 cu `noindex`; următoarea vede
  `index, follow`.
- GA4: proprietate „documentero.ro” (cont GA „eGhiseul”, eghiseul@gmail.com),
  `G-ND6HB81QXF`, verificat pe prod după consimțământ.
- Verificare A–Z a celor 4 pagini de serviciu + ghidul „pierdut” pe textul
  randat de producție: o singură greșeală, „în temeiul Legea…” (nominativ în
  loc de genitiv) în 4 fișiere → `LEGAL_BASIS.shortGen`/`longGen`.
- Despre: placeholder-ul „poză echipă” scos (nu avem poza); în loc, un card
  cu cele 4 servicii (linkuri interne în plus).
- Comanda de test pe IBAN (fără plată) considerată suficientă de Raul.

## Ce urmează

- Ghidurile 2–8 din `docs/documentero/analiza-competitori-seo.md` §6.D, câte
  1–2 pe săptămână, fiecare cu link contextual din avocat-tarta.ro.
- GSC săptămânal: expunerile pe cele 4 interogări din analiză; SERP live cu
  `pws=0&udm=14`.
- Rich Results Test pe acasă + o pagină de serviciu.
- Recalcularea lunară a `PROCESSING_STATS`.
