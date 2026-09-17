# Clientul nu își poate face cont

Procedură pentru echipă. Scrisă pe 17.09.2026, când am descoperit că nimeni nu
mai putea să-și facă cont pe site din 9 august.

## Ce vede clientul

La „Creează contul" primește un mesaj roșu care spune că nu putem trimite
emailul de confirmare, că a atins o limită pe oră, și că ne poate suna. Mesajul
e corect — nu e vina clientului și nu a greșit nimic la completare.

Alt caz: clientul zice că și-a făcut cont, dar nu se poate autentifica. Atunci
contul există, doar că **emailul nu a fost confirmat** niciodată.

## Ce îi spui, în ordinea asta

**1. Nu are nevoie de cont.** Ăsta e primul lucru, pentru că rezolvă 9 din 10
apeluri. Poate comanda fără cont, iar statusul îl vede oricând cu codul comenzii
și emailul lui:

```
https://eghiseul.ro/comanda/status?order=<CODUL>&email=<EMAILUL>
```

Îi trimiți linkul pe WhatsApp sau pe email și gata.

**2. Dacă vrea totuși cont, i-l faci tu.** Nu-l pune să mai încerce pe site — o
să primească același mesaj.

## Cum îi faci contul (Supabase)

1. Intri în [Supabase](https://supabase.com/dashboard) → proiectul eGhișeul →
   meniul din stânga, **Authentication** → **Users**.
2. Butonul **Add user** (dreapta sus) → **Create new user**.
3. Completezi emailul clientului și o parolă temporară.
4. **Bifează „Auto Confirm User".** Fără bifa asta contul rămâne neconfirmat și
   clientul tot nu poate intra.
5. **Create user.**
6. Îi trimiți clientului emailul și parola temporară și îi spui să și-o schimbe
   după prima autentificare, din contul lui.

Contul făcut așa nu trimite niciun email, deci nu se lovește de limită.

## Dacă are deja cont, dar neconfirmat

1. Aceeași pagină, **Authentication** → **Users**.
2. Cauți emailul clientului în listă.
3. Deschizi userul → butonul **Confirm email**.
4. Îi spui că poate intra acum cu parola pe care și-a pus-o el la înregistrare.
   Dacă n-o mai știe, folosește „Ai uitat parola?" de pe site.

Sunt 38 de conturi în situația asta, din iulie–august. Dacă sună cineva care
zice „mi-am făcut cont acum ceva timp și nu mă lasă", ăsta e cazul.

## Ce NU faci

- Nu-i spui clientului să mai încerce de câteva ori. Nu se schimbă nimic, iar
  fiecare încercare consumă din limita comună.
- Nu-i ceri să încerce de pe alt telefon sau altă rețea. Limita nu e pe
  conexiunea lui, e pe platformă.
- Nu-i promiți că „se rezolvă în câteva minute". Se rezolvă când comutăm noi
  furnizorul de email — până atunci, îi faci contul manual.

## Pentru Raul — reparația de fond

Blocajul nu dispare din cod. Conturile noi se pot crea automat abia după:

1. Supabase Dashboard → **Authentication** → **Emails** → **SMTP Settings** →
   SMTP custom pe Resend (domeniul e deja verificat, cheia e în
   `RESEND_API_KEY`).
2. Apoi **Authentication** → **Rate Limits** → „Rate limit for sending emails",
   care rămâne la valoarea mică chiar și după ce pui SMTP propriu.

Detalii tehnice și cum s-a diagnosticat:
[17.09.2026 — Conturile de client erau blocate de 39 de zile](../changelog/2026-09-17-conturi-client-blocate-si-verso-buletin.md).
