import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { isAdminRole } from '@/lib/constants/roles';

const COOKIE_NAME = 'mcc_session';

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXTAUTH_SECRET or SESSION_SECRET must be set in production!');
    }
    return new TextEncoder().encode('mcc-platform-fallback-key-change-in-production');
  }
  return new TextEncoder().encode(secret);
}

interface SessionPayload {
  userId: string;
  email: string;
  roleName: string;
  fullName: string;
}

async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { userId, email, roleName, fullName } = payload as Record<string, unknown>;
    if (!userId || !email || !roleName) return null;
    return { userId, email, roleName, fullName } as SessionPayload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const isAdmin = session ? isAdminRole(session.roleName) : false;

  // Maintenance mode check (full lockdown: UI pages + API write routes)
  const isMaintenanceActive = process.env.MAINTENANCE_MODE === 'true';
  if (isMaintenanceActive && !isAdmin && !pathname.startsWith('/_next') && !pathname.startsWith('/maintenance') && pathname !== '/login') {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { success: false, error: 'System is currently under scheduled maintenance. Please try again later.' },
        { status: 503 }
      );
    }
    return NextResponse.rewrite(new URL('/maintenance', request.url));
  }

  // Guard dashboard and admin routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const middleware = proxy;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
