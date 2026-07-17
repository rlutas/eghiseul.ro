# Analiză format: „verificare proprietar imobil" + constatator per-tip (2026-07-17)

Decizie de format pentru cele 2 piese rămase din Front D (STRATEGY-2026-07-13). SERP-uri live verificate 17.07 (WebSearch).

> **STATUS: AMBELE EXECUTATE în aceeași zi.** Articolul: `/verificare-proprietar-imobil/` (commit `f6bb688` + imagine `8eae99b`). Landing-urile: commit `d13b7b0` — cu o schimbare față de analiza de mai jos: **al 3-lea landing e PFA, nu „fonduri IMM"** (IMM s-ar fi canibalizat cu use-case-ul `certificat-constatator-pentru-fonduri-europene` existent; „certificat constatator PFA" are cerere separată și flux PF automatizat pe CNP). Bonus: preselect `?tip=de-baza|imm|insolventa|pf|istoric` în ConstatatorStep, testat live. Detalii: `docs/changelog/2026-07-17-articol-verificare-proprietar-imobil.md` + `2026-07-17-constatator-landinguri-per-tip.md`.

## 1. „Verificare proprietar imobil după adresă" → ARTICOL (nu pagină serviciu)

**SERP „verificare proprietar imobil / cine e proprietarul":** competitorii au pagini de SERVICIU (cfunciara `identificare-imobile-dupa-proprietar`, efunciara `identificare-imobil-dupa-adresa`, unclickdistanta) + ghiduri (Capital.ro „cum afli cine e proprietarul... 20 lei", extrase.ro/ajutor). **Articolul nostru `cum-aflam-numarul-carte-funciara-si-nr-cadastral` apare deja în acest SERP** — dar răspunde la altă întrebare (numărul CF, nu proprietarul).

**De ce articol și nu pagină serviciu:** serviciile există deja (identificare-imobil + extras CF = money pages). Ce lipsește e piesa informațională pe intentul „cine e proprietarul / cum verific proprietarul" — care convertește spre AMBELE servicii (proprietarul apare în extrasul CF; dacă nu știi CF-ul, identificare imobil întâi).

**Query cluster țintit:** cine este proprietarul unui imobil · verificare proprietar apartament/teren · cum afli al cui e un teren · verificare carte funciara online (694 exp, poz 9,2 în GSC — striking) · proprietar după adresă.

**Anti-canibalizare:** articolul existent = „cum afli NUMĂRUL de CF"; cel nou = „cum afli PROPRIETARUL". Intenturi distincte, cross-link obligatoriu între ele + către ambele servicii. Titlul nou NU conține „număr carte funciară/cadastral".

**Unghi de conținut:** metodele reale (extras CF = singura oficială cu nume; geoportal ANCPI = doar contur, fără proprietar; MyTerra gratuit = cu cont verificat; primărie/taxe = nu dau date GDPR) + tabel comparativ + legal (cine are voie: oricine, extras de informare e public — Legea 7/1996). Answer-first, humanizer.

**Verdict: DA, merită — effort S, striking data există, funnel dublu.**

## 2. Constatator per-tip → LANDING-URI TRANZACȚIONALE (nu articole, nu secțiuni)

**SERP „certificat constatator de baza pret/ce contine":** articolul nostru „cele 4 tipuri" e PRIMUL rezultat organic în sample. Restul: ONRC (PDF specimen), EMD-uri thin cu **pagini de comandă per-tip** (certificat-online.ro `comanda-certificat-constatator-de-baza`, certificat-constatator-online.ro, unclickdistanta `certificat-constatator-de-baza`). Competitorii separă: ghid informațional + landing tranzacțional per tip.

**Concluzie format:** long-tail-urile „de bază/extins/insolvență" au intent tranzacțional (pret, comandă) → **landing-uri de comandă per tip** care intră în wizard cu tipul preselectat, NU alte articole. Articolul „4 tipuri" rămâne piesa informațională (e deja citat de AI Overview — nu-l atingem).

**Anti-canibalizare (critic):**
- Articolul „4 tipuri" ține head-ul informațional („tipuri de certificat constatator", „ce contine")
- Landing-urile țin long-tail tranzacțional: „certificat constatator de bază preț/comandă", „certificat constatator insolvență online", „constatator extins"
- Pagina de serviciu `/servicii/certificat-constatator-online/` (BOLNAV #2, poz 13,3) ține head-ul comercial „certificat constatator online" — landing-urile per-tip trimit către ea ca hub + interlink din articol
- „cu istoric" are DEJA articol (`certificat-constatator-cu-istoric`) → pentru istoric nu facem landing separat acum (evităm 2 pagini noi pe același long-tail)

**Risc asumat:** 3 pagini noi pe un cluster unde deja avem 7 pagini (serviciu + 4 use-case + 2 articole). Mitigare: landing-urile sub 3 tipuri strict tranzacționale, title-uri cu „Comandă/Preț", canonical propriu, interlink strict ierarhic (landing → serviciu hub).

**Verdict: DA, dar al doilea — effort M (3 landing-uri + wizard preselect), câștig contra EMD-urilor thin (sub 1.000 cuvinte, zero conținut).**

## Ordine recomandată

1. **Articol „verificare proprietar imobil"** (S) — /humanizer la scriere, answer-first, tabel metode, FAQ din query-uri GSC.
2. **3 landing-uri constatator per-tip** (M) — după validarea funnel-ului (wizard cu tip preselectat există? de verificat query param).
