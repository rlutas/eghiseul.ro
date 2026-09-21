# 21.09.2026 — documentero.ro: paginile de serviciu rescrise și extinse, pregătite pentru indexare
<!-- categorie: seo -->

## Pentru echipă

Cele patru pagini de serviciu de pe documentero.ro (naștere, căsătorie,
celibat, extras multilingv) și ghidul „certificat de naștere pierdut” au fost
rescrise și extinse, după analiza concurenței de ieri. Site-ul rămâne
neindexat până le citește Raul.

- Fiecare pagină începe acum cu un răspuns scurt, „Pe scurt”, cu data
  actualizării și numele avocatei care depune cererile.
- Pe fiecare pagină scrie cât durează de fapt, din comenzile noastre
  (jumătate din duplicatele de naștere au ajuns la client în cel mult 19 zile
  de la plată). Cifrele se recalculează lunar; până atunci nu promitem altceva
  clienților la telefon.
- Certificatul de celibat se numește oficial, din 2024, „adeverință privind
  statutul civil, Anexa 18”. Vechiul nume, „Anexa 9”, rămâne menționat.
  Când un client sau o primărie spune „Anexa 18”, e același document.
- Paginile explică ce NU facem (transcrierea certificatelor emise în
  străinătate, rectificarea greșelilor din act) ca să nu mai primim comenzi
  greșite pe naștere.
- Ghidurile nescrise nu mai apar ca linkuri; apar ca „în lucru”.

Planul complet și starea lui: [analiza competitorilor SEO](../documentero/analiza-competitori-seo.md), secțiunea „Stare după implementare”.

---

## Ce s-a livrat

### Componente și date comune

- `src/lib/documentero/content.ts`: `LAWYER` (mutat din `despre/page.tsx`),
  `LEGAL_BASIS` (Legea 119/1996 + Legea 51/1995 + H.G. 255/2024, aceeași
  formulare peste tot), `PROCESSING_STATS` (mediana și p80 în zile de la plată
  la finalizare, pe serviciu, din `orders` de la 07.07.2026; recalculare
  manuală cu interogarea din analiză §6.B), `fmtDateRo`, `guideHref` → `null`
  pentru ghiduri nepublicate, `publishedGuides()`.
- `src/components/documentero/ui.tsx`: `QuickAnswer` (blocul „Pe scurt”),
  `UpdatedLine` („Actualizat la … · cererile le depune av. …”, link spre
  `/despre/`), `RelatedServices` („Ai nevoie și de”), `InfoTable` (tabel cu
  antet, stivuit pe telefon); `SeoBlock.guides[].href` opțional (fără href =
  card „în lucru”, fără link).
- `src/lib/seo/documentero-schema.ts`: `faq` în `DocumenteroServiceInput` →
  nod `FAQPage` pe paginile de serviciu (întrebările sunt pe pagină).
- `src/components/documentero/reviews.tsx`: `ReviewsDocumentero` primește
  `match` (RegExp pe `service`) și `title`; sub 2 potriviri cade pe toate.
- `src/app/documentero/llms.txt/route.ts` + rewrite pe host în
  `next.config.ts`.

### Pagini

- Naștere (983 → 2.446 cuvinte): „Pe scurt”, situații (fără linkuri
  placeholder), „Cine poate cere duplicatul?”, paragraf duplicat vs
  transcriere, „Cât durează, de fapt?” + „Ce plătești, de fapt”, „Când datele
  nu se potrivesc”, tabel „duplicat sau extras, depinde cine ți-l cere”, FAQ
  8 (cu `FAQPage`), recenzii pe naștere, „Ai nevoie și de”.
- Căsătorie (908 → 2.220): divorțul și mențiunea (înscriere, Regulamentul
  2019/1111 pentru hotărâri din UE, deces), „Ce nu înlocuiește duplicatul”,
  tabel pe scopuri, termen real, FAQ 8.
- Celibat (1.187 → 2.339): titlu și hero pe „Anexa 18 (fosta Anexa 9)”, „un
  document, patru nume”, tabel pe 7 țări (nume local, apostilă, traducere,
  cât de nou), „procură notar / consulat / avocat”, paragraf despre
  nepotrivirea datelor, FAQ 8.
- Extras multilingv (924 → 1.796): tabel formular UE vs extras CIEC
  (Convenția nr. 16, Viena 1976), „când nu e suficient” cu linkuri, termen
  real, FAQ 7.
- Ghidul „pierdut” (474 → 1.272): „Pe scurt”, „Cine poate cere”, tabel de 8
  cazuri particulare, „Ce faci cu duplicatul după ce îl ai”, linkuri în text
  spre cele trei servicii și spre apostilă.
- Acasă: paragraf „Ce facem, în trei propoziții” cu linkuri în text spre cele
  4 servicii, despre, 2 ghiduri, index; „Anexa 18” în carduri și prețuri.
- Ghiduri (index) și Despre: paragraf cu linkuri spre cele 4 servicii.
- Meniu, T&C: „Anexa 18 (fosta Anexa 9)”.
- `documentero-sitemap.ts`: `lastModified` 2026-09-21 pe paginile atinse.

### Linkuri din site-urile surori (planul C, 21.09)

- eghiseul.ro: pe lângă footer și pagina de naștere (20.09), câte un link în
  text spre documentero pe paginile de căsătorie, celibat, extras multilingv de
  naștere și pe articolul „schimbare certificat de naștere vechi” (singurul
  articol de stare civilă care încă rankează). Textul e același peste tot:
  „site dedicat, cu aceeași echipă și același avocat”, dofollow.
- cazierjudiciaronline.com (repo separat, commit acolo): rând nou în footer,
  „Resurse” → `https://documentero.ro/`; pe host-ul ecazier.ro (același repo,
  layout propriu) la fel.
- avocat-tarta.ro (repo `avocat-tarta-gabriela`, Netlify, commit acolo): link
  în footer („Link-uri utile”) + două linkuri contextuale în articolele
  „Divorț în România 2026” (duplicatul certificatului de căsătorie, la pasul
  2 și la pasul 6) și „Succesiune” (duplicatele actelor de stare civilă). E
  linkul cu cea mai mare greutate: site-ul avocatei care depune cererile.

### Verificat

- `tsc --noEmit` și `eslint` curate.
- Randare pe dev cu `Host: documentero.ro`, `User-Agent: GPTBot`: toate
  paginile 200, conținutul în HTML, `FAQPage` pe cele 4 servicii, `/llms.txt`
  servit.
- Vizual (21.09, a doua trecere): `DOCUMENTERO_EXTRA_HOSTS=documentero.localhost:3000`
  în `.env.local` + Playwright pe `http://documentero.localhost:3000/`; 8 pagini,
  desktop 1280 și mobil 390, fără erori de runtime; tabelele (`InfoTable`) se
  stivuiesc corect pe telefon, „Pe scurt” și „Ce plătești” se văd cum trebuie.
- Similaritate (shingles 5, nume mascate): vs eghiseul 0,003–0,005; între
  paginile documentero max 0,182.

### Nu s-a făcut

- Ghidurile 2–8 (câte 1–2 pe săptămână, după flip).
- `DOCUMENTERO_INDEXABLE` rămâne `false`.
