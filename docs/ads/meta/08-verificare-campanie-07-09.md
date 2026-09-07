# 07.09.2026 — Verificare campania Meta (constatator), după 4 zile

Cont **eGhiseul.ro Ads (1562160259035101)**, campania `New Sales campaign`, obiectiv
Website initiate checkout, buget 75 lei/zi. Perioada raportată: 8 aug – 6 sept (real:
de la publicare, 03.09).

## Cifrele

| | |
|---|---|
| Cheltuit | **235,47 lei** |
| Afișări | 8.746 (reach 4.505) |
| Clicuri pe link | **191** |
| Vizualizări pagină de destinație | **25** |
| InitiateCheckout | **1** (106,52 lei) |
| Vânzări | **0** |

### Pe anunț

| Anunț | Cheltuit | Afișări | Clicuri link | CPC link | CTR link | LP views | Rankinguri |
|---|---|---|---|---|---|---|---|
| C0 Cover – constatator | 36,28 | 1.608 | 79 | 0,46 | 4,91% | **4** | — |
| C4 Verificare partener | 106,52 | 3.370 | 43 | 2,48 | 1,28% | **13** | **Above average ×3** |
| C3 Licitație fonduri | 13,16 | 759 | 14 | 0,94 | 1,84% | 2 | — |
| C1 Deadline bancă | 79,51 | 3.009 | 55 | 1,45 | 1,83% | 6 | — |

## Două probleme, ambele mai mari decât creativele

### 1. Audience Network mănâncă bugetul cu clicuri false

Defalcarea pe plasament:

- **C0**: din 36,28 lei, **23,71 lei (65%) au mers în Audience Network** (native/banner/interstitial
  in-app), CTR 6,53%, CPC 0,32 lei. De aici vine „CTR-ul excelent" de 4,91% al lui C0 — și de aceea
  are 79 de clicuri dar **doar 4 vizualizări de pagină**. Sunt atingeri accidentale în alte aplicații.
- **C4**, dimpotrivă, a luat doar 1,70 lei din Audience Network; restul în Facebook Reels (25,92),
  Stories (3,35), feed desktop (5,22). Are cele mai puține clicuri, dar **cele mai multe LP views**
  și singurul InitiateCheckout — și e singurul cu **Above average** la toate trei rankingurile
  (calitate, rată de interacțiune, rată de conversie).

**Concluzie: C0 e cel mai prost anunț, nu cel mai bun.** Metricii lui sunt zgomot din Audience Network.

### 2. Pixelul se încarcă DOAR după acceptarea cookie-urilor

`src/components/consent/cookie-consent.tsx:110` — `loadMetaPixel()` rulează doar din `applyConsent`
când `state.marketing === true`. Bannerul e o bară jos, neblocantă (linia 213), deci majoritatea
vizitatorilor nu apasă niciodată „Accept toate".

Efect: **191 clicuri pe link → 25 vizualizări de pagină (13%)**. Normal ar fi 60–80%. Nu pagina e
lentă — pur și simplu `PageView` nu se declanșează. Și `InitiateCheckout`, care e chiar **obiectivul
de optimizare al campaniei**, este la fel de gated.

Server-side avem doar `Purchase` prin Conversions API
(`src/lib/analytics/meta-conversions.ts`, apelat din webhook-ul Stripe). Nimic pentru
PageView / InitiateCheckout.

**Meta optimizează pe ~13% din semnal.** Orice concluzie despre creative e construită pe date rupte.

## Recomandări, în ordine

1. **Exclude Audience Network** din plasamente (plasări manuale: Facebook + Instagram, fără
   Audience Network și fără Messenger). Recuperează ~25–30% din buget imediat.
2. **Trimite `InitiateCheckout` prin Conversions API**, la crearea draftului, cu `event_id` pentru
   dedup — exact ca `Purchase`. Infrastructura există; e o funcție nouă în `meta-conversions.ts`
   plus un apel în ruta care creează draftul. Fără asta, campania optimizează în orb.
3. **Oprește C0** (Audience Network junk) și **C3** (aproape nedifuzat, 13 lei). Lasă bugetul pe
   **C4**, singurul cu rankinguri peste medie, și pe C1 ca al doilea unghi.
4. Abia după 1+2 are sens să judecăm creativele.

## Ce NU facem

- Nu edităm textul anunțurilor: orice modificare trece prin review, iar C0 a fost deja respins o
  dată de clasificatorul „forged goods" (vezi `06-audit-si-plan-creativ.md`).
- Nu creștem bugetul până nu e reparată măsurarea.
