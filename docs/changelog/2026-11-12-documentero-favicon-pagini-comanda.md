# 12.11.2026 — documentero.ro: iconița corectă pe paginile de comandă
<!-- categorie: clienti -->

## Pentru echipă

Pe documentero.ro, la formularul de comandă, pagina de plată, pagina de status
și contul clientului, în fila browserului apărea scutul eghiseul în locul
iconiței documentero. Pe restul site-ului era bine.

Acum și paginile de comandă arată iconița documentero. Dacă încă vedeți scutul
eghiseul, e din memoria browserului: reîncărcați cu Ctrl+Shift+R sau deschideți
într-o fereastră privată. Nu aveți nimic de făcut pe comenzi.

---

## Tehnic

Paginile partajate din `src/app/(order)/` emit linkurile de icon ale rădăcinii
(`/icon.png`, `/apple-icon.png` din `src/app/`), adică scutul eghiseul.
cazierfiscal.com și certificat-constatator-express.ro aveau deja rewrite pe
host pentru aceste căi (reparat 11.11); documentero.ro avea doar
`/favicon.ico`.

- `next.config.ts`: `/icon.png`, `/apple-icon.png`, `/apple-touch-icon.png`,
  `/apple-touch-icon-precomposed.png` pe hostul documentero →
  `/images/documentero/…`.
- `public/images/documentero/icon.png`, `apple-icon.png`: copii ale celor din
  `src/app/documentero/`.

Verificat înainte: titlul și restul paginii de comandă de pe documentero.ro
nu conțin „eghiseul”; doar iconița era greșită.
