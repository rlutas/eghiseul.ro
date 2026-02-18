'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Package,
  Truck,
  CreditCard,
  Settings,
  RefreshCw,
  Save,
  Edit,
  Lock,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Banknote,
  Receipt,
  Trash2,
  Bell,
  Shield,
  Building2,
  Scale,
  Hash,
  Upload,
  ImageIcon,
  Loader2,
  X,
  FileText,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';
import type { NumberRangeWithStats, NumberRegistryEntry } from '@/types/number-registry';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface ServiceOption {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean | null;
  is_required: boolean | null;
  display_order: number | null;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  code: string;
  category: string;
  base_price: number;
  description: string | null;
  short_description: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  estimated_days: number | null;
  urgent_available: boolean | null;
  urgent_days: number | null;
  requires_kyc: boolean | null;
  display_order: number | null;
  processing_config?: {
    requires_lawyer?: boolean;
    document_templates?: string[];
    auto_generate_at_payment?: string[];
    manual_generate?: string[];
    numbering?: { contract?: boolean; imputernicire?: boolean };
    institution?: string;
    default_motiv?: string;
  } | null;
  created_at: string | null;
  updated_at: string | null;
  service_options: ServiceOption[];
}

interface SenderAddress {
  company: string;
  contact: string;
  phone: string;
  email: string;
  street: string;
  streetNo: string;
  city: string;
  county: string;
  postalCode: string;
}

interface BankDetails {
  iban: string;
  bank_name: string;
  account_holder: string;
}

interface Notifications {
  email_on_payment: boolean;
  email_on_shipping: boolean;
  sms_on_shipping: boolean;
}

// ──────────────────────────────────────────────────────────────
// Category labels
// ──────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  fiscal: 'Fiscal',
  judiciar: 'Judiciar',
  imobiliar: 'Imobiliar',
  auto: 'Auto',
  acte: 'Acte',
  other: 'Altele',
};

// ──────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const { hasPermission } = useAdminPermissions();
  const [activeTab, setActiveTab] = useState('services');

  if (!hasPermission('settings.manage')) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acces interzis</h2>
        <p className="text-muted-foreground max-w-md">
          Nu ai permisiunea de a gestiona setarile platformei. Contacteaza un
          administrator pentru a obtine acces.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Setari</h1>
        <p className="text-sm text-muted-foreground">
          Configurare servicii, curieri, plati si sistem
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">
            <Package className="h-4 w-4 mr-1.5" />
            Servicii
          </TabsTrigger>
          <TabsTrigger value="couriers">
            <Truck className="h-4 w-4 mr-1.5" />
            Curieri
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-1.5" />
            Plati
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 className="h-4 w-4 mr-1.5" />
            Date firma
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="h-4 w-4 mr-1.5" />
            Sistem
          </TabsTrigger>
          <TabsTrigger value="registry">
            <Hash className="h-4 w-4 mr-1.5" />
            Registru
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServicesTab />
        </TabsContent>
        <TabsContent value="couriers">
          <CouriersTab />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab />
        </TabsContent>
        <TabsContent value="company">
          <CompanyTab />
        </TabsContent>
        <TabsContent value="system">
          <SystemTab />
        </TabsContent>
        <TabsContent value="registry">
          <NumberRegistryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SERVICES TAB
// ══════════════════════════════════════════════════════════════

function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editService, setEditService] = useState<Service | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings/services');
      const json = await res.json();
      if (json.success) {
        setServices(json.data || []);
      } else {
        toast.error(json.error || 'Eroare la incarcarea serviciilor');
      }
    } catch {
      toast.error('Eroare de retea');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const toggleActive = async (service: Service) => {
    const newActive = !service.is_active;
    try {
      const res = await fetch('/api/admin/settings/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: service.id,
          updates: { is_active: newActive },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          newActive
            ? `${service.name} a fost activat`
            : `${service.name} a fost dezactivat`
        );
        setServices((prev) =>
          prev.map((s) =>
            s.id === service.id ? { ...s, is_active: newActive } : s
          )
        );
      } else {
        toast.error(json.error || 'Eroare');
      }
    } catch {
      toast.error('Eroare de retea');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Group by category
  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    const cat = s.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {services.length} servicii configurate
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchServices}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Reincarca
        </Button>
      </div>

      {Object.entries(grouped).map(([category, categoryServices]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {CATEGORY_LABELS[category] || category}
          </h3>
          <div className="space-y-2">
            {categoryServices.map((service) => (
              <Card key={service.id} className="py-0 gap-0">
                {/* Service header row */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-xl"
                  onClick={() =>
                    setExpandedId(
                      expandedId === service.id ? null : service.id
                    )
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {service.name}
                      </span>
                      {service.is_featured && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          Promovat
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {service.short_description || service.slug}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold tabular-nums">
                      {service.base_price} lei
                    </span>
                    <Badge
                      variant={service.is_active ? 'default' : 'secondary'}
                      className={
                        service.is_active
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-gray-100 text-gray-500'
                      }
                    >
                      {service.is_active ? 'Activ' : 'Inactiv'}
                    </Badge>
                    <Switch
                      checked={!!service.is_active}
                      onCheckedChange={() => toggleActive(service)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {expandedId === service.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === service.id && (
                  <div className="border-t px-4 py-3 space-y-3 bg-muted/10">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Categorie:
                        </span>{' '}
                        <span className="font-medium">
                          {CATEGORY_LABELS[service.category] ||
                            service.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cod:</span>{' '}
                        <span className="font-mono text-xs">
                          {service.code}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Zile estimare:
                        </span>{' '}
                        <span className="font-medium">
                          {service.estimated_days ?? '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">KYC:</span>{' '}
                        <span className="font-medium">
                          {service.requires_kyc ? 'Da' : 'Nu'}
                        </span>
                      </div>
                    </div>

                    {/* Options */}
                    {service.service_options &&
                      service.service_options.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            Optiuni ({service.service_options.length}):
                          </p>
                          <div className="space-y-1">
                            {service.service_options.map((opt) => (
                              <div
                                key={opt.id}
                                className="flex items-center gap-2 text-xs bg-white rounded px-2 py-1 border"
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${opt.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                                />
                                <span className="font-medium">{opt.name}</span>
                                <span className="text-muted-foreground">
                                  ({opt.code})
                                </span>
                                <span className="ml-auto font-semibold tabular-nums">
                                  +{opt.price} lei
                                </span>
                                {opt.is_required && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] px-1 py-0"
                                  >
                                    Obligatoriu
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Processing Config */}
                    {service.processing_config && Object.keys(service.processing_config).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Configurare procesare:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {service.processing_config.requires_lawyer && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              Necesita avocat
                            </Badge>
                          )}
                          {service.processing_config.institution && (
                            <Badge variant="outline" className="text-xs">
                              Institutie: {service.processing_config.institution}
                            </Badge>
                          )}
                          {service.processing_config.document_templates && service.processing_config.document_templates.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {service.processing_config.document_templates.length} template-uri
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditService(service)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editeaza
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Edit Service Dialog */}
      {editService && (
        <EditServiceDialog
          service={editService}
          open={!!editService}
          onClose={() => setEditService(null)}
          onSuccess={() => {
            setEditService(null);
            fetchServices();
          }}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Edit Service Dialog
// ──────────────────────────────────────────────────────────────

function EditServiceDialog({
  service,
  open,
  onClose,
  onSuccess,
}: {
  service: Service;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [basePrice, setBasePrice] = useState(String(service.base_price));
  const [description, setDescription] = useState(service.description || '');
  const [shortDescription, setShortDescription] = useState(
    service.short_description || ''
  );
  const [estimatedDays, setEstimatedDays] = useState(
    String(service.estimated_days ?? '')
  );
  const [isFeatured, setIsFeatured] = useState(!!service.is_featured);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) {
      toast.error('Pretul trebuie sa fie un numar valid');
      return;
    }

    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        base_price: price,
        description: description || null,
        short_description: shortDescription || null,
        is_featured: isFeatured,
      };

      if (estimatedDays.trim()) {
        const days = parseInt(estimatedDays, 10);
        if (!isNaN(days) && days > 0) {
          updates.estimated_days = days;
        }
      }

      const res = await fetch('/api/admin/settings/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: service.id, updates }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Serviciul a fost actualizat');
        onSuccess();
      } else {
        toast.error(json.error || 'Eroare la actualizare');
      }
    } catch {
      toast.error('Eroare de retea');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editeaza serviciu: {service.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Pret (lei)</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-days">Zile estimare</Label>
              <Input
                id="edit-days"
                type="number"
                min="1"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                placeholder="ex: 5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-short-desc">Descriere scurta</Label>
            <Input
              id="edit-short-desc"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Descriere scurta afisata in lista"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-desc">Descriere completa</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descriere detaliata a serviciului"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="edit-featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
            <Label htmlFor="edit-featured" className="cursor-pointer">
              Serviciu promovat (afisat pe prima pagina)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuleaza
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Se salveaza...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salveaza
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════
// COURIERS TAB
// ══════════════════════════════════════════════════════════════

function CouriersTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [senderAddress, setSenderAddress] = useState<SenderAddress>({
    company: '',
    contact: '',
    phone: '',
    email: '',
    street: '',
    streetNo: '',
    city: '',
    county: '',
    postalCode: '',
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (json.success) {
        if (json.data?.sender_address) {
          setSenderAddress({ ...senderAddressDefaults(), ...json.data.sender_address });
        }
      }
    } catch {
      toast.error('Eroare la incarcarea setarilor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSenderAddress = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'sender_address', value: senderAddress }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Adresa de expediere a fost salvata');
      } else {
        toast.error(json.error || 'Eroare la salvare');
      }
    } catch {
      toast.error('Eroare de retea');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Fan Courier */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Truck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-base">Fan Courier</CardTitle>
              <CardDescription>Curier domestic Romania</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EnvField label="Username" value={maskEnv(process.env.NEXT_PUBLIC_FANCOURIER_USERNAME)} />
            <EnvField label="Client ID" value={maskEnv(process.env.NEXT_PUBLIC_FANCOURIER_CLIENT_ID)} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Test conexiune Fan Courier - in curand')}
          >
            Test conexiune
          </Button>
        </CardContent>
      </Card>

      {/* Sameday */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Sameday</CardTitle>
              <CardDescription>Curier domestic Romania + EasyBox</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EnvField label="Username" value={maskEnv(process.env.NEXT_PUBLIC_SAMEDAY_USERNAME)} />
            <EnvField
              label="Mod demo"
              value={process.env.NEXT_PUBLIC_SAMEDAY_USE_DEMO === 'true' ? 'Da (demo)' : 'Nu (productie)'}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Test conexiune Sameday - in curand')}
          >
            Test conexiune
          </Button>
        </CardContent>
      </Card>

      {/* Sender Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adresa expeditor</CardTitle>
          <CardDescription>
            Adresa de unde se expediaza coletele (utilizata de toti curierii)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sender-company">Firma</Label>
              <Input
                id="sender-company"
                value={senderAddress.company}
                onChange={(e) =>
                  setSenderAddress((p) => ({ ...p, company: e.target.value }))
                }
                placeholder="SC Exemplu SRL"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sender-contact">Persoana contact</Label>
              <Input
                id="sender-contact"
                value={senderAddress.contact}
                onChange={(e) =>
                  setSenderAddress((p) => ({ ...p, contact: e.target.value }))
                }
                placeholder="Ion Popescu"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sender-phone">Telefon</Label>
              <Input
                id="sender-phone"
                value={senderAddress.phone}
                onChange={(e) =>
                  setSenderAddress((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="0712345678"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sender-email">Email</Label>
              <Input
                id="sender-email"
                type="email"
                value={senderAddress.email}
                onChange={(e) =>
                  setSenderAddress((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="contact@exemplu.ro"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_100px] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sender-street">Strada</Label>
              <Input
                id="sender-street"
                value={senderAddress.street}
                onChange={(e) =>
                  setSenderAddress((p) => ({ ...p, street: e.target.value }))
                }
                placeholder="Strada Exemplu"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sender-streetno">Nr.</Label>
              <Input
                id="sender-streetno"
                value={senderAddress.streetNo}
                onChange={(e) =>
                  setSenderAddress((p) => ({
                    ...p,
                    streetNo: e.target.value,
                  }))
                }
                placeholder="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sender-city">Localitate</Label>
              <Input
                id="sender-city"
                value={senderAddress.city}
                onChange={(e) =>
                  setSenderAddress((p) => ({ ...p, city: e.target.value }))
                }
                placeholder="Bucuresti"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sender-county">Judet</Label>
              <Input
                id="sender-county"
                value={senderAddress.county}
                onChange={(e) =>
                  setSenderAddress((p) => ({ ...p, county: e.target.value }))
                }
                placeholder="Bucuresti"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sender-postal">Cod postal</Label>
              <Input
                id="sender-postal"
                value={senderAddress.postalCode}
                onChange={(e) =>
                  setSenderAddress((p) => ({
                    ...p,
                    postalCode: e.target.value,
                  }))
                }
                placeholder="010101"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSenderAddress} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Se salveaza...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salveaza adresa
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAYMENTS TAB
// ══════════════════════════════════════════════════════════════

function PaymentsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    iban: '',
    bank_name: '',
    account_holder: '',
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (json.success) {
        if (json.data?.bank_details) {
          setBankDetails({ ...bankDetailsDefaults(), ...json.data.bank_details });
        }
      }
    } catch {
      toast.error('Eroare la incarcarea setarilor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveBankDetails = async () => {
    if (!bankDetails.iban.trim()) {
      toast.error('IBAN-ul este obligatoriu');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'bank_details', value: bankDetails }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Datele bancare au fost salvate');
      } else {
        toast.error(json.error || 'Eroare la salvare');
      }
    } catch {
      toast.error('Eroare de retea');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  // Try to get Stripe publishable key prefix (client-side env)
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  const stripePrefix = stripeKey ? stripeKey.substring(0, 12) + '...' : 'Neconfigurat';

  // Oblio status
  const oblioConfigured = !!(
    process.env.NEXT_PUBLIC_OBLIO_CONFIGURED === 'true'
  );

  return (
    <div className="space-y-6 mt-4">
      {/* Stripe */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base">Stripe</CardTitle>
              <CardDescription>
                Plati online cu card, Apple Pay, Google Pay
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EnvField
            label="Publishable Key"
            value={stripePrefix}
          />
        </CardContent>
      </Card>

      {/* Bank Transfer */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Banknote className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base">Transfer bancar</CardTitle>
              <CardDescription>
                Datele bancare afisate clientilor la plata cu transfer
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bank-iban">IBAN</Label>
              <Input
                id="bank-iban"
                value={bankDetails.iban}
                onChange={(e) =>
                  setBankDetails((p) => ({ ...p, iban: e.target.value }))
                }
                placeholder="RO00AAAA0000000000000000"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bank-name">Banca</Label>
              <Input
                id="bank-name"
                value={bankDetails.bank_name}
                onChange={(e) =>
                  setBankDetails((p) => ({ ...p, bank_name: e.target.value }))
                }
                placeholder="ING Bank / BCR / etc."
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank-holder">Titular cont</Label>
            <Input
              id="bank-holder"
              value={bankDetails.account_holder}
              onChange={(e) =>
                setBankDetails((p) => ({
                  ...p,
                  account_holder: e.target.value,
                }))
              }
              placeholder="SC Exemplu SRL"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={saveBankDetails} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Se salveaza...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salveaza
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Oblio */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Receipt className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">Oblio</CardTitle>
              <CardDescription>
                Facturare electronica (e-factura compliant)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {oblioConfigured ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Configurat</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-700">Neconfigurat</span>
              </>
            )}
            <span className="text-xs text-muted-foreground ml-2">
              (din configurare server)
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SYSTEM TAB
// ══════════════════════════════════════════════════════════════

function SystemTab() {
  const [loading, setLoading] = useState(true);
  const [cleanupRunning, setCleanupRunning] = useState(false);
  const [cleanupStats, setCleanupStats] = useState<{
    pending_count: number;
    total_drafts: number;
    anonymized_last_24h: number;
  } | null>(null);

  // Maintenance mode
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notifications>({
    email_on_payment: true,
    email_on_shipping: true,
    sms_on_shipping: false,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch settings and cleanup status in parallel
      const [settingsRes, cleanupRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/cleanup'),
      ]);

      const settingsJson = await settingsRes.json();
      if (settingsJson.success) {
        const data = settingsJson.data || {};

        // Maintenance mode
        if (data.maintenance_mode) {
          setMaintenanceEnabled(!!data.maintenance_mode.enabled);
          setMaintenanceMessage(data.maintenance_mode.message || '');
        }

        // Notifications
        if (data.notifications) {
          setNotifications({
            email_on_payment: data.notifications.email_on_payment ?? true,
            email_on_shipping: data.notifications.email_on_shipping ?? true,
            sms_on_shipping: data.notifications.sms_on_shipping ?? false,
          });
        }
      }

      const cleanupJson = await cleanupRes.json();
      if (cleanupJson.success) {
        setCleanupStats({
          pending_count: cleanupJson.data?.pending_cleanup?.count || 0,
          total_drafts: cleanupJson.data?.stats?.total_drafts || 0,
          anonymized_last_24h:
            cleanupJson.data?.stats?.anonymized_last_24h || 0,
        });
      }
    } catch {
      toast.error('Eroare la incarcarea setarilor sistem');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const runCleanup = async () => {
    setCleanupRunning(true);
    try {
      const res = await fetch('/api/admin/cleanup', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast.success(
          `Cleanup finalizat: ${json.data?.anonymized_count || 0} comenzi anonimizate`
        );
        // Refresh stats
        fetchAll();
      } else {
        toast.error(json.error?.message || 'Eroare la cleanup');
      }
    } catch {
      toast.error('Eroare de retea');
    } finally {
      setCleanupRunning(false);
    }
  };

  const saveMaintenanceMode = async () => {
    setSavingMaintenance(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'maintenance_mode',
          value: {
            enabled: maintenanceEnabled,
            message: maintenanceMessage,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Modul mentenanta a fost actualizat');
      } else {
        toast.error(json.error || 'Eroare la salvare');
      }
    } catch {
      toast.error('Eroare de retea');
    } finally {
      setSavingMaintenance(false);
    }
  };

  const saveNotifications = async () => {
    setSavingNotifications(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'notifications',
          value: notifications,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Setarile de notificari au fost salvate');
      } else {
        toast.error(json.error || 'Eroare la salvare');
      }
    } catch {
      toast.error('Eroare de retea');
    } finally {
      setSavingNotifications(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* GDPR Cleanup */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-base">GDPR Cleanup</CardTitle>
              <CardDescription>
                Anonimizare automata comenzi draft mai vechi de 7 zile
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {cleanupStats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">
                  {cleanupStats.total_drafts}
                </p>
                <p className="text-xs text-muted-foreground">Draft-uri total</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {cleanupStats.pending_count}
                </p>
                <p className="text-xs text-muted-foreground">
                  In asteptare cleanup
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {cleanupStats.anonymized_last_24h}
                </p>
                <p className="text-xs text-muted-foreground">
                  Anonimizate (24h)
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm">
                <strong>Interval retentie:</strong> 7 zile
              </p>
              <p className="text-xs text-muted-foreground">
                Comenzile draft mai vechi de 7 zile sunt anonimizate automat
                pentru conformitate GDPR.
              </p>
            </div>
            <Button
              onClick={runCleanup}
              disabled={cleanupRunning}
              variant="destructive"
              size="sm"
            >
              {cleanupRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Se ruleaza...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Ruleaza acum
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">Mod mentenanta</CardTitle>
              <CardDescription>
                Cand este activat, vizitatorii vad un mesaj de mentenanta
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="maintenance-toggle"
              checked={maintenanceEnabled}
              onCheckedChange={setMaintenanceEnabled}
            />
            <Label htmlFor="maintenance-toggle" className="cursor-pointer">
              {maintenanceEnabled ? (
                <span className="text-amber-700 font-medium">
                  Mentenanta ACTIVATA
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Mentenanta dezactivata
                </span>
              )}
            </Label>
          </div>

          {maintenanceEnabled && (
            <div className="space-y-1.5">
              <Label htmlFor="maintenance-msg">Mesaj afisat vizitatorilor</Label>
              <Textarea
                id="maintenance-msg"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                rows={2}
                placeholder="Platforma este in mentenanta. Va rugam reveniti mai tarziu."
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={saveMaintenanceMode}
              disabled={savingMaintenance}
              size="sm"
            >
              {savingMaintenance ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Se salveaza...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salveaza
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Notificari</CardTitle>
              <CardDescription>
                Configurare notificari automate catre clienti
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email la confirmare plata</p>
                <p className="text-xs text-muted-foreground">
                  Trimite email cand plata este confirmata
                </p>
              </div>
              <Switch
                checked={notifications.email_on_payment}
                onCheckedChange={(checked) =>
                  setNotifications((p) => ({
                    ...p,
                    email_on_payment: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email la expediere</p>
                <p className="text-xs text-muted-foreground">
                  Trimite email cand comanda este expediata
                </p>
              </div>
              <Switch
                checked={notifications.email_on_shipping}
                onCheckedChange={(checked) =>
                  setNotifications((p) => ({
                    ...p,
                    email_on_shipping: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">SMS la expediere</p>
                <p className="text-xs text-muted-foreground">
                  Trimite SMS cand comanda este expediata (cost aditional)
                </p>
              </div>
              <Switch
                checked={notifications.sms_on_shipping}
                onCheckedChange={(checked) =>
                  setNotifications((p) => ({
                    ...p,
                    sms_on_shipping: checked,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={saveNotifications}
              disabled={savingNotifications}
              size="sm"
            >
              {savingNotifications ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Se salveaza...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salveaza
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPANY TAB (Date firma & Avocat)
// ══════════════════════════════════════════════════════════════

function CompanyTab() {
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingLawyer, setSavingLawyer] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [companyData, setCompanyData] = useState<Record<string, any>>({
    name: '',
    cui: '',
    registration_number: '',
    address: '',
    iban: '',
    bank: '',
    email: '',
    phone: '',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lawyerData, setLawyerData] = useState<Record<string, any>>({
    cabinet_name: '',
    lawyer_name: '',
    professional_address: '',
    cif: '',
    cnp: '',
    ci_series: '',
    ci_number: '',
    imputernicire_series: '',
    fee: 15,
  });

  const [counters, setCounters] = useState({
    contract_number: 0,
    imputernicire_number: 0,
  });

  // Document template state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [documentTemplates, setDocumentTemplates] = useState<Record<string, any>>({});
  const [uploadingTemplate, setUploadingTemplate] = useState<string | null>(null);
  const templateInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Signature upload state
  const companySignatureRef = useRef<HTMLInputElement>(null);
  const lawyerSignatureRef = useRef<HTMLInputElement>(null);
  const lawyerStampRef = useRef<HTMLInputElement>(null);
  const lawyerDocRef = useRef<HTMLInputElement>(null);

  const [companySignaturePreview, setCompanySignaturePreview] = useState<string | null>(null);
  const [lawyerSignaturePreview, setLawyerSignaturePreview] = useState<string | null>(null);
  const [lawyerStampPreview, setLawyerStampPreview] = useState<string | null>(null);

  const [uploadingCompanySig, setUploadingCompanySig] = useState(false);
  const [uploadingLawyerSig, setUploadingLawyerSig] = useState(false);
  const [uploadingLawyerStamp, setUploadingLawyerStamp] = useState(false);
  const [uploadingLawyerDoc, setUploadingLawyerDoc] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (json.success) {
        if (json.data?.company_data) {
          setCompanyData((prev) => ({ ...prev, ...json.data.company_data }));
        }
        if (json.data?.lawyer_data) {
          setLawyerData((prev) => ({ ...prev, ...json.data.lawyer_data }));
        }
        if (json.data?.document_counters) {
          setCounters(json.data.document_counters);
        }
        if (json.data?.document_templates) {
          setDocumentTemplates(json.data.document_templates);
        }
      }
    } catch {
      toast.error('Eroare la incarcarea setarilor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Load signature previews when data is available
  useEffect(() => {
    async function loadPreviews() {
      if (companyData.signature_s3_key) {
        try {
          const res = await fetch(`/api/upload/download?key=${encodeURIComponent(companyData.signature_s3_key)}`);
          const json = await res.json();
          if (json.success) setCompanySignaturePreview(json.data.url);
        } catch { /* ignore */ }
      }
      if (lawyerData.signature_s3_key) {
        try {
          const res = await fetch(`/api/upload/download?key=${encodeURIComponent(lawyerData.signature_s3_key)}`);
          const json = await res.json();
          if (json.success) setLawyerSignaturePreview(json.data.url);
        } catch { /* ignore */ }
      }
      if (lawyerData.stamp_s3_key) {
        try {
          const res = await fetch(`/api/upload/download?key=${encodeURIComponent(lawyerData.stamp_s3_key)}`);
          const json = await res.json();
          if (json.success) setLawyerStampPreview(json.data.url);
        } catch { /* ignore */ }
      }
    }
    if (!loading) loadPreviews();
  }, [loading, companyData.signature_s3_key, lawyerData.signature_s3_key, lawyerData.stamp_s3_key]);

  const saveCompanyData = async () => {
    if (!companyData.name.trim()) {
      toast.error('Numele firmei este obligatoriu');
      return;
    }
    setSavingCompany(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'company_data', value: companyData }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Datele firmei au fost salvate');
      } else {
        toast.error(json.error || 'Eroare la salvare');
      }
    } catch {
      toast.error('Eroare de retea');
    } finally {
      setSavingCompany(false);
    }
  };

  const saveLawyerData = async () => {
    if (!lawyerData.lawyer_name.trim()) {
      toast.error('Numele avocatului este obligatoriu');
      return;
    }
    setSavingLawyer(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'lawyer_data', value: lawyerData }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Datele avocatului au fost salvate');
      } else {
        toast.error(json.error || 'Eroare la salvare');
      }
    } catch {
      toast.error('Eroare de retea');
    } finally {
      setSavingLawyer(false);
    }
  };

  /**
   * Generic signature/stamp upload handler
   */
  const handleSignatureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    signatureType: 'company_signature' | 'lawyer_signature' | 'lawyer_stamp',
    setUploading: (v: boolean) => void,
    setPreview: (url: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Fisierul trebuie sa fie PNG, JPG sau WebP');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fisierul nu poate depasi 5MB');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Get presigned URL
      const presignRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'signatures',
          signatureType,
          contentType: file.type,
          filename: file.name,
          fileSize: file.size,
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error || 'Eroare la generarea URL-ului de upload');
      }

      const { data } = await presignRes.json();
      const { uploadUrl, key } = data;

      // Step 2: Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) {
        throw new Error('Eroare la incarcarea fisierului in S3');
      }

      // Step 3: Save S3 key to settings
      if (signatureType === 'company_signature') {
        const updatedCompanyData = { ...companyData, signature_s3_key: key };
        setCompanyData(updatedCompanyData);
        await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'company_data', value: updatedCompanyData }),
        });
      } else {
        const s3KeyField = signatureType === 'lawyer_signature' ? 'signature_s3_key' : 'stamp_s3_key';
        const updatedLawyerData = { ...lawyerData, [s3KeyField]: key };
        setLawyerData(updatedLawyerData);
        await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'lawyer_data', value: updatedLawyerData }),
        });
      }

      // Step 4: Get preview URL
      const dlRes = await fetch(`/api/upload/download?key=${encodeURIComponent(key)}`);
      const dlJson = await dlRes.json();
      if (dlJson.success) {
        setPreview(dlJson.data.url);
      }

      toast.success('Fisierul a fost incarcat cu succes');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare la incarcare');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  /**
   * Remove a signature/stamp
   */
  const handleRemoveSignature = async (
    signatureType: 'company_signature' | 'lawyer_signature' | 'lawyer_stamp',
    setPreview: (url: string | null) => void,
  ) => {
    if (signatureType === 'company_signature') {
      const updatedCompanyData = { ...companyData };
      delete updatedCompanyData.signature_s3_key;
      setCompanyData(updatedCompanyData);
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'company_data', value: updatedCompanyData }),
      });
    } else {
      const s3KeyField = signatureType === 'lawyer_signature' ? 'signature_s3_key' : 'stamp_s3_key';
      const updatedLawyerData = { ...lawyerData };
      delete updatedLawyerData[s3KeyField];
      setLawyerData(updatedLawyerData);
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'lawyer_data', value: updatedLawyerData }),
      });
    }
    setPreview(null);
    toast.success('Fisierul a fost sters');
  };

  /**
   * Upload a custom DOCX template to S3
   */
  const handleTemplateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    templateKey: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast.error('Template-ul trebuie sa fie un fisier DOCX');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fisierul nu poate depasi 10MB');
      return;
    }

    setUploadingTemplate(templateKey);
    try {
      // Get presigned URL
      const presignRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'templates',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          filename: `${templateKey}.docx`,
          fileSize: file.size,
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error || 'Eroare la generarea URL-ului de upload');
      }

      const { data } = await presignRes.json();
      const { uploadUrl, key } = data;

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      });

      if (!uploadRes.ok) {
        throw new Error('Eroare la incarcarea fisierului in S3');
      }

      // Save S3 key to document_templates settings
      const updated = { ...documentTemplates, [templateKey]: { s3_key: key, file_name: file.name, uploaded_at: new Date().toISOString() } };
      setDocumentTemplates(updated);

      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'document_templates', value: updated }),
      });

      toast.success(`Template ${templateKey} incarcat cu succes`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare la incarcare');
    } finally {
      setUploadingTemplate(null);
      // Reset input
      const input = templateInputRefs.current[templateKey];
      if (input) input.value = '';
    }
  };

  const handleRemoveTemplate = async (templateKey: string) => {
    const updated = { ...documentTemplates };
    delete updated[templateKey];
    setDocumentTemplates(updated);

    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'document_templates', value: updated }),
    });

    toast.success(`Template ${templateKey} sters`);
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Date Firma */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Date firma</CardTitle>
              <CardDescription>
                Datele companiei utilizate in contracte si documente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company-name">Nume firma</Label>
              <Input
                id="company-name"
                value={companyData.name}
                onChange={(e) =>
                  setCompanyData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="SC Exemplu SRL"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-cui">CUI</Label>
              <Input
                id="company-cui"
                value={companyData.cui}
                onChange={(e) =>
                  setCompanyData((p) => ({ ...p, cui: e.target.value }))
                }
                placeholder="RO12345678"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-reg">Nr. inregistrare (J/F)</Label>
              <Input
                id="company-reg"
                value={companyData.registration_number}
                onChange={(e) =>
                  setCompanyData((p) => ({
                    ...p,
                    registration_number: e.target.value,
                  }))
                }
                placeholder="J40/1234/2020"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-address">Adresa sediu</Label>
              <Input
                id="company-address"
                value={companyData.address}
                onChange={(e) =>
                  setCompanyData((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Str. Exemplu nr. 10, Bucuresti"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-iban">IBAN</Label>
              <Input
                id="company-iban"
                value={companyData.iban}
                onChange={(e) =>
                  setCompanyData((p) => ({ ...p, iban: e.target.value }))
                }
                placeholder="RO00AAAA0000000000000000"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-bank">Banca</Label>
              <Input
                id="company-bank"
                value={companyData.bank}
                onChange={(e) =>
                  setCompanyData((p) => ({ ...p, bank: e.target.value }))
                }
                placeholder="ING Bank / BCR / etc."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={companyData.email}
                onChange={(e) =>
                  setCompanyData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="contact@exemplu.ro"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-phone">Telefon</Label>
              <Input
                id="company-phone"
                value={companyData.phone}
                onChange={(e) =>
                  setCompanyData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="0712345678"
              />
            </div>
          </div>

          {/* Semnatura Prestator */}
          <div className="space-y-3 pt-4 border-t">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Semnatura prestator
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Incarcati semnatura prestatorului (PNG cu fundal transparent, recomandat ~300x100px)
              </p>
            </div>
            {companySignaturePreview && (
              <div className="relative inline-block border rounded-lg p-3 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={companySignaturePreview}
                  alt="Semnatura prestator"
                  className="max-h-20 max-w-[300px] object-contain"
                />
                <button
                  onClick={() => handleRemoveSignature('company_signature', setCompanySignaturePreview)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                  title="Sterge semnatura"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                ref={companySignatureRef}
                className="hidden"
                onChange={(e) =>
                  handleSignatureUpload(e, 'company_signature', setUploadingCompanySig, setCompanySignaturePreview)
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => companySignatureRef.current?.click()}
                disabled={uploadingCompanySig}
              >
                {uploadingCompanySig ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Se incarca...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {companyData.signature_s3_key ? 'Schimba semnatura' : 'Incarca semnatura'}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveCompanyData} disabled={savingCompany}>
              {savingCompany ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Se salveaza...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salveaza datele firmei
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Date Avocat */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Scale className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base">Date avocat</CardTitle>
              <CardDescription>
                Datele avocatului colaborator pentru imputerniciri si reprezentare
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lawyer-cabinet">Nume cabinet</Label>
              <Input
                id="lawyer-cabinet"
                value={lawyerData.cabinet_name}
                onChange={(e) =>
                  setLawyerData((p) => ({ ...p, cabinet_name: e.target.value }))
                }
                placeholder="Cabinet Avocat Popescu Ion"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lawyer-name">Nume avocat</Label>
              <Input
                id="lawyer-name"
                value={lawyerData.lawyer_name}
                onChange={(e) =>
                  setLawyerData((p) => ({ ...p, lawyer_name: e.target.value }))
                }
                placeholder="Av. Popescu Ion"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lawyer-address">Adresa profesionala</Label>
              <Input
                id="lawyer-address"
                value={lawyerData.professional_address}
                onChange={(e) =>
                  setLawyerData((p) => ({
                    ...p,
                    professional_address: e.target.value,
                  }))
                }
                placeholder="Str. Justitiei nr. 5, Bucuresti"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lawyer-cif">CIF cabinet</Label>
              <Input
                id="lawyer-cif"
                value={lawyerData.cif}
                onChange={(e) =>
                  setLawyerData((p) => ({ ...p, cif: e.target.value }))
                }
                placeholder="12345678"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lawyer-cnp">CNP avocat</Label>
              <Input
                id="lawyer-cnp"
                value={lawyerData.cnp}
                onChange={(e) =>
                  setLawyerData((p) => ({ ...p, cnp: e.target.value }))
                }
                placeholder="1234567890123"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lawyer-ci-series">Serie CI avocat</Label>
                <Input
                  id="lawyer-ci-series"
                  value={lawyerData.ci_series}
                  onChange={(e) =>
                    setLawyerData((p) => ({ ...p, ci_series: e.target.value }))
                  }
                  placeholder="SM"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lawyer-ci-number">Numar CI avocat</Label>
                <Input
                  id="lawyer-ci-number"
                  value={lawyerData.ci_number}
                  onChange={(e) =>
                    setLawyerData((p) => ({ ...p, ci_number: e.target.value }))
                  }
                  placeholder="123456"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lawyer-series">Serie imputernicire</Label>
              <Input
                id="lawyer-series"
                value={lawyerData.imputernicire_series}
                onChange={(e) =>
                  setLawyerData((p) => ({
                    ...p,
                    imputernicire_series: e.target.value,
                  }))
                }
                placeholder="IMP"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lawyer-fee">Onorariu standard (lei)</Label>
              <Input
                id="lawyer-fee"
                type="number"
                min="0"
                step="0.01"
                value={lawyerData.fee}
                onChange={(e) =>
                  setLawyerData((p) => ({
                    ...p,
                    fee: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="15"
              />
            </div>
          </div>

          {/* Semnatura Avocat */}
          <div className="space-y-3 pt-4 border-t">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Semnatura avocat
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Incarcati semnatura avocatului (PNG cu fundal transparent, recomandat ~300x100px)
              </p>
            </div>
            {lawyerSignaturePreview && (
              <div className="relative inline-block border rounded-lg p-3 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lawyerSignaturePreview}
                  alt="Semnatura avocat"
                  className="max-h-20 max-w-[300px] object-contain"
                />
                <button
                  onClick={() => handleRemoveSignature('lawyer_signature', setLawyerSignaturePreview)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                  title="Sterge semnatura"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                ref={lawyerSignatureRef}
                className="hidden"
                onChange={(e) =>
                  handleSignatureUpload(e, 'lawyer_signature', setUploadingLawyerSig, setLawyerSignaturePreview)
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => lawyerSignatureRef.current?.click()}
                disabled={uploadingLawyerSig}
              >
                {uploadingLawyerSig ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Se incarca...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {lawyerData.signature_s3_key ? 'Schimba semnatura' : 'Incarca semnatura'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stampila Avocat */}
          <div className="space-y-3 pt-4 border-t">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Stampila avocat
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Incarcati stampila avocatului (PNG cu fundal transparent, recomandat ~200x200px)
              </p>
            </div>
            {lawyerStampPreview && (
              <div className="relative inline-block border rounded-lg p-3 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lawyerStampPreview}
                  alt="Stampila avocat"
                  className="max-h-24 max-w-[200px] object-contain"
                />
                <button
                  onClick={() => handleRemoveSignature('lawyer_stamp', setLawyerStampPreview)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                  title="Sterge stampila"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                ref={lawyerStampRef}
                className="hidden"
                onChange={(e) =>
                  handleSignatureUpload(e, 'lawyer_stamp', setUploadingLawyerStamp, setLawyerStampPreview)
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => lawyerStampRef.current?.click()}
                disabled={uploadingLawyerStamp}
              >
                {uploadingLawyerStamp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Se incarca...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {lawyerData.stamp_s3_key ? 'Schimba stampila' : 'Incarca stampila'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Documente Identitate Avocat */}
          <div className="space-y-3 pt-4 border-t">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documente identitate avocat
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Incarcati actul de identitate al avocatului (PDF sau imagine)
              </p>
            </div>
            {lawyerData.identity_docs?.map((doc: { s3_key: string; file_name: string; uploaded_at: string }, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg border bg-white text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{doc.file_name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(doc.uploaded_at).toLocaleDateString('ro-RO')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={async () => {
                      const res = await fetch(`/api/upload/download?key=${encodeURIComponent(doc.s3_key)}`);
                      const json = await res.json();
                      if (json.success) window.open(json.data.url, '_blank');
                    }}
                  >
                    <Eye className="h-3 w-3" />
                    <span className="ml-1">Vezi</span>
                  </Button>
                  <button
                    onClick={async () => {
                      const updatedDocs = lawyerData.identity_docs.filter((_: unknown, i: number) => i !== idx);
                      const updated = { ...lawyerData, identity_docs: updatedDocs };
                      setLawyerData(updated);
                      await fetch('/api/admin/settings', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: 'lawyer_data', value: updated }),
                      });
                      toast.success('Document sters');
                    }}
                    className="p-1 rounded hover:bg-red-50 text-red-500"
                    title="Sterge document"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <div>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                ref={lawyerDocRef}
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 10 * 1024 * 1024) {
                    toast.error('Fisierul nu poate depasi 10MB');
                    return;
                  }
                  setUploadingLawyerDoc(true);
                  try {
                    const presignRes = await fetch('/api/upload', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        category: 'signatures',
                        signatureType: 'lawyer_identity',
                        contentType: file.type,
                        filename: file.name,
                        fileSize: file.size,
                      }),
                    });
                    if (!presignRes.ok) throw new Error('Eroare la generarea URL-ului');
                    const { data } = await presignRes.json();
                    const uploadRes = await fetch(data.uploadUrl, {
                      method: 'PUT',
                      body: file,
                      headers: { 'Content-Type': file.type },
                    });
                    if (!uploadRes.ok) throw new Error('Eroare la incarcare');
                    const newDoc = { s3_key: data.key, file_name: file.name, uploaded_at: new Date().toISOString() };
                    const updatedDocs = [...(lawyerData.identity_docs || []), newDoc];
                    const updated = { ...lawyerData, identity_docs: updatedDocs };
                    setLawyerData(updated);
                    await fetch('/api/admin/settings', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ key: 'lawyer_data', value: updated }),
                    });
                    toast.success('Document incarcat');
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Eroare la incarcare');
                  } finally {
                    setUploadingLawyerDoc(false);
                    e.target.value = '';
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => lawyerDocRef.current?.click()}
                disabled={uploadingLawyerDoc}
              >
                {uploadingLawyerDoc ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Se incarca...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Incarca document
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveLawyerData} disabled={savingLawyer}>
              {savingLawyer ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Se salveaza...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salveaza datele avocatului
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Numere Documente */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Hash className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-base">Numere documente</CardTitle>
              <CardDescription>
                Contoare automate pentru numerotarea documentelor generate
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {counters.contract_number}
              </p>
              <p className="text-xs text-muted-foreground">
                Numar contract curent
              </p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {counters.imputernicire_number}
              </p>
              <p className="text-xs text-muted-foreground">
                Numar imputernicire curent
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic">
            Aceste numere se incrementeaza automat la generarea documentelor.
          </p>
        </CardContent>
      </Card>

      {/* Template-uri Documente */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-base">Template-uri documente</CardTitle>
              <CardDescription>
                Incarcati template-uri DOCX personalizate pentru generarea documentelor
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'imputernicire', label: 'Imputernicire avocatiala' },
            { key: 'cerere-eliberare-pf', label: 'Cerere eliberare PF' },
            { key: 'cerere-eliberare-pj', label: 'Cerere eliberare PJ' },
          ].map(({ key, label }) => {
            const tmpl = documentTemplates[key];
            const isUploading = uploadingTemplate === key;
            return (
              <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg border text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  {tmpl ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 text-gray-300 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className={tmpl ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
                    {tmpl && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {tmpl.file_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {tmpl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleRemoveTemplate(key)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  <input
                    type="file"
                    accept=".docx"
                    className="hidden"
                    ref={(el) => { templateInputRefs.current[key] = el; }}
                    onChange={(e) => handleTemplateUpload(e, key)}
                  />
                  <Button
                    size="sm"
                    variant={tmpl ? 'outline' : 'default'}
                    className="h-7 text-xs"
                    onClick={() => templateInputRefs.current[key]?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3" />
                    )}
                    <span className="ml-1">{tmpl ? 'Schimba' : 'Incarca'}</span>
                  </Button>
                </div>
              </div>
            );
          })}

          <p className="text-xs text-muted-foreground italic">
            Template-urile trebuie sa fie in format DOCX cu placeholder-uri compatibile (ex: {'{{NUMECLIENT}}'}, {'{{CNP/CUI}}'}).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SHARED COMPONENTS & HELPERS
// ══════════════════════════════════════════════════════════════

/**
 * Read-only field displaying a server environment value
 */
function EnvField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-3 py-2 border">
        <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="font-mono text-xs truncate">
          {value || 'Neconfigurat'}
        </span>
        <span className="text-[10px] text-muted-foreground shrink-0">
          (din configurare server)
        </span>
      </div>
    </div>
  );
}

/**
 * Mask env value - show first few chars, rest as asterisks.
 * Server-side env vars prefixed with NEXT_PUBLIC_ are available client-side.
 * Non-NEXT_PUBLIC_ vars will be undefined on client, so we show "Configurat pe server".
 */
function maskEnv(value: string | undefined): string {
  if (!value) return 'Configurat pe server';
  if (value.length <= 6) return value;
  return value.substring(0, 4) + '****';
}

function senderAddressDefaults(): SenderAddress {
  return {
    company: '',
    contact: '',
    phone: '',
    email: '',
    street: '',
    streetNo: '',
    city: '',
    county: '',
    postalCode: '',
  };
}

function bankDetailsDefaults(): BankDetails {
  return {
    iban: '',
    bank_name: '',
    account_holder: '',
  };
}

// ──────────────────────────────────────────────────────────────
// Number Registry Tab
// ──────────────────────────────────────────────────────────────

function NumberRegistryTab() {
  // Ranges
  const [ranges, setRanges] = useState<NumberRangeWithStats[]>([]);
  const [rangesLoading, setRangesLoading] = useState(true);

  // Registry journal
  const [registryEntries, setRegistryEntries] = useState<NumberRegistryEntry[]>([]);
  const [registryLoading, setRegistryLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 50, total: 0, total_pages: 0 });

  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterSource, setFilterSource] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Dialogs
  const [addRangeOpen, setAddRangeOpen] = useState(false);
  const [addManualOpen, setAddManualOpen] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [voidEntryId, setVoidEntryId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // Forms
  const [newRange, setNewRange] = useState({
    type: 'contract' as 'contract' | 'delegation',
    year: new Date().getFullYear(),
    range_start: 0,
    range_end: 0,
    series: 'SM',
    notes: '',
  });
  const [manualEntry, setManualEntry] = useState({
    type: 'contract' as 'contract' | 'delegation',
    client_name: '',
    client_email: '',
    client_cnp: '',
    client_cui: '',
    service_type: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [saving, setSaving] = useState(false);

  // ── Data fetching ──────────────────────────────────────────

  const fetchRanges = useCallback(async () => {
    setRangesLoading(true);
    try {
      const params = new URLSearchParams({ year: String(filterYear) });
      const res = await fetch(`/api/admin/settings/number-ranges?${params}`);
      const json = await res.json();
      if (json.success) setRanges(json.data);
    } catch (err) { console.error('Failed to fetch ranges:', err); }
    finally { setRangesLoading(false); }
  }, [filterYear]);

  const fetchRegistry = useCallback(async (page = 1) => {
    setRegistryLoading(true);
    try {
      const params = new URLSearchParams({
        year: String(filterYear),
        page: String(page),
        per_page: '50',
      });
      if (filterType) params.set('type', filterType);
      if (filterSource) params.set('source', filterSource);
      if (filterSearch) params.set('search', filterSearch);
      const res = await fetch(`/api/admin/settings/number-registry?${params}`);
      const json = await res.json();
      if (json.success) {
        setRegistryEntries(json.data);
        setPagination(json.pagination);
      }
    } catch (err) { console.error('Failed to fetch registry:', err); }
    finally { setRegistryLoading(false); }
  }, [filterYear, filterType, filterSource, filterSearch]);

  useEffect(() => { fetchRanges(); }, [fetchRanges]);
  useEffect(() => { fetchRegistry(); }, [fetchRegistry]);

  // ── Action handlers ────────────────────────────────────────

  const handleAddRange = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/number-ranges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRange),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Interval adaugat cu succes');
        setAddRangeOpen(false);
        setNewRange({ type: 'contract', year: new Date().getFullYear(), range_start: 0, range_end: 0, series: 'SM', notes: '' });
        fetchRanges();
      } else {
        toast.error(json.error || 'Eroare la adaugarea intervalului');
      }
    } catch { toast.error('Eroare de retea'); }
    finally { setSaving(false); }
  };

  const handleManualEntry = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/number-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...manualEntry,
          amount: manualEntry.amount ? parseFloat(manualEntry.amount) : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const nr = json.data[0];
        toast.success(`Numar alocat: ${nr.allocated_number} (${nr.allocated_series ? nr.allocated_series : ''}${manualEntry.type === 'contract' ? 'Contract' : 'Delegatie'} ${nr.allocated_year})`);
        setAddManualOpen(false);
        setManualEntry({ type: 'contract', client_name: '', client_email: '', client_cnp: '', client_cui: '', service_type: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
        fetchRegistry();
        fetchRanges(); // Refresh ranges too (available count changed)
      } else {
        toast.error(json.error || 'Eroare la alocarea numarului');
      }
    } catch { toast.error('Eroare de retea'); }
    finally { setSaving(false); }
  };

  const handleVoid = async () => {
    if (!voidEntryId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings/number-registry/${voidEntryId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: voidReason }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Numar anulat cu succes');
        setVoidDialogOpen(false);
        setVoidEntryId(null);
        setVoidReason('');
        fetchRegistry();
      } else {
        toast.error(json.error || 'Eroare la anularea numarului');
      }
    } catch { toast.error('Eroare de retea'); }
    finally { setSaving(false); }
  };

  const handleExport = async () => {
    const params = new URLSearchParams({ year: String(filterYear) });
    if (filterType) params.set('type', filterType);
    if (filterSource) params.set('source', filterSource);
    if (filterSearch) params.set('search', filterSearch);
    window.open(`/api/admin/settings/number-registry/export?${params}`, '_blank');
  };

  const handleArchiveRange = async (rangeId: string) => {
    try {
      const res = await fetch(`/api/admin/settings/number-ranges/${rangeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Interval arhivat');
        fetchRanges();
      } else {
        toast.error(json.error || 'Eroare');
      }
    } catch { toast.error('Eroare de retea'); }
  };

  // ── Helpers ────────────────────────────────────────────────

  function getProgressColor(percent: number): string {
    if (percent < 70) return 'bg-green-500';
    if (percent < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Alerts: ranges near exhaustion */}
      {ranges.filter(r => r.status === 'active' && r.usage_percent >= 90).length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="pt-4">
            {ranges.filter(r => r.status === 'active' && r.usage_percent >= 90).map(r => (
              <div key={r.id} className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Interval {r.type === 'contract' ? 'contracte' : 'imputerniciri'} {r.year}:
                  {' '}{r.usage_percent}% utilizat ({r.available} ramase)
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alert: no active contract range for current year */}
      {!rangesLoading && !ranges.some(r => r.type === 'contract' && r.year === new Date().getFullYear() && r.status === 'active') && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <ShieldAlert className="h-4 w-4" />
              <span>Nu exista interval activ pentru contracte {new Date().getFullYear()}!</span>
            </div>
          </CardContent>
        </Card>
      )}
      {!rangesLoading && !ranges.some(r => r.type === 'delegation' && r.year === new Date().getFullYear() && r.status === 'active') && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <ShieldAlert className="h-4 w-4" />
              <span>Nu exista interval activ pentru imputerniciri {new Date().getFullYear()}!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Ranges */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Intervale Numere</CardTitle>
            <CardDescription>Intervale alocate de Baroul Satu Mare</CardDescription>
          </div>
          <Button size="sm" onClick={() => setAddRangeOpen(true)}>
            + Adauga interval
          </Button>
        </CardHeader>
        <CardContent>
          {rangesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : ranges.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nu exista intervale configurate.</p>
          ) : (
            <div className="space-y-4">
              {ranges.map(range => (
                <div key={range.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {range.type === 'contract' ? 'Contracte Asistenta' : 'Imputerniciri'} {range.year}
                        {range.series ? ` (Seria ${range.series})` : ''}
                      </span>
                      <Badge variant={range.status === 'active' ? 'default' : range.status === 'exhausted' ? 'destructive' : 'secondary'}>
                        {range.status === 'active' ? 'Activ' : range.status === 'exhausted' ? 'Epuizat' : 'Arhivat'}
                      </Badge>
                    </div>
                    {range.status === 'active' && (
                      <Button variant="ghost" size="sm" onClick={() => handleArchiveRange(range.id)}>
                        Arhiveaza
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span>{range.range_start} - {range.range_end}</span>
                    <span>{range.used}/{range.total} utilizate ({range.usage_percent}%)</span>
                    {range.status === 'active' && <span>Urmatorul: {range.next_number}</span>}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(range.usage_percent)}`}
                      style={{ width: `${Math.min(range.usage_percent, 100)}%` }}
                    />
                  </div>
                  {range.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{range.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registry Journal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Jurnal Numere</CardTitle>
            <CardDescription>Evidenta completa a numerelor alocate</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport}>
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setAddManualOpen(true)}>
              + Alocare manuala
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              className="border rounded px-3 py-1.5 text-sm"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="">Toate tipurile</option>
              <option value="contract">Contract</option>
              <option value="delegation">Delegatie</option>
            </select>
            <Input
              type="number"
              placeholder="An"
              className="w-24"
              value={filterYear}
              onChange={e => setFilterYear(parseInt(e.target.value) || new Date().getFullYear())}
            />
            <select
              className="border rounded px-3 py-1.5 text-sm"
              value={filterSource}
              onChange={e => setFilterSource(e.target.value)}
            >
              <option value="">Toate sursele</option>
              <option value="platform">Platforma</option>
              <option value="manual">Manual</option>
              <option value="reserved">Rezervat</option>
              <option value="voided">Anulat</option>
            </select>
            <Input
              type="text"
              placeholder="Cauta client..."
              className="w-48"
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          {registryLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : registryEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nu exista inregistrari.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2 px-2 font-medium">Nr</th>
                      <th className="py-2 px-2 font-medium">Tip</th>
                      <th className="py-2 px-2 font-medium">Serie</th>
                      <th className="py-2 px-2 font-medium">Data</th>
                      <th className="py-2 px-2 font-medium">Client</th>
                      <th className="py-2 px-2 font-medium">CNP/CUI</th>
                      <th className="py-2 px-2 font-medium">Serviciu</th>
                      <th className="py-2 px-2 font-medium">Suma</th>
                      <th className="py-2 px-2 font-medium">Sursa</th>
                      <th className="py-2 px-2 font-medium">Actiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registryEntries.map(entry => (
                      <tr
                        key={entry.id}
                        className={`border-b ${entry.voided_at ? 'bg-red-50 line-through text-muted-foreground' : ''}`}
                      >
                        <td className="py-2 px-2 font-mono">{entry.number}</td>
                        <td className="py-2 px-2">
                          <Badge variant={entry.type === 'contract' ? 'default' : 'secondary'}>
                            {entry.type === 'contract' ? 'Contract' : 'Delegatie'}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">{entry.series || '-'}</td>
                        <td className="py-2 px-2">
                          {new Date(entry.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="py-2 px-2">{entry.client_name}</td>
                        <td className="py-2 px-2 font-mono text-xs">{entry.client_cnp || entry.client_cui || '-'}</td>
                        <td className="py-2 px-2">{entry.service_type || '-'}</td>
                        <td className="py-2 px-2">{entry.amount ? `${entry.amount} RON` : '-'}</td>
                        <td className="py-2 px-2">
                          <Badge variant={
                            entry.source === 'platform' ? 'default' :
                            entry.source === 'manual' ? 'secondary' :
                            entry.source === 'voided' ? 'destructive' : 'outline'
                          }>
                            {entry.source === 'platform' ? 'Platforma' :
                             entry.source === 'manual' ? 'Manual' :
                             entry.source === 'voided' ? 'Anulat' : 'Rezervat'}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">
                          {!entry.voided_at && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                setVoidEntryId(entry.id);
                                setVoidDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    Pagina {pagination.page} din {pagination.total_pages} ({pagination.total} total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchRegistry(pagination.page - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.total_pages}
                      onClick={() => fetchRegistry(pagination.page + 1)}
                    >
                      Urmator
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Range Dialog */}
      <Dialog open={addRangeOpen} onOpenChange={setAddRangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adauga Interval Numere</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tip</Label>
              <select className="w-full border rounded px-3 py-2 mt-1" value={newRange.type} onChange={e => setNewRange({...newRange, type: e.target.value as 'contract' | 'delegation'})}>
                <option value="contract">Contract Asistenta Juridica</option>
                <option value="delegation">Imputernicire Avocatiala</option>
              </select>
            </div>
            <div>
              <Label>An</Label>
              <Input type="number" value={newRange.year} onChange={e => setNewRange({...newRange, year: parseInt(e.target.value) || new Date().getFullYear()})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Numar start</Label>
                <Input type="number" value={newRange.range_start || ''} onChange={e => setNewRange({...newRange, range_start: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <Label>Numar sfarsit</Label>
                <Input type="number" value={newRange.range_end || ''} onChange={e => setNewRange({...newRange, range_end: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            {newRange.range_start > 0 && newRange.range_end >= newRange.range_start && (
              <p className="text-sm text-muted-foreground">
                Interval: {newRange.range_start} - {newRange.range_end} ({newRange.range_end - newRange.range_start + 1} numere)
              </p>
            )}
            {newRange.type === 'delegation' && (
              <div>
                <Label>Seria</Label>
                <Input value={newRange.series} onChange={e => setNewRange({...newRange, series: e.target.value})} placeholder="SM" />
              </div>
            )}
            <div>
              <Label>Note (optional)</Label>
              <Textarea value={newRange.notes} onChange={e => setNewRange({...newRange, notes: e.target.value})} placeholder="Ex: Interval primit ianuarie 2026" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRangeOpen(false)}>Anuleaza</Button>
            <Button onClick={handleAddRange} disabled={saving || newRange.range_start <= 0 || newRange.range_end < newRange.range_start}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Adauga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={addManualOpen} onOpenChange={setAddManualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alocare Manuala Numar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tip</Label>
              <select className="w-full border rounded px-3 py-2 mt-1" value={manualEntry.type} onChange={e => setManualEntry({...manualEntry, type: e.target.value as 'contract' | 'delegation'})}>
                <option value="contract">Contract</option>
                <option value="delegation">Imputernicire</option>
              </select>
            </div>
            <div>
              <Label>Nume client *</Label>
              <Input value={manualEntry.client_name} onChange={e => setManualEntry({...manualEntry, client_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CNP</Label>
                <Input value={manualEntry.client_cnp} onChange={e => setManualEntry({...manualEntry, client_cnp: e.target.value})} maxLength={13} />
              </div>
              <div>
                <Label>CUI</Label>
                <Input value={manualEntry.client_cui} onChange={e => setManualEntry({...manualEntry, client_cui: e.target.value})} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={manualEntry.client_email} onChange={e => setManualEntry({...manualEntry, client_email: e.target.value})} />
            </div>
            <div>
              <Label>Serviciu / Descriere</Label>
              <Input value={manualEntry.service_type} onChange={e => setManualEntry({...manualEntry, service_type: e.target.value})} placeholder="Ex: Consultanta juridica" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Suma (RON)</Label>
                <Input type="number" step="0.01" value={manualEntry.amount} onChange={e => setManualEntry({...manualEntry, amount: e.target.value})} />
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={manualEntry.date} onChange={e => setManualEntry({...manualEntry, date: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddManualOpen(false)}>Anuleaza</Button>
            <Button onClick={handleManualEntry} disabled={saving || !manualEntry.client_name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Aloca numar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anulare Numar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Numarul anulat nu va putea fi reutilizat. Aceasta actiune este ireversibila.
            </p>
            <div>
              <Label>Motiv anulare</Label>
              <Textarea value={voidReason} onChange={e => setVoidReason(e.target.value)} placeholder="Ex: Comanda anulata de client" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setVoidDialogOpen(false); setVoidEntryId(null); setVoidReason(''); }}>Anuleaza</Button>
            <Button variant="destructive" onClick={handleVoid} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Anuleaza numarul
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
