# CJO: de ce scade traficul din Google și ce facem (04.11.2026)

**Concluzie:** nu există defecțiune tehnică și nici acțiune manuală: Search Console arată „Nu au fost detectate probleme” la Acțiuni manuale și la Securitate, iar toate cele 71 de pagini din sitemap sunt indexate. Căderea mare vine pe 18–19.10 pe CJO, iar eghiseul scade în aceleași zile, fără nicio modificare pe paginile publice CJO în acea perioadă. Lovește mai ales paginile care vând și mult mai puțin ghidurile. Cererea rămâne aproape neschimbată. Cauza cea mai probabilă e o schimbare de clasament în Google, neanunțată, dar asta e dedus, nu dovedit.

## Când începe

Clicuri zilnice din Search Console, comparate cu aceeași zi din săptămâna precedentă. Vinerea și sâmbăta sunt mereu mult mai slabe, deci compararea cu ziua de dinainte induce în eroare. Search Console raportează pe ora Pacificului, adică ziua lui începe la 10:00 în România.

| Zi | CJO | eghiseul |
|---|---|---|
| 13.10 | −4% | +10% |
| 15.10 | −14% | −20% |
| 16.10 | −16% | −17% |
| 17.10 | −6% | −29% |
| 18.10 | −37% | −28% |
| 19.10 | −40% | −36% |
| 21.10 | −47% | −40% |
| 26.10 | −35% | −9% |
| 28.10 | −31% | −6% |
| 02.11 | −29% | −18% |

- **Ruptura CJO e pe 18–19.10.** eghiseul începe să slăbească din 15–17.10 și ajunge la −36% pe 19.10.
- **Anomalia principală: eghiseul se oprește, CJO nu.** Din 25.10 eghiseul rămâne aproape stabil, la nivelul mai mic. CJO scade cu încă 30–40% în fiecare dintre săptămânile următoare.
- **Coborâri scurte în plus:** 23–24.10, când poziția medie CJO ajunge la 8,9–9,3, și 31.10. Search Engine Roundtable notează volatilitate în aceleași perioade.
- **Clicurile scad și la poziție egală, dar proba e mică.** Pe doar 17 interogări cu poziția neschimbată, CTR-ul trece de la 7,18% la 5,05%. Exemplu: „cazier oradea”, poziția 2,0 → 2,2, CTR 12,6% → 8,5%. Pe cele 196 de interogări care au coborât peste un loc, CTR-ul trece de la 3,63% la 1,18%.

> **Corecție la ce am scris mai devreme azi.** Am dat întâi 5–11.10, apoi 16.10. Ambele erau greșite: prima venea din medii săptămânale pe interogări, a doua din compararea unei zile de vineri cu o zi de joi. Comparația pe aceeași zi din săptămână arată 18–19.10 pe CJO, în fereastra 16–19.10 din documentul din 03.11. Pe 05–15.10 există doar o alunecare mică pe interogările de oraș (2,8 → 3,3 → 3,9).

## Ce a fost lovit

Comparație pe câte 14 zile, 28.09–11.10 față de 19.10–01.11. Grupurile sunt făcute de mine, după URL.

| Pagini | Clicuri | Expuneri | Poziție |
|---|---|---|---|
| Orașe | 4.307 → 1.380 (−68%) | 78.657 → 61.432 (−22%) | 4,83 → 5,84 |
| Acasă | 174 → 72 (−59%) | 30.383 → 16.744 (−45%) | 7,44 → 8,63 |
| Comerciale (auto, fiscal, gratuit, eliberare) | 428 → 198 (−54%) | 33.557 → 20.490 (−39%) | 6,76 → 9,05 |
| Ghiduri și informații | 917 → 622 (−32%) | 50.820 → 34.415 (−32%) | 6,27 → 6,59 |

- **Ghidurile aproape își țin locul.** Exemple: `/valabilitate-cazier-judiciar` 4,3 → 4,4, `/dupa-cat-timp-se-sterge-cazierul` 3,9 → 4,1, `/cerere-cazier-judiciar-model` 5,8 → 5,6.
- **Paginile de vânzare coboară mult.** Exemple: `/cazier-auto-online` 6,3 → 8,8, `/cazier-judiciar-gratuit` 6,6 → 9,2.
- **La orașe, un loc pierdut costă mult.** De la locul 3–4 la locul 5–6, sub poliție, hartă și Hub MAI, clicurile scad mult mai repede decât poziția.
- **Căutarea principală a ieșit de pe prima pagină.** „cazier judiciar online”: poziția 6,0 → 9,3, expuneri 7.293 → 2.932, clicuri 46 → 10. Verificat și live, cu `pws=0`: suntem pe pagina a doua.
- **Exemplu pe interogare:** „cazier iasi” are aceleași expuneri (488 → 505), dar poziția 2,1 → 5,2 și clicurile 60 → 3.

## Ce am verificat

| Verificare | Rezultat |
|---|---|
| URL Inspection pe toate cele 71 de URL-uri din sitemap | 71/71 indexate, preluare reușită, permise de robots, preluate pe mobil |
| Cât de des trece Google | Mediană: o zi de la ultima preluare; maximum 36 de zile |
| Răspuns la user-agent de Googlebot | 200, fără `noindex`, canonical corect |
| Sitemap | 0 erori |
| CrUX, mobil | LCP 2,1 s, INP 133 ms, CLS 0 |
| Safe Browsing | Curat |
| Conținut spam pe pagina principală | Nimic |
| Google Trends, „cazier judiciar”, România | Stabil: 74–76 la începutul lui octombrie, 66–74 după. Nu explică scăderea |
| Modificări pe paginile publice CJO, 13.10–01.11 | Niciuna. Singurul commit din 13–20.10 ține de facturare |
| Anomalii de date anunțate de Google | Nimic pentru performanța din Search |

Două alarme din URL Inspection s-au dovedit false:

- **Canonical diferit pe pagina principală:** e doar bara finală din URL.
- **Eroare de date structurate pe `/certificat-integritate-comportamentala`:** vine din preluarea de pe 02.11, 08:12. Schema `Product` nu mai e pe pagină.

### Rapoartele din Search Console, citite pe 04.11

Contul `serviciiseonethut` a primit acces de proprietar delegat pe 04.11, fără modificări DNS.

| Raport | Rezultat |
|---|---|
| Acțiuni manuale, CJO și eghiseul | Nu au fost detectate probleme |
| Probleme de securitate, CJO | Nu au fost detectate probleme |
| Indexare, pagini din sitemap | 71 indexate, 0 neindexate (date până pe 23.10) |
| Indexare, toate URL-urile cunoscute | 76 indexate, 642 neindexate; numărul e stabil din septembrie |
| Statistici de accesare | 4.220 de solicitări de la 21.09, 92% cu 200, 7% cu 301, sub 1% cu 404, răspuns mediu 301 ms; niciun semnal de problemă la gazdă |
| Mesaje | Avertismente de date structurate pe 22.09 și 06.10; nimic despre spam, politici sau indexare în octombrie |
| Linkuri externe, CJO | 63 de la 31 de site-uri |
| Linkuri externe, eghiseul | 207 |

- **Cele 642 de URL-uri neindexate nu sunt pagini din sitemap.** 584 sunt „Accesată cu crawlere – nu este indexată”. Am citit primele 10 exemple: fișiere `/_next/static`, `favicon` și imagini `/og`. Restul listei nu l-am putut deschide. Nu e semn de pagini de conținut pierdute.
- **Am pierdut fragmentele cu recenzii:** de la 3.706 expuneri și 41 de clicuri în 28.09–11.10 la zero în 19.10–01.11. Fragmentele de produs au scăzut de la 171 la 94 de clicuri. Efectul e mic față de scăderea totală. Nu le readucem fără recenzii reale, vizibile pe pagină.

### Concurenții, comparație pe pagină

Am citit în browser paginile principale ale concurenților și pagina de Iași de la Caziere.ro.

- **Caziere.ro** n-are date structurate și nu are preț vizibil în text. Formularul stă în primul ecran. Are 2.101 cuvinte pe prima pagină și 1.876 pe pagina de Iași.
- **Infocazier** arată 189 lei, mai puțin decât cei 198 lei ai noștri, și are 86 de linkuri interne pe prima pagină.
- **Obtinecazier** arată 249 RON, cu formularul în primul ecran, și are doar 616 cuvinte.
- **Conținutul de pe pagină nu explică singur diferența.** Paginile CJO au preț, firma și neafilierea. Concurenții de deasupra nu sunt evident mai bogați.

**Neverificat:**

- **Cum arăta SERP-ul înainte de 16.10.** Nu avem istoric, deci nu putem dovedi cine a urcat în locul nostru.
- **Linkurile concurenților și linkurile pierdute de CJO.** Search Console arată doar linkurile noastre, fără istoric. Comparația cere un cont Moz sau alt instrument.
- **Googlebot în logurile Vercel.** Logurile n-au user-agent. Statisticile de accesare acoperă această verificare.

## Alte lucruri găsite

- **Site-ul nu are căutări de brand în Search Console.** Căutarea „cazierjudiciaronline” e corectată de Google în „cazier judiciar online”, iar pe prima pagină nu suntem. Cu `.com` apărem, dar după reclame și concurenți. Traficul depinde aproape complet de căutările generice, deci nu avem o bază care să amortizeze o coborâre.
- **Patru pagini live cu expuneri lipsesc din sitemap:** `/verificare-cazier-fiscal-online` (112 clicuri, 2.847 expuneri în 6 săptămâni), `/cazier-fiscal-pentru-cetatean-strain` (24; 2.744), `/cazier-fiscal-pentru-credit-bancar` și `/cazier-fiscal-pentru-licitatii-publice`. Nu am găsit un motiv scris pentru excludere. Nu explică scăderea.
- **`/cazier-fiscal-persoana-juridica` a coborât separat:** 6,5 → 18,4, încă de dinainte de 16.10. Pagina s-a schimbat pe 05–06.10, deci e de citit separat de restul.
- **URL-uri vechi:** câteva dau 404 și au doar 1–39 expuneri. Impact mic. Estimarea `site:` de circa 172 de rezultate nu este o numărătoare exactă. Search Console arată 91 de pagini cu expuneri.

## Cauze posibile, în ordinea probabilității

1. **Google a schimbat cum clasează paginile comerciale din această nișă.** Susțin asta data comună pe două domenii, lipsa modificărilor noastre și faptul că ghidurile au rezistat. Google n-a anunțat nimic, deci rămâne o deducție.
2. **Rezultatele oficiale și concurenții au urcat.** Azi, pe căutările verificate, poliția, Hub MAI, DigiGov, Caziere.ro și infocazier stau deasupra sau aproape. Poate fi efectul aceleiași schimbări. Fără istoric nu putem separa cele două cauze.
3. **Schimbările noastre din 05–12.10.** Nu explică ruptura de pe 18–19.10: după rescrierea orașelor, poziția a rămas 4,7, apoi a urcat la 4,3. Pot explica alunecarea mică de pe interogările de oraș. Nu putem exclude o reevaluare întârziată, dar eghiseul a căzut în aceeași zi, iar rescrierea orașelor a fost făcută doar pe CJO.
4. **Autoritate slabă a domeniului.** CJO are doar 63 de linkuri externe de la 31 de site-uri și nicio căutare de brand. Asta nu explică data căderii, dar poate explica de ce CJO continuă să scadă, iar eghiseul nu. Numărul de linkuri nu spune nimic despre concurenți, fiindcă nu avem datele lor.

**Excluse:** acțiune manuală, problemă de securitate, problemă tehnică sau de indexare. Cererea mai mică nu explică scăderea.

### E cineva în spatele problemelor?

Nu avem nicio dovadă. Nu putem exclude complet raportări făcute de concurenți, fiindcă Google nu le arată.

- **Semne de sabotaj organic: nu am găsit.** Fără acțiune manuală, fără site spart, fără interogări de spam sau de atac la reputație în datele CJO. Lista de linkuri CJO citită (25 din 31 de site-uri) nu arată un val de linkuri spam. La eghiseul am văzut doar primele 5 site-uri; `atsameip.com` e un agregator banal.
- **Nu toate site-urile scad.** ecazier.ro crește în expuneri, de la 270 la 695 pe săptămână, iar documentero.ro e stabil, dar ambele sunt mici.
- **Ce au în comun CJO și eghiseul:** aceeași nișă, același tip de serviciu, aceeași regulă Google Ads pentru documente guvernamentale, același spam update. O cauză comună e mai simplă decât un atacator.
- **Google Ads:** blocarea a venit în jurul datei de 05.08 și se întemeiază pe politica de categorie. O raportare de la un concurent e posibilă, dar nu se vede din datele noastre.
- **O coincidență de urmărit, nu o dovadă:** pe 12.10 am raportat concurenți la Google și am trimis sesizări la ANCOM și Consiliul Concurenței, iar căderea vine la 6–7 zile după. Nu există niciun indiciu că are legătură.

## Ce facem

1. **Urmărim săptămânal dacă CJO se oprește din scădere,** cum s-a oprit eghiseul. Comparăm pe aceeași zi din săptămână, nu pe zile consecutive.
2. **Nu dăm înapoi rescrierea orașelor din 05.10.** N-a produs ruptura, iar varianta veche avea paginile aproape identice (0,76–0,92 mascat).
3. **Pauză pe schimbări în masă până pe 17.11.** Pe 02.11 s-au schimbat multe, iar efectul trebuie măsurat curat.
4. **Pe 17.11 comparăm Iași, Brașov, Timișoara cu restul orașelor,** față de 26.10–01.11. Dacă varianta „Pe scurt” câștigă: 1–2 orașe pe săptămână.
5. **Pagina principală și „cazier judiciar online”:** după 17.11 stabilim ce schimbăm, pornind de la ce arată comparația cu concurenții.
6. **Corecturi mici, fără risc:** cele patru pagini lipsă se adaugă în sitemap; rămâne de verificat `/cazier-fiscal-persoana-juridica`.
7. **Construim brandul CJO pe termen lung.** Google Business, recenzii proprii, mențiuni reale. Recenziile merg acum spre profilul eGhiseul.
8. **Canale în afară de Google organic:** escaladarea Google Ads și testul Microsoft Ads, ca vânzările să nu depindă de o singură sursă.

## Ce nu facem

- Nu ștergem în masă pagini de oraș și nu rescriem tot site-ul dintr-odată.
- Nu schimbăm din nou toate titlurile. Le-am schimbat pe 07.10 și 02.11, iar altă schimbare ar strica măsurătoarea.
- Nu cerem reindexare în buclă și nu folosim Indexing API pentru aceste pagini.
- Nu cumpărăm linkuri în grabă și nu facem disavow fără dovezi.
- Nu publicăm loturi de pagini noi și nu punem date proaspete fără conținut schimbat.
- Nu luăm decizii după Semrush, forumuri sau 1–2 zile de date.

## Ce spun Google și specialiștii

**Confirmat de Google:**

- Ultimul update anunțat este spam update-ul din septembrie: 24.09 – aproximativ 7–8.10. Pentru octombrie și noiembrie nu există niciun update pe dashboard.
- Ghidul Google pentru scăderi de trafic enumeră mai multe cauze posibile, iar problema tehnică e doar una dintre ele. La o coborâre mică de poziție, cu clicuri mult mai puține, Google recomandă să nu faci schimbări radicale.
- John Mueller, 09.2026, despre site-uri cu multe pagini fără valoare: sistemele pot pierde încrederea în site, iar revenirea cere timp și efort.

**Raportat de comunitate, neconfirmat de Google:**

- Search Engine Roundtable notează volatilitate pe 16, 20–21, 24 și 27.10 și un nou val pe 02.11. Datele din instrumente sunt zgomotoase.
- Glenn Gabe a raportat scăderi mari pe 30.09, în timpul spam update-ului.
- Instrumentele de poziții primesc rezultate alterate de la sfârșitul lui septembrie, deci nu ne bazăm pe ele.
- Pe 03.11, unele site-uri văd o creștere ciudată de clicuri în Search Console. Cifrele foarte recente trebuie citite cu grijă.

## Surse

- [Google: depanarea scăderilor de trafic](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops)
- [Google: istoricul update-urilor de ranking](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history)
- [Google: anomalii de date în Search Console](https://support.google.com/webmasters/answer/6211453)
- [Search Engine Roundtable: volatilitate 27.10](https://www.seroundtable.com/google-search-ranking-volatility-42379.html)
- [Search Engine Roundtable: spam update, faza 3](https://www.seroundtable.com/google-september-2026-spam-update-phase-3-42239.html)
- [Search Engine Roundtable: Mueller despre calitate, 03.11](https://www.seroundtable.com/google-quality-issues-home-page-indexed-42439.html)
- [Search Engine Roundtable: creștere ciudată de clicuri, 03.11](https://www.seroundtable.com/google-performance-reports-spike-clicks-42448.html)
- [Relevant Audience: declarațiile lui Mueller din 09.2026](https://www.relevantaudience.com/seo/john-mueller-programmatic-seo-site-level-trust/)
- [Glenn Gabe: note despre spam update, 01.10](https://x.com/glenngabe/status/2105638422102561193)
- [Small Business Dad: rezumat 19.10–02.11](https://businessdaduk.com/2026/11/02/seo-ppc-digital-marketing-news-19-october-to-2-november-2026/)
