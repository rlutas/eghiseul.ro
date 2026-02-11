'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MessageCircle, CheckCircle, Pencil, User } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useModularWizard } from '@/providers/modular-wizard-provider';

const contactSchema = z.object({
  email: z.string().email('Introdu o adresă de email validă'),
  phone: z
    .string()
    .regex(
      /^\+40\s?7[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}$/,
      'Format valid: +40 7XX XXX XXX'
    ),
  preferredContact: z.enum(['email', 'phone', 'whatsapp']),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactStepProps {
  onValidChange: (valid: boolean) => void;
}

// Helper to format phone from various formats to +40 7XX XXX XXX
function formatPhoneForDisplay(phone: string | undefined): string {
  if (!phone) return '+40 ';

  const digits = phone.replace(/\D/g, '');

  // Handle Romanian phone numbers
  if (digits.startsWith('40') && digits.length >= 11) {
    // Already has country code: 40712345678
    return '+' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 11);
  } else if (digits.startsWith('07') && digits.length === 10) {
    // Local format: 0712345678
    return '+40 ' + digits.slice(1, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7, 10);
  } else if (digits.startsWith('7') && digits.length === 9) {
    // Without 0: 712345678
    return '+40 ' + digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 9);
  }

  // Fallback: just format what we have
  if (digits.length >= 2) {
    return '+' + digits.slice(0, 2) + ' ' + (digits.length > 2 ? digits.slice(2) : '');
  }

  return '+40 ';
}

export function ContactStepModular({ onValidChange }: ContactStepProps) {
  const { state, updateContact, isPrefilled } = useModularWizard();
  const [showEditMode, setShowEditMode] = useState(false);

  // Check if we have valid prefilled contact data
  const formattedPhone = formatPhoneForDisplay(state.contact.phone);
  const hasValidPrefilledData = isPrefilled &&
    state.contact.email &&
    state.contact.email.includes('@') &&
    formattedPhone.length >= 15; // +40 7XX XXX XXX = 16 chars

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: state.contact.email || '',
      phone: formattedPhone,
      preferredContact: state.contact.preferredContact || 'email',
    },
    mode: 'onChange',
  });

  const { isValid } = form.formState;

  // Update parent validity - if prefilled and valid, mark as valid immediately
  useEffect(() => {
    if (hasValidPrefilledData && !showEditMode) {
      onValidChange(true);
    } else {
      onValidChange(isValid);
    }
  }, [isValid, onValidChange, hasValidPrefilledData, showEditMode]);

  // Update context when form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateContact({
        email: value.email,
        phone: value.phone,
        preferredContact: value.preferredContact,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, updateContact]);

  // Auto-format phone number
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return '+' + digits;
    if (digits.length <= 5) return '+' + digits.slice(0, 2) + ' ' + digits.slice(2);
    if (digits.length <= 8) return '+' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5);
    return '+' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 11);
  };

  // Compact prefilled view
  if (hasValidPrefilledData && !showEditMode) {
    return (
      <div className="space-y-6">
        {/* Prefilled Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-800">
                Date preluate din contul tău
              </p>
              <p className="text-sm text-green-700 mt-1">
                Te vom contacta pe datele de mai jos. Poți continua sau modifica dacă e nevoie.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Summary Card */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Date de Contact
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEditMode(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Modifică
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Mail className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-medium text-secondary-900">{state.contact.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Phone className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-neutral-500">Telefon</p>
                <p className="font-medium text-secondary-900">{formattedPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-neutral-500">Metoda preferată</p>
                <p className="font-medium text-secondary-900 capitalize">
                  {state.contact.preferredContact === 'email' ? 'Email' :
                   state.contact.preferredContact === 'phone' ? 'Telefon' :
                   state.contact.preferredContact === 'whatsapp' ? 'WhatsApp' :
                   'Email'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-secondary-900 font-medium">
                Adresă Email <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="email@exemplu.ro"
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Vei primi confirmarea comenzii și documentele pe acest email
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-secondary-900 font-medium">
                Număr de Telefon <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    {...field}
                    type="tel"
                    placeholder="+40 7XX XXX XXX"
                    className="pl-10"
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Te vom contacta în caz de nelămuriri
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preferred Contact Method */}
        <FormField
          control={form.control}
          name="preferredContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-secondary-900 font-medium">
                Metodă Preferată de Contact
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
                >
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      field.value === 'email'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <RadioGroupItem value="email" className="sr-only" />
                    <Mail className={`h-5 w-5 ${field.value === 'email' ? 'text-primary-600' : 'text-neutral-400'}`} />
                    <div>
                      <p className="font-medium text-secondary-900">Email</p>
                      <p className="text-xs text-neutral-500">Răspuns în 24h</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      field.value === 'phone'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <RadioGroupItem value="phone" className="sr-only" />
                    <Phone className={`h-5 w-5 ${field.value === 'phone' ? 'text-primary-600' : 'text-neutral-400'}`} />
                    <div>
                      <p className="font-medium text-secondary-900">Telefon</p>
                      <p className="text-xs text-neutral-500">L-V, 9-18</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      field.value === 'whatsapp'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <RadioGroupItem value="whatsapp" className="sr-only" />
                    <MessageCircle className={`h-5 w-5 ${field.value === 'whatsapp' ? 'text-primary-600' : 'text-neutral-400'}`} />
                    <div>
                      <p className="font-medium text-secondary-900">WhatsApp</p>
                      <p className="text-xs text-neutral-500">Rapid și simplu</p>
                    </div>
                  </label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
