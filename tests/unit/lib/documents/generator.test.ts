import { describe, expect, it } from 'vitest';
import {
  buildClientDetailsBlock,
  hasUrgentOption,
  buildDeliveryTerms,
  buildInstitutie,
  buildMotivFraza,
  buildCIInfo,
  buildOptionsText,
  buildStareCivilaLabel,
  buildActivitatiStareCivila,
} from '@/lib/documents/generator';

// These helpers produce the actual TEXT that ends up in legal contracts.
// A regression here = wrong contract content sent to clients (signed and
// archived as legal proof). Critical for legal validity.

describe('buildClientDetailsBlock — PF (persoană fizică)', () => {
  const baseClient = {
    name: 'POPESCU ION',
    firstName: 'ION',
    lastName: 'POPESCU',
    cnp: '1820507211209',
    ci_series: 'SM',
    ci_number: '584285',
    document_issued_by: 'SPCLEP Slobozia',
    email: 'ion@example.com',
    phone: '+40712345678',
    is_pj: false,
  };

  it('produces the canonical Romanian legal identification format', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      address_parts: { street: 'Bujorului', number: '2', city: 'Slobozia', county: 'Ialomița' },
    });

    expect(text).toContain('POPESCU ION');
    expect(text).toContain('legitimat/ă cu CI seria SM nr. 584285');
    expect(text).toContain('emisă de SPCLEP Slobozia');
    expect(text).toContain('CNP 1820507211209');
    expect(text).toContain('cu domiciliul în');
    expect(text).toContain('Str. Bujorului');
    expect(text).toContain('Localitatea Slobozia');
    expect(text).toContain('Jud. Ialomița');
  });

  it('omits CI emisă de when document_issued_by is missing', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      document_issued_by: undefined,
    });
    expect(text).toContain('legitimat/ă cu CI seria SM nr. 584285');
    expect(text).not.toContain('emisă de');
  });

  it('builds a full structured address with optional bloc/scară/etaj/ap', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      address_parts: {
        street: 'Aleea Florilor', number: '12', building: 'A1', staircase: 'B',
        floor: '2', apartment: '15', city: 'București', county: 'Sector 3',
      },
    });
    expect(text).toContain('Str. Aleea Florilor, Nr. 12, Bl. A1, Sc. B, Et. 2, Ap. 15');
    expect(text).toContain('Localitatea București');
    expect(text).toContain('Jud. Sector 3');
  });

  it('falls back to flat address string when address_parts not provided', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      address: 'Str. Test 1, București',
    });
    expect(text).toContain('cu domiciliul în Str. Test 1, București');
  });

  it('uses firstName + lastName when canonical "name" is empty', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      name: '',
      firstName: 'ION',
      lastName: 'POPESCU',
    });
    // Ordinea românească: familie întâi (28.07.2026 — src/lib/format/person-name.ts).
    expect(text).toContain('POPESCU ION');
  });

  it('omits CI block entirely when both series and number missing', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      ci_series: undefined,
      ci_number: undefined,
    });
    expect(text).not.toContain('legitimat');
    expect(text).toContain('CNP 1820507211209'); // CNP still present
  });

  it('omits CNP block when CNP missing (foreign citizen flow)', () => {
    const text = buildClientDetailsBlock({
      ...baseClient,
      cnp: undefined,
    });
    expect(text).not.toContain('CNP');
  });
});

describe('buildClientDetailsBlock — PJ (persoană juridică)', () => {
  const basePJ = {
    name: 'ACME SRL',
    firstName: 'ION',
    lastName: 'POPESCU',
    cnp: '1820507211209',
    ci_series: 'IF',
    ci_number: '999999',
    company_name: 'ACME SRL',
    cui: 'RO12345678',
    company_reg: 'J40/1234/2020',
    company_address: 'Str. Test 1, București',
    email: 'office@acme.ro',
    phone: '+40212345678',
    is_pj: true,
  };

  it('starts with company name + CUI + Reg. Com. + sediu', () => {
    const text = buildClientDetailsBlock(basePJ);
    expect(text).toContain('ACME SRL');
    expect(text).toContain('CUI: RO12345678');
    expect(text).toContain('Nr. Reg. Com.: J40/1234/2020');
    expect(text).toContain('cu sediul în Str. Test 1, București');
  });

  it('appends representative with full CI + CNP (legal requirement for PJ)', () => {
    const text = buildClientDetailsBlock(basePJ);
    expect(text).toContain('reprezentată prin POPESCU ION');
    expect(text).toContain('legitimat/ă cu CI seria IF nr. 999999');
    expect(text).toContain('CNP 1820507211209');
  });

  it('omits representative block when name + firstName + lastName all empty', () => {
    const text = buildClientDetailsBlock({
      ...basePJ,
      firstName: '',
      lastName: '',
    });
    expect(text).not.toContain('reprezentată prin');
  });
});

describe('hasUrgentOption', () => {
  it('returns true when any option name contains "urgent" (case-insensitive)', () => {
    expect(hasUrgentOption([{ option_name: 'Procesare Urgentă' }])).toBe(true);
    expect(hasUrgentOption([{ optionName: 'URGENT delivery' }])).toBe(true);
    expect(hasUrgentOption([{ option_name: 'urgentă' }])).toBe(true);
  });

  it('returns false when no urgent option present', () => {
    expect(hasUrgentOption([{ option_name: 'Apostila Haga' }])).toBe(false);
    expect(hasUrgentOption([{ option_name: 'Traducere' }])).toBe(false);
  });

  it('returns false for empty / undefined options', () => {
    expect(hasUrgentOption()).toBe(false);
    expect(hasUrgentOption([])).toBe(false);
    expect(hasUrgentOption(undefined)).toBe(false);
  });

  it('reads both snake_case (DB) and camelCase (wizard state) field names', () => {
    expect(hasUrgentOption([{ option_name: 'urgent' }])).toBe(true);
    expect(hasUrgentOption([{ optionName: 'urgent' }])).toBe(true);
  });
});

describe('buildDeliveryTerms', () => {
  // Helper: build a minimal order context. The function only reads the
  // delivery-relevant fields; the rest are required by the type but unused.
  type OrderArg = Parameters<typeof buildDeliveryTerms>[0];
  const order = (extra: Partial<OrderArg> = {}): OrderArg => ({
    order_number: 'X',
    friendly_order_id: 'X',
    total_price: 0,
    service_name: 'X',
    service_price: 0,
    created_at: '2026-04-27',
    ...extra,
  });

  it('renders standard term in singular when estimated_days = 1', () => {
    const text = buildDeliveryTerms(order({ estimated_days: 1 }), []);
    expect(text).toContain('1 zi lucrătoare');
    expect(text).not.toContain('1 zile');
  });

  it('renders standard term in plural when estimated_days > 1', () => {
    const text = buildDeliveryTerms(order({ estimated_days: 5 }), []);
    expect(text).toContain('5 zile lucrătoare');
  });

  it('uses urgent_days when urgent option selected and urgent_available=true', () => {
    const text = buildDeliveryTerms(
      order({ estimated_days: 5, urgent_days: 2, urgent_available: true }),
      [{ option_name: 'Procesare urgentă' }],
    );
    expect(text).toContain('2 zile lucrătoare (procesare urgentă)');
    expect(text).not.toContain('5 zile lucrătoare');
  });

  it('falls back to estimated when urgent option selected but service NOT urgent_available', () => {
    const text = buildDeliveryTerms(
      order({ estimated_days: 5, urgent_days: 2, urgent_available: false }),
      [{ option_name: 'Procesare urgentă' }],
    );
    expect(text).toContain('5 zile lucrătoare');
    expect(text).not.toContain('procesare urgentă');
  });

  it('always appends the 10-day extension disclaimer', () => {
    const text = buildDeliveryTerms(order({ estimated_days: 3 }), []);
    expect(text).toContain('verificări suplimentare');
    expect(text).toContain('10 zile lucrătoare');
  });

  it('returns generic fallback when no estimated_days nor urgent_days configured', () => {
    const text = buildDeliveryTerms(order(), []);
    expect(text).toContain('comunicat de prestator');
  });
});

describe('buildInstitutie', () => {
  // 2026-07-09: textul activităților de pe împuternicire e acum FRAZA
  // completă (cerință echipă): „să se prezinte la <autoritate>, în vederea
  // ridicării <document>"
  it.each([
    ['cazier-judiciar', 'IPJ SATU MARE', 'Cazier Judiciar'],
    ['cazier-judiciar-persoana-fizica', 'IPJ SATU MARE', 'Cazier Judiciar'],
    ['cazier-judiciar-persoana-juridica', 'IPJ SATU MARE', 'Cazier Judiciar'],
    ['cazier-auto', 'IPJ SATU MARE', 'Cazier Auto'],
    ['cazier-fiscal', 'ANAF SATU MARE', 'Cazier Fiscal'],
    ['certificat-nastere', 'OFICIUL DE STARE CIVILĂ', 'Certificat de Naștere'],
    ['certificat-casatorie', 'OFICIUL DE STARE CIVILĂ', 'Certificat de Căsătorie'],
    ['certificat-celibat', 'OFICIUL DE STARE CIVILĂ', 'Certificat de Celibat'],
    ['certificat-integritate', 'IPJ SATU MARE', 'Certificat de Integritate Comportamentală'],
    ['extras-carte-funciara', 'OCPI SATU MARE', 'Extras de Carte Funciară'],
    ['certificat-constatator', 'ONRC SATU MARE', 'Certificat Constatator'],
  ])('slug "%s" → „să se prezinte la %s, în vederea ridicării %s"', (slug, authority, document) => {
    // Punctul final NU mai aparține acestei fraze: îl aduce {{MOTIV_FRAZA}},
    // ca „…Cazier Judiciar, motivul solicitării: X." să iasă corect punctuat.
    expect(buildInstitutie(slug)).toBe(
      `să se prezinte la ${authority}, în vederea ridicării ${document}`
    );
  });

  it('nu mai adaugă motivul — îl aduce {{MOTIV_FRAZA}}, ca să nu apară de două ori', () => {
    expect(buildInstitutie('cazier-judiciar', 'AUTORITATI')).toBe(
      'să se prezinte la IPJ SATU MARE, în vederea ridicării Cazier Judiciar'
    );
  });

  it('returns the slug as-is when no mapping exists (graceful fallback)', () => {
    expect(buildInstitutie('serviciu-nou')).toBe('serviciu-nou');
  });

  it('returns empty string for missing slug', () => {
    expect(buildInstitutie()).toBe('');
    expect(buildInstitutie(undefined)).toBe('');
  });

  // E-260725-9BGGD: comandă de cazier judiciar + add-on certificat de
  // integritate. Ambele împuterniciri (SM007426 și SM007427) au ieșit cu
  // „în vederea ridicării Cazier Judiciar", fiindcă textul se construia numai
  // din slug-ul serviciului principal.
  describe('împuterniciri per add-on (delegationServiceType)', () => {
    it('add-on integritate → textul certificatului de integritate, nu al cazierului', () => {
      expect(
        buildInstitutie('cazier-judiciar-persoana-fizica', 'D.G.A.S.P.C.', 'addon_certificat_integritate')
      ).toBe(
        'să se prezinte la IPJ SATU MARE, în vederea ridicării Certificat de Integritate Comportamentală'
      );
    });

    it('add-on cazier fiscal → ANAF', () => {
      expect(buildInstitutie('cazier-judiciar', undefined, 'addon_cazier_fiscal')).toBe(
        'să se prezinte la ANAF SATU MARE, în vederea ridicării Cazier Fiscal'
      );
    });

    it.each([
      ['addon_certificat_nastere', 'Certificat de Naștere'],
      ['addon_certificat_casatorie', 'Certificat de Căsătorie'],
      ['addon_certificat_celibat', 'Certificat de Celibat'],
    ])('%s → %s la starea civilă', (code, doc) => {
      expect(buildInstitutie('cazier-judiciar', undefined, code)).toBe(
        `să se prezinte la OFICIUL DE STARE CIVILĂ, în vederea ridicării ${doc}`
      );
    });

    // Apostila se aplică PE un document, deci împuternicirea trebuie să spună pe
    // care — chiar și când e apostilă pe serviciul principal, nu pe un add-on
    // (raport Raul, comanda E-260728-YFHH2, 28.07.2026: textul se oprea la
    // „aplicării Apostilei de la Haga.", fără obiect).
    it('apostila Haga pe serviciul principal → spune pe CE document se aplică', () => {
      expect(buildInstitutie('cazier-judiciar', undefined, 'apostila_haga')).toBe(
        'să se prezinte la INSTITUȚIA PREFECTULUI - JUDEȚUL SATU MARE, în vederea aplicării Apostilei de la Haga pe Cazier Judiciar'
      );
    });

    it('apostila Haga pe certificat de naștere → documentul corect în text', () => {
      expect(buildInstitutie('certificat-nastere', undefined, 'apostila_haga')).toBe(
        'să se prezinte la INSTITUȚIA PREFECTULUI - JUDEȚUL SATU MARE, în vederea aplicării Apostilei de la Haga pe Certificat de Naștere'
      );
    });

    it('apostila bundled pe alt serviciu spune pe CE document se aplică', () => {
      expect(
        buildInstitutie('cazier-judiciar', undefined, 'bundled:opt-1:certificat-integritate:apostila_haga')
      ).toBe(
        'să se prezinte la INSTITUȚIA PREFECTULUI - JUDEȚUL SATU MARE, în vederea aplicării Apostilei de la Haga pe Certificat de Integritate Comportamentală'
      );
    });

    it('delegația serviciului principal (slug) păstrează textul de azi', () => {
      expect(
        buildInstitutie('cazier-judiciar-persoana-fizica', 'D.G.A.S.P.C.', 'cazier-judiciar-persoana-fizica')
      ).toBe(
        'să se prezinte la IPJ SATU MARE, în vederea ridicării Cazier Judiciar'
      );
    });

    it('service_type necunoscut → fallback pe serviciul principal', () => {
      expect(buildInstitutie('cazier-auto', undefined, 'cod_inexistent')).toBe(
        'să se prezinte la IPJ SATU MARE, în vederea ridicării Cazier Auto'
      );
    });
  });
});

describe('buildCIInfo', () => {
  const ciBase = { name: 'X', email: 'x@x.com', phone: '+40700000000', is_pj: false };

  it('produces "seria X nr. Y emisă de Z" when all parts present', () => {
    expect(buildCIInfo({
      ...ciBase, ci_series: 'SM', ci_number: '584285', document_issued_by: 'SPCLEP Slobozia',
    })).toBe('seria SM nr. 584285 emisă de SPCLEP Slobozia');
  });

  it('omits issuer when missing', () => {
    expect(buildCIInfo({
      ...ciBase, ci_series: 'SM', ci_number: '584285',
    })).toBe('seria SM nr. 584285');
  });

  it('returns empty string when no series and no number', () => {
    expect(buildCIInfo(ciBase)).toBe('');
  });
});

describe('buildOptionsText', () => {
  it('joins option names with comma + space', () => {
    expect(buildOptionsText([
      { option_name: 'Apostila Haga' },
      { option_name: 'Traducere' },
      { optionName: 'Urgentă' }, // camelCase variant
    ])).toBe('Apostila Haga, Traducere, Urgentă');
  });

  it('skips empty / undefined names', () => {
    expect(buildOptionsText([
      { option_name: 'Apostila' },
      { option_name: '' },
      { option_name: undefined },
      { option_name: 'Traducere' },
    ])).toBe('Apostila, Traducere');
  });

  it('returns empty string for empty / undefined options', () => {
    expect(buildOptionsText()).toBe('');
    expect(buildOptionsText([])).toBe('');
  });
});

describe('buildStareCivilaLabel — fără liniuță pe împuternicire', () => {
  // CNP feminin / masculin pentru acordare
  const CNP_F = '2820507211209';
  const CNP_M = '1820507211209';

  it('folosește starea civilă declarată, când există (celibat)', () => {
    expect(buildStareCivilaLabel('casatorit', CNP_F)).toBe('căsătorită');
    expect(buildStareCivilaLabel('vaduv', CNP_M)).toBe('văduv');
  });

  it('o deduce când clientul e căsătorit în prezent (căsătorie/naștere nu întreabă direct)', () => {
    expect(buildStareCivilaLabel('', CNP_F, { currentlyMarried: true })).toBe('căsătorită');
  });

  it('o deduce ca necăsătorit când ambele răspunsuri sunt „nu"', () => {
    expect(
      buildStareCivilaLabel('', CNP_M, { currentlyMarried: false, wasMarriedBefore: false })
    ).toBe('necăsătorit');
  });

  it('distinge divorțat de văduv din „ultima căsătorie s-a încheiat prin"', () => {
    // Informația se colectează deja în pas — nicio întrebare nouă.
    expect(
      buildStareCivilaLabel('', CNP_F, {
        currentlyMarried: false,
        wasMarriedBefore: true,
        lastMarriageEndedBy: 'divort',
      })
    ).toBe('divorțată');
    expect(
      buildStareCivilaLabel('', CNP_M, {
        currentlyMarried: false,
        wasMarriedBefore: true,
        lastMarriageEndedBy: 'deces',
      })
    ).toBe('văduv');
  });

  it('acceptă și eticheta veche cu diacritice („Divorț")', () => {
    expect(
      buildStareCivilaLabel('', CNP_M, {
        currentlyMarried: false,
        wasMarriedBefore: true,
        lastMarriageEndedBy: 'Divorț',
      })
    ).toBe('divorțat');
  });

  it('recăsătorit rămâne „căsătorit", nu divorțat', () => {
    expect(
      buildStareCivilaLabel('', CNP_M, {
        currentlyMarried: true,
        wasMarriedBefore: true,
        lastMarriageEndedBy: 'divort',
      })
    ).toBe('căsătorit');
  });

  it('rămâne gol când a fost căsătorit dar nu știm cum s-a încheiat', () => {
    expect(
      buildStareCivilaLabel('', CNP_F, { currentlyMarried: false, wasMarriedBefore: true })
    ).toBe('');
  });

  it('NU scrie „necăsătorit" pe o comandă care dovedește o căsătorie', () => {
    // E-260728-Z77WC: ambele răspunsuri pe „nu", dar cu data căsătoriei și
    // numele soțului completate. „certificatul de căsătorie încheiată cu X …
    // stare status civil: necăsătorită" ar fi absurd pe același rând.
    expect(
      buildStareCivilaLabel('', CNP_F, {
        currentlyMarried: false,
        wasMarriedBefore: false,
        marriageOnRecord: true,
      })
    ).toBe('');
    // și când starea civilă e declarată explicit, tot contrazice actul
    expect(buildStareCivilaLabel('necasatorit', CNP_F, { marriageOnRecord: true })).toBe('');
  });

  it('gol când nu se știe nimic (nu „-")', () => {
    expect(buildStareCivilaLabel('', CNP_F)).toBe('');
    expect(buildStareCivilaLabel(undefined, undefined, {})).toBe('');
  });
});

describe('buildActivitatiStareCivila — care căsătorie', () => {
  const marriage = {
    spouseName: 'MUSAT DUMITRU',
    marriageDate: '1992-03-28',
    marriagePlace: 'Brăila',
  };

  it('numește soțul, data și locul (Localitatea + Județul) pe certificatul de căsătorie', () => {
    expect(buildActivitatiStareCivila('certificat-casatorie', marriage)).toBe(
      'Să obțină Certificatul de Căsătorie încheiată cu MUSAT DUMITRU la data de 28.03.1992, în Localitatea: Brăila, Județul: Brăila.'
    );
  });

  it('localitatea reală separată de județ, când e colectată (din 30.07.2026)', () => {
    expect(
      buildActivitatiStareCivila('extras-multilingv-certificat-casatorie', {
        spouseName: 'TAKACS ENIKO NICOLETA',
        marriageDate: '1987-02-07',
        marriagePlace: 'Bihor',
        marriageLocality: 'Oradea',
      })
    ).toBe(
      'Să obțină Extrasul Multilingv de Căsătorie încheiată cu TAKACS ENIKO NICOLETA la data de 07.02.1987, în Localitatea: Oradea, Județul: Bihor.'
    );
  });

  it('la fel pe extrasul multilingv de căsătorie', () => {
    const text = buildActivitatiStareCivila('extras-multilingv-certificat-casatorie', marriage);
    expect(text).toContain('Să obțină Extrasul Multilingv de Căsătorie');
    expect(text).toContain('încheiată cu MUSAT DUMITRU');
    expect(text).toContain('în Localitatea: Brăila, Județul: Brăila.');
  });

  it('adaugă doar ce s-a colectat, fără puncte de umplutură', () => {
    expect(buildActivitatiStareCivila('certificat-casatorie', { spouseName: 'POPA ION' })).toBe(
      'Să obțină Certificatul de Căsătorie încheiată cu POPA ION.'
    );
    expect(buildActivitatiStareCivila('certificat-casatorie', { marriageDate: '1992-03-28' })).toBe(
      'Să obțină Certificatul de Căsătorie la data de 28.03.1992.'
    );
  });

  it('rămâne textul simplu când nu avem detalii', () => {
    expect(buildActivitatiStareCivila('certificat-casatorie', {})).toBe(
      'Să obțină Certificatul de Căsătorie.'
    );
    expect(buildActivitatiStareCivila('certificat-casatorie')).toBe(
      'Să obțină Certificatul de Căsătorie.'
    );
  });

  it('nu adaugă detalii de căsătorie pe naștere sau celibat (și fără punct final — templateul are virgulă după tag)', () => {
    expect(buildActivitatiStareCivila('certificat-nastere', marriage)).toBe(
      'Să obțină Certificatul de Naștere'
    );
  });

  it('gol pentru servicii care nu sunt de stare civilă', () => {
    expect(buildActivitatiStareCivila('cazier-judiciar', marriage)).toBe('');
  });
});

describe('buildActivitatiStareCivila — delegația de apostilă (E-260802-B5VNY)', () => {
  it('spune apostila, nu actul de bază, pe împuternicirea delegației de apostilă', () => {
    expect(buildActivitatiStareCivila('certificat-celibat', undefined, 'apostila_haga')).toBe(
      'Să obțină Apostila de la Haga pe Certificatul de Celibat'
    );
    expect(buildActivitatiStareCivila('certificat-nastere', undefined, 'apostila_haga')).toBe(
      'Să obțină Apostila de la Haga pe Certificatul de Naștere'
    );
  });

  it('fără detaliile căsătoriei pe apostila de căsătorie (actul e deja emis)', () => {
    expect(
      buildActivitatiStareCivila(
        'certificat-casatorie',
        { spouseName: 'MUSAT DUMITRU', marriageDate: '1992-03-28', marriagePlace: 'Brăila' },
        'apostila_haga'
      )
    ).toBe('Să obțină Apostila de la Haga pe Certificatul de Căsătorie');
  });

  it('și în forma bundled a delegației', () => {
    expect(
      buildActivitatiStareCivila(
        'certificat-celibat',
        undefined,
        'bundled:parent-1:certificat-celibat:apostila_haga'
      )
    ).toBe('Să obțină Apostila de la Haga pe Certificatul de Celibat');
  });

  it('împuternicirea principală rămâne neschimbată (delegația serviciului)', () => {
    expect(buildActivitatiStareCivila('certificat-celibat', undefined, 'certificat-celibat')).toBe(
      'Să obțină Certificatul de Celibat'
    );
    expect(buildActivitatiStareCivila('certificat-celibat', undefined, null)).toBe(
      'Să obțină Certificatul de Celibat'
    );
  });
});

describe('buildMotivFraza — motivul NU apare pe apostila Haga', () => {
  it('apostila Haga: doar punctul final, fără motiv', () => {
    // Motivul ține de actul de bază (de ce ceri cazierul), nu de apostilare:
    // prefectura aplică apostila indiferent de motiv, iar „ALTE MOTIVE" pe
    // împuternicire arăta ca un câmp completat aiurea (semnalat 29.07).
    expect(buildMotivFraza('ALTE MOTIVE', 'apostila_haga')).toBe('.');
  });

  it('nici pe apostila aplicată pe alt act din comandă (bundled)', () => {
    expect(
      buildMotivFraza('ANGAJARE', 'bundled:parent-1:certificat-integritate:apostila_haga')
    ).toBe('.');
  });

  it('rămâne pe delegația serviciului principal', () => {
    expect(buildMotivFraza('ANGAJARE')).toBe(', motivul solicitării: ANGAJARE.');
  });

  it('rămâne pe apostila notarială (altă instituție, alt flux)', () => {
    expect(buildMotivFraza('ANGAJARE', 'apostila_notari')).toBe(
      ', motivul solicitării: ANGAJARE.'
    );
  });

  it('fără motiv completat, doar punctul final', () => {
    expect(buildMotivFraza('   ')).toBe('.');
    expect(buildMotivFraza(undefined)).toBe('.');
  });
});
