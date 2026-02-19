# Session Recap - 18-19 Februarie 2026

> **Citeste asta prima data cand revii la proiect.**

## Context rapid

Proiect: **eghiseul.ro** - platforma digitala pentru servicii publice romanesti (cazier judiciar, extras carte funciara, etc.)
Tech stack: Next.js 16+ / Supabase / AWS S3 / Stripe / Gemini AI / Fan Courier + Sameday
Sprint-uri active: Sprint 4 (98%) + Sprint 5 (98%), ambele aproape gata.
Sprint urmator: Sprint 6 (Notifications & Polish) - inca neplanificat.

---

## Ce s-a facut in aceasta sesiune

Sesiunea a cuprins 5-6 sub-sesiuni pe parcursul a doua zile (18-19 Feb). Mai jos sunt toate schimbarile, grupate pe arie.

### Sistem Registru Numere (Barou)

- **Sistem complet** - tabele `number_ranges` + `number_registry`, RPC `allocate_number()` cu logica de reuse, `find_existing_number()`, `void_number()`. Inlocuieste legacy `increment_document_counter`.
- **Pagina proprie** `/admin/registru` cu icon BookOpen in sidebar (mutat din Settings tab).
- **Tabel grupat pe comanda** - contract + delegatie pe acelasi rand.
- **Link-uri download documente** (FileDown icon) langa numere.
- **Bug fix**: `order_document_id` acum se seteaza corect si pentru numere reutilizate la regenerare documente.
- **Export CSV** include coloana "Document" cu filename-ul documentului asociat.
- **Backfill** - 9 intrari istorice din `order_documents` existente.
- **Spec**: `docs/technical/specs/number-registry-system.md`

**Fisiere cheie:**
- `src/app/admin/registru/page.tsx` (NEW) - pagina registru
- `src/app/api/admin/settings/number-ranges/route.ts` (NEW) - ranges API
- `src/app/api/admin/settings/number-registry/[id]/route.ts` (NEW) - registry entry API
- `src/app/admin/layout.tsx` - sidebar cu Registru
- `src/app/admin/settings/page.tsx` - tab-ul Registry scos

---

### Contracte si Documente

#### CLIENT_DETAILS_BLOCK - Format legal complet

Functia `buildClientDetailsBlock()` din `generator.ts` a fost rescrisa cu format legal romanesc corect:

**PF (persoana fizica):**
```
POPESCU ION, legitimat/a cu CI seria XY nr. 123456, emisa de SPCLEP Sector 3,
CNP 1900101123456, cu domiciliul in Str. Salcamilor, Nr. 5, Bl. A1, Sc. 2,
Et. 3, Ap. 14, Localitatea Bucuresti, Jud. Sector 3
```

**PJ (persoana juridica):**
```
SC FIRMA SRL, CUI: RO12345678, Nr. Reg. Com.: J40/1234/2020,
cu sediul in Str. Victoriei Nr. 10, Bucuresti,
reprezentata prin POPESCU ION, legitimat/a cu CI seria XY nr. 123456,
emisa de SPCLEP Sector 3, CNP 1900101123456
```

- Ambele contracte (contract-prestari sectiunea 1.2 + contract-asistenta Party 2) folosesc acest format.
- **Placeholder-uri noi**: `CLIENT_BIRTH_PLACE`, `CLIENT_BIRTH_COUNTRY` (pentru servicii gen certificat nastere).
- **Contract preview** (wizard, pasul semnatura) foloseste acelasi format.
- **Date formatting fix** - data nastere si expirare CI fara ora (DD.MM.YYYY, nu ISO timestamp).

**Fisiere cheie:**
- `src/lib/documents/generator.ts` - `buildClientDetailsBlock()`, placeholders
- `src/app/api/contracts/preview/route.ts` - contract preview API
- `src/components/orders/modules/signature/ContractPreview.tsx` - live preview in wizard

---

### KYC si OCR

#### Model AI upgrade
- **Gemini 2.5 Flash** (de la `gemini-2.0-flash-exp` pt OCR si `gemini-1.5-flash` pt KYC). Un singur model unificat.

#### Face matching fix
- `getIDDocument()` - corectata logica de tip matching + payload-ul API. Acum compara corect selfie-ul cu poza din CI.

#### OCR improvements
- Nu mai adauga prefix "Strada" la numele strazii (previne duplicare "Strada Salcamilor" -> "Strada Strada Salcamilor").
- File input se reseteaza corect dupa upload document.

#### Thumbnail previews
- Documente incarcate la pasul KYC arata thumbnail preview in wizard.

#### S3 upload la submit
- Documentele KYC (CI front, CI back, selfie) se uploadeaza in S3 la submit (nu mai raman doar ca base64 in DB).
- Presigned URLs pentru download din admin.

#### Confidence tracking per document

**Tipuri noi** in `src/types/verification-modules.ts`:
```typescript
interface KYCDocumentValidation {
  valid: boolean;
  confidence: number; // 0-100
}

interface KYCValidationResults {
  ciFront?: KYCDocumentValidation;
  ciBack?: KYCDocumentValidation;
  selfie?: KYCDocumentValidation & {
    faceMatch: boolean;
    faceMatchConfidence: number; // 0-100
  };
}
```

- Fiecare document KYC (CI fata, CI verso, selfie, face match) stocheaza scor de confidence AI (0-100%).
- Stocat in wizard state (`kycValidation` pe `PersonalKYCModuleData`).
- **Admin**: card "Verificare KYC" cu procente per document si culori:
  - Verde: >= 70%
  - Galben: 50-69%
  - Rosu: < 50%
- **Warning < 70%**: icon de avertizare pentru review manual de catre operator.

**Fisiere cheie:**
- `src/types/verification-modules.ts` - `KYCValidationResults`, `KYCDocumentValidation`
- `src/lib/services/document-ocr.ts` - Gemini 2.5 Flash
- `src/lib/services/kyc-validation.ts` - Gemini 2.5 Flash + face matching
- `src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx` - thumbnails, confidence per doc
- `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx` - OCR confidence, street fix
- `src/providers/modular-wizard-provider.tsx` - `kycValidation` state field
- `src/app/admin/orders/[id]/page.tsx` - KYC confidence display card

---

### Admin Panel

- **Date personale**: layout compact 2-col grid.
- **Adresa**: campuri separate 3-col grid (Str, Nr, Bl, Sc, Et, Ap, Loc, Jud).
- **Facturare PF**: arata datele personale (nu mai e gol).
- **Metoda plata**: "Stripe (card)" cu link Stripe dashboard.
- **Documente vizibile si in status pending** (fara restrictie de status).
- **Timeline events noi**: `order_submitted`, `document_generation_failed`.
- **Date nastere/expirare**: fara ora (DD.MM.YYYY).
- **Buton "Adauga Utilizator"** (invite) pentru super_admin.
- **extractKycDocKeys fix**: handles array format.

**Fisiere cheie:**
- `src/app/admin/orders/[id]/page.tsx` - order detail complet (KYC card, layout, billing, events)

---

### Review Step & Pricing

- **Fiecare optiune cu pret individual** (urgenta +50 RON, traducere +80 RON, etc.).
- **TVA 21%** (nu 19%) peste tot: review step, success page, status page, OrderSummaryCard.
- **Breakdown complet**: subtotal + TVA + delivery + total.
- **Status page**: preturi cu `.toFixed(2)` (fara artefacte floating point).

**Fisiere cheie:**
- `src/components/orders/steps-modular/review-step.tsx` - TVA 21%, option prices
- `src/app/comanda/status/page.tsx` - `.toFixed(2)` formatting

---

## Ce trebuie testat

### Prioritate CRITICA (testeaza prima data)

1. **Flow complet PF**: Contact -> Date personale (OCR) -> KYC docs (upload CI + selfie) -> Optiuni -> Semnatura (preview contract) -> Livrare -> Facturare -> Review -> Plata
   - Verifica ca OCR extrage corect datele din CI
   - Verifica ca face matching functioneaza cu selfie real
   - Verifica ca contract preview-ul din pasul semnatura arata formatul legal corect

2. **Contract preview**: Verifica ca sectiunea 1.2 din contract-prestari arata corect:
   - PF: "NUME, legitimat/a cu CI seria XX nr. XXXXXX, emisa de..., CNP..., cu domiciliul in..."
   - PJ: firma + CUI + reg com + sediu + "reprezentata prin..."

3. **Admin order detail**: Deschide o comanda platita si verifica:
   - Date personale in 2-col grid
   - Adresa in 3-col grid cu campuri separate
   - Facturare PF cu date complete (nu gol)
   - KYC confidence card cu procente si culori
   - Documente vizibile

4. **Registru**: Verifica pagina `/admin/registru`:
   - Navigare din sidebar
   - Tabel cu grouping pe comanda
   - Download documents (FileDown icons)
   - CSV export cu coloana "Document"

### Prioritate MEDIE

5. **Face matching**: Upload selfie cu buletin real, verifica procentaj in admin KYC card.
6. **KYC docs in admin**: Verifica ca documentele sunt vizibile si descarcabile din S3.
7. **Export CSV din registru**: Verifica coloana "Document" in export.
8. **Invite user**: Testeaza butonul "Adauga Utilizator" pe pagina Users.
9. **Confidence < 70%**: Simuleaza un scan cu calitate slaba, verifica warning in admin.

### Prioritate MICA

10. TVA 21% pe toate paginile (review, status, success, payment card).
11. Preturi formatate corect (2 decimale, fara floating point artifacts).
12. Timeline events: `order_submitted` si `document_generation_failed` in admin.
13. Date fara ora (DD.MM.YYYY) in documente generate si admin.

---

## Probleme cunoscute / De facut saptamana viitoare

### Bugs de verificat

| Bug | Severitate | Detalii |
|-----|-----------|---------|
| **Stale closure in KYCDocumentsStep** | MEDIUM | `handleFileSelect` are deps array gol - potential data loss la upload multiplu rapid. Trebuie verificat cu test real. |
| **Object URL memory leak in KYCDocumentsStep** | LOW | `URL.createObjectURL()` nu e revocat la unmount. Minor - afecteaza doar memoria in browser. |
| **Google AI DPA** | MEDIUM | Gemini Data Processing Agreement nu e verificat pt GDPR compliance. |
| **CSP headers** | MEDIUM | Content Security Policy headers nu sunt configurate in `next.config.js`. |
| **Passport UI** | LOW | OCR backend suporta pasaport, dar UI selector nu e construit. |

### Backlog Sprint 6 (prioritizat)

| # | Feature | Prioritate | Efort estimat |
|---|---------|-----------|---------------|
| 1 | **Oblio invoicing** (e-factura) | CRITICAL | 2-3 zile |
| 2 | **Email notifications** (Resend) - confirmare comanda, schimbare status | HIGH | 1-2 zile |
| 3 | **SMS notifications** (SMSLink.ro) - status changes | HIGH | 0.5 zile |
| 4 | **Revenue charts** in admin dashboard (recharts) | MEDIUM | 1 zi |
| 5 | **Audit logging** - admin actions | MEDIUM | 1 zi |
| 6 | **Post-order delivery request** from account page | MEDIUM | 1-2 zile |
| 7 | **Stripe-Invoice reconciliation** for accounting | MEDIUM | 1 zi |
| 8 | **Date formatting** (Romanian locale) in admin | LOW | 0.5 zile |
| 9 | **Mobile responsive polish** | LOW | 1-2 zile |
| 10 | **Auto-generate docs at payment** (webhook trigger) | LOW | 0.5 zile |

---

## Fisiere cheie modificate (referinta rapida)

### Document Generation
| Fisier | Ce face |
|--------|---------|
| `src/lib/documents/generator.ts` | `buildClientDetailsBlock()` (legal format PF+PJ), all placeholders |
| `src/lib/documents/signature-inserter.ts` | DrawingML inline signature injection in DOCX |
| `src/lib/documents/auto-generate.ts` | Auto-gen contracts at submission |
| `src/app/api/admin/orders/[id]/generate-document/route.ts` | Document generation API |
| `src/app/api/contracts/preview/route.ts` | Contract preview (DOCX-to-HTML) |

### KYC & OCR
| Fisier | Ce face |
|--------|---------|
| `src/types/verification-modules.ts` | `KYCValidationResults`, `KYCDocumentValidation` types |
| `src/lib/services/document-ocr.ts` | Gemini 2.5 Flash OCR extraction |
| `src/lib/services/kyc-validation.ts` | Gemini 2.5 Flash KYC + face matching |
| `src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx` | Thumbnails, face match, confidence |
| `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx` | OCR with confidence, street fix |
| `src/providers/modular-wizard-provider.tsx` | `kycValidation` in wizard state |

### Admin Panel
| Fisier | Ce face |
|--------|---------|
| `src/app/admin/orders/[id]/page.tsx` | Order detail: KYC card, layout, billing, events |
| `src/app/admin/registru/page.tsx` | Registry page (NEW) |
| `src/app/admin/layout.tsx` | Sidebar cu Registru item |
| `src/app/admin/settings/page.tsx` | Settings (registry tab removed) |

### Order Flow
| Fisier | Ce face |
|--------|---------|
| `src/components/orders/steps-modular/review-step.tsx` | TVA 21%, option prices, breakdown |
| `src/components/orders/steps-modular/delivery-step.tsx` | Delivery selection |
| `src/components/orders/steps-modular/billing-step.tsx` | Billing PF/PJ |
| `src/components/orders/modules/signature/SignatureStep.tsx` | Signature + contract preview |
| `src/components/orders/modules/signature/ContractPreview.tsx` | Live contract preview |
| `src/app/api/orders/[id]/submit/route.ts` | KYC S3 upload at submission |

### API & Infrastructure
| Fisier | Ce face |
|--------|---------|
| `src/app/api/admin/settings/number-ranges/route.ts` | Number ranges CRUD |
| `src/app/api/admin/settings/number-registry/[id]/route.ts` | Registry entry management |
| `src/lib/aws/s3.ts` | S3 operations |
| `src/app/api/upload/route.ts` | Presigned URL generation |

---

## Documentatie actualizata

| Document | Ce s-a schimbat |
|----------|----------------|
| `docs/STATUS_CURRENT.md` | Added CLIENT_DETAILS_BLOCK, KYC confidence, testing items |
| `docs/DEVELOPMENT_MASTER_PLAN.md` | Session log, completed items, version 4.6 |
| `docs/README.md` | Session completions summary |
| `docs/technical/specs/number-registry-system.md` | Full specification (NEW) |
| `CLAUDE.md` | Tech stack updated (Gemini 2.5 Flash) |

---

## Cum sa continui lucrul

### Daca vrei sa testezi (QA)

1. `npm run dev` - porneste serverul local pe `localhost:3000`
2. Mergi la `/comanda/cazier-judiciar-pf` si parcurge flow-ul complet
3. Logheaza-te ca admin (`serviciiseonethut@gmail.com`, role: `super_admin`)
4. Verifica `/admin/orders/[id]` - date personale, KYC confidence, documente
5. Verifica `/admin/registru` - pagina noua cu tabel si export

### Daca vrei sa dezvolti (Sprint 6)

1. Citeste `docs/DEVELOPMENT_MASTER_PLAN.md` sectiunea "Sprint 6"
2. Prima prioritate: **Oblio invoicing** (e-factura obligatorie legal)
3. A doua prioritate: **Email notifications** (Resend) - templates + triggers
4. Env vars necesare (inca neconfigurate): `OBLIO_CLIENT_ID`, `OBLIO_CLIENT_SECRET`, `RESEND_API_KEY`, `SMSLINK_API_KEY`

### Daca ai intrebari

- **Arhitectura wizard**: `docs/technical/specs/modular-wizard-guide.md`
- **Document generation**: `docs/technical/specs/admin-document-system.md`
- **Number registry**: `docs/technical/specs/number-registry-system.md`
- **Admin panel**: `docs/admin/README.md`
- **RBAC**: `docs/admin/rbac-permissions.md`
- **Toate docs**: `docs/README.md` (index complet)

---

**Generat:** 2026-02-19
**Ultima sesiune:** 18-19 Februarie 2026
**Referinta completa:** `docs/DEVELOPMENT_MASTER_PLAN.md`
