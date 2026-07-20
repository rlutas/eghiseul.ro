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

**Ce lipsește:** maparea **localitate → UAT cu primărie**. 13.251 localități vs ~3.200 UAT-uri: un sat aparține de o comună, acolo se depune. Plus adresă, program, telefon, și dacă orașul are **DITL separat** (DITL Sector 3, SPIT Constanța).

**Câmpurile de colectat** (derivate din ce afișează dosar-auto pe paginile lor de oraș): denumire instituție · adresă · telefon · program pe zile · site · dacă e DITL separat sau primărie · DGPCI-ul județean cu subsedii.

**Strategie de acoperire progresivă** — nu blocăm lansarea: pornim cu orașele mari (acoperă majoritatea tranzacțiilor), pentru restul afișăm instrucțiunea generică („Primăria comunei de domiciliu — Direcția de Impozite și Taxe Locale"), completăm pe măsură ce apar comenzi reale.

⏳ **Research pe sursele deschise (SIRUTA, data.gov.ro, OSM) — în curs.** Contează licența: trebuie utilizabile comercial.

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
- ⏳ Sursele de date UAT/primării — research în curs
