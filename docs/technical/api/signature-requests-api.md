# Signature requests API („Documente de semnat”)

Spec: [`../specs/documente-de-semnat.md`](../specs/documente-de-semnat.md). All responses use
`{ success, data?, error? }`, except the previews, which return the PDF itself
(DOCX when no converter is available).

## Requester side: team and topograph

Same contract under two prefixes:

- `/api/admin/orders/[id]/signature-requests`: GET needs `orders.view`; POST and DELETE need `orders.manage`.
- `/api/collaborator/orders/[id]/signature-requests`: only on orders assigned to the collaborator. Admin preview `?as=` is read-only.

| method | path | body / query | result |
|---|---|---|---|
| GET | `…/signature-requests` | none | `{ kinds[], groups, prefill, recipient: { orderNumber, clientName, closed }, requests[], signedDocuments[] }` |
| POST | `…/signature-requests` | `{ kinds: string[], fields: {}, askIdentity: boolean, note?: string }` | `{ request }`; cancels the pending request, posts a thread message (email to the client) |
| DELETE | `…/signature-requests?requestId=` | none | cancels a pending request |
| POST | `…/signature-requests/preview` | `{ kind, fields }` | PDF, unsigned |

`signedDocuments[].s3Key` is returned to the team only (for `/preview-document?key=`).

## Client side

The client authenticates with the order-client token from the status page
(`token` in the query for GET, in the body for POST), or with the owner's session
on the account page.

| method | path | body | result |
|---|---|---|---|
| GET | `/api/orders/[id]/signature-requests?token=` | none | `{ requests[]: { id, status, documents[], askIdentity, identity, note, createdAt, signedAt } }`; cancelled requests are hidden |
| POST | `/api/orders/[id]/signature-requests/[requestId]/preview` | `{ token, kind, identity? }` | PDF as it will be signed |
| POST | `/api/orders/[id]/signature-requests/[requestId]/sign` | `{ token, signatureBase64 (PNG data URL), identity?, identityFiles?: ClientFile[], consent: { documentsRead, signatureConsent } }` | `{ documentIds }` |

Sign errors (Romanian messages): 400 = missing consent, invalid signature, missing
or invalid ID data or photo; 404 = unknown request; 409 = already signed or
cancelled; 500 = storage failure (the request goes back to `pending`).

ID photos are uploaded first through `POST /api/orders/[id]/client-files` (presigned
S3 PUT). Keys outside `orders/<id>/acte-client/` are dropped.
