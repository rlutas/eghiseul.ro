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
  const { state, updateSignature, updateConsent } = useModularWizard();
  const signature = state.signature;
  const termsAccepted = !!state.consent?.termsAccepted;

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
    e.preventDefault();
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
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, getPosition]);

  // Stop drawing
  const handleEnd = useCallback(() => {
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
  }, [updateSignature, updateConsent]);

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
  // same grouped consent the backend audit trail records.
  const handleToggleTerms = useCallback((checked: boolean) => {
    updateConsent?.({
      termsAccepted: checked,
      privacyAccepted: checked,
      withdrawalWaiver: checked,
    });
  }, [updateConsent]);

  // Validate form — signature AND the terms checkbox must be accepted.
  const isFormValid = useCallback(() => {
    if (!signature) return false;
    if (config.required && !hasSignature) return false;
    if (config.required && !termsAccepted) return false;
    return true;
  }, [signature, config, hasSignature, termsAccepted]);

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
          the user signs (signing = consent) but can be toggled independently. */}
      <div className="rounded-lg border bg-muted/20 p-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <Checkbox
            checked={termsAccepted}
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

      {/* Validation Message */}
      {!hasSignature && config.required && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Semnătura ta este obligatorie pentru a continua.
          </AlertDescription>
        </Alert>
      )}
      {hasSignature && !termsAccepted && config.required && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bifează acceptarea termenilor și condițiilor pentru a continua.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
