import { CURRENCY_NAMES } from '@/lib/bnr';

const MONTHS_RO = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${parseInt(d, 10)} ${MONTHS_RO[parseInt(m, 10) - 1]}`;
}
const nf = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

/**
 * Grafic SVG (server) cu evoluția cursului BNR pentru o valută pe ultimele zile.
 * Fără librărie — coordonate calculate direct din serie.
 */
export function CursChart({ code, dates, values }: { code: string; dates: string[]; values: number[] }) {
  if (values.length < 2) return null;

  const W = 640;
  const H = 260;
  const padX = 46;
  const padTop = 30;
  const padBottom = 38;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (i: number) => padX + (i / (values.length - 1)) * innerW;
  const y = (v: number) => padTop + (1 - (v - min) / range) * innerH;

  const linePts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const areaPts = `${padX},${padTop + innerH} ${linePts} ${x(values.length - 1).toFixed(1)},${padTop + innerH}`;
  const up = values[values.length - 1] >= values[0];
  const lineColor = up ? '#16a34a' : '#dc2626';
  const gridYs = [0, 0.5, 1].map((t) => ({ v: min + t * range, yy: padTop + (1 - t) * innerH }));

  return (
    <figure className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
      <figcaption className="text-sm font-bold text-secondary-900 mb-2">
        Evoluție curs {CURRENCY_NAMES[code] ?? code} ({code}) — ultimele {values.length} zile
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Grafic evoluție curs ${code}`}>
        {/* gridlines + y labels */}
        {gridYs.map((g, i) => (
          <g key={i}>
            <line x1={padX} y1={g.yy} x2={W - padX} y2={g.yy} stroke="#f1f1f1" strokeWidth="1" />
            <text x={padX - 8} y={g.yy + 3} textAnchor="end" fontSize="10" fill="#9ca3af">
              {nf.format(g.v)}
            </text>
          </g>
        ))}
        {/* area + line */}
        <polygon points={areaPts} fill={lineColor} fillOpacity="0.08" />
        <polyline points={linePts} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" />
        {/* points + value labels (colored vs previous) */}
        {values.map((v, i) => {
          const prev = i > 0 ? values[i - 1] : v;
          const c = i === 0 ? '#475569' : v >= prev ? '#16a34a' : '#dc2626';
          const above = i % 2 === 0;
          return (
            <g key={i}>
              <circle cx={x(i)} cy={y(v)} r="2.5" fill={lineColor} />
              <text
                x={x(i)}
                y={y(v) + (above ? -9 : 16)}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="700"
                fill={c}
              >
                {nf.format(v)}
              </text>
            </g>
          );
        })}
        {/* x date labels */}
        {dates.map((d, i) => (
          <text key={i} x={x(i)} y={H - 14} textAnchor="middle" fontSize="10" fill="#9ca3af">
            {shortDate(d)}
          </text>
        ))}
      </svg>
    </figure>
  );
}
