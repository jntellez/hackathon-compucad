import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { env } from '../../config/env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma__ = prisma;
}
