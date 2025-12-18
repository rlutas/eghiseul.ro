'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Truck,
  Package,
  MapPin,
  PenTool,
  Eraser,
  CheckCircle,
  Info,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrderWizard } from '@/providers/order-wizard-provider';
import { DeliveryMethod } from '@/types/services';
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
const DEFAULT_DELIVERY_METHODS: DeliveryMethod[] = [
  {
    type: 'email',
    name: 'Email (PDF)',
    price: 0,
    estimated_days: 0,
  },
  {
    type: 'registered_mail',
    name: 'Poștă Recomandată',
    price: 20,
    estimated_days: 5,
  },
  {
    type: 'courier',
    name: 'Curier (Fan Courier)',
    price: 35,
    estimated_days: 2,
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
  postal_code: z.string()
    .length(6, 'Codul poștal trebuie să aibă 6 cifre')
    .regex(/^\d{6}$/, 'Codul poștal trebuie să conțină doar cifre'),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface DeliveryStepProps {
  onValidChange: (valid: boolean) => void;
}

export function DeliveryStep({ onValidChange }: DeliveryStepProps) {
  const { state, updateDelivery, updateSignature, priceBreakdown } = useOrderWizard();
  const { service, deliverySelection, signatureData, personalData } = state;

  // Signature canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!signatureData.signature_base64);

  // Selected delivery method
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod | null>(
    deliverySelection.method || null
  );

  // Terms accepted
  const [termsAccepted, setTermsAccepted] = useState(signatureData.accepted_terms || false);

  // Show address form for physical delivery
  const needsAddress = selectedMethod?.type && selectedMethod.type !== 'email';

  // Get delivery methods from service config or use defaults
  const deliveryMethods =
    service?.config?.delivery_methods || DEFAULT_DELIVERY_METHODS;

  // Address form
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: deliverySelection.address?.street || personalData.address?.street || '',
      number: deliverySelection.address?.number || personalData.address?.number || '',
      building: deliverySelection.address?.building || personalData.address?.building || '',
      apartment: deliverySelection.address?.apartment || personalData.address?.apartment || '',
      city: deliverySelection.address?.city || personalData.address?.city || '',
      county: deliverySelection.address?.county || personalData.address?.county || '',
      postal_code: deliverySelection.address?.postal_code || personalData.address?.postal_code || '',
    },
    mode: 'onChange',
  });

  const { isValid: isAddressValid } = form.formState;

  // Validate step
  useEffect(() => {
    const methodSelected = !!selectedMethod;
    const addressValid = !needsAddress || isAddressValid;
    const signatureValid = hasSignature;
    const termsValid = termsAccepted;

    onValidChange(methodSelected && addressValid && signatureValid && termsValid);
  }, [selectedMethod, needsAddress, isAddressValid, hasSignature, termsAccepted, onValidChange]);

  // Update context when address changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (needsAddress) {
        updateDelivery({ address: value as AddressFormData });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, needsAddress, updateDelivery]);

  // Handle delivery method selection
  const handleMethodSelect = (method: DeliveryMethod) => {
    setSelectedMethod(method);
    updateDelivery({ method, address: method.type === 'email' ? undefined : deliverySelection.address });
  };

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Style
    ctx.strokeStyle = '#06101F';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load existing signature if any
    if (signatureData.signature_base64) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = signatureData.signature_base64;
    }
  }, [signatureData.signature_base64]);

  // Drawing functions
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    setHasSignature(true);

    // Save signature to context
    const canvas = canvasRef.current;
    if (canvas) {
      const signature = canvas.toDataURL('image/png');
      updateSignature({
        signature_base64: signature,
        signed_at: new Date().toISOString(),
      });
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    updateSignature({ signature_base64: undefined, signed_at: undefined });
  };

  // Handle terms change
  const handleTermsChange = (checked: boolean) => {
    setTermsAccepted(checked);
    updateSignature({ accepted_terms: checked });
  };

  return (
    <div className="space-y-8">
      {/* Delivery Method Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold text-secondary-900">Metodă de Livrare</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {deliveryMethods.map((method) => {
            const Icon = DELIVERY_ICONS[method.type] || Package;
            const isSelected = selectedMethod?.type === method.type;

            return (
              <button
                key={method.type}
                type="button"
                onClick={() => handleMethodSelect(method)}
                className={cn(
                  'relative p-4 rounded-xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-neutral-200 hover:border-primary-300'
                )}
              >
                {/* Selection indicator */}
                <div
                  className={cn(
                    'absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    isSelected
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-neutral-300 bg-white'
                  )}
                >
                  {isSelected && <CheckCircle className="w-4 h-4 text-secondary-900" />}
                </div>

                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                    isSelected ? 'bg-primary-200' : 'bg-neutral-100'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      isSelected ? 'text-primary-700' : 'text-neutral-500'
                    )}
                  />
                </div>

                <h4 className="font-semibold text-secondary-900 mb-1">{method.name}</h4>

                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Clock className="w-4 h-4" />
                  {method.estimated_days === 0
                    ? 'Instant'
                    : `${method.estimated_days} zile`}
                </div>

                <div className="mt-2">
                  <span
                    className={cn(
                      'text-sm font-bold px-2 py-0.5 rounded',
                      method.price === 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-100 text-neutral-700'
                    )}
                  >
                    {method.price === 0 ? 'Gratuit' : `+${method.price} RON`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Address Form (for physical delivery) */}
      {needsAddress && (
        <div className="space-y-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-500" />
            <h3 className="font-semibold text-secondary-900">Adresă de Livrare</h3>
          </div>

          <Form {...form}>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strada *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Strada Exemplu" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nr. *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="building"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bloc</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="A1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apartment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ap.</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="25" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localitate *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="București" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Județ *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selectează" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
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
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cod Poștal *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          inputMode="numeric"
                          placeholder="010101"
                          maxLength={6}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                            field.onChange(digits);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Electronic Signature */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PenTool className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold text-secondary-900">Semnătură Electronică</h3>
        </div>

        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4">
          {/* Signature Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex gap-2 text-sm text-blue-800">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                Prin semnarea de mai jos, confirmi că toate informațiile furnizate sunt corecte
                și autorizezi eGhiseul.ro să acționeze în numele tău.
              </p>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              className={cn(
                'w-full h-40 rounded-lg border-2 touch-none',
                hasSignature ? 'border-green-300' : 'border-neutral-300',
                'bg-white cursor-crosshair'
              )}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-neutral-400 text-sm">Semnează aici</span>
              </div>
            )}
          </div>

          {/* Clear Button */}
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSignature}
              className="text-neutral-500"
            >
              <Eraser className="h-4 w-4 mr-2" />
              Șterge semnătura
            </Button>
          </div>

          {/* Status */}
          {hasSignature && (
            <div className="flex items-center gap-2 mt-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Semnătură înregistrată</span>
            </div>
          )}
        </div>
      </div>

      {/* Terms Acceptance */}
      <div className="space-y-4">
        <div
          className={cn(
            'p-4 rounded-xl border-2 transition-colors',
            termsAccepted
              ? 'border-green-300 bg-green-50'
              : 'border-neutral-200 bg-white'
          )}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={termsAccepted}
              onCheckedChange={handleTermsChange}
              className="mt-0.5"
            />
            <div className="text-sm">
              <p className="text-secondary-900">
                Confirm că am citit și sunt de acord cu{' '}
                <a
                  href="/termeni-si-conditii"
                  target="_blank"
                  className="text-primary-600 hover:underline"
                >
                  Termenii și Condițiile
                </a>{' '}
                și{' '}
                <a
                  href="/politica-de-confidentialitate"
                  target="_blank"
                  className="text-primary-600 hover:underline"
                >
                  Politica de Confidențialitate
                </a>
                .
              </p>
              <p className="text-neutral-500 mt-1">
                Înțeleg că datele mele personale vor fi procesate conform GDPR.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Summary */}
      {selectedMethod && (
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4">
          <h4 className="font-medium text-secondary-900 mb-2">Rezumat Livrare</h4>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">{selectedMethod.name}</span>
            <span className="font-medium">
              {selectedMethod.price === 0 ? 'Gratuit' : `+${selectedMethod.price} RON`}
            </span>
          </div>
          {selectedMethod.estimated_days > 0 && (
            <p className="text-xs text-neutral-500 mt-1">
              Livrare estimată: {selectedMethod.estimated_days} zile lucrătoare
            </p>
          )}
        </div>
      )}
    </div>
  );
}
