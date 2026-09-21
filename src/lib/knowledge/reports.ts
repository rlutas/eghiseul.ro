import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ChatAudience } from './chat-context';

/** Tabelele din migrarea 184 nu sunt în tipul `Database` generat; convenția proiectului. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function knowledgeDb(): SupabaseClient<any, any, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createAdminClient() as unknown as SupabaseClient<any, any, any>;
}

/**
 * Rapoartele din Ghid: probleme, sugestii și întrebările la care chatbotul nu
 * a găsit răspuns. Le vede Raul în /admin/ghid/rapoarte și le închide.
 */
export const REPORT_KINDS = ['problema', 'sugestie', 'intrebare-fara-raspuns'] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];
export const REPORT_STATUSES = ['nou', 'in_lucru', 'rezolvat'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_KIND_LABEL: Record<ReportKind, string> = {
  problema: 'Problemă',
  sugestie: 'Sugestie',
  'intrebare-fara-raspuns': 'Întrebare fără răspuns',
};
export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  nou: 'Nou',
  in_lucru: 'În lucru',
  rezolvat: 'Rezolvat',
};

export interface KnowledgeReport {
  id: string;
  created_at: string;
  updated_at: string;
  reporter_id: string | null;
  reporter_role: string | null;
  reporter_email: string | null;
  audience: ChatAudience;
  kind: ReportKind;
  message: string;
  context: { page?: string; question?: string; answer?: string; orderNumber?: string; chatLogId?: string | null };
  status: ReportStatus;
  resolution_note: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

export function isReportKind(v: unknown): v is ReportKind {
  return typeof v === 'string' && (REPORT_KINDS as readonly string[]).includes(v);
}
export function isReportStatus(v: unknown): v is ReportStatus {
  return typeof v === 'string' && (REPORT_STATUSES as readonly string[]).includes(v);
}

export async function createReport(input: {
  reporter: { id: string; role: string; email: string | null };
  audience: ChatAudience;
  kind: ReportKind;
  message: string;
  context?: KnowledgeReport['context'];
}): Promise<string> {
  const admin = knowledgeDb();
  const { data, error } = await admin
    .from('knowledge_reports')
    .insert({
      reporter_id: input.reporter.id,
      reporter_role: input.reporter.role,
      reporter_email: input.reporter.email,
      audience: input.audience,
      kind: input.kind,
      message: input.message.trim().slice(0, 4000),
      context: input.context ?? {},
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function listReports(opts: { limit?: number } = {}): Promise<KnowledgeReport[]> {
  const admin = knowledgeDb();
  const { data, error } = await admin
    .from('knowledge_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 300);
  if (error) throw new Error(error.message);
  return (data ?? []) as KnowledgeReport[];
}

export async function countOpenReports(): Promise<number> {
  const admin = knowledgeDb();
  const { count } = await admin
    .from('knowledge_reports')
    .select('id', { count: 'exact', head: true })
    .neq('status', 'rezolvat');
  return count ?? 0;
}

export async function updateReportStatus(input: {
  id: string;
  status: ReportStatus;
  note?: string | null;
  by: string;
}): Promise<void> {
  const admin = knowledgeDb();
  const resolved = input.status === 'rezolvat';
  const { error } = await admin
    .from('knowledge_reports')
    .update({
      status: input.status,
      resolution_note: input.note?.trim().slice(0, 4000) || null,
      resolved_at: resolved ? new Date().toISOString() : null,
      resolved_by: resolved ? input.by : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id);
  if (error) throw new Error(error.message);
}
