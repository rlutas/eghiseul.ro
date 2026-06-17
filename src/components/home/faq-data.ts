/**
 * Homepage FAQ — shared by the FAQSection (client) and the homepage FAQPage
 * JSON-LD (server). Lives in its own non-client module so a Server Component
 * can import the data (importing a value from a 'use client' module yields
 * undefined during SSR). Schema text MUST match the visible text.
 */
export const HOMEPAGE_FAQS = [
  {
    question: 'Cât durează să primesc documentul?',
    answer:
      'În funcție de tipul documentului și urgența selectată, livrarea durează între 24 și 72 de ore lucrătoare. Opțiunea Express poate livra în aceeași zi pentru anumite documente.',
  },
  {
    question: 'Ce documente sunt necesare pentru a comanda?',
    answer:
      'De obicei, aveți nevoie doar de actul de identitate (CI/pașaport). Pentru anumite servicii, pot fi necesare documente adiționale precum certificat de naștere sau căsătorie. Toate cerințele sunt afișate clar la fiecare serviciu.',
  },
  {
    question: 'Documentele sunt oficiale și recunoscute de autorități?',
    answer:
      'Da, toate documentele pe care le oferim sunt documente oficiale emise de instituțiile statului român (MAI, ANAF, ANCPI, etc.). Sunt valabile legal și acceptate de toate instituțiile.',
  },
  {
    question: 'Cum se face plata?',
    answer:
      'Acceptăm plata cu cardul (Visa, Mastercard), transfer bancar sau numerar la curier. Emitem factură fiscală pentru toate plățile. Datele cardului sunt procesate securizat prin Stripe.',
  },
  {
    question: 'Ce se întâmplă dacă documentul conține erori?',
    answer:
      'Verificăm fiecare document înainte de livrare. Dacă identificăm o eroare din vina noastră sau a instituției emitente, corectăm documentul gratuit și refacem livrarea fără costuri suplimentare.',
  },
  {
    question: 'Pot comanda pentru altă persoană?',
    answer:
      'Da, puteți comanda documente pentru membrii familiei sau alte persoane, cu condiția să aveți acordul acestora și să furnizați o împuternicire notarială pentru anumite tipuri de documente.',
  },
  {
    question: 'Livrați și în străinătate?',
    answer:
      'Da, livrăm în toată Uniunea Europeană și internațional. Pentru livrarea în străinătate, costurile și timpul de livrare variază în funcție de țara de destinație.',
  },
  {
    question: 'Ce se întâmplă dacă nu pot obține documentul solicitat?',
    answer:
      'În cazul rar în care nu putem obține documentul (de ex. persoana are cazier pozitiv sau documentul nu există), returnăm integral suma plătită în termen de 48 de ore.',
  },
];
