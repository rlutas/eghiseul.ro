/**
 * The order notes the collaborator sees on his order page (decision Raul,
 * 23.11.2026): everything the team wrote on the order, plus his own notes.
 * Before this the portal never read `order_history`, so data the team noted
 * (an address, the owner's CNP) never reached him — E-260813-LEWDD waited
 * three months for an address noted three hours before he asked for it.
 *
 * Messages to and from the client are left out: they already show in the
 * messages thread. Staff emails are never shown, only „Echipa".
 */
export interface HistoryNoteRow {
  event_type: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface CollaboratorNote {
  author: string;
  mine: boolean;
  text: string;
  createdAt: string;
}

const MESSAGE_ECHO = /^Mesaj (trimis clientului|de la client)/;

export function teamNotesForCollaborator(rows: HistoryNoteRow[]): CollaboratorNote[] {
  const out: CollaboratorNote[] = [];
  for (const r of rows) {
    const text = (r.notes ?? '').trim();
    if (!text) continue;
    if (r.event_type !== 'note_added' && r.event_type !== 'status_changed') continue;
    if (MESSAGE_ECHO.test(text)) continue;
    const by = r.changed_by ?? '';
    // A status change carries a note only when someone typed one; the system
    // ones (null author) are noise here.
    if (r.event_type === 'status_changed' && !by) continue;
    const mine = by.startsWith('colaborator:');
    out.push({
      author: mine ? 'Tu' : by ? 'Echipa' : 'Sistem',
      mine,
      text,
      createdAt: r.created_at,
    });
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
