import { describe, expect, it } from 'vitest';
import { teamNotesForCollaborator, type HistoryNoteRow } from '@/lib/collaborator/team-notes';

const row = (over: Partial<HistoryNoteRow>): HistoryNoteRow => ({
  event_type: 'note_added',
  changed_by: 'operator@example.com',
  notes: 'adresa imobilului este Str. Exemplu nr. 1',
  created_at: '2026-08-28T07:34:45Z',
  ...over,
});

describe('teamNotesForCollaborator', () => {
  it('shows a team note as „Echipa", never the staff email', () => {
    const [n] = teamNotesForCollaborator([row({})]);
    expect(n.author).toBe('Echipa');
    expect(n.mine).toBe(false);
    expect(JSON.stringify(n)).not.toContain('example.com');
  });

  it('marks his own notes and status notes as „Tu"', () => {
    const notes = teamNotesForCollaborator([
      row({ changed_by: 'colaborator: Topograf', notes: 'lipsă adresa', created_at: '2026-08-28T10:47:00Z' }),
      row({ event_type: 'status_changed', changed_by: 'colaborator: Topograf', notes: 'pus în așteptare', created_at: '2026-08-28T10:48:00Z' }),
    ]);
    expect(notes.map((n) => n.author)).toEqual(['Tu', 'Tu']);
  });

  it('leaves out client-message echoes, empty notes and system status changes', () => {
    const notes = teamNotesForCollaborator([
      row({ notes: 'Mesaj trimis clientului: Bună ziua' }),
      row({ notes: 'Mesaj de la client: am trimis actul' }),
      row({ notes: '   ' }),
      row({ event_type: 'status_changed', changed_by: null, notes: 'auto' }),
      row({ event_type: 'document_generated', notes: 'contract' }),
    ]);
    expect(notes).toEqual([]);
  });

  it('keeps automatic system notes, labelled „Sistem"', () => {
    const [n] = teamNotesForCollaborator([row({ changed_by: null, notes: 'Cost eliberare 100 lei înregistrat automat' })]);
    expect(n.author).toBe('Sistem');
  });

  it('lists the newest first', () => {
    const notes = teamNotesForCollaborator([
      row({ notes: 'vechi', created_at: '2026-08-01T00:00:00Z' }),
      row({ notes: 'nou', created_at: '2026-11-19T00:00:00Z' }),
    ]);
    expect(notes.map((n) => n.text)).toEqual(['nou', 'vechi']);
  });
});
