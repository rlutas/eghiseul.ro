# 2026-06-25 — SEO cadastru: keyword research + 2 articole

Pe baza keyword research-ului (Semrush, vezi `docs/seo/keywords/cadastru/keywords.md`):
clusterele releveu (5.4K vol), plan de încadrare (1.1K), plan cadastral (2.7K), KD 2–19 = winnable.

## Articole noi (head-uri informaționale cu volum mare)
- `/ce-este-un-releveu` — țintește „releveu" (1.9K), „ce este/înseamnă releveu", „releveu apartament/casă",
  „cine face releveu", „preț". Linkează la copie-releveu, copie-plan-cadastral, extras CF.
- `/ce-este-planul-cadastral` — țintește „plan cadastral" (720), „ce este/conține", „diferența vs releveu /
  vs extras CF". Linkează la extras-plan-cadastral, copie-plan-cadastral, copie-releveu.
- Ambele cu `ArticleLayout` (typography + FAQ schema), înregistrate în `HARDCODED_ARTICLE_SLUGS` (sitemap).

## Pagini de serviciu
Termenii tranzacționali sunt deja acoperiți on-page din rescrierea de content (releveu apartament,
plan de încadrare în zonă/online, extras de plan cadastral pe ortofotoplan). Nu au fost necesare
modificări suplimentare; articolele fac internal linking către ele.

## Verificat
Build OK (articolele randate static), constrângerea Google Ads respectată (fără „oficial"+„documente/acte").

## Rămas (opțional)
Link invers pagină → articol (din content/FAQ) ca să întărim articolele. Restul clusterului (plan de
încadrare) e doar pagină (volum întrebări ≈ 0).
