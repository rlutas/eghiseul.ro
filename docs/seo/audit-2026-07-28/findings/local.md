# Audit Local SEO / Google Business Profile — eghiseul.ro (28.07.2026)

## 0. Cadru: business type & vertical

**SAB (service-area business) / brand online la nivel național**, nu brick-and-mortar. Confirmat din cod:
- Zero `<iframe>` sau embed Google Maps în tot `src/` (grep pe `maps.google|google.com/maps|GoogleMap|iframe.*maps` — niciun rezultat).
- Adresa afișată (`Str. Salcâmilor nr. 2, Com. Odoreu, Jud. Satu Mare`) apare DOAR ca dată de identificare fiscală ("Date firmă" pe `/contact/`, footer bottom-bar), niciodată ca invitație de vizitare ("vino la sediu", "te așteptăm").
- `areaServed` în schema = `{"@type":"Country","name":"Romania"}` peste tot.
- Nu există pagină „Despre noi" (deja notat ca gap în `docs/seo/...` memory) și nici LocalBusiness/subtip local în schema — decizie corectă, deja documentată în `location-seo-scope`.

Concluzie: **nu recomand tactici de map-pack** ("lângă mine", optimizare proximitate) — proximitatea (55,2% din varianța de ranking per Search Atlas) e irelevantă pentru un serviciu 100% online. Categoria de „industrie" din brief (restaurant/healthcare/legal/home-services/real-estate/automotive) nu se potrivește — cel mai apropiat echivalent e „servicii administrative/birocratice online", care nu are un tipar Whitespark dedicat.

## 1. Profil Google Business Profile — **NEVERIFICAT automat**

Am încercat de 5 ori să accesez `https://www.google.com/search?kgmid=/g/11vrl4dvnf&hl=ro-RO&q=eGhiseul.ro` prin: WebFetch direct, WebFetch pe linkul `share.google/stngA2rQbVPY2l57p` din `sameAs`, `render_page.py --mode always` (Playwright, randare completă JS), curl cu cookie `CONSENT`/`SOCS` (bypass consimțământ UE) și user-agent Chrome desktop, plus căutare Google Maps directă. Rezultat constant: pagina de consimțământ Google, apoi peretele „activează JavaScript" (`httpservice/retry/enablejs`), și în final pagina anti-bot `google.com/sorry/index` („Sistemele noastre au detectat trafic neobișnuit din rețeaua dvs. de computere"). Google blochează activ accesul programatic la panourile Knowledge Graph/Maps — nu am putut extrage nimic real din profil.

**Ce trebuie verificat MANUAL de Raul, într-un browser normal, delogat**, la link-ul de mai sus (sau la `sameAs` din cod, care duce spre același profil):
1. **Categoria principală GBP** — factor #1 de ranking (scor 193 per Whitespark 2026); o categorie greșită e factorul negativ #1 (scor 176). Verifică ce categorie apare azi și dacă reflectă corect „servicii de asistență administrativă online" (nu „notariat", „agenție guvernamentală" etc. — risc de confuzie cu instituție de stat, lucru pe care site-ul îl dezminte explicit în footer și pe `/contact/`).
2. **Notă medie + număr real de recenzii** — comparați cu cifrele hardcodate în site (vezi §3 mai jos: 4.9/450 în schema și pe secțiunea social-proof, 400+ în testimonials).
3. **Recența ultimei recenzii** — regula celor 18 zile (Sterling Sky): dacă nu a mai venit nicio recenzie de peste 3 săptămâni, poate exista o cădere de vizibilitate locală. Neverificabil de aici.
4. **Rată de răspuns la recenzii** (proprietar răspunde?) — neverificabil de aici.
5. **Website + telefon afișate în profil** — trebuie să fie identice cu `https://eghiseul.ro/` și `+40 757 708 181`.
6. **Program afișat** — comparați cu cele DOUĂ variante diferite găsite pe site (§2).
7. **Poze, postări (Posts), Q&A, atribute** ("online", "identity verified" etc.) — niciunul verificabil automat; recomand completare dacă lipsesc, în ordinea de impact de la §5.

## 2. Consistență NAP — surse din site (comparate direct în cod)

| Câmp | `src/lib/seo/constants.ts` (`ORGANIZATION`) | Homepage schema (`homepage-schema.ts`) | `organizationNode()` (`schema.ts`, folosit pe `/contact/` și paginile de servicii) | Footer (`footer.tsx`) | `/contact/` (page.tsx) | GBP |
|---|---|---|---|---|---|---|
| Nume | eGhișeul.ro | idem | idem | eGhișeul.ro | eGhișeul.ro | neverificat |
| Telefon | +40-757-708-181 | (via contactPoint) | +40-757-708-181 | +40 757 708 181 | +40 757 708 181 | neverificat |
| Email | contact@eghiseul.ro | contact@eghiseul.ro | **absent** | contact@eghiseul.ro | contact@eghiseul.ro | neverificat |
| Adresă | Str. Salcâmilor nr. 2, Com. Odoreu, Jud. Satu Mare | idem (PostalAddress complet) | **absent** | idem (text simplu) | idem (text simplu) | neverificat |
| Program | — | — | — | „L-V: 08:00–16:00" | „L-J: 08:00–16:00, V: 08:00–15:00" | neverificat |

Telefonul și numele sunt **perfect consistente** peste tot unde apar — bine.

**Discrepanță reală #1 (Medium):** `organizationNode()` din `src/lib/seo/schema.ts:55-72` (folosit pe `/contact/` și pe toate paginile `/servicii/*`) NU include `address` și NU include `email`, spre deosebire de nodul `Organization` inline din `homepage-schema.ts:29-64`. Ambele folosesc același `@id` (`${BASE_URL}/#organization`), dar cu seturi diferite de proprietăți în funcție de pagina pe care o crawlează Google — nu e o contradicție (doar incompletitudine), dar slăbește semnalul de entitate consistentă în afara homepage-ului. Fix: adaugă `address` + `email` și în `organizationNode()`.

**Discrepanță reală #2 (Medium):** programul de lucru diferă între footer (`L-V: 08:00–16:00`, uniform) și `/contact/` (`Luni–Joi 08:00–16:00`, dar `Vineri 08:00–15:00`) — `src/components/home/footer.tsx:188` vs `src/app/contact/page.tsx:110-112`. Nu există `openingHoursSpecification` nicăieri în schema (grep confirmă) — deci diferența nu ajunge în JSON-LD, dar rămâne o inconsistență vizibilă utilizatorului și, dacă profilul GBP are o a treia variantă, un NAP-hours mismatch pe 3 surse. Fix: o singură sursă de adevăr (constantă în `constants.ts`) consumată de ambele componente.

**Adresa fizică** (Odoreu, Satu Mare) e adresa înregistrată a `eDigitalizare SRL`, nu un sediu vizitabil — corect etichetată „Date firmă"/date de subsol legal, nu ca invitație de vizitare. Nu recomand optimizare NAP suplimentară pe acest punct (SAB, nu brick-and-mortar).

## 3. Schema `Organization` — ce are, ce lipsește

Din `src/lib/seo/homepage-schema.ts` (nodul complet, homepage):
- ARE: `name`, `legalName`, `url`, `logo`, `image`, `description`, `vatID`/`taxID`/`identifier` (CUI + Reg. Com.), `address` (PostalAddress complet), `areaServed` (Country RO), `contactPoint` (telephone + email + contactType + areaServed + availableLanguage).
- **`sameAs`: un singur link** — `https://share.google/stngA2rQbVPY2l57p` (comentat în cod ca „Google Business Profile (recenzii)"). Zero alte rețele (Facebook, LinkedIn, Instagram, Trustpilot etc.).
- LIPSEȘTE intenționat `aggregateRating` pe Organization — decizie corectă documentată în cod (`homepage-schema.ts:60-63`, evită flag GSC din 13.07.2026 pentru „self-serving rating").
- LIPSEȘTE `openingHoursSpecification` peste tot (confirmat grep) — pentru un SAB nu e critic, dar dacă există ore de suport diferite ar putea fi utilă ca proprietate `ContactPoint`, nu `LocalBusiness`.

**Risc de verificat manual**: link-ul `sameAs` e un short-link `share.google/...` (redirect), nu URL-ul stabil de Maps place. La încercarea automată de rezolvare a redirectului, ținta finală a fost neașteptată/ambiguă (`google.com/share.google?q=...`, nu un URL de profil direct) — recomand ca Raul să deschidă manual acest link într-un browser normal și să confirme că duce direct la profilul corect, nu la o pagină de căutare generică. Short-link-urile `share.google` pot expira sau pot fi regenerate — dacă e posibil, înlocuiți cu URL-ul canonic de Maps (`.../maps/place/?q=place_id:...`) pentru un `sameAs` mai stabil.

## 4. Recenzii — ce arată SITE-UL (nota din context: cifrele sunt reale, culese manual din Google, nu fabricate)

Chiar dacă sursa e reală, cifrele **nu sunt sincronizate nici măcar între ele, în cod**:

| Locație în cod | Notă | Nr. recenzii |
|---|---|---|
| `src/components/home/social-proof-section.tsx:17-21` | 4.9/5 | „Peste 450 recenzii" (text literal) |
| `src/components/home/testimonials-section.tsx:6-8` | `${GOOGLE_RATING}/5` (din config, presupus 4.9 — neconfirmat exact) | „400+" (text literal, separat de config) |
| `src/components/home/footer.tsx:212` | „4.9/5" (hardcodat) | — (nu afișează un număr) |
| Schema `AggregateRating` (Product) pe ≥27 pagini de servicii (deja documentat în `findings/schema.md`) | 4.9 | 450 |

→ **450 vs 400+ e o inconsistență ON-SITE**, independentă de ce arată profilul real. Cel puțin una dintre cifre e depășită. Cum recenziile reale cresc în timp (profilul e activ), cifrele hardcodate manual în minim 4 fișiere + 27 pagini de schema se vor decala constant dacă nu există o singură sursă actualizată periodic.

**Recomandare concretă**: o singură constantă (`GOOGLE_RATING`, `GOOGLE_REVIEW_COUNT`) în `src/config/contact.ts`, consumată de toate cele 3 componente + de schema generator, actualizată manual la un interval fix (ex. lunar) după verificare în profilul real. Nu rezolvă riscul „structured markup spam" deja semnalat în `findings/schema.md` (rating identic pe 27+ pagini de servicii diferite arată la fel indiferent dacă cifra e reală sau nu — Google nu poate distinge din markup singur că 4.9/450 e recenzia AGREGATĂ a companiei, nu a fiecărui serviciu în parte); recomand în continuare fie `Review`-uri individuale, fie mutarea `AggregateRating` pe entitatea `Organization`/profilul real, nu pe fiecare `Product` de serviciu.

**Recență/velocitate reală, rată de răspuns**: neverificat (necesită acces la profil, §1).

## 5. Citații Tier 1 (Yelp, BBB)

**Nu am verificat live** (fetch blocat, vezi §1) — dar notez explicit: Yelp și BBB sunt directoare centrate pe SUA/brick-and-mortar; pentru un SAB românesc relevanța lor e aproape nulă. Nu recomand timp investit acolo. Dacă se dorește totuși semnal de citare, echivalentele relevante pentru RO ar fi listafirme.ro/firme.info (date deja publice din Reg. Com.) sau Trustpilot — dar **nu am verificat prezența pe niciunul dintre ele** (neverificat, fetch extern blocat în această sesiune).

## 6. Recomandări prioritizate (impact descrescător)

1. **[Critical, cross-cutting cu audit schema]** `AggregateRating` 4.9/450 identic pe 27+ pagini `/servicii/*` — chiar dacă cifra-sursă e reală, markup-ul identic repetat pe zeci de entități `Product` diferite arată ca spam pentru Google. Fix propus deja în `findings/schema.md`: mutați ratingul pe Organization/profil, sau adăugați `Review`-uri individuale reale.
2. **[High]** Verificare manuală profil GBP (categoria principală, poze, Q&A, postări, atribute) — §1, listă exactă de verificat mai sus. Categoria greșită = factor negativ #1 per Whitespark 2026.
3. **[Medium]** Unificați cifra de recenzii (450 vs 400+) într-o singură sursă (`src/config/contact.ts`), refolosită de footer, social-proof, testimonials și schema.
4. **[Medium]** Adăugați `address` + `email` în `organizationNode()` (`src/lib/seo/schema.ts:55-72`), ca să fie identic cu nodul Organization de pe homepage.
5. **[Medium]** Unificați programul de lucru (footer vs `/contact/`) într-o singură constantă.
6. **[Low]** Confirmați manual că `sameAs` (`share.google/stngA2rQbVPY2l57p`) rezolvă corect la profilul GBP; luați în calcul înlocuirea cu URL-ul stabil de Maps place.
7. **[Low]** Adăugați `sameAs` suplimentare dacă există prezențe reale pe alte rețele (nu inventați profiluri doar pentru schema).
8. **[Info]** Nu investiți în Yelp/BBB — irelevante pentru profilul nostru de SAB românesc.
9. **[Info]** Nu urmăriți tactici de „lângă mine"/map-pack local — proximitatea nu se aplică unui serviciu 100% online la nivel național.

## Limitări

Nu am putut accesa datele reale din interiorul Knowledge Panel/GBP (categorie, poze, Q&A, postări, recenzii individuale, rată de răspuns) — Google blochează accesul automatizat (consimțământ + JS-wall + anti-bot). Nu am verificat citații pe directoare externe (Trustpilot, listafirme.ro). Nu am verificat restul celor ~223 pagini din sitemap pentru consistență NAP (am verificat footer, `/contact/`, homepage schema, `organizationNode()`).

---

## Rezumat (max 15 rânduri)

Model corect identificat: **SAB/brand online național**, fără vitrină — zero Maps embed în cod, adresa e doar date fiscale, nu invitație de vizitare; nu recomand tactici de map-pack. **Nu am putut extrage date reale din profilul GBP** (`kgmid=/g/11vrl4dvnf`) — Google a blocat toate cele 5 încercări (WebFetch, Playwright, curl cu cookie de consimțământ) cu perete de consimțământ → JS-wall → pagină anti-bot; categoria principală, pozele, Q&A, postările și rata de răspuns la recenzii rămân **neverificate**, cu listă exactă de verificat manual în raport.

NAP pe site: telefon și nume **consistente** peste tot. Două inconsistențe reale găsite în cod: (1) `organizationNode()` din `schema.ts` (folosit pe `/contact/` și paginile de servicii) omite `address`/`email` față de nodul Organization complet de pe homepage; (2) programul de lucru diferă între footer („L-V 08:00–16:00") și `/contact/` („L-J 08:00–16:00, V 08:00–15:00") — niciuna nu ajunge în schema (`openingHoursSpecification` absent peste tot).

Recenziile 4.9/450 sunt reale (confirmat de proprietar), dar chiar și ON-SITE cifra nu e sincronizată: „450" în social-proof vs „400+" în testimonials — semn că cel puțin o valoare e deja depășită. Recomand o singură sursă de adevăr pentru rating/recenzii, plus (redundant cu audit schema) mutarea `AggregateRating` de pe cele 27+ pagini `Product` identice, care rămâne cel mai mare risc real (acțiune manuală pentru markup spam), indiferent de veridicitatea cifrei-sursă.

`sameAs` conține un singur link către GBP, printr-un short-link `share.google` — de verificat manual că rezolvă corect. Yelp/BBB irelevante pentru acest profil; nu au fost verificate și nu le recomand.
