# 05.10.2026 — Emailul către contactele vechi pleacă din oră în oră, până la 5.000 pe zi
<!-- categorie: clienti -->

## Pentru echipă

- Emailul către lista veche de contacte (cei 72.000 de pe site-ul vechi) nu mai pleacă o singură dată pe zi, dimineața, ci din oră în oră, între 9 și 19 (ora României).
- Câte emailuri pleacă pe zi se setează tot din **Admin → Marketing**, câmpul „Pe zi". Maximul a crescut de la 2.000 la 5.000.
- Pornim de la 300 pe zi și creștem treptat, cât timp dezabonările și emailurile întoarse rămân mici.
- Dacă vedeți clienți care se plâng de spam sau multe emailuri întoarse, opriți comutatorul din aceeași pagină și anunțați-l pe Raul.

---

## Rezumat tehnic

- `POST /api/cron/warmup-campaign`: `dailyBatchSize` înseamnă acum plafonul pe zi (UTC). Fiecare rulare numără `contacts.warmup_email_sent_at >= începutul zilei` și trimite cel mult `PER_RUN_CAP = 250` (la 600 ms între trimiteri, o rulare de 300 s duce ~400; vechea rulare unică zilnică nu putea trece de ~400 indiferent de setare).
- `vercel.json`: cron `0 7 * * *` → `0 6-16 * * *` (11 rulări pe zi, capacitate ~2.750/zi la plafonul pe rulare).
- Limita din `PUT /api/admin/settings` și din `/admin/marketing`: 1–2000 → 1–5000.
- Starea la 05.10: 1.032 trimise din 14.09, 14 dezabonări (1,36%). Resend pe toate trimiterile din 14.09: 2.586 emailuri, 43 bounce (1,7%), 1 plângere. Contul Resend e comun cu alte proiecte (MomenteQR, CheckID), deci o reputație proastă le lovește și pe ele.
- Motivul: vânzări septembrie ~58k lei pe toate platformele; warm-up-ul la 50/zi ar fi atins lista în 4 ani.
