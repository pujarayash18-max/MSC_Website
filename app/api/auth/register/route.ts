import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';

const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  enrollmentNumber: z.string().min(5, 'Enrollment number required'),
  college: z.string().min(2, 'College name required'),
  department: z.string().min(2, 'Department required'),
  year: z.string().min(1, 'Year required'),
  division: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function generateStudentId(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(10000 + Math.random() * 90000);
  return `MCC-${year}-${seq.toString().padStart(5, '0')}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return ERR.VALIDATION(parsed.error.errors[0].message);
    }

    const { fullName, email, enrollmentNumber, college, department, year, division, password } =
      parsed.data;

    // Check for existing account
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { enrollmentNumber },
        ],
        isDeleted: false,
      },
    });
    if (existing) {
      return ERR.CONFLICT('An account with this email or enrollment number already exists.');
    }

    // Get Student role
    const studentRole = await prisma.role.findUnique({
      where: { roleName: 'STUDENT' },
    });
    if (!studentRole) {
      return ERR.INTERNAL();
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const studentId = generateStudentId();

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase(),
        enrollmentNumber,
        college: college.trim(),
        department: department.trim(),
        year,
        division: division?.trim(),
        studentId,
        passwordHash,
        roleId: studentRole.id,
        roleName: 'STUDENT',
        communityPoints: 50,
        bio: `Student at ${college} | Member of Microsoft Campus Club (MCC)`,
        skills: ['Cloud Computing', 'Azure'],
      },
      select: {
        id: true, email: true, fullName: true, studentId: true,
        roleName: true, communityPoints: true, profilePhoto: true,
        college: true, department: true, year: true,
      },
    });

    // Issue signed HttpOnly session cookie
    await createSession({
      userId: user.id,
      email: user.email,
      roleName: user.roleName,
      fullName: user.fullName,
    });

    return ok({
      user,
      message: `Account created! Your MCC Student ID is ${studentId}.`,
    }, 201);
  } catch (e) {
    console.error('[POST /api/auth/register]', e);
    return ERR.INTERNAL();
  }
}
