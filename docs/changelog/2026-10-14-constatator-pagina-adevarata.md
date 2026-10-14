# 14.10.2026 — Certificat constatator: pagina spune adevărul despre concurență, taxă și viteză
<!-- categorie: seo -->

## Pentru echipă

- Pe pagina certificatului constatator, timpul afișat e acum **real**: „~4 minute”, calculat automat din ultimele comenzi plătite (mediana de la plată la document; 87% gata în cel mult 10 minute). Se actualizează singur.
- Prețul arată că din 89 lei, **30 lei sunt taxa ONRC** (la istoric, 250 lei din 487).
- Tabelul comparativ nu mai are coloana „Alți operatori”, care spunea lucruri false (că lucrează doar în program, că au taxă de urgență). Acum compară cu ghișeul ONRC și cu platforma online a ONRC, unde clientul îl poate scoate și singur cu 30 lei. Dacă un client întreabă „de ce să plătesc 89 când ONRC cere 30”: îl cerem noi pe tipul potrivit, primește factură pe firmă și are suport.
- Atenție: de la 15.10.2026 casieriile ONRC se închid (anunț pe onrc.ro).

---

## Tehnic

- `src/lib/services/delivery-stats.ts` (`server-only`): `getDeliveryStats(slug)` = mediana minute `paid_at` → primul `order_history` `status_changed` cu `new_value->>status = 'document_ready'`, pe ultimele 100 de comenzi plătite non-test; `null` sub 20 de comenzi. Pe constatator: mediana 4, 87% ≤ 10 min, 75 de comenzi (14.10).
- `servicii/certificat-constatator-online/page.tsx`: trust strip (viteză reală + `SOCIAL_PROOF` în loc de „4.9/5 · 450” scris de mână), tabel cu 3 coloane, FAQ „în cât timp”, „gratuit” (ONRC: 30 lei, Ordin MJ 380/C/2024, fără semnătură electronică — https://onrc.ro/index.php/ro/informatii/certificate-constatatoare), „cât costă” cu taxa ONRC; scoasă fraza „la alți operatori, urgența costă în plus”.
- Diagnostic (agent, 14.10): organicul pe cluster a căzut >99% după spam update (89.072 → 267 afișări/28 zile), conversia wizard rămâne 62% (75/121), Meta 0 vânzări. Idei rămase, nefăcute: ofertă B2B (pachete pentru contabili/notari/leasing, email către ~70 clienți PJ), istoric la ~399 lei, unealtă „Verifică firma după CUI” (o singură pagină). Fără landinguri indexabile pe caz de folosire (au fost consolidate prin 308).
