import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, ERR } from '@/lib/api/response';
import { getSession } from '@/lib/auth/jwt';
import { isAdminRole } from '@/lib/constants/roles';

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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const body = await req.json();
    const { title, description, category, coverPhoto, images } = body;

    if (!title) return err('Title is required.', 400);

    const album = await prisma.galleryAlbum.create({
      data: {
        title,
        description: description || '',
        category: category || 'WORKSHOP',
        coverImage: coverPhoto || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        status: 'active',
        images: {
          create: (images || []).map((imgUrl: string, idx: number) => ({
            imageUrl: imgUrl,
            caption: `${title} photo ${idx + 1}`,
          })),
        },
      },
      include: { images: true },
    });

    return ok({ album }, 201);
  } catch (e) {
    console.error('[POST /api/gallery]', e);
    return ERR.INTERNAL();
  }
}
