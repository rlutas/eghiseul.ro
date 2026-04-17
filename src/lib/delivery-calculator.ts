/**
 * Delivery Time Calculator (eghiseul.ro)
 *
 * Calculates estimated delivery / completion dates for orders based on:
 *  - Service `estimated_days` (business days for issuance/processing)
 *  - Per-option time impact (`service_options.config.delivery_days_reduction`
 *    or an explicit `deliveryDaysImpact` number passed in)
 *  - Courier transit time (DHL, Fan, Sameday, Posta, ...)
 *  - Romanian public holidays 2026-2028 (Codul Muncii art. 139 + Legea 220/2023)
 *  - 12:00 Europe/Bucharest noon cutoff (orders placed at or after noon start
 *    processing next business day)
 *
 * This supersedes the naive helpers in `src/lib/services/courier/utils.ts`
 * (`calculateEstimatedDelivery`, `isBusinessDay`). Those older helpers don't
 * account for holidays or the noon cutoff and should be migrated to use this
 * module when touched.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type CourierCode = 'dhl' | 'fan' | 'fancourier' | 'sameday' | 'posta' | 'posta_romana'

export type UrgencyMode = 'standard' | 'urgent' | 'strain'

/**
 * A single processing / delivery stage contributing business days to the ETA.
 */
export interface DeliveryStep {
  step: string
  minDays: number
  maxDays: number
}

/**
 * Input for a delivery estimate.
 *
 * Provide EITHER `baseDays` (preferred — pulled from `services.estimated_days`)
 * OR `urgency` (legacy mapping when no service record is available).
 */
export interface DeliveryEstimateParams {
  /** Business days for the core service processing (from `services.estimated_days`). */
  baseDays?: number
  /** Legacy urgency mode — used only when `baseDays` is not provided. */
  urgency?: UrgencyMode
  /** Selected service options with their time impact in business days. */
  options?: Array<{
    name: string
    /** Extra business days this option adds. Read from
     *  `service_options.config.delivery_days_reduction` (negative = reduction).
     *  Positive values add days, negative values subtract.
     */
    deliveryDaysImpact?: number
    /** Optional explicit min/max override. */
    minDays?: number
    maxDays?: number
  }>
  /** Courier code for shipment leg. */
  courier?: CourierCode | string | null
  /** When `true` the courier leg is included even without a courier code (default). */
  includeCourierLeg?: boolean
  /** When the order was placed (defaults to "now"). */
  orderDate?: Date
}

export interface DeliveryEstimate {
  /** Aggregated minimum business days across all steps. */
  minDays: number
  /** Aggregated maximum business days across all steps. */
  maxDays: number
  /** ISO (YYYY-MM-DD) date of the earliest completion in Romania-local calendar. */
  minDate: string
  /** ISO (YYYY-MM-DD) date of the latest completion in Romania-local calendar. */
  maxDate: string
  /** ISO date when processing actually starts (post noon-cutoff + weekend/holiday skip). */
  startDate: string
  /** Per-step breakdown. */
  breakdown: DeliveryStep[]
}

// ─── Romanian Public Holidays 2026-2028 ──────────────────────────────────────

/**
 * Sărbători legale Romania per Codul Muncii art. 139 + Legea 220/2023
 * (Bobotează + Sf. Ion added starting 2024).
 * Only weekday entries actually affect business-day math — weekend entries
 * are already skipped as weekends. Romania does NOT automatically recuperate
 * holidays falling on weekends.
 *
 * Orthodox Easter dates used:
 *   2026 = Sunday April 12
 *   2027 = Sunday May 2
 *   2028 = Sunday April 16
 *
 * Pentecost (Rusalii) = Easter + 49 days.
 */
export const ROMANIAN_HOLIDAYS_2026_2028: readonly string[] = Object.freeze([
  // ─── 2026 ────────────────────────────────────────────────
  '2026-01-01', // Anul Nou (Thu)
  '2026-01-02', // Anul Nou (Fri)
  '2026-01-06', // Bobotează (Tue)
  '2026-01-07', // Sf. Ion (Wed)
  '2026-01-24', // Ziua Unirii (Sat)
  '2026-04-10', // Vinerea Mare (Fri)
  '2026-04-13', // Lunea Paștilor (Mon — Easter = Sun Apr 12)
  '2026-05-01', // Ziua Muncii (Fri)
  '2026-06-01', // Ziua Copilului + Rusalii Lunea (Mon — both coincide)
  '2026-08-15', // Adormirea Maicii Domnului (Sat)
  '2026-11-30', // Sf. Andrei (Mon)
  '2026-12-01', // Ziua Națională (Tue)
  '2026-12-25', // Crăciun (Fri)
  '2026-12-26', // Crăciun (Sat)
  // ─── 2027 ────────────────────────────────────────────────
  '2027-01-01', // Anul Nou (Fri)
  '2027-01-02', // Anul Nou (Sat)
  '2027-01-06', // Bobotează (Wed)
  '2027-01-07', // Sf. Ion (Thu)
  '2027-01-24', // Ziua Unirii (Sun)
  '2027-04-30', // Vinerea Mare (Fri)
  '2027-05-01', // Ziua Muncii (Sat)
  '2027-05-03', // Lunea Paștilor (Mon — Easter = Sun May 2)
  '2027-06-01', // Ziua Copilului (Tue)
  '2027-06-21', // Rusalii Lunea (Mon — Pentecost = Sun Jun 20)
  '2027-08-15', // Adormirea (Sun)
  '2027-11-30', // Sf. Andrei (Tue)
  '2027-12-01', // Ziua Națională (Wed)
  '2027-12-25', // Crăciun (Sat)
  '2027-12-26', // Crăciun (Sun)
  // ─── 2028 ────────────────────────────────────────────────
  '2028-01-01', // Anul Nou (Sat)
  '2028-01-02', // Anul Nou (Sun)
  '2028-01-06', // Bobotează (Thu)
  '2028-01-07', // Sf. Ion (Fri)
  '2028-01-24', // Ziua Unirii (Mon)
  '2028-04-14', // Vinerea Mare (Fri)
  '2028-04-17', // Lunea Paștilor (Mon — Easter = Sun Apr 16)
  '2028-05-01', // Ziua Muncii (Mon)
  '2028-06-01', // Ziua Copilului (Thu)
  '2028-06-05', // Rusalii Lunea (Mon — Pentecost = Sun Jun 4)
  '2028-08-15', // Adormirea (Tue)
  '2028-11-30', // Sf. Andrei (Thu)
  '2028-12-01', // Ziua Națională (Fri)
  '2028-12-25', // Crăciun (Mon)
  '2028-12-26', // Crăciun (Tue)
])

const HOLIDAY_SET: ReadonlySet<string> = new Set(ROMANIAN_HOLIDAYS_2026_2028)
const LATEST_HOLIDAY_YEAR = 2028

// ─── Timezone-aware Date Helpers (Europe/Bucharest) ──────────────────────────

/**
 * Server runs in UTC on Vercel. We must use Romania-local calendar dates and
 * Romania-local wall-clock hour when applying the noon cutoff, otherwise
 * orders placed mid-afternoon Romania time (= morning UTC) are wrongly treated
 * as "before noon" and start processing the same day.
 */
const RO_TZ = 'Europe/Bucharest'

interface RoParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  weekday: number
}

function getRoParts(date: Date): RoParts {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: RO_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  })
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value])
  ) as Record<string, string>
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }
  return {
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
    hour: parseInt(parts.hour, 10) % 24,
    minute: parseInt(parts.minute, 10),
    weekday: weekdayMap[parts.weekday] ?? 0,
  }
}

function formatDateISOFromParts(p: { year: number; month: number; day: number }): string {
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`
}

function formatDateISO(date: Date): string {
  return formatDateISOFromParts(getRoParts(date))
}

function parseISOToUtcDate(iso: string): Date {
  return new Date(iso + 'T00:00:00Z')
}

function isHolidayISO(iso: string): boolean {
  if (process.env.NODE_ENV !== 'production') {
    const y = parseInt(iso.slice(0, 4), 10)
    if (y > LATEST_HOLIDAY_YEAR) {
      // eslint-disable-next-line no-console
      console.warn(
        `[delivery-calculator] Holiday list outdated — extend ROMANIAN_HOLIDAYS_2026_2028 for year ${y}`
      )
    }
  }
  return HOLIDAY_SET.has(iso)
}

function isWeekendISO(iso: string): boolean {
  // new Date('YYYY-MM-DD') is parsed as UTC midnight — getUTCDay gives correct weekday.
  const d = parseISOToUtcDate(iso)
  const day = d.getUTCDay()
  return day === 0 || day === 6
}

function isBusinessDayISO(iso: string): boolean {
  return !isWeekendISO(iso) && !isHolidayISO(iso)
}

function addDaysISO(iso: string, days: number): string {
  const d = parseISOToUtcDate(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return formatDateISOFromParts({
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  })
}

function addBusinessDaysISO(fromIso: string, days: number): string {
  if (days <= 0) return fromIso
  let result = fromIso
  let remaining = days
  while (remaining > 0) {
    result = addDaysISO(result, 1)
    if (isBusinessDayISO(result)) remaining--
  }
  return result
}

// ─── Public Date Helpers ─────────────────────────────────────────────────────

/**
 * Returns `true` if the given ISO date (YYYY-MM-DD) or `Date` instance is a
 * Romanian public holiday in the 2026-2028 table.
 */
export function isRomanianHoliday(date: Date | string): boolean {
  const iso = typeof date === 'string' ? date : formatDateISO(date)
  return isHolidayISO(iso)
}

/**
 * Returns `true` if the given `Date` is a business day in Romania
 * (not weekend, not a public holiday).
 */
export function isBusinessDay(date: Date): boolean {
  return isBusinessDayISO(formatDateISO(date))
}

/**
 * Adds the specified number of business days to a `Date`, skipping weekends
 * and Romanian public holidays. Returns a new `Date` at UTC midnight of the
 * resulting calendar day.
 *
 * If `count` is 0 or negative, returns the input date unchanged (normalized
 * to UTC midnight of its Romania-local calendar day).
 */
export function addBusinessDays(start: Date, count: number): Date {
  const startIso = formatDateISO(start)
  const resultIso = addBusinessDaysISO(startIso, Math.max(0, Math.floor(count)))
  return parseISOToUtcDate(resultIso)
}

// ─── Cutoff Logic (Romania-local) ────────────────────────────────────────────

const NOON_CUTOFF_HOUR = 12

/**
 * Returns the Romania-local calendar date (YYYY-MM-DD) when processing should
 * start. Orders placed at or after 12:00 Romania time, or on a non-business
 * day, start on the next business day.
 */
export function getProcessingStartISO(orderDate: Date = new Date()): string {
  const p = getRoParts(orderDate)
  const todayIso = formatDateISOFromParts(p)
  if (p.hour >= NOON_CUTOFF_HOUR || !isBusinessDayISO(todayIso)) {
    // Advance to next business day (skipping today even if today was a holiday).
    return addBusinessDaysISO(todayIso, 1)
  }
  return todayIso
}

// ─── Courier Transit Times ───────────────────────────────────────────────────

function normalizeCourierCode(code: string | null | undefined): CourierCode | null {
  if (!code) return null
  const c = code.toLowerCase().replace(/\s+/g, '_')
  if (c === 'dhl') return 'dhl'
  if (c === 'fan' || c === 'fan_courier' || c === 'fancourier') return 'fan'
  if (c === 'sameday' || c === 'easybox') return 'sameday'
  if (c === 'posta' || c === 'posta_romana' || c === 'poșta' || c === 'poșta_română')
    return 'posta'
  return null
}

function getCourierStep(code: string | null | undefined): DeliveryStep | null {
  const normalized = normalizeCourierCode(code)
  switch (normalized) {
    case 'dhl':
      return { step: 'DHL Express', minDays: 1, maxDays: 3 }
    case 'fan':
      return { step: 'Fan Courier', minDays: 1, maxDays: 3 }
    case 'sameday':
      return { step: 'Sameday', minDays: 1, maxDays: 1 }
    case 'posta':
      return { step: 'Poșta Română', minDays: 7, maxDays: 15 }
    default:
      return null
  }
}

// ─── Main Calculator ─────────────────────────────────────────────────────────

/**
 * Calculates the estimated completion date range for an order.
 *
 * Flow:
 *  1. Compute processing start date (honours noon cutoff + weekend/holiday skip).
 *  2. Sum base service days (or urgency mapping).
 *  3. Add per-option business-day impact.
 *  4. Add courier transit days.
 *  5. Project min/max into calendar dates using business-day math.
 *
 * @example
 * const est = calculateEstimatedCompletion({
 *   baseDays: 3,
 *   options: [{ name: 'Traducere', deliveryDaysImpact: 2 }],
 *   courier: 'fan',
 *   orderDate: new Date('2026-05-27T09:00:00+03:00'),
 * })
 * // est.minDate / est.maxDate are YYYY-MM-DD strings
 */
export function calculateEstimatedCompletion(
  params: DeliveryEstimateParams
): DeliveryEstimate {
  const orderDate = params.orderDate ?? new Date()
  const startIso = getProcessingStartISO(orderDate)

  const breakdown: DeliveryStep[] = []

  // 1. Core processing step
  if (typeof params.baseDays === 'number' && params.baseDays > 0) {
    breakdown.push({
      step: 'Procesare',
      minDays: params.baseDays,
      maxDays: params.baseDays,
    })
  } else {
    switch (params.urgency) {
      case 'urgent':
        breakdown.push({ step: 'Procesare urgentă', minDays: 1, maxDays: 2 })
        break
      case 'strain':
        breakdown.push({ step: 'Cetățean străin', minDays: 7, maxDays: 15 })
        break
      case 'standard':
      default:
        breakdown.push({ step: 'Procesare standard', minDays: 3, maxDays: 5 })
        break
    }
  }

  // 2. Per-option impact
  if (params.options && params.options.length > 0) {
    for (const opt of params.options) {
      // Explicit min/max wins
      if (typeof opt.minDays === 'number' || typeof opt.maxDays === 'number') {
        const min = Math.max(0, opt.minDays ?? opt.maxDays ?? 0)
        const max = Math.max(min, opt.maxDays ?? opt.minDays ?? 0)
        if (max > 0) {
          breakdown.push({ step: opt.name, minDays: min, maxDays: max })
        }
        continue
      }
      const impact = opt.deliveryDaysImpact
      if (typeof impact === 'number' && impact !== 0) {
        // Positive = add, negative = subtract from the FIRST step (reduction).
        if (impact > 0) {
          breakdown.push({ step: opt.name, minDays: impact, maxDays: impact })
        } else {
          // Apply reduction to the first step (processing) without going below zero.
          const first = breakdown[0]
          if (first) {
            first.minDays = Math.max(0, first.minDays + impact)
            first.maxDays = Math.max(0, first.maxDays + impact)
          }
        }
      }
    }
  }

  // 3. Courier leg
  const includeCourier = params.includeCourierLeg ?? true
  if (includeCourier) {
    const courierStep = getCourierStep(params.courier ?? null)
    if (courierStep) breakdown.push(courierStep)
  }

  const minDays = breakdown.reduce((sum, s) => sum + s.minDays, 0)
  const maxDays = breakdown.reduce((sum, s) => sum + s.maxDays, 0)

  return {
    minDays,
    maxDays,
    startDate: startIso,
    minDate: addBusinessDaysISO(startIso, minDays),
    maxDate: addBusinessDaysISO(startIso, maxDays),
    breakdown,
  }
}
