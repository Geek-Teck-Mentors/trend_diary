import { PrismaClient as PrismaClientLocal } from '@prisma/client';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// 開発環境では標準クライアント、本番環境ではエッジクライアントを使用
// 参考：https://hono.dev/examples/prisma
export default function getRdbClient(databaseUrl: string) {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    const devPrisma = new PrismaClientLocal({
      datasourceUrl: databaseUrl,
    });
    return devPrisma;
  }

  // 実態としてPrismaClientが動作するはずだが
  // 型定義がないためanyでキャストした後で更にキャスト
  const edgePrisma = new PrismaClient({
    datasourceUrl: databaseUrl,
  }).$extends(withAccelerate()) as any;

  return edgePrisma as PrismaClient;
}

export type RdbClient = ReturnType<typeof getRdbClient>;

export interface TransactionClient {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

/**
 * @name トランザクション管理
 * @description Prismaのトランザクションとリポジトリパターンの相性が悪いため、生のSQLを使用. Gormのトランザクションと同じように使用可能
 * @see Prisma公式Docs: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
 */
export class Transaction implements TransactionClient {
  constructor(private client: RdbClient) {}

  async begin() {
    await this.client.$queryRaw`BEGIN;`;
  }

  async commit() {
    await this.client.$queryRaw`COMMIT;`;
  }

  async rollback() {
    await this.client.$queryRaw`ROLLBACK;`;
  }
}
