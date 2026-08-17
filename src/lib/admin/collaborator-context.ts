import { getUserPermissions, requirePermission } from './permissions';

/**
 * Cine „e" colaboratorul pentru cererea curentă.
 *
 * - normal: colaboratorul autentificat (portalul lui);
 * - preview (`?as=<collaboratorId>`): un admin cu `users.manage` care se uită
 *   în portal cu ochii colaboratorului, ca să vadă exact ce vede el.
 *   Preview-ul e STRICT READ-ONLY — rutele care scriu (note, mark-ready,
 *   upload-pdf) nu folosesc helperul ăsta, deci un admin nu poate lucra
 *   comanda „în numele" colaboratorului.
 */
export interface CollaboratorContext {
  /** ID-ul colaboratorului al cărui portal se citește. */
  collaboratorId: string;
  /** true dacă cererea vine de la un admin care previzualizează. */
  preview: boolean;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Rezolvă contextul de colaborator pentru o rută GET din /api/collaborator.
 * Aruncă un `Response` (ca restul helperelor de permisiuni) dacă accesul e refuzat.
 */
export async function resolveCollaboratorContext(
  userId: string,
  asParam: string | null
): Promise<CollaboratorContext> {
  if (!asParam) {
    const { role } = await getUserPermissions(userId);
    if (role !== 'collaborator') {
      throw jsonError('Collaborator access required', 403);
    }
    return { collaboratorId: userId, preview: false };
  }

  if (!UUID_RE.test(asParam)) {
    throw jsonError('Colaborator invalid', 400);
  }

  // Preview: doar cine administrează colaboratorii poate intra în portalul lor.
  await requirePermission(userId, 'users.manage');

  const { role: targetRole } = await getUserPermissions(asParam);
  if (targetRole !== 'collaborator') {
    throw jsonError('Utilizatorul nu este colaborator', 404);
  }

  return { collaboratorId: asParam, preview: true };
}
