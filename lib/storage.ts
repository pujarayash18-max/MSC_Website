import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';

export type BlobContainerName = 'gallery' | 'blogs' | 'resources' | 'certificates' | 'avatars';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

function getBlobServiceClient(): BlobServiceClient | null {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr || connStr.trim() === '') {
    return null;
  }
  return BlobServiceClient.fromConnectionString(connStr);
}

/**
 * Upload a file buffer/file to Azure Blob Storage or local fallback directory.
 */
export async function uploadFile(
  containerName: BlobContainerName,
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const sanitizedFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const blobClient = getBlobServiceClient();

  if (blobClient) {
    try {
      const containerClient = blobClient.getContainerClient(containerName);
      await containerClient.createIfNotExists({ access: 'blob' });
      const blockBlobClient = containerClient.getBlockBlobClient(sanitizedFilename);

      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType },
      });

      return blockBlobClient.url;
    } catch (azureErr) {
      console.warn('[Azure Storage Warning] Azure upload failed, falling back to local storage:', azureErr);
    }
  }

  // Local dev fallback
  const targetDir = path.join(UPLOADS_DIR, containerName);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, sanitizedFilename);
  await fs.promises.writeFile(filePath, buffer);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  return `${baseUrl}/uploads/${containerName}/${sanitizedFilename}`;
}

/**
 * Delete a file from Azure Blob Storage or local fallback directory.
 */
export async function deleteFile(containerName: BlobContainerName, filename: string): Promise<boolean> {
  const blobClient = getBlobServiceClient();

  if (blobClient) {
    const containerClient = blobClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    const response = await blockBlobClient.deleteIfExists();
    return response.succeeded;
  }

  // Local dev fallback
  const filePath = path.join(UPLOADS_DIR, containerName, filename);
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
    return true;
  }

  return false;
}
