'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Truck,
  Package,
  MapPin,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { cn } from '@/lib/utils';

// Romanian counties
const COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
  'Brașov', 'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași',
  'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș',
  'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj',
  'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea',
];

// Default delivery methods
interface DeliveryMethodOption {
  type: 'email' | 'registered_mail' | 'courier';
  name: string;
  price: number;
  estimatedDays: number;
}

const DEFAULT_DELIVERY_METHODS: DeliveryMethodOption[] = [
  {
    type: 'email',
    name: 'Email (PDF)',
    price: 0,
    estimatedDays: 0,
  },
  {
    type: 'registered_mail',
    name: 'Poștă Recomandată',
    price: 20,
    estimatedDays: 5,
  },
  {
    type: 'courier',
    name: 'Curier (Fan Courier)',
    price: 35,
    estimatedDays: 2,
  },
];

// Delivery icons
const DELIVERY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  registered_mail: Package,
  courier: Truck,
};

const addressSchema = z.object({
  street: z.string().min(2, 'Strada este obligatorie'),
  number: z.string().min(1, 'Numărul este obligatoriu'),
  building: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().min(2, 'Localitatea este obligatorie'),
  county: z.string().min(1, 'Județul este obligatoriu'),
  postalCode: z.string()
    .length(6, 'Codul poștal trebuie să aibă 6 cifre')
    .regex(/^\d{6}$/, 'Codul poștal trebuie să conțină doar cifre'),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface DeliveryStepProps {
  onValidChange: (valid: boolean) => void;
}

export function DeliveryStepModular({ onValidChange }: DeliveryStepProps) {
  const { state, updateDelivery } = useModularWizard();
  const { delivery } = state;

  // Selected delivery method
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethodOption | null>(
    delivery.method ? DEFAULT_DELIVERY_METHODS.find(m => m.type === delivery.method) || null : null
  );

  // Show address form for physical delivery
  const needsAddress = selectedMethod?.type && selectedMethod.type !== 'email';

  // Address form
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: delivery.address?.street || '',
      number: delivery.address?.number || '',
      building: delivery.address?.building || '',
      apartment: delivery.address?.apartment || '',
      city: delivery.address?.city || '',
      county: delivery.address?.county || '',
      postalCode: delivery.address?.postalCode || '',
    },
    mode: 'onChange',
  });

  const { isValid: isAddressValid } = form.formState;

  // Validate step
  useEffect(() => {
    const methodSelected = !!selectedMethod;
    const addressValid = !needsAddress || isAddressValid;

    onValidChange(methodSelected && addressValid);
  }, [selectedMethod, needsAddress, isAddressValid, onValidChange]);

  // Update context when address changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (needsAddress) {
        updateDelivery({
          address: {
            street: value.street || '',
            number: value.number || '',
            building: value.building,
            apartment: value.apartment,
            city: value.city || '',
            county: value.county || '',
            postalCode: value.postalCode || '',
          },
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateDelivery, needsAddress]);

  // Handle method selection
  const handleMethodSelect = (method: DeliveryMethodOption) => {
    setSelectedMethod(method);
    updateDelivery({
      method: method.type,
      methodName: method.name,
      price: method.price,
      estimatedDays: method.estimatedDays,
    });
  };

  return (
    <div className="space-y-8">
      {/* Delivery Method Selection */}
      <div className="space-y-4">
        <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary-500" />
          Metodă de Livrare
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DEFAULT_DELIVERY_METHODS.map((method) => {
            const Icon = DELIVERY_ICONS[method.type] || Package;
            const isSelected = selectedMethod?.type === method.type;

            return (
              <div
                key={method.type}
                onClick={() => handleMethodSelect(method)}
                className={cn(
                  'relative p-4 rounded-xl border-2 cursor-pointer transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-neutral-200 hover:border-primary-300'
                )}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-5 h-5 text-primary-600" />
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center mb-3',
                      isSelected ? 'bg-primary-200' : 'bg-neutral-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-6 h-6',
                        isSelected ? 'text-primary-700' : 'text-neutral-600'
                      )}
                    />
                  </div>

                  <h4 className="font-semibold text-secondary-900">{method.name}</h4>

                  <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    {method.estimatedDays === 0
                      ? 'Instant'
                      : `+${method.estimatedDays} zile`}
                  </div>

                  <div
                    className={cn(
                      'mt-2 px-3 py-1 rounded-full text-sm font-bold',
                      isSelected
                        ? 'bg-primary-200 text-primary-800'
                        : 'bg-neutral-100 text-neutral-700'
                    )}
                  >
                    {method.price === 0 ? 'GRATUIT' : `+${method.price} RON`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Address Form (for physical delivery) */}
      {needsAddress && (
        <div className="space-y-4">
          <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-500" />
            Adresă de Livrare
          </h3>

          <Form {...form}>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Street */}
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Strada <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Strada, Bulevardul, Aleea..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Number */}
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Număr <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nr." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Building */}
              <FormField
                control={form.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bloc / Scara</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Bl., Sc., Et., Ap." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localitate <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Oraș, Comună..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* County */}
              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Județ <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează județul" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTIES.map((county) => (
                          <SelectItem key={county} value={county}>
                            {county}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Postal Code */}
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cod Poștal <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="000000"
                        maxLength={6}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
