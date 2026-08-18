# Google Ads — analiză înainte de repornire (18 august 2026)

Contul vechi: **eGhiseul, 677-995-5005** (eghiseul@gmail.com). Date extrase direct din cont pe
18.08.2026, interval „Toată perioada" (5 ian. 2024 – 18 aug. 2026), plus date de comenzi din DB.

---

## 1. Unde suntem acum: TOATE anunțurile sunt respinse

Starea contului azi: 33 de campanii, **0 lei cheltuiți**, iar la fiecare campanie scrie
„Neeligibilă / Întreruptă — **Toate anunțurile au fost respinse**". Motivul afișat de Google, textual:

> **Respins (Documente guvernamentale și servicii oficiale)**

Anunțurile respinse conțin exact formulările interzise:
- „Obține rapid **documente oficiale** online... Aplică online pentru **documente oficiale**"
- „Cazier Judiciar **Oficial**"

Politica „Government documents and services" (actualizată 22 oct. 2025) acoperă fix serviciile
noastre: certificate de naștere/căsătorie, verificări de cazier, identificatori de firmă (constatator
ONRC), rovinietă. Detalii + ce înseamnă „authorized provider":
`docs/seo/2026-07-26-conformitate-si-sesizari-concurenta.md`.

**Concluzie: nu e o problemă de buget sau de licitare. Până nu trec anunțurile, nu se cheltuie un leu.**

O a doua problemă semnalată de cont: la mai multe campanii, „**Configurarea urmăririi conversiilor nu
a fost finalizată**". Fără conversii măsurate, orice repornire e oarbă.

---

## 2. Ce a produs contul până acum (lifetime)

| | |
|---|---|
| Cost | **2.089.015 RON** |
| Valoarea conversiilor | 2.950.623 RON |
| ROAS | **1,41** |
| Clicuri | 962.460 (CPC mediu ~2,17 lei) |
| Conversii | 33.306 |

La un ROAS de 1,41, cu marja noastră brută (~55–65% din încasare pe caziere, mult mai mică pe
extras CF), contul a fost **pe pierdere sau la limită** pe ansamblu. Dar media ascunde diferențe
uriașe între servicii.

### Pe campanii (lifetime)

| Campanie | Cost | Valoare conversii | ROAS |
|---|---|---|---|
| OPT- Cazier Judiciar Online | 879.141 | 1.446.226 | **1,65** |
| Extras CF - SEARCH CAMPAIGN | 495.381 | 237.876 | **0,48** ⛔ |
| PMAX- GENERAL | 23.644 | — | — |

Campania de Extras CF a ars ~495.000 lei și a adus 238.000 lei încasări. **Pierdere brută ~257.000 lei**,
înainte de taxa ANCPI și de muncă.

### Pe cuvinte cheie (lifetime) — aici e tot răspunsul

| Cuvânt cheie | CPC | Cost | Conversii | Valoare | ROAS | CPA |
|---|---|---|---|---|---|---|
| **cazier fiscal online** | **1,45** | 87.658 | 2.122 | 295.576 | **3,37** ✅ | **41 lei** |
| cazier judiciar online | 2,26 | 334.199 | 3.221 | 592.925 | 1,77 | 104 lei |
| certificat constatator online | **8,51** | 128.917 | 1.724 | 152.304 | **1,18** ⚠️ | 75 lei |

- **Cazier fiscal e cel mai bun activ pe care îl avem**: CPC 1,45 lei și ROAS 3,37. Nimeni nu
  licitează agresiv pe el.
- **Certificat constatator are CPC 8,51 lei** — de 6× mai scump decât fiscalul. La un preț de 89–98
  lei și taxă ONRC de 35 lei, marja e ~60 lei; un CPA de 75 lei înseamnă **pierdere pe fiecare comandă**,
  oricât de bine ar merge automatizarea.

---

## 3. Cât ne permitem să plătim (marje reale, prețuri de azi)

Costuri reale din DB (`order_supplier_costs`, ultimele 180 zile) + taxele știute.

| Serviciu | Încasare medie | Costuri directe | Marjă | **CPA maxim** (40% din marjă) |
|---|---|---|---|---|
| Cazier fiscal | 198 | avocat 15 + procesare ~5 | ~178 | **70 lei** |
| Cazier judiciar PF | 358 | avocat 15 + curier ~30 + procesare ~9 (traduceri/apostilă se refacturează) | ~230–250 | **90 lei** |
| Certificat naștere / căsătorie / multilingv | 957–1.260 | traducere 65 + notar 50 + apostilă 60 + curier extern ~250 | ~500–600 | **200 lei** |
| Certificat constatator | 98 | ONRC 35 + procesare ~3 | ~60 | **24 lei** (istoric: 75 ⇒ nu iese) |
| Extras CF | 92 | ANCPI 20 + procesare | ~65 | **26 lei** (istoric campania: ROAS 0,48) |

---

## 4. Ce e livrabil azi (verificat în DB, ultimele 90 de zile)

| Serviciu | Plătite | Livrate | % | Zile medii |
|---|---|---|---|---|
| Certificat constatator | 43 | 43 | **100%** | 4,0 |
| Cazier fiscal | 19 | 18 | 95% | 8,0 |
| Cazier judiciar PJ | 16 | 15 | 94% | 8,6 |
| Cazier judiciar PF | 52 | 48 | 92% | 7,5 |
| Cazier auto | 12 | 11 | 92% | 4,2 |
| Naștere / multilingv | 23 | 16 | 67–73% | 16–18 |
| **Extras carte funciară** | **104** | **7** | **7%** ⛔ | 17,4 |
| **Identificare imobil** | 15 | 2 | **13%** ⛔ | 20,6 |
| **Extras plan cadastral** | 10 | 0 | **0%** ⛔ | — |

**97 de comenzi de extras CF plătite stau nelivrate**, cea mai veche din 13 iulie (36 de zile). În
ultimele 14 zile: 59 de comenzi plătite, **0 livrate**. Toate cele 97 de joburi ANCPI sunt `FAILED` —
portalul ePay e picat din 13 iulie și n-a mai trecut niciun job de atunci.

ONRC, în schimb: 36 de joburi în 30 de zile, **toate `DONE`**. Automatizarea merge.

---

## 5. Recomandare

### Ordinea corectă

1. **Reparat politica, nu bugetul.** Rescrie toate anunțurile fără „oficial/oficiale" lângă
   „documente/acte" (site-ul e deja curățat din 23 iunie, anunțurile NU). Adaugă pe landing pages
   disclaimerul de neafiliere („platformă privată, independentă de instituțiile statului") — îl au
   toți concurenții serioși și acoperă și ANPC.
2. **Refă urmărirea conversiilor** (mai multe campanii o au neterminată) și numără DOAR `Purchase`,
   cu valoare dinamică. Fără asta, nu se pornește nimic.
3. **Pornește mic, pe un singur serviciu: cazier fiscal.** CPC 1,45, ROAS istoric 3,37, livrare 95%
   în 8 zile, conversie 57,6% în wizard. Buget de test 50 lei/zi, potrivire exactă + frază,
   tCPA 50 lei.
4. **Al doilea val, după 2 săptămâni de date: cazier judiciar PF** (CPA maxim 90) și **stare civilă**
   (naștere/căsătorie/multilingv, CPA maxim 200 — marja acoperă chiar și CPC mari).
5. **Certificat constatator: nu la CPC 8,51.** Merge doar dacă îl încerci strict pe potrivire exactă,
   cu tCPA 25 lei, și accepți volum mic. Altfel plătim ca să livrăm.
6. **Extras CF / topograf: ZERO reclamă.** Cât timp ANCPI e picat, fiecare comandă nouă e o datorie,
   nu un venit. Campania a pierdut deja 257.000 lei când portalul mergea.

### Buget de start propus

| Etapă | Serviciu | Buget/zi | tCPA |
|---|---|---|---|
| Săpt. 1–2 | Cazier fiscal | 50 lei | 50 |
| Săpt. 3+ (dacă CPA < 70) | + Cazier judiciar PF | +80 lei | 90 |
| Săpt. 3+ | + Stare civilă (naștere/căsătorie) | +50 lei | 200 |

Total la maturitate: ~180 lei/zi (~5.400 lei/lună). Prag de oprire: dacă după 30 de conversii CPA
depășește pragul serviciului, se oprește grupul, nu se „mai dă o șansă".

### Decizia care nu ține de reclamă

Cea mai scumpă problemă din tot documentul ăsta nu e Google Ads: sunt **97 de comenzi plătite
(~8.900 lei) pe care nu le putem livra**, care cresc cu ~4/zi. Ori repornim ANCPI, ori oprim vânzarea
extrasului CF până revine portalul.
