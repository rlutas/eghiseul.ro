# 17.09.2026 — Checklistul din cont se completează pe loc, iar actul scanat umple datele personale
<!-- categorie: clienti -->

## Pentru echipă

Clientul care intră în cont vede sus cardul „Comandă mai repede data viitoare",
cu procentajul de completare. Până acum, când apăsa pe un rând (telefon, date
personale, adresă, facturare), era trimis în alt tab al contului și pierdea
lista — iar pe telefon, de multe ori, nu se întâmpla nimic.

**Ce se schimbă pentru client:**

- fiecare rând deschide un **popup** cu exact formularul pentru acel pas;
  salvează, popup-ul se închide, procentajul se actualizează pe loc;
- în „Date personale" poate **fotografia buletinul sau pașaportul** și câmpurile
  (nume, CNP, data nașterii, serie) se completează singure; vede ce a completat
  scanarea și poate corecta înainte de a salva. Adresa citită din act se salvează
  doar dacă bifează;
- poza făcută în acest popup **nu se păstrează** — aici nu cere consimțământ
  pentru stocarea actului. Actul se încarcă în continuare doar din pagina
  „Act de identitate", care rămâne singura cale pentru verificarea identității;
- pasul „Act de identitate" din listă explică ce urmează și trimite în pagina
  lui (nu e formular, e un flux cu cameră, selfie și verificare).

**Ce faceți voi:** nimic diferit. Dacă un client zice că „a apăsat pe telefon
și nu s-a întâmplat nimic", asta era problema și e reparată.

---

## Rezumat tehnic

### Rândurile checklistului deschid un dialog

`ProfileChecklist` este acum client component; fiecare rând e un `<button>`
care deschide `ProfileStepDialog` cu pasul respectiv. Dialogul (Radix `Dialog`)
deține ce e comun: titlu/descriere per pas, focus pe primul câmp la deschidere,
buton propriu de închidere de 44px, ESC și click pe fundal, confirmarea „ai
modificări nesalvate", `router.refresh()` după salvare ca procentajul să se
recalculeze server-side. Focusul se întoarce pe rândul care a deschis pasul sau,
dacă salvarea tocmai a scos rândul din listă, pe titlul cardului.

Formularele per pas stau în `src/components/account/profile-steps/`:

| Pas | Componentă | Ce face |
|---|---|---|
| contact | `ContactStepForm` | telefon, `normalizePhone` la salvare |
| personal | `PersonalStepForm` + `IdScanField` + `ScanResultNotice` | câmpuri din `personal-fields.ts`, scanare opțională |
| identity | `IdentityStepPanel` | explică fluxul, trimite în tabul KYC |
| address | `AddressStepForm` | reutilizează `AddressForm` |
| billing | `BillingStepForm` | reutilizează `BillingProfileForm` (PF/PJ, ANAF) |

`step-form-kit.tsx`: `Field` (etichetă vizibilă + eroare sub câmp cu
`role="alert"`), `FormError`, `StepFormFooter` sticky, validare pe blur și la
submit eșuat.

### De ce nu funcționau linkurile vechi

`AccountTabs` citea tabul din URL **o singură dată**, la montare
(`useState(tabFromUrl || initialTab)`). O navigare client-side la
`/account/?tab=kyc` re-randa pagina fără să remonteze componenta: URL-ul se
schimba, panoul nu. Toate linkurile din pagină către un tab erau moarte, inclusiv
`?edit=1` adăugat anterior ca „reparație". Acum `activeTab = tabFromUrl ||
fallbackTab`, iar `handleTabChange` scrie mereu în URL.

### Scanarea din „Date personale"

`IdScanField` alege CI sau pașaport, deschide camera pe telefon
(`capture="environment"`), comprimă, trimite la `POST /api/ocr/extract` și
judecă rezultatul cu `isOcrResultUsable()` (Gemini raportează încredere 0 pe
documente citite perfect, deci se verifică datele, nu scorul). Imaginea nu se
urcă nicăieri. Data nașterii vine din CNP (`birthDateFromCnp`) cu fallback pe
linia OCR (`isoFromRomanianDate`) — cele două helper-e sunt aceleași folosite de
`ProfileTab`, deci ecranele nu pot diverge (vezi fixul de dată din `002af5b`).

### `AddressForm` și `BillingProfileForm` primesc `errors`

Prop opțional `errors?: Partial<Record<keyof …, string>>`, gol implicit, deci
toți apelanții existenți se comportă identic. Mesajul se randează sub câmpul lui
cu `aria-invalid` + `aria-describedby`. Alternativa era o a doua copie a
formularului de județ/localitate și a celui PF/PJ cu lookup ANAF, doar ca să
aibă propriile linii de eroare.

### Ce a găsit reviewul în browser (reparat înainte de commit)

Testat pe un cont de test, mobil 390px: eroare invizibilă sub fold la scroll,
adresa care se pierdea tăcut când salvarea eșua, id-uri duplicate între dialog și
tab care furau focusul, focus pe `<body>` la închidere, selectoare sub 44px.
Toate reparate; verdict „bun de livrat".

### Rămas

- Testul A→Z pe telefon (comandă → plată → cont → checklist → popup-uri) după
  deploy.
- Salvarea pozei și din „Date personale" doar cu o bifă explicită de
  consimțământ, dacă se decide așa.

Fișiere: `src/components/account/ProfileChecklist.tsx`,
`src/components/account/ProfileStepDialog.tsx`,
`src/components/account/profile-steps/*`, `src/components/account/AccountTabs.tsx`,
`src/components/shared/AddressForm.tsx`, `src/components/shared/BillingProfileForm.tsx`.
