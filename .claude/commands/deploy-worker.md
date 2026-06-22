---
description: Deploy unul dintre cei 2 workeri Railway (ONRC sau ANCPI). Metoda DIFERĂ per worker. Folosește când userul cere deploy worker sau după ce ai modificat cod în worker-onrc/worker-ancpi.
argument-hint: [onrc|ancpi]
disable-model-invocation: true
allowed-tools: Bash
---

Deployează worker-ul `$1` pe Railway. **Metoda diferă — NU le confunda:**

## ONRC (`worker-onrc`)
- Deploy = **`git push`** din repo-ul worker-ului (`github.com/rlutas/worker-onrc`).
- ⚠️ **NU folosi „Redeploy" din Railway** — re-rulează build-ul VECHI, nu ultimul commit (a cauzat 2 instanțe coexistente).

## ANCPI (`worker-ancpi`)
- Deploy = **`railway up`** din `~/Projects/worker-ancpi` (Railway CLI).
- ⚠️ **`git push` NU deployează nimic** (repo neconectat la auto-deploy).
- `railway up` e deploy în producție → cere autorizarea userului înainte (clasificatorul îl blochează altfel).

## Reguli critice (ambii)
- **NU reseta NICIODATĂ un job plătit** (`PROCESSING`/`AWAITING_DOCUMENT`) → dublă-plată din wallet/credit.
- După deploy, verifică heartbeat-ul + un job de test.

Detalii complete: `docs/technical/specs/railway-workers.md`. Confirmă cu userul ce worker + autorizare înainte de a rula comanda de deploy.
