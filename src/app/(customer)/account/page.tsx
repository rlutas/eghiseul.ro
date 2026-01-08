import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/shared/logout-button'
import type { Database } from '@/types/supabase'
import {
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  CreditCard,
  FileCheck,
  AlertTriangle,
  Package,
  ChevronRight,
  CheckCircle,
  Clock,
  Plus,
  Settings,
  Bell
} from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  // Fetch saved addresses (table not yet created - TODO: Sprint 4)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: savedAddresses } = await (supabase as any)
    .from('user_saved_data')
    .select('*')
    .eq('user_id', user.id)
    .eq('data_type', 'address')
    .order('is_default', { ascending: false })

  // Fetch KYC documents (table not yet created - TODO: Sprint 4)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: kycDocs } = await (supabase as any)
    .from('kyc_verifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('verified_at', { ascending: false })

  // Fetch billing profiles (table not yet created - TODO: Sprint 4)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: billingProfiles } = await (supabase as any)
    .from('billing_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })

  // Fetch user orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, friendly_order_id, status, total_price, created_at')
    .eq('user_id', user.id)
    .neq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(5)

  const firstName = profile?.first_name || user.user_metadata?.first_name || ''
  const lastName = profile?.last_name || user.user_metadata?.last_name || ''
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 text-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl md:text-3xl font-bold text-secondary-900">{initials}</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {firstName ? `Salut, ${firstName}!` : 'Contul meu'}
                </h1>
                <p className="text-white/70 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-500">{orders?.length || 0}</p>
                <p className="text-sm text-white/60">Comenzi</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-500">{kycDocs?.length || 0}</p>
                <p className="text-sm text-white/60">Documente</p>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${profile?.kyc_verified ? 'text-green-400' : 'text-yellow-400'}`}>
                  {profile?.kyc_verified ? <CheckCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                </div>
                <p className="text-sm text-white/60">KYC</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                <h3 className="font-semibold text-secondary-900">Acțiuni rapide</h3>
              </div>
              <div className="p-2">
                <Link
                  href="/servicii/cazier-judiciar-pf"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Plus className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">Comandă nouă</p>
                    <p className="text-xs text-neutral-500">Cazier, certificate, etc.</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>

                <Link
                  href="/account/settings"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">Setări cont</p>
                    <p className="text-xs text-neutral-500">Parolă, notificări</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>

                <div className="px-3 pt-3">
                  <LogoutButton />
                </div>
              </div>
            </div>

            {/* Profile Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                <h3 className="font-semibold text-secondary-900">Informații profil</h3>
                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                  Editează
                </Button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Nume complet</p>
                    <p className="font-medium text-secondary-900">
                      {firstName && lastName ? `${firstName} ${lastName}` : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Email</p>
                    <p className="font-medium text-secondary-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Telefon</p>
                    <p className="font-medium text-secondary-900">{profile?.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Verificare KYC</p>
                    <p className={`font-medium ${profile?.kyc_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {profile?.kyc_verified ? '✓ Verificat' : '○ Neverificat'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">

            {/* Orders Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">Comenzile mele</h3>
                    <p className="text-sm text-neutral-500">Ultimele comenzi plasate</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/orders">Vezi toate</Link>
                </Button>
              </div>
              <div className="p-4 md:p-6">
                {orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            order.status === 'completed' ? 'bg-green-500' :
                            order.status === 'processing' ? 'bg-blue-500' :
                            order.status === 'pending' ? 'bg-yellow-500' :
                            'bg-neutral-400'
                          }`} />
                          <div>
                            <p className="font-mono font-semibold text-secondary-900">
                              {order.friendly_order_id || `#${order.id.slice(0, 8)}`}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString('ro-RO', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              }) : '-'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-secondary-900">{order.total_price} RON</p>
                          <p className={`text-sm capitalize ${
                            order.status === 'completed' ? 'text-green-600' :
                            order.status === 'processing' ? 'text-blue-600' :
                            order.status === 'pending' ? 'text-yellow-600' :
                            'text-neutral-500'
                          }`}>
                            {order.status === 'completed' ? 'Finalizată' :
                             order.status === 'processing' ? 'În procesare' :
                             order.status === 'pending' ? 'În așteptare' :
                             order.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-neutral-600 mb-4">Nu ai încă nicio comandă</p>
                    <Button asChild className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold">
                      <Link href="/servicii/cazier-judiciar-pf">
                        <Plus className="w-4 h-4 mr-2" />
                        Plasează prima comandă
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Two Column Grid for smaller cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Saved Addresses */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-neutral-500" />
                    <h3 className="font-semibold text-secondary-900">Adrese salvate</h3>
                  </div>
                  <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded-full">
                    {savedAddresses?.length || 0}
                  </span>
                </div>
                <div className="p-4">
                  {savedAddresses && savedAddresses.length > 0 ? (
                    <div className="space-y-3">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {savedAddresses.slice(0, 2).map((addr: any) => {
                        const data = addr.data as Record<string, string>;
                        return (
                          <div key={addr.id} className="p-3 bg-neutral-50 rounded-xl">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-secondary-900 text-sm">{addr.label}</p>
                              {addr.is_default && (
                                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                  Implicit
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 line-clamp-2">
                              {data.street} {data.number}, {data.city}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-sm text-center py-4">
                      Adresele vor apărea după prima comandă
                    </p>
                  )}
                </div>
              </div>

              {/* KYC Documents */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-neutral-500" />
                    <h3 className="font-semibold text-secondary-900">Documente KYC</h3>
                  </div>
                  <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded-full">
                    {kycDocs?.length || 0}
                  </span>
                </div>
                <div className="p-4">
                  {kycDocs && kycDocs.length > 0 ? (
                    <div className="space-y-3">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {kycDocs.slice(0, 2).map((doc: any) => {
                        const isExpired = doc.expires_at && new Date(doc.expires_at) < new Date();
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                            <div>
                              <p className="font-medium text-secondary-900 text-sm capitalize">
                                {doc.document_type.replace(/_/g, ' ')}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {new Date(doc.verified_at).toLocaleDateString('ro-RO')}
                              </p>
                            </div>
                            {isExpired ? (
                              <span className="flex items-center gap-1 text-red-600 text-xs">
                                <AlertTriangle className="h-3 w-3" />
                                Expirat
                              </span>
                            ) : (
                              <span className="text-green-600 text-xs font-medium">✓ Valid</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-sm text-center py-4">
                      Documentele vor apărea după verificare
                    </p>
                  )}
                </div>
              </div>

              {/* Billing Profiles */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden md:col-span-2">
                <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-neutral-500" />
                    <h3 className="font-semibold text-secondary-900">Profile facturare</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Adaugă
                  </Button>
                </div>
                <div className="p-4">
                  {billingProfiles && billingProfiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {billingProfiles.map((bp: any) => {
                        const data = bp.billing_data as Record<string, string>;
                        return (
                          <div key={bp.id} className="p-4 bg-neutral-50 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-secondary-900">{bp.label}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  bp.type === 'persoana_fizica'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {bp.type === 'persoana_fizica' ? 'PF' : 'PJ'}
                                </span>
                                {bp.is_default && (
                                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                    Implicit
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-neutral-500">
                              {bp.type === 'persoana_juridica'
                                ? `${data.companyName} • CUI: ${data.cui}`
                                : `${data.firstName} ${data.lastName}`
                              }
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-sm text-center py-4">
                      Nu ai profile de facturare salvate
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
