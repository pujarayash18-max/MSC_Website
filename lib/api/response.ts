import { NextResponse } from 'next/server';

export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data } satisfies ApiResponse<T>, { status });
}

export function err(message: string, status = 400, code?: string) {
  return NextResponse.json(
    { success: false, error: message, code } satisfies ApiResponse,
    { status }
  );
}

export const ERR = {
  UNAUTHORIZED: () => err('Authentication required. Please sign in.', 401, 'UNAUTHORIZED'),
  FORBIDDEN: () => err('You do not have permission to perform this action.', 403, 'FORBIDDEN'),
  NOT_FOUND: (resource = 'Resource') => err(`${resource} not found.`, 404, 'NOT_FOUND'),
  CONFLICT: (message: string) => err(message, 409, 'CONFLICT'),
  VALIDATION: (message: string) => err(message, 422, 'VALIDATION_ERROR'),
  INTERNAL: () => err('An unexpected error occurred. Please try again.', 500, 'INTERNAL_ERROR'),
} as const;
