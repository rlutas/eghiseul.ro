# Runbook: schimbarea firmei (ex. EDIGITALIZARE → firmă nouă)

**Scop:** cont Stripe nou + cont bancar nou + Oblio nou, fără să se rupă nimic: comenzi, facturare, proforme, decontări, extras bancă. Scris 2026-07-14, când totul rulează pe EDIGITALIZARE S.R.L. (CIF RO49278701).

## Arhitectura actuală (de ce e portabil)

| Sistem | Unde stă configul | Portabil? |
|---|---|---|
| Stripe eghiseul | env Vercel: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ schimbi env |
| Stripe CJO | env Vercel: `STRIPE_SECRET_KEY` etc. (contul comun) + `STRIPE_CABINET_*` (ecazier, separat) | ✅ env · ⚠️ vezi P2 |
| Oblio eghiseul | env: `OBLIO_CLIENT_ID/SECRET/COMPANY_CIF/SERIES_NAME` + `OBLIO_PROFORMA_SERIES` | ✅ env |
| Oblio CJO | **DB**: tabela `companies` (creds + CIF + serie), rândul cu `is_active=true` | ✅ rând nou + activare |
| Decontări (payout sync) | citește cheia Stripe din env; istoricul tag-uit pe coloana `company` (migrarea 115) | ✅ automat |
| Extras bancă | parser BT; contul vine din CSV; istoricul tag-uit pe `company` | ✅ dacă banca rămâne BT · ⚠️ vezi P3 |
| SmartBill / ecazier | firma Cabinet Tarța — complet separată | ✅ neafectat |
| Registru Barou | per platformă, nu per firmă | ✅ neafectat (confirmă cu avocatul) |

## Checklist la schimbare (ordinea contează)

### 1. Oblio (înainte de prima încasare pe firma nouă)
- [ ] Cont Oblio pe firma nouă (sau firmă nouă în același cont) + credențiale API
- [ ] Creează seriile: **EGH** (facturi), **PEGH** + **PCJO** (proforme) — numerotarea începe de la 1 pe firma nouă, normal fiscal
- [ ] e-Factura/SPV activat pe firma nouă în Oblio (token ANAF)
- [ ] eghiseul env: `OBLIO_CLIENT_ID`, `OBLIO_CLIENT_SECRET`, `OBLIO_COMPANY_CIF`, (`OBLIO_SERIES_NAME=EGH`, `OBLIO_PROFORMA_SERIES=PEGH`)
- [ ] CJO: INSERT rând nou în `companies` (name, cif, oblio_client_id/secret/company_cif, `oblio_series_name='EGH'`) → `is_active=true` pe cel nou, `false` pe EDIGITALIZARE. Codul citește instant, fără deploy.

### 2. Stripe
- [ ] Cont Stripe pe firma nouă, activat pe RON
- [ ] eghiseul env: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + **webhook nou** în contul nou → `https://eghiseul.ro/api/webhooks/stripe` (events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed, charge.refunded) → `STRIPE_WEBHOOK_SECRET` nou
- [ ] CJO env: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + webhook nou → `https://cazierjudiciaronline.com/api/stripe/webhook` → `STRIPE_WEBHOOK_SECRET` nou
- [ ] ⚠️ **P2 — cod CJO:** `src/lib/stripe/client.ts` → `getStripeForAccount()` dispecerizează hardcodat pe `"bmr_digital" | "cabinet_tarta"`, iar comenzile salvează `orders.stripe_account`. La firma nouă: adaugă o valoare nouă (ex. `"firma_noua"`) în dispatch + în `tenantConfig()` din `source-detect.ts`. ~30 min de lucru.
- [ ] Redeploy ambele platforme (env-urile nu intră fără build)
- [ ] Comandă test pe fiecare platformă: plată → factură pe seria nouă → apare în decontări

### 3. Bancă
- [ ] Cont bancar nou legat la Stripe (payout destination)
- [ ] ⚠️ **P3 — dacă banca NU e BT:** parserul din `src/lib/accounting/bank-statement.ts` (`parseBtCsv`) e specific formatului BT „Lista de tranzacții". Pentru altă bancă se scrie un adaptor nou (~1 oră) — structura internă (categorii, match payout) rămâne identică.
- [ ] env nou (ambele proiecte relevante): `ACCOUNTING_COMPANY=FIRMA_NOUA` — tag-uiește payouts + extrasele noi pe firma nouă (istoricul vechi rămâne pe EDIGITALIZARE, separabil în rapoarte)

### 4. Contabil / fiscal
- [ ] Ultima decontare EDIGITALIZARE: export lună + print — arhivă închisă pe firma veche
- [ ] Refund-urile pentru comenzi plătite pe contul VECHI se fac tot din contul vechi (ține-l deschis câteva luni)
- [ ] Extra charges pending create pe contul vechi: link-urile mor odată cu cheia — regenerează-le din admin după switch

## Ce NU trebuie schimbat
- Codul de decontări/facturare/proforme — totul citește env/DB
- Supabase-urile (aceleași DB-uri, doar tag `company` nou pe datele noi)
- Registrul Barou, workerii ONRC/ANCPI, Resend/emailuri, SMSLink
- ecazier (Cabinet Tarța) — complet independent

## Singurele 2 lucruri de COD la switch
1. CJO `getStripeForAccount` + `tenantConfig` — valoarea nouă de cont (P2)
2. Parser bancă nouă dacă nu-i BT (P3)

Restul = env + un rând în DB + webhooks în dashboard-ul Stripe nou.
