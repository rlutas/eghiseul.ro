# Jurnal de livrare — 7 august 2026

Ce s-a făcut efectiv în ziua asta, cu starea verificată pe live. Complementar celor
șase audituri din aceeași zi (vezi [master list](2026-08-07-MASTER-CE-MAI-AVEM-DE-FACUT.md)).

---

## 1. Articole scrise: 5

| Articol | Cuvinte | FAQ | Ce interogare prinde |
|---|---|---|---|
| `/cazier-fiscal-persoana-fizica/` | ~2.000 | 10 | „cazier fiscal persoana fizica" 1.267 expuneri, poz. 10,8 |
| `/cazier-fiscal-firma/` | 1.284 | 10 | „cazier fiscal persoana juridica" 306 expuneri, poz. 10,3 + firmă/SRL/PFA/administrator/asociație/sediu expirat |
| `/cazier-fiscal-fara-spv/` | 1.319 | 10 | „cazier fiscal din SPV", formular 502/504, blocajele la activare |
| `/verificare-cazier-fiscal/` | 1.274 | 10 | „verificare cazier fiscal" 274+254 expuneri, poz. 6,8 |
| `/certificat-de-nastere-pentru-buletin-pasaport/` | 1.623 | 10 | „pot face buletinul/pașaportul fără certificat de naștere" |

**7.500 de cuvinte, 50 de întrebări FAQ** luate din Google Autocomplete și PAA real.
Ultimele patru scrise de agenți paraleli, pe brief cu research-ul și regulile de humanizer.

Motivul pentru cluster: în SERP-ul depersonalizat, **5 din 9 rezultate pe „cazier fiscal" sunt
conținut informațional** (ANAF, serviciipublice.gov.ro, startarium, startco, lege5), iar noi nu
aveam niciun articol pe temă. Conversia pe fiscal e 64 %, cea mai bună din site.

Verificat pe fiecare: 0 linii de pauză, 0 tipare AI din lista humanizer, tabele HTML, 3–5 linkuri
interne, suprapunere cu articolele existente 0–1 fraze. `META_TITLE` separat de H1 pe toate
(H1 descriptiv 87–103 caractere, titlul din SERP 60–63, sub pragul la care Google rescrie).

**Un articol scris și ȘTERS** înainte de commit: `localizare-teren-dupa-numar-cadastral`, duplicat
peste `cum-aflam-numarul-carte-functionara-si-nr-cadastral` (98.060 expuneri, poz. 6,4). Înlocuit
cu întărirea articolului existent: 3 tabele noi și 5 linkuri către servicii.

**NU s-a făcut comasarea** `certificat-de-nastere-pierdut` + `duplicat-certificat-de-nastere` —
decizie Raul, rămân separate.

## 2. Imagini featured: 13 livrate, 14 rămase

Direcție: documentar românesc, oameni și fețe permise, 1200×675 WebP sub 80 KB.
Prompturi: [prompturi imagini](2026-08-07-prompturi-imagini-articole.md).

Livrate: cazier-fiscal-persoana-fizica · certificat-de-nastere-pierdut ·
duplicat-certificat-de-nastere · acte-necesare-certificat-de-nastere ·
schimbare-certificat-de-nastere-vechi · model-certificat-de-casatorie ·
transcriere-certificat-de-nastere · inregistrare-nastere-copil-nou-nascut ·
certificat-de-celibat · cazier-fiscal-firma · cazier-fiscal-fara-spv ·
verificare-cazier-fiscal · certificat-de-nastere-pentru-buletin-pasaport

Rămase (14): clusterul constatator (7), căsătorie (3), celibat (2), cadastru (2).

### Compunerea specimenelor — încercată și abandonată
Am compus specimene reale peste hârtiile goale din poze (transformare de perspectivă, păstrarea
luminii, mască de hârtie). Arăta artificial și a fost **respins de Raul**. Cele trei imagini
afectate au fost readuse la varianta foto simplă. ⚠️ **Nu relua tehnica.** Excepția validă:
`model-certificat-de-casatorie`, unde specimenul **este** subiectul articolului.

## 3. Bug găsit: trei registre, nu două

| Registru | Alimentează |
|---|---|
| `src/lib/seo/constants.ts` → `HARDCODED_ARTICLE_SLUGS` | sitemap |
| `src/lib/seo/last-modified.ts` → `PAGE_LAST_MODIFIED` | `<lastmod>` din sitemap |
| **`src/config/articles.ts` → `ARTICLES`** | **listarea din `/blog` + articolele de pe homepage** |

Articolul nou era live și în sitemap, dar **nu apărea în `/blog`**. Verificând sincronizarea, am
găsit încă două articole invizibile **de dinainte**: `ce-este-planul-cadastral` și
`ce-este-un-releveu`.

Acum: **sitemap 58 = blog 58 = last-modified 58**, zero diferențe, zero imagini rupte.

**Verificare de rulat înainte de orice commit care adaugă un articol:**
```python
sitemap ^ blog   # trebuie să fie mulțime vidă
```

## 4. Arhiva `/blog` — două probleme reparate

1. **Articolul nou ocupase slotul featured.** `/blog` face `const [featured, ...rest] = ARTICLES`,
   deci primul din manifest devine cardul mare. Manifestul e ordonat manual după trafic organic, iar
   eu pusesem un articol cu zero trafic primul.
2. **Articolele noi rămâneau îngropate** la pozițiile 18–22 din 58, fiindcă `ArticleMeta` n-are
   câmp de dată și nimic nu sorta cronologic.

**Soluția (aleasă de Raul):** featured rămâne primul din manifest, ales editorial; restul grilei se
sortează cronologic din `PAGE_LAST_MODIFIED`, fără câmp nou și fără întreținere manuală. Efect
secundar util: orice articol actualizat urcă automat în arhivă.

Aliniate și lungimile la norma site-ului: titlu ~60 caractere (mediana 64), excerpt ~124.

## 5. Tehnic

| Ce | Stare |
|---|---|
| `www.eghiseul.ro` adăugat în Vercel de Raul | ✅ cert `CN=www.eghiseul.ro`, 308 → root, 1 hop, calea se păstrează |
| Lanțuri de redirect 2 → 1 hop | ✅ 14 reguli `/servicii/*` cu slash final |
| 5 linkuri interne rupte | ✅ 0 din 121 |
| Eroare de fond pe pagina de cazier fiscal | ✅ spunea „lipsă datorii fiscale" (= atestare fiscală) |
| Registrul `lastModified` | ✅ sincronizat, testul trece |

## 6. Conținut actualizat

- **ANCPI** (283.033 expuneri): intrarea de 7 august cu anunțul guvernamental din 5 august
  („un număr limitat de aspecte tehnice" la testele STS/DNSC/Cyberint, fără dată de repornire).
  Actualizate meta description, FAQ și eticheta de dată, care afișa 29 iulie deși `DATE_MODIFIED`
  era 4 august.
- **Humanizer** pe 4 articole: ANCPI 68 → 35 linii de pauză, `extras-carte-funciara-gratuit` 14 → 7,
  `certificat-constatator-pentru-banca` 13 → 7, articolul nou 20 → 1.

## 7. Trimis la indexare în GSC — 7 august

Prin Verificarea adresei URL → Solicită indexarea, pe proprietatea `sc-domain:eghiseul.ro`
(contul serviciiseonethut@gmail.com, vezi [[gsc-acces-si-export]]):

| URL | Stare înainte | Acțiune |
|---|---|---|
| `/cazier-fiscal-persoana-fizica/` | „Google nu cunoaște adresa URL" | ✅ indexare solicitată |
| `/cazier-fiscal-firma/` | idem | ✅ indexare solicitată |
| `/cazier-fiscal-fara-spv/` | idem | ✅ indexare solicitată |
| `/verificare-cazier-fiscal/` | idem | ✅ indexare solicitată |
| `/certificat-de-nastere-pentru-buletin-pasaport/` | idem | ✅ indexare solicitată |

**Sitemap retrimis**, `https://eghiseul.ro/sitemap.xml` — stare Succes, ultima citire era 6 august,
187 pagini descoperite; acum are 192.

⚠️ Solicitarea de indexare pune URL-ul într-o coadă prioritară, **nu garantează** indexarea și nu o
grăbește dacă repeți cererea. Verifică peste 3–7 zile în Indexare → Pagini.

## 8. Scripturi refolosibile

| Script | Ce face |
|---|---|
| `scripts/seo-linkcheck.py` | toate `href="/..."` din `src/app` peste rutele reale; trebuie 0 rupte |
| `scripts/seo-ai-tells.py` | tiparele „Signs of AI writing" adaptate la română |

## 9. Ce urmează, în ordine

1. **Puntea tool → serviciu** pe rovinietă: tool-ul are 866.032 expuneri și 46.478 clicuri, iar
   `/servicii/rovinieta-online/` are CTR 0,4 % și poziția 10,5. Cel mai mare dezechilibru de pe site.
2. **Title + meta** pe `/servicii/cazier-judiciar-online/` (44.377 expuneri, CTR 0,9 %) și
   `/servicii/certificat-constatator-online/` (15.243 expuneri, CTR 0,59 %).
3. **Trimis articolele** la click.ro și economica.net (ultimele 2 din pachetul de 6 backlinkuri).
4. Cele 14 imagini rămase.
5. Restul din [master list](2026-08-07-MASTER-CE-MAI-AVEM-DE-FACUT.md).
