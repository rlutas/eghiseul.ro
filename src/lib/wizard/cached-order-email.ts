/** The contact email in this browser's local copy of a draft, if there is one. */
export function cachedEmailForOrder(friendlyOrderId: string | null, storage: Storage = localStorage): string | null {
  if (!friendlyOrderId) return null;
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key?.startsWith('order_draft_')) continue;
      const cached = JSON.parse(storage.getItem(key) || 'null');
      if (cached?.friendlyOrderId === friendlyOrderId) return cached?.data?.contact?.email || null;
    }
  } catch {
    // storage blocked or a damaged copy: the draft restores from the local path instead
  }
  return null;
}
