# 10.11.2026 — CJO: semnătura pe contract, cupoanele de recuperare, verificarea TVA
<!-- categorie: automatizari -->

## Pentru echipă

- **Contractul de pe cazierjudiciaronline.com și ecazier.ro** are din nou semnătura clientului scrisă „de mână”, cu fontul Caveat. Până azi ieșea scrisă cu litere înclinate obișnuite, pentru că fontul nu ajungea pe server. Contractele vechi rămân cum sunt; conținutul lor nu era afectat.
- **Emailurile de recuperare de pe CJO** nu mai sar peste client. Codul cuponului (RECUPEREAZA-…) are acum 6 caractere, nu 4. Cu 4 caractere, cam un cod din 20 nimerea unul deja folosit, iar emailul pleca abia la rularea următoare.
- **Verificarea zilnică a TVA-ului pe facturile CJO** nu mai cade când expiră conexiunea la Oblio. Se reconectează singură, ca restul facturării.

---

## Tehnic

- `src/lib/contract-pdf.ts` citea `public/fonts/caveat-bold-base64.txt`, care e în `.gitignore` și nu ajungea niciodată în deploy. jsPDF scria „Unable to look up font label for font 'Caveat', 'bold'”, iar semnătura cădea pe Roboto bolditalic. Acum se citește `Caveat-Bold.ttf`, care e comis, și se codează base64 la rulare. Am verificat local, fără fișierul ignorat: `Caveat` apare în PDF.
- `src/app/api/cron/abandonment/route.ts`: `RECUPEREAZA-` + 6 hex. Codurile vechi aveau 4 hex, adică 65.536 de variante, iar 3.594 erau deja folosite. La `23505` se reîncearcă de până la 3 ori.
- `src/lib/oblio/vat-audit.ts` folosea `getAccessToken` + `fetch` fără reîncercare. Acum trece prin `oblioFetch` (exportat din `client.ts`), care reautorizează o dată la 401.
- `src/lib/docx-to-pdf.ts` (`convertDocxToPdf`, varianta sincronă): întoarce `null` fără `exec` când `findSoffice()` nu găsește LibreOffice. Vezi intrarea despre cazierul PJ de azi.
