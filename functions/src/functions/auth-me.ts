// GET /api/auth/me (§113)
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { parseClientPrincipal, getRoleFromPrincipal } from '../lib/auth';
import { successResponse } from '../lib/response';

export async function authMe(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('[AuthMe] Request received');
  const principal = parseClientPrincipal(request);
  const role = getRoleFromPrincipal(principal);

  return successResponse({
    isAuthenticated: !!principal,
    user: principal ? {
      userId: principal.userId,
      userDetails: principal.userDetails,
      identityProvider: principal.identityProvider,
      roleName: role
    } : null
  });
}

app.http('auth-me', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/me',
  handler: authMe
});
