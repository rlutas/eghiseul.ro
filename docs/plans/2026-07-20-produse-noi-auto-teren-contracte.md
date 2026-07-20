# Produse noi: ecosistem auto (erovinieta.net), urbanism, contracte — research + plan

**Data:** 2026-07-20
**Status:** 📋 RESEARCH COMPLET — decizii de arhitectură luate, implementare NEPORNITĂ
**Context:** discuție Raul 20.07 — extindere dincolo de cele 9 servicii instituționale, cu accent pe produse care aduc bani fără intervenție umană + trafic + cross-sell.

---

## TL;DR — verdicte

| Idee | Verdict | De ce |
|---|---|---|
| ~~**RAR Auto-Pass**~~ | 🔴 **ANULAT 20.07 — NU facem** | **RAR denunță public revânzătorii.** Vezi §1 — corecție după verificare la sursă |
| **Deblocare RCA pe erovinieta** | 🟢 **PRIORITATE 1** | 90% construit, blocat pe un email. **54–122 lei/poliță**, recurent anual. Cel mai aproape de venit din tot documentul |
| **Pachet „vând mașina"** (contract + checklist + acte) | 🟢 **DA** | Pâlnie de achiziție pentru RCA (+ rovinietă, cazier auto). Gazda: vezi doc-ul de implementare `2026-07-20-categoria-contracte-eghiseul.md` |
| **Certificat urbanism** | 🟡 **NU E IDEE NOUĂ — deja în DB, 780 lei, 0 comenzi** | Serviciu activ dar invizibil: fără pagină, fără SEO. Problemă de distribuție, nu de produs. Cel mai ieftin venit potențial |
| **Contestație amendă** | 🟡 **DA, dar doar cu avocatul nostru** | Singurul avantaj structural necopiabil (rol `avocat` + semnătură + contract asistență). Competiția vinde șabloane în zona gri a Legii 51/1995 |
| **Teren: checklist + upsell CF** | 🟡 **DA — cost mic** | Alimentează extras CF + urbanism (servicii existente) |
| **Afiliere RCA** | 🔴 **NU** | 0,2–3,5% comision = 2–39 lei/poliță, sub costul traficului plătit |
| **Rovinieta ca sursă de venit** | 🔴 **NU** (vezi §5 — risc de verificat) | Comision CNAIR 0,58% pe plată card = sub costul Stripe |
| **Contracte generice / calculatoare** | 🔴 **NU standalone** | Piața plătește 0–1,5 €; dosar-auto.ro a dovedit cu 35 unelte gratuite că nimeni nu plătește pentru calculatoare |

**Decizia de arhitectură: TOTUL pe erovinieta.net.** Nu domeniu nou, nu în eghiseul.ro. Argumentele în §2.

---

## 1. RAR Auto-Pass — ❌ ANULAT (corecție 20.07)

**Fusese marcat inițial „prioritate 1". Verificarea la sursă îl elimină complet.**

RAR a publicat o **informare oficială împotriva revânzătorilor** ([rarom.ro/?p=298753](https://www.rarom.ro/?p=298753)), citat direct:

> „Registrul Auto Român atrage atenția asupra unei situații în care anumite entități terțe **se interpun între R.A.R. și clienții de bună credință, folosind metode alternative și înșelătoare pentru a vă exploata din punct de vedere financiar**. […] recomandarea noastră este să descărcați RAR Auto-Pass doar de pe site-ul oficial al R.A.R."

Certificatul e emis **exclusiv** de RAR (Legea 142/2003, OMTI 210/2024), la **42 lei**, tarif fixat de Consiliul de Administrație. Nu există program de partener, API sau reseller. Site-urile care îl revând (rar-autopass.ro, autopass-online.ro — 89,99 lei față de 42 oficial) sunt exact ținta informării.

**Concluzie: nu intermediem.** Riscul reputațional și juridic e direct și explicit, iar noi avem expunere mai mare decât un site anonim — vindem servicii administrative sub nume propriu, cu avocat asociat.

**Ce facem în schimb** — și e mai valoros pe termen lung: în checklist punem RAR Auto-Pass **primul, marcat „obligatoriu", cu prețul oficial de 42 lei și link direct la rarom.ro, fără niciun comision**. Exact modelul dosar-auto.ro: câștigi încrederea punând întâi opțiunea corectă și negeneratoare de venit. Un client care vede că l-am trimis la sursa oficială în loc să-i vindem cu 90 de lei ceva ce costă 42 are motiv să ne creadă și la restul.

---

## 2. Arhitectura: de ce erovinieta.net

**Decizie: toate produsele auto pe erovinieta.net.** Revizuire față de ipoteza inițială („domeniu nou dedicat").

**Ce e platforma azi** (audit `/Users/raul/Projects/rovinieta-online`):
- Domeniu live, firma NETHUT DIGITAL SRL. Next.js 15/16 + Prisma/PostgreSQL + Netlify (13 cron-uri), Netopia (plăți), Oblio (facturare), Resend/SendGrid + SMSAPI, AWS S3, NextAuth v5.
- **Trafic organic: ~400–530 clicuri/zi (13–15k/lună), în creștere.** Top: `/camere-rovinieta` 8.684 clicuri, `/verificare-rovinieta` 3.489, `/preturi` 2.264.
- **Bază de contacte: ~6.064 emailuri unice** abonați remindere + **8.335** leaduri verificări, unificate în tabela `Subscriber`.
- Vehicule salvate cu **plăcuță + VIN** (până la 20/user), `BillingProfile` cu lookup CUI/ANAF.

**Ce se refolosește (~70%):** generare PDF pe `pdf-lib` (`src/lib/contracts/`, 1.608 linii, în producție), S3, Netopia, Oblio, cont client + vehicule, 13 cron-uri, `AuditLog`, validare VIN și plăcuțe RO, `PlateVinMapping`.

**Ce lipsește:** **OCR complet** (zero SDK AI în `package.json`) — dar există matur pe eghiseul (`src/lib/services/document-ocr.ts`, Gemini), deci **se portează, nu se reinventează**. Plus semnătură desenată (există pe eghiseul: `modules/signature/` + `signature-inserter.ts`).

**Argumentele:**
1. **Audiența se suprapune perfect.** Cine cumpără rovinietă e proprietar de mașină, identificat prin plăcuță + VIN, cu datele deja în DB. Un contract de vânzare se poate **precompleta automat** — exact diferențiatorul față de un PDF gratuit pe care competiția nu-l poate copia fără baza noastră de date.
2. **Autoritate SEO reală pe zona auto adiacentă**, nu doar rovinietă: rankează pe `amenda rovinieta 2026`, `camere rovinieta` (poz. 1–3), `contestare amenda`. `/camere-rovinieta` singură aduce 8.7k clicuri — dovadă că pot rankeze tool-uri auto, nu doar tranzacționale.
3. **Izolează riscul Google Ads.** Contul eghiseul e deja expus politicii governmental-documents. Produsele auto pe alt domeniu + alt cont = o suspendare acolo nu atinge comenzile de 700 lei.
4. **Precedent strategic deja documentat** în `docs/plans/platforma-comparator-asigurari-viziune.md`: „verificarea gratuită e magnetul de trafic, asigurarea e motorul de venit".

**Rezerva reală:** brandul „eRovinieta" e îngust — cine caută „contract vânzare-cumpărare auto" nu asociază domeniul. Mitigare: subfolder + landing dedicat (funcționează SEO), **nu rebranding**.

**De ce nu domeniu nou:** zero autoritate, zero infrastructură, canibalizează atenția de la RCA care e activul cel mai aproape de venit.

---

## 3. RCA — activul cel mai aproape de bani

**Stadiu: ~90% construit, blocat pe un email.**

- Modele Prisma `InsuranceQuote/Offer/Policy/VehicleData/ApiUsage` în DB; `src/lib/rca/`; landing `/asigurare-rca` complet cu FAQ + JSON-LD; wizard cotație 3 pași; carduri cu 8 asigurători; checkout `finalizare/[offerId]` → `multumim/[policyId]` cu **CNP criptat AES-256-GCM**.
- Totul pe mock: `RCA_FEATURE_ENABLED` OFF, `noindex`, `POST /api/rca/checkout` returnează 501 pe non-mock.
- **Blocaj:** email trimis lui Dan Ciceu (Casier Total) pe **18.07.2026**, se așteaptă cheia sandbox, `policy_series`, modul de încasare a primei, valabilitatea ofertei.

**Modelul comercial ales e confirmat independent ca fiind cel corect.** Lanț: Asigurători → **Transilvania Broker (RBK-374)** → **Casier Total (asistent în brokeraj, ASF 564005)** → noi. Comision negociat: **85% din comisionul brokerului**, fără TVA, borderou lunar → **54–122 lei/poliță**.

Research-ul independent pe piață a ajuns la aceeași concluzie fără să știe de acordul nostru:

| Cale | Comision/poliță PF | Barieră |
|---|---|---|
| **Asistent în brokeraj** ← *calea noastră* | **55–105 lei** | curs ISF 45h + înregistrare prin broker, **zero capital** |
| Broker propriu | 111–133 lei | capital 150.000 lei + RC 1,25/1,85 mil EUR + 90 zile ASF |
| **Afiliere/lead-gen** | **2–39 lei** (0,2–3,5%) | zero — dar sub costul traficului plătit |

**Momentul e favorabil:** plafonul legal de 8% (HG 298/2023) a **expirat la 30 iunie 2025** și nu a fost prelungit; comisioanele s-au întors la 10–12% (grile publice: eMAG 12%, VS Company 10–12%, Transilvania Broker raportează 11,37–11,5% medie).

**Context de piață:** 9,6 mil. contracte RCA/an, 10,9 mld lei prime, **97,7% intermediat prin brokeri**, doar 6 din 100 șoferi cumpără direct de la asigurător, iar 92% dintre brokeri au sub 1% cotă — coada e extrem de fragmentată, deci există loc.

⚠️ **De cerut în scris de la Casier Total:** confirmarea split-ului 85% pe hârtie. Niciun broker din piață nu publică grila broker→asistent; research-ul estimează 50–80%, noi avem verbal 85% — merită contract, nu email.

⚠️ **Linia roșie legală:** art. 29 Legea 236/2018 — distribuție fără autorizare/înregistrare ASF = **infracțiune** (3 luni–2 ani sau amendă), incriminate fiind și entitățile care *folosesc* servicii de persoane neînregistrate. Enforcement real: Daw Management Broker amendat cu 120.400 lei fix pentru că a dat credențiale de emitere unei persoane neînregistrate. **Concluzie: nu emitem nimic până nu suntem înregistrați în RIS cu cod RAF prin Casier Total.**

---

## 4. Pachetul „vând mașina" — pâlnia

**Poziționare: nu „generator de contracte", ci „tot ce trebuie ca să vinzi/cumperi legal".** Nu e linia de venit — e mecanismul care aduce omul exact în momentul în care are nevoie de RCA (cumpărătorul) și de RAR Auto-Pass (vânzătorul).

### 4.1 Procedura legală completă 2026 (baza checklistului)

**OUG 7/2026** — confirmată din sursă oficială: **MO nr. 146 din 25 februarie 2026**, aplicare la ghișee din 2 martie. Modifică art. 159 Cod procedură fiscală:

> Pentru dobândirea dreptului de proprietate asupra [...] mijloacelor de transport, **dobânditorii trebuie să prezinte certificate de atestare fiscală** [...] Actele încheiate cu încălcarea acestor prevederi sunt **nule de drept**.

**Deci DA: cumpărătorul are nevoie de CAF-ul LUI**, altfel contractul e nul. Regulă nouă, încă puțin cunoscută — o amendă neplătită la bugetul local blochează cumpărarea. CAF-ul a devenit **gratuit**, se eliberează în **2 zile lucrătoare**, valabil **30 de zile**.

**Fluxul complet, cu termene:**

| Termen | Cine | Ce | Sancțiune |
|---|---|---|---|
| înainte | Vânzător | CAF vehicul (impozit plătit pe **tot anul**, nu pro-rata) | contract nul |
| înainte | **Cumpărător** | **CAF propriu — NOU OUG 7/2026** | **contract nul de drept** |
| înainte | Vânzător | **RAR Auto-Pass 42 lei**, valabil 60 zile | (vezi incertitudini) |
| ziua 0 | ambii | Contract **ITL-054, 5 exemplare** | — |
| 30 zile | Vânzător | Scoatere din rol fiscal + **viza REMTII** | 70–279 / 279–696 lei |
| 30 zile | Cumpărător | Declarare la primărie + **a doua viză REMTII** | 70–279 / 279–696 lei |
| imediat | Cumpărător | **RCA** — fără perioadă de grație | **1.000–2.000 lei** + plăcuțe reținute |
| 90 zile | Cumpărător | Transcriere SPCRPCIV (49 lei + 20 lei plăcuțe) | **înmatriculare suspendată de drept** |
| 30 zile | Cumpărător | Schimbare număr rovinietă la CNAIR | amendă la control |

**Cele 5 exemplare ITL-054**: vânzător, cumpărător, arhiva organului fiscal al vânzătorului, organul fiscal al cumpărătorului, SPCRPCIV. **Dubla viză REMTII** (una de la fiecare primărie) e obligatorie — fără ea dosarul e respins la înmatriculări.

### 4.2 Ce greșesc oamenii (materialul de vânzare al checklistului)

1. **Vânzătorul crede că semnarea contractului e suficientă.** Fără scoaterea din rol, mașina rămâne pe numele lui — primește impozit, amenzi, taxe de pod. **Reclamația nr. 1** pe forumuri și în practica avocaților.
2. Se semnează contractul **înainte** de a obține CAF-ul → nulitate.
3. Cumpărătorul **nu știe că din 2026 îi trebuie CAF-ul lui**.
4. Se ratează **una din cele două vize REMTII** → dosar respins.
5. Expiră CAF-ul (30 zile) sau RAR Auto-Pass (60 zile) până la depunere → se reia tot.
6. **Se circulă fără RCA de la vânzător spre casă** → 1.000–2.000 lei.
7. Se crede că trebuie **rovinietă nouă** (nu — e pe VIN), dar se uită anunțarea CNAIR → amendă deși rovinieta e validă. **← cross-sell natural spre serviciul nostru principal.**
8. Nu se verifică **RNPM** (gaj) înainte de cumpărare.

### 4.3 Cele 14 acte generabile automat

| # | Denumire oficială | Cod | Cine |
|---|---|---|---|
| 1 | Contract de înstrăinare–dobândire a unui mijloc de transport | **ITL-054** | ambii |
| 2 | Cerere certificat atestare fiscală PF | **ITL-010** | ambii |
| 3 | Cerere certificat atestare fiscală PJ | **ITL-011** | PJ |
| 4 | Declarație impozit mijloace transport PF | **ITL-005** | cumpărător |
| 5 | Declarație impozit mijloace transport PJ | **ITL-006** | cumpărător PJ |
| 6 | Declarație scoatere din evidență | ITL | vânzător |
| 7 | Cerere transcriere transmitere drept proprietate | formular **DGPCI** | cumpărător |
| 8 | Cerere radiere din circulație (protecția vânzătorului) | DGPCI | vânzător |
| 9 | Cerere schimbare număr pentru rovinietă | formular **CNAIR** | cumpărător |
| 10 | Procură specială depunere dosar | notarial | oricare |
| 11 | Proces-verbal predare-primire | liber | ambii |
| 12 | Declarație kilometraj / stare tehnică | liber | vânzător |
| 13 | Cerere reziliere RCA + restituire primă | asigurător | vânzător |
| 14 | Împuternicire reprezentare PJ | liber | PJ |

### 4.4 Competiția și pricing

13 site-uri vizitate direct. Constatări care schimbă ipoteza inițială:

| Site | Preț | OCR | Note |
|---|---|---|---|
| car-docs.ro | 29,99 / comodat 24,99 / rovinietă 24,99 | **DA** | NEXTTICK SRL 2024; wizard 5 pași; trust fragil (Gmail ca email de firmă, fără politică de retenție pentru pozele cu CI) |
| econtractauto.ro | **25 lei** | **DA** | ian 2026 — a copiat OCR-ul sub prețul liderului |
| contract-vanzare-auto.ro (AutoX) | 49,99 web / **19,99 în app** | NU | **contract editabil 1 lună** + semnătură electronică + apps iOS/Android |
| concreto.ro | 25 + **5/add-on** | NU | singurul cu upsell structurat pe acte; rankează #1 |
| **cvc.faraamenda.ro** | **GRATUIT** | NU | Zero Amenda SRL 2018 — **monetizează prin RCA** |
| **dosar-auto.ro** | **GRATUIT** | NU | dec 2025, **400+ URL-uri, 42 secțiuni județene, ~35 unelte** — monetizează doar prin RCA/CASCO afiliat |
| actesimplu.ro | de la 10 lei; 100–300 lei/lună | **DA** | model SaaS B2B |
| docexpress.ro | 29,98–169,98 | NU | Weburst SRL 2004; **ONRC „în curând"** — converge spre teritoriul eghiseul |

**Patru concluzii:**
1. **OCR-ul nu mai e diferențiator** — trei jucători îl au deja, unul la 25 lei.
2. **29 lei e vârful pieței, nu media** (25–27,99; AutoX 19,99 în app).
3. **Doi jucători dau produsul gratuit și trăiesc din RCA** — exact modelul spre care mergem și noi. **Pe preț nu-i batem niciodată**; îi batem pe corectitudine juridică (OUG 7/2026) și pe execuția serviciului, nu pe generarea PDF-ului.
4. **Toți rulează wizard pe 3 pași**; car-docs are 5 și pierde conversie.

**Lecția de la dosar-auto.ro:** 35 de unelte gratuite ca să vândă RCA la 0,2–3,5% comision. **Au traficul, monetizează prost.** Noi avem 55–105 lei/poliță prin asistent în brokeraj — **de 3–50× mai mult per poliță pe același trafic**. Ăsta e golul.

### 4.5 MVP

**Features:**
1. Wizard **maxim 3 pași**, gratuit până la generare, **precompletat din vehiculele salvate** (avantaj unic).
2. Contract ITL-054 + **checklist personalizat** cu toate termenele (30/30/90), cine ce depune și unde.
3. **OCR CI + talon** — portat din eghiseul (Gemini), paritate obligatorie.
4. **Contract editabil 30 de zile** din cont — răspunde fricii reale („greșesc VIN-ul după plată"); doar AutoX îl are.
5. **Remindere automate**: ziua 20 (scoatere din rol / declarare primărie), ziua 60 și 80 (transcriere). Infrastructura de remindere există deja.
6. **Cross-sell în fluxul natural**: RCA la cumpărător (obligatoriu, marja reală), transfer rovinietă la cumpărător, cazier auto. RAR Auto-Pass **doar ca informare cu link oficial**, fără comision (§1).

**Pricing — de decis între două modele:**
- **A) Freemium (recomandat):** contract + checklist **gratuit**, monetizare din RCA + rovinietă + cazier auto + afiliere carVertical. Concurează direct cu cei doi jucători gratuiți, maximizează volumul pâlniei.
- **B) Plătit:** 24,99 lei contract / 49 lei „dosar complet". Venit imediat, dar volum mai mic și luptă de preț cu gratuitul.

**Recomandare: A**, cu condiția ca RCA-ul să fie deblocat. Fără RCA, pâlnia nu are unde să ducă și atunci B e singura variantă.

**Măsurare (90 zile):** rata de atașare RCA din fluxul de contract (ținta ≥5%), conversie vizitator→contract generat, cost per contract din Ads sub 5 lei, venit din afiliere carVertical per 1.000 vizitatori (reper: 40–500 lei, caz de bază ~135 lei).

---

## 5. ⚠️ Risc de verificat: statutul de distribuitor rovinietă

Research-ul de piață a semnalat că **erovinieta.net apare într-o listă de site-uri neautorizate cu avertisment public CNAIR**, pentru markup peste tariful oficial prezentat ca „procesare manuală". Nu am putut verifica independent dacă avertismentul e real, actual, sau dacă vizează platforma noastră.

**Ce știm din cod:** modelul e **markup 10%** peste prețul Casier Total (`CASIER_TOTAL_MARKUP_PERCENTAGE`), iar `README.md:401` afișează „Distribuitor autorizat CNAIR". Vindem **prin** Casier Total, nu direct sub contract CNAIR.

**De verificat urgent, în ordinea asta:**
1. Există avertisment CNAIR public care ne numește? (căutare directă pe cnair.ro / comunicate)
2. Casier Total e distribuitor autorizat CNAIR, și acoperă contractul lui revânzarea prin noi?
3. Afirmația „Distribuitor autorizat CNAIR" de pe site e corectă juridic în lanțul ăsta, sau trebuie reformulată în „partener al unui distribuitor autorizat"?

**Context care face verificarea importantă:** documentul CNAIR (OMT 959/2024) art. 3 alin. 6³ interzice distribuitorilor să condiționeze accesul la plata rovinietei de înregistrare, cont, achiziția altor produse sau vizualizarea de reclame, cu sancțiunea **rezilierii imediate și definitive**. Dacă ne aplicăm ca distribuitor direct, clauza asta e incompatibilă cu bundling-ul și cross-sell-ul din planul de față. **Dacă suntem revânzător prin Casier Total, clauza nu ne vizează direct — dar exact asta trebuie confirmat.**

Notă separată: comisionul CNAIR pentru distribuitori la plata cu cardul e **0,58%** (~1,22 lei pe o rovinietă anuală), sub costul procesatorului. Deci rovinieta rămâne cârlig de trafic și retenție, nu sursă de marjă — ceea ce codul confirmă deja prin modelul de markup.

---

## 6. Certificat urbanism — nu e idee nouă, există deja

**Verificare DB (20.07):** serviciul `certificat-urbanism-informare` **există, e ACTIV, 780 lei, 0 comenzi**. Există și `/calculator/cat-pot-construi` (POT/CUT). Ce lipsește:

- **Nicio pagină dedicată** — celelalte 29 de servicii au `/servicii/<slug>/`, acesta rulează doar pe ruta dinamică.
- Zero conținut SEO pe intenția reală („ce pot construi pe teren", POT/CUT, „verificare teren înainte de cumpărare").
- Nicio legătură din clusterul imobiliar (extras CF, identificare imobil) spre el.

**Problema e distribuția, nu produsul.** Costul de a-l face vizibil (pagină + cluster + link-uri interne) e o fracțiune din orice produs nou, iar 780 lei = 3 comenzi de extras CF. **Cel mai ieftin venit potențial din tot documentul.**

Context de piață: CU de informare poate fi cerut de **orice persoană interesată, fără act de proprietate** (ideal pentru cumpărători); taxa e de zeci de lei; termen legal 30 zile; andaros-imob.ro cere **1.000–1.200 lei + TVA** pentru același lucru. **Nu automatizăm** (3.200 primării, majoritatea offline) — acoperire realistă București + Ilfov + orașe cu portal, fulfillment prin Mircea. Vindem „ne ocupăm noi de drumuri", nu „rapid".

---

## 7. Contestație amendă — singurul avantaj necopiabil

Toți competitorii vând șabloane la ~100 lei (rontract.ro) în **zona gri a Legii 51/1995** (art. 3: consultațiile juridice și redactarea de acte sunt rezervate avocaților; art. 26: exercitarea fără drept e **infracțiune**). Un generator care personalizează pe speța clientului se apropie periculos de consultanță.

**Noi avem deja:** rolul `avocat` în RBAC, semnătură de avocat predefinită, contract de asistență juridică generat automat. Putem face **legal** exact ce ei fac în zona gri.

Nu am găsit jurisprudență sau decizie UNBR care să tranșeze cazul — de discutat cu avocata înainte de a construi.

---

## 8. Ce NU facem

- **Afiliere RCA** — 2–39 lei/poliță vs. 55–105 prin asistent în brokeraj. Diferența de 10–25× e exact prețul înregistrării ASF, pe care oricum îl plătim prin Casier Total.
- **Calculatoare, verificări, remindere ca produs** — dosar-auto.ro a demonstrat cu ~35 de unelte gratuite că nimeni în RO nu plătește pentru ele. Sunt **SEO top-funnel**, atât.
- **Contracte generice** (comodat generic, închiriere) — piața plătește 0–1,5 €; oamenii plătesc notarul pentru efectul juridic. Excepție: comodatul auto ca add-on în pachetul „vând mașina".
- **Date auto proprii** — evita-amenzi.ro vinde deja API comercial (marcă, model, VIN, ITP/RCA/rovinietă, <600ms, 2M+ verificări/lună, sandbox gratuit). **Cumpărăm, nu construim.**

---

## 9. Ordinea de execuție

1. **Deblochează RCA** — urmărește emailul către Dan Ciceu (18.07). Cel mai aproape de venit. Cere split-ul 85% în scris.
2. **Verifică statutul CNAIR** (§5) — risc de reputație/contract, nu costă nimic de verificat.
3. ~~Verifică dacă portalul RAR permite automatizare~~ — **închis 20.07: nu intermediem RAR Auto-Pass** (§1). Înlocuit cu: **aplică la afilierea carVertical** (Everflow) și negociază rata + cod de cupon dedicat.
4. **Certificat urbanism: pagină + cluster SEO** — nu depinde de nimic, zile de muncă, serviciu deja în DB la 780 lei.
5. **Portează OCR-ul** din eghiseul (`document-ocr.ts`) în erovinieta, peste `src/lib/contracts/` existent.
6. **Pachetul „vând mașina"** — după ce RCA-ul e live, ca să aibă pâlnia unde să ducă.
7. **Verificare juridică checklist** — sună 2–3 direcții de impozite (vezi incertitudinile de mai jos) înainte de a automatiza.
8. Contestație amendă — discuție cu avocata.
9. Cluster SEO teren → upsell CF + urbanism.

---

## 10. Incertitudini de verificat înainte de a automatiza checklistul

Research-ul legal a marcat 11; cele blocante:

1. **⚠️ MAJOR — ITL-054 vs. CAF.** Documentația formularului ITL-054 spune că viza REMTII *înlocuiește* certificatul fiscal (regula pre-2026); OUG 7/2026 pare să reintroducă CAF obligatoriu pentru ambele părți. **Nu există text care să armonizeze cele două regimuri.** De sunat 2–3 DITL-uri să vedem ce cer efectiv la ghișeu în iulie 2026.
2. **⚠️ Amenda pentru depășirea celor 90 de zile.** Sancțiunea legală confirmată e suspendarea de drept a înmatriculării. Cifrele 1.200–1.730 lei circulă prin bloguri comerciale care par să extrapoleze din alte fapte. **Nu punem cifre neconfirmate în checklist.**
3. **⚠️ Sancțiunea pentru vânzătorul care nu oferă RAR Auto-Pass** — surse contradictorii (2.000–5.000 lei vs. „Legea 142/2023 nu prevede sancțiune directă pentru PF").
4. **⚠️ ITP obligatoriu la transcriere?** Surse contradictorii, fără dispoziție legală expresă găsită.
5. **⚠️ Regimul donațiilor sub OUG 7/2026** — textul folosește „înstrăinare" (larg) vs. „dobânditor" (îngust); neclar pentru „vânzare între rude prin donație".
6. **⚠️ Costul schimbării numărului pentru rovinietă** — ~20 lei fără TVA vs. gratuit prin email.

**Notă metodologică importantă:** majoritatea surselor găsite sunt bloguri comerciale SEO (dosar-auto.ro, contract-auto.ro etc.) care **se copiază reciproc și amplifică erori**. Exact aici e oportunitatea noastră: **un checklist verificat pe surse oficiale, actualizat la OUG 7/2026, e ce nu are nimeni** — inclusiv cei doi jucători gratuiți.

---

## Surse principale

**Legislație:** OUG 7/2026 ([Portal Legislativ](https://legislatie.just.ro/Public/DetaliiDocument/307573), MO 146/25.02.2026) · Ordin 1069/2016 (formulare ITL) · art. 493 Cod fiscal · OG 14/2017 (termen 90 zile) · Legea 142/2023 (RAR Auto-Pass) · Legea 236/2018 (distribuție asigurări) · Legea 51/1995 (profesia de avocat) · OMT 959/2024 (condiții distribuitori rovinietă)

**Piață asigurări:** ASF via [HotNews](https://hotnews.ro/premiera-in-piata-rca-un-asigurator-supravegheat-in-franta-a-urcat-in-top-3-din-romania-cat-au-crescut-preturile-rca-anul-trecut-2215260) și [ZF](https://www.zf.ro/banci-si-asigurari/cum-arata-topul-asiguratorilor-rca-in-s1-2025-piata-rca-a-crescut-in-22952076) · [grilă comisioane VS Company](https://www.vscompany.ro/informatii-utile/grila-comisioane) · [grilă eMAG](https://www.emag.ro/asigurari-rca/documente/comisioane_site) · raport BVB Transilvania Broker

**Analize juridice:** [JURIDICE.ro pe OUG 7/2026](https://www.juridice.ro/819722/) · [avocatnet.ro](https://www.avocatnet.ro/articol_71417/) · Universul Juridic

**Docs interne:** `rovinieta-online/docs/asigurari/` (7 doc.) · `docs/plans/platforma-comparator-asigurari-viziune.md` · `docs/api/CASIER_TOTAL_PRICING.md`
