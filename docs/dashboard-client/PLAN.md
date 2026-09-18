# Dashboard client — plan de refacere

Scris 17.09.2026. Acoperă **contul clientului**: ecranul de intrare, onboardingul care
duce în cont, dashboardul propriu-zis și felul în care apar serviciile acolo.
Wizardul de comandă e în afara scopului, cu excepția locurilor unde contul îl
alimentează sau e alimentat de el.

Nimic din ce urmează nu e implementat. Documentul se termină cu deciziile care
trebuie luate înainte de prima linie de cod.

---

## 1. Ce am măsurat

Toate cifrele sunt interogate din producție pe 17.09.2026, nu estimate.

### Contul aproape nu există

| | |
|---|---|
| Clienți plătitori, ultimele 12 luni | 398 |
| Dintre ei, cu cont | **3** |
| Conturi totale în `auth.users` | 74 |
| Conturi care nu s-au autentificat niciodată | 59 din 73 |
| Conturi cu emailul neconfirmat | 38 din 73 |

Contextul contează: crearea de cont a fost **complet blocată** între 09.08 și
17.09.2026, fiindcă Supabase restricționase trimiterea de email pe proiect. Deci
cifrele de mai sus măsoară un produs pe care oamenii n-au putut să-l folosească,
nu unul pe care l-au refuzat. Reparat azi (SMTP custom pe Resend).

### Clientul revine rar

| | |
|---|---|
| Clienți plătitori cu **o singură** comandă | 362 din 398 (91%) |
| Clienți care revin | 36 (9%), maximum 4 comenzi |

**Consecința pentru plan:** un cont vândut ca „îți salvează timp data viitoare"
se amortizează pentru 1 om din 11. Valoarea trebuie să fie în comanda curentă.

### Livrarea documentelor funcționează deja — fără cont

| | |
|---|---|
| Documente marcate vizibile clientului | 822, pe 555 de comenzi |
| Deschise vreodată de client | 367 (44,6%), 663 vizualizări |
| Comenzi plătite / 90 zile | 439, toate cu factură |
| Comenzi cu AWB | 42 |
| Durată medie plată → finalizare | ~237 ore (≈10 zile) |

Cum doar 3 clienți au cont, practic **toate** vizualizările astea vin prin pagina
publică `/comanda/status?order=…&email=…`. Ăla e dashboardul real de azi.

---

## 2. De ce contul pare inutil — cauza nu e vizuală

Am refăcut azi navigația, antetul și checklistul. Nu e suficient, fiindcă
problema e mecanică, nu estetică: **contul nu poate fi completat, iar ce se
completează nu e folosit.**

Probleme verificate în cod și în date:

1. **Telefonul cerut la înregistrare se pierde.** Trigger-ul `handle_new_user()`
   inserează doar `id, email, first_name, last_name`; `phone` din
   `raw_user_meta_data` nu e copiat niciodată. Din 71 de profiluri de client,
   **5 au telefon**. Cerem un câmp obligatoriu și îl aruncăm.

2. **Tabul „Act de identitate" acceptă 3 tipuri de document; wizardul cere 9+.**
   `KYCTab` știe `ci_front`, `ci_back`, `selfie`. Wizardul lucrează cu
   `ci_nou_back`, `passport_opened`, `ro_cei_reader_pdf`, `certificat_domiciliu`,
   `residence_permit`, `permis_fata`. Un client cu **CI nou sau pașaport nu-și
   poate pregăti contul**, oricât ar vrea.

3. **Profilul de facturare PF nu poate fi complet niciodată.** Formularul are
   nume, prenume, CNP, adresă. Validarea comenzii cere în plus `city` și
   `county`. Deci profilul salvat nu satisface niciodată cerința, iar clientul
   recompletează la fiecare comandă — exact lucrul pe care contul promite să-l
   evite.

4. **20 de servicii imobiliare cer 5 câmpuri pe care contul le are deja.**
   Convenția topograf cere nume, adresă, CNP, serie și număr act ale
   beneficiarului. Toate există în `profiles` + `kyc_verifications`. Niciunul nu
   e trecut mai departe.

5. **Wizardul nu scrie nimic înapoi în cont.** Singura excepție e un backfill la
   submit, doar pe câmpurile goale din `profiles`. Adresa scanată din act, actul
   însuși, vehiculul, profilul de facturare din comandă — niciunul nu ajunge în
   cont. Un om care a comandat de trei ori are contul la fel de gol ca în prima zi.

6. **Indicatorul „ce pot comanda" pe care l-am livrat azi e înșelător.**
   `serviceReadiness` citește doar `personalKyc` și `companyKyc`; ignoră
   `propertyVerification`, `civilStatus`, `vehicleVerification` și `constatator`.
   Pentru cele 20 de servicii imobiliare scrie „avem toate datele tale" când de
   fapt urmează 5 câmpuri de convenție. **E bug-ul meu, de azi, și intră în plan
   ca reparație, nu ca funcție nouă.**

7. **`user_saved_vehicles` are 0 rânduri.** (Corecție: formularul expune
   `driving_license` din 25.06.2026 — afirmația inițială că lipsește era greșită.
   Tabela e goală pentru că nimeni n-a ajuns să salveze o mașină, nu pentru că
   n-ar avea unde.)

8. **`preferredContact` nu se citește niciodată.** `prefill-data` caută
   `preferred_contact` (snake_case), datele sunt salvate ca `preferredContact`
   (camelCase). Cade mereu pe `email`.

---

## 2b. Contextul de piață — un singur fapt util

Din ~12 concurenți români vii, deschiși unul câte unul pe 17.09.2026: **zero au
cont de client.** Toată categoria e comandă ca invitat → plată → pagină de status
deblocată cu un cod. Inclusiv platformele surori (`ecazier.ro`,
`cazierjudiciaronline.com`).

Asta e singura concluzie pe care o luăm din concurență, și e una de poziționare,
nu de design: **nu există model de imitat.** Nimeni nu are un cont, nimeni nu are
platformă multi-serviciu, deci nu putem copia forma de la nimeni. Construim din
ce știm despre clienții noștri și despre ce cer serviciile noastre.

Un al doilea fapt, tot de poziționare: pe imobiliare și ONRC concurența vinde la
49–89 lei cu 6 câmpuri pe un ecran. Acolo, orice pas în plus costă — inclusiv în
cont.

Restul cercetării de piață e în `RESEARCH.md`, ca arhivă. Nu conduce designul.

---

## 3. Principii, din cercetare

Surse în §7. Reguli obligatorii pentru orice ecran din plan. Nu sunt copiate de
la un concurent — n-are niciunul cont; vin din cercetare pe produse care chiar au
rezolvat problema asta (Monzo, GOV.UK, VA.gov, Stripe, Baymard, NN/g).

1. **Urmărirea comenzii rămâne accesibilă fără autentificare.** NN/g o cere
   explicit (ghidul 13). La noi e și mai apăsat: se poate comanda fără cont, iar
   linkul public e singura cale pentru 99% dintre clienți. Contul adaugă
   comoditate, nu devine poartă.

2. **Ecranul de start = starea comenzilor, nu un „bun venit" și nu catalogul.**
   Monzo a refăcut Home-ul pe trei acțiuni reale după ce prima versiune a fost
   descrisă de utilizatori drept „overwhelming and confusing" — același cuvânt
   folosit și aici.

3. **Un singur status vizibil, în română de om, plus istoric datat.** Fără
   `documents_generated` sau `submitted_to_institution` în fața clientului.
   Dicționar unic status intern → propoziție. (Există deja parțial:
   `src/lib/orders/customer-status.ts`.)

4. **Contul se creează la sfârșit, nu la început.** Baymard: 18% dintre
   abandonurile de coș au drept cauză contul obligatoriu, iar 42% dintre site-uri
   îl cer prea devreme; recomandarea testată e crearea pe pagina de confirmare,
   unde mai rămâne de completat doar o parolă.

5. **Checklist, nu wizard forțat.** Rata medie de completare a unui checklist de
   onboarding e 19,2% (mediană 10,1%) pe 188 de companii. Proiectăm pentru ~20%:
   nicio funcție importantă nu are voie să depindă de profil complet.

6. **Fiecare întrebare din onboarding trebuie să schimbe ceva vizibil.** Testul:
   scrie propoziția „pentru că ai răspuns X, acum vezi/faci Y". Dacă nu poți,
   taie întrebarea. E și minimizare GDPR, nu doar UX.

7. **Nu cere ce ai deja.** Confirmarea („astea sunt datele tale din ultima
   comandă — corect?") e mult mai ieftină decât introducerea.

---

## 4. Ce construim

Deciziile de mai jos sunt **luate** (17.09.2026), nu propuneri.

### Regula care le leagă: contul nu cere, contul primește

Comanda rămâne posibilă complet fără cont, iar linkul public de urmărire rămâne
funcțional. Contul apare **după plată**, pe pagina de succes, și se umple singur
din comanda tocmai făcută. Clientul nu completează un profil; îi este oferit unul
deja completat.

### Faza 0 — reparații care fac contul completabil

Fără astea, orice ecran nou e decor. Nu schimbă niciun pixel.

| # | Reparație | De ce |
|---|---|---|
| 0.1 | `handle_new_user()` copiază și `phone` | îl cerem obligatoriu și îl pierdem |
| 0.2 | `KYCTab` acceptă toate tipurile pe care le cere wizardul | CI nou și pașaport nu pot fi pre-salvate |
| 0.3 | Formularul de facturare PF primește `city`, `county`, `postalCode` | altfel profilul salvat nu e valid niciodată |
| 0.4 | `serviceReadiness` citește toate cele 7 module | indicatorul de azi minte pe 20 de servicii |
| ~~0.5~~ | ~~Formularul de vehicul expune `driving_license`~~ | **greșit — era deja livrat** pe 25.06.2026 (`daf12f8`); `VehiclesTab.tsx:191` are câmpul, plus cele trei expirări. Afirmația a venit din audit și am preluat-o fără s-o verific |
| 0.6 | `preferredContact` — aliniat camelCase | nu s-a propagat niciodată |

### Faza 1 — contul se creează la final și absoarbe comanda

Pe pagina de succes, după plată: **o parolă**, atât. Restul datelor sunt deja
introduse în comandă.

Ce se salvează automat în cont din comanda tocmai plătită:

- datele personale (nume, CNP, data și locul nașterii);
- **actul de identitate și selfie-ul**, dacă serviciul le-a cerut — rămân
  valabile pentru comenzile viitoare;
- adresa de livrare;
- datele de facturare;
- vehiculul, unde e cazul.

Asta face ca a doua comandă să fie scurtă fără ca nimeni să fi completat vreodată
un formular de profil.

**Livrat pe 17.09.2026** —
[changelog](../changelog/2026-09-17-cont-dupa-plata-faza-1.md). Ce s-a aflat pe
parcurs:

- oferta de cont **exista deja** în `modular-order-wizard.tsx` și nu se putea
  deschide: `setShowSaveModal` nu era apelat nicăieri. Explică 3 conturi la 398
  de clienți plătitori mai bine decât orice ipoteză de design;
- `register-from-order` citea `doc.base64`, dar comanda păstrează `s3Key` — deci
  din cele 183 de comenzi plătite cu documente, niciuna nu a pus vreodată actul
  în cont. Documentul se copiază acum server-side între chei S3;
- 🔴 `migrate_order_to_profile()` ridica `kyc_verified` pe orice comandă, iar
  `/submit` onorează flagul ca bypass al pasului de identitate: un cont născut
  dintr-un constatator putea comanda un cazier fără act. Migrarea 172;
- vehiculul NU se salvează încă din comandă — `user_saved_vehicles` se
  alimentează doar din `VehiclesTab`. Rămâne pentru Faza 4, unde oricum se
  atinge zona de mașini.

### Faza 2 — onboarding condiționat de servicii

La prima intrare în cont, **o singură întrebare**: *ce servicii te interesează?*
(sau „la ce crezi că vei aplica"), cu răspunsuri multiple și opțiunea de a sări.

Răspunsul schimbă imediat și vizibil ce cere contul:

| Alege | Contul cere | Contul NU cere |
|---|---|---|
| Cazier judiciar / fiscal / auto, certificat integritate, stare civilă (**11 servicii**) | act de identitate + selfie, date personale, adresă, facturare | — |
| Certificat constatator, extras CF, acte cadastrale, urbanism (**20 de servicii**) | date de facturare, adresă | **act de identitate, selfie** |

Confirmat în producție: din 31 de servicii active, **11 au `personalKyc.enabled`,
20 nu**. Nici noi nu depunem act de identitate la ONRC — deci nu-l cerem nici
clientului care vrea doar constatator sau extras CF.

Întrebarea trece testul de la §3.6: „pentru că ai răspuns *constatator*, contul
nu-ți mai cere actul de identitate". Dacă omul sare peste întrebare, contul nu
cere nimic în plus și rămâne pe ce a adus comanda.

**Livrat pe 17.09.2026** —
[changelog](../changelog/2026-09-17-onboarding-o-intrebare.md). Patru răspunsuri
(caziere / stare civilă / imobile / firmă) în
`src/lib/account/service-interests.ts`, verificate față de un instantaneu al
catalogului real, ca un serviciu care-și schimbă `personalKyc` să pice testul, nu
să mintă întrebarea. Migrarea 173.

Distincția pe care o ține codul: `NULL` = neîntrebat, `{}` = a sărit peste
întrebare. `interestsRequireIdentity()` întoarce `null` pentru amândouă — „nu
știm nimic despre omul ăsta" nu e „ne-a spus că nu-i trebuie act". Doar un
răspuns explicit scoate cererea, iar un act deja încărcat rămâne mereu vizibil:
cade cererea, nu documentul.

### Faza 3 — datele din act se refolosesc, cu acordul clientului

După ce actul e scanat în cont, clientul poate alege ca **aceleași date să fie
folosite și la facturare** — nume, CNP, adresa din act — cu un singur comutator,
nu prin recompletare. Implicit oprit; clientul decide.

**Livrat pe 17.09.2026** —
[changelog](../changelog/2026-09-17-date-din-act-la-facturare.md). Ce s-a găsit
făcând-o: comportamentul exista deja, dar pe dos. `api/user/kyc/save` crea SAU
actualiza profilul de facturare la fiecare scanare, fără să întrebe, și
suprascria un profil completat manual cu forma plată pe care
`isPfBillingComplete` o respinge — adică o scanare putea strica un profil
funcțional. Acum e o alegere (implicit oprită), nu se atinge niciodată un profil
existent, iar maparea plată din trei locuri s-a redus la
`src/lib/account/id-data-to-profile.ts`.

### Faza 4 — dashboardul propriu-zis

Ecranul de start = comenzile. Pentru fiecare comandă activă, un card care
răspunde la trei întrebări, în ordinea asta:

1. **Unde e?** — status în română, plus „ce urmează și cine face" (noi /
   instituția / tu), cu termen estimat ca dată, nu ca interval.
2. **Trebuie să fac eu ceva?** — dacă da, e singurul lucru accentuat.
3. **Unde-mi sunt documentele?** — descărcare directă, plus factura.

Contul fără nicio comandă arată catalogul, nu un dashboard gol.

Ce poate spune contul și nu poate spune nimeni altcineva: **„cazierul tău expiră
în 180 de zile"**, „actul tău e deja validat", „a doua comandă e un clic".
Infrastructura de expirări există deja (`lifecycle-emails-live`).

**Livrat pe 17.09.2026** —
[changelog](../changelog/2026-09-17-dashboard-comenzi-card.md). Ce s-a găsit
făcând-o: cardul putea să-și calculeze singur termenul din `estimated_days`, în
timp ce pagina comenzii îl calculează prin calculatorul cu sărbători, urgență și
tampon — două date diferite pentru aceeași comandă. Lista folosește acum aceeași
sursă. Iar la orice eroare de API, lista de comenzi afișa clientului
„[object Object]".

Rămâne din Faza 4 mesajul de expirare din cont („cazierul tău expiră în 180 de
zile"): infrastructura există în `lifecycle-emails-live`, dar nu e adusă în
ecran.

## 5. Ce NU propun

- **Nu mutăm KYC-ul după plată.** Datele spun că nu acolo se pierd oamenii: pasul
  `kyc-documents` are 1,5% din abandonuri. (Notă: măsurătoarea ține de wizard,
  care e în afara scopului — o las aici doar ca să nu se propună mutarea pe baza
  unei presupuneri.)
- **Nu facem 2FA acum.** Coloana `two_factor_enabled` există și n-are consumator;
  poate rămâne așa.
- **Nu gamificăm profilul.** „100% complet" nu e un scop dacă nu deblochează
  nimic concret.
- **Nu cerem cont înainte de comandă, pe niciun serviciu.** Decizia D1.
- **Nu cerem act de identitate în cont celor care nu comandă servicii care îl cer.**
  20 din 31 de servicii nu au `personalKyc.enabled`; nici noi nu depunem act la
  ONRC. Decizia D5.
- **Nu mizăm pe „loghează-te cu ROeID".** 4,67% adopție pentru servicii publice.

---

## 6. Decizii

### Luate (17.09.2026)

| # | Decizia | Răspuns |
|---|---|---|
| D1 | Linkul public de urmărire rămâne funcțional fără cont? | **Da.** Comanda fără cont rămâne posibilă complet. |
| D2 | Ecranul de start: comenzile sau catalogul? | **Comenzile**; catalogul pentru contul fără comenzi. |
| D3 | Contul se creează pe pagina de succes, doar cu parolă? | **Da**, și absoarbe tot din comanda plătită, inclusiv KYC. |
| D5 | Ce întrebăm în onboarding? | **O întrebare:** ce servicii te interesează. Răspunsul decide dacă se cere act de identitate. |
| D6 | Facem Faza 0 înainte de orice ecran nou? | **Da.** |
| D7 | Selfie-ul rămâne? | **Da** — e verificarea că cel care înregistrează contul sau aplică e chiar clientul. Rămâne doar pe cele 11 servicii care îl cer, nu în cont pentru toți. |
| D8 | Datele din act se pot folosi la facturare? | **Da**, la alegerea clientului, cu un comutator. Implicit oprit. |
| D4 | Câte stări vede clientul din cele interne? | **Toate**, dar nu toate la fel. Vezi mai jos. |

### Luate (18.09.2026)

| # | Decizia | Răspuns |
|---|---|---|
| D9 | Actul de identitate rămâne pas în contul clientului? | **Nu.** După scanarea din „Date personale", pasul „Act de identitate" cerea aceeași poză a doua oară, iar un act încărcat în cont ar fi vechi la momentul comenzii. Actul și selfie-ul se cer **doar în formularul de comandă**, pentru serviciile care le cer, deci sunt mereu proaspete. Tabul „Act de identitate" rămâne pentru documentele venite din comenzi. Înlocuiește partea din D5 despre act. |
| D10 | Popup-ul de facturare pornește cu datele din act? | **Da.** Când profilul are nume + CNP, întreabă „le folosim și pe factură?" cu preview; „Da" salvează direct dacă există adresă de livrare din România, altfel deschide formularul cu numele și CNP-ul completate și cere doar adresa; „Nu" duce la formularul PF/PJ (CUI → ANAF). Rafinează D8. |
| D11 | Contul primește un cupon? | **Da.** Un cupon de bun-venit per cont (10%, 30 de zile, o folosire, legat de cont prin `owner_user_id`), creat la prima încărcare a contului și purtat pe linkurile din „Ce pot comanda", ca să se aplice singur. Nu se reemite. |
| D12 | Întrebarea de onboarding rămâne? | **Nu.** Exista ca să decidă cererea de act (D5); după D9 nu mai decide nimic. Răspunsurile stocate încă sortează catalogul. |
| D13 | Comanda plătită alimentează contul existent? | **Da.** Adresă, profil de facturare, acte — la fiecare confirmare de plată și ca backlog la încărcarea contului; profilul doar se umple, nu se suprascrie. |

### D4, luată pe 17.09.2026

Clientul vede **eticheta reală a fiecărui status**, nu o mulțime redusă. Motivul
e că munca de traducere s-a făcut deja: `customer-status.ts` scrie toate cele 24
de stări în limbajul clientului (20 în lista operatorului, plus cele patru de
dinainte de plată), iar ascunderea lor ne întoarce exact la ce
aveam înainte — „În așteptare" pentru o comandă plătită, depusă la instituție și
expediată deopotrivă.

Ce se reduce nu e lista, ci **accentul**. Cardul răspunde la trei întrebări, iar
a doua are voie să strige:

1. *Unde e?* — eticheta + cine ține comanda acum (noi / instituția / tu) +
   termenul ca dată. `on_hold_institution` spune că termenul e pe pauză, nu
   inventează o dată.
2. *Trebuie să fac ceva?* — accentuat doar când chiar blochează lucrul. Sunt
   patru stări din 22, și una singură dintre ele e „vie": `standby`, unde stau
   azi 15 comenzi.
3. *Unde-mi sunt documentele?* — descărcare directă, plus factura.

Termenul are două surse, în ordinea asta: data pusă de echipă pe comandă
(`estimated_completion_date`, prezentă pe 234 din 439 de comenzi plătite în 120
de zile) și, în lipsa ei, plata + termenul serviciului. Când nu se poate calcula
nimic onest, nu se afișează nicio dată.

## 7. Surse

Cercetare externă, 17.09.2026:

- Monzo — [How we built the new Home screen](https://monzo.com/blog/how-we-built-the-new-home-screen): >1.000 clienți, 4+2 experimente în 7 luni; prima variantă „overwhelming and confusing"
- NN/g — [Status Trackers and Progress Updates: 16 Design Guidelines](https://www.nngroup.com/articles/status-tracker-progress-update/): ghidurile 3 (limbaj uman), 9 (actualizări dese), 11 (istoric datat), 13 (link fără login), 15 (fără notificări duplicate), 16 (consistență tracker/email/suport)
- VA.gov — [Stay informed of their application status](https://design.va.gov/patterns/help-users-to/stay-informed-of-their-application-status): 4 stări cu definiție în limbaj comun, secțiunea „What to expect"
- Baymard — [Delayed Account Creation](https://baymard.com/blog/delayed-account-creation): 42% cer contul prea devreme; cont = doar parolă pe confirmare; 57% fără beneficii convingătoare
- Baymard — [Cart Abandonment Rate](https://baymard.com/lists/cart-abandonment-rate): 18% abandonează din cauza contului obligatoriu
- Baymard — [Mobile Checkout](https://baymard.com/blog/mobile-checkout): 60% dintre subiecți nu găsesc opțiunea de guest pe mobil
- Userpilot — [Onboarding checklist completion benchmarks](https://userpilot.com/blog/onboarding-checklist-completion-rate-benchmarks/): 19,2% medie / 10,1% mediană pe 188 companii
- GOV.UK One Login — [Users create an account to save progress](https://www.sign-in.service.gov.uk/users-create-an-account-to-save-progress-pdf-february-2023): contul apare la „salvează și continuă mai târziu", nu la intrare
- GOV.UK Design System — [Task list](https://design-system.service.gov.uk/components/task-list/): evidențiază ce NU e gata
- Stripe — [Customer portal](https://docs.stripe.com/customer-management): portalul ca set de treburi de făcut, nu pagină de prezentare

**Cifre pe care le-am respins ca nesigure:** „fiecare câmp în plus = −3-5%
completare", „progressive profiling +20% (McKinsey)", ratele de abandon KYC de
60-80% — toate circulă în bloguri comerciale fără sursă primară, iar cele de KYC
vin exclusiv de la vânzători de verificare. Nu le folosim ca argument.

---

## 8. Ce lipsește din acest document

- Machetele efective. Le fac după D1–D6, nu înainte: forma ecranului depinde de
  ce răspunzi la D1 și D2.
- Ce NU s-a putut verifica în cercetare, declarat ca atare: Reddit (inaccesibil),
  forum.softpedia (403), ghiseul.ro (403 — tot ce ține de el e second-hand),
  Trustpilot pentru eghiseul.ro și ecazier.ro (nu există pagină), reclamații
  publice despre livrare/refund la vreun intermediar (zero dovezi găsite — risc
  necunoscut, nu zonă curată).

---

## 9. Două lucruri urgente, în afara dashboardului

Ies din cercetare și n-au legătură cu contul, dar au termen.

**9.1 Ordinul ANPC 505/2026**, publicat în Monitorul Oficial nr. 749 din
**4 septembrie 2026**, în vigoare de atunci — deci de 13 zile. Cere link vizibil
către pagina oficială ANPC pe prima pagină a oricărui site care preia comenzi
online, și a înlocuit anexele cu datele comisariatelor județene și machetele de
afișare. `OrderFlowDisclosure` și footerul trebuie verificate față de anexa
curentă, nu cea de anul trecut. **De verificat, nu constatat** — n-am comparat eu
machetele.

**9.2 Temeiul și retenția pentru selfie, scrise în UI.** Selfie-ul rămâne
(decizia D7): e verificarea că persoana care înregistrează contul sau depune
cererea e chiar clientul, iar avocatul care depune în numele lui are nevoie de
asta. Ce lipsește nu e justificarea, ci **scrierea ei**: ANSPDCP a sancționat un
operator pentru combinația copie CI + selfie colectată „pentru identificare",
fără temei și scop documentate. Ecranul trebuie să spună cine cere, de ce, și cât
păstrăm — nu „pentru verificare".

Rămâne valabil și restul: `selfieRequired = true` doar pe cele 11 servicii care au
`personalKyc.enabled`. Pe celelalte 20 nu se cere nici în comandă, nici în cont.
