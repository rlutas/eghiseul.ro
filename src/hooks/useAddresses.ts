'use client';

/**
 * useAddresses Hook
 *
 * Manages user's saved delivery addresses with CRUD operations.
 */

import { useState, useEffect, useCallback } from 'react';
import type { AddressData } from '@/components/shared/AddressForm';

interface SavedAddress extends AddressData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface UseAddressesReturn {
  addresses: SavedAddress[];
  defaultAddress: SavedAddress | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (data: AddressData) => Promise<SavedAddress | null>;
  update: (id: string, data: Partial<AddressData>) => Promise<SavedAddress | null>;
  remove: (id: string) => Promise<boolean>;
  setDefault: (id: string) => Promise<boolean>;
}

export function useAddresses(): UseAddressesReturn {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user/addresses');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch addresses');
      }

      setAddresses(result.data || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Get default address
  const defaultAddress = addresses.find(a => a.isDefault) || null;

  // Create new address
  const create = useCallback(async (data: AddressData): Promise<SavedAddress | null> => {
    try {
      setError(null);

      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create address');
      }

      // Refresh addresses list
      await fetchAddresses();

      return result.data;
    } catch (err) {
      console.error('Error creating address:', err);
      setError(err instanceof Error ? err.message : 'Failed to create address');
      return null;
    }
  }, [fetchAddresses]);

  // Update address
  const update = useCallback(async (id: string, data: Partial<AddressData>): Promise<SavedAddress | null> => {
    try {
      setError(null);

      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update address');
      }

      // Refresh addresses list
      await fetchAddresses();

      return result.data;
    } catch (err) {
      console.error('Error updating address:', err);
      setError(err instanceof Error ? err.message : 'Failed to update address');
      return null;
    }
  }, [fetchAddresses]);

  // Delete address
  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete address');
      }

      // Refresh addresses list
      await fetchAddresses();

      return true;
    } catch (err) {
      console.error('Error deleting address:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete address');
      return false;
    }
  }, [fetchAddresses]);

  // Set default address
  const setDefault = useCallback(async (id: string): Promise<boolean> => {
    return (await update(id, { isDefault: true })) !== null;
  }, [update]);

  return {
    addresses,
    defaultAddress,
    isLoading,
    error,
    refresh: fetchAddresses,
    create,
    update,
    remove,
    setDefault,
  };
}
