import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { ADMIN_ROLES } from '@/lib/constants/roles';
import type { SystemRoleName } from '@/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    const isAdmin = session && ADMIN_ROLES.includes(session.roleName as SystemRoleName);

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
    const isAdmin = ADMIN_ROLES.includes(session.roleName as SystemRoleName);

    // Check ownership or admin
    const existing = await prisma.blogPost.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) return ERR.NOT_FOUND('Blog post');

    const isOwner = existing.authorId === session.userId;
    if (!isAdmin && !isOwner) return ERR.FORBIDDEN();

    // Status transitions: only admins can publish/reject
    if (body.status && ['published', 'archived'].includes(body.status) && !isAdmin) {
      return ERR.FORBIDDEN();
    }

    const blog = await prisma.blogPost.update({
      where: { id },
      data: body,
    });

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
    const isAdmin = ADMIN_ROLES.includes(session.roleName as SystemRoleName);

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
