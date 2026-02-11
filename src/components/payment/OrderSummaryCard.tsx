'use client';

import { Package, Truck, Tag, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OrderOption {
  name: string;
  price: number;
}

interface OrderSummaryCardProps {
  orderNumber: string;
  serviceName: string;
  basePrice: number;
  options?: OrderOption[];
  deliveryMethod?: string;
  deliveryPrice?: number;
  totalPrice: number;
}

export function OrderSummaryCard({
  orderNumber,
  serviceName,
  basePrice,
  options = [],
  deliveryMethod,
  deliveryPrice = 0,
  totalPrice,
}: OrderSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary-500" />
          Rezumat comandă
        </CardTitle>
        <p className="text-sm text-neutral-500 font-mono">{orderNumber}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service */}
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-neutral-400 mt-0.5" />
            <div>
              <p className="font-medium text-secondary-900">{serviceName}</p>
              <p className="text-sm text-neutral-500">Serviciu de bază</p>
            </div>
          </div>
          <p className="font-medium text-secondary-900">
            {(basePrice || 0).toFixed(2)} RON
          </p>
        </div>

        {/* Options */}
        {options.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-neutral-400 mt-0.5" />
                    <p className="text-secondary-900">{option.name}</p>
                  </div>
                  <p className="text-secondary-900">
                    +{(option.price || 0).toFixed(2)} RON
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delivery */}
        {deliveryMethod && (
          <>
            <Separator />
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-secondary-900">{deliveryMethod}</p>
                  <p className="text-sm text-neutral-500">Livrare</p>
                </div>
              </div>
              <p className="text-secondary-900">
                {(deliveryPrice || 0) > 0 ? `+${(deliveryPrice || 0).toFixed(2)} RON` : 'Gratuit'}
              </p>
            </div>
          </>
        )}

        {/* Total */}
        <Separator />
        <div className="flex justify-between items-center pt-2">
          <p className="text-lg font-semibold text-secondary-900">Total</p>
          <p className="text-2xl font-bold text-secondary-900">
            {(totalPrice || 0).toFixed(2)} RON
          </p>
        </div>

        {/* VAT Note */}
        <p className="text-xs text-neutral-500 text-center">
          Prețurile includ TVA 19%
        </p>
      </CardContent>
    </Card>
  );
}
