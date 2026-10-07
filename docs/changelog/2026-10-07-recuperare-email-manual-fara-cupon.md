# 07.10.2026 — Email de recuperare trimis de echipă, fără cupon
<!-- categorie: clienti -->

## Pentru echipă

- În **Recuperare telefonică** (eGhiseul) aveți acum butonul **„Email”** pe fiecare rând și căsuțe de bifat ca să scrieți mai multor clienți deodată (cel mult 50).
- Emailul pleacă **fără reducere**, semnat cu prenumele vostru. Îi spune clientului unde s-a oprit și că îl ajutați; răspunsul lui vine pe contact@. Puteți adăuga un rând de la voi.
- Lângă client apare „email <data> · cine”, ca să nu-i scrie două colege. Unui client i se poate scrie manual o dată la 24 de ore.
- Emailul automat cu **reducere de 10%** (al treilea, după 3 zile) **nu se mai trimite**: în 3 săptămâni a ajuns la 74 de comenzi și n-a adus nicio plată. În locul lui, clientul apare în listă cu **„2 emailuri fără răspuns”**: pe ăștia îi sunați sau le scrieți întâi.
- Primele două emailuri automate rămân (au adus 8 plăți din 99 de comenzi).

Procedura: [Recuperare telefonică](../admin/recuperare-telefonica.md).

---

**Date (eghiseul, secvența 3 pași, 14.09–07.10):** 99 de comenzi cu email de recuperare, 8 plătite după (8,1%, 3.866 lei; emailul vechi unic cu cupon: 5,6%). Pasul 1: 15 → 5 plătite; pasul 2: 10 → 3; pasul 3 (cupon 10%/48 h): 74 → 0.

**Cod.**
- `src/app/api/cron/recovery-emails/route.ts`: pasul 3 nu mai trimite email și nu mai creează cupon; setează `recovery_email_step=3` + `order_history` („de sunat”). `byStep.3` → `byStep.handedToTeam`. Curățenia cupoanelor de sistem expirate rămâne.
- `POST /api/admin/orders/recovery-email` (`orders.manage`): `{ orderIds: 1–50, message? }`; sare comenzile plătite/neabandonate, emailurile invalide, adresele `contacts.marketing_status='suppressed'` și pe cele scrise manual în ultimele 24 h; UTM `utm_medium=recovery&utm_campaign=recovery-manual`; `order_history` `recovery_email_sent` cu `{ manual: true }`.
- `src/lib/email/templates/manual-recovery.ts`: șablon personal, pasul din `orders.current_step`, fără cupon.
- `priority-calls`: întoarce `recoveryEmailStep`, `currentStep`, `manualRecoveryEmailAt/By`.
- `/admin/recuperare-telefonica`: căsuțe de selecție, buton „Email”, dialog cu mesaj opțional, eticheta „2 emailuri fără răspuns”.
- Migrarea 192: `orders.manual_recovery_email_at`, `orders.manual_recovery_email_by` (aplicată).
- Teste: `tests/unit/api/cron-recovery-emails.test.ts` (pasul 3 fără email/cupon), `tests/unit/lib/email/manual-recovery.test.ts`.
