# 01.10.2026 — Portalul topografului nu mai ascunde comenzile noi
<!-- categorie: comenzi -->

## Pentru echipă

Comanda E-261001-6JVWA (extras carte funciară) a fost plătită, iar topograful a
primit emailul, dar în portalul lui comanda nu apărea. Cauza: lista din portal
arăta maximum 200 de comenzi, începând cu cele mai vechi. Când s-au strâns 201
(din care 181 finalizate), cea mai nouă a căzut din listă.

Acum lista arată mereu TOATE lucrările deschise (de depus, depuse, blocate),
indiferent câte comenzi vechi există. La „Livrate” apar ultimele 300. Nu trebuie
făcut nimic: comanda apare de la sine după reîncărcarea paginii.

---

## Tehnic

- `GET /api/collaborator/orders` făcea un singur query cu `.order(priority desc,
  created_at asc).limit(200)`. Mircea avea 201 comenzi plătite în scop (181
  `completed`), deci ultima creată era tăiată.
- Acum două query-uri: comenzile nefinalizate (`status NOT IN
  CERERE_DONE_STATUSES`, limită de siguranță 1000) + cele finalizate (cele mai
  recente 300). Rezultatul se sortează în memorie: `priority` desc, apoi
  `created_at` asc, ca înainte.
- Contractul răspunsului nu se schimbă. ZIP-ul de cereri
  (`/api/collaborator/cereri`) exclude deja statusurile finalizate, deci nu are
  aceeași problemă.
