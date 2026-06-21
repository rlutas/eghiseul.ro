/**
 * Registrul de orașe pentru paginile de cazier judiciar pe locație.
 *
 * Datele instituționale sunt REALE și verificate pe subdomeniile IPJ județene
 * (politiaromana.ro), iunie 2026. NU adăuga un oraș fără adresă reală —
 * `assertAllCities` (rulat la încărcarea modulului) blochează build-ul altfel.
 * Vezi docs/plans/2026-06-19-location-seo-engine.md.
 *
 * EXCLUS intenționat: București — nu are ghișeu unic de cazier (se eliberează
 * prin cele 26 de secții de poliție), deci nu poate fi modelat ca un singur
 * birou; va primi o pagină dedicată cu alt model.
 *
 * Câmpuri lăsate `undefined` = neverificate pe sursa oficială (ex. programul
 * IPJ Cluj era ambiguu pe pagina oficială → omis până la confirmare).
 *
 * Rollout în batch-uri: pilot orașe mari întâi, validezi indexarea în GSC
 * (>60%), apoi scalezi. NU bulk.
 */
import type { CityData } from './types';
import { assertAllCities } from './quality';

const RAW_CITIES: CityData[] = [
  {
    slug: 'cluj-napoca',
    name: 'Cluj-Napoca',
    judet: 'Cluj',
    judetAbbr: 'cj',
    population: '286.000 locuitori',
    localAnchors: ['Universitatea Babeș-Bolyai', 'companiile IT (Bosch, Endava, NTT Data)', 'Banca Transilvania'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Cluj',
      address: 'Str. Decebal nr. 26, Cluj-Napoca, jud. Cluj',
      phone: '0264 505 248',
      website: 'https://cj.politiaromana.ro/ro/obtinere-certificatului-de-cazier-judiciar-persoane-fizice',
      // Programul cu publicul nu era publicat clar pe pagina oficială → omis.
    },
    localContext:
      'Cluj-Napoca este al doilea oraș al țării și principalul centru universitar și IT din ' +
      'Transilvania. Cazierul judiciar este cerut frecvent aici pentru angajări în companiile de ' +
      'tehnologie, pentru concursuri în mediul universitar și pentru dosare de adopție sau ' +
      'asistență socială.',
    localFaq: [
      {
        q: 'Unde se eliberează cazierul judiciar în Cluj-Napoca?',
        a: 'La Serviciul Cazier Judiciar din cadrul IPJ Cluj, pe Str. Decebal nr. 26. Alternativ, prin eGhișeul.ro depui cererea online și primești documentul prin curier, fără să te deplasezi la ghișeu.',
      },
      {
        q: 'Pot obține cazierul din Cluj dacă lucrez în străinătate?',
        a: 'Da. Depunem cererea prin împuternicire la IPJ Cluj în numele tău și îți trimitem certificatul prin curier oriunde te afli — util pentru clujenii din diaspora care nu se pot întoarce pentru un singur document.',
      },
    ],
    nearbyCitySlugs: ['timisoara', 'brasov'],
  },
  {
    slug: 'timisoara',
    name: 'Timișoara',
    judet: 'Timiș',
    judetAbbr: 'tm',
    population: '250.000 locuitori',
    localAnchors: ['Continental', 'Universitatea de Vest', 'Universitatea Politehnica Timișoara'],
    ipj: {
      name: 'Serviciul Cazier Judiciar și Evidențe Operative — IPJ Timiș',
      address: 'Bulevardul Take Ionescu nr. 44-46, Timișoara, jud. Timiș (parter, sediul IPJ Timiș)',
      website: 'https://tm.politiaromana.ro/ro/utile/documente-eliberari-acte/cazier-judiciar',
      schedule: {
        Luni: '09:00-18:00',
        Marți: '08:30-15:30',
        Miercuri: '09:00-18:00',
        Joi: '08:30-15:30',
        Vineri: '08:30-14:00',
      },
    },
    localContext:
      'Timișoara este cel mai mare oraș din vestul României și un important pol industrial și ' +
      'universitar. Apropierea de granița cu Ungaria și Serbia face ca cererea de cazier judiciar ' +
      'pentru angajări în străinătate să fie ridicată în rândul timișorenilor.',
    localFaq: [
      {
        q: 'Care este programul ghișeului de cazier judiciar în Timișoara?',
        a: 'Ghișeul de la sediul IPJ Timiș (B-dul Take Ionescu 44-46) are program luni și miercuri 09:00-18:00, marți și joi 08:30-15:30, vineri 08:30-14:00. Prin eGhișeul.ro eviți programul și coada — comanzi online 24/7.',
      },
      {
        q: 'Cât durează eliberarea cazierului în Timișoara?',
        a: 'La ghișeu se eliberează de regulă pe loc, în limita programului. Prin eGhișeul.ro depunem cererea în numele tău și primești documentul prin curier în 2-4 zile lucrătoare, fără deplasare.',
      },
    ],
    nearbyCitySlugs: ['cluj-napoca'],
  },
  {
    slug: 'iasi',
    name: 'Iași',
    judet: 'Iași',
    judetAbbr: 'is',
    population: '270.000 locuitori',
    localAnchors: ['Universitatea „Alexandru Ioan Cuza"', 'UMF „Grigore T. Popa"', 'companiile de IT și BPO'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Iași',
      address: 'Str. Prof. Mihai Costăchescu nr. 2, Iași, jud. Iași',
      website:
        'https://is.politiaromana.ro/ro/utile/documente-eliberari-acte/obtinerea-certificatului-de-cazier-judiciar-si-a-certificatului-de-integritatea-comportamentala',
      schedule: {
        Luni: '08:30-12:30 / 13:30-15:30',
        Marți: '10:30-13:30 / 15:00-18:00',
        Miercuri: '08:30-12:30 / 13:30-15:30',
        Joi: '08:30-12:30 / 13:30-15:30',
        Vineri: '08:30-13:00',
      },
    },
    localContext:
      'Iași este cel mai mare oraș din Moldova și un puternic centru universitar și medical. ' +
      'Numărul mare de studenți și de ieșeni plecați la muncă în străinătate menține o cerere ' +
      'constantă de cazier judiciar pentru dosare de angajare, studii și vize.',
    localFaq: [
      {
        q: 'Unde se obține cazierul judiciar în Iași?',
        a: 'La Serviciul Cazier Judiciar din cadrul IPJ Iași, pe Str. Prof. Mihai Costăchescu nr. 2. Programul cu publicul este luni-joi dimineața și după-amiaza, vineri până la 13:00. Prin eGhișeul.ro comanzi online, fără să te deplasezi.',
      },
      {
        q: 'Pot cere cazierul în Iași pentru altcineva din familie?',
        a: 'Da, pe baza unei împuterniciri. Prin eGhișeul.ro semnezi împuternicirea online și noi depunem cererea la IPJ Iași, util mai ales pentru rudele plecate din localitate.',
      },
    ],
    nearbyCitySlugs: ['constanta'],
  },
  {
    slug: 'constanta',
    name: 'Constanța',
    judet: 'Constanța',
    judetAbbr: 'ct',
    population: '264.000 locuitori',
    localAnchors: ['Portul Constanța', 'companiile maritime și de shipping', 'sectorul turistic de pe litoral'],
    ipj: {
      name: 'Serviciul Cazier Judiciar și Evidențe Operative — IPJ Constanța',
      address: 'Str. Renașterii nr. 15, Municipiul Constanța, jud. Constanța',
      phone: '0241 502 624',
      website: 'https://ct.politiaromana.ro/ro/utile/documente-eliberari-acte/cazier-judiciar',
      schedule: {
        Luni: '09:00-14:00',
        Marți: '09:00-14:00',
        Miercuri: '09:00-14:00 / 16:00-18:00',
        Joi: '09:00-14:00',
        Vineri: '09:00-12:30',
      },
    },
    localContext:
      'Constanța, cel mai mare port la Marea Neagră, are o economie legată de transport naval, ' +
      'turism și industrie. Cazierul judiciar este cerut frecvent aici pentru angajări în domeniul ' +
      'maritim (la bordul navelor) și în turism, unde verificarea antecedentelor este uzuală.',
    localFaq: [
      {
        q: 'Care este adresa ghișeului de cazier judiciar în Constanța?',
        a: 'Ghișeul s-a mutat la Str. Renașterii nr. 15 (noua adresă a IPJ Constanța). Programul este luni-joi 09:00-14:00 (miercuri și 16:00-18:00), vineri 09:00-12:30. Prin eGhișeul.ro comanzi online și eviți drumul.',
      },
      {
        q: 'Am nevoie de cazier pentru îmbarcare pe navă — îl pot obține online din Constanța?',
        a: 'Da. Prin eGhișeul.ro depunem cererea la IPJ Constanța în numele tău și primești certificatul prin curier — practic pentru navigatorii care au programe încărcate înainte de îmbarcare.',
      },
    ],
    nearbyCitySlugs: ['iasi'],
  },
  {
    slug: 'brasov',
    name: 'Brașov',
    judet: 'Brașov',
    judetAbbr: 'bv',
    population: '237.000 locuitori',
    localAnchors: ['fabricile auto și industriale', 'Universitatea Transilvania', 'stațiunile turistice din zonă'],
    ipj: {
      name: 'Serviciul Cazier Judiciar — IPJ Brașov',
      address: 'Str. Nicolae Titulescu nr. 28, Brașov, jud. Brașov (sediul IPJ Brașov)',
      phone: '0268 319 398',
      website: 'https://bv.politiaromana.ro/ro/informatii-publice/serviciul-cazier-judiciar',
      schedule: {
        Luni: '08:30-11:30 / 13:00-15:00',
        Marți: '08:30-11:30 / 13:00-17:00',
        Miercuri: '08:30-11:30 / 13:00-15:00',
        Joi: '08:30-11:30 / 13:00-16:00',
        Vineri: '08:30-13:00',
      },
    },
    localContext:
      'Brașov este un important centru turistic și industrial din centrul țării, cu fabrici auto și ' +
      'firme de servicii. Cazierul judiciar este cerut frecvent brașovenilor pentru angajări în ' +
      'turism, pază și industrie, dar și pentru lucrul sezonier în stațiunile din zonă.',
    localFaq: [
      {
        q: 'Unde și când se eliberează cazierul judiciar în Brașov?',
        a: 'La Serviciul Cazier Judiciar din sediul IPJ Brașov, Str. Nicolae Titulescu nr. 28, cu program luni-vineri (dimineața și după-amiaza, vineri până la 13:00). Există ghișee și în Făgăraș, Codlea, Rupea și Râșnov. Prin eGhișeul.ro comanzi online, fără drum.',
      },
      {
        q: 'Pot obține cazierul în Brașov fără să stau la coadă?',
        a: 'Da. Prin eGhișeul.ro completezi cererea online în câteva minute, noi o depunem la IPJ Brașov pe bază de împuternicire, iar tu primești documentul prin curier în 2-4 zile lucrătoare.',
      },
    ],
    nearbyCitySlugs: ['cluj-napoca'],
  },
  {
    slug: 'craiova',
    name: 'Craiova',
    judet: 'Dolj',
    judetAbbr: 'dj',
    population: '234.000 locuitori',
    localAnchors: ['uzina Ford', 'Universitatea din Craiova', 'Spitalul Județean de Urgență'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Dolj',
      address: 'Str. Vulturi nr. 19, Craiova, jud. Dolj',
      website: 'https://dj.politiaromana.ro/ro/utile/cazier-judiciar',
      schedule: {
        Luni: '08:30-10:30 / 13:00-16:00',
        Marți: '08:30-10:30 / 13:00-16:00',
        Miercuri: '13:00-18:00',
        Joi: '08:30-10:30 / 13:00-16:00',
        Vineri: '08:30-13:00',
      },
    },
    localContext:
      'Craiova este reședința județului Dolj și centrul economic al Olteniei, cu uzina auto Ford și ' +
      'Universitatea din Craiova. Cazierul judiciar este cerut frecvent aici pentru angajări la ' +
      'platforma auto și la furnizorii ei, pentru personal medical și didactic și pentru dosare de studii.',
    localFaq: [
      {
        q: 'Unde se eliberează cazierul judiciar în Craiova?',
        a: 'La Serviciul Cazier Judiciar din cadrul IPJ Dolj, pe Str. Vulturi nr. 19. Alternativ, prin eGhișeul.ro depui cererea online și primești documentul prin curier, fără deplasare.',
      },
      {
        q: 'Cât durează cazierul judiciar obținut online din Craiova?',
        a: 'Prin eGhișeul.ro, în mod standard 2-4 zile lucrătoare. Depunem cererea la IPJ Dolj pe bază de împuternicire și îți trimitem documentul prin curier sau pe email.',
      },
    ],
    nearbyCitySlugs: ['sibiu', 'timisoara'],
  },
  {
    slug: 'sibiu',
    name: 'Sibiu',
    judet: 'Sibiu',
    judetAbbr: 'sb',
    population: '147.000 locuitori',
    localAnchors: ['Continental Automotive', 'Universitatea „Lucian Blaga"', 'Marquardt'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Sibiu',
      address: 'Str. Revoluției nr. 4-6, Sibiu, jud. Sibiu',
      website: 'https://sb.politiaromana.ro/ro/utile/documente-eliberari-acte/cazier-judiciar',
      schedule: {
        Luni: '08:30-13:30',
        Marți: '08:30-13:30',
        Miercuri: '13:00-18:00',
        Joi: '08:30-13:30',
        Vineri: '08:30-13:30',
      },
    },
    localContext:
      'Sibiu este un important centru industrial și turistic din Transilvania, cu un cluster auto ' +
      'puternic și Universitatea „Lucian Blaga". Economia de producție și sectorul turistic fac ca ' +
      'angajatorii din Sibiu să ceară frecvent cazierul judiciar la angajare.',
    localFaq: [
      {
        q: 'Unde se obține cazierul judiciar în Sibiu?',
        a: 'La Serviciul Cazier Judiciar din IPJ Sibiu, pe Str. Revoluției nr. 4-6. Alternativ, comanzi online prin eGhișeul.ro și primești documentul prin curier.',
      },
      {
        q: 'Pot obține cazierul din Sibiu dacă sunt plecat în străinătate?',
        a: 'Da. Depunem cererea prin împuternicire la IPJ Sibiu în numele tău și îți trimitem certificatul oriunde te afli — util pentru sibienii din diaspora.',
      },
    ],
    nearbyCitySlugs: ['brasov', 'cluj-napoca'],
  },
  {
    slug: 'oradea',
    name: 'Oradea',
    judet: 'Bihor',
    judetAbbr: 'bh',
    population: '183.000 locuitori',
    localAnchors: ['Universitatea din Oradea', 'parcurile industriale (Eurobusiness)', 'Spitalul Județean Oradea'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Bihor',
      address: 'Str. Parcul Traian nr. 18, Oradea, jud. Bihor (sediu temporar — ghișeul e în renovare; verifică înainte de deplasare)',
      phone: '0259 403 035',
      website: 'https://bh.politiaromana.ro/ro/utile/program-cu-publicul-acte-necesare/serviciul-cazier-judiciar',
      schedule: {
        Luni: '08:30-15:30',
        Marți: '08:30-15:30',
        Miercuri: '08:30-15:30',
        Joi: '08:30-17:00',
        Vineri: '08:30-13:30',
      },
    },
    localContext:
      'Oradea, reședința județului Bihor la granița cu Ungaria, este unul dintre cele mai dinamice ' +
      'orașe, cu sectoare IT/BPO și industriale. Universitatea din Oradea și parcurile industriale, ' +
      'plus piața de muncă transfrontalieră, mențin o cerere constantă de cazier judiciar.',
    localFaq: [
      {
        q: 'Unde se eliberează cazierul judiciar în Oradea?',
        a: 'Ghișeul funcționează temporar la sediul IPJ Bihor, Str. Parcul Traian nr. 18 (clădirea e în renovare) — verifică înainte de deplasare. Prin eGhișeul.ro eviți complet drumul: comanzi online.',
      },
      {
        q: 'Pot obține cazierul din Oradea pentru a lucra în Ungaria sau UE?',
        a: 'Da. Depunem cererea la IPJ Bihor în numele tău și, la nevoie, ne ocupăm de apostilă și traducere — util pentru orădenii care lucrează peste graniță.',
      },
    ],
    nearbyCitySlugs: ['arad', 'cluj-napoca'],
  },
  {
    slug: 'arad',
    name: 'Arad',
    judet: 'Arad',
    judetAbbr: 'ar',
    population: '145.000 locuitori',
    localAnchors: ['Universitatea „Aurel Vlaicu"', 'Leoni Wiring Systems', 'parcurile industriale Arad'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Arad',
      address: 'Str. Vârful cu Dor nr. 17-21, Arad, jud. Arad',
      phone: '0257 207 118',
      website: 'https://ar.politiaromana.ro/ro/utile/documente-eliberari-acte/cazier-judiciar',
      schedule: {
        Luni: '08:30-12:00 / 13:30-15:45',
        Marți: '08:30-12:00 / 13:30-15:45',
        Miercuri: '08:30-12:00 / 13:30-18:00',
        Joi: '08:30-12:00 / 13:30-15:45',
        Vineri: '08:30-12:00 / 13:00-14:00',
      },
    },
    localContext:
      'Arad este un oraș de graniță din vestul țării, cu o bază industrială orientată pe export ' +
      '(auto, componente electrice, alimentar) și legături strânse cu Timișoara și Ungaria. ' +
      'Angajatorii din parcurile industriale și Universitatea „Aurel Vlaicu" cer frecvent cazierul judiciar.',
    localFaq: [
      {
        q: 'Unde și când se eliberează cazierul judiciar în Arad?',
        a: 'La Serviciul Cazier Judiciar din IPJ Arad, pe Str. Vârful cu Dor nr. 17-21, cu program luni-vineri. Prin eGhișeul.ro comanzi online, fără coadă.',
      },
      {
        q: 'Pot cere cazierul în Arad fără să mă deplasez?',
        a: 'Da. Completezi cererea online, noi o depunem la IPJ Arad pe bază de împuternicire, iar tu primești documentul prin curier în 2-4 zile lucrătoare.',
      },
    ],
    nearbyCitySlugs: ['oradea', 'timisoara'],
  },
  {
    slug: 'bucuresti',
    name: 'București',
    judet: 'București',
    judetAbbr: 'b',
    population: '1,7 milioane locuitori',
    localAnchors: ['multinaționalele și sectorul corporate', 'firmele de pază și transport', 'spitalele și instituțiile publice'],
    officeNote:
      'În București, cazierul judiciar nu se eliberează la un singur ghișeu, ci la oricare dintre ' +
      'secțiile de poliție ale Capitalei (Secțiile 1–26) sau electronic. Serviciul de specialitate ' +
      'este coordonat de Direcția Generală de Poliție a Municipiului București (DGPMB). De aceea, cel ' +
      'mai simplu este să comanzi online: depunem cererea în numele tău, fără să fie nevoie să alegi ' +
      'secția sau să te deplasezi.',
    localContext:
      'București este capitala și cel mai mare oraș al României, cu cea mai mare concentrare de ' +
      'angajatori, instituții publice și multinaționale. Cazierul judiciar este cel mai cerut document ' +
      'aici — pentru angajări (corporate, pază, transport, sistem bancar), concursuri, vize și dosare administrative.',
    localFaq: [
      {
        q: 'Unde se eliberează cazierul judiciar în București?',
        a: 'Nu există un ghișeu unic — cererea se poate depune la oricare dintre secțiile de poliție din București (1–26) sau electronic. Prin eGhișeul.ro nu mai alegi secția: depunem cererea în numele tău și primești documentul prin curier.',
      },
      {
        q: 'Pot obține cazierul în București fără să merg la secția de poliție?',
        a: 'Da. Completezi datele online, semnezi împuternicirea în aplicație, iar noi depunem cererea la autoritatea competentă din București. Primești cazierul prin curier sau pe email, în 2-4 zile lucrătoare.',
      },
    ],
    nearbyCitySlugs: ['constanta', 'brasov'],
  },
  {
    slug: 'galati',
    name: 'Galați',
    judet: 'Galați',
    judetAbbr: 'gl',
    population: '217.000 locuitori',
    localAnchors: ['Liberty Galați (combinatul siderurgic)', 'Universitatea „Dunărea de Jos"', 'Damen Shipyards Galați'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Galați',
      address: 'Str. Brăilei nr. 200, Galați, jud. Galați',
      phone: '0236 407 000',
      website: 'https://gl.politiaromana.ro/ro/utile/documente-eliber-ri-acte/obtinerea-certificatului-de-cazier-judiciar-si-a-certificatului-de-integritate-comportamentala',
      schedule: { Luni: '09:00-13:00', Marți: '09:00-13:00', Miercuri: '14:00-18:00', Joi: '09:00-13:00', Vineri: '09:00-13:00' },
    },
    localContext:
      'Galați este reședința județului Galați și unul dintre cele mai mari centre industriale din ' +
      'sud-estul României, dominat de combinatul siderurgic Liberty Galați și de portul de la Dunăre. ' +
      'Locuitorii din Galați au frecvent nevoie de cazier judiciar pentru angajări în industria grea, ' +
      'în șantierul naval și în transporturi.',
    localFaq: [
      { q: 'Unde se eliberează cazierul judiciar în Galați?', a: 'La Serviciul Cazier Judiciar din cadrul IPJ Galați, pe Str. Brăilei nr. 200. Alternativ, prin eGhișeul.ro comanzi online și primești documentul prin curier.' },
      { q: 'Cât durează cazierul obținut online din Galați?', a: 'Prin eGhișeul.ro, în mod standard 2-4 zile lucrătoare. Depunem cererea la IPJ Galați pe bază de împuternicire.' },
    ],
    nearbyCitySlugs: ['buzau', 'constanta'],
  },
  {
    slug: 'ploiesti',
    name: 'Ploiești',
    judet: 'Prahova',
    judetAbbr: 'ph',
    population: '180.000 locuitori',
    localAnchors: ['OMV Petrom (rafinăria Petrobrazi)', 'Universitatea Petrol-Gaze', 'Rafinăria Vega'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Prahova',
      address: 'Str. Vasile Lupu nr. 60, Ploiești, jud. Prahova',
      phone: '0244 302 245',
      website: 'https://ph.politiaromana.ro/ro/utile/documente-eliberari-acte/obtinerea-certificatului-de-cazier-judiciar',
      schedule: { Luni: '08:30-12:00 / 13:30-15:00', Marți: '08:30-12:00 / 13:30-15:00', Miercuri: '09:00-12:00 / 14:00-18:00', Joi: '08:30-12:00 / 13:30-15:00', Vineri: '08:30-12:30' },
    },
    localContext:
      'Ploiești este reședința județului Prahova și capitala istorică a industriei petroliere din ' +
      'România, cu rafinării majore și un puternic sector energetic și logistic. Mulți ploieșteni ' +
      'solicită cazier judiciar pentru angajări în rafinării, comerț și transporturi.',
    localFaq: [
      { q: 'Unde se eliberează cazierul judiciar în Ploiești?', a: 'La Serviciul Cazier Judiciar din IPJ Prahova, pe Str. Vasile Lupu nr. 60. Sau online, prin eGhișeul.ro, fără deplasare.' },
      { q: 'Pot obține cazierul din Ploiești fără să stau la coadă?', a: 'Da. Completezi cererea online, noi o depunem la IPJ Prahova și primești documentul prin curier în 2-4 zile.' },
    ],
    nearbyCitySlugs: ['bucuresti', 'buzau'],
  },
  {
    slug: 'bacau',
    name: 'Bacău',
    judet: 'Bacău',
    judetAbbr: 'bc',
    population: '144.000 locuitori',
    localAnchors: ['Aerostar S.A.', 'Universitatea „Vasile Alecsandri"', 'Spitalul Județean Bacău'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Bacău',
      address: 'Str. Alexei Tolstoi nr. 2-4, Bacău, jud. Bacău',
      phone: '0234 202 090',
      website: 'https://bc.politiaromana.ro/ro/utile/eliberari-cazier-judiciar',
      schedule: { Luni: '08:30-11:30 / 12:30-15:30', Marți: '08:30-11:30 / 12:30-15:30', Miercuri: '09:00-11:30 / 12:30-17:00', Joi: '08:30-11:30 / 12:30-15:30', Vineri: '08:30-11:00' },
    },
    localContext:
      'Bacău este reședința județului Bacău, unul dintre cele mai populate orașe din Moldova, cu o ' +
      'economie bazată pe industria aeronautică (Aerostar), prelucrarea lemnului și servicii. ' +
      'Băcăuanii au nevoie frecvent de cazier judiciar pentru angajare și pentru dosare de muncă în străinătate.',
    localFaq: [
      { q: 'Unde se eliberează cazierul judiciar în Bacău?', a: 'La Serviciul Cazier Judiciar din IPJ Bacău, pe Str. Alexei Tolstoi nr. 2-4. Alternativ, comanzi online prin eGhișeul.ro.' },
      { q: 'Pot cere cazierul în Bacău dacă lucrez în străinătate?', a: 'Da. Depunem cererea prin împuternicire la IPJ Bacău și îți trimitem certificatul oriunde te afli.' },
    ],
    nearbyCitySlugs: ['iasi', 'suceava'],
  },
  {
    slug: 'pitesti',
    name: 'Pitești',
    judet: 'Argeș',
    judetAbbr: 'ag',
    population: '155.000 locuitori',
    localAnchors: ['Automobile Dacia (Mioveni)', 'Centrul Universitar Pitești', 'Spitalul Județean Argeș'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Argeș',
      address: 'Str. Victoriei nr. 45, Pitești, jud. Argeș (sediul nou IPJ Argeș)',
      website: 'https://ag.politiaromana.ro/ro/utile/documente-necesare-eliberarii-de-acte/cazier-judiciar-persoane-fizice-certificate-de-integritate',
      schedule: { Luni: '08:00-12:00 / 13:00-15:00', Marți: '08:00-12:00 / 13:00-15:00', Miercuri: '09:00-12:00 / 15:00-17:30', Joi: '08:00-12:00 / 13:00-15:00', Vineri: '08:00-13:00' },
    },
    localContext:
      'Pitești este reședința județului Argeș și unul dintre cele mai importante centre industriale ' +
      'ale României, dominat de uzina auto Dacia de la Mioveni și de platforma petrochimică. Piteștenii ' +
      'au nevoie de cazier judiciar pentru angajarea în industria auto, pentru studii sau concursuri în administrație.',
    localFaq: [
      { q: 'Unde se eliberează cazierul judiciar în Pitești?', a: 'La Serviciul Cazier Judiciar din IPJ Argeș, la sediul nou de pe Str. Victoriei nr. 45. Sau online, prin eGhișeul.ro.' },
      { q: 'Am nevoie de cazier pentru angajare la Dacia — îl pot obține online?', a: 'Da. Prin eGhișeul.ro depunem cererea la IPJ Argeș în numele tău și primești documentul prin curier — practic pentru angajările din industria auto.' },
    ],
    nearbyCitySlugs: ['bucuresti', 'craiova'],
  },
  {
    slug: 'baia-mare',
    name: 'Baia Mare',
    judet: 'Maramureș',
    judetAbbr: 'mm',
    population: '108.000 locuitori',
    localAnchors: ['UTCN — Centrul Universitar Nord Baia Mare', 'Spitalul Județean „Dr. Constantin Opriș"', 'Consiliul Județean Maramureș'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Maramureș',
      address: 'Str. Vasile Alecsandri nr. 81, Baia Mare, jud. Maramureș',
      phone: '0262 207 282',
      website: 'https://mm.politiaromana.ro/ro/utile/cazier-judiciar',
      schedule: { Luni: '08:30-12:30', Marți: '08:30-12:30', Miercuri: '08:30-12:30', Joi: '08:30-12:30', Vineri: '08:30-13:00' },
    },
    localContext:
      'Baia Mare este reședința județului Maramureș, fost centru minier și metalurgic din nordul ' +
      'Transilvaniei, astăzi cu o economie axată pe industrie ușoară, prelucrarea lemnului și servicii. ' +
      'Băimărenii au frecvent nevoie de cazier judiciar pentru angajare și pentru dosare de muncă în străinătate.',
    localFaq: [
      { q: 'Unde se eliberează cazierul judiciar în Baia Mare?', a: 'La Serviciul Cazier Judiciar din IPJ Maramureș, pe Str. Vasile Alecsandri nr. 81. Sau online, prin eGhișeul.ro.' },
      { q: 'Pot obține cazierul din Baia Mare pentru muncă în străinătate?', a: 'Da. Depunem cererea la IPJ Maramureș și, la nevoie, ne ocupăm de apostilă și traducere — util pentru maramureșenii din diaspora.' },
    ],
    nearbyCitySlugs: ['cluj-napoca', 'oradea'],
  },
  {
    slug: 'suceava',
    name: 'Suceava',
    judet: 'Suceava',
    judetAbbr: 'sv',
    population: '84.000 locuitori',
    localAnchors: ['Universitatea „Ștefan cel Mare" (USV)', 'Spitalul Județean „Sfântul Ioan cel Nou"', 'Consiliul Județean Suceava'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Suceava',
      address: 'Bd. 1 Mai nr. 9, Suceava, jud. Suceava (cod 720224)',
      phone: '0230 203 255',
      website: 'https://sv.politiaromana.ro/ro/utile/documente-eliberate-de-poli-ie/certificat-de-cazier-judiciar',
      schedule: { Luni: '08:30-13:00', Marți: '08:30-13:00', Miercuri: '08:30-13:00', Joi: '08:30-13:00', Vineri: '08:30-13:00' },
    },
    localContext:
      'Suceava este reședința județului omonim, fosta capitală a Moldovei medievale, situată în nordul ' +
      'țării. Economia Sucevei se sprijină pe procesarea lemnului, industria alimentară, comerț și un ' +
      'mediu universitar activ; mulți suceveni solicită cazier judiciar pentru angajare și pentru dosare de lucru în străinătate.',
    localFaq: [
      { q: 'Unde se eliberează cazierul judiciar în Suceava?', a: 'La Serviciul Cazier Judiciar din IPJ Suceava, pe Bd. 1 Mai nr. 9. Program luni-vineri 08:30-13:00. Sau online, prin eGhișeul.ro.' },
      { q: 'Pot obține cazierul din Suceava fără să mă deplasez?', a: 'Da. Completezi cererea online, noi o depunem la IPJ Suceava și primești documentul prin curier în 2-4 zile.' },
    ],
    nearbyCitySlugs: ['iasi', 'bacau'],
  },
  {
    slug: 'targu-mures',
    name: 'Târgu Mureș',
    judet: 'Mureș',
    judetAbbr: 'ms',
    population: '116.000 locuitori',
    localAnchors: ['UMFST „George Emil Palade"', 'Spitalul Clinic Județean de Urgență Mureș', 'Azomureș'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Mureș',
      address: 'Str. Borsos Tamas nr. 16, Târgu Mureș, jud. Mureș',
      phone: '0265 202 546',
      website: 'https://ms.politiaromana.ro/ro/utile/documente-eliberari-acte/informatii-cazier-judiciar-si-certificate-de-integritate-comportamentala',
      schedule: { Luni: '08:30-12:00 / 13:00-15:30', Marți: '08:30-12:00 / 13:00-15:30', Miercuri: '08:30-12:00 / 13:00-15:30', Joi: '08:30-12:00 / 13:00-15:30', Vineri: '08:30-13:00' },
    },
    localContext:
      'Târgu Mureș este reședința județului Mureș și un important centru universitar și medical din ' +
      'centrul Transilvaniei, cu un pol medico-farmaceutic recunoscut național. Mulți locuitori au nevoie ' +
      'de cazier judiciar pentru angajare în sistemul sanitar, în învățământ sau în industria locală.',
    localFaq: [
      { q: 'Unde se eliberează cazierul judiciar în Târgu Mureș?', a: 'La Serviciul Cazier Judiciar din IPJ Mureș, pe Str. Borsos Tamas nr. 16. Sau online, prin eGhișeul.ro.' },
      { q: 'Pot cere cazierul în Târgu Mureș pentru angajare în sănătate?', a: 'Da. Prin eGhișeul.ro depunem cererea la IPJ Mureș și primești documentul prin curier — util pentru personalul medical.' },
    ],
    nearbyCitySlugs: ['cluj-napoca', 'brasov'],
  },
  {
    slug: 'buzau',
    name: 'Buzău',
    judet: 'Buzău',
    judetAbbr: 'bz',
    population: '115.000 locuitori',
    localAnchors: ['Ductil Steel / industria de sârmă Buzău', 'Spitalul Județean Buzău', 'Inspectoratul Școlar Județean Buzău'],
    ipj: {
      name: 'Serviciul Cazier Judiciar, Statistică și Evidențe Operative — IPJ Buzău',
      address: 'Str. Chiristigii nr. 8-10, Municipiul Buzău, jud. Buzău',
      phone: '0238 402 056',
      website: 'https://bz.politiaromana.ro/ro/utile/informatii-cazier',
      schedule: { Luni: '08:30-12:00 / 13:30-15:30', Marți: '08:30-12:00 / 13:30-15:30', Miercuri: '08:30-12:00 / 13:30-15:30', Joi: '09:00-12:30 / 15:00-17:00', Vineri: '08:30-12:00' },
    },
    localContext:
      'Buzău este reședința județului Buzău, la întâlnirea dintre Muntenia și Moldova, cu o economie ' +
      'bazată pe industrie (sârmă și produse metalurgice, materiale de construcții) și logistică. ' +
      'Buzoienii solicită frecvent cazier judiciar pentru angajare în fabrici, transporturi și administrație.',
    localFaq: [
      { q: 'Unde se eliberează cazierul judiciar în Buzău?', a: 'La Serviciul Cazier Judiciar din IPJ Buzău, pe Str. Chiristigii nr. 8-10. Sau online, prin eGhișeul.ro, fără coadă.' },
      { q: 'Pot obține cazierul din Buzău fără să mă deplasez?', a: 'Da. Completezi cererea online, noi o depunem la IPJ Buzău și primești documentul prin curier în 2-4 zile.' },
    ],
    nearbyCitySlugs: ['ploiesti', 'galati'],
  },
];

/** Orașele validate anti-thin. Importă DOAR de aici (sau prin `index.ts`). */
export const CITIES: CityData[] = assertAllCities(RAW_CITIES);
