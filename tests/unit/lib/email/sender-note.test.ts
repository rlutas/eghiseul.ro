import { describe, expect, it } from 'vitest';
import { applySenderNote, SENDER_NOTE_MARKER } from '@/lib/email/resend';
import { brandedEmailHtml } from '@/lib/email/templates/branded-layout';

const shell = (brand: 'eghiseul' | 'documentero' | 'cazierfiscal') =>
  brandedEmailHtml({ preheader: 'p', content: '<p>salut</p>', brand });

describe('nota despre expeditor', () => {
  it('eghiseul nu are marcaj deloc', () => {
    expect(shell('eghiseul')).not.toContain(SENDER_NOTE_MARKER);
  });

  it('brand trimis de pe @eghiseul.ro → o linie care explică adresa', () => {
    const html = applySenderNote(shell('documentero'), 'documentero.ro <contact@documentero.ro>', 'documentero.ro <contact@eghiseul.ro>');
    expect(html).not.toContain(SENDER_NOTE_MARKER);
    expect(html).toContain('Email trimis prin eGhișeul.ro');
    expect(html).toContain('operează și documentero.ro');
    expect(html).toContain('@eghiseul.ro');
  });

  it('brand trimis de pe domeniul lui → nicio linie, niciun marcaj', () => {
    const html = applySenderNote(shell('cazierfiscal'), 'cazierfiscal.com <contact@cazierfiscal.com>', 'cazierfiscal.com <contact@cazierfiscal.com>');
    expect(html).not.toContain(SENDER_NOTE_MARKER);
    expect(html).not.toContain('Email trimis prin');
  });

  it('email fără marcaj rămâne neatins', () => {
    expect(applySenderNote('<p>x</p>', 'documentero.ro <contact@documentero.ro>', 'a <b@eghiseul.ro>')).toBe('<p>x</p>');
  });

  it('expeditor necunoscut ca brand → marcajul dispare, fără notă', () => {
    const html = applySenderNote(shell('documentero'), undefined, 'eGhișeul.ro <contact@eghiseul.ro>');
    expect(html).not.toContain(SENDER_NOTE_MARKER);
    expect(html).not.toContain('Email trimis prin');
  });
});
