import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Execute DB operation with connection retry handling for serverless PostgreSQL scaling (Neon / Azure DB).
 */
export async function withDbRetry<T>(operation: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && (error?.code === 'P1001' || error?.message?.includes('terminating connection'))) {
      console.warn('[Prisma Retry] Connection reset detected. Retrying query...');
      await new Promise((r) => setTimeout(r, 500));
      return withDbRetry(operation, retries - 1);
    }
    throw error;
  }
}
