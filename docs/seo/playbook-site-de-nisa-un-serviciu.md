# Playbook: site de nișă pe un singur serviciu

Rețeta după care am construit cazierfiscal.com (10–11.11.2026). Se repetă pentru orice alt serviciu care primește site propriu, pe același backend. Exemplul concret, cu toate deciziile, e în [`../cazier-fiscal/README.md`](../cazier-fiscal/README.md).

Regulile de conținut din [`../../.claude/rules/content-and-seo.md`](../../.claude/rules/content-and-seo.md) se aplică integral. Acest document e ordinea pașilor și capcanele găsite pe drum.

## 0. Când merită

- Serviciul are cerere măsurabilă în GSC (eghiseul, CJO sau ecazier) de cel puțin câteva sute de afișări pe lună pe interogarea principală.
- Instituția îl eliberează la nivel național, deci UN site și O pagină de bani acoperă tot. Fără pagini de oraș (vezi regula 1 din content-and-seo).
- Există un concurent mic, pe domeniu exact, care rankează (pentru cazier fiscal: cazierauto.ro pe cazier auto). Asta arată că tiparul funcționează în nișă.

## 1. Tehnic: brand nou pe același deploy

Mecanismul e în [`../technical/specs/multi-brand.md`](../technical/specs/multi-brand.md). Lista de verificare:

1. Brand în `src/lib/brand/brands.ts` (domeniu, `serviceSlugs`, culori pentru email).
2. Hosturi în `next.config.ts` + rewrite pe host spre `src/app/<brand>/`; calea internă refuzată în `src/proxy.ts`.
3. Migrare care permite noul `orders.platform`; filtru și badge în admin.
4. Domeniul în Vercel, `www` → apex 308.
5. **Iconițe pe host** (bug 11.11.2026): rewrite pe host pentru `/favicon.ico`, `/icon.png`, `/apple-icon.png`, `/apple-touch-icon.png`, `/apple-touch-icon-precomposed.png` spre `public/images/<brand>/`. Fără ele, wizardul partajat și cererile directe primesc iconița eghiseul. Nu pune `icon.png` în folderul de rută al brandului: generează un link `/<brand>/icon.png`, cu calea internă.
6. Layout-ul brandului suprascrie `alternates`, `verification`, `authors`, `openGraph`, `twitter` (altfel moștenește canonical-ul și codul GSC eghiseul).
7. `not-found.tsx` propriu + catch-all; `src/app/not-found.tsx` rămâne neutru (arborele lui intră în payload-ul RSC al oricărei pagini).

## 2. Fără legături cu eghiseul

Decizia lui Raul: site-ul nu trebuie să pară legat de eghiseul, nici pentru Google, nici pentru client.

| Element | Ce facem |
|---|---|
| Linkuri eghiseul ↔ brand nou | niciunul, în nicio direcție |
| Schema | fără `parentOrganization`, `sameAs`, autor persoană de pe eghiseul; autorul articolelor e brandul |
| Footer | fără date de firmă și fără „Telefonul Consumatorului”; rămân pictogramele ANPC SAL/SOL, disclosure-ul de neafiliere și linkul „Datele firmei” spre T&C |
| Datele firmei (nume, CUI, adresă) | doar în T&C, confidențialitate, contact și despre (obligatorii legal) |
| Telefon / WhatsApp | scoase de pe paginile publice (linia e comună cu eghiseul); contact doar prin formular. În wizard (blocat în robots.txt) rămân |
| Email | niciun email afișat; formularul livrează în căsuța eghiseul |
| GA4 | cont GA nou (nu proprietate în contul eghiseul), ID în `NEXT_PUBLIC_GA_MEASUREMENT_ID_<BRAND>` |
| Pixeli Meta / OpenAI eghiseul | nu se încarcă pe host |
| Google Ads | cont nou, separat (în lucru pentru cazierfiscal) |
| Search Console | proprietate Domain, verificare prin TXT în contul lui Raul + contul de serviciu claude-seo |

Ce rămâne comun și nu se poate ascunde: firma din T&C, hostingul, backend-ul. Nu e penalizare; penalizarea vine din șabloane și doorway, nu din proprietar comun.

## 3. Cercetarea de cuvinte cheie

Surse, în ordinea încrederii:

1. **GSC al site-urilor surori** (contul de serviciu, `gsc_query.py`). Interogările pe care eghiseul/CJO au stat pe poziții 5–9 dau o estimare bună a cererii lunare (afișări / lună). Atenție: GSC semnalează afișări umflate între 13.05.2025 și 27.04.2026; folosește ferestre curate.
2. **Keyword Planner** (contul Ads eGhiseul 677-995-5005, login eghiseul@gmail). Fără campanii active dă doar intervale (10–100, 100–1K, 1K–10K), dar confirmă ordinul de mărime și dă idei noi.
3. **Autocomplete Google RO**: `docs/seo/autocomplete-2026-08-07/suggest.sh "<seed>"`, cu seed + fiecare literă a–z.
4. **„Alții caută și”** din SERP (captură manuală).
5. DataForSEO nu e configurat; nu e nevoie.

Apoi grupezi pe intenții și fiecare grup primește UN loc:

- **pagina de bani** ia ~60% din cerere: interogarea principală + variantele tranzacționale (online, persoană fizică, eliberare, certificat, cerere, acte, preț, durată, „de unde se scoate”). Toate apar verbatim în title, H1, H2-uri sau FAQ;
- **ghiduri** doar pentru intențiile informaționale cu cerere proprie și conținut care nu e deja pe pagina de bani (SPV, străinătate, valabilitate, ce conține, pentru administrator);
- **niciodată**: orașe, sectoare, cazuri de folosire care ar fi 80% aceeași pagină („pentru angajare”, „pentru credit”) → acestea devin un H2 pe pagina de bani.

Capcane găsite la cazier fiscal: „certificat fiscal” (~660/lună) e alt act (primărie), 0 clicuri; „ghiseul.ro cazier fiscal” și „hub mai” sunt confuzii de portal, se răspund onest într-un FAQ; „gratuit” se spune clar lângă preț, nu în title.

Datele brute pentru cazier fiscal: [`../cazier-fiscal/cuvinte-cheie-2026-11/`](../cazier-fiscal/cuvinte-cheie-2026-11/).

## 4. Structura site-ului

```
/                     pagina de bani (exact-match title + H1), FAQ vizibil, surse oficiale
/ghiduri/             hub, citește CAZIER..._GUIDES
/ghiduri/<slug>/      max 1–2 pe săptămână
/despre/  /contact/   + 4 pagini legale
sitemap.xml, robots.txt, llms.txt, IndexNow
```

Lista de ghiduri trăiește într-un singur loc (`src/config/<brand>-nav.ts`): footerul, hub-ul, sitemap-ul și blocul „Citește și” o citesc de acolo. Un ghid nou intră în listă doar când pagina există.

**Coada de ghiduri.** Ghidurile se scriu în avans, dar ies câte unul pe săptămână. Fiecare intrare din listă are `published` (și `planned`, data din coadă). Cu `published: false` pagina dă 404 în producție, lipsește din meniu, hub, sitemap, llms.txt și „Citește și”, dar se vede în `next dev`. Linkurile din corp spre alt ghid se fac cu `GuideLink`, care randează text simplu până când ținta e publicată. Publicarea = `published: true` + datele din pagină + deploy + IndexNow.

## 5. Șablonul de ghid

Componenta `src/components/cazierfiscal/guide.tsx` (copiaz-o pentru brandul nou). Ordinea, preluată de la cazierauto.ro + digigov.ro:

1. breadcrumb → H1 → lead de 2–3 propoziții care răspunde direct;
2. „Actualizat la <dată completă> · N minute de citit”;
3. **caseta „Pe scurt”**: 3–5 bife, fiecare un răspuns complet (nu teaser), cu articolul de lege unde există;
4. „În acest ghid”: cuprins cu ancore pe fiecare H2 (`<h2 id>`);
5. corpul;
6. caseta de comandă, cu ruta gratuită spusă onest în text;
7. **„Citește și”**: pagina de bani + toate celelalte ghiduri (automat);
8. „Surse oficiale”, emise și în schema `Article.citation`.

Fără FAQPage nou în schema; FAQ-ul vizibil rămâne. Fără autor persoană dacă persoana nu are pagină pe site. Recenzor (ex. avocata) doar dacă chiar a citit textul și are pagină proprie.

## 6. Verificarea faptelor, înainte de publicare

Textul se trece întâi prin skill-ul `/humanizer` (fără liniuțe lungi, fără triade forțate, fără vocabular de AI, ritm variat), apoi prin verificarea juridică de mai jos.

Fiecare afirmație juridică se verifică pe textul consolidat (legislatie.just.ro), cu articol și alineat, de un agent separat de cel care a scris textul. La cazier fiscal, verificarea din 11.11 a corectat:

- „se eliberează pe loc” → legea spune „de îndată” (art. 9 alin. 8);
- avocatul nu e numit în OG 39/2015; vine prin Codul de procedură fiscală, art. 18 alin. 3;
- „cetățean străin → ajunge o declarație” era prea larg: doar persoane străine neînregistrate fiscal, doar la Registrul Comerțului (art. 8 alin. 4);
- ce se înscrie în cazier: lista din art. 4, inclusiv răspunderea solidară, nu „inactivitatea” vag.

## 7. Linkuri interne

- meniul și footerul ating toate paginile;
- pagina de bani linkează fiecare ghid în context (cardurile din secțiunea „fără SPV”);
- fiecare ghid linkează pagina de bani în corp (ancoră descriptivă) și în „Citește și”, plus celelalte ghiduri;
- fără `<select>` + `router.push()` ca navigare (nu e link pentru crawler);
- ancore variate, descriptive; niciodată doar „aici”.

## 8. Lansare și urmărire

1. Merge pe `main` + push (deploy Vercel).
2. Sitemap trimis în GSC, IndexNow pentru URL-urile noi.
3. Săptămâna 1–2: indexarea paginii principale (Inspectare URL).
4. Săptămâna 3–6: afișări pe interogarea principală; pozițiile vin după.
5. Comenzile apar în admin cu badge-ul brandului; compară cu comenzile aceluiași serviciu de pe CJO/eghiseul.
6. Sezonalitate: la cazier fiscal sep–dec e de 5–9× vara. Nu trage concluzii din vară.
