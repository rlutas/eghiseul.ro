# Email eghiseul.ro — Zoho Mail (primire) + Resend (trimitere)

> Configurat 2026-07-09, după migrarea DNS pe Vercel (vechiul mail hosting a
> murit odată cu WordPress-ul — domeniul a rămas FĂRĂ MX, tot ce se trimitea
> către contact@ bounce-uia silențios).

## Arhitectură

| Direcție | Serviciu | Cum |
|---|---|---|
| **Trimitere** (confirmări comenzi, documente, notificări) | **Resend** (`RESEND_API_KEY`) | `src/lib/email/resend.ts`, from `contact@eghiseul.ro` |
| **Primire** (contact@, comenzi@) | **Zoho Mail EU** (mail.zoho.eu) | căsuță reală, citită de echipă |

- **contact@eghiseul.ro** = utilizatorul principal Zoho (Super Admin al organizației)
- **comenzi@eghiseul.ro** = alias pe contact@ (ambele pică în același inbox)
- Webmail: **https://mail.zoho.eu** · App mobil: Zoho Mail (iOS/Android)
- Plan: Forever Free (5 utilizatori, 5GB/user, web+mobil; IMAP/Outlook cere
  planul Mail Lite ~1€/user/lună)

## DNS (Vercel — `vercel dns ls eghiseul.ro`)

Toate gestionate prin `vercel dns` CLI (nameservere: ns1/ns2.vercel-dns.com):

| Host | Tip | Valoare | Rol |
|---|---|---|---|
| @ | MX | mx.zoho.eu (10), mx2.zoho.eu (20), mx3.zoho.eu (50) | primire Zoho |
| @ | TXT | `v=spf1 include:zohomail.eu ~all` | SPF root (Zoho) |
| @ | TXT | `zoho-verification=zb81536004.zmverify.zoho.eu` | verificare domeniu |
| zmail._domainkey | TXT | `v=DKIM1; k=rsa; p=MIGf...` | DKIM Zoho |
| resend._domainkey | TXT | `p=MIGf...` | DKIM Resend (trimitere) |
| send | MX | feedback-smtp.eu-west-1.amazonses.com (10) | Resend bounce handling |
| send | TXT | `v=spf1 include:amazonses.com ~all` | SPF Resend |

⚠️ **Lecție**: la migrarea nameserverelor pe Vercel, înregistrările Resend
(DKIM/SPF/MX pe `send.`) S-AU PIERDUT — Resend încă arăta „verified" din
verificarea inițială, dar semnarea era moartă. Repuse 2026-07-09. La orice
schimbare de nameservere: re-verifică TOATE înregistrările de email.

## Verificat end-to-end (2026-07-09)

- Resend → contact@eghiseul.ro: **delivered** ✅ (circuit complet
  platformă → Resend DKIM → Zoho inbox)
- comenzi@: primul test a bounce-uit (aliasul nu exista încă) → Resend a pus
  adresa pe **suppression list**. După crearea aliasului, scoate-o din
  Resend Dashboard → **Suppressions** (căutare comenzi@eghiseul.ro → Remove),
  altfel Resend refuză trimiterile viitoare către ea cu status `suppressed`.

## Operare Zoho (Admin Console: mailadmin.zoho.eu)

- **Nume afișat** (apare la destinatari): Users → contact@ → editează
  First/Last name → ex. „Contact eGhișeul.ro". Pentru numele de pe emailurile
  trimise din webmail: Settings ⚙ → Mail → Send mail as → Edit display name.
- **Alias nou** (ex. facturi@): Users → contact@ → Email aliases → Add.
- **Utilizator nou** (coleg cu adresa lui): Users → Add User (gratuit până la
  5 în total).

## Acces echipă — 2 variante

1. **Parolă comună pe contact@** (recomandat acum, echipă mică): toți intră pe
   mail.zoho.eu cu contact@eghiseul.ro + parola. Simplu; dezavantaj — nu vezi
   cine a răspuns.
2. **Utilizatori separați + Grup** (când crește echipa): creezi useri
   personali (ana@, mircea@... — gratuit ≤5), transformi comenzi@ din alias în
   **Grup** (Admin → Groups) cu membrii echipei → fiecare primește mailurile
   în inboxul propriu și poate răspunde ca și comenzi@. Audit per persoană.

## Notă platformă

- Notificările interne ale platformei (ex. „documentele au sosit") merg către
  contact@ — acum chiar ajung undeva (înainte de Zoho bounce-uiau).
- `comenzi@` apare ca email de contact pe AWB-uri
  (`generate-awb/route.ts`) — curierii scriu acolo.
