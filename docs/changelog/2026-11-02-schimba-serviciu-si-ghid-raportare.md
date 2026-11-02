# 02.11.2026 — Schimbă serviciul pe o comandă plătită + formularul „Raportează” cu șablon
<!-- categorie: comenzi -->

## Pentru echipă

- **Schimbă serviciul**: buton nou în bara de sus a comenzii plătite. Clientul a plătit Cazier Judiciar dar voia Cazier Fiscal sau Cazier Auto, la același preț? Alegeți serviciul corect, citiți ce lipsește și ce documente trebuie regenerate, scrieți motivul și confirmați.
- Merge doar la **același preț de azi** (contează prețul de pe site acum, nu cel plătit: o comandă plătită la un preț vechi se poate muta dacă azi cele două servicii costă la fel). Diferențele de bani rămân la „Modifică” sau la anulare și comandă nouă.
- **Actualizare 02.11 (deciziile lui Raul):**
  - comenzile **finalizate, expediate sau livrate se pot schimba**, ca să corectați evidența (de exemplu E-261007-K59HB). Apare avertismentul „schimbarea corectează doar evidența; documentele deja depuse/livrate nu se schimbă”, iar termenul rămâne cel vechi. Statusul nu se schimbă niciodată din buton. Anulate și rambursate rămân blocate;
  - merge și între **serviciile imobiliare prin topograf** la același preț (de exemplu Copie intabulare ↔ Copie contract de vânzare ↔ Copie plan cadastral). Comanda rămâne la același topograf. Blocat dacă topograful a depus deja la OCPI, a raportat identificarea sau a încărcat documentul, ori dacă robotul ANCPI a pornit comanda;
  - extrasul CF, planul cadastral și constatatorul (emise automat) nu se schimbă. Nici de la avocat la imobiliare sau invers.
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
- Nu acoperă: CJO (alt repo), servicii automate, diferențe de preț, reemiterea facturii.

### Extindere 02.11.2026 (deciziile lui Raul, după prima livrare)

- **Statusuri**: `CHANGE_SERVICE_LOCKED_STATUSES` = cancelled, refunded, cancellation_requested.
  `completed`/`shipped`/`delivered` (`CHANGE_SERVICE_FINISHED_STATUSES`) sunt permise:
  avertisment „Comanda e deja „<status>”: schimbarea corectează doar evidența; documentele
  deja depuse/livrate nu se schimbă.” (și pe statusurile de după depunere,
  `CHANGE_SERVICE_LATE_STATUSES`), `keepEstimate=true` → apply NU scrie
  `estimated_completion_date`, preview arată `estimate.kept`. Statusul nu e scris niciodată.
  Butonul din pagina comenzii ascuns doar pe cancelled/refunded.
- **Preț**: `basePriceDelta = target.base_price − source.base_price` (catalogul ACTUAL,
  ambele din `services`), nu `orders.base_price`. Dacă prețul plătit diferă de cel curent,
  preview-ul spune „preț vechi”, banii nu se mișcă, `orders.*_price` rămân neatinse.
- **Familii** (`serviceFamily`): `instant` (`instantPlatformProvider`), `lawyer`
  (`LAWYER_SERVICE_SLUGS`), `property` (`verification_config.propertyVerification.enabled`,
  restul serviciilor imobiliare), `other`. Doar lawyer↔lawyer și property↔property; lista de
  candidați e filtrată pe familia serviciului curent (catalogul citit integral, ~30 rânduri).
- **Imobiliare — date**: câmpurile `propertyVerification.fields.*.required` ale țintei trebuie
  să existe în `customer_data.property`; fără `identificationService` trebuie CF sau cadastral;
  cu `identificationService` ajunge adresa (aceeași regulă ca `PropertyDataStep`);
  `conventie.enabled` cere `beneficiaryName/Cnp/Address/IdSeries/IdNumber`.
- **Imobiliare — lucru început = blocat**: `customer_data.ocpi_submission`
  (`registration_number`/`submitted_at`), `identified_property`, `identification_result`,
  document `collaborator-document`, sau status de la depunere încolo / încheiat. Practic o
  comandă imobiliară finalizată rămâne blocată (lucrarea la OCPI e făcută).
- **ANCPI**: `ensureAncpiJobForPaidOrder` creează joburi doar pentru `extras-carte-funciara`
  (exclus, instant) și e oprit oricum (`HANDED_OVER_TO_COLLABORATOR`), deci un job pe o comandă
  schimbabilă e excepție. Regula: job `PENDING` fără `ancpi_order_id` → șters la apply,
  ÎNAINTE de update-ul comenzii, cu gardă `.eq('status','PENDING').is('ancpi_order_id', null)`;
  0 rânduri șterse = robotul l-a luat între timp → 409, nimic scris. `ancpi_jobs` nu are status
  de anulare (CHECK din migrarea 065), iar ținta nu se emite automat, deci nu se re-creează.
  Orice alt status de job → blocat.
- **Colaborator**: vizibilitatea în portal = `collaborator_service_assignments` pe
  `service_id` SAU `orders.assigned_collaborator_id` (rămâne neatins). Cine vede comanda acum
  (asignați pe serviciul vechi + alocarea pe comandă) trebuie să vadă și ținta, altfel blocat.
  Costurile interne (`order_supplier_costs`) și decontul topografului sunt pe comandă, nu pe
  serviciu: nu se ating.
- **Documente**: `conventie` intră în lista de regenerat (pct. 1 din convenție poartă numele
  serviciului). Numerele de Barou se mută doar pe familia `lawyer`.
- Răspunsul are în plus `changes[]` (ce se schimbă: preț vechi, topograf, job ANCPI, termen,
  status), `family`, `paidBasePrice`; lista are `current.currentBasePrice`, `current.status`,
  `familyNote`.

## Formularul „Raportează” cu ghid

- `src/lib/knowledge/report-template.ts`: șabloane per tip (problemă / sugestie), exemplu bun/slab,
  `reportWarnings` (cod comandă `E-YYMMDD-XXXXX` / `CJO-…`, mesajul erorii, rânduri goale, fără poză).
- `ghid-ask.tsx` (admin + portal colaborator): șablon doar în caseta goală sau cu șablon neatins,
  avertizare „trimiți oricum?” (nu blochează; sărită la „Nu m-a ajutat”). API/stocare neschimbate.
- Teste: `tests/unit/lib/orders/change-service.test.ts`, `tests/unit/api/admin-change-service.test.ts`,
  `tests/unit/lib/knowledge/report-template.test.ts`.
