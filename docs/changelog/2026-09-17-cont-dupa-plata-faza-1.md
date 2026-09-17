# 17.09.2026 — Contul se face după plată, cu o singură parolă
<!-- categorie: clienti -->

## Pentru echipă

Din acest moment, pe pagina care confirmă plata, clientul vede o ofertă: îți
faci cont? Mai e nevoie doar de o parolă. Restul — numele, telefonul, adresa,
datele de facturare, actul scanat și selfie-ul — trec singure din comanda pe
care tocmai a plătit-o. Nu mai completează nimic a doua oară.

**Ce înseamnă pentru tine:**

- **Clientul care sună „unde e documentul meu?"** poate avea de acum contul lui,
  unde stau toate comenzile, documentele și facturile. Îi spui să își pună o
  parolă pe pagina de după plată, sau la următoarea comandă.
- **Nu e obligatoriu nicăieri.** Cine nu vrea cont comandă exact ca până acum,
  iar linkul de urmărire din email funcționează la fel, fără parolă. Oferta nu
  blochează nimic și nu apare celor care au deja cont.
- **Dacă are deja cont pe acel email**, pagina îi spune asta și îl trimite la
  autentificare, în loc să dea eroare.
- **Actul scanat rămâne al lui.** Dacă a comandat un cazier și a scanat
  buletinul, actul intră în cont și la comanda următoare nu îl mai încarcă.
  Cine a comandat un certificat constatator sau un extras de carte funciară nu a
  încărcat niciun act — și nici nu i se cere acum unul.

**Ce NU s-a schimbat:** prețuri, pași în comandă, emailuri către client.

---

## Ce s-a livrat tehnic

Faza 1 din `docs/dashboard-client/PLAN.md`. Oferta de cont după plată, și ruta
care mută comanda în cont — rescrisă, fiindcă nu funcționa.

### De ce erau 3 conturi la 398 de clienți plătitori

Oferta de cont exista în cod și **nu era accesibilă**:
`modular-order-wizard.tsx` declara `const [showSaveModal, setShowSaveModal] =
useState(false)` și randa `<SaveDataModal>`, dar `setShowSaveModal` nu era apelat
nicăieri în tot proiectul. Modalul nu s-a deschis niciodată. Șters, împreună cu
`save-data-modal.tsx`, care nu mai avea alt importator.

Noul `AccountOfferCard` e inline pe ramura de plată reușită a paginii de succes,
sub butoanele existente: un singur câmp (parola), 3–4 beneficii concrete, și
nimic dacă vizitatorul e deja autentificat, dacă ordinea e deja legată de un cont
sau dacă verificarea sesiunii eșuează (fail closed — nu invităm pe nimeni la al
doilea cont). 409 se randează ca „Ai deja un cont" cu buton de autentificare,
429 cu timpul de așteptare. Termenii și politica de confidențialitate nu se cer
a doua oară: au fost acceptate la plasarea comenzii, iar textul mic o spune.

### `register-from-order` nu salva documentele. Deloc.

Ruta citea `doc.base64` din `customer_data.personal.uploadedDocuments` și îl
scria ca `data:` URL în `file_url`. Verificat în producție: **183 de comenzi
plătite au documente, și zero au `base64`** — wizardul pune imaginea în S3 și
păstrează `s3Key`. Cele 5 rânduri cu base64 din `kyc_verifications` (1,2 MB) vin
dintr-o cale mai veche. Ruta nu-și citea nici eroarea de insert, deci nimeni n-a
aflat.

Acum documentul se **copiază** în S3 (`CopyObject`, server-side, fără download și
re-upload) din `kyc/<orderId>/<tip>.jpg` în `kyc/<userId>/<verificationId>/…`.
Copierea nu e opțională: `/api/upload/download` semnează o cheie `kyc/` doar dacă
ea conține id-ul celui care cere, deci un rând care ar arăta spre cheia comenzii
ar fi fost necitibil din cont. Fiecare insert e verificat, iar un eșec de copiere
nu costă clientul contul — restul profilului tot se salvează.

### 🔴 `migrate_order_to_profile()` ridica `kyc_verified` pe orice comandă

Funcția seta `kyc_verified = TRUE` necondiționat, pentru fiecare comandă din care
se năștea un cont. Flagul nu e decorativ: `POST /api/orders/[id]/submit` îl
onorează ca bypass server-side al pasului de identitate, iar wizardul sare tot
pasul de KYC când îl vede prin `/api/user/prefill-data`. Deci un cont născut
dintr-un certificat constatator sau un extras CF — servicii care nu cer act, la
fel cum nu cere nici ONRC — putea comanda un cazier judiciar **fără niciun act la
dosar**.

Aceeași clasă de gaură ca cea închisă în `has_valid_kyc` la Faza 0, pe cealaltă
ușă. Migrarea 172 ridică flagul doar când comanda chiar poartă un document de
identitate, și niciodată nu-l coboară pentru un cont care l-a câștigat deja.
Din 6 profiluri marcate în producție, **2 nu aveau niciun act în spatele
flagului** — corectate de aceeași migrare. Lista de tipuri e duplicată în SQL
(plpgsql nu poate chema predicatul din TypeScript), așa că
`tests/unit/lib/kyc/identity-list-sql-parity.test.ts` ține cele două copii
sincrone. `EXECUTE` revocat de la PUBLIC, cu `GRANT` înapoi la `service_role`
(vezi migrarea 167 pentru de ce nu e suficient `FROM anon`).

### Profilul de facturare, structurat

Ruta salva nume, CNP și o singură linie de adresă lipită din bucăți.
`isPfBillingComplete` cere stradă + localitate + județ separat, deci profilul
născut așa nu putea prefila niciodată comanda următoare — exact forma în care
sunt toate cele 23 de profiluri PF din producție.

Sursa bună e blocul `billing` al comenzii: a trecut validarea la checkout, deci
are cele trei câmpuri. Din 439 de comenzi plătite cu bloc de facturare, 313 au
localitate și 314 județ. Când nu e complet, **nu se salvează nimic**: un profil
care nu poate valida e mai rău decât niciunul, fiindcă apare în cont ca salvat și
tot cere retastarea la checkout. Comenzile pe firmă produc un profil PJ, cu
sediul scris sub `companyAddress` — cheia pe care o citește formularul din cont,
nu cea a wizardului.

Maparea e în `src/lib/account/order-to-billing-profile.ts`, cu 10 teste pe forma
reală a unei comenzi din producție.

### Reparate pe drum

- expirarea documentului copiat se ia din OCR când există și e în viitor, ca la
  încărcarea din cont, altfel 90 de zile;
- `KYC_VALIDITY_DAYS` era `const` privat în trei rute, cu aceeași valoare și fără
  nimic care să le țină egale → `src/lib/kyc/constants.ts`.

Build verde, 1876 de teste. Copierea S3 și constrângerea `document_type`
verificate pe o comandă reală, în tranzacție cu ROLLBACK.

## Urmează

Faza 2: onboardingul cu o singură întrebare — ce servicii te interesează — care
decide dacă se cere sau nu un act de identitate.
