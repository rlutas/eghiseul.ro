/**
 * Urmărește deschiderea unui document de către CLIENT (preview de pe pagina
 * de status / download din cont). Non-fatal: un eșec de tracking nu strică
 * niciodată servirea documentului.
 *
 * - order_documents: first/last_viewed_by_client_at + client_view_count
 * - order_history: event 'document_viewed_by_client' DOAR la prima deschidere
 *   (adminul vede în istoricul comenzii că clientul chiar a descărcat
 *   documentul livrat — ex. constatator/extras CF de la workeri).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export async function trackClientDocumentView(
  adminClient: AnyClient,
  doc: { id: string; order_id?: string; type?: string; file_name?: string | null },
  orderId: string
): Promise<void> {
  try {
    const now = new Date().toISOString();

    // Citește starea curentă (avem nevoie de count + first pentru update
    // corect; volumul e mic — un client deschide documentul de câteva ori).
    const { data: current } = await adminClient
      .from('order_documents')
      .select('first_viewed_by_client_at, client_view_count, type, file_name')
      .eq('id', doc.id)
      .single();

    const isFirstView = !current?.first_viewed_by_client_at;

    await adminClient
      .from('order_documents')
      .update({
        first_viewed_by_client_at: current?.first_viewed_by_client_at ?? now,
        last_viewed_by_client_at: now,
        client_view_count: (current?.client_view_count ?? 0) + 1,
      })
      .eq('id', doc.id);

    if (isFirstView) {
      await adminClient.from('order_history').insert({
        order_id: orderId,
        changed_by: null,
        event_type: 'document_viewed_by_client',
        new_value: {
          document_id: doc.id,
          document_type: current?.type ?? doc.type ?? null,
          file_name: current?.file_name ?? doc.file_name ?? null,
        },
        notes: `Clientul a vizualizat documentul: ${current?.file_name ?? doc.file_name ?? doc.id}`,
      });
    }
  } catch (err) {
    // Tracking-ul nu are voie să strice servirea documentului.
    console.warn('[track-client-view] failed (non-fatal):', err);
  }
}
