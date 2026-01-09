# Draft Error Recovery Behavior

**Date:** 2026-01-08
**Status:** Implemented

---

## Overview

Documentează comportamentul de recuperare automată când o comandă draft nu mai poate fi actualizată (ex: a fost deja trimisă sau a expirat).

---

## Problema

Eroarea `"Can only update draft orders"` apare când:
1. Utilizatorul a trimis comanda într-un alt tab
2. Comanda a fost procesată și statusul s-a schimbat din `draft`
3. Sesiunea a expirat și comanda a fost anonimizată (GDPR cleanup)
4. URL-ul conține un `orderId` vechi care nu mai e valid

### Mesaje de eroare

```
Console Error: Save draft error: 400 {}
Console Error: Can only update draft orders
```

---

## Soluția Implementată

### 1. Verificare Status în API (POST & PATCH)

**Fișier:** `src/app/api/orders/draft/route.ts`

```typescript
// POST - verificare când actualizează comandă existentă
if (existingOrder.status !== 'draft') {
  return NextResponse.json({
    error: { code: 'INVALID_STATUS', message: 'Can only update draft orders' }
  }, { status: 400 });
}

// PATCH - aceeași verificare
if (existingOrder.status !== 'draft') {
  return NextResponse.json({
    error: { code: 'INVALID_STATUS', message: 'Can only update draft orders' }
  }, { status: 400 });
}
```

### 2. Recuperare Automată în Wizard Provider

**Fișier:** `src/providers/modular-wizard-provider.tsx`

```typescript
// În saveDraftToServer()
if (response.status === 400 && errorData.error?.code === 'INVALID_STATUS') {
  console.warn('Order is no longer a draft - clearing orderId for fresh draft');

  // Generează nou ID
  const newFriendlyOrderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // Resetează orderId (va folosi POST în loc de PATCH)
  dispatch({
    type: 'SET_ORDER_IDS',
    payload: {
      orderId: null,
      friendlyOrderId: newFriendlyOrderId,
    },
  });

  // Resetează starea de salvare
  dispatch({ type: 'SAVE_SUCCESS', payload: new Date().toISOString() });

  // Marchează ca dirty pentru a declanșa auto-save cu noul ID
  dispatch({ type: 'MARK_DIRTY' });

  return; // Nu aruncă eroare - recuperare silențioasă
}
```

---

## Fluxul de Recuperare

```
┌────────────────────────────────────────────────────────────────┐
│                    AUTO-SAVE ATTEMPT                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Wizard încearcă PATCH /api/orders/draft                   │
│                      ↓                                         │
│  2. API verifică: existingOrder.status === 'draft'?           │
│                      ↓                                         │
│     ┌─────── DA ─────┴─────── NU ───────┐                     │
│     ↓                                    ↓                     │
│  Update OK                    Return 400 INVALID_STATUS        │
│  (200)                                   ↓                     │
│                               Wizard prinde eroarea            │
│                                          ↓                     │
│                               Generează nou friendlyOrderId    │
│                                          ↓                     │
│                               Setează orderId = null           │
│                                          ↓                     │
│                               dispatch(MARK_DIRTY)             │
│                                          ↓                     │
│                               Auto-save declanșat              │
│                                          ↓                     │
│                               POST /api/orders/draft           │
│                               (creează draft nou)              │
│                                          ↓                     │
│                               Succes! Nouă comandă draft       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Scenarii de Test

### Scenariul 1: Comandă trimisă în alt tab

1. Deschide wizard în Tab A
2. Completează pașii 1-7
3. Deschide același URL în Tab B
4. În Tab B, trimite comanda → status devine 'pending'
5. Revino în Tab A și modifică ceva
6. Auto-save încearcă PATCH → 400 INVALID_STATUS
7. Wizard generează nou orderId și creează draft nou

**Rezultat Așteptat:** Tab A continuă să funcționeze cu o nouă comandă draft.

### Scenariul 2: Sesiune expirată (GDPR cleanup)

1. Creează draft și notează orderId
2. Așteaptă 7 zile (sau simulează GDPR cleanup)
3. Revino la URL cu orderId vechi
4. Auto-save încearcă PATCH → 404 NOT_FOUND
5. Wizard creează draft nou

### Scenariul 3: URL cu orderId invalid

1. Navighează la `/comanda/cazier-fiscal?order=ORD-INVALID`
2. GET /api/orders/draft returnează 404
3. Wizard ignoră ID-ul invalid și creează draft nou

---

## Cum să Eviți Problemele

### Pentru Utilizatori

1. **Nu deschide aceeași comandă în mai multe tab-uri**
2. **Finalizează comanda într-o singură sesiune**
3. **Dacă vezi erori de salvare, reîncarcă pagina**

### Pentru Dezvoltatori

1. **Testează întotdeauna cu localStorage curat**
   ```javascript
   localStorage.clear();
   ```

2. **Verifică orderId înainte de PATCH**
   ```typescript
   const method = state.orderId ? 'PATCH' : 'POST';
   ```

3. **Gestionează eroarea INVALID_STATUS**
   ```typescript
   if (errorData.error?.code === 'INVALID_STATUS') {
     // Resetează și reîncearcă
   }
   ```

---

## Fișiere Modificate

| Fișier | Modificare |
|--------|------------|
| `src/app/api/orders/draft/route.ts` | Adăugat verificare status în POST handler |
| `src/providers/modular-wizard-provider.tsx` | Adăugat recuperare INVALID_STATUS |
| `src/types/verification-modules.ts` | Actualizat tip pentru orderId (string \| null) |

---

## Logging

Când apare recuperarea, în consolă vei vedea:

```
[warn] Order is no longer a draft - clearing orderId for fresh draft
```

Urmat de:

```
POST /api/orders/draft 201 in XXXms
```

Indicând că un draft nou a fost creat cu succes.

---

## Bug Fix: KYC Validation pentru Utilizatori cu Cont

**Data:** 2026-01-09
**Status:** Fixed

### Problema

Butonul "Continuă" din pasul "Date Personale" (Step 3) rămânea dezactivat chiar dacă utilizatorul avea KYC valid în cont. Mesajul "KYC verificat - poți sări peste pasul de scanare" apărea, dar validarea forma nu permitea continuarea.

### Cauza

Validarea din `isFormValid()` verifica dacă există documente uploadate:

```typescript
// Validation blocantă când acceptedDocuments este configurat
if (acceptedDocs.length > 0 && uploadedDocs.length === 0) {
  return false;
}
```

Această verificare nu lua în considerare cazul în care utilizatorul are deja KYC valid din cont.

### Soluția

**Fișier:** `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx`

```typescript
// Linia 469 - adăugat check pentru hasValidKycFromAccount
if (acceptedDocs.length > 0 && uploadedDocs.length === 0 && !hasValidKycFromAccount) {
  return false;
}
```

Adăugat `hasValidKycFromAccount` și în dependency array:
```typescript
}, [personalKyc, config, hasValidKycFromAccount]);
```

### Rezultat

- Utilizatorii cu KYC valid din cont pot continua fără a uploada documente noi
- Mesajul "KYC verificat" este acum funcțional
- Testul E2E trece cu succes pentru toate cele 9 pași

---

**Ultima Actualizare:** 2026-01-09
