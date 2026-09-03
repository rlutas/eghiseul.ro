# 2026-09-02 — ChatGPT Ads: canal nou, campanie constatator + conversii

Google Ads e blocat pe politica documentelor guvernamentale, organicul e căzut din 20.08. Am
deschis ChatGPT Ads (OpenAI), self-serve în România din 31.08. Tot dosarul: `docs/ads/chatgpt/`.

## 1. Evaluare + politica

Politica OpenAI (v1.5, 31.08) e **inversul** Google: nu există categorie „documente
guvernamentale", dar „legal services" (inclusiv *document preparation*) e interzis în afara US.
Deci umbrela de cabinet de avocat care ne-ar salva la Google ne îngroapă aici. Eligibile: doar
serviciile fără avocat în flux — certificat constatator (API ONRC) și rovinietă. Cazier fiscal
e în `LAWYER_SERVICE_SLUGS` → blocat. Detalii: `docs/ads/chatgpt/01`, `02`, `05`.

## 2. Landing constatator curățat pe politica OpenAI

`servicii/certificat-constatator-online` + `certificat-constatator-insolventa`: scos „avocatul
nostru colaborator, înscris în Barou" din hero (era și fals — constatatorul merge prin API),
„Eliberare" → „Primești", scos „oficial" de lângă „certificat". Checklist reutilizabil în
`docs/ads/chatgpt/03`. Commit `5043331`.

## 3. Campania în Ads Manager

Cont EDIGITALIZARE SRL (EUR). `OAI_Click_Constatator_2026-09`: Clicks, România, €20/zi, Text
customization Off, AG1 cu URL + UTM + context hints, max CPC €1,95 (sub asta „May not deliver"),
anunț „Certificat constatator online" + descriere D1, imagine document stilizat (fără siglele
ONRC — risc de impersonare). Status la final de zi: **Not serving** (brand review + ad review +
„cannot serve in targeted countries" de reverificat). Jurnal: `docs/ads/chatgpt/04`.

## 4. Conversii (pixel + Conversions API)

- Ads Manager: data source `eghiseul.ro web` (pixel `QzXwAbRL9bRrWomdusTNSY`), eveniment
  `order_created`, conversion key, eveniment legat de campanie.
- Site (commit `4b38010`): `attribution.ts` capturează `oppref`; `cookie-consent.tsx` încarcă
  pixelul doar cu consimțământ de marketing; pagina de succes trimite `order_created`;
  `lib/analytics/openai-conversions.ts` trimite server-side din webhook-ul Stripe, DOAR pentru
  comenzile venite din ChatGPT, cu email/telefon SHA-256; dedup pe `order_number`.
- Env: `NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID`, `OPENAI_ADS_API_KEY` (Vercel prod + preview; cheia
  validată cu `validate_only` → 200). Spec: `docs/ads/chatgpt/06`.

## Rămas

Review-ul OpenAI (1–2 zile). Apoi test în incognito cu `?utm_source=chatgpt&oppref=test123`.

## Addendum 03.09 — „Copie Carte Funciară" fără „in extenso" în rezumat (E-260903-56MGJ)

Clientul a ezitat la plată: pagina promite „Copie Carte Funciară in extenso (integrală)", dar rezumatul
comenzii/adminul afișau doar `services.name` = „Copie Carte Funciară". Serviciul ESTE copia in extenso
(descrierea din DB, 168,19 lei cu TVA), fără opțiuni — doar eticheta era ambiguă. Fix: `services.name`
→ „Copie Carte Funciară (in extenso)" (DB). Bonus: bannerul ANCPI din checkout spunea „2 zile
lucrătoare… primești extrasul", contrazicând „4 zile" din rezumat → `SystemStatus` primește `termDays`
din `services.estimated_days`. Comanda intră la Mircea (copie-carte-funciara e în
`collaborator_service_assignments`).
