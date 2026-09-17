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
import ProfileTab from './ProfileTab';
import KYCTab from './KYCTab';
import AddressesTab from './AddressesTab';
import BillingTab from './BillingTab';
import OrdersTab from './OrdersTab';
import VehiclesTab from './VehiclesTab';
import ServicesTab, { type AccountServiceRow } from './ServicesTab';

type TabId = 'services' | 'orders' | 'profile' | 'kyc' | 'addresses' | 'vehicles' | 'billing';

interface Tab {
  id: TabId;
  label: string;
  labelShort: string;
  icon: typeof User;
}

// Order matters: the tab strip scrolls horizontally on a phone, so the two
// things a customer actually comes for — ordering something and checking an
// order — must be reachable without scrolling it.
const TABS: Tab[] = [
  { id: 'services', label: 'Ce pot comanda', labelShort: 'Servicii', icon: LayoutGrid },
  { id: 'orders', label: 'Comenzi', labelShort: 'Comenzi', icon: Package },
  { id: 'profile', label: 'Profil', labelShort: 'Profil', icon: User },
  { id: 'kyc', label: 'Verificare KYC', labelShort: 'KYC', icon: Shield },
  { id: 'addresses', label: 'Adrese', labelShort: 'Adrese', icon: MapPin },
  { id: 'vehicles', label: 'Mașinile mele', labelShort: 'Mașini', icon: Car },
  { id: 'billing', label: 'Facturare', labelShort: 'Facturare', icon: CreditCard },
];

interface AccountTabsProps {
  initialTab?: TabId;
  className?: string;
  /** Catalogue with per-customer readiness, computed on the server. */
  services?: AccountServiceRow[];
}

export default function AccountTabs({ initialTab = 'services', className, services = [] }: AccountTabsProps) {
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
        return <KYCTab />;
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

  return (
    <div ref={containerRef} className={cn('space-y-6', className)}>
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-1.5">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap flex-1 justify-center',
                  isActive
                    ? 'bg-primary-500 text-secondary-900 shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-secondary-900'
                )}
              >
                <Icon className={cn(
                  'w-4 h-4',
                  isActive ? 'text-secondary-900' : 'text-neutral-400'
                )} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.labelShort}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
}
