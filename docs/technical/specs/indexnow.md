# IndexNow pe eghiseul.ro și documentero.ro

IndexNow (indexnow.org) anunță Bing, Yandex și celelalte motoare participante că o pagină s-a schimbat, fără să aștepte recitirea. Nu are cota de ~10 cereri/zi a Search Console.

## Cum e făcut

- **Chei, una per host**, în `src/lib/seo/indexnow.ts` (`INDEXNOW_KEYS`). Sunt publice prin definiție.
  - eghiseul.ro: `5559960a430bdbd96eec4bded0919eda`
  - documentero.ro: `2f5ec717a8dbf488bd1d940efd5e7570`
- **Fișierul cheii**: `https://<host>/<cheie>.txt`. Rewrite în `next.config.ts` (primul din `beforeFiles`, înaintea regulii catch-all de documentero) spre `/api/indexnow-key/[key]`, care răspunde cheia doar dacă e a hostului cererii (altfel 404). Fișierele `.txt` nu primesc slash final, deci nu există redirect 308.
- **Cron** `GET /api/cron/indexnow/` (Bearer `CRON_SECRET`), zilnic la 04:40 UTC (`vercel.json`). Citește sitemap-ul live al fiecărui host și trimite URL-urile cu `<lastmod>` mai nou decât ultima rulare reușită, ținută în `admin_settings.indexnow_last_run` (`{ host: ISO }`). Prima rulare fără dată: ultimele 48 de ore.
  - `?dry=1` arată ce ar trimite, fără să trimită.
  - `?all=1` trimite tot sitemap-ul (prima dată).
  - `?url=…` (repetabil) trimite exact aceste adrese, doar pe hosturile cunoscute.
- POST la `https://api.indexnow.org/indexnow` cu `{host, key, keyLocation, urlList}`, loturi de max. 10.000. Răspuns 200/202 = acceptat.

## Limită cunoscută

Sitemap-ul eghiseul are `<lastmod>` doar pe ~26 din 112 adrese, deci rularea zilnică vede doar paginile cu dată. Paginile fără `lastmod` pleacă doar cu `?all=1` sau `?url=…`.

## Prima trimitere, după deploy

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://eghiseul.ro/api/cron/indexnow/?all=1"
```

Sister: cazierjudiciaronline.com + ecazier.ro au aceeași implementare în repo-ul CJO.
