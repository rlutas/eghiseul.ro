'use client';

/**
 * SignatureStep Component
 *
 * Captures electronic signature with terms acceptance.
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PenLine, AlertCircle, Trash2, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { SignatureConfig } from '@/types/verification-modules';
import ContractPreview from './ContractPreview';

interface SignatureStepProps {
  config: SignatureConfig;
  onValidChange: (valid: boolean) => void;
}

export default function SignatureStep({ config, onValidChange }: SignatureStepProps) {
  const { state, updateSignature, updateConsent, validationAttempt } = useModularWizard();

  // Vezi nota din PropertyDataStep: casetele de eroare apar abia după prima
  // apăsare pe «Continuă». Aici conta mai mult decât oriunde — pasul se
  // deschidea cu „Semnătura ta este obligatorie" pe un canvas gol, ceea ce
  // citea a reproș, nu a instrucțiune.
  const [validationBaseline] = useState(validationAttempt);
  const showValidationError = validationAttempt !== validationBaseline;
  const signature = state.signature;
  const termsAccepted = !!state.consent?.termsAccepted;

  // Civil-status (naștere/căsătorie/celibat) cere două declarații suplimentare
  // la semnătură: vechiul certificat devine nul + corectitudinea datelor.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isCivilStatus = !!(state.verificationConfig as any)?.civilStatus;
  const oldCertVoidAccepted = !!state.consent?.oldCertVoidAccepted;
  const dataAccuracyAccepted = !!state.consent?.dataAccuracyAccepted;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set drawing style
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Load existing signature if present
    if (signature?.signatureBase64) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = `data:image/png;base64,${signature.signatureBase64}`;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get mouse/touch position
  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Start drawing
  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Only call preventDefault for MOUSE. React's touch listeners are passive,
    // so preventDefault there spams "Unable to preventDefault inside passive
    // event listener". Touch scrolling is already blocked by `touch-none` on
    // the canvas, so we don't need it for touch.
    if (!('touches' in e)) e.preventDefault();
    setIsDrawing(true);
    setHasSignature(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPosition]);

  // Draw
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    if (!('touches' in e)) e.preventDefault(); // mouse only (see handleStart)

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, getPosition]);

  // Stop drawing
  const handleEnd = useCallback(() => {
    // Fires on mouseLeave/touchEnd too — without this guard, just hovering
    // over the canvas would save a blank "signature" and auto-tick the T&C
    // consent below. Consent must only ever follow an actual signature.
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save signature as base64
    const base64 = canvas.toDataURL('image/png').split(',')[1];
    updateSignature?.({
      signatureBase64: base64,
      signedAt: new Date().toISOString(),
    });

    // Signing IS the act of giving consent (Legea 214/2024 / eIDAS Art. 25).
    // Auto-record T&C + Privacy + 14-day withdrawal waiver so the backend
    // audit trail (signature_metadata.consent) stays granular even though
    // the UI no longer shows three separate checkboxes (Review step dropped
    // on 2026-05-27). The checkout page reminds the user before payment
    // and refusing to pay is the way to "uncheck".
    updateConsent?.({
      termsAccepted: true,
      privacyAccepted: true,
      withdrawalWaiver: true,
    });
  }, [isDrawing, updateSignature, updateConsent]);

  // Clear signature
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);

    updateSignature?.({
      signatureBase64: '',
      signedAt: '',
    });

    // Mirror the auto-consent set in handleEnd: clearing the signature
    // withdraws the consent it implied. The user must re-sign to consent again.
    updateConsent?.({
      termsAccepted: false,
      privacyAccepted: false,
      withdrawalWaiver: false,
      oldCertVoidAccepted: false,
      dataAccuracyAccepted: false,
    });
  }, [updateSignature, updateConsent]);

  // Download signature
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'semnatura.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  // Toggle the T&C acceptance shown under the signature. One box covers all
  // three consent flags (terms + privacy + 14-day withdrawal waiver) — the
  // same grouped consent the backend audit trail records. Consent can never
  // be given BEFORE signing (the checkbox is disabled until a signature
  // exists), only withdrawn/re-given after.
  const handleToggleTerms = useCallback((checked: boolean) => {
    if (checked && !hasSignature) return;
    updateConsent?.({
      termsAccepted: checked,
      privacyAccepted: checked,
      withdrawalWaiver: checked,
    });
  }, [updateConsent, hasSignature]);

  // Validate form — signature AND the terms checkbox must be accepted.
  // Civil-status also requires the two extra declarations.
  const isFormValid = useCallback(() => {
    if (!signature) return false;
    if (config.required && !hasSignature) return false;
    if (config.required && !termsAccepted) return false;
    if (config.required && isCivilStatus && (!oldCertVoidAccepted || !dataAccuracyAccepted))
      return false;
    return true;
  }, [signature, config, hasSignature, termsAccepted, isCivilStatus, oldCertVoidAccepted, dataAccuracyAccepted]);

  // Notify parent of validation changes
  useEffect(() => {
    onValidChange(isFormValid());
  }, [isFormValid, onValidChange]);

  if (!signature) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Modulul de semnătură nu este activat pentru acest serviciu.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Preview */}
      <ContractPreview />

      {/* Signature Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5" />
            Semnătură Electronică
          </CardTitle>
          <CardDescription>
            Desenează semnătura ta folosind mouse-ul sau degetul pe ecran
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Canvas Container */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-48 cursor-crosshair touch-none"
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-sm">Semnează aici</p>
              </div>
            )}
          </div>

          {/* Canvas Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={!hasSignature}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Șterge
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!hasSignature}
            >
              <Download className="h-4 w-4 mr-2" />
              Descarcă
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions — shown right under the signature, auto-ticked when
          the user signs (signing = consent). Disabled until a signature exists:
          consent must never be checkable before the client actually signs. */}
      <div className="rounded-lg border bg-muted/20 p-4">
        <label className={`flex items-start gap-3 group ${hasSignature ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
          <Checkbox
            checked={termsAccepted}
            disabled={!hasSignature}
            onCheckedChange={(checked) => handleToggleTerms(checked === true)}
            className="mt-0.5 shrink-0"
          />
          <span className="text-sm leading-relaxed text-neutral-700 group-hover:text-neutral-900">
            <span className="text-red-500">*</span> Am citit și sunt de acord cu{' '}
            <a
              href="/termeni"
              target="_blank"
              rel="noopener"
              className="text-primary-600 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Termenii și Condițiile
            </a>
            {' '}și{' '}
            <a
              href="/confidentialitate"
              target="_blank"
              rel="noopener"
              className="text-primary-600 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Politica de Confidențialitate
            </a>
            . Solicit executarea imediată a serviciului și renunț la dreptul de retragere de 14 zile (OUG 34/2014, art. 16 lit. a). Accept că semnătura electronică simplă aplicată prin platformă are valoare juridică conform Legii nr. 214/2024 și Regulamentului UE 910/2014 (eIDAS).
          </span>
        </label>
      </div>

      {/* Declarații suplimentare — doar stare civilă (naștere/căsătorie/celibat) */}
      {isCivilStatus && (
        <>
          <div className="rounded-lg border bg-muted/20 p-4">
            <label className={`flex items-start gap-3 group ${hasSignature ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
              <Checkbox
                checked={oldCertVoidAccepted}
                disabled={!hasSignature}
                onCheckedChange={(checked) =>
                  hasSignature && updateConsent?.({ oldCertVoidAccepted: checked === true })
                }
                className="mt-0.5 shrink-0"
              />
              <span className="text-sm leading-relaxed text-neutral-700 group-hover:text-neutral-900">
                <span className="text-red-500">*</span> Înțeleg și sunt de acord că, odată cu înregistrarea comenzii pentru emiterea unui nou certificat, documentul anterior își pierde valabilitatea (devine nul), chiar dacă este identificat ulterior, și trebuie distrus.
              </span>
            </label>
          </div>

          <div className="rounded-lg border bg-muted/20 p-4">
            <label className={`flex items-start gap-3 group ${hasSignature ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
              <Checkbox
                checked={dataAccuracyAccepted}
                disabled={!hasSignature}
                onCheckedChange={(checked) =>
                  hasSignature && updateConsent?.({ dataAccuracyAccepted: checked === true })
                }
                className="mt-0.5 shrink-0"
              />
              <span className="text-sm leading-relaxed text-neutral-700 group-hover:text-neutral-900">
                <span className="text-red-500">*</span> <strong>Declarație privind corectitudinea datelor.</strong> Declar pe propria răspundere că toate informațiile furnizate sunt reale, corecte și complete. Înțeleg că eGhișeul.ro acționează în baza datelor comunicate de mine și nu răspunde pentru eventualele erori sau omisiuni din informațiile pe care le-am furnizat. În cazul în care informațiile declarate sunt false, incomplete sau eronate, documentul solicitat nu poate fi eliberat, iar contravaloarea serviciului prestat nu se restituie. De asemenea, înțeleg că furnizarea de informații false poate atrage răspunderea mea conform legislației în vigoare.
              </span>
            </label>
          </div>
        </>
      )}

      {/* Validation Message */}
      {showValidationError && !hasSignature && config.required && (
        <Alert data-wizard-error>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Semnătura ta este obligatorie pentru a continua.
          </AlertDescription>
        </Alert>
      )}
      {showValidationError && hasSignature && !termsAccepted && config.required && (
        <Alert data-wizard-error>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bifează acceptarea termenilor și condițiilor pentru a continua.
          </AlertDescription>
        </Alert>
      )}
      {showValidationError && hasSignature && termsAccepted && isCivilStatus &&
        (!oldCertVoidAccepted || !dataAccuracyAccepted) && config.required && (
        <Alert data-wizard-error>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bifează ambele declarații suplimentare pentru a continua.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
