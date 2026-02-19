'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  Trash2,
  Edit,
  Copy,
  RefreshCw,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Mail,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';

// ──────────────────────────────────────────────────────────────
// Permission labels and badge config
// ──────────────────────────────────────────────────────────────

const PERMISSION_CONFIG: Record<
  string,
  { label: string; shortLabel: string; className: string }
> = {
  'orders.view': {
    label: 'Vizualizare comenzi',
    shortLabel: 'Comenzi (vizualizare)',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  'orders.manage': {
    label: 'Gestionare comenzi',
    shortLabel: 'Comenzi (gestionare)',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  'payments.verify': {
    label: 'Verificare plăți',
    shortLabel: 'Plăți',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  'users.manage': {
    label: 'Gestionare utilizatori',
    shortLabel: 'Utilizatori',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  'settings.manage': {
    label: 'Gestionare setări',
    shortLabel: 'Setări',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  'documents.generate': {
    label: 'Generare documente',
    shortLabel: 'Documente (generare)',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  'documents.view': {
    label: 'Vizualizare documente',
    shortLabel: 'Documente (vizualizare)',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

const ALL_PERMISSION_KEYS = Object.keys(PERMISSION_CONFIG);

const ROLE_CONFIG: Record<string, { label: string; description: string }> = {
  employee: { label: 'Angajat', description: 'Acces de bază, permisiuni configurabile' },
  avocat: { label: 'Avocat', description: 'Vizualizare comenzi și documente' },
  operator: { label: 'Operator', description: 'Gestionare comenzi și documente' },
  contabil: { label: 'Contabil', description: 'Vizualizare comenzi și verificare plăți' },
  manager: { label: 'Manager', description: 'Acces complet (fără super admin)' },
};

const INVITE_ROLES = Object.keys(ROLE_CONFIG);

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  permissions: Record<string, boolean> | null;
  created_at: string | null;
  last_sign_in_at: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  permissions: Record<string, boolean> | null;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  invited_by: string | null;
}

interface Customer {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  kyc_verified: boolean | null;
  kyc_status: string;
  orders_count: number;
  blocked_at: string | null;
  created_at: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ──────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { hasPermission, isSuperAdmin } = useAdminPermissions();
  const [activeTab, setActiveTab] = useState('employees');
  const [quickInviteOpen, setQuickInviteOpen] = useState(false);

  // ── Permission Gate ──
  if (!hasPermission('users.manage')) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acces interzis</h2>
        <p className="text-muted-foreground max-w-md">
          Nu ai permisiunea de a gestiona utilizatorii. Contactează un administrator
          pentru a obține acces.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilizatori</h1>
          <p className="text-sm text-muted-foreground">
            Gestionare angajați, clienți și invitații
          </p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => setQuickInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Adaugă Utilizator
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="employees">Angajați</TabsTrigger>
          <TabsTrigger value="customers">Clienți</TabsTrigger>
          <TabsTrigger value="invitations">Invitații</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeesTab />
        </TabsContent>
        <TabsContent value="customers">
          <CustomersTab />
        </TabsContent>
        <TabsContent value="invitations">
          <InvitationsTab />
        </TabsContent>
      </Tabs>

      {/* Quick Invite Dialog (super_admin only) */}
      {isSuperAdmin && (
        <QuickInviteDialog
          open={quickInviteOpen}
          onClose={() => setQuickInviteOpen(false)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// QUICK INVITE DIALOG (super_admin only - simplified)
// ──────────────────────────────────────────────────────────────

const QUICK_INVITE_ROLES: { value: string; label: string; description: string }[] = [
  { value: 'super_admin', label: 'Super Admin', description: 'Acces complet la toate funcțiile' },
  { value: 'manager', label: 'Manager', description: 'Acces complet (fără super admin)' },
  { value: 'operator', label: 'Operator', description: 'Gestionare comenzi și documente' },
  { value: 'contabil', label: 'Contabil', description: 'Vizualizare comenzi și verificare plăți' },
  { value: 'avocat', label: 'Avocat', description: 'Vizualizare comenzi și documente' },
];

/** Role-based default permissions for quick invite */
const ROLE_DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  super_admin: {
    'orders.view': true,
    'orders.manage': true,
    'payments.verify': true,
    'users.manage': true,
    'settings.manage': true,
    'documents.generate': true,
    'documents.view': true,
  },
  manager: {
    'orders.view': true,
    'orders.manage': true,
    'payments.verify': true,
    'users.manage': true,
    'settings.manage': true,
    'documents.generate': true,
    'documents.view': true,
  },
  operator: {
    'orders.view': true,
    'orders.manage': true,
    'documents.generate': true,
    'documents.view': true,
  },
  contabil: {
    'orders.view': true,
    'payments.verify': true,
    'documents.view': true,
  },
  avocat: {
    'orders.view': true,
    'documents.view': true,
  },
};

function QuickInviteDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('operator');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error('Introdu un email valid');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Formatul emailului nu este valid');
      return;
    }

    setLoading(true);
    try {
      // Determine default permissions based on role
      const permissions = ROLE_DEFAULT_PERMISSIONS[selectedRole] || {};

      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          role: selectedRole === 'super_admin' ? 'manager' : selectedRole,
          permissions,
        }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Invitația a fost creată cu succes');
        setInviteLink(json.invitation?.link || null);
        if (!json.invitation?.link) {
          resetAndClose();
        }
      } else {
        toast.error(json.error || 'Eroare la trimiterea invitației');
      }
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setEmail('');
    setSelectedRole('operator');
    setInviteLink(null);
    onClose();
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success('Link-ul a fost copiat');
    }
  };

  const handleDone = () => {
    resetAndClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adaugă Utilizator</DialogTitle>
          <DialogDescription>
            Trimite o invitație prin email pentru un nou utilizator admin.
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          // Show success with invite link
          <div className="space-y-4">
            <div className="rounded-lg border bg-green-50 border-green-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800">Invitație creată!</p>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Trimite următorul link utilizatorului:
              </p>
              <div className="flex items-center gap-2">
                <Input value={inviteLink} readOnly className="text-xs font-mono" />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDone}>Gata</Button>
            </DialogFooter>
          </div>
        ) : (
          // Invite form
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick-invite-email">Email</Label>
              <Input
                id="quick-invite-email"
                type="email"
                placeholder="utilizator@exemplu.ro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={selectedRole}
                onValueChange={(val) => setSelectedRole(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează rolul" />
                </SelectTrigger>
                <SelectContent>
                  {QUICK_INVITE_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div className="flex flex-col">
                        <span>{r.label}</span>
                        <span className="text-xs text-muted-foreground">{r.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetAndClose}>
                Anulează
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Se trimite...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Trimite invitație
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────────
// EMPLOYEES TAB
// ──────────────────────────────────────────────────────────────

function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/employees');
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data || []);
      } else {
        toast.error(json.error || 'Eroare la încărcarea angajaților');
      }
    } catch {
      toast.error('Eroare de rețea la încărcarea angajaților');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/users/employees/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Angajatul a fost șters cu succes');
        setDeleteTarget(null);
        fetchEmployees();
      } else {
        toast.error(json.error || 'Eroare la ștergerea angajatului');
      }
    } catch {
      toast.error('Eroare de rețea');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {employees.length} angajați
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchEmployees} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Reîncarcă
          </Button>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invită angajat
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nume</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Permisiuni</TableHead>
              <TableHead>Data adăugare</TableHead>
              <TableHead className="w-[60px]">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Niciun angajat găsit.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">
                    {getFullName(emp.first_name, emp.last_name)}
                  </TableCell>
                  <TableCell className="text-sm">{emp.email || '-'}</TableCell>
                  <TableCell>
                    <RoleBadge role={emp.role} />
                  </TableCell>
                  <TableCell>
                    <PermissionBadges
                      permissions={emp.permissions}
                      isSuperAdmin={emp.role === 'super_admin'}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(emp.created_at)}
                  </TableCell>
                  <TableCell>
                    {emp.role !== 'super_admin' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditTarget(emp)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editare permisiuni
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(emp)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Șterge angajat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite Modal */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={() => {
          setInviteOpen(false);
          fetchEmployees();
        }}
      />

      {/* Edit Permissions Modal */}
      {editTarget && (
        <EditPermissionsModal
          employee={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            setEditTarget(null);
            fetchEmployees();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge angajat</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să elimini rolul de angajat pentru{' '}
              <strong>{deleteTarget?.email}</strong>? Utilizatorul va fi revertit
              la rolul de client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// INVITE MODAL
// ──────────────────────────────────────────────────────────────

function InviteModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('employee');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error('Introdu un email valid');
      return;
    }

    // Ensure at least one permission is selected
    const hasAny = Object.values(permissions).some(Boolean);
    if (!hasAny) {
      toast.error('Selectează cel puțin o permisiune');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role: selectedRole, permissions }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Invitația a fost creată cu succes');
        setInviteLink(json.invitation?.link || null);
        // Don't close yet if we want to show the link
        if (!json.invitation?.link) {
          resetAndClose();
          onSuccess();
        }
      } else {
        toast.error(json.error || 'Eroare la trimiterea invitației');
      }
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setEmail('');
    setSelectedRole('employee');
    setPermissions({});
    setInviteLink(null);
    onClose();
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success('Link-ul a fost copiat');
    }
  };

  const handleDone = () => {
    resetAndClose();
    onSuccess();
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invită angajat</DialogTitle>
          <DialogDescription>
            Trimite o invitație prin email pentru un nou angajat.
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          // Show success with invite link
          <div className="space-y-4">
            <div className="rounded-lg border bg-green-50 border-green-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800">Invitație creată!</p>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Trimite următorul link angajatului:
              </p>
              <div className="flex items-center gap-2">
                <Input value={inviteLink} readOnly className="text-xs font-mono" />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDone}>Gata</Button>
            </DialogFooter>
          </div>
        ) : (
          // Invite form
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="angajat@exemplu.ro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={selectedRole}
                onValueChange={(val) => setSelectedRole(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează rolul" />
                </SelectTrigger>
                <SelectContent>
                  {INVITE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      <div className="flex flex-col">
                        <span>{ROLE_CONFIG[r].label}</span>
                        <span className="text-xs text-muted-foreground">{ROLE_CONFIG[r].description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Permisiuni suplimentare</Label>
              {ALL_PERMISSION_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={`invite-perm-${key}`}
                    checked={!!permissions[key]}
                    onCheckedChange={() => togglePermission(key)}
                  />
                  <Label
                    htmlFor={`invite-perm-${key}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {PERMISSION_CONFIG[key].label}
                  </Label>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetAndClose}>
                Anulează
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Se trimite...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Trimite invitație
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────────
// EDIT PERMISSIONS MODAL
// ──────────────────────────────────────────────────────────────

function EditPermissionsModal({
  employee,
  open,
  onClose,
  onSuccess,
}: {
  employee: Employee;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [editRole, setEditRole] = useState(employee.role);
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    () => {
      const current: Record<string, boolean> = {};
      for (const key of ALL_PERMISSION_KEYS) {
        current[key] = employee.permissions?.[key] === true;
      }
      return current;
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/employees/${employee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole, permissions }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Permisiunile au fost actualizate');
        onSuccess();
      } else {
        toast.error(json.error || 'Eroare la actualizarea permisiunilor');
      }
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editare permisiuni</DialogTitle>
          <DialogDescription>
            {getFullName(employee.first_name, employee.last_name)} ({employee.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Rol</Label>
          <Select
            value={editRole}
            onValueChange={(val) => setEditRole(val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVITE_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_CONFIG[r].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Permisiuni suplimentare</Label>
          {ALL_PERMISSION_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={`edit-perm-${key}`}
                checked={!!permissions[key]}
                onCheckedChange={() => togglePermission(key)}
              />
              <Label
                htmlFor={`edit-perm-${key}`}
                className="text-sm font-normal cursor-pointer"
              >
                {PERMISSION_CONFIG[key].label}
              </Label>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anulează
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Se salvează...
              </>
            ) : (
              'Salvează'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────────
// CUSTOMERS TAB
// ──────────────────────────────────────────────────────────────

function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [blockTarget, setBlockTarget] = useState<Customer | null>(null);
  const [blockAction, setBlockAction] = useState<'block' | 'unblock'>('block');
  const PAGE_SIZE = 25;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));

      const res = await fetch(`/api/admin/users/customers?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setCustomers(json.data || []);
        setPagination(json.pagination || null);
      } else {
        toast.error(json.error || 'Eroare la încărcarea clienților');
      }
    } catch {
      toast.error('Eroare de rețea la încărcarea clienților');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search: reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const handleBlockToggle = async () => {
    if (!blockTarget) return;
    const blocked = blockAction === 'block';
    try {
      const res = await fetch(`/api/admin/users/customers/${blockTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(
          blocked
            ? 'Clientul a fost blocat'
            : 'Clientul a fost deblocat'
        );
        setBlockTarget(null);
        fetchCustomers();
      } else {
        toast.error(json.error || 'Eroare');
      }
    } catch {
      toast.error('Eroare de rețea');
    }
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Caută după email, nume, telefon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toți</SelectItem>
            <SelectItem value="active">Activi</SelectItem>
            <SelectItem value="blocked">Blocați</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Reîncarcă
        </Button>
      </div>

      {/* Count */}
      {pagination && (
        <p className="text-sm text-muted-foreground">
          {pagination.total} clienți în total
        </p>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nume</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead>Nr. Comenzi</TableHead>
              <TableHead>Data înregistrare</TableHead>
              <TableHead className="w-[60px]">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'Niciun client găsit pentru căutarea ta.'
                    : 'Niciun client înregistrat.'}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const isBlocked = !!customer.blocked_at;
                return (
                  <TableRow key={customer.id} className={isBlocked ? 'opacity-60' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getFullName(customer.first_name, customer.last_name)}
                        {isBlocked && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Blocat
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{customer.email || '-'}</TableCell>
                    <TableCell className="text-sm">{customer.phone || '-'}</TableCell>
                    <TableCell>
                      <KycBadge status={customer.kyc_status} />
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {customer.orders_count}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(customer.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isBlocked ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setBlockTarget(customer);
                                setBlockAction('unblock');
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Deblochează
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setBlockTarget(customer);
                                setBlockAction('block');
                              }}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Blochează
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {page} din {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Înapoi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Înainte
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Block/Unblock Confirmation */}
      <AlertDialog
        open={!!blockTarget}
        onOpenChange={(open) => !open && setBlockTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockAction === 'block' ? 'Blochează client' : 'Deblochează client'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockAction === 'block'
                ? `Ești sigur că vrei să blochezi clientul ${blockTarget?.email}? Acesta nu va mai putea accesa contul.`
                : `Ești sigur că vrei să deblochezi clientul ${blockTarget?.email}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              className={
                blockAction === 'block'
                  ? 'bg-destructive text-white hover:bg-destructive/90'
                  : ''
              }
              onClick={handleBlockToggle}
            >
              {blockAction === 'block' ? 'Blochează' : 'Deblochează'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// INVITATIONS TAB
// ──────────────────────────────────────────────────────────────

function InvitationsTab() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokeTarget, setRevokeTarget] = useState<Invitation | null>(null);
  const [resending, setResending] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/invitations');
      const json = await res.json();
      if (json.success) {
        setInvitations(json.data || []);
      } else {
        toast.error(json.error || 'Eroare la încărcarea invitațiilor');
      }
    } catch {
      toast.error('Eroare de rețea la încărcarea invitațiilor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      const res = await fetch(`/api/admin/users/invitations/${revokeTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Invitația a fost revocată');
        setRevokeTarget(null);
        fetchInvitations();
      } else {
        toast.error(json.error || 'Eroare la revocarea invitației');
      }
    } catch {
      toast.error('Eroare de rețea');
    }
  };

  const handleResend = async (invitation: Invitation) => {
    setResending(invitation.id);
    try {
      // Extract the role and permissions from the expired invitation
      const permissions = invitation.permissions || {};
      const role = invitation.role || 'employee';

      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: invitation.email, role, permissions }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Invitația a fost retrimisă');
        fetchInvitations();
      } else {
        toast.error(json.error || 'Eroare la retrimiterea invitației');
      }
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setResending(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {invitations.length} invitații
        </p>
        <Button variant="outline" size="sm" onClick={fetchInvitations} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Reîncarcă
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Permisiuni</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data trimitere</TableHead>
              <TableHead>Expiră la</TableHead>
              <TableHead className="w-[60px]">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nicio invitație trimisă.
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-sm font-medium">{inv.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={inv.role || 'employee'} />
                  </TableCell>
                  <TableCell>
                    <PermissionBadges permissions={inv.permissions} isSuperAdmin={false} />
                  </TableCell>
                  <TableCell>
                    <InvitationStatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(inv.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(inv.expires_at)}
                  </TableCell>
                  <TableCell>
                    {inv.status === 'pending' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setRevokeTarget(inv)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Revocă
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {(inv.status === 'expired' || inv.status === 'revoked') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleResend(inv)}
                        disabled={resending === inv.id}
                      >
                        {resending === inv.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        <span className="ml-1 text-xs">Retrimite</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Revoke Confirmation */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revocă invitația</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să revoci invitația pentru{' '}
              <strong>{revokeTarget?.email}</strong>? Link-ul de invitare nu
              va mai funcționa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleRevoke}
            >
              Revocă
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SHARED HELPERS & SUB-COMPONENTS
// ──────────────────────────────────────────────────────────────

function getFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'N/A';
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; className: string; icon: typeof Shield }> = {
    super_admin: { label: 'Super Admin', className: 'bg-purple-100 text-purple-800 border-purple-200', icon: ShieldCheck },
    manager: { label: 'Manager', className: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: ShieldCheck },
    operator: { label: 'Operator', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Shield },
    contabil: { label: 'Contabil', className: 'bg-green-100 text-green-800 border-green-200', icon: Shield },
    avocat: { label: 'Avocat', className: 'bg-amber-100 text-amber-800 border-amber-200', icon: Shield },
    employee: { label: 'Angajat', className: 'bg-gray-100 text-gray-800 border-gray-200', icon: Shield },
  };
  const c = config[role] || { label: role, className: 'bg-gray-100 text-gray-800 border-gray-200', icon: Shield };
  const Icon = c.icon;
  return (
    <Badge className={c.className}>
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  );
}

function PermissionBadges({
  permissions,
  isSuperAdmin,
}: {
  permissions: Record<string, boolean> | null;
  isSuperAdmin: boolean;
}) {
  if (isSuperAdmin) {
    return (
      <span className="text-xs text-purple-600 font-medium">Toate permisiunile</span>
    );
  }

  if (!permissions) return <span className="text-xs text-muted-foreground">-</span>;

  const active = Object.entries(permissions).filter(([, v]) => v === true);
  if (active.length === 0) {
    return <span className="text-xs text-muted-foreground">Fără permisiuni</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {active.map(([key]) => {
        const config = PERMISSION_CONFIG[key];
        if (!config) return null;
        return (
          <span
            key={key}
            className={`inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium ${config.className}`}
          >
            {config.shortLabel}
          </span>
        );
      })}
    </div>
  );
}

function KycBadge({ status }: { status: string }) {
  if (status === 'verified') {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3" />
        Verificat
      </Badge>
    );
  }
  if (status === 'partial') {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
        Parțial
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      Neverificat
    </Badge>
  );
}

function InvitationStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
          În așteptare
        </Badge>
      );
    case 'accepted':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Acceptată
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="secondary">
          Expirată
        </Badge>
      );
    case 'revoked':
      return (
        <Badge variant="destructive">
          Revocată
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
