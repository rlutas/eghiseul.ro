import { describe, it, expect } from 'vitest';
import { urlWithoutEmail } from '@/lib/url/strip-email-param';

describe('urlWithoutEmail', () => {
  it('removes only the email and keeps the rest, hash included', () => {
    expect(urlWithoutEmail('https://eghiseul.ro/comanda/status/?order=E-1&email=a%40b.ro&coupon=X#mesaje')).toBe(
      '/comanda/status/?order=E-1&coupon=X#mesaje',
    );
  });

  it('returns null when the address has no email, so nothing is rewritten', () => {
    expect(urlWithoutEmail('https://eghiseul.ro/comanda/x/?step=2&order=E-1')).toBeNull();
  });
});
