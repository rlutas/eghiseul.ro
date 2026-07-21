/**
 * Etichete lizibile pentru pașii din wizard (câmpul `orders.current_step` de pe
 * draft) — folosite în admin ca să vadă „unde s-a blocat clientul".
 * Valorile sunt stepId-urile din `modular-wizard-provider`.
 */
export const STEP_LABELS: Record<string, string> = {
  'contact': 'Contact',
  'client-type': 'Tip client',
  'personal-data': 'Date personale',
  'company-kyc': 'Date firmă',
  'civil-status': 'Stare civilă',
  'constatator': 'Date constatator',
  'property': 'Date imobil',
  'vehicle': 'Date vehicul',
  'options': 'Opțiuni',
  'delivery': 'Livrare',
  'billing': 'Facturare',
  'signature': 'Semnătură',
  'review': 'Verificare',
};

export function stepLabel(id: string | null | undefined): string {
  if (!id) return '—';
  return STEP_LABELS[id] || id;
}
