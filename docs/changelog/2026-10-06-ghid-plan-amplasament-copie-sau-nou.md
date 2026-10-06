# 06.10.2026 — Ghid nou: plan de amplasament și delimitare, copie din arhivă sau plan nou
<!-- categorie: seo -->

## Pentru echipă

- Pe eghiseul a apărut un ghid nou despre **planul de amplasament și delimitare (PAD)**, pentru clienții care nu știu de ce au nevoie.
- Ghidul explică de ce **noi vindem copia unui plan deja recepționat**, scoasă din arhiva OCPI, nu un plan nou. Un plan nou îl face doar un topograf autorizat care măsoară terenul.
- Dacă un client cere „plan de amplasament” pentru un teren **fără număr cadastral**, pentru împărțirea sau unirea terenurilor ori pentru o construcție nouă, are nevoie de un plan nou. Trimite-i linkul la ghid: are acolo trei întrebări care îl ajută să aleagă.
- Pagina serviciului de PAD și articolul despre costul cadastrului au acum link spre ghid.

---

New guide at `/plan-de-amplasament-si-delimitare-copie-sau-intocmire/` (`ArticleLayout`, Article + FAQPage JSON-LD with the visible FAQ, breadcrumb). Registered in `HARDCODED_ARTICLE_SLUGS` (sitemap), `src/lib/seo/last-modified.ts` and `src/config/articles.ts` (blog index). Featured/OG image reuses `/images/articole/cat-costa-cadastrul-si-intabularea.webp` (no new asset).

Inlinks added:
- `/servicii/plan-amplasament-delimitare/`: link in the "Nu e același lucru cu a face cadastru" box.
- `/cat-costa-cadastrul-si-intabularea/`: the inline "planul de amplasament și delimitare (PAD)" link (context: a new PAD made by the surveyor) now points to the guide instead of the archive-copy service. The service stays linked from that article's related services.

Outlinks: copy service, identificare imobil, extras de carte funciară, extras plan cadastral, the cadastre cost article.

Checks: title 59 characters with the brand suffix, meta 149, one H1, JSON-LD parses, zero invisible Unicode (U+200B/200C/200D/2060/FEFF/00AD), no "oficial". Jaccard (5-word shingles, `<main>` text) 0,011 vs the PAD service page and 0,010 vs the cadastre cost article. Stylometry score 0,03 (tier low).

Sources:
- Regulamentul de recepție și înscriere în evidențele de cadastru și carte funciară, Ordinul directorului general al ANCPI nr. 600/2023 (M. Of. 125 și 125 bis din 14.02.2023): art. 18 (types of cadastral documentation), art. 19 alin. (3) (PAD scale 1:200–1:5000), art. 21 lit. g) (PAD is a mandatory piece), art. 24 alin. (1) (the authorized person answers for the measurement); annexes 16 and 17 (PAD, PAD with the subdivision proposal); art. 247–253 (reception of topographic plans). https://legislatie.just.ro/Public/DetaliiDocument/265122
- ANCPI tariffs (Ordinul 16/2019 as amended by Ordinul 441/2025): first registration 0 lei from 7.04.2025; dezlipire/alipire 60 lei + 60 lei per resulting property. Taken from our own `/cat-costa-cadastrul-si-intabularea/` article, which cites them by code.
- No public, reliable source gives a price range for a new PAD (surveyor fees are market prices), so the guide gives none.
