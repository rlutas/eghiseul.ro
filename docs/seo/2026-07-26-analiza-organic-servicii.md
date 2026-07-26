# Analiză organic — de ce paginile de servicii nu vând (26 iulie 2026)

**Surse de date:** GSC export 20 iulie 2026 (ultimele 3 luni) + export comparativ 20 mai 2026 ·
DB producție (comenzi plătite) · SERP-uri Google verificate manual pe 26 iulie 2026 (gl=ro, hl=ro).

---

## 1. Realitatea în cifre

### Trafic (GSC, clicuri/zi pe lună)

| Lună | Clicuri | Clicuri/zi |
|---|---|---|
| 2025-12 | 109.397 | 3.529 |
| **2026-01** | **424.568** | **13.696** ← sezon impozit auto + rovinietă |
| 2026-02 | 118.824 | 4.244 |
| 2026-03 | 105.436 | 3.401 |
| 2026-04 | 63.691 | 2.123 |
| 2026-05 | 60.126 | 1.940 |
| 2026-06 | 61.632 | 2.054 |
| 2026-07 (18 zile) | 37.142 | 2.063 |

Traficul s-a înjumătățit față de februarie–martie și e **plat de 4 luni la ~2.000 clicuri/zi**.

### Unde e traficul (top pagini, 3 luni)

| Pagină | Clicuri |
|---|---|
| /tools/verificare-rovinieta-online/ | 51.065 |
| /calculator/calculator-impozit-auto/ | 31.682 |
| /calculator/varsta-pensionare/ | 24.643 |
| /calculator/salariu/ | 19.267 |
| **TOTAL 4 unelte** | **126.657** |
| **TOTAL toate paginile /servicii/** | **~9.100** |

**Unelte gratuite = ~62% din trafic. Servicii = ~5%.**

### Comenzi plătite (DB, ultimele 30 zile — 132 total)

| Serviciu | Plătite | Venit (RON) | Venit/comandă |
|---|---|---|---|
| extras-carte-funciara | 29 | 2.631 | 91 |
| cazier-judiciar-persoana-fizica | 26 | 9.003 | 346 |
| certificat-constatator | 17 | 1.513 | 89 |
| cazier-fiscal | 12 | 2.376 | 198 |
| cazier-judiciar-persoana-juridica | 10 | 2.220 | 222 |
| **certificat-nastere** | **8** | **10.229** | **1.279** |
| identificare-imobil | 7 | 1.386 | 198 |
| extras-multilingv-nastere | 6 | 5.627 | 938 |
| cazier-auto | 4 | 752 | 188 |
| certificat-celibat | 4 | 4.788 | 1.197 |
| certificat-casatorie | 3 | 3.692 | 1.231 |

**Observație centrală:** stare civilă (naștere, celibat, căsătorie, multilingv) = 21 comenzi din 132,
dar **~24.300 RON din ~46.000 RON venit total**. Cazier + constatator = volum, stare civilă = bani.

---

## 2. SERP real (verificat 26 iulie, nu estimat)

### „cazier judiciar online" (74.182 expuneri/3 luni, poz. medie 6,07)
1. hub.mai.gov.ro (oficial, gratuit)
2. research.gov.ro
3. **cazierjudiciaronline.com** ← al nostru, cu rich snippet 4,9 din 441 recenzii + „de la 250 RON"
4. caziere.ro
5. hub.mai.gov.ro (home)
6. Facebook ADR · 7. CJO (pagină oraș) · 8. infocons.ro

Anunț sponsorizat sus: **ecazier.ro** ← tot al nostru.
**eghiseul.ro nu apare pe pagina 1.** AI Overview ocupă jumătate de ecran și spune explicit:
„Serviciul este complet gratuit" prin HUB MAI / Ghiseul.ro.

### „cazier fiscal online" (6.175 expuneri, poz. 8,52)
ANAF ×2 → digigov.ro → startco.ro → serviciipublice.gov.ro → **CJO (al nostru)** →
**eghiseul.ro #7** (snippet cu 198 RON + 4,9/450).

### „certificat de nastere online" (1.041 expuneri, poz. 3,63)
centruldevize.ro → hub.mai.gov.ro → **eghiseul.ro #3** (snippet: „998,00 RON · În stoc · 4,9(450)")
→ primării/DLEP → laghiseu.ro.

### „certificat constatator online" (17.884 expuneri, CTR 0,56%)
ONRC → certificatconstatator.ro (64,90 lei+TVA) → dianex.ro → myportal.onrc.ro →
**eghiseul.ro — dar cu ARTICOLUL** „Tipurile de Certificat Constatator Online — Ghid Actualizat",
nu cu pagina de serviciu (aceea stă la poz. 13,38 cu 15.779 expuneri și 77 clicuri).
Ads: constatatoronline.com, constatator-online.ro, cc-onrc.ro.

---

## 3. Diagnostic — cinci cauze, în ordinea impactului

### C1. Traficul nu are intenție comercială
62% din clicuri vin pe calculatoare gratuite (rovinietă, impozit auto, pensie, salariu). Publicul
ăla nu cumpără documente. Nu e o problemă de ranking — e o problemă de mix de trafic.

### C2. Punțile există, dar publicul cel mai mare primea servicii greșite
Sistemul e deja construit: `calculator-layout.tsx` are `RELATED_BY_SLUG` (30 de calculatoare
mapate), iar tool-ul rovinietă are puntea lui proprie. **Corecție față de prima versiune a acestui
document: nu lipsesc punțile.**

Lipsea maparea exact acolo unde e al treilea bloc de trafic al site-ului: **calculatoarele de pensie
(~32.000 clicuri/3 luni)** cădeau pe setul DEFAULT — cazier judiciar / extras CF / constatator —
adică fix ce nu-i interesează pe oamenii care își calculează vârsta de pensionare. Dosarul de pensie
cere certificat de naștere, plus cel de căsătorie când numele diferă, iar pentru stagiul lucrat în UE
extrasul multilingv (938 RON/comandă la noi).
Idem articolul `/tabel-varsta-pensionare-anticipata-femei/` (7.656 clicuri): singurul link din blocul
de servicii era spre alt articol.

**Reparat pe 26 iulie:** `varsta-pensionare`, `pensie-invaliditate`, `estimare-pensie`,
`impozit-pensie`, `concediu-medical` → naștere + căsătorie + extras multilingv; același set adăugat
în articolul de pensionare anticipată.
Rămân nemapate doar calculatoare mici (`calculator-procente` 1.682 clicuri și restul sub 200).

### C3. Head-term-urile au intenție „gratuit", iar Google o spune în AI Overview
„cazier judiciar online" (74k expuneri) și „cazier judiciar online gratuit" (15,8k) sunt căutări în
care Google răspunde direct că documentul e gratuit la HUB MAI. Chiar și pe poziția 3 CTR-ul
comercial rămâne mic. Am urcat CTR-ul de la 2,89% (mai) la 3,04% (iulie) — plafonul e structural.

### C4. Canibalizare articol ↔ pagină de serviciu
Dovedit la constatator: articolul rankează, pagina de serviciu stă la poz. 13. Rezultat: 17.884
expuneri cu CTR 0,42–0,56% și trafic care aterizează pe un ghid, nu pe formularul de comandă.
Același tipar e probabil și la altele (de auditat).

### C5. Rețeaua noastră se bate cu ea însăși
Pe „cazier judiciar online" ocupăm anunțul (ecazier.ro) + poziția organică 3 (CJO). eghiseul e al
treilea site al nostru pe aceeași intenție și pierde de fiecare dată — CJO are domeniu exact-match,
o singură temă și recenzii. Fără o împărțire explicită a intențiilor, eghiseul rămâne veșnic al
treilea pe SERP-urile de cazier.

---

## 4. Ce facem — pe priorități, cu impact estimat

### P0 — săptămâna asta (efort mic, impact imediat)

**P0.1 Punți pensii → stare civilă. ✅ FĂCUT 26 iulie.**
Cele 5 calculatoare de pensie + articolul de pensionare anticipată (≈40.000 clicuri/3 luni la un loc)
trimit acum spre certificat de naștere, certificat de căsătorie și extras multilingv, în loc de
setul default cazier/CF/constatator. Public cu nevoie reală (dosarul de pensie cere exact actele
astea), serviciile cu cea mai mare valoare pe comandă din tot portofoliul.
Estimare conservatoare: 1% CTR pe punte = ~400 vizite comerciale/trimestru, pe segmentul de
938–1.279 RON/comandă.

**P0.2 Canibalizare constatator. ✅ FĂCUT 26 iulie (prima parte).**
Nu s-a creat un al treilea articol pe constatator — s-a întărit cel care rankează: intro
răspuns-întâi, secțiune nouă cu comparația InfoCert (ONRC, 30 lei, Ordin MJ 380/C/2024) versus
intermediar, și CTA către pagina de serviciu. Rămâne partea a doua: pagina de serviciu însăși
trebuie să preia intenția comercială (e la poz. 13,38 cu 15.779 expuneri).

**P0.3 Audit de canibalizare pe restul serviciilor** — care articol rankează în locul cărei pagini
de serviciu. Se face cu GSC (pagini + query-uri), nu din burtă.

### P1 — 2–4 săptămâni

**P1.1 Împarte intențiile între cele 3 platforme ale noastre.**
CJO/ecazier = cazier judiciar (au domeniu + recenzii + istoric). eghiseul = stare civilă +
imobiliare + firme (constatator, fiscal PJ). Pe cazier, eghiseul țintește doar ce nu se poate face
gratuit: **PJ/firme, diaspora și cetățeni străini, urgențe, minori, apostilă/traducere, fără SPV**.

**P1.2 Pagini de comparație pe ruta oficială (asta e piesa cu ROI ascuns).**
„ghiseul.ro cazier" = **22.016 expuneri, CTR 0,91%, poz. 5,17**. Oamenii caută portalul statului și
ne văd, dar nu ne dau clic pentru că titlul nu răspunde întrebării lor. O pagină onestă de tipul
„Cazier judiciar prin ghiseul.ro / HUB MAI vs. prin noi — care e diferența și când ai nevoie de
fiecare" câștigă clicul pe intenție informațională și convertește exact segmentul care NU poate
folosi ruta gratuită. Aceeași schemă pentru „certificat constatator ONRC / InfoCert" (4.953+3.288
expuneri) și „cazier fiscal SPV" (ANAF).
Total intenție „ruta oficială": **peste 30.000 de expuneri/trimestru pe care azi le ratăm.**

**P1.3 Stare civilă — cel mai mare venit/comandă, cel mai mic efort de ranking.**
Suntem deja #3 pe „certificat de nastere online" și avem 2.885 clicuri/3 luni pe pagină, dar 8
comenzi/lună. Aici problema e conversia, nu poziția:
- snippet-ul afișează sec „998,00 RON · În stoc" (și în pagină apare rupt: „WhatsApp de la824,79
  +TVA998 RON") — de reparat Product schema și de explicat CE conține prețul (împuternicire, taxe,
  curier, urmărire) înainte de cifră
- adaugă traseul complet „ce faci tu / ce facem noi" și dovada socială pe pagină

**P1.4 Extras carte funciară.** 29 comenzi/lună (cel mai vândut) dintr-o pagină cu **113 clicuri și
poziția 13,62 la 20.049 expuneri**. Cererea vine din altă parte (articolul ANCPI, direct). Dacă
pagina de serviciu ajunge în top 5, e cel mai clar upside din tot site-ul.

### P2 — backlog

- Verificat Product/Offer schema pe toate paginile de servicii (prețuri rupte în SERP).
- Pagini de oraș cazier: 3–15 clicuri fiecare. De decis dacă se extind sau se opresc.
- `/servicii/rovinieta-online/` — 8.935 expuneri, 0 comenzi. Ori se repară, ori nu mai primește
  linkuri interne.
- Export GSC nou (ultimul e din 20 iulie) — obligatoriu înainte de a măsura efectul P0/P1.

---

## 5. Ce NU facem

- Nu mai împingem eghiseul pe „cazier judiciar online" head term. Acolo avem deja CJO pe 3 și
  ecazier pe ads; al treilea site al nostru nu mai are ce câștiga, iar AI Overview spune „gratuit".
- Nu mai construim calculatoare noi până nu au punți către servicii — adaugă trafic care nu vinde.
- Nu chasing „cazier judiciar online gratuit" (15,8k expuneri): intenția e explicit gratuită.
