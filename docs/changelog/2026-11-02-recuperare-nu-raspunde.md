# 02.11.2026 — Recuperare telefonică: căsuțele „Nu a răspuns”
<!-- categorie: clienti -->

## Pentru echipă

- În **Recuperare telefonică** (pe eGhiseul și pe CazierJudiciarOnline) sunt acum **două căsuțe înaintea numelui** clientului.
- Ați sunat și n-a răspuns? Bifați prima căsuță. A doua oară tot nu? Bifați-o pe a doua.
- După a doua bifă clientul **iese din „De sunat”** și nu-l mai sunăm. Dacă face o comandă nouă, apare din nou.
- Bifă greșită? Debifați ultima căsuță bifată. Cu mouse-ul pe căsuță vedeți data și cine a încercat.
- Clienții închiși așa se văd cu „Arată și sunate”, marcați „Nu răspunde ×2”. Procedura: [Recuperare telefonică](../admin/recuperare-telefonica.md).

---

Cerere echipă din 07.10.2026: „fă gen 2 căsuțe și le bifăm când nu răspunde. și abia după 2 încercări o să închidem complet recuperarea”.

**Schema.** `orders.phone_no_answer_attempts jsonb NOT NULL DEFAULT '[]'` = `[{ at, caller }]`, max 2 (eGhiseul `196_phone_no_answer_attempts.sql`, CJO `043_orders_phone_no_answer.sql`; pe CJO coada listează doar comenzi, deci coloana e doar pe `orders`, nu pe `abandoned_sessions`). Migrările NU sunt aplicate încă: codul citește coloana în coada de recuperare, deci se aplică înainte de deploy.

**API.**
- eGhiseul: `POST /api/admin/orders/[id]/phone-no-answer`, `orders.manage`, body `{ action: 'add' | 'undo', caller }`, răspuns `{ success, data: { id, attempts } }`; 409 la a treia bifă sau la `undo` fără încercări. Audit `order_history.event_type='phone_contact_logged'` (valoare deja permisă de CHECK).
- CJO: `POST /api/admin/phone-recovery/[id]/no-answer`, `isAdminAuthenticated`, același body; audit în `order_status_history` ca notă cu `changed_by='system-phone-recovery'` (apare în Istoric Status, nu în Note Echipă).

**Coada.** `buildNoAnswerIndex` (email + ultimele 9 cifre ale telefonului) peste toate comenzile din fereastră; `isClosedByNoAnswer` scoate comanda dacă a fost creată până la a doua încercare. Închiderea urmează clientul, nu comanda: altfel, după dedup pe email, o comandă mai veche a aceluiași client ar fi reapărut. Bifele se pun pe rândul văzut (cea mai nouă comandă a emailului).

**Nu e apel.** `phone_contacted_at` rămâne neatins: încercările fără răspuns nu intră în KPI-uri și nici în „Recuperate”. „Nesunate în 7 zile” nu-i mai numără pe cei închiși.

**Fișiere eGhiseul:** `src/lib/orders/phone-no-answer.ts`, `src/app/api/admin/orders/[id]/phone-no-answer/route.ts`, `src/app/api/admin/orders/priority-calls/route.ts`, `src/app/(eghiseul)/admin/recuperare-telefonica/page.tsx`, `tests/unit/lib/orders/phone-no-answer.test.ts`. **CJO:** `src/lib/phone-recovery.ts`, `src/app/api/admin/phone-recovery/[id]/no-answer/route.ts`, `src/app/api/admin/phone-recovery/route.ts`, pagina, `MarkCalledDialog.tsx` (exportă citirea numelui memorat), `tests/unit/lib/phone-recovery-no-answer.test.ts`.
