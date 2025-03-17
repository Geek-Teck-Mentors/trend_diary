import { PrismaClient as PrismaClientLocal } from '@prisma/client';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// 開発環境では標準クライアント、本番環境ではエッジクライアントを使用
export default function getRdbClient(databaseUrl: string) {
  if (process.env.NODE_ENV === 'development') {
    const devPrisma = new PrismaClientLocal({
      datasourceUrl: databaseUrl,
    });
    return devPrisma;
  }

  const prisma = new PrismaClient({
    datasourceUrl: databaseUrl,
  }).$extends(withAccelerate());

  return prisma;
}
