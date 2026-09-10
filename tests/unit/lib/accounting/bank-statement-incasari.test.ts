import { describe, expect, it } from 'vitest';
import {
  parseBtCsv,
  payerFromDescription,
  orderNumbersInDescription,
  referenceCandidates,
} from '@/lib/accounting/bank-statement';

// Încasările prin transfer bancar de la clienți cădeau pe categoria „altele" și
// nu se legau de nicio comandă, deci o plată prin IBAN nu se vedea în decontări
// (10.09.2026, E-260905-DMUZA).

const INCASARE =
  '"C.I.F.:45250538;Plata comanda E-260905-DMUZA;2026;6;IULIANA FUNERAR SRL;RO39BTRLRONCRT0626814701;BTRLRO"';
const APORT =
  '"aport propriu;2615201074022000;LUTAS RAUL CATALIN;RO25BTRLRONCRT0559514801;BTRLRO22;BTRLRO22;"';
const STRIPE = '"STRIPE TECHNOLOGY EUROPE LTD;IE29CITI99005170000034;CITIIE2X;"';

function csv(rows: string[]): string {
  return [
    '"Lista de tranzactii",,,,,,',
    '"Numar cont:",RO82BTRLRONCRT0CP9350501,,,,,',
    '"Data tranzactie","Data valuta",Referinta,"Tip tranzactie",Descriere,Debit,Credit',
    ...rows,
  ].join('\n');
}

describe('categorizarea încasărilor de la clienți', () => {
  it('un credit cu IBAN-ul plătitorului = incasare_client', () => {
    const { entries } = parseBtCsv(csv([`05/09/2026,05/09/2026,REF001,"Incasare",${INCASARE},,1646.00`]));
    expect(entries).toHaveLength(1);
    expect(entries[0].category).toBe('incasare_client');
    expect(entries[0].credit_bani).toBe(164600);
  });

  it('aportul propriu NU e încasare de la client', () => {
    // Regula aportului rulează prima, deși linia are și ea IBAN.
    const { entries } = parseBtCsv(csv([`02/06/2026,02/06/2026,REF002,"Incasare",${APORT},,15000.00`]));
    expect(entries[0].category).toBe('aport');
  });

  it('decontarea Stripe rămâne stripe_payout', () => {
    const { entries } = parseBtCsv(csv([`03/09/2026,03/09/2026,REF003,"Incasare",${STRIPE},,5000.00`]));
    expect(entries[0].category).toBe('stripe_payout');
  });

  it('un debit cu IBAN (plată către furnizor) NU e încasare', () => {
    const { entries } = parseBtCsv(csv([`05/09/2026,05/09/2026,REF004,"Plata",${INCASARE},1646.00,`]));
    expect(entries[0].category).not.toBe('incasare_client');
  });
});

describe('payerFromDescription', () => {
  it('ia numele dinaintea IBAN-ului', () => {
    expect(payerFromDescription(INCASARE.replace(/"/g, ''))).toBe('IULIANA FUNERAR SRL');
  });

  it('fără IBAN întoarce null în loc să ghicească', () => {
    expect(payerFromDescription('Plata oarecare fara cont')).toBeNull();
  });
});

describe('orderNumbersInDescription', () => {
  it('găsește numărul comenzii din „detalii plată"', () => {
    expect(orderNumbersInDescription('Plata comanda E-260905-DMUZA')).toEqual(['E-260905-DMUZA']);
  });

  it('e insensibil la majuscule și nu repetă', () => {
    expect(orderNumbersInDescription('e-260905-dmuza / E-260905-DMUZA')).toEqual(['E-260905-DMUZA']);
  });

  it('fără număr de comandă întoarce listă goală', () => {
    expect(orderNumbersInDescription('Plata factura EGH 0278')).toEqual([]);
  });
});

describe('referenceCandidates', () => {
  it('ia referința din coloană și din „REF:" din descriere', () => {
    expect(
      referenceCandidates({
        reference: 'C31IZ56250292001',
        description: 'Incasare SEPA;E-260905-DMUZA;CURS 5.2508 RON ;REF: C31ZEXA26251016D',
      })
    ).toEqual(['C31IZ56250292001', 'C31ZEXA26251016D']);
  });

  it('curăță sufixul de duplicat pe care îl punem la import', () => {
    expect(referenceCandidates({ reference: 'C31IZ56250292001#2', description: null })).toEqual([
      'C31IZ56250292001',
    ]);
  });

  it('nu repetă aceeași referință', () => {
    expect(
      referenceCandidates({ reference: 'ABC123456', description: 'REF: ABC123456' })
    ).toEqual(['ABC123456']);
  });
});
