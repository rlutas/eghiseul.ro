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
- Comenzile de cazier judiciar pe varianta veche a serviciului primeau o versiune mai veche a contractului de prestări (fără clauzele noi și fără linkul la termenii site-ului), iar cererea de cazier fără antetul oficial. De azi primesc aceleași documente ca restul.
- În formularele de stare civilă, declarația de lângă semnătură spune acum și că transcrierea actelor din străinătate o face clientul, iar până atunci comanda e suspendată.
- Procedura completă, pas cu pas: [Comandă blocată din cauza clientului](../admin/comanda-blocata-de-client.md).
- Clauzele noi le revizuiește avocata înainte să ne bazăm pe ele într-o dispută.

---

## Rezumat tehnic

- `contract-prestari.docx` (shared): paragrafele 9.8 și 9.9 după 9.7. Derogare explicită de la 6.1 pentru reținerea serviciului de bază + onorariu.
- T&C (3 branduri): bullet nou în §8 (rambursări) și §12 (obligațiile clientului); data actualizării 11 noiembrie 2026.
- `generator.ts`: `idDocumentKindFrom(personal)` (picker `idDocumentType`, apoi OCR `documentType` `passport*`), câmp `ClientData.id_document_type`, `buildIdentityClause()` („pașaportul nr. X, emis de” fără serie obligatorie; CI rămâne „CI seria X nr. Y, emisă de”). `buildClientDetailsBlock` adaugă `e-mail …` la final (PF și PJ). Setat în `auto-generate.ts`, `admin/orders/[id]/generate-document`, `contracts/preview`.
- `modular-wizard-provider.tsx`: `ModularDraftCache.data.consent` salvat și restaurat (doar dacă există semnătură); `UPDATE_CONSENT` setează `isDirty`. Cauza: cache-ul local păstra semnătura dar nu consimțământul, deci restaurarea punea `termsAccepted=false`, iar `/submit` scria `signature_metadata.consent` fals (~55% din comenzile plătite din iulie).
- `modular-order-wizard.tsx`: guard în `handleSubmit` — semnătură fără `termsAccepted` duce clientul la pasul semnătură cu mesaj.
- CJO/ecazier (repo `cazierjudiciaronline.com`, `dc5e1939`): 8.3 în `Step5Contract.tsx` + `contract-pdf.ts`, T&C §6/§9 pe ambele. Consimțământul acolo e impus server-side (`accept_terms: z.literal(true)`), deci fără bug.
- `src/templates/cazier-judiciar/contract-prestari.docx` și `contract-complet.docx` șterse: `loadTemplate()` le prefera pentru slug-ul activ `cazier-judiciar` (6 comenzi plătite din septembrie), iar ele erau versiunea veche (fără `SITE_NAME`/`TC_URL`/`CONTRACT_SERIA`, fără 9.8/9.9). Acum cade pe `shared/`. `contract-asistenta` și `imputernicire` din folder sunt identice cu shared, rămân.
- Acord la termeni, comenzi plătite pe 90 de zile: eghiseul 189/321 cu `termsAccepted=false`, documentero 0/3, cazierfiscal fără comenzi.
- Șters și `cazier-judiciar/cerere-eliberare-pf.docx` (fără antetul „Anexa nr. 7”); slug-ul legacy și cererea secundară de pe integritate cad pe `shared/`.
- `SignatureStep.tsx`: propoziție nouă în declarația de stare civilă (transcrierea actelor din străinătate). `handleSubmit` are `state.resumeToken` în deps.
- Ghid nou pentru echipă: `docs/admin/comanda-blocata-de-client.md` + `CURATED_GUIDES`; link din `statusuri-comenzi.md` (Așteptare client).
- Teste: 3 noi în `tests/unit/lib/documents/generator.test.ts` (pașaport, email, detecție).
