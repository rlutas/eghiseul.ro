# Monitorizare SEO lunară (4 site-uri)

Un raport pe lună pentru eghiseul.ro, documentero.ro, cazierjudiciaronline.com și ecazier.ro:
ultimele 28 de zile față de cele 28 de dinainte, din Google Search Console. Pornit pe 02.11.2026
după analiza infocazier (`../2026-11-02-audit-4-site-uri/`, recomandarea M1).

| Fișier | Ce e |
|---|---|
| `YYYY-MM.md` | raportul lunii: pe scurt, semnale, top 10 schimbări, interogări urmărite, clustere, pagini-cheie, lista de completat pentru concurenți |
| `YYYY-MM.csv` | aceleași cifre, un rând per (secțiune, site, interogare/pagină), pentru Sheets |
| [`2026-11.md`](2026-11.md) | **baseline**: 03.10–30.10.2026 față de 05.09–02.10.2026 |

## Cum se rulează

Din rădăcina repo-ului, o dată pe lună (ideal pe 2–3 ale lunii):

```bash
~/.claude/skills/seo/.venv/bin/python -I scripts/seo/monitor-lunar.py
```

- Durează ~1,5 minute (circa 250 de apeluri GSC).
- Ia credențialele contului de serviciu `claude-seo` din `~/.config/claude-seo/` (sau din variabila
  `GSC_SERVICE_ACCOUNT`). Nu le afișează și nu le scrie nicăieri.
- Fereastra se termină implicit cu 3 zile în urmă, pentru că GSC are întârziere.
- Secțiunea **Bing** (din 10.11.2026): clicuri și afișări pe aceleași două perioade, din API-ul Bing
  Webmaster, cu cheia `bing_api_key` din `~/.config/claude-seo/google-api.json`. Fără cheie, raportul
  iese doar cu GSC. Bing are câteva zile de întârziere, deci ultimele zile pot lipsi.
- Dacă raportul lunii există deja, scriptul refuză să-l suprascrie, ca să nu se piardă ce s-a
  completat de mână. Pentru o rulare nouă: `--force`. Alte opțiuni: `--month 2026-12`,
  `--end-date 2026-11-30`, `--out-dir`.
- După rulare: completezi secțiunea „Concurenți” (vezi mai jos) și comiți `.md` + `.csv` cu căi
  explicite.

Ce urmărește (se schimbă în capul scriptului, nu aici):
- **Interogări fixe**, pe potrivire exactă, cu sau fără diacritice și cu sau fără „de”: cazier judiciar
  (online, simplu, 7 orașe mari, plus comunele Zlatna/Albac/Câmpeni din analiza infocazier), naștere
  (online, online preț, duplicat, duplicat online, pierdut), căsătorie (duplicat, duplicat online),
  extras de carte funciară, certificat constatator, cazier fiscal.
- **Clustere**: toate interogările care conțin „cazier”, „nastere”, „casatorie”, „carte funciara”,
  „constatator”.
- **Pagini-cheie** pe fiecare site (paginile de servicii, hub-urile, orașele mari CJO).
- **Top 10** interogări și pagini după diferența de clicuri, plus top 5 pagini pe fiecare site.

## Concurenții: de mână, nu automat

GSC nu dă pozițiile altor site-uri. SERP-ul Google **nu îl scoatem cu scriptul**: termenii Google
interzic scraping-ul automat, iar ocolirea detecției de boți e exclusă. Raportul are un tabel cu
câte un link pe interogare, cu `pws=0&gl=ro&hl=ro` deja pus.

1. Fereastră privată, fără cont Google logat.
2. Pentru fiecare link: poziția organică a infocazier, eghiseul, CJO, documentero, ecazier (1–20,
   „—” dacă lipsește) și cine are reclame.
3. Ads Transparency pe infocazier (advertiser `AR04106916843048927233`): mai rulează? data ultimei
   afișări, numărul de anunțuri, au apărut reclame pe naștere/căsătorie?

Referința de la care pornim e SERP-ul din 02.11.2026 din
`../2026-11-02-audit-4-site-uri/06-infocazier.md` §1.4 și §2.1.

## Ce citești întâi

1. **Pe scurt**: clicurile pe site față de luna trecută. Dacă apare „comparație incompletă”, citește
   cifra pe zi, nu totalul (proprietatea are istoric scurt în GSC; CJO și ecazier au date din 20.09,
   documentero din 19.09, deci baseline-ul din noiembrie are această notă).
2. **Semnale**: tot ce a trecut de praguri. Fiecare rând e ceva de verificat.
3. **Interogările urmărite** și **paginile de servicii**, nu calculatoarele: ele aduc comenzi.
   Calculatoarele eghiseul domină top 10 prin volum, dar nu vând.
4. **Concurenți**: dacă paginile de comună ale infocazier ies din top 10, Google a început să le
   trateze ca doorway. Dacă reclamele lor se opresc, ipoteza „cabinetul vinde” se revede.

## Praguri care cer acțiune

Scriptul marchează automat (coloana „Semnal”) doar rândurile cu cel puțin 100 de afișări într-una
din perioade; sub atât e zgomot.

| Semnal | Prag | Ce faci |
|---|---|---|
| Total site, clicuri | **−20%** sau mai mult | Verifică dacă e sezon (calculatoarele de pensie/impozit au vârfuri) sau un update Google: compară cu `../2026-09-recuperare-spam-update/`. Dacă scad și paginile de servicii, nu doar calculatoarele, e incident. |
| Interogare/pagină, poziție | **coborât ≥ 3 locuri** | Verifică SERP-ul cu `&pws=0`: cine a urcat peste noi? S-a schimbat pagina noastră recent (changelog)? |
| Interogare/pagină, clicuri | **−30% și cel puțin 20 de clicuri pierdute** | La fel. Dacă poziția e stabilă și afișările cresc, problema e CTR-ul: title/meta, nu conținutul. |
| Pagină-cheie | **dispărută** (avea ≥ 100 afișări, acum 0) | Verifică indexarea (URL Inspection în GSC), redirecturile, `noindex`. Urgent. |
| Concurent | infocazier pierde top 10 pe comune | Notează data; e semnal că paginile pe localități fără ghișeu sunt penalizate. Nu construim nimic pe modelul lor oricum (regula 1). |
| Concurent | infocazier oprește reclamele | Revezi decizia A1 din `../2026-11-02-audit-4-site-uri/06-infocazier.md`. |
| Concurent | apar reclame pe naștere/căsătorie | Piața de reclame pe stare civilă nu mai e liberă; actualizează `docs/ads/`. |

Poziția GSC e o medie: când afișările scad brusc (Google ne arată pe mai puține interogări),
poziția medie poate „urca” fără să fi câștigat nimic. Citește poziția împreună cu afișările.

## Limite

- GSC ascunde interogările rare (anonimizate), deci clusterele sunt sub totalul real al site-ului.
- Interogările fără nicio afișare pe niciun site nu apar în tabel; sunt listate o dată, iar pentru
  ele contează doar SERP-ul manual.
- CSV-ul conține doar date agregate din GSC (interogări cu ≥ 50 de afișări), fără date personale.
