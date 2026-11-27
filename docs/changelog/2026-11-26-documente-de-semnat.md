# 26.11.2026 — Documente de semnat: cererea de arhivă OCPI și convenția, semnate de client pe platformă
<!-- categorie: documente -->
<!-- audienta: colaborator -->

## Pentru echipă

- Topograful (din portal) sau echipa (din admin) apasă pe comandă **„Cere semnătura clientului”**, bifează cererea de arhivă OCPI și/sau convenția și verifică datele completate din comandă.
- Unde comanda nu are buletinul, lasă bifat **„Cere clientului actul de identitate”**: clientul încarcă poza și scrie CNP-ul, seria, numărul și domiciliul înainte să semneze.
- Clientul primește mesaj și email, deschide documentele în pagina comenzii și semnează o singură dată, cu degetul.
- Documentele semnate (PDF/Word) apar în cardul comenzii, la topograf în „Documente semnate de client”, iar poza buletinului vine în mesaje.
- Statusul comenzii nu se schimbă singur.
- Pe documentul semnat nu apare niciun rând cu platforma sau IP-ul: se depune la OCPI așa cum e (actualizat 27.11).
- Clientul citește documentele direct în pagină și poate semna doar după ce le-a deschis pe toate; câmpurile obligatorii au steluță (actualizat 27.11).
- Nu mai trimitem documente de printat și scanat. Dacă un ghișeu OCPI refuză semnătura de pe ecran, spune-ne.

Ghid complet: [Documente de semnat](../admin/documente-de-semnat.md).

---

## Tehnic

- Migrarea 207: `order_signature_requests` (pending → signed/cancelled, audit IP/UA/acorduri/SHA-256 per document).
- Șabloane noi: `src/templates/shared/cerere-arhiva-ocpi.docx`, `conventie-semnare.docx` (sursa HTML în `src/templates/sources/`); convenția are data termenului separată de data contractului.
- Cod: `src/lib/signature-requests/` (documents, service, handlers, auth); componente în `src/components/orders/signature-requests/` (SignaturePad, CustomerSignatureRequests, SignatureRequestComposer).
- Rute: `/api/admin/orders/[id]/signature-requests` (+ `/preview`), `/api/collaborator/orders/[id]/signature-requests` (+ `/preview`), `/api/orders/[id]/signature-requests` (GET cu token), `…/[requestId]/preview`, `…/[requestId]/sign`.
- Semnăturile ies ca `order_documents` (`cerere_arhiva_ocpi`, `conventie`, `metadata.source='signature_request'`), vizibile clientului; timeline-ul de status afișează „Documente semnate”.
- Topograful nu primește telefonul/emailul clientului în precompletare (implicit vin datele lui, ca OCPI să-i răspundă lui) și nici chei S3.
- Teste: 12 unit (`tests/unit/lib/signature-requests/documents.test.ts`); E2E local pe o comandă de test (28 verificări API, 12 pe handlere, semnare din UI pe mobil), cu emailurile oprite.
- Spec: [`technical/specs/documente-de-semnat.md`](../technical/specs/documente-de-semnat.md); API: [`technical/api/signature-requests-api.md`](../technical/api/signature-requests-api.md).
