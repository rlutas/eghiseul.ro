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

## Rămase (backlog)
- Faza 2: admin — alegere unitate din candidates cu 1 click (re-enqueue job)
- Faza 3.2: validare live SearchEstate în wizard pre-plată (confirmare vizuală adresă)
