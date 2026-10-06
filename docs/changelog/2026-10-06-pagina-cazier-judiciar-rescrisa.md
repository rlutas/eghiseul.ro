# 06.10.2026 — Pagina de cazier judiciar de pe eghiseul, rescrisă și corectată
<!-- categorie: seo -->

## Pentru echipă

- Pagina principală de cazier judiciar spune acum exact ce primește clientul: **scanul pe email** și **originalul pe hârtie prin curier**, dacă l-a ales. Înainte promitea un PDF „semnat electronic" de la Poliție, ceea ce nu trimitem.
- Scrie clar că cererea o depune **avocata, pe împuternicire**, și că certificatul îl eliberează poliția. Dacă un client întreabă „cine merge la poliție", răspunsul e același ca pe pagină.
- Prețurile de pe pagină sunt cele din setări: **apostila Haga 198 lei** (pagina zicea 238), traducerea **pe limbă** (178,50 / 249 / 349), certificatul de integritate în aceeași comandă +100 lei, cetățean străin 298 lei, 7-15 zile, fără urgență.
- Renunțarea: pagina spune acum regula reală, **70% înapoi dacă anulează singur în primele 30 de minute**, apoi caz cu caz. Varianta veche („14 zile, 100%") a ieșit.
- Pagina recunoaște deschis că la ghișeu cazierul e **gratuit și se dă de regulă pe loc**, și explică cui îi folosește serviciul nostru (altă localitate, străinătate, traducere și apostilă). Clienții care sună și spun „dar e gratuit" au deja răspunsul pe pagină.
- Nimic nu se schimbă în formular sau în admin.

---

## Rezumat tehnic

Rescrierea D2 din planul de vânzări pe octombrie (`docs/2026-10-plan-a-z-vanzari.md`) și punctul 24 din jurnalul de recuperare după spam update (`docs/seo/2026-09-recuperare-spam-update/11-jurnal-executie.md`). Fișier: `src/app/(eghiseul)/servicii/cazier-judiciar-online/page.tsx`. Layoutul și componentele partajate (`ReviewsSection`, `PrivateServiceNotice`, `ServiceFAQ`, `MobileStickyCTA`) au rămas neatinse.

**Titlu și descriere**

| | înainte | după |
|---|---|---|
| title (cu sufixul „ \| eGhiseul.ro”) | Cazier Judiciar Online 2026 — Fără Drumuri, în 3-5 Zile (71 caractere) | Cazier Judiciar Online: 198 lei, 3-5 Zile (55) |
| description | Obține cazierul judiciar online de la Poliția Română, fără cozi. Persoane fizice și firme, livrare în 3-5 zile pe email sau curier. Comandă în 5 minute. | Poliția eliberează cazierul, noi îl obținem prin avocat. Persoane fizice, firme, străini. Scan pe email, originalul prin curier, și în diaspora. (144) |

Prețul în titlu urmează ce a mers pe CJO (C2/C6). H2-urile acoperă căutările reale: persoană fizică/juridică, online sau la ghișeu, din străinătate, cât durează, preț; valabilitatea e H3 în secțiunea despre conținut. Un singur H1. JSON-LD valid (`Service`, `FAQPage` cu FAQ vizibil, fără `aggregateRating`).

**Afirmații pe care nu le-am putut verifica în textul consolidat curent și le-am scos:** termenul de „până la 10 zile” la consulat și „certificatul de la consulat se folosește doar în străinătate” (ambele vin din OG 1/2016, art. 29 alin. 3–4 din L. 290/2004, dar forma în vigoare n-am putut-o citi). Pagina spune acum că termenul și taxele diferă de la consulat la consulat și trimite clientul să întrebe. „Baroul Satu Mare” rămâne: e în cod (`src/lib/registry/client.ts`, `src/lib/documentero/content.ts`).

**Erori de fond reparate**

| ce spunea | ce e adevărat | sursa |
|---|---|---|
| taxa de timbru eliminată „din 2024" | eliminată la 1.02.2017 | ghidul propriu `/taxa-cazier-judiciar/` |
| la ghișeu „3-7 zile", „deplasare de 2 ori", „cozi 30-90 min" | se eliberează pe loc sau în cel mult 3 zile; cozile, nemăsurate | Legea 290/2004 |
| PDF „semnat electronic eIDAS", „ștampila IGPR" pe email | avocata depune fizic, certificatul e pe hârtie; pe email pleacă scanul | `docs/admin/servicii/caziere-si-integritate.md` |
| apostila Haga 238 lei | 198 lei | `service_options`, verificat în DB pe 06.10 |
| traducere „9 limbi", 178,50 | 20 de limbi, preț pe limbă: 178,50 / 249 / 349 | `docs/admin/servicii/optiuni-suplimentare.md` |
| retragere 14 zile, restituire 100% | anulare în 30 de minute, 70% | fișa echipei |
| integritatea „atestă lipsa hărțuirii, abuzului" | doar registrul infracțiunilor sexuale, de exploatare și asupra minorilor | Legea 118/2019 |
| reabilitare „5-10 ani" | de drept după 3 ani (art. 165 C. pen.), judecătorească după 4/5/7/10 ani (art. 166) | Codul penal |
| valabilitate în SUA „2 ani", Australia „12 luni" etc. | scos: nesusținut; rămâne regula legii (6 luni, art. 27 L. 290/2004) și sfatul de a întreba instituția | |
| cazier fiscal „pentru licitații, contracte cu statul" | doar persoane fizice, 30 de zile | memoria `cazier-fiscal-doar-pf` |
| „răspuns garantat sub 4 ore", „actele șterse automat după eliberare", „specialiști drept administrativ" | scoase: nedemonstrabile | `.claude/rules/content-and-seo.md` §3 |

**Situații de utilizare** scoase pentru că nu se pot susține: renunțare la cetățenie, repatriere, custodie la divorț, acreditări ANAF/ANRE/ANCOM, Erasmus, „înființare firmă cu administrator străin". Titlul „30+ situații" a ieșit.

**Bug găsit pe drum:** două răspunsuri din FAQ conțineau `<a href>`, dar `ServiceFAQ` randează răspunsul ca text simplu, deci pe pagină apăreau tagurile brute. Linkurile au trecut în corpul paginii; comentariu în cod ca să nu se repete.

**Conținut nou:** ce NU apare pe cazier (dosare fără hotărâre definitivă, amenzi contravenționale, puncte, condamnări scoase din evidență), când iese o condamnare, cele trei variante din străinătate (consulat, procură, noi), ordinea apostilă → traducere, PFA = persoană fizică, comanda pentru altcineva.

**Linkuri interne noi din conținut** (toate 200, `index, follow`): `/servicii/cazier-judiciar-online/persoana-fizica/`, `/servicii/cazier-judiciar-online/persoana-juridica/`, `/cazier-judiciar-vs-certificat-integritate-comportamentala/`, `/cazier-si-certificat-de-integritate-pentru-profesori/`, `/despre-noi/raul-lutas/` (autorul, din `SITE_AUTHOR`). `/taxa-cazier-judiciar/` rămâne legat, acum din textul comparației.

**Măsurat** (text din `<main>`, shingles de 6, live înainte vs dev local după; include `ReviewsSection`):

| | înainte | după |
|---|---:|---:|
| cuvinte | 4.579 | 3.988 |
| Jaccard cu cazier auto | 0,102 | 0,113 |
| Jaccard cu integritate | 0,114 | 0,126 |
| Jaccard cu cazier fiscal | 0,109 | 0,122 |
| mascat (aceleași perechi) | 0,102–0,110 | 0,113–0,126 |
| Jaccard după vs înainte | | 0,096 |

Pagina era deja diferită de surori; problema ei era calitatea și faptele, nu duplicarea. Mai puține cuvinte după, pentru că a ieșit umplutura (tabelul de 29 de situații, cardurile de „încredere").

Text: zero caractere invizibile (U+200B/200C/200D/2060/FEFF/00AD) în pagina randată; scor stilometric 0,03 (nivel „low”). Titlurile cardurilor și ale butoanelor trecute din Title Case în frază normală.

Verificat: `tsc --noEmit` curat, `eslint` pe fișier curat, `vitest run tests/unit` 2.053/2.053, pagina randată local (200).
