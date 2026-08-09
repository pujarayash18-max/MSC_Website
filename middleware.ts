import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROLES = [
  'Super Admin',
  'Website Admin',
  'Event Manager',
  'Content Manager',
  'Media Manager',
  'Faculty Coordinator',
  'President',
  'Vice President',
  'Technical Lead'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('mcc_user_session')?.value;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie));
      if (!user || !user.roleName) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (pathname.startsWith('/admin')) {
        if (!ADMIN_ROLES.includes(user.roleName)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
};
