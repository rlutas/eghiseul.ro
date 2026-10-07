# 07.10.2026 — CJO: un email fără reducere pentru cine iese la datele personale sau la acte
<!-- categorie: clienti -->

## Pentru echipă

- Pe CazierJudiciarOnline, cine se oprește la pasul cu datele personale sau la cel cu actul de identitate primește acum **un singur email**, fără reducere: „Puteți continua de unde ați rămas”, cu linkul care îi reîncarcă formularul.
- Pleacă după 2 ore fără activitate, doar în primele 48 de ore, o singură dată pe adresă. Cine ajunge mai departe primește emailul obișnuit, ca până acum.
- E un test: dacă în 2–3 săptămâni (~300 de emailuri) nu aduce nicio comandă plătită, îl oprim. Răspunsurile clienților vin pe contact@cazierjudiciaronline.com.

---

Cod în repo-ul CJO (`96a4e7b3`): `src/lib/recovery/early-recovery.ts` (eligibilitate + regula de oprire, `EARLY_RECOVERY_ENABLED`), `sendEarlyRecoveryEmail` în `src/lib/notifications/email.ts`, pasul 1b în `/api/cron/abandonment`, migrarea CJO 039 (`abandoned_sessions.early_recovery_sent_at`, aplicată), teste `tests/unit/lib/early-recovery.test.ts`. UTM `utm_medium=recovery&utm_campaign=recovery-early-step2|3`. Context: în iunie, 1.307 emailuri cu cupon 15% la pașii 2–3 = 0 conversii; pe eghiseul, emailul fără cupon = 8/99. La prima rulare: ~28 de adrese eligibile (plafon 20/rulare). Ghid CJO actualizat: `docs/admin/GHID_ECHIPA_ABANDON_PLATA.md`.
