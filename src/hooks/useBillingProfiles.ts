'use client';

/**
 * useBillingProfiles Hook
 *
 * Manages user's billing profiles (PF/PJ) with CRUD operations.
 */

import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { BillingData, BillingType } from '@/components/shared/BillingProfileForm';
import type { ExtractedIdData } from '@/components/shared/IdScanner';
import { billingProfileFromIdData } from '@/lib/account/id-data-to-profile';

interface SavedBillingProfile extends BillingData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface UseBillingProfilesReturn {
  profiles: SavedBillingProfile[];
  defaultProfile: SavedBillingProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (data: BillingData) => Promise<SavedBillingProfile | null>;
  update: (id: string, data: Partial<BillingData>) => Promise<SavedBillingProfile | null>;
  remove: (id: string) => Promise<boolean>;
  setDefault: (id: string) => Promise<boolean>;
  createFromIdData: (idData: ExtractedIdData) => Promise<SavedBillingProfile | null>;
}

export function useBillingProfiles(): UseBillingProfilesReturn {
  const [profiles, setProfiles] = useState<SavedBillingProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch billing profiles
  const fetchProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user/billing-profiles');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch billing profiles');
      }

      setProfiles(result.data || []);
    } catch (err) {
      console.error('Error fetching billing profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch billing profiles');
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Get default profile
  const defaultProfile = profiles.find(p => p.isDefault) || null;

  // Create new billing profile
  const create = useCallback(async (data: BillingData): Promise<SavedBillingProfile | null> => {
    try {
      setError(null);

      const response = await fetch('/api/user/billing-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create billing profile');
      }

      // Refresh profiles list
      await fetchProfiles();

      return result.data;
    } catch (err) {
      console.error('Error creating billing profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create billing profile');
      return null;
    }
  }, [fetchProfiles]);

  // Update billing profile
  const update = useCallback(async (id: string, data: Partial<BillingData>): Promise<SavedBillingProfile | null> => {
    try {
      setError(null);

      const response = await fetch(`/api/user/billing-profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update billing profile');
      }

      // Refresh profiles list
      await fetchProfiles();

      return result.data;
    } catch (err) {
      console.error('Error updating billing profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update billing profile');
      return null;
    }
  }, [fetchProfiles]);

  // Delete billing profile
  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/user/billing-profiles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete billing profile');
      }

      // Refresh profiles list
      await fetchProfiles();

      return true;
    } catch (err) {
      console.error('Error deleting billing profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete billing profile');
      return false;
    }
  }, [fetchProfiles]);

  // Set default billing profile
  const setDefault = useCallback(async (id: string): Promise<boolean> => {
    return (await update(id, { isDefault: true })) !== null;
  }, [update]);

  // Create a PF billing profile from a scanned document.
  //
  // Structured on purpose: it used to fold the locality and the county into the
  // single address string, which is exactly the shape `isPfBillingComplete`
  // rejects — the profile looked saved in the account and the next order asked
  // for everything again. `billingProfileFromIdData` returns null when the
  // document does not carry enough, and null is better than a profile that
  // cannot be used.
  const createFromIdData = useCallback(async (idData: ExtractedIdData): Promise<SavedBillingProfile | null> => {
    const data = billingProfileFromIdData(idData);
    if (!data) return null;

    return create({ ...data, isDefault: profiles.length === 0 });
  }, [create, profiles.length]);

  return {
    profiles,
    defaultProfile,
    isLoading,
    error,
    refresh: fetchProfiles,
    create,
    update,
    remove,
    setDefault,
    createFromIdData,
  };
}
