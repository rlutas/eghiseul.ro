# cazierfiscal.com: al treilea brand, doar cazier fiscal

**Stare (11.11.2026):** LIVE din 10.11.2026. GA4 propriu activ din 11.11. Rețeta, ca s-o repetăm pentru alte servicii: [`../seo/playbook-site-de-nisa-un-serviciu.md`](../seo/playbook-site-de-nisa-un-serviciu.md).

## De ce

Raul a decis pe 10.11.2026, după ce a văzut cazierauto.ro peste noi pe „cazier auto”. cazierauto.ro e un site mic cu un singur subiect: domeniu înregistrat pe 12.11.2025, live din iunie 2026, 8 pagini.

Pe căutările de cazier fiscal (GSC, 11.10–08.11.2026):

| Căutare | Afișări | CJO | eghiseul |
|---|---|---|---|
| cazier fiscal online | 1.730 | poz. 7,1 | poz. 61 |
| cazier fiscal | 983 | poz. 7,5 | poz. 11,5 (2 afișări) |
| cazier fiscal persoana fizica | 666 | poz. 9,0 | poz. 69 |
| anaf cazier fiscal online | 364 | poz. 7,4 | – |

Paginile de fiscal de pe CJO rămân. A decis Raul: le păstrăm până crește site-ul nou.

## Ce este

Același repo, același deploy Vercel, aceeași bază de date, același admin, același Stripe și aceeași avocată ca eghiseul.ro și documentero.ro. Mecanismul e cel din [`../technical/specs/multi-brand.md`](../technical/specs/multi-brand.md):

- brandul `cazierfiscal` în `src/lib/brand/brands.ts`, domeniul `cazierfiscal.com`, vinde doar `cazier-fiscal`;
- hostul e rescris spre `src/app/cazierfiscal/` (`next.config.ts`), iar calea internă dă 404 (`src/proxy.ts`);
- wizardul, plata, statusul și contul sunt partajate, cu header și paletă proprii;
- comenzile primesc `orders.platform = 'cazierfiscal'` (migrarea 204), iar în admin au filtru și badge „cazier-fiscal”;
- numerele din registrul Baroului se alocă pe platforma `eghiseul`, aceeași firmă și același Stripe; decontul avocatei le pune tot la eghiseul;
- designul refolosește componentele documentero (tokenii `d-*`); paleta e vinete `#2A1438` și coral `#FF8A5B`, în `globals.css` sub `[data-brand="cazierfiscal"]`.

## Pagini la lansare

`/` (pagina serviciului), `/despre/`, `/contact/`, `/ghiduri/` (gol la început), cele 4 pagini legale, `robots.txt`, `sitemap.xml`, `llms.txt`. Totul e `noindex` până când `CAZIERFISCAL_INDEXABLE = true` în `src/config/cazierfiscal-nav.ts`.

Reguli: [`../../.claude/rules/content-and-seo.md`](../../.claude/rules/content-and-seo.md). Maximum un ghid nou pe săptămână. Fără date inventate (fără „3.500 de comenzi” sau rating fără sursă). Fără FAQPage nou.

## Brand separat de eghiseul (decizie 10.11.2026)

Raul a cerut ca site-ul să stea ca brand propriu. Paginile cazierfiscal.com nu mai trimit spre eghiseul.ro: fără „parte din grupul eghiseul.ro” în footer, fără recenziile eghiseul pe pagina Despre, fără `parentOrganization` și `sameAs` în schema. Footerul eghiseul nu mai are link spre cazierfiscal.com. Descoperirea se face prin sitemap-ul trimis în Search Console și prin IndexNow.

Ce rămâne, pentru că e obligatoriu: firma (eDigitalizare SRL, CUI, adresă), ANPC/SOL și avocata care depune cererea. Google poate lega oricum site-urile prin firmă, hosting și contul Search Console. Asta nu e o penalizare. Penalizarea vine din conținut de șablon și rețele de pagini-doorway, nu din proprietar comun.

## Pași pentru lansare

1. ✅ **Migrarea 204** aplicată pe 10.11.2026. Fără ea, comanda de pe hostul nou cade la constrângerea `orders_platform_check`.
2. ✅ **Domeniul:** `cazierfiscal.com` e cumpărat în Vercel (DNS pe Vercel). `cazierfiscal.com` și `www.cazierfiscal.com` sunt în proiectul `eghiseul-ro`.
3. **Resend:** blocat, planul Resend a atins limita de domenii. După upgrade: se verifică `cazierfiscal.com` și se adaugă în `RESEND_VERIFIED_DOMAINS`. Până atunci emailurile pleacă de pe adresa eghiseul (fallback automat).
4. ✅ **Search Console:** proprietatea Domain `sc-domain:cazierfiscal.com` e verificată prin TXT; contul de serviciu claude-seo e owner.
5. Merge pe `main` (`CAZIERFISCAL_INDEXABLE` e deja `true`), apoi trimiterea sitemap-ului și IndexNow (cheia e în `src/lib/seo/indexnow.ts`).
6. **Opțional:** stream GA4 propriu (`NEXT_PUBLIC_GA_MEASUREMENT_ID_CAZIERFISCAL`). Până atunci datele intră în streamul eghiseul, filtrabil pe hostname.

## Ce urmărim

- **Săptămâna 1–2:** indexarea paginii principale (GSC → Inspectare URL).
- **Săptămâna 3–6:** afișări pe „cazier fiscal online” și „cazier fiscal persoana fizica”. Pozițiile vin după afișări.
- **Comenzi** cu badge „cazier-fiscal” în admin. Le comparăm cu comenzile de fiscal de pe CJO, ca să vedem dacă se mută comenzi sau se adaugă.


## Audit SEO și curățenie, 10.11.2026 (după lansare)

Auditul `/seo` (tehnic, conținut, schema, performanță, SERP) a dat: Lighthouse mobil 98/96/100/100, LCP 1,1 s, CLS 0. Ce am reparat în aceeași zi:

- **Urme eghiseul în HTML:** pagina 404 și wizardul aveau canonical `https://eghiseul.ro/`, autor „eGhiseul.ro” și codul de verificare Search Console al eghiseul. Acum 404-ul are pagina lui (`src/app/cazierfiscal/not-found.tsx` + catch-all), iar layout-urile suprascriu `alternates`, `verification`, `authors`.
- **404-ul rădăcină** (`src/app/not-found.tsx`) e acum neutru, fără footerul eghiseul: arborele lui intră în payload-ul RSC al fiecărei pagini, pe orice host, așa că linkurile spre ecazier/documentero apăreau și în HTML-ul cazierfiscal.com.
- **Email:** `contact@eghiseul.ro` nu mai apare nicăieri pe site. Contactul trece prin formularul de pe `/contact/`, care trimite tot în căsuța eghiseul.
- **GA:** nu mai cade pe streamul eghiseul. Fără `NEXT_PUBLIC_GA_MEASUREMENT_ID_CAZIERFISCAL`, site-ul nu încarcă GA deloc. Pixelii OpenAI și Meta (conturile eghiseul) nu se încarcă pe cazierfiscal.com.
- **Hero:** fără eticheta de deasupra H1; pe mobil ordinea e H1, cardul de preț cu butonul, apoi textul și bifele. Animațiile de apariție sunt oprite pe acest brand (pagina „apărea și dispărea” pe telefon).
- **Conținut:** secțiune „Cazier fiscal fără SPV” pe pagina principală și primele două ghiduri: `/ghiduri/cazier-fiscal-din-spv/` și `/ghiduri/cazier-fiscal-din-strainatate/`. Autorul articolelor e brandul (autorul global al site-urilor are pagina pe eghiseul.ro).
- **Schema:** `Offer` simplu în loc de `AggregateOffer` cu un singur preț.

### Ce rămâne (de făcut de Raul)

1. ✅ **GA4 propriu (11.11.2026):** cont GA „cazierfiscal” pe login-ul serviciiseonethut (decizia lui Raul), proprietatea `cazierfiscal.com` (RON, ora României), fluxul web `G-DGW62V4WXX`, pus în Vercel ca `NEXT_PUBLIC_GA_MEASUREMENT_ID_CAZIERFISCAL`.
2. **Google Ads:** Raul face un cont Ads nou, separat; apoi eticheta de conversie proprie, apoi `NEXT_PUBLIC_GOOGLE_ADS_ID_CAZIERFISCAL` și `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL_CAZIERFISCAL` în Vercel. Fără ele nu se măsoară conversiile din reclame.
3. ✅ **Search Console în contul lui Raul:** proprietatea Domain `cazierfiscal.com` e verificată și în contul lui (TXT propriu în Vercel DNS, 10.11.2026), pe lângă contul de serviciu.
4. **Urme care rămân:** telefonul (+40 757 708 181) e același cu eghiseul; firma, CUI-ul și ANPC sunt obligatorii; codul JS conține configurația tuturor brandurilor (vizibilă doar citind bundle-ul); emailurile tranzacționale pleacă de pe eghiseul până la upgrade Resend.
5. **Ghiduri:** cel mult 1–2 pe săptămână (regula 2 din content-and-seo). Următoarele candidate: diferența cazier fiscal / atestare fiscală, cazier fiscal pentru angajare.


## 11.11.2026: separare completă, favicon, ghiduri verificate, cuvinte cheie

**Footer și contact.** Footerul nu mai are firma, CUI-ul, adresa și „Telefonul Consumatorului”; rămân pictogramele ANPC SAL/SOL, disclosure-ul de neafiliere și un link „Datele firmei” spre T&C. Telefonul și WhatsApp-ul (linie comună cu eghiseul) au ieșit de pe toate paginile publice și din schema; contactul trece doar prin formular. În wizard (blocat în robots.txt) cardul de ajutor rămâne.

**Favicon.** `/comanda/cazier-fiscal/` și cererile directe la `/icon.png` primeau scutul eghiseul. Iconițele stau acum în `public/images/cazierfiscal/` și sunt servite pe host prin rewrite (`/icon.png`, `/apple-icon.png`, `/apple-touch-icon(-precomposed).png`, `/favicon.ico`). Google poate avea nevoie de câteva zile ca să schimbe iconița din rezultate.

**Ghiduri.** Design nou: „Pe scurt” cu bife, cuprins cu ancore, timp de citire, „Citește și” automat, surse emise ca `Article.citation`. Faptele recitite pe OG 39/2015 (consolidat 08.11.2025), OPANAF 2594/2015 + 2048/2023 și Codul de procedură fiscală; corecturile sunt în playbook, secțiunea 6.

**Cuvinte cheie.** Date în [`cuvinte-cheie-2026-11/`](cuvinte-cheie-2026-11/): cerere estimată din GSC (eghiseul mai–iul 2026 + CJO ultimele 76 de zile, poziții 5–9), 273 sugestii Autocomplete, Keyword Planner (intervale). Pe scurt:

| Grup | Cerere / lună (estimat) | Unde |
|---|---|---|
| cazier fiscal online, cazier fiscal, persoană fizică, certificat de cazier fiscal, eliberare, cerere, acte, de unde se scoate, cazier financiar | ~4–5k | pagina principală (title, H1, H2, FAQ) |
| SPV / ANAF online | ~300 | `/ghiduri/cazier-fiscal-din-spv/` |
| străinătate, în engleză, traducere, apostilă | < 30, intenție mare | `/ghiduri/cazier-fiscal-din-strainatate/` |
| valabilitate + ce conține + ștergere | ~350 | ghid nou (după 17.11) |
| ce este / verificare / cazier fiscal vs certificat fiscal | ~380 | ghid nou sau unit cu cel de mai sus |
| administrator firmă, PFA, înființare | ~100–150 | ghid nou |
| orașe, sectoare, „certificat fiscal” (primărie), persoane juridice | — | NU |

Sezonalitate: sep–dec e de 5–9× vara (clicurile eghiseul, oct 2025 vs mai–iul 2026).

**Următoarele ghiduri, câte unul pe săptămână, de la 17.11:** valabilitate și ce conține cazierul fiscal → cazier fiscal pentru administrator / PFA → ce este cazierul fiscal și cum nu-l confunzi cu certificatul fiscal. Fiecare intră în `CAZIERFISCAL_GUIDES`, deci primește automat linkuri din footer, hub, sitemap și „Citește și”.
