# Sesiune 2026-06-09 — Eliminare verificare AI face-match la selfie (trecere la verificare manuală)

**Status:** ✅ Aplicat (tsc + lint + build OK, 1042 teste pass)
**Fișier:** `src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx`

---

## Cerință

User: la „selfie cu documentul" nu mai vrea verificarea AI — e lentă, merge greu și nu compară fiabil cu actul încărcat. Preferă ca echipa să verifice manual din admin.

## Ce s-a schimbat

Eliminat complet apelul AI (Gemini) de la upload-ul selfie-ului. La încărcare, selfie-ul se marchează automat:
```ts
selfie: {
  valid: false, confidence: 0, faceMatch: false, faceMatchConfidence: 0,
  needsManualReview: true, reviewReason: 'manual_review_only',
}
```

Concret, scos din `KYCDocumentsStep.tsx`:
- apelul `runFaceMatch()` + `decideSelfieValidation()` (round-trip Gemini ~secunde) → upload-ul selfie-ului e acum instant;
- starea `faceMatchResult` + UI-ul „Verificat - X% potrivire" / „Fața nu corespunde";
- `getIDDocument()` + importurile `runFaceMatch`, `isFaceReferenceDoc`, `decideSelfieValidation`, tipul `KYCValidationResults`.

## Ce rămâne neschimbat

- **Upload-ul selfie + comprimarea + S3** funcționează la fel; selfie-ul e în continuare obligatoriu (validarea pasului cerea doar prezența lui, nu trecerea face-match-ului — deci clientul nu era niciodată blocat de AI).
- **Admin**: `needsKycReview()` ridică în continuare flag-ul „necesită revizuire manuală" (pentru că `needsManualReview: true`), iar echipa vede selfie-ul + actul și apasă „Verificat manual". Badge-urile „Match/No match %" pur și simplu nu mai apar (nu mai există date AI).
- **Cod mort intenționat lăsat:** `/api/kyc/validate`, `lib/services/kyc-validation.ts` (`validateSelfie`), `lib/kyc/face-match.ts` rămân în repo (nu mai sunt apelate din wizard). Le putem șterge separat dacă vrem curățenie — `isFaceReferenceDoc` are teste.

## Verificare

- `npx tsc --noEmit` → 0
- `eslint` → 0
- `vitest run tests/unit` → 1042 passed
- `npm run build` → OK

## Follow-up discutat (NEimplementat încă)

Re-încărcare poză după plasarea comenzii: fie update din admin, fie un link trimis clientului ca să refacă doar poza, cu actualizare automată a comenzii. De decis abordarea înainte de implementare.
