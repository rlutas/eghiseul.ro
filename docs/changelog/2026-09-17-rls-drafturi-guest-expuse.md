# 17.09.2026 — Datele din comenzile neterminate erau vizibile din exterior
<!-- categorie: infrastructura -->

## Pentru echipă

O regulă de acces greșită în baza de date făcea ca **toate comenzile neterminate** (cele pe care clientul le începe și nu le finalizează) să poată fi citite și modificate din afară, de oricine, fără cont și fără parolă. Erau 771 de astfel de comenzi, dintre care 316 cu date personale completate și 163 cu CNP întreg.

Nu avem niciun semn că cineva a folosit asta. Gaura a fost închisă azi și verificată.

Ce înseamnă pentru tine: nimic de făcut. Comenzile terminate și plătite **nu** au fost niciodată afectate. Dacă totuși te întreabă un client dacă i-au fost expuse datele, trimite-l la Raul, nu răspunde din burtă.

---

## Ce s-a livrat tehnic

### Problema

Politicile RLS de pe `public.orders`, introduse în `008_friendly_order_id.sql`,
aveau o portiță pentru drafturile de guest:

```sql
"Users can view own orders or their drafts" | SELECT | {public}
  ((auth.uid() = user_id) OR ((user_id IS NULL) AND (status = 'draft')))
"Users can update own draft orders"         | UPDATE | {public}
  (... OR ((user_id IS NULL) AND (status = 'draft')))
```

Rolul `public` include `anon`, iar `anon` avea grant de `SELECT` și `UPDATE` pe
tabelă (verificat: `has_table_privilege('anon','public.orders','SELECT') = true`).
Cheia anon este publică prin construcție — se află în bundle-ul JS al site-ului.
Deci un `GET /rest/v1/orders?select=*` direct pe PostgREST returna toate
drafturile de guest, fără să fie nevoie de vreun UUID, iar un `PATCH` le putea
modifica.

Comentariul din migrarea originală spunea „will be validated in API". PostgREST
este însă expus direct și nu trece prin codul nostru.

Expunere la momentul reparării:

| | |
|---|---|
| drafturi guest lizibile de `anon` | 771 |
| cu date personale | 316 |
| cu CNP complet (13 cifre) | 163 |
| cel mai vechi | 07.07.2026 |

### De ce se putea tăia fără efecte

Niciun cod din browser nu atinge tabela `orders` prin supabase-js. Verificat cu
`grep -rn "from('orders')"` peste `src/components`, `src/providers`, `src/hooks`
și grupul de rute `(customer)`: singurul rezultat e
`src/app/(customer)/account/page.tsx:45`, server component, pe ramura
autentificată. Drafturile trec exclusiv prin
`src/app/api/orders/draft/route.ts` cu `createAdminClient()` (service role),
urmărirea publică a comenzii prin `src/app/api/orders/status/route.ts:52` (tot
service role), iar `POST /api/orders` cere autentificare și setează `user_id`.

### Fixul

Migrarea `163_fix_guest_draft_rls_leak.sql`, aplicată în producție:

- `SELECT` devine `auth.uid() = user_id`, fără ramura de guest;
- `UPDATE` devine `auth.uid() = user_id AND status = 'draft'`;
- `REVOKE SELECT, UPDATE ON public.orders FROM anon` — apărare în adâncime, ca o
  politică permisivă adăugată în viitor să nu redeschidă gaura;
- `COMMENT ON TABLE orders` documentează regula pe tabelă.

Politica de `INSERT` a rămas neatinsă: e doar `WITH CHECK`, nu expune date, iar
modificarea ei ar avea o rază de acțiune mai mare.

Verificat după aplicare:

```
anon_select = false | anon_update = false | politici cu `IS NULL` = 0
```

Scanat restul schemei pentru același tipar: singurele politici `{public}` fără
`auth.uid()` rămase sunt `services` și `service_options` filtrate pe
`is_active = true` — catalogul public, intenționat.

## Ce NU s-a atins (semnalat de audit, nereparat)

- `GET /api/orders/[id]` citește cu `createAdminClient()` și verifică manual:
  neautentificat, trece dacă `order.user_id` e null, sau dacă statusul e
  `pending`/`draft` chiar și pentru comenzi cu proprietar. UUID-ul ține loc de token.
- `GET /api/orders/[id]/documents/[docId]/preview` — fără auth, doar `?email=`
  comparat cu `customer_data.contact.email`.
- `GET /api/upload/download?key=...` — verifică proprietarul doar pentru
  prefixele `kyc/`, `contracts/`, `orders/`; cheile `final/`, `signatures/`,
  `templates/custom/`, `temp/` trec necontrolat pentru orice utilizator logat.
- `is_admin()` și politicile de admin verifică `role = 'admin'`, rol care nu
  există (rolurile reale sunt `super_admin|manager|operator|contabil|avocat|employee`).
  Nu e scurgere — adminul merge pe service role — dar politicile sunt moarte, iar
  `api/orders/[id]/route.ts:65,382` e inaccesibil echipei.
- `profiles.kyc_verified` sare peste garda de KYC la submit și se pune pe `true`
  la orice document personal salvat, inclusiv un simplu certificat de domiciliu.
