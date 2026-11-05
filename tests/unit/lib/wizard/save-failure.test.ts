import { describe, it, expect } from 'vitest';
import {
  isNetworkFailure,
  isRetriableSaveStatus,
  saveFailureMessage,
  nextSaveRetryDelay,
  SAVE_SERVER_ERROR_MESSAGE,
  SAVE_TOO_LARGE_MESSAGE,
} from '@/lib/wizard/save-failure';

describe('server failures', () => {
  it('retries a server error, not a refused request', () => {
    expect(isRetriableSaveStatus(500)).toBe(true);
    expect(isRetriableSaveStatus(503)).toBe(true);
    expect(isRetriableSaveStatus(413)).toBe(false);
    expect(isRetriableSaveStatus(404)).toBe(false);
    expect(isRetriableSaveStatus(null)).toBe(false);
  });

  it('tells the customer what to do about a request that is too large', () => {
    expect(saveFailureMessage(new Error('Salvarea a eșuat (413)'), 413)).toBe(SAVE_TOO_LARGE_MESSAGE);
  });

  it('never shows the raw server text on a server error', () => {
    expect(saveFailureMessage(new Error('An unexpected error occurred'), 500)).toBe(SAVE_SERVER_ERROR_MESSAGE);
  });
});

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
