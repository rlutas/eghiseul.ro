# 06.10.2026 — documentero: ghidul de apostilă extins și linkuri din articolele eghiseul
<!-- categorie: seo -->

## Pentru echipă

- Ghidul de apostilă de pe documentero.ro e de două ori mai lung și mai precis. Spune cine pune apostila pe fiecare act: Prefectura pe certificatul original, Camera Notarilor pe traducerea sau copia legalizată.
- Corecturi față de varianta veche:
  - certificatele de stare civilă se pot apostila la orice prefectură, nu doar în județul de naștere;
  - apostila la Prefectură e gratuită din februarie 2017;
  - pentru Republica Moldova, Elveția și Turcia clientul verifică întâi dacă îi ajunge extrasul multilingv.
- Ghidul are acum ordinea pașilor (apostilă, traducere, legalizare, apostilă pe traducere), variantele pentru cine e în străinătate, întrebări frecvente și surse.
- Patru articole eghiseul despre naștere, căsătorie și documentele de stare civilă trimit acum, în text, la ghidurile documentero potrivite.
- Când un client din diaspora întreabă de apostilă, îi puteți trimite ghidul.

---

**E3** `src/app/documentero/ghiduri/apostila-acte-stare-civila/page.tsx`
- Rendered `<main>`: 836 → 1.615 words. `<title>` 55 chars (separate `META_TITLE`), meta 150 chars (`META_DESCRIPTION`); H1 and lead unchanged in spirit. JSON-LD now includes `FAQPage` (6 visible Q&A). `dateModified` 2026-10-06.
- Fixed: "act oficial" → "act public" (rule: no „oficial" next to acte); `optionPrice(..., 'traducere_autorizata')` used a code that does not exist (fell back to 178,5) → `traducere`; prices for `legalizare` and `apostila_notari` now read from the service options (99 / 83,30).
- Removed: "Prefectura din județul în care a fost emis actul" (MAI instructions allow any prefecture for civil-status certificates); Moldova and Turkey from the "apostila needed" list (CIEC extract accepted there, per the existing `/extras-multilingv/` page); "aceeași zi sau 1–2 zile" as a rule (the instructions set no term).
- Jaccard (5-word shingles, `<main>`) vs other documentero guides and `/extras-multilingv/`: 0.005–0.015.
- Text hygiene: `clean-user-facing-text` stylometry 0.03 (low tier, no rewrite), 0 invisible Unicode in sources and rendered HTML; `humanizer` pass removed two signposting openers.

Sources:
- Hague Convention of 5 Oct 1961 (HCCH, cid=41); OG 66/1999 approved by Legea 52/2000.
- MAI instructions on apostille by prefectures, MO 799/2016 (art. 3(2), 6(2) who may apply, 9(3) any prefecture for civil-status certificates, 21(2) attached sheet): legeaz.net/monitorul-oficial-799-2016/instructiuni-mai-147-2016-eliberare-apostila-haga.
- Legea 1/2017: apostille fees (22 / 44 / 3 lei) eliminated from 1 Feb 2017 (actualdecluj.ro report).
- Legea 36/1995 art. 138 (Camera Notarilor applies apostille/supralegalizare on notarial acts): notari.pro/legea-36-1995/art-138.
- Regulation (EU) 2016/1191, applies from 16 Feb 2019; scope and limits (no third-country documents, no recognition of legal effects): European Commission page on public documents.
- Supralegalizare by MAE (Direcția Consulară), free of charge: municipal civil-status guidance (search results, e.g. primaria-avrig.ro); time "câteva săptămâni" kept from the previous version, not independently verified.

**E4** contextual links (plain `<a href>`, follow), all inside `<main>`, none from `/servicii/*`:
- `/acte-necesare-casatorie/` → `https://documentero.ro/ghiduri/valabilitate-certificat-de-celibat/` („ghid despre valabilitatea certificatului de celibat”)
- `/acte-necesare-certificat-de-nastere/` → `https://documentero.ro/ghiduri/certificat-de-nastere-pierdut/` („ghidul pentru certificatul de naștere pierdut”)
- `/acte-necesare-certificat-de-nastere/` → `https://documentero.ro/ghiduri/apostila-acte-stare-civila/` („ghidul despre apostila pe actele de stare civilă”)
- `/cum-vor-arata-documentele-de-stare-civila-2025/` → `https://documentero.ro/ghiduri/procura-din-strainatate-notar-consulat-avocat/` („ghidul despre procura din străinătate”)

Open: the eghiseul article `/cum-vor-arata-documentele-de-stare-civila-2025/` describes the "extras multilingv" as the CIEC (Viena 1976) extract and the EU form as something else, while documentero `/extras-multilingv/` presents its product as the Reg. 2016/1191 standard form. Worth aligning in one place.
