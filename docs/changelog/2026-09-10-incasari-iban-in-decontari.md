# 10.09.2026 (partea a doua) — încasările prin IBAN ajung în decontări

Continuare la [reparația fluxului de transfer bancar](2026-09-10-plata-transfer-bancar-reparata.md).
După ce comanda a căpătat un loc unde să aștepte banii, mai lipsea capătul
celălalt: **banii care intră în cont nu se legau de nicio comandă.**

## Ce lipsea

Importul de extras (`/admin/decontari/banca`) potrivea **doar** creditele
Stripe cu payout-urile. O plată venită direct de la client cădea pe categoria
`altele`, fără contraparte și fără legătură cu comanda. Practic, din decontări
nu aveai cum să afli că `E-260905-DMUZA` fusese plătită.

În plus, comanda ajunsese pe „În procesare" **fără plata confirmată**, deci fără
factură — și nimic din interfață nu semnala asta, fiindcă lista arată statusul
de lucru, nu pe cel al plății.

## Ce s-a livrat

**1. Categoria „Încasare client".** Orice linie de credit care poartă IBAN-ul
plătitorului e recunoscută ca încasare de la client. Regula stă după cele pentru
Stripe și pentru aportul propriu, care au și ele IBAN în descriere, deci nu le
fură liniile. Numele plătitorului se extrage din segmentul dinaintea IBAN-ului.

**2. Potrivirea cu comanda**, în două trepte:

| Semnal | Când se aplică |
|---|---|
| numărul comenzii în „detalii plată" | clientul e instruit prin email să-l treacă — potrivire directă |
| suma exactă | doar dacă **o singură** comandă neconfirmată din ultimele 90 de zile are exact suma; altfel linia rămâne nelegată |

Ambiguitatea nu se rezolvă prin ghicit: două cazieri de 89 lei în aceeași
săptămână lasă linia cu triunghi galben, pentru om.

**3. „Confirmă plata" direct din extras.** Linia potrivită are un link către
comandă cu referința tranzacției în URL, iar câmpul de referință din panoul
comenzii vine **precompletat**. Importul nu marchează nimic ca plătit — decizia
rămâne a operatorului.

**4. Statusul de lucru nu se mai pierde.** `fulfilManuallyPaidOrder` punea
comanda pe `paid` necondiționat; o comandă deja avansată (exact cazul DMUZA,
ajunsă pe „În procesare") era trasă înapoi. Acum își păstrează statusul, iar
istoricul notează asta.

**5. Banner roșu „Comandă în lucru, dar plata NU e confirmată"** pe orice
comandă avansată în flux cu `payment_status` diferit de `paid`. Exact starea în
care a stat DMUZA cinci zile fără ca cineva să observe.

## Migrarea 155

`bank_statement_entries.matched_order_id` (uuid, `ON DELETE SET NULL` — ștergerea
unei comenzi nu are voie să șteargă o linie de extras, care e document
contabil) + index parțial.

## Fișiere

- `src/lib/accounting/bank-statement.ts` — categorie, extragerea plătitorului,
  numerele de comandă din descriere, potrivirea cu comenzile
- `src/app/admin/decontari/banca/page.tsx` — coloana „Comandă" + rezultatele importului
- `src/app/admin/orders/[id]/page.tsx` — referință precompletată din `?ref=`, banner
- `src/lib/orders/fulfil-paid.ts` — păstrarea statusului de lucru
- `tests/unit/lib/accounting/bank-statement-incasari.test.ts` — 9 teste
- `supabase/migrations/155_incasari_client_extras_banca.sql`

## Testat

Cele 9 teste noi acoperă exact liniile care se pot confunda: încasare de la
client, aport propriu, decontare Stripe și un debit cu IBAN (plată către
furnizor, nu încasare). Plus extragerea numelui și a numărului de comandă. Suita
completă: 1614 teste trecute.

**6. Eticheta metodei de plată.** `orders.payment_method` primește valori din
trei locuri: checkout-ul scrie `bank_transfer`, confirmarea manuală o
**suprascrie** cu `transfer`/`cash`, iar webhook-ul Stripe nu atinge coloana
deloc. Lista de comenzi testa doar `=== 'bank_transfer'`, deci un transfer
confirmat apărea drept **„Card"** — la fel și cash-ul. Sursă unică nouă în
`src/lib/admin/payment-method.ts`, folosită de listă și de pagina comenzii.

## E-260905-DMUZA — rezolvată

Echipa a apăsat „Confirmă plata" pe 10.09.2026 la 11:39, cu referința reală din
extras. Rezultatul:

| | |
|---|---|
| Referință | `C31ZEXA26251016D` |
| Factură | **EGH-0647**, emisă în Oblio |
| Email de confirmare | trimis clientului la 11:39:59 |
| Status | `submitted_to_institution` |

Plata a venit ca **încasare SEPA din Germania: 324,66 EUR la curs 5,2508**,
pentru o comandă de 1.646,00 RON. Detaliile transferului conțineau numărul
comenzii, deci la importul extrasului pe septembrie linia se va lega singură —
verificat pe datele reale: potrivirea reușește atât pe numărul comenzii, cât și
pe referință. Pe sumă NU ar fi mers, fiindcă echivalentul în lei al încasării
diferă de totalul comenzii. Ăsta e și motivul pentru care numărul comenzii în
„detalii plată" nu e un moft: e singurul lucru care traversează conversia
valutară neschimbat.

## ⚠️ Rămâne de făcut

Extrasul pe septembrie nu e încă importat (datele din `bank_statement_entries` se
opresc la 31.08.2026). Când îl urci în „Extras bancă", încasarea de 08.09 se
leagă de comandă și apare cu bifă lângă factura EGH-0647. Nu e urgent — comanda
e deja rezolvată — dar închide reconcilierea pe septembrie.
