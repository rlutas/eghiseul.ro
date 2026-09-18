'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type AccountTabId =
  | 'services'
  | 'orders'
  | 'profile'
  | 'kyc'
  | 'addresses'
  | 'vehicles'
  | 'billing';

export interface AccountNavItem {
  id: AccountTabId;
  label: string;
  labelShort: string;
  icon: LucideIcon;
  /** Small count or status shown next to the label. */
  badge?: string;
}

interface AccountNavProps {
  primary: AccountNavItem[];
  secondary: AccountNavItem[];
  active: AccountTabId;
  onSelect: (id: AccountTabId) => void;
  className?: string;
  /** Render only one half. Unused since 18.09.2026 — both halves sit above
   *  the content on every screen — kept for a caller that wants the split. */
  only?: 'primary' | 'secondary';
}

/**
 * Navigation for the account area.
 *
 * Replaces a strip of seven equal tabs that scrolled sideways on a phone — which
 * flattened "comandă ceva" and "codul meu de TVA" onto the same level, hid
 * whatever did not fit, and sat next to a second, separate sidebar of actions.
 *
 * Two changes, both from the platform guidance: primary destinations are
 * separated from the profile data behind them (`nav-hierarchy`), and the shape
 * adapts instead of scrolling (`adaptive-navigation`) — a vertical list from lg
 * up, two big buttons plus a labelled grid below on a phone. Every target is at
 * least 44px and every item carries icon AND text, since an icon alone is not
 * discoverable.
 */
export function AccountNav({
  primary,
  secondary,
  active,
  onSelect,
  className,
  only,
}: AccountNavProps) {
  const showPrimary = only !== 'secondary';
  const showSecondary = only !== 'primary';

  return (
    <nav
      className={cn('lg:sticky lg:top-24', className)}
      aria-label={only === 'secondary' ? 'Datele mele' : 'Navigare cont'}
    >
      {showPrimary && (
        /* Primary: the two reasons someone opens this page. */
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {primary.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={active === item.id}
              onSelect={onSelect}
              emphasis
            />
          ))}
        </div>
      )}

      {showSecondary && (
        <>
          <p
            className={cn(
              'mb-2 px-1 text-xs font-bold uppercase tracking-wider text-neutral-400',
              showPrimary ? 'mt-5' : 'mt-0'
            )}
          >
            Datele mele
          </p>

          {/* Secondary: reference data, reached occasionally. Two columns on a
              phone so all five stay visible without scrolling anything. */}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {secondary.map((item) => (
              <NavButton key={item.id} item={item} isActive={active === item.id} onSelect={onSelect} />
            ))}
          </div>
        </>
      )}
    </nav>
  );
}

function NavButton({
  item,
  isActive,
  onSelect,
  emphasis = false,
}: {
  item: AccountNavItem;
  isActive: boolean;
  onSelect: (id: AccountTabId) => void;
  emphasis?: boolean;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group flex min-h-[52px] w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left',
        'transition-colors duration-200 motion-reduce:transition-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        isActive
          ? 'bg-secondary-900 text-white shadow-sm'
          : emphasis
            ? 'bg-white border border-neutral-200 text-secondary-900 hover:border-primary-300 hover:bg-primary-50/60'
            : 'text-neutral-600 hover:bg-white hover:text-secondary-900'
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
          isActive
            ? 'bg-white/15 text-primary-400'
            : 'bg-primary-50 text-primary-600 group-hover:bg-primary-100'
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
        <span className="lg:hidden">{item.labelShort}</span>
        <span className="hidden lg:inline">{item.label}</span>
      </span>

      {item.badge && (
        <span
          className={cn(
            'flex-shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
            isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
          )}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}
