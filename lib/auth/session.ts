export interface SessionPayload {
  userId: string;
  email: string;
  roleName: string;
  fullName: string;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'test') {
      return 'test-environment-secret-key-32-chars-minimum!';
    }
    throw new Error('[CRITICAL SECURITY RISK] SESSION_SECRET environment variable is missing!');
  }
  return secret;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Enterprise Web Crypto SHA-256 salted hash for passwords.
 */
export async function hashPassword(password: string, salt: string = 'mcc-user-salt-2026'): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, storedHash: string, salt: string = 'mcc-user-salt-2026'): Promise<boolean> {
  try {
    const computedHash = await hashPassword(password, salt);
    if (computedHash.length !== storedHash.length) return false;
    let res = 0;
    for (let i = 0; i < computedHash.length; i++) {
      res |= computedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return res === 0;
  } catch {
    return false;
  }
}

/**
 * Sign session payload into tamper-proof token using HMAC-SHA256 signature.
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secret = getSessionSecret();
  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = typeof btoa !== 'undefined'
    ? btoa(payloadJson).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    : Buffer.from(payloadJson).toString('base64url');

  const key = await getHmacKey(secret);
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadBase64));

  const signatureBytes = new Uint8Array(signatureBuffer);
  let binary = '';
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }
  const signatureBase64Url = (typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(signatureBytes).toString('base64'))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${payloadBase64}.${signatureBase64Url}`;
}

/**
 * Cryptographically verify and decode session token.
 * Returns null if token is tampered, forged, or expired.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    if (!token || !token.includes('.')) return null;
    const secret = getSessionSecret();
    const [payloadBase64, signatureBase64Url] = token.split('.');

    const key = await getHmacKey(secret);
    const enc = new TextEncoder();

    const base64 = signatureBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
    const binaryStr = typeof atob !== 'undefined' ? atob(paddedBase64) : Buffer.from(paddedBase64, 'base64').toString('binary');
    const signatureBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      signatureBytes[i] = binaryStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      enc.encode(payloadBase64)
    );

    if (!isValid) return null;

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
