'use client';

/**
 * AccountTabs Component
 *
 * Tab navigation for account page.
 * Tabs: Profil | KYC | Adrese | Facturare | Comenzi
 */

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User,
  Shield,
  MapPin,
  CreditCard,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileTab from './ProfileTab';
import KYCTab from './KYCTab';
import AddressesTab from './AddressesTab';
import BillingTab from './BillingTab';
import OrdersTab from './OrdersTab';

type TabId = 'profile' | 'kyc' | 'addresses' | 'billing' | 'orders';

interface Tab {
  id: TabId;
  label: string;
  labelShort: string;
  icon: typeof User;
}

const TABS: Tab[] = [
  { id: 'profile', label: 'Profil', labelShort: 'Profil', icon: User },
  { id: 'kyc', label: 'Verificare KYC', labelShort: 'KYC', icon: Shield },
  { id: 'addresses', label: 'Adrese', labelShort: 'Adrese', icon: MapPin },
  { id: 'billing', label: 'Facturare', labelShort: 'Facturare', icon: CreditCard },
  { id: 'orders', label: 'Comenzi', labelShort: 'Comenzi', icon: Package },
];

interface AccountTabsProps {
  initialTab?: TabId;
  className?: string;
}

export default function AccountTabs({ initialTab = 'profile', className }: AccountTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || initialTab);

  // Handle tab change
  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    // Update URL without full navigation
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`/account?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'kyc':
        return <KYCTab />;
      case 'addresses':
        return <AddressesTab />;
      case 'billing':
        return <BillingTab />;
      case 'orders':
        return <OrdersTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
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
