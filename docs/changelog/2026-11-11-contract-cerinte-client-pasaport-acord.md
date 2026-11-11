# 11.11.2026 — Contract: blocaje din partea clientului, pașaport în loc de „CI”, acordul la termeni salvat corect
<!-- categorie: documente -->

## Pentru echipă

- **Contractul de prestări are două clauze noi (9.8 și 9.9).** Dacă documentul nu se poate elibera din cauza unui lucru pe care doar clientul îl poate face (transcrierea căsătoriei sau a nașterii din străinătate, înregistrarea divorțului, un act original, o rectificare, semnătura, o poză), îi scriem pe email sau WhatsApp ce are de făcut. Comanda stă pe „Așteptare client” și termenul curge din nou după ce rezolvă. Nu e întârzierea noastră.
- **Dacă în 90 de zile nu rezolvă sau refuză:** contractul se încheie din vina lui. Păstrăm serviciul de bază și onorariul avocatului. Îi dăm înapoi doar ce nu am început (traducere, legalizare, apostilă, livrare), în 10 zile lucrătoare. Poate relua comanda în 12 luni fără să plătească din nou serviciul de bază.
- Aceleași reguli apar și în Termeni și condiții pe eghiseul, documentero și cazierfiscal (§8 și §12), iar pe cazierjudiciaronline.com și ecazier.ro în contract (punctul 8.3) și în termeni (§6 și §9).
- **Contractul scrie acum „pașaportul nr. …” când clientul a comandat cu pașaportul**, nu „CI seria …”. Pentru comenzile deja generate cu „CI”, apasă din nou generarea contractului din pagina comenzii.
- **Contractul conține și adresa de email a clientului** (acolo trimitem notificările din contract).
- Pe cazierjudiciaronline.com și ecazier.ro bifa nu avea problema: comanda nu trece fără ea.
- **Bifa „Sunt de acord cu termenii” nu se mai pierde** când clientul revine în formular. Înainte, aproape jumătate din comenzile plătite din iulie aveau acordul salvat ca „nu”, deși clientul semnase. Acum butonul „Plătește” nu trece mai departe fără bifă. Comenzile vechi nu se pot corecta retroactiv.
- Clauzele noi le revizuiește avocata înainte să ne bazăm pe ele într-o dispută.

---

## Rezumat tehnic

- `contract-prestari.docx` (shared): paragrafele 9.8 și 9.9 după 9.7. Derogare explicită de la 6.1 pentru reținerea serviciului de bază + onorariu.
- T&C (3 branduri): bullet nou în §8 (rambursări) și §12 (obligațiile clientului); data actualizării 11 noiembrie 2026.
- `generator.ts`: `idDocumentKindFrom(personal)` (picker `idDocumentType`, apoi OCR `documentType` `passport*`), câmp `ClientData.id_document_type`, `buildIdentityClause()` („pașaportul nr. X, emis de” fără serie obligatorie; CI rămâne „CI seria X nr. Y, emisă de”). `buildClientDetailsBlock` adaugă `e-mail …` la final (PF și PJ). Setat în `auto-generate.ts`, `admin/orders/[id]/generate-document`, `contracts/preview`.
- `modular-wizard-provider.tsx`: `ModularDraftCache.data.consent` salvat și restaurat (doar dacă există semnătură); `UPDATE_CONSENT` setează `isDirty`. Cauza: cache-ul local păstra semnătura dar nu consimțământul, deci restaurarea punea `termsAccepted=false`, iar `/submit` scria `signature_metadata.consent` fals (~55% din comenzile plătite din iulie).
- `modular-order-wizard.tsx`: guard în `handleSubmit` — semnătură fără `termsAccepted` duce clientul la pasul semnătură cu mesaj.
- CJO/ecazier (repo `cazierjudiciaronline.com`, `dc5e1939`): 8.3 în `Step5Contract.tsx` + `contract-pdf.ts`, T&C §6/§9 pe ambele. Consimțământul acolo e impus server-side (`accept_terms: z.literal(true)`), deci fără bug.
- Teste: 3 noi în `tests/unit/lib/documents/generator.test.ts` (pașaport, email, detecție).
