# 21.09.2026 — Identificare imobil: butonul „Nu am găsit”, status nou, preț 298
<!-- categorie: comenzi -->

## Pentru echipă

Când Mircea nu găsește imobilul în e-Terra, apasă în portal **„Nu am găsit —
depun certificat la OCPI”**. Comanda trece pe **„Identificare nereușită —
certificat OCPI depus”** (badge mov, rămâne în „În procesare”), clientul
primește automat emailul cu explicația și termenul se mută cu 10 zile
lucrătoare. Mircea depune certificatul 2.7.8 la OCPI, salvează nr. de
depunere ca până acum, iar când vine răspunsul îl încarcă: cu CF → extras;
negativ → certificatul E livrarea. **Nu mai promitem credit sau extras
gratuit.** „Identificare după adresă” costă acum 298 lei. Procedura completă:
ghidul „Identificare imobil: când topograful NU găsește imobilul”, cu PDF de
trimis lui Mircea și echipei (serviciul de la A la Z, pașii din portal, ce vede
clientul, ce spuneți la telefon).

---

## Tehnic

- Status `identification_pending_ocpi`: migrarea 182 (constraint + preț 298 +
  `ancpi_cost_ron` 125 pe proprietar), `status-options`, `status-badges`,
  admin detail (badge + `WORK_STATUSES`), `orders-tabs` (`PROCESSING_GROUP`),
  dashboard stats, admin status route, `process` (tranziții →
  `document_received|document_ready`), `customer-status`, `customer-next-step`,
  pagina publică de status, `orders-filter` (tab „Depuse”), `reupload/doc-types`.
- Ruta `POST /api/collaborator/orders/[id]/identificare-nereusita`: slug în
  `IDENTIFICARE_SLUGS`, nu din statusuri finale/anulate, preview 403; scrie
  `customer_data.identification_result` (`outcome`, `ancpiServiceCode` 2.7.8/2.7.6,
  `reportedBy/At`, `note`), `estimated_completion_date` = +10 zile lucrătoare
  (`addBusinessDays`), istoric `status_changed` + `note_added`, email
  `renderIdentificationPendingOcpiEmail` pe brandul comenzii, idempotent per comandă.
- Portal: sub „Am identificat imobilul”, notă opțională + buton; după raportare
  arată data și codul ANCPI. GET-ul comenzii expune `identification_result`.
- Pagina `identificare-imobil`: 198 → 298 în meta/JSON-LD, FAQ „nu poate fi
  identificat” rescris cu 2.7.8.
- Depunerea nu mai mută statusul (nu e în `BEFORE_SUBMISSION`), deci rămâne
  „certificat cerut” până la livrare.
- Teste: `orders-filter`, `orders-tabs`, `identification-pending-ocpi` (email),
  plus cele existente care cer text de client pentru orice status nou. 2010 verzi.
- Nu s-a făcut: cererea 2.7.8 generată din platformă (nu avem formularul ca
  bază), prețul pe identificarea după proprietar (rămâne 198).
