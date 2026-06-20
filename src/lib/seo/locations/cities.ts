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
];

/** Orașele validate anti-thin. Importă DOAR de aici (sau prin `index.ts`). */
export const CITIES: CityData[] = assertAllCities(RAW_CITIES);
