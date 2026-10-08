# 08.10.2026 — CJO: emailul „Mai aveți nevoie de cazier?” pentru formularele vechi
<!-- categorie: clienti -->

## Pentru echipă

De azi, cazierjudiciaronline.com trimite câte un singur email, fără cupon, oamenilor
care au început formularul acum 2–60 de zile și nu au plătit. Mesajul îi întreabă dacă
mai au nevoie de document și îi trimite înapoi la formular. Pleacă 10 pe oră, între
10:35 și 19:35, maximum 100 pe zi, și se oprește singur după primele 500. Pe 15.10
numărăm câte comenzi plătite au venit din el și decidem dacă îl continuăm.

Dacă un client răspunde la email, răspunsul ajunge la contact@cazierjudiciaronline.com.
Dacă cere să nu mai primească mesaje, are link de dezabonare în email; nu trebuie făcut
nimic manual.

Tot azi: în emailurile automate CJO (expirare, recâștigare, recomandări), linkul spre
cazierul judiciar ducea pe o pagină care nu există. Acum duce pe prima pagină, la formular.

---

## Ce face (CJO `58368ae5`)

| | |
|---|---|
| Cine primește | sesiuni `abandoned_sessions` CJO (nu ecazier), 2–60 de zile, neconvertite, orice pas |
| Cine NU primește | suprimați, adrese cu greșeli de tipar (`gmail.con`, `yahoo.co`), cine are o sesiune mai nouă, cine a primit alt email de recuperare în ultimele 7 zile, cine a plătit după formular sau cu până la 60 de zile înainte |
| Câte | o dată pe adresă, pentru totdeauna; 10/rulare, cron `35 7-16 * * *` (UTC), 100 pe 24 h, oprire la 500 |
| Ordinea | cele mai noi formulare întâi |
| Link | pagina serviciului cu `#formular` și `utm_campaign=reengage-form` (nu linkul de reluare: expiră după 7 zile și nu retrimitem CNP-ul prin link după săptămâni) |
| Antet | `List-Unsubscribe` + `List-Unsubscribe-Post` (RFC 8058), dezabonare în `email_suppressions` |

La simularea din 08.10 (`?dry=1` pe datele reale): 2.788 de adrese eligibile; excluse:
59 contactate recent, 45 cu sesiune mai nouă, 21 cu greșeli de tipar, 4 suprimate,
3 deja plătite.

Fișiere: `src/lib/recovery/reengage.ts` (reguli și plafoane), `src/lib/notifications/email-reengage.ts`,
`src/app/api/cron/reengage-forms/route.ts`, migrarea CJO `040_reengage_forms.sql`
(`abandoned_sessions.reengage_sent_at`, aplicată). Teste: `tests/unit/lib/reengage.test.ts`.

## Linkul 404 din lifecycle

`SERVICE_PATH["cazier-judiciar"]` era `/cazier-judiciar-online`, care întoarce 404 (există
doar `/cazier-judiciar-online/[oras]`). Afectate: expirarea pe cazier judiciar (6 trimise)
și recomandările de cazier judiciar din emailurile de cross-sell. Acum `/`.

## Cum măsurăm

15.10: comenzile plătite CJO cu `attribution` pe `utm_campaign=reengage-form`, plus
potrivirea pe adresa de email cu `reengage_sent_at` (7 zile). Regula: 0 plătite din 500 →
rămâne oprit (`REENGAGE_ENABLED = false`); 2+ plătite → urcăm plafonul.
