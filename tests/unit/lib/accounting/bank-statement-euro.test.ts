import { describe, expect, it } from 'vitest';
import {
  accountCurrency,
  hasPayerIban,
  orderNumbersInDescription,
  parseBtCsv,
  payerFromDescription,
  ronEquivalent,
} from '@/lib/accounting/bank-statement';

// Contul în euro (SEPA): plătitori cu IBAN străin, sume în eurocenți, iar banca
// tipărește pe linie cursul și echivalentul în lei. Până la 12.11.2026 aceste
// linii nu aveau plătitor și cădeau pe „altele"; echipa le nota de mână.

const SEPA_CU_COMANDA =
  '"E-261014-AB12C;Maria Exemplu;DE10320500000065491649;SPKRDE33XXX;CURS 5.337 RON ECHIVALENT LEI 945.34"';
const SEPA_FARA_COMANDA =
  '"Ing. Ion Exemplu;AT111400001210853100;BAWAATWW;CURS 5.3495 RON ECHIVALENT LEI 298.02"';

function csvEur(rows: string[]): string {
  return [
    '"Lista de tranzactii",,,,,,',
    '"Numar cont:",RO29BTRLEURCRT0CP9350501,,,,,',
    '"Moneda cont:",EUR,,,,,',
    '"Data tranzactie","Data valuta",Referinta,"Tip tranzactie",Descriere,Debit,Credit',
    ...rows,
  ].join('\n');
}

describe('contul în euro', () => {
  it('moneda se citește din IBAN-ul contului', () => {
    expect(accountCurrency('RO29BTRLEURCRT0CP9350501')).toBe('EUR');
    expect(accountCurrency('RO82BTRLRONCRT0CP9350501')).toBe('RON');
    expect(accountCurrency('')).toBe('RON');
    expect(accountCurrency(null)).toBe('RON');
  });

  it('încasare SEPA de la un IBAN străin = incasare_client, cu plătitor', () => {
    const { account, entries } = parseBtCsv(
      csvEur([
        `16/10/2026,16/10/2026,C31ZEXA0000000001,"Incasare SEPA",${SEPA_CU_COMANDA},,177.13`,
        `29/10/2026,29/10/2026,C31ZEXA0000000002,"Incasare SEPA",${SEPA_FARA_COMANDA},,55.71`,
      ])
    );
    expect(accountCurrency(account)).toBe('EUR');
    expect(entries.map((e) => [e.category, e.counterparty, e.credit_bani])).toEqual([
      ['incasare_client', 'Maria Exemplu', 17713],
      ['incasare_client', 'Ing. Ion Exemplu', 5571],
    ]);
    expect(orderNumbersInDescription(entries[0].description ?? '')).toEqual(['E-261014-AB12C']);
  });

  it('echivalentul în lei și cursul vin de pe linie', () => {
    expect(ronEquivalent('x;CURS 5.337 RON ECHIVALENT LEI 945.34')).toEqual({ bani: 94534, rate: 5.337 });
    expect(ronEquivalent('x;ECHIVALENT LEI 298.02')).toEqual({ bani: 29802, rate: null });
    expect(ronEquivalent('Plata comanda E-1')).toBeNull();
    expect(ronEquivalent(null)).toBeNull();
  });

  it('IBAN străin doar ca segment întreg: o referință sau un cod nu e IBAN', () => {
    expect(hasPayerIban('Ion Pop;DE10320500000065491649;BIC')).toBe(true);
    expect(hasPayerIban('Plata REF C31ZEXA2628903VJ fara iban')).toBe(false);
    expect(hasPayerIban('C.I.F.:45250538;Plata factura')).toBe(false);
    expect(payerFromDescription('DE10320500000065491649;BIC')).toBeNull(); // niciun nume înainte
  });

  it('contul în lei rămâne cum era', () => {
    expect(payerFromDescription('Plata comanda;2026;6;FIRMA SRL;RO39BTRLRONCRT0626814701;BTRLRO')).toBe('FIRMA SRL');
  });
});
