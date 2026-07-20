# 2026-07-20 — SPF nu acoperea Resend: fiecare email trimis pica autentificarea SPF

**Descoperit** pornind de la întrebarea „de ce primesc zilnic emailuri DMARC de la Google?".

## Rapoartele DMARC — normale, nu o problemă

`_dmarc.eghiseul.ro` conține `rua=mailto:contact@eghiseul.ro`, adică cerem explicit rapoarte agregate. Google, Microsoft și Yahoo trimit zilnic câte unul — e comportament normal, nu semnal de incident. Fișierele `.zip` conțin XML cu statistici de autentificare per sursă.

**Politica e `p=none`** = doar monitorizare. Nimeni nu respinge nimic pe baza DMARC încă.

## Problema reală găsită pe drum

Trimitem prin Resend de pe **`comenzi@eghiseul.ro`** (domeniul rădăcină).

Resend verificase domeniul cu:
- DKIM pe `resend._domainkey.eghiseul.ro` ✅
- SPF pe **subdomeniul** `send.eghiseul.ro` (`v=spf1 include:amazonses.com ~all`) ✅

Dar SPF-ul **rădăcinii** era `v=spf1 include:zohomail.eu ~all` — doar Zoho, fără Amazon SES (infrastructura Resend).

**Efect:** fiecare email trimis prin Resend de pe adresa rădăcină pica verificarea SPF. DMARC trecea totuși, prin DKIM (aliniat pe `d=eghiseul.ro`), deci mesajele nu erau respinse — dar **SPF fail e semnal negativ de livrabilitate**, în special la Outlook/Hotmail.

Context care face asta relevant acum: azi au plecat 104 emailuri de recovery coșuri abandonate, iar sistemul de alerte ANCPI urmează să trimită către toți abonații la revenirea sistemelor.

## Fix aplicat

DNS-ul e pe Vercel, deci reparat direct:

```
- v=spf1 include:zohomail.eu ~all
+ v=spf1 include:zohomail.eu include:amazonses.com ~all
```

Verificat propagat pe resolver public (8.8.8.8). Rămân 2 include-uri directe — mult sub limita de 10 lookup-uri DNS a SPF.

## Ce ar merita mai departe

1. **Parsarea rapoartelor DMARC** — acum ajung ca `.zip` în inbox și nimeni nu le citește. Servicii gratuite (Postmark DMARC, dmarcian) le agregă și trimit un rezumat lunar lizibil. Fără asta, plătim costul rapoartelor fără să luăm beneficiul.
2. **Trecerea la `p=quarantine`, apoi `p=reject`** — abia după ce rapoartele confirmă că toate sursele legitime (Zoho, Resend) autentifică corect. Cu `p=none` nu suntem protejați împotriva spoofing-ului pe numele nostru, ceea ce contează pentru o platformă care trimite documente oficiale.
3. Aceeași verificare pe celelalte domenii din contul Resend (ecazier.ro, cazierjudiciaronline.com etc.) — probabil au aceeași configurație.

## Fișiere

Doar DNS (Vercel) — fără modificări de cod.
