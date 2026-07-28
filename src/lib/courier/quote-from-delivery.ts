/**
 * Cotația curierului dedusă din `orders.delivery_method`, pentru comenzile la
 * care coloana `courier_quote` nu e completată.
 *
 * ⚠️ De ce există: până pe 28.07.2026 lockerul ales de client (easybox/fanbox)
 * nu se salva NICĂIERI — nici în `courier_quote`, nici pe `delivery_method`.
 * Sameday cere `oohLastMile` = id-ul lockerului la emiterea AWB-ului, deci
 * generarea pica pentru toate comenzile în locker. Numele lockerului a
 * supraviețuit doar în denumirea afișată: „… EasyBox (easybox Kripton)".
 */
export function extractCourierQuote(
  deliveryMethod:
    | {
        type?: string;
        name?: string;
        service?: string | null;
        locker_id?: string | null;
        locker_name?: string | null;
        locker_address?: string | null;
      }
    | null
): { service?: string; lockerId?: string; lockerName?: string; lockerAddress?: string } | null {
  if (!deliveryMethod) return null;

  const name = (deliveryMethod.name || '').toLowerCase();

  // Lockerul salvat pe delivery_method (comenzi de după 28.07.2026). Numele
  // afișat conține lockerul între paranteze — „… EasyBox (easybox Kripton)" —
  // deci îl recuperăm și pentru comenzile mai vechi, ca operatorul să vadă
  // măcar CE locker a ales clientul chiar dacă id-ul lipsește.
  const nameInParens = deliveryMethod.name?.match(/\(([^)]+)\)\s*$/)?.[1]?.trim();
  const locker = {
    ...(deliveryMethod.locker_id ? { lockerId: deliveryMethod.locker_id } : {}),
    ...(deliveryMethod.locker_name || nameInParens
      ? { lockerName: deliveryMethod.locker_name || nameInParens }
      : {}),
    ...(deliveryMethod.locker_address ? { lockerAddress: deliveryMethod.locker_address } : {}),
  };

  // Serviciul: întâi cel salvat, altfel dedus din denumirea afișată.
  const service =
    deliveryMethod.service ||
    (name.includes('fanbox')
      ? 'FANbox'
      : name.includes('easybox')
        ? 'LOCKER_NEXTDAY'
        : name.includes('standard 24h')
          ? 'STANDARD_24H'
          : name.includes('standard')
            ? 'Standard'
            : undefined);

  if (!service && !Object.keys(locker).length) return null;
  return { ...(service ? { service } : {}), ...locker };
}
