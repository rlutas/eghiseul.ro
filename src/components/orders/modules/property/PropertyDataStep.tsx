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
import { Home, AlertCircle, HelpCircle, Plus, Trash2 } from 'lucide-react';
import type { PropertyVerificationConfig, AdditionalImobil } from '@/types/verification-modules';
import { normalizeJudet } from '@/lib/ancpi/judete';
import uatNomenclator from '@/lib/ancpi/uat-nomenclator.json';
import {
  Tooltip,
  TooltipContent,
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
  const { state, updateProperty, serviceOptions, updateOptions } = useModularWizard();
  const property = state.property;

  const [searchMethod, setSearchMethod] = useState<'cadastral' | 'carteFunciara' | 'address'>('cadastral');

  // UAT (localitate) options for the selected county, from the ANCPI nomenclator.
  const localities: string[] =
    (uatNomenclator as Record<string, string[]>)[normalizeJudet(property?.county ?? '')] ?? [];

  // ── Multi-imobil ("Adaugă un extras") — all in the SAME county (ANCPI rule) ──
  const additional = property?.additionalImobile ?? [];
  const setAdditional = useCallback(
    (next: AdditionalImobil[]) => updateProperty?.({ additionalImobile: next }),
    [updateProperty]
  );
  const addImobil = () =>
    setAdditional([...additional, { locality: '', carteFunciara: '', cadastral: '', topografic: '' }]);
  const removeImobil = (i: number) => setAdditional(additional.filter((_, idx) => idx !== i));
  const updateImobil = (i: number, patch: Partial<AdditionalImobil>) =>
    setAdditional(additional.map((im, idx) => (idx === i ? { ...im, ...patch } : im)));

  // Keep the priced `extras_suplimentar` option in sync with the extra count.
  const extraCount = additional.length;
  useEffect(() => {
    const opt = serviceOptions.find((o) => o.code === 'extras_suplimentar');
    if (!opt) return;
    const current = state.selectedOptions;
    const existing = current.find((o) => o.code === 'extras_suplimentar');
    if (extraCount > 0) {
      if (existing && existing.quantity === extraCount) return; // no change → avoid loop
      const next = current.filter((o) => o.code !== 'extras_suplimentar');
      next.push({
        optionId: opt.id,
        optionName: opt.name,
        quantity: extraCount,
        priceModifier: Number(opt.price),
        code: 'extras_suplimentar',
      });
      updateOptions(next);
    } else if (existing) {
      updateOptions(current.filter((o) => o.code !== 'extras_suplimentar'));
    }
  }, [extraCount, serviceOptions, state.selectedOptions, updateOptions]);

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
                onValueChange={(value) => updateProperty?.({ county: value, locality: '' })}
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

            {/* Locality / UAT — dependent on the selected county (ANCPI nomenclator) */}
            <div className="space-y-2">
              <Label htmlFor="locality">
                Localitate / UAT {config.fields.locality.required && <span className="text-red-500">*</span>}
              </Label>
              <Select
                value={property.locality}
                onValueChange={(value) => updateProperty?.({ locality: value })}
                disabled={!property.county}
              >
                <SelectTrigger id="locality">
                  <SelectValue placeholder={property.county ? 'Selectează localitatea' : 'Alege întâi județul'} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {localities.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Additional imobile — "Adaugă un extras" (same county, ANCPI rule) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Extrase suplimentare
          </CardTitle>
          <CardDescription>
            Adaugă mai multe imobile în aceeași comandă (din <strong>același județ</strong>
            {property?.county ? ` — ${property.county}` : ''}). Fiecare extras suplimentar: 49,99 RON.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {additional.map((im, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Imobil suplimentar #{i + 2}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeImobil(i)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Localitate / UAT</Label>
                  <Select
                    value={im.locality}
                    onValueChange={(value) => updateImobil(i, { locality: value })}
                    disabled={!property?.county}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={property?.county ? 'Selectează localitatea' : 'Alege întâi județul'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {localities.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Număr Carte Funciară</Label>
                  <Input
                    type="text"
                    value={im.carteFunciara}
                    onChange={(e) => updateImobil(i, { carteFunciara: e.target.value })}
                    placeholder="123456"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Număr Cadastral</Label>
                  <Input
                    type="text"
                    value={im.cadastral}
                    onChange={(e) => updateImobil(i, { cadastral: e.target.value })}
                    placeholder="123456"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addImobil}
            disabled={!property?.county || additional.length >= 24}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adaugă un extras (+49,99 RON)
          </Button>
          {!property?.county && (
            <p className="text-xs text-muted-foreground">Selectează întâi județul imobilului principal.</p>
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
