# 2026-07-13 — CF vechi → extras pe apartamentul greșit: fix complet (worker + wizard)

## Incidentele (ambele rezolvate cu clienții)

1. **E-260710-F3AYS** (Balas): a introdus nr. CF VECHI 31286 (voia topografic dar wizardul nu avea câmpul) → workerul a livrat apartamentul altcuiva (U60 în loc de U27). Corect emis manual (ePay 10163217).
2. **E-260712-VQ3WA + UGGG8** (Papara): același tipar cu CF vechi 30155 — a plătit de 2 ori, a primit de 2 ori apartamentul altcuiva (U19/Ap.2 în loc de U22/Ap.13). Corect emis manual (ePay 152075).

Cauze, fapte verificate pe ePay, research ANCPI (Ordin 600/2023) și regulile finale:
**`worker-ancpi/docs/cf-vechi-dezambiguizare.md`** (doc principal).

## Fix-uri LIVE

### Worker (worker-ancpi, commit 8cc6c24, deploy `railway up` 13.07)
- Parsează `previousLandBookNo`/`previousCadNo`/`topographicNo` din SearchEstate (erau ignorate)
- `selectEstate()`: emite automat DOAR la match exact pe CF-ul electronic sau match unic pe topografic/cadastral dat de client; altfel **NEEDS_OPERATOR cu lista unităților** (CF nou, topo, CF vechi, adresă+ap) — fără plată
- Caută și variante cu sufix la CF vechi (`30155` → `30155/A`, `/B`)
- Comanda ePay se face pe CF-ul ELECTRONIC al unității validate, nu pe stringul clientului
- Test read-only live pe cazurile reale: 4/4 (`src/test-selection.ts`)

### Wizard (eghiseul.ro, commit 5705b03)
- **Câmp „Nr. topografic"** vizibil sub tab-ul CF (era gate-uit greșit de `topografic.required=false` — nu se afișa NICIODATĂ, nicăieri) + în rândurile multi-imobil; evidențiat amber când CF-ul arată a format vechi
- Mesajul `old_format` cere activ topograficul (înainte: „poate dura")
- Tooltip-uri cu etichetele oficiale ANCPI („Carte Funciară Nr.", „Nr. CF vechi", sufixe 30155/A)
- **Specimen nou** „Unde găsesc numărul cărții funciare?": machetă a antetului de extras cu cele 3 numere evidențiate color + legendă
- Admin: eticheta „Nr. topografic" în secțiunea Date imobil
- Bonus: `suport@eghiseul.ro` (inexistent — a respins emailul de reclamație al clientului!) → `contact@eghiseul.ro` pe pagina de status

## Iterația 2 (același ziua, după feedback)
- **Tab-ul „Nr. Cadastral" eliminat** (0 utilizări în producție) → rămân 2 tab-uri; sub CF: câmp combinat „**Nr. cadastral sau topografic**" (oglindește coloana unică de pe extras); workerul face match pe AMBELE coloane ePay indiferent de proveniență
- Hint permanent sub CF: „Cel mai sigur e numărul NOU (123456-C1-U2)..."
- **Câmp „Adresa imobilului"** (stradă/bloc/scară/ap) apare automat la CF vechi → ajunge la operator lângă lista de unități (NU se folosește la emitere automată — adresele e-terra au duplicate)
- Worker: `normId` curăță virgule/punctuație din paste-ul clientului (caz real: „...V,") — redeploy Railway
- **Fix bug separat descoperit la test**: toggle-ul „Sunt cetățean străin" apărea pe 19 servicii FĂRĂ KYC (extras CF, toate imobiliarele, constatator, rovinietă) — `allowForeignCitizen: null !== false`. Acum apare doar unde există flux de identitate (caziere + integritate); stare civilă rămâne ascuns.

### Iterația 3 (feedback testare user)
- CF nou de UNITATE (`123456-C1-U2`) → câmpul cadastral/topografic se ASCUNDE + mesaj verde „identifică exact apartamentul" (nu mai cerem numere inutile)
- `jumpToService` („Nu știu" → identificare) folosește `router.replace` — back-ul de browser nu te mai aruncă în mijlocul wizardului vechi (raportat la test: selectorul arăta serviciul vechi — era browser-back pe URL-ul vechi, nu pierdere de state; verificat: după switch, dropdown-ul e corect pe ambii pași)

### Iterația 4 (reguli finale identificator + UX colectiv)
- Sub „✓ Format corect" scrie acum CE primește: `123456` → „extrasul pentru TEREN/casă (inclusiv terenul de sub bloc)"; `123456-C1-U2` → „extrasul pentru APARTAMENT" — și la imobilele suplimentare
- `123456-C1` (colectivă): mesaj explicit + **buton „Comandă Extras CF Colectiv cu numărul introdus"** — sare direct în wizardul colectiv cu numărul/județul/localitatea PĂSTRATE (handoff extins cu property); eliminat comportamentul vechi care tăia silențios `-C1` și emitea pe teren
- Specimen: chenarul albastru din dreapta scos (rămân galbenul pe „Nr. CF vechi" — repoziționat exact pe text, mai gros — și albastrul pe coloana din tabel)

## Rămase (backlog)
- Faza 2: admin — alegere unitate din candidates cu 1 click (re-enqueue job)
- Faza 3.2: validare live SearchEstate în wizard pre-plată (confirmare vizuală adresă)
