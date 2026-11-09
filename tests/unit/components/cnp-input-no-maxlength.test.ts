import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * A CNP field with maxLength={13} breaks pasting: the browser cuts
 * "1850101 123456" to 13 characters before onChange strips the space, so the
 * customer is left with 12 digits and "CNP invalid" (client_error_log,
 * cnp_invalid LENGTH, 03–08.11.2026). Strip non-digits, then slice(0, 13).
 */
function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return path.endsWith('.tsx') ? [path] : [];
  });
}

describe('customer CNP inputs', () => {
  it('never use maxLength={13}', () => {
    const offenders = tsxFiles(join(process.cwd(), 'src/components')).filter((file) =>
      readFileSync(file, 'utf8').includes('maxLength={13}'),
    );
    expect(offenders).toEqual([]);
  });
});
