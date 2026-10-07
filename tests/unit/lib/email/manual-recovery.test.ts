import { describe, expect, it } from 'vitest';
import { renderManualRecoveryEmail, stepPhrase } from '@/lib/email/templates/manual-recovery';

const base = {
  customerFirstName: 'Ana',
  agentName: 'Maria',
  serviceName: 'Extras de Carte Funciară',
  orderNumber: 'E-261007-ABCDE',
  totalRon: 79.9,
  resumeUrl: 'https://eghiseul.ro/comanda/extras-carte-funciara?order=E-261007-ABCDE',
};

describe('renderManualRecoveryEmail', () => {
  it('names the agent and where the client stopped, with no coupon or discount', () => {
    const m = renderManualRecoveryEmail({ ...base, currentStep: 'property-data' });
    expect(m.subject).toBe('Ana, te pot ajuta să termini comanda pentru extras de carte funciară?');
    expect(m.text).toContain('Sunt Maria, din echipa');
    expect(m.text).toContain('te-ai oprit la datele imobilului');
    expect(m.html).toContain(base.resumeUrl);
    expect(m.html).not.toMatch(/cupon|reducere|coupon=/i);
  });

  it('falls back to a generic sentence for unknown steps and escapes the agent message', () => {
    const m = renderManualRecoveryEmail({ ...base, currentStep: 'ceva-nou', message: 'Revin <azi>' });
    expect(m.text).toContain('nu ai ajuns până la capăt');
    expect(m.html).toContain('Revin &lt;azi&gt;');
    expect(m.text).toContain('Revin <azi>');
  });

  it('maps known wizard steps', () => {
    expect(stepPhrase('kyc-documents')).toBe('la poza actului de identitate');
    expect(stepPhrase(null)).toBeNull();
  });
});
