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

## ⚠️ Rămâne de făcut

`E-260905-DMUZA` **încă nu are factură**. Îi lipsește referința tranzacției din
extras, iar extrasul pe septembrie nu era importat (datele se opresc la
31.08.2026). Două căi, ambele duc în același loc:

1. exportă extrasul pe septembrie din BT și urcă-l în „Extras bancă" — linia se
   leagă singură de comandă, apoi apeși „Confirmă plata" cu referința
   precompletată;
2. sau deschide comanda direct și scrii numărul tranzacției de mână.

Abia atunci se emite factura Oblio și pleacă emailul de confirmare către client.
