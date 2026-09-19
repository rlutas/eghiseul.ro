# 19.09.2026 — documentero.ro: meniu „Servicii" cu mega-dropdown, animații, ritm de spațiere, comanda de test
<!-- categorie: seo -->

## Pentru echipă

- **Meniul de sus** nu mai are cinci linkuri înghesuite. Are „Servicii", care
  deschide un panou cu toate cele cinci acte (iconiță, o linie de context,
  link la pagină și buton „Comandă" către formularul corect), apoi Ghiduri,
  Despre, Contact. Pe telefon, aceeași listă în meniul cu trei linii.
- **Paginile au mișcare discretă**: secțiunile apar ușor când derulezi,
  hero-ul intră în trepte, cardurile se ridică puțin la mouse. Nimic nu se
  ascunde pentru cine nu are JavaScript sau are „reduce motion".
- **Spațierea** între secțiuni e aceeași pe toate paginile documentero.
- **Comandă de test** făcută pe wizardul documentero (local, pe baza de
  producție): `E-260919-ADXE7`, certificat de naștere, client „Test
  Documentero". A ajuns în checkout, neplătită. **Raul o plătește** (card,
  apoi o anulăm, sau transfer bancar și „Confirmă plata" din admin) ca să
  verificăm emailul, factura și numărul de registru pe brandul documentero.
- Găsit și reparat în test: titlul din tab pe paginile de checkout / status
  / cont arăta „eGhișeul.ro" pe documentero.

---

## Rezumat tehnic

### Header (`src/config/documentero-nav.ts`, `src/components/documentero/header.tsx`)

- `DOCUMENTERO_SERVICES_MENU` (5 intrări: label, hint, href, orderSlug, icon)
  + `DOCUMENTERO_NAV` cu `mega: true` pe „Servicii”, apoi Ghiduri / Despre /
  Contact.
- Mega-meniu fără JS: `group-hover` + `group-focus-within`, panou 840 px pe
  două coloane, `ServiceIcon` (4 iconițe line-art), rând „Toate actele” →
  `/#acte`, subsol cu „Cine suntem”. Tranziție 200 ms (opacitate + 4 px).
- `active` = calea paginii; o pagină de serviciu aprinde „Servicii”.
- Mobil (`<details>`, sub `lg`): lista serviciilor cu iconițe + „Comandă”,
  apoi linkurile simple, apoi „Urmărește comanda”. Verificat la 360 px.

### Mișcare (`src/components/documentero/reveal.tsx`, `globals.css`)

- `<Section>` pune `data-reveal` (opt-out cu `reveal={false}` pe hero);
  `RevealObserver` montat în layout-ul documentero marchează `.is-in` la
  intrarea în viewport (`rootMargin -8%`, prag 0,08); ce e deja pe ecran la
  încărcare primește `.is-in.no-anim` (fără clipire).
- CSS sub `@media (scripting: enabled)`: opacitate 0 + `translateY(18px)` →
  0.7 s `cubic-bezier(0.22,1,0.36,1)`. Fără JS (GPTBot, ClaudeBot, curl) nu
  se ascunde nimic. `prefers-reduced-motion`: doar fade, 0.3 s.
- `.d-rise` (0.8 s) pe hero-ul de acasă și pe `ServiceHero`, cu întârzieri
  80/160/240/320 ms. `Card` are tranziție pe transform/umbră/bordură; `Btn`
  se ridică 2 px cu umbră; cardurile din selectorul de acte 4 px.
- ⚠️ Captura full-page fără scroll arată secțiunile goale (nerevelate) —
  normal; la Screaming Frog/Playwright derulează pagina înainte de captură.

### Ritm de spațiere

35 de linii `<Section>` normalizate: `mt-20 lg:mt-[88px]` → `mt-24 lg:mt-32`,
`mt-16 lg:mt-[72px]` → `mt-20 lg:mt-28`, hero `mt-12 lg:mt-20`, banda de
încredere `mt-10`. Header 72 px, `backdrop-blur-md`.

### Comanda de test (Playwright, `documentero.localhost:3000`)

- Pașii 1–8 trecuți cu date fictive (CNP valid pe cifra de control,
  `1900101300018`), act + selfie generate, semnătură pe canvas, Sameday
  Standard 24H, facturare PF. Submit reușit → `pending`, `platform =
  'documentero'`, `signature_s3_key` salvat, checkout pe brandul documentero.
- Prima încercare a picat corect cu `KYC_INCOMPLETE`: încărcasem același
  fișier la „spate” și la selfie, iar serverul respinge un selfie identic cu
  alt document (REV3-KYC-001). Ștergerea unuia le-a scos pe amândouă din
  listă (aceeași cheie) — de reținut la teste.
- Reparat: `generateMetadata` în `src/app/(order)/layout.tsx` — pe
  documentero, checkout/success/status/cont primesc `title.absolute`
  („Comanda ta — documentero.ro”, șablon `%s | documentero.ro`),
  `metadataBase`, OG și `noindex`; pe eghiseul returnează `{}` (nimic
  schimbat). Verificat cu `curl` pe ambele hosturi.
- Rămase (în `docs/documentero/lansare.md`): specimenul din wizard cu logo
  eGhișeul, textul de la selfie cu servicii eghiseul, contractul care
  trimite la T&C eghiseul, previzualizări KYC goale după reîncărcare
  (`<img src="">`, bug general), preload inutil pentru
  `logo-wide-white.webp` pe wizard.
