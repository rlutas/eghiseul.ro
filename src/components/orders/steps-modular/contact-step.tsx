'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MessageCircle } from 'lucide-react';
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

export function ContactStepModular({ onValidChange }: ContactStepProps) {
  const { state, updateContact } = useModularWizard();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: state.contact.email || '',
      phone: state.contact.phone || '+40 ',
      preferredContact: state.contact.preferredContact || 'email',
    },
    mode: 'onChange',
  });

  const { isValid } = form.formState;

  // Update parent validity
  useEffect(() => {
    onValidChange(isValid);
  }, [isValid, onValidChange]);

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
