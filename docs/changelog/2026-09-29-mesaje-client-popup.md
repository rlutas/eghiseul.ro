# 29.09.2026 — „Mesaje cu clientul” mutat jos, cu buton și fereastră
<!-- categorie: admin -->

## Pentru echipă

- Pe pagina comenzii, „Mesaje cu clientul” nu mai stă deschis sus, lângă „Note Echipă”. Echipa scria acolo observații interne crezând că sunt note, iar ele plecau la client pe email.
- Acum e o bară **jos**, deasupra istoricului comenzii. Apăsați **„Scrie clientului”** (sau „Vezi / scrie clientului”, dacă există mesaje). Se deschide o fereastră cu avertismentul că mesajul ajunge la client.
- Observațiile interne se scriu în continuare în **„Note Echipă”**, sus.
- Dacă clientul a răspuns și nimeni nu a citit, bara e galbenă și scrie „răspuns nou”. Din lista de comenzi, linkul spre mesaje deschide fereastra direct.
- Procedura: [Pagina comenzii](../admin/pagina-comenzii.md) și [Mesajele cu clientul](../admin/mesaje-client.md).

---

## Tehnic

- `src/components/orders/OrderMessagesPanel.tsx`: `OrderMessagesLauncher` nou (bară + `Dialog`). Panoul primește `bare` (fără titlu) și `onSent`. Portalul colaboratorului folosește în continuare panoul deschis.
- `GET /api/admin/orders/[id]/messages?peek=1` întoarce doar `{ total, unreadFromClient, lastAt }` și NU marchează răspunsurile clientului ca citite. Fără `peek`, comportamentul e cel vechi (marchează la deschiderea ferestrei).
- `src/app/(eghiseul)/admin/orders/[id]/page.tsx`: panoul scos de deasupra notelor; lansatorul pus după `ProcessingSection`, înainte de istoricul comenzii. Hash-ul `#mesaje` (din lista de comenzi) deschide fereastra la încărcare.
