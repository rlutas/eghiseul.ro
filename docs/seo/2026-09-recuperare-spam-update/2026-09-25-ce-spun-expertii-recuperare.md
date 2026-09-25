# Ce spun Google și experții despre recuperarea după spam update

**Data:** 25.09.2026 · **Context:** la 16 zile după curățenia din 09.09 (vezi
[`README.md`](README.md) și [`PLAN-RECUPERARE.md`](PLAN-RECUPERARE.md)), zero
recuperare vizibilă. Documentul completează
[`research/01-spam-update-august-2026-stadiu.md`](research/01-spam-update-august-2026-stadiu.md)
(stadiul la 09.09) cu ce s-a schimbat de atunci și cu ce spun sursele despre
**cât durează și ce funcționează**. Nu repetă diagnosticul.

**Niveluri de încredere folosite mai jos:**
- **[CONFIRMAT]** — documentație Google sau declarație directă a unui angajat Google, cu link.
- **[PRACTICIAN]** — analiză cu date proprii a unui SEO cunoscut (studii de caz, GSC).
- **[OPINIE / NEVERIFICAT]** — consens de bloguri, extrapolare a noastră, sau cifră pe care n-am putut-o urmări până la sursa primară.

---

## Pe scurt

1. **Ieri (24.09.2026, 09:15 PDT) Google a pornit September 2026 Spam Update** — al
   patrulea din 2026, global, „poate dura până la două săptămâni”, deci până în jur de
   **08.10**. E prima fereastră în care sistemul ne-ar putea re-scora după curățenie.
   [CONFIRMAT]
2. **Lipsa recuperării la 16 zile e normală.** Google scrie în documentație că
   îmbunătățirea vine dacă sistemele „învață pe o perioadă de luni” că site-ul
   respectă politicile. Nimeni credibil nu promite săptămâni. [CONFIRMAT]
3. **Demotarea e pe tot site-ul, nu doar pe paginile șterse.** John Mueller (07.09.2026)
   despre site-uri cu pagini programatice: sistemele au „pierdut încrederea” în tot
   site-ul pe baza paginilor vechi, iar repararea cere „timp și efort semnificativ”.
   [CONFIRMAT]
4. **Ștergerea singură nu e suficientă.** Paginile se șterg într-o după-amiază, dar
   încrederea se reconstruiește cu valoare demonstrată în timp. Practicienii (Glenn
   Gabe) spun același lucru: site curat pe o perioadă lungă, plus conținut și linkuri
   bune, nu un site înghețat. [CONFIRMAT + PRACTICIAN]
5. **Așteptare realistă:** o mișcare parțială e *posibilă* cu update-ul din septembrie,
   dar 15 zile între curățenie și startul lui sunt puține (recrawl, procesarea
   redirecturilor). Scenariul de bază: **3–6 luni**, adică următorul spam update sau
   core update (estimat noiembrie 2026 – februarie 2027). Recuperarea completă, la
   nivelul din iulie, **nu e garantată**. [PRACTICIAN + OPINIE]
6. **Nu ajută:** disavow, domeniu nou sau redirect spre alt domeniu, cerere de
   reconsiderare (nu avem acțiune manuală), schimbări mari făcute în panică în timpul
   rollout-ului. [CONFIRMAT / PRACTICIAN]
7. **Primul semn nu vor fi clicurile, ci expunerile** pe clusterul `/servicii/` și
   revenirea paginilor de serviciu în top 20 pe interogările de bani. [PRACTICIAN]
8. **Unele cifre din planul nostru nu le-am putut verifica la sursă** (22% din ~400
   site-uri, 129/130 la Lily Ray, HouseFresh 2 ani). Le tratăm ca orientative, nu ca
   fapte — detalii la final. [NEVERIFICAT]

---

## Ce a confirmat Google

### Documentația oficială

| Ce spune | Sursă | Încredere |
|---|---|---|
| După un spam update: verifici conformitatea cu politicile de spam. Schimbările pot ajuta dacă sistemele automate „învață pe o perioadă de luni” că site-ul respectă politicile. | [Search Central — Spam updates](https://developers.google.com/search/docs/appearance/spam-updates), actualizat 10.12.2025 | CONFIRMAT |
| La link spam, recuperarea NU aduce înapoi beneficiul linkurilor neutralizate. (Nu e cazul nostru: update-urile din august și septembrie nu sunt de link spam.) | idem | CONFIRMAT |
| Detecția e automată, cu revizuire umană „după caz”. Acțiunile manuale apar în Search Console și AU cerere de reconsiderare. Demotările algoritmice NU apar nicăieri și nu au cerere. | [Search Central — Spam policies](https://developers.google.com/search/docs/essentials/spam-policies), actualizat 28.08.2026 | CONFIRMAT |
| Definițiile care ne privesc: *doorway abuse* = pagini create să rankeze pe interogări similare; *scaled content abuse* = multe pagini generate în primul rând ca să manipuleze clasamentul. | idem | CONFIRMAT |
| În SEE, „site reputation abuse” nu mai primește acțiuni manuale (din 28–30.08.2026). Nu ne privește: e politica de parasite SEO, nu de conținut la scară. | idem + [SER, 28.08.2026](https://www.seroundtable.com/google-site-reputation-policy-eea-41968.html) | CONFIRMAT |
| La core updates: unele schimbări se văd în câteva zile, altele în „câteva luni”; nu trebuie neapărat așteptat un core update mare, există și „core updates mai mici”. Evaluarea e la nivel de site. | [Search Central — Core updates](https://developers.google.com/search/docs/appearance/core-updates), actualizat 10.12.2025 | CONFIRMAT |

### September 2026 Spam Update (în desfășurare)

- **Start:** 24.09.2026, 09:15 PDT, pe [Search Status Dashboard](https://status.search.google.com/incidents/XhUDXP7A67iHCD2kmbVu). Text oficial: se aplică global, în toate limbile, rollout de până la două săptămâni. [CONFIRMAT]
- Google Search Central (LinkedIn, citat de [PPC Land](https://ppc.land/sites-breaking-google-spam-rules-face-lower-rankings-in-two-week-window/)): e un spam update „normal”. Nu e link spam update. Nicio politică nouă, nicio categorie anunțată. [CONFIRMAT, prin presă]
- Diferența față de celelalte trei din 2026 (19,5 ore, 2 zile, 2 zile și 16 ore): fereastra anunțată e de două săptămâni. SEJ avertizează că asta NU înseamnă neapărat că e mai mare — doar că trebuie așteptat mai mult înainte de concluzii. ([SEJ, 24–25.09](https://www.searchenginejournal.com/google-september-2026-spam-update/590828/), [SER](https://www.seroundtable.com/google-september-2026-spam-update-42163.html)) [CONFIRMAT]

### John Mueller (Search Advocate)

- **07.09.2026, Bluesky**, despre un site cu pagini programatice (raportat de
  [Search Engine Roundtable](https://www.seroundtable.com/google-lose-faith-42032.html)
  și [SEJ, 08.09](https://www.searchenginejournal.com/google-says-old-low-value-pages-may-affect-site-recovery/588837/)):
  programatic SEO duce des la un site „spam, borderline spam sau de calitate slabă”;
  sistemele au putut „pierde încrederea” în site pe baza paginilor vechi; rezolvarea
  „cere timp și efort semnificativ”. Nu a dat un termen și nu a spus că
  ștergerea/noindex-ul rezolvă singure. **E cea mai apropiată declarație oficială de
  cazul nostru.** [CONFIRMAT]
- **Septembrie 2026, Reddit** ([SEJ, 588268](https://www.searchenginejournal.com/google-says-ranking-recovery-takes-months-after-seo-issues-are-fixed/588268/)):
  repararea problemelor legate de schimbări algoritmice mari poate dura „uneori multe
  luni” până se vede efectul. Tot el, în trecut, despre disavow: reprocesarea durează
  „trei, patru, cinci, șase luni”. [CONFIRMAT]
- **Mai vechi, dar valabil:** toate paginile indexate contează când Google evaluează
  calitatea unui site (citat în [GSQi, 2017](https://www.gsqi.com/marketing-blog/remove-versus-improve-low-quality-thin-content/));
  404/410 nu sunt semnal negativ de calitate
  ([SEJ](https://www.searchenginejournal.com/googles-john-mueller-clarifies-404-410-confusion-for-seo/513576/));
  redirectul spre o pagină nerelevantă (de ex. homepage) e tratat ca soft 404
  ([SER](https://www.seroundtable.com/301-404-pages-to-your-home-page-26923.html),
  cu dovadă practică la [GSQi](https://www.gsqi.com/marketing-blog/redirects-less-relevant-pages-soft-404s/)).
  [CONFIRMAT]
- **Domeniu nou:** Mueller a spus explicit că nu păcălești algoritmii de spam cu un
  domeniu similar redirecționat
  ([SER](https://www.seroundtable.com/google-redirect-spammy-links-similar-domain-27198.html)),
  iar Google poate recunoaște un site mutat și fără redirect, după conținut
  ([Search Engine Land](https://searchengineland.com/hiding-google-penalty-may-find-new-home-185353)).
  [CONFIRMAT pentru redirect; PRACTICIAN pentru mutarea fără redirect]

### Danny Sullivan

- Atenție la datare: **Sullivan nu mai e Search Liaison din 01.08.2025**
  ([Search Engine Land](https://searchengineland.com/danny-sullivan-no-longer-the-google-search-liaison-459864)).
  Ce i se atribuie despre update-urile din 2026 pe bloguri e fie reciclat din perioada
  lui, fie greșit. Declarațiile lui de dinainte, încă relevante:
  - recuperarea **nu e garantată**: îmbunătățirile se pot vedea la următorul core
    update, dar nu toate site-urile ajung la nivelul vechi
    ([Search Engine Land](https://searchengineland.com/google-danny-sullivan-algorithm-update-recovery-uncertain-446317));
  - metoda de producție nu contează, **scara și scopul** contează
    ([SEJ](https://www.searchenginejournal.com/google-on-scaled-content-its-going-to-be-an-issue/543308/)).
  [CONFIRMAT, dar vechi]

### Gary Illyes

- Nu am găsit declarații noi (2026) despre recuperarea după spam. Citatul istoric
  relevant (era Panda): calitatea se evaluează uitându-se la „marea majoritate a
  paginilor” ([GSQi, 2017](https://www.gsqi.com/marketing-blog/remove-versus-improve-low-quality-thin-content/)).
  [CONFIRMAT, vechi]

---

## Ce spun practicienii (SUA/UK)

### Glenn Gabe — GSQi (SUA) [PRACTICIAN]

- **August 2026, 4 studii de caz** ([31.08.2026](https://www.gsqi.com/marketing-blog/august-2026-google-spam-update-case-studies/)):
  impactul a fost **pe tot domeniul, pe toate secțiunile**, similar cu un core update.
  Recuperare: „poate dura luni după schimbări semnificative”. Citează un caz de la
  Lily Ray recuperat în **~5 luni**. Condiții: curățenie agresivă, site curat pe o
  perioadă lungă, continuarea publicării de conținut bun și câștigarea de linkuri —
  nu un site lăsat să stagneze. Pentru afiliați complet automatizați: dacă nu schimbă
  fundamental cum funcționează site-ul, nu crede că pot recupera.
- **Decembrie 2024, 5 studii** (inclusiv doorway pages) ([GSQi](https://www.gsqi.com/marketing-blog/google-december-2024-spam-update-case-studies/)):
  recuperarea **nu vine automat** cu următorul update. A văzut site-uri urcate la core
  update-ul din noiembrie și căzute din nou la spam update-ul din decembrie — sistemele
  lucrează independent. Conținutul spam care rankase nu revine; restul site-ului, care
  a căzut odată cu el, poate reveni în timp.
- **Șterge vs. îmbunătățește** ([2017, principiu încă citat](https://www.gsqi.com/marketing-blog/remove-versus-improve-low-quality-thin-content/)):
  îmbunătățești ce poți face bun; ce nu, iese (noindex sau 404/410). Redirect doar
  spre un echivalent real, altfel e soft 404
  ([studiu redirecturi](https://www.gsqi.com/marketing-blog/redirects-less-relevant-pages-soft-404s/)).

### Lily Ray (SUA) [PRACTICIAN]

- Sursa cazului de recuperare în ~5 luni citat de Gabe (postare pe social media; n-am
  găsit detaliile cazului).
- Pe [Substack](https://lilyraynyc.substack.com/p/it-works-until-it-doesnt-ai-content-risks),
  tema ei constantă din 2024 încoace: strategiile de conținut la scară merg până nu mai
  merg, iar căderea e pe tot site-ul.
- Cifra „129 din 130 de site-uri au continuat să scadă”, pe care o avem în plan, apare
  doar pe bloguri secundare; **n-am găsit-o la ea**. [NEVERIFICAT]

### Search Engine Roundtable (Barry Schwartz), SEJ, Search Engine Land [CONFIRMAT ca raportare]

- Au raportat declarațiile Mueller din septembrie și start-ul update-ului din
  septembrie (linkuri mai sus). Mesajul comun: recuperarea se măsoară în luni și e
  condiționată. Search Engine Land a publicat pe 24.09 anunțul update-ului
  ([link](https://searchengineland.com/google-releases-september-2026-spam-update-491267));
  pagina a răspuns 403 la citire automată, deci o citez doar ca existentă.

### Cazul job board — South Asia Digital [PRACTICIAN, sursă mai mică]

- Deja descris în [research/01](research/01-spam-update-august-2026-stadiu.md)
  ([sursa, 27.08.2026](https://southasiadigital.com/job-board-google-spam-update-recovery-case-study/)):
  lovit după spam update-ul din iunie, reparat, **~7 săptămâni la zero**, revenire
  **exact la startul următorului spam update** (august). Recuperare parțială: ~13% din
  clicurile de dinainte în prima lună. E singurul caz 2026 documentat pas cu pas și
  susține modelul „reevaluare la următorul refresh”. Un singur caz, de la o agenție
  mică — nu e regulă.

### Cyrus Shepard (Zyppy), Marie Haynes, Aleyda Solis, Kevin Indig, Mark Williams-Cook

- **Cyrus Shepard** a studiat site-uri lovite de Helpful Content Update (2023): ce a
  corelat cu recuperarea au fost experiența reală la persoana întâi, mai puține
  reclame intruzive, pruning. E despre HCU, nu despre spam, și e corelație, nu cauză
  ([rezumat Practical Ecommerce](https://www.practicalecommerce.com/helpful-content-recovery-per-studies)).
  Tot el a raportat public că un test de disavow „n-a făcut nimic”
  ([interviu](https://unscriptedseo.com/cyrus-shepard-brand-signals-disavow/)).
  Procentele „22% recuperate” / „3× la pruning” circulă pe bloguri cu atribuiri
  diferite; **n-am putut să le leg de un studiu primar**. [NEVERIFICAT]
- **Marie Haynes, Aleyda Solis, Kevin Indig, Mark Williams-Cook:** n-am găsit
  analize publicate de ei despre recuperarea din spam update-urile din 2026. Nu le
  atribui nimic.

### Ce e consens între practicieni (fără să fie confirmat de Google)

1. Recuperarea apare, dacă apare, **în trepte, la momentele de update** (spam sau core),
   nu liniar după recrawl. [PRACTICIAN, bine susținut]
2. **Prima reevaluare aduce de obicei recuperare parțială**, nu totală. [PRACTICIAN, puține cazuri]
3. **Consolidarea bate poleirea** pe seturi de pagini aproape identice. [PRACTICIAN]
4. **Nu te oprești după curățenie:** conținut nou bun, rar și verificat, plus linkuri
   câștigate, sunt parte din semnal. [PRACTICIAN, Gabe explicit]

---

## Ce înseamnă pentru noi

### Ce am făcut (09.09) și cum se leagă de surse

| Acțiune | Ce spun sursele | Verdict |
|---|---|---|
| 122 de pagini doorway/subțiri → 301 spre părintele tematic | Corect dacă ținta e echivalentă tematic; altfel soft 404 (tot ieșire din index, deci nu strică). | ✅ Corect. De verificat în GSC că URL-urile vechi apar ca „Pagină cu redirecționare”, nu ca soft 404 în masă. |
| Sitemap curatoriat | Consecvent cu „toate paginile indexate contează”. | ✅ |
| Schema falsă scoasă (aggregateRating, Person fabricat, date de umplutură) | Nu e discutat direct în legătură cu spam update-urile, dar e exact tipul de semnal de „autoritate fabricată” din politici. | ✅ |
| Autor real, disclosure, linkuri interne refăcute | Parte din „valoare demonstrată”; nu e un comutator. | ✅ necesar, nu suficient |
| Rescrieri pe loturi (20 livrate, 12 rămase, lotul 4 = 9 pagini `/servicii/`) | Rescrieri reale, cu surse primare = da. Loturi mari = contrar regulii noastre de 1–2 pagini/săptămână. | ⚠️ vezi mai jos |

### Ce lipsește sau e riscant

1. **Paginile `/servicii/` în sine.** Clusterul care a căzut 97% e tocmai cel încă
   nerescris (lotul 4). E corect să fie cele mai bune pagini de pe site — dar **nu
   le rescriem toate în fereastra 24.09–08.10**. Motivul nu e că Google penalizează
   schimbarea, ci că n-am mai putea separa efectul update-ului de efectul rescrierii.
   Recomandare: 1–2 pagini/săptămână, începând după ce se termină rollout-ul.
2. **Erorile de fond rămase** (calculatorul de cadastru cu „120 lei”, PDF-ul de
   checklist, „5 zile” la cazier fiscal, „primăria din localitatea de naștere” la
   certificat de naștere). Astea le reparăm **acum**: sunt corecturi punctuale, nu
   schimbări de structură, și contradicțiile de fapt sunt exact ce subminează
   încrederea.
3. **Semnale de încredere din afara site-ului.** Gabe insistă pe linkuri câștigate.
   Avem pachetul de backlinkuri din iulie (advertoriale). Nu mai cumpărăm; căutăm
   mențiuni reale (presă, parteneri, instituții care citează ghidurile). [PRACTICIAN]
4. **documentero.ro (lansat 21.09).** E brand separat, cu conținut propriu, deci nu e o
   „mutare de domeniu”. Riscul apare dacă (a) copiem texte eghiseul acolo, (b) facem
   redirecturi eghiseul → documentero pe paginile căzute, sau (c) construim aceeași
   rețea de pagini din șablon. Mueller: Google recunoaște conținut deja indexat și
   poate transfera semnalele și fără redirect. Linkurile de text declarate, deja
   puse, sunt în regulă; **nu adăugăm redirecturi**.

### Ce NU facem

- **Nu cerem reconsiderare.** Nu avem acțiune manuală (verificat); cererea nu există
  pentru demotări algoritmice. [CONFIRMAT]
- **Nu facem disavow.** Update-urile din august și septembrie nu sunt de link spam.
  Mueller a legat explicit o cădere de spam update, nu de disavow. [CONFIRMAT]
- **Nu mutăm site-ul pe domeniu nou și nu redirecționăm eghiseul spre alt domeniu.**
  Semnalele urmează conținutul; un domeniu nou pleacă de la zero autoritate, iar dacă
  e recunoscut ca același site, pleacă cu demotarea. Cel mai rău din ambele lumi.
  [CONFIRMAT + PRACTICIAN]
- **Nu restaurăm paginile șterse** dacă update-ul din septembrie nu aduce nimic. Asta
  ar reface exact amprenta pentru care am fost demotați.
- **Nu publicăm loturi de pagini noi** (nici pe eghiseul, nici pe documentero).
- **Nu judecăm nimic înainte de ~15.10** (rollout + ~1 săptămână de date GSC stabile).

### Scenarii pentru update-ul din septembrie

| Scenariu | Probabilitate (opinia noastră) | Ce facem |
|---|---|---|
| **A. Recuperare parțială vizibilă** (expuneri `/servicii/` în creștere clară, nu zgomot) | mică spre medie — curățenia e recentă, dar e un update mai lung | Nu schimbăm direcția; continuăm 1–2 pagini/săpt. |
| **B. Nicio schimbare** | cea mai probabilă | Normal. Sistemul probabil n-a apucat să vadă site-ul curat. Următoarele ferestre: core update (neanunțat) sau spam update (istoric la 1–3 luni: mar → iun → aug → sep). |
| **C. Cădere suplimentară** | mică | Verificăm ce a rămas din amprentă: cele 27 de județe CF template, perechile cu Jaccard mare, calculatoarele cu conținut subțire. |

---

## Ce urmărim și când

### Calendar

| Dată | Ce |
|---|---|
| **24.09 → ~08.10.2026** | Rollout September 2026 Spam Update. Doar observăm; reparăm erori de fond, nu restructurăm. |
| **~15.10.2026** | Prima lectură: săptămâna după încheierea rollout-ului vs. ultimele 4 săptămâni. |
| **necunoscut** | Următorul core update. În 2026 au fost martie și mai; nu există anunț. E a doua fereastră probabilă. [NEVERIFICAT ca dată] |
| **noiembrie 2026 – februarie 2027** | Fereastra realistă pentru o recuperare parțială, dacă nu vine în septembrie (3–6 luni de la 09.09). [OPINIE, pe baza cazurilor de 5 luni și 7 săptămâni] |
| **martie 2027** | Punct de decizie: dacă nimic nu s-a mișcat după 6 luni și cel puțin două update-uri, reevaluăm strategia de fond (nu doar paginile). |

### Indicatori în GSC, în ordinea în care ar trebui să apară

1. **Expuneri** pe `/servicii/` (fără ANCPI). Baseline: ~0,8k/săptămână, față de 29,1k
   înainte. Semnal real = creștere susținută pe ≥7 zile, nu un vârf de o zi.
2. **Număr de interogări distincte** pe care apare clusterul — revenirea în index pe
   interogări de coadă apare de obicei înaintea clicurilor.
3. **Poziția pe setul fix de interogări-țintă**, verificată în SERP real cu `&pws=0`
   (nu doar media din GSC).
4. **Raportul de indexare:** paginile păstrate trebuie să fie „Indexată”, cele 122 pe
   „Pagină cu redirecționare”. Creștere mare la „Accesată – momentan neindexată” pe
   paginile păstrate = semnal de calitate în continuare slab.
5. **Crawl stats:** crawlul pe `/servicii/` ar trebui să continue; o scădere bruscă
   a interesului Googlebot pe cluster e semn rău.
6. **Clicuri și comenzi plătite din organic** — ultimele care se mișcă.
7. **Secțiunea Acțiuni manuale:** o verificăm lunar; trebuie să rămână goală.

### Ce NU e semnal

- Volatilitatea din trackere (Semrush Sensor etc.) — e pentru tot webul, nu pentru noi.
- O zi bună izolată.
- Modificări în trafic pe calculatoare — ele n-au căzut, nu măsoară recuperarea.

---

## Cifre din planul nostru pe care nu le-am putut verifica

`PLAN-RECUPERARE.md` §9 citează: „Glenn Gabe, ~400 de site-uri HCU, doar 22% au
recuperat ≥20%”; „Lily Ray: 129 din 130 au continuat să scadă”; „HouseFresh: 2 ani și
o lună”. La 25.09 n-am găsit sursa primară pentru niciuna. Apar pe bloguri secundare,
cu atribuiri inconsecvente (de ex. „22%” e pus și pe seama lui Cyrus Shepard).
**Concluzia din plan rămâne valabilă** („nu construi bugetul pe recuperare”), dar
cifrele nu trebuie citate mai departe ca fapte până nu găsim sursele.

---

## Surse

**Google (oficial)**
- Search Status Dashboard — September 2026 spam update, 24.09.2026 — https://status.search.google.com/incidents/XhUDXP7A67iHCD2kmbVu
- Search Central — Spam updates (actualizat 10.12.2025) — https://developers.google.com/search/docs/appearance/spam-updates
- Search Central — Spam policies (actualizat 28.08.2026) — https://developers.google.com/search/docs/essentials/spam-policies
- Search Central — Core updates (actualizat 10.12.2025) — https://developers.google.com/search/docs/appearance/core-updates

**Presă SEO care citează Google**
- Search Engine Roundtable — September 2026 Spam Update Is Rolling Out, 24.09.2026 — https://www.seroundtable.com/google-september-2026-spam-update-42163.html
- Search Engine Journal — Google Rolls Out September 2026 Spam Update Globally, 24–25.09.2026 — https://www.searchenginejournal.com/google-september-2026-spam-update/590828/
- Search Engine Land — Google releases September 2026 spam update, 24.09.2026 (403 la citire automată) — https://searchengineland.com/google-releases-september-2026-spam-update-491267
- PPC Land — Sites breaking Google spam rules face lower rankings in two-week window, 24–25.09.2026 — https://ppc.land/sites-breaking-google-spam-rules-face-lower-rankings-in-two-week-window/
- Search Engine Roundtable — Google Can Lose Faith In Sites Based On Low Value Programmatic SEO Pages, 07.09.2026 — https://www.seroundtable.com/google-lose-faith-42032.html
- Search Engine Journal — Google Says Old Low-Value Pages May Affect Site Recovery, 08.09.2026 — https://www.searchenginejournal.com/google-says-old-low-value-pages-may-affect-site-recovery/588837/
- Search Engine Journal — Google Says Ranking Recovery Takes Months After SEO Issues Are Fixed, ~septembrie 2026 — https://www.searchenginejournal.com/google-says-ranking-recovery-takes-months-after-seo-issues-are-fixed/588268/
- Search Engine Journal — SEO Pulse (Mueller on recovery), 05.09.2026 — https://www.searchenginejournal.com/seo-pulse-search-console-ai-reports-go-global-mueller-recovery/588443/
- Search Engine Roundtable — Google Won't Enforce Its Site Reputation Policy In The EEA, 28.08.2026 — https://www.seroundtable.com/google-site-reputation-policy-eea-41968.html
- Search Engine Land — Danny Sullivan no longer the Google Search Liaison, 2025 — https://searchengineland.com/danny-sullivan-no-longer-the-google-search-liaison-459864
- Search Engine Land — Recovery uncertain: Danny Sullivan on algorithm impacts, 2024 — https://searchengineland.com/google-danny-sullivan-algorithm-update-recovery-uncertain-446317
- Search Engine Journal — Google On Scaled Content: „It's Going To Be An Issue”, 2025 — https://www.searchenginejournal.com/google-on-scaled-content-its-going-to-be-an-issue/543308/
- Search Engine Journal — Mueller clarifies 404 & 410 — https://www.searchenginejournal.com/googles-john-mueller-clarifies-404-410-confusion-for-seo/513576/
- Search Engine Roundtable — Do not 301 dead pages to your home page — https://www.seroundtable.com/301-404-pages-to-your-home-page-26923.html
- Search Engine Roundtable — Redirecting spammy links from similar domain won't trick Google — https://www.seroundtable.com/google-redirect-spammy-links-similar-domain-27198.html
- Search Engine Land — Hiding from a Google penalty? It may find you at your new home (vechi, 2014) — https://searchengineland.com/hiding-google-penalty-may-find-new-home-185353

**Practicieni**
- GSQi (Glenn Gabe) — August 2026 Spam Update case studies, 31.08.2026 — https://www.gsqi.com/marketing-blog/august-2026-google-spam-update-case-studies/
- GSQi — December 2024 Spam Update, 5 case studies, 01.2025 — https://www.gsqi.com/marketing-blog/google-december-2024-spam-update-case-studies/
- GSQi — Remove versus improve low-quality content, 02.11.2017 — https://www.gsqi.com/marketing-blog/remove-versus-improve-low-quality-thin-content/
- GSQi — 301 redirects to less-relevant pages are soft 404s — https://www.gsqi.com/marketing-blog/redirects-less-relevant-pages-soft-404s/
- Lily Ray — It Works Until It Doesn't: AI Content Strategies That Backfire — https://lilyraynyc.substack.com/p/it-works-until-it-doesnt-ai-content-risks
- South Asia Digital — job board recovery case study, 27.08.2026 — https://southasiadigital.com/job-board-google-spam-update-recovery-case-study/
- Practical Ecommerce — Helpful Content Recovery, per Studies (Cyrus Shepard) — https://www.practicalecommerce.com/helpful-content-recovery-per-studies
- UnscriptedSEO — Cyrus Shepard: the disavow test that did nothing — https://unscriptedseo.com/cyrus-shepard-brand-signals-disavow/
