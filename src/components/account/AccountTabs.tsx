'use client';

/**
 * AccountTabs Component
 *
 * Tab navigation for account page.
 * Tabs: Servicii | Comenzi | Profil | KYC | Adrese | Mașini | Facturare
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User,
  Shield,
  MapPin,
  CreditCard,
  Package,
  Car,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountNav, type AccountNavItem, type AccountTabId } from './AccountNav';
import ProfileTab from './ProfileTab';
import KYCTab from './KYCTab';
import AddressesTab from './AddressesTab';
import BillingTab from './BillingTab';
import OrdersTab from './OrdersTab';
import VehiclesTab from './VehiclesTab';
import ServicesTab, { type AccountServiceRow } from './ServicesTab';
import type { InterestId } from '@/lib/account/service-interests';
import { ACCOUNT_DATA_SAVED_EVENT } from './account-events';

type TabId = AccountTabId;

// The two destinations someone actually opens the account for.
const PRIMARY_ITEMS: AccountNavItem[] = [
  { id: 'services', label: 'Ce pot comanda', labelShort: 'Comandă', icon: LayoutGrid },
  { id: 'orders', label: 'Comenzile mele', labelShort: 'Comenzi', icon: Package },
];

// Reference data, reached occasionally — kept one level down instead of
// competing with the two above.
const SECONDARY_ITEMS: AccountNavItem[] = [
  { id: 'profile', label: 'Date personale', labelShort: 'Profil', icon: User },
  { id: 'kyc', label: 'Act de identitate', labelShort: 'Act identitate', icon: Shield },
  { id: 'addresses', label: 'Adrese', labelShort: 'Adrese', icon: MapPin },
  { id: 'billing', label: 'Facturare', labelShort: 'Facturare', icon: CreditCard },
  { id: 'vehicles', label: 'Mașinile mele', labelShort: 'Mașini', icon: Car },
];

interface AccountTabsProps {
  initialTab?: TabId;
  className?: string;
  /** Catalogue with per-customer readiness, computed on the server. */
  services?: AccountServiceRow[];
  /** The onboarding answer, so the identity tab does not ask for a document the
   *  customer's own services never require. */
  serviceInterests?: InterestId[];
  /** The account's welcome coupon, carried on every service link. */
  couponCode?: string | null;
}

export default function AccountTabs({ initialTab = 'services', className, services = [], serviceInterests, couponCode = null }: AccountTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabId | null;
  // The URL wins whenever it names a tab, and `handleTabChange` always writes
  // one — so this is the tab except before the first switch.
  //
  // It used to be `useState(tabFromUrl || initialTab)`, read once at mount: a
  // client-side navigation to `/account/?tab=kyc` re-rendered the page without
  // remounting this component, so the URL changed and the panel did not. Every
  // link into a tab from elsewhere on the page was silently doing nothing.
  const [fallbackTab, setFallbackTab] = useState<TabId>(initialTab);
  const activeTab = tabFromUrl || fallbackTab;

  // `?edit=1` means the customer arrived from the profile checklist, which asks
  // for one specific thing. Landing them on a read-only tab with the form still
  // behind an "Editează"/"Adaugă" button makes the checklist row look broken —
  // it was the first thing reported after it shipped. The tab opens straight
  // into the form instead.
  const autoEdit = searchParams.get('edit') === '1';
  const containerRef = useRef<HTMLDivElement>(null);

  // Every tab fetches on mount and nothing else re-reads it. When a profile
  // dialog saves, the open tab is remounted so it shows what was just saved —
  // the customer on „Facturare" who filled the billing dialog saw an empty
  // list otherwise.
  const [contentVersion, setContentVersion] = useState(0);
  useEffect(() => {
    // Only the tab that owns the saved step is remounted; a phone saved from
    // the checklist must not reload the orders list underneath.
    const TAB_FOR_STEP: Record<string, TabId[]> = {
      contact: ['profile'],
      personal: ['profile'],
      identity: ['kyc', 'profile'],
      address: ['addresses'],
      billing: ['billing'],
    };
    const bump = (event: Event) => {
      const step = (event as CustomEvent<{ step?: string }>).detail?.step;
      const owners = step ? TAB_FOR_STEP[step] : undefined;
      if (owners && !owners.includes(activeTab)) return;
      setContentVersion((v) => v + 1);
    };
    window.addEventListener(ACCOUNT_DATA_SAVED_EVENT, bump);
    return () => window.removeEventListener(ACCOUNT_DATA_SAVED_EVENT, bump);
  }, [activeTab]);

  // …and the tabs sit BELOW the checklist, so without this the page does not
  // visibly move when a row is tapped, on a phone especially.
  useEffect(() => {
    if (!autoEdit) return;
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [autoEdit, activeTab]);

  // Handle tab change
  const handleTabChange = useCallback((tabId: TabId) => {
    setFallbackTab(tabId);
    // Update URL without full navigation
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    params.delete('edit');
    // `history.replaceState`, not `router.replace`: the page is dynamic, so
    // a router navigation re-ran every query on the server for each tab tap
    // (~1 s of lag on a phone). Next's router picks the new search params up
    // from the history entry; nothing is fetched.
    window.history.replaceState(window.history.state, '', `/account/?${params.toString()}`);
    // Up to the navigation, so the menu and the panel it just switched are the
    // first thing on screen — not the middle of the page (Raul, 18.09.2026).
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    containerRef.current?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
  }, [searchParams]);

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'services':
        return <ServicesTab services={services} couponCode={couponCode} />;
      case 'profile':
        return <ProfileTab autoEdit={autoEdit} />;
      case 'kyc':
        return <KYCTab serviceInterests={serviceInterests} />;
      case 'addresses':
        return <AddressesTab autoEdit={autoEdit} />;
      case 'vehicles':
        return <VehiclesTab />;
      case 'billing':
        return <BillingTab autoEdit={autoEdit} />;
      case 'orders':
        return <OrdersTab />;
      default:
        return <ServicesTab services={services} couponCode={couponCode} />;
    }
  };

  const activeLabel =
    [...PRIMARY_ITEMS, ...SECONDARY_ITEMS].find((i) => i.id === activeTab)?.label ?? '';

  return (
    <div
      ref={containerRef}
      // `scroll-mt`: the site header is sticky, so a scroll to this element
      // has to stop under it, not behind it.
      className={cn(
        'scroll-mt-20 xl:scroll-mt-[120px] grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8',
        className
      )}
    >
      {/* From lg the whole navigation is the left column. On a phone it is
          split around the content: the switch above, the profile data below —
          otherwise a returning customer's first screen is five settings links
          and no order. */}
      <AccountNav
        primary={PRIMARY_ITEMS}
        secondary={SECONDARY_ITEMS}
        active={activeTab}
        onSelect={handleTabChange}
        className="hidden lg:block"
      />
      {/* On a phone the whole navigation sits above the content, „Datele mele"
          included (Raul, 18.09.2026 — it used to be split, with the profile
          links under the content, and a tap down there changed a panel the
          customer could not see). */}
      <AccountNav
        primary={PRIMARY_ITEMS}
        secondary={SECONDARY_ITEMS}
        active={activeTab}
        onSelect={handleTabChange}
        className="lg:hidden"
      />

      <div>
        {/* The panel names itself: on a phone the nav scrolls out of view, so
            without a heading there is nothing saying what you are looking at.
            Also gives screen readers the h2 the section was missing. */}
        <h2 className="mb-3 text-lg font-bold text-secondary-900 lg:mb-4 lg:text-xl">
          {activeLabel}
        </h2>
        <div key={contentVersion}>{renderTabContent()}</div>
      </div>
    </div>
  );
}
