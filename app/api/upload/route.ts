import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { uploadFile, type BlobContainerName } from '@/lib/storage';
import { isAdminRole } from '@/lib/constants/roles';

export const maxDuration = 300; // 5 minutes max timeout for large file uploads (up to 1GB)

const VALID_CONTAINERS: BlobContainerName[] = ['gallery', 'blogs', 'resources', 'certificates', 'avatars'];

const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.vbs', '.msi', '.com', '.scr', '.ps1'];

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB (1024 MB) limit for large archives, datasets, videos, and resources

function getContentType(filename: string, mimeType: string): string {
  if (mimeType && mimeType !== 'application/octet-stream') return mimeType;
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'ppt': return 'application/vnd.ms-powerpoint';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls': return 'application/vnd.ms-excel';
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'zip': return 'application/zip';
    case 'rar': return 'application/x-rar-compressed';
    case '7z': return 'application/x-7z-compressed';
    case 'tar': return 'application/x-tar';
    case 'gz': return 'application/gzip';
    case 'txt': return 'text/plain';
    case 'csv': return 'text/csv';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'mp4': return 'video/mp4';
    case 'webm': return 'video/webm';
    case 'mov': return 'video/quicktime';
    case 'm4v': return 'video/x-m4v';
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'ogg': return 'audio/ogg';
    case 'm4a': return 'audio/mp4';
    case 'flac': return 'audio/flac';
    case 'aac': return 'audio/aac';
    default: return mimeType || 'application/octet-stream';
  }
}

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

    const filename = file.name || 'file';
    const ext = `.${filename.split('.').pop()?.toLowerCase() || ''}`;

    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      return err('Security error: Executable scripts or binary installers (.exe, .bat, .sh) are not allowed.', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return err('File size exceeds 1GB limit.', 400);
    }

    const contentType = getContentType(filename, file.type);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicUrl = await uploadFile(containerName, buffer, filename, contentType);

    return ok({
      url: publicUrl,
      filename: file.name,
      container: containerName,
      size: file.size,
      mimeType: contentType,
    }, 201);
  } catch (e: any) {
    console.error('[POST /api/upload]', e);
    return err(e?.message || 'File upload failed. Please try again.', 500);
  }
}
