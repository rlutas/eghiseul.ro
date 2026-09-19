# 19.09.2026 — documentero.ro: favicon propriu, meniu refăcut, recenzii Google reale, footer cu ANPC
<!-- categorie: seo -->

## Pentru echipă

Pe documentero.ro apar acum lucrurile lui, nu ale eghiseul-ului:

- **Iconița din tab** e „d”-ul verde al documentero, nu logoul eghiseul.
- **Meniul de sus** are, în ordine: Certificat naștere · Certificat căsătorie ·
  Certificat celibat · Extras multilingv (se deschide și arată două variante,
  naștere și căsătorie, fiecare cu butonul ei „Comandă” către formularul
  corect) · Ghiduri. Pe telefon e un buton cu trei linii.
- **Nu mai există „Contul meu”** pe documentero. În loc, „Urmărește comanda”
  duce la aceeași pagină de urmărire ca pe eghiseul (cod + email).
- **Recenziile de pe prima pagină sunt reale**, de pe profilul Google al
  eGhișeul.ro: nouă recenzii de 5 stele despre acte de stare civilă (naștere,
  căsătorie, celibat, extras multilingv), cu pozele de profil ale clienților
  și cu mențiunea că profilul Google e al firmei (eDigitalizare SRL). Textele
  recenziilor NU pomenesc eghiseul.ro (unde clientul l-a scris, fraza e tăiată
  cu „…”, nu rescrisă). Nota sub recenzii spune data la care au fost citite.
- **Numărul de recenzii afișat** pe ambele site-uri e acum 470 (verificat azi
  pe Google Maps).
- **Footerul** are jos, ca pe eghiseul, sigla ANPC SAL și cea de soluționare
  online a litigiilor, plus telefonul consumatorului și datele firmei.

---

## Rezumat tehnic

### Favicon (de ce apărea al eghiseul-ului)

Iconițele vin din convențiile de fișier `src/app/icon.png` / `apple-icon.png`
/ `favicon.ico`, care aparțin **segmentului rădăcină**, deci Next le injecta pe
orice pagină, inclusiv pe cele din `src/app/documentero/`. Iar pe hostul
documentero `/favicon.ico` era în lista `SHARED` din rewrite-uri, deci se
servea fișierul eghiseul.

Rezolvare, cu comportamentul din `resolve-metadata.js` (Next ține iconițele
statice ale **celui mai adânc** segment care le are):

- `src/app/documentero/icon.png` (512) + `apple-icon.png` (180), generate cu
  `sharp` din marca SVG (pătrat rotunjit `#0F2A22`, „d” fildeș, colț mentă).
  `<head>`-ul documentero are acum DOAR `/documentero/icon.png?<hash>` și
  `/documentero/apple-icon.png?<hash>`.
- `src/proxy.ts`: `DOCUMENTERO_STATIC_ICON` exceptează exact aceste două căi
  de la 404-ul pe calea internă `/documentero/*` (altfel linkul din head era
  mort).
- `src/app/favicon.ico` → `public/favicon.ico` (pe eghiseul rămâne servit
  static, dar nu mai e injectat ca `<link>` în segmentul rădăcină). Pe hostul
  documentero, `/favicon.ico` e rescris către
  `public/images/documentero/favicon.ico` (ICO real, 16/32/48 cu PNG
  înăuntru).

### Header (`src/components/documentero/header.tsx`, `src/config/documentero-nav.ts`)

- `DOCUMENTERO_NAV` în ordinea cerută; „Extras multilingv” are `children`
  (naștere → `/extras-multilingv/`, căsătorie → `/extras-multilingv/#casatorie`),
  fiecare cu `orderSlug` pentru butonul „Comandă” din dropdown.
- Dropdown fără JS: `group-hover` + `group-focus-within` (tastatură).
- Meniu mobil `<details>`, fără JS; sub 1280 px (cele cinci etichete + link +
  CTA nu încap pe un rând), lockup 18 px și „Comandă” scurt sub 640 px, ca să
  încapă pe 360 px.
- `active` primește acum **calea** paginii, nu eticheta (etichetele s-au
  schimbat și ar fi rupt tăcut sublinierea); toate cele 6 pagini actualizate.
- „Contul meu” scos; `DOCUMENTERO_TRACK_HREF = '/comanda/status/'` (ruta
  partajată, cu header documentero pe acest host). Textul „status în cont” din
  banda de preț de pe acasă → „status pe email și pe pagina de urmărire”.

### Recenzii (`src/lib/documentero/reviews.ts`, `src/components/documentero/reviews.tsx`)

- 208 recenzii citite din Google Maps (profilul eGhișeul.ro, 4,9 / 470),
  filtrate pe stare civilă + 5★ → 20; 9 alese, cu poză de profil, text
  verbatim cu tăieturi marcate „…”. Pozele la 160 px în
  `public/images/documentero/recenzii/`.
- Fără timp relativ (regula din `content-and-seo.md` §3); nota arată data
  citirii (`DOCUMENTERO_REVIEWS_COLLECTED`).
- `ReviewersStack` (hero: 4 poze reale + rating, link la profil) și
  `ReviewsDocumentero` (6 carduri, badge Google, „Lasă o recenzie”).
- `SOCIAL_PROOF.reviewCount` 464 → 470 (19.09.2026).

### Footer (`src/components/documentero/footer.tsx`)

Bara de jos ca pe eghiseul: © + firmă + Telefonul Consumatorului la stânga,
badge-urile `anpc-sal.svg` / `anpc-sol.svg` la dreapta, disclosure-ul sub ele.
„Urmărește comanda” adăugat în coloana Companie.

### Verificat

`tsc` + `eslint` curate; pe `documentero.localhost:3000`: `<head>` doar cu
iconițele documentero, `/documentero/icon.png` 200, `/favicon.ico` 200 pe
ambele hosturi, `/comanda/status/` 200 cu header documentero; capturi la
1440 / 390 / 360 px (dropdown, meniu mobil, recenzii, footer).

Rămân (checklist complet în `docs/documentero/lansare.md`): Resend pe
domeniul documentero (fără MX/TXT la 19.09), Search Console + GA4, pagini
legale proprii, OG implicit `/og/documentero-default.png`, logo pentru email
și SVG alb, textele „eghiseul.ro” din emailurile secundare/KYC/auth, sitemap
curatoriat + scoaterea `noindex`, link declarat din eghiseul, comanda de test
plătită pe documentero.ro.
