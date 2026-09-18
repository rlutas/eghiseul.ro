# 18.09.2026 — Contul: meniul sus, fără întrebarea de onboarding, actul scanat rămâne în cont
<!-- categorie: clienti -->

## Pentru echipă

Cinci retușuri cerute de Raul după testul pe telefon, toate live.

1. **Întrebarea „Ce servicii te interesează?" a dispărut.** Exista ca să decidă
   dacă cerem act de identitate în cont; contul nu mai cere act, deci
   întrebarea nu mai avea rost.
2. **„Datele mele" (Profil, Act identitate, Adrese, Facturare, Mașini) stă sus,
   sub „Comandă / Comenzi".** Când apeși pe un tab, pagina urcă la meniu, cu
   conținutul imediat sub el — nu mai rămâi pe la mijloc cu conținutul schimbat
   deasupra.
3. **Actul fotografiat la „Date personale" se salvează în cont**, la „Act de
   identitate". Până acum se folosea doar pentru citirea datelor, iar tabul de
   act cerea aceeași poză din nou. Textul de sub buton spune acum că poza se
   salvează.
4. **În „Profil", linia despre identitate nu mai e avertisment.** Cu act salvat:
   „Act de identitate salvat — selfie-ul îl faci la comandă". Fără act: „Niciun
   act în cont — îl fotografiezi la comandă sau îl adaugi din Act de
   identitate". Nu mai trimite la o secțiune „Documente Verificate" care nu
   există cu numele ăsta.
5. **Tab-urile nu-și mai repetă titlul** („Facturare / Profile de Facturare /
   Adaugă profil" pe un rând înghesuit): rămâne titlul panoului, textul de
   explicație și butonul pe rândul lui, lat cât ecranul pe telefon. La fel la
   Adrese și Mașini. Cardurile de facturare/adrese lasă etichetele să treacă pe
   rândul următor în loc să rupă numele.
6. **Când profilul e complet**, cardul de sus devine o singură linie: „Profilul
   tău e complet 100%".

---

## Rezumat tehnic

- `account/page.tsx`: `OnboardingQuestion` scos din randare (componenta și
  coloanele `service_interests` / `onboarding_completed_at` rămân; răspunsul
  existent încă sortează catalogul). `hasAnsweredOnboarding` eliminat.
- `AccountTabs`: pe mobil `AccountNav` întreg (primary + secondary) deasupra
  conținutului; blocul secundar de sub conținut eliminat; `handleTabChange`
  face `containerRef.scrollIntoView({ block: 'start' })` (respectă
  `prefers-reduced-motion`), cu `scroll-mt-20 xl:scroll-mt-[120px]` pentru
  headerul sticky. `labelShort` pentru profil = „Profil" (se trunchia pe 2
  coloane). Prop-ul `only` din `AccountNav` rămâne, nefolosit.
- `IdScanField`: după OCR reușit, `uploadToS3({ category: 'kyc' })` +
  `useKycStatus().saveDocument()` cu tipul `ci_front` / `passport_opened`;
  fără fallback pe data-URL; eșecul se loghează și nu blochează câmpurile;
  emite `ACCOUNT_DATA_SAVED_EVENT` ca tabul de act să se reîncarce.
  `POST /api/user/kyc/save` ridică `kyc_verified` pentru un act de identitate,
  la fel ca scanarea din `ProfileTab` — comportament neschimbat.
- `ProfileTab`: linia de identitate pe două stări (`kycIsVerified || hasFrontId`
  vs. nimic), fără `AlertTriangle`; `isPartial`/`hasSelfie` nu mai sunt
  citite; headerul se stivuiește sub `sm`.
- `BillingTab` / `AddressesTab`: `<h3>` scos (panoul are `<h2>`), header
  `flex-col` sub `sm`, buton `w-full sm:w-auto` de 44px; capul cardului
  `flex-wrap`; numele PF prin `formatPersonName` (familie întâi).
  `VehiclesTab`: același header, fără `mt-4`.
- `ProfileChecklist`: `isComplete` → o linie verde, fără rânduri și fără
  dialog.
- Verificat local la 390px pe cont de test complet (șters după): linia „100%",
  meniul sus, tap pe „Adrese" de la capătul paginii aduce meniul la 80px sub
  header, tabul Facturare fără titlu triplu.

Observat, nereparat: avertisment de hidratare în consolă din
`HeaderServiceSearch` (Dialog Radix în header), pe orice pagină — preexistent.
