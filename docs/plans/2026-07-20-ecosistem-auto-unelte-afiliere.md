# Ecosistem auto: unelte, date locale, afiliere — research + decizii

**Data:** 2026-07-20
**Status:** 📋 RESEARCH — decizii de direcție luate, implementare NEPORNITĂ
**Documente conexe:** `2026-07-20-produse-noi-auto-teren-contracte.md` (research inițial) · `2026-07-20-categoria-contracte-eghiseul.md` (plan implementare)

---

## TL;DR

1. **RAR Auto-Pass: ANULAT.** RAR denunță public revânzătorii. Îl punem primul în checklist, cu prețul oficial și link la rarom.ro, **zero comision**.
2. **dosar-auto.ro n-are backend deloc** — 335 pagini statice, zero cont, zero plată. Fiecare unealtă e „pasul 1 fără pasul 2". **Noi avem pasul 2 construit.**
3. **Paginile lor pe județe conțin exact datele de care avem nevoie** pentru „unde depui" (adresă DITL, telefon, program, DGPCI cu subsedii). 257 din 335 pagini sunt geo.
4. **Afilierea e venit accesoriu, nu linie de business**: 90–175 lei per 1.000 vizitatori. Un flux propriu de serviciu valorează cu un ordin de mărime mai mult.
5. **Prioritate reală**: unelte gratuite ca top-funnel → servicii plătite. Nu copiem ca să câștigăm din afiliere.
6. ✅ **„Unde depui" e rezolvat**: SIRUTA de la INS (CC-BY 4.0, comercial OK) dă maparea sat → comuna cu primărie, verificat pe Odoreu. Vezi §4.
7. ⭐ **Contractul nu e produsul — e declanșatorul unui lanț.** O tranzacție auto generează 4-5 nevoi obligatorii (istoric vehicul, contract, rovinietă, RCA, apoi recurență anuală). **~170–235 lei la prima tranzacție** față de 69 izolat, plus venit recurent. Infrastructura de handoff spre erovinieta **există deja**. Vezi §5.6 — e cea mai importantă secțiune din document.

---

## 1. RAR Auto-Pass — ❌ NU intermediem (decizie fermă)

Fusese marcat „prioritate 1" în research-ul inițial. **Verificarea la sursă îl elimină.**

RAR a publicat informare oficială ([rarom.ro/?p=298753](https://www.rarom.ro/?p=298753)), citat direct:

> „Registrul Auto Român atrage atenția asupra unei situații în care anumite entități terțe **se interpun între R.A.R. și clienții de bună credință, folosind metode alternative și înșelătoare pentru a vă exploata din punct de vedere financiar**. Aceste practici includ utilizarea unor denumiri, culori, sigle sau elemente vizuale similare cu brandul oficial R.A.R. […] recomandarea noastră este să descărcați RAR Auto-Pass doar de pe site-ul oficial."

Emis **exclusiv** de RAR (Legea 142/2003, OMTI 210/2024), **42 lei** tarif fixat de Consiliul de Administrație, valabil 60 zile, [apps.rarom.ro/autopass-client](https://apps.rarom.ro/autopass-client/). **Fără program de partener, API sau reseller — deliberat.** Revânzătorii (rar-autopass.ro, autopass-online.ro la 89,99 lei) sunt exact ținta.

**Riscul e mai mare pentru noi decât pentru un site anonim**: trăim din intermediere de documente sub nume propriu, cu avocat asociat.

**Poziția corectă** (și modelul dosar-auto.ro): RAR Auto-Pass **primul în checklist**, marcat „obligatoriu prin lege", cu prețul oficial și link direct, **fără comision**. Câștigi încrederea punând întâi opțiunea corectă și negeneratoare de venit. carVertical se pune ca **upsell complementar** pentru istoric internațional — nu ca înlocuitor al certificatului oficial.

---

## 2. dosar-auto.ro — ce am aflat

**Metodologie:** sitemap complet (335 URL-uri) + fetch HTML pe ~35 pagini + Playwright pe generatoare.

**Structura:** Next.js static/SSG. `robots.txt` blochează `/api/`, dar **nu există niciun apel API real** — tot ce pare „unealtă" rulează 100% în browser pe date hardcodate. **Zero backend, zero cont, zero plată proprie.**

**Monetizare — exact două link-uri comerciale pe toată pagina de verificare kilometri:**
- `carvertical.deal/2865SGD/66RQ8Q/?source_id=AFF&sub1=dosarauto` (domeniu vanity Everflow), `rel="nofollow sponsored"`
- `l.profitshare.ro/l/16195388` → Pint.ro pentru RCA

**Pagina lor „verificare kilometri" nu verifică nimic** — e pur editorială: 5 metode de detectare a fraudei, 8 semne, decodor VIN gratuit, checklist 33 puncte. Ierarhia e onestă: RAR Auto-Pass primul (42 lei, obligatoriu, **fără link de afiliere**), apoi carVertical cu cod „DOSARAUTO -20%", apoi citire OBD la service.

### 2.1 Inventarul uneltelor

**Nivel 1 — relevante pentru noi:**

| Unealtă | Ce face | Automatizare | Valoare pentru noi |
|---|---|---|---|
| **11 generatoare de acte** | Wizard 5 pași → PDF (modele DGPCI hardcodate) | 100% | **Ei dau PDF-ul, noi vindem depunerea** |
| **257 pagini județe/orașe** | Adrese DGPCI/RAR/DITL, program, taxe locale, distanțe | Parțial (curatoriat) | **Datele pentru „unde depui"** |
| **Ghiduri interactive dosar** | Triaj (rol, vehicul, județ) → listă acte + pași | 100% | Top-funnel puternic |
| **Succesiune auto** | Scenariu → traseu notar→DITL→DGPCI | 100% | Se leagă de rol avocat + moștenire |
| **Contestare amendă** | Triaj 4 întrebări → model plângere | 100% | **Cel mai monetizabil — avem avocat** |
| **Calculator impozit auto** | cm³, combustibil, Euro → lei/an | 100% | Volum #1 din nișă |
| **Checklist cumpărare SH** | 33 puncte, progres în localStorage | 100% | Lead magnet pentru cont |

**Nivel 2 — top-funnel pur:** calculator amenzi (22 abateri × 7 categorii), import auto UE, anvelope (Δdiametru + verdict RAR), verificare ITP, leasing, planificator consum, decodor VIN (tabel WMI static), calculator RCA (estimare), rovinietă, constatare amiabilă, martori bord, simulator numere, generator anunț OLX.

**Nivel 3 — articole, nu unelte:** Rabla, ghid import Germania, certificat RAR, carte verde, taxa pod Fetești, CASCO. Plus „verificare RCA" și „verificare amenzi" care **nu verifică nimic** — sunt hub-uri de linkuri spre AIDA/hub.mai.gov.ro.

### 2.2 Paginile pe județe — modelul de copiat

**257 din 335 pagini (77%) sunt geo.** Nu sunt thin — ~40–50% conținut unic per pagină, curatoriat manual.

```
/ro/judet/{jj}/                    42   hub județ
/ro/inmatriculare/{jj}/            42   \
/ro/dosar-vanzare-auto/{jj}/       42    } serviciu × județ
/ro/transcriere-vehicul/{jj}/      42    }
/ro/radierea-autoturismului/{jj}/  42   /
/ro/inmatriculare/{jj}/{oras}/     41   reședințe de județ
/ro/inmatriculare/b/sector-{1..6}/  6   sectoare București
```

**Ce conține o pagină de județ** (verificat pe Cluj): populație, distanță de București, **DGPCI cu adresă exactă, email dedicat de programări urgente, program ghișee, subsedii cu adrese**, RAR județean + link programare, deep-links spre celelalte 4 proceduri, top 5 localități, FAQ cu numele județului injectat, județe vecine (internal linking). Badge „Verificat".

**Ce conține în plus o pagină de oraș/sector** (verificat pe Sector 3): **DITL cu adresă (Str. Sfânta Vineri nr. 32), telefon (021 327 5145), program pe zile**, taxă locală reală cu numărul hotărârii (HCGMB 514/2025), primar nominal, distanțe calculate spre RAR, „traseul tău pas cu pas", hartă, **data verificării + sursele listate**.

**Singura hibă găsită:** sectoarele Bucureștiului sunt etichetate „Comună" în modulul de localități apropiate — bug de date.

### 2.3 Practici ieftine de furat

- **Freshness agresivă**: 25 articole, majoritatea din iulie 2026, pe modificări legislative (OUG 7/2026, amenzi, rovinietă). News-jacking legislativ — ne lipsește pe zona auto.
- **Buton „Copiază răspuns" + „Copiază link"** pe fiecare unealtă — optimizare explicită pentru citare în ChatGPT/AI Overviews.
- **Badge „Verificat" + data + sursele** pe paginile locale — semnal E-E-A-T ieftin.
- **Disclaimer defensiv** bine scris („nu suntem afiliați cu RAR, DGPCI, ANAF… NU oferim consultanță") — merită citit ca model; noi avem expunere mai mare fiindcă chiar intermediem.

**Verificat la noi:** `robots.txt` are deja 13 boți AI permiși (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended…) — **suntem la paritate**, nu e nevoie de intervenție.

---

## 3. Ce replicăm și ce nu

### DA — în ordinea valorii

1. **Generatoare de cereri legate de wizard** — ei se opresc la PDF descărcat; noi avem OCR, semnătură, cont, Stripe. Uneltele lor gratuite devin pasul 1 din wizardul nostru. **Aici e tot ROI-ul.**
2. **Contestare amendă cu avocat** — ei dau model generic; noi putem vinde plângere redactată și semnată de avocat (200–400 lei). Singurul avantaj structural necopiabil.
3. **Calculator impozit auto** — volum #1 din nișă, formulă pură, o zi de muncă, feed spre certificat fiscal/transcriere.
4. **Strat local peste location-engine-ul existent** — avem deja `docs/plans/2026-06-19-location-seo-engine.md` + pagini per județ pentru cazier și CF. Adăugarea datelor DGPCI/DITL/RAR e incrementală. **Diferența noastră: pagina se termină în comandă, nu în link către instituție.**
5. **Ghiduri interactive de dosar** — sunt literalmente wizardul nostru fără plată la final. Le facem ca „preview gratuit".
6. **Checklist SH + decodor VIN ca lead magnets** — ei salvează în localStorage, noi în contul clientului (leagă de „saved vehicles" din `2026-06-24-account-features-roadmap.md`) → reminder ITP/RCA/rovinietă → recurență.

### NU — și de ce

| Nu facem | Motiv |
|---|---|
| **Calculator alcoolemie** | Risc reputațional pentru o platformă cu servicii juridice. Trafic curios, nu cumpărător |
| **Simulator numere, generator anunț OLX, martori bord** | Zero intenție comercială; ei monetizează prin eMAG, canal pe care nu-l avem |
| **Calculator RCA/CASCO/carte verde** | Nu suntem broker; cu afiliere ne diluăm poziționarea |
| **„Verificare RCA/amenzi" tip hub de linkuri** | Ar trimite userul afară fix în momentul intenției. Dacă atacăm zona, o facem cu worker (verificare reală) |
| **Leasing, planificator rută, preț carburant** | Fără legătură cu serviciile; Google Maps o face mai bine |
| **Rabla, ghid import, certificat RAR** | Sunt articole, nu unelte — le facem în arhitectura de articole existentă |

---

## 4. Datele locale — „unde depui"

Alimentează diferențiatorul din planul de contracte: **instrucțiuni personalizate, per parte** (se merge la primăria de DOMICILIU, nu la reședința de județ — ex. Odoreu, jud. Satu Mare → Primăria Odoreu).

**Ce avem deja:**
- `src/lib/data/romania-localities.json` — 42 județe, **13.251 localități** (doar nume). Odoreu prezent ✅
- `src/lib/data/locality-fuzzy-match.ts` — potrivire aproximativă (folosit la curieri)
- Nomenclatorul curierilor: `{ name, county, postalCode }` — **nu are comuna părinte**, deci nu putem deriva maparea de acolo

### ✅ REZOLVAT: SIRUTA de la INS dă exact maparea

**Sursă:** [data.gov.ro — SIRUTA 2025](https://data.gov.ro/dataset/fcba1a54-cffd-422c-b3ac-920f63564085), publicat de **Institutul Național de Statistică**, licență **Creative Commons Attribution 4.0** → **utilizabil comercial**, cu atribuire. Actualizat anual (există și 2023, 2024).

⚠️ **Capcană:** fișierul e servit ca `.csv` dar e de fapt **XLSX** (începe cu semnătura PK/zip). Se redenumește în `.xlsx` și se citește normal.

**Structura — 16.978 rânduri, 12 coloane:**

| Coloană | Ce e |
|---|---|
| `SIRUTA` | cod unic al localității |
| `DENLOC` | denumire |
| `CODP` | **cod poștal** (0 pentru UAT-uri și județe) |
| `JUD` | cod județ |
| **`SIRSUP`** | **codul SIRUTA al unității superioare ← MAPAREA** |
| `NIV` | **1 = județ · 2 = UAT (are primărie) · 3 = localitate componentă** |
| `TIP`, `MED`, `REGIUNE`, `NUTS` | tip, mediu urban/rural, regiune |

**Distribuția pe nivel:** 42 județe · **3.181 UAT-uri** · 13.755 localități componente.

**Verificat pe cazul real (Odoreu, jud. Satu Mare):**
```
ODOREU  SIRUTA 138280  NIV 2  → e UAT (comuna cu primărie)
ODOREU  SIRUTA 138299  NIV 3  → satul, cod poștal 447210, SIRSUP = 138280

Satele arondate comunei Odoreu (6): Odoreu, Berindan, Cucu,
Eteni, Mărtinești, Vânătorești
```

Deci algoritmul e trivial: **localitate → dacă `NIV=3`, urcă pe `SIRSUP` → obții UAT-ul unde se depune.** Cineva din satul Cucu află corect că merge la Primăria Odoreu.

**Bonus:** `CODP` (codul poștal) permite legarea de nomenclatorul curierilor, care are deja `postalCode` — deci putem determina UAT-ul și pornind de la adresa de livrare.

**Ce rămâne de completat manual:** datele de contact ale primăriilor (adresă, telefon, program) și lista DITL-urilor separate (DITL Sector 3, SPIT Constanța). SIRUTA dă **cine** și **unde administrativ**, nu strada și programul.

**Câmpurile de colectat** (derivate din ce afișează dosar-auto pe paginile lor de oraș): denumire instituție · adresă · telefon · program pe zile · site · dacă e DITL separat sau primărie · DGPCI-ul județean cu subsedii.

**Strategie de acoperire progresivă** — nu blocăm lansarea: cu SIRUTA spunem de la început corect **la ce primărie** merge fiecare parte (acoperire 100%, gratuit). Adresa și programul le adăugăm progresiv, începând cu orașele mari; unde lipsesc, afișăm doar numele instituției.

**De reținut la implementare:** fișierul de pe data.gov.ro se descarcă cu extensia `.csv` dar e XLSX — se redenumește. Din el se generează o mapare compactă `{uat: {cod → nume, județ}, loc: [{nume, codPoștal, uat}]}` — **~800 KB JSON** pentru 3.181 UAT-uri + 13.755 localități. Nu l-am adăugat încă în repo (suntem în research, nu implementare).

### 4.1 Depunerea online — excepție, nu regulă

Verificat separat, pentru că schimbă felul în care formulăm instrucțiunile:

- **ghiseul.ro / SNEP este DOAR platformă de PLATĂ, nu de depunere.** Cele ~2.093 de UAT-uri înrolate încasează obligații deja stabilite; nu primesc declarații. Distincția e esențială — nu putem spune „depune pe ghiseul.ro".
- **Nu există punct de intrare național pentru depunere.** Fiecare portal capabil e un hostname per-primărie (vendori: Regista/Zitec, Indeco, Integrisoft, Industrial Software, CityOn).
- **Estimare: 5–15% din cele ~3.200 UAT-uri** permit depunerea online a declarației fiscale auto. *Încredere scăzută*, declarată explicit de research.
- **Confirmat DA:** Alba Iulia (`portal.apulum.ro`), Sibiu, Reșița, Târgu Neamț.
- **Confirmat NU:** Cluj-Napoca (140+ formulare online, dar declarația de dobândire lipsește), Timișoara (textual: „cererea nu se poate depune din platforma actuală"), Brașov, Sectoarele 4 și 6.
- **Semnătura electronică nu e blocant:** niciun portal verificat nu cere semnătură calificată de la cetățean — autentificare cont/parolă, link pe email sau ROeID.

**Semnalul contraintuitiv:** cele mai mari și mai bine finanțate orașe sunt negative confirmate. Digitalizarea nu urmează capacitatea administrativă.

**Concluzia întărește produsul, nu îl slăbește:** pentru marea majoritate a clienților **nu există rută online**, deci „unde mergi fizic, la ce adresă, în ce program" rămâne informația decisivă. Depunerea online se tratează ca **excepție curatată manual** — un câmp opțional `portal_url` pe câteva zeci de UAT-uri confirmate — nu ca ramură generalizabilă.

**Asimetrie utilă:** certificatul vânzătorului e mai des disponibil online decât declarația de dobândire a cumpărătorului.

---

## 5. Afiliere

### 5.1 carVertical — partenerul principal

Program **propriu, pe Everflow** — nu în 2Performant/Profitshare/Awin/Admitad.

| Element | Valoare |
|---|---|
| Înscriere | [carvertical.everflowclient.io/affiliate/signup](https://carvertical.everflowclient.io/affiliate/signup) |
| Cookie declarat | **90 zile** („not guaranteed") |
| **Cookie observat** | ⚠️ **30 zile** (`transaction_id` capturat la urmărirea redirectului) — **de clarificat** |
| Prag plată | 50 EUR, wire lunar, taxe 50/50 |
| Sub-afiliere | 5% override |
| Comision | **NEPUBLICAT** — „de la 4 EUR/vânzare, crescător cu volumul" (sursa cea mai credibilă) vs. „25%" (sursă slabă) |

**Prețuri RO** (live): 1 raport **130 lei** · 2 rapoarte **166 lei** (83/buc) · 3 rapoarte **210 lei** (70/buc). „Se poate aplica TVA".

**API/B2B există** ([carvertical.com/en/business/api](https://www.carvertical.com/en/business/api)) — dataset complet, VIN decoder, raport web/PDF; pachete 10/30/100 rapoarte sau abonamente. **Prețuri doar la cerere.** White-label: neconfirmat.

⚠️ `afilierecarvertical.ro` (apare în căutări ca program oficial RO) **nu rezolvă DNS** — nu e canal oficial.

**Restricții:** fără PPC pe branded keywords fără aprobare, email marketing doar pre-aprobat, un cont per afiliat.

### 5.2 Concurenți

| Serviciu | Verdict |
|---|---|
| **autoDNA** | ❌ **Capcană**: cookie **24 ore** + prag plată **~1.400 lei**. Pe intenție rară nu încasezi niciodată |
| CarFax Europe | Niciun program găsit |
| Vindecoder | Furnizor de date API, nu afiliere |

### 5.3 Alte programe RO (verificate individual)

**Piese/anvelope — 2Performant** (cookie 30 zile): techstar.ro **15%** · dezmembraru.ro **10,5%** · edez.ro 7% · autobob.ro 5,5% (**AOV ~360 lei — cel mai bun venit/click**) · autoeco.ro 5,5%/3,5% · janta.ro 3% (**singurul care permite explicit Google + Facebook Ads**).

**Profitshare:** anvelino.ro **10,50 lei fix/comandă** · anvelope-oferte.ro 10 lei fix · navigatiiandroid.ro 7%.

**eMAG:** 1–15%, rata pe Auto & Moto **în spatele login-ului**. Constrângeri: cookie redus la **15 zile**, **interzice complet PPC, email marketing și comparatoare**.

**Asigurări:** doar două programe — pint.ro (RCA 0,01–3,5%, CASCO 10%) și ottobroker.ro (RCA 0,2–3,5%, accidente 20%). **~17 lei pe o poliță de 500** — de 3–7× sub ruta asistent în brokeraj (54–122 lei). ⚠️ Legea interzice discount/cashback la prime.

**Negative structurale:** leasing/credit auto (Impuls, Autonom, BT Leasing — zero programe), platforme de anunțuri (Autovit, OLX — marketplace-urile cumpără trafic, nu plătesc revshare), e-rovinieta.ro (**1% fără TVA**, Google Ads interzis, posibil inactiv).

**Conflict util:** autoeco.ro dă **7% pe Profitshare** vs **5,5% pe 2Performant** — arbitraj între rețele, probabil și la alți advertiseri.

### 5.4 Economia

**90–175 lei per 1.000 vizitatori** pe intenția „verificare istoric mașină" (~18–35 EUR RPM). Peste display ads pe trafic RO (5–15 lei RPM), ceea ce validează modelul dosar-auto.

Sensibilitatea dominantă e **comisionul negociat** — între 4 EUR și 25% venitul aproape se dublează. **Deci: aplică și cere grila, nu planifica pe presupuneri.**

**Concluzia strategică:** afilierea e venit accesoriu decent, **nu linie de business**. Aceiași vizitatori într-un flux propriu de serviciu valorează cu un ordin de mărime mai mult. Confirmă direcția: uneltele aduc traficul, serviciile aduc banii.

### 5.5 Fiscal (înainte de prima factură)

- **CAEN 7311** (agenții de publicitate) — confirmat Rev. 3. Se facturează „servicii de publicitate online", nu „comision".
- **carVertical e în Lituania** → locul prestării la beneficiar (art. 278(2) CF), **neimpozabil în RO**, factură fără TVA cu mențiunea „taxare inversă", cod LT verificat în VIES înainte de fiecare factură.
- **Cod special de TVA — OBLIGATORIU chiar dacă ești neplătitor** (art. 317(1)(b)), de la primul euro, formular **D700**. Nu te face plătitor pe intern.
- **D390** simbol „P", până pe 25 ale lunii următoare, doar în lunile cu operațiuni. **D394 — nu.**
- ⚠️ **ROI a fost desființat în 2017** (OUG 84/2016). Multe surse, **inclusiv help-ul 2Performant**, încă cer înscrierea — informație depășită.
- Micro 2026 (OUG 89/2025): plafon **100.000 EUR**, cotă **1%**, minim 1 salariat.

---

## 5.6 ⭐ Lanțul complet de monetizare (completare Raul, 20.07)

**Observația care schimbă modelul de business:** contractul de 69 lei nu e produsul — e **evenimentul care declanșează 4-5 nevoi obligatorii**, fiecare monetizabilă, majoritatea pe platformele noastre. O tranzacție auto nu e o vânzare, e un lanț.

### Momentul 0 — ÎNAINTE de cumpărare (cumpărătorul)
**Verificare istoric vehicul → afiliere carVertical (~20 lei).**
Se prinde pe pagina de checklist „ce verifici înainte să cumperi o mașină", nu în fluxul de contract (acolo e prea târziu — decizia e luată). Alături, gratuit și fără comision: RAR Auto-Pass la 42 lei, link oficial.

### Momentul 1 — Contractul (ambii)
**69 lei, pe eghiseul.** Contract + toate cererile + checklist personalizat pe UAT.

### Momentul 2 — Rovinieta (cumpărătorul) ⭐ nou
Aici era greșeala din explicația inițială. Corect:

- Rovinieta e legată de **VIN**, nu de numărul de înmatriculare → **rămâne valabilă** la schimbarea proprietarului.
- Dacă mai are valabilitate: cumpărătorul doar **anunță noul număr la CNAIR** — noi generăm cererea, nu vindem nimic.
- **Dacă e expirată sau expiră curând: are nevoie de una nouă → erovinieta.net**, cu date precompletate.

**Infrastructura există deja pe erovinieta, integral:**
- `POST /api/verificare/rovinieta` — interoghează CNAIR server-side după număr (+ VIN), returnează status + data expirării. Nu expune date personale, doar statusul vinietei.
- `src/lib/verificare/checkout-link.ts` — `buildCheckoutPath({ plate, vin, category, source })` generează `/checkout?plate=…&vin=…&vehicleType=…&utm_source=…` cu **prefill complet și atribuire**.
- Verificarea **înrolează automat** în reminderul de expirare (dacă e validă) sau trimite ofertă „cumpără acum" (dacă nu e).

**Deci fluxul e:** în wizardul de contract avem deja numărul și VIN-ul → apelăm verificarea → dacă rovinieta expiră, afișăm în checklist un buton direct spre erovinieta cu totul precompletat. **Zero muncă nouă pe erovinieta** — doar apelul cross-platform și butonul.

### Momentul 3 — RCA (cumpărătorul)
**Obligatoriu din secunda dobândirii**, fără perioadă de grație (1.000–2.000 lei + plăcuțe). → erovinieta, când se deblochează. **54–122 lei/poliță**, cea mai mare marjă din tot lanțul.
Până atunci: „verifică prețul RCA" ca link, apoi ca produs propriu.

### Momentul 4 — Recurența anuală
Cumpărătorul intră în baza de remindere a erovinieta (~6.000 abonați azi): rovinietă, RCA, ITP. **Fiecare an aduce din nou RCA + rovinietă**, fără cost de achiziție.

### Valoarea reală per tranzacție

| Moment | Produs | Venit | Platformă |
|---|---|---|---|
| 0 | carVertical (afiliere) | ~20 lei | oriunde |
| 1 | Contract + dosar | **69 lei** | eghiseul |
| 2 | Rovinietă nouă (markup 10%) | ~25 lei | erovinieta |
| 3 | **RCA** | **54–122 lei** | erovinieta |
| — | **Prima tranzacție** | **~170–235 lei** | — |
| 4 | Recurență anuală (RCA + rovinietă) | ~80–150 lei/an | erovinieta |

**Față de 69 de lei izolat, lanțul valorează de 2,5–3,4× la prima tranzacție, plus venit recurent.** Iar cumpărătorul e client nou intrat în ecosistem — nu doar o comandă.

**Asta rezolvă și dilema de preț.** Nu mai trebuie să câștigăm din contract. Dacă rata de atașare RCA + rovinietă e bună, contractul poate deveni **gratuit** (varianta A de pricing) și devenim direct competitivi cu cei doi jucători gratuiți — dar cu monetizare de 3–50× mai bună per poliță decât afilierea lor.

**Condiție tehnică:** un contract lucrat de client pe eghiseul trebuie să trimită corect spre erovinieta, cu atribuire. Există deja `utm_source`/`utm_medium` în builder — de folosit o sursă dedicată (ex. `source: 'contract-auto'`) ca să putem măsura exact ce aduce lanțul.

---

## 5.7 Un carVertical al nostru? — NU. Bariera sunt datele, nu codul

Întrebare Raul (20.07): cât de greu e să facem noi un serviciu de verificare istoric vehicul?

**Verdict: nu construim. Afiliem, și construim în jur — nu dedesubt.**

### Ce se cumpără de fapt într-un raport

În ordinea valorii reale pentru un cumpărător român: **kilometraj real** (frauda de km e problema #1 pe importuri), **daune + poze de la daună**, **furt/VIN clonat**, **gaj/leasing neachitat**. Restul (specificații, recalls, valoare estimată) e umplutură care ridică percepția, nu decizia.

Primele două vin **aproape exclusiv din străinătate** pentru mașinile importate — adică exact partea pe care nu o poți construi din surse românești.

### Sursele românești — ce e deschis și ce nu

| Sursă | Ce dă | Acces |
|---|---|---|
| **RAR — kilometraj la ITP** | ⭐ cea mai valoroasă dată RO | ❌ **ÎNCHIS.** Km se înregistrează la ITP (Dir. 2014/45/UE) dar nu e expus public. Fără ofertă de API/parteneriat pe rarom.ro |
| **AIDA / BAAR — daune** | ⭐ a doua ca valoare | ❌ **ÎNCHIS.** Verificarea RCA curentă e publică; istoricul de daune și bonus-malus = doar asigurători, prin protocol |
| **Poliția Română — auto furate** | Furt (~2.290 vehicule) | ✅ **PUBLIC**, filtrabil după serie șasiu. Fără API → scrapeabil |
| **RNPM — gaj/leasing** | Sarcini pe vehicul | 🟡 Consultare publică contra taxă. API: **neconfirmat** (DNS-ul nu rezolva la verificare) |
| RAR — valabilitate ITP | Doar ITP valabil/nu | ✅ Public (cere CIV sau VIN), **fără kilometraj** |
| DGPCI, ANAF/vamă | Proprietari, import | ❌ Date personale / închis |
| Autovit, OLX, mobile.de | Poze + km declarat istoric | ⚠️ ToS interzic scraping; și drept de autor pe poze |

**Din cele 4 date care contează, România îți dă una și jumătate**: furt (volum mic) și gaj (contra taxă). Cele două care vând produsul sunt închise.

### Internațional

- **EUCARIS nu e o bază de date** — e mecanism de schimb *stat-la-stat*, „developed by and for governmental authorities". Privații nu au acces. Există un serviciu **Mileage** în dezvoltare (Cipru conectat în martie 2026) — pe termen lung erodează avantajul agregatorilor privați, dar nu ne dă acces acum.
- **Revânzători de API** (Vindecoder/Vincario, CarsXE, VINaudit, DataOne): decode tehnic VIN da, **istoric european real de km/daune — n-am găsit niciun furnizor cu preț public**. Exact ăsta e moatul.

### De ce nu prindem din urmă

carVertical: fondată **2017**, ~**16M €** strânși, **159 angajați**, 28–37 piețe, **54M € venit în 2024**. „Peste 1.000 de baze de date" — fiecare registru, fiecare asigurător, fiecare acreditare (sunt furnizor aprobat NMVTIS în SUA) e o negociere separată cu due diligence GDPR.

**8 ani și zeci de milioane.** Un intrat nou nu prinde din urmă — cel mult revinde.

### Cele patru variante, evaluate

| Variantă | Efort | Cost | Calitate vs carVertical | Verdict |
|---|---|---|---|---|
| **a) Afiliere pură** | 1–3 zile | ~0 | 100% (e chiar el) | ✅ **FEZABIL** — singura cu ROI garantat |
| b) White-label API | 3–6 săpt. | €3–15/raport en-gros *(neconfirmat)* | 50–70% | 🟡 Economic dubios — plătești en-gros cât încasezi, fără brandul lor |
| c) Produs propriu doar pe date RO | 2–4 săpt. | mic | <40% | ❌ **NEFEZABIL ca produs plătit.** Nimeni nu dă 100 lei pe „nu e furată și n-are gaj" când mașina vine din Germania |
| d) Agregator surse gratuite + API | 6–10 săpt. | mic-mediu | <40% | 🟡 Bun ca lead magnet, nu ca produs |

### Planul recomandat

1. **Afiliere carVertical** ca produs listat — venit imediat, zero risc. (§5.1)
2. **Instrument gratuit „Verifică VIN-ul"**: furt (Poliția, scraping) + valabilitate ITP (RAR public) + decode tehnic VIN. Gratuit, SEO puternic pe „verificare VIN", „mașină furată verificare", cu **upsell direct spre raportul afiliat** pentru km și daune. Asta transformă varianta (c) — nefezabilă ca produs — în **cel mai bun canal de achiziție**.
3. ⭐ **Produs propriu plătit doar pe RNPM (gaj/leasing)** — se încadrează perfect în modelul nostru existent (interogare de registru contra cost, exact ca ONRC și ANCPI), și e **serviciu distinct, nu imitație de carVertical**. **Condiție:** verificat manual dacă RNPM permite interogare programatică sau contract de operator.
4. **Reevaluare 2027–2028**, când schimbul EUCARIS „Mileage" se maturizează — dacă apare acces reglementat la kilometraj transfrontalier, ecuația se schimbă complet.

### GDPR

**VIN-ul e dată cu caracter personal** când poate fi corelat cu o persoană — CJUE C-319/22 (2023) *(confidență medie, nereverificat)*. Practic: datele tehnice se pot publica liber; nume/adresă proprietar — nu. Kilometrajul și daunele sunt zonă gri, iar carVertical le publică **pseudonimizat** (fără identitatea proprietarilor) — abordarea defensabilă.

Riscul mai mare nu e ANSPDCP, ci **ToS-ul platformelor de anunțuri** (scraping poze) și **clauzele de revânzare** din contractele de date.

### De verificat manual

1. Portalul RNPM actual și condițiile de interogare programatică (blocant pentru punctul 3)
2. Dacă RAR licențiază datele de kilometraj de la ITP — **o cerere scrisă e ieftină și clarifică totul**
3. Prețul real per apel la Vindecoder/Vincario (cere trial, nu e public)

---

## 6. Unde punem fiecare produs

| Produs | Gazdă | De ce |
|---|---|---|
| **Generare documente** (contract auto + cereri) | **eghiseul** | Motorul e aici: docxtemplater, semnătură, OCR Gemini, wizard modular, Oblio |
| **RCA** | **erovinieta** | 90% construit acolo, blocat pe email la Dan Ciceu (18.07) |
| **Rovinietă, remindere, vehicule salvate** | **erovinieta** | Sunt deja acolo |
| **Unelte gratuite** (calculatoare, checklist, decodor VIN) | **erovinieta** | Audiența auto e acolo (13–15k vizite/lună); alimentează RCA + trimit spre eghiseul pentru documente |
| **Afiliere carVertical** | **ambele** | Se pune pe orice pagină cu intenție de cumpărare SH |
| **Contestare amendă** | **eghiseul** | Cere rol avocat + semnătură + contract asistență |
| **Pagini pe județe** | **ambele, separat** | erovinieta: DGPCI/RAR/înmatriculare. eghiseul: DITL/certificat fiscal/documente. Fără canibalizare — intenții diferite |

**Principiul:** erovinieta aduce oamenii, eghiseul face documentul. Nu construim nimic de două ori.

---

## 7. Ce urmează

**Blocante de rezolvat (nu costă nimic, doar timp):**
1. ⛔ **Contradicția ITL-054 vs OUG 7/2026** — 2–3 telefoane la direcții de impozite. Blochează template-ul de contract.
2. **Deblocare RCA** — emailul către Dan Ciceu din 18.07 + split-ul 85% în scris.
3. **Verificare statut CNAIR** pentru rovinietă (vezi research-ul inițial §5).

**Pași cu randament mare:**
4. **Cont 2Performant** — deblochează grilele a ~25 advertiseri auto invizibile public. Cel mai mare câștig de informație per efort.
5. **Aplicație carVertical pe Everflow** — cere explicit grila, treptele de volum, cod de cupon dedicat (dosar-auto are unul, deci se poate) și clarificare pe cookie (90 declarat vs 30 observat).

**Construcție, în ordine:**
6. Migrare categorie `contracte` + primul template Word (vezi planul de implementare)
7. Calculator impozit auto (o zi, volum mare)
8. Strat local peste location-engine

---

## Ce n-am putut confirma

- Rata exactă de comision carVertical și treptele (nepublicate, se negociază)
- Discrepanța cookie 30 vs 90 zile
- Prețurile carVertical business/API; white-label
- Rata eMAG pe Auto & Moto (login-gated)
- Cataloagele RO Admitad și TradeDoubler (anti-bot)
- Dacă veniturile UE neimpozabile intră în plafonul de 395.000 lei (de clarificat cu contabilul)
- **Necercetate:** service auto/ITP, tractări, asistență rutieră (ACR, Allianz), parcări, Rabla lead-gen — întrebări deschise, nu negative
- **Datele de contact ale primăriilor** (adresă/telefon/program) — nu am găsit sursă centralizată; SIRUTA rezolvă maparea administrativă, nu contactul. De colectat progresiv sau prin scraping/Places API
- **Lista DITL-urilor separate** de primărie la orașele mari — de construit manual
- ⚠️ Bugetul de căutare web al sesiunii s-a epuizat (200/200) — verificările rămase s-au făcut prin acces direct la API-uri și fișiere
