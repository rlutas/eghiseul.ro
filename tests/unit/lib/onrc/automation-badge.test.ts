import { describe, expect, it } from 'vitest';
import { onrcAutomationBadge } from '@/lib/onrc/automation-badge';

describe('onrcAutomationBadge', () => {
  it('returns null when the order has no ONRC job', () => {
    expect(onrcAutomationBadge(null)).toBeNull();
    expect(onrcAutomationBadge(undefined)).toBeNull();
  });

  it('flags FAILED as a red manual-action badge carrying the error', () => {
    const b = onrcAutomationBadge({ status: 'FAILED', error_message: 'browserType.launch: boom' });
    expect(b).toEqual({
      tone: 'error',
      label: 'ONRC automat eșuat — manual',
      title: 'browserType.launch: boom',
    });
  });

  it('flags NEEDS_OPERATOR as manual action too', () => {
    const b = onrcAutomationBadge({ status: 'NEEDS_OPERATOR', error_message: null });
    expect(b?.tone).toBe('error');
    expect(b?.label).toBe('ONRC automat eșuat — manual');
    expect(b?.title).toMatch(/operator/i);
  });

  it('shows in-progress states as an informational badge', () => {
    for (const status of ['PENDING', 'PROCESSING', 'AWAITING_DOCUMENT'] as const) {
      const b = onrcAutomationBadge({ status, error_message: null });
      expect(b?.tone).toBe('info');
      expect(b?.label).toBe('ONRC automat în lucru');
    }
  });

  it('returns null for DONE (the document is already on the order)', () => {
    expect(onrcAutomationBadge({ status: 'DONE', error_message: null })).toBeNull();
  });
});
