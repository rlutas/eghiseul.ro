# 25.09.2026 — Pagina de status a clientului: întâi statusul, apoi restul
<!-- categorie: clienti -->

## Pentru echipă

Pagina „Status comandă” pe care o deschide clientul arată acum, de sus în jos:
mesajul necitit (dacă are), actele cerute (dacă e cazul), **statusul comenzii**,
istoricul, **mesajele**, documentele, butonul de WhatsApp și, la final, anularea
din primele 30 de minute. Înainte, anularea și caseta de WhatsApp stăteau deasupra
statusului. Plata nu mai apare de două ori („Plată confirmată” + „Plătită”).
Butonul „Vezi documentul” apare doar când există documentul comandat, nu pentru
contract. La identificare, pasul 2, clientul vede o casetă „Pasul 2: cererea
este la OCPI” cu termenul dat de OCPI. Butonul verde de WhatsApp rămâne și în
dreapta jos, ca pe tot site-ul.

---

## Tehnic

- `src/app/(order)/comanda/status/page.tsx`: ordinea secțiunilor (banner mesaj nou →
  reupload → status → transfer bancar → istoric → `CustomerMessages` → curier →
  facturi → documente → `HelpContactCard` → `SelfCancelCard`); caseta albastră de
  ajutor (email + telefon) scoasă, dublura lui `HelpContactCard`; badge-ul de plată
  ascuns când statusul e `paid`; quick-jump „Vezi documentul” doar pentru tipuri din
  afara `CONTRACT_DOC_TYPES`; cardul violet pentru `identification_pending_ocpi` cu
  `ocpiTerm` / `ocpiRegistrationNumber` (linia de termen din rezumat nu se mai repetă).
- Regula de anulare (30 de minute de la plată, indiferent de status, termeni secțiunea 8)
  NU s-a schimbat: `SELF_CANCEL_BLOCKED_STATUSES` e listă neagră intenționat.
