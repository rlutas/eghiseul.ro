'use client';

/**
 * PropertyDataStep Component
 *
 * Collects property data for Carte Funciară services.
 */

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { checkCf, normalizeCf } from '@/lib/ancpi/cf-format';
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

/** Inline, non-blocking hint under a CF/cadastral input. */
function CfHint({ check }: { check: ReturnType<typeof checkCf> }) {
  if (check.status === 'empty') return null;
  if (check.status === 'valid') {
    return <p className="text-xs text-green-600 flex items-center gap-1">✓ Format corect</p>;
  }
  return (
    <Alert className="border-amber-300 bg-amber-50 py-2">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 text-xs">{check.message}</AlertDescription>
    </Alert>
  );
}

/**
 * "Unde găsesc numerele?" — specimen of an extras header with the three
 * identifiers highlighted, using ANCPI's exact field labels (Ordin 600/2023)
 * so the client recognizes them on their own document. Born out of two real
 * wrong-apartment deliveries caused by old CF numbers (docs incident
 * E-260710-F3AYS / worker-ancpi/docs/cf-vechi-dezambiguizare.md).
 */
function CfSpecimenExplainer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-secondary-900"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary-600" />
          Unde găsesc numărul cărții funciare?
        </span>
        <span className="text-neutral-400">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3">
          {/* Real (anonymized) extract header with the identifiers ringed.
              Overlay boxes are positioned in % of the image (858×345), so they
              track the photo at any width. */}
          <div className="relative rounded-md border border-neutral-300 bg-white overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/specimens/specimen-cf-antet.png"
              alt="Antetul unui extras de carte funciară cu numerele evidențiate"
              className="w-full h-auto"
              width={858}
              height={345}
            />
            {/* Carte Funciară Nr. — numărul NOU */}
            <div className="absolute rounded border-2 border-green-500 bg-green-400/15" style={{ left: '37%', top: '31%', width: '27%', height: '9%' }} />
            {/* Nr. CF vechi */}
            <div className="absolute rounded border-[3px] border-amber-600 bg-amber-400/20" style={{ left: '70%', top: '60%', width: '29%', height: '5.5%' }} />
            {/* Nr. cadastral vechi + Nr. topografic */}
            <div className="absolute rounded border-2 border-blue-500 bg-blue-400/15" style={{ left: '70%', top: '66.5%', width: '29%', height: '9.5%' }} />
            {/* coloana Nr. cadastral / Nr. topografic din tabel */}
            <div className="absolute rounded border-2 border-blue-500 bg-blue-400/15" style={{ left: '14%', top: '77.5%', width: '14%', height: '18%' }} />
          </div>
          <ul className="space-y-1.5 text-xs text-neutral-700">
            <li>
              <mark className="bg-green-100 text-green-900 font-semibold px-1 rounded">Verde</mark> —
              „Carte Funciară Nr.&rdquo; = numărul NOU (electronic). Cel mai sigur: extrasul se emite exact
              pe el. La apartamente arată ca <code className="bg-neutral-100 px-1 rounded">123456-C1-U27</code>.
            </li>
            <li>
              <mark className="bg-amber-100 text-amber-900 font-semibold px-1 rounded">Galben</mark> —
              „Nr. CF vechi&rdquo; = numărul de pe cărțile VECHI (pe hârtie). Atenție: la blocuri, același
              număr vechi acoperea toate apartamentele — introdus singur, poate indica alt apartament!
            </li>
            <li>
              <mark className="bg-blue-100 text-blue-900 font-semibold px-1 rounded">Albastru</mark> —
              „Nr. cadastral&rdquo; / „Nr. topografic&rdquo; (în dreapta sus și în tabelul A1). Dacă ai doar
              numărul vechi, adaugă-l și pe acesta — identifică exact apartamentul tău.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PropertyDataStep({ config, onValidChange }: PropertyDataStepProps) {
  const { state, updateProperty, serviceOptions, updateOptions } = useModularWizard();
  const router = useRouter();

  // „Nu știu" → jump to the right identification service, carrying the contact
  // data over (sessionStorage handoff, consumed by the wizard provider — no PII
  // in the URL) and landing directly on its step 2 (Date Imobil).
  const jumpToService = useCallback((slug: string) => {
    try {
      sessionStorage.setItem('wizard_contact_handoff', JSON.stringify({
        email: state.contact.email,
        phone: state.contact.phone,
        preferredContact: state.contact.preferredContact,
        ts: Date.now(),
      }));
    } catch { /* private mode — client just retypes contact */ }
    // replace, not push: browser-back should NOT land the user back inside the
    // wizard they just left (confusing — the old draft reappears mid-flow).
    router.replace(`/comanda/${slug}?step=2`);
  }, [router, state.contact.email, state.contact.phone, state.contact.preferredContact]);
  const property = state.property;

  // Identificare service → default to the address tab (client doesn't know the number).
  const [searchMethod, setSearchMethod] = useState<'cadastral' | 'carteFunciara' | 'address'>(
    config.identificationService.enabled ? 'address' : 'carteFunciara'
  );

  // UAT (localitate) options for the selected county, from the ANCPI nomenclator.
  const localities: string[] =
    (uatNomenclator as Record<string, string[]>)[normalizeJudet(property?.county ?? '')] ?? [];

  // Non-blocking input rules for the electronic identifier (warn, don't block).
  const cfCheck = checkCf(property?.carteFunciara ?? '');
  // Electronic UNIT identifier (123456-C1-U2) pinpoints the apartment by
  // itself — no cadastral/topografic disambiguation needed.
  const isElectronicUnit = /^\d{1,7}-C\d+-U\d+$/.test(normalizeCf(property?.carteFunciara ?? ''));

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

  // Multi-imobil ("Adaugă un extras") is only offered for services that actually
  // have the priced extras_suplimentar option (Extras CF). Copii/certificate and
  // the other cadastral services are single-property — no extra here.
  const allowMultiImobil = serviceOptions.some((o) => o.code === 'extras_suplimentar');

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

    const hasIdentifier = !!(property.cadastral || property.carteFunciara);
    const hasAddress = !!property.propertyAddress?.trim();

    // "Identificare imobil după adresă": the client doesn't know the number, so an
    // ADDRESS is enough (an identifier is also accepted). Otherwise (extras CF /
    // plan cadastral) at least one identifier (CF / cadastral) is required.
    if (config.identificationService.enabled) {
      if (!hasIdentifier && !hasAddress) return false;
    } else if (!hasIdentifier) {
      return false;
    }

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
      <Card className="py-4 gap-4 sm:py-6 sm:gap-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Localizare Imobil
          </CardTitle>
          <CardDescription>
            Introdu locația imobilului pentru care dorești extrasul CF
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* County */}
            <div className="space-y-2">
              <Label htmlFor="county">
                Județ {config.fields.county.required && <span className="text-red-500">*</span>}
              </Label>
              <Select
                value={property.county}
                onValueChange={(value) => updateProperty?.({ county: value, locality: '' })}
              >
                {/* w-full: the shadcn trigger defaults to w-fit + nowrap and the
                    two dropdowns overlapped each other in the 2-col mobile grid */}
                <SelectTrigger id="county" className="w-full min-w-0">
                  <SelectValue placeholder="Selectează" />
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
                <SelectTrigger id="locality" className="w-full min-w-0">
                  <SelectValue placeholder="Selectează" />
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
      <Card className="py-4 gap-4 sm:py-6 sm:gap-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Identificare Imobil</CardTitle>
          <CardDescription>
            Identifică imobilul prin numărul cărții funciare — iar la cărțile vechi, adaugă numărul cadastral/topografic
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 space-y-4">
          {/* Search Method Selection — two tabs. The old separate "Nr.
              Cadastral" tab was never used in production (0/7 paid orders) and
              the extract itself has ONE merged column "Nr. cadastral / Nr.
              topografic", so cadastral now lives as the combined secondary
              field under the CF tab. */}
          <div className="flex gap-1 sm:gap-2 p-1 bg-muted rounded-lg">
            <Button
              type="button"
              variant={searchMethod === 'carteFunciara' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 min-w-0 px-1 sm:px-3 text-xs sm:text-sm"
              onClick={() => setSearchMethod('carteFunciara')}
            >
              Nr. Carte Funciară
            </Button>
            <Button
              type="button"
              variant={searchMethod === 'address' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 min-w-0 px-1 sm:px-3 text-xs sm:text-sm"
              onClick={() => setSearchMethod('address')}
            >
              {config.identificationService.enabled ? 'Adresă' : 'Nu știu'}
            </Button>
          </div>

          {/* Carte Funciară Number */}
          {searchMethod === 'carteFunciara' && (
            <div className="space-y-3">
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
                          Pe extras apare în antet ca „Carte Funciară Nr.&rdquo; (ex: 123456, iar la
                          apartament 123456-C1-U2). Dacă ai doar acte vechi, numărul de acolo apare
                          pe extrasele noi ca „Nr. CF vechi&rdquo; — introdu-l aici (poate avea și sufix,
                          ex: 30155/A) și completează și numărul topografic de mai jos.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                </div>
                <Input
                  id="carteFunciara"
                  type="text"
                  value={property.carteFunciara}
                  onChange={(e) => updateProperty?.({ carteFunciara: e.target.value })}
                  placeholder="123456 sau 123456-C1-U2"
                />
                <p className="text-xs text-muted-foreground">
                  Cel mai sigur e numărul <strong>NOU</strong>, de pe un extras recent (la apartamente
                  arată ca <code className="bg-neutral-100 px-1 rounded">123456-C1-U2</code>) — extrasul
                  se emite exact pe el, fără risc de confuzie.
                </p>
                <CfHint check={cfCheck} />
              </div>

              {/* Combined cadastral/topografic — the extract has ONE merged
                  column "Nr. cadastral / Nr. topografic". With an OLD paper CF
                  number this is the only thing that pinpoints the apartment
                  (two real wrong-unit deliveries without it). Stored in
                  property.cadastral (searchable identifier when CF is empty);
                  the worker matches it against BOTH ePay columns.
                  HIDDEN when the CF is already an electronic UNIT identifier
                  (123456-C1-U2) — that pinpoints the apartment by itself. */}
              {isElectronicUnit ? (
                <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  ✓ Ai introdus numărul electronic al unității — identifică exact apartamentul,
                  nu mai e nevoie de alte numere.
                </p>
              ) : (
              <div className={cfCheck.status === 'old_format'
                ? 'rounded-lg border-2 border-amber-300 bg-amber-50 p-3 space-y-2'
                : 'space-y-2'}>
                <div className="flex items-center gap-2">
                  <Label htmlFor="cadastral">
                    Nr. cadastral sau topografic{' '}
                    <span className={cfCheck.status === 'old_format' ? 'text-amber-700 font-semibold' : 'text-muted-foreground font-normal'}>
                      {cfCheck.status === 'old_format'
                        ? '— completează-l pentru cartea ta veche'
                        : '(opțional — necesar la carte funciară veche)'}
                    </span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Îl găsești pe actul de proprietate sau pe extras, în coloana „Nr. cadastral /
                        Nr. topografic&rdquo; (ex: 123456 sau 7584/2-7583/2/3/2/V). La cărțile funciare
                        vechi de bloc, același număr de carte acoperea toate apartamentele — acest
                        număr identifică EXACT apartamentul tău.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="cadastral"
                  type="text"
                  value={property.cadastral || ''}
                  onChange={(e) => updateProperty?.({ cadastral: e.target.value })}
                  placeholder="ex: 123456 sau 7584/2-7583/2/3/2/V"
                />
                {cfCheck.status === 'old_format' && (
                  <div className="space-y-1.5 pt-1">
                    <Label htmlFor="propertyAddressOld" className="text-amber-800">
                      Adresa imobilului (stradă, nr., bloc, scară, apartament)
                    </Label>
                    <Input
                      id="propertyAddressOld"
                      type="text"
                      value={property.propertyAddress || ''}
                      onChange={(e) => updateProperty?.({ propertyAddress: e.target.value })}
                      placeholder="ex: Str. Soarelui nr. 5, Bl. 9, Sc. B, Ap. 13"
                    />
                    <p className="text-xs text-amber-700">
                      Ne ajută să confirmăm că emitem extrasul exact pentru apartamentul tău.
                    </p>
                  </div>
                )}
              </div>
              )}

              <CfSpecimenExplainer />
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

          {/* „Nu știu" tab on a non-identification service → route the client
              to the right identification service (the wizard switches service
              and keeps them in the order flow). */}
          {searchMethod === 'address' && !config.identificationService.enabled && (
            <div className="space-y-3">
              <Alert className="border-primary-200 bg-primary-50">
                <AlertCircle className="h-4 w-4 text-primary-600" />
                <AlertDescription className="text-secondary-900">
                  Nicio problemă — îl identificăm noi. Alege de mai jos cum îl putem
                  găsi, iar comanda continuă automat pe serviciul potrivit (primești
                  și extrasul de carte funciară).
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => jumpToService('identificare-imobil')}
                  className="flex min-w-0 flex-col items-center gap-1 rounded-xl border-2 border-neutral-200 hover:border-primary-400 p-3 text-center transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-secondary-900 text-sm break-words">Știu adresa imobilului</span>
                  <span className="text-xs text-neutral-500 break-words">Identificare imobil după adresă</span>
                </button>
                <button
                  type="button"
                  onClick={() => jumpToService('identificare-imobile-proprietar')}
                  className="flex min-w-0 flex-col items-center gap-1 rounded-xl border-2 border-neutral-200 hover:border-primary-400 p-3 text-center transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-secondary-900 text-sm break-words">Știu proprietarul</span>
                  <span className="text-xs text-neutral-500 break-words">Identificare imobile după proprietar</span>
                </button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Additional imobile — "Adaugă un extras" (same county, ANCPI rule).
          Only for services with the priced extras_suplimentar option (Extras CF). */}
      {allowMultiImobil && (
      <Card className="py-4 gap-4 sm:py-6 sm:gap-6 border-2 border-primary-300 bg-primary-50/40">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white">
              <Plus className="h-4 w-4" />
            </span>
            Mai ai un imobil?
          </CardTitle>
          <CardDescription>
            Adaugă mai multe imobile în aceeași comandă (din <strong>același județ</strong>
            {property?.county ? ` — ${property.county}` : ''}). Fiecare extras suplimentar: doar <strong>49,99 RON</strong> în loc de 89 RON.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 space-y-4">
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
                    <SelectTrigger className="w-full min-w-0 bg-white">
                      <SelectValue placeholder="Selectează" />
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
                  <Label>
                    Nr. cadastral sau topografic{' '}
                    <span className="text-muted-foreground font-normal">(la CF veche)</span>
                  </Label>
                  <Input
                    type="text"
                    value={im.cadastral}
                    onChange={(e) => updateImobil(i, { cadastral: e.target.value })}
                    placeholder="ex: 123456 sau 7584/2-.../V"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            onClick={addImobil}
            disabled={!property?.county || additional.length >= 24}
            className="w-full h-11 text-sm font-bold bg-primary-500 hover:bg-primary-600 text-secondary-900"
          >
            <Plus className="mr-2 h-5 w-5" />
            Adaugă un extras (+49,99 RON)
          </Button>
          {!property?.county && (
            <p className="text-xs text-muted-foreground">Selectează întâi județul imobilului principal.</p>
          )}
        </CardContent>
      </Card>
      )}

      {/* Purpose/Reason (optional). Hidden on Extras CF — ANCPI never asks for
          a motive on the automated extras flow (the worker sends only
          CF/cadastral + județ/UAT), so the field was pure noise there. */}
      {state.serviceSlug !== 'extras-carte-funciara' && (
      <Card className="py-4 gap-4 sm:py-6 sm:gap-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Motiv Solicitare</CardTitle>
          <CardDescription>
            Pentru ce aveți nevoie de acest document? (opțional)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Textarea
            value={property.motiv || ''}
            onChange={(e) => updateProperty?.({ motiv: e.target.value })}
            placeholder="Ex: Tranzacție imobiliară, Obținere credit ipotecar, Verificare sarcini, etc."
            rows={2}
          />
        </CardContent>
      </Card>
      )}

      {/* Validation Summary */}
      {!isFormValid() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {config.identificationService.enabled
              ? 'Completează județul, localitatea și adresa imobilului (sau numărul cadastral / CF, dacă îl știi).'
              : 'Completează cel puțin județul, localitatea și unul din: număr cadastral sau număr CF.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
