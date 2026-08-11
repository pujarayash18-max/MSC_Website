import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { ADMIN_ROLES } from '@/lib/constants/roles';
import type { SystemRoleName } from '@/types';

const BlogCreateSchema = z.object({
  title: z.string().min(5),
  slug: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(50),
  banner: z.string().url().optional().default('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200'),
  category: z.string().min(2),
  tags: z.array(z.string()).optional().default([]),
  readTime: z.string().optional().default('5 min read'),
  status: z.enum(['draft', 'pending', 'published', 'archived']).optional().default('pending'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    const session = await getSession();
    const isAdmin = session && ADMIN_ROLES.includes(session.roleName as SystemRoleName);

    // Public users see only published posts; admins see all
    const blogs = await prisma.blogPost.findMany({
      where: {
        isDeleted: false,
        ...(isAdmin ? (status ? { status } : {}) : { status: 'published' }),
        ...(category ? { category } : {}),
      },
      include: {
        author: { select: { fullName: true, profilePhoto: true, roleName: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return ok({ blogs });
  } catch (e) {
    console.error('[GET /api/blogs]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const body = await req.json();
    const parsed = BlogCreateSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { fullName: true, roleName: true, profilePhoto: true },
    });
    if (!user) return ERR.UNAUTHORIZED();

    // Admins can publish directly; others submit for review
    const isAdmin = ADMIN_ROLES.includes(session.roleName as SystemRoleName);
    const status = isAdmin ? parsed.data.status : 'pending';

    const blog = await prisma.blogPost.create({
      data: {
        ...parsed.data,
        status,
        authorId: session.userId,
        authorName: user.fullName,
        authorRole: String(user.roleName),
        authorPhoto: user.profilePhoto || undefined,
      },
    });

    return ok({ blog }, 201);
  } catch (e) {
    console.error('[POST /api/blogs]', e);
    return ERR.INTERNAL();
  }
}
