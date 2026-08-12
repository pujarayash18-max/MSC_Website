import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { sendBlogApproved, sendBlogRejected } from '@/lib/email';
import { createAndSendNotification } from '@/lib/notifications';
import { broadcastEvent } from '@/app/api/realtime/route';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    const isAdmin = session && isAdminRole(session.roleName);

    const blog = await prisma.blogPost.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isDeleted: false,
        ...(!isAdmin ? { status: 'published' } : {}),
      },
      include: {
        author: { select: { fullName: true, profilePhoto: true, roleName: true } },
      },
    });

    if (!blog) return ERR.NOT_FOUND('Blog post');
    return ok({ blog });
  } catch (e) {
    console.error('[GET /api/blogs/[id]]', e);
    return ERR.INTERNAL();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const { id } = await params;
    const body = await req.json();
    const isAdmin = isAdminRole(session.roleName);

    // Check ownership or admin
    const existing = await prisma.blogPost.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) return ERR.NOT_FOUND('Blog post');

    const isOwner = existing.authorId === session.userId;
    if (!isAdmin && !isOwner) return ERR.FORBIDDEN();

    // Status transitions: only admins can publish/reject
    if (body.status && ['published', 'archived', 'rejected'].includes(body.status) && !isAdmin) {
      return ERR.FORBIDDEN();
    }

    // Require mandatory rejection note / change request comment when rejecting
    if (body.status === 'rejected' && (!body.rejectionNote || !body.rejectionNote.trim())) {
      return err('A rejection reason or change request comment is required when rejecting a blog post.', 400);
    }

    // Extract only valid Prisma BlogPost model fields
    const { status, title, excerpt, content, banner, category, tags, readTime } = body;
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (banner !== undefined) updateData.banner = banner;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (readTime !== undefined) updateData.readTime = readTime;

    const blog = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: { author: { select: { email: true, fullName: true } } },
    });

    if (body.status && existing.status !== body.status) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const blogUrl = `${baseUrl}/blog/${blog.slug || blog.id}`;

      if (body.status === 'published') {
        if (blog.author?.email) {
          sendBlogApproved(blog.author.email, blog.authorName, blog.title, blogUrl).catch(() => {});
        }

        // Notify Author in-app
        createAndSendNotification({
          userId: blog.authorId,
          userEmail: blog.author?.email || undefined,
          title: 'Blog Post Approved 🎉',
          message: `Congratulations! Your blog post "${blog.title}" has been reviewed, approved, and published on MCC.`,
          type: 'NEW_BLOG',
          link: `/blog/${blog.slug || blog.id}`,
        }).catch(() => {});

        // Broadcast & Notify community
        const activeStudents = await prisma.user.findMany({
          where: { isDeleted: false, status: 'active', id: { not: blog.authorId } },
          select: { id: true, email: true },
        });

        for (const s of activeStudents) {
          createAndSendNotification({
            userId: s.id,
            userEmail: s.email,
            title: `New Blog: ${blog.title}`,
            message: `Read the latest blog post by ${blog.authorName}: "${blog.excerpt.slice(0, 100)}..."`,
            type: 'NEW_BLOG',
            link: `/blog/${blog.slug || blog.id}`,
          }).catch(() => {});
        }

        broadcastEvent('blog_published', { blogId: blog.id, title: blog.title, slug: blog.slug });
      } else if (body.status === 'rejected') {
        if (blog.author?.email) {
          sendBlogRejected(blog.author.email, blog.authorName, blog.title, body.rejectionNote || '').catch(() => {});
        }

        // Notify Author in-app
        createAndSendNotification({
          userId: blog.authorId,
          userEmail: blog.author?.email || undefined,
          title: 'Blog Submission Update 📝',
          message: `Your blog submission "${blog.title}" was reviewed. Reviewer feedback: ${body.rejectionNote || 'Rejection note attached.'}`,
          type: 'NEW_BLOG',
          link: '/dashboard/blogs',
        }).catch(() => {});
      }
    }

    return ok({ blog });
  } catch (e) {
    console.error('[PATCH /api/blogs/[id]]', e);
    return ERR.INTERNAL();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const { id } = await params;
    const isAdmin = isAdminRole(session.roleName);

    const existing = await prisma.blogPost.findFirst({ where: { id, isDeleted: false } });
    if (!existing) return ERR.NOT_FOUND('Blog post');
    if (!isAdmin && existing.authorId !== session.userId) return ERR.FORBIDDEN();

    await prisma.blogPost.update({ where: { id }, data: { isDeleted: true } });
    return ok({ message: 'Blog post deleted.' });
  } catch (e) {
    console.error('[DELETE /api/blogs/[id]]', e);
    return ERR.INTERNAL();
  }
}
