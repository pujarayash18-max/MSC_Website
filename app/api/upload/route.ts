import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { uploadFile, type BlobContainerName } from '@/lib/storage';
import { isAdminRole } from '@/lib/constants/roles';

const VALID_CONTAINERS: BlobContainerName[] = ['gallery', 'blogs', 'resources', 'certificates', 'avatars'];

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOC_TYPES = ['application/pdf'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const container = (formData.get('container') as string) || 'resources';

    if (!file) return err('No file provided in form data.', 400);

    if (!VALID_CONTAINERS.includes(container as BlobContainerName)) {
      return err(`Invalid container name. Must be one of: ${VALID_CONTAINERS.join(', ')}`, 400);
    }

    const containerName = container as BlobContainerName;
    const isAdmin = isAdminRole(session.roleName);

    // Enforce container RBAC
    if (containerName !== 'avatars' && containerName !== 'blogs' && !isAdmin) {
      return ERR.FORBIDDEN();
    }

    const mimeType = file.type;
    const isImage = IMAGE_TYPES.includes(mimeType);
    const isDoc = DOC_TYPES.includes(mimeType);

    if (!isImage && !isDoc) {
      return err('Invalid file format. Only JPG, PNG, WEBP images and PDF documents are allowed.', 400);
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return err('Image size exceeds 5MB limit.', 400);
    }

    if (isDoc && file.size > MAX_DOC_SIZE) {
      return err('Document size exceeds 10MB limit.', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicUrl = await uploadFile(containerName, buffer, file.name, mimeType);

    return ok({
      url: publicUrl,
      filename: file.name,
      container: containerName,
      size: file.size,
      mimeType,
    }, 201);
  } catch (e) {
    console.error('[POST /api/upload]', e);
    return ERR.INTERNAL();
  }
}
