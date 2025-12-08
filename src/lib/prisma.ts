/**
 * Prisma Client Singleton for Next.js
 * 
 * This module ensures a single PrismaClient instance is reused across
 * hot reloads in development and prevents connection exhaustion.
 * 
 * @module lib/prisma
 */

import { PrismaClient } from '@/generated/prisma';

// Declare global type for Prisma client
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client singleton instance
 * 
 * In development, we store the client on `globalThis` to prevent
 * creating new connections on every hot reload.
 * 
 * In production, we create a single instance.
 */
export const prisma: PrismaClient =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

// Prevent multiple instances during development hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
