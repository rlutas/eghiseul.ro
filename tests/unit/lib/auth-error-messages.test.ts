import { describe, it, expect } from 'vitest';
import { authErrorToRomanian } from '@/lib/auth/error-messages';

describe('authErrorToRomanian', () => {
  it('translates the project-wide email quota and marks it as a rate limit', () => {
    const info = authErrorToRomanian('email rate limit exceeded', 'over_email_send_rate_limit');

    expect(info.isRateLimit).toBe(true);
    expect(info.message).toContain('limita pe oră');
    // The customer must be told the account is not a precondition for ordering.
    expect(info.message).toContain('Nu ai nevoie de cont');
  });

  it('extracts the wait time from the GoTrue security cooldown', () => {
    const info = authErrorToRomanian(
      'For security purposes, you can only request this after 47 seconds.'
    );

    expect(info.isRateLimit).toBe(true);
    expect(info.retryAfterSeconds).toBe(47);
    expect(info.message).toContain('47 secunde');
  });

  it('rounds a cooldown over a minute up to whole minutes', () => {
    const info = authErrorToRomanian(
      'For security purposes, you can only request this after 90 seconds.'
    );

    expect(info.retryAfterSeconds).toBe(90);
    expect(info.message).toContain('2 minute');
  });

  it('translates wrong credentials without calling it a rate limit', () => {
    const info = authErrorToRomanian('Invalid login credentials', 'invalid_credentials');

    expect(info.isRateLimit).toBe(false);
    expect(info.message).toContain('Email sau parolă greșită');
  });

  it('tells an unconfirmed user to check spam and offers a phone fallback', () => {
    const info = authErrorToRomanian('Email not confirmed', 'email_not_confirmed');

    expect(info.message).toContain('Spam');
    expect(info.message).toContain('0757 708 181');
  });

  it('never leaks an untranslated English message', () => {
    const info = authErrorToRomanian('Some brand new GoTrue failure', 'totally_unknown_code');

    expect(info.message).not.toContain('GoTrue');
    expect(info.message).not.toContain('failure');
    expect(info.message).toContain('A apărut o eroare');
  });

  it('survives an empty error', () => {
    expect(() => authErrorToRomanian('')).not.toThrow();
    expect(authErrorToRomanian('').isRateLimit).toBe(false);
  });
});
