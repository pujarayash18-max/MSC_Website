// Azure SWA Auth & Server-Side RBAC Guard (§125, §126)
import { HttpRequest } from '@azure/functions';
import { SystemModule, SystemRoleName, DEFAULTPERMISSIONMATRIX } from '../../../types/user';

export interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

export function parseClientPrincipal(req: HttpRequest): ClientPrincipal | null {
  const header = req.headers.get('x-ms-client-principal');
  if (!header) {
    // Check if dev header or query param present for local testing
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer mock-admin')) {
      return {
        identityProvider: 'aad',
        userId: 'dev-admin-id',
        userDetails: 'admin@marwadiuniversity.ac.in',
        userRoles: ['authenticated', 'admin', 'Super Admin']
      };
    }
    return null;
  }

  try {
    const decoded = Buffer.from(header, 'base64').toString('utf-8');
    return JSON.parse(decoded) as ClientPrincipal;
  } catch (err) {
    console.error('[Auth] Failed to parse x-ms-client-principal header:', err);
    return null;
  }
}

export function getRoleFromPrincipal(principal: ClientPrincipal | null): SystemRoleName {
  if (!principal) return 'Student';
  if (principal.userRoles.includes('Super Admin') || principal.userRoles.includes('superadmin')) {
    return 'Super Admin';
  }
  if (principal.userRoles.includes('Website Admin') || principal.userRoles.includes('admin')) {
    return 'Website Admin';
  }
  if (principal.userRoles.includes('Event Manager')) return 'Event Manager';
  if (principal.userRoles.includes('Content Manager')) return 'Content Manager';
  if (principal.userRoles.includes('Media Manager')) return 'Media Manager';
  if (principal.userRoles.includes('Faculty Coordinator')) return 'Faculty Coordinator';
  if (principal.userRoles.includes('President')) return 'President';
  if (principal.userRoles.includes('Vice President')) return 'Vice President';
  if (principal.userRoles.includes('Technical Lead')) return 'Technical Lead';
  if (principal.userRoles.includes('Volunteer')) return 'Volunteer';

  return 'Student';
}

export function verifyPermission(
  req: HttpRequest,
  requiredModule: SystemModule,
  requiredAction: 'Create' | 'Read' | 'Update' | 'Delete' | 'Publish' | 'Export' = 'Read'
): { authorized: boolean; role: SystemRoleName; principal: ClientPrincipal | null } {
  const principal = parseClientPrincipal(req);
  const role = getRoleFromPrincipal(principal);

  const rolePermissions = DEFAULTPERMISSIONMATRIX[role];
  if (!rolePermissions) {
    return { authorized: false, role, principal };
  }

  const moduleAccess = rolePermissions[requiredModule];
  if (moduleAccess === 'No View') {
    return { authorized: false, role, principal };
  }

  if (requiredAction === 'Read' && (moduleAccess === 'View' || moduleAccess === 'CRUD')) {
    return { authorized: true, role, principal };
  }

  if (requiredAction !== 'Read' && moduleAccess === 'CRUD') {
    return { authorized: true, role, principal };
  }

  return { authorized: false, role, principal };
}
