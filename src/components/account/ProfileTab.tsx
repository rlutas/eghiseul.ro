'use client';

/**
 * ProfileTab Component
 *
 * Displays and allows editing of user profile data.
 * Supports ID scanning with OCR to auto-fill profile data.
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  MapPin,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Pencil,
  X,
  Save,
  Scan,
  FileText,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateCNP } from '@/lib/validations/cnp';
import IdScanner, { type ExtractedIdData, type UploadedDocument, type OcrResult } from '@/components/shared/IdScanner';
import { useKycStatus } from '@/hooks/useKycStatus';

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cnp: string;
  birthDate: string;
  birthPlace: string;
  phone: string;
  kycVerified: boolean;
  // Document info from KYC
  documentSeries?: string;
  documentNumber?: string;
  documentType?: string;
  documentExpiry?: string;
}

interface ProfileTabProps {
  initialData?: ProfileData;
  className?: string;
}

export default function ProfileTab({ initialData, className }: ProfileTabProps) {
  const [profile, setProfile] = useState<ProfileData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [showScanner, setShowScanner] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const { saveDocument, isVerified: kycIsVerified, isPartial: kycIsPartial, hasSelfie } = useKycStatus();

  // Fetch profile data if not provided
  useEffect(() => {
    if (!initialData) {
      fetchProfile();
    }
  }, [initialData]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user/profile');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile');
      }

      setProfile(result.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing
  const handleStartEdit = useCallback(() => {
    if (profile) {
      setEditData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        cnp: profile.cnp,
        birthDate: profile.birthDate,
        birthPlace: profile.birthPlace,
        phone: profile.phone,
      });
      setIsEditing(true);
      setSuccess(false);
    }
  }, [profile]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditData({});
    setIsEditing(false);
    setError(null);
  }, []);

  // Save profile
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setProfile(result.data);
      setIsEditing(false);
      setEditData({});
      setSuccess(true);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }, [editData]);

  // Handle CNP change with auto-fill birth date
  const handleCNPChange = useCallback((value: string) => {
    const cleanCNP = value.replace(/\D/g, '').slice(0, 13);
    setEditData(prev => ({ ...prev, cnp: cleanCNP }));

    // Auto-fill birth date from CNP if valid
    if (cleanCNP.length === 13) {
      const result = validateCNP(cleanCNP);
      if (result.valid && result.data) {
        const birthDate = result.data.birthDate.toISOString().split('T')[0];
        setEditData(prev => ({ ...prev, birthDate }));
      }
    }
  }, []);

  // Handle ID scan complete - auto-fill profile and save to KYC
  const handleScanComplete = useCallback(async (data: {
    extractedData: ExtractedIdData;
    documents: UploadedDocument[];
    ocrResults: OcrResult[];
  }) => {
    const { extractedData, documents } = data;

    // Auto-fill profile data from scan
    setEditData(prev => ({
      ...prev,
      firstName: extractedData.firstName || prev.firstName,
      lastName: extractedData.lastName || prev.lastName,
      cnp: extractedData.cnp || prev.cnp,
      birthDate: extractedData.birthDate || prev.birthDate,
      birthPlace: extractedData.birthPlace || prev.birthPlace,
    }));

    // Save documents to KYC
    try {
      for (const doc of documents) {
        await saveDocument({
          documentType: doc.type,
          fileUrl: `data:${doc.mimeType};base64,${doc.base64}`,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          extractedData: extractedData,
          documentExpiry: extractedData.documentExpiry,
        });
      }
      setScanSuccess(true);
    } catch (err) {
      console.error('Error saving KYC document from profile:', err);
    }

    setShowScanner(false);
    setIsEditing(true); // Switch to edit mode to show the filled data
  }, [saveDocument]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Nu am putut încărca profilul.</AlertDescription>
      </Alert>
    );
  }

  const cnpValidation = editData.cnp ? validateCNP(editData.cnp) : { valid: true, errors: [] };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Informații Profil</h3>
          <p className="text-sm text-neutral-500">
            Gestionează datele personale ale contului
          </p>
        </div>
        {!isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowScanner(true)}
              className="bg-primary-50 hover:bg-primary-100 border-primary-200"
            >
              <Scan className="w-4 h-4 mr-2" />
              Scanează act
            </Button>
            <Button
              variant="outline"
              onClick={handleStartEdit}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editează
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowScanner(true)}
              disabled={isSaving}
              className="bg-primary-50 hover:bg-primary-100 border-primary-200"
            >
              <Scan className="w-4 h-4 mr-2" />
              Scanează
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Anulează
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
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

      {/* ID Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-secondary-900">Scanare Act Identitate</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Fotografiază cartea de identitate pentru a completa automat datele profilului
              </p>
            </div>

            <div className="p-6">
              <IdScanner
                onScanComplete={handleScanComplete}
                onError={(error) => setError(error)}
                showBackSide={true}
              />
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowScanner(false)}
              >
                Anulează
              </Button>
            </div>
          </div>
        </div>
      )}

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
          <AlertDescription>Profilul a fost actualizat cu succes!</AlertDescription>
        </Alert>
      )}

      {scanSuccess && !success && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Datele au fost completate din actul scanat. Verifică și salvează modificările.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {isEditing ? (
          /* Edit Mode */
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Nume</Label>
                <Input
                  id="lastName"
                  value={editData.lastName || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Popescu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Prenume</Label>
                <Input
                  id="firstName"
                  value={editData.firstName || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Ion"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnp">CNP</Label>
              <Input
                id="cnp"
                value={editData.cnp || ''}
                onChange={(e) => handleCNPChange(e.target.value)}
                placeholder="1234567890123"
                maxLength={13}
                className={cn(
                  'font-mono',
                  editData.cnp && editData.cnp.length === 13 && !cnpValidation.valid && 'border-red-500'
                )}
              />
              {editData.cnp && editData.cnp.length === 13 && !cnpValidation.valid && (
                <p className="text-sm text-red-500">{cnpValidation.errors[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data nașterii</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={editData.birthDate || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Locul nașterii</Label>
                <Input
                  id="birthPlace"
                  value={editData.birthPlace || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, birthPlace: e.target.value }))}
                  placeholder="București"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={editData.phone || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="0712345678"
              />
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="divide-y divide-neutral-100">
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                <User className="w-5 h-5 text-neutral-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-500">Nume complet</p>
                <p className="font-medium text-secondary-900">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : '-'}
                </p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-neutral-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-medium text-secondary-900">{profile.email}</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-neutral-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-500">CNP</p>
                <p className="font-medium text-secondary-900 font-mono">
                  {profile.cnp || '-'}
                </p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-neutral-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-500">Data nașterii</p>
                <p className="font-medium text-secondary-900">
                  {profile.birthDate
                    ? new Date(profile.birthDate).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-neutral-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-500">Locul nașterii</p>
                <p className="font-medium text-secondary-900">
                  {profile.birthPlace || '-'}
                </p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-neutral-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-500">Telefon</p>
                <p className="font-medium text-secondary-900">
                  {profile.phone || '-'}
                </p>
              </div>
            </div>

            {/* Document Info Section */}
            {(profile.documentSeries || profile.documentNumber || profile.documentType) && (
              <>
                <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100">
                  <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Informații Act Identitate</p>
                </div>

                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500">Tip Document</p>
                    <p className="font-medium text-secondary-900">
                      {profile.documentType || '-'}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500">Serie / Număr</p>
                    <p className="font-medium text-secondary-900 font-mono">
                      {profile.documentSeries && profile.documentNumber
                        ? `${profile.documentSeries} ${profile.documentNumber}`
                        : profile.documentSeries || profile.documentNumber || '-'}
                    </p>
                  </div>
                </div>

                {profile.documentExpiry && (
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-500">Valabil Până La</p>
                      <p className="font-medium text-secondary-900">
                        {new Date(profile.documentExpiry).toLocaleDateString('ro-RO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* KYC Status */}
      <div className={cn(
        'rounded-xl p-4 flex items-center gap-4',
        kycIsVerified
          ? 'bg-green-50 border border-green-200'
          : kycIsPartial
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-yellow-50 border border-yellow-200'
      )}>
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          kycIsVerified ? 'bg-green-100' : kycIsPartial ? 'bg-amber-100' : 'bg-yellow-100'
        )}>
          {kycIsVerified ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className={cn('w-5 h-5', kycIsPartial ? 'text-amber-600' : 'text-yellow-600')} />
          )}
        </div>
        <div>
          <p className={cn(
            'font-medium',
            kycIsVerified ? 'text-green-800' : kycIsPartial ? 'text-amber-800' : 'text-yellow-800'
          )}>
            {kycIsVerified ? 'Identitate verificată complet' : kycIsPartial ? 'Verificare incompletă' : 'Identitate neverificată'}
          </p>
          <p className={cn(
            'text-sm',
            kycIsVerified ? 'text-green-600' : kycIsPartial ? 'text-amber-600' : 'text-yellow-600'
          )}>
            {kycIsVerified
              ? 'Documentele tale au fost verificate cu succes.'
              : kycIsPartial && !hasSelfie
              ? 'Lipsește selfie-ul cu actul de identitate.'
              : 'Scanează actul de identitate în secțiunea KYC pentru verificare.'}
          </p>
        </div>
      </div>
    </div>
  );
}
