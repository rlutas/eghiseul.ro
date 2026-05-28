# Incident — AWS Key Leak via `.claude/settings.local.json`

**Data:** 2026-05-28
**Severitate:** High (cheie AWS IAM cu acces S3 + secret JWT Supabase expuse în git)
**Status:** Resolved
**MTTR:** ~45 minute (detecție → cheie nouă rotată → quarantine ridicat)

## Ce s-a întâmplat

Fișierul `.claude/settings.local.json` a fost comis în repo pe 20 mai 2026
(commit `445ecbe`, „feat(wizard): redesign step 1+2..."). Fișierul conține
permission rules pentru Claude Code, dar dezvoltatorul a tastat în Bash
permissions valori inline cu credențiale reale (pentru testare rapidă):

- AWS Access Key ID: `AKIARRN7YNPKU6CSW7GT` (IAM user `eghiseul-app`)
- AWS Secret Access Key (40 chars, eliminat din log)
- Supabase service_role JWT
- GitHub Personal Access Token

Fișierul a rămas comis 8 zile nedetectat. Pe 28 mai, la push către GitHub,
**GitHub Push Protection** a blocat push-ul detectând automat ambele AWS keys.

În paralel, **AWS Trusted Advisor / Security Hub** a primit notificare prin
parteneriatul AWS-GitHub și a aplicat automat `AWSCompromisedKeyQuarantineV3`
managed policy pe user-ul `eghiseul-app` în câteva minute de la push attempt.

## Cum a fost detectat

1. Push respins de GitHub Push Protection cu URL-uri de unblock per secret.
2. Email automat de la AWS (`Access Key is Exposed for AWS Account [...]`)
   cu link direct către fișierul expus pe GitHub și confirmarea quarantine.

## Pași de remediere

### Pas 1 — Cheie AWS nouă
1. Creat Access Key 2 nou pentru user `eghiseul-app` în IAM Console.
2. Înlocuite `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` în `.env.local`.
3. Validat cu `HeadBucket` + `ListObjectsV2` pe bucket `eghiseul-documents`.

### Pas 2 — Push prin Push Protection
Repo privat + dezvoltator unic → ales path-ul de „Allow secret" pe GitHub
(motiv: „Used in tests") în loc de history rewrite, pentru viteză.
Trade-off acceptat: cheia veche rămâne vizibilă în history GitHub, dar e
deja rotată și user-ul AWS în quarantine — bot-urile externe nu o pot
folosi nicăieri.

### Pas 3 — Șters cheia compromisă
IAM → user `eghiseul-app` → Access keys → cheia veche `...W7GT` →
Deactivate → Delete.

### Pas 4 — Detașat Quarantine Policy
IAM → Policies → `AWSCompromisedKeyQuarantineV3` → Entities attached →
eghiseul-app → Detach. S3 re-validat post-detach (`HeadBucket` + `ListBucket` OK).

### Pas 5 — Prevenție
Adăugat în `.gitignore`:
```
# Local Claude Code settings (may contain secrets in Bash permission rules)
.claude/settings.local.json
```

## Lecții învățate

1. **`.claude/settings.local.json` nu trebuie niciodată tracked în git.**
   Pattern-ul Claude Code de a permite Bash rules cu valori inline e
   periculos — dezvoltatorii vor pune accidental credențiale în loc de
   prefixe (`Bash(export AWS_ACCESS_KEY_ID=AKIA...)` în loc de
   `Bash(export AWS_ACCESS_KEY_ID=*)`).
2. **GitHub Push Protection funcționează și pentru repo-uri private** dacă
   organizația/userul are Advanced Security activat. Salvator de viață.
3. **AWS reacționează în <5 minute** prin parteneriatul cu GitHub —
   chiar dacă repo-ul e privat, GitHub notifică AWS la detecție.
4. **Quarantine policy NU e auto-removed** după ce ștergi cheia compromisă —
   trebuie detașat manual de pe user.

## Acțiuni follow-up

- [ ] Update Vercel env vars `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`
      cu valorile noi + redeploy production. **CRITIC** — fără asta, prod
      încearcă să folosească cheia ștearsă.
- [ ] Enable MFA pe root account AWS (recomandare AWS post-incident).
- [ ] Review CloudTrail ultimele 24h pe user `eghiseul-app` pentru
      activitate neautorizată (RunInstances, CreateUser, etc.).
- [ ] Audit Supabase logs pentru utilizarea service_role JWT-ului expus
      (Supabase Dashboard → Logs Explorer).
- [ ] Rotează și Supabase service_role key + GitHub PAT (expuse în același
      fișier, chiar dacă AWS a fost cel detectat de bot-uri).
- [ ] Pre-commit hook care blochează `.claude/settings.local.json` chiar
      dacă cineva îl forțează cu `git add -f`.

## Detecție pe viitor

Adăugat în CI viitor (TODO):
- `gitleaks` sau `trufflehog` în pre-commit + GitHub Action
- Rule custom care interzice strings cu pattern `AKIA[0-9A-Z]{16}` în
  orice fișier tracked

## Backup branch

Înainte de remediere s-a creat `backup-before-history-rewrite-2026-05-28`
pe local — poate fi șters acum că totul e stabil:
```bash
git branch -D backup-before-history-rewrite-2026-05-28
```
