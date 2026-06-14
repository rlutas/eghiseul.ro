/**
 * Best-effort chronological activity log for the ONRC automation, shown in the
 * admin (/admin/onrc). Never throws — logging must not break the queue flow.
 */
 
export async function logOnrcEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  jobId: string,
  type: string,
  message?: string,
  orderId?: string | null
): Promise<void> {
  try {
    await supabase.from('onrc_job_events').insert({
      job_id: jobId,
      order_id: orderId ?? null,
      type,
      message: message ?? null,
    });
  } catch {
    /* logging is best-effort */
  }
}
