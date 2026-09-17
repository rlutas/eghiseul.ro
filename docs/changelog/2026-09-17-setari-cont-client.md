# 17.09.2026 — Setări cont: parolă, email, deconectare de peste tot
<!-- categorie: clienti -->

## Pentru echipă

„Setări cont" din contul clientului ducea până azi într-o pagină inexistentă —
clientul dădea clic și primea eroarea „pagina nu a fost găsită". Acum pagina
există și clientul își poate face singur trei lucruri:

- **schimbă parola** — îi cerem întâi parola actuală, deci nimeni care i-ar fura
  contul deschis nu i-o poate schimba pe ascuns;
- **schimbă adresa de email** — primește un link de confirmare pe adresa NOUĂ și
  schimbarea are loc abia după ce dă clic pe el; pe adresa veche primește o
  înștiințare. Dacă sună și spune „am schimbat emailul și tot cu cel vechi mă
  loghez", răspunsul e: caută linkul de confirmare pe adresa nouă, inclusiv în
  Spam;
- **se deconectează de pe toate dispozitivele** — util când a rămas logat pe un
  calculator străin. Îl scoate și de pe dispozitivul curent.

Mesajele de eroare sunt în română, inclusiv cele de tipul „ai încercat prea des,
mai așteaptă X minute".

---

## Tehnic

**Livrat**

| Fișier | Rol |
|---|---|
| `src/app/(customer)/account/settings/page.tsx` | pagina (server component, guard pe sesiune → `/auth/login`, `robots: noindex`) |
| `src/app/(customer)/account/settings/settings-form.tsx` | formularele (client component) |
| `src/app/api/user/password/route.ts` | `POST` schimbare parolă cu re-autentificare |

**De ce o rută de API pentru parolă.** Verificarea parolei actuale se face cu
`signInWithPassword`, dar NU pe clientul legat de cookie-uri: o reautentificare
reușită ar rescrie sesiunea clientului, iar una eșuată ar fi pusă pe seama
sesiunii vii. Ruta folosește `createPublicClient()` (`persistSession: false`)
doar pentru verificare, apoi `supabase.auth.updateUser({ password })` pe sesiunea
reală. `signOut({ scope: 'local' })` pe clientul de unică folosință — scope-ul
implicit este `global` și ar revoca sesiunile reale ale clientului.

**Email.** `supabase.auth.updateUser({ email })` din browser. Proiectul are
`mailer_secure_email_change_enabled = true`, deci pleacă mail pe ambele adrese și
schimbarea se aplică doar după confirmarea de pe adresa nouă; textul din pagină
spune exact asta.

**Deconectare globală.** `supabase.auth.signOut({ scope: 'global' })` în spatele
unui pas de confirmare, apoi redirect pe `/`.

**Erori.** Toate trec prin `authErrorToRomanian(message, code)` din
`@/lib/auth/error-messages` — nicio eroare GoTrue brută în interfață. Excepție
intenționată: `invalid_credentials` la re-autentificare înseamnă „parola actuală
e greșită", nu „email sau parolă greșită", deci primește text propriu.

**Rămas de făcut:** cardul din bara laterală a contului
(`src/app/(customer)/account/page.tsx`) încă trimite spre `/account/` — trebuie
repointat pe `/account/settings/`. Linkul din meniul de utilizator
(`src/components/shared/header.tsx`) arată deja corect spre `/account/settings`.
