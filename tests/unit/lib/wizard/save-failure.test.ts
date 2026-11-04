import { describe, it, expect } from 'vitest';
import { isNetworkFailure, saveFailureMessage, nextSaveRetryDelay } from '@/lib/wizard/save-failure';

describe('isNetworkFailure', () => {
  it('recognises what fetch throws on Chrome, Firefox and Safari', () => {
    expect(isNetworkFailure(new TypeError('Failed to fetch'))).toBe(true);
    expect(isNetworkFailure(new TypeError('NetworkError when attempting to fetch resource.'))).toBe(true);
    expect(isNetworkFailure(new TypeError('Load failed'))).toBe(true);
  });

  it('does not treat a server or code error as a connection problem', () => {
    expect(isNetworkFailure(new Error('Salvarea a eșuat (500)'))).toBe(false);
    expect(isNetworkFailure(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(false);
    expect(isNetworkFailure('Failed to fetch')).toBe(false);
  });
});

describe('saveFailureMessage', () => {
  it('never shows the customer the raw English browser error', () => {
    const text = saveFailureMessage(new TypeError('Failed to fetch'));
    expect(text).not.toMatch(/fetch/i);
    expect(text).toMatch(/conexiun/i);
  });

  it('keeps the message the server sent', () => {
    expect(saveFailureMessage(new Error('Salvarea a eșuat (500)'))).toBe('Salvarea a eșuat (500)');
  });
});

describe('nextSaveRetryDelay', () => {
  it('backs off, then stops so a dead connection does not retry forever', () => {
    const delays = [0, 1, 2, 3].map(nextSaveRetryDelay);
    expect(delays.every((d) => typeof d === 'number' && d > 0)).toBe(true);
    expect(delays).toEqual([...(delays as number[])].sort((a, b) => (a as number) - (b as number)));
    expect(nextSaveRetryDelay(4)).toBeNull();
  });
});
