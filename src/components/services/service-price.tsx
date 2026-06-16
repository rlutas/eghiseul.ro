/**
 * Service hero price block. `basePrice` is the VAT-inclusive total (as stored in
 * services.base_price). We show the ex-VAT amount as the headline (more
 * attractive — looks smaller) and the total cu TVA below.
 */
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));

export function ServicePrice({ basePrice }: { basePrice: number | string }) {
  const withVat = Number(basePrice) || 0;
  const exVat = Math.round((withVat / 1.21) * 100) / 100;
  return (
    <>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-5xl lg:text-6xl font-black text-white">{fmt(exVat)}</span>
        <span className="text-xl font-bold text-white/70">RON</span>
      </div>
      <p className="text-white/70 text-sm mt-2">
        + TVA 21% · <span className="font-semibold text-white">{fmt(withVat)} RON</span> cu TVA
      </p>
    </>
  );
}
