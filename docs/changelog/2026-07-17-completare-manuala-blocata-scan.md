# 2026-07-17 — „Completez manual" bloca pasul 2 cerând scanarea CI

**Simptom (raportat de Raul, reprodus pe dev):** la pasul 2 „Date Personale", după „Completez manual", butonul „Continuă" rămânea blocat cu „Nu poți continua — completează: Scanarea CI (față)" — deși UI-ul promite explicit că actul se încarcă la pasul KYC.

**Cauză:** `PersonalDataStep.tsx` — `isFormValid()` și `getMissingItems()` cereau scanările actului (per tip: CI vechi/nou/pașaport) fără să țină cont de `mode === 'manual'`; doar `phoneMode` sărea peste cerință. Bug-ul se declanșa când clientul alegea întâi tipul actului (setând `idDocumentType`) și abia apoi trecea pe manual.

## Fix

- Ambele verificări de documente din pasul 2 sar acum și în `mode === 'manual'` (`skipDocsHere = phoneMode || mode === 'manual'`); `mode` adăugat în deps.
- **Fără gaură de securitate:** pasul KYC cere deja actul pe ruta manuală — `KYCDocumentsStep.tsx` (~262-270) validează `act_identitate` față + spate când nu există scanări de la pasul 2.

Afectează toate serviciile cu personal-kyc (nu doar celibat).
