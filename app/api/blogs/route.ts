import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { createAndSendNotification } from '@/lib/notifications';
import { broadcastEvent } from '@/app/api/realtime/route';

const BlogCreateSchema = z.object({
  title: z.string().min(5),
  slug: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(50),
  banner: z.string().url().optional().default('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200'),
  category: z.string().min(2),
  tags: z.array(z.string()).optional().default([]),
  readTime: z.string().optional().default('5 min read'),
  status: z.enum(['draft', 'pending', 'published', 'archived', 'rejected']).optional().default('pending'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // 'published' | 'pending' | 'rejected' | 'all'
    const mine = searchParams.get('mine') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const session = await getSession();
    const isAdmin = session && isAdminRole(session.roleName);

    let filterCondition: any = { status: 'published' };

    if (session && mine) {
      // User requesting their own submitted blogs (all statuses)
      filterCondition = { authorId: session.userId };
    } else if (isAdmin && status === 'all') {
      // Admin console requesting all blogs
      filterCondition = {};
    } else if (status) {
      filterCondition = { status };
    }

    const blogs = await prisma.blogPost.findMany({
      where: {
        isDeleted: false,
        ...filterCondition,
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

    // Admins can publish directly; non-admins submit as 'pending'
    const isAdmin = isAdminRole(session.roleName);
    const status = isAdmin ? (body.status || 'published') : 'pending';

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

    if (status === 'published') {
      const activeStudents = await prisma.user.findMany({
        where: { isDeleted: false, status: 'active' },
        select: { id: true, email: true },
      });

      for (const student of activeStudents) {
        createAndSendNotification({
          userId: student.id,
          userEmail: student.email,
          title: `New Blog Published: ${blog.title}`,
          message: `Read the latest blog post by ${user.fullName}: "${blog.excerpt.slice(0, 100)}..."`,
          type: 'NEW_BLOG',
          link: `/blog/${blog.slug}`,
        }).catch(() => {});
      }

      broadcastEvent('blog_published', { blogId: blog.id, title: blog.title, slug: blog.slug });
    }

    return ok({ blog }, 201);
  } catch (e) {
    console.error('[POST /api/blogs]', e);
    return ERR.INTERNAL();
  }
}
