'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import {
  Mail,
  Truck,
  Package,
  MapPin,
  CheckCircle,
  Clock,
  Loader2,
  Globe,
  ChevronRight,
  ArrowLeft,
  Box,
  Info,
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
import { Button } from '@/components/ui/button';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { cn } from '@/lib/utils';

// Romanian counties (sorted)
const COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
  'Brașov', 'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași',
  'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș',
  'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj',
  'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea',
];

// Default sender location (eGhiseul HQ)
const SENDER_LOCATION = {
  county: 'Satu Mare',
  city: 'Satu Mare',
};

// =============================================================================
// DELIVERY CONFIGURATION
// =============================================================================

// Markup percentage applied to courier prices (to cover costs, taxes, etc.)
// 15% = 0.15, 20% = 0.20, etc.
const DELIVERY_MARKUP_PERCENTAGE = 0.15; // 15% markup

// =============================================================================
// INTERNATIONAL COURIERS (fixed price, no live quote)
// =============================================================================
// Ported from cazierjudiciaronline.com config/addons.ts (DHL 250, Posta 100).
// Pricing aligned with theirs — we simply route to a manual fulfillment
// pipeline (no AWB integration); user pays at checkout.
const INTERNATIONAL_COURIERS = [
  {
    provider: 'dhl_intl',
    name: 'DHL Express International',
    price: 250,
    estimatedDays: '1-3 zile lucrătoare',
    logo: '/images/couriers/960px-DHL_Logo.svg.png',
    description: 'Livrare rapidă oriunde în lume',
    badge: 'Rapid',
    color: 'yellow',
  },
  {
    provider: 'posta_intl',
    name: 'Poșta Română International',
    price: 100,
    estimatedDays: '7-15 zile lucrătoare',
    logo: '/images/couriers/posta-romana.svg',
    description: 'Livrare standard, preț redus',
    badge: 'Economic',
    color: 'blue',
  },
] as const;

type InternationalProvider = (typeof INTERNATIONAL_COURIERS)[number]['provider'];

// Toggle which locker services to show in the UI
// Set to false to hide a locker option (functionality preserved, just hidden)
const ENABLED_LOCKERS = {
  fanbox: true,    // FANbox (Fan Courier)
  easybox: true,   // EasyBox (Sameday) — enabled
};

/**
 * Apply markup to a price and round to 2 decimals
 */
function applyMarkup(price: number): number {
  return Math.round((price * (1 + DELIVERY_MARKUP_PERCENTAGE)) * 100) / 100;
}

/**
 * Check if a locker quote should be shown based on ENABLED_LOCKERS config
 */
function isLockerEnabled(quote: CourierQuote): boolean {
  if (quote.provider === 'sameday') return ENABLED_LOCKERS.easybox;
  // Fan Courier locker (FANbox)
  if (quote.serviceName.toLowerCase().includes('fanbox')) return ENABLED_LOCKERS.fanbox;
  return true; // Show non-locker quotes always
}

// Delivery type
type DeliveryType = 'email' | 'physical';
type PhysicalRegion = 'romania' | 'international';

// Locker point (FANbox or EasyBox)
interface LockerPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  county: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  distance?: number; // Distance in km from user location
  provider?: string;
}

// Module-level cache for locker data (persists across component unmount/remount)
const lockerCache = new Map<string, { lockers: LockerPoint[]; timestamp: number }>();
const LOCKER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Detect if a quote is for a locker service (FANbox, EasyBox, etc.)
 */
function isLockerQuote(quote: CourierQuote): boolean {
  return !!(
    quote.lockerAvailable ||
    quote.serviceName.toLowerCase().includes('fanbox') ||
    quote.serviceName.toLowerCase().includes('easybox') ||
    quote.serviceName.toLowerCase().includes('locker')
  );
}

/**
 * Get locker provider from quote
 */
function getLockerProvider(quote: CourierQuote): string {
  return quote.provider || 'fancourier';
}

/**
 * Get locker brand name for display
 */
function getLockerBrandName(quote: CourierQuote): string {
  if (quote.provider === 'sameday') return 'EasyBox';
  return 'FANbox';
}

// User coordinates
interface UserCoordinates {
  lat: number;
  lng: number;
  source: 'geolocation' | 'geocoded' | 'geocoded_street';
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance for display
 */
function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Courier quote from API
interface CourierQuote {
  provider: string;
  providerName: string;
  service: string;
  serviceName: string;
  price: number;
  priceWithVAT: number;
  vat: number;
  currency: string;
  estimatedDays: number;
  pickupAvailable?: boolean;
  lockerAvailable?: boolean;
  breakdown?: {
    basePrice?: number;
    fuelCost?: number;
    extraKmCost?: number;
    insuranceCost?: number;
    optionsCost?: number;
    codFee?: number;
  };
}

const addressSchema = z.object({
  street: z.string().min(2, 'Strada este obligatorie'),
  number: z.string().min(1, 'Numărul este obligatoriu'),
  building: z.string().optional(),
  staircase: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().min(2, 'Localitatea este obligatorie'),
  county: z.string().min(1, 'Județul este obligatoriu'),
  postalCode: z.string()
    .regex(/^\d{6}$/, 'Codul poștal trebuie să aibă 6 cifre'),
});

type AddressFormData = z.infer<typeof addressSchema>;

// International address — no county code, free-text country.
const internationalAddressSchema = z.object({
  street: z.string().min(2, 'Strada este obligatorie'),
  city: z.string().min(2, 'Localitatea este obligatorie'),
  postalCode: z.string().min(2, 'Codul poștal este obligatoriu'),
  country: z.string().min(2, 'Țara este obligatorie'),
  recipientName: z.string().min(2, 'Numele destinatarului este obligatoriu'),
  recipientPhone: z
    .string()
    .min(8, 'Telefonul este obligatoriu')
    .regex(/^[+0-9\s\-()]+$/, 'Telefon invalid'),
});

type InternationalAddressFormData = z.infer<typeof internationalAddressSchema>;

interface DeliveryStepProps {
  onValidChange: (valid: boolean) => void;
}

export function DeliveryStepModular({ onValidChange }: DeliveryStepProps) {
  const { state, updateDelivery } = useModularWizard();
  const { delivery } = state;

  // Track initial mount to avoid resetting restored form values
  const isInitialMount = useRef(true);
  // Store saved locker ID for auto-selection after lockers load on remount
  const savedLockerIdRef = useRef<string | null>(delivery.courierQuote?.lockerId ?? null);

  // Step states
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(
    delivery.method === 'email' ? 'email' : delivery.method ? 'physical' : null
  );
  const [physicalRegion, setPhysicalRegion] = useState<PhysicalRegion | null>(
    delivery.method && delivery.method !== 'email' ? 'romania' : null
  );

  // Courier quotes
  const [quotes, setQuotes] = useState<CourierQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<CourierQuote | null>(null);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // FANbox locker selection
  const [lockers, setLockers] = useState<LockerPoint[]>([]);
  const [selectedLocker, setSelectedLocker] = useState<LockerPoint | null>(null);
  const [loadingLockers, setLoadingLockers] = useState(false);
  const [showLockerSelector, setShowLockerSelector] = useState(false);

  // Localities dropdown (from Fan Courier API)
  interface LocalityItem {
    id: string;
    name: string;
    county: string;
    postalCode?: string;
  }
  const [localities, setLocalities] = useState<LocalityItem[]>([]);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  // Streets autocomplete (from Fan Courier API)
  interface StreetItem {
    id: string;
    name: string;
    locality: string;
    county: string;
  }
  const [streets, setStreets] = useState<StreetItem[]>([]);
  const [loadingStreets, setLoadingStreets] = useState(false);
  const [streetPopoverOpen, setStreetPopoverOpen] = useState(false);

  // User location for distance calculation
  const [userCoordinates, setUserCoordinates] = useState<UserCoordinates | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Address form
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: delivery.address?.street || '',
      number: delivery.address?.number || '',
      building: delivery.address?.building || '',
      staircase: delivery.address?.staircase || '',
      floor: delivery.address?.floor || '',
      apartment: delivery.address?.apartment || '',
      city: delivery.address?.city || '',
      county: delivery.address?.county || '',
      postalCode: delivery.address?.postalCode || '',
    },
    mode: 'onChange',
  });

  // International shipping (DHL / Poșta Română Internațional)
  const [intlProvider, setIntlProvider] = useState<InternationalProvider | null>(
    (delivery.courierProvider === 'dhl_intl' || delivery.courierProvider === 'posta_intl')
      ? (delivery.courierProvider as InternationalProvider)
      : null,
  );

  const intlForm = useForm<InternationalAddressFormData>({
    resolver: zodResolver(internationalAddressSchema),
    defaultValues: {
      street: delivery.address?.street || '',
      city: delivery.address?.city || '',
      postalCode: delivery.address?.postalCode || '',
      country: delivery.address?.country || '',
      recipientName: '',
      recipientPhone: '',
    },
    mode: 'onChange',
  });
  const isIntlAddressValid = intlForm.formState.isValid;

  const { isValid: isAddressValid } = form.formState;
  const watchedCounty = form.watch('county');
  const watchedCity = form.watch('city');
  const watchedStreet = form.watch('street');
  const watchedNumber = form.watch('number');

  // Fetch quotes when address is valid
  // preferredService: if provided, re-select that service instead of cheapest (used on remount)
  const fetchQuotes = useCallback(async (county: string, city: string, preferredService?: string) => {
    if (!county || !city) return;

    setLoadingQuotes(true);
    setQuoteError(null);
    setQuotes([]);
    setSelectedQuote(null);
    setSelectedLocker(null);
    setShowLockerSelector(false);

    try {
      const params = new URLSearchParams({
        senderCounty: SENDER_LOCATION.county,
        senderCity: SENDER_LOCATION.city,
        recipientCounty: county,
        recipientCity: city,
        weight: '0.5', // Default for documents
      });

      const response = await fetch(`/api/courier/quote?${params}`);
      const data = await response.json();

      if (data.success && data.data?.quotes) {
        // Apply markup to prices and sort by final price (cheapest first)
        const quotesWithMarkup = data.data.quotes.map((quote: CourierQuote) => ({
          ...quote,
          // Store original prices for reference
          originalPrice: quote.price,
          originalPriceWithVAT: quote.priceWithVAT,
          // Apply markup to the displayed prices
          price: applyMarkup(quote.price),
          priceWithVAT: applyMarkup(quote.priceWithVAT),
        }));

        // Filter out disabled locker services, then sort by price
        const visibleQuotes = quotesWithMarkup.filter((q: CourierQuote) =>
          !isLockerQuote(q) || isLockerEnabled(q)
        );
        const sortedQuotes = visibleQuotes.sort(
          (a: CourierQuote, b: CourierQuote) => a.priceWithVAT - b.priceWithVAT
        );
        setQuotes(sortedQuotes);

        // Re-select previously chosen service on remount, or auto-select cheapest
        const preferred = preferredService
          ? sortedQuotes.find((q: CourierQuote) => q.service === preferredService && q.provider === delivery.courierProvider)
          : null;
        if (preferred) {
          setSelectedQuote(preferred);
          // If it was a locker quote, trigger locker loading
          if (isLockerQuote(preferred)) {
            setShowLockerSelector(true);
            const provider = getLockerProvider(preferred);
            if (county) {
              getDeliveryLocation(delivery.address?.street, delivery.address?.number).then((coords) => {
                fetchLockers(county, coords, provider);
              });
            }
          }
        } else if (sortedQuotes.length > 0) {
          setSelectedQuote(sortedQuotes[0]);
        }
      } else {
        setQuoteError(data.error?.message || 'Nu am putut obține prețurile');
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setQuoteError('Eroare la obținerea prețurilor. Vă rugăm încercați din nou.');
    } finally {
      setLoadingQuotes(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delivery.courierProvider]);

  // Get delivery location coordinates by geocoding the delivery address
  // Tries full address first (street + city), falls back to city-only, then browser geolocation
  const getDeliveryLocation = useCallback(async (street?: string, number?: string): Promise<UserCoordinates | null> => {
    const city = watchedCity;
    const county = watchedCounty;

    if (city && county) {
      // Build query — include street if available for more precise geocoding
      const streetPart = street && street.length >= 2
        ? `${street}${number ? ` ${number}` : ''}, `
        : '';
      const fullQuery = `${streetPart}${city}, ${county}, Romania`;
      const cityQuery = `${city}, ${county}, Romania`;

      // Try full address first, then fall back to city-only
      const queries = streetPart ? [fullQuery, cityQuery] : [cityQuery];

      for (const query of queries) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=ro`,
            { headers: { 'User-Agent': 'eghiseul.ro/1.0' } }
          );
          const data = await response.json();
          if (data?.[0]) {
            const coords: UserCoordinates = {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
              source: streetPart && query === fullQuery ? 'geocoded_street' : 'geocoded',
            };
            setUserCoordinates(coords);
            return coords;
          }
        } catch {
          // Try next query or fall through
        }
      }
    }

    // Fallback: browser geolocation
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: UserCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            source: 'geolocation',
          };
          setUserCoordinates(coords);
          setGettingLocation(false);
          resolve(coords);
        },
        () => {
          setGettingLocation(false);
          resolve(null);
        },
        { timeout: 5000, maximumAge: 300000 }
      );
    });
  }, [watchedCity, watchedCounty]);

  // Fetch localities for selected county from Fan Courier API
  const fetchLocalities = useCallback(async (county: string) => {
    if (!county) {
      setLocalities([]);
      return;
    }

    setLoadingLocalities(true);
    try {
      const response = await fetch(`/api/courier/localities?county=${encodeURIComponent(county)}&provider=fancourier`);
      const data = await response.json();

      if (data.success && data.data?.localities) {
        setLocalities(data.data.localities);
      } else {
        setLocalities([]);
      }
    } catch (error) {
      console.error('Error fetching localities:', error);
      setLocalities([]);
    } finally {
      setLoadingLocalities(false);
    }
  }, []);

  // Fetch streets for selected locality from Fan Courier API
  const fetchStreets = useCallback(async (county: string, locality: string) => {
    if (!county || !locality) {
      setStreets([]);
      return;
    }

    setLoadingStreets(true);
    try {
      const response = await fetch(`/api/courier/streets?county=${encodeURIComponent(county)}&locality=${encodeURIComponent(locality)}`);
      const data = await response.json();

      if (data.success && data.data?.streets) {
        setStreets(data.data.streets);
      } else {
        setStreets([]);
      }
    } catch (error) {
      console.error('Error fetching streets:', error);
      setStreets([]);
    } finally {
      setLoadingStreets(false);
    }
  }, []);

  // Fetch lockers for selected county with distance calculation (provider-aware)
  const fetchLockers = useCallback(async (county: string, userCoords?: UserCoordinates | null, provider?: string) => {
    const cacheKey = `${county}-${provider || 'fancourier'}`;
    const cached = lockerCache.get(cacheKey);

    // Use cache if fresh (within TTL)
    if (cached && (Date.now() - cached.timestamp) < LOCKER_CACHE_TTL) {
      let lockerList = [...cached.lockers];

      // Recalculate distances with current user coordinates
      if (userCoords) {
        lockerList = lockerList.map((locker) => {
          if (locker.lat && locker.lng) {
            const distance = calculateDistance(userCoords.lat, userCoords.lng, locker.lat, locker.lng);
            return { ...locker, distance };
          }
          return locker;
        });
        lockerList.sort((a, b) => {
          if (a.distance === undefined && b.distance === undefined) return 0;
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
      }

      setLockers(lockerList);
      return;
    }

    setLoadingLockers(true);
    try {
      const params = new URLSearchParams({
        county: county,
        ...(provider ? { provider } : {}),
      });
      const response = await fetch(`/api/courier/pickup-points?${params}`);
      const data = await response.json();

      if (data.success && data.data) {
        // Map locker data
        let lockerList: LockerPoint[] = data.data.map((locker: {
          id: string;
          name: string;
          address: string;
          city: string;
          county: string;
          postalCode?: string;
          coordinates?: { lat: number; lng: number };
        }) => ({
          id: locker.id,
          name: locker.name,
          address: locker.address,
          city: locker.city,
          county: locker.county,
          zipCode: locker.postalCode,
          lat: locker.coordinates?.lat,
          lng: locker.coordinates?.lng,
        }));

        // Cache raw locker data (without distances, so distances can be recalculated)
        lockerCache.set(cacheKey, { lockers: lockerList, timestamp: Date.now() });

        // Calculate distances if we have user coordinates
        if (userCoords) {
          lockerList = lockerList.map((locker) => {
            if (locker.lat && locker.lng) {
              const distance = calculateDistance(userCoords.lat, userCoords.lng, locker.lat, locker.lng);
              return { ...locker, distance };
            }
            return locker;
          });

          // Sort by distance (closest first), lockers without distance go to end
          lockerList.sort((a, b) => {
            if (a.distance === undefined && b.distance === undefined) return 0;
            if (a.distance === undefined) return 1;
            if (b.distance === undefined) return -1;
            return a.distance - b.distance;
          });
        }

        setLockers(lockerList);
      } else {
        setLockers([]);
      }
    } catch (error) {
      console.error('Error fetching lockers:', error);
      setLockers([]);
    } finally {
      setLoadingLockers(false);
    }
  }, []);

  // Fetch localities when county changes & reset locker selection
  useEffect(() => {
    if (physicalRegion === 'romania' && watchedCounty) {
      fetchLocalities(watchedCounty);
      // Reset dependent fields when county changes (not on initial mount)
      if (!isInitialMount.current) {
        form.setValue('city', '', { shouldValidate: false });
        form.setValue('street', '', { shouldValidate: false });
        form.setValue('number', '', { shouldValidate: false });
        form.setValue('building', '', { shouldValidate: false });
        form.setValue('staircase', '', { shouldValidate: false });
        form.setValue('floor', '', { shouldValidate: false });
        form.setValue('apartment', '', { shouldValidate: false });
        form.setValue('postalCode', '', { shouldValidate: false });
        form.clearErrors(['city', 'street', 'number', 'postalCode']);
        setStreets([]);
        // Reset locker selection — old lockers are for the previous county
        setSelectedLocker(null);
        setLockers([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCounty, physicalRegion]);

  // Fetch streets when locality changes + auto-fill postal code
  useEffect(() => {
    if (physicalRegion === 'romania' && watchedCounty && watchedCity) {
      fetchStreets(watchedCounty, watchedCity);
      // Reset dependent fields when city changes (not on initial mount)
      if (!isInitialMount.current) {
        form.setValue('street', '', { shouldValidate: false });
        form.setValue('number', '', { shouldValidate: false });
        form.setValue('building', '', { shouldValidate: false });
        form.setValue('staircase', '', { shouldValidate: false });
        form.setValue('floor', '', { shouldValidate: false });
        form.setValue('apartment', '', { shouldValidate: false });
        form.clearErrors(['street', 'number', 'postalCode']);

        // Auto-fill postal code from locality data (enriched with Sameday postal codes)
        const selected = localities.find((l) => l.name === watchedCity);
        if (selected?.postalCode) {
          form.setValue('postalCode', selected.postalCode, { shouldValidate: true, shouldDirty: true });
        } else {
          form.setValue('postalCode', '', { shouldValidate: false });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCity, watchedCounty, physicalRegion]);

  // Fetch quotes when county and city are filled
  useEffect(() => {
    if (physicalRegion === 'romania' && watchedCounty && watchedCity && watchedCity.length >= 2) {
      // On initial mount, pass preferred service to re-select previously chosen quote
      const preferred = isInitialMount.current ? delivery.courierService : undefined;
      const timer = setTimeout(() => {
        fetchQuotes(watchedCounty, watchedCity, preferred ?? undefined);
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCounty, watchedCity, physicalRegion]);

  // Re-fetch lockers when county/city changes and a locker service is selected
  useEffect(() => {
    if (
      !isInitialMount.current &&
      physicalRegion === 'romania' &&
      watchedCounty &&
      watchedCity &&
      selectedQuote &&
      isLockerQuote(selectedQuote) &&
      showLockerSelector
    ) {
      const provider = getLockerProvider(selectedQuote);
      // Reset old locker selection since location changed
      setSelectedLocker(null);
      getDeliveryLocation(watchedStreet, watchedNumber).then((coords) => {
        fetchLockers(watchedCounty, coords, provider);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCounty, watchedCity]);

  // Re-sort lockers when street/number changes (debounced to avoid excessive Nominatim calls)
  useEffect(() => {
    if (
      !isInitialMount.current &&
      showLockerSelector &&
      lockers.length > 0 &&
      watchedStreet &&
      watchedStreet.length >= 3 &&
      watchedCounty &&
      watchedCity
    ) {
      const timer = setTimeout(() => {
        getDeliveryLocation(watchedStreet, watchedNumber).then((coords) => {
          if (coords) {
            setLockers((prev) => {
              const updated = prev.map((locker) => {
                if (locker.lat && locker.lng) {
                  const distance = calculateDistance(coords.lat, coords.lng, locker.lat, locker.lng);
                  return { ...locker, distance };
                }
                return locker;
              });
              updated.sort((a, b) => {
                if (a.distance === undefined && b.distance === undefined) return 0;
                if (a.distance === undefined) return 1;
                if (b.distance === undefined) return -1;
                return a.distance - b.distance;
              });
              return updated;
            });
          }
        });
      }, 1000); // 1 second debounce (Nominatim rate limit: 1 req/sec)
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedStreet, watchedNumber]);

  // Clear initial mount flag after first render cycle
  useEffect(() => {
    if (isInitialMount.current) {
      // Use a microtask to ensure all initial effects have run
      const timer = setTimeout(() => {
        isInitialMount.current = false;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-select saved locker after lockers load on remount
  useEffect(() => {
    if (savedLockerIdRef.current && lockers.length > 0 && !selectedLocker) {
      const saved = lockers.find((l) => l.id === savedLockerIdRef.current);
      if (saved) {
        setSelectedLocker(saved);
      }
      savedLockerIdRef.current = null; // Only try once
    }
  }, [lockers, selectedLocker]);

  // Validate step
  const selectedLockerId = selectedLocker?.id ?? null;
  const selectedQuoteService = selectedQuote?.service ?? null;

  useEffect(() => {
    if (deliveryType === 'email') {
      onValidChange(true);
    } else if (deliveryType === 'physical' && physicalRegion === 'romania') {
      // For locker services (FANbox/EasyBox), require locker selection; for Standard, require valid address
      const isLocker = selectedQuote ? isLockerQuote(selectedQuote) : false;
      if (isLocker) {
        // Locker doesn't need full address, just locker selection
        onValidChange(selectedQuoteService !== null && selectedLockerId !== null);
      } else {
        // Standard delivery needs full address
        onValidChange(isAddressValid && selectedQuoteService !== null);
      }
    } else if (deliveryType === 'physical' && physicalRegion === 'international') {
      onValidChange(intlProvider !== null && isIntlAddressValid);
    } else {
      onValidChange(false);
    }
  }, [deliveryType, physicalRegion, isAddressValid, selectedQuoteService, selectedQuote, selectedLockerId, intlProvider, isIntlAddressValid, onValidChange]);

  // Update context when selections change
  useEffect(() => {
    if (deliveryType === 'email') {
      updateDelivery({
        method: 'email',
        methodName: 'Email (PDF)',
        price: 0,
        estimatedDays: 0,
        courierProvider: undefined,
        courierService: undefined,
      });
    } else if (selectedQuote) {
      const isLocker = isLockerQuote(selectedQuote);
      const lockerBrand = getLockerBrandName(selectedQuote);
      updateDelivery({
        method: 'courier',
        methodName: isLocker && selectedLocker
          ? `${selectedQuote.providerName} - ${lockerBrand} (${selectedLocker.name})`
          : `${selectedQuote.providerName} - ${selectedQuote.serviceName}`,
        price: selectedQuote.priceWithVAT,
        estimatedDays: selectedQuote.estimatedDays,
        courierProvider: selectedQuote.provider,
        courierService: selectedQuote.service,
        courierQuote: {
          ...selectedQuote,
          // Add locker info if locker selected
          ...(isLocker && selectedLocker ? {
            lockerId: selectedLocker.id,
            lockerName: selectedLocker.name,
            lockerAddress: `${selectedLocker.address}, ${selectedLocker.city}`,
          } : {}),
        },
      });
    }
  }, [deliveryType, selectedQuote, selectedLocker, updateDelivery]);

  // Update address in context
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (physicalRegion === 'romania') {
        updateDelivery({
          address: {
            street: value.street || '',
            number: value.number || '',
            building: value.building,
            staircase: value.staircase,
            floor: value.floor,
            apartment: value.apartment,
            city: value.city || '',
            county: value.county || '',
            postalCode: value.postalCode || '',
          },
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateDelivery, physicalRegion]);

  // International: sync selection + address to context
  useEffect(() => {
    if (physicalRegion !== 'international' || !intlProvider) return;
    const courier = INTERNATIONAL_COURIERS.find((c) => c.provider === intlProvider);
    if (!courier) return;

    const subscription = intlForm.watch((value) => {
      updateDelivery({
        method: 'courier',
        methodName: courier.name,
        price: courier.price,
        estimatedDays: 0, // free-text range stored in methodName; numeric used for SLA only
        courierProvider: courier.provider,
        courierService: courier.name,
        courierQuote: undefined,
        address: {
          street: value.street || '',
          number: '', // not used for international
          city: value.city || '',
          county: '', // not used for international
          postalCode: value.postalCode || '',
          country: value.country || '',
        },
      });
    });

    // Also push current values immediately so price flows even before next keystroke
    const v = intlForm.getValues();
    updateDelivery({
      method: 'courier',
      methodName: courier.name,
      price: courier.price,
      estimatedDays: 0,
      courierProvider: courier.provider,
      courierService: courier.name,
      courierQuote: undefined,
      address: {
        street: v.street || '',
        number: '',
        city: v.city || '',
        county: '',
        postalCode: v.postalCode || '',
        country: v.country || '',
      },
    });
    return () => subscription.unsubscribe();
  }, [physicalRegion, intlProvider, intlForm, updateDelivery]);

  // Handle email selection
  const handleEmailSelect = () => {
    setDeliveryType('email');
    setPhysicalRegion(null);
    setSelectedQuote(null);
    form.reset();
  };

  // Handle physical selection
  const handlePhysicalSelect = () => {
    setDeliveryType('physical');
  };

  // Handle region selection
  const handleRegionSelect = (region: PhysicalRegion) => {
    setPhysicalRegion(region);
  };

  // Go back to delivery type selection
  const handleBackToTypes = () => {
    setDeliveryType(null);
    setPhysicalRegion(null);
    setSelectedQuote(null);
  };

  // Provider-specific colors
  const getProviderColors = (provider: string, isSelected: boolean) => {
    if (provider === 'sameday') {
      return {
        border: isSelected ? 'border-red-500' : 'border-neutral-200 hover:border-red-300',
        bg: isSelected ? 'bg-red-50' : '',
        icon: isSelected ? 'bg-red-100' : 'bg-neutral-100',
        radio: isSelected ? 'border-red-500 bg-red-500' : 'border-neutral-300 bg-white',
        price: isSelected ? 'text-red-700' : 'text-secondary-900',
        badge: 'bg-red-100 text-red-700',
        logo: '/images/couriers/sameday.webp',
        logoAlt: 'Sameday',
      };
    }
    // Fan Courier (default) - blue
    return {
      border: isSelected ? 'border-blue-500' : 'border-neutral-200 hover:border-blue-300',
      bg: isSelected ? 'bg-blue-50' : '',
      icon: isSelected ? 'bg-blue-100' : 'bg-neutral-100',
      radio: isSelected ? 'border-blue-500 bg-blue-500' : 'border-neutral-300 bg-white',
      price: isSelected ? 'text-blue-700' : 'text-secondary-900',
      badge: 'bg-blue-100 text-blue-700',
      logo: '/images/couriers/fancourier.svg',
      logoAlt: 'Fan Courier',
    };
  };

  return (
    <div className="space-y-6">
      {/* Delivery Type Picker — VISIBLE ALWAYS (no longer hidden after pick).
          Selected card shows green border + checkmark badge; user can swap
          methods by clicking the other card. Removes the previous
          "Email Selected" intermediate confirmation block entirely:
          for Email the parent step's Continuă button enables immediately
          via onValidChange(true). For Physical the sub-flow renders below. */}
      <div className="space-y-4">
        <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary-500" />
          Cum doriți să primiți documentele?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email Option */}
          <button
            type="button"
            onClick={handleEmailSelect}
            className={`relative p-5 sm:p-6 rounded-xl border-2 cursor-pointer transition-all text-left ${
              deliveryType === 'email'
                ? 'border-green-500 bg-green-50 shadow-sm ring-2 ring-green-200/60'
                : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md'
            }`}
          >
            {deliveryType === 'email' && (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                <CheckCircle className="w-3 h-3" />
                Selectat
              </span>
            )}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${
                deliveryType === 'email' ? 'bg-green-200' : 'bg-green-100'
              }`}>
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-green-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-secondary-900 text-base sm:text-lg">Email (PDF)</h4>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-snug">
                  Primiți documentele în format PDF direct pe email
                </p>
                <div className="flex items-center gap-2 sm:gap-3 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-green-700 font-medium">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Instant
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] sm:text-xs font-bold">
                    GRATUIT
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Physical Delivery Option */}
          <button
            type="button"
            onClick={handlePhysicalSelect}
            className={`relative p-5 sm:p-6 rounded-xl border-2 cursor-pointer transition-all text-left ${
              deliveryType === 'physical'
                ? 'border-primary-500 bg-primary-50 shadow-sm ring-2 ring-primary-200/60'
                : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md'
            }`}
          >
            {deliveryType === 'physical' && (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                <CheckCircle className="w-3 h-3" />
                Selectat
              </span>
            )}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${
                deliveryType === 'physical' ? 'bg-primary-200' : 'bg-primary-100'
              }`}>
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-secondary-900 text-base sm:text-lg">Livrare Fizică</h4>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-snug">
                  Primiți documentele în original, prin curier
                </p>
                <div className="flex items-center gap-2 sm:gap-3 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary-700 font-medium">
                    <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    1-3 zile lucrătoare
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 text-[11px] sm:text-xs font-bold">
                    de la 18 RON
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Inline confirmation note for Email — slim, just to reassure
            the customer their email address is the one we have. */}
        {deliveryType === 'email' && state.contact.email && (
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 flex items-start gap-3">
            <Mail className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">
              PDF-urile vor fi trimise pe <strong>{state.contact.email}</strong>.
              {' '}Poți schimba metoda apăsând pe „Livrare Fizică" mai sus.
            </p>
          </div>
        )}
      </div>

      {/* Step 2: Physical Delivery - Region Selection */}
      {deliveryType === 'physical' && !physicalRegion && (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToTypes}
            className="text-neutral-500 hover:text-neutral-700 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Înapoi
          </Button>

          <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-500" />
            Unde doriți să trimitem coletul?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Romania Option */}
            <div
              onClick={() => handleRegionSelect('romania')}
              className="relative p-6 rounded-xl border-2 border-neutral-200 hover:border-primary-300 cursor-pointer transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  <div className="w-14 h-10 rounded-lg bg-white border border-blue-100 flex items-center justify-center p-1.5">
                    <Image
                      src="/images/couriers/fancourier.svg"
                      alt="Fan Courier"
                      width={40}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div className="w-14 h-10 rounded-lg bg-white border border-red-100 flex items-center justify-center p-1.5">
                    <Image
                      src="/images/couriers/sameday.webp"
                      alt="Sameday"
                      width={40}
                      height={28}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-secondary-900 text-lg">România</h4>
                  <p className="text-sm text-neutral-500 mt-1">
                    Livrare prin Fan Courier & Sameday în 1-3 zile
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">Standard</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">FANbox</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">EasyBox</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </div>

            {/* International Option */}
            <div
              onClick={() => handleRegionSelect('international')}
              className="relative p-6 rounded-xl border-2 border-neutral-200 hover:border-primary-300 cursor-pointer transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-primary-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-secondary-900 text-lg">Internațional</h4>
                  <p className="text-sm text-neutral-500 mt-1">
                    DHL Express sau Poșta Română International
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">DHL — 250 RON</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">Poșta RO — 100 RON</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Romania Address & Courier Selection */}
      {deliveryType === 'physical' && physicalRegion === 'romania' && (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPhysicalRegion(null)}
            className="text-neutral-500 hover:text-neutral-700 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Înapoi
          </Button>

          {/* Courier Header */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shadow-sm border border-blue-100">
                <Image
                  src="/images/couriers/fancourier.svg"
                  alt="Fan Courier"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shadow-sm border border-red-100">
                <Image
                  src="/images/couriers/sameday.webp"
                  alt="Sameday"
                  width={32}
                  height={32}
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">Livrare în România</h3>
              <p className="text-sm text-neutral-500">Fan Courier & Sameday - cele mai bune prețuri</p>
            </div>
          </div>

          {/* Address Form */}
          <div className="space-y-4">
            <h4 className="font-medium text-secondary-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-500" />
              Adresa de Livrare
            </h4>

            <Form {...form}>
              <form className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* County */}
                <FormField
                  control={form.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Județ <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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

                {/* City - Select from Fan Courier localities */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localitate <span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!watchedCounty || loadingLocalities}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                loadingLocalities
                                  ? 'Se încarcă...'
                                  : !watchedCounty
                                  ? 'Selectează județul mai întâi'
                                  : 'Selectează localitatea'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {localities.map((locality) => (
                            <SelectItem key={locality.id || locality.name} value={locality.name}>
                              {locality.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Street + Number row */}
                <div className="col-span-2 grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_100px] gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => {
                    // Filter streets based on input
                    const filteredStreets = streets
                      .filter((street) =>
                        street.name.toLowerCase().includes(field.value.toLowerCase())
                      )
                      .slice(0, 50);

                    return (
                      <FormItem>
                        <FormLabel>Strada <span className="text-red-500">*</span></FormLabel>
                        {loadingStreets ? (
                          <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-neutral-50">
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                            <span className="text-sm text-neutral-500">Se încarcă străzile...</span>
                          </div>
                        ) : (
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Începe să scrii numele străzii..."
                                autoComplete="off"
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  // Open suggestions when user types
                                  if (e.target.value.length >= 1 && streets.length > 0) {
                                    setStreetPopoverOpen(true);
                                  } else {
                                    setStreetPopoverOpen(false);
                                  }
                                }}
                                onFocus={() => {
                                  if (field.value.length >= 1 && streets.length > 0) {
                                    setStreetPopoverOpen(true);
                                  }
                                }}
                                onBlur={() => {
                                  // Delay closing to allow click on suggestion
                                  setTimeout(() => setStreetPopoverOpen(false), 200);
                                }}
                              />
                            </FormControl>

                            {/* Autocomplete suggestions dropdown */}
                            {streetPopoverOpen && filteredStreets.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-[250px] overflow-y-auto">
                                {filteredStreets.map((street) => (
                                  <div
                                    key={street.id || street.name}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-primary-50 hover:text-primary-700"
                                    onMouseDown={(e) => {
                                      e.preventDefault(); // Prevent input blur
                                      field.onChange(street.name);
                                      setStreetPopoverOpen(false);
                                    }}
                                  >
                                    {street.name}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* No results message */}
                            {streetPopoverOpen && field.value.length >= 2 && filteredStreets.length === 0 && streets.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg p-3">
                                <p className="text-sm text-neutral-500 text-center">
                                  Nu s-a găsit. Poți introduce manual.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Number */}
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nr. <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nr." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>{/* end street+number row */}

                {/* Building / Staircase / Floor / Apartment row */}
                <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {/* Bloc */}
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

                  {/* Scară */}
                  <FormField
                    control={form.control}
                    name="staircase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scară</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="B" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Etaj */}
                  <FormField
                    control={form.control}
                    name="floor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Etaj</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="3" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Apartament */}
                  <FormField
                    control={form.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apartament</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="45" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>{/* end building details row */}

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

          {/* Courier Options */}
          {(loadingQuotes || quotes.length > 0 || quoteError) && (
            <div className="space-y-4">
              <h4 className="font-medium text-secondary-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary-500" />
                Opțiuni de Livrare
              </h4>

              {loadingQuotes && (
                <div className="flex items-center justify-center py-8 text-neutral-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Se calculează prețurile...
                </div>
              )}

              {quoteError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {quoteError}
                </div>
              )}

              {!loadingQuotes && quotes.length > 0 && (
                <div className="space-y-3">
                  {quotes.map((quote) => {
                    const isSelected = selectedQuote?.service === quote.service && selectedQuote?.provider === quote.provider;
                    const isLocker = isLockerQuote(quote);
                    const colors = getProviderColors(quote.provider || 'fancourier', isSelected);
                    return (
                      <div
                        key={`${quote.provider}-${quote.service}`}
                        onClick={async () => {
                          const prevProvider = selectedQuote ? getLockerProvider(selectedQuote) : null;
                          const newProvider = getLockerProvider(quote);
                          setSelectedQuote(quote);
                          // If locker service, show locker selector and load lockers
                          if (isLocker) {
                            // Reset locker when switching between providers (FANbox → EasyBox)
                            if (prevProvider && prevProvider !== newProvider) {
                              setSelectedLocker(null);
                            }
                            setShowLockerSelector(true);
                            if (watchedCounty) {
                              const userLoc = userCoordinates || await getDeliveryLocation(watchedStreet, watchedNumber);
                              fetchLockers(watchedCounty, userLoc, newProvider);
                            }
                          } else {
                            setShowLockerSelector(false);
                            setSelectedLocker(null);
                          }
                        }}
                        className={cn(
                          'p-4 rounded-xl border-2 cursor-pointer transition-all',
                          colors.border,
                          colors.bg,
                          isSelected && 'shadow-md'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {/* Radio indicator */}
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                              colors.radio
                            )}
                          >
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-white" />
                            )}
                          </div>

                          {/* Courier logo */}
                          <div
                            className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 p-1.5 border',
                              isSelected ? 'bg-white border-neutral-200 shadow-sm' : 'bg-white border-neutral-100'
                            )}
                          >
                            <Image
                              src={colors.logo}
                              alt={colors.logoAlt}
                              width={36}
                              height={36}
                              className="object-contain"
                              unoptimized={colors.logo.endsWith('.webp')}
                            />
                          </div>

                          {/* Service info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-semibold text-secondary-900">
                                {quote.serviceName}
                              </h5>
                              {isLocker && (
                                <span className={cn('text-xs px-2 py-0.5 rounded font-medium', colors.badge)}>
                                  Locker
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {quote.estimatedDays === 0
                                  ? 'Azi'
                                  : quote.estimatedDays === 1
                                  ? '1 zi lucrătoare'
                                  : `${quote.estimatedDays} zile lucrătoare`}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right flex-shrink-0">
                            <div
                              className={cn(
                                'text-lg font-bold',
                                colors.price
                              )}
                            >
                              {quote.priceWithVAT.toFixed(2)} RON
                            </div>
                            <div className="text-xs text-neutral-500">
                              cu TVA
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Locker Selector (FANbox / EasyBox) */}
                  {showLockerSelector && selectedQuote && isLockerQuote(selectedQuote) && (
                    <div className={cn(
                      'mt-4 p-4 rounded-xl border-2',
                      selectedQuote.provider === 'sameday'
                        ? 'border-red-200 bg-red-50'
                        : 'border-blue-200 bg-blue-50'
                    )}>
                      <h5 className={cn(
                        'font-medium flex items-center gap-2 mb-3',
                        selectedQuote.provider === 'sameday' ? 'text-red-900' : 'text-blue-900'
                      )}>
                        <Box className="w-4 h-4" />
                        Selectați {getLockerBrandName(selectedQuote)}-ul
                        {lockers.length > 0 && lockers[0].distance !== undefined && (
                          <span className={cn(
                            'text-xs font-normal ml-auto',
                            selectedQuote.provider === 'sameday' ? 'text-red-600' : 'text-blue-600'
                          )}>
                            (sortate după distanță)
                          </span>
                        )}
                      </h5>

                      {(loadingLockers || gettingLocation) && (
                        <div className={cn(
                          'flex items-center justify-center py-4',
                          selectedQuote.provider === 'sameday' ? 'text-red-600' : 'text-blue-600'
                        )}>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          {gettingLocation ? 'Se obține locația...' : 'Se încarcă lockerele...'}
                        </div>
                      )}

                      {!loadingLockers && !gettingLocation && lockers.length === 0 && (
                        <p className={cn(
                          'text-sm',
                          selectedQuote.provider === 'sameday' ? 'text-red-700' : 'text-blue-700'
                        )}>
                          Nu există {getLockerBrandName(selectedQuote)}-uri disponibile în județul {watchedCounty}.
                        </p>
                      )}

                      {!loadingLockers && !gettingLocation && lockers.length > 0 && (
                        <div className="max-h-64 overflow-y-auto rounded-lg border border-neutral-200 bg-white divide-y divide-neutral-100">
                          {lockers.map((locker, index) => {
                            const isLockerSelected = selectedLocker?.id === locker.id;
                            const isSameday = selectedQuote?.provider === 'sameday';
                            return (
                              <div
                                key={locker.id}
                                onClick={() => setSelectedLocker(locker)}
                                className={cn(
                                  'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                                  isLockerSelected
                                    ? isSameday ? 'bg-red-50' : 'bg-blue-50'
                                    : 'hover:bg-neutral-50'
                                )}
                              >
                                {/* Radio */}
                                <div className={cn(
                                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                                  isLockerSelected
                                    ? isSameday ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500'
                                    : 'border-neutral-300 bg-white'
                                )}>
                                  {isLockerSelected && (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  )}
                                </div>

                                {/* Locker icon */}
                                <div className={cn(
                                  'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                                  isLockerSelected
                                    ? isSameday ? 'bg-red-100' : 'bg-blue-100'
                                    : 'bg-neutral-100'
                                )}>
                                  <Box className={cn(
                                    'w-4 h-4',
                                    isLockerSelected
                                      ? isSameday ? 'text-red-600' : 'text-blue-600'
                                      : 'text-neutral-500'
                                  )} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      'font-medium text-sm truncate',
                                      isLockerSelected
                                        ? isSameday ? 'text-red-900' : 'text-blue-900'
                                        : 'text-secondary-900'
                                    )}>
                                      {locker.name}
                                    </span>
                                    {index === 0 && locker.distance !== undefined && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium whitespace-nowrap flex-shrink-0">
                                        Cel mai apropiat
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                                    <MapPin className="w-3 h-3 inline-block mr-0.5 -mt-px" />
                                    {locker.address}, {locker.city}
                                  </p>
                                </div>

                                {/* Distance */}
                                {locker.distance !== undefined && (
                                  <span className={cn(
                                    'text-xs font-semibold whitespace-nowrap flex-shrink-0',
                                    isLockerSelected
                                      ? isSameday ? 'text-red-600' : 'text-blue-600'
                                      : 'text-neutral-400'
                                  )}>
                                    {formatDistance(locker.distance)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price Breakdown Info (only for standard delivery, not lockers) */}
                  {selectedQuote?.breakdown && !isLockerQuote(selectedQuote) && (
                    <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
                      <div className="flex items-center gap-1 mb-2">
                        <Info className="w-3.5 h-3.5" />
                        <span className="font-medium">Detalii preț:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {selectedQuote.breakdown.basePrice != null && selectedQuote.breakdown.basePrice > 0 && (
                          <div className="flex justify-between">
                            <span>Cost transport:</span>
                            <span>{selectedQuote.breakdown.basePrice.toFixed(2)} RON</span>
                          </div>
                        )}
                        {selectedQuote.breakdown.fuelCost != null && selectedQuote.breakdown.fuelCost > 0 && (
                          <div className="flex justify-between">
                            <span>Suprataxă carburant:</span>
                            <span>{selectedQuote.breakdown.fuelCost.toFixed(2)} RON</span>
                          </div>
                        )}
                        {selectedQuote.breakdown.extraKmCost != null && selectedQuote.breakdown.extraKmCost > 0 && (
                          <div className="flex justify-between">
                            <span>Km suplimentari:</span>
                            <span>{selectedQuote.breakdown.extraKmCost.toFixed(2)} RON</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delivery Timing Note */}
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
                      <div>
                        <p className="font-medium mb-1">Informații despre termenul de livrare</p>
                        <ul className="space-y-0.5 text-amber-700">
                          <li>Livrarea se efectuează doar după eliberarea documentelor.</li>
                          <li>Termenul de livrare se calculează începând cu a 2-a zi lucrătoare de la eliberarea documentului.</li>
                          <li>Documentele eliberate vineri sau în weekend vor fi expediate luni.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: International Delivery */}
      {deliveryType === 'physical' && physicalRegion === 'international' && (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPhysicalRegion(null);
              setIntlProvider(null);
            }}
            className="text-neutral-500 hover:text-neutral-700 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Înapoi
          </Button>

          {/* Courier Header — matches the Livrare în România banner style:
              white logo squares + gradient background + label. Keeps the
              wizard visually consistent across delivery sub-flows. */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-blue-50 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shadow-sm border border-yellow-200">
                <Image
                  src="/images/couriers/960px-DHL_Logo.svg.png"
                  alt="DHL"
                  width={32}
                  height={32}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1.5 shadow-sm border border-blue-200">
                <Image
                  src="/images/couriers/posta-romana.svg"
                  alt="Poșta Română"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">Livrare Internațională</h3>
              <p className="text-sm text-neutral-500">DHL Express & Poșta Română International</p>
            </div>
          </div>

          {/* Courier selection — same card pattern as Romania quotes:
              logo on the left, name + description in the middle, badge +
              price on the right. Selected gets a coloured border + tint. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTERNATIONAL_COURIERS.map((c) => {
              const isSelected = intlProvider === c.provider;
              const isYellow = c.color === 'yellow';
              return (
                <button
                  key={c.provider}
                  type="button"
                  onClick={() => setIntlProvider(c.provider)}
                  className={cn(
                    'relative p-4 rounded-xl border-2 cursor-pointer transition-all text-left hover:shadow-md',
                    isSelected
                      ? (isYellow
                          ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200/60 shadow-sm'
                          : 'border-blue-500 bg-blue-50 ring-2 ring-blue-200/60 shadow-sm')
                      : 'border-neutral-200 bg-white hover:border-primary-300',
                  )}
                >
                  {isSelected && (
                    <span className={cn(
                      'absolute top-2 right-2 inline-flex items-center gap-1 rounded-full text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide',
                      isYellow ? 'bg-yellow-600' : 'bg-blue-600',
                    )}>
                      <CheckCircle className="w-3 h-3" />
                      Selectat
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-lg bg-white flex items-center justify-center p-1.5 shadow-sm flex-shrink-0',
                      isYellow ? 'border border-yellow-200' : 'border border-blue-200',
                    )}>
                      <Image
                        src={c.logo}
                        alt={c.name}
                        width={36}
                        height={36}
                        className="object-contain"
                        unoptimized={isYellow}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-secondary-900 text-sm">{c.name}</span>
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded font-medium',
                          isYellow ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800',
                        )}>
                          {c.badge}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1 leading-snug">{c.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-neutral-500 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {c.estimatedDays}
                        </span>
                        <span className="font-bold text-secondary-900 text-sm">{c.price} RON</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* International address form */}
          {intlProvider && (
            <Form {...intlForm}>
              <form className="space-y-4">
                <h4 className="font-medium text-secondary-900 text-sm mt-2">Adresa de livrare</h4>

                <FormField
                  control={intlForm.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nume destinatar *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ion Popescu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={intlForm.control}
                  name="recipientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon destinatar *</FormLabel>
                      <FormControl>
                        <Input placeholder="+49 30 12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={intlForm.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stradă & număr *</FormLabel>
                      <FormControl>
                        <Input placeholder="Hauptstraße 25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={intlForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localitate *</FormLabel>
                        <FormControl>
                          <Input placeholder="München" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={intlForm.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cod poștal *</FormLabel>
                        <FormControl>
                          <Input placeholder="80331" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={intlForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Țara *</FormLabel>
                      <FormControl>
                        <Input placeholder="Germania" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    Prețul afișat acoperă livrarea în majoritatea țărilor europene.
                    Pentru destinații extra-europene, te vom contacta dacă apare un cost suplimentar.
                  </div>
                </div>
              </form>
            </Form>
          )}
        </div>
      )}

      {/* Email confirmation now inline above (next to the picker) — no
          separate full-width block. The slim banner there is enough; the
          parent step's "Continuă" button is already enabled via
          onValidChange(true). */}
    </div>
  );
}
