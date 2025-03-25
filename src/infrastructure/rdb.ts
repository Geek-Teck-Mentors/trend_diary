import { PrismaClient as PrismaClientLocal } from '@prisma/client';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// 開発環境では標準クライアント、本番環境ではエッジクライアントを使用
// 参考：https://hono.dev/examples/prisma
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

export type RdbClient = ReturnType<typeof getRdbClient>;

export interface TransactionClient {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}

/**
 * @name トランザクション管理
 * @description Prismaのトランザクションとリポジトリパターンの相性が悪いため、生のSQLを使用. Gormのトランザクションと同じように使用可能
 * @see Prisma公式Docs: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
 */
export class TransactionManager {
  constructor(private client: RdbClient) {}

  private async begin() {
    await this.client.$queryRaw`BEGIN;`;
  }

  private async commit() {
    await this.client.$queryRaw`COMMIT;`;
  }

  private async rollback() {
    await this.client.$queryRaw`ROLLBACK;`;
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.begin();
    try {
      const result = await fn();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
}
