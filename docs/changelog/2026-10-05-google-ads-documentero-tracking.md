# 05.10.2026 — Google Ads pe documentero: cont separat, conversii măsurate corect
<!-- categorie: infrastructura -->

## Pentru echipă

- Documentero va avea propriul cont Google Ads. Comenzile venite din reclamele lui se numără acum în contul documentero, nu în contul vechi al eghiseul.
- Pentru fiecare comandă plătită, Google primește în plus emailul și telefonul clientului, criptate. Așa recunoaște mai multe comenzi venite din reclame. Se trimit numai dacă clientul a acceptat cookie-urile de marketing.
- Pentru voi nu se schimbă nimic în admin. Comenzile din reclame se văd ca până acum, cu sursa în fișa comenzii.
- Planul de reclame (ce servicii, în ce ordine, când oprim) e în Ghid, la „Google Ads pe documentero.ro”.

---

## Rezumat tehnic

- `cookie-consent.tsx`: `adsIdFor(brand)`; pe documentero se încarcă doar `NEXT_PUBLIC_GOOGLE_ADS_ID_DOCUMENTERO` (fără fallback), `config` cu `allow_enhanced_conversions: true`.
- Pagina de succes: eticheta conversiei pe brand (`NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL_DOCUMENTERO` pe documentero), `gtag('set','user_data',{email, phone_number})` înainte de `conversion`; telefonul doar în E.164.
- Variabile noi în `.env.example` și `.claude/rules/environment.md`. Neschimbat pe eghiseul: aceleași `NEXT_PUBLIC_GOOGLE_ADS_ID` / `…_PURCHASE_LABEL`.
- Plan, setup cont, checklist de verificare: `docs/ads/2026-10-05-documentero-lansare-ads.md`.
