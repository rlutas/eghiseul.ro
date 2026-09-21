# Certificat constatator ONRC: fișa pentru echipă

Singurul serviciu pe care îl livrează un robot de la comandă la PDF. Fișă
scrisă pe 21.09.2026 din platformă; prețurile vii sunt în **Setări → Servicii**.

## Ce e și cât costă

Document oficial ONRC (Registrul Comerțului) cu datele actuale ale unei firme:
denumire, formă juridică, sediu, CUI, asociați, administratori, capital,
obiect de activitate. Cerut la licitații (SEAP), bănci, notari, fonduri,
contracte. Valabil de regulă **30 de zile**. Iese ca **PDF semnat electronic
de ONRC**, livrat pe email; nu există curier și nu există opțiuni.

| Tip | Preț | Pentru cine | Taxa ONRC pe care o plătim |
|---|--:|---|--:|
| Certificat constatator **pe firmă** | 89 | SRL, SA etc. (după CUI) | 30 |
| Certificat constatator **persoană fizică** | 89 | PFA / II / ÎF (după CNP) | 30 |
| Certificat constatator **cu istoric** | 487 | firmă, cu tot istoricul de la înființare sau pe un interval | 250 |

Pe firmă, clientul alege și **tipul raportului**: de bază, pentru fonduri
IMM, pentru insolvență; și **la ce servește** (licitație, bancă, ANAF, viză,
notar, primărie, „altele” cu text liber). Perioada: de la înființare sau
interval.

## Ce completează clientul

1. Contact.
2. **Detalii certificat**: tipul (firmă / PF / istoric) e primul, pentru că schimbă prețul; scopul; perioada; numele și CNP-ul solicitantului.
3. **Date firmă**: CUI, datele vin de la ANAF. Un CUI cu **două înregistrări** (una radiată, una în funcțiune) e tratat corect din 28.07.2026: robotul emite pe cea în funcțiune.
4. Facturare, apoi plata.

Fără act de identitate, fără selfie, fără semnătură, fără livrare: pașii
„Opțiuni” și „Livrare” sunt săriți. Contractul de prestări se face pe datele
de facturare. Nu e serviciu cu avocat: fără împuternicire, fără numere de
Barou.

## Cum merge când merge

1. Plata intră. Robotul ONRC preia comanda în minute, depune cererea pe portalul ONRC și **plătește taxa** din contul nostru.
2. ONRC eliberează PDF-ul; robotul îl încarcă pe comandă și clientul primește emailul „documentul e gata” cu PDF-ul.
3. Comanda ajunge singură pe „Documentul este eliberat” / „Finalizată”. Taxa ONRC (30 sau 250 lei) se înregistrează **singură** ca cost intern pe comandă.

Termenul afișat clientului e „câteva minute (24/7)”; în admin termenul stă
„pe pauză” cât e portalul ONRC picat, ca să nu apară fals „expirat”.

## Unde vă uitați: `/admin/onrc`

Fiecare comandă are un rând cu starea robotului:

| Stare | Înseamnă |
|---|---|
| În așteptare / Preluat (depunere) / Se procesează | robotul lucrează |
| Depus + plătit | cererea e la ONRC, plătită; se așteaptă eliberarea |
| Așteaptă documentul | ONRC nu a emis încă PDF-ul (uneori ore, noaptea sau în weekend) |
| Verificare document | PDF-ul a venit și se verifică |
| Eliberat | livrat clientului |
| **Necesită operator** | robotul s-a oprit: cineva trebuie să se uite (linkul „Deschide cererea pe portalul ONRC” duce direct la cerere) |
| Recuperat (crash) / Reîncercare | robotul a repornit singur |

**Niciodată nu se resetează un job care a plătit deja taxa**: ar plăti de
două ori. Dacă cererea e „Depus + plătit” și nu vine PDF-ul, se așteaptă sau
se ia PDF-ul manual de pe portal și se încarcă pe comandă.

## Când robotul pică

- **Parola contului ONRC a fost respinsă** (14.09.2026): portalul cere din când în când resetarea parolei; până se pune parola nouă în setările robotului, toate joburile eșuează cu mesaje despre browser care induc în eroare. Semnul: mai multe joburi „Eșuat” în aceeași zi. Se anunță Raul; după parola nouă se apasă „Reîncercare” pe fiecare job.
- **Portal ONRC indisponibil**: joburile stau în așteptare și se reiau singure; clientul vede badge-ul „Sistemul ONRC indisponibil” pe pagină și în formular.
- **Manual**: echipa poate obține certificatul de pe portalul ONRC cu contul firmei și îl încarcă pe comandă la „Marchează document primit” → „Marchează gata”. Taxa se trece la costuri interne de mână.

## Problemele frecvente

| Situație | Ce faceți |
|---|---|
| Clientul a ales „pe firmă” dar e PFA | tipul trebuie „persoană fizică”; modificați comanda sau anulați și refaceți. |
| CUI cu firmă radiată | ONRC eliberează pe înregistrarea radiată doar dacă e singura; dacă clientul voia istoricul firmei radiate, e tipul „cu istoric”. |
| A plătit seara și n-a primit nimic în 10 minute | verificați `/admin/onrc`: „Așteaptă documentul” = ONRC întârzie; „Necesită operator” = interveniți. |
| Vrea certificat „extins” / „la zi” | e același document, „pe firmă”, cu scopul potrivit. |
| Vrea și cazier fiscal al firmei sau altceva | serviciu separat, comandă separată. |
| Clientul de pe reclama din ChatGPT | e unul din cele două servicii permise acolo (cu rovinieta); nimic diferit în admin. |

## Ce îi spuneți clientului

- Primește PDF-ul semnat electronic de ONRC, valabil oriunde se cere „certificat constatator”; îl poate verifica după codul de pe document.
- Când robotul merge: minute. Când nu: îi spuneți sincer că portalul ONRC e indisponibil și că livrăm imediat ce revine; nu promiteți ora.
- Nu suntem ONRC: obținem certificatul de pe portal, pe contul nostru, și plătim taxa în numele lui.
