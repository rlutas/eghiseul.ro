# 2026-09-09 — Parolă internă pe paginile private din portalul de colaborator

## Cererea

Mircea (topograf, rol `collaborator`) aduce un angajat care va lucra comenzile
din portal. Angajatul intră **pe contul lui Mircea** (decizia lui Raul: cont
separat cu drepturi tăiate ar fi durat prea mult). Angajatul trebuie să vadă și
să lucreze comenzile, dar **nu** decontul și nici prețurile/onorariile.

## Ce s-a livrat

Paginile „Decont lunar" (`/colaborator/decont`) și „Serviciile mele"
(`/colaborator/servicii`) primesc un **gard cu parolă internă**, separată de
login. Parola o setează adminul și o știe doar Mircea.

Gardul e **pe server**, nu doar în pagină: `/api/collaborator/earnings` și
`/api/collaborator/services` cer un cookie de deblocare semnat HMAC. Un URL de
API deschis direct de angajat primește 403 `PRIVATE_LOCKED`. (Un gard doar în
React s-ar fi ocolit din bara de adrese.)

Comenzile nu se ating: lista și detaliul nu expun prețul clientului (API-ul nu
selectează `total_price`); câmpul „Cost eliberare (lei)" rămâne, e taxa OCPI pe
care angajatul o plătește la ghișeu. Tarifele ANCPI rămân deschise (informație
publică, Ordin 16/2019).

| Piesă | Unde |
|---|---|
| Hash scrypt + cookie semnat + `requirePrivateUnlock()` | `src/lib/collaborator/private-gate.ts` |
| Stocare | `admin_settings.collaborator_private_passwords` = `{ [collaboratorId]: { salt, hash, updated_at } }` (fără migrare) |
| Deblocare din portal (GET stare / POST parolă / DELETE blochează) | `src/app/api/collaborator/unlock/route.ts` |
| Setare din admin (`users.manage`) | `src/app/api/admin/collaborators/private-password/route.ts` + panoul „Parolă pagini private" în `/admin/colaboratori` |
| Formularul din portal | `src/components/collaborator/private-gate.tsx` (montează pagina doar după deblocare) |
| Teste | `tests/unit/lib/collaborator-private-gate.test.ts` (token, expirare, falsificare, salt) |

Detalii de comportament:

- cookie `collab_private_unlock`, httpOnly, 8 ore; „Blochează" din pagină sau
  logout-ul îl șterg pe loc;
- parolă greșită = 1 secundă întârziere + `console.warn`;
- fără parolă setată pentru colaborator = fără gard (ca înainte);
- preview-ul de admin (`?as=`) nu are gard — adminul vede oricum decontul;
- parola nu se poate citi înapoi, doar înlocui sau scoate („Scoate gardul").

## Limitele alese conștient

Cont partajat = `order_history.changed_by` arată „Mircea" la orice acțiune,
indiferent cine a lucrat. Dacă angajatul pleacă, Mircea își schimbă parola de
login (și Raul pe cea internă). Varianta corectă rămâne contul de angajat legat
de colaborator (`profiles.collaborator_parent_id`) — amânată, jumătate de zi.

## Stare: ACTIV din 09.09.2026, 16:58

Raul a setat parola pe contul lui Mircea (`mirceadumitrean@yahoo.com`) din
`/admin/colaboratori`. Verificat în DB (`admin_settings.collaborator_private_passwords`
are un singur rând, al lui) și pe producție (`/api/collaborator/unlock/` dă 401
fără login). Parola nu e scrisă nicăieri — dacă Mircea o uită, Raul setează alta.

## Cum funcționează în practică (de explicat lui Mircea)

Deblocarea trăiește într-un **cookie din browserul în care s-a pus parola**, nu
pe cont. Deci:

| Situație | Ce vede angajatul |
|---|---|
| Angajatul intră de pe alt calculator sau telefon (cazul normal) | formularul de parolă; comenzile merg normal |
| Angajatul folosește același calculator și același browser ca Mircea | pagina, cât e deblocată (max. 8 ore) |

Regula pentru Mircea: pe calculatorul lui deblochează liniștit. Pe un calculator
comun apasă **„Blochează"** din bannerul galben când termină, sau se
deloghează (logout-ul șterge cookie-ul).

Preview-ul de admin („Vezi ce vede colaboratorul", `?as=`) **nu arată gardul**
— e ocolit intenționat, adminul vede oricum decontul din `/admin/colaboratori`.
Testul real se face doar logat pe contul lui Mircea.

## Verificare

- `tests/unit/lib/collaborator-private-gate.test.ts`: token valid, alt
  colaborator, expirat, expirare falsificată, token gunoi, salt diferit per hash.
- `tsc`, `eslint`, CI verde, deploy Vercel `Ready` (commit `b86fe97`).

## Backlog

- Cookie de sesiune (moare la închiderea browserului, pe lângă cele 8 ore) —
  2 linii în `unlockCookieOptions`, dacă disciplina „Blochează" nu ține.
- Cont de angajat legat de colaborator (`profiles.collaborator_parent_id`):
  vede lucrările lui Mircea, 403 pe decont/prețuri, urmă proprie în
  `order_history`. Jumătate de zi. Vezi backlog-ul din
  `DEVELOPMENT_MASTER_PLAN.md`.
