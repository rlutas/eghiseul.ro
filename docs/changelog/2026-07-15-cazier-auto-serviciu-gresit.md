# 2026-07-15 — Incident conținut: pagina cazier auto descria ALT serviciu

**Severitate:** high (conținut înșelător pe pagină live cu trafic) · **Fix:** migrarea `120` (DB, rulată în producție) + rescriere completă pagină (`87a71a6`) + migrarea `121` (VIN scos din wizard, `4c43c26`)

## Ce s-a întâmplat

Pagina `/servicii/cazier-auto-online/` (+ descrierea serviciului din DB) prezenta serviciul ca **istoric vehicul**: accidente, daune, kilometraj/rulaj, verificare VIN, proprietari anteriori. Serviciul REAL vândut (identic cu cazierjudiciaronline.com) este **fișa de evidență a conducătorului auto** — documentul de la Poliția Rutieră cu istoricul sancțiunilor rutiere, punctele de penalizare active și eventualele suspendări ale permisului.

Descoperit de Raul comparând cu cazierjudiciaronline.com. Colision terminologic: „cazier auto" e folosit colocvial pentru ambele, dar noi vindem doar fișa conducătorului.

## Ce era deja corect / ce NU (corectură)

- Câmpurile `required` erau corecte: DOAR `drivingLicense.required=true`, toate câmpurile de vehicul `required:false`.
- **DAR wizard-ul afișa totuși „Serie șasiu (VIN)"**: flag-ul separat `vehicleVerification.vinValidation=true` forțează randarea VIN chiar cu `vin.required=false` (`VehicleDataStep.tsx:234`: `vin.required || config.vinValidation`). Prima verificare (doar pe required) a ratat asta — prins de Raul pe formularul live. **Fix: migrarea 121** (`vinValidation=false`, rulată în producție; efect imediat, config-ul e citit din DB la runtime).
- OG image folosea deja specimenul real („Istoric Sancțiuni").
- Preț (198 RON) și termene (3-5 zile / urgent 1-2) corecte în DB.

## Fix

1. **Migrarea 120** (rulată în producție): `services.description` + `short_description` pentru slug `cazier-auto` rescrise pe fișa conducătorului auto.
2. **Pagina rescrisă integral** (același schelet de design): metadata (titlu fără preț), JSON-LD, hero, grila „ce conține", use-case-uri (atestat profesional taxi/transport, angajare șofer, verificare puncte proprii, permis din străinătate), „cum funcționează" (nr. permis → CI+permis+selfie → plată → PDF), specimen, secțiuni SEO cost/valabilitate (~30 zile practica instituțiilor), FAQ 12 itemi.
3. **Dezambiguizare inversată**: acum pagina spune explicit „cauți istoricul mașinii (accidente, rulaj, VIN)? — acela e un raport diferit, pe care NU îl vindem" + link separat spre cazier judiciar.
4. Verificare pe HTML randat: `kilometraj`/`VIN`/`proprietari anteriori` = 0 apariții în conținut; „puncte de penalizare" ×16.

## Verificări conexe (aceeași sesiune)

- **GA „Rovinieţa Check Onli…"** (raportat de Raul din Analytics): titlul NU există în niciun codebase (eghiseul, CJO, rovinieta-online, inclusiv pagina embed) și nici pe paginile live (titluri verificate prin curl: „Verificare Rovinietă Online — Gratuit…", „Rovinieta Online 2026 — Cumpără…"). Concluzie: **titlu de pagină din era WordPress, păstrat în datele istorice GA** (diacritice vechi „ţ" + „Check Online" englezesc = tema WP). Test definitiv: interval GA pe ultimele 7 zile → rândul trebuie să dispară. Nimic de reparat în cod.

## Lecții

1. La migrarea de conținut dintre platforme, **verifică serviciul REAL vândut**, nu doar keyword-ul — „cazier auto" acoperă colocvial două servicii diferite.
2. Config-ul wizard-ului (required fields) e sursa adevărului pentru ce vindem; conținutul paginii trebuie aliniat la el, nu invers.
3. Titlurile ciudate din GA se verifică întâi pe LIVE (curl titluri) înainte de vânătoare în cod — GA păstrează titlurile istorice per vizită.
4. **Verificarea „ce câmpuri vede clientul" NU se termină la `required`** — `verification_config` are flag-uri care forțează randarea independent de required (ex. `vinValidation`). Verifică toate condițiile de randare din componentă sau, mai sigur, formularul LIVE.
