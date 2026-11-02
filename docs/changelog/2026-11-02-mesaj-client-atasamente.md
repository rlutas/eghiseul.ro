# 02.11.2026 — Mesaj către client: puteți atașa poze sau PDF-uri
<!-- categorie: comenzi -->

## Pentru echipă

- În fereastra **„Mesaj către client”** de pe pagina comenzii a apărut butonul **„Atașează poză sau PDF”**, sub casetă. Același buton e și în portalul topografului.
- Puteți atașa până la **5 fișiere** de maximum **10 MB** fiecare: PDF, JPG, PNG sau WebP. Le vedeți în listă înainte de trimitere și le scoateți cu **X**.
- Exemplu: extrasul de carte funciară venit de la OCPI nu se poate folosi. Faceți o poză, o atașați și scrieți clientului ce nu e în regulă.
- Textul nu mai e obligatoriu când atașați ceva. Totuși, scrieți o propoziție care să spună ce e fișierul.
- Clientul primește emailul obișnuit, în care scrie câte fișiere are mesajul. Fișierele le deschide din pagina comenzii, la „Mesaje despre comandă”, nu din email.
- În fir, sub mesaj, fișierele se deschid cu un clic, atât la voi cât și la client.
- Documentul final al comenzii se trimite ca până acum, cu „Încarcă PDF și trimite clientului”, nu prin mesaje.
- Procedura completă: [Mesajele cu clientul](../admin/mesaje-client.md).

---

## Tehnic

**Cerere:** din Knowledge Center (echipa voia să arate clientului un extras CF neutilizabil). Până acum doar clientul putea atașa fișiere la mesaje; echipa și topograful scriau doar text.

**Stocare.** Fișierele echipei/topografului stau în S3 la `orders/<id>/mesaje-echipa/`, separat de actele clientului (`orders/<id>/acte-client/`), astfel încât o cheie de client nu poate trece drept fișier al echipei și invers. Coloana `order_messages.attachments` (jsonb, din migrarea 186) le ține în același format `{ key, name, mimeType, size, uploadedAt }`. **Fără migrare nouă**: coloana există deja, iar constrângerea `body` (1–4000 caractere) e satisfăcută de un text neutru pus de server când se trimit doar fișiere (`defaultBodyForAttachments`).

**Încărcare (presigned PUT, ca la `client-files`).**
- `POST /api/admin/orders/[id]/messages/files` — `requirePermission(…, 'orders.manage')`.
- `POST /api/collaborator/orders/[id]/messages/files` — `requireCollaboratorForOrder`, refuzat în previzualizarea din admin.
- Logica comună: `presignStaffMessageFile` (`src/lib/orders/message-files-presign.ts`), validare `validateMessageFileUpload` (tip PDF/JPG/PNG/WebP, 1 B–10 MB).
- Browserul: `uploadOrderFile(endpoint, file)` (extras din `uploadClientFile`, aceeași compresie a pozelor).

**Trimitere.** `postOrderMessage` acceptă `attachments` și pentru `team`/`collaborator`: `checkStaffAttachments` (≤ 5, toate în `mesaje-echipa/` al comenzii; altfel 400, nu le aruncă în tăcere), apoi `getFileInfo` (HEAD) pe fiecare — fișierul trebuie să existe și să aibă ≤ 10 MB (presigned PUT nu limitează mărimea); se salvează mărimea reală. Istoricul comenzii notează „(N atașamente)”.

**Descărcare client.** `GET /api/orders/[id]/messages/file?m=<messageId>&i=<index>[&token=]` — aceeași verificare de acces ca firul (`authorizeOrderClient`, extras în `src/lib/orders/message-access.ts`: proprietarul comenzii din sesiune sau tokenul order-client emis de pagina de status). Cheia S3 se citește din rândul mesajului (filtrat pe `order_id`), se reverifică namespace-ul (`isOrderMessageFileKey`) și se răspunde cu 302 spre un URL presemnat de 5 minute. Browserul clientului nu vede niciodată cheia. Merge și pentru atașamentele trimise chiar de client (până acum le vedea doar ca nume, fără link).

**Staff.** Firul din admin/portal folosea deja `withAttachmentUrls` (URL presemnat 15 min) — fișierele echipei apar automat.

**Email.** `renderOrderMessageToClientEmail` primește `attachmentCount`: rând „Mesajul are N fișiere atașate… le găsești în pagina comenzii”, butonul devine „Vezi mesajul și fișierele”. Fișierele nu se atașează la email.

**Teste.** `tests/unit/lib/orders/message-files.test.ts` (namespace, validare, listă, email), `tests/unit/api/order-message-attachments.test.ts` (presign admin/colaborator, POST cu atașamente, descărcare client: 400/403/404/302).
