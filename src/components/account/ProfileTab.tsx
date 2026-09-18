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
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateCNP } from '@/lib/validations/cnp';
import IdScanner, { type ExtractedIdData, type UploadedDocument, type OcrResult } from '@/components/shared/IdScanner';
import { useKycStatus } from '@/hooks/useKycStatus';
import CompanyProfileSection, { type CompanyProfile } from './CompanyProfileSection';
import { isoDate, isoFromRomanianDate } from '@/components/account/profile-steps/personal-fields';
import { uploadToS3 } from '@/lib/aws/upload-client';
import { base64ToFile } from '@/lib/images/compress';
import { PhoneInput } from '@/components/shared/PhoneInput';
import { validatePhone } from '@/lib/format/validate-phone';

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
  // Company profile
  companyProfile?: CompanyProfile | null;
}

type ProfileSubTab = 'pf' | 'pj';

interface ProfileTabProps {
  /**
   * Arrived from the profile checklist, which asks for one specific thing —
   * open the form straight away instead of behind another button.
   */
  autoEdit?: boolean;

  initialData?: ProfileData;
  className?: string;
}

export default function ProfileTab({ initialData, className, autoEdit = false }: ProfileTabProps) {
  const [profile, setProfile] = useState<ProfileData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [showScanner, setShowScanner] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('pf');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const {
    saveDocument,
    isVerified: kycIsVerified,
    hasFrontId,
    documents: kycDocuments
  } = useKycStatus();

  // Check if we have ID data from KYC (no need to scan again)
  const hasKycIdData = hasFrontId || (kycDocuments && kycDocuments.length > 0);

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
    setPhoneError(null);
  }, []);

  // Save profile
  const handleSave = useCallback(async () => {
    // A phone we cannot dial is a customer we cannot reach: refused here, with
    // the message under the field, and refused again by the server.
    const phoneMessage = validatePhone(editData.phone || '');
    if (phoneMessage) {
      setPhoneError(phoneMessage);
      document.getElementById('phone')?.focus();
      return;
    }

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
        // NOT `toISOString()`: `validateCNP` returns a local midnight, and
        // converting that to UTC from Romania (+02/+03) lands on the previous
        // day — a CNP of 920702 filled in 1 July 1992.
        setEditData(prev => ({ ...prev, birthDate: isoDate(result.data!.birthDate) }));
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
      // The OCR returns „02.07.1992"; `<input type="date">` accepts only
      // `YYYY-MM-DD` and drops anything else without a word.
      birthDate: isoFromRomanianDate(extractedData.birthDate) || prev.birthDate,
      birthPlace: extractedData.birthPlace || prev.birthPlace,
    }));

    // Save documents to KYC. The image goes to S3, exactly as the identity tab
    // does it — writing `data:image/jpeg;base64,…` into `file_url` puts the
    // whole picture in a Postgres row, and those rows are then inconsistent with
    // every other document in the account. The data URL stays only as a fallback
    // for when S3 is unavailable, same as in KYCTab.
    try {
      for (const doc of documents) {
        const verificationId = crypto.randomUUID();
        const mimeType = doc.mimeType || 'image/jpeg';
        let fileUrl = `data:${mimeType};base64,${doc.base64}`;
        let fileKey: string | undefined;

        try {
          const uploaded = await uploadToS3({
            category: 'kyc',
            file: base64ToFile(doc.base64, mimeType, `${doc.type}.jpg`),
            // The scanner's types are the same strings `KycDocumentType`
            // lists; the scanner just declares them as `string`.
            documentType: doc.type as Parameters<typeof uploadToS3>[0]['documentType'],
            verificationId,
          });
          fileUrl = uploaded.url;
          fileKey = uploaded.key;
        } catch (s3Error) {
          console.warn('S3 upload failed for scanned document, using data URL:', s3Error);
        }

        await saveDocument({
          documentType: doc.type,
          fileUrl,
          fileKey,
          fileSize: doc.fileSize,
          mimeType,
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

  // Handle company profile save
  const handleCompanySave = useCallback(async (companyData: CompanyProfile) => {
    const response = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyCui: companyData.cui,
        companyName: companyData.name,
        companyType: companyData.type,
        companyRegistrationNumber: companyData.registrationNumber,
        companyAddress: companyData.address,
        companyIsActive: companyData.isActive,
        companyVatPayer: companyData.vatPayer,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to save company profile');
    }

    // Update local profile state with returned company data
    setProfile(prev => prev ? {
      ...prev,
      companyProfile: result.data.companyProfile,
    } : null);
  }, []);

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
      {/* PF/PJ Sub-tab Toggle */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveSubTab('pf')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeSubTab === 'pf'
              ? 'bg-white text-secondary-900 shadow-sm'
              : 'text-neutral-500 hover:text-secondary-900'
          )}
        >
          <User className="w-4 h-4" />
          Persoană Fizică
        </button>
        <button
          onClick={() => setActiveSubTab('pj')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeSubTab === 'pj'
              ? 'bg-white text-secondary-900 shadow-sm'
              : 'text-neutral-500 hover:text-secondary-900'
          )}
        >
          <Building2 className="w-4 h-4" />
          Persoană Juridică
        </button>
      </div>

      {/* PJ Tab - Company Profile */}
      {activeSubTab === 'pj' && (
        <CompanyProfileSection
          companyProfile={profile?.companyProfile ?? null}
          onSave={handleCompanySave}
        />
      )}

      {/* PF Tab - Personal Profile (existing content) */}
      {activeSubTab === 'pf' && <>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Informații Profil</h3>
          <p className="text-sm text-neutral-500">
            Gestionează datele personale ale contului
          </p>
        </div>
        {!isEditing ? (
          <div className="flex gap-2">
            {/* Only show scanner if no KYC ID data exists */}
            {!hasKycIdData && (
              <Button
                variant="outline"
                onClick={() => setShowScanner(true)}
                className="bg-primary-50 hover:bg-primary-100 border-primary-200"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scanează act
              </Button>
            )}
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
            {/* Only show scanner in edit mode if no KYC ID data exists */}
            {!hasKycIdData && (
              <Button
                variant="outline"
                onClick={() => setShowScanner(true)}
                disabled={isSaving}
                className="bg-primary-50 hover:bg-primary-100 border-primary-200"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scanează
              </Button>
            )}
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

      {/* Info message when profile data comes from KYC */}
      {hasKycIdData && !isEditing && !success && !scanSuccess && (
        <Alert className="border-primary-200 bg-primary-50 text-primary-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Datele profilului sunt sincronizate cu documentele încărcate la verificarea identității (KYC).
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
              {/* The order form's field — country picker, dial code, number
                  checked per country — so what is saved here is a number the
                  wizard accepts and the team can dial. */}
              <PhoneInput
                id="phone"
                value={editData.phone || ''}
                onChange={(phone) => {
                  setEditData(prev => ({ ...prev, phone }));
                  setPhoneError(null);
                }}
                onBlur={() => setPhoneError(validatePhone(editData.phone || ''))}
                error={phoneError ?? undefined}
                aria-invalid={phoneError ? true : undefined}
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

      {/* Identity line. Not a warning any more: the account does not ask for
          the document (D9, 18.09.2026) — the order form does, with the selfie,
          for the services that need them. A saved document is good news; none
          is simply a fact. */}
      <div className={cn(
        'rounded-xl p-4 flex items-center gap-4',
        kycIsVerified || hasFrontId
          ? 'bg-green-50 border border-green-200'
          : 'bg-neutral-50 border border-neutral-200'
      )}>
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          kycIsVerified || hasFrontId ? 'bg-green-100' : 'bg-neutral-100'
        )}>
          {kycIsVerified || hasFrontId ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Scan className="w-5 h-5 text-neutral-500" />
          )}
        </div>
        <div>
          <p className={cn(
            'font-medium',
            kycIsVerified || hasFrontId ? 'text-green-800' : 'text-secondary-900'
          )}>
            {kycIsVerified
              ? 'Identitate verificată complet'
              : hasFrontId
              ? 'Act de identitate salvat'
              : 'Niciun act de identitate în cont'}
          </p>
          <p className={cn(
            'text-sm',
            kycIsVerified || hasFrontId ? 'text-green-700' : 'text-neutral-600'
          )}>
            {kycIsVerified
              ? 'Documentele tale au fost verificate cu succes. Datele profilului sunt sincronizate.'
              : hasFrontId
              ? 'Selfie-ul de verificare îl faci direct în comandă, la serviciile care îl cer.'
              : 'Îl fotografiezi direct în comandă, la serviciile care îl cer — sau îl adaugi acum din „Act de identitate”.'}
          </p>
        </div>
      </div>
      </>}
    </div>
  );
}
