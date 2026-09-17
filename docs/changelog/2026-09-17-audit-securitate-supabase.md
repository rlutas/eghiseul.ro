# 17.09.2026 — Audit de securitate pe baza de date: 10 funcții periculoase închise
<!-- categorie: infrastructura -->

## Pentru echipă

Continuarea verificării de azi. Am trecut prin toate avertismentele pe care le dă Supabase despre baza de date și am reparat ce era real.

Cel mai serios: existau zece comenzi interne ale bazei de date pe care **oricine de pe internet le putea porni**, fără cont și fără parolă. Printre ele, una care ștergea datele personale de pe orice comandă și una care putea lega comanda unui client de contul altcuiva. Nu avem niciun semn că le-a folosit cineva. Sunt închise acum.

Tot azi: lista celor 119 oameni înscriși la „anunță-mă când revine ANCPI" era vizibilă și modificabilă din afară — cu email, consimțământ, IP. Închisă și aia.

Pentru tine nu se schimbă nimic în felul în care lucrezi. Toate butoanele din admin merg la fel — am testat crearea unei comenzi de la zero după fiecare modificare.

---

## Ce s-a livrat tehnic

Pornit de la advisorul de securitate Supabase, care raporta 1 ERROR, 60 WARN și
19 INFO. Fiecare finding a fost triat după exploatabilitate reală, nu după
eticheta linterului, iar fiecare fix a fost verificat în DB după aplicare.

### 1. Zece funcții SECURITY DEFINER expuse pe `/rest/v1/rpc/` (migrările 165 + 167)

`SECURITY DEFINER` = corpul rulează ca proprietarul, deci RLS nu apără nimic din
ce ating. Erau apelabile de `anon`, adică de oricine citește cheia publică din
bundle-ul JS:

| Funcție | Ce putea face un anonim |
|---|---|
| `anonymize_order(uuid)` | șterge PII-ul oricărei comenzi, după UUID |
| `anonymize_expired_drafts()` | anonimizare în masă, la cerere |
| `cleanup_old_audit_logs()` | distruge pista de audit |
| `migrate_order_to_profile(uuid, uuid)` | leagă ORICE comandă de ORICE cont, care apoi o vede în `/account` |
| `migrate_pii_to_encrypted(text)` | re-criptează PII cu o cheie dată de apelant |
| `log_audit_entry(...)` | falsifică intrări de audit |
| `encrypt_pii` / `decrypt_pii` | oracol de criptare |
| `get_order_decrypted_pii(...)` | decriptează PII de comandă |
| `check_kyc_expiry(...)` | citește starea KYC a altui utilizator |

Verificat că niciuna nu e chemată din browser: `migrate_order_to_profile` se
cheamă din `api/auth/register-from-order/route.ts:215` cu `createAdminClient()`
(service role, neafectat), `get_order_decrypted_pii` din
`lib/security/pii-encryption.ts:60` care nu are niciun apelant, restul nu apar în
niciun `rpc()` din `src/` sau `scripts/`.

**Capcană de reținut, migrarea 165 a picat tăcut pe ea:** Postgres acordă
`EXECUTE` către pseudo-rolul **PUBLIC** la crearea oricărei funcții. Un
`REVOKE ... FROM anon` raportează succes și nu schimbă nimic, fiindcă `anon`
primește dreptul prin PUBLIC. Trebuie `REVOKE ... FROM PUBLIC`, urmat de
`GRANT` explicit către `service_role, postgres`. Invers față de tabele, care NU
sunt acordate lui PUBLIC implicit — de aceea migrările 163 și 164 au funcționat
așa cum erau scrise. Concluzia practică: orice revoke se verifică cu
`has_function_privilege` / `has_table_privilege`, „success" nu dovedește nimic.

Lăsate intenționat executabile: `is_admin()` / `is_collaborator()` /
`is_partner()` (evaluate în interiorul politicilor RLS, ca rolul apelant — un
revoke ar rupe politicile) și funcțiile de trigger `handle_new_user()` /
`encrypt_order_pii()` (nu se pot apela prin RPC, iar un revoke ar risca
trigger-ul care creează profilul).

### 2. `outage_alerts` fără RLS (migrarea 166) — singurul ERROR

Tabela era creată fără RLS, cu grantul implicit complet pentru `anon` și
`authenticated`. 119 rânduri cu email, consimțământ de marketing, IP, user agent
și referrer — adică chiar dovada GDPR — puteau fi citite, modificate sau șterse
de oricine. RLS activat fără politici (deny-all), granturile revocate; tot accesul
trece deja prin service role (`api/outage-alerts/route.ts:48`,
`api/cron/outage-alerts/route.ts:105`). Testat după: `POST /api/outage-alerts` →
200.

### 3. `search_path` fixat pe 28 de funcții (migrările 165 + 168)

O funcție fără `search_path` fix poate fi deturnată: apelantul își setează
`search_path`, corpul rezolvă un nume necalificat către obiectul lui, iar la
`SECURITY DEFINER` acela rulează ca proprietarul. Fixate toate cele 12
`SECURITY DEFINER` și cele 16 ale noastre `SECURITY INVOKER`.

NU s-au atins funcțiile pg_trgm (`gtrgm_*`, `similarity`, `word_similarity`) —
aparțin extensiei, iar modificarea lor riscă clasa de operatori din spatele
indexurilor trigram.

Patru dintre ele sunt în calea critică a creării de comenzi, deci verificare
end-to-end pe producție imediat după: `POST /api/orders/draft` → 201 cu
`friendly_order_id` și `order_number` generate, `PATCH` → 200 cu `updated_at`
avansat, `GET` → 200, iar trecerea `draft` → `pending` a scris rândul în
`order_history`. Comanda de test a fost ștearsă.

### 4. Performanță (migrarea 169)

- două perechi de indexuri identice, create de câte două migrări diferite
  (`newsletter_subscribers` pe `lower(email)`, `orders` pe `payment_status`
  parțial) — păstrat originalul din fiecare pereche;
- `auth_rls_initplan` pe cele două politici `orders` scrise azi în migrarea 163:
  `auth.uid()` trecut în subquery scalar, ca să fie evaluat o dată pe
  instrucțiune, nu o dată pe rând.

### 5. Bug găsit în loguri: payout-sync trimite un id numeric într-o coloană UUID

Două cereri 400 pe cronul de 05:30: `orders?...&id=in.(125455150)`.
`metadata.orderId` de la Stripe nu e întotdeauna UUID de comandă — plata printr-un
link de proformă Oblio duce acolo id-ul numeric al proformei (codul știa asta la
`payout-sync.ts:239`, dar nu și la linia 93). PostgREST respinge toată
interogarea, deci **întreaga îmbogățire pe id a acelui lot se pierde** și rândurile
de plată extra rămân nepotrivite în Decontări — exact clasa de simptome de pe
14.09. Adăugat `isOrderUuid()` ca gardă, cu 6 teste.

## Ce rămâne, conștient

- **`rls_enabled_no_policy` pe 20 de tabele** (nivel INFO): e postura corectă, nu
  un bug — RLS pornit fără politici înseamnă deny pentru `anon` și
  `authenticated`, iar accesul se face prin service role.
- **`multiple_permissive_policies` x52, `unused_index` x60,
  `unindexed_foreign_keys` x22**: zgomot de performanță pe volume mici.
- **`pg_trgm` în schema `public`**: mutarea ar invalida indexurile trigram.
- **`auth_rls_initplan` pe celelalte 47 de politici**: preexistente, de curățat
  când se atinge fiecare zonă.
### Rezolvat între timp, din configurația de Auth (nu din DB)

- `password_hibp_enabled` → `true` (verificare HaveIBeenPwned la înregistrare);
- `password_min_length` 6 → 8, cât cere deja formularul;
- `site_url` `http://localhost:3000` → `https://eghiseul.ro` și `uri_allow_list`
  completată — vezi documentul despre conturile blocate, era a doua cauză a
  conturilor neconfirmate.

Advisorul de securitate, după toate astea: `rls_disabled_in_public` 1 → 0,
`function_search_path_mutable` 28 → 0, funcții SECURITY DEFINER expuse 15 → 5
(cele 5 intenționate), `auth_leaked_password_protection` rezolvat. Rămân doar
findings-urile documentate mai sus ca acceptate conștient.
