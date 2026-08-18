# Servicii topograf / OCPI — cercetare de cuvinte cheie și concurență

Făcut pe 18.08.2026. Sursa cifrelor: **Planificatorul de cuvinte cheie** din contul eGhiseul
677-995-5005 (România, română, aug. 2025 – iul. 2026) + verificări SERP cu `&pws=0`.

---

## 0. De ce se poate face reclamă acum, deși ANCPI e picat

Nu e o contradicție: **portalul public ANCPI (ePay) e oprit din 13 iulie**, dar repornirea din 11-12
august a fost **doar pentru profesioniști**. Mircea are cont profesional și ridică documentele de la
ghișeul OCPI/BCPI, deci cele 14 servicii „topograf" **se pot livra**, cu un posibil decalaj la termen.

Ce **nu** se poate livra și deci **nu se promovează**: `extras-carte-funciara` (89 lei) și
`extras-plan-cadastral` — alea merg prin workerul automat, care depinde de portalul public. Acolo
avem deja **105 comenzi plătite și doar 7 finalizate**.

| Serviciu (slug) | Preț | Termen | Comenzi plătite / finalizate |
|---|---|---|---|
| `extras-carte-funciara` | 89 lei | 1 zi | **105 / 7** ⛔ NU promova |
| `extras-plan-cadastral` | 89 lei | 1 zi | **10 / 0** ⛔ NU promova |
| `plan-amplasament-delimitare` (PAD) | 216,59 lei | 4 zile | 2 / 1 ✅ |
| `copie-inventar-coordonate` (Stereo 70) | 216,59 lei | 4 zile | 1 / 1 ✅ |
| `copie-carte-funciara` | 168,19 lei | 4 zile | 0 / 0 |
| `copie-plan-cadastral` | 216,59 lei | 4 zile | 0 / 0 |
| `copie-releveu` | 216,59 lei | 4 zile | 0 / 0 |
| `copie-intabulare` | 216,59 lei | 4 zile | 0 / 0 |
| `copie-contract-vanzare` | 216,59 lei | 4 zile | 0 / 0 |
| `copie-plan-incadrare` | 216,59 lei | 4 zile | 0 / 0 |
| `copie-arhiva-ocpi` | 216,59 lei | 4 zile | 0 / 0 |
| `certificat-sarcini` | 302,50 lei | 4 zile | 0 / 0 |
| `extras-cf-colectiv` | 168,19 lei | 4 zile | 0 / 0 |
| `actualizare-adresa-cf` | 302,50 lei | 15 zile | 0 / 0 |
| `identificare-imobile-proprietar` | 198 lei | 5 zile | 3 / 0 |
| `certificat-detineri-imobile` | 302,50 lei | 5 zile | 0 / 0 |
| `certificat-urbanism-informare` | 943,50 lei | 30 zile | 0 / 0 |

Toate au deja pagină de serviciu în `src/app/servicii/<slug>/`, deci avem unde trimite traficul.

---

## 1. Volume și concurență (Planificator, România)

Ordonat după cât ne interesează, nu după volum.

| Cuvânt cheie | Căutări/lună | Concurență | Licitare sus (min–max) | Îl vindem? |
|---|---|---|---|---|
| **plan de amplasament si delimitare a imobilului** | 100 – 1 K | Medie | 1,59 – 3,68 lei | ✅ PAD |
| plan de amplasament si delimitare | 10 – 100 | Medie | 2,02 – 5,44 lei | ✅ PAD |
| plan amplasament si delimitare | 10 – 100 | Medie | 1,30 – 3,45 lei | ✅ PAD |
| plan de amplasament si delimitare a imobilului online | 10 – 100 | Medie | 1,16 – 3,45 lei | ✅ PAD |
| plan de amplasament si delimitare a imobilului pret | 10 – 100 | **Redusă** | 2,24 – 4,90 lei | ✅ PAD |
| plan de amplasament si delimitare a imobilului ancpi | 10 – 100 | Medie | 1,42 – 5,43 lei | ✅ PAD |
| **rlv apartament** | 100 – 1 K | Medie | 1,65 – 4,34 lei | ✅ releveu |
| **releveu apartament** | 100 – 1 K | Medie | 1,45 – 3,70 lei | ✅ releveu |
| obtinere releveu apartament | 10 – 100 | **Ridicată** | 1,74 – 4,34 lei | ✅ releveu |
| pret releveu apartament | 10 – 100 | **Ridicată** | 1,82 – 4,04 lei | ✅ releveu |
| releveu casa pret / pret releveu casa | 10 – 100 | Medie | 0,86 – 3,16 lei | ✅ releveu |
| **plan cadastral** | 100 – 1 K | Medie | 1,39 – 4,00 lei | ✅ copie plan cadastral |
| **plan de incadrare in zona** | 100 – 1 K | Medie | 1,61 – 3,45 lei | ✅ plan încadrare |
| **coordonate stereo 70** | 100 – 1 K | **Redusă** | 0,75 – 2,78 lei | ✅ inventar coordonate |
| inventar de coordonate (stereo 70) | 10 – 100 | Redusă | — | ✅ |
| **incheiere de intabulare** | 100 – 1 K | **Redusă** | 1,03 – 3,80 lei | ✅ copie intabulare |
| copie carte funciara | 10 – 100 | Medie | 0,78 – 3,65 lei | ✅ |
| copie carte funciara in extenso | 10 – 100 | Medie | 0,54 – 2,65 lei | ✅ |
| carte funciara in extenso | 10 – 100 | Medie | 0,80 – 2,20 lei | ✅ |
| copie plan cadastral | 10 – 100 | Medie | 1,65 – 4,04 lei | ✅ |
| copie releveu | 10 – 100 | Medie | 0,74 – 1,96 lei | ✅ |
| copie intabulare | 10 – 100 | Medie | — | ✅ |
| copie contract vanzare cumparare | 10 – 100 | Redusă | — | ✅ |
| certificat de sarcini | 10 – 100 | Redusă | — | ✅ |
| extras carte funciara colectiva | 10 – 100 | Medie | 2,09 – **6,85** lei | ✅ (cel mai scump clic) |
| **certificat de urbanism** | **1 K – 10 K** | **Redusă** | 1,74 – 2,58 lei | ✅ 943,50 lei |
| cadastru si intabulare | 1 K – 10 K | Medie | 1,25 – 4,80 lei | ❌ lucrare de teren |
| documentatie cadastrala | 100 – 1 K | Medie | 1,24 – 3,40 lei | ❌ lucrare de teren |
| masuratori topografice | 100 – 1 K | Redusă | 1,02 – 3,24 lei | ❌ lucrare de teren |
| ridicare topografica | 100 – 1 K | Redusă | 1,72 – 3,90 lei | ❌ lucrare de teren |
| dezmembrare / alipire teren | 100 – 1 K | Redusă | 1,32 – 3,46 lei | ❌ lucrare de teren |
| topograf autorizat | 10 – 100 | Medie | 1,27 – 4,64 lei | ❌ (intenție locală) |
| acte necesare extras carte funciara | 100 – 1 K | Redusă | 0,69 – 1,68 lei | ❌ informațional |
| actualizare adresa CF / identificare imobile / certificat dețineri | **fără date** | — | — | ✅ dar nimeni nu caută așa |

**Ce iese în evidență:**

1. **Nișa e mică dar ieftină.** Aproape tot e „10 – 100" sau „100 – 1 K" pe lună, cu licitări de
   **0,75 – 4 lei**. Adică exact opusul cazierului judiciar (volum mare, CPC 9 lei).
2. **Certificatul de urbanism e anomalia**: 1 K – 10 K căutări, concurență **Redusă**, clic sub
   2,58 lei, și noi îl vindem cu **943,50 lei**. Nimeni nu licitează pe el — în SERP apar doar
   primării (primariasm.ro, baiamare.ro, oradea.ro, primariaclujnapoca.ro) și cfunciara.
3. **Termenii cu „pret" au concurență Ridicată** pe releveu — semn că acolo se bat firmele de cadastru.
4. Serviciile noastre „exotice" (actualizare adresă CF, identificare imobile după proprietar,
   certificat dețineri imobile) **n-au volum măsurabil**. Nu merită campanie proprie; le ținem pe SEO.

---

## 2. Cine face reclamă acolo (SERP, `&pws=0`)

| Interogare | Anunțuri | Organic (primele) |
|---|---|---|
| `plan de amplasament si delimitare a imobilului` | 1 (al nostru, greșit — vezi §4) | ancpi.online, cartefunciara-cadastru.ro, expertievaluatori.ro, cartefunciaraonline.ro, topograf-brasov.ro, cfunciara.ro |
| `copie carte funciara` | 1 (al nostru, greșit) | — |
| `copie plan cadastral` | 1 (al nostru, greșit) | — |
| `releveu apartament` | 2: al nostru (greșit) + **cartefunciaraonline.ro** | cloud9residence, storia, cartefunciara-cadastru, startcad, releveu-constructie, cartefunciaraonline |
| `certificat de urbanism online` | 1 (al nostru, complet nepotrivit — certificat de căsătorie) | doar primării + cfunciara |

**Concluzie: piața de licitație e aproape goală.** Singurul concurent plătit constant e
**cartefunciaraonline.ro**. cfunciara.ro (de unde ne-am copiat grila de prețuri) e puternic **organic**,
nu plătit.

---

## 3. Aritmetica — ce ne putem permite

Prețurile sunt 168 – 302 lei (943,50 pentru urbanism). Costurile pe comandă:
- taxa OCPI/ANCPI: în `order_supplier_costs` media pe ANCPI e **20 lei** (7 înregistrări);
- **cota lui Mircea: NECUNOSCUTĂ** — nu există nicio setare de comision în DB
  (`collaborator_service_assignments` are doar drepturi de upload, nu tarife).

Fără cota lui Mircea nu pot fixa un CPA real. Două scenarii, pe un preț mediu de **216,59 lei**:

| Ipoteză cotă Mircea | Marjă/comandă | CPA maxim (30% din marjă) | Clicuri permise la CPC 2,5 lei |
|---|---|---|---|
| 40% (86 lei) → marjă ~110 lei | 110 lei | **33 lei** | ~13 clicuri/comandă |
| 25% (54 lei) → marjă ~142 lei | 142 lei | **43 lei** | ~17 clicuri/comandă |

Cu CPC-uri de 1,5 – 3 lei (cât arată planificatorul), avem nevoie de o rată de conversie de
**6 – 8%** ca să fim pe profit. Pe pagini de serviciu bine făcute, cu intenție tranzacțională
(„copie releveu", „plan de amplasament"), e realist — dar **trebuie măsurat, nu presupus**.

⚠️ **Îmi trebuie de la tine cota lui Mircea** ca să pun cifre reale în locul ipotezelor.

---

## 4. ⛔ Blocant descoperit în timpul cercetării: rulează anunțuri vechi, pe pagini moarte

Căutând ca să văd concurența, am dat peste anunțuri **live** sub marca eGhiseul:

```
Sponsorizat · eGhiseul · https://eghiseul.ro/carte-funciara/online
Extras de Carte Funciară - Extras CF Online - Carte Funciară Online
```

Două probleme, fiecare gravă:

1. **`https://eghiseul.ro/carte-funciara/online` dă 404** (308 → apoi 404). Plătim clicuri care
   aterizează pe o pagină inexistentă.
2. Promovează **extrasul de carte funciară** — exact serviciul pe care **nu-l putem livra** (105
   plătite, 7 finalizate).

Iar pe `certificat de urbanism online` apare un anunț eGhiseul despre **certificat de căsătorie** —
potrivire amplă scăpată de sub control.

Ce am verificat în contul 677-995-5005: toate campaniile vechi apar **Întreruptă** sau **Eliminată**,
active fiind doar cele 3 de ieri/azi. Dar Centrul de transparență publicitară spune explicit despre
eghiseul.ro: *„Acest domeniu include rezultate pentru mai multe conturi de advertiser"*.

**Întrebare pentru Raul: mai există un cont Google Ads pe eghiseul.ro (agenție veche, alt Gmail)?**
Dacă da, trebuie oprit azi — sunt bani aruncați pe 404 și pe un serviciu nelivrabil, plus risc de
reclamații. Nu am umblat la nimic până nu-mi spui.

---

## 5. Ce recomand, concret

**Nu** o campanie per serviciu (volumele sunt prea mici, ar sta în „learning" la nesfârșit). O
singură campanie, cu grupuri strânse:

**Campania `Search-Cadastru-Documente-2026-08`** — buget mic, **40 lei/zi**, plafon CPC **3 lei**,
Maximizare clicuri (aceleași reguli ca la celelalte: parteneri OFF, Display OFF, AI Max OFF,
România „Prezență").

| Grup | Cuvinte cheie | Pagină |
|---|---|---|
| PAD | `[plan de amplasament si delimitare]`, `[plan de amplasament si delimitare a imobilului]`, `"plan amplasament si delimitare"`, `"pad imobil"` | `/servicii/plan-amplasament-delimitare/` |
| Releveu | `[releveu apartament]`, `[rlv apartament]`, `"copie releveu"`, `"releveu casa"` | `/servicii/copie-releveu/` |
| Plan cadastral | `[copie plan cadastral]`, `[plan cadastral]`, `"plan de incadrare in zona"` | `/servicii/copie-plan-cadastral/` |
| Coordonate | `[coordonate stereo 70]`, `[inventar de coordonate]`, `"inventar de coordonate stereo 70"` | `/servicii/copie-inventar-coordonate/` |
| Carte funciară (copii) | `[copie carte funciara]`, `[carte funciara in extenso]`, `"copie carte funciara in extenso"`, `[certificat de sarcini]` | `/servicii/copie-carte-funciara/` |

**Campanie separată, `Search-Certificat-Urbanism-2026-08`** — merită singură, e altă ligă:
1 K – 10 K căutări, concurență redusă, produs de 943,50 lei. Buget **50 lei/zi**, plafon CPC 3 lei.
⚠️ Termenul e **30 de zile** și depinde de primărie — asta trebuie scris **în anunț**, altfel plătim
scump reclamații.

**Excluderi obligatorii** (peste lista standard): `gratuit`, `gratis`, `model`, `formular`, `pdf`,
`ce este`, `cum se face`, `curs`, `wikipedia`, `lege`, `pret cadastru`, `firma de cadastru`,
`topograf` + numele orașelor (`topograf brasov`, `topograf cluj`...), `masuratori`, `dezmembrare`,
`alipire`, `intabulare pret`, `cadastru si intabulare`, `ancpi`, `epay`, `mobile ancpi`,
`extras de carte funciara`, `extras cf` (ca să nu ne trimită pe serviciul mort).

**În anunțuri, obligatoriu:** „din arhiva OCPI", „prin topograf autorizat", **fără** „documente
oficiale" (politica Google), și menționat termenul real.

---

## 6. De rezolvat înainte de a porni

- [ ] **Contul-fantomă**: identificat și oprit anunțurile care duc pe `/carte-funciara/online` (404).
- [ ] Cota lui Mircea → CPA real, în loc de ipotezele din §3.
- [ ] Confirmat cu Mircea că ține ritmul (azi: 4 zile declarate) și dacă ANCPI îi mai dă întârzieri.
- [ ] Pus pe paginile de serviciu o notă onestă despre eventualul decalaj de termen.
- [ ] Verificat că paginile de serviciu au buton de comandă vizibil și preț afișat (n-am auditat UX-ul).
