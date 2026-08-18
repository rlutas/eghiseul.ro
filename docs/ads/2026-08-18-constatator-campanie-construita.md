# Campania „Search-Constatator-2026-08" — ce e construit și ce mai lipsește

Construită pe 18.08.2026 în contul **eGhiseul 677-995-5005**.
`campaignId=281499126339525`, `draftId=10209835597`. **Nu e pornită** (nu s-a ajuns la publicare).

## 0. Blocant: tracking-ul de conversii era mort (reparat în cod)

Acțiunea de conversie `Purchase` din cont e marcată „Necesită atenție": după migrarea de pe
WordPress, site-ul trimitea doar evenimentul GA4, iar contul Google Ads nu mai primea nimic din
iulie 2026. Fără ea, orice campanie ar licita orb.

Reparat (commit `57f401f`):
- eticheta `AW-11464910041` se încarcă la consimțământ de **marketing**;
- pe pagina de succes se declanșează `gtag('event','conversion')` cu
  `send_to: AW-11464910041/-6VnCLTCjogZENnJ8toq`, valoarea reală a comenzii și `transaction_id`;
- variabilele `NEXT_PUBLIC_GOOGLE_ADS_ID` și `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` adăugate în
  Vercel (production).

⚠️ De verificat după deploy: o comandă de test trebuie să apară în Google Ads ca `Purchase` cu
valoare (poate dura câteva ore).

## 1. Ce e configurat în campanie

| Setare | Valoare | De ce |
|---|---|---|
| Obiectiv | Vânzări, **doar `Achiziții`** | am scos apeluri/mesaje/contacte, ca licitarea să nu optimizeze spre evenimente ieftine (greșeala campaniei vechi de CF) |
| Tip | Rețeaua de căutare | — |
| Licitare | **Clicuri, cu limită CPC 6 lei** | CPC istoric pe exact a fost 9,12 → peste marjă; n-avem încă date de conversie pentru tCPA |
| Rețele | Partenerii de căutare **OFF**, Display **OFF** | ambele sunt bifate implicit și consumă buget în afara intenției |
| AI Max | **OFF** | ar readuce potrivirea amplă care a ars 52.000 lei pe căutări de tip instituție |
| Locație | România, **doar „Prezență"** | nu „prezență sau interes" |
| Limbă | Română | — |
| Anunțuri politice UE | Nu | — |

### Grup de anunțuri 1 — constatator firmă

Cuvinte cheie (exact + frază):
`[certificat constatator online]`, `[certificat constatator]`, `[certificat constatator firma]`,
`[eliberare certificat constatator]`, `[certificat constatator onrc online]`,
`"certificat constatator cui"`, `"certificat constatator pentru firma"`,
`"comanda certificat constatator"`

Anunț RSA → `https://eghiseul.ro/servicii/certificat-constatator-online/`,
cale afișată `/certificat/constatator`.

Titluri: Certificat Constatator ONRC · Livrat în câteva minute · Taxa ONRC inclusă: 89 lei ·
Emis automat, non-stop · Semnat electronic ONRC · **Serviciu privat, nu ONRC** · Comanzi în 2 minute ·
Fără cont, fără drumuri

Descrieri:
1. Serviciu privat de intermediere, independent de ONRC. Preț final 89 lei, cu factură.
2. Comanzi online, primești documentul pe email în câteva minute. Taxa ONRC inclusă.
3. Emis și semnat electronic, verificabil online. Funcționează 24/7, inclusiv weekend.
4. Completezi CUI-ul, plătești cu cardul, primești certificatul. Fără deplasări.

Niciun titlu/descriere nu conține „documente oficiale" — sintagma care a dus la respingerea tuturor
anunțurilor vechi pe politica documentelor guvernamentale.

Estimarea Google pentru grupul ăsta: ~23 clicuri/săptămână, CPC mediu 6,25 lei, ~144 lei/săptămână.

## 2. Unde s-a oprit

La pasul **Buget**, Google a cerut **confirmarea identității** contului (re-autentificare cu parola/2FA).
Nu introduc eu credențiale — pasul îl face Raul. Până atunci, bugetul nu e setat și campania nu e creată.

## 3. Ce mai e de făcut, în ordine

- [ ] **Raul**: confirmă identitatea în fereastra deschisă, apoi buget **50 lei/zi** și finalizează
      creare. Campania se lasă **pe pauză** până la verificarea de mai jos.
- [ ] Adăugat lista de excluderi la nivel de campanie (`gratis`, `gratuit`, `onrc`, `portal onrc`,
      `myportal`, `model`, `formular`, `pdf`, `ce este`, `cat costa`, `anaf`, `recom`,
      `verificare firma gratis`, `date firma gratis`, `termene`)
- [ ] Adăugate 4 sitelinkuri (constatator firmă / PF / cu istoric / cum funcționează)
- [ ] Verificat că anunțul trece de review (nu „Respins — Documente guvernamentale")
- [ ] Verificat că `Purchase` primește conversii de la site-ul nou
- [ ] Abia apoi pornit, cu monitorizare zilnică a termenilor de căutare în prima săptămână

## 4. Grupurile următoare (după ce primul merge)

- **Constatator PF** — `[certificat constatator persoana fizica]`, `[constatator pe cnp]`
- **Istoric** — `[certificat constatator cu istoric]`, `[raport istoric onrc]`; aici marja suportă
  CPC-ul de 9 lei, spre deosebire de produsul de bază
