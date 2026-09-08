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
