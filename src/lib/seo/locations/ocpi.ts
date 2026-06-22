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
}

const PROG_STD: OcpiProgram = {
  depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00',
  eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:30–13:30',
};

export const OCPI_COUNTIES: OcpiCounty[] = [
  { judet: 'Alba', slug: 'alba', code: 'ab', office: 'OCPI Alba', resedinta: 'Alba Iulia', address: 'Str. Septimius Severus nr. 59, Alba Iulia, 510129', phone: '0258 813170', email: 'ab@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00', eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:30–13:30' }, bcpi: null },
  { judet: 'Arad', slug: 'arad', code: 'ar', office: 'OCPI Arad', resedinta: 'Arad', address: 'Splaiul General Gheorghe Magheru nr. 13, Arad, 310329', phone: '0257 256744', email: 'ar@ancpi.ro', program: PROG_STD, bcpi: null },
  { judet: 'Argeș', slug: 'arges', code: 'ag', office: 'OCPI Argeș', resedinta: 'Pitești', address: 'Str. Maior Gheorghe Șonțu nr. 8A, Pitești, 110043', phone: '0248 215015', email: 'ag@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:30', eliberare: 'Luni–Joi 11:00–16:00, Vineri 11:00–13:30' }, bcpi: null },
  { judet: 'Bacău', slug: 'bacau', code: 'bc', office: 'OCPI Bacău', resedinta: 'Bacău', address: 'Str. Ioniță Sandu Sturza nr. 78, Bacău, 600269', phone: '0234 571723', email: 'bc@ancpi.ro', program: null, bcpi: null },
  { judet: 'Bihor', slug: 'bihor', code: 'bh', office: 'OCPI Bihor', resedinta: 'Oradea', address: 'Calea Armatei Române nr. 1/A, Oradea, 410087', phone: '0259 401305', email: 'bh@ancpi.ro', program: null, bcpi: 5 },
  { judet: 'Bistrița-Năsăud', slug: 'bistrita-nasaud', code: 'bn', office: 'OCPI Bistrița-Năsăud', resedinta: 'Bistrița', address: 'Str. Nicolae Titulescu nr. 50A, Bistrița, 420044', phone: '0263 214267', email: 'bn@ancpi.ro', program: null, bcpi: 3 },
  { judet: 'Botoșani', slug: 'botosani', code: 'bt', office: 'OCPI Botoșani', resedinta: 'Botoșani', address: 'Piața Revoluției nr. 9, Botoșani, 710236', phone: '0231 582111', email: 'bt@ancpi.ro', program: null, bcpi: 4 },
  { judet: 'Brașov', slug: 'brasov', code: 'bv', office: 'OCPI Brașov', resedinta: 'Brașov', address: 'Str. Zizinului nr. 46A, Brașov', phone: '0368 139959', email: 'bv@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00', eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:00–13:30' }, bcpi: 3 },
  { judet: 'Brăila', slug: 'braila', code: 'br', office: 'OCPI Brăila', resedinta: 'Brăila', address: 'Strada Justiției nr. 1, Brăila, 810017', phone: '0239 627207', email: 'br@ancpi.ro', program: null, bcpi: 3 },
  { judet: 'Buzău', slug: 'buzau', code: 'bz', office: 'OCPI Buzău', resedinta: 'Buzău', address: 'Calea Eroilor nr. 10, Buzău, 120426', phone: '0238 711036', email: 'bz@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00', eliberare: 'Luni–Joi 10:30–15:30, Vineri 9:30–13:30' }, bcpi: 3 },
  { judet: 'Călărași', slug: 'calarasi', code: 'cl', office: 'OCPI Călărași', resedinta: 'Călărași', address: 'Str. Prelungirea București nr. 26, bl. M21, Călărași, 910125', phone: '0242 333698', email: 'cl@ancpi.ro', program: { depunere: 'Luni–Vineri 8:30–14:00', eliberare: 'Luni–Vineri 11:00–15:30' }, bcpi: 2 },
  { judet: 'Caraș-Severin', slug: 'caras-severin', code: 'cs', office: 'OCPI Caraș-Severin', resedinta: 'Reșița', address: 'Str. Traian Lalescu nr. 11, Reșița, 320050', phone: '0255 211415', email: 'cs@ancpi.ro', program: PROG_STD, bcpi: 3 },
  { judet: 'Cluj', slug: 'cluj', code: 'cj', office: 'OCPI Cluj', resedinta: 'Cluj-Napoca', address: 'Str. Alexandru Vaida Voevod nr. 53, Cluj-Napoca, 400436', phone: '0264 431666', email: 'cj@ancpi.ro', program: { depunere: 'Luni–Joi 8:00–16:30, Vineri 8:00–14:00' }, bcpi: 5 },
  { judet: 'Constanța', slug: 'constanta', code: 'ct', office: 'OCPI Constanța', resedinta: 'Constanța', address: 'Str. Mihai Viteazu nr. 2B, Constanța, 900682', phone: '0241 488625', email: 'ct@ancpi.ro', program: PROG_STD, bcpi: 4 },
  { judet: 'Covasna', slug: 'covasna', code: 'cv', office: 'OCPI Covasna', resedinta: 'Sfântu Gheorghe', address: 'Str. 1 Decembrie 1918 nr. 3, Sfântu Gheorghe, 520008', phone: '0267 314578', email: 'cv@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 9:30–13:00', eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:30–13:30' }, bcpi: 3 },
  { judet: 'Dâmbovița', slug: 'dambovita', code: 'db', office: 'OCPI Dâmbovița', resedinta: 'Târgoviște', address: 'Bd. Ion Constantin Brătianu nr. 27, Târgoviște, 130530', phone: '0245 613956', email: 'db@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 9:30–13:00', eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:30–13:30' }, bcpi: 5 },
  { judet: 'Dolj', slug: 'dolj', code: 'dj', office: 'OCPI Dolj', resedinta: 'Craiova', address: 'Str. C.S. Nicolăescu-Plopșor nr. 4, Craiova, 200733', phone: '0251 413129', email: 'dj@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00', eliberare: 'Luni–Joi 11:30–16:00, Vineri 8:30–14:00' }, bcpi: null },
  { judet: 'Galați', slug: 'galati', code: 'gl', office: 'OCPI Galați', resedinta: 'Galați', address: 'Str. Domnească nr. 244, Galați', phone: '0236 311774', email: 'gl@ancpi.ro', program: PROG_STD, bcpi: 3 },
  { judet: 'Giurgiu', slug: 'giurgiu', code: 'gr', office: 'OCPI Giurgiu', resedinta: 'Giurgiu', address: 'Bd. 1907 nr. 1, scara B, Giurgiu, 080316', phone: '0246 216444', email: 'gr@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: null },
  { judet: 'Gorj', slug: 'gorj', code: 'gj', office: 'OCPI Gorj', resedinta: 'Târgu Jiu', address: 'Str. 8 Martie nr. 3A, Târgu-Jiu, 210280', phone: '0253 217188', email: 'gj@ancpi.ro', program: null, bcpi: null },
  { judet: 'Harghita', slug: 'harghita', code: 'hr', office: 'OCPI Harghita', resedinta: 'Miercurea Ciuc', address: 'Str. Kossuth Lajos nr. 2, Miercurea-Ciuc, 530221', phone: '0266 371018', email: 'hr@ancpi.ro', program: null, bcpi: 4 },
  { judet: 'Hunedoara', slug: 'hunedoara', code: 'hd', office: 'OCPI Hunedoara', resedinta: 'Deva', address: 'Calea Zarandului nr. 106, Deva', phone: '0254 214165', email: 'hd@ancpi.ro', program: { depunere: 'Luni–Joi 8:00–16:30, Vineri 8:00–14:00' }, bcpi: null },
  { judet: 'Ialomița', slug: 'ialomita', code: 'il', office: 'OCPI Ialomița', resedinta: 'Slobozia', address: 'Str. Gării nr. 3, Slobozia, 920003', phone: '0243 232299', email: 'il@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 9:30–13:00' }, bcpi: null },
  { judet: 'Iași', slug: 'iasi', code: 'is', office: 'OCPI Iași', resedinta: 'Iași', address: 'Str. Costache Negri nr. 48, Iași, 700071', phone: '0232 316797', email: 'is@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: 4 },
  { judet: 'Ilfov', slug: 'ilfov', code: 'if', office: 'OCPI Ilfov', resedinta: 'București', address: 'Șos. Pavel D. Kiseleff nr. 34, sector 1, București, 011347', phone: '021 224 6085', email: 'if@ancpi.ro', program: null, bcpi: null },
  { judet: 'Maramureș', slug: 'maramures', code: 'mm', office: 'OCPI Maramureș', resedinta: 'Baia Mare', address: 'Str. Cosmonauților nr. 3, Baia Mare, 430053', phone: '0262 221587', email: 'mm@ancpi.ro', program: null, bcpi: 4 },
  { judet: 'Mehedinți', slug: 'mehedinti', code: 'mh', office: 'OCPI Mehedinți', resedinta: 'Drobeta-Turnu Severin', address: 'Str. Șerpetina Roșiori nr. 1A, Drobeta-Turnu Severin, 220235', phone: '0252 316874', email: 'mh@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: 3 },
  { judet: 'Mureș', slug: 'mures', code: 'ms', office: 'OCPI Mureș', resedinta: 'Târgu Mureș', address: 'Str. Căprioarei nr. 2, Târgu Mureș, 540314', phone: '0265 211338', email: 'ms@ancpi.ro', program: { depunere: 'Luni–Joi 8:00–16:30, Vineri 8:00–14:00' }, bcpi: 5 },
  { judet: 'Neamț', slug: 'neamt', code: 'nt', office: 'OCPI Neamț', resedinta: 'Piatra Neamț', address: 'Str. Mihai Eminescu nr. 26B, Piatra Neamț, 610029', phone: '0233 217142', email: 'nt@ancpi.ro', program: null, bcpi: 4 },
  { judet: 'Olt', slug: 'olt', code: 'ot', office: 'OCPI Olt', resedinta: 'Slatina', address: 'Str. Nicolae Bălcescu nr. 2, Slatina, 230092', phone: '0249 437930', email: 'ot@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: 2 },
  { judet: 'Prahova', slug: 'prahova', code: 'ph', office: 'OCPI Prahova', resedinta: 'Ploiești', address: 'Str. Unirii nr. 2, Ploiești, 100043', phone: '0244 519569', email: 'ph@ancpi.ro', program: null, bcpi: null },
  { judet: 'Sălaj', slug: 'salaj', code: 'sj', office: 'OCPI Sălaj', resedinta: 'Zalău', address: 'Piața Iuliu Maniu nr. 2, Zalău, 450018', phone: '0260 618322', email: 'sj@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: null },
  { judet: 'Satu Mare', slug: 'satu-mare', code: 'sm', office: 'OCPI Satu Mare', resedinta: 'Satu Mare', address: 'Str. Martirilor Deportați nr. 52, Satu Mare, 440025', phone: '0261 714262', email: 'sm@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: 3 },
  { judet: 'Sibiu', slug: 'sibiu', code: 'sb', office: 'OCPI Sibiu', resedinta: 'Sibiu', address: 'Calea Dumbravii nr. 34, Sibiu, 550324', phone: '0269 217477', email: 'sb@ancpi.ro', program: PROG_STD, bcpi: 5 },
  { judet: 'Suceava', slug: 'suceava', code: 'sv', office: 'OCPI Suceava', resedinta: 'Suceava', address: 'B-dul 1 Decembrie nr. 3, Suceava, 720262', phone: '0230 523317', email: 'sv@ancpi.ro', program: PROG_STD, bcpi: 5 },
  { judet: 'Teleorman', slug: 'teleorman', code: 'tr', office: 'OCPI Teleorman', resedinta: 'Alexandria', address: 'Str. Confederației nr. 2, Alexandria', phone: '0247 312210', email: 'tr@ancpi.ro', program: null, bcpi: 3 },
  { judet: 'Timiș', slug: 'timis', code: 'tm', office: 'OCPI Timiș', resedinta: 'Timișoara', address: 'Strada Armoniei nr. 1C, Timișoara, 300291', phone: '0256 201089', email: 'tm@ancpi.ro', program: null, bcpi: 5 },
  { judet: 'Tulcea', slug: 'tulcea', code: 'tl', office: 'OCPI Tulcea', resedinta: 'Tulcea', address: 'Str. Corneliu Gavrilov nr. 152, Tulcea, 820119', phone: '0240 511486', email: 'tl@ancpi.ro', program: null, bcpi: null },
  { judet: 'Vaslui', slug: 'vaslui', code: 'vs', office: 'OCPI Vaslui', resedinta: 'Vaslui', address: 'Str. Eternității nr. 1, Vaslui, 730112', phone: '0235 311731', email: 'vs@ancpi.ro', program: null, bcpi: 3 },
  { judet: 'Vâlcea', slug: 'valcea', code: 'vl', office: 'OCPI Vâlcea', resedinta: 'Râmnicu Vâlcea', address: 'Str. General Praporgescu nr. 22, Râmnicu Vâlcea', phone: '0250 744150', email: 'vl@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 8:30–13:00' }, bcpi: null },
  { judet: 'Vrancea', slug: 'vrancea', code: 'vn', office: 'OCPI Vrancea', resedinta: 'Focșani', address: 'Str. Cuza Vodă nr. 69, Focșani, 620034', phone: '0237 228754', email: 'vn@ancpi.ro', program: { depunere: 'Luni–Joi 8:30–14:00, Vineri 9:30–13:00', eliberare: 'Luni–Joi 11:00–16:00, Vineri 9:30–13:30' }, bcpi: 3 },
  { judet: 'București', slug: 'bucuresti', code: 'b', office: 'OCPI București', resedinta: 'București', address: 'Bulevardul Expoziției nr. 1A, sector 1, București, 012101', phone: '0374 488100', email: 'registratura.b@ancpi.ro', program: PROG_STD, bcpi: null },
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
