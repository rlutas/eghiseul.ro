# Documente de semnat — documents the client signs after the order

> Shipped 2026-11-26. Team guide: [`docs/admin/documente-de-semnat.md`](../../admin/documente-de-semnat.md).

## Why

The topograph needs the client's signature on documents that the order form never
produces: the OCPI archive request (Anexa 1, „cerere pentru eliberarea copiilor
după documentele aflate în arhiva biroului teritorial”) and a convention written
for one specific job. The team used to fill them by hand, and the client printed,
signed and scanned them. Property services do not collect the ID card either, so
the request can also ask the client for it.

## Flow

```
topograph (portal) / team (admin)          client (status page / account)
  „Cere semnătura clientului”
  pick documents, edit prefilled fields
  preview PDF → send (confirm recipient) ──▶ thread message + email
                                            card „Documente de semnat (N)”
                                            [ID data + ID photo, when asked]
                                            open each PDF → sign once on canvas
                                            → POST …/sign
  thread message „Am semnat…” + ID photo ◀── signed DOCX per document in
  signed PDFs in the card and portal         order_documents (visible_to_client)
```

The order status does not change.

## Data

`order_signature_requests` (migration 207, RLS on, no policies: service role only):

| column | meaning |
|---|---|
| `kinds` | `{'cerere-arhiva-ocpi','conventie'}` (subset) |
| `fields` | one flat map shared by all documents (name/ID appear in both); after signing, it holds the values actually signed |
| `ask_identity` | the client completes the identity keys + uploads an ID photo before signing |
| `status` | `pending` → `signed` / `cancelled`; a new request cancels the pending one |
| `requested_by_type/name` | `team` or `collaborator` |
| `signature_s3_key` | `orders/<orderId>/semnaturi/<requestId>.png` |
| `signature_metadata` | IP, user agent, timestamp, consent, SHA-256 of each signed DOCX, hash of `fields`, ID photo keys |
| `signed_document_ids` | the `order_documents` rows produced |

Signed files: `order_documents` with `type` = `cerere_arhiva_ocpi` / `conventie`,
`metadata.source = 'signature_request'`, S3 key
`orders/<friendly>/semnate/<requestId>/<template>-<friendly>-semnat.docx`.
The file name differs from the order-time convention (`conventie-<friendly>.docx`),
so the admin „regenerate” (which replaces rows by `type` + `file_name`) never
touches a signed copy.

## Code

| what | where |
|---|---|
| kinds, fields, prefill, render | `src/lib/signature-requests/documents.ts` |
| create / cancel / sign (claim, upload, rows, audit, messages) | `src/lib/signature-requests/service.ts` |
| shared handlers (team + collaborator) | `src/lib/signature-requests/handlers.ts`, auth in `auth.ts` |
| templates | `src/templates/shared/{cerere-arhiva-ocpi,conventie-semnare}.docx` from `src/templates/sources/*.html` |
| client card | `src/components/orders/signature-requests/CustomerSignatureRequests.tsx` (status page + account order page) |
| composer card | `.../SignatureRequestComposer.tsx` (admin order page + collaborator order page) |
| canvas | `.../SignaturePad.tsx` |

API: [`docs/technical/api/signature-requests-api.md`](../api/signature-requests-api.md).

### Templates

Edit the HTML, then regenerate the DOCX:

```bash
soffice --headless --convert-to "docx:MS Word 2007 XML" --outdir /tmp src/templates/sources/cerere-arhiva-ocpi.html
cp /tmp/cerere-arhiva-ocpi.docx src/templates/shared/
```

`conventie-semnare.html` is a copy of `conventie.html` with its own placeholders:
the order-time convention uses `DATACOMANDA` both for the term start and for the
contract date. Here they are two fields (`DATA_TERMEN`, `DATA_CONTRACT`), because
a convention signed months after the order needs today as the term start. Keep
the legal text of both files in step.

Empty fields render as `……………` so the paper copy can still be filled by hand.
`NOTA_SEMNARE` reads „Previzualizare…” unsigned and is EMPTY once signed: the
signed copy is filed at OCPI as is, so it carries no platform / IP line (asked
27.11.2026). The audit stays in `signature_metadata`.

The routes that read templates are listed in `outputFileTracingIncludes`
(`next.config.ts`).

## Rules

- **Privacy.** The collaborator gets the prefill (name, CNP and domicile from the
  order, since he files the request), but never the client's phone or email: when
  he asks, contact fields default to HIS profile, so OCPI answers him. S3 keys go
  to the team only; the collaborator opens files by id through
  `/api/collaborator/orders/[id]/document` (`cerere_arhiva_ocpi` added to
  `COLLABORATOR_READABLE_TYPES`).
- **Recipient check.** The composer shows client name + order number and asks
  for confirmation before sending (see the wrong-order incident, 25.11.2026).
- **Identity.** When `ask_identity` is set, signing fails without the 6 identity
  fields, a CNP with a valid check digit, and at least one ID photo uploaded in
  this order's `acte-client/` namespace. The client can change only the identity
  keys. Every other field stays as the requester set it.
- **One signature, every document.** A conditional claim
  (`status pending → signed`) prevents double documents on a double tap. On a
  failure after the claim, the rows are deleted and the request goes back to
  `pending`.
- **Timeline.** The signing event is `document_generated` with
  `new_value.signatureRequestId`; the status API maps it to `documents_signed`
  („Documente semnate”). `cerere_arhiva_ocpi` is in the status page's
  `CONTRACT_DOC_TYPES`, so it does not trigger „Vezi documentul”.
- **Reading.** Documents open in an in-page reader (`PdfPreviewModal`, pages
  drawn with pdf.js, „Descarcă” in the header), the same on phones and desktop.
  The signature pad stays locked until the identity data, the ID photo and
  every document are done; editing the identity resets „read”.
- **Signed copies.** Once signed, the client preview route serves the stored
  signed DOCX (as PDF) and the card lists each document with „Vezi” / „Descarcă”.

## Limits / open

- On-screen signature = simple electronic signature. Whether every BCPI accepts
  it is not confirmed; fallback = print and sign.
- Not covered by the local E2E: CloudConvert in production (local used
  LibreOffice), and the composer driven by a real logged-in topograph (the
  handlers were tested directly with a collaborator actor).

## Tests

- `tests/unit/lib/signature-requests/documents.test.ts`: prefill, sanitising,
  rendered DOCX content (no placeholder left, dates kept apart, checkbox), signature
  image + audit line, identity merge and CNP check.
- E2E (26.11.2026, test order flagged `is_test`, emails off): 28 API checks
  (auth, previews, refusals, ID photo from another order, sign, double sign, DB +
  S3 + thread + timeline), 12 handler checks (collaborator prefill privacy, S3 keys,
  create/cancel), mobile UI signing in a browser.
