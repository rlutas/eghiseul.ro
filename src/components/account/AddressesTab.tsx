'use client';

/**
 * AddressesTab Component
 *
 * Displays and manages user's saved delivery addresses.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AddressForm, { type AddressData } from '@/components/shared/AddressForm';
import { useAddresses } from '@/hooks/useAddresses';

interface AddressesTabProps {
  className?: string;
}

export default function AddressesTab({ className }: AddressesTabProps) {
  const {
    addresses,
    defaultAddress,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
    setDefault,
  } = useAddresses();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AddressData>>({
    country: 'RO',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (editingId) {
        await update(editingId, formData as AddressData);
      } else {
        await create(formData as AddressData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ country: 'RO' });
    } finally {
      setIsSaving(false);
    }
  }, [editingId, formData, create, update]);

  // Handle edit
  const handleEdit = useCallback((address: AddressData & { id: string }) => {
    setEditingId(address.id);
    setFormData(address);
    setShowForm(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (id: string) => {
    await remove(id);
    setDeleteConfirm(null);
  }, [remove]);

  // Handle set default
  const handleSetDefault = useCallback(async (id: string) => {
    await setDefault(id);
  }, [setDefault]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Adrese de Livrare</h3>
          <p className="text-sm text-neutral-500">
            Gestionează adresele pentru livrarea documentelor
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ country: 'RO' });
            setShowForm(true);
          }}
          className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă adresă
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-secondary-900">
                {editingId ? 'Editează adresa' : 'Adaugă adresă nouă'}
              </h2>
            </div>

            <div className="p-6">
              <AddressForm
                value={formData}
                onChange={setFormData}
                onSubmit={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ country: 'RO' });
                }}
                loading={isSaving}
                showLabel={true}
                showIsDefault={true}
                showCountrySelect={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length > 0 ? (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={cn(
                'bg-white rounded-xl border-2 p-4 transition-all',
                address.isDefault ? 'border-primary-300 bg-primary-50/30' : 'border-neutral-200'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className={cn(
                      'w-5 h-5',
                      address.isDefault ? 'text-primary-600' : 'text-neutral-400'
                    )} />
                    <span className="font-semibold text-secondary-900">
                      {address.label || 'Adresă'}
                    </span>
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs">
                        <Star className="w-3 h-3" />
                        Implicită
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-600">
                    {[
                      address.street,
                      address.number ? `Nr. ${address.number}` : null,
                      address.building ? `Bl. ${address.building}` : null,
                      address.staircase ? `Sc. ${address.staircase}` : null,
                      address.apartment ? `Ap. ${address.apartment}` : null,
                    ].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-neutral-500 text-sm">
                    {address.city}, {address.county}
                    {address.postalCode && `, ${address.postalCode}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      title="Setează ca implicită"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(address)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  {deleteConfirm === address.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(address.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-neutral-400" />
          </div>
          <h4 className="font-semibold text-secondary-900 mb-2">
            Nu ai adrese salvate
          </h4>
          <p className="text-neutral-500 mb-4">
            Adaugă prima adresă pentru a primi documentele mai rapid
          </p>
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({ country: 'RO' });
              setShowForm(true);
            }}
            className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adaugă adresă
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sfat</p>
            <p className="text-blue-700">
              Poți folosi adresa din actul de identitate scanat prin selectarea acesteia când adaugi o adresă nouă.
              Adresa implicită va fi pre-selectată automat la plasarea comenzilor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
