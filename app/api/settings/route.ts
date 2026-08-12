import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { createAndSendNotification } from '@/lib/notifications';

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'global',
          clubName: 'Microsoft Campus Club - Marwadi University',
          theme: 'dark',
          maintenanceMode: false,
          contactEmail: 'mcc@marwadiuniversity.ac.in',
          socialLinks: {
            whatsapp: 'https://chat.whatsapp.com/MCCMarwadi',
            instagram: 'https://instagram.com/mcc_marwadi',
            linkedin: 'https://linkedin.com/company/mcc-marwadi',
            github: 'https://github.com/pujarayash18-max/MSC_Website',
            email: 'mcc@marwadiuniversity.ac.in',
          },
        },
      });
    }

    return ok({ settings });
  } catch (e) {
    console.error('[GET /api/settings]', e);
    return ERR.INTERNAL();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const body = await req.json();
    const { clubName, logoUrl, defaultPoints, limits, maintenanceMode, contactEmail, socialLinks } = body;

    const existing = await prisma.settings.findUnique({ where: { id: 'global' } });

    const updated = await prisma.settings.upsert({
      where: { id: 'global' },
      update: {
        ...(clubName !== undefined ? { clubName } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(defaultPoints !== undefined ? { defaultPoints } : {}),
        ...(limits !== undefined ? { limits } : {}),
        ...(maintenanceMode !== undefined ? { maintenanceMode: Boolean(maintenanceMode) } : {}),
        ...(contactEmail !== undefined ? { contactEmail } : {}),
        ...(socialLinks !== undefined ? { socialLinks } : {}),
      },
      create: {
        id: 'global',
        clubName: clubName || 'Microsoft Campus Club - Marwadi University',
        logoUrl: logoUrl || null,
        defaultPoints: defaultPoints || {},
        limits: limits || {},
        maintenanceMode: Boolean(maintenanceMode),
        contactEmail: contactEmail || 'mcc@marwadiuniversity.ac.in',
        socialLinks: socialLinks || {},
      },
    });

    // Module #20: Point schema change notification to all active students
    if (defaultPoints && JSON.stringify(existing?.defaultPoints) !== JSON.stringify(defaultPoints)) {
      const students = await prisma.user.findMany({
        where: { isDeleted: false, status: 'active' },
        select: { id: true, email: true },
      });

      for (const s of students) {
        createAndSendNotification({
          userId: s.id,
          userEmail: s.email,
          title: 'Scoring & Point Schema Updated',
          message: 'The Executive Board has updated the Community Point scoring schema going forward. Historical point balances remain preserved.',
          type: 'EVENT_REMINDER',
          link: '/dashboard/points',
        }).catch(() => {});
      }
    }

    return ok({ settings: updated, message: 'Settings updated successfully.' });
  } catch (e) {
    console.error('[PATCH /api/settings]', e);
    return ERR.INTERNAL();
  }
}
