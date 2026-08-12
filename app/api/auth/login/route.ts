import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma, withDbRetry } from '@/lib/prisma';
import { createSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';

const LoginSchema = z.object({
  identifier: z.string().min(1, 'Email or Student ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return ERR.VALIDATION(parsed.error.errors[0].message);
    }

    const { identifier, password } = parsed.data;
    if (!identifier || !password) {
      return ERR.VALIDATION('Identifier and password are required.');
    }

    const rawId = identifier.trim();
    const cleanId = rawId.toLowerCase();

    // Single ultra-fast indexed case-insensitive query
    const user = await withDbRetry(() =>
      prisma.user.findFirst({
        where: {
          isDeleted: false,
          OR: [
            { email: { equals: cleanId, mode: 'insensitive' } },
            { studentId: { equals: rawId, mode: 'insensitive' } },
            { enrollmentNumber: { equals: rawId, mode: 'insensitive' } },
          ],
        },
      })
    );

    if (!user) {
      return err('No matching student account found for this ID or email.', 401);
    }

    if (!user.passwordHash) {
      return err('Account authentication error. Password not initialized.', 401);
    }

    let passwordValid = false;
    try {
      passwordValid = await bcrypt.compare(password, user.passwordHash);
    } catch (bcryptErr) {
      console.error('[Login Bcrypt Compare Error]', bcryptErr);
      passwordValid = false;
    }

    if (!passwordValid) {
      return err('Invalid password. Please check your credentials.', 401);
    }

    // Issue HttpOnly JWT session cookie
    try {
      await createSession({
        userId: user.id,
        email: user.email,
        roleName: user.roleName,
        fullName: user.fullName,
      });
    } catch (sessionErr: any) {
      console.error('[Login createSession Error]', sessionErr);
      return err(sessionErr?.message || 'Session creation failed. Please try again.', 500);
    }

    // Return user WITHOUT passwordHash
    const { passwordHash: _ph, ...safeUser } = user;
    void _ph;

    return ok({ user: safeUser });
  } catch (e: any) {
    console.error('[POST /api/auth/login Error]', e);
    const msg = e?.message || '';
    if (msg.includes("Can't reach database") || msg.includes('P1001') || msg.includes('P1002')) {
      return err('Database server is spinning up. Please try again in 5 seconds.', 503);
    }
    return err('An unexpected error occurred during login. Please try again.', 500);
  }
}
