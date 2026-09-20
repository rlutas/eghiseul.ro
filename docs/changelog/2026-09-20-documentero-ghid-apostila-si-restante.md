# 20.09.2026 — documentero.ro: al doilea ghid (apostila), cifra reală pe „Despre”, dezabonare pe brand, contract fără link vechi, tipuri DB
<!-- categorie: seo -->

## Pentru echipă

- Ghid nou pe documentero.ro: „Apostila de la Haga pe acte de stare civilă:
  când e nevoie și când nu”. Explică clienților din diaspora când NU au nevoie
  de apostilă (în UE, extrasul multilingv) și cine o pune când e nevoie
  (Prefectura, pe original). Prețurile din ghid vin din catalog.
- Pagina „Despre” arată acum o cifră reală: 40+ acte de stare civilă din
  iulie 2026 (44 comenzi plătite în baza de date). Se actualizează manual.
- Pagina de dezabonare de la emailurile de marketing arată brandul de pe care
  a venit linkul (documentero sau eghiseul).
- Contractul de prestări generat pentru comenzile documentero nu mai conține
  linkul vechi spre termenii eghiseul; adresa scrisă în contract e cea a
  brandului.

---

## Rezumat tehnic

- `src/app/documentero/ghiduri/apostila-acte-stare-civila/page.tsx`: `Article`
  JSON-LD cu autorul real, cuprins, prețuri din `getServicePricing` +
  `optionPrice('apostila_haga' | 'traducere_autorizata')`; `GUIDES` →
  `published: true`; sitemap (0.7, 2026-09-20); cardul „apostilă” de pe
  `/extras-multilingv/` trimite la ghid.
- `src/app/documentero/despre/page.tsx`: `[N]` → `40+` (SQL 20.09: 44 comenzi
  `paid` pe sluguri de stare civilă din 07.07.2026).
- `src/app/api/contacts/unsubscribe/route.ts`: `getBrand()` din host →
  titlu, contact, link „Înapoi”.
- `src/templates/shared/contract-prestari.docx`: wrapper-ul `<w:hyperlink>`
  din jurul `{{TC_URL}}` scos (ținta din `word/_rels` nu se templetiza și
  rămânea eghiseul); textul rămâne URL-ul brandului.
- `src/types/supabase.ts`: `orders.platform` adăugat manual în Row/Insert/
  Update (migrarea 181) — selecturile tipate cu `platform` nu mai cad pe
  `SelectQueryError`; `as any`-urile existente pot fi curățate treptat.
- JSON-LD validat structural pe 7 pagini locale (Organization, WebSite,
  BreadcrumbList, Service+Product fără `aggregateRating`, Article cu autor și
  date, FAQPage): fără erori.
