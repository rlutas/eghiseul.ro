# 14.10.2026 — Meniul din admin arată corect pe ce pagină sunteți
<!-- categorie: admin -->

## Pentru echipă

- Când apăsați **Abandonuri**, în meniul din stânga se evidențiază acum **Abandonuri**, nu „Comenzi”. Pe celelalte taburi ale listei și pe pagina unei comenzi rămâne evidențiat „Comenzi”.
- Link-urile din meniu duc direct la adresa finală, fără ocolul prin care uneori click-ul părea că nu face nimic.

---

## Tehnic

- `admin/layout.tsx`: linkurile din meniu sunt în `AdminNavLinks` (sub `Suspense`), care citește `useSearchParams()`. Înainte, elementul activ cu query (`Abandonuri` = `/admin/orders?status=abandoned`) se calcula din `window.location.search` o singură dată (nu se re-randa la schimbarea filtrului), iar „Comenzi” se potrivea pe orice `/admin/orders*`.
- Reguli: Abandonuri = lista cu `status=abandoned`; Comenzi = lista pe orice alt tab + pagina comenzii; restul = calea exactă sau sub-căi. `aria-current="page"` pe elementul activ.
- `withSlash()`: hrefs cu `/` final (site-ul are `trailingSlash`), fără redirect 308 la fiecare click.
