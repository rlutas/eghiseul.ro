# 02.11.2026 — „Preț final” în loc de „Taxe incluse”, orice primărie din 2024, cazier fiscal fără semnătură calificată
<!-- categorie: seo -->

## Pentru echipă

- Pe paginile unde nu plătim nicio taxă instituției (naștere, căsătorie, celibat, extras multilingv, cazier judiciar, cazier fiscal, certificat de integritate), site-ul nu mai scrie „Taxe incluse”. Scrie „Preț final”. Pe extrasele CF, copiile ANCPI, identificări, certificatul constatator și certificatul de urbanism „Taxe incluse” rămâne, pentru că acolo chiar plătim taxa la OCPI, ONRC sau primărie.
- Dacă un client întreabă ce taxe de stat include prețul la stare civilă, cazier judiciar, cazier fiscal sau integritate: nu există taxă de stat. Plătește serviciul nostru, iar prețul afișat e final.
- Certificatul de integritate nu are taxă la Poliție. Site-ul spunea greșit că „IGPR percepe o taxă oficială”.
- Duplicatul certificatului de naștere sau căsătorie, extrasul multilingv și certificatul de celibat se pot cere, din martie 2024, la orice primărie din țară. Nu mai e nevoie de primăria unde s-a înregistrat actul sau de cea de domiciliu. Pe documentero scria „din 2023”, acum scrie corect „din 2024”.
- Certificatul de celibat e, legal, „adeverința privind statutul civil”, nu un certificat de stare civilă.
- Cazier fiscal: clientul persoană fizică nu are nevoie de semnătură electronică calificată, nici la noi, nici dacă își face singur cont în SPV (intră cu utilizator și parolă). Spuneți așa și la telefon.
- Pe cazierjudiciaronline.com, la străini: pentru cazier e nevoie doar de un act de identitate valabil (pașaport, permis de ședere sau carte de rezidență). Nu se mai cer „6 luni valabilitate” și nici dovada adresei.

---

## Rezumat tehnic

Patru decizii ale lui Raul (02.11.2026), după corecturile de fapte din
[aceeași zi](2026-11-02-fapte-corectate-taxe-anexe.md).

### 1. Insigna „TAXE INCLUSE”

Regula: insigna stă doar unde plătim instituției o taxă de eliberare. Lista
vine din cod și DB, nu ghicită:
- `admin_settings.supplier_tariffs`, categoria `taxa_institutie`: ONRC →
  `certificat-constatator`; ANCPI → `extras-carte-funciara`, `extras-cf-colectiv`,
  `extras-plan-cadastral`, `identificare-imobil`, `identificare-imobile-proprietar`,
  `certificat-sarcini`, `certificat-detineri-imobile`, toate `copie-*`,
  `plan-amplasament-delimitare`;
- `services.processing_config.ancpi_cost_ron`: are valoare și la
  `actualizare-adresa-cf` (60);
- `order_supplier_costs` (taxe înregistrate efectiv): extras CF 192, constatator 80,
  identificare 21, plan cadastral 17 etc.;
- `certificat-urbanism-informare`: pagina descrie plata taxei locale de eliberare
  la primărie (taxă reală, rămâne).

Fără taxă instituțională (fără `taxa_institutie`, fără `ancpi_cost_ron`):
naștere, căsătorie, celibat, extrase multilingve, cazier judiciar PF/PJ, cazier
fiscal, integritate, cazier auto.

| Pagină | Era | Acum |
|---|---|---|
| `/servicii/eliberare-certificat-de-nastere/`, `…-casatorie/`, `…-celibat/` | insignă „TAXE INCLUSE”, „taxe incluse” în pași și în bara de încredere, „taxele Stării Civile sunt incluse”, „plătim taxele” | „PREȚ FINAL”, „Prețul afișat e final” |
| `/servicii/certificat-de-integritate-comportamentala/` | „TAXE OFICIALE INCLUSE”, „IGPR percepe o taxă oficială”, meta „Taxe IGPR incluse” | „PREȚ FINAL”; la ghișeu nu se plătește taxă |
| `/servicii/cazier-fiscal-online/` | „TAXE ANAF INCLUSE” | „PREȚ FINAL” (ANAF eliberează gratuit) |
| `/servicii/cazier-judiciar-online/persoana-fizica/`, `/persoana-juridica/` | „include taxele oficiale IGPR”, „taxe IGPR incluse” | „preț final; IGPR nu percepe taxă” |
| `/schimbare-certificat-de-nastere-vechi/` | „achitarea taxelor” | fără taxă de timbru; taxă locală doar la urgență |
| documentero, cardul de preț comun | „Onorariu avocat, taxe și TVA incluse.” | „Onorariu avocat și TVA incluse. Preț final, fără costuri ascunse.” |
| documentero naștere/căsătorie/celibat | „cu onorariul și taxele incluse”, „cu tot cu taxe” | „preț final” |

Surse: IGPR integritate (fără taxă):
https://politiaromana.ro/ro/utile/documente-eliberari-acte/obtinerea-certificatului-de-cazier-judiciar-de-integritate-comportamentala/obtinerea-certificatului-de-integritate-comportamentala1 ;
Legea 1/2017 art. VI: https://legislatie.just.ro/Public/DetaliiDocument/185507 ;
ANAF, cazier fiscal „se face de îndată de către organul fiscal, gratuit”:
https://static.anaf.ro/static/10/Galati/Vrancea/cazier-fiscal.pdf

### 2. Primăria competentă

Verificat în HG 255/2024 (Normele metodologice de stare civilă, în vigoare
31.03.2024), https://legislatie.just.ro/Public/DetaliiDocument/280598 :
- art. 158 alin. (1): certificatele de stare civilă se eliberează „de către oricare
  S.P.C.L.E.P. sau, după caz, primărie”, pe baza registrului exemplarul II
  (electronic, SIIEASC);
- art. 171 alin. (1): la fel extrasele multilingve;
- art. 12 lit. o): ofițerii de stare civilă din S.P.C.L.E.P. eliberează adeverința
  privind statutul civil (Anexa 18 = „certificatul de celibat”);
- art. 28 alin. (3): un act încă nedigitizat se validează în 3 zile, la cererea
  serviciului care are cererea.
- Aplicare, SPCLEP Târgu Frumos: „cererea pentru certificat duplicat/extras sau
  formular multilingv/Adeverință cu privire la statutul civil se poate depune la
  oricare primărie/serviciu de stare civilă/SPCLEP din România, indiferent de
  localitatea în care este întocmit actul de stare civilă sau are domiciliul
  solicitantul”:
  https://primariatgfrumos.ro/wp-content/uploads/2023/01/Extrasele-multilingve-1.pdf

Deci: „din localitatea de înregistrare” (căsătorie) și „din localitatea de
domiciliu” (celibat) erau greșite; „din 2023” (documentero) era anul greșit;
„pleacă electronic la primăria care păstrează actul” era imprecis (eliberează
primăria unde depui, din registrul electronic). Corectat pe
`/servicii/eliberare-certificat-de-casatorie/`, `…-celibat/` (inclusiv FAQ „Ce
este” → adeverință privind statutul civil, nu certificat de stare civilă),
`…-nastere/` (eticheta instituției, diaspora), `/servicii/extras-multilingv-*`
(„la primăria care deține actul” → orice serviciu de stare civilă) și pe
documentero: `/certificat-de-nastere/`, `/certificat-de-casatorie/`,
`/certificat-de-celibat/`, `/extras-multilingv/`,
`/ghiduri/certificat-de-nastere-pierdut/`,
`/ghiduri/acte-necesare-duplicat-certificat-de-nastere/`. Sursele stau în
comentarii lângă text. Frazele despre unde depune avocatul NOSTRU (operațional)
au rămas.

### 3–4. CJO (repo separat, commit `3246b3f9`)

Străini: doar act de identitate valabil (pagina IGPR PF), fără „6 luni” și fără
dovada adresei. Cazier fiscal: SPV pentru persoane fizice fără semnătură
calificată (OMFP 660/2017, art. 6: PF = certificat calificat SAU utilizator +
parolă + OTP; doar PJ/împuterniciți = certificat calificat,
https://static.anaf.ro/static/10/Anaf/termeni_conditii_spv.pdf). Detalii:
`docs/seo/2026-11-02-fapte-corectate.md` în CJO, secțiunile 5–6.

Pe eghiseul, `/servicii/cazier-fiscal-online/`: „cont SPV activ și semnătură
electronică” → „cont SPV activ” (3 locuri). Documentero `/cazier-fiscal-online/`
nu avea afirmația.

### Date

`DATE_MODIFIED` → 2026-11-02 pe toate paginile atinse; `PATH_LAST_MODIFIED` /
`PAGE_LAST_MODIFIED` în `src/lib/seo/last-modified.ts`; `lastModified` în
`src/config/documentero-sitemap.ts`. Pe documentero cazier judiciar/fiscal (afară
din sitemap) `UPDATED` → 2026-11-02, cu `PUBLISHED` separat ca `datePublished`
să nu se mute.
