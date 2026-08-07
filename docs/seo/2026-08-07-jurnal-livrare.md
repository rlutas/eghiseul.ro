# Jurnal de livrare — 7 august 2026

Ce s-a făcut efectiv în ziua asta, în ordine, cu starea verificată pe live. Complementar celor
șase audituri din aceeași zi (vezi
[master list](2026-08-07-MASTER-CE-MAI-AVEM-DE-FACUT.md)).

---

## 1. Articole

**Un singur articol NOU scris:** `/cazier-fiscal-persoana-fizica/`

Motiv: în SERP-ul real depersonalizat, 5 din 9 rezultate pe „cazier fiscal" sunt conținut
informațional (ANAF, serviciipublice.gov.ro, startarium, startco, lege5), iar noi nu aveam **niciun**
articol pe temă — doar pagina de serviciu. Conversia pe fiscal e 64 %, cea mai bună din site.
2.000 de cuvinte, 10 întrebări FAQ luate din Google Autocomplete și PAA real, tabel cu termenele de
radiere, trecut prin humanizer.

**Un articol scris și ȘTERS**, înainte de commit: `localizare-teren-dupa-numar-cadastral`. Era
duplicat — `cum-aflam-numarul-carte-functionara-si-nr-cadastral` are deja secțiunea „Cum localizezi
terenul după numărul cadastral", chiar în titlu, și 98.060 de expuneri pe poziția 6,4. L-am înlocuit
cu întărirea articolului existent (3 tabele noi + 5 linkuri către servicii).

**Restul articolelor atinse existau deja.** Li s-a adăugat doar imaginea featured care lipsea.

## 2. Imagini featured — 9 din 23

Direcție vizuală: documentar românesc, oameni și fețe permise, 1200×675 WebP.
Prompturile complete: [prompturi imagini](2026-08-07-prompturi-imagini-articole.md).

| # | Articol | KB | Articol nou? |
|---|---|---|---|
| 1 | cazier-fiscal-persoana-fizica | 41 | **da** |
| 2 | certificat-de-nastere-pierdut | 50 | nu |
| 3 | duplicat-certificat-de-nastere | 36 | nu |
| 4 | acte-necesare-certificat-de-nastere | 48 | nu |
| 5 | schimbare-certificat-de-nastere-vechi | 52 | nu |
| 6 | model-certificat-de-casatorie | 39 | nu — construit din specimen, fără generare |
| 7 | transcriere-certificat-de-nastere | 43 | nu |
| 8 | inregistrare-nastere-copil-nou-nascut | 50 | nu |
| 9 | certificat-de-celibat | 69 | nu |

Total imagini de articol pe site: **42**. Rămân **14** articole fără imagine.

### Compunerea specimenelor — încercată și abandonată

Am compus specimene reale (`public/images/specimens/`, 16 fișiere) peste hârtiile goale din pozele
generate, cu transformare de perspectivă și păstrarea luminii. Rezultatul arăta artificial și a fost
**respins de Raul**. Cele trei imagini afectate au fost readuse la varianta foto simplă:
`cazier-fiscal-persoana-fizica`, `certificat-de-celibat`, `schimbare-certificat-de-nastere-vechi`.

⚠️ **Nu relua tehnica.** Excepția care rămâne validă: `model-certificat-de-casatorie`, unde
specimenul **este** subiectul articolului („cum arată actul"), deci nu e compus peste altceva.

## 3. Bug găsit: trei registre, nu două

Articolele se declară în **trei** locuri, iar eu știam doar de două:

| Registru | Alimentează |
|---|---|
| `src/lib/seo/constants.ts` → `HARDCODED_ARTICLE_SLUGS` | sitemap |
| `src/lib/seo/last-modified.ts` → `PAGE_LAST_MODIFIED` | `<lastmod>` din sitemap |
| **`src/config/articles.ts` → `ARTICLES`** | **listarea din `/blog` + secțiunea de articole de pe homepage** |

Consecință: articolul nou era live la URL și în sitemap, dar **nu apărea în `/blog`**. Verificând
sincronizarea, am găsit încă două articole invizibile **de dinainte**:
`ce-este-planul-cadastral` și `ce-este-un-releveu` — existau la URL și în sitemap, dar nu primeau
niciun link intern din blog.

Acum: sitemap 54 = manifest blog 54, zero diferențe, toate cu intrare în registrul de date.

**Verificare de rulat înainte de orice commit care adaugă un articol:**

```python
sitemap ^ blog   # trebuie să fie mulțime vidă
```

## 4. Tehnic

| Ce | Stare |
|---|---|
| `www.eghiseul.ro` adăugat în Vercel de Raul | ✅ verificat: cert `CN=www.eghiseul.ro`, 308 → root, 1 hop, calea se păstrează |
| Lanțuri de redirect 2 → 1 hop | ✅ 14 reguli `/servicii/*` cu slash final; forma cu slash (cea din backlinkurile WP) face acum 1 hop |
| 5 linkuri interne rupte | ✅ reparate, 0 din 121 |
| Registrul `lastModified` | ✅ sincronizat, testul trece |

## 5. Conținut actualizat

- **ANCPI** (283.033 expuneri): adăugată intrarea de 7 august cu anunțul guvernamental din 5 august
  („un număr limitat de aspecte tehnice" găsite la testele STS/DNSC/Cyberint, fără dată de
  repornire). Actualizate și meta description-ul, răspunsul din FAQ și eticheta de dată, care
  afișa 29 iulie deși `DATE_MODIFIED` era 4 august.
- **Pagina de serviciu cazier fiscal**: spunea că documentul atestă „lipsa datoriilor fiscale" —
  aia e definiția certificatului de atestare fiscală. Corectat în „fapte sancționate".
- **Humanizer** pe 4 articole: ANCPI 68 → 35 linii de pauză, `extras-carte-funciara-gratuit` 14 → 7,
  `certificat-constatator-pentru-banca` 13 → 7, articolul nou 20 → 1.

## 6. Scripturi noi, refolosibile

| Script | Ce face |
|---|---|
| `scripts/seo-linkcheck.py` | verifică toate `href="/..."` din `src/app` peste rutele reale; trebuie 0 rupte |
| `scripts/seo-ai-tells.py` | scanează conținutul după tiparele „Signs of AI writing" adaptate la română |

## 7. Ce urmează

1. Restul de 14 imagini featured (prompturile sunt scrise, unul câte unul).
2. Primele trei puncte din [master list](2026-08-07-MASTER-CE-MAI-AVEM-DE-FACUT.md): puntea
   tool → serviciu pe rovinietă, title+meta pe cazier judiciar și constatator, trimiterea
   articolelor la click.ro și economica.net.
