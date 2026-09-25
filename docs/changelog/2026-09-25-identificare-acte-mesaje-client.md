# 25.09.2026 — Identificare imobil: procesul confirmat cu topograful, actele clientului și mesajele pe comandă
<!-- categorie: comenzi -->

## Pentru echipă

- **Procesul la identificare e cel confirmat de Mircea.** Pasul 1: el găsește
  imobilul și clientul primește extrasul în 1–3 zile lucrătoare. Pasul 2: nu îl
  găsește, depune cerere la OCPI (~10 zile). Documentul OCPI e livrarea.
  **Extrasul după răspunsul OCPI e comandă nouă**, nu mai e inclus.
- **După proprietar, cu mai multe imobile:** Mircea îi scrie clientului lista,
  clientul alege unul și primește extrasul pentru el. Pentru celelalte face
  comenzi separate.
- **Clientul poate încărca acte la comandă** (extras CF vechi, titlu de
  proprietate, contract). Le vedeți în admin la „Date imobil”, iar Mircea le vede
  în portal.
- **Mesaje pe comandă:** echipa (card „Mesaje cu clientul” în admin) și Mircea (în
  portal) îi scriu direct clientului. Clientul primește email și răspunde din pagina
  comenzii (sau din contul lui, dacă are cont), cu poze. Răspunsul vine pe email la contact@ și la Mircea și apare ca
  „mesaj nou” în lista de comenzi. Nu mai treceți întrebările lui Mircea prin WhatsApp.
- **Termenul OCPI:** când depune, Mircea trece și data dată de OCPI. Clientul o vede
  în pagina comenzii.

Procedurile: [Identificare imobil: procesul complet](../admin/identificare-imobil-nereusita.md)
și [Mesajele cu clientul](../admin/mesaje-client.md).

---

## Tehnic

- Migrarea **186**: tabela `order_messages` (RLS fără politici, `REVOKE ALL` de la
  anon/authenticated, aplicată și verificată cu `has_table_privilege`);
  identificările pe `estimated_days = 3` / „1-3 zile lucrătoare”, `deliverable` nou
  pe proprietar.
- Mesaje: `src/lib/orders/messages.ts`, rute `admin|collaborator|orders/[id]/messages`,
  emailuri `src/lib/email/templates/order-message.ts`, componente
  `OrderMessagesPanel` (admin + portal, 3 șabloane la identificare) și
  `CustomerMessages` (pagina de status, banner „Ai un mesaj nou”, ancora `#mesaje`).
- Acces client fără sesiune: `order-client-token.ts` (HMAC, 24 h, audiență
  separată de payment-proof), emis de `/api/orders/status` ca `messagesToken`.
- Actele clientului: `POST /api/orders/[id]/client-files` (presigned PUT, draft prin
  `canUpdateDraft`, mutat în `src/lib/orders/draft-access.ts`), namespace
  `orders/<id>/acte-client/` verificat de `sanitizeClientFiles` la submit, la mesaje
  și în portal. Wizard: `SupportingDocsCard` în `PropertyDataStep` (doar
  `identificationService`), `uploadClientFile` comprimă pozele.
- Contul clientului: `CustomerMessages` și pe `/account/orders/[id]` (sesiune, fără token), eticheta „Termen dat de OCPI” pe cardul de estimare.
- Liste: `unread_messages` în `/api/admin/orders/list` și `/api/collaborator/orders` (`unreadClientMessageCounts`), iconiță/badge cu link pe `#mesaje`.
- Depunere: `termenOcpi` → `ocpi_submission.termen_ocpi` + `estimated_completion_date`;
  status API: `ocpiTerm`, `ocpiRegistrationNumber`, `unreadMessages`.
- Texte: emailul `identification-pending-ocpi` (fără extras promis după OCPI),
  `customer-status` / `customer-next-step`, paginile `identificare-imobil` și
  `identificare-imobile-proprietar` (secțiunea `IdentificationProcessSection`, FAQ
  noi, livrabilul „după proprietar” = un extras, nu „lista”), textul din wizard
  („costuri suplimentare” scos).
- Teste noi: `client-files`, `order-client-token`, `order-message` (10);
  suita întreagă 2045 verzi, `tsc` curat.
- **Testat cap-coadă pe live (25.09, după deploy)**, cu comenzi de test marcate „plătite” direct în
  DB (fără Stripe, cu `invoice_number` fals, ca să nu emită Oblio), apoi șterse:
  - client fără cont (`E-260925-67DA8`): act încărcat în wizard (S3 + draft), ștergere act, submit
    păstrează cheia; acces refuzat fără token / cu alt email / tip de fișier greșit;
  - topograf (cont de test, `assigned_collaborator_id`): vede actul (200, jpeg), trimite mesaj cu
    șablonul „Mai multe imobile găsite” → email în Inbox cu textul întreg; „Mesaj nou” în listă;
    „Nu am găsit” → status + email nou (fără extras promis); depunere cu termen → „Termen dat de
    OCPI: 9 octombrie 2026 (cererea nr. …)” la client;
  - client din linkul de email: derulare la `#mesaje`, badge „nou”, răspuns cu text și cu poză →
    email „Răspuns de la client” la topograf (Mircea NU, datorită atribuirii explicite);
  - admin: fir complet, „văzut de client”, act deschis din „Date imobil”, mesaj → email la client,
    iconița de mesaj în lista de comenzi;
  - client cu cont (`E-260925-7ZV77`, după proprietar): upload prin sesiune, comanda legată de cont,
    mesaj de la echipă văzut și răspuns din `/account/orders/[id]`;
  - chatbotul din Ghid (echipă + topograf) răspunde corect la 4 întrebări, cu sursele noi.
- Reparat în timpul testului: vezi [„Plătește” trimitea draftul nesalvat](2026-09-25-plateste-draft-nesalvat.md);
  eticheta din admin „Termen estimat … (3 zile lucrătoare)” devine „Termen dat de OCPI: …” când
  topograful a trecut termenul; confirmarea „Mesaj trimis” apare după reîncărcarea firului;
  răspunsurile clientului merg doar la colaboratorul atribuit explicit, când există.
