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
  adresa pe **suppression list**. Stare 2026-07-10: aliasul EXISTĂ și primirea
  externă merge (test manual OK), dar adresa e **încă suprimată în Resend** —
  inofensiv cât timp platforma nu trimite prin Resend către ea (verificat:
  notificările merg doar pe contact@; comenzi@ e doar text pe AWB,
  `generate-awb/route.ts`). Dacă platforma va emaila vreodată comenzi@:
  Resend → Emails → click pe emailul `suppressed` → **Remove from suppression
  list** (nu există pagină/API separat de Suppressions).

## Operare Zoho (Admin Console: mailadmin.zoho.eu)

- **Nume afișat** (apare la destinatari): Users → contact@ → editează
  First/Last name → ex. „Contact eGhișeul.ro". Pentru numele de pe emailurile
  trimise din webmail: Settings ⚙ → Mail → Send mail as → Edit display name.
- **Alias nou** (ex. facturi@): Users → contact@ → Email aliases → Add.
- **Utilizator nou** (coleg cu adresa lui): Users → Add User (gratuit până la
  5 în total).

## Acces echipă (actualizat 2026-07-10)

⚠️ **Planul Free real = 1 SINGUR user** (org creată pe zoho.eu; pricing-ul
public zice 5, dar Add User cere plată). Decizie: fără upgrade deocamdată.

- Toată echipa (Raul, Carla, Angela, Maria) intră pe **contact@** cu parolă
  comună; display name „Echipa eGhișeul.ro". Dezavantaj: nu vezi cine a răspuns.
- **Semnături personale**: `semnatura-email/` în repo — semnatura.html
  (generică) + semnatura-{raul,carla,angela,maria}.html; se instalează toate în
  contul contact@ (Settings → Signatures → Insert HTML `</>`), fiecare o alege
  pe a lui la compunere. Logo hostat: https://eghiseul.ro/images/brand/logo-wide.png
  (PNG, nu webp — Outlook nu afișează webp).
- **comenzi@ rămâne alias** pe contact@ (grupurile cer useri multipli). Pentru
  răspuns de pe comenzi@: Settings → Mail → Send mail as → comenzi@.
- Upgrade viitor: **Mail Lite ~1€/user/lună** → useri separați + Grup comenzi@
  cu „send as group" + IMAP/POP.
- ⚠️ La orice login de pe device nou, Zoho trimite **OTP pe contact@** →
  chicken-and-egg dacă nimeni nu e logat. Fix: recovery email + telefon setate
  la accounts.zoho.eu → Security (setat 2026-07-10).

## Notă platformă

- Notificările interne ale platformei (ex. „documentele au sosit") merg către
  contact@ — acum chiar ajung undeva (înainte de Zoho bounce-uiau).
- `comenzi@` apare ca email de contact pe AWB-uri
  (`generate-awb/route.ts`) — curierii scriu acolo.
