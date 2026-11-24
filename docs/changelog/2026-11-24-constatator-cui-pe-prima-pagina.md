# 24.11.2026 — Constatator: căsuța de CUI direct pe prima pagină
<!-- categorie: comenzi -->

## Pentru echipă

- Pe certificat-constatator-express.ro, clientul scrie acum CUI-ul firmei chiar pe prima pagină. Vede numele firmei găsite, apoi apasă „Continuă".
- În formular, certificatul de bază pe firmă vine deja ales, iar CUI-ul e deja completat la pasul „Date firmă". Emailul și telefonul se cer în continuare la primul pas.
- Rândurile „Pe persoană fizică" și „Cu istoric" de pe prima pagină deschid formularul cu varianta respectivă aleasă.
- Pe eghiseul.ro nu se schimbă nimic. Comenzile de constatator arată la fel în admin.
- De ce: din reclame veneau clicuri, dar aproape nimeni nu începea comanda. Toți concurenții pornesc cu CUI-ul pe prima pagină.

---

## Rezumat tehnic

- `HeroCuiLookup` (`src/components/constatator/hero-cui.tsx`) în cardul de preț din hero, deasupra variantelor PF / cu istoric, deci în primul ecran pe mobil. Căutarea folosește `GET /api/company/validate`. La 404 arată eroare; la altă eroare (ANAF căzut) trimite direct în formular, ca vânzarea să nu depindă de lookup.
- CUI-ul trece în formular prin `sessionStorage` (`src/lib/constatator/cui-prefill.ts`), nu prin URL: URL-ul wizardului pleacă în analytics. Wizardul se deschide cu `?tip=de-baza` (`TIP_PRESELECT` existent).
- `ConstatatorStep` citește CUI-ul o singură dată și îl pune în `companyKyc.cui`, doar dacă e gol (draftul restaurat câștigă). `CompanyDataStep` îl validează singur, ca la tastare.
- Rândurile PF / cu istoric sunt acum linkuri `?tip=pf` / `?tip=istoric`.
- Neschimbate: ordinea pașilor (contactul rămâne primul, deci alocarea codului de comandă și salvarea draftului sunt neatinse), telefonul obligatoriu, reclama din Google Ads.
- Teste: `tests/unit/lib/constatator/cui-prefill.test.ts` (6). Verificat local pe mobil (400 px): căutare RO 14399840, firma afișată, trecere în wizard cu `?tip=de-baza` și CUI-ul în `sessionStorage`. Pasul „Date firmă" precompletat nu a fost parcurs local, ca să nu creăm un draft în baza de producție.

### Datele care au dus aici (GA4 + Ads, 11–23.11)

- Ads, 17–23.11: 51 de clicuri (34 de pe mobil), 205,55 lei, 0 conversii. De la lansare: ~340 lei, 0 comenzi reale, 3 drafturi abandonate.
- GA4, trafic plătit pe mobil (doar cine acceptă cookie-urile): 18 utilizatori pe prima pagină, 3 în `/comanda/`, 1 la checkout. Cea mai mare pierdere e pe prima pagină, înainte de formular.
- GA4 desktop: 325 de sesiuni „plătite” și 268 „organice”, deși Search Console arată 0 clicuri organice și Ads a facturat 17 clicuri de pe desktop. Sunt roboți; GA4 nu e o sursă de încredere pentru acest site.

### Ce urmează (nefăcut)

- Telefon opțional doar pe brandul constatator: atinge `hasValidContactData` (alocarea codului de comandă), deci separat, cu test.
- Sitelinkuri și extensii în Ads, la nivel de campanie; anunțul existent rămâne neatins (e „Eligibil (limitat)”, o editare îl retrimite la verificare).
