'use client';

/**
 * PropertyDataStep Component
 *
 * Collects property data for Carte Funciară services.
 */

import { useCallback, useState, useEffect } from 'react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Home, AlertCircle, HelpCircle } from 'lucide-react';
import type { PropertyVerificationConfig } from '@/types/verification-modules';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PropertyDataStepProps {
  config: PropertyVerificationConfig;
  onValidChange: (valid: boolean) => void;
}

// Romanian counties
const COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
  'Brașov', 'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași',
  'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș',
  'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj',
  'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea',
  'Vrancea',
];

export default function PropertyDataStep({ config, onValidChange }: PropertyDataStepProps) {
  const { state, updateProperty } = useModularWizard();
  const property = state.property;

  const [searchMethod, setSearchMethod] = useState<'cadastral' | 'carteFunciara' | 'address'>('cadastral');

  // Validate form
  const isFormValid = useCallback(() => {
    if (!property) return false;

    // Check required fields based on config
    if (config.fields.county.required && !property.county) return false;
    if (config.fields.locality.required && !property.locality) return false;
    if (config.fields.cadastral.required && !property.cadastral) return false;
    if (config.fields.carteFunciara.required && !property.carteFunciara) return false;

    // At least one identifier should be provided
    const hasIdentifier = property.cadastral || property.carteFunciara;
    if (!hasIdentifier) return false;

    return true;
  }, [property, config]);

  // Notify parent of validation changes
  useEffect(() => {
    onValidChange(isFormValid());
  }, [isFormValid, onValidChange]);

  if (!property) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Modulul de verificare imobil nu este activat pentru acest serviciu.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Property Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Localizare Imobil
          </CardTitle>
          <CardDescription>
            Introdu locația imobilului pentru care dorești extrasul CF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* County */}
            <div className="space-y-2">
              <Label htmlFor="county">
                Județ {config.fields.county.required && <span className="text-red-500">*</span>}
              </Label>
              <Select
                value={property.county}
                onValueChange={(value) => updateProperty?.({ county: value })}
              >
                <SelectTrigger id="county">
                  <SelectValue placeholder="Selectează județul" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTIES.map(county => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Locality */}
            <div className="space-y-2">
              <Label htmlFor="locality">
                Localitate {config.fields.locality.required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="locality"
                type="text"
                value={property.locality}
                onChange={(e) => updateProperty?.({ locality: e.target.value })}
                placeholder="București, Sector 1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Identification */}
      <Card>
        <CardHeader>
          <CardTitle>Identificare Imobil</CardTitle>
          <CardDescription>
            Poți identifica imobilul prin număr cadastral, număr carte funciară sau adresă
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Method Selection */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              type="button"
              variant={searchMethod === 'cadastral' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setSearchMethod('cadastral')}
            >
              Nr. Cadastral
            </Button>
            <Button
              type="button"
              variant={searchMethod === 'carteFunciara' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setSearchMethod('carteFunciara')}
            >
              Nr. CF
            </Button>
            <Button
              type="button"
              variant={searchMethod === 'address' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setSearchMethod('address')}
            >
              Adresă
            </Button>
          </div>

          {/* Cadastral Number */}
          {searchMethod === 'cadastral' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="cadastral">
                  Număr Cadastral {config.fields.cadastral.required && <span className="text-red-500">*</span>}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Numărul cadastral este un identificator unic al imobilului.
                        Îl găsești în actul de proprietate sau în extrasul CF anterior.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="cadastral"
                type="text"
                value={property.cadastral}
                onChange={(e) => updateProperty?.({ cadastral: e.target.value })}
                placeholder="123456"
              />
            </div>
          )}

          {/* Carte Funciară Number */}
          {searchMethod === 'carteFunciara' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="carteFunciara">
                  Număr Carte Funciară {config.fields.carteFunciara.required && <span className="text-red-500">*</span>}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Numărul CF este înscris pe extrasul de carte funciară anterior.
                        Format: 123456 (fără prefix).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="carteFunciara"
                type="text"
                value={property.carteFunciara}
                onChange={(e) => updateProperty?.({ carteFunciara: e.target.value })}
                placeholder="123456"
              />
            </div>
          )}

          {/* Address Search (for identification service) */}
          {searchMethod === 'address' && config.identificationService.enabled && (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Pentru căutare după adresă, vom identifica imobilul în baza ANCPI.
                  Acest serviciu poate dura mai mult și poate implica costuri suplimentare.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Adresă completă imobil</Label>
                <Textarea
                  id="propertyAddress"
                  value={property.propertyAddress || ''}
                  onChange={(e) => updateProperty?.({ propertyAddress: e.target.value })}
                  placeholder="Str. Exemplu nr. 10, Bloc A1, Sc. 1, Et. 3, Ap. 15"
                  rows={3}
                />
              </div>

              {config.identificationService.extraFields.includes('ownerName') && (
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nume proprietar (opțional)</Label>
                  <Input
                    id="ownerName"
                    type="text"
                    value={property.ownerName || ''}
                    onChange={(e) => updateProperty?.({ ownerName: e.target.value })}
                    placeholder="Popescu Ion"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ajută la identificarea mai rapidă a imobilului
                  </p>
                </div>
              )}

              {config.identificationService.extraFields.includes('cnpCui') && (
                <div className="space-y-2">
                  <Label htmlFor="ownerCnpCui">CNP/CUI proprietar (opțional)</Label>
                  <Input
                    id="ownerCnpCui"
                    type="text"
                    value={property.ownerCnpCui || ''}
                    onChange={(e) => updateProperty?.({ ownerCnpCui: e.target.value })}
                    placeholder="1234567890123"
                  />
                </div>
              )}
            </div>
          )}

          {/* Address search not available */}
          {searchMethod === 'address' && !config.identificationService.enabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Căutarea după adresă nu este disponibilă pentru acest serviciu.
                Te rugăm să folosești numărul cadastral sau CF.
              </AlertDescription>
            </Alert>
          )}

          {/* Topografic Number (optional) */}
          {config.fields.topografic.required && (
            <div className="space-y-2">
              <Label htmlFor="topografic">Număr Topografic</Label>
              <Input
                id="topografic"
                type="text"
                value={property.topografic || ''}
                onChange={(e) => updateProperty?.({ topografic: e.target.value })}
                placeholder="1234/1/2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purpose/Reason (optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Motiv Solicitare</CardTitle>
          <CardDescription>
            Pentru ce aveți nevoie de acest extras CF? (opțional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={property.motiv || ''}
            onChange={(e) => updateProperty?.({ motiv: e.target.value })}
            placeholder="Ex: Tranzacție imobiliară, Obținere credit ipotecar, Verificare sarcini, etc."
            rows={2}
          />
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {!isFormValid() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Completează cel puțin județul, localitatea și unul din: număr cadastral sau număr CF.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
