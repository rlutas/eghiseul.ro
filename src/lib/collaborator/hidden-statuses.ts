/**
 * Statusurile pe care colaboratorul (topograf) NU trebuie să le vadă: o
 * comandă anulată sau în curs de anulare nu e o lucrare. `payment_status`
 * devine 'refunded' abia după ce pleacă banii, deci filtrul pe plată singur
 * lasă fereastra cancellation_requested → refunded deschisă (E-260915-M4A4V:
 * topograful a identificat imobilul la 2 minute după cererea de anulare).
 */
export const COLLAB_HIDDEN_STATUSES = ['cancellation_requested', 'cancelled', 'refunded'] as const;

export function isHiddenFromCollaborator(status: string | null | undefined): boolean {
  return (COLLAB_HIDDEN_STATUSES as readonly string[]).includes(status ?? '');
}
