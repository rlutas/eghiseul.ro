# 2026-09-09 — Google August 2026 Spam Update: stadiul la 3 săptămâni de la rollout

Continuare a `docs/seo/2026-08-24-spam-update-prabusire-organica.md`. Documentul acela stabilea CE ne-a lovit (analiza noastră, verificată pe date GSC/SERP proprii) și elimina ipotezele greșite (backlinkuri, tehnic, pagini de județ per se). Acest document adaugă CE A ÎNVĂȚAT comunitatea SEO din 21.08 până azi (09.09) — cazuri de recuperare documentate, declarații Google, și ce NU funcționează — ca să calibrăm planul de remediere pe dovezi, nu pe încă o ipoteză nevalidată.

**Legendă niveluri de sursă**, aplicată la fiecare afirmație de mai jos:
- **[A] Google oficial** — Search Engine Roundtable/Search Engine Land/Search Engine Journal citând direct Google (Danny Sullivan/SearchLiaison, John Mueller) sau documentația Google.
- **[B] Practician cu date** — analiză cu cazuri concrete, cifre, metodologie verificabilă (Glenn Gabe/GSQi, SE Ranking via Search Engine Land, studii de caz cu GSC/Ahrefs/Sistrix).
- **[C] Blog SEO / speculație / content marketing** — articole generice de agenție, fără date proprii, adesea reformulează [A]/[B] fără atribuire clară. Tratate cu scepticism, folosite doar pentru corroborare, niciodată ca sursă unică.

---

## TL;DR — ce știm acum și nu știam pe 24.08

1. **[A]** Google a confirmat: actualizarea NU a adus politici noi — a fost o re-scorare mai agresivă a politicilor existente (scaled content abuse, doorway, thin affiliation), fără blog post nou și fără notificare per-site. E a treia actualizare de spam din 2026 (după martie și iunie).
2. **[A]** Danny Sullivan a repetat public un avertisment din trecut, relevant acum: mesajul „nu contează cum e produs conținutul (AI/om/automatizare)" a fost înțeles greșit de comunitate ca „AI e OK" — el spune explicit invers: **scara** e problema, indiferent de metodă. Nu contează dacă rescrii cu om dacă tot publici în volum tipic „scris pentru motor, nu pentru om".
3. **[B]** Recuperarea documentată (cazul job board, southasiadigital.com) arată cel mai important lucru pentru noi: **fixul nu s-a reflectat imediat** — situl a rămas aproape de zero **7 săptămâni**, de la remediere (după update-ul din iunie) până la refresh-ul din update-ul următor de-același-tip (august). Recrawl-ul nu a "reactivat" nimic — a fost nevoie de următorul refresh SpamBrain de tip spam-update.
4. **[B]** Glenn Gabe (GSQi) a publicat 4 studii de caz reale post-august: loviturile mari au fost pe site-uri cu conținut programatic la scară mare (250K–1,5M URL-uri indexate, 85% secțiune programatică) — demotare confirmată **la nivel de domeniu întreg** ("similar to a broad core update"), nu doar pe paginile problematice. Asta confirmă ipoteza noastră din 24.08 (SpamBrain clasifică la nivel de cluster/site).
5. **[A]/[B]** Volatilitatea a fost neobișnuit de mare: SE Ranking (via Search Engine Land) a măsurat 82% mai multe URL-uri ieșite din top 10 spre poziții >100 față de o perioadă normală (16,71% vs 9,2%); fashion/beauty a fost cea mai lovită industrie (85,55%), real estate cea mai stabilă dintre YMYL (74,64%) — dar analiza nu a fost pe tip de site, deci nu putem trage concluzii de nișă din ea.
6. **[A]** Recuperare cu excepție semnificativă pentru UE: din 30.08.2026, Google **NU mai aplică acțiuni manuale** pentru "site reputation abuse" în Spațiul Economic European (SEE/EEA), ca urmare a unei investigații sub Digital Markets Act — dar asta e politica de reputation abuse (parasite SEO), NU scaled content abuse, care rămâne aplicabilă algoritmic peste tot inclusiv UE. Nu ne ajută direct (noi n-am fost loviți de reputation abuse), dar e un semn că Google diferențiază politicile mai fin decât părea pe 24.08.
7. **[A]** Nu a existat până azi (09.09) niciun refresh sau update nou confirmat de Google după 21.08 — deci platoul nostru de pe /servicii/ e situația de bază, nu o problemă suplimentară. Următorul refresh de tip spam poate veni oricând, dar istoric au fost la ~2-3 luni distanță (martie → iunie → august, ~2,5-3 luni fiecare).
8. **[C→corroborat de B]** Ideea "kill the footprints" (pagini semantic unice, cadență umană de publicare, date locale reale) e susținută consistent de mai multe surse (digitalapplied, emarketed.com, topicalmap.ai) și confirmată indirect de cazurile GSQi: site-urile lovite au fost EXACT cele cu >85% conținut programatic/șablon; niciun caz documentat de recuperare nu a mers pe calea „las paginile așa, doar aștept". Toate au implicat fie rescriere cu date unice, fie consolidare/noindex.

---

## Timeline actualizat + refresh-uri de la 21.08

| Dată | Eveniment | Sursă |
|---|---|---|
| 05.03.2026 | Spam update martie (împreună cu core update) — cel mai rapid din istorie, 19,5h | [A] stanventures.com, 08.09 |
| Iunie 2026 (~24-26.06) | Spam update iunie — ~2 zile | [A] seroundtable.com |
| 18.08.2026 | Start August 2026 Spam Update, rollout global, toate limbile | [A] seroundtable.com, 18.08 |
| 21.08.2026 (01:49 PDT) | Finalizare — 2 zile 16 ore | [A] seroundtable.com „...done-41906.html", 21.08 |
| 21.08–26.08 | Volatilitate SERP continuă documentată de SEJ, atribuită parțial și unor update-uri neconfirmate din jurul datei (5-6.08, 12-13.08) | [A] seroundtable.com, „Sept 2026 Webmaster Report", 01.09 |
| 27.08.2026 | GSQi publică 4 studii de caz (Glenn Gabe) | [B] gsqi.com, 31.08 (postat inițial 27.08 pe X) |
| 30.08.2026 | Google elimină acțiunile manuale de "site reputation abuse" în SEE, urmare a unei investigații DMA | [A] seroundtable.com + searchengineland.com, 28-30.08 |
| Recuperare job board (caz extern) | Vizibilitate revenită ~17-18.08 — coincide cu STARTUL update-ului august, la 7 săptămâni de la fixuri aplicate post-iunie | [B] southasiadigital.com, 27.08 |
| 01.09.2026 | Search Engine Roundtable: raportul lunar confirmă — nicio politică nouă, doar enforcement mai dur; volatilitate SERP continuă necorelată clar cu o cauză unică | [A] seroundtable.com, 01.09 |
| 09.09.2026 (azi) | Niciun spam update sau core update nou confirmat de Google din 21.08 încoace | [A] cercetare curentă (quantifimedia.com + căutări) |

**Important pentru noi**: nu există dovadă de refresh separat între 21.08 și 09.09. Platoul observat de noi (9-10 clicuri/zi pe clusterul /servicii/, neschimbat din 23.08) e coerent cu „nimic nu s-a re-evaluat încă", nu cu „recuperarea a eșuat".

---

## Ce vizează update-ul (cu nivel de sursă per afirmație)

1. **[A] Scaled content abuse** — definiția oficială Google, citată identic în mai multe surse: *"many pages generated for the primary purpose of manipulating rankings rather than helping users"*. Danny Sullivan (SearchLiaison), reluat public în legătură cu acest update: **metoda nu contează** (AI, om, automatizare, traducere, scraping) — problema e **scara + intenția** (produs pentru motor, nu pentru cititor). Citat direct: *"we don't really care how you're doing this scaled content, whether it's AI, automation, or human beings. It's going to be an issue."* — [A] searchenginejournal.com.
2. **[A] Doorway pages** — pagini aproape identice cu locație/serviciu schimbat, care direcționează spre aceeași destinație finală.
3. **[A] Artificial citation tricks / thin affiliation** — semnale de autoritate fabricate; afiliere fără valoare adăugată.
4. **[A] Exclus explicit din acest rollout**: link spam și site reputation abuse (parasite SEO) — Google a confirmat că update-ul din august NU le vizează. Coroborează exact ce am scris pe 24.08 (ipoteza backlinkuri, RESPINSĂ oficial).
5. **[B] Impact la nivel de domeniu, nu doar pagină** — confirmat de gsqi.com pe 4 cazuri reale: un site cu 1,5M URL-uri indexate (85% secțiune programatică) a fost lovit "site-wide", nu doar pe secțiunea programatică. Un alt site YMYL cu conținut programatic pe mai multe țări + secțiuni 100% AI a pierdut peste 200.000 de interogări complet (nu doar poziții mai slabe — dispariție). Citat: *"The entire domain can be impacted, similar to a broad core update."*
6. **[C, corroborat]** Mai multe surse secundare (digitalapplied, seo-kreativ, orangemonke, get-ryze) repetă aceleași categorii fără date proprii — util doar ca semnal de consens, nu ca dovadă suplimentară.

**Profilurile de site cele mai expuse**, sintetizat din [A]+[B]:
- Articole AI publicate în volum, fără revizuire umană reală.
- Pagini de locație/serviciu programatice cu diferențiere minimă (found: "swap the city" = exact tiparul nostru pe cele 16 pagini de locație cazier).
- Afiliați subțiri (agregare fără conținut original).
- Site-uri cu volum masiv de pagini indexate relativ la conținut original (raport pagini-programatice / pagini-editoriale foarte mare — la noi: 40 servicii + 41 calculatoare + 58 articole + 16 locații cazier + 43 pagini județ CF, verificat deja pe 24.08 cu scor de tipare AI).

---

## Cazuri de recuperare documentate — ce s-a schimbat, cât a durat, ce a ieșit

### Caz 1 — Job board (analog cel mai apropiat de situația noastră) [B]
Sursă: southasiadigital.com, 27.08.2026, „How We Recovered a Job Board Site Hit by Google's 2026 Spam Updates".

- **Profil**: platformă de joburi, ~4 luni de creștere organică înainte de lovitură.
- **Probleme identificate** (4, toate remediabile fără rescriere masivă de conținut):
  1. Comentarii spam auto-aprobate de utilizatori.
  2. Linkuri plantate în câmpurile de profil (footprint identic cu semnăturile de forum).
  3. Imagini generice de temă WordPress nemodificate (`placeholder-1.jpg`, fără alt text) — semnal de similaritate de șablon.
  4. Canonicale rupte din combinații de filtre/paginare/categorii — duplicare URL care fragmenta semnalul de rank.
- **Ce au făcut**: moderare manuală comentarii + nofollow, nofollow/noindex pagini profil slabe, imagini unice + alt text unic, canonicale corectate + noindex pe combinații de facete cu cerere mică.
- **Cronologie**: cădere pe 01.07.2026 (la 5 zile după finalul update-ului din iunie, 26.06); aproape zero timp de **~7 săptămâni**; revenire vizibilă ~17-18.08.2026 — exact când a pornit update-ul din august, NU imediat după fixuri.
- **Lecție centrală, citată direct**: *"spam classifiers aren't continuously re-scoring every page"* — fixurile nu se reflectă decât la următorul refresh de tip spam-update, nu la recrawl obișnuit. **Confirmă exact ce scriam pe 24.08**: „recrawl-ul NU ajută înainte de a schimba paginile" — de adăugat acum: nici schimbarea paginilor nu ajută înainte de următorul refresh.
- **Rezultat**: revenire la ~13% din clickurile pre-lovitură în fereastra de 28 zile post-recuperare (663 vs 4.990 clicuri), poziție medie ușor mai slabă (10,6 vs 8,8) — recuperare parțială, nu completă, la prima reevaluare.

### Caz 2-5 — cele 4 studii Glenn Gabe / GSQi [B]
Sursă: gsqi.com, 31.08.2026 (Glenn Gabe, GSQi — practician recunoscut, publică studii de caz cu date Ahrefs/Sistrix de ani de zile; tier B solid, nu speculativ).

- **Caz A — programatic YMYL ultra-scalat**: conținut programatic replicat pe zeci de țări + secțiuni 100% AI → **peste 200.000 de interogări pierdute complet** (nu doar retrogradate).
- **Caz B — afiliat subțire Amazon**: date scrapuite din Amazon la scară, fără implicare umană, text adăugat detectat 97%+ probabilitate AI → **14.000+ interogări pierdute**.
- **Caz C — scaled content abuse clasic**: 1,5M URL-uri indexate, ~85% secțiune programatică → lovit **la nivel de site întreg**, nu doar secțiunea programatică.
- **Caz D — scaled content agresiv**: 250.000 URL-uri, ~25.000 interogări pierdute, redirecționa userii spre alte site-uri riscante → rămas indexat dar vizibilitate „masiv redusă".
- **Recuperare**: autorul notează că poate dura luni după schimbări semnificative; un exemplu citat arată recuperare pe parcursul a ~5 luni, altele „în doar câteva luni". Niciun caz din cele 4 nu a recuperat rapid (săptămâni) — toate erau cazuri de scară foarte mare (100K+ URL-uri), deci nu comparabile 1:1 cu noi (188 pagini indexate), dar tiparul calitativ e relevant.
- **Fără declarații Google directe în articol** — pur analiză de date proprii.

### Analogul cel mai apropiat cronologic: update-ul din iunie 2026 → recuperare vizibilă abia în august
Confirmă modelul de „refresh cadence": schimbările pe site nu sunt reevaluate continuu, ci **la următorul update de același tip** (spam update → spam update, nu orice core update). Diferența dintre update-uri de spam în 2026: martie → iunie ≈ 3,5 luni; iunie → august ≈ 2 luni. Dacă tiparul se menține, următorul refresh de tip spam ar putea veni undeva **octombrie-noiembrie 2026** — dar asta e o extrapolare, nu o dată confirmată de Google [C, marcat explicit ca speculație a noastră, nu a vreunei surse].

---

## Ce NU funcționează (debunked)

1. **[A] Backlinkuri plătite / disavow** — deja demontat pe 24.08 (Google a confirmat explicit că update-ul din august nu vizează link spam). Confirmă și John Mueller, citat independent (context general, nu specific update-ului august): dezavuarea de linkuri pe baza rapoartelor terților NU recuperează ranking-ul pierdut prin alte cauze — oamenii care au încercat asta pe Reddit r/SEO cu un caz de -61% au fost corectați de Mueller că nu e calea. [A]
2. **[B] „Doar aștept recrawl-ul, nu schimb nimic"** — infirmat direct de cazul job board: situl a rămas jos 7 săptămâni chiar după ce Google a re-crawlat paginile corectate; abia refresh-ul de tip spam-update a produs schimbarea.
3. **[B] Îmbunătățirea pagină-cu-pagină, una câte una, pe seturi mari de pagini subțiri** — sursă (digitalapplied, coroborată calitativ de gsqi.com pe cazurile mari): „sites with hundreds of thin AI pages that try to improve each page individually rarely recover" — pattern-ul care funcționează e consolidare (merge pagini similare într-un ghid comprehensiv + redirect), nu poleire cosmetică pe fiecare pagină separat.
4. **[C, dar consistent repetat]** Doar swap de nume de oraș în H1/titlu, fără date locale reale — explicit numit tipar de „doorway page" pe care Google îl penalizează, indiferent cât de bine e „polish-uit" restul textului.
5. **[A] Schimbări făcute ÎN TIMPUL rollout-ului (18-21.08)** — mai multe surse (digitalapplied, ingeniousnetsoft) avertizează explicit să nu tragi concluzii sau să faci schimbări majore în plin rollout, pentru că nu poți separa semnal de zgomot.
6. **[A] Aștepți doar un „reconsideration request"** — nu există aici, pentru că nu e acțiune manuală (verificat și de noi în GSC, zero manual actions). E demotare algoritmică pură; nu ai pe cine să întrebi, doar poți remedia și aștepta refresh-ul.

---

## Cum re-evaluează SpamBrain (semnale despre mecanism)

- **[B] Nivel cluster/domeniu, nu doar pagină individuală** — cazurile GSQi arată clar demotare site-wide când proporția de conținut programatic e mare (85% în cazul C), chiar dacă restul de 15% ar fi conținut original de calitate. Confirmă exact concluzia noastră din 24.08: „discriminatorul nu e o pagină, e clusterul".
- **[C, plauzibil dar neconfirmat de Google direct]** Câteva surse descriu SpamBrain ca „Synthetic Pattern Classifier" care detectează rețele/clustere de conținut coordonat prin semnale de infrastructură + tipar sintactic, nu doar text individual — terminologie care nu apare în sursele Google oficiale găsite, deci de tratat ca interpretare de practicieni, nu fapt confirmat.
- **[A] Fără notificare per-site** — demotarea algoritmică nu apare nicăieri în Search Console (confirmă ce am verificat deja: zero manual actions, dar ranking tot a picat la zero pe interogările de servicii).
- **[A] Cadență de reevaluare = refresh-uri periodice de tip spam-update**, nu continuu. Google spune explicit că poate dura „many months" pentru ca sistemele automate să „vadă" conformitatea — nu există un prag clar de recrawl care declanșează reevaluarea în afara acestor refresh-uri.
- **Noindex/eliminare vs. rescriere — cine e mai rapid?** Nicio sursă găsită oferă date A/B directe „noindex a recuperat mai repede decât rescriere". Ce avem: (a) cazul job board a folosit AMBELE — noindex pe pagini slabe + rescriere pe pagini importante — și tot a durat 7 săptămâni până la refresh; (b) recomandarea consistentă (digitalapplied + gsqi calitativ) e consolidare (merge + redirect) mai degrabă decât ștergere goală sau rescriere 1:1 pe fiecare pagină. Concluzie: **noindex simplu, fără consolidare, nu pare să fie calea rapidă** — nu există dovadă că grăbește refresh-ul, doar reduce suprafața de risc pentru refresh-ul următor.

---

## Implicații directe pentru eghiseul.ro

Context: 40 pagini de servicii, 58 articole, 41 calculatoare, 16 pagini de locație cazier, 43 pagini de județ carte funciară — total profil de site cu suprafață mare relativ la conținutul editorial original (exact profilul descris ca „cel mai expus" în toate sursele [A]/[B]).

1. **Nu există scurtătură prin recrawl.** Chiar dacă terminăm rescrierea integrală a listei de pagini de pe 24.08 (articole >10/1k, cele 16 pagini de locație cazier) mâine, cazul job board arată că e posibil să NU vedem nicio mișcare până la următorul refresh de tip spam-update — istoric acestea vin la 2-3,5 luni distanță (martie→iunie→august). Așteptarea realistă de recuperare vizibilă: **nu înainte de octombrie-noiembrie 2026**, poate mai târziu. Trebuie comunicat intern ca așteptare de bază, nu ca eșec dacă nu se mișcă nimic în septembrie.
2. **Prioritizarea corectă rămâne consolidarea, nu doar poleirea.** Pentru cele 16 pagini de locație cazier (scor 11,0-11,8/1k, exact tiparul „swap the city" descris de emarketed.com și topicalmap.ai) — opțiunile susținute de dovezi sunt: (a) date locale reale per pagină (adrese poliție locală, termene reale diferențiate, referințe verificabile) sau (b) consolidare în mai puține pagini + redirect 301, urmând tiparul din cazul job board și recomandarea digitalapplied. Simpla „umanizare" a textului fără date noi e mai slabă ca dovadă de eficacitate decât consolidarea.
3. **43 de pagini de județ carte funciară** nu au fost încă auditate cu același scor ca articolele/locațiile cazier (raportul din 24.08 nu le menționează explicit) — risc: dacă au același Jaccard mare ca paginile de locație cazier (comparativ cu CJO care are Jaccard 88-89% și n-a fost lovit, deci similaritatea singură NU e discriminatorul), trebuie verificat separat DACĂ au conținut/date reale per județ sau sunt tot „swap the city". Recomandare: rulează același audit de scor AI + Jaccard pe cele 43 de pagini CF înainte de a le considera „safe" doar pentru că nu apar în raportul inițial.
4. **Cele 41 de calculatoare au supraviețuit intact** — coerent cu toate sursele: tool-urile funcționale (nu doorway, oferă utilitate reală unică per interacțiune) nu se încadrează în „scaled content abuse". Nu ating, sunt controlul nostru pozitiv.
5. **Cadența de publicare rămâne un semnal cheie de urmărit**, confirmat indirect (nu direct de Google, dar de tiparul „bulk AI articles published rapidly" repetat în [A]/[B]/[C]) — planul de 24.08 (max 1-2 articole/săptămână) e coerent cu ce arată sursele, păstrăm.
6. **EEA carve-out de pe 30.08 nu ne afectează** — e specific „site reputation abuse" (parasite SEO/UGC găzduit), nu „scaled content abuse". Nu schimbă nimic în planul nostru de remediere.
7. **Monitorizare**: rămâne corect ce am scris pe 24.08 — expunerile GSC pe clusterul /servicii/, nu clicurile, ca prim semnal. Dar acum cu un reper de timp explicit: dacă nu vedem mișcare de expuneri până la următorul refresh confirmat (posibil octombrie+), nu tragem concluzia că remedierea a eșuat — verificăm doar dacă am acoperit lista completă de pagini semnalate (articole >10/1k + 16 locații cazier + acum și cele 43 CF de verificat).
8. **Nu reluăm ipoteza backlinkuri** — de două ori confirmată exclusă de Google (24.08 și acum, corroborat de [A] multiplu). Orice buget de timp pe advertoriale/backlink hygiene rămâne secundar (rel=sponsored la advertorialele viitoare, cum am notat deja), nu prioritate de recuperare.

---

## Surse complete

### Tier A — declarații Google / raportare cu citate directe din Google
- Search Engine Roundtable — „Google August 2026 Spam Update Is Rolling Out", 18.08.2026 — https://www.seroundtable.com/google-august-2026-spam-update-41895.html
- Search Engine Roundtable — „Google August 2026 Spam Update Is Done Rolling Out", 21.08.2026 — https://www.seroundtable.com/google-august-2026-spam-update-done-41906.html
- Search Engine Roundtable — „September 2026 Google Webmaster Report: Spam Update, AI Mode Takeover, GoTo Redirects & More", 01.09.2026 — https://www.seroundtable.com/sept-2026-google-webmaster-report-41979.html
- Search Engine Roundtable — „Google Won't Enforce Its Site Reputation Policy In The European Economic Area", 28.08.2026 — https://www.seroundtable.com/google-site-reputation-policy-eea-41968.html
- Search Engine Roundtable — „Google Confirms Its Search Spam Team Is Fighting Spam" — https://www.seroundtable.com/google-search-spam-team-fighting-41980.html
- Search Engine Journal — „Google Finishes Rolling Out The August 2026 Spam Update" — https://www.searchenginejournal.com/google-begins-rolling-out-the-august-2026-spam-update/586301/
- Search Engine Journal — „Google On Scaled Content: 'It's Going To Be An Issue'" (Danny Sullivan, citat) — https://www.searchenginejournal.com/google-on-scaled-content-its-going-to-be-an-issue/543308/
- Search Engine Land — „Google's August 2026 spam update hit rankings harder than normal" (date SE Ranking), 27.08.2026 — https://searchengineland.com/google-august-2026-spam-update-ranking-impact-485980
- Search Engine Land — „Google wont respect manual actions for site reputation abuse in EEA" — https://searchengineland.com/google-wont-respect-manual-actions-for-site-reputation-abuse-in-european-economic-area-486055
- Search Engine Journal — „Google Updates Site Reputation Abuse (Parasite SEO) Policy" — https://www.searchenginejournal.com/google-updates-site-reputation-abuse-policy-removes-penalties-in-eea/587423/

### Tier B — practicieni cu date/studii de caz proprii
- GSQi (Glenn Gabe) — „Google's August 2026 Spam Update – Scaled Content Abuse, AI Content, Programmatic Content, Thin Affiliates, And More [Case Studies]", 31.08.2026 — https://www.gsqi.com/marketing-blog/august-2026-google-spam-update-case-studies/
- South Asia Digital — „How We Recovered a Job Board Site Hit by Google's 2026 Spam Updates: A Real Case Study", 27.08.2026 — https://southasiadigital.com/job-board-google-spam-update-recovery-case-study/
- Glenn Gabe pe X — thread cu date live din analiza celor 4 cazuri, 24-25.08.2026 — https://x.com/glenngabe/status/2091861168923029859 și https://x.com/glenngabe/status/2094397900893638940
- Stan Ventures — „7 Google Spam Updates Later: Where SEO Stands in 2026", ~08.09.2026 — https://www.stanventures.com/news/7-google-spam-updates-later-where-seo-stands-in-2026-7573/
- Digital Applied — „The August 2026 Spam Update Is Done. Here Is What to Measure", 22.08.2026 — https://www.digitalapplied.com/blog/august-2026-spam-update-complete-what-to-measure
- Digital Applied — „Scaled Content Abuse: Google's AI Page Crackdown Guide" — https://www.digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated

### Tier C — blog SEO / agenție, folosite doar pentru corroborare, fără date proprii verificabile
- The Pixel Mark — „Google's August 2026 Spam Update: What It Hit And What To Do Now", 30.08.2026 — https://www.thepixelmark.com/blog/googles-august-2026-spam-update-what-it-hit-and-what-to-do-now/ (articol trimis de owner)
- Ingenious Netsoft — „Google Core Update Traffic Recovery 2026", 31.08.2026 — https://ingeniousnetsoft.com/google-core-update-traffic-recovery-2026/ (articol trimis de owner)
- SEO-Kreativ — „Google August 2026 Spam Update Complete: 2 Days, 16 Hours" — https://www.seo-kreativ.de/en/blog/google-august-2026-spam-update/
- Bushletter — „Google's August 2026 spam update done; recovery months away" — https://www.bushletter.com/google-s-august-spam-update-completes-recovery-takes-months/
- Orange Monke — „Google Releases August 2026 Spam Update: Targets, Risks & Recovery" — https://orangemonke.com/blogs/google-august-2026-spam-update/
- KeywordsEverywhere — „August 2026 Google Spam Update: Dates, What It Targets & Recovery" — https://keywordseverywhere.com/news/google-algorithm-updates/august-2026-spam-update/ (deja citat în raportul din 24.08)
- Emarketed — „August 2026 Spam Update: Local SEO Warning", 22.08.2026 — https://emarketed.com/seo/august-2026-spam-update-local-seo-warning/
- Expo Media (RO) — „Update Google Spam August 2026: Ce Trebuie Să Știi", 19.08.2026 — https://expo-media.ro/tehnologie/update-google-spam-august-2026/
- Scale-Xpert — „SpamBrain Explained: How Google's AI Spam Detection System Works in 2026" — https://scale-xpert.com/spambrain-google-ai-spam-detection-system-2026/
- Scale-Xpert — „Google June 2026 Spam Update: What Changed, Who Was Hit, and How to Recover" — https://scale-xpert.com/google-june-2026-spam-update-analysis-recovery/
- TopicalMap.ai — „Programmatic SEO for Local Service Area Pages: The 2026 Strategy Guide" — https://topicalmap.ai/blog/auto/programmatic-seo-for-local-service-area-pages
- Crawl Or No Crawl (substack) — „Day 4 of August core update indexation" — https://crawlornocrawl.substack.com/p/day-4-of-august-core-update-indexation (acces parțial, paywall — folosit doar pentru mențiunea de „spontaneous recovery" observată de autor, necoroborată suplimentar)

### Surse din raportul anterior (24.08), rămase valide
- seroundtable.com/google-august-2026-spam-update-41895.html
- searchenginejournal.com/google-begins-rolling-out-the-august-2026-spam-update/586301/
- blog.on-page.ai/august-2026-spam-update/
- keywordseverywhere.com/news/google-algorithm-updates/august-2026-spam-update/

---

## Ce rămâne neconfirmat / de verificat în continuare

- Nu există dovadă directă (din nicio sursă găsită) care să separe clar „cât de repede ajută noindex" vs. „cât de repede ajută rescriere" — ambele par condiționate de următorul refresh, nu de acțiunea în sine.
- Nu există o dată oficială Google pentru „următorul refresh" — extrapolarea de 2-3 luni e a noastră, bazată pe tiparul martie-iunie-august, nu o promisiune Google.
- Nu am găsit un caz documentat public de recuperare a unui site din exact acest update (august 2026) încheiat — toate cazurile de recuperare completă citate (job board) sunt de la update-ul din iunie, nu din august; pentru august suntem încă în fereastra de „prea devreme să știm", ceea ce se aliniază cu propriul nostru platou.
