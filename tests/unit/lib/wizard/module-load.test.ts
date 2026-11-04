import { describe, it, expect, vi } from 'vitest';
import { loadWithTimeout, ModuleLoadTimeoutError, shouldAutoReloadForStep } from '@/lib/wizard/module-load';

describe('loadWithTimeout', () => {
  it('returns the module', async () => {
    await expect(loadWithTimeout(() => Promise.resolve('module'))).resolves.toBe('module');
  });

  it('passes the download error on', async () => {
    await expect(loadWithTimeout(() => Promise.reject(new Error('ChunkLoadError')))).rejects.toThrow('ChunkLoadError');
  });

  it('treats a download that never answers as a failure, so the spinner cannot run forever', async () => {
    const never = () => new Promise<string>(() => undefined);
    await expect(loadWithTimeout(never, 5)).rejects.toBeInstanceOf(ModuleLoadTimeoutError);
  });
});

describe('shouldAutoReloadForStep', () => {
  const memoryStorage = () => {
    const data = new Map<string, string>();
    return {
      getItem: vi.fn((k: string) => data.get(k) ?? null),
      setItem: vi.fn((k: string, v: string) => void data.set(k, v)),
    };
  };

  it('reloads once per step, so a broken file cannot cause a reload loop', () => {
    const storage = memoryStorage();
    expect(shouldAutoReloadForStep('personal-data', storage)).toBe(true);
    expect(shouldAutoReloadForStep('personal-data', storage)).toBe(false);
  });

  it('counts each step separately', () => {
    const storage = memoryStorage();
    expect(shouldAutoReloadForStep('personal-data', storage)).toBe(true);
    expect(shouldAutoReloadForStep('kyc-documents', storage)).toBe(true);
  });

  it('does not reload when storage is blocked, because the guard would not hold', () => {
    const blocked = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    };
    expect(shouldAutoReloadForStep('personal-data', blocked)).toBe(false);
  });
});
