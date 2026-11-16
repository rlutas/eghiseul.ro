# 16.11.2026 — Facturile pe firmă plecau la Oblio fără județ
<!-- categorie: plati -->

## Pentru echipă

Facturile emise pe firmă ajungeau în Oblio fără județ și fără localitate, așa că trebuiau completate de mână înainte de trimiterea în SPV. Raul a semnalat EGH-0955, EGH-0962, EGH-0973 și EGH-0979.

De acum, județul și localitatea firmei se completează singure, din adresa pe care o dă ANAF la verificarea CUI-ului. La București apare „Sector N” la localitate.

Cele patru facturi semnalate au fost deja corectate în Oblio. Dacă mai vedeți o factură pe firmă fără județ după 16.11, spuneți imediat.

---

## Cauza

La facturarea pe firmă, wizardul salvează adresa pe un singur rând (`billing.companyAddress`, de exemplu „JUD. SATU MARE, SAT ODOREU COM. ODOREU, STR. SALCÂMILOR, NR.2”) și lasă `billing.county` și `billing.city` goale. `buildOblioClient()` trimitea `state` și `city` din acele câmpuri goale.

Când comanda avea și adresa unei persoane (act scanat), județul venea din adresa persoanei, nu a firmei. La comenzile fără act, cum sunt cele de certificat constatator, nu venea nimic. De aceea problema a apărut des după lansarea site-ului de constatator (11.11).

Diagnosticul e din cod. Cele patru comenzi nu au putut fi citite din baza de date în sesiunea asta, deci rămâne de confirmat că toate patru sunt facturi pe firmă emise din acest repo. Seria EGH e folosită și de cazierjudiciaronline.com, care are codul lui de facturare, neatins aici.

## Ce am schimbat

- `parseCompanyAddress()` în `src/lib/oblio/address.ts`: scoate județul („JUD. …”, „JUDEȚUL …”, București) și localitatea („MUN.”, „ORŞ.”, „SAT”, „COM.”) din adresa pe un rând. Nu ghicește: dacă textul nu spune județul, întoarce gol.
- `buildOblioClient()` în `src/lib/oblio/invoice.ts`: pentru firme, adresa se rezolvă doar din datele firmei. Adresa persoanei care a comandat nu mai ajunge pe factura firmei.
- Dacă wizardul a salvat totuși un județ, acela are prioritate.

## Completare, tot 16.11: Oblio își ia singur datele firmei

Raul a amintit că, la firmă, Oblio își poate lua singur datele după CUI. Așa trimite de la început site-ul cazierjudiciaronline.com: cu `autocomplete: 1` pe client. În acest repo câmpul lipsea.

- `buildOblioClient()` trimite acum `autocomplete: 1` pentru firme (nu și pentru persoane fizice).
- Județul și localitatea citite din adresa ANAF rămân ca rezervă, dacă Oblio nu primește răspuns de la ANAF.
- Verificat pe toate drumurile care emit documente: factura la plată, proforma și factura din proformă la plata suplimentară, factura de taxă la anulare. Toate construiesc clientul prin `buildOblioClient()`, deci primesc aceeași reparație.

Nedovedit: ce face Oblio când primește și `autocomplete: 1`, și județul nostru (care are prioritate). Se vede la prima factură pe firmă emisă după deploy.

Cele patru facturi semnalate au fost deja corectate de Raul în Oblio.

## Ce nu acoperă

- Adrese de firmă fără „JUD.” și fără București în text: județul rămâne gol.
- Facturile deja emise.
- cazierjudiciaronline.com și ecazier.ro (alt repo).

## De ce nu s-a văzut mai devreme

Verificarea automată a facturilor pentru SPV există (`einvoice-check`), cu banner în admin și alertă pe Slack. `SLACK_WEBHOOK_URL` nu e setat în producție, deci alerta de Slack nu pleacă; rămâne doar bannerul din admin.

## Teste

`tests/unit/lib/oblio/company-address.test.ts` (8).
