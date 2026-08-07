# Inventar articole existente + plan articole noi (fără duplicate)

**Data:** 2026-08-07 · Regula de bază: **înainte de orice articol nou, verifici ce există**. Dacă
tema e acoperită de o pagină care deja rankează, se întărește aceea — un articol nou pe același
subiect ne canibalizează propria poziție.

---

## 1. Ce EXISTĂ deja (verificat în `src/app/`)

### Cadastru / carte funciară — 12 articole, zonă saturată
`cum-aflam-numarul-carte-functionara-si-nr-cadastral` (⭐ 98.060 expuneri, poz. 6,4) ·
`valabilitate-extras-de-carte-funciara` (10.121, poz. 4,7) · `verificare-proprietar-imobil` (6.939, poz. 5,5) ·
`cat-costa-cadastrul-si-intabularea` (4.706) · `extras-carte-funciara-gratuit` (3.514) ·
`importanta-extras-de-carte-funciara-colectiva` (1.351) · `extras-de-carte-funciara-pentru-casa-verde` (535) ·
`ce-este-planul-cadastral` (151) · `ce-este-un-releveu` · `cat-poti-construi-pe-teren` ·
`totul-despre-cartea-funciara-colectiva`

### Certificat de naștere — 7 articole
`certificat-de-nastere-pierdut` (137 expuneri, poz. 9,6) · `duplicat-certificat-de-nastere` (227, poz. 9,4) ·
`acte-necesare-certificat-de-nastere` (154, poz. 9,3) · `certificat-de-nastere-din-strainatate` (174, poz. 7,9) ·
`schimbare-certificat-de-nastere-vechi` (2.403, poz. 6,0) · `transcriere-certificat-de-nastere` (60) ·
`inregistrare-nastere-copil-nou-nascut` (31, poz. 13,8)

### Cazier fiscal — **ZERO articole** până azi
Singura pagină pe temă era `/servicii/cazier-fiscal-online/`. De aici gaura: în SERP-ul real, 5 din
9 rezultate sunt conținut informațional pe care nu-l puteam ocupa.

---

## 2. Ce s-a livrat azi

| Acțiune | Fișier | Motiv |
|---|---|---|
| ✅ **Articol nou** | `src/app/cazier-fiscal-persoana-fizica/page.tsx` | zero acoperire pe temă; 10 FAQ din autocomplete + PAA; țintește „cazier fiscal persoana fizica" (1.267 expuneri, poz. 10,8) și interogările explicative |
| ❌ **Articol anulat** | `localizare-teren-dupa-numar-cadastral` — creat și **șters** | duplicat: articolul existent are deja secțiunea „Cum localizezi terenul după numărul cadastral", iar titlul lui conține „cum localizezi terenul". Un al doilea articol ne-ar fi canibalizat o pagină cu 98k expuneri |
| ✅ **Întărire în loc de duplicat** | `cum-aflam-numarul-carte-functionara-si-nr-cadastral` | avea 0 tabele; adăugate: tabelul cu 5 cauze pentru „numărul nu apare pe hartă", explicația sufixelor `-C1-U5`, tabelul „ce document îți trebuie" cu 5 linkuri către servicii |
| ✅ **Corecție de fond** | `/servicii/cazier-fiscal-online/` | scria că atestă „lipsa datoriilor fiscale" — ăla e certificatul de atestare fiscală. Cazierul atestă fapte sancționate |
| ✅ **Linkuri interne** | 5 fișiere | `/login`, `/privacy`, `/terms`, `/termeni`, `/account/settings` erau rupte → 0 rupte din 121 |

Verificator de linkuri refolosibil, rulat înainte de fiecare livrare:
`scratchpad/linkcheck.py` (mapează toate `href="/..."` din `src/app` peste rutele reale, inclusiv
segmentele dinamice).

---

## 3. Următoarele articole — toate verificate că NU există

### Cazier fiscal (continuare — aici e cel mai bun raport efort/venit, conversie 64 %)

| Slug propus | Prinde | Nu se suprapune cu |
|---|---|---|
| `cazier-fiscal-firma` | „cazier fiscal persoana juridica" 306 expuneri poz. 10,3 · „firma online" 157 · „înființare firmă" · „firmă inactivă" · „administrator/asociat" | articolul PF de azi tratează doar persoana fizică |
| `cazier-fiscal-fara-spv` | „cazier fiscal din SPV/în SPV" · „formular 502" · „anaf cazier fiscal online" · diaspora | secțiunea din articolul PF e scurtă; aici e procedura pas cu pas |
| `verificare-cazier-fiscal` | „verificare cazier fiscal (online)" ~530 expuneri, poz. 6,8 — intenție de verificare, nu de comandă | — |

### Certificat de naștere — **refresh, nu articole noi**

Articolele există, dar sunt scheletele migrate din WP: poziții 8–10, CTR sub 2 %. Planul e comasare
și rescriere, nu adăugare:

| Acțiune | Pagini | Interogări |
|---|---|---|
| Comasează `certificat-de-nastere-pierdut` + `duplicat-certificat-de-nastere` într-una singură, 301 pe cealaltă | 2 → 1 | „certificat de nastere pierdut" 1.625 · „duplicat" 593 · „am pierdut certificatul" 357 |
| Rescrie `acte-necesare-certificat-de-nastere` | 1 | „ce acte trebuie/ai nevoie" — 8 variante în autocomplete |
| Extinde `certificat-de-nastere-din-strainatate` | 1 | „copil născut în UK" · „apostilă" · „ambasada României" |
| **Articol nou**, singurul care lipsește: `certificat-de-nastere-pentru-buletin-pasaport` | — | „pot face buletinul/pașaportul fără certificat de naștere", „trebuie certificat pentru botez" — intenție de blocaj, conversie mare |

⚠️ **NU** se atacă termenul-cap „certificat de nastere": în SERP-ul real e 100 % instituțional
(primării, MAI, Wikipedia) și nu apărem în top 9. Vezi
[auditul de concurență](2026-08-07-audit-concurenta-serp-real.md).

### Cadastru — nimic nou până nu se repară plata

Zona are 12 articole și pagina noastră e pe locul 4 în SERP. Blocajul e conversia
(identificare-imobile-proprietar: 1 plătită din 13), nu traficul. Singurul lucru util acum e
întărirea articolului-far, făcută azi.

---

## 4. Regula de internal linking aplicată

- Fiecare articol nou linkează **către pagina de serviciu** cu ancoră naturală, în context, nu în CTA.
- Fiecare pagină de serviciu linkează **înapoi către ghid** acolo unde textul devine explicativ.
- Articolele înrudite se leagă între ele (fiscal ↔ judiciar ↔ constatator; cadastru ↔ valabilitate CF
  ↔ verificare proprietar).
- Linkurile către servicii se scriu prin `serviceUrl(slug)` din `@/lib/seo`, niciodată hardcodat —
  altfel se ajunge pe slug-uri care fac 301 și se pierde din greutatea linkului.
- Înainte de commit: `python3 linkcheck.py` → trebuie 0 linkuri rupte.
