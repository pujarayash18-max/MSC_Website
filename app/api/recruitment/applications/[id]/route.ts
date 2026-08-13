import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { createAndSendNotification } from '@/lib/notifications';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { id } = await params;
    const body = await req.json();
    const { status, reviewNotes } = body;

    const existing = await prisma.recruitmentApplication.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) return ERR.NOT_FOUND('Recruitment Application');

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (reviewNotes !== undefined) updateData.reviewNotes = reviewNotes;

    const application = await prisma.recruitmentApplication.update({
      where: { id },
      data: updateData,
    });

    // Notify student if status changed and user exists
    if (status && existing.status !== status && existing.userId) {
      const statusTitle =
        status === 'ACCEPTED'
          ? 'Leadership Application Accepted 🎉'
          : status === 'SHORTLISTED'
          ? 'Leadership Application Shortlisted ⭐'
          : status === 'REJECTED'
          ? 'Leadership Application Decision Update 📝'
          : 'Leadership Application Under Review';

      const statusMsg =
        status === 'ACCEPTED'
          ? `Congratulations! Your application for "${application.roleTitle}" has been accepted.`
          : status === 'SHORTLISTED'
          ? `Your application for "${application.roleTitle}" has been shortlisted for the next interview round.`
          : status === 'REJECTED'
          ? `Thank you for applying for "${application.roleTitle}". We are unable to move forward at this time.`
          : `Your application status for "${application.roleTitle}" was updated.`;

      createAndSendNotification({
        userId: existing.userId,
        userEmail: existing.email,
        title: statusTitle,
        message: `${statusMsg} ${reviewNotes ? `Admin Notes: ${reviewNotes}` : ''}`,
        type: 'RECRUITMENT_OPEN',
        link: '/dashboard',
      }).catch(() => {});
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName || 'Admin',
        role: session.roleName,
        action: `Updated Recruitment Application: ${application.fullName} (${application.roleTitle})`,
        module: 'TEAM_PROFILES',
        status: 'SUCCESS',
        details: `Set status to ${application.status}. Review notes: ${reviewNotes || 'None'}`,
      },
    }).catch(() => {});

    return ok({ application });
  } catch (e: any) {
    console.error('[PATCH /api/recruitment/applications/[id]]', e);
    return err(e?.message || 'Failed to update recruitment application.', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { id } = await params;
    const existing = await prisma.recruitmentApplication.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) return ERR.NOT_FOUND('Recruitment Application');

    await prisma.recruitmentApplication.update({
      where: { id },
      data: { isDeleted: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName || 'Admin',
        role: session.roleName,
        action: `Deleted Recruitment Application: ${existing.fullName}`,
        module: 'TEAM_PROFILES',
        status: 'SUCCESS',
        details: `Deleted application ID ${existing.id}`,
      },
    }).catch(() => {});

    return ok({ message: 'Application deleted.' });
  } catch (e: any) {
    console.error('[DELETE /api/recruitment/applications/[id]]', e);
    return err(e?.message || 'Failed to delete recruitment application.', 500);
  }
}
