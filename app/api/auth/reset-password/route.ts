import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ok, err, ERR } from '@/lib/api/response';

const ResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || 'mcc-platform-fallback-key-change-in-production';
  return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ResetSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const { token, password } = parsed.data;

    let payload: Record<string, unknown>;
    try {
      const verified = await jwtVerify(token, getSecret());
      payload = verified.payload as Record<string, unknown>;
    } catch {
      return err('Invalid or expired password reset link.', 400);
    }

    if (payload.type !== 'password_reset' || !payload.userId) {
      return err('Invalid token payload.', 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: String(payload.userId) },
      data: { passwordHash },
    });

    return ok({ message: 'Password updated successfully. You can now sign in with your new password.' });
  } catch (e) {
    console.error('[POST /api/auth/reset-password]', e);
    return ERR.INTERNAL();
  }
}
