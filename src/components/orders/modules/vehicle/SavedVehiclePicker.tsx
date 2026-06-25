'use client';

import { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SavedVehicle {
  id: string;
  label: string | null;
  plate_number: string;
  vin: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  driving_license: string | null;
}

/** Prefill din mașinile salvate ale userului logat (cazier auto / rovinietă). */
export function SavedVehiclePicker({
  onPick,
}: {
  onPick: (v: {
    plateNumber: string; vin?: string; brand?: string; model?: string;
    year?: number; drivingLicense?: string;
  }) => void;
}) {
  const [vehicles, setVehicles] = useState<SavedVehicle[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // guest — nimic
      try {
        const res = await fetch('/api/user/vehicles');
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data)) setVehicles(json.data);
      } catch {
        /* silent */
      }
    })();
    return () => { active = false; };
  }, []);

  if (vehicles.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-3">
      <label className="text-sm font-medium text-secondary-900 flex items-center gap-1.5 mb-1.5">
        <Car className="h-4 w-4 text-primary-600" /> Folosește o mașină salvată
      </label>
      <select
        defaultValue=""
        onChange={(e) => {
          const v = vehicles.find((x) => x.id === e.target.value);
          if (!v) return;
          onPick({
            plateNumber: v.plate_number,
            vin: v.vin ?? undefined,
            brand: v.brand ?? undefined,
            model: v.model ?? undefined,
            year: v.year ?? undefined,
            drivingLicense: v.driving_license ?? undefined,
          });
        }}
        className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base sm:text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      >
        <option value="">— Alege din mașinile mele —</option>
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.plate_number}{v.label ? ` (${v.label})` : ''}{v.brand ? ` — ${v.brand} ${v.model ?? ''}` : ''}
          </option>
        ))}
      </select>
      <p className="text-[11px] text-neutral-500 mt-1">Datele se completează automat; le poți edita mai jos.</p>
    </div>
  );
}
