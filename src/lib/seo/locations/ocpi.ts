/**
 * Birourile OCPI (Oficiul de Cadastru și Publicitate Imobiliară) per județ —
 * ancorează paginile de extras carte funciară pe județe (anti-doorway: date reale).
 * Sursă: subdomeniile oficiale ANCPI (`{cod}.ancpi.ro` sau `www.ancpi.ro/ocpi/{cod}`)
 * + directorul oficial. Verificat 2026-06-22. `program: null` = neverificat (nu afișa).
 */

export interface OcpiProgram {
  depunere: string;
  eliberare?: string;
}

export interface OcpiFaq {
  q: string;
  a: string;
}

export interface OcpiCounty {
  judet: string;
  slug: string;
  code: string; // cod auto / subdomeniu ANCPI (ex. cj, tm)
  office: string;
  resedinta: string; // municipiul reședință unde e biroul
  address: string;
  phone: string;
  email: string;
  program: OcpiProgram | null;
  bcpi: number | null;
  /** Orașe/comune reprezentative din județ, afișate pe pagina de județ (nu exhaustiv). */
  localities?: string[];
  /**
   * Particularitate REALĂ a pieței/evidenței CF din județ, 2–3 fraze.
   * Test anti-swap: trebuie să menționeze județul sau localități din el.
   */
  highlight?: string;
  /** Întrebări specifice județului — se adaugă la FAQ-ul generic al paginii. */
  localFaq?: OcpiFaq[];
}

const PROG_STD: OcpiProgram = {
  depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00',
  eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:30–13:30',
};

export const OCPI_COUNTIES: OcpiCounty[] = [
  { judet: 'Alba', slug: 'alba', code: 'ab', office: 'OCPI Alba', resedinta: 'Alba Iulia', address: 'Str. Septimius Severus nr. 59, Alba Iulia, 510129', phone: '0258 813170', email: 'ab@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00', eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:30–13:30' }, bcpi: null },
  { judet: 'Arad', slug: 'arad', code: 'ar', office: 'OCPI Arad', resedinta: 'Arad', address: 'Splaiul General Gheorghe Magheru nr. 13, Arad, 310329', phone: '0257 256744', email: 'ar@ancpi.ro', program: PROG_STD, bcpi: null },
  {
    judet: 'Argeș', slug: 'arges', code: 'ag', office: 'OCPI Argeș', resedinta: 'Pitești',
    address: 'Str. Maior Gheorghe Șonțu nr. 8A, Pitești, 110043', phone: '0248 215015', email: 'ag@ancpi.ro',
    program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:30', eliberare: 'Luni–Joi 11:00–16:00, Vineri 11:00–13:30' }, bcpi: null,
    localities: ['Pitești', 'Mioveni', 'Curtea de Argeș', 'Câmpulung', 'Topoloveni', 'Ștefănești', 'Bradu', 'Mărăcineni'],
    highlight: 'În Argeș, cele mai multe cereri de extras vin din Pitești și din zona periurbană — Ștefănești, Bradu, Mărăcineni — plus Mioveni, orașul uzinei Dacia. Autostrada A1 a apropiat județul de București, iar tranzacțiile cu case și terenuri din jurul Piteștiului au crescut odată cu naveta spre Capitală.',
    localFaq: [
      { q: 'Imobilul e în Mioveni sau Ștefănești — pot cere extrasul online?', a: 'Da. Interogarea se face în sistemul național e-Terra, care acoperă toate localitățile din județul Argeș. Ai nevoie de localitate și de numărul cărții funciare.' },
      { q: 'Unde depun cererea la OCPI Argeș dacă totuși vreau la ghișeu?', a: 'La sediul din Pitești, Str. Maior Gheorghe Șonțu nr. 8A, în programul de depunere. Pentru extrasul de informare drumul nu e necesar — comanda online interoghează același registru electronic.' },
    ],
  },
  { judet: 'Bacău', slug: 'bacau', code: 'bc', office: 'OCPI Bacău', resedinta: 'Bacău', address: 'Str. Ioniță Sandu Sturza nr. 78, Bacău, 600269', phone: '0234 571723', email: 'bc@ancpi.ro', program: null, bcpi: null },
  {
    judet: 'Bihor', slug: 'bihor', code: 'bh', office: 'OCPI Bihor', resedinta: 'Oradea',
    address: 'Calea Armatei Române nr. 1/A, Oradea, 410087', phone: '0259 401305', email: 'bh@ancpi.ro',
    program: null, bcpi: 5,
    localities: ['Oradea', 'Salonta', 'Beiuș', 'Marghita', 'Aleșd', 'Sânmartin', 'Băile Felix', 'Oșorhei'],
    highlight: 'Bihorul are carte funciară cu istoric lung, moștenit din sistemul austro-ungar — majoritatea imobilelor au CF deschisă de generații. Pe lângă Oradea, o piață aparte o fac stațiunile Băile Felix și Băile 1 Mai din comuna Sânmartin, unde se vând constant apartamente de vacanță.',
    localFaq: [
      { q: 'Pot obține extras pentru un apartament din Băile Felix?', a: 'Da. Băile Felix ține de comuna Sânmartin, iar cărțile funciare de acolo sunt în sistemul e-Terra ca oriunde în Bihor. Îți trebuie numărul cărții funciare și localitatea.' },
      { q: 'Casele vechi din Bihor apar în cartea funciară?', a: 'În marea lor majoritate, da. În Bihor evidența de carte funciară funcționează din perioada austro-ungară, deci și imobilele vechi au CF. Dacă știi doar adresa, nu și numărul CF, folosește serviciul de identificare imobil.' },
    ],
  },
  { judet: 'Bistrița-Năsăud', slug: 'bistrita-nasaud', code: 'bn', office: 'OCPI Bistrița-Năsăud', resedinta: 'Bistrița', address: 'Str. Nicolae Titulescu nr. 50A, Bistrița, 420044', phone: '0263 214267', email: 'bn@ancpi.ro', program: null, bcpi: 3 },
  { judet: 'Botoșani', slug: 'botosani', code: 'bt', office: 'OCPI Botoșani', resedinta: 'Botoșani', address: 'Piața Revoluției nr. 9, Botoșani, 710236', phone: '0231 582111', email: 'bt@ancpi.ro', program: null, bcpi: 4 },
  {
    judet: 'Brașov', slug: 'brasov', code: 'bv', office: 'OCPI Brașov', resedinta: 'Brașov',
    address: 'Str. Zizinului nr. 46A, Brașov', phone: '0368 139959', email: 'bv@ancpi.ro',
    program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00', eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:00–13:30' }, bcpi: 3,
    localities: ['Brașov', 'Săcele', 'Făgăraș', 'Zărnești', 'Codlea', 'Râșnov', 'Predeal', 'Ghimbav'],
    highlight: 'Brașovul este județ cu carte funciară istorică: în Transilvania sistemul CF funcționează de peste un secol, deci majoritatea imobilelor au istoric complet de proprietate. Cererea de extrase vine atât din municipiul Brașov, cât și din zona turistică Râșnov–Predeal–Poiana Brașov, unde se tranzacționează frecvent apartamente și case de vacanță.',
    localFaq: [
      { q: 'Pot cere extras pentru o cabană din Râșnov sau un apartament din Predeal?', a: 'Da, pentru orice localitate din județul Brașov. Extrasul se eliberează din sistemul e-Terra pe baza numărului de carte funciară și a localității, indiferent că imobilul e în municipiu sau într-o stațiune.' },
      { q: 'Imobilele vechi din Brașov au carte funciară?', a: 'Aproape toate. Evidența CF transilvăneană există aici de peste 100 de ani, așa că și casele vechi din centrul istoric au carte funciară deschisă. Dacă nu cunoști numărul CF, se poate afla din adresă prin serviciul de identificare imobil.' },
    ],
  },
  { judet: 'Brăila', slug: 'braila', code: 'br', office: 'OCPI Brăila', resedinta: 'Brăila', address: 'Strada Justiției nr. 1, Brăila, 810017', phone: '0239 627207', email: 'br@ancpi.ro', program: null, bcpi: 3 },
  { judet: 'Buzău', slug: 'buzau', code: 'bz', office: 'OCPI Buzău', resedinta: 'Buzău', address: 'Calea Eroilor nr. 10, Buzău, 120426', phone: '0238 711036', email: 'bz@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00', eliberare: 'Luni–Joi 10:30–15:30, Vineri 9:30–13:30' }, bcpi: 3 },
  { judet: 'Călărași', slug: 'calarasi', code: 'cl', office: 'OCPI Călărași', resedinta: 'Călărași', address: 'Str. Prelungirea București nr. 26, bl. M21, Călărași, 910125', phone: '0242 333698', email: 'cl@ancpi.ro', program: { depunere: 'Luni–Vineri 8:30–14:00', eliberare: 'Luni–Vineri 11:00–15:30' }, bcpi: 2 },
  { judet: 'Caraș-Severin', slug: 'caras-severin', code: 'cs', office: 'OCPI Caraș-Severin', resedinta: 'Reșița', address: 'Str. Traian Lalescu nr. 11, Reșița, 320050', phone: '0255 211415', email: 'cs@ancpi.ro', program: PROG_STD, bcpi: 3 },
  {
    judet: 'Cluj', slug: 'cluj', code: 'cj', office: 'OCPI Cluj', resedinta: 'Cluj-Napoca',
    address: 'Str. Alexandru Vaida Voevod nr. 53, Cluj-Napoca, 400436', phone: '0264 431666', email: 'cj@ancpi.ro',
    program: { depunere: 'Luni–Joi 8:00–16:30, Vineri 8:00–14:00' }, bcpi: 5,
    localities: ['Cluj-Napoca', 'Florești', 'Turda', 'Dej', 'Câmpia Turzii', 'Gherla', 'Apahida', 'Baciu'],
    highlight: 'Clujul are una dintre cele mai active piețe imobiliare din țară, cu prețuri pe metru pătrat în Cluj-Napoca peste media națională. Comuna Florești — cea mai populată comună din România — generează singură un volum mare de cereri de extras, pentru apartamentele din ansamblurile construite în ultimii 15 ani.',
    localFaq: [
      { q: 'Pot cere extras pentru un apartament din Florești sau Turda?', a: 'Da. Sistemul e-Terra acoperă toate localitățile din județul Cluj, de la Cluj-Napoca la cea mai mică comună. Ai nevoie de numărul cărții funciare și de localitate.' },
      { q: 'Trebuie să ajung la sediul OCPI Cluj de pe Alexandru Vaida Voevod?', a: 'Nu, pentru extrasul de informare nu. Cererea online interoghează același registru electronic pe care îl gestionează OCPI Cluj și birourile lui teritoriale, iar documentul vine pe email.' },
    ],
  },
  {
    judet: 'Constanța', slug: 'constanta', code: 'ct', office: 'OCPI Constanța', resedinta: 'Constanța',
    address: 'Str. Mihai Viteazu nr. 2B, Constanța, 900682', phone: '0241 488625', email: 'ct@ancpi.ro',
    program: PROG_STD, bcpi: 4,
    localities: ['Constanța', 'Mangalia', 'Medgidia', 'Năvodari', 'Cernavodă', 'Ovidiu', 'Eforie', 'Agigea'],
    highlight: 'Piața imobiliară din Constanța are o componentă sezonieră puternică: apartamentele de vacanță din Mamaia, Năvodari sau Eforie își schimbă des proprietarii, iar la fiecare vânzare notarul cere extras de carte funciară. Restul cererii vine din municipiul Constanța și din orașele-satelit Ovidiu și Agigea.',
    localFaq: [
      { q: 'Pot obține extras pentru un apartament din Mamaia sau Năvodari?', a: 'Da. Mamaia ține administrativ de municipiul Constanța, iar Năvodari e oraș separat — ambele sunt în sistemul e-Terra, ca orice localitate din județ. Îți trebuie numărul cărții funciare și localitatea.' },
      { q: 'Cumpăr un apartament de vacanță pe litoral. Ce verific în extras?', a: 'Cine e proprietarul înscris, dacă există ipoteci sau sechestre și dacă apartamentul are cotele de teren corect intabulate. La ansamblurile noi de pe litoral verifică și dacă imobilul e intabulat individual, nu doar pe blocul întreg.' },
    ],
  },
  { judet: 'Covasna', slug: 'covasna', code: 'cv', office: 'OCPI Covasna', resedinta: 'Sfântu Gheorghe', address: 'Str. 1 Decembrie 1918 nr. 3, Sfântu Gheorghe, 520008', phone: '0267 314578', email: 'cv@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 9:30–13:00', eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:30–13:30' }, bcpi: 3 },
  { judet: 'Dâmbovița', slug: 'dambovita', code: 'db', office: 'OCPI Dâmbovița', resedinta: 'Târgoviște', address: 'Bd. Ion Constantin Brătianu nr. 27, Târgoviște, 130530', phone: '0245 613956', email: 'db@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 9:30–13:00', eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:30–13:30' }, bcpi: 5 },
  {
    judet: 'Dolj', slug: 'dolj', code: 'dj', office: 'OCPI Dolj', resedinta: 'Craiova',
    address: 'Str. C.S. Nicolăescu-Plopșor nr. 4, Craiova, 200733', phone: '0251 413129', email: 'dj@ancpi.ro',
    program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00', eliberare: 'Luni–Joi 11:30–16:00, Vineri 8:30–14:00' }, bcpi: null,
    localities: ['Craiova', 'Băilești', 'Calafat', 'Filiași', 'Segarcea', 'Dăbuleni', 'Cârcea', 'Podari'],
    highlight: 'În Dolj, majoritatea tranzacțiilor imobiliare se fac în Craiova și în comunele limitrofe Cârcea și Podari, unde s-au construit multe locuințe noi în ultimii ani. OCPI Dolj ține evidența de carte funciară pentru toate cele peste 100 de localități ale județului, de la Calafat la Dăbuleni.',
    localFaq: [
      { q: 'Imobilul e în Cârcea sau Podari — pot cere extrasul online?', a: 'Da. Comunele din jurul Craiovei sunt în sistemul e-Terra ca orice localitate din Dolj. Pentru casele din ansamblurile noi ai nevoie de numărul cărții funciare al imobilului, trecut în actul de proprietate.' },
      { q: 'Unde este OCPI Dolj și trebuie să ajung acolo?', a: 'Sediul e în Craiova, pe Str. C.S. Nicolăescu-Plopșor nr. 4. Pentru extrasul de informare nu e nevoie de drum — cererea online interoghează același registru electronic, iar documentul vine pe email.' },
    ],
  },
  {
    judet: 'Galați', slug: 'galati', code: 'gl', office: 'OCPI Galați', resedinta: 'Galați',
    address: 'Str. Domnească nr. 244, Galați', phone: '0236 311774', email: 'gl@ancpi.ro',
    program: PROG_STD, bcpi: 3,
    localities: ['Galați', 'Tecuci', 'Târgu Bujor', 'Berești', 'Matca', 'Liești', 'Pechea', 'Șendreni'],
    highlight: 'În Galați, piața imobiliară e concentrată în municipiu, unde fondul mare de apartamente generează constant vânzări, succesiuni și credite ipotecare — toate cu extras CF la dosar. Al doilea pol este Tecuci, iar comunele mari — Matca, Liești, Pechea — adaugă tranzacții cu case și terenuri agricole.',
    localFaq: [
      { q: 'Pot cere extras pentru un imobil din Tecuci sau Matca?', a: 'Da, pentru orice localitate din județul Galați. Interogarea se face în sistemul național e-Terra pe baza numărului de carte funciară și a localității.' },
      { q: 'Unde este OCPI Galați?', a: 'Pe Str. Domnească nr. 244, în Galați. Nu trebuie să ajungi acolo pentru extrasul de informare — comanda online acoperă același registru electronic, iar documentul vine pe email în câteva minute.' },
    ],
  },
  { judet: 'Giurgiu', slug: 'giurgiu', code: 'gr', office: 'OCPI Giurgiu', resedinta: 'Giurgiu', address: 'Bd. 1907 nr. 1, scara B, Giurgiu, 080316', phone: '0246 216444', email: 'gr@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: null },
  { judet: 'Gorj', slug: 'gorj', code: 'gj', office: 'OCPI Gorj', resedinta: 'Târgu Jiu', address: 'Str. 8 Martie nr. 3A, Târgu-Jiu, 210280', phone: '0253 217188', email: 'gj@ancpi.ro', program: null, bcpi: null },
  { judet: 'Harghita', slug: 'harghita', code: 'hr', office: 'OCPI Harghita', resedinta: 'Miercurea Ciuc', address: 'Str. Kossuth Lajos nr. 2, Miercurea-Ciuc, 530221', phone: '0266 371018', email: 'hr@ancpi.ro', program: null, bcpi: 4 },
  { judet: 'Hunedoara', slug: 'hunedoara', code: 'hd', office: 'OCPI Hunedoara', resedinta: 'Deva', address: 'Calea Zarandului nr. 106, Deva', phone: '0254 214165', email: 'hd@ancpi.ro', program: { depunere: 'Luni–Joi 8:00–16:30, Vineri 8:00–14:00' }, bcpi: null },
  { judet: 'Ialomița', slug: 'ialomita', code: 'il', office: 'OCPI Ialomița', resedinta: 'Slobozia', address: 'Str. Gării nr. 3, Slobozia, 920003', phone: '0243 232299', email: 'il@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 9:30–13:00' }, bcpi: null },
  {
    judet: 'Iași', slug: 'iasi', code: 'is', office: 'OCPI Iași', resedinta: 'Iași',
    address: 'Str. Costache Negri nr. 48, Iași, 700071', phone: '0232 316797', email: 'is@ancpi.ro',
    program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: 4,
    localities: ['Iași', 'Pașcani', 'Hârlău', 'Târgu Frumos', 'Miroslava', 'Valea Lupului', 'Rediu', 'Tomești'],
    highlight: 'Iașiul este cel mai mare oraș din Moldova, iar piața lui imobiliară s-a extins în comunele limitrofe: Miroslava, Valea Lupului și Rediu sunt printre comunele cu cele mai multe construcții noi din țară. Toate aceste imobile intră în evidența de carte funciară ținută de OCPI Iași.',
    localFaq: [
      { q: 'Imobilul e în Miroslava sau Valea Lupului — merge online?', a: 'Da. Casele și apartamentele din comunele de lângă Iași sunt în sistemul e-Terra ca orice imobil din județ. Ai nevoie de numărul cărții funciare, trecut în actul de proprietate sau în contractul de vânzare.' },
      { q: 'Unde este OCPI Iași și trebuie să ajung acolo?', a: 'Sediul e pe Str. Costache Negri nr. 48, în Iași, cu depunere Luni–Joi 8:30–14:00 și Vineri 8:30–13:00. Pentru extrasul de informare drumul nu e necesar — cererea online interoghează același registru.' },
    ],
  },
  {
    judet: 'Ilfov', slug: 'ilfov', code: 'if', office: 'OCPI Ilfov', resedinta: 'București',
    address: 'Șos. Pavel D. Kiseleff nr. 34, sector 1, București, 011347', phone: '021 224 6085', email: 'if@ancpi.ro',
    program: null, bcpi: null,
    localities: ['Voluntari', 'Popești-Leordeni', 'Bragadiru', 'Otopeni', 'Buftea', 'Chiajna', 'Corbeanca', 'Snagov'],
    highlight: 'Ilfovul este printre județele cu cele mai multe construcții noi din România: ansamblurile din Popești-Leordeni, Bragadiru, Voluntari sau Chiajna aduc constant imobile noi în cartea funciară. La cumpărarea unei locuințe noi, extrasul arată dacă apartamentul sau casa e intabulată individual și dacă dezvoltatorul mai are ipoteci pe teren.',
    localFaq: [
      { q: 'Imobilul e în Popești-Leordeni, Bragadiru sau altă localitate din Ilfov — merge online?', a: 'Da, pentru orice localitate din județ. Sistemul e-Terra acoperă tot Ilfovul; ai nevoie de localitate și de numărul cărții funciare al imobilului.' },
      { q: 'De ce OCPI Ilfov are sediul în București?', a: 'Ilfovul nu are municipiu reședință propriu, așa că oficiul funcționează pe Șos. Kiseleff nr. 34, în sectorul 1. Pentru extrasul de informare sediul nu contează — cererea se procesează electronic, indiferent de localitate.' },
    ],
  },
  { judet: 'Maramureș', slug: 'maramures', code: 'mm', office: 'OCPI Maramureș', resedinta: 'Baia Mare', address: 'Str. Cosmonauților nr. 3, Baia Mare, 430053', phone: '0262 221587', email: 'mm@ancpi.ro', program: null, bcpi: 4 },
  { judet: 'Mehedinți', slug: 'mehedinti', code: 'mh', office: 'OCPI Mehedinți', resedinta: 'Drobeta-Turnu Severin', address: 'Str. Șerpetina Roșiori nr. 1A, Drobeta-Turnu Severin, 220235', phone: '0252 316874', email: 'mh@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: 3 },
  {
    judet: 'Mureș', slug: 'mures', code: 'ms', office: 'OCPI Mureș', resedinta: 'Târgu Mureș',
    address: 'Str. Căprioarei nr. 2, Târgu Mureș, 540314', phone: '0265 211338', email: 'ms@ancpi.ro',
    program: { depunere: 'Luni–Joi 8:00–16:30, Vineri 8:00–14:00' }, bcpi: 5,
    localities: ['Târgu Mureș', 'Reghin', 'Sighișoara', 'Târnăveni', 'Luduș', 'Sovata', 'Sângeorgiu de Mureș', 'Ungheni'],
    highlight: 'Mureșul are evidență de carte funciară de tip transilvănean, cu istoric complet pentru majoritatea imobilelor. Cererile de extras vin din Târgu Mureș și din orașele Reghin, Sighișoara și Târnăveni, plus stațiunea Sovata, unde se tranzacționează apartamente și case de vacanță.',
    localFaq: [
      { q: 'Pot cere extras pentru un imobil din Sighișoara sau Reghin?', a: 'Da, pentru orice localitate din județul Mureș. Extrasul se eliberează din sistemul e-Terra pe baza numărului de carte funciară și a localității, inclusiv pentru casele din centrul istoric al Sighișoarei.' },
      { q: 'Ce program are OCPI Mureș dacă vreau totuși la ghișeu?', a: 'Depunerea se face Luni–Joi 8:00–16:30 și Vineri 8:00–14:00, la sediul din Târgu Mureș, Str. Căprioarei nr. 2. Online nu depinzi de acest program — comanda merge oricând, iar extrasul vine pe email.' },
    ],
  },
  { judet: 'Neamț', slug: 'neamt', code: 'nt', office: 'OCPI Neamț', resedinta: 'Piatra Neamț', address: 'Str. Mihai Eminescu nr. 26B, Piatra Neamț, 610029', phone: '0233 217142', email: 'nt@ancpi.ro', program: null, bcpi: 4 },
  { judet: 'Olt', slug: 'olt', code: 'ot', office: 'OCPI Olt', resedinta: 'Slatina', address: 'Str. Nicolae Bălcescu nr. 2, Slatina, 230092', phone: '0249 437930', email: 'ot@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: 2 },
  {
    judet: 'Prahova', slug: 'prahova', code: 'ph', office: 'OCPI Prahova', resedinta: 'Ploiești',
    address: 'Str. Unirii nr. 2, Ploiești, 100043', phone: '0244 519569', email: 'ph@ancpi.ro',
    program: null, bcpi: null,
    localities: ['Ploiești', 'Câmpina', 'Sinaia', 'Bușteni', 'Azuga', 'Vălenii de Munte', 'Mizil', 'Blejoi'],
    highlight: 'Prahova combină piața rezidențială din Ploiești cu piața de vacanță de pe Valea Prahovei: Sinaia, Bușteni și Azuga atrag cumpărători din toată țara, mai ales din București. La orice astfel de tranzacție, notarul cere extras din evidența de carte funciară administrată de OCPI Prahova.',
    localFaq: [
      { q: 'Pot cere extras pentru un apartament din Sinaia sau Bușteni?', a: 'Da. Stațiunile de pe Valea Prahovei sunt în sistemul e-Terra ca orice localitate din județ. Ai nevoie de numărul cărții funciare — la apartamentele de vacanță îl găsești în contractul de vânzare-cumpărare.' },
      { q: 'Cumpăr o proprietate în Prahova, dar locuiesc în alt județ. Contează?', a: 'Nu. Extrasul de informare se cere online indiferent unde locuiești; contează doar localitatea din Prahova și numărul cărții funciare al imobilului. Documentul vine pe email.' },
    ],
  },
  { judet: 'Sălaj', slug: 'salaj', code: 'sj', office: 'OCPI Sălaj', resedinta: 'Zalău', address: 'Piața Iuliu Maniu nr. 2, Zalău, 450018', phone: '0260 618322', email: 'sj@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: null },
  { judet: 'Satu Mare', slug: 'satu-mare', code: 'sm', office: 'OCPI Satu Mare', resedinta: 'Satu Mare', address: 'Str. Martirilor Deportați nr. 52, Satu Mare, 440025', phone: '0261 714262', email: 'sm@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: 3 },
  {
    judet: 'Sibiu', slug: 'sibiu', code: 'sb', office: 'OCPI Sibiu', resedinta: 'Sibiu',
    address: 'Calea Dumbravii nr. 34, Sibiu, 550324', phone: '0269 217477', email: 'sb@ancpi.ro',
    program: PROG_STD, bcpi: 5,
    localities: ['Sibiu', 'Mediaș', 'Cisnădie', 'Șelimbăr', 'Avrig', 'Agnita', 'Tălmaciu', 'Ocna Sibiului'],
    highlight: 'Sibiul are carte funciară istorică — sistemul CF transilvănean funcționează aici de peste un secol, deci și imobilele vechi din centrul istoric au evidență completă. Piața rezidențială nouă s-a mutat în bună parte în Șelimbăr și Cisnădie, unde ansamblurile de lângă municipiu generează constant cereri de intabulare și de extras.',
    localFaq: [
      { q: 'Pot cere extras pentru un imobil din Șelimbăr sau Cisnădie?', a: 'Da. Localitățile din jurul Sibiului sunt în sistemul e-Terra ca orice altă localitate din județ. Pentru locuințele din ansamblurile noi, numărul cărții funciare e trecut în actul de proprietate.' },
      { q: 'Casele vechi din Sibiu au carte funciară?', a: 'În marea lor majoritate, da — evidența CF există în Sibiu de peste 100 de ani. Dacă știi doar adresa imobilului, nu și numărul CF, folosește întâi serviciul de identificare imobil.' },
    ],
  },
  {
    judet: 'Suceava', slug: 'suceava', code: 'sv', office: 'OCPI Suceava', resedinta: 'Suceava',
    address: 'B-dul 1 Decembrie nr. 3, Suceava, 720262', phone: '0230 523317', email: 'sv@ancpi.ro',
    program: PROG_STD, bcpi: 5,
    localities: ['Suceava', 'Fălticeni', 'Rădăuți', 'Câmpulung Moldovenesc', 'Vatra Dornei', 'Gura Humorului', 'Șcheia', 'Ipotești'],
    highlight: 'Suceava este cel mai întins județ din Moldova, iar piața lui merge de la apartamentele din municipiu la pensiunile și casele de vacanță din Bucovina — Gura Humorului, Câmpulung Moldovenesc, Vatra Dornei. Comunele Șcheia și Ipotești, lipite de municipiu, concentrează multe dintre construcțiile noi.',
    localFaq: [
      { q: 'Pot obține extras pentru o pensiune din Gura Humorului sau Vatra Dornei?', a: 'Da, pentru orice imobil din județul Suceava — casă, pensiune, teren sau apartament. Interogarea se face în sistemul e-Terra pe baza numărului de carte funciară și a localității.' },
      { q: 'Unde este OCPI Suceava?', a: 'Pe B-dul 1 Decembrie nr. 3, în Suceava. Nu trebuie să ajungi acolo pentru extrasul de informare: comanda online interoghează același registru, iar documentul vine pe email în câteva minute.' },
    ],
  },
  { judet: 'Teleorman', slug: 'teleorman', code: 'tr', office: 'OCPI Teleorman', resedinta: 'Alexandria', address: 'Str. Confederației nr. 2, Alexandria', phone: '0247 312210', email: 'tr@ancpi.ro', program: null, bcpi: 3 },
  {
    judet: 'Timiș', slug: 'timis', code: 'tm', office: 'OCPI Timiș', resedinta: 'Timișoara',
    address: 'Strada Armoniei nr. 1C, Timișoara, 300291', phone: '0256 201089', email: 'tm@ancpi.ro',
    program: null, bcpi: 5,
    localities: ['Timișoara', 'Lugoj', 'Dumbrăvița', 'Giroc', 'Moșnița Nouă', 'Sânnicolau Mare', 'Jimbolia', 'Ghiroda'],
    highlight: 'În Banat, cartea funciară are tradiție veche: sistemul funcționează din perioada austro-ungară, deci majoritatea imobilelor din Timiș au istoric CF complet. Zona metropolitană a Timișoarei — Dumbrăvița, Giroc, Moșnița Nouă — concentrează cele mai multe intabulări de construcții noi din județ.',
    localFaq: [
      { q: 'Imobilul e în Dumbrăvița sau Giroc — pot cere extrasul online?', a: 'Da. Comunele din jurul Timișoarei sunt în sistemul e-Terra ca orice localitate din Timiș. Pentru casele din ansamblurile noi, numărul cărții funciare e trecut în actul de proprietate.' },
      { q: 'Imobilele vechi din Timiș au carte funciară?', a: 'Aproape toate. În Banat evidența CF funcționează de peste un secol, așa că și casele vechi din Timișoara sau Lugoj au carte funciară deschisă. Dacă știi doar adresa, folosește serviciul de identificare imobil ca să afli numărul CF.' },
    ],
  },
  { judet: 'Tulcea', slug: 'tulcea', code: 'tl', office: 'OCPI Tulcea', resedinta: 'Tulcea', address: 'Str. Corneliu Gavrilov nr. 152, Tulcea, 820119', phone: '0240 511486', email: 'tl@ancpi.ro', program: null, bcpi: null },
  { judet: 'Vaslui', slug: 'vaslui', code: 'vs', office: 'OCPI Vaslui', resedinta: 'Vaslui', address: 'Str. Eternității nr. 1, Vaslui, 730112', phone: '0235 311731', email: 'vs@ancpi.ro', program: null, bcpi: 3 },
  { judet: 'Vâlcea', slug: 'valcea', code: 'vl', office: 'OCPI Vâlcea', resedinta: 'Râmnicu Vâlcea', address: 'Str. General Praporgescu nr. 22, Râmnicu Vâlcea', phone: '0250 744150', email: 'vl@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: null },
  { judet: 'Vrancea', slug: 'vrancea', code: 'vn', office: 'OCPI Vrancea', resedinta: 'Focșani', address: 'Str. Cuza Vodă nr. 69, Focșani, 620034', phone: '0237 228754', email: 'vn@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 9:30–13:00', eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:30–13:30' }, bcpi: 3 },
  {
    judet: 'București', slug: 'bucuresti', code: 'b', office: 'OCPI București', resedinta: 'București',
    address: 'Bulevardul Expoziției nr. 1A, sector 1, București, 012101', phone: '0374 488100', email: 'registratura.b@ancpi.ro',
    program: PROG_STD, bcpi: 6,
    localities: ['Sectorul 1', 'Sectorul 2', 'Sectorul 3', 'Sectorul 4', 'Sectorul 5', 'Sectorul 6'],
    highlight: 'Cărțile funciare din București sunt organizate pe cele 6 sectoare, fiecare cu propriul birou de cadastru și publicitate imobiliară în subordinea OCPI București. Capitala are cel mai mare volum de tranzacții imobiliare din țară, iar extrasul de informare este primul document verificat la orice vânzare sau credit ipotecar.',
    localFaq: [
      { q: 'Pot obține extras de carte funciară pentru orice sector din București?', a: 'Da. Interogarea se face în sistemul național e-Terra, care acoperă toate cele 6 sectoare. Ai nevoie de numărul cărții funciare și de sector — nu contează la ce birou de sector e arondat imobilul.' },
      { q: 'Unde este sediul OCPI București?', a: 'Pe Bulevardul Expoziției nr. 1A, în sectorul 1. Pentru extrasul de informare nu trebuie să ajungi acolo — comanda online interoghează același registru electronic, iar documentul vine pe email.' },
    ],
  },
];

const BY_SLUG = new Map(OCPI_COUNTIES.map((c) => [c.slug, c]));

export function getOcpiCounty(slug: string): OcpiCounty | undefined {
  return BY_SLUG.get(slug);
}
export function allOcpiSlugs(): string[] {
  return OCPI_COUNTIES.map((c) => c.slug);
}
/** Județe apropiate (pentru internal linking) — alfabetic, fără cel curent. */
export function nearbyOcpiCounties(slug: string, n = 6): OcpiCounty[] {
  const idx = OCPI_COUNTIES.findIndex((c) => c.slug === slug);
  if (idx === -1) return [];
  const out: OcpiCounty[] = [];
  for (let step = 1; out.length < n && step < OCPI_COUNTIES.length; step++) {
    const a = OCPI_COUNTIES[(idx + step) % OCPI_COUNTIES.length];
    if (a.slug !== slug) out.push(a);
  }
  return out;
}
