import type { Json } from '@/types/supabase'

export interface ServiceConfig {
  basePrice: number
  options: ServiceOption[]
  deliveryOptions: DeliveryOption[]
}

export interface ServiceOption {
  id: string
  name: string
  price: number
  type: 'addon' | 'processing' | 'bundle'
}

export interface DeliveryOption {
  id: string
  name: string
  price: number
  estimatedDays: string
}

export interface PriceBreakdown {
  basePrice: number
  optionsTotal: number
  deliveryPrice: number
  total: number
  items: PriceItem[]
}

export interface PriceItem {
  name: string
  price: number
  type: 'base' | 'option' | 'delivery'
}

export function calculatePrice(
  serviceConfig: ServiceConfig,
  selectedOptions: string[],
  deliveryOptionId: string | null
): PriceBreakdown {
  const items: PriceItem[] = []

  // Base price
  items.push({
    name: 'Preț serviciu',
    price: serviceConfig.basePrice,
    type: 'base',
  })

  // Selected options
  let optionsTotal = 0
  for (const optionId of selectedOptions) {
    const option = serviceConfig.options.find(o => o.id === optionId)
    if (option) {
      items.push({
        name: option.name,
        price: option.price,
        type: 'option',
      })
      optionsTotal += option.price
    }
  }

  // Delivery
  let deliveryPrice = 0
  if (deliveryOptionId) {
    const delivery = serviceConfig.deliveryOptions.find(d => d.id === deliveryOptionId)
    if (delivery) {
      items.push({
        name: `Livrare: ${delivery.name}`,
        price: delivery.price,
        type: 'delivery',
      })
      deliveryPrice = delivery.price
    }
  }

  return {
    basePrice: serviceConfig.basePrice,
    optionsTotal,
    deliveryPrice,
    total: serviceConfig.basePrice + optionsTotal + deliveryPrice,
    items,
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 2,
  }).format(price)
}

export function parseServiceConfig(config: Json): ServiceConfig | null {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return null
  }

  const c = config as Record<string, unknown>

  return {
    basePrice: typeof c.basePrice === 'number' ? c.basePrice : 0,
    options: Array.isArray(c.options) ? c.options as ServiceOption[] : [],
    deliveryOptions: Array.isArray(c.deliveryOptions) ? c.deliveryOptions as DeliveryOption[] : [],
  }
}
