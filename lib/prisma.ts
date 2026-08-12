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
export async function withDbRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const isConnErr =
      error?.code === 'P1001' ||
      error?.code === 'P1002' ||
      error?.code === 'P1008' ||
      error?.message?.includes("Can't reach database server") ||
      error?.message?.includes('terminating connection') ||
      error?.message?.includes('closed the connection') ||
      error?.message?.includes('ETIMEDOUT') ||
      error?.message?.includes('ECONNRESET');

    if (retries > 0 && isConnErr) {
      console.warn(`[Prisma Retry] Database connecting. Retrying query (${retries} left)...`);
      await new Promise((r) => setTimeout(r, 300));
      return withDbRetry(operation, retries - 1);
    }
    throw error;
  }
}
