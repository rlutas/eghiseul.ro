# Campania META — Adeverință de celibat, diaspora (07.09.2026)

Construită pe baza a trei research-uri: `10` (creative), `11` (faza de învățare), `12` (piața).
Precondiția tehnică — `InitiateCheckout` prin Conversions API — e livrată și în producție
(`docs/technical/specs/meta-capi-tracking.md`).

---

## De ce acest serviciu și nu constatatorul

| | Constatator (ce rulăm acum) | Celibat (ce propunem) |
|---|---|---|
| AOV | **95,86 lei** | **698 lei** |
| Comenzi / 90 zile | 58 | 6 (grup stare civilă: 40) |
| CPA sustenabil | 30–40 lei | 200–250 lei |
| Concurență pe Meta | — | **zero reclame în nișă** |
| Rezultat după 4 zile și 235 lei | 1 InitiateCheckout, **0 vânzări** | — |

La CPM 20–40 lei în România, un produs de 96 lei nu are matematică pe Meta. Unul de 698 lei are.

## Poziționare — 4 puncte

1. **Preț** — 698 lei vs 999 lei la `cazierjudiciarfirma.ro`, singurul concurent care face reclamă
2. **Termen** — de obicei 7–15 zile, **și 0 zile de așteptat la notar sau consulat**
3. **Prin avocat înscris în Barou**, fără procură notarială (Legea 120/2026)
4. **Recenzii Google reale**, inclusiv una despre certificat de celibat obținut în Olanda

⚠️ Cei „~5 zile" ai concurentului pornesc **după semnarea împuternicirii la notar sau consulat**.
Noi afișăm termenul total. Nu ne comparăm pe cifra brută — comparăm pe „0 zile la notar".

## Structura

```
Campanie: META_Celibat_Diaspora_2026-09
  Obiectiv: Vânzări → optimizare InitiateCheckout
  Buget: 75 lei/zi (de confirmat: paralel cu constatatorul sau în locul lui)

  Ad set: Diaspora RO — broad
    Locații: Italia, Spania, Germania, Marea Britanie, Franța, Belgia, Austria
    Limbă: română                     ← cheia targetării, NU interese „Romania"
    Vârstă: 25–45
    Interese: NICIUNUL (broad)        ← la buget mic, interesele închid audiența
    Plasamente: MANUALE
      ✅ Facebook feed, Reels, Stories, Marketplace
      ✅ Instagram feed, Reels, Stories, Explore
      ❌ Audience Network   ← a luat 65% din bugetul unui anunț fără să producă nimic
      ❌ Messenger
    Advantage+ Placements: OFF (avem plasamente manuale)
    Advantage+ Creative: enhancement-urile de TEXT oprite
      ← nu vrem ca Meta să genereze un headline care devine claim pe un serviciu juridic

  Anunțuri: 5 creative, UNGHIURI diferite, toate în același ad set
```

### De ce un singur ad set

Meta și practicienii sunt unanimi: la buget mic, consolidare. „Nu porni un ad set separat pentru
fiecare creative" — fragmentarea lipsește fiecare ad set de datele necesare optimizării.

### De ce optimizăm pe InitiateCheckout, deși nu iese din faza de învățare

`buget săptămânal ÷ 50 = CPA maxim pe evenimentul ales` → 525 / 50 = **10,50 lei**.
Niciun eveniment util nu costă atât. Campania **va rămâne Learning Limited** — asta e aritmetică,
nu un defect de configurare.

Alternativele și de ce le-am respins:
- **Landing Page View** — derivată din `PageView`, care e pixel-only, deci blocat de bannerul de
  cookies. Am optimiza pe 13% din realitate.
- **Link clicks (Traffic)** — ar ieși ușor din învățare, dar exact așa am ajuns cu 65% din buget în
  Audience Network. Clicuri ieftine, nu clienți.
- **InitiateCheckout** — de la 07.09 pleacă și server-side prin CAPI, deci e singurul semnal
  **adevărat** pe care îl avem. Learning Limited cu semnal corect bate „ieșit din învățare" cu
  semnal fals.

## Creativele (5)

Toate în `~/Projects/eghiseul-ads-video`, randate din cod. Prețul și termenul vin din
`src/brand.ts` — la orice schimbare se re-randează, nu se editează manual.

| # | Fișier | Format | Unghi |
|---|---|---|---|
| 1 | `celibat-conversatie-9x16.mp4` | video 9:16, **10s** | conversație — Confession/Relatability |
| 2 | `celibat-OfertaBanner-4x5.png` | static 4:5 | Offer-First Banner (preț dominant) |
| 3 | `celibat-UsVsThem-4x5.png` | static 4:5 | alternativa reală: „mă duc eu în țară" |
| 4 | `celibat-Recenzii-4x5.png` | static 4:5 | testimoniale reale |
| 5 | `celibat-Listicle-4x5.png` | static 4:5 | educă traficul rece, tratează „e gratis la consulat" |

Mixul acoperă cerința Meta (imagine 4:5 + video 9:16 cu audio) pentru CPA cu ~9% mai mic.
Niciunul nu conține document, ștampilă sau sigiliu.

## Textele anunțului

**URL final:** `https://eghiseul.ro/servicii/eliberare-certificat-de-celibat/`
⚠️ NU `/servicii/certificat-celibat/` — face 308 spre cel de mai sus, pierdem un hop.

**Primary text (același pe toate, testăm creativul nu copy-ul).**
⚠️ Scris FĂRĂ DIACRITICE, ca și creativele — decizie Raul: cu diacritice „se vede ciudat scrisul",
iar logo-ul e oricum „eGHISEUL".

> Te casatoresti in strainatate si primaria iti cere dovada ca esti necasatorit din Romania.
> O obtinem noi si ti-o trimitem acasa. Nu te intorci in tara si nu astepti la notar sau consulat.
>
> 698 lei, de obicei in 7-15 zile. Optional: traducere, apostila si livrare la adresa ta.
>
> 4,9 din 457 de recenzii Google.
>
> Serviciu privat de intermediere si asistenta, prin avocat colaborator. Nu suntem institutie publica.

**Headline:** `Adeverinta de celibat, fara drum in Romania`
**Description:** `698 lei · 7-15 zile · prin avocat, fara procura notariala`
**CTA:** `Comandă acum` (butonul e ales dintr-o listă fixă a Meta, nu îl scriem noi)

### Reguli respectate în copy
- fără „documente oficiale" / „acte oficiale" / „eliberat de stat"
- fără atribute personale („Ești român în Italia?" e la limită; „Te căsătorești în străinătate" e sigur)
- fără termene pe care nu le-am atins (nu promitem 5 zile)
- disclaimer de neafiliere în fiecare variantă

## Ce urmărim (ziua 7) — și ce NU

**NU** ne uităm la ROAS sau la vânzări. Nu vom avea volum.

| Semnal | Cum îl citim |
|---|---|
| **Distribuția spend-ului** între cele 5 creative | dacă Meta pune 60%+ pe 1–2, alea sunt câștigătoarele |
| Cost per InitiateCheckout | acum e măsurat corect (server-side) |
| Hook rate pe video | 3-sec plays ÷ afișări |
| CTR **outbound** | nu CTR total |
| Landing page views ÷ **Outbound clicks** | prag Loomer: sub 70% = problemă pe pagină |
| Rankingurile de calitate | Above/Below average la cele 3 |

**Dacă niciun creativ nu depășește clar CTR-ul actual de 1,3–1,8%:** problema e oferta sau pagina,
nu creativul. Nu producem încă 5 creative noi.
**Dacă 1–2 ies în față:** 4 iterații pe fiecare; le retragem pe cele fără spend la 2 săptămâni.

## Decizii rămase pentru Raul

1. **Bugetul.** 75 lei/zi în paralel cu constatatorul (total 150/zi) sau mutăm bugetul?
   Recomandarea din `09`: oprim constatatorul la ziua 5 și mutăm.
2. **Uploadul creativelor.** Din experiența de pe 03.09, încărcarea imaginilor din extensia de
   browser nu funcționează pe Meta — pasul ăsta îl face Raul manual.

---

## Nota despre durata video-ului (08.09)

Research-ul **nu conține** un benchmark de durată pentru reclamele Meta pe servicii — nici Motion,
nici Meta nu publică unul. Nu inventăm o cifră.

Conține însă ceva care ne-a obligat să scurtăm: Motion, pe 578.750 de creative, constată că
**„mesajele care întârzie claritatea sau cer interpretare tind să sufere când atenția e limitată"**.

Prima versiune avea 8 replici, iar prețul apărea în secunda 8 — cine se uita 3 secunde nu afla
nimic. Am tăiat la **6 replici**: prețul intră la secunda ~6, cardul final la ~7, total **10s**.

Ce urmărim ca să validăm alegerea: **hook rate** (3-sec plays ÷ afișări) și dacă Meta alocă spend
video-ului față de statice. Dacă hook rate-ul e slab, problema e primul cadru, nu durata.

---

## STARE 08.09 — campania e construită, în draft

**Campanie `META_Celibat_Diaspora_2026-09`** (ID 120252416632790556) — `In draft`, nu cheltuie nimic.

| Nivel | Setare | Valoare |
|---|---|---|
| Campanie | Obiectiv | Vânzări |
| | Buget | **75 lei/zi**, la nivel de campanie |
| | Strategie | Highest volume |
| Ad set | Nume | `Diaspora RO - broad - IT/ES/DE/UK/FR/BE/AT` |
| | Conversie | Website → **Initiate checkout** (dataset `eghiseul.ro web`) |
| | Locații | Austria, Belgia, Germania, Spania, Franța, Marea Britanie, Italia — **fără România** |
| | Limbă | **Română** ← audiența a scăzut de la 204.200.000 la **3,2–3,7 mil.** |
| | Vârstă | 18+ (broad, conform recomandării de consolidare) |
| | Interese | niciunul |
| | Plasamente | Facebook, Instagram, Threads. **Audience Network și Messenger EXCLUSE** |
| | „Allow limited spending to excluded placements" | **debifat** — altfel trimitea ~5% din buget înapoi în Audience Network |
| | Plasamente | 18 incluse, 0 cu cheltuire limitată, 3 excluse |
| | Start | 8 septembrie 2026, 08:56 |
| | Advertiser (cerință UE) | EDIGITALIZARE SRL |
| Anunț | Nume | `C1 Conversatie - video 9x16` |
| | Identitate | EGhiseul (FB) + eghiseul33 (IG) |
| | URL | `https://eghiseul.ro/servicii/eliberare-certificat-de-celibat/` |
| | Multi-advertiser ads | **debifat** (ne-ar fi tăiat creativul, iar noi am calculat safe zones) |
| | Media | ⛔ **lipsește — vezi mai jos** |

Scorul de campanie a scăzut de la 100 la 75 pentru că am exclus Audience Network. **E intenționat.**
Meta insistă cu „+25 points: turn on Advantage+ placements" — se ignoră.

### ⛔ Ce NU pot face eu: urcarea creativelor

Meta nu expune un `input[type=file]` în pagină — butonul „Upload" deschide selectorul nativ de
fișiere al sistemului de operare, pe care extensia de browser nu îl poate controla. Confirmat și
pe 03.09, acum reconfirmat.

**Pașii pe care îi face Raul** (5 minute):

1. Ads Manager → campania `META_Celibat_Diaspora_2026-09` → anunțul `C1 Conversatie - video 9x16`
2. **Ad creative → Set up creative → Video ad → Next → Upload**
3. Alege `~/Projects/eghiseul-ads-video/out/celibat-conversatie-9x16.mp4`
4. La pasul **Text**, pune (copy-paste din secțiunea „Textele anunțului" de mai sus):
   - Primary text, Headline, Description
   - CTA: `Comandă acum`
5. **Publish**

Pentru celelalte 4 creative: duplică anunțul și schimbă doar media + numele:

| Nume anunț | Fișier |
|---|---|
| `C2 Oferta - static 4x5` | `celibat-OfertaBanner-4x5.png` |
| `C3 UsVsThem - static 4x5` | `celibat-UsVsThem-4x5.png` |
| `C4 Recenzii - static 4x5` | `celibat-Recenzii-4x5.png` |
| `C5 Listicle - static 4x5` | `celibat-Listicle-4x5.png` |

Toate cele 5 în ACELAȘI ad set. Textul rămâne identic pe toate — testăm creativul, nu copy-ul.

⚠️ **După publicare, 7 zile fără nicio modificare.** Orice schimbare de buget, targetare sau
plasamente resetează faza de învățare.

⚠️ **Bugetul total devine 150 lei/zi** cât timp rulează și constatatorul. Recomandarea din `09`
rămâne: oprește constatatorul (AOV 96 lei, nerentabil pe Meta) și lasă doar celibatul.

---

## ✅ PUBLICAT 08.09, ora 09:07

Campania e **live**, `Processing` (Meta procesează/verifică anunțul).

| | |
|---|---|
| Campanie | `META_Celibat_Diaspora_2026-09` — activă, 75 lei/zi |
| Ad set | `Diaspora RO - broad - IT/ES/DE/UK/FR/BE/AT` — activ, Processing |
| Anunț | `C1 Conversatie - video 9x16` — activ, Processing |

### Ce s-a mai făcut la publicare

**Trei variante de video, una per raport de aspect** (Raul le-a urcat, eu le-am randat):
`celibat-conversatie-9x16.mp4` (Reels/Stories), `-1x1.mp4` (feed), `-16x9.mp4` (coloana din
dreapta, in-stream). Marginile sigure sunt prop în cod: 250/350px pe vertical, 96/44 pe pătrat,
96/48 cu coloană centrată pe orizontal. Fără varianta 16:9 nativă, Meta avertiza că anunțul nu va
rula pe unele plasamente.

**Textele** — primary text, headline, description, CTA `Order now`. Toate fără diacritice.

🔴 **Advantage+ creative enhancements — TOATE OPRITE.** Erau pornite implicit:
- `Text improvements` (Meta AI) — ar fi rearanjat/generat textul. Pe un serviciu juridic, un
  headline inventat de AI devine claim nesubstanțiat.
- `Video touch-ups` (Meta AI) — ar fi modificat un video compus cu safe zones calculate.
- `Flex media`, `Add details to ad layout` — ar fi rearanjat sau adăugat imagini.

🔴 **Advantage+ creative image generation — nicio imagine selectată.** Meta oferea imagini generate
cu AI. Refuzate: exact tipul de creativ care poate declanșa clasificatorul „forged goods" care ne-a
respins deja C0, iar research-ul Ipsos arată că AI-ul pierde tocmai pe partea emoțională.

Scorul de campanie: 98. Meta insistă în continuare cu „+22 puncte" pentru enhancements și
Advantage+ placements. **Se ignoră** — sunt exact lucrurile pe care le-am oprit deliberat.

### Observație colaterală: fixul de CAPI se vede deja

Campania de constatator arată acum **2 InitiateCheckout la 146,95 lei**, față de 1 la 235,47 lei
înainte de 07.09. Același buget, același creativ — diferența e că evenimentul pleacă acum și
server-side. Nu e o îmbunătățire de performanță, e măsurare care înainte lipsea.

### Ce urmează

1. **7 zile fără nicio modificare.** Orice schimbare resetează faza de învățare.
2. Celelalte 4 creative (staticele 4:5) se adaugă ca anunțuri noi în ACELAȘI ad set — duplici
   anunțul și schimbi doar media și numele. Nu e urgent; se poate face și mâine.
3. La ziua 7 citim: distribuția spend-ului între creative, cost per InitiateCheckout, hook rate,
   CTR outbound, LPV ÷ Outbound Clicks.
4. **Decizia rămasă:** constatatorul rulează în paralel, deci total 150 lei/zi.
