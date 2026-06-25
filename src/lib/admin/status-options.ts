// Status options the admin can set from the order detail page.
// Kept in one place so the inline "Actualizează Status" card, the dropdown
// in the legacy dialog, and any future surface (bulk-edit, keyboard
// shortcut palette) all draw from the same list.

export interface StatusOption {
  value: string;
  label: string;
  group?: 'normal' | 'special' | 'terminal';
}

export const STATUS_OPTIONS: StatusOption[] = [
  // Workflow happy-path (forward transitions). Ordered the way an operator
  // walks through a typical order from payment to completion.
  { value: 'paid', label: 'Plătită', group: 'normal' },
  { value: 'processing', label: 'În procesare', group: 'normal' },
  { value: 'documents_generated', label: 'Documente generate', group: 'normal' },
  { value: 'submitted_to_institution', label: 'Trimis instituție', group: 'normal' },
  { value: 'document_received', label: 'Document primit', group: 'normal' },
  { value: 'extras_in_progress', label: 'Extras în lucru', group: 'normal' },
  { value: 'document_ready', label: 'Documentul este eliberat', group: 'normal' },
  { value: 'shipped', label: 'Expediată', group: 'normal' },
  { value: 'delivered', label: 'Livrată', group: 'normal' },
  { value: 'completed', label: 'Finalizată', group: 'normal' },
  // Special states — pause / customer-initiated cancel
  { value: 'standby', label: 'În așteptare client (SLA pauzat)', group: 'special' },
  { value: 'cancellation_requested', label: 'Anulare solicitată', group: 'special' },
  // Terminal — money side already settled
  { value: 'cancelled', label: 'Anulată', group: 'terminal' },
  { value: 'refunded', label: 'Rambursată', group: 'terminal' },
];

export function findStatusLabel(value: string): string {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
