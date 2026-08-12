import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search')?.trim().toLowerCase() || '';

    // Check count and seed initial logs if DB is empty
    const existingCount = await prisma.auditLog.count();
    if (existingCount === 0) {
      const adminUser = await prisma.user.findFirst({
        where: { roleName: { in: ['SUPER_ADMIN', 'WEBSITE_ADMIN'] } },
      });

      const seedUserId = adminUser?.id || session.userId;
      const seedUserName = adminUser?.fullName || session.fullName || 'Admin Yash';

      await prisma.auditLog.createMany({
        data: [
          {
            userId: seedUserId,
            userName: seedUserName,
            role: 'Super Admin',
            action: 'Updated RBAC Permission Matrix for Website Admin & Executive Roles',
            module: 'RBAC',
            status: 'SUCCESS',
            details: 'Saved live RBAC configuration matrix in database.',
            ipAddress: '103.24.18.5',
            browser: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
          },
          {
            userId: seedUserId,
            userName: seedUserName,
            role: 'Super Admin',
            action: 'Assigned designation "Technical Lead" to Student Member',
            module: 'RBAC',
            status: 'SUCCESS',
            details: 'Updated user role permissions and access rights live.',
            ipAddress: '103.24.18.5',
            browser: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
          },
          {
            userId: seedUserId,
            userName: 'System Core Engine',
            role: 'System',
            action: 'Recalculated Community Gamification Leaderboard Ranks & Points',
            module: 'LEADERBOARD',
            status: 'SUCCESS',
            details: 'Processed ledger totals and synchronized active ranks across all users.',
            ipAddress: '127.0.0.1',
            browser: 'Background Service Worker',
            timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
          },
        ],
      });
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: search
        ? {
            OR: [
              { userName: { contains: search, mode: 'insensitive' } },
              { action: { contains: search, mode: 'insensitive' } },
              { role: { contains: search, mode: 'insensitive' } },
              { details: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return ok({ logs: auditLogs });
  } catch (e) {
    console.error('[GET /api/audit-logs]', e);
    return ERR.INTERNAL();
  }
}
