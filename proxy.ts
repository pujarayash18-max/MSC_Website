import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ADMIN_ROLES } from '@/lib/constants/roles';
import type { SystemRoleName } from '@/types';

const COOKIE_NAME = 'mcc_session';

function getSecret(): Uint8Array {
  const secret =
    process.env.NEXTAUTH_SECRET ||
    process.env.SESSION_SECRET ||
    'mcc-platform-fallback-key-change-in-production';
  return new TextEncoder().encode(secret);
}

interface SessionPayload {
  userId: string;
  email: string;
  roleName: string;
  fullName: string;
}

/**
 * Cryptographically verify the session JWT using jose.
 * Rejects forged, expired, or tampered tokens — no plain base64-decode.
 */
async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { userId, email, roleName, fullName } = payload as Record<string, unknown>;
    if (!userId || !email || !roleName) return null;
    return { userId, email, roleName, fullName } as SessionPayload;
  } catch {
    // Expired, invalid signature, malformed — all result in null
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard dashboard and admin routes
  if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySession(token);

  if (!session) {
    // Token invalid/expired — clear cookie and redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // RBAC guard for /admin/* routes
  if (pathname.startsWith('/admin')) {
    if (!ADMIN_ROLES.includes(session.roleName as SystemRoleName)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const middleware = proxy;

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
