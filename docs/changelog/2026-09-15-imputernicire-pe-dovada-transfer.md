# 15.09.2026 — Împuternicirea se generează și pe comenzile pornite pe dovada de transfer
<!-- categorie: documente -->

## Pentru echipă

Ieri am pornit lucrul pe „Dovadă verificată — pornește lucrul" (comandă prin
transfer bancar, banii încă neintrați). Contractul de asistență s-a generat
automat, dar când ai apăsat **„Generează"** pe împuternicire, admin-ul a
răspuns „Numerele Barou se alocă doar după plată. Comanda nu este plătită."

Reparat: pe o comandă pornită pe dovadă, împuternicirea și contractul se
generează din panoul Documente exact ca pe o comandă plătită. Cererea de
eliberare mergea și înainte (nu consumă număr de Barou). Dacă banii nu mai
vin, numerele se eliberează în registru, ca până acum.

Procedura: [Plata prin transfer bancar](../admin/plata-transfer-bancar.md).

---

## Cauza

Două căi consumă numere de Barou, cu două gărzi separate:

- alocarea automată (`ensureBarouDocumentsForPaidOrder`) a primit pe 14.09
  opțiunea `allowVerifiedProof` și accepta `proof_verified_at`;
- generarea manuală din admin (`POST /api/admin/orders/[id]/generate-document`,
  șabloanele `contract-asistenta` / `contract-complet` / `imputernicire`)
  verifica în continuare doar `payment_status === 'paid'`.

Pe `E-260912-5SNRM` (certificat căsătorie) alocarea automată a mers
(`barou_numbers_allocated_at` la 05:36, `contract_asistenta` în
`order_documents`), iar butonul manual pentru împuternicire a refuzat.

## Fix

- `src/lib/documents/barou-allocation-gate.ts` — `canAllocateBarouNumbers()`,
  gardă pură: `payment_status === 'paid' || proof_verified_at`. Folosită de
  ambele căi, ca să nu mai poată diverge.
- ruta `generate-document` folosește garda; mesajul de refuz menționează și
  „Dovadă verificată — pornește lucrul".
- `ensure-barou-documents.ts` folosește aceeași gardă (comportament neschimbat,
  `allowVerifiedProof` decide dacă `proof_verified_at` contează).
- teste: `tests/unit/lib/documents/barou-allocation-gate.test.ts` (3).

## De reținut

Alocarea automată de după plată / pornire pe dovadă generează DOAR contractul
de asistență și rezervă numerele de împuternicire. Documentul de împuternicire
și cererea se generează manual din panoul Documente, ca întotdeauna.
