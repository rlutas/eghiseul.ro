# 24.11.2026 — Cerere de ștergere a datelor (GDPR): procedură și primul caz rezolvat
<!-- categorie: clienti -->

## Pentru echipă

- Când un client cere ștergerea datelor, urmează ghidul [Cerere de ștergere a datelor (GDPR)](../admin/cereri-gdpr-stergere-date.md). Avem o lună să răspundem.
- Caută clientul peste tot, inclusiv în comenzile din perioada WordPress. Acestea nu apar în admin, doar în emailurile de notificare și în WordPress.
- Ștergem formularul comenzii, actele și emailurile cu datele lui. Păstrăm factura, plata, contractul și împuternicirea, pentru că legea ne obligă.
- În **Clienți**, clientul rămâne marcat ca „suppressed” și are o notă cu ce s-a șters, când și ce s-a păstrat. Nu-i mai trimitem niciun email de marketing.
- Prima cerere de acest fel a venit azi prin formularul de contact. Am răspuns în aceeași zi.

---

## Rezumat tehnic

Cererea a venit la 24.11.2026 prin `/contact` (subiect „Reclamație”). Clientul avea o comandă plătită din perioada WordPress (15.06.2026). La prima verificare a părut că nu avem nimic, pentru că pe atunci comenzile nu se salvau în `orders`. O scanare completă a tabelelor (eghiseul, CJO/ecazier, registru), plus Stripe și Gmail, a găsit datele.

Ce s-a făcut, toate pe 24.11.2026:

- **Răspuns** trimis prin Resend de pe `contact@eghiseul.ro`, cu copie în aceeași căsuță.
- **Șters:**
  - emailul de notificare a comenzii, din căsuța de notificări (mutat la Coș);
  - `shipping` și `receipt_email` din copia evenimentului `payment_intent.succeeded` din `stripe_webhook_events` (baza CJO), înlocuite cu `[sters GDPR 24.11.2026]`. Suma și ID-urile au rămas.
- **Păstrat** (art. 17(3)(b)):
  - plata Stripe și rândul din `stripe_payout_transactions`, care leagă decontarea de factură;
  - factura Oblio;
  - contractul și împuternicirea din `number_registry`;
  - mesajul din `contact_messages`, marcat `replied` + `handled_at`.
- **Notat pe client:** rând nou în `contacts` cu `marketing_status='suppressed'`, `sources=['gdpr-erasure']` și o notă cu ce s-a șters, ce s-a păstrat și ce a rămas de șters manual. Campaniile (`cron/email-campaigns`), warm-up-ul și recuperarea sar peste `suppressed`.
- **Nu s-a atins:** un contact importat din WPForms cu același nume, dar cu alt email și alt telefon. Identitatea nu e confirmată, deci nu e al lui până nu spune el.
- **Rămas de făcut manual:** intrarea din WPForms și actele de pe WordPress-ul vechi, atașamentele din Zoho și rândul din Google Sheet-ul registrului. După aceea urmează emailul de confirmare finală către client (termen legal 24.12.2026).

Datele de identificare ale clientului nu stau în repo, care e public. Ele sunt în nota din `contacts`.
