# Căderea de la mijlocul lui octombrie 2026: diagnostic și urmărire săptămânală

**Data:** 03.11.2026 · **Site-uri:** cazierjudiciaronline.com (CJO), eghiseul.ro, ecazier.ro · **Surse:** GSC API (contul de serviciu `claude-seo`), comenzile plătite din ambele baze de date, SERP-ul real verificat cu `&pws=0&gl=ro`.

> **Precizare, 04.11:** fereastra de mai jos rămâne corectă: pe CJO ruptura e pe 18–19.10. Pozițiile n-au coborât doar puțin: pe paginile de oraș 4,83 → 5,84, pe cele comerciale 6,76 → 9,05, iar ghidurile aproape își țin locul. Vezi [diagnosticul CJO](2026-11-04-cjo-diagnostic-trafic.md).

## Pe scurt

- Vânzările scad lună de lună: august 320 comenzi / 77,3k lei, septembrie 202 / 57,4k, octombrie 150 / 44,9k.
- Începutul lui noiembrie e mai slab: 8 comenzi în 1–3.11 (duminică–marți, marți până la 12:00), față de 15 în 25–27.10. CJO nu a avut nicio comandă plătită între 30.10 și 02.11. Site-ul funcționează normal.
- Cauza e traficul din Google, nu site-ul. Clicurile pe CJO și pe eghiseul cad în aceleași zile, **16–19 octombrie**, pe două domenii separate. Google nu a anunțat niciun update în octombrie. Spam update-ul din septembrie s-a terminat pe 8.10.
- Pe căutările de cazier, cererea a rămas aceeași (expunerile pe orașe sunt stabile). Pozițiile au scăzut puțin, dar clicurile s-au prăbușit.

## Cifrele

### Clicuri GSC, media pe zi lucrătoare (luni–vineri)

| Site | 5–9.10 | 26–30.10 | Variație |
|---|---|---|---|
| CJO | 491 | 155 | −68% |
| eghiseul | 673 | 378 | −44% |
| ecazier | — | — | 54 de clicuri în toată luna octombrie |

### Paginile de oraș CJO (5–9.10 față de 26–30.10)

| Pagina | Clicuri | Poziție medie |
|---|---|---|
| /cazier-judiciar-online/craiova | 147 → 28 | 3,8 → 4,2 |
| /cazier-judiciar-online/iasi | 135 → 14 | 5,1 → 6,5 |
| /cazier-judiciar-online/timisoara | 110 → 20 | 4,4 → 6,4 |
| /cazier-judiciar-online/ploiesti | 104 → 14 | 3,6 → 5,2 |
| /cazier-judiciar-online/brasov | 88 → 12 | 4,6 → 6,4 |
| /cazier-judiciar-online/buzau | 86 → 7 | 3,0 → 4,4 |
| /cerere-cazier-judiciar-model | 118 → 62 | 6,2 → 5,6 |

Pe interogări: „cazier iasi” 51 → 2 clicuri, poziția 2,1 → 5,0, expuneri 460 → 438. „cazier judiciar online” 36 → 9 clicuri, poziția 6,8 → 9,3, expuneri 5.837 → 2.574.

## Ce e în pagina de rezultate (03.11, `pws=0`)

Verificat pe 6 căutări: cazier iasi, cazier judiciar online, cazier judiciar craiova, cazier timisoara, cazier judiciar, cazier auto online.

1. **Fără răspuns AI (AI Overview) pe niciuna.**
2. **Hub MAI e pe locul 1–2 peste tot**, cu titlul „Serviciu GRATUIT pentru certificatul de cazier judiciar”. La „cazier judiciar online” ocupă 3 din primele 8 locuri. Pe orașe, sus mai apar Poliția (IPJ) și **digigov.ro**, un concurent nou, neanalizat încă.
3. **Concurenții au reclame Google pe caziere. Noi suntem blocați de politica „documente guvernamentale”.**

| Căutare | Reclame |
|---|---|
| cazier judiciar online | infocazier, caziere.ro, roghiseul |
| cazier timisoara | roghiseul, obtinecazier |
| cazier judiciar | infocazier, obtinecazier, roghiseul |
| cazier judiciar craiova | roghiseul |

4. CJO a rămas pe locul 3–5. Dar sub un „GRATUIT” de la stat și sub 2–4 reclame, clicurile organice pe locul 3–5 sunt puține.

**Concluzie:** nu ne-a lovit o penalizare nouă. Ne-a strâns pagina de rezultate: serviciul gratuit al statului e sus, iar concurenții plătesc reclame deasupra noastră. Clientul dispus să plătească ajunge la ei.

## Ce facem

| # | Acțiune | Cine / când | Stare |
|---|---|---|---|
| 1 | Google Ads pe caziere: verificăm răspunsul Google (termen 26.10), apoi escaladăm cu dovada că 4 concurenți rulează reclame pe aceleași căutări | Raul, săptămâna 3–9.11 | de făcut |
| 2 | Titlurile și descrierile paginilor de oraș CJO scrise pentru cine NU poate folosi Hub MAI (în străinătate, fără card românesc cu 3D Secure, cu apostilă sau traducere, firme), plus date proprii pe pagină. 1–2 pagini pe săptămână, începând cu Craiova, Iași, Timișoara | dev | de făcut |
| 3 | Test Microsoft Advertising pe caziere, 20–30 lei pe zi | Raul (cont) + dev (tracking) | de decis |
| 4 | Analiza digigov.ro (pagini, ce oferă, de când e sus) | dev | de făcut |

## Urmărire săptămânală

O completăm în fiecare luni, pentru săptămâna trecută. Clicurile sunt media pe zi lucrătoare (GSC are 2–3 zile întârziere). Comenzile sunt plătite, fără test și fără anulate.

| Săptămâna | Comenzi eghiseul | Comenzi CJO | Total lei | Clicuri/zi CJO | Clicuri/zi eghiseul | Poziția „cazier iasi” | Notă |
|---|---|---|---|---|---|---|---|
| 05–11.10 (referință) | — | — | — | 491 | 673 | 2,1 | înainte de cădere |
| 26.10–01.11 (bază) | 20 | 11 | 7.601 | 155 | 378 | 5,0 | după cădere |
| 02–08.11 | | | | | | | |
| 09–15.11 | | | | | | | |
| 16–22.11 | | | | | | | |

**Semnal de revenire:** clicuri CJO peste 250/zi două săptămâni la rând sau peste 25 de comenzi CJO pe săptămână. **Semnal de alarmă:** CJO sub 100 de clicuri/zi sau o săptămână cu sub 5 comenzi CJO.

## Verificare 05.11: formularul CJO nu e cauza

Comenzile plătite CJO păreau să cadă de la 13 la 2 pe săptămână din 28.10. Verificat pe date: conversia a rămas stabilă, deci cauza e traficul.

- Clicuri GSC pe săptămână: 2.813 (05–11.10), 2.456, 1.381, 891 (26.10–01.11). Orașele au scăzut cel mai mult: 2.082 → 525.
- Comenzi plătite din sesiuni: 7,7% (01–15.10), 7,2% (16–22.10), 9,8% (23.10–02.11), 8,8% (03–05.11).
- Săptămâna cu 13 comenzi a fost umflată de 26–27.10 (10 comenzi, 4 recuperate). Scăderea reală începe pe 16–19.10.
- Fără legătură: OCR-ul oprit în 23.10–02.11 (extragerea e doar în admin), codul (zero commit-uri 18.10–02.11), prețul (schimbat pe 02.11), erorile server pe `/api`.

Formularul a fost testat live pe mobil până la pasul 5, fără plată. Pasul 6 și plata sunt susținute doar de comenzile plătite din 03–05.11.

De urmărit: abandonul la pasul 2 a urcat de la 31% la 46–50% din 23.10, cu cod neschimbat. Ipoteza e un trafic cu intenție mai slabă, nedovedită. Cazier fiscal: 13 comenzi plătite în 01–27.10, zero după.

Raportul lunar (28 față de 28 de zile) rămâne în [`monitorizare/`](monitorizare/README.md).
