'use client';

/**
 * BillingTab Component
 *
 * Displays and manages user's billing profiles (PF/PJ).
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Star,
  Loader2,
  AlertTriangle,
  CheckCircle,
  User,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import BillingProfileForm, { type BillingData } from '@/components/shared/BillingProfileForm';
import { useBillingProfiles } from '@/hooks/useBillingProfiles';

interface BillingTabProps {
  className?: string;
  prefillFromId?: {
    firstName?: string;
    lastName?: string;
    cnp?: string;
    address?: string;
  };
}

export default function BillingTab({ className, prefillFromId }: BillingTabProps) {
  const {
    profiles,
    defaultProfile,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
    setDefault,
  } = useBillingProfiles();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BillingData>>({
    type: 'persoana_fizica',
    label: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (editingId) {
        await update(editingId, formData as BillingData);
      } else {
        await create(formData as BillingData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ type: 'persoana_fizica', label: '' });
    } finally {
      setIsSaving(false);
    }
  }, [editingId, formData, create, update]);

  // Handle edit
  const handleEdit = useCallback((profile: BillingData & { id: string }) => {
    setEditingId(profile.id);
    setFormData(profile);
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
          <h3 className="text-lg font-semibold text-secondary-900">Profile de Facturare</h3>
          <p className="text-sm text-neutral-500">
            Gestionează datele pentru facturare (persoană fizică sau juridică)
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ type: 'persoana_fizica', label: '' });
            setShowForm(true);
          }}
          className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă profil
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
                {editingId ? 'Editează profil' : 'Adaugă profil nou'}
              </h2>
            </div>

            <div className="p-6">
              <BillingProfileForm
                value={formData}
                onChange={setFormData}
                onSubmit={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ type: 'persoana_fizica', label: '' });
                }}
                prefillFromId={prefillFromId}
                loading={isSaving}
              />
            </div>
          </div>
        </div>
      )}

      {/* Profiles List */}
      {profiles.length > 0 ? (
        <div className="grid gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={cn(
                'bg-white rounded-xl border-2 p-4 transition-all',
                profile.isDefault ? 'border-primary-300 bg-primary-50/30' : 'border-neutral-200'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      profile.type === 'persoana_fizica' ? 'bg-blue-100' : 'bg-purple-100'
                    )}>
                      {profile.type === 'persoana_fizica' ? (
                        <User className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Building2 className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <span className="font-semibold text-secondary-900">
                      {profile.label || (profile.type === 'persoana_fizica' ? 'Persoană Fizică' : 'Persoană Juridică')}
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      profile.type === 'persoana_fizica'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    )}>
                      {profile.type === 'persoana_fizica' ? 'PF' : 'PJ'}
                    </span>
                    {profile.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs">
                        <Star className="w-3 h-3" />
                        Implicit
                      </span>
                    )}
                  </div>

                  {profile.type === 'persoana_fizica' ? (
                    <div className="text-neutral-600">
                      <p>
                        {profile.firstName} {profile.lastName}
                        {profile.cnp && <span className="text-neutral-500"> • CNP: {profile.cnp}</span>}
                      </p>
                      {profile.address && (
                        <p className="text-sm text-neutral-500 mt-1">{profile.address}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-neutral-600">
                      <p className="font-medium">{profile.companyName}</p>
                      <p className="text-sm text-neutral-500">
                        CUI: {profile.cui}
                        {profile.regCom && ` • ${profile.regCom}`}
                      </p>
                      {profile.companyAddress && (
                        <p className="text-sm text-neutral-500 mt-1">{profile.companyAddress}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!profile.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(profile.id)}
                      title="Setează ca implicit"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(profile)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  {deleteConfirm === profile.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(profile.id)}
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
                      onClick={() => setDeleteConfirm(profile.id)}
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
            <CreditCard className="w-8 h-8 text-neutral-400" />
          </div>
          <h4 className="font-semibold text-secondary-900 mb-2">
            Nu ai profile de facturare
          </h4>
          <p className="text-neutral-500 mb-4">
            Adaugă un profil pentru a primi facturi personalizate
          </p>
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({ type: 'persoana_fizica', label: '' });
              setShowForm(true);
            }}
            className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adaugă profil
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sfat</p>
            <p className="text-blue-700">
              Poți adăuga mai multe profile de facturare (personale și pentru firmă).
              Profilul implicit va fi pre-selectat la plasarea comenzilor.
              Pentru persoane juridice, CUI-ul este validat automat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
