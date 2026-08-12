import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { SystemRoleName } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MapDisplayToEnum: Record<string, SystemRoleName> = {
  'Super Admin': SystemRoleName.SUPER_ADMIN,
  'Website Admin': SystemRoleName.WEBSITE_ADMIN,
  'Event Manager': SystemRoleName.EVENT_MANAGER,
  'Content Manager': SystemRoleName.CONTENT_MANAGER,
  'Media Manager': SystemRoleName.MEDIA_MANAGER,
  'Faculty Coordinator': SystemRoleName.FACULTY_COORDINATOR,
  'President': SystemRoleName.PRESIDENT,
  'Vice President': SystemRoleName.VICE_PRESIDENT,
  'Technical Lead': SystemRoleName.TECHNICAL_LEAD,
  'Student': SystemRoleName.STUDENT,
  'Volunteer': SystemRoleName.VOLUNTEER,
  'SUPER_ADMIN': SystemRoleName.SUPER_ADMIN,
  'WEBSITE_ADMIN': SystemRoleName.WEBSITE_ADMIN,
  'EVENT_MANAGER': SystemRoleName.EVENT_MANAGER,
  'CONTENT_MANAGER': SystemRoleName.CONTENT_MANAGER,
  'MEDIA_MANAGER': SystemRoleName.MEDIA_MANAGER,
  'FACULTY_COORDINATOR': SystemRoleName.FACULTY_COORDINATOR,
  'PRESIDENT': SystemRoleName.PRESIDENT,
  'VICE_PRESIDENT': SystemRoleName.VICE_PRESIDENT,
  'TECHNICAL_LEAD': SystemRoleName.TECHNICAL_LEAD,
  'STUDENT': SystemRoleName.STUDENT,
  'VOLUNTEER': SystemRoleName.VOLUNTEER,
};

const UpdateRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  roleName: z.string().min(1, 'Role name is required'),
});

// GET /api/users — Fetch list of all registered users (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search')?.trim().toLowerCase() || '';

    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { studentId: { contains: search, mode: 'insensitive' } },
                { department: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        studentId: true,
        fullName: true,
        email: true,
        enrollmentNumber: true,
        college: true,
        department: true,
        year: true,
        division: true,
        profilePhoto: true,
        communityPoints: true,
        currentRank: true,
        roleName: true,
        roleId: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ users });
  } catch (e) {
    console.error('[GET /api/users]', e);
    return ERR.INTERNAL();
  }
}

// PATCH /api/users — Assign role/designation access to a registered user (Admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const body = await req.json();
    const parsed = UpdateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return ERR.VALIDATION(parsed.error.errors[0].message);
    }

    const { userId, roleName: rawRoleName } = parsed.data;

    const targetEnum = MapDisplayToEnum[rawRoleName];
    if (!targetEnum) {
      return err(`Invalid role name "${rawRoleName}".`, 400);
    }

    // Find Role record
    let roleRecord = await prisma.role.findFirst({
      where: { roleName: targetEnum },
    });

    if (!roleRecord) {
      // Fallback find any role matching Enum
      roleRecord = await prisma.role.findFirst();
    }

    if (!roleRecord) {
      return err('Role system record not found.', 500);
    }

    // Update User Role & Designation
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roleName: targetEnum,
        roleId: roleRecord.id,
      },
      select: {
        id: true,
        studentId: true,
        fullName: true,
        email: true,
        roleName: true,
        roleId: true,
        department: true,
      },
    });

    // Log in Audit Logs
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName || 'Admin',
        role: session.roleName,
        action: `Assigned designation "${targetEnum}" to user ${updatedUser.fullName}`,
        module: 'RBAC',
        status: 'SUCCESS',
        details: `Updated role for ${updatedUser.email} (ID: ${updatedUser.id}) to ${targetEnum}`,
      },
    });

    return ok({
      user: updatedUser,
      message: `Successfully assigned designation "${targetEnum}" to ${updatedUser.fullName}! Permissions updated live.`,
    });
  } catch (e) {
    console.error('[PATCH /api/users]', e);
    return ERR.INTERNAL();
  }
}
