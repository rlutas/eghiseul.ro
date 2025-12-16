# Funcționalități Noi - eghiseul.ro Rebuild

## Core Features (P0 - Must Have)

### 1. Admin Dashboard
Înlocuiește Google Sheets cu dashboard centralizat.

**Funcționalități:**
- [ ] Lista comenzi cu filtre (status, serviciu, dată, client)
- [ ] Detalii comandă (date client, documente, istoric)
- [ ] Schimbare status comandă → notificare client
- [ ] Generare documente din dashboard
- [ ] Upload document scanat pentru client
- [ ] Trimitere email cu document
- [ ] Creare comandă manuală (pentru clienți telefon/email)
- [ ] Confirmare plată manuală (transfer bancar)
- [ ] Statistici și rapoarte

### 2. Sistem Contracte (OBLIGATORIU LEGAL)
Stocare obligatorie 10 ani.

**Documente generate automat:**
- [ ] Contract prestări servicii (per comandă)
- [ ] Contract împuternicire avocațială
- [ ] Formulare specifice per serviciu
- [ ] Numerotare automată (Nr. contract, Nr. delegație)

**Cerințe:**
- Template-uri editabile în admin
- Generare PDF din date formular
- Stocare securizată (AWS S3 / similar)
- Acces rapid, organizare pe client/serviciu/dată
- Backup automat

### 3. KYC (Know Your Customer)
Verificare identitate client.

**Funcționalități:**
- [ ] Upload act identitate (CI/Pașaport)
- [ ] AI: Extragere date din document (OCR)
- [ ] Pre-completare automată formular
- [ ] Selfie cu buletin pentru verificare
- [ ] AI: Face matching (selfie vs document)
- [ ] Resize/crop automat imagini
- [ ] KYC salvat în cont (valid X zile)
- [ ] Re-verificare la expirare

**Flow-uri speciale:**
- PF: KYC standard
- PJ: KYC reprezentant legal + opțional angajați
- PJ multi-angajați: KYC bulk pentru caziere multiple

### 4. Notificări
Comunicare automată cu clienții.

| Eveniment | Client | Admin |
|-----------|--------|-------|
| Comandă nouă | Email confirmare | Dashboard + Email |
| Status schimbat | Email + SMS | Dashboard |
| Document disponibil | Email cu link/atașament | - |
| Document expiră (7 zile) | Email reminder | - |
| Plată confirmată | Email + SMS | Dashboard |

---

## Features Importante (P1)

### 5. Coș de Cumpărături
Multi-serviciu în aceeași comandă.

**Flow:**
```
1. Selectare serviciu (ex: Cazier)
2. Completare pași specifici
3. Adaugă în coș
4. Selectare alt serviciu (ex: Extras CF)
5. Completare pași
6. Adaugă în coș
7. Checkout unic pentru toate
```

**Funcționalități:**
- [ ] Salvare coș (X zile)
- [ ] Revenire la coș salvat
- [ ] Discount pentru comenzi multiple (opțional)
- [ ] Preview total înainte de plată

### 6. Pagină Status Comandă (Public)
Client poate verifica statusul fără cont.

**Input:** Nr. comandă + Email
**Output:**
- Status curent
- Istoric statusuri
- Documente disponibile (dacă sunt)
- ETA (dacă e cazul)

### 7. Document Management
Gestionare documente primite și trimise.

**Workflow documente fizice:**
1. Primire document (ex: cazier de la instituție)
2. Scanare document
3. Upload în admin la comandă
4. Trimitere automată email către client
5. Stocare securizată

**Automatizări:**
- [ ] Notificare expirare document (ex: cazier = 6 luni)
- [ ] Ștergere automată documente expirate
- [ ] Arhivare conform GDPR
- [ ] Reguli retenție configurabile per tip document

### 8. Conturi Utilizatori
Clienții pot avea cont.

**Beneficii cont:**
- Date pre-completate la comenzi noi
- KYC salvat (nu mai trebuie refăcut)
- Istoric comenzi
- Documente primite
- Reînnoire rapidă servicii

### 9. Sistem Loialitate & Recompense
Recompensare clienți fideli și comenzi multiple.

**Tipuri discount:**
| Tip | Condiție | Discount |
|-----|----------|----------|
| **Multi-serviciu** | 2+ servicii în aceeași comandă | X% din total |
| **Client fidel** | Al 3-lea/5-lea/10-lea serviciu | Y% sau sumă fixă |
| **Revenire** | Client cu cont + istoric | Z% la recomandă |
| **Referral** | Cod de la alt client | Ambii primesc bonus |

**Funcționalități:**
- [ ] Discount automat la checkout pentru comenzi multiple
- [ ] Puncte de loialitate (1 RON = X puncte)
- [ ] Conversie puncte în discount
- [ ] Coduri promoționale (admin generează)
- [ ] Tracking referrals
- [ ] Nivel client (Bronze/Silver/Gold) bazat pe istoric
- [ ] Email automat cu oferte pentru clienți vechi inactivi

**Reguli business:**
- Discount-urile nu se cumulează (se aplică cel mai mare)
- Admin poate seta discount maxim per serviciu
- Rapoarte utilizare coduri/puncte

---

## Features API (P1)

### 10. API pentru Parteneri
Toate serviciile disponibile via API REST.

**Endpoints (exemplu):**
```
POST /api/v1/services/{service}/order
GET  /api/v1/orders/{id}/status
GET  /api/v1/orders/{id}/documents
POST /api/v1/kyc/verify
```

**Use cases:**
- Integrare în site-uri parteneri
- White-label pentru instituții
- Aplicații mobile third-party
- Automatizări B2B

**Cerințe:**
- [ ] Autentificare API keys
- [ ] Rate limiting
- [ ] Webhooks pentru status updates
- [ ] Documentație API (Swagger/OpenAPI)
- [ ] Sandbox pentru testing

---

## AI Features (P2)

### 11. OCR & Document Processing
- Scanare act identitate → extragere date
- Scanare documente → indexare și căutare
- Validare automată documente

### 12. Face Verification
- Selfie matching cu poza din buletin
- Liveness detection (anti-spoofing)

### 13. Chatbot / Asistent
- Răspuns la întrebări frecvente
- Ghidare în alegerea serviciului
- Status comandă prin chat

---

## Prioritizare Rezumat

| Prioritate | Features | Timeline |
|------------|----------|----------|
| **P0** | Admin Dashboard, Contracte, KYC basic, Notificări | MVP |
| **P1** | Coș, Status public, Doc management, Conturi, API | Faza 2 |
| **P2** | AI OCR, Face verify, Chatbot | Faza 3 |
