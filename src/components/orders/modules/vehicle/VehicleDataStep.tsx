'use client';

/**
 * VehicleDataStep Component
 *
 * Collects vehicle data for auto services (Cazier Auto, Rovinieta).
 */

import { useCallback, useState, useEffect } from 'react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Car, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import type { VehicleVerificationConfig, ServiceVerificationConfig } from '@/types/verification-modules';

interface VehicleDataStepProps {
  config: VehicleVerificationConfig;
  onValidChange: (valid: boolean) => void;
}

// Rovinieta categories
const ROVINIETA_CATEGORIES = [
  { value: 'A', label: 'Categoria A - Motociclete' },
  { value: 'B', label: 'Categoria B - Autoturisme < 3.5t' },
  { value: 'C', label: 'Categoria C - Vehicule 3.5t - 7.5t' },
  { value: 'D', label: 'Categoria D - Vehicule 7.5t - 12t' },
  { value: 'E', label: 'Categoria E - Vehicule > 12t, 2 axe' },
  { value: 'F', label: 'Categoria F - Vehicule > 12t, 3 axe' },
  { value: 'G', label: 'Categoria G - Vehicule > 12t, 4+ axe' },
];

// Rovinieta periods
const ROVINIETA_PERIODS = [
  { value: 'ONE_DAY', label: '1 zi' },
  { value: 'SEVEN_DAYS', label: '7 zile' },
  { value: 'THIRTY_DAYS', label: '30 zile' },
  { value: 'NINETY_DAYS', label: '90 zile' },
  { value: 'SIX_MONTHS', label: '6 luni' },
  { value: 'TWELVE_MONTHS', label: '12 luni' },
];

// Romanian plate format validation
const ROMANIAN_PLATE_REGEX = /^(B|[A-Z]{2})\s*\d{2,3}\s*[A-Z]{3}$/i;

export default function VehicleDataStep({ config, onValidChange }: VehicleDataStepProps) {
  const { state, updateVehicle } = useModularWizard();
  const vehicle = state.vehicle;
  const fullConfig = state.verificationConfig;

  const [plateError, setPlateError] = useState<string | null>(null);
  const [vinError, setVinError] = useState<string | null>(null);

  // Check if this is a redirect service (like Rovinieta)
  const isRedirectService = fullConfig?.externalRedirect?.enabled;

  // Validate Romanian plate format
  const validatePlate = useCallback((plate: string): boolean => {
    if (config.plateFormat === 'any') return true;

    const cleanPlate = plate.replace(/\s/g, '').toUpperCase();
    if (!cleanPlate) return false;

    return ROMANIAN_PLATE_REGEX.test(cleanPlate);
  }, [config.plateFormat]);

  // Validate VIN (basic format check)
  const validateVIN = useCallback((vin: string): boolean => {
    if (!config.vinValidation) return true;
    if (!vin) return !config.fields.vin.required;

    // VIN must be 17 characters, no I, O, Q
    const cleanVIN = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    return cleanVIN.length === 17;
  }, [config.vinValidation, config.fields.vin.required]);

  // Handle plate number change
  const handlePlateChange = useCallback((value: string) => {
    const formattedPlate = value.toUpperCase();
    updateVehicle?.({ plateNumber: formattedPlate });

    if (formattedPlate && config.plateFormat === 'romanian' && !validatePlate(formattedPlate)) {
      setPlateError('Format invalid. Ex: B 123 ABC sau CJ 01 XYZ');
    } else {
      setPlateError(null);
    }
  }, [config.plateFormat, updateVehicle, validatePlate]);

  // Handle VIN change
  const handleVINChange = useCallback((value: string) => {
    const cleanVIN = value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    updateVehicle?.({ vin: cleanVIN });

    if (cleanVIN && config.vinValidation && !validateVIN(cleanVIN)) {
      setVinError('VIN invalid. Trebuie să aibă 17 caractere alfanumerice.');
    } else {
      setVinError(null);
    }
  }, [config.vinValidation, updateVehicle, validateVIN]);

  // Validate form
  const isFormValid = useCallback(() => {
    if (!vehicle) return false;

    // Check required fields based on config
    if (config.fields.plateNumber.required && !vehicle.plateNumber) return false;
    if (config.fields.vin.required && !vehicle.vin) return false;
    if (config.fields.category.required && !vehicle.category) return false;
    if (config.fields.period.required && !vehicle.period) return false;

    // Validate formats
    if (vehicle.plateNumber && !validatePlate(vehicle.plateNumber)) return false;
    if (vehicle.vin && !validateVIN(vehicle.vin)) return false;

    return true;
  }, [vehicle, config, validatePlate, validateVIN]);

  // Notify parent of validation changes
  useEffect(() => {
    onValidChange(isFormValid());
  }, [isFormValid, onValidChange]);

  // Handle external redirect
  const handleRedirect = useCallback(() => {
    if (fullConfig?.externalRedirect?.url) {
      let url = fullConfig.externalRedirect.url;

      // Add UTM tracking if enabled
      if (fullConfig.externalRedirect.utmTracking) {
        const params = new URLSearchParams({
          utm_source: 'eghiseul.ro',
          utm_medium: 'referral',
          utm_campaign: 'rovinieta',
        });
        url += (url.includes('?') ? '&' : '?') + params.toString();
      }

      window.open(url, '_blank');
    }
  }, [fullConfig]);

  if (!vehicle) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Modulul de verificare vehicul nu este activat pentru acest serviciu.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vehicle Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Date Vehicul
          </CardTitle>
          <CardDescription>
            Introdu datele vehiculului pentru verificare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plate Number */}
          <div className="space-y-2">
            <Label htmlFor="plateNumber">
              Număr de Înmatriculare {config.fields.plateNumber.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="plateNumber"
              type="text"
              value={vehicle.plateNumber}
              onChange={(e) => handlePlateChange(e.target.value)}
              placeholder="B 123 ABC"
              className={plateError ? 'border-red-500' : ''}
            />
            {plateError && (
              <p className="text-sm text-red-500">{plateError}</p>
            )}
            {vehicle.plateNumber && !plateError && validatePlate(vehicle.plateNumber) && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Format valid
              </p>
            )}
          </div>

          {/* VIN */}
          {(config.fields.vin.required || config.vinValidation) && (
            <div className="space-y-2">
              <Label htmlFor="vin">
                Serie Șasiu (VIN) {config.fields.vin.required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="vin"
                type="text"
                value={vehicle.vin || ''}
                onChange={(e) => handleVINChange(e.target.value)}
                placeholder="WVWZZZ3CZWE123456"
                maxLength={17}
                className={vinError ? 'border-red-500' : ''}
              />
              {vinError && (
                <p className="text-sm text-red-500">{vinError}</p>
              )}
              {vehicle.vin && !vinError && validateVIN(vehicle.vin) && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  VIN valid ({vehicle.vin.length}/17)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Găsești VIN-ul în certificatul de înmatriculare sau pe parbriz
              </p>
            </div>
          )}

          {/* Optional vehicle details */}
          {(config.fields.brand.required || config.fields.model.required || config.fields.year.required) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.fields.brand.required && (
                <div className="space-y-2">
                  <Label htmlFor="brand">Marcă</Label>
                  <Input
                    id="brand"
                    type="text"
                    value={vehicle.brand || ''}
                    onChange={(e) => updateVehicle?.({ brand: e.target.value })}
                    placeholder="Volkswagen"
                  />
                </div>
              )}
              {config.fields.model.required && (
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    type="text"
                    value={vehicle.model || ''}
                    onChange={(e) => updateVehicle?.({ model: e.target.value })}
                    placeholder="Golf"
                  />
                </div>
              )}
              {config.fields.year.required && (
                <div className="space-y-2">
                  <Label htmlFor="year">An fabricație</Label>
                  <Input
                    id="year"
                    type="number"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    value={vehicle.year || ''}
                    onChange={(e) => updateVehicle?.({ year: parseInt(e.target.value) || undefined })}
                    placeholder="2020"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rovinieta-specific options */}
      {config.fields.category.required && (
        <Card>
          <CardHeader>
            <CardTitle>Opțiuni Rovinieta</CardTitle>
            <CardDescription>
              Selectează categoria vehiculului și perioada de valabilitate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Categorie Vehicul <span className="text-red-500">*</span>
              </Label>
              <Select
                value={vehicle.category || ''}
                onValueChange={(value) => updateVehicle?.({ category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selectează categoria" />
                </SelectTrigger>
                <SelectContent>
                  {ROVINIETA_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period */}
            {config.fields.period.required && (
              <div className="space-y-2">
                <Label htmlFor="period">
                  Perioadă Valabilitate <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={vehicle.period || ''}
                  onValueChange={(value) => updateVehicle?.({ period: value })}
                >
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Selectează perioada" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROVINIETA_PERIODS.map(period => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* External Redirect for Rovinieta */}
      {isRedirectService && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <ExternalLink className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Redirecționare Platforma Oficială</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Vei fi redirecționat către platforma oficială CNAIR pentru achiziția rovinietei.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleRedirect}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Mergi la Rovinieta.ro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Summary */}
      {!isFormValid() && !isRedirectService && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Completează toate câmpurile obligatorii și asigură-te că formatul este corect.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
