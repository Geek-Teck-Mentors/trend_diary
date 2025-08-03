import { PrismaClient as PrismaClientLocal } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// 開発環境では標準クライアント、本番環境ではエッジクライアントを使用
// 参考：https://hono.dev/examples/prisma
export default function getRdbClient(databaseUrl: string) {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    const devPrisma = new PrismaClientLocal({
      datasourceUrl: databaseUrl,
      log: ['query', 'warn', 'error'],
    })
    return devPrisma
  }

  // 実態としてPrismaClientが動作するはずだが
  // 型定義がないためanyでキャストした後で更にキャスト
  const edgePrisma = new PrismaClient({
    datasourceUrl: databaseUrl,
  }).$extends(withAccelerate()) as any

  return edgePrisma as PrismaClient
}

export type RdbClient = ReturnType<typeof getRdbClient>
