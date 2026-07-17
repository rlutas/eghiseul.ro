# 2026-07-17 — Colaborator: login → direct în portal, nu pe /account

**Cerință Raul:** după autentificare, un colaborator să ajungă direct în dashboard-ul lui (`/colaborator`), nu pe pagina publică/contul de client.

**Înainte:** login-ul trimitea pe toți la `/account` (sau la `?redirect=`); un colaborator ateriza pe zona de client și trebuia să navigheze manual (sau, dacă nimerea o zonă interzisă, era împins pe homepage de guard-uri).

## Implementare

- `src/app/auth/login/page.tsx`: după `signInWithPassword`, dacă **nu** există `?redirect=` explicit, citește `profiles.role`; `collaborator` → `router.push('/colaborator')`. Cu `?redirect=` explicit (ex. venit de pe o pagină protejată), parametrul are prioritate — comportament neschimbat.
- `src/app/auth/callback/route.ts` (magic link / invite / reset): aceeași regulă — fără `?next=` explicit, colaboratorii ajung pe `/colaborator`. Relevant pentru fluxul de invitație (contul Mircea, încă OPEN).
- Clienții/adminii: neatins — default rămâne `/account`.

**Verificat manual** (Playwright pe dev): user temporar cu `role='collaborator'` → login → aterizează pe `/colaborator/orders/` (dashboard-ul portalului). User de test șters după verificare.
