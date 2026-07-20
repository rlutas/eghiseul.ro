# 2026-07-20 — Captură email la outage + tracking de atribuire pe comandă

Două sisteme noi, legate: primul prinde publicul care nu cumpără acum, al doilea măsoară ce aduce fiecare pagină.

---

## 1. Alerte de revenire („anunță-mă când revine ANCPI")

**Problema:** articolul `/ancpi-nu-functioneaza/` rankează pe un subiect fierbinte și aduce trafic real, dar singura conversie oferită era „comandă acum". Cine nu era gata să plătească imediat — majoritatea — pleca fără urmă. Exact publicul cu intenție mare: vrea documentul, dar așteaptă revenirea sistemului.

### Migrarea 127 — `outage_alerts`

| Coloană | Rol |
|---|---|
| `service` | text liber, deci următorul outage (ONRC etc.) nu cere migrare |
| `email` | unic per serviciu (`UNIQUE (service, email)`) |
| `source_page`, `referrer`, `utm` | atribuire — știm ce pagină aduce înscrieri |
| `marketing_consent` | **separat** de alerta punctuală, implicit `FALSE` |
| `ip`, `user_agent` | dovada momentului și contextului (GDPR) |
| `notified_at` | se stampilează la trimitere |

Tabelă separată de `contacts` pentru că are ciclu de viață propriu (se notifică o dată, apoi e istoric) și pentru că **un abonat la alertă nu e automat contact de marketing** — consimțământul e pentru o notificare punctuală.

### `POST /api/outage-alerts`

Public, fără autentificare. Listă albă de servicii (`ancpi`, `onrc`) ca un POST arbitrar să nu umple tabela. Idempotent: re-înscrierea actualizează atribuirea fără să dubleze rândul și **fără să reseteze `notified_at`** (cine a fost anunțat nu primește al doilea email).

Propagarea în `contacts` se face **doar cu bifa explicită** de marketing.

### `/api/cron/outage-alerts` (15 min)

Sursa adevărului e **`platform_outages.ended_at`**, setat de monitorizarea care probează portalurile. Nu ne bazăm pe comunicate oficiale: anunțăm doar când sistemul răspunde efectiv. Dacă ANCPI anunță revenirea dar serverele tac, nu trimitem; dacă revine în tăcere la 3 noaptea, oamenii află imediat.

- **Fereastră de 24h** după revenire: recuperează dacă cronul a fost oprit, dar nu anunță pentru un outage încheiat săptămâna trecută.
- **Flapping**: dacă un serviciu are mai multe intrări în fereastră, ia cea mai recentă revenire.
- **Idempotency-Key include `ended_at`** — o cădere nouă e alertă nouă legitimă, nu duplicat blocat.
- Trimiterea eșuată **nu** stampilează `notified_at`, deci se reîncearcă.
- Linkul de comandă poartă `utm_source=outage-alert`, deci atribuirea arată exact câte comenzi aduce.

⚠️ Path în `vercel.json` **cu slash final** — vezi incidentul 308 din aceeași zi.

Emailul livrează **întâi informația promisă**, apoi oferă acțiunea. Omul a lăsat adresa pentru „anunță-mă când revine", nu pentru o reclamă.

---

## 2. Atribuire pe comandă — de unde vine clientul

**Problema:** nu aveam nimic. Nici UTM, nici referrer, nici pagina de intrare. Nu puteam răspunde la „de unde a venit comanda asta", deși investisem în articole, landing-uri și clustere SEO. GA4 arată sesiuni; asta leagă **banii** de comanda reală.

### Migrarea 128 — `orders.attribution` (JSONB)

Un singur JSONB, nu 10 coloane: parametrii de campanie se schimbă (`gclid` → `gbraid` → `wbraid`), iar o schemă rigidă ar cere migrare la fiecare platformă nouă de ads. Doi indecși, pe `landing` și `utm_source`.

```json
{
  "first": { "utm_source": "google", "utm_medium": "organic",
             "referrer": "...", "landing": "/ancpi-nu-functioneaza/", "at": "..." },
  "last":  { ... la ultima vizită înainte de comandă }
}
```

`first` = ce ne-a descoperit clientul. `last` = ce a închis vânzarea. Ambele contează: un articol poate aduce omul, iar pagina de serviciu îl convertește peste trei zile.

### Captura — `src/lib/analytics/attribution.ts`

Acoperă `utm_*`, click ID-urile (`gclid`, `gbraid`, `wbraid`, `fbclid`, `ttclid`, `msclkid`), referrer extern și landing page.

**Regula esențială:** `last` se schimbă doar la o **sursă nouă reală** sau după 30 de minute de pauză. Altfel, o navigare internă ar suprascrie sursa care a adus clientul cu „direct" — și tot tracking-ul ar arăta trafic direct, adică nimic.

Verificat pe producție: intrare de pe Facebook pe articolul ANCPI → navigare la pagina de extras CF → **sursa rămâne `facebook`**.

Stocare în `localStorage`, nu cookie: nu se trimite la fiecare request și e vizibilă pentru utilizator.

### Integrarea

`AttributionTracker` în layout, **cu Suspense** — `useSearchParams` ar forța CSR bailout și ar transforma paginile statice în dinamice (risc SEO major, verificat că nu s-a întâmplat: paginile randează 13.000–26.000 de cuvinte server-side).

Scris în DB **doar la crearea draftului** (și pe calea de retry), niciodată la update: pe parcursul completării `last` s-ar putea schimba și am pierde canalul care a generat comanda.

### Admin

Card „Proveniență client" pe pagina comenzii, cu sursa tradusă în limbaj de om: *„facebook (social) → /ancpi-nu-functioneaza/"*, plus campania și data primei vizite. Ascuns pentru comenzile dinainte de migrare, ca să nu arate „necunoscut" pe jumătate din listă.

### GDPR

Atribuire proprie, fără profilare cross-site și fără terți — **nu depinde de consimțământul pentru cookies de marketing**, spre deosebire de GA4, care se încarcă doar după opt-in.

---

## Rămas de făcut

- **Raportul agregat** „ce pagini aduc comenzi plătite" — datele se strâng de acum, raportul are sens după câteva zile de volum.
- Măsurarea lanțului eghiseul → erovinieta cu `source: 'contract-auto'`, când se construiește produsul auto.

## Fișiere

`supabase/migrations/127_outage_alerts.sql` · `128_order_attribution.sql` · `src/app/api/outage-alerts/route.ts` · `src/app/api/cron/outage-alerts/route.ts` · `src/lib/email/templates/outage-recovered.ts` · `src/components/articole/outage-alert-signup.tsx` · `src/lib/analytics/attribution.ts` · `src/components/analytics/attribution-tracker.tsx` · `src/app/layout.tsx` · `src/app/api/orders/draft/route.ts` · `src/providers/modular-wizard-provider.tsx` · `src/app/admin/orders/[id]/page.tsx` · `vercel.json`
