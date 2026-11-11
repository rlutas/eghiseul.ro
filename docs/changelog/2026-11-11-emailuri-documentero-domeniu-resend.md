# 11.11.2026 — Emailurile documentero nu plecau din 19.10: domeniul lipsea din Resend
<!-- categorie: automatizari -->

## Pentru echipă

- Din 19.10, clienții de pe documentero.ro nu au primit niciun email de la noi: nici confirmarea comenzii, nici mesajele trimise din cardul „Mesaje cu clientul”. Domeniul documentero fusese scos din contul de email (contul are limită de 10 domenii).
- Comenzile afectate: două comenzi plătite. Le retrimitem confirmarea. Dacă le-ați scris ceva din pagina comenzii între 19.10 și 11.11, mesajul nu a ajuns: scrieți-le din nou sau sunați-i.
- De azi, dacă domeniul unui site nu e activ în contul de email, emailul pleacă oricum, de pe adresa eghiseul.ro, cu numele site-ului (de ex. „documentero.ro”). Răspunsurile clientului ajung tot unde trebuie.
- La fel pentru cazierfiscal.com, care nu are încă domeniul activat.

---

## Rezumat tehnic

- Resend `GET /domains`: 10 domenii (limita planului Pro), `documentero.ro` absent, `cazierfiscal.com` nu a fost adăugat. Ultimul email documentero în Resend: 19.10. Vercel logs: `Resend 403: The documentero.ro domain is not verified` la confirmarea unei comenzi pe 11.11.
- `src/lib/email/resend.ts`: `fallbackFrom()` (numele brandului pe adresa implicită); `resolveFrom()` îl folosește pentru domeniile din afara `RESEND_VERIFIED_DOMAINS`; `sendEmail()` reîncearcă o dată pe 403 „domain is not verified”, cu `Idempotency-Key` sufixat `:fallback`, și scrie `console.error` „DOMAIN NOT VERIFIED”. Reply-To rămâne al brandului cerut.
- Teste: `tests/unit/lib/email/resolve-from.test.ts` (nume păstrat), `resend-domain-fallback.test.ts` (reîncercare, fără reîncercare pe alte 4xx).
- De făcut: suplimentul de domenii în Resend, apoi `documentero.ro` și `cazierfiscal.com` adăugate prin API + DNS în Vercel; după aceea rezerva nu mai intră în joc.
