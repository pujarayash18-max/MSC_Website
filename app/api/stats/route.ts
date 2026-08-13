import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api/response';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const [members, events, speakers, certificates] = await Promise.all([
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.event.count({ where: { isDeleted: false } }),
      prisma.speaker.count({ where: { isDeleted: false } }),
      prisma.certificate.count({ where: { isDeleted: false } }),
    ]);

    return ok({
      stats: {
        members: members || 0,
        events: events || 0,
        speakers: speakers || 0,
        certificates: certificates || 0,
      },
    });
  } catch (e: any) {
    console.error('[GET /api/stats]', e);
    return err(e?.message || 'Failed to fetch public stats', 500);
  }
}
