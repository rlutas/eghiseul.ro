# Audit landing constatator pe politica OpenAI (02.09.2026)

Pagina de destinație: `https://eghiseul.ro/servicii/certificat-constatator-online/`
(`src/app/servicii/certificat-constatator-online/page.tsx`). Reviewul OpenAI citește titlul, copy-ul,
imaginea **și landingul**, cu LLM. Am căutat pe toate paginile de constatator: `avocat`, `Barou`, `juridic`,
`oficial`, `autorizat`, `garant`, `instant`, `100%`, `gratuit`, `eliber*`, `în numele`, `parten*`, `afilia*`.

## Ce am schimbat

| Fișier | Era | Acum | De ce |
|---|---|---|---|
| `servicii/certificat-constatator-online/page.tsx` (hero) | „Cererea este depusă la ONRC de avocatul nostru colaborator, înscris în Barou, care coordonează procedura în numele tău." | „Cererea este depusă la ONRC automat, prin sistemul nostru conectat la portalul Registrului Comerțului. Certificatul este emis și semnat electronic de ONRC; noi ți-l livrăm pe email." | (1) declanșator direct de *legal services*; (2) era **fals** — constatatorul merge prin API, fără avocat (`LAWYER_SERVICE_SLUGS`) |
| idem (badge hero + card preț) | „Eliberare în câteva minute" ×2 | „Primești în câteva minute" | „eliberare" sugerează că noi emitem; emite ONRC |
| idem (stat card) | „Eliberare automată 24/7" | „Depunere automată 24/7" | idem |
| idem (FAQ „Cât durează") | „sistemul emite automat, 24/7" | „depunem cererea automat, 24/7, iar ONRC emite certificatul" | claim fals de capabilitate |
| idem (FAQ „gratuit") | „certificatul constatator oficial (semnat electronic)" | „certificatul constatator semnat electronic de ONRC" | regula „fără oficial lângă document" |
| idem (secțiunea tipuri) | „Același certificat oficial ONRC" | „Același certificat ONRC" | idem |
| `certificat-constatator-insolventa/page.tsx` (FAQ) | „certificatul oficial ONRC, semnat electronic" | „certificatul ONRC semnat electronic" | idem |

Lint OK pe ambele fișiere. **De comis + push** înainte de a încărca anunțul (reviewul vede pagina live).

## Ce era deja bine (rămâne)

- `PrivateServiceNotice` sub hero: „serviciu privat de asistență și intermediere — nu suntem instituție de
  stat și nu suntem afiliați autorităților […] poți solicita documentul și direct" + link la ONRC.
  („asistență" simplă e ok; „asistență juridică" nu.)
- Preț final afișat cu „TAXE ONRC INCLUSE" + „Fără taxe ascunse"; FAQ spune explicit tariful ONRC de 30 lei
  și că serviciul e opțional.
- Pași clari (CUI → tip → plată → email); fără „garantat", fără „cel mai", fără „100 % sigur".
- H1 „Certificat Constatator Online de la Registrul Comerțului (ONRC)" — descrie sursa documentului, nu
  afiliere. Acceptabil.

## Ce NU am atins (și de ce)

- Homepage, `why-us-section.tsx`, `faq-data.tsx` pomenesc avocatul colaborator — sunt **adevărate** pentru
  serviciile cu avocat și nu sunt landingul anunțului. Nu trimitem trafic ChatGPT pe homepage.
- Paginile de tip (`certificat-constatator-pentru-banca` etc.): „taxa oficială de 30 lei la ONRC" = taxa
  instituției, nu „document oficial" — ok. Nu le folosim ca landing în runda 1 (prețul e pe pagina principală).
- Wizardul (`/comanda`): pentru constatator nu există contract de asistență juridică, doar contractul de
  prestări; nu are texte cu avocat în pași (grep pe `steps-modular` + `modules/signature` = 0).

## Checklist reutilizabil pentru ORICE landing trimis pe ChatGPT Ads

- [ ] zero „avocat / Barou / juridic / consultanță / asistență juridică / reprezentare / împuternicire"
- [ ] zero „oficial" lângă „document / certificat / act / extras"
- [ ] verbe corecte: „primești / depunem / obținem pentru tine" — nu „eliberăm / emitem"
- [ ] disclaimer „serviciu privat, nu instituție" vizibil sub hero + link la canalul direct
- [ ] preț final cu taxa inclusă, identic cu cel din anunț
- [ ] nicio promisiune pe care fluxul n-o livrează (timpi, „garantat", „instant")
- [ ] pagina răspunde 200, fără cont/paywall, fără redirect spre alt domeniu
- [ ] UTM-urile ajung în `orders.attribution` (test: deschide URL-ul cu UTM, fă draft, verifică în admin)
