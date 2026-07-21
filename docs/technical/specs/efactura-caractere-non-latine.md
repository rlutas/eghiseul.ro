# e-Factura / SPV — caractere non-latine (chirilice, grecești) la clienți străini

**Status:** investigat 2026-07-21 (cerere Raul). Problemă reală observată în teren,
**fix neimplementat încă** (decizie deschisă).

## Problema (raportată de Raul)
Un client străin (Bulgaria, Rusia, Ucraina, Grecia) introduce la facturare
numele/orașul/adresa în **alfabetul lui** (chirilic sau grecesc). Când factura
merge Oblio → e-Factura → ANAF SPV, textul non-latin **nu e recunoscut / nu se
trimite corect** în SPV (respins sau afișat corupt).

## Ce e e-Factura, tehnic (confirmat din surse)
- Format **UBL 2.1 XML**, encoding **UTF-8**, obligatoriu prin SPV (B2B + B2C).
- Validat de ANAF cu **Schematron**: reguli europene **EN 16931** + specifice RO
  **CIUS-RO / BR-RO**, plus instrumentul **DUKIntegrator** (v1.4.17.x).
- ~10-20% din trimiteri pică la validare; „XML schema validation" e printre
  primele cauze.

## Ce spun sursele despre caractere non-latine
**Nu există o regulă ANAF publicată care să interzică EXPLICIT chirilice/grecești.**
Tehnic, UTF-8 le codează, iar EN 16931 nu restricționează setul de caractere.
DAR:
- Artefactele de validare e-Factura **v1.0.7** au adresat explicit „**special
  character replacement**" — adică lanțul de validare **înlocuiește/curăță**
  caractere speciale.
- ANAF cere „formate precise", mai ales pe câmpuri ca oraș (city) și
  subdiviziune (county/state).
- Practica standard la furnizorii de e-invoicing: **transliterare la latină**
  pentru nume/adrese non-latine, ca să eviți respingerea sau afișarea coruptă
  în SPV/PDF.
- Nicio pagină publică nu documentează cazul „chirilic respins" ca atare —
  dovada principală rămâne **experiența noastră din teren** (Raul).

**Concluzie onestă:** nu e o regulă scrisă, dar e un comportament real al
lanțului ANAF+SPV. Mitigarea sigură = trimitem doar **latin** către Oblio.

## Unde ne lovește în cod
`src/lib/oblio/invoice.ts` → `buildOblioClient()` trimite `name`, `address`,
`city`, `state`, `country` **verbatim** din `billing`. Deci un client care scrie
în chirilic/grecesc bagă text non-latin direct în Oblio → e-Factura. Nu există
niciun pas de transliterare. (`normalizeCedilla` acoperă DOAR diacriticele
românești cedilla, nu alfabete non-latine.)

## Fix recomandat (neimplementat)
Transliterare **chirilic + grecesc → latin** înainte de `buildOblioClient`
(sau în interiorul lui), pe câmpurile trimise la Oblio: `name`, `address`,
`city`, `state`. Opțiuni:
1. **Transliterare automată** (recomandat): mapare ISO 9 / BGN-PCGN pentru
   chirilic + mapare greacă→latină. Păstrezi originalul pentru afișare/istoric
   dacă vrei, dar la Oblio trimiți varianta latină. Zero fricțiune pentru client.
2. **Detectare + avertisment**: dacă input-ul conține caractere non-latine,
   ceri clientului/operatorului varianta cu litere latine. Mai sigur legal
   (numele exact), dar fricțiune.

Recomandare: **(1) transliterare automată** pentru `city/address/state` +
`name`, cu fallback pe original dacă transliterarea iese goală. Aplicat DOAR la
facturare străină (`isForeignBillingCountry`).

## De verificat înainte de implementare
- Emite o factură reală de test în Oblio cu nume/oraș chirilic → vezi dacă Oblio
  o acceptă și ce trimite în SPV (respins vs. transliterat de ei vs. corupt).
- Confirmă dacă Oblio face deja vreo transliterare pe partea lor (unele o fac).

## Surse
- ANAF — informații tehnice e-Factura: https://mfinante.gov.ro/en/web/efactura/informatii-tehnice
- ANAF — DUKIntegrator: https://static.anaf.ro/static/DUKIntegrator/DUKIntegrator.htm
- ANAF — Ghid RO e-Factura (PDF): http://static.anaf.ro/static/10/Anaf/AsistentaContribuabili_r/Ghid_RO_eFactura.pdf
- ecosio — ANAF RO e-Factura: https://ecosio.com/en/blog/anaf-ro-e-factura-and-e-invoicing-in-romania/
- getmandato — ghid integrare ANAF 2026: https://getmandato.dev/guides/romania-anaf/
- Validare XML e-Factura (artefacte v1.0.7, „special character replacement"): https://factureanu.ro/validare-xml-efactura
