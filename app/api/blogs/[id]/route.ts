import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { sendBlogApproved, sendBlogRejected } from '@/lib/email';

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

    const blog = await prisma.blogPost.update({
      where: { id },
      data: body,
      include: { author: { select: { email: true, fullName: true } } },
    });

    if (body.status && existing.status !== body.status && blog.author?.email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const blogUrl = `${baseUrl}/blog/${blog.slug || blog.id}`;

      if (body.status === 'published') {
        sendBlogApproved(blog.author.email, blog.authorName, blog.title, blogUrl).catch(() => {});
      } else if (body.status === 'rejected') {
        sendBlogRejected(blog.author.email, blog.authorName, blog.title, body.rejectionNote || '').catch(() => {});
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
