// GET & POST /api/rbac/roles (§113, §126)
import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { verifyPermission } from '../lib/auth';
import { successResponse, errorResponse } from '../lib/response';
import { DEFAULTPERMISSIONMATRIX, SystemRoleName } from '../../../types/user';

const currentMatrix = { ...DEFAULTPERMISSIONMATRIX };

export async function rbacRoles(request: HttpRequest): Promise<HttpResponseInit> {
  const { authorized } = verifyPermission(request, 'RBAC', 'Read');

  if (request.method === 'GET') {
    return successResponse({
      matrix: currentMatrix
    });
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    if (!authorized) {
      return errorResponse('Forbidden: Requires RBAC management permissions', 'FORBIDDEN', 403);
    }

    try {
      const body = (await request.json()) as { role: SystemRoleName; matrix: typeof DEFAULTPERMISSIONMATRIX['Super Admin'] };
      if (body.role && body.matrix) {
        currentMatrix[body.role] = body.matrix;
        return successResponse({ message: `Role ${body.role} updated successfully`, matrix: currentMatrix });
      }
      return errorResponse('Invalid payload');
    } catch {
      return errorResponse('Failed to parse request body');
    }
  }

  return errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405);
}

app.http('rbac-roles', {
  methods: ['GET', 'POST', 'PUT'],
  authLevel: 'anonymous',
  route: 'rbac/roles',
  handler: rbacRoles
});
