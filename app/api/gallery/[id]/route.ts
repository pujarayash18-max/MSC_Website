import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';
import { getSession } from '@/lib/auth/jwt';
import { isAdminRole } from '@/lib/constants/roles';

// DELETE /api/gallery/[id]?type=image|album
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { id } = await params;
    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type'); // 'image' or 'album'

    if (type === 'image') {
      const mediaItem = await prisma.galleryImage.findUnique({ where: { id } });
      if (!mediaItem) return ERR.NOT_FOUND('Media item');

      await prisma.galleryImage.update({
        where: { id },
        data: { isDeleted: true },
      });
      return ok({ message: 'Media item deleted successfully.' });
    }

    // Default: Delete entire album
    const album = await prisma.galleryAlbum.findUnique({ where: { id } });
    if (!album) return ERR.NOT_FOUND('Album');

    await prisma.galleryAlbum.update({
      where: { id },
      data: { isDeleted: true },
    });

    return ok({ message: 'Album and all contained media deleted successfully.' });
  } catch (e) {
    console.error('[DELETE /api/gallery/[id]]', e);
    return ERR.INTERNAL();
  }
}
