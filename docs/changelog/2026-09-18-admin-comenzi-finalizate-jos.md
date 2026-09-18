# 18.09.2026 — Comenzile finalizate coboară sub cele vii în „Toate"
<!-- categorie: admin -->

## Pentru echipă

În `/admin/comenzi`, lista „Toate" arată acum întâi comenzile la care mai e
ceva de făcut (neplătite vii, plătite, în procesare, expediate), cele mai
recente sus, și abia după ele comenzile finalizate, anulate sau rambursate,
tot după recență. Nu se schimbă nimic la taburi sau la filtre.

Tot azi: o analiză a abandonurilor și a emailurilor (de ce pierdem 60% din
comenzile începute și de ce emailurile aduc puțin) — în `Marketing`,
„Analiza abandonurilor și emailurilor".

---

## Rezumat tehnic

- Migrarea **179**: `orders.is_closed` coloană generată STORED
  (`status IN ('completed','cancelled','refunded')`) + index
  `(is_closed, paid_at DESC NULLS FIRST, created_at DESC)`.
- `GET /api/admin/orders/list`: `.order('is_closed')` înaintea sortării
  existente pe `paid_at` / `created_at`.
- Analiză: `docs/marketing/2026-09-18-analiza-abandonuri-si-emailuri.md`.
