# 2026-08-18 — Transfer bancar: date reale + plată în RON sau EUR

## Problema

La checkout, secțiunea de transfer bancar afișa date **hardcodate și false** în
`src/components/payment/BankTransferDetails.tsx`:

```
beneficiar: SC EGHISEUL SRL
IBAN:       RO49 BTRL 0000 1234 5678 9012   ← cont inventat
```

Orice client care a plătit prin transfer a primit un IBAN inexistent.

## Ce s-a livrat

**1. Datele reale, din setări.** `admin_settings.bank_details` populat cu datele din extrasele
Băncii Transilvania:

| Câmp | Valoare |
|---|---|
| Titular | EDIGITALIZARE SRL |
| Bancă | Banca Transilvania |
| SWIFT/BIC | BTRLRO22 |
| IBAN RON | RO82BTRLRONCRT0CP9350501 |
| IBAN EUR | RO29BTRLEURCRT0CP9350501 |

**2. Setări → Plăți** are acum câmpuri pentru **IBAN euro** și **SWIFT/BIC** (înainte doar IBAN,
bancă, titular). Orice modificare de aici se vede imediat la checkout.

**3. Endpoint public** `GET /api/payment/bank-details` — servește datele către checkout (public
intenționat: aceleași date apar pe factură). Dacă setarea lipsește, întoarce 404 și componenta
afișează „datele nu sunt disponibile, scrie-ne" — niciodată un cont inventat.

**4. Clientul alege moneda.** Când există cont în euro ȘI avem cursul BNR, la checkout apar două
butoane: „Plătesc în lei" / „Plătesc în euro". Alegerea schimbă IBAN-ul afișat și suma:

- lei → IBAN RON, suma exactă a comenzii;
- euro → IBAN EUR, suma convertită la cursul BNR al zilei (rotunjită în sus la 2 zecimale), cu
  mențiunea că banca poate aplica alt curs și că plata e completă când ajung leii comenzii.

Cursul vine din `/api/bnr-rate` (feed BNR, cache 1h) — deja folosit de calculatoarele din site.

## Fișiere

| Fișier | Rol |
|---|---|
| `src/app/api/payment/bank-details/route.ts` | endpoint public (nou) |
| `src/components/payment/BankTransferDetails.tsx` | date din API + comutator RON/EUR + conversie BNR |
| `src/app/admin/settings/page.tsx` | câmpuri IBAN euro + SWIFT în tabul Plăți |

## De verificat

- [ ] O comandă de test cu plata prin transfer: verifică IBAN-ul afișat în ambele monede
- [ ] Dacă apar plăți în euro, urmărește dacă suma încasată acoperă totalul în lei (diferențe de curs)
