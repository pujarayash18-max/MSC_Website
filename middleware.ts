import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_ROLES } from '@/lib/constants/roles';
import { verifySessionToken } from '@/lib/auth/session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('mcc_user_session')?.value;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify cryptographic HMAC signature of session token
    const session = verifySessionToken(sessionToken);
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

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
};
