# Workeri Railway — ONRC & ANCPI (overview)

> ⚠️ **INCIDENT 2026-07-08:** ambii workeri au murit ~19h pentru că `SOURCE_API_URL` era setat pe `eghiseul-ro.vercel.app`, care a primit Vercel SSO la lansare. `SOURCE_API_URL` TREBUIE să fie `https://eghiseul.ro` (domeniul public). Debugging: joburi PENDING → verifică `system_heartbeats` primul.


Avem **2 workeri persistenți pe Railway**, în **repo-uri separate** (NU în acest repo, NU pe Vercel/serverless). Fiecare automatizează un portal guvernamental: înlocuiește operatorul uman care depunea manual cererile. Comunică cu eghiseul.ro printr-un API securizat (coadă de stări + livrare PDF).

> ⚠️ **Cel mai important: metoda de deploy DIFERĂ între cei doi workeri.** Vezi tabelul.

## Sumar

| | **worker-onrc** | **worker-ancpi** |
|---|---|---|
| **Portal** | ONRC RECOM — `myportal.onrc.ro` | ePay ANCPI — `epay.ancpi.ro/epay` |
| **Serviciu** | Certificat constatator / furnizare informații | Extras de carte funciară (informare) |
| **Repo** | `github.com/rlutas/worker-onrc` (privat) | `~/Projects/worker-ancpi` |
| **Auth** | REST API ONRC (cont + credit) | login OpenAM (Struts), seed `storageState.json` |
| **Coadă în eghiseul.ro** | `onrc_jobs` (migrare 056) | `ancpi_jobs` |
| **API** | `/api/onrc/{pending,result}` (throttle 3 min) | `/api/ancpi/{pending,result}` |
| **🚀 DEPLOY** | **`git push`** (NU „Redeploy" Railway) | **`railway up`** din `~/Projects/worker-ancpi` (CLI) |
| **Status** | ✅ Live (firmă) | ✅ Live A→Z (2026-06-16) |

## ⚠️ Reguli operaționale critice (memorie)
- **NU reseta niciodată un job plătit** (`PROCESSING`/`AWAITING_DOCUMENT`) → dublă-plată din creditul/walletul preîncărcat. Vezi memoria `onrc-never-reset-paid-job`.
- **Deploy ONRC = `git push`.** Railway „Redeploy" re-rulează build-ul VECHI, nu ultimul commit (a cauzat coexistența a 2 instanțe în tranziție). NU folosi „Redeploy".
- **Deploy ANCPI = `railway up`** (Railway CLI) din folderul worker-ului. **`git push` NU deployează** (repo neconectat la auto-deploy). NU confunda cu ONRC.

## worker-onrc
- **Ce face:** ia datele dintr-o comandă, depune cererea pe ONRC RECOM prin **REST API** (submit + plată din credit), ONRC emite documentul, workerul îl ia prin API, îl urcă în S3 și îl atașează comenzii (`document_ready`) + email client.
- **Automatizat & LIVE:** firmă — **de bază (30 lei)**, **fonduri IMM**, **insolvență**. Confirmat în producție (ex. `E-260615-GL74D` IMM, ~3 min A→Z).
- **Implementat + dry-run (necesită 1 test real fiecare):** „cu istoric" (taxă 7715 = 250 lei, necesită wallet ≥250) și „persoană fizică" (NATURAL/CNP, taxă 7515 = 30 lei).
- **Subtilitate IMM:** filtrul de motiv trebuie să fie `cc-reasons/active` ∩ subtip — un motiv INACTIV („Accesare Fonduri") trimitea cererea în backoffice și o bloca. Vezi `onrc-automation-plan.md`.
- **Detalii:** [`onrc-automation-plan.md`](onrc-automation-plan.md) + `worker-onrc/ONRC-FLOW.md` + `ONRC-API-SUBMIT.md`.

## worker-ancpi
- **Ce face:** login OpenAM → validare imobil (județ/localitate/CF) → coș → checkout → comandă ePay (plată din puncte preplătite, prodId `14200`, 1 punct/extras) → poll status soluție (ADMIS/RESPINS) → descarcă PDF + chitanță → atașează la comandă (`document_ready`) + email.
- **Status:** ✅ **LIVE & FUNCȚIONAL A→Z** (2026-06-16) — comanda reală `E-260616-KAFEG` emisă 100% automat. Sesiunea 2026-06-22: reparat bug de login (pagina post-redirect verificată întâi) + redeploy prin `railway up`; comanda `E-260622-RPGN8` plasată + plătită automat (ePay 10077906).
- **Fix-uri cheie:** Dockerfile pin `playwright@1.48.0`; `idDocument` parsat din JSON HTML-encodat (`solutii[].idDocument`); stări ADMIS/RESPINS.
- **Detalii:** [`ancpi-automation-plan.md`](ancpi-automation-plan.md).

**Ultima actualizare:** 2026-06-22.
