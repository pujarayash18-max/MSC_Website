import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';

// Public gallery listing
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const albumId = searchParams.get('albumId');

    if (albumId) {
      const album = await prisma.galleryAlbum.findFirst({
        where: { id: albumId, isDeleted: false, status: 'active' },
        include: {
          images: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (!album) return ERR.NOT_FOUND('Album');
      return ok({ album });
    }

    const albums = await prisma.galleryAlbum.findMany({
      where: { isDeleted: false, status: 'active' },
      include: {
        _count: { select: { images: true } },
        images: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 1, // cover image
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ albums });
  } catch (e) {
    console.error('[GET /api/gallery]', e);
    return ERR.INTERNAL();
  }
}
