'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isPhoneOrderMode } from '@/providers/modular-wizard-provider';
import {
  describeSavedAddress,
  usableSavedAddresses,
  type SavedDeliveryAddress,
} from '@/lib/delivery/saved-address';

/**
 * Prefill din adresele salvate ale userului logat (livrare în România).
 * Same shape as SavedVehiclePicker: a suggestion above the form, never a lock —
 * nothing is applied until the customer picks, and every field stays editable.
 */
export function SavedAddressPicker({
  onPick,
}: {
  onPick: (address: SavedDeliveryAddress) => void;
}) {
  const [addresses, setAddresses] = useState<SavedDeliveryAddress[]>([]);

  useEffect(() => {
    // Mod telefonic: contul logat e al operatorului, comanda e a clientului de
    // la telefon — același motiv pentru care PREFILL_FROM_PROFILE nu face nimic.
    if (isPhoneOrderMode()) return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // guest — nimic
      try {
        const res = await fetch('/api/user/addresses');
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data)) {
          setAddresses(usableSavedAddresses(json.data));
        }
      } catch {
        /* silent */
      }
    })();
    return () => { active = false; };
  }, []);

  if (addresses.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-3">
      <label className="text-sm font-medium text-secondary-900 flex items-center gap-1.5 mb-1.5">
        <MapPin className="h-4 w-4 text-primary-600" /> Folosește o adresă salvată
      </label>
      <select
        defaultValue=""
        onChange={(e) => {
          const address = addresses.find((a) => a.id === e.target.value);
          if (address) onPick(address);
        }}
        className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base sm:text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      >
        <option value="">— Alege din adresele mele —</option>
        {addresses.map((address) => (
          <option key={address.id} value={address.id}>
            {describeSavedAddress(address)}
          </option>
        ))}
      </select>
      <p className="text-[11px] text-neutral-500 mt-1">Adresa se completează automat; o poți edita mai jos.</p>
    </div>
  );
}
