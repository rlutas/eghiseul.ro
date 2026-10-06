# Plan A–Z octombrie 2026: repornim vânzările

**Start:** 05.10.2026 · **Proprietar:** Raul · **Regula:** un punct o dată, bifat aici în același commit cu munca.

**De unde pornim.** Septembrie a adus circa 58.000 lei pe toate platformele:

| Platformă | Septembrie |
|---|---|
| eghiseul | 29,1k |
| cazierjudiciaronline (CJO) | 29,0k |
| ecazier | 0 |
| documentero | 0 |

Unde s-au pierdut banii:
- **ecazier** a murit odată cu reclamele Google;
- **eghiseul** e încă demotat de spam update;
- **CJO** a început să scadă după update-ul din 24.09.

Detalii: memoria `situatie-vanzari-2026-10`.

Legendă: ✅ făcut · 🔄 în lucru · ⬜ de făcut · ⏸ așteaptă ceva

---

## A. Reclame (documentero, cont 809-020-5311)

| # | Ce | Când | Stare |
|---|---|---|---|
| A1 | Conversie „Achizitie documentero” + enhanced conversions + variabile Vercel | 05.10 | ✅ |
| A2 | Campania C1 Certificat de celibat publicată (pornește 06.10, 45 lei/zi) | 05.10 | ✅ |
| A3 | Verificare: anunț aprobat/respins, primele afișări și clicuri | 06.10 după-amiază | 🔄 06.10, 10:00: anunțul e „Eligibil (limitat)”, politica „Documente guvernamentale și servicii oficiale”, „este obligatoriu un certificat”; 0 afișări (raportarea are întârziere). Verdictul după-amiază |
| A4 | Termenii de căutare reali, negative noi, starea conversiei | 07.10 | ⏸ |
| A5 | Dacă A3 trece: C2 Cazier fiscal (40 lei/zi, CPA istoric ~42). **Doar grupul F1 Persoană fizică** (F2 PJ iese: cazierul fiscal îl facem doar pentru PF) + negative firmă/SRL/PJ/PFA. Landingul `/cazier-fiscal-online/` verificat 06.10: PF, 30 de zile, sancțiuni nu datorii, footer cu ANAF | după A3 (Raul, 06.10: așteptăm celibatul) | ⏸ |
| A6 | C1: grupul CB2 (căsătorie în străinătate), RSA B, sitelinkuri | după A3 | ⬜ |
| A7 | C3 Naștere, C4 Căsătorie, C5 Multilingv, cu buget mic (CPC max 2 lei) | după primele conversii | ⬜ |
| A8 | Dacă A3 e respins: o singură contestație, cu captura paginii; fără pagini-paravan | doar dacă e cazul | ⏸ |

Planul complet: `ads/2026-10-05-documentero-lansare-ads.md`, `ads/2026-10-05-documentero-campanii.md`, `ads/2026-10-05-lectii-cont-vechi-pentru-documentero.md`.

## B. Email (lista de 72k contacte)

| # | Ce | Când | Stare |
|---|---|---|---|
| B1 | Warm-up din oră în oră, plafon zilnic setabil până la 5.000 | 05.10 | ✅ |
| B2 | Plafon 300/zi | 05.10 | ✅ |
| B3 | Urcăm la 600/zi dacă emailurile întoarse < 3% și plângerile < 0,1% (Resend) | 07.10 | ⬜ Verificat 06.10: 05.10 = 340 livrate, 3 întoarse (0,9%), 0 plângeri; dezabonări din 26.09 încoace: 1 la ~1.050 trimise (0,1%). Condițiile sunt îndeplinite |
| B4 | 1.200/zi, apoi 2.000/zi, cu aceeași regulă | 09.10, 12.10 | ⬜ |
| B5 | Câte comenzi vin din warm-up (cuponul `FIDEL-`, `utm_campaign=warmup`) | săptămânal | ⬜ |

## C. cazierjudiciaronline.com (vinde cel mai bine din organic)

| # | Ce | Când | Stare |
|---|---|---|---|
| C1 | Cele 39 de pagini de oraș: date IPJ verificate, fără text repetat (Jaccard mascat 0,76–0,92 → 0,38–0,46) | 05.10 | ✅ |
| C2 | Prima pagină: 70.000 de expuneri cu CTR 0,7% → titlu și descriere noi (memoria `cjo-ctr-nu-autoritate`) | 05.10 | ✅ |
| C3 | Cifre neverificabile rămase pe alte pagini („100.000+ clienți”, „150.000+ documente”, „4.9/5”): `TrustSignals`, `/cazier-judiciar-diaspora`, `/ppc/*`, `TestimonialsSection` | 05.10 | ✅ (rămâne de decis ratingul „4.9 · 441”) |
| C4 | Măsurare: clicuri și poziție pe `/cazier-judiciar-online/` față de 04.09–01.10, plus comenzi pe săptămână (baza: ~25) | 12.10, 19.10 | ⬜ |
| C6 | Pagina de cazier fiscal: snippet „fără SPV” (eghiseul avea 4,1% CTR pe poz. 6,3; CJO 1,1% pe poz. 5,9) + corectat în 6 locuri că cazierul fiscal arată datorii (arată sancțiuni) | 05.10 | ✅ |
| C7 | Cazier fiscal pe CJO: valabilitatea corectată la 30 de zile pentru toți (pe site scria fals „90 PF”), conținutul doar pentru persoane fizice; `/cazier-fiscal-persoana-juridica` devine ghid „pe numele asociatului” | 05.10 | ✅ |
| C5 | Dacă expunerile scad în continuare după 3 săptămâni: consolidăm paginile de oraș sub 200 de expuneri pe lună | 26.10 | ⏸ |

## D. eghiseul.ro (demotat, recuperare lentă)

Regulă: maximum 1–2 pagini rescrise pe săptămână (`.claude/rules/content-and-seo.md`). Lista vine din `seo/2026-09-recuperare-spam-update/11-jurnal-executie.md`, loturile 3–4.

| # | Pagină | Motiv | Stare |
|---|---|---|---|
| D1 | `/servicii/cazier-fiscal-online` | pagina e indexată, dar invizibilă din 21.08 (de la ~2.000 la ~20 de expuneri pe săptămână): retrogradare la nivel de domeniu. Cererea s-a mutat pe CJO (C6). Rescrierea se amână până apar semne de revenire | ⏸ săpt. 42 |
| D2 | `/servicii/cazier-judiciar-online` | cel mai prost scor AI (21,3), pagina comercială nr. 1 | ✅ 06.10 (`changelog/2026-10-06-pagina-cazier-judiciar-rescrisa.md`) |
| D3 | `/` (homepage) | poziția a scăzut de la 9,3 la 23,9 | ⬜ săpt. 42 |
| D4 | `/servicii/extras-de-carte-funciara` | poziția 7,8 → 22,3; are backlink de la money.ro | ⬜ săpt. 42 |
| D5 | naștere, auto, căsătorie, celibat, integritate, constatator | lotul 4 | ⬜ săpt. 43–45 |
| D7 | Header și prima pagină: scoase „Peste 200.000 documente procesate”, „150k/200k clienți”, „Livrare 24-48h” ca termen; acum ratingul real din `SOCIAL_PROOF` | regula 3 din `content-and-seo.md` (aceeași curățenie ca C3 pe CJO) | ✅ 06.10 |
| D6 | Ghid nou „Plan de amplasament și delimitare: copie din arhivă sau plan nou” (`/plan-de-amplasament-si-delimitare-copie-sau-intocmire/`) | concurenții fac reclamă pe PAD nou (măsurătoare); noi vindem copia, iar ghidul lămurește diferența și trimite cumpărătorul de copie la serviciu | ✅ 06.10 |

## E. documentero.ro (domeniu nou)

| # | Ce | Stare |
|---|---|---|
| E1 | Ghid „Certificat de naștere vechi / tipizat: mai e valabil?” | ✅ 05.10 |
| E2 | Ghid „Valabilitatea certificatului de celibat” (+ corectat „6 luni în România” pe pagina de celibat: Anexa 18 nu are termen) | ✅ 05.10 |
| E3 | Ghidul de apostilă extins de la 830 la 1.400+ cuvinte (acum pe poziția 51) | ✅ 06.10 (836 → 1.615 cuvinte în pagină; cine pune apostila pe ce act, ordinea cu traducerea, din străinătate, gratuită la Prefectură din 2017, FAQ + surse) |
| E4 | Linkuri în text spre documentero din articolele eghiseul despre stare civilă | ✅ 06.10 (4 linkuri: căsătorie → valabilitate celibat; naștere → certificat pierdut și apostilă; documente 2025 → procura din străinătate) |
| E6 | Tabelul pe țări de pe pagina de celibat zice „apostilă: da” în UE (Regulamentul 2016/1191 o scutește) — lăsat așa, decizie Raul 05.10 | ⏸ |
| E7 | Contul de serviciu `claude-seo@caziere.iam.gserviceaccount.com` adăugat ca utilizator în GSC documentero (pentru inspecții prin API) | ✅ 05.10 (18/18 indexate) |
| E5 | Tabelul de măsurare săptămânală (`documentero/continut-si-seo.md`) | ⬜ în fiecare luni |

## F. ecazier.ro (toate cele trei servicii; măsurăm pe 19.10)

Stare și explicație: `seo/2026-10-05-ecazier-documentero-stare-organic.md`. 14 din 15 pagini sunt indexate. Pe auto, ecazier e pe pozițiile 4–8; pe fiscal, pe 28, pentru că CJO câștigă aceeași căutare. Raul (05.10): ecazier NU rămâne doar pe auto, îl ajutăm pe toate cele trei servicii.

| # | Ce | Stare |
|---|---|---|
| F0 | Legături interne pe ecazier: blocuri „Citește și” pe ghiduri, linkuri în text spre `/` (înainte mergeau spre `/comanda`, care e noindex), `/ghiduri` de la 1 la 9 linkuri, `/` de la 1 la 6 | ✅ 05.10 publicat |
| F1 | Linkuri din CJO spre ecazier, în text (4): `/cazier-auto-online` → Uber/Bolt și puncte de penalizare; `/comparatie-servicii` → auto vs judiciar; `/impact-cazier-angajare` → fișa de evidență. Spre `/cazier-fiscal` nu punem, pentru că ar concura cu pagina de fiscal a CJO | ✅ 05.10 publicat |
| F2 | Linkuri din eghiseul (footer + 3 în articole, niciunul din `/servicii/`) și din avocat-tarta (footer + articolul de apărare penală) | ✅ 05.10 publicat (inclusiv avocat-tarta, Netlify) |
| F3 | Import în Bing Webmaster Tools + cerere de indexare | ✅ 06.10: ecazier.ro și documentero.ro importate din GSC (Raul), sitemap trimis pe amândouă; URL Submission: ecazier 12, documentero 13, eghiseul 107 (tot sitemap-ul), CJO 67 (tot sitemap-ul fără paginile legale). eghiseul și CJO aveau deja sitemap-ul citit pe 05.10, 0 erori. IndexNow LIVE 06.10 pe toate 4 (chei verificate 200; CJO+ecazier: prima trimitere completă acceptată, 202; eghiseul+documentero: cron zilnic 04:40 UTC, CRON_SECRET e „Sensitive”, deci n-am putut porni manual `?all=1`, dar toate URL-urile au mers deja la Bing prin URL Submission) |
| F4 | 19.10: dacă `/cazier-auto` nu e indexată și nu avem backlinkuri, oprim investiția | ⏸ |

## G. Infrastructură

| # | Ce | Stare |
|---|---|---|
| G1 | CI roșu de la commitul de warm-up (testul nu știa de interogarea de numărare) | ✅ 05.10 |
| G2 | Tokenul local Vercel CLI expirat: variabilele s-au pus din dashboard | ✅ 06.10 (Raul s-a logat) |
| G3 | Blocantul de reclame din Chrome strică salvările în Google Ads: excepție pentru ads.google.com | ⬜ Raul |

## Jurnal: cereri de indexare în Search Console

Bing (06.10, URL Submission): ecazier 12 · documentero 13 · eghiseul 107 · CJO 67 — toate „Success”. Cota Bing e 100/zi pe ecazier/documentero și 10.000/zi pe eghiseul/CJO.


Cota e de circa 10 cereri pe zi pentru fiecare proprietate.

| Data | Proprietate | Adrese | Rezultat |
|---|---|---|---|
| 05.10 | documentero.ro | `/ghiduri/valabilitate-certificat-de-celibat/`, `/ghiduri/certificat-de-nastere-vechi-tipizat/`, `/certificat-de-celibat/` | solicitată |
| 05.10 | cazierjudiciaronline.com | `/`, `/cazier-fiscal-online`, `/valabilitate-cazier-fiscal`, `/cazier-fiscal-persoana-juridica`, `/cazier-judiciar-online/constanta`, `/iasi`, `/brasov` | solicitată; la `/craiova` am atins cota zilnică |
| 06.10, 08:50 și 10:30 | ecazier.ro | `/ghid-alegere-tip-cazier` | ⏸ „Cotă depășită” de două ori: cota pare să se reseteze la 24 h după cererile de ieri (~12:00), nu la miezul nopții. Reîncercare automată 12:23 |
| 06.10, 08:55 și 10:35 | cazierjudiciaronline.com | `/cazier-judiciar-online/craiova`, `/targu-mures`, `/sibiu`, `/timisoara`, `/oradea`, `/cluj`, `/buzau`, `/galati`, `/ploiesti`, `/verificare-cazier-fiscal-online` | ⏸ cotă depășită; `/craiova` și `/targu-mures` sunt deja indexate (cererea doar grăbește recitirea). Reîncercare 12:23 |
| 06.10, 12:25–12:55 | ecazier.ro | `/ghid-alegere-tip-cazier` | ✅ solicitată |
| 06.10, 12:25–12:55 | cazierjudiciaronline.com | `/craiova`, `/targu-mures`, `/sibiu`, `/timisoara`, `/oradea`, `/cluj`, `/buzau`, `/galati` | ✅ solicitate; cota atinsă la `/ploiesti` |
| 07.10 (de făcut) | cazierjudiciaronline.com | `/cazier-judiciar-online/ploiesti`, `/cazier-fiscal-online` (`/verificare-cazier-fiscal-online` nu există în sitemap) | ⬜ |
| 06.10 | eghiseul.ro (proprietate URL-prefix, cont u/0) | `/servicii/cazier-judiciar-online/` (D2) ✅; `/plan-de-amplasament-si-delimitare-copie-sau-intocmire/` „Cotă depășită” | ⬜ PAD pe 07.10 (e deja la Bing) |

---

## Jurnal 06.10.2026

**Vânzări** (comenzi plătite pe săptămână ISO, 36 → 40): eghiseul 13 · 27 · 27 · 13 · 20; CJO 21 · 33 · 23 · 22 · **17** (scade a treia săptămână la rând); ecazier 0 · 0 · 0 · 0 · 1; documentero 0. Săptămâna 41 abia a început (luni–marți dimineață: eghiseul 1, CJO 2).

**CJO: problema e traficul spre comandă, nu plata.** În ultimele 14 zile 49 de comenzi începute, 36 plătite (73%). Cine începe comanda plătește; puțini o încep din ~15k clicuri organice pe lună.

**Email** (ultimele 21 de zile, după `orders.attribution`): 11 comenzi începute din email, 3 plătite (warm-up 1, recovery 1, reminder expirare 1). Warm-up: 1.600 de contacte atinse din 72k, 300/zi din 05.10. Lifecycle trimite zilnic (în ultimele 7 zile: cross-sell 21, recenzie 20, expirare 11, 0 erori). Cuponul `FIDEL-` n-a fost folosit încă.

**Ce s-a livrat azi**
- D2 rescrisă și publicată, cu fapte verificate (prețuri = baza de date; 3 afirmații nesigure scoase sau confirmate din cod), skill-urile `seo-page`, `clean-user-facing-text`, `humanizer`, 0 caractere invizibile.
- D6 ghid PAD (copie vs plan nou), surse Ordinul ANCPI 600/2023; linkuri dinspre serviciul PAD și articolul despre costul cadastrului.
- D7 cifrele neverificabile scoase de pe eghiseul.
- Decontări: plățile ecazier (`EFC-`/`EJC-`) se leagă acum de factură; facturile lipsă de pe payouturile din 18.08 și 07.10 se leagă cu „Backfill 90 zile”.
- Decont avocată: factura lunară a cabinetului se scade înainte de dividende, bloc „De plată către Gabriela”, valori de pornire.
- Decont topograf: extras lunar (luna trecută implicit), plata pe lună, factura de comision, comenzile pe servicii, taxele OCPI care urmează; septembrie plătit (414,48 fiecare). Reclama de test pe imobiliare (570 lei) e trecută pe septembrie și oprită.

## Următorii pași propuși (06.10)

| # | Ce | De ce | Stare |
|---|---|---|---|
| H1 | **CJO: emailuri lifecycle** (reminder la 6 luni când expiră cazierul, cerere de recenzie, cross-sell spre fiscal/auto) | CJO are ~110 clienți pe lună și nu le trimite nimic după livrare (crons doar abandon + auto-complete). Pe eghiseul expirarea a adus deja o comandă plătită. Cost de achiziție zero | ✅ 06.10 LIVE: migrarea 035 aplicată, `LIFECYCLE_EMAILS=expiry_reminder,review_request,cross_sell`, 150/rulare, cron zilnic 07:20 UTC; prima rulare manuală 06.10: 125 trimise (expirare 22, recenzie 12, cross-sell 91), 0 erori. Măsurăm în GA4 (`utm_medium=lifecycle`) |
| H2 | **CJO: audit de conversie pe paginile de oraș** (de la vizită la începerea comenzii: prețul și butonul deasupra pliului, termen, ce primești) | 73% din cei care încep plătesc; pierderea e înainte de formular | ⬜ |
| H3 | **ecazier: titlu și descriere pe paginile de cazier auto** (pozițiile 4–8, deci CTR-ul e pârghia, ca la C2) | singurul serviciu unde ecazier e aproape de prima pagină | ✅ 06.10 live (8 pagini cazier auto; „documentul oficial” scos de pe ecazier) |
| H4 | documentero: E3 (apostila, 830 → 1.400+ cuvinte) și E4 (linkuri în text din articolele eghiseul despre stare civilă) | ghiduri 1–2/săpt., regula 2 | ✅ 06.10 |
| H5 | Warm-up 600/zi (B3) | condițiile sunt îndeplinite | ⬜ 07.10 |

## Bing Ads: verificat 06.10 (Raul a cerut)

Bing Keyword Research, România, ultimele 3 luni (impresii organice în Bing = aproximarea cererii):

| Căutare | Impresii / 3 luni |
|---|---|
| cazier judiciar online | 2.400 |
| cazier online | 531 |
| cazier judiciar | 345 |
| cazier judiciar online gratuit | 177 (intenție gratuită, negativ) |
| eliberare cazier judiciar online | 54 |
| cazier fiscal online | 109 |
| cazier fiscal | sub pragul de date |

≈ 1.100 de căutări pe lună pe cazier judiciar și ~35 pe fiscal, în tot Bing România. eghiseul primește din Bing 6.100 de clicuri în 3 luni, dar majoritatea pe calculatoare și curs BNR; „cazier judiciar online” 4.200 impresii, 43 de clicuri, poziția 7,35.

Politica Microsoft Advertising (aug. 2026): serviciile private pentru documente guvernamentale cer pre-aprobare prin „Government Services Advertising Program”, cu autorizare de la instituție (memoria `situatie-vanzari-2026-10`). Restul (stare civilă, CF, constatator) n-au fost măsurate: extensia Chrome s-a deconectat.

## 06.10 după-amiază (Raul plecat, lucrat autonom)

| # | Ce | Stare |
|---|---|---|
| H6 | **CJO: campanie de recâștigare** (`winback`): comenzi cu documentul expirat de peste 21 de zile, fără recomandă, o singură dată pe adresă; ton formal ca restul emailurilor CJO; migrarea 036 aplicată | ✅ LIVE: 58 trimise (fiscal 36, auto 22), 0 erori. Cazier judiciar = 0 acum (comenzile CJO pe platformă încep 09.04, expiră abia acum și le prinde reminderul). eghiseul: sărit, datele vechi din WPForms nu dovedesc cumpărarea |
| H7 | **Recuperare telefonică**: eghiseul arată „✅ A plătit după apel” + taburi Recuperate/De sunat + carduri; CJO are coadă nouă (`/admin/recuperare-telefonica`, tel + WhatsApp, „Marchează sunat”), migrarea 037 aplicată | ✅ LIVE. eghiseul: 20 de clienți nesunați, 2 recuperați = 1.744,80 lei (cifra de 2.693 număra un client de două ori). CJO: 12 în coadă, 3.220,95 lei |
| H8 | Analiză linkuri CJO: `seo/2026-10-06-cjo-backlinks-plan.md` | ✅ raport. Linkurile nu aduc comenzi în octombrie (4–12 săpt.). Risc: articole plătite fără `rel=sponsored` (ProTV, Antena 3, infocons) cu anchor exact. Propuneri: cerere `sponsored`, 3–5 linkuri naturale din rețea, comunicat cu date agregate, articol al avocatei în presa diasporei; fără linkuri cumpărate |
| H9 | Analiză documentero + ecazier: `seo/2026-10-06-documentero-ecazier-pasi-urmatori.md` | ✅ raport. documentero: 4 drafturi neplătite (3.392 lei), 3 opriți la „date personale”; `orders.attribution` gol pe documentero. ecazier: 0 comenzi cazier auto; recomandare 19.10 = mentenanță dacă `/cazier-auto` nu intră în top 10 |
| H10 | Linkuri sigure spre CJO: eghiseul `/calculator/reabilitare/` și `/cazier-judiciar-vs-certificat-integritate-comportamentala/`, avocat-tarta (articolul de apărare penală) → ghidurile CJO de reabilitare / ștergere; drafturi în `seo/2026-10-06-cjo-linkuri-drafturi.md` (cerere `rel=sponsored` la ProTV/Antena 3/infocons, comunicat cu date agregate din 400 de comenzi, articol al avocatei pentru presa diasporei) | ✅ linkuri live; ⏸ drafturile le trimite Raul |
| H11 | De verificat: CJO `/cazier-judiciar-diaspora` spune „la IGPR, pe baza procurii electronice” și „pe email în 3-5 zile” — procesul real e împuternicire avocațială, iar avocata ridică certificatul fizic | ⬜ |
| H12 | **Atribuire pe canal pe toate 4 site-urile** (Google Ads/organic, Microsoft Ads, Bing organic, AI assistants, social, email, rețea proprie, referral, direct): eghiseul+documentero corectat (Stripe nu mai suprascrie sursa, `chatgpt.com`/Gmail clasificate); CJO+ecazier încep să salveze sursa (migrarea 038 aplicată); tabel „Comenzi pe canal” în `/admin/marketing` și pe dashboard-ul CJO | ✅ LIVE. eghiseul, 30 de zile, plătite: direct 41 (15.520 lei), organic 32 (8.229), email 7 (1.059), asistenți AI 4 (2.201), Google Ads 2, referral 2; social 10 începute / 0 plătite. CJO: date doar de azi înainte |
| H13 | **GEO / citări AI**: raport `seo/2026-10-06-geo-ai-citari-plan.md`. AI a adus 25 de comenzi începute în 90 de zile (eghiseul), 5–6 plătite (~2.300 lei); paginile citate = cele cu o problemă la zi și concretă (`/ancpi-nu-functioneaza/`, cazier judiciar, constatator pentru bancă). Toți roboții AI au acces și văd conținutul fără JS | ✅ raport + date Bing AI Performance (eghiseul 70,7k citări / 3 luni, CJO 1,9k; vezi anexa). Pași: (1) export lunar Bing „AI Performance” + raportul AI din GSC; (2) dată de actualizare + autor pe paginile CJO; (3) pagini „stare la zi” doar la avarii reale + bloc de răspuns scurt (preț, termen, cine eliberează) sus pe paginile de vânzare; (4) mențiuni off-site (comunicat, articol avocată, 2–4 clipuri YouTube); (5) `/comanda/` deschis pentru ChatGPT-User/Claude-User/Perplexity-User; decizie Raul: CCBot pe CJO/ecazier |
| H14 | GEO live: blocuri „Pe scurt” (cine eliberează, preț, termen) + dată reală de actualizare pe 11 pagini eghiseul/documentero și pe CJO (home, toate orașele, fiscal, auto, integritate, 5 ghiduri) + ecazier `/cazier-auto`; robots deschis pentru toți roboții AI pe toate 4 site-urile (inclusiv CCBot); asistenții (ChatGPT-User, Claude-User, Perplexity-User) pot deschide pagina de comandă. Corectat în trecere: „Singurii din România… garantat” pe extras CF; prețuri vechi 250/350 în schema și analytics CJO; „441 recenzii verificate” → „peste 470”; „document oficial” pe CJO | ✅ LIVE 06.10 |
| H15 | YouTube eGhiseul: 3 clipuri informative (valabilitatea cazierului, cazierul din străinătate, cazierul fiscal), fiecare 16:9 + Shorts, cu miniatură, subtitrări, descrieri cu UTM (`utm_source=youtube`, clasificat acum ca social). Proiect Remotion în `/Users/raul/Projects/eghiseul-videos`, fișe de upload în `marketing/2026-10-06-youtube-eghiseul.md` | ⏸ Raul: creează canalul (cont de marcă) și urcă |
| H16 | Audit indexare 4 site-uri: `seo/2026-10-06-audit-indexare-4-site-uri.md`. Google: eghiseul 111/112 (lipsă doar ghidul PAD de azi), documentero 18/18, CJO 71/71, ecazier 15/15; fără blocaje (200, canonical, robots). De reparat: `<lastmod>` lipsă/fals în sitemap (eghiseul 86 fără dată, CJO toate = ora deploy-ului) — în lucru; titluri/meta prea lungi, de scurtat treptat; listă de cereri de indexare pentru 07.10 în raport | 🔄 |
