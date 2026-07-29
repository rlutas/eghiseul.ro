/**
 * Helpers for reasoning about a stored `orders.delivery_address`.
 *
 * The wizard persists the delivery address as a JSONB object even when the
 * client never fills it in — an email/PDF order can carry
 * `{street: '', city: '', recipientName: '', ...}`. That object is truthy, so
 * a plain `if (order.delivery_address)` check reports an address that does not
 * exist and the admin page shows a "Livrare" card with an empty address block
 * on an order that is never shipped (E-260721-VJWWN).
 */

type AddressLike = Record<string, unknown> | null | undefined;

/**
 * True when the address object carries at least one non-empty value.
 * Any field counts — street/city for a physical shipment, recipientName/phone
 * for an order where only the recipient was captured.
 */
export function hasDeliveryAddressData(address: AddressLike): boolean {
  if (!address || typeof address !== 'object') return false;
  return Object.values(address).some((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return value;
    return false;
  });
}

/**
 * True when the order needs no "Livrare" card at all: the document goes out by
 * email and nothing physical is attached to it (no real address, no courier,
 * no AWB). Showing the card in that case is pure noise — the method is already
 * on the "Detalii Serviciu" card — and its recipient fallback misleads the team
 * into thinking something must be shipped.
 */
export function isEmailOnlyDelivery(params: {
  deliveryType?: string | null;
  address: AddressLike;
  courierProvider?: string | null;
  trackingNumber?: string | null;
}): boolean {
  return (
    params.deliveryType === 'email' &&
    !hasDeliveryAddressData(params.address) &&
    !params.courierProvider &&
    !params.trackingNumber
  );
}
