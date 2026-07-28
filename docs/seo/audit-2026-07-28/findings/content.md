# Content Quality & E-E-A-T — eghiseul.ro (28.07.2026)

Metodologie: `content_quality.py` (scor QRG sept. 2025) rulat pe `extracted_text` (trafilatura, fără navigare/footer) obținut prin `render_page.py --mode auto`, plus inspecție directă a textului și a HTML brut (schema JSON-LD, footer, sitemap) pentru semnale E-E-A-T. Toate cifrele de mai jos sunt verificate cu tool-urile; ce n-am apucat să verific vizual e marcat explicit „neverificat".

## 1. Scoruri QRG per pagină (content_quality.py)

| Pagină | Overall | Filler | AI-pattern | Densitate info | Repetiție | Tokeni | Flags |
|---|---|---|---|---|---|---|---|
| /servicii/cazier-auto-online/ | 78/100 | 0 | 0 | 0,32 | 31 | 1902 | repetitive |
| /servicii/eliberare-certificat-de-nastere/ | 77/100 | 0 | 0 | 0,24 | 25 | 1896 | — |
| /servicii/extras-de-carte-funciara/ | 78/100 | 0 | 0 | 0,24 | 23 | 2479 | — |
| /calculator/varsta-pensionare/ | 89/100 | 0 | 0 | 0,79 | 20 | 701 | — |
| /tools/verificare-rovinieta-online/ | 89/100 | 0 | 0 | 0,85 | 10 | 426 | — |
| /ancpi-nu-functioneaza/ | 80/100 | 0 | 0 | 0,34 | 22 | 2410 | — |
| Homepage | 81/100 | 0 | 0 | 0,33 | 14 | 966 | — |

**Verdict clar: conținutul NU e problema QRG clasică.** Zero filler, zero pattern AI generic ("delve into", "in today's landscape" etc.) pe toate cele 7 pagini, densitate informațională peste medie. Deci cauzele non-conversiei/non-traficului sunt structurale (linking, E-E-A-T, arhitectură), nu "text slab scris de AI" — nu contrazice ipoteza de business, o rafinează.

Prag QRG cuvinte minime: paginile de servicii (min. 800) trec confortabil (1896-2479 tokeni); pagina ANCPI (blog, min. 1500) trece (2410); homepage (min. 500) trece (966). Paginile-tool nu au un minim QRG explicit (sunt utilitare, nu articole) — 426-701 tokeni de text suport în jurul widget-ului e rezonabil pentru acest tip de pagină.

## 2. E-E-A-T — găsiri, severitate, dovadă, fix

### CRITICAL — Avocatul colaborator e menționat de 10+ ori dar niciodată nominalizat
**Dovadă:** pe toate cele 3 pagini de servicii + homepage apare formula identică „Avocatul nostru colaborator, înscris în Barou" (cazier-auto: rândul 3, 74, 105; cert-naștere: rândul 5, 8; homepage: rândul 2, 11, 21, 24). Nicăieri nu apare numele avocatului, numărul de înscriere în Barou, fotografie sau link către o pagină de verificare (ex. portalul Barourilor). Pentru un serviciu care depune cereri oficiale în numele clientului pe bază de împuternicire/mandat și manipulează CNP + acte de identitate, absența identității verificabile a avocatului e cel mai mare gol de Expertise/Trustworthiness din tot site-ul — un rater QRG YMYL ar cere exact acest lucru pentru "who is responsible for this content/service".
**Fix:** adaugă numele avocatului + nr. înscriere Barou (verificabil pe portalul baroului local) într-o secțiune vizibilă (footer sau /despre-noi), consistent pe toate paginile unde apare "avocatul colaborator".

### CRITICAL — Nu există pagină /despre-noi/ (echipă, poveste, credențiale)
**Dovadă:** sitemap.xml (223 URL-uri) conține `/contact/` dar nu conține niciun `despre`, `echipa`, `about`, `team`. Am verificat direct: `curl sitemap.xml | grep -iE 'despre|echipa|about|team'` → doar `totul-despre-cartea-funciara-colectiva` (fals-pozitiv, articol CF, nu pagină de companie).
Pagina `/contact/` conține deja bune semnale de transparență (CUI RO49278701, Reg. Com. J2023001097301, adresă Str. Salcâmilor nr. 2, Odoreu, Satu Mare, program de lucru, disclaimer explicit „nu suntem o instituție de stat și nu suntem afiliați cu portalul guvernamental ghiseul.ro") — dar nu conține echipa, anul înființării ca poveste, sau credențialele avocatului.
**Fix:** pagină nouă /despre-noi/ cu: povestea companiei (din 2023, conform homepage), echipă/fondatori, avocatul colaborator cu nume+Barou, cifre operaționale (200.000 proceduri — vezi risc mai jos), politica de confidențialitate legată explicit. Nu asocia "oficial" cu "documente/acte" în copy (politica Google Ads).

### HIGH — Pagină de serviciu duplicat/orfană, thin, cu bug în titlu: /servicii/rovinieta/
**Dovadă:** sitemap conține DOUĂ pagini de serviciu pentru rovinietă: `/servicii/rovinieta-online/` (titlu "Rovinieta Online 2026 — Cumpără și Plătește în 2 Minute", canonical pe ea însăși, conținut dezvoltat) și `/servicii/rovinieta/` (titlu **"Rovinieta Online Online"** — dublare eronată a cuvântului, canonical tot pe ea însăși — nu redirecționează, nu are noindex). Textul extras de pe `/servicii/rovinieta/` are doar 1171 caractere, boilerplate generic templated ("Încarci documentele... verificarea KYC" — inconsistent cu propria descriere a fluxului, care spune "redirect oficial CNAIR" fără KYC). E o pagină veche, necurățată, care concurează cu pagina reală pe aceleași cuvinte cheie.
**Fix:** 301 de la `/servicii/rovinieta/` către `/servicii/rovinieta-online/`, elimină din sitemap, verifică linkuri interne care încă țintesc varianta veche.

### HIGH — Recenzii fără atribuire verificabilă a recenzentului
**Dovadă:** homepage conține 6 testimoniale text ("Am solicitat actele necesare cu eGhiseul.ro fără să ajung în România...") fără nume, dată sau sursă vizibile în `extracted_text`. Schema JSON-LD conține `AggregateRating` (4.9/5, 450+ recenzii — repetat identic pe toate paginile de servicii) și un singur link `sameAs` către un share Google, dar nu am putut confirma din HTML brut dacă recenziile individuale din pagină au nume/link către profilul Google al recenzentului (trafilatura poate le fi eliminat ca boilerplate). **Neverificat**: necesită inspecție vizuală/DOM a secțiunii "Ce spun clienții" pentru a confirma dacă numele reale + linkuri Google apar în markup dar au fost tăiate de extracție.
**Fix dacă lipsesc:** adaugă nume (prenume + inițială) și link direct la recenzia Google per testimonial — crește Trust și dă AI-overview-urilor o sursă verificabilă de citat.

### MEDIUM — Cifre de autoritate neconsistente/neverificabile
**Dovadă:** homepage: „Peste 200.000 de proceduri gestionate cu succes" și „Peste 150.000 de români ne-au acordat încrederea". Cifrele sunt plauzibile împreună (mai multe comenzi/persoană) dar nu sunt însoțite de nicio sursă, dată de referință sau link de verificare — un semnal de autoritate care nu poate fi verificat independent de un rater sau de un LLM care citează pagina.
**Fix:** adaugă dată de referință ("actualizat iulie 2026") și, ideal, o sursă verificabilă (număr comenzi din admin, ca statistică publică on-brand, nu confidențială).

### LOW — Data de publicare a homepage-ului e un fallback, nu una reală
**Dovadă:** `htmldate` a extras `publication_date: 2026-01-01` pentru homepage — șablon tipic de fallback (1 ianuarie), nu o dată reală de ultima actualizare. Nu e o problemă gravă (homepage nu are nevoie de dată), dar indică lipsa unui semnal `dateModified` explicit în schema paginii — util pentru freshness pe pagini editoriale.
**Neverificat:** dacă alte pagini non-articol au aceeași problemă (nu am verificat sistematic).

## 3. Pozitiv — ce funcționează deja bine (nu recomand schimbare)

- **Transparență preț/termen pe toate cele 3 pagini de servicii**: preț cu TVA afișat explicit, "fără taxe ascunse" repetat, termen de livrare clar (3-5 zile, 7-15 zile, câteva minute), inclusiv tarif diferențiat pentru cazuri speciale (permis emis în străinătate: 350 RON/7-10 zile). Acesta e exact semnalul de Trustworthiness pe care QRG îl cere pentru YMYL.
- **Schema structurată solidă**: Organization, WebSite, BreadcrumbList, Service, Product, Offer/AggregateOffer, AggregateRating, FAQPage cu Question/Answer — pe toate paginile verificate. Foarte bun pentru AI-citation readiness.
- **Pagina `/ancpi-nu-functioneaza/`** (2231 clicuri) e cea mai puternică din audit pentru citare AI: cronologie datată oră-cu-oră, cifre exacte (diferență TVA 48.000-72.000 lei), atribuire explicită a surselor externe (Mediafax, HotNews, Public Record, DNSC) și distincție clară între "poziția oficială ANCPI" și "ce susține atacatorul" — exact tipul de rigoare pe care QRG sept. 2025 îl premiază. **Nu e canibalizare cu pagina de serviciu**: conține deja 2 CTA-uri contextuale distincte către `/servicii/extras-de-carte-funciara/` ("Ai nevoie de extras de carte funciară? Îl scoatem noi, imediat ce revine" + link explicit "Detalii despre serviciu"). Relația articol→serviciu e corectă, nu concurează pe aceleași cuvinte cheie.
- Niciuna din cele 7 pagini nu declanșează flag-urile "thin-content", "filler" sau "ai-patterns" din content_quality.py.

## 4. Întrebarea de business: de ce paginile cu trafic nu convertesc / paginile de servicii n-au trafic

Cauza NU e calitatea textului (secțiunea 1). Cauzele identificate, cu dovadă de conținut/linking:

1. **`/calculator/varsta-pensionare/` (9.592 clicuri) nu are niciun serviciu plătit de conectat.** eGhișeul nu vinde nimic legat de dosarul de pensie — textul menționează generic "serviciile noastre online" fără link contextual către un serviciu relevant (ex. certificat de naștere/căsătorie, adesea necesare la dosarul de pensie). Traficul e structural greu de monetizat direct; soluția e cross-sell către servicii adiacente real relevante pentru un pensionar (acte de stare civilă), nu spre orice serviciu.
2. **`/tools/verificare-rovinieta-online/` (11.309 clicuri) ARE un serviciu-pereche** (`/servicii/rovinieta-online/`), și pagina conține 8 linkuri către el în HTML brut — dar niciunul nu apare în textul principal extras (426 tokeni, zero mențiuni de preț/CTA în conținutul editorial). E posibil ca linkurile fie doar în navigare/footer, nu ca CTA contextual lângă rezultatul verificării. **Neverificat vizual**: recomand o captură random a paginii randate pentru a confirma dacă există un CTA "Cumpără rovinieta în 2 minute" imediat lângă rezultatul de verificare, sau doar în meniu.
3. **Pagina-pereche de serviciu are o problemă reală de duplicare/calitate** (secțiunea 2, HIGH) — chiar dacă utilizatorul dă click din tool spre `/servicii/rovinieta/` (varianta veche), aterizează pe o pagină thin cu titlu buggy, ceea ce ar reduce încrederea/conversia instantaneu.
4. **Paginile de servicii în sine sunt calitativ solide** (scor 77-78/100, preț/termen transparente, FAQ complet) dar au trafic minim (352-633 clicuri) — problema lor nu e conținutul de pe pagină, ci volumul de intrare (nu confirmăm aici cauze tehnice/de linking extern — asta ține de auditul tehnic, nu de conținut).

## 5. Neverificat (necesită verificare suplimentară, nu am inventat)

- Dacă recenziile de pe homepage au nume/link verificabil în DOM (trafilatura poate le fi tăiat).
- Dacă tool-ul rovinietă are un CTA contextual vizual (randat) lângă rezultatul verificării, dincolo de linkurile din navigare.
- Dacă alte pagini (în afara celor 7 auditate) au aceeași dublare de tip `/servicii/rovinieta/` vs `/servicii/rovinieta-online/` — nu am scanat tot sitemap-ul de 223 URL-uri pentru acest pattern.
- `publication_date` fallback pe alte pagini non-articol.
