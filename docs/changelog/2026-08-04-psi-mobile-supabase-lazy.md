# 2026-08-04 — PSI mobile 57 → 90: Supabase scos din bundle-ul inițial al header-ului

## Context

Raul a cerut verificarea unui raport PageSpeed Insights mobile pe homepage: **Performance 57** 🟠 (Accessibility 95, Best Practices 100, SEO 100). Important: **Core Web Vitals pe utilizatori reali erau deja PASSED** (LCP 1.3s, INP 112ms, CLS 0, TTFB 0.3s) — scorul lab e emulare Moto G Power + 4G lent și nu afectează ranking-ul direct.

## Diagnostic

Vinovatul scorului: **TBT 2.350 ms**, 100% JS first-party (zero third-party). Compoziția primului load pe `/`, măsurată din `.next/server/app/index.html` + gzip pe chunk-uri (total **293 KB gz**):

| Chunk | gz | Conținut (fingerprint cu grep pe `.next/static/chunks/`) |
|---|---|---|
| 64e28f | 65,9 KB | react-dom — cost fix (eval 1,4 s pe Moto G) |
| 636a922 | **51,9 KB** | **@supabase/supabase-js + GoTrue** — tras de `Header` doar pentru avatarul de login |
| a6dad97 | 38,5 KB | polyfills core-js — dar tag-ul e `noModule`, browserele moderne NU-l execută (fals-alarmă, nu optimiza) |
| 107e875 + af315b | 36 KB | runtime Next |
| 11505de + 16bafcc | 31 KB | Radix (Sheet/Dropdown/Dialog) |
| 64ef743 | 16,4 KB | cod header/consent/whatsapp |

## Fix (commit `0e7d119`)

`src/components/shared/header.tsx`: `createClient` din `@/lib/supabase/client` era importat **static** deși e folosit doar în `useEffect` (starea de login) și în `handleLogout`. Mutat pe **dynamic import + `requestIdleCallback`** (timeout 2 s, fallback `setTimeout` 200 ms) — supabase-js se încarcă și se evaluează după ce pagina e interactivă. Logout-ul face și el dynamic import (același chunk, deja încărcat la momentul ăla).

Efect: first-load JS **293 → 203 KB gz** pe browsere moderne; parse/eval-ul Supabase iese din fereastra TBT. Vizitatorii nelogați văd CTA-ul de login instant; cei logați văd avatarul cu ~200 ms mai târziu.

## Rezultat (test PSI nou, după deploy)

**Performance 57 → 90** 🟢 — toate cele 4 categorii verzi (90/95/100/100). Raport: `pagespeed.web.dev/analysis/https-eghiseul-ro/jh2k133716`.

## Verificare

- Build producție + typecheck curate; homepage randată pe `next start` local, zero erori consolă, chunk-ul Supabase confirmat lazy în network.
- **Netestat direct:** header cu user logat (nu pot introduce parole) — logica e identică, doar amânată; de verificat vizual la prima logare.

## Rămase (nefăcute, câștig mic / efort mai mare)

- Radix lazy în header (~31 KB gz) — risc pe meniuri, câștig ~2-3 puncte.
- CSS global 33 KB gz render-blocking (Tailwind pentru tot site-ul).
- Accessibility 95: un contrast insuficient text/fundal semnalat.

## Capcană de re-măsurare

Chunk-urile Next n-au nume — se identifică cu `grep GoTrue / radix / core-js` pe `.next/static/chunks/*.js`. API-ul PSI fără cheie e blocat (429, quota 0) — testele se rulează din `pagespeed.web.dev` în browser.
