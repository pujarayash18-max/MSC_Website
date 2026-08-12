import { NextRequest } from 'next/server';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';
import { sendPasswordReset } from '@/lib/email';

const ForgotSchema = z.object({
  email: z.string().email(),
});

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || 'mcc-platform-fallback-key-change-in-production';
  return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ForgotSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const { email } = parsed.data;
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase(), isDeleted: false },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return ok({ message: 'If an account exists with this email, password recovery instructions have been sent.' });
    }

    // Generate signed, 1-hour reset token
    const token = await new SignJWT({ userId: user.id, email: user.email, type: 'password_reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(getSecret());

    console.log(`[DEV ONLY] Password reset token for ${user.email}: ${token}`);

    // Return reset URL in dev-only response if email key isn't set yet
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // Send password reset email
    sendPasswordReset(user.email, user.fullName, resetUrl).catch((e) => console.error('[Reset Email Send Failed]', e));

    return ok({
      message: 'Password reset instructions sent to your email.',
      ...(process.env.NODE_ENV !== 'production' ? { devResetUrl: resetUrl, token } : {}),
    });
  } catch (e) {
    console.error('[POST /api/auth/forgot-password]', e);
    return ERR.INTERNAL();
  }
}
