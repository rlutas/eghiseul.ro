/**
 * Când primirea unui AWB trebuie să treacă automat comanda pe „expediată".
 *
 * Generarea automată de AWB (Fan/Sameday) seta deja `shipped`; AWB-ul introdus
 * manual (DHL, Poșta, sau emis din contul curierului) nu — comenzile rămâneau
 * în starea veche deși coletul plecase, iar echipa le muta de mână.
 *
 * Listă NEAGRĂ, nu albă: stările „moarte" (ciornă/abandonat/anulat/rambursat)
 * și cele de la sau după expediere nu se ating; orice altă stare de lucru
 * devine `shipped`. O listă albă ar rata stările adăugate ulterior și ar bloca
 * tăcut tranziția — exact regresia din 21.07 cu secțiunea „Procesare comandă",
 * care dispărea pe standby/traducere.
 */

/** Stări din care un AWB NU declanșează trecerea pe `shipped`. */
export const NON_SHIPPABLE_STATUSES = [
  // moarte: coletul n-are ce pleca
  'draft',
  'abandoned',
  'cancelled',
  'refunded',
  // deja la/după expediere: nu retrogradăm și nu re-logăm
  'shipped',
  'completed',
] as const;

export function shouldMarkShippedOnAwb(status: string | null | undefined): boolean {
  if (!status) return false;
  return !(NON_SHIPPABLE_STATUSES as readonly string[]).includes(status);
}
