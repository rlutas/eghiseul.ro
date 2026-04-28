/* eslint-disable react-hooks/set-state-in-effect -- pre-existing pattern, refactor when touched */
'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Check,
  X,
  AlertTriangle,
  Clock,
  Loader2,
  LogIn,
  UserX,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────
// Permission label map (Romanian)
// ──────────────────────────────────────────────────────────────

const PERMISSION_LABELS: Record<string, { label: string; description: string }> = {
  'orders.view': {
    label: 'Vizualizare comenzi',
    description: 'Poate vedea lista de comenzi si detaliile',
  },
  'orders.manage': {
    label: 'Gestionare comenzi',
    description: 'Poate genera AWB, expedia si schimba status',
  },
  'payments.verify': {
    label: 'Verificare plati',
    description: 'Poate aproba sau respinge transferuri bancare',
  },
  'users.manage': {
    label: 'Management utilizatori',
    description: 'Poate adauga si gestiona angajati',
  },
  'settings.manage': {
    label: 'Setari platforma',
    description: 'Poate configura servicii, curieri si setari',
  },
};

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface InvitationData {
  email: string;
  permissions: Record<string, boolean>;
  expiresAt: string;
  status: string;
}

type PageState =
  | { kind: 'loading' }
  | { kind: 'no_token' }
  | { kind: 'valid'; invitation: InvitationData; authState: AuthState }
  | { kind: 'expired' }
  | { kind: 'revoked' }
  | { kind: 'accepted' }
  | { kind: 'invalid' }
  | { kind: 'error'; message: string };

type AuthState =
  | { kind: 'logged_in_match'; email: string }
  | { kind: 'logged_in_mismatch'; email: string; inviteEmail: string }
  | { kind: 'not_logged_in' };

// ──────────────────────────────────────────────────────────────
// Main page content (needs Suspense boundary for useSearchParams)
// ──────────────────────────────────────────────────────────────

function InviteAcceptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [accepting, setAccepting] = useState(false);

  // ── Validate token & check auth ────────────────────────────
  const validateToken = useCallback(async () => {
    if (!token) {
      setState({ kind: 'no_token' });
      return;
    }

    try {
      // 1. Validate token via API
      const res = await fetch(`/api/admin/invite/accept?token=${encodeURIComponent(token)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        // Map error responses to states
        const errorMsg = data.error || 'Unknown error';

        if (errorMsg.includes('expired')) {
          setState({ kind: 'expired' });
        } else if (errorMsg.includes('revoked')) {
          setState({ kind: 'revoked' });
        } else if (errorMsg.includes('already been accepted')) {
          setState({ kind: 'accepted' });
        } else if (res.status === 404) {
          setState({ kind: 'invalid' });
        } else {
          setState({ kind: 'error', message: errorMsg });
        }
        return;
      }

      const invitation: InvitationData = data.invitation;

      // 2. Check current auth state
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let authState: AuthState;

      if (user?.email) {
        const userEmail = user.email.toLowerCase();
        const inviteEmail = invitation.email.toLowerCase();

        if (userEmail === inviteEmail) {
          authState = { kind: 'logged_in_match', email: user.email };
        } else {
          authState = {
            kind: 'logged_in_mismatch',
            email: user.email,
            inviteEmail: invitation.email,
          };
        }
      } else {
        authState = { kind: 'not_logged_in' };
      }

      setState({ kind: 'valid', invitation, authState });
    } catch (err) {
      console.error('Failed to validate invitation:', err);
      setState({ kind: 'error', message: 'Nu s-a putut valida invitatia. Incearca din nou.' });
    }
  }, [token]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  // ── Accept invitation ──────────────────────────────────────
  const handleAccept = async () => {
    if (!token) return;
    setAccepting(true);

    try {
      const res = await fetch('/api/admin/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Nu s-a putut accepta invitatia');
        setAccepting(false);
        return;
      }

      toast.success('Invitatie acceptata!');

      // Small delay so the toast is visible before redirect
      setTimeout(() => {
        router.push(data.redirect || '/admin');
      }, 1000);
    } catch (err) {
      console.error('Accept invitation error:', err);
      toast.error('Eroare de retea. Incearca din nou.');
      setAccepting(false);
    }
  };

  // ── Handle login redirect ──────────────────────────────────
  const handleLoginRedirect = () => {
    const redirectPath = `/admin/invite/accept?token=${encodeURIComponent(token || '')}`;
    router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  // ── Handle sign out (for email mismatch) ───────────────────
  const handleSwitchAccount = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    handleLoginRedirect();
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      {/* Logo / Header */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          eGhiseul<span className="text-primary">.ro</span>
        </h1>
      </div>

      {/* State-dependent content */}
      {state.kind === 'loading' && <LoadingState />}
      {state.kind === 'no_token' && <InvalidTokenState />}
      {state.kind === 'invalid' && <InvalidTokenState />}
      {state.kind === 'expired' && <ExpiredState />}
      {state.kind === 'revoked' && <RevokedState />}
      {state.kind === 'accepted' && <AlreadyAcceptedState />}
      {state.kind === 'error' && <ErrorState message={state.message} />}
      {state.kind === 'valid' && (
        <ValidInvitationCard
          invitation={state.invitation}
          authState={state.authState}
          accepting={accepting}
          onAccept={handleAccept}
          onLogin={handleLoginRedirect}
          onSwitchAccount={handleSwitchAccount}
        />
      )}

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-400">
        Platformă de documente oficiale online
      </p>

      <Toaster position="top-center" richColors />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// State components
// ──────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Se valideaza invitatia...</p>
      </CardContent>
    </Card>
  );
}

function InvalidTokenState() {
  return (
    <Card className="w-full max-w-md border-destructive/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <X className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle>Invitatie invalida</CardTitle>
        <CardDescription>
          Token-ul de invitatie nu este valid sau nu a fost gasit. Verifica link-ul primit pe email.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center">
        <Button variant="outline" asChild>
          <Link href="/">Inapoi la pagina principala</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ExpiredState() {
  return (
    <Card className="w-full max-w-md border-yellow-300/50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <Clock className="h-6 w-6 text-yellow-600" />
        </div>
        <CardTitle>Invitatie expirata</CardTitle>
        <CardDescription>
          Aceasta invitatie a expirat. Contacteaza administratorul pentru a primi o invitatie noua.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center">
        <Button variant="outline" asChild>
          <Link href="/">Inapoi la pagina principala</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function RevokedState() {
  return (
    <Card className="w-full max-w-md border-destructive/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle>Invitatie revocata</CardTitle>
        <CardDescription>
          Aceasta invitatie a fost revocata de un administrator.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center">
        <Button variant="outline" asChild>
          <Link href="/">Inapoi la pagina principala</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function AlreadyAcceptedState() {
  return (
    <Card className="w-full max-w-md border-green-300/50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle>Invitatie deja acceptata</CardTitle>
        <CardDescription>
          Aceasta invitatie a fost deja acceptata. Poti accesa panoul de administrare.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center">
        <Button asChild>
          <Link href="/admin">
            Mergi la Admin
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="w-full max-w-md border-destructive/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle>Eroare</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardFooter className="justify-center">
        <Button variant="outline" asChild>
          <Link href="/">Inapoi la pagina principala</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────
// Valid invitation card
// ──────────────────────────────────────────────────────────────

function ValidInvitationCard({
  invitation,
  authState,
  accepting,
  onAccept,
  onLogin,
  onSwitchAccount,
}: {
  invitation: InvitationData;
  authState: AuthState;
  accepting: boolean;
  onAccept: () => void;
  onLogin: () => void;
  onSwitchAccount: () => void;
}) {
  // Extract granted permissions
  const grantedPermissions = Object.entries(invitation.permissions)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  const expiresDate = new Date(invitation.expiresAt);
  const formattedExpiry = expiresDate.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Invitatie Echipa eGhiseul</CardTitle>
        <CardDescription>
          Ai fost invitat sa te alaturi echipei eGhiseul Admin
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Invite email */}
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Invitatie pentru
          </p>
          <p className="font-medium text-gray-900">{invitation.email}</p>
        </div>

        {/* Permissions */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Permisiuni acordate
          </p>
          <div className="space-y-2">
            {grantedPermissions.map((perm) => {
              const info = PERMISSION_LABELS[perm];
              return (
                <div
                  key={perm}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {info?.label || perm}
                    </p>
                    {info?.description && (
                      <p className="text-xs text-muted-foreground">
                        {info.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {grantedPermissions.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Nicio permisiune specificata
              </p>
            )}
          </div>
        </div>

        {/* Expiration */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Expira pe {formattedExpiry}</span>
        </div>

        {/* Auth-dependent actions */}
        {authState.kind === 'logged_in_match' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Conectat ca <strong>{authState.email}</strong>
              </span>
            </div>
            <Button
              onClick={onAccept}
              disabled={accepting}
              className="w-full"
              size="lg"
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se accepta...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Accepta invitatia
                </>
              )}
            </Button>
          </div>
        )}

        {authState.kind === 'logged_in_mismatch' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <UserX className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Aceasta invitatie este pentru altcineva</p>
                <p className="mt-1 text-xs opacity-80">
                  Esti conectat ca <strong>{authState.email}</strong>, dar invitatia
                  este pentru <strong>{authState.inviteEmail}</strong>.
                </p>
              </div>
            </div>
            <Button
              onClick={onSwitchAccount}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Schimba contul
            </Button>
          </div>
        )}

        {authState.kind === 'not_logged_in' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <LogIn className="h-4 w-4 shrink-0" />
              <span>Trebuie sa te conectezi pentru a accepta invitatia</span>
            </div>
            <Button onClick={onLogin} className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Conecteaza-te pentru a accepta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────
// Page export (with Suspense for useSearchParams)
// ──────────────────────────────────────────────────────────────

export default function InviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <InviteAcceptContent />
    </Suspense>
  );
}
