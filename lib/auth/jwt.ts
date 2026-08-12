import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'mcc_session';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function createToken(payload: MccSessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export interface MccSessionPayload extends JWTPayload {
  userId: string;
  email: string;
  roleName: string;
  fullName: string;
}

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

/**
 * Sign a new session JWT and set it as an HttpOnly cookie.
 * Call from Route Handlers (login, register) — NOT from client components.
 */
export async function createSession(payload: MccSessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return token;
}

/**
 * Verify the session cookie and return the decoded payload.
 * Returns null if missing, expired, or tampered.
 * Safe to call from Route Handlers and Server Components.
 */
export async function getSession(): Promise<MccSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecret());
    return payload as MccSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Verify a raw token string (used in Edge middleware via jose).
 * Does NOT use next/headers — safe for middleware.
 */
export async function verifyToken(token: string): Promise<MccSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as MccSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Clear the session cookie (logout).
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
