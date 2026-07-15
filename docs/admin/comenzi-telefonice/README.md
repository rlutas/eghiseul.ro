# Comenzi telefonice (create de admin, A→Z)

**Livrat:** 2026-07-15 · **Platforme:** eGhișeul (LIVE) + CJO/eCazier (în lucru, aceeași arhitectură) · **Migrări:** 125, 126 (rulate în producție)

Echipa preia comenzi la telefon/WhatsApp și le introduce în platformă de la A la Z. Plata se ia prin link trimis clientului SAU se marchează manual (transfer/cash). După plată, clientul primește un **link personalizat** unde încarcă actele (CI + selfie) și semnează — atât și nimic altceva.

---

## Fluxul pentru echipă (pas cu pas)

### 1. Creezi comanda
- **Admin → Comenzi → „+ Comandă nouă"** → alegi serviciul (căutare + categorii).
- Se deschide **wizard-ul real de comandă** în mod telefonic (`/comanda/[slug]?telefonic=1`) — completezi exact ca clientul:
  - **PF sau PJ** — la PJ introduci **CUI-ul → datele firmei se precompletează din ANAF**;
  - câmpurile specifice serviciului (constatator: tip document + motiv; carte funciară: județ/localitate/nr. CF; identificare imobil; stare civilă etc.);
  - **toate opțiunile** cu prețuri live, **cupoane/discount**, **curier real cu cotații** (Fan/Sameday/lockere);
  - pașii de **acte + semnătură NU apar** — îi face clientul mai târziu.
- Butonul final: **„Creează comanda (X RON, fără plată)"** → aterizezi pe pagina comenzii în admin.
- Comanda apare cu banner albastru **„📞 Comandă telefonică — neplătită"**.

### 2. Iei plata (două variante, ambele din banner)
- **„Trimite link de plată"** — clientul primește pe email un buton de plată (card/Apple Pay/Google Pay). Link-ul e pagina noastră de checkout, deci **nu expiră**. La plată, automat: factură Oblio + numere Barou + contracte + email de confirmare + joburi ONRC/ANCPI. Poți și copia link-ul (WhatsApp/SMS).
- **„Marchează plătită manual"** — pentru transfer bancar sau cash. **Referința e obligatorie** (nr. tranzacție / chitanță). Rulează ACELAȘI lanț ca plata cu cardul, cu factura Oblio pe încasarea corectă (Transfer bancar / Cash — apare corect în Decontări). Dublu-click = fără efect (idempotent).

### 3. Trimiți link-ul de completare (după plată)
- Banner-ul devine „plătită, acte/semnătură în lucru" → **„Trimite link de completare (acte + semnătură)"**.
- Clientul primește email cu link `/completare/[token]` (valabil **7 zile**):
  1. **Confirmă emailul comenzii** (protecție anti-forwarding — vezi Securitate);
  2. Încarcă actele cerute (CI + selfie, deduse din configul serviciului);
  3. **Semnează pe ecran** (deget/mouse) cu consimțămintele legale.
- Cât timp așteaptă clientul, comanda stă în **„Așteptare client"** (SLA pauzat). Când termină: comanda **revine automat** la statusul dinainte (SLA prelungit cu zilele de pauză), **contractele se regenerează CU semnătura** (cele generate la plată erau nesemnate) și **echipa primește email**.
- Link expirat / client blocat → apeși din nou butonul: link-ul vechi se anulează, se emite unul nou.

### Cazuri speciale
- **Doar semnătura** (actele există deja): link-ul cere numai semnătura.
- **Email greșit introdus la creare**: gate-ul de confirmare blochează clientul — corectezi emailul pe comandă și retrimiți link-ul. (La creare se verifică MX-ul domeniului tocmai ca să prindem typo-urile.)
- **Client plătește link-ul după ce ai marcat manual**: blocat — checkout-ul refuză comenzile deja plătite.
- **Refund pe plată manuală**: nu există PaymentIntent Stripe — rambursarea se face manual (transfer înapoi), nu din dialogul Modify.

---

## Arhitectura tehnică (eGhișeul)

### Creare
| Piesă | Fișier |
|---|---|
| Selector serviciu | `src/app/admin/orders/new/page.tsx` |
| Mod telefonic în wizard (sare kyc+semnătură) | `src/providers/modular-wizard-provider.tsx` (`isPhoneOrderMode`, `applyPhoneMode`) |
| CTA final + apel finalize | `src/components/orders/modular-order-wizard.tsx` (`handleSubmitOrder`) |
| Finalizare draft→pending | `POST /api/admin/orders/create-from-draft` — guards billing (`getMissingInvoiceClientFields`) + MX email; `channel='phone'`, `created_by_admin`, `user_id=null` (detașat de contul adminului), race-safe (`.eq('status','draft')`) |
| Creare din API (fără UI, pt automatizări) | `POST /api/admin/orders/create` — prețuri EXCLUSIV server-side din `services.base_price` + `service_options` |

### Plată
| Piesă | Fișier |
|---|---|
| Link plată | `POST /api/admin/orders/[id]/send-payment-link` — link = `/comanda/checkout/[id]` (pagina publică existentă; mintează sesiune Stripe nouă la fiecare vizită → nu expiră; webhook-ul existent face tot) |
| Email link plată | `src/lib/email/templates/payment-link.ts` |
| Plată manuală | `POST /api/admin/orders/[id]/mark-paid` (metodă+referință obligatorii) → `src/lib/orders/fulfil-paid.ts::fulfilManuallyPaidOrder` — oglinda lanțului din webhook: `ensureInvoiceForPaidOrder(collect)`, `upsertContactForPaidOrder`, confirmare, `ensureOnrcJob/AncpiJob`, `ensureBarouDocumentsForPaidOrder`; totul idempotent/fail-soft |
| Banner admin | `PhoneOrderActions` în `src/app/admin/orders/[id]/page.tsx` |

### Completare (acte + semnătură)
Refolosește integral infrastructura „Solicită documente" (`reupload_requests`), extinsă cu discriminatorul `flow='completion'`:

| Piesă | Fișier |
|---|---|
| Emitere link | `POST /api/admin/orders/[id]/request-completion` — doar pe comenzi plătite; docTypes din `verification_config.personalKyc` (override posibil, `[]` = doar semnătura); `require_email_confirm=true`; `signature_required` dacă lipsește semnătura; un singur link activ/comandă; auto-standby cu `return_status` |
| Email client | `src/lib/email/templates/completion-request.ts` |
| Pagina client | `src/app/completare/[token]/page.tsx` (confirmare email → upload → canvas semnătură + consimțăminte) |
| Gate + payload | `GET /api/reupload/[token]` (pre-confirmare: DOAR `{usable, requiresEmailConfirm, expiresAt}` — zero PII) · `POST /api/reupload/[token]/verify` (compară emailul, întoarce proof + lista actelor) |
| Upload | `POST /api/reupload/[token]` (ruta existentă; în flow=completion cere headerele de proof) |
| Semnătură | `POST /api/reupload/[token]/signature` — `uploadOrderSignature` S3 + `signature_metadata` EXACT ca la submit (IP, UA, timestamp, hash SHA-256 al documentului, consimțăminte — Legea 214/2024, eIDAS art. 25) + `contract_signed_at` |
| Finalizare | `src/lib/reupload/finalize.ts` — ieșire standby (SLA shift), **regenerare documente cu semnătura** (`autoGenerateOrderDocuments`, chei S3 deterministe suprascriu versiunile nesemnate; alocarea Barou idempotentă), notificare echipă |

### DB (migrarea 125 + 126)
- `orders` += `channel` ('web'|'phone'), `created_by_admin` (FK profiles), `payment_reference`.
- `reupload_requests` += `flow` ('reupload'|'completion'), `require_email_confirm`, `signature_required`, `signature_completed_at`, `email_confirm_attempts`.
- Funcție `increment_email_confirm_attempts(uuid, int)` — increment ATOMIC sub prag (migrarea 126).

---

## Securitate

1. **Token opac** `randomBytes(32).base64url`, TTL 7 zile, tabelă cu RLS fără politici publice (doar service-role).
2. **Gate de email** (lecția incidentului draft-hijack E-260710-2S5EH): GET-ul pe token nu dezvăluie NIMIC; clientul trebuie să introducă emailul comenzii; la potrivire primește `proof = HMAC-SHA256(secret, token|email)` — cerut apoi pe upload și semnătură (comparare constant-time). Cine interceptează doar link-ul nu poate face nimic fără email.
3. **Anti-brute-force**: contor atomic în SQL, lock definitiv la 10 încercări greșite (verificat cu 15 cereri PARALELE → exact 10 numărate).
4. **Prețuri** imposibil de influențat din client la crearea prin API (id-uri → prețuri din DB).
5. **`?telefonic=1` public inofensiv**: finalizarea cere sesiune admin cu `orders.manage` (401 altfel).
6. **Idempotență plată manuală**: lock-ul atomic de facturi (`ensure-invoice`) + constrângeri unice pe joburi + `barou_numbers_allocated_at` — dublu-click nu dublează nimic financiar.

## Verificat (2026-07-15)

- tsc + eslint + 1156 teste unit + CI verde.
- Live: gate email (nimic pre-confirmare, 403 pe email greșit, payload+proof pe corect), upload fără proof = 403, semnătură cu consimțăminte = salvată + finalizare, flux doar-semnătură = `allDone`, lock brute-force paralel = exact 10.
- Vizual (Playwright): mod telefonic = 5 pași (fără Documente KYC + Semnătură); fără parametru = 7 pași.
- Code-review de securitate: 2 findinguri (doar-semnătură blocat + contor ne-atomic) — ambele reparate + retestate (`dd9df3a`).

## Rămase / de urmărit

- **Primul test real**: o comandă telefonică mică reală cap-coadă (creare → link plată → completare) — recomandat înainte de folosire intensă.
- **CJO/eCazier**: implementarea e în lucru (aceeași arhitectură; semnarea acolo = buton „Semnez electronic" + checkbox, nu canvas; facturare Oblio/SmartBill după tenant).
- **Badge listă**: comenzile telefonice plătite fără acte/semnătură nu au încă un marcaj distinct în lista de comenzi (banner-ul de pe pagina comenzii acoperă cazul).
