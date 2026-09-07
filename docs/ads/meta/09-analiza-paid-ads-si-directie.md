# 07.09.2026 — Analiza /paid-ads pe campania Meta + direcția următoare

Analiză pe cifrele din `08-verificare-campanie-07-09.md`, cu datele reale de vânzări din DB
(comenzi plătite, ultimele 90 de zile).

---

## Partea 1 — Verdictul pe campania actuală

### Campania nu poate ieși MATEMATIC din faza de învățare

Meta cere **50 de conversii pe ad set în 7 zile** ca să iasă din „Learning Limited". Obiectivul
campaniei e `InitiateCheckout`, iar CPA-ul realizat e **106,52 lei**.

| | Calcul |
|---|---|
| Buget săptămânal actual | 75 × 7 = **525 lei** |
| Ce ar produce la CPA-ul actual | 525 / 106,52 ≈ **5 conversii/săptămână** |
| Cât cere Meta | **50** |
| Buget necesar ca să iasă din învățare | 50 × 106,52 = **5.326 lei/săptămână (761 lei/zi)** |
| Sau: CPA necesar la bugetul actual | 525 / 50 = **10,50 lei per IC** |

Niciuna din cele două nu e realistă. **Campania va rămâne permanent în Learning Limited pe
obiectivul ăsta.** Asta nu e un bug — e aritmetică. Consecință: algoritmul livrează pe cel mai
ieftin inventar disponibil (de aici Audience Network), pentru că n-are semnal de conversie pe care
să învețe.

### Produsul greșit pentru reclamă plătită

Comenzi plătite, ultimele 90 de zile (DB, `orders.payment_status='paid'`):

| Serviciu | Comenzi | AOV | Venit 90 zile |
|---|---|---|---|
| extras-carte-funciara | 134 | 89,00 | 11.926 |
| cazier-judiciar-PF | 65 | 198,00 | 12.870 |
| **certificat-constatator** ← ce promovăm | **58** | **95,86** | **5.560** |
| certificat-nastere | 14 | **998,00** | **13.972** |
| extras-multilingv-nastere | 13 | 798,00 | 10.374 |
| certificat-celibat | 6 | 698,00 | 4.188 |
| certificat-casatorie | 4 | 998,00 | 3.992 |
| extras-multilingv-casatorie | 3 | 798,00 | 2.394 |

**Promovăm serviciul cu cel mai mic AOV din tot catalogul (95,86 lei).** Din care scade TVA 21%
(≈79 lei net) și costul ONRC. Plafonul de CPA sustenabil e undeva la **30–40 lei**. Am cheltuit deja
**235 lei fără nicio vânzare** — adică peste 2,5 AOV-uri.

Pe Meta, unde CPM-ul în România pentru un public rece e 20–40 lei, un produs de 96 lei nu are
matematică. Google Search merge (intenție directă, click ieftin), Meta nu.

### Grupul stare civilă = de 9× AOV-ul

`certificat-nastere` + `casatorie` + `celibat` + cele două extrase multilingve:
**40 de comenzi / 90 zile, AOV mediu 868 lei, 34.920 lei venit** — de 6× venitul constatatorului,
cu de 1,5× mai puține comenzi.

La 868 lei AOV, un CPA de 200–250 lei încă e profitabil (CAC 23–29%). **Ăsta e produsul care
suportă costul unui click pe Meta.**

### Ce mai reiese din cifre

- **C4 „Verificare partener"** e singurul anunț sănătos: Above average la toate trei rankingurile
  (calitate, interacțiune, conversie), 13 din cele 25 de LP views, singurul InitiateCheckout,
  aproape zero Audience Network. Unghiul „verifici cu cine faci afaceri" funcționează.
- **C0** are metrici falși din Audience Network (65% din bugetul lui). De ignorat complet.
- **C3** n-a primit livrare (13 lei) — Meta l-a considerat cel mai slab.
- **Raport link click → LP view: 13%.** Cauza principală e pixelul blocat de consimțământ, dar
  Audience Network contribuie și el (clicuri accidentale care nu ajung niciodată pe site).

---

## Partea 2 — Direcția recomandată

### De ce NU cazier judiciar pe Meta

Deși are volum (65 comenzi/90 zile, AOV 198):

1. **Politica Meta „Personal Attributes"** interzice reclamele care sugerează că știi ceva despre
   caracteristicile personale ale utilizatorului. Cazierul judiciar = istoric infracțional, categorie
   sensibilă explicită. Un anunț de tip „Ai nevoie de cazier judiciar?" are risc real de respingere,
   iar respingerile repetate lovesc contul, nu doar anunțul.
2. E fix categoria pe care **Google ne-a blocat** („Documente guvernamentale și servicii oficiale") —
   nu vrem să deschidem al doilea front cât timp contestația e pe rol
   (`docs/ads/2026-09-07-raspuns-google-tratament-egal.md`).
3. Contul a luat deja o respingere pe clasificatorul „forged goods" (C0). Al doilea strike pe o
   categorie sensibilă e scump.

### De ce DA stare civilă (naștere / căsătorie / celibat)

| Argument | |
|---|---|
| **AOV** | 698–998 lei — singurul segment care suportă CPM-ul Meta |
| **Competiție** | zero pe Ads (vezi memoria `google-ads-smecheria-competitorilor`) |
| **Politică Meta** | eveniment de viață pozitiv, nu atribut personal sensibil. Risc mic |
| **Public clar** | români din diasporă care se căsătoresc / au copil în străinătate și au nevoie de document din România |
| **Creativ** | subiect vizual și emoțional (nuntă, copil nou-născut, dosar la primărie în străinătate) — exact ce funcționează pe Meta, spre deosebire de un certificat ONRC |
| **Targetare** | Meta poate ce Google nu: români care locuiesc în afara României, interese „nuntă", life event „logodit/căsătorit recent", „părinte nou" |

**Certificat de celibat** e cel mai bun unghi de start: se cere aproape exclusiv pentru căsătorie în
străinătate, nevoia e urgentă și cu termen (data nunții), iar publicul e ușor de definit.

### Structura propusă

```
Campanie: META_StareCivila_Diaspora_2026-09
  Obiectiv: Landing Page View (NU Purchase, NU InitiateCheckout)
  Buget: 75 lei/zi (același, mutat de pe constatator)
  Plasamente: MANUALE — Facebook + Instagram feed/Reels/Stories.
              FĂRĂ Audience Network, FĂRĂ Messenger, FĂRĂ Audience Network Rewarded

  Ad set 1 — Diaspora nuntă
    Locație: Italia, Spania, Germania, UK, Franța, Belgia (români în afara RO)
    Limbă: română
    Vârstă: 25–45
    Interese: nuntă, logodnă, planificare nuntă + limba română

  Ad set 2 — Diaspora părinți noi
    Aceleași țări, 25–40, life event „părinte nou", interese: bebeluși, sarcină
    → certificat de naștere / extras multilingv

  Ad set 3 — România broad
    Doar RO, 25–50, fără interese (broad), lăsăm algoritmul
```

**De ce obiectiv Landing Page View și nu conversie:** la 40 de comenzi în 90 de zile pe tot grupul,
nu vom vedea niciodată 50 de conversii/săptămână. Optimizarea pe un eveniment mai sus în pâlnie
(LPV) e singura care poate ieși din faza de învățare la bugetul ăsta — 525 lei/săptămână la un
CPC de ~1,5 lei înseamnă ~350 de clicuri, deci suficiente LPV. Purchase-ul îl măsurăm oricum prin
CAPI (deja implementat, server-side, nu depinde de cookie banner).

### Precondiție (altfel repetăm greșeala)

**Fără `InitiateCheckout` prin Conversions API, orice campanie nouă e la fel de oarbă.** Pixelul
pornește doar la accept de cookies. Chiar dacă optimizăm pe LPV, tot vrem să vedem corect pâlnia.
E o funcție nouă în `src/lib/analytics/meta-conversions.ts` (pe modelul `sendMetaPurchaseEvent`)
plus un apel la crearea draftului, cu `event_id` pentru dedup.

### Creative — 3 unghiuri de testat per ad set

1. **Termen / urgență**: „Data nunții e fixată. Certificatul de celibat din România durează 30 de
   zile. Începe azi." — vizual: calendar / invitație
2. **Fără drumuri**: „Nu te întorci în România pentru o hârtie." — vizual: avion / laptop pe masă în
   bucătărie de apartament străin
3. **Ghid / obiecție**: „Primăria din [țară] cere certificat de celibat apostilat. Îl obținem noi." —
   vizual: dosar cu documente, fără sigilii vizibile (clasificatorul „forged goods" reacționează la
   documente cu ștampile/sigilii — vezi respingerea C0)

⚠️ **Regulă de creativ după respingerea C0:** fără imagini cu documente ștampilate/semnate, fără
liste de acte, fără „semnat electronic".

---

## Ordinea de execuție propusă

1. Lăsăm campania actuală neatinsă până la ziua 5 (planul din `05-plan-test-constatator.md`).
2. Între timp: cod pentru `InitiateCheckout` prin CAPI.
3. La evaluarea de ziua 5: oprim constatatorul (produs greșit pentru Meta) și mutăm bugetul pe
   `META_StareCivila_Diaspora_2026-09`.
4. Constatatorul rămâne pe Google Search, unde intenția e directă și clickul ieftin.
