# 02.11.2026 — Emailul după apel nu mai scrie numele colegei
<!-- categorie: clienti -->

## Pentru echipă

- Emailul cu reducerea, trimis după „Marchează sunat”, scrie acum „Mulțumim pentru discuția de azi cu reprezentantul eGhișeul.ro” (sau documentero.ro, după comandă), fără numele celei care a sunat.
- Și la final: „răspunde la acest email sau scrie-ne pe WhatsApp — îți răspundem noi.”
- La „Marchează sunat” alegeți în continuare Maria sau Carla: numele rămâne doar în istoricul comenzii, pentru noi.

---

## Tehnic

- `src/lib/email/templates/phone-followup.ts`: `agentName` nu mai e randat (preheader, text, html). Câmpul rămâne în interfață; ruta `phone-contact` îl salvează în `phone_contacted_by` și `order_history`.
- Test: `tests/unit/lib/email/phone-followup.test.ts`.
- CJO/ecazier nu au email de follow-up după apel.
