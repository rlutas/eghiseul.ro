# 20.09.2026 — documentero.ro: animațiile nu porneau la navigarea între pagini (fără refresh)
<!-- categorie: seo -->

## Pentru echipă

Pe documentero.ro, când treceai de pe o pagină pe alta din meniu, secțiunile
rămâneau invizibile până dădeai refresh. Reparat: acum apar și animează
corect la orice navigare, fără refresh.

---

## Rezumat tehnic

`RevealObserver` (layout-ul documentero) rula o singură dată, la montare
(`useEffect(…, [])`). La navigarea client-side layout-ul rămâne montat, pagina
se schimbă sub el, iar noile `<Section data-reveal>` nu erau observate → stăteau
la `opacity: 0` (regula din `@media (scripting: enabled)`), până la un hard
refresh.

Fix (`src/components/documentero/reveal.tsx`): efectul depinde de
`usePathname()` (re-scan la fiecare rută) + un `MutationObserver` pe
`document.body` care atașează secțiunile inserate ulterior (streaming,
Suspense, pagina următoare). `WeakSet` ca să nu observăm de două ori. Verificat
cu Playwright: acasă → `/certificat-de-nastere/` (client-side) → 7/7 secțiuni
`is-in` după scroll, opacitate 1; înapoi pe acasă → prima secțiune se
revelează la 200 px scroll.
