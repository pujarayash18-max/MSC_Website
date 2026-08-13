import { NextRequest } from 'next/server';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';
import { ok, err, ERR } from '@/lib/api/response';
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
    const cleanEmail = email.trim().toLowerCase();

    // Verify if account exists for this email
    const user = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' }, isDeleted: false },
    });

    if (!user) {
      return err('No registered account was found with this email address. Please verify your email or register a new account.', 404);
    }

    // Generate signed, 1-hour reset token
    const token = await new SignJWT({ userId: user.id, email: user.email, type: 'password_reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(getSecret());

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    console.log(`[PASSWORD RESET DISPATCHED] Email: ${user.email} | Reset Link: ${resetUrl}`);

    // Send password reset email via Resend / SMTP
    await sendPasswordReset(user.email, user.fullName, resetUrl).catch((e) =>
      console.error('[Reset Email Dispatch Failed]', e)
    );

    return ok({
      exists: true,
      message: 'If an account exists with this email address, a password reset link will be sent.',
      devResetUrl: resetUrl,
      token,
    });
  } catch (e: any) {
    console.error('[POST /api/auth/forgot-password]', e);
    return err(e?.message || 'Failed to process password reset request.', 500);
  }
}
