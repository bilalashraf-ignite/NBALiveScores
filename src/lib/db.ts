/**
 * Prisma Client Singleton
 *
 * Prevents connection exhaustion in serverless environments by reusing
 * the same PrismaClient instance across hot-reloads in development.
 *
 * In production, a single instance is created per container.
 * In development, the instance is cached globally to survive HMR.
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
