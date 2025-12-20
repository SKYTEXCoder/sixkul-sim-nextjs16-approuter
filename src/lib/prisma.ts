/**
 * Prisma Client Singleton for Next.js (Prisma 7)
 *
 * This module ensures a single PrismaClient instance is reused across
 * hot reloads in development and prevents connection exhaustion.
 *
 * Uses PrismaPg driver adapter as required by Prisma 7.
 *
 * @module lib/prisma
 */

import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

// Declare global type for Prisma client
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Create a PrismaClient instance with PrismaPg adapter.
 */
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

/**
 * Prisma Client singleton instance
 *
 * In development, we store the client on `globalThis` to prevent
 * creating new connections on every hot reload.
 *
 * In production, we create a single instance.
 */
export const prisma: PrismaClient = globalThis.prisma ?? createPrismaClient();

// Prevent multiple instances during development hot reloads
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
