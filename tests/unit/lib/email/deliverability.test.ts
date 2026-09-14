import { describe, expect, it } from 'vitest';
import { isSuspiciousEmail, isUndeliverable } from '@/lib/email/deliverability';

describe('isSuspiciousEmail', () => {
  it('prinde adresele inventate la tastat', () => {
    expect(isSuspiciousEmail('sssssssim@yahoo.com')).toBe(true);
    expect(isSuspiciousEmail('test@gmail.com')).toBe(true);
    expect(isSuspiciousEmail('asdf123@gmail.com')).toBe(true);
    expect(isSuspiciousEmail('aaaaa@x.ro')).toBe(true);
  });
  it('nu atinge adrese normale, nici cu litere dublate', () => {
    expect(isSuspiciousEmail('anna.tessa@gmail.com')).toBe(false);
    expect(isSuspiciousEmail('mihaela_tolos@yahoo.com')).toBe(false);
    expect(isSuspiciousEmail('testescu.ion@gmail.com')).toBe(false);
  });
});

describe('isUndeliverable', () => {
  it('domenii rezervate / fără punct', () => {
    expect(isUndeliverable('a@example.com')).toBe(true);
    expect(isUndeliverable('a@localhost')).toBe(true);
    expect(isUndeliverable('a@gmail.com')).toBe(false);
  });
});
