'use client';

/**
 * CompanyProfileSection Component
 *
 * Company profile form with CUI validation via ANAF API.
 * Used in the PJ sub-tab of ProfileTab.
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Save,
  BadgeCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CompanyProfile {
  cui: string;
  name: string;
  type: string;
  registrationNumber: string;
  address: string;
  isActive: boolean;
  vatPayer: boolean;
  verified: boolean;
}

interface CompanyProfileSectionProps {
  companyProfile: CompanyProfile | null;
  onSave: (data: CompanyProfile) => Promise<void>;
  className?: string;
}

export default function CompanyProfileSection({
  companyProfile,
  onSave,
  className,
}: CompanyProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(!companyProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [cuiLoading, setCuiLoading] = useState(false);
  const [cuiError, setCuiError] = useState<string | null>(null);
  const [cuiVerified, setCuiVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CompanyProfile>({
    cui: companyProfile?.cui || '',
    name: companyProfile?.name || '',
    type: companyProfile?.type || '',
    registrationNumber: companyProfile?.registrationNumber || '',
    address: companyProfile?.address || '',
    isActive: companyProfile?.isActive || false,
    vatPayer: companyProfile?.vatPayer || false,
    verified: companyProfile?.verified || false,
  });

  // Sync when companyProfile changes
  useEffect(() => {
    if (companyProfile) {
      setFormData({
        cui: companyProfile.cui,
        name: companyProfile.name,
        type: companyProfile.type,
        registrationNumber: companyProfile.registrationNumber,
        address: companyProfile.address,
        isActive: companyProfile.isActive,
        vatPayer: companyProfile.vatPayer,
        verified: companyProfile.verified,
      });
      setCuiVerified(true);
    }
  }, [companyProfile]);

  const handleCuiChange = useCallback((value: string) => {
    const cleanCui = value.replace(/^RO/i, '').replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({
      ...prev,
      cui: cleanCui,
      name: '',
      type: '',
      registrationNumber: '',
      address: '',
      isActive: false,
      vatPayer: false,
    }));
    setCuiVerified(false);
    setCuiError(null);
  }, []);

  const validateCUI = useCallback(async () => {
    const cui = formData.cui.replace(/\s/g, '');
    if (!cui || cui.length < 2) {
      setCuiError('Introdu un CUI valid');
      return;
    }

    setCuiLoading(true);
    setCuiError(null);
    setCuiVerified(false);

    try {
      const response = await fetch('/api/company/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cui }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.error || 'Eroare la validarea CUI');
      }

      const data = await response.json();

      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          cui: data.data.cui || prev.cui,
          name: data.data.name || '',
          type: data.data.type || '',
          registrationNumber: data.data.registrationNumber || '',
          address: data.data.address || '',
          isActive: data.data.isActive ?? false,
          vatPayer: data.data.vatPayer ?? false,
        }));
        setCuiVerified(true);
      } else {
        throw new Error(data.error || 'CUI invalid sau firmă inexistentă');
      }
    } catch (err) {
      console.error('CUI validation error:', err);
      setCuiError(err instanceof Error ? err.message : 'Eroare la validarea CUI');
    } finally {
      setCuiLoading(false);
    }
  }, [formData.cui]);

  const handleSave = useCallback(async () => {
    if (!formData.cui || !formData.name) {
      setError('CUI-ul și denumirea firmei sunt obligatorii');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await onSave(formData);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvare');
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave]);

  const handleCancel = useCallback(() => {
    if (companyProfile) {
      setFormData({
        cui: companyProfile.cui,
        name: companyProfile.name,
        type: companyProfile.type,
        registrationNumber: companyProfile.registrationNumber,
        address: companyProfile.address,
        isActive: companyProfile.isActive,
        vatPayer: companyProfile.vatPayer,
        verified: companyProfile.verified,
      });
      setCuiVerified(true);
      setIsEditing(false);
    }
    setError(null);
    setCuiError(null);
  }, [companyProfile]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Profil Firmă</h3>
          <p className="text-sm text-neutral-500">
            Datele firmei pentru comenzi ca persoană juridică
          </p>
        </div>
        {companyProfile && !isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Building2 className="w-4 h-4 mr-2" />
            Editează
          </Button>
        )}
        {isEditing && companyProfile && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Anulează
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !cuiVerified}
              className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvează
            </Button>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Datele firmei au fost salvate cu succes!</AlertDescription>
        </Alert>
      )}

      {/* No company profile yet */}
      {!companyProfile && !isEditing && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
          <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h4 className="font-semibold text-secondary-900 mb-2">Nicio firmă asociată</h4>
          <p className="text-sm text-neutral-500 mb-4">
            Adaugă datele firmei tale pentru comenzi mai rapide ca persoană juridică.
          </p>
          <Button onClick={() => setIsEditing(true)} className="bg-primary-500 hover:bg-primary-600 text-secondary-900">
            <Building2 className="w-4 h-4 mr-2" />
            Adaugă firmă
          </Button>
        </div>
      )}

      {/* Form / View Mode */}
      {(isEditing || companyProfile) && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          {isEditing ? (
            <div className="p-6 space-y-6">
              {/* CUI with validation */}
              <div className="space-y-2">
                <Label htmlFor="company-cui" className="text-secondary-900 font-medium">
                  CUI (Cod Unic de Înregistrare) <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="company-cui"
                    type="text"
                    value={formData.cui}
                    onChange={(e) => handleCuiChange(e.target.value)}
                    placeholder="ex: 12345678"
                    className={cn(
                      'font-mono flex-1',
                      cuiVerified && 'border-green-500',
                      cuiError && 'border-red-500'
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={validateCUI}
                    disabled={cuiLoading || !formData.cui || formData.cui.length < 2}
                    className="shrink-0"
                  >
                    {cuiLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Verifică ANAF
                      </>
                    )}
                  </Button>
                </div>
                {cuiError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {cuiError}
                  </p>
                )}
                {cuiVerified && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    CUI valid - date completate automat din ANAF
                  </p>
                )}
              </div>

              {/* Auto-filled fields (read-only after ANAF validation) */}
              {cuiVerified && (
                <>
                  <div className="space-y-2">
                    <Label className="text-secondary-900 font-medium">Denumire Firmă</Label>
                    <Input value={formData.name} readOnly className="bg-neutral-50" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-secondary-900 font-medium">Forma Juridică</Label>
                      <Input value={formData.type} readOnly className="bg-neutral-50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-secondary-900 font-medium">Nr. Registrul Comerțului</Label>
                      <Input value={formData.registrationNumber} readOnly className="bg-neutral-50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-secondary-900 font-medium">Sediu Social</Label>
                    <Input value={formData.address} readOnly className="bg-neutral-50" />
                  </div>

                  {/* Status badges */}
                  <div className="flex flex-wrap gap-3">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                      formData.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}>
                      {formData.isActive ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      {formData.isActive ? 'Firmă activă' : 'Firmă inactivă'}
                    </span>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                      formData.vatPayer
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-neutral-100 text-neutral-600'
                    )}>
                      {formData.vatPayer ? 'Plătitor TVA' : 'Neplătitor TVA'}
                    </span>
                  </div>
                </>
              )}

              {/* Save button for new company */}
              {!companyProfile && cuiVerified && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !cuiVerified}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-secondary-900"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvează datele firmei
                </Button>
              )}
            </div>
          ) : (
            /* View Mode */
            <div className="divide-y divide-neutral-100">
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-500">Denumire firmă</p>
                  <p className="font-medium text-secondary-900">{companyProfile?.name || '-'}</p>
                </div>
              </div>

              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <span className="text-xs font-mono font-bold text-neutral-600">CUI</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-500">CUI</p>
                  <p className="font-medium text-secondary-900 font-mono">{companyProfile?.cui || '-'}</p>
                </div>
              </div>

              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-600">{companyProfile?.type || '?'}</span>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Forma juridică</p>
                    <p className="font-medium text-secondary-900">{companyProfile?.type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Nr. Reg. Comerțului</p>
                    <p className="font-medium text-secondary-900">{companyProfile?.registrationNumber || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-neutral-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-500">Sediu social</p>
                  <p className="font-medium text-secondary-900">{companyProfile?.address || '-'}</p>
                </div>
              </div>

              {/* Status row */}
              <div className="p-4 flex items-center gap-3 flex-wrap">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                  companyProfile?.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                )}>
                  {companyProfile?.isActive ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {companyProfile?.isActive ? 'Activă' : 'Inactivă'}
                </span>
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                  companyProfile?.vatPayer
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-neutral-100 text-neutral-600'
                )}>
                  {companyProfile?.vatPayer ? 'Plătitor TVA' : 'Neplătitor TVA'}
                </span>
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                  companyProfile?.verified
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                )}>
                  {companyProfile?.verified ? (
                    <BadgeCheck className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {companyProfile?.verified ? 'Verificată' : 'Neverificată'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
