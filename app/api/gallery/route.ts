import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, ERR } from '@/lib/api/response';
import { getSession } from '@/lib/auth/jwt';
import { isAdminRole } from '@/lib/constants/roles';

const VALID_ALBUM_CATEGORIES: Record<string, string> = {
  WORKSHOP: 'WORKSHOPS',
  WORKSHOPS: 'WORKSHOPS',
  HACKATHON: 'HACKATHONS',
  HACKATHONS: 'HACKATHONS',
  BOOTCAMP: 'WORKSHOPS',
  COMMUNITY: 'COMMUNITY_MEETUPS',
  COMMUNITY_MEETUPS: 'COMMUNITY_MEETUPS',
  BEHIND_THE_SCENES: 'BEHIND_THE_SCENES',
  CONFERENCES: 'CONFERENCES',
};

// Public & Admin gallery listing
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

    const getMediaType = (url: string): string => {
      if (!url) return 'image';
      const ext = url.split('.').pop()?.split('?')[0].toLowerCase() || '';
      if (['mp4', 'webm', 'mov', 'm4v'].includes(ext)) return 'video';
      if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) return 'audio';
      return 'image';
    };

    const albumCategory = (VALID_ALBUM_CATEGORIES[(category || '').toUpperCase()] || 'WORKSHOPS') as any;

    const album = await prisma.galleryAlbum.create({
      data: {
        title,
        description: description || '',
        category: albumCategory,
        coverImage: coverPhoto || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        status: 'active',
        images: {
          create: (images || []).map((imgItem: any, idx: number) => {
            const url = typeof imgItem === 'string' ? imgItem : imgItem.url || imgItem.blobUrl || imgItem.imageUrl;
            const type = typeof imgItem === 'object' && imgItem.type ? imgItem.type : getMediaType(url);
            const itemTitle = typeof imgItem === 'object' && imgItem.title ? imgItem.title : `${title} media ${idx + 1}`;
            return {
              title: itemTitle,
              type,
              blobUrl: url,
              uploadedBy: session.userId,
            };
          }),
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
