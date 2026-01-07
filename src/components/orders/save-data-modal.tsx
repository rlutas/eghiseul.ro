'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface SaveDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  email: string;
  onSuccess?: () => void;
}

/**
 * SaveDataModal
 *
 * Modal displayed after order completion for guest users.
 * Allows them to create an account and save their data for future orders.
 */
export function SaveDataModal({
  isOpen,
  onClose,
  orderId,
  email,
  onSuccess,
}: SaveDataModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Parolele nu coincid');
      return;
    }

    if (password.length < 8) {
      setError('Parola trebuie să aibă minim 8 caractere');
      return;
    }

    if (!acceptedTerms) {
      setError('Trebuie să accepți Termenii și Condițiile');
      return;
    }

    if (!acceptedPrivacy) {
      setError('Trebuie să accepți Politica de Confidențialitate');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register-from-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          email,
          password,
          acceptedTerms,
          acceptedPrivacy,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || result.error || 'A apărut o eroare');
        return;
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      console.error('Register error:', err);
      setError('A apărut o eroare de rețea. Te rugăm să încerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              Cont creat cu succes!
            </DialogTitle>
            <DialogDescription className="pt-2">
              Am trimis un email de verificare la <strong>{email}</strong>.
              <br />
              <br />
              Te rugăm să confirmi adresa de email pentru a-ți activa contul.
              După confirmare, vei putea:
              <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                <li>Completa comenzi viitoare mai rapid</li>
                <li>Vedea istoricul comenzilor tale</li>
                <li>Folosi documentele KYC verificate</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose} className="w-full mt-4">
            Am înțeles
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Form state
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Salvează datele pentru comenzi viitoare!
          </DialogTitle>
          <DialogDescription>
            Ai completat deja toate datele. Creează un cont gratuit pentru a le păstra.
          </DialogDescription>
        </DialogHeader>

        {/* Benefits list */}
        <ul className="space-y-2 text-sm text-muted-foreground py-2">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Completare automată la următoarea comandă</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Documentele tale KYC sunt deja verificate</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Verifică statusul comenzilor tale oricând</span>
          </li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Parolă</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minim 8 caractere"
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmă parola</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetă parola"
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                disabled={isLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm leading-tight cursor-pointer"
              >
                Sunt de acord cu{' '}
                <a
                  href="/termeni"
                  className="text-primary underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Termenii și Condițiile
                </a>
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                disabled={isLoading}
              />
              <label
                htmlFor="privacy"
                className="text-sm leading-tight cursor-pointer"
              >
                Sunt de acord cu{' '}
                <a
                  href="/confidentialitate"
                  className="text-primary underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Politica de Confidențialitate
                </a>
              </label>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Se creează contul...
                </>
              ) : (
                'Creează Cont'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Mai târziu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
