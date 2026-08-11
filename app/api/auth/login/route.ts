import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
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
    const cleanId = identifier.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        isDeleted: false,
        status: 'active',
        OR: [
          { email: cleanId },
          { studentId: { equals: identifier.trim(), mode: 'insensitive' } },
          { enrollmentNumber: { equals: identifier.trim(), mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        studentId: true,
        roleName: true,
        communityPoints: true,
        currentRank: true,
        attendancePercentage: true,
        profilePhoto: true,
        college: true,
        department: true,
        year: true,
        division: true,
        bio: true,
        skills: true,
        github: true,
        linkedin: true,
        portfolio: true,
        enrollmentNumber: true,
        passwordHash: true,
        roleId: true,
        isDeleted: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return err('No account found for this email, Student ID, or enrollment number.', 401);
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return err('Invalid password. Please check your credentials.', 401);
    }

    // Issue HttpOnly JWT session cookie
    await createSession({
      userId: user.id,
      email: user.email,
      roleName: user.roleName,
      fullName: user.fullName,
    });

    // Return user WITHOUT passwordHash
    const { passwordHash: _ph, ...safeUser } = user;
    void _ph;

    return ok({ user: safeUser });
  } catch (e) {
    console.error('[POST /api/auth/login]', e);
    return ERR.INTERNAL();
  }
}
