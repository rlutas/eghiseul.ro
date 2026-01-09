'use client';

/**
 * AddressForm Component
 *
 * Reusable form for entering Romanian or international addresses.
 * Supports county/locality dropdowns for Romanian addresses.
 *
 * Used in:
 * - Account page (AddressesTab)
 * - Order wizard (PersonalDataStep, DeliveryStep)
 */

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COUNTY_NAMES, getLocalitiesForCounty, getCountyName, findCounty } from '@/lib/data/romania-counties';

export interface AddressData {
  label?: string;
  country: string;
  county?: string;
  city: string;
  street: string;
  number: string;
  building?: string;
  staircase?: string;
  floor?: string;
  apartment?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface AddressFormProps {
  value: Partial<AddressData>;
  onChange: (data: AddressData) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  showLabel?: boolean;
  showIsDefault?: boolean;
  showCountrySelect?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  className?: string;
}

// Common countries for delivery
const COUNTRIES = [
  { code: 'RO', name: 'România' },
  { code: 'MD', name: 'Moldova' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HU', name: 'Ungaria' },
  { code: 'UA', name: 'Ucraina' },
  { code: 'RS', name: 'Serbia' },
  { code: 'DE', name: 'Germania' },
  { code: 'IT', name: 'Italia' },
  { code: 'ES', name: 'Spania' },
  { code: 'FR', name: 'Franța' },
  { code: 'UK', name: 'Marea Britanie' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgia' },
  { code: 'NL', name: 'Olanda' },
  { code: 'OTHER', name: 'Altă țară' },
];

export default function AddressForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  showLabel = true,
  showIsDefault = true,
  showCountrySelect = true,
  submitLabel = 'Salvează',
  cancelLabel = 'Anulează',
  loading = false,
  className,
}: AddressFormProps) {
  const [localities, setLocalities] = useState<string[]>([]);
  const isRomania = value.country === 'RO' || !value.country;

  // Helper function to clean locality names from prefixes
  const cleanLocalityName = useCallback((name: string): string => {
    if (!name) return name;

    const prefixes = [
      /^sat\.\s*/i,
      /^sat\s+/i,
      /^com\.\s*/i,
      /^com\s+/i,
      /^comună\s+/i,
      /^comuna\s+/i,
      /^oraș\s+/i,
      /^oras\s+/i,
      /^mun\.\s*/i,
      /^mun\s+/i,
      /^municipiul\s+/i,
    ];

    let cleaned = name.trim();
    for (const prefix of prefixes) {
      cleaned = cleaned.replace(prefix, '');
    }

    return cleaned.trim();
  }, []);

  // Load localities when county changes
  useEffect(() => {
    if (isRomania && value.county) {
      const countyLocalities = getLocalitiesForCounty(value.county);
      setLocalities(countyLocalities);
    } else {
      setLocalities([]);
    }
  }, [value.county, isRomania]);

  // Handle county change with smart city matching
  const handleCountyChange = useCallback((countyName: string) => {
    const countyLocalities = getLocalitiesForCounty(countyName);
    setLocalities(countyLocalities);

    // Try to match current city in new localities list
    const currentCity = value.city || '';
    let newCity = '';

    if (currentCity && countyLocalities.length > 0) {
      // First check exact match
      if (countyLocalities.includes(currentCity)) {
        newCity = currentCity;
      } else {
        // Clean the city name and try again
        const cleanedCity = cleanLocalityName(currentCity);
        if (countyLocalities.includes(cleanedCity)) {
          newCity = cleanedCity;
        } else {
          // Try partial match
          const matchingLocality = countyLocalities.find(
            loc => loc.toLowerCase().includes(cleanedCity.toLowerCase()) ||
                   cleanedCity.toLowerCase().includes(loc.toLowerCase())
          );
          if (matchingLocality) {
            newCity = matchingLocality;
          }
        }
      }
    }

    onChange({
      ...value,
      country: value.country || 'RO',
      county: countyName,
      city: newCity,
      street: value.street || '',
      number: value.number || '',
    } as AddressData);
  }, [value, onChange, cleanLocalityName]);

  // Update field
  const updateField = useCallback((field: keyof AddressData, fieldValue: string | boolean) => {
    onChange({
      ...value,
      country: value.country || 'RO',
      city: value.city || '',
      street: value.street || '',
      number: value.number || '',
      [field]: fieldValue,
    } as AddressData);
  }, [value, onChange]);

  // Handle country change
  const handleCountryChange = useCallback((country: string) => {
    onChange({
      ...value,
      country,
      county: country === 'RO' ? value.county : undefined,
      city: value.city || '',
      street: value.street || '',
      number: value.number || '',
    } as AddressData);
  }, [value, onChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Label */}
      {showLabel && (
        <div className="space-y-2">
          <Label htmlFor="label" className="text-secondary-900 font-medium">
            Etichetă adresă
          </Label>
          <Input
            id="label"
            type="text"
            value={value.label || ''}
            onChange={(e) => updateField('label', e.target.value)}
            placeholder="ex: Acasă, Birou, Părinți"
            className="bg-white"
          />
        </div>
      )}

      {/* Country Select */}
      {showCountrySelect && (
        <div className="space-y-2">
          <Label className="text-secondary-900 font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary-500" />
            Țara
          </Label>
          <Select
            value={value.country || 'RO'}
            onValueChange={handleCountryChange}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selectează țara" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Romanian Address Fields */}
      {isRomania && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="county" className="text-secondary-900 font-medium">
                Județ <span className="text-red-500">*</span>
              </Label>
              <Select
                value={value.county || ''}
                onValueChange={handleCountyChange}
              >
                <SelectTrigger id="county" className="bg-white">
                  <SelectValue placeholder="— Selectează județul —" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {COUNTY_NAMES.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-secondary-900 font-medium">
                Localitate <span className="text-red-500">*</span>
              </Label>
              {localities.length > 0 ? (
                <Select
                  value={value.city || ''}
                  onValueChange={(val) => updateField('city', val)}
                >
                  <SelectTrigger id="city" className="bg-white">
                    <SelectValue placeholder="— Selectează localitatea —" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {localities.map((locality) => (
                      <SelectItem key={locality} value={locality}>
                        {locality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="city"
                  type="text"
                  value={value.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Selectează mai întâi județul"
                  className="bg-white"
                  disabled={!value.county}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="street" className="text-secondary-900 font-medium">
                Strada <span className="text-red-500">*</span>
              </Label>
              <Input
                id="street"
                type="text"
                value={value.street || ''}
                onChange={(e) => updateField('street', e.target.value)}
                placeholder="ex: Strada Victoriei"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number" className="text-secondary-900 font-medium">
                Nr. <span className="text-red-500">*</span>
              </Label>
              <Input
                id="number"
                type="text"
                value={value.number || ''}
                onChange={(e) => updateField('number', e.target.value)}
                placeholder="ex: 10"
                className="bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building" className="text-secondary-900 font-medium">
                Bloc
              </Label>
              <Input
                id="building"
                type="text"
                value={value.building || ''}
                onChange={(e) => updateField('building', e.target.value)}
                placeholder="A1"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staircase" className="text-secondary-900 font-medium">
                Scara
              </Label>
              <Input
                id="staircase"
                type="text"
                value={value.staircase || ''}
                onChange={(e) => updateField('staircase', e.target.value)}
                placeholder="A"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor" className="text-secondary-900 font-medium">
                Etaj
              </Label>
              <Input
                id="floor"
                type="text"
                value={value.floor || ''}
                onChange={(e) => updateField('floor', e.target.value)}
                placeholder="3"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apartment" className="text-secondary-900 font-medium">
                Apartament
              </Label>
              <Input
                id="apartment"
                type="text"
                value={value.apartment || ''}
                onChange={(e) => updateField('apartment', e.target.value)}
                placeholder="15"
                className="bg-white"
              />
            </div>
          </div>

          <div className="w-32 space-y-2">
            <Label htmlFor="postalCode" className="text-secondary-900 font-medium">
              Cod Poștal
            </Label>
            <Input
              id="postalCode"
              type="text"
              value={value.postalCode || ''}
              onChange={(e) => updateField('postalCode', e.target.value)}
              placeholder="010101"
              className="bg-white"
            />
          </div>
        </>
      )}

      {/* International Address Fields */}
      {!isRomania && (
        <>
          <div className="space-y-2">
            <Label htmlFor="city" className="text-secondary-900 font-medium">
              Oraș <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              type="text"
              value={value.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Numele orașului"
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street" className="text-secondary-900 font-medium">
              Adresă completă <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              type="text"
              value={value.street || ''}
              onChange={(e) => updateField('street', e.target.value)}
              placeholder="Strada, număr, bloc, apartament"
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number" className="text-secondary-900 font-medium">
                Nr. <span className="text-red-500">*</span>
              </Label>
              <Input
                id="number"
                type="text"
                value={value.number || ''}
                onChange={(e) => updateField('number', e.target.value)}
                placeholder="ex: 10"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-secondary-900 font-medium">
                Cod Poștal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="postalCode"
                type="text"
                value={value.postalCode || ''}
                onChange={(e) => updateField('postalCode', e.target.value)}
                placeholder="Cod poștal"
                className="bg-white"
              />
            </div>
          </div>
        </>
      )}

      {/* Is Default Checkbox */}
      {showIsDefault && (
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="isDefault"
            checked={value.isDefault || false}
            onCheckedChange={(checked) => updateField('isDefault', !!checked)}
          />
          <Label
            htmlFor="isDefault"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Setează ca adresă implicită
          </Label>
        </div>
      )}

      {/* Action Buttons */}
      {(onSubmit || onCancel) && (
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
          )}
          {onSubmit && (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
            >
              {loading ? 'Se salvează...' : submitLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
