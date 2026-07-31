# Goluri de conținut & optimizări — analiza cererii (31 iul 2026, CORECTATĂ)

**Sursă:** export GSC 3 luni (top 1000 interogări + 203 pagini) + verificare contra
paginilor REALE din site. Prima versiune a acestui doc declara „goluri" pagini care
există și performează — corectat după verificare (lecția: întâi `ls src/app`, apoi verdictul).

---

## A. Pagini EXISTENTE care duduie — doar de optimizat (nu de creat!)

### A1. Calculator indemnizație creștere copil — deja TOP 5 pe site ✅
`/calculator/calculator-indemnizatie-crestere-copil/`: **8.445 clicuri, 127k impresii,
poz. 5,7** pe 3 luni. Rankează pe „calculator indemnizație...", dar NU prinde termenii
fără „calculator": „concediu crestere copil" (1.274 imp, poz. 11), „indemnizatie
crestere copil" (964 imp, poz. 12,4).
**Acțiune:** secțiune nouă în pagină pe „concediul de creștere copil: durată, condiții,
cine poate lua" (intenția informațională a termenilor fără «calculator») + verificat
puntea spre certificat de naștere (public = părinți proaspeți = serviciul cu cel mai
mare venit/comandă). Efort mic, pagina are deja autoritate.

### A2. Articol amendă rovinietă — EXISTĂ, dar e blocat în „2025" ⚠️
`/amenda-rovinieta-2025-tarife-plata-online-ghid-complet/`: 1.416 clicuri, **80k
impresii**, poz. 6,6. Problema: titlu, meta, FAQ și corp spun toate „**2025**" — în
mijlocul lui 2026. Pe 80k impresii, anul vechi în titlu = CTR pierdut zilnic + semnal
de conținut stale exact pe interogările „plata amenda rovinieta" (poz. 9,4).
**Acțiune:** ✅ **FĂCUT 31.07 (seara)** — refresh 2025→2026 cu fact-check:
amenzile CONFIRMATE neschimbate (OG 23/2025, în vigoare 8 sept 2025: cat. A 500–1.000 lei);
prețuri verificate pe vânzător live actualizat azi (3,5€/6€/9,5€/15€/50€, plate — tarifele
pe norma EURO de la 1 iul 2026 au rămas PROIECT, nu au intrat în vigoare); adăugate
duratele lipsă 30 zile (~50 lei) și 60 zile (~79 lei) + secțiune despre proiectul EURO
(freshness) + citarea OG 15/2002/OG 23/2025. Slug + DATE_PUBLISHED neatinse.
Tool-ul de verificare și pagina serviciu rovinietă AU prețuri corecte — neatinse.

### A3. Cluster pensii — există tot, poziții 8–12 pe variante
`/tabel-varsta-pensionare-anticipata-femei/` există (7.656 clicuri istoric); „tabel
varsta pensionare femei" 6.727 imp poz. 8,2. Optimizare pe pagina existentă (heading-uri
pe variantele de query), nu pagini noi.

## B. Goluri REALE (verificat: nu există nicio pagină)

| Gol | Cerere | De ce merită |
|---|---|---|
| **Apostila Haga** (articol/ghid) | zero apariții în top 1000 deși VINDEM apostila ca add-on | pregătește serviciul traduceri/apostile (în analiză din 23 iul); zero competiție internă |
| **Certificat deces** | invizibili total | completează stare civilă (naștere/căsătorie/celibat le avem); cerere reală de la moștenitori |
| **Ghid succesiune: actele necesare** | invizibili | leagă CF + stare civilă + taxe notariale într-un flux real; public cu bani |
| **Harta cadastrală / geoportal ANCPI** (ghid vizual) | „harta cadastru" 1.333 imp poz. 8,6 + „harta cadastrala online" 636 (prinse lateral de articolul de nr. cadastral) | punte spre extras CF + identificare imobil |
| **Înființare firmă** (ghid acte) | invizibili | publicul constatatorului; de cântărit vs concurența mare pe termen |

## C. Ordinea recomandată (corectată) — STATUS 31.07 noaptea

1. ✅ **Refresh amendă rovinietă 2025→2026** — FĂCUT (cu fact-check tarife).
2. ✅ **Secțiuni „concediu creștere copil" în calculatorul ICC** — FĂCUT (eligibilitate,
   2 luni netransferabile, acte dosar AJPIS, punte naștere + 2 FAQ).
3. ✅ **Articol apostila Haga** — FĂCUT (`/apostila-de-la-haga-ghid-acte-obtinere/`).
3b. ✅ **Cluster ONRC (lecția dianex)** — 3 ghiduri: schimbare sediu, suspendare, radiere.
   Rămase pentru valul 2: schimbare denumire/CAEN, cesiune părți sociale, punct de lucru.
4. ⏸ Ghid harta cadastrală/geoportal — amânat (Raul).
5. ⏸ Ghid succesiune → certificat deces — backlog.

Imagini pentru articolele noi: prompturi în
[`2026-07-31-prompturi-imagini-articole-noi.md`](2026-07-31-prompturi-imagini-articole-noi.md)
(fișiere .webp așteptate în `public/images/articole/`).

---

## D. Concluziile celor „3 chestii" (cerute 31 iul)

### D1. Constatator (canibalizare) — VERDICT: on-page e COMPLET, lipseau linkurile
Pagina serviciu are titlu comercial („în Câteva Minute — 89 RON"), schema, 21 de linkuri
interne (vs 7 ale articolului), CTA din articol există din 26 iul. Nu mai e nimic ieftin
de reparat în site. Ce lipsea = semnale externe → exact cele 3 dofollow trimise azi
(startupcafe, start-up, risco). **Decizie amânată pt. T+8 săpt:** dacă pagina nu urcă
sub 10 nici cu linkuri, discutăm consolidarea (mutarea secțiunii comerciale din articol
+ canonical sau restructurare articol→serviciu). Nu acum.

### D2. Urbanism — VERDICT: pagină prea NOUĂ, nu stricată
Publicată 21 iul (10 zile!), deja linkuită intern din 7 locuri relevante (calculator
POT/CUT, pagina CF, footer, articol construire). Pozițiile 17–50 sunt normale la vârsta
asta. Acțiune: linkul plătit de la money.ro (trimis) + răbdare + re-verificare la T+4.

### D3. Topograf — VERDICT: problema e la PLATĂ, nu la trafic/conținut
Ciornele (23) au TOT completat: contact, motiv detaliat, adresă, nume proprietari —
inclusiv clienți diaspora (UK). Se opresc toate înainte de plată; `billing.isValid=false`
pe fiecare. Comparație funnel din iunie: identificare-imobil VECHI (același preț 198)
convertește 6 plăți/17 ciorne (26%), cel NOU 1/12 (8%). Deci NU prețul afișat sperie —
suspect e pasul de plată/validarea de billing pe serviciile din migrarea 084.
**Acțiuni:** (1) test live al wizardului pe un serviciu nou până la Stripe — căutăm un
„Plătește nu face nimic" (tiparul din memoria cui-verification-ux); (2) prețuri finale
cu Mircea (216,59/302,50 = placeholder); (3) cele 11 ciorne au email — de verificat dacă
recovery-ul de coșuri le prinde (au primit cupon?).
