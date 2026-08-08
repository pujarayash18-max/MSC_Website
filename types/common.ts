// Common Data Models and Base Interfaces (§87, §112)

export interface BaseEntity {
  id: string;
  isDeleted: boolean;
  createdAt: string; // ISO Date string
  createdBy?: string;
  updatedAt: string; // ISO Date string
  updatedBy?: string;
  status: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    timestamp: string;
  };
}

export interface BlobFileRef {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  blobUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface SelectOption {
  label: string;
  value: string;
}
