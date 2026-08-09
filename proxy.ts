import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_ROLES } from '@/lib/constants/roles';

interface SessionPayload {
  userId: string;
  email: string;
  roleName: string;
  fullName: string;
  exp: number;
}

/**
 * Lightweight token decoder for Edge runtime.
 * Decodes the base64url payload segment without HMAC re-verification
 * (the full HMAC check is done in authService on every client hydration).
 * This is appropriate for a frontend-only mock app running without a backend.
 */
function decodeSessionToken(token: string): SessionPayload | null {
  try {
    if (!token || !token.includes('.')) return null;
    const [payloadBase64] = token.split('.');
    // Convert base64url to standard base64
    const base64 = payloadBase64
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const json = atob(padded);
    const payload: SessionPayload = JSON.parse(json);
    // Reject expired tokens
    if (!payload.userId || !payload.roleName) return null;
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('mcc_user_session')?.value;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = decodeSessionToken(sessionToken);
    if (!session || !session.roleName) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('mcc_user_session');
      return response;
    }

    // RBAC Guard for /admin/*
    if (pathname.startsWith('/admin')) {
      if (!ADMIN_ROLES.includes(session.roleName as import('@/types').SystemRoleName)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const middleware = proxy;

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
};
