# Identificare imobil: fluxul pentru „nu l-am găsit” (certificat OCPI 2.7.8 + credit)

**Data:** 21.09.2026 · **Status:** 📋 design, de confirmat cu Raul și Mircea · **Preț nou decis:** 298 lei

## 1. Problema

Azi, când topograful nu găsește imobilul în e-Terra, comanda de identificare
moare într-un status greșit:

- Mircea pune `standby` + notă „nu s-a putut identifica, are credit”.
- Clientul vede „Așteptăm un răspuns de la tine” (fals: nu i-am cerut nimic),
  nu primește niciun document și nu știe ce urmează.
- „Creditul” trăiește doar într-o notă internă. Nimeni nu îl urmărește.
- La 21.09: **12 comenzi** de identificare în `standby`, 4 în
  `on_hold_institution`, 13 finalizate. Deci ~55% din identificări se blochează.

Ce a scris Mircea (21.09): imobilul negăsit e într-una din două situații:
(A) nu e intabulat, deci nu are carte funciară și nici extras; (B) e
intabulat pe sistemul vechi, pe hârtie, iar coala funciară nu a fost încă
convertită în e-Terra.

## 2. Ce avem deja în cod (nu reconstruim)

| Pas | Există | Unde |
|---|---|---|
| Raportare CF găsit → cerere Anexa 6 generată | ✅ | `POST /api/collaborator/orders/[id]/identificare`, `customer_data.identified_property` |
| Depunere la OCPI: nr. înregistrare + cost → `submitted_to_institution` (merge și din `standby`) | ✅ | `POST .../depunere`, `customer_data.ocpi_submission`, `order_supplier_costs` |
| Încărcare document + livrare (vizibil client, `document_ready`, email) | ✅ | `POST .../upload-pdf`, `.../mark-ready`, `src/lib/collaborator/deliver.ts` |
| Statusuri pe care le poate seta topograful | ✅ subset | `POST .../status` (`COLLABORATOR_STATUSES`) |
| Tarif 2.7.8 = 100 lei în nomenclatorul informativ | ✅ | `src/lib/ancpi/tarife-oficiale.ts`, `processing_config.ancpi_cost_ron = 100` |
| Cupoane per client (owner, o folosire, procent) | ✅ | `coupons.owner_user_id` (migrarea 174, cupon de bun-venit) |
| Formular OCPI 2.7.8 generat din datele clientului | ❌ | doar Anexa 6 (`cerere-extras-cf-pdf.ts`, template `cf`/`plan`) |
| Status dedicat „identificare nereușită, certificat depus” | ❌ | — |
| Raport pentru client (PDF) la răspuns negativ | ❌ | model făcut 21.09 (`~/Downloads/raport-identificare-imobil-MODEL.pdf`) |
| Credit urmărit pe comandă | ❌ | doar în note |

## 3. Serviciul ANCPI pe care îl folosim

Ordinul ANCPI 16/2019, anexă, secțiunea 2.7 (surse: [ing.geodez.top](https://ing.geodez.top/informativ/servicii-coduri-tarif-termene-ocpi-taxe-ancpi/), [lege5](https://lege5.ro/Gratuit/gmytkmrwgqyq/ordinul-nr-16-2019-privind-aprobarea-tarifelor-pentru-serviciile-furnizate-de-agentia-nationala-de-cadastru-si-publicitate-imobiliara-si-institutiile-sale-subordonate)):

| Cod | Serviciu | Tarif | Termen normal / urgent |
|---|---|---|---|
| **2.7.8** | Certificat privind înscrierea imobilului în evidențele de cadastru și carte funciară, după datele de identificare (județ, localitate, stradă, număr) | 100 lei | 10 / 3 zile |
| 2.7.6 | Certificat privind identificarea nr. topografic / cadastral / CF după numele proprietarului | 125 lei | 10 / 3 zile |
| 2.7.2 | Extras CF pentru informare (după ce avem CF-ul) | 20 lei | 2 / 1 zile |

Răspunsul OCPI la 2.7.8 e un **certificat** în ambele cazuri: fie cu numărul
de CF (și atunci scoatem extrasul), fie negativ („nu figurează înscris”), pe
care clientul îl poate folosi la notar / la intabulare / la conversia cărții
vechi. Acesta e „refuzul oficial” pe care îl vrem în mâna clientului.

Cost pe comandă la 298 lei: identificare online 0 + 2.7.8 100 + extras 20 =
120 lei; la proprietar (2.7.6) 125 + 20 = 145 lei.

## 4. Fluxul nou

```
plătită (298)
  └─ Mircea caută în e-Terra (adresă / geoportal / proprietar)
       ├─ GĂSIT → „Am identificat imobilul” (CF) → cerere extras CF → livrare      [ca azi]
       └─ NEGĂSIT → „Nu am găsit imobilul, depun certificat 2.7.8”
             │   platforma: generează cererea 2.7.8 din adresa clientului,
             │   status NOU identification_pending_ocpi, email client
             │   („nu apare în e-Terra, am depus cerere oficială, ~10 zile lucrătoare”),
             │   termen recalculat (+10 zile lucrătoare, +3 la urgent)
             └─ Mircea depune la OCPI → nr. înregistrare + 100 lei (secțiunea existentă)
                   └─ răspuns OCPI, Mircea îl încarcă:
                        ├─ certificat CU CF → „Am identificat imobilul” cu CF-ul din certificat
                        │     → cerere extras CF → livrare (certificat + extras)     [ca azi]
                        └─ certificat NEGATIV → bifă „răspuns negativ”
                              platforma: raport PDF (model 21.09) + credit extras CF pe comandă,
                              document_ready, email client cu certificat + raport + cum folosește creditul
```

**Creditul.** Cupon 100% pe serviciul extras-carte-funciara, o folosire, legat
de emailul clientului, fără expirare (de confirmat), cod `CREDIT-<nr comandă>`.
Clientul revine cu nr. CF, comandă extrasul cu cuponul, plătește 0. Merge și
prin comandă telefonică (echipa aplică cuponul). Infrastructura există (cupon
per client, `owner_user_id`); lipsește doar tipul „100%, serviciu fix, emis din
comandă” și listarea lui în admin pe comanda-mamă.

Alternativa respinsă: redeschiderea aceleiași comenzi. Amestecă două lucrări,
două facturi și două termene într-un rând; cuponul ține contabilitatea curată.

## 5. Statusul nou vs. flag

Raul a cerut status: „identificare nereușită, depus acte 2.7.8”. Îl facem
status (`identification_pending_ocpi`), nu flag în `customer_data`, pentru că
echipa filtrează după el și clientul trebuie să vadă alt text decât la „Depusă
la instituție”. Prețul: e un status nou, deci trece prin TOATE listele albe
(footgun cunoscut, vezi memoria „admin-status-allowlist-footgun”):

- `src/lib/admin/status-options.ts` (grup normal, label „Identificare nereușită — certificat 2.7.8 depus la OCPI”)
- `src/lib/orders/customer-status.ts` + `customer-next-step.ts` (text client + termen)
- tranziții în `/api/admin/orders/[id]/process` (`paid|processing|standby → identification_pending_ocpi → document_received|document_ready`)
- `COLLABORATOR_STATUSES` în ruta de status a colaboratorului + copia din pagina lui
- `etapaOf` în `src/lib/collaborator/orders-filter.ts` (→ tab „Depuse la OCPI”)
- `BEFORE_SUBMISSION` în ruta de depunere (să nu sară înapoi pe `submitted_to_institution`)
- `PROCESSING_GROUP` / taburile din admin, `CERERE_DONE_STATUSES` rămâne (listă de negare, nu-l atinge)
- SLA: NU pauzat (nu e vina clientului, nu e avarie); termenul se recalculează.

## 6. Etape de livrare

| Etapă | Conținut | Efort |
|---|---|---|
| **0. Procedură manuală (de azi)** | Mircea depune 2.7.8 pe hârtie, înregistrează nr. + 100 lei în „Am depus cererea la OCPI”; echipa trimite emailul din ghid; la răspuns negativ, echipa trimite raportul (model) + notează creditul. Ghid: `docs/admin/identificare-imobil-nereusita.md` | 0 cod |
| **1. Status + buton „Nu am găsit”** | status nou pe toate listele albe, buton în portal, cerere 2.7.8 generată din adresa clientului (formularul OCPI, ca Anexa 6), email automat + termen | 1 zi |
| **2. Răspuns negativ** | bifă la încărcare, raport PDF auto (din modelul confirmat de Mircea), cupon-credit 100% emis și afișat în admin pe comandă, email client | 1 zi |
| **3. Preț 298** | `services.base_price` (DB), pagina serviciului (198 apare în meta description, JSON-LD, hero), FAQ „ce se întâmplă dacă nu poate fi identificat” rescris cu 2.7.8 + credit, pagina „identificare după proprietar” (de decis: și ea 298? costul e 145) | 1 oră |
| **4. Backlog** | cele 12 comenzi în `standby`: pentru fiecare, ce s-a depus deja (E-260728-VWFTT are 2.7.8 depus, 100 lei) și ce mai lipsește; trimis raportul + creditul unde e cazul | echipă + Mircea |

## 7. De confirmat înainte de cod

1. **Mircea:** modelul de raport (baze consultate, formulările A/B, semnătura, „conversia cărții funciare” ca denumire de procedură).
2. **Raul:** creditul fără expirare sau 12 luni? Cupon 100% pe extras CF (recomandat) sau altceva?
3. **Raul:** „identificare după proprietar” urcă tot la 298? (2.7.6 costă 125, deci marja e mai mică.)
4. **Raul:** 2.7.8 se depune din oficiu la fiecare negăsire (implicit da) sau Mircea decide de la caz la caz (ex. adresă evident incompletă → mai întâi întrebăm clientul, `standby` rămâne pentru asta).
5. Urgent: clientul cu opțiunea urgent plătește și 2.7.8 urgent (3 zile)? Tariful de urgență ANCPI e separat.
