# 02.11.2026 — Schimbă serviciul pe o comandă plătită + formularul „Raportează” cu șablon
<!-- categorie: comenzi -->

## Pentru echipă

- **Schimbă serviciul**: buton nou în bara de sus a comenzii plătite. Clientul a plătit Cazier Judiciar dar voia Cazier Fiscal sau Cazier Auto, la același preț? Alegeți serviciul corect, citiți ce lipsește și ce documente trebuie regenerate, scrieți motivul și confirmați.
- Merge doar la **același preț** și doar între serviciile prin avocat (caziere, certificat de integritate, stare civilă). Diferențele de bani rămân la „Modifică” sau la anulare și comandă nouă.
- La Cazier Auto bifați că permisul e emis în România (l-ați confirmat cu clientul). Poza permisului lipsă se cere cu „Solicită documente”.
- După schimbare **regenerați** contractele, împuternicirea și, unde e cazul, cererea. Numerele de Barou rămân aceleași.
- **Factura nu se schimbă**: rămâne cu numele serviciului vechi. Dacă trebuie refăcută, o face Raul sau contabila.
- **Raportează** (Ghid): formularul vine cu un șablon pe rânduri (codul comenzii, pașii, mesajul exact de pe ecran, ce vă așteptați). Dacă lipsește codul comenzii sau mesajul erorii, vă întreabă „trimiți oricum?”. Poza trebuie să arate eroarea.
- Pași: [Pagina comenzii](../admin/pagina-comenzii.md) și [Chatbot și raportare](../admin/chatbot-si-raportare.md).

---

## Schimbă serviciul (cerere echipă, E-261007-K59HB)

- `POST /api/admin/orders/[id]/change-service`, `orders.manage`, `action: 'preview' | 'apply'`.
  Logica pură în `src/lib/orders/change-service.ts` (`evaluateServiceSwitch`,
  `remapSelectedOptions`, `describeDocumentImpact`, `invoiceNote`).
- **Eligibilitate** (blocante): comandă plătită; status ≠ cancelled/refunded/completed/shipped/delivered;
  țintă activă, ≠ serviciul curent, ≠ hub (`cazier-judiciar`), vândută de brandul comenzii
  (`brandSellsService`); ambele servicii în `LAWYER_SERVICE_SLUGS` și niciunul instant
  (ONRC/ANCPI); `target.base_price === orders.base_price` (baza, nu totalul — cuponul nu
  blochează); fiecare opțiune din catalog de pe comandă există activă la țintă; fără
  firmă ↔ persoană fizică (`companyKyc.enabled`); stare civilă cere `customer_data.civil_status`;
  `personalKyc` cere CNP; Cazier Auto cere `vehicle.licenseIssuedAbroad === false` sau bifa
  `licenseConfirmedRomanian` (permisul străin are alt preț/termen → blocat).
- **De făcut** (nu blochează): semnătură lipsă (`signature.required`), `personalKyc.extraDocuments`
  lipsă (permis), părinți lipsă (`parentDataRequired`). Avertisment la statusurile de după depunere.
- **Apply**: `service_id`, `selected_options` cu `option_id` din catalogul nou (preț plătit
  păstrat), `customer_data.vehicle.licenseIssuedAbroad=false` la bifă,
  `estimated_completion_date` recalculat cu `computeEstimatedCompletionISOForOrder` pornind
  de la `paid_at`; gardă de concurență `.eq('service_id', source.id)`; istoric `modified`
  cu „Serviciu schimbat: X → Y (motiv)”.
- **Registrul Barou**: `allocate_number` e idempotent pe `service_type` (contract = numele
  serviciului, împuternicire = slug). Apply mută `service_type` pe rândurile vii ale comenzii,
  ca regenerarea să refolosească aceleași numere (best-effort; eroarea apare în UI și log).
- Factura Oblio nu se atinge; documentele din `order_documents` nu se șterg (lista de regenerat
  e în răspuns). UI: `src/components/admin/change-service-dialog.tsx`, buton în pagina comenzii.
- Nu acoperă: CJO (alt repo), servicii imobiliare/automate, diferențe de preț, reemiterea facturii.

## Formularul „Raportează” cu ghid

- `src/lib/knowledge/report-template.ts`: șabloane per tip (problemă / sugestie), exemplu bun/slab,
  `reportWarnings` (cod comandă `E-YYMMDD-XXXXX` / `CJO-…`, mesajul erorii, rânduri goale, fără poză).
- `ghid-ask.tsx` (admin + portal colaborator): șablon doar în caseta goală sau cu șablon neatins,
  avertizare „trimiți oricum?” (nu blochează; sărită la „Nu m-a ajutat”). API/stocare neschimbate.
- Teste: `tests/unit/lib/orders/change-service.test.ts`, `tests/unit/api/admin-change-service.test.ts`,
  `tests/unit/lib/knowledge/report-template.test.ts`.
