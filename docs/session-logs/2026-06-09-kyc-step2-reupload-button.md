# Sesiune 2026-06-09 — Buton evident de reîncărcare la KYC Step 2 (poză greșită)

**Status:** ✅ Aplicat în cod (build OK)
**Fișier:** `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx`

---

## Context

Feedback user: „la formular la KYC, acolo unde încarcă la pasul 2, dacă a încărcat o poză greșită și se extrage greșit, să fie o chestie să poată să dea o resetare sau ceva."

Resetarea **exista deja** — funcția `resetScan(type)` golește scanul local + șterge documentul și rezultatul OCR din state (`uploadedDocuments` / `ocrResults`). Dar singurul declanșator vizibil era un buton `X` mic în colțul cardului (`isSuccess && ...`), ușor de ratat. Clientul nu vedea cum să corecteze o extragere greșită.

---

## Modificare

În `renderScanCard`, footer-ul de succes (afișat când `isSuccess`) a fost extins: pe lângă mesajul „Date extrase cu succes!" am adăugat un buton clar:

> 🔄 **Poză greșită? Reîncarcă alta**

La un click:
1. `resetScan(type)` — șterge poza greșită + datele OCR vechi
2. `setTimeout(() => ref.current?.click(), 50)` — redeschide imediat selectorul de fișiere (input-ul există în ramura empty-upload, randată după reset → așteptăm un tick pentru re-render)

OCR-ul rulează din nou pe noua poză → datele se recalculează curat. Butonul `X` din colț + butoanele PDF („Înlocuiește" / „Șterge") rămân neschimbate.

Se aplică pe toate sloturile: `ci_front`, `ci_back`, `ci_nou_back`, `passport_opened`, `ro_cei_reader_pdf`.

Icon nou importat: `RefreshCw` din `lucide-react`.

---

## Verificare

- `npx eslint PersonalDataStep.tsx` → fără erori
- `npm run build` → OK
