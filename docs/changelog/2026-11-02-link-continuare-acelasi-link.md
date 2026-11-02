# 02.11.2026 — Linkul de continuare nu se mai strică dacă îl generați de mai multe ori
<!-- categorie: comenzi -->

## Pentru echipă

- Butonul „Link de continuare" dă acum **același link** cât timp linkul trimis clientului e încă valabil. Doar termenul se prelungește la 48 de ore.
- Până acum fiecare apăsare făcea un link nou și îl anula pe cel trimis înainte. Clientul deschidea linkul primit și nu mergea (așa s-a întâmplat pe E-261007-WQHZJ: 5 linkuri în 4 minute, doar ultimul era bun).
- Puteți apăsa butonul de câte ori e nevoie. Linkurile trimise rămân valabile.
- La comenzile documentero, linkul se deschide acum pe documentero.ro, nu pe eghiseul.ro.

---

## Tehnic

- `POST /api/admin/orders/[id]/resume-link`: refolosește `resume_token` dacă mai are peste 2h de viață; altfel generează unul nou. `resume_token_expires_at` se mută mereu la +48h.
- URL-ul se construiește cu `appBaseForOrder(order)` (după `orders.platform`) în loc de `NEXT_PUBLIC_APP_URL`.
- Istoric: „Link de continuare retrimis (același link…)" când se refolosește.
- Test: `tests/unit/api/admin-resume-link.test.ts`.
