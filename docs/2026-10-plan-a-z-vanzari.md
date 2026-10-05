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
| A3 | Verificare: anunț aprobat/respins, primele afișări și clicuri | 06.10 după-amiază | ⏸ |
| A4 | Termenii de căutare reali, negative noi, starea conversiei | 07.10 | ⏸ |
| A5 | Dacă A3 trece: C2 Cazier fiscal (50 lei/zi, CPA istoric ~42) | după A3 | ⬜ |
| A6 | C1: grupul CB2 (căsătorie în străinătate), RSA B, sitelinkuri | după A3 | ⬜ |
| A7 | C3 Naștere, C4 Căsătorie, C5 Multilingv, cu buget mic (CPC max 2 lei) | după primele conversii | ⬜ |
| A8 | Dacă A3 e respins: o singură contestație, cu captura paginii; fără pagini-paravan | doar dacă e cazul | ⏸ |

Planul complet: `ads/2026-10-05-documentero-lansare-ads.md`, `ads/2026-10-05-documentero-campanii.md`, `ads/2026-10-05-lectii-cont-vechi-pentru-documentero.md`.

## B. Email (lista de 72k contacte)

| # | Ce | Când | Stare |
|---|---|---|---|
| B1 | Warm-up din oră în oră, plafon zilnic setabil până la 5.000 | 05.10 | ✅ |
| B2 | Plafon 300/zi | 05.10 | ✅ |
| B3 | Urcăm la 600/zi dacă emailurile întoarse < 3% și plângerile < 0,1% (Resend) | 07.10 | ⬜ |
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
| D2 | `/servicii/cazier-judiciar-online` | cel mai prost scor AI (21,3), pagina comercială nr. 1 | ⬜ săpt. 41 |
| D3 | `/` (homepage) | poziția a scăzut de la 9,3 la 23,9 | ⬜ săpt. 42 |
| D4 | `/servicii/extras-de-carte-funciara` | poziția 7,8 → 22,3; are backlink de la money.ro | ⬜ săpt. 42 |
| D5 | naștere, auto, căsătorie, celibat, integritate, constatator | lotul 4 | ⬜ săpt. 43–45 |

## E. documentero.ro (domeniu nou)

| # | Ce | Stare |
|---|---|---|
| E1 | Ghid „Certificat de naștere vechi / tipizat: mai e valabil?” | ✅ 05.10 |
| E2 | Ghid „Valabilitatea certificatului de celibat” (+ corectat „6 luni în România” pe pagina de celibat: Anexa 18 nu are termen) | ✅ 05.10 |
| E3 | Ghidul de apostilă extins de la 830 la 1.400+ cuvinte (acum pe poziția 51) | ⬜ săpt. 42 |
| E4 | Linkuri în text spre documentero din articolele eghiseul despre stare civilă | ⬜ săpt. 42 |
| E6 | Tabelul pe țări de pe pagina de celibat zice „apostilă: da” în UE (Regulamentul 2016/1191 o scutește) — lăsat așa, decizie Raul 05.10 | ⏸ |
| E7 | Contul de serviciu `claude-seo@caziere.iam.gserviceaccount.com` adăugat ca utilizator în GSC documentero (pentru inspecții prin API) | ⬜ Raul |
| E5 | Tabelul de măsurare săptămânală (`documentero/continut-si-seo.md`) | ⬜ în fiecare luni |

## F. ecazier.ro (doar cazier auto; termen de decizie 19.10)

Stare și explicație: `seo/2026-10-05-ecazier-documentero-stare-organic.md`. 14 din 15 pagini sunt indexate. Pe auto, ecazier e pe pozițiile 4–8; pe fiscal, pe 28, pentru că CJO câștigă aceeași căutare.

| # | Ce | Stare |
|---|---|---|
| F1 | Link în text din `/cazier-auto-online` (CJO) spre ghidurile ecazier Uber/Bolt și puncte | ⬜ |
| F2 | Linkuri în text din cazierul auto de pe eghiseul spre ecazier | ⬜ |
| F3 | Import în Bing Webmaster Tools + cerere de indexare pentru `/`, `/ghiduri`, cele două ghiduri | ⬜ (Raul, din browser) |
| F4 | 19.10: dacă `/cazier-auto` nu e indexată și nu avem backlinkuri, oprim investiția | ⏸ |

## G. Infrastructură

| # | Ce | Stare |
|---|---|---|
| G1 | CI roșu de la commitul de warm-up (testul nu știa de interogarea de numărare) | ✅ 05.10 |
| G2 | Tokenul local Vercel CLI expirat: variabilele s-au pus din dashboard | ⬜ Raul: `! npx vercel login` |
| G3 | Blocantul de reclame din Chrome strică salvările în Google Ads: excepție pentru ads.google.com | ⬜ Raul |

## Jurnal: cereri de indexare în Search Console

Cota e de circa 10 cereri pe zi pentru fiecare proprietate.

| Data | Proprietate | Adrese | Rezultat |
|---|---|---|---|
| 05.10 | documentero.ro | `/ghiduri/valabilitate-certificat-de-celibat/`, `/ghiduri/certificat-de-nastere-vechi-tipizat/`, `/certificat-de-celibat/` | solicitată |
| 05.10 | cazierjudiciaronline.com | `/`, `/cazier-fiscal-online`, `/valabilitate-cazier-fiscal`, `/cazier-fiscal-persoana-juridica`, `/cazier-judiciar-online/constanta`, `/iasi`, `/brasov` | solicitată; la `/craiova` am atins cota zilnică |
| 06.10 (de făcut) | ecazier.ro | `/ghid-alegere-tip-cazier` (05.10: cota depășită) | ⬜ |
| 06.10 (de făcut) | cazierjudiciaronline.com | `/cazier-judiciar-online/craiova`, `/targu-mures`, `/sibiu`, `/timisoara`, `/oradea`, `/cluj`, `/buzau`, `/galati`, `/ploiesti`, `/verificare-cazier-fiscal-online` | ⬜ |
