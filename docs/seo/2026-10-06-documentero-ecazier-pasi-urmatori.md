# 06.10.2026 — documentero.ro și ecazier.ro: unde suntem și ce facem mai departe

Sursa: Search Console API (contul de serviciu `claude-seo@caziere`, proprietăți `sc-domain:documentero.ro` și `sc-domain:ecazier.ro`), inspecția URL pe fiecare adresă din sitemap, comenzile din cele două baze (doar citire). Perioada GSC: 06.09–03.10 (28 de zile). Comparația cu cele 28 de zile dinainte nu are sens: ambele proprietăți `sc-domain` au date doar din săptămâna 38, deci perioada anterioară e 0.

## 1. documentero.ro

| Ce | Valoare |
|---|---|
| Afișări / clicuri, 28 de zile | **903 / 11**, CTR 1,2 %, poziție medie 11,3 |
| Pe săptămâni (ISO) | s39: 468 afișări, 9 clicuri · s40: 435, 2 |
| Pagini indexate | **18 din 18** (inspecție URL, toate „Submitted and indexed”, canonical corect) |
| Comenzi, 60 de zile | **4 începute, 0 plătite** (2 naștere 998 lei, 2 celibat 698 lei). Trei s-au oprit la pasul „date personale”, una la „stare civilă”. Toate au email lăsat. Niciuna nu are sursă UTM |

Paginile cu afișări (28 de zile):

| Pagină | Afișări | Clicuri | Poziție |
|---|---|---|---|
| `/certificat-de-celibat/` | 242 | 2 | 7,5 |
| `/extras-multilingv/` | 200 | 5 | 8,0 |
| `/ghiduri/certificat-de-nastere-pierdut/` | 161 | 2 | 14,5 |
| `/ghiduri/acte-necesare-duplicat-certificat-de-nastere/` | 131 | 0 | 13,8 |
| `/ghiduri/apostila-acte-stare-civila/` | 80 | 2 | 23,3 (extins azi) |
| `/certificat-de-nastere/` | 49 | 0 | 20,4 |
| `/certificat-de-casatorie/` | 36 | 0 | 10,9 |

Căutările cu cele mai multe afișări (GSC ascunde o parte din căutări, deci sumele nu bat cu paginile):

| Căutare | Pagină | Afișări | Poziție |
|---|---|---|---|
| certificat de celibat online | celibat | 16 | 8,1 |
| certificat de nastere 2026 | ghid acte duplicat | 13 | 7,2 |
| anexa 18 stare civila | celibat | 10 | 7,8 |
| apostila | ghid apostilă | 9 | 55,2 |
| acte necesare eliberare duplicat certificat de nastere | ghid acte duplicat | 6 | 8,5 |

**Diagnostic.** Domeniu de ~2 săptămâni în Google. Pozițiile 7–15 pe coada lungă sunt normale pentru vârsta lui; nu e o problemă tehnică. Banii lipsesc din două motive: trafic mic (11 clicuri/lună) și **toți cei 4 care au început comanda au abandonat**, la o comandă de 700–1.000 lei.

**Pașii, în ordinea comenzilor așteptate pe efort:**

1. **Recuperarea celor 4 comenzi începute (azi, efort mic).** Au email, valoare totală 3.392 lei. Verificat: recuperarea automată a coșului și coada telefonică rulează și pe `platform='documentero'`? Dacă nu, un telefon sau un email personal din partea echipei. E singurul lucru care poate aduce bani săptămâna asta.
2. **Formularul: de ce se opresc la „date personale” (efort mediu).** 3 din 4 s-au oprit acolo. Pe eghiseul, 65 % din abandonuri sunt la pasul 2 (memoria `abandonuri-pas-2-nu-emailurile`). Pentru diaspora pasul cere act de identitate + date: de verificat pe telefon, cu un pașaport străin/CI românească expirată, ce blochează. Un singur client recuperat valorează cât 2–3 săptămâni de reclamă.
3. **Celibat: CTR (efort mic).** Pagina e pe 7,5 cu 242 afișări și 2 clicuri (0,8 %). Titlul și descrierea au fost schimbate pe 05.10; dacă până pe 19.10 CTR-ul nu trece de ~2 %, se rescriu cu prețul și „din străinătate, fără drum la consulat” în primele 50 de caractere (același tipar care a mers pe CJO).
4. **Ghidul „acte necesare duplicat certificat de naștere” (efort mic).** 131 afișări, poziția 13,8, 0 clicuri, și prinde „certificat de nastere 2026” pe 7,2. Un paragraf de răspuns direct sus (ce acte, unde, cât durează, la orice primărie după H.G. 255/2024) și un link vizibil spre `/certificat-de-nastere/`.
5. **Următorul ghid (săpt. 42): căsătoria în străinătate cu certificat de celibat, pe țări mari (Italia, Spania, Germania).** „anexa 18 stare civila” și „certificat de celibat online” arată cererea; celibatul e produsul cu cumpărătorul cel mai clar (are o dată fixă). Regula: 1–2 pagini pe săptămână, fapte cu sursă, fără pagini pe țări generate din șablon — un singur ghid cu secțiuni pe țări, nu 3 pagini.

Dependență: campania Google Ads C1 (celibat) e „Eligibil (limitat)” și avea 0 afișări azi la 10:00. Dacă rămâne blocată, organicul plus recuperarea (1–2) sunt singurul canal pe documentero.

## 2. ecazier.ro

| Ce | Valoare |
|---|---|
| Afișări / clicuri, 28 de zile | **564 / 20**, CTR 3,5 %, poziție medie 14,1 |
| Pe săptămâni (ISO) | s39: 270 / 12 · s40: 289 / 8 |
| Pagini indexate | **15 din 15** (inclusiv `/ghid-alegere-tip-cazier`, indexată azi) |
| Clicuri pe brand („ecazier”, „e cazier”) | 10 din 20 |
| Comenzi, 60 de zile | **3 plătite**: 2 cazier judiciar în august (una rambursată), 1 cazier fiscal pe 02.10 (încasat pe contul EDIGITALIZARE). **0 comenzi de cazier auto** |

Paginile:

| Pagină | Afișări | Clicuri | Poziție |
|---|---|---|---|
| `/cazier-fiscal` | 112 | 1 | 30,7 |
| `/` | 107 | 13 | 14,1 |
| `/cazier-auto` | 82 | 1 | 15,9 |
| `/valabilitate-cazier-auto` | 82 | 0 | 8,6 |
| `/cazier-auto-uber-bolt` | 81 | 0 | 6,8 |
| `/acte-necesare-cazier-auto` | 65 | 0 | 13,6 |
| `/puncte-penalizare-cazier-auto` | 26 | 0 | 4,8 |
| `/fisa-evidenta-conducator-auto` | 24 | 3 | 4,1 |
| `/cazier-auto-strainatate-preschimbare-permis` | 23 | 2 | 4,5 |

Căutări: „acte necesare cazier auto” 25 afișări (14,2), „eliberare cazier auto online” 21 (20,2), „cazier fiscal online” 19 (22,7; CJO e pe ~6 pe aceeași căutare), „acte cazier auto” 18 (20,1).

**Diagnostic.** Volumul total e foarte mic: ~140 de afișări pe săptămână, din care jumătate din clicuri pe numele brandului. Cazierul auto rankează pe ghiduri (pozițiile 4–9), dar pagina de serviciu `/cazier-auto` e pe 15,9 și n-a adus nicio comandă. Pe fiscal, Google preferă CJO; cele două site-uri concurează pe aceeași căutare.

**Pașii:**

1. **Titlurile noi pe cazier auto (făcut azi, 06.10).** Efectul se vede abia peste 1–2 săptămâni.
2. **Ghidurile → pagina de serviciu (efort mic).** Ghidurile de pe pozițiile 4–8 (valabilitate, Uber/Bolt, puncte, fișă) au 0–3 clicuri. Fiecare are nevoie de un bloc „comandă fișa online, 198 lei, 3-5 zile” sus, nu doar la final, ca puținul trafic care vine să ajungă la comandă.
3. **Fiscal: nu mai investi pe ecazier.** CJO ocupă căutarea (poziția ~6). Orice efort pe `/cazier-fiscal` de pe ecazier concurează cu propriul nostru site. Pagina rămâne, dar fără ghiduri noi pe fiscal.
4. **Un ghid pe lună, doar pe auto** („cazier auto pentru angajare ca șofer profesionist / atestat”), dacă la 19.10 se continuă.

**Recomandare pentru decizia din 19.10: nu mai investim activ, păstrăm site-ul.**
- 20 de clicuri pe lună, jumătate pe brand, și 0 comenzi de cazier auto în 60 de zile. Chiar dacă titlurile noi dublează CTR-ul, vorbim de ~10–20 de clicuri în plus pe lună.
- Pe judiciar și fiscal concurează direct cu CJO, care vinde (36 de comenzi în 14 zile).
- Criteriul concret pentru 19.10: dacă `/cazier-auto` nu urcă în primele 10 și nu apare nicio comandă de cazier auto, ecazier trece pe „mentenanță” (fără ghiduri noi, fără linkuri noi), iar timpul se mută pe CJO, unde fiecare procent de conversie înseamnă bani.
- Clienții ecazier sunt ai cabinetului (Stripe cabinet_tarta); decizia trebuie luată împreună cu avocata.

## 3. Ce e stricat sau de verificat

- **Nimic neindexat, niciun canonical greșit:** 18/18 documentero, 15/15 ecazier; Google folosește canonicalul nostru pe toate.
- **ecazier nu e pus în cache:** `cache-control: private, no-cache, no-store` și `x-vercel-cache: MISS` pe `/cazier-auto`; timpul până la primul octet a variat 0,5–2,1 s în 4 cereri. Paginile de conținut ar putea fi statice sau cu `revalidate`. documentero răspunde în 0,2–0,5 s.
- **documentero: comenzile n-au sursă.** Cele 4 drafturi au `attribution` gol, deci nu știm dacă au venit din organic, din reclamă sau din linkurile de pe eghiseul. Merită verificat că UTM-urile și `gclid` ajung în `orders.attribution` pe hostul documentero (memoria `documentero-test-comanda-live`).
- **Comandă ecazier încasată pe contul EDIGITALIZARE** (`EFC-20261002-61612`): restul comenzilor ecazier merg pe `cabinet_tarta`. De verificat de ce a ales alt cont Stripe.
- Verificarea SERP prin WebSearch n-a fost utilă: motorul întoarce rezultate din SUA (pentru „cazier auto online” a dat Cazoo). Pozițiile de mai sus sunt din GSC, nu din SERP live.
