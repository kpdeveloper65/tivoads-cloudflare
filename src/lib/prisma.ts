import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { cache } from 'react';

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  // Force local development to use standard local SQLite file database
  const isLocalDev = process.env.NODE_ENV === 'development';

  if (!isLocalDev) {
    try {
      const { getCloudflareContext } = require('@opennextjs/cloudflare');
      const { env } = getCloudflareContext();
      if (env?.DB) {
        const adapter = new PrismaD1(env.DB);
        return new PrismaClient({ adapter });
      }
    } catch {
      // Fallback if context is unavailable
    }
  }

  return new PrismaClient();
}

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export function getDb() {
  return prisma;
}

export function getPrisma() {
  return prisma;
}

// Add cached helper to resolve import errors in brand pages
export const getCachedBrand = cache(async (slug: string) => {
  return prisma.brand.findUnique({
    where: { slug },
  });
});

export default prisma;