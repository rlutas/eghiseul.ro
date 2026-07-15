# 2026-07-15 — Cookie consent LIVE + factura extra rezolvată + căderea ANCPI + merchant listings

## 0. 🔵🔴 Căderea națională ANCPI (13–20 iulie) — reacția noastră

- **Confirmat NU e de la workerul nostru** (întrebarea lui Raul, verificat cu dovezi): pe 13.07 workerul a procesat 0 joburi, 0 evenimente în fereastra căderii (23:02); singura activitate = probă GET 1/min pe pagina de login; incidentul e pe toate sistemele ANCPI naționale (eTerra/ePay/geoportal + interne), eroarea văzută de noi = `ERR_EMPTY_RESPONSE` de la serverul lor OpenAM. Oficial: „incident tehnic în curs de investigare", estimare revenire 20.07.
- **Articol breaking** `/ancpi-nu-functioneaza/` (news-jacking pe căutările în explozie): datele proprii de monitoring (căderea la 23:02 = fapt citabil unic), informarea oficială OCPI ca imagine cu atribuire, **widget-ul de status LIVE embedded** (SystemStatus arată acum și „Indisponibil din <data, ora>" din platform_outages — vizibil și pe paginile de comandă), 6 FAQ, CTA-uri (comanda intră în coadă → eliberare automată cu prioritate). Prima poziție blog+homepage, revalidate orar, IndexNow 200.
- **Clienții afectați notificați pe email** (3 comenzi plătite în așteptare: E-260715-BC3RP extras CF, E-260714-99AFD extras plan, E-260713-E4MJ4 identificare) — Resend, ID-uri de livrare confirmate; mesaj: comanda în siguranță, termen 20.07, procesare automată la revenire, link articol.
- **Rămas**: jobul FAILED al E-260715-BC3RP e la retry_count=4 (max) — echipa apasă „Reîncearcă" în /admin/ancpi (safe: fără comandă ePay plasată); clasificatorul a blocat pe bună dreptate modificarea directă din sesiune.

## 0b. 🔴 Merchant listings GSC (email 15.07): 3 probleme schema Product — FIXATE

GSC a semnalat pe nodurile Product (cele cu rating din fix-ul review snippets): `brand` tip nevalid, lipsă `hasMerchantReturnPolicy` și `shippingDetails` în offers. Fix în 3 locuri (`schema.ts` productNode — sursa paginilor dedicate, `[slug]/page.tsx` — paginile dinamice, rovinieta — doar brand):
- `brand` → `{ '@type': 'Brand', name: 'eGhișeul.ro' }` (era @id spre Organization);
- `hasMerchantReturnPolicy` → MerchantReturnNotPermitted, applicableCountry RO (documente personalizate, fără retur după procesare — conform T&C/OUG 34);
- `shippingDetails` → OfferShippingDetails cu shippingRate 0 RON, destinație RO (livrarea digitală e inclusă; curierul e opțiune tarifată separat).
Constante exportate (PRODUCT_BRAND, MERCHANT_RETURN_POLICY, OFFER_SHIPPING_DETAILS) ca toate nodurile să rămână sincrone. Test unit actualizat. **După deploy: Validate fix în GSC** (secțiunea Merchant listings).

## 1. 🟣 Cookie consent banner — implementat conform planului

Planul: `docs/plans/2026-07-14-cookie-consent-gdpr.md` (acum IMPLEMENTAT).

**Ce s-a construit:**
- `src/lib/consent.ts` — starea de consimțământ: cookie `eg_cookie_consent` (JSON, 6 luni, SameSite=Lax), evenimente open/changed, ștergerea `_ga*` la revocare, `CONSENT_BANNER_VERSION`.
- `src/components/consent/cookie-consent.tsx` — banner jos, discret (nu blochează ecranul): **Accept toate / Doar necesare / Personalizează** (toggle-uri Analiză + Marketing; Strict necesare mereu active). Montat în root layout.
- **GA4 nu se mai încarcă necondiționat** (era neconform): gtag.js e injectat DOAR după opt-in analitice; **Google Consent Mode v2** cu default `denied` pe toate (analytics_storage, ad_storage, ad_user_data, ad_personalization) ca strat doi — la accept se face `consent update`. Purchase event-ul din success era deja gardat pe `window.gtag`.
- **Retragere la fel de ușoară ca acordarea** (ePrivacy): link permanent „Setări cookie-uri" în footer (`cookie-settings-link.tsx`) + în politica de cookies — redeschide bannerul cu opțiunile curente; revocarea analizei șterge `_ga*`.
- **Registrul de consimțăminte (GDPR art. 7 — dovada):** migrarea **118** `cookie_consent_log` (consent_id, alegeri, banner_version, ip, user_agent; RLS fără politici = doar service-role) + `POST /api/consent-log`. Fiecare salvare = consent receipt; același `consent_id` trăiește în cookie-ul vizitatorului → o alegere e demonstrabilă punctual la o plângere. Fire-and-forget, bannerul nu blochează pe el.
- **Pagina `/politica-cookies/` rescrisă** (cerință Raul: „ce urmărim, ce nu"): secțiuni explicite Ce urmărim / **Ce NU urmărim** (nu vindem date, zero pixeli de retargetare, zero tracking înainte de Accept), tabelul exact al cookie-urilor (eg_cookie_consent, sb-*, __stripe_*, _ga*) cu durate, temeiul legal (art. 6 GDPR + Legea 506/2004), butonul de schimbare a opțiunii, mențiunea consent receipt.

**Verificat:** banner randează pe homepage (screenshot), endpoint consent-log → rând în DB, tsc/eslint/1155 teste. **Deschis:** replicare pe CJO + cfunciara (aceeași expunere GDPR).

## 2. 🔴 Factura extra E-260714-WXGYQ — EMISĂ (EGH-0055) + cauza reală

Saga (13 cron-uri eșuate silențios) închisă azi:
1. **Migrarea 117**: CHECK-ul `order_history.event_type` respingea silențios chiar și logarea erorii (`extra_invoice_failed` nu era în listă) — de-aia nu vedeam nimic.
2. **Rută temporară de debug** (auth bearer worker ANCPI, ștearsă după) → eroarea reală, live: **Oblio 400 „Nu puteți adăuga produse pentru facturare prin referință"** — la emiterea cu `referenceDocument` (din proformă), Oblio copiază liniile DIN proformă și respinge `products` explicit.
3. **Fix `proforma.ts`**: fără `products` la factura din proformă (+ `collect.value/documentDate` din fix-ul anterior).
4. **EGH-0055 emisă** (182,30 lei, referință proforma PEGH-0001), scrisă în `extra_billing` + `order_history` — vizibilă în admin la Facturare sub EGH-0047.

**Lecții:** (1) Oblio: referenceDocument ⇒ fără products; (2) erorile proceselor de fundal TREBUIE să fie vizibile în DB, nu doar în loguri inaccesibile; (3) CHECK constraints pe event_type = de verificat la orice tip nou de eveniment.

### Follow-up: serviciile plătite prin extra erau INVIZIBILE (fix ba6941a)

Opțiunile scrise de dialogul Modifică sunt camelCase; admin-ul randa doar snake_case → legalizarea + apostila notari plătite apăreau cu nume gol/fără preț, iar pe statusul clientului opțiunile ORIGINALE apăreau cu 0 lei (API-ul citea doar priceModifier). Fixat: normalizare în admin, `normalizeOrderOptions` în /api/orders/status, card „Facturi" pe status client cu AMBELE facturi (EGH-0047 + EGH-0055 cu link PDF) + „Servicii adăugate ulterior (achitate)" și „Total achitat" în sumarul de preț. Verificat end-to-end pe comanda reală.
