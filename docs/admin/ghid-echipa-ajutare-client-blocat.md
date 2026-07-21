# Ghid echipă — ajutarea clientului blocat + solicitarea de documente

Mesaj pentru echipă (2026-07-21). Două unelte noi ca să ajutați clienții care se
blochează sau au documente greșite. **Vă rog testați și spuneți dacă merge.**

---

## 1. „Solicită documente" — cazierjudiciaronline.com + ecazier.ro

**Când:** clientul a plătit, dar un document e greșit sau lipsă (CI expirat,
selfie neclar, lipsă act de identitate).

**Cum:**
1. Deschideți comanda în admin → secțiunea **Documente** → butonul
   **„Solicită documente"**.
2. Bifați ce cereți (act identitate față / verso / selfie) + scrieți **motivul**
   (ex. „CI expirat", „selfie neclar").
3. **Trimite cererea** → clientul primește **email + link**; comanda intră
   automat în **„așteptare client"** (deadline-ul e pauzat cât timp așteptăm).
4. Apare un **card cu progresul**: vedeți ✓ pe fiecare document pe măsură ce
   clientul îl încarcă.
5. Din card puteți **copia link-ul** sau **trimite pe WhatsApp** direct.
6. Când clientul a încărcat tot ce s-a cerut, comanda **iese automat** din
   așteptare și merge mai departe.

**Important:** clientul confirmă întâi **emailul comenzii** (securitate — ca să nu
poată deschide altcineva link-ul). NU trebuie să semneze contractul sau să
plătească din nou — doar reîncarcă documentele cerute.

---

## 2. „Vezi unde s-a blocat clientul" — eghiseul.ro

**Când:** clientul sună că nu poate continua în formular / comanda.

**Cum:**
1. În `/admin/orders`, tab **„Neplătite"** (sau caută după email / telefon) →
   comanda lui (status Ciornă / Neplătită).
2. Sub status vedeți **„pas: ..."** (Contact / Date personale / Livrare /
   Facturare / Verificare) = **exact unde s-a oprit clientul**.
3. Deschideți comanda → vedeți ce a completat deja.
4. Dacă i-a plecat link de continuare (email de recuperare), acum îl duce înapoi
   **la pasul corect**, nu de la început.

**5. Ajutor direct (nou):** pe bannerul galben „Comandă neterminată" aveți:
- **„Copiază link continuare"** — pe ciorne generează un link special (valabil
  48h) care îl duce pe client înapoi în formular, la pasul lui, cu datele lui —
  **merge chiar dacă clientul nu apucase să-și pună emailul**.
- **„Editează datele clientului"** — corectați nume / CNP / adresă / contact
  direct din admin; la revenire clientul primește automat datele corectate.
(Contractul, KYC-ul și plata rămân mereu la client — pe astea nu le facem noi.)

---

## Ce vă rog să testați
- **Solicită documente:** cereți un document pe o comandă de test → verificați că
  emailul ajunge, link-ul se deschide pe telefon, iar cardul de progres se
  actualizează după upload.
- **Unde s-a blocat:** deschideți câteva comenzi Neplătite → verificați că pasul
  afișat e corect (corespunde cu unde crede clientul că s-a oprit).
- Spuneți-mi orice nu e clar sau nu merge.
