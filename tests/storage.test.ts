import { describe, it, expect, afterAll } from 'vitest';
import { uploadFile, deleteFile } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

describe('Storage Service (Local Fallback & Azure Blob)', () => {
  const testFilename = `test_unit_${Date.now()}.txt`;
  let uploadedUrl = '';

  it('should upload a buffer and return a relative or blob URL', async () => {
    const buffer = Buffer.from('Test file content for Vitest suite');
    uploadedUrl = await uploadFile('resources', buffer, testFilename, 'text/plain');

    expect(uploadedUrl).toBeTypeOf('string');
    expect(uploadedUrl).toContain('/resources/');
  });

  it('should delete the uploaded test file', async () => {
    if (uploadedUrl.startsWith('/uploads/')) {
      const filenameOnly = path.basename(uploadedUrl);
      const deleted = await deleteFile('resources', filenameOnly);
      expect(deleted).toBe(true);
    }
  });

  afterAll(() => {
    // Cleanup test file if still exists
    const testPath = path.join(process.cwd(), 'public', 'uploads', 'resources', testFilename);
    if (fs.existsSync(testPath)) {
      fs.unlinkSync(testPath);
    }
  });
});
