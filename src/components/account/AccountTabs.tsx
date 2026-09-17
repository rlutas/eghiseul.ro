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

type TabId = AccountTabId;

// The two destinations someone actually opens the account for.
const PRIMARY_ITEMS: AccountNavItem[] = [
  { id: 'services', label: 'Ce pot comanda', labelShort: 'Comandă', icon: LayoutGrid },
  { id: 'orders', label: 'Comenzile mele', labelShort: 'Comenzi', icon: Package },
];

// Reference data, reached occasionally — kept one level down instead of
// competing with the two above.
const SECONDARY_ITEMS: AccountNavItem[] = [
  { id: 'profile', label: 'Date personale', labelShort: 'Date personale', icon: User },
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
}

export default function AccountTabs({ initialTab = 'services', className, services = [], serviceInterests }: AccountTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || initialTab);

  // `?edit=1` means the customer arrived from the profile checklist, which asks
  // for one specific thing. Landing them on a read-only tab with the form still
  // behind an "Editează"/"Adaugă" button makes the checklist row look broken —
  // it was the first thing reported after it shipped. The tab opens straight
  // into the form instead.
  const autoEdit = searchParams.get('edit') === '1';
  const containerRef = useRef<HTMLDivElement>(null);

  // …and the tabs sit BELOW the checklist, so without this the page does not
  // visibly move when a row is tapped, on a phone especially.
  useEffect(() => {
    if (!autoEdit) return;
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [autoEdit, activeTab]);

  // Handle tab change
  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    // Update URL without full navigation
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    params.delete('edit');
    router.replace(`/account?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'services':
        return <ServicesTab services={services} />;
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
        return <ServicesTab services={services} />;
    }
  };

  const activeLabel =
    [...PRIMARY_ITEMS, ...SECONDARY_ITEMS].find((i) => i.id === activeTab)?.label ?? '';

  return (
    <div
      ref={containerRef}
      className={cn('grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8', className)}
    >
      <AccountNav
        primary={PRIMARY_ITEMS}
        secondary={SECONDARY_ITEMS}
        active={activeTab}
        onSelect={handleTabChange}
      />

      <div>
        {/* The panel names itself: on a phone the nav scrolls out of view, so
            without a heading there is nothing saying what you are looking at.
            Also gives screen readers the h2 the section was missing. */}
        <h2 className="mb-3 text-lg font-bold text-secondary-900 lg:mb-4 lg:text-xl">
          {activeLabel}
        </h2>
        {renderTabContent()}
      </div>
    </div>
  );
}
