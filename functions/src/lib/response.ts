// Shared API Response helper (§112)
import { HttpResponseInit } from '@azure/functions';
import { ApiResponse } from '../../../types/common';

export function jsonResponse<T>(
  status: number,
  payload: ApiResponse<T>
): HttpResponseInit {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0'
    },
    jsonBody: payload
  };
}

export function successResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta'],
  status = 200
): HttpResponseInit {
  return jsonResponse(status, {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
}

export function errorResponse(
  message: string,
  code = 'BAD_REQUEST',
  status = 400,
  details?: unknown
): HttpResponseInit {
  return jsonResponse(status, {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}
