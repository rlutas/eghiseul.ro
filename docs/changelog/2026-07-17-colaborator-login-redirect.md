# 2026-07-17 — Login pe rol: colaborator → portal, admin → /admin

**Cerință Raul:** după autentificare, un colaborator să ajungă direct în dashboard-ul lui (`/colaborator`), nu pe pagina publică/contul de client.

**Înainte:** login-ul trimitea pe toți la `/account` (sau la `?redirect=`); un colaborator ateriza pe zona de client și trebuia să navigheze manual (sau, dacă nimerea o zonă interzisă, era împins pe homepage de guard-uri).

## Implementare

- `src/app/auth/login/page.tsx`: după `signInWithPassword`, dacă **nu** există `?redirect=` explicit, citește `profiles.role`; `collaborator` → `router.push('/colaborator')`. Cu `?redirect=` explicit (ex. venit de pe o pagină protejată), parametrul are prioritate — comportament neschimbat.
- `src/app/auth/callback/route.ts` (magic link / invite / reset): aceeași regulă — fără `?next=` explicit, colaboratorii ajung pe `/colaborator`. Relevant pentru fluxul de invitație (contul Mircea, încă OPEN).
- **Extensie (același zi, cerere Raul după test)**: rolurile de admin (`super_admin`, `manager`, `operator`, `contabil`, `avocat`, `employee`) aterizează pe `/admin` (layoutul duce avocatul mai departe la Registru). Clienții rămân pe `/account`. Commit `202ff4f`.
- **Fix 2 (același zi)**: `?redirect=`/`?next=` explicit se validează acum pe rol — un link vechi `login?redirect=/colaborator` deschis de un admin îl trimitea în portalul colaboratorului, al cărui guard îl arunca pe homepage. Acum: ținta explicită câștigă doar dacă rolul are acces la ea (`/colaborator` cere collaborator, `/admin` cere rol de admin), altfel mergi la casa rolului. Guard-ul `/colaborator` trimite adminii rătăciți la `/admin`, nu pe homepage.

**Verificat manual** (Playwright pe dev): user temporar cu `role='collaborator'` → login → aterizează pe `/colaborator/orders/` (dashboard-ul portalului). User de test șters după verificare.
