# 17.09.2026 — Contul clientului poate fi completat, în sfârșit
<!-- categorie: clienti -->

## Pentru echipă

Până azi, contul de client era o promisiune pe care platforma nu o putea ține. Un
om își făcea cont, intra, și nu avea ce să completeze — sau completa și nu folosea
nimeni datele. Am reparat mecanismele. Nu s-a schimbat aproape nimic la vedere;
s-a schimbat ce se poate salva.

**Ce înseamnă pentru tine, când sună un client:**

- **Clientul cu CI nou sau pașaport își poate pregăti contul.** Până acum tabul de
  act accepta doar buletinul vechi. Dacă cineva îți spunea „nu pot încărca
  pașaportul în cont", avea dreptate. Acum își alege ce act are și i se cere doar
  ce trebuie: la buletinul vechi doar fața, la CI nou ambele, la pașaport pagina
  cu poza. Selfie-ul rămâne la toate.
- **Datele de facturare salvate chiar se folosesc.** Formularul din cont nu cerea
  localitatea și județul, deci profilul salvat nu era niciodată valid la comandă
  și clientul le rescria de fiecare dată. Dacă ai auzit „păi le-am salvat deja",
  avea dreptate și aici.
- **Numărul de telefon nu se mai pierde.** Îl ceream la înregistrare și îl
  aruncam. Din 71 de clienți cu cont, doar 5 aveau telefon salvat.
- **„Ce pot comanda" din cont spune adevărul.** Ieri scria „avem toate datele
  tale" la aproape toate serviciile, inclusiv la extras CF, unde urmau încă cinci
  câmpuri. Acum scrie concret ce se va mai cere.

**Ce NU s-a schimbat:** comanda merge în continuare fără cont, iar linkul de
urmărire din email funcționează la fel, fără parolă. Contul nu e obligatoriu
nicăieri.

---

## Ce s-a livrat tehnic

Faza 0 din `docs/dashboard-client/PLAN.md` — reparațiile fără de care orice ecran
nou ar fi fost decor. Planul, cu cifrele și deciziile, e în același document.

### Contextul măsurat

| | |
|---|---|
| Clienți plătitori / 12 luni | 398, dintre care **3 cu cont** |
| Clienți care revin | 36 (9%), maximum 4 comenzi |
| Documente vizibile clientului | 822, deschise de 367 ori — aproape toate prin linkul public |
| Profiluri de client cu telefon | 5 din 71 |
| Profiluri de facturare PF valide | **0 din 23** |

### Reparațiile

**Telefonul pierdut la înregistrare** (migrarea 171). `handle_new_user()` insera
doar `id, email, first_name, last_name`. Câmpul obligatoriu din formular ajungea
în `auth.users.raw_user_meta_data` și nu-l citea nimeni. Fără backfill pe cele 66
de profiluri existente: metadatele lor pot veni dintr-un formular mai vechi, iar
suprascrierea unui profil din date vechi e mai rea decât un câmp gol.

**Tipurile de act** (migrarea 171 + `src/lib/kyc/identity-documents.ts`). CHECK-ul
pe `kyc_verifications.document_type` accepta 9 tipuri; wizardul produce
`act_identitate`, `act_identitate_back`, `passport_opened`, `ro_cei_reader_pdf`,
`certificat_domiciliu`, `residence_permit`, `permis_fata` — niciunul permis. De
aceea `register-from-order` pierdea rândurile în tăcere: nu-și citește eroarea de
insert. Tabul refolosește acum `DocumentTypePicker` din wizard, cu o tabelă de
aliasuri, ca un document scanat într-o comandă să nu fie cerut a doua oară.

🔴 **Două găuri de bypass KYC, închise.** Amândouă create de lărgirea tipurilor:

1. `has_valid_kyc` din `api/user/prefill-data` era „orice document neexpirat care
   nu e selfie". Wizardul îl citește ca să sară peste tot pasul de KYC
   (`KYCDocumentsStep.tsx:182`), iar serverul acceptă același bypass prin
   `profiles.kyc_verified` (`api/orders/[id]/submit/route.ts:107-117`). Din
   momentul în care contul accepta permis de conducere sau certificat de
   domiciliu, oricare ar fi fost suficient pentru a comanda un cazier **fără act
   de identitate**.
2. Reparația era să introducă una mai rea: predicatul comun număra selfie-ul
   drept document de identitate, deci un selfie singur ar fi setat și
   `kyc_verified`, și `has_valid_kyc` — unde codul vechi măcar îl excludea
   explicit. Prins de test înainte de push. Selfie-ul e o verificare, nu un
   document: `tests/unit/lib/kyc/has-valid-kyc.test.ts` fixează regula.

**Facturarea PF** (`BillingProfileForm` + `src/lib/orders/billing-locality.ts`).
Formularul colecta nume, prenume, CNP și o linie de adresă; `isPfBillingComplete`
cere în plus `city` și `county`. Verificat: 23 de profiluri PF în producție,
**zero** cu vreunul dintre ele. Sursa de localități e extrasă într-un singur loc,
cu substituția București → Sector 1..6 pe care o cere SPV-ul — altfel profilul ar
stoca o localitate pe care lista din wizard n-o poate randa. Aceeași clasă de bug
pe PJ: pasul citea `pjData.address`, formularul salvează sub `companyAddress`,
deci sediul social nu se prefill-a niciodată.

**Indicatorul „ce pot comanda"** (`src/lib/account/service-readiness.ts`). Citea
doar `personalKyc` și `companyKyc`; ignora proprietate, stare civilă, vehicul,
constatator, convenție. Verificat pe configurațiile reale ale tuturor celor 31 de
servicii: cu un cont complet, **înainte toate 31 spuneau „avem toate datele
tale"; acum o spun 7** — cazierele, care chiar nu mai cer nimic. Datele imobilului,
starea civilă și convenția aparțin cererii, nu persoanei, deci contul nu le poate
ține niciodată și se listează întotdeauna.

**`preferredContact`** se citea ca `preferred_contact`. Cădea mereu pe email.

### Reparate pe drum

- potrivirea facială între sesiuni primea un URL unde aștepta o cheie S3, deci
  eșua mereu (`KYCTab.tsx:437`);
- un cont doar cu pașaport nu prefill-a seria și numărul actului;
- OCR-ul respingea documente citite perfect: Gemini raportează încrederea 0 pe
  ele, iar spatele CI-ului nou întoarce doar adresa.

### Corecție la plan

Item 0.5 („formularul de vehicul nu expune `driving_license`") **era greșit**.
Câmpul există din 25.06.2026 (`daf12f8`), împreună cu cele trei expirări.
Afirmația a venit din audit și a fost preluată fără verificare. `user_saved_vehicles`
e goală pentru că nimeni n-a salvat o mașină, nu pentru că n-ar avea unde.

## Urmează

Faza 1: contul se creează după plată, cu o parolă ca singur câmp, și absoarbe
datele comenzii tocmai plătite — inclusiv actul de identitate. Decizii în
`docs/dashboard-client/PLAN.md` §6.
