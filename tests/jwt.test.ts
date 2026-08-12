import { describe, it, expect } from 'vitest';
import { createToken, verifyToken, COOKIE_NAME } from '@/lib/auth/jwt';

describe('JWT Auth Utilities', () => {
  it('should sign and verify a valid JWT session token', async () => {
    const payload = {
      userId: 'user_test_123',
      email: 'student@marwadiuniversity.ac.in',
      fullName: 'Rahul Sharma',
      roleId: 'role_student',
      roleName: 'Student' as const,
      studentId: '92100103045',
    };

    const token = await createToken(payload);
    expect(token).toBeTypeOf('string');
    expect(token.length).toBeGreaterThan(20);

    const verified = await verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.roleName).toBe(payload.roleName);
  });

  it('should return null for an invalid or tampered JWT token', async () => {
    const tampered = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature';
    const verified = await verifyToken(tampered);
    expect(verified).toBeNull();
  });

  it('should use correct cookie name mcc_session', () => {
    expect(COOKIE_NAME).toBe('mcc_session');
  });
});
