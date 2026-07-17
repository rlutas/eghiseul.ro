# Registru Central de Numere Barou

> **Sursa unică de adevăr** pentru numerele de la Baroul Satu Mare (contract
> asistență juridică + împuternicire avocațială), partajată de **3 platforme**:
> eghiseul.ro, cazierjudiciaronline.com, ecazier.ro.
> Numerele se alocă **DOAR după plată reușită** — niciun număr ars pe comenzi
> neplătite.

**Implementat + LIVE:** 2026-07-09 (deploy ambele platforme; proiect Supabase
`registru-barou-central` / ksqkttalapjlgugshuks, eu-west-2)

**Intervale oficiale Barou 2026 (adresa oficială, seria SM):**
| Tip | Interval | Ultimul folosit manual (Sheets) | Următorul emis de registru |
|---|---|---|---|
| Contracte asistență juridică | 003551 – 006550 | 005771 | **005772** |
| Împuterniciri avocațiale | 005051 – 008050 | 007254 | **SM007255** |

**Jurnal**: importul complet din Google Sheets e FĂCUT (1982 contracte + 2203
delegații 2026, în intervalele oficiale) — fiecare delegație legată de
contractul ei (coloana H din sheet-ul de contracte; grupate prin
`order_ref = SHEET-XXXXXX`) cu serviciul pe fiecare (Cazier Fiscal, Apostilă
Haga la a 2-a delegație a contractelor cu apostilă etc.). Intrările test
migrate din registrul local eghiseul + intervalele legacy = ȘTERSE.

**✅ TOATE 3 PLATFORMELE VERIFICATE PE COMENZI REALE (2026-07-09):**
| Platformă | Comandă | Contract | Delegație |
|---|---|---|---|
| cazierjudiciaronline | CJO-20260709-14944 | 005774 | 007256 |
| ecazier | EJC-20260709-05461 | 005775 | 007257 |
| eghiseul | E-260709-V9G9M | 005778 | 007260 |

Interconectarea confirmată end-to-end: alocare automată la plată, un singur
șir comun de numere, jurnal central corect pe toate.

---

## De ce există

- Numerele vin de la Barou în **intervale finite pe an**, pe numele Cabinet
  Avocat Tarta — indiferent de platforma pe care intră comanda.
- **Înainte**: eghiseul aloca la submit (ÎNAINTE de plată → comenzile
  neplătite ardeau numere); CJO/ecazier n-aveau nimic — adminul ținea un
  Google Sheets și tastă manual numerele în admin.
- **Acum**: un proiect Supabase dedicat ține intervalele + jurnalul; toate
  platformele alocă automat, atomic și idempotent, la webhook-ul de plată.

| Platformă | Firmă | Cum alocă |
|---|---|---|
| eghiseul.ro | EDIGITALIZARE SRL | webhook Stripe / confirm-payment / cron orar |
| cazierjudiciaronline.com | EDIGITALIZARE SRL | webhook Stripe (`app_id=cjo`) |
| ecazier.ro (același repo cu CJO) | Cabinet Tarta | webhook-cabinet |

Intervalele sunt **comune** — un singur șir de numere curge în ordinea
plăților, indiferent de site (decizie 2026-07-09).

---

## Arhitectură

```
┌─────────────────────────────────────────────────────────┐
│ REGISTRU CENTRAL (proiect Supabase dedicat)             │
│  number_ranges    — intervale de la Barou, per an/tip   │
│  number_registry  — jurnal: fiecare număr consumat      │
│  RPC allocate_number (IDEMPOTENT) / void / find         │
│  RLS ON, zero policies → doar service key               │
└───────────▲──────────────────▲──────────────────────────┘
            │ supabase-js (service key, server-only)
   ┌────────┴────────┐  ┌──────┴───────────────────┐
   │ eghiseul.ro     │  │ cazierjudiciaronline.com │
   │                 │  │ + ecazier.ro (host-rewrite)│
   └─────────────────┘  └──────────────────────────┘
```

- **Schema**: `supabase/registry/001_registry_schema.sql` (repo eghiseul =
  casa canonică). NU e în `supabase/migrations/` — acela țintește DB-ul local.
- **Client partajat**: `src/lib/registry/client.ts` — IDENTIC în ambele
  repo-uri (dacă-l modifici, copiază-l și în celălalt).
- **Env** (server-only, ambele repo-uri + Vercel): `REGISTRY_SUPABASE_URL`,
  `REGISTRY_SUPABASE_SERVICE_KEY`.

### Cheia de idempotență

`allocate_number(platform, order_ref, type, service_type)`:
- dacă există deja alocare vie (ne-anulată) pentru cheie → o întoarce
  (`reused=true`), NU consumă număr nou;
- altfel alocă atomic (`FOR UPDATE` pe interval) + backstop unique partial
  index. Webhook dublu / retry / regenerare = zero numere irosite.
- `order_ref` = `friendly_order_id` (eghiseul) / `order_number` (CJO/ecazier).
- delegațiile multiple per comandă se disting prin `service_type`.

### Formate numere

| Tip | Format stocat | Exemplu |
|---|---|---|
| Contract asistență | padded 6, fără serie | `004271` |
| Împuternicire (delegație) | serie + padded 6 | `SM005757` |
| Contract prestări (EDIGITALIZARE) | `friendly_order_id` — NU consumă număr Barou | `E-260709-XXXXX` |

---

## Fluxul per platformă

### eghiseul.ro

1. **Submit** (pre-plată): se generează DOAR `contract-prestari`
   (client-visible, fără număr Barou). Zero alocare.
   → `src/lib/documents/auto-generate.ts` mode `'submit'`
2. **Plată reușită** (webhook Stripe → `handlePaymentSucceeded`, sau
   confirm-payment fallback): `ensureBarouDocumentsForPaidOrder(orderId)`
   → alocă nr. contract din registrul central, generează `contract-asistenta`
   (invizibil clientului), alocă toate delegațiile
   (`computeDelegationItems`), setează `orders.barou_numbers_allocated_at`.
   → `src/lib/documents/ensure-barou-documents.ts`
3. **Fail-soft**: registru picat → plata/factura/emailul NU suferă; event
   `barou_allocation_failed` în order_history; **cron orar**
   (`/api/cron/invoice-health-check`) reia comenzile plătite fără marker
   (lookback 14 zile, cap 20/rulare).
4. **Admin**: `generate-document` REFUZĂ alocarea pe comenzi neplătite (400);
   `/admin/registru` citește/scrie registrul central (intervale, jurnal,
   anulări, export CSV — acum cu coloană Platformă).

### cazierjudiciaronline.com / ecazier.ro

1. **Pre-plată**: contractul PDF (jsPDF) se generează la create-payment-intent
   fără număr oficial (placeholder = order number) — neschimbat.
2. **Plată reușită** (webhook CJO sau webhook-cabinet):
   `ensureBarouNumbersForOrder(orderNumber)` → alocă contract + delegație
   (+ a 2-a delegație la comenzile duale cazier+integritate →
   `delegation_integritate_number`, coloană NOUĂ — înainte o suprascria pe
   prima!), scrie pe comandă, **regenerează contractul PDF** cu „SM XXXXXX"
   (`src/lib/contract-regen.ts`, extras din ruta de delegație), setează marker.
   → `src/lib/registry/ensure-barou-numbers.ts`
3. **Admin**: inputurile Nr. Contract / Nr. Delegatie / Nr. Delegatie
   Integritate vin **prefilled** (webhook-ul a scris coloanele); override
   manual rămâne posibil. Butonul „Delegatie Integritate" trimite acum
   numărul lui propriu.
4. **Cron sweep**: `/api/cron/health-check` (orar) reia alocările ratate.
5. **Google Sheets = mort** după cutover.

---

## Reguli pe documente (cine ce număr poartă)

| Document | Număr | Format afișat |
|---|---|---|
| Contract Prestări Servicii (EDIGITALIZARE) — eghiseul + CJO | numărul COMENZII, NICIODATĂ numărul Barou | `E-260709-XXXXX` / `CJO-...` |
| Contract de Asistență Juridică (avocat) — toate platformele | nr. contract Barou | `NR. SM 005774` (padded 6) |
| Împuternicire / Delegație — toate platformele | nr. delegație Barou, UNUL PER DOCUMENT OFICIAL | `SM007256` |

⚠️ **Pe CJO/ecazier, coloanele `delegation_number` stochează DOAR numărul
padded (`007258`, FĂRĂ prefix SM)** — template-ul DOCX de împuternicire
tipărește deja „SERIA: SM NR:"; cu prefix apărea dublu („SM NR: SM007258").
Pe eghiseul, `order_documents.document_number` include seria (`SM007260`) —
template-ul de acolo folosește placeholders separate SERIE + NRDELEGATIE.

**Numele pe documente (CJO/ecazier): NUMELE de familie primul, apoi prenumele**
(la registru, împuternicire, contract PDF). Regula PF/PJ (eghiseul):
clientul/documentele urmează BENEFICIARUL serviciului — comanda PF cu factura
pe angajator rămâne PF (fix 2026-07-09, E-260709-V9G9M afișată ca INTERTEK).

⚠️ Fix 2026-07-09 (CJO `contract-pdf.ts`): titlul Prestări purta greșit
numărul Barou — mutat pe pagina „Contract de Asistenta". ecazier (variant
cabinet) era corect — acolo contractul ESTE al avocatului.

**Delegații multiple per comandă** — fiecare document oficial = delegația lui:
serviciu principal + certificat integritate add-on + câte una PER Apostilă
Haga. În admin eghiseul, împuternicirile se generează per serviciu (un rând
per delegație, fișiere separate). Serviciu extra neprevăzut după plasare →
`/admin/registru` → Alocare Manuală cu platformă + nr. comandă (sau, pe
eghiseul, generare împuternicire cu alt service_type).

## Jurnalul din /admin/registru — funcții

- Grupare pe comandă: contract + toate delegațiile lui pe UN rând (API-ul
  aduce automat frații grupului chiar dacă paginarea i-ar despărți).
- Numere padded ca pe documente (005774, SM007256); Sursa arată SITE-ul.
- Alocare manuală: implicit „Contract + Delegatie (legate)"; „Doar Delegatie"
  cu nr. contract existent opțional; opțional legată de o comandă (platformă +
  nr. comandă). După alocare, jurnalul sare pe pagina 1 (numărul nou primul).
- **Mod „Client avocat (personal)"** (2026-07-17): toggle în dialog — pentru
  clienții PROPRII ai avocatei (fără legătură cu platformele). Formular redus:
  nume + CNP + „pentru ce" + data (fără căutare comandă/email/CUI/sumă).
  Rolul `avocat` intră implicit pe acest mod. Intrările primesc „Client
  avocat" în descriere → badge „Client avocat" în jurnal + vizibil în export.
  Combo-urile manuale fără comandă primesc ref sintetic `MANUAL-XXXX` ca să
  rămână contract + delegație grupate pe un rând (ca `SHEET-` la import).
- **Export CSV** (2026-07-17): coloană nouă **Nr Contract** pe rândurile de
  delegație (contractul din același grup; fallback „Pentru contract NNNNNN"
  din descriere; la filtrul „doar delegații" contractele-frate se aduc
  separat) + coloană **Creat de**. Ref-urile sintetice SHEET-/MANUAL- nu se
  exportă la Comanda. Exportul citește direct registrul (mereu la zi, complet
  — paginat în chunks de 1000).
- Acțiuni per număr: ✏️ Editare (număr/serie/client/serviciu/descriere/sumă/
  dată — duplicatele respinse de UNIQUE), 🗑 Anulare (void, numărul NU se
  refolosește), pe anulate: ↩️ Restaurare, ❌ Ștergere definitivă (doar pentru
  intrări greșite/test).

## Acces

- Pagina `/admin/registru` + toate API-urile de registru cer permisiunea
  **`registry.manage`** (2026-07-09; înainte: settings.manage).
- O au implicit: **avocat** (rolul doamnei avocat — își alocă manual numere de
  contract/delegație când are nevoie, vede jurnalul, exportă CSV-ul pentru
  Barou), **manager** și **super_admin**; `settings.manage` o implică
  (nimeni nu a pierdut acces).
- Contul avocatei: gabriela_tarta@yahoo.com (rol **avocat**, creat 2026-07-09).
  Experiența ei e scopată complet: sidebar doar **Comenzi + Registru**,
  /admin o redirecționează la Registru, iar lista de comenzi arată DOAR
  serviciile cu avocat (fără constatator/CF/cadastru). Fără setări, useri,
  plăți, dashboard.

## Operare (echipă + avocat)

> Ghid prietenos pentru doamna avocat (gata de trimis): [ghid-avocat.md](ghid-avocat.md)

- **Vezi registrul**: eghiseul.ro → `/admin/registru` (jurnal cu toate
  platformele, filtre, export CSV pentru raportarea la Barou).
- **Adaugi interval nou** (numere noi de la Barou): `/admin/registru` →
  Intervale → Adaugă. Contract = fără serie; Delegație = serie (ex. SM).
  ⚠️ Înainte de 1 ianuarie trebuie să existe interval activ pe anul nou.
- **Anulezi un număr** (refund / greșeală): jurnal → Anulează (void). Numărul
  rămâne consumat, nu se refolosește niciodată.
- **Interval epuizat**: comenzile se procesează normal, alocarea rămâne pe
  retry (cron) + notă pe comandă; adaugi interval și cron-ul recuperează.
- **Intrare manuală** (cazuri personale avocat): jurnal → Adaugă manual
  (source `manual`, fără platformă/comandă).

## Failure modes (pe scurt)

| Situație | Comportament |
|---|---|
| Registru central picat la webhook | Plata se procesează normal; alocarea se reia automat (cron orar, 14 zile) |
| Webhook dublu / Stripe retry | RPC idempotent → același număr, zero duplicate |
| Regenerare document | Refolosește numărul existent (`reused=true`) |
| Refund | Numărul rămâne alocat; void manual din admin |
| Comandă neplătită | NU primește niciodată număr (gating și în admin) |

---

## Rollout / Cutover

**Precondiții:** proiect Supabase creat + schemă aplicată + env în Vercel
(ambele proiecte) + **reconciliere Google Sheets** (coliziunile între jurnalul
eghiseul și sheet se rezolvă cu echipa).

1. **Migrare date**: `npx tsx scripts/migrate-registry-to-central.ts`
   (opțiuni: `--dry-run`, `--delta` pentru fereastra de deploy,
   `--sheet=export.csv --sheet-platform=cazierjudiciaronline`).
   Scriptul face și bump la `next_number` peste maximul folosit.
2. **eghiseul**: rulează migrarea locală `104_barou_numbers_post_payment.sql`
   (marker + backfill comenzi plătite vechi) → deploy → script `--delta`.
3. **CJO/ecazier**: rulează migrarea `025_barou_registry_numbers.sql` →
   deploy.
4. **Verificare** (câte 1 comandă reală per platformă): rând nou în registrul
   central cu platforma corectă; eghiseul: contract-asistenta apare DUPĂ
   plată; CJO: numere prefilled în admin + titlu contract „SM XXXXXX";
   comandă duală → 2 delegații.
5. **Seed numerele reale 2026** de la Barou prin `/admin/registru`.
6. Tabelele locale eghiseul (`number_ranges`/`number_registry`) rămân
   read-only istorice (comentarii @deprecated din migrarea 104).

## Fișiere cheie

| Ce | Unde |
|---|---|
| Schemă centrală | `eghiseul.ro/supabase/registry/001_registry_schema.sql` |
| Client partajat | `{ambele}/src/lib/registry/client.ts` |
| eghiseul post-plată | `src/lib/documents/ensure-barou-documents.ts` + `auto-generate.ts` |
| eghiseul hooks | `api/webhooks/stripe`, `api/orders/[id]/confirm-payment`, `api/cron/invoice-health-check` |
| eghiseul admin | `api/admin/orders/[id]/generate-document` (gating), `api/admin/settings/number-{ranges,registry}/*`, `app/admin/registru/page.tsx` |
| CJO post-plată | `cazierjudiciaronline.com/src/lib/registry/ensure-barou-numbers.ts` + `contract-regen.ts` |
| CJO hooks | `api/stripe/webhook`, `api/stripe/webhook-cabinet`, `api/cron/health-check`, `api/admin/delegation` |
| Script migrare | `eghiseul.ro/scripts/migrate-registry-to-central.ts` |
| Spec registru original (istoric, doar eghiseul, pre-central) | `docs/technical/specs/number-registry-system.md` |

**Update 2026-07-13 (CJO):** numerele de delegație pentru Apostila Haga (alocate doar în registrul central, serviceType `apostila-haga:<target>`, fără coloană pe orders) sunt acum AFIȘATE în admin CJO pe cardul de împuternicire — endpoint nou `GET /api/admin/registry-numbers` (lookup `find_existing_number` per target). Commit CJO 349b4d82.
