# Platforma Existentă - eghiseul.ro (WordPress)

## Stack Actual

| Component | Tehnologie | Detalii |
|-----------|-----------|---------|
| CMS | WordPress | Site principal |
| Forms | WPForms | Formulare multi-step cu plată |
| Plăți | Stripe | API live, tax ID pentru RO |
| Facturare | Olbio | Emitere automată |
| Tracking | Google Tag Manager | GTM-KJBL8FVZ |
| Analytics | GA4 | Purchase tracking |
| Comenzi | Google Sheets | Manual, per serviciu |
| Company Lookup | infocui.ro API | Validare CUI |

## Servicii Existente

### 1. Certificat Constatator ONRC
- **Form ID**: 7908
- **Validări**: Tipuri entități acceptate (SRL, SA, PFA, II, IF, Cooperativa)
- **Blocări**: ONG, Asociații, Fundații, Cabinete medicale, etc.
- **Flow**: CUI → Verificare tip → Completare date → Plată Stripe

### 2. Cazier Judiciar
- **Form ID**: 7876
- **Validări speciale**:
  - ONG-uri: Necesită extras Registrul Asociațiilor
  - PFA/II/IF: Se eliberează ca persoană fizică
- **Flow**: Date client → Verificare tip entitate → Atenționări speciale → Plată

### 3. Alte servicii (de confirmat)
- Form 235 (serviciu neidentificat)

## Integrări Cod (functions.php)

### Stripe Integration
```
- Procesare PaymentIntent
- Tax ID pentru clienți RO (ro_tin)
- Billing address update
- Traducere erori în română
- WhatsApp support pe erori plată
```

### CUI Validation (infocui.ro)
```
- Lookup automat date firmă
- Pre-completare: nume, adresă, cod înmatriculare, stare
- Validare format CUI
```

### Validări Business Logic
```
- ONRC: Blocare entități non-comerciale
- Cazier: Mesaje speciale ONG/PFA
- Payment state management
```

### Analytics
```
- GA4 purchase tracking
- DataLayer push pe submit success
- Deduplicare events
```

## Probleme Cunoscute

| Problemă | Descriere |
|----------|-----------|
| Google Sheets | Manual, nesincronizat, fără overview |
| Fără admin dashboard | Totul în WordPress + Sheets |
| Contracte manuale | Risc legal, timp pierdut |
| KYC problematic | Selfie cu buletin nu se încarcă |

## API Keys Active (în cod)

⚠️ **ATENȚIE**: Chei live în functions.php - de migrat în environment variables!

- Stripe Live: `sk_live_51OFE2w...` (EDIGITALIZARE SRL)
- infocui.ro: `dc780fcbe30e7fc2601df79720b70d2cf73a8825`
- GTM: `GTM-KJBL8FVZ`
