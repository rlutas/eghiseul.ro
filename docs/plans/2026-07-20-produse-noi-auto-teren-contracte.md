# Produse noi: dosar auto, teren/urbanism, contracte generice — research + plan

**Data:** 2026-07-20
**Status:** 📋 RESEARCH COMPLET — decizie luată pe arhitectură, implementare NEPORNITĂ
**Context:** discuție Raul 20.07 — idei de extindere a platformei dincolo de cele 9 servicii instituționale.

---

## TL;DR — verdicte

| Idee | Verdict | De ce |
|---|---|---|
| **Tool auto (contract CVC + dosar complet)** | ✅ **DA — prioritate 1** | Cerere masivă, preț validat 25–30 lei, OCR-ul nostru există deja, fereastră OUG 7/2026, piața are sub 6 luni vechime |
| **Teren: checklist + upsell extras CF** | ✅ **DA — cost mic** | Alimentează serviciul CF existent (marjă imediată), doar conținut |
| **Certificat urbanism de informare** | ⚠️ **NU E IDEE NOUĂ — deja în DB, 780 lei, 0 comenzi** | Serviciul e activ dar invizibil: fără pagină dedicată, fără cluster SEO. Problema e distribuția, nu produsul |
| **Generator contracte generice** | ❌ **NU standalone** | Piața plătește 0–1,5 €; oamenii plătesc notarul (efect juridic), nu template-ul |

**Decizie de arhitectură pentru tool-ul auto: domeniu dedicat, pe infrastructura eghiseul** (același codebase/Stripe/OCR/Oblio/Supabase, servit prin middleware multi-domain). Argumentele în §1.4.

---

## 1. Tool auto — „dosarul complet de vânzare auto"

### 1.1 Piața și fereastra de oportunitate

Contractul e **formular tipizat** (model DRPCIV / ITL 054), 5 exemplare, semnat fizic — deci produsul e legitim, nu practică juridică. Modelul e gratuit pe dgpci.mai.gov.ro, dar ~10 microsite-uri trăiesc din a-l vinde la 25–30 lei, ceea ce validează willingness-to-pay.

**Fereastra:** **OUG 7/2026** (din 25 feb 2026) a complicat procedura — și cumpărătorul trebuie certificat de atestare fiscală fără datorii, altfel **contractul e nul**; RAR AutoPass (50 lei) obligatoriu vânzătorului. Frica de nulitate e exact motivul pentru care oamenii plătesc deși modelul e gratuit.

**Observație-cheie:** aproape toată piața are **sub 6 luni vechime** (contract-kit feb 2026, actesimplu mar 2026, dosar-auto dec 2025), iar incumbentul de 15 ani (modele-contracte.ro) tocmai a murit — site-ul returnează „Error establishing a database connection". Terenul se împarte ACUM.

### 1.2 Competiția

**car-docs.ro — teardown** (NEXTTICK S.R.L., CUI 50633599, Orăștie, firmă din 2024):

| Produs | Preț |
|---|---|
| Contract vânzare-cumpărare auto | 29,99 lei |
| Contract comodat auto PF→PJ | 24,99 lei |
| Cerere schimbare număr rovinietă | 24,99 lei |
| Calculator impozit auto 2026 | gratuit (lead magnet) |

Wizard 5 pași (`/contract/0..4`): vânzător → cumpărător → vehicul → tranzacție → plată. **OCR pe CI + talon** (JPEG/PNG/WebP, max 10MB). **Se poate parcurge tot wizardul gratuit, inclusiv OCR — paywall doar la descărcare.** Livrează exclusiv PDF-ul contractului + copie pe email. SEO: 36 URL-uri, 21 articole, 8 pagini pe orașe (doorway subțiri, sub 300 cuvinte — vulnerabile la helpful-content update). Upsell unic: link afiliat CarVertical.

**Slăbiciunile lui car-docs (= oportunitățile noastre):**
1. Vinde o hârtie, nu rezolvarea. Job-to-be-done real are 6 pași: contract → radiere fiscală vânzător → înregistrare la primărie → transcriere DRPCIV în 90 zile → RCA → rovinietă. El livrează pasul 1.
2. **Zero reminder pe termenul de 90 de zile** pentru transcriere (amendă 1.000–2.000 lei).
3. Nu generează cererea de radiere din rol fiscal, cererea de înmatriculare, Anexa 5.
4. Trimite marja la CarVertical prin afiliere în loc s-o integreze.
5. Trust fragil: Gmail ca email de firmă, fără telefon, fără ANPC/SOL, **fără politică de retenție pentru pozele cu buletinul** (risc GDPR real).
6. Fără cont client (zero LTV), fără facturare (zero B2B).

**Restul pieței (13 site-uri vizitate direct):**

| Site | Preț | OCR | Ce livrează | Upsell | Firmă / domeniu |
|---|---|---|---|---|---|
| car-docs.ro | 29,99 / 24,99 / 24,99 | **DA** | PDF instant + email | afiliat CarVertical | NEXTTICK SRL, 2024 |
| **econtractauto.ro** | **25 lei** | **DA** | PDF DRPCIV + validare CNP/VIN/CUI | verificare număr auto | fără CUI în footer, **ian 2026** |
| **contract-vanzare-auto.ro (AutoX)** | 49,99 web / **19,99 în app** | NU | PDF + **editabil 1 lună** + **semnătură electronică** + apps iOS/Android | calculator impozit, modele | Five Quantum Bits SRL, 2024 |
| concreto.ro | 25 + **5/add-on** | NU | PDF pe email ambele părți | **add-on-uri acte** + servicii firmă | rankează #1 |
| contract-vanzare-cumparare-auto.ro | 27,99 (promo 15) | NU | PDF pe email | niciunul | SEO MARKETING AGENCY SRL, 2022 |
| actele.ro | 25,99 | NU | PDF pe email | contract închiriere | UnderFuture Tech, 2024 |
| actesimplu.ro | de la 10 lei; **100–300 lei/lună** | **DA** | PDF ~3 min + acte gratuite momeală | ONRC, abonamente B2B | mar 2026 |
| docexpress.ro | 29,98; 99,98–169,98 cu livrare | NU | PDF sau fizic prin curier | RCA, curier, **ONRC „în curând"** | Weburst SRL, 2004 |
| **cvc.faraamenda.ro** | **GRATUIT** | NU | contract pe email, print nelimitat | **redirect RCA** | Zero Amenda SRL, 2018 |
| **dosar-auto.ro** | **GRATUIT** | NU | **30+ unelte**: generatoare, calculatoare, verificări RCA/ITP/VIN, ghiduri pe **42 județe** | **afiliere RCA/CASCO + eMAG** | „proiect independent", **dec 2025** |
| contractdevanzarecumparareauto.ro | — | — | **MORT** (DNS nu rezolvă) | — | domeniu 2025 |

### 1.2b Ce ne spune de fapt tabelul (revizuire de strategie)

Patru constatări care contrazic ipoteza inițială „copiem car-docs, dar mai bine":

1. **OCR-ul NU mai e diferențiator.** econtractauto.ro (ianuarie 2026) face 25 lei **cu OCR** — sub car-docs. Trei jucători au deja OCR. Paritatea e obligatorie, dar nu vinde nimic.
2. **Prețul de 29 lei e vârful pieței, nu media.** Media reală e 25–27,99; AutoX vinde la 19,99 în app. Un preț de 29 lei fără justificare vizibilă e handicap la start.
3. **Doi jucători dau produsul GRATUIT și monetizează prin RCA.** cvc.faraamenda.ro (Zero Amenda SRL, din 2018) și dosar-auto.ro (dec 2025, deja 30+ unelte și ghiduri pe 42 județe). **Comisionul RCA depășește cu mult 30 lei per lead** — pot rămâne gratuiți la nesfârșit. Pe preț nu-i batem niciodată.
4. **Toți concurenții rulează wizard pe 3 pași; car-docs are 5** — la un produs de 30 lei, fiecare pas costă conversie direct.

**Ce nu are nimeni** (și AutoX are doar parțial): contract **editabil după cumpărare** (rezolvă frica reală „greșesc o cifră din VIN și am plătit degeaba"), **dosarul complet de acte** (nu doar contractul), **reminderul de 90 de zile**, și legătura cu serviciile administrative reale (cazier auto, radiere).

**Implicație asupra modelului de business:** monetizarea principală probabil NU e contractul de 29 lei, ci **RCA-ul afiliat** (comision recurent anual, iar cumpărătorul TREBUIE să facă RCA imediat după contract — e momentul perfect în flux). Contractul devine mecanismul de achiziție; RCA + dosarul complet + cross-sell cazier auto sunt marja. De verificat înainte de green-light: comisionul real per poliță RCA la un broker partener.

### 1.3 Generatoare generice (contextul larg)

- **contract-kit.com** (JACKCODE FZCO, **Dubai**): trial-trap 7,50 lei/48h → **abonare automată 200 lei/lună**. Pagină `/cancel` proeminentă = volum de plângeri. Profitabil, reputațional toxic.
- **generator-contracte.com**: complet gratuit, zero monetizare — fază de acumulare SEO.
- **modele-contracte.ro**: 225 modele la 59 lei, a ținut 15 ani, **acum mort** — poziția SEO e liberă.
- **contracte.app (LexiRo)**: freemium AI, export 9,99 €, abonament 49,99 €/lună. Sofisticat, dar 5–10× prețul pieței.

**Gap central:** între „gratuit fără suport" și „200 lei/lună trap" nu există jucătorul de încredere B2C la preț unic rezonabil. Comodatul (auto + sediu social PFA/SRL) e SEO nerevendicat — SERP-ul e Scribd și PDF-uri de primării.

### 1.4 Decizia de arhitectură: domeniu dedicat pe infrastructura noastră

**NU integrare în /servicii pe eghiseul.ro. NU produs separat de la zero.** Același codebase Next.js, Stripe, OCR Gemini, Oblio, Supabase — servit pe un domeniu nou prin middleware multi-domain (Vercel acceptă mai multe domenii pe un proiect; middleware rutează după `host` către un layout de brand separat).

**De ce nu integrare simplă în eghiseul.ro:**
- **Nepotrivire de preț și poziționare.** eghiseul vinde 200–700 lei cu livrare fizică și termen de zile. Un produs de 29 lei, instant, self-service, poluează AOV-ul, sidebar-ul wizardului (`estimated_days`) și mesajul de platformă instituțională.
- **Riscul Google Ads e argumentul decisiv.** Contul eghiseul e deja expus politicii „governmental documents" (vezi memoria proiectului — cont limitat, copy curățat). Contractul CVC e act între privați, perfect promovabil; dar cererea de transcriere/radiere/înmatriculare e la limită. Domeniu + cont Ads separate = **izolarea riscului**: o suspendare acolo nu atinge contul care aduce comenzile de 700 lei.
- **SERP-ul demonstrează empiric că nișarii câștigă.** Pe „contract vanzare cumparare auto pdf model 2026" primele poziții sunt exclusiv domenii dedicate. Niciun generalist nu apare. Autoritatea eghiseul (AS 31) e topică pe cazier/stare civilă/CF — nu transferă pe intenția asta, iar eghiseul nu rankează azi pe nimic din zonă, deci nu pierde nimic pornind separat.

**De ce nu produs complet separat:** ar arunca exact activele care ne diferențiază de car-docs — OCR-ul Gemini calibrat pe CI/talon românesc, docxtemplater + `signature-inserter` cu audit trail (Legea 214/2024), Oblio, contul client, RBAC-ul admin. Produs nou = luni; pe infrastructura existentă = **2–3 săptămâni**.

**Cross-sell-ul cazier auto rămâne funcțional cross-domain** — același Supabase/`profiles`, link contextual în emailul post-cumpărare, SSO pe cont comun. Cross-sell-ul cere aceeași bază de utilizatori, nu același domeniu.

### 1.5 MVP v1 (2–3 săptămâni)

**Poziționare: „dosarul complet de vânzare auto", nu „generator de contracte".** Atac direct la slăbiciunea #1 a tuturor: ei vând o hârtie, noi vindem rezolvarea.

1. Contract CVC auto, model DRPCIV, cu **OCR pe CI + talon** — paritate obligatorie, nu diferențiator.
2. **Wizard pe MAXIM 3 pași**, gratuit până la plată, paywall doar la descărcare. (car-docs are 5 — nu copiem asta.)
3. **Pachet „dosar complet"**: contract + cerere radiere din evidențe fiscale + cerere înmatriculare/transcriere + Anexa 5 + checklist pe județ. Diferențiatorul de preț.
4. **Contract editabil 30 de zile** din cont — singurul lucru pe care doar AutoX îl are și care răspunde fricii reale a clientului (greșeală în VIN/CNP după plată). Ieftin de implementat, mare ca valoare percepută.
5. **Reminder automat 90 de zile** (email zilele 60/80 + SMS ziua 85 — avem Resend; SMSLink e de construit). Zero cost marginal, nimeni nu-l are, e motivul pentru care userul își face cont.
6. **RCA imediat după contract** — plasament afiliat la broker, în ecranul de succes. Cel mai probabil aici e marja reală; cvc.faraamenda și dosar-auto trăiesc exclusiv din asta.
7. Contract comodat auto PF→PJ (SEO nerevendicat, marjă identică).
8. Cont client cu contracte salvate + **factură automată Oblio** → deblochează B2B-ul (parcuri auto, dealeri, contabili).

**Preț** (media pieței e 25–27,99; 29 e vârful, 19,99 e podeaua AutoX-in-app):
- Contract simplu: **24,99 lei** ← sub car-docs și la nivelul econtractauto, care are și OCR
- **Dosar complet: 49 lei** ← ancora reală, unde vrem conversia; nimeni nu are echivalent
- Comodat: **24,99 lei**
- Pachet dealer/parc auto: **199 lei/lună, 30 acte** (sub actesimplu Pro, cu factură)

**NU în v1:** semnătură electronică, aplicație mobilă, verificare VIN proprie, integrare DRPCIV, AI de redactare clauze.

**De verificat ÎNAINTE de green-light:** comisionul real per poliță RCA la un broker partener. Dacă e >30 lei/lead, modelul se inversează — contractul poate fi chiar gratuit ca armă de achiziție, exact ca la cei doi jucători gratuiți, iar marja vine din RCA + dosar + cross-sell.

**Măsurarea succesului (90 de zile):**
- **Metrica-nord: rata de atașare „dosar complet"** — dacă >35% aleg 49 în loc de 24,99, ipoteza e validată (AOV ~35 lei vs 25 al pieței).
- **Rata de conversie RCA** din ecranul post-cumpărare — dacă depășește veniturile din contracte, pivotăm modelul spre gratuit.
- Conversie vizitator→plată în wizard: **6–8%** (cu 3 pași, nu 5).
- CPA din Ads sub **15 lei** — altfel produsul la 25 lei nu are unit economics și trebuie împins pe SEO.
- **Cross-sell cazier auto ≥3%** pe 60 de zile — testul care justifică proiectul. Dacă e zero, produsul e o insulă de 25 lei.
- 50 comenzi plătite în prima lună fără ads = PMF organic.

**Riscurile principale:**
1. **Nu putem concura pe preț cu gratuitul.** dosar-auto.ro (30+ unelte, ghiduri pe 42 județe, lansat dec 2025) e o mașină SEO care va ajunge inevitabil pe keywordurile noastre, finanțată din comision RCA. Singurul unghi contra lor: încredere și corectitudine juridică („valid la DRPCIV post-OUG 7/2026"), plus dosarul complet pe care ei nu-l au.
2. Marja e mică, volumul trebuie să vină din SEO. Bugetăm 3–4 luni până la tracțiune organică; nu evaluăm după prima lună de Ads.

---

## 2. Teren / imobiliar

### 2.1 Checklist vânzare-cumpărare teren → upsell extras CF ✅

Cost mic, alimentează un serviciu existent cu marjă imediată. Cererea reală nu e pe „certificat urbanism informare" (nișă), ci în amonte: „ce poți construi pe teren", POT/CUT, „verificare teren înainte de cumpărare" — cluster pe care scriu deja concurenții din cadastru (ancpi.online, cadastru24, cadastruacasa.ro, storia.ro).

Format: pagină-cluster „vinzi/cumperi teren" cu checklist gratuit → upsell extras CF + identificare imobil (servicii existente).

### 2.2 Certificat de urbanism de informare ⚠️ NU e idee nouă — există deja

**Constatare la verificarea DB (20.07):** serviciul **`certificat-urbanism-informare` există, e ACTIV, la 780 lei** (aliniat cfunciara.ro prin auditul din 15.07) și are **0 comenzi**. Există și calculatorul `/calculator/cat-pot-construi` (POT/CUT). Ce lipsește:

- **Nicio pagină de serviciu dedicată** — celelalte 29 de servicii au `/servicii/<slug>/`, acesta nu (rulează doar pe ruta dinamică `[slug]`).
- **Zero conținut SEO** pe intenția reală („ce pot construi pe teren", POT/CUT, „verificare teren înainte de cumpărare").
- Nicio legătură din clusterul imobiliar existent (extras CF, identificare imobil) spre el.

**Deci problema nu e produsul, e distribuția.** Costul de a-l face vizibil (pagină + cluster de conținut + link-uri interne din serviciile CF) e o fracțiune din a construi ceva nou, iar prețul de 780 lei e deja peste ce lăsăm pe masă la 3 comenzi de extras CF. **Prioritate mai mare decât pare** — e cel mai ieftin venit potențial din tot documentul.

**Fapte de piață (rămân valabile pentru poziționare):**
- Emis de primării (Legea 350/2001 + Legea 50/1991). **Poate fi cerut de orice persoană interesată, fără act de proprietate** — ideal pentru cumpărători.
- Taxă locală mică (Cod Fiscal art. 474; zeci de lei, rural = jumătate). Termen legal ~30 zile.
- Depunere online doar unde primăria are portal (București, Timișoara); restul pe hârtie. Prin împuternicit: da, cu procură.
- **Servicii private taxează gras**: andaros-imob.ro cere **1.000–1.200 lei + TVA** doar pentru CU de informare (București/Ilfov). Marja e enormă vs taxă, dar efortul e manual (dosar cu plan de situație, extras CF, proceduri diferite per primărie).

**Recomandare revizuită:** serviciul există deja la 780 lei, deci nu discutăm dacă îl lansăm, ci **cum îl facem vizibil**:

1. **Pagină de serviciu** `/servicii/certificat-urbanism-informare/` după template-ul din SERVICE-PAGE-DESIGN-GUIDE.md (paritate cu celelalte 29).
2. **Cluster de conținut pe intenția din amonte** — „ce poți construi pe teren", POT/CUT, „verificare teren înainte de cumpărare", legat de calculatorul `/calculator/cat-pot-construi` care deja există și e probabil orfan.
3. **Link-uri interne** din extras CF / identificare imobil → certificat urbanism (cumpărătorul de teren are nevoie de ambele).
4. **Onestitate pe termen**: 30 de zile legal, fulfillment manual prin Mircea. Nu-l vindem ca „rapid" — îl vindem ca „ne ocupăm noi de drumuri", exact ca Andaros care ia 1.000–1.200 lei + TVA pentru același lucru.

Rămâne valabil: **nu automatizăm** (3.200 primării, majoritatea offline). Acoperire realistă: București + Ilfov + orașe cu portal.

---

## 3. Contracte generice ❌

Piața plătește 0–1,5 € pe template; gratuitul abundă (avocatnet, e-juridic, generator-contracte.com). Oamenii plătesc **notarul** pentru efectul juridic: comodat la notar 150–200 lei (dată certă pentru sediu social ONRC), închiriere legalizată sub 250–300 lei pentru titlu executoriu. Înregistrarea la ANAF e gratuită prin SPV.

Barieră suplimentară: redactarea personalizată cu pretenție de consultanță = risc de exercitare neautorizată a profesiei de avocat; template tipizat = identic cu gratuitul.

**Folosim doar ca:** (a) lead-magnet SEO gratuit care bagă trafic în serviciile plătite, (b) comodat auto ca produs în tool-ul auto (acolo contextul justifică prețul).

---

## Următorii pași

**Ordinea recomandată (efort crescător, ROI descrescător):**

1. **Certificat urbanism — pagină + cluster SEO** ⬅️ *cel mai ieftin venit din tot documentul*. Serviciul e deja în DB la 780 lei cu 0 comenzi; lipsește doar pagina și conținutul. Zile, nu săptămâni. Nu depinde de nicio decizie.
2. **Cluster SEO teren** (checklist vânzare-cumpărare) → upsell extras CF + urbanism. Același efort, alimentează două servicii existente.
3. **Verificare comision RCA** la un broker partener — determină dacă modelul auto e „contract plătit" sau „contract gratuit + marjă din RCA". **Blocant pentru pricing**, dar e un telefon, nu un proiect.
4. Decizie Raul pe domeniu (nume) + green-light MVP auto.
5. Verificare legală: modelul DRPCIV curent post-OUG 7/2026 (formularul tipizat exact) înainte de a scrie template-ul DOCX.
6. ✅ Research competitiv complet (13 site-uri vizitate direct) — făcut.

## Surse

car-docs.ro, concreto.ro, actesimplu.ro, docexpress.ro, contract-kit.com, generator-contracte.com, modele-contracte.ro (mort), contracte.app, dgpci.mai.gov.ro, dosar-auto.ro, andaros-imob.ro, lege5.ro (L350/2001, Cod Fiscal art. 474), notariatstoica.ro, fluximobiliar.ro.
