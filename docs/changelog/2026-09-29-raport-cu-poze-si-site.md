# 29.09.2026 — „Raportează o problemă”: poze și alegerea site-ului
<!-- categorie: admin -->

## Pentru echipă

- **Problema raportată** (Ghid → Rapoarte, 29.09): „de adăugat opțiune de încărcat poză la «Raportează problema», ceva ușor de adăugat printscreen”. **Rezolvat.**
- În formularul „Raportează o problemă” din Ghid puteți pune acum **poze**, cel mult 5. Cel mai simplu: faceți captura de ecran și dați **Ctrl+V** (Mac: **Cmd+V**) în caseta de text. Merge și să trageți poza peste formular sau butonul **„Adaugă poză”**.
- Tot acolo bifați **pe ce site** e problema: eghiseul.ro, cazierjudiciaronline.com, ecazier.ro, documentero.ro. Puteți bifa mai multe.
- Raul vede pozele și site-urile direct în Rapoarte.
- Cum se face captura și restul pașilor: [Chatbotul Ghidului și rapoartele](../admin/chatbot-si-raportare.md).

---

## Tehnic

- `src/lib/knowledge/report-meta.ts` (nou, fără importuri de server): `REPORT_SITES`, `REPORT_SITE_LABEL`, limitele pentru capturi, `reportShotPrefix()`. Este re-exportat din `reports.ts`.
- `POST /api/{admin,collaborator}/knowledge/reports/upload`: `handleReportShotUpload` din `chat-route.ts` întoarce un URL S3 semnat pentru PUT (10 min), cu cheia `knowledge-reports/<reporterId>/<uuid>.<ext>`. Acceptă PNG/JPG/WEBP de cel mult 8 MB.
- `handleCreateReport` salvează `context.sites` (filtrat) și `context.attachments` (doar chei din folderul celui care raportează, cel mult 5). JSONB-ul existent, fără migrare.
- `ghid-ask.tsx`: paste din clipboard, drag & drop, input ascuns cu `ref.click()`, miniaturi cu stare, trimitere blocată cât urcă pozele. Bifele de site apar doar pentru `team`.
- `/admin/ghid/rapoarte`: chip-uri de site și miniaturi cu URL semnat pe o oră.
