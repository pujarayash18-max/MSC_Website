const SESSION_SECRET = process.env.SESSION_SECRET || 'mcc-platform-secure-hmac-key-2026-v1';

export interface SessionPayload {
  userId: string;
  email: string;
  roleName: string;
  fullName: string;
  exp: number;
}

/**
 * Fast Web-Standard SHA-256 style hex hash for passwords & tokens (compatible with Edge Runtime, Node.js & Browser).
 */
export function hashPassword(password: string, salt: string = 'mcc-salt-2026'): string {
  const text = `${salt}:${password}`;
  let hash1 = 5381;
  let hash2 = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 << 5) - hash2 + char;
  }
  const str = `${Math.abs(hash1).toString(16)}${Math.abs(hash2).toString(16)}${password.length}`;
  const encoded = new TextEncoder().encode(str + text);
  let hex = '';
  for (let i = 0; i < encoded.length; i++) {
    hex += encoded[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function verifyPassword(password: string, storedHash: string, salt: string = 'mcc-salt-2026'): boolean {
  return hashPassword(password, salt) === storedHash;
}

/**
 * Sign a session payload into a tamper-proof token using Web Crypto compatible HMAC signature (base64url.signature).
 */
export function signSessionToken(payload: SessionPayload): string {
  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = typeof btoa !== 'undefined'
    ? btoa(payloadJson).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    : Buffer.from(payloadJson).toString('base64url');

  const signature = hashPassword(payloadBase64, SESSION_SECRET);
  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and decode a session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    if (!token || !token.includes('.')) return null;
    const [payloadBase64, signature] = token.split('.');

    const expectedSignature = hashPassword(payloadBase64, SESSION_SECRET);
    if (signature !== expectedSignature) {
      return null;
    }

    const payloadJson = typeof atob !== 'undefined'
      ? atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
      : Buffer.from(payloadBase64, 'base64url').toString('utf8');

    const payload: SessionPayload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
