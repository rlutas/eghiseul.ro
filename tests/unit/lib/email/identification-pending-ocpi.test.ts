import { describe, expect, it } from 'vitest';
import { renderIdentificationPendingOcpiEmail } from '@/lib/email/templates/identification-pending-ocpi';
import { BRANDS } from '@/lib/brand/brands';

const input = {
  friendlyOrderId: 'E-260728-VWFTT',
  searchedFor: 'Str. Vericescu nr. 5, București Sectorul 3, jud. București',
  ocpiLabel: 'OCPI București',
  viewUrl: 'https://eghiseul.ro/comanda/status/?order=E-260728-VWFTT&email=a%40b.ro',
};

describe('renderIdentificationPendingOcpiEmail', () => {
  it('says the property is not in e-Terra and that an official certificate was requested', () => {
    const m = renderIdentificationPendingOcpiEmail(input);
    expect(m.subject).toContain('E-260728-VWFTT');
    expect(m.html).toContain('e-Terra');
    expect(m.html).toContain('certificat');
    expect(m.html).toContain('OCPI București');
    expect(m.html).toContain('Str. Vericescu nr. 5');
    expect(m.text).toContain('10 zile lucrătoare');
  });

  it('explains both possible outcomes and both reasons (neintabulat / carte veche neconvertită)', () => {
    const m = renderIdentificationPendingOcpiEmail(input);
    expect(m.text).toContain('intabulat');
    expect(m.text).toContain('convertit');
    // Linkul e escapat în HTML (&amp;); textul îl poartă verbatim.
    expect(m.text).toContain(input.viewUrl);
  });

  it('never promises a credit or a free extract', () => {
    const m = renderIdentificationPendingOcpiEmail(input);
    expect(m.html.toLowerCase()).not.toContain('credit');
    expect(m.html.toLowerCase()).not.toContain('gratuit');
  });

  it('follows the order brand', () => {
    const m = renderIdentificationPendingOcpiEmail({ ...input, brand: BRANDS.documentero });
    expect(m.text).toContain(BRANDS.documentero.contactEmail);
  });
});
