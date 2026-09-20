# 20.09.2026 — documentero.ro: analiza competitorilor SEO și planul de dinainte de indexare
<!-- categorie: seo -->

## Pentru echipă

Am verificat cine apare pe Google (căutare reală, fără personalizare) la
„certificat de naștere online”, „certificat de căsătorie online” și „certificat
de celibat online”, și ce au paginile lor față de ale noastre de pe
documentero.ro.

- Pe **certificat de naștere**, eghiseul.ro nu mai apare în primele două pagini
  de Google. Pe **căsătorie** și **celibat** eghiseul e pe locul 1. Documentero
  pornește de la zero pe naștere, unde e nevoie cel mai mult.
- Concurența privată care rankează: centruldevize.ro (locul 1 pe naștere, fără
  preț afișat) și infocazier.ro (locul 4, 500 lei + TVA). Noi cerem 998 lei pe
  naștere și căsătorie, cei mai mari din piață; nu e o decizie de preț, dar
  pagina trebuie să spună clar ce cumperi.
- Paginile documentero sunt corecte, dar prea scurte și cu prea puține legături
  între ele. Nimic nu se schimbă pentru echipă acum: documentero rămâne
  neindexat până se face lista de la punctul A din plan.
- Un lucru de verificat cu avocata: cum se numește acum oficial „certificatul
  de celibat” după noua metodologie (primăriile îi spun „Anexa 18, fosta Anexa
  9”). Noi scriem „Anexa 9” pe pagină.

Planul complet: [analiza competitorilor SEO](../documentero/analiza-competitori-seo.md).

---

## Ce s-a făcut

- SERP live pe `google.ro` cu `hl=ro&gl=ro&pws=0&udm=14`, pozițiile 1–20,
  pentru 4 interogări (naștere, duplicat naștere, căsătorie, celibat), prin
  Playwright. Rezumat generat de AI prezent pe naștere, cu surse Hub MAI și
  DLEP Iași.
- 7 pagini de competitori citite (centruldevize, infocazier, gabrieldragomir,
  laghiseu, ghiseurapid/certificatrapid, sprachen-express, hub.mai.gov.ro):
  titluri, H2, cuvinte, preț, termen, FAQ, semnale de încredere, linkuri,
  schema.
- Paginile documentero de producție citite cu `curl -A GPTBot`: cuvinte în
  `<main>`, linkuri din conținut, H2, prezența JSON-LD, `robots`
  (`noindex, nofollow` până la flip).
- Similaritate Jaccard (shingles de 5, nume mascate) între fiecare pagină
  documentero și sora ei de pe eghiseul (0,001–0,003) și între paginile
  documentero (max 0,185).
- Prețurile noastre citite din `AggregateOffer`-ul paginilor de producție.

## Ce iese din analiză

Documentul `docs/documentero/analiza-competitori-seo.md`: §1 concluzii, §2
SERP-ul pe interogări, §3 competitorii, §4 starea paginilor noastre, §5
prețurile, §6 planul A–G (cod înainte de flip, conținut pe pagină, matricea de
linkuri interne cu ținta ≥ 20 primite, ghidurile reordonate, GEO, ce nu facem,
măsurare), surse.

Actualizate: `docs/documentero/README.md` (rând + stare), `continut-si-seo.md`
(pointer; ordinea ghidurilor e înlocuită), `lansare.md` (două puncte noi în
checklist-ul de cod).

Fără modificări de cod în această livrare.
