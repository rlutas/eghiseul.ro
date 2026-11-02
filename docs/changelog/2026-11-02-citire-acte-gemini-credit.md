# 02.11.2026 — Citirea actelor oprită 10 zile: creditul Google AI epuizat; acum avem alertă
<!-- categorie: automatizari -->

## Pentru echipă

- Între **23.10 și 02.11** „Extrage date” și scanarea buletinului din formular n-au mai citit nimic, pe toate site-urile (eghiseul, documentero, CJO, ecazier). Cauza: creditul la serviciul Google care citește actele s-a terminat. Creditul a fost reîncărcat pe 02.11 și citirea merge din nou.
- Pe comenzile din perioada asta: apăsați din nou **„Extrage date”**.
- Dacă se mai întâmplă, nu mai vedeți câmpuri goale și „CNP-ul nu trece cifra de control”, ci mesajul „Serviciul de citire a actelor nu răspunde — probabil creditul e epuizat”. Completați manual și anunțați-l pe Raul.
- Raul primește automat email când serviciul pică și când revine.

Raportat din Ghid pe 27.10 („toate comenzile de azi și ieri dau eroare la extrage date”).

---

## Tehnic

- Cauza: AI Studio (proiectul cheii `GOOGLE_AI_API_KEY`, aceeași cheie pe toate cele 4 site-uri) răspundea `402 Your prepayment credits are depleted`. Pe eghiseul ultimul `ocrResults` reușit: E-261023-TNNTT.
- `src/lib/services/gemini-health.ts`: `isGeminiUnavailableError` (402/403/429, credits, quota, cheie invalidă), `OCR_UNAVAILABLE_MESSAGE`, `probeGemini`, `checkGeminiAndAlert` (email la `ADMIN_NOTIFY_EMAIL` sau contact@eghiseul.ro, cel mult o dată pe zi, plus email la revenire; stare în `admin_settings[gemini_ocr_alert]`).
- `cron/invoice-health-check` (orar) rulează sonda; nu blochează verificările de facturi.
- `document-ocr.ts`: cele 7 blocuri `catch` întorc `OCR_UNAVAILABLE_MESSAGE` la eroare de furnizor; `rerun-ocr` răspunde 503 cu mesaj clar și nu suprascrie rezultatul vechi.
- CJO/ecazier: aceleași schimbări în `document-ocr.ts` + `extract-ci` (503), fără sondă proprie: cheia e comună.
- ⚠️ Constatat: `SLACK_WEBHOOK_URL` nu e setat în Vercel nici pe eghiseul, nici pe CJO, deci alertele Slack existente (facturi neemise, SPV, TVA) nu ajung nicăieri.
